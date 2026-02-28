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
export type AppTheme = 'dark' | 'light'

export interface ShellState {
  activeModule: ModuleId
  sidebarOpen: boolean
  mode: AppMode
  theme: AppTheme
  setActiveModule: (module: ModuleId) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMode: (mode: AppMode) => void
  setTheme: (theme: AppTheme) => void
}
