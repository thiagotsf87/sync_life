import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { forwardRef, SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'prefix'> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, hint, error, options, className, ...props }, ref) => (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex items-center gap-2 bg-[var(--sl-s2)] border rounded-[10px] px-3.5 py-2.5 transition-colors relative',
          error
            ? 'border-[var(--sl-danger)]'
            : 'border-[var(--sl-border)] focus-within:border-[var(--sl-border-em)]',
        )}
      >
        <select
          ref={ref}
          className={cn(
            'flex-1 bg-transparent outline-none text-[14px] text-[var(--sl-t1)] appearance-none cursor-pointer pr-6',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--sl-s1)] text-[var(--sl-t1)]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="text-[var(--sl-t3)] shrink-0 pointer-events-none absolute right-3.5"
        />
      </div>
      {(error || hint) && (
        <span
          className={cn(
            'text-[11px]',
            error ? 'text-[var(--sl-danger)]' : 'text-[var(--sl-t3)]',
          )}
        >
          {error || hint}
        </span>
      )}
    </label>
  ),
)
SelectField.displayName = 'SelectField'
