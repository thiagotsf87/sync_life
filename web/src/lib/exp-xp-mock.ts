// Deterministic mock data for XP/Level/Streak gamification (Jornada mode)
// Future: replace with Supabase queries

export interface ExpXpData {
  level: number
  levelTitle: string
  streak: number
  currentXp: number
  nextLevelXp: number
}

export const EXP_XP: ExpXpData = {
  level: 4,
  levelTitle: 'Explorador Audacioso',
  streak: 9,
  currentXp: 620,
  nextLevelXp: 1000,
}

export function getExpXpProgressPct(xp: ExpXpData): number {
  return Math.round((xp.currentXp / xp.nextLevelXp) * 100)
}

export interface ExpAchievement {
  id: string
  icon: string
  name: string
  xp: number
}

export const EXP_ACHIEVEMENTS: ExpAchievement[] = [
  { id: 'japao', icon: '🗾', name: 'Japão — País #8', xp: 80 },
  { id: 'italia', icon: '🇮🇹', name: 'Itália — País #9', xp: 80 },
  { id: 'argentina', icon: '🇦🇷', name: 'Argentina ✓', xp: 80 },
]

// XP rewards for trip actions
export const TRIP_XP = {
  create: 50,
  newCountry: 80,
  budgetComplete: 120,
  checklistItem: 3,
  soloBonus: 20,
  dailyActivity: 10,
  perAporte: 10,
} as const
