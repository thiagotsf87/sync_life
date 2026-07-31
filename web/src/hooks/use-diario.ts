'use client'

import { useState } from 'react'
import { useScoreEngine } from '@/hooks/use-score-engine'
import type { ModuleKey } from '@/hooks/use-score-engine'
import { useBadges, useLifeScore, useStreak, useUserBadges } from '@/hooks/use-panorama'
import { useBudgets } from '@/hooks/use-budgets'
import type { BudgetWithSpend } from '@/hooks/use-budgets'
import { useAgenda } from '@/hooks/use-agenda'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import { calcProgress, useMetas } from '@/hooks/use-metas'
import { fmtBRL } from '@/lib/format/currency'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface DiarioScore {
  total: number
  deltaWeek: number
  label: string
}

export interface DiarioNums {
  receitas: number
  despesas: number
  saldo: number
  poupancaPct: number
}

export interface DiarioHojeItem {
  t: string
  tx: string
  tag?: string
  due?: boolean
  money?: boolean
}

export interface AreaLinha {
  n: string
  nome: string
  /** Ausente em áreas inativas: o engine não calcula score de módulo inativo. */
  score?: number
  tendencia?: number
  meta: string
}

export interface DiarioAreas {
  ativas: AreaLinha[]
  outras: AreaLinha[]
}

export interface DiarioAtencao {
  tipo: 'danger' | 'warn' | 'ok'
  texto: string
  strong: string
  valor: string
}

export interface DiarioMetaLinha {
  nome: string
  pct: number
  sub: string
}

export interface DiarioColofao {
  saldoMes: string
  streakDias: number
  badges: string
  ultimaSinc: string
}

export interface DiarioData {
  loading: boolean
  score: DiarioScore | null
  nums: DiarioNums | null
  hoje: DiarioHojeItem[]
  areas: DiarioAreas
  atencao: DiarioAtencao[]
  metas: DiarioMetaLinha[]
  colofao: DiarioColofao
  ticker: string[]
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const SP_TZ = 'America/Sao_Paulo'
const NBSP = ' '

/** Ordem canônica número → área (spec Diário v5). */
const AREAS_CANONICAS: ReadonlyArray<{ key: ModuleKey; n: string; nome: string }> = [
  { key: 'financas', n: '01', nome: 'Finanças' },
  { key: 'futuro', n: '02', nome: 'Futuro' },
  { key: 'tempo', n: '03', nome: 'Tempo' },
  { key: 'corpo', n: '04', nome: 'Corpo' },
  { key: 'mente', n: '05', nome: 'Mente' },
  { key: 'patrimonio', n: '06', nome: 'Patrimônio' },
  { key: 'carreira', n: '07', nome: 'Carreira' },
  { key: 'experiencias', n: '08', nome: 'Experiências' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * fmtBRL com espaço pós-R$ trocado por NBSP (padrão v5, sem alterar o helper
 * global). Negativo segue a máscara do DS: en-dash + espaço + valor absoluto.
 */
const fmtV5 = (n: number): string => {
  const abs = fmtBRL(Math.abs(n)).replace(/^R\$ /, `R$${NBSP}`)
  return n < 0 ? `– ${abs}` : abs
}

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo. */
function spTodayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

/** "dezembro 2026" a partir de YYYY-MM-DD; string vazia se inválida. */
function mesAnoPt(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.toLocaleDateString('pt-BR', { month: 'long' })} ${d.getFullYear()}`
}

function diasLabel(n: number): string {
  return n === 1 ? 'dia' : 'dias'
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Agregação client dos hooks v3 para o Diário v5. SEM lógica de negócio nova:
 * só junta, filtra e formata o que os hooks reais entregam. Todo caminho degrada
 * gracioso (tabela ausente → hook devolve vazio → campo null/[] aqui).
 */
export function useDiario(): DiarioData {
  // Data de referência estável para a semana da agenda (identidade fixa por montagem).
  const [refDate] = useState(() => new Date())

  const todayISO = spTodayISO()
  const [anoStr, mesStr] = todayISO.split('-')
  const month = Number(mesStr)
  const year = Number(anoStr)

  // Hooks v3 — sempre chamados incondicionalmente (rules of hooks).
  const scoreEngine = useScoreEngine()
  const lifeScore = useLifeScore()
  const budgetsQ = useBudgets({ month, year })
  const agenda = useAgenda({ mode: 'week', referenceDate: refDate })
  const recorrentes = useRecorrentes()
  const metasQ = useMetas({ status: 'active' })
  const streakQ = useStreak()
  const userBadgesQ = useUserBadges()
  const badgesQ = useBadges()

  // ── score ──────────────────────────────────────────────────────────────────
  const deltaWeek = lifeScore.deltaWeek !== null ? Math.round(lifeScore.deltaWeek) : 0
  const score: DiarioScore | null = scoreEngine.result
    ? {
        total: Math.round(scoreEngine.result.total),
        deltaWeek,
        label: scoreEngine.result.label,
      }
    : null

  // ── nums ───────────────────────────────────────────────────────────────────
  let nums: DiarioNums | null = null
  if (!budgetsQ.isLoading && !budgetsQ.error) {
    const receitas = budgetsQ.receitasMes
    const despesas = budgetsQ.totalDespesas
    const saldo = receitas - despesas
    nums = {
      receitas,
      despesas,
      saldo,
      poupancaPct: receitas > 0 ? Math.round((saldo / receitas) * 100) : 0,
    }
  }

  // Orçamento mais tenso (maior % gasto). budgets já vem ordenado por pct desc.
  const maisTenso: BudgetWithSpend | null =
    budgetsQ.budgets.length > 0 && budgetsQ.budgets[0].pct > 0 ? budgetsQ.budgets[0] : null
  const maisTensoNome = maisTenso?.category?.name ?? 'Orçamento'

  // ── hoje ───────────────────────────────────────────────────────────────────
  const eventosHoje: DiarioHojeItem[] = agenda.events
    .filter(e => e.date === todayISO)
    .map(e => ({
      t: e.start_time ? e.start_time.slice(0, 5) : 'Hoje',
      tx: e.title,
    }))

  const contasProximas = recorrentes.upcomingOccurrences.filter(o => o.daysLeft <= 7)

  const contasHoje: DiarioHojeItem[] = contasProximas.map(o => ({
    t: fmtV5(o.amount),
    tx: o.name,
    tag: o.daysLeft <= 0 ? 'HOJE' : o.daysLeft === 1 ? 'AMANHÃ' : `EM ${o.daysLeft} DIAS`,
    due: o.daysLeft <= 3,
    money: true,
  }))

  const hoje = [...eventosHoje, ...contasHoje].slice(0, 6)

  // ── areas ──────────────────────────────────────────────────────────────────
  // "Ativas" = módulos presentes em result.modules: o score engine já filtra por
  // profiles.active_modules ao calcular, então o resultado carrega a mesma fonte.
  const areaScore = new Map<ModuleKey, number>()
  for (const m of scoreEngine.result?.modules ?? []) {
    areaScore.set(m.module, Math.round(m.score))
  }

  const semanaAtras = lifeScore.history.length >= 7 ? lifeScore.history[6] : null

  const buildArea = (def: { key: ModuleKey; n: string; nome: string }): AreaLinha => {
    // Área inativa (fora de result.modules): score/tendencia ficam undefined,
    // renderizar 0 seria número fabricado.
    const scoreArea = areaScore.get(def.key)

    let tendencia: number | undefined
    if (scoreArea !== undefined) {
      tendencia = 0
      if (semanaAtras) {
        const col: `${ModuleKey}_score` = `${def.key}_score`
        const anterior = semanaAtras[col]
        if (typeof anterior === 'number') tendencia = Math.round(scoreArea - anterior)
      }
    }

    let meta = ''
    if (def.key === 'financas' && nums) {
      meta = `Saldo ${fmtV5(nums.saldo)}`
      if (maisTenso) meta += ` · ${maisTensoNome} ${maisTenso.pct}%`
    } else if (def.key === 'futuro' && !metasQ.isLoading && !metasQ.error) {
      const goals = metasQ.goals
      if (goals.length === 0) {
        meta = '0 metas ativas'
      } else {
        const media = Math.round(
          goals.reduce((s, g) => s + calcProgress(g.current_amount, g.target_amount), 0) / goals.length,
        )
        meta = `${goals.length} ${goals.length === 1 ? 'meta' : 'metas'} · ${media}%`
      }
    }

    return { n: def.n, nome: def.nome, score: scoreArea, tendencia, meta }
  }

  const areas: DiarioAreas = scoreEngine.result
    ? {
        ativas: AREAS_CANONICAS.filter(a => areaScore.has(a.key)).map(buildArea),
        outras: AREAS_CANONICAS.filter(a => !areaScore.has(a.key)).map(buildArea),
      }
    : { ativas: [], outras: [] }

  // ── atencao (máx 4) ────────────────────────────────────────────────────────
  const atencao: DiarioAtencao[] = []

  for (const b of budgetsQ.budgets) {
    if (atencao.length >= 4) break
    if (b.pct <= 70) continue
    atencao.push({
      tipo: b.pct > 85 ? 'danger' : 'warn',
      strong: b.category?.name ?? 'Orçamento',
      texto: `usou ${b.pct}% do orçamento`,
      valor: `${fmtV5(b.gasto)} / ${fmtV5(b.amount)}`,
    })
  }

  for (const o of contasProximas) {
    if (atencao.length >= 4) break
    if (o.daysLeft > 3) continue
    atencao.push({
      tipo: 'warn',
      strong: o.name,
      texto:
        o.daysLeft <= 0 ? 'vence hoje' : o.daysLeft === 1 ? 'vence amanhã' : `vence em ${o.daysLeft} dias`,
      valor: fmtV5(o.amount),
    })
  }

  const streakDias = streakQ.streak?.current_streak ?? 0
  if (streakDias > 0 && atencao.length < 4) {
    atencao.push({
      tipo: 'ok',
      strong: 'Streak',
      texto: `de atividade chega a ${streakDias} ${diasLabel(streakDias)}`,
      valor: `${streakDias}d`,
    })
  }

  // ── metas (top 3 por proximidade do alvo) ──────────────────────────────────
  const metas: DiarioMetaLinha[] = [...metasQ.goals]
    .map(g => ({ g, pct: calcProgress(g.current_amount, g.target_amount) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map(({ g, pct }) => {
      const prazo = g.target_date ? mesAnoPt(g.target_date) : ''
      return {
        nome: g.name,
        pct,
        sub: `${fmtV5(g.current_amount)} de ${fmtV5(g.target_amount)}` + (prazo ? ` · ${prazo}` : ''),
      }
    })

  // ── colofao ────────────────────────────────────────────────────────────────
  // recorded_date é DATE puro (sem hora): usar a hora dele geraria 00:00 UTC
  // convertido, então só aproveitamos se vier com timestamp; senão, agora.
  const recorded = lifeScore.score?.recorded_date
  const sincDate = recorded && recorded.includes('T') ? new Date(recorded) : new Date()
  const ultimaSinc = sincDate.toLocaleTimeString('pt-BR', {
    timeZone: SP_TZ,
    hour: '2-digit',
    minute: '2-digit',
  })

  const colofao: DiarioColofao = {
    saldoMes: nums ? fmtV5(nums.saldo) : '–',
    streakDias,
    badges: badgesQ.badges.length > 0 ? `${userBadgesQ.userBadges.length}/${badgesQ.badges.length}` : '–',
    ultimaSinc,
  }

  // ── ticker (só itens com dado real) ────────────────────────────────────────
  const ticker: string[] = []
  if (score) {
    ticker.push(
      score.deltaWeek !== 0
        ? `SCORE ${score.total} ${score.deltaWeek > 0 ? '▲' : '▼'}${Math.abs(score.deltaWeek)}`
        : `SCORE ${score.total}`,
    )
  }
  if (nums && nums.receitas > 0) ticker.push(`POUPANÇA ${nums.poupancaPct}%`)
  if (maisTenso) ticker.push(`${maisTensoNome.toUpperCase()} ${maisTenso.pct}% DO ORÇAMENTO`)
  const proximaConta = recorrentes.upcomingOccurrences[0]
  if (proximaConta) {
    const nome = proximaConta.name.toUpperCase()
    ticker.push(
      proximaConta.daysLeft <= 0
        ? `${nome} HOJE`
        : proximaConta.daysLeft === 1
          ? `${nome} AMANHÃ`
          : `${nome} EM ${proximaConta.daysLeft} DIAS`,
    )
  }

  // ── loading agregado ───────────────────────────────────────────────────────
  const loading =
    scoreEngine.loading ||
    lifeScore.loading ||
    budgetsQ.isLoading ||
    agenda.loading ||
    recorrentes.loading ||
    metasQ.isLoading ||
    streakQ.loading ||
    userBadgesQ.loading ||
    badgesQ.loading

  return { loading, score, nums, hoje, areas, atencao, metas, colofao, ticker }
}
