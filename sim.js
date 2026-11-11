// 前一局 的规矩（跟 ../前一局.py 第五版一字一字对：test/对.js）
var QYJ = (function () {
  var NIGHT = 30, FIRE0 = 11, LOG = 4, WOOD0 = 5, END = 4, MAXN = 3;
  var WIDE = { 0: 9, 2: 2, 4: 9 };
  var NUM = ['①', '②', '③'];
  var OK = { '东': 1, '西': 1, '拿': 1, '放': 1, '等': 1 };
  function cap(c) { return WIDE[c] || 1; }

  // scripts: 前几夜的你真做了的（eff），最后一串是这一夜你敲的。
  // 回：每一步一个 {t, fire, pos, hold, ev}，加 cold、wood、eff
  function night(scripts) {
    var n = scripts.length;
    var pos = [], hold = [], ptr = [];
    for (var i = 0; i < n; i++) { pos.push(0); hold.push(false); ptr.push(0); }
    var fire = FIRE0, wood = WOOD0, cold = 0, wasOut = false;
    var names = [];
    for (i = 0; i < n - 1; i++) names.push(NUM[i]);
    names.push('你');
    var eff = [], steps = [];
    var mine = scripts[n - 1];
    for (var t = 1; t <= NIGHT; t++) {
      var ev = [];
      var lit = fire > 0;
      if (fire > 0) fire -= 1;
      for (i = 0; i < n; i++) {
        var me = (i === n - 1);
        var sc = scripts[i];
        var act = ptr[i] >= sc.length ? '等' : sc[ptr[i]];
        if (me && act !== '东' && act !== '西') eff.push(OK[act] ? act : '等');
        if (!OK[act]) { ptr[i] += 1; continue; }
        if (act === '东' || act === '西') {
          var to = pos[i] + (act === '东' ? 1 : -1);
          if (to < 0 || to > END) {
            if (me) { ev.push('你往' + act + '走不过去了'); eff.push('等'); }
            ptr[i] += 1; continue;
          }
          var here = 0, who = '';
          for (var j = 0; j < n; j++) if (pos[j] === to) { here++; who += names[j]; }
          if (here >= cap(to)) {
            if (me) { ev.push('你被' + who + '挡住了，没走成'); ptr[i] += 1; eff.push('等'); }
            else ev.push(names[i] + '被' + who + '挡住，站着等');
            continue;
          }
          pos[i] = to; ptr[i] += 1;
          if (me) eff.push(act);
        } else if (act === '拿') {
          ptr[i] += 1;
          if (pos[i] !== END) { if (me) ev.push('这里没有柴可拿'); continue; }
          if (hold[i]) { if (me) ev.push('你手里已经有一根了，拿不动第二根'); continue; }
          if (wood > 0) { wood -= 1; hold[i] = true; ev.push(names[i] + '抱起一根柴（棚里还剩 ' + wood + ' 根）'); }
          else ev.push(names[i] + '到了柴棚，柴没了，空着手');
        } else if (act === '放') {
          ptr[i] += 1;
          if (pos[i] !== 0) { if (me) ev.push('这里没有炉子'); continue; }
          if (hold[i]) {
            hold[i] = false; fire += LOG;
            ev.push(names[i] + '往炉子里塞了一根柴');
            if (wasOut) { ev.push('火又着起来了'); wasOut = false; }
          } else ev.push(names[i] + '在炉子跟前蹲下，手里是空的');
        } else {
          ptr[i] += 1;
        }
      }
      if (fire === 0) {
        cold += 1;
        if (lit) { ev.push('火灭了。妹妹往被子里缩了缩'); wasOut = true; }
        else ev.push('冷');
      }
      steps.push({ t: t, fire: fire, pos: pos.slice(), hold: hold.slice(), ev: ev, names: names });
    }
    return { steps: steps, cold: cold, wood: wood, eff: eff };
  }

  function sister(cold) {
    if (cold === 0) return '妹妹一夜没醒。';
    if (cold <= 4) return '妹妹早上说半夜有一会儿脚凉。';
    if (cold <= 10) return '妹妹醒了，缩成一团，脸冰凉。';
    return '妹妹醒了，嘴唇发紫，抱着你不撒手。';
  }

  return { night: night, sister: sister, NIGHT: NIGHT, FIRE0: FIRE0, WOOD0: WOOD0, END: END, MAXN: MAXN, NUM: NUM };
})();
if (typeof module !== 'undefined') module.exports = QYJ;
