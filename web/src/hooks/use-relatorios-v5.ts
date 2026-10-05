'use client'

// Fase 2 · dados da tela Relatórios v5 (prototypes/v5/app/financas-relatorios.html).
// Uma consulta por período (troca de pílula recarrega na hora, sem botão "Gerar"):
// transações do período e do período anterior (paginadas de 1000 em 1000, o limite do
// Supabase), início do histórico e meta de poupança do perfil. Os números, os gráficos e as
// linhas de Sy saem de `lib/financas/relatorios` (puro). Sem chamada a IA.

import { useCallback, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  mesesDoPeriodo, montarRelatorio, opcoesMes, ultimoDia, addMes,
  type PeriodoKey, type Relatorio, type TxRel,
} from '@/lib/financas/relatorios'

const SP_TZ = 'America/Sao_Paulo'
const PAGINA = 1000
const MAX_PAGINAS = 30

interface TxRow {
  id: string
  description: string | null
  amount: number | string
  type: 'income' | 'expense' | 'transfer'
  date: string
  payment_method: string | null
  notes: string | null
  category: { name: string } | null
}

interface Pacote {
  key: PeriodoKey
  sel: string[]
  prev: string[]
  hoje: string
  txs: TxRel[]
  historicoInicio: string | null
  metaPct: number
}

function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

function horaSP(ms: number): string {
  const [h, m] = new Date(ms)
    .toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .split(':')
  return `${Number(h)}h${m}`
}

async function buscar(key: PeriodoKey, hoje: string, de: string, ate: string): Promise<Pacote> {
  const { sel, prev } = mesesDoPeriodo({ key, hoje, de, ate })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão expirada.')

  const inicio = `${prev[0]}-01`
  const fim = `${sel[sel.length - 1]}-${String(ultimoDia(sel[sel.length - 1])).padStart(2, '0')}`

  // schema drift (savings_goal_pct e a join de categorias fora do Database manual)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }

  const lerPaginas = async (): Promise<TxRow[]> => {
    const todas: TxRow[] = []
    for (let p = 0; p < MAX_PAGINAS; p++) {
      const { data, error } = await sb
        .from('transactions')
        .select('id, description, amount, type, date, payment_method, notes, category:categories(name)')
        .eq('user_id', user.id)
        .eq('is_future', false)
        .gte('date', inicio)
        .lte('date', fim)
        .order('date', { ascending: true })
        .order('id', { ascending: true })
        .range(p * PAGINA, p * PAGINA + PAGINA - 1) as { data: TxRow[] | null; error: unknown }
      if (error) throw new Error('Falha ao ler as transações.')
      const lote = data ?? []
      todas.push(...lote)
      if (lote.length < PAGINA) break
    }
    return todas
  }

  const [rows, primeira, perfil] = await Promise.all([
    lerPaginas(),
    sb.from('transactions').select('date').eq('user_id', user.id).eq('is_future', false)
      .order('date', { ascending: true }).limit(1) as Promise<{ data: { date: string }[] | null; error: unknown }>,
    sb.from('profiles').select('savings_goal_pct').eq('id', user.id).maybeSingle() as Promise<{
      data: { savings_goal_pct: number | null } | null; error: unknown
    }>,
  ])

  return {
    key,
    sel,
    prev,
    hoje,
    txs: rows.map(r => ({
      id: r.id,
      date: r.date,
      amount: Number(r.amount),
      type: r.type,
      description: r.description,
      category: r.category?.name ?? null,
      payment_method: r.payment_method,
      notes: r.notes,
    })),
    historicoInicio: primeira.error ? null : primeira.data?.[0]?.date ?? null,
    metaPct: perfil.error ? 20 : perfil.data?.savings_goal_pct ?? 20,
  }
}

export interface RelatoriosV5Data {
  key: PeriodoKey
  de: string
  ate: string
  setKey: (k: PeriodoKey) => void
  setDe: (ym: string) => void
  setAte: (ym: string) => void
  opcoes: { value: string; label: string }[]
  /** primeira carga: sem nada para mostrar ainda */
  loading: boolean
  /** troca de período em andamento: o conteúdo anterior fica a 35% até chegar o novo */
  recarregando: boolean
  erro: boolean
  tentarDeNovo: () => void
  rel: Relatorio | null
  atualizadoAs: string
}

export function useRelatoriosV5(): RelatoriosV5Data {
  // o "hoje" é fixado na montagem (SP), como no hub
  const [hoje] = useState(hojeSP)
  const cur = hoje.slice(0, 7)
  const [key, setKey] = useState<PeriodoKey>('tri')
  const [de, setDe] = useState(() => addMes(cur, -2))
  const [ate, setAte] = useState(cur)

  // de/ate só entram na consulta quando o período é o personalizado
  const q = useQuery({
    queryKey: ['relatorios-v5', key, key === 'custom' ? de : '', key === 'custom' ? ate : '', hoje],
    queryFn: () => buscar(key, hoje, de, ate),
    retry: 1,
    placeholderData: keepPreviousData,
  })

  const pacote = q.isError ? undefined : q.data
  const rel = useMemo<Relatorio | null>(() => {
    if (!pacote) return null
    return montarRelatorio({
      txs: pacote.txs, key: pacote.key, sel: pacote.sel, prev: pacote.prev, hoje: pacote.hoje,
      historicoInicio: pacote.historicoInicio, metaPct: pacote.metaPct,
    })
  }, [pacote])

  const opcoes = useMemo(() => opcoesMes(hoje, pacote?.historicoInicio ?? null), [hoje, pacote?.historicoInicio])
  const refetch = q.refetch
  const tentarDeNovo = useCallback(() => { void refetch() }, [refetch])

  return {
    key, de, ate, setKey, setDe, setAte, opcoes,
    loading: q.isPending,
    recarregando: q.isFetching && !q.isPending,
    erro: q.isError,
    tentarDeNovo,
    rel,
    atualizadoAs: q.dataUpdatedAt ? horaSP(q.dataUpdatedAt) : '--h--',
  }
}
