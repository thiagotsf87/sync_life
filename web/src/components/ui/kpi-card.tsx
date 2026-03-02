import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent?: string
  icon?: string
  iconBg?: string
  barPct?: number
  barBg?: string
  delay?: string
}

export function KpiCard({ label, value, delta, deltaType = 'neutral', accent = '#10b981', icon, iconBg, barPct, barBg, delay }: KpiCardProps) {
  const deltaColor = {
    up:      'text-[#10b981]',
    down:    'text-[#f43f5e]',
    warn:    'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className={cn(
      'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden',
      'p-5 max-sm:p-3',
      'transition-colors hover:border-[var(--sl-border-h)] sl-fade-up',
      delay
    )}>
      {/* Accent bar at top */}
      <div
        className="absolute top-0 left-5 right-5 max-sm:left-3 max-sm:right-3 h-0.5 rounded-b"
        style={{ background: accent }}
      />

      {/* Icon + Label */}
      <div className="flex items-center gap-2 mb-1.5">
        {icon && (
          <div
            className="w-7 h-7 max-sm:w-6 max-sm:h-6 rounded-lg flex items-center justify-center text-sm max-sm:text-xs shrink-0"
            style={{ background: iconBg || 'rgba(16,185,129,0.12)' }}
          >
            {icon}
          </div>
        )}
        <p className="text-[10px] font-bold uppercase tracking-widest max-sm:tracking-wider text-[var(--sl-t3)]">
          {label}
        </p>
      </div>

      {/* Value */}
      <p className="font-[DM_Mono] font-medium text-xl max-sm:text-lg text-[var(--sl-t1)] leading-none truncate">
        {value}
      </p>

      {/* Delta */}
      {delta && (
        <p className={cn('text-[11px] mt-1 truncate', deltaColor)}>{delta}</p>
      )}

      {/* Optional progress bar */}
      {barPct !== undefined && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${Math.min(100, barPct)}%`, background: barBg || accent }}
          />
        </div>
      )}
    </div>
  )
}
