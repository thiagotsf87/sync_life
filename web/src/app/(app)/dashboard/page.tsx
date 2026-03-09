'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { useTransactions } from '@/hooks/use-transactions'
import { useBudgets } from '@/hooks/use-budgets'
import { useMetas, calcProgress } from '@/hooks/use-metas'
import { useAgenda, getWeekRange, EVENT_TYPES } from '@/hooks/use-agenda'
import { useLifeMap } from '@/hooks/use-life-map'
import { LifeMapRadar } from '@/components/futuro/LifeMapRadar'
import { useRecorrentes } from '@/hooks/use-recorrentes'
import { useCorpoDashboard } from '@/hooks/use-corpo'
import { usePatrimonioDashboard } from '@/hooks/use-patrimonio'
import { useExperienciasDashboard } from '@/hooks/use-experiencias'
import { DashboardMobile } from '@/components/dashboard/DashboardMobile'
import { cn } from '@/lib/utils'
import { useScoreEngine } from '@/hooks/use-score-engine'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtShort(val: number) {
  if (Math.abs(val) >= 1000) return `R$ ${(val / 1000).toFixed(1).replace('.', ',')}k`
  return fmt(val)
}

function getBudgetColor(pct: number): string {
  if (pct > 85) return '#f43f5e'
  if (pct > 70) return '#f59e0b'
  return '#10b981'
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent: string
  icon: string
  iconBg: string
  barPct?: number
  barBg?: string
  delay?: string
}

function KpiCard({ label, value, delta, deltaType = 'neutral', accent, icon, iconBg, barPct, barBg, delay }: KpiCardProps) {
  const [barWidth, setBarWidth] = useState(0)
  useEffect(() => {
    if (barPct === undefined) return
    const t = setTimeout(() => setBarWidth(Math.min(barPct, 100)), 250)
    return () => clearTimeout(t)
  }, [barPct])

  const deltaColor = {
    up:      'text-[#10b981]',
    down:    'text-[#f43f5e]',
    warn:    'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className={cn(
      'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden',
      'transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-px sl-fade-up shadow-sm dark:shadow-none',
      delay
    )}>
      <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b" style={{ background: accent }} />
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-3.5 text-base" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1.5">{label}</p>
      <p className="font-[DM_Mono] font-medium text-[26px] text-[var(--sl-t1)] leading-none mb-1.5">{value}</p>
      {delta && <p className={cn('text-[12px] flex items-center gap-1', deltaColor)}>{delta}</p>}
      {barPct !== undefined && (
        <div className="mt-2.5 h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${barWidth}%`, background: barBg ?? accent }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [greeting, setGreeting] = useState('')
  const [scoreBarWidth, setScoreBarWidth] = useState(0)
  const [userName, setUserName] = useState('Usuário')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

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

  useEffect(() => {
    const t = setTimeout(() => setScoreBarWidth(realScore || 74), 450)
    return () => clearTimeout(t)
  }, [realScore])

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
    // Parsear weekStart como data local (evita shift de timezone do new Date("YYYY-MM-DD"))
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

  const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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

  // ── AI Q&A handler ──
  const handleAiAsk = useCallback(async () => {
    const q = aiQuery.trim()
    if (!q || aiLoading) return

    setAiLoading(true)
    setAiResponse('')

    const financialContext = {
      mes: monthLabel,
      receitas: totalIncome,
      despesas: totalExpense,
      saldo: balance,
      taxaPoupanca: savingsRate,
      orcamentos: budgets.map(b => ({
        categoria: b.category?.name ?? 'Outro',
        limite: b.amount,
        gasto: b.gasto,
        pct: b.pct,
      })),
      topCategorias: categorySpend.slice(0, 5).map(c => ({ nome: c.name, valor: c.total })),
      metasAtivas: activeGoals.length,
      metasEmRisco: goalsAtRisk,
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
  }, [aiQuery, aiLoading, monthLabel, totalIncome, totalExpense, balance, savingsRate, budgets, categorySpend, activeGoals, goalsAtRisk])

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
    {/* ═══ MOBILE LAYOUT ═══ */}
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

    {/* ═══ DESKTOP LAYOUT ═══ */}
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

      {/* ② LIFE SYNC SCORE — Jornada only */}
      <div className="flex items-center gap-7 p-[24px_28px] rounded-[20px] mb-5 sl-fade-up relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,85,255,0.10))', border: '1px solid rgba(99,102,241,0.20)' }}>
        <div className="absolute -left-14 -top-14 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)' }} />

        <div className="flex-shrink-0 relative z-10">
          <div className="font-[Syne] font-extrabold text-[80px] leading-none text-sl-grad">
            {realScore > 0 ? Math.round(realScore) : '—'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mt-0.5">Life Sync Score</div>
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <p className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1">
            {scoreResult?.label ?? (realScore >= 75 ? 'Excelente equilíbrio!' : realScore >= 50 ? 'Evolução consistente' : realScore > 0 ? 'Há espaço para crescer' : 'Registre dados para calcular')}
          </p>
          <p className="text-[13px] text-[var(--sl-t3)] italic mb-3">
            {lifeDimensions.length > 0
              ? (() => {
                  const weakest = [...lifeDimensions].sort((a, b) => a.value - b.value)[0]
                  const strongest = [...lifeDimensions].sort((a, b) => b.value - a.value)[0]
                  return `${strongest?.icon} ${strongest?.fullLabel} em alta. Fortaleça ${weakest?.icon} ${weakest?.fullLabel} para subir o score.`
                })()
              : 'Use os módulos diariamente para calcular seu score real.'}
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-[width] duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${scoreBarWidth}%`, background: 'linear-gradient(90deg, #6366f1, #0055ff)' }} />
          </div>
          <div className="grid grid-cols-4 gap-x-5 gap-y-2">
            {lifeLoading
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="h-2.5 w-16 rounded bg-[var(--sl-s3)] animate-pulse" />
                    <div className="h-4 w-8 rounded bg-[var(--sl-s3)] animate-pulse mt-0.5" />
                  </div>
                ))
              : lifeDimensions.map(d => {
                  const c = d.value >= 75 ? '#10b981' : d.value >= 50 ? '#f59e0b' : '#f43f5e'
                  return (
                    <div key={d.key} className="flex flex-col gap-0.5">
                      <div className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)]">{d.icon} {d.label}</div>
                      <div className="font-[DM_Mono] text-[16px] font-medium" style={{ color: c }}>{d.value}</div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-2 items-end relative z-10">
          <button className="px-4 py-2 rounded-[10px] text-[12px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-85 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)', border: 'none' }}>
            Ver análise completa
          </button>
          <span className="text-[11px]" style={{ color: '#6366f1' }}>↑ +3 vs. semana passada</span>
        </div>
      </div>

      {/* ③ KPI CARDS */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Receitas" value={fmt(totalIncome)}
          delta="↑ receitas do mês" deltaType="up"
          accent="#10b981" icon="💰" iconBg="rgba(16,185,129,0.12)" delay="sl-delay-1" />
        <KpiCard label="Despesas" value={fmt(totalExpense)}
          delta={totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}% da receita` : '—'} deltaType="down"
          accent="#f43f5e" icon="📤" iconBg="rgba(244,63,94,0.12)"
          barPct={totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0} barBg="#f43f5e"
          delay="sl-delay-2" />
        <KpiCard label="Saldo do Mês" value={fmt(balance)}
          delta={balance >= 0 ? '↑ saldo positivo' : '↓ saldo negativo'} deltaType={balance >= 0 ? 'up' : 'down'}
          accent="#10b981" icon="💚" iconBg="rgba(16,185,129,0.12)" delay="sl-delay-3" />
        <KpiCard label="Metas Ativas" value={String(activeGoals.length)}
          delta={goalsAtRisk > 0 ? `⚠ ${goalsAtRisk} em risco` : '✓ todas no ritmo'} deltaType={goalsAtRisk > 0 ? 'warn' : 'up'}
          accent="#f59e0b" icon="🎯" iconBg="rgba(245,158,11,0.12)"
          barPct={activeGoals.length > 0 ? Math.round(((activeGoals.length - goalsAtRisk) / activeGoals.length) * 100) : 0}
          barBg="linear-gradient(90deg, #10b981, #0055ff)" delay="sl-delay-4" />
      </div>

      {/* ④ INSIGHT CARD */}
      {/* Narrative + ask AI */}
      <div className="rounded-[16px] p-5 mb-5 sl-fade-up sl-delay-2"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,85,255,0.06))', border: '1px solid rgba(16,185,129,0.18)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.09em]" style={{ color: '#10b981' }}>💡 Consultor Financeiro IA</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[6px]" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            ANÁLISE DE {now.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}/{String(year).slice(-2)}
          </span>
        </div>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.75]">
          {budgetsOver === 0
            ? <>Todos os seus orçamentos estão dentro do planejado — ótima disciplina! Seu saldo está
              projetado para <span style={{ color: '#10b981' }}><strong>{fmt(projectedBalance)} ao final do mês</strong></span>.
              {goalsAtRisk > 0 && <> Atenção: <span style={{ color: '#f59e0b' }}><strong>{goalsAtRisk} meta(s) abaixo do ritmo</strong></span>.</>}
            </>
            : <>Em {now.toLocaleDateString('pt-BR', { month: 'long' })} você tem <span style={{ color: '#f59e0b' }}>
              <strong>{budgetsOver} orçamento(s) estourado(s)</strong></span>.
              Saldo atual: <span style={{ color: '#10b981' }}><strong>{fmt(balance)}</strong></span>.
              {topExpenseCat && <> Maior gasto: <strong>{topExpenseCat.name}</strong> com {topExpensePct}% da renda.</>}
            </>
          }
        </p>
        <div className="flex items-center gap-2 mt-3.5 pt-3.5" style={{ borderTop: '1px solid rgba(16,185,129,0.12)' }}>
          <input
            className="flex-1 px-3 py-2 rounded-[10px] text-[13px] outline-none transition-colors"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', color: 'var(--sl-t1)' }}
            placeholder="Pergunte algo... ex: Como reduzir gastos em Lazer?"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiAsk() }}
          />
          <button
            className="px-3.5 py-2 rounded-[10px] text-[12px] font-semibold text-white cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap disabled:opacity-50"
            style={{ background: '#10b981', border: 'none' }}
            onClick={handleAiAsk}
            disabled={aiLoading || !aiQuery.trim()}
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : 'Perguntar'}
          </button>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-3 px-4 py-3 rounded-[12px]" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(16,185,129,.12)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#10b981]">Resposta da IA</span>
              {aiLoading && <Loader2 size={10} className="animate-spin text-[#10b981]" />}
            </div>
            <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* ⑤ MAIN GRID */}
      <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">

        {/* LEFT */}
        <div className="flex flex-col gap-4">

          {/* Orçamentos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
            <div className="flex items-center justify-between mb-[18px]">
              <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">💼 Orçamentos do Mês</span>
              <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
                onClick={() => router.push('/financas/orcamentos')}>Ver todos →</button>
            </div>
            {loadingBudgets
              ? <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
              : budgets.length === 0
                ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhum orçamento configurado</p>
                : (
                  <div className="flex flex-col gap-2.5">
                    {budgets.slice(0, 5).map(b => {
                      const color = getBudgetColor(b.pct)
                      return (
                        <div key={b.id} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] text-[var(--sl-t2)]">{b.category?.icon} {b.category?.name ?? 'Categoria'}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t3)]">
                                <span className="text-[var(--sl-t2)]">{fmt(b.gasto)}</span> / {fmt(b.amount)}
                              </span>
                              <span className="text-[11px] font-semibold" style={{ color }}>{b.pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)]">
                            <div className="h-full rounded-full transition-[width] duration-700"
                              style={{ width: `${Math.min(b.pct, 100)}%`, background: color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
            }
          </div>

          {/* Gastos por Categoria */}
          <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-3 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
            <div className="flex items-center justify-between mb-[18px]">
              <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📊 Gastos por Categoria</span>
              <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
                onClick={() => router.push('/financas/relatorios')}>Relatório →</button>
            </div>
            {loadingTxns || categorySpend.length === 0
              ? <div className="h-[160px] flex items-center justify-center text-[13px] text-[var(--sl-t3)]">
                  {loadingTxns ? 'Carregando...' : 'Sem transações este mês'}
                </div>
              : (
                <div className="flex flex-col">
                  <div className="flex items-end gap-1.5 h-[160px]">
                    {categorySpend.map((cat, i) => {
                      const heightPct = (cat.total / maxCatSpend) * 100
                      const pct = totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                          <span className="font-[DM_Mono] text-[9px] font-semibold mb-0.5 text-[var(--sl-t2)]">{pct}%</span>
                          <div className="w-full rounded-t-[4px] min-h-[4px] transition-[height] duration-[900ms]"
                            style={{ height: `${heightPct}%`, background: cat.color, opacity: 0.8 }} />
                        </div>
                      )
                    })}
                  </div>
                  <div className="h-px bg-[var(--sl-border)] mt-1.5" />
                  <div className="flex gap-1.5 mt-1.5">
                    {categorySpend.map((cat, i) => (
                      <div key={i} className="flex-1 text-[9px] text-[var(--sl-t3)] text-center truncate">{cat.name.slice(0, 6)}</div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">

          {/* Metas em Destaque */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
            <div className="flex items-center justify-between mb-[18px]">
              <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🎯 Metas em Destaque</span>
              <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
                onClick={() => router.push('/futuro')}>Ver todas →</button>
            </div>
            {loadingGoals
              ? <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
              : topGoals.length === 0
                ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhuma meta ativa</p>
                : (
                  <div className="flex flex-col gap-3.5">
                    {topGoals.map(goal => {
                      const pct = calcProgress(goal.current_amount, goal.target_amount)
                      const isDelayed = pct < 40
                      const pctColor = pct >= 50 ? '#10b981' : '#f59e0b'
                      const dateLabel = goal.target_date
                        ? new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                        : null
                      return (
                        <div key={goal.id} className="flex flex-col gap-1.5 cursor-pointer" onClick={() => router.push(`/futuro/${goal.id}`)}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[20px] flex-shrink-0">{goal.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{goal.name}</div>
                              <div className="text-[11px] text-[var(--sl-t3)]">
                                {goal.goal_type === 'monetary'
                                  ? `${fmt(goal.current_amount)} de ${fmt(goal.target_amount)}${dateLabel ? ` · ${dateLabel}` : ''}`
                                  : `${pct}% concluído${dateLabel ? ` · ${dateLabel}` : ''}`}
                              </div>
                            </div>
                            <span className="font-[DM_Mono] text-[14px] font-medium flex-shrink-0" style={{ color: pctColor }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />
                          </div>
                          {isDelayed && (
                            <div className="text-[11px] px-2 py-1.5 rounded-[6px]"
                              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                              ⚠ Meta abaixo do ritmo necessário
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
            }
          </div>

          {/* Agenda da Semana */}
          <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-3 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
            <div className="flex items-center justify-between mb-[14px]">
              <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📅 Agenda da Semana</span>
              <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
                onClick={() => router.push('/tempo')}>Ver agenda →</button>
            </div>
            {/* week strip */}
            <div className="flex gap-1 mb-3.5">
              {weekDays.map((wd, i) => (
                <div key={i}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 px-0.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--sl-s2)]',
                    wd.isToday && 'bg-[rgba(16,185,129,0.15)]'
                  )}>
                  <span className="text-[9px] uppercase tracking-[0.05em] text-[var(--sl-t3)]">{DAY_NAMES[i]}</span>
                  <span className={cn(
                    'font-[Syne] font-bold text-[13px] w-6 h-6 rounded-full flex items-center justify-center',
                    wd.isToday ? 'bg-[#10b981] text-white' : 'text-[var(--sl-t1)]'
                  )}>{wd.date.getDate()}</span>
                  <div className="flex gap-0.5">
                    {wd.events.slice(0, 2).map((ev, j) => (
                      <div key={j} className="w-1 h-1 rounded-full" style={{ background: EVENT_TYPES[ev.type]?.color ?? '#6e90b8' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* events */}
            <div className="flex flex-col">
              {events.length === 0
                ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-4">Nenhum evento esta semana</p>
                : events.slice(0, 4).map((ev, i) => {
                    const typeInfo = EVENT_TYPES[ev.type]
                    const evDate = new Date(ev.date + 'T12:00:00')
                    const isToday = evDate.toDateString() === now.toDateString()
                    const dayLabel = isToday ? 'Hoje' : DAY_NAMES[(evDate.getDay() + 6) % 7]
                    return (
                      <div key={ev.id}
                        className={cn(
                          'flex items-center gap-3 py-2.5 cursor-pointer transition-colors rounded-lg hover:bg-[var(--sl-s2)]',
                          i < Math.min(events.length, 4) - 1 && 'border-b border-[var(--sl-border)]'
                        )}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeInfo?.color ?? '#6e90b8' }} />
                        <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-8 flex-shrink-0">{dayLabel}</span>
                        <span className={cn('text-[13px] flex-1 truncate', isToday ? 'text-[var(--sl-t1)] font-medium' : 'text-[var(--sl-t2)]')}>
                          {ev.title}{ev.start_time ? ` — ${ev.start_time.slice(0, 5)}` : ''}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[6px] flex-shrink-0"
                          style={{ background: `${typeInfo?.color ?? '#6e90b8'}1a`, color: typeInfo?.color ?? '#6e90b8' }}>
                          {typeInfo?.label ?? ev.type}
                        </span>
                      </div>
                    )
                  })
              }
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ BOTTOM GRID */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">

        {/* Próximas Recorrentes */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-[18px]">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🔄 Próximas Recorrentes</span>
            <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
              onClick={() => router.push('/financas/recorrentes')}>Ver todas →</button>
          </div>
          {nextRecurrences.length === 0
            ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-4">Nenhuma recorrente</p>
            : (
              <div className="flex flex-col">
                {nextRecurrences.map((r, i) => {
                  const isUrgent = r.daysLeft <= 5
                  const statusColor = isUrgent ? '#f59e0b' : 'var(--sl-t3)'
                  const statusBg = isUrgent ? 'rgba(245,158,11,0.12)' : 'rgba(110,144,184,0.10)'
                  const statusLabel = r.daysLeft === 0 ? 'hoje' : `${r.daysLeft}d`
                  return (
                    <div key={r.id} className={cn('flex items-center justify-between py-2.5', i < nextRecurrences.length - 1 && 'border-b border-[var(--sl-border)]')}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] bg-[var(--sl-s3)] flex items-center justify-center text-[14px] flex-shrink-0">
                          {r.icon}
                        </div>
                        <div>
                          <div className="text-[13px] text-[var(--sl-t2)]">{r.name}</div>
                          <div className="text-[11px] text-[var(--sl-t3)]">
                            vence {r.daysLeft === 0 ? 'hoje' : `em ${r.daysLeft} ${r.daysLeft === 1 ? 'dia' : 'dias'}`}, {r.day}/{r.monthShort}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-[DM_Mono] text-[13px]" style={{ color: r.type === 'expense' ? '#f43f5e' : '#10b981' }}>
                          {r.type === 'expense' ? '-' : '+'}{fmt(r.amount)}
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] mt-0.5 inline-block"
                          style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* Projeção de Saldo */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-1 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📈 Projeção de Saldo</span>
            <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
              onClick={() => router.push('/financas/planejamento')}>Planejamento →</button>
          </div>
          <p className="text-[11px] text-[var(--sl-t3)] mb-3">Próximos 30 dias</p>
          <div className="h-[60px] mx-[-4px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="saldo" stroke="#10b981" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2.5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">Hoje</div>
              <div className="font-[DM_Mono] text-[15px] text-[var(--sl-t2)]">{fmtShort(balance > 0 ? balance : 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">30 dias</div>
              <div className="font-[DM_Mono] text-[15px]" style={{ color: '#10b981' }}>{fmtShort(projectedBalance)}</div>
            </div>
          </div>
          {nextRecurrences[0] && nextRecurrences[0].daysLeft <= 7 && (
            <div className="mt-2.5 p-2 rounded-[8px] text-[12px] text-[var(--sl-t3)] bg-[var(--sl-s2)]">
              ⚠ {nextRecurrences[0].name} {fmt(nextRecurrences[0].amount)} vence {nextRecurrences[0].daysLeft === 0 ? 'hoje' : `em ${nextRecurrences[0].daysLeft} ${nextRecurrences[0].daysLeft === 1 ? 'dia' : 'dias'}`}
            </div>
          )}
        </div>

        {/* Conquistas Recentes */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-[18px]">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏆 Conquistas Recentes</span>
            <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
              onClick={() => router.push('/conquistas')}>Ver todas →</button>
          </div>
          <div className="flex gap-2.5 flex-wrap mb-4">
            {[
              { emoji: '🔥', name: '7 dias seguidos', locked: false },
              { emoji: '💚', name: 'Mês no verde', locked: false },
              { emoji: '📊', name: 'Planejador', locked: false },
              { emoji: '🏅', name: 'Meta concluída', locked: true },
              { emoji: '💎', name: '3 meses top', locked: true },
            ].map((b, i) => (
              <div key={i}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2.5 rounded-[12px] min-w-[64px]',
                  'border border-[var(--sl-border)] bg-[var(--sl-s2)] cursor-pointer',
                  'transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-0.5',
                  b.locked && 'opacity-35 grayscale'
                )}>
                <span className="text-[22px]">{b.emoji}</span>
                <span className="text-[9px] text-[var(--sl-t3)] text-center font-medium">{b.name}</span>
              </div>
            ))}
          </div>
          <div className="p-2.5 rounded-[10px]" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="text-[11px] font-semibold mb-1" style={{ color: '#10b981' }}>Próxima conquista</div>
            <div className="text-[12px] text-[var(--sl-t2)]">
              🎯 Meta concluída — conclua a <strong>Reserva de Emergência</strong> para desbloquear
            </div>
            <div className="mt-2 h-1 rounded-full overflow-hidden bg-[var(--sl-s3)]">
              <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />
            </div>
          </div>
        </div>

      </div>

      {/* ⑦ V3 MODULES ROW */}
      <div className="grid grid-cols-3 gap-4 mt-4 max-lg:grid-cols-1">

        {/* Corpo */}
        <div
          className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
          onClick={() => router.push('/corpo')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏥 Corpo</span>
            <div className="h-0.5 w-6 rounded-full" style={{ background: '#f97316' }} />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--sl-t2)]">Atividades esta semana</span>
              <span className="font-[DM_Mono] text-[14px] font-medium" style={{ color: weekActivityCount >= 3 ? '#10b981' : '#f59e0b' }}>
                {weekActivityCount} sessões
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--sl-t2)]">Minutos ativos</span>
              <span className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">
                {weekActivityMinutes} min
              </span>
            </div>
            {nextAppointment ? (
              <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                <span className="text-[12px] text-[var(--sl-t2)] truncate max-w-[60%]">
                  📅 {nextAppointment.specialty}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                  style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                  {new Date(nextAppointment.appointment_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ) : (
              <div className="pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                <span className="text-[11px] text-[var(--sl-t3)]">Nenhuma consulta agendada</span>
              </div>
            )}
          </div>
        </div>

        {/* Patrimônio */}
        <div
          className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-1 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
          onClick={() => router.push('/patrimonio')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📈 Patrimônio</span>
            <div className="h-0.5 w-6 rounded-full" style={{ background: '#10b981' }} />
          </div>
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Carteira total</p>
              <p className="font-[DM_Mono] font-medium text-[22px] text-[var(--sl-t1)] leading-none">
                {totalPatrimonio > 0
                  ? totalPatrimonio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : '—'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
              <span className="text-[12px] text-[var(--sl-t2)]">Rentabilidade</span>
              <span className="font-[DM_Mono] text-[14px] font-medium"
                style={{ color: patrimonioGainPct >= 0 ? '#10b981' : '#f43f5e' }}>
                {patrimonioGainPct >= 0 ? '+' : ''}{patrimonioGainPct}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--sl-t2)]">Ativos</span>
              <span className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">
                {patrimonioAssets.length}
              </span>
            </div>
          </div>
        </div>

        {/* Experiências */}
        <div
          className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
          onClick={() => router.push('/experiencias')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✈️ Experiências</span>
            <div className="h-0.5 w-6 rounded-full" style={{ background: '#06b6d4' }} />
          </div>
          <div className="flex flex-col gap-2.5">
            {nextTrip ? (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Próxima viagem</p>
                  <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] truncate">{nextTrip.name}</p>
                  <p className="text-[11px] text-[var(--sl-t3)]">{nextTrip.destinations[0]}</p>
                </div>
                <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                  <span className="text-[12px] text-[var(--sl-t2)]">
                    {new Date(nextTrip.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </span>
                  {daysUntilNextTrip != null && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                      style={{ background: 'rgba(6,182,212,0.10)', color: '#06b6d4' }}>
                      {daysUntilNextTrip === 0 ? 'Hoje!' : `em ${daysUntilNextTrip}d`}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Viagens</p>
                  <p className="font-[DM_Mono] font-medium text-[22px] text-[var(--sl-t1)]">{experienciaTrips.length}</p>
                </div>
                <div className="pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                  <span className="text-[11px] text-[var(--sl-t3)]">Nenhuma viagem planejada</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ⑧ Mapa da Vida — Jornada only (RN-FUT-30) */}
      <div className="mt-4">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up
                        hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🗺️ Mapa da Vida</h3>
              <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Equilíbrio entre todas as dimensões da sua vida</p>
            </div>
            <button
              onClick={() => router.push('/futuro')}
              className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
            >
              Ver detalhes →
            </button>
          </div>
          <LifeMapRadar
            dimensions={lifeDimensions}
            overallScore={realScore}
            loading={lifeLoading}
            compact
          />
        </div>
      </div>

    </div>
    </>
  )
}
