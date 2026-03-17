import { describe, it, expect } from 'vitest'

// Mock supabase client to avoid import errors
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

import { vi } from 'vitest'
import {
  calcDeltaPct,
  generateNarrative,
  PERIOD_OPTIONS,
  PAYMENT_METHOD_LABELS,
  CAT_COLORS,
  PAGE_SIZE,
} from '../use-relatorios'
import type { PeriodStats } from '../use-relatorios'

// ─── calcDeltaPct ───────────────────────────────────────────────────────────────

describe('calcDeltaPct', () => {
  it('returns null when previous is 0', () => {
    expect(calcDeltaPct(100, 0)).toBeNull()
  })

  it('calculates positive change correctly', () => {
    expect(calcDeltaPct(150, 100)).toBe(50)
  })

  it('calculates negative change correctly', () => {
    expect(calcDeltaPct(50, 100)).toBe(-50)
  })

  it('returns 0 when values are equal', () => {
    expect(calcDeltaPct(100, 100)).toBe(0)
  })

  it('handles 100% increase', () => {
    expect(calcDeltaPct(200, 100)).toBe(100)
  })

  it('handles negative previous values correctly', () => {
    // (100 - (-50)) / abs(-50) * 100 = 300
    expect(calcDeltaPct(100, -50)).toBe(300)
  })
})

// ─── generateNarrative ──────────────────────────────────────────────────────────

describe('generateNarrative', () => {
  const fmtR = (v: number) => `R$ ${v.toFixed(2)}`

  const baseStats: PeriodStats = {
    totalRecipes: 5000,
    totalExpenses: 3000,
    totalBalance: 2000,
    avgSavingsRate: 40,
    prevTotalRecipes: 4000,
    prevTotalExpenses: 2500,
    prevTotalBalance: 1500,
    prevAvgSavingsRate: 37.5,
    txCount: 50,
    monthCount: 3,
    topGrowingCategory: null,
    topGrowthPct: 0,
    monthWithBestBalance: 'jan/24',
  }

  it('generates narrative with positive balance', () => {
    const { text, tags } = generateNarrative(baseStats, 'Trimestre', fmtR)
    expect(text).toContain('saldo positivo')
    expect(text).toContain('40.0%')
    expect(tags.some(t => t.type === 'pos' && t.text.includes('Saldo positivo'))).toBe(true)
  })

  it('generates narrative with negative balance', () => {
    const negStats = { ...baseStats, totalBalance: -500 }
    const { text, tags } = generateNarrative(negStats, 'Mês', fmtR)
    expect(text).toContain('saldo negativo')
    expect(tags.some(t => t.type === 'neg' && t.text.includes('Saldo negativo'))).toBe(true)
  })

  it('includes growing category when topGrowthPct > 10', () => {
    const stats = { ...baseStats, topGrowingCategory: 'Alimentação', topGrowthPct: 25 }
    const { text, tags } = generateNarrative(stats, 'Tri', fmtR)
    expect(text).toContain('Alimentação')
    expect(text).toContain('cresceu 25%')
    // Also adds a "neg" tag when > 15
    expect(tags.some(t => t.text.includes('Alimentação'))).toBe(true)
  })

  it('does not include growing category when topGrowthPct <= 10', () => {
    const stats = { ...baseStats, topGrowingCategory: 'Test', topGrowthPct: 5 }
    const { text } = generateNarrative(stats, 'Tri', fmtR)
    expect(text).not.toContain('Test')
  })

  it('includes expense growth when > 5%', () => {
    const stats = { ...baseStats, totalExpenses: 3000, prevTotalExpenses: 2500 }
    const { text } = generateNarrative(stats, 'Tri', fmtR)
    expect(text).toContain('Despesas cresceram')
  })

  it('adds savings rate tag based on threshold', () => {
    // Above 20%
    const { tags: goodTags } = generateNarrative({ ...baseStats, avgSavingsRate: 25 }, 'T', fmtR)
    expect(goodTags.some(t => t.text.includes('Meta de poupança atingida'))).toBe(true)

    // Below 20%
    const { tags: badTags } = generateNarrative({ ...baseStats, avgSavingsRate: 10 }, 'T', fmtR)
    expect(badTags.some(t => t.text.includes('abaixo de 20%'))).toBe(true)
  })

  it('includes best month tag', () => {
    const { tags } = generateNarrative(baseStats, 'Tri', fmtR)
    expect(tags.some(t => t.text.includes('jan/24'))).toBe(true)
  })
})

// ─── Constants ──────────────────────────────────────────────────────────────────

describe('PERIOD_OPTIONS', () => {
  it('has 6 period options', () => {
    expect(PERIOD_OPTIONS).toHaveLength(6)
  })

  it('includes all expected keys', () => {
    const keys = PERIOD_OPTIONS.map(o => o.key)
    expect(keys).toContain('mes')
    expect(keys).toContain('tri')
    expect(keys).toContain('sem')
    expect(keys).toContain('12m')
    expect(keys).toContain('ano')
    expect(keys).toContain('custom')
  })

  it('marks some options as proOnly', () => {
    const proOnly = PERIOD_OPTIONS.filter(o => o.proOnly)
    expect(proOnly.length).toBeGreaterThan(0)
  })
})

describe('PAYMENT_METHOD_LABELS', () => {
  it('has labels for all payment methods', () => {
    expect(PAYMENT_METHOD_LABELS.pix).toBe('Pix')
    expect(PAYMENT_METHOD_LABELS.credit).toBe('Crédito')
    expect(PAYMENT_METHOD_LABELS.debit).toBe('Débito')
    expect(PAYMENT_METHOD_LABELS.cash).toBe('Dinheiro')
    expect(PAYMENT_METHOD_LABELS.transfer).toBe('TED/DOC')
    expect(PAYMENT_METHOD_LABELS.boleto).toBe('Boleto')
  })
})

describe('CAT_COLORS', () => {
  it('has 8 colors', () => {
    expect(CAT_COLORS).toHaveLength(8)
  })

  it('all are valid hex colors', () => {
    for (const color of CAT_COLORS) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})

describe('PAGE_SIZE', () => {
  it('is 30', () => {
    expect(PAGE_SIZE).toBe(30)
  })
})
