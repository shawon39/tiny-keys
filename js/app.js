/*
 * app.js — glue for the Baby Keyboard Game.
 *
 * Responsibilities:
 *   • Settings (mode / sound / speech), persisted in localStorage with a safe
 *     in-memory fallback for private-mode browsers.
 *   • A shuffle-bag picker so items never immediately repeat (long-term variety).
 *   • Unified input: every key press and every screen tap triggers the same
 *     multi-sensory "celebration", at a random spot (keys) or the touch point.
 *   • Welcome → Play flow: the Play tap unlocks audio and enters fullscreen.
 *   • Toddler-proof settings via a 1.5s hold on the corner gear.
 *   • Defensive throughout: nothing a toddler does should throw or freeze it.
 */
(function (global, doc) {
  'use strict';

  var DATA = global.GAME_DATA || { animals: [], emojis: [] };
  var audio = (global.BKG && global.BKG.audio) || null;
  var fx = (global.BKG && global.BKG.effects) || null;

  /* ---- Settings store ----------------------------------------------------- */
  // Default language is Bangla (বাংলা), as requested.
  var DEFAULTS = { lang: 'bn', mode: 'animal', sound: 'on', speech: 'on' };
  var ALLOWED = {
    lang: { en: 1, bn: 1 },
    mode: { animal: 1, emoji: 1 },
    sound: { on: 1, off: 1 },
    speech: { on: 1, off: 1 }
  };
  var settings = { lang: 'bn', mode: 'animal', sound: 'on', speech: 'on' };
  var memoryStore = {}; // fallback when localStorage is unavailable

  /* ---- Localisation (English / বাংলা) ------------------------------------- */
  var I18N = {
    en: {
      title: 'Baby Keyboard Game',
      lead: 'Press <strong>any key</strong> — or tap the screen!',
      play: '▶&nbsp; Play',
      welcomeSettings: '⚙️&nbsp; Settings',
      hint: 'Tip: during play, <strong>hold</strong> the&nbsp;⚙️&nbsp;in the corner for 1.5s to change settings.',
      settingsTitle: 'Settings',
      fieldLang: 'Language',
      fieldAppears: 'What appears?',
      segAnimals: '🐾 Animals',
      segEmojis: '😀 Emojis',
      fieldSound: 'Sound effects',
      fieldSpeech: 'Say the name',
      fullscreen: '⛶&nbsp; Fullscreen',
      done: 'Done',
      on: 'On',
      off: 'Off'
    },
    bn: {
      title: 'শিশুর কীবোর্ড খেলা',
      lead: 'যেকোনো <strong>বোতাম</strong> চাপো — বা স্ক্রিনে ছোঁয়াও!',
      play: '▶&nbsp; খেলো',
      welcomeSettings: '⚙️&nbsp; সেটিংস',
      hint: 'টিপস: খেলার সময় সেটিংস বদলাতে কোণার&nbsp;⚙️&nbsp;চিহ্নে&nbsp;১.৫&nbsp;সেকেন্ড <strong>চেপে ধরো</strong>।',
      settingsTitle: 'সেটিংস',
      fieldLang: 'ভাষা',
      fieldAppears: 'কী দেখা যাবে?',
      segAnimals: '🐾 প্রাণী',
      segEmojis: '😀 ইমোজি',
      fieldSound: 'শব্দ',
      fieldSpeech: 'নাম বলানো',
      fullscreen: '⛶&nbsp; ফুলস্ক্রিন',
      done: 'ঠিক আছে',
      on: 'চালু',
      off: 'বন্ধ'
    }
  };
  function t(key) {
    var dict = I18N[settings.lang] || I18N.bn;
    return dict[key] != null ? dict[key] : key;
  }

  function loadSettings() {
    for (var key in DEFAULTS) {
      if (!DEFAULTS.hasOwnProperty(key)) continue;
      var val = DEFAULTS[key];
      try {
        var stored = global.localStorage.getItem('bkg.' + key);
        if (stored && ALLOWED[key][stored]) val = stored;
      } catch (e) {
        if (memoryStore[key] && ALLOWED[key][memoryStore[key]]) val = memoryStore[key];
      }
      settings[key] = val;
    }
  }

  function saveSetting(key, val) {
    settings[key] = val;
    memoryStore[key] = val;
    try { global.localStorage.setItem('bkg.' + key, val); } catch (e) { /* in-memory only */ }
  }

  /* ---- Shuffle-bag pickers (one per mode) --------------------------------- */
  function makeBag(pool) { return { pool: pool, bag: [], last: null }; }
  var bags = { animal: makeBag(DATA.animals), emoji: makeBag(DATA.emojis) };

  function draw(state) {
    if (!state.pool.length) return { char: '⭐', en: 'Star', bn: 'তারা' };
    if (!state.bag.length) {
      state.bag = state.pool.slice();
      for (var i = state.bag.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var t = state.bag[i]; state.bag[i] = state.bag[j]; state.bag[j] = t;
      }
      // Avoid an immediate repeat across bag refills (pop() takes the last item).
      if (state.last && state.bag.length > 1 && state.bag[state.bag.length - 1] === state.last) {
        var swap = state.bag[0];
        state.bag[0] = state.bag[state.bag.length - 1];
        state.bag[state.bag.length - 1] = swap;
      }
    }
    state.last = state.bag.pop();
    return state.last;
  }

  /* ---- Game state --------------------------------------------------------- */
  var playing = false;
  var settingsOpen = false;
  var lastX = -999, lastY = -999;

  var el = {}; // cached DOM references

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // Half the rendered emoji size, so we can keep it fully on screen.
  // Mirrors the CSS: font-size: clamp(110px, 34vmin, 420px).
  function itemRadius() {
    var vmin = Math.min(global.innerWidth, global.innerHeight);
    return Math.min(420, Math.max(110, 0.34 * vmin)) / 2;
  }

  function randomPosition() {
    var w = global.innerWidth, h = global.innerHeight;
    var r = itemRadius();
    // Safe band that guarantees the (centred) emoji never clips off an edge.
    var minX = r, maxX = w - r, minY = r, maxY = h - r;
    if (maxX < minX) { minX = maxX = w / 2; }   // item wider than the screen
    if (maxY < minY) { minY = maxY = h / 2; }
    var x, y, tries = 0;
    do {
      x = clamp(w * (0.1 + Math.random() * 0.8), minX, maxX);
      y = clamp(h * (0.12 + Math.random() * 0.7), minY, maxY);
      tries++;
    } while (tries < 6 && Math.abs(x - lastX) < w * 0.2 && Math.abs(y - lastY) < h * 0.2);
    lastX = x; lastY = y;
    return { x: x, y: y };
  }

  /** The full multi-sensory reward for one press / tap. */
  function celebrate(x, y) {
    if (!fx) return;
    var now = Date.now();
    var item = draw(bags[settings.mode] || bags.animal);
    var name = item[settings.lang] || item.en;

    fx.spawnItem(item, x, y);
    fx.ripple(x, y);
    fx.confettiBurst(x, y, now);
    fx.flash();
    if (audio) {
      audio.playTone();
      audio.speak(name, settings.lang, now);
    }
  }

  /* ---- Input: keyboard ---------------------------------------------------- */
  // Keys we never want a toddler to fire (navigation, dialogs, history, scroll).
  function onKeyDown(e) {
    if (!playing || settingsOpen) return;
    // Let the user still escape fullscreen via Esc if they really need to.
    if (e.key === 'Escape') return;
    if (e.repeat) { try { e.preventDefault(); } catch (x) {} return; } // ignore held-key flood

    try { e.preventDefault(); } catch (x) { /* some keys aren't cancelable */ }

    var p = randomPosition();
    try { celebrate(p.x, p.y); } catch (x) { /* never let one press break the loop */ }
  }

  /* ---- Input: pointer (mouse / touch / pen) ------------------------------- */
  function onPointerDown(e) {
    if (!playing || settingsOpen) return;
    try { e.preventDefault(); } catch (x) {}
    var x = (typeof e.clientX === 'number') ? e.clientX : global.innerWidth / 2;
    var y = (typeof e.clientY === 'number') ? e.clientY : global.innerHeight / 2;
    lastX = x; lastY = y;
    try { celebrate(x, y); } catch (x2) {}
  }

  /* ---- Fullscreen helpers ------------------------------------------------- */
  function requestFullscreen() {
    var elx = doc.documentElement;
    try {
      var fn = elx.requestFullscreen || elx.webkitRequestFullscreen || elx.msRequestFullscreen;
      if (fn) { var r = fn.call(elx); if (r && r.catch) r.catch(function () {}); }
    } catch (e) { /* iPhone Safari has no element fullscreen — degrade silently */ }
  }
  function isFullscreen() {
    return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
  }
  function toggleFullscreen() {
    if (isFullscreen()) {
      try {
        var fn = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if (fn) fn.call(doc);
      } catch (e) {}
    } else {
      requestFullscreen();
    }
  }

  /* ---- Welcome / play flow ------------------------------------------------ */
  function startPlay() {
    if (audio) audio.unlock(); // must run inside the user gesture
    requestFullscreen();
    el.welcome.classList.add('hidden');
    closeSettings();
    playing = true;
    doc.body.classList.add('playing');
    el.stage.setAttribute('aria-hidden', 'false');
  }

  function showWelcome() {
    playing = false;
    doc.body.classList.remove('playing');
    el.welcome.classList.remove('hidden');
    el.stage.setAttribute('aria-hidden', 'true');
  }

  /* ---- Settings panel ----------------------------------------------------- */
  var lastFocus = null;
  function openSettings() {
    settingsOpen = true;
    try { lastFocus = doc.activeElement; } catch (e) { lastFocus = null; }
    el.settings.classList.remove('hidden');
    syncSettingsUI();
    // Move focus into the dialog for keyboard / screen-reader users.
    var target = el.settings.querySelector('.seg[aria-checked="true"]') ||
                 el.settings.querySelector('.seg');
    if (target) { try { target.focus(); } catch (e) {} }
  }
  function closeSettings() {
    settingsOpen = false;
    el.settings.classList.add('hidden');
    // Restore focus to whatever opened the dialog.
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function syncSettingsUI() {
    // Every segmented control (radiogroup) — aria-checked + roving tabindex,
    // driven generically by each group's data-setting / each option's data-value.
    var groups = el.settings.querySelectorAll('.segmented');
    for (var g = 0; g < groups.length; g++) {
      var setting = groups[g].getAttribute('data-setting');
      var segs = groups[g].querySelectorAll('.seg');
      for (var i = 0; i < segs.length; i++) {
        var on = segs[i].getAttribute('data-value') === settings[setting];
        segs[i].setAttribute('aria-checked', on ? 'true' : 'false');
        segs[i].setAttribute('tabindex', on ? '0' : '-1');
      }
    }
    // Toggles
    setToggle(el.toggleSound, settings.sound === 'on');
    setToggle(el.toggleSpeech, settings.speech === 'on');
  }

  // Apply a setting change from a segmented control, with side effects.
  function changeSetting(setting, value) {
    if (!setting || !ALLOWED[setting] || !ALLOWED[setting][value]) return;
    saveSetting(setting, value);
    if (setting === 'lang') applyLanguage(value);
    syncSettingsUI();
  }

  // Swap every translatable label to the chosen language.
  function applyLanguage(lang) {
    var dict = I18N[lang] || I18N.bn;
    var nodes = doc.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (dict[key] != null) nodes[i].innerHTML = dict[key];
    }
    try { doc.documentElement.setAttribute('lang', lang === 'bn' ? 'bn' : 'en'); } catch (e) {}
    // Localise the radiogroup aria-labels (not visible text, so not data-i18n).
    var langGroup = el.settings.querySelector('.segmented[data-setting="lang"]');
    var modeGroup = el.settings.querySelector('.segmented[data-setting="mode"]');
    if (langGroup && dict.fieldLang) langGroup.setAttribute('aria-label', dict.fieldLang);
    if (modeGroup && dict.fieldAppears) modeGroup.setAttribute('aria-label', dict.fieldAppears);
    // On/Off labels live in JS, so refresh them too.
    setToggle(el.toggleSound, settings.sound === 'on');
    setToggle(el.toggleSpeech, settings.speech === 'on');
  }

  // Arrow-key navigation within a segmented radiogroup (WAI-ARIA radio pattern).
  function onSegKeyDown(e) {
    var k = e.key;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'ArrowUp' && k !== 'ArrowDown') return;
    e.preventDefault();
    var group = e.currentTarget;
    var setting = group.getAttribute('data-setting');
    var segs = group.querySelectorAll('.seg');
    var current = 0;
    for (var i = 0; i < segs.length; i++) {
      if (segs[i].getAttribute('data-value') === settings[setting]) { current = i; break; }
    }
    var dir = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 : -1;
    var next = (current + dir + segs.length) % segs.length;
    changeSetting(setting, segs[next].getAttribute('data-value'));
    try { segs[next].focus(); } catch (x) {}
  }

  function setToggle(btn, on) {
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    var txt = btn.querySelector('.toggle__text');
    if (txt) txt.textContent = t(on ? 'on' : 'off');
  }

  /* ---- Toddler-proof hold-to-open gear ------------------------------------ */
  var holdTimer = null, holdStart = null, holdPointerId = null;
  function startHold(e) {
    try { e.preventDefault(); e.stopPropagation(); } catch (x) {}
    holdStart = { x: e.clientX || 0, y: e.clientY || 0 };
    holdPointerId = (typeof e.pointerId === 'number') ? e.pointerId : null;
    // Capture the pointer so a held finger/cursor drifting off this tiny 56px
    // button doesn't fire pointerleave and prematurely cancel the hold.
    if (holdPointerId !== null) {
      try { el.gear.setPointerCapture(holdPointerId); } catch (x) {}
    }
    el.gear.classList.add('holding');
    if (holdTimer) global.clearTimeout(holdTimer);
    holdTimer = global.setTimeout(function () {
      cancelHold();
      openSettings();
    }, 1500);
  }
  function cancelHold() {
    if (holdTimer) { global.clearTimeout(holdTimer); holdTimer = null; }
    if (holdPointerId !== null) {
      try { el.gear.releasePointerCapture(holdPointerId); } catch (x) {}
      holdPointerId = null;
    }
    holdStart = null;
    el.gear.classList.remove('holding');
  }
  function holdMove(e) {
    if (!holdStart) return;
    var dx = (e.clientX || 0) - holdStart.x;
    var dy = (e.clientY || 0) - holdStart.y;
    if (dx * dx + dy * dy > 32 * 32) cancelHold(); // a deliberate drag, not a hold
  }

  /* ---- Lockdown: kill zoom / context menu / selection --------------------- */
  function preventDefault(e) { try { e.preventDefault(); } catch (x) {} }

  /* ---- Visibility: pause + tidy up ---------------------------------------- */
  function onVisibility() {
    if (doc.hidden) {
      if (audio) audio.suspend();
    } else if (playing) {
      if (audio) audio.unlock(); // resume the suspended AudioContext
      if (fx) fx.clear();        // purge anything orphaned while backgrounded
    }
  }

  /* ---- Wire everything up ------------------------------------------------- */
  function init() {
    if (fx) fx.init();
    loadSettings();
    if (audio) { audio.setSound(settings.sound === 'on'); audio.setSpeech(settings.speech === 'on'); }

    el.stage = doc.getElementById('stage');
    el.welcome = doc.getElementById('welcome');
    el.settings = doc.getElementById('settings');
    el.gear = doc.getElementById('gear');
    el.toggleSound = doc.getElementById('toggle-sound');
    el.toggleSpeech = doc.getElementById('toggle-speech');

    // Input
    global.addEventListener('keydown', onKeyDown, true);
    el.stage.addEventListener('pointerdown', onPointerDown, { passive: false });

    // Welcome buttons
    doc.getElementById('play').addEventListener('click', startPlay);
    doc.getElementById('welcome-settings').addEventListener('click', openSettings);

    // Settings: segmented controls — language + mode (click + arrow-key nav)
    el.settings.addEventListener('click', function (e) {
      var seg = e.target.closest ? e.target.closest('.seg') : null;
      if (!seg) return;
      var group = seg.parentNode;
      changeSetting(group.getAttribute('data-setting'), seg.getAttribute('data-value'));
    });
    var groups = el.settings.querySelectorAll('.segmented');
    for (var gi = 0; gi < groups.length; gi++) {
      groups[gi].addEventListener('keydown', onSegKeyDown);
    }
    // Settings: toggles
    el.toggleSound.addEventListener('click', function () {
      var on = settings.sound !== 'on';
      saveSetting('sound', on ? 'on' : 'off');
      if (audio) { audio.setSound(on); if (on) { audio.unlock(); audio.playTone(); } }
      setToggle(el.toggleSound, on);
    });
    el.toggleSpeech.addEventListener('click', function () {
      var on = settings.speech !== 'on';
      saveSetting('speech', on ? 'on' : 'off');
      if (audio) audio.setSpeech(on);
      setToggle(el.toggleSpeech, on);
    });
    // Settings: actions
    doc.getElementById('settings-fullscreen').addEventListener('click', toggleFullscreen);
    doc.getElementById('settings-done').addEventListener('click', closeSettings);
    // Tapping the dim backdrop closes settings (but not taps on the card).
    el.settings.addEventListener('pointerdown', function (e) {
      if (e.target === el.settings) closeSettings();
    });

    // Hold-to-open gear. With pointer capture the gesture survives drifting off
    // the small button, so we cancel only on release / system cancel / a real drag.
    el.gear.addEventListener('pointerdown', startHold);
    el.gear.addEventListener('pointerup', cancelHold);
    el.gear.addEventListener('pointercancel', cancelHold);
    el.gear.addEventListener('pointermove', holdMove);

    // Lockdown
    doc.addEventListener('contextmenu', preventDefault);
    doc.addEventListener('gesturestart', preventDefault); // iOS pinch-zoom
    doc.addEventListener('dragstart', preventDefault);
    doc.addEventListener('selectstart', function (e) {
      // allow selection only inside the (parent-facing) overlays
      if (!e.target.closest || !e.target.closest('.card')) preventDefault(e);
    });

    // Visibility
    doc.addEventListener('visibilitychange', onVisibility);

    // Last-resort: never let an unexpected error surface to the child.
    global.addEventListener('error', function () { /* swallow */ });

    applyLanguage(settings.lang); // render UI in the saved/default language (Bangla)
    syncSettingsUI();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
