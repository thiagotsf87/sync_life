import { describe, it, expect } from 'vitest'
import { maskCurrency, parseCurrency, amountToMask } from '@/lib/currency'

// maskCurrency is a cents-accumulator: every raw digit is interpreted as cents
// (the last two digits are always the decimals). This mirrors the canonical
// contract in src/lib/__tests__/currency.test.ts and what amountToMask relies on.
describe('maskCurrency', () => {
  it('treats raw digits as cents', () => {
    expect(maskCurrency('1000')).toBe('10,00')
  })

  it('strips separators before masking', () => {
    expect(maskCurrency('1500,50')).toBe('1.500,50')
  })

  it('returns empty for empty input', () => {
    expect(maskCurrency('')).toBe('')
  })

  it('strips non-numeric characters', () => {
    expect(maskCurrency('R$ 1.234,56')).toBe('1.234,56')
  })

  it('folds all digits into the cents value', () => {
    expect(maskCurrency('100,999')).toBe('1.009,99')
  })

  it('drops leading zeros via the cents value', () => {
    expect(maskCurrency('00123')).toBe('1,23')
  })

  it('keeps two decimal places', () => {
    expect(maskCurrency('0,50')).toBe('0,50')
  })

  it('pads a single digit to cents', () => {
    expect(maskCurrency(',5')).toBe('0,05')
  })

  it('formats large numbers with thousands separators', () => {
    expect(maskCurrency('1234567')).toBe('12.345,67')
  })

  it('ignores separator positions (all digits are cents)', () => {
    expect(maskCurrency('100,50,30')).toBe('10.050,30')
  })
})

describe('parseCurrency', () => {
  it('parses masked BRL string to number', () => {
    expect(parseCurrency('1.500,50')).toBe(1500.50)
  })

  it('parses integer without decimal', () => {
    expect(parseCurrency('1.000')).toBe(1000)
  })

  it('returns 0 for empty string', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('returns 0 for non-numeric input', () => {
    expect(parseCurrency('abc')).toBe(0)
  })

  it('parses simple number', () => {
    expect(parseCurrency('50,00')).toBe(50)
  })
})

describe('amountToMask', () => {
  it('formats number to BRL mask', () => {
    expect(amountToMask(1500.5)).toBe('1.500,50')
  })

  it('formats zero', () => {
    expect(amountToMask(0)).toBe('0,00')
  })

  it('formats with 2 decimal places', () => {
    expect(amountToMask(100)).toBe('100,00')
  })

  it('rounds to 2 decimal places', () => {
    const result = amountToMask(99.999)
    expect(result).toBe('100,00')
  })
})
