'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatDateDisplay(d: string): string {
  if (!d) return 'Selecione'
  const [y, m, day] = d.split('-')
  return new Date(+y, (+m || 1) - 1, +day || 1).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface DatePickerInputProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  error?: boolean
  className?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Selecione',
  error = false,
  className,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [calView, setCalView] = useState<{ year: number; month: number }>(() => {
    const t = new Date()
    return { year: t.getFullYear(), month: t.getMonth() }
  })
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && value) {
      const [y, m] = value.split('-').map(Number)
      setCalView({ year: y, month: (m ?? 1) - 1 })
    }
  }, [open, value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      const inInput = ref.current?.contains(target)
      const inPopover = popoverRef.current?.contains(target)
      if (!inInput && !inPopover) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function setDateFromCalendar(y: number, m: number, d: number) {
    onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    setOpen(false)
  }

  function prevMonth() {
    setCalView(v => {
      const d = new Date(v.year, v.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  function nextMonth() {
    setCalView(v => {
      const d = new Date(v.year, v.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const firstDay = new Date(calView.year, calView.month, 1).getDay()
  const daysInMonth = new Date(calView.year, calView.month + 1, 0).getDate()
  const calDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

  const selectedParts = value ? value.split('-').map(Number) : []
  const selY = selectedParts[0]
  const selM = selectedParts[1] ? selectedParts[1] - 1 : -1
  const selD = selectedParts[2]

  const POPOVER_W = 260
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})

  useLayoutEffect(() => {
    if (!open || typeof document === 'undefined') return
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    let left = rect.left + rect.width / 2 - POPOVER_W / 2
    const top = rect.bottom + 4
    const pad = 8
    if (left < pad) left = pad
    if (left + POPOVER_W > window.innerWidth - pad) left = window.innerWidth - POPOVER_W - pad
    setPopoverStyle({ position: 'fixed', left, top, zIndex: 9999 })
  }, [open])

  return (
    <div className={cn('flex flex-col gap-1.5 relative', className)} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono] flex items-center justify-between gap-2 text-left',
          error ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
          open && 'border-[#10b981]'
        )}
      >
        <span>{value ? formatDateDisplay(value) : placeholder}</span>
        <Calendar size={14} className="text-[var(--sl-t3)] shrink-0" />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="p-2 rounded-[12px] w-[260px]"
          style={{
            ...popoverStyle,
            background: 'var(--sl-s1)',
            border: '1px solid var(--sl-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:text-[var(--sl-t1)]">
              ‹
            </button>
            <span className="text-[13px] font-semibold text-[var(--sl-t1)]">
              {MONTHS_PT[calView.month]} {calView.year}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:text-[var(--sl-t1)]">
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-[10px] text-[var(--sl-t3)] mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="text-center py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={!d}
                onClick={() => d && setDateFromCalendar(calView.year, calView.month + 1, d)}
                className={cn(
                  'w-8 h-8 rounded-[8px] text-[12px] font-medium transition-colors',
                  !d && 'invisible',
                  d && selY === calView.year && selM === calView.month && selD === d
                    ? 'bg-[#10b981] text-[#03071a]'
                    : 'text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]'
                )}
              >
                {d ?? ''}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
