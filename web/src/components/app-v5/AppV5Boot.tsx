'use client'

// Onda 2 · boot da árvore do app v5 (padrão do useAuthBoot de auth-v5/chrome.tsx,
// replicado local: o boot do auth também monta bússolas 3D, reveals e aurora,
// peças que aqui pertencem às telas, não ao chrome). Faz duas coisas:
// 1) classes v5-scroll + v5-dark no <html> (fundo escuro do body via v5.css),
//    removidas no cleanup pra não vazar pro app v3;
// 2) gate de motion .anim no ROOT INTERNO da árvore — convenção da casa: o .dk
//    e o .anim moram num filho do .v5 (os seletores aninham como `.v5 .dk` e
//    `.v5 .anim ...`); sem JS ou com prefers-reduced-motion, tudo fica visível;
// 3) classe .mob no mesmo root interno quando a viewport tem até 1023px (Fase 1:
//    bottom bar, modbar fora, bar só com brand e +). Sem JS: desktop.

import { useEffect, useRef } from 'react'
import { prefersReduce } from '@/lib/v5/viva'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/app-v5.css'

export function AppV5Boot({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('v5-scroll', 'v5-dark')
    const el = root.current
    if (el && !prefersReduce()) el.classList.add('anim')
    const mq = window.matchMedia('(max-width:1023px)')
    const aplicarMob = () => { el?.classList.toggle('mob', mq.matches) }
    aplicarMob()
    mq.addEventListener('change', aplicarMob)
    return () => {
      mq.removeEventListener('change', aplicarMob)
      document.documentElement.classList.remove('v5-scroll', 'v5-dark')
    }
  }, [])

  return (
    <div className="v5">
      <div className="dk" ref={root}>{children}</div>
    </div>
  )
}
