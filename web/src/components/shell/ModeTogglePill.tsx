'use client'

import { useShellStore } from '@/stores/shell-store'
import { cn } from '@/lib/utils'

export function ModeTogglePill() {
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)

  return (
    <div className="flex bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[20px] p-[3px] gap-[2px]">
      <button
        onClick={() => setMode('foco')}
        className={cn(
          'px-3 py-[5px] rounded-[16px] text-[12px] font-medium whitespace-nowrap transition-all duration-150',
          mode === 'foco'
            ? 'bg-[#10b981] text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
            : 'text-[var(--sl-t2)]',
        )}
      >
        Foco
      </button>
      <button
        onClick={() => setMode('jornada')}
        className={cn(
          'px-3 py-[5px] rounded-[16px] text-[12px] font-medium whitespace-nowrap transition-all duration-150',
          mode === 'jornada'
            ? 'bg-[#10b981] text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
            : 'text-[var(--sl-t2)]',
        )}
      >
        Jornada
      </button>
    </div>
  )
}
