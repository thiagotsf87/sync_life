'use client'

import { use, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pause, Play, CheckCircle, Trash2, Clock, TrendingDown, Target, Check, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

import {
  useObjectiveDetail,
  useUpdateObjective,
  useAddGoal,
  useUpdateGoalProgress,
  useDeleteObjective,
  useDeleteGoal,
  calcObjectiveProgress,
  calcProgressVelocity,
  isProgressAtRisk,
  CATEGORY_LABELS,
  type GoalIndicatorType,
} from '@/hooks/use-futuro'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'
import { GoalCard } from '@/components/futuro/GoalCard'
import { AddGoalModal } from '@/components/futuro/AddGoalModal'
import { FuturoDetailMobile } from '@/components/futuro/mobile/FuturoDetailMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { createEventFromGoalTask } from '@/lib/integrations/agenda'
import { createTransactionFromFuturoGoal } from '@/lib/integrations/financas'
import { cn } from '@/lib/utils'

// ─── Detail Ring SVG (140px) ────────────────────────────────────────────────

function DetailRing({ progress }: { progress: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]">
        <defs>
          <linearGradient id="det-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0055ff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--sl-s3)" strokeWidth="9" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke="url(#det-ring-grad)" strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[DM_Mono] font-medium text-[36px] leading-none text-[#0055ff]">{progress}%</span>
        <span className="text-[11px] text-[var(--sl-t3)] mt-1">Progresso</span>
      </div>
    </div>
  )
}

// ─── Horizontal Milestones Timeline ─────────────────────────────────────────

function HorizontalMilestones({ milestones, progress }: {
  milestones: { id: string; description: string; created_at: string; event_type: string }[]
  progress: number
}) {
  if (!milestones || milestones.length === 0) return null

  // Build milestone nodes from actual data
  const progressMilestones = milestones
    .filter(m => ['progress_50', 'progress_75', 'progress_90', 'goal_completed', 'objective_completed', 'created'].includes(m.event_type))
    .slice(0, 6)

  // If no relevant milestones, create default 25/50/75/100 markers
  const nodes = progressMilestones.length >= 2 ? progressMilestones.map(m => ({
    label: m.description.length > 20 ? m.description.slice(0, 20) + '...' : m.description,
    date: new Date(m.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    done: true,
    current: false,
  })) : [
    { label: '25%', date: progress >= 25 ? 'Atingido' : 'Pendente', done: progress >= 25, current: progress >= 20 && progress < 30 },
    { label: '50%', date: progress >= 50 ? 'Atingido' : 'Pendente', done: progress >= 50, current: progress >= 45 && progress < 55 },
    { label: '75%', date: progress >= 75 ? 'Atingido' : 'Pendente', done: progress >= 75, current: progress >= 70 && progress < 80 },
    { label: '100%', date: progress >= 100 ? 'Atingido' : 'Pendente', done: progress >= 100, current: progress >= 95 && progress < 100 },
  ]

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 mb-7 relative overflow-hidden
                    hover:border-[var(--sl-border-h)] transition-colors">
      {/* accent bar */}
      <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm bg-[#0055ff]" />
      <h3 className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-5 flex items-center gap-[9px]">
        <CheckCircle size={16} className="text-[#0055ff]" />
        Milestones
      </h3>
      <div className="flex items-start">
        {nodes.map((node, i) => {
          const isDone = node.done
          const isCurrent = node.current
          return (
            <div key={i} className="flex-1 text-center relative px-[10px]">
              {/* Connecting line */}
              <div
                className="absolute top-[14px] left-0 right-0 h-[2px]"
                style={{
                  background: isDone ? '#10b981' : isCurrent ? 'linear-gradient(90deg, #10b981, #0055ff)' : 'var(--sl-s3)',
                  ...(i === 0 ? { left: '50%' } : {}),
                  ...(i === nodes.length - 1 ? { right: '50%' } : {}),
                }}
              />
              {/* Dot */}
              <div
                className={cn(
                  'w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center mx-auto mb-[10px] relative z-[1]',
                  isDone && 'border-[#10b981] bg-[#10b981]',
                  isCurrent && 'border-[#0055ff] bg-[#0055ff] shadow-[0_0_12px_rgba(0,85,255,0.4)]',
                  !isDone && !isCurrent && 'border-[var(--sl-s3)] bg-[var(--sl-bg)]',
                )}
              >
                {isDone && <Check size={12} strokeWidth={2.5} className="text-[var(--sl-bg)]" />}
                {isCurrent && (
                  <div className="w-[8px] h-[8px] rounded-full bg-white" />
                )}
              </div>
              <div className={cn(
                'text-[12px] font-semibold',
                isCurrent && 'text-[#0055ff]',
                !isDone && !isCurrent && 'text-[var(--sl-t2)]',
              )}>
                {node.label}
              </div>
              <div className={cn(
                'text-[10px] mt-[2px]',
                isDone ? 'text-[#10b981]' : 'text-[var(--sl-t3)]',
              )}>
                {node.date}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { objective, loading, error, reload } = useObjectiveDetail(id)
  const updateObjective = useUpdateObjective()
  const addGoal = useAddGoal()
  const updateGoalProgress = useUpdateGoalProgress()
  const deleteObjective = useDeleteObjective()
  const deleteGoal = useDeleteGoal()
  const { isPro } = useUserPlan()

  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleAddGoal = useCallback(async (data: Parameters<typeof addGoal>[1]) => {
    // RN-FUT-08: Limite FREE = 3 metas por objetivo
    const currentGoals = objective?.goals?.length ?? 0
    const limitCheck = checkPlanLimit(isPro, 'goals_per_objective', currentGoals)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }

    setIsAddingGoal(true)
    try {
      const createdGoal = await addGoal(id, data)

      // RN-FUT-12/34: meta tarefa cria evento automatico na Agenda.
      if (data.indicator_type === 'task' && objective?.target_date) {
        await createEventFromGoalTask({
          objectiveName: objective.name,
          goalName: data.name,
          goalId: createdGoal.id,
          date: objective.target_date,
        }).catch(() => {})
      }

      // RN-FUT-31: meta financeira gera entrada planejada em Financas.
      if (data.target_module === 'financas' && data.indicator_type === 'monetary' && (data.target_value ?? 0) > 0) {
        const plannedDate = objective?.target_date ?? new Date().toISOString().split('T')[0]
        await createTransactionFromFuturoGoal({
          goalName: data.name,
          objectiveName: objective?.name ?? 'Objetivo',
          amount: data.target_value as number,
          date: plannedDate,
        }).catch(() => {})
      }

      toast.success(`Meta "${data.name}" adicionada!`)
      setAddGoalOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao adicionar meta')
    } finally {
      setIsAddingGoal(false)
    }
  }, [addGoal, id, reload, objective?.goals?.length, isPro])

  const handleUpdateProgress = useCallback(async (goalId: string, currentValue: number) => {
    if (!objective) return
    const goal = objective.goals?.find(g => g.id === goalId)
    if (!goal) return
    try {
      // RN-FUT-17: passa initial_value para calculo correto por tipo
      await updateGoalProgress(goalId, id, currentValue, goal.target_value, goal.indicator_type as GoalIndicatorType, goal.initial_value)
      toast.success('Progresso atualizado!')
      await reload()
    } catch {
      toast.error('Erro ao atualizar progresso')
    }
  }, [objective, updateGoalProgress, id, reload])

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    // RN-FUT-07/22: minimo 1 meta por objetivo
    const currentCount = objective?.goals?.length ?? 0
    if (currentCount <= 1) {
      toast.warning('Um objetivo precisa ter pelo menos 1 meta. Adicione outra antes de remover esta.')
      return
    }
    try {
      await deleteGoal(goalId, id)
      toast.success('Meta removida')
      await reload()
    } catch {
      toast.error('Erro ao remover meta')
    }
  }, [deleteGoal, id, reload, objective?.goals?.length])

  const handleTogglePause = useCallback(async () => {
    if (!objective) return
    const newStatus = objective.status === 'paused' ? 'active' : 'paused'
    try {
      await updateObjective(id, { status: newStatus })
      toast.success(newStatus === 'paused' ? 'Objetivo pausado' : 'Objetivo reativado')
      await reload()
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }, [objective, updateObjective, id, reload])

  const handleComplete = useCallback(async () => {
    if (!objective) return
    try {
      await updateObjective(id, { status: 'completed' })
      toast.success('Objetivo concluido!')
      await reload()
    } catch {
      toast.error('Erro ao concluir objetivo')
    }
  }, [objective, updateObjective, id, reload])

  const handleDelete = useCallback(async () => {
    // RN-FUT-33: aviso adicional para objetivos financeiros
    const isFinancial = objective?.category === 'financial'
    const warning = isFinancial
      ? '\n\nNota: transacoes ou planejamentos em Financas vinculados a este objetivo nao serao removidos automaticamente.'
      : ''
    if (!window.confirm(`Excluir este objetivo e todas suas metas? Esta acao nao pode ser desfeita.${warning}`)) return
    setIsDeleting(true)
    try {
      await deleteObjective(id)
      toast.success('Objetivo excluido')
      router.push('/futuro')
    } catch {
      toast.error('Erro ao excluir')
      setIsDeleting(false)
    }
  }, [deleteObjective, id, router])

  // ─── Loading / error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9">
        <div className="h-8 w-48 rounded-lg bg-[var(--sl-s2)] animate-pulse mb-4" />
        <div className="h-32 rounded-[18px] bg-[var(--sl-s2)] animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--sl-s2)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !objective) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-16 text-center">
        <p className="text-[#f43f5e] font-semibold mb-2">Objetivo nao encontrado</p>
        <p className="text-[13px] text-[var(--sl-t3)] mb-4">{error}</p>
        <button
          onClick={() => router.push('/futuro')}
          className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
          style={{ background: '#10b981', color: '#03071a' }}
        >
          Voltar para Futuro
        </button>
      </div>
    )
  }

  const goals = objective.goals ?? []
  const milestones = objective.milestones ?? []
  const progress = calcObjectiveProgress(goals)
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const isCompleted = objective.status === 'completed'
  const isPaused = objective.status === 'paused'

  // RN-FUT-24..25: velocity & at-risk
  const velocity = calcProgressVelocity(milestones, objective.created_at, progress)
  const atRisk = objective.status === 'active' && isProgressAtRisk(velocity, progress, objective.target_date)
  const velocityLabel = velocity > 0
    ? `+${velocity.toFixed(2)}%/dia`
    : velocity < 0
    ? `${velocity.toFixed(2)}%/dia`
    : null

  // Financial metrics for hero
  const firstGoal = goals[0]
  const isMonetary = firstGoal?.indicator_type === 'monetary'
  const currentValue = firstGoal?.current_value ?? 0
  const targetValue = firstGoal?.target_value ?? 0
  const remaining = Math.max(0, targetValue - currentValue)

  // Monthly needed calculation
  const monthsLeft = objective.target_date
    ? Math.max(1, Math.ceil((new Date(objective.target_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
    : 12
  const monthlyNeeded = remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0

  // Status pill
  const statusPill = isCompleted
    ? { label: 'Concluido', bg: 'rgba(16,185,129,0.10)', color: '#10b981' }
    : isPaused
    ? { label: 'Pausado', bg: 'rgba(100,116,139,0.10)', color: '#64748b' }
    : atRisk
    ? { label: 'Em Risco', bg: 'rgba(244,63,94,0.10)', color: '#f43f5e' }
    : { label: 'No Ritmo', bg: 'rgba(16,185,129,0.10)', color: '#10b981' }

  return (
    <>
    {/* Mobile detail */}
    <FuturoDetailMobile objective={objective} />

    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Back + Title row */}
      <div className="flex items-center gap-[14px] mb-7 sl-fade-up flex-wrap">
        <button
          onClick={() => router.push('/futuro')}
          className="inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[10px]
                     border border-[var(--sl-border)] text-[var(--sl-t2)] text-[12px] font-medium
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-[10px]">
            <div
              className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-[20px]"
              style={{ background: 'rgba(0,85,255,0.08)' }}
            >
              {objective.icon}
            </div>
            <div>
              <h1 className="font-[Syne] font-extrabold text-[24px] leading-[1.15] text-[var(--sl-t1)]">
                {objective.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[11px] font-semibold"
                  style={{ background: statusPill.bg, color: statusPill.color }}
                >
                  {statusPill.label}
                </span>
                {objective.priority === 'high' && (
                  <span className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(168,85,247,0.10)', color: '#a855f7' }}>
                    Prioridade Alta
                  </span>
                )}
                {objective.target_date && (
                  <span className="text-[11px] text-[var(--sl-t3)]">
                    Prazo: {new Date(objective.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCompleted && (
            <>
              <button
                onClick={() => setAddGoalOpen(true)}
                className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           border border-[var(--sl-border)] text-[var(--sl-t2)]
                           hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                <Plus size={16} />
                Registrar Aporte
              </button>
              <button
                onClick={handleTogglePause}
                className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           border border-[var(--sl-border)] text-[var(--sl-t2)]
                           hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                {isPaused ? <><Play size={13} /> Retomar</> : <><Pause size={13} /> Pausar</>}
              </button>
              <button
                onClick={handleComplete}
                className="inline-flex items-center gap-[7px] px-[14px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20 transition-colors"
              >
                <CheckCircle size={13} />
                Concluir
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-[10px] rounded-[11px] hover:bg-[rgba(244,63,94,0.1)] transition-colors border border-[var(--sl-border)]"
          >
            <Trash2 size={16} className="text-[var(--sl-t3)] hover:text-[#f43f5e]" />
          </button>
        </div>
      </div>

      {/* ── HERO: Split-panel — Ring left + Metrics right ── */}
      <div className="flex items-stretch gap-0 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px]
                      overflow-hidden mb-7 relative sl-fade-up sl-delay-1
                      hover:border-[var(--sl-border-h)] transition-colors">
        {/* Accent bar */}
        <div className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b-sm bg-[#0055ff]" />

        {/* Left: Ring */}
        <div className="flex-[0_0_220px] flex flex-col items-center justify-center py-8 px-8 border-r border-[var(--sl-border)]">
          <DetailRing progress={progress} />
          {/* Velocity badge */}
          {velocityLabel && (
            <div
              className="inline-flex items-center gap-[5px] mt-[14px] px-3 py-[5px] rounded-lg"
              style={{
                background: atRisk ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)',
              }}
            >
              <TrendingDown size={12} style={{ color: atRisk ? '#f43f5e' : '#10b981' }} />
              <span
                className="text-[11px] font-semibold"
                style={{ color: atRisk ? '#f43f5e' : '#10b981' }}
              >
                {atRisk ? 'Velocidade Lenta' : 'No Ritmo'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Metrics + description */}
        <div className="flex-1 py-7 px-8 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-3">
            {CATEGORY_LABELS[objective.category]} {objective.description && `\u2014 ${objective.description}`}
          </p>

          {/* Metric strip */}
          <div className="flex gap-0 mt-2">
            {isMonetary ? (
              <>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)] first:pl-0">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[#10b981]">
                    R$ {currentValue.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Atual</div>
                </div>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)]">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[var(--sl-t1)]">
                    R$ {targetValue.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Meta</div>
                </div>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)]">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[#f43f5e]">
                    R$ {remaining.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Falta</div>
                </div>
                <div className="flex-1 px-[18px] last:pr-0">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[#f59e0b]">
                    R$ {monthlyNeeded.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Necessario/Mes</div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)] first:pl-0">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[#10b981]">
                    {completedGoals}/{goals.length}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Metas</div>
                </div>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)]">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none text-[var(--sl-t1)]">
                    {progress}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Progresso</div>
                </div>
                <div className="flex-1 px-[18px]">
                  <div className="font-[DM_Mono] font-medium text-[20px] leading-none"
                    style={{ color: velocity > 0 ? '#10b981' : velocity < 0 ? '#f43f5e' : 'var(--sl-t3)' }}>
                    {velocityLabel ?? '\u2014'}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Velocidade</div>
                </div>
              </>
            )}
          </div>

          {objective.target_date && (
            <div className="flex items-center gap-1.5 mt-4">
              <Clock size={12} className="text-[var(--sl-t3)]" />
              <span className="text-[11px] text-[var(--sl-t3)]">
                Prazo: {new Date(objective.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                {objective.target_date_reason && ` \u2014 ${objective.target_date_reason}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Full-Width Progress Bar with markers ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] px-7 py-5 mb-7 sl-fade-up sl-delay-2
                      hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-[var(--sl-t2)]">Progresso ate a meta</span>
          <span className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">
            {isMonetary
              ? `R$ ${currentValue.toLocaleString('pt-BR')} / R$ ${targetValue.toLocaleString('pt-BR')}`
              : `${completedGoals} / ${goals.length} metas`
            }
          </span>
        </div>
        {/* Track with markers */}
        <div className="relative h-[10px] bg-[var(--sl-s3)] rounded-[5px] overflow-visible my-3">
          <div
            className="h-full rounded-[5px] relative z-[1] transition-[width] duration-1000"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, #0055ff, #10b981)',
            }}
          />
          {/* 25/50/75 markers */}
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '25%' }} />
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '50%' }} />
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '75%' }} />
        </div>
        {/* Labels */}
        <div className="flex justify-between text-[10px] text-[var(--sl-t3)]">
          {isMonetary ? (
            <>
              <span>R$ 0</span>
              <span>R$ {Math.round(targetValue * 0.25 / 1000)}k</span>
              <span>R$ {Math.round(targetValue * 0.5 / 1000)}k</span>
              <span>R$ {Math.round(targetValue * 0.75 / 1000)}k</span>
              <span>R$ {Math.round(targetValue / 1000)}k</span>
            </>
          ) : (
            <>
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </>
          )}
        </div>
      </div>

      {/* ── Horizontal Milestones Timeline ── */}
      <div className="sl-fade-up sl-delay-3">
        <HorizontalMilestones milestones={milestones} progress={progress} />
      </div>

      {/* ── SPLIT: Sub-Metas (left) + Aportes Recentes (right) ── */}
      <div className="grid grid-cols-[1fr_380px] gap-5 max-lg:grid-cols-1 sl-fade-up sl-delay-4">

        {/* Left: Sub-Metas as checklist */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 relative overflow-hidden
                        hover:border-[var(--sl-border-h)] transition-colors">
          {/* Accent bar */}
          <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm bg-[#0055ff]" />

          <div className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-[18px] flex items-center gap-[9px]">
            <CheckCircle size={16} className="text-[#0055ff]" />
            Sub-Metas
            <span className="ml-auto font-[DM_Sans] text-[12px] font-medium text-[#0055ff]">
              {completedGoals}/{goals.length} concluidas
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-[13px] text-[var(--sl-t2)] mb-3">
                Nenhuma meta adicionada ainda.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[6px]">
              {goals.map(goal => {
                const goalCompleted = goal.status === 'completed'
                const isCurrent = !goalCompleted && goal.progress > 0
                return (
                  <div
                    key={goal.id}
                    className={cn(
                      'flex items-center gap-3 px-[14px] py-3 bg-[var(--sl-s2)] rounded-[11px] transition-colors hover:bg-[var(--sl-s3)]',
                      isCurrent && 'border-l-[3px] border-l-[#0055ff] rounded-l-lg',
                    )}
                  >
                    {/* Check circle */}
                    <div className={cn(
                      'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0',
                      goalCompleted && 'border-[#10b981] bg-[#10b981]',
                      isCurrent && 'border-[#0055ff]',
                      !goalCompleted && !isCurrent && 'border-[var(--sl-border)]',
                    )}>
                      {goalCompleted && <Check size={12} strokeWidth={2.5} className="text-[var(--sl-bg)]" />}
                      {isCurrent && <div className="w-[8px] h-[8px] rounded-full bg-[#0055ff]" />}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-[13px] font-medium',
                        goalCompleted && 'line-through opacity-50',
                        !goalCompleted && !isCurrent && 'text-[var(--sl-t2)]',
                      )}>
                        {goal.name}
                      </div>
                      <div className={cn(
                        'text-[10px] mt-[1px]',
                        goalCompleted ? 'text-[#10b981]' : 'text-[var(--sl-t3)]',
                      )}>
                        {goalCompleted
                          ? `Concluido`
                          : isCurrent ? 'Em andamento' : 'Pendente'
                        }
                      </div>
                    </div>
                    {/* Value */}
                    {goal.target_value != null && (
                      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t2)] shrink-0">
                        {goal.indicator_type === 'monetary'
                          ? `R$ ${goal.current_value.toLocaleString('pt-BR')}`
                          : `${goal.current_value}`
                        }
                        <span className="text-[var(--sl-t3)]"> / </span>
                        {goal.indicator_type === 'monetary'
                          ? `R$ ${goal.target_value.toLocaleString('pt-BR')}`
                          : `${goal.target_value}`
                        }
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Add goal button */}
          {!isCompleted && (
            <button
              onClick={() => setAddGoalOpen(true)}
              className="flex items-center gap-1.5 mt-4 px-3 py-2 rounded-[10px] text-[12px] font-semibold
                         bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
            >
              <Plus size={13} />
              Nova Meta
            </button>
          )}
        </div>

        {/* Right: Aportes Recentes */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 h-fit relative overflow-hidden
                        hover:border-[var(--sl-border-h)] transition-colors">
          {/* Accent bar green */}
          <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm bg-[#10b981]" />

          <div className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-[18px] flex items-center gap-[9px]">
            <DollarSign size={16} className="text-[#10b981]" />
            Aportes Recentes
            <span className="ml-auto font-[DM_Sans] text-[12px] font-medium text-[#0055ff] cursor-pointer"
              onClick={() => setAddGoalOpen(true)}>
              + Novo aporte
            </span>
          </div>

          {/* Aporte rows from milestones (contributions) */}
          {(() => {
            const contributions = milestones
              .filter(m => ['goal_added', 'progress_50', 'progress_75', 'progress_90', 'objective_edited'].includes(m.event_type))
              .slice(0, 5)

            if (contributions.length === 0) {
              return (
                <p className="text-[12px] text-[var(--sl-t3)] py-4 text-center">
                  Nenhum aporte registrado ainda.
                </p>
              )
            }

            return (
              <>
                {contributions.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-[14px] py-[10px] bg-[var(--sl-s2)] rounded-[10px] mb-[5px]">
                    <div>
                      <div className="text-[12px] font-medium text-[var(--sl-t1)]">
                        {m.description.length > 30 ? m.description.slice(0, 30) + '...' : m.description}
                      </div>
                      <div className="text-[10px] text-[var(--sl-t3)] mt-[1px]">
                        {new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="font-[DM_Mono] text-[13px] text-[#10b981] font-medium">
                      {m.event_type === 'progress_50' ? '50%' : m.event_type === 'progress_75' ? '75%' : m.event_type === 'progress_90' ? '90%' : '+'}
                    </div>
                  </div>
                ))}

                {/* Summary footer */}
                <div className="flex justify-between items-center px-[14px] pt-[14px] mt-[10px] border-t border-[var(--sl-border)]">
                  <span className="text-[12px] text-[var(--sl-t3)]">Progresso geral</span>
                  <span className="font-[DM_Mono] text-[16px] font-medium text-[#10b981]">{progress}%</span>
                </div>
              </>
            )
          })()}

          {/* Historical timeline below */}
          {milestones.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[var(--sl-border)]">
              <h4 className="text-[13px] font-[Syne] font-bold text-[var(--sl-t1)] mb-3">
                Historico
              </h4>
              <div className="flex flex-col gap-2">
                {milestones.slice(0, 6).map((m) => {
                  const iconMap: Record<string, string> = {
                    created: '🎯', goal_added: '➕', goal_completed: '✅',
                    goal_removed: '➖', progress_50: '⚡', progress_75: '🔥',
                    progress_90: '🚀', objective_completed: '🏆',
                    objective_paused: '⏸️', objective_resumed: '▶️',
                    objective_edited: '✏️',
                  }
                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <span className="text-base shrink-0 mt-0.5">{iconMap[m.event_type] ?? '📍'}</span>
                      <div>
                        <p className="text-[12px] text-[var(--sl-t2)]">{m.description}</p>
                        <p className="text-[10px] text-[var(--sl-t3)]">
                          {new Date(m.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add goal modal */}
      <AddGoalModal
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        onSave={handleAddGoal}
        isLoading={isAddingGoal}
      />
    </div>
    </>
  )
}
