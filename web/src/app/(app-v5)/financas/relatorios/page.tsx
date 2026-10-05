import type { Metadata } from 'next'
import { RelatoriosV5 } from '@/components/app-v5/financas/RelatoriosV5'

export const metadata: Metadata = { title: 'SyncLife · Relatórios' }

// Fase 2 · /financas/relatorios em v5 (T1 reduzido: só evidência). Server fino: a auth e o
// onboarding já são garantidos pelo (app-v5)/layout.tsx; os dados vêm do hook no componente client.
export default function RelatoriosPage() {
  return <RelatoriosV5 />
}
