'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'

export interface RecurringTransaction {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  type: 'income' | 'expense'
  frequency: Frequency
  day_of_month: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  is_paused: boolean
  last_paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RecurrenteWithCategory extends RecurringTransaction {
  categories: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

export interface UpcomingOccurrence {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  amount: number
  frequency: Frequency
  date: Date
  day: number
  monthShort: string
  daysLeft: number
}

export interface RecorrenteFormData {
  type: 'income' | 'expense'
  name: string
  amount: string
  frequency: Frequency
  day_of_month: number
  start_date: string
  end_date: string
  category_id: string
  notes: string
}

export interface NextOccurrence {
  date: Date
  daysLeft: number
  day: number
  monthShort: string
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function normalizeToMonthly(amount: number, frequency: Frequency): number {
  const multipliers: Record<Frequency, number> = {
    weekly:    4.33,
    biweekly:  2.17,
    monthly:   1,
    quarterly: 1 / 3,
    annual:    1 / 12,
  }
  return amount * multipliers[frequency]
}

function clampDay(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, lastDay))
}

export function calcNextOccurrence(rec: RecurringTransaction): NextOccurrence | null {
  if (rec.is_paused || !rec.is_active) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let candidate: Date

  if (rec.frequency === 'monthly' || rec.frequency === 'quarterly' || rec.frequency === 'annual') {
    const targetDay = rec.day_of_month ?? 1
    candidate = clampDay(today.getFullYear(), today.getMonth(), targetDay)

    if (candidate <= today) {
      let nextMonth = today.getMonth()
      let nextYear = today.getFullYear()

      if (rec.frequency === 'monthly') nextMonth += 1
      else if (rec.frequency === 'quarterly') nextMonth += 3
      else if (rec.frequency === 'annual') nextYear += 1

      if (nextMonth > 11) { nextYear += Math.floor(nextMonth / 12); nextMonth = nextMonth % 12 }
      candidate = clampDay(nextYear, nextMonth, targetDay)
    }
  } else {
    // weekly / biweekly
    const intervalDays = rec.frequency === 'weekly' ? 7 : 14
    const start = new Date(rec.start_date + 'T00:00:00')
    candidate = new Date(start)
    while (candidate <= today) {
      candidate = new Date(candidate.getTime() + intervalDays * 86400000)
    }
  }

  if (rec.end_date && candidate > new Date(rec.end_date + 'T00:00:00')) return null

  const daysLeft = Math.ceil((candidate.getTime() - today.getTime()) / 86400000)
  return {
    date: candidate,
    daysLeft,
    day: candidate.getDate(),
    monthShort: candidate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
  }
}

export function calcUpcoming(recorrentes: RecurrenteWithCategory[], days: number): UpcomingOccurrence[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today.getTime() + days * 86400000)
  const result: UpcomingOccurrence[] = []

  for (const rec of recorrentes) {
    if (!rec.is_active || rec.is_paused) continue
    const next = calcNextOccurrence(rec)
    if (next && next.date >= today && next.date <= limit) {
      result.push({
        id: rec.id,
        name: rec.name,
        icon: rec.categories?.icon ?? (rec.type === 'income' ? '💰' : '📤'),
        type: rec.type,
        amount: rec.amount,
        frequency: rec.frequency,
        date: next.date,
        day: next.day,
        monthShort: next.monthShort,
        daysLeft: next.daysLeft,
      })
    }
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseRecorrentesReturn {
  recorrentes: RecurrenteWithCategory[]
  upcomingOccurrences: UpcomingOccurrence[]
  grouped: Partial<Record<Frequency, RecurrenteWithCategory[]>>
  loading: boolean
  error: string | null
  activeCount: number
  totalCount: number
  totalExpenseMonthly: number
  totalIncomeMonthly: number
  netMonthly: number
  totalExpenseAnnual: number
  createRecorrente: (data: RecorrenteFormData) => Promise<void>
  updateRecorrente: (id: string, data: Partial<RecorrenteFormData>) => Promise<void>
  togglePause: (id: string, currentPaused: boolean) => Promise<void>
  deleteRecorrente: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<void>
  refresh: () => void
}

export function useRecorrentes(): UseRecorrentesReturn {
  const [recorrentes, setRecorrentes] = useState<RecurrenteWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || cancelled.current) { setLoading(false); return }

    const { data, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*, categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('frequency')
      .order('day_of_month', { ascending: true, nullsFirst: false })
      .order('name')

    if (cancelled.current) return

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRecorrentes((data as unknown as RecurrenteWithCategory[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    cancelled.current = false
    fetchData()
    return () => { cancelled.current = true }
  }, [fetchData])

  const activeItems = recorrentes.filter(r => !r.is_paused)
  const activeCount = recorrentes.filter(r => r.is_active).length
  const totalCount = recorrentes.length

  const totalExpenseMonthly = activeItems
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)

  const totalIncomeMonthly = activeItems
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)

  const netMonthly = totalIncomeMonthly - totalExpenseMonthly
  const totalExpenseAnnual = totalExpenseMonthly * 12

  const grouped = recorrentes.reduce((acc, r) => {
    if (!acc[r.frequency]) acc[r.frequency] = []
    acc[r.frequency]!.push(r)
    return acc
  }, {} as Partial<Record<Frequency, RecurrenteWithCategory[]>>)

  const upcomingOccurrences = calcUpcoming(recorrentes, 30)

  const createRecorrente = useCallback(async (formData: RecorrenteFormData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase.from('recurring_transactions').insert({
      user_id: user.id,
      type: formData.type,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')),
      frequency: formData.frequency,
      day_of_month: formData.day_of_month || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      category_id: formData.category_id || null,
      notes: formData.notes || null,
      is_active: true,
      is_paused: false,
    } as any)

    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const updateRecorrente = useCallback(async (id: string, updates: Partial<RecorrenteFormData>) => {
    const supabase = createClient()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.type) payload.type = updates.type
    if (updates.name) payload.name = updates.name.trim()
    if (updates.amount) payload.amount = parseFloat(updates.amount.replace(/\./g, '').replace(',', '.'))
    if (updates.frequency) payload.frequency = updates.frequency
    if ('day_of_month' in updates) payload.day_of_month = updates.day_of_month || null
    if (updates.start_date) payload.start_date = updates.start_date
    if ('end_date' in updates) payload.end_date = updates.end_date || null
    if ('category_id' in updates) payload.category_id = updates.category_id || null
    if ('notes' in updates) payload.notes = updates.notes || null

    const { error: err } = await (createClient() as any)
      .from('recurring_transactions')
      .update(payload)
      .eq('id', id)

    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const togglePause = useCallback(async (id: string, currentPaused: boolean) => {
    const { error: err } = await (createClient() as any)
      .from('recurring_transactions')
      .update({ is_paused: !currentPaused, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const deleteRecorrente = useCallback(async (id: string) => {
    const { error: err } = await (createClient() as any)
      .from('recurring_transactions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  const markAsPaid = useCallback(async (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { error: err } = await (createClient() as any)
      .from('recurring_transactions')
      .update({ last_paid_at: today, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw new Error(err.message)
    await fetchData()
  }, [fetchData])

  return {
    recorrentes, upcomingOccurrences, grouped,
    loading, error,
    activeCount, totalCount,
    totalExpenseMonthly, totalIncomeMonthly, netMonthly, totalExpenseAnnual,
    createRecorrente, updateRecorrente, togglePause, deleteRecorrente, markAsPaid,
    refresh: fetchData,
  }
}
