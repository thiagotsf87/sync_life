'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ProjectedEvent, BalanceDataPoint, MonthData, ScenarioKey } from '@/hooks/use-planejamento'
import { SCENARIO_COLORS } from '@/hooks/use-planejamento'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COL_W = 140
const MAX_CHIPS = 3

const CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  income:  { bg: 'rgba(16,185,129,0.12)',  text: '#10b981' },
  expense: { bg: 'rgba(244,63,94,0.10)',   text: '#f43f5e' },
  goal:    { bg: 'rgba(0,85,255,0.10)',    text: '#0055ff' },
  recorr:  { bg: 'rgba(245,158,11,0.09)',  text: '#f59e0b' },
  warn:    { bg: 'rgba(249,115,22,0.10)',  text: '#f97316' },
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function EventChips({
  events,
  months,
}: {
  events: ProjectedEvent[]
  months: MonthData[]
}) {
  return (
    <>
      {months.map((m) => {
        const monthEvents = events.filter(e => e.monthIndex === m.index)
        const visible = monthEvents.slice(0, MAX_CHIPS)
        const overflow = monthEvents.length - MAX_CHIPS

        return (
          <div
            key={m.index}
            className="absolute top-2 flex flex-col gap-1 px-2"
            style={{ left: m.index * COL_W, width: COL_W }}
          >
            {visible.map(ev => {
              const colors = CHIP_COLORS[ev.type] ?? CHIP_COLORS.recorr
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] text-[10px] font-medium truncate"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  <span className="shrink-0">{ev.icon}</span>
                  <span className="truncate">{ev.name}</span>
                </div>
              )
            })}
            {overflow > 0 && (
              <div className="text-[10px] font-semibold px-1.5 text-[var(--sl-t3)]">
                +{overflow}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function TodayLine({ col }: { col: number }) {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const x = col * COL_W + (today.getDate() / daysInMonth) * COL_W

  return (
    <div
      className="absolute top-0 bottom-0 z-10 pointer-events-none"
      style={{ left: x }}
    >
      <div className="relative w-0 h-full">
        <div
          className="absolute top-0 bottom-0 w-0"
          style={{ borderLeft: '1.5px dashed rgba(16,185,129,0.5)' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-[#10b981]"
          style={{ top: 4, left: -4 }}
        />
      </div>
    </div>
  )
}

function BalanceCurve({
  data,
  scenario,
}: {
  data: BalanceDataPoint[]
  scenario: ScenarioKey
}) {
  if (data.length < 2) return null

  const balances = data.map(d => d.balance)
  const minBal = Math.min(...balances, 0)
  const maxBal = Math.max(...balances, 1)
  const range = maxBal - minBal || 1

  const W = data.length * COL_W
  const H = 100
  const PAD = 12

  const toX = (idx: number) => idx * COL_W + COL_W / 2
  const toY = (bal: number) => H - PAD - ((bal - minBal) / range) * (H - 2 * PAD)

  const points = data.map(d => `${toX(d.monthIndex)},${toY(d.balance)}`).join(' ')
  const zeroY = toY(0)
  const color = SCENARIO_COLORS[scenario]
  const gradId = `bal-grad-${scenario}`

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Zero dashed line when balance can be negative */}
      {minBal < 0 && (
        <line
          x1={0} y1={zeroY} x2={W} y2={zeroY}
          stroke="rgba(244,63,94,0.3)" strokeWidth="1" strokeDasharray="4,4"
        />
      )}

      {/* Area fill */}
      <polygon
        points={`${toX(0)},${H} ${points} ${toX(data[data.length - 1].monthIndex)},${H}`}
        fill={`url(#${gradId})`}
      />

      {/* Curve */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {data.map(d => (
        <circle
          key={d.monthIndex}
          cx={toX(d.monthIndex)}
          cy={toY(d.balance)}
          r={3}
          fill={color}
        />
      ))}
    </svg>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface TimelineScrollProps {
  months: MonthData[]
  events: ProjectedEvent[]
  balanceData: BalanceDataPoint[]
  scenario: ScenarioKey
  todayCol: number
  isPro: boolean
}

export function TimelineScroll({
  months,
  events,
  balanceData,
  scenario,
  todayCol,
  isPro,
}: TimelineScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Drag-to-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let dragging = false
    let startX = 0
    let scrollLeft = 0

    const onDown  = (e: MouseEvent) => { dragging = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft }
    const onMove  = (e: MouseEvent) => { if (!dragging) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) }
    const onUp    = () => { dragging = false }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
    }
  }, [])

  const totalWidth = months.length * COL_W
  const incomeEvents  = events.filter(e => e.band === 'income')
  const expenseEvents = events.filter(e => e.band === 'expense')

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div style={{ width: totalWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Month headers */}
        <div
          className="flex shrink-0 bg-[var(--sl-s1)] border-b border-[var(--sl-border)]"
          style={{ width: totalWidth, height: 36 }}
        >
          {months.map((m) => (
            <div
              key={m.index}
              style={{ width: COL_W, flexShrink: 0 }}
              className={cn(
                'flex items-center px-3.5 h-full border-r border-[var(--sl-border)] gap-1.5',
                m.index === todayCol && 'text-[#10b981]'
              )}
            >
              <span className="font-[Syne] text-[11px] font-bold tracking-[0.03em]">{m.label}</span>
              {m.index === todayCol && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.14)] text-[#10b981] font-semibold">
                  Hoje
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Canvas area */}
        <div className="relative flex-1 min-h-0 flex flex-col" style={{ width: totalWidth }}>

          {/* Column grid lines */}
          <div className="absolute inset-0 flex pointer-events-none z-0">
            {months.map((m) => (
              <div
                key={m.index}
                style={{ width: COL_W, flexShrink: 0 }}
                className={cn(
                  'border-r border-[var(--sl-border)] h-full',
                  m.index === todayCol && 'bg-[rgba(16,185,129,0.025)]'
                )}
              />
            ))}
          </div>

          {/* Today line */}
          <TodayLine col={todayCol} />

          {/* Bands */}
          <div className="absolute inset-0 flex flex-col">
            {/* Income band */}
            <div className="h-[90px] shrink-0 relative border-b border-[var(--sl-border)] bg-[rgba(16,185,129,0.02)]">
              <EventChips events={incomeEvents} months={months} />
            </div>

            {/* Balance band */}
            <div className="flex-1 min-h-0 relative border-b border-[var(--sl-border)]">
              <BalanceCurve data={balanceData} scenario={scenario} />
            </div>

            {/* Expense band */}
            <div className="h-[90px] shrink-0 relative bg-[rgba(244,63,94,0.02)]">
              <EventChips events={expenseEvents} months={months} />
            </div>
          </div>

          {/* FREE overlay: months 4-12 */}
          {!isPro && (
            <div
              className="absolute top-0 bottom-0 z-30"
              style={{ left: 3 * COL_W, right: 0 }}
            >
              <div className="w-full h-full backdrop-blur-sm bg-[var(--sl-bg)]/70 flex flex-col items-center justify-center gap-3">
                <span className="text-[15px] font-[Syne] font-bold text-[var(--sl-t1)]">
                  PRO — Projeção 12 meses
                </span>
                <p className="text-[12px] text-[var(--sl-t2)] text-center max-w-[220px]">
                  Desbloqueie a projeção completa de 12 meses com o plano PRO.
                </p>
                <button className="px-4 py-2 rounded-full text-white text-[12px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}>
                  Ver PRO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
