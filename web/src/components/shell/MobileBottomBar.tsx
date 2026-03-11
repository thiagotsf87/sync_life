'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { IconPanorama, MODULE_ICONS } from './icons'
import { MobileMoreSheet } from './MobileMoreSheet'
import { QuickActionSheet } from './QuickActionSheet'
import { QuickEntrySheet } from './QuickEntrySheet'
import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

type TabId = ModuleId | 'mais'

interface MobileBottomBarProps {
  userName?: string
}

export function MobileBottomBar({ userName }: MobileBottomBarProps) {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const pinnedModules = useShellStore((s) => s.pinnedModules)
  const refreshPinned = useShellStore((s) => s.refreshPinnedModules)
  const [moreOpen, setMoreOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [quickEntryOpen, setQuickEntryOpen] = useState(false)

  useEffect(() => {
    refreshPinned()
  }, [refreshPinned])

  const handleClick = useCallback((id: TabId) => {
    if (id === 'mais') {
      setMoreOpen(true)
      return
    }
    const mod = MODULES[id as ModuleId]
    if (mod) router.push(mod.basePath)
  }, [router])

  const renderModuleTab = (moduleId: string) => {
    const mod = MODULES[moduleId as ModuleId]
    if (!mod) return null
    const isActive = activeModule === moduleId
    const Icon = MODULE_ICONS[moduleId as keyof typeof MODULE_ICONS]
    return (
      <button
        key={moduleId}
        onClick={() => handleClick(moduleId as TabId)}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-1.5',
          'transition-colors duration-150 min-w-[52px]',
        )}
        style={{ color: isActive ? mod.color : 'var(--sl-t3)' }}
      >
        {Icon ? <Icon size={22} /> : null}
        <span className={cn('text-[10px] font-medium', isActive && 'text-[#10b981]')}>
          {mod.label}
        </span>
      </button>
    )
  }

  const renderMaisTab = () => (
    <button
      key="mais"
      onClick={() => handleClick('mais')}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 py-1.5',
        'transition-colors duration-150 min-w-[52px]',
      )}
      style={{ color: 'var(--sl-t3)' }}
    >
      <MoreHorizontal size={22} />
      <span className="text-[10px] font-medium">Mais</span>
    </button>
  )

  const pinnedSlots = pinnedModules.slice(0, 3)

  return (
    <>
      {/* Barra inferior — apenas módulos (Home + fixados + Mais) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[68px] items-center
                    border-t border-[var(--sl-border)]
                    lg:hidden"
        style={{
          background: 'color-mix(in srgb, var(--sl-s1) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Home (sempre primeiro) */}
        <button
          onClick={() => handleClick('panorama')}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-1.5',
            'transition-colors duration-150 min-w-[52px]',
          )}
          style={{ color: activeModule === 'panorama' ? '#6366f1' : 'var(--sl-t3)' }}
        >
          <IconPanorama size={22} />
          <span className={cn('text-[10px] font-medium', activeModule === 'panorama' && 'text-[#10b981]')}>
            Home
          </span>
        </button>

        {/* Módulos fixados (até 3) */}
        {pinnedSlots.map(renderModuleTab)}

        {/* Mais (sempre último) */}
        {renderMaisTab()}
      </nav>

      {/* FAB flutuante — canto inferior direito, acima da barra */}
      <button
        onClick={() => setQuickActionOpen(true)}
        className="fixed z-50 lg:hidden flex h-[56px] w-[56px] items-center justify-center rounded-full
                   shadow-[0_4px_24px_rgba(16,185,129,0.45)]
                   transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #10b981, #0055ff)',
          bottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 16px)',
          right: 20,
          border: '3px solid var(--sl-bg)',
        }}
        aria-label="Ação rápida"
      >
        <Plus size={24} className="text-white" strokeWidth={2.5} />
      </button>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} userName={userName} />
      <QuickActionSheet
        open={quickActionOpen}
        onOpenChange={setQuickActionOpen}
        activeModule={activeModule}
        onOpenQuickEntry={() => setQuickEntryOpen(true)}
      />
      <QuickEntrySheet open={quickEntryOpen} onOpenChange={setQuickEntryOpen} />
    </>
  )
}
