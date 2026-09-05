/* ============ audio.js · 程序化音效/BGM（WebAudio 合成，无外部文件） ============ */
'use strict';

var AudioSys = (function () {
  var ctx = null, master = null, sfxGain = null, bgmGain = null;
  var enabled = true, currentBgm = null, rainNode = null, bgmTimer = null;

  function ensure() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = .9; sfxGain.connect(master);
      bgmGain = ctx.createGain(); bgmGain.gain.value = .16; bgmGain.connect(master);
      return true;
    } catch (e) { return false; }
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function on() { return enabled && ensure(); }

  function noiseBuf(sec) {
    var n = ctx.sampleRate * sec, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function env(g, t0, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec);
  }
  function osc(type, f, t0, dur, peak, dest, detune) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (detune) o.detune.value = detune;
    env(g, t0, .01, peak, dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t0); o.stop(t0 + dur + .1);
    return o;
  }

  var SFX = {
    thunder: function () {
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = noiseBuf(2.2);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(120, t + 1.8);
      var g = ctx.createGain(); env(g, t, .02, .8, 2.0);
      src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
      osc('sine', 52, t, 1.6, .5);
    },
    slam: function () {
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = noiseBuf(.3);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
      var g = ctx.createGain(); env(g, t, .005, .9, .28);
      src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
      osc('sine', 70, t, .25, .7);
    },
    chime: function () {
      var t = ctx.currentTime;
      [523, 659, 784, 1047].forEach(function (f, i) { osc('triangle', f, t + i * .09, .5, .22); });
    },
    clue: function () {
      var t = ctx.currentTime;
      osc('triangle', 880, t, .18, .25); osc('triangle', 1175, t + .1, .3, .22);
    },
    heartbeat: function () {
      var t = ctx.currentTime;
      osc('sine', 55, t, .16, .8); osc('sine', 48, t + .22, .2, .95);
    },
    whoosh: function () {
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = noiseBuf(.5);
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + .4); f.Q.value = 2;
      var g = ctx.createGain(); env(g, t, .05, .4, .4);
      src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
    },
    crash: function () {
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = noiseBuf(.8);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
      var g = ctx.createGain(); env(g, t, .008, .85, .7);
      src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
      osc('sine', 60, t, .5, .5);
    },
    scream: function () {
      var t = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(880, t + .25); o.frequency.exponentialRampToValueAtTime(400, t + .8);
      env(g, t, .03, .3, .85);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 1);
    },
    bell: function () {
      var t = ctx.currentTime;
      [130.8, 130.8 * 2.02, 130.8 * 2.72, 130.8 * 3.98].forEach(function (f, i) {
        osc('sine', f, t, 3.2 - i * .5, .5 / (i + 1));
      });
    },
    splash: function () {
      var t = ctx.currentTime;
      var src = ctx.createBufferSource(); src.buffer = noiseBuf(.6);
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(1200, t); f.frequency.exponentialRampToValueAtTime(300, t + .5);
      var g = ctx.createGain(); env(g, t, .01, .5, .5);
      src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
    },
    trap: function () {
      var t = ctx.currentTime;
      [880, 660, 880, 660].forEach(function (f, i) { osc('square', f, t + i * .13, .1, .16); });
    },
    sparkle: function () {
      var t = ctx.currentTime;
      [1568, 2093, 2637].forEach(function (f, i) { osc('sine', f, t + i * .07, .3, .12); });
    }
  };

  function rainStart() {
    if (!on() || rainNode) return;
    var src = ctx.createBufferSource(); src.buffer = noiseBuf(3); src.loop = true;
    var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    var g = ctx.createGain(); g.gain.value = .045;
    src.connect(f); f.connect(g); g.connect(master); src.start();
    rainNode = { src: src, g: g };
  }
  function rainStop() {
    if (!rainNode) return;
    try { rainNode.g.gain.linearRampToValueAtTime(0, ctx.currentTime + .8); var rn = rainNode; setTimeout(function () { try { rn.src.stop(); } catch (e) {} }, 900); } catch (e) {}
    rainNode = null;
  }

  /* BGM: 简易和声垫 + 脉冲 */
  var MOODS = {
    calm:    { notes: [130.8, 164.8, 196.0], type: 'sine',   pulse: 0,   filt: 900 },
    tense:   { notes: [110, 116.5, 220],     type: 'sawtooth', pulse: 1.6, filt: 500 },
    mystery: { notes: [146.8, 174.6, 220],   type: 'triangle', pulse: 0,   filt: 700 },
    sad:     { notes: [98, 116.5, 146.8],    type: 'sine',   pulse: 0,   filt: 600 },
    epic:    { notes: [65.4, 98, 130.8],     type: 'sawtooth', pulse: 2.2, filt: 800 },
    warm:    { notes: [130.8, 196, 246.9],   type: 'sine',   pulse: 0,   filt: 1100 }
  };
  function stopBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    currentBgm = null;
    if (bgmGain) bgmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  }
  function bgm(mood) {
    if (mood === currentBgm) return;
    if (!on()) { currentBgm = mood; return; }
    stopBgm();
    currentBgm = mood;
    if (!mood || !MOODS[mood]) return;
    var m = MOODS[mood];
    bgmGain.gain.cancelScheduledValues(ctx.currentTime);
    bgmGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    bgmGain.gain.linearRampToValueAtTime(.16, ctx.currentTime + 1.5);
    var oscs = [];
    m.notes.forEach(function (f, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = m.type; o.frequency.value = f; o.detune.value = (i - 1) * 4;
      g.gain.value = .3;
      var flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = m.filt;
      o.connect(g); g.connect(flt); flt.connect(bgmGain); o.start();
      oscs.push(o);
      // 缓慢呼吸
      setIntervalAlive(g, i);
    });
    function setIntervalAlive(g, i) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = .07 + i * .03; lg.gain.value = .12;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      oscs.push(lfo);
    }
    if (m.pulse) {
      bgmTimer = setInterval(function () {
        if (!ctx || ctx.state !== 'running') return;
        osc('sine', 55, ctx.currentTime, .3, .5, bgmGain);
      }, m.pulse * 1000);
    }
  }

  return {
    play: function (name) { if (!on()) return; resume(); if (SFX[name]) SFX[name](); },
    bgm: function (mood) { if (!enabled) return; if (!ensure()) return; resume(); bgm(mood); },
    stopBgm: function () { if (ctx) stopBgm(); },
    rain: function (onOff) { if (onOff) { if (on()) { resume(); rainStart(); } } else rainStop(); },
    setEnabled: function (v) {
      enabled = v;
      if (!v) { rainStop(); if (ctx) stopBgm(); }
    },
    isEnabled: function () { return enabled; },
    unlock: function () { if (ensure()) resume(); }
  };
})();
