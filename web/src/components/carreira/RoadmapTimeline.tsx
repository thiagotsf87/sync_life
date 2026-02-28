'use client'

import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { CareerRoadmap, RoadmapStep, StepStatus } from '@/hooks/use-carreira'

interface RoadmapTimelineProps {
  roadmap: CareerRoadmap
  onUpdateStep?: (stepId: string, roadmapId: string, status: StepStatus) => Promise<void>
}

const STATUS_NEXT: Record<StepStatus, StepStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

const STATUS_COLORS: Record<StepStatus, string> = {
  pending: '#6e90b8',
  in_progress: '#f59e0b',
  completed: '#10b981',
}

export function RoadmapTimeline({ roadmap, onUpdateStep }: RoadmapTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [updatingStep, setUpdatingStep] = useState<string | null>(null)

  const steps = roadmap.steps ?? []

  async function handleStepClick(step: RoadmapStep) {
    if (!onUpdateStep) return
    const next = STATUS_NEXT[step.status]
    setUpdatingStep(step.id)
    try {
      await onUpdateStep(step.id, roadmap.id, next)
    } finally {
      setUpdatingStep(null)
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Origin node */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#10b981]">Agora</p>
          <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{roadmap.current_title}</p>
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, idx) => {
        const color = STATUS_COLORS[step.status]
        const isExpanded = expandedStep === step.id
        const isLast = idx === steps.length - 1
        const isUpdating = updatingStep === step.id

        return (
          <div key={step.id} className="flex gap-3">
            {/* Timeline line + node */}
            <div className="flex flex-col items-center" style={{ minWidth: '20px' }}>
              <div className="w-px flex-1 bg-[var(--sl-border)]" style={{ minHeight: '12px' }} />
              <button
                onClick={() => handleStepClick(step)}
                disabled={isUpdating || !onUpdateStep}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                  step.status === 'completed' ? 'border-[#10b981] bg-[#10b981]' : '',
                  step.status === 'in_progress' ? 'border-[#f59e0b] bg-[#f59e0b]/20' : '',
                  step.status === 'pending' ? 'border-[var(--sl-border)] bg-[var(--sl-s2)]' : '',
                  onUpdateStep && 'cursor-pointer hover:scale-110',
                  isUpdating && 'opacity-50'
                )}
              >
                {step.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                {step.status === 'in_progress' && <Clock size={10} className="text-[#f59e0b]" />}
                {step.status === 'pending' && <Circle size={10} className="text-[var(--sl-t3)]" />}
              </button>
              {!isLast && <div className="w-px flex-1 bg-[var(--sl-border)]" style={{ minHeight: '12px' }} />}
            </div>

            {/* Step content */}
            <div className={cn(
              'flex-1 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl mb-2 overflow-hidden transition-all',
              isExpanded && 'border-[var(--sl-border-h)]'
            )}>
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'text-[13px] font-medium truncate',
                      step.status === 'completed' ? 'text-[var(--sl-t3)] line-through' : 'text-[var(--sl-t1)]'
                    )}>
                      {step.title}
                    </p>
                    <span
                      className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ color, background: color + '20' }}
                    >
                      {step.status === 'completed' ? 'Feito' : step.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                    </span>
                  </div>
                  {step.target_date && (
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      Até {new Date(step.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp size={14} className="text-[var(--sl-t3)] shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={14} className="text-[var(--sl-t3)] shrink-0 ml-2" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-[var(--sl-border)]">
                  {step.description && (
                    <p className="text-[12px] text-[var(--sl-t2)] mt-2 mb-2">{step.description}</p>
                  )}
                  {onUpdateStep && (
                    <div className="flex gap-2 mt-2">
                      {(['pending', 'in_progress', 'completed'] as StepStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => onUpdateStep(step.id, roadmap.id, s)}
                          className={cn(
                            'flex-1 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all border',
                            step.status === s
                              ? 'text-white border-transparent'
                              : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                          )}
                          style={step.status === s ? { background: STATUS_COLORS[s] } : undefined}
                        >
                          {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em andamento' : 'Concluído'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Connection to last steps */}
      {steps.length > 0 && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center" style={{ minWidth: '20px' }}>
            <div className="w-px bg-[var(--sl-border)]" style={{ height: '12px' }} />
          </div>
          <div />
        </div>
      )}

      {/* Target node */}
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: roadmap.status === 'completed' ? '#10b981' : '#0055ff',
            background: roadmap.status === 'completed' ? '#10b981' : 'transparent',
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{
            background: roadmap.status === 'completed' ? 'white' : '#0055ff',
          }} />
        </div>
        <div>
          <p className="text-[12px] font-bold" style={{ color: roadmap.status === 'completed' ? '#10b981' : '#0055ff' }}>
            Destino
          </p>
          <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{roadmap.target_title}</p>
          {roadmap.target_salary && (
            <p className="text-[11px] text-[var(--sl-t3)]">
              💰 {roadmap.target_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
