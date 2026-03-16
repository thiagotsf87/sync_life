import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = subscriptionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const { subscription } = parsed.data

    const { error } = await (supabase as unknown as {
      from: (t: string) => {
        upsert: (r: unknown, opts: unknown) => Promise<{ error: unknown }>
      }
    }).from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: 'user_id,endpoint' },
    )

    if (error) {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const endpoint = z.string().url().safeParse(body?.endpoint)
    if (!endpoint.success) {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    await (supabase as unknown as {
      from: (t: string) => {
        delete: () => { eq: (k: string, v: string) => { eq: (k: string, v: string) => Promise<unknown> } }
      }
    }).from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint.data)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
