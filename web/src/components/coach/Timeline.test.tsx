import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Timeline } from './Timeline'

describe('Timeline', () => {
  it('renders items and the AGORA tag on the current node', () => {
    const html = renderToString(
      <Timeline
        title="Roadmap Q2"
        items={[
          { when: 'abr', title: 'Projeto Atlas', meta: 'concluído', done: true },
          { when: 'mai', title: 'Curso arquitetura', current: true },
          { when: 'jun', title: 'Certificação', color: 'var(--sl-mod-car)' },
        ]}
      />,
    )
    expect(html).toContain('Roadmap Q2')
    expect(html).toContain('Projeto Atlas')
    expect(html).toContain('AGORA')
    expect(html).toContain('font-ibm-plex-mono')
  })
})
