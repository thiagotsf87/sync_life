import { cn } from '@/lib/utils'

interface SLCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function SLCard({ children, className, hover = true }: SLCardProps) {
  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5',
      'sl-fade-up',
      hover && 'transition-colors hover:border-[var(--sl-border-h)]',
      'shadow-none .light_&:shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}
