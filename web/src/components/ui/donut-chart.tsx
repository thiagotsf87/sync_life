'use client'

import { cn } from '@/lib/utils'

interface DonutSegment {
  value: number
  color: string
  label: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  centerLabel?: string
  centerSub?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function DonutChart({
  segments,
  centerLabel,
  centerSub,
  size = 140,
  strokeWidth = 14,
  className,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  let cumulativeOffset = 0

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sl-s3)"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0
          const dashLength = pct * circumference
          const gapLength = circumference - dashLength
          const currentOffset = cumulativeOffset
          cumulativeOffset += dashLength

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={-currentOffset}
              className="transition-[stroke-dasharray,stroke-dashoffset] duration-700"
            />
          )
        })}
      </svg>

      {/* Center label */}
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
          {centerLabel && (
            <span className="font-[DM_Mono] font-medium text-[22px] leading-none text-[var(--sl-t1)]">
              {centerLabel}
            </span>
          )}
          {centerSub && (
            <span className="text-[10px] text-[var(--sl-t3)] mt-1">{centerSub}</span>
          )}
        </div>
      )}
    </div>
  )
}

/* Inline legend helper */
interface DonutLegendProps {
  segments: DonutSegment[]
  className?: string
}

export function DonutLegend({ segments, className }: DonutLegendProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: seg.color }}
          />
          <span className="text-[11px] text-[var(--sl-t2)] flex-1">{seg.label}</span>
          <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">
            {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  )
}
