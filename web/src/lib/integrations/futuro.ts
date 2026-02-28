import { createClient } from '@/lib/supabase/client'

type LinkedEntityType = 'study_track' | 'roadmap_step' | 'trip_budget' | 'finance_category'

/**
 * RN-CRP-19: calcula progresso de metas de peso (Futuro) a partir do peso atual.
 */
function calcWeightGoalProgress(
  currentWeight: number,
  targetValue: number | null,
  initialValue: number | null,
): number {
  if (initialValue != null && targetValue != null && initialValue !== targetValue) {
    const isLosing = initialValue > targetValue
    const progress = isLosing
      ? ((initialValue - currentWeight) / (initialValue - targetValue)) * 100
      : ((currentWeight - initialValue) / (targetValue - initialValue)) * 100
    return Math.min(Math.max(Math.round(progress), 0), 100)
  }

  if (!targetValue || targetValue <= 0) return 0
  return Math.min(Math.round((currentWeight / targetValue) * 100), 100)
}

/**
 * Sync pontual (event-driven) Corpo -> Futuro.
 * Atualiza metas de peso ativas ao registrar/editar peso no módulo Corpo.
 */
export async function syncWeightGoalsFromCorpo(userId: string, currentWeight: number): Promise<void> {
  const sb = createClient() as any

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value, initial_value')
    .eq('user_id', userId)
    .eq('indicator_type', 'weight')
    .eq('target_module', 'corpo')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : null
    const initial = goal.initial_value != null ? Number(goal.initial_value) : null
    const progress = calcWeightGoalProgress(currentWeight, target, initial)
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: currentWeight,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-37: metas de peso herdam o alvo de peso do perfil do Corpo.
 */
export async function syncWeightGoalTargetFromCorpo(
  userId: string,
  targetWeightKg: number,
  currentWeight?: number | null,
): Promise<void> {
  const sb = createClient() as any
  const nowIso = new Date().toISOString()

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, initial_value')
    .eq('user_id', userId)
    .eq('indicator_type', 'weight')
    .eq('target_module', 'corpo')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  for (const goal of goals) {
    const initial = goal.initial_value != null ? Number(goal.initial_value) : null
    const progress = typeof currentWeight === 'number'
      ? calcWeightGoalProgress(currentWeight, targetWeightKg, initial)
      : undefined
    const isCompleted = typeof progress === 'number' ? progress >= 100 : false

    await sb.from('objective_goals').update({
      target_value: targetWeightKg,
      ...(typeof progress === 'number'
        ? {
            current_value: currentWeight,
            progress,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? nowIso : null,
            last_progress_update: nowIso,
          }
        : {}),
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-39 / RN-CRP-36: metas de frequência de exercício sincronizam
 * com quantidade de atividades registradas nos últimos 7 dias.
 */
export async function syncExerciseFrequencyGoalsFromCorpo(userId: string): Promise<void> {
  const sb = createClient() as any
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceIso = since.toISOString()

  const { data: activities } = await sb
    .from('activities')
    .select('id')
    .eq('user_id', userId)
    .gte('recorded_at', sinceIso)
  const weeklyCount = (activities ?? []).length

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('indicator_type', 'frequency')
    .eq('target_module', 'corpo')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((weeklyCount / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: weeklyCount,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-40: meta vinculada a trilha herda progresso da trilha.
 * Atualiza metas com linked_entity_type='study_track' e linked_entity_id=trackId.
 */
export async function syncLinkedTrackProgressToFuturo(trackId: string, progress: number): Promise<void> {
  const sb = createClient() as any
  const { data: goals } = await sb
    .from('objective_goals')
    .select('id')
    .eq('linked_entity_type', 'study_track')
    .eq('linked_entity_id', trackId)
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const bounded = Math.min(Math.max(Math.round(progress), 0), 100)
  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const isCompleted = bounded >= 100
    await sb.from('objective_goals').update({
      current_value: bounded,
      progress: bounded,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-42: trilha concluída define meta vinculada como 100%.
 */
export async function syncLinkedTrackCompletionToFuturo(trackId: string): Promise<void> {
  await syncLinkedTrackProgressToFuturo(trackId, 100)
}

/**
 * RN-FUT-46: meta vinculada a step do roadmap herda progresso do step.
 * Atualiza metas com linked_entity_type='roadmap_step' e linked_entity_id=stepId.
 */
export async function syncLinkedRoadmapStepProgressToFuturo(stepId: string, progress: number): Promise<void> {
  const sb = createClient() as any
  const { data: goals } = await sb
    .from('objective_goals')
    .select('id')
    .eq('linked_entity_type', 'roadmap_step')
    .eq('linked_entity_id', stepId)
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const bounded = Math.min(Math.max(Math.round(progress), 0), 100)
  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const isCompleted = bounded >= 100
    await sb.from('objective_goals').update({
      current_value: bounded,
      progress: bounded,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-47: roadmap concluído define como 100% todas as metas vinculadas aos seus steps.
 */
export async function syncRoadmapCompletionToFuturo(roadmapId: string): Promise<void> {
  const sb = createClient() as any
  const { data: steps } = await sb
    .from('roadmap_steps')
    .select('id')
    .eq('roadmap_id', roadmapId)

  const stepIds = (steps ?? []).map((s: { id: string }) => s.id)
  if (stepIds.length === 0) return

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id')
    .eq('linked_entity_type', 'roadmap_step')
    .in('linked_entity_id', stepIds)
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    await sb.from('objective_goals').update({
      current_value: 100,
      progress: 100,
      status: 'completed',
      completed_at: nowIso,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-43: meta patrimônio = (patrimônio atual / alvo) × 100.
 * Atualiza metas vinculadas por linked_entity_type='portfolio_total'.
 */
export async function syncPortfolioTotalToFuturo(userId: string): Promise<void> {
  const sb = createClient() as any
  const { data: assets } = await sb
    .from('portfolio_assets')
    .select('quantity, avg_price, current_price')
    .eq('user_id', userId)

  const portfolioTotal = (assets ?? []).reduce((sum: number, a: { quantity: number; avg_price: number; current_price: number | null }) => {
    const price = a.current_price ?? a.avg_price ?? 0
    return sum + (a.quantity ?? 0) * price
  }, 0)

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('target_module', 'patrimonio')
    .eq('linked_entity_type', 'portfolio_total')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((portfolioTotal / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: portfolioTotal,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-44: meta renda passiva = (proventos médios 12m / alvo) × 100.
 * Atualiza metas vinculadas por linked_entity_type='passive_income_12m'.
 */
export async function syncPassiveIncomeToFuturo(userId: string): Promise<void> {
  const sb = createClient() as any
  const since = new Date()
  since.setMonth(since.getMonth() - 12)

  const { data: dividends } = await sb
    .from('portfolio_dividends')
    .select('total_amount, payment_date, status')
    .eq('user_id', userId)
    .eq('status', 'received')
    .gte('payment_date', since.toISOString().split('T')[0])

  const total12m = (dividends ?? []).reduce((sum: number, d: { total_amount: number }) => sum + (d.total_amount ?? 0), 0)
  const monthlyAvg = total12m / 12

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('target_module', 'patrimonio')
    .eq('linked_entity_type', 'passive_income_12m')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((monthlyAvg / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: monthlyAvg,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-48: meta de aumento salarial compara salário atual com salário alvo.
 * Convenção de vínculo: linked_entity_type='salary_increase' em metas do módulo carreira.
 */
export async function syncSalaryIncreaseToFuturo(userId: string, currentSalary: number): Promise<void> {
  const sb = createClient() as any
  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('target_module', 'carreira')
    .eq('linked_entity_type', 'salary_increase')
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((currentSalary / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: currentSalary,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-49: meta financeira de viagem usa o orçamento total da viagem.
 * Convenção de vínculo: linked_entity_type='trip_budget' e linked_entity_id=<trip_id>.
 */
export async function syncTripBudgetToFuturo(userId: string, tripId: string): Promise<void> {
  const sb = createClient() as any

  const [{ data: trip }, { data: budgetItems }] = await Promise.all([
    sb.from('trips')
      .select('id, total_budget')
      .eq('user_id', userId)
      .eq('id', tripId)
      .single(),
    sb.from('trip_budget_items')
      .select('estimated_amount')
      .eq('trip_id', tripId),
  ]) as [
    { data: { id: string; total_budget: number | null } | null; error: unknown },
    { data: { estimated_amount: number }[] | null; error: unknown },
  ]

  if (!trip) return

  const totalEstimated = (budgetItems ?? []).reduce(
    (sum: number, item: { estimated_amount: number }) => sum + (item.estimated_amount ?? 0),
    0,
  )
  const tripBudget = totalEstimated > 0 ? totalEstimated : Number(trip.total_budget ?? 0)

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('target_module', 'experiencias')
    .eq('linked_entity_type', 'trip_budget')
    .eq('linked_entity_id', tripId)
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((tripBudget / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100

    await sb.from('objective_goals').update({
      current_value: tripBudget,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-32: total da categoria financeira vinculada alimenta meta no Futuro.
 * Estratégia: soma despesas da categoria no mês corrente.
 */
export async function syncFinanceCategoryToFuturo(userId: string, categoryId: string): Promise<void> {
  const sb = createClient() as any
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

  const { data: txs } = await sb
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('type', 'expense')
    .gte('date', monthStart)
    .lte('date', monthEnd)

  const spent = (txs ?? []).reduce((sum: number, tx: { amount: number }) => sum + Number(tx.amount ?? 0), 0)

  const { data: goals } = await sb
    .from('objective_goals')
    .select('id, target_value')
    .eq('user_id', userId)
    .eq('linked_entity_type', 'finance_category')
    .eq('linked_entity_id', categoryId)
    .eq('auto_sync', true)
    .eq('status', 'active')

  if (!goals || goals.length === 0) return

  const nowIso = new Date().toISOString()
  for (const goal of goals) {
    const target = goal.target_value != null ? Number(goal.target_value) : 0
    const progress = target > 0
      ? Math.min(Math.max(Math.round((spent / target) * 100), 0), 100)
      : 0
    const isCompleted = progress >= 100
    await sb.from('objective_goals').update({
      current_value: spent,
      progress,
      status: isCompleted ? 'completed' : 'active',
      completed_at: isCompleted ? nowIso : null,
      last_progress_update: nowIso,
      updated_at: nowIso,
    }).eq('id', goal.id)
  }
}

/**
 * RN-FUT-56: ao excluir item vinculado, a meta é desvinculada (não excluída).
 * O progresso atual é preservado, e o auto_sync é desativado para congelar evolução automática.
 */
export async function unlinkGoalsFromDeletedEntity(
  userId: string,
  linkedEntityType: LinkedEntityType,
  linkedEntityIds: string[],
): Promise<void> {
  if (linkedEntityIds.length === 0) return

  const sb = createClient() as any
  const nowIso = new Date().toISOString()

  await sb
    .from('objective_goals')
    .update({
      linked_entity_type: null,
      linked_entity_id: null,
      auto_sync: false,
      updated_at: nowIso,
    })
    .eq('user_id', userId)
    .eq('linked_entity_type', linkedEntityType)
    .in('linked_entity_id', linkedEntityIds)
}

