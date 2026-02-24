'use client'

import { cn } from '@/lib/utils'
import type { GoalMilestone } from '@/hooks/use-metas'

interface MilestoneTimelineProps {
  milestones: GoalMilestone[]
  currentPct: number
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
}

export function MilestoneTimeline({ milestones, currentPct }: MilestoneTimelineProps) {
  if (milestones.length === 0) return null

  const sorted = [...milestones].sort((a, b) => a.target_pct - b.target_pct)

  return (
    <div className="relative pl-6">
      {/* Linha vertical */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--sl-border)]" />

      <div className="flex flex-col gap-5">
        {sorted.map((ms, idx) => {
          const reached = ms.reached_at !== null
          const isCurrent = !reached && currentPct >= ms.target_pct - 25 && currentPct < ms.target_pct
          const isPast = reached

          return (
            <div key={ms.id} className="relative flex items-start gap-3">
              {/* Dot */}
              <div className={cn(
                'absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                isPast
                  ? 'border-[#10b981] bg-[#10b981]'
                  : isCurrent
                  ? 'border-[#f59e0b] bg-[var(--sl-s2)]'
                  : 'border-[var(--sl-border)] bg-[var(--sl-s2)]',
              )}>
                {isPast ? (
                  <span className="text-[10px] text-white font-bold">✓</span>
                ) : (
                  <span className={cn(
                    'text-[9px] font-[DM_Mono] font-bold',
                    isCurrent ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]',
                  )}>
                    {ms.target_pct}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    'text-[13px] font-semibold leading-tight',
                    isPast ? 'text-[#10b981]' : isCurrent ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]',
                  )}>
                    {ms.name}
                  </p>
                  <span className={cn(
                    'text-[10px] font-[DM_Mono] font-bold px-1.5 py-0.5 rounded-md shrink-0',
                    isPast
                      ? 'bg-[rgba(16,185,129,.12)] text-[#10b981]'
                      : isCurrent
                      ? 'bg-[rgba(245,158,11,.12)] text-[#f59e0b]'
                      : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]',
                  )}>
                    {ms.target_pct}%
                  </span>
                </div>
                {ms.reached_at && (
                  <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                    Alcançado em {formatDate(ms.reached_at)}
                  </p>
                )}
                {isCurrent && !reached && (
                  <p className="text-[11px] text-[#f59e0b] mt-0.5">Em progresso...</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
