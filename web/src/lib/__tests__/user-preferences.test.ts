import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

import {
  getCachedIntegrationSettings,
  getCachedNotifSettings,
  setCachedIntegrationSettings,
  setCachedNotifSettings,
} from '../user-preferences'

describe('User Preferences Cache', () => {
  beforeEach(() => {
    // Reset caches by setting new values
    setCachedIntegrationSettings({} as Record<string, boolean>)
    setCachedNotifSettings({} as Record<string, unknown>)
  })

  describe('integration settings cache', () => {
    it('returns what was set', () => {
      const settings = { corpo_financas: true, corpo_tempo: false }
      setCachedIntegrationSettings(settings)
      expect(getCachedIntegrationSettings()).toEqual(settings)
    })

    it('updates when set multiple times', () => {
      setCachedIntegrationSettings({ a: true })
      setCachedIntegrationSettings({ b: false })
      expect(getCachedIntegrationSettings()).toEqual({ b: false })
    })
  })

  describe('notification settings cache', () => {
    it('returns what was set', () => {
      const settings = { email: true, push: false }
      setCachedNotifSettings(settings)
      expect(getCachedNotifSettings()).toEqual(settings)
    })

    it('updates when set multiple times', () => {
      setCachedNotifSettings({ x: 1 })
      setCachedNotifSettings({ y: 2 })
      expect(getCachedNotifSettings()).toEqual({ y: 2 })
    })
  })
})
