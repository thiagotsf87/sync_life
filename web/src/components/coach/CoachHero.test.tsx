import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachHero } from './CoachHero'

describe('CoachHero', () => {
  it('renderiza eyebrow, headline e KPIs', () => {
    const html = renderToString(
      <CoachHero moduleId="financas" period="maio 2026"
        brief={{ eyebrow: 'Coach · Finanças · maio 2026', headline: { text: 'Você poupou 37% este mês', emphasis: '37%' },
          stats: [{ label: 'Saldo', value: 'R$ 1.840', big: true }, { label: 'Poupança', value: '37%' }],
          suggestions: [{ id: 's1', label: 'Como economizar mais?', prompt: 'Como economizar mais?', primary: true }] }} />,
    )
    expect(html).toContain('Finanças')
    expect(html.replace(/<!-- -->/g, '')).toContain('37%')
    expect(html).toContain('Como economizar mais?')
  })
})
