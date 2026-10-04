import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ChromeV5 } from './ChromeV5'

const noop = () => {}

describe('ChromeV5', () => {
  const html = renderToString(<ChromeV5 ativo="meu-dia" onCoachOpen={noop} />).replace(/<!-- -->/g, '')

  it('tem Fale com Sy, Meu dia e a bottom bar', () => {
    expect(html).toContain('Fale com Sy')
    expect(html).toContain('Meu dia')
    expect(html).toContain('class="bbar"')
    expect(html).toContain('id="sheetAreas"')
  })

  it('não tem ticker nem a copy da revista', () => {
    expect(html).not.toContain('ticker')
    expect(html).not.toContain('Pergunte ao coach')
    expect(html).not.toContain('Diário')
    expect(html).not.toContain('Revisão semanal')
  })

  it('marca o ativo no modbar e na bottom bar', () => {
    const fin = renderToString(<ChromeV5 ativo="financas" onCoachOpen={noop} />)
    expect(fin).toMatch(/class="on" aria-current="page" href="\/financas"/)
    expect(html).toMatch(/class="on" aria-current="page" href="\/dashboard"/)
  })

  it('sheet de Áreas fechado fica inert e mostra só os scores recebidos', () => {
    const s = renderToString(<ChromeV5 ativo="meu-dia" onCoachOpen={noop} scores={{ '01': 83 }} />)
    expect(s).toMatch(/id="sheetAreas"[^>]*inert/)
    expect(s).toContain('<span class="sc num">83</span>')
    expect(s).toContain('<span class="sc num"></span>')
  })
})
