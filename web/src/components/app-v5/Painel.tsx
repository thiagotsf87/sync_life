'use client'

// Fase 2 · painel de edição: lateral no desktop, bottom sheet no mobile (mesma peça, o CSS
// troca o corpo sob `.v5 .mob`). Fecha por X, scrim e Esc; foca o X ao abrir e devolve o foco
// a quem abriu. Passe o corpo em `children` e as ações em `rodape`.

import { useEffect, useRef, type ReactNode } from 'react'

interface PainelProps {
  open: boolean
  onClose: () => void
  /** texto do eyebrow, ex.: "Transação" */
  eyebrow: string
  titulo: string
  children: ReactNode
  rodape?: ReactNode
  /** id do rótulo para aria-labelledby (único por tela) */
  idTitulo?: string
}

export function Painel({ open, onClose, eyebrow, titulo, children, rodape, idTitulo = 'painel-titulo' }: PainelProps) {
  const xRef = useRef<HTMLButtonElement>(null)
  const voltarFoco = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      voltarFoco.current = document.activeElement as HTMLElement | null
      // espera a transição começar: foco em elemento ainda invisível é ignorado
      const t = window.setTimeout(() => xRef.current?.focus({ preventScroll: true }), 60)
      return () => window.clearTimeout(t)
    }
    voltarFoco.current?.focus?.({ preventScroll: true })
    voltarFoco.current = null
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} aria-hidden="true" />
      <aside
        className={'painel' + (open ? ' open' : '')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        inert={!open}
      >
        <div className="handle" />
        <header className="phead">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={idTitulo}>{titulo}</h2>
          </div>
          <button ref={xRef} className="x" type="button" aria-label="Fechar" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div className="pbody">{children}</div>
        {rodape && <footer className="pfoot">{rodape}</footer>}
      </aside>
    </>
  )
}
