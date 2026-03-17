import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getStripeClient } from '@/lib/stripe'
import type Stripe from 'stripe'

// Service role client — bypasses RLS (no user session)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for webhook')
  }
  return createSupabaseAdmin(url, serviceKey)
}

async function updateProfile(customerId: string, updates: Record<string, unknown>) {
  const admin = getAdminClient()
  const { error } = await admin
    .from('profiles')
    .update(updates)
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[stripe-webhook] Failed to update profile:', error)
  }
}

function getSubscriptionStatus(status: string): 'free' | 'pro' {
  return status === 'active' || status === 'trialing' ? 'pro' : 'free'
}

/** In Stripe API 2026+, current_period_end lives on items, not subscription root */
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const firstItem = subscription.items?.data?.[0]
  if (firstItem?.current_period_end) {
    return new Date(firstItem.current_period_end * 1000).toISOString()
  }
  return null
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripeClient()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    )
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.customer || !session.subscription) break

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id

        // Fetch subscription details for trial/period info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await updateProfile(customerId, {
          plan_type: 'pro',
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: getPeriodEnd(subscription),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        await updateProfile(customerId, {
          plan_type: getSubscriptionStatus(subscription.status),
          subscription_status: subscription.status,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: getPeriodEnd(subscription),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        await updateProfile(customerId, {
          plan_type: 'free',
          stripe_subscription_id: null,
          subscription_status: 'canceled',
          trial_ends_at: null,
          current_period_end: null,
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break

        const customerId = typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer.id

        await updateProfile(customerId, {
          subscription_status: 'past_due',
        })
        break
      }
    }
  } catch (err) {
    // Log but return 200 to avoid retry storm
    console.error('[stripe-webhook] Processing error:', err)
  }

  return NextResponse.json({ received: true })
}
