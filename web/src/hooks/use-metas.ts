'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'
export type GoalType = 'monetary' | 'habit'

export interface Goal {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  category: string
  goal_type: GoalType
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string | null
  start_date: string
  status: GoalStatus
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  user_id: string
  amount: number
  date: string
  notes: string | null
  created_at: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  user_id: string
  name: string
  target_pct: 25 | 50 | 75 | 100
  reached_at: string | null
  created_at: string
}

export interface GoalFormData {
  name: string
  description?: string
  icon: string
  category: string
  goal_type: GoalType
  target_amount: number
  current_amount?: number
  monthly_contribution: number
  target_date?: string
  start_date?: string
  notes?: string
}

export interface MetasKpis {
  total: number
  active: number
  completed: number
  paused: number
  totalSaved: number
  totalTarget: number
  overallProgress: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function calcRingColor(goal: Goal): string {
  if (goal.status === 'completed') return '#10b981'
  if (goal.status === 'paused') return '#f59e0b'
  if (!goal.target_date) return '#10b981'

  const today = new Date()
  const start = new Date(goal.start_date)
  const target = new Date(goal.target_date)
  const totalMs = target.getTime() - start.getTime()
  const elapsedMs = today.getTime() - start.getTime()
  const timePct = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0
  const valuePct = calcProgress(goal.current_amount, goal.target_amount)

  if (valuePct >= 100) return '#10b981'
  if (timePct > 99) return '#f43f5e'
  if (timePct > 85 && valuePct < timePct) return '#f43f5e'
  if (timePct > 70 && valuePct < timePct) return '#f59e0b'
  return '#10b981'
}

export function useGradient(goal: Goal): boolean {
  return goal.status !== 'completed' && calcRingColor(goal) === '#10b981'
}

export function calcProjectedDate(
  current: number,
  target: number,
  monthly: number,
): Date | null {
  if (monthly <= 0 || current >= target) return null
  const months = Math.ceil((target - current) / monthly)
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d
}

// ── useMetas ───────────────────────────────────────────────────────────────

interface UseMetasOptions {
  status?: GoalStatus | 'all'
}

interface UseMetasReturn {
  goals: Goal[]
  kpis: MetasKpis
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: GoalFormData) => Promise<Goal>
  update: (id: string, data: Partial<GoalFormData> & { status?: GoalStatus }) => Promise<Goal>
  remove: (id: string) => Promise<void>
  addContribution: (goalId: string, amount: number, date: string, notes?: string) => Promise<void>
}

export function useMetas(options: UseMetasOptions = {}): UseMetasReturn {
  const [goals, setGoals] = useState<Goal[]>([])
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

      const sb = supabase as any
      let query = sb.from('goals').select('*').eq('user_id', user.id)

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error: err } = await query

      if (cancelled.current) return

      if (err) {
        setError(new Error(err.message))
        setIsLoading(false)
        return
      }

      setGoals((data ?? []) as Goal[])
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [options.status, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const kpis: MetasKpis = (() => {
    const active = goals.filter(g => g.status === 'active').length
    const completed = goals.filter(g => g.status === 'completed').length
    const paused = goals.filter(g => g.status === 'paused').length
    const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
    const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
    const overallProgress = calcProgress(totalSaved, totalTarget)
    return { total: goals.length, active, completed, paused, totalSaved, totalTarget, overallProgress }
  })()

  const create = useCallback(async (data: GoalFormData): Promise<Goal> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const today = new Date().toISOString().split('T')[0]
    const sb = supabase as any

    const { data: created, error: err } = await sb
      .from('goals')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description ?? null,
        icon: data.icon,
        category: data.category,
        goal_type: data.goal_type,
        target_amount: data.target_amount,
        current_amount: data.current_amount ?? 0,
        monthly_contribution: data.monthly_contribution,
        target_date: data.target_date ?? null,
        start_date: data.start_date ?? today,
        status: 'active',
        notes: data.notes ?? null,
      })
      .select('*')
      .single()

    if (err) throw new Error(err.message)

    // Criar milestones automáticos
    const goal = created as Goal
    await sb.from('goal_milestones').insert([
      { goal_id: goal.id, user_id: user.id, name: 'Primeiro quarto', target_pct: 25 },
      { goal_id: goal.id, user_id: user.id, name: 'Metade do caminho', target_pct: 50 },
      { goal_id: goal.id, user_id: user.id, name: 'Quase lá!', target_pct: 75 },
      { goal_id: goal.id, user_id: user.id, name: 'Meta concluída!', target_pct: 100 },
    ])

    refresh()
    return goal
  }, [refresh])

  const update = useCallback(async (
    id: string,
    data: Partial<GoalFormData> & { status?: GoalStatus },
  ): Promise<Goal> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description ?? null
    if (data.icon !== undefined) payload.icon = data.icon
    if (data.category !== undefined) payload.category = data.category
    if (data.goal_type !== undefined) payload.goal_type = data.goal_type
    if (data.target_amount !== undefined) payload.target_amount = data.target_amount
    if (data.current_amount !== undefined) payload.current_amount = data.current_amount
    if (data.monthly_contribution !== undefined) payload.monthly_contribution = data.monthly_contribution
    if (data.target_date !== undefined) payload.target_date = data.target_date ?? null
    if (data.start_date !== undefined) payload.start_date = data.start_date
    if (data.notes !== undefined) payload.notes = data.notes ?? null
    if (data.status !== undefined) {
      payload.status = data.status
      if (data.status === 'completed') payload.completed_at = new Date().toISOString()
    }

    const sb = supabase as any
    const { data: updated, error: err } = await sb
      .from('goals')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return updated as Goal
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await (supabase as any)
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  const addContribution = useCallback(async (
    goalId: string,
    amount: number,
    date: string,
    notes?: string,
  ): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const sb = supabase as any

    // Busca goal atual
    const { data: goal, error: gErr } = await sb
      .from('goals')
      .select('current_amount, target_amount, status')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (gErr) throw new Error(gErr.message)

    const newAmount = (goal.current_amount ?? 0) + amount

    // Insere contribuição
    const { error: cErr } = await sb
      .from('goal_contributions')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        amount,
        date,
        notes: notes ?? null,
      })

    if (cErr) throw new Error(cErr.message)

    // Atualiza current_amount na goal
    const updatePayload: Record<string, unknown> = { current_amount: newAmount }
    if (newAmount >= goal.target_amount && goal.status === 'active') {
      updatePayload.status = 'completed'
      updatePayload.completed_at = new Date().toISOString()
    }

    const { error: uErr } = await sb
      .from('goals')
      .update(updatePayload)
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (uErr) throw new Error(uErr.message)

    // Verifica milestones automáticos
    const pct = calcProgress(newAmount, goal.target_amount)
    const thresholds = [25, 50, 75, 100]
    for (const t of thresholds) {
      if (pct >= t) {
        await sb
          .from('goal_milestones')
          .update({ reached_at: new Date().toISOString() })
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .eq('target_pct', t)
          .is('reached_at', null)
      }
    }

    refresh()
  }, [refresh])

  return { goals, kpis, isLoading, error, refresh, create, update, remove, addContribution }
}

// ── useMetaDetail ──────────────────────────────────────────────────────────

interface UseMetaDetailReturn {
  goal: Goal | null
  contributions: GoalContribution[]
  milestones: GoalMilestone[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useMetaDetail(id: string): UseMetaDetailReturn {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [milestones, setMilestones] = useState<GoalMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const cancelled = useRef(false)

  useEffect(() => {
    if (!id) return
    cancelled.current = false
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) return

      const sb = supabase as any

      const [goalRes, contribRes, msRes] = await Promise.all([
        sb.from('goals').select('*').eq('id', id).eq('user_id', user.id).single(),
        sb.from('goal_contributions').select('*').eq('goal_id', id).eq('user_id', user.id).order('date', { ascending: false }),
        sb.from('goal_milestones').select('*').eq('goal_id', id).eq('user_id', user.id).order('target_pct', { ascending: true }),
      ]) as [
        { data: Goal | null; error: unknown },
        { data: GoalContribution[] | null; error: unknown },
        { data: GoalMilestone[] | null; error: unknown },
      ]

      if (cancelled.current) return

      if ((goalRes as any).error) {
        setError(new Error((goalRes as any).error.message))
        setIsLoading(false)
        return
      }

      setGoal(goalRes.data)
      setContributions(contribRes.data ?? [])
      setMilestones(msRes.data ?? [])
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [id, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return { goal, contributions, milestones, isLoading, error, refresh }
}
