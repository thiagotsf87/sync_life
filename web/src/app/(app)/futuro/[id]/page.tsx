'use client'

import { use, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Pause,
  Play,
  CheckCircle,
  Trash2,
  Clock,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Check,
  Sparkles,
  Award,
  Target,
  PauseCircle,
  Edit2,
  AlertCircle,
} from 'lucide-react'
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
import { AddGoalModal } from '@/components/futuro/AddGoalModal'
import { FuturoDetailMobile } from '@/components/futuro/mobile/FuturoDetailMobile'
import { fmtBRL } from '@/lib/format/currency'
import { createEventFromGoalTask } from '@/lib/integrations/agenda'
import { createTransactionFromFuturoGoal } from '@/lib/integrations/financas'
import { cn } from '@/lib/utils'

// Cor do módulo Futuro (identificação)
const MOD_FUTURO = '#8B7BD4'
const MOD_FUTURO_SOFT = 'rgba(139,123,212,0.10)'

// ─── Detail Ring SVG (140px) ────────────────────────────────────────────────
// Usa --sl-grad (exceção G-03 permitida em metas/RingProgress)
function DetailRing({ progress }: { progress: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]">
        <defs>
          <linearGradient id="det-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0B2D34" />
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
        <span className="sl-num-strong text-[36px] leading-none text-[var(--sl-t1)]">{progress}%</span>
        <span className="text-[11px] text-[var(--sl-t3)] mt-1">Progresso</span>
      </div>
    </div>
  )
}

// ─── Milestones markers strip ───────────────────────────────────────────────

function HorizontalMilestones({ milestones, progress }: {
  milestones: { id: string; description: string; created_at: string; event_type: string }[]
  progress: number
}) {
  if (!milestones || milestones.length === 0) return null

  const progressMilestones = milestones
    .filter(m => ['progress_50', 'progress_75', 'progress_90', 'goal_completed', 'objective_completed', 'created'].includes(m.event_type))
    .slice(0, 6)

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
      <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm" style={{ background: MOD_FUTURO }} />
      <h3 className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-5 flex items-center gap-[9px]">
        <Award size={16} style={{ color: MOD_FUTURO }} />
        Milestones
      </h3>
      <div className="flex items-start">
        {nodes.map((node, i) => {
          const isDone = node.done
          const isCurrent = node.current
          return (
            <div key={i} className="flex-1 text-center relative px-[10px]">
              <div
                className="absolute top-[14px] left-0 right-0 h-[2px]"
                style={{
                  background: isDone ? 'var(--sl-em)' : isCurrent ? 'var(--sl-grad)' : 'var(--sl-s3)',
                  ...(i === 0 ? { left: '50%' } : {}),
                  ...(i === nodes.length - 1 ? { right: '50%' } : {}),
                }}
              />
              <div
                className={cn(
                  'w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center mx-auto mb-[10px] relative z-[1]',
                  isDone && 'border-[var(--sl-em)] bg-[var(--sl-em)]',
                  !isDone && !isCurrent && 'border-[var(--sl-s3)] bg-[var(--sl-bg)]',
                )}
                style={isCurrent ? { borderColor: MOD_FUTURO, background: MOD_FUTURO, boxShadow: '0 0 12px rgba(139,123,212,0.4)' } : undefined}
              >
                {isDone && <Check size={12} strokeWidth={2.5} className="text-white" />}
                {isCurrent && (
                  <div className="w-[8px] h-[8px] rounded-full bg-white" />
                )}
              </div>
              <div className={cn(
                'text-[12px] font-semibold',
                isCurrent && 'text-[var(--sl-t1)]',
                isDone && !isCurrent && 'text-[var(--sl-t1)]',
                !isDone && !isCurrent && 'text-[var(--sl-t2)]',
              )}>
                {node.label}
              </div>
              <div className={cn(
                'text-[10px] mt-[2px]',
                isDone ? 'text-[var(--sl-em)]' : 'text-[var(--sl-t3)]',
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
    const currentGoals = objective?.goals?.length ?? 0
    const limitCheck = checkPlanLimit(isPro, 'goals_per_objective', currentGoals)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }

    setIsAddingGoal(true)
    try {
      const createdGoal = await addGoal(id, data)

      if (data.indicator_type === 'task' && objective?.target_date) {
        await createEventFromGoalTask({
          objectiveName: objective.name,
          goalName: data.name,
          goalId: createdGoal.id,
          date: objective.target_date,
        }).catch(() => {})
      }

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
  }, [addGoal, id, reload, objective?.goals?.length, objective?.target_date, objective?.name, isPro])

  // RN-FUT-17: passa initial_value para cálculo correto por tipo
  const handleUpdateProgress = useCallback(async (goalId: string, currentValue: number) => {
    if (!objective) return
    const goal = objective.goals?.find(g => g.id === goalId)
    if (!goal) return
    try {
      await updateGoalProgress(goalId, id, currentValue, goal.target_value, goal.indicator_type as GoalIndicatorType, goal.initial_value)
      toast.success('Progresso atualizado!')
      await reload()
    } catch {
      toast.error('Erro ao atualizar progresso')
    }
  }, [objective, updateGoalProgress, id, reload])

  // RN-FUT-07/22: mínimo 1 meta por objetivo
  const handleDeleteGoal = useCallback(async (goalId: string) => {
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

  // Mark handlers as referenced for ESLint
  void handleUpdateProgress
  void handleDeleteGoal

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
      toast.success('Objetivo concluído!')
      await reload()
    } catch {
      toast.error('Erro ao concluir objetivo')
    }
  }, [objective, updateObjective, id, reload])

  // RN-FUT-33: aviso adicional para objetivos financeiros
  const handleDelete = useCallback(async () => {
    const isFinancial = objective?.category === 'financial'
    const warning = isFinancial
      ? '\n\nNota: transações ou planejamentos em Finanças vinculados a este objetivo não serão removidos automaticamente.'
      : ''
    if (!window.confirm(`Excluir este objetivo e todas suas metas? Esta ação não pode ser desfeita.${warning}`)) return
    setIsDeleting(true)
    try {
      await deleteObjective(id)
      toast.success('Objetivo excluído')
      router.push('/futuro')
    } catch {
      toast.error('Erro ao excluir')
      setIsDeleting(false)
    }
  }, [deleteObjective, id, router, objective?.category])

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
        <AlertCircle size={28} className="mx-auto text-[var(--sl-danger)] mb-2" />
        <p className="text-[var(--sl-danger)] font-semibold mb-2">Objetivo não encontrado</p>
        <p className="text-[13px] text-[var(--sl-t3)] mb-4">{error}</p>
        <button
          onClick={() => router.push('/futuro')}
          className="px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: 'var(--sl-em)' }}
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

  const velocity = calcProgressVelocity(milestones, objective.created_at, progress)
  const atRisk = objective.status === 'active' && isProgressAtRisk(velocity, progress, objective.target_date)
  const velocityLabel = velocity > 0
    ? `+${velocity.toFixed(2)}%/dia`
    : velocity < 0
    ? `${velocity.toFixed(2)}%/dia`
    : null

  const firstGoal = goals[0]
  const isMonetary = firstGoal?.indicator_type === 'monetary'
  const currentValue = firstGoal?.current_value ?? 0
  const targetValue = firstGoal?.target_value ?? 0
  const remaining = Math.max(0, targetValue - currentValue)

  const monthsLeft = objective.target_date
    ? Math.max(1, Math.ceil((new Date(objective.target_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
    : 12
  const monthlyNeeded = remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0

  const statusPill = isCompleted
    ? { label: 'Concluído', bg: 'rgba(15,118,110,0.10)', color: 'var(--sl-em)' }
    : isPaused
    ? { label: 'Pausado', bg: 'rgba(111,121,134,0.10)', color: 'var(--sl-t3)' }
    : atRisk
    ? { label: 'Em risco', bg: 'rgba(219,100,120,0.10)', color: 'var(--sl-danger)' }
    : { label: 'No ritmo', bg: 'rgba(31,166,122,0.10)', color: 'var(--sl-success)' }

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
              style={{ background: MOD_FUTURO_SOFT }}
            >
              {objective.icon}
            </div>
            <div>
              <h1 className="font-[Syne] font-extrabold text-[24px] leading-[1.15] text-[var(--sl-t1)]">
                {objective.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[11px] font-semibold"
                  style={{ background: statusPill.bg, color: statusPill.color }}
                >
                  {statusPill.label}
                </span>
                {objective.priority === 'high' && (
                  <span className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-lg text-[11px] font-semibold"
                    style={{ background: MOD_FUTURO_SOFT, color: MOD_FUTURO }}>
                    Prioridade alta
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
        <div className="flex gap-2 flex-wrap">
          {!isCompleted && (
            <>
              <button
                onClick={() => setAddGoalOpen(true)}
                className="inline-flex items-center gap-[7px] px-[18px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           border border-[var(--sl-border)] text-[var(--sl-t2)]
                           hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                <Plus size={16} />
                Registrar aporte
              </button>
              <button
                onClick={handleTogglePause}
                className="inline-flex items-center gap-[7px] px-[18px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           border border-[var(--sl-border)] text-[var(--sl-t2)]
                           hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                {isPaused ? <><Play size={13} /> Retomar</> : <><Pause size={13} /> Pausar</>}
              </button>
              <button
                onClick={handleComplete}
                className="inline-flex items-center gap-[7px] px-[14px] py-[10px] rounded-[11px] text-[13px] font-semibold
                           border transition-colors hover:opacity-90"
                style={{ background: 'var(--sl-em-soft)', color: 'var(--sl-em)', borderColor: 'var(--sl-border-em)' }}
              >
                <CheckCircle size={13} />
                Concluir
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-[10px] rounded-[11px] hover:bg-[rgba(219,100,120,0.1)] transition-colors border border-[var(--sl-border)]"
            aria-label="Excluir"
          >
            <Trash2 size={16} className="text-[var(--sl-t3)] hover:text-[var(--sl-danger)]" />
          </button>
        </div>
      </div>

      {/* ── HERO P5: Ring + Metrics (único hero G-05) ── */}
      <div className="flex items-stretch gap-0 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px]
                      overflow-hidden mb-7 relative sl-fade-up sl-delay-1
                      hover:border-[var(--sl-border-h)] transition-colors">
        <div className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b-sm" style={{ background: MOD_FUTURO }} />

        {/* Left: Ring (hero único — P5 estilo HeroLevel) */}
        <div className="flex-[0_0_220px] flex flex-col items-center justify-center py-8 px-8 border-r border-[var(--sl-border)]">
          <DetailRing progress={progress} />
          {velocityLabel && (
            <div
              className="inline-flex items-center gap-[5px] mt-[14px] px-3 py-[5px] rounded-lg"
              style={{
                background: atRisk ? 'rgba(219,100,120,0.08)' : 'rgba(31,166,122,0.08)',
              }}
            >
              {atRisk
                ? <TrendingDown size={12} style={{ color: 'var(--sl-danger)' }} />
                : <TrendingUp size={12} style={{ color: 'var(--sl-success)' }} />
              }
              <span
                className="text-[11px] font-semibold"
                style={{ color: atRisk ? 'var(--sl-danger)' : 'var(--sl-success)' }}
              >
                {atRisk ? 'Velocidade lenta' : 'No ritmo'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Metrics + description */}
        <div className="flex-1 py-7 px-8 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-3">
            {CATEGORY_LABELS[objective.category]} {objective.description && `· ${objective.description}`}
          </p>

          {/* Metric strip */}
          <div className="flex gap-0 mt-2 flex-wrap">
            {isMonetary ? (
              <>
                <div className="flex-1 min-w-[120px] px-[18px] border-r border-[var(--sl-border)] first:pl-0">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-em)]">
                    {fmtBRL(currentValue)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Atual</div>
                </div>
                <div className="flex-1 min-w-[120px] px-[18px] border-r border-[var(--sl-border)]">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-t1)]">
                    {fmtBRL(targetValue)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Meta</div>
                </div>
                <div className="flex-1 min-w-[120px] px-[18px] border-r border-[var(--sl-border)]">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-danger)]">
                    {fmtBRL(remaining)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Falta</div>
                </div>
                <div className="flex-1 min-w-[120px] px-[18px] last:pr-0">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-warning)]">
                    {fmtBRL(monthlyNeeded)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Necessário/Mês</div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)] first:pl-0">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-em)]">
                    {completedGoals}/{goals.length}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Metas</div>
                </div>
                <div className="flex-1 px-[18px] border-r border-[var(--sl-border)]">
                  <div className="sl-num-strong text-[20px] leading-none text-[var(--sl-t1)]">
                    {progress}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mt-[5px]">Progresso</div>
                </div>
                <div className="flex-1 px-[18px]">
                  <div className="sl-num-strong text-[20px] leading-none"
                    style={{ color: velocity > 0 ? 'var(--sl-success)' : velocity < 0 ? 'var(--sl-danger)' : 'var(--sl-t3)' }}>
                    {velocityLabel ?? 'Sem dados'}
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
                {objective.target_date_reason && ` · ${objective.target_date_reason}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 KPI cards (P5) ── */}
      <div className="grid grid-cols-4 gap-3 mb-7 max-sm:grid-cols-2 sl-fade-up sl-delay-2">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">Metas</p>
            <Target size={14} className="text-[var(--sl-t3)]" />
          </div>
          <p className="sl-num-strong text-xl text-[var(--sl-t1)] leading-none">{goals.length}</p>
          <p className="text-[11px] text-[var(--sl-success)] mt-1.5">{completedGoals} concluídas</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">Marcos</p>
            <Award size={14} className="text-[var(--sl-t3)]" />
          </div>
          <p className="sl-num-strong text-xl text-[var(--sl-t1)] leading-none">{milestones.length}</p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1.5">Eventos registrados</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">Status</p>
            {isPaused ? <PauseCircle size={14} className="text-[var(--sl-t3)]" /> : <Sparkles size={14} className="text-[var(--sl-t3)]" />}
          </div>
          <p className="sl-num-strong text-xl text-[var(--sl-t1)] leading-none">{statusPill.label}</p>
          <p className="text-[11px] mt-1.5" style={{ color: statusPill.color }}>
            {isCompleted ? 'Parabéns!' : isPaused ? 'Aguardando ação' : atRisk ? 'Reveja sua estratégia' : 'Continue assim'}
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">Prazo</p>
            <Clock size={14} className="text-[var(--sl-t3)]" />
          </div>
          <p className="sl-num-strong text-xl text-[var(--sl-t1)] leading-none">
            {objective.target_date ? `${monthsLeft}m` : '∞'}
          </p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1.5">
            {objective.target_date ? 'Restantes' : 'Sem prazo'}
          </p>
        </div>
      </div>

      {/* ── Full-Width Progress Bar with markers (G-03 exceção meta) ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] px-7 py-5 mb-7 sl-fade-up sl-delay-3
                      hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-[var(--sl-t2)]">Progresso até a meta</span>
          <span className="sl-num text-[14px] text-[var(--sl-t1)]">
            {isMonetary
              ? `${fmtBRL(currentValue)} / ${fmtBRL(targetValue)}`
              : `${completedGoals} / ${goals.length} metas`
            }
          </span>
        </div>
        <div className="relative h-[10px] bg-[var(--sl-s3)] rounded-[5px] overflow-visible my-3">
          <div
            className="h-full rounded-[5px] relative z-[1] transition-[width] duration-1000"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'var(--sl-grad)',
            }}
          />
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '25%' }} />
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '50%' }} />
          <div className="absolute top-[-4px] h-[18px] w-[2px] bg-[var(--sl-t3)] opacity-35 z-[2]" style={{ left: '75%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--sl-t3)] sl-num">
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

      {/* ── Milestones Timeline ── */}
      <div className="sl-fade-up sl-delay-4">
        <HorizontalMilestones milestones={milestones} progress={progress} />
      </div>

      {/* ── SPLIT: Sub-Metas + Aportes Recentes ── */}
      <div className="grid grid-cols-[1fr_380px] gap-5 max-lg:grid-cols-1 sl-fade-up sl-delay-5">

        {/* Left: Sub-Metas as checklist */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 relative overflow-hidden
                        hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm" style={{ background: MOD_FUTURO }} />

          <div className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-[18px] flex items-center gap-[9px]">
            <CheckCircle size={16} style={{ color: MOD_FUTURO }} />
            Sub-metas
            <span className="ml-auto font-[DM_Sans] text-[12px] font-medium text-[var(--sl-em)]">
              {completedGoals}/{goals.length} concluídas
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Edit2 size={28} className="mx-auto mb-2 text-[var(--sl-t3)]" />
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
                      isCurrent && 'border-l-[3px]',
                    )}
                    style={isCurrent ? { borderLeftColor: MOD_FUTURO } : undefined}
                  >
                    <div className={cn(
                      'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0',
                      goalCompleted && 'border-[var(--sl-em)] bg-[var(--sl-em)]',
                      !goalCompleted && !isCurrent && 'border-[var(--sl-border)]',
                    )}
                    style={isCurrent ? { borderColor: MOD_FUTURO } : undefined}
                    >
                      {goalCompleted && <Check size={12} strokeWidth={2.5} className="text-white" />}
                      {isCurrent && <div className="w-[8px] h-[8px] rounded-full" style={{ background: MOD_FUTURO }} />}
                    </div>
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
                        goalCompleted ? 'text-[var(--sl-em)]' : 'text-[var(--sl-t3)]',
                      )}>
                        {goalCompleted
                          ? 'Concluído'
                          : isCurrent ? 'Em andamento' : 'Pendente'
                        }
                      </div>
                    </div>
                    {goal.target_value != null && (
                      <span className="sl-num text-[11px] text-[var(--sl-t2)] shrink-0">
                        {goal.indicator_type === 'monetary'
                          ? fmtBRL(goal.current_value, { compact: true })
                          : `${goal.current_value}`
                        }
                        <span className="text-[var(--sl-t3)]"> / </span>
                        {goal.indicator_type === 'monetary'
                          ? fmtBRL(goal.target_value, { compact: true })
                          : `${goal.target_value}`
                        }
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!isCompleted && (
            <button
              onClick={() => setAddGoalOpen(true)}
              className="flex items-center gap-1.5 mt-4 px-3 py-2 rounded-[10px] text-[12px] font-semibold
                         text-white hover:opacity-90 transition-opacity"
              style={{ background: 'var(--sl-em)' }}
            >
              <Plus size={13} />
              Nova meta
            </button>
          )}
        </div>

        {/* Right: Aportes Recentes */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 h-fit relative overflow-hidden
                        hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b-sm bg-[var(--sl-em)]" />

          <div className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)] mb-[18px] flex items-center gap-[9px]">
            <DollarSign size={16} className="text-[var(--sl-em)]" />
            Aportes recentes
            <button
              type="button"
              className="ml-auto font-[DM_Sans] text-[12px] font-medium text-[var(--sl-em)] hover:underline"
              onClick={() => setAddGoalOpen(true)}>
              + Novo aporte
            </button>
          </div>

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
                      <div className="text-[10px] text-[var(--sl-t3)] mt-[1px] font-[IBM_Plex_Mono]">
                        {new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="sl-num text-[13px] text-[var(--sl-em)]">
                      {m.event_type === 'progress_50' ? '50%' : m.event_type === 'progress_75' ? '75%' : m.event_type === 'progress_90' ? '90%' : '+'}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center px-[14px] pt-[14px] mt-[10px] border-t border-[var(--sl-border)]">
                  <span className="text-[12px] text-[var(--sl-t3)]">Progresso geral</span>
                  <span className="sl-num-strong text-[16px] text-[var(--sl-em)]">{progress}%</span>
                </div>
              </>
            )
          })()}

          {milestones.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[var(--sl-border)]">
              <h4 className="text-[13px] font-[Syne] font-bold text-[var(--sl-t1)] mb-3">
                Histórico
              </h4>
              <div className="flex flex-col gap-2">
                {milestones.slice(0, 6).map((m) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    created: <Target size={13} style={{ color: MOD_FUTURO }} />,
                    goal_added: <Plus size={13} className="text-[var(--sl-em)]" />,
                    goal_completed: <CheckCircle size={13} className="text-[var(--sl-success)]" />,
                    goal_removed: <Trash2 size={13} className="text-[var(--sl-danger)]" />,
                    progress_50: <Sparkles size={13} className="text-[var(--sl-warning)]" />,
                    progress_75: <TrendingUp size={13} className="text-[var(--sl-warning)]" />,
                    progress_90: <TrendingUp size={13} className="text-[var(--sl-success)]" />,
                    objective_completed: <Award size={13} className="text-[var(--sl-em)]" />,
                    objective_paused: <PauseCircle size={13} className="text-[var(--sl-t3)]" />,
                    objective_resumed: <Play size={13} className="text-[var(--sl-em)]" />,
                    objective_edited: <Edit2 size={13} className="text-[var(--sl-t3)]" />,
                  }
                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5">{iconMap[m.event_type] ?? <Target size={13} className="text-[var(--sl-t3)]" />}</span>
                      <div>
                        <p className="text-[12px] text-[var(--sl-t2)]">{m.description}</p>
                        <p className="text-[10px] text-[var(--sl-t3)] font-[IBM_Plex_Mono]">
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
