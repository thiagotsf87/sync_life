'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Pin, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MODULES } from '@/lib/modules'
import { useShellStore } from '@/stores/shell-store'
import { cn } from '@/lib/utils'

/** Altura da barra inferior — sheet emerge do topo da barra */
const BOTTOM_BAR_HEIGHT = 68

interface MobileMoreSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

const PINNABLE_MODULES = [
  { id: 'financas', emoji: '💰', label: 'Finanças', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { id: 'tempo', emoji: '⏳', label: 'Tempo', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { id: 'futuro', emoji: '🔮', label: 'Futuro', color: '#0055ff', bg: 'rgba(0,85,255,0.15)' },
  { id: 'corpo', emoji: '🏃', label: 'Corpo', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { id: 'mente', emoji: '🧠', label: 'Mente', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { id: 'patrimonio', emoji: '📈', label: 'Patrimônio', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 'carreira', emoji: '💼', label: 'Carreira', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  { id: 'experiencias', emoji: '✈️', label: 'Experiências', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
] as const

export function MobileMoreSheet({ open, onOpenChange, userName }: MobileMoreSheetProps) {
  const router = useRouter()
  const pinned = useShellStore((s) => s.pinnedModules)
  const setPinnedModules = useShellStore((s) => s.setPinnedModules)
  const refreshPinned = useShellStore((s) => s.refreshPinnedModules)

  useEffect(() => {
    if (open) refreshPinned()
  }, [open, refreshPinned])

  const handleNavigate = useCallback((moduleId: string) => {
    const mod = MODULES[moduleId as keyof typeof MODULES]
    if (mod) {
      router.push(mod.basePath)
      onOpenChange(false)
    }
  }, [router, onOpenChange])

  const togglePin = useCallback((moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const next = pinned.includes(moduleId)
      ? pinned.filter((id) => id !== moduleId)
      : [...pinned, moduleId].slice(0, 3)
    setPinnedModules(next)
  }, [pinned, setPinnedModules])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onOpenChange(false)
    router.push('/login')
    router.refresh()
  }, [router, onOpenChange])

  if (!open) return null

  return (
    <>
      {/* Backdrop — fecha ao tocar fora */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 lg:hidden animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      {/* Sheet — emerge do topo do MobileBottomBar, igual ao QuickActionSheet */}
      <div
        className="fixed left-0 right-0 z-[70] lg:hidden
                    bg-[var(--sl-s1)] border-t border-[var(--sl-border)]
                    rounded-t-[24px] px-4 pb-[env(safe-area-inset-bottom,16px)]
                    animate-in slide-in-from-bottom duration-300"
        style={{ bottom: `calc(${BOTTOM_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))` }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-[var(--sl-s3)]" />
        </div>

        <h2 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-1">
          Todos os Módulos
        </h2>
        <p className="text-[12px] text-[var(--sl-t3)] mb-4">
          Toque para abrir. Fixar para manter na barra (até 3).
        </p>

        {/* Grid 2×4 — módulos fixáveis */}
        <div className="grid grid-cols-4 gap-2">
          {PINNABLE_MODULES.map((mod) => {
            const isPinned = pinned.includes(mod.id)
            return (
              <div
                key={mod.id}
                onClick={() => handleNavigate(mod.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-[14px] px-2 py-3 cursor-pointer',
                  'border transition-all duration-150 active:scale-95',
                  isPinned
                    ? 'border-[rgba(16,185,129,0.4)]'
                    : 'border-[var(--sl-border)]',
                )}
                style={{
                  background: isPinned ? mod.bg : 'var(--sl-s2)',
                }}
              >
                <div className="relative">
                  <div
                    className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] text-[20px]"
                    style={{ background: mod.bg }}
                  >
                    {mod.emoji}
                  </div>
                  {isPinned && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#10b981]"
                      title="Fixado na barra"
                    >
                      <Pin size={10} className="text-white" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-[var(--sl-t1)] text-center leading-tight">
                  {mod.label}
                </span>
                <button
                  type="button"
                  onClick={(e) => togglePin(mod.id, e)}
                  className={cn(
                    'text-[10px] font-medium px-2 py-1 rounded-lg transition-colors',
                    'min-h-[24px] flex items-center justify-center',
                    isPinned
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'text-[var(--sl-t3)] hover:bg-[var(--sl-s3)]',
                  )}
                >
                  {isPinned ? 'Fixado' : 'Fixar'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Config + Logout — linha separada */}
        <div className="mt-4 pt-4 border-t border-[var(--sl-border)] space-y-1">
          <button
            onClick={() => handleNavigate('configuracoes')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px]
                       text-[14px] text-[var(--sl-t2)] transition-colors
                       hover:bg-[var(--sl-s2)] active:bg-[var(--sl-s3)]"
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Configurações</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px]
                       text-[14px] text-[var(--sl-t2)] transition-colors
                       hover:bg-[var(--sl-s2)] active:bg-[var(--sl-s3)]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sair da conta</span>
            {userName && (
              <span className="ml-auto text-[12px] text-[var(--sl-t3)]">{userName}</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
