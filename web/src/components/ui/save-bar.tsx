'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveBarProps {
  hasChanges: boolean
  onSave: () => void
  onDiscard: () => void
  saving?: boolean
}

export function SaveBar({ hasChanges, onSave, onDiscard, saving = false }: SaveBarProps) {
  return (
    <div
      aria-hidden={!hasChanges}
      className={cn(
        'fixed bottom-6 left-0 right-0 z-50 flex justify-center',
        'pointer-events-none transition-all duration-300',
        hasChanges ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4'
      )}
    >
      <div
        className="flex items-center gap-3 rounded-full py-3 px-6"
        style={{
          background: 'var(--sl-s1)',
          border: '1px solid var(--sl-border-h)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <p className="font-[DM_Sans] text-sm text-[var(--sl-t2)] mr-1 whitespace-nowrap">
          Você tem alterações não salvas
        </p>

        <button
          onClick={onDiscard}
          disabled={saving}
          className={cn(
            'font-[DM_Sans] text-sm font-medium px-4 py-1.5 rounded-full',
            'border border-[var(--sl-border)] text-[var(--sl-t3)]',
            'transition-colors duration-150',
            'hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)]',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          Descartar
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          className={cn(
            'font-[DM_Sans] text-sm font-semibold px-4 py-1.5 rounded-full',
            'text-white flex items-center gap-1.5',
            'transition-colors duration-150',
            'hover:opacity-90',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
          style={{ background: 'var(--sl-em)' }}
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
