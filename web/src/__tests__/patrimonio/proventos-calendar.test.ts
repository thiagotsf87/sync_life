import { describe, it, expect } from 'vitest'

// ── Inline logic from proventos/page.tsx ──

interface Dividend {
  id: string
  asset_id: string
  ticker: string
  payment_date: string
  total_amount: number
  status: 'received' | 'projected'
}

function groupByMonth(dividends: Dividend[], year: number): Record<number, { total: number; count: number; items: Dividend[] }> {
  const groups: Record<number, { total: number; count: number; items: Dividend[] }> = {}
  for (let m = 0; m < 12; m++) {
    groups[m] = { total: 0, count: 0, items: [] }
  }
  for (const d of dividends) {
    const date = new Date(d.payment_date)
    if (date.getFullYear() === year) {
      const month = date.getMonth()
      groups[month].total += d.total_amount
      groups[month].count++
      groups[month].items.push(d)
    }
  }
  return groups
}

function getTopPagadores(dividends: Dividend[]): Array<{ ticker: string; total: number }> {
  const byTicker: Record<string, number> = {}
  for (const d of dividends) {
    byTicker[d.ticker] = (byTicker[d.ticker] ?? 0) + d.total_amount
  }
  return Object.entries(byTicker)
    .map(([ticker, total]) => ({ ticker, total }))
    .sort((a, b) => b.total - a.total)
}

function getBestYoC(
  dividends: Dividend[],
  assets: Array<{ ticker: string; quantity: number; avg_price: number }>
): Array<{ ticker: string; yoc: number }> {
  const byTicker: Record<string, number> = {}
  for (const d of dividends) {
    byTicker[d.ticker] = (byTicker[d.ticker] ?? 0) + d.total_amount
  }
  return assets
    .map(a => {
      const invested = a.quantity * a.avg_price
      const divs = byTicker[a.ticker] ?? 0
      return { ticker: a.ticker, yoc: invested > 0 ? (divs / invested) * 100 : 0 }
    })
    .filter(x => x.yoc > 0)
    .sort((a, b) => b.yoc - a.yoc)
}

// ── Test Data ──

const DIVIDENDS: Dividend[] = [
  { id: '1', asset_id: 'a1', ticker: 'PETR4', payment_date: '2026-01-15', total_amount: 150, status: 'received' },
  { id: '2', asset_id: 'a1', ticker: 'PETR4', payment_date: '2026-04-15', total_amount: 200, status: 'received' },
  { id: '3', asset_id: 'a1', ticker: 'PETR4', payment_date: '2026-07-15', total_amount: 180, status: 'projected' },
  { id: '4', asset_id: 'a2', ticker: 'HGLG11', payment_date: '2026-01-10', total_amount: 50, status: 'received' },
  { id: '5', asset_id: 'a2', ticker: 'HGLG11', payment_date: '2026-02-10', total_amount: 52, status: 'received' },
  { id: '6', asset_id: 'a2', ticker: 'HGLG11', payment_date: '2026-03-10', total_amount: 48, status: 'received' },
  { id: '7', asset_id: 'a3', ticker: 'VALE3', payment_date: '2025-06-20', total_amount: 300, status: 'received' },
]

const ASSETS = [
  { ticker: 'PETR4', quantity: 100, avg_price: 30 },   // invested: 3000
  { ticker: 'HGLG11', quantity: 20, avg_price: 160 },  // invested: 3200
  { ticker: 'VALE3', quantity: 50, avg_price: 60 },     // invested: 3000
]

// ── Tests ──

describe('Proventos Calendar', () => {
  describe('groupByMonth', () => {
    it('groups dividends into 12 months', () => {
      const grouped = groupByMonth(DIVIDENDS, 2026)
      expect(Object.keys(grouped)).toHaveLength(12)
    })

    it('sums total for January correctly', () => {
      const grouped = groupByMonth(DIVIDENDS, 2026)
      // Jan: PETR4 150 + HGLG11 50 = 200
      expect(grouped[0].total).toBe(200)
      expect(grouped[0].count).toBe(2)
    })

    it('handles months with no dividends', () => {
      const grouped = groupByMonth(DIVIDENDS, 2026)
      // December has no dividends
      expect(grouped[11].total).toBe(0)
      expect(grouped[11].count).toBe(0)
    })

    it('excludes dividends from other years', () => {
      const grouped = groupByMonth(DIVIDENDS, 2026)
      // VALE3 dividend from 2025 should not be included
      const totalAll = Object.values(grouped).reduce((s, g) => s + g.total, 0)
      expect(totalAll).toBe(150 + 200 + 180 + 50 + 52 + 48) // 680
    })

    it('includes both received and projected', () => {
      const grouped = groupByMonth(DIVIDENDS, 2026)
      // July has projected PETR4 = 180
      expect(grouped[6].total).toBe(180)
    })
  })

  describe('getTopPagadores', () => {
    it('sorts by total descending', () => {
      const top = getTopPagadores(DIVIDENDS)
      expect(top[0].ticker).toBe('PETR4')   // 150 + 200 + 180 = 530
      expect(top[1].ticker).toBe('VALE3')    // 300
      expect(top[2].ticker).toBe('HGLG11')   // 50 + 52 + 48 = 150
    })

    it('aggregates by ticker', () => {
      const top = getTopPagadores(DIVIDENDS)
      const petr = top.find(t => t.ticker === 'PETR4')!
      expect(petr.total).toBe(530)
    })

    it('returns all tickers', () => {
      const top = getTopPagadores(DIVIDENDS)
      expect(top).toHaveLength(3)
    })
  })

  describe('getBestYoC', () => {
    it('calculates YoC correctly', () => {
      const best = getBestYoC(DIVIDENDS, ASSETS)
      // PETR4: 530 / 3000 × 100 = 17.67%
      const petr = best.find(b => b.ticker === 'PETR4')!
      expect(petr.yoc).toBeCloseTo(17.67, 1)
    })

    it('sorts by YoC descending', () => {
      const best = getBestYoC(DIVIDENDS, ASSETS)
      expect(best[0].ticker).toBe('PETR4') // highest YoC
    })

    it('excludes tickers with 0 dividends', () => {
      const assetsWithExtra = [...ASSETS, { ticker: 'XPML11', quantity: 10, avg_price: 100 }]
      const best = getBestYoC(DIVIDENDS, assetsWithExtra)
      expect(best.find(b => b.ticker === 'XPML11')).toBeUndefined()
    })

    it('handles 0 invested amount', () => {
      const assetsZero = [{ ticker: 'FREE', quantity: 0, avg_price: 0 }]
      const divs: Dividend[] = [
        { id: '10', asset_id: 'x', ticker: 'FREE', payment_date: '2026-01-01', total_amount: 100, status: 'received' },
      ]
      const best = getBestYoC(divs, assetsZero)
      // invested = 0 → yoc = 0 → filtered out
      expect(best).toHaveLength(0)
    })
  })
})
