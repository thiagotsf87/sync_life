import { create } from 'zustand'
import type { ShellState, ModuleId, AppMode, AppTheme } from '@/types/shell'

function applyThemeClass(theme: AppTheme) {
  if (typeof document === 'undefined') return
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

function applyModeClass(mode: AppMode) {
  if (typeof document === 'undefined') return
  if (mode === 'jornada') {
    document.documentElement.classList.add('jornada')
  } else {
    document.documentElement.classList.remove('jornada')
  }
}

function readLocal(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

function writeLocal(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage errors
  }
}

export const useShellStore = create<ShellState>((set) => ({
  activeModule: 'home' as ModuleId,
  sidebarOpen: readLocal('synclife-sidebar', 'true') === 'true',
  mode: (readLocal('synclife-mode', 'foco') as AppMode),
  theme: (readLocal('synclife-theme', 'dark') as AppTheme),

  setActiveModule: (module: ModuleId) => set({ activeModule: module }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarOpen
      writeLocal('synclife-sidebar', String(next))
      return { sidebarOpen: next }
    }),

  setSidebarOpen: (open: boolean) => {
    writeLocal('synclife-sidebar', String(open))
    set({ sidebarOpen: open })
  },

  setMode: (mode: AppMode) => {
    applyModeClass(mode)
    writeLocal('synclife-mode', mode)
    set({ mode })
  },

  setTheme: (theme: AppTheme) => {
    applyThemeClass(theme)
    writeLocal('synclife-theme', theme)
    set({ theme })
  },
}))
