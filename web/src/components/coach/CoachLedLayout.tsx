import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CoachLedLayoutProps {
  /** Coach Hero (conversação). Único hero da tela (G-05). */
  hero: ReactNode
  /** Elo cross-module (P-04). Opcional mas recomendado. */
  crossBand?: ReactNode
  /** Evidência primária: chart/tabela central. */
  evidence: ReactNode
  /** Coluna lateral da evidência (agenda/lista). Some em <lg. */
  aside?: ReactNode
  /** Detalhe full-width opcional (timeline/breakdown denso). */
  detail?: ReactNode
  className?: string
}

/** Scaffold do padrão P-A (Coach-led). Ordem vertical fixa da Anatomia v3.1 §03. */
export function CoachLedLayout({ hero, crossBand, evidence, aside, detail, className }: CoachLedLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {hero}
      {crossBand}
      <div className={cn('grid gap-5', aside ? 'grid-cols-[1fr_320px] max-lg:grid-cols-1' : 'grid-cols-1')}>
        <div className="min-w-0">{evidence}</div>
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
      {detail}
    </div>
  )
}
