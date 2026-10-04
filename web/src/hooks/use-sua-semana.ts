'use client'

// Sua semana (Fase 1, Task 14). Semana = segunda a domingo em SP.
// Fontes: useAgenda('week') → compromissos; useFocusSessions('week') → foco;
// transactions da semana (mesma query de use-transactions, só as colunas usadas);
// useLifeScore().history → score de início (7º registro) e fim, "o que mudou"
// por área ativa (profiles.active_modules); weekly_reviews → fechada.
// fechar() corrige o bug do v3 (review/page.tsx mandava coluna inexistente e
// omitia week_end): upsert com onConflict user_id,week_start, depois streak e XP.

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAgenda } from '@/hooks/use-agenda'
import { useFocusSessions } from '@/hooks/use-focus-sessions'
import { useLifeScore, useStreak, updateStreak } from '@/hooks/use-panorama'
import { addXP } from '@/hooks/use-xp'
import {
  semanaSP, rotuloSemana, financasSemana, compromissosSemana, focoSemana,
  scoreSemana, oQueMudou, payloadFechamento, horaSP, AREAS_SEMANA,
  type AreaKey, type RegistroSemana, type SemanaSP, type Mudanca, type TxSemana,
} from '@/lib/semana/semana'
import type { AgendaEvent } from '@/hooks/use-agenda'

// schema drift (weekly_reviews da 029, active_modules): contorno tipado da casa
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = { from: (t: string) => any; auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } }

interface ReviewRow { completed_at: string | null }

export interface SuaSemana {
  loading: boolean
  semana: SemanaSP
  rotulo: string
  entradas: number
  saidas: number
  nTransacoes: number
  feitos: number
  total: number
  pendentes: AgendaEvent[]
  focoMin: number
  focoSessoes: number
  scoreInicio: number | null
  scoreFim: number | null
  delta: number | null
  mudou: Mudanca[]
  ativas: AreaKey[]
  inativas: typeof AREAS_SEMANA
  streakDias: number
  fechada: boolean
  /** HH:MM (SP) do fechamento */
  fechadaAs: string | null
  /** HH:MM (SP) da leitura dos dados */
  atualizadoAs: string
  fechando: boolean
  erroFechar: boolean
  fechar: () => Promise<boolean>
}

const ALL_AREAS = AREAS_SEMANA.map((a) => a.key)

export function useSuaSemana(): SuaSemana {
  // âncora estável: a semana não muda enquanto a tela está aberta
  const [agora] = useState(() => new Date())
  const semana = useMemo(() => semanaSP(agora), [agora])
  const qc = useQueryClient()

  const agenda = useAgenda({ mode: 'week', referenceDate: agora })
  const foco = useFocusSessions('week')
  const ls = useLifeScore()
  const streak = useStreak()

  const txQ = useQuery({
    queryKey: ['v5-semana-tx', semana.inicio, semana.fim],
    queryFn: async (): Promise<TxSemana[]> => {
      const sb = createClient() as unknown as Sb
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return []
      const { data, error } = await sb
        .from('transactions')
        .select('amount, type, is_future')
        .eq('user_id', user.id)
        .gte('date', semana.inicio)
        .lte('date', semana.fim)
      if (error) throw new Error(error.message)
      return (data ?? []) as TxSemana[]
    },
  })

  const ativasQ = useQuery({
    queryKey: ['v5-active-modules'],
    queryFn: async (): Promise<AreaKey[]> => {
      const sb = createClient() as unknown as Sb
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return []
      const { data } = await sb.from('profiles').select('active_modules').eq('id', user.id).maybeSingle()
      const mods = (data as { active_modules: string[] | null } | null)?.active_modules
      // mesmo default do motor (calculateAllScores): sem lista, todas as áreas
      return (mods ?? ALL_AREAS).filter((m): m is AreaKey => (ALL_AREAS as string[]).includes(m))
    },
  })

  const reviewKey = ['v5-weekly-review', semana.inicio]
  const reviewQ = useQuery({
    queryKey: reviewKey,
    queryFn: async (): Promise<ReviewRow | null> => {
      const sb = createClient() as unknown as Sb
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return null
      const { data } = await sb
        .from('weekly_reviews')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('week_start', semana.inicio)
        .maybeSingle()
      return (data as ReviewRow | null) ?? null
    },
  })

  const [fechando, setFechando] = useState(false)
  const [erroFechar, setErroFechar] = useState(false)

  const derivado = useMemo(() => {
    const fin = financasSemana(txQ.data ?? [])
    const comp = compromissosSemana(agenda.events, semana.inicio, semana.fim)
    const fo = focoSemana(foco.sessions, semana.inicio, semana.fim)
    const serie = ls.history as unknown as RegistroSemana[]
    const sc = scoreSemana(serie)
    const ativas = ativasQ.data ?? []
    return { fin, comp, fo, sc, mudou: oQueMudou(serie, ativas), ativas }
  }, [txQ.data, agenda.events, foco.sessions, ls.history, ativasQ.data, semana.inicio, semana.fim])

  const { fin, comp, fo, sc } = derivado

  const fechar = useCallback(async (): Promise<boolean> => {
    if (fechando) return false
    setFechando(true)
    setErroFechar(false)
    try {
      const sb = createClient() as unknown as Sb
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error('sem usuário')
      const row = payloadFechamento({
        userId: user.id,
        semana,
        agoraIso: new Date().toISOString(),
        scoreInicio: sc.inicio,
        scoreFim: sc.fim,
        entradas: fin.entradas,
        saidas: fin.saidas,
        feitos: comp.feitos,
        total: comp.total,
        focoMin: fo.minutos,
      })
      const { error } = await sb.from('weekly_reviews').upsert(row, { onConflict: 'user_id,week_start' })
      if (error) throw new Error(error.message)
      await updateStreak(user.id)
      await addXP(user.id, 'review_completed')
      qc.setQueryData(reviewKey, { completed_at: row.completed_at })
      streak.refresh()
      return true
    } catch {
      setErroFechar(true)
      return false
    } finally {
      setFechando(false)
    }
    // reviewKey deriva de semana.inicio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechando, semana, sc.inicio, sc.fim, fin.entradas, fin.saidas, comp.feitos, comp.total, fo.minutos, qc, streak.refresh])

  const completedAt = reviewQ.data?.completed_at ?? null

  return {
    loading: agenda.loading || foco.loading || ls.loading || txQ.isLoading || ativasQ.isLoading || reviewQ.isLoading,
    semana,
    rotulo: rotuloSemana(semana.inicio, semana.fim),
    entradas: fin.entradas,
    saidas: fin.saidas,
    nTransacoes: fin.n,
    feitos: comp.feitos,
    total: comp.total,
    pendentes: comp.pendentes,
    focoMin: fo.minutos,
    focoSessoes: fo.sessoes,
    scoreInicio: sc.inicio,
    scoreFim: sc.fim,
    delta: sc.delta,
    mudou: derivado.mudou,
    ativas: derivado.ativas,
    inativas: AREAS_SEMANA.filter((a) => !derivado.ativas.includes(a.key)),
    streakDias: streak.streak?.current_streak ?? 0,
    fechada: Boolean(completedAt),
    fechadaAs: completedAt ? horaSP(new Date(completedAt)) : null,
    atualizadoAs: horaSP(agora),
    fechando,
    erroFechar,
    fechar,
  }
}
