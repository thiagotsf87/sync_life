import type { Metadata } from 'next'
import { ImportarV5 } from '@/components/app-v5/financas/ImportarV5'

export const metadata: Metadata = { title: 'SyncLife · Importar extrato' }

// Fase 2 · /financas/importar (T4, 3 passos). Server fino: a auth e o onboarding já são
// garantidos pelo (app-v5)/layout.tsx; os dados vêm dos hooks no componente client.
export default function ImportarPage() {
  return <ImportarV5 />
}
