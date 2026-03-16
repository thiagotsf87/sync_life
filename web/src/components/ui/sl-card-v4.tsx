import { cn } from '@/lib/utils'

interface SLCardV4Props {
  accent?: string
  children: React.ReactNode
  hover?: boolean
  className?: string
}

export function SLCardV4({ accent, children, hover = true, className }: SLCardV4Props) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3 sl-fade-up',
        hover && 'transition-colors hover:border-[var(--sl-border-h)]',
        className
      )}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}
