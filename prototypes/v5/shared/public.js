// SyncLife DS v5 — boot das telas públicas/auth (Onda 1).
// Reúne o que TODA tela pública repete: gate .anim (E-02), reveals .rv por IO, aurora global
// (paleta r13/r15 aprovada: azul/lilás/roxo), montagem das bússolas [data-bs3d] e helpers de
// formulário (olho da senha, medidor de força). Cada tela chama SLPub.boot() no fim do body.
window.SLPub = (function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveals() {
    if (reduce) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv, .draw').forEach(function (el) { io.observe(el); });
  }

  // aurora de estúdio (r15): massas de cor derivando; canvas a 1/3 da resolução, blur no CSS.
  // O canvas mede o PAI (elemento replaced: o bitmap não pode derivar do próprio box).
  function aurora(id) {
    var cv = document.getElementById(id || 'aurora');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var blobs = [
      { c: '104,64,255',  a: .55, fx: .58, fy: .46, px: .26, py: .30, ph: 0 },
      { c: '74,108,255',  a: .42, fx: .44, fy: .56, px: .72, py: .24, ph: 2.1 },
      { c: '165,138,255', a: .34, fx: .36, fy: .46, px: .50, py: .80, ph: 4.2 },
      { c: '82,39,230',   a: .26, fx: .30, fy: .38, px: .86, py: .62, ph: 5.4 }
    ];
    var leanX = 0, leanY = 0, mNX = .5, mNY = .5;
    addEventListener('pointermove', function (e) { mNX = e.clientX / innerWidth; mNY = e.clientY / innerHeight; });
    function size() {
      var p = cv.parentElement;
      cv.width = Math.max(2, Math.floor(p.clientWidth / 3));
      cv.height = Math.max(2, Math.floor(p.clientHeight / 3));
    }
    size(); addEventListener('resize', size);
    function draw(t) {
      var w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var x = w * (b.px + .26 * Math.sin(t * b.fx * .001 + b.ph) + .10 * Math.sin(t * b.fx * .0023 + b.ph * 2)) + leanX * w * .07;
        var y = h * (b.py + .22 * Math.cos(t * b.fy * .001 + b.ph * 1.3) + .08 * Math.cos(t * b.fy * .0019 + b.ph)) + leanY * h * .05;
        var r = Math.max(w, h) * .36 * (1 + .11 * Math.sin(t * .0007 + b.ph * 3));
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(' + b.c + ',' + b.a + ')');
        g.addColorStop(1, 'rgba(' + b.c + ',0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
    }
    if (!reduce) {
      var skip = 0;
      (function loop(t) { requestAnimationFrame(loop); if (document.hidden || (skip++ % 2)) return;
        leanX += ((mNX - .5) - leanX) * .025; leanY += ((mNY - .5) - leanY) * .025; draw(t); })(0);
    } else draw(0);
  }

  // olho da senha: <button class="eyebtn" data-eye="idDoInput">
  function eyes() {
    document.querySelectorAll('[data-eye]').forEach(function (btn) {
      var input = document.getElementById(btn.getAttribute('data-eye'));
      if (!input) return;
      btn.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
        btn.classList.toggle('open', show);
      });
    });
  }

  // força da senha: <input data-strength="idDoMedidor"> + <div class="forca" id="...">
  function strength() {
    var LBL = ['', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    document.querySelectorAll('[data-strength]').forEach(function (input) {
      var meter = document.getElementById(input.getAttribute('data-strength'));
      if (!meter) return;
      var lbl = meter.querySelector('.flbl');
      input.addEventListener('input', function () {
        var v = input.value, s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[A-Z]/.test(v) && /[0-9]/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        meter.className = 'forca' + (v && s ? ' f' + s : '');
        meter.style.visibility = v ? 'visible' : 'hidden';
        if (lbl) lbl.textContent = LBL[s] || '';
      });
      meter.style.visibility = 'hidden';
    });
  }

  function boot(opts) {
    opts = opts || {};
    if (!reduce) document.documentElement.classList.add('anim');
    document.documentElement.classList.add('js');
    if (window.SLBussola3D) document.querySelectorAll('[data-bs3d]').forEach(function (el) { SLBussola3D.mount(el); });
    reveals();
    if (opts.aurora !== false) aurora(opts.aurora === true || !opts.aurora ? 'aurora' : opts.aurora);
    eyes();
    strength();
  }

  return { boot: boot, reduce: reduce, aurora: aurora };
})();
