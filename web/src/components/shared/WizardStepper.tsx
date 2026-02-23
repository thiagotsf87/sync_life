'use client'

import { Check } from 'lucide-react'

interface WizardStepperProps {
  steps: { id: number; label: string }[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="ob-progress">
      {steps.map(({ id, label }) => {
        const isActive = id === currentStep
        const isDone = id < currentStep
        return (
          <div
            key={id}
            className={`ob-step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
            onClick={isDone && onStepClick ? () => onStepClick(id) : undefined}
            style={isDone && onStepClick ? { cursor: 'pointer' } : undefined}
          >
            <div className="ob-dot">
              {isDone ? <Check size={12} /> : id}
            </div>
            <span className="ob-step-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
