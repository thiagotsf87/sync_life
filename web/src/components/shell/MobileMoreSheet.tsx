'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MODULES } from '@/lib/modules'
import { cn } from '@/lib/utils'

interface MobileMoreSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

const MODULE_GRID = [
  { id: 'financas', emoji: '💰', label: 'Finanças', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { id: 'tempo', emoji: '⏳', label: 'Tempo', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { id: 'futuro', emoji: '🔮', label: 'Futuro', color: '#0055ff', bg: 'rgba(0,85,255,0.15)' },
  { id: 'corpo', emoji: '🏃', label: 'Corpo', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { id: 'mente', emoji: '🧠', label: 'Mente', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { id: 'patrimonio', emoji: '📈', label: 'Patrimônio', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 'carreira', emoji: '💼', label: 'Carreira', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  { id: 'experiencias', emoji: '✈️', label: 'Experiências', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
  { id: 'configuracoes', emoji: '⚙️', label: 'Config', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
] as const

const PINNED_STORAGE_KEY = 'sl_pinned_modules'
const DEFAULT_PINNED = ['financas', 'tempo']

function getPinnedModules(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PINNED
  try {
    const stored = localStorage.getItem(PINNED_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_PINNED
}

function setPinnedModules(modules: string[]) {
  try {
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(modules))
  } catch { /* ignore */ }
}

export function MobileMoreSheet({ open, onOpenChange, userName }: MobileMoreSheetProps) {
  const router = useRouter()
  const [pinned, setPinned] = useState<string[]>(DEFAULT_PINNED)

  useEffect(() => {
    setPinned(getPinnedModules())
  }, [open])

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
    setPinned((prev) => {
      const next = prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId].slice(0, 3)
      setPinnedModules(next)
      return next
    })
  }, [])

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className="fixed left-0 right-0 z-[70] lg:hidden
                    bg-[var(--sl-s1)] border-t border-[var(--sl-border-h)]
                    rounded-t-[28px] px-4 pt-3 pb-[88px]
                    animate-in slide-in-from-bottom duration-300"
        style={{ bottom: 0 }}
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[var(--sl-s3)]" />

        {/* Title */}
        <h2 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-1.5">
          Todos os Módulos
        </h2>
        <p className="text-[13px] text-[var(--sl-t2)] mb-5">
          Toque para navegar, segure para fixar na barra
        </p>

        {/* 3×3 grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {MODULE_GRID.map((mod) => {
            const isPinned = pinned.includes(mod.id)
            return (
              <div
                key={mod.id}
                onClick={() => handleNavigate(mod.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-[14px] px-2 py-4 cursor-pointer',
                  'border transition-all duration-150 active:scale-95',
                  isPinned
                    ? 'border-[rgba(16,185,129,0.3)]'
                    : 'border-[var(--sl-border)]',
                )}
                style={{
                  background: isPinned ? mod.bg : 'var(--sl-s2)',
                }}
              >
                <div
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] text-[22px]"
                  style={{ background: mod.bg }}
                >
                  {mod.emoji}
                </div>
                <span className="text-[12px] font-medium text-[var(--sl-t1)] text-center">
                  {mod.label}
                </span>
                {mod.id !== 'configuracoes' && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => togglePin(mod.id, e)}
                    onKeyDown={(e) => { if (e.key === 'Enter') togglePin(mod.id, e as unknown as React.MouseEvent) }}
                    className={cn(
                      'text-[10px] transition-colors',
                      isPinned ? 'text-[#10b981]' : 'text-[var(--sl-t2)]',
                    )}
                  >
                    {isPinned ? 'Fixado ✓' : 'Fixar'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Logout */}
        <div className="mt-5 pt-4 border-t border-[var(--sl-border)]">
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
