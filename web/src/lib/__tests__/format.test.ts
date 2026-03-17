import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatMonthYear,
  formatShortMonth,
  parseCurrency,
  formatCurrencyInput,
  formatPercentage,
  formatPercentageChange,
} from '../format'

// ─── formatCurrency ─────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a positive number as BRL', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('R$')
    expect(result).toContain('1.234,56')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('R$')
    expect(result).toContain('0,00')
  })

  it('formats negative numbers', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500,00')
  })
})

// ─── formatCompactCurrency ──────────────────────────────────────────────────────

describe('formatCompactCurrency', () => {
  it('formats millions with M suffix', () => {
    expect(formatCompactCurrency(1500000)).toBe('R$ 1.5M')
  })

  it('formats thousands with k suffix', () => {
    expect(formatCompactCurrency(5000)).toBe('R$ 5k')
  })

  it('formats small values as full currency', () => {
    const result = formatCompactCurrency(500)
    expect(result).toContain('R$')
    expect(result).toContain('500,00')
  })

  it('formats exactly 1000 as k', () => {
    expect(formatCompactCurrency(1000)).toBe('R$ 1k')
  })

  it('formats exactly 1000000 as M', () => {
    expect(formatCompactCurrency(1000000)).toBe('R$ 1.0M')
  })
})

// ─── formatDate ─────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats YYYY-MM-DD string to DD/MM/YYYY', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024')
  })

  it('handles single-digit day/month in ISO string', () => {
    expect(formatDate('2024-03-05')).toBe('05/03/2024')
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 0, 15))
    expect(result).toBe('15/01/2024')
  })
})

// ─── formatMonthYear ────────────────────────────────────────────────────────────

describe('formatMonthYear', () => {
  it('formats a date string as month/year', () => {
    const result = formatMonthYear('2024-02-15')
    // "fevereiro de 2024" in pt-BR
    expect(result.toLowerCase()).toContain('fevereiro')
    expect(result).toContain('2024')
  })
})

// ─── formatShortMonth ───────────────────────────────────────────────────────────

describe('formatShortMonth', () => {
  it('formats a date string as short month', () => {
    const result = formatShortMonth('2024-01-15')
    // "jan" in pt-BR
    expect(result.toLowerCase()).toContain('jan')
  })
})

// ─── parseCurrency ──────────────────────────────────────────────────────────────

describe('parseCurrency (format.ts)', () => {
  it('parses Brazilian formatted currency string', () => {
    expect(parseCurrency('R$ 1.234,56')).toBe(1234.56)
  })

  it('returns 0 for non-numeric input', () => {
    expect(parseCurrency('abc')).toBe(0)
  })

  it('handles empty string', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('handles just "R$"', () => {
    expect(parseCurrency('R$ ')).toBe(0)
  })
})

// ─── formatCurrencyInput ────────────────────────────────────────────────────────

describe('formatCurrencyInput', () => {
  it('formats numeric string with decimal', () => {
    expect(formatCurrencyInput('12345')).toBe('123,45')
  })

  it('returns empty string for empty input', () => {
    expect(formatCurrencyInput('')).toBe('')
  })

  it('strips non-numeric characters', () => {
    expect(formatCurrencyInput('R$ 100')).toBe('1,00')
  })

  it('formats large numbers with dots', () => {
    expect(formatCurrencyInput('12345678')).toBe('123.456,78')
  })

  it('formats single digit', () => {
    expect(formatCurrencyInput('5')).toBe('0,05')
  })
})

// ─── formatPercentage ───────────────────────────────────────────────────────────

describe('formatPercentage', () => {
  it('calculates percentage correctly', () => {
    expect(formatPercentage(25, 100)).toBe('25%')
  })

  it('returns "0%" when total is zero', () => {
    expect(formatPercentage(10, 0)).toBe('0%')
  })

  it('rounds to nearest integer', () => {
    expect(formatPercentage(1, 3)).toBe('33%')
  })

  it('handles 100%', () => {
    expect(formatPercentage(50, 50)).toBe('100%')
  })
})

// ─── formatPercentageChange ─────────────────────────────────────────────────────

describe('formatPercentageChange', () => {
  it('formats positive change with + sign', () => {
    expect(formatPercentageChange(150, 100)).toBe('+50%')
  })

  it('formats negative change', () => {
    expect(formatPercentageChange(50, 100)).toBe('-50%')
  })

  it('returns "+0%" when previous is zero', () => {
    expect(formatPercentageChange(100, 0)).toBe('+0%')
  })

  it('formats no change as +0%', () => {
    expect(formatPercentageChange(100, 100)).toBe('+0%')
  })
})
