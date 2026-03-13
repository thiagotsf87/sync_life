'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { USE_MOCK } from '@/lib/mock-financas'
import { useBudgets } from '@/hooks/use-budgets'
import { useTransactions } from '@/hooks/use-transactions'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { FinancasMobile } from '@/components/financas/FinancasMobile'
import { KpiStrip } from '@/components/financas/KpiStrip'
import { HealthBand } from '@/components/financas/HealthBand'
import { AiConsultant } from '@/components/financas/AiConsultant'
import { HistoricoChart } from '@/components/financas/HistoricoChart'
import { FluxoCaixaSection } from '@/components/financas/FluxoCaixaSection'
import { OrcamentosCard } from '@/components/financas/OrcamentosCard'
import { UltimasTransacoes } from '@/components/financas/UltimasTransacoes'
import { ProjecaoSaldo } from '@/components/financas/ProjecaoSaldo'
import { ProximasRecorrentes } from '@/components/financas/ProximasRecorrentes'
import type { MonthlyAgg, CatDataItem, CfDay } from '@/components/financas/helpers'

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FinancasDashboardPage() {
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)
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
    receitasMes, totalGasto, naoAlocado, activeBudgets,
    qtdOk, qtdAlert, qtdOver, isLoading: loadingBudgets,
  } = useBudgets({ month, year })

  const { transactions, isLoading: loadingTxns } = useTransactions({
    month, year, sort: 'newest', pageSize: 200,
  })

  const { upcomingOccurrences } = useRecorrentes()

  // ── 6-month history for BarChart ─────────────────────────────────────────
  const [histData, setHistData] = useState<MonthlyAgg[]>([])

  useEffect(() => {
    if (USE_MOCK) {
      const mockHist: MonthlyAgg[] = [
        { mes: 'Out', rec: 9500, des: 5510 },
        { mes: 'Nov', rec: 10200, des: 6350 },
        { mes: 'Dez', rec: 12800, des: 8200 },
        { mes: 'Jan', rec: 10500, des: 5100 },
        { mes: 'Fev', rec: 10500, des: 6600 },
        { mes: 'Mar', rec: 10500, des: 5380 },
      ]
      setHistData(mockHist)
      return
    }

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

  const pendingRecCount = upcomingOccurrences.filter(o => o.type === 'expense' && o.daysLeft <= 7).length

  const daysLeftInMonth = daysInMonth - todayD
  const weekOfMonth = Math.ceil(todayD / 7)
  const totalWeeks = Math.ceil(daysInMonth / 7)

  const alertCat = activeBudgets.find(b => b.pct >= 100) ?? activeBudgets.find(b => b.pct > 70)

  const mesAno = new Date(year, month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

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
    <>
    {/* MOBILE LAYOUT */}
    <FinancasMobile
      totalIncome={receitasMes}
      totalExpense={totalGasto}
      balance={saldoMes}
      budgets={activeBudgets}
      projectedBalance={saldoMes + (receitasMes - totalGasto) * 0.3}
      mesLabel={mesAno}
      latestTransactions={latestTxns}
    />

    {/* DESKTOP LAYOUT */}
    <div className="hidden lg:block max-w-[1140px] mx-auto">

      {/* 1 PAGE HEADER */}
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

      {/* 2 KPI STRIP */}
      <KpiStrip
        receitasMes={receitasMes}
        totalGasto={totalGasto}
        saldoMes={saldoMes}
        naoAlocado={naoAlocado}
        taxaPoupanca={taxaPoupanca}
        loading={loadingBudgets}
      />

      {/* 3 HEALTH BAND */}
      <HealthBand
        receitasMes={receitasMes}
        totalGasto={totalGasto}
        saldoMes={saldoMes}
        taxaPoupanca={taxaPoupanca}
        qtdOk={qtdOk}
        qtdAlert={qtdAlert}
        qtdOver={qtdOver}
      />

      {/* 4 AI CONSULTANT */}
      <AiConsultant
        mesAno={mesAno}
        receitasMes={receitasMes}
        totalGasto={totalGasto}
        taxaPoupanca={taxaPoupanca}
        daysLeftInMonth={daysLeftInMonth}
        daysInMonth={daysInMonth}
        todayD={todayD}
        activeBudgets={activeBudgets}
        pendingRecCount={pendingRecCount}
      />

      {/* 5 TOP GRID: Historico + Gastos por Categoria */}
      <HistoricoChart
        histData={histData}
        catData={catData}
        totalGasto={totalGasto}
        alertCat={alertCat ?? null}
      />

      {/* 6 FLUXO DE CAIXA */}
      <FluxoCaixaSection
        cfDays={cfDays}
        cfSummary={cfSummary}
        saldoMes={saldoMes}
        todayD={todayD}
        month={month}
      />

      {/* 7 MID GRID: Orcamentos + Ultimas Transacoes */}
      <div className="grid grid-cols-2 gap-3 mb-3 max-lg:grid-cols-1">
        <OrcamentosCard
          activeBudgets={activeBudgets}
          loadingBudgets={loadingBudgets}
          naoAlocado={naoAlocado}
          qtdOk={qtdOk}
          qtdAlert={qtdAlert}
          qtdOver={qtdOver}
        />
        <UltimasTransacoes
          transactions={latestTxns}
          loading={loadingTxns}
        />
      </div>

      {/* 8 PROJECAO DE SALDO */}
      <ProjecaoSaldo
        saldoMes={saldoMes}
        totalGasto={totalGasto}
        naoAlocado={naoAlocado}
        taxaPoupanca={taxaPoupanca}
        todayD={todayD}
        month={month}
        year={year}
        loading={loadingBudgets}
      />

      {/* 9 PROXIMAS RECORRENTES */}
      <ProximasRecorrentes upcomingOccurrences={upcomingOccurrences} />

      {/* 10 FAB */}
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
    </>
  )
}
