import type { Metadata } from 'next'
import { RecorrentesV5 } from '@/components/app-v5/financas/RecorrentesV5'

export const metadata: Metadata = { title: 'SyncLife · Recorrentes' }

// Fase 2 · /financas/recorrentes em v5 (T2). Server fino: a auth e o onboarding já são
// garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function RecorrentesPage() {
  return <RecorrentesV5 />
}
