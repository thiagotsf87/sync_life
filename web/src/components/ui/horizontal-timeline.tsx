'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export type TimelineStepStatus = 'done' | 'current' | 'pending'

interface TimelineStep {
  label: string
  date?: string
  status: TimelineStepStatus
}

interface HorizontalTimelineProps {
  steps: TimelineStep[]
  progressPercent: number
  accentColor?: string
  className?: string
}

export function HorizontalTimeline({
  steps,
  progressPercent,
  accentColor = '#10b981',
  className,
}: HorizontalTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div className={cn('w-full', className)}>
      {/* Track */}
      <div className="relative h-[6px] bg-[var(--sl-s3)] rounded-full mb-4">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: `${Math.min(progressPercent, 100)}%`,
            background: `linear-gradient(90deg, ${accentColor}, #0055ff)`,
          }}
        />
        {/* Nodes */}
        <div className="absolute inset-0 flex items-center justify-between">
          {steps.map((step, i) => {
            const isDone = step.status === 'done'
            const isCurrent = step.status === 'current'

            return (
              <div
                key={i}
                className="relative flex flex-col items-center"
                style={{
                  left: steps.length === 1 ? '0%' : undefined,
                }}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center border-2 -mt-[7px]',
                    isDone && 'border-transparent',
                    isCurrent && 'border-[var(--sl-bg)] shadow-[0_0_0_3px]',
                    !isDone && !isCurrent && 'border-[var(--sl-s3)] bg-[var(--sl-s3)]'
                  )}
                  style={{
                    background: isDone || isCurrent ? accentColor : undefined,
                    ...(isCurrent ? { boxShadow: `0 0 0 3px ${accentColor}33` } : {}),
                  }}
                >
                  {isDone && <Check className="w-3 h-3 text-white" />}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center max-w-[100px]">
            <span
              className={cn(
                'text-[11px] font-medium leading-tight',
                step.status === 'done' && 'text-[var(--sl-t2)]',
                step.status === 'current' && 'text-[var(--sl-t1)] font-semibold',
                step.status === 'pending' && 'text-[var(--sl-t3)]'
              )}
            >
              {step.label}
            </span>
            {step.date && (
              <span className="text-[10px] text-[var(--sl-t3)] mt-0.5">{step.date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
