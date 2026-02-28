'use client'

import { useState, useEffect } from 'react'
import { Crosshair, Sparkles } from 'lucide-react'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { cn } from '@/lib/utils'

export function ModePill() {
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)
  const { isFree } = useUserPlan()
  const [mounted, setMounted] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Before hydration, always show Foco to match the server render
  const isFoco = !mounted || mode === 'foco'

  const handleToggle = () => {
    if (!isFoco) {
      // Always allow going back to Foco
      setMode('foco')
      return
    }
    if (isFree) {
      setShowUpgrade(true)
      return
    }
    setMode('jornada')
  }

  return (
    <>
    <button
      onClick={handleToggle}
      aria-label={`Alternar modo: atualmente ${isFoco ? 'Foco' : 'Jornada'}`}
      className={cn(
        'sl-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
        'border transition-colors duration-200',
        isFoco
          ? 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
          : 'border-[var(--sl-accent)]/20 bg-[var(--sl-accent)]/10 text-[var(--sl-accent)] hover:bg-[var(--sl-accent)]/15',
      )}
    >
      {isFoco ? <Crosshair size={14} /> : <Sparkles size={14} />}
      <span>{isFoco ? 'Foco' : 'Jornada'}</span>
      {/* PRO gate badge — only for free users in Foco mode */}
      {isFoco && isFree && (
        <span className="ml-0.5 text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded
                         bg-[#f59e0b]/15 text-[#f59e0b]">
          PRO
        </span>
      )}
    </button>
    <UpgradeModal
      open={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      feature="jornada"
    />
    </>
  )
}
