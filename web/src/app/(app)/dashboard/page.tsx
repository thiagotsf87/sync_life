'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { useTransactions } from '@/hooks/use-transactions'
import { useBudgets } from '@/hooks/use-budgets'
import { useMetas, calcProgress } from '@/hooks/use-metas'
import { useAgenda, getWeekRange } from '@/hooks/use-agenda'
import { useLifeMap } from '@/hooks/use-life-map'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import { useCorpoDashboard } from '@/hooks/use-corpo'
import { usePatrimonioDashboard } from '@/hooks/use-patrimonio'
import { useExperienciasDashboard } from '@/hooks/use-experiencias'
import { DashboardMobile } from '@/components/dashboard/DashboardMobile'
import { useScoreEngine } from '@/hooks/use-score-engine'
import { fmt, getGreeting } from '@/components/dashboard/dashboard-utils'
import { DashboardKpiCard } from '@/components/dashboard/DashboardKpiCard'
import { LifeSyncScoreCard } from '@/components/dashboard/LifeSyncScoreCard'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { BudgetsWidget } from '@/components/dashboard/BudgetsWidget'
import { CategorySpendWidget } from '@/components/dashboard/CategorySpendWidget'
import { GoalsWidget } from '@/components/dashboard/GoalsWidget'
import { WeekAgendaWidget } from '@/components/dashboard/WeekAgendaWidget'
import { RecurrencesWidget } from '@/components/dashboard/RecurrencesWidget'
import { ProjectionWidget } from '@/components/dashboard/ProjectionWidget'
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget'
import { V3ModulesRow } from '@/components/dashboard/V3ModulesRow'
import { LifeMapWidget } from '@/components/dashboard/LifeMapWidget'

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [greeting, setGreeting] = useState('')
  const [userName, setUserName] = useState('Usuário')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        const name = data.user?.user_metadata?.full_name ?? data.user?.email?.split('@')[0] ?? 'Usuário'
        setUserName(name.split(' ')[0])
      })
    })
  }, [])

  const { transactions, isLoading: loadingTxns } = useTransactions({ month, year, type: 'all' })
  const { budgets, isLoading: loadingBudgets } = useBudgets({ month, year })
  const { goals, isLoading: loadingGoals } = useMetas({ status: 'active' })
  const { weekStart } = useMemo(() => getWeekRange(now), [now])
  const { events } = useAgenda({ mode: 'week', referenceDate: now })
  const { upcomingOccurrences } = useRecorrentes()
  const { nextAppointment, weekActivities } = useCorpoDashboard()
  const { assets: patrimonioAssets } = usePatrimonioDashboard()
  const { trips: experienciaTrips } = useExperienciasDashboard()
  const { dimensions: lifeDimensions, overallScore: lifeScore, loading: lifeLoading } = useLifeMap()

  // Real score engine — calculates and persists to life_sync_scores table
  const { result: scoreResult } = useScoreEngine()
  const realScore = scoreResult?.total ?? lifeScore

  // ── financial KPIs ──
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions])
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions])
  const balance = totalIncome - totalExpense

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])
  const goalsAtRisk = useMemo(() => activeGoals.filter(g => calcProgress(g.current_amount, g.target_amount) < 40).length, [activeGoals])

  // ── category spending ──
  const categorySpend = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string; total: number }> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = t.category?.name ?? 'Outros'
      if (!map[key]) map[key] = { name: key, icon: t.category?.icon ?? '📦', color: t.category?.color ?? '#6e90b8', total: 0 }
      map[key].total += t.amount
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 7)
  }, [transactions])

  const maxCatSpend = useMemo(() => Math.max(...categorySpend.map(c => c.total), 1), [categorySpend])

  // ── top goals (by nearest deadline) ──
  const topGoals = useMemo(() => [...activeGoals].sort((a, b) => {
    if (!a.target_date && !b.target_date) return 0
    if (!a.target_date) return 1
    if (!b.target_date) return -1
    return new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
  }).slice(0, 3), [activeGoals])

  // ── upcoming recurrences ──
  const nextRecurrences = useMemo(() => [...upcomingOccurrences].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4), [upcomingOccurrences])

  // ── week days ──
  const weekDays = useMemo(() => {
    const days = []
    const [sy, sm, sd] = weekStart.split('-').map(Number)
    const start = new Date(sy, sm - 1, sd)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const isToday = d.toDateString() === now.toDateString()
      const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayEvents = events.filter(e => e.date === localStr)
      days.push({ date: d, isToday, events: dayEvents })
    }
    return days
  }, [weekStart, events, now])

  // ── sparkline (projected balance next 30d) ──
  const sparklineData = useMemo(() => {
    const base = balance > 0 ? balance : 500
    const recurringMonthly = nextRecurrences.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    return Array.from({ length: 8 }, (_, i) => ({
      day: `D${i * 4}`,
      saldo: Math.round(base - (recurringMonthly * (i / 7)) + (totalIncome * 0.03 * i)),
    }))
  }, [balance, nextRecurrences, totalIncome])

  // ── summary stats ──
  const budgetsOver = useMemo(() => budgets.filter(b => b.pct > 85).length, [budgets])
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0
  const topExpenseCat = categorySpend[0]
  const topExpensePct = totalIncome > 0 && topExpenseCat ? Math.round((topExpenseCat.total / totalIncome) * 100) : 0

  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  const projectedBalance = sparklineData[sparklineData.length - 1]?.saldo ?? 0

  // ── V3 module KPIs ──
  const totalPatrimonio = useMemo(() =>
    patrimonioAssets.reduce((s, a) => s + a.quantity * (a.current_price ?? a.avg_price), 0),
    [patrimonioAssets])
  const totalInvested = useMemo(() =>
    patrimonioAssets.reduce((s, a) => s + a.quantity * a.avg_price, 0),
    [patrimonioAssets])
  const patrimonioGainPct = totalInvested > 0
    ? Math.round(((totalPatrimonio - totalInvested) / totalInvested) * 100)
    : 0

  const nextTrip = useMemo(() =>
    experienciaTrips
      .filter(t => ['planning', 'reserved', 'ongoing'].includes(t.status))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] ?? null,
    [experienciaTrips])
  const daysUntilNextTrip = nextTrip
    ? Math.ceil((new Date(nextTrip.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const weekActivityCount = weekActivities.length
  const weekActivityMinutes = useMemo(() =>
    weekActivities.reduce((s, a) => s + a.duration_minutes, 0),
    [weekActivities])

  // ── mobile data ──
  const mobileModuleScores = useMemo(() => {
    const dims = lifeDimensions
    return [
      { id: 'financas', emoji: '💰', label: 'Finanças', pct: dims.find(d => d.key === 'financas')?.value ?? 0, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
      { id: 'tempo', emoji: '⏳', label: 'Tempo', pct: dims.find(d => d.key === 'tempo')?.value ?? 0, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
      { id: 'futuro', emoji: '🔮', label: 'Futuro', pct: dims.find(d => d.key === 'futuro')?.value ?? 0, color: '#0055ff', bg: 'rgba(0,85,255,0.15)' },
    ]
  }, [lifeDimensions])

  const mobileAlerts = useMemo(() => {
    const a: { color: string; title: string; text: string }[] = []
    budgets.filter(b => b.pct > 70).forEach(b => {
      a.push({
        color: b.pct > 85 ? '#f43f5e' : '#f59e0b',
        title: `Orçamento ${b.category?.name ?? 'Categoria'}`,
        text: `atingiu ${b.pct}% — ${fmt(b.amount - b.gasto)} restantes`,
      })
    })
    nextRecurrences.slice(0, 2).forEach(r => {
      a.push({
        color: '#10b981',
        title: r.name,
        text: `vence ${r.daysLeft === 0 ? 'hoje' : `em ${r.daysLeft} dias`} — ${fmt(r.amount)} agendado`,
      })
    })
    return a.slice(0, 3)
  }, [budgets, nextRecurrences])

  return (
    <>
    {/* MOBILE LAYOUT */}
    <DashboardMobile
      userName={userName}
      lifeScore={realScore}
      moduleScores={mobileModuleScores}
      alerts={mobileAlerts}
      budgetsOver={budgetsOver}
      goalsAtRisk={goalsAtRisk}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      projectedBalance={projectedBalance}
      isEmpty={totalIncome === 0 && totalExpense === 0}
    />

    {/* DESKTOP LAYOUT */}
    <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① HEADER */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <div>
            <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad leading-tight">
              {greeting}, {userName}! ✨
            </h1>
            <p className="text-[13px] text-[var(--sl-t3)] italic mt-0.5">Registros em dia — continue assim.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[12px] font-semibold"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}>
            🔥 7 dias
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s2)] text-[12px] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all">
            <Calendar size={13} />
            {monthLabel}
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* ② LIFE SYNC SCORE */}
      <LifeSyncScoreCard
        realScore={realScore}
        scoreLabel={scoreResult?.label}
        lifeDimensions={lifeDimensions}
        lifeLoading={lifeLoading}
      />

      {/* ③ KPI CARDS */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <DashboardKpiCard label="Receitas" value={fmt(totalIncome)}
          delta="↑ receitas do mês" deltaType="up"
          accent="#10b981" icon="💰" iconBg="rgba(16,185,129,0.12)" delay="sl-delay-1" />
        <DashboardKpiCard label="Despesas" value={fmt(totalExpense)}
          delta={totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% da receita` : '—'} deltaType="down"
          accent="#f43f5e" icon="📤" iconBg="rgba(244,63,94,0.12)"
          barPct={totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0} barBg="#f43f5e"
          delay="sl-delay-2" />
        <DashboardKpiCard label="Saldo do Mês" value={fmt(balance)}
          delta={balance >= 0 ? '↑ saldo positivo' : '↓ saldo negativo'} deltaType={balance >= 0 ? 'up' : 'down'}
          accent="#10b981" icon="💚" iconBg="rgba(16,185,129,0.12)" delay="sl-delay-3" />
        <DashboardKpiCard label="Metas Ativas" value={String(activeGoals.length)}
          delta={goalsAtRisk > 0 ? `⚠ ${goalsAtRisk} em risco` : '✓ todas no ritmo'} deltaType={goalsAtRisk > 0 ? 'warn' : 'up'}
          accent="#f59e0b" icon="🎯" iconBg="rgba(245,158,11,0.12)"
          barPct={activeGoals.length > 0 ? Math.round(((activeGoals.length - goalsAtRisk) / activeGoals.length) * 100) : 0}
          barBg="linear-gradient(90deg, #10b981, #0055ff)" delay="sl-delay-4" />
      </div>

      {/* ④ INSIGHT CARD */}
      <InsightCard
        monthLabel={monthLabel}
        year={year}
        now={now}
        budgetsOver={budgetsOver}
        goalsAtRisk={goalsAtRisk}
        projectedBalance={projectedBalance}
        balance={balance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        savingsRate={savingsRate}
        budgets={budgets}
        categorySpend={categorySpend}
        activeGoalsCount={activeGoals.length}
        topExpenseCat={topExpenseCat}
        topExpensePct={topExpensePct}
      />

      {/* ⑤ MAIN GRID */}
      <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <BudgetsWidget budgets={budgets} loading={loadingBudgets} />
          <CategorySpendWidget
            categorySpend={categorySpend}
            maxCatSpend={maxCatSpend}
            totalExpense={totalExpense}
            loading={loadingTxns}
          />
        </div>
        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <GoalsWidget topGoals={topGoals} loading={loadingGoals} />
          <WeekAgendaWidget weekDays={weekDays} events={events} now={now} />
        </div>
      </div>

      {/* ⑥ BOTTOM GRID */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <RecurrencesWidget nextRecurrences={nextRecurrences} />
        <ProjectionWidget
          sparklineData={sparklineData}
          balance={balance}
          projectedBalance={projectedBalance}
          nextRecurrence={nextRecurrences[0]}
        />
        <AchievementsWidget />
      </div>

      {/* ⑦ V3 MODULES ROW */}
      <V3ModulesRow
        weekActivityCount={weekActivityCount}
        weekActivityMinutes={weekActivityMinutes}
        nextAppointment={nextAppointment}
        totalPatrimonio={totalPatrimonio}
        patrimonioGainPct={patrimonioGainPct}
        patrimonioAssetsCount={patrimonioAssets.length}
        nextTrip={nextTrip}
        daysUntilNextTrip={daysUntilNextTrip}
        totalTrips={experienciaTrips.length}
      />

      {/* ⑧ Mapa da Vida */}
      <LifeMapWidget
        lifeDimensions={lifeDimensions}
        realScore={realScore}
        lifeLoading={lifeLoading}
      />

    </div>
    </>
  )
}
