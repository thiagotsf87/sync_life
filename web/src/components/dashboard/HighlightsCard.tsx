'use client'

import { type LucideIcon, ArrowUpRight, Sparkles } from 'lucide-react'

export interface HighlightItem {
  icon: LucideIcon
  iconColor: string
  label: string
  sub: string
  delta: string
  deltaColor?: string
  up?: boolean
}

interface HighlightsCardProps {
  items: HighlightItem[]
  title?: string
}

export function HighlightsCard({ items, title = 'Destaques' }: HighlightsCardProps) {
  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
      <div className="flex items-center justify-between mb-3.5">
        <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px]">
          <Sparkles size={16} className="text-[#6B6FD4]" />
          {title}
        </span>
      </div>
      <div className="flex flex-col">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div
              key={it.label}
              className="flex items-center gap-3 py-2.5"
            >
              <div
                className="w-[30px] h-[30px] rounded-[9px] inline-flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${it.iconColor} 14%, transparent)`,
                  color: it.iconColor,
                }}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[var(--sl-t1)] truncate">
                  {it.label}
                </div>
                <div className="text-[11.5px] text-[var(--sl-t3)] truncate">
                  {it.sub}
                </div>
              </div>
              <span
                className="font-[Syne] font-medium tabular-nums text-[12px] inline-flex items-center gap-1"
                style={{ color: it.deltaColor ?? (it.up ? 'var(--sl-em)' : 'var(--sl-t2)') }}
              >
                {it.up === true && <ArrowUpRight size={11} />}
                {it.delta}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
