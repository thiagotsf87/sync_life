'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'

const fmtR = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
  icon?: string
}

interface PlanejamentoMobileProps {
  projectedBalance: number
  projectedLabel: string
  months: MonthPill[]
  events: PlannedEvent[]
  insightText: string
  insightIcon?: string
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
  insightIcon = '⚠️',
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
        <button className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]">
          <Info size={16} />
        </button>
      }
    >
      {/* Chart card — both modes */}
      <div className="mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[13px] text-[var(--sl-t2)]">Saldo projetado</p>
            <p className="font-[DM_Mono] text-[22px] font-medium text-[var(--sl-t1)]">
              {fmtR(projectedBalance)}
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-[12px] text-[11px] font-medium
                          bg-[rgba(16,185,129,0.12)] text-[#10b981]">
            em {projectedLabel}
          </span>
        </div>
        <MiniChart data={balanceData} color="#10b981" />
        <div className="flex justify-between pt-1.5">
          {months.slice(0, 6).map((m, i) => (
            <span key={i} className="text-[10px] text-[var(--sl-t3)]">{m.label}</span>
          ))}
        </div>
      </div>

      {/* Month pills scroller — both modes */}
      <div className="flex gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {months.map((m, i) => {
          const isActive = activeMonth === i
          return (
            <button
              key={i}
              onClick={() => setActiveMonth(i)}
              className="flex flex-col items-center gap-[3px] px-3.5 py-2.5 rounded-[12px] shrink-0 transition-all border"
              style={{
                background: isActive ? 'rgba(16,185,129,0.15)' : 'var(--sl-s1)',
                borderColor: isActive
                  ? 'rgba(16,185,129,0.4)'
                  : m.isNegative
                    ? 'rgba(244,63,94,0.3)'
                    : 'var(--sl-border)',
              }}
            >
              <span
                className="text-[12px] font-medium"
                style={{
                  color: isActive ? '#10b981' : m.isNegative ? '#f43f5e' : 'var(--sl-t2)',
                }}
              >
                {m.label}
              </span>
              <span
                className="font-[DM_Mono] text-[13px] font-medium"
                style={{
                  color: isActive ? '#10b981' : m.isNegative ? '#f43f5e' : 'var(--sl-t1)',
                }}
              >
                {m.balance >= 0 ? '+' : ''}{fmtR(m.balance)}
              </span>
            </button>
          )
        })}
      </div>

      {/* AI Insight */}
      <div className="mb-3">
        <AIInsightCard icon={insightIcon} label={insightLabel}>
          <span dangerouslySetInnerHTML={{ __html: insightText }} />
        </AIInsightCard>
      </div>

      {/* Events section — both modes */}
      <p className="px-1 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Eventos em {months[activeMonth]?.label ?? 'Mar'}
      </p>

      {events.length === 0 ? (
        <div className="mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-6 text-center">
          <p className="text-[12px] text-[var(--sl-t3)]">Nenhum evento planejado.</p>
        </div>
      ) : (
        events.map((ev) => (
          <div
            key={ev.id}
            className="mb-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] py-[11px] px-[14px]
                       flex items-center gap-2.5"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: ev.type === 'income' ? '#10b981' : ev.type === 'expense' ? '#f43f5e' : '#0055ff' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--sl-t1)]">
                {ev.icon ?? (ev.type === 'income' ? '💰' : '📤')} {ev.name}
              </p>
              <p className="text-[11px] text-[var(--sl-t2)]">{ev.date}</p>
            </div>
            <span
              className="font-[DM_Mono] text-[13px] font-medium shrink-0"
              style={{ color: ev.type === 'income' ? '#10b981' : '#f43f5e' }}
            >
              {ev.type === 'income' ? '+' : '-'}{fmtR(Math.abs(ev.amount))}
            </span>
          </div>
        ))
      )}

      {/* Add event button */}
      <div className="pt-2 pb-6">
        <button
          onClick={onAddEvent}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[20px]
                     bg-[var(--sl-s2)] border border-[var(--sl-border-h)] text-[var(--sl-t1)]
                     text-[13px] font-medium transition-colors active:bg-[var(--sl-s3)]"
        >
          + Adicionar evento pontual
        </button>
      </div>
    </FinancasMobileShell>
  )
}
