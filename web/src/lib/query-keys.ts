// Centralized query key factory for TanStack Query
// Convention: each module has a top-level key, with sub-keys for list/detail operations

export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (filters: { month: number; year: number; type?: string; search?: string; categoryId?: string; sort?: string; page?: number }) =>
      ['transactions', 'list', filters] as const,
  },

  corpo: {
    all: ['corpo'] as const,
    dashboard: (userId: string) => ['corpo', 'dashboard', userId] as const,
    profile: (userId: string) => ['corpo', 'profile', userId] as const,
    weight: (userId: string) => ['corpo', 'weight', userId] as const,
    activities: (userId: string) => ['corpo', 'activities', userId] as const,
    appointments: (userId: string, status?: string) => ['corpo', 'appointments', userId, status] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => ['notifications', 'list', userId] as const,
  },

  financas: {
    all: ['financas'] as const,
    budgets: (userId: string) => ['financas', 'budgets', userId] as const,
    recurring: (userId: string) => ['financas', 'recurring', userId] as const,
  },

  futuro: {
    all: ['futuro'] as const,
    objectives: (userId: string) => ['futuro', 'objectives', userId] as const,
  },

  tempo: {
    all: ['tempo'] as const,
    events: (userId: string, week?: string) => ['tempo', 'events', userId, week] as const,
  },

  patrimonio: {
    all: ['patrimonio'] as const,
    assets: (userId: string) => ['patrimonio', 'assets', userId] as const,
  },

  experiencias: {
    all: ['experiencias'] as const,
    trips: (userId: string) => ['experiencias', 'trips', userId] as const,
  },
} as const
