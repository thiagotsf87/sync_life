'use client'

import { cn } from '@/lib/utils'
import type { Objective, ObjectiveGoal, ObjectiveCategory } from '@/hooks/use-futuro'
import { calcObjectiveProgress, calcProgressVelocity, isProgressAtRisk, CATEGORY_LABELS, MODULE_LABELS } from '@/hooks/use-futuro'

// ─── Status deadlines ─────────────────────────────────────────────────────────

function getDeadlineStatus(targetDate: string | null): {
  label: string
  color: string
} {
  if (!targetDate) return { label: '', color: '' }
  const now = new Date()
  const target = new Date(targetDate)
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Atrasado', color: '#f43f5e' }
  if (diffDays <= 30) return { label: `${diffDays}d`, color: '#f59e0b' }
  if (diffDays <= 90) return { label: `${Math.ceil(diffDays / 7)}sem`, color: '#06b6d4' }
  return { label: `${Math.ceil(diffDays / 30)}m`, color: 'var(--sl-t3)' }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

const PRIORITY_ACCENT: Record<string, string> = {
  high: '#f43f5e',
  medium: '#f59e0b',
  low: '#06b6d4',
}

// ─── Module badges ────────────────────────────────────────────────────────────

function ModuleBadges({ goals }: { goals: ObjectiveGoal[] }) {
  const modules = [...new Set(goals.map(g => g.target_module))]
  return (
    <div className="flex flex-wrap gap-1">
      {modules.map(m => (
        <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--sl-s3)] text-[var(--sl-t3)]">
          {MODULE_LABELS[m].split(' ')[0]}
        </span>
      ))}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ObjectiveProgressBar({ value, status }: { value: number; status: string }) {
  const color = status === 'completed'
    ? '#10b981'
    : value >= 85 ? '#f43f5e'
    : value >= 70 ? '#f59e0b'
    : '#10b981'

  return (
    <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: status === 'active' ? 'linear-gradient(90deg, #10b981, #0055ff)' : color,
        }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ObjectiveCardProps {
  objective: Objective
  onClick: () => void
  onRestore?: (id: string) => void  // RN-FUT-04: restaurar objetivo concluído
}

export function ObjectiveCard({ objective, onClick, onRestore }: ObjectiveCardProps) {
  const goals = objective.goals ?? []
  const progress = calcObjectiveProgress(goals)
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const deadline = getDeadlineStatus(objective.target_date)
  const accentColor = PRIORITY_ACCENT[objective.priority] ?? 'var(--sl-border)'

  const isCompleted = objective.status === 'completed'
  const isPaused = objective.status === 'paused'

  // RN-FUT-24..25: progress velocity + at-risk alert
  const velocity = calcProgressVelocity(objective.milestones ?? [], objective.created_at, progress)
  const atRisk = objective.status === 'active' && isProgressAtRisk(velocity, progress, objective.target_date)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'relative w-full text-left bg-[var(--sl-s1)] border border-[var(--sl-border)]',
        'rounded-2xl p-5 sl-fade-up transition-all duration-200 cursor-pointer',
        'hover:border-[var(--sl-border-h)] hover:shadow-sm dark:hover:shadow-none',
        isCompleted && 'opacity-75',
        isPaused && 'opacity-60',
      )}
    >
      {/* Priority accent bar */}
      <div
        className="absolute top-0 left-5 right-5 h-[2px] rounded-b"
        style={{ background: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">{objective.icon}</span>
          <div>
            <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] leading-tight">
              {objective.name}
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--sl-t3)]">
              {CATEGORY_LABELS[objective.category as ObjectiveCategory]}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-[DM_Mono] font-medium text-[15px]"
            style={{ color: progress >= 100 ? '#10b981' : 'var(--sl-t2)' }}>
            {progress}%
          </span>
          {deadline.label && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ color: deadline.color, background: `${deadline.color}15` }}>
              {deadline.label}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <ObjectiveProgressBar value={progress} status={objective.status} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <ModuleBadges goals={goals} />
        <div className="flex items-center gap-2">
          {/* RN-FUT-25: at-risk alert chip */}
          {atRisk && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)' }}
            >
              ⚠ Ritmo insuficiente
            </span>
          )}
          {goals.length > 0 && (
            <span className="text-[11px] text-[var(--sl-t3)] font-medium">
              {completedGoals}/{goals.length} metas
            </span>
          )}
          {objective.target_date && (
            <span className="text-[10px] text-[var(--sl-t3)]">
              até {formatDate(objective.target_date)}
            </span>
          )}
          {isCompleted && (
            <>
              <span className="text-[10px] font-bold text-[#10b981]">✓ Concluído</span>
              {onRestore && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRestore(objective.id) }}
                  className="text-[10px] font-semibold text-[var(--sl-t3)] hover:text-[#0055ff]
                             px-1.5 py-0.5 rounded border border-[var(--sl-border)]
                             hover:border-[#0055ff]/40 transition-colors"
                >
                  Restaurar
                </button>
              )}
            </>
          )}
          {isPaused && (
            <span className="text-[10px] font-bold text-[#f59e0b]">Pausado</span>
          )}
        </div>
      </div>

      {/* Description */}
      {objective.description && (
        <p className="text-[12px] text-[var(--sl-t3)] mt-2 line-clamp-1">
          {objective.description}
        </p>
      )}
    </div>
  )
}
