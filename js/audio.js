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
    /** Create/resume the AudioContext from within a user gesture. */
    unlock: function () {
      try {
        if (!ctx && AudioCtx) {
          ctx = new AudioCtx();
          masterGain = ctx.createGain();
          masterGain.gain.value = 0.5; // keep things soft on little ears
          masterGain.connect(ctx.destination);
        }
        if (ctx && ctx.state === 'suspended') ctx.resume();
      } catch (e) { /* ignore — game still works silently */ }
    },

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
      if (lang === 'bn' && !v) return; // no Bangla voice on this device — skip
      try {
        var ss = global.speechSynthesis;
        ss.cancel();
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
