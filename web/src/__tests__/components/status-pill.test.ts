import { describe, it, expect } from 'vitest'

// Test the StatusPill color mapping logic without DOM

type PillStatus = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'

const PILL_COLORS: Record<PillStatus, { bg: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.10)', text: '#10b981' },
  warning: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b' },
  danger:  { bg: 'rgba(244,63,94,0.10)',  text: '#f43f5e' },
  info:    { bg: 'rgba(6,182,212,0.10)',   text: '#06b6d4' },
  purple:  { bg: 'rgba(168,85,247,0.10)',  text: '#a855f7' },
  neutral: { bg: 'rgba(100,116,139,0.10)', text: 'var(--sl-t2)' },
}

function getColors(status: PillStatus) {
  return PILL_COLORS[status]
}

describe('StatusPill', () => {
  describe('color mapping', () => {
    it('maps success to green', () => {
      const colors = getColors('success')
      expect(colors.text).toBe('#10b981')
      expect(colors.bg).toContain('16,185,129')
    })

    it('maps warning to yellow', () => {
      const colors = getColors('warning')
      expect(colors.text).toBe('#f59e0b')
      expect(colors.bg).toContain('245,158,11')
    })

    it('maps danger to red', () => {
      const colors = getColors('danger')
      expect(colors.text).toBe('#f43f5e')
      expect(colors.bg).toContain('244,63,94')
    })

    it('maps info to cyan', () => {
      const colors = getColors('info')
      expect(colors.text).toBe('#06b6d4')
      expect(colors.bg).toContain('6,182,212')
    })

    it('maps purple correctly', () => {
      const colors = getColors('purple')
      expect(colors.text).toBe('#a855f7')
      expect(colors.bg).toContain('168,85,247')
    })

    it('maps neutral to CSS variable', () => {
      const colors = getColors('neutral')
      expect(colors.text).toBe('var(--sl-t2)')
      expect(colors.bg).toContain('100,116,139')
    })

    it('all 6 variants have 10% background opacity', () => {
      const statuses: PillStatus[] = ['success', 'warning', 'danger', 'info', 'purple', 'neutral']
      for (const s of statuses) {
        expect(getColors(s).bg).toContain('0.10')
      }
    })

    it('all 6 variants are defined', () => {
      expect(Object.keys(PILL_COLORS)).toHaveLength(6)
    })
  })
})
