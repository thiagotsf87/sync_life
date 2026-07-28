// A Bússola da Vida 3D — montagem + controle da agulha.
// Fonte de verdade: design_handoff_marca_3d/marca-3d.html + README (comportamento §Interactions):
// transição .52s easing assinatura; overshoot em duas etapas (alvo+9°, assenta após 330ms);
// rotateX(16deg) durante o trajeto (.busy); marcação de destino acende 260ms após o início.
// Diferença deliberada: a rotação é acumulada por caminho-mais-curto (315°→0° não dá a volta longa)
// e o overshoot segue o sentido do movimento.
window.SLBussola3D = (function () {
  var TPL = '<div class="rim"></div><div class="dial"><div class="nsh" aria-hidden="true"><i></i></div>' +
    '<svg class="tk" viewBox="0 0 200 200" aria-hidden="true"></svg>' +
    '<div class="nd"><span class="nh"></span><span class="sh"></span></div><div class="pv"></div></div>' +
    '<div class="gl"></div><div class="sw"></div>';

  function buildTicks(svg) {
    var h = '', j, i;
    for (j = 0; j < 24; j++) {
      if (j % 3 === 0) continue;
      h += '<g transform="rotate(' + j * 15 + ' 100 100)"><line class="mn" x1="100" y1="17" x2="100" y2="25"></line></g>';
    }
    for (i = 0; i < 8; i++) {
      h += '<g class="t" data-i="' + i + '" transform="rotate(' + i * 45 + ' 100 100)">' +
        '<line class="d" x1="100" y1="13" x2="100" y2="31.6"></line>' +
        '<line class="l" x1="100" y1="14.3" x2="100" y2="30.4"></line></g>';
    }
    svg.innerHTML = h;
  }

  // Degradação por tamanho (thresholds do README: 54 / 34 / 22px)
  function mount(el) {
    el.innerHTML = TPL;
    var svg = el.querySelector('.tk');
    buildTicks(svg);
    var sz = el.getBoundingClientRect().width || parseFloat(el.style.getPropertyValue('--sz')) || 0;
    if (!sz) return el;
    if (sz <= 22) el.classList.add('s-sm', 's-xs'); else if (sz <= 54) el.classList.add('s-sm');
    if (sz < 54) el.querySelectorAll('.mn').forEach(function (n) { n.remove(); });
    el.querySelectorAll('.t').forEach(function (g) {
      var i = +g.getAttribute('data-i');
      if (sz <= 22 ? i !== 0 : (sz < 34 && i % 2)) g.remove();
    });
    return el;
  }

  // Controlador de uma peça: point(i) com overshoot/lit, glance(i)/unglance() pra hover.
  function control(el, opts) {
    var reduce = !!(opts && opts.reduce);
    var rot = 0, cur = 0, timers = [];
    function litTick(i) {
      el.querySelectorAll('.tk .t').forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-i') === i); });
    }
    function targetOf(i) {
      var norm = ((rot % 360) + 360) % 360;
      return rot + ((i * 45 - norm + 540) % 360) - 180;
    }
    function point(i) {
      var tgt = targetOf(i), delta = tgt - rot;
      cur = i; rot = tgt;
      timers.forEach(clearTimeout); timers = [];
      if (reduce) { el.style.setProperty('--rot', tgt + 'deg'); litTick(i); return; }
      el.classList.add('busy');
      el.style.setProperty('--rot', (tgt + (delta >= 0 ? 9 : -9)) + 'deg');
      timers.push(setTimeout(function () { el.style.setProperty('--rot', tgt + 'deg'); el.classList.remove('busy'); }, 330));
      timers.push(setTimeout(function () { litTick(i); }, 260));
    }
    function glance(i) { el.style.setProperty('--rot', targetOf(i) + 'deg'); } // olha sem assentar
    function unglance() { el.style.setProperty('--rot', rot + 'deg'); }
    litTick(0);
    return { point: point, glance: glance, unglance: unglance, index: function () { return cur; } };
  }

  return { mount: mount, control: control, buildTicks: buildTicks };
})();
