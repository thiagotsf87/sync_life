'use client'

// Fase 2 · moldura comum das subtelas de uma área: grain, chrome, faixa de subtelas, voltar
// (desktop) ou subbar sticky (mobile) e a camada de Sy da área. A tela entrega só o corpo,
// recebendo `abrirCoach(seed)` e `mob`. O .wrap vem daqui; o CSS da tela mora em arquivo próprio.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChromeV5, type AtivoV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { SubnavArea, type SubnavItem } from '@/components/app-v5/SubnavArea'
import { useMobV5 } from '@/hooks/use-mob-v5'
import type { ModuleId } from '@/types/shell'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'

export interface SubtelaApi {
  abrirCoach: (seed?: string) => void
  mob: boolean
}

interface SubtelaV5Props {
  /** área do chrome (aba ativa do modbar e da bottom bar) */
  area: AtivoV5
  moduloCoach: ModuleId
  subnav: SubnavItem[]
  subnavRotulo: string
  /** chave da tela atual na faixa */
  atual: string
  voltarHref: string
  /** texto do voltar no desktop, ex.: "Finanças · outubro" */
  voltarRotulo: string
  /** número da área em destaque no voltar do desktop, ex.: "01" */
  voltarNumero?: string
  /** título curto da subbar mobile */
  tituloCurto: string
  /** classe da tela no <main> (escopo do CSS da tela) */
  classe: string
  coach: { leitura: string; saudacao: string; sugestoes: string[] }
  /** Registrar do bar e da bottom bar (padrão: abre a captura de Transações) */
  onRegistrar?: () => void
  /** muda quando os dados chegam; re-observa os reveals */
  chaveReveal?: string | number | boolean
  children: (api: SubtelaApi) => ReactNode
  /** conteúdo depois do .wrap (rodapé), fora da coluna */
  rodape?: ReactNode
  /** irmãos do <main> que precisam do contexto (painéis e sheets da tela) */
  extra?: ReactNode
}

export function SubtelaV5({
  area, moduloCoach, subnav, subnavRotulo, atual, voltarHref, voltarRotulo, voltarNumero, tituloCurto, classe,
  coach, onRegistrar, chaveReveal, children, rodape, extra,
}: SubtelaV5Props) {
  const mob = useMobV5()
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  }, [mob, chaveReveal])

  const abrirCoach = (seed = '') => {
    setCoachSeed(seed)
    setCoachOpen(true)
  }

  const voltar = (
    <Link className={mob ? 'voltar' : 'voltar boot b1'} href={voltarHref}>
      ← {voltarNumero && <b>{voltarNumero}</b>} {voltarRotulo}
    </Link>
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo={area} onCoachOpen={() => abrirCoach('')} onRegistrar={onRegistrar} />

      <main className={classe} ref={mainRef}>
        <div className="wrap subtela">
          <SubnavArea itens={subnav} atual={atual} rotulo={subnavRotulo} />
          {mob ? (
            <div className="subbar">
              <Link className="voltar" href={voltarHref}>← {voltarRotulo.split(' · ')[0]}</Link>
              <span className="curto">{tituloCurto}</span>
            </div>
          ) : voltar}
          {children({ abrirCoach, mob })}
        </div>
        {rodape}
      </main>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={coach.sugestoes}
        onClose={() => setCoachOpen(false)}
        moduleId={moduloCoach}
        leitura={coach.leitura}
        saudacao={coach.saudacao}
      />
      {extra}
    </>
  )
}
