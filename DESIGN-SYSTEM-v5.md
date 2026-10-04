# SyncLife · Design System v5

> **Status: v5.0-poc, reescrito em 2026-10-03 para o modelo sem metáfora (Meu dia · Áreas · Sy).**
> A base visual (tokens, Inter + Space Grotesk, hairlines, tri-acento, Bússola, chrome com áreas
> numeradas) foi aprovada em 2026-07-28 e continua lei. O estilo revista que vivia sobre ela
> (banda clara, selo, caligrafia, ticker, encenação de Sy) saiu do app em 2026-10-03; a landing e
> as telas de auth (Ondas 00 e 01) ficam como estão.
>
> **Fonte de verdade visual do app:** os protótipos aprovados em 2026-10-03 em `prototypes/v5/app/`:
> `meu-dia-d.html` + `meu-dia-d.mobile.html` (Meu dia) e `financas-a.html` + `financas-a.mobile.html`
> (tela de área, template T1). **Da landing e da marca:** `prototypes/v5/landing/`, `prototypes/v5/marca/`
> e, como histórico, `prototypes/poc-v5/r6-estudio/`.
> Em caso de divergência entre este documento e os protótipos aprovados, os protótipos vencem.
>
> Indicadores, gráficos e números dos protótipos vêm de `prototypes/v5/shared/mock-data.js`
> (ancorado em outubro de 2026) e são **ilustrativos**. Rollout do modelo para as 63 telas:
> `docs/superpowers/plans/2026-10-03-rollout-ds-v5-sem-metafora.md`. Conceito, critério de gatilhos
> e pacote de contexto por área: `docs/superpowers/specs/2026-10-03-conceito-sem-metafora-design.md`.

---

## 1. Conceito

O v5 não tem metáfora. O produto é o que ele faz, e as palavras da tela são as palavras do
produto. Três camadas:

- **Meu dia** (rota `/dashboard`): o que merece atenção agora. Sua margem de hoje, seu ritmo,
  uma escolha com seus efeitos, o que pede você, o dia, o acordo com Sy, suas áreas, os números
  do mês. Não é um resumo das oito áreas nem uma lista de tarefas.
- **Áreas** (01 Finanças a 08 Experiências): onde você organiza e aprofunda. Toda tela de área
  segue um de quatro templates (§6.3) e entrega a Sy o pacote de contexto dela ("O que Sy lê aqui").
- **Sy**: a presença que lê as áreas, responde com fontes, propõe mostrando o efeito em mais de uma
  área e age só com a sua escolha, dentro do acordo de atenção que você define.

Os cinco pilares:

1. **Hairline em vez de card** (E-04). Hairlines de `1px`, espaço e eyebrow agrupam conteúdo.
   Contorno só quando o elemento é um *objeto*: cenário do laboratório, pílula, chip, select,
   camada de Sy, sheet, Enxame 40px.
2. **Sy é presença de 40px, nunca protagonista nem widget.** Sy aparece como Enxame de 40px ao
   lado de um texto curto com hora e fontes, e como camada que você abre. Não tem palco, não cresce,
   não fala em tempos, não é um card entre outros nem o cabeçalho da página.
3. **Um número grande por dobra** (E-05). Em Meu dia é o tempo livre no anel da margem; numa área é o
   primeiro dos quatro números. O score fica quieto, à direita do título. Nunca dois heróis competindo.
4. **Ritmo claro/escuro só na landing; o app é escuro.** A landing alterna bandas claras e escuras
   com `.dk`. As telas autenticadas são escuras do início ao fim, sem banda clara no meio da página.
   Objetos flutuantes (pill nav, mini-telas) são sempre escuros, para contraste de objeto (E-11).
5. **Interação com física, sem sequestrar o scroll.** Drag com inércia e Lenis na landing; hover que
   desliza nas listas do app; prévia reversível no laboratório. Nenhum pin, nenhum scroll-jacking,
   nenhuma encenação.

Referências que calibraram a linguagem visual: osmo.supply (estrutura, pill nav, acento como
superfície), Jeton (espécimes com deriva), Phamily (marca-texto na landing). O modelo de **Meu dia**
vem do estudo "Espaço" (`prototypes/codex-diario/espaco.html`, estudo paralelo fora do git), que
trouxe quatro ideias aplicadas ao visual v5 em `app/meu-dia-d.html`: a **margem de vida** como número
principal (tempo livre do dia, lazer que resta, meta), **uma escolha com mais de um efeito** (o
laboratório, com prévia local e Desfazer), o **ritmo autodeclarado** no lugar do check-in de humor e o
**acordo de atenção** (quando Sy pode sugerir).

Histórico: §1 substituído em 2026-10-03; o texto anterior definia a tela como "publicação editorial", a IA como "redator" e o texto de Sy como "matéria de capa", conceito que saiu com o estilo revista.

---

## 2. Tokens

### 2.1 Cor

```css
:root{
  /* modo escuro (app) / bandas escuras */
  --bg:   #151313;               /* fundo da página */
  --s1:   #201d1d;               /* superfície 1 (bolha de Sy, inputs, select) */
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

  /* tokens legados dos protótipos r6 (banda clara dentro de página escura); sem uso no app desde 2026-10-03 */
  --paper: #f4f4f4;
  --ink:   #151313;
  --ink2:  #4f4c4c;
  --pline: rgba(21,19,19,.14);

  /* tri-acento (invariante em qualquer modo) */
  --roxo:   #6840ff;   /* ação, marca, navegação ativa */
  --roxo-h: #7a55ff;   /* hover do roxo */
  --ele:    #a1ff62;   /* positivo, dado vivo, anel da margem; na landing: ticker e highlight */
  --coral:  #f84131;   /* alerta, limite, voz de Sy quando há tensão */

  --ease: cubic-bezier(.625,.05,0,1);
}
```

Superfícies de objeto usadas nos protótipos (fora de token, mas recorrentes):
`#0d0c0cf2` (pill nav, com blur), `#1b1918` (mini-telas, askbar, cartão de ação),
`#161414` (titlebar da mini-tela), `#242020` (bolha de Sy em banda escura),
`#2e2a2a` (trilhas dentro de mini-telas), `#0f0d0d` (fundo do Enxame 40px, `.sy40`).

**Papéis do tri-acento (regra dura):**

| Acento | Papel | Exemplos nos protótipos |
|---|---|---|
| `--roxo` | Ação e marca | CTA `.btn-roxo`, "Life" no logotipo, tab ativa da modbar, índice da área na lista "Pede você hoje" (`.row .ix`), cenário escolhido no laboratório (`.opc[aria-pressed=true]`), eyebrow e borda da "Próxima ação", bolha do usuário, coluna PRO (landing), `::selection` |
| `--ele` (elétrico) | Positivo e dado vivo | Arco do anel da margem, janela livre na linha do dia (`.on`; preparo a 38%), "Espaço livre" e tag `Protegido` na agenda, deltas `+8%`, sparkline do fluxo, entrada `+ R$` nas transações, borda do recibo "entrou na prévia" e do cartão "Ação executada", `+3 na semana` do score; na landing: ticker e `.hl` |
| `--coral` | Alerta e voz de Sy quando há tensão | Orçamento encostando no teto (`.orc.warn`), `– R$ 110` do efeito no lazer, `R$ 10` de lazer que resta, tag `EM 3 DIAS`, o número em tensão dentro da frase de Sy (`.fala b.w`) |

**Proibições:**
- Nenhum acento vira fundo de seção, exceto na landing: ticker (elétrico) e coluna PRO da tabela
  de preços (roxo). "Acento como superfície" é dispositivo raro e intencional, e não existe no app.
- Nada de gradientes de marca. O único gradiente permitido é funcional (área sob sparkline,
  fade do askbar).
- **Cor de módulo não existe no v5.** Módulos são identificados por **índice numerado**
  (`01 Finanças … 08 Experiências`), não por cor (substitui o G-06 do v3).

### 2.2 Alternância claro/escuro (padrão `.dk` / `.lt`)

Não há mais "4 temas selecionáveis" como no v3. O v5 define **modo por contexto**:

- **Landing:** página clara; seções escuras recebem a classe `.dk`, que re-declara as mesmas
  CSS vars (`--bg`, `--s1`, `--line`, `--t1`…) com os valores dark. Os componentes não sabem
  em que modo estão: leem sempre as mesmas vars.
- **App:** página escura do início ao fim (`<html class="dk">`). **`.lt` não é mais usado nas
  telas do app**: a banda clara saiu com o estilo revista em 2026-10-03. A classe continua
  existindo em `shared/app.css` para a landing e para qualquer superfície pública que precise
  clarear uma seção. `--paper/--ink/--ink2/--pline` são tokens **legados** dos protótipos r6, sem uso.
- **Objetos sempre escuros:** pill nav (`.navwrap`), mini-telas (`.scard`) e o Enxame 40px
  (`.sy40`, fundo `#0f0d0d`) re-declaram as vars dark ou carregam a própria chapa escura, mesmo
  em página clara. É isso que dá o contraste de objeto do Osmo.

```css
/* padrão de flip: a classe re-declara as vars, o componente não muda */
.dk{--bg:#151313;--s1:#201d1d;--s2:#2a2727;--line:rgba(255,255,255,.08);
  --line-h:rgba(255,255,255,.18);--t1:#f4f4f4;--t2:#b8b8b8;--t3:#817f7f;
  background:var(--bg);color:var(--t1)}
```

O flip tem direção dupla: `.dk` escurece uma seção em página clara e `.lt` clareia uma seção em
página escura. `.lt` re-declara as MESMAS vars (`--bg --s1 --s2 --line --line-h --t1 --t2 --t3`)
com os valores do tema claro; filhos usam os tokens normalmente, sem vars paralelas de "paper/ink".
Definido em `prototypes/v5/shared/app.css`. Uso permitido: landing. Uso proibido: qualquer tela
autenticada (substituído em 2026-10-03: antes, `.lt` fazia a banda clara do texto de Sy no app).

> Tema claro no app (global, selecionável) é decisão de produto ainda aberta, prevista para a
> Fase 7 do rollout (Aparência). Até lá o app é escuro. O DS suporta a decisão via o mesmo
> mecanismo de re-declaração.

### 2.3 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display + números | **Space Grotesk** (400/500/600/700) | Títulos de tela, frase de Sy (`.fala`, 500 17px), scores, números grandes, todos os valores numéricos, eyebrows |
| Body | **Inter** (400/500/600) | Texto corrido, labels, botões, listas, nota do ritmo, hint do acordo |
| Caligrafia | **Caveat** (600/700) | **Só na landing** (`.hand`). Não é carregada nas telas do app (E-10) |

```css
.num{font-family:var(--gro);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.eyebrow{font:700 10px var(--gro);letter-spacing:.22em;text-transform:uppercase;color:var(--t3)}
.hand{font:700 19px/1.25 'Caveat',cursive;color:var(--coral);letter-spacing:.01em}
.hand.rx{color:var(--roxo)}
```

Escala (valores dos protótipos):

| Elemento | Spec |
|---|---|
| H1 da landing | `500 clamp(3.4rem,9.2vw,8.6rem)/0.98`, tracking `-.055em` |
| H2 de seção landing | `500 clamp(2.1rem,4.6vw,4rem)/1.05`, tracking `-.045em` |
| Título de tela do app (h1) | Meu dia: `500 32px/1.1` desktop, `28px` mobile. Área: `500 clamp(28px,2.6vw,34px)/1.1` desktop, `28px` mobile. Tracking `-.035em`. Até 6 palavras |
| Score quieto (Life Sync Score) | `700 44px/1` desktop, `34px` mobile, tracking `-.045em`; rótulo `400 12px` Inter `--t3` |
| Número do anel da margem | `700 34px/1` desktop, `28px` mobile, tracking `-.045em` |
| H2 de bloco no app | `500 22px/1.2` a `26px` (margem: `clamp(20px,2vw,26px)`), tracking `-.025em`; mobile `19` a `21px` |
| Frase de Sy (`.fala`) | `500 17px/1.5` Space Grotesk desktop, `16px` mobile, tracking `-.015em`; número em tensão `b.w` coral |
| Banda de números (`.nums .v`) | `700 clamp(26px,3vw,40px)/1` desktop, `24px` mobile, tracking `-.04em` |
| Efeito do laboratório (`.imp strong`) | `700 26px/1` desktop, `20px` mobile |
| Rodapé de 3 números da margem (`.mfoot strong`) | `700 22px/1` desktop, `19px` mobile |
| Espécime score (landing) | `700 96px/1`, tracking `-.06em` |
| Eyebrow | `700 10–10.5px`, tracking `.22em`, uppercase, `--t3` |
| Body | `400 13–15.5px/1.55–1.75` Inter |
| Ticker (só landing) | `700 10px` Space Grotesk, tracking `.16em` |
| Rodapé / metadados / linha de fontes | `400 11–12px` Inter, valores em `.num` |

**Regras:**
- Todo valor numérico (moeda, %, contagem, hora) usa `.num`. Sem exceção, sem mono.
- Títulos display usam peso **500** (não 700): o título é grande, não gordo. 700 fica
  para números e eyebrows.
- Título de tela tem no máximo 6 palavras. A frase longa em display (o antigo "masthead") saiu
  do app em 2026-10-03.
- Itálico só via `<em>` re-estilizado como cor (`font-style:normal;color:var(--roxo)`).

### 2.4 Máscara de valores (herda o G-08 do v3)

| Tipo | Formato | Exemplo |
|---|---|---|
| Moeda BRL | `R$ X.XXX,XX` com **NBSP** após `R$` | `R$ 1.840,00` |
| Moeda curta (bandas de números, efeitos, lista) | sem centavos | `R$ 1.840`, `R$ 48,2k` |
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
| `.6–.7s` | Reveals de scroll (`.rv`) e boot do app (`.boot .b1…b5`) |
| `.85s` | Boot da landing |
| `.9s` | Arco do anel da margem (`stroke-dashoffset`) quando a prévia do laboratório muda `--p` |
| `1s` | Varredura do marca-texto `.hl` (landing) |
| `1.1–1.2s` | Setas que se desenham (`.draw`, landing), barras que preenchem (`fill`), count-up (JS, easing `1-Math.pow(1-t,4)`) |
| `40–80s` linear | Marquees da landing (ticker 40–46s, marquee de módulos 80s) |

No app, a prévia do laboratório **não anima a entrada**: os efeitos trocam de valor no lugar
(`aria-live="polite"`), só o anel transiciona. Nenhuma apresentação em tempos, nenhuma digitação
letra a letra, nenhuma lâmina que cai (encenação removida em 2026-10-03).

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
- **Hover de linha:** listas densas deslizam `padding-left: 6–8px` no hover (`.dimrow`, `.row`, `.tx`, `.orc`).
- **Prévia reversível:** o laboratório muda a tela localmente (anel, linha do dia, agenda) e
  `Desfazer` devolve tudo e foca o botão de origem. Nenhum dado é lançado.

---

## 4. Dispositivos de identidade

O que faz uma tela "parecer SyncLife". Desde 2026-10-03 são dois conjuntos: a landing conserva
os dispositivos de revista aprovados em 2026-07-28; o app não tem nenhum deles e ganhou os seus.

### 4.1 Comuns à landing e ao app

1. **A marca, a Bússola da Vida**: bússola cujas marcações são as 8 áreas (§5). Wordmark `Sync`
   (t1) + `Life` (roxo) em Space Grotesk 700, com a bússola à esquerda.
2. **Grain**: noise SVG fixo, opacity .03 (página clara) / .04 (escura), `z-index:90`,
   pointer-events none.
3. **Hairline como estrutura** (E-04): `1px var(--line)` separa blocos, colunas e linhas de lista;
   eyebrow em Space Grotesk 700 10px nomeia cada bloco. Nenhum card de agrupamento.
4. **Áreas numeradas** `01` a `08`: índice em Space Grotesk 700 antes do nome, nunca cor de módulo.
5. **Hover que desliza**: linhas densas ganham `padding-left` de 6 a 8px no hover.

### 4.2 Dispositivos do app (aprovados em `meu-dia-d.html` e `financas-a.html`, 2026-10-03)

1. **Enxame 40px (`.sy40`)**: o corpo de Sy, como avatar quieto de 40×40px, raio 11px, fundo
   `#0f0d0d`, `<canvas>` por dentro (`criarEnxame(cv, { n: 190, tam: .7, compacto: .78, dpr: 3,
   semente: 4.6 + i })`), estado `repouso`; `ouvindo` só enquanto o input da camada tem foco.
   Sempre ao lado de um texto (frase de Sy, explicação do laboratório, acordo), nunca sozinho,
   nunca maior, nunca no cabeçalho. Sem WebGL vira um quadrado escuro: aceitável. Com
   `prefers-reduced-motion`, 3 quadros e para.
2. **Anel da margem (`.anel`)**: 132px no desktop, 108px no mobile; trilha `--line-h` 2px, arco
   `--ele` 3px com `stroke-dasharray:377` e `--p` como fração do dia (14h às 22h); no centro o
   tempo livre em `700 34px` (`28px` mobile) + `sem compromisso`. Vem com a **linha do dia**
   (`.linha-dia`: 8 segmentos de 6px, janela livre em elétrico, preparo em elétrico a 38%, resto
   `--s2`; horas em eyebrow) e o **rodapé de 3 números** (`.mfoot`: lazer que resta, compromissos
   à frente, % da meta em foco). É o número grande de Meu dia.
3. **Laboratório, "uma escolha, mais de um efeito" (`.lab`)**: pergunta à esquerda (eyebrow com os
   índices das áreas tocadas em roxo, h3, 2 ou 3 cenários `.opc` como botões com `aria-pressed`
   e valor), efeitos à direita (3 colunas hairline `.imp`, número `700 26px`, coral quando passa
   do teto, elétrico quando libera), explicação com Enxame 40px (`.expl`), `<details>` **De onde
   vêm esses efeitos?** (`.evid`), botão roxo `Experimentar no meu dia →` com prévia local e
   **recibo com Desfazer** (`.recibo`, borda esquerda elétrica 3px). Só onde há decisão real com
   efeito em mais de uma área (9 telas marcadas no rollout §4). Nunca como enfeite.
4. **Lista "Pede você hoje" (`.row`)**: grid `40px 1fr auto auto`; **índice da área em roxo**
   (`700 12px`), texto 14.5px com `strong` + sub em `--t3`, valor em `.num` (coral em `.warn`),
   ação ghost à direita. Uma linha por gatilho, no máximo 4. É a lista do que merece atenção.
5. **Ritmo autodeclarado (`.checkin`, nome interno)**: 3 pílulas (`Mais lento` · `No meu ritmo` ·
   `Com energia`), nota opcional de 1 linha, `Registrar`. Muda só a nota de resposta, nunca os
   dados. Opcional, sem streak, nunca cobrado.
6. **Acordo de atenção (`.presenca`)**: eyebrow `Seu acordo com Sy`, Enxame 40px + h2, 1 parágrafo,
   select `Quando Sy pode trazer sugestões?` com 3 opções e hint que muda com a escolha.
7. **Score quieto (`.score`)**: `78` em `700 44px` (`34px` mobile) com rótulo `Life Sync Score ·
   +3 na semana` e link `Entender o número →`. Sem moldura, sem respiração, à direita do título.
   (Substituído em 2026-10-03: o "selo" com moldura dupla e `breathe` saiu do app.)
8. **Agenda com espaço protegido (`.ag`)**: linha do dia em lista vertical; o tempo livre é uma
   linha como as outras (`.ag.livre`, título em elétrico, tag `Protegido`), não um buraco.

### 4.3 Só na landing (Ondas 00 e 01, intocadas)

1. **Ticker elétrico**: marquee de dados em fundo `--ele`, texto `#151313`, Space Grotesk 10px
   tracking .16em, grudado sob a pill nav (raio `0 0 16px 16px`), conteúdo 4× com
   `translateX(-25%)`. No app, **não existe** (a faixa sob o bar saiu em 2026-10-03).
2. **Caligrafia (`.hand`)**: Caveat, coral, rotação -1.6° a -2.5°, + setas SVG que se desenham
   (`.hand-arrow` + `.draw`). 1 por dobra no máximo. Não carregar a fonte no app (E-10).
3. **Marca-texto elétrico (`.hl`)**: background-size 0→100% varre a frase-chave. Um por página.
4. **Acento como superfície**: coluna PRO roxa sólida na tabela de preços; ticker elétrico.
   Somente esses dois casos, os dois na landing.
5. **Selo do score (espécime)**: número grande em moldura dupla (borda + `::after` inset 5px),
   só como espécime da landing. No app o score é quieto (§4.2 item 7).
6. **Mini-telas (`.scard`)**: janelas escuras 300px com titlebar (3 dots + nome + índice) e
   micro-UIs animadas em loop de 7–8s. No hero da landing, giram em **semicírculo**
   (transform-origin `50% 2600px`, ângulos ±22.75°, step 6.5°).
   *Pendência: substituir as micro-UIs por imagens reais das telas v5 quando existirem.*

---

## 5. A marca: A Bússola da Vida

> Decidida em 2026-07-28 (rodada 3: conceito **bússola viva**; rodada 7: **marca 3D**).
> Fonte de verdade atual: `design_handoff_marca_3d/marca-3d.html` + `README.md`
> (espelhados em `prototypes/v5/marca/marca-3d.html`). Histórico do conceito em
> `prototypes/poc-v5/r6-estudio/marca-bussola.html`; rodadas anteriores em `marca.html`.

### 5.1 Conceito e material

A marca é um **instrumento, não um emblema**: uma bússola cujos pontos cardeais são as
8 áreas do SyncLife. A agulha aponta pra área que pede você hoje. Os quatro pilares
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

### 5.4 Comportamento: a bússola viva

- **Só a agulha se move; o corpo nunca gira.** Rotação = rumo da área em foco:
  `rot = i × 45°` (i = índice da área, 01 no norte).
- Transição: `.52s` com a easing assinatura. **Overshoot em duas etapas**: vai para
  `alvo + 9°` e assenta no alvo após `330ms`. Durante o trajeto a agulha ganha
  `rotateX(16deg)` em perspectiva (o mostrador tem `perspective:640px`).
- A marcação de destino acende `260ms` após o início do movimento (a luz chega depois
  da agulha). A sombra projetada acompanha a rotação.
- Varredura de luz no hover (`sweep 1.15s`), só em peças > 54px.
- **Só aponta uma área quando há dado real de foco** (o gatilho de maior prioridade de Meu
  dia, §6.2). Sem dado, aponta o norte. A bússola nunca mente.
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

### 5.6 A peça viva em WebGL (aprovada 2026-07-30)

Em superfícies ricas (landing, splash, página da marca), a bússola pode ser **renderizada
de verdade** (three.js, referência em `prototypes/v5/landing/landing-viva.html`):

- Construção 3D fiel ao §5.2: aro torneado (torus cromado com ambiente refletido via
  PMREM), mostrador rebaixado, 24 marcações em relevo, agulha facetada, pivô usinado.
- **A luz segue a hora local do usuário**: manhã dourada, tarde neutra, noite fria com a
  marcação acesa mais intensa. O instrumento nunca está igual duas vezes.
- **A agulha tem mola física** (aceleração + amortecimento): o overshoot do §5.4 emerge da
  física, não de keyframe. A peça inclina acompanhando o cursor; o reflexo corre com o scroll.
- **O render CSS (§5.2) é o fallback obrigatório** e a única versão em contextos sem GPU,
  SSR ou com `prefers-reduced-motion` na parte de busca automática. Nunca os dois visíveis
  ao mesmo tempo; a troca é silenciosa (`try/catch` + classe no palco).
- Orçamento de performance: 1 canvas por página, DPR ≤ 2, pausa fora da viewport.

---

## 6. Anatomia

### 6.1 Chrome do app (substitui ModuleBar + Sidebar do v3)

```
┌──────────────────────────────────────────────────┐
│ bar (64px sticky, blur; 56px no mobile):         │
│ brand · data · "Fale com Sy" · "+ Registrar"     │
├──────────────────────────────────────────────────┤
│ modbar: Meu dia · 01 Finanças … 08 Experiências ·│
│ Conquistas · Configurações                       │
├──────────────────────────────────────────────────┤
│ conteúdo (wrap max 1180px; mobile 100%, 20px)    │
└──────────────────────────────────────────────────┘
```

- `bar`: `position:sticky`, `background:rgba(21,19,19,.85)` + `backdrop-filter:blur(12px)`.
  À direita, o **gatilho de Sy**: pílula ghost (`.coach-pill`, nome interno) com a bússola 15px +
  "Fale com Sy", presente em TODAS as telas autenticadas; abre a camada (§6.4). Ao lado, o botão
  roxo `+ Registrar` (no mobile só `+`, com `aria-label="Registrar"`). A data por extenso
  (`Sexta · 3 de outubro de 2026`) fica no centro no desktop e sai no mobile.
- **Sem ticker.** A faixa elétrica de 28px sob o bar saiu do app em 2026-10-03 (substituída por
  nada: o dado vivo está no conteúdo). O ticker continua só na landing (§4.3).
- `modbar`: só as 8 áreas levam número (`.n` em Space Grotesk, numeração canônica §5.2).
  **Meu dia**, Conquistas e Configurações ficam SEM número. **Não existe item Sy** (Sy é
  presença e camada, §6.4). Sem ícones, sem cores de módulo, scrollbar oculta; ativa = `--t1` com
  `border-bottom` 2px roxo (número roxo quando houver). Mobile: scroll-x, itens `14px 13px`.
- Não existe sidebar. A hierarquia interna da área vive na própria página.
- **Bottom bar mobile** (Fase 1 do rollout): sem FAB central; o gatilho de Sy continua no bar.
- Substituído em 2026-10-03: item "Diário" (agora "Meu dia"), gatilho "Pergunte ao coach" (agora
  "Fale com Sy") e o ticker do dia.


**Mobile, aprovado em 2026-10-04 (bottom bar):** barra fixa de 56px + safe-area, fundo `rgba(21,19,19,.92)` com blur e
hairline em cima, 5 itens em grade `1fr 1fr auto 1fr 1fr`: Meu dia · 01 Finanças · **Fale com Sy** no centro como pílula
escura com o Enxame em 34px (sem FAB roxo) · Áreas (abre um sheet com as 8 áreas numeradas + Conquistas + Configurações)
· Registrar. Com a bottom bar, o `modbar` superior **some** no mobile e o bar fica só com a marca e o `+`. O gatilho
"Fale com Sy" portanto **sai do bar superior no mobile** e vive só na bottom bar (decisão do usuário, 2026-10-04; no
desktop continua no bar). Protótipo de referência: `app/_intencao.mobile.html`; CSS proposto na seção `inert` dele,
a entrar em `shared/app.css` sob `html.mob` na implementação da Fase 1.

### 6.2 Meu dia (rota /dashboard)

A tela em que Sy mostra o que merece atenção agora, com a **sua margem** como número principal.
Não é um resumo das oito áreas, não é uma lista de tarefas e não tem seções fixas de "edição".
Protótipos aprovados em 2026-10-03: `app/meu-dia-d.html` (1440) e `app/meu-dia-d.mobile.html`
(390×844). Spec de produto: `docs/superpowers/specs/2026-10-03-conceito-sem-metafora-design.md` §4.
O conteúdo é o mesmo nos dois dispositivos; só a apresentação muda.

Substituído em 2026-10-03: a anatomia anterior (masthead com "Edição nº N · seu diário", folha clara com briefing assinado "Escrito às…", selo com moldura, recs numeradas, check-in de humor em 5 pílulas, colofão) saiu inteira.

**Ordem vertical (desktop, `.wrap` 1180px):**

1. **Cabeçalho curto (`.cab`)**: eyebrow com a data (`Sexta · 3 de outubro`), título de até 6
   palavras em `500 32px` (`Hoje pode caber menos.`), sub de 1 frase em Inter 14px `--t2` (máx.
   52ch). À direita, o **score quieto** (`.score`): `78` em `700 44px`, rótulo `Life Sync Score ·
   +3 na semana` (delta em elétrico), link `Entender o número →` para `/dashboard/score`. Sem
   moldura. Padding `40px 0 26px`.
2. **Margem de hoje (`.margem`) ao lado do ritmo**: grid `1.55fr 1fr` entre duas hairlines, com
   hairline vertical entre as colunas (padding `34px 0 32px`).
   - Esquerda, **Sua margem hoje · 14h às 22h** (eyebrow) + pílula de estado (`Sem pressa` /
     `Com preparo`). Grid `132px 1fr`: o **anel do tempo livre** (`.anel`, 132px, arco elétrico,
     `--p` = fração das 8h; `2h30` em `700 34px` + `sem compromisso`) e, ao lado, o h2 **"Tempo
     livre também é um plano."** (`500 clamp(20px,2vw,26px)`) + 1 frase com a janela (`Há uma
     janela de 150 minutos na sua agenda, das 16h30 às 19h. Você decide se quer ocupá-la.`).
     Abaixo, a **linha do dia** (`.linha-dia`, 8 segmentos, 14:00 a 22:00, janela livre em
     elétrico) com as horas em eyebrow (`14:00 · 16:30 a 19:00 · livre · 22:00`). Fecha com o
     **rodapé de 3 números** (`.mfoot`, `700 22px`): **lazer** que resta até quinta (`R$ 10`,
     coral no limite), **compromissos** à frente (`2`), **meta** em foco (`68% da meta Itália`).
     O tempo livre é o único número grande da dobra (E-05).
   - Direita, o **ritmo** (`.checkin`, nome interno): eyebrow `O que a agenda não sabe`, h2
     `Como está seu ritmo hoje?` (`500 22px`), 1 frase (`Ter tempo disponível não diz quanto você
     quer fazer. Responder é opcional e não muda o que a tela mostra.`), **3 opções** em pílula
     (`Mais lento` · `No meu ritmo` · `Com energia`), **nota opcional** de 1 linha + `Registrar`,
     estado `Registrado às 21:14 · …`, nota de resposta (`.ck-nota`, muda só o texto, nunca os
     dados) e a linha `Autodeclaração, só sua. Não é avaliação de saúde e Sy nunca cobra o que
     ficou em branco.` **Nunca obrigatório**, sem streak.
3. **Laboratório (`.lab`)**: cabeçalho de seção (`.sec-head`: eyebrow `Uma escolha, mais de um
   efeito`, h2 `E se o jantar de hoje fosse diferente?` em `500 24px`; à direita `Experimente antes
   de decidir. Nada é lançado.`). Grid `1fr 1.6fr` entre hairlines:
   - Esquerda, a **pergunta** (`.perg`): eyebrow com os índices das áreas tocadas em roxo
     (`03 · 01 · 08 · Tempo, Finanças, Experiências`), h3 `21px` com o objeto da decisão (`Jantar
     com Ana, hoje às 20h.`), 1 frase (`Nenhuma opção é a certa: a prioridade é sua.`), **2 ou 3
     cenários** (`.opc`: botões com `aria-pressed`, nome + valor em `.num`; o escolhido tem borda
     e valor roxos e fundo roxo a 8%).
   - Direita, os **efeitos** (`.efei`): nome do cenário + eyebrow `Simulação`; **3 efeitos** em
     3 colunas hairline (`.imp`, `aria-live="polite"`: label 11.5px, número `700 26px`, nota 11px;
     coral `.w` quando passa do teto, elétrico `.ok` quando libera: `Lazer até quinta`, `Tempo
     livre que sobra`, `Possível aporte Itália`); a **explicação de Sy** (`.expl`: Enxame 40px +
     1 parágrafo em `--t2` com a frase-chave em `b`, `min-height:62px`); `<details class="evid">`
     **"De onde vêm esses efeitos?"** (hipóteses, médias usadas, o que não foi modelado, fontes);
     `.aplicar` com o botão roxo **`Experimentar no meu dia →`** + `Prévia local, com desfazer.
     Nenhuma conta ou agenda muda.`; o **recibo** (`.recibo`, `role="status"`, borda esquerda
     elétrica 3px) com `… entrou na prévia do seu dia. Nenhuma conta ou agenda foi alterada.` e
     o botão **`Desfazer`**.
   - A **prévia é local**: experimentar atualiza o anel, a frase da janela, a linha do dia, o
     rodapé de 3 números, a pílula de estado e a agenda (`Prévia · em casa · R$ 55 estimados`);
     `Desfazer` devolve tudo e foca o botão de origem. Nada é lançado em conta, agenda ou meta.
   - Só entra onde há decisão real com efeito em mais de uma área (rollout §4 marca as 9 telas).
     Nunca como enfeite. Sem decisão real no dia, o bloco não aparece.
4. **Pede você hoje (`.pede` + `.row`)**: eyebrow e **lista curta** (3 itens no mock, máximo 4),
   uma linha por gatilho: **índice da área em roxo** (`.ix`), texto 14.5px com `strong` + sub em
   `--t3`, **valor** em `.num` à direita (coral em `.warn`), **ação** ghost (`Decidir` abre a
   camada com a pergunta semeada via `data-coach-seed`; `Ver orçamento`, `Ver recorrentes` levam
   à área com âncora). Hover desliza 8px.
5. **O dia continua seu (`.ag`) ao lado de Seu acordo com Sy (`.presenca`)**: grid `1.15fr 1fr`,
   `margin-top:48px`.
   - Esquerda, eyebrow `Hoje`, h2 `O dia continua seu.`, **agenda vertical** (`.ag`: hora
     `700 12px`, título + sub, tag `Feita` / `A seguir` / `Protegido` / `Lazer`). O espaço livre é
     uma linha da agenda (`.ag.livre`: `Espaço livre`, `150 min sem tarefa sugerida`, título em
     elétrico, tag `Protegido`), não um buraco.
   - Direita, eyebrow `Seu acordo com Sy`, **Enxame 40px** + h2 `Presença, do seu jeito.`,
     1 parágrafo (`Sy liga os pontos entre as suas áreas e mostra o efeito das suas escolhas. Você
     define quando essa ajuda entra. Fora disso, Sy espera.`), label `Quando Sy pode trazer
     sugestões?`, **select** (`Quando eu pedir` · `Quando algo importante mudar`, padrão · `Em um
     resumo por dia`), **hint** que muda com a opção (`Exemplo de gatilho: um compromisso novo
     elimina a sua janela livre, ou o lazer passa do teto. Mudanças pequenas aguardam.`).
6. **Suas áreas (`.dims-sec`)**: eyebrow + `Ver todas →`; grid 2 colunas de `.dimrow` (índice,
   nome `500 16px`, metadado, score `700 22px` + tendência) só para as áreas ativas; as demais
   numa linha quieta `Outras: 03 Tempo 71 · 05 Mente 58 · …`, sem juízo de valor.
7. **Números do mês (`.nums`)**: 4 colunas hairline (Saldo livre · Receitas · Despesas · Poupança),
   `700 clamp(26px,3vw,38px)`, count-up, delta `vs setembro`.
8. **Sua semana (`.semana`)**: **uma linha** de prosa com os números em `b.num` (`score de 75 para
   78, 11 de 14 compromissos feitos, 6h30 de foco. Fecha domingo às 21:30.`) + `Ver a semana →`
   (`/dashboard/review`). Nunca mais que uma linha aqui.
9. **Rodapé (`.colofao`, nome interno)**: fechamento projetado do mês, streak, badges, `Última
   sincronização às 14:05`.

Depois do rodapé, fechada: a **camada de Sy** (§6.4), eyebrow `Sy · lendo: o seu dia`.

**Critério de seleção do conteúdo** (spec §4.1, copiado; vale para a lista "Pede você hoje", para
a decisão do laboratório e para a frase do cabeçalho). Cada item nasce de um **gatilho** com
prioridade fixa; o conteúdo muda conforme a situação, e por isso um dia é dinheiro, outro é
agenda, outro é a viagem que chega.

| Prioridade | Gatilho | Exemplo | Área que fornece |
|---|---|---|---|
| 1 | **Decisão pendente** que Sy propôs e você ainda não respondeu (inclui intenções em aberto, spec §6) | "A proposta do curso de inglês continua em aberto" | qualquer |
| 2 | **Risco em janela curta** (≤ 7 dias): orçamento encostando no teto, conta vencendo sem saldo, meta com prazo, conflito de agenda | "Lazer encostou no teto: restam R$ 10 até quinta" | Finanças, Tempo, Futuro |
| 3 | **Compromisso de hoje** com preparo (viagem, consulta, entrevista, prova) | "Aluguel vence em 3 dias" · "Fisioterapia às 07:30" | Tempo, Carreira, Experiências, Corpo |
| 4 | **Mudança desde o último acesso** nas áreas ativas (score subiu ou caiu, hábito quebrou, aporte caiu) | "Nas suas quatro áreas, três subiram. Só Experiências ficou parada" | todas as ativas |
| 5 | **Próxima ação** única, se nada acima preencheu | "Segure o lazer até sexta e o mês fecha com R$ 2.120" | a área do item anterior |

Regras: só áreas em `profiles.active_modules` disparam gatilhos 2 a 5; prioridade 1 vale para
qualquer área. Um item por gatilho, no máximo 4; se dois gatilhos da mesma prioridade competem,
vence o de maior valor monetário ou menor prazo. Sem nenhum gatilho, Sy diz isso em uma frase
(`Nada pede você hoje.`) e a lista não aparece. Sy **nunca cobra** check-in, ritmo ou resposta
pendente (regra de 2026-07-31, inviolável). O laboratório usa o gatilho de maior prioridade que
tenha decisão real em mais de uma área.

**Mobile (390×844, `meu-dia-d.mobile.html`):** mesma ordem, 1 coluna, **uma dobra por bloco**.
Chrome compactado (bar 56px, `+` sem rótulo, modbar `14px 13px`). Cabeçalho com título `28px` e o
score (`34px`) em linha própria sob hairline, link `Entender →`. Margem com anel **108px** (número
`28px`), rodapé de 3 números em 3 colunas (`19px`). Ritmo logo abaixo, em bloco próprio com
hairline. Laboratório com **cenários em linhas de toque inteiro** (`min-height:46px`), **efeitos
empilhados** (label à esquerda, número `20px` à direita, nota embaixo, hairline entre eles),
botão `Experimentar` em largura total. "Pede você" com índice `34px` e segunda linha `.r2`
(valor + ação). Agenda e acordo empilhados. **Números 2×2**. Rodapé em coluna. A camada de Sy vira
**sheet** (`clamp(420px, 86dvh, 760px)`, handle, `cfull` sobre a safe-area). Todo alvo ≥ 40px;
`scroll-margin-top:76px` em inputs, select e botões para o foco nunca ficar sob o bar sticky.

### 6.3 Tela de área, template T1 (aprovado = Finanças A)

Toda área (01 a 08) abre num hub T1. Protótipos aprovados em 2026-10-03: `app/financas-a.html` e
`app/financas-a.mobile.html`. Pitch: **Sy em 1 ou 2 linhas, depois os dados.** Sy aparece uma vez,
no topo, e em mais nenhum lugar da página; o resto da conversa é a camada (§6.4). Mesmo chrome
(§6.1), sem ticker.

Substituído em 2026-10-03: masthead editorial com frase longa e `em` coral, selo "Saúde do mês", folha clara com briefing e "Ações de hoje" (3 recs) saíram.

**Ordem vertical (desktop):**

1. **Cabeçalho curto (`.titulo`)**: eyebrow `01 · Área` (índice em roxo), h1 **`Finanças ·
   outubro`** (`500 clamp(28px,2.6vw,34px)/1.1`), padding `44px 0 36px`, hairline embaixo.
2. **Sy (`.sy`)**, ainda dentro do cabeçalho, grid `40px 1fr`, máx. 720px: **Enxame 40px** +
   **1 ou 2 linhas** em Space Grotesk `500 17px` (`O mês está 83% executado. Só o lazer pede
   atenção: R$ 10 até quinta.`; o número em tensão em coral, `b.w`), a **linha de fontes**
   (`.fontes`: `Atualizado às 7h12 · fontes: 3 orçamentos, 34 transações, 3 metas`, E-07) e o
   link-botão **`Falar com Sy sobre outubro →`** (`.falar`, abre a camada com `data-coach-seed`).
3. **4 números (`.nums`)**: Receitas · Despesas · Saldo livre · Poupança em 4 colunas hairline,
   `700 clamp(26px,3vw,40px)`, count-up, delta `vs setembro` em elétrico quando positivo. O
   primeiro é o número grande da dobra (E-05).
4. **Zona de evidência (`.duo`)**, grid `1.2fr 1fr`, hairline embaixo: **orçamentos** em linhas
   hairline (`.orc`: nome, `R$ 1.240 de R$ 1.800`, trilha 4px com `--w`, sub `69% · sobram
   R$ 560`; `.warn` em coral) + linha `Por categoria: …` + **Próxima ação** (`.prox`, borda
   esquerda roxa 2px, eyebrow roxo, 1 frase com o efeito em `b.num`) | **fluxo de caixa**
   (`.fluxo`: SVG 170px com linha e área elétricas, recuos marcados em coral, dot final, legenda
   em eyebrow e 1 parágrafo de prosa com os números). Em telas < 960px, 1 coluna.
5. **Lista densa (`.trans` + `.tx`)**: últimas transações em grid `52px 1fr 130px 110px`, hover
   desliza 6px, entrada em elétrico com `+`, saída neutra com `–`, `Ver todas →`.
6. **Apoio (`.duo2`)**, 2 colunas: **metas em andamento** (`.mrow`: nome, %, trilha 3px,
   `R$ 8.600 de R$ 12.700 · dez 2026`) | **recorrentes** (`.rec`: nome, tag `EM 3 DIAS` em coral
   quando vence, categoria, valor) + 1 linha de agenda do dia (`Hoje às 09:00: …`).
7. **Rodapé (`.colofao`, nome interno)**: fechamento projetado, `34 transações em outubro`,
   última sincronização.

**Mobile (`financas-a.mobile.html`):** mesma ordem em 1 coluna; título `28px`; Sy continua no topo
(`.fala` 16px, `Falar com Sy` com alvo de 40px); **números 2×2**; orçamentos, fluxo (SVG 140px),
transações (grid `44px 1fr auto`, categoria na 2ª linha), metas e recorrentes como seções
empilhadas (`.sec`) com hairline e link de seção à direita (`Ajustar →`, `Ver todas →`,
`02 Futuro →`, `Gerenciar →`); rodapé em coluna; camada como sheet.

Quando uma tela não cabe no T1 nem nos templates abaixo, ela ganha uma **variante** do template
mais próximo, registrada nesta seção; nunca um template novo (rollout §8).

#### 6.3.1 T2 · Lista + captura (a prototipar na Fase 0: `app/_t2-lista.html` + `.mobile.html`)

Pitch: **registrar e filtrar sem sair da lista.** Para Transações, Recorrentes, Atividades,
Sessões, Carteira, Biblioteca, Categorias, Contas, Integrações, Ranking, arquivo da conversa.

- **Desktop:** cabeçalho curto com **filtros em pílula** → **captura inline** em 1 linha (campo +
  botão) → **lista densa** em grid, hover que desliza, hairline entre linhas → total ou rodapé.
  Sy só pela camada (nenhuma frase na página). Sem KPI strip no topo, sem paginação 1-2-3.
- **Mobile:** filtros em scroll-x; a captura vira botão `+` fixo que abre um **sheet** de 1 tela;
  lista em cartões de linha (hairline, não card).
- Espécime da Fase 0: transações de Finanças.

#### 6.3.2 T3 · Detalhe (a prototipar na Fase 0: `app/_t3-detalhe.html` + `.mobile.html`)

Pitch: **um objeto, suas partes, suas ações.** Para detalhe do objetivo, da viagem, do ativo, da
trilha, Life Score, Sua semana, Planejamento, Calendário, Conquistas.

- **Desktop:** cabeçalho com **voltar + nome + estado** → **número principal** (1 por dobra, E-05) →
  abas ou seções hairline → ações no fim; ação irreversível pede licença antes. Sy no topo em
  1 linha quando a tela pede ("o que mais pesou"), senão pela camada.
- **Mobile:** cabeçalho sticky com voltar; abas em scroll-x; ações em barra inferior sobre a
  safe-area.
- Espécime da Fase 0: detalhe de uma meta de Finanças.

#### 6.3.3 T4 · Formulário (a prototipar na Fase 0: `app/_t4-form.html` + `.mobile.html`)

Pitch: **editar confortável, salvar óbvio.** Para Novo objetivo, Nova viagem, Novo evento,
Configurações, Perfil, Importar extrato, `/configuracoes/sy`.

- **Desktop:** cabeçalho → **seções numeradas** (`01 · Identidade`) só quando há mais de 3 →
  zona de perigo (borda coral translúcida) → **SaveBar** sticky que aparece com alterações não
  salvas (Descartar / Salvar).
- **Mobile:** uma seção por dobra; SaveBar sobre a safe-area.
- Espécime da Fase 0: nova meta de Finanças.

#### 6.3.4 "O que Sy lê aqui" (obrigatório em todo protótipo de tela)

Toda tela autenticada entrega a Sy o **pacote de contexto** dela: é o que `buildModuleContext`
expõe por área e o que a camada usa para responder com fontes. Cada protótipo (T1 a T4, desktop e
mobile) termina com uma seção **"O que Sy lê aqui"** listando as fontes (tabelas) que a tela
expõe. **Sem essa seção o protótipo não entra em aprovação** (rollout, regra 8). Referência por
área (spec §5):

| Área | O que acrescenta às decisões | Fontes reais (tabelas) |
|---|---|---|
| 01 Finanças | Margem do mês, orçamentos por categoria, contas a vencer, recorrentes | `transactions`, `budgets`, `recurring_transactions`, `user_accounts` |
| 02 Futuro | Objetivos e metas de longo prazo, prazos, aportes planejados | `goals`, `goal_contributions`, `objectives`, `objective_goals` |
| 03 Tempo | Horários realmente livres, conflitos, carga da semana, foco | `agenda_events`, `planning_events`, `focus_sessions` |
| 04 Corpo | Rotinas, consultas, peso, água, passos, o que você registrou | `health_profiles`, `medical_appointments`, `weight_entries`, `daily_steps`, `daily_water_intake`, `meals` |
| 05 Mente | Trilhas de aprendizado, horas de estudo, streaks, espaço para descanso | `study_tracks`, `study_track_steps`, `study_streaks`, `focus_sessions_mente`, `library_resources` |
| 06 Patrimônio | O que está **acumulado**: carteira, proventos, evolução, simulações | `portfolio_assets`, `portfolio_transactions`, `portfolio_dividends`, `fi_simulations` |
| 07 Carreira | Trabalho atual, habilidades, roadmap, oportunidades cadastradas | `career_profiles`, `skills`, `career_roadmaps`, `roadmap_steps`, `career_history` |
| 08 Experiências | Viagens, orçamento de viagem, lista de desejos, memórias | `trips`, `trip_budget_items`, `trip_itinerary_items`, `bucket_list_items` |

Finanças é o que **passa pelo mês**; Patrimônio é o que **fica**. Conquistas e Configurações não
são áreas e não têm pacote próprio. A linha de fontes visível (E-07) é o resumo em linguagem de
produto desse pacote (`fontes: 3 orçamentos, 34 transações, 3 metas`).

### 6.4 Sy: presença de 40px e camada global, não destino

Sy não é item de menu nem tela. É uma presença em todas as telas autenticadas, em três formas, e
um arquivo.

**1. Enxame 40px (`.sy40`).** O corpo de Sy, avatar de 40px em `repouso`, sempre ao lado de um
texto curto. Único outro estado: **`ouvindo`**, enquanto o input da camada (`.cask`) tem foco,
voltando a `repouso` no blur. Os estados maiores do personagem (`pensando`, `falando`, `alerta`,
`comemorando`), a apresentação em tempos, a voz e qualquer palco estão **fora do modelo**
(decisão de 2026-10-03; `personagem/vida.js` e `personagem/enxame.js` continuam sendo a
implementação única do corpo). Sem WebGL, um quadrado escuro: aceitável. Com
`prefers-reduced-motion`, 3 quadros e para.

Onde Sy aparece com o corpo: no topo de uma tela de área (1 ou 2 linhas + fontes + `Falar com
Sy sobre…`), na explicação do laboratório e no acordo de atenção de Meu dia. Em nenhum outro
lugar da página. Sy nunca é o cabeçalho, nunca é um bloco da grade, nunca é um card.

**2. Gatilho e camada (`.camada` + `.scrim`).** Gatilho: a pílula ghost **`Fale com Sy`** no `bar`
(todas as telas) e os botões com `data-coach-open` na página (`Falar com Sy sobre outubro →`,
`Decidir`), que podem semear a pergunta (`data-coach-seed`). Desktop: painel lateral direito
`min(460px, 92vw)`, altura total, fundo `--s1`, `border-left` hairline, scrim escuro; entra com
`translateX` no easing assinatura. Mobile: **sheet** `clamp(420px, 86dvh, 760px)` com handle.
Fecha por scrim, X e Esc. Conteúdo: header (eyebrow **`Sy · lendo: o seu dia`** / `o seu mês` +
fechar), estado vazio com 1 saudação (`Já li o seu dia. O que você quer saber?`) + chips de
sugestão (nunca um chat em branco), thread de bolhas (`.bub.u` roxa / `.bub.a` superfície) com
**fontes citadas** (`.meta`) sob cada resposta, cartão **Ação executada** (`.action`, borda
esquerda 3px elétrica, `Confirmado por você · 14:04`), typing dots, askbar fixa (`.cask`) e o
link `Conversa completa →`.

**3. Como Sy propõe.** Duas formas, as duas com o efeito visível antes de qualquer ação:

- **Laboratório** (§6.2 item 3, §4.2 item 3): 2 ou 3 cenários, 3 efeitos, explicação de Sy,
  "De onde vêm esses efeitos?", `Experimentar` com prévia local e `Desfazer`. Nada é lançado.
- **Intenção composta** (spec §6.2, Fase 1 do rollout): você escreve uma intenção na camada ou em
  Meu dia (`quero começar um curso de inglês`); Sy monta o contexto das áreas tocadas e devolve
  um **cartão de proposta** no padrão do laboratório, com 2 ou 3 caminhos e, em cada um, os
  **registros marcáveis** por área (linha com toggle e valor editável). Escolher o caminho e
  marcar os registros **é** a confirmação: criar registros é reversível, então Sy faz e avisa,
  com um único **`Desfazer`**. Resultado: `Feito · 4 registros em 4 áreas`, cada linha com link
  real para o registro. Intenção em aberto vira gatilho de prioridade 1 em Meu dia no dia
  seguinte. Se faltar um dado essencial, Sy pergunta **uma** coisa antes de propor.

Regra de confirmação: reversível, Sy faz e avisa com desfazer à mão; irreversível pede licença
antes.

**4. Acordo de atenção.** Em Meu dia (`.presenca`) e, na Fase 7, em `/configuracoes/sy`:
`Quando Sy pode trazer sugestões?` com três respostas (`Quando eu pedir` · `Quando algo
importante mudar`, padrão · `Em um resumo por dia`). Fora do acordo, Sy espera. Sy nunca cobra
check-in, ritmo ou resposta pendente.

**5. `/coach`, o arquivo da conversa** (rota mantida; nome interno). Não é onde se fala com Sy, é
onde se **relê** o que já foi falado: histórico contínuo com divisores de data, busca, e as
intenções como entradas com estado (`aplicada`, `desfeita`, `em aberto`), com o Desfazer
acessível ali. Template T2 (Fase 1). Alcançado por `Conversa completa →` na camada.

Backend por nível (N1 texto do dia seguindo o critério de §6.2 · N2 thread persistida com fontes ·
N3 intenção, planejar/aplicar/desfazer · N4 proatividade dentro do acordo): spec §6.

Substituído em 2026-10-03: "camada do coach", gatilho "Pergunte ao coach", o `ask` da folha de Meu dia e a vista cheia `/coach` como lugar da conversa.

### 6.5 Landing

1. Pill nav flutuante (dark, blur) + ticker grudado.
2. **Hero de dobra inteira**: pill "Novo", h1 gigante com badge do score embutido
   (`badge78`), sub com `.hl`, CTAs + prova (checks), atmosfera (2 glows radiais + fio-guia
   vertical 1px).
3. **Semicírculo das 8 áreas**: strip 520px com as `.scard` em arco, cue "Arraste →".
4. Banda de imprensa (hairlines top/bottom).
5. **Produto em espécimes** (banda escura): peças reais da UI anotadas `fig. 01–03` com
   notas de margem (`border-left` roxa 2px) e caligrafia.
   *Pendência: as peças anotadas ainda mostram o app no estilo revista; trocar pelas telas aprovadas
   (Meu dia D, Finanças A) quando as imagens reais entrarem.*
6. Marquee dos módulos (`✦` roxo).
7. Seção IA: features numeradas | chat com conversa real.
8. **Pricing como tabela editorial** (banda escura): grid `1.3fr 1fr 1fr`, coluna PRO roxa
   sólida com tag RECOMENDADO elétrica, linha de CTAs, caligrafia `cancela quando quiser`.
9. FAQ em `<details>` hairline.
10. CTA final gigante (banda escura) + footer.

### 6.6 Princípio de container

Sem cards. Um contorno/superfície só é permitido quando o elemento é um **objeto** com
identidade própria: Enxame 40px, cenário do laboratório (`.opc`), pílula de ritmo, select do
acordo, pílula de estado, tag, chip, cartão de ação executada, askbar, pill nav, camada de Sy,
sheet, mini-tela (landing). Agrupamento de conteúdo é feito por hairline, espaçamento e eyebrow,
nunca por caixa. O recibo do laboratório e a "Próxima ação" usam borda esquerda (3px / 2px), não
caixa.

---

## 7. Inventário de componentes

| Componente | Onde | Spec resumida |
|---|---|---|
| `.btn-roxo` | todas | pílula sólida roxa, hover `--roxo-h` + translateY(-1px) (landing), magnético em pointer fine |
| `.btn-ghost` | todas | pílula transparente com hairline, hover `--line-h` |
| `.eyebrow` | todas | Space Grotesk 700 10px .22em uppercase `--t3`; `b` interno roxo |
| `.ticker` | **só landing** | marquee elétrico, conteúdo 4×, 40–46s linear. Saiu do app em 2026-10-03 |
| `.modbar` | app | tabs numeradas scroll-x, ativa border-bottom roxa; primeiro item `Meu dia` |
| `.coach-pill` | app (bar) | gatilho de Sy: pílula ghost com bússola 15px + `Fale com Sy`, `data-coach-open`. Nome interno, renomeia na Fase 8 |
| `.sy40` | app | **Enxame 40px**: `<span class="sy40"><canvas></canvas></span>`, 40×40, raio 11px, fundo `#0f0d0d`; `repouso`, `ouvindo` com input em foco. Módulo `shared/sy40.js` (Fase 0) |
| `.cab` + `.score` | Meu dia | cabeçalho curto (eyebrow com data, h1 32px/28px, sub) + score quieto (44px/34px, rótulo, `Entender o número →`) |
| `.titulo` + `.sy` | área (T1) | cabeçalho curto (eyebrow `01 · Área`, h1 `Finanças · outubro`) + unidade Sy: `.sy40` + `.fala` (1 ou 2 linhas) + `.fontes` + `.falar` |
| `.margem` | Meu dia | margem de hoje: `.mhead` (eyebrow + `.pill-q`), `.livre` (`.anel` 132px/108px + h2 + frase), `.linha-dia` + `.horas`, `.mfoot` (3 números) |
| `.checkin` (= ritmo) | Meu dia | ritmo autodeclarado sobre o wiring do check-in de `app.js`: 3 `.mood` (`Mais lento` · `No meu ritmo` · `Com energia`) + `.ck-note` + `.ck-save` + `.ck-done` + `.ck-nota` (resposta). Opcional, nunca cobrado |
| `.lab` | Meu dia (e as 9 telas com laboratório) | `.perg` (eyebrow com índices, h3, `.opcoes` com 2 ou 3 `.opc`) + `.efei` (`.et`, `.imp` 3 efeitos, `.expl` com `.sy40`, `.evid` details, `.aplicar`, `.recibo` com Desfazer). Parametrizado por dados em `shared/` (Fase 0) |
| `.sec-head` | app | cabeçalho de bloco: eyebrow + h2 (24px) + frase de apoio à direita |
| `.row` | Meu dia | linha "Pede você hoje": `.ix` índice em roxo, `.tx` + `.sub`, `.val` (coral em `.warn`), `.act` ghost. Mobile: `.r2` |
| `.ag` | Meu dia | linha de agenda vertical: `time` + título + sub + `.tag` (`.ok` elétrico); `.ag.livre` = espaço protegido |
| `.presenca` | Meu dia (e `/configuracoes/sy`) | acordo de atenção: eyebrow, `.sh` (`.sy40` + h2), parágrafo, label, `.sel` (select estilizado), `.hint` |
| `.nums` | app | banda 4 colunas hairline (mobile 2×2), valores `data-cnt` |
| `.dimrow` + `.outras` | Meu dia | linha de área: só as áreas ativas ganham linha rica (índice, nome, metadado, score + tendência); as demais colapsam na linha `Outras: …` |
| `.semana` | Meu dia | uma linha de prosa com números em `b.num` + `Ver a semana →` |
| `.mrow` | app | meta com barra 3px hairline |
| `.orc` | finanças | orçamento: nome, `R$ X de R$ Y`, trilha 4px com `--w`, sub `69% · sobram R$ 560`; `.warn` coral |
| `.prox` | área | "Próxima ação": borda esquerda roxa 2px + eyebrow roxo + 1 frase |
| `.tx` | finanças | transação em grid denso `52px 1fr 130px 110px`, hover desliza, `+` elétrico, saída neutra |
| `.fluxo` | finanças | SVG linha elétrica + área gradiente + recuos coral + dot final + `.leg` + `.prosa` |
| `.rec` | finanças | recorrente: nome, `.when` com `.tag` (`.due` coral), valor |
| `.camada` / `.scrim` | todas (autenticado) | painel global de Sy: desktop lateral `min(460px,92vw)`; mobile `.camada.sheet` `clamp(420px,86dvh,760px)` com `.handle` + scrim |
| `.bub` / `.action` / `.typing` | Sy (camada + arquivo), landing | bolhas de conversa, cartão de ação (borda elétrica), typing dots |
| `.bub .meta` | Sy (camada + arquivo) | fontes citadas sob cada resposta |
| `.cempty` / `.csug` / `.chip` | Sy (camada) | estado vazio: saudação + chips de sugestão |
| `.cask` / `.askbar` | Sy (camada + arquivo) | input fixo em pílula sobre gradiente de fade |
| `.sheet` | mobile | bottom sheet com handle; substitui os modais do v3 (Fase 0 extrai para `shared/`) |
| `.painel` | desktop | painel lateral para o que no mobile é sheet; reaproveita `.camada` (Fase 0) |
| `.colofao` | app | **rodapé** hairline com metadados (fechamento projetado, streak, badges, última sincronização). Nome interno; vira `.rodape` na Fase 8 |
| `.mast` + `.selo` | **saiu** | substituído em 2026-10-03 por `.cab` + `.score` (Meu dia) e `.titulo` (área) |
| `.folha` + `.rec` + `.ask` | **saiu do app** | substituído em 2026-10-03 por `.sy` (área) e pelo laboratório + lista (Meu dia); `.rec` hoje nomeia a linha de recorrente |
| `.hoje` / `.ev` | **saiu** | substituído em 2026-10-03 pela agenda vertical `.ag` |
| `.hand` / `.hand-arrow` / `.draw` | **só landing** | caligrafia + seta que se desenha. Caveat não é carregada no app |
| `.hl` | **só landing** | marca-texto elétrico que varre |
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
| **E-04** Hairline, não card | Container/borda só para objetos (Enxame 40px, cenário `.opc`, pílulas, select, chip, tag, cartão de ação, askbar, camada de Sy, sheet; na landing, scard). Agrupamento = hairline + eyebrow + espaço |
| **E-05** Um número grande por dobra | Em Meu dia, o tempo livre no anel da margem; numa área, o primeiro dos 4 números. O score é quieto. Nunca dois heróis competindo |
| **E-06** Tri-acento com papel fixo | Roxo = ação/marca · Elétrico = positivo/dado vivo · Coral = alerta/voz de Sy em tensão. Acento como superfície só na landing (ticker e coluna PRO). **Exceção de marca (rodada 7):** gradiente segue proibido em superfícies de seção, mas marca e ícones usam gradiente **como iluminação** (aro, bisel, faceta); nenhuma cor nova |
| **E-07** Sy escreve prosa com fontes | Texto de Sy com hora e fontes (`Atualizado às 7h12 · fontes: 3 orçamentos, 34 transações, 3 metas`), respostas da camada com `Fontes: …`, laboratório com "De onde vêm esses efeitos?". Sy nunca vira widget. (Substituído em 2026-10-03: "Briefing assinado, `Escrito às…`") |
| **E-08** Números em `.num` | Space Grotesk + tabular-nums + tracking -.02em para todo valor. NBSP após `R$`, en-dash em negativos, pt-BR |
| **E-09** Módulo por índice + ícone de rumo | **Revogada em parte (rodada 7):** módulo passa a ter ícone além do índice (a bússola em cromo com a marcação do rumo acesa + primitiva da área, §5.5). Continua proibida a **cor de módulo**: mesmo material para as 8 áreas, muda geometria e rumo, nunca matiz |
| **E-10** Caveat só na landing | `.hand` restrita à landing, máx. 1 por dobra; nunca em chrome, dados ou títulos. **Não carregar a fonte nas telas do app.** (Substituído em 2026-10-03: "Caveat só na voz do coach") |
| **E-11** Objetos sempre escuros | Pill nav, mini-telas e o Enxame 40px re-declaram vars dark ou carregam a própria chapa escura mesmo em página clara |
| **E-12** Marca = Bússola da Vida | Wordmark `Sync`+`Life` + bússola (§5). Agulha sempre roxa, sul apagado, marcação acesa elétrica (ink no claro), coral nunca. Viva só com dado real de foco; sem dado, aponta o norte. Nunca como spinner |

### Regras de copy (v3 que continuam + v5 sem metáfora, 2026-10-03)

- Sem em-dash na copy (use vírgula, ponto, dois-pontos ou `·`); en-dash só em negativos
  (`– R$ 320,00`). Sentence case. "Você", nunca "o usuário". Sem emoji em chrome. Microcopy
  seca (`Salvo.`, `Registrado.`).
- **Palavras proibidas em texto visível** (classes CSS e nomes de arquivo podem continuar até a
  Fase 8): edição, edições, folha, manchete, colofão, jornal, byline, redação, diário, coach,
  assessor, "o Sy", "ao Sy", "do Sy".
- **Grafia de Sy:** sem artigo e sem contração. `Sy`, `com Sy`, `para Sy`, `Fale com Sy`,
  `Falar com Sy sobre outubro` ✅ · `o Sy`, `ao Sy`, `do Sy`, `pergunte ao Sy` ❌. Sempre `Sy`,
  nunca `SY` nem `sy`. Sy é sujeito ou vocativo.
- Sy fala em "você", direto, com os números embutidos em `.num`. A primeira frase de Sy sempre
  liga duas áreas ou traz um número. Sy nunca cobra o que ficou em branco.
- Título de tela: até 6 palavras. Eyebrow nomeia o bloco em palavras do produto (`Sua margem
  hoje`, `Pede você hoje`, `Seu acordo com Sy`, `Suas áreas`, `Números do mês`).
- QA de protótipo: `document.body.innerText.match(/edi[çc][aã]o|folha|manchete|colof[aã]o|jornal|byline|reda[çc][aã]o|di[aá]rio|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b/gi)` tem que devolver `null`.

---

## 9. Acessibilidade

- `prefers-reduced-motion` respeitado integralmente (E-02); teclado move o arco mesmo com reduce.
- Elementos decorativos com `aria-hidden` (ticker, grain, atmosfera, SVGs de dado repetido).
- Objetos informativos com `role`/`aria-label` (score quieto `.score` = `role="img"` com leitura
  completa `Life Sync Score 78, mais 3 na semana`; cartão de ação e recibo do laboratório =
  `role="status"`; efeitos do laboratório em `aria-live="polite"`; cenários com `aria-pressed`;
  anel e linha do dia com `aria-label`; `.sy40` sempre `aria-hidden`; strip da landing com
  `aria-label` e `tabindex="0"`).
- Mobile: todo alvo de toque com no mínimo 40px; `scroll-margin-top` igual à altura do bar sticky
  + 20px em todo campo e botão, para o foco nunca ficar escondido.
- Hairlines nunca são o único sinal: estado sempre acompanha texto/valor (`98%`, `EM 3 DIAS`).
- `::selection` roxa com texto branco.

---

## 10. v3 → v5 (o que muda)

| Dimensão | v3 | v5 |
|---|---|---|
| Metáfora | Dashboard de cards (SLCard/KpiCard) | Nenhuma: Meu dia · Áreas · Sy (hairlines, listas densas, prosa com fontes) |
| Display | Syne | Space Grotesk |
| Body | DM Sans | Inter |
| Mono | IBM Plex Mono (timestamps) | não existe; `.num` cobre tudo |
| Acento | Esmeralda `#0F766E` + success `#1FA67A` | Tri-acento roxo/elétrico/coral |
| Temas | 4 selecionáveis (`data-theme`) | App escuro; landing com modo por contexto (`.dk`) |
| Navegação | ModuleBar rail + Sidebar 228px | Modbar horizontal numerada, sem sidebar |
| Cor de módulo | 11 cores dessaturadas (G-06) | Abolida; índice numerado (E-09) |
| IA | Card AiConsultant com tiles | Sy: presença de 40px com texto e fontes, laboratório com efeitos, camada de conversa, acordo de atenção |
| Tela inicial | Panorama (KPIs + cards) | Meu dia: margem de hoje, ritmo, laboratório, pede você, dia, acordo |
| Modais | `Dialog` do shadcn | Sheet no mobile, painel lateral ou inline no desktop |
| Gradiente | `--sl-grad` em logo + ring | Abolido (só gradientes funcionais de dados) |
| Easing | padrão Tailwind | assinatura única `cubic-bezier(.625,.05,0,1)` |
| Identidade | Logo estrela dourada (G-10) | Wordmark provisório; símbolo em processo separado |

> A migração do app (e o destino da branch `redesign/visual-refresh-v4`) será planejada
> depois que o conjunto v5 estiver fechado. Este documento ainda não é um plano de migração.

---

## 11. Pendências do DS

Resolvidas pela reescrita de 2026-10-03:

- [x] Veredito do conjunto Meu dia / Finanças / Sy: **substituído** pelo modelo sem metáfora.
      Meu dia D e Finanças A aprovados em desktop e mobile (2026-10-03); anatomias em §6.2 e §6.3.
- [x] Conceito, dispositivos do app, chrome, inventário, E-07 e E-10 sem contradição com os
      protótipos aprovados (§1, §4, §6.1, §6.2, §6.3, §6.4, §7, §8).
- [x] Review semanal e Life Score: deixam de ser "anatomia não especificada"; viram telas T3
      (`/dashboard/review` como **Sua semana**, `/dashboard/score`), a prototipar na Fase 1 sem
      selo nem encenação.
- [x] Símbolo da marca decidido: **A Bússola da Vida** (§5, 2026-07-28).

O que a Fase 0 do rollout ainda deve ao DS:

- [ ] Templates **T2 Lista + captura**, **T3 Detalhe** e **T4 Formulário** prototipados
      (`app/_t2-lista.html`, `_t3-detalhe.html`, `_t4-form.html` + `.mobile.html`) e aprovados;
      §6.3.1 a §6.3.3 ganham medidas reais depois disso.
- [ ] Peças compartilhadas extraídas de D e A para `shared/app.css`, `shared/app.js` e
      `shared/sy40.js` (`.sy40`, `.margem`, `.ritmo`, `.lab`, `.row`, `.ag`, `.presenca`, `.nums`,
      `.dimrow`, `.semana`, `.sheet`, `.painel`) com diff de screenshot zero; o §7 passa a apontar
      para elas.
- [ ] Hub `prototypes/v5/index.html` reorganizado por fases (0 a 8), com status por tela e por
      dispositivo.
- [ ] Mock `shared/mock-data.js` re-ancorado em outubro de 2026 (feito em 2026-10-03; conferir que
      nenhum protótipo inventa número fora dele).

Pendências que continuam:

- [ ] Ajustes finos **visuais** da landing (lista do usuário pendente; cor/linguagem/layout são lei).
- [ ] Substituir micro-UIs do arco da landing por **imagens reais** das telas v5.
- [ ] Exportar os assets finais da marca (SVG mestre com grade, ICO/PNG, ícones iOS/Android) e a
      versão mono (Fase 8).
- [ ] Definição real de indicadores/gráficos/funcionalidades, área a área, dentro do ciclo de
      cada fase do rollout (Fases 2 a 7).
- [ ] Tema claro no app: decisão de produto adiada para a Fase 7 (Aparência).
- [ ] Tokens em arquivo importável (`tokens-v5.css`) quando o conjunto fechar.
- [ ] Renomear nomes internos (`.folha`, `.colofao`, `.coach-pill`, `diario*`, `use-diario`,
      `DiarioV5`) na Fase 8; DS v5.1 consolidado com os 4 templates e a matriz tela → template →
      Sy → mobile.
- [ ] Voz, gênero da voz e pronúncia de "Sy": adiados; a Fase 7 só ensina a pronúncia no
      onboarding em texto.

---

*SyncLife DESIGN-SYSTEM-v5.md · base consolidada em 2026-07-28 a partir dos protótipos da rodada 6
(`prototypes/poc-v5/r6-estudio/`); reescrito em 2026-10-03 para o modelo sem metáfora a partir de
`prototypes/v5/app/meu-dia-d*.html` e `financas-a*.html`, branch `poc/ds-v5`.*
