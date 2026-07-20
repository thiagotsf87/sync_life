import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachWhisper } from './CoachWhisper'

describe('CoachWhisper', () => {
  it('renders the bold lead, the text and an optional action', () => {
    const html = renderToString(
      <CoachWhisper bold="Você gastou 18% acima" text="em Lazer este mês." action="Ver categoria" variant="solid" />,
    )
    expect(html).toContain('Você gastou 18% acima')
    expect(html).toContain('em Lazer este mês.')
    expect(html).toContain('Ver categoria')
  })

  it('hides the action button when no action is given', () => {
    const html = renderToString(<CoachWhisper bold="Tudo certo" text="nenhuma ação necessária." />)
    expect(html).not.toContain('<button')
  })
})
