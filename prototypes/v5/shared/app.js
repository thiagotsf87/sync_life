// SyncLife DS v5 — boot das telas de app (Onda 2+). Requer mock-data.js antes.
// SLApp.boot(): gate .anim (reduce = página estática), reveals IO, count-up, camada do coach, check-in.
window.SLApp = (function () {
  function boot() {
    if (boot._done) return;
    boot._done = true;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) document.documentElement.classList.add('anim');

    // reveals
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.rv, .draw').forEach(function (el) { io.observe(el); });

    // count-up (respeita NBSP via data-prefix; com reduce não roda, HTML já tem o valor final)
    if (!reduce) {
      var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          cio.unobserve(en.target);
          var el = en.target, target = parseInt(el.getAttribute('data-cnt'), 10);
          var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
          var t0 = performance.now(), dur = 1100;
          (function tick(now) {
            var p = Math.min(1, (now - t0) / dur);
            el.textContent = pre + Math.round(target * ease(p)).toLocaleString('pt-BR') + suf;
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        });
      }, { threshold: .5 });
      document.querySelectorAll('[data-cnt]').forEach(function (el) { cio.observe(el); });
    }

    // ── camada do coach ──
    var camada = document.querySelector('.camada'), scrim = document.querySelector('.scrim');
    if (camada && scrim) {
      var empty = camada.querySelector('.cempty');   // saudação + chips
      var thread = camada.querySelector('.cthread'); // conversa mock (hidden por padrão)
      function open(seed) {
        camada.classList.add('open'); scrim.classList.add('open');
        var inp = camada.querySelector('.cask input');
        if (inp) { inp.value = seed || ''; if (!camada.classList.contains('sheet')) inp.focus({ preventScroll: true }); }
      }
      function close() { camada.classList.remove('open'); scrim.classList.remove('open'); }
      function play() { // chip ou envio: mostra a conversa mock no lugar do estado vazio
        if (empty) empty.hidden = true;
        if (thread) thread.hidden = false;
        var cb = camada.querySelector('.cbody'); if (cb) cb.scrollTop = cb.scrollHeight;
      }
      document.querySelectorAll('[data-coach-open]').forEach(function (el) {
        el.addEventListener('click', function () { open(el.getAttribute('data-coach-seed') || ''); });
      });
      camada.querySelectorAll('.csug .chip').forEach(function (ch) {
        ch.addEventListener('click', play);
      });
      var ask = camada.querySelector('.cask');
      if (ask) ask.addEventListener('submit', function (e) { e.preventDefault(); play(); });
      var x = camada.querySelector('.chead .x');
      if (x) x.addEventListener('click', close);
      scrim.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && camada.classList.contains('open')) close(); });
    }

    // ── sheet de Áreas (bottom bar mobile, Fase 1; promovido na Fase 2) ──
    // Idempotente: páginas que ainda trazem o mesmo wiring inline continuam funcionando.
    var sh = document.getElementById('sheetAreas');
    if (sh && scrim && !sh.dataset.ligado) {
      sh.dataset.ligado = '1';
      var gat = document.querySelectorAll('[data-areas-open]');
      var abrirA = function () { sh.classList.add('open'); scrim.classList.add('open'); gat.forEach(function (g) { g.setAttribute('aria-expanded', 'true'); }); var x = sh.querySelector('.x'); if (x) x.focus(); };
      var fecharA = function () { if (!sh.classList.contains('open')) return; sh.classList.remove('open'); scrim.classList.remove('open'); gat.forEach(function (g) { g.setAttribute('aria-expanded', 'false'); }); };
      gat.forEach(function (g) { g.addEventListener('click', abrirA); });
      sh.querySelectorAll('[data-areas-close]').forEach(function (x) { x.addEventListener('click', fecharA); });
      scrim.addEventListener('click', fecharA);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharA(); });
    }

    // ── faixa de subtelas: a tela atual aparece inteira, sem mexer na rolagem da página ──
    // Roda de novo quando as fontes chegam: as pílulas mudam de largura e o centro muda junto.
    var centrarSubnav = function () {
      document.querySelectorAll('.subnav').forEach(function (n) {
        var on = n.querySelector('[aria-current="page"]');
        if (!on) return;
        var nb = n.getBoundingClientRect(), ob = on.getBoundingClientRect();
        n.scrollLeft = Math.max(0, ob.left - nb.left + n.scrollLeft - (nb.width - ob.width) / 2);
      });
    };
    centrarSubnav();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(centrarSubnav);
    window.addEventListener('load', centrarSubnav);

    // ── check-in ──
    var ck = document.querySelector('.checkin');
    if (ck) {
      var pills = ck.querySelectorAll('.mood'); var doneBox = ck.querySelector('.ck-done');
      var form = ck.querySelector('.ck-form'); var picked = null;
      pills.forEach(function (p) {
        p.addEventListener('click', function () {
          pills.forEach(function (q) { q.classList.remove('on'); });
          p.classList.add('on'); picked = p.textContent.trim();
        });
      });
      var btn = ck.querySelector('.ck-save');
      if (btn) btn.addEventListener('click', function () {
        if (!picked || !form || !doneBox) return;
        var note = ck.querySelector('.ck-note');
        var out = doneBox.querySelector('[data-out]');
        if (out) out.textContent = picked + (note && note.value ? ' · "' + note.value + '"' : '');
        form.hidden = true; doneBox.hidden = false;
      });
    }
  }
  return { boot: boot };
})();
