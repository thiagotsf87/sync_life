import { describe, it, expect } from 'vitest'
import { resolveShortcut } from './use-global-keys'

describe('resolveShortcut', () => {
  it('meta+k → palette', () => {
    expect(resolveShortcut({ key: 'k', metaKey: true, ctrlKey: false }, false)).toBe('palette')
  })
  it('ctrl+j → coachDrawer', () => {
    expect(resolveShortcut({ key: 'j', metaKey: false, ctrlKey: true }, false)).toBe('coachDrawer')
  })
  it('? sem foco de texto → cheat', () => {
    expect(resolveShortcut({ key: '?', metaKey: false, ctrlKey: false }, false)).toBe('cheat')
  })
  it('? digitando em campo → ignora', () => {
    expect(resolveShortcut({ key: '?', metaKey: false, ctrlKey: false }, true)).toBe(null)
  })
  it('esc sempre → close', () => {
    expect(resolveShortcut({ key: 'Escape', metaKey: false, ctrlKey: false }, true)).toBe('close')
  })
})
