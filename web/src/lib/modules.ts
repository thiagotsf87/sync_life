import type { ModuleId, ModuleConfig } from '@/types/shell'

export const MODULES: Record<ModuleId, ModuleConfig> = {
  home: {
    id: 'home',
    label: 'Home',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.16)',
    icon: 'home',
    basePath: '/',
    defaultNavId: 'dashboard',
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/' },
    ],
  },
  financas: {
    id: 'financas',
    label: 'Finanças',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.16)',
    icon: 'financas',
    basePath: '/financas',
    defaultNavId: 'fin-dashboard',
    navItems: [
      { id: 'fin-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/financas' },
      { id: 'fin-transacoes', label: 'Transações', icon: 'ArrowLeftRight', href: '/financas/transacoes' },
      { id: 'fin-recorrentes', label: 'Recorrentes', icon: 'Repeat', href: '/financas/recorrentes' },
      { id: 'fin-orcamentos', label: 'Orçamentos', icon: 'PieChart', href: '/financas/orcamentos' },
      { id: 'fin-calendario', label: 'Calendário', icon: 'CalendarDays', href: '/financas/calendario' },
      {
        id: 'fin-planejamento',
        label: 'Planejamento',
        icon: 'TrendingUp',
        href: '/financas/planejamento',
        badge: { text: 'PRO', variant: 'pro' },
        isProOnly: true,
      },
      { id: 'fin-relatorios', label: 'Relatórios', icon: 'BarChart3', href: '/financas/relatorios' },
    ],
  },
  metas: {
    id: 'metas',
    label: 'Metas',
    color: '#0055ff',
    glowColor: 'rgba(0,85,255,0.16)',
    icon: 'metas',
    basePath: '/metas',
    defaultNavId: 'metas-list',
    navItems: [
      { id: 'metas-list', label: 'Minhas Metas', icon: 'Target', href: '/metas' },
      { id: 'metas-nova', label: 'Nova Meta', icon: 'Plus', href: '/metas/nova' },
    ],
  },
  agenda: {
    id: 'agenda',
    label: 'Agenda',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.16)',
    icon: 'agenda',
    basePath: '/agenda',
    defaultNavId: 'agenda-semanal',
    navItems: [
      { id: 'agenda-semanal', label: 'Semanal', icon: 'Calendar', href: '/agenda' },
      { id: 'agenda-mensal', label: 'Mensal', icon: 'CalendarRange', href: '/agenda/mensal' },
      { id: 'agenda-novo', label: 'Novo Evento', icon: 'CalendarPlus', href: '/agenda/novo' },
      { id: 'agenda-foco', label: 'Blocos de Foco', icon: 'Timer', href: '/agenda/foco' },
    ],
  },
  conquistas: {
    id: 'conquistas',
    label: 'Conquistas',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.16)',
    icon: 'conquistas',
    basePath: '/conquistas',
    defaultNavId: 'conq-todas',
    navItems: [
      { id: 'conq-todas', label: 'Todas', icon: 'Trophy', href: '/conquistas' },
      { id: 'conq-ranking', label: 'Ranking', icon: 'Medal', href: '/conquistas/ranking' },
    ],
  },
  configuracoes: {
    id: 'configuracoes',
    label: 'Configurações',
    color: '#6e90b8',
    glowColor: 'rgba(110,144,184,0.16)',
    icon: 'configuracoes',
    basePath: '/configuracoes',
    defaultNavId: 'cfg-perfil',
    navItems: [
      { id: 'cfg-perfil', label: 'Perfil', icon: 'User', href: '/configuracoes' },
      { id: 'cfg-modo', label: 'Modo de Uso', icon: 'Palette', href: '/configuracoes/modo' },
      { id: 'cfg-notif', label: 'Notificações', icon: 'Bell', href: '/configuracoes/notificacoes' },
      { id: 'cfg-categorias', label: 'Categorias', icon: 'Tags', href: '/configuracoes/categorias' },
      { id: 'cfg-plano', label: 'Plano', icon: 'Crown', href: '/configuracoes/plano' },
    ],
  },
}

export const MODULE_LIST = Object.values(MODULES)

export function getModuleByPath(pathname: string): ModuleId {
  if (pathname.startsWith('/financas')) return 'financas'
  if (pathname.startsWith('/metas')) return 'metas'
  if (pathname.startsWith('/agenda')) return 'agenda'
  if (pathname.startsWith('/conquistas')) return 'conquistas'
  if (pathname.startsWith('/configuracoes')) return 'configuracoes'
  return 'home'
}

export function getActiveNavItem(pathname: string, moduleId: ModuleId): string | null {
  const module = MODULES[moduleId]
  // Exact match first
  const exact = module.navItems.find(item => item.href === pathname)
  if (exact) return exact.id
  // Prefix match (longest first)
  const sorted = [...module.navItems].sort((a, b) => b.href.length - a.href.length)
  const prefix = sorted.find(item => pathname.startsWith(item.href) && item.href !== '/')
  if (prefix) return prefix.id
  // Default for home module
  if (moduleId === 'home' && pathname === '/') return 'dashboard'
  return module.defaultNavId
}
