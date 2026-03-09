'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MenteTrackDeleteModalProps {
  open: boolean
  trackName: string
  hasLinkedSkillOrCost: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function MenteTrackDeleteModal({
  open,
  trackName,
  hasLinkedSkillOrCost,
  onClose,
  onConfirm,
}: MenteTrackDeleteModalProps) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[340px] bg-[var(--sl-s1)] border-[var(--sl-border)]"
      >
        <DialogHeader>
          <DialogTitle className="font-[Syne] font-bold text-[var(--sl-t1)]">
            Excluir trilha
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
            Tem certeza que deseja excluir a trilha &quot;{trackName}&quot;? Esta ação não pode ser desfeita.
            As sessões de estudo vinculadas serão mantidas.
            {hasLinkedSkillOrCost && (
              <span className="block mt-2 text-[#f59e0b]">
                ⚠️ Esta trilha pode estar vinculada a habilidades de carreira ou ter custo registrado em Finanças.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[var(--sl-border)] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-[#f43f5e] hover:bg-[#e11d48] text-white disabled:opacity-70"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
