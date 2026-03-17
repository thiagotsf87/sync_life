import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret || !refreshToken) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null
  return res.json()
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = supabase as any

  // Get integration
  const { data: integration } = await sb
    .from('user_integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google_calendar')
    .single()

  if (!integration) {
    return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 404 })
  }

  let accessToken = integration.access_token

  // Refresh token if expired
  if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
    if (!integration.refresh_token) {
      return NextResponse.json({ error: 'Token expired, please reconnect' }, { status: 401 })
    }
    const refreshed = await refreshAccessToken(integration.refresh_token)
    if (!refreshed) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
    }
    accessToken = refreshed.access_token
    await sb.from('user_integrations').update({
      access_token: refreshed.access_token,
      token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('provider', 'google_calendar')
  }

  try {
    // Fetch events from Google Calendar (next 30 days)
    const now = new Date()
    const timeMin = now.toISOString()
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    if (!calRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch Google Calendar' }, { status: 502 })
    }

    const calData = await calRes.json()
    const events = calData.items ?? []
    let synced = 0

    for (const event of events) {
      if (!event.start?.dateTime && !event.start?.date) continue

      const startDate = event.start.dateTime
        ? event.start.dateTime.split('T')[0]
        : event.start.date
      const startTime = event.start.dateTime
        ? event.start.dateTime.split('T')[1]?.slice(0, 5)
        : undefined
      const endTime = event.end?.dateTime
        ? event.end.dateTime.split('T')[1]?.slice(0, 5)
        : undefined

      // Upsert into agenda_events
      const { error } = await sb.from('agenda_events').upsert({
        user_id: user.id,
        title: event.summary ?? 'Sem titulo',
        description: event.description ?? null,
        date: startDate,
        start_time: startTime ?? null,
        end_time: endTime ?? null,
        type: 'event',
        source: 'google_calendar',
        external_id: event.id,
      }, { onConflict: 'user_id,external_id' })

      if (!error) synced++
    }

    return NextResponse.json({ synced, total: events.length })
  } catch {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
