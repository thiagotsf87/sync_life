'use client'

// Fase 1 · Task 12 · hub de Finanças v5 (template T1). Porte 1:1 de
// prototypes/v5/app/financas-a.html (desktop) e financas-a.mobile.html (mobile):
// título + Sy → números do mês → orçamentos | fluxo → últimas transações →
// metas | recorrentes → rodapé. O mobile tem markup próprio no protótipo
// (seções .sec empilhadas com .sec-head e link à direita), então a árvore troca
// de forma junto com o .mob do AppV5Boot (mesma media query, sem mismatch de
// hidratação: o servidor sempre entrega o desktop). Dados reais via
// useFinancasV5; vazios honestos, nenhum número inventado.

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { Sy40 } from '@/components/app-v5/Sy40'
import { SubnavArea, SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { useFinancasV5, type FinancasV5Data } from '@/hooks/use-financas-v5'
import type { Parte } from '@/lib/financas/fluxo'
import type { ParteFala } from '@/lib/financas/hub'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'
import './financas-v5.css'

// ─── mobile: mesma media query do AppV5Boot ──────────────────────────────────
const MQ = '(max-width:1023px)'
const assinarMq = (cb: () => void) => {
  const mq = window.matchMedia(MQ)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const lerMq = () => window.matchMedia(MQ).matches
const lerMqServidor = () => false

function useMobV5(): boolean {
  return useSyncExternalStore(assinarMq, lerMq, lerMqServidor)
}

// ─── frases com números em negrito ───────────────────────────────────────────
function Fala({ partes }: { partes: ParteFala[] }) {
  return (
    <>
      {partes.map((p, i) =>
        p.b ? <b key={i} className={p.w ? 'num w' : 'num'}>{p.t}</b> : <span key={i}>{p.t}</span>,
      )}
    </>
  )
}

function Prosa({ partes }: { partes: Parte[] }) {
  return <>{partes.map((p, i) => (p.b ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}</>
}

// ─── peças compartilhadas entre desktop e mobile ─────────────────────────────
function Orcamentos({ d }: { d: FinancasV5Data }) {
  return (
    <>
      {d.orcamentos.length === 0 && <p className="quieto">Nenhum orçamento definido para {d.mesNome}.</p>}
      {d.orcamentos.map(o => (
        <div key={o.id} className={o.warn ? 'orc warn' : 'orc'} style={{ '--w': `${o.w}%` } as CSSProperties}>
          <span className="nm">{o.nome}</span>
          <span className="v num"><b>{o.gasto}</b> de {o.limite}</span>
          <div className="track"><i /></div>
          <span className="sub num">{o.sub}</span>
        </div>
      ))}
      {d.categorias.length > 0 && (
        <p className="cats">
          Por categoria:{' '}
          {d.categorias.map((c, i) => (
            <span key={c.nome}>
              {i > 0 && ' · '}{c.nome} <span className="num">{c.valor}</span>
            </span>
          ))}
        </p>
      )}
      <div className="prox">
        <span className="eyebrow">Próxima ação</span>
        <p><Fala partes={d.prox} /></p>
      </div>
    </>
  )
}

function Grafico({ f }: { f: NonNullable<FinancasV5Data['fluxo']> }) {
  const n = f.leituras.length
  return (
    <div className="chart">
      <svg viewBox="0 0 600 170" preserveAspectRatio="none" role="img" aria-label={f.aria}>
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a1ff62" stopOpacity=".22" />
            <stop offset="1" stopColor="#a1ff62" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
        <path d={f.area} fill="url(#gf)" />
        <path d={f.linha} fill="none" stroke="#a1ff62" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {f.recuos.map(p => <circle key={p.x} cx={p.x} cy={p.y} r="3" fill="#f84131" />)}
        <circle cx={f.fim.x} cy={f.fim.y} r="4" fill="#a1ff62" />
      </svg>
      <div className="leg">
        <span>1ª leitura · <span className="num">{f.leituras[0]}</span></span>
        <span>{n}ª leitura · <span className="num">{f.leituras[n - 1]}</span></span>
      </div>
    </div>
  )
}

function Tx({ t, mob }: { t: FinancasV5Data['transacoes'][number]; mob: boolean }) {
  const v = <span className="v num">{t.v}</span>
  const ct = <span className="ct">{t.ct}</span>
  return (
    <div className={t.entrada ? 'tx in' : 'tx'}>
      <span className="d num">{t.d}</span>
      <span className="ds">{t.ds}</span>
      {mob ? <>{v}{ct}</> : <>{ct}{v}</>}
    </div>
  )
}

function Metas({ d }: { d: FinancasV5Data }) {
  if (d.metas.length === 0) return <p className="quieto">Nenhuma meta em andamento.</p>
  return (
    <>
      {d.metas.map(m => (
        <div key={m.id} className="mrow">
          <div className="r1"><span className="nm">{m.nome}</span><span className="pct num">{m.pct}%</span></div>
          <div className="track"><i style={{ width: `${m.pct}%` }} /></div>
          <div className="sub">{m.sub}</div>
        </div>
      ))}
    </>
  )
}

function Recorrentes({ d }: { d: FinancasV5Data }) {
  return (
    <>
      {d.recorrentes.length === 0 && <p className="quieto">Nenhuma recorrente nos próximos 30 dias.</p>}
      {d.recorrentes.map(r => (
        <div key={r.id} className="rec">
          <div>
            <div className="nm">{r.nome}</div>
            <div className="when"><span className={r.due ? 'tag due' : 'tag'}>{r.tag}</span>{r.ct}</div>
          </div>
          <span className="v num">{r.v}</span>
        </div>
      ))}
      {d.agenda && (
        <p className="agenda">Hoje às <span className="num">{d.agenda.hora}</span>: {d.agenda.titulo}, na sua agenda.</p>
      )}
    </>
  )
}

function Carregando() {
  return (
    <div className="sk-rows" aria-hidden="true">
      <div className="sk-row" /><div className="sk-row" /><div className="sk-row" /><div className="sk-row" />
    </div>
  )
}

// ─── tela ────────────────────────────────────────────────────────────────────
export function FinancasV5() {
  const d = useFinancasV5()
  const mob = useMobV5()

  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const mainRef = useRef<HTMLElement>(null)

  // reveals .rv: re-observa quando os dados chegam ou a árvore troca de forma
  const { loading, vazio } = d
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  }, [loading, vazio, mob])

  const abrirCoach = (seed: string) => {
    setCoachSeed(seed)
    setCoachOpen(true)
  }

  const cheio = !d.loading && !d.vazio
  const nTx = `${d.txCount} ${d.txCount === 1 ? 'transação' : 'transações'}`

  const titulo = (
    <header className="titulo boot b1">
      <p className="eyebrow"><b>01</b> · Área</p>
      <h1 suppressHydrationWarning>Finanças · {d.mesNome}</h1>
      <div className="sy">
        <Sy40 />
        <div>
          {d.loading ? (
            <div aria-hidden="true"><span className="sk l1" /><span className="sk l2" /></div>
          ) : (
            <>
              <p className="fala"><Fala partes={d.fala} /></p>
              <p className="fontes" suppressHydrationWarning>Atualizado às {d.atualizadoAs} · fontes: {d.fontes}</p>
            </>
          )}
          <button className="falar" type="button" onClick={() => abrirCoach(`Sobre ${d.mesNome}: `)}>
            Falar com Sy sobre {d.mesNome} →
          </button>
        </div>
      </div>
    </header>
  )

  const nums = (
    <section className="nums boot b2" aria-label="Números do mês">
      <div><p className="eyebrow">Receitas</p><div className="v num">{d.nums.receitas}</div><div className={d.nums.dReceitas.ele ? 'd num ele' : 'd num'}>{d.nums.dReceitas.t}</div></div>
      <div><p className="eyebrow">Despesas</p><div className="v num">{d.nums.despesas}</div><div className="d num">{d.nums.dDespesas.t}</div></div>
      <div><p className="eyebrow">Saldo livre</p><div className="v num">{d.nums.saldo}</div><div className={d.nums.dSaldo.ele ? 'd num ele' : 'd num'}>{d.nums.dSaldo.t}</div></div>
      <div><p className="eyebrow">Poupança</p><div className="v num">{d.nums.poupanca}</div><div className="d num">{d.nums.dPoupanca.t}</div></div>
    </section>
  )

  const desktop = (
    <>
      {cheio && (
        <>
          <section className="duo boot b3" aria-label="Orçamentos e fluxo de caixa">
            <div id="orcamentos">
              <p className="eyebrow">Orçamentos</p>
              <Orcamentos d={d} />
            </div>
            <div className="fluxo">
              <p className="eyebrow">Fluxo de caixa</p>
              {d.fluxo && <Grafico f={d.fluxo} />}
              {d.fluxo && <p className="prosa"><Prosa partes={d.fluxo.prosaDesktop} /></p>}
            </div>
          </section>

          <section className="trans rv" id="transacoes" aria-label="Últimas transações">
            <div className="trans-head">
              <p className="eyebrow">Últimas transações</p>
              <Link href="/financas/transacoes">Ver todas →</Link>
            </div>
            {d.transacoes.map(t => <Tx key={t.id} t={t} mob={false} />)}
          </section>
        </>
      )}

      {!d.loading && (
        <section className="duo2 rv" aria-label="Metas e recorrentes">
          <div className="metas">
            <p className="eyebrow">Metas em andamento</p>
            <Metas d={d} />
          </div>
          <div id="recorrentes">
            <p className="eyebrow">Recorrentes</p>
            <Recorrentes d={d} />
          </div>
        </section>
      )}
    </>
  )

  const mobile = (
    <>
      {cheio && (
        <>
          <section className="sec boot b3" id="orcamentos" aria-label="Orçamentos">
            <div className="sec-head"><p className="eyebrow">Orçamentos</p><Link href="/financas/orcamentos">Ajustar →</Link></div>
            <Orcamentos d={d} />
          </section>

          <section className="sec fluxo boot b4" aria-label="Fluxo de caixa">
            <p className="eyebrow">Fluxo de caixa</p>
            {d.fluxo && <Grafico f={d.fluxo} />}
            {d.fluxo && <p className="prosa"><Prosa partes={d.fluxo.prosaMobile} /></p>}
          </section>

          <section className="sec rv" id="transacoes" aria-label="Últimas transações">
            <div className="sec-head"><p className="eyebrow">Últimas transações</p><Link href="/financas/transacoes">Ver todas →</Link></div>
            {d.transacoes.map(t => <Tx key={t.id} t={t} mob />)}
          </section>
        </>
      )}

      {!d.loading && (
        <>
          <section className="sec metas rv" aria-label="Metas em andamento">
            <div className="sec-head"><p className="eyebrow">Metas em andamento</p><Link href="/futuro">02 Futuro →</Link></div>
            <Metas d={d} />
          </section>

          <section className="sec last rv" id="recorrentes" aria-label="Recorrentes">
            <div className="sec-head"><p className="eyebrow">Recorrentes</p><Link href="/financas/recorrentes">Gerenciar →</Link></div>
            <Recorrentes d={d} />
          </section>
        </>
      )}
    </>
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo="financas" onCoachOpen={() => abrirCoach('')} />

      <main className="financas" ref={mainRef}>
        <div className="wrap">
          <SubnavArea itens={SUBNAV_FINANCAS} atual="visao" rotulo="Telas de Finanças" />
          {titulo}
          {d.loading ? <Carregando /> : nums}
          {mob ? mobile : desktop}
        </div>

        {!d.loading && (
        <footer className="colofao">
          <span>
            Fechamento projetado de {d.mesNome}:{' '}
            {d.fechamento ? <b className="num">{d.fechamento}</b> : 'sem dados para projetar'}
          </span>
          <div className="r">
            <span>{nTx} <b className="num">em {d.mesNome}</b></span>
            <span suppressHydrationWarning>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>
          </div>
        </footer>
        )}
      </main>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={d.sugestoes}
        onClose={() => setCoachOpen(false)}
        moduleId="financas"
        leitura="o seu mês"
        saudacao={`Já li o seu ${d.mesNome}. O que você quer saber?`}
      />
    </>
  )
}

export default FinancasV5
