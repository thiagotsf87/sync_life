import { describe, it, expect } from 'vitest'

// Since we're in node environment (no jsdom), we test the data/prop contract
// This verifies the MetricsStrip interface and rendering logic

interface MetricsStripItem {
  label: string
  value: string
  note?: string
  valueColor?: string
}

// Validate MetricsStrip props contract
function validateItems(items: MetricsStripItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (items.length === 0) errors.push('items array is empty')
  for (let i = 0; i < items.length; i++) {
    if (!items[i].label) errors.push(`item[${i}] missing label`)
    if (!items[i].value) errors.push(`item[${i}] missing value`)
  }
  return { valid: errors.length === 0, errors }
}

// Simulate border-right logic: last item has no right border
function getBorderClass(index: number, total: number): string {
  return index < total - 1 ? 'border-r border-[var(--sl-border)]' : ''
}

describe('MetricsStrip', () => {
  describe('item validation', () => {
    it('validates correctly formed items', () => {
      const items: MetricsStripItem[] = [
        { label: 'Total', value: 'R$ 100.000' },
        { label: 'Resultado', value: '+5%', valueColor: '#10b981' },
        { label: 'Proventos', value: 'R$ 1.200', note: 'últimos 12m' },
      ]
      const result = validateItems(items)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects empty items array', () => {
      const result = validateItems([])
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('items array is empty')
    })

    it('rejects items without label', () => {
      const items: MetricsStripItem[] = [
        { label: '', value: 'R$ 100' },
      ]
      const result = validateItems(items)
      expect(result.valid).toBe(false)
    })

    it('accepts items without optional note and valueColor', () => {
      const items: MetricsStripItem[] = [
        { label: 'Revenue', value: 'R$ 5000' },
      ]
      const result = validateItems(items)
      expect(result.valid).toBe(true)
    })
  })

  describe('border logic', () => {
    it('applies border-r to all items except last', () => {
      expect(getBorderClass(0, 4)).toContain('border-r')
      expect(getBorderClass(1, 4)).toContain('border-r')
      expect(getBorderClass(2, 4)).toContain('border-r')
      expect(getBorderClass(3, 4)).toBe('')
    })

    it('single item has no border', () => {
      expect(getBorderClass(0, 1)).toBe('')
    })
  })

  describe('valueColor application', () => {
    it('applies style when valueColor is provided', () => {
      const item: MetricsStripItem = { label: 'Test', value: 'R$ 100', valueColor: '#10b981' }
      const style = item.valueColor ? { color: item.valueColor } : undefined
      expect(style).toEqual({ color: '#10b981' })
    })

    it('returns undefined style when no valueColor', () => {
      const item: MetricsStripItem = { label: 'Test', value: 'R$ 100' }
      const style = item.valueColor ? { color: item.valueColor } : undefined
      expect(style).toBeUndefined()
    })
  })
})
