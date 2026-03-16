import { describe, it, expect } from 'vitest'
import { maskCurrency, parseCurrency, amountToMask } from '@/lib/currency'

describe('maskCurrency', () => {
  it('formats a simple integer', () => {
    expect(maskCurrency('1000')).toBe('1.000')
  })

  it('formats with decimal separator', () => {
    expect(maskCurrency('1500,50')).toBe('1.500,50')
  })

  it('returns empty for empty input', () => {
    expect(maskCurrency('')).toBe('')
  })

  it('strips non-numeric characters except comma', () => {
    expect(maskCurrency('R$ 1.234,56')).toBe('1.234,56')
  })

  it('limits decimal to 2 digits', () => {
    expect(maskCurrency('100,999')).toBe('100,99')
  })

  it('removes leading zeros', () => {
    expect(maskCurrency('00123')).toBe('123')
  })

  it('handles zero with decimals', () => {
    expect(maskCurrency('0,50')).toBe('0,50')
  })

  it('handles just comma', () => {
    expect(maskCurrency(',5')).toBe('0,5')
  })

  it('formats large numbers with thousands separators', () => {
    expect(maskCurrency('1234567')).toBe('1.234.567')
  })

  it('handles multiple commas (keeps first)', () => {
    expect(maskCurrency('100,50,30')).toBe('100,50')
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
