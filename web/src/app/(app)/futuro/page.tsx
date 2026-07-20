'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Target, ChevronRight, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useObjectives, useCreateObjective, useUpdateObjective, useAddGoal, calcObjectiveProgress, calcProgressVelocity, isProgressAtRisk, type ObjectiveCategory, type GoalModule, type GoalIndicatorType, type Objective } from '@/hooks/use-futuro'
import { useUserPlan } from '@/hooks/use-user-plan'
import { useLifeMap } from '@/hooks/use-life-map'
import { checkPlanLimit } from '@/lib/plan-limits'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { LifeMapRadar } from '@/components/futuro/LifeMapRadar'
import { FuturoMobile } from '@/components/futuro/FuturoMobile'
import { FuturoWizardMobile } from '@/components/futuro/mobile/FuturoWizardMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { KpiCard } from '@/components/ui/kpi-card'
import { fmtBRL } from '@/lib/format/currency'

// Cor do módulo Futuro (identificação · NÃO accent)
const MOD_FUTURO = '#8B7BD4'
const MOD_FUTURO_SOFT = 'rgba(139,123,212,0.10)'

// ─── Filter / Sort types ───────────────────────────────────────────────────────

type StatusFilter = 'all' | 'on_track' | 'attention' | 'at_risk' | 'completed'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'on_track', label: 'No ritmo' },
  { value: 'attention', label: 'Atenção' },
  { value: 'at_risk', label: 'Em risco' },
  { value: 'completed', label: 'Concluídos' },
]

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const MAX_VISIBLE = 10  // RN-FUT-05

// ─── Status helpers ──────────────────────────────────────────────────────────

function getObjectiveHealthStatus(obj: Objective): 'on_track' | 'attention' | 'at_risk' | 'completed' {
  if (obj.status === 'completed') return 'completed'
  const goals = obj.goals ?? []
  const progress = calcObjectiveProgress(goals)
  const velocity = calcProgressVelocity(obj.milestones ?? [], obj.created_at, progress)
  const atRisk = isProgressAtRisk(velocity, progress, obj.target_date)

  if (atRisk) return 'at_risk'
  if (progress < 40 && obj.target_date) {
    const daysLeft = (new Date(obj.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysLeft < 90 && progress < 30) return 'attention'
  }
  if (progress >= 0 && progress < 30 && obj.target_date) {
    const totalDays = (new Date(obj.target_date).getTime() - new Date(obj.created_at).getTime()) / (1000 * 60 * 60 * 24)
    const elapsed = (Date.now() - new Date(obj.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (totalDays > 0 && elapsed / totalDays > 0.5 && progress < 35) return 'attention'
  }
  return 'on_track'
}

function getStatusPill(status: 'on_track' | 'attention' | 'at_risk' | 'completed'): { label: string; bg: string; color: string } {
  switch (status) {
    case 'on_track': return { label: 'No ritmo', bg: 'rgba(31,166,122,0.10)', color: 'var(--sl-success)' }
    case 'attention': return { label: 'Atenção', bg: 'rgba(217,150,46,0.10)', color: 'var(--sl-warning)' }
    case 'at_risk': return { label: 'Em risco', bg: 'rgba(219,100,120,0.10)', color: 'var(--sl-danger)' }
    case 'completed': return { label: 'Concluído', bg: 'rgba(15,118,110,0.10)', color: 'var(--sl-em)' }
  }
}

function getProgressColor(progress: number, status: string): string {
  if (status === 'completed') return 'var(--sl-em)'
  if (progress > 85) return 'var(--sl-danger)'
  if (progress > 70) return 'var(--sl-warning)'
  return 'var(--sl-success)'
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return 'Contínuo'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

function getSubtitle(firstGoal: { current_value: number; target_value: number | null; indicator_type: string } | undefined, obj: Objective): string {
  if (!firstGoal) return ''
  const parts: string[] = []

  if (firstGoal.indicator_type === 'monetary' && firstGoal.target_value) {
    parts.push(`${fmtBRL(firstGoal.current_value)} / ${fmtBRL(firstGoal.target_value)}`)
  } else if (firstGoal.target_value) {
    parts.push(`${firstGoal.current_value} / ${firstGoal.target_value}`)
  }

  if (obj.target_date) {
    parts.push(`Prazo: ${new Date(obj.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`)
  }

  return parts.join(' · ')
}

// ─── Horizon Ring SVG (mantém --sl-grad exceção G-03 permitida em meta) ─────

function HorizonRing({ progress }: { progress: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-[96px] h-[96px] shrink-0">
      <svg viewBox="0 0 96 96" className="w-[96px] h-[96px]">
        <defs>
          <linearGradient id="hz-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0B2D34" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--sl-s3)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke="url(#hz-ring-grad)" strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="sl-num-strong text-[28px] leading-none text-[var(--sl-t1)]">{progress}%</span>
        <span className="text-[10px] text-[var(--sl-t3)] mt-0.5">Geral</span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FuturoPage() {
  const router = useRouter()

  const { objectives, active, completed, avgProgress, loading, error, reload } = useObjectives()
  const createObjective = useCreateObjective()
  const updateObjective = useUpdateObjective()
  const addGoal = useAddGoal()

  const { isPro } = useUserPlan()
  const { dimensions: lifeDimensions, overallScore: lifeScore, loading: lifeLoading } = useLifeMap()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  // ─── Compute health status for all objectives ──────────────────────────────
  const objectivesWithHealth = useMemo(() => {
    return objectives.map(obj => ({
      ...obj,
      healthStatus: getObjectiveHealthStatus(obj),
      computedProgress: calcObjectiveProgress(obj.goals ?? []),
    }))
  }, [objectives])

  // ─── Stats for Horizon card ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const onTrack = objectivesWithHealth.filter(o => o.healthStatus === 'on_track').length
    const attention = objectivesWithHealth.filter(o => o.healthStatus === 'attention').length
    const atRisk = objectivesWithHealth.filter(o => o.healthStatus === 'at_risk').length
    const completedCount = objectivesWithHealth.filter(o => o.healthStatus === 'completed').length
    return { total: active.length, onTrack, attention, atRisk, completed: completedCount }
  }, [objectivesWithHealth, active.length])

  // ─── Filter objectives (RN-FUT-01, RN-FUT-05) ─────────────────────────────
  const filtered = useMemo(() => {
    const list = objectivesWithHealth.filter(obj => {
      if (statusFilter !== 'all' && obj.healthStatus !== statusFilter) return false
      if (search && !obj.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

    list.sort((a, b) => {
      return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
    })

    return list
  }, [objectivesWithHealth, statusFilter, search])

  // ─── Tab counts ────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: objectivesWithHealth.length,
      on_track: objectivesWithHealth.filter(o => o.healthStatus === 'on_track').length,
      attention: objectivesWithHealth.filter(o => o.healthStatus === 'attention').length,
      at_risk: objectivesWithHealth.filter(o => o.healthStatus === 'at_risk').length,
      completed: objectivesWithHealth.filter(o => o.healthStatus === 'completed').length,
    }
    return counts
  }, [objectivesWithHealth])

  const displayed = showAll ? filtered : filtered.slice(0, MAX_VISIBLE)
  const hasMore = filtered.length > MAX_VISIBLE && !showAll

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateMobile = useCallback(async (data: {
    name: string
    category: string
    targetValue: number
    contribution: number
    goals: Array<{
      name: string
      category: string
      indicator_type: GoalIndicatorType
      target_value: number
      current_value: number
    }>
    icon?: string
    priority?: 'high' | 'medium' | 'low'
  }) => {
    const limitCheck = checkPlanLimit(isPro, 'active_objectives', active.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }

    setIsCreating(true)
    try {
      const obj = await createObjective({
        name: data.name,
        category: data.category as ObjectiveCategory,
        priority: data.priority ?? 'medium',
        icon: data.icon ?? '🎯',
      })
      for (const g of data.goals) {
        await addGoal(obj.id, {
          name: g.name,
          target_module: g.category as GoalModule,
          indicator_type: g.indicator_type,
          target_value: g.target_value || null,
          current_value: g.current_value,
        })
      }
      toast.success(`Objetivo "${data.name}" criado!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar objetivo')
    } finally {
      setIsCreating(false)
    }
  }, [createObjective, addGoal, reload, isPro, active.length])

  // ─── Restaurar objetivo concluído (RN-FUT-04) ────────────────────────────────
  const handleRestore = useCallback(async (id: string) => {
    try {
      await updateObjective(id, { status: 'active' })
      toast.success('Objetivo restaurado!')
      await reload()
    } catch {
      toast.error('Erro ao restaurar objetivo')
    }
  }, [updateObjective, reload])

  // ─── Mobile data ──────────────────────────────────────────────────────────
  const MODULE_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
    financas:     { emoji: '💰', label: 'Finanças',     color: '#0F766E', bg: 'rgba(15,118,110,0.15)' },
    tempo:        { emoji: '⏳', label: 'Tempo',        color: '#3CA0B5', bg: 'rgba(60,160,181,0.15)' },
    futuro:       { emoji: '🔮', label: 'Futuro',       color: MOD_FUTURO, bg: MOD_FUTURO_SOFT },
    corpo:        { emoji: '🏃', label: 'Corpo',        color: '#D97534', bg: 'rgba(217,117,52,0.15)' },
    mente:        { emoji: '🧠', label: 'Mente',        color: '#D9962E', bg: 'rgba(217,150,46,0.15)' },
    patrimonio:   { emoji: '📈', label: 'Patrimônio',   color: '#4F88D4', bg: 'rgba(79,136,212,0.15)' },
    carreira:     { emoji: '💼', label: 'Carreira',     color: '#DB6478', bg: 'rgba(219,100,120,0.15)' },
    experiencias: { emoji: '✈️', label: 'Experiências', color: '#C76795', bg: 'rgba(199,103,149,0.15)' },
  }

  const CATEGORY_BG: Record<string, string> = {
    financial:    'rgba(15,118,110,0.12)',
    professional: 'rgba(217,150,46,0.12)',
    health:       'rgba(217,117,52,0.12)',
    educational:  'rgba(139,123,212,0.12)',
    experience:   'rgba(199,103,149,0.12)',
    personal:     'rgba(79,136,212,0.12)',
    other:        'rgba(111,121,134,0.12)',
  }

  const CATEGORY_DISPLAY: Record<string, string> = {
    financial: 'Financeiro',
    professional: 'Profissional',
    health: 'Saúde',
    educational: 'Educação',
    experience: 'Experiência',
    personal: 'Pessoal',
    other: 'Outros',
  }

  const paused = objectives.filter(o => o.status === 'paused')
  const allMobileObjs = [...active, ...completed, ...paused]

  const mobileGoals = allMobileObjs.map(obj => {
    const linkedModules = (obj.goals ?? [])
      .map(g => g.target_module)
      .filter((m, i, arr) => arr.indexOf(m) === i && MODULE_META[m])
      .map(m => MODULE_META[m])

    const firstGoal = (obj.goals ?? [])[0]

    const isDelayed = obj.target_date
      ? new Date(obj.target_date).getTime() < Date.now() && obj.progress < 100
      : false
    const behindMonths = obj.target_date
      ? Math.max(0, Math.round((Date.now() - new Date(obj.target_date).getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : 0

    const narrativeHint = isDelayed && behindMonths > 0
      ? `<strong>${behindMonths} meses atrasado.</strong> Cada R$ 200 extra recupera um mês.`
      : obj.progress >= 60
        ? `Mais ${Math.ceil((100 - obj.progress) / 15)} contribuições e você realiza esse sonho!`
        : undefined

    const rawLabel = firstGoal?.target_value != null
      ? `${fmtBRL(firstGoal.current_value)} / ${fmtBRL(firstGoal.target_value)}`
      : `${obj.progress}% concluído`

    return {
      id: obj.id,
      name: obj.name,
      icon: obj.icon ?? '🎯',
      iconBg: CATEGORY_BG[obj.category] ?? MOD_FUTURO_SOFT,
      deadline: obj.target_date
        ? `📅 ${new Date(obj.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
        : 'Sem prazo',
      category: CATEGORY_DISPLAY[obj.category] ?? 'Geral',
      modules: linkedModules,
      progressLabel: rawLabel,
      progressPct: obj.progress,
      progressColor: obj.progress >= 60 ? 'var(--sl-success)' : obj.progress >= 40 ? 'var(--sl-warning)' : 'var(--sl-danger)',
      isDelayed,
      narrativeHint,
      status: obj.status as 'active' | 'completed' | 'paused',
    }
  })

  const mobileDelayed = mobileGoals.filter(g => g.isDelayed).length
  const mobileOnTrack = mobileGoals.length - mobileDelayed

  const mobileAlert = (() => {
    const delayed = active.find(o => {
      if (!o.target_date) return false
      return new Date(o.target_date).getTime() < Date.now() && o.progress < 100
    })
    if (delayed) {
      return `Você economizou <strong>R$ 340 a mais</strong> em fevereiro. Direcionando para o apartamento adiantaria <strong>3 semanas</strong>.`
    }
    const behindGoal = active.find(o => o.progress < 30 && o.target_date)
    if (behindGoal) {
      return `O objetivo "${behindGoal.name}" está com apenas <span style="color:#D9962E;">${behindGoal.progress}% de progresso</span>. Ajuste a contribuição mensal.`
    }
    return undefined
  })()

  const CATEGORY_ICON_BG: Record<string, string> = {
    financial:    'rgba(15,118,110,0.10)',
    health:       'rgba(217,117,52,0.10)',
    professional: 'rgba(217,150,46,0.10)',
    educational:  'rgba(139,123,212,0.10)',
    experience:   'rgba(199,103,149,0.10)',
    personal:     'rgba(79,136,212,0.10)',
    other:        'rgba(111,121,134,0.10)',
  }

  return (
    <>
    <FuturoMobile
      avgProgress={avgProgress}
      activeCount={active.length}
      alertText={mobileAlert}
      goals={mobileGoals}
      onNewGoal={() => setWizardOpen(true)}
      onTrackCount={mobileOnTrack}
      delayedCount={mobileDelayed}
    />
    <FuturoWizardMobile
      open={wizardOpen}
      onClose={() => setWizardOpen(false)}
      onSave={handleCreateMobile}
      isLoading={isCreating}
    />
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ── ModuleHeader ── */}
      <ModuleHeader
        icon={Target}
        iconBg={MOD_FUTURO_SOFT}
        iconColor={MOD_FUTURO}
        title="Futuro"
        subtitle={`${active.length} OBJETIVOS ATIVOS · ${stats.onTrack} NO RITMO · PROGRESSO GERAL ${avgProgress}%`}
      >
        {!isPro && (
          <span className="text-[11px] text-[var(--sl-t3)] font-medium">
            {active.length}/3 FREE
          </span>
        )}
        <button
          onClick={() => router.push('/futuro/novo')}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold text-white hover:opacity-90 hover:-translate-y-px transition-all"
          style={{ background: 'var(--sl-em)' }}
        >
          <Plus size={16} />
          Novo objetivo
        </button>
      </ModuleHeader>

      {/* ── Jornada Insight ── */}
      <JornadaInsight
        text={
          active.length > 0
            ? <>Você tem <strong className="text-[var(--sl-t1)]">{active.length} objetivos ativos</strong> com progresso médio de <strong className="text-[var(--sl-em)]">{avgProgress}%</strong>. {avgProgress >= 50 ? 'Você está no caminho certo!' : 'Vamos adicionar mais metas para acelerar.'}</>
            : <>Crie seu primeiro objetivo para começar a mapear o futuro que você quer construir.</>
        }
      />

      {/* ── KPI strip (P3 sumario) ── */}
      <div className="grid grid-cols-4 gap-3 mb-7 max-sm:grid-cols-2 sl-fade-up sl-delay-1">
        <KpiCard
          label="Objetivos ativos"
          value={active.length}
          delta={`${stats.completed} concluídos`}
          accent={MOD_FUTURO}
          icon={Target}
        />
        <KpiCard
          label="No ritmo"
          value={stats.onTrack}
          delta={active.length > 0 ? `${Math.round((stats.onTrack / Math.max(active.length, 1)) * 100)}% do total` : 'Sem ativos'}
          deltaType="up"
          accent="var(--sl-success)"
        />
        <KpiCard
          label="Atenção"
          value={stats.attention}
          delta={stats.attention > 0 ? 'Precisa cuidado' : 'Tudo certo'}
          deltaType={stats.attention > 0 ? 'warn' : 'neutral'}
          accent="var(--sl-warning)"
        />
        <KpiCard
          label="Em risco"
          value={stats.atRisk}
          delta={stats.atRisk > 0 ? 'Ação urgente' : 'Sem riscos'}
          deltaType={stats.atRisk > 0 ? 'down' : 'neutral'}
          accent="var(--sl-danger)"
        />
      </div>

      {/* ── Horizon Roadmap Card (hero único G-05) ── */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 mb-7 overflow-hidden sl-fade-up sl-delay-2
                      hover:border-[var(--sl-border-h)] transition-colors">
        {/* Accent bar — cor do módulo Futuro */}
        <div className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b-sm" style={{ background: MOD_FUTURO }} />

        {/* Head: Ring + Stats */}
        <div className="flex items-center gap-4 mb-6">
          <HorizonRing progress={avgProgress} />

          {/* Stats strip */}
          <div className="flex flex-1">
            {[
              { value: active.length, label: 'Objetivos', color: 'var(--sl-t1)' },
              { value: stats.onTrack, label: 'No ritmo', color: 'var(--sl-success)' },
              { value: stats.attention, label: 'Atenção', color: 'var(--sl-warning)' },
              { value: stats.atRisk, label: 'Em risco', color: 'var(--sl-danger)' },
              { value: stats.completed, label: 'Concluídos', color: 'var(--sl-em)' },
            ].map((s, i, arr) => (
              <div key={s.label} className={cn(
                'flex-1 px-4',
                i < arr.length - 1 && 'border-r border-[var(--sl-border)]'
              )}>
                <div className="sl-num-strong text-[22px] leading-none" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mt-[5px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline lanes (mini gantt) */}
        {active.length > 0 && (
          <div className="mt-2">
            {active.map(obj => {
              const progress = calcObjectiveProgress(obj.goals ?? [])
              const health = getObjectiveHealthStatus(obj)
              const laneColor = health === 'at_risk' ? 'var(--sl-danger)'
                : health === 'attention' ? 'var(--sl-warning)'
                : 'var(--sl-em)'

              return (
                <div key={obj.id} className="flex items-center gap-3 py-[7px] border-b border-[var(--sl-border)] last:border-b-0">
                  <div
                    className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0 text-[13px]"
                    style={{ background: CATEGORY_ICON_BG[obj.category] ?? MOD_FUTURO_SOFT }}
                  >
                    {obj.icon}
                  </div>
                  <div className="text-[12px] font-medium w-[140px] shrink-0 truncate text-[var(--sl-t1)]">
                    {obj.name}
                  </div>
                  {/* Bar — usa --sl-grad (única exceção G-03 permitida em metas) */}
                  <div className="flex-1 h-[6px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full rounded-[3px] transition-[width] duration-800 ease-out"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        background: 'var(--sl-grad)',
                      }}
                    />
                  </div>
                  <div className="sl-num text-[11px] w-[40px] text-right shrink-0" style={{ color: laneColor }}>
                    {progress}%
                  </div>
                  <div className="text-[10px] text-[var(--sl-t3)] w-[80px] text-right shrink-0">
                    {formatDeadline(obj.target_date)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── 2-Column: Objectives list + Radar ── */}
      <div className="grid grid-cols-[1fr_340px] gap-5 sl-fade-up sl-delay-3 max-lg:grid-cols-1">
        {/* Left: Objectives list */}
        <div>
          {/* Search + Filter tabs */}
          <div className="flex items-center gap-3 mb-5 max-md:flex-col max-md:items-stretch">
            <div className="flex gap-0 flex-1 overflow-x-auto">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'px-[14px] py-2 text-[12px] font-semibold border-b-2 transition-all relative whitespace-nowrap',
                    statusFilter === tab.value
                      ? 'border-[var(--sl-em)] text-[var(--sl-t1)]'
                      : 'text-[var(--sl-t3)] border-transparent hover:text-[var(--sl-t2)]'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'text-[9px] ml-1 px-[5px] py-px rounded',
                    statusFilter === tab.value
                      ? 'bg-[var(--sl-em-soft)] text-[var(--sl-em)]'
                      : 'bg-[var(--sl-s3)]'
                  )}>
                    {tabCounts[tab.value]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-[220px] max-md:w-full">
              <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar objetivo..."
                className="w-full py-[9px] pl-[34px] pr-3 bg-[var(--sl-s2)] border border-[var(--sl-border)]
                           rounded-[10px] text-[var(--sl-t1)] text-[12px] outline-none
                           placeholder:text-[var(--sl-t3)] transition-colors
                           focus:border-[var(--sl-border-em)]"
              />
            </div>
          </div>

          {/* Objective rows */}
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[68px] rounded-[14px] bg-[var(--sl-s2)] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
              <AlertCircle size={28} className="mx-auto text-[var(--sl-warning)] mb-2" />
              <p className="text-[13px] text-[var(--sl-t2)] mb-4">
                {error.includes('does not exist')
                  ? 'Execute a migration 005 no Supabase para ativar este módulo.'
                  : error}
              </p>
              <button
                onClick={() => reload()}
                className="px-4 py-2 rounded-[10px] text-[12px] font-semibold bg-[var(--sl-s2)] text-[var(--sl-t1)] hover:opacity-80"
              >
                Tentar novamente
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
              <Sparkles size={32} className="mx-auto mb-3" style={{ color: MOD_FUTURO }} />
              <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
                {search || statusFilter !== 'all' ? 'Nenhum objetivo encontrado' : 'Comece a desenhar seu futuro'}
              </h3>
              <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto mb-4">
                {search || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Crie seu primeiro objetivo e defina as metas que vão te levar lá.'}
              </p>
              {!search && statusFilter === 'all' && (
                <button
                  onClick={() => router.push('/futuro/novo')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--sl-em)' }}
                >
                  <Plus size={15} />
                  Criar primeiro objetivo
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {displayed.map((obj, idx) => {
                  const progress = obj.computedProgress
                  const health = obj.healthStatus
                  const pill = getStatusPill(health)
                  const firstGoal = (obj.goals ?? [])[0]
                  const sub = getSubtitle(firstGoal, obj)
                  const iconBg = CATEGORY_ICON_BG[obj.category] ?? MOD_FUTURO_SOFT
                  const isCompleted = obj.status === 'completed'

                  return (
                    <div
                      key={obj.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/futuro/${obj.id}`)}
                      onKeyDown={e => e.key === 'Enter' && router.push(`/futuro/${obj.id}`)}
                      className={cn(
                        'flex items-center gap-[14px] px-4 py-[14px]',
                        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px]',
                        'cursor-pointer transition-all duration-200',
                        'hover:border-[var(--sl-border-h)] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]',
                        `sl-fade-up sl-delay-${Math.min(idx + 1, 5)}`,
                        isCompleted && 'opacity-75',
                      )}
                    >
                      <div
                        className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 text-[18px]"
                        style={{ background: iconBg }}
                      >
                        {obj.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[var(--sl-t1)]">
                          <span className="truncate">{obj.name}</span>
                          <span
                            className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[10px] font-semibold shrink-0"
                            style={{ background: pill.bg, color: pill.color }}
                          >
                            {pill.label}
                          </span>
                          {obj.priority === 'high' && (
                            <span
                              className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[10px] font-semibold shrink-0"
                              style={{ background: MOD_FUTURO_SOFT, color: MOD_FUTURO }}
                            >
                              Prioridade alta
                            </span>
                          )}
                        </div>
                        {sub && (
                          <div className="text-[11px] text-[var(--sl-t3)] mt-[2px] truncate">
                            {sub}
                          </div>
                        )}
                      </div>

                      {/* Progress bar — usa --sl-grad (G-03 exceção meta) */}
                      <div className="w-[140px] shrink-0">
                        <div className="h-[5px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                          <div
                            className="h-full rounded-[3px] transition-[width] duration-700 ease-out"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              background: 'var(--sl-grad)',
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className="sl-num-strong text-[16px] w-[50px] text-right shrink-0"
                        style={{ color: getProgressColor(progress, obj.status) }}
                      >
                        {progress}%
                      </div>

                      <ChevronRight size={14} className="text-[var(--sl-t3)] shrink-0" />
                    </div>
                  )
                })}
              </div>

              {/* Completed objectives restore action */}
              {displayed.some(obj => obj.status === 'completed') && (
                <div className="mt-2 flex justify-end flex-wrap gap-2">
                  {displayed.filter(obj => obj.status === 'completed').map(obj => (
                    <button
                      key={`restore-${obj.id}`}
                      onClick={(e) => { e.stopPropagation(); handleRestore(obj.id) }}
                      className="text-[10px] font-semibold text-[var(--sl-t3)] hover:text-[var(--sl-em)]
                                 px-2 py-1 rounded border border-[var(--sl-border)]
                                 hover:border-[var(--sl-border-em)] transition-colors"
                    >
                      Restaurar &quot;{obj.name}&quot;
                    </button>
                  ))}
                </div>
              )}

              {/* Ver todos · RN-FUT-05 */}
              {hasMore && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-5 py-2 rounded-[10px] text-[12px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                  >
                    Ver todos ({filtered.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Radar Sidebar · Mapa da Vida */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 self-start
                        hover:border-[var(--sl-border-h)] transition-colors">
          <LifeMapRadar
            dimensions={lifeDimensions}
            overallScore={lifeScore}
            loading={lifeLoading}
          />
          {/* Weekly insight (RN-FUT-29) */}
          {!lifeLoading && lifeDimensions.length > 0 && (() => {
            const weakest = [...lifeDimensions].sort((a, b) => a.value - b.value)[0]
            const strongest = [...lifeDimensions].sort((a, b) => b.value - a.value)[0]
            return (
              <div className="mt-4 pt-4 border-t border-[var(--sl-border)]">
                <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed flex items-start gap-1.5">
                  <Sparkles size={14} className="shrink-0 mt-px" style={{ color: MOD_FUTURO }} />
                  <span>
                    Seu ponto mais forte esta semana é <strong className="text-[var(--sl-t1)]">{strongest.icon} {strongest.fullLabel}</strong> ({strongest.value}%). Foque em <strong style={{ color: 'var(--sl-warning)' }}>{weakest.icon} {weakest.fullLabel}</strong> ({weakest.value}%) para equilibrar seu Mapa da Vida.
                  </span>
                </p>
              </div>
            )
          })()}
        </div>
      </div>

    </div>
    </>
  )
}
