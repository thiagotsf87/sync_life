import { describe, it, expect } from 'vitest'

// ── Inline sort/filter logic from carteira/page.tsx ──

interface Asset {
  id: string
  ticker: string
  asset_name: string
  asset_class: string
  quantity: number
  avg_price: number
  current_price: number | null
}

type SortOption = 'position_desc' | 'result_desc' | 'ticker_asc'

function sortAssets(assets: Asset[], sortBy: SortOption): Asset[] {
  const list = [...assets]
  switch (sortBy) {
    case 'position_desc':
      return list.sort((a, b) => {
        const posA = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
        const posB = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
        return posB - posA
      })
    case 'result_desc':
      return list.sort((a, b) => {
        const resA = a.current_price != null ? (a.current_price - a.avg_price) * a.quantity : 0
        const resB = b.current_price != null ? (b.current_price - b.avg_price) * b.quantity : 0
        return resB - resA
      })
    case 'ticker_asc':
      return list.sort((a, b) => a.ticker.localeCompare(b.ticker))
    default:
      return list
  }
}

function filterAssets(
  assets: Asset[],
  filterClass: string | 'all',
  search: string
): Asset[] {
  return assets.filter(a => {
    const matchClass = filterClass === 'all' || a.asset_class === filterClass
    const matchSearch = !search || a.ticker.toLowerCase().includes(search.toLowerCase()) || a.asset_name.toLowerCase().includes(search.toLowerCase())
    return matchClass && matchSearch
  })
}

// ── Test Data ──

const ASSETS: Asset[] = [
  { id: '1', ticker: 'PETR4', asset_name: 'Petrobras PN', asset_class: 'stocks_br', quantity: 100, avg_price: 30, current_price: 35 },
  { id: '2', ticker: 'VALE3', asset_name: 'Vale ON', asset_class: 'stocks_br', quantity: 50, avg_price: 60, current_price: 55 },
  { id: '3', ticker: 'HGLG11', asset_name: 'CSHG Logística', asset_class: 'fiis', quantity: 20, avg_price: 160, current_price: 170 },
  { id: '4', ticker: 'AAPL34', asset_name: 'Apple BDR', asset_class: 'bdrs', quantity: 10, avg_price: 50, current_price: null },
  { id: '5', ticker: 'BTC', asset_name: 'Bitcoin', asset_class: 'crypto', quantity: 0.5, avg_price: 200000, current_price: 350000 },
]

// ── Tests ──

describe('Carteira Sorting', () => {
  describe('sortAssets', () => {
    it('sorts by position descending', () => {
      const sorted = sortAssets(ASSETS, 'position_desc')
      // BTC: 0.5 × 350k = 175k → first
      // PETR4: 100 × 35 = 3500
      // HGLG11: 20 × 170 = 3400
      // VALE3: 50 × 55 = 2750
      // AAPL34: 10 × 50 = 500 (uses avg_price)
      expect(sorted[0].ticker).toBe('BTC')
      expect(sorted[1].ticker).toBe('PETR4')
      expect(sorted[4].ticker).toBe('AAPL34')
    })

    it('sorts by result descending', () => {
      const sorted = sortAssets(ASSETS, 'result_desc')
      // BTC: (350k - 200k) × 0.5 = 75000
      // PETR4: (35-30) × 100 = 500
      // HGLG11: (170-160) × 20 = 200
      // AAPL34: null current_price → result = 0
      // VALE3: (55-60) × 50 = -250
      expect(sorted[0].ticker).toBe('BTC')
      expect(sorted[1].ticker).toBe('PETR4')
      expect(sorted[sorted.length - 1].ticker).toBe('VALE3')
    })

    it('sorts by ticker alphabetically', () => {
      const sorted = sortAssets(ASSETS, 'ticker_asc')
      expect(sorted[0].ticker).toBe('AAPL34')
      expect(sorted[1].ticker).toBe('BTC')
      expect(sorted[4].ticker).toBe('VALE3')
    })

    it('treats null current_price as 0 result', () => {
      const sorted = sortAssets(ASSETS, 'result_desc')
      const aapl = sorted.find(a => a.ticker === 'AAPL34')!
      const idx = sorted.indexOf(aapl)
      // Should not be first (result = 0), but should be above negative results
      expect(idx).toBeGreaterThan(2) // after BTC, PETR4, HGLG11
    })
  })

  describe('filterAssets', () => {
    it('returns all when filter is "all" and no search', () => {
      expect(filterAssets(ASSETS, 'all', '')).toHaveLength(5)
    })

    it('filters by asset class', () => {
      const result = filterAssets(ASSETS, 'stocks_br', '')
      expect(result).toHaveLength(2)
      expect(result.every(a => a.asset_class === 'stocks_br')).toBe(true)
    })

    it('filters by search on ticker (case insensitive)', () => {
      const result = filterAssets(ASSETS, 'all', 'petr')
      expect(result).toHaveLength(1)
      expect(result[0].ticker).toBe('PETR4')
    })

    it('filters by search on asset_name', () => {
      const result = filterAssets(ASSETS, 'all', 'Bitcoin')
      expect(result).toHaveLength(1)
      expect(result[0].ticker).toBe('BTC')
    })

    it('combines class + search filters', () => {
      const result = filterAssets(ASSETS, 'stocks_br', 'vale')
      expect(result).toHaveLength(1)
      expect(result[0].ticker).toBe('VALE3')
    })

    it('returns empty when nothing matches', () => {
      expect(filterAssets(ASSETS, 'fiis', 'btc')).toHaveLength(0)
    })
  })
})
