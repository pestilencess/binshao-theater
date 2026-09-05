/* ============ main.js · 启动 & 标题画面 ============ */
'use strict';

(function () {

  Settings.load();
  Settings.apply();
  FX.init('fxLayer', 'rainLayer', 'app');

  /* ---------- 标题画面雨夜动画 ---------- */
  var tcv = $('titleFx'), tcx = tcv.getContext('2d');
  var drops = [], flash = 0, nextFlash = 2500;
  function tResize() {
    tcv.width = window.innerWidth; tcv.height = window.innerHeight;
    drops = [];
    var n = window.innerWidth < 700 ? 80 : 140;
    for (var i = 0; i < n; i++) drops.push({ x: Math.random() * tcv.width, y: Math.random() * tcv.height, v: 7 + Math.random() * 8, l: 8 + Math.random() * 14, o: .08 + Math.random() * .2 });
  }
  tResize();
  window.addEventListener('resize', tResize);
  var tLast = 0;
  (function tLoop(t) {
    requestAnimationFrame(tLoop);
    if ($('titleScreen').classList.contains('hidden')) return;
    var dt = Math.min(50, t - tLast); tLast = t;
    tcx.clearRect(0, 0, tcv.width, tcv.height);
    tcx.strokeStyle = 'rgba(190,210,255,.5)'; tcx.lineWidth = 1;
    drops.forEach(function (d) {
      tcx.globalAlpha = d.o;
      tcx.beginPath(); tcx.moveTo(d.x, d.y); tcx.lineTo(d.x - 2, d.y + d.l); tcx.stroke();
      d.y += d.v; d.x -= 1;
      if (d.y > tcv.height) { d.y = -18; d.x = Math.random() * (tcv.width + 40); }
    });
    tcx.globalAlpha = 1;
    nextFlash -= dt;
    if (nextFlash <= 0) { flash = 1; nextFlash = 3200 + Math.random() * 4200; }
    if (flash > 0) {
      flash -= dt / 500;
      tcx.fillStyle = 'rgba(200,215,255,' + Math.max(0, flash) * .14 + ')';
      tcx.fillRect(0, 0, tcv.width, tcv.height);
    }
  })(0);

  /* ---------- 输入：推进对话 ---------- */
  $('gameScreen').addEventListener('click', function (ev) {
    if (Engine.anyPanelOpen()) return;
    if (ev.target.closest('#topBar')) return;
    if (G.state === 'typing') { Engine.finishType(); return; }
    if (G.state === 'idle') Engine.step();
  });
  document.addEventListener('keydown', function (ev) {
    if ($('gameScreen').classList.contains('hidden')) return;
    if (Engine.anyPanelOpen()) {
      if (ev.key === 'Escape') Engine.closeAllPanels();
      return;
    }
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      if (G.state === 'typing') Engine.finishType();
      else if (G.state === 'idle') Engine.step();
    }
    if (ev.key === 'Escape') $('pauseMenu').classList.remove('hidden');
  });

  /* ---------- 标题按钮 ---------- */
  $('btnNew').onclick = function () { AudioSys.unlock(); AudioSys.play('chime'); $('titleScreen').classList.add('hidden'); $('storySelect').classList.remove('hidden'); };
  $('btnSelectBack').onclick = function () { $('storySelect').classList.add('hidden'); $('titleScreen').classList.remove('hidden'); };
  $('btnContinue').onclick = function () {
    AudioSys.unlock();
    var a = Store.get('bs_auto', null), m = Store.get('bs_manual', null);
    var pick = (a && m) ? (a.ts > m.ts ? a : m) : (a || m);
    if (!pick) { toast('还没有冒险记录，先开始一个新剧本吧'); return; }
    Engine.loadSnap(pick);
  };
  function refreshContinue() {
    var has = Store.get('bs_auto', null) || Store.get('bs_manual', null);
    $('btnContinue').style.opacity = has ? 1 : .45;
    // 剧本卡片上的结局收集进度
    var seen = Store.get('bs_endings', {});
    [['story1', 'Story1', 3], ['story2', 'Story2', 4]].forEach(function (p) {
      var got = (seen[p[0]] || []).length;
      var meta = document.querySelector('#card' + p[1] + ' .card-meta');
      if (!meta) return;
      var b = meta.querySelector('.end-badge');
      if (!b) { b = document.createElement('span'); b.className = 'end-badge'; meta.appendChild(b); }
      b.innerHTML = '<br>🏆 结局收集 ' + got + '/' + p[2];
    });
  }
  refreshContinue();

  $('cardStory1').onclick = function () { AudioSys.unlock(); Engine.start('story1'); };
  $('cardStory2').onclick = function () { AudioSys.unlock(); Engine.start('story2'); };

  /* ---------- 分享游戏 ---------- */
  $('btnShare').onclick = function () {
    var url = location.href.split('?')[0];
    var data = { title: '彬少剧场 · 双面剧本', text: '来玩我们的文字推理剧场！雷雨山庄杀人事件 × 深渊回响', url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast('🔗 链接已复制，发给朋友即可：' + url);
      }).catch(function () {
        toast('🔗 把地址栏链接发给朋友即可：' + url);
      });
    } else {
      toast('🔗 把地址栏链接发给朋友即可：' + url);
    }
  };

  /* ---------- 面板开关 ---------- */
  function bindPanel(btn, panel, pre) {
    $(btn).onclick = function () {
      if (pre) pre();
      $(panel).classList.remove('hidden');
    };
  }
  bindPanel('btnNotebook', 'notebookPanel', function () { Engine.renderNotebook('clues'); });
  bindPanel('btnLog', 'logPanel', function () { Engine.renderLog(); });
  $('btnNotebookClose').onclick = function () { $('notebookPanel').classList.add('hidden'); };
  $('btnLogClose').onclick = function () { $('logPanel').classList.add('hidden'); };
  document.querySelectorAll('.ptab').forEach(function (b) {
    b.onclick = function () { Engine.renderNotebook(b.dataset.tab); };
  });

  $('btnAuto').onclick = function () {
    G.auto = !G.auto;
    $('btnAuto').classList.toggle('active', G.auto);
    toast(G.auto ? '⏩ 自动播放：开' : '⏸ 自动播放：关');
    if (G.auto && G.state === 'idle' && !Engine.anyPanelOpen()) Engine.step();
    if (!G.auto && G.autoTimer) { clearTimeout(G.autoTimer); G.autoTimer = null; }
  };

  /* ---------- 暂停菜单 ---------- */
  $('btnPause').onclick = function () {
    renderSlots();
    $('pauseMenu').classList.remove('hidden');
  };
  $('btnPauseClose').onclick = function () { $('pauseMenu').classList.add('hidden'); };
  $('btnPResume').onclick = function () { $('pauseMenu').classList.add('hidden'); };
  $('btnPSave').onclick = function () { Engine.manualSave(); renderSlots(); };
  $('btnPLoad').onclick = function () {
    var s = Store.get('bs_manual', null) || Store.get('bs_auto', null);
    if (!s) { toast('暂无存档'); return; }
    $('pauseMenu').classList.add('hidden');
    Engine.loadSnap(s);
  };
  $('btnPQuit').onclick = function () {
    Engine.autoSave('离开时自动保存');
    Engine.closeAllPanels();
    $('gameScreen').classList.add('hidden');
    $('endingScreen').classList.add('hidden');
    $('titleScreen').classList.remove('hidden');
    AudioSys.stopBgm(); AudioSys.rain(false);
    refreshContinue();
  };
  function renderSlots() {
    var a = Store.get('bs_auto', null), m = Store.get('bs_manual', null);
    function fmt(s) {
      if (!s) return '<div class="slot"><span>（空）</span></div>';
      var d = new Date(s.ts);
      return '<div class="slot"><span>💾 ' + s.name + ' · ' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + '</span>' +
        '<span class="s-btns"><button data-act="load">读取</button></span></div>';
    }
    $('saveSlots').innerHTML = '<div style="font-size:12px;color:#7683b3;margin-top:10px;letter-spacing:2px">存档记录</div>' +
      '<div style="font-size:11px;color:#5a6890;margin-top:6px">自动：' + (a ? a.name : '暂无') + '</div>' + fmt(m);
    var lb = $('saveSlots').querySelector('button[data-act="load"]');
    if (lb) lb.onclick = function () {
      var s = Store.get('bs_manual', null) || Store.get('bs_auto', null);
      $('pauseMenu').classList.add('hidden');
      Engine.loadSnap(s);
    };
  }

  /* ---------- 设置 ---------- */
  function openSettings() {
    segSet('segSpeed', Settings.data.speed); segSet('segSound', Settings.data.sound); segSet('segFx', Settings.data.fx);
    $('settingsPanel').classList.remove('hidden');
  }
  $('btnSettings').onclick = openSettings;
  $('btnPSettings').onclick = openSettings;
  $('btnSettingsClose').onclick = function () { $('settingsPanel').classList.add('hidden'); };
  function segSet(id, v) {
    var seg = $(id);
    seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', +b.dataset.v === +v); });
  }
  [['segSpeed', 'speed'], ['segSound', 'sound'], ['segFx', 'fx']].forEach(function (pair) {
    $(pair[0]).addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      Settings.data[pair[1]] = +b.dataset.v;
      Settings.save(); Settings.apply();
      segSet(pair[0], b.dataset.v);
      AudioSys.play('chime');
    });
  });

  /* ---------- 图鉴 / 成就 ---------- */
  var gallerySel = 'bin';
  function renderGalleryDetail() {
    var c = CHARS[gallerySel];
    var html = '<div class="g-head"><div class="g-avatar">' + ART.charSVG(gallerySel) + '</div>' +
      '<div><div class="g-name" style="color:' + c.color + '">' + c.name + '</div>' +
      '<div class="g-role" style="color:' + c.color2 + '">' + c.role + '</div>' +
      '<div class="g-quote">' + c.quote + '</div></div></div>' +
      '<div class="g-bio">' + c.desc + '</div>';
    if (c.profile) {
      html += '<div class="g-profile">' + Object.keys(c.profile).map(function (k) {
        return '<span><b>' + k + '</b>' + c.profile[k] + '</span>';
      }).join('') + '</div>';
    }
    if ((c.traits || []).length) {
      html += '<div class="g-sec">性格特点 · 与它们的小故事</div>';
      c.traits.forEach(function (t) {
        html += '<div class="g-trait"><span class="t-tag"># ' + t.tag + '</span>' +
          '<div class="t-d">' + t.d + '</div>' +
          (t.story ? '<div class="t-story"><b>' + t.story[0] + '</b><p>' + t.story[1] + '</p></div>' : '') +
          '</div>';
      });
    }
    html += '<div class="g-note">※ 图鉴记录的都是日常与往事，不含主线剧透，请放心食用。</div>';
    $('gDetail').innerHTML = html;
    $('gDetail').scrollTop = 0;
  }
  function renderGallery() {
    var ids = Object.keys(CHARS);
    $('galleryBody').innerHTML = '<div class="g-layout"><div class="g-list">' +
      ids.map(function (id) {
        var c = CHARS[id];
        return '<button class="g-chip' + (id === gallerySel ? ' on' : '') + '" data-id="' + id + '">' +
          '<span class="g-ava">' + ART.charSVG(id) + '</span><span class="g-nm">' + c.name + '</span></button>';
      }).join('') + '</div><div class="g-detail" id="gDetail"></div></div>';
    document.querySelectorAll('.g-chip').forEach(function (b) {
      b.onclick = function () {
        gallerySel = b.dataset.id;
        document.querySelectorAll('.g-chip').forEach(function (x) { x.classList.toggle('on', x.dataset.id === gallerySel); });
        renderGalleryDetail();
        AudioSys.play('clue');
      };
    });
    renderGalleryDetail();
  }
  $('btnGallery').onclick = function () {
    renderGallery();
    $('galleryPanel').classList.remove('hidden');
  };
  $('btnGalleryClose').onclick = function () { $('galleryPanel').classList.add('hidden'); };
  $('btnAch').onclick = function () {
    $('achBody').innerHTML = ACHIEVEMENTS.map(function (a) {
      var un = Store.get('bs_ach', []).indexOf(a.id) >= 0;
      return '<div class="ach-item ' + (un ? '' : 'locked') + '"><div class="ach-icon">' + a.icon + '</div><div><div class="ach-name">' + (un ? a.name : '？？？') + '</div><div class="ach-desc">' + a.desc + '</div></div></div>';
    }).join('');
    $('achPanel').classList.remove('hidden');
  };
  $('btnAchClose').onclick = function () { $('achPanel').classList.add('hidden'); };

  /* ---------- 结局按钮 ---------- */
  $('btnEndTitle').onclick = function () {
    $('endingScreen').classList.add('hidden');
    $('titleScreen').classList.remove('hidden');
    AudioSys.stopBgm();
    refreshContinue();
  };
  $('btnEndRetry').onclick = function () {
    var cp = G.checkpoint || Store.get('bs_cp_' + (G.story ? G.story.id : ''), null);
    $('endingScreen').classList.add('hidden');
    if (cp) Engine.loadSnap(cp);
    else { toast('没有检查点，返回标题'); $('titleScreen').classList.remove('hidden'); }
  };

})();
