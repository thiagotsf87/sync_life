import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient, STRIPE_PRICES } from '@/lib/stripe'

const CheckoutSchema = z.object({
  interval: z.enum(['monthly', 'yearly']),
})

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient()
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'interval deve ser monthly ou yearly' }, { status: 400 })
    }

    const { interval } = parsed.data

    // Check current plan
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('plan_type, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.plan_type === 'pro') {
      return NextResponse.json({ error: 'Você já é PRO' }, { status: 400 })
    }

    // Lazy create Stripe customer
    let customerId = profile?.stripe_customer_id as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await (supabase as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const priceId = interval === 'yearly'
      ? STRIPE_PRICES.pro_yearly
      : STRIPE_PRICES.pro_monthly

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID não configurado' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
      success_url: `${appUrl}/configuracoes/plano?success=true`,
      cancel_url: `${appUrl}/configuracoes/plano?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/checkout]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
