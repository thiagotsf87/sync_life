'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface DonutSlice {
  label: string
  /** Percentual do anel (fatias somam ~100). */
  share: number
  color: string
}

export interface DonutProps {
  title?: string
  center: string
  centerSub?: string
  slices: DonutSlice[]
  className?: string
}

/** Share chart conic-gradient com centro + legenda. Tooltip/realce no hover (G-01). */
export function Donut({ title, center, centerSub, slices, className }: DonutProps) {
  const [hover, setHover] = useState<number | null>(null)
  const deg = (n: number) => Math.round(n * 100) / 100
  let acc = 0
  const stops = slices
    .map((s) => {
      const from = acc
      acc += s.share * 3.6
      return `${s.color} ${deg(from)}deg ${deg(acc)}deg`
    })
    .join(', ')
  return (
    <div className={cn('flex flex-col gap-4 rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      {title && <h3 className="font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>}
      <div className="flex items-center gap-[22px]">
        <div
          className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-[var(--sl-s1)]">
            <span className="sl-num-strong text-[18px] leading-none text-[var(--sl-t1)]">
              {hover != null ? `${slices[hover].share}%` : center}
            </span>
            <span className="mt-[3px] text-[9.5px] text-[var(--sl-t4)]">
              {hover != null ? slices[hover].label : centerSub}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {slices.map((s, i) => (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'flex cursor-default items-center gap-2.5 rounded-md px-1.5 py-1 text-[12.5px] transition-colors',
                hover === i && 'bg-[var(--sl-s2)]',
              )}
            >
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: s.color }} />
              <span className="flex-1 text-[var(--sl-t2)]">{s.label}</span>
              <span className="sl-num font-semibold text-[var(--sl-t1)]">{s.share}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
