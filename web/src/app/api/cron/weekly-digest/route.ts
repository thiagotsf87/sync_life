import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Use service role for cron (no user auth)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey }
}

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PushSubscriptionRow {
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

interface TransactionRow {
  amount: number
  type: string
}

interface GoalRow {
  id: string
  status: string
}

interface EventRow {
  id: string
  status: string
}

export async function GET(request: Request) {
  // Protect cron with secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const vapid = getVapidKeys()

  try {
    // Get all users with push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth') as { data: PushSubscriptionRow[] | null }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions', sent: 0 })
    }

    // Group by user
    const userSubs = new Map<string, PushSubscriptionRow[]>()
    for (const sub of subscriptions) {
      if (!userSubs.has(sub.user_id)) userSubs.set(sub.user_id, [])
      userSubs.get(sub.user_id)!.push(sub)
    }

    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const todayStr = now.toISOString().split('T')[0]

    let totalSent = 0

    for (const [userId, subs] of userSubs) {
      // Fetch week summary data
      const [txnRes, goalsRes, eventsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', userId)
          .gte('date', weekStartStr)
          .lte('date', todayStr)
          .eq('is_future', false),
        supabase
          .from('goals')
          .select('id, status')
          .eq('user_id', userId)
          .eq('status', 'active'),
        supabase
          .from('agenda_events')
          .select('id, status')
          .eq('user_id', userId)
          .gte('date', weekStartStr)
          .lte('date', todayStr),
      ]) as [
        { data: TransactionRow[] | null },
        { data: GoalRow[] | null },
        { data: EventRow[] | null },
      ]

      const txns = txnRes.data ?? []
      const income = txns
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)
      const expense = txns
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0)
      const activeGoals = goalsRes.data?.length ?? 0
      const totalEvents = eventsRes.data?.length ?? 0
      const completedEvents =
        eventsRes.data?.filter((e) => e.status === 'completed').length ?? 0

      // Build digest message
      const lines: string[] = []
      if (income > 0 || expense > 0) {
        lines.push(`Saldo semanal: ${fmtCurrency(income - expense)}`)
      }
      if (activeGoals > 0) {
        lines.push(`${activeGoals} metas ativas`)
      }
      if (totalEvents > 0) {
        lines.push(`${completedEvents}/${totalEvents} eventos concluidos`)
      }

      const body =
        lines.length > 0
          ? lines.join(' | ')
          : 'Confira seu progresso semanal no SyncLife!'

      // Create in-app notification (silently ignore if table doesn't exist yet)
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'weekly_summary',
          title: 'Resumo Semanal',
          body,
          module: 'panorama',
          action_url: '/dashboard',
        })
      } catch {
        // ignore
      }

      // Send push notification
      if (vapid) {
        webpush.setVapidDetails(
          'mailto:contato@synclife.app',
          vapid.publicKey,
          vapid.privateKey,
        )
        const payload = JSON.stringify({
          title: 'Resumo Semanal SyncLife',
          body,
          url: '/dashboard',
        })

        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              payload,
            )
            totalSent++
          } catch {
            // Subscription expired -- clean up
            try {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint)
            } catch {
              // ignore cleanup errors
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Digest sent',
      sent: totalSent,
      users: userSubs.size,
    })
  } catch (error) {
    console.error('[Cron] Weekly digest error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
