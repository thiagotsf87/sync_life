import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
}

export function KpiCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  accent,
  icon: Icon,
  className,
}: KpiCardProps) {
  const deltaColor = {
    up:      'text-[var(--sl-success)]',
    down:    'text-[var(--sl-danger)]',
    warn:    'text-[var(--sl-warning)]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div
      className={cn(
        'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 overflow-hidden',
        'transition-colors duration-200 hover:border-[var(--sl-border-h)]',
        className
      )}
    >
      {/* Left accent border */}
      {accent && (
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r"
          style={{ background: accent }}
        />
      )}

      {/* Header row: label + icon */}
      <div className="flex items-center justify-between mb-2">
        <p
          className="font-[DM_Sans] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]"
        >
          {label}
        </p>
        {Icon && (
          <span style={accent ? { color: accent } : undefined} className={!accent ? 'text-[var(--sl-t3)]' : undefined}>
            <Icon size={16} />
          </span>
        )}
      </div>

      {/* Value */}
      <p className="sl-num-strong text-xl text-[var(--sl-t1)] leading-none">
        {value}
      </p>

      {/* Delta */}
      {delta && (
        <p className={cn('font-[DM_Sans] text-[11px] mt-1.5', deltaColor)}>
          {delta}
        </p>
      )}
    </div>
  )
}
