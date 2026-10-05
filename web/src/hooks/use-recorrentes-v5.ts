'use client'

// Fase 2 · dados da tela Recorrentes v5 (prototypes/v5/app/financas-recorrentes.html).
// Adaptador sobre useRecorrentes (a lógica de dados do v3 fica: criar, editar, pausar,
// excluir lógico) + a renda do perfil (profiles.monthly_income, sem fallback inventado),
// as categorias e o plano (limite FREE de 5, só no cliente; pausadas contam).
// O cálculo (totais, grupos, próximos 30 dias) mora em lib/financas/recorrentes.

import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCategories, type Category } from '@/hooks/use-categories'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  useRecorrentes, type RecorrenteFormData, type RecurrenteWithCategory,
} from '@/hooks/use-recorrentes'
import {
  LIMITE_FREE, agrupar, listaEncerradas, proximaSaida, proximos30, totais,
  type Freq, type Grupo, type Proximos, type RecItem, type Totais, type TipoRec,
} from '@/lib/financas/recorrentes'

const SP_TZ = 'America/Sao_Paulo'

/** Hoje em São Paulo (`YYYY-MM-DD`). */
export function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

/** Dados do formulário (captura inline, painel e sheet). `categoria` é o id ('' = sem categoria). */
export interface FormRec {
  tipo: 'income' | 'expense'
  nome: string
  valor: string
  freq: Freq
  /** só vale em mensal, trimestral e anual */
  dia: number | null
  inicio: string
  fim: string
  categoria: string
  nota: string
}

export type ResultadoAcao = { ok: true } | { ok: false; erro: string }

export interface RecorrentesV5Data {
  loading: boolean
  /** erro de leitura sem nada para mostrar; erros de ação voltam em ResultadoAcao */
  erro: string | null
  hoje: string
  itens: RecItem[]
  /** id da categoria por recorrente (para preencher o formulário de edição) */
  categoriaDe: Record<string, string>
  categorias: Category[]
  renda: number | null
  totais: Totais
  grupos: Grupo[]
  encerradas: RecItem[]
  proximos: Proximos
  proxima: { nome: string; dias: number } | null
  /** FREE com 5 recorrentes: nova fica bloqueada (pausadas contam) */
  limitado: boolean
  /** hora da última leitura, "14:05" (sem relógio no render) */
  ultimaSinc: string
  criar: (f: FormRec) => Promise<ResultadoAcao>
  salvar: (id: string, f: FormRec) => Promise<ResultadoAcao>
  pausar: (id: string) => Promise<ResultadoAcao>
  excluir: (id: string) => Promise<ResultadoAcao>
  recarregar: () => void
}

function paraItem(r: RecurrenteWithCategory): RecItem {
  return {
    id: r.id,
    nome: r.name,
    valor: Number(r.amount),
    tipo: r.type as TipoRec,
    freq: r.frequency,
    dia: r.day_of_month,
    inicio: r.start_date,
    fim: r.end_date,
    pausada: r.is_paused,
    categoria: r.categories?.name ?? null,
    nota: r.notes,
  }
}

function paraForm(f: FormRec): RecorrenteFormData {
  return {
    type: f.tipo,
    name: f.nome,
    amount: f.valor,
    frequency: f.freq,
    day_of_month: f.dia ?? 0,
    start_date: f.inicio,
    end_date: f.fim,
    category_id: f.categoria,
    notes: f.nota,
  }
}

async function lerRenda(): Promise<number | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  // schema drift (monthly_income fora do Database manual): mesmo contorno tipado do hub
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }
  const { data, error } = await sb.from('profiles').select('monthly_income').eq('id', user.id).maybeSingle() as {
    data: { monthly_income: number | null } | null; error: unknown
  }
  if (error) return null
  const n = Number(data?.monthly_income ?? 0)
  return n > 0 ? n : null
}

const horaSP = (ms: number): string => {
  const [h, m] = new Date(ms)
    .toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .split(':')
  return `${h}:${m}`
}

const msg = (e: unknown, padrao: string) => (e instanceof Error && e.message ? e.message : padrao)

export function useRecorrentesV5(): RecorrentesV5Data {
  const [hoje] = useState(hojeSP)
  const rec = useRecorrentes()
  const { categories } = useCategories()
  const { isFree, isLoading: planoCarregando } = useUserPlan()
  const rendaQ = useQuery({ queryKey: ['financas-v5', 'recorrentes', 'renda'], queryFn: lerRenda })

  const itens = useMemo(() => rec.recorrentes.map(paraItem), [rec.recorrentes])
  const categoriaDe = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of rec.recorrentes) m[r.id] = r.category_id ?? ''
    return m
  }, [rec.recorrentes])
  const renda = rendaQ.data ?? null

  const calc = useMemo(() => ({
    totais: totais(itens, hoje, renda),
    grupos: agrupar(itens, hoje),
    encerradas: listaEncerradas(itens, hoje),
    proximos: proximos30(itens, hoje),
    proxima: proximaSaida(itens, hoje),
  }), [itens, hoje, renda])

  const executar = useCallback(async (fn: () => Promise<void>, padrao: string): Promise<ResultadoAcao> => {
    try {
      await fn()
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: msg(e, padrao) }
    }
  }, [])

  const { createRecorrente, updateRecorrente, togglePause, deleteRecorrente } = rec
  const criar = useCallback(
    (f: FormRec) => executar(() => createRecorrente(paraForm(f)), 'Não consegui registrar. Tente de novo.'),
    [executar, createRecorrente],
  )
  const salvar = useCallback(
    (id: string, f: FormRec) => executar(() => updateRecorrente(id, paraForm(f)), 'Não consegui salvar. Tente de novo.'),
    [executar, updateRecorrente],
  )
  const pausadaDe = useMemo(() => new Map(itens.map(i => [i.id, i.pausada])), [itens])
  const pausar = useCallback(
    (id: string) => executar(() => togglePause(id, pausadaDe.get(id) ?? false), 'Não consegui alterar. Tente de novo.'),
    [executar, togglePause, pausadaDe],
  )
  const excluir = useCallback(
    (id: string) => executar(() => deleteRecorrente(id), 'Não consegui excluir. Tente de novo.'),
    [executar, deleteRecorrente],
  )

  const sinc = rendaQ.dataUpdatedAt // 0 enquanto carrega

  return {
    loading: rec.loading || rendaQ.isLoading,
    erro: rec.error && itens.length === 0 ? 'Não consegui carregar as recorrentes.' : null,
    hoje,
    itens,
    categoriaDe,
    categorias: categories,
    renda,
    ...calc,
    limitado: !planoCarregando && isFree && rec.activeCount >= LIMITE_FREE,
    ultimaSinc: sinc ? horaSP(sinc) : '--:--',
    criar,
    salvar,
    pausar,
    excluir,
    recarregar: rec.refresh,
  }
}
