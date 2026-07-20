'use client'

import { useShellStore } from '@/stores/shell-store'
import { useCoachStore } from '@/stores/coach-store'
import { useGlobalKeys } from '@/hooks/use-global-keys'
import { CommandPalette } from './CommandPalette'
import { CoachDrawer } from './CoachDrawer'
import { CheatSheet } from './CheatSheet'
import { CoachFab } from '@/components/shell/CoachFab'

/** Monta os 3 overlays + o FAB mobile e liga os atalhos globais. */
export function CoachOSOverlays() {
  useGlobalKeys()
  const activeModule = useShellStore((s) => s.activeModule)
  const open = useCoachStore((s) => s.open)
  const pendingPrompt = useCoachStore((s) => s.pendingPrompt)
  const closeAll = useCoachStore((s) => s.closeAll)
  return (
    <>
      <CommandPalette open={open === 'palette'} onClose={closeAll} activeModule={activeModule} />
      <CoachDrawer open={open === 'coachDrawer'} onClose={closeAll} activeModule={activeModule} pendingPrompt={pendingPrompt} />
      <CheatSheet open={open === 'cheat'} onClose={closeAll} />
      <CoachFab />
    </>
  )
}
