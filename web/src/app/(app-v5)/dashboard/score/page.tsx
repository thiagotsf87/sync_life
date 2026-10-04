import type { Metadata } from 'next'
import { LifeScoreV5 } from '@/components/app-v5/LifeScoreV5'

export const metadata: Metadata = { title: 'SyncLife · Life Sync Score' }

// Fase 1 · Task 13: /dashboard/score vira o Life Score v2 (T3). Server fino: o
// guard de auth e onboarding é do (app-v5)/layout.tsx; os dados vêm do motor
// oficial no client (useScoreEngine + life_sync_scores).
export default function ScorePage() {
  return <LifeScoreV5 />
}
