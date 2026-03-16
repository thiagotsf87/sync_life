'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface TripStripRowProps {
  name: string
  subtitle: string
  status: string
  statusColor: string
  budget?: string
  dotColor?: string
  onClick?: () => void
  className?: string
}

export function TripStripRow({
  name,
  subtitle,
  status,
  statusColor,
  budget,
  dotColor = '#3b82f6',
  onClick,
  className,
}: TripStripRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 px-1 cursor-pointer transition-colors rounded-lg hover:bg-[var(--sl-s2)]',
        className,
      )}
      onClick={onClick}
    >
      {/* Dot */}
      <span
        className="w-[10px] h-[10px] rounded-full shrink-0"
        style={{ background: dotColor }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{name}</p>
        <p className="text-[12px] text-[var(--sl-t2)] truncate">{subtitle}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="px-2 py-[2px] rounded-md text-[10px] font-bold uppercase tracking-[.04em]"
          style={{ background: `${statusColor}14`, color: statusColor }}
        >
          {status}
        </span>
        {budget && (
          <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
            {budget}
          </span>
        )}
        <ChevronRight size={16} className="text-[var(--sl-t3)]" />
      </div>
    </div>
  )
}
