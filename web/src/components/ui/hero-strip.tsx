'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface HeroStripItem {
  label: string
  value: string
  meta?: string
  icon?: LucideIcon
  color?: string
  featured?: boolean
}

interface HeroStripProps {
  items: HeroStripItem[]
  gradient?: [string, string]
  className?: string
}

export function HeroStrip({
  items,
  gradient = ['#10b981', '#0055ff'],
  className,
}: HeroStripProps) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden',
        'relative sl-fade-up transition-colors hover:border-[var(--sl-border-h)]',
        className,
      )}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b"
        style={{ background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})` }}
      />

      <div className="flex">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              className={cn(
                'flex-1 px-5 py-5',
                i < items.length - 1 && 'border-r border-[var(--sl-border)]',
                item.featured && 'bg-[var(--sl-s2)]',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {Icon && (
                  <Icon
                    size={14}
                    className="shrink-0"
                    style={{ color: item.color || 'var(--sl-t3)' }}
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)]">
                  {item.label}
                </p>
              </div>
              <p
                className={cn(
                  'font-[DM_Mono] font-medium leading-none text-[var(--sl-t1)]',
                  item.featured ? 'text-[24px]' : 'text-lg',
                )}
                style={item.color ? { color: item.color } : undefined}
              >
                {item.value}
              </p>
              {item.meta && (
                <p className="text-[11px] text-[var(--sl-t3)] mt-1.5">{item.meta}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
