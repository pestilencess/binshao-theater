/* ============ art.js · 角色立绘 & 场景背景（全程序化 SVG，无外部资源） ============ */
'use strict';

/* ---------- 通用脸部部件 ---------- */
function _eyes(cx, cy, o) {
  o = o || {};
  var iris = o.iris || '#3a3f55', ry = o.ry || 8, lx = cx - 15, rx = cx + 15;
  var lid = o.lid || 0; // 上眼睑下压(半闭眼)
  var s = '';
  [-1, 1].forEach(function (k) {
    var x = k < 0 ? lx : rx;
    s += '<ellipse cx="' + x + '" cy="' + cy + '" rx="7" ry="' + ry + '" fill="#fff"/>';
    s += '<circle cx="' + x + '" cy="' + (cy + 1) + '" r="4.6" fill="' + iris + '"/>';
    s += '<circle cx="' + (x + 1.8) + '" cy="' + (cy - 1.8) + '" r="1.7" fill="#fff"/>';
    if (lid > 0) s += '<rect x="' + (x - 8) + '" y="' + (cy - ry - 1) + '" width="16" height="' + (ry - lid + 1) + '" fill="' + (o.skin || '#ffe8da') + '"/>';
    s += '<path d="M ' + (x - 8) + ' ' + (cy - ry + 1) + ' Q ' + x + ' ' + (cy - ry - 3 - o.browArc / 3) + ' ' + (x + 8) + ' ' + (cy - ry + 1) + '" fill="none" stroke="' + (o.line || '#2a2530') + '" stroke-width="2.4" stroke-linecap="round"/>';
    // 眉
    var ba = o.browA || 0;
    s += '<path d="M ' + (x - 8) + ' ' + (cy - ry - 7 - k * ba) + ' Q ' + x + ' ' + (cy - ry - 10 - k * ba) + ' ' + (x + 8) + ' ' + (cy - ry - 7 - k * ba * -0) + '" fill="none" stroke="' + (o.brow || o.line || '#2a2530') + '" stroke-width="2.6" stroke-linecap="round" transform="rotate(' + (k * (o.browTilt || 0)) + ' ' + x + ' ' + (cy - ry - 7) + ')"/>';
  });
  return s;
}
function _mouth(cx, cy, type, color) {
  color = color || '#b0575a';
  switch (type) {
    case 'smile': return '<path d="M ' + (cx - 9) + ' ' + cy + ' Q ' + cx + ' ' + (cy + 7) + ' ' + (cx + 9) + ' ' + cy + '" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round"/>';
    case 'smileS': return '<path d="M ' + (cx - 6) + ' ' + cy + ' Q ' + cx + ' ' + (cy + 5) + ' ' + (cx + 6) + ' ' + cy + '" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>';
    case 'grin': return '<path d="M ' + (cx - 13) + ' ' + (cy - 2) + ' Q ' + cx + ' ' + (cy + 10) + ' ' + (cx + 13) + ' ' + (cy - 2) + ' Z" fill="#7c3a3f"/><path d="M ' + (cx - 11) + ' ' + (cy - 1) + ' Q ' + cx + ' ' + (cy + 2) + ' ' + (cx + 11) + ' ' + (cy - 1) + '" fill="#fff"/>';
    case 'open': return '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="8" ry="6" fill="#7c3a3f"/><ellipse cx="' + cx + '" cy="' + (cy + 6) + '" rx="4.5" ry="2.6" fill="#e0837f"/>';
    case 'flat': return '<line x1="' + (cx - 8) + '" y1="' + cy + '" x2="' + (cx + 8) + '" y2="' + cy + '" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round"/>';
    case 'worry': return '<path d="M ' + (cx - 7) + ' ' + (cy + 3) + ' Q ' + cx + ' ' + (cy - 2) + ' ' + (cx + 7) + ' ' + (cy + 3) + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>';
    case 'small': return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="3" ry="4" fill="' + color + '"/>';
    case 'fang': return '<path d="M ' + (cx - 12) + ' ' + (cy - 2) + ' Q ' + cx + ' ' + (cy + 9) + ' ' + (cx + 12) + ' ' + (cy - 2) + ' Z" fill="#7c3a3f"/><path d="M ' + (cx - 10) + ' ' + (cy - 2) + ' L ' + (cx - 7) + ' ' + (cy + 4) + ' L ' + (cx - 4) + ' ' + (cy - 2) + ' Z" fill="#fff"/>';
    default: return '';
  }
}
function _blush(cx, cy, color, op) {
  return '<ellipse cx="' + (cx - 24) + '" cy="' + cy + '" rx="8" ry="4.5" fill="' + color + '" opacity="' + (op || .55) + '"/>' +
         '<ellipse cx="' + (cx + 24) + '" cy="' + cy + '" rx="8" ry="4.5" fill="' + color + '" opacity="' + (op || .55) + '"/>';
}

/* ---------- 立绘组装 ---------- */
function charSVG(id) {
  var F = { bin: _bin, yan: _yan, wang: _wang, zhi: _zhi, wei: _wei, bo: _bo, shen: _shen, zhou: _zhou,
            xuetong: _xuetong, xiaoyuan: _xiaoyuan, liushuai: _liushuai, daxiang: _daxiang, eryu: _eryu, jiangsen: _jiangsen };
  return (F[id] || _bin)();
}
function _svgWrap(inner) {
  return '<svg viewBox="0 0 200 262" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

/* 彬少：聪明勇敢 · 深蓝 · 眼镜 */
function _bin() {
  var skin = '#ffe3d2';
  return _svgWrap(
    '<defs><linearGradient id="binJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d55c0"/><stop offset="1" stop-color="#273472"/></linearGradient></defs>' +
    '<path d="M62 140 Q100 122 138 140 L150 262 L50 262 Z" fill="url(#binJ)"/>' + // 身体
    '<path d="M84 130 L100 152 L116 130 L112 126 L100 138 L88 126 Z" fill="#e8ecf7"/>' + // 衬衫领
    '<line x1="100" y1="152" x2="100" y2="200" stroke="#2a356e" stroke-width="3"/>' +
    '<rect x="128" y="158" width="13" height="13" rx="2.5" fill="#ffd76a" transform="rotate(12 134 164)"/>' + // 星形徽章(方块代替)
    '<rect x="93" y="118" width="14" height="18" rx="5" fill="' + skin + '"/>' + // 脖子
    '<ellipse cx="100" cy="80" rx="39" ry="43" fill="' + skin + '"/>' +
    '<path d="M61 78 Q58 30 100 28 Q142 30 139 78 Q136 52 118 46 Q126 60 122 66 Q104 42 78 52 Q64 60 61 78 Z" fill="#232a4d"/>' + // 头发
    '<path d="M120 46 Q140 58 136 88 L142 74 Q144 52 128 42 Z" fill="#232a4d"/>' + // 侧发
    '<path d="M96 34 Q84 46 90 58" fill="none" stroke="#3d4a80" stroke-width="2" opacity=".7"/>' +
    _eyes(100, 84, { iris: '#3d55c0', skin: skin, browA: 0, browTilt: -4 }) +
    '<g stroke="#9fb2d8" stroke-width="2.2" fill="rgba(200,220,255,.12)">' +
    '<rect x="66" y="74" width="26" height="20" rx="6"/><rect x="108" y="74" width="26" height="20" rx="6"/><line x1="92" y1="84" x2="108" y2="84"/></g>' +
    _mouth(100, 106, 'smile') +
    '<path d="M50 262 L58 200 Q60 178 74 170 L84 166 L70 262 Z" fill="#273472"/>' +
    '<path d="M150 262 L142 200 Q140 178 126 170 L116 166 L130 262 Z" fill="#273472"/>'
  );
}
/* 严妹妹：娇羞 · 粉 · 双马尾 */
function _yan() {
  var skin = '#ffeadf';
  return _svgWrap(
    '<defs><linearGradient id="yanH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b088"/><stop offset="1" stop-color="#c9885f"/></linearGradient>' +
    '<linearGradient id="yanJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ec7"/><stop offset="1" stop-color="#e0709f"/></linearGradient></defs>' +
    '<path d="M40 90 Q28 200 46 250 L64 250 Q50 180 58 100 Z" fill="url(#yanH)"/>' + // 左马尾
    '<path d="M160 90 Q172 200 154 250 L136 250 Q150 180 142 100 Z" fill="url(#yanH)"/>' + // 右马尾
    '<circle cx="44" cy="104" r="9" fill="#ff7fb2"/><circle cx="156" cy="104" r="9" fill="#ff7fb2"/>' + // 发绳
    '<path d="M60 142 Q100 124 140 142 L152 262 L48 262 Z" fill="url(#yanJ)"/>' +
    '<path d="M88 136 Q100 152 112 136 L108 132 Q100 142 92 132 Z" fill="#fff2f6"/>' +
    '<circle cx="100" cy="162" r="4" fill="#ffdfec"/><circle cx="84" cy="176" r="4" fill="#ffdfec"/>' + // 连帽衫绒球
    '<rect x="93" y="120" width="14" height="16" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="82" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M62 84 Q56 32 100 30 Q144 32 138 84 Q134 54 114 48 Q100 44 86 48 Q66 54 62 84 Z" fill="url(#yanH)"/>' + // 前发
    '<path d="M62 80 Q54 130 58 158 Q50 120 54 86 Z" fill="url(#yanH)"/>' +
    '<path d="M138 80 Q146 130 142 158 Q150 120 146 86 Z" fill="url(#yanH)"/>' +
    _eyes(100, 86, { iris: '#c96a8f', ry: 9, skin: skin, browTilt: 6, browArc: 6 }) +
    _blush(100, 100, '#ff9fb8', .7) +
    _mouth(100, 107, 'small') +
    '<path d="M148 208 q10 -26 2 -40 l10 4 q4 20 -6 40 Z" fill="url(#yanH)" opacity=".9"/>' // 侧发垂落
  );
}
/* 王雪：猛男 · 红 · 高马尾+发卡(反差萌) */
function _wang() {
  var skin = '#ffdcb8';
  return _svgWrap(
    '<defs><linearGradient id="wangJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0483f"/><stop offset="1" stop-color="#a82f30"/></linearGradient></defs>' +
    '<path d="M58 138 Q100 118 142 138 L158 262 L42 262 Z" fill="url(#wangJ)"/>' + // 背心躯干
    '<path d="M58 140 Q40 158 44 190 L58 196 Q54 164 66 150 Z" fill="#e8a878"/>' + // 左臂
    '<path d="M142 140 Q160 158 156 190 L142 196 Q146 164 134 150 Z" fill="#e8a878"/>' + // 右臂
    '<circle cx="46" cy="200" r="7" fill="#ffdcb8"/><circle cx="154" cy="200" r="7" fill="#ffdcb8"/>' + // 拳头
    '<path d="M76 140 Q100 158 124 140 L118 132 Q100 146 82 132 Z" fill="#ffdcb8"/>' + // 胸口露出
    '<rect x="94" y="116" width="13" height="18" rx="5" fill="#ffdcb8"/>' +
    '<ellipse cx="100" cy="80" rx="39" ry="43" fill="' + skin + '"/>' +
    '<path d="M62 74 Q60 34 100 30 Q140 34 138 74 Q128 48 100 46 Q72 48 62 74 Z" fill="#1d1d28"/>' +
    '<path d="M136 52 Q156 40 158 22 Q166 52 144 72 Q140 60 136 52 Z" fill="#1d1d28"/>' + // 高马尾
    '<rect x="58" y="52" width="84" height="12" rx="6" fill="#d8352e"/>' + // 头带
    '<path d="M132 40 l4 8 8 2 -6 6 1 9 -7 -4 -7 4 1 -9 -6 -6 8 -2 Z" fill="#ff9ec7"/>' + // 可爱发卡(星)
    _eyes(100, 84, { iris: '#8a4a2a', skin: skin, browTilt: -8, browArc: 2 }) +
    '<rect x="120" y="96" width="13" height="5" rx="2" fill="#fff" stroke="#d89a6a" stroke-width="1" transform="rotate(-14 126 98)"/>' + // 创可贴
    _mouth(100, 106, 'fang') +
    '<path d="M120 150 l6 6 -6 6 -6 -6 Z" fill="#ffd76a"/>' // 胸前图案
  );
}
/* 小智智的照片立绘已统一由下方「照片立绘系统」提供（含团子贴纸） */
/* 团子贴纸（右肩旁探头） */
var _TUANZI_LEGACY = '';
/* 伟哥：闷骚 · 暗紫黑 · 高领大衣 刘海遮眼 */
function _wei() {
  var skin = '#f2ddc9';
  return _svgWrap(
    '<defs><linearGradient id="weiJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f5e"/><stop offset="1" stop-color="#23263e"/></linearGradient></defs>' +
    '<path d="M58 138 Q100 120 142 138 L156 262 L44 262 Z" fill="url(#weiJ)"/>' + // 大衣
    '<rect x="76" y="126" width="48" height="70" rx="10" fill="#191b2c"/>' + // 高领毛衣
    '<path d="M58 138 Q44 156 48 186 L62 190 Q58 164 68 150 Z" fill="url(#weiJ)"/>' +
    '<path d="M142 138 Q156 156 152 186 L138 190 Q142 164 132 150 Z" fill="url(#weiJ)"/>' +
    '<rect x="94" y="112" width="13" height="18" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M62 80 Q58 32 100 30 Q142 32 138 80 Q136 50 116 44 Q100 60 84 46 Q66 52 62 80 Z" fill="#16182a"/>' + // 长刘海遮右眼
    '<path d="M112 44 Q134 50 136 100 L142 78 Q144 50 124 42 Z" fill="#16182a"/>' +
    '<g>' + // 左眼正常 右眼被遮
    '<ellipse cx="85" cy="86" rx="6.5" ry="7.5" fill="#fff"/><circle cx="85" cy="87" r="4.2" fill="#6a5acd"/><circle cx="86.5" cy="85.5" r="1.5" fill="#fff"/>' +
    '<path d="M77 79 Q85 75 93 79" fill="none" stroke="#16182a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M112 84 Q120 88 128 86" fill="none" stroke="#16182a" stroke-width="2.4" stroke-linecap="round"/>' + // 遮眼刘海下的眉
    '</g>' +
    '<path d="M136 78 Q146 96 142 118" fill="none" stroke="#e8e8f0" stroke-width="2" opacity=".8"/>' + // 耳机线
    '<circle cx="141" cy="120" r="3.5" fill="#e8e8f0"/>' +
    _mouth(100, 108, 'flat') +
    '<path d="M84 104 q4 3 8 0" fill="none" stroke="#e8b0a8" stroke-width="2" opacity=".0"/>' // (闷骚 reserved)
  );
}
/* 大聪明博文：大嘴巴 · 绿 · 护目镜+大声公气质 */
function _bo() {
  var skin = '#ffe0c2';
  return _svgWrap(
    '<defs><linearGradient id="boJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ac077"/><stop offset="1" stop-color="#2e8a55"/></linearGradient></defs>' +
    '<path d="M58 140 Q100 122 142 140 L154 262 L46 262 Z" fill="url(#boJ)"/>' +
    '<path d="M86 134 L100 154 L114 134 L110 130 L100 142 L90 130 Z" fill="#f4f7ee"/>' +
    '<circle cx="100" cy="172" r="4" fill="#ff8a5a"/>' +
    '<rect x="93" y="118" width="14" height="18" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="40" ry="44" fill="' + skin + '"/>' +
    '<path d="M60 76 Q56 30 100 28 Q144 30 140 76 Q136 50 118 44 Q112 58 100 54 Q88 58 82 46 Q64 52 60 76 Z" fill="#5a7a3a"/>' + // 乱发
    '<path d="M70 42 Q78 26 94 30 M108 28 Q124 26 130 40" fill="none" stroke="#5a7a3a" stroke-width="6" stroke-linecap="round"/>' +
    '<g><rect x="70" y="52" width="27" height="16" rx="8" fill="none" stroke="#c9a13a" stroke-width="3.5"/><rect x="103" y="52" width="27" height="16" rx="8" fill="none" stroke="#c9a13a" stroke-width="3.5"/><line x1="97" y1="60" x2="103" y2="60" stroke="#c9a13a" stroke-width="3.5"/></g>' + // 额头护目镜
    _eyes(100, 88, { iris: '#4a7a3a', ry: 8.5, skin: skin, browArc: 5 }) +
    _mouth(100, 108, 'grin') +
    '<circle cx="74" cy="100" r="2.2" fill="#e8a878"/><circle cx="70" cy="106" r="2.2" fill="#e8a878"/><circle cx="126" cy="100" r="2.2" fill="#e8a878"/><circle cx="130" cy="106" r="2.2" fill="#e8a878"/>' // 雀斑
  );
}
/* NPC：沈万山（山庄主人） */
function _shen() {
  var skin = '#f2d4b4';
  return _svgWrap(
    '<defs><linearGradient id="shJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4a2a"/><stop offset="1" stop-color="#46301c"/></linearGradient></defs>' +
    '<path d="M58 140 Q100 122 142 140 L156 262 L44 262 Z" fill="url(#shJ)"/>' +
    '<path d="M86 134 L100 158 L114 134 L110 130 L100 142 L90 130 Z" fill="#f4e9d4"/>' +
    '<path d="M92 158 L100 180 L108 158 L100 164 Z" fill="#8a2a2a"/>' + // 领带
    '<rect x="94" y="116" width="13" height="18" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M64 72 Q62 36 100 32 Q138 36 136 72 Q130 50 100 48 Q70 50 64 72 Z" fill="#4a4a52"/>' +
    '<path d="M84 118 Q100 128 116 118 L112 126 Q100 132 88 126 Z" fill="#5a5a62"/>' + // 山羊胡
    _eyes(100, 82, { iris: '#5a4a2a', lid: 3, skin: skin, browTilt: -2 }) +
    '<circle cx="118" cy="82" r="9" fill="none" stroke="#d8b84a" stroke-width="2"/><line x1="124" y1="80" x2="132" y2="74" stroke="#d8b84a" stroke-width="2"/>' + // 单片眼镜
    _mouth(100, 104, 'smile')
  );
}
/* NPC：老周（管家） */
function _zhou() {
  var skin = '#e8cdb0';
  return _svgWrap(
    '<defs><linearGradient id="zhJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#262a34"/></linearGradient></defs>' +
    '<path d="M60 140 Q100 124 140 140 L152 262 L48 262 Z" fill="url(#zhJ)"/>' +
    '<path d="M88 136 L100 152 L112 136 L108 132 L100 142 L92 132 Z" fill="#e8e8ee"/>' +
    '<path d="M92 146 L100 158 L108 146 L100 150 Z" fill="#22263a"/>' + // 领结
    '<rect x="94" y="118" width="13" height="17" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="82" rx="37" ry="41" fill="' + skin + '"/>' +
    '<path d="M64 78 Q62 40 100 36 Q138 40 136 78 Q132 54 100 52 Q68 54 64 78 Z" fill="#9aa0ae"/>' +
    _eyes(100, 84, { iris: '#6a7080', lid: 6, skin: skin, browArc: 2 }) +
    _mouth(100, 105, 'flat')
  );
}

/* ---------- 场景背景 ---------- */
function bgSVG(id) {
  var F = {
    road: _bgRoad, villa_out: _bgVilla, hall: _bgHall, hall_dark: _bgHallDark,
    study: _bgStudy, corridor: _bgCorridor, room: _bgRoom, pantry: _bgPantry,
    attic: _bgAttic, village: _bgVillage, cave: _bgCave, city: _bgCity,
    tower: _bgTower, sunrise: _bgSunrise, black: _bgBlack
  };
  return (F[id] || _bgBlack)();
}
function _svgBg(w, inner) {
  return '<svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}
/* 山路黄昏 */
function _bgRoad() {
  return _svgBg(0,
    '<defs><linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3160"/><stop offset=".55" stop-color="#7a5a8a"/><stop offset=".8" stop-color="#e8925a"/><stop offset="1" stop-color="#f7c88a"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#rSky)"/>' +
    '<circle cx="470" cy="250" r="34" fill="#ffe8b0" opacity=".9"/>' +
    '<path d="M0 240 L120 150 L240 240 Z" fill="#3a3260"/><path d="M160 250 L320 130 L500 250 Z" fill="#2a2448"/><path d="M380 250 L540 160 L660 250 Z" fill="#332c58"/>' +
    '<rect y="250" width="640" height="110" fill="#1c1830"/>' +
    '<path d="M0 330 Q320 270 640 320 L640 360 L0 360 Z" fill="#141220"/>' +
    '<path d="M0 342 Q320 288 640 334" fill="none" stroke="#e8d8a0" stroke-width="3" stroke-dasharray="18 26" opacity=".5"/>' +
    '<path d="M90 250 q6 -46 2 -70 M92 200 q-22 -8 -26 -30 M92 202 q20 -6 26 -26" stroke="#0e0c1c" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M560 252 q8 -50 3 -76 M563 208 q-24 -10 -28 -34 M563 210 q22 -8 28 -30" stroke="#0e0c1c" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<g opacity=".85"><circle cx="80" cy="60" r="1.6" fill="#fff"/><circle cx="200" cy="40" r="1.2" fill="#fff"/><circle cx="330" cy="70" r="1.4" fill="#fff"/><circle cx="520" cy="50" r="1.2" fill="#fff"/></g>');
}
/* 雾隐山庄外观(雨夜) */
function _bgVilla() {
  return _svgBg(0,
    '<defs><linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e22"/><stop offset="1" stop-color="#232a4a"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#vSky)"/>' +
    '<ellipse cx="480" cy="60" rx="130" ry="26" fill="#1a2038" opacity=".8"/>' +
    '<path d="M0 250 L100 160 L200 250 Z" fill="#141830"/><path d="M480 250 L590 150 L700 250 Z" fill="#161a34"/>' +
    '<g><rect x="240" y="160" width="170" height="110" fill="#1b1f38"/><path d="M225 165 L325 105 L425 165 Z" fill="#232848"/><rect x="300" y="80" width="50" height="42" fill="#1b1f38"/><path d="M292 84 L325 62 L358 84 Z" fill="#232848"/>' +
    '<rect x="260" y="185" width="26" height="32" rx="2" fill="#ffd98a"/><rect x="312" y="185" width="26" height="32" rx="2" fill="#ffd98a"/><rect x="364" y="185" width="26" height="32" rx="2" fill="#c9b06a"/><rect x="312" y="120" width="24" height="26" rx="2" fill="#ffd98a"/>' +
    '<rect x="316" y="228" width="30" height="42" rx="3" fill="#3a2c1a"/><circle cx="340" cy="250" r="2.4" fill="#ffd98a"/></g>' +
    '<rect x="150" y="268" width="360" height="14" fill="#20243e"/><rect x="196" y="282" width="12" height="60" fill="#181c32"/><rect x="452" y="282" width="12" height="60" fill="#181c32"/>' +
    '<path d="M60 300 q-4 -70 8 -110 M68 240 q-26 -14 -30 -44 M68 244 q24 -10 30 -40" stroke="#0c0e1e" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<rect y="330" width="640" height="30" fill="#0d1020"/>');
}
/* 大厅(夜·炉火) */
function _bgHall() {
  return _svgBg(0,
    '<defs><linearGradient id="hW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e14"/><stop offset="1" stop-color="#171009"/></linearGradient><radialGradient id="hFire" cx=".5" cy=".8" r=".7"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient><linearGradient id="hWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141c38"/><stop offset="1" stop-color="#263258"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#hW)"/>' +
    '<rect x="430" y="60" width="150" height="170" rx="6" fill="url(#hWin)" stroke="#3a2c1a" stroke-width="8"/>' +
    '<line x1="505" y1="60" x2="505" y2="230" stroke="#3a2c1a" stroke-width="6"/><line x1="430" y1="145" x2="580" y2="145" stroke="#3a2c1a" stroke-width="6"/>' +
    '<rect x="40" y="70" width="120" height="150" rx="4" fill="#241a10" stroke="#3a2c1a" stroke-width="5"/>' +
    '<g fill="#8a6a3a"><rect x="50" y="82" width="24" height="10"/><rect x="78" y="82" width="30" height="10"/><rect x="112" y="82" width="20" height="10"/><rect x="50" y="96" width="34" height="10"/><rect x="88" y="96" width="22" height="10"/><rect x="50" y="124" width="26" height="10"/><rect x="80" y="124" width="28" height="10"/><rect x="112" y="124" width="24" height="10"/><rect x="50" y="138" width="30" height="10"/><rect x="84" y="138" width="26" height="10"/><rect x="50" y="166" width="24" height="10"/><rect x="78" y="166" width="34" height="10"/><rect x="116" y="166" width="18" height="10"/></g>' +
    '<rect x="205" y="120" width="180" height="150" rx="8" fill="#241a10"/>' +
    '<rect x="215" y="130" width="160" height="70" rx="4" fill="#1a2340" stroke="#3a2c1a" stroke-width="5"/>' +
    '<rect x="215" y="210" width="160" height="18" rx="4" fill="#3a2c1a"/>' +
    '<g stroke="#e8c05a" stroke-width="2"><line x1="240" y1="140" x2="240" y2="196"/><line x1="270" y1="140" x2="270" y2="196"/><line x1="300" y1="140" x2="300" y2="196"/><line x1="330" y1="140" x2="330" y2="196"/><line x1="360" y1="140" x2="360" y2="196"/></g>' +
    '<rect x="40" y="240" width="240" height="16" rx="4" fill="#3a2c1a"/><rect x="52" y="256" width="10" height="60" fill="#2a1e12"/><rect x="258" y="256" width="10" height="60" fill="#2a1e12"/>' +
    '<g><circle cx="90" cy="234" r="4" fill="#ffd98a"/><rect x="87" y="238" width="6" height="12" fill="#c9a86a"/><ellipse cx="90" cy="230" rx="8" ry="12" fill="#ffb85a" opacity=".35"/></g>' +
    '<g><circle cx="170" cy="234" r="4" fill="#ffd98a"/><rect x="167" y="238" width="6" height="12" fill="#c9a86a"/><ellipse cx="170" cy="230" rx="8" ry="12" fill="#ffb85a" opacity=".35"/></g>' +
    '<ellipse cx="500" cy="320" rx="180" ry="70" fill="url(#hFire)"/>' +
    '<path d="M470 262 q-8 30 8 52 q-22 -4 -26 -26 q-12 22 6 44 l84 0 q18 -26 4 -48 q-6 18 -16 22 q10 -30 -12 -48 q4 22 -8 30 q2 -18 -12 -30 q4 16 -6 26 q-6 -12 -22 -22 Z" fill="#ff8a3a" opacity=".9"/>' +
    '<rect x="440" y="336" width="140" height="24" fill="#241a10"/>' +
    '<ellipse cx="320" cy="60" rx="60" ry="14" fill="#3a2c1a"/><g fill="#ffd98a"><circle cx="290" cy="74" r="4"/><circle cx="320" cy="78" r="4"/><circle cx="350" cy="74" r="4"/></g>' +
    '<ellipse cx="320" cy="345" rx="300" ry="26" fill="#241a10"/>');
}
/* 大厅(停电·烛光) */
function _bgHallDark() {
  return _svgBg(0,
    '<rect width="640" height="360" fill="#07090f"/>' +
    '<g opacity=".5"><rect x="430" y="60" width="150" height="170" rx="6" fill="#0d1428" stroke="#1a2030" stroke-width="8"/><line x1="505" y1="60" x2="505" y2="230" stroke="#1a2030" stroke-width="6"/></g>' +
    '<g opacity=".4"><rect x="40" y="70" width="120" height="150" rx="4" fill="#141008"/><rect x="205" y="120" width="180" height="150" rx="8" fill="#140f08"/></g>' +
    '<g><ellipse cx="130" cy="230" rx="90" ry="60" fill="#ffb85a" opacity=".12"/><circle cx="130" cy="252" r="5" fill="#ffd98a"/><rect x="126" y="257" width="8" height="16" fill="#c9a86a"/><ellipse cx="130" cy="246" rx="10" ry="16" fill="#ffb85a" opacity=".3"/></g>' +
    '<g><ellipse cx="420" cy="240" rx="70" ry="50" fill="#ffb85a" opacity=".1"/><circle cx="420" cy="256" r="4" fill="#ffd98a"/><rect x="417" y="260" width="6" height="13" fill="#c9a86a"/></g>' +
    '<g><ellipse cx="320" cy="200" rx="80" ry="55" fill="#ffd98a" opacity=".08"/><circle cx="320" cy="216" r="4.5" fill="#ffd98a"/><rect x="316" y="220" width="8" height="15" fill="#c9a86a"/></g>' +
    '<rect y="336" width="640" height="24" fill="#05060a"/>');
}
/* 书房 */
function _bgStudy() {
  var books = '';
  var cols = ['#8a4a3a','#3a5a8a','#4a7a4a','#8a7a3a','#6a4a8a','#a05a3a','#3a7a7a'];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) {
    books += '<rect x="' + (36 + c * 13 + (r % 2) * 4) + '" y="' + (74 + r * 24) + '" width="' + (8 + (c * 7 + r * 3) % 5) + '" height="20" fill="' + cols[(c + r * 3) % 7] + '" opacity=".85"/>';
  }
  return _svgBg(0,
    '<defs><linearGradient id="sW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1610"/><stop offset="1" stop-color="#0f0b07"/></linearGradient><linearGradient id="sWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1528"/><stop offset="1" stop-color="#1e2a4a"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#sW)"/>' +
    '<rect x="30" y="66" width="130" height="180" rx="4" fill="#241a10" stroke="#3a2c1a" stroke-width="5"/>' + books +
    '<rect x="30" y="94" width="130" height="5" fill="#3a2c1a"/><rect x="30" y="142" width="130" height="5" fill="#3a2c1a"/><rect x="30" y="190" width="130" height="5" fill="#3a2c1a"/><rect x="30" y="238" width="130" height="5" fill="#3a2c1a"/>' +
    '<rect x="430" y="50" width="160" height="180" rx="6" fill="url(#sWin)" stroke="#3a2c1a" stroke-width="9"/><line x1="510" y1="50" x2="510" y2="230" stroke="#3a2c1a" stroke-width="6"/>' +
    '<rect x="180" y="250" width="300" height="18" rx="5" fill="#4a3620"/>' +
    '<rect x="200" y="268" width="14" height="70" fill="#33240f"/><rect x="446" y="268" width="14" height="70" fill="#33240f"/>' +
    '<g><rect x="330" y="216" width="90" height="34" rx="5" fill="#5a3a22"/><rect x="336" y="222" width="78" height="8" rx="3" fill="#e8d8b0"/><circle cx="375" cy="239" r="4" fill="#d8b84a"/></g>' + // 桌上的药盒
    '<g><rect x="250" y="228" width="40" height="22" rx="3" fill="#e8e2d0"/><rect x="256" y="234" width="28" height="3" fill="#8a8a8a"/><rect x="256" y="240" width="20" height="3" fill="#aaa"/></g>' + // 纸
    '<g><path d="M470 258 L470 218 Q470 208 480 208 L490 208" stroke="#d8b84a" stroke-width="3" fill="none"/><ellipse cx="482" cy="214" rx="8" ry="7" fill="#ffd98a" opacity=".9"/><path d="M470 224 L560 258 L560 262 L470 240 Z" fill="#ffe8a0" opacity=".22"/><ellipse cx="530" cy="256" rx="52" ry="14" fill="#ffe8a0" opacity=".13"/></g>' + // 台灯
    '<rect x="205" y="252" width="70" height="14" rx="3" fill="#7a5a8a"/><rect x="285" y="252" width="8" height="14" fill="#5a4a3a"/>' + // 书
    '<ellipse cx="320" cy="345" rx="330" ry="24" fill="#0c0906"/><rect x="196" y="270" width="238" height="60" rx="6" fill="#3a2a16" opacity=".5"/>');
}
/* 走廊(烛光) */
function _bgCorridor() {
  return _svgBg(0,
    '<defs><linearGradient id="cF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#241a10"/><stop offset=".5" stop-color="#120d08"/><stop offset="1" stop-color="#241a10"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#cF)"/>' +
    '<path d="M120 60 L520 60 L470 320 L170 320 Z" fill="#0d0a06"/>' +
    '<path d="M120 60 L520 60 L470 320 L170 320 Z" fill="none" stroke="#3a2c1a" stroke-width="6"/>' +
    '<path d="M0 0 L120 60 L120 320 L0 360 Z" fill="#1c130a"/><path d="M640 0 L520 60 L520 320 L640 360 Z" fill="#1c130a"/>' +
    '<rect x="30" y="120" width="60" height="150" rx="4" fill="#241a10" stroke="#3a2c1a" stroke-width="4"/>' +
    '<rect x="550" y="120" width="60" height="150" rx="4" fill="#241a10" stroke="#3a2c1a" stroke-width="4"/>' +
    '<rect x="255" y="150" width="55" height="110" rx="4" fill="#171008" stroke="#2a1e12" stroke-width="4"/>' +
    '<rect x="330" y="150" width="55" height="110" rx="4" fill="#171008" stroke="#2a1e12" stroke-width="4"/>' +
    '<g><ellipse cx="320" cy="120" rx="60" ry="46" fill="#ffd98a" opacity=".13"/><circle cx="320" cy="130" r="5" fill="#ffd98a"/><rect x="316" y="136" width="8" height="14" fill="#8a7a5a"/></g>' +
    '<g><ellipse cx="185" cy="180" rx="44" ry="36" fill="#ffb85a" opacity=".1"/><circle cx="185" cy="190" r="4" fill="#ffd98a"/><rect x="182" y="194" width="6" height="11" fill="#8a7a5a"/></g>' +
    '<g><ellipse cx="455" cy="180" rx="44" ry="36" fill="#ffb85a" opacity=".1"/><circle cx="455" cy="190" r="4" fill="#ffd98a"/><rect x="452" y="194" width="6" height="11" fill="#8a7a5a"/></g>' +
    '<rect y="320" width="640" height="40" fill="#0a0704"/>');
}
/* 客房 */
function _bgRoom() {
  return _svgBg(0,
    '<defs><linearGradient id="rmW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1a2a"/><stop offset="1" stop-color="#100d18"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#rmW)"/>' +
    '<rect x="70" y="60" width="120" height="120" rx="5" fill="#141c38" stroke="#3a3450" stroke-width="7"/>' +
    '<rect x="300" y="90" width="130" height="110" rx="6" fill="#241e3a"/>' + // 窗帘画? 柜子
    '<rect x="310" y="100" width="110" height="8" rx="3" fill="#3a3450"/><rect x="310" y="120" width="110" height="8" rx="3" fill="#3a3450"/><rect x="310" y="140" width="110" height="8" rx="3" fill="#3a3450"/>' +
    '<circle cx="420" cy="115" r="7" fill="#c9a86a"/><circle cx="420" cy="135" r="7" fill="#8ac9c0"/><circle cx="420" cy="155" r="7" fill="#c98a9a"/>' +
    '<path d="M470 300 L470 190 Q470 170 500 168 L610 168 L640 190 L640 300 Z" fill="#2a2440"/>' + // 床
    '<rect x="470" y="168" width="170" height="30" rx="10" fill="#e8e2f0"/><rect x="480" y="150" width="60" height="34" rx="12" fill="#f4f0f8"/>' +
    '<rect x="452" y="300" width="188" height="26" rx="5" fill="#1c1830"/>' +
    '<g><ellipse cx="150" cy="250" rx="80" ry="60" fill="#ffd98a" opacity=".1"/><circle cx="150" cy="240" r="6" fill="#ffd98a"/><path d="M132 252 L168 252 L160 292 L140 292 Z" fill="#8a7a5a"/></g>' + // 床头灯
    '<rect y="322" width="640" height="38" fill="#0c0a14"/><path d="M40 322 L600 322" stroke="#241e3a" stroke-width="4"/>');
}
/* 储物间 */
function _bgPantry() {
  var jars = '';
  var jc = ['#8ac9c0','#c9a86a','#9a8ac9','#c98a6a','#7aa85a'];
  for (var i = 0; i < 9; i++) jars += '<rect x="' + (56 + i * 60) + '" y="96" width="30" height="40" rx="8" fill="' + jc[i % 5] + '" opacity=".8"/><rect x="' + (56 + i * 60) + '" y="90" width="30" height="9" rx="3" fill="#4a4030"/>';
  for (var j = 0; j < 7; j++) jars += '<rect x="' + (86 + j * 60) + '" y="196" width="34" height="36" rx="5" fill="' + jc[(j + 2) % 5] + '" opacity=".7"/>';
  return _svgBg(0,
    '<rect width="640" height="360" fill="#0c0a08"/>' +
    '<rect x="40" y="80" width="560" height="14" fill="#241c10"/><rect x="40" y="182" width="560" height="14" fill="#241c10"/><rect x="40" y="284" width="560" height="14" fill="#241c10"/>' +
    '<rect x="44" y="80" width="10" height="240" fill="#1c150c"/><rect x="586" y="80" width="10" height="240" fill="#1c150c"/>' + jars +
    '<g><ellipse cx="320" cy="150" rx="200" ry="130" fill="#ffe8a0" opacity=".07"/><line x1="320" y1="0" x2="320" y2="60" stroke="#3a3450" stroke-width="3"/><circle cx="320" cy="70" r="9" fill="#ffd98a"/><ellipse cx="320" cy="72" rx="13" ry="16" fill="#ffb85a" opacity=".4"/></g>' +
    '<rect y="320" width="640" height="40" fill="#080604"/>');
}
/* 阁楼 */
function _bgAttic() {
  return _svgBg(0,
    '<defs><linearGradient id="atW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2c1e"/><stop offset="1" stop-color="#1c130c"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#atW)"/>' +
    '<path d="M0 0 L640 0 L640 60 Q320 130 0 60 Z" fill="#241a10"/>' +
    '<path d="M240 30 L400 30 L430 130 L210 130 Z" fill="#ffe8b0" opacity=".25"/><rect x="250" y="40" width="140" height="80" rx="8" fill="#ffd9a0" opacity=".5" stroke="#5a4a30" stroke-width="6"/>' +
    '<path d="M250 44 L390 124 M390 44 L250 124" stroke="#5a4a30" stroke-width="5"/>' +
    '<path d="M210 130 L430 130 L560 360 L80 360 Z" fill="#ffe8b0" opacity=".07"/>' +
    '<rect x="60" y="240" width="130" height="90" rx="6" fill="#4a3620"/><rect x="60" y="270" width="130" height="8" fill="#33240f"/><rect x="118" y="236" width="14" height="8" fill="#33240f"/>' +
    '<rect x="470" y="220" width="120" height="110" rx="6" fill="#3a2c1e"/><circle cx="530" cy="262" r="26" fill="#241a10"/><path d="M520 252 q10 -14 20 0 q-10 16 -20 0" fill="#8a6a3a"/>' +
    '<rect x="250" y="300" width="150" height="40" rx="8" fill="#4a3620"/><rect x="270" y="312" width="110" height="6" fill="#c9a86a" opacity=".6"/>' +
    '<g opacity=".5"><circle cx="180" cy="200" r="2" fill="#ffe8b0"/><circle cx="300" cy="240" r="1.6" fill="#ffe8b0"/><circle cx="420" cy="190" r="2" fill="#ffe8b0"/><circle cx="500" cy="250" r="1.6" fill="#ffe8b0"/></g>' +
    '<rect y="330" width="640" height="30" fill="#140e08"/>');
}
/* 云隐村(清晨) */
function _bgVillage() {
  return _svgBg(0,
    '<defs><linearGradient id="vgS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ab0d8"/><stop offset=".6" stop-color="#ffd9a0"/><stop offset="1" stop-color="#f7e8c0"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#vgS)"/>' +
    '<circle cx="140" cy="90" r="26" fill="#fff2d0" opacity=".9"/>' +
    '<path d="M0 220 L140 90 L280 220 Z" fill="#5a7a8a" opacity=".8"/><path d="M120 220 L320 60 L540 220 Z" fill="#4a6a7a"/><path d="M420 220 L560 110 L700 220 Z" fill="#5a7a8a" opacity=".8"/>' +
    '<path d="M280 118 L320 60 L364 122 L344 118 L320 132 L296 116 Z" fill="#e8f2f8" opacity=".9"/>' +
    '<ellipse cx="180" cy="235" rx="220" ry="22" fill="#e8f0f0" opacity=".55"/><ellipse cx="480" cy="250" rx="240" ry="24" fill="#e8f0f0" opacity=".45"/>' +
    '<g><path d="M330 250 L330 200 L390 172 L450 200 L450 250 Z" fill="#6a5a44"/><path d="M318 204 L390 168 L462 204 Z" fill="#4a3a28"/><rect x="372" y="222" width="34" height="28" fill="#33261a"/><rect x="340" y="214" width="22" height="18" fill="#ffd98a"/></g>' +
    '<g><path d="M470 252 L470 214 L516 192 L562 214 L562 252 Z" fill="#5a4c38"/><path d="M460 218 L516 190 L572 218 Z" fill="#3e3222"/></g>' +
    '<rect x="80" y="236" width="480" height="10" fill="#7a6a50"/><rect y="246" width="640" height="114" fill="#8a7a5e"/>' +
    '<path d="M0 300 Q160 282 320 298 Q480 314 640 296 L640 360 L0 360 Z" fill="#6a9a5a" opacity=".9"/>' +
    '<g stroke="#4a3a28" stroke-width="4"><path d="M60 260 q4 -30 0 -48 M62 236 q-14 -6 -18 -20 M62 238 q14 -4 20 -18"/></g>' +
    '<path d="M540 260 q2 -36 -2 -56 M538 232 q-16 -8 -20 -24 M538 234 q16 -6 22 -22" stroke="#4a3a28" stroke-width="4" fill="none"/>');
}
/* 溶洞暗河 */
function _bgCave() {
  return _svgBg(0,
    '<defs><linearGradient id="cvW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e18"/><stop offset="1" stop-color="#05070d"/></linearGradient><linearGradient id="cvW2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a4a"/><stop offset="1" stop-color="#0d4a7a"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#cvW)"/>' +
    '<path d="M0 0 L640 0 L640 60 Q560 150 480 70 Q420 130 340 60 Q260 140 180 66 Q90 140 0 70 Z" fill="#04060a"/>' +
    '<path d="M80 40 q10 60 -6 96 M160 30 q16 70 -4 120 M260 20 q-8 66 8 108 M360 26 q12 60 -6 100 M470 34 q-14 70 4 116 M570 44 q10 56 -6 92" stroke="#101828" stroke-width="14" fill="none" stroke-linecap="round"/>' +
    '<g fill="#1a2438"><path d="M0 250 Q80 200 180 240 Q260 270 340 235 Q440 200 520 240 Q590 268 640 245 L640 300 L0 300 Z"/></g>' +
    '<rect y="290" width="640" height="70" fill="url(#cvW2)"/>' +
    '<path d="M40 320 q60 -8 120 0 M300 330 q80 -10 160 0 M520 322 q50 -6 100 2" stroke="#4ac8f0" stroke-width="2.5" fill="none" opacity=".5"/>' +
    '<g fill="#4ad8e8"><circle cx="120" cy="255" r="3" opacity=".8"/><circle cx="140" cy="263" r="2" opacity=".6"/><circle cx="420" cy="250" r="3" opacity=".8"/><circle cx="445" cy="258" r="2" opacity=".6"/><circle cx="580" cy="248" r="2.5" opacity=".7"/></g>' +
    '<g fill="#2a8a9a"><ellipse cx="125" cy="262" rx="9" ry="14" opacity=".5"/><ellipse cx="428" cy="257" rx="9" ry="14" opacity=".5"/><ellipse cx="583" cy="255" rx="7" ry="12" opacity=".5"/></g>' +
    '<ellipse cx="320" cy="140" rx="230" ry="70" fill="#3ac8ff" opacity=".05"/>');
}
/* 沉钟外城 */
function _bgCity() {
  return _svgBg(0,
    '<defs><linearGradient id="ctS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04101e"/><stop offset="1" stop-color="#0a2030"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#ctS)"/>' +
    '<ellipse cx="320" cy="90" rx="90" ry="60" fill="#1a4a5a" opacity=".35"/>' +
    '<path d="M240 70 Q320 30 400 70 L400 250 L240 250 Z" fill="#0c1c28" opacity=".9"/>' + // 远处钟楼剪影
    '<path d="M255 100 L385 100 L385 190 Q320 210 255 190 Z" fill="#12283a"/>' +
    '<ellipse cx="320" cy="150" rx="58" ry="66" fill="#1a3a4c"/>' +
    '<ellipse cx="320" cy="150" rx="58" ry="66" fill="none" stroke="#2a6a7a" stroke-width="4" opacity=".7"/>' +
    '<g stroke="#12303e" stroke-width="3"><line x1="262" y1="130" x2="378" y2="130"/><line x1="262" y1="172" x2="378" y2="172"/></g>' +
    '<g fill="#0e2230"><path d="M20 250 L60 150 L100 250 Z"/><path d="M90 250 L140 170 L190 250 Z"/><path d="M460 250 L510 160 L560 250 Z"/><path d="M540 250 L580 180 L620 250 Z"/></g>' +
    '<g stroke="#1a3a48" stroke-width="8" fill="none"><path d="M40 250 L40 180 M100 250 L100 190"/><path d="M480 250 L480 185 M545 250 L545 195"/></g>' + // 残柱
    '<rect y="250" width="640" height="110" fill="#081822"/>' +
    '<path d="M30 300 L150 300 M200 320 L330 320 M380 305 L520 305 M560 318 L620 318" stroke="#1a4a5c" stroke-width="5" opacity=".7"/>' +
    '<g fill="#4ae8d8"><circle cx="70" cy="280" r="4" opacity=".9"/><circle cx="88" cy="290" r="2.5" opacity=".6"/><circle cx="250" cy="300" r="4" opacity=".9"/><circle cx="268" cy="310" r="2.5" opacity=".6"/><circle cx="470" cy="285" r="4" opacity=".9"/><circle cx="452" cy="295" r="2.5" opacity=".6"/><circle cx="600" cy="300" r="3.5" opacity=".8"/></g>' +
    '<g fill="#3ac8b8" opacity=".5"><ellipse cx="76" cy="288" rx="8" ry="5"/><ellipse cx="256" cy="308" rx="8" ry="5"/><ellipse cx="466" cy="293" rx="8" ry="5"/></g>' +
    '<ellipse cx="320" cy="200" rx="280" ry="120" fill="#3ac8ff" opacity=".04"/>');
}
/* 钟楼之心 */
function _bgTower() {
  return _svgBg(0,
    '<defs><linearGradient id="twS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1408"/><stop offset="1" stop-color="#0a0804"/></linearGradient><linearGradient id="twB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a2a"/><stop offset=".5" stop-color="#d8b050"/><stop offset="1" stop-color="#7a5a22"/></linearGradient><linearGradient id="twR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0" stop-opacity=".28"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#twS)"/>' +
    '<path d="M180 0 L460 0 L440 40 L200 40 Z" fill="#2a2010"/>' +
    '<path d="M200 40 L440 40 L420 90 L220 90 Z" fill="#ffe8b0" opacity=".12"/>' +
    '<path d="M230 90 L410 90 L300 130 L340 130 Z" fill="#ffe8b0" opacity=".1"/>' +
    '<g><path d="M320 96 L320 150" stroke="#5a4a22" stroke-width="10"/>' +
    '<path d="M238 150 Q320 128 402 150 L430 260 Q320 300 210 260 Z" fill="url(#twB)"/>' +
    '<ellipse cx="320" cy="150" rx="82" ry="24" fill="#e8c868"/>' +
    '<ellipse cx="320" cy="150" rx="82" ry="24" fill="none" stroke="#8a6a2a" stroke-width="4"/>' +
    '<g stroke="#8a6a2a" stroke-width="3" opacity=".8"><path d="M250 190 Q320 210 390 190"/><path d="M245 220 Q320 244 395 220"/></g>' +
    '<g fill="#5a4a1a" opacity=".9"><circle cx="285" cy="205" r="6"/><circle cx="352" cy="228" r="6"/><path d="M312 176 l10 8 -10 8 -10 -8 Z"/></g>' +
    '<circle cx="320" cy="282" r="8" fill="#4a3a16"/></g>' +
    '<path d="M0 360 L0 200 Q120 150 240 210 L240 360 Z" fill="#100c06" opacity=".85"/><path d="M640 360 L640 210 Q520 160 400 215 L400 360 Z" fill="#100c06" opacity=".85"/>' +
    '<g fill="#6ae8ff" opacity=".8"><path d="M110 330 l10 -22 10 22 l-10 12 Z"/><path d="M140 344 l7 -16 7 16 l-7 9 Z"/><path d="M520 336 l9 -20 9 20 l-9 11 Z"/><path d="M496 350 l6 -13 6 13 l-6 8 Z"/></g>' +
    '<path d="M200 90 L440 90 L470 0 L170 0 Z" fill="url(#twR)"/>' +
    '<g fill="#ffe8b0" opacity=".7"><circle cx="260" cy="200" r="1.6"/><circle cx="300" cy="250" r="1.4"/><circle cx="360" cy="180" r="1.6"/><circle cx="400" cy="240" r="1.4"/><circle cx="240" cy="280" r="1.4"/></g>');
}
/* 黎明/雨停 */
function _bgSunrise() {
  return _svgBg(0,
    '<defs><linearGradient id="srS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4f8a"/><stop offset=".5" stop-color="#c97a6a"/><stop offset=".78" stop-color="#ffb36a"/><stop offset="1" stop-color="#ffe0a0"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="url(#srS)"/>' +
    '<circle cx="320" cy="252" r="46" fill="#fff0c0"/>' +
    '<circle cx="320" cy="252" r="70" fill="#ffe0a0" opacity=".4"/><circle cx="320" cy="252" r="100" fill="#ffe0a0" opacity=".2"/>' +
    '<g stroke="#2a3350" stroke-width="2.5" fill="none" opacity=".8"><path d="M120 90 q14 -10 28 0 q14 -10 28 0"/><path d="M440 70 q12 -8 24 0 q12 -8 24 0"/></g>' +
    '<path d="M0 262 L120 190 L240 262 Z" fill="#4a3a5a"/><path d="M400 262 L520 180 L660 262 Z" fill="#43355a"/>' +
    '<rect y="262" width="640" height="98" fill="#2a2440"/>' +
    '<path d="M0 300 Q200 276 400 296 Q540 310 640 296 L640 360 L0 360 Z" fill="#1e1a30"/>' +
    '<ellipse cx="320" cy="280" rx="180" ry="20" fill="#ffe0a0" opacity=".18"/>');
}
function _bgBlack() { return _svgBg(0, '<rect width="640" height="360" fill="#04040a"/>'); }

/* 导出 */
window.ART = { charSVG: charSVG, bgSVG: bgSVG };

/* ============================================================
   照片立绘系统（覆盖上方同名手绘函数；换照片只需替换 assets 下
   对应的 *_cut.png，或用「人物抠图.py」一键生成）
   ============================================================ */
function _photoChar(file, glow, extra) {
  var gid = 'pglow' + file.replace(/[^a-z0-9]/gi, '');
  return _svgWrap(
    '<defs><radialGradient id="' + gid + '" cx=".5" cy=".4" r=".6">' +
    '<stop offset="0" stop-color="' + glow + '" stop-opacity=".3"/>' +
    '<stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient></defs>' +
    '<ellipse cx="100" cy="126" rx="98" ry="118" fill="url(#' + gid + ')"/>' +
    '<image href="' + file + '" x="0" y="0" width="200" height="262" preserveAspectRatio="xMidYMax meet"/>' +
    (extra || '')
  );
}
/* 团子贴纸（小智智专属） */
var _TUANZI = '<g transform="translate(174,142) scale(.85)">' +
  '<ellipse cx="0" cy="7" rx="15" ry="11" fill="#f7ecd8" stroke="#b8935f" stroke-width="2"/>' +
  '<circle cx="0" cy="-7" r="10" fill="#f7ecd8" stroke="#b8935f" stroke-width="2"/>' +
  '<ellipse cx="-5.5" cy="-19" rx="3.2" ry="8.5" fill="#f7ecd8" stroke="#b8935f" stroke-width="2" transform="rotate(-14 -5.5 -19)"/>' +
  '<ellipse cx="5.5" cy="-19" rx="3.2" ry="8.5" fill="#f7ecd8" stroke="#b8935f" stroke-width="2" transform="rotate(14 5.5 -19)"/>' +
  '<ellipse cx="-5.5" cy="-19.5" rx="1.4" ry="5" fill="#ffb9c8" transform="rotate(-14 -5.5 -19.5)"/>' +
  '<ellipse cx="5.5" cy="-19.5" rx="1.4" ry="5" fill="#ffb9c8" transform="rotate(14 5.5 -19.5)"/>' +
  '<circle cx="-3.2" cy="-8" r="1.4" fill="#5a4a3a"/><circle cx="3.2" cy="-8" r="1.4" fill="#5a4a3a"/>' +
  '<path d="M -1.5 -4 Q 0 -2.8 1.5 -4" fill="none" stroke="#5a4a3a" stroke-width="1" stroke-linecap="round"/></g>';

function _bin() { return _photoChar('assets/bin_cut.png', '#5a7cff'); }       // 彬少：吴彦祖
function _wang() { return _photoChar('assets/wang_cut.png', '#ff5a5a'); }     // 王雪
function _bo() { return _photoChar('assets/bo_cut.png', '#4ac97a'); }         // 大聪明博文
function _yan() { return _photoChar('assets/yan_cut.png', '#ff9ec7'); }       // 严妹妹
function _xuetong() { return _photoChar('assets/xuetong_cut.png', '#6ab0ff'); } // 薛童
function _wei() { return _photoChar('assets/wei_cut.png', '#8a8fd0'); }       // 伟哥：滑雪盔
function _liushuai() { return _photoChar('assets/liushuai_cut.png', '#ffd76a'); } // 刘帅：拿着手机撩骚中
function _zhi() { return _photoChar('assets/zhi_cut.png', '#ffd45e', _TUANZI); } // 小智智 + 团子

/* ---------- 新角色手绘立绘 ---------- */
/* 小骚远：爱撩骚 · 紫 · 眨眼放电 */
function _xiaoyuan() {
  var skin = '#ffe0d0';
  return _svgWrap(
    '<defs><linearGradient id="xyJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4ad0"/><stop offset="1" stop-color="#5a2a8a"/></linearGradient></defs>' +
    '<path d="M60 140 Q100 122 140 140 L152 262 L48 262 Z" fill="url(#xyJ)"/>' +
    '<path d="M86 132 L100 152 L114 132 L110 128 L100 140 L90 128 Z" fill="#2a2438"/>' +
    '<circle cx="100" cy="168" r="3" fill="#ffd76a"/><path d="M91 178 h18 M94 185 h12" stroke="#ffd76a" stroke-width="2"/>' +
    '<rect x="93" y="118" width="14" height="18" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M62 78 Q58 30 100 28 Q142 30 138 78 Q134 50 112 44 Q118 58 112 64 Q98 40 76 50 Q64 58 62 78 Z" fill="#3a2a3a"/>' +
    '<path d="M92 30 q10 -8 18 -2 l-6 9 Z" fill="#ff7fb2"/>' +
    '<ellipse cx="86" cy="84" rx="7" ry="8.5" fill="#fff"/><circle cx="86" cy="85" r="4.4" fill="#7a3ac0"/><circle cx="87.6" cy="83.2" r="1.6" fill="#fff"/>' +
    '<path d="M78 76 Q86 72 94 76" fill="none" stroke="#3a2a3a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M109 83 q7 -5 15 0" fill="none" stroke="#3a2a3a" stroke-width="2.6" stroke-linecap="round"/>' +
    _mouth(100, 106, 'smile') + _blush(100, 98, '#ff9ec7', .4) +
    '<circle cx="141" cy="50" r="3.5" fill="#ff5a8a"/><circle cx="148" cy="50" r="3.5" fill="#ff5a8a"/><path d="M137.5 52.5 L144.5 61 L151.5 52.5 Z" fill="#ff5a8a"/>'
  );
}
/* 刘帅的照片立绘已统一由「照片立绘系统」提供（金发色晕） */
/* 大翔：NPC 傻乎乎 · 橙反光背心 · 呆萌歪头 */
function _daxiang() {
  var skin = '#ffe0c2';
  return _svgWrap(
    '<defs><linearGradient id="dxJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a4a"/><stop offset="1" stop-color="#d97a2a"/></linearGradient></defs>' +
    '<g transform="rotate(5 100 150)">' +
    '<path d="M58 142 Q100 124 142 142 L154 262 L46 262 Z" fill="url(#dxJ)"/>' +
    '<path d="M78 142 L84 262 M116 262 L122 142" stroke="#8a4a1a" stroke-width="4"/>' +
    '<rect x="70" y="180" width="58" height="9" fill="#ffe8a0" opacity=".85"/>' +
    '<rect x="72" y="216" width="54" height="9" fill="#ffe8a0" opacity=".85"/>' +
    '<rect x="94" y="120" width="13" height="17" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M62 78 Q58 32 100 28 Q142 32 138 78 Q136 54 122 46 L124 58 Q108 40 88 48 L90 58 Q70 50 62 78 Z" fill="#4a3520"/>' +
    '<path d="M94 30 l4 -12 6 11 M112 32 l6 -10 3 12" fill="none" stroke="#4a3520" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="84" cy="84" rx="8.5" ry="10" fill="#fff"/><circle cx="85" cy="85" r="5" fill="#5a3a1a"/><circle cx="87" cy="83" r="1.8" fill="#fff"/>' +
    '<ellipse cx="117" cy="86" rx="5" ry="6" fill="#fff"/><circle cx="116" cy="87" r="3" fill="#5a3a1a"/>' +
    '<path d="M76 74 Q84 70 92 73" fill="none" stroke="#4a3520" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M109 76 q7 -4 13 0" fill="none" stroke="#4a3520" stroke-width="2.4" stroke-linecap="round"/>' +
    _mouth(102, 107, 'open') + _blush(100, 100, '#ffb9a0', .5) +
    '</g>'
  );
}
/* 二玉：小南娘 · 粉 · 波波头小花 */
function _eryu() {
  var skin = '#fff0e6';
  return _svgWrap(
    '<defs><linearGradient id="eyJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc4d4"/><stop offset="1" stop-color="#e88aaa"/></linearGradient></defs>' +
    '<path d="M40 96 Q30 190 46 250 L62 250 Q52 180 60 104 Z" fill="#6a4a3a"/>' +
    '<path d="M160 96 Q170 190 154 250 L138 250 Q148 180 140 104 Z" fill="#6a4a3a"/>' +
    '<path d="M62 144 Q100 128 138 144 L148 262 L52 262 Z" fill="url(#eyJ)"/>' +
    '<path d="M88 138 Q100 150 112 138 L108 134 Q100 142 92 134 Z" fill="#fff4f6"/>' +
    '<rect x="93" y="122" width="14" height="16" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="84" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M60 88 Q56 34 100 32 Q144 34 140 88 L132 92 Q136 58 100 54 Q64 58 68 92 Z" fill="#6a4a3a"/>' +
    '<path d="M64 84 Q60 140 66 168 Q56 128 58 90 Z" fill="#6a4a3a"/>' +
    '<path d="M136 84 Q140 140 134 168 Q144 128 142 90 Z" fill="#6a4a3a"/>' +
    '<g><circle cx="128" cy="66" r="4.5" fill="#ff9ec7"/><circle cx="136" cy="72" r="4.5" fill="#ffcf5e"/><circle cx="133" cy="80" r="4.5" fill="#ff9ec7"/><circle cx="122" cy="80" r="4.5" fill="#fff"/><circle cx="125" cy="70" r="4.5" fill="#ff7fb2"/><circle cx="129" cy="73" r="2.4" fill="#ffe8f0"/></g>' +
    _eyes(100, 88, { iris: '#7a4a3a', ry: 10, skin: skin, browArc: 6, browTilt: 4 }) +
    _blush(100, 102, '#ffb3c8', .75) +
    _mouth(100, 110, 'smileS')
  );
}
/* 江森：rapper · 青 · 反戴帽金链 */
function _jiangsen() {
  var skin = '#e8c8a0';
  return _svgWrap(
    '<defs><linearGradient id="jsJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e9a8a"/><stop offset="1" stop-color="#175a50"/></linearGradient></defs>' +
    '<path d="M58 140 Q100 122 142 140 L154 262 L46 262 Z" fill="url(#jsJ)"/>' +
    '<path d="M86 132 L100 152 L114 132 L110 128 L100 140 L90 128 Z" fill="#f4f7ee"/>' +
    '<path d="M78 138 Q100 158 122 138 L118 152 Q100 166 82 152 Z" fill="none"/>' +
    '<path d="M80 140 Q100 158 120 140" fill="none" stroke="#ffd76a" stroke-width="3"/><circle cx="90" cy="150" r="2.6" fill="#ffd76a"/><circle cx="100" cy="154" r="2.6" fill="#ffd76a"/><circle cx="110" cy="150" r="2.6" fill="#ffd76a"/>' +
    '<path d="M70 128 Q100 148 130 128" stroke="#16182a" stroke-width="5" fill="none"/>' +
    '<rect x="62" y="122" width="13" height="18" rx="5" fill="#16182a"/><rect x="125" y="122" width="13" height="18" rx="5" fill="#16182a"/>' +
    '<rect x="93" y="116" width="14" height="18" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="100" cy="80" rx="38" ry="42" fill="' + skin + '"/>' +
    '<path d="M60 70 Q60 30 100 28 Q140 30 140 70 L140 78 L60 78 Z" fill="#176a5e"/>' + // 反戴帽
    '<rect x="60" y="62" width="80" height="10" rx="5" fill="#1e8a7a"/>' +
    '<rect x="128" y="48" width="20" height="13" rx="4" fill="#175a50"/>' + // 后帽檐
    '<path d="M64 46 L58 34 M136 46 L142 34 M100 30 L100 20" stroke="#176a5e" stroke-width="3"/>' +
    _eyes(100, 86, { iris: '#2a2a3a', skin: skin, browTilt: -5, browArc: 3 }) +
    _mouth(100, 106, 'grin') +
    '<g transform="translate(146,196) rotate(-18)"><rect x="-4" y="-26" width="8" height="30" rx="4" fill="#333"/><circle cx="0" cy="-30" r="8" fill="#444"/><circle cx="0" cy="-30" r="5" fill="#16182a"/></g>'
  );
}
