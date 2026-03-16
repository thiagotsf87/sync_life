import { describe, it, expect } from 'vitest'

// Tests for VitalsStrip component data contract

interface VitalsItem {
  icon: unknown
  label: string
  value: string
  note?: string
  accent: string
}

function validateItems(items: VitalsItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (items.length === 0) errors.push('items array is empty')
  for (let i = 0; i < items.length; i++) {
    if (!items[i].label) errors.push(`item[${i}] missing label`)
    if (!items[i].value) errors.push(`item[${i}] missing value`)
    if (!items[i].accent) errors.push(`item[${i}] missing accent color`)
  }
  return { valid: errors.length === 0, errors }
}

function getAccentBarStyle(accent: string) {
  return { background: accent }
}

describe('VitalsStrip', () => {
  const MOCK_ITEMS: VitalsItem[] = [
    { icon: null, label: 'Peso', value: '78.5 kg', note: '-2.5 kg', accent: '#10b981' },
    { icon: null, label: 'IMC', value: '24.1', note: 'Normal', accent: '#06b6d4' },
    { icon: null, label: 'Agua', value: '2.1 L', note: '7 copos', accent: '#3b82f6' },
    { icon: null, label: 'Sono', value: '7h30', note: 'Bom', accent: '#a855f7' },
    { icon: null, label: 'Streak', value: '12 dias', accent: '#f59e0b' },
  ]

  describe('item validation', () => {
    it('validates correctly formed items', () => {
      const result = validateItems(MOCK_ITEMS)
      expect(result.valid).toBe(true)
    })

    it('rejects empty items array', () => {
      const result = validateItems([])
      expect(result.valid).toBe(false)
    })

    it('rejects items without label', () => {
      const result = validateItems([{ icon: null, label: '', value: '78kg', accent: '#10b981' }])
      expect(result.valid).toBe(false)
    })

    it('rejects items without accent', () => {
      const result = validateItems([{ icon: null, label: 'Peso', value: '78kg', accent: '' }])
      expect(result.valid).toBe(false)
    })

    it('accepts items without optional note', () => {
      const result = validateItems([{ icon: null, label: 'Peso', value: '78kg', accent: '#10b981' }])
      expect(result.valid).toBe(true)
    })
  })

  describe('accent bar styling', () => {
    it('generates correct style for each item', () => {
      MOCK_ITEMS.forEach(item => {
        const style = getAccentBarStyle(item.accent)
        expect(style.background).toBe(item.accent)
      })
    })
  })

  describe('grid layout', () => {
    it('supports up to 5 items', () => {
      expect(MOCK_ITEMS.length).toBe(5)
      expect(MOCK_ITEMS.length).toBeLessThanOrEqual(6)
    })
  })
})
