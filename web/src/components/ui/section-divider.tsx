import { cn } from '@/lib/utils'

interface SectionDividerProps {
  spacing?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SPACING = {
  sm: 'my-3',
  md: 'my-5',
  lg: 'my-8',
} as const

export function SectionDivider({ spacing = 'md', label, className }: SectionDividerProps) {
  const spacingClass = SPACING[spacing]

  if (label) {
    return (
      <div className={cn('flex items-center gap-3', spacingClass, className)}>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--sl-border) 20%, var(--sl-border) 80%, transparent)' }}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] shrink-0">
          {label}
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--sl-border) 20%, var(--sl-border) 80%, transparent)' }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn('h-px', spacingClass, className)}
      style={{ background: 'linear-gradient(90deg, transparent, var(--sl-border) 20%, var(--sl-border) 80%, transparent)' }}
    />
  )
}
