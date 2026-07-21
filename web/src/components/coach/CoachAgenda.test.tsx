import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachAgenda } from './CoachAgenda'

describe('CoachAgenda', () => {
  it('renderiza titulo, contagem e itens com dia/valor', () => {
    const html = renderToString(
      <CoachAgenda
        title="Proximos 7 dias"
        items={[
          { id: '1', day: '24', weekday: 'dom', label: 'Aluguel', amount: '- R$ 1.200', moduleColor: 'var(--sl-mod-ptr)' },
          { id: '2', day: '26', weekday: 'ter', label: 'Salario', amount: '+ R$ 2.500', moduleColor: 'var(--sl-em)', positive: true },
        ]}
      />,
    )
    expect(html).toContain('Proximos 7 dias')
    expect(html).toContain('Aluguel')
    expect(html.replace(/<!-- -->/g, '')).toContain('R$ 2.500')
    expect(html).toContain('font-ibm-plex-mono') // weekday em mono (G-02)
  })
})
