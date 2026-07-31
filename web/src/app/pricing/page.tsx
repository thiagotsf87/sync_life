import type { Metadata } from 'next'
import { PricingV5 } from '@/components/pricing-v5/PricingV5'

export const metadata: Metadata = {
  title: 'SyncLife · Preços',
  description: 'Comece grátis. Assine o PRO quando o consultor começar a trabalhar por você.',
}

export default function PricingPage() {
  return <PricingV5 />
}
