'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const XP_VALUES: Record<XPAction, number> = {
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
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250, etc.
function getXPForLevel(level: number): number {
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

// ─── ADD XP FUNCTION ───────────────────────────────────────────────────────────

export async function addXP(userId: string, action: XPAction, bonusPoints?: number): Promise<number> {
  const sb = createClient() as any
  const points = bonusPoints ?? XP_VALUES[action]

  if (points <= 0) return 0

  // Log XP event
  await sb.from('user_xp_log').insert({
    user_id: userId,
    action,
    points,
    created_at: new Date().toISOString(),
  })

  return points
}

// ─── GET TOTAL XP ──────────────────────────────────────────────────────────────

export async function getTotalXP(userId: string): Promise<number> {
  const sb = createClient() as any
  const { data } = await sb
    .from('user_xp_log')
    .select('points')
    .eq('user_id', userId)

  return (data ?? []).reduce((sum: number, row: any) => sum + (row.points ?? 0), 0)
}

// ─── HOOK ──────────────────────────────────────────────────────────────────────

export function useXP() {
  const [totalXP, setTotalXP]       = useState(0)
  const [todayXP, setTodayXP]       = useState(0)
  const [loading, setLoading]       = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { setLoading(false); return }

      // Total XP
      const { data: allXP } = await sb
        .from('user_xp_log')
        .select('points')
        .eq('user_id', user.id)

      const total = (allXP ?? []).reduce((sum: number, row: any) => sum + (row.points ?? 0), 0)
      setTotalXP(total)

      // Today's XP
      const today = new Date().toISOString().slice(0, 10)
      const { data: todayData } = await sb
        .from('user_xp_log')
        .select('points')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)

      const dayTotal = (todayData ?? []).reduce((sum: number, row: any) => sum + (row.points ?? 0), 0)
      setTodayXP(dayTotal)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const levelInfo = getLevelFromXP(totalXP)

  const award = useCallback(async (action: XPAction, bonusPoints?: number): Promise<number> => {
    const sb = createClient() as any
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return 0

    const points = await addXP(user.id, action, bonusPoints)
    // Update local state immediately
    setTotalXP(prev => prev + points)
    setTodayXP(prev => prev + points)
    return points
  }, [])

  return {
    totalXP,
    todayXP,
    level: levelInfo.level,
    levelTitle: getLevelTitle(levelInfo.level),
    levelProgress: levelInfo.progress,
    nextLevelXP: levelInfo.nextLevelXP,
    currentLevelXP: levelInfo.currentLevelXP,
    loading,
    award,
    refresh,
  }
}
