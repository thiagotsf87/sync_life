import type { Metadata } from 'next'
import { TransacoesV5 } from '@/components/app-v5/financas/TransacoesV5'

export const metadata: Metadata = { title: 'SyncLife · Transações' }

// Fase 2 · /financas/transacoes (T2 r2). Server fino: a auth e o onboarding já são
// garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function TransacoesPage() {
  return <TransacoesV5 />
}
