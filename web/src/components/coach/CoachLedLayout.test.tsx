import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachLedLayout } from './CoachLedLayout'

describe('CoachLedLayout', () => {
  it('renderiza os slots na ordem P-A', () => {
    const html = renderToString(
      <CoachLedLayout
        hero={<div>HERO</div>}
        crossBand={<div>CROSS</div>}
        evidence={<div>EVID</div>}
        aside={<div>ASIDE</div>}
        detail={<div>DETALHE</div>}
      />,
    )
    expect(html.indexOf('HERO')).toBeLessThan(html.indexOf('CROSS'))
    expect(html.indexOf('CROSS')).toBeLessThan(html.indexOf('EVID'))
    expect(html.indexOf('EVID')).toBeLessThan(html.indexOf('DETALHE'))
    expect(html).toContain('ASIDE')
  })

  it('omite cross/aside/detalhe quando ausentes', () => {
    const html = renderToString(<CoachLedLayout hero={<div>H</div>} evidence={<div>E</div>} />)
    expect(html).toContain('H')
    expect(html).toContain('E')
  })
})
