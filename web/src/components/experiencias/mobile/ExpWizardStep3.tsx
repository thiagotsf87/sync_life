'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BG, EXP_PRIMARY_BORDER } from '@/lib/exp-colors'

interface ExpWizardStep3Props {
  tripName: string
  destinations: string[]
  companion: string
  startDate: Date | null
  setStartDate: (d: Date | null) => void
  endDate: Date | null
  setEndDate: (d: Date | null) => void
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

function getWeekdayName(d: Date): string {
  return ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][d.getDay()]
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function ExpWizardStep3({
  tripName, destinations, companion, startDate, setStartDate, endDate, setEndDate,
}: ExpWizardStep3Props) {
  const accent = EXP_PRIMARY
  const [viewMonth, setViewMonth] = useState(() => {
    const d = startDate || new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
  const firstDow = new Date(viewMonth.year, viewMonth.month, 1).getDay()
  const totalDays = startDate && endDate ? diffDays(startDate, endDate) : 0

  function handleDayClick(day: number) {
    const clicked = new Date(viewMonth.year, viewMonth.month, day)
    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked)
      setEndDate(null)
    } else {
      if (clicked < startDate) {
        setStartDate(clicked)
      } else {
        setEndDate(clicked)
      }
    }
  }

  function isDayInRange(day: number): boolean {
    if (!startDate || !endDate) return false
    const d = new Date(viewMonth.year, viewMonth.month, day)
    return d > startDate && d < endDate
  }

  function isDaySelected(day: number): boolean {
    const d = new Date(viewMonth.year, viewMonth.month, day)
    if (startDate && d.toDateString() === startDate.toDateString()) return true
    if (endDate && d.toDateString() === endDate.toDateString()) return true
    return false
  }

  function prevMonth() {
    setViewMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 })
  }

  function nextMonth() {
    setViewMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 })
  }

  const companionLabel = companion === 'solo' ? 'Solo' : companion === 'couple' ? 'Casal' : companion === 'family' ? 'Família' : 'Amigos'

  return (
    <div className="px-4">
      <div
        className="flex items-center gap-2 px-[13px] py-2 rounded-[20px] mb-3"
        style={{ background: EXP_PRIMARY_BG, border: `1px solid ${EXP_PRIMARY_BORDER}` }}
      >
        <span className="text-[14px]">⚡</span>
        <span className="text-[12px] font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
          Confirmar missão vale <strong className="text-[var(--sl-t1)]">+50 XP</strong>
        </span>
      </div>

      {/* Trip summary */}
      <div
        className="flex gap-[10px] items-center rounded-[10px] p-3 mb-3"
        style={{
          background: 'linear-gradient(135deg, var(--sl-s1), rgba(139,92,246,0.04))',
          border: `1px solid ${EXP_PRIMARY_BORDER}`,
        }}
      >
        <span className="text-[22px]">🗾</span>
        <div>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)]">
            {tripName || 'Viagem'} — País #8
          </p>
          <p className="text-[12px] text-[var(--sl-t2)]">{destinations.join(' · ')} · {companionLabel}</p>
          <p className="text-[10px] font-bold mt-[2px]" style={{ color: EXP_PRIMARY_LIGHT }}>
            Novo país = +80 XP extra
          </p>
        </div>
      </div>

      <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-3">
        Quando começa sua aventura?
      </p>

      {/* Date display boxes */}
      <div className="flex gap-2 mb-3">
        <div
          className="flex-1 rounded-[10px] p-3"
          style={{ background: 'var(--sl-s1)', border: `1.5px solid ${startDate ? accent : 'var(--sl-border)'}` }}
        >
          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: startDate ? accent : 'var(--sl-t2)' }}>
            PARTIDA ✈️
          </p>
          <p className="text-[16px] font-semibold text-[var(--sl-t1)]">
            {startDate ? formatDate(startDate) : '—'}
          </p>
          {startDate && <p className="text-[12px] text-[var(--sl-t2)]">{getWeekdayName(startDate)}</p>}
        </div>
        <div
          className="flex-1 rounded-[10px] p-3"
          style={{ background: 'var(--sl-s1)', border: `1.5px solid ${endDate ? 'var(--sl-border)' : 'var(--sl-border)'}` }}
        >
          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--sl-t2)' }}>
            RETORNO 🏠
          </p>
          <p className="text-[16px] font-semibold text-[var(--sl-t1)]">
            {endDate ? formatDate(endDate) : '—'}
          </p>
          {endDate && <p className="text-[12px] text-[var(--sl-t2)]">{getWeekdayName(endDate)}</p>}
        </div>
      </div>

      {/* Calendar */}
      <div
        className="rounded-[10px] p-[14px] mb-[14px]"
        style={{ background: 'var(--sl-s1)', border: `1px solid ${EXP_PRIMARY_BORDER}` }}
      >
        <div className="flex justify-between items-center mb-[10px]">
          <button onClick={prevMonth}><ChevronLeft size={16} className="text-[var(--sl-t2)]" /></button>
          <span className="text-[14px] font-semibold text-[var(--sl-t1)]">
            {MONTHS[viewMonth.month]} {viewMonth.year}
          </span>
          <button onClick={nextMonth}><ChevronRight size={16} className="text-[var(--sl-t2)]" /></button>
        </div>
        <div className="grid grid-cols-7 gap-[2px] text-center">
          {WEEKDAYS.map((wd, i) => (
            <div key={i} className="text-[10px] text-[var(--sl-t3)] py-[2px]">{wd}</div>
          ))}
          {Array.from({ length: firstDow }, (_, i) => (
            <div key={`e${i}`} className="text-[11px] p-1" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const selected = isDaySelected(day)
            const inRange = isDayInRange(day)
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className="text-[11px] p-1"
                style={
                  selected
                    ? { background: accent, color: '#fff', borderRadius: '50%', fontWeight: 600 }
                    : inRange
                    ? { background: 'rgba(139,92,246,0.15)', color: 'var(--sl-t1)' }
                    : { color: 'var(--sl-t3)' }
                }
              >
                {day}
              </button>
            )
          })}
        </div>
        {totalDays > 0 && (
          <p className="text-[12px] text-center mt-2 font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
            🗓️ {totalDays} dias de aventura
          </p>
        )}
      </div>
    </div>
  )
}
