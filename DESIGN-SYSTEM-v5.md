# SyncLife — Design System v5 "Estúdio"

> **Status: v5.0-poc (draft).** Consolidado a partir dos 4 protótipos aprovados em
> `prototypes/poc-v5/r6-estudio/{landing,dashboard,financas,coach}.html` (branch `poc/ds-v5`).
> A linguagem visual, a paleta e a anatomia descritas aqui são **lei** (aprovadas pelo usuário
> em 2026-07-28). Indicadores, gráficos e funcionalidades que aparecem nos protótipos são
> **ilustrativos**: a definição real de conteúdo será feita depois, módulo a módulo.
>
> **Fonte de verdade visual:** os próprios protótipos em `prototypes/poc-v5/r6-estudio/`
> (as 4 telas + `marca-bussola.html` para a marca).
> Em caso de divergência entre este documento e os protótipos, os protótipos vencem.

---

## 1. Conceito

O v5 abandona a lógica de "dashboard de widgets" e trata cada tela como uma **publicação
editorial**: a página é uma edição diária escrita pela IA, com evidência em listas densas,
números grandes e fio tipográfico, não em cards.

Os cinco pilares:

1. **Editorial, não painel.** Hairlines (`1px`) separam conteúdo; caixas só existem quando o
   elemento é um *objeto* (selo, mini-tela, cartão de ação, barra de pergunta).
2. **A IA é o redator.** O briefing do Consultor IA abre a página em prosa, assinado, com as
   fontes que usou. Não é um card entre outros: é a matéria de capa.
3. **Um número grande por dobra.** Score no selo, saldo na banda de números, projeção no
   colofão. O resto é tipografia de apoio.
4. **Ritmo claro/escuro.** Bandas claras ("papel") e escuras alternam dentro da mesma página.
   Objetos flutuantes (nav, mini-telas) são sempre escuros, para contraste de objeto.
5. **Interação com física, sem sequestrar o scroll.** Drag com inércia, hovers em tudo,
   Lenis suave. Nenhum pin, nenhum scroll-jacking.

Referências que calibraram a linguagem: osmo.supply (estrutura, pill nav + ticker,
anotações manuscritas, acento como superfície), Jeton (espécimes com deriva), Phamily
(marca-texto), Copilot Money "Dispatch" (digest narrativo do dashboard).

---

## 2. Tokens

### 2.1 Cor

```css
:root{
  /* modo escuro (app) / bandas escuras */
  --bg:   #151313;               /* fundo da página */
  --s1:   #201d1d;               /* superfície 1 (bolha do coach, inputs) */
  --s2:   #2a2727;               /* superfície 2 (trilha de progresso) */
  --line:   rgba(255,255,255,.08);  /* hairline padrão */
  --line-h: rgba(255,255,255,.18);  /* hairline em hover / ênfase */
  --t1:   #f4f4f4;               /* texto primário */
  --t2:   #b8b8b8;               /* texto secundário */
  --t3:   #817f7f;               /* texto terciário (labels, eyebrows) */

  /* modo claro (landing) / bandas claras */
  --bg-light:   #f4f4f4;
  --s1-light:   #ffffff;
  --s2-light:   #eceaea;
  --line-light:   rgba(21,19,19,.12);
  --line-h-light: rgba(21,19,19,.28);
  --t1-light: #151313;
  --t2-light: #4f4c4c;
  --t3-light: #6b6868;

  /* banda "papel" dentro de página escura (folha do briefing) */
  --paper: #f4f4f4;
  --ink:   #151313;
  --ink2:  #4f4c4c;
  --pline: rgba(21,19,19,.14);

  /* tri-acento (invariante em qualquer modo) */
  --roxo:   #6840ff;   /* ação, marca, navegação ativa */
  --roxo-h: #7a55ff;   /* hover do roxo */
  --ele:    #a1ff62;   /* positivo, dado vivo, ticker, highlight */
  --coral:  #f84131;   /* alerta, limite, caligrafia do coach */

  --ease: cubic-bezier(.625,.05,0,1);
}
```

Superfícies de objeto usadas nos protótipos (fora de token, mas recorrentes):
`#0d0c0cf2` (pill nav, com blur), `#1b1918` (mini-telas, askbar, cartão de ação),
`#161414` (titlebar da mini-tela), `#242020` (bolha do coach em banda escura),
`#2e2a2a` (trilhas dentro de mini-telas).

**Papéis do tri-acento (regra dura):**

| Acento | Papel | Exemplos nos protótipos |
|---|---|---|
| `--roxo` | Ação e marca | CTA `.btn-roxo`, "Life" no logotipo, tab ativa da modbar, número das recomendações, bolha do usuário, coluna PRO, `::selection` |
| `--ele` (elétrico) | Positivo e dado vivo | Ticker, deltas `+8%`, sparkline, anel de progresso, `.hl`, borda do cartão "Ação executada", selo `+3 esta semana` |
| `--coral` | Alerta e voz do coach | Orçamento estourado, valores `– R$ 64,00` acima do limite, tag `EM 3 DIAS`, caligrafia `.hand` e setas |

**Proibições:**
- Nenhum acento vira fundo de seção, exceto: ticker (elétrico) e coluna PRO da tabela de
  preços (roxo). "Acento como superfície" é dispositivo raro e intencional.
- Nada de gradientes de marca. O único gradiente permitido é funcional (área sob sparkline,
  fade do askbar).
- **Cor de módulo não existe no v5.** Módulos são identificados por **índice numerado**
  (`01 Finanças … 08 Experiências`), não por cor (substitui o G-06 do v3).

### 2.2 Alternância claro/escuro (padrão `.dk` / "folha")

Não há mais "4 temas selecionáveis" como no v3. O v5 define **modo por contexto**:

- **Landing:** página clara; seções escuras recebem a classe `.dk`, que re-declara as mesmas
  CSS vars (`--bg`, `--s1`, `--line`, `--t1`…) com os valores dark. Os componentes não sabem
  em que modo estão: leem sempre as mesmas vars.
- **App:** página escura; a banda do briefing ("folha") usa `--paper/--ink/--ink2/--pline`
  para simular papel impresso.
- **Objetos sempre escuros:** pill nav (`.navwrap`) e mini-telas (`.scard`) re-declaram as
  vars dark localmente, mesmo em página clara. É isso que dá o contraste de objeto do Osmo.

```css
/* padrão de flip: a classe re-declara as vars, o componente não muda */
.dk{--bg:#151313;--s1:#201d1d;--s2:#2a2727;--line:rgba(255,255,255,.08);
  --line-h:rgba(255,255,255,.18);--t1:#f4f4f4;--t2:#b8b8b8;--t3:#817f7f;
  background:var(--bg);color:var(--t1)}
```

> Tema selecionável pelo usuário (claro/escuro global no app) é decisão de produto ainda
> aberta; o DS suporta via o mesmo mecanismo de re-declaração.

### 2.3 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display + números | **Space Grotesk** (400/500/700) | Títulos, manchetes, scores, KPIs, todos os valores numéricos |
| Body | **Inter** (400/500/600) | Texto corrido, labels, botões, listas |
| Caligrafia | **Caveat** (600/700) | **Exclusiva da voz do coach** (`.hand`), nunca em chrome ou dados |

```css
.num{font-family:var(--gro);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.eyebrow{font:700 10px var(--gro);letter-spacing:.22em;text-transform:uppercase;color:var(--t3)}
.hand{font:700 19px/1.25 'Caveat',cursive;color:var(--coral);letter-spacing:.01em}
.hand.rx{color:var(--roxo)}
```

Escala (valores dos protótipos):

| Elemento | Spec |
|---|---|
| Manchete landing (h1) | `500 clamp(3.4rem,9.2vw,8.6rem)/0.98`, tracking `-.055em` |
| H2 de seção landing | `500 clamp(2.1rem,4.6vw,4rem)/1.05`, tracking `-.045em` |
| Masthead app (h1) | `500 clamp(34px,4.6vw,58px)/1.02`, tracking `-.045em` (módulo: `clamp(30px,4vw,50px)`) |
| Score no selo | `700 64px/1` (dashboard) / `52px` (módulo), tracking `-.05em` |
| Banda de números | `700 clamp(28px,3.4vw,44px)/1`, tracking `-.04em` |
| Espécime score (landing) | `700 96px/1`, tracking `-.06em` |
| Eyebrow | `700 10–10.5px`, tracking `.22em`, uppercase, `--t3` |
| Body | `400 14–15.5px/1.55–1.75` Inter |
| Ticker | `700 10px` Space Grotesk, tracking `.16em` |
| Colofão / metadados | `400 11–12px` Inter, valores em `.num` |

**Regras:**
- Todo valor numérico (moeda, %, contagem, hora) usa `.num`. Sem exceção, sem mono.
- Títulos display usam peso **500** (não 700): a manchete é grande, não gorda. 700 fica
  para números e eyebrows.
- Itálico só via `<em>` re-estilizado como cor (`font-style:normal;color:var(--roxo)`).

### 2.4 Máscara de valores (herda o G-08 do v3)

| Tipo | Formato | Exemplo |
|---|---|---|
| Moeda BRL | `R$ X.XXX,XX` com **NBSP** após `R$` | `R$ 1.840,00` |
| Moeda curta (bandas, ticker) | sem centavos | `R$ 1.840`, `R$ 48,2k` |
| Negativo | `– R$ X,XX` (en-dash + espaço) | `– R$ 320,00` |
| Delta | `+8%` elétrico / `▼1` coral / `–` neutro `--t3` | `+12% vs junho` |
| Percentual | `X%` | `37%`, `98%` |
| Locale | sempre `toLocaleString('pt-BR')` | `8.600` |

---

## 3. Motion

### 3.1 Easing e durações

Uma única curva assinatura para tudo que não é linear:

```css
--ease: cubic-bezier(.625,.05,0,1);
```

| Duração | Uso |
|---|---|
| `.3s` | Micro (hover de botão, cor, borda, seta da rec) |
| `.35–.5s` | Transform de objeto (scard hover, chevron do FAQ) |
| `.6–.7s` | Reveals de scroll (`.rv`) e boot do app |
| `.85s` | Boot da landing |
| `1s` | Varredura do marca-texto `.hl` |
| `1.1–1.2s` | Setas que se desenham (`.draw`), barras que preenchem (`fill`), count-up (JS, easing `1-Math.pow(1-t,4)`) |
| `40–80s` linear | Marquees (ticker 40–46s, marquee de módulos 80s) |

### 3.2 Gate de motion (obrigatório)

O HTML nasce com **valores finais**. O JS adiciona `.anim` ao `<html>` apenas quando
`!prefers-reduced-motion`; TODA animação vive escopada sob `.anim`:

```js
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) document.documentElement.classList.add('anim');
```

Sem JS ou com reduce: página completa, estática, legível. Validação: remover `.anim` e
medir opacity computada = 1 em tudo.

### 3.3 Padrões de entrada

- **Boot orquestrado:** classes `.boot .b1….b7` com stagger de ~80–90ms
  (`rise`: `translateY(14–24px)` + fade, `backwards`).
- **Reveal de scroll:** `.rv` via IntersectionObserver
  (`threshold: .12–.15`, `rootMargin: '0px 0px -30/-40px 0px'`, unobserve após entrar).
- **Count-up:** `[data-cnt]` + `data-prefix`/`data-suffix` (entidades `R$&nbsp;` viram NBSP),
  IO `threshold: .5`, 1100ms, `toLocaleString('pt-BR')`. Uma vez só.
- **Preenchimento de barras:** width final no CSS var `--w`, `@keyframes fill{from{width:0}}`
  com delay escalonado `--d`.

### 3.4 Scroll

- **Lenis** na landing: `new Lenis({ lerp: .16, wheelMultiplier: 1.05 })`, guarded
  (`!reduce && window.Lenis`), página funciona sem.
- **GOTCHA PERMANENTE:** nunca combinar Lenis com `scroll-behavior:smooth` no CSS. O browser
  re-suaviza cada frame do Lenis e o wheel ganha delay enorme. Fix obrigatório:

```css
html{scroll-behavior:smooth}
html.lenis, html.lenis body{scroll-behavior:auto}
```
```js
if (!reduce && window.Lenis){ document.documentElement.classList.add('lenis'); … }
```

- **Deriva de espécimes** (`.drift`, `data-drift="±10..14"`): translate vertical proporcional
  à posição do elemento na viewport, via rAF + scroll passivo. Sem pin, sem scrub.
- Telas de app não usam Lenis: scroll nativo.

### 3.5 Física de interação

- **Arco de mini-telas:** drag `off += dx * .028` (clamp ±22.75°), inércia `vel *= .95`,
  balanço idle `sin(t/2600) * 2.4` após 1.6s parado (easing de entrada `sway += (target-sway)*.04`),
  setas ← → do teclado (step 6.5°) funcionam **sempre**, inclusive com reduce.
- **Botões magnéticos:** só `(pointer: fine)` e sem reduce; translate `x*6 / y*5` px.
- **Hover de linha:** listas densas deslizam `padding-left: 8px` no hover (`.dimrow`, `.tx`).

---

## 4. Dispositivos de identidade

O que faz uma tela "parecer SyncLife". Aprovados como conjunto:

1. **Ticker elétrico** — marquee de dados reais em fundo `--ele`, texto `#151313`,
   Space Grotesk 10px tracking .16em. Na landing, grudado sob a pill nav (raio
   `0 0 16px 16px`); no app, faixa full-width sob a barra. Conteúdo repetido 4× com
   `translateX(-25%)`.
2. **Caligrafia do coach** — `.hand` (Caveat, coral, rotação -1.6° a -2.5°) + setas SVG que
   se desenham (`.hand-arrow` + `.draw`, stroke-dashoffset 120→0). É a única voz "humana"
   fora do sistema tipográfico. Usada com parcimônia: 1 por dobra no máximo.
3. **Marca-texto elétrico** (`.hl`) — background-size 0→100% varre a frase-chave, texto vira
   `#151313`. Um por página.
4. **Acento como superfície** — coluna PRO roxa sólida na tabela de preços (CTA interno vira
   `#151313`); ticker elétrico. Somente esses dois casos.
5. **Selo de edição** — número grande em moldura dupla (borda + `::after` inset 5px),
   respiração de glow elétrico (`breathe` 4.5s) no dashboard. É o "carimbo" do score.
6. **Mini-telas** (`.scard`) — janelas escuras 300px com titlebar (3 dots + nome + índice) e
   micro-UIs animadas em loop de 7–8s (barras, typing, cursor fantasma clicando, anel,
   sparkline, bloco de agenda, check riscando). No hero da landing, giram em **semicírculo**
   (transform-origin `50% 2600px`, ângulos ±22.75°, step 6.5°).
   *Pendência: substituir as micro-UIs por imagens reais das telas v5 quando existirem.*
7. **Grain** — noise SVG fixo, opacity .03 (página clara) / .04 (escura), `z-index:90`,
   pointer-events none.
8. **A marca — A Bússola da Vida** — bússola cujas marcações são as 8 áreas (ver §5).
   Wordmark `Sync` (t1) + `Life` (roxo) em Space Grotesk 700, com a bússola à esquerda.

---

## 5. A marca — A Bússola da Vida

> Decidida em 2026-07-28 (rodada 3: conceito **bússola viva**; rodada 7: **marca 3D**).
> Fonte de verdade atual: `design_handoff_marca_3d/marca-3d.html` + `README.md`
> (espelhados em `prototypes/v5/marca/marca-3d.html`). Histórico do conceito em
> `prototypes/poc-v5/r6-estudio/marca-bussola.html`; rodadas anteriores em `marca.html`.

### 5.1 Conceito e material

A marca é um **instrumento, não um emblema**: uma bússola cujos pontos cardeais são as
8 áreas do SyncLife. A agulha aponta pra área que pede o usuário hoje. Os quatro pilares
da concepção estão no objeto: **cuidado** (o aro que envolve), **foco** (a agulha),
**evolução** (o norte muda com a vida), **performance** (a marcação acesa, medida), e a
rosa completa é o "tudo em um único lugar".

**Material oficial (rodada 7): cromo líquido.** A bússola deixa de ser desenho vetorial
hairline e passa a ser um **objeto renderizado** (inteiro em CSS/SVG, nunca bitmap): aro
espelhado com horizonte refletido, mostrador rebaixado escuro, marcações gravadas, agulha
facetada em cromo roxo, pivô usinado. Vidro fumê e titânio escovado ficam registrados como
exploração, **não** são variantes de uso. Versão clara = **cerâmica off-white** (bandas
claras, impressão e mono).

### 5.2 Construção (5 peças, com material)

| Peça | Spec (rodada 7) | Significado |
|---|---|---|
| O aro | **torneado**, luz na quina superior (conic-gradient de cromo) | o mundo da vida, cuidado que envolve sem pesar |
| As marcações | **24 gravadas** (traço escuro + quina iluminada), sendo **8 maiores** nas áreas a cada 45°; 01 Finanças no norte, horário até 08 Experiências | as áreas nos pontos cardeais; **posição, não cor**, identifica o módulo |
| A agulha | **facetada em 2 planos**, norte em cromo roxo (`#9c7dff`/`#5730e0`), sul em cromo apagado | norte = pra onde olhar agora; sul apagado = o que fica pra depois |
| O pivô | **cabeça de eixo usinada** (radial-gradient; deixa de ser "furo na cor do fundo") | você, no centro; o único ponto que nunca se move |
| A marcação acesa | a do rumo em foco acende em **elétrico** (`#b8ff7a` no cromo pequeno; **roxo** na versão clara) | a área em foco, o dado vivo |

Anatomia de camadas (`.bs > .rim / .dial(.nsh .tk .nd .pv) / .gl / .sw`), cores exatas e
comportamento: `design_handoff_marca_3d/README.md` (hifi, valores finais).

### 5.3 Escala e degradação (por material)

Thresholds medidos no lado da peça:

| Largura | O que sai |
|---|---|
| `< 54px` | as 16 marcações menores; entra o modo `.s-sm` (**o contraste manda, o material cede**: aro de alto contraste, mostrador escuro chapado, agulha e marcações mais grossas, zero blur) |
| `< 34px` | as marcações maiores de índice ímpar (sobram 4: N/L/S/O) |
| `≤ 22px` | todas as marcações menos a do norte; entra o modo `.s-xs` (favicon, lockup mínimo) |

Ordem de perda: **reflexo → marcações menores → aro → núcleo**. Em 16px sobram aro brilhante +
agulha roxa + marcação norte, e isso ainda é a marca. Lockup: bússola 30px + wordmark (22px na
nav compacta), **gap 11px**.

### 5.4 Comportamento — a bússola viva

- **Só a agulha se move; o corpo nunca gira.** Rotação = rumo da área em foco:
  `rot = i × 45°` (i = índice da área, 01 no norte).
- Transição: `.52s` com a easing assinatura. **Overshoot em duas etapas**: vai para
  `alvo + 9°` e assenta no alvo após `330ms`. Durante o trajeto a agulha ganha
  `rotateX(16deg)` em perspectiva (o mostrador tem `perspective:640px`).
- A marcação de destino acende `260ms` após o início do movimento (a luz chega depois
  da agulha). A sombra projetada acompanha a rotação.
- Varredura de luz no hover (`sweep 1.15s`), só em peças > 54px.
- **Só aponta uma área quando há dado real de foco** (o briefing do dia). Sem dado,
  aponta o norte. A bússola nunca mente.
- Sob reduced-motion: sem busca automática, sem overshoot, sem varredura, sem inclinação;
  mudanças de foco são instantâneas (a interação continua funcionando).

### 5.5 Regras de uso

- Agulha sempre roxa; sul sempre apagado (cromo); **coral nunca** (E-06).
- No claro (cerâmica): marcação acesa em **roxo** (o elétrico é detalhe do escuro).
- **Não usar como spinner ou loading genérico**: a bússola aponta, não gira à toa.
- Lockup: bússola 30px + wordmark à esquerda, **gap 11px** (22px + wordmark 21px na nav
  compacta), alinhados no centro vertical.
- Favicon: a própria peça em modo `.s-xs` a 15-16px (exportar bitmap renderizando o
  componente, nunca redesenhar). Tiles de app: iOS squircle 22.5%, Android maskable circular.
- Ícones das 8 áreas: a própria bússola em cromo pequeno, sem agulha, com a marcação do
  rumo acesa + primitiva geométrica da área no centro (mesmo material para as 8; ver
  handoff da marca 3D). Ícone e índice contam a mesma coisa.

---

## 6. Anatomia

### 6.1 Chrome do app (substitui ModuleBar + Sidebar do v3)

```
┌──────────────────────────────────────────────────┐
│ bar (64px sticky, blur): brand · data · ações    │
├──────────────────────────────────────────────────┤
│ ticker do dia (28px, elétrico, marquee)          │
├──────────────────────────────────────────────────┤
│ modbar: Panorama · 01 Finanças · 02 Futuro …     │  ← tabs horizontais, scroll-x,
├──────────────────────────────────────────────────┤    ativa = border-bottom 2px roxo
│ conteúdo (wrap max 1180px)                       │
└──────────────────────────────────────────────────┘
```

- `bar`: `position:sticky`, `background:rgba(21,19,19,.85)` + `backdrop-filter:blur(12px)`.
- `modbar`: módulos **numerados** (`.n` em Space Grotesk), sem ícones, sem cores de módulo,
  scrollbar oculta. Panorama sem número; ativa fica `--t1` com número roxo.
- Não existe sidebar. A hierarquia interna do módulo vive na própria página.

### 6.2 Dashboard — "Edição do dia" (Panorama)

Ordem vertical:

1. **Masthead** — eyebrow `Edição nº · seu panorama diário`, saudação em display, sub de
   1 parágrafo + **selo** do Life Sync Score à direita.
2. **A folha** — banda papel (`--paper`) com o briefing do Consultor IA: eyebrow, título
   editorial, 2 parágrafos de prosa com números embutidos (`strong.num`, `.warn` coral),
   rabisco do coach, assinatura (`Escrito às 14:05, com base em…`). À direita, coluna
   `recs`: 3 recomendações numeradas + input `ask` em pílula.
3. **Hoje** — linha única scroll-x com eventos/contas (`time` + tag `EM 3 DIAS`).
4. **Números do mês** — banda 4 colunas com hairlines internas, valores com count-up.
5. **As 8 dimensões** — índice em 2 colunas: `01 Finanças … 08 Experiências`, cada linha com
   nome display 16px, metadado 11.5px e score 22px + tendência (`▲2` elétrico / `▼1` coral / `–`).
6. **Atenção + Metas** — grid 1.5fr/1fr: notas com dot coral/elétrico e valor à direita |
   metas com barra hairline 3px.
7. **Colofão** — rodapé de fechamento (projeção, streak, badges, última sincronização).

### 6.3 Tela de módulo (template = Finanças)

Mesmo chrome; ticker com dados do módulo. Ordem:

1. **Masthead editorial** — eyebrow `Finanças · julho 2026`, manchete-frase que resume o
   estado do mês (com `em` coral na palavra-tensão) + **selo** "Saúde do mês".
2. **Folha** — briefing do módulo (mais curto que o do Panorama) + `Ações de hoje` (3 recs).
3. **Banda de números** — 4 KPIs do módulo com count-up.
4. **Zona de evidência** — grid `1.1fr/1fr`: orçamentos em linhas hairline com barras
   (`--w`/`--d`) | fluxo de caixa SVG com projeção e legenda em prosa.
5. **Lista densa** — últimas transações: grid `52px 1fr 130px 110px`, hover desliza,
   entrada elétrica (`+`), estouro coral, saída neutra.
6. **Metas + recorrentes** — 2 colunas de linhas hairline.
7. **Colofão** do módulo.

### 6.4 Coach — conversa como página

- Grid `1fr 300px`: **thread** central (max 720px) | **margem de contexto** sticky.
- Thread: divider de data, bolhas (`.bub.u` roxa / `.bub.a` superfície `--s1`), cada resposta
  da IA com **fontes citadas** (`.meta`: `Fontes: orçamento Lazer · 34 transações · …`),
  cartão **Ação executada** (borda esquerda 3px elétrica + confirmação com hora), typing dots.
- Margem: `O que o coach enxerga` (linhas chave/valor), nota de privacidade, atalhos em chips
  verticais, caligrafia `é conversa, não formulário!`.
- **Askbar fixa** ao rodapé: pílula escura com sombra longa sobre gradiente de fade.

### 6.5 Landing

1. Pill nav flutuante (dark, blur) + ticker grudado.
2. **Hero manchete de dobra inteira** — pill "Novo", h1 gigante com badge do score embutido
   (`badge78`), sub com `.hl`, CTAs + prova (checks), atmosfera (2 glows radiais + fio-guia
   vertical 1px).
3. **Semicírculo das 8 áreas** — strip 520px com as `.scard` em arco, cue "Arraste →".
4. Banda de imprensa (hairlines top/bottom).
5. **Produto em espécimes** (banda escura) — peças reais da UI anotadas `fig. 01–03` com
   notas de margem (`border-left` roxa 2px) e caligrafia.
6. Marquee dos módulos (`✦` roxo).
7. Seção IA — features numeradas | chat com conversa real.
8. **Pricing como tabela editorial** (banda escura) — grid `1.3fr 1fr 1fr`, coluna PRO roxa
   sólida com tag RECOMENDADO elétrica, linha de CTAs, caligrafia `cancela quando quiser`.
9. FAQ em `<details>` hairline.
10. CTA final gigante (banda escura) + footer.

### 6.6 Princípio de container

Sem cards. Um contorno/superfície só é permitido quando o elemento é um **objeto** com
identidade própria: selo, mini-tela, cartão de ação executada, askbar/ask, pill nav, chip,
tag. Agrupamento de conteúdo é feito por hairline, espaçamento e eyebrow, nunca por caixa.

---

## 7. Inventário de componentes

| Componente | Onde | Spec resumida |
|---|---|---|
| `.btn-roxo` | todas | pílula sólida roxa, hover `--roxo-h` + translateY(-1px) (landing), magnético em pointer fine |
| `.btn-ghost` | todas | pílula transparente com hairline, hover `--line-h` |
| `.eyebrow` | todas | Space Grotesk 700 10px .22em uppercase `--t3`; `b` interno roxo |
| `.ticker` | landing, app | marquee elétrico, conteúdo 4×, 40–46s linear |
| `.modbar` | app | tabs numeradas scroll-x, ativa border-bottom roxa |
| `.mast` + `.selo` | app | saudação/manchete + selo de moldura dupla com score |
| `.folha` + `.rec` + `.ask` | app | banda papel com briefing em prosa + recs numeradas + input pílula |
| `.hoje` / `.ev` | dashboard | linha do dia scroll-x, tags `EM N DIAS` (due = coral) |
| `.nums` | app | banda 4 colunas hairline, valores `data-cnt` |
| `.dimrow` | dashboard | linha de dimensão: índice, nome, metadado, score + tendência |
| `.nota` | dashboard | dot coral/elétrico + texto + valor |
| `.mrow` | app | meta com barra 3px hairline |
| `.orc-row` | finanças | orçamento: nome, trilha 4px com `--w`, valor `410 / 420 · 98%`; `.hot` coral |
| `.tx` | finanças | transação em grid denso, hover desliza, `+` elétrico / hot coral |
| `.fluxo` | finanças | SVG linha elétrica + área gradiente + dot final + legenda em prosa |
| `.bub` / `.action` / `.typing` | coach, landing | bolhas de conversa, cartão de ação (borda elétrica), typing dots |
| `.bub .meta` | coach | fontes citadas sob cada resposta da IA |
| `.ctx` / `.ctx-row` / `.chip` | coach | margem de contexto sticky + atalhos |
| `.askbar` | coach | input fixo em pílula sobre gradiente de fade |
| `.colofao` | app | rodapé hairline com metadados da edição |
| `.hand` / `.hand-arrow` / `.draw` | todas | caligrafia + seta que se desenha |
| `.hl` | landing | marca-texto elétrico que varre |
| `.scard` + micro-UIs | landing | mini-tela escura com loop de uso (7–8s) |
| `.grain` | todas | noise SVG fixo |
| `.mq` | landing | marquee de módulos com `✦` |
| `.ptable` / `.prow` / `.col-pro` | landing | tabela editorial de preços com coluna acento |

---

## 8. Regras invariantes (E-01 a E-12)

| Regra | Resumo |
|---|---|
| **E-01** Easing única | Toda transição/animação não-linear usa `cubic-bezier(.625,.05,0,1)` |
| **E-02** Gate `.anim` | HTML nasce com valores finais; animação só existe sob `.anim` (JS + `!reduced-motion`). Reduce = página completa e estática |
| **E-03** Lenis nunca com `scroll-behavior:smooth` | `html.lenis{scroll-behavior:auto}` obrigatório; Lenis só na landing, sempre guarded |
| **E-04** Hairline, não card | Container/borda só para objetos (selo, scard, ação, askbar, pills). Agrupamento = hairline + eyebrow + espaço |
| **E-05** Um número grande por dobra | Score no selo, saldo na banda; nunca dois heróis competindo |
| **E-06** Tri-acento com papel fixo | Roxo = ação/marca · Elétrico = positivo/dado vivo · Coral = alerta/voz do coach. Acento como superfície só em ticker e coluna PRO. **Exceção de marca (rodada 7):** gradiente segue proibido em superfícies de seção, mas marca e ícones usam gradiente **como iluminação** (aro, bisel, faceta); nenhuma cor nova |
| **E-07** IA escreve prosa com fontes | Briefing assinado (`Escrito às…`) e respostas do coach com `Fontes: …`. IA nunca vira widget |
| **E-08** Números em `.num` | Space Grotesk + tabular-nums + tracking -.02em para todo valor. NBSP após `R$`, en-dash em negativos, pt-BR |
| **E-09** Módulo por índice + ícone de rumo | **Revogada em parte (rodada 7):** módulo passa a ter ícone além do índice (a bússola em cromo com a marcação do rumo acesa + primitiva da área, §5.5). Continua proibida a **cor de módulo**: mesmo material para as 8 áreas, muda geometria e rumo, nunca matiz |
| **E-10** Caveat só na voz do coach | `.hand` restrita a anotações do coach, máx. 1 por dobra; nunca em chrome, dados ou títulos |
| **E-11** Objetos sempre escuros | Pill nav e mini-telas re-declaram vars dark mesmo em página clara |
| **E-12** Marca = Bússola da Vida | Wordmark `Sync`+`Life` + bússola (§5). Agulha sempre roxa, sul apagado, marcação acesa elétrica (ink no claro), coral nunca. Viva só com dado real de foco; sem dado, aponta o norte. Nunca como spinner |

Regras de copy do v3 que **continuam valendo**: sem em-dash (—) na copy, sentence case,
"você" nunca "o usuário", sem emoji em chrome, microcopy seca (`Salvo.`).

---

## 9. Acessibilidade

- `prefers-reduced-motion` respeitado integralmente (E-02); teclado move o arco mesmo com reduce.
- Elementos decorativos com `aria-hidden` (ticker, grain, atmosfera, SVGs de dado repetido).
- Objetos informativos com `role`/`aria-label` (`selo` = `role="img"` com leitura completa,
  cartão de ação = `role="status"`, strip com `aria-label` e `tabindex="0"`).
- Hairlines nunca são o único sinal: estado sempre acompanha texto/valor (`98%`, `EM 3 DIAS`).
- `::selection` roxa com texto branco.

---

## 10. v3 → v5 (o que muda)

| Dimensão | v3 | v5 |
|---|---|---|
| Metáfora | Dashboard de cards (SLCard/KpiCard) | Publicação editorial (hairlines, bandas, prosa) |
| Display | Syne | Space Grotesk |
| Body | DM Sans | Inter |
| Mono | IBM Plex Mono (timestamps) | não existe; `.num` cobre tudo |
| Acento | Esmeralda `#0F766E` + success `#1FA67A` | Tri-acento roxo/elétrico/coral |
| Temas | 4 selecionáveis (`data-theme`) | Modo por contexto (claro/escuro por banda, `.dk`) |
| Navegação | ModuleBar rail + Sidebar 228px | Modbar horizontal numerada, sem sidebar |
| Cor de módulo | 11 cores dessaturadas (G-06) | Abolida; índice numerado (E-09) |
| IA | Card AiConsultant com tiles | Redator da página (folha/briefing) + coach conversacional |
| Gradiente | `--sl-grad` em logo + ring | Abolido (só gradientes funcionais de dados) |
| Easing | padrão Tailwind | assinatura única `cubic-bezier(.625,.05,0,1)` |
| Identidade | Logo estrela dourada (G-10) | Wordmark provisório; símbolo em processo separado |

> A migração do app (e o destino da branch `redesign/visual-refresh-v4`) será planejada
> depois que o conjunto v5 estiver fechado. Este documento ainda não é um plano de migração.

---

## 11. Pendências do DS

- [ ] Ajustes finos **visuais** da landing (lista do usuário pendente; cor/linguagem/layout são lei).
- [ ] Veredito final do dashboard/finanças/coach como conjunto.
- [ ] Substituir micro-UIs do arco por **imagens reais** das telas v5.
- [x] Símbolo da marca decidido: **A Bússola da Vida** (§5, 2026-07-28). Falta exportar os
      assets finais (SVG mestre com grade, ICO/PNG, ícones iOS/Android) e a versão mono.
- [ ] Definição real de indicadores/gráficos/funcionalidades, módulo a módulo.
- [ ] Telas restantes (Futuro, Tempo, Corpo, Mente, Patrimônio, Carreira, Experiências,
      Conquistas, Configurações, auth, mobile) na linguagem v5.
- [ ] Decisão de produto: tema claro/escuro selecionável no app.
- [ ] Tokens em arquivo importável (`tokens-v5.css`) quando o conjunto fechar.

---

*SyncLife DESIGN-SYSTEM-v5.md — draft consolidado em 2026-07-28 a partir dos protótipos
aprovados da rodada 6 (`prototypes/poc-v5/r6-estudio/`), branch `poc/ds-v5`.*
