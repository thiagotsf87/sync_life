'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { MODULE_ICONS, IconChevronLeft, IconChevronRight } from './icons'
import { SidebarScore } from './SidebarScore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ArrowLeftRight, Repeat, PieChart, CalendarDays,
  TrendingUp, BarChart3, Target, Plus, Calendar, CalendarRange,
  CalendarPlus, Timer, Trophy, Medal, User, Palette, Bell, Tags, Crown,
  Dumbbell, Scale, Utensils, HeartPulse, Bot, Library, Calculator,
  UserCheck, Map, Star, History, BookOpen, Clock, Briefcase, DollarSign, Plane,
} from 'lucide-react'

const LUCIDE_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, ArrowLeftRight, Repeat, PieChart, CalendarDays,
  TrendingUp, BarChart3, Target, Plus, Calendar, CalendarRange,
  CalendarPlus, Timer, Trophy, Medal, User, Palette, Bell, Tags, Crown,
  Dumbbell, Scale, Utensils, HeartPulse, Bot, Library, Calculator,
  UserCheck, Map, Star, History, BookOpen, Clock, Briefcase, DollarSign, Plane,
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const activeModule = useShellStore((s) => s.activeModule)
  const sidebarOpen = useShellStore((s) => s.sidebarOpen)
  const toggleSidebar = useShellStore((s) => s.toggleSidebar)
  const mode = useShellStore((s) => s.mode)

  const mod = MODULES[activeModule]
  const activeNavId = getActiveNavItem(pathname, activeModule)
  const ModuleIcon = MODULE_ICONS[activeModule]

  const handleNavClick = useCallback((href: string) => {
    router.push(href)
  }, [router])

  return (
    <aside
      className={cn(
        'sl-sidebar fixed top-0 z-50 hidden h-screen flex-col border-r border-[var(--sl-border)]',
        'bg-[var(--sl-s1)]',
        'transition-[width,background,border-color] duration-[240ms] ease-[cubic-bezier(.4,0,.2,1)]',
        'lg:flex',
      )}
      style={{
        left: 72,
        width: sidebarOpen ? 228 : 56,
      }}
    >
      {/* Header */}
      <div className="flex h-[54px] items-center gap-2 px-3 border-b border-[var(--sl-border)]">
        <div
          className="sl-sb-icon flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg"
          style={{ color: mod.color }}
        >
          <ModuleIcon size={18} />
        </div>
        <span
          className={cn(
            'sl-sb-title font-[Syne] font-bold text-sm text-[var(--sl-t1)] whitespace-nowrap',
            'transition-all duration-[240ms]',
            !sidebarOpen && 'opacity-0 w-0 overflow-hidden',
          )}
        >
          {mod.label}
        </span>
        <button
          onClick={toggleSidebar}
          className="sl-sb-toggle ml-auto flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-lg
                     text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]
                     transition-colors"
        >
          {sidebarOpen ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
        </button>
      </div>

      {/* Score (Jornada only, sidebar open only) */}
      {sidebarOpen && <SidebarScore />}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {mod.navItems.map((item) => {
            const LucideIcon = LUCIDE_MAP[item.icon]
            const isActive = activeNavId === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'sl-nav-item flex items-center gap-2.5 rounded-xl px-3 h-[38px] w-full text-left',
                  'transition-colors duration-150',
                  isActive
                    ? 'sl-nav-item-active text-[var(--sl-t1)]'
                    : 'text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] hover:text-[var(--sl-t1)]',
                )}
                style={isActive ? { background: mod.glowColor, color: mod.color } : undefined}
              >
                {LucideIcon && <LucideIcon size={16} className="shrink-0" />}
                <span
                  className={cn(
                    'text-[13px] font-medium whitespace-nowrap',
                    'transition-all duration-[240ms]',
                    !sidebarOpen && 'opacity-0 w-0 overflow-hidden',
                  )}
                >
                  {item.label}
                </span>
                {/* Badge */}
                {item.badge && sidebarOpen && (
                  <span
                    className={cn(
                      'ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md',
                      item.badge.variant === 'pro' && 'bg-[#f59e0b]/15 text-[#f59e0b]',
                      item.badge.variant === 'yellow' && 'bg-[#f59e0b]/15 text-[#f59e0b]',
                      item.badge.variant === 'red' && 'bg-[#f43f5e]/15 text-[#f43f5e]',
                    )}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
