import { cn } from '@/lib/utils'

interface InlineSparklineProps {
  values: number[]
  color?: string
  height?: number
  barWidth?: number
  className?: string
}

export function InlineSparkline({
  values,
  color = '#10b981',
  height = 36,
  barWidth = 16,
  className,
}: InlineSparklineProps) {
  if (!values.length) return null

  const max = Math.max(...values, 1)
  const count = values.length

  return (
    <div
      className={cn('inline-flex items-end gap-[3px]', className)}
      style={{ height }}
    >
      {values.map((v, i) => {
        const pct = (v / max) * 100
        const opacity = count === 1 ? 1 : 0.3 + (i / (count - 1)) * 0.7

        return (
          <div
            key={i}
            className="rounded-sm transition-[height] duration-500"
            style={{
              width: barWidth,
              height: `${Math.max(pct, 4)}%`,
              background: color,
              opacity,
            }}
          />
        )
      })}
    </div>
  )
}
