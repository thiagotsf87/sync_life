import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachPill } from './CoachPill'

describe('CoachPill', () => {
  it('renderiza rótulo Coach e o atalho', () => {
    const html = renderToString(<CoachPill />)
    expect(html).toContain('Coach')
    expect(html.replace(/<!-- -->/g, '')).toContain('⌘J')
  })
})
