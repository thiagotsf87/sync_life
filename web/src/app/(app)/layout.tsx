import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewAppShell } from '@/components/shell/AppShell'
import type { AppMode, AppTheme } from '@/types/shell'

interface ProfileData {
  full_name: string | null
  mode: 'focus' | 'journey' | null
  theme: 'light' | 'dark' | 'system' | null
  sidebar_state: 'open' | 'collapsed' | null
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

  // Get user profile with preferences
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name, mode, theme, sidebar_state')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'

  // Map DB values to app types
  const initialMode: AppMode | undefined = profile?.mode === 'journey' ? 'jornada' : profile?.mode === 'focus' ? 'foco' : undefined
  const initialTheme: AppTheme | undefined = (profile?.theme === 'light' || profile?.theme === 'dark') ? profile.theme : undefined
  const initialSidebarOpen: boolean | undefined = profile?.sidebar_state === 'open' ? true : profile?.sidebar_state === 'collapsed' ? false : undefined

  return (
    <NewAppShell
      userName={userName}
      initialMode={initialMode}
      initialTheme={initialTheme}
      initialSidebarOpen={initialSidebarOpen}
    >
      {children}
    </NewAppShell>
  )
}
