/*
 * effects.js — all the visual delight, built to survive a toddler mashing keys.
 *
 * Design guard-rails:
 *   • A hard cap on concurrent on-screen items (oldest is recycled) so the DOM
 *     never grows unbounded and a cheap tablet never freezes.
 *   • Every spawned node removes itself on animationend AND via a setTimeout
 *     fallback (animationend may never fire when the tab is backgrounded).
 *   • Only transform/opacity are animated (GPU compositor) => smooth at 60fps.
 *   • canvas-confetti is used when present; otherwise a pure-CSS particle burst.
 *   • Respects prefers-reduced-motion.
 */
(function (global, doc) {
  'use strict';

  var MAX_ITEMS = 24;          // hard ceiling on big emoji alive at once
  var live = [];               // FIFO of active item nodes
  var layer = null;            // #fx-layer container
  var flashEl = null;          // #flash overlay
  var lastConfetti = 0;        // throttle stamp for the (heavy) confetti

  var reduceMotion = false;
  try {
    reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* ignore */ }

  var TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/';

  function init() {
    layer = doc.getElementById('fx-layer');
    flashEl = doc.getElementById('flash');
  }

  /* Upgrade a freshly-inserted node's emoji to a crisp Twemoji SVG, if loaded. */
  function twemojify(node) {
    if (!global.twemoji || !node) return;
    try {
      global.twemoji.parse(node, { base: TWEMOJI_BASE, folder: 'svg', ext: '.svg' });
    } catch (e) { /* native glyph already showing — no-op */ }
  }

  function removeNode(node) {
    if (!node) return;
    var i = live.indexOf(node);
    if (i !== -1) live.splice(i, 1);
    if (node.parentNode) node.parentNode.removeChild(node);
  }

  /* ---- The star of the show: a giant bouncy emoji ------------------------- */
  function spawnItem(item, x, y) {
    if (!layer || !item) return;

    // Enforce the ceiling by recycling the oldest item first.
    while (live.length >= MAX_ITEMS) {
      removeNode(live[0]);
    }

    var node = doc.createElement('div');
    node.className = 'item';
    node.textContent = item.char;
    node.style.left = x + 'px';
    node.style.top = y + 'px';

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      removeNode(node);
    }
    // Remove when the final (fade-out) animation ends...
    node.addEventListener('animationend', function (ev) {
      if (ev.animationName === 'fade-out') finish();
    });
    // ...and a belt-and-braces fallback in case animationend never fires.
    global.setTimeout(finish, 3200);

    layer.appendChild(node);
    live.push(node);
    twemojify(node);
  }

  /* ---- Ripple ring expanding from the press point ------------------------- */
  function ripple(x, y) {
    if (!layer || reduceMotion) return;
    var r = doc.createElement('div');
    r.className = 'ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    layer.appendChild(r);
    animateAndRemove(r, [
      { transform: 'scale(0)', opacity: 0.65 },
      { transform: 'scale(12)', opacity: 0 }
    ], 700);
  }

  /* ---- Confetti: prefer canvas-confetti, else CSS particles --------------- */
  function confettiBurst(x, y, now) {
    var t = now || Date.now();
    if (t - lastConfetti < 110) return; // coalesce rapid mashing
    lastConfetti = t;

    if (global.confetti) {
      try {
        global.confetti({
          particleCount: reduceMotion ? 25 : 70,
          spread: 80,
          startVelocity: 38,
          gravity: 0.9,
          scalar: 1.1,
          ticks: 120,
          disableForReducedMotion: true,
          origin: {
            x: Math.min(Math.max(x / global.innerWidth, 0), 1),
            y: Math.min(Math.max(y / global.innerHeight, 0), 1)
          }
        });
        return;
      } catch (e) { /* fall through to CSS particles */ }
    }
    cssParticles(x, y);
  }

  function cssParticles(x, y) {
    if (!layer || reduceMotion) return;
    var count = 16;
    for (var i = 0; i < count; i++) {
      var p = doc.createElement('div');
      p.className = 'particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = 'hsl(' + ((Math.random() * 360) | 0) + ', 90%, 60%)';
      layer.appendChild(p);

      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      var dist = 120 + Math.random() * 160;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      animateAndRemove(p, [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0) rotate(540deg)', opacity: 0 }
      ], 800 + Math.random() * 300);
    }
  }

  /* ---- Whole-screen colour flash ----------------------------------------- */
  function flash() {
    if (!flashEl || reduceMotion) return;
    flashEl.style.background = 'hsl(' + ((Math.random() * 360) | 0) + ', 85%, 80%)';
    animateAndRemove(flashEl, [
      { opacity: 0.55 },
      { opacity: 0 }
    ], 320, true);
  }

  /*
   * Run a Web Animations keyframe set, then clean up. For transient nodes the
   * element is removed on finish; for the persistent flash overlay (keep=true)
   * only the animation is dropped. A setTimeout mirror guarantees cleanup even
   * if 'finish' never fires (backgrounded tab).
   */
  function animateAndRemove(el, frames, duration, keep) {
    var cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      if (!keep && el.parentNode) el.parentNode.removeChild(el);
    }
    try {
      var anim = el.animate(frames, { duration: duration, easing: 'ease-out', fill: keep ? 'forwards' : 'none' });
      anim.onfinish = cleanup;
      anim.oncancel = cleanup;
    } catch (e) {
      // No WAAPI support: just remove the transient node.
      cleanup();
      return;
    }
    global.setTimeout(cleanup, duration + 120);
  }

  /** Clear everything (used when leaving play mode or returning to a tab). */
  function clear() {
    live.length = 0;
    if (layer) layer.replaceChildren();
  }

  global.BKG = global.BKG || {};
  global.BKG.effects = {
    init: init,
    spawnItem: spawnItem,
    ripple: ripple,
    confettiBurst: confettiBurst,
    flash: flash,
    clear: clear
  };
})(window, document);
