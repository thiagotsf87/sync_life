interface ProgressBarProps {
  value: number
  variant?: 'budget' | 'goal' | 'habit'
  height?: string
}

function getColor(value: number, variant: string): string {
  if (variant === 'goal') return 'linear-gradient(90deg, #10b981, #0055ff)'
  if (value > 85) return '#f43f5e'
  if (value > 70) return '#f59e0b'
  return '#10b981'
}

export function ProgressBar({ value, variant = 'budget', height = '5px' }: ProgressBarProps) {
  const color = getColor(value, variant)

  return (
    <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: color,
        }}
      />
    </div>
  )
}
