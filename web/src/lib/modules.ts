import type { ModuleId, ModuleConfig } from '@/types/shell'

export const MODULES: Record<ModuleId, ModuleConfig> = {
  panorama: {
    id: 'panorama',
    label: 'Panorama',
    color: '#6B6FD4',
    glowColor: 'rgba(107, 111, 212, 0.14)',
    icon: 'panorama',
    basePath: '/dashboard',
    defaultNavId: 'pan-dashboard',
    navItems: [
      { id: 'pan-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
      { id: 'pan-coach', label: 'Coach IA', icon: 'Bot', href: '/coach' },
      { id: 'pan-conquistas', label: 'Conquistas', icon: 'Trophy', href: '/conquistas' },
      { id: 'pan-ranking', label: 'Ranking', icon: 'Medal', href: '/conquistas/ranking' },
    ],
  },
  financas: {
    id: 'financas',
    label: 'Finanças',
    color: '#0F766E',
    glowColor: 'rgba(15, 118, 110, 0.14)',
    icon: 'financas',
    basePath: '/financas',
    defaultNavId: 'fin-dashboard',
    navItems: [
      { id: 'fin-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/financas' },
      { id: 'fin-transacoes', label: 'Transações', icon: 'ArrowLeftRight', href: '/financas/transacoes' },
      { id: 'fin-recorrentes', label: 'Recorrentes', icon: 'Repeat', href: '/financas/recorrentes' },
      { id: 'fin-orcamentos', label: 'Orçamentos', icon: 'PieChart', href: '/financas/orcamentos' },
      { id: 'fin-calendario', label: 'Calendário', icon: 'CalendarDays', href: '/financas/calendario' },
      { id: 'fin-planejamento', label: 'Planejamento', icon: 'TrendingUp', href: '/financas/planejamento' },
      { id: 'fin-relatorios', label: 'Relatórios', icon: 'BarChart3', href: '/financas/relatorios' },
      { id: 'fin-importar', label: 'Importar', icon: 'Upload', href: '/financas/importar' },
    ],
  },
  futuro: {
    id: 'futuro',
    label: 'Futuro',
    color: '#8B7BD4',
    glowColor: 'rgba(139, 123, 212, 0.14)',
    icon: 'futuro',
    basePath: '/futuro',
    defaultNavId: 'futuro-objetivos',
    navItems: [
      { id: 'futuro-objetivos', label: 'Objetivos', icon: 'Target', href: '/futuro' },
      { id: 'futuro-novo', label: 'Novo Objetivo', icon: 'Plus', href: '/futuro/novo' },
      { id: 'futuro-checkin', label: 'Check-in', icon: 'ClipboardCheck', href: '/futuro/checkin' },
    ],
  },
  tempo: {
    id: 'tempo',
    label: 'Tempo',
    color: '#3CA0B5',
    glowColor: 'rgba(60, 160, 181, 0.14)',
    icon: 'tempo',
    basePath: '/tempo',
    defaultNavId: 'tempo-dashboard',
    navItems: [
      { id: 'tempo-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/tempo' },
      { id: 'tempo-agenda', label: 'Agenda', icon: 'CalendarDays', href: '/tempo/agenda' },
      { id: 'tempo-semanal', label: 'Semanal', icon: 'Calendar', href: '/tempo/semanal' },
      { id: 'tempo-mensal', label: 'Mensal', icon: 'CalendarRange', href: '/tempo/mensal' },
      { id: 'tempo-novo', label: 'Novo Evento', icon: 'CalendarPlus', href: '/tempo/novo' },
      { id: 'tempo-foco', label: 'Blocos de Foco', icon: 'Timer', href: '/tempo/foco' },
      { id: 'tempo-review', label: 'Review Semanal', icon: 'ClipboardCheck', href: '/tempo/review' },
    ],
  },
  corpo: {
    id: 'corpo',
    label: 'Corpo',
    color: '#D97534',
    glowColor: 'rgba(217, 117, 52, 0.14)',
    icon: 'corpo',
    basePath: '/corpo',
    defaultNavId: 'corpo-dashboard',
    navItems: [
      { id: 'corpo-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/corpo' },
      { id: 'corpo-atividades', label: 'Atividades', icon: 'Dumbbell', href: '/corpo/atividades' },
      { id: 'corpo-peso', label: 'Peso & Medidas', icon: 'Scale', href: '/corpo/peso' },
      { id: 'corpo-cardapio', label: 'Cardápio', icon: 'Utensils', href: '/corpo/cardapio' },
      { id: 'corpo-saude', label: 'Saúde Preventiva', icon: 'HeartPulse', href: '/corpo/saude' },
    ],
  },
  mente: {
    id: 'mente',
    label: 'Mente',
    color: '#D9962E',
    glowColor: 'rgba(217, 150, 46, 0.14)',
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
    color: '#4F88D4',
    glowColor: 'rgba(79, 136, 212, 0.14)',
    icon: 'patrimonio',
    basePath: '/patrimonio',
    defaultNavId: 'ptr-dashboard',
    navItems: [
      { id: 'ptr-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/patrimonio' },
      { id: 'ptr-carteira', label: 'Carteira', icon: 'Briefcase', href: '/patrimonio/carteira' },
      { id: 'ptr-proventos', label: 'Proventos', icon: 'DollarSign', href: '/patrimonio/proventos' },
      { id: 'ptr-evolucao', label: 'Evolução', icon: 'TrendingUp', href: '/patrimonio/evolucao' },
      { id: 'ptr-simulador', label: 'Simulador IF', icon: 'Calculator', href: '/patrimonio/simulador' },
    ],
  },
  carreira: {
    id: 'carreira',
    label: 'Carreira',
    color: '#DB6478',
    glowColor: 'rgba(219, 100, 120, 0.14)',
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
    color: '#C76795',
    glowColor: 'rgba(199, 103, 149, 0.14)',
    icon: 'experiencias',
    basePath: '/experiencias',
    defaultNavId: 'exp-dashboard',
    navItems: [
      { id: 'exp-dashboard',   label: 'Dashboard',   icon: 'LayoutDashboard', href: '/experiencias' },
      { id: 'exp-viagens',     label: 'Viagens',     icon: 'Plane',           href: '/experiencias/viagens' },
      { id: 'exp-passaporte',  label: 'Passaporte',  icon: 'Globe',           href: '/experiencias/passaporte' },
      { id: 'exp-memorias',    label: 'Memórias',    icon: 'BookHeart',       href: '/experiencias/memorias' },
      { id: 'exp-bucket',      label: 'Bucket List', icon: 'Map',             href: '/experiencias/bucket-list' },
      { id: 'exp-nova',        label: 'Nova Viagem', icon: 'Plus',            href: '/experiencias/nova' },
    ],
  },
  conquistas: {
    id: 'conquistas',
    label: 'Conquistas',
    color: '#D9962E',
    glowColor: 'rgba(217, 150, 46, 0.14)',
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
    color: '#6F7986',
    glowColor: 'rgba(111, 121, 134, 0.12)',
    icon: 'configuracoes',
    basePath: '/configuracoes',
    defaultNavId: 'cfg-perfil',
    navItems: [
      { id: 'cfg-perfil', label: 'Perfil', icon: 'User', href: '/configuracoes' },
      { id: 'cfg-aparencia', label: 'Aparência', icon: 'Palette', href: '/configuracoes/aparencia' },
      { id: 'cfg-notif', label: 'Notificações', icon: 'Bell', href: '/configuracoes/notificacoes' },
      { id: 'cfg-categorias', label: 'Categorias', icon: 'Tags', href: '/configuracoes/categorias' },
      { id: 'cfg-contas', label: 'Contas', icon: 'Landmark', href: '/configuracoes/contas' },
      { id: 'cfg-integracoes', label: 'Integrações', icon: 'Link2', href: '/configuracoes/integracoes' },
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
  if (pathname.startsWith('/conquistas')) return 'panorama'
  if (pathname.startsWith('/dashboard')) return 'panorama'
  if (pathname.startsWith('/configuracoes')) return 'configuracoes'
  if (pathname.startsWith('/coach')) return 'panorama'
  return 'panorama'
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
