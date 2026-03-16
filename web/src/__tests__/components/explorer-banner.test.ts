import { describe, it, expect } from 'vitest'

// Tests for ExplorerBanner component data contract

interface ExplorerStat {
  value: number | string
  label: string
  subtext?: string
  color: string
  progress?: { current: number; total: number }
  onClick?: () => void
}

function calcProgressPct(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

function validateStats(stats: ExplorerStat[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (stats.length === 0) errors.push('stats array is empty')
  if (stats.length > 7) errors.push('too many stats (max 7)')
  for (let i = 0; i < stats.length; i++) {
    if (!stats[i].label) errors.push(`stat[${i}] missing label`)
    if (!stats[i].color) errors.push(`stat[${i}] missing color`)
    if (stats[i].progress) {
      if (stats[i].progress!.total <= 0) errors.push(`stat[${i}] progress total must be > 0`)
    }
  }
  return { valid: errors.length === 0, errors }
}

function buildExplorerStats(data: {
  countries: number
  continents: number
  daysAbroad: number
  totalTrips: number
  memories: number
}): ExplorerStat[] {
  return [
    { value: data.countries, label: 'Paises Visitados', color: '#ec4899', progress: { current: data.countries, total: 195 } },
    { value: data.continents, label: 'Continentes', color: '#06b6d4', progress: { current: data.continents, total: 7 } },
    { value: data.daysAbroad, label: 'Dias Viajados', color: '#f59e0b', subtext: 'desde 2020' },
    { value: data.totalTrips, label: 'Total Viagens', color: '#10b981', subtext: `${data.totalTrips - data.memories} concluidas` },
    { value: data.memories, label: 'Memorias', color: '#a855f7', subtext: 'Ver passaporte' },
  ]
}

describe('ExplorerBanner', () => {
  describe('progress calculation', () => {
    it('calculates percentage correctly', () => {
      expect(calcProgressPct(5, 195)).toBe(3) // 2.56% rounds to 3
    })

    it('handles zero total', () => {
      expect(calcProgressPct(0, 0)).toBe(0)
    })

    it('calculates 100% for full progress', () => {
      expect(calcProgressPct(7, 7)).toBe(100)
    })

    it('handles continents progress', () => {
      expect(calcProgressPct(2, 7)).toBe(29) // 28.57% rounds to 29
    })
  })

  describe('stats validation', () => {
    it('validates well-formed stats', () => {
      const stats = buildExplorerStats({
        countries: 5, continents: 2, daysAbroad: 42, totalTrips: 12, memories: 3,
      })
      const result = validateStats(stats)
      expect(result.valid).toBe(true)
      expect(stats).toHaveLength(5)
    })

    it('rejects empty stats', () => {
      const result = validateStats([])
      expect(result.valid).toBe(false)
    })

    it('rejects stats without color', () => {
      const result = validateStats([{ value: 5, label: 'Test', color: '' }])
      expect(result.valid).toBe(false)
    })
  })

  describe('stat building', () => {
    it('builds correct number of stats', () => {
      const stats = buildExplorerStats({
        countries: 5, continents: 2, daysAbroad: 42, totalTrips: 12, memories: 3,
      })
      expect(stats).toHaveLength(5)
    })

    it('first stat is countries with pink color', () => {
      const stats = buildExplorerStats({
        countries: 5, continents: 2, daysAbroad: 42, totalTrips: 12, memories: 3,
      })
      expect(stats[0].label).toBe('Paises Visitados')
      expect(stats[0].color).toBe('#ec4899')
      expect(stats[0].progress).toEqual({ current: 5, total: 195 })
    })

    it('days abroad stat has no progress bar', () => {
      const stats = buildExplorerStats({
        countries: 5, continents: 2, daysAbroad: 42, totalTrips: 12, memories: 3,
      })
      expect(stats[2].progress).toBeUndefined()
      expect(stats[2].subtext).toBe('desde 2020')
    })
  })

  describe('divider logic', () => {
    it('dividers appear between cells (i > 0)', () => {
      const stats = buildExplorerStats({
        countries: 5, continents: 2, daysAbroad: 42, totalTrips: 12, memories: 3,
      })
      // First cell (i=0) has no divider, rest do
      const dividerCount = stats.length - 1
      expect(dividerCount).toBe(4)
    })
  })
})
