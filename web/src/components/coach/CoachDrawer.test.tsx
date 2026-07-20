import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

// O Sheet (Radix Dialog) renderiza via Portal, que não produz saída em
// renderToString (react-dom/server). Mockamos para que o conteúdo apareça inline.
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { CoachDrawer } from './CoachDrawer'

describe('CoachDrawer', () => {
  it('renderiza título contextual quando aberto', () => {
    const html = renderToString(
      <CoachDrawer open onClose={() => {}} activeModule="financas" pendingPrompt={null} />,
    )
    expect(html).toContain('Coach')
  })
})
