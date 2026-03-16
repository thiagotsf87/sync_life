import { describe, it, expect } from 'vitest'

// Tests for ActivityHeatmap component data contract

interface HeatmapDay {
  date: string // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4
}

function calcLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes === 0) return 0
  if (minutes <= 15) return 1
  if (minutes <= 30) return 2
  if (minutes <= 60) return 3
  return 4
}

function getOpacity(level: 0 | 1 | 2 | 3 | 4): number {
  const map: Record<number, number> = { 0: 0.06, 1: 0.2, 2: 0.4, 3: 0.65, 4: 1 }
  return map[level]
}

function buildGrid(days: HeatmapDay[]): HeatmapDay[][] {
  // 7 columns x 4 rows = 28 cells
  const rows: HeatmapDay[][] = []
  for (let r = 0; r < 4; r++) {
    rows.push(days.slice(r * 7, (r + 1) * 7))
  }
  return rows
}

describe('ActivityHeatmap', () => {
  describe('level calculation', () => {
    it('returns 0 for no activity', () => {
      expect(calcLevel(0)).toBe(0)
    })

    it('returns 1 for light activity (<=15 min)', () => {
      expect(calcLevel(5)).toBe(1)
      expect(calcLevel(15)).toBe(1)
    })

    it('returns 2 for moderate activity (<=30 min)', () => {
      expect(calcLevel(20)).toBe(2)
      expect(calcLevel(30)).toBe(2)
    })

    it('returns 3 for high activity (<=60 min)', () => {
      expect(calcLevel(45)).toBe(3)
      expect(calcLevel(60)).toBe(3)
    })

    it('returns 4 for intense activity (>60 min)', () => {
      expect(calcLevel(90)).toBe(4)
      expect(calcLevel(120)).toBe(4)
    })
  })

  describe('opacity mapping', () => {
    it('maps level 0 to lowest opacity', () => {
      expect(getOpacity(0)).toBe(0.06)
    })

    it('maps level 4 to full opacity', () => {
      expect(getOpacity(4)).toBe(1)
    })

    it('opacity increases with level', () => {
      for (let i = 0; i < 4; i++) {
        expect(getOpacity((i + 1) as 0 | 1 | 2 | 3 | 4))
          .toBeGreaterThan(getOpacity(i as 0 | 1 | 2 | 3 | 4))
      }
    })
  })

  describe('grid building', () => {
    it('creates 4 rows of 7 from 28 days', () => {
      const days: HeatmapDay[] = Array.from({ length: 28 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        level: (i % 5) as 0 | 1 | 2 | 3 | 4,
      }))
      const grid = buildGrid(days)
      expect(grid).toHaveLength(4)
      expect(grid[0]).toHaveLength(7)
      expect(grid[3]).toHaveLength(7)
    })

    it('handles fewer than 28 days', () => {
      const days: HeatmapDay[] = Array.from({ length: 14 }, (_, i) => ({
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        level: 0 as const,
      }))
      const grid = buildGrid(days)
      expect(grid).toHaveLength(4)
      expect(grid[0]).toHaveLength(7)
      expect(grid[1]).toHaveLength(7)
      expect(grid[2]).toHaveLength(0)
    })
  })
})
