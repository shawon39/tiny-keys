/*
 * audio.js — gentle sound for the Baby Keyboard Game.
 *
 *   • A short, warm "boop" generated with the Web Audio API on every press
 *     (zero files to download, instant, and pleasant when mashed because the
 *     notes come from a C-major pentatonic scale — random presses still sound
 *     musical).
 *   • An optional cheerful voice that names the item via the Web Speech API.
 *
 * Browsers block audio until a user gesture, so unlock() must be called from a
 * real tap/click (the "Play" button). Everything is feature-detected and wrapped
 * so a missing/!supported API can never throw and freeze the game.
 */
(function (global) {
  'use strict';

  var ctx = null;            // shared AudioContext (created lazily on unlock)
  var masterGain = null;     // master volume node, also caps simultaneous loudness
  var soundOn = true;
  var speechOn = true;
  var unlocked = false;      // ran the one-time in-gesture play that iOS requires
  var voicesList = [];       // all available speech-synthesis voices
  var lastSpeak = 0;         // throttle stamp for speech during rapid mashing

  // C-major pentatonic across two octaves — any combination sounds happy.
  var NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  var AudioCtx = global.AudioContext || global.webkitAudioContext || null;

  /* ---- Speech voice selection --------------------------------------------- */
  function refreshVoices() {
    if (!('speechSynthesis' in global)) return;
    try { voicesList = global.speechSynthesis.getVoices() || []; }
    catch (e) { voicesList = []; }
  }

  // Best available voice for a language ('bn' | 'en'): prefer a local (offline)
  // voice whose code starts with the wanted prefix, then any matching voice.
  function voiceFor(lang) {
    var want = (lang === 'bn') ? 'bn' : 'en';
    function match(v) {
      return v.lang && v.lang.toLowerCase().replace('_', '-').indexOf(want) === 0;
    }
    return voicesList.filter(function (v) { return match(v) && v.localService; })[0] ||
           voicesList.filter(match)[0] || null;
  }

  if ('speechSynthesis' in global) {
    refreshVoices();
    // getVoices() is populated asynchronously in some browsers.
    try { global.speechSynthesis.onvoiceschanged = refreshVoices; } catch (e) { /* ignore */ }
  }

  /* ---- Public API ---------------------------------------------------------- */
  var Audio = {
    /**
     * Create/resume the AudioContext from within a user gesture. Must be called
     * from a real tap/click. On iOS, resume() alone is NOT enough — the engine
     * only fully wakes if a sound is actually played inside the gesture, so we
     * also play a one-sample silent buffer the first time.
     */
    unlock: function () {
      try {
        if (!ctx && AudioCtx) {
          ctx = new AudioCtx();
          masterGain = ctx.createGain();
          masterGain.gain.value = 0.5; // keep things soft on little ears
          masterGain.connect(ctx.destination);
        }
        if (!ctx) return;
        if (ctx.state !== 'running' && ctx.resume) {
          var r = ctx.resume();
          if (r && r.catch) r.catch(function () {});
        }
        if (!unlocked) {
          try {
            var buf = ctx.createBuffer(1, 1, 22050);
            var src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            if (src.start) src.start(0); else if (src.noteOn) src.noteOn(0);
          } catch (e) { /* ignore */ }
          unlocked = true;
        }
      } catch (e) { /* ignore — game still works silently */ }
    },

    /** True once audio has been unlocked by a user gesture. */
    isReady: function () { return !!ctx && ctx.state === 'running'; },

    /** Pause audio when the tab is backgrounded. */
    suspend: function () {
      try { if (ctx && ctx.state === 'running') ctx.suspend(); } catch (e) { /* ignore */ }
    },

    setSound: function (on) { soundOn = !!on; },
    setSpeech: function (on) {
      speechOn = !!on;
      if (!on && 'speechSynthesis' in global) {
        try { global.speechSynthesis.cancel(); } catch (e) {}
      }
    },

    /** A short, soft musical tone. Safe to call on every single press. */
    playTone: function () {
      if (!soundOn || !ctx) return;
      // A backgrounded tab or the OS can silently re-suspend the context; on
      // mobile especially, nudge it awake before every tone.
      if (ctx.state !== 'running' && ctx.resume) { try { ctx.resume(); } catch (e) {} }
      try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = NOTES[(Math.random() * NOTES.length) | 0];

        // Smooth attack + exponential release => no clicks, no harshness.
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.5, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.42);
        // Free nodes once the tone has finished.
        osc.onended = function () {
          try { gain.disconnect(); osc.disconnect(); } catch (e) {}
        };
      } catch (e) { /* ignore */ }
    },

    /** Is a voice available for this language ('bn' | 'en') on this device? */
    hasVoice: function (lang) {
      if (!voicesList.length) refreshVoices();
      return !!voiceFor(lang);
    },

    /**
     * Speak a name cheerfully in the given language ('bn' | 'en'). Throttled so a
     * mashing toddler doesn't queue a minute-long monologue; cancel() first so the
     * latest word wins. If no Bangla voice exists we stay silent rather than letting
     * an English engine mangle the Bengali text.
     */
    speak: function (name, lang, now) {
      if (!speechOn || !name || !('speechSynthesis' in global)) return;
      var t = now || Date.now();
      if (t - lastSpeak < 320) return; // at most ~3 words/sec
      if (!voicesList.length) refreshVoices();
      var v = voiceFor(lang);
      // Only skip Bangla when the voice list is loaded AND truly has no Bangla
      // voice. On mobile getVoices() is briefly empty, so skipping on a null voice
      // alone would wrongly silence Bangla even when a voice exists / loads late.
      if (lang === 'bn' && !v && voicesList.length > 0) return;
      try {
        var ss = global.speechSynthesis;
        // Cancel only when something is actually queued. Calling cancel() before
        // every speak() triggers an iOS Safari bug that drops the utterance.
        if (ss.speaking || ss.pending) { try { ss.cancel(); } catch (e) {} }
        var u = new SpeechSynthesisUtterance(name);
        u.rate = 0.9;
        u.pitch = 1.3; // higher pitch reads as friendly/child-like
        u.volume = 1;
        u.lang = (lang === 'bn') ? 'bn-IN' : 'en-US';
        if (v) u.voice = v;
        ss.speak(u);
        lastSpeak = t; // only a successfully-queued utterance consumes a slot
      } catch (e) { /* ignore */ }
    }
  };

  global.BKG = global.BKG || {};
  global.BKG.audio = Audio;
})(window);
