'use client'

import { useState } from 'react'
import { Edit2, Trash2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ObjectiveGoal, GoalModule, GoalIndicatorType } from '@/hooks/use-futuro'
import { MODULE_LABELS, INDICATOR_LABELS } from '@/hooks/use-futuro'

interface GoalCardProps {
  goal: ObjectiveGoal
  onUpdateProgress: (goalId: string, currentValue: number) => Promise<void>
  onDelete: (goalId: string) => Promise<void>
}

function formatValue(value: number, indicatorType: GoalIndicatorType, targetUnit: string | null): string {
  if (indicatorType === 'monetary') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  if (indicatorType === 'weight') {
    return `${value.toFixed(1)} kg`
  }
  if (indicatorType === 'percentage') {
    return `${value}%`
  }
  if (indicatorType === 'task') {
    return value > 0 ? 'Concluído' : 'Pendente'
  }
  if (targetUnit) {
    return `${value} ${targetUnit}`
  }
  return String(value)
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return '#10b981'
  if (progress >= 70) return '#10b981'
  if (progress >= 50) return '#f59e0b'
  return '#06b6d4'
}

export function GoalCard({ goal, onUpdateProgress, onDelete }: GoalCardProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(goal.current_value))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const progress = goal.progress
  const progressColor = getProgressColor(progress)
  const isCompleted = goal.status === 'completed'

  async function handleSave() {
    const newValue = parseFloat(inputValue)
    if (isNaN(newValue)) return
    setSaving(true)
    try {
      await onUpdateProgress(goal.id, newValue)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(goal.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn(
      'bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 transition-all',
      isCompleted && 'opacity-75',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <p className="text-[13px] font-semibold text-[var(--sl-t1)] leading-tight">{goal.name}</p>
          <span className="text-[10px] text-[var(--sl-t3)] font-medium">
            {MODULE_LABELS[goal.target_module as GoalModule]}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={() => setEditing(v => !v)}
              className="p-1.5 rounded-lg hover:bg-[var(--sl-s3)] transition-colors"
            >
              <TrendingUp size={14} className="text-[var(--sl-t2)]" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors"
          >
            <Trash2 size={14} className="text-[var(--sl-t3)] hover:text-[#f43f5e]" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[var(--sl-t3)]">
            {formatValue(goal.current_value, goal.indicator_type as GoalIndicatorType, goal.target_unit)}
            {goal.target_value && (
              <span className="text-[var(--sl-t3)]">
                {' '}/ {formatValue(goal.target_value, goal.indicator_type as GoalIndicatorType, goal.target_unit)}
              </span>
            )}
          </span>
          <span className="font-[DM_Mono] text-[12px] font-medium" style={{ color: progressColor }}>
            {progress}%
          </span>
        </div>
        <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: progressColor,
            }}
          />
        </div>
      </div>

      {/* Update progress inline — RN-FUT-17: UI por tipo de indicador */}
      {editing && !isCompleted && (
        <div className="mt-2 pt-2 border-t border-[var(--sl-border)]">
          {goal.indicator_type === 'task' ? (
            // Task: toggle simples
            <button
              onClick={async () => {
                setSaving(true)
                try {
                  await onUpdateProgress(goal.id, goal.current_value > 0 ? 0 : 1)
                  setEditing(false)
                } finally { setSaving(false) }
              }}
              disabled={saving}
              className={cn(
                'w-full py-2 rounded-[8px] text-[12px] font-semibold transition-colors border',
                goal.current_value > 0
                  ? 'bg-[var(--sl-s3)] text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                  : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/20',
              )}
            >
              {saving ? '...' : goal.current_value > 0 ? '↩ Marcar como pendente' : '✓ Marcar como concluída'}
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              {/* Contexto para peso */}
              {goal.indicator_type === 'weight' && goal.initial_value != null && goal.target_value != null && (
                <p className="text-[10px] text-[var(--sl-t3)]">
                  Partida: <strong className="font-[DM_Mono]">{goal.initial_value} kg</strong>
                  {' → '}
                  Alvo: <strong className="font-[DM_Mono]">{goal.target_value} kg</strong>
                  {' '}
                  <span>({goal.initial_value > goal.target_value ? '📉 perda' : '📈 ganho'})</span>
                </p>
              )}
              {/* Contexto para frequência */}
              {goal.indicator_type === 'frequency' && goal.target_value != null && (
                <p className="text-[10px] text-[var(--sl-t3)]">
                  Meta: <strong className="font-[DM_Mono]">{goal.target_value}</strong>
                  {goal.target_unit ? ` ${goal.target_unit}` : ' vezes no período'}
                </p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-[8px] text-[12px] font-medium
                             bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             outline-none focus:border-[#10b981] transition-colors"
                  placeholder={
                    goal.indicator_type === 'weight' ? 'Peso atual (kg)' :
                    goal.indicator_type === 'frequency' ? 'Qtd neste período' :
                    goal.indicator_type === 'monetary' ? 'Valor atual (R$)' :
                    'Novo valor'
                  }
                />
                {goal.target_unit && goal.indicator_type !== 'monetary' && (
                  <span className="text-[11px] text-[var(--sl-t3)] shrink-0">{goal.target_unit}</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold
                             bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? '...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-2.5 py-1.5 rounded-[8px] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s3)]"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] font-bold text-[#10b981]">Meta concluída!</span>
        </div>
      )}
    </div>
  )
}
