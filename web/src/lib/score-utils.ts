// Pure functions extracted from use-score-engine.ts for testability

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type ModuleKey = 'financas' | 'futuro' | 'corpo' | 'mente' | 'patrimonio' | 'carreira' | 'tempo' | 'experiencias'

/** Um componente do score de uma área, com o peso interno que ele tem na fórmula. */
export interface ComponenteDetalhe {
  chave: string          // mesma chave de `components`
  nome: string           // nome legível (pt-BR)
  peso: number           // peso interno na área (0-1), o mesmo da fórmula
  valor: number          // 0-100
}

export interface ModuleScoreDetail {
  module: ModuleKey
  score: number          // 0-100
  weight: number         // peso original
  components: Record<string, number> // sub-scores detalhados
  /** componentes com nome e peso interno (só leitura; não entra no cálculo) */
  detalhes?: ComponenteDetalhe[]
}

export interface LifeScoreResult {
  total: number           // 0-100
  modules: ModuleScoreDetail[]
  label: string
  color: string
}

// ─── PESOS POR MÓDULO ──────────────────────────────────────────────────────────

export const WEIGHTS: Record<ModuleKey, number> = {
  financas:     0.20,
  futuro:       0.20,
  corpo:        0.15,
  patrimonio:   0.10,
  mente:        0.10,
  carreira:     0.10,
  tempo:        0.10,
  experiencias: 0.05,
}

// ─── INTERPRETAÇÃO ─────────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score <= 20) return 'Iniciante'
  if (score <= 40) return 'Em construção'
  if (score <= 60) return 'Regular'
  if (score <= 80) return 'Consistente'
  return 'Excelente'
}

export function getScoreColor(score: number): string {
  if (score <= 20) return '#DB6478'
  if (score <= 40) return '#D97534'
  if (score <= 60) return '#D9962E'
  if (score <= 80) return '#6B6FD4'
  return '#0F766E'
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

export function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v * 100) / 100))
}

export function monthStart(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function monthEnd(): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.toISOString().slice(0, 10)
}

export function weekAgo(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}

export function quarterAgo(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().slice(0, 10)
}
