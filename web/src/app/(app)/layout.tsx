import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewAppShell } from '@/components/shell/AppShell'
import type { AppMode, ThemeId } from '@/types/shell'

interface ProfileData {
  full_name: string | null
  mode: 'focus' | 'journey' | 'foco' | 'jornada' | null
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
    .select('full_name, mode, theme, sidebar_state, onboarding_completed')
    .eq('id', user.id)
    .single() as { data: ProfileData | null }

  // Guard: redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuário'

  // Map DB values to app types (supports both old and new values)
  const mapMode = (dbMode: string | null): AppMode | undefined => {
    if (dbMode === 'journey' || dbMode === 'jornada') return 'jornada'
    if (dbMode === 'focus' || dbMode === 'foco') return 'foco'
    return undefined
  }

  const VALID_THEMES = ['navy-dark', 'clean-light', 'mint-garden', 'obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara', 'system']
  const mapTheme = (dbTheme: string | null): ThemeId | undefined => {
    if (!dbTheme) return undefined
    // Migrate old values
    if (dbTheme === 'dark' || dbTheme === 'light') return 'system'
    if (VALID_THEMES.includes(dbTheme)) return dbTheme as ThemeId
    return undefined
  }

  const initialMode = mapMode(profile?.mode ?? null)
  const initialTheme = mapTheme(profile?.theme ?? null)
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
