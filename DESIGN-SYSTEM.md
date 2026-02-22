# SyncLife — Design System v1.0

> **Fonte única de verdade** para qualquer nova tela.  
> Arquivos de referência:
> - `synclife-design-system.html` → guia visual interativo (abrir no browser)
> - `synclife-tokens.css` → importar em toda nova tela
> - `DESIGN-SYSTEM.md` → este arquivo (referência rápida)

---

## 1. Fontes

Sempre importar no `<head>` antes de qualquer CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800
  &family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400
  &family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Família    | Papel                           | Pesos usados  |
|------------|---------------------------------|---------------|
| **Syne**   | Display — títulos, scores, KPIs | 800, 700, 600 |
| **DM Sans**| Body — textos, labels, botões   | 300–600, italic|
| **DM Mono**| Mono — valores, datas, código   | 400, 500      |

### Escala tipográfica

| Token       | Tamanho | Uso típico                          |
|-------------|---------|--------------------------------------|
| `--text-xs` | 9px     | Labels uppercase, tags, badges       |
| `--text-sm` | 11px    | Hints, deltas, metadados             |
| `--text-base`| 13px  | Corpo padrão, itens de lista         |
| `--text-md` | 14px    | Base body, tooltips                  |
| `--text-lg` | 16px    | Sub-valores                          |
| `--text-xl` | 20px    | KPI values, valores monetários       |
| `--text-2xl`| 22px    | Page titles                          |
| `--text-3xl`| 28px    | Hero values (simulador)              |
| `--text-4xl`| 36px    | Scores gigantes (Life Sync Score)    |

> **Regra:** valores monetários e percentuais **sempre** em `DM Mono`.

---

## 2. Paleta de Cores

### Marca — invariantes (nunca alterar)

| Variável  | Hex       | Uso                                          |
|-----------|-----------|----------------------------------------------|
| `--em`    | `#10b981` | Esmeralda — cor primária, receitas, sucesso  |
| `--el`    | `#0055ff` | Azul Elétrico — acento, metas, Jornada       |
| `--grad`  | `135deg #10b981 → #0055ff` | Logo, Score, botão primary |

### Cores de status

| Variável    | Hex       | Uso                              |
|-------------|-----------|----------------------------------|
| `--green`   | `#10b981` | Sucesso, receitas, ≤70% orçamento|
| `--red`     | `#f43f5e` | Erro, despesas, >85% orçamento   |
| `--yellow`  | `#f59e0b` | Aviso, 70–85% orçamento, atraso  |
| `--orange`  | `#f97316` | Streak, recorrentes, urgente     |
| `--cyan`    | `#06b6d4` | Agenda, saúde, tempo             |
| `--purple`  | `#a855f7` | Estudos, aprendizado             |

### Cores por módulo

| Módulo       | Cor        | Variável               |
|--------------|------------|------------------------|
| Finanças     | `#10b981`  | `--mod-financas`       |
| Metas        | `#0055ff`  | `--mod-metas`          |
| Agenda       | `#06b6d4`  | `--mod-agenda`         |
| Saúde        | `#f97316`  | `--mod-saude`          |
| Estudos      | `#a855f7`  | `--mod-estudos`        |
| Carreira     | `#f59e0b`  | `--mod-carreira`       |
| Investimentos| `#10b981`  | `--mod-investimentos`  |

### Regra de cor para barras de orçamento

```
≤ 70%  →  --green  (no ritmo)
70–85% →  --yellow (atenção)
> 85%  →  --red    (estourado)
Metas  →  --grad   (gradiente esmeralda → azul)
```

---

## 3. Temas (4 combinações)

Controlados por classes na `<body>`. Importar `synclife-tokens.css` resolve tudo automaticamente.

```
body               = 🌙 Dark Foco    (padrão — sem classes)
body.jornada       = 🌙 Dark Jornada
body.light         = ☀️  Light Foco
body.light.jornada = ☀️  Light Jornada
```

### Tokens de superfície por tema

| Token       | Dark Foco  | Dark Jornada | Light Foco | Light Jornada |
|-------------|-----------|--------------|------------|---------------|
| `--bg`      | `#03071a` | `#020d08`    | `#e6edf5`  | `#c8f0e4`     |
| `--s1`      | `#07112b` | `#061410`    | `#ffffff`  | `#ffffff`     |
| `--s2`      | `#0c1a3a` | `#0b1e18`    | `#f0f6fa`  | `#e0f7ef`     |
| `--s3`      | `#132248` | `#112b22`    | `#dde8f2`  | `#c4eede`     |
| `--t1`      | `#dff0ff` | `#d6faf0`    | `#03071a`  | `#022016`     |
| `--t2`      | `#6e90b8` | `#4da888`    | `#1e3a5c`  | `#0d5c3e`     |
| `--t3`      | `#2e4a6e` | `#235c48`    | `#5a7a9e`  | `#4da888`     |

> **Dica:** `--s1` é sempre o fundo de cards. `--s2` é o fundo de inputs e elementos secundários. `--s3` é o fundo de barras de progresso e elementos terciários.

---

## 4. Espaçamento

Base: múltiplos de **4px**.

| Token    | Valor | Uso típico                                    |
|----------|-------|-----------------------------------------------|
| `--sp-1` | 4px   | Gap entre ícone e texto                       |
| `--sp-2` | 8px   | Gap entre chips/tags                          |
| `--sp-3` | 12px  | Padding de botão SM, gap em topbar            |
| `--sp-4` | 16px  | Padding de cards, gap de grid                 |
| `--sp-5` | 20px  | Padding padrão de card                        |
| `--sp-6` | 24px  | Padding de page, gap principal                |
| `--sp-8` | 32px  | Margin entre seções                           |
| `--sp-12`| 48px  | Padding lateral de página (desktop)           |

---

## 5. Border Radius

| Token     | Valor  | Usado em                         |
|-----------|--------|----------------------------------|
| `--r-1`   | 4px    | Tags extra small                 |
| `--r-2`   | 6px    | Tags, chips de categoria         |
| `--r-3`   | 8px    | Botões SM, hover de lista        |
| `--r-4`   | 10px   | Inputs, botões padrão            |
| `--r-5`   | 12px   | Tooltips, modais                 |
| `--r-6`   | 14px   | Cards KPI, sum cards             |
| `--r-7`   | 16px   | Cards padrão                     |
| `--r-8`   | 18px   | Cards de seção                   |
| `--r-9`   | 20px   | Cards hero, timeline card        |
| `--r-full`| 9999px | Pills, pills toggle, avatares    |

---

## 6. Estrutura padrão de tela

**Toda tela segue esta anatomia — sem exceções:**

```
① .topbar
   ├── .page-title (esquerda)
   └── ações: pills/filtros + .btn-primary (direita)

② .sum-strip (grid 4 colunas)
   └── 4× .sum-card com KPIs da tela

③ .jornada-insight (display:none por padrão)
   └── visível apenas em body.jornada

④ Conteúdo principal (grid específico da tela)
   ├── Coluna principal (conteúdo denso)
   └── Coluna lateral (ações, resumos)

⑤ .bottom-grid (3 colunas)
   └── cards de suporte / detalhes
```

```css
/* Grids usados */
.sum-strip   { grid-template-columns: repeat(4,1fr);  gap: 12px; }
.main-grid   { grid-template-columns: 1fr 340px;       gap: 16px; }
.bottom-grid { grid-template-columns: repeat(3,1fr);  gap: 16px; }
.metas-grid  { grid-template-columns: repeat(3,1fr);  gap: 16px; }
```

```css
/* Breakpoints */
@media (max-width: 900px) {
  .sum-strip, .main-grid, .bottom-grid { grid-template-columns: 1fr; }
  .sum-strip { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 600px) {
  .sum-strip { grid-template-columns: 1fr; }
}
```

---

## 7. Componentes

### Card padrão

```css
.card {
  background: var(--s1);
  border: 1px solid var(--border);
  border-radius: 16px; /* --r-7 */
  padding: 20px;       /* --sp-5 */
  transition: border-color .15s;
  animation: fadeUp .4s ease both;
}
.card:hover          { border-color: var(--border-h); }
body.light .card     { box-shadow: 0 2px 12px rgba(3,7,26,.07); }
```

### Card KPI

```css
.kpi-card { /* igual ao card + */ position: relative; overflow: hidden; }
.kpi-card::before {
  content: ''; position: absolute;
  top: 0; left: 20px; right: 20px;
  height: 2px; border-radius: 0 0 2px 2px;
  background: var(--kpi-accent, var(--em)); /* definir --kpi-accent inline */
}
```

### Botões

```html
<button class="btn btn-primary">+ Nova Meta</button>
<button class="btn btn-secondary">Cancelar</button>
<button class="btn btn-ghost">Ver todos →</button>
<button class="btn btn-danger">Excluir</button>
<button class="btn btn-icon">🔔</button>

<!-- Tamanhos -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

```css
.btn-primary   { background: linear-gradient(135deg, #10b981, #0055ff); color: #fff; }
.btn-secondary { background: var(--s2); color: var(--t2); border: 1px solid var(--border); }
.btn-ghost     { background: transparent; color: var(--em); border: 1px solid rgba(16,185,129,.25); }
.btn-danger    { background: rgba(244,63,94,.15); color: #f43f5e; border: 1px solid rgba(244,63,94,.25); }
```

### Input

```html
<div class="input-group">
  <label class="input-label">Valor do aporte</label>
  <input class="input" placeholder="R$ 0,00">
  <span class="input-hint">Mínimo R$ 50,00</span>
</div>
```

```css
.input { background: var(--s2); border: 1px solid var(--border); border-radius: 10px; }
.input:focus { border-color: var(--em); }
```

### Tags de status

```html
<span class="tag tag-green">✓ No ritmo</span>
<span class="tag tag-yellow">⚠ Em risco</span>
<span class="tag tag-red">✕ Atrasada</span>
<span class="tag tag-blue">🎯 Meta</span>
<span class="tag tag-cyan">📅 Agenda</span>
<span class="streak-badge">🔥 7 dias</span>
```

### Barra de progresso

```html
<div class="progress-bg">
  <div class="progress-fill ok" style="width:65%"></div>
</div>
<!-- Classes: .ok (verde) · .warn (amarelo) · .over (vermelho) · .goal (gradiente) -->
```

### Anel SVG (Metas)

```html
<!-- r=44, dasharray=276. dashoffset = 276 × (1 - pct/100) -->
<!-- Ex.: 65% → offset = 276 × 0.35 = 97 -->
<div class="ring-wrap" style="width:110px;height:110px">
  <svg class="ring-svg" width="110" height="110" viewBox="0 0 110 110">
    <defs>
      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#0055ff"/>
      </linearGradient>
    </defs>
    <circle class="ring-bg" cx="55" cy="55" r="44"/>
    <circle class="ring-fill" cx="55" cy="55" r="44"
            stroke="url(#rg)"
            style="stroke-dasharray:276; stroke-dashoffset:97"/>
  </svg>
  <div class="ring-center">
    <div class="ring-pct c-grad">65%</div>
    <div class="ring-sub">no ritmo</div>
  </div>
</div>
```

### Jornada Insight Block

```html
<!-- Adicionar ao HTML de toda tela. Só aparece em body.jornada -->
<div class="jornada-insight">
  <div class="ji-icon">💡</div>
  <div class="ji-text">
    Você <strong>economizou R$ 180</strong> em Alimentação este mês.
    Atenção: <span class="warn"><strong>Lazer usou 78%</strong></span> do orçamento.
  </div>
</div>
```

### Lista interativa

```html
<div class="list-item">
  <div class="list-dot" style="background:var(--green)"></div>
  <div class="list-label">Salário</div>
  <div class="list-value g">+R$ 5.000</div>
</div>
```

### Pill toggle (filtros)

```html
<div class="pill-group">
  <button class="pill act-r" onclick="setScenario('p')">📉 Pessimista</button>
  <button class="pill act"   onclick="setScenario('r')">📊 Realista</button>
  <button class="pill act-b" onclick="setScenario('o')">🚀 Otimista</button>
</div>
```

---

## 8. Modo Foco vs Modo Jornada

### Diferenças obrigatórias por modo

| Elemento                    | 🎯 Foco                     | 🌱 Jornada                         |
|-----------------------------|-----------------------------|------------------------------------|
| Saudação no header          | Título estático ("Dashboard")| "Boa tarde, Thiago! ✨"            |
| Life Sync Score             | Oculto                      | Card hero com número grande        |
| Streak badge                | Oculto                      | 🔥 N dias no header               |
| Insight IA                  | Grid de stats compactos     | Texto narrativo com highlights     |
| Campo de pergunta IA        | Ausente                     | Input "Pergunte algo..."           |
| Card bottom direito         | Resumo de dados / histórico | Conquistas / badges                |
| Tips em cards de meta       | Ausentes                    | Card colorido com dica contextual  |
| Page title                  | Cor normal (`--t1`)         | Gradiente esmeralda → azul         |
| Tom                         | Preciso, analítico, neutro  | Motivacional, pessoal, celebrativo |

### Como implementar no CSS

```css
/* Elementos exclusivos do Jornada — usar CSS puro, nunca JS */
.jornada-only { display: none; }
body.jornada .jornada-only { display: flex; } /* ou block, grid */

/* Elementos exclusivos do Foco */
.foco-only { display: block; }
body.jornada .foco-only { display: none; }
```

---

## 9. Animações

```css
/* Entrada de cards (adicionar ao .card + .d1 ... .d5) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeUp .4s ease both; }
.d1 { animation-delay: .05s; }
.d2 { animation-delay: .10s; }
.d3 { animation-delay: .15s; }
.d4 { animation-delay: .20s; }
.d5 { animation-delay: .25s; }

/* Transições padrão */
--dur-fast:  .12s   /* hover imediato */
--dur-base:  .15s   /* hover de card, botão */
--dur-slow:  .25s   /* transição de cor de texto */
--dur-theme: .30s   /* troca de tema (background) */
--dur-bar:   1.00s  /* barras de progresso */
--dur-ring:  1.20s  /* anéis SVG */
--ease-bar:  cubic-bezier(0.4, 0, 0.2, 1)

/* Pulse — alertas e streaks */
@keyframes warnPulse {
  0%,100% { border-color: rgba(249,115,22,.25); }
  50%     { border-color: rgba(249,115,22,.60); }
}

/* Pulse — Score hero (Jornada) */
@keyframes pulseBorder {
  0%,100% { border-color: rgba(16,185,129,.20); }
  50%     { border-color: rgba(16,185,129,.45); }
}
```

---

## 10. Ícones por módulo

| Ícone | Módulo / Uso          | Ícone | Módulo / Uso        |
|-------|-----------------------|-------|---------------------|
| 🐷    | Finanças (nav)        | 💼    | Salário / Carreira  |
| 🎯    | Metas                 | 🏠    | Moradia             |
| 📅    | Agenda                | 🍽️   | Alimentação         |
| 🏥    | Saúde                 | 🚗    | Transporte          |
| 📚    | Estudos               | 🎮    | Lazer               |
| 📈    | Investimentos / Saldo | 🛡️   | Reserva emergência  |
| ⚙️    | Configurações         | ✈️    | Viagem / Meta       |
| 💰    | Receitas              | 🔥    | Streak              |
| 📤    | Despesas              | 🏆    | Conquistas          |
| 🔄    | Recorrentes           | 💡    | IA Insight          |
| ⭐    | Score / Destaque      | 🌱    | Jornada (modo)      |

---

## 11. Guia rápido para criar nova tela

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncLife — [Nome da Tela]</title>
  <!-- 1. Fontes -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800
    &family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600
    &family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <!-- 2. Tokens -->
  <link rel="stylesheet" href="synclife-tokens.css">
  <style>
    /* CSS específico desta tela aqui */
  </style>
</head>
<body>
  <!-- 3. Controles de dev (remover em produção) -->
  <div class="controls">...</div>

  <div class="page">
    <!-- ① Topbar -->
    <div class="topbar">
      <div class="page-title">🎯 Nome da Tela</div>
      <div class="topbar-spacer"></div>
      <!-- Pills / filtros -->
      <button class="btn btn-primary">+ Nova Ação</button>
    </div>

    <!-- ② Summary Strip -->
    <div class="sum-strip">
      <div class="sum-card d1">...</div>
      <div class="sum-card d2">...</div>
      <div class="sum-card d3">...</div>
      <div class="sum-card d4">...</div>
    </div>

    <!-- ③ Jornada Insight (CSS controla visibilidade) -->
    <div class="jornada-insight">
      <div class="ji-icon">💡</div>
      <div class="ji-text">Texto narrativo da IA...</div>
    </div>

    <!-- ④ Conteúdo principal -->
    <div class="main-grid">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card d1">...</div>
        <div class="card d2">...</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card d3">...</div>
      </div>
    </div>

    <!-- ⑤ Bottom Grid -->
    <div class="bottom-grid">
      <div class="card d1">...</div>
      <div class="card d2">...</div>
      <!-- Foco: resumo / Jornada: conquistas -->
      <div class="card d3">
        <div class="foco-only">Histórico...</div>
        <div class="jornada-only">Conquistas...</div>
      </div>
    </div>
  </div>

  <script>
    function setMode(m) {
      document.body.classList.toggle('jornada', m === 'jornada');
    }
    function setTheme(t) {
      document.body.classList.toggle('light', t === 'light');
    }
  </script>
</body>
</html>
```

---

## 12. Checklist antes de publicar nova tela

- [ ] Fontes Syne, DM Sans e DM Mono carregando
- [ ] `synclife-tokens.css` importado
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Estrutura de tela correta: topbar → sum-strip → insight → conteúdo → bottom-grid
- [ ] Valores monetários e % usam `DM Mono`
- [ ] Page title em gradiente no Jornada
- [ ] `.jornada-insight` aparece só em `body.jornada`
- [ ] Bottom card muda (dados vs conquistas) por modo
- [ ] Cards entram com `fadeUp` e delays `.d1`–`.d5`
- [ ] Barras de progresso animam com `transition: width 1s cubic-bezier(.4,0,.2,1)`
- [ ] Cores de barra seguem regra: ≤70% verde, 70–85% amarelo, >85% vermelho, metas gradiente
- [ ] Hover de card: `border-color: var(--border-h)`
- [ ] Hover de lista: background `var(--s2)` + margin negativa
- [ ] Responsivo: colapsa para 1 coluna em `max-width: 900px`

---

*SyncLife Design System v1.0 — atualizar este documento ao criar novos padrões*
