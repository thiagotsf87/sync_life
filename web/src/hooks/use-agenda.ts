'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type EventType = 'trabalho' | 'meta' | 'saude' | 'pessoal' | 'financeiro' | 'estudo'
export type EventPriority = 'baixa' | 'normal' | 'alta' | 'urgente'
export type EventStatus = 'pendente' | 'concluido' | 'cancelado'

export const EVENT_TYPES: Record<EventType, { label: string; icon: string; color: string }> = {
  trabalho:   { label: 'Trabalho',   icon: '💼', color: '#8b5cf6' },
  meta:       { label: 'Meta',       icon: '🎯', color: '#0055ff' },
  saude:      { label: 'Saúde',      icon: '💪', color: '#22c55e' },
  pessoal:    { label: 'Pessoal',    icon: '🌟', color: '#f59e0b' },
  financeiro: { label: 'Financeiro', icon: '💰', color: '#10b981' },
  estudo:     { label: 'Estudo',     icon: '📚', color: '#06b6d4' },
}

export const PRIORITY_COLORS: Record<EventPriority, string> = {
  baixa:   '#6e90b8',
  normal:  '#06b6d4',
  alta:    '#f59e0b',
  urgente: '#f43f5e',
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface AgendaEvent {
  id: string
  user_id: string
  title: string
  description?: string
  type: EventType
  date: string        // YYYY-MM-DD
  all_day: boolean
  start_time?: string // HH:MM
  end_time?: string   // HH:MM
  priority: EventPriority
  status: EventStatus
  reminder?: string
  recurrence?: string
  goal_id?: string
  location?: string
  checklist: ChecklistItem[]
  created_at: string
  updated_at: string
}

export interface AgendaEventFormData {
  title: string
  description?: string
  type: EventType
  date: string
  all_day: boolean
  start_time?: string
  end_time?: string
  priority: EventPriority
  reminder?: string
  recurrence?: string
  goal_id?: string
  location?: string
  checklist?: ChecklistItem[]
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Retorna string de data local YYYY-MM-DD sem conversão UTC
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getWeekRange(referenceDate: Date): { weekStart: string; weekEnd: string } {
  const d = new Date(referenceDate)
  const dayOfWeek = d.getDay() // 0=Dom, 1=Seg, ..., 6=Sáb
  // Semana BR: começa na Segunda (1). Se domingo (0), subtrai 6 dias; senão subtrai (dayOfWeek - 1).
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    weekStart: toLocalDateStr(monday),
    weekEnd: toLocalDateStr(sunday),
  }
}

export function getMonthRange(referenceDate: Date): { monthStart: string; monthEnd: string } {
  const y = referenceDate.getFullYear()
  const m = referenceDate.getMonth()
  return {
    monthStart: new Date(y, m, 1).toISOString().split('T')[0],
    monthEnd: new Date(y, m + 1, 0).toISOString().split('T')[0],
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseAgendaOptions {
  mode: 'week' | 'month'
  referenceDate: Date
}

interface UseAgendaReturn {
  events: AgendaEvent[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (data: AgendaEventFormData) => Promise<AgendaEvent>
  update: (id: string, data: Partial<AgendaEventFormData>) => Promise<AgendaEvent>
  remove: (id: string) => Promise<void>
  toggleStatus: (id: string, status: EventStatus) => Promise<void>
}

export function useAgenda({ mode, referenceDate }: UseAgendaOptions): UseAgendaReturn {
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const cancelled = useRef(false)

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (mode === 'week') {
      const { weekStart, weekEnd } = getWeekRange(referenceDate)
      return { rangeStart: weekStart, rangeEnd: weekEnd }
    } else {
      const { monthStart, monthEnd } = getMonthRange(referenceDate)
      return { rangeStart: monthStart, rangeEnd: monthEnd }
    }
  }, [mode, referenceDate])

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

      const { data, error: err } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', rangeStart)
        .lte('date', rangeEnd)
        .order('date')
        .order('start_time', { nullsFirst: true })

      if (cancelled.current) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setEvents((data ?? []) as AgendaEvent[])
      setLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [rangeStart, rangeEnd, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const create = useCallback(async (data: AgendaEventFormData): Promise<AgendaEvent> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: created, error: err } = await supabase
      .from('agenda_events')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        date: data.date,
        all_day: data.all_day,
        start_time: data.all_day ? null : (data.start_time ?? null),
        end_time: data.all_day ? null : (data.end_time ?? null),
        priority: data.priority,
        status: 'pendente',
        reminder: data.reminder ?? null,
        recurrence: data.recurrence ?? 'none',
        goal_id: data.goal_id ?? null,
        location: data.location ?? null,
        checklist: data.checklist ?? [],
      })
      .select('*')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return created as AgendaEvent
  }, [refresh])

  const update = useCallback(async (id: string, data: Partial<AgendaEventFormData>): Promise<AgendaEvent> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload: Record<string, unknown> = {}
    if (data.title !== undefined) payload.title = data.title
    if (data.description !== undefined) payload.description = data.description ?? null
    if (data.type !== undefined) payload.type = data.type
    if (data.date !== undefined) payload.date = data.date
    if (data.all_day !== undefined) {
      payload.all_day = data.all_day
      if (data.all_day) { payload.start_time = null; payload.end_time = null }
    }
    if (data.start_time !== undefined) payload.start_time = data.start_time ?? null
    if (data.end_time !== undefined) payload.end_time = data.end_time ?? null
    if (data.priority !== undefined) payload.priority = data.priority
    if (data.reminder !== undefined) payload.reminder = data.reminder ?? null
    if (data.recurrence !== undefined) payload.recurrence = data.recurrence ?? 'none'
    if (data.goal_id !== undefined) payload.goal_id = data.goal_id ?? null
    if (data.location !== undefined) payload.location = data.location ?? null
    if (data.checklist !== undefined) payload.checklist = data.checklist ?? []

    const { data: updated, error: err } = await supabase
      .from('agenda_events')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return updated as AgendaEvent
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  const toggleStatus = useCallback(async (id: string, status: EventStatus): Promise<void> => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('agenda_events')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  return { events, loading, error, refresh, create, update, remove, toggleStatus }
}
