import { describe, it, expect } from 'vitest'
import { coachCacheKey } from './use-coach'

describe('use-coach', () => {
  it('cacheKey inclui recurso, módulo e período', () => {
    expect(coachCacheKey('brief', 'financas', '2026-05')).toBe('sl_coach_brief_financas_2026-05')
  })
})
