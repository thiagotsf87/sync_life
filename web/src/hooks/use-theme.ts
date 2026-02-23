'use client'

import { useShellStore } from '@/stores/shell-store'

export function useTheme() {
  const theme = useShellStore((s) => s.theme)
  const setTheme = useShellStore((s) => s.setTheme)

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    setTheme,
  }
}
