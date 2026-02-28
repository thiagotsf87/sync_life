'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ObjectiveCategory =
  | 'financial' | 'health' | 'professional' | 'educational'
  | 'experience' | 'personal' | 'other'

export type ObjectivePriority = 'high' | 'medium' | 'low'
export type ObjectiveStatus = 'active' | 'paused' | 'completed' | 'archived'

export type GoalModule =
  | 'financas' | 'tempo' | 'corpo' | 'mente'
  | 'patrimonio' | 'carreira' | 'experiencias'

export type GoalIndicatorType =
  | 'monetary' | 'weight' | 'task' | 'frequency'
  | 'percentage' | 'quantity' | 'linked'

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface ObjectiveGoal {
  id: string
  objective_id: string
  user_id: string
  name: string
  target_module: GoalModule
  indicator_type: GoalIndicatorType
  target_value: number | null
  current_value: number
  initial_value: number | null
  target_unit: string | null
  weight: number
  status: GoalStatus
  progress: number
  auto_sync: boolean
  created_at: string
  updated_at: string
}

export interface ObjectiveMilestone {
  id: string
  objective_id: string
  event_type: string
  description: string
  progress_snapshot: number | null
  created_at: string
}

export interface Objective {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  category: ObjectiveCategory
  priority: ObjectivePriority
  target_date: string | null
  target_date_reason: string | null
  status: ObjectiveStatus
  completed_at: string | null
  progress: number
  created_at: string
  updated_at: string
  goals?: ObjectiveGoal[]
  milestones?: ObjectiveMilestone[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function calcObjectiveProgress(goals: ObjectiveGoal[]): number {
  if (!goals || goals.length === 0) return 0
  const active = goals.filter(g => g.status !== 'paused')
  if (active.length === 0) return 0
  const totalWeight = active.reduce((sum, g) => sum + g.weight, 0)
  if (totalWeight === 0) return 0
  const weighted = active.reduce((sum, g) => sum + g.progress * g.weight, 0)
  return Math.round(weighted / totalWeight)
}

/**
 * RN-FUT-24: Velocidade de progresso (% por dia).
 * Usa o milestone com progress_snapshot mais antigo dos últimos 30 dias como baseline.
 * Fallback: usa created_at com progress 0.
 */
export function calcProgressVelocity(
  milestones: ObjectiveMilestone[],
  createdAt: string,
  currentProgress: number,
): number {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  // Milestones com snapshot, ordenados do mais recente para o mais antigo
  const withSnapshot = milestones
    .filter(m => m.progress_snapshot !== null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Procura o milestone mais recente que tenha 30+ dias atrás (baseline)
  const baseline30 = withSnapshot.find(
    m => new Date(m.created_at).getTime() <= thirtyDaysAgo
  )

  let baseProgress = 0
  let baseTime: number

  if (baseline30 && baseline30.progress_snapshot !== null) {
    baseProgress = baseline30.progress_snapshot
    baseTime = new Date(baseline30.created_at).getTime()
  } else {
    baseTime = new Date(createdAt).getTime()
  }

  const days = Math.max(1, (now - baseTime) / (1000 * 60 * 60 * 24))
  return (currentProgress - baseProgress) / days
}

/**
 * RN-FUT-17: Cálculo de progresso por tipo de indicador.
 * Cada tipo tem uma fórmula específica.
 */
export function calcGoalProgress(
  indicatorType: GoalIndicatorType,
  currentValue: number,
  targetValue: number | null,
  initialValue: number | null,
): number {
  switch (indicatorType) {
    case 'task':
      // Binário: 0 = pendente, >0 = concluído
      return currentValue > 0 ? 100 : 0

    case 'weight': {
      // Pode ser perda OU ganho — direção definida por initialValue vs targetValue
      if (initialValue != null && targetValue != null && initialValue !== targetValue) {
        const isLosing = initialValue > targetValue
        const progress = isLosing
          ? ((initialValue - currentValue) / (initialValue - targetValue)) * 100
          : ((currentValue - initialValue) / (targetValue - initialValue)) * 100
        return Math.min(Math.max(Math.round(progress), 0), 100)
      }
      // Fallback sem initial_value
      if (!targetValue || targetValue <= 0) return 0
      return Math.min(Math.round((currentValue / targetValue) * 100), 100)
    }

    case 'frequency':
      // Frequência: X ocorrências no período / Y alvo
      if (!targetValue || targetValue <= 0) return 0
      return Math.min(Math.round((currentValue / targetValue) * 100), 100)

    case 'monetary':
    case 'quantity':
    case 'percentage': {
      // Suporta ponto de partida para metas "de X até Y"
      if (initialValue != null && targetValue != null && targetValue !== initialValue) {
        const totalChange = targetValue - initialValue
        const actualChange = currentValue - initialValue
        return Math.min(Math.max(Math.round((actualChange / totalChange) * 100), 0), 100)
      }
      if (!targetValue || targetValue <= 0) return Math.min(Math.round(currentValue), 100)
      return Math.min(Math.round((currentValue / targetValue) * 100), 100)
    }

    default:
      if (!targetValue || targetValue <= 0) return Math.min(Math.round(currentValue), 100)
      return Math.min(Math.round((currentValue / targetValue) * 100), 100)
  }
}

/**
 * RN-FUT-25: Retorna true se o ritmo atual é insuficiente para atingir 100% antes do prazo.
 */
export function isProgressAtRisk(
  velocityPerDay: number,
  currentProgress: number,
  targetDate: string | null,
): boolean {
  if (!targetDate || currentProgress >= 100) return false
  const daysLeft = (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysLeft <= 0) return currentProgress < 100
  const requiredVelocity = (100 - currentProgress) / daysLeft
  return velocityPerDay < requiredVelocity
}

export const CATEGORY_LABELS: Record<ObjectiveCategory, string> = {
  financial: 'Financeiro',
  health: 'Saúde',
  professional: 'Carreira',
  educational: 'Educação',
  experience: 'Experiências',
  personal: 'Pessoal',
  other: 'Outro',
}

export const MODULE_LABELS: Record<GoalModule, string> = {
  financas: '💰 Finanças',
  tempo: '⏳ Tempo',
  corpo: '🏃 Corpo',
  mente: '🧠 Mente',
  patrimonio: '📈 Patrimônio',
  carreira: '💼 Carreira',
  experiencias: '✈️ Experiências',
}

export const INDICATOR_LABELS: Record<GoalIndicatorType, string> = {
  monetary: 'Monetário (R$)',
  weight: 'Peso (kg)',
  task: 'Tarefa (sim/não)',
  frequency: 'Frequência (X por período)',
  percentage: 'Percentual (%)',
  quantity: 'Quantidade',
  linked: 'Vinculado a entidade',
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sb = supabase as any

      // Load objectives + goals in parallel
      const [objRes, goalsRes] = await Promise.all([
        sb.from('objectives').select('*').order('priority', { ascending: true }).order('created_at', { ascending: false }),
        sb.from('objective_goals').select('*'),
      ]) as [
        { data: Objective[] | null; error: unknown },
        { data: ObjectiveGoal[] | null; error: unknown },
      ]

      if (objRes.error) throw objRes.error
      if (goalsRes.error) throw goalsRes.error

      const objs = objRes.data ?? []
      const goals = goalsRes.data ?? []

      // Attach goals to objectives
      const enriched = objs.map(obj => ({
        ...obj,
        goals: goals.filter(g => g.objective_id === obj.id),
      }))

      setObjectives(enriched)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar objetivos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { load() }, [load])

  // ─── KPIs ────────────────────────────────────────────────────────────────────
  const active = objectives.filter(o => o.status === 'active')
  const completed = objectives.filter(o => o.status === 'completed')
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((sum, o) => sum + calcObjectiveProgress(o.goals ?? []), 0) / active.length)
    : 0

  const nextDeadline = active
    .filter(o => o.target_date)
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())[0] ?? null

  return {
    objectives,
    active,
    completed,
    avgProgress,
    nextDeadline,
    loading,
    error,
    reload: load,
  }
}

// ─── Detail Hook ──────────────────────────────────────────────────────────────

export function useObjectiveDetail(id: string) {
  const [objective, setObjective] = useState<Objective | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const sb = supabase as any
      const [objRes, goalsRes, milestonesRes] = await Promise.all([
        sb.from('objectives').select('*').eq('id', id).single(),
        sb.from('objective_goals').select('*').eq('objective_id', id).order('created_at'),
        sb.from('objective_milestones').select('*').eq('objective_id', id).order('created_at', { ascending: false }).limit(20),
      ]) as [
        { data: Objective | null; error: unknown },
        { data: ObjectiveGoal[] | null; error: unknown },
        { data: ObjectiveMilestone[] | null; error: unknown },
      ]

      if (objRes.error) throw objRes.error

      setObjective({
        ...objRes.data!,
        goals: goalsRes.data ?? [],
        milestones: milestonesRes.data ?? [],
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar objetivo'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => { load() }, [load])

  return { objective, loading, error, reload: load }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateObjectiveData {
  name: string
  description?: string
  icon?: string
  category: ObjectiveCategory
  priority: ObjectivePriority
  target_date?: string | null
  target_date_reason?: string
}

export function useCreateObjective() {
  const supabase = createClient()

  return async (data: CreateObjectiveData): Promise<Objective> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const sb = supabase as any
    const { data: obj, error } = await sb.from('objectives').insert({
      ...data,
      user_id: user.id,
      icon: data.icon ?? '🎯',
      progress: 0,
      status: 'active',
    }).select().single()

    if (error) throw error

    // Record creation milestone
    await sb.from('objective_milestones').insert({
      objective_id: obj.id,
      event_type: 'created',
      description: `Objetivo "${obj.name}" criado`,
      progress_snapshot: 0,
    })

    return obj
  }
}

export interface UpdateObjectiveData {
  name?: string
  description?: string
  icon?: string
  category?: ObjectiveCategory
  priority?: ObjectivePriority
  target_date?: string | null
  status?: ObjectiveStatus
}

export function useUpdateObjective() {
  const supabase = createClient()

  return async (id: string, data: UpdateObjectiveData): Promise<void> => {
    const sb = supabase as any
    const { error } = await sb.from('objectives').update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) throw error

    if (data.status === 'completed') {
      await sb.from('objective_milestones').insert({
        objective_id: id,
        event_type: 'objective_completed',
        description: 'Objetivo concluído!',
        progress_snapshot: 100,
      })
    } else if (data.status === 'paused') {
      await sb.from('objective_milestones').insert({
        objective_id: id,
        event_type: 'objective_paused',
        description: 'Objetivo pausado',
      })
    }
  }
}

export interface AddGoalData {
  name: string
  target_module: GoalModule
  indicator_type: GoalIndicatorType
  target_value?: number | null
  current_value?: number
  initial_value?: number | null
  target_unit?: string
  weight?: number
}

export function useAddGoal() {
  const supabase = createClient()

  return async (objectiveId: string, data: AddGoalData): Promise<ObjectiveGoal> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const sb = supabase as any
    const { data: goal, error } = await sb.from('objective_goals').insert({
      ...data,
      objective_id: objectiveId,
      user_id: user.id,
      weight: data.weight ?? 1.0,
      current_value: data.current_value ?? 0,
      progress: 0,
      status: 'active',
    }).select().single()

    if (error) throw error

    // Record milestone
    await sb.from('objective_milestones').insert({
      objective_id: objectiveId,
      goal_id: goal.id,
      event_type: 'goal_added',
      description: `Meta "${goal.name}" adicionada ao objetivo`,
    })

    return goal
  }
}

export function useUpdateGoalProgress() {
  const supabase = createClient()

  return async (
    goalId: string,
    objectiveId: string,
    currentValue: number,
    targetValue: number | null,
    indicatorType: GoalIndicatorType,
    initialValue?: number | null,  // RN-FUT-17
  ): Promise<void> => {
    const sb = supabase as any

    // RN-FUT-17: cálculo por tipo de indicador
    const progress = calcGoalProgress(indicatorType, currentValue, targetValue, initialValue ?? null)

    const isCompleted = progress >= 100
    const { error } = await sb.from('objective_goals').update({
      current_value: currentValue,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_progress_update: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', goalId)

    if (error) throw error

    if (isCompleted) {
      await sb.from('objective_milestones').insert({
        objective_id: objectiveId,
        goal_id: goalId,
        event_type: 'goal_completed',
        description: 'Meta concluída!',
        progress_snapshot: 100,
      })
    }
  }
}

export function useDeleteObjective() {
  const supabase = createClient()

  return async (id: string): Promise<void> => {
    const sb = supabase as any
    const { error } = await sb.from('objectives').delete().eq('id', id)
    if (error) throw error
  }
}

export function useDeleteGoal() {
  const supabase = createClient()

  return async (goalId: string, objectiveId: string): Promise<void> => {
    const sb = supabase as any
    await sb.from('objective_milestones').insert({
      objective_id: objectiveId,
      goal_id: goalId,
      event_type: 'goal_removed',
      description: 'Meta removida do objetivo',
    })
    const { error } = await sb.from('objective_goals').delete().eq('id', goalId)
    if (error) throw error
  }
}
