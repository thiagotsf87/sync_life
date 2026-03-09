'use client'

import { EXP_PRIMARY, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'

interface ExpBudgetCategoryProps {
  icon: string
  name: string
  current: number
  total: number
  pct: number
  isPaid?: boolean
  xpLabel?: string
  formatValue: (v: number) => string
}

function getBarColor(pct: number, isPaid?: boolean): string {
  if (isPaid || pct >= 100) return '#10b981'
  if (pct >= 70) return '#f59e0b'
  return EXP_PRIMARY
}

export function ExpBudgetCategory({
  icon, name, current, total, pct, isPaid, xpLabel, formatValue,
}: ExpBudgetCategoryProps) {
  const barColor = getBarColor(pct, isPaid)

  return (
    <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--sl-border)' }}>
      <div
        className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 text-[18px]"
        style={{ background: isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[6px] mb-1">
          <p className="text-[14px] font-medium text-[var(--sl-t1)]">{name}</p>
          {isPaid && (
            <span className="text-[9px] font-semibold px-[6px] py-[1px] rounded-[10px]" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              ✓ Pago
            </span>
          )}
        </div>
        <div className="h-[6px] rounded-[3px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
          <div className="h-full rounded-[3px]" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
        </div>
        {xpLabel && (
          <p className="text-[10px] font-bold mt-[3px]" style={{ color: EXP_PRIMARY_LIGHT }}>{xpLabel}</p>
        )}
      </div>
      <div className="text-right min-w-[80px]">
        <p className="font-[DM_Mono] text-[13px]" style={{ color: isPaid ? '#10b981' : current > 0 ? 'var(--sl-t1)' : 'var(--sl-t3)' }}>
          {formatValue(current)}
        </p>
        {total > 0 && !isPaid && (
          <p className="text-[11px] text-[var(--sl-t2)]">de {formatValue(total)}</p>
        )}
        {isPaid && <p className="text-[11px] text-[var(--sl-t2)]">100% pago</p>}
      </div>
    </div>
  )
}
