'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { ModePill } from './ModePill'
import { ThemePill } from './ThemePill'
import { NotifButton } from './NotifButton'
import { IconChevronRight, MODULE_ICONS } from './icons'

function getGreeting(name: string): { text: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return { text: `Bom dia, ${name}!`, emoji: '🌅' }
  if (hour >= 12 && hour < 18) return { text: `Boa tarde, ${name}!`, emoji: '✨' }
  return { text: `Boa noite, ${name}!`, emoji: '🌙' }
}

interface TopHeaderProps {
  userName: string
}

export function TopHeader({ userName }: TopHeaderProps) {
  const pathname = usePathname()
  const activeModule = useShellStore((s) => s.activeModule)
  const sidebarOpen = useShellStore((s) => s.sidebarOpen)
  const toggleSidebar = useShellStore((s) => s.toggleSidebar)

  const mod = MODULES[activeModule]
  const ActiveModuleIcon = MODULE_ICONS[activeModule]
  const activeNavId = getActiveNavItem(pathname, activeModule)
  const activeNav = mod.navItems.find((item) => item.id === activeNavId)

  // Computed client-side only to avoid SSR/hydration mismatch (#418)
  const [greeting, setGreeting] = useState({ text: `Olá, ${userName}!`, emoji: '👋' })
  useEffect(() => { setGreeting(getGreeting(userName)) }, [userName])

  return (
    <header className="sl-header flex h-[54px] items-center gap-3 px-5 border-b border-[var(--sl-border)] bg-[var(--sl-s1)]/80 backdrop-blur-sm shrink-0 transition-[background,border-color] duration-400">
      {/* Expand sidebar button (visible when collapsed, desktop only) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex h-[28px] w-[28px] items-center justify-center rounded-lg
                     text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]
                     transition-colors mr-1"
        >
          <IconChevronRight size={16} />
        </button>
      )}

      {/* Foco: Breadcrumb */}
      <div className="sl-breadcrumb [.jornada_&]:hidden flex items-center gap-1.5 text-sm">
        <ActiveModuleIcon size={14} className="text-[var(--sl-t3)]" />
        <span className="text-[var(--sl-t2)] font-medium">{mod.label}</span>
        {activeNav && activeNav.label !== mod.label && (
          <>
            <IconChevronRight size={14} className="text-[var(--sl-t3)]" />
            <span className="text-[var(--sl-t1)] font-medium">{activeNav.label}</span>
          </>
        )}
      </div>

      {/* Jornada: Greeting */}
      <div className="hidden [.jornada_&]:flex items-center gap-2">
        <span className="text-lg">{greeting.emoji}</span>
        <h1 className="font-[Syne] font-bold text-base text-sl-grad">
          {greeting.text}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <ModePill />
        <ThemePill />
        <NotifButton />
      </div>
    </header>
  )
}
