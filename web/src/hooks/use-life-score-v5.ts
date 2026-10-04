'use client'

// Life Score v2 (Fase 1, Task 13): agrega o motor OFICIAL (useScoreEngine, que
// já lê profiles.active_modules e persiste o dia em life_sync_scores) e o
// histórico de 30 registros (useLifeScore). Nada de useLifeMap. A conta da
// composição (pesos efetivos, contribuição, como melhorar, o que mais pesou)
// é pura e mora em lib/life-score.
import { useMemo } from 'react'
import { useScoreEngine } from '@/hooks/use-score-engine'
import { useLifeScore } from '@/hooks/use-panorama'
import type { ModuleScoreDetail } from '@/lib/score-utils'
import {
  compor, comoMelhorar, deltaSemana, maisPesou, serieComHoje,
  type AreaComposta, type Composicao, type Melhoria, type RegistroScore,
} from '@/lib/life-score/composicao'
import { resumoCurva, type ResumoCurva } from '@/lib/life-score/curva'

export interface LifeScoreV5 {
  loading: boolean
  /** null: motor sem resultado (sem usuário ou falha silenciosa do motor) */
  total: number | null
  label: string
  modules: ModuleScoreDetail[]
  composicao: Composicao | null
  /** total − 7º registro; null com menos de 7 registros */
  deltaSemana: number | null
  /** score do 7º registro (o "de" de "de 75 para 78") */
  scoreSemanaPassada: number | null
  maisPesou: AreaComposta | null
  melhorias: Melhoria[]
  /** série cronológica (mais antigo primeiro), até 30 registros, com hoje no fim */
  serie: number[]
  curva: ResumoCurva | null
  /** registros de histórico disponíveis (a curva aparece a partir do 7º) */
  registros: number
  componentes: number
  /** HH:MM (SP) do cálculo do motor exibido */
  calculadoAs: string | null
  /** YYYY-MM-DD (SP) de hoje */
  hojeSP: string
}

const SP_TZ = 'America/Sao_Paulo'

export function useLifeScoreV5(): LifeScoreV5 {
  const engine = useScoreEngine()
  const ls = useLifeScore()

  return useMemo(() => {
    const result = engine.result
    const agora = new Date()
    const loading = engine.loading || ls.loading
    const historico = ls.history as unknown as RegistroScore[]
    // o motor grava o dia com a data UTC (persistLifeScore); a série segue a mesma chave
    const hoje: RegistroScore | null = result
      ? {
          score: result.total,
          recorded_date: agora.toISOString().slice(0, 10),
          ...Object.fromEntries(result.modules.map((m) => [`${m.module}_score`, m.score])),
        }
      : null
    const serieDesc = serieComHoje(historico, hoje)
    const composicao = result ? compor(result.modules, serieDesc) : null
    const serie = serieDesc.map((r) => r.score).reverse()
    const ds = deltaSemana(serieDesc, null)
    return {
      loading,
      total: result ? result.total : null,
      label: result?.label ?? '',
      modules: result?.modules ?? [],
      composicao,
      deltaSemana: ds,
      scoreSemanaPassada: serieDesc.length >= 7 ? serieDesc[6].score : null,
      maisPesou: composicao ? maisPesou(composicao) : null,
      melhorias: result ? comoMelhorar(result.modules) : [],
      serie,
      curva: resumoCurva(serie),
      registros: serieDesc.length,
      componentes: (result?.modules ?? []).reduce((s, m) => s + (m.detalhes?.length ?? 0), 0),
      calculadoAs: result
        ? agora.toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit' })
        : null,
      hojeSP: agora.toLocaleDateString('en-CA', { timeZone: SP_TZ }),
    }
  }, [engine.result, engine.loading, ls.history, ls.loading])
}
