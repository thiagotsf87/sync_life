import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'

interface ProfileData {
  full_name: string | null
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'

  return (
    <AppShell userName={userName}>
      {children}
    </AppShell>
  )
}
