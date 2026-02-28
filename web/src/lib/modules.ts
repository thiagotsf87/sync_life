import type { ModuleId, ModuleConfig } from '@/types/shell'

export const MODULES: Record<ModuleId, ModuleConfig> = {
  home: {
    id: 'home',
    label: 'Home',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.16)',
    icon: 'home',
    basePath: '/dashboard',
    defaultNavId: 'dashboard',
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
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
  futuro: {
    id: 'futuro',
    label: 'Futuro',
    color: '#0055ff',
    glowColor: 'rgba(0,85,255,0.16)',
    icon: 'futuro',
    basePath: '/futuro',
    defaultNavId: 'futuro-objetivos',
    navItems: [
      { id: 'futuro-objetivos', label: 'Objetivos', icon: 'Target', href: '/futuro' },
      { id: 'futuro-novo', label: 'Novo Objetivo', icon: 'Plus', href: '/futuro/novo' },
    ],
  },
  tempo: {
    id: 'tempo',
    label: 'Tempo',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.16)',
    icon: 'tempo',
    basePath: '/tempo',
    defaultNavId: 'tempo-semanal',
    navItems: [
      { id: 'tempo-semanal', label: 'Semanal', icon: 'Calendar', href: '/tempo' },
      { id: 'tempo-mensal', label: 'Mensal', icon: 'CalendarRange', href: '/tempo/mensal' },
      { id: 'tempo-novo', label: 'Novo Evento', icon: 'CalendarPlus', href: '/tempo/novo' },
      { id: 'tempo-foco', label: 'Blocos de Foco', icon: 'Timer', href: '/tempo/foco' },
    ],
  },
  corpo: {
    id: 'corpo',
    label: 'Corpo',
    color: '#f97316',
    glowColor: 'rgba(249,115,22,0.16)',
    icon: 'corpo',
    basePath: '/corpo',
    defaultNavId: 'corpo-dashboard',
    navItems: [
      { id: 'corpo-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/corpo' },
      { id: 'corpo-atividades', label: 'Atividades', icon: 'Dumbbell', href: '/corpo/atividades' },
      { id: 'corpo-peso', label: 'Peso & Medidas', icon: 'Scale', href: '/corpo/peso' },
      { id: 'corpo-cardapio', label: 'Cardápio', icon: 'Utensils', href: '/corpo/cardapio' },
      { id: 'corpo-saude', label: 'Saúde Preventiva', icon: 'HeartPulse', href: '/corpo/saude' },
      {
        id: 'corpo-coach',
        label: 'Coach IA',
        icon: 'Bot',
        href: '/corpo/coach',
        badge: { text: 'PRO', variant: 'pro' as const },
        isProOnly: true,
      },
    ],
  },
  mente: {
    id: 'mente',
    label: 'Mente',
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.16)',
    icon: 'mente',
    basePath: '/mente',
    defaultNavId: 'mente-dashboard',
    navItems: [
      { id: 'mente-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/mente' },
      { id: 'mente-trilhas', label: 'Trilhas', icon: 'BookOpen', href: '/mente/trilhas' },
      { id: 'mente-timer', label: 'Timer Foco', icon: 'Timer', href: '/mente/timer' },
      { id: 'mente-sessoes', label: 'Sessões', icon: 'Clock', href: '/mente/sessoes' },
      { id: 'mente-biblioteca', label: 'Biblioteca', icon: 'Library', href: '/mente/biblioteca' },
    ],
  },
  patrimonio: {
    id: 'patrimonio',
    label: 'Patrimônio',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.16)',
    icon: 'patrimonio',
    basePath: '/patrimonio',
    defaultNavId: 'ptr-dashboard',
    navItems: [
      { id: 'ptr-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/patrimonio' },
      { id: 'ptr-carteira', label: 'Carteira', icon: 'Briefcase', href: '/patrimonio/carteira' },
      { id: 'ptr-proventos', label: 'Proventos', icon: 'DollarSign', href: '/patrimonio/proventos' },
      { id: 'ptr-evolucao', label: 'Evolução', icon: 'TrendingUp', href: '/patrimonio/evolucao' },
      {
        id: 'ptr-simulador',
        label: 'Simulador IF',
        icon: 'Calculator',
        href: '/patrimonio/simulador',
        badge: { text: 'PRO', variant: 'pro' },
        isProOnly: true,
      },
    ],
  },
  carreira: {
    id: 'carreira',
    label: 'Carreira',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.16)',
    icon: 'carreira',
    basePath: '/carreira',
    defaultNavId: 'car-dashboard',
    navItems: [
      { id: 'car-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/carreira' },
      { id: 'car-perfil', label: 'Perfil Profissional', icon: 'UserCheck', href: '/carreira/perfil' },
      { id: 'car-roadmap', label: 'Roadmap', icon: 'Map', href: '/carreira/roadmap' },
      { id: 'car-habilidades', label: 'Habilidades', icon: 'Star', href: '/carreira/habilidades' },
      { id: 'car-historico', label: 'Histórico', icon: 'History', href: '/carreira/historico' },
    ],
  },
  experiencias: {
    id: 'experiencias',
    label: 'Experiências',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.16)',
    icon: 'experiencias',
    basePath: '/experiencias',
    defaultNavId: 'exp-dashboard',
    navItems: [
      { id: 'exp-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/experiencias' },
      { id: 'exp-viagens', label: 'Viagens', icon: 'Plane', href: '/experiencias/viagens' },
      { id: 'exp-nova', label: 'Nova Viagem', icon: 'Plus', href: '/experiencias/nova' },
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
  if (pathname.startsWith('/futuro')) return 'futuro'
  if (pathname.startsWith('/tempo')) return 'tempo'
  if (pathname.startsWith('/corpo')) return 'corpo'
  if (pathname.startsWith('/mente')) return 'mente'
  if (pathname.startsWith('/patrimonio')) return 'patrimonio'
  if (pathname.startsWith('/carreira')) return 'carreira'
  if (pathname.startsWith('/experiencias')) return 'experiencias'
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
  return module.defaultNavId
}
