import { cn } from '@/lib/utils'

interface SLCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function SLCard({ children, className, hover = true }: SLCardProps) {
  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6',
      'sl-fade-up',
      hover && 'transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.15)]',
      'shadow-sm dark:shadow-none',
      className
    )}>
      {children}
    </div>
  )
}
