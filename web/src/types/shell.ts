export type ModuleId = 'panorama' | 'financas' | 'futuro' | 'tempo' | 'corpo' | 'mente' | 'patrimonio' | 'carreira' | 'experiencias' | 'conquistas' | 'configuracoes'

export type ModuleColor = 'home' | 'fin' | 'meta' | 'agenda' | 'conq' | 'cfg'

export interface NavBadge {
  text: string
  variant: 'yellow' | 'red' | 'pro'
}

export interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  badge?: NavBadge
  isProOnly?: boolean
}

export interface ModuleConfig {
  id: ModuleId
  label: string
  color: string
  glowColor: string
  icon: string
  basePath: string
  navItems: NavItem[]
  defaultNavId: string
}

export type ThemeId = 'navy-deep' | 'midnight' | 'charcoal' | 'cream' | 'system'

export type ResolvedThemeId = Exclude<ThemeId, 'system'>

export const DARK_THEMES: ResolvedThemeId[] = ['navy-deep', 'midnight', 'charcoal']
export const LIGHT_THEMES: ResolvedThemeId[] = ['cream']

export function isDarkTheme(theme: ResolvedThemeId): boolean {
  return DARK_THEMES.includes(theme)
}

export function resolveSystemTheme(): 'navy-deep' | 'cream' {
  if (typeof window === 'undefined') return 'navy-deep'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'navy-deep' : 'cream'
}

export interface ShellState {
  activeModule: ModuleId
  sidebarOpen: boolean
  theme: ThemeId
  resolvedTheme: ResolvedThemeId
  pinnedModules: string[]

  setActiveModule: (module: ModuleId) => void
  setPinnedModules: (modules: string[]) => void
  refreshPinnedModules: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: ThemeId) => void
}
