'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { MODULE_ICONS } from './icons'
import { Bell, Menu, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getGreeting(name: string) {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return { text: `Bom dia, ${name}!`, emoji: '☀️' }
  if (hour >= 12 && hour < 18) return { text: `Boa tarde, ${name}!`, emoji: '🌅' }
  return { text: `Boa noite, ${name}!`, emoji: '🌙' }
}

interface MobileHeaderProps {
  userName: string
}

export function MobileHeader({ userName }: MobileHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const activeModule = useShellStore((s) => s.activeModule)
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)
  const setModulePickerOpen = useShellStore((s) => s.setModulePickerOpen)
  const isJornada = mode === 'jornada'

  const mod = MODULES[activeModule]
  const ActiveModuleIcon = MODULE_ICONS[activeModule]
  const activeNavId = getActiveNavItem(pathname, activeModule)
  const activeNav = mod.navItems.find((item) => item.id === activeNavId)

  // SSR-safe greeting — computed client-side to avoid hydration mismatch
  const [greeting, setGreeting] = useState({ text: `Olá, ${userName}!`, emoji: '👋' })
  useEffect(() => { setGreeting(getGreeting(userName)) }, [userName])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-[var(--sl-s1)] border-b border-[var(--sl-border)] shrink-0 lg:hidden">

      {/* ── Linha 1: sempre visível ── */}
      <div className="flex items-center gap-2 px-4 h-[52px]">

        {/* Hamburger → abre MobileModulePicker */}
        <button
          onClick={() => setModulePickerOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0
                     text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
          aria-label="Abrir menu de módulos"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb: ícone do módulo + nome + subpágina */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <ActiveModuleIcon size={14} style={{ color: mod.color }} />
          <span className="text-[13px] font-medium text-[var(--sl-t2)] shrink-0">
            {mod.label}
          </span>
          {activeNav && activeNav.label !== mod.label && (
            <>
              <ChevronRight size={12} className="text-[var(--sl-t3)] shrink-0" />
              <span className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                {activeNav.label}
              </span>
            </>
          )}
        </div>

        {/* Direita: sino + avatar */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => router.push('/configuracoes/notificacoes')}
            className="flex items-center justify-center w-9 h-9 rounded-xl
                       text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
            aria-label="Notificações"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={() => router.push('/configuracoes')}
            className="flex items-center justify-center w-8 h-8 rounded-full
                       text-[11px] font-bold text-white cursor-pointer shrink-0"
            style={{ background: mod.color }}
            title="Meu perfil"
            aria-label="Meu perfil"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* ── Linha 2: apenas no modo Jornada ── */}
      {isJornada && (
        <div className="flex items-center justify-between px-4 pb-2.5 gap-2">
          {/* Saudação */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">{greeting.emoji}</span>
            <p className="text-[13px] font-semibold font-[Syne] text-sl-grad truncate">
              {greeting.text}
            </p>
          </div>

          {/* Pills Foco / Jornada */}
          <div className="flex gap-0.5 bg-[var(--sl-s2)] rounded-full p-0.5 shrink-0">
            <button
              onClick={() => setMode('foco')}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors text-[var(--sl-t3)]"
            >
              🎯 Foco
            </button>
            <button
              onClick={() => setMode('jornada')}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors text-[var(--sl-accent)]"
              style={{ background: 'rgba(var(--sl-accent-rgb), 0.15)' }}
            >
              🌱 Jornada
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
