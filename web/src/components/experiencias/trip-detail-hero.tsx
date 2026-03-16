'use client'

import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface MetricItem {
  label: string
  value: string
  color?: string
}

interface TripDetailHeroProps {
  title: string
  status: string
  statusColor: string
  destination: string
  dates: string
  duration: string
  travelers: string
  type: string
  metrics: MetricItem[]
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function TripDetailHero({
  title,
  status,
  statusColor,
  destination,
  dates,
  duration,
  travelers,
  type,
  metrics,
  onEdit,
  onDelete,
  className,
}: TripDetailHeroProps) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-8 py-7 relative overflow-hidden',
        'sl-fade-up sl-delay-1',
        className,
      )}
    >
      {/* Bottom gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-60"
        style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #ec4899)' }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[10px] mb-1.5">
            <h1 className="font-[Syne] font-extrabold text-[24px]">{title}</h1>
            <span
              className="px-[10px] py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: `${statusColor}18`, color: statusColor }}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[var(--sl-t2)]">
            <span>{destination}</span>
            <span className="text-[var(--sl-t3)]">&middot;</span>
            <span>{dates}</span>
            <span className="text-[var(--sl-t3)]">&middot;</span>
            <span>{duration}</span>
            <span className="text-[var(--sl-t3)]">&middot;</span>
            <span>{travelers}</span>
            <span className="text-[var(--sl-t3)]">&middot;</span>
            <span>{type}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-[14px] py-2 rounded-[10px] text-[12px] font-semibold text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-[10px] border border-[var(--sl-border)] flex items-center justify-center text-[#f43f5e] hover:border-[#f43f5e] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics strip */}
      <div className="flex items-center gap-0 mt-5 pt-4 border-t border-[var(--sl-border)]">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex-1 text-center relative">
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-9 bg-[var(--sl-border)]" />
            )}
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">
              {m.label}
            </div>
            <div
              className="font-[DM_Mono] text-[20px] font-medium"
              style={m.color ? { color: m.color } : undefined}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
