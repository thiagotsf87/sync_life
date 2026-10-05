import type { Metadata } from 'next'
import { OrcamentosV5 } from '@/components/app-v5/financas/OrcamentosV5'

export const metadata: Metadata = { title: 'SyncLife · Orçamentos' }

// Fase 2 · /financas/orcamentos em v5 (T2 com barras + laboratório do teto). Server fino: a auth
// e o onboarding já são garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function OrcamentosPage() {
  return <OrcamentosV5 />
}
