# POC DS v5 · Rodada 2 (Finanças + Coach nas duas direções) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir 4 protótipos (Finanças e Coach nas direções A "Estúdio" e C "Caderno") estendendo o duelo da rodada 1 para as 4 superfícies combinadas.

**Architecture:** Mesma da rodada 1: HTML standalone em `prototypes/poc-v5/`, dados em `shared/mock-data.js` (estendido na Task 7), GSAP/Lenis com guards, SEM Three.js nas telas de app (Finanças/Coach são telas internas: nada de 3D pesado, o vocabulário 3D fica nas landings). Shells reaproveitados: Finanças/Coach A usam o rail do `a-estudio/dashboard.html`; Finanças/Coach C usam o masthead do `c-caderno/dashboard.html`.

**Tech Stack:** idêntico à rodada 1 (GSAP 3.12.5 cdnjs, Google Fonts; sem Lenis e sem Three nas 4 telas desta rodada).

**Specs:** `docs/superpowers/specs/2026-07-23-poc-ds-v5-duelo-design.md` (§3, §4, §5, §11 e decisão 7).

---

## Regras herdadas da rodada 1 (valem para TODAS as tasks)

- Branch `poc/ds-v5`. Commit por protótipo, só o arquivo da task. Trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Verificação: Playwright MCP bloqueia `file://`; usar `python -m http.server` efêmero em background e matar depois. NUNCA curl. Screenshots fullPage com scroll-force quando houver reveals GSAP.
- `<link rel="icon" href="data:,">`, guards `window.SL_MOCK`/`window.gsap`, `prefers-reduced-motion` honesto, nada pré-escondido via CSS (`gsap.from` only), sem em-dash, sem emoji, sem Math.random, UTF-8.
- **Paridade A↔C:** as duas Finanças mostram o MESMO conjunto de dados; os dois Coach também. Fairness é critério de revisão final.

## Estrutura de arquivos (resultado)

```
prototypes/poc-v5/
├── shared/mock-data.js        ← Task 7 estende (transacoes, gastosPorCategoria, coach.*)
├── a-estudio/financas.html    ← Task 8
├── c-caderno/financas.html    ← Task 9
├── a-estudio/coach.html       ← Task 10
└── c-caderno/coach.html       ← Task 11
```

---

### Task 7: Estender mock-data.js

**Files:** Modify `prototypes/poc-v5/shared/mock-data.js`

- [ ] **Step 1:** Adicionar dentro de `window.SL_MOCK` (sem alterar nada existente):

```js
transacoes: [
  { d: '23 jul', desc: 'Mercado Central', cat: 'Mercado', valor: -182.4 },
  { d: '22 jul', desc: 'Freela landing page', cat: 'Renda extra', valor: 850 },
  { d: '22 jul', desc: 'Aporte CDB', cat: 'Investimento', valor: -300 },
  { d: '21 jul', desc: 'Farmácia', cat: 'Saúde', valor: -64.9 },
  { d: '20 jul', desc: 'Salário', cat: 'Renda', valor: 4150 },
  { d: '19 jul', desc: 'Restaurante japonês', cat: 'Lazer', valor: -128 },
  { d: '18 jul', desc: 'Uber', cat: 'Transporte', valor: -24.9 },
  { d: '18 jul', desc: 'Livraria', cat: 'Lazer', valor: -59.9 },
],
gastosPorCategoria: [
  { nome: 'Moradia', valor: 1240 },
  { nome: 'Mercado', valor: 520 },
  { nome: 'Lazer', valor: 410 },
  { nome: 'Transporte', valor: 310 },
  { nome: 'Saúde', valor: 180 },
],
```

E dentro de `coach` (mantendo as chaves existentes):

```js
financasA: 'Receitas cresceram 8% e o lazer estourou R$ 8. Se segurar o lazer essa semana, o mês fecha com 39% poupado.',
financasC: 'Suas contas cabem numa frase: entrou mais, saiu quase igual, sobrou R$ 1.840. O lazer pede um olho hoje.',
briefing: 'Julho está 4 pontos acima de junho. As manhãs protegidas seguraram o foco, o aporte antecipado rendeu antes da média e o único ponto solto é o orçamento de lazer, que passou do limite por R$ 8. Um ajuste pequeno hoje evita um corte grande na semana que vem.',
acoes: [
  { titulo: 'Revisar o orçamento de lazer', modulo: 'Finanças', impacto: 'fecha o mês em 39% poupado' },
  { titulo: 'Confirmar o treino de amanhã', modulo: 'Corpo', impacto: 'mantém a sequência de 3 semanas' },
  { titulo: 'Bloquear 2h de foco na sexta', modulo: 'Tempo', impacto: 'historicamente vale R$ 380 em aportes' },
],
whispers: [
  { hora: '07:12', texto: 'Briefing do dia enviado.' },
  { hora: 'ontem', texto: 'Aporte de R$ 300 confirmado, 2 dias antes do planejado.' },
  { hora: 'seg', texto: 'Semana começou com as manhãs livres de reunião. Bom sinal.' },
],
```

- [ ] **Step 2:** Verificar: `node -e "global.window={}; require('C:/Projetos/sync_life/prototypes/poc-v5/shared/mock-data.js'); console.log(window.SL_MOCK.transacoes.length, window.SL_MOCK.gastosPorCategoria.length, window.SL_MOCK.coach.acoes.length)"` → `8 5 3`. Regressão: `fmtBRL(1840)` ainda `R$ 1.840,00`; as 4 páginas da rodada 1 continuam com console limpo (checar ao menos 1 por direção via http.server+Playwright).
- [ ] **Step 3:** Commit `feat(poc-v5): mock estendido para rodada 2 (transacoes, categorias, coach)`.

---

### Task 8: Finanças A "Estúdio"

**Files:** Create `prototypes/poc-v5/a-estudio/financas.html`

Shell: copiar de `a-estudio/dashboard.html` (`:root`, fontes, body grid rail+main, rail JS). Item ativo do rail = **Finanças** (n '01'). SEM Three/Lenis; GSAP opcional (entrada).

- [ ] **Step 1:** Escrever o arquivo. Ordem do `<main>` (max-width 1240 centrado):
  1. **TopBar**: eyebrow "01 · FINANÇAS — JULHO" (elétrico) + h1 "O mês sob controle." + botão `.btn` roxo "+ Nova transação" à direita (flex space-between).
  2. **Faixa do coach** (mesmo chrome do dashboard A: s1, border-left 3px roxo): `#coach-line` = `coach.financasA` + CTA "Falar com o coach".
  3. **Hero-evidência** (grid 1.2fr/1fr): esquerda card s1 radius 20: eyebrow "SALDO LIVRE", valor `fmtBRL(1840)` em Space Grotesk 64px + pill "+12%" elétrico, sparkline GRANDE (SVG de `sparkSaldo`, stroke elétrico, área com gradient sutil, 100% largura x 120px). Direita: 2 stat blocks empilhados (mesmo padrão dot+eyebrow+valor do dashboard A): ENTRARAM `fmtBRL(5000)` dot elétrico / SAÍRAM `fmtBRL(3160)` dot coral.
  4. **Gastos por categoria** (card s1): eyebrow "PARA ONDE FOI · TOP 5"; 5 linhas de `gastosPorCategoria`: nome t1 14px + valor `.fmtBRL` Space Grotesk à direita + barra 6px (width = valor/1240*100%, fill var(--s2) com a MAIOR categoria em var(--t2); a categoria "Lazer" ganha fill coral porque o orçamento dela estourou). Direção A: cor só com significado.
  5. **Transações** (card s1): eyebrow "ÚLTIMOS LANÇAMENTOS"; 8 linhas de `transacoes`: data Space Grotesk t3 12px · desc t1 14px · cat eyebrow 10px t3 uppercase · valor à direita Space Grotesk 15px (positivo elétrico com "+", negativo t1 com "–" en-dash e o valor; NUNCA em-dash). Divisor 1px var(--line) entre linhas.
  6. **Orçamentos**: reusar exatamente o bloco de orçamentos do dashboard A (mesma função corBarra).
  7. **Banda cross**: mesmo chrome do dashboard A com `coach.cross` e link "Ver em Tempo →".
- [ ] **Step 2:** Verificar (http.server + Playwright): 0 erros; rail ativo = Finanças; 8 transações com sinais/cores certos; barras de categoria com Lazer coral; sparkline grande renderizada. Screenshot 1440x900 lido e julgado.
- [ ] **Step 3:** Polish (máx 3 iterações).
- [ ] **Step 4:** Commit `feat(poc-v5): financas A Estudio`.

---

### Task 9: Finanças C "Caderno"

**Files:** Create `prototypes/poc-v5/c-caderno/financas.html`

Shell: copiar de `c-caderno/dashboard.html` (masthead + etiquetas com corModulo map; ativa = **Finanças**). SEM Three/Lenis.

- [ ] **Step 1:** Escrever o arquivo. Ordem do `<main>`:
  1. **Hero**: h1 Anton clamp(2.6rem,5.4vw,4.6rem) `As contas <span class="outline">abertas</span><br><span style="color:var(--marrom)">de julho</span>.` + 2 stickers rotacionados: `.stk` lima "R$ 5.000 entraram" / `.stk` laranja (texto cream) "R$ 3.160 saíram".
  2. **Bilhete do coach** (mesmo chrome amarelo do dashboard C, canto dobrado, "novo"): texto `coach.financasC`, assinatura "SEU COACH · HOJE ÀS 07:12".
  3. **Extrato** (card branco 2px marrom radius 14): h2 Anton 22px "Extrato do caderno"; 8 linhas de `transacoes`: pill data (1.5px marrom, Poppins 600 10px) · desc Poppins 400 14px marrom · mini etiqueta da categoria (cores cycling rosa/lima/amarelo/cream por índice de categoria ÚNICA, não por linha: montar mapa cat→cor) · valor Anton 16px à direita (positivo verde com "+", negativo laranja com "–" en-dash). Separador 1px dashed marrom entre linhas.
  4. **Para onde foi** (card branco): h2 Anton "Para onde foi"; 5 barras HORIZONTAIS de `gastosPorCategoria`: rótulo Poppins 600 + barra height 26px com borda 2px marrom, fill na cor da categoria (mesmo mapa cat→cor do extrato; "Lazer" SEMPRE laranja porque estourou), valor Anton dentro ou à direita; tooltip etiqueta no hover (mesmo padrão do dashboard C).
  5. **Orçamentos com checks**: reusar exatamente o bloco do dashboard C (3 linhas, checks lima/amarelo/laranja).
  6. **Manchete cross** (mesma banda verde do dashboard C) antes do footer.
- [ ] **Step 2:** Verificar: 0 erros; etiqueta ativa Finanças; extrato com 8 linhas, sinais/cores certos; mapa cat→cor consistente entre extrato e barras; tooltips contidos no card. Screenshots 1440/820.
- [ ] **Step 3:** Polish (máx 3).
- [ ] **Step 4:** Commit `feat(poc-v5): financas C Caderno`.

---

### Task 10: Coach A "Estúdio"

**Files:** Create `prototypes/poc-v5/a-estudio/coach.html`

Shell: rail do dashboard A, NENHUM item ativo (rota global); breadcrumb no topo. SEM Three/Lenis.

- [ ] **Step 1:** Escrever. Ordem do `<main>` (max-width 900 centrado, mais estreito: é uma tela de leitura):
  1. **TopBar**: eyebrow "COACH · QUARTA, 23 JULHO" + h1 "O briefing de hoje."
  2. **Briefing**: parágrafo único `coach.briefing` em Inter 18px/1.75 t2 max-width 62ch, com os fatos numéricos envolvidos em `<strong style="color:var(--t1)">` ("4 pontos", "R$ 8") e UM destaque elétrico ("aporte antecipado"). Abaixo, fileira de 3 mini-stats (mesmo padrão dot+eyebrow+valor): SCORE "+4" elétrico · LAZER "+R$ 8" coral · FOCO "12h" t1.
  3. **Ações sugeridas**: eyebrow "PRÓXIMOS MOVIMENTOS"; 3 cards s1 radius 20 empilhados (gap 14): número "01/02/03" Space Grotesk roxo + título t1 16px + linha "impacto: {impacto}" t3 13px + à direita botões `.btn` roxo pequeno "Fazer agora" e ghost "Depois". Dados de `coach.acoes` (módulo mostrado como eyebrow "FINANÇAS" monocromo).
  4. **Sussurros recentes**: eyebrow "HISTÓRICO"; 3 linhas de `coach.whispers`: hora Space Grotesk t3 12px + texto t2 14px, divisor 1px line.
  5. **Perguntar**: barra fixa na base do main (não fixed na viewport; apenas último bloco): input estilizado (bg var(--s2), border 1px line, radius 999px, padding 14px 22px, placeholder "Pergunte qualquer coisa sobre o seu mês") + botão `.btn` roxo "Enviar" + `<span>` pill "⌘J" em Space Grotesk 11px t3 border line. Decorativo (sem submit real; `onsubmit="return false"`).
- [ ] **Step 2:** Verificar: 0 erros; briefing com strongs; 3 ações com botões; 3 whispers; input renderizado. Screenshot 1440x900.
- [ ] **Step 3:** Polish (máx 3).
- [ ] **Step 4:** Commit `feat(poc-v5): coach A Estudio`.

---

### Task 11: Coach C "Caderno"

**Files:** Create `prototypes/poc-v5/c-caderno/coach.html`

Shell: masthead do dashboard C, NENHUMA etiqueta ativa. SEM Three/Lenis.

- [ ] **Step 1:** Escrever. Ordem do `<main>` (max-width 860):
  1. **Hero**: h1 Anton `Uma carta<br><span class="outline">por dia</span>.` + sub Poppins "O coach não manda notificação. Escreve."
  2. **A carta de hoje**: card branco grande (2px marrom, radius 4, shadow 6px 6px 0 marrom, padding 34px 38px, canto dobrado maior 34px): eyebrow Poppins 600 11px ls .14em "QUARTA, 23 JULHO · CARTA 214" · texto `coach.briefing` Poppins 17px/1.7 marrom · linha "P.S. O lazer passou por R$ 8. Um café a menos resolve." · assinatura "SEU COACH" em Anton 20px verde. Sticker rosa "novo" rotacionado no topo.
  3. **Lembretes na geladeira**: h2 Anton 22px "Pra não esquecer"; 3 stickers GRANDES de `coach.acoes` (rosa/lima/amarelo, rotações -3/2/-2deg, padding 18px 24px): título Poppins 700 15px + impacto Poppins 400 12px. Hover: efeito carimbo.
  4. **Cartas anteriores**: 2 cards menores levemente rotacionados (-2/1.5deg, opacity .85) com `whispers[1]` e `whispers[2]` como preview (hora + texto truncado), empilhados em coluna.
  5. **Responder**: linha de caderno: input transparente com border-bottom 2px marrom (placeholder "Responda a carta...") + botão `.stamp` "Enviar". Decorativo (`onsubmit="return false"`).
  6. **Manchete cross** antes do footer (mesma banda).
- [ ] **Step 2:** Verificar: 0 erros; carta com canto dobrado + P.S. + assinatura Anton; 3 lembretes rotacionados sem oclusão de texto (rect check); 2 cartas anteriores; input linha. Screenshots 1440/820.
- [ ] **Step 3:** Polish (máx 3).
- [ ] **Step 4:** Commit `feat(poc-v5): coach C Caderno`.

---

### Task 12: Sweep + revisão final da rodada 2

- [ ] **Step 1:** Console limpo nas 8 páginas (as 4 novas + regressão nas 4 da rodada 1), via http.server + Playwright.
- [ ] **Step 2:** `grep -n "—" prototypes/poc-v5/**` → zero; emoji check → zero; todas as 4 novas referenciam SL_MOCK; valores estáticos = mock.
- [ ] **Step 3:** Paridade: Finanças A ↔ C mostram o mesmo conjunto (saldo, entraram/saíram, 8 transações, 5 categorias, 3 orçamentos, cross); Coach A ↔ C idem (briefing, 3 ações, 3 whispers/cartas, input).
- [ ] **Step 4:** Commit de ajustes se houver: `chore(poc-v5): sweep da rodada 2`.
