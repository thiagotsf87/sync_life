import { cn } from '@/lib/utils'

interface RingProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

// Stable gradient ID per component — avoids Math.random() hydration mismatch.
// Consumers can pass a unique `label` or rely on the default; truly unique IDs
// require useId() in a 'use client' context, but a single shared ID is fine
// because there is only one gradient definition per SVG and it never collides
// across isolated SVG documents.
const GRAD_ID = 'sl-ring-grad'

export function RingProgress({
  value,
  size = 110,
  strokeWidth = 8,
  label,
  className,
}: RingProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const r = size / 2 - strokeWidth
  const dasharray = 2 * Math.PI * r
  const dashoffset = dasharray * (1 - clamped / 100)

  return (
    <div
      className={cn('relative inline-flex justify-center items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <defs>
          {/* --sl-grad = linear-gradient(135deg, #0F766E, #0B2D34) */}
          <linearGradient id={GRAD_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0B2D34" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc — always uses sl-grad per G-03 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${GRAD_ID})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: dasharray,
            strokeDashoffset: dashoffset,
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span
          className={cn(
            'font-[Space_Grotesk] font-bold leading-none tabular-nums text-[var(--sl-em)]',
            size > 90 ? 'text-2xl' : 'text-lg'
          )}
        >
          {clamped}%
        </span>
        {label && (
          <span className="text-[9px] font-[DM_Sans] uppercase tracking-wider text-[var(--sl-t3)]">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
