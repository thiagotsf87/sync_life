'use client'

// Fase 1 · sheet de Áreas (mobile), porte 1:1 de prototypes/v5/app/_intencao.mobile.html:
// a mesma peça .camada.sheet, mais baixa (.areas), com as 8 áreas numeradas + Conquistas
// + Configurações. Fecha por scrim, X e Esc; inert quando fechado; ao abrir o foco vai
// para o X e ao fechar volta para quem abriu. Área sem score fica sem número (nunca 0).

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export type AreaNum = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08'
export type AreaScores = Partial<Record<AreaNum, number>>

interface SheetAreasProps {
  open: boolean
  onClose: () => void
  scores?: AreaScores
}

const AREAS: { n: AreaNum; nome: string; href: string }[] = [
  { n: '01', nome: 'Finanças', href: '/financas' },
  { n: '02', nome: 'Futuro', href: '/futuro' },
  { n: '03', nome: 'Tempo', href: '/tempo' },
  { n: '04', nome: 'Corpo', href: '/corpo' },
  { n: '05', nome: 'Mente', href: '/mente' },
  { n: '06', nome: 'Patrimônio', href: '/patrimonio' },
  { n: '07', nome: 'Carreira', href: '/carreira' },
  { n: '08', nome: 'Experiências', href: '/experiencias' },
]

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function SheetAreas({ open, onClose, scores }: SheetAreasProps) {
  const xRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  // abrir: guarda quem tinha o foco e foca o X; fechar: devolve o foco
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      prevFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      xRef.current?.focus({ preventScroll: true })
    } else if (!open && wasOpenRef.current) {
      prevFocusRef.current?.focus({ preventScroll: true })
      prevFocusRef.current = null
    }
    wasOpenRef.current = open
  }, [open])

  // Esc fecha (só com o sheet aberto)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} aria-hidden="true" />
      <aside
        className={'camada sheet areas' + (open ? ' open' : '')}
        id="sheetAreas"
        role="dialog"
        aria-modal="true"
        aria-label="Áreas"
        inert={!open}
      >
        <div className="handle" />
        <header className="chead">
          <p className="eyebrow">Áreas</p>
          <button ref={xRef} className="x" type="button" aria-label="Fechar" onClick={onClose}>
            <XIcon />
          </button>
        </header>
        <div className="cbody">
          {AREAS.map((a) => {
            const sc = scores?.[a.n]
            return (
              <Link key={a.n} className="arow" href={a.href} onClick={onClose}>
                <span className="n num">{a.n}</span>
                <span>{a.nome}</span>
                <span className="sc num">{typeof sc === 'number' ? Math.round(sc) : ''}</span>
              </Link>
            )
          })}
          <div className="asep" aria-hidden="true" />
          <Link className="arow extra" href="/conquistas" onClick={onClose}>
            <span className="n num" aria-hidden="true" />
            <span>Conquistas</span>
            <span className="sc num" />
          </Link>
          <Link className="arow extra" href="/configuracoes" onClick={onClose}>
            <span className="n num" aria-hidden="true" />
            <span>Configurações</span>
            <span className="sc" />
          </Link>
        </div>
      </aside>
    </>
  )
}
