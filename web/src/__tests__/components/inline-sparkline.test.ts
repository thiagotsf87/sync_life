import { describe, it, expect } from 'vitest'

// Test the InlineSparkline rendering logic without DOM

function normalizeHeights(values: number[]): number[] {
  if (!values.length) return []
  const max = Math.max(...values, 1)
  return values.map(v => (v / max) * 100)
}

function calcOpacity(index: number, count: number): number {
  if (count === 1) return 1
  return 0.3 + (index / (count - 1)) * 0.7
}

describe('InlineSparkline', () => {
  describe('normalizeHeights', () => {
    it('normalizes values to 0-100 range', () => {
      const heights = normalizeHeights([10, 20, 30, 40, 50])
      expect(heights[4]).toBe(100) // max value = 100%
      expect(heights[0]).toBe(20)  // 10/50 * 100
    })

    it('handles single value', () => {
      const heights = normalizeHeights([42])
      expect(heights[0]).toBe(100) // single value = 100%
    })

    it('returns empty for empty array', () => {
      expect(normalizeHeights([])).toEqual([])
    })

    it('handles all equal values', () => {
      const heights = normalizeHeights([50, 50, 50])
      expect(heights.every(h => h === 100)).toBe(true)
    })

    it('handles all zeros (min floor of 1)', () => {
      const heights = normalizeHeights([0, 0, 0])
      expect(heights.every(h => h === 0)).toBe(true)
    })

    it('handles negative-like small values', () => {
      const heights = normalizeHeights([1, 5, 10])
      expect(heights[0]).toBe(10)
      expect(heights[1]).toBe(50)
      expect(heights[2]).toBe(100)
    })
  })

  describe('calcOpacity', () => {
    it('first bar has opacity 0.3', () => {
      expect(calcOpacity(0, 5)).toBeCloseTo(0.3)
    })

    it('last bar has opacity 1.0', () => {
      expect(calcOpacity(4, 5)).toBeCloseTo(1.0)
    })

    it('single bar has opacity 1.0', () => {
      expect(calcOpacity(0, 1)).toBe(1)
    })

    it('middle bar has intermediate opacity', () => {
      const opacity = calcOpacity(2, 5)
      expect(opacity).toBeGreaterThan(0.3)
      expect(opacity).toBeLessThan(1.0)
    })

    it('opacity increases monotonically', () => {
      const opacities = Array.from({ length: 8 }, (_, i) => calcOpacity(i, 8))
      for (let i = 1; i < opacities.length; i++) {
        expect(opacities[i]).toBeGreaterThan(opacities[i - 1])
      }
    })
  })
})
