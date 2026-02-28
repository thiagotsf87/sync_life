'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBudgets } from '@/hooks/use-budgets'
import { useTransactions } from '@/hooks/use-transactions'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  CalendarDays, Plus, ChevronDown, ChevronLeft, ChevronRight, ExternalLink,
  TrendingUp, AlertTriangle, Loader2
} from 'lucide-react'

// ─── STATIC PROJECTION (illustrative — requires backend projection engine) ────

const PROJ_MESES = [
  { mes: 'Fev', val: 1800, delta: '', nota: 'Mês atual', tipo: 'current' as const },
  { mes: 'Mar', val: 2100, delta: '+16%', nota: 'IPTU parcela', tipo: 'good' as const },
  { mes: 'Abr', val: 1950, delta: '-7%', nota: 'IPVA estimado', tipo: 'warn' as const },
  { mes: 'Mai', val: 2350, delta: '+21%', nota: 'Tendência +', tipo: 'good' as const },
  { mes: 'Jun', val: 2600, delta: '+11%', nota: 'Tendência +', tipo: 'good' as const },
]

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MonthlyAgg { mes: string; rec: number; des: number }
interface CatDataItem { nome: string; pct: number; val: number; cor: string }
interface CfDay { d: number; inc: number; exp: number; isToday: boolean; isFuture: boolean }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(n))
}

function fmtDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix', credit: 'Crédito', debit: 'Débito',
  cash: 'Dinheiro', transfer: 'Transferência', boleto: 'Boleto',
}

function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 80) return '#f97316'
  if (pct >= 61) return '#f59e0b'
  return '#10b981'
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function DonutChart({ data, totalGasto }: { data: CatDataItem[]; totalGasto: number }) {
  const R = 58, cx = 70, cy = 70, stroke = 11
  const total = data.reduce((s, c) => s + c.pct, 0) || 1
  let offset = 0
  const circ = 2 * Math.PI * R
  const gaps = Math.max(data.length, 1) * 2
  const usable = circ - gaps

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--sl-s3)" strokeWidth={stroke} />
        {data.map((cat) => {
          const len = (cat.pct / total) * usable
          const dashArr = `${len} ${circ - len}`
          const dashOff = -offset
          offset += len + 2
          return (
            <circle
              key={cat.nome}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={cat.cor}
              strokeWidth={stroke}
              strokeDasharray={dashArr}
              strokeDashoffset={dashOff}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)] leading-none">
          R$ {fmtR$(totalGasto)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)]">Gasto</span>
      </div>
    </div>
  )
}

// ─── CASH FLOW CHART ─────────────────────────────────────────────────────────

function FluxoCaixaChart({ days }: { days: CfDay[] }) {
  const maxVal = days.length > 0 ? Math.max(...days.map(d => Math.max(d.inc, d.exp)), 100) : 100
  const h = 88
  const n = days.length || 28

  const balances: number[] = []
  let running = 0
  for (const d of days) {
    running += d.inc - d.exp
    balances.push(running)
  }
  const minBal = Math.min(...balances, 0)
  const maxBal = Math.max(...balances, 1)
  const balRange = Math.max(1, maxBal - minBal)

  const balPts = balances
    .map((b, i) => {
      const x = ((i + 0.5) / n) * 100
      const y = (1 - (b - minBal) / balRange) * (h - 6) + 3
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const yLabels = [maxVal, maxVal * 0.67, maxVal * 0.33, 0]

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#10b981', opacity: 0.8 }} />
          Receitas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#f43f5e', opacity: 0.7 }} />
          Despesas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-6 h-px inline-block" style={{ background: '#0055ff' }} />
          Saldo
        </span>
      </div>
      {/* Y axis */}
      <div className="flex gap-1.5 items-start">
        <div className="relative shrink-0 w-8" style={{ height: h + 22 }}>
          {yLabels.map((v, i) => (
            <span
              key={i}
              className="absolute right-0 font-[DM_Mono] text-[9px] text-[var(--sl-t3)]"
              style={{ top: `${(i / 3) * h}px`, transform: 'translateY(-50%)' }}
            >
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v)}
            </span>
          ))}
        </div>
        <div className="flex-1 min-w-0 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: h }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-full h-px bg-[var(--sl-border)]" />
            ))}
          </div>
          {/* Bars */}
          <div className="flex items-end gap-px" style={{ height: h }}>
            {days.map(({ d, inc, exp, isToday, isFuture }) => {
              const incH = inc > 0 ? Math.max(4, (inc / maxVal) * h) : 0
              const expH = exp > 0 ? Math.max(2, (exp / maxVal) * h) : 0
              return (
                <div
                  key={d}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group"
                >
                  {isToday && (
                    <>
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#10b981] opacity-50 -translate-x-1/2" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#10b981] whitespace-nowrap bg-[rgba(16,185,129,0.1)] px-1 py-0.5 rounded">
                        Hoje
                      </div>
                    </>
                  )}
                  <div className="flex flex-col items-center w-full justify-end" style={{ height: h }}>
                    {incH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-t-sm"
                        style={{ height: incH, background: '#10b981', opacity: isFuture ? 0.3 : 0.8 }}
                      />
                    )}
                    {expH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-b-sm mt-px"
                        style={{ height: expH, background: '#f43f5e', opacity: isFuture ? 0.3 : 0.7 }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Balance line SVG overlay */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: h }}
            viewBox={`0 0 100 ${h}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={balPts}
              fill="none"
              stroke="#0055ff"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* X axis labels */}
          <div className="flex gap-px mt-1.5">
            {days.map(({ d, isToday, isFuture }) => (
              <div
                key={d}
                className={cn(
                  'flex-1 text-center font-[DM_Mono] text-[7px]',
                  isToday ? 'font-bold text-[#10b981]' : 'text-[var(--sl-t2)]'
                )}
                style={{ opacity: isFuture ? 0.4 : 1 }}
              >
                {String(d).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CUSTOM BAR TOOLTIP ───────────────────────────────────────────────────────

function CustomHistTip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const rec = payload.find(p => p.name === 'rec')?.value ?? 0
  const des = payload.find(p => p.name === 'des')?.value ?? 0
  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border-h)] rounded-xl px-3 py-2.5 text-[11px] shadow-xl">
      <p className="font-bold uppercase text-[10px] text-[var(--sl-t3)] mb-1.5">{label}</p>
      <div className="flex justify-between gap-3 mb-0.5">
        <span className="text-[var(--sl-t3)]">Receitas</span>
        <span className="font-[DM_Mono] text-[#10b981] font-medium">R$ {fmtR$(rec)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-[var(--sl-t3)]">Despesas</span>
        <span className="font-[DM_Mono] text-[#f43f5e] font-medium">R$ {fmtR$(des)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-[var(--sl-border)] mt-2 pt-1.5">
        <span className="text-[var(--sl-t3)]">Saldo</span>
        <span className={cn('font-[DM_Mono] font-medium', rec - des >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
          R$ {fmtR$(rec - des)}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FinancasDashboardPage() {
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)

  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [year, setYear] = useState(() => new Date().getFullYear())

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const todayD = useMemo(() => new Date().getDate(), [])
  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [month, year])

  // ── Real data hooks ──────────────────────────────────────────────────────
  const {
    receitasMes, totalGasto, naoAlocado, activeBudgets, budgets,
    qtdOk, qtdAlert, qtdOver, isLoading: loadingBudgets,
  } = useBudgets({ month, year })

  const { transactions, isLoading: loadingTxns } = useTransactions({
    month, year, sort: 'newest', pageSize: 200,
  })

  const { upcomingOccurrences } = useRecorrentes()

  // ── 6-month history for BarChart ─────────────────────────────────────────
  const [histData, setHistData] = useState<MonthlyAgg[]>([])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const startDate6m = new Date(year, month - 7, 1).toISOString().split('T')[0]
      const endDateCurrent = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id)
        .eq('is_future', false)
        .gte('date', startDate6m)
        .lte('date', endDateCurrent)

      if (cancelled || !txns) return

      const map = new Map<string, { rec: number; des: number }>()
      for (const t of txns as { amount: number; type: string; date: string }[]) {
        const key = t.date.slice(0, 7)
        if (!map.has(key)) map.set(key, { rec: 0, des: 0 })
        const v = map.get(key)!
        if (t.type === 'income') v.rec += t.amount
        else v.des += t.amount
      }

      const result: MonthlyAgg[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const mesLabel = d.toLocaleDateString('pt-BR', { month: 'short' })
          .replace('.', '').replace(/^\w/, c => c.toUpperCase())
        const v = map.get(key) ?? { rec: 0, des: 0 }
        result.push({ mes: mesLabel, rec: v.rec, des: v.des })
      }
      setHistData(result)
    }

    fetchHistory()
    return () => { cancelled = true }
  }, [month, year])

  // ── Derived data ──────────────────────────────────────────────────────────
  const saldoMes = receitasMes - totalGasto
  const taxaPoupanca = receitasMes > 0 ? Math.round((saldoMes / receitasMes) * 100) : 0

  const catData = useMemo((): CatDataItem[] => {
    if (!totalGasto || activeBudgets.length === 0) return []
    return activeBudgets
      .filter(b => b.gasto > 0)
      .map(b => ({
        nome: `${b.category?.icon ?? '📦'} ${b.category?.name ?? 'Outro'}`,
        pct: Math.round((b.gasto / totalGasto) * 100),
        val: b.gasto,
        cor: b.category?.color ?? '#64748b',
      }))
      .sort((a, b) => b.val - a.val)
  }, [activeBudgets, totalGasto])

  const cfDays = useMemo((): CfDay[] => {
    const days: CfDay[] = Array.from({ length: daysInMonth }, (_, i) => ({
      d: i + 1,
      inc: 0,
      exp: 0,
      isToday: i + 1 === todayD,
      isFuture: i + 1 > todayD,
    }))
    for (const t of transactions) {
      if (t.is_future) continue
      const day = parseInt(t.date.slice(8, 10), 10)
      if (day >= 1 && day <= daysInMonth) {
        if (t.type === 'income') days[day - 1].inc += t.amount
        else days[day - 1].exp += t.amount
      }
    }
    return days
  }, [transactions, daysInMonth, todayD])

  const latestTxns = transactions.slice(0, 7)

  const topCat = activeBudgets.length > 0
    ? activeBudgets.reduce((max, b) => b.gasto > max.gasto ? b : max, activeBudgets[0])
    : null

  const pendingRecCount = upcomingOccurrences.filter(o => o.type === 'expense' && o.daysLeft <= 7).length

  const daysLeftInMonth = daysInMonth - todayD
  const weekOfMonth = Math.ceil(todayD / 7)
  const totalWeeks = Math.ceil(daysInMonth / 7)

  const alertCat = activeBudgets.find(b => b.pct >= 100) ?? activeBudgets.find(b => b.pct > 70)

  const mesAno = new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  // ── AI Q&A handler ─────────────────────────────────────────────────────
  const handleAiAsk = useCallback(async () => {
    const q = aiQuery.trim()
    if (!q || aiLoading) return

    setAiLoading(true)
    setAiResponse('')

    const financialContext = {
      mes: mesAno,
      receitas: receitasMes,
      despesas: totalGasto,
      saldo: receitasMes - totalGasto,
      taxaPoupanca,
      diasRestantes: daysInMonth - todayD,
      orcamentos: activeBudgets.map(b => ({
        categoria: b.category?.name ?? 'Outro',
        limite: b.amount,
        gasto: b.gasto,
        pct: b.pct,
      })),
      topCategorias: activeBudgets
        .filter(b => b.gasto > 0)
        .sort((a, b) => b.gasto - a.gasto)
        .slice(0, 5)
        .map(b => ({ nome: b.category?.name ?? 'Outro', valor: b.gasto })),
      recorrentes: pendingRecCount,
    }

    try {
      const res = await fetch('/api/ai/financas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: q }],
          financialContext,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        setAiResponse(errorText || 'Erro ao consultar a IA. Tente novamente.')
        setAiLoading(false)
        return
      }

      if (!res.body) {
        setAiResponse('Erro ao consultar a IA. Tente novamente.')
        setAiLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setAiResponse(text)
      }

      if (!text.trim()) {
        setAiResponse('A IA não retornou uma resposta. Verifique a configuração ou tente novamente.')
      }
    } catch {
      setAiResponse('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setAiLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiQuery, aiLoading, mesAno, receitasMes, totalGasto, taxaPoupanca, daysInMonth, todayD, activeBudgets, pendingRecCount])

  const cfSummary = useMemo(() => {
    const past = transactions.filter(t => !t.is_future)
    const maxInTxn = past.filter(t => t.type === 'income')
      .reduce((max: typeof past[0] | null, t) => (!max || t.amount > max.amount ? t : max), null)
    const maxOutTxn = past.filter(t => t.type === 'expense')
      .reduce((max: typeof past[0] | null, t) => (!max || t.amount > max.amount ? t : max), null)

    let saldoHoje = 0
    let minBal = 0
    let minDay = 1
    for (const d of cfDays) {
      if (!d.isFuture && !d.isToday) {
        saldoHoje += d.inc - d.exp
        if (saldoHoje < minBal) { minBal = saldoHoje; minDay = d.d }
      }
    }
    return { maxInTxn, maxOutTxn, saldoHoje, minBal, minDay }
  }, [transactions, cfDays])

  // Close FAB on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) setFabOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div className="max-w-[1140px] mx-auto">

      {/* ① PAGE HEADER */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-1">
            <div className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
            Módulo Finanças
          </div>
          <h1 className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] tracking-tight leading-none">
            Visão Geral
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1">
            {mesAno} · semana {weekOfMonth} de {totalWeeks} · {daysLeftInMonth} dias restantes
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} aria-label="Mês anterior"
              className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)] px-2.5 py-1.5 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)] whitespace-nowrap min-w-[130px] text-center flex items-center justify-center gap-1.5">
              <CalendarDays size={12} className="text-[var(--sl-t3)]" />
              {mesAno}
            </span>
            <button onClick={nextMonth} aria-label="Próximo mês"
              className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
              <ChevronRight size={14} />
            </button>
            {(month !== now.getMonth() + 1 || year !== now.getFullYear()) && (
              <button
                onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()) }}
                className="ml-1 text-[11px] text-[#10b981] hover:underline"
              >
                Hoje
              </button>
            )}
          </div>
          <button
            onClick={() => router.push('/financas/transacoes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border-none text-white text-[12px] font-bold transition-all hover:brightness-110"
            style={{ background: '#10b981' }}
          >
            <Plus size={12} />
            Nova Transação
          </button>
        </div>
      </div>

      {/* ② KPI STRIP */}
      <div className="grid grid-cols-4 gap-2.5 mb-3 max-sm:grid-cols-2">
        {/* Receitas */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#10b981' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(16,185,129,0.12)' }}>💰</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Receitas</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none text-[#10b981] mb-1">
            {loadingBudgets ? '—' : `R$ ${fmtR$(receitasMes)}`}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] flex items-center gap-1">
            <TrendingUp size={11} />Mês atual
          </p>
        </div>
        {/* Despesas */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#f43f5e' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(244,63,94,0.12)' }}>📤</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Despesas</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none text-[#f43f5e] mb-1">
            {loadingBudgets ? '—' : `R$ ${fmtR$(totalGasto)}`}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] flex items-center gap-1">
            <TrendingUp size={11} />Mês atual
          </p>
        </div>
        {/* Saldo */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: saldoMes >= 0 ? '#10b981' : '#f43f5e' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(16,185,129,0.12)' }}>💚</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo do Mês</p>
          <p className={cn('font-[DM_Mono] text-[21px] font-medium leading-none mb-1', saldoMes >= 0 ? 'text-[var(--sl-t1)]' : 'text-[#f43f5e]')}>
            {loadingBudgets ? '—' : `R$ ${fmtR$(saldoMes)}`}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)]">Receitas menos despesas</p>
          <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
            Não alocado: <strong className="text-[#10b981]">{loadingBudgets ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`}</strong>
          </div>
        </div>
        {/* Taxa Poupança */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#0055ff' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(0,85,255,0.12)' }}>📊</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Taxa de Poupança</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none mb-1" style={{ color: '#0055ff' }}>
            {loadingBudgets ? '—' : `${taxaPoupanca}%`}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)]">Do total recebido</p>
          <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
            Meta: <strong className="text-[var(--sl-t1)]">30%</strong>
            {' · '}
            <span className={taxaPoupanca >= 30 ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
              {taxaPoupanca >= 30 ? '✓ acima' : '⚠ abaixo'}
            </span>
          </div>
        </div>
      </div>

      {/* ③ SAÚDE / FOCO BAND — CSS-based switch to avoid hydration mismatch */}
      <div className="foco-only flex bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] mb-3 overflow-hidden">
        {[
          { lbl: 'Orçamentos OK', val: loadingBudgets ? '—' : `${qtdOk} / ${budgets.length}`, color: '#10b981' },
          { lbl: 'Maior categoria', val: loadingBudgets ? '—' : (topCat?.category?.name ?? '—'), color: '#0055ff' },
          { lbl: 'Recorrentes próximas', val: String(pendingRecCount), color: '#f59e0b' },
          { lbl: 'Taxa de poupança', val: loadingBudgets ? '—' : `${taxaPoupanca}%`, color: '#10b981' },
        ].map((m, i) => (
          <div key={m.lbl} className={cn('flex-1 px-4 py-3', i < 3 && 'border-r border-[var(--sl-border)]')}>
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">{m.lbl}</p>
            <p className="font-[DM_Mono] text-[18px] font-medium leading-none" style={{ color: m.color }}>{m.val}</p>
          </div>
        ))}
      </div>
      <div
        className="jornada-only flex items-center gap-4 rounded-[14px] px-4 py-3 mb-3"
        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.07),rgba(0,85,255,.07))', border: '1px solid rgba(16,185,129,.18)' }}
      >
        <div className="shrink-0 text-center">
          <p className="font-[Syne] font-extrabold text-[42px] leading-none" style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {taxaPoupanca > 0 ? Math.min(Math.round(50 + taxaPoupanca), 99) : '—'}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mt-0.5">Saúde Fin.</p>
        </div>
        <div className="w-px h-11 bg-[var(--sl-border)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-0.5">
            {saldoMes > 0 ? 'Mês positivo até aqui! 🎉' : 'Atenção ao saldo mensal'}
          </p>
          <p className="text-[12px] text-[var(--sl-t3)] italic leading-snug">
            {receitasMes > 0
              ? `Receitas de R$ ${fmtR$(receitasMes)} com R$ ${fmtR$(totalGasto)} em despesas. ${taxaPoupanca >= 30 ? 'Poupança acima da meta!' : 'Mantenha as despesas sob controle.'}`
              : 'Nenhuma transação registrada este mês ainda.'}
          </p>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {qtdOk > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10b981]">✓ {qtdOk} orçamento{qtdOk > 1 ? 's' : ''} no ritmo</span>}
            {taxaPoupanca >= 30 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10b981]">✓ Poupança acima da meta</span>}
            {qtdAlert > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">⚠ {qtdAlert} em atenção</span>}
            {qtdOver > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(244,63,94,0.12)] text-[#f43f5e]">⚠ {qtdOver} estourado{qtdOver > 1 ? 's' : ''}</span>}
          </div>
        </div>
        <button
          onClick={() => router.push('/financas/relatorios')}
          className="shrink-0 px-3 py-1.5 rounded-[9px] border-none text-white text-[11px] font-bold"
          style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}
        >
          Ver análise
        </button>
      </div>

      {/* ④ CONSULTOR IA */}
      <div
        className="relative overflow-hidden rounded-[14px] px-5 py-[18px] mb-3"
        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.10),rgba(0,85,255,.10))', border: '1px solid rgba(16,185,129,.28)' }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)' }} />
        <div className="absolute -bottom-10 left-1/3 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,85,255,.10),transparent 70%)' }} />

        <div className="flex items-center gap-3 mb-4 relative">
          <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', boxShadow: '0 4px 16px rgba(16,185,129,.35)' }}>
            💡
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] tracking-tight">Consultor Financeiro IA</p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Análise personalizada · {mesAno} · atualizado agora</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold text-[#10b981] shrink-0" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.20)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            4 insights hoje
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 max-sm:grid-cols-1 relative">
          {[
            { type: 'urgent', ico: '🔥', tag: 'Alerta', border: 'rgba(244,63,94,.25)', bg: 'rgba(244,63,94,.04)', tagColor: '#f43f5e', text: <><strong>Lazer atingiu 82%</strong> do orçamento. Com {daysLeftInMonth} dias restantes, risco de estouro.</> },
            { type: 'action', ico: '🎯', tag: 'Ação recomendada', border: 'rgba(0,85,255,.20)', bg: 'rgba(0,85,255,.04)', tagColor: '#0055ff', text: <>Meta <strong>Reserva de emergência</strong> está abaixo do ritmo. Considere um aporte extra este mês.</> },
            { type: 'positive', ico: '🌟', tag: 'Conquista', border: 'rgba(16,185,129,.20)', bg: 'rgba(16,185,129,.04)', tagColor: '#10b981', text: <>Taxa de poupança em <strong>{taxaPoupanca}%</strong>{taxaPoupanca >= 30 ? ' — acima da meta de 30%! Continue!' : ' — tente chegar a 30% este mês.'}</> },
            { type: 'heads-up', ico: '📅', tag: 'Previsão', border: 'rgba(245,158,11,.20)', bg: 'rgba(245,158,11,.04)', tagColor: '#f59e0b', text: <>Faltam <strong>{daysLeftInMonth} dias</strong> no mês. Revise seus orçamentos e planeje os gastos restantes.</> },
          ].map(ins => (
            <div
              key={ins.type}
              className="flex gap-2.5 px-3 py-3 rounded-[11px] cursor-default group relative overflow-hidden transition-all duration-200"
              style={{ border: `1px solid ${ins.border}`, background: ins.bg }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 16px ${ins.border}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <span className="text-[20px] shrink-0 leading-none mt-0.5">{ins.ico}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: ins.tagColor }}>{ins.tag}</p>
                <p className="text-[12px] text-[var(--sl-t2)] leading-snug">{ins.text}</p>
              </div>
              <div className="absolute bottom-0 left-[10%] right-[10%] h-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ins.tagColor, boxShadow: `0 0 8px ${ins.tagColor}` }} />
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] relative"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(16,185,129,.15)' }}
        >
          <span className="text-sm opacity-70">💬</span>
          <input
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiAsk() }}
            placeholder='Pergunte algo... ex: "Quanto gastei em lazer este mês?"'
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
          />
          <button
            onClick={handleAiAsk}
            disabled={aiLoading || !aiQuery.trim()}
            className="shrink-0 px-3 py-1.5 rounded-[8px] border-none text-white text-[12px] font-bold transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : 'Perguntar'}
          </button>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-3 px-4 py-3 rounded-[12px] relative" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(16,185,129,.12)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#10b981]">Resposta da IA</span>
              {aiLoading && <Loader2 size={10} className="animate-spin text-[#10b981]" />}
            </div>
            <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* ⑤ TOP GRID: Histórico + Gastos por Categoria */}
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 400px' }}>
        {/* Histórico */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Histórico — Receitas vs Despesas</p>
          </div>
          <div className="flex gap-1.5 items-start">
            <div className="flex flex-col justify-between text-right" style={{ height: 130, paddingBottom: 24 }}>
              {['7k', '5k', '3k', '1k'].map(v => (
                <span key={v} className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)] leading-none">{v}</span>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={histData} barCategoryGap="20%" barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--sl-border)" strokeOpacity={0.5} />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--sl-t3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <RechartsTip content={<CustomHistTip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="rec" fill="#10b981" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="des" fill="#f43f5e" fillOpacity={0.65} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex gap-3 mt-2 pt-2 border-t border-[var(--sl-border)]">
            {[{ cor: '#10b981', label: 'Receitas' }, { cor: '#f43f5e', label: 'Despesas' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
                <div className="w-[7px] h-[7px] rounded-sm" style={{ background: l.cor }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Gastos por Categoria */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Gastos por Categoria</p>
            {alertCat && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">
                ⚠ {alertCat.category?.name ?? 'Cat.'} {alertCat.pct}%
              </span>
            )}
          </div>
          <div className="flex gap-4 items-start">
            <DonutChart data={catData} totalGasto={totalGasto} />
            <div className="flex-1 min-w-0">
              {catData.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)] py-4">Nenhum orçamento com gastos</p>
              ) : (
                catData.map(cat => (
                  <div key={cat.nome} className="flex items-center gap-2 py-1.5 border-b border-[var(--sl-border)] last:border-b-0">
                    <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: cat.cor }} />
                    <span className="flex-1 min-w-0 text-[12px] text-[var(--sl-t2)] truncate">{cat.nome}</span>
                    <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">R$ {fmtR$(cat.val)}</span>
                    <span className="font-bold text-[13px] text-[var(--sl-t1)] shrink-0">{cat.pct}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ FLUXO DE CAIXA */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Fluxo de Caixa — Dia a Dia</p>
        </div>
        <div className="flex gap-2.5 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[12px] text-[var(--sl-t3)] leading-relaxed mb-4">
          <span className="text-[15px] shrink-0 mt-0.5">ℹ️</span>
          <p>
            <strong className="text-[var(--sl-t1)]">Como ler:</strong> Cada coluna = 1 dia.{' '}
            <strong className="text-[var(--sl-t1)]">■ Verde</strong> = dinheiro que entrou.{' '}
            <strong className="text-[var(--sl-t1)]">■ Vermelho</strong> = quanto saiu.
            {' '}Colunas esmaecidas após {String(todayD).padStart(2, '0')}/{String(month).padStart(2, '0')} são previsões.
          </p>
        </div>
        <FluxoCaixaChart days={cfDays} />
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2 mt-3 max-sm:grid-cols-2">
          {[
            {
              lbl: 'Maior entrada',
              val: cfSummary.maxInTxn ? `R$ ${fmtR$(cfSummary.maxInTxn.amount)}` : '—',
              sub: cfSummary.maxInTxn ? `dia ${cfSummary.maxInTxn.date.slice(8)} · ${cfSummary.maxInTxn.description.slice(0, 14)}` : 'Sem receitas',
              color: '#10b981',
            },
            {
              lbl: 'Maior saída num dia',
              val: cfSummary.maxOutTxn ? `R$ ${fmtR$(cfSummary.maxOutTxn.amount)}` : '—',
              sub: cfSummary.maxOutTxn ? `dia ${cfSummary.maxOutTxn.date.slice(8)} · ${cfSummary.maxOutTxn.description.slice(0, 14)}` : 'Sem despesas',
              color: '#f43f5e',
            },
            {
              lbl: 'Saldo mais baixo',
              val: cfSummary.minBal < 0 ? `-R$ ${fmtR$(cfSummary.minBal)}` : `R$ ${fmtR$(cfSummary.minBal)}`,
              sub: cfSummary.minDay > 0 ? `dia ${cfSummary.minDay}` : '—',
              color: cfSummary.minBal < 0 ? '#f43f5e' : '#10b981',
            },
            {
              lbl: 'Saldo acumulado',
              val: `R$ ${fmtR$(saldoMes)}`,
              sub: `até dia ${String(todayD).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
              color: saldoMes >= 0 ? '#0055ff' : '#f43f5e',
            },
          ].map(s => (
            <div key={s.lbl} className="flex flex-col gap-0.5 px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{s.lbl}</p>
              <p className="font-[DM_Mono] text-[14px] font-medium" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px] text-[var(--sl-t3)]">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3.5 mt-2.5 pt-2.5 border-t border-[var(--sl-border)] flex-wrap">
          {[
            { tipo: 'sq', cor: '#10b981', label: 'Entrada no dia' },
            { tipo: 'sq', cor: '#f43f5e', label: 'Saída no dia' },
            { tipo: 'line', cor: '#0055ff', label: 'Saldo na conta' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
              {l.tipo === 'sq'
                ? <div className="w-[9px] h-[9px] rounded-sm" style={{ background: l.cor }} />
                : <div className="w-4 h-0.5 rounded" style={{ background: l.cor }} />
              }
              {l.label}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
            <div className="w-[9px] h-[9px] rounded-sm border border-dashed border-[var(--sl-t3)] opacity-60" />
            Dias previstos
          </div>
        </div>
      </div>

      {/* ⑦ MID GRID: Orçamentos + Últimas Transações */}
      <div className="grid grid-cols-2 gap-3 mb-3 max-lg:grid-cols-1">
        {/* Orçamentos */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Orçamentos do Mês</p>
            <button onClick={() => router.push('/financas/orcamentos')} className="text-[11px] text-[#10b981] hover:underline">Ver todos</button>
          </div>
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[var(--sl-s2)] rounded-[9px] border border-[var(--sl-border)]">
            <span className="text-[11px] text-[var(--sl-t3)] flex-1">Saúde dos envelopes</span>
            <div className="flex gap-1">
              {activeBudgets.slice(0, 5).map(b => (
                <div key={b.id} className="w-2 h-2 rounded-full" style={{ background: getEnvColor(b.pct) }} />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[var(--sl-t2)]">
              {qtdOk} ok · {qtdAlert} atenção{qtdOver > 0 ? ` · ${qtdOver} ⚠` : ''}
            </span>
          </div>
          {activeBudgets.length === 0 && !loadingBudgets ? (
            <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum orçamento com gastos este mês</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeBudgets.slice(0, 5).map(b => (
                <div key={b.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[13px]">{b.category?.icon ?? '📦'}</span>
                      <span className="text-[12px] text-[var(--sl-t2)] truncate">{b.category?.name ?? 'Categoria'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] whitespace-nowrap">
                        <strong className="text-[var(--sl-t2)]">R$ {fmtR$(b.gasto)}</strong> / {fmtR$(b.amount)}
                      </span>
                      <span className="text-[10px] font-bold w-[26px] text-right" style={{ color: getEnvColor(b.pct) }}>{b.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(b.pct, 100)}%`, background: getEnvColor(b.pct) }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 px-2.5 py-2 rounded-[9px] flex items-center justify-between" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.14)' }}>
            <span className="text-[11px] text-[var(--sl-t2)]">Não alocado</span>
            <span className="font-[DM_Mono] text-[13px] font-medium text-[#10b981]">
              {loadingBudgets ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`}
            </span>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Últimas Transações</p>
            <button onClick={() => router.push('/financas/transacoes')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
              Ver todas <ExternalLink size={9} />
            </button>
          </div>
          <div className="flex flex-col">
            {loadingTxns ? (
              <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Carregando...</p>
            ) : latestTxns.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhuma transação este mês</p>
            ) : (
              latestTxns.map((t) => {
                const isIncome = t.type === 'income'
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 py-2 border-b border-[var(--sl-border)] last:border-b-0 cursor-pointer rounded-[8px] hover:bg-[var(--sl-s2)] hover:px-2 hover:-mx-2 transition-all"
                  >
                    <div className="w-[29px] h-[29px] rounded-[8px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--sl-s3)]">
                      {t.category?.icon ?? (isIncome ? '💰' : '📤')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[var(--sl-t1)] truncate">{t.description}</p>
                      <p className="text-[10px] text-[var(--sl-t3)]">{fmtDate(t.date)} · {PAYMENT_LABELS[t.payment_method] ?? t.payment_method}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('font-[DM_Mono] text-[12px] font-medium', isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                        {isIncome ? '+' : ''}R$ {fmtR$(t.amount)}
                      </p>
                      <p className="text-[10px] text-[var(--sl-t3)]">{t.category?.name ?? (isIncome ? 'Receita' : 'Despesa')}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ⑧ PROJEÇÃO DE SALDO */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-5 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Projeção de Saldo — Timeline</p>
          <button onClick={() => router.push('/financas/planejamento')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
            Ver planejamento <ExternalLink size={9} />
          </button>
        </div>

        <div className="flex items-center gap-4 px-4 py-3 rounded-[12px] mb-4" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.08),rgba(0,85,255,.06))', border: '1px solid rgba(16,185,129,.18)' }}>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo do mês (acumulado)</p>
            <p className="font-[DM_Mono] text-[28px] font-medium text-[var(--sl-t1)] leading-none">
              {loadingBudgets ? '—' : `R$ ${fmtR$(saldoMes)}`}
            </p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-1">
              {todayD} de {new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · receitas menos despesas
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {[
              { lbl: 'Total despesas', val: loadingBudgets ? '—' : `R$ ${fmtR$(totalGasto)}`, cor: '#f43f5e' },
              { lbl: 'Não alocado', val: loadingBudgets ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`, cor: '#10b981' },
              { lbl: 'Taxa poupança', val: loadingBudgets ? '—' : `${taxaPoupanca}%`, cor: '#0055ff' },
            ].map(p => (
              <div key={p.lbl} className="text-center px-3 py-1.5 rounded-[8px] bg-[var(--sl-s2)]">
                <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{p.lbl}</p>
                <p className="font-[DM_Mono] text-[13px] font-medium" style={{ color: p.cor }}>{p.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-[var(--sl-s3)] rounded">
            <div className="h-full rounded" style={{ width: '20%', background: 'linear-gradient(90deg,#10b981,#0055ff)' }} />
          </div>
          <div className="flex gap-2">
            {PROJ_MESES.map(m => (
              <div
                key={m.mes}
                className={cn('flex-1 rounded-[9px] px-3 py-3 cursor-pointer transition-all', m.tipo === 'warn' && 'hover:brightness-105')}
                style={{
                  border: m.tipo === 'current' ? '1px solid rgba(16,185,129,.30)' : m.tipo === 'warn' ? '1px solid rgba(244,63,94,.30)' : '1px solid rgba(0,85,255,.20)',
                  background: m.tipo === 'current' ? 'rgba(16,185,129,.06)' : m.tipo === 'warn' ? 'rgba(244,63,94,.05)' : 'rgba(0,85,255,.04)',
                }}
              >
                <div className="flex justify-center mb-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{
                      background: m.tipo === 'current' ? '#10b981' : m.tipo === 'warn' ? '#f43f5e' : '#0055ff',
                      boxShadow: m.tipo === 'current' ? '0 0 8px rgba(16,185,129,.5)' : m.tipo === 'warn' ? '0 0 8px rgba(244,63,94,.5)' : '0 0 8px rgba(0,85,255,.4)',
                    }}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-0.5">{m.mes}</p>
                <p className={cn('font-[DM_Mono] text-[16px] font-medium leading-none mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t1)]')}>
                  R$ {fmtR$(m.val)}
                </p>
                {m.delta && (
                  <p className={cn('text-[10px] mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[#10b981]')}>
                    {m.tipo === 'warn' ? '↓' : '↑'} {m.delta}
                  </p>
                )}
                <p className={cn('text-[10px]', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t3)]')}>{m.nota}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-[8px]" style={{ background: 'rgba(244,63,94,.06)', border: '1px solid rgba(244,63,94,.20)' }}>
          <AlertTriangle size={14} className="text-[#f43f5e] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#f43f5e]">
            <strong>Projeção ilustrativa.</strong> Em breve: projeção baseada em recorrentes + histórico real de gastos.
          </p>
        </div>
      </div>

      {/* ⑨ PRÓXIMAS RECORRENTES */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-6 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Próximas Recorrentes</p>
          <button onClick={() => router.push('/financas/recorrentes')} className="text-[11px] text-[#10b981] hover:underline">Ver todas</button>
        </div>
        {upcomingOccurrences.length === 0 ? (
          <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhuma recorrente prevista nos próximos 30 dias</p>
        ) : (
          <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
            {upcomingOccurrences.slice(0, 5).map(o => {
              const isOver = o.daysLeft === 0
              const isDue = o.daysLeft <= 3
              const statusBg = isOver ? 'rgba(244,63,94,.12)' : isDue ? 'rgba(245,158,11,.12)' : 'rgba(110,144,184,.10)'
              const statusColor = isOver ? '#f43f5e' : isDue ? '#f59e0b' : 'var(--sl-t3)'
              const statusLabel = isOver ? 'hoje' : `${o.day}/${o.monthShort}`
              return (
                <div
                  key={o.id}
                  className="flex flex-col gap-1.5 px-2.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{o.icon}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: statusBg, color: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--sl-t1)] leading-tight">{o.name}</p>
                  <p className={cn('font-[DM_Mono] text-[12px] font-medium', o.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                    R$ {fmtR$(o.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ⑩ FAB */}
      <div ref={fabRef} className="fixed bottom-5 right-5 flex flex-col items-end gap-2 z-50">
        {fabOpen && (
          <div className="flex flex-col items-end gap-1.5 mb-1">
            {[
              { label: 'Nova Transação', ico: '💳', href: '/financas/transacoes' },
              { label: 'Nova Recorrente', ico: '🔄', href: '/financas/recorrentes' },
              { label: 'Novo Orçamento', ico: '💼', href: '/financas/orcamentos' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => { router.push(a.href); setFabOpen(false) }}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[12px] font-semibold text-[var(--sl-t1)] shadow-xl hover:border-[var(--sl-border-h)] transition-all"
              >
                <span>{a.ico}</span>
                {a.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:brightness-110 hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', boxShadow: '0 4px 20px rgba(16,185,129,.35)', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <Plus size={20} />
        </button>
      </div>

    </div>
  )
}
