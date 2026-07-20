import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { CrossBand } from './CrossBand'

describe('CrossBand', () => {
  it('renderiza os segmentos e a ação', () => {
    const html = renderToString(
      <CrossBand segments={[{ moduleId: 'financas', text: 'Seus gastos caíram 12%' }, { moduleId: 'futuro', text: 'e sua reserva chegou a 67%', bold: true }]}
        action={{ label: 'Ver em Futuro', targetModule: 'futuro', href: '/futuro' }} />,
    )
    expect(html).toContain('reserva chegou a 67%')
    expect(html).toContain('Ver em Futuro')
  })
})
