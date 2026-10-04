import type { Metadata } from 'next'
import { SuaSemanaV5 } from '@/components/app-v5/SuaSemanaV5'

export const metadata: Metadata = { title: 'SyncLife · Sua semana' }

// Fase 1 · Task 14: /dashboard/review vira Sua semana (T3). Server fino: o guard
// de auth e onboarding é do (app-v5)/layout.tsx; os dados e o fechamento
// (weekly_reviews + streak + XP) ficam no client, via useSuaSemana.
export default function ReviewPage() {
  return <SuaSemanaV5 />
}
