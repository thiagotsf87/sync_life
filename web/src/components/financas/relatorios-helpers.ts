// ─── HELPERS (shared across Relatorios components) ───────────────────────────

export function fmtR(value: number): string {
  const abs = Math.abs(value)
  const prefix = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${prefix}R$ ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${prefix}R$ ${(abs / 1_000).toFixed(1)}k`
  return `${prefix}R$ ${abs.toFixed(2).replace('.', ',')}`
}

export function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${String(y).slice(2)}`
}

export const PERIOD_LABELS: Record<string, string> = {
  mes:    'Mês atual',
  tri:    'Último trimestre',
  sem:    'Último semestre',
  '12m':  'Últimos 12 meses',
  ano:    'Ano atual',
  custom: 'Personalizado',
}

export function getDeltaColor(type: 'recipes' | 'expenses' | 'balance' | 'savings', delta: number | null): string {
  if (delta === null) return 'text-[var(--sl-t3)]'
  if (type === 'expenses') return delta > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'
  return delta > 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
}
