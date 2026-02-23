'use client'

import { useShellStore } from '@/stores/shell-store'

export function useMode() {
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)

  return {
    mode,
    isFoco: mode === 'foco',
    isJornada: mode === 'jornada',
    setMode,
  }
}
