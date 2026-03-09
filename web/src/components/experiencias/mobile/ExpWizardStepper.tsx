'use client'

import { Check } from 'lucide-react'
import { EXP_PRIMARY, EXP_PRIMARY_GLOW } from '@/lib/exp-colors'

interface ExpWizardStepperProps {
  currentStep: number
}

const STEP_LABELS = ['Destino', 'Companhia', 'Datas', 'Orçamento', 'Revisão']

export function ExpWizardStepper({ currentStep }: ExpWizardStepperProps) {
  const accent = EXP_PRIMARY
  const glow = EXP_PRIMARY_GLOW

  return (
    <div className="flex items-center justify-center px-4 pb-[14px]">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const isDone = step < currentStep
        const isCurrent = step === currentStep
        const isPending = step > currentStep

        return (
          <div key={i} className="contents">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
                style={
                  isDone
                    ? { background: '#10b981', color: '#fff' }
                    : isCurrent
                    ? { background: accent, color: '#fff', boxShadow: `0 0 12px ${glow}` }
                    : { background: 'var(--sl-s2)', color: 'var(--sl-t3)', border: '1px solid var(--sl-border)' }
                }
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : step}
              </div>
              <span
                className="text-[9px] text-center max-w-[48px]"
                style={{ color: isCurrent ? accent : 'var(--sl-t2)' }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className="flex-1 h-[2px] mx-1 mb-[14px]"
                style={{ background: isDone ? '#10b981' : 'var(--sl-border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
