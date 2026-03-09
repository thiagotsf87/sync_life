import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewAppShell } from '@/components/shell/AppShell'
import type { ThemeId } from '@/types/shell'

interface ProfileData {
  full_name: string | null
  theme: string | null
  sidebar_state: 'open' | 'collapsed' | null
  onboarding_completed: boolean | null
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
    .select('full_name, theme, sidebar_state, onboarding_completed')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  // Guard: redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'

  const VALID_THEMES = ['navy-dark', 'clean-light', 'mint-garden', 'obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara', 'carbon', 'blossom', 'serenity', 'system']
  const mapTheme = (dbTheme: string | null): ThemeId | undefined => {
    if (!dbTheme) return undefined
    // Migrate old values
    if (dbTheme === 'dark' || dbTheme === 'light') return 'system'
    if (VALID_THEMES.includes(dbTheme)) return dbTheme as ThemeId
    return undefined
  }

  const initialTheme = mapTheme(profile?.theme ?? null)
  const initialSidebarOpen: boolean | undefined = profile?.sidebar_state === 'open' ? true : profile?.sidebar_state === 'collapsed' ? false : undefined

  return (
    <NewAppShell
      userName={userName}
      initialTheme={initialTheme}
      initialSidebarOpen={initialSidebarOpen}
    >
      {children}
    </NewAppShell>
  )
}
