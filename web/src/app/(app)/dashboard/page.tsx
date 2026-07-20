'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  FileText,
  Plus,
  DollarSign,
  Clock,
  Brain,
  Activity,
  Briefcase,
  Target,
  TrendingUp,
  Plane,
} from 'lucide-react'
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
import { ModuleMosaic } from '@/components/shell/module-mosaic'
import { BudgetsWidget } from '@/components/dashboard/BudgetsWidget'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { GoalsWidget } from '@/components/dashboard/GoalsWidget'
import { WeekAgendaWidget } from '@/components/dashboard/WeekAgendaWidget'
import { RecurrencesWidget } from '@/components/dashboard/RecurrencesWidget'
import { ProjectionWidget } from '@/components/dashboard/ProjectionWidget'
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget'
import { HeroScoreMassive } from '@/components/dashboard/HeroScoreMassive'
import { FinancialStrip } from '@/components/dashboard/FinancialStrip'
import { HighlightsCard, type HighlightItem } from '@/components/dashboard/HighlightsCard'
import { useRelatorioCompleto } from '@/hooks/use-relatorio-completo'

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [greeting, setGreeting] = useState('')
  const [userName, setUserName] = useState('Usuário')

  useEffect(() => { setGreeting(getGreeting()) }, [])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        const name = data.user?.user_metadata?.full_name ?? data.user?.email?.split('@')[0] ?? 'Usuário'
        setUserName(name.split(' ')[0])
      })
    })
  }, [])

  const { transactions } = useTransactions({ month, year, type: 'all' })
  const { budgets, isLoading: loadingBudgets } = useBudgets({ month, year })
  const { goals, isLoading: loadingGoals } = useMetas({ status: 'active' })
  const { weekStart } = useMemo(() => getWeekRange(now), [now])
  const { events } = useAgenda({ mode: 'week', referenceDate: now })
  const { upcomingOccurrences } = useRecorrentes()
  const { weekActivities } = useCorpoDashboard()
  const { assets: patrimonioAssets } = usePatrimonioDashboard()
  const { trips: experienciaTrips } = useExperienciasDashboard()
  const { dimensions: lifeDimensions, overallScore: lifeScore } = useLifeMap()
  const { result: scoreResult } = useScoreEngine()
  const realScore = scoreResult?.total ?? lifeScore
  const { generate: generatePdf, generating: pdfGenerating } = useRelatorioCompleto()

  // ── financial KPIs ──
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions])
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions])
  const balance = totalIncome - totalExpense

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals])
  const goalsAtRisk = useMemo(() => activeGoals.filter(g => calcProgress(g.current_amount, g.target_amount) < 40).length, [activeGoals])

  const categorySpend = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string; total: number }> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = t.category?.name ?? 'Outros'
      if (!map[key]) map[key] = { name: key, icon: t.category?.icon ?? '📦', color: t.category?.color ?? '#6e90b8', total: 0 }
      map[key].total += t.amount
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 7)
  }, [transactions])

  const topGoals = useMemo(() => [...activeGoals].sort((a, b) => {
    if (!a.target_date && !b.target_date) return 0
    if (!a.target_date) return 1
    if (!b.target_date) return -1
    return new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
  }).slice(0, 3), [activeGoals])

  const nextRecurrences = useMemo(() => [...upcomingOccurrences].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4), [upcomingOccurrences])

  const weekDays = useMemo(() => {
    const days: { date: Date; isToday: boolean; events: typeof events }[] = []
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

  const sparklineData = useMemo(() => {
    const base = balance > 0 ? balance : 500
    const recurringMonthly = nextRecurrences.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    return Array.from({ length: 8 }, (_, i) => ({
      day: `D${i * 4}`,
      saldo: Math.round(base - (recurringMonthly * (i / 7)) + (totalIncome * 0.03 * i)),
    }))
  }, [balance, nextRecurrences, totalIncome])

  const budgetsOver = useMemo(() => budgets.filter(b => b.pct > 85).length, [budgets])
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0
  const topExpenseCat = categorySpend[0]
  const topExpensePct = totalIncome > 0 && topExpenseCat ? Math.round((topExpenseCat.total / totalIncome) * 100) : 0
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())
  const projectedBalance = sparklineData[sparklineData.length - 1]?.saldo ?? 0

  // V3 module KPIs
  const totalPatrimonio = useMemo(() =>
    patrimonioAssets.reduce((s, a) => s + a.quantity * (a.current_price ?? a.avg_price), 0), [patrimonioAssets])
  const totalInvested = useMemo(() =>
    patrimonioAssets.reduce((s, a) => s + a.quantity * a.avg_price, 0), [patrimonioAssets])
  const patrimonioGainPct = totalInvested > 0 ? Math.round(((totalPatrimonio - totalInvested) / totalInvested) * 100) : 0

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
    weekActivities.reduce((s, a) => s + a.duration_minutes, 0), [weekActivities])

  // Module mosaic data (8 dimensions)
  const mosaicModules = useMemo(() => {
    const dimMap = new Map(lifeDimensions.map(d => [d.key, d.value]))
    return [
      { name: 'Finanças', score: dimMap.get('financas') ?? 0, color: '#0F766E', icon: DollarSign, metric: `Saldo: ${fmt(balance)}`, progress: dimMap.get('financas') ?? 0 },
      { name: 'Experiências', score: dimMap.get('experiencias') ?? 0, color: '#C76795', icon: Plane, metric: nextTrip ? `${nextTrip.destinations?.[0] ?? nextTrip.name} em ${daysUntilNextTrip}d` : `${experienciaTrips.length} viagens`, progress: dimMap.get('experiencias') ?? 0 },
      { name: 'Mente', score: dimMap.get('mente') ?? 0, color: '#D9962E', icon: Brain, metric: 'Meditação e estudos', progress: dimMap.get('mente') ?? 0 },
      { name: 'Corpo', score: dimMap.get('corpo') ?? 0, color: '#D97534', icon: Activity, metric: `${weekActivityCount} atividades sem.`, progress: dimMap.get('corpo') ?? 0 },
      { name: 'Patrimônio', score: dimMap.get('patrimonio') ?? 0, color: '#4F88D4', icon: TrendingUp, metric: `${fmt(totalPatrimonio)} · ${patrimonioGainPct >= 0 ? '+' : ''}${patrimonioGainPct}%`, progress: dimMap.get('patrimonio') ?? 0 },
      { name: 'Tempo', score: dimMap.get('tempo') ?? 0, color: '#3CA0B5', icon: Clock, metric: `${events.length} eventos · ${weekDays.filter(d => d.events.length > 0).length}/7 dias`, progress: dimMap.get('tempo') ?? 0 },
      { name: 'Carreira', score: dimMap.get('carreira') ?? 0, color: '#DB6478', icon: Briefcase, metric: 'Progresso profissional', progress: dimMap.get('carreira') ?? 0 },
      { name: 'Futuro', score: dimMap.get('futuro') ?? 0, color: '#8B7BD4', icon: Target, metric: `${activeGoals.length} metas · ${activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + calcProgress(g.current_amount, g.target_amount), 0) / activeGoals.length) : 0}% média`, progress: dimMap.get('futuro') ?? 0 },
    ]
  }, [lifeDimensions, balance, nextTrip, daysUntilNextTrip, experienciaTrips.length, weekActivityCount, totalPatrimonio, patrimonioGainPct, events.length, weekDays, activeGoals])

  // Mobile data
  const mobileModuleScores = useMemo(() => {
    const dims = lifeDimensions
    return [
      { id: 'financas', emoji: '💰', label: 'Finanças', pct: dims.find(d => d.key === 'financas')?.value ?? 0, color: '#0F766E', bg: 'rgba(15,118,110,0.15)' },
      { id: 'tempo', emoji: '⏳', label: 'Tempo', pct: dims.find(d => d.key === 'tempo')?.value ?? 0, color: '#3CA0B5', bg: 'rgba(60,160,181,0.15)' },
      { id: 'futuro', emoji: '🔮', label: 'Futuro', pct: dims.find(d => d.key === 'futuro')?.value ?? 0, color: '#8B7BD4', bg: 'rgba(139,123,212,0.15)' },
    ]
  }, [lifeDimensions])

  const mobileAlerts = useMemo(() => {
    const a: { color: string; title: string; text: string }[] = []
    budgets.filter(b => b.pct > 70).forEach(b => {
      a.push({ color: b.pct > 85 ? '#DB6478' : '#D9962E', title: `Orçamento ${b.category?.name ?? 'Categoria'}`, text: `atingiu ${b.pct}% · ${fmt(b.amount - b.gasto)} restantes` })
    })
    nextRecurrences.slice(0, 2).forEach(r => {
      a.push({ color: '#0F766E', title: r.name, text: `vence ${r.daysLeft === 0 ? 'hoje' : `em ${r.daysLeft} dias`} · ${fmt(r.amount)} agendado` })
    })
    return a.slice(0, 3)
  }, [budgets, nextRecurrences])

  // ── TopBar date eyebrow ──
  const dateEyebrow = useMemo(() => {
    const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' })
    const day = now.getDate()
    const monthShort = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const yr = now.getFullYear()
    return `${weekday} · ${day} ${monthShort} ${yr}`.toUpperCase()
  }, [now])

  // ── Highlights ──
  const highlightItems = useMemo<HighlightItem[]>(() => {
    const items: HighlightItem[] = [
      {
        icon: Activity,
        iconColor: '#D97534',
        label: 'Corpo',
        sub: weekActivityCount > 0
          ? `${weekActivityCount} atividades · ${weekActivityMinutes} min`
          : 'Sem atividades esta semana',
        delta: weekActivityCount > 0 ? `${weekActivityCount}x` : '—',
        deltaColor: weekActivityCount > 0 ? 'var(--sl-em)' : 'var(--sl-t3)',
        up: weekActivityCount > 0,
      },
      {
        icon: TrendingUp,
        iconColor: '#4F88D4',
        label: 'Patrimônio',
        sub: totalPatrimonio > 0
          ? `${fmt(totalPatrimonio)} investidos`
          : 'Sem ativos cadastrados',
        delta: totalPatrimonio > 0 ? `${patrimonioGainPct >= 0 ? '+' : ''}${patrimonioGainPct}%` : '—',
        deltaColor: patrimonioGainPct >= 0 ? 'var(--sl-em)' : 'var(--sl-danger)',
        up: totalPatrimonio > 0 && patrimonioGainPct >= 0,
      },
      {
        icon: Plane,
        iconColor: '#C76795',
        label: nextTrip?.name ?? 'Próxima viagem',
        sub: nextTrip
          ? `${nextTrip.destinations?.[0] ?? 'Destino'} · em ${daysUntilNextTrip} dias`
          : 'Nenhuma planejada',
        delta: daysUntilNextTrip != null ? `${daysUntilNextTrip}d` : '—',
        deltaColor: '#C76795',
      },
    ]
    return items
  }, [weekActivityCount, weekActivityMinutes, totalPatrimonio, patrimonioGainPct, nextTrip, daysUntilNextTrip])

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

    {/* DESKTOP LAYOUT — Padrão 1 (Overview com KPIs) */}
    <div className="hidden lg:block max-w-[1400px] mx-auto px-10 py-9 pb-16">

      {/* ① TOP BAR — eyebrow data + saudação + ações */}
      <header className="flex items-end justify-between gap-6 mb-7 sl-fade-up">
        <div className="flex flex-col gap-1.5">
          <p className="font-[IBM_Plex_Mono] text-[11px] uppercase tracking-[0.14em] text-[var(--sl-t3)]">
            {dateEyebrow}
          </p>
          <h1
            className="font-[Syne] font-extrabold text-[32px] leading-[1.1] tracking-tight text-[var(--sl-t1)] m-0"
          >
            {greeting ? `${greeting}, ${userName}.` : `Olá, ${userName}.`}
          </h1>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard/review')}
            className="inline-flex items-center gap-[7px] px-[14px] py-[9px] rounded-[10px] text-[13px] font-medium border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            <ClipboardList size={14} />
            Revisão semanal
          </button>
          <button
            type="button"
            onClick={() => generatePdf(
              realScore,
              lifeDimensions.map(d => ({ name: d.label, score: d.value }))
            )}
            disabled={pdfGenerating}
            className="inline-flex items-center gap-[7px] px-[14px] py-[9px] rounded-[10px] text-[13px] font-medium border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors disabled:opacity-50"
          >
            <FileText size={14} />
            {pdfGenerating ? 'Gerando...' : 'Gerar relatório'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/financas/transacoes?new=1')}
            className="inline-flex items-center gap-[7px] px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold bg-[var(--sl-em)] text-white border-none hover:bg-[var(--sl-em-strong)] transition-colors"
          >
            <Plus size={14} />
            Nova entrada
          </button>
        </div>
      </header>

      {/* ② HERO MASSIVE (UM hero por tela — G-05) */}
      <div className="mb-7">
        <HeroScoreMassive
          score={realScore}
          delta={realScore > 0 ? 3 : undefined}
          evolution={realScore > 0 ? [
            Math.max(0, realScore - 6),
            Math.max(0, realScore - 4),
            Math.max(0, realScore - 5),
            Math.max(0, realScore - 3),
            Math.max(0, realScore - 1),
            realScore,
          ] : []}
          rangeLabel="últimas 6 semanas"
          status={realScore >= 60 ? 'tracking' : realScore >= 40 ? 'attention' : 'risk'}
          onHowToImprove={() => router.push('/conquistas')}
        />
      </div>

      {/* ③ MOSAIC — 8 dimensões */}
      <section className="mb-7 sl-fade-up" style={{ animationDelay: '.06s' }}>
        <div className="flex justify-between items-baseline pl-1 mb-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
            Suas 8 dimensões
          </p>
          <button
            type="button"
            onClick={() => router.push('/conquistas')}
            className="text-[12px] text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors inline-flex items-center gap-1"
          >
            Ver detalhes
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <ModuleMosaic modules={mosaicModules} />
      </section>

      {/* ④ KPI STRIP financeiro */}
      <div className="mb-7 sl-fade-up" style={{ animationDelay: '.12s' }}>
        <FinancialStrip
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          savingsRate={savingsRate}
        />
      </div>

      {/* ⑤ CONTENT GRID — LEFT 1.4fr (lista densa + IA) · RIGHT 1fr (3 cards laterais) */}
      <section
        className="grid grid-cols-[1.4fr_1fr] gap-5 mb-7 max-lg:grid-cols-1 sl-fade-up"
        style={{ animationDelay: '.18s' }}
      >
        {/* LEFT — Orçamentos + Consultor IA */}
        <div className="flex flex-col gap-5">
          <BudgetsWidget budgets={budgets} loading={loadingBudgets} />
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
        </div>

        {/* RIGHT — Metas + Agenda + Destaques */}
        <div className="flex flex-col gap-5">
          <GoalsWidget topGoals={topGoals} loading={loadingGoals} />
          <WeekAgendaWidget weekDays={weekDays} events={events} now={now} />
          <HighlightsCard items={highlightItems} />
        </div>
      </section>

      {/* ⑥ WIDGET STRIP — Recorrentes / Projeção / Conquistas */}
      <div
        className="grid grid-cols-3 gap-4 sl-fade-up max-lg:grid-cols-1"
        style={{ animationDelay: '.24s' }}
      >
        <RecurrencesWidget nextRecurrences={nextRecurrences} />
        <ProjectionWidget
          sparklineData={sparklineData}
          balance={balance}
          projectedBalance={projectedBalance}
          nextRecurrence={nextRecurrences[0]}
        />
        <AchievementsWidget />
      </div>

    </div>
    </>
  )
}
