import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ProgressList } from './ProgressList'

describe('ProgressList', () => {
  it('renders title, rows and current/target labels in sl-num', () => {
    const html = renderToString(
      <ProgressList
        title="Metas ativas"
        rows={[
          { label: 'Reserva', current: 12, target: 18, color: 'var(--sl-mod-fut)', currentLabel: 'R$ 12k', targetLabel: 'R$ 18k' },
          { label: 'Sono', current: 6, target: 8, color: 'var(--sl-mod-crp)', unit: 'h', invert: false, check: true },
        ]}
      />,
    )
    expect(html).toContain('Metas ativas')
    expect(html).toContain('Reserva')
    expect(html).toContain('R$ 12k')
    expect(html).toContain('sl-num')
  })
})
