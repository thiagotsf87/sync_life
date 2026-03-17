import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (className utility)', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null)).toBe('base')
  })

  it('handles empty string', () => {
    expect(cn('')).toBe('')
  })

  it('merges Tailwind conflicting classes (twMerge)', () => {
    // twMerge should resolve conflicts: last one wins
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles no arguments', () => {
    expect(cn()).toBe('')
  })
})
