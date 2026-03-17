// Deterministic mock data for XP/Level/Streak gamification (Jornada mode)
// Future: replace with Supabase queries

export interface CarreiraXpData {
  level: number
  levelTitle: string
  streak: number
  currentXp: number
  nextLevelXp: number
  totalXpEarned: number
}

export const CARREIRA_XP: CarreiraXpData = {
  level: 0,
  levelTitle: '',
  streak: 0,
  currentXp: 0,
  nextLevelXp: 1,
  totalXpEarned: 0,
}

export function getCarreiraXpPct(xp: CarreiraXpData): number {
  return Math.round((xp.currentXp / xp.nextLevelXp) * 100)
}

export const CARREIRA_RPG_LEVELS: Record<number, string> = {
  1: 'Noviço',
  2: 'Aprendiz',
  3: 'Guerreiro',
  4: 'Mestre',
  5: 'Lenda',
}
