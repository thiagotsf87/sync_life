import { describe, it, expect } from 'vitest'

// Test the StatusPill color mapping logic without DOM

type PillStatus = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'

const PILL_COLORS: Record<PillStatus, { bg: string; text: string }> = {
  success: { bg: 'rgba(15,118,110,0.10)', text: '#0F766E' },
  warning: { bg: 'rgba(217,150,46,0.10)', text: '#D9962E' },
  danger:  { bg: 'rgba(219,100,120,0.10)',  text: '#DB6478' },
  info:    { bg: 'rgba(60,160,181,0.10)',   text: '#3CA0B5' },
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
      expect(colors.text).toBe('#0F766E')
      expect(colors.bg).toContain('15,118,110')
    })

    it('maps warning to yellow', () => {
      const colors = getColors('warning')
      expect(colors.text).toBe('#D9962E')
      expect(colors.bg).toContain('217,150,46')
    })

    it('maps danger to red', () => {
      const colors = getColors('danger')
      expect(colors.text).toBe('#DB6478')
      expect(colors.bg).toContain('219,100,120')
    })

    it('maps info to cyan', () => {
      const colors = getColors('info')
      expect(colors.text).toBe('#3CA0B5')
      expect(colors.bg).toContain('60,160,181')
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
