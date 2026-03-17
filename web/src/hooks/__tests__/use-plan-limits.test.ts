import { describe, it, expect, vi } from 'vitest'

// Mock useUserPlan before importing the module under test
vi.mock('@/hooks/use-user-plan', () => ({
  useUserPlan: () => ({ plan: 'free' as const, isPro: false, isLoading: false }),
}))

import { isFeatureAvailable, getLimit, isWithinLimit } from '../use-plan-limits'
import type { PlanType, ModuleId } from '../use-plan-limits'

// ─── isFeatureAvailable ─────────────────────────────────────────────────────────

describe('isFeatureAvailable', () => {
  it('returns true for all features when plan is PRO', () => {
    expect(isFeatureAvailable('pro', 'futuro', 'checkin')).toBe(true)
    expect(isFeatureAvailable('pro', 'corpo', 'aiCardapio')).toBe(true)
    expect(isFeatureAvailable('pro', 'financas', 'aiInsights')).toBe(true)
    expect(isFeatureAvailable('pro', 'panorama', 'pdfReport')).toBe(true)
  })

  it('returns false for PRO-only features on FREE plan', () => {
    expect(isFeatureAvailable('free', 'futuro', 'checkin')).toBe(false)
    expect(isFeatureAvailable('free', 'tempo', 'timerFoco')).toBe(false)
    expect(isFeatureAvailable('free', 'experiencias', 'aiSuggestions')).toBe(false)
    expect(isFeatureAvailable('free', 'corpo', 'aiCardapio')).toBe(false)
    expect(isFeatureAvailable('free', 'corpo', 'aiCoach')).toBe(false)
    expect(isFeatureAvailable('free', 'coach' as any, 'aiCoach')).toBe(false)
    expect(isFeatureAvailable('free', 'financas', 'aiInsights')).toBe(false)
    expect(isFeatureAvailable('free', 'panorama', 'pdfReport')).toBe(false)
  })

  it('returns true for non-PRO-only features on FREE plan', () => {
    expect(isFeatureAvailable('free', 'futuro', 'objectives')).toBe(true)
    expect(isFeatureAvailable('free', 'experiencias', 'trips')).toBe(true)
    expect(isFeatureAvailable('free', 'mente', 'tracks')).toBe(true)
  })

  it('returns true for unmapped features on FREE plan', () => {
    expect(isFeatureAvailable('free', 'financas', 'transactions')).toBe(true)
  })
})

// ─── getLimit ───────────────────────────────────────────────────────────────────

describe('getLimit', () => {
  it('returns Infinity for PRO plan', () => {
    expect(getLimit('pro', 'futuro', 'objectives')).toBe(Infinity)
  })

  it('returns correct limit for FREE plan mapped features', () => {
    expect(getLimit('free', 'futuro', 'objectives')).toBe(3)
    expect(getLimit('free', 'futuro', 'goals')).toBe(3)
    expect(getLimit('free', 'experiencias', 'trips')).toBe(1)
    expect(getLimit('free', 'mente', 'tracks')).toBe(3)
    expect(getLimit('free', 'mente', 'resources')).toBe(10)
    expect(getLimit('free', 'patrimonio', 'assets')).toBe(10)
    expect(getLimit('free', 'carreira', 'roadmaps')).toBe(1)
    expect(getLimit('free', 'corpo', 'consultations')).toBe(3)
  })

  it('returns Infinity for unmapped features on FREE plan', () => {
    expect(getLimit('free', 'financas', 'transactions')).toBe(Infinity)
    expect(getLimit('free', 'tempo', 'events')).toBe(Infinity)
  })
})

// ─── isWithinLimit ──────────────────────────────────────────────────────────────

describe('isWithinLimit', () => {
  it('returns true for PRO plan regardless of count', () => {
    expect(isWithinLimit('pro', 'futuro', 'objectives', 999)).toBe(true)
  })

  it('returns true when current count is below limit', () => {
    expect(isWithinLimit('free', 'futuro', 'objectives', 2)).toBe(true)
  })

  it('returns false when current count equals limit', () => {
    expect(isWithinLimit('free', 'futuro', 'objectives', 3)).toBe(false)
  })

  it('returns false when current count exceeds limit', () => {
    expect(isWithinLimit('free', 'futuro', 'objectives', 5)).toBe(false)
  })

  it('returns true when current count is 0', () => {
    expect(isWithinLimit('free', 'experiencias', 'trips', 0)).toBe(true)
  })

  it('returns true for unmapped features even with high count', () => {
    expect(isWithinLimit('free', 'financas', 'transactions', 999)).toBe(true)
  })
})
