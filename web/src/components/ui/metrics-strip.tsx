'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface MetricsStripItem {
  label: string
  value: string
  note?: string
  valueColor?: string
  accent?: string      // top bar color per metric
  icon?: LucideIcon
  featured?: boolean   // larger value font
}

interface MetricsStripProps {
  items: MetricsStripItem[]
  gradient?: [string, string] // overall top accent gradient
  className?: string
}

export function MetricsStrip({ items, gradient, className }: MetricsStripProps) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden',
        'relative flex sl-fade-up transition-colors hover:border-[var(--sl-border-h)]',
        className
      )}
    >
      {/* Optional overall gradient accent bar */}
      {gradient && (
        <div
          className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b z-[1]"
          style={{ background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})` }}
        />
      )}

      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div
            key={i}
            className={cn(
              'flex-1 px-5 py-4 relative',
              i < items.length - 1 && 'border-r border-[var(--sl-border)]',
              item.featured && 'bg-[var(--sl-s2)]',
            )}
          >
            {/* Per-metric accent bar (shown when no overall gradient) */}
            {item.accent && !gradient && (
              <div
                className="absolute top-0 left-3 right-3 h-[2.5px] rounded-b"
                style={{ background: item.accent }}
              />
            )}
            <div className="flex items-center gap-1.5 mb-1">
              {Icon && (
                <Icon
                  size={13}
                  className="shrink-0"
                  style={{ color: item.accent || item.valueColor || 'var(--sl-t3)' }}
                />
              )}
              <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">
                {item.label}
              </p>
            </div>
            <p
              className={cn(
                'font-[DM_Mono] font-medium leading-none text-[var(--sl-t1)]',
                item.featured ? 'text-[30px]' : 'text-lg',
              )}
              style={item.valueColor ? { color: item.valueColor } : undefined}
            >
              {item.value}
            </p>
            {item.note && (
              <p className="text-[11px] text-[var(--sl-t3)] mt-1">{item.note}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
