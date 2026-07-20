'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CoachChat } from './CoachChat'
import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

export interface CoachDrawerProps {
  open: boolean
  onClose: () => void
  activeModule: ModuleId
  pendingPrompt: string | null
}

/** Drawer do Coach (Cmd+J) — chat contextual por módulo ativo. */
export function CoachDrawer({ open, onClose, activeModule, pendingPrompt }: CoachDrawerProps) {
  const mod = MODULES[activeModule] ?? MODULES.panorama
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent data-sl-overlay
        className="flex w-full flex-col border-l border-[var(--sl-border)] bg-[var(--sl-s1)] sm:max-w-md"
        style={{ zIndex: 'var(--sl-z-drawer)' }}>
        <SheetHeader className="px-0">
          <SheetTitle className="font-syne text-[var(--sl-t1)]">
            Coach · <span style={{ color: mod.color }}>{mod.label}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <CoachChat
            endpoint="/api/ai/coach"
            buildBody={(messages) => ({ messages })}
            initialPrompt={pendingPrompt}
            suggestedPrompts={[`Como está meu módulo ${mod.label}?`, 'O que devo priorizar esta semana?']}
            placeholder={`Pergunte sobre ${mod.label}`}
            disclaimer="O Coach pode errar. Confira dados importantes."
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
