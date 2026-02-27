'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'deadline_risk'
  | 'goal_stale'
  | 'followup_due'
  | 'objective_completed'
  | 'trip_upcoming'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  module: string | null
  action_url: string | null
  read_at: string | null
  created_at: string
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Busca notificações (últimas 30, mais recentes primeiro)
  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    setNotifications((data as AppNotification[]) ?? [])
    setLoading(false)
  }, [supabase])

  // Gera notificações automaticamente baseado nos dados do usuário
  const generateNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const sb = supabase as any

    // ── 1. Objetivos com ritmo insuficiente (RN-FUT-25/52) ─────────────────
    const { data: objectives } = await sb
      .from('objectives')
      .select('id, name, target_date, progress, updated_at, status')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (objectives) {
      for (const obj of objectives) {
        if (!obj.target_date) continue
        const today = new Date()
        const target = new Date(obj.target_date)
        const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000)

        // Risco de prazo: dias restantes < (progresso necessário restante × 2)
        const progressNeeded = 100 - (obj.progress ?? 0)
        const atRisk = daysLeft > 0 && daysLeft < progressNeeded * 1.5

        if (atRisk && daysLeft <= 60) {
          // Verifica se já existe notificação recente (últimas 72h) do mesmo tipo/objetivo
          const { data: existing } = await sb
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'deadline_risk')
            .eq('action_url', `/futuro/${obj.id}`)
            .gte('created_at', new Date(Date.now() - 72 * 3600000).toISOString())
            .limit(1)

          if (!existing || existing.length === 0) {
            await sb.from('notifications').insert({
              user_id: user.id,
              type: 'deadline_risk',
              title: '⚠️ Objetivo em risco',
              body: `"${obj.name}" está com ritmo insuficiente. Faltam ${daysLeft} dias e apenas ${obj.progress ?? 0}% concluído.`,
              module: 'futuro',
              action_url: `/futuro/${obj.id}`,
            })
          }
        }
      }
    }

    // ── 2. Metas paradas há 14+ dias (RN-FUT-52) ─────────────────────────
    const staleDate = new Date(Date.now() - 14 * 86400000).toISOString()
    const { data: staleObjectives } = await sb
      .from('objectives')
      .select('id, name, updated_at, status, progress')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .lt('progress', 100)
      .lt('updated_at', staleDate)

    if (staleObjectives) {
      for (const obj of staleObjectives) {
        const { data: existing } = await sb
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'goal_stale')
          .eq('action_url', `/futuro/${obj.id}`)
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          await sb.from('notifications').insert({
            user_id: user.id,
            type: 'goal_stale',
            title: '💤 Objetivo parado',
            body: `"${obj.name}" não teve atualizações há mais de 14 dias. Ainda está no plano?`,
            module: 'futuro',
            action_url: `/futuro/${obj.id}`,
          })
        }
      }
    }

    // ── 3. Retorno médico pendente 30+ dias (RN-CRP-05) ─────────────────
    const followupDate = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data: pendingFollowups } = await sb
      .from('medical_appointments')
      .select('id, specialty, return_date, return_status')
      .eq('user_id', user.id)
      .eq('return_status', 'pending')
      .lt('return_date', followupDate)

    if (pendingFollowups) {
      for (const appt of pendingFollowups) {
        const { data: existing } = await sb
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'followup_due')
          .eq('action_url', `/corpo/saude`)
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          await sb.from('notifications').insert({
            user_id: user.id,
            type: 'followup_due',
            title: '🏥 Retorno médico pendente',
            body: `Consulta de ${appt.specialty} tem retorno pendente há mais de 30 dias.`,
            module: 'corpo',
            action_url: `/corpo/saude`,
          })
        }
      }
    }

    // ── 4. Viagem em 7 dias (RN-EXP) ────────────────────────────────────
    const in7days = new Date(Date.now() + 7 * 86400000).toISOString()
    const tomorrow = new Date(Date.now() + 1 * 86400000).toISOString()
    const { data: upcomingTrips } = await sb
      .from('trips')
      .select('id, name, start_date')
      .eq('user_id', user.id)
      .in('status', ['planejando', 'reservado'])
      .gte('start_date', tomorrow)
      .lte('start_date', in7days)

    if (upcomingTrips) {
      for (const trip of upcomingTrips) {
        const { data: existing } = await sb
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'trip_upcoming')
          .eq('action_url', `/experiencias/viagens/${trip.id}`)
          .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          const daysUntil = Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / 86400000)
          await sb.from('notifications').insert({
            user_id: user.id,
            type: 'trip_upcoming',
            title: '✈️ Viagem se aproxima!',
            body: `"${trip.name}" começa em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}. Checklist concluído?`,
            module: 'experiencias',
            action_url: `/experiencias/viagens/${trip.id}`,
          })
        }
      }
    }

    // ── 5. Objetivos concluídos recentemente → celebração (RN-FUT-19) ───────
    const recentCompletionDate = new Date(Date.now() - 24 * 3600000).toISOString()
    const { data: completedObjectives } = await sb
      .from('objectives')
      .select('id, name, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('updated_at', recentCompletionDate)

    if (completedObjectives) {
      for (const obj of completedObjectives) {
        const { data: existing } = await sb
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'objective_completed')
          .eq('action_url', `/futuro/${obj.id}`)
          .limit(1)

        if (!existing || existing.length === 0) {
          await sb.from('notifications').insert({
            user_id: user.id,
            type: 'objective_completed',
            title: '🎉 Objetivo concluído!',
            body: `Você concluiu "${obj.name}"! Hora de celebrar e definir o próximo objetivo.`,
            module: 'futuro',
            action_url: `/futuro/${obj.id}`,
          })
        }
      }
    }

    await fetchNotifications()
  }, [supabase, fetchNotifications])

  // Marca uma notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    )
  }, [supabase])

  // Marca todas como lidas
  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()
    await (supabase as any)
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null)

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? now }))
    )
  }, [supabase])

  // Remove uma notificação
  const dismiss = useCallback(async (id: string) => {
    await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', id)

    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
    // Gera notificações na montagem (com delay para não bloquear o render)
    const timer = setTimeout(generateNotifications, 2000)
    return () => clearTimeout(timer)
  }, [fetchNotifications, generateNotifications])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refetch: fetchNotifications,
  }
}
