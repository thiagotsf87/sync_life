'use client'

import { useState, useEffect } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { ThemePill } from './ThemePill'
import { NotifButton } from './NotifButton'
import { IconChevronRight } from './icons'

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
  const sidebarOpen = useShellStore((s) => s.sidebarOpen)
  const toggleSidebar = useShellStore((s) => s.toggleSidebar)

  // Computed client-side only to avoid SSR/hydration mismatch (#418)
  const [greeting, setGreeting] = useState({ text: `Olá, ${userName}!`, emoji: '👋' })
  useEffect(() => { setGreeting(getGreeting(userName)) }, [userName])

  return (
    <header className="sl-header flex h-[54px] items-center gap-3 px-5 border-b border-[var(--sl-border)] shrink-0 transition-[background,border-color] duration-400">
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

      {/* Greeting — always visible */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{greeting.emoji}</span>
        <h1 className="font-[Syne] font-bold text-base text-sl-grad">
          {greeting.text}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <ThemePill />
        <NotifButton />
      </div>
    </header>
  )
}
