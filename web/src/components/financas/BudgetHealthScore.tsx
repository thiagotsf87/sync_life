'use client'

import { cn } from '@/lib/utils'

// ─── BUDGET HEALTH SCORE ───────────────────────────────────────────────────────
// Visual indicator showing overall budget health as colored dots (4 levels)
// Used in Finanças Dashboard and Orçamentos pages

interface BudgetHealthScoreProps {
  /** Array of budget utilization percentages (0-100+) */
  budgetPercentages: number[]
  /** Compact mode for mobile */
  compact?: boolean
  className?: string
}

type HealthLevel = 'excellent' | 'good' | 'warning' | 'danger'

const HEALTH_CONFIG: Record<HealthLevel, { color: string; label: string; emoji: string }> = {
  excellent: { color: '#10b981', label: 'Excelente',  emoji: '🟢' },
  good:      { color: '#06b6d4', label: 'Bom',        emoji: '🔵' },
  warning:   { color: '#f59e0b', label: 'Atenção',    emoji: '🟡' },
  danger:    { color: '#f43f5e', label: 'Crítico',     emoji: '🔴' },
}

function getHealthLevel(percentages: number[]): HealthLevel {
  if (percentages.length === 0) return 'good'

  const avg = percentages.reduce((s, p) => s + p, 0) / percentages.length
  const overBudget = percentages.filter(p => p >= 100).length
  const nearLimit = percentages.filter(p => p >= 85 && p < 100).length

  if (overBudget > 0) return 'danger'
  if (nearLimit >= 2 || avg > 80) return 'warning'
  if (avg <= 60) return 'excellent'
  return 'good'
}

export function BudgetHealthScore({ budgetPercentages, compact = false, className }: BudgetHealthScoreProps) {
  const level = getHealthLevel(budgetPercentages)
  const config = HEALTH_CONFIG[level]
  const levels: HealthLevel[] = ['excellent', 'good', 'warning', 'danger']
  const activeIdx = levels.indexOf(level)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Dots */}
      <div className="flex items-center gap-1">
        {levels.map((l, i) => (
          <div
            key={l}
            className={cn(
              'rounded-full transition-all',
              compact ? 'w-2 h-2' : 'w-2.5 h-2.5',
              i <= activeIdx ? 'opacity-100' : 'opacity-20',
            )}
            style={{ background: i <= activeIdx ? config.color : 'var(--sl-t3)' }}
          />
        ))}
      </div>

      {/* Label */}
      {!compact && (
        <span
          className="text-[11px] font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}

// ─── BUDGET HEALTH CARD — larger display for dashboard ─────────────────────────

interface BudgetHealthCardProps {
  budgetPercentages: number[]
  totalBudgets: number
  respected: number
  className?: string
}

export function BudgetHealthCard({ budgetPercentages, totalBudgets, respected, className }: BudgetHealthCardProps) {
  const level = getHealthLevel(budgetPercentages)
  const config = HEALTH_CONFIG[level]

  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4',
      'transition-colors hover:border-[var(--sl-border-h)]',
      className,
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">
          Saúde dos Orçamentos
        </p>
        <BudgetHealthScore budgetPercentages={budgetPercentages} />
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-[28px]">{config.emoji}</span>
        <span className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)]">
          {config.label}
        </span>
      </div>

      <p className="text-[12px] text-[var(--sl-t2)]">
        <span className="font-[DM_Mono] font-medium" style={{ color: config.color }}>
          {respected}/{totalBudgets}
        </span>
        {' '}orçamentos respeitados este mês
      </p>
    </div>
  )
}
