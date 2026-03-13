// ─── Dashboard shared helpers ──────────────────────────────────────────────

export function fmt(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function fmtShort(val: number) {
  if (Math.abs(val) >= 1000) return `R$ ${(val / 1000).toFixed(1).replace('.', ',')}k`
  return fmt(val)
}

export function getBudgetColor(pct: number): string {
  if (pct > 85) return '#f43f5e'
  if (pct > 70) return '#f59e0b'
  return '#10b981'
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
