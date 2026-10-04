import type { Metadata } from 'next'
import { ConversaV5 } from '@/components/app-v5/ConversaV5'

export const metadata: Metadata = { title: 'SyncLife · Conversas' }

// Fase 1 · /coach vira o arquivo da conversa (conversa.html). Server fino: auth
// e onboarding vêm do (app-v5)/layout.tsx; os dados, do useConversa no client.
export default function CoachPage() {
  return <ConversaV5 />
}
