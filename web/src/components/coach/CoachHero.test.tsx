import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachHero } from './CoachHero'

describe('CoachHero', () => {
  it('renderiza eyebrow, headline com emphasis, pilulas de acao e o MicroStatRail', () => {
    const html = renderToString(
      <CoachHero moduleId="financas" period="maio 2026"
        brief={{
          eyebrow: 'Coach · Financas · maio 2026',
          headline: { text: 'Voce fecha maio em 1.840 positivo', emphasis: '1.840' },
          stats: [
            { label: 'Receitas', value: 'R$ 5.000' },
            { label: 'Saldo', value: 'R$ 1.840', big: true },
          ],
          suggestions: [
            { id: 's1', label: 'Cortar R$ 100 de Lazer', prompt: 'Como cortar Lazer?', primary: true },
            { id: 's2', label: 'Ver projecao', prompt: 'Projecao ate dez' },
          ],
        }} />,
    )
    const clean = html.replace(/<!-- -->/g, '')
    expect(html).toContain('Financas')
    expect(clean).toContain('1.840')            // emphasis no headline
    expect(html).toContain('Cortar R$ 100 de Lazer') // pilula primaria
    expect(html).toContain('Ver projecao')      // pilula secundaria
    expect(html).toContain('sl-num-strong')     // MicroStatRail
  })
})
