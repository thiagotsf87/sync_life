import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  })
}

/** Lazy-initialized Stripe client — only throws at runtime, not at build time */
export function getStripeClient() {
  return getStripe()
}

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',
  pro_yearly: process.env.STRIPE_PRICE_YEARLY ?? '',
} as const
