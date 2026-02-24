'use client'

import { useState, useEffect } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import { cn } from '@/lib/utils'

export function ModePill() {
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)
  const { isFree } = useUserPlan()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Before hydration, always show Foco to match the server render
  const isFoco = !mounted || mode === 'foco'

  return (
    <button
      onClick={() => setMode(isFoco ? 'jornada' : 'foco')}
      className={cn(
        'sl-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
        'border transition-colors duration-200',
        isFoco
          ? 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
          : 'border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/15',
      )}
    >
      <span>{isFoco ? '🎯' : '🌱'}</span>
      <span>{isFoco ? 'Foco' : 'Jornada'}</span>
      {/* PRO gate badge — only for free users switching to Jornada */}
      {isFoco && isFree && (
        <span className="ml-0.5 text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded
                         bg-[#f59e0b]/15 text-[#f59e0b]">
          PRO
        </span>
      )}
    </button>
  )
}
