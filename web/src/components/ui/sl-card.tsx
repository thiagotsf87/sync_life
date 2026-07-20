import { cn } from '@/lib/utils'

interface SLCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  hero?: boolean
  noPadding?: boolean
}

export function SLCard({
  children,
  className,
  hover = false,
  hero = false,
  noPadding = false,
}: SLCardProps) {
  return (
    <div
      className={cn(
        'border border-[var(--sl-border)] rounded-[16px] transition-colors duration-200',
        hero ? 'bg-[var(--sl-s-hero)]' : 'bg-[var(--sl-s1)]',
        !noPadding && 'p-6',
        hover && 'hover:border-[var(--sl-border-h)] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
