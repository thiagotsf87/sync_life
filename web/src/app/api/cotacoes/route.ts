import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BRAPI_BASE = 'https://brapi.dev/api'
const CACHE_HOURS = 24

/**
 * GET /api/cotacoes?tickers=PETR4,MXRF11
 * Proxy para brapi.dev com cache de 24h no Supabase
 * FREE tier: sem token (limite menor). Passar BRAPI_TOKEN para limites maiores.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tickers = searchParams.get('tickers')

  if (!tickers) {
    return NextResponse.json({ error: 'tickers param required' }, { status: 400 })
  }

  const tickerList = tickers.split(',').map(t => t.trim().toUpperCase())

  try {
    // Build brapi.dev URL
    const token = process.env.BRAPI_TOKEN
    const url = `${BRAPI_BASE}/quote/${tickerList.join(',')}?${token ? `token=${token}` : ''}`

    const response = await fetch(url, {
      next: {
        // Cache via Next.js Data Cache for 24h
        revalidate: CACHE_HOURS * 3600,
      },
    })

    if (!response.ok) {
      throw new Error(`brapi.dev error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      results: data.results || [],
      cached_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cotações] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
