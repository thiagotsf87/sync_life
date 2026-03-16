import { describe, it, expect } from 'vitest'

// Test the SegmentedBar rendering logic without DOM

interface SegmentedBarConfig {
  level: number
  maxLevel: number
  color: string
}

function getSegments(config: SegmentedBarConfig): Array<{ filled: boolean; background: string }> {
  return Array.from({ length: config.maxLevel }, (_, i) => ({
    filled: i < config.level,
    background: i < config.level ? config.color : 'var(--sl-s3)',
  }))
}

describe('SegmentedBar', () => {
  describe('getSegments', () => {
    it('fills correct number of segments for level=3, maxLevel=5', () => {
      const segments = getSegments({ level: 3, maxLevel: 5, color: '#f43f5e' })
      expect(segments).toHaveLength(5)
      expect(segments.filter(s => s.filled)).toHaveLength(3)
    })

    it('fills all segments when level equals maxLevel', () => {
      const segments = getSegments({ level: 5, maxLevel: 5, color: '#10b981' })
      expect(segments.every(s => s.filled)).toBe(true)
    })

    it('fills no segments when level is 0', () => {
      const segments = getSegments({ level: 0, maxLevel: 5, color: '#f43f5e' })
      expect(segments.every(s => !s.filled)).toBe(true)
    })

    it('uses provided color for filled segments', () => {
      const segments = getSegments({ level: 2, maxLevel: 5, color: '#0055ff' })
      expect(segments[0].background).toBe('#0055ff')
      expect(segments[1].background).toBe('#0055ff')
      expect(segments[2].background).toBe('var(--sl-s3)')
    })

    it('respects custom maxLevel', () => {
      const segments = getSegments({ level: 3, maxLevel: 10, color: '#f43f5e' })
      expect(segments).toHaveLength(10)
      expect(segments.filter(s => s.filled)).toHaveLength(3)
    })

    it('works with maxLevel=1', () => {
      const segmentsFilled = getSegments({ level: 1, maxLevel: 1, color: '#f43f5e' })
      expect(segmentsFilled).toHaveLength(1)
      expect(segmentsFilled[0].filled).toBe(true)

      const segmentsEmpty = getSegments({ level: 0, maxLevel: 1, color: '#f43f5e' })
      expect(segmentsEmpty[0].filled).toBe(false)
    })
  })
})
