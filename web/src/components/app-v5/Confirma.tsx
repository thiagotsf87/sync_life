'use client'

// Fase 2 · licença inline para o irreversível (nunca modal). Foca "Cancelar" ao aparecer
// para que Enter não confirme sem querer; Esc cancela.

import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmaProps {
  /** frase da pergunta, com o objeto em <b> */
  children: ReactNode
  rotuloSim: string
  rotuloNao?: string
  onSim: () => void
  onNao: () => void
}

export function Confirma({ children, rotuloSim, rotuloNao = 'Cancelar', onSim, onNao }: ConfirmaProps) {
  const naoRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { naoRef.current?.focus({ preventScroll: true }) }, [])
  return (
    <div
      className="confirma"
      role="alertdialog"
      aria-live="polite"
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onNao() } }}
    >
      <span>{children}</span>
      <button className="sim" type="button" onClick={onSim}>{rotuloSim}</button>
      <button ref={naoRef} type="button" onClick={onNao}>{rotuloNao}</button>
    </div>
  )
}
