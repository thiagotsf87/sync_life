// A Bússola da Vida — SVG mestre + controlador (§5 do DESIGN-SYSTEM-v5.md).
// Ordem canônica das áreas (§5.2, LEI): 01 Finanças no norte, sentido horário até 08 Experiências.
// Geometria copiada 1:1 de prototypes/poc-v5/r6-estudio/marca-bussola.html.
window.SLBussola = (function () {
  var AREAS = [
    ['01', 'Finanças', 'segurar o lazer até sexta'],
    ['02', 'Futuro', 'antecipar o aporte da Itália'],
    ['03', 'Tempo', 'proteger o bloco de foco de amanhã'],
    ['04', 'Corpo', 'hoje é dia de treino, 3 de 7 na semana'],
    ['05', 'Mente', '20 minutos de leitura antes de dormir'],
    ['06', 'Patrimônio', 'reinvestir os proventos de julho'],
    ['07', 'Carreira', 'preparar a 1:1 de terça'],
    ['08', 'Experiências', 'fechar o roteiro de Positano']
  ];

  // Ticks da versão padrão (viewBox 64): [x1,y1,x2,y2] do norte em sentido horário.
  var TICKS64 = [
    [32, 8.5, 32, 12.5], [48.6, 15.4, 45.8, 18.2], [55.5, 32, 51.5, 32], [48.6, 48.6, 45.8, 45.8],
    [32, 55.5, 32, 51.5], [15.4, 48.6, 18.2, 45.8], [8.5, 32, 12.5, 32], [15.4, 15.4, 18.2, 18.2]
  ];

  function ticksMarkup(sw, onIndex) {
    return TICKS64.map(function (t, i) {
      var on = i === onIndex;
      return '<line class="tick' + (on ? ' on' : '') + '" x1="' + t[0] + '" y1="' + t[1] + '" x2="' + t[2] + '" y2="' + t[3] +
        '" stroke-width="' + sw + '" stroke-linecap="round"' + (on ? '' : ' opacity=".8"') + '/>';
    }).join('');
  }

  // Versão padrão (aro + 8 marcações + agulha + pivô), pronta pra receber live().
  function padrao(size, opts) {
    opts = opts || {};
    return '<svg class="sym' + (opts.cls ? ' ' + opts.cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 64 64"' + (opts.attrs || '') + '>' +
      '<circle class="ringc" cx="32" cy="32" r="25.5" fill="none" stroke-width=".6" opacity=".35"/>' +
      '<g class="ticks">' + ticksMarkup(2, opts.onIndex == null ? 0 : opts.onIndex) + '</g>' +
      '<g class="point"><g class="needle">' +
      '<polygon class="acf" points="32,10 36.5,32 27.5,32"/>' +
      '<polygon class="fgf" points="32,53 27.5,32 36.5,32" opacity=".28"/>' +
      '<circle class="pivot" cx="32" cy="32" r="2.6"/>' +
      '</g></g></svg>';
  }

  // Controlador da bússola viva: agulha por caminho mais curto acumulado + tick aceso.
  // root = <svg> contendo um .point e os .tick na ordem canônica.
  function live(root) {
    var point = root.querySelector('.point');
    var ticks = [].slice.call(root.querySelectorAll('.tick'));
    var cur = 0, rot = 0;
    function setArea(i) {
      var norm = ((rot % 360) + 360) % 360;
      rot += ((i * 45 - norm + 540) % 360) - 180; // caminho mais curto, sem volta longa
      cur = i;
      if (point) point.style.setProperty('--rot', rot + 'deg');
      ticks.forEach(function (t, j) { t.classList.toggle('on', j === i); });
    }
    return { setArea: setArea, index: function () { return cur; } };
  }

  return { AREAS: AREAS, TICKS64: TICKS64, padrao: padrao, live: live };
})();
