'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface CalendarTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryName: string | null
  icon: string | null
  dotType: 'income' | 'expense' | 'recorrente' | 'planned'
  is_future: boolean
  recurring_transaction_id: string | null
}

export interface CalendarDayData {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
  transactions: CalendarTransaction[]
  balance: number
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildCalendarDays(args: {
  currentDate: Date
  transactions: Record<string, unknown>[]
  planningEvents: Record<string, unknown>[]
  projectedDividends: Record<string, unknown>[]
}): CalendarDayData[] {
  const { currentDate, transactions, planningEvents, projectedDividends } = args
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the Sunday before (or on) the 1st of the month
  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = new Date(firstDayOfMonth)
  startDay.setDate(startDay.getDate() - startDay.getDay())

  // End at the Saturday after (or on) the last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const endDay = new Date(lastDayOfMonth)
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))

  const days: CalendarDayData[] = []
  const cursor = new Date(startDay)

  while (cursor <= endDay) {
    const dateString = cursor.toISOString().split('T')[0]
    const isCurrentMonth = cursor.getMonth() === month
    const isToday = cursor.getTime() === today.getTime()
    const isFuture = cursor > today

    // Map real transactions
    const dayTxs: CalendarTransaction[] = (transactions as any[])
      .filter(t => t.date === dateString)
      .map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        categoryName: t.categories?.name ?? null,
        icon: t.categories?.icon ?? null,
        dotType: t.recurring_transaction_id ? 'recorrente' : t.type,
        is_future: t.is_future,
        recurring_transaction_id: t.recurring_transaction_id,
      }))

    // Map planning events
    const dayPlanEvents: CalendarTransaction[] = (planningEvents as any[])
      .filter(e => e.planned_date === dateString)
      .map(e => ({
        id: `plan-${e.id}`,
        description: e.name,
        amount: e.amount,
        type: e.type as 'income' | 'expense',
        categoryName: e.categories?.name ?? null,
        icon: e.categories?.icon ?? null,
        dotType: 'planned' as const,
        is_future: true,
        recurring_transaction_id: null,
      }))

    // RN-PTR-13: proventos futuros (announced) aparecem como receita prevista.
    const dayProjectedDividends: CalendarTransaction[] = (projectedDividends as any[])
      .filter(d => d.payment_date === dateString)
      .map(d => ({
        id: `dividend-${d.id}`,
        description: `Provento previsto: ${d.portfolio_assets?.ticker ?? 'Ativo'}`,
        amount: d.total_amount,
        type: 'income' as const,
        categoryName: 'Provento (Patrimônio)',
        icon: '📈',
        dotType: 'planned' as const,
        is_future: true,
        recurring_transaction_id: null,
      }))

    // Sort: recorrente first, then income, expense, planned
    const DOT_ORDER = { recorrente: 0, income: 1, expense: 2, planned: 3 }
    const allTxs = [...dayTxs, ...dayPlanEvents, ...dayProjectedDividends]
      .sort((a, b) => DOT_ORDER[a.dotType] - DOT_ORDER[b.dotType])

    const balance = allTxs
      .filter(t => !t.is_future)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)

    days.push({
      date: new Date(cursor),
      dateString,
      day: cursor.getDate(),
      isCurrentMonth,
      isToday,
      isFuture,
      transactions: allTxs,
      balance,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseCalendarioReturn {
  currentDate: Date
  setCurrentDate: (d: Date) => void
  calendarDays: CalendarDayData[]
  weekBalances: number[]
  monthStats: { totalRecipes: number; totalExpenses: number; pendingCount: number }
  currentBalance: number
  loading: boolean
  error: string | null
  prevMonth: () => void
  nextMonth: () => void
  refresh: () => void
}

export function useCalendario(): UseCalendarioReturn {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([])
  const [planningEvents, setPlanningEvents] = useState<Record<string, unknown>[]>([])
  const [projectedDividends, setProjectedDividends] = useState<Record<string, unknown>[]>([])
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { monthStart, monthEnd } = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    return {
      monthStart: new Date(y, m, 1).toISOString().split('T')[0],
      monthEnd: new Date(y, m + 1, 0).toISOString().split('T')[0],
    }
  }, [currentDate])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient() as any

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { if (!cancelled) setLoading(false); return }

      const [txRes, planRes, profileRes, dividendsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, description, amount, type, date, is_future, recurring_transaction_id, categories(id, name, icon, color)')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date'),
        supabase
          .from('planning_events')
          .select('id, name, amount, type, planned_date, is_confirmed, categories(id, name, icon, color)')
          .eq('user_id', user.id)
          .gte('planned_date', monthStart)
          .lte('planned_date', monthEnd),
        supabase
          .from('profiles')
          .select('current_balance')
          .eq('id', user.id)
          .single(),
        supabase
          .from('portfolio_dividends')
          .select('id, total_amount, payment_date, status, portfolio_assets(ticker)')
          .eq('user_id', user.id)
          .eq('status', 'announced')
          .gte('payment_date', monthStart)
          .lte('payment_date', monthEnd),
      ])

      if (cancelled) return

      if (txRes.error) { setError(txRes.error.message) }
      else setTransactions(txRes.data ?? [])

      if (planRes.data) setPlanningEvents(planRes.data ?? [])
      if (profileRes.data) setCurrentBalance(profileRes.data.current_balance ?? 0)
      if (dividendsRes.data) setProjectedDividends(dividendsRes.data ?? [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [monthStart, monthEnd, refreshKey])

  const calendarDays = useMemo(() => buildCalendarDays({
    currentDate,
    transactions,
    planningEvents,
    projectedDividends,
  }), [currentDate, transactions, planningEvents, projectedDividends])

  const weekBalances = useMemo(() => {
    const weeks: number[] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      const weekBalance = calendarDays
        .slice(i, i + 7)
        .filter(d => d.isCurrentMonth)
        .reduce((sum, d) => sum + d.balance, 0)
      weeks.push(weekBalance)
    }
    return weeks
  }, [calendarDays])

  const monthStats = useMemo(() => {
    const monthDays = calendarDays.filter(d => d.isCurrentMonth)
    return {
      totalRecipes: monthDays.reduce(
        (sum, d) => sum + d.transactions.filter(t => t.type === 'income' && !t.is_future).reduce((s, t) => s + t.amount, 0),
        0
      ),
      totalExpenses: monthDays.reduce(
        (sum, d) => sum + d.transactions.filter(t => t.type === 'expense' && !t.is_future).reduce((s, t) => s + t.amount, 0),
        0
      ),
      pendingCount:
        transactions.filter((t: any) => t.is_future).length +
        planningEvents.filter((e: any) => !e.is_confirmed).length +
        projectedDividends.length,
    }
  }, [calendarDays, transactions, planningEvents, projectedDividends])

  const prevMonth = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), [])
  const nextMonth = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), [])
  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return {
    currentDate, setCurrentDate,
    calendarDays, weekBalances, monthStats, currentBalance,
    loading, error,
    prevMonth, nextMonth, refresh,
  }
}
