import { describe, it, expect, vi } from 'vitest'

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
  }),
}))

describe('lib/integrations/financas', () => {
  it('exports createTransactionFromProvento', async () => {
    const mod = await import('../financas')
    expect(typeof mod.createTransactionFromProvento).toBe('function')
  })

  it('exports createTransactionFromAporte', async () => {
    const mod = await import('../financas')
    expect(typeof mod.createTransactionFromAporte).toBe('function')
  })
})
