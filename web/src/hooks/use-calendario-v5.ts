'use client'

// Fase 2 · dados do Calendário v5 (prototypes/v5/app/financas-calendario.html).
// Uma leitura do mês escolhido (qualquer mês, não só o corrente) sob a chave
// ['transactions', 'v5', 'calendario', ...]: as mutações do hook v3 (`useTransactionMutations`,
// que invalidam ['transactions']) a atualizam sozinhas. Transações do mês (com contas, para o painel
// de edição), eventos planejados do mês (linha inteira, para o painel de evento) e proventos
// anunciados de Patrimônio (status `announced`, só leitura). As recorrentes e a projeção vêm de
// `usePlanejamento` (v3): a projeção do mês é a MESMA de Planejamento e do hub, não outra conta.
// O saldo exibido é o do mês (lib/financas/calendario), nunca `profiles.current_balance`.

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCategories } from '@/hooks/use-categories'
import { entradaProjecao, usePlanejamento, type PlanningEvent } from '@/hooks/use-planejamento'
import { hojeSP, projetar } from '@/lib/financas/planejamento'
import type { RecItem } from '@/lib/financas/recorrentes'
import {
  itensDoMes, projecaoDoMes, type ItemCal, type ProventoDb,
} from '@/lib/financas/calendario'
import {
  deslocarMes, intervaloMes, mesDe, mesIgual, type MesRef, type TransacaoDb,
} from '@/lib/financas/transacoes'

const SP_TZ = 'America/Sao_Paulo'

const SELECT_TX = `id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at,
  category:categories(id, name),
  account_from:user_accounts!account_from_id(id, name),
  account_to:user_accounts!account_to_id(id, name)`

// schema drift (user_accounts, is_future, planning_events fora do Database manual): mesmo contorno do hub
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = { from: (t: string) => any }

interface LeituraMes {
  transacoes: TransacaoDb[]
  eventos: PlanningEvent[]
  proventos: ProventoDb[]
}

type Res<T> = { data: T[] | null; error: { message: string } | null }

async function lerMes(mes: MesRef): Promise<LeituraMes> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { transacoes: [], eventos: [], proventos: [] }
  const sb = supabase as unknown as Sb
  const { inicio, fim } = intervaloMes(mes)

  const [tx, ev, pv] = await Promise.all([
    sb.from('transactions').select(SELECT_TX)
      .eq('user_id', user.id).gte('date', inicio).lte('date', fim)
      .order('date', { ascending: true }).order('created_at', { ascending: true })
      .range(0, 1999),
    sb.from('planning_events').select('*, categories(id, name, icon, color)')
      .eq('user_id', user.id).gte('planned_date', inicio).lte('planned_date', fim)
      .order('planned_date', { ascending: true }),
    // proventos anunciados de 06 Patrimônio (RN-PTR-13): só leitura aqui
    sb.from('portfolio_dividends').select('id, total_amount, payment_date, status, portfolio_assets(ticker)')
      .eq('user_id', user.id).eq('status', 'announced').gte('payment_date', inicio).lte('payment_date', fim),
  ]) as [Res<TransacaoDb>, Res<PlanningEvent>, Res<ProventoDb>]

  if (tx.error) throw new Error('Falha ao ler as transações do mês.')
  // eventos e proventos são complementares: se falharem, o mês aparece sem eles em vez de quebrar a grade
  return { transacoes: tx.data ?? [], eventos: ev.data ?? [], proventos: pv.data ?? [] }
}

export interface CalendarioV5Data {
  hoje: string
  mes: MesRef
  mesAtual: boolean
  irPara: (m: MesRef) => void
  mesAnterior: () => void
  mesSeguinte: () => void
  voltarHoje: () => void
  /** tudo o que está no mês: o que aconteceu e o que está marcado */
  itens: ItemCal[]
  /** transações reais do mês (quantidade para o rodapé) */
  quantidadeTx: number
  /** o evento planejado completo, para o painel de edição */
  eventoPorId: (id: string) => PlanningEvent | null
  /** projeção do mês (a de Planejamento e do hub), ou null quando o mês não tem */
  projecao: number | null
  loading: boolean
  erro: boolean
  recarregar: () => void
  /** depois de gravar pelos painéis: recarrega o mês e a projeção */
  aposMutar: () => void
  ultimaSinc: string
}

export function useCalendarioV5(): CalendarioV5Data {
  const [hoje] = useState(() => hojeSP())
  const atual = useMemo(() => mesDe(hoje), [hoje])
  const [mes, setMes] = useState<MesRef>(atual)
  const qc = useQueryClient()
  const plan = usePlanejamento()
  const { categories } = useCategories()

  const q = useQuery({
    queryKey: ['transactions', 'v5', 'calendario', `${mes.ano}-${mes.mes}`],
    queryFn: () => lerMes(mes),
  })

  // a primeira carga de Planejamento libera a grade; as seguintes (refresh) não piscam o esqueleto
  const [planPronto, setPlanPronto] = useState(false)
  if (!plan.loading && !planPronto) setPlanPronto(true)

  const recorrentes = useMemo<RecItem[]>(() => {
    const nome = new Map(categories.map(c => [c.id, c.name]))
    return plan.recurringItems.map(r => ({
      id: r.id,
      nome: r.name,
      valor: Number(r.amount),
      tipo: r.type,
      freq: r.frequency,
      dia: r.day_of_month,
      inicio: r.start_date,
      fim: r.end_date,
      pausada: r.is_paused,
      categoria: r.category_id ? nome.get(r.category_id) ?? null : null,
      nota: r.notes,
    }))
  }, [plan.recurringItems, categories])

  const dados = q.data
  const itens = useMemo<ItemCal[]>(
    () => (dados ? itensDoMes({ transacoes: dados.transacoes, eventos: dados.eventos, proventos: dados.proventos, recorrentes }, mes, hoje) : []),
    [dados, recorrentes, mes, hoje],
  )

  // a projeção é a de Planejamento (cenário realista): mesma entrada pura, mesma série
  const serie = useMemo(
    () => (planPronto ? projetar(entradaProjecao(plan.recurringItems, plan.planningEvents, plan.currentBalance, plan.variavel, hoje), 'realista') : null),
    [planPronto, plan.recurringItems, plan.planningEvents, plan.currentBalance, plan.variavel, hoje],
  )
  const projecao = useMemo(() => projecaoDoMes(serie, mes, hoje), [serie, mes, hoje])

  const refreshPlan = plan.refresh
  const aposMutar = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['transactions', 'v5', 'calendario'] })
    refreshPlan()
  }, [qc, refreshPlan])

  const refetch = q.refetch
  const recarregar = useCallback(() => {
    void refetch()
    refreshPlan()
  }, [refetch, refreshPlan])

  const eventos = dados?.eventos
  const eventoPorId = useCallback((id: string): PlanningEvent | null => eventos?.find(e => e.id === id) ?? null, [eventos])

  const sinc = q.dataUpdatedAt
  const ultimaSinc = sinc
    ? new Date(sinc).toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    : ''

  return {
    hoje,
    mes,
    mesAtual: mesIgual(mes, atual),
    irPara: setMes,
    mesAnterior: () => setMes(m => deslocarMes(m, -1)),
    mesSeguinte: () => setMes(m => deslocarMes(m, 1)),
    voltarHoje: () => setMes(atual),
    itens,
    quantidadeTx: dados?.transacoes.length ?? 0,
    eventoPorId,
    projecao,
    loading: q.isLoading || !planPronto,
    erro: q.isError || !!plan.error,
    recarregar,
    aposMutar,
    ultimaSinc,
  }
}
