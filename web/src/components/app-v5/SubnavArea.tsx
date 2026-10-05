'use client'

// Fase 2 · faixa de subtelas da área (prototypes/v5/shared/app.css `.subnav`).
// Primeira coisa dentro do .wrap de TODA tela da área, hub incluído. A tela atual leva
// aria-current="page" e fica centralizada no mobile (a faixa rola na horizontal).
// Cada área declara a sua lista; as Fases 3 a 7 repetem o padrão.

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export interface SubnavItem {
  /** chave estável usada em `atual` */
  key: string
  href: string
  rotulo: string
}

export const SUBNAV_FINANCAS: SubnavItem[] = [
  { key: 'visao', href: '/financas', rotulo: 'Visão geral' },
  { key: 'transacoes', href: '/financas/transacoes', rotulo: 'Transações' },
  { key: 'orcamentos', href: '/financas/orcamentos', rotulo: 'Orçamentos' },
  { key: 'recorrentes', href: '/financas/recorrentes', rotulo: 'Recorrentes' },
  { key: 'planejamento', href: '/financas/planejamento', rotulo: 'Planejamento' },
  { key: 'calendario', href: '/financas/calendario', rotulo: 'Calendário' },
  { key: 'relatorios', href: '/financas/relatorios', rotulo: 'Relatórios' },
  { key: 'importar', href: '/financas/importar', rotulo: 'Importar' },
]

interface SubnavAreaProps {
  itens: SubnavItem[]
  atual: string
  rotulo: string
}

export function SubnavArea({ itens, atual, rotulo }: SubnavAreaProps) {
  const ref = useRef<HTMLElement>(null)

  // centraliza a tela atual sem mexer na rolagem da página; refaz quando as fontes chegam
  useEffect(() => {
    const centrar = () => {
      const n = ref.current
      const on = n?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!n || !on) return
      const nb = n.getBoundingClientRect()
      const ob = on.getBoundingClientRect()
      n.scrollLeft = Math.max(0, ob.left - nb.left + n.scrollLeft - (nb.width - ob.width) / 2)
    }
    centrar()
    void document.fonts?.ready.then(centrar)
    window.addEventListener('load', centrar)
    return () => window.removeEventListener('load', centrar)
  }, [atual])

  return (
    <nav className="subnav" aria-label={rotulo} ref={ref}>
      {itens.map((i) => (
        <Link key={i.key} href={i.href} aria-current={i.key === atual ? 'page' : undefined}>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  )
}
