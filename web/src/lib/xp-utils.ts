// Pure functions extracted from use-xp.ts for testability

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type XPAction =
  | 'transaction_created'
  | 'budget_created'
  | 'goal_created'
  | 'goal_progress'
  | 'goal_completed'
  | 'activity_logged'
  | 'weight_logged'
  | 'appointment_created'
  | 'session_completed'
  | 'track_created'
  | 'track_completed'
  | 'event_created'
  | 'trip_created'
  | 'skill_added'
  | 'asset_added'
  | 'badge_unlocked'
  | 'review_completed'
  | 'streak_7'
  | 'streak_30'
  | 'streak_90'
  | 'streak_365'
  | 'daily_login'

// ─── XP VALUES PER ACTION ──────────────────────────────────────────────────────

export const XP_VALUES: Record<XPAction, number> = {
  transaction_created:  5,
  budget_created:       10,
  goal_created:         15,
  goal_progress:        10,
  goal_completed:       50,
  activity_logged:      10,
  weight_logged:        5,
  appointment_created:  10,
  session_completed:    15,
  track_created:        10,
  track_completed:      50,
  event_created:        5,
  trip_created:         20,
  skill_added:          10,
  asset_added:          15,
  badge_unlocked:       0,   // badge points are used instead
  review_completed:     50,
  streak_7:             20,
  streak_30:            50,
  streak_90:            100,
  streak_365:           500,
  daily_login:          2,
}

// ─── LEVEL SYSTEM ──────────────────────────────────────────────────────────────

// XP needed for each level (cumulative)
// Level 1: 0 XP, Level 2: 50*(2-1)^1.5 = 50, Level 3: 50*(3-1)^1.5 ≈ 141, etc.
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(50 * Math.pow(level - 1, 1.5))
}

export function getLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  while (getXPForLevel(level + 1) <= totalXP) {
    level++
  }

  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const progress = nextLevelXP > currentLevelXP
    ? ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100

  return { level, currentLevelXP, nextLevelXP, progress: Math.min(100, Math.round(progress)) }
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Praticante',
  4: 'Competente',
  5: 'Habilidoso',
  6: 'Experiente',
  7: 'Avançado',
  8: 'Expert',
  9: 'Mestre',
  10: 'Grão-Mestre',
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return LEVEL_TITLES[10]
  return LEVEL_TITLES[level] ?? `Nível ${level}`
}
