'use client'

import { cn } from '@/lib/utils'

export interface MicroStat {
  label: string
  value: string
  delta?: string
  /** Item ancora da dobra (P-02): valor 30px em cor --sl-em. */
  big?: boolean
  /** Cor do delta; default t3 (neutro). Use 'em' para positivo. */
  deltaTone?: 'em' | 'muted'
}

export interface MicroStatRailProps {
  items: MicroStat[]
  className?: string
}

/** Coluna de stats inline (sem card, P-03). 1 valor big (P-02). Evidencia do hero. */
export function MicroStatRail({ items, className }: MicroStatRailProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {items.map((s, i) => (
        <div key={i} className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t4)]">
            {s.label}
          </span>
          <span
            className={cn('sl-num-strong leading-none', s.big ? 'text-[30px]' : 'text-[22px]')}
            style={{ color: s.big ? 'var(--sl-em)' : 'var(--sl-t1)' }}
          >
            {s.value}
          </span>
          {s.delta && (
            <span
              className="sl-num text-[11px]"
              style={{ color: s.deltaTone === 'muted' ? 'var(--sl-t3)' : 'var(--sl-em)' }}
            >
              {s.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
