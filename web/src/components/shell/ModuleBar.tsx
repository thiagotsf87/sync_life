'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { MODULE_ICONS, SyncLifeLogo } from './icons'
import { ModuleTooltip } from './ModuleTooltip'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings } from 'lucide-react'
import type { ModuleId } from '@/types/shell'

const MODULE_ORDER: ModuleId[] = ['home', 'financas', 'metas', 'agenda', 'conquistas', 'configuracoes']

interface ModuleBarProps {
  userName?: string
}

export function ModuleBar({ userName = 'U' }: ModuleBarProps) {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const [tooltip, setTooltip] = useState<{ text: string; top: number } | null>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const avatarRef = useRef<HTMLDivElement>(null)

  const avatarLetter = userName.charAt(0).toUpperCase()

  // Close avatar menu when clicking outside
  useEffect(() => {
    if (!avatarMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarMenuOpen])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }, [router])

  const handleHover = useCallback((moduleId: ModuleId) => {
    const el = btnRefs.current[moduleId]
    if (el) {
      const rect = el.getBoundingClientRect()
      setTooltip({ text: MODULES[moduleId].label, top: rect.top + rect.height / 2 - 12 })
    }
  }, [])

  const handleClick = useCallback((moduleId: ModuleId) => {
    router.push(MODULES[moduleId].basePath)
  }, [router])

  return (
    <>
      <nav
        className="sl-module-bar fixed left-0 top-0 z-[60] hidden h-screen w-[58px] flex-col items-center
                   border-r border-[var(--sl-border)] bg-[var(--sl-s1)] py-3 lg:flex
                   transition-[background,border-color] duration-400"
      >
        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl
                     transition-transform hover:scale-105"
        >
          <SyncLifeLogo size={28} />
        </button>

        {/* Module Buttons */}
        <div className="flex flex-1 flex-col items-center gap-1">
          {MODULE_ORDER.map((moduleId) => {
            const mod = MODULES[moduleId]
            const Icon = MODULE_ICONS[moduleId]
            const isActive = activeModule === moduleId

            return (
              <button
                key={moduleId}
                ref={(el) => { btnRefs.current[moduleId] = el }}
                onClick={() => handleClick(moduleId)}
                onMouseEnter={() => handleHover(moduleId)}
                onMouseLeave={() => setTooltip(null)}
                className={`sl-mod-btn relative flex h-[42px] w-[42px] items-center justify-center rounded-xl
                           transition-all duration-200 hover:scale-105
                           ${isActive ? 'sl-mod-btn-active' : ''}`}
                style={{
                  background: isActive ? mod.glowColor : 'transparent',
                  color: isActive ? mod.color : 'var(--sl-t2)',
                }}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
                    style={{ background: mod.color }}
                  />
                )}
                <Icon size={22} />
              </button>
            )
          })}
        </div>

        {/* Avatar at bottom */}
        <div className="mt-auto pt-2 relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarMenuOpen((v) => !v)}
            title={userName}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full
                       border border-[var(--sl-border)] bg-[var(--sl-s3)]
                       text-[11px] font-bold text-[var(--sl-t2)]
                       hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            {avatarLetter}
          </button>

          {/* Avatar dropdown */}
          {avatarMenuOpen && (
            <div
              className="absolute bottom-0 left-[46px] z-[70] w-[188px]
                         bg-[var(--sl-s1)] border border-[var(--sl-border)]
                         rounded-xl shadow-xl overflow-hidden"
            >
              {/* User info */}
              <div className="px-3 py-2.5 border-b border-[var(--sl-border)]">
                <p className="text-[12px] font-semibold text-[var(--sl-t1)] truncate">{userName}</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">Conta gratuita</p>
              </div>
              {/* Actions */}
              <div className="p-1">
                <button
                  onClick={() => { setAvatarMenuOpen(false); router.push('/configuracoes') }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px]
                             text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] hover:text-[var(--sl-t1)]
                             transition-colors"
                >
                  <Settings size={14} className="shrink-0" />
                  Configurações
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px]
                             text-[#f43f5e] hover:bg-[rgba(244,63,94,0.08)]
                             transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Tooltip */}
      {tooltip && (
        <ModuleTooltip text={tooltip.text} visible={true} position={{ top: tooltip.top }} />
      )}
    </>
  )
}
