'use client'

import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Kpi {
  label: string
  value: string
  delta?: string
  up?: boolean
  tone?: string
}

export interface KpiStripProps {
  items: Kpi[]
  className?: string
}

/** Linha de KPIs com divisores hairline; o 1º valor é a âncora (≥30px). */
export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-[14px] border border-[var(--sl-border)] bg-[var(--sl-border)]',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length || 1}, minmax(0, 1fr))` }}
    >
      {items.map((k, i) => (
        <div key={i} className="flex flex-col gap-1.5 bg-[var(--sl-s1)] px-[18px] py-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--sl-t4)]">
            {k.label}
          </span>
          <span
            className={cn('sl-num-strong leading-none', i === 0 ? 'text-[30px]' : 'text-[22px]')}
            style={{ color: k.tone ?? 'var(--sl-t1)' }}
          >
            {k.value}
          </span>
          {(k.delta || k.up) && (
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{ color: k.up ? 'var(--sl-success)' : 'var(--sl-t3)' }}
            >
              {k.up && <ArrowUpRight size={11} />}
              {k.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
