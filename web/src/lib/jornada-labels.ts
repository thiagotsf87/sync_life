// ─── LABELS ─────────────────────────────────────────────────────────────────────
// Motivational labels — single unified experience (no mode switching).

export const LABELS = {
  // ── Finanças ─────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  financas: {
    module:       'Finanças',
    transacoes:   'Transações',
    receitas:     'Receitas',
    despesas:     'Despesas',
    orcamentos:   'Orçamentos',
    recorrentes:  'Recorrentes',
    planejamento: 'Planejamento',
    relatorios:   'Relatórios',
    calendario:   'Calendário',
    saldo:        'Saldo',
  },

  // ── Futuro ───────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  futuro: {
    module:       'Futuro',
    objetivos:    'Objetivos',
    metas:        'Metas',
    checkin:      'Check-in',
    lifeMap:      'Mapa da Vida',
    aporte:       'Aporte',
    milestone:    'Marco',
    timeline:     'Timeline',
    arquivo:      'Arquivo',
  },

  // ── Corpo ────────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  corpo: {
    module:       'Corpo',
    atividades:   'Atividades',
    peso:         'Peso & Medidas',
    consultas:    'Saúde Preventiva',
    cardapio:     'Cardápio',
    coach:        'Coach IA',
    hidratacao:   'Hidratação',
  },

  // ── Mente ────────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  mente: {
    module:       'Mente',
    trilhas:      'Trilhas',
    sessoes:      'Sessões',
    biblioteca:   'Biblioteca',
    timer:        'Timer Foco',
  },

  // ── Experiências ─────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  experiencias: {
    module:       'Experiências',
    viagens:      'Viagens',
    bucketList:   'Bucket List',
    memorias:     'Memórias',
    passaporte:   'Passaporte',
  },

  // ── Carreira ─────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  carreira: {
    module:       'Carreira',
    perfil:       'Perfil Profissional',
    roadmap:      'Roadmap',
    habilidades:  'Habilidades',
    historico:    'Histórico',
  },

  // ── Tempo ────────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  tempo: {
    module:       'Tempo',
    agenda:       'Agenda',
    semanal:      'Semanal',
    mensal:       'Mensal',
    review:       'Review Semanal',
    foco:         'Blocos de Foco',
  },

  // ── Patrimônio ───────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  patrimonio: {
    module:       'Patrimônio',
    carteira:     'Carteira',
    proventos:    'Proventos',
    evolucao:     'Evolução',
    simulador:    'Simulador IF',
  },

  // ── Panorama ─────────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  panorama: {
    module:       'Panorama',
    dashboard:    'Dashboard',
    conquistas:   'Conquistas',
    ranking:      'Ranking',
    review:       'Review',
  },

  // ── Configurações ────────────────────────────────────────────────────────
  // Nomes alinhados com a versão web (sidebar)
  configuracoes: {
    module:       'Configurações',
    perfil:       'Perfil',
    aparencia:    'Aparência',
    notificacoes: 'Notificações',
    categorias:   'Categorias',
    integracoes:  'Integrações',
    plano:        'Plano',
  },
} as const

// ─── HELPERS ────────────────────────────────────────────────────────────────────

type ModuleKey = keyof typeof LABELS

/** Returns the motivational label for a given module + key. */
export function jornadaLabel(
  module: ModuleKey,
  key: string,
  defaultLabel: string,
): string {
  const moduleLabels = LABELS[module] as Record<string, string> | undefined
  return moduleLabels?.[key] ?? defaultLabel
}
