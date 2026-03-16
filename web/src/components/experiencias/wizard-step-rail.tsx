'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface WizardStep {
  id: string
  title: string
  description: string
}

interface WizardStepRailProps {
  steps: WizardStep[]
  currentStep: number // 0-indexed
  className?: string
}

export function WizardStepRail({ steps, currentStep, className }: WizardStepRailProps) {
  return (
    <div className={cn('pt-2', className)}>
      {steps.map((step, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="flex items-start gap-[14px] py-[14px] relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-[42px] bottom-0 w-[2px] bg-[var(--sl-s3)]"
              />
            )}

            {/* Step number / check */}
            <div
              className={cn(
                'w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0',
                'font-[DM_Mono] text-[13px] font-medium border-2 z-[1] transition-all',
                isDone && 'border-[#10b981] bg-[#10b981] text-white',
                isActive && 'border-[#ec4899] bg-[rgba(236,72,153,.08)] text-[#ec4899]',
                !isDone && !isActive && 'border-[var(--sl-s3)] bg-[var(--sl-bg)] text-[var(--sl-t3)]',
              )}
            >
              {isDone ? <Check size={14} strokeWidth={2.5} /> : i + 1}
            </div>

            {/* Text */}
            <div className="pt-[5px]">
              <div
                className={cn(
                  'font-semibold text-[13px] transition-colors',
                  isDone && 'text-[#10b981]',
                  isActive && 'text-[var(--sl-t1)]',
                  !isDone && !isActive && 'text-[var(--sl-t3)]',
                )}
              >
                {step.title}
              </div>
              <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                {step.description}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
