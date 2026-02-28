'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackCategory =
  | 'technology' | 'languages' | 'management' | 'marketing' | 'design'
  | 'finance' | 'health' | 'exam' | 'undergraduate' | 'postgraduate'
  | 'certification' | 'other'

export type TrackStatus = 'in_progress' | 'paused' | 'completed' | 'abandoned'
export type ResourceType = 'link' | 'book' | 'video' | 'pdf' | 'note' | 'other'
export type ResourceStatus = 'to_study' | 'studying' | 'completed'

export interface StudyTrackStep {
  id: string
  track_id: string
  title: string
  is_completed: boolean
  completed_at: string | null
  sort_order: number
  notes: string | null
  created_at: string
}

export interface StudyTrack {
  id: string
  user_id: string
  name: string
  category: TrackCategory
  status: TrackStatus
  target_date: string | null
  progress: number
  total_hours: number
  cost: number | null
  linked_skill_id: string | null
  notes: string | null
  steps?: StudyTrackStep[]
  created_at: string
  updated_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  track_id: string | null
  duration_minutes: number
  focus_minutes: number
  break_minutes: number
  cycles_completed: number
  session_notes: string | null
  recorded_at: string
  created_at: string
  track?: { name: string } | null
}

export interface StudyResource {
  id: string
  track_id: string
  user_id: string
  title: string
  type: ResourceType
  url: string | null
  personal_notes: string | null
  status: ResourceStatus
  sort_order: number | null
  created_at: string
}

export interface StudyStreak {
  current_streak: number
  longest_streak: number
  last_study_date: string | null
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<TrackCategory, string> = {
  technology: '💻 Tecnologia',
  languages: '🌍 Idiomas',
  management: '📊 Gestão',
  marketing: '📢 Marketing',
  design: '🎨 Design',
  finance: '💰 Finanças',
  health: '❤️ Saúde',
  exam: '📝 Concurso',
  undergraduate: '🎓 Graduação',
  postgraduate: '🏫 Pós-graduação',
  certification: '🏆 Certificação',
  other: '📚 Outro',
}

export const STATUS_LABELS: Record<TrackStatus, string> = {
  in_progress: 'Em andamento',
  paused: 'Pausada',
  completed: 'Concluída',
  abandoned: 'Abandonada',
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  link: 'Link',
  book: 'Livro',
  video: 'Vídeo',
  pdf: 'PDF',
  note: 'Nota',
  other: 'Outro',
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  to_study: 'Para estudar',
  studying: 'Estudando',
  completed: 'Concluído',
}

// ─── Dashboard hook ───────────────────────────────────────────────────────────

export function useMenteDashboard() {
  const [activeTracks, setActiveTracks] = useState<StudyTrack[]>([])
  const [weekHours, setWeekHours] = useState(0)
  const [todaySessions, setTodaySessions] = useState(0)
  const [streak, setStreak] = useState<StudyStreak>({ current_streak: 0, longest_streak: 0, last_study_date: null })
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const sb = supabase as any

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [tracksRes, sessionsRes, streakRes] = await Promise.all([
        sb.from('study_tracks')
          .select('*, steps:study_track_steps(*)')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('updated_at', { ascending: false })
          .limit(6),
        sb.from('focus_sessions_mente')
          .select('*, track:study_tracks(name)')
          .eq('user_id', user.id)
          .gte('recorded_at', weekStart.toISOString())
          .order('recorded_at', { ascending: false }),
        sb.from('study_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single(),
      ]) as [
        { data: StudyTrack[] | null; error: unknown },
        { data: FocusSession[] | null; error: unknown },
        { data: StudyStreak | null; error: unknown },
      ]

      const sessions = sessionsRes.data ?? []
      setActiveTracks(tracksRes.data ?? [])
      setRecentSessions(sessions.slice(0, 5))

      const totalMins = sessions.reduce((acc, s) => acc + s.focus_minutes, 0)
      setWeekHours(parseFloat((totalMins / 60).toFixed(1)))

      const todayStr = todayStart.toISOString()
      setTodaySessions(sessions.filter(s => s.recorded_at >= todayStr).length)

      if (streakRes.data) setStreak(streakRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { activeTracks, weekHours, todaySessions, streak, recentSessions, loading, error, reload: load }
}

// ─── Tracks list hook ─────────────────────────────────────────────────────────

export function useStudyTracks() {
  const [tracks, setTracks] = useState<StudyTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error } = await sb.from('study_tracks')
        .select('*, steps:study_track_steps(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      setTracks(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar trilhas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { tracks, loading, error, reload: load }
}

// ─── Sessions hook ────────────────────────────────────────────────────────────

export function useStudySessions(limit = 50) {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data } = await sb.from('focus_sessions_mente')
        .select('*, track:study_tracks(name)')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(limit)
      setSessions(data ?? [])
    } catch {
      setError('Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { load() }, [load])
  return { sessions, loading, error, reload: load }
}

// ─── Resources hook ───────────────────────────────────────────────────────────

export function useStudyResources(trackId: string | null) {
  const [resources, setResources] = useState<StudyResource[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    if (!trackId) { setResources([]); return }
    setLoading(true)
    try {
      const { data } = await sb.from('study_resources')
        .select('*')
        .eq('track_id', trackId)
        .order('sort_order', { ascending: true })
      setResources(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [trackId])

  useEffect(() => { load() }, [load])
  return { resources, loading, reload: load }
}

// ─── Create Track mutation ────────────────────────────────────────────────────

export interface CreateTrackData {
  name: string
  category: TrackCategory
  target_date?: string | null
  cost?: number | null
  notes?: string | null
  steps: { title: string; sort_order: number }[]
  linked_skill_id?: string | null
}

export function useCreateTrack() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: CreateTrackData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: track, error } = await sb.from('study_tracks').insert({
      user_id: user.id,
      name: data.name,
      category: data.category,
      status: 'in_progress',
      target_date: data.target_date ?? null,
      cost: data.cost ?? null,
      notes: data.notes ?? null,
      linked_skill_id: data.linked_skill_id ?? null,
      progress: 0,
      total_hours: 0,
    }).select().single()
    if (error) throw error

    if (data.steps.length > 0) {
      const { error: stepsErr } = await sb.from('study_track_steps').insert(
        data.steps.map(s => ({
          track_id: track.id,
          title: s.title,
          sort_order: s.sort_order,
          is_completed: false,
        }))
      )
      if (stepsErr) throw stepsErr
    }
    return track
  }, [])
}

// ─── Update Track mutation ────────────────────────────────────────────────────

export function useUpdateTrack() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string, updates: Partial<Pick<StudyTrack, 'name' | 'status' | 'target_date' | 'notes' | 'cost' | 'category'>>) => {
    const { error } = await sb.from('study_tracks').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Delete Track mutation ────────────────────────────────────────────────────

export function useDeleteTrack() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('study_tracks').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Toggle Step mutation ─────────────────────────────────────────────────────

export function useToggleStep() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (stepId: string, trackId: string, isCompleted: boolean) => {
    const { error: stepErr } = await sb.from('study_track_steps').update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }).eq('id', stepId)
    if (stepErr) throw stepErr

    const { data: allSteps } = await sb.from('study_track_steps')
      .select('is_completed')
      .eq('track_id', trackId)

    if (allSteps && allSteps.length > 0) {
      const completedCount = allSteps.filter((s: { is_completed: boolean }) => s.is_completed).length
      const progress = (completedCount / allSteps.length) * 100
      const updates: Record<string, unknown> = { progress, updated_at: new Date().toISOString() }
      if (progress >= 100) updates.status = 'completed'
      await sb.from('study_tracks').update(updates).eq('id', trackId)
    }
  }, [])
}

// ─── Save Session mutation ────────────────────────────────────────────────────

export interface SaveSessionData {
  track_id?: string | null
  duration_minutes: number
  focus_minutes: number
  break_minutes: number
  cycles_completed: number
  session_notes?: string
}

export function useSaveSession() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveSessionData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error } = await sb.from('focus_sessions_mente').insert({
      user_id: user.id,
      track_id: data.track_id ?? null,
      duration_minutes: data.duration_minutes,
      focus_minutes: data.focus_minutes,
      break_minutes: data.break_minutes,
      cycles_completed: data.cycles_completed,
      session_notes: data.session_notes ?? null,
      recorded_at: new Date().toISOString(),
    })
    if (error) throw error

    // Update track total_hours
    if (data.track_id) {
      const { data: track } = await sb.from('study_tracks')
        .select('total_hours')
        .eq('id', data.track_id)
        .single()
      if (track) {
        const newHours = (track.total_hours || 0) + data.focus_minutes / 60
        await sb.from('study_tracks').update({
          total_hours: newHours,
          updated_at: new Date().toISOString(),
        }).eq('id', data.track_id)
      }
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: existingStreak } = await sb.from('study_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingStreak) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      let newStreak = existingStreak.current_streak
      if (existingStreak.last_study_date !== today) {
        newStreak = existingStreak.last_study_date === yesterdayStr
          ? existingStreak.current_streak + 1
          : 1
      }

      await sb.from('study_streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existingStreak.longest_streak),
        last_study_date: today,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id)
    } else {
      await sb.from('study_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_study_date: today,
      })
    }
  }, [])
}

// ─── Resources mutations ──────────────────────────────────────────────────────

export interface AddResourceData {
  title: string
  type: ResourceType
  url?: string | null
  personal_notes?: string | null
  status: ResourceStatus
}

export function useAddResource() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (trackId: string, data: AddResourceData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('study_resources').insert({
      track_id: trackId,
      user_id: user.id,
      title: data.title,
      type: data.type,
      url: data.url ?? null,
      personal_notes: data.personal_notes ?? null,
      status: data.status,
    })
    if (error) throw error
  }, [])
}

export function useDeleteResource() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('study_resources').delete().eq('id', id)
    if (error) throw error
  }, [])
}

export function useUpdateResourceStatus() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string, status: ResourceStatus) => {
    const { error } = await sb.from('study_resources').update({ status }).eq('id', id)
    if (error) throw error
  }, [])
}
