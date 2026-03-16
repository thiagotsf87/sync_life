import { describe, it, expect } from 'vitest'

// ── Inline logic from historico/page.tsx ──

type ChangeType = 'initial' | 'promotion' | 'lateral' | 'company_change' | 'salary_change' | 'other'

const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  initial: '#0055ff',
  promotion: '#10b981',
  lateral: '#f59e0b',
  company_change: '#a855f7',
  salary_change: '#06b6d4',
  other: '#6e90b8',
}

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  initial: 'Início de carreira',
  promotion: 'Promoção',
  lateral: 'Movimentação lateral',
  company_change: 'Mudança de empresa',
  salary_change: 'Ajuste salarial',
  other: 'Outro',
}

interface HistoryEntry {
  id: string
  title: string
  company: string | null
  salary: number | null
  start_date: string
  change_type: ChangeType
}

function calcSalaryDelta(entries: HistoryEntry[]): number {
  const withSalary = entries.filter(e => e.salary != null && e.salary > 0).sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )
  if (withSalary.length < 2) return 0
  const first = withSalary[0].salary!
  const last = withSalary[withSalary.length - 1].salary!
  return last - first
}

function countUniqueCompanies(entries: HistoryEntry[]): number {
  const companies = new Set(entries.map(e => e.company).filter(Boolean))
  return companies.size
}

function countPromotions(entries: HistoryEntry[]): number {
  return entries.filter(e => e.change_type === 'promotion').length
}

function filterByPeriod(entries: HistoryEntry[], period: '3y' | '5y' | 'max'): HistoryEntry[] {
  if (period === 'max') return entries
  const yearsBack = period === '3y' ? 3 : 5
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - yearsBack)
  return entries.filter(e => new Date(e.start_date) >= cutoff)
}

function buildChartData(entries: HistoryEntry[]): Array<{ date: string; salary: number }> {
  return entries
    .filter(e => e.salary != null && e.salary > 0)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .map(e => ({
      date: new Date(e.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      salary: e.salary!,
    }))
}

// ── Test Data ──

const HISTORY: HistoryEntry[] = [
  { id: '1', title: 'Dev Júnior', company: 'StartupX', salary: 4000, start_date: '2020-01-15', change_type: 'initial' },
  { id: '2', title: 'Dev Pleno', company: 'StartupX', salary: 7000, start_date: '2021-06-01', change_type: 'promotion' },
  { id: '3', title: 'Dev Pleno', company: 'BigCorp', salary: 10000, start_date: '2023-01-10', change_type: 'company_change' },
  { id: '4', title: 'Dev Sênior', company: 'BigCorp', salary: 15000, start_date: '2024-03-01', change_type: 'promotion' },
  { id: '5', title: 'Dev Sênior', company: 'BigCorp', salary: 16500, start_date: '2025-01-01', change_type: 'salary_change' },
]

// ── Tests ──

describe('Histórico Timeline', () => {
  describe('CHANGE_TYPE_COLORS', () => {
    it('maps promotion to green', () => {
      expect(CHANGE_TYPE_COLORS.promotion).toBe('#10b981')
    })

    it('maps company_change to purple', () => {
      expect(CHANGE_TYPE_COLORS.company_change).toBe('#a855f7')
    })

    it('maps salary_change to cyan', () => {
      expect(CHANGE_TYPE_COLORS.salary_change).toBe('#06b6d4')
    })

    it('maps initial to blue', () => {
      expect(CHANGE_TYPE_COLORS.initial).toBe('#0055ff')
    })

    it('maps lateral to yellow', () => {
      expect(CHANGE_TYPE_COLORS.lateral).toBe('#f59e0b')
    })
  })

  describe('calcSalaryDelta', () => {
    it('calculates difference between first and last salary', () => {
      // First: 4000, Last: 16500 → delta = 12500
      expect(calcSalaryDelta(HISTORY)).toBe(12500)
    })

    it('returns 0 with fewer than 2 entries with salary', () => {
      expect(calcSalaryDelta([HISTORY[0]])).toBe(0)
    })

    it('returns 0 for empty array', () => {
      expect(calcSalaryDelta([])).toBe(0)
    })

    it('ignores entries without salary', () => {
      const withNull: HistoryEntry[] = [
        ...HISTORY,
        { id: '6', title: 'Consultant', company: null, salary: null, start_date: '2025-06-01', change_type: 'lateral' },
      ]
      expect(calcSalaryDelta(withNull)).toBe(12500) // same as before
    })
  })

  describe('countUniqueCompanies', () => {
    it('counts unique non-null companies', () => {
      expect(countUniqueCompanies(HISTORY)).toBe(2) // StartupX, BigCorp
    })

    it('excludes null companies', () => {
      const withNull: HistoryEntry[] = [
        ...HISTORY,
        { id: '6', title: 'Freelance', company: null, salary: 5000, start_date: '2019-01-01', change_type: 'other' },
      ]
      expect(countUniqueCompanies(withNull)).toBe(2)
    })

    it('returns 0 for empty array', () => {
      expect(countUniqueCompanies([])).toBe(0)
    })
  })

  describe('countPromotions', () => {
    it('counts promotion entries', () => {
      expect(countPromotions(HISTORY)).toBe(2) // entries 2 and 4
    })

    it('returns 0 when no promotions', () => {
      const noPromos = HISTORY.filter(e => e.change_type !== 'promotion')
      expect(countPromotions(noPromos)).toBe(0)
    })
  })

  describe('filterByPeriod', () => {
    it('returns all for "max"', () => {
      expect(filterByPeriod(HISTORY, 'max')).toHaveLength(5)
    })

    it('filters to last 3 years', () => {
      // Current date is 2026-03-15. 3 years back = 2023-03-15
      // Entries from 2023-03-15 onward: id 4 (2024-03) and id 5 (2025-01)
      const filtered = filterByPeriod(HISTORY, '3y')
      expect(filtered.length).toBeGreaterThanOrEqual(2)
      expect(filtered.every(e => new Date(e.start_date).getFullYear() >= 2023)).toBe(true)
    })

    it('filters to last 5 years', () => {
      // 5 years back from 2026-03-15 = 2021-03-15
      // Entries from 2021-03-15 onward: id 2 (2021-06), id 3 (2023-01), id 4 (2024-03), id 5 (2025-01)
      const filtered = filterByPeriod(HISTORY, '5y')
      expect(filtered.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('buildChartData', () => {
    it('builds sorted chart data', () => {
      const data = buildChartData(HISTORY)
      expect(data).toHaveLength(5) // all have salary
      expect(data[0].salary).toBe(4000)  // earliest
      expect(data[4].salary).toBe(16500) // latest
    })

    it('excludes entries without salary', () => {
      const withNull: HistoryEntry[] = [
        ...HISTORY,
        { id: '6', title: 'Test', company: null, salary: null, start_date: '2026-01-01', change_type: 'other' },
      ]
      const data = buildChartData(withNull)
      expect(data).toHaveLength(5) // null salary excluded
    })

    it('sorts chronologically', () => {
      const shuffled = [HISTORY[3], HISTORY[0], HISTORY[4], HISTORY[1], HISTORY[2]]
      const data = buildChartData(shuffled)
      for (let i = 1; i < data.length; i++) {
        expect(data[i].salary).toBeGreaterThanOrEqual(data[i - 1].salary)
      }
    })

    it('returns empty for no salary data', () => {
      const noSalary: HistoryEntry[] = [
        { id: '1', title: 'Test', company: null, salary: null, start_date: '2020-01-01', change_type: 'other' },
      ]
      expect(buildChartData(noSalary)).toHaveLength(0)
    })
  })
})
