import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { MicroStatRail } from './MicroStatRail'

describe('MicroStatRail', () => {
  it('renderiza labels, valores e destaca o item big em sl-num-strong', () => {
    const html = renderToString(
      <MicroStatRail
        items={[
          { label: 'Receitas', value: 'R$ 5.000', delta: '+8%' },
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', big: true },
        ]}
      />,
    )
    expect(html).toContain('Receitas')
    expect(html).toContain('R$ 1.840')
    expect(html).toContain('sl-num-strong')
    expect(html).toContain('text-[30px]')
    expect(html.replace(/<!-- -->/g, '')).toContain('+12%')
  })
})
