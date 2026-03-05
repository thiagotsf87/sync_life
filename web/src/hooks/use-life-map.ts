'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LifeDimension {
  key: string
  label: string      // short label for radar axis
  fullLabel: string  // full label for badges
  icon: string
  value: number      // 0–100
  color: string
}

export interface UseLifeMapReturn {
  dimensions: LifeDimension[]
  overallScore: number
  loading: boolean
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function calcObjectiveProgress(goals: { progress: number; weight: number }[]): number {
  if (!goals || goals.length === 0) return 0
  const totalWeight = goals.reduce((s, g) => s + (g.weight ?? 1), 0)
  if (totalWeight === 0) return 0
  const weighted = goals.reduce((sum, g) => sum + g.progress * (g.weight ?? 1), 0)
  return Math.round(weighted / totalWeight)
}

function financeScore(txns: { type: string; amount: number }[]): number {
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = income > 0 ? Math.max(0, (income - expense) / income * 100) : 0
  if (savingsRate >= 20) return 100
  if (savingsRate >= 10) return 75
  if (savingsRate > 0) return 45
  return income > 0 ? 15 : 0
}

function futuroScore(objectives: { status: string; goals?: { progress: number; weight: number }[] }[]): number {
  const active = objectives.filter(o => o.status === 'active')
  if (active.length === 0) return 0
  const avg = active.reduce((s, o) => s + calcObjectiveProgress(o.goals ?? []), 0) / active.length
  return Math.round(avg)
}

function corpoScore(count: number): number {
  if (count >= 4) return 100
  if (count === 3) return 80
  if (count === 2) return 55
  if (count === 1) return 30
  return 5
}

function menteScore(weekMinutes: number): number {
  const hours = weekMinutes / 60
  if (hours >= 5) return 100
  if (hours >= 3) return 75
  if (hours >= 1) return 50
  if (hours > 0) return 25
  return 5
}

function carreiraScore(steps: { status: string }[]): number {
  if (steps.length === 0) return 20
  const done = steps.filter(s => s.status === 'completed').length
  return Math.max(10, Math.round((done / steps.length) * 100))
}

function patrimonioScore(count: number): number {
  if (count >= 10) return 100
  if (count >= 5) return 80
  if (count >= 3) return 60
  if (count >= 1) return 35
  return 10
}

function experienciasScore(activeCount: number): number {
  if (activeCount >= 2) return 90
  if (activeCount === 1) return 60
  return 20
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLifeMap(): UseLifeMapReturn {
  const [dimensions, setDimensions] = useState<LifeDimension[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [txnsRes, objRes, goalsRes, actsRes, sessionsRes, assetsRes, roadmapRes, tripsRes] = await Promise.all([
        sb.from('transactions').select('type,amount').eq('user_id', user.id).gte('date', monthStart),
        sb.from('objectives').select('id,status').eq('user_id', user.id),
        sb.from('objective_goals').select('objective_id,progress,weight'),
        sb.from('activities').select('id').eq('user_id', user.id).gte('recorded_at', weekAgo),
        sb.from('focus_sessions_mente').select('focus_minutes').eq('user_id', user.id).gte('recorded_at', weekAgo),
        sb.from('portfolio_assets').select('id').eq('user_id', user.id),
        sb.from('career_roadmaps').select('id,steps:roadmap_steps(status)').eq('user_id', user.id).eq('status', 'active').limit(1),
        sb.from('trips').select('status').eq('user_id', user.id),
      ]) as [
        { data: { type: string; amount: number }[] | null; error: unknown },
        { data: { id: string; status: string }[] | null; error: unknown },
        { data: { objective_id: string; progress: number; weight: number }[] | null; error: unknown },
        { data: { id: string }[] | null; error: unknown },
        { data: { focus_minutes: number }[] | null; error: unknown },
        { data: { id: string }[] | null; error: unknown },
        { data: { id: string; steps: { status: string }[] }[] | null; error: unknown },
        { data: { status: string }[] | null; error: unknown },
      ]

      const txns = txnsRes.data ?? []
      const objs = (objRes.data ?? []).map(o => ({
        ...o,
        goals: (goalsRes.data ?? []).filter(g => g.objective_id === o.id),
      }))
      const weekActivityCount = (actsRes.data ?? []).length
      const weekMins = (sessionsRes.data ?? []).reduce((s, sess) => s + sess.focus_minutes, 0)
      const assetCount = (assetsRes.data ?? []).length
      const roadmapSteps = roadmapRes.data?.[0]?.steps ?? []
      const activeTrips = (tripsRes.data ?? []).filter(t => ['planning', 'reserved', 'ongoing'].includes(t.status))

      const dims: LifeDimension[] = [
        {
          key: 'financas',
          label: 'Finanças',
          fullLabel: 'Finanças',
          icon: '💰',
          value: financeScore(txns),
          color: '#10b981',
        },
        {
          key: 'futuro',
          label: 'Futuro',
          fullLabel: 'Futuro / Metas',
          icon: '🔮',
          value: futuroScore(objs),
          color: '#0055ff',
        },
        {
          key: 'corpo',
          label: 'Corpo',
          fullLabel: 'Saúde / Corpo',
          icon: '🏃',
          value: corpoScore(weekActivityCount),
          color: '#f97316',
        },
        {
          key: 'mente',
          label: 'Mente',
          fullLabel: 'Mente / Estudo',
          icon: '🧠',
          value: menteScore(weekMins),
          color: '#a855f7',
        },
        {
          key: 'carreira',
          label: 'Carreira',
          fullLabel: 'Carreira',
          icon: '💼',
          value: carreiraScore(roadmapSteps),
          color: '#f59e0b',
        },
        {
          key: 'patrimonio',
          label: 'Patrimônio',
          fullLabel: 'Patrimônio',
          icon: '📈',
          value: patrimonioScore(assetCount),
          color: '#06b6d4',
        },
        {
          key: 'experiencias',
          label: 'Viagens',
          fullLabel: 'Experiências',
          icon: '✈️',
          value: experienciasScore(activeTrips.length),
          color: '#f43f5e',
        },
      ]

      setDimensions(dims)
    } catch {
      // silent — show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const overallScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length)
    : 0

  return { dimensions, overallScore, loading }
}
