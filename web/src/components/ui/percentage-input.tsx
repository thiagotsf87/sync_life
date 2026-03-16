'use client'

import { cn } from '@/lib/utils'

interface PercentageInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  error?: boolean
  className?: string
}

export function PercentageInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  placeholder = '0',
  error,
  className,
}: PercentageInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value)
    if (isNaN(raw)) {
      onChange(min)
      return
    }
    onChange(Math.min(Math.max(raw, min), max))
  }

  return (
    <div
      className={cn(
        'relative bg-[var(--sl-s2)] border rounded-[10px] transition-colors',
        'focus-within:border-[#10b981]',
        error ? 'border-[#f43f5e]' : 'border-[var(--sl-border)]',
        className
      )}
    >
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full bg-transparent pl-3 pr-[38px] py-2.5 text-[14px] font-[DM_Mono] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]/50 [appearance:textfield]"
      />
      <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[13px] font-[DM_Mono] text-[var(--sl-t3)] pointer-events-none">
        %
      </span>
    </div>
  )
}
