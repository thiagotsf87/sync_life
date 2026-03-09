// ─── LABELS ─────────────────────────────────────────────────────────────────────
// Motivational labels — single unified experience (no mode switching).

export const LABELS = {
  // ── Finanças ─────────────────────────────────────────────────────────────
  financas: {
    module:       'Cofre',
    transacoes:   'Movimentos',
    receitas:     'Entradas',
    despesas:     'Saídas',
    orcamentos:   'Envelopes',
    recorrentes:  'Compromissos',
    planejamento: 'Visão do Futuro',
    relatorios:   'Análise',
    calendario:   'Mapa de Gastos',
    saldo:        'Reserva',
  },

  // ── Futuro ───────────────────────────────────────────────────────────────
  futuro: {
    module:       'Missões',
    objetivos:    'Missões',
    metas:        'Conquistas',
    checkin:      'Ponto de Controle',
    lifeMap:      'Mapa da Vida',
    aporte:       'Investimento no Sonho',
    milestone:    'Marco',
  },

  // ── Corpo ────────────────────────────────────────────────────────────────
  corpo: {
    module:       'Vitalidade',
    atividades:   'Treinos',
    peso:         'Evolução',
    consultas:    'Check-ups',
    cardapio:     'Nutrição',
    coach:        'Coach',
    hidratacao:   'Hidratação',
  },

  // ── Mente ────────────────────────────────────────────────────────────────
  mente: {
    module:       'Sabedoria',
    trilhas:      'Jornadas',
    sessoes:      'Sessões de Foco',
    biblioteca:   'Acervo',
    timer:        'Zona de Foco',
  },

  // ── Experiências ─────────────────────────────────────────────────────────
  experiencias: {
    module:       'Aventuras',
    viagens:      'Missões',
    bucketList:   'Lista de Desejos',
    memorias:     'Diário',
    passaporte:   'Passaporte',
  },

  // ── Carreira ─────────────────────────────────────────────────────────────
  carreira: {
    module:       'Evolução',
    perfil:       'Identidade',
    roadmap:      'Trilha',
    habilidades:  'Poderes',
    historico:    'Trajetória',
  },

  // ── Tempo ────────────────────────────────────────────────────────────────
  tempo: {
    module:       'Ritmo',
    agenda:       'Compromissos',
    semanal:      'Minha Semana',
    mensal:       'Visão do Mês',
    review:       'Retrospectiva',
    foco:         'Zona de Foco',
  },

  // ── Patrimônio ───────────────────────────────────────────────────────────
  patrimonio: {
    module:       'Tesouro',
    carteira:     'Portfólio',
    proventos:    'Colheita',
    evolucao:     'Crescimento',
    simulador:    'Simulador IF',
  },

  // ── Panorama ─────────────────────────────────────────────────────────────
  panorama: {
    module:       'Cockpit',
    dashboard:    'Meu Painel',
    conquistas:   'Conquistas',
    ranking:      'Arena',
    review:       'Retrospectiva',
  },

  // ── Configurações ────────────────────────────────────────────────────────
  configuracoes: {
    module:       'Preferências',
    perfil:       'Meu Perfil',
    aparencia:    'Visual',
    notificacoes: 'Alertas',
    categorias:   'Categorias',
    integracoes:  'Conexões',
    plano:        'Meu Plano',
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
