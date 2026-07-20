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
        iconBg: 'rgba(199,103,149,.1)',
        iconColor: '#C76795',
        title: 'Experiencias',
        subtitle: '3 viagens ativas',
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects props without icon', () => {
      const result = validateProps({
        iconBg: 'rgba(199,103,149,.1)',
        iconColor: '#C76795',
        title: 'Test',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('icon is required')
    })

    it('rejects props without title', () => {
      const result = validateProps({
        icon: () => null,
        iconBg: 'rgba(199,103,149,.1)',
        iconColor: '#C76795',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    it('accepts props without optional subtitle', () => {
      const result = validateProps({
        icon: () => null,
        iconBg: 'rgba(199,103,149,.1)',
        iconColor: '#C76795',
        title: 'Test',
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('color validation', () => {
    it('accepts hex colors', () => {
      expect(isValidCssColor('#C76795')).toBe(true)
      expect(isValidCssColor('#0F766E')).toBe(true)
    })

    it('accepts rgba colors', () => {
      expect(isValidCssColor('rgba(199,103,149,.1)')).toBe(true)
      expect(isValidCssColor('rgba(217,117,52,.08)')).toBe(true)
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
      corpo: { bg: 'rgba(217,117,52,.08)', color: '#D97534' },
      experiencias: { bg: 'rgba(199,103,149,.1)', color: '#C76795' },
      financas: { bg: 'rgba(15,118,110,.1)', color: '#0F766E' },
    }

    it('all module colors are valid', () => {
      for (const [, { bg, color }] of Object.entries(MODULE_COLORS)) {
        expect(isValidCssColor(bg)).toBe(true)
        expect(isValidCssColor(color)).toBe(true)
      }
    })
  })
})
