'use client'

// Fase 2 · dados da tela Transações v5 (prototypes/v5/app/financas-transacoes.html).
// Três leituras separadas, todas sob a chave ['transactions', 'v5', ...] para que as
// mutações do hook v3 (`useTransactionMutations`, que invalidam ['transactions']) as
// atualizem: (1) a página da lista, sem previstos, com os filtros e "Carregar mais" de
// 20 em 20; (2) os previstos do mês (lançamentos futuros, `is_future`) com os mesmos
// filtros; (3) os totais do MÊS INTEIRO, sem filtro e sem paginação (correção do v3,
// que somava só a página). A regra pura mora em lib/financas/transacoes.

import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { usePlanejamento } from '@/hooks/use-planejamento'
import { chavesMaterializadas, itensRecorrentes } from '@/lib/financas/calendario'
import type { RecItem } from '@/lib/financas/recorrentes'
import { useCategories, type Category } from '@/hooks/use-categories'
import { useAccounts, type UserAccount } from '@/hooks/use-accounts'
import {
  PAGINA, intervaloMes, linhaDeOcorrencia, mesclarPrevistos, ocorrenciaPassa, linhaDeTransacao, mesDe, mesIgual, ordenacaoServidor, totaisDoMes,
  type FiltroTipo, type MesRef, type Ordem, type TotaisMes, type TransacaoDb, type TxLinha,
} from '@/lib/financas/transacoes'

const SP_TZ = 'America/Sao_Paulo'
const hojeSP = (): string => new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })

const SELECT = `id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at,
  category:categories(id, name),
  account_from:user_accounts!account_from_id(id, name),
  account_to:user_accounts!account_to_id(id, name)`

interface Filtros { tipo: FiltroTipo; categoriaId: string; q: string }

// schema drift (user_accounts, is_future fora do Database manual): mesmo contorno do hub
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = { from: (t: string) => any }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function aplicaFiltros(query: any, f: Filtros): any {
  let q = query
  if (f.tipo === 'in') q = q.eq('type', 'income')
  if (f.tipo === 'out') q = q.eq('type', 'expense')
  if (f.tipo === 'tr') q = q.eq('type', 'transfer')
  if (f.tipo === 'rec') q = q.not('recurring_transaction_id', 'is', null)
  if (f.categoriaId) q = q.eq('category_id', f.categoriaId)
  if (f.q) q = q.ilike('description', `%${f.q}%`)
  return q
}

async function usuario() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { sb: supabase as unknown as Sb, uid: user?.id ?? null }
}

interface PaginaRes { linhas: TxLinha[]; total: number }

async function lerPagina(mes: MesRef, f: Filtros, ordem: Ordem, limite: number): Promise<PaginaRes> {
  const { sb, uid } = await usuario()
  if (!uid) return { linhas: [], total: 0 }
  const { inicio, fim } = intervaloMes(mes)
  const { col, asc } = ordenacaoServidor(ordem)
  const q = aplicaFiltros(
    sb.from('transactions').select(SELECT, { count: 'exact' })
      .eq('user_id', uid).eq('is_future', false).gte('date', inicio).lte('date', fim),
    f,
  )
    .order(col, { ascending: asc })
    .order('created_at', { ascending: asc })
    .range(0, limite - 1)
  const { data, error, count } = (await q) as { data: TransacaoDb[] | null; error: { message: string } | null; count: number | null }
  if (error) throw new Error('Falha ao ler as transações.')
  return { linhas: (data ?? []).map(linhaDeTransacao), total: count ?? 0 }
}

async function lerPrevistos(mes: MesRef, f: Filtros): Promise<TxLinha[]> {
  const { sb, uid } = await usuario()
  if (!uid) return []
  const { inicio, fim } = intervaloMes(mes)
  const q = aplicaFiltros(
    sb.from('transactions').select(SELECT)
      .eq('user_id', uid).eq('is_future', true).gte('date', inicio).lte('date', fim),
    f,
  )
    .order('date', { ascending: true })
    .order('created_at', { ascending: false })
    .range(0, 199)
  const { data, error } = (await q) as { data: TransacaoDb[] | null; error: { message: string } | null }
  if (error) throw new Error('Falha ao ler os previstos.')
  return (data ?? []).map(linhaDeTransacao)
}

/** Transações do mês já ligadas a uma recorrente (para não repetir a ocorrência como prevista). */
async function lerMaterializadas(mes: MesRef): Promise<{ recurring_transaction_id: string | null; date: string }[]> {
  const { sb, uid } = await usuario()
  if (!uid) return []
  const { inicio, fim } = intervaloMes(mes)
  const { data, error } = (await sb.from('transactions').select('recurring_transaction_id, date')
    .eq('user_id', uid).not('recurring_transaction_id', 'is', null).gte('date', inicio).lte('date', fim)
    .range(0, 999)) as { data: { recurring_transaction_id: string | null; date: string }[] | null; error: unknown }
  if (error) throw new Error('Falha ao ler as recorrentes lançadas.')
  return data ?? []
}

async function lerTotais(mes: MesRef): Promise<TotaisMes> {
  const { sb, uid } = await usuario()
  if (!uid) return { entradas: 0, saidas: 0, saldo: 0, quantidade: 0 }
  const { inicio, fim } = intervaloMes(mes)
  const { data, error } = (await sb.from('transactions').select('type, amount')
    .eq('user_id', uid).eq('is_future', false).gte('date', inicio).lte('date', fim)
    .range(0, 4999)) as { data: { type: TransacaoDb['type']; amount: number }[] | null; error: unknown }
  if (error) throw new Error('Falha ao somar o mês.')
  return totaisDoMes(data ?? [])
}

export interface TransacoesV5Data {
  hoje: string
  mes: MesRef
  mesAtual: boolean
  /** só o mês corrente em diante não existe: o próximo fica desabilitado no mês atual */
  podeAvancar: boolean
  irPara: (m: MesRef) => void
  voltarHoje: () => void

  tipo: FiltroTipo
  setTipo: (t: FiltroTipo) => void
  categoriaId: string
  setCategoriaId: (id: string) => void
  q: string
  setQ: (s: string) => void
  ordem: Ordem
  setOrdem: (o: Ordem) => void
  filtrando: boolean

  linhas: TxLinha[]
  previstos: TxLinha[]
  /** total filtrado do mês (com o filtro, é o total filtrado) */
  totalFiltrado: number
  temMais: boolean
  carregarMais: () => void
  totais: TotaisMes | null

  loading: boolean
  trocandoMes: boolean
  erro: boolean
  recarregar: () => void
  ultimaSinc: string

  categorias: Category[]
  contas: UserAccount[]
}

export function useTransacoesV5(): TransacoesV5Data {
  const [hoje] = useState(hojeSP)
  const atual = useMemo(() => mesDe(hoje), [hoje])
  const [mes, setMes] = useState<MesRef>(atual)
  const [tipo, setTipoRaw] = useState<FiltroTipo>('todas')
  const [categoriaId, setCategoriaRaw] = useState('')
  const [qRaw, setQRaw] = useState('')
  const [q, setQDeb] = useState('')
  const [ordem, setOrdemRaw] = useState<Ordem>('recente')
  const [limite, setLimite] = useState(PAGINA)

  // busca com debounce de 300 ms (mesmo tempo do v3)
  useEffect(() => {
    const t = setTimeout(() => setQDeb(qRaw.trim()), 300)
    return () => clearTimeout(t)
  }, [qRaw])

  // qualquer mudança de recorte volta a lista para a primeira página
  const reinicia = () => setLimite(PAGINA)
  const setTipo = (t: FiltroTipo) => { setTipoRaw(t); reinicia() }
  const setCategoriaId = (id: string) => { setCategoriaRaw(id); reinicia() }
  const setQ = (s: string) => { setQRaw(s); reinicia() }
  const setOrdem = (o: Ordem) => { setOrdemRaw(o); reinicia() }
  const irPara = (m: MesRef) => { setMes(m); reinicia() }

  const filtros: Filtros = useMemo(() => ({ tipo, categoriaId, q }), [tipo, categoriaId, q])
  const chaveMes = `${mes.ano}-${mes.mes}`

  const pagina = useQuery({
    queryKey: ['transactions', 'v5', 'pagina', chaveMes, filtros, ordem, limite],
    queryFn: () => lerPagina(mes, filtros, ordem, limite),
    placeholderData: keepPreviousData,
  })
  const prev = useQuery({
    queryKey: ['transactions', 'v5', 'previstos', chaveMes, filtros],
    queryFn: () => lerPrevistos(mes, filtros),
    placeholderData: keepPreviousData,
  })
  const tot = useQuery({
    queryKey: ['transactions', 'v5', 'totais', chaveMes],
    queryFn: () => lerTotais(mes),
    placeholderData: keepPreviousData,
  })

  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const plan = usePlanejamento()
  const mesAtualRef = mesIgual(mes, atual)
  const mat = useQuery({
    queryKey: ['transactions', 'v5', 'materializadas', chaveMes],
    queryFn: () => lerMaterializadas(mes),
    enabled: mesAtualRef,
  })

  // só no mês corrente: ocorrências das recorrentes que ainda caem no mês e não viraram transação
  const ocorrencias = useMemo(() => {
    if (!mesAtualRef || !mat.data) return []
    const nome = new Map(categories.map(c => [c.id, c.name]))
    const recs: RecItem[] = plan.recurringItems
      .filter(r => r.type !== 'transfer')
      .map(r => ({
        id: r.id, nome: r.name, valor: Number(r.amount), tipo: r.type, freq: r.frequency, dia: r.day_of_month,
        inicio: r.start_date, fim: r.end_date, pausada: r.is_paused,
        categoria: r.category_id ? nome.get(r.category_id) ?? null : null, nota: r.notes,
      }))
    const freqs = new Map(recs.map(r => [r.id, r.freq]))
    const itens = itensRecorrentes(recs, mes, hoje, chavesMaterializadas(mat.data, freqs))
    const catNome = categoriaId ? categories.find(c => c.id === categoriaId)?.name ?? '' : ''
    return itens
      .map(i => linhaDeOcorrencia({ id: i.id, data: i.data, desc: i.desc, cat: i.cat, valor: i.valor }))
      .filter(l => ocorrenciaPassa(l, { tipo, categoriaNome: catNome, q }))
  }, [mesAtualRef, mat.data, plan.recurringItems, categories, mes, hoje, categoriaId, tipo, q])

  const linhas = pagina.data?.linhas ?? []
  const totalFiltrado = pagina.data?.total ?? 0
  const filtrando = tipo !== 'todas' || !!categoriaId || !!q
  const mesAtual = mesIgual(mes, atual)

  const recarregar = () => { void pagina.refetch(); void prev.refetch(); void tot.refetch() }
  const sincMs = Math.max(pagina.dataUpdatedAt, tot.dataUpdatedAt)
  const ultimaSinc = sincMs
    ? new Date(sincMs).toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    : ''

  return {
    hoje, mes, mesAtual,
    podeAvancar: !mesAtual,
    irPara,
    voltarHoje: () => irPara(atual),
    tipo, setTipo, categoriaId, setCategoriaId, q: qRaw, setQ, ordem, setOrdem, filtrando,
    linhas,
    previstos: mesclarPrevistos(prev.data ?? [], ocorrencias),
    totalFiltrado,
    temMais: linhas.length < totalFiltrado,
    carregarMais: () => setLimite(l => l + PAGINA),
    totais: tot.data ?? null,
    loading: pagina.isLoading,
    trocandoMes: pagina.isPlaceholderData,
    erro: pagina.isError,
    recarregar,
    ultimaSinc,
    categorias: categories,
    contas: accounts,
  }
}
