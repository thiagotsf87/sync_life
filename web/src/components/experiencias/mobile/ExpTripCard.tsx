'use client'

import { cn } from '@/lib/utils'
import {
  EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BORDER,
  EXP_GRAD, EXP_PRIMARY_TAG,
} from '@/lib/exp-colors'

interface ExpTripCardProps {
  name: string
  flag?: string
  destinations: string
  dateRange: string
  status: string
  statusColor: string
  budgetCurrent: string
  budgetTotal: string
  budgetPct: number
  xpBadge?: string
  onClick?: () => void
}

export function ExpTripCard({
  name, flag, destinations, dateRange, status, statusColor,
  budgetCurrent, budgetTotal, budgetPct, xpBadge, onClick,
}: ExpTripCardProps) {
  return (
    <div
      className="mx-4 mb-3 rounded-[16px] overflow-hidden cursor-pointer"
      style={{ border: `1px solid ${EXP_PRIMARY_BORDER}` }}
      onClick={onClick}
    >
      {/* Cover */}
      <div
        className="h-[120px] flex items-end p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold mb-[2px]" style={{ color: EXP_PRIMARY_LIGHT }}>
            ✦ MISSÃO DE VIVÊNCIA
          </p>
          <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)]">
            {name} {flag}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)]">
            {dateRange} · {Math.round(budgetPct * 12 / 100)} dias
          </p>
        </div>
        <div className="shrink-0 ml-2">
          {xpBadge ? (
            <span
              className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold"
              style={{ background: EXP_PRIMARY_TAG, border: `1px solid ${EXP_PRIMARY_BORDER}`, color: EXP_PRIMARY_LIGHT }}
            >
              ⚡ {xpBadge}
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
              style={{ background: `${statusColor}1e`, color: statusColor }}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3" style={{ background: 'var(--sl-s1)' }}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[12px] text-[var(--sl-t2)]">
              Missão financeira
            </span>
            <div className="font-[DM_Mono] text-[14px] text-[var(--sl-t1)] mt-[2px]">
              {budgetCurrent}{' '}
              <span className="text-[11px] text-[var(--sl-t3)]">de {budgetTotal}</span>
            </div>
          </div>
          <div className="w-[100px]">
            <div className="h-[6px] rounded-[3px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: EXP_GRAD,
                }}
              />
            </div>
            <p
              className={cn('text-[10px] text-right mt-[3px]', 'font-bold')}
              style={{ color: EXP_PRIMARY_LIGHT }}
            >
              {budgetPct}% · +160 XP
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
