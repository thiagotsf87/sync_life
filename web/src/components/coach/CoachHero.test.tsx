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
    expect(html).toContain('grid-cols-[1fr_280px]') // layout Variante B
  })

  it('renderiza o texto inteiro plain quando o emphasis nao ocorre no headline', () => {
    const html = renderToString(
      <CoachHero moduleId="financas" period="maio 2026"
        brief={{
          eyebrow: 'Coach · Financas · maio 2026',
          headline: { text: 'Voce fecha maio no azul', emphasis: '9.999' },
          stats: [{ label: 'Saldo', value: 'R$ 1.840' }],
          suggestions: [{ id: 's1', label: 'Ver detalhes', prompt: 'Detalhes', primary: true }],
        }} />,
    )
    const clean = html.replace(/<!-- -->/g, '')
    expect(clean).toContain('Voce fecha maio no azul') // texto integral, sem quebra
    expect(clean).not.toContain('9.999')               // sem span de emphasis pendurado
  })
})
