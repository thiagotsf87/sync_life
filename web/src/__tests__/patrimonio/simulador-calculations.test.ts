import { describe, it, expect } from 'vitest'

// ── Inline calculation functions from use-patrimonio.ts ──
// (Cannot import directly because the module triggers Supabase config init)

/** Compound interest: FV = PV × (1+r)^n + PMT × [(1+r)^n - 1] / r */
function calcFutureValue(pv: number, pmt: number, ratePerMonth: number, months: number): number {
  if (ratePerMonth === 0) return pv + pmt * months
  const factor = Math.pow(1 + ratePerMonth, months)
  return pv * factor + pmt * (factor - 1) / ratePerMonth
}

/** Months to reach target where withdrawal = passiveIncome (4% rule: target = passiveIncome * 12 / 0.04) */
function calcMonthsToIF(
  pv: number, pmt: number, annualRate: number, desiredMonthlyIncome: number
): { months: number; targetPortfolio: number } {
  const targetPortfolio = desiredMonthlyIncome * 12 / 0.04
  const monthlyRate = annualRate / 100 / 12

  if (pv >= targetPortfolio) return { months: 0, targetPortfolio }

  let months = 0
  let portfolio = pv
  while (portfolio < targetPortfolio && months < 600) {
    portfolio = portfolio * (1 + monthlyRate) + pmt
    months++
  }
  return { months, targetPortfolio }
}

function buildIFProjection(
  pv: number, pmt: number, annualRate: number, desiredIncome: number, months: number
): { month: number; pessimistic: number; base: number; optimistic: number }[] {
  const r = annualRate / 100 / 12
  const rPess = (annualRate - 2) / 100 / 12
  const rOpt = (annualRate + 2) / 100 / 12

  return Array.from({ length: Math.min(months, 360) + 1 }, (_, i) => ({
    month: i,
    pessimistic: calcFutureValue(pv, pmt, Math.max(0, rPess), i),
    base: calcFutureValue(pv, pmt, r, i),
    optimistic: calcFutureValue(pv, pmt, rOpt, i),
  }))
}

// ── Tests ──

describe('Simulador IF Calculations', () => {
  describe('calcFutureValue', () => {
    it('returns PV + PMT*n when rate is 0', () => {
      expect(calcFutureValue(10000, 1000, 0, 12)).toBe(22000)
    })

    it('handles zero contribution', () => {
      // 10000 × (1.01)^12 ≈ 11268.25
      const result = calcFutureValue(10000, 0, 0.01, 12)
      expect(result).toBeCloseTo(11268.25, 0)
    })

    it('compounds correctly with monthly contribution', () => {
      // PV=0, PMT=1000, rate=1%/month, 12 months
      // FV = 1000 × [(1.01)^12 - 1] / 0.01 ≈ 12682.50
      const result = calcFutureValue(0, 1000, 0.01, 12)
      expect(result).toBeCloseTo(12682.50, 0)
    })

    it('handles zero PV and zero PMT', () => {
      expect(calcFutureValue(0, 0, 0.01, 12)).toBe(0)
    })

    it('handles 1 month', () => {
      // PV=10000 at 1% + 1000 = 10100 + 1000 = 11100
      const result = calcFutureValue(10000, 1000, 0.01, 1)
      expect(result).toBeCloseTo(11100, 0)
    })
  })

  describe('calcMonthsToIF', () => {
    it('returns 0 months when PV already meets target', () => {
      // target = 10000 * 12 / 0.04 = 3000000
      const result = calcMonthsToIF(3000000, 1000, 12, 10000)
      expect(result.months).toBe(0)
      expect(result.targetPortfolio).toBe(3000000)
    })

    it('calculates target portfolio using 4% rule', () => {
      const result = calcMonthsToIF(0, 1000, 12, 5000)
      // target = 5000 * 12 / 0.04 = 1500000
      expect(result.targetPortfolio).toBe(1500000)
    })

    it('returns positive months for non-zero inputs', () => {
      const result = calcMonthsToIF(100000, 2000, 12, 10000)
      expect(result.months).toBeGreaterThan(0)
      expect(result.months).toBeLessThan(600) // max cap
    })

    it('higher contribution means fewer months', () => {
      const low = calcMonthsToIF(100000, 1000, 12, 10000)
      const high = calcMonthsToIF(100000, 5000, 12, 10000)
      expect(high.months).toBeLessThan(low.months)
    })

    it('higher rate means fewer months', () => {
      const low = calcMonthsToIF(100000, 2000, 8, 10000)
      const high = calcMonthsToIF(100000, 2000, 15, 10000)
      expect(high.months).toBeLessThan(low.months)
    })

    it('caps at 600 months', () => {
      // Very small contribution, very high target
      const result = calcMonthsToIF(0, 1, 0.1, 100000)
      expect(result.months).toBe(600)
    })
  })

  describe('buildIFProjection', () => {
    it('returns correct number of data points', () => {
      const projection = buildIFProjection(100000, 1000, 12, 10000, 120)
      expect(projection).toHaveLength(121) // 0 to 120
    })

    it('starts at correct PV for all scenarios', () => {
      const projection = buildIFProjection(100000, 1000, 12, 10000, 60)
      expect(projection[0].month).toBe(0)
      expect(projection[0].pessimistic).toBe(100000)
      expect(projection[0].base).toBe(100000)
      expect(projection[0].optimistic).toBe(100000)
    })

    it('has optimistic > base > pessimistic at any future month', () => {
      const projection = buildIFProjection(100000, 1000, 12, 10000, 60)
      const month30 = projection[30]
      expect(month30.optimistic).toBeGreaterThan(month30.base)
      expect(month30.base).toBeGreaterThan(month30.pessimistic)
    })

    it('caps at 360 months', () => {
      const projection = buildIFProjection(100000, 1000, 12, 10000, 500)
      expect(projection).toHaveLength(361) // capped at 360 + 1
    })

    it('all values grow over time', () => {
      const projection = buildIFProjection(100000, 1000, 12, 10000, 60)
      for (let i = 1; i < projection.length; i++) {
        expect(projection[i].base).toBeGreaterThan(projection[i - 1].base)
      }
    })
  })
})
