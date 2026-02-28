/**
 * SyncLife — Limites de plano FREE vs PRO
 * Regras: RN-FUT-06, RN-CRP-08, RN-EXP-07, RN-MNT-08, RN-PTR-07, RN-CAR-11
 *
 * Ao implementar, usar checkPlanLimit() nos hooks de CRUD antes de criar novos itens.
 * Retorna { allowed: boolean; reason?: string } para exibir mensagem de upsell.
 */

export const PLAN_LIMITS = {
  free: {
    // 🔮 Futuro
    active_objectives: 3,       // RN-FUT-06
    goals_per_objective: 3,     // RN-FUT-08
    // ✈️ Experiências
    active_trips: 1,            // RN-EXP-07
    // 🧠 Mente
    active_study_tracks: 3,     // RN-MNT-08
    resources_per_track: 10,    // RN-MNT-22
    // 📈 Patrimônio
    portfolio_assets: 10,       // RN-PTR-07
    // 💼 Carreira
    active_roadmaps: 1,         // RN-CAR-11
    // 🏃 Corpo
    consultations_per_month: 3, // RN-CRP-08
  },
  pro: 'unlimited' as const,
} as const

export type PlanLimitKey = keyof typeof PLAN_LIMITS.free

export interface PlanLimitResult {
  allowed: boolean
  limitReached: boolean
  current: number
  limit: number | null  // null = sem limite (PRO)
  upsellMessage: string
}

const UPSELL_MESSAGES: Record<PlanLimitKey, string> = {
  active_objectives: 'O plano FREE permite até 3 objetivos ativos. Faça upgrade para PRO e tenha objetivos ilimitados.',
  goals_per_objective: 'O plano FREE permite até 3 metas por objetivo. Faça upgrade para PRO para adicionar metas ilimitadas.',
  active_trips: 'O plano FREE permite 1 viagem ativa. Faça upgrade para PRO e planeje viagens ilimitadas.',
  active_study_tracks: 'O plano FREE permite até 3 trilhas ativas. Faça upgrade para PRO e estude sem limites.',
  resources_per_track: 'O plano FREE permite até 10 recursos por trilha. Faça upgrade para PRO.',
  portfolio_assets: 'O plano FREE permite até 10 ativos na carteira. Faça upgrade para PRO e gerencie ativos ilimitados.',
  active_roadmaps: 'O plano FREE permite 1 roadmap ativo. Faça upgrade para PRO e crie até 3 roadmaps.',
  consultations_per_month: 'Você atingiu o limite de 3 consultas ativas este mês no plano FREE. Faça upgrade para PRO.',
}

/**
 * Verifica se o usuário pode criar mais um item dado o limite do plano.
 *
 * @param isPro - se o usuário tem plano PRO
 * @param limitKey - qual limite verificar (ex: 'active_objectives')
 * @param currentCount - quantos itens o usuário já tem
 * @returns PlanLimitResult com allowed=false e upsellMessage se o limite foi atingido
 *
 * @example
 * const result = checkPlanLimit(isPro, 'active_objectives', objectives.length)
 * if (!result.allowed) {
 *   toast.error(result.upsellMessage)
 *   return
 * }
 */
export function checkPlanLimit(
  isPro: boolean,
  limitKey: PlanLimitKey,
  currentCount: number,
): PlanLimitResult {
  if (isPro) {
    return { allowed: true, limitReached: false, current: currentCount, limit: null, upsellMessage: '' }
  }

  const limit = PLAN_LIMITS.free[limitKey]
  const limitReached = currentCount >= limit
  return {
    allowed: !limitReached,
    limitReached,
    current: currentCount,
    limit,
    upsellMessage: limitReached ? UPSELL_MESSAGES[limitKey] : '',
  }
}

/**
 * Componente de badge para exibir limite atingido.
 * Usar inline onde necessário:
 * <PlanLimitBadge limitKey="active_objectives" current={objectives.length} isPro={isPro} />
 */
export function getPlanLimitBadgeProps(isPro: boolean, limitKey: PlanLimitKey, currentCount: number) {
  const result = checkPlanLimit(isPro, limitKey, currentCount)
  if (isPro || !result.limitReached) return null
  return {
    message: `${currentCount}/${result.limit} — Limite FREE`,
    upsell: result.upsellMessage,
  }
}
