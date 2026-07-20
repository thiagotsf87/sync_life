// ─── Dashboard shared helpers ──────────────────────────────────────────────

import { fmtBRL } from '@/lib/format/currency'

export function fmt(val: number) {
  return fmtBRL(val)
}

export function fmtShort(val: number) {
  return fmtBRL(val, { compact: true })
}

export function getBudgetColor(pct: number): string {
  if (pct > 85) return '#DB6478'
  if (pct > 70) return '#D9962E'
  return '#0F766E'
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
