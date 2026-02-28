# Spec — Tela: Planejamento Futuro (`/financas/planejamento`)

> Esta spec é autocontida. Um desenvolvedor pode implementar a tela inteiramente lendo apenas este documento.

---

## 1. Visão Geral

A tela de Planejamento Futuro projeta o saldo do usuário nos próximos 12 meses, combinando:
1. Transações recorrentes ativas (`recurring_transactions`)
2. Eventos de planejamento manuais (`planning_events`)
3. Transações futuras já lançadas (`transactions` com `is_future = true`)

O usuário pode visualizar 3 cenários (Pessimista / Realista / Otimista), ver a curva de saldo projetada em uma timeline horizontal com scroll, e gerenciar eventos futuros planejados.

**Rota:** `/financas/planejamento`
**Arquivo:** `web/src/app/(app)/financas/planejamento/page.tsx`
**Componentes:** `'use client'` — projeções calculadas client-side.
**Plano:** Disponível no FREE com limitação de 3 meses visíveis; PRO tem 12 meses.

---

## 2. Referência Visual

Protótipo: `prototipos/proto-planejamento-v2-revisado.html`

**Elementos chave do protótipo:**
- Topbar com título, scenario-group (Pessimista / Realista / Otimista), botão "+ Novo Evento"
- 4 KPI summary cards (Saldo Hoje, Saldo 6m, Saldo 12m, Próximo Crítico)
- JornadaInsight adaptativo ao cenário selecionado
- Timeline Card `"Curva de Saldo — 12 meses"`:
  - Layer labels à esquerda: Receitas (verde), Saldo (azul), Despesas (vermelho) — cada 90px height
  - Scrollable area horizontal com `cursor: grab`
  - Cabeçalho de meses (sticky)
  - Hoje line com dot verde
  - Chips coloridos nas bandas de receita/despesa
  - Overflow `"+N"` com tooltip
  - Curva SVG de saldo com gradiente
  - Col-line highlight para mês atual
  - FREE: sobreposição nos meses 4–12 com blur/upgrade card
- Bottom grid 2 colunas:
  - Card "Próximos Eventos" (lista com dots coloridos e datas)
  - Card "Projeção de Saldo" (sparkline + bal-row + warning)

---

## 3. Layout Completo

### Anatomia da Página

```
┌───────────────────────────────────────────────────────────┐
│  TOPBAR: título + spacer + Scenario Group + "+ Novo Evento"│
├───────────────────────────────────────────────────────────┤
│  SUMMARY STRIP: 4 KPI cards                               │
│  Saldo Hoje | Saldo 6m | Saldo 12m | Próximo Crítico      │
├───────────────────────────────────────────────────────────┤
│  JORNADA INSIGHT (oculto no Foco)                         │
├───────────────────────────────────────────────────────────┤
│  TIMELINE CARD — Curva de Saldo 12 meses                  │
│  ┌──────────┬────────────────────────────────────────┐    │
│  │ Layer    │ ← scroll horizontal →                  │    │
│  │ Labels   │ [Fev/26][Mar/26][Abr/26]...[Jan/27]    │    │
│  │ RECEITAS │ [chips income] per month               │    │
│  │ SALDO    │ [SVG curve]                            │    │
│  │ DESPESAS │ [chips expense] per month              │    │
│  └──────────┴────────────────────────────────────────┘    │
│  FREE: meses 4–12 com overlay de upgrade                  │
├───────────────────────────────────────────────────────────┤
│  BOTTOM GRID 2 colunas                                    │
│  [Próximos Eventos]    │  [Projeção de Saldo]             │
│  lista com dots/datas  │  sparkline + bal-row + warning   │
└───────────────────────────────────────────────────────────┘
```

### Topbar

```tsx
<div className="flex items-center gap-3 mb-5 flex-wrap">
  <h1 className={cn(
    'font-[Syne] font-extrabold text-[22px] tracking-tight',
    isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
  )}>
    📈 Planejamento Futuro
  </h1>
  <div className="flex-1" />

  {/* Scenario Group */}
  <div className="flex bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[20px] p-0.5 gap-0.5">
    {SCENARIOS.map(sc => (
      <button key={sc.key}
        onClick={() => setScenario(sc.key)}
        className={cn(
          'px-[14px] py-[5px] rounded-[16px] border-none text-[12px] font-medium font-sans cursor-pointer transition-all whitespace-nowrap',
          scenario === sc.key ? sc.activeClass : 'bg-transparent text-[var(--sl-t3)] hover:text-[var(--sl-t2)]'
        )}>
        {sc.icon} {sc.label}
      </button>
    ))}
  </div>

  <button onClick={() => setEventModalOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-none bg-[#10b981] text-white text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity">
    <Plus size={13} strokeWidth={2.5} />
    Novo Evento
  </button>
</div>
```

**Constantes de cenário:**

```ts
const SCENARIOS = [
  { key: 'p', label: 'Pessimista', icon: '📉', activeClass: 'bg-[rgba(244,63,94,0.15)] text-[#f43f5e]' },
  { key: 'r', label: 'Realista',   icon: '📊', activeClass: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' },
  { key: 'o', label: 'Otimista',   icon: '🚀', activeClass: 'bg-[rgba(0,85,255,0.15)] text-[#0055ff]' },
] as const

type ScenarioKey = 'p' | 'r' | 'o'

const SCENARIO_MULTIPLIERS: Record<ScenarioKey, number> = {
  p: 0.7,   // gastos +30% ou renda -30%
  r: 1.0,   // sem ajuste
  o: 1.3,   // renda +30% ou gastos -30%
}

const SCENARIO_COLORS: Record<ScenarioKey, string> = {
  p: '#f43f5e',
  r: '#10b981',
  o: '#0055ff',
}
```

### Summary Strip

```tsx
<div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
  <SumCard label="Saldo Hoje"        value={fmtR(currentBalance)}  delta={formatDate(today)}          color="green" />
  <SumCard label="Saldo em 6 meses"  value={fmtR(bal6m)}           delta={`${format6mLabel} — ${SCENARIO_LABELS[scenario]}`} color="blue" />
  <SumCard label="Saldo em 12 meses" value={fmtR(bal12m)}          delta={`${format12mLabel} — ${SCENARIO_LABELS[scenario]}`} color={bal12m >= currentBalance ? 'green' : 'red'} />
  <SumCard label="Próximo crítico"   value={fmtR(nextCritical.balance)} delta={`${nextCritical.date} — ${nextCritical.name}`} color="red" />
</div>
```

`currentBalance` = `profiles.current_balance`
`bal6m`, `bal12m` = calculado pela função `projectBalance()` descrita abaixo.
`nextCritical` = primeiro evento futuro onde o saldo projetado cai abaixo de `criticalThreshold`.

### JornadaInsight

Texto adaptativo por cenário. Gerado client-side (sem IA real no MVP).

```ts
const SCENARIO_INSIGHT_TEMPLATES: Record<ScenarioKey, (data: InsightData) => string> = {
  r: (d) => `No cenário realista, você atinge R$ ${d.bal12m} em ${d.month12m} e ${d.reservaMsg}. Atenção ao ${d.criticalEvent}.`,
  o: (d) => `No cenário otimista — com renda extra ou gastos reduzidos — você pode alcançar R$ ${d.bal12m} em ${d.month12m}. ${d.goalMsg}`,
  p: (d) => `No cenário pessimista, saldo pode ${d.isNegative ? 'ficar negativo em ' + d.negativeMonth : 'crescer mais devagar'}. Reserva de emergência é prioritária nesse cenário.`,
}
```

### Timeline Card

```tsx
<SLCard className="mb-4 overflow-hidden p-0">
  {/* Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
    <div>
      <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">Curva de Saldo — 12 meses</p>
      <p className="text-[11px] text-[var(--sl-t3)]">
        Projeção {SCENARIO_LABELS[scenario]} · {format(startMonth, 'MMM/yyyy')} → {format(endMonth, 'MMM/yyyy')}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {/* Legenda */}
      {[
        { color: '#10b981', label: 'Realista', dash: false },
        { color: '#0055ff', label: 'Otimista', dash: true },
        { color: '#f43f5e', label: 'Pessimista', dash: true },
      ].map(l => (
        <span key={l.label} className="flex items-center gap-1 text-[11px]" style={{ color: l.color }}>
          <span className="w-3 h-px inline-block rounded" style={{ background: l.color, borderTop: l.dash ? `2px dashed ${l.color}` : undefined }} />
          {l.label}
        </span>
      ))}
    </div>
  </div>

  {/* Body: layer labels + scroll area */}
  <div className="flex overflow-hidden" style={{ height: 320 }}>
    {/* Layer labels (80px width) */}
    <div className="w-20 shrink-0 flex flex-col border-r border-[var(--sl-border)] bg-[var(--sl-s2)] overflow-hidden">
      {/* Spacer para alinhar com month-header (36px) */}
      <div className="h-9 shrink-0 border-b border-[var(--sl-border)] bg-[var(--sl-s1)]" />
      {/* Receitas band (90px) */}
      <div className="flex flex-col items-end justify-center px-3 h-[90px] shrink-0 border-b border-[var(--sl-border)]">
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#10b981]">Receitas</span>
        <span className="text-[13px]">💰</span>
      </div>
      {/* Saldo band (flex-1) */}
      <div className="flex flex-col items-end justify-center px-3 flex-1 min-h-0 border-b border-[var(--sl-border)]">
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#0055ff]">Saldo</span>
        <span className="text-[13px]">📈</span>
      </div>
      {/* Despesas band (90px) */}
      <div className="flex flex-col items-end justify-center px-3 h-[90px] shrink-0">
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#f43f5e]">Despesas</span>
        <span className="text-[13px]">📤</span>
      </div>
    </div>

    {/* Scrollable timeline */}
    <TimelineScroll
      months={months}
      events={projectedEvents}
      balanceData={balanceData}
      scenario={scenario}
      todayCol={todayCol}
      isPro={isPro}
    />
  </div>
</SLCard>
```

### TimelineScroll (Client Component separado)

```tsx
// src/components/financas/timeline-scroll.tsx
'use client'

const COL_W = 140  // largura de cada coluna/mês em px
const MAX_CHIPS = 3 // chips visíveis antes do overflow "+N"

export function TimelineScroll({ months, events, balanceData, scenario, todayCol, isPro }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Drag to scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let isDragging = false
    let startX = 0
    let scrollLeft = 0
    const onMouseDown = (e: MouseEvent) => { isDragging = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft }
    const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) }
    const onMouseUp = () => { isDragging = false }
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
    return () => { el.removeEventListener('mousedown', onMouseDown); el.removeEventListener('mousemove', onMouseMove); el.removeEventListener('mouseup', onMouseUp); el.removeEventListener('mouseleave', onMouseUp) }
  }, [])

  const totalWidth = months.length * COL_W

  return (
    <div ref={scrollRef}
      className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
      style={{ scrollbarWidth: 'thin' }}>
      <div style={{ width: totalWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Month headers (sticky top) */}
        <div className="flex sticky top-0 z-20 bg-[var(--sl-s1)] border-b border-[var(--sl-border)]" style={{ width: totalWidth }}>
          {months.map((m, i) => (
            <div key={i} style={{ width: COL_W, flexShrink: 0 }}
              className={cn('flex items-center px-3.5 h-9 border-r border-[var(--sl-border)] gap-1.5',
                i === todayCol && 'text-[#10b981]')}>
              <span className="font-[Syne] text-[11px] font-bold tracking-[0.03em]">{m.label}</span>
              {i === todayCol && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.14)] text-[#10b981] font-semibold">Hoje</span>}
            </div>
          ))}
        </div>

        {/* Canvas area */}
        <div className="relative flex-1 min-h-0" style={{ width: totalWidth }}>
          {/* Column grid lines */}
          <div className="absolute inset-0 flex pointer-events-none">
            {months.map((_, i) => (
              <div key={i} style={{ width: COL_W, flexShrink: 0 }}
                className={cn('border-r border-[var(--sl-border)]', i === todayCol && 'bg-[rgba(16,185,129,0.025)]')} />
            ))}
          </div>

          {/* Today line */}
          <TodayLine col={todayCol} totalCols={months.length} colWidth={COL_W} />

          {/* Layers */}
          <div className="absolute inset-0 flex flex-col">
            {/* Income band (90px) */}
            <div className="h-[90px] shrink-0 relative border-b border-[var(--sl-border)] bg-[rgba(16,185,129,0.02)]">
              <EventChips events={events.filter(e => e.band === 'income')} months={months} colWidth={COL_W} />
            </div>
            {/* Balance band (flex-1) */}
            <div className="flex-1 min-h-0 relative border-b border-[var(--sl-border)]">
              <BalanceCurve data={balanceData} scenario={scenario} colWidth={COL_W} />
            </div>
            {/* Expense band (90px) */}
            <div className="h-[90px] shrink-0 relative bg-[rgba(244,63,94,0.02)]">
              <EventChips events={events.filter(e => e.band === 'expense')} months={months} colWidth={COL_W} />
            </div>
          </div>

          {/* FREE overlay: meses 4–12 com blur */}
          {!isPro && (
            <div className="absolute top-0 bottom-0 z-30" style={{ left: 3 * COL_W, right: 0 }}>
              <div className="w-full h-full backdrop-blur-sm bg-[var(--sl-bg)]/70 flex flex-col items-center justify-center gap-3">
                <span className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)]">PRO — Projeção 12 meses</span>
                <p className="text-[12px] text-[var(--sl-t2)] text-center max-w-[220px]">
                  Desbloqueie a projeção completa de 12 meses com o plano PRO.
                </p>
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#0055ff] text-white text-[12px] font-bold">
                  Ver PRO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Bottom Grid

```tsx
<div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
  {/* Próximos Eventos */}
  <SLCard>
    <div className="flex items-center justify-between mb-4">
      <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">📋 Próximos Eventos</p>
      <button className="text-[11px] text-[#10b981] cursor-pointer hover:opacity-70">Ver todos →</button>
    </div>
    <div className="flex flex-col divide-y divide-[var(--sl-border)]">
      {upcomingEvents.slice(0, 6).map(ev => (
        <div key={ev.id} className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-[var(--sl-s2)] -mx-2 px-2 rounded-lg transition-colors">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.dotColor }} />
          <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] shrink-0 w-[42px]">
            {format(ev.date, 'dd/MMM')}
          </span>
          <span className="flex-1 text-[13px] text-[var(--sl-t2)]">{ev.icon} {ev.name}</span>
          <span className={cn('font-[DM_Mono] text-[13px] shrink-0', ev.amount >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
            {ev.amount >= 0 ? '+' : ''}{fmtR(ev.amount)}
          </span>
        </div>
      ))}
    </div>
  </SLCard>

  {/* Projeção de Saldo */}
  <SLCard>
    <div className="flex items-center justify-between mb-4">
      <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">📊 Projeção de Saldo</p>
      <span className="text-[11px] font-semibold" style={{ color: SCENARIO_COLORS[scenario] }}>
        ● {SCENARIO_LABELS[scenario]}
      </span>
    </div>

    {/* Sparkline SVG */}
    <SparklineSvg data={sparklineData} color={SCENARIO_COLORS[scenario]} />

    {/* Bal row */}
    <div className="flex justify-between mt-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">Hoje</span>
        <span className="font-[DM_Mono] text-[15px] text-[#10b981]">{fmtR(currentBalance)}</span>
      </div>
      <div className="flex flex-col gap-0.5 items-center">
        <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">6 meses</span>
        <span className="font-[DM_Mono] text-[15px] text-[#0055ff]">{fmtR(bal6m)}</span>
      </div>
      <div className="flex flex-col gap-0.5 items-end">
        <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">12 meses</span>
        <span className={cn('font-[DM_Mono] text-[15px]', bal12m >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
          {fmtR(bal12m)}
        </span>
      </div>
    </div>

    {/* Warning de saldo crítico */}
    {nextCritical && (
      <div className="mt-2.5 p-2.5 bg-[rgba(245,158,11,0.07)] border border-[rgba(245,158,11,0.15)] rounded-[9px] text-[12px] text-[var(--sl-t3)]">
        ⚠ <strong className="text-[#f59e0b]">{nextCritical.date}</strong> — {nextCritical.name}{' '}
        — saldo cai temporariamente para <strong className="text-[#f59e0b]">{fmtR(nextCritical.balance)}</strong>
      </div>
    )}
  </SLCard>
</div>
```

---

## 4. Interfaces TypeScript

```ts
interface PlanningEvent {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number              // sempre positivo
  type: 'income' | 'expense'
  planned_date: string        // ISO date
  is_confirmed: boolean
  notes: string | null
  created_at: string
  categories?: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

interface ProjectedEvent {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense' | 'goal' | 'recorr' | 'warn'
  amount: number
  date: Date
  monthIndex: number          // 0 = mês atual, 1 = próximo, etc.
  band: 'income' | 'expense'  // qual banda da timeline
  dotColor: string
  source: 'recurring' | 'planning' | 'transaction'
}

interface BalanceDataPoint {
  monthIndex: number
  balance: number             // saldo projetado no final do mês
}

interface CriticalPoint {
  date: string
  name: string
  balance: number
}

interface InsightData {
  bal12m: string
  month12m: string
  bal6m: string
  criticalEvent: string
  isNegative: boolean
  negativeMonth: string
  reservaMsg: string
  goalMsg: string
}

interface EventFormData {
  type: 'income' | 'expense'
  name: string
  amount: string
  planned_date: string
  category_id: string
  notes: string
}
```

---

## 5. Hook `usePlanejamento`

```ts
// src/hooks/use-planejamento.ts
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type ScenarioKey = 'p' | 'r' | 'o'

export function usePlanejamento() {
  const supabase = createClient()
  const [planningEvents, setPlanningEvents] = useState<PlanningEvent[]>([])
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([])
  const [profile, setProfile] = useState<{ current_balance: number; monthly_income: number } | null>(null)
  const [scenario, setScenario] = useState<ScenarioKey>('r')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [eventsRes, recurringRes, profileRes] = await Promise.all([
      supabase
        .from('planning_events')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('planned_date', new Date().toISOString().split('T')[0])
        .order('planned_date'),
      supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_paused', false),
      supabase
        .from('profiles')
        .select('current_balance, monthly_income, savings_goal_pct')
        .eq('id', user.id)
        .single(),
    ])

    if (eventsRes.data) setPlanningEvents((eventsRes.data as any) ?? [])
    if (recurringRes.data) setRecurringItems((recurringRes.data as any) ?? [])
    if (profileRes.data) setProfile(profileRes.data as any)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Projeção de saldo por cenário
  const { projectedEvents, balanceData, months } = useMemo(() => {
    return buildProjection({
      recurringItems,
      planningEvents,
      currentBalance: profile?.current_balance ?? 0,
      scenario,
      nMonths: 13, // atual + 12
    })
  }, [recurringItems, planningEvents, profile, scenario])

  const bal6m = balanceData[Math.min(6, balanceData.length - 1)]?.balance ?? 0
  const bal12m = balanceData[Math.min(12, balanceData.length - 1)]?.balance ?? 0

  // Ponto crítico: mês em que o saldo cai >30% em relação ao mês anterior
  const nextCritical = useMemo(() => {
    const WARN_THRESHOLD = 0.3
    for (let i = 1; i < balanceData.length; i++) {
      const prev = balanceData[i - 1].balance
      const curr = balanceData[i].balance
      if (prev > 0 && (prev - curr) / prev > WARN_THRESHOLD) {
        const criticalMonth = months[i]
        const monthEvents = projectedEvents.filter(e => e.monthIndex === i && e.type === 'warn')
        return {
          date: criticalMonth?.label ?? '',
          name: monthEvents[0]?.name ?? 'despesa crítica',
          balance: curr,
        }
      }
    }
    return null
  }, [balanceData, projectedEvents, months])

  const createEvent = async (formData: EventFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const payload = {
      user_id: user.id,
      type: formData.type,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount.replace(',', '.')),
      planned_date: formData.planned_date,
      category_id: formData.category_id || null,
      notes: formData.notes || null,
      is_confirmed: false,
    }
    const { error } = await supabase.from('planning_events').insert(payload as any)
    if (error) throw error
    await fetchData()
  }

  const updateEvent = async (id: string, updates: Partial<EventFormData>) => {
    const { error } = await supabase.from('planning_events').update(updates as any).eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('planning_events').delete().eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const confirmEvent = async (id: string) => {
    // Marcar como confirmado e criar transação real com is_future = true
    const { error } = await supabase
      .from('planning_events')
      .update({ is_confirmed: true } as any)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  return {
    planningEvents,
    projectedEvents,
    balanceData,
    months,
    loading,
    error,
    scenario,
    setScenario,
    currentBalance: profile?.current_balance ?? 0,
    bal6m,
    bal12m,
    nextCritical,
    createEvent,
    updateEvent,
    deleteEvent,
    confirmEvent,
    refresh: fetchData,
  }
}
```

---

## 6. Algoritmo de Projeção (`buildProjection`)

```ts
interface ProjectionInput {
  recurringItems: RecurringTransaction[]
  planningEvents: PlanningEvent[]
  currentBalance: number
  scenario: ScenarioKey
  nMonths: number  // número de colunas: 13 = mês atual + 12
}

function buildProjection(input: ProjectionInput) {
  const { recurringItems, planningEvents, currentBalance, scenario, nMonths } = input

  const multiplier = SCENARIO_MULTIPLIERS[scenario]
  const today = new Date()
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const months = Array.from({ length: nMonths }, (_, i) => {
    const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
    return {
      index: i,
      date: d,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('. ', '/').replace('/', ' de '),
      year: d.getFullYear(),
      month: d.getMonth(),
    }
  })

  const projectedEvents: ProjectedEvent[] = []

  // 1. Expand recurring transactions into monthly occurrences
  for (const rec of recurringItems) {
    for (const m of months) {
      if (!occursInMonth(rec, m.year, m.month)) continue
      if (rec.end_date && new Date(rec.end_date) < m.date) continue

      const signedAmount = rec.type === 'income'
        ? rec.amount * (scenario === 'o' ? multiplier : 1)
        : rec.amount * (scenario === 'p' ? multiplier : scenario === 'o' ? 1 / multiplier : 1)

      projectedEvents.push({
        id: `rec-${rec.id}-${m.index}`,
        name: rec.name,
        icon: '🔄',
        type: 'recorr',
        amount: rec.type === 'income' ? signedAmount : -signedAmount,
        date: new Date(m.year, m.month, rec.day_of_month ?? 1),
        monthIndex: m.index,
        band: rec.type === 'income' ? 'income' : 'expense',
        dotColor: '#f97316',
        source: 'recurring',
      })
    }
  }

  // 2. Add planning events
  for (const ev of planningEvents) {
    const evDate = new Date(ev.planned_date)
    const monthIndex = months.findIndex(m => m.year === evDate.getFullYear() && m.month === evDate.getMonth())
    if (monthIndex < 0) continue

    projectedEvents.push({
      id: `plan-${ev.id}`,
      name: ev.name,
      icon: ev.categories?.icon ?? (ev.type === 'income' ? '💰' : '📤'),
      type: 'goal',
      amount: ev.type === 'income' ? ev.amount : -ev.amount,
      date: evDate,
      monthIndex,
      band: ev.type === 'income' ? 'income' : 'expense',
      dotColor: '#0055ff',
      source: 'planning',
    })
  }

  // 3. Calculate month-by-month balance
  const balanceData: BalanceDataPoint[] = []
  let runningBalance = currentBalance

  for (const m of months) {
    const monthEvents = projectedEvents.filter(e => e.monthIndex === m.index)
    const monthNet = monthEvents.reduce((sum, e) => sum + e.amount, 0)
    runningBalance += monthNet
    balanceData.push({ monthIndex: m.index, balance: runningBalance })
  }

  // 4. Mark warn events (single month where balance drops >30%)
  for (let i = 1; i < balanceData.length; i++) {
    const prev = balanceData[i - 1].balance
    const curr = balanceData[i].balance
    if (prev > 0 && (prev - curr) / prev > 0.3) {
      // Find the largest expense in that month to mark as warn
      const monthExpenses = projectedEvents
        .filter(e => e.monthIndex === i && e.amount < 0)
        .sort((a, b) => a.amount - b.amount)
      if (monthExpenses[0]) {
        monthExpenses[0].type = 'warn'
        monthExpenses[0].dotColor = '#f97316'
      }
    }
  }

  return { projectedEvents, balanceData, months }
}

// Verifica se uma recorrente ocorre em determinado mês/ano
function occursInMonth(rec: RecurringTransaction, year: number, month: number): boolean {
  const start = new Date(rec.start_date)
  const targetDate = new Date(year, month, 1)
  if (targetDate < new Date(start.getFullYear(), start.getMonth(), 1)) return false

  switch (rec.frequency) {
    case 'monthly':   return true
    case 'annual':    return start.getMonth() === month
    case 'quarterly': return (month - start.getMonth() + 12) % 3 === 0
    case 'weekly':
    case 'biweekly':  return true // simplificado: ocorre em todos os meses
    default:          return false
  }
}
```

---

## 7. Queries Supabase

### Listar planning_events futuros

```sql
SELECT pe.*, c.id, c.name, c.icon, c.color
FROM planning_events pe
LEFT JOIN categories c ON pe.category_id = c.id
WHERE pe.user_id = auth.uid()
  AND pe.planned_date >= CURRENT_DATE
ORDER BY pe.planned_date;
```

### Listar recorrentes ativas (para projeção)

```sql
SELECT *
FROM recurring_transactions
WHERE user_id = auth.uid()
  AND is_active = true
  AND is_paused = false;
```

### Criar planning_event

```sql
INSERT INTO planning_events (user_id, type, name, amount, planned_date, category_id, notes, is_confirmed)
VALUES ($1, $2, $3, $4, $5, $6, $7, false)
RETURNING *;
```

### Atualizar planning_event

```sql
UPDATE planning_events
SET name = $2, amount = $3, planned_date = $4, category_id = $5, notes = $6
WHERE id = $1 AND user_id = auth.uid();
```

### Excluir planning_event

```sql
DELETE FROM planning_events WHERE id = $1 AND user_id = auth.uid();
```

### Confirmar evento (marcar is_confirmed = true)

```sql
UPDATE planning_events SET is_confirmed = true WHERE id = $1 AND user_id = auth.uid();
```

---

## 8. Regras de Negócio

### Cenários

| Cenário | Multiplicador | Lógica |
|---|---|---|
| Pessimista | `0.7` | Despesas +43% (÷0.7) ou receitas ×0.7 |
| Realista | `1.0` | Sem ajuste — dados brutos |
| Otimista | `1.3` | Receitas ×1.3 ou despesas ÷1.3 |

Aplicação do multiplier por tipo:
```ts
// Receitas no cenário otimista: × multiplier
// Despesas no cenário pessimista: × multiplier (mais caras)
// Receitas no cenário pessimista: × (1/multiplier) = menos
const adjustedAmount =
  rec.type === 'income'
    ? rec.amount * (scenario === 'o' ? 1.3 : scenario === 'p' ? 0.7 : 1)
    : rec.amount * (scenario === 'p' ? 1.3 : scenario === 'o' ? 0.7 : 1)
```

### Limite FREE

- FREE: timeline exibe apenas os **3 meses** mais próximos. Os meses 4–12 ficam visíveis mas com overlay de blur + CTA de upgrade.
- PRO: 12 meses completos.

```ts
const visibleMonths = isPro ? 13 : 3  // 0 = atual, 1..2 = próximos 2 meses
// Para FREE: renderizar o overlay nos índices >= 3
```

### Evento Crítico (WARN node)

Um evento é marcado como `warn` quando, após seu processamento no mês, o saldo cai mais de 30% em relação ao mês anterior.

```ts
if (prev > 0 && (prev - curr) / prev > 0.30) {
  // Marcar a maior despesa do mês como tipo 'warn'
}
```

### today-line

A linha "Hoje" é posicionada proporcionalmente ao dia atual dentro da coluna do mês corrente:

```ts
const todayX = todayCol * COL_W + (today.getDate() / daysInMonth(today)) * COL_W
```

### Legenda de chips (cores)

| Tipo de chip | Cor de fundo | Cor de texto |
|---|---|---|
| `income` | `rgba(16,185,129,0.12)` | `#10b981` |
| `expense` | `rgba(244,63,94,0.10)` | `#f43f5e` |
| `goal` | `rgba(0,85,255,0.10)` | `#0055ff` |
| `recorr` | `rgba(245,158,11,0.09)` | `#f59e0b` |
| `warn` | `rgba(249,115,22,0.10)` | `#f97316` |

---

## 9. Modal: Novo Evento de Planejamento

Campos:
1. **Tipo** — toggle Despesa / Receita
2. **Nome** — input texto, obrigatório
3. **Valor** — input monetário com prefixo R$
4. **Data planejada** — date input, deve ser futura
5. **Categoria** — select com categorias do usuário
6. **Notas** — textarea opcional

Validação:
- Nome: obrigatório
- Valor: obrigatório, > 0
- Data: obrigatória e deve ser ≥ hoje

---

## 10. States

### Loading

```tsx
<div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 animate-pulse">
      <div className="h-3 w-20 bg-[var(--sl-s3)] rounded mb-2" />
      <div className="h-6 w-28 bg-[var(--sl-s3)] rounded" />
    </div>
  ))}
</div>
<div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl animate-pulse" style={{ height: 360 }} />
```

### Empty (sem eventos de planejamento)

Timeline ainda renderiza com apenas as recorrentes. Card de Próximos Eventos mostra:

```tsx
{upcomingEvents.length === 0 && (
  <div className="text-center py-8 text-[var(--sl-t3)] text-[12px]">
    <span className="text-[28px] block mb-2 opacity-50">📋</span>
    Nenhum evento planejado.<br />
    <button onClick={() => setEventModalOpen(true)} className="text-[#10b981] underline mt-1">
      Adicionar evento
    </button>
  </div>
)}
```

### Error

```tsx
{error && (
  <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-5">
    Erro ao carregar dados de planejamento. <button onClick={refresh} className="underline">Tentar novamente</button>
  </div>
)}
```

---

## 11. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` | `text-sl-grad` |
| JornadaInsight | `hidden` | Template de texto com `<strong>`, `<span class="hi">`, `<span class="warn">` |
| Texto do insight | — | Adaptativo ao cenário selecionado (ver templates acima) |
| Conteúdo | Dados analíticos | Mesmos dados + contexto motivacional no insight |

---

## 12. Responsividade

| Breakpoint | Comportamento |
|---|---|
| Desktop (>768px) | Timeline card full-width, bottom grid 2 colunas |
| Tablet (≤768px) | Bottom grid 1 coluna |
| Mobile (≤640px) | Summary strip 2 colunas, scenario group pode wrapping |

```css
/* Bottom grid */
.grid-cols-2 { max-md:grid-cols-1 }

/* Summary strip */
.grid-cols-4 { max-sm:grid-cols-2 }
```

A timeline tem scroll horizontal em qualquer resolução — o COL_W de 140px garante legibilidade.

---

## 13. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] 3 cenários funcionando (Pessimista / Realista / Otimista)
- [ ] `SCENARIO_MULTIPLIERS` aplicado corretamente a receitas e despesas
- [ ] Timeline com scroll horizontal (grab cursor, drag-to-scroll via mouse events)
- [ ] Layer labels (80px) alinhados às bandas (income 90px + saldo flex-1 + expense 90px)
- [ ] today-line posicionado proporcionalmente ao dia atual
- [ ] Month headers sticky no scroll horizontal
- [ ] Col-line do mês atual destacado (`rgba(16,185,129,0.025)`)
- [ ] Chips coloridos por tipo: income/expense/goal/recorr/warn
- [ ] Overflow "+N" quando > 3 chips por banda/mês
- [ ] Curva SVG de saldo na banda do meio
- [ ] FREE: overlay de blur nos meses 4–12 com CTA de upgrade
- [ ] KPI summary com saldo hoje, 6m, 12m e próximo crítico
- [ ] nextCritical: cor vermelha + warning card no sparkline
- [ ] JornadaInsight adaptativo ao cenário
- [ ] Modal de "Novo Evento" funcionando
- [ ] Bottom grid: Próximos Eventos + Projeção Sparkline
- [ ] Responsivo: bottom grid 1 coluna em tablet
- [ ] Valores monetários em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] `sl-fade-up` em cards com delays
