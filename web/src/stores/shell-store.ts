import { create } from 'zustand'
import type { ShellState, ModuleId, ThemeId, ResolvedThemeId } from '@/types/shell'
import { isDarkTheme, resolveSystemTheme } from '@/types/shell'
import { getPinnedModules, setPinnedModules as persistPinned, DEFAULT_PINNED } from '@/lib/pinned-modules'

function applyTheme(theme: ThemeId) {
  if (typeof document === 'undefined') return

  const resolved: ResolvedThemeId = theme === 'system' ? resolveSystemTheme() : theme
  const scheme = isDarkTheme(resolved) ? 'dark' : 'light'

  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-scheme', scheme)

  return resolved
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

export const useShellStore = create<ShellState>((set) => ({
  activeModule: 'panorama' as ModuleId,
  sidebarOpen: true,
  theme: 'system' as ThemeId,
  resolvedTheme: initialResolved,
  pinnedModules: DEFAULT_PINNED,

  setActiveModule: (module: ModuleId) => set({ activeModule: module }),

  setPinnedModules: (modules: string[]) => {
    const next = persistPinned(modules)
    set({ pinnedModules: next })
  },

  refreshPinnedModules: () => set({ pinnedModules: getPinnedModules() }),

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

  setTheme: (theme: ThemeId) => {
    const resolved = applyTheme(theme)
    writeLocal('synclife-theme', theme)
    set({ theme, resolvedTheme: resolved || (theme === 'system' ? resolveSystemTheme() : theme as ResolvedThemeId) })
  },
}))
