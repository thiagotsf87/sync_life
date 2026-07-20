import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {} }),
  usePathname: () => '/dashboard',
}))

// shell-store → pinned-modules → user-preferences importa @/lib/supabase/client,
// cujo config.ts avalia getSupabaseConfig() no load e lança sem env de Supabase.
// Mock mínimo p/ o smoke render em ambiente node (sem env vars).
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

import { CoachOSOverlays } from './CoachOSOverlays'

describe('CoachOSOverlays', () => {
  it('renderiza sem lançar (overlays fechados por padrão)', () => {
    const html = renderToString(<CoachOSOverlays />)
    expect(typeof html).toBe('string')
  })
})
