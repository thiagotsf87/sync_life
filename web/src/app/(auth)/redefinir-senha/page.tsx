import type { Metadata } from 'next'
import { RedefinirSenhaV5 } from '@/components/auth-v5/RedefinirSenhaV5'

export const metadata: Metadata = { title: 'SyncLife · Nova senha' }

export default function RedefinirSenhaPage() {
  return <RedefinirSenhaV5 />
}
