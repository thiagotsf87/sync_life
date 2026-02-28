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

