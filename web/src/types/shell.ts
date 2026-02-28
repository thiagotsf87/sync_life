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

export type AppMode = 'foco' | 'jornada'

export type ThemeId = 'navy-dark' | 'clean-light' | 'mint-garden' | 'obsidian' | 'rosewood' | 'arctic' | 'graphite' | 'twilight' | 'sahara' | 'system'

export type ResolvedThemeId = Exclude<ThemeId, 'system'>

/** @deprecated Use ThemeId instead */
export type AppTheme = ThemeId

export const DARK_THEMES: ResolvedThemeId[] = ['navy-dark', 'obsidian', 'rosewood', 'graphite', 'twilight']
export const LIGHT_THEMES: ResolvedThemeId[] = ['clean-light', 'mint-garden', 'arctic', 'sahara']
export const PRO_THEMES: ResolvedThemeId[] = ['obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara']
export const FREE_THEMES: ResolvedThemeId[] = ['navy-dark', 'clean-light', 'mint-garden']

export function isDarkTheme(theme: ResolvedThemeId): boolean {
  return DARK_THEMES.includes(theme)
}

export function resolveSystemTheme(): 'navy-dark' | 'clean-light' {
  if (typeof window === 'undefined') return 'navy-dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'navy-dark' : 'clean-light'
}

export interface ShellState {
  activeModule: ModuleId
  sidebarOpen: boolean
  mode: AppMode
  theme: ThemeId
  resolvedTheme: ResolvedThemeId

  setActiveModule: (module: ModuleId) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMode: (mode: AppMode) => void
  setTheme: (theme: ThemeId) => void
}
