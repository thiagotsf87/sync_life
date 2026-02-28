'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { MODULE_ICONS, SyncLifeLogo } from './icons'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings } from 'lucide-react'
import type { ModuleId } from '@/types/shell'

const MODULE_LAYOUT: Array<ModuleId | 'sep'> = [
  'panorama',
  'sep',
  'financas', 'tempo', 'corpo',
  'sep',
  'futuro', 'patrimonio',
  'sep',
  'mente', 'carreira', 'experiencias',
  'sep',
  'configuracoes',
]

interface ModuleBarProps {
  userName?: string
}

const MODULE_BAR_LABELS: Partial<Record<ModuleId, string>> = {
  panorama: 'Panorama',
  configuracoes: 'Config',
}

const GRAD_BRAND = 'linear-gradient(135deg, #10b981, #0055ff)'

export function ModuleBar({ userName = 'U' }: ModuleBarProps) {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
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

  const handleClick = useCallback((moduleId: ModuleId) => {
    router.push(MODULES[moduleId].basePath)
  }, [router])

  return (
    <>
      <nav
        className="sl-module-bar fixed left-0 top-0 z-[60] hidden h-screen w-[72px] flex-col items-center
                   border-r border-[var(--sl-border)] py-3 lg:flex
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
        <div className="flex flex-1 flex-col items-center gap-1.5 w-full px-1.5">
          {MODULE_LAYOUT.map((entry, idx) => {
            if (entry === 'sep') {
              return (
                <div
                  key={`sep-${idx}`}
                  className="h-px w-8 my-1.5 rounded-full"
                  style={{ background: 'var(--sl-t3)', opacity: 0.45 }}
                />
              )
            }

            const moduleId = entry
            const mod = MODULES[moduleId]
            const Icon = MODULE_ICONS[moduleId]
            const isActive = activeModule === moduleId
            const label = MODULE_BAR_LABELS[moduleId] ?? mod.label

            return (
              <button
                key={moduleId}
                onClick={() => handleClick(moduleId)}
                className={`sl-mod-btn module-item relative flex w-full flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 py-1.5
                           transition-colors duration-200
                           ${isActive ? 'sl-mod-btn-active' : ''}`}
                style={{
                  ['--module-color' as string]: mod.color,
                  ['--module-glow' as string]: mod.glowColor,
                }}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] rounded-r-full"
                    style={{ background: moduleId === 'panorama' ? GRAD_BRAND : mod.color }}
                  />
                )}
                {/* Panorama ativo: gradiente brand; demais: cor sólida via CSS */}
                {moduleId === 'panorama' && isActive ? (
                  <>
                    <span style={{ background: GRAD_BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex' }}>
                      <Icon size={20} />
                    </span>
                    <span className="module-label text-[10px] font-medium leading-[1.15] text-center"
                      style={{ background: GRAD_BRAND, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon size={20} />
                    <span className="module-label text-[10px] font-medium leading-[1.15] text-center">
                      {label}
                    </span>
                  </>
                )}
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
    </>
  )
}
