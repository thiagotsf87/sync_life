# POC DS v5 · Rodada 1 (duelo A "Estúdio" vs C "Caderno") — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir 4 protótipos HTML standalone (Landing + Dashboard nas direções A "Estúdio" e C "Caderno") para o usuário escolher a direção visual do futuro DS v5.

**Architecture:** Arquivos HTML autocontidos em `prototypes/poc-v5/` (CSS/JS inline), dados mockados numa única fonte compartilhada (`shared/mock-data.js`), 3D real via Three.js (ESM/importmap) como progressive enhancement com fallback estático, motion via GSAP + ScrollTrigger e Lenis (UMD com guards). Nada toca o app Next.

**Tech Stack:** HTML/CSS/JS vanilla · Three.js 0.160 (jsdelivr) · GSAP 3.12.5 + ScrollTrigger (cdnjs) · Lenis 1.1.14 (unpkg) · Google Fonts (Space Grotesk, Inter, Anton, Poppins).

**Spec:** `docs/superpowers/specs/2026-07-23-poc-ds-v5-duelo-design.md` (ler antes de começar).

---

## Contexto pro executor (zero contexto prévio)

- **Branch:** `poc/ds-v5` (já existe, spec commitado). Confirme com `git branch --show-current`.
- **Regras de copy** (CLAUDE.md): sem travessão (—) em copy de produto, sentence case, "você" nunca "o usuário", zero emoji em UI (G-07, ícones são SVG inline nesta POC).
- **Verificação de páginas:** SEM curl e SEM dev server. Abrir direto via Playwright MCP com URL `file:///C:/Projetos/sync_life/prototypes/poc-v5/<dir>/<page>.html`, tirar screenshot fullPage e ler console.
- **Determinismo:** nenhum `Math.random()` em posições/valores que afetem screenshot (arrays fixos). Animações contínuas são ok.
- **Referência visual aprovada pelo usuário:** `.superpowers/brainstorm/4256-1784857752/content/styles-3d.html` (seções A e C). Os protótipos devem elevar essa direção, não contradizê-la.

## Estrutura de arquivos (resultado final)

```
prototypes/poc-v5/
├── shared/mock-data.js       ← window.SL_MOCK: 1 fonte de dados pros 4 protótipos
├── a-estudio/landing.html    ← Task 2
├── a-estudio/dashboard.html  ← Task 3
├── c-caderno/landing.html    ← Task 4
└── c-caderno/dashboard.html  ← Task 5
```

---

### Task 1: Scaffold + mock-data.js

**Files:**
- Create: `prototypes/poc-v5/shared/mock-data.js`

- [ ] **Step 1: Criar o arquivo de dados**

```js
// Dados mockados da POC DS v5 (rodada 1).
// Fonte única: os 4 protótipos leem daqui pra comparação entre direções ser justa.
window.SL_MOCK = {
  score: { value: 78, delta: 4, label: 'Life Sync Score' },
  financas: {
    receitas: 5000, despesas: 3160, saldoLivre: 1840,
    poupancaPct: 37, metaPoupancaPct: 30,
    sparkSaldo: [42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78],
  },
  modulos: [
    { n: '01', nome: 'Finanças' }, { n: '02', nome: 'Tempo' }, { n: '03', nome: 'Corpo' },
    { n: '04', nome: 'Mente' }, { n: '05', nome: 'Patrimônio' }, { n: '06', nome: 'Carreira' },
    { n: '07', nome: 'Experiências' }, { n: '08', nome: 'Conquistas' }, { n: '09', nome: 'Futuro' },
    { n: '10', nome: 'Panorama' }, { n: '11', nome: 'Configurações' },
  ],
  orcamentos: [
    { nome: 'Moradia', gasto: 1240, limite: 1800 },
    { nome: 'Mercado', gasto: 520, limite: 650 },
    { nome: 'Lazer', gasto: 410, limite: 420 },
  ],
  agenda: [
    { hora: '09:00', titulo: 'Revisão de aportes', modulo: 'Finanças' },
    { hora: '12:30', titulo: 'Treino B, inferior', modulo: 'Corpo' },
    { hora: '19:00', titulo: 'Aula de espanhol', modulo: 'Mente' },
  ],
  coach: {
    dashboardA: 'Julho rendeu 4 pontos: foco protegido nas manhãs e aporte antecipado. Falta fechar o lazer, estourou 2%.',
    dashboardC: 'Seu mês está 4 pontos melhor que junho. O segredo foi proteger as manhãs. Hoje só falta olhar o lazer: estourou R$ 8.',
    cross: 'Semanas com foco protegido renderam R$ 380 a mais em aportes.',
  },
  fmtBRL(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  fmtBRL0(n) { return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
};
```

- [ ] **Step 2: Verificar sintaxe**

Run: `node -e "global.window={}; require('C:/Projetos/sync_life/prototypes/poc-v5/shared/mock-data.js'); console.log(window.SL_MOCK.fmtBRL(1840), window.SL_MOCK.modulos.length)"`
Expected: `R$ 1.840,00 11`

- [ ] **Step 3: Commit**

```bash
git add prototypes/poc-v5/shared/mock-data.js
git commit -m "feat(poc-v5): scaffold + mock-data compartilhado da rodada 1"
```

---

### Task 2: Landing A "Estúdio"

**Files:**
- Create: `prototypes/poc-v5/a-estudio/landing.html`

Página dark `#151313`, Space Grotesk display, sistema orbital 3D no hero (11 esferas + núcleo roxo), marquee, 3 painéis "como funciona", score counter no scroll, frase cross-módulo, CTA final. Easing assinatura `cubic-bezier(.625,.05,0,1)`.

- [ ] **Step 1: Escrever o arquivo completo**

Estrutura (o executor escreve o arquivo inteiro de uma vez; blocos abaixo na ordem):

**Head + tokens + CSS base:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>SyncLife · Direção A "Estúdio"</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#151313; --s1:#201d1d; --s2:#2a2727; --line:rgba(255,255,255,.07);
  --t1:#f4f4f4; --t2:#b8b8b8; --t3:#817f7f;
  --roxo:#6840ff; --eletrico:#a1ff62; --coral:#f84131;
  --ease:cubic-bezier(.625,.05,0,1); --grotesk:"Space Grotesk",sans-serif; --inter:Inter,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:auto}
body{background:var(--bg);color:var(--t1);font-family:var(--inter);overflow-x:hidden}
.wrap{max-width:1280px;margin:0 auto;padding:0 5vw}
section{padding:110px 0;position:relative}
.eyebrow{font:700 11px var(--grotesk);letter-spacing:.22em;color:var(--eletrico);text-transform:uppercase}
h1,h2{font-family:var(--grotesk);font-weight:500;letter-spacing:-.045em;line-height:1.02}
.btn{display:inline-block;background:var(--roxo);color:#fff;font:600 15px var(--inter);padding:16px 30px;border-radius:999px;text-decoration:none;transition:transform .35s var(--ease),background .35s}
.btn:hover{transform:scale(1.05);background:#7d5bff}
.btn-ghost{display:inline-block;color:var(--t2);font:500 15px var(--inter);padding:16px 26px;border:1px solid var(--line);border-radius:999px;text-decoration:none;margin-left:10px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
@media (max-width:900px){.hero-grid,.panels{grid-template-columns:1fr!important}}
</style>
</head>
```

**Nav + hero (o canvas 3D fica atrás do texto, à direita):**

```html
<body>
<nav style="position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:20px 5vw;background:linear-gradient(#151313f2,#15131300)">
  <div style="font:700 19px var(--grotesk)">Sync<span style="color:var(--roxo)">Life</span></div>
  <a class="btn" style="padding:11px 22px;font-size:13px" href="#cta">Criar minha conta</a>
</nav>

<section id="hero" style="min-height:100vh;display:flex;align-items:center;padding-top:80px">
  <div class="wrap hero-grid" style="display:grid;grid-template-columns:1.05fr 1fr;gap:3vw;align-items:center;width:100%">
    <div>
      <p class="eyebrow" data-reveal>SyncLife · sistema operacional da vida</p>
      <h1 style="font-size:clamp(3rem,6vw,5.4rem);margin:20px 0 26px" data-reveal>Sua vida inteira,<br>num só <em style="font-style:normal;color:var(--roxo)">ritmo</em>.</h1>
      <p style="color:var(--t2);font-size:16px;line-height:1.65;max-width:44ch" data-reveal>Finanças, corpo, mente, tempo. O SyncLife lê as onze frentes da sua vida e te devolve um único movimento por dia.</p>
      <div style="margin-top:34px" data-reveal><a class="btn" href="#cta">Criar minha conta</a><a class="btn-ghost" href="#como">Ver o produto</a></div>
    </div>
    <div id="hero-3d" style="position:relative;height:560px">
      <div class="fallback-3d" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center">
        <div style="width:340px;height:340px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center">
          <div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8b6bff,var(--roxo))"></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Marquee + como funciona + score + cross + CTA + footer:**

```html
<div style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 0;overflow:hidden">
  <div class="mq" style="display:inline-block;white-space:nowrap;font:500 12px var(--grotesk);letter-spacing:.3em;color:var(--t3)"></div>
</div>

<section id="como"><div class="wrap">
  <p class="eyebrow" data-reveal>Como funciona</p>
  <h2 style="font-size:clamp(2rem,3.6vw,3.2rem);margin:18px 0 54px" data-reveal>Três movimentos, todo dia.</h2>
  <div class="panels" style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
    <!-- 3 painéis: "O coach lê", "Você decide", "O score responde".
         Cada painel: div.panel data-reveal com bg var(--s1), border 1px var(--line), radius 20px,
         padding 28px, num "01/02/03" em Space Grotesk roxo, h3 20px, p em t2, e um mini-card
         ilustrativo em CSS (ex.: barra de progresso elétrica, pill de score, linha de sparkline SVG). -->
  </div>
</div></section>

<section id="score-sec" style="text-align:center"><div class="wrap">
  <p class="eyebrow" data-reveal>Life Sync Score</p>
  <div id="score-counter" style="font:700 clamp(9rem,22vw,19rem)/1 var(--grotesk);letter-spacing:-.06em" data-reveal>78</div>
  <p style="color:var(--t2);font-size:17px" data-reveal>Um número que respira com você.</p>
</div></section>

<section><div class="wrap" style="max-width:900px">
  <p class="eyebrow" data-reveal>Módulos que conversam</p>
  <h2 style="font-size:clamp(1.8rem,3.4vw,3rem);margin-top:18px" data-reveal>Semanas com foco protegido renderam <span style="color:var(--eletrico)">R$ 380 a mais</span> em aportes.</h2>
</div></section>

<section id="cta" style="text-align:center"><div class="wrap">
  <h2 style="font-size:clamp(2.4rem,5vw,4.2rem)" data-reveal>Comece hoje. De graça.</h2>
  <div style="margin-top:30px" data-reveal><a class="btn" href="#">Criar minha conta</a></div>
</div></section>

<footer style="border-top:1px solid var(--line);padding:26px 5vw;display:flex;justify-content:space-between;font:500 12px var(--grotesk);letter-spacing:.18em;color:var(--t3)">
  <span>SYNCLIFE © 2026</span><span>POC DS V5 · DIREÇÃO A</span>
</footer>
```

**Scripts (mock data, marquee, GSAP/Lenis com guards, orbital Three.js):**

```html
<script src="../shared/mock-data.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
<script>
  // marquee com os módulos do mock (2x pra loop infinito)
  var mods = window.SL_MOCK.modulos.map(function(m){ return m.n + ' ' + m.nome.toUpperCase(); }).join('  ✦  ');
  var mq = document.querySelector('.mq'); mq.textContent = mods + '  ✦  ' + mods + '  ✦  ';
  mq.animate([{transform:'translateX(0)'},{transform:'translateX(-50%)'}],{duration:30000,iterations:Infinity});

  if (window.Lenis) { var lenis = new Lenis(); (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update); }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      gsap.from(el, { y: 44, opacity: 0, duration: .9, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 82%' } });
    });
    var obj = { v: 0 }, el = document.getElementById('score-counter');
    gsap.to(obj, { v: window.SL_MOCK.score.value, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
      onUpdate: function(){ el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: '#score-sec', start: 'top 70%' } });
  }
</script>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}</script>
<script type="module">
import('three').then(function(THREE){
  var host = document.getElementById('hero-3d');
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(45, host.clientWidth/host.clientHeight, .1, 100); cam.position.z = 9;
  var renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(host.clientWidth, host.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  host.appendChild(renderer.domElement);
  var group = new THREE.Group(); scene.add(group);
  var core = new THREE.Mesh(new THREE.SphereGeometry(.95,48,48),
    new THREE.MeshStandardMaterial({ color:0x6840ff, emissive:0x6840ff, emissiveIntensity:.65, roughness:.35 }));
  group.add(core);
  scene.add(new THREE.AmbientLight(0xffffff,.25));
  var pl = new THREE.PointLight(0x8b6bff, 60, 30); pl.position.set(0,0,0); scene.add(pl);
  var dl = new THREE.DirectionalLight(0xffffff,.8); dl.position.set(4,6,8); scene.add(dl);
  // 11 órbitas determinísticas (sem Math.random)
  var tilts=[.2,-.35,.5,-.15,.4,-.55,.1,.62,-.28,.33,-.48], speeds=[.24,.2,.17,.28,.15,.22,.19,.13,.26,.16,.21];
  var moons = [];
  for (var i=0;i<11;i++){
    var r = 2.0 + i*.42;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(r,.004,8,120),
      new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:.14 }));
    ring.rotation.x = Math.PI/2 + tilts[i]; group.add(ring);
    var color = i===0 ? 0xa1ff62 : (i===4 ? 0xf84131 : 0xf4f4f4);
    var m = new THREE.Mesh(new THREE.SphereGeometry(i===0?.16:.11,24,24),
      new THREE.MeshStandardMaterial({ color:color, emissive:color, emissiveIntensity:.35, roughness:.5 }));
    m.userData = { r:r, tilt:tilts[i], speed:speeds[i], phase:i*.7 }; group.add(m); moons.push(m);
  }
  // drag pra girar + rotação automática
  var drag=false, px=0, py=0, vx=0, vy=0;
  host.addEventListener('pointerdown', function(e){ drag=true; px=e.clientX; py=e.clientY; });
  addEventListener('pointermove', function(e){ if(!drag) return; vx=(e.clientX-px)*.005; vy=(e.clientY-py)*.005; px=e.clientX; py=e.clientY; });
  addEventListener('pointerup', function(){ drag=false; });
  var running = true;
  new IntersectionObserver(function(en){ running = en[0].isIntersecting; }).observe(host);
  var t = 0;
  (function loop(){
    requestAnimationFrame(loop); if (!running) return;
    t += .016;
    group.rotation.y += .0015 + vx; group.rotation.x += vy; vx*=.92; vy*=.92;
    group.rotation.x = Math.max(-.6, Math.min(.6, group.rotation.x));
    moons.forEach(function(m){
      var a = t*m.userData.speed + m.userData.phase, r = m.userData.r;
      var x = Math.cos(a)*r, z = Math.sin(a)*r, y = Math.sin(a)*r*Math.sin(m.userData.tilt);
      m.position.set(x, y*.6, z*Math.cos(m.userData.tilt));
    });
    renderer.render(scene, cam);
  })();
  addEventListener('resize', function(){
    cam.aspect = host.clientWidth/host.clientHeight; cam.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  });
}).catch(function(){
  document.querySelector('#hero-3d .fallback-3d').style.display = 'flex';
});
</script>
</body></html>
```

O comentário dentro de `.panels` deve ser substituído pelos 3 painéis completos na escrita (conteúdo: 01 "O coach lê" com mini sparkline SVG elétrica, 02 "Você decide" com pill de ação roxa, 03 "O score responde" com barra de progresso elétrica). Sem placeholder no arquivo final.

- [ ] **Step 2: Verificar no browser**

Run (Playwright MCP): `browser_navigate` → `file:///C:/Projetos/sync_life/prototypes/poc-v5/a-estudio/landing.html`, depois `browser_take_screenshot` (fullPage) e `browser_console_messages` (level error).
Expected: 0 erros de console; canvas presente (`browser_evaluate`: `!!document.querySelector('#hero-3d canvas')` → `true`); screenshot mostra hero com orbital, marquee, 3 painéis, score gigante, frase cross com highlight elétrico.

- [ ] **Step 3: Iterar polish visual (máx. 3 iterações)**

Checklist contra o spec §6.1: headline com 1 palavra roxa · orbital arrastável · marquee com 11 módulos · counter do score anima no scroll · highlight "R$ 380" elétrico. Ajustar espaçamentos/tamanhos pelo screenshot.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/a-estudio/landing.html
git commit -m "feat(poc-v5): landing A Estudio com sistema orbital 3D"
```

---

### Task 3: Dashboard A "Estúdio"

**Files:**
- Create: `prototypes/poc-v5/a-estudio/dashboard.html`

Mesmos tokens/fontes/eases da Task 2 (copiar o bloco `:root` + reset). SEM Three.js e SEM Lenis (tela de app, scroll nativo). GSAP opcional só para entrada.

- [ ] **Step 1: Escrever o arquivo completo**

Estrutura do body:

```html
<body style="display:grid;grid-template-columns:236px 1fr;min-height:100vh">
<!-- RAIL: nav monocromática numerada -->
<aside style="border-right:1px solid var(--line);padding:26px 18px;position:sticky;top:0;height:100vh">
  <div style="font:700 17px var(--grotesk);margin-bottom:34px">Sync<span style="color:var(--roxo)">Life</span></div>
  <nav id="rail"></nav> <!-- preenchido via mock: linhas "01 Finanças" etc.
       item: display:flex;gap:10px;padding:9px 10px;border-radius:10px;color:var(--t3);font:500 13px var(--inter);
       número em Space Grotesk t3; item ativo (Panorama): bg var(--s1), color var(--t1), número roxo -->
</aside>

<main style="padding:34px 44px;max-width:1240px">
  <!-- HERO: saudação + score + stack 3D CSS com tilt -->
  <header style="display:grid;grid-template-columns:1.1fr 1fr;gap:3vw;align-items:center;margin-bottom:42px">
    <div>
      <p class="eyebrow">Quarta, 23 julho</p>
      <h1 style="font-size:clamp(1.9rem,3vw,2.7rem);margin:12px 0 8px">Sua semana rendeu<br>mais que a média.</h1>
      <div style="display:flex;align-items:baseline;gap:14px;margin-top:18px">
        <span id="score" style="font:700 96px/1 var(--grotesk);letter-spacing:-.05em">78</span>
        <span style="background:var(--eletrico);color:#151313;font:700 13px var(--grotesk);padding:5px 12px;border-radius:999px">+4</span>
      </div>
    </div>
    <div class="scene" style="perspective:1100px">
      <div class="stack" id="stack" style="position:relative;width:320px;height:300px;margin:0 auto;transform-style:preserve-3d;transition:transform .4s var(--ease)">
        <!-- 3 cards absolutos (como no protótipo de estilo aprovado):
             frente roxa translateZ(60px): "SALDO LIVRE" + fmtBRL(1840) grande + pill +12%
             meio s1 rotate(4deg): "POUPANÇA · 37%" + sparkline SVG elétrica (path do sparkSaldo)
             fundo s2 rotate(-5deg) borda coral translúcida: "DESPESAS" + fmtBRL(3160) + barra coral 63% -->
      </div>
    </div>
  </header>

  <!-- FAIXA DO COACH -->
  <section style="padding:0;margin-bottom:40px">
    <div style="background:var(--s1);border:1px solid var(--line);border-left:3px solid var(--roxo);border-radius:16px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center;gap:24px">
      <p id="coach-line" style="color:var(--t2);font-size:15px;line-height:1.6;max-width:70ch"></p>
      <a class="btn" style="white-space:nowrap;padding:12px 22px;font-size:13px" href="#">Falar com o coach</a>
    </div>
  </section>

  <!-- EVIDÊNCIA: grid orçamentos + agenda -->
  <section style="padding:0;margin-bottom:40px;display:grid;grid-template-columns:1.5fr 1fr;gap:22px">
    <div style="background:var(--s1);border:1px solid var(--line);border-radius:20px;padding:26px">
      <p class="eyebrow" style="color:var(--t3)">Orçamentos · julho</p>
      <div id="orcamentos" style="margin-top:18px;display:flex;flex-direction:column;gap:16px"></div>
      <!-- por item: nome (t1 14px) + valores fmtBRL "gasto de limite" (t3 12px, números em Space Grotesk)
           + barra 6px: pct<=70 var(--eletrico) · 70-85 var(--t2) · >85 var(--coral) -->
    </div>
    <div style="background:var(--s1);border:1px solid var(--line);border-radius:20px;padding:26px">
      <p class="eyebrow" style="color:var(--t3)">Hoje</p>
      <div id="agenda" style="margin-top:18px;display:flex;flex-direction:column;gap:14px"></div>
      <!-- por item: hora em Space Grotesk t3 + título t1 + módulo como "01 FINANÇAS" (numeração, sem cor de módulo) -->
    </div>
  </section>

  <!-- BANDA CROSS-MÓDULO -->
  <section style="padding:0 0 40px">
    <div style="border:1px solid var(--line);border-radius:16px;padding:20px 26px;display:flex;justify-content:space-between;align-items:center">
      <p style="font:500 16px var(--grotesk);letter-spacing:-.01em"><span style="color:var(--eletrico)">R$ 380 a mais</span> nos meses com foco protegido.</p>
      <a href="#" style="color:var(--t3);font:500 13px var(--inter);text-decoration:none">Ver em Tempo →</a>
    </div>
  </section>
</main>
```

Scripts: incluir `../shared/mock-data.js`; JS vanilla popula `#rail`, `#coach-line` (usa `SL_MOCK.coach.dashboardA`), `#orcamentos`, `#agenda` e monta o sparkline SVG a partir de `sparkSaldo`; tilt do `#stack` no mousemove do header (copiar o padrão do styles-3d.html: rotateY nx*16, rotateX -ny*12, reset no mouseleave). Regra de cor da barra em função `corBarra(pct)` exatamente como comentado acima.

- [ ] **Step 2: Verificar no browser**

Run (Playwright): navegar `file:///C:/Projetos/sync_life/prototypes/poc-v5/a-estudio/dashboard.html`, screenshot fullPage + console.
Expected: 0 erros; rail com 11 itens numerados monocromáticos; hero com 78 + stack 3D; faixa coach com texto do mock; 3 orçamentos com cores elétrico/neutro/coral (69%/80%/98%); agenda com 3 itens.

- [ ] **Step 3: Iterar polish visual (máx. 3 iterações)** — checklist spec §6.3.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/a-estudio/dashboard.html
git commit -m "feat(poc-v5): dashboard A Estudio com rail numerado e stack 3D"
```

---

### Task 4: Landing C "Caderno"

**Files:**
- Create: `prototypes/poc-v5/c-caderno/landing.html`

Página cream `#fffdf7`, Anton + Poppins, asterisco 3D extrudado, fita marquee colorida, 3 capítulos, seção "o coach escreve", CTA carimbo. Overshoot em tudo que entra.

- [ ] **Step 1: Escrever o arquivo completo**

**Tokens + base:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>SyncLife · Direção C "Caderno"</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --cream:#fffdf7; --verde:#09543d; --marrom:#461e10; --rosa:#ffa9e9; --lima:#ccf337; --amarelo:#ffc200; --laranja:#f45c24;
  --anton:Anton,Impact,sans-serif; --pop:Poppins,sans-serif;
  --pop-ease:cubic-bezier(.17,.67,.3,1.33);
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--cream);color:var(--verde);font-family:var(--pop);overflow-x:hidden}
.wrap{max-width:1280px;margin:0 auto;padding:0 5vw}
h1,h2,.anton{font-family:var(--anton);text-transform:uppercase;line-height:.93;letter-spacing:-.01em}
.stamp{display:inline-block;background:var(--verde);color:var(--cream);font:600 15px var(--pop);padding:16px 32px;border-radius:999px;text-decoration:none;box-shadow:4px 4px 0 var(--marrom);transition:transform .18s,box-shadow .18s}
.stamp:hover{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--marrom)}
.stk{display:inline-block;font:600 14px var(--pop);padding:11px 19px;border-radius:999px;border:2px solid var(--marrom);box-shadow:3px 3px 0 var(--marrom)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
@media (max-width:900px){.hero-grid{grid-template-columns:1fr!important}}
</style>
</head>
```

**Body (ordem):**
1. Nav: wordmark "SyncLife" em Anton 22px + `.stamp` "Começar agora" (padding menor).
2. Hero grid 1.35fr/1fr: h1 3 linhas: `<span style="color:var(--marrom)">Sua vida</span> / Em <span class="outline">plena</span> / Sincronia` (outline = `color:transparent;-webkit-text-stroke:2.5px var(--verde)`), font-size `clamp(4rem,10vw,9.5rem)`; sub Poppins; `.stamp` CTA; stickers `R$ 1.840 livres` (rosa, rotate -5deg), `+4 pts no score` (lima, 2.5deg), `37% poupado` (amarelo, -2deg). À direita `#hero-3d` (520px) com fallback = flor CSS (copiar do styles-3d.html aprovado: 6 pétalas + core amarelo "78").
3. Fita marquee: barra `background:var(--verde)` com texto repetido dos módulos em `var(--cream)` Anton 16px, separado por ✦ alternando cores `--rosa/--lima/--amarelo`; animação translateX loop 26s.
4. Capítulos (3 blocos alternados): `01 Dinheiro` (bg verde, texto cream) com stickers de Finanças/Patrimônio; `02 Corpo e mente` (bg cream, texto verde, borda top 2px marrom) com Corpo/Mente/Tempo; `03 Futuro` (bg marrom, texto cream) com Futuro/Carreira/Experiências. Cada capítulo: número Anton 120px translúcido + h2 + parágrafo + 2 stickers de dados.
5. "O coach escreve": bloco central max-width 760px, bg `#fff` com borda 2px marrom e canto dobrado (pseudo-elemento triângulo), texto do `SL_MOCK.coach.dashboardC` em Poppins 18px, assinatura "— seu coach" NÃO (regra sem travessão): usar "seu coach · hoje às 07:12" em 12px; stickers pequenos nas margens (rotate).
6. CTA final: h2 Anton gigante "Comece pela primeira página." + `.stamp`.
7. Footer verde: "SYNCLIFE © 2026 · POC DS V5 · DIREÇÃO C".

**Scripts:** `../shared/mock-data.js` popula stickers e fita; GSAP com guards: reveals com `ease:'back.out(2)'` e `scale:.9` (overshoot); Lenis igual Task 2. Three.js via importmap + dynamic import:

```js
// Asterisco extrudado: 8 pétalas + núcleo
import('three').then(function(THREE){
  var host = document.getElementById('hero-3d');
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(40, host.clientWidth/host.clientHeight, .1, 50); cam.position.z = 7;
  var renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(host.clientWidth, host.clientHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xfffdf7, 0x461e10, 1.4));
  var dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(3,5,6); scene.add(dl);
  function petala(){
    var w=.21,h=1.55,r=.21,s=new THREE.Shape();
    s.absarc(0,h-r,r,0,Math.PI,false); s.lineTo(-w,r); s.absarc(0,r,r,Math.PI,Math.PI*2,false); s.lineTo(w,h-r);
    return new THREE.ExtrudeGeometry(s,{depth:.34,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:3,curveSegments:24});
  }
  var flor = new THREE.Group();
  var matV = new THREE.MeshToonMaterial({ color:0x09543d });
  for (var i=0;i<8;i++){ var p = new THREE.Mesh(petala(), matV); p.rotation.z = i*Math.PI/4; flor.add(p); }
  var core = new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.5,32), new THREE.MeshToonMaterial({ color:0xffc200 }));
  core.rotation.x = Math.PI/2; flor.add(core);
  flor.rotation.x = .25; scene.add(flor);
  var moeda = new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.09,32), new THREE.MeshToonMaterial({ color:0xffa9e9 }));
  moeda.position.set(2.1,1.4,.5); moeda.rotation.z = .5; scene.add(moeda);
  var pilula = new THREE.Mesh(new THREE.CapsuleGeometry(.18,.5,8,16), new THREE.MeshToonMaterial({ color:0xccf337 }));
  pilula.position.set(-2.2,-1.2,.3); pilula.rotation.z = -.6; scene.add(pilula);
  host.addEventListener('pointerdown', function(){
    if (window.gsap) gsap.fromTo(flor.scale, {x:.85,y:.85,z:.85}, {x:1,y:1,z:1,duration:.7,ease:'back.out(3)'});
  });
  var running = true; new IntersectionObserver(function(en){ running = en[0].isIntersecting; }).observe(host);
  var t = 0;
  (function loop(){ requestAnimationFrame(loop); if(!running) return; t += .016;
    flor.rotation.z += .006; flor.position.y = Math.sin(t*.8)*.12;
    moeda.rotation.y += .02; moeda.position.y = 1.4 + Math.sin(t*1.1)*.15;
    pilula.rotation.y -= .015; pilula.position.y = -1.2 + Math.sin(t*.9+2)*.12;
    renderer.render(scene, cam);
  })();
  addEventListener('resize', function(){ cam.aspect = host.clientWidth/host.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); });
}).catch(function(){ document.querySelector('#hero-3d .fallback-3d').style.display = 'block'; });
```

- [ ] **Step 2: Verificar no browser**

Run (Playwright): navegar `file:///C:/Projetos/sync_life/prototypes/poc-v5/c-caderno/landing.html`, screenshot + console.
Expected: 0 erros; canvas com flor verde 3D + moeda rosa + pílula lima; hero Anton 3 linhas com "plena" outline; fita verde com módulos coloridos; 3 capítulos alternados; bilhete do coach com canto dobrado.

- [ ] **Step 3: Iterar polish visual (máx. 3 iterações)** — checklist spec §6.2.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/c-caderno/landing.html
git commit -m "feat(poc-v5): landing C Caderno com asterisco 3D extrudado"
```

---

### Task 5: Dashboard C "Caderno"

**Files:**
- Create: `prototypes/poc-v5/c-caderno/dashboard.html`

Mesmos tokens da Task 4. Sem Three.js (selo é SVG), sem Lenis. GSAP opcional pra entrada com overshoot.

- [ ] **Step 1: Escrever o arquivo completo**

Estrutura do body:

```html
<body>
<!-- MASTHEAD tipo jornal -->
<header style="border-bottom:3px double var(--marrom);padding:26px 5vw 18px">
  <div style="display:flex;justify-content:space-between;align-items:baseline">
    <div class="anton" style="font-size:34px">SyncLife</div>
    <div style="font:600 12px var(--pop);letter-spacing:.14em">QUARTA, 23 JULHO · EDIÇÃO 214</div>
  </div>
  <nav id="etiquetas" style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"></nav>
  <!-- etiquetas: pill 2px marrom por módulo, bg alternando rosa/lima/amarelo/cream (array fixo de 4 cores em loop),
       ativa (Panorama) = bg verde texto cream -->
</header>

<main class="wrap" style="padding-top:44px;padding-bottom:60px">
  <!-- HERO: selo + headline do dia -->
  <section style="display:grid;grid-template-columns:auto 1fr;gap:44px;align-items:center;margin-bottom:44px">
    <div style="transform:rotate(-7deg)">
      <svg viewBox="0 0 200 200" width="220" aria-label="Life Sync Score 78">
        <defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="#09543d" stroke-width="3"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#09543d" stroke-width="2" stroke-dasharray="4 6"/>
        <text font-family="Poppins" font-size="11" letter-spacing="3.5" fill="#09543d"><textPath href="#circ">LIFE SYNC SCORE · +4 ESTE MÊS · LIFE SYNC SCORE · +4 ESTE MÊS ·</textPath></text>
        <text x="100" y="122" text-anchor="middle" font-family="Anton" font-size="60" fill="#09543d">78</text>
      </svg>
    </div>
    <div>
      <h1 style="font-size:clamp(2.6rem,5.4vw,4.6rem)"><span style="color:var(--marrom)">A manhã</span> pagou<br>o seu <span style="color:transparent;-webkit-text-stroke:2px var(--verde)">futuro</span>.</h1>
      <p style="font:400 16px/1.6 var(--pop);color:var(--marrom);margin-top:16px;max-width:52ch">Aporte antecipado, foco protegido e um orçamento pedindo atenção. A edição de hoje em três linhas.</p>
    </div>
  </section>

  <!-- BILHETE DO COACH -->
  <section style="margin-bottom:44px;position:relative;max-width:820px">
    <div style="background:var(--amarelo);border:2px solid var(--marrom);border-radius:4px;padding:26px 30px;box-shadow:5px 5px 0 var(--marrom);position:relative">
      <p id="coach-line" style="font:400 17px/1.65 var(--pop);color:var(--marrom)"></p>
      <p style="font:600 12px var(--pop);letter-spacing:.12em;margin-top:14px;color:var(--marrom)">SEU COACH · HOJE ÀS 07:12</p>
      <span style="position:absolute;right:-2px;top:-2px;width:0;height:0;border-top:26px solid var(--cream);border-left:26px solid transparent"></span>
    </div>
    <span class="stk" style="background:var(--rosa);position:absolute;right:-14px;top:-18px;transform:rotate(6deg)">novo</span>
  </section>

  <!-- KPIs stickers + orçamentos com check -->
  <section style="display:grid;grid-template-columns:1fr 1.4fr;gap:36px;margin-bottom:44px">
    <div id="kpis" style="display:flex;flex-direction:column;gap:16px;align-items:flex-start"></div>
    <!-- 4 stickers grandes rotacionados (-4/2/-2/3 deg): saldo livre rosa, receitas lima, despesas laranja
         (texto cream), poupança amarelo. Valor em Anton 30px + label Poppins 11px uppercase -->
    <div style="border:2px solid var(--marrom);border-radius:14px;padding:24px;background:#fff">
      <h2 class="anton" style="font-size:22px;margin-bottom:16px">Orçamentos de julho</h2>
      <div id="orcamentos" style="display:flex;flex-direction:column;gap:14px"></div>
      <!-- por item: linha com check circular (borda 2px marrom; pct<=70 = fundo lima com ✓ SVG;
           70-85 = fundo amarelo com !; >85 = fundo laranja com × em cream) + nome Poppins 600
           + barra 8px borda 1px marrom: fill lima/amarelo/laranja pela mesma regra + valores fmtBRL -->
    </div>
  </section>

  <!-- BARRAS chapadas receitas x despesas -->
  <section style="border:2px solid var(--marrom);border-radius:14px;padding:24px;background:#fff;max-width:820px">
    <h2 class="anton" style="font-size:22px;margin-bottom:18px">O mês em barras</h2>
    <div id="chart" style="display:flex;align-items:flex-end;gap:18px;height:180px"></div>
    <!-- 2 barras: receitas (lima, altura 100%) e despesas (laranja, altura 63%), largura 90px,
         borda 2px marrom, valor em Anton no topo, label Poppins abaixo.
         Tooltip estilo etiqueta (spec §6.4): span absoluto acima da barra, visível no hover via CSS
         (.bar:hover .tip{opacity:1}), bg var(--cream), borda 2px marrom, sombra 3px 3px 0 marrom,
         rotate(-3deg), texto "fmtBRL(valor) · mês de julho" em Poppins 600 12px -->
  </section>
</main>

<footer style="background:var(--verde);color:var(--cream);padding:22px 5vw;font:600 12px var(--pop);letter-spacing:.14em;display:flex;justify-content:space-between">
  <span>SYNCLIFE © 2026</span><span>POC DS V5 · DIREÇÃO C</span>
</footer>
```

Scripts: `../shared/mock-data.js`; JS popula `#etiquetas` (11 módulos), `#coach-line` (`coach.dashboardC`), `#kpis` (fmtBRL0 pros stickers), `#orcamentos` e `#chart`; GSAP opcional: entrada dos stickers com `ease:'back.out(2.5)', rotate` do valor final.

- [ ] **Step 2: Verificar no browser**

Run (Playwright): navegar `file:///C:/Projetos/sync_life/prototypes/poc-v5/c-caderno/dashboard.html`, screenshot + console.
Expected: 0 erros; masthead com data e 11 etiquetas; selo SVG rotacionado com 78 e texto circular; bilhete amarelo com canto dobrado; 4 stickers KPI; orçamentos com checks lima/amarelo/laranja; 2 barras chapadas.

- [ ] **Step 3: Iterar polish visual (máx. 3 iterações)** — checklist spec §6.4.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/c-caderno/dashboard.html
git commit -m "feat(poc-v5): dashboard C Caderno com masthead e selo carimbado"
```

---

### Task 6: Sweep final de consistência

**Files:** nenhum novo (ajustes nos 4 HTML se necessário).

- [ ] **Step 1: Conferir dados idênticos entre direções**

Run: `grep -c "1.840" prototypes/poc-v5/*/*.html` e `grep -rn "SL_MOCK" prototypes/poc-v5/*/*.html | wc -l`
Expected: os 4 arquivos referenciam `SL_MOCK`; nenhum valor financeiro hardcoded divergente do mock (78, +4, 1.840, 5.000, 3.160, 37%).

- [ ] **Step 2: Console limpo nas 4 páginas**

Run (Playwright): navegar as 4 URLs `file:///...` em sequência, `browser_console_messages` (error) em cada.
Expected: 0 erros em todas.

- [ ] **Step 3: Checar regras de copy**

Run: `grep -n "—" prototypes/poc-v5/*/*.html`
Expected: nenhuma ocorrência (travessão proibido). Emojis: `grep -nP "[\x{1F300}-\x{1FAFF}]" prototypes/poc-v5/*/*.html` → nenhuma ocorrência.

- [ ] **Step 4: Commit final (se houve ajustes)**

```bash
git add prototypes/poc-v5
git commit -m "chore(poc-v5): sweep de consistencia da rodada 1"
```

---

## Encerramento da rodada 1

Com os 4 protótipos commitados, apresentar ao usuário:
1. Os 4 caminhos `file:///C:/Projetos/sync_life/prototypes/poc-v5/...` pra abrir no browser.
2. Os 6 critérios de julgamento do spec §8.
3. Pergunta única: **qual direção vence, A ou C?** (a rodada 2, Finanças + Coach, sai só na vencedora e será planejada em novo plano).
