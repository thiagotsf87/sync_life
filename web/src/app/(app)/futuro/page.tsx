'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { useObjectives, useCreateObjective, useUpdateObjective, useAddGoal, type ObjectiveStatus, type ObjectiveCategory, type GoalModule, type GoalIndicatorType } from '@/hooks/use-futuro'
import { useUserPlan } from '@/hooks/use-user-plan'
import { useLifeMap } from '@/hooks/use-life-map'
import { checkPlanLimit } from '@/lib/plan-limits'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ObjectiveCard } from '@/components/futuro/ObjectiveCard'
import { ObjectiveWizard } from '@/components/futuro/ObjectiveWizard'
import { LifeMapRadar } from '@/components/futuro/LifeMapRadar'
import { FuturoMobile } from '@/components/futuro/FuturoMobile'
import { FuturoWizardMobile } from '@/components/futuro/mobile/FuturoWizardMobile'

// ─── Filter / Sort types ───────────────────────────────────────────────────────

type StatusFilter = 'all' | ObjectiveStatus
type CategoryFilter = 'all' | ObjectiveCategory
type SortMode = 'priority' | 'progress' | 'deadline'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'paused', label: 'Pausados' },
]

const SORT_LABELS: Record<SortMode, string> = {
  priority: 'Prioridade',
  progress: 'Progresso',
  deadline: 'Prazo',
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const MAX_VISIBLE = 10  // RN-FUT-05

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
  const [sortMode, setSortMode] = useState<SortMode>('priority')
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  // ─── Filter + Sort objectives (RN-FUT-01, RN-FUT-05) ─────────────────────────
  const filtered = useMemo(() => {
    const list = objectives.filter(obj => {
      if (statusFilter !== 'all' && obj.status !== statusFilter) return false
      if (search && !obj.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

    list.sort((a, b) => {
      if (sortMode === 'priority') {
        return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
      }
      if (sortMode === 'progress') {
        return b.progress - a.progress
      }
      // deadline: sem prazo vai para o fim
      if (!a.target_date && !b.target_date) return 0
      if (!a.target_date) return 1
      if (!b.target_date) return -1
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    })

    return list
  }, [objectives, statusFilter, sortMode, search])

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

  // ─── KPI formatting ──────────────────────────────────────────────────────────
  const nextDeadlineLabel = nextDeadline?.target_date
    ? new Date(nextDeadline.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : 'Sem prazo'

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

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
          🔮 Futuro
        </h1>
        <div className="flex-1" />
        {!isPro && (
          <span className="text-[11px] text-[var(--sl-t3)] font-medium">
            {active.length}/3 FREE
          </span>
        )}
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Objetivo
        </button>
      </div>

      {/* ② Summary Strip — 4 KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Objetivos Ativos"
          value={String(active.length)}
          accent="#0055ff"
        />
        <KpiCard
          label="Progresso Geral"
          value={`${avgProgress}%`}
          delta={active.length > 0 ? `${active.length} objetivos` : 'Nenhum ativo'}
          deltaType="neutral"
          accent="#10b981"
        />
        <KpiCard
          label="Próximo Prazo"
          value={nextDeadlineLabel}
          delta={nextDeadline?.name ?? ''}
          deltaType="warn"
          accent="#f59e0b"
        />
        <KpiCard
          label="Concluídos"
          value={String(completed.length)}
          delta={completed.length > 0 ? 'Este ciclo' : 'Continue firme!'}
          deltaType={completed.length > 0 ? 'up' : 'neutral'}
          accent="#10b981"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          active.length > 0
            ? <>Você tem <strong className="text-[var(--sl-t1)]">{active.length} objetivos ativos</strong> com progresso médio de <strong className="text-[#10b981]">{avgProgress}%</strong>. {avgProgress >= 50 ? 'Você está no caminho certo!' : 'Vamos adicionar mais metas para acelerar.'}</>
            : <>Crie seu primeiro objetivo para começar a mapear o futuro que você quer construir.</>
        }
      />

      {/* ④ Mapa da Vida — Jornada only (RN-FUT-26) */}
      <div className="mb-5">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up
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

      {/* ⑤ Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
              statusFilter === tab.value
                ? 'bg-[#0055ff] text-white border-[#0055ff]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
          </button>
        ))}
        {/* Sort toggle — RN-FUT-01 */}
        <button
          onClick={() => {
            const modes: SortMode[] = ['priority', 'progress', 'deadline']
            const next = modes[(modes.indexOf(sortMode) + 1) % modes.length]
            setSortMode(next)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-all"
        >
          <ArrowUpDown size={12} />
          {SORT_LABELS[sortMode]}
        </button>
        <div className="ml-auto flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-1.5 max-w-[180px]">
          <Search size={13} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-transparent text-[12px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>
      </div>

      {/* ⑤ Objectives grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[130px] rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
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
          <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
            {displayed.map((obj, idx) => (
              <div key={obj.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
                <ObjectiveCard
                  objective={obj}
                  onClick={() => router.push(`/futuro/${obj.id}`)}
                  onRestore={obj.status === 'completed' ? handleRestore : undefined}
                />
              </div>
            ))}
          </div>
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
