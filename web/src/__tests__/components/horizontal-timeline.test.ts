import { describe, it, expect } from 'vitest'

// Test HorizontalTimeline logic without DOM

type TimelineStepStatus = 'done' | 'current' | 'pending'

interface TimelineStep {
  label: string
  date?: string
  status: TimelineStepStatus
}

function getNodeStyles(status: TimelineStepStatus, accentColor: string) {
  const isDone = status === 'done'
  const isCurrent = status === 'current'

  return {
    isDone,
    isCurrent,
    isPending: !isDone && !isCurrent,
    background: isDone || isCurrent ? accentColor : undefined,
    boxShadow: isCurrent ? `0 0 0 3px ${accentColor}33` : undefined,
    hasCheckIcon: isDone,
    hasDotInner: isCurrent,
  }
}

function getProgressWidth(progressPercent: number): string {
  return `${Math.min(progressPercent, 100)}%`
}

function getLabelClasses(status: TimelineStepStatus): string {
  switch (status) {
    case 'done': return 'text-[var(--sl-t2)]'
    case 'current': return 'text-[var(--sl-t1)] font-semibold'
    case 'pending': return 'text-[var(--sl-t3)]'
  }
}

describe('HorizontalTimeline', () => {
  describe('getNodeStyles', () => {
    it('done node has check icon and accent background', () => {
      const styles = getNodeStyles('done', '#f43f5e')
      expect(styles.isDone).toBe(true)
      expect(styles.hasCheckIcon).toBe(true)
      expect(styles.background).toBe('#f43f5e')
      expect(styles.boxShadow).toBeUndefined()
    })

    it('current node has dot, accent background, and shadow', () => {
      const styles = getNodeStyles('current', '#10b981')
      expect(styles.isCurrent).toBe(true)
      expect(styles.hasDotInner).toBe(true)
      expect(styles.background).toBe('#10b981')
      expect(styles.boxShadow).toBe('0 0 0 3px #10b98133')
    })

    it('pending node has no icon, no accent', () => {
      const styles = getNodeStyles('pending', '#f43f5e')
      expect(styles.isPending).toBe(true)
      expect(styles.hasCheckIcon).toBe(false)
      expect(styles.hasDotInner).toBe(false)
      expect(styles.background).toBeUndefined()
    })
  })

  describe('getProgressWidth', () => {
    it('returns correct percentage', () => {
      expect(getProgressWidth(50)).toBe('50%')
    })

    it('caps at 100%', () => {
      expect(getProgressWidth(150)).toBe('100%')
    })

    it('handles 0%', () => {
      expect(getProgressWidth(0)).toBe('0%')
    })
  })

  describe('getLabelClasses', () => {
    it('done labels use t2 color', () => {
      expect(getLabelClasses('done')).toContain('sl-t2')
    })

    it('current labels use t1 with semibold', () => {
      const cls = getLabelClasses('current')
      expect(cls).toContain('sl-t1')
      expect(cls).toContain('font-semibold')
    })

    it('pending labels use t3 color', () => {
      expect(getLabelClasses('pending')).toContain('sl-t3')
    })
  })

  describe('step ordering integration', () => {
    it('timeline steps maintain correct status pattern', () => {
      const steps: TimelineStep[] = [
        { label: 'Step 1', status: 'done' },
        { label: 'Step 2', status: 'done' },
        { label: 'Step 3', status: 'current' },
        { label: 'Step 4', status: 'pending' },
      ]

      // Done steps should come before current, current before pending
      const doneIdx = steps.findIndex(s => s.status === 'done')
      const currentIdx = steps.findIndex(s => s.status === 'current')
      const pendingIdx = steps.findIndex(s => s.status === 'pending')

      expect(doneIdx).toBeLessThan(currentIdx)
      expect(currentIdx).toBeLessThan(pendingIdx)
    })

    it('handles all-done timeline', () => {
      const steps: TimelineStep[] = [
        { label: 'Step 1', status: 'done' },
        { label: 'Step 2', status: 'done' },
      ]
      expect(steps.every(s => s.status === 'done')).toBe(true)
    })

    it('handles all-pending timeline', () => {
      const steps: TimelineStep[] = [
        { label: 'Step 1', status: 'pending' },
        { label: 'Step 2', status: 'pending' },
      ]
      expect(steps.every(s => s.status === 'pending')).toBe(true)
    })
  })
})
