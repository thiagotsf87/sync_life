import { describe, it, expect } from 'vitest'

// ── Inline calculation logic from patrimonio/page.tsx ──

function calcHealthScore(
  numClasses: number,
  profitLossPct: number,
  dividendYield: number
): number {
  const diversScore = Math.min(numClasses * 12, 40)
  const resultScore = profitLossPct > 0 ? Math.min(profitLossPct * 2, 30) : 0
  const yieldScore = Math.min(dividendYield * 5, 30)
  return Math.round(diversScore + resultScore + yieldScore)
}

function getAlertText(numClasses: number, assetsLen: number): string {
  if (numClasses < 3) {
    return `Carteira concentrada em ${numClasses} classe${numClasses > 1 ? 's' : ''}. Diversifique.`
  }
  return `${assetsLen} ativos em ${numClasses} classes. Boa diversificação.`
}

function getTopAssets(
  assets: Array<{ id: string; quantity: number; avg_price: number; current_price: number | null }>
) {
  return [...assets]
    .sort((a, b) => {
      const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
      const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
      return vb - va
    })
    .slice(0, 5)
}

// ── Tests ──

describe('Patrimônio Dashboard Calculations', () => {
  describe('calcHealthScore', () => {
    it('returns 0 when everything is zero', () => {
      expect(calcHealthScore(0, 0, 0)).toBe(0)
    })

    it('caps diversification at 40', () => {
      // 4 classes × 12 = 48 → capped at 40
      expect(calcHealthScore(4, 0, 0)).toBe(40)
    })

    it('caps result score at 30', () => {
      // profit 20% × 2 = 40 → capped at 30
      expect(calcHealthScore(0, 20, 0)).toBe(30)
    })

    it('ignores negative profit', () => {
      expect(calcHealthScore(0, -10, 0)).toBe(0)
    })

    it('caps yield score at 30', () => {
      // yield 8% × 5 = 40 → capped at 30
      expect(calcHealthScore(0, 0, 8)).toBe(30)
    })

    it('sums all components correctly', () => {
      // 2 classes → 24, profit 5% → 10, yield 2% → 10
      expect(calcHealthScore(2, 5, 2)).toBe(44)
    })

    it('maxes out at 100', () => {
      // 4 classes → 40, profit 20% → 30, yield 8% → 30 = 100
      expect(calcHealthScore(4, 20, 8)).toBe(100)
    })
  })

  describe('getAlertText', () => {
    it('warns about concentration with 1 class', () => {
      expect(getAlertText(1, 5)).toBe('Carteira concentrada em 1 classe. Diversifique.')
    })

    it('warns about concentration with 2 classes', () => {
      expect(getAlertText(2, 10)).toBe('Carteira concentrada em 2 classes. Diversifique.')
    })

    it('shows positive message with 3+ classes', () => {
      expect(getAlertText(3, 8)).toBe('8 ativos em 3 classes. Boa diversificação.')
    })

    it('shows positive message with 5 classes', () => {
      expect(getAlertText(5, 15)).toBe('15 ativos em 5 classes. Boa diversificação.')
    })
  })

  describe('getTopAssets (top 5 sorting)', () => {
    const assets = [
      { id: '1', quantity: 100, avg_price: 10, current_price: 15 },   // 1500
      { id: '2', quantity: 50, avg_price: 20, current_price: 25 },    // 1250
      { id: '3', quantity: 200, avg_price: 5, current_price: null },   // 1000 (uses avg)
      { id: '4', quantity: 10, avg_price: 100, current_price: 200 },  // 2000
      { id: '5', quantity: 500, avg_price: 1, current_price: 3 },     // 1500
      { id: '6', quantity: 1, avg_price: 50, current_price: 50 },     // 50
      { id: '7', quantity: 300, avg_price: 10, current_price: 12 },   // 3600
    ]

    it('returns only 5 items', () => {
      expect(getTopAssets(assets)).toHaveLength(5)
    })

    it('sorts by position descending', () => {
      const top = getTopAssets(assets)
      expect(top[0].id).toBe('7') // 3600
      expect(top[1].id).toBe('4') // 2000
    })

    it('uses avg_price when current_price is null', () => {
      const top = getTopAssets(assets)
      // asset 3 has no current_price → position = 200 × 5 = 1000
      // Top 5 by position: 7(3600), 4(2000), 1(1500), 5(1500), 2(1250) → 3(1000) is 6th
      const ids = top.map(a => a.id)
      // asset 3 (1000) is NOT in top 5, but asset 6 (50) is definitely NOT
      expect(ids).not.toContain('6') // 50 is excluded
      // Verify the ordering handles null price correctly — sorted after 1250
      const allSorted = [...assets]
        .sort((a, b) => {
          const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
          const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
          return vb - va
        })
      const asset3Idx = allSorted.findIndex(a => a.id === '3')
      expect(asset3Idx).toBe(5) // 6th position (index 5)
    })
  })
})
