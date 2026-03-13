import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

  // Zod validation: ticker must be alphanumeric, max 10 chars, max 20 tickers
  const TickerSchema = z.string().regex(/^[A-Za-z0-9]{1,10}$/)
  const TickersSchema = z.string().min(1).transform(s =>
    s.split(',').map(t => t.trim().toUpperCase())
  ).pipe(z.array(TickerSchema).min(1).max(20))

  const parsed = TickersSchema.safeParse(tickers)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetro tickers inválido. Use códigos alfanuméricos separados por vírgula (ex: PETR4,MXRF11).' }, { status: 400 })
  }

  const tickerList = parsed.data

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
