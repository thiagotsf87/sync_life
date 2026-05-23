'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SLSelectOption {
  value: string
  label: string
  icon?: string
}

interface SLSelectProps {
  options: SLSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  /** Render dropdown in portal — use when inside scroll containers to avoid clipping */
  portal?: boolean
}

export function SLSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  className,
  disabled = false,
  portal = false,
}: SLSelectProps) {
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  // Update dropdown position when opening (for portal) — useLayoutEffect to avoid flash
  useLayoutEffect(() => {
    if (!open || !portal) {
      if (!open) setDropdownRect(null)
      return
    }
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    const padding = 8
    const listHeight = Math.min(240, options.length * 36 + 16)
    const listWidth = Math.max(rect.width, 200) // min 200px para labels completos
    const spaceBelow = vh - rect.bottom - padding
    const spaceAbove = rect.top - padding
    const openDown = spaceBelow >= listHeight || spaceBelow >= spaceAbove
    let top = openDown ? rect.bottom + 4 : rect.top - listHeight - 4
    let left = rect.left
    // Clamp to viewport para evitar corte
    top = Math.max(padding, Math.min(top, vh - listHeight - padding))
    left = Math.max(padding, Math.min(left, vw - listWidth - padding))
    setDropdownRect({ top, left, width: listWidth })
  }, [open, portal, options.length])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inList = portal ? listRef.current?.contains(target) : false
      if (!inTrigger && !inList) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, portal])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || highlightIdx < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[data-sl-option]')
    items[highlightIdx]?.scrollIntoView({ block: 'nearest' })
  }, [highlightIdx, open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setHighlightIdx(options.findIndex(o => o.value === value))
        } else if (highlightIdx >= 0) {
          onChange(options[highlightIdx].value)
          setOpen(false)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setHighlightIdx(options.findIndex(o => o.value === value))
        } else {
          setHighlightIdx(i => (i + 1) % options.length)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) {
          setHighlightIdx(i => (i - 1 + options.length) % options.length)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }, [disabled, open, highlightIdx, options, value, onChange])

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
            if (!open) setHighlightIdx(options.findIndex(o => o.value === value))
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-[10px] text-left text-[13px]',
          'bg-[var(--sl-s2)] border border-[var(--sl-border)] transition-colors',
          'hover:border-[var(--sl-border-h)] focus:outline-none focus:border-[var(--sl-border-h)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.icon && <span className="text-[14px]">{selected.icon}</span>}
        <span className={cn('flex-1 truncate', selected ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)]')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-[var(--sl-t3)] transition-transform shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (portal && dropdownRect ? (
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            className={cn(
              'fixed z-[9999] rounded-[10px] border border-[var(--sl-border)]',
              'bg-[var(--sl-s1)] shadow-lg max-h-[240px] overflow-y-auto',
              'py-1',
            )}
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
          >
            {options.map((opt, i) => (
              <div
                key={opt.value}
                data-sl-option
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer transition-colors',
                  i === highlightIdx && 'bg-[var(--sl-s2)]',
                  opt.value === value ? 'text-[var(--sl-t1)] font-medium' : 'text-[var(--sl-t2)]',
                )}
                onMouseEnter={() => setHighlightIdx(i)}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.icon && <span className="text-[14px] shrink-0">{opt.icon}</span>}
                <span className="flex-1 min-w-0 break-words">{opt.label}</span>
                {opt.value === value && <Check size={14} className="text-[#10b981] shrink-0" />}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-[var(--sl-t3)]">Nenhuma opção</div>
            )}
          </div>,
          document.body,
        )
      ) : !portal && (
        <div
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-[10px] border border-[var(--sl-border)]',
            'bg-[var(--sl-s1)] shadow-lg max-h-[240px] overflow-y-auto',
            'py-1',
          )}
        >
          {options.map((opt, i) => (
            <div
              key={opt.value}
              data-sl-option
              role="option"
              aria-selected={opt.value === value}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer transition-colors',
                i === highlightIdx && 'bg-[var(--sl-s2)]',
                opt.value === value ? 'text-[var(--sl-t1)] font-medium' : 'text-[var(--sl-t2)]',
              )}
              onMouseEnter={() => setHighlightIdx(i)}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.icon && <span className="text-[14px] shrink-0">{opt.icon}</span>}
              <span className="flex-1 min-w-0 break-words">{opt.label}</span>
              {opt.value === value && <Check size={14} className="text-[#10b981] shrink-0" />}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-[var(--sl-t3)]">Nenhuma opção</div>
          )}
        </div>
      ))}
    </div>
  )
}
