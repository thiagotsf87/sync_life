'use client'

import { useState, useEffect, useMemo } from 'react'
import { Globe, ClipboardList, Activity, DollarSign, Clock, Brain, Briefcase, Target, TrendingUp, Plane } from 'lucide-react'
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
import { ModuleHeader } from '@/components/ui/module-header'
import { ModuleMosaic } from '@/components/shell/module-mosaic'
import { BudgetsWidget } from '@/components/dashboard/BudgetsWidget'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { GoalsWidget } from '@/components/dashboard/GoalsWidget'
import { WeekAgendaWidget } from '@/components/dashboard/WeekAgendaWidget'
import { RecurrencesWidget } from '@/components/dashboard/RecurrencesWidget'
import { ProjectionWidget } from '@/components/dashboard/ProjectionWidget'
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget'

// ─── Inline Sparkline bars ─────────────────────────────────────────────────
function SparkBars({ values }: { values: number[] }) {
  return (
    <div className="flex items-end gap-[3px] h-[36px]">
      {values.map((v, i) => (
        <i
          key={i}
          className="block w-4 rounded-[3px]"
          style={{
            height: `${v}%`,
            background: i === values.length - 1
              ? 'var(--sl-mod, #6366f1)'
              : `rgba(99,102,241,${0.15 + i * 0.08})`,
            boxShadow: i === values.length - 1 ? '0 0 8px rgba(99,102,241,.4)' : undefined,
          }}
        />
      ))}
    </div>
  )
}

// ─── Highlight Row ──────────────────────────────────────────────────────────
function HighlightRow({ icon: Icon, iconBg, iconColor, label, sub, delta, deltaColor }: {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  iconBg: string; iconColor: string; label: string; sub: string
  delta: string; deltaColor: string
}) {
  return (
    <div className="flex items-center gap-2.5 p-[8px_12px] bg-[var(--sl-s2)] rounded-[10px]">
      <div className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon size={12} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-[var(--sl-t1)]">{label}</div>
        <div className="text-[10px] text-[var(--sl-t3)]">{sub}</div>
      </div>
      <span className="text-[11px] font-medium" style={{ color: deltaColor }}>{delta}</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
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
  const { result: scoreResult } = useScoreEngine()
  const realScore = scoreResult?.total ?? lifeScore

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

  // Module mosaic data
  const mosaicModules = useMemo(() => {
    const dimMap = new Map(lifeDimensions.map(d => [d.key, d.value]))
    return [
      { name: 'Finanças', score: dimMap.get('financas') ?? 0, color: '#10b981', icon: DollarSign, metric: `Saldo: ${fmt(balance)}`, progress: dimMap.get('financas') ?? 0 },
      { name: 'Experiências', score: dimMap.get('experiencias') ?? 0, color: '#ec4899', icon: Plane, metric: nextTrip ? `${nextTrip.destinations?.[0] ?? nextTrip.name} em ${daysUntilNextTrip}d` : `${experienciaTrips.length} viagens`, progress: dimMap.get('experiencias') ?? 0 },
      { name: 'Mente', score: dimMap.get('mente') ?? 0, color: '#eab308', icon: Brain, metric: 'Meditação e estudos', progress: dimMap.get('mente') ?? 0 },
      { name: 'Corpo', score: dimMap.get('corpo') ?? 0, color: '#f97316', icon: Activity, metric: `${weekActivityCount} atividades sem.`, progress: dimMap.get('corpo') ?? 0 },
      { name: 'Patrimônio', score: dimMap.get('patrimonio') ?? 0, color: '#3b82f6', icon: TrendingUp, metric: `${fmt(totalPatrimonio)} · ${patrimonioGainPct >= 0 ? '+' : ''}${patrimonioGainPct}%`, progress: dimMap.get('patrimonio') ?? 0 },
      { name: 'Tempo', score: dimMap.get('tempo') ?? 0, color: '#06b6d4', icon: Clock, metric: `${events.length} eventos · ${weekDays.filter(d => d.events.length > 0).length}/7 dias`, progress: dimMap.get('tempo') ?? 0 },
      { name: 'Carreira', score: dimMap.get('carreira') ?? 0, color: '#f43f5e', icon: Briefcase, metric: 'Progresso profissional', progress: dimMap.get('carreira') ?? 0 },
      { name: 'Futuro', score: dimMap.get('futuro') ?? 0, color: '#0055ff', icon: Target, metric: `${activeGoals.length} metas · ${activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + calcProgress(g.current_amount, g.target_amount), 0) / activeGoals.length) : 0}% média`, progress: dimMap.get('futuro') ?? 0 },
    ]
  }, [lifeDimensions, balance, nextTrip, daysUntilNextTrip, experienciaTrips.length, weekActivityCount, totalPatrimonio, patrimonioGainPct, events.length, weekDays, activeGoals])

  // Mobile data
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
      a.push({ color: b.pct > 85 ? '#f43f5e' : '#f59e0b', title: `Orçamento ${b.category?.name ?? 'Categoria'}`, text: `atingiu ${b.pct}% — ${fmt(b.amount - b.gasto)} restantes` })
    })
    nextRecurrences.slice(0, 2).forEach(r => {
      a.push({ color: '#10b981', title: r.name, text: `vence ${r.daysLeft === 0 ? 'hoje' : `em ${r.daysLeft} dias`} — ${fmt(r.amount)} agendado` })
    })
    return a.slice(0, 3)
  }, [budgets, nextRecurrences])

  const dateSubtitle = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

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
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ① MODULE HEADER */}
      <ModuleHeader
        icon={Globe}
        iconBg="rgba(99,102,241,.08)"
        iconColor="#6366f1"
        title="Panorama"
        subtitle={`${dateSubtitle} · ${greeting}, ${userName}!`}
      >
        <button className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all cursor-pointer">
          <ClipboardList size={16} />
          Review Semanal
        </button>
        <button className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold bg-[#6366f1] text-white border-none cursor-pointer hover:brightness-110 transition-all">
          <Activity size={16} />
          Life Score
        </button>
      </ModuleHeader>

      {/* ② HERO SCORE BANNER */}
      <div className="flex items-center gap-7 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] px-8 py-6 mb-7 relative overflow-hidden sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-b bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#3b82f6]" />

        {/* Score */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-[DM_Mono] font-medium text-[52px] leading-none text-sl-grad">
            {realScore > 0 ? Math.round(realScore) : '—'}
          </span>
          <span className="text-[14px] text-[var(--sl-t3)] font-medium">pontos</span>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-[var(--sl-border)] shrink-0" />

        {/* Label + delta */}
        <div className="flex flex-col gap-1">
          <span className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">Life Sync Score</span>
          <span className="text-[12px] text-[var(--sl-t3)]">
            Acompanhe sua evolucao semanal
          </span>
        </div>

        {/* Sparkline + Pill (right) */}
        <div className="ml-auto flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)]">Evolucao 4 sem</div>
            <div className="text-[11px] text-[var(--sl-t2)] mt-0.5">
              {realScore > 0 ? <span className="text-[#6366f1] font-semibold">{Math.round(realScore)}</span> : <span className="text-[var(--sl-t3)]">—</span>}
            </div>
          </div>
          <SparkBars values={realScore > 0 ? [0, 0, 0, 0, Math.round(realScore)] : [0, 0, 0, 0, 0]} />
        </div>

        {realScore > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[rgba(16,185,129,.1)] text-[#10b981] shrink-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Acompanhando
        </span>
        )}
      </div>

      {/* ③ MODULE MOSAIC */}
      <div className="mb-7 sl-fade-up" style={{ animationDelay: '.1s' }}>
        <ModuleMosaic modules={mosaicModules} />
      </div>

      {/* ④ CONTENT GRID */}
      <div className="grid grid-cols-[1fr_380px] gap-4 mb-7 max-lg:grid-cols-1 sl-fade-up" style={{ animationDelay: '.15s' }}>
        {/* LEFT */}
        <div className="flex flex-col gap-3.5">
          {/* Financial Strip */}
          <div className="flex bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex-1 px-5 py-4 border-r border-[var(--sl-border)]">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] mb-1">Saldo do Mês</div>
              <div className="font-[DM_Mono] font-medium text-[18px]" style={{ color: balance >= 0 ? '#10b981' : '#f43f5e' }}>{fmt(balance)}</div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {balance > 0 && <><svg width="10" height="10" viewBox="0 0 24 24" fill="#10b981" stroke="none" className="inline align-[-1px] mr-0.5"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg></>}
                vs anterior
              </div>
            </div>
            <div className="flex-1 px-5 py-4 border-r border-[var(--sl-border)]">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] mb-1">Receitas</div>
              <div className="font-[DM_Mono] font-medium text-[18px] text-[var(--sl-t1)]">{fmt(totalIncome)}</div>
              <div className="text-[10px] text-[#10b981] mt-0.5">+12%</div>
            </div>
            <div className="flex-1 px-5 py-4 border-r border-[var(--sl-border)]">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] mb-1">Despesas</div>
              <div className="font-[DM_Mono] font-medium text-[18px] text-[#f43f5e]">{fmt(totalExpense)}</div>
              <div className="text-[10px] text-[#10b981] mt-0.5">{totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% da receita` : '—'}</div>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] mb-1">Poupança</div>
              <div className="font-[DM_Mono] font-medium text-[18px] text-[#6366f1]">{savingsRate}%</div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">Meta: 30%</div>
            </div>
          </div>

          {/* Budgets */}
          <BudgetsWidget budgets={budgets} loading={loadingBudgets} />

          {/* AI Widget */}
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

        {/* RIGHT — 380px sidebar */}
        <div className="flex flex-col gap-4">
          {/* Goals */}
          <GoalsWidget topGoals={topGoals} loading={loadingGoals} />

          {/* Agenda Semanal */}
          <WeekAgendaWidget weekDays={weekDays} events={events} now={now} />

          {/* Destaques */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-4 flex items-center gap-[9px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Destaques
            </div>
            <div className="flex flex-col gap-2">
              <HighlightRow
                icon={Activity}
                iconBg="rgba(249,115,22,.1)"
                iconColor="#f97316"
                label="Corpo"
                sub={`${weekActivityCount} atividades · ${weekActivityMinutes}min`}
                delta={weekActivityCount > 0 ? `${weekActivityCount}x` : '—'}
                deltaColor="#10b981"
              />
              <HighlightRow
                icon={TrendingUp}
                iconBg="rgba(59,130,246,.1)"
                iconColor="#3b82f6"
                label="Patrimônio"
                sub={fmt(totalPatrimonio)}
                delta={`${patrimonioGainPct >= 0 ? '+' : ''}${patrimonioGainPct}%`}
                deltaColor="#10b981"
              />
              <HighlightRow
                icon={Plane}
                iconBg="rgba(236,72,153,.1)"
                iconColor="#ec4899"
                label={nextTrip?.name ?? 'Próxima viagem'}
                sub={nextTrip ? (nextTrip.destinations?.[0] ?? 'Destino') : 'Nenhuma planejada'}
                delta={daysUntilNextTrip != null ? `${daysUntilNextTrip}d` : '—'}
                deltaColor="#ec4899"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ⑤ WIDGET STRIP */}
      <div className="flex gap-3 overflow-x-auto pb-2 sl-fade-up" style={{ animationDelay: '.2s' }}>
        <div className="min-w-[240px] flex-1">
          <RecurrencesWidget nextRecurrences={nextRecurrences} />
        </div>
        <div className="min-w-[240px] flex-1">
          <ProjectionWidget
            sparklineData={sparklineData}
            balance={balance}
            projectedBalance={projectedBalance}
            nextRecurrence={nextRecurrences[0]}
          />
        </div>
        <div className="min-w-[240px] flex-1">
          <AchievementsWidget />
        </div>
      </div>

    </div>
    </>
  )
}
