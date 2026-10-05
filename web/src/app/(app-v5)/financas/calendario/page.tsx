import type { Metadata } from 'next'
import { CalendarioV5 } from '@/components/app-v5/financas/CalendarioV5'

export const metadata: Metadata = { title: 'SyncLife · Calendário' }

// Fase 2 · /financas/calendario (T3, grade mensal). Server fino: a auth e o onboarding já são
// garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function CalendarioPage() {
  return <CalendarioV5 />
}
