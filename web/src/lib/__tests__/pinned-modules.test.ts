import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock user-preferences to avoid supabase import
vi.mock('@/lib/user-preferences', () => ({
  saveUserPreferences: vi.fn(() => Promise.resolve()),
}))

import {
  PINNED_STORAGE_KEY,
  DEFAULT_PINNED,
  setPinnedModules,
} from '../pinned-modules'

describe('Pinned Modules', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  describe('constants', () => {
    it('PINNED_STORAGE_KEY is correct', () => {
      expect(PINNED_STORAGE_KEY).toBe('sl_pinned_modules')
    })

    it('DEFAULT_PINNED contains financas and tempo', () => {
      expect(DEFAULT_PINNED).toEqual(['financas', 'tempo'])
    })
  })

  describe('setPinnedModules', () => {
    it('saves modules to localStorage', () => {
      const modules = ['financas', 'corpo']
      setPinnedModules(modules)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        PINNED_STORAGE_KEY,
        JSON.stringify(modules),
      )
    })

    it('limits to MAX_PINNED (3) modules', () => {
      const modules = ['financas', 'corpo', 'mente', 'tempo']
      const result = setPinnedModules(modules)
      expect(result).toHaveLength(3)
      expect(result).toEqual(['financas', 'corpo', 'mente'])
    })

    it('returns the truncated array', () => {
      const result = setPinnedModules(['a', 'b'])
      expect(result).toEqual(['a', 'b'])
    })

    it('returns empty array for empty input', () => {
      const result = setPinnedModules([])
      expect(result).toEqual([])
    })
  })
})
