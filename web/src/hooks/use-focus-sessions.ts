'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface FocusSession {
  id: string
  user_id: string
  goal_id?: string
  event_id?: string
  duration_minutes: number
  date: string       // YYYY-MM-DD
  start_time?: string
  notes?: string
  created_at: string
}

export interface FocusSessionFormData {
  duration_minutes: number
  date: string
  start_time?: string
  goal_id?: string
  event_id?: string
  notes?: string
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

type FilterPeriod = 'today' | 'week' | 'month'

interface UseFocusSessionsReturn {
  sessions: FocusSession[]
  loading: boolean
  error: string | null
  kpis: {
    todayMinutes: number
    weekMinutes: number
    monthMinutes: number
    streakDays: number
    monthCount: number
  }
  refresh: () => void
  create: (data: FocusSessionFormData) => Promise<FocusSession>
  update: (id: string, data: Partial<FocusSessionFormData>) => Promise<FocusSession>
  remove: (id: string) => Promise<void>
}

export function useFocusSessions(filter: FilterPeriod = 'week'): UseFocusSessionsReturn {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [allSessions, setAllSessions] = useState<FocusSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const cancelled = useRef(false)

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().split('T')[0]
  })()
  const monthStart = (() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })()

  useEffect(() => {
    cancelled.current = false
    setLoading(true)
    setError(null)

    const supabase = createClient() as any

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) {
        if (!cancelled.current) setLoading(false)
        return
      }

      // Fetch all sessions for current month (for KPIs) and filtered sessions
      const [filteredRes, monthRes] = await Promise.all([
        supabase
          .from('focus_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', filter === 'today' ? today : filter === 'week' ? weekAgo : monthStart)
          .lte('date', today)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('focus_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', today)
          .order('date', { ascending: false }),
      ])

      if (cancelled.current) return

      if (filteredRes.error) {
        setError(filteredRes.error.message)
        setLoading(false)
        return
      }

      setSessions((filteredRes.data ?? []) as FocusSession[])
      setAllSessions((monthRes.data ?? []) as FocusSession[])
      setLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [filter, today, weekAgo, monthStart, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const kpis = (() => {
    const todayMinutes = allSessions
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.duration_minutes, 0)

    const weekSessions = allSessions.filter(s => s.date >= weekAgo)
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0)

    const monthMinutes = allSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
    const monthCount = allSessions.length

    // Streak: contiguous days from today backwards with at least 1 session
    const datesWithSessions = new Set(allSessions.map(s => s.date))
    let streakDays = 0
    const cursor = new Date()
    while (true) {
      const dateStr = cursor.toISOString().split('T')[0]
      if (!datesWithSessions.has(dateStr)) break
      streakDays++
      cursor.setDate(cursor.getDate() - 1)
    }

    return { todayMinutes, weekMinutes, monthMinutes, streakDays, monthCount }
  })()

  const create = useCallback(async (data: FocusSessionFormData): Promise<FocusSession> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: created, error: err } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        duration_minutes: data.duration_minutes,
        date: data.date,
        start_time: data.start_time ?? null,
        goal_id: data.goal_id ?? null,
        event_id: data.event_id ?? null,
        notes: data.notes ?? null,
      })
      .select('*')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return created as FocusSession
  }, [refresh])

  const update = useCallback(async (id: string, data: Partial<FocusSessionFormData>): Promise<FocusSession> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload: Record<string, unknown> = {}
    if (data.duration_minutes !== undefined) payload.duration_minutes = data.duration_minutes
    if (data.date !== undefined) payload.date = data.date
    if (data.start_time !== undefined) payload.start_time = data.start_time ?? null
    if (data.goal_id !== undefined) payload.goal_id = data.goal_id ?? null
    if (data.event_id !== undefined) payload.event_id = data.event_id ?? null
    if (data.notes !== undefined) payload.notes = data.notes ?? null

    const { data: updated, error: err } = await supabase
      .from('focus_sessions')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return updated as FocusSession
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  return { sessions, loading, error, kpis, refresh, create, update, remove }
}
