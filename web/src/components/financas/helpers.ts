// ─── Shared helpers for Financas module ─────────────────────────────────────

export function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(n))
}

export function fmtDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

export const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix', credit: 'Crédito', debit: 'Débito',
  cash: 'Dinheiro', transfer: 'Transferência', boleto: 'Boleto',
}

export function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 80) return '#f97316'
  if (pct >= 61) return '#f59e0b'
  return '#10b981'
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyAgg { mes: string; rec: number; des: number }
export interface CatDataItem { nome: string; pct: number; val: number; cor: string }
export interface CfDay { d: number; inc: number; exp: number; isToday: boolean; isFuture: boolean }

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROJ_MESES = [
  { mes: 'Fev', val: 1800, delta: '', nota: 'Mês atual', tipo: 'current' as const },
  { mes: 'Mar', val: 2100, delta: '+16%', nota: 'IPTU parcela', tipo: 'good' as const },
  { mes: 'Abr', val: 1950, delta: '-7%', nota: 'IPVA estimado', tipo: 'warn' as const },
  { mes: 'Mai', val: 2350, delta: '+21%', nota: 'Tendência +', tipo: 'good' as const },
  { mes: 'Jun', val: 2600, delta: '+11%', nota: 'Tendência +', tipo: 'good' as const },
]
