# Onda 2 · lote 1: Chrome do app + Diário + camada do coach — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar o `DESIGN-SYSTEM-v5.md` (chrome com coach como camada global; Panorama vira Diário) e entregar os protótipos da Onda 2 lote 1: `prototypes/v5/app/diario.html` + `diario.mobile.html` com chrome completo (bar + ticker + modbar) e a camada do coach funcional, prontos para aprovação no hub.

**Architecture:** HTML standalone servido por http.server (padrão `prototypes/v5/`). Chrome e camada viram primitivas compartilhadas em `shared/app.css` + `shared/app.js` (`SLApp.boot()`), porque repetem em ~40 telas das ondas 2-13. Telas de app são escuras (`<html class="dk">`); a banda clara da folha usa flip `.lt` (re-declaração de vars, espelho do `.dk`). Sem GSAP/Lenis nas telas de app: motion = CSS keyframes + IntersectionObserver + count-up vanilla (padrão do r6-estudio/dashboard.html). Camada do coach = painel lateral (desktop) / bottom sheet (mobile) com scrim, aberta por gatilho no bar e pelo ask da folha.

**Tech Stack:** Google Fonts (Space Grotesk / Inter / Caveat) · CSS puro + IO · mock via `shared/mock-data.js` (`window.SL_MOCK`).

**Spec:** `docs/superpowers/specs/2026-07-31-coach-diario-v5-design.md` (ler inteira antes de começar).

**Escopo explícito:** este plano cobre o LOTE 1 da Onda 2 (chrome + camada + Diário). "Review semanal" e "Life Score detalhado" continuam na Onda 2 como lote 2, ficam `planejada` no hub e NÃO são tocadas aqui. Implementação em `web/` só depois da aprovação explícita dos protótipos (regra do programa).

---

## Regras herdadas (valem para TODAS as tasks)

- Branch `poc/ds-v5`. Commit por task, só os arquivos da task, trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- QA: Playwright MCP bloqueia `file://` → `python -m http.server 8123` na pasta `prototypes/v5` em background (matar o listener por PID depois; TaskStop não mata o filho). O server CACHEIA: validar sempre com `?v=rN`. **NUNCA curl.**
- Screenshots fullPage: forçar scroll até o fim ANTES e esperar 2-3s.
- `prefers-reduced-motion` e sem-JS = página estática completa com valores finais no HTML (E-02). Nada pré-escondido em CSS; `.anim` só entra via JS.
- Sem em-dash (—) em copy (– en-dash só em negativos). Sem emoji. Sentence case. Você/nunca "o usuário". Coach nunca cobra check-in perdido (spec, decisão 5).
- `R$` seguido de NBSP real (byte `0xC2 0xA0`); verificar com `od -c`. Valores em `.num`.
- **NUNCA `padding:X 0` (shorthand vertical) em elemento que carrega `.wrap`** (zera o gutter 4vw; reincidiu na Onda 1).
- Wordmark SEMPRE `<span class="wm">Sync<em>Life</em></span>` dentro de `.brand`/lockups (gotcha do flex gap).
- Caveat (`.hand`) exclusiva da voz do coach (E-10): o texto do check-in do usuário é Inter normal.
- PowerShell 5.1 quebra com aspas duplas em args nativos → usar a tool Bash para git/python.
- Mudança em `shared/` com ondas 0-1 aprovadas → smoke visual do hub e de 1 tela da Onda 1 no fim (Task 7).

## Estrutura de arquivos (resultado)

```
DESIGN-SYSTEM-v5.md                       ← Task 1 (§2 flip .lt, §6.1 chrome+camada, §6.2 Diário, §6.4 coach)
prototypes/v5/
├── shared/mock-data.js                   ← Task 2 (diario, ativas, dims, hoje, coach.thread/sugestoes)
├── shared/app.css                        ← Task 3 (chrome, .lt, folha, camada, check-in etc.)
├── shared/app.js                         ← Task 3 (SLApp.boot: anim/IO/count-up/camada/check-in)
├── app/diario.html                       ← Task 4 (desktop)
├── app/diario.mobile.html                ← Task 5 (390×844 dedicado)
└── index.html                            ← Task 6 (Onda 2 lote 1 com links + status)
docs/handoff/HANDOFF-v5.md                ← Task 8 (rolling)
```

---

### Task 1: DESIGN-SYSTEM-v5.md · chrome com camada, Diário, coach

**Files:**
- Modify: `DESIGN-SYSTEM-v5.md` (§2 tokens: nota do flip `.lt`; §6.1; §6.2; §6.4; §11 pendências)

- [ ] **Step 1: Adicionar o flip `.lt` na seção de tokens (§2)**

Logo após o parágrafo/bloco que documenta o padrão `.dk` (flip por re-declaração de vars), adicionar:

```markdown
O flip tem direção dupla: `.dk` escurece uma seção em página clara (landing) e `.lt`
clareia uma seção em página escura (telas do app: a folha do briefing). `.lt` re-declara
as MESMAS vars (`--bg --s1 --s2 --line --line-h --t1 --t2 --t3`) com os valores do tema
claro; filhos usam os tokens normalmente, sem vars paralelas de "paper/ink". Definido em
`prototypes/v5/shared/app.css` (chrome do app, Onda 2).
```

- [ ] **Step 2: Reescrever §6.1 (chrome do app)**

Substituir o diagrama e as notas atuais do §6.1 por:

```markdown
### 6.1 Chrome do app (substitui ModuleBar + Sidebar do v3)

    ┌──────────────────────────────────────────────────┐
    │ bar (64px sticky, blur): brand · data · coach ·  │
    │ ações                                            │
    ├──────────────────────────────────────────────────┤
    │ ticker do dia (28px, elétrico, marquee)          │
    ├──────────────────────────────────────────────────┤
    │ modbar: Diário · 01 Finanças … 08 Experiências · │
    │ Conquistas · Configurações                       │
    ├──────────────────────────────────────────────────┤
    │ conteúdo (wrap max 1180px)                       │
    └──────────────────────────────────────────────────┘

- `bar`: `position:sticky`, `background:rgba(21,19,19,.85)` + `backdrop-filter:blur(12px)`.
  À direita, o **gatilho do coach**: pílula ghost com a bússola 16px + "Pergunte ao coach",
  presente em TODAS as telas autenticadas. Abre a camada do coach (§6.4).
- `modbar`: só as 8 áreas levam número (`.n` em Space Grotesk, numeração canônica §5.2).
  Diário, Conquistas e Configurações ficam SEM número. **Não existe item Coach** (o coach
  é camada, §6.4). Sem ícones, sem cores de módulo, scrollbar oculta; ativa = `--t1` com
  `border-bottom` 2px roxo (número roxo quando houver).
- Não existe sidebar. A hierarquia interna do módulo vive na própria página.
```

- [ ] **Step 3: Reescrever §6.2 (Diário no lugar de "Edição do dia"/Panorama)**

Substituir o título e a ordem vertical do §6.2 por:

```markdown
### 6.2 Diário (substitui o Panorama; rota /dashboard mantida)

O diário que o coach escreve com você. Três diferenciais sobre um "dashboard": autoria
explícita do coach, check-in do usuário e personalização por `profiles.active_modules`.
Spec de produto: `docs/superpowers/specs/2026-07-31-coach-diario-v5-design.md`.

Ordem vertical:

1. **Masthead** — eyebrow `Edição nº N · seu diário`, saudação em display, sub de
   1 parágrafo + **selo** do Life Sync Score à direita.
2. **A folha** — banda `.lt` com o briefing do coach: eyebrow, título editorial, 2
   parágrafos de prosa com números embutidos, rabisco `.hand`, assinatura (`Escrito
   às…, com base em…`). À direita, coluna `recs`: 3 recomendações numeradas + `ask`
   em pílula, que abre a **camada do coach** com a pergunta semeada.
3. **Check-in** — "Como foi o dia?": 5 pílulas de humor + 1 linha opcional (Inter,
   nunca Caveat) + Registrar. Registrado, colapsa para `Registrado às 21:14 · …`.
   O coach nunca cobra check-in perdido; sem streak de check-in.
4. **Hoje** — linha única scroll-x com eventos/contas (`time` + tag `EM 3 DIAS`).
5. **Números do mês** — banda 4 colunas com hairlines internas, count-up.
6. **Suas áreas** — só as áreas ativas ganham linha rica (nº, nome display, metadado,
   score 22px + tendência). As demais colapsam numa linha única quieta ao final
   (`Outras: 05 Mente 71 · 07 Carreira 64 · …`), sem juízo de valor.
7. **Atenção + Metas** — grid 1.5fr/1fr filtrado pelas áreas ativas.
8. **Colofão** — projeção, streak, badges, última sincronização.
```

- [ ] **Step 4: Reescrever §6.4 (coach como camada)**

Substituir o conteúdo do §6.4 por:

```markdown
### 6.4 Coach — camada global, não destino

O coach não é um item de menu: é uma camada disponível em qualquer tela autenticada.

- **Gatilho:** pílula no `bar` (§6.1) e o `ask` da folha do Diário (pergunta semeada).
- **Camada (desktop):** painel lateral direito `min(460px, 92vw)`, altura total, fundo
  `--s1`, `border-left` hairline, scrim escuro; entra com `translateX` no easing
  assinatura. **Mobile:** bottom sheet ~86vh com handle. Fecha por scrim, botão ou Esc.
- **Conteúdo da camada:** header (eyebrow `Coach · lendo: <contexto atual>` + fechar),
  thread de bolhas (`.bub.u` roxa / `.bub.a` superfície) com **fontes citadas** (`.meta`)
  sob cada resposta, cartão **Ação executada** (borda esquerda 3px elétrica; visual do
  N3, implementação em sprint próprio), typing dots. Vazia, mostra 1 saudação curta +
  chips de sugestão (gerados pelo coach-brief) — nunca um chat em branco.
- **Askbar** fixa ao rodapé da camada: pílula escura com sombra longa.
- **Vista cheia `/coach`:** o grid conversa + margem `O que o coach enxerga` (protótipo
  r6 continua válido como linguagem). Alcançada pelo link `Conversa completa →` na
  camada; guarda o histórico contínuo com divisores de data.
- Backend por nível (N1 briefing cacheado · N2 thread persistida com fontes · N3 ações
  · N4 proatividade): ver a spec de produto.
```

- [ ] **Step 5: Atualizar pendências (§11 ou seção equivalente de checklist)**

Adicionar à lista de pendências: `- [ ] Onda 2 lote 2: Review semanal + Life Score detalhado (anatomias ainda não especificadas).` Remover/ajustar itens que digam "veredito do dashboard como conjunto" se citarem o Panorama pelo nome antigo (trocar por Diário).

- [ ] **Step 6: Commit**

```bash
git add DESIGN-SYSTEM-v5.md
git commit -m "docs(v5): DS 6.1/6.2/6.4 - chrome com camada do coach, Panorama vira Diario

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: mock-data.js · dados do Diário e da camada

**Files:**
- Modify: `prototypes/v5/shared/mock-data.js`

- [ ] **Step 1: Adicionar os novos blocos ao `window.SL_MOCK`**

Inserir depois de `extras:` (linha ~19) e antes de `financas:`; e adicionar `thread`/`sugestoes` dentro de `coach:` (manter `briefing/cross/acoes/whispers` intactos — a landing aprovada lê deles):

```js
  // áreas que o usuário ativou no onboarding (fonte: profiles.active_modules)
  ativas: ['01', '02', '04', '08'],

  diario: {
    edicao: 208,
    saudacao: 'Boa tarde, Thiago.',
    sub: 'Julho está 83% executado e a poupança segue acima da meta. Uma única atenção hoje: o lazer chegou perto do teto.',
    checkin: {
      done: false,
      opcoes: ['Péssimo', 'Ruim', 'Neutro', 'Bem', 'Ótimo'],
      doneAs: 'Registrado às 21:14',
      doneMood: 'Bem',
      doneNote: 'Dia produtivo, treino feito.',
    },
    hoje: [
      { t: '07:30', tx: 'Fisioterapia' },
      { t: 'R$ 1.200,00', tx: 'Aluguel', tag: 'EM 3 DIAS', due: true, money: true },
      { t: 'TER 10:00', tx: '1:1 com gestor' },
      { t: 'R$ 580,00', tx: 'Aporte automático', tag: 'QUA', money: true },
      { t: 'SEX 20:00', tx: 'Jantar com Ana' },
      { t: 'R$ 89,90', tx: 'Internet', tag: 'EM 5 DIAS', money: true },
    ],
  },

  // scores por área (ordem canônica; ativas ganham linha rica no Diário)
  dims: [
    { n: '01', nome: 'Finanças',     meta: 'Saldo R$ 1.840 · lazer no limite', score: 82, tr: 2 },
    { n: '02', nome: 'Futuro',       meta: '3 metas · 61% de média',           score: 74, tr: 1 },
    { n: '03', nome: 'Tempo',        meta: '9 eventos · 5/7 dias com foco',    score: 71, tr: 0 },
    { n: '04', nome: 'Corpo',        meta: '3 atividades · 126 min',           score: 64, tr: 3 },
    { n: '05', nome: 'Mente',        meta: '2 sessões de leitura',             score: 58, tr: -1 },
    { n: '06', nome: 'Patrimônio',   meta: 'R$ 48,2k · +7% no ano',            score: 76, tr: 1 },
    { n: '07', nome: 'Carreira',     meta: 'Roadmap 3/5 marcos',               score: 69, tr: 1 },
    { n: '08', nome: 'Experiências', meta: 'Itália em 92 dias',                score: 80, tr: 0 },
  ],
```

Dentro de `coach: { … }`, após `whispers`, adicionar:

```js
    saudacaoCamada: 'Já li o seu dia. O que você quer saber?',
    sugestoes: [
      'Quanto ainda posso gastar em lazer?',
      'Resumo da minha semana',
      'Simular: e se eu poupar R$ 800?',
    ],
    thread: [
      { de: 'u', tx: 'Quanto ainda posso gastar em lazer esse mês?' },
      { de: 'a', tx: 'Quase nada: R$ 10 até quinta. Você usou R$ 410 dos R$ 420 do orçamento, e o cinema de ontem (R$ 64) foi o que encostou no teto. A boa notícia: o fechamento projeta R$ 2.120.', fontes: 'Fontes: orçamento Lazer · 34 transações · projeção do mês' },
      { de: 'u', tx: 'Então antecipa o aporte da Itália pra hoje.' },
      { de: 'acao', tx: 'Transferência de R$ 580 pra Viagem Itália agendada pra hoje, 16:00. A meta vai a 70% e o saldo projetado segue positivo em R$ 1.540.', done: 'Confirmado por você · 14:04' },
    ],
```

Todos os `R$ ` acima com NBSP real após `R$` (byte `0xC2 0xA0`) ao gravar o arquivo.

- [ ] **Step 2: Verificar NBSP e sintaxe**

Run: `node -e "require('./prototypes/v5/shared/mock-data.js')"` NÃO funciona (arquivo atribui em `window`). Usar: `node -e "global.window={}; require('C:/Projetos/sync_life/prototypes/v5/shared/mock-data.js'); console.log(window.SL_MOCK.diario.edicao, window.SL_MOCK.dims.length, window.SL_MOCK.coach.thread.length)"`
Expected: `208 8 4`
Depois: `grep -c $'R\x24\xc2\xa0' prototypes/v5/shared/mock-data.js` (via Bash) retorna > 0 e `grep -n 'R\$ ' prototypes/v5/shared/mock-data.js` com espaço comum retorna vazio nos blocos novos.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/shared/mock-data.js
git commit -m "proto(v5): mock do Diario (checkin, hoje, dims, ativas) + thread da camada do coach

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: shared/app.css + shared/app.js · primitivas do chrome e da camada

**Files:**
- Create: `prototypes/v5/shared/app.css`
- Create: `prototypes/v5/shared/app.js`

- [ ] **Step 1: Escrever `app.css`**

Conteúdo completo (portado do r6-estudio/dashboard.html + coach.html com os ajustes do DS novo; carrega DEPOIS de tokens.css/base.css):

```css
/* SyncLife DS v5 — chrome do app + camada do coach (Onda 2+)
   Telas de app são escuras: <html class="dk">. Banda clara local = .lt (flip inverso). */

.lt{--bg:#f4f4f4;--s1:#ffffff;--s2:#eceaea;--line:rgba(21,19,19,.14);--line-h:rgba(21,19,19,.28);
  --t1:#151313;--t2:#4f4c4c;--t3:#6b6868;background:var(--bg);color:var(--t1)}

/* ── bar ── */
.bar{height:64px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;
  padding:0 clamp(20px,4vw,56px);position:sticky;top:0;background:rgba(21,19,19,.85);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:60}
.brand{font:700 17px var(--gro);letter-spacing:-.02em;display:inline-flex;align-items:center;gap:8px}
.brand em{font-style:normal;color:var(--roxo)}
.bar .date{font:700 10.5px var(--gro);letter-spacing:.2em;text-transform:uppercase;color:var(--t3)}
.bar .acts{display:flex;gap:10px;align-items:center}
.btn-sm{display:inline-flex;align-items:center;gap:7px;border-radius:999px;cursor:pointer;font:600 12.5px var(--int);
  transition:background .3s var(--ease),border-color .3s var(--ease),color .3s var(--ease)}
.btn-sm.ghost{background:transparent;border:1px solid var(--line);color:var(--t2);padding:8px 15px}
.btn-sm.ghost:hover{border-color:var(--line-h);color:var(--t1)}
.btn-sm.roxo{background:var(--roxo);border:none;color:#fff;padding:8px 17px}
.btn-sm.roxo:hover{background:var(--roxo-h)}
/* gatilho do coach: pílula ghost com a bússola */
.coach-pill{border-color:rgba(104,64,255,.5);color:var(--t1)}
.coach-pill:hover{border-color:var(--roxo)}
.coach-pill svg{flex-shrink:0}

/* ── ticker ── */
.ticker{overflow:hidden;background:var(--ele);height:28px;display:flex;align-items:center;white-space:nowrap}
.ticker .tk{display:inline-block;font:700 10px var(--gro);letter-spacing:.16em;color:#151313}
.anim .ticker .tk{animation:sl-mqtk 46s linear infinite}
@keyframes sl-mqtk{from{transform:translateX(0)}to{transform:translateX(-25%)}}
.ticker span{padding:0 18px}

/* ── modbar (Diário/Conquistas/Config SEM número; sem item Coach) ── */
.modbar{border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
.modbar::-webkit-scrollbar{display:none}
.modbar .in{display:flex;gap:2px;padding:0 clamp(20px,4vw,56px);min-width:max-content}
.modbar a{display:flex;align-items:baseline;gap:7px;padding:13px 14px;font:600 12px var(--int);color:var(--t3);
  border-bottom:2px solid transparent;transition:color .3s var(--ease),border-color .3s var(--ease);white-space:nowrap}
.modbar a .n{font:700 10.5px var(--gro)}
.modbar a:hover{color:var(--t1)}
.modbar a.on{color:var(--t1);border-bottom-color:var(--roxo)}
.modbar a.on .n{color:var(--roxo)}

/* ── colofão ── */
.colofao{border-top:1px solid var(--line);padding:22px clamp(20px,4vw,56px);display:flex;justify-content:space-between;
  gap:14px;flex-wrap:wrap;font:400 12px var(--int);color:var(--t3)}
.colofao b{color:var(--t2);font-weight:600;font-family:var(--gro)}
.colofao .r{display:flex;gap:22px;flex-wrap:wrap}

/* ── bolhas de conversa (camada e vista cheia) ── */
.bub{max-width:82%;padding:13px 17px;font:400 13.5px/1.65 var(--int)}
.bub strong{color:var(--t1);font-weight:600}
.bub .w{color:var(--coral);font-weight:600}
.bub.u{align-self:flex-end;background:var(--roxo);color:#fff;border-radius:16px 16px 4px 16px}
.bub.u strong{color:#fff}
.bub.a{align-self:flex-start;background:var(--s2);border:1px solid var(--line);color:var(--t2);border-radius:16px 16px 16px 4px}
.bub .meta{display:block;font:500 10px var(--gro);letter-spacing:.14em;text-transform:uppercase;color:var(--t3);margin-top:9px}
.action{align-self:flex-start;border:1px solid var(--line);border-left:3px solid var(--ele);border-radius:12px;
  padding:13px 16px;max-width:82%;background:#1b1918}
.action .al{font:700 9.5px var(--gro);letter-spacing:.18em;text-transform:uppercase;color:var(--ele);margin-bottom:6px}
.action p{font:400 12.5px/1.6 var(--int);color:var(--t2)}
.action p b{color:var(--t1);font-weight:600;font-family:var(--gro)}
.action .done{display:inline-flex;align-items:center;gap:7px;margin-top:10px;font:600 11.5px var(--int);color:var(--ele)}
.typing{align-self:flex-start;display:flex;gap:5px;padding:12px 16px;background:var(--s2);border:1px solid var(--line);
  border-radius:16px 16px 16px 4px}
.typing i{width:6px;height:6px;border-radius:50%;background:var(--t3)}
.anim .typing i{animation:sl-tdot 1s var(--ease) infinite;animation-delay:calc(var(--i)*.18s)}
@keyframes sl-tdot{0%,100%{transform:none;opacity:.5}50%{transform:translateY(-3px);opacity:1}}

/* ── camada do coach ── */
.scrim{position:fixed;inset:0;background:rgba(13,12,11,.55);backdrop-filter:blur(3px);z-index:75;
  opacity:0;pointer-events:none;transition:opacity .4s var(--ease)}
.scrim.open{opacity:1;pointer-events:auto}
.camada{position:fixed;top:0;right:0;bottom:0;width:min(460px,92vw);background:var(--s1);
  border-left:1px solid var(--line);z-index:80;display:flex;flex-direction:column;
  transform:translateX(105%);transition:transform .55s var(--ease);
  box-shadow:-24px 0 60px -30px rgba(0,0,0,.6)}
.camada.open{transform:none}
.camada .chead{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:18px 22px;border-bottom:1px solid var(--line)}
.camada .chead .x{background:none;border:1px solid var(--line);border-radius:999px;width:32px;height:32px;
  display:inline-flex;align-items:center;justify-content:center;color:var(--t2);cursor:pointer;
  transition:border-color .3s var(--ease),color .3s var(--ease)}
.camada .chead .x:hover{border-color:var(--line-h);color:var(--t1)}
.camada .cbody{flex:1;overflow-y:auto;padding:22px;display:flex;flex-direction:column;gap:12px}
.camada .hello{font:400 13.5px/1.6 var(--int);color:var(--t2)}
.camada .csug{display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-top:4px}
.camada .csug .chip{font:500 12px var(--int);color:var(--t2);border:1px solid var(--line);border-radius:999px;
  padding:8px 14px;cursor:pointer;background:transparent;text-align:left;
  transition:border-color .3s var(--ease),color .3s var(--ease)}
.camada .csug .chip:hover{border-color:rgba(104,64,255,.55);color:var(--t1)}
.camada .divider{display:flex;align-items:center;gap:14px;font:700 9.5px var(--gro);letter-spacing:.2em;
  color:var(--t3);text-transform:uppercase;margin:6px 0}
.camada .divider::before,.camada .divider::after{content:"";flex:1;height:1px;background:var(--line)}
.camada .cask{padding:14px 18px 18px;border-top:1px solid var(--line)}
.camada .cask .in{display:flex;align-items:center;gap:11px;background:#1b1918;border:1px solid var(--line-h);
  border-radius:999px;padding:13px 19px}
.camada .cask .in:focus-within{border-color:rgba(104,64,255,.55)}
.camada .cask input{flex:1;background:none;border:none;outline:none;color:var(--t1);font:400 13.5px var(--int)}
.camada .cask input::placeholder{color:var(--t3)}
.camada .cask svg{color:var(--roxo);flex-shrink:0}
.camada .cfull{display:block;text-align:center;font:500 11.5px var(--int);color:var(--t3);padding:0 0 14px;
  transition:color .3s var(--ease)}
.camada .cfull:hover{color:var(--t1)}
/* variante mobile: bottom sheet */
.camada.sheet{top:auto;left:0;right:0;height:86vh;width:auto;border-left:none;border-top:1px solid var(--line-h);
  border-radius:22px 22px 0 0;transform:translateY(105%)}
.camada.sheet.open{transform:none}
.camada.sheet .handle{width:44px;height:4px;border-radius:2px;background:var(--line-h);margin:10px auto 0}
```

- [ ] **Step 2: Escrever `app.js`**

```js
// SyncLife DS v5 — boot das telas de app (Onda 2+). Requer mock-data.js antes.
// SLApp.boot(): gate .anim (reduce = página estática), reveals IO, count-up, camada do coach, check-in.
window.SLApp = (function () {
  function boot() {
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
        var inp = camada.querySelector('.cask input'); if (inp) { inp.value = seed || ''; inp.focus(); }
      }
      function close() { camada.classList.remove('open'); scrim.classList.remove('open'); }
      function play() { // chip ou envio: mostra a conversa mock no lugar do estado vazio
        if (empty) empty.style.display = 'none';
        if (thread) thread.hidden = false;
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
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }

    // ── check-in ──
    var ck = document.querySelector('.checkin');
    if (ck) {
      var pills = ck.querySelectorAll('.mood'); var doneBox = ck.querySelector('.ck-done');
      var form = ck.querySelector('.ck-form'); var picked = null;
      pills.forEach(function (p) {
        p.addEventListener('click', function () {
          pills.forEach(function (q) { q.classList.remove('on'); });
          p.classList.add('on'); picked = p.textContent;
        });
      });
      var btn = ck.querySelector('.ck-save');
      if (btn) btn.addEventListener('click', function () {
        if (!picked) return;
        var note = ck.querySelector('.ck-note');
        var out = doneBox.querySelector('[data-out]');
        if (out) out.textContent = picked + (note && note.value ? ' · "' + note.value + '"' : '');
        form.hidden = true; doneBox.hidden = false;
      });
    }
  }
  return { boot: boot };
})();
```

- [ ] **Step 3: Sanidade de sintaxe**

Run: `node --check prototypes/v5/shared/app.js`
Expected: sem output (exit 0).

- [ ] **Step 4: Commit**

```bash
git add prototypes/v5/shared/app.css prototypes/v5/shared/app.js
git commit -m "proto(v5): primitivas do chrome do app + camada do coach (app.css/app.js, flip .lt)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: app/diario.html · Diário desktop

**Files:**
- Create: `prototypes/v5/app/diario.html`
- Base visual: `prototypes/poc-v5/r6-estudio/dashboard.html` (anatomia/medidas/copy) + `coach.html` (bolhas/askbar). Ler os dois ANTES.

- [ ] **Step 1: Escrever a página**

`<html lang="pt-BR" class="dk">`. Head: charset, viewport, `<title>SyncLife · Diário · v5</title>`, favicon SVG da bússola (copiar data URI de `prototypes/v5/index.html`), Google Fonts (Space Grotesk 400;500;700 · Inter 400;500;600 · Caveat 600;700), `../shared/tokens.css` + `../shared/base.css` + `../shared/app.css`, e `<style>` inline SÓ com o CSS específico da tela (mast/selo/folha/recs/ask/checkin/hoje/nums/dims/aten/metas — portar do r6-estudio/dashboard.html trocando `--paper/--ink/--ink2/--pline` pelo flip `.lt`: a folha vira `<section class="folha lt">` e os estilos internos usam `--t1/--t2/--line` normais; `.ask` fica `background:var(--s1)`).

Body na ordem (conteúdo = valores do `SL_MOCK`, hardcoded como fallback estático idêntico ao mock):

```html
<div class="grain" aria-hidden="true"></div>

<header class="bar">
  <a class="brand" href="#"><svg><!-- bússola 20px: copiar o SVG do brand de prototypes/v5/index.html --></svg>
    <span class="wm">Sync<em>Life</em></span></a>
  <span class="date">Sexta · 31 de julho de 2026</span>
  <div class="acts">
    <button class="btn-sm ghost" type="button">Revisão semanal</button>
    <button class="btn-sm ghost coach-pill" type="button" data-coach-open>
      <svg width="15" height="15" viewBox="0 0 64 64" aria-hidden="true"><!-- mini bússola: 4 ticks + agulha roxa, portar do brand --></svg>
      Pergunte ao coach</button>
    <button class="btn-sm roxo" type="button">+ Nova entrada</button>
  </div>
</header>

<div class="ticker" aria-hidden="true"><div class="tk"><!-- 4 repetições de:
  SCORE 78 ▲4 · POUPANÇA 37% · LAZER 98% DO ORÇAMENTO · ITÁLIA EM 92 DIAS · --></div></div>

<nav class="modbar" aria-label="Módulos">
  <div class="in">
    <a class="on" href="#">Diário</a>
    <a href="#"><span class="n">01</span>Finanças</a>
    <!-- 02 Futuro … 08 Experiências, numeração canônica -->
    <a href="#">Conquistas</a>   <!-- SEM número (não é área da bússola) -->
    <a href="#">Configurações</a><!-- SEM número -->
  </div>
</nav>

<main>
  <!-- 1 · masthead: portar .mast do r6 dashboard trocando o eyebrow para
       "Edição nº 208 · seu diário"; h1 = SL_MOCK.diario.saudacao; sub = SL_MOCK.diario.sub;
       selo idêntico (LIFE SYNC SCORE · 78 data-cnt · +4 esta semana · No ritmo · como melhorar →) -->

  <!-- 2 · A FOLHA (class="folha lt"): article do briefing IGUAL ao r6 (h2, 2 .body, .draw+.hand,
       .ass "Escrito às 14:05, com base no seu julho até aqui: 34 transações, 6 orçamentos e 3 metas.")
       + aside .recs com as 3 recs. A pílula .ask vira <button class="ask" data-coach-open
       data-coach-seed="Pergunte algo sobre o seu mês">…</button> -->

  <!-- 3 · CHECK-IN: <section class="checkin"> dentro do .wrap, banda entre hairlines:
       grid 2 colunas (1.2fr/1fr), padding-top/bottom 30px, border-bottom 1px var(--line).
       Esquerda: eyebrow "Check-in" + frase "Como foi o dia?" (Space Grotesk 20px) +
       .moods: 5 <button class="mood">Péssimo…Ótimo</button> (pílulas ghost; .on = borda roxa + t1).
       Direita (.ck-form): <input class="ck-note" placeholder="Uma linha sobre hoje (opcional)">
       (input objeto: bg var(--s1), border var(--line), radius 12, padding 12px 16px) +
       <button class="btn-sm roxo ck-save">Registrar</button>.
       Estado registrado (.ck-done, hidden): linha única discreta
       "Registrado às 21:14 · <b data-out>Bem · 'Dia produtivo, treino feito.'</b>" em t3 13px.
       NUNCA copy de cobrança; sem streak de check-in. -->

  <!-- 4 · HOJE: portar .hoje do r6 exatamente (usa SL_MOCK.diario.hoje) -->

  <!-- 5 · NÚMEROS DO MÊS: portar .nums do r6 (Saldo 1840 / Receitas 5000 / Despesas 3160 / Poupança 37%) -->

  <!-- 6 · SUAS ÁREAS (substitui "As 8 dimensões"):
       .dims-head: eyebrow "Suas áreas" + <a>Ver todas →</a>.
       Grid .dims 2 colunas SÓ com as ativas (01 Finanças, 02 Futuro, 04 Corpo, 08 Experiências),
       cada .dimrow igual ao r6 (nº, nome, metadado, score + tendência ▲ ele / ▼ coral / – t3).
       Abaixo, linha única quieta (.outras, font 12px t3, padding 14px 0, border-top hairline):
       "Outras: 03 Tempo 71 · 05 Mente 58 · 06 Patrimônio 76 · 07 Carreira 69" (números .num). -->

  <!-- 7 · ATENÇÃO + METAS: portar .aten do r6, mas SÓ notas/metas das áreas ativas:
       manter as 4 notas do r6 (Lazer 410/420, Moradia 86%, Aporte de quarta OK, Streak 12d,
       todas são de áreas ativas) e as 3 metas (Viagem Itália 68% · Reserva 80% · MBA 34%). -->

  <!-- 8 · COLOFÃO: portar do r6 -->
</main>

<!-- camada do coach (fechada por padrão; markup completo) -->
<div class="scrim"></div>
<aside class="camada" aria-label="Coach">
  <header class="chead">
    <p class="eyebrow"><b>Coach</b> · lendo: seu diário de hoje</p>
    <button class="x" type="button" aria-label="Fechar">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </header>
  <div class="cbody">
    <div class="cempty">
      <p class="hello">Já li o seu dia. O que você quer saber?</p>
      <div class="csug">
        <button class="chip" type="button">Quanto ainda posso gastar em lazer?</button>
        <button class="chip" type="button">Resumo da minha semana</button>
        <button class="chip" type="button">Simular: e se eu poupar R$ 800?</button>
      </div>
    </div>
    <div class="cthread" hidden style="display:flex;flex-direction:column;gap:12px">
      <div class="divider">Hoje · 14:02</div>
      <!-- bolhas de SL_MOCK.coach.thread: .bub.u / .bub.a com .meta / .action com .al
           "Ação executada" + .done (visual N3; sem backend) + .typing no fim -->
    </div>
  </div>
  <form class="cask"><div class="in">
    <input type="text" placeholder="Pergunte qualquer coisa sobre a sua vida">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  </div></form>
  <a class="cfull" href="#">Conversa completa →</a>
</aside>

<!-- ══ Estados · anotação do protótipo (padrão da Onda 1; fora do fluxo do app) ══
     Banda separada por hairline dupla com 3 espécimes estáticos lado a lado:
     (a) camada ABERTA com a conversa mock (mesmo markup, position:static, sempre visível);
     (b) check-in REGISTRADO (estado .ck-done visível);
     (c) camada vazia (saudação + chips). Cada um com eyebrow de anotação. -->

<script src="../shared/mock-data.js"></script>
<script src="../shared/app.js"></script>
<script>SLApp.boot()</script>
```

Regras: boots `.boot .b1…b5` nas seções como no r6; media query `max-width:960px` portada; todos os `R$` com NBSP real; NENHUM comentário-guia sobrando no arquivo final.

- [ ] **Step 2: Espiar no navegador (subjetivo, sem QA formal ainda)**

Run (Bash, background): `cd prototypes/v5 && python -m http.server 8123`
Navegar `http://localhost:8123/app/diario.html?v=r1` via Playwright MCP; screenshot fullPage (scroll até o fim + 2s de espera). Abrir a camada pelo gatilho, screenshot. Conferir visualmente contra o r6 e a spec.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/diario.html
git commit -m "proto(v5): Diario desktop - onda 2 lote 1 (chrome novo + check-in + suas areas + camada)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: app/diario.mobile.html · Diário mobile dedicado (390×844)

**Files:**
- Create: `prototypes/v5/app/diario.mobile.html`
- Base: `diario.html` (Task 4) + padrão mobile da Onda 1 (ver `prototypes/v5/auth/onboarding.mobile.html` para o esqueleto de página mobile dedicada).

- [ ] **Step 1: Escrever a página**

Protótipo DEDICADO (não breakpoint): mesma head do desktop. Diferenças estruturais:

- `bar` 56px: brand (bússola + `<span class="wm">`), à direita SÓ o gatilho do coach como ícone-pílula compacto (bússola 15px + "Coach") e o `+` roxo. Sem data, sem "Revisão semanal".
- `ticker` 24px, mesma marquee.
- `modbar` idêntica (scroll-x já resolve mobile).
- `mast` empilhado: eyebrow, h1 32px, sub; selo vira faixa horizontal compacta (score 40px à esquerda + "+4 esta semana · No ritmo" à direita), border hairline, sem breathe.
- `folha lt` 1 coluna: briefing, rabisco, assinatura; recs abaixo com border-top dashed; `.ask` idêntico (data-coach-open).
- `checkin` empilhado: frase, 5 pílulas em wrap, input, Registrar.
- `hoje` scroll-x igual (`.phone-scroll` conceito: scrollbar oculta).
- `nums` 2×2.
- `Suas áreas` 1 coluna (4 dimrows) + linha "Outras:".
- `aten/metas` empilhados. `colofao` empilhado (coluna, gap 8px).
- Camada = `.camada.sheet` (bottom sheet 86vh com `.handle`), mesmo conteúdo do desktop.
- Mesma banda final "Estados · anotação do protótipo" com os 3 espécimes.
- CSS específico inline; largura de projeto 390px (`body{max-width:100%}`, testar em viewport 390×844).

- [ ] **Step 2: Espiar em 390×844**

Playwright MCP: resize 390×844 → `http://localhost:8123/app/diario.mobile.html?v=r1` → screenshot fullPage; abrir sheet do coach, screenshot.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/diario.mobile.html
git commit -m "proto(v5): Diario mobile dedicado 390x844 - onda 2 lote 1 (sheet do coach)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Hub · Onda 2 lote 1 com links e status

**Files:**
- Modify: `prototypes/v5/index.html` (array `ONDAS`, entradas `02` e `03`)

- [ ] **Step 1: Atualizar as ondas 02 e 03**

Substituir a entrada da onda 02 e a da 03 por:

```js
    { n: '02', titulo: 'Chrome do app + Diário', tam: 'L', telas: [
      ['Diário (chrome novo + check-in + suas áreas)', 'app/diario.html', 'app/diario.mobile.html', 'aprovacao'],
      ['Camada do coach (dentro do Diário: gatilho no bar e ask da folha)', 'app/diario.html', 'app/diario.mobile.html', 'aprovacao'],
      ['Review semanal (lote 2)', null, null, 'planejada'],
      ['Life Score detalhado (lote 2)', null, null, 'planejada'],
    ]},
    { n: '03', titulo: 'Coach (vista cheia /coach + backend N1-N2)', tam: 'M', telas: [
      ['Conversa completa (vista cheia da camada)', null, null, 'planejada'],
    ]},
```

- [ ] **Step 2: Smoke do hub**

Playwright MCP: `http://localhost:8123/index.html?v=r2` → conferir que as ondas renderizam, links da 02 abrem o Diário, console sem erros.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/index.html
git commit -m "proto(v5): hub - onda 2 lote 1 (Diario + camada) em aprovacao

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: QA de protótipo (as 2 telas + hub + regressão Onda 0/1)

**Files:**
- Modify (se QA reprovar): `prototypes/v5/app/diario.html`, `app/diario.mobile.html`, `shared/app.css`, `shared/app.js`

- [ ] **Step 1: Console limpo e sem overflow**

Com o http.server de pé, para `app/diario.html?v=qa1` e `app/diario.mobile.html?v=qa1` (390×844):
- Console: 0 erros, 0 warnings de recurso (favicon incluso).
- `document.documentElement.scrollWidth === document.documentElement.clientWidth` (sem scroll-x).

- [ ] **Step 2: Interações da camada e do check-in**

Em cada tela: (a) gatilho do bar abre a camada com estado vazio (saudação + 3 chips); (b) clicar num chip troca para a conversa mock (bolhas + fontes + Ação executada + typing); (c) Esc e scrim fecham; (d) `.ask` da folha abre a camada com o input focado; (e) selecionar humor + Registrar colapsa o check-in para o estado registrado.

- [ ] **Step 3: E-02 (reduce/no-JS)**

Playwright com `prefers-reduced-motion: reduce` (ou bloquear JS): a página inteira renderiza estática com valores finais; a banda "Estados · anotação do protótipo" mostra camada aberta, camada vazia e check-in registrado. Nada invisível.

- [ ] **Step 4: Varreduras de texto**

Via Bash em `prototypes/v5/app/` e `shared/{app.css,app.js,mock-data.js}`:
- `grep -n '—'` → vazio (em-dash proibido).
- `grep -n 'R\$ '` (espaço comum após R$) → vazio; `od -c` confirma `302 240` numa amostra.
- `grep -n 'padding:[0-9][^;]* 0[;}]'` nos elementos com `.wrap` → inspecionar manualmente qualquer hit.
- `grep -n 'Math.random\|Date.now'` → vazio nos arquivos novos.

- [ ] **Step 5: Regressão de shared/ (ondas aprovadas)**

`app.css`/`app.js` são arquivos NOVOS e `mock-data.js` só ganhou chaves novas, então a regressão esperada é zero; ainda assim (regra do programa): abrir `index.html`, `landing/landing-viva.html` e `auth/login.html` com `?v=qa1` e conferir visual + console.

- [ ] **Step 6: Commit dos fixes (se houver)**

```bash
git add prototypes/v5
git commit -m "proto(v5): fixes de QA da onda 2 lote 1

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Matar o http.server (PID do listener na 8123).

---

### Task 8: Handoff rolling

**Files:**
- Modify: `docs/handoff/HANDOFF-v5.md`

- [ ] **Step 1: Atualizar o handoff**

Na tabela de ondas: Onda 2 → "lote 1 em aprovação (Diário + camada do coach)". Nova entrada datada 2026-07-31 com: decisão de produto (spec coach+diário, link), o que foi prototipado (2 telas + app.css/app.js + flip .lt + hub), gotchas novos encontrados na execução, e o próximo passo (aprovação do usuário → implementação em `web/`; lote 2 = Review semanal + Life Score).

- [ ] **Step 2: Commit final da sessão**

```bash
git add docs/handoff/HANDOFF-v5.md
git commit -m "docs(v5): handoff onda 2 lote 1 - Diario + camada do coach em aprovacao

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Fora deste plano

- Aprovação do usuário (gate do programa) e ajustes de rodada 2+ dos protótipos.
- Implementação em `web/` (route group, `styles/` v5, migrations `coach_briefs`/`coach_messages`/`daily_checkins`, citações no `buildModuleContext`): plano próprio pós-aprovação.
- Onda 2 lote 2 (Review semanal, Life Score detalhado) e Onda 3 (vista cheia + backend N1/N2).
