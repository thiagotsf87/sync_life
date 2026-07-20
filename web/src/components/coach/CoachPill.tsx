'use client'

import { Sparkles } from 'lucide-react'
import { KbdChip } from '@/components/ui/kbd-chip'
import { useCoachStore } from '@/stores/coach-store'

/** Trigger do Coach no header desktop — abre o drawer (Cmd+J). */
export function CoachPill() {
  const openOverlay = useCoachStore((s) => s.openOverlay)
  return (
    <button type="button" onClick={() => openOverlay('coachDrawer')} aria-label="Abrir Coach"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sl-border-em)] bg-[var(--sl-em-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--sl-t1)] hover:border-[var(--sl-em)]">
      <Sparkles size={13} className="text-[var(--sl-em)]" />
      Coach
      <KbdChip>⌘J</KbdChip>
    </button>
  )
}
