import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_MONTHLY ?? '',
  pro_yearly: process.env.STRIPE_PRICE_YEARLY ?? '',
} as const
