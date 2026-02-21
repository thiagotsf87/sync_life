'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'

const STORAGE_KEY = 'sync-life-sidebar-collapsed'

interface AppShellProps {
  userName?: string
  children: React.ReactNode
}

export function AppShell({ userName, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) setCollapsed(stored === 'true')
    } catch {
      // ignore
    }
  }, [mounted])

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        userName={userName}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
