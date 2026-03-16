'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Target, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useObjectives, useCreateObjective, useUpdateObjective, useAddGoal, calcObjectiveProgress, calcProgressVelocity, isProgressAtRisk, CATEGORY_LABELS, type ObjectiveStatus, type ObjectiveCategory, type GoalModule, type GoalIndicatorType, type Objective } from '@/hooks/use-futuro'
import { useUserPlan } from '@/hooks/use-user-plan'
import { useLifeMap } from '@/hooks/use-life-map'
import { checkPlanLimit } from '@/lib/plan-limits'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ObjectiveWizard } from '@/components/futuro/ObjectiveWizard'
import { LifeMapRadar } from '@/components/futuro/LifeMapRadar'
import { FuturoMobile } from '@/components/futuro/FuturoMobile'
import { FuturoWizardMobile } from '@/components/futuro/mobile/FuturoWizardMobile'
import { ModuleHeader } from '@/components/ui/module-header'

// ─── Filter / Sort types ───────────────────────────────────────────────────────

type StatusFilter = 'all' | 'on_track' | 'attention' | 'at_risk' | 'completed'
type SortMode = 'priority' | 'progress' | 'deadline'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'on_track', label: 'No Ritmo' },
  { value: 'attention', label: 'Atenção' },
  { value: 'at_risk', label: 'Em Risco' },
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
    case 'on_track': return { label: 'No Ritmo', bg: 'rgba(16,185,129,0.10)', color: '#10b981' }
    case 'attention': return { label: 'Atenção', bg: 'rgba(245,158,11,0.10)', color: '#f59e0b' }
    case 'at_risk': return { label: 'Em Risco', bg: 'rgba(244,63,94,0.10)', color: '#f43f5e' }
    case 'completed': return { label: 'Concluído', bg: 'rgba(16,185,129,0.10)', color: '#10b981' }
  }
}

function getProgressColor(progress: number, status: string): string {
  if (status === 'completed') return '#10b981'
  if (progress > 85) return '#f43f5e'
  if (progress > 70) return '#f59e0b'
  return '#10b981'
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return 'Contínuo'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

function getSubtitle(firstGoal: { current_value: number; target_value: number | null; indicator_type: string } | undefined, obj: Objective): string {
  if (!firstGoal) return ''
  const parts: string[] = []

  if (firstGoal.indicator_type === 'monetary' && firstGoal.target_value) {
    parts.push(`R$ ${firstGoal.current_value.toLocaleString('pt-BR')} / R$ ${firstGoal.target_value.toLocaleString('pt-BR')}`)
  } else if (firstGoal.target_value) {
    parts.push(`${firstGoal.current_value} / ${firstGoal.target_value}`)
  }

  if (obj.target_date) {
    parts.push(`Prazo: ${new Date(obj.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`)
  }

  return parts.join(' — ')
}

// ─── Horizon Ring SVG ────────────────────────────────────────────────────────

function HorizonRing({ progress }: { progress: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-[96px] h-[96px] shrink-0">
      <svg viewBox="0 0 96 96" className="w-[96px] h-[96px]">
        <defs>
          <linearGradient id="hz-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0055ff" />
            <stop offset="100%" stopColor="#10b981" />
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
        <span className="font-[DM_Mono] font-medium text-[28px] leading-none text-sl-grad">{progress}%</span>
        <span className="text-[10px] text-[var(--sl-t3)] mt-0.5">Geral</span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FuturoPage() {
  const router = useRouter()

  const { objectives, active, completed, avgProgress, nextDeadline, loading, error, reload } = useObjectives()
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

    // Sort by priority
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
  const handleCreate = useCallback(async (data: Parameters<typeof createObjective>[0]) => {
    // RN-FUT-06: Limite FREE = 3 objetivos ativos
    const limitCheck = checkPlanLimit(isPro, 'active_objectives', active.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }

    setIsCreating(true)
    try {
      await createObjective(data)
      toast.success(`Objetivo "${data.name}" criado!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar objetivo')
    } finally {
      setIsCreating(false)
    }
  }, [createObjective, reload, isPro, active.length])

  // ─── Create from mobile wizard (with goals) ───────────────────────────────────
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
      // Add goals sequentially
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
    financas:     { emoji: '💰', label: 'Finanças',     color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    tempo:        { emoji: '⏳', label: 'Tempo',        color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    futuro:       { emoji: '🔮', label: 'Futuro',       color: '#0055ff', bg: 'rgba(0,85,255,0.15)' },
    corpo:        { emoji: '🏃', label: 'Corpo',        color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    mente:        { emoji: '🧠', label: 'Mente',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    patrimonio:   { emoji: '📈', label: 'Patrimônio',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    carreira:     { emoji: '💼', label: 'Carreira',     color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
    experiencias: { emoji: '✈️', label: 'Experiências', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
  }

  const CATEGORY_BG: Record<string, string> = {
    financial: 'rgba(16,185,129,0.12)',
    professional: 'rgba(245,158,11,0.12)',
    health: 'rgba(249,115,22,0.12)',
    educational: 'rgba(139,92,246,0.12)',
    experience: 'rgba(20,184,166,0.12)',
    personal: 'rgba(0,85,255,0.12)',
    other: 'rgba(100,116,139,0.12)',
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
    // Extract linked modules from goals
    const linkedModules = (obj.goals ?? [])
      .map(g => g.target_module)
      .filter((m, i, arr) => arr.indexOf(m) === i && MODULE_META[m])
      .map(m => MODULE_META[m])

    // Use first goal's values for progress label
    const firstGoal = (obj.goals ?? [])[0]

    // Check if objective is delayed
    const isDelayed = obj.target_date
      ? new Date(obj.target_date).getTime() < Date.now() && obj.progress < 100
      : false
    const behindMonths = obj.target_date
      ? Math.max(0, Math.round((Date.now() - new Date(obj.target_date).getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : 0

    // Narrative hint for Jornada mode
    const narrativeHint = isDelayed && behindMonths > 0
      ? `<strong>${behindMonths} meses atrasado.</strong> Cada R$ 200 extra recupera um mês.`
      : obj.progress >= 60
        ? `Mais ${Math.ceil((100 - obj.progress) / 15)} contribuições e você realiza esse sonho!`
        : undefined

    // Format progress label with currency prefix for monetary goals
    const rawLabel = firstGoal?.target_value != null
      ? `R$ ${firstGoal.current_value.toLocaleString('pt-BR')} / R$ ${firstGoal.target_value.toLocaleString('pt-BR')}`
      : `${obj.progress}% concluído`

    return {
      id: obj.id,
      name: obj.name,
      icon: obj.icon ?? '🎯',
      iconBg: CATEGORY_BG[obj.category] ?? 'rgba(0,85,255,0.12)',
      deadline: obj.target_date
        ? `📅 ${new Date(obj.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
        : 'Sem prazo',
      category: CATEGORY_DISPLAY[obj.category] ?? 'Geral',
      modules: linkedModules,
      progressLabel: rawLabel,
      progressPct: obj.progress,
      progressColor: obj.progress >= 60 ? '#10b981' : obj.progress >= 40 ? '#f59e0b' : '#f43f5e',
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
      return `O objetivo "${behindGoal.name}" está com apenas <span style="color:#f59e0b;">${behindGoal.progress}% de progresso</span>. Ajuste a contribuição mensal.`
    }
    return undefined
  })()

  // ─── Priority icon color mapping ────────────────────────────────────────────
  const PRIORITY_ICON_COLOR: Record<string, string> = {
    high: '#f43f5e',
    medium: '#f59e0b',
    low: '#06b6d4',
  }

  const CATEGORY_ICON_BG: Record<string, string> = {
    financial: 'rgba(16,185,129,0.10)',
    health: 'rgba(249,115,22,0.10)',
    professional: 'rgba(245,158,11,0.10)',
    educational: 'rgba(139,92,246,0.10)',
    experience: 'rgba(20,184,166,0.10)',
    personal: 'rgba(0,85,255,0.10)',
    other: 'rgba(100,116,139,0.10)',
  }

  const CATEGORY_ICON_COLOR: Record<string, string> = {
    financial: '#10b981',
    health: '#f97316',
    professional: '#f59e0b',
    educational: '#a855f7',
    experience: '#14b8a6',
    personal: '#0055ff',
    other: '#64748b',
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
    <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ── ModuleHeader ── */}
      <ModuleHeader
        icon={Target}
        iconBg="rgba(0,85,255,0.08)"
        iconColor="#0055ff"
        title="Futuro"
        subtitle={`${active.length} objetivos ativos · ${stats.onTrack} no ritmo · Progresso geral ${avgProgress}%`}
      >
        {!isPro && (
          <span className="text-[11px] text-[var(--sl-t3)] font-medium">
            {active.length}/3 FREE
          </span>
        )}
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#0055ff] text-white hover:brightness-110 hover:-translate-y-px
                     transition-all shadow-[0_6px_20px_rgba(0,85,255,0.15)]"
        >
          <Plus size={16} />
          Novo Objetivo
        </button>
      </ModuleHeader>

      {/* ── Jornada Insight ── */}
      <JornadaInsight
        text={
          active.length > 0
            ? <>Você tem <strong className="text-[var(--sl-t1)]">{active.length} objetivos ativos</strong> com progresso médio de <strong className="text-[#10b981]">{avgProgress}%</strong>. {avgProgress >= 50 ? 'Você está no caminho certo!' : 'Vamos adicionar mais metas para acelerar.'}</>
            : <>Crie seu primeiro objetivo para começar a mapear o futuro que você quer construir.</>
        }
      />

      {/* ── Horizon Roadmap Card ── */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-7 mb-7 overflow-hidden sl-fade-up sl-delay-1
                      hover:border-[var(--sl-border-h)] transition-colors">
        {/* Accent bar */}
        <div className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b-sm"
          style={{ background: 'linear-gradient(90deg, #0055ff, #10b981)' }} />

        {/* Head: Ring + Stats */}
        <div className="flex items-center gap-4 mb-6">
          <HorizonRing progress={avgProgress} />

          {/* Stats strip */}
          <div className="flex flex-1">
            {[
              { value: active.length, label: 'Objetivos', color: '#0055ff' },
              { value: stats.onTrack, label: 'No Ritmo', color: '#10b981' },
              { value: stats.attention, label: 'Atenção', color: '#f59e0b' },
              { value: stats.atRisk, label: 'Em Risco', color: '#f43f5e' },
              { value: stats.completed, label: 'Concluídos', color: '#10b981' },
            ].map((s, i, arr) => (
              <div key={s.label} className={cn(
                'flex-1 px-4',
                i < arr.length - 1 && 'border-r border-[var(--sl-border)]'
              )}>
                <div className="font-[DM_Mono] font-medium text-[22px] leading-none" style={{ color: s.color }}>
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
              const laneColor = health === 'at_risk' ? '#f43f5e'
                : health === 'attention' ? '#f59e0b'
                : '#10b981'

              return (
                <div key={obj.id} className="flex items-center gap-3 py-[7px] border-b border-[rgba(120,165,220,0.04)] last:border-b-0">
                  {/* Icon */}
                  <div
                    className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0 text-[13px]"
                    style={{ background: CATEGORY_ICON_BG[obj.category] ?? 'rgba(0,85,255,0.10)' }}
                  >
                    {obj.icon}
                  </div>
                  {/* Name */}
                  <div className="text-[12px] font-medium w-[140px] shrink-0 truncate text-[var(--sl-t1)]">
                    {obj.name}
                  </div>
                  {/* Bar */}
                  <div className="flex-1 h-[6px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full rounded-[3px] transition-[width] duration-800 ease-out"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        background: `linear-gradient(90deg, #0055ff, ${laneColor})`,
                      }}
                    />
                  </div>
                  {/* Pct */}
                  <div className="font-[DM_Mono] text-[11px] w-[40px] text-right shrink-0" style={{ color: laneColor }}>
                    {progress}%
                  </div>
                  {/* Deadline */}
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
      <div className="grid grid-cols-[1fr_340px] gap-5 sl-fade-up sl-delay-2 max-lg:grid-cols-1">
        {/* Left: Objectives list */}
        <div>
          {/* Search + Filter tabs */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-0 flex-1">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'px-[14px] py-2 text-[12px] font-semibold border-b-2 transition-all relative',
                    statusFilter === tab.value
                      ? 'text-[#0055ff] border-[#0055ff]'
                      : 'text-[var(--sl-t3)] border-transparent hover:text-[var(--sl-t2)]'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'text-[9px] ml-1 px-[5px] py-px rounded',
                    statusFilter === tab.value
                      ? 'bg-[rgba(0,85,255,0.18)]'
                      : 'bg-[var(--sl-s3)]'
                  )}>
                    {tabCounts[tab.value]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-[220px]">
              <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar objetivo..."
                className="w-full py-[9px] pl-[34px] pr-3 bg-[var(--sl-s2)] border border-[var(--sl-border)]
                           rounded-[10px] text-[var(--sl-t1)] text-[12px] outline-none
                           placeholder:text-[var(--sl-t3)] transition-colors
                           focus:border-[rgba(0,85,255,0.4)]"
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
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
              <div className="text-2xl mb-2">⚠️</div>
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
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">🔮</div>
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
                  onClick={() => setWizardOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                             bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
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
                  const iconColor = CATEGORY_ICON_COLOR[obj.category] ?? '#0055ff'
                  const iconBg = CATEGORY_ICON_BG[obj.category] ?? 'rgba(0,85,255,0.10)'
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
                      {/* Icon */}
                      <div
                        className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 text-[18px]"
                        style={{ background: iconBg }}
                      >
                        {obj.icon}
                      </div>

                      {/* Details */}
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
                              style={{ background: 'rgba(168,85,247,0.10)', color: '#a855f7' }}
                            >
                              Prioridade Alta
                            </span>
                          )}
                        </div>
                        {sub && (
                          <div className="text-[11px] text-[var(--sl-t3)] mt-[2px] truncate">
                            {sub}
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-[140px] shrink-0">
                        <div className="h-[5px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                          <div
                            className="h-full rounded-[3px] transition-[width] duration-700 ease-out"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              background: 'linear-gradient(90deg, #0055ff, #10b981)',
                            }}
                          />
                        </div>
                      </div>

                      {/* Percentage */}
                      <div
                        className="font-[DM_Mono] text-[16px] font-medium w-[50px] text-right shrink-0"
                        style={{ color: getProgressColor(progress, obj.status) }}
                      >
                        {progress}%
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={14} className="text-[var(--sl-t3)] shrink-0" />
                    </div>
                  )
                })}
              </div>

              {/* Completed objectives restore action */}
              {displayed.some(obj => obj.status === 'completed') && (
                <div className="mt-2 flex justify-end">
                  {displayed.filter(obj => obj.status === 'completed').map(obj => (
                    <button
                      key={`restore-${obj.id}`}
                      onClick={(e) => { e.stopPropagation(); handleRestore(obj.id) }}
                      className="text-[10px] font-semibold text-[var(--sl-t3)] hover:text-[#0055ff]
                                 px-2 py-1 rounded border border-[var(--sl-border)]
                                 hover:border-[#0055ff]/40 transition-colors mr-2"
                    >
                      Restaurar &quot;{obj.name}&quot;
                    </button>
                  ))}
                </div>
              )}

              {/* Ver todos — RN-FUT-05 */}
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

        {/* Right: Radar Sidebar — Mapa da Vida */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 self-start
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
                <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed">
                  💡 Seu ponto mais forte esta semana é <strong className="text-[var(--sl-t1)]">{strongest.icon} {strongest.fullLabel}</strong> ({strongest.value}%). Foque em <strong style={{ color: '#f59e0b' }}>{weakest.icon} {weakest.fullLabel}</strong> ({weakest.value}%) para equilibrar seu Mapa da Vida.
                </p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Wizard */}
      <ObjectiveWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />
    </div>
    </>
  )
}
