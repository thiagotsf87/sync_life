import { describe, it, expect } from 'vitest'
import {
  getEstimatedBrlRate,
  convertToBrl,
  formatMoney,
  formatMoneyWithBrl,
  maskCurrency,
  parseCurrency,
  amountToMask,
} from '../currency'

// ─── getEstimatedBrlRate ────────────────────────────────────────────────────────

describe('getEstimatedBrlRate', () => {
  it('returns 1 for BRL', () => {
    expect(getEstimatedBrlRate('BRL')).toBe(1)
  })

  it('returns 5.2 for USD', () => {
    expect(getEstimatedBrlRate('USD')).toBe(5.2)
  })

  it('returns 5.6 for EUR', () => {
    expect(getEstimatedBrlRate('EUR')).toBe(5.6)
  })

  it('returns 6.5 for GBP', () => {
    expect(getEstimatedBrlRate('GBP')).toBe(6.5)
  })

  it('returns 0.005 for ARS', () => {
    expect(getEstimatedBrlRate('ARS')).toBe(0.005)
  })

  it('returns 1 for unknown currency', () => {
    expect(getEstimatedBrlRate('XYZ')).toBe(1)
  })
})

// ─── convertToBrl ───────────────────────────────────────────────────────────────

describe('convertToBrl', () => {
  it('converts USD to BRL', () => {
    expect(convertToBrl(100, 'USD')).toBe(520)
  })

  it('keeps BRL as-is', () => {
    expect(convertToBrl(100, 'BRL')).toBe(100)
  })

  it('converts EUR to BRL', () => {
    expect(convertToBrl(200, 'EUR')).toBe(1120)
  })

  it('handles zero value', () => {
    expect(convertToBrl(0, 'USD')).toBe(0)
  })

  it('handles negative values', () => {
    expect(convertToBrl(-50, 'USD')).toBe(-260)
  })
})

// ─── formatMoney ────────────────────────────────────────────────────────────────

describe('formatMoney', () => {
  it('formats BRL correctly', () => {
    const result = formatMoney(1234.56, 'BRL')
    // toLocaleString with pt-BR may produce different space chars
    expect(result).toContain('R$')
    expect(result).toContain('1.234,56')
  })

  it('formats USD correctly', () => {
    const result = formatMoney(100, 'USD')
    expect(result).toContain('US$')
  })
})

// ─── formatMoneyWithBrl ─────────────────────────────────────────────────────────

describe('formatMoneyWithBrl', () => {
  it('returns just BRL format when currency is BRL', () => {
    const result = formatMoneyWithBrl(1000, 'BRL')
    expect(result).toContain('R$')
    expect(result).not.toContain('~')
  })

  it('includes BRL equivalent when currency is not BRL', () => {
    const result = formatMoneyWithBrl(100, 'USD')
    expect(result).toContain('US$')
    expect(result).toContain('~')
    expect(result).toContain('R$')
  })
})

// ─── maskCurrency ───────────────────────────────────────────────────────────────

describe('maskCurrency', () => {
  it('masks simple digits', () => {
    expect(maskCurrency('100')).toBe('1,00')
  })

  it('masks larger numbers with dots', () => {
    expect(maskCurrency('123456')).toBe('1.234,56')
  })

  it('strips non-digit characters before masking', () => {
    expect(maskCurrency('R$ 1.234,56')).toBe('1.234,56')
  })

  it('returns empty string for empty input', () => {
    expect(maskCurrency('')).toBe('')
  })

  it('returns empty string for non-digit input', () => {
    expect(maskCurrency('abc')).toBe('')
  })

  it('handles single digit', () => {
    expect(maskCurrency('5')).toBe('0,05')
  })

  it('handles two digits', () => {
    expect(maskCurrency('50')).toBe('0,50')
  })

  it('handles three digits', () => {
    expect(maskCurrency('500')).toBe('5,00')
  })

  it('handles millions', () => {
    expect(maskCurrency('100000000')).toBe('1.000.000,00')
  })
})

// ─── parseCurrency ──────────────────────────────────────────────────────────────

describe('parseCurrency', () => {
  it('parses masked Brazilian format', () => {
    expect(parseCurrency('1.234,56')).toBe(1234.56)
  })

  it('parses simple format', () => {
    expect(parseCurrency('100,00')).toBe(100)
  })

  it('returns 0 for empty string', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('returns 0 for non-numeric input', () => {
    expect(parseCurrency('abc')).toBe(0)
  })

  it('parses decimal values', () => {
    expect(parseCurrency('0,50')).toBe(0.5)
  })

  it('parses large numbers', () => {
    expect(parseCurrency('1.000.000,00')).toBe(1000000)
  })
})

// ─── amountToMask ───────────────────────────────────────────────────────────────

describe('amountToMask', () => {
  it('converts numeric amount to masked string', () => {
    expect(amountToMask(1234.56)).toBe('1.234,56')
  })

  it('handles zero', () => {
    expect(amountToMask(0)).toBe('0,00')
  })

  it('handles small values', () => {
    expect(amountToMask(0.99)).toBe('0,99')
  })

  it('handles whole numbers', () => {
    expect(amountToMask(500)).toBe('500,00')
  })

  it('roundtrips with parseCurrency', () => {
    const original = 1234.56
    const masked = amountToMask(original)
    const parsed = parseCurrency(masked)
    expect(parsed).toBe(original)
  })
})
