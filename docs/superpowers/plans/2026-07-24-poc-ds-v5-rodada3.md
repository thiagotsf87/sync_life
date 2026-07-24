# POC DS v5 · Rodada 3 (anatomia híbrida + scroll-story + 3D com craft) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir 2 protótipos em `prototypes/poc-v5/r3-estudio/` (Dashboard com anatomia híbrida Revista×Mesa; Landing como scroll-story com orbital 3D reconstruído com bloom e materiais físicos) que respondam às 3 críticas do usuário (anatomia, motion, 3D).

**Architecture:** HTML standalone (padrões das rodadas 1-2). Dashboard é DOM/CSS puro com entrada orquestrada GSAP e parallax de profundidade no mouse. Landing tem 6 cenas empilhadas que funcionam estáticas sem JS e são promovidas a scroll-story (Lenis + ScrollTrigger pin/scrub) quando os CDNs carregam; o 3D usa Three.js + addons (EffectComposer/UnrealBloomPass/RoomEnvironment) e expõe uma API mínima consumida pelas timelines de scroll.

**Tech Stack:** Google Fonts (Space Grotesk/Inter) · GSAP 3.12.5 + ScrollTrigger (cdnjs) · Lenis 1.1.14 (unpkg) · Three 0.160 + `three/addons/` (jsdelivr importmap).

**Spec:** `docs/superpowers/specs/2026-07-24-poc-ds-v5-rodada3-design.md` (ler inteiro antes de começar).

---

## Regras herdadas (valem para TODAS as tasks)

- Branch `poc/ds-v5`. Commit por task, só os arquivos da task, trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- QA: Playwright MCP bloqueia `file://`; usar `python -m http.server` efêmero em background (matar depois). **NUNCA curl** (pode travar a máquina). Screenshots fullPage: forçar scroll ANTES e esperar 2-3s (entrances GSAP demoram a assentar).
- `<link rel="icon" href="data:,">`; guards `window.SL_MOCK`/`window.gsap`/`window.Lenis` independentes; `var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches` respeitado de verdade; nada pré-escondido em CSS (`gsap.from`/`fromTo` only); fallbacks estáticos = mock; sem em-dash (– en-dash ok em negativos); sem emoji; sem Math.random; UTF-8; NBSP após "R$" com byte real `0xC2A0` (verificar com `od -c`).
- Tokens da linguagem A (copiar `:root` de `prototypes/poc-v5/a-estudio/dashboard.html`): bg `#151313`, s1 `#201d1d`, s2 `#2a2727`, line `rgba(255,255,255,.07)`, t1/t2/t3, roxo `#6840ff`, elétrico `#a1ff62`, coral `#f84131`, ease `cubic-bezier(.625,.05,0,1)`.
- Dados: `../shared/mock-data.js` (caminho relativo a `r3-estudio/`).

## Estrutura de arquivos (resultado)

```
prototypes/poc-v5/r3-estudio/
├── dashboard.html   ← Task 13 (híbrido Revista×Mesa, sem WebGL)
└── landing.html     ← Task 14 (cenas estáticas + orbital v2) + Task 15 (choreography)
```

---

### Task 13: Dashboard r3 (híbrido Revista×Mesa)

**Files:**
- Create: `prototypes/poc-v5/r3-estudio/dashboard.html`
- Base visual: LER `C:/Projetos/sync_life/.superpowers/brainstorm/6534-1784912591/content/hibrido-revista-mesa.html` (mockup aprovado pelo usuário; o `.mock` de lá é o esqueleto do `<main>` daqui). Se o arquivo não existir mais, o spec §4 descreve a mesma estrutura.

- [ ] **Step 1: Escrever o arquivo**

Página completa (head com tokens/fonts/favicon; SEM Three, SEM Lenis; GSAP via cdnjs). Os comentários explicativos abaixo descrevem o que construir e NÃO podem sobrar no arquivo final (markup completo, fallbacks estáticos seeded). Estrutura:

```html
<body> <!-- bg var(--bg), sem rail -->
<header style="display:flex;justify-content:space-between;align-items:center;padding:20px 4vw;border-bottom:1px solid var(--line)">
  <div style="font:700 17px var(--gro)">Sync<span style="color:var(--roxo)">Life</span></div>
  <div style="display:flex;gap:18px;align-items:center">
    <span style="font:700 10px var(--gro);letter-spacing:.18em;color:var(--t3)">QUARTA, 23 JULHO</span>
    <button id="indice-btn" aria-haspopup="dialog" style="background:none;border:1px solid var(--line);border-radius:999px;color:var(--t2);font:600 12px var(--int);padding:9px 18px;cursor:pointer">Módulos ⌘K</button>
  </div>
</header>

<main style="max-width:1280px;margin:0 auto;padding:40px 4vw 80px;display:grid;grid-template-columns:170px 1fr 250px;min-height:calc(100vh - 130px)">
  <!-- COLUNA 1 · rubricas: idêntica ao mock aprovado (Hoje/agenda de SL_MOCK.agenda + chip de fluxo
       rotacionado -1.4deg com ↑ R$ 5.000 elétrico / ↓ R$ 3.160 coral), com ids #agenda e #fluxo,
       fallbacks estáticos seeded, border-right 1px var(--line). -->
  <!-- COLUNA 2 · matéria: eyebrow "Panorama · quarta, 23 julho" → headline editorial
       "A manhã protegida pagou o seu futuro <em roxo>de novo</em>." (Space Grotesk clamp(1.7rem,2.8vw,2.5rem))
       → parágrafo #materia (t2 15px/1.8, max 58ch) do coach com inline: <strong t1>4 pontos</strong>,
       <span elétrico>aporte antecipado</span>, <strong t1>R$ 1.840</strong>, <span elétrico>R$ 380 a mais</span>
       (montar de SL_MOCK.coach.briefing + coach.cross com replaces de ênfase + NBSP, fallback estático igual)
       → TIRA DE FILME data-depth="3" (width calc(100%+60px), rotate .8deg, z-index 2, LIVRES R$ 1.840 +
       sparkline SVG de sparkSaldo + POUPANÇA 37% elétrico, shadow 0 14px 36px #00000066)
       → BILHETE data-depth="5" (inline-block, rotate -.9deg, border-left 3px roxo, "Coach · 07:12",
       "Só falta o lazer: estourou <strong coral>R$ 8</strong>. Um café a menos resolve.",
       pill roxo "Resolver agora", shadow 0 16px 40px #00000077). -->
  <!-- COLUNA 3 · margem do número: PLACA data-depth="4" (position:absolute no wrapper relativo da coluna;
       left:-34px pra atravessar o fio; width 250px; rotate -1.6deg; gradient 150deg #241f1f→#1a1717;
       radius 20; padding 26px; z-index 3; eyebrow LIFE SYNC SCORE + <span id="score">78</span>
       Space Grotesk 700 92px + pill elétrico "+4 este mês") e, no rodapé da coluna, rubrica MÓDULOS
       (lista monocromática "01 Finanças · 37% / 02 Tempo · 12h / 03 Corpo · 3/4"). border-left 1px var(--line). -->
</main>

<!-- ÍNDICE overlay -->
<div id="indice" role="dialog" aria-label="Índice de módulos" style="display:none;position:fixed;inset:0;background:#0d0c0bee;z-index:50;backdrop-filter:blur(6px)">
  <div style="max-width:520px;margin:10vh auto;background:var(--s1);border:1px solid var(--line);border-radius:20px;padding:30px 34px">
    <p style="font:700 10px var(--gro);letter-spacing:.2em;color:var(--t3);margin-bottom:16px">ÍNDICE · 11 MÓDULOS</p>
    <nav id="indice-list" style="display:grid;grid-template-columns:1fr 1fr;gap:6px 24px"></nav>
    <!-- itens: "01 Finanças"… número Space Grotesk t3, nome t1 14px, hover número roxo.
         Fallback estático: os 11 seeded. JS reconstrói de SL_MOCK.modulos. -->
    <p style="color:var(--t3);font-size:11px;margin-top:18px">esc pra fechar</p>
  </div>
</div>
</body>
```

Scripts no fim do body (mock → gsap cdnjs → inline):

```js
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// popular #agenda, #fluxo, #materia (ênfases via replace no texto do mock), #indice-list, #score sob if (window.SL_MOCK)
// índice: abrir/fechar
var ind = document.getElementById('indice');
document.getElementById('indice-btn').addEventListener('click', function(){ ind.style.display='block'; });
ind.addEventListener('click', function(e){ if (e.target === ind) ind.style.display='none'; });
addEventListener('keydown', function(e){ if (e.key === 'Escape') ind.style.display='none'; });
// ENTRADA orquestrada (só com gsap && !reduce): timeline com o easing assinatura:
// placa: from {y:-26, rotation:-4, opacity:0} → settle (rotation volta a -1.6 via transform base: usar
//   gsap.from(el,{y:-26,opacity:0,duration:.9,ease:'expo.out'}) e rotação fica no CSS pra não brigar)
// tira: from {x:-40, opacity:0}; bilhete: from {scale:.94, opacity:0, ease:'back.out(2)'};
// rubricas/matéria: from {y:24, opacity:0, stagger:.08}
// PARALLAX de profundidade (só !reduce): mousemove no main →
//   nx/ny em [-0.5,0.5]; para cada [data-depth]: el.style.translate = (nx*depth)+'px '+(ny*depth)+'px'
//   (usar a prop CSS translate pra NÃO sobrescrever o transform rotate). mouseleave → translate 0 0.
```

Regra crítica: rotações ficam no `transform` inline dos elementos; o parallax usa a propriedade CSS `translate` e a entrada GSAP anima só y/x/opacity/scale — assim nada briga com as rotações.

- [ ] **Step 2: Verificar no browser**

Server `python -m http.server 8601` em `prototypes/poc-v5` (background) + Playwright: abrir `http://localhost:8601/r3-estudio/dashboard.html`.
Expected: 0 erros de console; grade 3 colunas sem cards; placa atravessando o fio (rect da placa cruza o x do fio da coluna 3); tira escapando da coluna 2; parallax mensurável (`browser_evaluate` mousemove sintético → translate != 0 0 nos [data-depth], e texto/fios parados); overlay abre com 11 módulos e fecha no esc; reduced-motion emulado → tudo visível, translate 0.
Rect checks: valor da placa, texto do bilhete e valores da tira não se ocluem mutuamente nem cruzam texto da matéria a 1440x900 e 1100x900.

- [ ] **Step 3: Polish visual (máx 3 iterações)** — critério: parece uma página de revista com objetos em cima, não um dashboard; hierarquia guia: headline → placa → tira → bilhete.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/r3-estudio/dashboard.html
git commit -m "feat(poc-v5): dashboard r3 - anatomia hibrida Revista x Mesa"
```

---

### Task 14: Landing r3, parte 1 — cenas estáticas + orbital v2 (bloom)

**Files:**
- Create: `prototypes/poc-v5/r3-estudio/landing.html`

- [ ] **Step 1: Escrever o arquivo com as 6 cenas EMPILHADAS (sem pin ainda) + orbital v2**

Head: tokens A + fonts + favicon. Body: nav fixa mínima (wordmark + CTA roxo). As cenas são `<section class="scene" id="s1">…<section id="s6">`, cada uma com layout estático completo e legível (o scroll-story da Task 15 só ENHANCE):

1. `#s1` (min-height 100vh): grid 1fr/1fr: headline `Sua vida inteira,<br>num só <em roxo>ritmo</em>.` clamp(3rem,6vw,5.4rem) + sub + CTAs (btn roxo + ghost) + fileira de stats com dots (LIVRES R$ 1.840 / SCORE +4 elétrico / POUPANÇA 37%); à direita `<div id="orbital" style="position:relative;height:600px;touch-action:pan-y" aria-hidden="true">` + `.fallback-3d` (círculo com core roxo radial, display:none).
2. `#s2` (min-height 100vh): à esquerda, 5 rótulos empilhados, cada um `<p class="mod-label">` (com espaçamento vertical generoso, ~38vh entre eles, pra dar percurso de scroll ao destaque) ("01 Finanças · 37% poupado", "02 Tempo · 12h de foco", "03 Corpo · 3 treinos", "04 Mente · 2 aulas", "05 Patrimônio · aporte feito") em Space Grotesk 22px cor t3, todos visíveis no estático; a cena compartilha o canvas de `#s1`? NÃO: o canvas é um só, `position:sticky` não — Task 15 pina; no estático o orbital fica em #s1 e #s2 mostra só os rótulos + eyebrow "AS ONZE FRENTES". Sem JS isso lê como lista editorial.
3. `#s3` (min-height 90vh, centrado): eyebrow LIFE SYNC SCORE + `<div id="score-counter">78</div>` clamp(9rem,20vw,17rem) + frase "Um número que respira com você."
4. `#s4` (min-height 100vh): réplica compacta da anatomia do dashboard r3 (a "página" do produto): montar um `.page-demo` com placa/tira/bilhete/matéria em miniatura (~900px), cada peça com as classes exatas `piece-placa`, `piece-tira`, `piece-bilhete`, `piece-materia` (a Task 15 anima a montagem com esses seletores). Reusar exatamente os estilos de objetos da Task 13 em escala menor. Eyebrow "O PRODUTO · PANORAMA".
5. `#s5` (min-height 70vh): frase cross gigante com `R$ 380 a mais` elétrico, cada linha envolvida em `<span class="line">` dentro de um wrapper com overflow hidden (máscara pra Task 15).
6. `#s6`: CTA final "Comece hoje. De graça." + footer 1 linha.

Marquee divisor dos módulos entre `#s3` e `#s4` (padrão da rodada 1, populado do mock, aria-hidden).

**Orbital v2 (module script, código completo):**

```html
<script type="importmap">{"imports":{
  "three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
}}</script>
<script type="module">
Promise.all([
  import('three'),
  import('three/addons/postprocessing/EffectComposer.js'),
  import('three/addons/postprocessing/RenderPass.js'),
  import('three/addons/postprocessing/UnrealBloomPass.js'),
  import('three/addons/environments/RoomEnvironment.js'),
]).then(function (mods) {
  var THREE = mods[0], EffectComposer = mods[1].EffectComposer, RenderPass = mods[2].RenderPass,
      UnrealBloomPass = mods[3].UnrealBloomPass, RoomEnvironment = mods[4].RoomEnvironment;
  var host = document.getElementById('orbital');
  var W = host.clientWidth, H = host.clientHeight;
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(42, W/H, .1, 100); cam.position.set(0, 0, 9);
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x151313, 1); // opaco na cor da página: evita a armadilha alpha+bloom
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

  var group = new THREE.Group(); scene.add(group);
  var core = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.MeshPhysicalMaterial({
    color: 0x6840ff, emissive: 0x5b34e8, emissiveIntensity: 1.35,
    roughness: .22, metalness: .15, clearcoat: .7, clearcoatRoughness: .25,
  }));
  group.add(core);
  scene.add(new THREE.AmbientLight(0xffffff, .18));
  var dl = new THREE.DirectionalLight(0xfff6e8, 1.4); dl.position.set(5, 7, 6); scene.add(dl);

  var tilts = [.2,-.35,.5,-.15,.4,-.55,.1,.62,-.28,.33,-.48], speeds = [.22,.18,.15,.26,.13,.2,.17,.11,.24,.14,.19];
  var moons = [], ringPts = [];
  for (var i = 0; i < 11; i++) {
    var r = 2.1 + i * .4;
    var curve = new THREE.EllipseCurve(0, 0, r, r), pts = curve.getPoints(140);
    var g = new THREE.BufferGeometry().setFromPoints(pts);
    var ring = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1 + .04 * (i % 2) }));
    ring.rotation.x = Math.PI / 2 + tilts[i]; group.add(ring);
    var accent = i === 0 ? 0xa1ff62 : (i === 4 ? 0xf84131 : 0xcfcaca);
    var m = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? .17 : .12, 32, 32), new THREE.MeshStandardMaterial({
      color: accent, metalness: .55, roughness: .3,
      emissive: (i === 0 || i === 4) ? accent : 0x000000, emissiveIntensity: (i === 0 || i === 4) ? .8 : 0,
    }));
    m.userData = { r: r, tilt: tilts[i], speed: speeds[i], phase: i * .7 };
    group.add(m); moons.push(m);
  }

  var composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  var bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .85, .75, .72);
  composer.addPass(bloom);

  // API consumida pelo scroll (Task 15). Sem GSAP, os defaults mantêm a cena viva.
  var state = { focus: -1, dive: 0 }; // focus: índice da lua destacada; dive: 0..1 mergulho no núcleo
  window.__orbital = {
    state: state, group: group, cam: cam, bloom: bloom, moons: moons,
    setFocus: function (i) { state.focus = i; },
    setDive: function (p) { state.dive = Math.max(0, Math.min(1, p)); },
  };

  var drag = false, px = 0, vx = 0, vy = 0, py = 0;
  host.addEventListener('pointerdown', function (e) { drag = true; px = e.clientX; py = e.clientY; });
  addEventListener('pointermove', function (e) { if (!drag) return; vx = (e.clientX - px) * .004; vy = (e.clientY - py) * .004; px = e.clientX; py = e.clientY; });
  addEventListener('pointerup', function () { drag = false; });

  var running = true;
  new IntersectionObserver(function (en) { running = en[en.length - 1].isIntersecting; }).observe(host);
  var reduce2 = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = 0, last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!running) return;
    var dt = Math.min(((ts || 0) - last) / 1000, .05); last = ts || 0;
    if (!reduce2) t += dt;
    group.rotation.y += (reduce2 ? 0 : .07 * dt) + vx; group.rotation.x += vy; vx *= .92; vy *= .92;
    group.rotation.x = Math.max(-.6, Math.min(.6, group.rotation.x));
    moons.forEach(function (m, i) {
      var a = t * m.userData.speed + m.userData.phase, r = m.userData.r;
      m.position.set(Math.cos(a) * r, -Math.sin(a) * r * Math.sin(m.userData.tilt), Math.sin(a) * r * Math.cos(m.userData.tilt));
      var em = m.material.emissiveIntensity;
      var target = (state.focus === i) ? 2.2 : ((i === 0 || i === 4) ? .8 : 0);
      m.material.emissiveIntensity = em + (target - em) * .08;
      if (state.focus === i) m.material.emissive.setHex(0xa1ff62);
    });
    cam.position.z = 9 - state.dive * 7.6;                 // mergulho: 9 → 1.4
    core.material.emissiveIntensity = 1.35 + state.dive * 2.2;
    bloom.strength = .85 + state.dive * .9;
    host.style.opacity = String(1 - Math.max(0, state.dive - .8) * 5); // fade nos últimos 20%
    composer.render();
  }
  if (reduce2) { composer.render(); } else { frame(0); }
  addEventListener('resize', function () {
    var w = host.clientWidth, h = host.clientHeight;
    cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h);
    if (reduce2) composer.render();
  });
}).catch(function () { document.querySelector('#orbital .fallback-3d').style.display = 'flex'; });
</script>
```

Scripts clássicos antes do module: mock, GSAP+ScrollTrigger, Lenis (guards) — a choreography em si é Task 15; nesta task apenas os reveals simples `gsap.from` das cenas (start 'top 82%', nearBottom 96% em #s6) pra página já viver.

- [ ] **Step 2: Verificar**

Server 8601 + Playwright em `http://localhost:8601/r3-estudio/landing.html`.
Expected: 0 erros de console; canvas presente; **screenshot do hero após 3s parece render de produto** (bloom visível no núcleo e nas esferas elétrica/coral, reflexos nos materiais — LER o screenshot e julgar contra o critério do spec §5); as 6 cenas legíveis empilhadas com scroll normal; fallback exibido quando o import falha (testar bloqueando jsdelivr via `browser_evaluate`? não é possível: basta validar o `.catch` por inspeção + teste manual renomeando o importmap uma vez e recarregando, depois desfazer).

- [ ] **Step 3: Polish do 3D (máx 3 iterações)** — mexer em exposure/bloom/emissive até o screenshot convencer. Se bloom custar FPS (medir com `browser_evaluate` contando rAF por segundo; alvo ≥50), reduzir resolução do composer antes de remover o efeito.

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/r3-estudio/landing.html
git commit -m "feat(poc-v5): landing r3 parte 1 - cenas estaticas + orbital v2 com bloom"
```

---

### Task 15: Landing r3, parte 2 — choreography de scroll

**Files:**
- Modify: `prototypes/poc-v5/r3-estudio/landing.html` (bloco de choreography no script clássico)

- [ ] **Step 1: Integrar Lenis + ScrollTrigger e escrever as timelines**

```js
if (!reduce && window.Lenis && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  var lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // CENA 2: pina #s1 (onde vive o canvas) por 4 passos de destaque enquanto #s2 rola por cima?
  // Não: abordagem mais simples e robusta — pinar #s2 e mover o canvas pra ele via position:fixed é frágil.
  // Estratégia: #s1 e #s2 são irmãos; pinamos #s1 (pin do próprio hero com o canvas) com endTrigger em #s2:
  ScrollTrigger.create({
    trigger: '#s1', start: 'top top', endTrigger: '#s2', end: 'bottom bottom',
    pin: '#orbital', pinSpacing: false,
  });
  // rótulos da cena 2: cada um acende e chama o foco da lua correspondente
  gsap.utils.toArray('#s2 .mod-label').forEach(function (el, i) {
    ScrollTrigger.create({
      trigger: el, start: 'top 60%', end: 'bottom 40%',
      onEnter: function () { if (window.__orbital) window.__orbital.setFocus(i); setActive(el); },
      onEnterBack: function () { if (window.__orbital) window.__orbital.setFocus(i); setActive(el); },
    });
  });
  function setActive(el) {
    document.querySelectorAll('#s2 .mod-label').forEach(function (o) { o.style.color = 'var(--t3)'; });
    el.style.color = 'var(--t1)';
  }
  ScrollTrigger.create({ trigger: '#s3', start: 'top 80%', onEnter: function () { if (window.__orbital) window.__orbital.setFocus(-1); } });

  // CENA 3: mergulho com scrub + counter atrelado ao scroll
  var dive = { p: 0, v: 0 };
  gsap.to(dive, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: '#s3', start: 'top bottom', end: 'top 20%', scrub: .6 },
    onUpdate: function () { if (window.__orbital) window.__orbital.setDive(dive.p); },
  });
  var scoreEl = document.getElementById('score-counter');
  gsap.fromTo(dive, { v: 0 }, {
    v: (window.SL_MOCK && window.SL_MOCK.score.value) || 78, ease: 'none',
    scrollTrigger: { trigger: '#s3', start: 'top 70%', end: 'top 15%', scrub: .6 },
    onUpdate: function () { scoreEl.textContent = Math.round(dive.v); },
  });

  // CENA 4: montagem da página peça por peça (scrub)
  var tl4 = gsap.timeline({ scrollTrigger: { trigger: '#s4', start: 'top 70%', end: 'top 10%', scrub: .8 } });
  tl4.from('#s4 .piece-placa',   { y: -60, opacity: 0 })
     .from('#s4 .piece-tira',    { x: -80, opacity: 0 }, '-=.3')
     .from('#s4 .piece-bilhete', { scale: .9, opacity: 0 }, '-=.2')
     .from('#s4 .piece-materia', { y: 40, opacity: 0 }, '-=.3');

  // CENA 5: linhas entram por máscara
  gsap.utils.toArray('#s5 .line').forEach(function (l, i) {
    gsap.from(l, { yPercent: 110, duration: .8, ease: 'expo.out',
      scrollTrigger: { trigger: '#s5', start: 'top 70%' }, delay: i * .12 });
  });
} 
// reduce === true → sem Lenis, sem pins, sem scrub: cenas empilhadas com os reveals estáticos da Task 14
// (que também devem ser pulados sob reduce, ficando tudo visível).
```

Ajuste necessário da Task 14 nesta task: os reveals simples de #s2-#s5 criados na parte 1 devem ser REMOVIDOS/substituídos por esta choreography quando ela roda (senão animam duas vezes); manter os reveals simples apenas como caminho `gsap && (reduce ? nada : sem-Lenis-fallback)` — concretamente: `if (gsap && ScrollTrigger && !window.Lenis)` usa reveals simples; com Lenis presente, usa a choreography. Documentar isso num comentário curto no código.

- [ ] **Step 2: Verificar a choreography**

Server + Playwright: usar `browser_evaluate` com `window.scrollTo(0, N)` em pelo menos 4 posições (0, altura de #s2 média, topo de #s3, topo de #s4) esperando ~1s entre cada, screenshot em cada posição.
Expected: 0 erros; em #s2 o canvas segue pinado e o rótulo ativo muda de cor (checar 2 posições diferentes de #s2); em #s3 o `score-counter` mostra valor intermediário (>0 e <78) numa posição do meio do scrub e 78 no fim; em #s4 as peças aparecem progressivamente; sem jitter visível de pin (screenshot do canvas alinhado ao viewport). Reduced-motion emulado: página inteira legível, sem pin, counter mostra 78.

- [ ] **Step 3: Polish (máx 3 iterações)** — timings/starts das cenas; garantir que a transição 3D→78 lê como "mergulho".

- [ ] **Step 4: Commit**

```bash
git add prototypes/poc-v5/r3-estudio/landing.html
git commit -m "feat(poc-v5): landing r3 parte 2 - scroll-story com pin, scrub e mergulho no nucleo"
```

---

### Task 16: Sweep r3 + comparação

**Files:** ajustes nos 2 arquivos r3 se necessário.

- [ ] **Step 1: Fallbacks com CDN indisponível** — via Playwright route/abort não disponível: inspecionar por código que TODOS os blocos JS têm guards; teste prático: renomear temporariamente o src do GSAP num dos arquivos servido? NÃO editar arquivos pra teste. Alternativa concreta: `browser_evaluate` com `window.gsap = undefined` não reproduz load-order; aceitar verificação por inspeção de código (guards em todo bloco) + o teste real de reduce-motion.
- [ ] **Step 2: Greps** — `grep -n "—" prototypes/poc-v5/r3-estudio/*.html` → zero; emoji ranges → zero; `grep -LF 'SL_MOCK' prototypes/poc-v5/r3-estudio/*.html` → vazio; NBSP `od -c` nas linhas de replace → `302 240`.
- [ ] **Step 3: Console + regressão** — as 2 páginas r3 com 0 erros; as 8 páginas antigas seguem 0 erros (não foram tocadas; spot-check em 2).
- [ ] **Step 4: FPS sanity** — na landing (hero visível), `browser_evaluate` contando frames por 2s → ≥50fps a 1440x900. Se falhar: reduzir bloom resolution (`bloom.resolution`) ou DPR cap pra 1.5 e re-medir.
- [ ] **Step 5: Commit (se houve ajustes)**

```bash
git add prototypes/poc-v5/r3-estudio
git commit -m "chore(poc-v5): sweep da rodada 3"
```

## Encerramento

Apresentar ao usuário: as 2 URLs r3 + as antigas equivalentes de A pra comparação direta, e a pergunta: **a rodada 3 resolve as 3 críticas (anatomia, motion, 3D)?** Aprovada → rodada 4 (Finanças/Coach na anatomia nova) + `DESIGN-SYSTEM-v5.md`.
