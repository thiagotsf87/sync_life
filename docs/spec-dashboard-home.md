# Spec — Dashboard Home (Fase 5.1 + Fase 13)

> Protótipo de referência: `prototipos/proto-dashboard-revisado.html`
> Rota: `/dashboard` (app/(app)/dashboard/page.tsx)
> Status: Reescrita completa do arquivo existente (v1 legado)

---

## 1. Estrutura da Tela

```
max-w-[1140px] mx-auto px-6 py-7 pb-16
├── ① Header Row
├── ② Life Sync Score Hero (Jornada only) — 8 dimensões
├── ③ 4 KPI Cards
├── ④ Insight / Resumo Card
├── ⑤ Main Grid (1fr 340px)
│   ├── Coluna Esquerda
│   │   ├── Orçamentos do Mês
│   │   └── Gastos por Categoria (BarChart)
│   └── Coluna Direita
│       ├── Futuro em Destaque (ex-Metas)
│       └── Agenda da Semana
├── ⑤.5 V3 Widgets Row (3 colunas) — Fase 13
│   ├── 🏋️ Corpo (peso + atividades)
│   ├── 📈 Patrimônio (carteira + proventos)
│   └── ✈️ Experiências (próxima viagem)
└── ⑥ Bottom Grid (3 colunas)
    ├── Próximas Recorrentes
    ├── Projeção de Saldo (Sparkline)
    └── Foco: Resumo Financeiro / Jornada: Conquistas Recentes
```

---

## 2. Header Row

### Modo Foco
```tsx
<h1 font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]>Dashboard</h1>
<p text-[13px] text-[var(--sl-t3)]>Fevereiro 2026 · semana 3 de 4</p>
```

### Modo Jornada
```tsx
<h1 font-[Syne] font-extrabold text-2xl text-sl-grad>Boa tarde, {nome}! ✨</h1>
<p text-[13px] text-[var(--sl-t3)] italic>7 dias consecutivos de registros — continue assim.</p>
```

### Lado direito (ambos os modos)
- **Streak badge** (Jornada only): `🔥 {streak} dias` — bg `rgba(249,115,22,0.12)` border `rgba(249,115,22,0.25)` text `#f97316`
- **Period button**: ícone calendário + "{Mês Ano}" + chevron down — bg `var(--sl-s2)` border `var(--sl-border)`

---

## 3. Life Sync Score Hero (Jornada only)

- Container: `hidden [.jornada_&]:flex` items-center gap-28px
- bg `linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,85,255,0.10))`
- border `rgba(16,185,129,0.20)` rounded-[20px] p-[24px_28px] mb-5
- Animação: `sl-fade-up` + `pulse-border` (borda pulsa suavemente)

### Bloco Score Número
- Número: `font-[Syne] font-extrabold text-[80px] text-sl-grad leading-none`
- Label: `text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mt-0.5`

### Bloco Direito
- Título: `font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]`
- Frase: `text-[13px] text-[var(--sl-t3)] italic mb-3`
- Barra: h-1.5, `bg rgba(255,255,255,0.07)`, fill `linear-gradient(90deg, #10b981, #0055ff)`, `transition width 1.2s`
- 8 Dimensões (flex row gap-3 flex-wrap): Financeiro, Futuro, Tempo, Corpo, Mente, Patrimônio, Carreira, Experiências — label 10px uppercase + valor DM Mono 14px (verde se ≥70, amarelo se 50–69)

### Bloco Ações
- Botão "Ver análise completa": bg `linear-gradient(135deg, #10b981, #0055ff)` text-white px-4 py-2 rounded-[10px] text-[12px] font-semibold
- Delta text: `text-[11px] text-[#10b981]` ex: "↑ +3 vs. semana passada"

---

## 4. KPI Cards (4 cards em grid)

Grid: `grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2`

| Card | Ícone | Accent | Delta |
|------|-------|--------|-------|
| Receitas | 💰 bg green/12% | `#10b981` | ↑ +X% vs. mês ant. |
| Despesas | 📤 bg red/12% | `#f43f5e` | ↓ -X% vs. mês ant. |
| Saldo do Mês | 💚 bg green/12% | `#10b981` | ↑ +R$X vs. mês ant. |
| Metas Ativas | 🎯 bg yellow/12% | `#f59e0b` | ⚠ X em risco |

- Barra mini interna: apenas em Despesas (% gasto da renda) e Metas (% das metas no ritmo) — h-1 bg `var(--sl-s3)`
- Ícone: 32px rounded-[9px] com bg colorido
- Valor: `font-[DM_Mono] text-[26px] font-medium text-[var(--sl-t1)]`

---

## 5. Insight / Resumo Card

### Modo Foco — Compact Stats
```
bg: var(--sl-s1) border: var(--sl-border) rounded-[16px] p-5 mb-5
```
- Label: "Resumo do mês" + badge "AUTO"
- 4 stats em linha: Orçamentos estourados (vermelho), Metas no ritmo (verde), Streak de registro (azul), Poupança do mês (verde)
- Cada stat: label 10px uppercase + valor DM Mono 22px com cor

### Modo Jornada — Narrative + Ask AI
```
bg: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,85,255,0.06))
border: rgba(16,185,129,0.18)
```
- Label: "💡 Consultor Financeiro IA" + badge "ANÁLISE DE {MÊS}/{ANO}"
- Texto narrativo: `text-[13px] text-[var(--sl-t2)] leading-[1.75]`
  - `<strong>` = `var(--sl-t1)`, `.hi` = `#10b981`, `.warn` = `#f59e0b`, `.bad` = `#f43f5e`
- Input field + botão "Perguntar" (Jornada only): border-top `rgba(16,185,129,0.12)` mt-3 pt-3

---

## 6. Main Grid

Grid: `grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1`

### 6.1 Orçamentos do Mês (coluna esquerda)
- Card: SLCard com header "💼 Orçamentos do Mês" + link "Ver todos →"
- Lista de envelopes (máx. 5 por padrão):
  - Nome + emoji da categoria
  - Valores: "R$ X / R$ Y" (DM Mono)
  - % à direita colorida (cor da barra)
  - Barra h-1.5: ≤70% verde, 70–85% amarelo, >85% vermelho

### 6.2 Gastos por Categoria (coluna esquerda)
- BarChart Recharts: altura 160px, sem eixos visíveis
- Cada barra com % label acima (DM Mono 9px) + label categoria abaixo (9px)
- Linha baseline 1px `var(--sl-border)` após as barras
- Cores por categoria: Moradia `#10b981`, Alimentação `#f97316`, Transporte `#0055ff`, Lazer `#f59e0b`, Saúde `#06b6d4`, Outros `var(--sl-t2)`
- Link "Relatório →"

### 6.3 Futuro em Destaque (coluna direita)
- SLCard com "🎯 Futuro em Destaque" + "Ver todas →"
- Top 3 objetivos ativos, ordenadas por proximidade do prazo
- Por meta:
  - Emoji + nome (truncado) + sub "R$ X de R$ Y · Dez/26"
  - % (DM Mono 14px) com cor: <50% amarelo, ≥50% verde
  - Barra gradiente `#10b981 → #0055ff`
  - Meta tip (Jornada only): "⚠ X meses atrasada" — bg yellow/8%, border yellow/15%, text yellow

### 6.4 Agenda da Semana (coluna direita)
- SLCard com "📅 Agenda da Semana" + "Ver agenda →"
- Mini week strip: 7 dias (Seg–Dom) com:
  - Abrev. do dia (9px uppercase)
  - Número do dia (Syne 14px, hoje = círculo verde fundo #10b981)
  - Pontos coloridos embaixo (1 ponto por evento, máx 3)
  - Hoje: bg `rgba(16,185,129,0.15)` rounded-[10px]
- Lista de próximos 4 eventos:
  - Dot colorido + dia/hora + nome + tag colorida

---

## 7. Bottom Grid

Grid: `grid grid-cols-3 gap-4 max-lg:grid-cols-1`

### 7.1 Próximas Recorrentes
- SLCard "🔄 Próximas Recorrentes" + "Ver todas →"
- Top 4 recorrentes ordenadas por data de vencimento:
  - Ícone 30px rounded-[8px] bg `var(--sl-s3)` + emoji
  - Nome + data vencimento
  - Valor DM Mono (vermelho para despesas)
  - Status badge: "hoje" amarelo, "X dias" amarelo, "pago" verde, "futuro" cinza
- Separadores `border-b border-[var(--sl-border)]` (exceto último)

### 7.2 Projeção de Saldo
- SLCard "📈 Projeção de Saldo" + "Planejamento →"
- Subtitle: "Próximos 30 dias" 11px gray
- Sparkline SVG (ou Recharts Area tiny): h-[60px], stroke `#10b981` 2px, area fill gradient verde/transparente
- Pontos: início (verde), meio, fim (azul `#0055ff` maior)
- Linha inferior: "Hoje: R$ X" (esquerda) + "30 dias: R$ Y" verde (direita)
- Warning box (se houver recorrente vencendo): bg `var(--sl-s2)` rounded-[8px] text-[12px] gray

### 7.3 Foco: Resumo Financeiro / Jornada: Conquistas Recentes

**Foco** (padrão): `[.jornada_&]:hidden`
- "📋 Resumo Financeiro" sem link
- 4 linhas com border-bottom:
  - Taxa de poupança → DM Mono verde
  - Maior gasto → DM Mono
  - Orçamentos OK → DM Mono verde
  - Transações este mês → DM Mono

**Jornada** (oculto no Foco): `hidden [.jornada_&]:block`
- "🏆 Conquistas Recentes" + "Ver todas →"
- 5 badges em flex-wrap:
  - Emoji + nome 9px (cards 64px min-width)
  - Bloqueados: opacity-35 grayscale
- "Próxima conquista" box: bg green/7%, border green/12%, nome da meta + barra de progresso

---

## 8. Dados e Hooks

| Seção | Hook | Query |
|-------|------|-------|
| KPIs + AI Stats | `useTransactions({ month, year })` | soma receitas, despesas, contagem |
| Orçamentos | `useBudgets()` | orçamentos do mês atual + gasto real |
| Gastos por Categoria | `useTransactions` | group by category |
| Futuro | `useFuturo()` | top 3 objetivos ativos por prazo |
| Agenda | `useAgenda()` | eventos da semana atual |
| Recorrentes | `useRecorrentes()` | próximas 4 por vencimento |
| Projeção | `usePlanejamento()` | projeção 30 dias |
| Corpo (V3) | `useCorpo()` | último peso, atividades recentes |
| Patrimônio (V3) | `usePatrimonio()` | valor total carteira, proventos |
| Experiências (V3) | `useExperiencias()` | próxima viagem planejada |
| Conquistas (Jornada) | dados estáticos mock | badges desbloqueados |
| Life Sync Score | calculado client-side | média das 8 dimensões |

### Cálculo Life Sync Score (mock MVP)
```ts
// 8 dimensões — cada uma 0–100:
// Financeiro: % de orçamentos no verde
// Futuro: % de metas no ritmo / total
// Tempo: % eventos concluídos na semana
// Corpo: baseado em atividades + peso registrado
// Mente: streak de estudo + sessões Pomodoro
// Patrimônio: aportes no mês + diversificação
// Carreira: progresso nos roadmaps
// Experiências: viagens planejadas/realizadas
const dims = [fin, futuro, tempo, corpo, mente, patrimonio, carreira, experiencias]
const lifeScore = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length)
```

### Cálculo Streak (mock MVP)
- Valor fixo de mock: 7 dias (atualizar quando sistema de streak for implementado)

---

## 9. Responsividade

| Breakpoint | Mudança |
|-----------|---------|
| `max-lg` (< 1024px) | Main grid: 1 coluna; Bottom grid: 1 coluna |
| `max-sm` (< 640px) | KPI grid: 2 colunas |
| `max-sm` | Week strip: compacto |

---

## 10. Animações

- `sl-fade-up` em todos os cards principais
- `sl-delay-1` a `sl-delay-5` em cascata nos cards
- Score bar: `transition width 1.2s cubic-bezier(0.4,0,0.2,1)` acionado após montagem
- KPI bars: `transition width 1s` com delay 200ms
- Hover cards: `translateY(-1px)` (apenas KPI cards)

---

## 11. Regras de Negócio

- Período padrão: mês atual (baseado em `new Date()`)
- Period button: apenas visual no MVP (não filtra ainda)
- Orçamentos: mostrar até 5, se houver mais adicionar "Ver todos"
- Metas: máx 3 em destaque (ordenadas por prazo mais próximo)
- Recorrentes próximas: ordenar por dias para vencimento (hoje primeiro, depois crescente)
- Projeção: saldo atual − total recorrentes próximos 30 dias (simplificado)
- AI insight (Jornada): texto fixo gerado com os dados reais inseridos inline
- Life Sync Score: calculado dinamicamente com dados reais quando disponíveis, fallback mock
- Conquistas no Jornada bottom: mock data (sistema completo em 5.2)

---

## 12. Checklist de Implementação

- [ ] `'use client'` (requer hooks e estado)
- [ ] Greeting calcula período do dia client-side (evitar hydration error)
- [ ] Score bar animado via `useEffect` após mount
- [ ] Sparkline via Recharts `<AreaChart>` (consistência com resto do projeto)
- [ ] BarChart categorias via Recharts `<BarChart>` customizado (sem eixos)
- [ ] Todos os valores monetários em `font-[DM_Mono]`
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Nenhum `Math.random()` fora de useEffect
