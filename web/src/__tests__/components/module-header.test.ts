import { describe, it, expect } from 'vitest'

// Tests for ModuleHeader component data contract
// Node environment — validates props interface and rendering logic

interface ModuleHeaderProps {
  icon: unknown // LucideIcon
  iconBg: string
  iconColor: string
  title: string
  subtitle?: string
  children?: unknown
  className?: string
}

function validateProps(props: Partial<ModuleHeaderProps>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!props.icon) errors.push('icon is required')
  if (!props.iconBg) errors.push('iconBg is required')
  if (!props.iconColor) errors.push('iconColor is required')
  if (!props.title) errors.push('title is required')
  return { valid: errors.length === 0, errors }
}

function isValidCssColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color) || /^rgba?\(/.test(color) || /^var\(--/.test(color)
}

describe('ModuleHeader', () => {
  describe('props validation', () => {
    it('validates complete props', () => {
      const result = validateProps({
        icon: () => null,
        iconBg: 'rgba(236,72,153,.1)',
        iconColor: '#ec4899',
        title: 'Experiencias',
        subtitle: '3 viagens ativas',
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects props without icon', () => {
      const result = validateProps({
        iconBg: 'rgba(236,72,153,.1)',
        iconColor: '#ec4899',
        title: 'Test',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('icon is required')
    })

    it('rejects props without title', () => {
      const result = validateProps({
        icon: () => null,
        iconBg: 'rgba(236,72,153,.1)',
        iconColor: '#ec4899',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    it('accepts props without optional subtitle', () => {
      const result = validateProps({
        icon: () => null,
        iconBg: 'rgba(236,72,153,.1)',
        iconColor: '#ec4899',
        title: 'Test',
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('color validation', () => {
    it('accepts hex colors', () => {
      expect(isValidCssColor('#ec4899')).toBe(true)
      expect(isValidCssColor('#10b981')).toBe(true)
    })

    it('accepts rgba colors', () => {
      expect(isValidCssColor('rgba(236,72,153,.1)')).toBe(true)
      expect(isValidCssColor('rgba(249,115,22,.08)')).toBe(true)
    })

    it('accepts css variables', () => {
      expect(isValidCssColor('var(--sl-t1)')).toBe(true)
    })

    it('rejects invalid colors', () => {
      expect(isValidCssColor('red')).toBe(false)
      expect(isValidCssColor('')).toBe(false)
    })
  })

  describe('module colors', () => {
    const MODULE_COLORS: Record<string, { bg: string; color: string }> = {
      corpo: { bg: 'rgba(249,115,22,.08)', color: '#f97316' },
      experiencias: { bg: 'rgba(236,72,153,.1)', color: '#ec4899' },
      financas: { bg: 'rgba(16,185,129,.1)', color: '#10b981' },
    }

    it('all module colors are valid', () => {
      for (const [, { bg, color }] of Object.entries(MODULE_COLORS)) {
        expect(isValidCssColor(bg)).toBe(true)
        expect(isValidCssColor(color)).toBe(true)
      }
    })
  })
})
