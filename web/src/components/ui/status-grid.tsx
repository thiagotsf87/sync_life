'use client'

import { cn } from '@/lib/utils'

interface StatusGridItem {
  label: string
  count: number
  color: string
}

interface StatusGridProps {
  items: StatusGridItem[]
  className?: string
}

export function StatusGrid({ items, className }: StatusGridProps) {
  return (
    <div
      className={cn(
        'flex gap-2.5 sl-fade-up',
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 text-center relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]"
        >
          <div
            className="absolute top-0 left-[14px] right-[14px] h-[2.5px] rounded-b"
            style={{ background: item.color }}
          />
          <p
            className="font-[DM_Mono] font-medium text-[24px] leading-none mb-1"
            style={{ color: item.color }}
          >
            {item.count}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}
