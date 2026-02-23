'use client'

import { useShellStore } from '@/stores/shell-store'
import { cn } from '@/lib/utils'

export function ThemePill() {
  const theme = useShellStore((s) => s.theme)
  const setTheme = useShellStore((s) => s.setTheme)

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'sl-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
        'border transition-colors duration-200',
        'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)]',
        'hover:border-[var(--sl-border-h)]',
      )}
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
