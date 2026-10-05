'use client'

// Fase 1 · chrome do app v5, porte 1:1 de prototypes/v5/app/financas-a.html (bar e
// modbar) e de _intencao.mobile.html (mobile): bar (brand bússola + data + Fale
// com Sy + Registrar) + modbar (Meu dia + 01 a 08 + Conquistas + Configurações).
// No mobile (.mob no root interno, via AppV5Boot) o bar fica só com brand e +,
// o modbar sai e entram a bottom bar e o sheet de Áreas.

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { ModuleId } from '@/types/shell'
import { BottomBar } from './BottomBar'
import { SheetAreas, type AreaScores } from './SheetAreas'
import './chrome-v5.css'

export type AtivoV5 = 'meu-dia' | ModuleId

interface ChromeV5Props {
  ativo: AtivoV5
  onCoachOpen: () => void
  onAreasOpen?: () => void
  /** Registrar da tela (bar e bottom bar). Sem isso, leva a Transações com a captura aberta. */
  onRegistrar?: () => void
  /** score por área para o sheet de Áreas (áreas sem score ficam sem número) */
  scores?: AreaScores
}

const SP_TZ = 'America/Sao_Paulo'

const MODULOS: { id: ModuleId; n: string; nome: string; href: string }[] = [
  { id: 'financas', n: '01', nome: 'Finanças', href: '/financas' },
  { id: 'futuro', n: '02', nome: 'Futuro', href: '/futuro' },
  { id: 'tempo', n: '03', nome: 'Tempo', href: '/tempo' },
  { id: 'corpo', n: '04', nome: 'Corpo', href: '/corpo' },
  { id: 'mente', n: '05', nome: 'Mente', href: '/mente' },
  { id: 'patrimonio', n: '06', nome: 'Patrimônio', href: '/patrimonio' },
  { id: 'carreira', n: '07', nome: 'Carreira', href: '/carreira' },
  { id: 'experiencias', n: '08', nome: 'Experiências', href: '/experiencias' },
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

export function ChromeV5({ ativo, onCoachOpen, onAreasOpen, onRegistrar, scores }: ChromeV5Props) {
  const hoje = useSyncExternalStore(noopSubscribe, hojePorExtenso, serverDate)
  const [areasOpen, setAreasOpen] = useState(false)

  const abrirAreas = () => {
    setAreasOpen(true)
    onAreasOpen?.()
  }

  const cls = (on: boolean) => (on ? 'on' : undefined)

  return (
    <>
      <header className="bar">
        <Link className="brand" href="/dashboard">
          <BrandBussola />
          <span className="wm">Sync<em>Life</em></span>
        </Link>
        <span className="date">{hoje}</span>
        <div className="acts">
          <button className="btn-sm ghost coach-pill d-only" type="button" onClick={onCoachOpen}>
            <CoachBussola />
            Fale com Sy
          </button>
          {onRegistrar ? (
            <button className="btn-sm roxo" type="button" aria-label="Registrar" onClick={onRegistrar}>
              <span className="d-only">+ Registrar</span>
              <span className="m-only">+</span>
            </button>
          ) : (
            <Link className="btn-sm roxo" href="/financas/transacoes#registrar" aria-label="Registrar">
              <span className="d-only">+ Registrar</span>
              <span className="m-only">+</span>
            </Link>
          )}
        </div>
      </header>

      <nav className="modbar d-only" aria-label="Áreas">
        <div className="in">
          <Link
            className={cls(ativo === 'meu-dia')}
            href="/dashboard"
            aria-current={ativo === 'meu-dia' ? 'page' : undefined}
          >
            Meu dia
          </Link>
          {MODULOS.map((m) => (
            <Link
              key={m.href}
              className={cls(ativo === m.id)}
              href={m.href}
              aria-current={ativo === m.id ? 'page' : undefined}
            >
              <span className="n">{m.n}</span>{m.nome}
            </Link>
          ))}
          <Link
            className={cls(ativo === 'conquistas')}
            href="/conquistas"
            aria-current={ativo === 'conquistas' ? 'page' : undefined}
          >
            Conquistas
          </Link>
          <Link
            className={cls(ativo === 'configuracoes')}
            href="/configuracoes"
            aria-current={ativo === 'configuracoes' ? 'page' : undefined}
          >
            Configurações
          </Link>
        </div>
      </nav>

      <BottomBar
        ativo={ativo}
        onCoachOpen={onCoachOpen}
        onAreasOpen={abrirAreas}
        areasOpen={areasOpen}
        onRegistrar={onRegistrar}
      />
      <SheetAreas open={areasOpen} onClose={() => setAreasOpen(false)} scores={scores} />
    </>
  )
}
