import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  icon?: React.ReactNode
  label?: string
  children: React.ReactNode
  className?: string
}

export function AIInsightCard({
  icon,
  label = 'Insight IA',
  children,
  className,
}: AIInsightCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-[16px] p-[14px_16px] border',
        'bg-[linear-gradient(135deg,rgba(107,111,212,0.07),rgba(0,85,255,0.07))]',
        'border-[rgba(107,111,212,0.2)]',
        className,
      )}
    >
      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(107,111,212,0.15)] text-[#6B6FD4]">
        {icon ?? <Sparkles size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-[Syne] text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B6FD4] mb-1">
          {label}
        </p>
        <div className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] leading-[1.5] [&_strong]:text-[var(--sl-t1)]">
          {children}
        </div>
      </div>
    </div>
  )
}
