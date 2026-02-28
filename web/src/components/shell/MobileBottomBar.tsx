'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { IconPanorama, IconFinancas, IconFuturo, IconTempo } from './icons'
import { MobileMoreSheet } from './MobileMoreSheet'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

const BOTTOM_TABS: { id: ModuleId | 'mais'; label: string; icon: 'panorama' | 'financas' | 'futuro' | 'tempo' | 'mais' }[] = [
  { id: 'panorama', label: 'Início', icon: 'panorama' },
  { id: 'financas', label: 'Finanças', icon: 'financas' },
  { id: 'futuro', label: 'Futuro', icon: 'futuro' },
  { id: 'tempo', label: 'Tempo', icon: 'tempo' },
  { id: 'mais', label: 'Mais', icon: 'mais' },
]

const ICON_MAP = {
  panorama: IconPanorama,
  financas: IconFinancas,
  futuro: IconFuturo,
  tempo: IconTempo,
} as const

export function MobileBottomBar() {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const [moreOpen, setMoreOpen] = useState(false)

  const handleClick = useCallback((id: ModuleId | 'mais') => {
    if (id === 'mais') {
      setMoreOpen(true)
      return
    }
    router.push(MODULES[id].basePath)
  }, [router])

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[64px] items-center justify-around
                       border-t border-[var(--sl-border)] bg-[var(--sl-s1)]
                       lg:hidden">
        {BOTTOM_TABS.map((tab) => {
          const isActive = tab.id !== 'mais' && activeModule === tab.id
          const isMais = tab.id === 'mais'
          const color = !isMais ? MODULES[tab.id as ModuleId].color : 'var(--sl-t2)'

          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5',
                'transition-colors duration-150',
              )}
              style={{ color: isActive ? color : 'var(--sl-t3)' }}
            >
              {isMais ? (
                <MoreHorizontal size={22} />
              ) : (
                (() => {
                  const Icon = ICON_MAP[tab.icon as keyof typeof ICON_MAP]
                  return Icon ? <Icon size={22} /> : null
                })()
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  )
}
