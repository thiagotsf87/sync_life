'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Badge, UserBadge } from '@/hooks/use-panorama'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface BadgeCheckResult {
  badge: Badge
  unlocked: boolean
  progress: number // 0-100
  currentValue: number
  targetValue: number
}

interface BadgeEvalContext {
  userId: string
  sb: any
}

// ─── BADGE EVALUATION FUNCTIONS ────────────────────────────────────────────────

type BadgeEvaluator = (ctx: BadgeEvalContext, criteria: Record<string, unknown>) => Promise<{ met: boolean; progress: number; current: number; target: number }>

const evaluators: Record<string, BadgeEvaluator> = {

  // ── Financial ──────────────────────────────────────────────────────────────

  first_transaction: async ({ sb, userId }) => {
    const { count } = await sb
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  budget_respected: async ({ sb, userId }, criteria) => {
    const months = (criteria?.months as number) ?? 1
    const { data: budgets } = await sb
      .from('budgets')
      .select('budget_amount, spent_amount')
      .eq('user_id', userId)
      .eq('is_active', true)
    if (!budgets || budgets.length === 0) return { met: false, progress: 0, current: 0, target: months }
    const allRespected = budgets.every((b: any) => (b.spent_amount ?? 0) <= b.budget_amount)
    return { met: allRespected, progress: allRespected ? 100 : 50, current: allRespected ? 1 : 0, target: months }
  },

  first_report: async ({ sb, userId }) => {
    // We count if user has viewed reports (tracked via a flag or just check if they have transactions)
    const { count } = await sb
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const hasData = (count ?? 0) >= 5 // proxy: 5+ transactions means likely generated a report
    return { met: hasData, progress: hasData ? 100 : Math.min(99, ((count ?? 0) / 5) * 100), current: count ?? 0, target: 5 }
  },

  positive_balance_months: async ({ sb, userId }, criteria) => {
    const targetMonths = (criteria?.months as number) ?? 3
    // Check last N months for positive balance
    let consecutiveMonths = 0
    const now = new Date()

    for (let i = 0; i < targetMonths + 1; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)

      const [incRes, expRes] = await Promise.all([
        sb.from('transactions').select('amount').eq('user_id', userId).eq('type', 'income').gte('date', mStart).lte('date', mEnd),
        sb.from('transactions').select('amount').eq('user_id', userId).eq('type', 'expense').gte('date', mStart).lte('date', mEnd),
      ]) as [{ data: any[] | null }, { data: any[] | null }]

      const income = (incRes.data ?? []).reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
      const expense = (expRes.data ?? []).reduce((s: number, t: any) => s + (t.amount ?? 0), 0)

      if (income > expense && income > 0) {
        consecutiveMonths++
      } else {
        break
      }
    }

    return {
      met: consecutiveMonths >= targetMonths,
      progress: Math.min(100, (consecutiveMonths / targetMonths) * 100),
      current: consecutiveMonths,
      target: targetMonths,
    }
  },

  emergency_reserve: async ({ sb, userId }) => {
    // Check if user has a goal of type 'emergency_reserve' that is completed
    const { data: goals } = await sb
      .from('objective_goals')
      .select('current_value, target_value')
      .eq('goal_type', 'monetary')
      .in('objective_id',
        sb.from('objectives').select('id').eq('user_id', userId).eq('category', 'emergency')
      )

    if (!goals || goals.length === 0) return { met: false, progress: 0, current: 0, target: 1 }
    const best = goals.reduce((best: any, g: any) => {
      const pct = g.target_value > 0 ? (g.current_value / g.target_value) : 0
      return pct > (best.pct ?? 0) ? { ...g, pct } : best
    }, { pct: 0 })
    return { met: best.pct >= 1, progress: Math.min(100, best.pct * 100), current: Math.round(best.pct * 100), target: 100 }
  },

  first_investment: async ({ sb, userId }) => {
    const { count } = await sb
      .from('assets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  // ── Goals / Futuro ─────────────────────────────────────────────────────────

  first_goal: async ({ sb, userId }) => {
    const { count } = await sb
      .from('objectives')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  active_goals: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 3
    const { count } = await sb
      .from('objectives')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')
    const c = count ?? 0
    return { met: c >= target, progress: Math.min(100, (c / target) * 100), current: c, target }
  },

  goal_progress: async ({ sb, userId }, criteria) => {
    const targetPct = (criteria?.pct as number) ?? 50
    const { data: goals } = await sb
      .from('objective_goals')
      .select('current_value, target_value, objective_id')
      .gt('target_value', 0)
      .in('objective_id',
        sb.from('objectives').select('id').eq('user_id', userId)
      )

    if (!goals || goals.length === 0) return { met: false, progress: 0, current: 0, target: targetPct }
    const anyReached = goals.some((g: any) => ((g.current_value / g.target_value) * 100) >= targetPct)
    const bestPct = Math.max(...goals.map((g: any) => (g.current_value / g.target_value) * 100))
    return { met: anyReached, progress: Math.min(100, (bestPct / targetPct) * 100), current: Math.round(bestPct), target: targetPct }
  },

  goal_completed: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 1
    const { count } = await sb
      .from('objectives')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
    const c = count ?? 0
    return { met: c >= target, progress: Math.min(100, (c / target) * 100), current: c, target }
  },

  // ── Body / Corpo ───────────────────────────────────────────────────────────

  first_activity: async ({ sb, userId }) => {
    const { count } = await sb
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  weekly_activity_goal: async ({ sb, userId }, criteria) => {
    const targetWeeks = (criteria?.weeks as number) ?? 1
    const { data: profile } = await sb
      .from('health_profiles')
      .select('weekly_activity_goal')
      .eq('user_id', userId)
      .single()

    const weeklyGoal = profile?.weekly_activity_goal ?? 3
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const { count } = await sb
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', weekStart.toISOString().slice(0, 10))

    const weeksMet = (count ?? 0) >= weeklyGoal ? 1 : 0
    return { met: weeksMet >= targetWeeks, progress: Math.min(100, (weeksMet / targetWeeks) * 100), current: weeksMet, target: targetWeeks }
  },

  first_appointment: async ({ sb, userId }) => {
    const { count } = await sb
      .from('medical_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  weight_goal: async ({ sb, userId }) => {
    const { data: profile } = await sb
      .from('health_profiles')
      .select('weight_goal_kg')
      .eq('user_id', userId)
      .single()

    if (!profile?.weight_goal_kg) return { met: false, progress: 0, current: 0, target: 1 }

    const { data: latest } = await sb
      .from('weight_entries')
      .select('weight')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)

    if (!latest || latest.length === 0) return { met: false, progress: 0, current: 0, target: profile.weight_goal_kg }

    const current = latest[0].weight
    const target = profile.weight_goal_kg
    const met = Math.abs(current - target) <= 0.5
    const progress = met ? 100 : Math.max(0, 100 - Math.abs(current - target) * 10)
    return { met, progress: Math.min(100, progress), current, target }
  },

  hydration_streak: async ({ sb, userId }, criteria) => {
    const targetDays = (criteria?.days as number) ?? 7
    let consecutive = 0
    const today = new Date()

    for (let i = 0; i < targetDays + 1; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)

      const { data: water } = await sb
        .from('daily_water_intake')
        .select('intake_ml, goal_ml')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .single()

      if (water && water.goal_ml > 0 && water.intake_ml >= water.goal_ml) {
        consecutive++
      } else {
        break
      }
    }

    return { met: consecutive >= targetDays, progress: Math.min(100, (consecutive / targetDays) * 100), current: consecutive, target: targetDays }
  },

  // ── Mind / Mente ───────────────────────────────────────────────────────────

  first_focus_session: async ({ sb, userId }) => {
    const { count } = await sb
      .from('focus_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  first_study_track: async ({ sb, userId }) => {
    const { count } = await sb
      .from('study_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  study_track_completed: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 1
    const { count } = await sb
      .from('study_tracks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
    const c = count ?? 0
    return { met: c >= target, progress: Math.min(100, (c / target) * 100), current: c, target }
  },

  focus_hours: async ({ sb, userId }, criteria) => {
    const targetHours = (criteria?.hours as number) ?? 10
    const { data: sessions } = await sb
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
    const totalHours = (sessions ?? []).reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0) / 60
    return { met: totalHours >= targetHours, progress: Math.min(100, (totalHours / targetHours) * 100), current: Math.round(totalHours * 10) / 10, target: targetHours }
  },

  library_resources: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 10
    const { count } = await sb
      .from('library_resources')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= target, progress: Math.min(100, (c / target) * 100), current: c, target }
  },

  // ── Consistency ────────────────────────────────────────────────────────────

  streak: async ({ sb, userId }, criteria) => {
    const targetDays = (criteria?.days as number) ?? 7
    const { data: streak } = await sb
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single()

    const best = Math.max(streak?.current_streak ?? 0, streak?.longest_streak ?? 0)
    return { met: best >= targetDays, progress: Math.min(100, (best / targetDays) * 100), current: best, target: targetDays }
  },

  weekly_review: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 1
    const { count } = await sb
      .from('weekly_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
    const c = count ?? 0
    return { met: c >= target, progress: Math.min(100, (c / target) * 100), current: c, target }
  },

  modules_used_week: async ({ sb, userId }, criteria) => {
    const target = (criteria?.count as number) ?? 4
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const wStart = weekStart.toISOString().slice(0, 10)

    // Check which modules have data this week
    const checks = await Promise.all([
      sb.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('date', wStart),
      sb.from('activities').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('date', wStart),
      sb.from('focus_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('started_at', wStart),
      sb.from('calendar_events').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('date', wStart),
    ]) as { count: number | null }[]

    const modulesUsed = checks.filter(c => (c.count ?? 0) > 0).length
    return { met: modulesUsed >= target, progress: Math.min(100, (modulesUsed / target) * 100), current: modulesUsed, target }
  },

  all_modules_score: async ({ sb, userId }, criteria) => {
    const minScore = (criteria?.min_score as number) ?? 50
    const { data: latest } = await sb
      .from('life_sync_scores')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false })
      .limit(1)

    if (!latest || latest.length === 0) return { met: false, progress: 0, current: 0, target: minScore }

    const scores = [
      latest[0].financas_score, latest[0].futuro_score, latest[0].corpo_score,
      latest[0].mente_score, latest[0].patrimonio_score, latest[0].carreira_score,
      latest[0].tempo_score, latest[0].experiencias_score,
    ].filter((s: any) => s != null) as number[]

    if (scores.length === 0) return { met: false, progress: 0, current: 0, target: minScore }

    const allAbove = scores.every(s => s >= minScore)
    const minFound = Math.min(...scores)
    return { met: allAbove, progress: Math.min(100, (minFound / minScore) * 100), current: Math.round(minFound), target: minScore }
  },

  // ── Career / Experiências ──────────────────────────────────────────────────

  career_profile_complete: async ({ sb, userId }) => {
    const { data: profile } = await sb
      .from('career_profiles')
      .select('current_role, years_experience')
      .eq('user_id', userId)
      .single()

    const complete = !!(profile?.current_role && profile?.years_experience != null)
    return { met: complete, progress: complete ? 100 : 50, current: complete ? 1 : 0, target: 1 }
  },

  first_trip: async ({ sb, userId }) => {
    const { count } = await sb
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },

  first_skill: async ({ sb, userId }) => {
    const { count } = await sb
      .from('skills')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    const c = count ?? 0
    return { met: c >= 1, progress: Math.min(100, c * 100), current: c, target: 1 }
  },
}

// ─── MAIN CHECK FUNCTION ───────────────────────────────────────────────────────

async function evaluateBadge(ctx: BadgeEvalContext, badge: Badge): Promise<BadgeCheckResult> {
  const evaluator = evaluators[badge.criteria_type]
  if (!evaluator) {
    return { badge, unlocked: false, progress: 0, currentValue: 0, targetValue: 1 }
  }

  try {
    const result = await evaluator(ctx, badge.criteria_value)
    return {
      badge,
      unlocked: result.met,
      progress: Math.round(result.progress),
      currentValue: result.current,
      targetValue: result.target,
    }
  } catch {
    return { badge, unlocked: false, progress: 0, currentValue: 0, targetValue: 1 }
  }
}

// ─── CHECK AND UNLOCK NEW BADGES ───────────────────────────────────────────────

export async function checkAndUnlockBadges(userId: string): Promise<BadgeCheckResult[]> {
  const sb = createClient() as any
  const ctx: BadgeEvalContext = { userId, sb }

  // Get all badges and user's unlocked badges
  const [badgesRes, unlockedRes] = await Promise.all([
    sb.from('badges').select('*').eq('is_active', true).order('sort_order'),
    sb.from('user_badges').select('badge_id').eq('user_id', userId),
  ]) as [{ data: Badge[] | null }, { data: { badge_id: string }[] | null }]

  const allBadges = badgesRes.data ?? []
  const unlockedIds = new Set((unlockedRes.data ?? []).map((ub: any) => ub.badge_id))

  // Only check badges not yet unlocked
  const toCheck = allBadges.filter(b => !unlockedIds.has(b.id))
  const results: BadgeCheckResult[] = []

  for (const badge of toCheck) {
    const result = await evaluateBadge(ctx, badge)
    results.push(result)

    // If newly unlocked, persist
    if (result.unlocked) {
      await sb.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        unlocked_at: new Date().toISOString(),
      }).then(() => {}) // ignore conflict
    }
  }

  // Also return already-unlocked badges as 100% progress
  for (const badge of allBadges.filter(b => unlockedIds.has(b.id))) {
    results.push({ badge, unlocked: true, progress: 100, currentValue: 1, targetValue: 1 })
  }

  return results.sort((a, b) => a.badge.sort_order - b.badge.sort_order)
}

// ─── GET ALL BADGE PROGRESS (without unlocking) ───────────────────────────────

export async function getAllBadgeProgress(userId: string): Promise<BadgeCheckResult[]> {
  const sb = createClient() as any
  const ctx: BadgeEvalContext = { userId, sb }

  const [badgesRes, unlockedRes] = await Promise.all([
    sb.from('badges').select('*').eq('is_active', true).order('sort_order'),
    sb.from('user_badges').select('badge_id, unlocked_at').eq('user_id', userId),
  ]) as [{ data: Badge[] | null }, { data: { badge_id: string; unlocked_at: string }[] | null }]

  const allBadges = badgesRes.data ?? []
  const unlockedIds = new Set((unlockedRes.data ?? []).map((ub: any) => ub.badge_id))

  const results: BadgeCheckResult[] = []

  for (const badge of allBadges) {
    if (unlockedIds.has(badge.id)) {
      results.push({ badge, unlocked: true, progress: 100, currentValue: 1, targetValue: 1 })
    } else {
      const result = await evaluateBadge(ctx, badge)
      results.push(result)
    }
  }

  return results
}

// ─── HOOK ──────────────────────────────────────────────────────────────────────

export function useBadgeEngine() {
  const [badges, setBadges]       = useState<BadgeCheckResult[]>([])
  const [newUnlocks, setNewUnlocks] = useState<BadgeCheckResult[]>([])
  const [loading, setLoading]     = useState(true)

  const check = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { setLoading(false); return }

      const results = await checkAndUnlockBadges(user.id)
      setBadges(results)

      // Track newly unlocked badges (those that are unlocked but weren't before)
      const justUnlocked = results.filter(r => r.unlocked && r.progress === 100)
      setNewUnlocks(justUnlocked)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { check() }, [check])

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount = badges.length
  const totalPoints = badges
    .filter(b => b.unlocked)
    .reduce((sum, b) => sum + b.badge.points, 0)

  return {
    badges,
    newUnlocks,
    unlockedCount,
    totalCount,
    totalPoints,
    loading,
    recheck: check,
  }
}
