'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RecurringTransaction } from '@/hooks/use-recorrentes'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface PlanningEvent {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  type: 'income' | 'expense'
  planned_date: string
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

export interface ProjectedEvent {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense' | 'goal' | 'recorr' | 'warn'
  amount: number
  date: Date
  monthIndex: number
  band: 'income' | 'expense'
  dotColor: string
  source: 'recurring' | 'planning'
}

export interface BalanceDataPoint {
  monthIndex: number
  balance: number
}

export interface CriticalPoint {
  date: string
  name: string
  balance: number
}

export interface MonthData {
  index: number
  date: Date
  label: string
  year: number
  month: number
}

export interface EventFormData {
  type: 'income' | 'expense'
  name: string
  amount: string
  planned_date: string
  category_id: string
  notes: string
}

export type ScenarioKey = 'p' | 'r' | 'o'

export const SCENARIOS = [
  { key: 'p' as ScenarioKey, label: 'Pessimista', icon: '📉', activeClass: 'bg-[rgba(244,63,94,0.15)] text-[#f43f5e]' },
  { key: 'r' as ScenarioKey, label: 'Realista',   icon: '📊', activeClass: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' },
  { key: 'o' as ScenarioKey, label: 'Otimista',   icon: '🚀', activeClass: 'bg-[rgba(0,85,255,0.15)] text-[#0055ff]' },
]

export const SCENARIO_MULTIPLIERS: Record<ScenarioKey, number> = { p: 0.7, r: 1.0, o: 1.3 }

export const SCENARIO_COLORS: Record<ScenarioKey, string> = {
  p: '#f43f5e',
  r: '#10b981',
  o: '#0055ff',
}

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  p: 'Pessimista',
  r: 'Realista',
  o: 'Otimista',
}

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function occursInMonth(rec: RecurringTransaction, year: number, month: number): boolean {
  const start = new Date(rec.start_date + 'T00:00:00')
  const targetStart = new Date(year, month, 1)
  if (targetStart < new Date(start.getFullYear(), start.getMonth(), 1)) return false

  switch (rec.frequency) {
    case 'monthly':   return true
    case 'annual':    return start.getMonth() === month
    case 'quarterly': {
      const diff = (year * 12 + month) - (start.getFullYear() * 12 + start.getMonth())
      return diff >= 0 && diff % 3 === 0
    }
    case 'weekly':
    case 'biweekly':  return true
    default:          return false
  }
}

function buildProjection(input: {
  recurringItems: RecurringTransaction[]
  planningEvents: PlanningEvent[]
  currentBalance: number
  scenario: ScenarioKey
  nMonths: number
}): { projectedEvents: ProjectedEvent[]; balanceData: BalanceDataPoint[]; months: MonthData[] } {
  const { recurringItems, planningEvents, currentBalance, scenario, nMonths } = input

  const today = new Date()
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const months: MonthData[] = Array.from({ length: nMonths }, (_, i) => {
    const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
    return {
      index: i,
      date: d,
      label: `${MONTH_SHORT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    }
  })

  const projectedEvents: ProjectedEvent[] = []

  // 1. Expand recurring transactions
  for (const rec of recurringItems) {
    for (const m of months) {
      if (!occursInMonth(rec, m.year, m.month)) continue
      if (rec.end_date && new Date(rec.end_date + 'T00:00:00') < m.date) continue

      const adjustedAmount =
        rec.type === 'income'
          ? rec.amount * (scenario === 'o' ? 1.3 : scenario === 'p' ? 0.7 : 1)
          : rec.amount * (scenario === 'p' ? 1.3 : scenario === 'o' ? 0.7 : 1)

      projectedEvents.push({
        id: `rec-${rec.id}-${m.index}`,
        name: rec.name,
        icon: '🔄',
        type: 'recorr',
        amount: rec.type === 'income' ? adjustedAmount : -adjustedAmount,
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
    const evDate = new Date(ev.planned_date + 'T00:00:00')
    const monthIndex = months.findIndex(
      m => m.year === evDate.getFullYear() && m.month === evDate.getMonth()
    )
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

  // 3. Month-by-month balance
  const balanceData: BalanceDataPoint[] = []
  let running = currentBalance
  for (const m of months) {
    const net = projectedEvents.filter(e => e.monthIndex === m.index).reduce((s, e) => s + e.amount, 0)
    running += net
    balanceData.push({ monthIndex: m.index, balance: running })
  }

  // 4. Mark warn events
  for (let i = 1; i < balanceData.length; i++) {
    const prev = balanceData[i - 1].balance
    const curr = balanceData[i].balance
    if (prev > 0 && (prev - curr) / prev > 0.3) {
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

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UsePlanejamentoReturn {
  planningEvents: PlanningEvent[]
  projectedEvents: ProjectedEvent[]
  balanceData: BalanceDataPoint[]
  months: MonthData[]
  loading: boolean
  error: string | null
  scenario: ScenarioKey
  setScenario: (s: ScenarioKey) => void
  currentBalance: number
  bal6m: number
  bal12m: number
  nextCritical: CriticalPoint | null
  createEvent: (data: EventFormData) => Promise<void>
  updateEvent: (id: string, data: Partial<EventFormData>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  confirmEvent: (id: string) => Promise<void>
  refresh: () => void
}

export function usePlanejamento(): UsePlanejamentoReturn {
  const [planningEvents, setPlanningEvents] = useState<PlanningEvent[]>([])
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([])
  const [profile, setProfile] = useState<{ current_balance: number; monthly_income: number } | null>(null)
  const [scenario, setScenario] = useState<ScenarioKey>('r')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const today = new Date().toISOString().split('T')[0]

    const sb = supabase as any

    const [eventsRes, recurringRes, profileRes] = await Promise.all([
      sb
        .from('planning_events')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('planned_date', today)
        .order('planned_date'),
      sb
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_paused', false),
      sb
        .from('profiles')
        .select('current_balance, monthly_income')
        .eq('id', user.id)
        .single(),
    ]) as [
      { data: PlanningEvent[] | null; error: unknown },
      { data: RecurringTransaction[] | null; error: unknown },
      { data: { current_balance: number; monthly_income: number } | null; error: unknown },
    ]

    if (eventsRes.data)  setPlanningEvents(eventsRes.data ?? [])
    if (recurringRes.data) setRecurringItems(recurringRes.data ?? [])
    if (profileRes.data) setProfile(profileRes.data)
    if (eventsRes.error || recurringRes.error) setError('Erro ao carregar dados de planejamento.')
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const { projectedEvents, balanceData, months } = useMemo(() => buildProjection({
    recurringItems,
    planningEvents,
    currentBalance: profile?.current_balance ?? 0,
    scenario,
    nMonths: 13,
  }), [recurringItems, planningEvents, profile, scenario])

  const bal6m = balanceData[Math.min(6, balanceData.length - 1)]?.balance ?? 0
  const bal12m = balanceData[Math.min(12, balanceData.length - 1)]?.balance ?? 0

  const nextCritical = useMemo((): CriticalPoint | null => {
    for (let i = 1; i < balanceData.length; i++) {
      const prev = balanceData[i - 1].balance
      const curr = balanceData[i].balance
      if (prev > 0 && (prev - curr) / prev > 0.3) {
        const warnEvents = projectedEvents.filter(e => e.monthIndex === i && e.type === 'warn')
        return {
          date: months[i]?.label ?? '',
          name: warnEvents[0]?.name ?? 'despesa crítica',
          balance: curr,
        }
      }
    }
    return null
  }, [balanceData, projectedEvents, months])

  const createEvent = useCallback(async (formData: EventFormData): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error: err } = await supabase.from('planning_events').insert({
      user_id: user.id,
      type: formData.type,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount.replace(',', '.')),
      planned_date: formData.planned_date,
      category_id: formData.category_id || null,
      notes: formData.notes || null,
      is_confirmed: false,
    } as any)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const updateEvent = useCallback(async (id: string, updates: Partial<EventFormData>): Promise<void> => {
    const sb = createClient() as any
    const payload: Record<string, unknown> = {}
    if (updates.type)         payload.type = updates.type
    if (updates.name)         payload.name = updates.name.trim()
    if (updates.amount)       payload.amount = parseFloat(updates.amount.replace(',', '.'))
    if (updates.planned_date) payload.planned_date = updates.planned_date
    if ('category_id' in updates) payload.category_id = updates.category_id || null
    if ('notes' in updates)       payload.notes = updates.notes || null
    const { error: err } = await sb.from('planning_events').update(payload).eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    const sb = createClient() as any
    const { error: err } = await sb.from('planning_events').delete().eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const confirmEvent = useCallback(async (id: string): Promise<void> => {
    const sb = createClient() as any
    const { error: err } = await sb.from('planning_events').update({ is_confirmed: true }).eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  return {
    planningEvents, projectedEvents, balanceData, months,
    loading, error,
    scenario, setScenario,
    currentBalance: profile?.current_balance ?? 0,
    bal6m, bal12m, nextCritical,
    createEvent, updateEvent, deleteEvent, confirmEvent,
    refresh: fetchData,
  }
}
