import { describe, it, expect } from 'vitest'
import {
  PLAN_LIMITS,
  checkPlanLimit,
  getPlanLimitBadgeProps,
} from '../plan-limits'
import type { PlanLimitKey } from '../plan-limits'

// ─── PLAN_LIMITS constants ──────────────────────────────────────────────────────

describe('PLAN_LIMITS', () => {
  it('has free limits for all expected keys', () => {
    const expectedKeys: PlanLimitKey[] = [
      'active_objectives',
      'goals_per_objective',
      'active_trips',
      'active_study_tracks',
      'resources_per_track',
      'portfolio_assets',
      'active_roadmaps',
      'consultations_per_month',
    ]
    for (const key of expectedKeys) {
      expect(PLAN_LIMITS.free[key]).toBeTypeOf('number')
      expect(PLAN_LIMITS.free[key]).toBeGreaterThan(0)
    }
  })

  it('pro is "unlimited"', () => {
    expect(PLAN_LIMITS.pro).toBe('unlimited')
  })

  it('free limits have correct values per spec', () => {
    expect(PLAN_LIMITS.free.active_objectives).toBe(3)
    expect(PLAN_LIMITS.free.goals_per_objective).toBe(3)
    expect(PLAN_LIMITS.free.active_trips).toBe(1)
    expect(PLAN_LIMITS.free.active_study_tracks).toBe(3)
    expect(PLAN_LIMITS.free.resources_per_track).toBe(10)
    expect(PLAN_LIMITS.free.portfolio_assets).toBe(10)
    expect(PLAN_LIMITS.free.active_roadmaps).toBe(1)
    expect(PLAN_LIMITS.free.consultations_per_month).toBe(3)
  })
})

// ─── checkPlanLimit ─────────────────────────────────────────────────────────────

describe('checkPlanLimit', () => {
  it('always allows for PRO users regardless of count', () => {
    const result = checkPlanLimit(true, 'active_objectives', 999)
    expect(result.allowed).toBe(true)
    expect(result.limitReached).toBe(false)
    expect(result.limit).toBeNull()
    expect(result.upsellMessage).toBe('')
  })

  it('allows FREE user below limit', () => {
    const result = checkPlanLimit(false, 'active_objectives', 2)
    expect(result.allowed).toBe(true)
    expect(result.limitReached).toBe(false)
    expect(result.current).toBe(2)
    expect(result.limit).toBe(3)
    expect(result.upsellMessage).toBe('')
  })

  it('blocks FREE user at limit', () => {
    const result = checkPlanLimit(false, 'active_objectives', 3)
    expect(result.allowed).toBe(false)
    expect(result.limitReached).toBe(true)
    expect(result.current).toBe(3)
    expect(result.limit).toBe(3)
    expect(result.upsellMessage).toContain('upgrade')
  })

  it('blocks FREE user above limit', () => {
    const result = checkPlanLimit(false, 'active_objectives', 5)
    expect(result.allowed).toBe(false)
    expect(result.limitReached).toBe(true)
  })

  it('works for all limit keys', () => {
    const keys: PlanLimitKey[] = [
      'active_objectives', 'goals_per_objective', 'active_trips',
      'active_study_tracks', 'resources_per_track', 'portfolio_assets',
      'active_roadmaps', 'consultations_per_month',
    ]
    for (const key of keys) {
      const limit = PLAN_LIMITS.free[key]
      // Below limit: allowed
      const below = checkPlanLimit(false, key, limit - 1)
      expect(below.allowed).toBe(true)
      // At limit: blocked
      const at = checkPlanLimit(false, key, limit)
      expect(at.allowed).toBe(false)
      expect(at.upsellMessage.length).toBeGreaterThan(0)
    }
  })

  it('returns upsell message only when limit reached', () => {
    const below = checkPlanLimit(false, 'active_trips', 0)
    expect(below.upsellMessage).toBe('')

    const at = checkPlanLimit(false, 'active_trips', 1)
    expect(at.upsellMessage).toContain('viagem')
  })
})

// ─── getPlanLimitBadgeProps ─────────────────────────────────────────────────────

describe('getPlanLimitBadgeProps', () => {
  it('returns null for PRO users', () => {
    expect(getPlanLimitBadgeProps(true, 'active_objectives', 10)).toBeNull()
  })

  it('returns null for FREE user below limit', () => {
    expect(getPlanLimitBadgeProps(false, 'active_objectives', 1)).toBeNull()
  })

  it('returns badge props for FREE user at limit', () => {
    const result = getPlanLimitBadgeProps(false, 'active_objectives', 3)
    expect(result).not.toBeNull()
    expect(result!.message).toContain('3/3')
    expect(result!.message).toContain('Limite FREE')
    expect(result!.upsell).toContain('upgrade')
  })

  it('returns badge props for FREE user above limit', () => {
    const result = getPlanLimitBadgeProps(false, 'active_trips', 5)
    expect(result).not.toBeNull()
    expect(result!.message).toContain('5/1')
  })
})
