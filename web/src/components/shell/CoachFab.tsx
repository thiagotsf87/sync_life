'use client'

import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useCoachStore } from '@/stores/coach-store'

/** FAB mobile do Coach — abre o drawer. Oculto em /coach e /configuracoes. */
export function CoachFab() {
  const pathname = usePathname()
  const openOverlay = useCoachStore((s) => s.openOverlay)
  if (pathname?.startsWith('/coach') || pathname?.startsWith('/configuracoes')) return null
  return (
    <button type="button" onClick={() => openOverlay('coachDrawer')} aria-label="Abrir Coach"
      className="fixed bottom-[84px] left-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg lg:hidden"
      style={{ background: 'var(--sl-em)' }}>
      <Sparkles size={20} />
    </button>
  )
}
