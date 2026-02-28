'use client'

import { Trash2, MapPin, Calendar, Users } from 'lucide-react'
import type { Trip } from '@/hooks/use-experiencias'
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, TRIP_TYPE_LABELS, calcTripDays } from '@/hooks/use-experiencias'

interface TripCardProps {
  trip: Trip
  onClick?: () => void
  onDelete?: (id: string) => Promise<void>
}

export function TripCard({ trip, onClick, onDelete }: TripCardProps) {
  const days = calcTripDays(trip.start_date, trip.end_date)
  const statusColor = TRIP_STATUS_COLORS[trip.status]
  const now = new Date()
  const start = new Date(trip.start_date)
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isUpcoming = daysUntil > 0 && trip.status !== 'completed' && trip.status !== 'cancelled'

  return (
    <div
      className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 hover:border-[var(--sl-border-h)] transition-colors cursor-pointer sl-fade-up"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] truncate">{trip.name}</h3>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
              style={{ color: statusColor, background: statusColor + '20' }}
            >
              {TRIP_STATUS_LABELS[trip.status]}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--sl-t3)]">
            <MapPin size={10} />
            <span className="truncate">{trip.destinations.join(' → ')}</span>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(trip.id) }}
            className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors shrink-0"
          >
            <Trash2 size={12} className="text-[var(--sl-t3)]" />
          </button>
        )}
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 text-[11px] text-[var(--sl-t3)] flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar size={10} />
          <span>
            {new Date(trip.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            {' '}→{' '}
            {new Date(trip.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <span className="text-[var(--sl-s3)]">·</span>
        <span>{days} {days === 1 ? 'dia' : 'dias'}</span>
        <span className="text-[var(--sl-s3)]">·</span>
        <div className="flex items-center gap-1">
          <Users size={10} />
          <span>{trip.travelers_count} {trip.travelers_count === 1 ? 'viajante' : 'viajantes'}</span>
        </div>
        <span className="text-[var(--sl-s3)]">·</span>
        <span>{TRIP_TYPE_LABELS[trip.trip_type]}</span>
      </div>

      {/* Budget */}
      {trip.total_budget != null && (
        <div className="mt-3 pt-3 border-t border-[var(--sl-border)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--sl-t3)]">Orçamento</span>
            <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">
              {trip.total_budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          {trip.total_spent > 0 && (
            <>
              <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '3px' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((trip.total_spent / trip.total_budget) * 100, 100)}%`,
                    background: trip.total_spent > trip.total_budget ? '#f43f5e' : '#06b6d4',
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {trip.total_spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} gastos
              </p>
            </>
          )}
        </div>
      )}

      {/* Countdown */}
      {isUpcoming && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
          <span className="text-[11px] text-[#06b6d4] font-medium">
            {daysUntil === 1 ? 'Amanhã!' : `em ${daysUntil} dias`}
          </span>
        </div>
      )}
    </div>
  )
}
