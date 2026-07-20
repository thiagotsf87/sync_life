import { create } from 'zustand'

export type OverlayName = 'palette' | 'coachDrawer' | 'cheat'

interface CoachState {
  /** Overlay aberto no momento (um por vez) ou null. */
  open: OverlayName | null
  /** Prompt a injetar no CoachChat quando o drawer abre via palette/sugestão. */
  pendingPrompt: string | null
  openOverlay: (name: OverlayName) => void
  toggleOverlay: (name: OverlayName) => void
  openDrawerWithPrompt: (prompt: string) => void
  consumePendingPrompt: () => string | null
  closeAll: () => void
}

export const useCoachStore = create<CoachState>((set, get) => ({
  open: null,
  pendingPrompt: null,
  openOverlay: (name) => set({ open: name }),
  toggleOverlay: (name) => set((s) => ({ open: s.open === name ? null : name })),
  openDrawerWithPrompt: (prompt) => set({ open: 'coachDrawer', pendingPrompt: prompt }),
  consumePendingPrompt: () => {
    const p = get().pendingPrompt
    if (p) set({ pendingPrompt: null })
    return p
  },
  closeAll: () => set({ open: null, pendingPrompt: null }),
}))
