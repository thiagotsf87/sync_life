'use client'

import { cn } from '@/lib/utils'

interface TreemapItem {
  label: string
  percent: number
  value: string
  color: string
}

interface TreemapProps {
  items: TreemapItem[]
  className?: string
}

export function Treemap({ items, className }: TreemapProps) {
  if (items.length === 0) return null

  // Sort by percent descending for layout
  const sorted = [...items].sort((a, b) => b.percent - a.percent)

  // CSS grid: first item spans 2 rows, rest fill 2-column layout
  return (
    <div
      className={cn(
        'grid gap-2',
        className
      )}
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: `repeat(${Math.max(2, Math.ceil((sorted.length - 1) / 2) + 1)}, auto)`,
      }}
    >
      {sorted.map((item, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl p-4 flex flex-col justify-between min-h-[80px]',
            'transition-opacity hover:opacity-90'
          )}
          style={{
            background: `${item.color}18`,
            border: `1px solid ${item.color}30`,
            ...(i === 0
              ? { gridRow: 'span 2', gridColumn: '1' }
              : {}),
          }}
        >
          <p className="text-[11px] font-semibold text-[var(--sl-t2)]">
            {item.label}
          </p>
          <div className="mt-auto">
            <p
              className="font-[DM_Mono] font-bold text-lg leading-none"
              style={{ color: item.color }}
            >
              {item.percent.toFixed(1)}%
            </p>
            <p className="text-[10px] text-[var(--sl-t3)] mt-0.5 font-[DM_Mono]">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
