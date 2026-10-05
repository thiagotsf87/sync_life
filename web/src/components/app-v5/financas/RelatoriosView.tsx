'use client'

// Fase 2 · Relatórios v5, apresentação por props. Porte 1:1 de prototypes/v5/app/financas-relatorios.html
// (desktop) e financas-relatorios.mobile.html (mobile, markup próprio): cabeçalho curto com período em
// pílulas e Sy, 4 números com delta, receitas × despesas, categorias atual × anterior, poupança contra a
// meta, 5 maiores despesas, mês a mês recolhido e CSV. Gráficos em SVG à mão (geometria em
// lib/financas/relatorios), tooltip por mouse, setas do teclado e toque. Linhas de Sy calculadas em texto.

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { Sy40 } from '@/components/app-v5/Sy40'
import { brl, brlInt } from '@/lib/financas/hub'
import type { ParteFala } from '@/lib/financas/hub'
import {
  PERIODOS, aria1, aria3, cap, categoriasRel, classeDelta, colunasTabela, conteudoTip, fontes, geoC1, geoC3,
  nomeMes, numeros, resumoTabela, rotuloAnterior, rotuloPeriodo, sparkPath, subtitulo, syCategorias,
  syPoupanca, syReceitasDespesas, syTop, syTopo, textoDelta, topDespesas,
  type PeriodoKey, type Relatorio, type TipRef,
} from '@/lib/financas/relatorios'
import './relatorios-v5.css'

export interface RelatoriosViewProps {
  rel: Relatorio | null
  loading: boolean
  recarregando: boolean
  erro: boolean
  mob: boolean
  periodoKey: PeriodoKey
  de: string
  ate: string
  opcoes: { value: string; label: string }[]
  atualizadoAs: string
  csvMsg: string
  onKey: (k: PeriodoKey) => void
  onDe: (ym: string) => void
  onAte: (ym: string) => void
  onTentar: () => void
  onCsv: () => void
  onFalar: (seed: string) => void
}

// ─── frases com números em negrito ───────────────────────────────────────────

function Frase({ partes, tag }: { partes: ParteFala[]; tag: 'b' | 'span' }) {
  return (
    <>
      {partes.map((p, i) => {
        if (!p.b) return <span key={i}>{p.t}</span>
        const cls = p.w ? 'num w' : 'num'
        return tag === 'b' ? <b key={i} className={cls}>{p.t}</b> : <span key={i} className={cls}>{p.t}</span>
      })}
    </>
  )
}

function Syl({ partes }: { partes: ParteFala[] }) {
  if (partes.length === 0) return null
  return <p className="syl"><Frase partes={partes} tag="span" /></p>
}

// ─── tooltip ─────────────────────────────────────────────────────────────────

interface TipEstado { rel: Relatorio; ref: TipRef; x: number; y: number; t: number }

function Tip({ rel, tip, mob }: { rel: Relatorio; tip: TipEstado; mob: boolean }) {
  const elRef = useRef<HTMLDivElement>(null)
  const dados = conteudoTip(rel, tip.ref, mob)

  // posição perto do ponto (gráficos) ou da linha (listas), presa à largura da tela
  useLayoutEffect(() => {
    const el = elRef.current
    if (!el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const vw = document.documentElement.clientWidth
    const l = Math.max(10, Math.min(vw - w - 10, tip.x - w / 2))
    let t = tip.y - h - 14
    if (t < 70) t = tip.y + 18
    el.style.left = `${l}px`
    el.style.top = `${t}px`
  }, [tip])

  if (!dados) return null
  return (
    <div className="tip" role="tooltip" ref={elRef}>
      <b>{dados.titulo}{dados.sub ? <small>{dados.sub}</small> : null}</b>
      {dados.blocos.map((bloco, i) => (
        <Fragment key={i}>
          {i > 0 && <hr />}
          {bloco.map(l => (
            <span key={l.l}>
              {l.k && <i className={`k ${l.k}`} />}
              {l.l}
              <em className="num">{l.v}</em>
            </span>
          ))}
        </Fragment>
      ))}
    </div>
  )
}

// ─── caixa de gráfico: mouse, setas e toque ──────────────────────────────────

interface ChartBoxProps {
  aria: string
  xs: number[]
  W: number
  /** índice ativo (vem do tooltip aberto) */
  ativo: number | null
  onAt: (i: number, x: number, y: number) => void
  onFora: () => void
  children: ReactNode
}

function ChartBox({ aria, xs, W, ativo, onAt, onFora, children }: ChartBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  const plot = () => boxRef.current?.querySelector('.plot') ?? null
  const deX = (clientX: number): number => {
    const p = plot()
    if (!p) return 0
    const r = p.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    let b = 0
    xs.forEach((x, i) => { if (Math.abs(x - px) < Math.abs(xs[b] - px)) b = i })
    return b
  }
  const em = (i: number) => {
    const p = plot()
    if (!p) return
    const idx = Math.max(0, Math.min(xs.length - 1, i))
    const r = p.getBoundingClientRect()
    onAt(idx, r.left + (xs[idx] / W) * r.width, r.top + 6)
  }

  return (
    <div
      className="cht"
      ref={boxRef}
      tabIndex={0}
      role="img"
      aria-label={aria}
      onPointerMove={ev => { if (ev.pointerType === 'mouse') em(deX(ev.clientX)) }}
      onPointerDown={ev => { if (ev.pointerType !== 'mouse') em(deX(ev.clientX)) }}
      onPointerLeave={ev => { if (ev.pointerType === 'mouse') onFora() }}
      onFocus={() => em(xs.length - 1)}
      onBlur={onFora}
      onKeyDown={ev => {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
          ev.preventDefault()
          em((ativo ?? xs.length - 1) + (ev.key === 'ArrowRight' ? 1 : -1))
        }
        if (ev.key === 'Escape') onFora()
      }}
    >
      {children}
    </div>
  )
}

function Guia({ xs, W, ativo }: { xs: number[]; W: number; ativo: number | null }) {
  const style: CSSProperties | undefined = ativo !== null && xs[ativo] !== undefined
    ? { left: `${(xs[ativo] / W) * 100}%`, opacity: 1 }
    : undefined
  return <i className="guia" aria-hidden="true" style={style} />
}

// ─── gráficos ────────────────────────────────────────────────────────────────

interface GraficoProps {
  rel: Relatorio
  mob: boolean
  ativo: number | null
  onAt: (i: number, x: number, y: number) => void
  onFora: () => void
}

function GraficoC1({ rel, mob, ativo, onAt, onFora }: GraficoProps) {
  const c = geoC1(rel, mob)
  const { W, H, xs } = c.g
  const gid = mob ? 'g1m' : 'g1'
  return (
    <ChartBox aria={aria1(rel)} xs={xs} W={W} ativo={ativo} onAt={onAt} onFora={onFora}>
      <div className="plot" style={{ '--h': `${H}px` } as CSSProperties}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a1ff62" stopOpacity=".2" />
              <stop offset="1" stopColor="#a1ff62" stopOpacity="0" />
            </linearGradient>
          </defs>
          {c.grades.map((y, i) => <line key={i} x1="0" y1={y.toFixed(1)} x2={W} y2={y.toFixed(1)} stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />)}
          {c.area && <path d={c.area} fill={`url(#${gid})`} />}
          <path d={c.linhaDesp} fill="none" stroke="#b8b8b8" strokeWidth="1.6" strokeDasharray="5 5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={c.linhaRec} fill="none" stroke="#a1ff62" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {c.dots.map((d, i) => (
            <path key={i} d={`M${d.x.toFixed(1)} ${d.y.toFixed(1)}h0`} stroke={d.cor === 'rec' ? '#a1ff62' : '#b8b8b8'} strokeWidth={d.w} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ))}
          {c.sombra !== null && (
            <>
              <rect x="0" y="0" width={c.sombra.toFixed(1)} height={H} fill="#151313" fillOpacity=".62" />
              <line x1={c.sombra.toFixed(1)} y1="0" x2={c.sombra.toFixed(1)} y2={H} stroke="rgba(255,255,255,.18)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {c.ylabels.map(l => <span key={l.txt} className="yl num" style={{ top: l.top }}>{l.txt}</span>)}
        {c.zonas.map(z => <span key={z.txt} className="zona" style={{ left: z.left }}>{z.txt}</span>)}
        <Guia xs={xs} W={W} ativo={ativo} />
      </div>
      <div className="xl" aria-hidden="true">
        {c.xl.map(x => <span key={x.left} className={x.ant ? 'ant' : ''} style={{ left: x.left }}>{x.txt}</span>)}
      </div>
    </ChartBox>
  )
}

function GraficoC3({ rel, mob, ativo, onAt, onFora }: GraficoProps) {
  const c = geoC3(rel, mob)
  const { W, H, xs } = c.g
  return (
    <ChartBox aria={aria3(rel)} xs={xs} W={W} ativo={ativo} onAt={onAt} onFora={onFora}>
      <div className="plot" style={{ '--h': `${H}px` } as CSSProperties}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1={c.baseY} x2={W} y2={c.baseY} stroke="rgba(255,255,255,.12)" vectorEffect="non-scaling-stroke" />
          {c.barras.map((b, i) => (
            <rect key={i} x={b.x.toFixed(1)} y={b.y.toFixed(1)} width={b.w.toFixed(1)} height={b.h.toFixed(1)} rx="2" fill={b.ok ? '#a1ff62' : '#817f7f'} fillOpacity={b.ant ? '.32' : undefined} />
          ))}
          <line x1="0" y1={c.metaY.toFixed(1)} x2={W} y2={c.metaY.toFixed(1)} stroke="#f4f4f4" strokeOpacity=".55" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        </svg>
        {c.vl.map((v, i) => (
          <span key={i} className={`vl num${v.ant ? ' ant' : ''}${v.ok ? ' ok' : ''}`} style={{ left: v.left, top: v.top }}>{v.txt}</span>
        ))}
        <Guia xs={xs} W={W} ativo={ativo} />
      </div>
      <div className="xl" aria-hidden="true">
        {c.xl.map(x => <span key={x.left} className={x.ant ? 'ant' : ''} style={{ left: x.left }}>{x.txt}</span>)}
      </div>
    </ChartBox>
  )
}

// ─── blocos ──────────────────────────────────────────────────────────────────

interface LinhaHandlers {
  tip: TipEstado | null
  mostrar: (ref: TipRef, el: HTMLElement) => void
  esconder: () => void
}

function linhaProps(h: LinhaHandlers, ref: TipRef) {
  return {
    tabIndex: 0,
    onPointerEnter: (ev: React.PointerEvent<HTMLElement>) => { if (ev.pointerType === 'mouse') h.mostrar(ref, ev.currentTarget) },
    onPointerLeave: (ev: React.PointerEvent<HTMLElement>) => { if (ev.pointerType === 'mouse') h.esconder() },
    onPointerDown: (ev: React.PointerEvent<HTMLElement>) => { if (ev.pointerType !== 'mouse') h.mostrar(ref, ev.currentTarget) },
    onFocus: (ev: React.FocusEvent<HTMLElement>) => h.mostrar(ref, ev.currentTarget),
    onBlur: () => h.esconder(),
  }
}

function Numeros({ rel, mob }: { rel: Relatorio; mob: boolean }) {
  return (
    <section className="nums boot b2" aria-label="Números do período">
      {numeros(rel, mob).map(c => (
        <div key={c.l}>
          <p className="eyebrow">{c.l}</p>
          <div className="v num">{c.v}</div>
          <div className={c.ele ? 'd num ele' : 'd num'}>{c.d}</div>
        </div>
      ))}
    </section>
  )
}

function Categorias({ rel, mob, h }: { rel: Relatorio; mob: boolean; h: LinhaHandlers }) {
  const c = categoriasRel(rel)
  const ativoNome = h.tip && h.tip.rel === rel && h.tip.ref.tipo === 'cat' ? h.tip.ref.nome : null
  return (
    <div className="cats-box">
      {c.linhas.length === 0 && <p className="vazio-top">Nenhuma despesa neste período.</p>}
      {c.linhas.map(l => {
        const d = classeDelta(l)
        const cls = `crow${d ? ` ${d}` : ''}${ativoNome === l.nome ? ' hl' : ''}`
        const sp = sparkPath(l.spark)
        return (
          <div key={l.nome} className={cls} data-c={l.nome} {...linhaProps(h, { tipo: 'cat', nome: l.nome })}>
            <span className="nm">{l.nome}</span>
            {!mob && (sp
              ? (
                <svg className="tr" viewBox="0 0 60 16" preserveAspectRatio="none" aria-hidden="true">
                  <path d={sp} fill="none" stroke="#b8b8b8" strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              )
              : <span className="tr" />)}
            <span className="v num">{brlInt(l.valor)}</span>
            <span className="dl num">{textoDelta(l, rel.temAnterior)}</span>
            <div className="bars">
              <i className="a" style={{ '--w': `${l.wA.toFixed(1)}%` } as CSSProperties} />
              {l.wB !== null && <i className="b" style={{ '--w': `${l.wB.toFixed(1)}%` } as CSSProperties} />}
            </div>
          </div>
        )
      })}
      {c.outras > 0 && (
        <p className="outras">
          Outras categorias somam <span className="num">{brlInt(c.outras)}</span>
          {c.outrasAnt !== null && <> (antes, <span className="num">{brlInt(c.outrasAnt)}</span>)</>}.
        </p>
      )}
    </div>
  )
}

function TopLista({ rel, h }: { rel: Relatorio; h: LinhaHandlers }) {
  const t = topDespesas(rel)
  const ativoI = h.tip && h.tip.rel === rel && h.tip.ref.tipo === 'top' ? h.tip.ref.i : null
  return (
    <div className="top-box">
      {t.length === 0 ? (
        <p className="vazio-top">Nenhuma despesa neste período.</p>
      ) : (
        <ol className="top">
          {t.map((x, i) => (
            <li key={x.id} className={ativoI === i ? 'trow hl' : 'trow'} data-i={i} {...linhaProps(h, { tipo: 'top', i })}>
              <span className="ix num">{i + 1}</span>
              <div className="tx2">
                <span className="ds">{x.desc}</span>
                <span className="mt"><span className="num">{x.data}</span> · {x.cat}</span>
              </div>
              <span className="v num">{brl(x.valor)}</span>
              <div className="tbar"><i style={{ '--w': `${x.w.toFixed(1)}%` } as CSSProperties} /></div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function MesAMes({ rel, mob }: { rel: Relatorio; mob: boolean }) {
  const a = rel.total
  const cats = colunasTabela(rel)
  return (
    <details className={mob ? 'mm sec rv' : 'mm rv'}>
      <summary>
        <span className="eyebrow">{resumoTabela(rel)}</span>
        <small>{mob ? 'Saldo, entradas, saídas e poupança' : 'Receitas, despesas por categoria, saldo e poupança'}</small>
      </summary>
      {mob ? (
        <div>
          {rel.meses.map(m => (
            <div key={m.ym} className="mrow2">
              <span className="nm">{cap(nomeMes(m.ym))}{m.parcial && <> <small>até dia {rel.diaHoje}</small></>}</span>
              <span className="v num">{brl(m.saldo)}</span>
              <span className="sb num">{brl(m.rec)} entraram · {brl(m.desp)} saíram · {m.poupPct}%</span>
            </div>
          ))}
          <div className="mrow2 tot">
            <span className="nm">Total</span>
            <span className="v num">{brl(a.saldo)}</span>
            <span className="sb num">{brl(a.rec)} entraram · {brl(a.desp)} saíram · média {a.poup}%</span>
          </div>
        </div>
      ) : (
        <div className="mm-tab">
          <table>
            <thead>
              <tr>
                <th>Mês</th><th>Receitas</th><th>Despesas</th>
                {cats.map(c => <th key={c}>{c}</th>)}
                <th>Saldo</th><th>Poupança</th>
              </tr>
            </thead>
            <tbody>
              {rel.meses.map(m => (
                <tr key={m.ym}>
                  <td>{cap(nomeMes(m.ym))}{m.parcial && <> <small>até dia {rel.diaHoje}</small></>}</td>
                  <td className="num">{brl(m.rec)}</td>
                  <td className="num">{brl(m.desp)}</td>
                  {cats.map(c => <td key={c} className="num">{brl(m.cats[c] ?? 0)}</td>)}
                  <td className="num">{brl(m.saldo)}</td>
                  <td className="num">{m.poupPct}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="num">{brl(a.rec)}</td>
                <td className="num">{brl(a.desp)}</td>
                {cats.map(c => <td key={c} className="num">{brl(a.cats[c] ?? 0)}</td>)}
                <td className="num">{brl(a.saldo)}</td>
                <td className="num">{a.poup}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </details>
  )
}

const IconeBaixar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11" /><polyline points="7 10 12 15 17 10" /><line x1="5" y1="20" x2="19" y2="20" />
  </svg>
)

// ─── tela ────────────────────────────────────────────────────────────────────

export function RelatoriosView(p: RelatoriosViewProps) {
  const { rel, loading, recarregando, erro, mob } = p
  const [tip, setTip] = useState<TipEstado | null>(null)
  const corpoRef = useRef<HTMLDivElement>(null)

  const mostrarPonto = (tipo: 'c1' | 'c3') => (i: number, x: number, y: number) => {
    if (!rel) return
    setTip({ rel, ref: { tipo, i }, x, y, t: Date.now() })
  }
  const esconder = () => setTip(null)
  const mostrarLinha = (ref: TipRef, el: HTMLElement) => {
    if (!rel) return
    const r = el.getBoundingClientRect()
    setTip({ rel, ref, x: r.left + Math.min(r.width * 0.5, 220), y: r.top, t: Date.now() })
  }
  const h: LinhaHandlers = { tip, mostrar: mostrarLinha, esconder }
  const tipAtual = tip && rel && tip.rel === rel ? tip : null
  const ativoC1 = tipAtual && tipAtual.ref.tipo === 'c1' ? tipAtual.ref.i : null
  const ativoC3 = tipAtual && tipAtual.ref.tipo === 'c3' ? tipAtual.ref.i : null

  // some com Esc, com toque fora e com a rolagem (depois de 600 ms, para não matar o toque)
  const aberto = tipAtual !== null
  const abertoEm = tipAtual?.t ?? 0
  useEffect(() => {
    if (!aberto) return
    const fora = (ev: PointerEvent) => {
      if (!(ev.target instanceof Element) || !ev.target.closest('.cht,.crow,.trow')) setTip(null)
    }
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setTip(null) }
    const rolou = () => { if (Date.now() - abertoEm > 600) setTip(null) }
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', tecla)
    window.addEventListener('scroll', rolou, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', tecla)
      window.removeEventListener('scroll', rolou)
    }
  }, [aberto, abertoEm])

  // troca de período: um respiro, nada pisca (só com .anim no root da árvore)
  useEffect(() => {
    const el = corpoRef.current
    if (!el || !el.closest('.anim')) return
    el.classList.remove('troca')
    void el.offsetWidth
    el.classList.add('troca')
  }, [rel])

  const onPilula = (k: PeriodoKey, el: HTMLElement) => {
    p.onKey(k)
    if (mob) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  const fala = rel ? syTopo(rel) : []
  const semDados = !loading && !erro && rel !== null && rel.vazio
  const cheio = !loading && !erro && rel !== null && !rel.vazio
  const lab = rel ? rotuloPeriodo(rel) : ''

  const pilulas = (
    <div className="periodos" role="group" aria-label="Período">
      {PERIODOS.map(o => (
        <button key={o.key} className="per" type="button" aria-pressed={p.periodoKey === o.key} onClick={ev => onPilula(o.key, ev.currentTarget)}>
          {o.rotulo}{o.pro && <span className="pro">PRO</span>}
        </button>
      ))}
    </div>
  )

  const personalizado = (
    <div className="custom" hidden={p.periodoKey !== 'custom'}>
      {!mob && <span>De</span>}
      <div className="sel">
        <select aria-label="Mês inicial" value={p.de} onChange={ev => p.onDe(ev.target.value)}>
          {p.opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <span>até</span>
      <div className="sel">
        <select aria-label="Mês final" value={p.ate} onChange={ev => p.onAte(ev.target.value)}>
          {p.opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )

  const syBloco = (
    <div className="sy">
      <Sy40 />
      <div>
        {rel && !erro ? (
          <>
            <p className="fala"><Frase partes={fala} tag="b" /></p>
            <p className="fontes" suppressHydrationWarning>Atualizado às {p.atualizadoAs} · fontes: {fontes(rel)}</p>
          </>
        ) : (
          <div aria-hidden="true"><span className="sk l1" /><span className="sk l2" /></div>
        )}
        <button className="falar" type="button" onClick={() => p.onFalar('Sobre este relatório: ')}>
          Falar com Sy sobre este período →
        </button>
      </div>
    </div>
  )

  const sub = rel && !erro ? subtitulo(rel, mob) : ' '
  const csvBtn = (rot: string, cls: string) => (
    <button className={cls} type="button" onClick={p.onCsv} disabled={!cheio}>
      <IconeBaixar />
      {rot}
    </button>
  )

  const cabecalho = mob ? (
    <header className="titulo boot b1">
      <p className="eyebrow"><Link href="/financas"><b>01</b> · Finanças</Link></p>
      <h1>Relatórios</h1>
      <p className="per-sub" aria-live="polite">{sub}</p>
      {pilulas}
      {personalizado}
      {syBloco}
    </header>
  ) : (
    <header className="titulo boot b1">
      <p className="eyebrow"><Link href="/financas"><b>01</b> · Finanças</Link></p>
      <div className="th-row">
        <div>
          <h1>Relatórios</h1>
          <p className="per-sub" aria-live="polite">{sub}</p>
        </div>
        {csvBtn('Exportar CSV', 'btn-sm ghost')}
      </div>
      {pilulas}
      {personalizado}
      {syBloco}
    </header>
  )

  let corpo: ReactNode = null
  if (loading) {
    corpo = (
      <div className="rel-sk" aria-hidden="true">
        <div className="l4"><span /><span /><span /><span /></div>
        <span className="big" />
      </div>
    )
  } else if (erro) {
    corpo = (
      <div className="rel-erro" role="alert">
        <span>Não consegui carregar este período.</span>
        <button type="button" onClick={p.onTentar}>Tentar de novo</button>
      </div>
    )
  } else if (semDados) {
    corpo = (
      <div className="rel-vazio">
        <p className="t">Nada registrado de {lab}</p>
        <p className="s">Escolha outro período ou registre uma transação. Os números e os gráficos aparecem a partir dela.</p>
        <Link className="btn-sm ghost" href="/financas/transacoes#registrar">Registrar transação</Link>
      </div>
    )
  } else if (rel) {
    const leg1 = (
      <div className="leg" aria-hidden="true"><span><i />Receitas</span><span><i className="dsp" />Despesas</span></div>
    )
    const leg2 = (
      <div className="leg" aria-hidden="true">
        <span><i className="la" />{rotuloPeriodo(rel, mob)}</span>
        {rel.mesesAnt.length > 0 && <span><i className="lb" />{rotuloAnterior(rel, mob)}</span>}
      </div>
    )
    const leg3 = (
      <div className="leg" aria-hidden="true"><span><i className="mt" />meta de {rel.metaPct}%</span><span><i className="ok" />na meta</span></div>
    )
    const c1 = (
      <GraficoC1 rel={rel} mob={mob} ativo={ativoC1} onAt={mostrarPonto('c1')} onFora={esconder} />
    )
    const c3 = (
      <GraficoC3 rel={rel} mob={mob} ativo={ativoC3} onAt={mostrarPonto('c3')} onFora={esconder} />
    )
    const exportar = (
      <div className="exp rv">
        {csvBtn('Exportar CSV do período', 'btn-sm ghost')}
        <span className="fmt">Separado por ponto e vírgula, decimal com vírgula, abre direto no Excel e no Google Planilhas.</span>
        <span className="csv-ok" role="status">{p.csvMsg}</span>
      </div>
    )
    corpo = mob ? (
      <>
        <Numeros rel={rel} mob />
        <section className="sec c1 boot b3" aria-label="Receitas e despesas">
          <div className="blk-head"><p className="eyebrow">Receitas × despesas</p>{leg1}</div>
          <Syl partes={syReceitasDespesas(rel)} />
          {c1}
        </section>
        <section className="sec rv" aria-label="Categorias">
          <div className="blk-head"><p className="eyebrow">Categorias</p>{leg2}</div>
          <Syl partes={syCategorias(rel)} />
          <Categorias rel={rel} mob h={h} />
        </section>
        <section className="sec rv" aria-label="Poupança por mês">
          <div className="blk-head"><p className="eyebrow">Poupança por mês</p>{leg3}</div>
          <Syl partes={syPoupanca(rel)} />
          {c3}
        </section>
        <section className="sec rv" aria-label="Maiores despesas">
          <p className="eyebrow">Maiores despesas</p>
          <Syl partes={syTop(rel)} />
          <TopLista rel={rel} h={h} />
        </section>
        <MesAMes rel={rel} mob />
        {exportar}
      </>
    ) : (
      <>
        <Numeros rel={rel} mob={false} />
        <section className="duo boot b3" aria-label="Receitas, despesas e categorias">
          <div className="c1">
            <div className="blk-head"><p className="eyebrow">Receitas × despesas</p>{leg1}</div>
            <Syl partes={syReceitasDespesas(rel)} />
            {c1}
          </div>
          <div>
            <div className="blk-head"><p className="eyebrow">Categorias</p>{leg2}</div>
            <Syl partes={syCategorias(rel)} />
            <Categorias rel={rel} mob={false} h={h} />
          </div>
        </section>
        <section className="duo2 rv" aria-label="Poupança e maiores despesas">
          <div>
            <div className="blk-head"><p className="eyebrow">Poupança por mês</p>{leg3}</div>
            <Syl partes={syPoupanca(rel)} />
            {c3}
          </div>
          <div>
            <p className="eyebrow">Maiores despesas</p>
            <Syl partes={syTop(rel)} />
            <TopLista rel={rel} h={h} />
          </div>
        </section>
        <MesAMes rel={rel} mob={false} />
        {exportar}
      </>
    )
  }


  return (
    <>
      {cabecalho}
      <div className={recarregando ? 'rel-corpo busy' : 'rel-corpo'} ref={corpoRef} aria-busy={recarregando}>
        {corpo}
      </div>
      {tipAtual && rel && <Tip rel={rel} tip={tipAtual} mob={mob} />}
    </>
  )
}
