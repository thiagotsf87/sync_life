'use client'

import { cn } from '@/lib/utils'

interface UnitInputProps {
  value: string
  onChange: (value: string) => void
  unit: string
  step?: number
  placeholder?: string
  error?: boolean
  className?: string
}

export function UnitInput({
  value,
  onChange,
  unit,
  step,
  placeholder = '0',
  error,
  className,
}: UnitInputProps) {
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
        onChange={(e) => onChange(e.target.value)}
        step={step}
        placeholder={placeholder}
        className="w-full bg-transparent pl-3 pr-[44px] py-2.5 text-[14px] font-[DM_Mono] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]/50 [appearance:textfield]"
      />
      <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[13px] font-[DM_Mono] text-[var(--sl-t3)] pointer-events-none">
        {unit}
      </span>
    </div>
  )
}
