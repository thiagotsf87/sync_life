'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { fmtR$ } from '@/components/financas/helpers'

interface Occurrence {
  id: string
  name: string
  amount: number
  type: string
  icon: string
  day: number
  monthShort: string
  daysLeft: number
}

interface ProximasRecorrentesProps {
  upcomingOccurrences: Occurrence[]
}

export function ProximasRecorrentes({ upcomingOccurrences }: ProximasRecorrentesProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-6 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Próximas Recorrentes</p>
        <button onClick={() => router.push('/financas/recorrentes')} className="text-[11px] text-[#10b981] hover:underline">Ver todas</button>
      </div>
      {upcomingOccurrences.length === 0 ? (
        <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhuma recorrente prevista nos próximos 30 dias</p>
      ) : (
        <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
          {upcomingOccurrences.slice(0, 5).map(o => {
            const isOver = o.daysLeft === 0
            const isDue = o.daysLeft <= 3
            const statusBg = isOver ? 'rgba(244,63,94,.12)' : isDue ? 'rgba(245,158,11,.12)' : 'rgba(110,144,184,.10)'
            const statusColor = isOver ? '#f43f5e' : isDue ? '#f59e0b' : 'var(--sl-t3)'
            const statusLabel = isOver ? 'hoje' : `${o.day}/${o.monthShort}`
            return (
              <div
                key={o.id}
                className="flex flex-col gap-1.5 px-2.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{o.icon}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: statusBg, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[var(--sl-t1)] leading-tight">{o.name}</p>
                <p className={cn('font-[DM_Mono] text-[12px] font-medium', o.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                  R$ {fmtR$(o.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
