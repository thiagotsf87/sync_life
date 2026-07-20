import { describe, it, expect } from 'vitest'
import { COACH_OS_ENABLED } from './flags'

describe('flags', () => {
  it('COACH_OS_ENABLED é boolean e default ligado (não "off")', () => {
    expect(typeof COACH_OS_ENABLED).toBe('boolean')
    expect(COACH_OS_ENABLED).toBe(process.env.NEXT_PUBLIC_COACH_OS !== 'off')
  })
})
