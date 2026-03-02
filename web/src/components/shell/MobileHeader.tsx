'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { MODULE_ICONS } from './icons'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

function getGreeting(name: string) {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return { text: `Bom dia, ${name}!`, emoji: '☀️' }
  if (hour >= 12 && hour < 18) return { text: `Boa tarde, ${name}!`, emoji: '🌅' }
  return { text: `Boa noite, ${name}!`, emoji: '🌙' }
}

// Módulos que mostram pills Foco/Jornada no header
const MODULES_WITH_PILLS = ['panorama', 'financas', 'futuro']

interface MobileHeaderProps {
  userName: string
}

export function MobileHeader({ userName }: MobileHeaderProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const activeModule    = useShellStore((s) => s.activeModule)
  const mode            = useShellStore((s) => s.mode)
  const setMode         = useShellStore((s) => s.setMode)
  const isJornada       = mode === 'jornada'
  const showPills       = MODULES_WITH_PILLS.includes(activeModule)

  const mod           = MODULES[activeModule]
  const ActiveIcon    = MODULE_ICONS[activeModule]
  const activeNavId   = getActiveNavItem(pathname, activeModule)
  const activeNav     = mod.navItems.find((item) => item.id === activeNavId)

  // Subtítulo: rótulo da subpágina ou descrição do módulo
  const subtitle = activeNav?.label !== mod.label ? activeNav?.label : undefined

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

        {/* Breadcrumb: ícone + módulo / subpágina */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <ActiveIcon size={15} style={{ color: mod.color }} className="shrink-0" />
          <span
            className="text-[13px] font-semibold shrink-0"
            style={{ color: mod.color }}
          >
            {mod.label}
          </span>
          {subtitle && (
            <>
              <span className="text-[var(--sl-t3)] shrink-0 text-[12px]">/</span>
              <span className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                {subtitle}
              </span>
            </>
          )}
        </div>

        {/* Direita: pills (módulos com Foco/Jornada) OR sino + avatar */}
        <div className="flex items-center gap-1 shrink-0">
          {showPills && (
            <div className="flex gap-0.5 bg-[var(--sl-s2)] rounded-full p-0.5 mr-1">
              <button
                onClick={() => setMode('foco')}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
                  !isJornada
                    ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                🎯 Foco
              </button>
              <button
                onClick={() => setMode('jornada')}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors',
                  isJornada
                    ? 'text-[var(--sl-accent)]'
                    : 'text-[var(--sl-t3)]',
                )}
                style={isJornada ? { background: 'rgba(var(--sl-accent-rgb), 0.15)' } : undefined}
              >
                🌱 Jornada
              </button>
            </div>
          )}

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

      {/* ── Linha 2: saudação no Jornada (módulos sem pills) ── */}
      {isJornada && !showPills && (
        <div className="flex items-center px-4 pb-2.5 gap-1.5">
          <span className="text-base shrink-0">{greeting.emoji}</span>
          <p className="text-[13px] font-semibold font-[Syne] text-sl-grad truncate">
            {greeting.text}
          </p>
        </div>
      )}
    </header>
  )
}
