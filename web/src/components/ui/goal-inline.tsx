'use client'

import { cn } from '@/lib/utils'

/** Tipo de meta: lose = emagrecer, gain = engordar, maintain = manter. */
export type GoalDirection = 'lose' | 'gain' | 'maintain'

interface GoalInlineProps {
  startValue: number
  currentValue: number
  targetValue: number
  unit: string          // e.g. "kg"
  /** Direção da meta: lose para emagrecimento, gain para ganho de peso. */
  goalDirection?: GoalDirection
  estimatedDate?: string // e.g. "Jul 2026"
  className?: string
}

export function GoalInline({
  startValue,
  currentValue,
  targetValue,
  unit,
  goalDirection,
  estimatedDate,
  className,
}: GoalInlineProps) {
  const range = Math.abs(targetValue - startValue)
  let progress: number
  if (range <= 0) {
    progress = 100
  } else if (goalDirection === 'lose') {
    // Emagrecimento: target < start. Progresso = quanto do caminho start→target foi percorrido.
    // current > start = regrediu = 0%. current <= target = 100%.
    progress = (startValue - currentValue) / (startValue - targetValue) * 100
  } else if (goalDirection === 'gain') {
    // Ganho: target > start. Progresso = quanto do caminho start→target foi percorrido.
    // current < start = regrediu = 0%. current >= target = 100%.
    progress = (currentValue - startValue) / (targetValue - startValue) * 100
  } else {
    // Fallback: detecta direção pelo target vs start
    const isLoss = targetValue < startValue
    progress = isLoss
      ? (startValue - currentValue) / (startValue - targetValue) * 100
      : (currentValue - startValue) / (targetValue - startValue) * 100
  }
  progress = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn('bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">
          Progresso da Meta
        </span>
        {estimatedDate && (
          <span className="text-[11px] text-[var(--sl-t3)]">
            Est. {estimatedDate}
          </span>
        )}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-[var(--sl-t2)]">
          {startValue} {unit}
        </span>
        <span className="font-[DM_Mono] font-medium text-[14px] text-[#10b981]">
          {currentValue} {unit}
        </span>
        <span className="text-[12px] text-[var(--sl-t2)]">
          {targetValue} {unit}
        </span>
      </div>

      {/* Bar */}
      <div className="relative w-full h-[6px] bg-[var(--sl-s3)] rounded-full overflow-visible">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #10b981, #0055ff)',
          }}
        />
        {/* Dot marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-[3px] border-[var(--sl-bg)] bg-[#10b981] shadow-sm transition-[left] duration-1000"
          style={{ left: `calc(${Math.min(progress, 100)}% - 7px)` }}
        />
      </div>

      <div className="text-center mt-2">
        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
          {progress.toFixed(0)}% concluído
        </span>
      </div>
    </div>
  )
}
