'use client'

import { cn } from '@/lib/utils'
import { maskCurrency, parseCurrency } from '@/lib/currency'

interface CurrencyInputProps {
  value: string
  onChange: (masked: string, numeric: number) => void
  currency?: 'BRL' | 'USD' | 'EUR'
  placeholder?: string
  error?: boolean
  className?: string
}

const PREFIXES: Record<string, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '\u20AC',
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'BRL',
  placeholder = '0,00',
  error,
  className,
}: CurrencyInputProps) {
  const prefix = PREFIXES[currency] || 'R$'

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCurrency(e.target.value)
    onChange(masked, parseCurrency(masked))
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
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[13px] font-[DM_Mono] text-[var(--sl-t3)] pointer-events-none">
        {prefix}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent pl-[38px] pr-3 py-2.5 text-[14px] font-[DM_Mono] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]/50"
      />
    </div>
  )
}
