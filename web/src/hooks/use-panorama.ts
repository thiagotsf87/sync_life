'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type BadgeRarity   = 'common' | 'uncommon' | 'rare' | 'legendary'
export type BadgeCategory = 'financial' | 'goals' | 'body' | 'mind' | 'consistency' | 'career'

export interface Badge {
  id:             string
  name:           string
  description:    string
  icon:           string
  category:       BadgeCategory
  rarity:         BadgeRarity
  points:         number
  criteria_type:  string
  criteria_value: Record<string, unknown>
  sort_order:     number
}

export interface UserBadge {
  badge_id:    string
  unlocked_at: string
  badge:       Badge
}

export interface LifeSyncScore {
  id:                  string
  score:               number
  financas_score:      number | null
  futuro_score:        number | null
  corpo_score:         number | null
  mente_score:         number | null
  patrimonio_score:    number | null
  carreira_score:      number | null
  tempo_score:         number | null
  experiencias_score:  number | null
  recorded_date:       string
}

export interface UserStreak {
  current_streak:     number
  longest_streak:     number
  last_activity_date: string | null
}

export interface RankingUser {
  user_id:     string
  initials:    string
  score:       number
  badge_count: number
  position:    number
}

// ─── PONTOS POR RARIDADE ─────────────────────────────────────────────────────

export const RARITY_POINTS: Record<BadgeRarity, number> = {
  common:    10,
  uncommon:  25,
  rare:      50,
  legendary: 100,
}

export const RARITY_LABELS: Record<BadgeRarity, string> = {
  common:    'Comum',
  uncommon:  'Incomum',
  rare:      'Rara',
  legendary: 'Lendária',
}

// ─── useBadges — catálogo completo ───────────────────────────────────────────

export function useBadges() {
  const [badges, setBadges]   = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient() as any
    sb.from('badges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }: { data: Badge[] | null }) => {
        if (data) setBadges(data)
        setLoading(false)
      })
  }, [])

  return { badges, loading }
}

// ─── useUserBadges — badges desbloqueadas pelo usuário ───────────────────────

export function useUserBadges() {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const sb = createClient() as any
    sb.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { setLoading(false); return }
      sb.from('user_badges')
        .select('badge_id, unlocked_at, badge:badges(*)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .then(({ data }: { data: UserBadge[] | null }) => {
          if (data) setUserBadges(data)
          setLoading(false)
        })
    })
  }, [])

  return { userBadges, loading }
}

// ─── useLifeScore — score do dia + histórico ─────────────────────────────────

export function useLifeScore() {
  const [score, setScore]     = useState<LifeSyncScore | null>(null)
  const [history, setHistory] = useState<LifeSyncScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient() as any
    sb.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { setLoading(false); return }
      sb.from('life_sync_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false })
        .limit(30)
        .then(({ data }: { data: LifeSyncScore[] | null }) => {
          if (data && data.length > 0) {
            setScore(data[0])
            setHistory(data)
          }
          setLoading(false)
        })
    })
  }, [])

  // Delta vs ontem
  const delta = score && history.length >= 2
    ? Math.round((score.score - history[1].score) * 10) / 10
    : null

  // Delta vs 7 dias atrás
  const deltaWeek = score && history.length >= 7
    ? Math.round((score.score - history[6].score) * 10) / 10
    : null

  return { score, history, delta, deltaWeek, loading }
}

// ─── useStreak — streak do usuário ───────────────────────────────────────────

export function useStreak() {
  const [streak, setStreak]   = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    const sb = createClient() as any
    sb.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { setLoading(false); return }
      sb.from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }: { data: UserStreak | null }) => {
          if (data) setStreak(data)
          setLoading(false)
        })
    })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { streak, loading, refresh }
}

// ─── useRanking — leaderboard simplificado (mock + DB) ───────────────────────

export function useRanking() {
  const [userScore,    setUserScore]    = useState(0)
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const sb = createClient() as any
    sb.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { setLoading(false); return }
      // Score = soma dos pontos das badges desbloqueadas
      sb.from('user_badges')
        .select('badge:badges(points)')
        .eq('user_id', user.id)
        .then(({ data }: { data: { badge: { points: number } }[] | null }) => {
          if (data) {
            const total = data.reduce((acc, row) => acc + (row.badge?.points ?? 0), 0)
            setUserScore(total)
          }
          setLoading(false)
        })
    })
  }, [])

  return { userScore, userPosition, loading }
}

// ─── updateStreak — chama após qualquer ação ─────────────────────────────────

export async function updateStreak(userId: string): Promise<void> {
  const sb = createClient() as any
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await sb
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await sb.from('user_streaks').insert({
      user_id:            userId,
      current_streak:     1,
      longest_streak:     1,
      last_activity_date: today,
    })
    return
  }

  const last = existing.last_activity_date
  if (last === today) return // já registrou hoje

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak = last === yesterdayStr ? existing.current_streak + 1 : 1
  const longest   = Math.max(newStreak, existing.longest_streak)

  await sb.from('user_streaks').update({
    current_streak:     newStreak,
    longest_streak:     longest,
    last_activity_date: today,
    updated_at:         new Date().toISOString(),
  }).eq('user_id', userId)
}

// ─── calcLifeScore — motor de cálculo local (mock scores por módulo) ─────────

export interface ModuleScores {
  financas?:    number
  futuro?:      number
  corpo?:       number
  mente?:       number
  patrimonio?:  number
  carreira?:    number
  tempo?:       number
  experiencias?: number
}

const WEIGHTS: Record<keyof ModuleScores, number> = {
  financas:    0.20,
  futuro:      0.20,
  corpo:       0.15,
  patrimonio:  0.10,
  mente:       0.10,
  carreira:    0.10,
  tempo:       0.10,
  experiencias: 0.05,
}

export function calcLifeScore(scores: ModuleScores): number {
  const active = Object.entries(scores).filter(([, v]) => v !== undefined && v !== null) as [keyof ModuleScores, number][]
  if (active.length === 0) return 0

  // Soma dos pesos dos módulos ativos
  const totalWeight = active.reduce((acc, [key]) => acc + WEIGHTS[key], 0)

  // Média ponderada normalizada
  const weighted = active.reduce((acc, [key, value]) => acc + (WEIGHTS[key] / totalWeight) * value, 0)

  return Math.min(100, Math.max(0, Math.round(weighted * 100) / 100))
}
