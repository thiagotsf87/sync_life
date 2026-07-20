export const fmtBRL = (n: number, { compact = false } = {}): string => {
  if (compact && Math.abs(n) >= 1000)
    return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k'
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const fmtPct = (n: number, decimals = 0): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%'

export const fmtDelta = (n: number, type: 'pct' | 'brl' = 'pct'): string => {
  const sign = n >= 0 ? '+' : ''
  if (type === 'brl') return (n >= 0 ? '+' : '– ') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return sign + fmtPct(n, 1)
}
