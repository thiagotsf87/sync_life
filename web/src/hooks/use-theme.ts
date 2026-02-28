'use client'

import { useShellStore } from '@/stores/shell-store'
import { isDarkTheme } from '@/types/shell'

export function useTheme() {
  const theme = useShellStore((s) => s.theme)
  const resolvedTheme = useShellStore((s) => s.resolvedTheme)
  const setTheme = useShellStore((s) => s.setTheme)

  return {
    theme,
    resolvedTheme,
    isDark: isDarkTheme(resolvedTheme),
    isLight: !isDarkTheme(resolvedTheme),
    setTheme,
  }
}
