import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Sy40 } from './Sy40'

describe('Sy40', () => {
  it('renderiza no servidor o span .sy40 com um canvas vazio dentro', () => {
    const html = renderToString(<Sy40 />)
    expect(html).toContain('class="sy40"')
    expect(html).toContain('<canvas')
    expect(html).toContain('aria-hidden="true"')
  })

  it('tamanho 34 só troca a classe', () => {
    const html = renderToString(<Sy40 tamanho={34} estado="ouvindo" />)
    expect(html).toContain('class="sy40 s34"')
    expect(html).toContain('<canvas')
  })
})
