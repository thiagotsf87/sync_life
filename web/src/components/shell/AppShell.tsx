'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import { useActiveModuleSync } from '@/hooks/use-active-module'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { ModuleBar } from './ModuleBar'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { ContentArea } from './ContentArea'
import { MobileBottomBar } from './MobileBottomBar'
import { MobileSubNav } from './MobileSubNav'
import { MODULE_BAR_W, SB_OPEN, SB_COLLAPSED } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { AppMode, AppTheme } from '@/types/shell'

interface AppShellProps {
  children: React.ReactNode
  userName: string
  initialMode?: AppMode
  initialTheme?: AppTheme
  initialSidebarOpen?: boolean
}

export function NewAppShell({
  children,
  userName,
  initialMode,
  initialTheme,
  initialSidebarOpen,
}: AppShellProps) {
  // Sync active module from pathname
  useActiveModuleSync()

  const { isDesktop } = useBreakpoint()
  const sidebarOpen = useShellStore((s) => s.sidebarOpen)
  const mode = useShellStore((s) => s.mode)
  const theme = useShellStore((s) => s.theme)
  const setMode = useShellStore((s) => s.setMode)
  const setTheme = useShellStore((s) => s.setTheme)
  const setSidebarOpen = useShellStore((s) => s.setSidebarOpen)

  // Hydrate store from server-provided values (runs once after mount)
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (initialMode) setMode(initialMode)
    if (initialTheme) setTheme(initialTheme)
    if (initialSidebarOpen !== undefined) setSidebarOpen(initialSidebarOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track last successfully persisted values for rollback
  const lastPersistedRef = useRef({ mode, theme, sidebarOpen })

  // Sync store changes → Supabase (debounced, with rollback on error)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    // Guard against Turbopack HMR destroying ref bindings
    try { if (!initialized.current) return } catch { return }
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const snapshot = { mode, theme, sidebarOpen }
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('profiles').update({
        mode: snapshot.mode === 'jornada' ? 'journey' : 'focus',
        theme: snapshot.theme,
        sidebar_state: snapshot.sidebarOpen ? 'open' : 'collapsed',
      }).eq('id', user.id)

      if (error) {
        const prev = lastPersistedRef.current
        setMode(prev.mode)
        setTheme(prev.theme)
        setSidebarOpen(prev.sidebarOpen)
        toast.error('Erro ao salvar preferência. Tente novamente.')
      } else {
        lastPersistedRef.current = snapshot
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [mode, theme, sidebarOpen])

  const sidebarWidth = isDesktop ? (sidebarOpen ? SB_OPEN : SB_COLLAPSED) : 0
  const offsetLeft = isDesktop ? MODULE_BAR_W + sidebarWidth : 0

  return (
    <div className="flex h-screen bg-[var(--sl-bg)] overflow-hidden">
      {/* Module Bar (desktop only — hidden via CSS) */}
      <ModuleBar userName={userName} />

      {/* Sidebar (desktop only — hidden via CSS) */}
      <Sidebar />

      {/* Main column */}
      <div
        className="flex flex-1 flex-col min-w-0"
        style={{
          marginLeft: offsetLeft,
          transition: 'margin-left 240ms cubic-bezier(.4,0,.2,1)',
        }}
      >
        <TopHeader userName={userName} />
        <MobileSubNav />
        <ContentArea>{children}</ContentArea>
      </div>

      {/* Mobile bottom bar */}
      <MobileBottomBar />
    </div>
  )
}
