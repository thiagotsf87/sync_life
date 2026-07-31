import type { Metadata } from 'next'
import { LoginV5 } from '@/components/auth-v5/LoginV5'

export const metadata: Metadata = { title: 'SyncLife · Entrar' }

export default function LoginPage() {
  return <LoginV5 />
}
