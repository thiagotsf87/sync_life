'use client'

import { cn } from '@/lib/utils'

interface NextAppointmentHeroProps {
  day: string
  month: string
  specialty: string
  doctor: string
  location?: string
  time?: string
  daysUntil: number
  onReschedule?: () => void
  onCancel?: () => void
  className?: string
}

export function NextAppointmentHero({
  day,
  month,
  specialty,
  doctor,
  location,
  time,
  daysUntil,
  onReschedule,
  onCancel,
  className,
}: NextAppointmentHeroProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 px-8 py-7 bg-[var(--sl-s1)]',
        'border border-[rgba(249,115,22,.2)] rounded-2xl',
        'relative overflow-hidden sl-fade-up',
        className,
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-6 right-6 h-[2.5px] rounded-b bg-[#f97316]" />

      {/* Date */}
      <div className="text-center min-w-[64px]">
        <div className="text-[11px] font-bold uppercase tracking-[.08em] text-[#f97316]">
          {month}
        </div>
        <div className="font-[DM_Mono] text-[32px] font-medium leading-none">
          {day}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-[var(--sl-border)]" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-semibold mb-0.5">{specialty}</h3>
        <p className="text-[12px] text-[var(--sl-t2)]">
          {doctor}
          {location && <> &middot; {location}</>}
          {time && <> &middot; {time}</>}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {onReschedule && (
          <button
            onClick={onReschedule}
            className="px-4 py-2 rounded-[11px] text-[12px] font-semibold text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Remarcar
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[11px] text-[12px] font-semibold text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Countdown pill */}
      <div className="shrink-0 px-[10px] py-1 rounded-lg text-[11px] font-semibold bg-[rgba(249,115,22,.08)] text-[#f97316]">
        em {daysUntil} dias
      </div>
    </div>
  )
}
