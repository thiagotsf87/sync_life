// Life Score v2 · composição do número (puro, sem I/O).
// Lê o resultado do motor oficial (use-score-engine: score + `detalhes` por área)
// e o histórico de life_sync_scores; nada aqui recalcula o score de uma área.
// Regras (plano Fase 1, Task 13):
// - peso efetivo = peso do motor (score-utils WEIGHTS) redistribuído entre as ativas;
// - contribuição = score da área × peso efetivo;
// - "Como melhorar" = 3 componentes mais fracos, ganho = (100 − valor) × peso interno × peso efetivo;
// - "O que mais pesou" = área ativa com maior |delta| de 7 registros (colunas <modulo>_score).
import { WEIGHTS, type ModuleKey, type ModuleScoreDetail } from '@/lib/score-utils'

export interface AreaMeta { key: ModuleKey; n: string; nome: string; href: string }

export const AREAS: AreaMeta[] = [
  { key: 'financas', n: '01', nome: 'Finanças', href: '/financas' },
  { key: 'futuro', n: '02', nome: 'Futuro', href: '/futuro' },
  { key: 'tempo', n: '03', nome: 'Tempo', href: '/tempo' },
  { key: 'corpo', n: '04', nome: 'Corpo', href: '/corpo' },
  { key: 'mente', n: '05', nome: 'Mente', href: '/mente' },
  { key: 'patrimonio', n: '06', nome: 'Patrimônio', href: '/patrimonio' },
  { key: 'carreira', n: '07', nome: 'Carreira', href: '/carreira' },
  { key: 'experiencias', n: '08', nome: 'Experiências', href: '/experiencias' },
]

export const AREA_POR_KEY = Object.fromEntries(AREAS.map((a) => [a.key, a])) as Record<ModuleKey, AreaMeta>

/** Linha de life_sync_scores (só as colunas lidas aqui). */
export type RegistroScore = { score: number; recorded_date: string } & Partial<Record<`${ModuleKey}_score`, number | null>>

/** Pesos do motor redistribuídos entre as áreas ativas (somam 1). */
export function pesosEfetivos(ativas: ModuleKey[]): Partial<Record<ModuleKey, number>> {
  const soma = ativas.reduce((s, k) => s + WEIGHTS[k], 0)
  const out: Partial<Record<ModuleKey, number>> = {}
  if (soma <= 0) return out
  // arredonda o ruído de ponto flutuante (0,15 / 0,6 = 0,2499…), senão 17,25 vira 17,2
  for (const k of ativas) out[k] = Math.round((WEIGHTS[k] / soma) * 1e12) / 1e12
  return out
}

/** Delta de uma área (ou do total, com key null) entre o registro mais recente e o 7º (série desc). */
export function deltaSemana(serie: RegistroScore[], key: ModuleKey | null): number | null {
  if (serie.length < 7) return null
  const a = key ? serie[0][`${key}_score`] : serie[0].score
  const b = key ? serie[6][`${key}_score`] : serie[6].score
  if (a == null || b == null) return null
  return Math.round((a - b) * 10) / 10
}

/**
 * Série desc com o número de hoje no topo: o motor persiste o cálculo do dia
 * (upsert por recorded_date UTC), mas o histórico pode ter sido lido antes.
 */
export function serieComHoje(historico: RegistroScore[], hoje: RegistroScore | null): RegistroScore[] {
  if (!hoje) return historico
  const resto = historico.filter((r) => r.recorded_date !== hoje.recorded_date)
  return [hoje, ...resto].slice(0, 30)
}

export interface AreaComposta extends AreaMeta {
  score: number
  peso: number          // efetivo (0-1)
  contrib: number       // pontos somados ao total
  delta: number | null  // 7 registros
}

export interface Composicao {
  ativas: AreaComposta[]
  inativas: AreaMeta[]
  somaParcelas: number
}

export function compor(modules: ModuleScoreDetail[], serie: RegistroScore[]): Composicao {
  const keys = modules.map((m) => m.module)
  const pesos = pesosEfetivos(keys)
  const ativas = AREAS.filter((a) => keys.includes(a.key)).map((a) => {
    const m = modules.find((x) => x.module === a.key) as ModuleScoreDetail
    const peso = pesos[a.key] ?? 0
    return { ...a, score: m.score, peso, contrib: m.score * peso, delta: deltaSemana(serie, a.key) }
  })
  return {
    ativas,
    inativas: AREAS.filter((a) => !keys.includes(a.key)),
    somaParcelas: Math.round(ativas.reduce((s, a) => s + a.contrib, 0) * 1e9) / 1e9,
  }
}

/** Área ativa com o maior |delta| de 7 registros (null sem histórico ou sem variação). */
export function maisPesou(c: Composicao): AreaComposta | null {
  let best: AreaComposta | null = null
  for (const a of c.ativas) {
    if (a.delta == null || a.delta === 0) continue
    if (!best || Math.abs(a.delta) > Math.abs(best.delta as number)) best = a
  }
  return best
}

// ── como melhorar ──────────────────────────────────────────────────────────

const ACAO: Record<string, string> = {
  budgetScore: 'Montar o orçamento do mês',
  registrationScore: 'Registrar as transações da semana',
  trendScore: 'Fechar o mês com saldo acima do anterior',
  progressScore: 'Avançar um objetivo parado',
  completedScore: 'Concluir um objetivo do trimestre',
  activityScore: 'Registrar as atividades da semana',
  appointmentScore: 'Marcar a próxima consulta',
  weightScore: 'Registrar o peso desta semana',
  hydrationScore: 'Fechar a meta de água de hoje',
  hoursScore: 'Proteger horas de estudo na semana',
  streakScore: 'Manter a sequência de dias',
  tracksScore: 'Retomar uma trilha de estudo',
  contribScore: 'Fazer o aporte do mês',
  diversScore: 'Diversificar a carteira',
  roadmapScore: 'Avançar um passo do roadmap',
  skillsScore: 'Evoluir uma habilidade',
  completionScore: 'Concluir os compromissos da semana',
  consistencyScore: 'Planejar a semana na agenda',
  tripScore: 'Planejar a próxima viagem',
  bucketScore: 'Acrescentar um item à bucket list',
}

export interface Melhoria {
  area: AreaMeta
  chave: string
  titulo: string
  sub: string
  valor: number
  ganho: number   // pontos no total, se o componente chegar a 100
}

export function comoMelhorar(modules: ModuleScoreDetail[], max = 3): Melhoria[] {
  const pesos = pesosEfetivos(modules.map((m) => m.module))
  const todas: Melhoria[] = []
  for (const m of modules) {
    const area = AREA_POR_KEY[m.module]
    const pe = pesos[m.module] ?? 0
    for (const c of m.detalhes ?? []) {
      if (c.valor >= 100) continue
      const ganho = (100 - c.valor) * c.peso * pe
      if (ganho <= 0) continue
      todas.push({
        area,
        chave: c.chave,
        titulo: ACAO[c.chave] ?? c.nome,
        sub: `${c.nome} vale ${Math.round(c.peso * 100)}% do score de ${area.nome} e está em ${Math.round(c.valor)}.`,
        valor: c.valor,
        ganho,
      })
    }
  }
  return todas.sort((a, b) => a.valor - b.valor || b.ganho - a.ganho).slice(0, max)
}

/** Índice do componente mais fraco de uma área (coral em "Por dentro"). */
export function indiceMaisFraco(m: ModuleScoreDetail): number {
  const d = m.detalhes ?? []
  let idx = -1
  d.forEach((c, i) => { if (idx < 0 || c.valor < d[idx].valor) idx = i })
  return idx
}

// ── formatação pt-BR ───────────────────────────────────────────────────────

export const fmt1 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const fmt01 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
export const pct0 = (p: number) => `${Math.round(p * 100)}%`

/** "+3", "–2" (en-dash), "0". */
export function sinal(n: number): string {
  const v = fmt01(Math.abs(n))
  return n > 0 ? `+${v}` : n < 0 ? `–${v}` : '0'
}

/** Número da semana ISO (segunda a domingo) de uma data YYYY-MM-DD. */
export function semanaIso(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dia = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() + 4 - dia)
  const ano0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  return Math.ceil(((dt.getTime() - ano0.getTime()) / 86400000 + 1) / 7)
}
