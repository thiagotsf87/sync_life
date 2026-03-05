'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { IconPanorama, IconFinancas, IconTempo } from './icons'
import { MobileMoreSheet } from './MobileMoreSheet'
import { QuickEntrySheet } from './QuickEntrySheet'
import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

type TabId = ModuleId | 'fab' | 'mais'

const LEFT_TABS: { id: TabId; label: string; icon: 'panorama' | 'financas' }[] = [
  { id: 'panorama', label: 'Home', icon: 'panorama' },
  { id: 'financas', label: 'Finanças', icon: 'financas' },
]

const RIGHT_TABS: { id: TabId; label: string; icon: 'tempo' | 'mais' }[] = [
  { id: 'tempo', label: 'Tempo', icon: 'tempo' },
  { id: 'mais', label: 'Mais', icon: 'mais' },
]

const ICON_MAP = {
  panorama: IconPanorama,
  financas: IconFinancas,
  tempo: IconTempo,
} as const

interface MobileBottomBarProps {
  userName?: string
}

export function MobileBottomBar({ userName }: MobileBottomBarProps) {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const [moreOpen, setMoreOpen] = useState(false)
  const [quickEntryOpen, setQuickEntryOpen] = useState(false)

  const handleClick = useCallback((id: TabId) => {
    if (id === 'mais') {
      setMoreOpen(true)
      return
    }
    if (id === 'fab') return
    router.push(MODULES[id as ModuleId].basePath)
  }, [router])

  const renderTab = (tab: { id: TabId; label: string; icon: string }) => {
    const isActive = tab.id !== 'mais' && tab.id !== 'fab' && activeModule === tab.id
    const isMais = tab.id === 'mais'
    const color = !isMais ? MODULES[tab.id as ModuleId]?.color : 'var(--sl-t2)'

    return (
      <button
        key={tab.id}
        onClick={() => handleClick(tab.id)}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-1.5',
          'transition-colors duration-150',
          'min-w-[52px]',
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
        <span className={cn(
          'text-[10px] font-medium',
          isActive && 'text-[#10b981]',
        )}>
          {tab.label}
        </span>
      </button>
    )
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center
                    border-t border-[var(--sl-border)]
                    lg:hidden"
        style={{
          background: 'color-mix(in srgb, var(--sl-s1) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Left tabs */}
        {LEFT_TABS.map(renderTab)}

        {/* FAB center */}
        <div className="flex flex-col items-center justify-center px-2">
          <button
            onClick={() => setQuickEntryOpen(true)}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full
                        shadow-[0_4px_20px_rgba(16,185,129,0.4)]
                        transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #10b981, #0055ff)',
              marginTop: '-12px',
              border: '3px solid var(--sl-bg)',
            }}
          >
            <Plus size={22} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map(renderTab)}
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} userName={userName} />
      <QuickEntrySheet open={quickEntryOpen} onOpenChange={setQuickEntryOpen} />
    </>
  )
}
