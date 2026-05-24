interface ProgressBarProps {
  value: number        // 0-100
  variant?: 'budget' | 'goal' | 'habit'
  height?: string      // default '5px'
  showLabel?: boolean
  className?: string
}

function getProgressColor(pct: number): string {
  if (pct > 85) return 'var(--sl-danger)'
  if (pct > 70) return 'var(--sl-warning)'
  return 'var(--sl-success)'
}

export function ProgressBar({
  value,
  variant = 'budget',
  height = '5px',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const background =
    variant === 'goal'
      ? 'var(--sl-grad)'
      : getProgressColor(clamped)

  return (
    <div className={className}>
      <div
        className="w-full overflow-hidden"
        style={{
          height,
          borderRadius: '3px',
          background: 'var(--sl-s3)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            borderRadius: '3px',
            background,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-[11px] font-[DM_Sans] text-[var(--sl-t3)] mt-1 block tabular-nums"
        >
          {clamped}%
        </span>
      )}
    </div>
  )
}
