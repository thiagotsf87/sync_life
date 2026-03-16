'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SLDatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatDisplay(val: string): string {
  if (!val) return ''
  const [y, m, d] = val.split('-')
  return `${d}/${m}/${y}`
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function SLDatePicker({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/AAAA',
  className,
  disabled = false,
}: SLDatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const today = useMemo(() => {
    const now = new Date()
    return toDateStr(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  // View state for calendar navigation
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const [y] = value.split('-').map(Number)
      return y
    }
    return new Date().getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const parts = value.split('-').map(Number)
      return parts[1] - 1
    }
    return new Date().getMonth()
  })

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const pm = viewMonth === 0 ? 11 : viewMonth - 1
      const py = viewMonth === 0 ? viewYear - 1 : viewYear
      cells.push({ day: d, month: pm, year: py, isCurrentMonth: false })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true })
    }

    // Next month padding
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const nm = viewMonth === 11 ? 0 : viewMonth + 1
      const ny = viewMonth === 11 ? viewYear + 1 : viewYear
      cells.push({ day: d, month: nm, year: ny, isCurrentMonth: false })
    }

    return cells
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  function selectDate(cell: typeof calendarDays[0]) {
    const ds = toDateStr(cell.year, cell.month, cell.day)
    onChange(ds)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <p className="text-[11px] font-semibold text-[var(--sl-t2)] mb-1.5">{label}</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(o => !o)
            if (value) {
              const [y, m] = value.split('-').map(Number)
              setViewYear(y)
              setViewMonth(m - 1)
            }
          }
        }}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-[10px] text-left text-[13px]',
          'bg-[var(--sl-s2)] border border-[var(--sl-border)] transition-colors',
          'hover:border-[var(--sl-border-h)] focus:outline-none focus:border-[var(--sl-border-h)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <CalendarDays size={14} className="text-[var(--sl-t3)] shrink-0" />
        <span className={cn('flex-1 font-[DM_Mono] text-[13px]', value ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)]')}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-[280px] rounded-[14px] border border-[var(--sl-border)]',
          'bg-[var(--sl-s1)] shadow-lg p-3',
        )}>
          {/* Month/Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-[var(--sl-s2)] transition-colors"
            >
              <ChevronLeft size={16} className="text-[var(--sl-t2)]" />
            </button>
            <span className="text-[13px] font-semibold text-[var(--sl-t1)]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-[var(--sl-s2)] transition-colors"
            >
              <ChevronRight size={16} className="text-[var(--sl-t2)]" />
            </button>
          </div>

          {/* Day names header */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAY_NAMES.map((dn, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase text-[var(--sl-t3)] py-1">
                {dn}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((cell, i) => {
              const dateStr = toDateStr(cell.year, cell.month, cell.day)
              const isToday = dateStr === today
              const isSelected = dateStr === value

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(cell)}
                  className={cn(
                    'w-full aspect-square flex items-center justify-center text-[12px] rounded-lg transition-colors',
                    cell.isCurrentMonth ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)] opacity-40',
                    isSelected && 'bg-[#06b6d4] text-white font-bold',
                    isToday && !isSelected && 'ring-1 ring-[#06b6d4] font-semibold',
                    !isSelected && 'hover:bg-[var(--sl-s2)]',
                  )}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
