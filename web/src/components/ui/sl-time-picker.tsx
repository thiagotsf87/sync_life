'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SLTimePickerProps {
  value: string // HH:MM
  onChange: (value: string) => void
  label?: string
  className?: string
  disabled?: boolean
  step?: number // minutes increment, default 15
}

function generateTimes(step: number): string[] {
  const times: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return times
}

export function SLTimePicker({
  value,
  onChange,
  label,
  className,
  disabled = false,
  step = 15,
}: SLTimePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const times = useMemo(() => generateTimes(step), [step])

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

  // Scroll to selected time when opening
  useEffect(() => {
    if (!open || !listRef.current || !value) return
    const idx = times.indexOf(value)
    if (idx >= 0) {
      const items = listRef.current.querySelectorAll('[data-sl-time]')
      items[idx]?.scrollIntoView({ block: 'center' })
    }
  }, [open, value, times])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <p className="text-[11px] font-semibold text-[var(--sl-t2)] mb-1.5">{label}</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-[10px] text-left text-[13px]',
          'bg-[var(--sl-s2)] border border-[var(--sl-border)] transition-colors',
          'hover:border-[var(--sl-border-h)] focus:outline-none focus:border-[var(--sl-border-h)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Clock size={14} className="text-[var(--sl-t3)] shrink-0" />
        <span className={cn('flex-1 font-[DM_Mono] text-[13px]', value ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)]')}>
          {value || 'HH:MM'}
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          className={cn(
            'absolute z-50 mt-1 w-full rounded-[10px] border border-[var(--sl-border)]',
            'bg-[var(--sl-s1)] shadow-lg max-h-[240px] overflow-y-auto',
            'py-1',
          )}
        >
          {times.map(t => (
            <div
              key={t}
              data-sl-time
              className={cn(
                'px-3 py-2 text-[13px] font-[DM_Mono] cursor-pointer transition-colors',
                t === value
                  ? 'text-[var(--sl-t1)] font-medium bg-[var(--sl-s2)]'
                  : 'text-[var(--sl-t2)] hover:bg-[var(--sl-s2)]',
              )}
              onClick={() => {
                onChange(t)
                setOpen(false)
              }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
