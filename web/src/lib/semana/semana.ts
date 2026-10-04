// Sua semana (Fase 1, Task 14) · cálculo puro, sem I/O.
// Semana = segunda a domingo no fuso de São Paulo (decisão 7 do plano).
// A leitura (score da semana, o que mudou, a fala de Sy) só existe a partir de
// quinta, com pelo menos 4 dias de dados; antes disso a tela mostra o acumulado.

export const SP_TZ = 'America/Sao_Paulo'
export const DIAS_PARA_LEITURA = 4

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

/** YYYY-MM-DD de um instante no fuso de SP. */
export function isoSP(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

/** HH:MM de um instante no fuso de SP. */
export function horaSP(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit' })
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function somaDias(iso: string, n: number): string {
  const d = parseIso(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toIso(d)
}

export interface SemanaSP {
  inicio: string        // segunda
  fim: string           // domingo
  hoje: string
  /** 1 (segunda) a 7 (domingo): quantos dias da semana já existem */
  diasDeDados: number
  semDados: boolean
  /** dias que faltam para a semana ter leitura (0 a partir de quinta) */
  faltam: number
}

export function semanaSP(agora: Date): SemanaSP {
  const hoje = isoSP(agora)
  const dow = parseIso(hoje).getUTCDay() || 7 // 1=seg … 7=dom
  const inicio = somaDias(hoje, 1 - dow)
  const fim = somaDias(inicio, 6)
  const faltam = Math.max(0, DIAS_PARA_LEITURA - dow)
  return { inicio, fim, hoje, diasDeDados: dow, semDados: dow < DIAS_PARA_LEITURA, faltam }
}

/** "29 set a 5 out" · "6 a 12 out". */
export function rotuloSemana(inicio: string, fim: string): string {
  const a = parseIso(inicio)
  const b = parseIso(fim)
  const ma = MESES[a.getUTCMonth()]
  const mb = MESES[b.getUTCMonth()]
  return ma === mb
    ? `${a.getUTCDate()} a ${b.getUTCDate()} ${mb}`
    : `${a.getUTCDate()} ${ma} a ${b.getUTCDate()} ${mb}`
}

/** "sex", "sáb" de uma data YYYY-MM-DD. */
export function diaCurto(iso: string): string {
  return DIAS_CURTOS[parseIso(iso).getUTCDay()]
}

/** Número da semana ISO. */
export function semanaIsoNum(iso: string): number {
  const dt = parseIso(iso)
  const dia = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() + 4 - dia)
  const ano0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  return Math.ceil(((dt.getTime() - ano0.getTime()) / 86400000 + 1) / 7)
}

// ── formatação ──

/** "R$ 1.850" com NBSP após R$; negativo com en-dash: "– R$ 320". */
export function brl0(n: number): string {
  const v = Math.round(Math.abs(n)).toLocaleString('pt-BR')
  return `${n < 0 ? '– ' : ''}R$ ${v}`
}

/** 390 → "6h30", 60 → "1h", 45 → "45min", 0 → "0h". */
export function horasMin(min: number): string {
  const m = Math.max(0, Math.round(min))
  if (m === 0) return '0h'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r === 0 ? `${h}h` : `${h}h${String(r).padStart(2, '0')}`
}

export const pontos = (n: number) => (Math.abs(n) === 1 ? 'ponto' : 'pontos')

// ── agregados ──

export interface TxSemana { amount: number | null; type: string; is_future?: boolean | null }

export function financasSemana(txs: TxSemana[]): { entradas: number; saidas: number; n: number } {
  let entradas = 0
  let saidas = 0
  let n = 0
  for (const t of txs) {
    if (t.is_future) continue
    if (t.type === 'income') { entradas += t.amount ?? 0; n++ }
    else if (t.type === 'expense') { saidas += t.amount ?? 0; n++ }
  }
  return { entradas, saidas, n }
}

export interface EventoSemana { id: string; title: string; date: string; start_time?: string | null; status: string }

export function compromissosSemana<E extends EventoSemana>(events: E[], inicio: string, fim: string, max = 3) {
  const daSemana = events.filter((e) => e.date >= inicio && e.date <= fim && e.status !== 'cancelado')
  const feitos = daSemana.filter((e) => e.status === 'concluido').length
  const pendentes = daSemana
    .filter((e) => e.status === 'pendente')
    .sort((a, b) => (a.date + (a.start_time ?? '')).localeCompare(b.date + (b.start_time ?? '')))
    .slice(0, max)
  return { feitos, total: daSemana.length, pendentes }
}

export interface FocoSessao { date: string; duration_minutes: number }

export function focoSemana(sessoes: FocoSessao[], inicio: string, fim: string) {
  const s = sessoes.filter((x) => x.date >= inicio && x.date <= fim)
  return { minutos: s.reduce((acc, x) => acc + (x.duration_minutes ?? 0), 0), sessoes: s.length }
}

// ── score da semana e o que mudou (life_sync_scores, série desc) ──

export type AreaKey = 'financas' | 'futuro' | 'tempo' | 'corpo' | 'mente' | 'patrimonio' | 'carreira' | 'experiencias'

export const AREAS_SEMANA: { key: AreaKey; n: string; nome: string; href: string }[] = [
  { key: 'financas', n: '01', nome: 'Finanças', href: '/financas' },
  { key: 'futuro', n: '02', nome: 'Futuro', href: '/futuro' },
  { key: 'tempo', n: '03', nome: 'Tempo', href: '/tempo' },
  { key: 'corpo', n: '04', nome: 'Corpo', href: '/corpo' },
  { key: 'mente', n: '05', nome: 'Mente', href: '/mente' },
  { key: 'patrimonio', n: '06', nome: 'Patrimônio', href: '/patrimonio' },
  { key: 'carreira', n: '07', nome: 'Carreira', href: '/carreira' },
  { key: 'experiencias', n: '08', nome: 'Experiências', href: '/experiencias' },
]

export type RegistroSemana = { score: number; recorded_date: string } & Partial<Record<`${AreaKey}_score`, number | null>>

/** início = registro de 7 dias atrás (7º da série desc), fim = mais recente. */
export function scoreSemana(serie: RegistroSemana[]): { inicio: number | null; fim: number | null; delta: number | null } {
  const fim = serie[0] ? Math.round(serie[0].score) : null
  const inicio = serie.length >= 7 ? Math.round(serie[6].score) : null
  return { inicio, fim, delta: inicio !== null && fim !== null ? fim - inicio : null }
}

export interface Mudanca { key: AreaKey; n: string; nome: string; href: string; de: number; para: number; delta: number }

/**
 * "O que mudou": áreas ativas com os dois registros (7 dias atrás e hoje).
 * Ordem: da maior queda para a menor quando a semana caiu; senão, pelo número da área.
 */
export function oQueMudou(serie: RegistroSemana[], ativas: AreaKey[]): Mudanca[] {
  if (serie.length < 7) return []
  const out: Mudanca[] = []
  for (const a of AREAS_SEMANA) {
    if (!ativas.includes(a.key)) continue
    const para = serie[0][`${a.key}_score`]
    const de = serie[6][`${a.key}_score`]
    if (para == null || de == null) continue
    const r = { ...a, de: Math.round(de), para: Math.round(para), delta: 0 }
    r.delta = r.para - r.de
    out.push(r)
  }
  const s = scoreSemana(serie)
  if (s.delta !== null && s.delta < 0) out.sort((x, y) => x.delta - y.delta)
  return out
}

/** Título curto do objeto (sem leitura antes de quinta). */
export function tituloSemana(semDados: boolean, delta: number | null): string {
  if (semDados) return 'A semana ainda está em curso'
  if (delta === null) return 'A semana em números'
  if (delta > 0) return 'A semana subiu'
  if (delta < 0) return 'A semana recuou'
  return 'A semana ficou no lugar'
}

/** Payload do upsert em weekly_reviews (migration 029). */
export function payloadFechamento(input: {
  userId: string
  semana: { inicio: string; fim: string }
  agoraIso: string
  scoreInicio: number | null
  scoreFim: number | null
  entradas: number
  saidas: number
  feitos: number
  total: number
  focoMin: number
}) {
  return {
    user_id: input.userId,
    week_start: input.semana.inicio,
    week_end: input.semana.fim,
    completed_at: input.agoraIso,
    score_inicio: input.scoreInicio,
    score_fim: input.scoreFim,
    score_gained: 50,
    data: {
      entradas: input.entradas,
      saidas: input.saidas,
      feitos: input.feitos,
      total: input.total,
      focoMin: input.focoMin,
    },
  }
}
