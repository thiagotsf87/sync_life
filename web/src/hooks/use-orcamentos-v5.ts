'use client'

// Fase 2 · dados da tela Orçamentos v5 (prototypes/v5/app/financas-orcamentos.html).
// Adaptador sobre o hook v3 (useBudgets: envelopes, gasto, rollover, copiar do mês anterior,
// criar/editar/excluir) + UMA query das transações do mês (fora de envelope e contagem) +
// o que o laboratório do teto precisa (fechamento projetado de usePlanejamento e a meta
// ativa de useMetas). A aritmética mora em lib/financas/orcamentos.

import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useBudgets, type EnvelopeFormData } from '@/hooks/use-budgets'
import { useCategories } from '@/hooks/use-categories'
import { useMetas } from '@/hooks/use-metas'
import { usePlanejamento } from '@/hooks/use-planejamento'
import {
  diasRestantes, estadoEnvelope, foraDeEnvelope, ordenarEnvelopes, pctEnvelope, type EnvelopeCalc, type GastoCategoria, type MetaLab,
} from '@/lib/financas/orcamentos'

const SP_TZ = 'America/Sao_Paulo'
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const pad2 = (n: number) => String(n).padStart(2, '0')
const hojeSP = () => new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })

function horaSP(ms: number, sep: ':' | 'h'): string {
  const [h, m] = new Date(ms)
    .toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .split(':')
  return sep === 'h' ? `${Number(h)}h${m}` : `${h}:${m}`
}

export interface EnvelopeV5 extends EnvelopeCalc {
  id: string
  categoriaId: string
  rollover: boolean
  notas: string
}

export interface EnvelopePrevio {
  id: string
  categoriaId: string
  categoria: string
  limite: number
}

export interface FormEnvelope {
  limite: number
  alerta: number
  rollover: boolean
  notas: string
}

interface TxMes {
  category_id: string | null
  amount: number
  type: 'income' | 'expense'
  category: { id: string; name: string } | null
}

export interface OrcamentosV5Data {
  loading: boolean
  erro: boolean
  tentarDeNovo: () => void
  mes: number
  ano: number
  mesNome: string
  mesAntNome: string
  mesProxNome: string
  /** o mês aberto é o mês corrente (laboratório só aí: o fechamento projetado é de hoje) */
  mesCorrente: boolean
  irMes: (delta: -1 | 1) => void
  dias: number
  envelopes: EnvelopeV5[]
  receitas: number
  rendaPerfil: number
  fora: GastoCategoria[]
  categoriasLivres: { id: string; nome: string }[]
  txCount: number
  /** hora da última leitura ("7h12" e "07:12"); '--' enquanto carrega */
  atualizadoAs: string
  ultimaSinc: string
  anteriores: EnvelopePrevio[]
  fechamentoBase: number | null
  saldoMes: number
  meta: MetaLab | null
  /** id do envelope do laboratório (Lazer; senão o mais tenso); null = sem laboratório */
  labEnvelopeId: string | null
  /** devolve o id do envelope criado */
  criar: (categoriaId: string, f: FormEnvelope) => Promise<string>
  salvar: (id: string, f: FormEnvelope) => Promise<void>
  excluir: (id: string) => Promise<void>
  copiar: (ids: string[]) => Promise<void>
}

async function fetchTxMes(ano: number, mes: number): Promise<TxMes[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const inicio = `${ano}-${pad2(mes)}-01`
  const fim = `${ano}-${pad2(mes)}-${pad2(new Date(ano, mes, 0).getDate())}`
  // join com categories fora do Database manual: contorno tipado como em use-financas-v5
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }
  const { data, error }: { data: TxMes[] | null; error: unknown } = await sb
    .from('transactions')
    .select('category_id, amount, type, category:categories(id, name)')
    .eq('user_id', user.id)
    .eq('is_future', false)
    .neq('type', 'transfer')
    .gte('date', inicio)
    .lte('date', fim)
  if (error) throw new Error('Falha ao ler as transações do mês.')
  return data ?? []
}

export function useOrcamentosV5(): OrcamentosV5Data {
  const [hojeISO] = useState(hojeSP)
  const hojeAno = Number(hojeISO.slice(0, 4))
  const hojeMes = Number(hojeISO.slice(5, 7))
  const [ref, setRef] = useState({ mes: hojeMes, ano: hojeAno })
  const { mes, ano } = ref

  const budgets = useBudgets({ month: mes, year: ano })
  const { categories } = useCategories()
  const metasQ = useMetas({ status: 'active' })
  const plan = usePlanejamento()
  const txQ = useQuery({ queryKey: ['orcamentos-v5', 'tx', ano, mes], queryFn: () => fetchTxMes(ano, mes) })

  const { create, update, remove, copyFromPreviousMonth, refresh } = budgets
  const refetchTx = txQ.refetch

  const irMes = useCallback((delta: -1 | 1) => {
    setRef(r => {
      const i = r.ano * 12 + (r.mes - 1) + delta
      return { ano: Math.floor(i / 12), mes: (i % 12) + 1 }
    })
  }, [])

  const tentarDeNovo = useCallback(() => {
    refresh()
    void refetchTx()
  }, [refresh, refetchTx])

  const criar = useCallback(async (categoriaId: string, f: FormEnvelope): Promise<string> => {
    const data: EnvelopeFormData = {
      category_id: categoriaId, amount: f.limite, month: mes, year: ano,
      alert_threshold: f.alerta, rollover: f.rollover, notes: f.notas.trim() || undefined,
    }
    const criado = await create(data)
    return criado.id
  }, [create, mes, ano])

  // grava só o limite BASE (nunca o efetivo) e não troca a categoria
  const salvar = useCallback(async (id: string, f: FormEnvelope) => {
    await update(id, { amount: f.limite, alert_threshold: f.alerta, rollover: f.rollover, notes: f.notas.trim() || undefined })
  }, [update])

  const excluir = useCallback(async (id: string) => { await remove(id) }, [remove])
  const copiar = useCallback(async (ids: string[]) => { await copyFromPreviousMonth(ids) }, [copyFromPreviousMonth])

  return useMemo((): OrcamentosV5Data => {
    const envelopes: EnvelopeV5[] = ordenarEnvelopes(
      budgets.budgets.map(b => ({
        id: b.id,
        categoriaId: b.category_id,
        categoria: b.category?.name ?? 'Sem categoria',
        gasto: b.gasto,
        limiteBase: b.limiteBase,
        sobra: b.sobra,
        alerta: b.alert_threshold,
        rollover: b.rollover,
        notas: b.notes ?? '',
      })),
    )

    const txs = txQ.data ?? []
    const porCat = new Map<string, GastoCategoria>()
    for (const t of txs) {
      if (t.type !== 'expense' || !t.category_id) continue
      const atual = porCat.get(t.category_id)
      if (atual) atual.valor += Number(t.amount)
      else porCat.set(t.category_id, { categoriaId: t.category_id, nome: t.category?.name ?? 'Sem categoria', valor: Number(t.amount) })
    }
    const idsComEnvelope = new Set(envelopes.map(e => e.categoriaId))
    const fora = foraDeEnvelope([...porCat.values()], idsComEnvelope)

    const categoriasLivres = categories
      .filter(c => c.type === 'expense' && !idsComEnvelope.has(c.id))
      .map(c => ({ id: c.id, nome: c.name }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    const anteriores: EnvelopePrevio[] = budgets.prevMonthBudgets.map(b => ({
      id: b.id, categoriaId: b.category_id, categoria: b.category?.name ?? 'Sem categoria', limite: b.amount,
    }))

    const mesCorrente = mes === hojeMes && ano === hojeAno

    // fechamento projetado do mês corrente (cenário realista), só com base real: igual ao hub
    const temProjecao = plan.currentBalance !== 0 || plan.projectedEvents.some(e => e.monthIndex === 0)
    const fechamentoBase = mesCorrente && !plan.loading && temProjecao && plan.balanceData[0]
      ? plan.balanceData[0].balance
      : null

    // meta: a de viagem, senão a primeira ativa em dinheiro (mesma regra de use-meu-dia)
    const ativas = metasQ.goals.filter(g => g.status === 'active' && g.goal_type === 'monetary' && g.target_amount > 0)
    const g = ativas.find(x => /viagem|it[aá]lia/i.test(x.name)) ?? ativas[0] ?? null
    const meta: MetaLab | null = g
      ? { nome: g.name, atual: g.current_amount, alvo: g.target_amount, aporteFixo: g.monthly_contribution ?? 0 }
      : null

    const lazer = envelopes.find(e => /lazer/i.test(e.categoria))
    const tenso = [...envelopes].filter(e => estadoEnvelope(e) !== 'ok').sort((a, b) => pctEnvelope(b) - pctEnvelope(a))[0]
    const labEnvelopeId = (lazer ?? tenso)?.id ?? null

    const prevIdx = (mes + 10) % 12
    return {
      loading: budgets.isLoading || txQ.isLoading,
      erro: budgets.error !== null || txQ.isError,
      tentarDeNovo,
      mes,
      ano,
      mesNome: MESES[mes - 1],
      mesAntNome: MESES[prevIdx],
      mesProxNome: MESES[mes % 12],
      mesCorrente,
      irMes,
      dias: diasRestantes(mes, ano, hojeISO),
      envelopes,
      receitas: budgets.receitasMes,
      rendaPerfil: budgets.monthlyIncome,
      fora,
      categoriasLivres,
      txCount: txs.length,
      atualizadoAs: txQ.dataUpdatedAt ? horaSP(txQ.dataUpdatedAt, 'h') : '--h--',
      ultimaSinc: txQ.dataUpdatedAt ? horaSP(txQ.dataUpdatedAt, ':') : '--:--',
      anteriores,
      fechamentoBase,
      saldoMes: budgets.receitasMes - budgets.totalDespesas,
      meta,
      labEnvelopeId,
      criar, salvar, excluir, copiar,
    }
  }, [
    budgets.budgets, budgets.isLoading, budgets.error, budgets.receitasMes, budgets.totalDespesas,
    budgets.monthlyIncome, budgets.prevMonthBudgets,
    txQ.data, txQ.isLoading, txQ.isError, txQ.dataUpdatedAt,
    categories, metasQ.goals,
    plan.loading, plan.currentBalance, plan.projectedEvents, plan.balanceData,
    mes, ano, hojeMes, hojeAno, hojeISO, tentarDeNovo, irMes, criar, salvar, excluir, copiar,
  ])
}
