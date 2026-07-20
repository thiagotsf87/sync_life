import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KbdChipProps {
  children: ReactNode
  className?: string
}

/** Atalho de teclado (⌘K, ⌘J, ?, esc) em IBM Plex Mono. */
export function KbdChip({ children, className }: KbdChipProps) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-[18px] items-center justify-center rounded-[4px] border border-[var(--sl-border)] bg-[var(--sl-s2)] px-1.5 py-0.5 font-ibm-plex-mono text-[10px] font-medium leading-none text-[var(--sl-t1)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
