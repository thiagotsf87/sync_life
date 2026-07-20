import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => children,
  DialogContent: ({ children }: { children: ReactNode }) => children,
  DialogHeader: ({ children }: { children: ReactNode }) => children,
  DialogTitle: ({ children }: { children: ReactNode }) => children,
}))

import { CheatSheet } from './CheatSheet'

describe('CheatSheet', () => {
  it('lista os atalhos quando aberto', () => {
    const html = renderToString(<CheatSheet open onClose={() => {}} />)
    expect(html).toContain('Command palette')
    expect(html.replace(/<!-- -->/g, '')).toContain('⌘K')
  })
})
