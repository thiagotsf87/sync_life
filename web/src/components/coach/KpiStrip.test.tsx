import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { KpiStrip } from './KpiStrip'

describe('KpiStrip', () => {
  it('renders labels, values, the up-delta and uses sl-num-strong', () => {
    const html = renderToString(
      <KpiStrip
        items={[
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', up: true },
          { label: 'Receitas', value: 'R$ 5.000' },
        ]}
      />,
    )
    expect(html).toContain('Saldo')
    expect(html).toContain('R$ 1.840')
    expect(html).toContain('+12%')
    expect(html).toContain('sl-num-strong')
  })
})
