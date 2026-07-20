import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  hint?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, prefix, suffix, className, ...props }, ref) => (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex items-center gap-2 bg-[var(--sl-s2)] border rounded-[10px] px-3.5 py-2.5 transition-colors',
          error
            ? 'border-[var(--sl-danger)]'
            : 'border-[var(--sl-border)] focus-within:border-[var(--sl-border-em)]',
        )}
      >
        {prefix && <span className="text-[var(--sl-t3)] shrink-0">{prefix}</span>}
        <input
          ref={ref}
          className={cn(
            'flex-1 bg-transparent outline-none text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]',
            className,
          )}
          {...props}
        />
        {suffix && <span className="text-[var(--sl-t3)] shrink-0">{suffix}</span>}
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
TextField.displayName = 'TextField'
