'use client'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'pro'

export type ModuleId =
  | 'panorama' | 'financas' | 'futuro' | 'mente'
  | 'corpo' | 'experiencias' | 'carreira' | 'tempo'
  | 'patrimonio' | 'configuracoes'

export interface ModuleLimits {
  [key: string]: number | boolean | undefined
}

// ─── CHECK FUNCTIONS (MVP: always available) ────────────────────────────────

export function isFeatureAvailable(_plan: PlanType, _module: ModuleId, _feature: string): boolean {
  return true
}

export function getLimit(_plan: PlanType, _module: ModuleId, _feature: string): number {
  return Infinity
}

export function isWithinLimit(_plan: PlanType, _module: ModuleId, _feature: string, _currentCount: number): boolean {
  return true
}

// ─── HOOK (MVP: everything unlocked) ────────────────────────────────────────

export function usePlanLimits() {
  const isPro = true

  const canUse = (_module: ModuleId, _feature: string) => true

  const limit = (_module: ModuleId, _feature: string) => Infinity

  const withinLimit = (_module: ModuleId, _feature: string, _currentCount: number) => true

  return { plan: 'pro' as PlanType, isPro, loading: false, canUse, limit, withinLimit }
}
