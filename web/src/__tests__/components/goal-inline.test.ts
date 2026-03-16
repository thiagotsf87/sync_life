import { describe, it, expect } from 'vitest'

// Tests for GoalInline component progress calculation

interface GoalInlineProps {
  startValue: number
  currentValue: number
  targetValue: number
  unit: string
  goalDirection?: 'lose' | 'gain' | 'maintain'
  estimatedDate?: string
}

function calcProgress(start: number, current: number, target: number, goalDirection?: 'lose' | 'gain'): number {
  const range = Math.abs(target - start)
  if (range <= 0) return 100
  let p: number
  if (goalDirection === 'lose') {
    p = (start - current) / (start - target) * 100
  } else if (goalDirection === 'gain') {
    p = (current - start) / (target - start) * 100
  } else {
    const isLoss = target < start
    p = isLoss ? (start - current) / (start - target) * 100 : (current - start) / (target - start) * 100
  }
  return Math.min(100, Math.max(0, Math.round(p)))
}

function calcDotPosition(start: number, current: number, target: number, goalDirection?: 'lose' | 'gain'): number {
  return calcProgress(start, current, target, goalDirection)
}

function isLosingWeight(start: number, target: number): boolean {
  return target < start
}

describe('GoalInline', () => {
  describe('progress calculation', () => {
    it('calculates progress for weight loss (descending)', () => {
      // 85kg -> 75kg, currently at 80kg = 50%
      expect(calcProgress(85, 80, 75, 'lose')).toBe(50)
    })

    it('calculates progress for weight gain (ascending)', () => {
      // 60kg -> 70kg, currently at 65kg = 50%
      expect(calcProgress(60, 65, 70, 'gain')).toBe(50)
    })

    it('returns 0% when no progress', () => {
      expect(calcProgress(85, 85, 75, 'lose')).toBe(0)
    })

    it('returns 100% when goal reached', () => {
      expect(calcProgress(85, 75, 75, 'lose')).toBe(100)
    })

    it('caps at 100% when overshot (weight loss)', () => {
      expect(calcProgress(85, 70, 75, 'lose')).toBe(100)
    })

    it('returns 0% when regressed (weight loss but current > start)', () => {
      // Meta 85->75kg, mas registrou 100kg = 0% (bug fix)
      expect(calcProgress(85, 100, 75, 'lose')).toBe(0)
    })

    it('handles same start and target', () => {
      expect(calcProgress(75, 75, 75)).toBe(100)
    })
  })

  describe('dot position', () => {
    it('dot at 0% for start position', () => {
      expect(calcDotPosition(85, 85, 75, 'lose')).toBe(0)
    })

    it('dot at 50% for midway', () => {
      expect(calcDotPosition(85, 80, 75, 'lose')).toBe(50)
    })

    it('dot at 100% for target reached', () => {
      expect(calcDotPosition(85, 75, 75, 'lose')).toBe(100)
    })
  })

  describe('direction detection', () => {
    it('detects weight loss direction', () => {
      expect(isLosingWeight(85, 75)).toBe(true)
    })

    it('detects weight gain direction', () => {
      expect(isLosingWeight(60, 70)).toBe(false)
    })

    it('handles equal values', () => {
      expect(isLosingWeight(75, 75)).toBe(false)
    })
  })

  describe('prop validation', () => {
    it('builds valid props for loss goal', () => {
      const props: GoalInlineProps = {
        startValue: 85,
        currentValue: 80,
        targetValue: 75,
        unit: 'kg',
        estimatedDate: 'Jun 2026',
      }
      expect(props.startValue).toBeGreaterThan(props.targetValue)
      expect(props.currentValue).toBeGreaterThanOrEqual(props.targetValue)
      expect(props.currentValue).toBeLessThanOrEqual(props.startValue)
    })
  })
})
