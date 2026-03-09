// Deterministic mock data for XP/Level/Streak gamification (Jornada mode)
// Future: replace with Supabase queries

export interface FuturoXpData {
  level: number
  levelTitle: string
  streak: number
  currentXp: number
  nextLevelXp: number
  totalXpEarned: number
}

export interface FuturoAchievement {
  id: string
  icon: string
  name: string
  description: string
  xp: number
}

export const FUTURO_XP: FuturoXpData = {
  level: 7,
  levelTitle: 'Arquiteto do Futuro',
  streak: 14,
  currentXp: 2480,
  nextLevelXp: 4000,
  totalXpEarned: 2480,
}

export const FUTURO_ACHIEVEMENTS: FuturoAchievement[] = [
  { id: 'protetor', icon: '🛡️', name: 'Protetor', description: 'Reserva de emergência completa', xp: 350 },
  { id: 'consistente', icon: '📅', name: 'Consistente', description: '34 meses sem parar', xp: 200 },
  { id: 'superador', icon: '💯', name: 'Superador', description: 'Atingiu 102% da meta', xp: 150 },
  { id: 'nivel5', icon: '⚡', name: 'Nível 5', description: 'Arquiteto do Futuro', xp: 100 },
]

export function getXpProgressPct(xp: FuturoXpData): number {
  return Math.round((xp.currentXp / xp.nextLevelXp) * 100)
}

// Per-objective XP mock
export function getObjectiveXpReward(progressPct: number): number {
  if (progressPct >= 100) return 350
  if (progressPct >= 75) return 200
  if (progressPct >= 50) return 120
  return 80
}

// Milestone XP rewards
export const MILESTONE_XP: Record<string, number> = {
  done: 150,
  current: 250,
  future: 500,
}
