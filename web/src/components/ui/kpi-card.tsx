import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent?: string
}

export function KpiCard({ label, value, delta, deltaType = 'neutral', accent = '#10b981' }: KpiCardProps) {
  const deltaColor = {
    up:      'text-[#10b981]',
    down:    'text-[#f43f5e]',
    warn:    'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden
                    transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
      {/* Accent bar at top */}
      <div
        className="absolute top-0 left-5 right-5 h-0.5 rounded-b"
        style={{ background: accent }}
      />
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
        {label}
      </p>
      <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">
        {value}
      </p>
      {delta && (
        <p className={cn('text-[11px] mt-1', deltaColor)}>{delta}</p>
      )}
    </div>
  )
}
