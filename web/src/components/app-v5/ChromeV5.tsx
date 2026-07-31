'use client'

// Onda 2 · chrome do app v5 — porte 1:1 de prototypes/v5/app/diario.html
// (e diario.mobile.html pra compaction <1024px, via chrome-v5.css):
// bar (brand bússola + data + ações) + ticker (marquee, itens 4×) + modbar
// (Diário ativo + 01-08 nas rotas v3 + Conquistas + Configurações; SEM Coach).

import { Fragment, useSyncExternalStore } from 'react'
import Link from 'next/link'
import './chrome-v5.css'

interface ChromeV5Props {
  ticker: string[]
  onCoachOpen: () => void
}

const SP_TZ = 'America/Sao_Paulo'

const MODULOS: { n: string; nome: string; href: string }[] = [
  { n: '01', nome: 'Finanças', href: '/financas' },
  { n: '02', nome: 'Futuro', href: '/futuro' },
  { n: '03', nome: 'Tempo', href: '/tempo' },
  { n: '04', nome: 'Corpo', href: '/corpo' },
  { n: '05', nome: 'Mente', href: '/mente' },
  { n: '06', nome: 'Patrimônio', href: '/patrimonio' },
  { n: '07', nome: 'Carreira', href: '/carreira' },
  { n: '08', nome: 'Experiências', href: '/experiencias' },
]

// data client-only sem setState em effect: no servidor renderiza vazio estável
// (evita mismatch de fuso) e no client resolve pro dia em SP logo após hidratar
const noopSubscribe = () => () => {}
const serverDate = () => ''

/** "Sexta · 31 de julho de 2026" no fuso de São Paulo (formato do protótipo). */
function hojePorExtenso(): string {
  const now = new Date()
  const semana = now
    .toLocaleDateString('pt-BR', { timeZone: SP_TZ, weekday: 'long' })
    .replace('-feira', '')
  const cap = semana.charAt(0).toUpperCase() + semana.slice(1)
  const resto = now.toLocaleDateString('pt-BR', {
    timeZone: SP_TZ, day: 'numeric', month: 'long', year: 'numeric',
  })
  return `${cap} · ${resto}`
}

/* bússola do brand (SVG 1:1 do protótipo) */
function BrandBussola() {
  return (
    <svg width="19" height="19" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="2" x2="32" y2="11" stroke="#a1ff62" strokeWidth="7" strokeLinecap="round" />
      <polygon points="32,8 40,34 24,34" fill="#6840ff" />
      <polygon points="32,58 24,34 40,34" fill="#f4f4f4" opacity=".35" />
    </svg>
  )
}

/* mini bússola da pílula do coach (SVG 1:1 do protótipo) */
function CoachBussola() {
  return (
    <svg width="15" height="15" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="5" x2="32" y2="12" stroke="#a1ff62" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="59" y1="32" x2="52" y2="32" stroke="#f4f4f4" strokeWidth="4.5" strokeLinecap="round" opacity=".5" />
      <line x1="32" y1="59" x2="32" y2="52" stroke="#f4f4f4" strokeWidth="4.5" strokeLinecap="round" opacity=".5" />
      <line x1="5" y1="32" x2="12" y2="32" stroke="#f4f4f4" strokeWidth="4.5" strokeLinecap="round" opacity=".5" />
      <polygon points="32,8 38,32 26,32" fill="#6840ff" />
      <polygon points="32,55 26,32 38,32" fill="#f4f4f4" opacity=".3" />
      <circle cx="32" cy="32" r="3.5" fill="#151313" />
    </svg>
  )
}

export function ChromeV5({ ticker, onCoachOpen }: ChromeV5Props) {
  const hoje = useSyncExternalStore(noopSubscribe, hojePorExtenso, serverDate)

  // marquee do protótipo: itens duplicados 4× com separador · (loop de -25%)
  const loop = ticker.length > 0
    ? [...ticker, ...ticker, ...ticker, ...ticker]
    : []

  return (
    <>
      <header className="bar">
        <Link className="brand" href="/dashboard">
          <BrandBussola />
          <span className="wm">Sync<em>Life</em></span>
        </Link>
        <span className="date">{hoje}</span>
        <div className="acts">
          <Link className="btn-sm ghost d-only" href="/dashboard/review">Revisão semanal</Link>
          <button className="btn-sm ghost coach-pill" type="button" onClick={onCoachOpen}>
            <CoachBussola />
            <span className="d-only">Pergunte ao coach</span>
            <span className="m-only">Coach</span>
          </button>
          <Link className="btn-sm roxo" href="/financas" aria-label="Nova entrada">
            <span className="d-only">+ Nova entrada</span>
            <span className="m-only">+</span>
          </Link>
        </div>
      </header>

      <div className="ticker" aria-hidden="true">
        {loop.length > 0 && (
          <div className="tk">
            {loop.map((item, i) => (
              <Fragment key={i}>
                <span>{item}</span>
                <span>·</span>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <nav className="modbar" aria-label="Módulos">
        <div className="in">
          <Link className="on" href="/dashboard">Diário</Link>
          {MODULOS.map((m) => (
            <Link key={m.href} href={m.href}>
              <span className="n">{m.n}</span>{m.nome}
            </Link>
          ))}
          <Link href="/conquistas">Conquistas</Link>
          <Link href="/configuracoes">Configurações</Link>
        </div>
      </nav>
    </>
  )
}
