import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

// App Router context não existe no ambiente node do vitest; useRouter() lançaria
// "invariant expected app router to be mounted". Mock mínimo p/ o smoke render.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { CommandPalette } from './CommandPalette'

describe('CommandPalette', () => {
  it('não renderiza conteúdo quando fechado', () => {
    const html = renderToString(<CommandPalette open={false} onClose={() => {}} activeModule="financas" />)
    expect(html).not.toContain('Ir para')
  })
})
