# Onda 2 · lote 2 · Protótipos: A edição da semana + A anatomia do número — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar os 4 protótipos do lote 2 (`review-semanal` e `life-score`, cada um desktop + mobile dedicado 390×844) prontos para aprovação no hub, mais o mock que os alimenta, com a matemática do score internamente consistente.

**Architecture:** Mesma stack dos protótipos do lote 1: HTML standalone sob `prototypes/v5/app/`, `<html lang="pt-BR" class="dk">`, importando `../shared/{tokens,base,app}.css` e `../shared/{mock-data,app}.js` com `SLApp.boot()`. CSS específico da tela inline; chrome, bolhas, camada e check-in vêm das primitivas compartilhadas. Motion = CSS + IntersectionObserver (sem GSAP). Nenhuma lib de gráfico: a curva de 30 dias é SVG escrito à mão no vocabulário v5.

**Tech Stack:** Google Fonts (Space Grotesk 400;500;600;700 · Inter 400;500;600 · Caveat 600;700) · CSS puro · `window.SL_MOCK`.

**Spec:** `docs/superpowers/specs/2026-08-01-onda2-lote2-review-score-design.md` (ler inteira antes de começar; commit `162a626`).

**Referências de identidade (LEI):** `prototypes/v5/app/diario.html` e `diario.mobile.html` são o padrão de chrome, masthead, folha `.lt`, bandas de números, listas de áreas, colofão e banda de estados. Em divergência entre este plano e os protótipos aprovados, os protótipos vencem.

---

## Regras herdadas (valem para TODAS as tasks)

- Branch `poc/ds-v5`. Commit por task, só os arquivos da task, trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- QA: Playwright MCP bloqueia `file://` → `python -m http.server 8123` na pasta `prototypes/v5` (background; matar por PID do processo real no fim). O server CACHEIA: sempre `?v=rN`. **NUNCA curl.**
- `prefers-reduced-motion` e sem-JS = página estática completa com os valores finais no HTML (E-02). Nada pré-escondido fora do padrão `.anim`.
- Sem em-dash (—) em copy; en-dash `–` só em negativo. Sem emoji. Sentence case. Você, nunca "o usuário". Caveat (`.hand`) só na voz do coach.
- `R$` sempre seguido de NBSP (`&nbsp;` no HTML, byte `0xC2 0xA0` no JS).
- **NUNCA `padding:X 0` (shorthand vertical) em elemento que carrega `.wrap`.**
- Wordmark sempre `<span class="wm">Sync<em>Life</em></span>`.
- **Contratos das primitivas (lote 1, não repetir os bugs):** elementos alternados por JS usam só o atributo `hidden` (o `app.css` tem `[hidden]{display:none!important}`), **nunca** `style="display:…"` inline; wrapper estrutural com classe `.in` exige combinador filho (`.folha > .in`), nunca descendente, porque o observer adiciona `.in` em `.rv/.draw`; alvos de toque no mobile ≥ 40px; `[data-cnt]` (se usar count-up) só com `.num` e valor inteiro.
- Banda final **"Estados · anotação do protótipo"** com atributo `inert`, fora do fluxo do app, mostrando os estados que só existem por interação.
- Screenshot fullPage no mobile pinta elementos fixos no meio da imagem (artefato do Chromium): usar segmentos ou fechar overlays antes.
- Sem `Math.random`, sem `Date.now`, sem CDN além do Google Fonts.
- Comentários-guia deste plano NÃO podem sobrar nos arquivos finais.

## Estrutura de arquivos (resultado)

```
prototypes/v5/shared/mock-data.js          ← T1 (semana + scoreDetalhe + dims reconciliadas)
prototypes/v5/app/diario.html              ← T1 (só os 4 números das áreas ativas)
prototypes/v5/app/diario.mobile.html       ← T1 (idem)
prototypes/v5/app/review-semanal.html      ← T2
prototypes/v5/app/review-semanal.mobile.html ← T3
prototypes/v5/app/life-score.html          ← T4
prototypes/v5/app/life-score.mobile.html   ← T5
prototypes/v5/index.html                   ← T6
docs/handoff/HANDOFF-v5.md                 ← T8
```

---

### Task 1: Mock do lote 2 + matemática consistente

**Files:**
- Modify: `prototypes/v5/shared/mock-data.js`
- Modify: `prototypes/v5/app/diario.html`, `prototypes/v5/app/diario.mobile.html` (só 4 números)

**Por que mexer no Diário:** a tela de Life Score expõe a conta (peso × score = contribuição). Com os valores atuais das áreas ativas (82/74/64/80) e os pesos do motor, o total ponderado dá 75, não os 78 que o mock declara. Como o lote 2 mostra a matemática, o mock precisa fechar. A correção mínima é ajustar os 4 scores das áreas ativas para um conjunto que some 78; identidade visual não muda.

- [ ] **Step 1: Reconciliar `dims` no mock**

Em `prototypes/v5/shared/mock-data.js`, no array `dims`, trocar SOMENTE os scores das 4 áreas ativas (mantendo `n`, `nome`, `meta`, `tr`):

| Área | de | para |
|---|---|---|
| 01 Finanças | 82 | **83** |
| 02 Futuro | 74 | **79** |
| 04 Corpo | 64 | **69** |
| 08 Experiências | 80 | **78** |

As 4 inativas ficam intactas (03 Tempo 71, 05 Mente 58, 06 Patrimônio 76, 07 Carreira 69).

Conferência (pesos do motor: financas .20, futuro .20, corpo .15, experiencias .05; normalizados entre as ativas: .3333/.3333/.25/.0833):
`83×.3333 + 79×.3333 + 69×.25 + 78×.0833 = 27,7 + 26,3 + 17,3 + 6,5 = 77,8` → **78**, igual a `score.value`.

- [ ] **Step 2: Adicionar o bloco `semana`**

Inserir depois de `dims` (NBSP real após cada `R$`):

```js
  // A edição da semana (review semanal): dados da semana fechada
  semana: {
    numero: 31,
    inicio: '27 de julho',
    fim: '2 de agosto',
    scoreFim: 78,
    scoreInicio: 75,
    fechada: false,
    fechadaEm: 'domingo, 2 de agosto, às 21:30',
    nums: { entradas: 1850, saidas: 940, eventosFeitos: 11, eventosTotal: 14, focoHoras: '6h30' },
    // variação por área ativa na semana (de → para; bate com dims)
    mudou: [
      { n: '01', nome: 'Finanças',     de: 80, para: 83 },
      { n: '02', nome: 'Futuro',       de: 75, para: 79 },
      { n: '04', nome: 'Corpo',        de: 70, para: 69 },
      { n: '08', nome: 'Experiências', de: 74, para: 78 },
    ],
    carta: {
      headline: 'A semana virou no meio: o que travou na segunda destravou na quinta.',
      p1: 'Você fechou a semana com R$ 1.850 de entradas contra R$ 940 de saídas, o melhor saldo semanal de julho. O lazer chegou perto do teto de novo, mas dessa vez você segurou: foram R$ 128 em quatro dias, contra R$ 310 na semana anterior.',
      p2: 'Na agenda, 11 dos 14 compromissos saíram e você protegeu 6h30 de foco, uma hora a mais que na semana passada. Corpo foi o único ponto que recuou: dois treinos previstos ficaram para trás e o peso não foi registrado.',
      hand: 'segunda-feira começa com o treino que sobrou!',
      basedOn: '38 transações, 14 compromissos e 3 metas',
      assinatura: 'Escrito no domingo, 2 de agosto, às 20:10',
    },
  },
```

- [ ] **Step 3: Adicionar o bloco `scoreDetalhe`**

Inserir depois de `semana`. Os `componentes` são os do motor real (`use-score-engine.ts`), com os pesos internos reais, e cada área fecha na conta:

```js
  // A anatomia do número (life score): composição real do motor
  scoreDetalhe: {
    total: 78,
    label: 'Consistente',
    deltaSemana: 3,
    calculadoEm: 'hoje, às 14:05',
    // 30 dias, mais antigo primeiro (determinístico, sem random)
    historico: [68, 69, 69, 70, 70, 71, 71, 70, 72, 72, 73, 73, 72, 74, 74, 75, 75, 74, 75, 76, 76, 75, 76, 77, 77, 76, 77, 77, 78, 78],
    areas: [
      { n: '01', nome: 'Finanças', score: 83, peso: 20, contrib: 27.7, componentes: [
        { nome: 'Orçamento do mês', peso: 40, valor: 90 },
        { nome: 'Registro de transações', peso: 30, valor: 75 },
        { nome: 'Tendência de saldo', peso: 30, valor: 80 },
      ] },
      { n: '02', nome: 'Futuro', score: 79, peso: 20, contrib: 26.3, componentes: [
        { nome: 'Progresso dos objetivos', peso: 50, valor: 88 },
        { nome: 'Objetivos concluídos no trimestre', peso: 50, valor: 70 },
      ] },
      { n: '04', nome: 'Corpo', score: 69, peso: 15, contrib: 17.3, componentes: [
        { nome: 'Atividades da semana', peso: 30, valor: 75 },
        { nome: 'Consulta agendada', peso: 30, valor: 80 },
        { nome: 'Registros de peso', peso: 20, valor: 50 },
        { nome: 'Hidratação', peso: 20, valor: 60 },
      ] },
      { n: '08', nome: 'Experiências', score: 78, peso: 5, contrib: 6.5, componentes: [
        { nome: 'Viagens planejadas e feitas', peso: 60, valor: 90 },
        { nome: 'Bucket list', peso: 40, valor: 60 },
      ] },
    ],
    // áreas desligadas no onboarding: entram na linha quieta, sem score
    inativas: ['03 Tempo', '05 Mente', '06 Patrimônio', '07 Carreira'],
    melhorias: [
      { titulo: 'Registrar o peso desta semana', detalhe: 'O registro de peso vale 20% do score de Corpo e está pela metade.', onde: 'Corpo' },
      { titulo: 'Fechar a meta de água de hoje', detalhe: 'Hidratação vale outros 20% de Corpo e é o componente mais baixo da área.', onde: 'Corpo' },
      { titulo: 'Concluir um objetivo do trimestre', detalhe: 'Objetivos concluídos valem metade do score de Futuro, a área de maior peso junto com Finanças.', onde: 'Futuro' },
    ],
  },
```

- [ ] **Step 4: Alinhar os 4 números nos protótipos do Diário**

Em `prototypes/v5/app/diario.html` e `diario.mobile.html`, nas linhas `.dimrow` das áreas ativas, trocar os scores exibidos: `82`→`83`, `74`→`79`, `64`→`69`, `80`→`78`. As tendências (`▲2`, `▲1`, `▲3`, `–`) e a linha `Outras:` ficam como estão. Nenhuma outra alteração nesses arquivos.

- [ ] **Step 5: Verificar**

Run (Bash): `node -e "global.window={}; require('C:/Projetos/sync_life/prototypes/v5/shared/mock-data.js'); const m=window.SL_MOCK; const w={'01':.20,'02':.20,'04':.15,'08':.05}; const a=m.scoreDetalhe.areas; const t=a.reduce((s,x)=>s+w[x.n],0); const tot=a.reduce((s,x)=>s+x.score*w[x.n]/t,0); console.log('total', Math.round(tot), 'contribs', a.map(x=>Math.round(x.score*w[x.n]/t*10)/10).join(','), 'hist', m.scoreDetalhe.historico.length, 'semana', m.semana.numero)"`
Expected: `total 78 contribs 27.7,26.3,17.3,6.5 hist 30 semana 31`

Depois conferir NBSP nos blocos novos (`od -c` numa linha com `R$` mostra `302 240`) e que `grep -n 'R\$ '` com espaço comum não bate nos blocos novos.

- [ ] **Step 6: Smoke do hub (regra do programa: mudou `shared/` com ondas aprovadas)**

Servir `prototypes/v5` e abrir `index.html?v=l2a` + `app/diario.html?v=l2a`: hub renderiza, Diário mostra os novos números nas 4 áreas ativas, console sem erros. Matar o server.

- [ ] **Step 7: Commit**

```bash
git add prototypes/v5/shared/mock-data.js prototypes/v5/app/diario.html prototypes/v5/app/diario.mobile.html
git commit -m "proto(v5): mock do lote 2 (semana + anatomia do score) e areas do Diario reconciliadas com os pesos

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `app/review-semanal.html` — A edição da semana (desktop)

**Files:**
- Create: `prototypes/v5/app/review-semanal.html`
- Base: `prototypes/v5/app/diario.html` (chrome, masthead, folha `.lt`, banda de números, colofão, banda de estados) — ler inteiro antes.

- [ ] **Step 1: Escrever a página**

Head igual ao do Diário (título `SyncLife · Edição da semana · v5`, favicon, fonts, `../shared/{tokens,base,app}.css`, `<style>` só da tela). Chrome idêntico ao do Diário, com duas diferenças: no `.modbar`, **Diário continua sendo o item ativo** (a edição da semana é uma vista do Diário, não um módulo novo); no `.bar`, a ação "Revisão semanal" fica em estado ativo (`aria-current="page"`, borda `--roxo`).

Corpo, na ordem da spec §3:

1. **Masthead** — eyebrow `Edição da semana nº 31 · 27 de julho a 2 de agosto`; h1 `A semana fechada.`; sub = `carta.headline`; selo à direita com `78` (`.num`), `+3 na semana` e `Consistente`.
2. **A folha** (`<section class="folha lt">`) — eyebrow `A carta da semana · escrita pelo coach`; h2 = `carta.headline`; dois `.body` = `carta.p1` e `carta.p2` (com `<strong class="num">` nos valores e `.warn` no ponto de tensão, como no Diário); `.draw` + `.hand` = `carta.hand`; `.ass` = `carta.assinatura` + `, com base em ` + `carta.basedOn` + `.`. Coluna direita (`.recs`): **A semana em uma linha**, com 3 linhas de destaque derivadas da carta (saldo da semana, agenda, ponto que recuou), cada uma com número em `.num`; sem input de pergunta (a camada do coach é do Diário, não repete aqui).
3. **A semana em números** — banda de 4 colunas com hairlines, igual `.nums` do Diário: `Entradas R$&nbsp;1.850` / `Saídas R$&nbsp;940` / `Compromissos 11 de 14` / `Foco 6h30`; legendas honestas embaixo (`na semana`, `62% do que entrou`, `79% concluídos`, `1h a mais que a anterior`).
4. **O que mudou** — eyebrow `O que mudou` + lista no formato `.dimrow`: número da área, nome, `de → para` em `.num` e a variação (`▲3` elétrico, `▼1` coral, `–` em `--t3`). Só as 4 ativas. Abaixo, linha quieta: `Áreas desligadas não entram na conta da semana.`
5. **Fechar a semana** — banda entre hairlines com: eyebrow `Fechamento`, frase `Guardar esta edição e somar à sua sequência.`, texto curto do que a ação faz (`Guarda o retrato da semana e conta para as suas conquistas.`) e `<button class="btn-sm roxo">Fechar a semana</button>`. Sem linguagem de cobrança, sem streak exibido como pressão.
6. **Colofão** — `Período coberto 27 jul a 2 ago` · `Base do cálculo 38 transações · 14 compromissos · 3 metas` · link `Ver o diário de hoje →`.

**Banda "Estados · anotação do protótipo"** (com `inert`), 3 espécimes estáticos: (a) **semana já fechada** (o bloco 5 vira confirmação: `Fechada no domingo, 2 de agosto, às 21:30`, com o botão substituído por texto e ícone de check); (b) **semana em curso** (botão desabilitado + razão em texto: `Você pode fechar quando a semana terminar, no domingo.`); (c) **sem histórico de score** (o bloco 4 substituído por: `Ainda não há uma semana anterior para comparar. Na próxima edição isto aqui mostra o que mudou.`).

- [ ] **Step 2: Espiar no navegador**

Servir `prototypes/v5` (8123, background) e abrir `app/review-semanal.html?v=r1` em 1440×900: screenshot fullPage (rolar até o fim + 2s), console limpo, sem scroll-x. Matar o server.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/review-semanal.html
git commit -m "proto(v5): A edicao da semana - review semanal desktop (onda 2 lote 2)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `app/review-semanal.mobile.html` (390×844 dedicado)

**Files:**
- Create: `prototypes/v5/app/review-semanal.mobile.html`
- Base: `review-semanal.html` (T2) + `prototypes/v5/app/diario.mobile.html` (padrão de compactação mobile) — ler os dois.

- [ ] **Step 1: Escrever a página**

Mesma head (título `SyncLife · Edição da semana · mobile · v5`). Compactação, seguindo o Diário mobile: `.bar` 56px (brand + pílula `Coach` + `+`), ticker 24px, modbar igual, masthead empilhado com selo em faixa (score 40px à esquerda, `+3 na semana · Consistente` à direita), folha em 1 coluna com a coluna de destaques abaixo separada por hairline tracejada, banda de números 2×2, `O que mudou` em 1 coluna, bloco de fechamento empilhado com o botão em largura total (altura ≥ 44px), colofão em coluna. Preservar os contratos do lote 1: `.folha > .in`, `hidden` puro, alvos ≥ 40px. Mesma banda de estados com `inert`.

- [ ] **Step 2: Espiar em 390×844**

Servir, abrir `app/review-semanal.mobile.html?v=m1`, screenshot fullPage (sem overlays abertos), console limpo, `scrollWidth === clientWidth`. Matar o server.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/review-semanal.mobile.html
git commit -m "proto(v5): A edicao da semana - mobile dedicado 390x844

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `app/life-score.html` — A anatomia do número (desktop)

**Files:**
- Create: `prototypes/v5/app/life-score.html`
- Base: `prototypes/v5/app/diario.html` (chrome, masthead/selo, listas, colofão, banda de estados).

- [ ] **Step 1: Escrever a página**

Head igual (título `SyncLife · Life Sync Score · v5`). Chrome com `Diário` ativo na modbar (o score é uma vista do Diário). Corpo, na ordem da spec §4:

1. **Masthead** — eyebrow `Life Sync Score`; h1 `A anatomia do número.`; sub `Como as suas áreas somam 78 hoje.`; selo grande à direita: `78` (`.num`, tamanho do selo do Diário), `+3 esta semana`, `Consistente`.
2. **A curva** — banda com eyebrow `Últimos 30 dias` e SVG escrito à mão: `viewBox="0 0 720 160"`, `preserveAspectRatio="none"` no traço, path da polilinha suavizada a partir de `scoreDetalhe.historico` (30 pontos, min/max do próprio array com folga de 4 pontos), traço 2px `--roxo`, área com gradiente `--roxo` 18% → transparente, hairline de base, ponto final 4px elétrico, e dois rótulos `.num` pequenos: o valor de 30 dias atrás à esquerda e o de hoje à direita. Sem tooltip nesta rodada (o protótipo é estático; interação de gráfico entra se a rodada de feedback pedir).
3. **As 8 áreas** — lista `.dimrow` estendida com 4 colunas: número + nome | score `.num` | `peso 20%` (em `--t3`) | `contribui 27,7` (em `.num`, com o rótulo `de 78` em `--t3`). Só as 4 ativas. Abaixo, linha quieta: `Fora da conta: 03 Tempo · 05 Mente · 06 Patrimônio · 07 Carreira, desligadas no onboarding.`
4. **Por dentro de cada área** — para cada área ativa, um bloco com o nome, o score e a lista dos `componentes`: nome, `peso interno` (`40% da área`) e uma barra hairline de 3px com o `valor` (mesma barra das metas do Diário), valor em `.num` à direita. O componente mais fraco de cada área recebe borda esquerda coral 2px, sinalizando onde está a perda.
5. **Como melhorar** — 3 linhas numeradas (01-03) com `titulo`, `detalhe` e o destino (`onde`) como link `→ Corpo`. Nada de promessa numérica de ganho.
6. **Colofão** — `Média ponderada das áreas ativas, com os pesos redistribuídos.` · `Último cálculo hoje, às 14:05` · link `Ver o diário de hoje →`.

**Banda "Estados · anotação do protótipo"** (`inert`), 2 espécimes: (a) **sem histórico** (a curva substituída por: `A curva aparece quando houver pelo menos dois dias registrados.`); (b) **todas as áreas ativas** (a lista do bloco 3 com as 8 áreas e a linha quieta ausente).

- [ ] **Step 2: Espiar no navegador**

Abrir `app/life-score.html?v=r1` em 1440×900, screenshot fullPage, console limpo, sem scroll-x. Conferir que a curva desenha (path com 30 pontos, sem NaN no `d`).

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/life-score.html
git commit -m "proto(v5): A anatomia do numero - life score desktop (onda 2 lote 2)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: `app/life-score.mobile.html` (390×844 dedicado)

**Files:**
- Create: `prototypes/v5/app/life-score.mobile.html`
- Base: `life-score.html` (T4) + `diario.mobile.html`.

- [ ] **Step 1: Escrever a página**

Compactação: `.bar` 56px, ticker 24px, masthead empilhado com selo em faixa, curva com `viewBox="0 0 350 120"` e rótulos menores, lista de áreas em 1 coluna (score e contribuição na mesma linha, peso abaixo do nome em 11px `--t3`), blocos de componentes empilhados com as barras em largura total, `Como melhorar` em 1 coluna, colofão em coluna. Contratos do lote 1 preservados. Mesma banda de estados com `inert`.

- [ ] **Step 2: Espiar em 390×844**

`app/life-score.mobile.html?v=m1`, screenshot fullPage, console limpo, sem scroll-x.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/app/life-score.mobile.html
git commit -m "proto(v5): A anatomia do numero - mobile dedicado 390x844

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Hub

**Files:** Modify `prototypes/v5/index.html`

- [ ] **Step 1: Atualizar a onda 02**

Substituir as duas linhas do lote 2 por:

```js
      ['Edição da semana (review semanal)', 'app/review-semanal.html', 'app/review-semanal.mobile.html', 'aprovacao'],
      ['Life Score · a anatomia do número', 'app/life-score.html', 'app/life-score.mobile.html', 'aprovacao'],
```

(as duas primeiras linhas da onda 02, Diário e camada, permanecem `implementado`).

- [ ] **Step 2: Smoke**

Abrir `index.html?v=l2b`: as 4 linhas da onda 02 renderizam com os links certos; clicar em `abrir` de cada uma das duas telas novas e confirmar que carregam; console limpo.

- [ ] **Step 3: Commit**

```bash
git add prototypes/v5/index.html
git commit -m "proto(v5): hub - lote 2 (edicao da semana + life score) em aprovacao

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: QA dos 4 protótipos + regressão

**Files:** Modify (se reprovar) os arquivos do lote 2.

- [ ] **Step 1: Console e overflow**

Com o server de pé, para as 4 telas (desktop em 1440×900, mobile em 390×844), com `?v=qa1`: console 0 erros e 0 warnings (favicon incluso); `document.documentElement.scrollWidth === clientWidth`.

- [ ] **Step 2: E-02 (reduce e sem JS)**

Recarregar as 4 com `prefers-reduced-motion: reduce` emulado e, separadamente, com JavaScript desabilitado: página inteira estática com os valores finais; a curva do Life Score continua desenhada (é markup, não JS); a banda de estados mostra todos os espécimes; nada invisível.

- [ ] **Step 3: Consistência de dados entre telas**

O total do Life Score (78), o selo do Diário (78), o `scoreFim` da semana (78) e os scores por área (83/79/69/78) precisam bater entre as 4 telas novas e as 2 do Diário. Conferir também que a soma das contribuições exibidas (27,7 + 26,3 + 17,3 + 6,5) chega a 77,8, arredondado para 78 no selo, e que a página diz isso de forma honesta (o colofão explica o arredondamento se necessário).

- [ ] **Step 4: Varreduras**

Em `prototypes/v5/app/{review-semanal,life-score}*.html` e no bloco novo de `shared/mock-data.js`: em-dash (—) → 0; `R$ ` com espaço comum → 0; `Math.random|Date.now` → 0; `padding:[0-9][^;]* 0[;}]` em portador de `.wrap` → inspecionar hits; `style="display:` em elemento com `hidden` → 0.

- [ ] **Step 5: Regressão**

Abrir `index.html`, `app/diario.html`, `app/diario.mobile.html`, `landing/landing-viva.html` e `auth/login.html` com `?v=qa1`: visual íntegro e console limpo (o mock ganhou chaves novas e teve 4 números alterados; nada mais pode ter mudado).

- [ ] **Step 6: Fixes**

Corrigir o que reprovar e commitar `proto(v5): fixes de QA do lote 2` + trailer. Se nada reprovar, não commitar. Matar o server no fim.

---

### Task 8: Handoff

**Files:** Modify `docs/handoff/HANDOFF-v5.md`

- [ ] **Step 1: Atualizar**

Tabela de ondas: Onda 2 → lote 2 em aprovação (edição da semana + life score). Entrada datada nova com: a decisão de produto (spec `2026-08-01-onda2-lote2-review-score-design.md`, commit `162a626`) e os dois achados que a motivaram (review v3 com dados 100% mock e schema quebrado pela migration 016 inerte; tela de score usando `useLifeMap` em vez do motor oficial, com delta hardcoded e 6 das 8 áreas); o que foi prototipado; a reconciliação da matemática do mock (por que os 4 scores das áreas ativas mudaram e como a conta fecha em 78); o que fica para a implementação (migration `028` de reconciliação, `/api/ai/review-brief` com cache semanal, troca da fonte do score para `useScoreEngine`, rotas movidas para `(app-v5)`); e o que fica fora (unificação dos dois motores de score, `/tempo/review`, cron `weekly-digest`, ledger de XP).

- [ ] **Step 2: Commit**

```bash
git add docs/handoff/HANDOFF-v5.md
git commit -m "docs(v5): handoff lote 2 - edicao da semana + life score em aprovacao

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Fora deste plano

- Aprovação do usuário (gate do programa) e rodadas de ajuste dos protótipos.
- Implementação em `web/` (route group `(app-v5)`, migration `028`, `/api/ai/review-brief`, troca da fonte do Life Score, QA de identidade): plano próprio pós-aprovação.
- Unificação `useScoreEngine` × `useLifeMap`, migração de `/tempo/review`, cron `weekly-digest`, ledger de XP.
