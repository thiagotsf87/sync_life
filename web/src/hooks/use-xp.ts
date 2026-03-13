'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLevelFromXP, getLevelTitle, XP_VALUES } from '@/lib/xp-utils'
import type { XPAction } from '@/lib/xp-utils'

// Re-export for consumers that import from this hook
export { getLevelFromXP, getLevelTitle, LEVEL_TITLES, XP_VALUES } from '@/lib/xp-utils'
export type { XPAction } from '@/lib/xp-utils'

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
