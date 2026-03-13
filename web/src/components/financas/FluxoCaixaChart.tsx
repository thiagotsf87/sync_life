'use client'

import { cn } from '@/lib/utils'
import type { CfDay } from '@/components/financas/helpers'

interface FluxoCaixaChartProps {
  days: CfDay[]
}

export function FluxoCaixaChart({ days }: FluxoCaixaChartProps) {
  const maxVal = days.length > 0 ? Math.max(...days.map(d => Math.max(d.inc, d.exp)), 100) : 100
  const h = 88
  const n = days.length || 28

  const balances: number[] = []
  let running = 0
  for (const d of days) {
    running += d.inc - d.exp
    balances.push(running)
  }
  const minBal = Math.min(...balances, 0)
  const maxBal = Math.max(...balances, 1)
  const balRange = Math.max(1, maxBal - minBal)

  const balPts = balances
    .map((b, i) => {
      const x = ((i + 0.5) / n) * 100
      const y = (1 - (b - minBal) / balRange) * (h - 6) + 3
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  const yLabels = [maxVal, maxVal * 0.67, maxVal * 0.33, 0]

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#10b981', opacity: 0.8 }} />
          Receitas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#f43f5e', opacity: 0.7 }} />
          Despesas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-6 h-px inline-block" style={{ background: '#0055ff' }} />
          Saldo
        </span>
      </div>
      {/* Y axis */}
      <div className="flex gap-1.5 items-start">
        <div className="relative shrink-0 w-8" style={{ height: h + 22 }}>
          {yLabels.map((v, i) => (
            <span
              key={i}
              className="absolute right-0 font-[DM_Mono] text-[9px] text-[var(--sl-t3)]"
              style={{ top: `${(i / 3) * h}px`, transform: 'translateY(-50%)' }}
            >
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v)}
            </span>
          ))}
        </div>
        <div className="flex-1 min-w-0 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: h }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-full h-px bg-[var(--sl-border)]" />
            ))}
          </div>
          {/* Bars */}
          <div className="flex items-end gap-px" style={{ height: h }}>
            {days.map(({ d, inc, exp, isToday, isFuture }) => {
              const incH = inc > 0 ? Math.max(4, (inc / maxVal) * h) : 0
              const expH = exp > 0 ? Math.max(2, (exp / maxVal) * h) : 0
              return (
                <div
                  key={d}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group"
                >
                  {isToday && (
                    <>
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#10b981] opacity-50 -translate-x-1/2" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#10b981] whitespace-nowrap bg-[rgba(16,185,129,0.1)] px-1 py-0.5 rounded">
                        Hoje
                      </div>
                    </>
                  )}
                  <div className="flex flex-col items-center w-full justify-end" style={{ height: h }}>
                    {incH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-t-sm"
                        style={{ height: incH, background: '#10b981', opacity: isFuture ? 0.3 : 0.8 }}
                      />
                    )}
                    {expH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-b-sm mt-px"
                        style={{ height: expH, background: '#f43f5e', opacity: isFuture ? 0.3 : 0.7 }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Balance line SVG overlay */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: h }}
            viewBox={`0 0 100 ${h}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={balPts}
              fill="none"
              stroke="#0055ff"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* X axis labels */}
          <div className="flex gap-px mt-1.5">
            {days.map(({ d, isToday, isFuture }) => (
              <div
                key={d}
                className={cn(
                  'flex-1 text-center font-[DM_Mono] text-[7px]',
                  isToday ? 'font-bold text-[#10b981]' : 'text-[var(--sl-t2)]'
                )}
                style={{ opacity: isFuture ? 0.4 : 1 }}
              >
                {String(d).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
