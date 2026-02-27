'use client'

import { use, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pause, Play, CheckCircle, Trash2, Clock, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
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
} from '@/hooks/use-futuro'
import { GoalCard } from '@/components/futuro/GoalCard'
import { AddGoalModal } from '@/components/futuro/AddGoalModal'

// ─── Milestone timeline ───────────────────────────────────────────────────────

function MilestoneTimeline({ milestones }: { milestones: { id: string; description: string; created_at: string; event_type: string }[] }) {
  if (!milestones || milestones.length === 0) return null

  function getIcon(type: string): string {
    const map: Record<string, string> = {
      created: '🎯',
      goal_added: '➕',
      goal_completed: '✅',
      goal_removed: '➖',
      progress_50: '⚡',
      progress_75: '🔥',
      progress_90: '🚀',
      objective_completed: '🏆',
      objective_paused: '⏸️',
      objective_resumed: '▶️',
      objective_edited: '✏️',
    }
    return map[type] ?? '📍'
  }

  return (
    <div className="flex flex-col gap-2">
      {milestones.slice(0, 10).map((m) => (
        <div key={m.id} className="flex items-start gap-3">
          <span className="text-base shrink-0 mt-0.5">{getIcon(m.event_type)}</span>
          <div>
            <p className="text-[12px] text-[var(--sl-t2)]">{m.description}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">
              {new Date(m.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { objective, loading, error, reload } = useObjectiveDetail(id)
  const updateObjective = useUpdateObjective()
  const addGoal = useAddGoal()
  const updateGoalProgress = useUpdateGoalProgress()
  const deleteObjective = useDeleteObjective()
  const deleteGoal = useDeleteGoal()

  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleAddGoal = useCallback(async (data: Parameters<typeof addGoal>[1]) => {
    setIsAddingGoal(true)
    try {
      await addGoal(id, data)
      toast.success(`Meta "${data.name}" adicionada!`)
      setAddGoalOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao adicionar meta')
    } finally {
      setIsAddingGoal(false)
    }
  }, [addGoal, id, reload])

  const handleUpdateProgress = useCallback(async (goalId: string, currentValue: number) => {
    if (!objective) return
    const goal = objective.goals?.find(g => g.id === goalId)
    if (!goal) return
    try {
      await updateGoalProgress(goalId, id, currentValue, goal.target_value, goal.indicator_type as never)
      toast.success('Progresso atualizado!')
      await reload()
    } catch {
      toast.error('Erro ao atualizar progresso')
    }
  }, [objective, updateGoalProgress, id, reload])

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    try {
      await deleteGoal(goalId, id)
      toast.success('Meta removida')
      await reload()
    } catch {
      toast.error('Erro ao remover meta')
    }
  }, [deleteGoal, id, reload])

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
      toast.success('Objetivo concluído! 🎉')
      await reload()
    } catch {
      toast.error('Erro ao concluir objetivo')
    }
  }, [objective, updateObjective, id, reload])

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Excluir este objetivo e todas suas metas? Esta ação não pode ser desfeita.')) return
    setIsDeleting(true)
    try {
      await deleteObjective(id)
      toast.success('Objetivo excluído')
      router.push('/futuro')
    } catch {
      toast.error('Erro ao excluir')
      setIsDeleting(false)
    }
  }, [deleteObjective, id, router])

  // ─── Loading / error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <div className="h-8 w-48 rounded-lg bg-[var(--sl-s2)] animate-pulse mb-4" />
        <div className="h-32 rounded-2xl bg-[var(--sl-s2)] animate-pulse mb-4" />
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
      <div className="max-w-[1140px] mx-auto px-6 py-16 text-center">
        <p className="text-[#f43f5e] font-semibold mb-2">Objetivo não encontrado</p>
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
    : '—'

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <button
          onClick={() => router.push('/futuro')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Futuro
        </button>
        <div className="flex items-center gap-2">
          {!isCompleted && (
            <>
              <button
                onClick={handleTogglePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium
                           border border-[var(--sl-border)] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                {isPaused ? <><Play size={13} /> Retomar</> : <><Pause size={13} /> Pausar</>}
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium
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
            className="p-1.5 rounded-[8px] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
          >
            <Trash2 size={16} className="text-[var(--sl-t3)] hover:text-[#f43f5e]" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 mb-5 sl-fade-up">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{objective.icon}</span>
          <div className="flex-1">
            <h1 className={cn(
              'font-[Syne] font-extrabold text-xl mb-0.5',
              isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
            )}>
              {objective.name}
            </h1>
            <p className="text-[12px] text-[var(--sl-t3)] mb-3">
              {CATEGORY_LABELS[objective.category]} ·
              {isCompleted ? ' Concluído' : isPaused ? ' Pausado' : ' Ativo'} ·
              {completedGoals}/{goals.length} metas
            </p>
            {objective.description && (
              <p className="text-[13px] text-[var(--sl-t2)] mb-3">{objective.description}</p>
            )}

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-[var(--sl-t3)]">Progresso geral</span>
                <span className="font-[DM_Mono] text-[14px] font-bold text-[#10b981]">{progress}%</span>
              </div>
              <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '6px' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-1000"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #10b981, #0055ff)',
                  }}
                />
              </div>
            </div>

            {objective.target_date && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={12} className="text-[var(--sl-t3)]" />
                <span className="text-[11px] text-[var(--sl-t3)]">
                  Prazo: {new Date(objective.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  {objective.target_date_reason && ` — ${objective.target_date_reason}`}
                </span>
              </div>
            )}

            {/* RN-FUT-24..25: velocity row + at-risk alert */}
            {objective.status === 'active' && (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Velocidade</span>
                  <span
                    className="font-[DM_Mono] text-[12px] font-semibold"
                    style={{ color: velocity > 0 ? '#10b981' : velocity < 0 ? '#f43f5e' : 'var(--sl-t3)' }}
                  >
                    {velocityLabel}
                  </span>
                </div>
                {atRisk && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
                  >
                    <TrendingDown size={12} />
                    Ritmo insuficiente para o prazo
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

        {/* Goals */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">
              Metas ({goals.length})
            </h2>
            {!isCompleted && (
              <button
                onClick={() => setAddGoalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold
                           bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
              >
                <Plus size={13} />
                Nova Meta
              </button>
            )}
          </div>

          {goals.length === 0 ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-[13px] text-[var(--sl-t2)] mb-3">
                Nenhuma meta adicionada ainda.
              </p>
              <p className="text-[12px] text-[var(--sl-t3)]">
                Adicione metas mensuráveis para acompanhar seu progresso.
              </p>
            </div>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateProgress={handleUpdateProgress}
                onDelete={handleDeleteGoal}
              />
            ))
          )}
        </div>

        {/* Sidebar — milestones */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
          <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">
            📍 Histórico
          </h2>
          {milestones.length === 0 ? (
            <p className="text-[12px] text-[var(--sl-t3)]">Nenhum evento ainda.</p>
          ) : (
            <MilestoneTimeline milestones={milestones} />
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
  )
}
