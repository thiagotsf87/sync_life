'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityLevelType = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extreme'
export type WeightGoalType = 'lose' | 'maintain' | 'gain'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'
export type FollowUpStatus = 'pending' | 'scheduled' | 'ignored'
export type BiologicalSex = 'male' | 'female'

export interface HealthProfile {
  id: string
  user_id: string
  height_cm: number | null
  current_weight: number | null
  biological_sex: BiologicalSex | null
  birth_date: string | null
  activity_level: ActivityLevelType | null
  weight_goal_type: WeightGoalType | null
  weight_goal_kg: number | null
  daily_steps_goal: number
  weekly_activity_goal: number
  min_activity_minutes: number
  bmr: number | null
  tdee: number | null
  dietary_restrictions: string[]
  created_at: string
  updated_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  body_fat_pct: number | null
  waist_cm: number | null
  hip_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  chest_cm: number | null
  recorded_at: string
  notes: string | null
  created_at: string
}

export interface MedicalAppointment {
  id: string
  user_id: string
  specialty: string
  doctor_name: string | null
  location: string | null
  appointment_date: string
  cost: number | null
  notes: string | null
  status: AppointmentStatus
  follow_up_months: number | null
  follow_up_status: FollowUpStatus | null
  follow_up_reminder_date: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: string
  duration_minutes: number
  distance_km: number | null
  steps: number | null
  intensity: number
  calories_burned: number | null
  met_value: number | null
  recorded_at: string
  notes: string | null
  created_at: string
}

export interface DailySteps {
  id: string
  user_id: string
  recorded_date: string
  steps: number
  created_at: string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevelType, string> = {
  sedentary: 'Sedentário',
  light: 'Levemente ativo',
  moderate: 'Moderadamente ativo',
  very_active: 'Muito ativo',
  extreme: 'Extremamente ativo',
}

export const ACTIVITY_LEVEL_FACTORS: Record<ActivityLevelType, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extreme: 1.9,
}

export const WEIGHT_GOAL_LABELS: Record<WeightGoalType, string> = {
  lose: 'Perder peso',
  maintain: 'Manter peso',
  gain: 'Ganhar massa',
}

export const SPECIALTIES = [
  'Clínico Geral', 'Cardiologista', 'Dermatologista', 'Endocrinologista',
  'Ginecologista', 'Nutricionista', 'Oftalmologista', 'Ortopedista',
  'Otorrino', 'Psicólogo', 'Psiquiatra', 'Urologista', 'Dentista', 'Outro',
] as const

export const ACTIVITY_TYPES: { type: string; label: string; met: number; icon: string }[] = [
  { type: 'walking', label: 'Caminhada', met: 3.5, icon: '🚶' },
  { type: 'running', label: 'Corrida', met: 8.0, icon: '🏃' },
  { type: 'weightlifting', label: 'Musculação', met: 6.0, icon: '🏋️' },
  { type: 'cycling', label: 'Ciclismo', met: 7.5, icon: '🚴' },
  { type: 'swimming', label: 'Natação', met: 7.0, icon: '🏊' },
  { type: 'yoga', label: 'Yoga', met: 3.0, icon: '🧘' },
  { type: 'soccer', label: 'Futebol', met: 7.0, icon: '⚽' },
  { type: 'basketball', label: 'Basquete', met: 6.5, icon: '🏀' },
  { type: 'dance', label: 'Dança', met: 5.0, icon: '💃' },
  { type: 'other', label: 'Outro', met: 4.0, icon: '🏅' },
]

export const IMC_LABEL = (imc: number): { label: string; color: string } => {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: '#06b6d4' }
  if (imc < 25) return { label: 'Normal', color: '#10b981' }
  if (imc < 30) return { label: 'Sobrepeso', color: '#f59e0b' }
  if (imc < 35) return { label: 'Obesidade I', color: '#f97316' }
  if (imc < 40) return { label: 'Obesidade II', color: '#f43f5e' }
  return { label: 'Obesidade III', color: '#f43f5e' }
}

// ─── Calculations ─────────────────────────────────────────────────────────────

export function calcBMR(
  weight: number, height: number, sex: BiologicalSex, birthDate: string
): number {
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
  if (sex === 'male') return (10 * weight) + (6.25 * height) - (5 * age) + 5
  return (10 * weight) + (6.25 * height) - (5 * age) - 161
}

export function calcTDEE(bmr: number, level: ActivityLevelType): number {
  return bmr * ACTIVITY_LEVEL_FACTORS[level]
}

export function calcCaloriesTarget(tdee: number, goal: WeightGoalType): number {
  if (goal === 'lose') return tdee - 500
  if (goal === 'gain') return tdee + 500
  return tdee
}

export function calcIMC(weight: number, heightCm: number): number {
  const h = heightCm / 100
  return weight / (h * h)
}

export function calcCaloriesBurned(met: number, weightKg: number, durationMin: number): number {
  return met * weightKg * (durationMin / 60)
}

// ─── Health Profile hook ──────────────────────────────────────────────────────

export function useHealthProfile() {
  const [profile, setProfile] = useState<HealthProfile | null>(null)
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
      const { data } = await sb.from('health_profiles')
        .select('*').eq('user_id', user.id).single()
      setProfile(data ?? null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('PGRST116')) setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { profile, loading, error, reload: load }
}

// ─── Weight Entries hook ──────────────────────────────────────────────────────

export function useWeightEntries(limit = 90) {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await sb.from('weight_entries')
        .select('*').eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(limit)
      setEntries(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { load() }, [load])
  return { entries, loading, reload: load }
}

// ─── Appointments hook ────────────────────────────────────────────────────────

export function useAppointments(status?: AppointmentStatus) {
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([])
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
      let query = sb.from('medical_appointments')
        .select('*').eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (error) throw error
      setAppointments(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar consultas')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])
  return { appointments, loading, error, reload: load }
}

// ─── Activities hook ──────────────────────────────────────────────────────────

export function useActivities(limit = 30) {
  const [activities, setActivities] = useState<Activity[]>([])
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
      const { data, error } = await sb.from('activities')
        .select('*').eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      setActivities(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { load() }, [load])
  return { activities, loading, error, reload: load }
}

// ─── Dashboard hook ───────────────────────────────────────────────────────────

export function useCorpoDashboard() {
  const [profile, setProfile] = useState<HealthProfile | null>(null)
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null)
  const [nextAppointment, setNextAppointment] = useState<MedicalAppointment | null>(null)
  const [weekActivities, setWeekActivities] = useState<Activity[]>([])
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

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const [profileRes, weightRes, appointmentRes, activitiesRes] = await Promise.all([
        sb.from('health_profiles').select('*').eq('user_id', user.id).single(),
        sb.from('weight_entries').select('*').eq('user_id', user.id)
          .order('recorded_at', { ascending: false }).limit(1),
        sb.from('medical_appointments').select('*').eq('user_id', user.id)
          .eq('status', 'scheduled').gte('appointment_date', new Date().toISOString())
          .order('appointment_date', { ascending: true }).limit(1),
        sb.from('activities').select('*').eq('user_id', user.id)
          .gte('recorded_at', weekAgo.toISOString())
          .order('recorded_at', { ascending: false }),
      ]) as [
        { data: HealthProfile | null; error: unknown },
        { data: WeightEntry[] | null; error: unknown },
        { data: MedicalAppointment[] | null; error: unknown },
        { data: Activity[] | null; error: unknown },
      ]

      setProfile(profileRes.data ?? null)
      setLatestWeight(weightRes.data?.[0] ?? null)
      setNextAppointment(appointmentRes.data?.[0] ?? null)
      setWeekActivities(activitiesRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { profile, latestWeight, nextAppointment, weekActivities, loading, error, reload: load }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export type SaveHealthProfileData = Partial<Omit<HealthProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export function useSaveHealthProfile() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveHealthProfileData, existingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // Recalculate BMR + TDEE if we have enough data
    const enriched = { ...data } as any
    if (data.current_weight && data.height_cm && data.biological_sex && data.birth_date) {
      const bmr = calcBMR(data.current_weight, data.height_cm, data.biological_sex, data.birth_date)
      enriched.bmr = bmr
      if (data.activity_level) enriched.tdee = calcTDEE(bmr, data.activity_level)
    }

    if (existingId) {
      const { error } = await sb.from('health_profiles').update({
        ...enriched, updated_at: new Date().toISOString(),
      }).eq('id', existingId)
      if (error) throw error
    } else {
      const { error } = await sb.from('health_profiles').insert({ user_id: user.id, ...enriched })
      if (error) throw error
    }
  }, [])
}

export function useAddWeightEntry() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: Omit<WeightEntry, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('weight_entries').insert({ user_id: user.id, ...data })
    if (error) throw error
  }, [])
}

export function useDeleteWeightEntry() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('weight_entries').delete().eq('id', id)
    if (error) throw error
  }, [])
}

export interface SaveAppointmentData {
  specialty: string
  doctor_name?: string | null
  location?: string | null
  appointment_date: string
  cost?: number | null
  notes?: string | null
  status?: AppointmentStatus
  follow_up_months?: number | null
  follow_up_status?: FollowUpStatus | null
  follow_up_reminder_date?: string | null
}

export function useSaveAppointment() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveAppointmentData, existingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    if (existingId) {
      const { error } = await sb.from('medical_appointments').update({
        ...data, updated_at: new Date().toISOString(),
      }).eq('id', existingId)
      if (error) throw error
    } else {
      const { error } = await sb.from('medical_appointments').insert({ user_id: user.id, ...data })
      if (error) throw error
    }
  }, [])
}

export function useDeleteAppointment() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('medical_appointments').delete().eq('id', id)
    if (error) throw error
  }, [])
}

export interface SaveActivityData {
  type: string
  duration_minutes: number
  distance_km?: number | null
  steps?: number | null
  intensity: number
  calories_burned?: number | null
  met_value?: number | null
  recorded_at: string
  notes?: string | null
}

export function useSaveActivity() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveActivityData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('activities').insert({ user_id: user.id, ...data })
    if (error) throw error
  }, [])
}

export function useDeleteActivity() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('activities').delete().eq('id', id)
    if (error) throw error
  }, [])
}
