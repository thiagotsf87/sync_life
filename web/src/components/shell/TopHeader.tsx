'use client'

import { useShellStore } from '@/stores/shell-store'
import { CoachPill } from '@/components/coach/CoachPill'
import { ThemePill } from './ThemePill'
import { NotifButton } from './NotifButton'
import { IconChevronRight } from './icons'

interface TopHeaderProps {
  userName?: string
}

export function TopHeader({ userName: _userName }: TopHeaderProps = {}) {
  const sidebarOpen = useShellStore((s) => s.sidebarOpen)
  const toggleSidebar = useShellStore((s) => s.toggleSidebar)

  return (
    <header className="sl-header flex h-[48px] items-center gap-3 px-5 border-b border-[var(--sl-border)] shrink-0 transition-[background,border-color] duration-400">
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

      {/* Spacer pushes controls to the right (greeting moved to page headers) */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <CoachPill />
        <ThemePill />
        <NotifButton />
      </div>
    </header>
  )
}
