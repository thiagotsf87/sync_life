import type { Metadata } from 'next'
import { EsqueceuSenhaV5 } from '@/components/auth-v5/EsqueceuSenhaV5'

export const metadata: Metadata = { title: 'SyncLife · Recuperar acesso' }

export default function EsqueceuSenhaPage() {
  return <EsqueceuSenhaV5 />
}
