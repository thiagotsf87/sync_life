'use client'

import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_GRAD } from '@/lib/exp-colors'
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, calcTripDays } from '@/hooks/use-experiencias'

interface ExpTabOverviewProps {
  trip: {
    name: string
    destinations: string[]
    start_date: string
    end_date: string
    status: string
    total_budget: number | null
    total_spent: number
    trip_type: string
    travelers_count: number
  }
  checklistPct: number
}

export function ExpTabOverview({ trip, checklistPct }: ExpTabOverviewProps) {
  const accent = EXP_PRIMARY
  const days = calcTripDays(trip.start_date, trip.end_date)
  const budgetPct = (trip.total_budget ?? 0) > 0 ? Math.round(trip.total_spent / (trip.total_budget ?? 1) * 100) : 0
  const remaining = (trip.total_budget ?? 0) - trip.total_spent

  return (
    <div className="px-4 pt-3">
      {/* Status banner */}
      <div
        className="rounded-[16px] p-4 mb-3"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(236,72,153,0.04))',
          border: '1px solid rgba(236,72,153,0.2)',
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)]">{trip.name}</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-1">{trip.destinations.join(' · ')}</p>
          </div>
          <span
            className="inline-flex items-center px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
            style={{ background: `${TRIP_STATUS_COLORS[trip.status as keyof typeof TRIP_STATUS_COLORS] ?? '#f59e0b'}1e`, color: TRIP_STATUS_COLORS[trip.status as keyof typeof TRIP_STATUS_COLORS] ?? '#f59e0b' }}
          >
            {TRIP_STATUS_LABELS[trip.status as keyof typeof TRIP_STATUS_LABELS] ?? trip.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-[var(--sl-t2)] uppercase">Duração</p>
            <p className="font-[DM_Mono] text-[15px] font-bold text-[var(--sl-t1)]">{days} dias</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--sl-t2)] uppercase">Viajantes</p>
            <p className="text-[15px] font-bold text-[var(--sl-t1)]">{trip.travelers_count}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--sl-t2)] uppercase">Checklist</p>
            <p className="font-[DM_Mono] text-[15px] font-bold" style={{ color: checklistPct >= 80 ? '#10b981' : '#f59e0b' }}>{checklistPct}%</p>
          </div>
        </div>
      </div>

      {/* Budget summary */}
      <div className="rounded-[16px] p-4 mb-3"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
        <p className="text-[12px] text-[var(--sl-t2)] mb-2">Orçamento</p>
        <div className="flex justify-between items-end mb-2">
          <p className="font-[DM_Mono] text-[22px] font-bold text-[var(--sl-t1)]">
            R$ {trip.total_spent.toLocaleString('pt-BR')}
          </p>
          <p className="text-[12px] text-[var(--sl-t2)]">
            de R$ {(trip.total_budget ?? 0).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="h-[8px] rounded-[4px] overflow-hidden mb-2" style={{ background: 'var(--sl-s3)' }}>
          <div className="h-full rounded-[4px]" style={{
            width: `${Math.min(budgetPct, 100)}%`,
            background: EXP_GRAD,
          }} />
        </div>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: EXP_PRIMARY_LIGHT }}>{budgetPct}% guardado</span>
          {remaining > 0 && <span style={{ color: '#f59e0b' }}>Faltam R$ {remaining.toLocaleString('pt-BR')}</span>}
        </div>
      </div>

      {/* Info grid */}
      <div className="rounded-[16px] p-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
        <div className="flex flex-col gap-[10px]">
          {[
            { label: 'Período', value: `${new Date(trip.start_date).toLocaleDateString('pt-BR')} — ${new Date(trip.end_date).toLocaleDateString('pt-BR')}` },
            { label: 'Tipo', value: trip.trip_type || '—' },
            { label: 'Viajantes', value: `${trip.travelers_count}` },
          ].map((row, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-[12px] text-[var(--sl-t2)]">{row.label}</span>
              <span className="text-[12px] text-[var(--sl-t1)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
