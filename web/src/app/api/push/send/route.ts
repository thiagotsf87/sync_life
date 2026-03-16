import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import webpush from 'web-push'

const sendSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
})

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey }
}

export async function POST(request: Request) {
  try {
    const vapid = getVapidKeys()
    if (!vapid) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { userId, title, body: notifBody, url } = parsed.data

    // Fetch subscriptions for target user
    const { data: subscriptions } = await (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => Promise<{
            data: Array<{ endpoint: string; p256dh: string; auth: string }> | null
          }>
        }
      }
    }).from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', userId)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 })
    }

    webpush.setVapidDetails(
      'mailto:contato@synclife.app',
      vapid.publicKey,
      vapid.privateKey,
    )

    const payload = JSON.stringify({ title, body: notifBody, url: url ?? '/' })

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        ),
      ),
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ sent, failed })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
