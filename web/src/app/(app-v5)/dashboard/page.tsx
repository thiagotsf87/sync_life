import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DiarioV5 } from '@/components/app-v5/DiarioV5'

export const metadata: Metadata = { title: 'SyncLife · Diário' }

// Onda 2 · /dashboard vira o Diário v5. Server fino: resolve UMA vez o nome
// (profiles.preferred_name ?? full_name → primeiro nome; fallback: parte local
// do e-mail) e a data de criação da conta (nº da edição), e delega o resto pro
// componente client (dados via hooks).
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // preferred_name não está no Database manual (schema drift): mesmo contorno
  // tipado do (app-v5)/layout.tsx.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }
  let nome = ''
  try {
    const { data }: { data: { preferred_name: string | null; full_name: string | null } | null } =
      await sb
        .from('profiles')
        .select('preferred_name, full_name')
        .eq('id', user.id)
        .maybeSingle()
    nome = (data?.preferred_name || data?.full_name || '').trim()
  } catch {
    nome = ''
  }

  const userName = nome ? nome.split(/\s+/)[0] : (user.email?.split('@')[0] ?? 'você')

  return <DiarioV5 userName={userName} accountCreatedAt={user.created_at} />
}
