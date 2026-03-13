import { describe, it, expect } from 'vitest'
import {
  clamp,
  getScoreLabel,
  getScoreColor,
  WEIGHTS,
  monthStart,
  monthEnd,
  weekAgo,
  quarterAgo,
} from '../score-utils'
import type { ModuleKey } from '../score-utils'

// ─── clamp ─────────────────────────────────────────────────────────────────────

describe('clamp', () => {
  it('returns 0 for negative values', () => {
    expect(clamp(-10)).toBe(0)
    expect(clamp(-0.5)).toBe(0)
  })

  it('returns 0 for zero', () => {
    expect(clamp(0)).toBe(0)
  })

  it('returns value for values between 0 and 100', () => {
    expect(clamp(50)).toBe(50)
    expect(clamp(1)).toBe(1)
    expect(clamp(99.99)).toBe(99.99)
  })

  it('returns 100 for values above 100', () => {
    expect(clamp(101)).toBe(100)
    expect(clamp(999)).toBe(100)
  })

  it('rounds to 2 decimal places', () => {
    expect(clamp(33.3333)).toBe(33.33)
    expect(clamp(66.6666)).toBe(66.67)
    expect(clamp(0.005)).toBe(0.01)
  })

  it('handles edge case 100 exactly', () => {
    expect(clamp(100)).toBe(100)
  })
})

// ─── getScoreLabel ─────────────────────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns "Iniciante" for score 0', () => {
    expect(getScoreLabel(0)).toBe('Iniciante')
  })

  it('returns "Iniciante" for score 20 (boundary)', () => {
    expect(getScoreLabel(20)).toBe('Iniciante')
  })

  it('returns "Em construção" for score 21', () => {
    expect(getScoreLabel(21)).toBe('Em construção')
  })

  it('returns "Em construção" for score 40 (boundary)', () => {
    expect(getScoreLabel(40)).toBe('Em construção')
  })

  it('returns "Regular" for score 41', () => {
    expect(getScoreLabel(41)).toBe('Regular')
  })

  it('returns "Regular" for score 60 (boundary)', () => {
    expect(getScoreLabel(60)).toBe('Regular')
  })

  it('returns "Consistente" for score 61', () => {
    expect(getScoreLabel(61)).toBe('Consistente')
  })

  it('returns "Consistente" for score 80 (boundary)', () => {
    expect(getScoreLabel(80)).toBe('Consistente')
  })

  it('returns "Excelente" for score 81', () => {
    expect(getScoreLabel(81)).toBe('Excelente')
  })

  it('returns "Excelente" for score 100', () => {
    expect(getScoreLabel(100)).toBe('Excelente')
  })
})

// ─── getScoreColor ─────────────────────────────────────────────────────────────

describe('getScoreColor', () => {
  it('returns red (#f43f5e) for score 0', () => {
    expect(getScoreColor(0)).toBe('#f43f5e')
  })

  it('returns red for score 20 (boundary)', () => {
    expect(getScoreColor(20)).toBe('#f43f5e')
  })

  it('returns orange (#f97316) for score 21', () => {
    expect(getScoreColor(21)).toBe('#f97316')
  })

  it('returns orange for score 40 (boundary)', () => {
    expect(getScoreColor(40)).toBe('#f97316')
  })

  it('returns yellow (#f59e0b) for score 41', () => {
    expect(getScoreColor(41)).toBe('#f59e0b')
  })

  it('returns yellow for score 60 (boundary)', () => {
    expect(getScoreColor(60)).toBe('#f59e0b')
  })

  it('returns indigo (#6366f1) for score 61', () => {
    expect(getScoreColor(61)).toBe('#6366f1')
  })

  it('returns indigo for score 80 (boundary)', () => {
    expect(getScoreColor(80)).toBe('#6366f1')
  })

  it('returns green (#10b981) for score 81', () => {
    expect(getScoreColor(81)).toBe('#10b981')
  })

  it('returns green for score 100', () => {
    expect(getScoreColor(100)).toBe('#10b981')
  })
})

// ─── WEIGHTS ───────────────────────────────────────────────────────────────────

describe('WEIGHTS', () => {
  it('has exactly 8 modules', () => {
    expect(Object.keys(WEIGHTS)).toHaveLength(8)
  })

  it('contains all expected modules', () => {
    const expected: ModuleKey[] = ['financas', 'futuro', 'corpo', 'mente', 'patrimonio', 'carreira', 'tempo', 'experiencias']
    for (const mod of expected) {
      expect(WEIGHTS).toHaveProperty(mod)
    }
  })

  it('weights sum to 1.0', () => {
    const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0, 10)
  })

  it('all weights are positive', () => {
    for (const w of Object.values(WEIGHTS)) {
      expect(w).toBeGreaterThan(0)
    }
  })
})

// ─── Date helpers ──────────────────────────────────────────────────────────────

describe('monthStart', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(monthStart()).toMatch(/^\d{4}-\d{2}-01$/)
  })

  it('day is always 01', () => {
    expect(monthStart().endsWith('-01')).toBe(true)
  })
})

describe('monthEnd', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(monthEnd()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('day is between 28 and 31', () => {
    const day = parseInt(monthEnd().split('-')[2])
    expect(day).toBeGreaterThanOrEqual(28)
    expect(day).toBeLessThanOrEqual(31)
  })
})

describe('weekAgo', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(weekAgo()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('is approximately 7 days before today', () => {
    const wa = new Date(weekAgo())
    const today = new Date()
    const diff = Math.round((today.getTime() - wa.getTime()) / 86400000)
    expect(diff).toBeGreaterThanOrEqual(6)
    expect(diff).toBeLessThanOrEqual(8)
  })
})

describe('quarterAgo', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(quarterAgo()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('is approximately 3 months before today', () => {
    const qa = new Date(quarterAgo())
    const today = new Date()
    const monthDiff = (today.getFullYear() - qa.getFullYear()) * 12 + (today.getMonth() - qa.getMonth())
    expect(monthDiff).toBeGreaterThanOrEqual(2)
    expect(monthDiff).toBeLessThanOrEqual(4)
  })
})
