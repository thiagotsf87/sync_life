import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Donut } from './Donut'

describe('Donut', () => {
  it('renders center value, slices and shares in sl-num', () => {
    const html = renderToString(
      <Donut
        title="Gastos por categoria"
        center="R$ 3.160"
        centerSub="maio"
        slices={[
          { label: 'Moradia', share: 42, color: 'var(--sl-mod-fin)' },
          { label: 'Lazer', share: 18, color: 'var(--sl-mod-exp)' },
          { label: 'Transporte', share: 40, color: 'var(--sl-mod-tmp)' },
        ]}
      />,
    )
    // React SSR insere separadores <!-- --> entre nós de texto adjacentes:
    // {s.share}% renderiza como "42<!-- -->%". Normalizamos antes de checar o percentual.
    const clean = html.replace(/<!-- -->/g, '')
    expect(clean).toContain('Gastos por categoria')
    expect(clean).toContain('R$ 3.160')
    expect(clean).toContain('Moradia')
    expect(clean).toContain('42%')
    expect(clean).toContain('conic-gradient')
    expect(clean).toContain('sl-num')
  })
})
