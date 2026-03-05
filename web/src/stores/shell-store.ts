import { create } from 'zustand'
import type { ShellState, ModuleId, AppMode, ThemeId, ResolvedThemeId } from '@/types/shell'
import { isDarkTheme, resolveSystemTheme } from '@/types/shell'

function applyTheme(theme: ThemeId) {
  if (typeof document === 'undefined') return

  const resolved: ResolvedThemeId = theme === 'system' ? resolveSystemTheme() : theme
  const scheme = isDarkTheme(resolved) ? 'dark' : 'light'

  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-scheme', scheme)

  return resolved
}

function applyMode(mode: AppMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-mode', mode)
}

function writeLocal(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage errors
  }
}

const initialResolved = resolveSystemTheme()

export const useShellStore = create<ShellState>((set, get) => ({
  activeModule: 'panorama' as ModuleId,
  sidebarOpen: true,
  mode: 'foco' as AppMode,
  theme: 'system' as ThemeId,
  resolvedTheme: initialResolved,

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
    applyMode(mode)
    writeLocal('synclife-mode', mode)
    set({ mode })
  },

  setTheme: (theme: ThemeId) => {
    const resolved = applyTheme(theme)
    writeLocal('synclife-theme', theme)
    set({ theme, resolvedTheme: resolved || (theme === 'system' ? resolveSystemTheme() : theme as ResolvedThemeId) })
  },
}))
