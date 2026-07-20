'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KbdChip } from '@/components/ui/kbd-chip'

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘K'], label: 'Command palette' },
  { keys: ['⌘J'], label: 'Coach drawer' },
  { keys: ['?'], label: 'Atalhos (este painel)' },
  { keys: ['esc'], label: 'Fechar overlay' },
]

export interface CheatSheetProps { open: boolean; onClose: () => void }

export function CheatSheet({ open, onClose }: CheatSheetProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent data-sl-overlay
        className="max-w-[420px] border-[var(--sl-border)] bg-[var(--sl-s-hero)]"
        style={{ zIndex: 'var(--sl-z-cheat)' }}>
        <DialogHeader>
          <DialogTitle className="font-syne text-[var(--sl-t1)]">Atalhos</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-[13px] text-[var(--sl-t2)]">
              <span>{s.label}</span>
              <span className="flex gap-1">{s.keys.map((k) => <KbdChip key={k}>{k}</KbdChip>)}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
