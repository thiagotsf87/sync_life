import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppV5Boot } from '@/components/app-v5/AppV5Boot'

// Onda 2 · route group do app v5: replica o guard do (app)/layout.tsx
// (auth + onboarding) SEM montar o shell v3 (ModuleBar/Sidebar/TopHeader)
// e SEM tema data-theme. O chrome v5 (bar/ticker/modbar) é montado por
// cada tela via <ChromeV5>; o boot da árvore (.v5 + .dk + .anim) é do
// <AppV5Boot>.
export default async function AppV5Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // profiles.onboarding_completed não está no Database manual (schema drift):
  // mesmo contorno tipado usado em api/ai/diario-brief/route.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as { from: (t: string) => any }
  let onboardingCompleted = false
  try {
    const { data }: { data: { onboarding_completed: boolean | null } | null } =
      await sb
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()
    onboardingCompleted = Boolean(data?.onboarding_completed)
  } catch {
    onboardingCompleted = false
  }

  if (!onboardingCompleted) {
    redirect('/onboarding')
  }

  return (
    <QueryProvider>
      <AppV5Boot>{children}</AppV5Boot>
    </QueryProvider>
  )
}
