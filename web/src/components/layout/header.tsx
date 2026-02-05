'use client'

import { MobileNav } from './mobile-nav'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface HeaderProps {
  title: string
  showMonthSelector?: boolean
  currentMonth?: string
  onPrevMonth?: () => void
  onNextMonth?: () => void
  showNewTransaction?: boolean
  onNewTransaction?: () => void
  userName?: string
  badge?: string
}

export function Header({
  title,
  showMonthSelector = false,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  showNewTransaction = false,
  onNewTransaction,
  userName = 'Usuário',
  badge,
}: HeaderProps) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Mobile menu button */}
        <MobileNav userName={userName} />

        {/* Page title & month selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white hidden sm:block">{title}</h1>
          {badge && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              {badge}
            </span>
          )}
          {showMonthSelector && (
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5">
              <button
                onClick={onPrevMonth}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-white min-w-[120px] text-center">
                {currentMonth}
              </span>
              <button
                onClick={onNextMonth}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showNewTransaction && (
            <>
              {/* Desktop button */}
              <Button
                onClick={onNewTransaction}
                className="hidden sm:flex items-center gap-2 bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Nova transação</span>
              </Button>

              {/* Mobile button */}
              <Button
                onClick={onNewTransaction}
                size="icon"
                className="sm:hidden bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* User avatar (mobile) */}
          <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-[var(--color-sync-400)] to-[var(--color-sync-600)] rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {getInitial(userName)}
          </div>
        </div>
      </div>
    </header>
  )
}
