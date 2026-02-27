'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProfessionalField =
  | 'technology' | 'finance' | 'health' | 'education' | 'law'
  | 'engineering' | 'marketing' | 'sales' | 'hr' | 'design' | 'management' | 'other'

export type CareerLevel =
  | 'intern' | 'junior' | 'mid' | 'senior' | 'specialist'
  | 'coordinator' | 'manager' | 'director' | 'c_level' | 'freelancer' | 'entrepreneur'

export type SkillCategory = 'hard_skill' | 'soft_skill' | 'language' | 'certification'

export type RoadmapStatus = 'active' | 'completed' | 'paused' | 'abandoned'
export type StepStatus = 'pending' | 'in_progress' | 'completed'

export interface ProfessionalProfile {
  id: string
  user_id: string
  current_title: string | null
  current_company: string | null
  field: ProfessionalField | null
  level: CareerLevel | null
  gross_salary: number | null
  start_date: string | null
  sync_salary_to_finance: boolean
  created_at: string
  updated_at: string
}

export interface CareerHistoryEntry {
  id: string
  user_id: string
  title: string
  company: string | null
  field: string | null
  level: string | null
  salary: number | null
  start_date: string
  end_date: string | null
  change_type: 'initial' | 'promotion' | 'lateral' | 'company_change' | 'salary_change' | 'other'
  notes: string | null
  created_at: string
}

export interface RoadmapStep {
  id: string
  roadmap_id: string
  title: string
  description: string | null
  target_date: string | null
  status: StepStatus
  progress: number
  sort_order: number
  completed_at: string | null
  created_at: string
}

export interface CareerRoadmap {
  id: string
  user_id: string
  name: string
  current_title: string
  target_title: string
  target_salary: number | null
  target_date: string | null
  status: RoadmapStatus
  progress: number
  steps?: RoadmapStep[]
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  user_id: string
  name: string
  category: SkillCategory
  proficiency_level: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const FIELD_LABELS: Record<ProfessionalField, string> = {
  technology: '💻 Tecnologia',
  finance: '💰 Finanças',
  health: '❤️ Saúde',
  education: '🎓 Educação',
  law: '⚖️ Direito',
  engineering: '🔧 Engenharia',
  marketing: '📢 Marketing',
  sales: '🤝 Vendas',
  hr: '👥 RH',
  design: '🎨 Design',
  management: '📊 Gestão',
  other: '📌 Outro',
}

export const LEVEL_LABELS: Record<CareerLevel, string> = {
  intern: 'Estagiário',
  junior: 'Júnior',
  mid: 'Pleno',
  senior: 'Sênior',
  specialist: 'Especialista',
  coordinator: 'Coordenador',
  manager: 'Gerente',
  director: 'Diretor',
  c_level: 'C-Level',
  freelancer: 'Freelancer',
  entrepreneur: 'Empreendedor',
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  hard_skill: 'Hard Skill',
  soft_skill: 'Soft Skill',
  language: 'Idioma',
  certification: 'Certificação',
}

export const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'Iniciante',
  2: 'Básico',
  3: 'Intermediário',
  4: 'Avançado',
  5: 'Expert',
}

// ─── Profile hook ─────────────────────────────────────────────────────────────

export function useProfessionalProfile() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
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
      const { data } = await sb.from('professional_profiles')
        .select('*').eq('user_id', user.id).single()
      setProfile(data ?? null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (!msg.includes('PGRST116')) setError(msg) // PGRST116 = no rows found (ok)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { profile, loading, error, reload: load }
}

// ─── Career History hook ──────────────────────────────────────────────────────

export function useCareerHistory() {
  const [history, setHistory] = useState<CareerHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await sb.from('career_history')
        .select('*').eq('user_id', user.id)
        .order('start_date', { ascending: false })
      setHistory(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { history, loading, reload: load }
}

// ─── Roadmaps hook ────────────────────────────────────────────────────────────

export function useCareerRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([])
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
      const { data, error } = await sb.from('career_roadmaps')
        .select('*, steps:roadmap_steps(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      // Sort steps by sort_order
      const processed = (data ?? []).map((r: CareerRoadmap) => ({
        ...r,
        steps: (r.steps ?? []).sort((a: RoadmapStep, b: RoadmapStep) => a.sort_order - b.sort_order),
      }))
      setRoadmaps(processed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar roadmaps')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { roadmaps, loading, error, reload: load }
}

// ─── Skills hook ──────────────────────────────────────────────────────────────

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
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
      const { data, error } = await sb.from('skills')
        .select('*').eq('user_id', user.id)
        .order('category', { ascending: true })
      if (error) throw error
      setSkills(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar habilidades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { skills, loading, error, reload: load }
}

// ─── Dashboard hook ───────────────────────────────────────────────────────────

export function useCarreiraDashboard() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
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

      const [profileRes, roadmapRes, skillsRes] = await Promise.all([
        sb.from('professional_profiles').select('*').eq('user_id', user.id).single(),
        sb.from('career_roadmaps')
          .select('*, steps:roadmap_steps(*)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1),
        sb.from('skills').select('*').eq('user_id', user.id),
      ]) as [
        { data: ProfessionalProfile | null; error: unknown },
        { data: CareerRoadmap[] | null; error: unknown },
        { data: Skill[] | null; error: unknown },
      ]

      setProfile(profileRes.data ?? null)
      const roadmaps = roadmapRes.data ?? []
      setActiveRoadmap(roadmaps.length > 0 ? {
        ...roadmaps[0],
        steps: (roadmaps[0].steps ?? []).sort((a: RoadmapStep, b: RoadmapStep) => a.sort_order - b.sort_order),
      } : null)
      setSkills(skillsRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { profile, activeRoadmap, skills, loading, error, reload: load }
}

// ─── Save Profile mutation ────────────────────────────────────────────────────

export type SaveProfileData = Partial<Omit<ProfessionalProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export function useSaveProfile() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveProfileData, existingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    if (existingId) {
      const { error } = await sb.from('professional_profiles').update({
        ...data,
        updated_at: new Date().toISOString(),
      }).eq('id', existingId)
      if (error) throw error
    } else {
      const { error } = await sb.from('professional_profiles').insert({
        user_id: user.id,
        ...data,
      })
      if (error) throw error
    }
  }, [])
}

// ─── Add History mutation ─────────────────────────────────────────────────────

export type AddHistoryData = Omit<CareerHistoryEntry, 'id' | 'user_id' | 'created_at'>

export function useAddHistoryEntry() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: AddHistoryData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('career_history').insert({ user_id: user.id, ...data })
    if (error) throw error
  }, [])
}

// ─── Create Roadmap mutation ──────────────────────────────────────────────────

export interface CreateRoadmapData {
  name: string
  current_title: string
  target_title: string
  target_salary?: number | null
  target_date?: string | null
  steps: { title: string; description?: string; sort_order: number; target_date?: string | null }[]
}

export function useCreateRoadmap() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: CreateRoadmapData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: roadmap, error } = await sb.from('career_roadmaps').insert({
      user_id: user.id,
      name: data.name,
      current_title: data.current_title,
      target_title: data.target_title,
      target_salary: data.target_salary ?? null,
      target_date: data.target_date ?? null,
      status: 'active',
      progress: 0,
    }).select().single()
    if (error) throw error

    if (data.steps.length > 0) {
      const { error: stepsErr } = await sb.from('roadmap_steps').insert(
        data.steps.map(s => ({
          roadmap_id: roadmap.id,
          title: s.title,
          description: s.description ?? null,
          sort_order: s.sort_order,
          target_date: s.target_date ?? null,
          status: 'pending',
          progress: 0,
        }))
      )
      if (stepsErr) throw stepsErr
    }
    return roadmap
  }, [])
}

// ─── Update Roadmap Step mutation ─────────────────────────────────────────────

export function useUpdateRoadmapStep() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (stepId: string, roadmapId: string, status: StepStatus) => {
    const { error: stepErr } = await sb.from('roadmap_steps').update({
      status,
      progress: status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    }).eq('id', stepId)
    if (stepErr) throw stepErr

    // Recalculate roadmap progress
    const { data: allSteps } = await sb.from('roadmap_steps')
      .select('status').eq('roadmap_id', roadmapId)
    if (allSteps && allSteps.length > 0) {
      const completed = allSteps.filter((s: { status: StepStatus }) => s.status === 'completed').length
      const progress = (completed / allSteps.length) * 100
      const updates: Record<string, unknown> = { progress, updated_at: new Date().toISOString() }
      if (progress >= 100) updates.status = 'completed'
      await sb.from('career_roadmaps').update(updates).eq('id', roadmapId)
    }
  }, [])
}

// ─── Delete Roadmap mutation ──────────────────────────────────────────────────

export function useDeleteRoadmap() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('career_roadmaps').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Skills mutations ─────────────────────────────────────────────────────────

export interface SaveSkillData {
  name: string
  category: SkillCategory
  proficiency_level: number
  notes?: string | null
}

export function useSaveSkill() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: SaveSkillData, existingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    if (existingId) {
      const { error } = await sb.from('skills').update({
        ...data,
        updated_at: new Date().toISOString(),
      }).eq('id', existingId)
      if (error) throw error
    } else {
      const { error } = await sb.from('skills').insert({
        user_id: user.id,
        ...data,
      })
      if (error) throw error
    }
  }, [])
}

export function useDeleteSkill() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { error } = await sb.from('skills').delete().eq('id', id)
    if (error) throw error
  }, [])
}
