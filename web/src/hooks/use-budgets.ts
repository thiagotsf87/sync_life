'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Budget {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
  alert_threshold: number
  rollover: boolean
  notes: string | null
  is_active: boolean
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

export interface BudgetWithSpend extends Budget {
  gasto: number
  pct: number
  isActive: boolean
}

export interface EnvelopeFormData {
  category_id: string
  amount: number
  month: number
  year: number
  alert_threshold: number
  rollover: boolean
  notes?: string
}

interface UseBudgetsReturn {
  budgets: BudgetWithSpend[]
  activeBudgets: BudgetWithSpend[]
  inactiveBudgets: BudgetWithSpend[]
  totalOrcado: number
  totalGasto: number
  naoAlocado: number
  receitasMes: number
  monthlyIncome: number
  qtdOk: number
  qtdAlert: number
  qtdOver: number
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: EnvelopeFormData) => Promise<Budget>
  update: (id: string, data: Partial<EnvelopeFormData>) => Promise<Budget>
  remove: (id: string) => Promise<void>
  copyFromPreviousMonth: (sourceIds: string[]) => Promise<void>
  prevMonthBudgets: Budget[]
}

export function useBudgets({ month, year }: { month: number; year: number }): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([])
  const [receitasMes, setReceitasMes] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [prevMonthBudgets, setPrevMonthBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) return

      const monthStr = String(month).padStart(2, '0')
      const startDate = `${year}-${monthStr}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      // Parallel: budgets, spends, receitas, profile, prev month budgets
      const [budgetsRes, spendsRes, receitasRes, profileRes, prevBudgetsRes] = await Promise.all([
        supabase
          .from('budgets')
          .select('*, category:categories(id, name, icon, color)')
          .eq('user_id', user.id)
          .eq('month', month)
          .eq('year', year),
        supabase
          .from('transactions')
          .select('category_id, amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .eq('is_future', false)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .eq('is_future', false)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('profiles')
          .select('monthly_income')
          .eq('id', user.id)
          .single(),
        // Prev month budgets for "copy" feature
        (async () => {
          const prevM = month === 1 ? 12 : month - 1
          const prevY = month === 1 ? year - 1 : year
          return supabase
            .from('budgets')
            .select('*, category:categories(id, name, icon, color)')
            .eq('user_id', user.id)
            .eq('month', prevM)
            .eq('year', prevY)
        })(),
      ])

      if (cancelled.current) return

      if (budgetsRes.error) {
        setError(new Error(budgetsRes.error.message))
        setIsLoading(false)
        return
      }

      // Build spend map
      const spendMap = new Map<string, number>()
      for (const s of (spendsRes.data ?? []) as { category_id: string; amount: number }[]) {
        spendMap.set(s.category_id, (spendMap.get(s.category_id) ?? 0) + s.amount)
      }

      const recTotal = (receitasRes.data ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)
      const income = (profileRes.data as any)?.monthly_income ?? 0

      // Prev month budgets for rollover calc
      const prevBudgetsData = (prevBudgetsRes.data ?? []) as unknown as Budget[]
      const prevSpendRes = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .eq('is_future', false)
        .gte('date', (() => {
          const pm = month === 1 ? 12 : month - 1
          const py = month === 1 ? year - 1 : year
          return `${py}-${String(pm).padStart(2, '0')}-01`
        })())
        .lte('date', (() => {
          const pm = month === 1 ? 12 : month - 1
          const py = month === 1 ? year - 1 : year
          return new Date(py, pm, 0).toISOString().split('T')[0]
        })())

      if (cancelled.current) return

      const prevSpendMap = new Map<string, number>()
      for (const s of (prevSpendRes.data ?? []) as { category_id: string; amount: number }[]) {
        prevSpendMap.set(s.category_id, (prevSpendMap.get(s.category_id) ?? 0) + s.amount)
      }

      // Map prev budgets by category for rollover
      const prevBudgetByCat = new Map<string, Budget>()
      for (const pb of prevBudgetsData) {
        prevBudgetByCat.set(pb.category_id, pb)
      }

      // Enrich budgets with spend + rollover
      const enriched: BudgetWithSpend[] = (budgetsRes.data ?? []).map((b) => {
        const raw = b as unknown as Budget
        let effectiveAmount = raw.amount

        // Apply rollover if enabled
        if (raw.rollover) {
          const prevBudget = prevBudgetByCat.get(raw.category_id)
          if (prevBudget) {
            const prevSpend = prevSpendMap.get(raw.category_id) ?? 0
            const leftover = Math.max(0, prevBudget.amount - prevSpend)
            effectiveAmount = raw.amount + leftover
          }
        }

        const gasto = spendMap.get(raw.category_id) ?? 0
        const pct = effectiveAmount > 0 ? Math.round((gasto / effectiveAmount) * 100) : 0

        return {
          ...raw,
          amount: effectiveAmount,
          gasto,
          pct,
          isActive: gasto > 0,
        }
      })

      // Sort: active first (highest % first), then inactive
      enriched.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1
        if (!a.isActive && b.isActive) return 1
        return b.pct - a.pct
      })

      setBudgets(enriched)
      setReceitasMes(recTotal)
      setMonthlyIncome(income)
      setPrevMonthBudgets(prevBudgetsData)
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [month, year, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const create = useCallback(async (data: EnvelopeFormData): Promise<Budget> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: created, error: err } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: data.category_id,
        amount: data.amount,
        month: data.month,
        year: data.year,
        alert_threshold: data.alert_threshold ?? 80,
        rollover: data.rollover ?? false,
        notes: data.notes ?? null,
        is_active: true,
      } as any)
      .select('*, category:categories(id, name, icon, color)')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return created as unknown as Budget
  }, [refresh])

  const update = useCallback(async (id: string, data: Partial<EnvelopeFormData>): Promise<Budget> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload: Record<string, unknown> = {}
    if (data.category_id !== undefined) payload.category_id = data.category_id
    if (data.amount !== undefined) payload.amount = data.amount
    if (data.alert_threshold !== undefined) payload.alert_threshold = data.alert_threshold
    if (data.rollover !== undefined) payload.rollover = data.rollover
    if ('notes' in data) payload.notes = data.notes ?? null

    const { data: updated, error: err } = await (supabase as any)
      .from('budgets')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, category:categories(id, name, icon, color)')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return updated as unknown as Budget
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  const copyFromPreviousMonth = useCallback(async (sourceIds: string[]): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const sourceBudgets = prevMonthBudgets.filter(b => sourceIds.includes(b.id))
    if (!sourceBudgets.length) return

    // Check existing in target month
    const { data: existing } = await supabase
      .from('budgets')
      .select('category_id')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .in('category_id', sourceBudgets.map(b => b.category_id))

    const existingCatIds = new Set((existing ?? []).map((e: any) => e.category_id))

    const toInsert = sourceBudgets
      .filter(b => !existingCatIds.has(b.category_id))
      .map(b => ({
        user_id: user.id,
        category_id: b.category_id,
        amount: b.amount,
        month,
        year,
        alert_threshold: b.alert_threshold,
        rollover: b.rollover,
        notes: b.notes,
        is_active: true,
      }))

    if (toInsert.length > 0) {
      const { error: err } = await supabase.from('budgets').insert(toInsert as any)
      if (err) throw new Error(err.message)
    }
    refresh()
  }, [prevMonthBudgets, month, year, refresh])

  const activeBudgets = budgets.filter(b => b.isActive)
  const inactiveBudgets = budgets.filter(b => !b.isActive)
  const totalOrcado = budgets.reduce((s, b) => s + b.amount, 0)
  const totalGasto = budgets.reduce((s, b) => s + b.gasto, 0)
  const naoAlocado = receitasMes - totalOrcado
  const qtdOk = budgets.filter(b => b.pct > 0 && b.pct < 60).length
  const qtdAlert = budgets.filter(b => b.pct >= 60 && b.pct < 100).length
  const qtdOver = budgets.filter(b => b.pct >= 100).length

  return {
    budgets, activeBudgets, inactiveBudgets,
    totalOrcado, totalGasto, naoAlocado, receitasMes, monthlyIncome,
    qtdOk, qtdAlert, qtdOver,
    isLoading, error, refresh,
    create, update, remove, copyFromPreviousMonth,
    prevMonthBudgets,
  }
}
