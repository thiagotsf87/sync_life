'use client'

import { useUserPlan } from '@/hooks/use-user-plan'
import { PLAN_LIMITS, type PlanLimitKey } from '@/lib/plan-limits'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'pro'

export type ModuleId =
  | 'panorama' | 'financas' | 'futuro' | 'mente'
  | 'corpo' | 'experiencias' | 'carreira' | 'tempo'
  | 'patrimonio' | 'configuracoes'

export interface ModuleLimits {
  [key: string]: number | boolean | undefined
}

// ─── FEATURE MAP ────────────────────────────────────────────────────────────

/** Maps "module:feature" → PlanLimitKey from plan-limits.ts */
const FEATURE_MAP: Record<string, PlanLimitKey> = {
  'futuro:objectives': 'active_objectives',
  'futuro:goals': 'goals_per_objective',
  'experiencias:trips': 'active_trips',
  'mente:tracks': 'active_study_tracks',
  'mente:resources': 'resources_per_track',
  'patrimonio:assets': 'portfolio_assets',
  'carreira:roadmaps': 'active_roadmaps',
  'corpo:consultations': 'consultations_per_month',
}

/** Features that are entirely PRO-only (on/off, not countable) */
const PRO_ONLY_FEATURES = new Set([
  'futuro:checkin',
  'tempo:timerFoco',
  'experiencias:aiSuggestions',
  'corpo:aiCardapio',
  'financas:aiInsights',
])

// ─── STANDALONE FUNCTIONS ───────────────────────────────────────────────────

function resolveKey(module: ModuleId, feature: string): string {
  return `${module}:${feature}`
}

export function isFeatureAvailable(plan: PlanType, module: ModuleId, feature: string): boolean {
  if (plan === 'pro') return true
  const key = resolveKey(module, feature)
  if (PRO_ONLY_FEATURES.has(key)) return false
  return true
}

export function getLimit(plan: PlanType, module: ModuleId, feature: string): number {
  if (plan === 'pro') return Infinity
  const key = resolveKey(module, feature)
  const limitKey = FEATURE_MAP[key]
  if (!limitKey) return Infinity
  return PLAN_LIMITS.free[limitKey]
}

export function isWithinLimit(plan: PlanType, module: ModuleId, feature: string, currentCount: number): boolean {
  if (plan === 'pro') return true
  const max = getLimit(plan, module, feature)
  return currentCount < max
}

// ─── HOOK ───────────────────────────────────────────────────────────────────

export function usePlanLimits() {
  const { plan, isPro, isLoading } = useUserPlan()

  const canUse = (module: ModuleId, feature: string) =>
    isFeatureAvailable(plan, module, feature)

  const limit = (module: ModuleId, feature: string) =>
    getLimit(plan, module, feature)

  const withinLimit = (module: ModuleId, feature: string, currentCount: number) =>
    isWithinLimit(plan, module, feature, currentCount)

  return {
    plan: plan as PlanType,
    isPro,
    loading: isLoading,
    canUse,
    limit,
    withinLimit,
  }
}
