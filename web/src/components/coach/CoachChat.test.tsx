import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachChat } from './CoachChat'

describe('CoachChat', () => {
  it('renderiza estado vazio com prompts sugeridos e placeholder', () => {
    const html = renderToString(
      <CoachChat
        endpoint="/api/ai/coach"
        buildBody={(messages) => ({ messages })}
        suggestedPrompts={['Como melhorar meu score?']}
        accent="var(--sl-em)"
        placeholder="Pergunte ao Coach"
      />,
    )
    expect(html).toContain('Como melhorar meu score?')
    expect(html).toContain('Pergunte ao Coach')
  })
})
