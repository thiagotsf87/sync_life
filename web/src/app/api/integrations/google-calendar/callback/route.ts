import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // user_id

  if (!code || !state) {
    return NextResponse.redirect(new URL('/configuracoes/integracoes?error=missing_code', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/configuracoes/integracoes?error=not_configured', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/integrations/google-calendar/callback`

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/configuracoes/integracoes?error=token_exchange', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
    }

    const tokens = await tokenRes.json()

    // Save tokens in Supabase
    const supabase = await createClient()

    await (supabase as any).from('user_integrations').upsert({
      user_id: state,
      provider: 'google_calendar',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      metadata: { scope: tokens.scope },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })

    return NextResponse.redirect(new URL('/configuracoes/integracoes?google=connected', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  } catch {
    return NextResponse.redirect(new URL('/configuracoes/integracoes?error=unknown', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  }
}
