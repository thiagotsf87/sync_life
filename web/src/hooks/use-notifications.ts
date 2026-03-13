'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getCachedNotifSettings } from '@/lib/user-preferences'
import { queryKeys } from '@/lib/query-keys'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'deadline_risk'
  | 'goal_stale'
  | 'followup_due'
  | 'objective_completed'
  | 'trip_upcoming'
  | 'archive_suggestion'
  | 'weekly_summary'

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

interface NotifSettings {
  goalAtRisk: boolean
  goalComplete: boolean
  weeklyReview: boolean
  inactivity: boolean
}

const DEFAULT_NOTIF_SETTINGS: NotifSettings = {
  goalAtRisk: true,
  goalComplete: true,
  weeklyReview: true,
  inactivity: false,
}

function readNotifSettings(): NotifSettings {
  // 1. Try in-memory cache (populated by AppShell via hydratePreferences)
  const cached = getCachedNotifSettings()
  if (cached) return { ...DEFAULT_NOTIF_SETTINGS, ...cached } as NotifSettings

  // 2. Fallback to localStorage (backwards compat)
  if (typeof window === 'undefined') return DEFAULT_NOTIF_SETTINGS
  try {
    const raw = localStorage.getItem('sl_notif_settings')
    if (!raw) return DEFAULT_NOTIF_SETTINGS
    return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_NOTIF_SETTINGS
  }
}

async function loadUserPlan(sb: any, userId: string): Promise<{ isPro: boolean }> {
  const [{ data: profile }] = await Promise.all([
    sb.from('profiles').select('plan').eq('id', userId).single(),
  ])
  return {
    isPro: profile?.plan === 'pro',
  }
}

// ─── Standalone fetch function ───────────────────────────────────────────────

async function fetchNotificationsList(): Promise<AppNotification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (data as AppNotification[]) ?? []
}

// ─── Generate notifications (mutation) ───────────────────────────────────────

async function generateNotificationsForUser(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const sb = supabase as any
  const settings = readNotifSettings()
  const { isPro } = await loadUserPlan(sb, user.id)

  // ── 1. Objetivos com ritmo insuficiente (RN-FUT-25/52) ─────────────────
  const { data: objectives } = await sb
    .from('objectives')
    .select('id, name, target_date, progress, updated_at, status')
    .eq('user_id', user.id)

  if (objectives) {
    if (settings.goalAtRisk) {
      const activeObjectives = objectives.filter((o: { status: string }) => o.status === 'active')
      for (const obj of activeObjectives) {
        if (!obj.target_date) continue
        const today = new Date()
        const target = new Date(obj.target_date)
        const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000)

        const progressNeeded = 100 - (obj.progress ?? 0)
        const atRisk = daysLeft > 0 && daysLeft < progressNeeded * 1.5

        if (atRisk && daysLeft <= 60) {
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
    if (settings.inactivity) {
      const staleDate = new Date(Date.now() - 14 * 86400000).toISOString()
      const staleObjectives = objectives.filter((o: { status: string; progress: number; updated_at: string }) =>
        o.status === 'active' && (o.progress ?? 0) < 100 && o.updated_at < staleDate
      )

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
  }

  // ── 3. Retorno médico pendente 30+ dias (RN-CRP-05) ─────────────────
  const followupDate = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: pendingFollowups } = await sb
    .from('medical_appointments')
    .select('id, specialty, follow_up_reminder_date, follow_up_status, follow_up_reminder_count')
    .eq('user_id', user.id)
    .eq('follow_up_status', 'pending')
    .lt('follow_up_reminder_date', followupDate)

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
  if (settings.goalComplete) {
    const completedObjectives = objectives?.filter(
      (o: { status: string; updated_at: string | null }) =>
        o.status === 'completed' && o.updated_at && new Date(o.updated_at) >= new Date(recentCompletionDate)
    )

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
  }

  // ── 6. Objetivos inativos 30+ dias → sugerir arquivamento (RN-FUT-57) ─
  const archiveThreshold = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: staleObjectives30 } = await sb
    .from('objectives')
    .select('id, name, progress, updated_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .lt('progress', 50)
    .lt('updated_at', archiveThreshold)

  if (staleObjectives30) {
    for (const obj of staleObjectives30) {
      const { data: existing } = await sb
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'archive_suggestion')
        .eq('action_url', `/futuro/${obj.id}`)
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
        .limit(1)

      if (!existing || existing.length === 0) {
        await sb.from('notifications').insert({
          user_id: user.id,
          type: 'archive_suggestion',
          title: '📦 Pausar objetivo?',
          body: `"${obj.name}" está inativo há mais de 30 dias com ${obj.progress ?? 0}% de progresso. Considere pausar ou arquivar.`,
          module: 'futuro',
          action_url: `/futuro/${obj.id}`,
        })
      }
    }
  }

  // ── 7. Resumo semanal (RN-FUT-53) ────────────────────────────────────
  if (settings.weeklyReview && isPro) {
    const weeklyDate = new Date(Date.now() - 7 * 86400000).toISOString()
    const { data: recentSummary } = await sb
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'weekly_summary')
      .gte('created_at', weeklyDate)
      .limit(1)

    if (!recentSummary || recentSummary.length === 0) {
      const activeCount = objectives?.filter((o: { status: string }) => o.status === 'active').length ?? 0
      const completedThisWeek = objectives?.filter(
        (o: { status: string; updated_at: string | null }) =>
          o.status === 'completed' && o.updated_at && new Date(o.updated_at) >= new Date(weeklyDate)
      ).length ?? 0
      if (activeCount > 0) {
        await sb.from('notifications').insert({
          user_id: user.id,
          type: 'weekly_summary',
          title: '📊 Resumo semanal',
          body: `${activeCount} objetivo${activeCount !== 1 ? 's' : ''} ativo${activeCount !== 1 ? 's' : ''}${completedThisWeek > 0 ? `, ${completedThisWeek} concluído${completedThisWeek !== 1 ? 's' : ''} esta semana` : ''}. Continue firme!`,
          module: 'futuro',
          action_url: '/futuro',
        })
      }
    }
  }

  // ── 8. Retorno médico agendado para hoje (RN-CRP-03) ─────────────────
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayFollowups } = await sb
    .from('medical_appointments')
    .select('id, specialty, follow_up_reminder_date, follow_up_reminder_count')
    .eq('user_id', user.id)
    .eq('follow_up_status', 'pending')
    .eq('follow_up_reminder_date', todayStr)

  if (todayFollowups) {
    for (const appt of todayFollowups) {
      // RN-CRP-03: máximo 3 lembretes por retorno
      if ((appt.follow_up_reminder_count ?? 0) >= 3) continue

      const { data: existing } = await sb
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'followup_due')
        .eq('action_url', `/corpo/saude`)
        .gte('created_at', new Date(Date.now() - 12 * 3600000).toISOString())
        .like('body', `%hoje%`)
        .limit(1)

      if (!existing || existing.length === 0) {
        await sb.from('notifications').insert({
          user_id: user.id,
          type: 'followup_due',
          title: '📅 Retorno médico hoje',
          body: `Você tem um retorno de ${appt.specialty} agendado para hoje!`,
          module: 'corpo',
          action_url: `/corpo/saude`,
        })
        await sb.from('medical_appointments')
          .update({ follow_up_reminder_count: (appt.follow_up_reminder_count ?? 0) + 1 })
          .eq('id', appt.id)
      }
    }
  }
}

// ─── Hook (TanStack Query) ──────────────────────────────────────────────────

export function useNotifications() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch notifications via useQuery (cached, auto-refetch)
  const { data: notifications = [], isLoading: loading, refetch } = useQuery({
    queryKey: queryKeys.notifications.list('current'),
    queryFn: fetchNotificationsList,
  })

  // Generate notifications mutation
  const generateMutation = useMutation({
    mutationFn: generateNotificationsForUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  // Gera notificações na montagem (com delay para não bloquear o render)
  useEffect(() => {
    const timer = setTimeout(() => generateMutation.mutate(), 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Marca uma notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    queryClient.setQueryData<AppNotification[]>(
      queryKeys.notifications.list('current'),
      (prev) => prev?.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n) ?? [],
    )
  }, [supabase, queryClient])

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

    queryClient.setQueryData<AppNotification[]>(
      queryKeys.notifications.list('current'),
      (prev) => prev?.map((n) => ({ ...n, read_at: n.read_at ?? now })) ?? [],
    )
  }, [supabase, queryClient])

  // Remove uma notificação
  const dismiss = useCallback(async (id: string) => {
    await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', id)

    queryClient.setQueryData<AppNotification[]>(
      queryKeys.notifications.list('current'),
      (prev) => prev?.filter((n) => n.id !== id) ?? [],
    )
  }, [supabase, queryClient])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismiss,
    refetch,
  }
}
