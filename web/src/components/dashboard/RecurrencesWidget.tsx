'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { fmt } from '@/components/dashboard/dashboard-utils'

interface Recurrence {
  id: string
  name: string
  icon: string
  type: string
  amount: number
  daysLeft: number
  day: number
  monthShort: string
}

export interface RecurrencesWidgetProps {
  nextRecurrences: Recurrence[]
}

export function RecurrencesWidget({ nextRecurrences }: RecurrencesWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-[18px] sl-fade-up hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center gap-2 mb-[14px]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
        <span className="text-[12px] font-semibold text-[var(--sl-t2)]">Recorrentes · Próx. 5 dias</span>
      </div>
      {nextRecurrences.length === 0
        ? <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhuma recorrente</p>
        : (
          <div className="flex flex-col">
            {nextRecurrences.map((r, i) => (
              <div key={r.id} className={cn('flex items-center justify-between py-[5px] text-[12px]', i < nextRecurrences.length - 1 && 'border-b border-[rgba(120,165,220,.04)]')}>
                <span className="text-[var(--sl-t2)]">{r.name}</span>
                <span className="font-[DM_Mono] text-[12px]" style={{ color: r.type === 'expense' ? '#f43f5e' : '#10b981' }}>
                  {r.type === 'expense' ? '- ' : '+ '}{fmt(r.amount)}
                </span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
