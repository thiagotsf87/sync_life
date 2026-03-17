import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const customerId = profile?.stripe_customer_id as string | null
    if (!customerId) {
      return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const stripe = getStripeClient()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/configuracoes/plano`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/portal]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
