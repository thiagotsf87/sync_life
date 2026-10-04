import type { Metadata } from 'next'
import { FinancasV5 } from '@/components/app-v5/FinancasV5'

export const metadata: Metadata = { title: 'SyncLife · Finanças' }

// Fase 1 · /financas vira o hub T1 (financas-a). Server fino: a auth e o
// onboarding já são garantidos pelo (app-v5)/layout.tsx; os dados vêm dos
// hooks no componente client. As subtelas /financas/* seguem no (app) v3.
export default function FinancasPage() {
  return <FinancasV5 />
}
