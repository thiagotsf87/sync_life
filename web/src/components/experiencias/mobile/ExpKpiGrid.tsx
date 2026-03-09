'use client'

import { EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'

interface KpiItem {
  label: string
  value: string
  sub: string
  valueColor?: string
}

interface ExpKpiGridProps {
  items: KpiItem[]
}

export function ExpKpiGrid({ items }: ExpKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-[10px] p-3"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">{item.label}</p>
          <p
            className="font-[DM_Mono] text-[19px] font-bold text-[var(--sl-t1)]"
            style={item.valueColor ? { color: item.valueColor } : undefined}
          >
            {item.value}
          </p>
          <p className="text-[11px] mt-[2px]" style={{ color: EXP_PRIMARY_LIGHT }}>
            {item.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
