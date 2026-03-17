const FX_TO_BRL_ESTIMATED: Record<string, number> = {
  BRL: 1,
  USD: 5.2,
  EUR: 5.6,
  GBP: 6.5,
  ARS: 0.005,
}

export function getEstimatedBrlRate(currency: string): number {
  return FX_TO_BRL_ESTIMATED[currency] ?? 1
}

export function convertToBrl(value: number, currency: string): number {
  return value * getEstimatedBrlRate(currency)
}

export function formatMoney(value: number, currency: string): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency })
}

export function formatMoneyWithBrl(value: number, currency: string): string {
  if (currency === 'BRL') return formatMoney(value, 'BRL')
  return `${formatMoney(value, currency)} (~ ${formatMoney(convertToBrl(value, currency), 'BRL')})`
}

/** Mask a raw string into currency format (e.g. "123456" → "1.234,56") */
export function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const numeric = parseInt(digits, 10)
  const formatted = (numeric / 100).toFixed(2)
  const [intPart, decPart] = formatted.split('.')
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withDots},${decPart}`
}

/** Parse a masked currency string back to a number (e.g. "1.234,56" → 1234.56) */
export function parseCurrency(masked: string): number {
  if (!masked) return 0
  const cleaned = masked.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

/** Convert a numeric amount to its masked string (e.g. 1234.56 → "1.234,56") */
export function amountToMask(amount: number): string {
  return maskCurrency((amount * 100).toFixed(0))
}

