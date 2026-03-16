'use client'

import { fmt } from '@/components/dashboard/dashboard-utils'

interface SparklinePoint {
  day: string
  saldo: number
}

interface Recurrence {
  name: string
  amount: number
  daysLeft: number
}

export interface ProjectionWidgetProps {
  sparklineData: SparklinePoint[]
  balance: number
  projectedBalance: number
  nextRecurrence: Recurrence | undefined
}

export function ProjectionWidget({ sparklineData, balance, projectedBalance, nextRecurrence }: ProjectionWidgetProps) {
  const projDate = new Date()
  projDate.setDate(projDate.getDate() + 30)
  const projLabel = projDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-[18px] sl-fade-up sl-delay-1 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center gap-2 mb-[14px]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
        <span className="text-[12px] font-semibold text-[var(--sl-t2)]">Projeção 30 dias</span>
      </div>
      <div className="text-center py-2.5">
        <div className="font-[DM_Mono] font-medium text-[28px]" style={{ color: '#10b981' }}>{fmt(projectedBalance)}</div>
        <div className="text-[11px] text-[var(--sl-t3)] mt-1">Saldo projetado em {projLabel}</div>
      </div>
    </div>
  )
}
