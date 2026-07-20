'use client'

import { useState } from 'react'
import { Info, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'
import { fmtBRL } from '@/lib/format/currency'

interface MonthPill {
  label: string
  balance: number
  isNegative: boolean
}

interface PlannedEvent {
  id: string
  name: string
  date: string
  amount: number
  type: 'income' | 'expense'
  icon?: React.ReactNode
}

interface PlanejamentoMobileProps {
  projectedBalance: number
  projectedLabel: string
  months: MonthPill[]
  events: PlannedEvent[]
  insightText: string
  insightIcon?: React.ReactNode
  insightLabel?: string
  balanceData: { balance: number }[]
  onAddEvent: () => void
}

function MiniChart({ data, color }: { data: { balance: number }[]; color: string }) {
  if (data.length < 2) return <div className="h-[80px] bg-[var(--sl-s2)] rounded-lg animate-pulse" />

  const balances = data.map(d => d.balance)
  const min = Math.min(...balances)
  const max = Math.max(...balances)
  const range = max - min || 1
  const W = 340
  const H = 80
  const PAD = 4

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = PAD + (H - 2 * PAD) - ((d.balance - min) / range) * (H - 2 * PAD)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const areaPoints = `0,${H} ${points} ${W},${H}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
      <defs>
        <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#mcGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlanejamentoMobile({
  projectedBalance,
  projectedLabel,
  months,
  events,
  insightText,
  insightIcon,
  insightLabel = 'Atenção',
  balanceData,
  onAddEvent,
}: PlanejamentoMobileProps) {
  const [activeMonth, setActiveMonth] = useState(0)

  return (
    <FinancasMobileShell
      title="Planejamento"
      subtitle="Projeção 6 meses"
      rightAction={
        <button
          type="button"
          aria-label="Informações"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
        >
          <Info size={16} />
        </button>
      }
    >
      {/* Chart card */}
      <div className="mb-3 mx-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)]">Saldo projetado</p>
            <p className="sl-num-strong font-[Syne] text-[22px] text-[var(--sl-t1)]">
              {fmtBRL(projectedBalance, { compact: true })}
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-[12px] font-[DM_Sans] text-[11px] font-medium
                          bg-[var(--sl-em-soft)] text-[var(--sl-em)]">
            em {projectedLabel}
          </span>
        </div>
        <MiniChart data={balanceData} color="var(--sl-em)" />
        <div className="flex justify-between pt-1.5">
          {months.slice(0, 6).map((m, i) => (
            <span key={i} className="font-[DM_Sans] text-[10px] text-[var(--sl-t3)]">{m.label}</span>
          ))}
        </div>
      </div>

      {/* Month pills scroller */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto phone-scroll scrollbar-hide">
        {months.map((m, i) => {
          const isActive = activeMonth === i
          return (
            <button
              key={i}
              onClick={() => setActiveMonth(i)}
              className="flex flex-col items-center gap-[3px] px-3.5 py-2.5 rounded-[12px] shrink-0 transition-all border"
              style={{
                background: isActive ? 'var(--sl-em-soft)' : 'var(--sl-s1)',
                borderColor: isActive
                  ? 'var(--sl-border-em)'
                  : m.isNegative
                    ? 'rgba(219,100,120,0.3)'
                    : 'var(--sl-border)',
              }}
            >
              <span
                className="font-[DM_Sans] text-[12px] font-medium"
                style={{
                  color: isActive ? 'var(--sl-em)' : m.isNegative ? 'var(--sl-danger)' : 'var(--sl-t2)',
                }}
              >
                {m.label}
              </span>
              <span
                className="sl-num font-[Syne] text-[13px] font-semibold"
                style={{
                  color: isActive ? 'var(--sl-em)' : m.isNegative ? 'var(--sl-danger)' : 'var(--sl-t1)',
                }}
              >
                {m.balance >= 0 ? '+' : ''}{fmtBRL(m.balance, { compact: true })}
              </span>
            </button>
          )
        })}
      </div>

      {/* AI Insight */}
      <div className="mb-3 mx-4">
        <AIInsightCard icon={insightIcon ?? <AlertTriangle size={16} />} label={insightLabel}>
          <span dangerouslySetInnerHTML={{ __html: insightText }} />
        </AIInsightCard>
      </div>

      {/* Events section */}
      <p className="px-5 pb-2 font-[Syne] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)]">
        Eventos em {months[activeMonth]?.label ?? 'Mar'}
      </p>

      {events.length === 0 ? (
        <div className="mb-3 mx-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-6 text-center">
          <p className="font-[DM_Sans] text-[12px] text-[var(--sl-t3)]">Nenhum evento planejado.</p>
        </div>
      ) : (
        <div className="px-4">
          {events.map((ev) => {
            const FallbackIcon = ev.type === 'income' ? ArrowUpCircle : ArrowDownCircle
            return (
              <div
                key={ev.id}
                className="mb-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] py-[11px] px-[14px]
                           flex items-center gap-2.5"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: ev.type === 'income' ? 'var(--sl-em)' : 'var(--sl-danger)' }}
                />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0"
                    style={{
                      background: ev.type === 'income' ? 'var(--sl-em-soft)' : 'rgba(219,100,120,0.12)',
                      color: ev.type === 'income' ? 'var(--sl-em)' : 'var(--sl-danger)',
                    }}
                  >
                    {ev.icon ?? <FallbackIcon size={13} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-[DM_Sans] text-[13px] font-medium text-[var(--sl-t1)] truncate">
                      {ev.name}
                    </p>
                    <p className="font-[DM_Sans] text-[11px] text-[var(--sl-t2)]">{ev.date}</p>
                  </div>
                </div>
                <span
                  className="sl-num font-[Syne] text-[13px] font-semibold shrink-0"
                  style={{ color: ev.type === 'income' ? 'var(--sl-em)' : 'var(--sl-danger)' }}
                >
                  {ev.type === 'income' ? '+' : '– '}{fmtBRL(Math.abs(ev.amount), { compact: true })}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Add event button */}
      <div className="px-4 pt-2 pb-6">
        <button
          onClick={onAddEvent}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px]
                     font-[DM_Sans] text-[13px] font-semibold text-white transition-colors
                     active:opacity-90"
          style={{ background: 'var(--sl-em)' }}
        >
          + Adicionar evento pontual
        </button>
      </div>
    </FinancasMobileShell>
  )
}
