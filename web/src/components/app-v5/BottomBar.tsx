'use client'

// Fase 1 · bottom bar mobile, porte 1:1 da .bbar de prototypes/v5/app/_intencao.mobile.html:
// 5 itens, sem FAB (Meu dia · 01 Finanças · pílula Fale com Sy · Áreas · Registrar).
// Renderiza sempre; o CSS só mostra sob `.v5 .mob` (app-v5.css).

import Link from 'next/link'
import type { ModuleId } from '@/types/shell'
import { Sy40 } from './Sy40'

interface BottomBarProps {
  ativo: 'meu-dia' | ModuleId
  onCoachOpen: () => void
  onAreasOpen: () => void
  /** estado do sheet de Áreas, para aria-expanded */
  areasOpen?: boolean
}

// áreas que não têm item próprio na barra marcam "Áreas" como lugar atual
const SEM_ITEM_PROPRIO: ReadonlyArray<'meu-dia' | ModuleId> = ['meu-dia', 'financas', 'panorama']

export function BottomBar({ ativo, onCoachOpen, onAreasOpen, areasOpen = false }: BottomBarProps) {
  const meuDia = ativo === 'meu-dia'
  const financas = ativo === 'financas'
  const areas = !SEM_ITEM_PROPRIO.includes(ativo)

  return (
    <nav className="bbar" aria-label="Navegação principal">
      <Link className={meuDia ? 'on' : undefined} href="/dashboard" aria-current={meuDia ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        <span>Meu dia</span>
      </Link>
      <Link className={financas ? 'on' : undefined} href="/financas" aria-current={financas ? 'page' : undefined}>
        <span className="g num">01</span>
        <span>Finanças</span>
      </Link>
      <button className="sypill" type="button" onClick={onCoachOpen}>
        <Sy40 tamanho={34} />
        <span>Fale com Sy</span>
      </button>
      <button
        className={areas ? 'on' : undefined}
        type="button"
        onClick={onAreasOpen}
        aria-haspopup="dialog"
        aria-controls="sheetAreas"
        aria-expanded={areasOpen}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="8" r="2.3" />
          <circle cx="16" cy="8" r="2.3" />
          <circle cx="8" cy="16" r="2.3" />
          <circle cx="16" cy="16" r="2.3" />
        </svg>
        <span>Áreas</span>
      </button>
      <Link href="/financas/transacoes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Registrar</span>
      </Link>
    </nav>
  )
}
