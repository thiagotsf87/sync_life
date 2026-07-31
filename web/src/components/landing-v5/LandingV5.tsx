'use client'

// Landing v5 "Estúdio": renderiza as DUAS árvores dedicadas (desktop r15 + mobile m1)
// e o CSS decide qual aparece (>=1024 desktop). Cada árvore só inicializa seu JS quando
// visível; a outra fica como fallback estático completo (E-02) — mesma relação dos dois
// protótipos aprovados, que são documentos separados.

import { useEffect } from 'react'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/bussola-3d.css'
import './landing-viva-desktop.css'
import './landing-viva-mobile.css'
import { LandingVivaDesktop } from './LandingVivaDesktop'
import { LandingVivaMobile } from './LandingVivaMobile'

export function LandingV5() {
  useEffect(() => {
    document.documentElement.classList.add('v5-scroll')
    return () => { document.documentElement.classList.remove('v5-scroll') }
  }, [])

  return (
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <LandingVivaDesktop />
      <LandingVivaMobile />
    </div>
  )
}
