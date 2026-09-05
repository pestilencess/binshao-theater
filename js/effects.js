/* ============ effects.js · Canvas 电影特效引擎（过场"特效视频"） ============ */
'use strict';

/* 动态补充样式（滤镜类） */
(function () {
  var s = document.createElement('style');
  s.textContent =
    '#app.memory-fx #bgLayer,#app.memory-fx #stage{filter:sepia(.75) contrast(.92) brightness(.88) saturate(.8);}' +
    '#app.glitch-fx #bgLayer{animation:glitchHue .12s infinite;}@keyframes glitchHue{0%,100%{filter:none}50%{filter:hue-rotate(40deg) saturate(2) contrast(1.3)}}' +
    '#app.cold-fx #bgLayer,#app.cold-fx #stage{filter:saturate(.75) brightness(.92) hue-rotate(200deg) ;}';
  document.head.appendChild(s);
})();

var FX = (function () {
  var fxCanvas, fxCtx, rainCanvas, rainCtx, appEl;
  var acts = [];          // 活动的一次性特效
  var rafId = null, lastT = 0;
  var rainOn = false, rainDrops = [], rainRaf = null;
  var fxEnabled = true;

  function init(fxId, rainId, app) {
    fxCanvas = document.getElementById(fxId); rainCanvas = document.getElementById(rainId); appEl = document.getElementById(app);
    fxCtx = fxCanvas.getContext('2d'); rainCtx = rainCanvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize() {
    if (!fxCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    [ [fxCanvas, fxCtx], [rainCanvas, rainCtx] ].forEach(function (p) {
      var w = window.innerWidth, h = window.innerHeight;
      p[0].width = w * dpr; p[0].height = h * dpr;
      p[1].setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  }

  /* ---------- 一次性特效注册表 ---------- */
  var DEFS = {
    flashwhite: { dur: 380, tick: function (c, W, H, p) {
      c.fillStyle = 'rgba(255,255,255,' + (p < .3 ? (1 - p / .3) * .95 : 0) + ')'; c.fillRect(0, 0, W, H);
    } },
    thunder: { dur: 1500, shake: 2, sound: 'thunder', onStart: flashCls, tick: function (c, W, H, p) {
      var a = 0;
      if (p < .1) a = 1 - p / .1; else if (p > .18 && p < .34) a = .85 * (1 - (p - .18) / .16);
      if (a > 0) { c.fillStyle = 'rgba(230,240,255,' + a + ')'; c.fillRect(0, 0, W, H); }
      if (p > .04 && p < .2) {
        c.strokeStyle = 'rgba(255,255,255,' + (.9 * (1 - (p - .04) / .16)) + ')';
        c.lineWidth = 3; c.shadowColor = '#cfe0ff'; c.shadowBlur = 18;
        var x = W * .3 + Math.sin(p * 40) * 30, y = 0;
        c.beginPath(); c.moveTo(x, y);
        while (y < H * .62) { x += (Math.random() - .5) * 70; y += 24 + Math.random() * 26; c.lineTo(x, y); }
        c.stroke(); c.shadowBlur = 0;
      }
    } },
    far_thunder: { dur: 1000, sound: 'thunder', tick: function (c, W, H, p) {
      var a = p < .5 ? .35 * (1 - p / .5) : 0;
      c.fillStyle = 'rgba(180,200,255,' + a + ')'; c.fillRect(0, 0, W, H);
    } },
    blackout: { dur: 1600, sound: 'slam', tick: function (c, W, H, p) {
      var a = p < .35 ? p / .35 : (p > .8 ? (1 - p) / .2 : 1);
      c.fillStyle = 'rgba(0,0,0,' + a * .95 + ')'; c.fillRect(0, 0, W, H);
    } },
    glitch: { dur: 900, onStart: function () { appEl.classList.add('glitch-fx'); }, onEnd: function () { appEl.classList.remove('glitch-fx'); },
      tick: function (c, W, H, p) {
        for (var i = 0; i < 14; i++) {
          var y = Math.random() * H, h = 4 + Math.random() * 26, w = 40 + Math.random() * (W * .7);
          c.fillStyle = ['rgba(255,60,60,.35)', 'rgba(60,255,120,.3)', 'rgba(80,120,255,.4)', 'rgba(255,255,255,.25)'][i % 4];
          c.fillRect(Math.random() * (W - w), y, w, h);
        }
        if (Math.random() < .5) { c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, Math.random() * H, W, 2 + Math.random() * 8); }
      } },
    blood: { dur: 2000, sound: 'heartbeat', tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI) * .55;
      var g = c.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, H * .75);
      g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, 'rgba(130,0,10,' + a + ')');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 6; i++) {
        var x = (i * 97 + 31) % W, len = p * H * (.3 + (i % 3) * .15);
        c.strokeStyle = 'rgba(150,10,16,' + (a * .8) + ')'; c.lineWidth = 3 + (i % 3);
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (i % 2 ? 6 : -4), len); c.stroke();
        c.fillStyle = 'rgba(150,10,16,' + a + ')'; c.beginPath(); c.arc(x + (i % 2 ? 6 : -4), len, 4 + (i % 3), 0, 7); c.fill();
      }
    } },
    scream: { dur: 1300, shake: 1, sound: 'scream', tick: function (c, W, H, p) {
      c.save(); c.translate(W / 2, H / 2);
      for (var i = 0; i < 3; i++) {
        var r = ((p * 1.4 - i * .18) % 1) * Math.max(W, H) * .7;
        if (r > 0) { c.strokeStyle = 'rgba(255,235,235,' + (.5 * (1 - r / (Math.max(W, H) * .7))) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); }
      }
      c.restore();
      var a = Math.sin(p * Math.PI) * .25; c.fillStyle = 'rgba(255,240,240,' + a + ')'; c.fillRect(0, 0, W, H);
    } },
    heartbeat: { dur: 2600, sound: 'heartbeat', tick: function (c, W, H, p) {
      var beat = (p * 3) % 1, a = Math.pow(1 - beat, 2) * .5;
      var g = c.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .72);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,0,0,' + a + ')');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    } },
    poison: { dur: 2200, tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI) * .3;
      c.fillStyle = 'rgba(90,20,120,' + a + ')'; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 22; i++) {
        var sp = .5 + (i % 5) * .18, y = H - ((p * sp + i * .09) % 1.15) * H, x = (i * 137 + Math.sin(p * 6 + i) * 30) % W;
        c.strokeStyle = 'rgba(190,110,255,' + (.7 * Math.sin(p * Math.PI)) + ')'; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, 4 + (i % 4) * 3, 0, 7); c.stroke();
      }
    } },
    sparkle: { dur: 1300, sound: 'sparkle', tick: function (c, W, H, p) {
      c.save(); c.translate(W / 2, H * .42);
      for (var i = 0; i < 16; i++) {
        var ang = i / 16 * Math.PI * 2 + p, d = p * 190 + (i % 4) * 26, s = Math.max(0, 1 - p) * (4 + (i % 3) * 2);
        c.fillStyle = i % 2 ? 'rgba(255,230,140,.9)' : 'rgba(255,255,255,.9)';
        star(c, Math.cos(ang) * d, Math.sin(ang) * d * .8, s);
      }
      c.restore();
    } },
    fire: { dur: 2400, tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI);
      var g = c.createLinearGradient(0, H, 0, H * .4);
      g.addColorStop(0, 'rgba(255,120,30,' + a * .35 + ')'); g.addColorStop(1, 'rgba(255,120,30,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 30; i++) {
        var y = H - ((p * (.7 + (i % 5) * .12) + i * .05) % 1.1) * H;
        var x = (i * 89 + Math.sin(p * 5 + i * 2) * 40) % W;
        c.fillStyle = 'rgba(255,' + (120 + (i % 5) * 22) + ',40,' + a * .85 + ')';
        c.beginPath(); c.arc(x, y, 1.6 + (i % 3), 0, 7); c.fill();
      }
    } },
    collapse: { dur: 2800, shake: 3, sound: 'crash', tick: function (c, W, H, p) {
      var a = p < .12 ? p / .12 : Math.max(0, .9 * (1 - (p - .12) / .88));
      c.fillStyle = 'rgba(255,140,50,' + a * .3 + ')'; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 34; i++) {
        var y = ((p * (1 + (i % 4) * .35) + (i * .07) % 1) % 1.1) * H;
        var x = (i * 151 + Math.sin(p * 3 + i) * 26) % W, s = 3 + (i % 5) * 3;
        c.fillStyle = 'rgba(' + (120 + i % 40) + ',' + (100 + i % 30) + ',80,' + a + ')';
        c.save(); c.translate(x, y); c.rotate(p * 8 + i); c.fillRect(-s / 2, -s / 2, s, s * .7); c.restore();
      }
      for (var j = 0; j < 8; j++) {
        var dy = H - ((p + j * .13) % 1) * H * .5;
        c.fillStyle = 'rgba(180,170,150,' + a * .25 + ')';
        c.beginPath(); c.arc((j * 173) % W, dy, 30 + (j % 4) * 16, 0, 7); c.fill();
      }
    } },
    water: { dur: 1900, sound: 'splash', tick: function (c, W, H, p) {
      var rise = Math.min(1, p * 1.6), yBase = H * (1 - rise * .5);
      var grd = c.createLinearGradient(0, yBase, 0, H);
      grd.addColorStop(0, 'rgba(60,160,255,' + .5 * Math.sin(Math.min(1, p * 1.2) * Math.PI) + ')');
      grd.addColorStop(1, 'rgba(20,60,160,' + .6 * Math.sin(Math.min(1, p * 1.2) * Math.PI) + ')');
      c.fillStyle = grd;
      c.beginPath(); c.moveTo(0, H);
      for (var x = 0; x <= W; x += 16) c.lineTo(x, yBase + Math.sin(x * .02 + p * 9) * 12);
      c.lineTo(W, H); c.closePath(); c.fill();
      for (var i = 0; i < 16; i++) {
        var dx = (i * 113 + p * 60) % W, dy = yBase - ((p * 2 + i * .3) % 1) * 80;
        c.fillStyle = 'rgba(150,210,255,' + .7 * Math.sin(p * Math.PI) + ')';
        c.beginPath(); c.arc(dx, dy, 2 + i % 3, 0, 7); c.fill();
      }
    } },
    memory: { dur: 2400, sound: 'whoosh', onStart: function () { appEl.classList.add('memory-fx'); }, onEnd: function () { appEl.classList.remove('memory-fx'); },
      tick: function (c, W, H, p) {
        var a = Math.sin(p * Math.PI) * .3;
        c.fillStyle = 'rgba(255,220,150,' + a * .4 + ')'; c.fillRect(0, 0, W, H);
        for (var i = 0; i < 60; i++) {
          c.fillStyle = 'rgba(255,255,255,' + (Math.random() * .12 * a) + ')';
          c.fillRect(Math.random() * W, Math.random() * H, 2, 2);
        }
        c.strokeStyle = 'rgba(0,0,0,' + a * .5 + ')'; c.lineWidth = 1;
        var ly = (p % .3) / .3 * H;
        c.beginPath(); c.moveTo(0, ly); c.lineTo(W, ly); c.stroke();
      } },
    wind: { dur: 1600, sound: 'whoosh', tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI);
      for (var i = 0; i < 12; i++) {
        var y = (i * 53 + 40) % H, x = ((p + i * .12) % 1.3 - .15) * W * 1.3;
        c.strokeStyle = 'rgba(220,235,255,' + a * .35 + ')'; c.lineWidth = 1.5 + i % 2;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 60, y - 10, x + 130, y - 6); c.stroke();
      }
      for (var j = 0; j < 8; j++) {
        var ly = (j * 67 + p * 40) % H, lx = ((p * 1.4 + j * .18) % 1.2 - .1) * W;
        c.fillStyle = 'rgba(180,150,90,' + a * .7 + ')';
        c.save(); c.translate(lx, ly); c.rotate(p * 9 + j); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore();
      }
    } },
    spotlight: { dur: 2800, tick: function (c, W, H, p) {
      var a = p < .2 ? p / .2 : (p > .8 ? (1 - p) / .2 : 1);
      var g = c.createRadialGradient(W / 2, H * .42, 30, W / 2, H * .42, H * .5);
      g.addColorStop(0, 'rgba(255,246,220,' + a * .18 + ')');
      g.addColorStop(.45, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,5,' + a * .88 + ')');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    } },
    gold: { dur: 3200, sound: 'chime', tick: function (c, W, H, p) {
      var a = Math.sin(Math.min(1, p * 1.3) * Math.PI);
      var g = c.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H * .8);
      g.addColorStop(0, 'rgba(255,215,106,' + a * .25 + ')'); g.addColorStop(1, 'rgba(255,215,106,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 40; i++) {
        var y = H - ((p * (.5 + (i % 6) * .1) + (i * .61) % 1) % 1.1) * H;
        var x = (i * 97 + Math.sin(p * 3 + i) * 24) % W;
        c.fillStyle = 'rgba(255,225,140,' + a * (.9 - (i % 4) * .15) + ')';
        star(c, x, y, 2 + (i % 3));
      }
    } },
    trap: { dur: 1700, shake: 1, sound: 'trap', tick: function (c, W, H, p) {
      var a = (Math.sin(p * Math.PI * 6) > 0 ? 1 : .25) * Math.sin(p * Math.PI) * .4;
      c.fillStyle = 'rgba(255,30,30,' + a + ')'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,60,60,' + a + ')'; c.lineWidth = 10;
      c.strokeRect(14, 14, W - 28, H - 28);
    } },
    bats: { dur: 2200, sound: 'whoosh', tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI);
      c.fillStyle = 'rgba(5,5,12,' + a * .4 + ')'; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 18; i++) {
        var x = (i * 71 + Math.sin(p * 12 + i * 2) * 90 + p * 260 * (i % 3 ? 1 : -1)) % (W + 80) - 40;
        var y = H * .35 + Math.sin(p * 9 + i * 3) * H * .22 + (i % 7) * 18;
        var flap = Math.abs(Math.sin(p * 22 + i)) * 7;
        c.fillStyle = 'rgba(10,10,20,' + a + ')';
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 12, y - flap, x - 20, y + 2); c.quadraticCurveTo(x - 10, y - 2, x, y + 3);
        c.quadraticCurveTo(x + 10, y - 2, x + 20, y + 2); c.quadraticCurveTo(x + 12, y - flap, x, y); c.fill();
      }
    } },
    bellring: { dur: 3400, sound: 'bell', shake: 1, tick: function (c, W, H, p) {
      c.save(); c.translate(W / 2, H / 2);
      for (var i = 0; i < 4; i++) {
        var r = ((p * .8 - i * .16) % 1) * Math.max(W, H) * .75;
        if (r > 0) {
          c.strokeStyle = 'rgba(255,215,106,' + (.55 * (1 - r / (Math.max(W, H) * .75))) + ')';
          c.lineWidth = 5 - i; c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
        }
      }
      c.restore();
      c.fillStyle = 'rgba(255,215,106,' + Math.sin(p * Math.PI) * .08 + ')'; c.fillRect(0, 0, W, H);
    } },
    crystal: { dur: 2000, sound: 'sparkle', tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI);
      var g = c.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, H * .6);
      g.addColorStop(0, 'rgba(106,232,255,' + a * .3 + ')'); g.addColorStop(1, 'rgba(106,232,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (var i = 0; i < 10; i++) {
        var x = W / 2 + Math.cos(p * 4 + i) * (60 + i * 16), y = H / 2 + Math.sin(p * 3 + i * 1.7) * (40 + i * 9);
        c.fillStyle = 'rgba(140,240,255,' + a * .85 + ')';
        c.save(); c.translate(x, y); c.rotate(p * 2 + i);
        c.beginPath(); c.moveTo(0, -9); c.lineTo(5, 0); c.lineTo(0, 9); c.lineTo(-5, 0); c.closePath(); c.fill(); c.restore();
      }
    } },
    dust: { dur: 1800, tick: function (c, W, H, p) {
      var a = Math.sin(p * Math.PI) * .5;
      for (var i = 0; i < 50; i++) {
        c.fillStyle = 'rgba(200,190,160,' + (Math.random() * a * .5) + ')';
        c.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
      }
    } },
    cold: { dur: 2000, onStart: function () { appEl.classList.add('cold-fx'); }, onEnd: function () { appEl.classList.remove('cold-fx'); },
      tick: function (c, W, H, p) {
        var a = Math.sin(p * Math.PI) * .18;
        c.fillStyle = 'rgba(140,200,255,' + a + ')'; c.fillRect(0, 0, W, H);
        for (var i = 0; i < 14; i++) {
          var y = (i * 47 + p * 130) % H;
          c.fillStyle = 'rgba(220,240,255,' + a * 2 + ')';
          c.fillRect((i * 83 + p * 40) % W, y, 2, 8);
        }
      } }
  };

  function star(c, x, y, s) {
    c.save(); c.translate(x, y);
    c.beginPath();
    for (var i = 0; i < 8; i++) {
      var r = i % 2 ? s * .4 : s * 1.6, a = i / 8 * Math.PI * 2 - Math.PI / 2;
      i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath(); c.fill(); c.restore();
  }
  function flashCls() { appEl.classList.add('flashwhite'); setTimeout(function () { appEl.classList.remove('flashwhite'); }, 180); }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    rafId = requestAnimationFrame(loop);
    var dt = Math.min(50, t - lastT); lastT = t;
    if (document.hidden) { return; } // 后台标签页暂停绘制，省电
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var W = window.innerWidth, H = window.innerHeight;
    acts = acts.filter(function (a) {
      a.t += dt; var p = Math.min(1, a.t / a.dur);
      a.def.tick(fxCtx, W, H, p);
      if (p >= 1) { if (a.def.onEnd) a.def.onEnd(); return false; }
      return true;
    });
    if (!acts.length) { rafId = null; fxCtx.clearRect(0, 0, W, H); }
  }

  function play(name) {
    var def = DEFS[name];
    if (!def) return;
    if (!fxEnabled && name !== 'blackout' && name !== 'flashwhite') { if (def.sound) AudioSys.play(def.sound); return; }
    if (def.sound) AudioSys.play(def.sound);
    if (def.shake) shake(def.shake);
    if (def.onStart) def.onStart();
    acts.push({ def: def, t: 0, dur: def.dur });
    if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(loop); }
  }
  function shake(level) {
    if (!fxEnabled) return;
    var cls = 'shake' + Math.min(3, Math.max(1, level));
    appEl.classList.remove('shake1', 'shake2', 'shake3');
    void appEl.offsetWidth;
    appEl.classList.add(cls);
    setTimeout(function () { appEl.classList.remove(cls); }, level === 3 ? 1100 : level === 2 ? 850 : 850);
  }

  /* ---------- 常驻雨层 ---------- */
  function rain(onOff) {
    rainOn = onOff;
    rainCanvas.style.opacity = onOff ? 1 : 0;
    if (onOff) {
      rainDrops = [];
      var n = window.innerWidth < 700 ? 90 : 150;
      for (var i = 0; i < n; i++) rainDrops.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        l: 10 + Math.random() * 16, v: 9 + Math.random() * 9, o: .12 + Math.random() * .25
      });
      if (!rainRaf) rainStep();
      AudioSys.rain(true);
    } else {
      AudioSys.rain(false);
    }
  }
  function rainStep() {
    rainRaf = requestAnimationFrame(rainStep);
    if (document.hidden) { return; } // 后台暂停
    if (!rainOn) { rainCtx.clearRect(0, 0, window.innerWidth, window.innerHeight); rainRaf = null; return; }
    var W = window.innerWidth, H = window.innerHeight;
    rainCtx.clearRect(0, 0, W, H);
    rainCtx.strokeStyle = 'rgba(190,210,255,.5)'; rainCtx.lineWidth = 1;
    rainDrops.forEach(function (d) {
      rainCtx.globalAlpha = d.o;
      rainCtx.beginPath(); rainCtx.moveTo(d.x, d.y); rainCtx.lineTo(d.x - 2, d.y + d.l); rainCtx.stroke();
      d.y += d.v; d.x -= 1.2;
      if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 60); }
    });
    rainCtx.globalAlpha = 1;
  }

  return {
    init: init, play: play, shake: shake, rain: rain,
    setEnabled: function (v) { fxEnabled = v; },
    isEnabled: function () { return fxEnabled; },
    has: function (n) { return !!DEFS[n]; }
  };
})();
