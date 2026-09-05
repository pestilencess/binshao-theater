/* ============ engine.js · 剧本引擎（节点解释器 / 存档 / UI） ============ */
'use strict';

var STORIES = {};   // id -> {id,title,sub,desc,color,nodes,clueTotal}
function registerStory(s) { STORIES[s.id] = s; }

var SPEED_MS = [44, 27, 14, 0];

var G = {
  story: null, nodes: [], labels: {}, idx: 0,
  stage: {},          // pos -> charId  (L/LC/C/RC/R)
  flags: {}, clues: [], stats: { courage: 0, wisdom: 0, bond: 0 },
  bg: 'black', rain: false, bgm: null,
  chapter: '', history: [], wrong: 0,
  state: 'idle', typeTimer: null, autoTimer: null,
  auto: false, checkpoint: null, started: false
};
var POS_KEYS = ['L', 'LC', 'C', 'RC', 'R'];

/* ---------- DOM 快捷 ---------- */
function $(id) { return document.getElementById(id); }

var Engine = {

  /* ============ 开局 ============ */
  start: function (storyId, snap) {
    var story = STORIES[storyId];
    if (!story) return;
    G.story = story; G.nodes = story.nodes;
    G.labels = {}; G.wrong = 0;
    G.flags = {}; G.clues = []; G.stats = { courage: 0, wisdom: 0, bond: 0 };
    G.stage = {}; G.bg = 'black'; G.rain = false; G.bgm = null;
    G.history = []; G.chapter = ''; G.auto = false; G.checkpoint = null;
    $('btnAuto').classList.remove('active');
    // 建立标签索引 & 校验
    story.nodes.forEach(function (n, i) { if (n.label) { G.labels[n.label] = i; } });
    story.nodes.forEach(function (n, i) {
      ['goto'].concat([['br'], ['choice'], ['quiz']]).forEach(function () {});
      var chk = [];
      if (n.goto) chk.push(n.goto);
      if (n.br) n.br.forEach(function (r) { chk.push(r.goto); });
      if (n.else) chk.push(n.else);
      if (n.choice) n.choice.opts.forEach(function (o) { if (o.goto) chk.push(o.goto); });
      if (n.quiz && n.quiz.fail) chk.push(n.quiz.fail);
      chk.forEach(function (l) { if (!(l in G.labels)) console.warn('[剧本校验] 缺少标签:', l, '@node', i); });
    });

    if (snap) { // 从存档恢复
      G.idx = snap.idx; G.flags = snap.flags || {}; G.clues = snap.clues || [];
      G.stats = snap.stats || G.stats; G.stage = snap.stage || {};
      G.history = snap.history || []; G.chapter = snap.chapter || '';
      this.setBg(snap.bg || 'black');
      if (snap.rain) { G.rain = true; FX.rain(true); $('rainLayer').style.opacity = 1; }
      this.renderStage();
      AudioSys.bgm(snap.bgm || null);
    } else {
      G.idx = 0;
    }
    $('titleScreen').classList.add('hidden');
    $('storySelect').classList.add('hidden');
    $('endingScreen').classList.add('hidden');
    $('gameScreen').classList.remove('hidden');
    this.closeAllPanels();
    G.started = true;
    this.updateNotebookBadge();
    if (!snap) this.step();
    else { G.state = 'idle'; this.step(); }
    unlockAch('first');
  },

  /* ============ 节点推进 ============ */
  step: function () {
    if (!G.story) return;
    var guard = 0;
    while (guard++ < 10000) {
      var node;
      if (G.inject && G.inject.length) {
        node = G.inject.shift();
        if (typeof node === 'function') { node(); continue; }
      } else {
        node = G.nodes[G.idx];
        if (!node) { G.state = 'idle'; return; }
        G.idx++;
      }
      if (this.exec(node) === 'stop') return;
    }
  },

  exec: function (node) {
    if (node.label) return;
    if (node.goto) { G.idx = G.labels[node.goto] || G.idx; return; }
    if (node.br) {
      var to = node.else || null;
      for (var i = 0; i < node.br.length; i++) {
        var r = node.br[i];
        if (r.if ? G.flags[r.if] : true) { to = r.goto; break; }
      }
      if (to) G.idx = G.labels[to] || G.idx;
      return;
    }
    if (node.bg) { this.setBg(node.bg); return; }
    if ('rain' in node) { G.rain = !!node.rain; FX.rain(G.rain); return; }
    if (node.bgm) { G.bgm = node.bgm; AudioSys.bgm(node.bgm); return; }
    if (node.bgm === null) { G.bgm = null; AudioSys.stopBgm(); return; }
    if (node.fx) { FX.play(node.fx); if (node.hold) { G.state = 'locked'; var self = this; setTimeout(function () { self.step(); }, node.hold); return 'stop'; } return; }
    if (node.wait) { G.state = 'locked'; var s2 = this; setTimeout(function () { s2.step(); }, node.wait); return 'stop'; }
    if (node.enter) { G.stage[node.enter[1]] = node.enter[0]; this.renderStage(); return; }
    if (node.exit) {
      for (var p in G.stage) if (G.stage[p] === node.exit) G.stage[p] = null;
      this.renderStage(); return;
    }
    if (node.stage) {
      G.stage = {}; var self3 = this;
      node.stage.forEach(function (pair) { G.stage[pair[1]] = pair[0]; });
      this.renderStage(); return;
    }
    if (node.clue) { this.addClue(node.clue); return; }
    if (node.stat) { this.addStat(node.stat); return; }
    if (node.flag) { G.flags[node.flag] = true; return; }
    if (node.save) { this.autoSave(node.save, true); return; }
    if (node.cg) { this.showCg(node.cg); return 'stop'; }
    if (node.ending) { this.showEnding(node.ending); return 'stop'; }
    if (node.n) { this.showLine(null, node.n, null); return 'stop'; }
    if (node.w) { this.showLine(node.w, node.x, node.e); return 'stop'; }
    if (node.choice) { this.showChoice(node.choice); return 'stop'; }
    if (node.quiz) { this.showQuiz(node.quiz); return 'stop'; }
    if ('say' in node || 'text' in node) { this.showLine(node.w || null, node.say || node.text, node.e); return 'stop'; }
    return;
  },

  /* ============ 背景 / 立绘 ============ */
  setBg: function (id) {
    G.bg = id;
    var layer = $('bgLayer');
    layer.style.opacity = 0;
    setTimeout(function () {
      layer.innerHTML = ART.bgSVG(id);
      layer.style.opacity = 1;
    }, 200);
    if (!G.rain) $('rainLayer').style.opacity = 0;
  },
  renderStage: function () {
    var stage = $('stage');
    stage.innerHTML = '';
    POS_KEYS.forEach(function (pos) {
      var id = G.stage[pos];
      if (!id) return;
      var d = document.createElement('div');
      d.className = 'sprite pos-' + pos + ' entering';
      d.dataset.emo = '';
      d.innerHTML = ART.charSVG(id);
      stage.appendChild(d);
    });
  },
  setSpeaking: function (who, emo) {
    // 说话人不在台上 → 自动安排空位登场
    if (who) {
      var onStage = Object.keys(G.stage).some(function (p) { return G.stage[p] === who; });
      if (!onStage) {
        var pos = 'C';
        if (!['C', 'LC', 'RC', 'L', 'R'].some(function (p) { if (!G.stage[p]) { pos = p; return true; } return false; })) {
          G.stage.C = who; // 台满则换下中央位
        } else G.stage[pos] = who;
        this.renderStage();
      }
    }
    var sprites = $('stage').children;
    for (var i = 0; i < sprites.length; i++) {
      var sp = sprites[i];
      var pos = ['pos-L', 'pos-LC', 'pos-C', 'pos-RC', 'pos-R'].find(function (c) { return sp.classList.contains(c); });
      var isWho = who && G.stage[pos.replace('pos-', '')] === who;
      sp.classList.toggle('speaking', !!isWho);
      if (isWho && emo) {
        sp.dataset.emo = '';
        void sp.offsetWidth;
        sp.dataset.emo = emo;
        var face = EMO_FACE[emo];
        if (face) {
          var b = document.createElement('div');
          b.className = 'emo-badge'; b.textContent = face;
          sp.appendChild(b);
          setTimeout(function (el) { return function () { el.remove(); }; }(b), 950);
        }
      }
    }
  },

  /* ============ 对话 ============ */
  showLine: function (who, text, emo) {
    var box = $('dialogueBox');
    box.classList.toggle('narration', !who);
    if (who) {
      var ch = CHARS[who];
      $('namePlate').style.display = '';
      $('namePlate').textContent = ch.name;
      $('namePlate').style.background = 'linear-gradient(135deg,' + ch.color2 + ',' + ch.color + ')';
    } else {
      $('namePlate').style.display = 'none';
    }
    this.setSpeaking(who, emo);
    G.history.push({ w: who, x: text });
    if (G.history.length > 220) G.history.shift();
    this.typewrite(text);
  },
  typewrite: function (text) {
    var self = this;
    G.state = 'typing';
    var el = $('dialogueText'), arrow = $('nextArrow');
    arrow.style.visibility = 'hidden';
    var ms = SPEED_MS[Settings.data.speed];
    this._fullText = text;
    if (G.typeTimer) clearInterval(G.typeTimer);
    if (ms === 0) { el.textContent = text; this.doneType(); return; }
    var i = 0;
    el.innerHTML = '<span class="caret"></span>';
    G.typeTimer = setInterval(function () {
      i++;
      el.innerHTML = text.slice(0, i).replace(/\n/g, '<br>') + '<span class="caret"></span>';
      if (i >= text.length) { clearInterval(G.typeTimer); G.typeTimer = null; self.doneType(); }
    }, ms);
    this._fullText = text;
  },
  doneType: function () {
    var self = this;
    G.state = 'idle';
    $('dialogueText').innerHTML = (this._fullText || '').replace(/\n/g, '<br>');
    $('nextArrow').style.visibility = '';
    if (G.auto && !G.autoTimer) {
      G.autoTimer = setTimeout(function () { G.autoTimer = null; if (G.state === 'idle') self.step(); }, 1500);
    }
  },
  finishType: function () {
    if (G.typeTimer) { clearInterval(G.typeTimer); G.typeTimer = null; }
    this.doneType();
  },

  /* ============ 选项 ============ */
  showChoice: function (ch) {
    G.state = 'choice';
    var self = this, panel = $('choicePanel');
    panel.innerHTML = '';
    if (ch.q) { var t = document.createElement('div'); t.className = 'choice-title'; t.textContent = ch.q; panel.appendChild(t); }
    ch.opts.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'choice-btn';
      b.style.animationDelay = (i * .08) + 's';
      b.innerHTML = (o.icon ? '<span class="c-icon">' + o.icon + '</span>' : '') + o.x;
      b.onclick = function (ev) {
        ev.stopPropagation();
        panel.classList.add('hidden');
        G.state = 'idle';
        if (o.stat) self.addStat(o.stat, true);
        if (o.flag) G.flags[o.flag] = true;
        G.history.push({ w: '__choice', x: '➤ ' + o.x.replace(/<[^>]+>/g, '') });
        if (o.goto) {
          var tgt = o.goto;
          G.inject = G.inject || [];
          G.inject.push(function () { G.idx = G.labels[tgt] || G.idx; });
        }
        if (o.reply) {
          G.inject = G.inject || [];
          G.inject.unshift(o.reply.w ? { w: o.reply.w, x: o.reply.x, e: o.reply.e } : { n: o.reply.x });
        }
        AudioSys.play('chime');
        self.step();
      };
      panel.appendChild(b);
    });
    panel.classList.remove('hidden');
  },

  /* ============ 推理问答 ============ */
  showQuiz: function (q) {
    G.state = 'quiz';
    var self = this, panel = $('quizPanel');
    var answered = false; // 防重入锁：避免连点导致重复判定/回跳
    panel.innerHTML = '<div class="quiz-box">' +
      '<div class="quiz-tag">✦ 推理时间 ✦</div>' +
      '<div class="quiz-q">' + q.q + '</div>' +
      '<div class="quiz-opts"></div></div>';
    var wrap = panel.querySelector('.quiz-opts');
    q.opts.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = o;
      b.onclick = function (ev) {
        ev.stopPropagation();
        if (answered) return;
        if (i === q.correct) {
          answered = true;
          AudioSys.play('chime');
          panel.classList.add('hidden');
          G.state = 'idle';
          if (q.onright && q.onright.stat) self.addStat(q.onright.stat, true);
          if (q.onright && q.onright.flag) G.flags[q.onright.flag] = true;
          G.history.push({ w: '__choice', x: '➤ ✅ ' + o });
          self.step();
        } else {
          answered = true;
          b.classList.add('quiz-wrong-shake');
          AudioSys.play('trap');
          G.wrong++;
          setTimeout(function () {
            panel.classList.add('hidden');
            G.state = 'idle';
            G.inject = G.inject || [];
            if (q.fail) {
              var f = q.fail;
              G.inject.push(function () { G.idx = G.labels[f] || G.idx; });
            }
            if (q.hint) {
              G.inject.unshift({ w: q.who || 'bin', x: q.hint, e: 'think' });
            }
            answered = false;
            self.step();
          }, 650);
        }
      };
      wrap.appendChild(b);
    });
    panel.classList.remove('hidden');
  },

  /* ============ 章节卡 ============ */
  showCg: function (cg) {
    G.state = 'locked';
    var card = $('cgCard');
    card.querySelector('.cg-ch').textContent = cg[0];
    card.querySelector('.cg-title').textContent = cg[1];
    card.classList.remove('hidden');
    G.chapter = cg[1];
    $('topTitle').textContent = (G.story ? G.story.title + ' · ' : '') + cg[1];
    var self = this;
    card.onclick = function () {
      card.onclick = null;
      card.classList.add('hidden');
      G.state = 'idle';
      self.step();
    };
    AudioSys.play('whoosh');
  },

  /* ============ 线索 / 数值 ============ */
  addClue: function (c) {
    if (G.clues.some(function (x) { return x[0] === c[0]; })) return;
    G.clues.push(c);
    this.updateNotebookBadge();
    AudioSys.play('clue');
    toast('📓 线索已记录：' + c[1], 'clue-toast');
  },
  addStat: function (st, silentSound) {
    var names = { courage: '勇气', wisdom: '智慧', bond: '羁绊' };
    for (var k in st) {
      G.stats[k] = (G.stats[k] || 0) + st[k];
      if (st[k] !== 0) toast((st[k] > 0 ? '✦ ' : '✧ ') + names[k] + (st[k] > 0 ? ' +1' : ' -1'), st[k] > 0 ? 'gold' : '');
    }
    if (G.stats.bond >= 6) G.flags.bond6 = true;
    if (G.stats.bond >= 8) G.flags.bond8 = true;
    if (!silentSound) AudioSys.play('clue');
  },
  updateNotebookBadge: function () {
    $('clueBadge').textContent = G.clues.length || '';
    $('clueBadge').style.display = G.clues.length ? '' : 'none';
  },

  /* ============ 结局 ============ */
  showEnding: function (e) {
    G.state = 'ending';
    AudioSys.stopBgm();
    AudioSys.rain(false);
    $('rainLayer').style.opacity = 0;
    e.ach = e.ach || [];
    e.ach.forEach(unlockAch);
    if (e.rank === 'S') unlockAch('m' + (G.story.id === 'story1' ? '1' : '2') + '_s');
    if (e.rank !== 'F') unlockAch(G.story.id === 'story1' ? 'm1_clear' : 'm2_clear');
    if (G.stats.bond >= 8) unlockAch('bond');
    if (Store.get('bs_cleared', []).indexOf('story1') >= 0 && G.story.id === 'story2' && e.rank !== 'F') unlockAch('both');
    if (G.story.id === 'story1' && Store.get('bs_cleared', []).indexOf('story2') >= 0 && e.rank !== 'F') unlockAch('both');
    var cleared = Store.get('bs_cleared', []);
    if (G.story.id === 'story1' && cleared.indexOf('story1') < 0) cleared.push('story1');
    if (G.story.id === 'story2' && cleared.indexOf('story2') < 0) cleared.push('story2');
    Store.set('bs_cleared', cleared);

    // 结局收集
    var seen = Store.get('bs_endings', {});
    if (!seen[G.story.id]) seen[G.story.id] = [];
    if (seen[G.story.id].indexOf(e.id) < 0) seen[G.story.id].push(e.id);
    Store.set('bs_endings', seen);
    var collected = seen[G.story.id].length, total = G.story.endings || 3;
    var rankColor = { S: '#ffd76a', A: '#7ea8ff', B: '#b9c4e8', F: '#ff6a6a' }[e.rank] || '#ffd76a';

    // 通关关系报告（按本局的数值与选择生成）
    var s = G.stats;
    var rel = [
      '彬少：' + (G.wrong === 0 ? '「和你一起推理，很愉快。下次，来真的。」' : '「推理路上有点颠簸——但结论是对的，这就够。」'),
      '王雪：' + (s.courage >= 3 ? '「这波勇气，俺给满分！」' : '「下次胆子再大一点，啊！」'),
      '小智智：' + (s.bond >= 4 ? '「大家……都被你照顾到了哦。」' : '「下次，多陪陪大家嘛。」'),
      '伟哥：' + (s.wisdom >= 5 ? '「……还行。」（他今天没有说"呵"）' : '「呵。」（但这一次，没有嘲讽的意思）'),
      '博文：' + (G.clues.length >= Math.round(G.story.clueTotal * 0.8) ? '「你的每一条记录，我在脑子里回放了三遍。」' : '「还有一些线索在角落里睡着——下次去叫醒它们。」')
    ];

    setTimeout(function () {
      $('gameScreen').classList.add('hidden');
      $('endingScreen').classList.remove('hidden');
      $('endingRank').innerHTML = '结局评级 <b style="color:' + rankColor + '">' + e.rank + '</b>';
      $('endingTitle').textContent = e.title;
      $('endingTitle').style.background = 'linear-gradient(90deg,#fff,' + rankColor + ')';
      $('endingTitle').style.webkitBackgroundClip = 'text';
      $('endingLines').textContent = e.lines.join('\n');
      $('endingRel').innerHTML = '<div class="g-sec" style="margin-top:0">本局关系报告</div>' +
        rel.map(function (r) { return '<div>' + r + '</div>'; }).join('') +
        '<div style="text-align:center;color:#8a96c9;margin-top:8px">🔓 结局收集：' + collected + ' / ' + total + (collected >= total ? ' —— 全结局制霸！' : ' —— 换一条路，故事会不一样。') + '</div>';
      $('endingStats').innerHTML =
        '勇气 ' + G.stats.courage + ' · 智慧 ' + G.stats.wisdom + ' · 羁绊 ' + G.stats.bond +
        '<br>线索收集 ' + G.clues.length + ' / ' + G.story.clueTotal +
        (e.rank === 'F' ? '<br><span style="color:#ff9a9a">推理之旅尚未结束——真相在等你回去。</span>' : '');
      var fxCanvas = $('endingFx');
      var ectx = fxCanvas.getContext('2d');
      fxCanvas.width = window.innerWidth; fxCanvas.height = window.innerHeight;
      var parts = [];
      for (var i = 0; i < 50; i++) parts.push({ x: Math.random() * fxCanvas.width, y: Math.random() * fxCanvas.height, v: .3 + Math.random() * .8, s: 1 + Math.random() * 2.4, o: .2 + Math.random() * .5 });
      var color = e.rank === 'F' ? '255,90,90' : '255,215,106';
      (function anim() {
        if ($('endingScreen').classList.contains('hidden')) return;
        ectx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        parts.forEach(function (p) {
          p.y -= p.v; if (p.y < -4) { p.y = fxCanvas.height + 4; p.x = Math.random() * fxCanvas.width; }
          ectx.fillStyle = 'rgba(' + color + ',' + p.o + ')';
          ectx.beginPath(); ectx.arc(p.x, p.y, p.s, 0, 7); ectx.fill();
        });
        requestAnimationFrame(anim);
      })();
      if (e.rank === 'S') { FX.play('gold'); AudioSys.bgm('warm'); }
      else if (e.rank === 'F') { AudioSys.bgm('tense'); }
      else { AudioSys.bgm('sad'); }
    }, 900);
    if (e.fx) FX.play(e.fx);
  },

  /* ============ 存档 ============ */
  snap: function (name) {
    return {
      story: G.story.id, idx: G.idx, flags: JSON.parse(JSON.stringify(G.flags)),
      clues: JSON.parse(JSON.stringify(G.clues)), stats: JSON.parse(JSON.stringify(G.stats)),
      stage: JSON.parse(JSON.stringify(G.stage)), bg: G.bg, rain: G.rain, bgm: G.bgm,
      chapter: G.chapter, history: G.history.slice(-60), wrong: G.wrong,
      name: name || G.chapter || G.story.title, ts: Date.now()
    };
  },
  autoSave: function (name, isCp) {
    if (!G.story) return;
    var s = this.snap(name);
    Store.set('bs_auto', s);
    if (isCp) { G.checkpoint = s; Store.set('bs_cp_' + G.story.id, s); }
    toast('💾 已自动保存' + (isCp ? '（检查点）' : ''));
  },
  manualSave: function () {
    if (!G.story) return;
    Store.set('bs_manual', this.snap('手动存档'));
    toast('💾 已保存');
  },
  loadSnap: function (s) {
    if (!s || !STORIES[s.story]) return false;
    this.start(s.story, s);
    G.wrong = s.wrong || 0;
    G.checkpoint = Store.get('bs_cp_' + s.story, null);
    toast('📂 已读取：' + s.name);
    return true;
  },

  /* ============ 面板 ============ */
  closeAllPanels: function () {
    ['notebookPanel', 'logPanel', 'pauseMenu', 'settingsPanel', 'galleryPanel', 'achPanel'].forEach(function (id) { $(id).classList.add('hidden'); });
  },
  anyPanelOpen: function () {
    return ['notebookPanel', 'logPanel', 'pauseMenu', 'settingsPanel', 'galleryPanel', 'achPanel', 'choicePanel', 'quizPanel', 'cgCard']
      .some(function (id) { return !$(id).classList.contains('hidden'); });
  },
  renderNotebook: function (tab) {
    tab = tab || 'clues';
    document.querySelectorAll('.ptab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    var body = $('notebookBody');
    if (tab === 'clues') {
      if (!G.clues.length) { body.innerHTML = '<div class="clue-empty">还没有收集到线索。<br>多和每个人聊聊，仔细检查每一个角落。</div>'; return; }
      body.innerHTML = G.clues.map(function (c, i) {
        return '<div class="clue-item" style="animation-delay:' + i * .05 + 's"><div class="clue-icon">' + (c[3] || '🔍') + '</div><div><div class="clue-name">' + c[1] + '</div><div class="clue-desc">' + c[2] + '</div></div></div>';
      }).join('');
    } else if (tab === 'status') {
      var bars = [
        { k: 'courage', name: '勇气', c: '#ff7a5a' }, { k: 'wisdom', name: '智慧', c: '#5ab0ff' }, { k: 'bond', name: '羁绊', c: '#ffb05a' }
      ].map(function (s) {
        var v = G.stats[s.k];
        return '<div class="stat-row"><span class="stat-name">' + s.name + '</span><div class="bar"><i style="width:' + Math.min(100, v * 10) + '%;background:' + s.c + '"></i></div><span class="stat-val">' + v + '</span></div>';
      }).join('');
      body.innerHTML = bars +
        '<div class="status-tip">线索 ' + G.clues.length + ' / ' + (G.story ? G.story.clueTotal : 0) +
        '<br>推理失误 ' + G.wrong + ' 次<br><br>' +
        (G.stats.bond >= 6 ? '队伍气氛很好，大家互相信任。' : G.stats.bond >= 3 ? '队伍还算团结。' : '队伍有些疏离……多做些拉近距离的选择吧。') +
        '</div>';
    } else {
      body.innerHTML = ACHIEVEMENTS.map(function (a) {
        var un = Store.get('bs_ach', []).indexOf(a.id) >= 0;
        return '<div class="ach-item ' + (un ? '' : 'locked') + '"><div class="ach-icon">' + a.icon + '</div><div><div class="ach-name">' + (un ? a.name : '？？？') + '</div><div class="ach-desc">' + a.desc + '</div></div></div>';
      }).join('');
    }
  },
  renderLog: function () {
    $('logBody').innerHTML = G.history.slice().reverse().map(function (l) {
      if (l.w === '__choice') return '<div class="log-line" style="color:#ffd76a">' + l.x + '</div>';
      return '<div class="log-line">' + (l.w ? '<b>' + CHARS[l.w].name + '</b>' : '<b style="color:#8a96c9">旁白</b>') + l.x.replace(/\n/g, '<br>') + '</div>';
    }).join('') || '<div class="clue-empty">暂无记录</div>';
  }
};

/* ---------- 成就 ---------- */
function unlockAch(id) {
  var list = Store.get('bs_ach', []);
  if (list.indexOf(id) >= 0) return;
  var a = ACHIEVEMENTS.find(function (x) { return x.id === id; });
  if (!a) return;
  list.push(id); Store.set('bs_ach', list);
  toast(a.icon + ' 成就解锁：' + a.name, 'gold');
  AudioSys.play('chime');
}

/* ---------- toast ---------- */
function toast(msg, cls) {
  var wrap = $('toastWrap');
  var t = document.createElement('div');
  t.className = 'toast ' + (cls || '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(function () { t.remove(); }, 3100);
}

/* ---------- 调试接口 ---------- */
window.GAME = {
  G: G, Engine: Engine, STORIES: STORIES,
  goto: function (label) { if (G.labels[label] !== undefined) { G.idx = G.labels[label]; G.state = 'idle'; Engine.step(); } },
  jump: function (i) { G.idx = i; G.state = 'idle'; Engine.step(); }
};
