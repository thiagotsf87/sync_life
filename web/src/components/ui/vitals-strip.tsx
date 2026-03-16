'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface VitalItem {
  label: string
  value: string
  note?: string
  accent: string  // color string
  icon: LucideIcon
}

interface VitalsStripProps {
  items: VitalItem[]
  className?: string
}

export function VitalsStrip({ items, className }: VitalsStripProps) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl',
        'flex items-stretch overflow-hidden sl-fade-up sl-delay-1',
        'transition-colors hover:border-[var(--sl-border-h)]',
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            'relative flex-1 py-5 px-6 flex flex-col justify-center items-center',
            i > 0 && 'border-l border-[var(--sl-border)]',
          )}
        >
          {/* Accent bar top */}
          <div
            className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b"
            style={{ background: item.accent }}
          />
          <item.icon
            size={14}
            className="mb-1"
            style={{ color: item.accent }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] mb-1">
            {item.label}
          </p>
          <p className="font-[DM_Mono] font-medium text-[24px] text-[var(--sl-t1)] leading-none">
            {item.value}
          </p>
          {item.note && (
            <p className="text-[11px] text-[var(--sl-t3)] mt-1">{item.note}</p>
          )}
        </div>
      ))}
    </div>
  )
}
