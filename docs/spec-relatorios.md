# Spec — Tela: Relatórios Históricos (`/financas/relatorios`)

> Esta spec é autocontida. Um desenvolvedor pode implementar a tela inteiramente lendo apenas este documento.

---

## 1. Visão Geral

A tela de Relatórios Históricos é o centro de análise do SyncLife. Diferente do Dashboard (que mostra apenas o mês atual), esta tela permite selecionar **períodos históricos fechados**, comparar com o período anterior e identificar tendências de gastos por categoria. Inclui exportação CSV (FREE) e PDF (PRO), narrativa de IA em Jornada, e análise de taxa de poupança.

**Rota:** `/financas/relatorios`
**Arquivo:** `web/src/app/(app)/financas/relatorios/page.tsx`
**Componentes:** `'use client'` — dados filtrados por período selecionado.
**Plano:** FREE tem 3 meses de histórico; PRO tem histórico ilimitado, análise narrativa e exportação PDF.

---

## 2. Referência Visual

Protótipo: `prototipos/proto-relatorios-revisado.html`

**Elementos chave do protótipo:**
- Page header: eyebrow, título, sub com resumo do período, botões "Exportar CSV" e "PDF (PRO)"
- Upgrade banner (FREE): banner amarelo/laranja com CTA "Upgrade PRO"
- Period selector: chips de período + 2 month pickers (range início→fim) + "Gerar relatório"
- Narrative band (Jornada): ícone 🤖 + título + badge "IA Financeira" + texto narrativo + tags + btn Regenerar
- KPI comparativo: 4 cards com valor do período, período anterior, delta % e seta colorida
- `charts-main` (2 colunas): multi-line chart de tendências + cat-comp-list (barras duplas)
- `charts-bottom` (2 colunas): bar chart receitas/despesas por mês + saving-rate visualization
- Top gastos: lista de top N despesas individuais
- Tabela de transações completa com filtro/busca
- Export panel: lista de opções de exportação

---

## 3. Layout Completo

### Anatomia da Página

```
┌─────────────────────────────────────────────────────────┐
│  PAGE HEADER: eyebrow | título | sub | CSV | PDF (PRO)  │
├─────────────────────────────────────────────────────────┤
│  UPGRADE BANNER (FREE only)                             │
├─────────────────────────────────────────────────────────┤
│  PERIOD SELECTOR                                        │
│  [Mês atual][Último trimestre⭐][Último semestre⭐]      │
│  [Últimos 12m⭐][Ano atual] | [Início →][Fim] [Gerar]   │
├─────────────────────────────────────────────────────────┤
│  NARRATIVE BAND (Jornada only)                          │
├─────────────────────────────────────────────────────────┤
│  KPI COMPARATIVO STRIP: 4 cards com delta vs anterior   │
├─────────────────────────────────────────────────────────┤
│  CHARTS MAIN (2 col)                                    │
│  [Multi-line: tendência por categoria] │ [Cat comparativo]│
├─────────────────────────────────────────────────────────┤
│  CHARTS BOTTOM (2 col)                                  │
│  [Bar chart: receitas/despesas/mês] │ [Taxa de poupança] │
├─────────────────────────────────────────────────────────┤
│  TOP GASTOS: top 5 maiores despesas do período          │
├─────────────────────────────────────────────────────────┤
│  TABELA COMPLETA de transações (filtro + paginação)     │
├─────────────────────────────────────────────────────────┤
│  EXPORT PANEL                                           │
└─────────────────────────────────────────────────────────┘
```

### Page Header

```tsx
<div className="flex items-start justify-between mb-4 gap-4">
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-0.5">
      <span className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
      Módulo Finanças · Análise
    </div>
    <h1 className={cn(
      'font-[Syne] font-extrabold text-[22px] tracking-tight',
      isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
    )}>
      Relatórios Históricos
    </h1>
    <p className="text-[11px] text-[var(--sl-t3)] mt-0.5" id="pg-sub-label">
      {periodLabel} · {monthCount} meses · {txCount} transações
    </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <button onClick={() => handleExport('csv')}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t1)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)] transition-all">
      <Download size={13} />
      Exportar CSV
    </button>
    <button onClick={() => isPro ? handleExport('pdf') : showUpgradeModal()}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[rgba(16,185,129,0.25)] bg-gradient-to-br from-[rgba(16,185,129,0.1)] to-[rgba(0,85,255,0.08)] text-[#10b981] text-[12px] font-semibold cursor-pointer transition-all">
      <FileText size={13} />
      PDF{' '}
      {!isPro && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(0,85,255,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.25)] ml-0.5">
          <Lock size={9} />
          PRO
        </span>
      )}
    </button>
  </div>
</div>
```

### Upgrade Banner (FREE)

```tsx
{!isPro && (
  <div className="flex items-center gap-3 bg-gradient-to-r from-[rgba(245,158,11,0.08)] to-[rgba(249,115,22,0.06)] border border-[rgba(245,158,11,0.2)] rounded-[10px] px-3.5 py-2.5 mb-3.5">
    <span className="text-[16px] shrink-0">🔒</span>
    <p className="flex-1 text-[12px] text-[var(--sl-t2)] leading-relaxed">
      Você está no plano <strong className="text-[var(--sl-t1)]">Gratuito</strong>. Acesse qualquer período,
      exportação PDF/Excel e análise narrativa de IA com o <strong className="text-[var(--sl-t1)]">Plano PRO</strong>.
    </p>
    <button className="px-3.5 py-1.5 rounded-[8px] border-none bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-white text-[11px] font-bold cursor-pointer shrink-0 whitespace-nowrap">
      Upgrade PRO — R$29/mês
    </button>
  </div>
)}
```

### Period Selector

```tsx
<div className="flex items-center gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-3.5 py-2.5 mb-3.5 flex-wrap">
  <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] whitespace-nowrap mr-0.5">
    Período
  </span>

  {PERIOD_OPTIONS.map(opt => (
    <button key={opt.key}
      onClick={() => isPro || !opt.proOnly ? setPeriod(opt.key) : showUpgradeModal()}
      className={cn(
        'flex items-center gap-1.5 px-3 py-[5px] rounded-[8px] border text-[12px] cursor-pointer transition-all whitespace-nowrap',
        period === opt.key
          ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)] font-semibold'
          : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
      )}>
      {opt.label}
      {opt.proOnly && !isPro && (
        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(0,85,255,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.25)]">
          <Lock size={8} /> PRO
        </span>
      )}
    </button>
  ))}

  {/* Divisor */}
  <div className="w-px h-[18px] bg-[var(--sl-border)] flex-shrink-0 mx-0.5" />

  {/* Month picker: início */}
  <MonthPicker
    value={customStart}
    onChange={setCustomStart}
    maxDate={customEnd}
    disabled={period !== 'custom'}
  />
  <span className="text-[12px] text-[var(--sl-t3)] px-0.5">→</span>
  {/* Month picker: fim */}
  <MonthPicker
    value={customEnd}
    onChange={setCustomEnd}
    minDate={customStart}
    maxDate={new Date()}
    disabled={period !== 'custom'}
  />

  <span className="flex-1" />

  <button onClick={handleGenerate}
    className="flex items-center gap-1.5 px-4 py-1.5 rounded-[9px] border-none bg-[#10b981] text-white text-[12px] font-bold cursor-pointer shrink-0">
    <BarChart2 size={13} />
    Gerar relatório
  </button>
</div>
```

**Constantes de períodos:**

```ts
const PERIOD_OPTIONS = [
  { key: 'mes',    label: 'Mês atual',           proOnly: false },
  { key: 'tri',    label: 'Último trimestre',     proOnly: false },  // FREE: últimos 3m são permitidos
  { key: 'sem',    label: 'Último semestre',      proOnly: true  },
  { key: '12m',    label: 'Últimos 12 meses',     proOnly: true  },
  { key: 'ano',    label: 'Ano atual',            proOnly: false },
  { key: 'custom', label: 'Personalizado',        proOnly: true  },
] as const

type PeriodKey = 'mes' | 'tri' | 'sem' | '12m' | 'ano' | 'custom'
```

**FREE: regra de 3 meses**
FREE pode acessar até os últimos 3 meses de dados. "Mês atual", "Último trimestre" e "Ano atual" funcionam no FREE desde que os dados estejam dentro do limite de 3 meses. Para períodos que excedam 3 meses, exibir overlay de upgrade sobre os dados truncados.

---

## 4. Narrative Band (Jornada)

Visível apenas no modo Jornada (`body.jornada`). Gerado client-side — sem chamada de API real no MVP.

```tsx
<div className={cn(
  'hidden [.jornada_&]:flex items-start gap-3.5 bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] border border-[rgba(16,185,129,0.18)] rounded-2xl px-5 py-4 mb-3'
)}>
  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[rgba(16,185,129,0.2)] to-[rgba(0,85,255,0.2)] flex items-center justify-center text-[18px] shrink-0 mt-0.5">
    🤖
  </div>
  <div className="flex-1">
    <div className="flex items-center gap-2 flex-wrap mb-1.5">
      <h3 className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
        Análise do Período: {periodLabel}
      </h3>
      <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-[rgba(16,185,129,0.15)] text-[#10b981] uppercase tracking-[0.05em]">
        IA Financeira
      </span>
      <button className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[var(--sl-border)] bg-transparent text-[var(--sl-t3)] text-[11px] cursor-pointer hover:bg-[var(--sl-s2)] transition-all">
        <RefreshCw size={12} />
        Regenerar <span className="text-[var(--sl-t3)] text-[10px]">(2/mês restantes)</span>
      </button>
    </div>
    <p className="text-[13px] text-[var(--sl-t2)] leading-[1.65]" dangerouslySetInnerHTML={{ __html: narrativeText }} />
    <div className="flex gap-1.5 mt-2.5 flex-wrap">
      {narrativeTags.map(tag => (
        <span key={tag.text} className={cn('px-2.5 py-0.5 rounded-[7px] text-[11px] font-medium',
          tag.type === 'pos' ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981]' :
          tag.type === 'neg' ? 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e]' :
          'bg-[var(--sl-s2)] text-[var(--sl-t2)]'
        )}>
          {tag.text}
        </span>
      ))}
    </div>
  </div>
</div>
```

**Template de narrativa (gerado client-side):**

```ts
function generateNarrative(stats: PeriodStats): { text: string; tags: NarrativeTag[] } {
  const {
    totalRecipes, totalExpenses, totalBalance,
    avgSavingsRate, prevTotalExpenses, prevAvgSavingsRate,
    topGrowingCategory, topGrowthPct,
    monthWithBestBalance, monthCount,
  } = stats

  const expenseDelta = prevTotalExpenses > 0
    ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses * 100).toFixed(1)
    : null

  const text = `No período <em>${periodLabel}</em> você acumulou `
    + `<em>${fmtR(totalBalance)} de saldo ${totalBalance >= 0 ? 'positivo' : 'negativo'}</em>, `
    + `uma taxa média de poupança de <em>${avgSavingsRate.toFixed(1)}%</em>. `
    + (topGrowingCategory ? `O gasto com <em>${topGrowingCategory} cresceu ${topGrowthPct}% mês a mês</em> ao longo do período. ` : '')
    + (expenseDelta && parseFloat(expenseDelta) > 5 ? `Despesas cresceram ${expenseDelta}% em relação ao período anterior. ` : '')
    + `${monthWithBestBalance} foi seu melhor mês em saldo.`

  const tags: NarrativeTag[] = [
    totalBalance >= 0
      ? { text: '✓ Saldo positivo no período', type: 'pos' }
      : { text: '⚠ Saldo negativo no período', type: 'neg' },
    avgSavingsRate >= 20
      ? { text: '✓ Meta de poupança batida', type: 'pos' }
      : { text: `⚠ Poupança ${avgSavingsRate.toFixed(1)}% (abaixo de 20%)`, type: 'neg' },
    ...(topGrowingCategory && topGrowthPct > 15
      ? [{ text: `⚠ ${topGrowingCategory} em alta`, type: 'neg' as const }]
      : []),
    { text: `→ Melhor mês: ${monthWithBestBalance}`, type: 'neu' },
  ]

  return { text, tags }
}
```

---

## 5. KPI Comparativo Strip

```tsx
<div className="grid grid-cols-4 gap-2.5 mb-3 max-lg:grid-cols-2">
  {[
    {
      icon: '💰', label: 'Receitas Totais', period: currentPeriodLabel,
      value: totalRecipes, color: '#10b981', accentColor: '#10b981',
      delta: recipeDelta, prevValue: prevRecipes,
    },
    {
      icon: '💸', label: 'Despesas Totais', period: currentPeriodLabel,
      value: totalExpenses, color: '#f43f5e', accentColor: '#f43f5e',
      delta: expenseDelta, prevValue: prevExpenses,
      warn: expenseDelta > 5,
    },
    {
      icon: '📈', label: 'Saldo Acumulado', period: currentPeriodLabel,
      value: totalBalance, color: undefined,
      delta: balanceDelta, prevValue: prevBalance,
    },
    {
      icon: '💹', label: 'Taxa de Poupança', period: 'Média mensal',
      value: `${avgSavingsRate.toFixed(1)}%`, isPercent: true,
      color: '#f59e0b', accentColor: '#f59e0b',
      delta: savingsDelta, prevValue: `${prevAvgSavingsRate.toFixed(1)}%`,
    },
  ].map((kpi, i) => (
    <div key={i}
      className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up"
      style={{ '--kc': kpi.accentColor } as any}>
      {/* Barra de acento */}
      <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b"
        style={{ background: kpi.accentColor ?? 'var(--sl-border)' }} />

      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5"
        style={{ background: kpi.accentColor ? `${kpi.accentColor}20` : 'var(--sl-s3)' }}>
        {kpi.icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">{kpi.label}</p>
      <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">{kpi.period}</p>
      <p className="font-[DM_Mono] text-[20px] font-medium text-[var(--sl-t1)] leading-none mb-1.5"
        style={{ color: kpi.color }}>
        {kpi.isPercent ? kpi.value : fmtR(kpi.value as number)}
      </p>
      {/* Delta */}
      <div className="flex items-center gap-1 text-[11px]">
        {kpi.delta !== null && (
          <span className={cn(
            kpi.delta > 0 && kpi.label.includes('Despesa') ? 'text-[#f43f5e]' :
            kpi.delta > 0 ? 'text-[#10b981]' :
            'text-[#f43f5e]'
          )}>
            {kpi.delta > 0 ? '↑' : '↓'} {Math.abs(kpi.delta).toFixed(1)}%{kpi.warn ? ' ⚠' : ''}
          </span>
        )}
      </div>
      <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
        vs período anterior ({kpi.isPercent ? kpi.prevValue : fmtR(kpi.prevValue as number)})
      </p>
    </div>
  ))}
</div>
```

**Cálculo de delta:**

```ts
function calcDeltaPct(current: number, prev: number): number | null {
  if (prev === 0) return null
  return ((current - prev) / Math.abs(prev)) * 100
}

// Delta de Receitas: positivo = crescimento (bom → verde)
// Delta de Despesas: positivo = crescimento (ruim → vermelho)
// Delta de Saldo: positivo = crescimento (bom → verde)
// Delta de Taxa de Poupança: positivo = crescimento (bom → verde)
```

---

## 6. Charts

### 6.1 Multi-line: Tendência de Gastos por Categoria

Gráfico SVG com linhas por categoria, pontos de dados por mês.

```tsx
// Usar Recharts: LineChart
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Data shape:
const lineData = months.map(m => ({
  month: m.label,
  ...categoryMonthlyTotals[m.key],  // { 'Alimentação': 1380, 'Moradia': 1400, ... }
}))

<SLCard className="flex flex-col">
  <div className="flex items-center justify-between mb-3 shrink-0">
    <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] flex items-center gap-1.5">
      <TrendingUp size={15} />
      Tendência de Gastos por Categoria
    </p>
    <span className="text-[11px] text-[var(--sl-t3)]">mês a mês no período</span>
  </div>
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={lineData}>
      <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
      <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
        tickFormatter={v => `${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
      <Tooltip
        contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
        formatter={(val: number, name: string) => [fmtR(val), name]}
      />
      {/* Linha de meta de orçamento (tracejada vermelha) */}
      <ReferenceLine y={budgetGoal} stroke="rgba(244,63,94,0.25)" strokeDasharray="4 3" />
      {topCategories.map((cat, i) => (
        <Line key={cat.name} type="monotone" dataKey={cat.name}
          stroke={cat.color} strokeWidth={2} dot={{ r: 3.5, fill: cat.color }}
          activeDot={{ r: 5 }}
          strokeDasharray={cat.isStable ? '5 3' : undefined}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
  <div className="flex gap-3.5 flex-wrap mt-2 shrink-0">
    {topCategories.map(cat => (
      <span key={cat.name} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
        <span className="w-3 h-[3px] rounded-[2px] inline-block" style={{ background: cat.color }} />
        {cat.name}
      </span>
    ))}
    <span className="ml-auto text-[10px] text-[rgba(244,63,94,0.6)]">- - - meta orçamento</span>
  </div>
</SLCard>
```

### 6.2 Cat-comp: Categorias Período vs Anterior

Lista de categorias com 2 barras sobrepostas (atual = barra cheia, anterior = barra semi-transparente) + delta %.

```tsx
<SLCard>
  <div className="flex items-center justify-between mb-3">
    <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] flex items-center gap-1.5">
      <BarChart2 size={15} />
      Categorias: Período vs Anterior
    </p>
    <div className="flex items-center gap-2 text-[10px] text-[var(--sl-t3)]">
      <span className="flex items-center gap-1">
        <span className="w-2 h-[3px] bg-[#10b981] rounded inline-block" />Atual
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-[3px] bg-[var(--sl-s3)] rounded inline-block" />Anterior
      </span>
    </div>
  </div>
  <div className="flex flex-col gap-0.5">
    {catCompData.map(cat => (
      <div key={cat.name}
        className="flex items-center gap-2 px-2.5 py-2 rounded-[9px] cursor-pointer hover:bg-[var(--sl-s2)] transition-colors relative">
        <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ background: cat.color }} />
        <span className="w-[90px] text-[12px] text-[var(--sl-t2)] truncate shrink-0">{cat.name}</span>
        <div className="flex-1 flex flex-col gap-[3px]">
          {/* Barra atual */}
          <div className="h-[5px] rounded-[3px] transition-[width] duration-700"
            style={{ width: `${(cat.currentTotal / maxCatValue) * 100}%`, background: cat.color }} />
          {/* Barra anterior */}
          <div className="h-[5px] rounded-[3px] opacity-40 transition-[width] duration-700"
            style={{ width: `${(cat.prevTotal / maxCatValue) * 100}%`, background: cat.color }} />
        </div>
        <div className="flex flex-col items-end shrink-0 min-w-[68px]">
          <span className="font-[DM_Mono] text-[12px] font-medium text-[var(--sl-t1)]">
            {fmtR(cat.currentTotal)}
          </span>
          {cat.delta !== null && (
            <span className={cn('text-[10px]',
              cat.delta > 10 ? 'text-[#f43f5e]' :
              cat.delta < -5 ? 'text-[#10b981]' :
              'text-[var(--sl-t3)]'
            )}>
              {cat.delta > 0 ? '↑' : '↓'} {Math.abs(cat.delta).toFixed(0)}%
              {cat.delta > 10 ? ' ⚠' : cat.delta < -5 ? ' ✓' : ''}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
</SLCard>
```

### 6.3 Bar Chart: Receitas/Despesas por Mês

```tsx
// Recharts BarChart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const barData = months.map(m => ({
  month: m.label,
  receitas: monthlyRecipes[m.key] ?? 0,
  despesas: monthlyExpenses[m.key] ?? 0,
}))

<SLCard>
  <div className="flex items-center justify-between mb-3">
    <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
      Receitas vs Despesas por Mês
    </p>
  </div>
  <ResponsiveContainer width="100%" height={150}>
    <BarChart data={barData} barGap={2}>
      <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip
        contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
        formatter={(val: number, name: string) => [fmtR(val), name === 'receitas' ? 'Receitas' : 'Despesas']}
      />
      <Bar dataKey="receitas" fill="#10b981" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
      <Bar dataKey="despesas" fill="#f43f5e" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
  <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--sl-t3)]">
    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] opacity-70" /> Receitas</span>
    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e] opacity-60" /> Despesas</span>
  </div>
</SLCard>
```

### 6.4 Saving Rate Visualization

Barras horizontais por mês mostrando a taxa de poupança, com linha de meta vertical.

```tsx
<SLCard>
  <div className="flex items-center justify-between mb-3">
    <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
      Taxa de Poupança Mensal
    </p>
    <span className="text-[11px] text-[var(--sl-t3)]">
      Meta: {profile.savings_goal_pct ?? 20}%
    </span>
  </div>

  <div className="flex flex-col gap-1.5">
    {savingsRateData.map(m => (
      <div key={m.month} className="flex items-center gap-2">
        <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-7 shrink-0">{m.monthShort}</span>
        <div className="flex-1 relative">
          {/* Track */}
          <div className="w-full h-[10px] bg-[var(--sl-s2)] rounded-full overflow-hidden relative">
            <div className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${Math.min((m.rate / maxSavingsRate) * 100, 100)}%`,
                background: m.rate >= goalRate ? '#10b981' : m.rate >= goalRate * 0.75 ? '#f59e0b' : '#f43f5e',
              }} />
          </div>
          {/* Linha de meta */}
          <div className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-[rgba(244,63,94,0.7)] rounded-[1px] z-[2] pointer-events-none"
            style={{ left: `${(goalRate / maxSavingsRate) * 100}%` }} />
        </div>
        <span className={cn('font-[DM_Mono] text-[11px] min-w-[36px] text-right shrink-0',
          m.rate >= goalRate ? 'text-[#10b981]' : 'text-[#f43f5e]'
        )}>
          {m.rate.toFixed(1)}%
        </span>
      </div>
    ))}
  </div>

  {/* Eixo X */}
  <div className="flex items-center pl-9 pr-11 mt-0.5">
    <span className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)]">0%</span>
    <span className="ml-auto font-[DM_Mono] text-[9px] text-[rgba(244,63,94,0.5)]">
      Meta {profile.savings_goal_pct ?? 20}%
    </span>
  </div>

  {/* Sumário */}
  <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[var(--sl-border)]">
    {[
      { label: 'Média do período', value: `${avgSavingsRate.toFixed(1)}%`, color: avgSavingsRate >= goalRate ? '#10b981' : '#f43f5e' },
      null,
      { label: 'Melhor mês', value: `${bestMonth.monthShort} (${bestMonth.rate.toFixed(0)}%)`, color: '#10b981' },
      null,
      { label: 'Pior mês', value: `${worstMonth.monthShort} (${worstMonth.rate.toFixed(0)}%)`, color: '#f43f5e' },
    ].map((item, i) =>
      item === null
        ? <div key={i} className="w-px h-7 bg-[var(--sl-border)] shrink-0" />
        : (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <span className="font-[DM_Mono] text-[15px] font-medium" style={{ color: item.color }}>
              {item.value}
            </span>
            <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">{item.label}</span>
          </div>
        )
    )}
  </div>
</SLCard>
```

---

## 7. Top Gastos

```tsx
<SLCard className="mb-3">
  <div className="flex items-center justify-between mb-3">
    <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
      🏆 Top Despesas do Período
    </p>
    <span className="text-[11px] text-[var(--sl-t3)]">maiores gastos individuais</span>
  </div>
  <div className="flex flex-col gap-1">
    {topExpenses.map((txn, i) => (
      <div key={txn.id}
        className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] cursor-pointer hover:bg-[var(--sl-s2)] transition-colors">
        <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] w-3.5 text-center shrink-0">
          {i + 1}
        </span>
        <span className="text-[14px] shrink-0">{txn.categories?.icon ?? '📤'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">{txn.description}</p>
          <p className="text-[10px] text-[var(--sl-t3)]">{txn.categories?.name ?? '—'}</p>
        </div>
        <span className="font-[DM_Mono] text-[13px] text-[#f43f5e] shrink-0">{fmtR(txn.amount)}</span>
        <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] shrink-0">
          {formatDate(txn.date)}
        </span>
      </div>
    ))}
  </div>
</SLCard>
```

---

## 8. Tabela Completa de Transações

```tsx
<SLCard className="mb-3">
  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
    {/* Search */}
    <div className="relative flex-1 min-w-[120px]">
      <Search size={13} className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--sl-t3)] pointer-events-none" />
      <input
        value={tableSearch}
        onChange={e => setTableSearch(e.target.value)}
        placeholder="Buscar transação..."
        className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] py-1.5 pl-8 pr-3 text-[var(--sl-t1)] text-[12px] outline-none placeholder:text-[var(--sl-t3)] focus:border-[rgba(16,185,129,0.35)]"
      />
    </div>
    {/* Filtros por tipo */}
    {['Todos', 'Receitas', 'Despesas'].map(f => (
      <button key={f}
        onClick={() => setTableFilter(f.toLowerCase())}
        className={cn(
          'px-2.5 py-[5px] rounded-[8px] border text-[11px] cursor-pointer transition-all',
          tableFilter === f.toLowerCase()
            ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
            : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
        )}>
        {f}
      </button>
    ))}
  </div>

  <table className="w-full border-collapse">
    <thead>
      <tr>
        {['Data', 'Descrição', 'Categoria', 'Método', 'Valor'].map(h => (
          <th key={h} className="text-left text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] px-2.5 py-1.5 border-b border-[var(--sl-border)] font-semibold last:text-right">
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {paginatedTransactions.map(txn => (
        <tr key={txn.id} className="hover:[&>td]:bg-[var(--sl-s2)] cursor-pointer">
          <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">
            {formatDate(txn.date)}
          </td>
          <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[var(--sl-t1)] font-medium max-w-[160px] truncate">
            {txn.description}
          </td>
          <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium"
              style={{ background: `${txn.categories?.color ?? '#6b7280'}20`, color: txn.categories?.color ?? '#6b7280' }}>
              {txn.categories?.icon} {txn.categories?.name ?? '—'}
            </span>
          </td>
          <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[11px] text-[var(--sl-t3)]">
            {txn.payment_method ? PAYMENT_METHOD_LABELS[txn.payment_method] : '—'}
          </td>
          <td className={cn(
            'px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[12px] font-medium text-right',
            txn.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {txn.type === 'income' ? '+' : '−'}{fmtR(txn.amount)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Paginação */}
  <div className="flex items-center justify-between mt-3">
    <span className="text-[11px] text-[var(--sl-t3)]">
      Exibindo {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTxs.length)} de {filteredTxs.length}
    </span>
    <div className="flex gap-1">
      {Array.from({ length: Math.ceil(filteredTxs.length / PAGE_SIZE) }, (_, i) => i + 1).slice(
        Math.max(0, page - 3), Math.min(Math.ceil(filteredTxs.length / PAGE_SIZE), page + 2)
      ).map(p => (
        <button key={p} onClick={() => setPage(p)}
          className={cn('px-2.5 py-1 rounded-[7px] border text-[11px] cursor-pointer transition-all',
            p === page ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                       : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
          )}>
          {p}
        </button>
      ))}
    </div>
  </div>
</SLCard>
```

---

## 9. Export Panel

```tsx
<SLCard>
  <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] mb-3">Exportar Dados</p>
  <div className="flex flex-col divide-y divide-[var(--sl-border)]">
    {[
      {
        icon: '📊', bg: 'rgba(16,185,129,0.1)',
        label: 'CSV — Transações',
        desc: 'Todas as transações do período em formato planilha.',
        action: () => handleExport('csv'),
        disabled: false,
      },
      {
        icon: '📄', bg: 'rgba(0,85,255,0.1)',
        label: <>PDF — Relatório Completo <ProBadge /></>,
        desc: 'Relatório formatado com gráficos, sumários e análise.',
        action: () => isPro ? handleExport('pdf') : showUpgradeModal(),
        disabled: !isPro,
      },
      {
        icon: '📋', bg: 'rgba(245,158,11,0.1)',
        label: <>Excel (.xlsx) <ProBadge /></>,
        desc: 'Exportação com múltiplas abas: transações, categorias, resumo.',
        action: () => isPro ? handleExport('xlsx') : showUpgradeModal(),
        disabled: !isPro,
      },
    ].map((item, i) => (
      <div key={i}
        className={cn('flex items-center gap-3 py-3 cursor-pointer transition-opacity', item.disabled && 'opacity-40 cursor-not-allowed')}
        onClick={!item.disabled ? item.action : undefined}>
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
          style={{ background: item.bg }}>
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-px flex items-center gap-1 flex-wrap">
            {item.label}
          </p>
          <p className="text-[10px] text-[var(--sl-t3)] leading-snug">{item.desc}</p>
        </div>
        <button
          className={cn('px-2.5 py-1 rounded-[7px] border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] text-[11px] cursor-pointer transition-all shrink-0 whitespace-nowrap hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]', item.disabled && 'pointer-events-none')}
          onClick={e => { e.stopPropagation(); if (!item.disabled) item.action() }}>
          {item.disabled ? 'Desabilitado' : 'Baixar'}
        </button>
      </div>
    ))}
  </div>
</SLCard>
```

### Implementação do Export CSV

```ts
function handleExportCSV(transactions: Transaction[]) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Método de Pagamento', 'Notas']
  const rows = transactions.map(t => [
    t.date,
    `"${t.description}"`,
    `"${t.categories?.name ?? ''}"`,
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.amount.toFixed(2).replace('.', ','),
    t.payment_method ?? '',
    `"${t.notes ?? ''}"`,
  ])

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const bom = '\uFEFF'  // BOM para UTF-8 no Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `synclife-relatorio-${periodKey}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

---

## 10. Interfaces TypeScript

```ts
type PeriodKey = 'mes' | 'tri' | 'sem' | '12m' | 'ano' | 'custom'

interface PeriodRange {
  start: string   // 'YYYY-MM-DD'
  end: string     // 'YYYY-MM-DD'
}

interface PeriodStats {
  totalRecipes: number
  totalExpenses: number
  totalBalance: number
  avgSavingsRate: number
  prevTotalRecipes: number
  prevTotalExpenses: number
  prevTotalBalance: number
  prevAvgSavingsRate: number
  txCount: number
  monthCount: number
  topGrowingCategory: string | null
  topGrowthPct: number
  monthWithBestBalance: string
}

interface CategoryComparison {
  name: string
  color: string
  currentTotal: number
  prevTotal: number
  delta: number | null
}

interface SavingsRatePoint {
  month: string
  monthShort: string
  rate: number
  recipes: number
  expenses: number
}

interface NarrativeTag {
  text: string
  type: 'pos' | 'neg' | 'neu'
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix:      'Pix',
  credit:   'Crédito',
  debit:    'Débito',
  cash:     'Dinheiro',
  transfer: 'TED/DOC',
  boleto:   'Boleto',
}

const PAGE_SIZE = 30
```

---

## 11. Hook `useRelatorios`

```ts
// src/hooks/use-relatorios.ts
'use client'

export function useRelatorios() {
  const supabase = createClient()
  const [period, setPeriod] = useState<PeriodKey>('mes')
  const [customStart, setCustomStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0]
  )
  const [customEnd, setCustomEnd] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [transactions, setTransactions] = useState<any[]>([])
  const [prevTransactions, setPrevTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function getRange(p: PeriodKey): PeriodRange {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const y = now.getFullYear()
    const m = now.getMonth()

    switch (p) {
      case 'mes':
        return { start: new Date(y, m, 1).toISOString().split('T')[0], end: today }
      case 'tri':
        return { start: new Date(y, m - 2, 1).toISOString().split('T')[0], end: today }
      case 'sem':
        return { start: new Date(y, m - 5, 1).toISOString().split('T')[0], end: today }
      case '12m':
        return { start: new Date(y - 1, m + 1, 1).toISOString().split('T')[0], end: today }
      case 'ano':
        return { start: new Date(y, 0, 1).toISOString().split('T')[0], end: today }
      case 'custom':
        return { start: customStart, end: customEnd }
    }
  }

  function getPrevRange(range: PeriodRange): PeriodRange {
    const startMs = new Date(range.start).getTime()
    const endMs = new Date(range.end).getTime()
    const duration = endMs - startMs
    return {
      start: new Date(startMs - duration).toISOString().split('T')[0],
      end: new Date(startMs - 1).toISOString().split('T')[0],
    }
  }

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const range = getRange(period)
    const prevRange = getPrevRange(range)

    const [txRes, prevTxRes, catRes, profileRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', range.start)
        .lte('date', range.end)
        .eq('is_future', false)
        .order('date', { ascending: false }),
      supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', prevRange.start)
        .lte('date', prevRange.end)
        .eq('is_future', false),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('profiles')
        .select('savings_goal_pct, monthly_income, current_balance')
        .eq('id', user.id)
        .single(),
    ])

    if (txRes.error) setError(txRes.error.message)
    else setTransactions((txRes.data as any) ?? [])
    setPrevTransactions((prevTxRes.data as any) ?? [])
    if (catRes.data) setCategories((catRes.data as any) ?? [])
    if (profileRes.data) setProfile(profileRes.data)
    setLoading(false)
  }, [period, customStart, customEnd])

  // Gerar ao montar e quando o período mudar
  useEffect(() => { handleGenerate() }, [])

  // Cálculos derivados
  const periodStats = useMemo(() => calcPeriodStats(transactions, prevTransactions, profile), [transactions, prevTransactions, profile])
  const catCompData = useMemo(() => calcCatComparison(transactions, prevTransactions), [transactions, prevTransactions])
  const savingsRateData = useMemo(() => calcSavingsRate(transactions, profile), [transactions, profile])
  const topExpenses = useMemo(() => [...transactions].filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5), [transactions])

  return {
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    transactions,
    prevTransactions,
    categories,
    profile,
    loading,
    error,
    periodStats,
    catCompData,
    savingsRateData,
    topExpenses,
    handleGenerate,
    handleExportCSV: () => handleExportCSV(transactions),
    getRange,
  }
}
```

---

## 12. Queries Supabase

### Transações do período atual

```sql
SELECT
  t.*,
  c.id AS "categories.id", c.name AS "categories.name",
  c.icon AS "categories.icon", c.color AS "categories.color"
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.date >= $1   -- rangeStart
  AND t.date <= $2   -- rangeEnd
  AND t.is_future = false
ORDER BY t.date DESC;
```

### Transações do período anterior (para comparativo)

```sql
SELECT
  t.*,
  c.id AS "categories.id", c.name AS "categories.name",
  c.icon AS "categories.icon", c.color AS "categories.color"
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.date >= $1   -- prevRangeStart
  AND t.date <= $2   -- prevRangeEnd
  AND t.is_future = false
ORDER BY t.date DESC;
```

---

## 13. Regras de Negócio

### Limite FREE (3 meses)

```ts
// FREE: dados disponíveis apenas dos últimos 3 meses
const FREE_HISTORY_MONTHS = 3

// Ao gerar relatório, verificar se range excede o limite:
function isWithinFreeLimit(range: PeriodRange, isPro: boolean): boolean {
  if (isPro) return true
  const startDate = new Date(range.start)
  const freeLimit = new Date()
  freeLimit.setMonth(freeLimit.getMonth() - FREE_HISTORY_MONTHS)
  return startDate >= freeLimit
}

// Se exceder: mostrar dados truncados ao período livre + overlay de upgrade sobre os dados mais antigos
```

### Cálculo de Taxa de Poupança

```ts
function calcSavingsRateForMonth(recipes: number, expenses: number, monthlyIncome: number): number {
  const base = monthlyIncome > 0 ? monthlyIncome : recipes
  if (base === 0) return 0
  const saved = recipes - expenses
  return Math.max(0, (saved / base) * 100)
}
```

### Delta KPI: cor contextual

| KPI | Delta positivo | Delta negativo |
|---|---|---|
| Receitas Totais | verde (+) | vermelho (-) |
| Despesas Totais | vermelho (+, ruim) | verde (-, economizou) |
| Saldo Acumulado | verde (+) | vermelho (-) |
| Taxa de Poupança | verde (+) | vermelho (-) |

```ts
function getDeltaColor(kpiType: 'recipes' | 'expenses' | 'balance' | 'savings', delta: number): string {
  if (kpiType === 'expenses') {
    return delta > 0 ? '#f43f5e' : '#10b981'
  }
  return delta > 0 ? '#10b981' : '#f43f5e'
}
```

### maxCatValue para barras de comparação

```ts
const maxCatValue = Math.max(
  ...catCompData.map(c => Math.max(c.currentTotal, c.prevTotal))
)
// Largura da barra = (categoryTotal / maxCatValue) * 100 + '%'
```

---

## 14. States

### Loading

```tsx
{loading && (
  <div className="grid grid-cols-4 gap-2.5 mb-3 max-lg:grid-cols-2 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
        <div className="h-3 w-16 bg-[var(--sl-s3)] rounded mb-3" />
        <div className="h-6 w-24 bg-[var(--sl-s3)] rounded mb-2" />
        <div className="h-3 w-20 bg-[var(--sl-s3)] rounded" />
      </div>
    ))}
  </div>
)}
```

### Empty (sem transações no período)

```tsx
{!loading && transactions.length === 0 && (
  <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl p-12 text-center">
    <span className="text-[40px] block mb-3 opacity-70">📊</span>
    <h3 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1.5">
      Nenhuma transação no período
    </h3>
    <p className="text-[13px] text-[var(--sl-t2)]">
      Selecione outro período ou registre transações para ver os relatórios.
    </p>
  </div>
)}
```

### Error

```tsx
{error && (
  <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-4">
    Erro ao carregar dados. <button onClick={handleGenerate} className="underline">Tentar novamente</button>
  </div>
)}
```

---

## 15. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` | `text-sl-grad` |
| Narrative Band | `hidden` | `flex` |
| Conteúdo narrativo | — | Texto gerado por template + tags de destaque |
| Btn "Regenerar" | — | Visível com contador "(2/mês restantes)" |
| Sidebar badge "PRO" | Visível | Visível |

```tsx
// Narrative Band
<div className="hidden [.jornada_&]:flex ...">
```

---

## 16. Responsividade

| Breakpoint | Comportamento |
|---|---|
| Desktop (>900px) | Charts main 2 colunas, KPI strip 4 colunas |
| Tablet (≤900px) | Charts 1 coluna, KPI strip 2 colunas |
| Mobile (≤640px) | Sidebar oculta, KPI strip 2 colunas, period-row com flex-wrap |

```css
@media (max-width: 900px) {
  .kpi-strip { grid-template-columns: repeat(2, 1fr) }
  .charts-main { grid-template-columns: 1fr }
  .charts-bottom { grid-template-columns: 1fr }
}
@media (max-width: 640px) {
  .sidebar { display: none }
  .module-bar { display: none }
  .period-row { flex-wrap: wrap; gap: 5px }
}
```

---

## 17. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Period selector: 5 chips + 2 month pickers + "Gerar relatório"
- [ ] FREE: chips "Último semestre", "Últimos 12 meses" e "Personalizado" mostram badge PRO
- [ ] FREE: dados limitados a 3 meses; overlay de upgrade para dados mais antigos
- [ ] KPI comparativo: 4 cards com delta colorido contextual (despesas: positivo = vermelho)
- [ ] Multi-line chart com Recharts, linha de meta tracejada
- [ ] Cat-comp: 2 barras por categoria (atual cheia + anterior semi-transparente) + delta %
- [ ] Bar chart receitas/despesas com Recharts
- [ ] Saving-rate: barras horizontais com linha de meta vertical
- [ ] Top gastos: 5 maiores despesas individuais
- [ ] Tabela completa com busca, filtro por tipo, paginação (30 itens/página)
- [ ] Export CSV: gera Blob com BOM UTF-8 e dispara download
- [ ] Export PDF e XLSX: desabilitados no FREE, mostram badge PRO e abre upgrade modal
- [ ] Narrative Band presente e oculta no Foco
- [ ] Narrative gerada por template client-side (sem API externa no MVP)
- [ ] Valores monetários em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] `sl-fade-up` nos cards com delays
- [ ] Responsivo: charts 1 coluna em tablet, KPIs 2 colunas
- [ ] `hover:border-[var(--sl-border-h)]` em todos os cards
