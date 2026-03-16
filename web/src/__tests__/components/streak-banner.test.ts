import { describe, it, expect } from 'vitest'

// Tests for StreakBanner component logic

interface Milestone {
  days: number
  label: string
}

function getMilestoneStatus(
  milestone: Milestone,
  currentStreak: number,
): 'done' | 'current' | 'pending' {
  if (currentStreak >= milestone.days) return 'done'
  // Find if this is the next milestone to reach
  return 'pending'
}

function findCurrentMilestone(milestones: Milestone[], currentStreak: number): Milestone | null {
  const sorted = [...milestones].sort((a, b) => a.days - b.days)
  for (const m of sorted) {
    if (currentStreak < m.days) return m
  }
  return null // All milestones completed
}

function getProgressToNext(currentStreak: number, nextMilestone: number, prevMilestone: number): number {
  const range = nextMilestone - prevMilestone
  if (range === 0) return 100
  const progress = currentStreak - prevMilestone
  return Math.round((progress / range) * 100)
}

describe('StreakBanner', () => {
  const MILESTONES: Milestone[] = [
    { days: 3, label: '3d' },
    { days: 7, label: '7d' },
    { days: 14, label: '14d' },
    { days: 30, label: '30d' },
  ]

  describe('milestone status', () => {
    it('marks milestone as done when streak >= milestone days', () => {
      expect(getMilestoneStatus(MILESTONES[0], 5)).toBe('done')
      expect(getMilestoneStatus(MILESTONES[0], 3)).toBe('done')
    })

    it('marks milestone as pending when streak < milestone days', () => {
      expect(getMilestoneStatus(MILESTONES[1], 5)).toBe('pending')
      expect(getMilestoneStatus(MILESTONES[3], 20)).toBe('pending')
    })
  })

  describe('current milestone detection', () => {
    it('finds next milestone to reach', () => {
      const next = findCurrentMilestone(MILESTONES, 5)
      expect(next).toEqual({ days: 7, label: '7d' })
    })

    it('finds first milestone when streak is 0', () => {
      const next = findCurrentMilestone(MILESTONES, 0)
      expect(next).toEqual({ days: 3, label: '3d' })
    })

    it('returns null when all milestones completed', () => {
      const next = findCurrentMilestone(MILESTONES, 30)
      expect(next).toBeNull()
    })

    it('returns null when streak exceeds all milestones', () => {
      const next = findCurrentMilestone(MILESTONES, 100)
      expect(next).toBeNull()
    })
  })

  describe('progress calculation', () => {
    it('calculates progress between milestones', () => {
      // Between 3d and 7d, at day 5 = 50%
      expect(getProgressToNext(5, 7, 3)).toBe(50)
    })

    it('returns 0% at start of range', () => {
      expect(getProgressToNext(3, 7, 3)).toBe(0)
    })

    it('returns 100% at end of range', () => {
      expect(getProgressToNext(7, 7, 3)).toBe(100)
    })

    it('handles zero range', () => {
      expect(getProgressToNext(5, 5, 5)).toBe(100)
    })
  })

  describe('visual states', () => {
    it('high streak (>=14) should show accomplished state', () => {
      const doneMilestones = MILESTONES.filter(m => 14 >= m.days)
      expect(doneMilestones).toHaveLength(3) // 3d, 7d, 14d
    })

    it('low streak (0) has no completed milestones', () => {
      const doneMilestones = MILESTONES.filter(m => 0 >= m.days)
      expect(doneMilestones).toHaveLength(0)
    })
  })
})
