'use client'

// Fase 1 · Task 12 · dados do hub de Finanças v5 (T1, prototypes/v5/app/financas-a.html).
// Compõe os hooks v3 reais (useBudgets com rollover, useMetas, useRecorrentes,
// usePlanejamento) + UMA query do mês corrente e do anterior (fluxo, últimas
// transações, categorias, deltas vs mês anterior, meta de poupança, agenda
// financeira de hoje). A fala de Sy é determinística (lib/financas/hub): a rota
// /api/ai/coach-brief devolve o schema do hero v3 (eyebrow/headline/stats), que
// não serve para "1 ou 2 frases + fontes". Regras de negócio: lib/financas/*.

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useBudgets } from '@/hooks/use-budgets'
import { useMetas, calcProgress } from '@/hooks/use-metas'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import { usePlanejamento } from '@/hooks/use-planejamento'
import {
  saldoAcumuladoPorDia, leituras12, recuos, pathFluxo, prosaFluxo, type Parte,
} from '@/lib/financas/fluxo'
import {
  falaFinancas, subOrcamento, tagRecorrente, proximaAcao, fontesFinancas, deltaPct,
  fracaoExecutada, brlInt, brl, type ParteFala, type OrcResumo,
} from '@/lib/financas/hub'

const SP_TZ = 'America/Sao_Paulo'
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

interface TxRow {
  id: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  description: string | null
  date: string
  created_at: string | null
  category: { name: string } | null
}

interface ExtraData {
  txs: TxRow[]
  savingsGoalPct: number | null
  agendaHoje: { titulo: string; hora: string } | null
}

export interface DeltaV5 { t: string; ele: boolean }

export interface FinancasV5Data {
  loading: boolean
  vazio: boolean
  mesNome: string
  fala: ParteFala[]
  fontes: string
  atualizadoAs: string
  sugestoes: string[]
  nums: {
    receitas: string; despesas: string; saldo: string; poupanca: string
    dReceitas: DeltaV5; dDespesas: DeltaV5; dSaldo: DeltaV5; dPoupanca: DeltaV5
  }
  orcamentos: { id: string; nome: string; gasto: string; limite: string; w: number; warn: boolean; sub: string }[]
  categorias: { nome: string; valor: string }[]
  prox: ParteFala[]
  fluxo: {
    leituras: number[]
    linha: string
    area: string
    recuos: { x: number; y: number }[]
    fim: { x: number; y: number }
    aria: string
    prosaDesktop: Parte[]
    prosaMobile: Parte[]
  } | null
  transacoes: { id: string; d: string; ds: string; ct: string; v: string; entrada: boolean }[]
  metas: { id: string; nome: string; pct: number; sub: string }[]
  recorrentes: { id: string; nome: string; tag: string; due: boolean; ct: string; v: string }[]
  agenda: { hora: string; titulo: string } | null
  fechamento: string | null
  txCount: number
  ultimaSinc: string
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

function horaSP(ms: number, sep: ':' | 'h'): string {
  const [h, m] = new Date(ms)
    .toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .split(':')
  return sep === 'h' ? `${Number(h)}h${m}` : `${h}:${m}`
}

const deltaTxt = (d: number | null, mesAnt: string, vazio: string): DeltaV5 =>
  d === null
    ? { t: vazio, ele: false }
    : { t: `${d > 0 ? '+' : ''}${d}% vs ${mesAnt}`, ele: d > 0 }

/** "revisão de aportes": minúscula no início, sem estragar sigla ("PIX"). */
const minusculaInicial = (s: string) =>
  s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLocaleLowerCase('pt-BR') + s.slice(1) : s

async function fetchExtra(ano: number, mes: number, hojeISO: string): Promise<ExtraData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { txs: [], savingsGoalPct: null, agendaHoje: null }

  const prevM = mes === 1 ? 12 : mes - 1
  const prevY = mes === 1 ? ano - 1 : ano
  const inicio = `${prevY}-${pad2(prevM)}-01`
  const fim = `${ano}-${pad2(mes)}-${pad2(new Date(ano, mes, 0).getDate())}`

  // schema drift (savings_goal_pct, agenda_events fora do Database manual):
  // mesmo contorno tipado do (app-v5)/layout.tsx; cada leitura tolera falha
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }
  const [txRes, profRes, agRes] = await Promise.all([
    sb.from('transactions')
      .select('id, amount, type, description, date, created_at, category:categories(name)')
      .eq('user_id', user.id)
      .eq('is_future', false)
      .gte('date', inicio)
      .lte('date', fim)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    sb.from('profiles').select('savings_goal_pct').eq('id', user.id).maybeSingle(),
    sb.from('agenda_events')
      .select('title, start_time')
      .eq('user_id', user.id)
      .eq('date', hojeISO)
      .eq('type', 'financeiro')
      .order('start_time', { ascending: true, nullsFirst: false })
      .limit(1),
  ]) as [
    { data: TxRow[] | null; error: unknown },
    { data: { savings_goal_pct: number | null } | null; error: unknown },
    { data: { title: string; start_time: string | null }[] | null; error: unknown },
  ]

  if (txRes.error) throw new Error('Falha ao ler as transações do mês.')
  const ag = agRes.error ? null : agRes.data?.[0] ?? null
  return {
    txs: txRes.data ?? [],
    savingsGoalPct: profRes.error ? null : profRes.data?.savings_goal_pct ?? null,
    agendaHoje: ag && ag.start_time ? { titulo: ag.title, hora: ag.start_time.slice(0, 5) } : null,
  }
}

export function useFinancasV5(): FinancasV5Data {
  // o mês do hub é o mês corrente em SP, fixado na montagem
  const [hojeISO] = useState(hojeSP)
  const ano = Number(hojeISO.slice(0, 4))
  const mes = Number(hojeISO.slice(5, 7))
  const mesNome = MESES_LONGOS[mes - 1]
  const mesAnt = MESES_LONGOS[(mes + 10) % 12]

  const budgets = useBudgets({ month: mes, year: ano })
  const metasQ = useMetas({ status: 'active' })
  const rec = useRecorrentes()
  const plan = usePlanejamento()
  const extraQ = useQuery({
    queryKey: ['financas-v5', 'hub', ano, mes, hojeISO],
    queryFn: () => fetchExtra(ano, mes, hojeISO),
  })

  return useMemo((): FinancasV5Data => {
    const prefixoMes = `${ano}-${pad2(mes)}-`
    const txs = extraQ.data?.txs ?? []
    const txMes = txs.filter(t => t.date.startsWith(prefixoMes))
    const txAnt = txs.filter(t => !t.date.startsWith(prefixoMes))
    const txCount = txMes.length
    const vazio = !extraQ.isLoading && txCount === 0

    // números do mês (useBudgets: is_future=false, transferência fora)
    const receitas = budgets.receitasMes
    const despesas = budgets.totalDespesas
    const saldo = receitas - despesas
    const poupanca = receitas > 0 ? Math.round((saldo / receitas) * 100) : 0
    const soma = (rows: TxRow[], tipo: 'income' | 'expense') =>
      rows.filter(t => t.type === tipo).reduce((s, t) => s + Number(t.amount), 0)
    const recAnt = soma(txAnt, 'income')
    const despAnt = soma(txAnt, 'expense')
    const baseReceita = receitas > 0 ? receitas : budgets.monthlyIncome
    const semBase = `sem base em ${mesAnt}`
    const meta = extraQ.data?.savingsGoalPct ?? null

    // orçamentos (limite já com rollover)
    const orcs = budgets.budgets.filter(b => b.amount > 0)
    const resumo: OrcResumo[] = orcs.map(b => ({
      nome: b.category?.name ?? 'Sem categoria', gasto: b.gasto, limite: b.amount, pct: b.pct,
    }))
    const orcamentos = [...orcs]
      .sort((a, b) => b.gasto - a.gasto)
      .map(b => {
        const r: OrcResumo = { nome: b.category?.name ?? 'Sem categoria', gasto: b.gasto, limite: b.amount, pct: b.pct }
        return {
          id: b.id, nome: r.nome, gasto: brlInt(b.gasto), limite: brlInt(b.amount),
          w: Math.min(100, Math.max(0, b.pct)), warn: b.pct > 85, sub: subOrcamento(r),
        }
      })

    // categorias do mês (despesas por categoria, maiores primeiro)
    const porCat = new Map<string, number>()
    for (const t of txMes) {
      if (t.type !== 'expense') continue
      const nome = t.category?.name ?? 'Sem categoria'
      porCat.set(nome, (porCat.get(nome) ?? 0) + Number(t.amount))
    }
    const categorias = [...porCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, v]) => ({ nome, valor: brlInt(v) }))

    const fracao = fracaoExecutada(hojeISO)
    const pctExecutado = Math.round(fracao * 100)

    // fluxo de caixa
    const serie = saldoAcumuladoPorDia(txMes.map(t => ({ ...t, amount: Number(t.amount) })), ano, mes, hojeISO)
    const leituras = txCount > 0 ? leituras12(serie) : []
    const geo = pathFluxo(leituras)
    const fluxo = leituras.length > 0
      ? {
          leituras,
          linha: geo.linha,
          area: geo.area,
          recuos: recuos(leituras).map(i => geo.pontos[i]).filter(Boolean),
          fim: geo.fim,
          aria: `Saldo acumulado em ${leituras.length} leituras do mês, de ${leituras[0]} a ${leituras[leituras.length - 1]}`,
          prosaDesktop: prosaFluxo(leituras, 'desktop'),
          prosaMobile: prosaFluxo(leituras, 'mobile'),
        }
      : null

    // últimas 8 transações do mês (já sem futuras)
    const transacoes = txMes.slice(0, 8).map(t => {
      const entrada = t.type === 'income'
      const valor = brl(Number(t.amount))
      return {
        id: t.id,
        d: `${Number(t.date.slice(8, 10))} ${MESES_CURTOS[Number(t.date.slice(5, 7)) - 1]}`,
        ds: t.description || 'Sem descrição',
        ct: t.category?.name ?? (t.type === 'transfer' ? 'Transferência' : 'Sem categoria'),
        v: entrada ? `+ ${valor}` : `– ${valor}`,
        entrada,
      }
    })

    // metas monetárias em andamento (3)
    const metas = metasQ.goals
      .filter(g => g.goal_type === 'monetary' && g.target_amount > 0)
      .slice(0, 3)
      .map(g => {
        const quando = g.target_date
          ? ` · ${MESES_CURTOS[Number(g.target_date.slice(5, 7)) - 1]} ${g.target_date.slice(0, 4)}`
          : ''
        return {
          id: g.id, nome: g.name, pct: calcProgress(g.current_amount, g.target_amount),
          sub: `${brlInt(g.current_amount)} de ${brlInt(g.target_amount)}${quando}`,
        }
      })

    // recorrentes: 3 próximas por daysLeft
    const catDeRec = new Map(rec.recorrentes.map(r => [r.id, r.categories?.name ?? null]))
    const recorrentes = [...rec.upcomingOccurrences]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3)
      .map(o => {
        const { tag, due } = tagRecorrente({ daysLeft: o.daysLeft, date: o.date, type: o.type })
        return { id: o.id, nome: o.name, tag, due, ct: catDeRec.get(o.id) ?? '', v: brl(o.amount) }
      })

    const ag = extraQ.data?.agendaHoje ?? null

    // fechamento projetado (usePlanejamento, cenário realista): só com base real
    const temProjecao = plan.currentBalance !== 0 || plan.projectedEvents.some(e => e.monthIndex === 0)
    const fechamento = !plan.loading && temProjecao && plan.balanceData[0]
      ? brlInt(plan.balanceData[0].balance)
      : null

    const warnTop = [...resumo].filter(o => o.pct > 85).sort((a, b) => b.pct - a.pct)[0]
    const sugestoes = [
      warnTop ? `Quanto ainda posso gastar em ${warnTop.nome.toLocaleLowerCase('pt-BR')}?` : 'Onde estou gastando mais este mês?',
      'Resumo da minha semana',
      'Como estão as minhas metas?',
    ]

    const sinc = extraQ.dataUpdatedAt // 0 enquanto carrega (sem relógio no render)

    return {
      loading: budgets.isLoading || extraQ.isLoading || metasQ.isLoading || rec.loading,
      vazio,
      mesNome,
      fala: falaFinancas({ pctExecutado, orcamentos: resumo, temRegistros: txCount > 0, mesNome }),
      fontes: fontesFinancas({ orcamentos: resumo.length, transacoes: txCount, metas: metas.length }),
      atualizadoAs: sinc ? horaSP(sinc, 'h') : '--h--',
      sugestoes,
      nums: {
        receitas: brlInt(receitas),
        despesas: brlInt(despesas),
        saldo: brlInt(saldo),
        poupanca: `${poupanca}%`,
        dReceitas: deltaTxt(deltaPct(receitas, recAnt), mesAnt, semBase),
        dDespesas: {
          t: baseReceita > 0 ? `${Math.round((despesas / baseReceita) * 100)}% da receita` : 'sem receita no mês',
          ele: false,
        },
        dSaldo: deltaTxt(deltaPct(saldo, recAnt - despAnt), mesAnt, semBase),
        dPoupanca: { t: meta !== null ? `Meta: ${meta}%` : 'Sem meta definida', ele: false },
      },
      orcamentos,
      categorias,
      prox: proximaAcao({ orcamentos: resumo, receitas, despesas, fracao, mesNome }),
      fluxo,
      transacoes,
      metas,
      recorrentes,
      agenda: ag ? { hora: ag.hora, titulo: minusculaInicial(ag.titulo) } : null,
      fechamento,
      txCount,
      ultimaSinc: sinc ? horaSP(sinc, ':') : '--:--',
    }
  }, [
    ano, mes, hojeISO, mesNome, mesAnt,
    budgets.isLoading, budgets.receitasMes, budgets.totalDespesas, budgets.monthlyIncome, budgets.budgets,
    metasQ.isLoading, metasQ.goals,
    rec.loading, rec.recorrentes, rec.upcomingOccurrences,
    plan.loading, plan.currentBalance, plan.projectedEvents, plan.balanceData,
    extraQ.isLoading, extraQ.data, extraQ.dataUpdatedAt,
  ])
}
