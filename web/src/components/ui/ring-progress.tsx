import { cn } from '@/lib/utils'

interface RingProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  gradient?: boolean
  label?: string
}

export function RingProgress({
  value,
  size = 110,
  strokeWidth = 8,
  color = '#10b981',
  gradient = false,
  label,
}: RingProgressProps) {
  const r = (size / 2) - strokeWidth
  const dasharray = 2 * Math.PI * r
  const dashoffset = dasharray * (1 - value / 100)
  const gradId = `ring-grad-${Math.random().toString(36).slice(2)}`

  return (
    <div className="relative inline-flex justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0055ff" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--sl-s3)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={gradient ? `url(#${gradId})` : color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          style={{
            strokeDasharray: dasharray,
            strokeDashoffset: dashoffset,
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
          }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={cn(
          'font-[Syne] font-extrabold leading-none',
          gradient ? 'text-sl-grad' : '',
          size > 90 ? 'text-2xl' : 'text-lg'
        )} style={!gradient ? { color } : undefined}>
          {value}%
        </span>
        {label && (
          <span className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)]">{label}</span>
        )}
      </div>
    </div>
  )
}
