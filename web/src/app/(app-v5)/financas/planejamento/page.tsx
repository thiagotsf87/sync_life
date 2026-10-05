import type { Metadata } from 'next'
import { PlanejamentoV5 } from '@/components/app-v5/financas/PlanejamentoV5'

export const metadata: Metadata = { title: 'SyncLife · Planejamento' }

// Fase 2 · /financas/planejamento vira a subtela T3 (financas-planejamento). Server fino: a auth e o
// onboarding já são garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function PlanejamentoPage() {
  return <PlanejamentoV5 />
}
