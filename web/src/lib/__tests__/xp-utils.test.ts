import { describe, it, expect } from 'vitest'
import {
  getXPForLevel,
  getLevelFromXP,
  getLevelTitle,
  XP_VALUES,
  LEVEL_TITLES,
} from '../xp-utils'
import type { XPAction } from '../xp-utils'

// ─── getXPForLevel ─────────────────────────────────────────────────────────────

describe('getXPForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(getXPForLevel(1)).toBe(0)
  })

  it('returns 0 for level 0 (edge case)', () => {
    expect(getXPForLevel(0)).toBe(0)
  })

  it('returns 50 for level 2 (50*(2-1)^1.5 = 50)', () => {
    expect(getXPForLevel(2)).toBe(50)
  })

  it('returns correct value for level 3 (50*(3-1)^1.5 ≈ 141)', () => {
    expect(getXPForLevel(3)).toBe(Math.round(50 * Math.pow(2, 1.5)))
  })

  it('returns correct value for level 5', () => {
    expect(getXPForLevel(5)).toBe(Math.round(50 * Math.pow(4, 1.5)))
  })

  it('returns correct value for level 10', () => {
    expect(getXPForLevel(10)).toBe(Math.round(50 * Math.pow(9, 1.5)))
  })

  it('values are monotonically increasing', () => {
    for (let i = 2; i <= 20; i++) {
      expect(getXPForLevel(i)).toBeGreaterThan(getXPForLevel(i - 1))
    }
  })
})

// ─── getLevelFromXP ────────────────────────────────────────────────────────────

describe('getLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    const result = getLevelFromXP(0)
    expect(result.level).toBe(1)
    expect(result.currentLevelXP).toBe(0)
    expect(result.nextLevelXP).toBe(50)
  })

  it('returns level 1 for 49 XP (just below level 2 threshold)', () => {
    const result = getLevelFromXP(49)
    expect(result.level).toBe(1)
    expect(result.progress).toBe(98) // 49/50 * 100 = 98
  })

  it('returns level 2 for exactly 50 XP', () => {
    const result = getLevelFromXP(50)
    expect(result.level).toBe(2)
    expect(result.currentLevelXP).toBe(50)
  })

  it('progress is 0 at level boundary', () => {
    const result = getLevelFromXP(50)
    expect(result.progress).toBe(0)
  })

  it('progress is between 0 and 100', () => {
    for (const xp of [0, 25, 50, 100, 200, 500, 1000]) {
      const result = getLevelFromXP(xp)
      expect(result.progress).toBeGreaterThanOrEqual(0)
      expect(result.progress).toBeLessThanOrEqual(100)
    }
  })

  it('handles large XP values', () => {
    const result = getLevelFromXP(10000)
    expect(result.level).toBeGreaterThan(1)
    expect(result.nextLevelXP).toBeGreaterThan(result.currentLevelXP)
  })
})

// ─── getLevelTitle ──────────────────────────────────────────────────────────────

describe('getLevelTitle', () => {
  it('returns "Iniciante" for level 1', () => {
    expect(getLevelTitle(1)).toBe('Iniciante')
  })

  it('returns "Aprendiz" for level 2', () => {
    expect(getLevelTitle(2)).toBe('Aprendiz')
  })

  it('returns "Praticante" for level 3', () => {
    expect(getLevelTitle(3)).toBe('Praticante')
  })

  it('returns "Competente" for level 4', () => {
    expect(getLevelTitle(4)).toBe('Competente')
  })

  it('returns "Habilidoso" for level 5', () => {
    expect(getLevelTitle(5)).toBe('Habilidoso')
  })

  it('returns "Experiente" for level 6', () => {
    expect(getLevelTitle(6)).toBe('Experiente')
  })

  it('returns "Avançado" for level 7', () => {
    expect(getLevelTitle(7)).toBe('Avançado')
  })

  it('returns "Expert" for level 8', () => {
    expect(getLevelTitle(8)).toBe('Expert')
  })

  it('returns "Mestre" for level 9', () => {
    expect(getLevelTitle(9)).toBe('Mestre')
  })

  it('returns "Grão-Mestre" for level 10', () => {
    expect(getLevelTitle(10)).toBe('Grão-Mestre')
  })

  it('returns "Grão-Mestre" for level >= 10', () => {
    expect(getLevelTitle(15)).toBe('Grão-Mestre')
    expect(getLevelTitle(99)).toBe('Grão-Mestre')
  })
})

// ─── LEVEL_TITLES ──────────────────────────────────────────────────────────────

describe('LEVEL_TITLES', () => {
  it('has entries for levels 1-10', () => {
    for (let i = 1; i <= 10; i++) {
      expect(LEVEL_TITLES[i]).toBeDefined()
      expect(typeof LEVEL_TITLES[i]).toBe('string')
    }
  })
})

// ─── XP_VALUES ─────────────────────────────────────────────────────────────────

describe('XP_VALUES', () => {
  it('has exactly 22 actions defined', () => {
    expect(Object.keys(XP_VALUES)).toHaveLength(22)
  })

  it('badge_unlocked grants 0 XP', () => {
    expect(XP_VALUES.badge_unlocked).toBe(0)
  })

  it('all values are non-negative integers', () => {
    for (const [, value] of Object.entries(XP_VALUES)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('streak rewards scale correctly (7 < 30 < 90 < 365)', () => {
    expect(XP_VALUES.streak_7).toBeLessThan(XP_VALUES.streak_30)
    expect(XP_VALUES.streak_30).toBeLessThan(XP_VALUES.streak_90)
    expect(XP_VALUES.streak_90).toBeLessThan(XP_VALUES.streak_365)
  })

  it('completion actions give more than creation actions', () => {
    expect(XP_VALUES.goal_completed).toBeGreaterThan(XP_VALUES.goal_created)
    expect(XP_VALUES.track_completed).toBeGreaterThan(XP_VALUES.track_created)
  })

  const ALL_ACTIONS: XPAction[] = Object.keys(XP_VALUES) as XPAction[]

  it('contains all expected actions', () => {
    for (const action of ALL_ACTIONS) {
      expect(XP_VALUES).toHaveProperty(action)
    }
  })
})
