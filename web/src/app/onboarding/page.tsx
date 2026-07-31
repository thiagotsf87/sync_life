import type { Metadata } from 'next'
import { OnboardingV5 } from '@/components/auth-v5/OnboardingV5'

export const metadata: Metadata = { title: 'SyncLife · Primeira edição' }

export default function OnboardingPage() {
  return <OnboardingV5 />
}
