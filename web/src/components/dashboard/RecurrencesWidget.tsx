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
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🔄 Próximas Recorrentes</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/financas/recorrentes')}>Ver todas →</button>
      </div>
      {nextRecurrences.length === 0
        ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-4">Nenhuma recorrente</p>
        : (
          <div className="flex flex-col">
            {nextRecurrences.map((r, i) => {
              const isUrgent = r.daysLeft <= 5
              const statusColor = isUrgent ? '#f59e0b' : 'var(--sl-t3)'
              const statusBg = isUrgent ? 'rgba(245,158,11,0.12)' : 'rgba(110,144,184,0.10)'
              const statusLabel = r.daysLeft === 0 ? 'hoje' : `${r.daysLeft}d`
              return (
                <div key={r.id} className={cn('flex items-center justify-between py-2.5', i < nextRecurrences.length - 1 && 'border-b border-[var(--sl-border)]')}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-[8px] bg-[var(--sl-s3)] flex items-center justify-center text-[14px] flex-shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <div className="text-[13px] text-[var(--sl-t2)]">{r.name}</div>
                      <div className="text-[11px] text-[var(--sl-t3)]">
                        vence {r.daysLeft === 0 ? 'hoje' : `em ${r.daysLeft} ${r.daysLeft === 1 ? 'dia' : 'dias'}`}, {r.day}/{r.monthShort}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-[DM_Mono] text-[13px]" style={{ color: r.type === 'expense' ? '#f43f5e' : '#10b981' }}>
                      {r.type === 'expense' ? '-' : '+'}{fmt(r.amount)}
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] mt-0.5 inline-block"
                      style={{ background: statusBg, color: statusColor }}>{statusLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
