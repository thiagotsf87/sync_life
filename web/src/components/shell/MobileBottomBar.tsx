'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { IconPanorama, IconFinancas, IconTempo } from './icons'
import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

type TabId = ModuleId | 'mais' | 'fab'

const BOTTOM_TABS: { id: TabId; label: string; icon: 'panorama' | 'financas' | 'tempo' | 'mais' | 'fab' }[] = [
  { id: 'panorama',  label: 'Início',   icon: 'panorama' },
  { id: 'financas',  label: 'Finanças', icon: 'financas' },
  { id: 'fab',       label: '',         icon: 'fab' },
  { id: 'tempo',     label: 'Tempo',    icon: 'tempo' },
  { id: 'mais',      label: 'Mais',     icon: 'mais' },
]

const ICON_MAP = {
  panorama: IconPanorama,
  financas: IconFinancas,
  tempo:    IconTempo,
} as const

export function MobileBottomBar() {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const setModulePickerOpen = useShellStore((s) => s.setModulePickerOpen)

  const handleClick = useCallback((id: TabId) => {
    if (id === 'mais') { setModulePickerOpen(true); return }
    if (id === 'fab')  { router.push('/quick-entry'); return }
    router.push(MODULES[id as ModuleId].basePath)
  }, [router, setModulePickerOpen])

  // "Mais" fica ativo quando módulo não está no bottom nav (corpo, mente, patrimônio, carreira, exp, futuro, conquistas)
  const maisActive = (['corpo', 'mente', 'patrimonio', 'carreira', 'experiencias', 'futuro', 'conquistas', 'configuracoes'] as ModuleId[]).includes(activeModule)
  const maisColor  = maisActive ? MODULES[activeModule].color : 'var(--sl-t2)'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--sl-border)] bg-[var(--sl-s1)] lg:hidden"
      style={{ paddingBottom: 'var(--mob-safe-bottom)' }}
    >
      <div className="flex h-[var(--mob-bottom-nav-height)] items-center justify-around relative">
        {BOTTOM_TABS.map((tab) => {
          if (tab.id === 'fab') {
            return (
              <button
                key="fab"
                onClick={() => handleClick('fab')}
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg
                           -mt-5 transition-transform duration-150 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
                aria-label="Lançamento rápido"
              >
                <Plus size={26} strokeWidth={2.5} className="text-white" />
              </button>
            )
          }

          const isActive = tab.id !== 'mais' && activeModule === tab.id
          const isMais   = tab.id === 'mais'
          const color    = isMais ? maisColor : MODULES[tab.id as ModuleId].color

          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5',
                'transition-colors duration-150 min-w-[var(--mob-tap-min)]',
              )}
              style={{ color: (isActive || (isMais && maisActive)) ? color : 'var(--sl-t3)' }}
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
      </div>
    </nav>
  )
}
