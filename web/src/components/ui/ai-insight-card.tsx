import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  icon?: string
  label?: string
  children: React.ReactNode
  className?: string
}

export function AIInsightCard({
  icon = '🤖',
  label = 'Insight IA',
  children,
  className,
}: AIInsightCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-[16px] p-[14px_16px] border',
        'bg-[linear-gradient(135deg,rgba(99,102,241,0.07),rgba(0,85,255,0.07))]',
        'border-[rgba(99,102,241,0.2)]',
        className,
      )}
    >
      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(99,102,241,0.15)] text-[16px]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6366f1] mb-1">
          {label}
        </p>
        <div className="text-[13px] text-[var(--sl-t2)] leading-[1.5] [&_strong]:text-[var(--sl-t1)]">
          {children}
        </div>
      </div>
    </div>
  )
}
