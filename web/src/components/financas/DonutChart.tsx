'use client'

import { fmtR$ } from '@/components/financas/helpers'
import type { CatDataItem } from '@/components/financas/helpers'

interface DonutChartProps {
  data: CatDataItem[]
  totalGasto: number
}

export function DonutChart({ data, totalGasto }: DonutChartProps) {
  const R = 58, cx = 70, cy = 70, stroke = 11
  const total = data.reduce((s, c) => s + c.pct, 0) || 1
  let offset = 0
  const circ = 2 * Math.PI * R
  const gaps = Math.max(data.length, 1) * 2
  const usable = circ - gaps

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--sl-s3)" strokeWidth={stroke} />
        {data.map((cat) => {
          const len = (cat.pct / total) * usable
          const dashArr = `${len} ${circ - len}`
          const dashOff = -offset
          offset += len + 2
          return (
            <circle
              key={cat.nome}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={cat.cor}
              strokeWidth={stroke}
              strokeDasharray={dashArr}
              strokeDashoffset={dashOff}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)] leading-none">
          R$ {fmtR$(totalGasto)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)]">Gasto</span>
      </div>
    </div>
  )
}
