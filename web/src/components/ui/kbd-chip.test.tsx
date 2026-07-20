import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { KbdChip } from './kbd-chip'

describe('KbdChip', () => {
  it('renders the key inside a <kbd> with mono font', () => {
    const html = renderToString(<KbdChip>⌘K</KbdChip>)
    expect(html).toContain('<kbd')
    expect(html).toContain('⌘K')
    expect(html).toContain('font-ibm-plex-mono')
  })
})
