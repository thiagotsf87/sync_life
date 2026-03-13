'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  clamp,
  getScoreLabel,
  getScoreColor,
  monthStart,
  monthEnd,
  weekAgo,
  quarterAgo,
  WEIGHTS,
} from '@/lib/score-utils'
import type { ModuleKey, ModuleScoreDetail, LifeScoreResult } from '@/lib/score-utils'

// Re-export types for consumers that import from this hook
export type { ModuleKey, ModuleScoreDetail, LifeScoreResult } from '@/lib/score-utils'

// ─── SCORE CALCULATORS PER MODULE ──────────────────────────────────────────────

async function calcFinancasScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  const start = monthStart()
  const end = monthEnd()

  // 1. Budget compliance (40%)
  const now = new Date()
  const { count: budgetCount } = await sb
    .from('budgets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('month', now.getMonth() + 1)
    .eq('year', now.getFullYear())

  // Budget compliance: score based on having budgets set up (50 base) + transaction count (50 bonus)
  const budgetScore = (budgetCount ?? 0) > 0 ? 75 : 30

  // 2. Registration consistency (30%) — transactions this month
  const { count: txCount } = await sb
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  const registrationScore = Math.min(100, ((txCount ?? 0) / 20) * 100) // 20+ transactions = 100%

  // 3. Trend vs last month (30%)
  const prevStart = new Date()
  prevStart.setMonth(prevStart.getMonth() - 1)
  const prevMonthStart = `${prevStart.getFullYear()}-${String(prevStart.getMonth() + 1).padStart(2, '0')}-01`
  const prevMonthEnd = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 0).toISOString().slice(0, 10)

  const { data: currentIncome } = await sb
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('date', start)
    .lte('date', end)

  const { data: currentExpense } = await sb
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', start)
    .lte('date', end)

  const { data: prevIncome } = await sb
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('date', prevMonthStart)
    .lte('date', prevMonthEnd)

  const { data: prevExpense } = await sb
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', prevMonthStart)
    .lte('date', prevMonthEnd)

  const sumAmounts = (arr: any[] | null) => (arr ?? []).reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const curBalance = sumAmounts(currentIncome) - sumAmounts(currentExpense)
  const prevBalance = sumAmounts(prevIncome) - sumAmounts(prevExpense)

  let trendScore = 50
  if (prevBalance !== 0) {
    const improvement = ((curBalance - prevBalance) / Math.abs(prevBalance)) * 100
    trendScore = clamp(50 + improvement / 2) // +/- 50% maps to 0-100
  } else if (curBalance > 0) {
    trendScore = 80
  }

  const score = clamp(budgetScore * 0.4 + registrationScore * 0.3 + trendScore * 0.3)

  return {
    module: 'financas',
    score,
    weight: WEIGHTS.financas,
    components: { budgetScore, registrationScore, trendScore },
  }
}

async function calcFuturoScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  const qStart = quarterAgo()

  // 1. Objectives with progress this month (50%)
  const { data: objectives } = await sb
    .from('objectives')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['active', 'completed'])

  let progressScore = 0
  if (objectives && objectives.length > 0) {
    const { data: goals } = await sb
      .from('objective_goals')
      .select('objective_id, current_value, target_value')
      .in('objective_id', objectives.map((o: any) => o.id))

    if (goals && goals.length > 0) {
      const withProgress = goals.filter((g: any) => (g.current_value ?? 0) > 0).length
      progressScore = (withProgress / goals.length) * 100
    }
  }

  // 2. Goals completed in quarter (50%)
  const { count: completedCount } = await sb
    .from('objectives')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', qStart)

  const completedScore = Math.min(100, ((completedCount ?? 0) / 3) * 100) // 3 completed = 100%

  const score = clamp(progressScore * 0.5 + completedScore * 0.5)

  return {
    module: 'futuro',
    score,
    weight: WEIGHTS.futuro,
    components: { progressScore, completedScore },
  }
}

async function calcCorpoScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  const wStart = weekAgo()
  const mStart = monthStart()

  // 1. Activities/week vs goal (30%)
  const { data: profile } = await sb
    .from('health_profiles')
    .select('weekly_activity_goal')
    .eq('user_id', userId)
    .maybeSingle()

  const weeklyGoal = profile?.weekly_activity_goal ?? 3
  const { count: weekActivities } = await sb
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('recorded_at', wStart)

  const activityScore = Math.min(100, ((weekActivities ?? 0) / weeklyGoal) * 100)

  // 2. Appointments up to date (30%)
  const { count: scheduledAppts } = await sb
    .from('medical_appointments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['scheduled', 'completed'])
    .gte('appointment_date', mStart)

  const appointmentScore = (scheduledAppts ?? 0) > 0 ? 80 : 30

  // 3. Weight tracking (20%)
  const { count: weightEntries } = await sb
    .from('weight_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('recorded_at', mStart)

  const weightScore = Math.min(100, ((weightEntries ?? 0) / 4) * 100) // 4+ entries/month = 100%

  // 4. Hydration (20%)
  const today = new Date().toISOString().slice(0, 10)
  const { data: water } = await sb
    .from('daily_water_intake')
    .select('intake_ml, goal_ml')
    .eq('user_id', userId)
    .eq('recorded_date', today)
    .maybeSingle()

  let hydrationScore = 0
  if (water && water.goal_ml > 0) {
    hydrationScore = Math.min(100, (water.intake_ml / water.goal_ml) * 100)
  }

  const score = clamp(activityScore * 0.3 + appointmentScore * 0.3 + weightScore * 0.2 + hydrationScore * 0.2)

  return {
    module: 'corpo',
    score,
    weight: WEIGHTS.corpo,
    components: { activityScore, appointmentScore, weightScore, hydrationScore },
  }
}

async function calcMenteScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  const wStart = weekAgo()

  // 1. Hours studied vs goal (50%) — 5h/week as default goal
  const { data: sessions } = await sb
    .from('focus_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('date', wStart)

  const totalMinutes = (sessions ?? []).reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0)
  const hoursScore = Math.min(100, (totalMinutes / 300) * 100) // 5h = 300min

  // 2. Streak (30%)
  const { data: streak } = await sb
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .maybeSingle()

  const streakScore = Math.min(100, ((streak?.current_streak ?? 0) / 30) * 100) // 30-day streak = 100%

  // 3. Active tracks (20%)
  const { count: tracks } = await sb
    .from('study_tracks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  const tracksScore = Math.min(100, ((tracks ?? 0) / 3) * 100) // 3 active tracks = 100%

  const score = clamp(hoursScore * 0.5 + streakScore * 0.3 + tracksScore * 0.2)

  return {
    module: 'mente',
    score,
    weight: WEIGHTS.mente,
    components: { hoursScore, streakScore, tracksScore },
  }
}

async function calcPatrimonioScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  // 1. Contributions made vs planned (50%)
  const mStart = monthStart()
  const { data: assetTx } = await sb
    .from('asset_transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('date', mStart)

  const totalContrib = (assetTx ?? [])
    .filter((t: any) => t.type === 'buy' || t.type === 'deposit')
    .reduce((s: number, t: any) => s + (t.amount ?? 0), 0)

  const contribScore = Math.min(100, (totalContrib / 1000) * 100) // R$ 1000/month = 100%

  // 2. Diversification (50%)
  const { data: assets } = await sb
    .from('portfolio_assets')
    .select('asset_class')
    .eq('user_id', userId)

  const types = new Set((assets ?? []).map((a: any) => a.asset_class))
  const diversScore = Math.min(100, (types.size / 4) * 100) // 4+ types = 100%

  const score = clamp(contribScore * 0.5 + diversScore * 0.5)

  return {
    module: 'patrimonio',
    score,
    weight: WEIGHTS.patrimonio,
    components: { contribScore, diversScore },
  }
}

async function calcCarreiraScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  // 1. Roadmap steps in progress (50%) — via career_roadmaps JOIN
  const { data: roadmaps } = await sb
    .from('career_roadmaps')
    .select('steps:roadmap_steps(status)')
    .eq('user_id', userId)

  const allSteps = (roadmaps ?? []).flatMap((r: any) => r.steps ?? [])
  let roadmapScore = 0
  if (allSteps.length > 0) {
    const inProgress = allSteps.filter((s: any) => s.status === 'in_progress' || s.status === 'completed').length
    roadmapScore = (inProgress / allSteps.length) * 100
  }

  // 2. Skills evolving (50%)
  const { data: skills } = await sb
    .from('skills')
    .select('proficiency_level')
    .eq('user_id', userId)

  let skillsScore = 0
  if (skills && skills.length > 0) {
    const evolving = skills.filter((s: any) => (s.proficiency_level ?? 0) > 0).length
    skillsScore = (evolving / skills.length) * 100
  }

  const score = clamp(roadmapScore * 0.5 + skillsScore * 0.5)

  return {
    module: 'carreira',
    score,
    weight: WEIGHTS.carreira,
    components: { roadmapScore, skillsScore },
  }
}

async function calcTempoScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  const wStart = weekAgo()
  const mStart = monthStart()

  // 1. Events completed % (50%)
  const { data: events } = await sb
    .from('agenda_events')
    .select('status')
    .eq('user_id', userId)
    .gte('date', wStart)

  let completionScore = 50
  if (events && events.length > 0) {
    const done = events.filter((e: any) => e.status === 'concluido' || e.status === 'completed').length
    completionScore = (done / events.length) * 100
  }

  // 2. Usage consistency (50%) — events created this month
  const { count: monthEvents } = await sb
    .from('agenda_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', mStart)

  const consistencyScore = Math.min(100, ((monthEvents ?? 0) / 15) * 100) // 15+ events/month = 100%

  const score = clamp(completionScore * 0.5 + consistencyScore * 0.5)

  return {
    module: 'tempo',
    score,
    weight: WEIGHTS.tempo,
    components: { completionScore, consistencyScore },
  }
}

async function calcExperienciasScore(sb: any, userId: string): Promise<ModuleScoreDetail> {
  // Experiências is episodic — score based on trip engagement
  const { data: trips } = await sb
    .from('trips')
    .select('id, status')
    .eq('user_id', userId)

  let tripScore = 0
  if (trips && trips.length > 0) {
    const planned = trips.filter((t: any) => t.status === 'planning' || t.status === 'confirmed').length
    const completed = trips.filter((t: any) => t.status === 'completed').length
    tripScore = Math.min(100, ((planned * 20) + (completed * 40)))
  }

  // Bucket list engagement
  const { count: bucketItems } = await sb
    .from('bucket_list_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const bucketScore = Math.min(100, ((bucketItems ?? 0) / 10) * 100)

  const score = clamp(tripScore * 0.6 + bucketScore * 0.4)

  return {
    module: 'experiencias',
    score,
    weight: WEIGHTS.experiencias,
    components: { tripScore, bucketScore },
  }
}

// ─── MODULE SCORE CALCULATORS MAP ──────────────────────────────────────────────

const MODULE_CALCULATORS: Record<ModuleKey, (sb: any, userId: string) => Promise<ModuleScoreDetail>> = {
  financas:     calcFinancasScore,
  futuro:       calcFuturoScore,
  corpo:        calcCorpoScore,
  mente:        calcMenteScore,
  patrimonio:   calcPatrimonioScore,
  carreira:     calcCarreiraScore,
  tempo:        calcTempoScore,
  experiencias: calcExperienciasScore,
}

// ─── MAIN CALCULATOR ───────────────────────────────────────────────────────────

export async function calculateAllScores(userId: string, activeModules?: ModuleKey[]): Promise<LifeScoreResult> {
  const sb = createClient() as any
  const allModules = activeModules ?? (Object.keys(WEIGHTS) as ModuleKey[])
  // Filter to only known modules (guards against stale DB values like 'agenda' → now 'tempo')
  const modules = allModules.filter(m => m in MODULE_CALCULATORS)

  const results: ModuleScoreDetail[] = []

  // Calculate scores for each active module (with error handling per module)
  for (const mod of modules) {
    try {
      const result = await MODULE_CALCULATORS[mod](sb, userId)
      results.push(result)
    } catch {
      // If a module fails, assign 0 score
      results.push({ module: mod, score: 0, weight: WEIGHTS[mod], components: {} })
    }
  }

  // Calculate weighted average (redistribute weights for active modules only)
  const totalWeight = results.reduce((acc, r) => acc + r.weight, 0)
  const total = totalWeight > 0
    ? results.reduce((acc, r) => acc + (r.weight / totalWeight) * r.score, 0)
    : 0

  const finalScore = clamp(total)

  return {
    total: finalScore,
    modules: results,
    label: getScoreLabel(finalScore),
    color: getScoreColor(finalScore),
  }
}

// ─── PERSIST SCORE ─────────────────────────────────────────────────────────────

export async function persistLifeScore(userId: string, result: LifeScoreResult): Promise<void> {
  const sb = createClient() as any
  const today = new Date().toISOString().slice(0, 10)

  // Only columns that exist in life_sync_scores
  const VALID_SCORE_COLS = new Set([
    'financas_score', 'futuro_score', 'corpo_score', 'mente_score',
    'patrimonio_score', 'carreira_score', 'tempo_score', 'experiencias_score',
  ])

  const scoreByModule: Record<string, number | null> = {
    financas_score: null,
    futuro_score: null,
    corpo_score: null,
    mente_score: null,
    patrimonio_score: null,
    carreira_score: null,
    tempo_score: null,
    experiencias_score: null,
  }

  for (const m of result.modules) {
    const col = `${m.module}_score`
    if (VALID_SCORE_COLS.has(col)) {
      scoreByModule[col] = m.score
    }
  }

  await sb.from('life_sync_scores').upsert({
    user_id: userId,
    score: result.total,
    ...scoreByModule,
    recorded_date: today,
  }, { onConflict: 'user_id,recorded_date' })
}

// ─── HOOK ──────────────────────────────────────────────────────────────────────

export function useScoreEngine() {
  const [result, setResult]   = useState<LifeScoreResult | null>(null)
  const [loading, setLoading] = useState(true)

  const calculate = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { setLoading(false); return }

      // Get active modules from profile
      const { data: profile } = await sb
        .from('profiles')
        .select('active_modules')
        .eq('id', user.id)
        .single()

      const activeModules = profile?.active_modules as ModuleKey[] | undefined

      const scoreResult = await calculateAllScores(user.id, activeModules)
      setResult(scoreResult)

      // Persist today's score
      await persistLifeScore(user.id, scoreResult)
    } catch {
      // Silent fail — score is not critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { calculate() }, [calculate])

  return { result, loading, recalculate: calculate }
}
