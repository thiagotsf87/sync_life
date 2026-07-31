import type { Metadata } from 'next'
import { CadastroV5 } from '@/components/auth-v5/CadastroV5'

export const metadata: Metadata = { title: 'SyncLife · Criar conta' }

export default function CadastroPage() {
  return <CadastroV5 />
}
