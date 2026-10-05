'use client'

// Fase 2 · Planejamento (T3, o mês como objeto). Apresentação pura por props: porte 1:1 do corpo de
// prototypes/v5/app/financas-planejamento.html (desktop) e financas-planejamento.mobile.html (mobile
// dedicado, markup próprio). Estrutura: cabeçalho do objeto com cenários → número principal + Sy →
// curva do saldo (13 meses, tooltip mouse/setas/toque) → laboratório (só com evento de despesa de
// valor alto) → eventos planejados. A moldura (chrome, faixa, voltar/subbar, camada) vem de SubtelaV5.

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import Link from 'next/link'
import { Sy40 } from '@/components/app-v5/Sy40'
import type { PlanningEvent } from '@/hooks/use-planejamento'
import type { PlanejamentoV5Data, EventoLinha } from '@/hooks/use-planejamento-v5'
import {
  CENARIOS, falaPlanejamento, nomeMes, nomeMesDe, dataCurta, dataLonga, idxMes, posX, prosaCurva, reais, reais2,
  rotuloEixo, textoDe, type EfeitosLab, type OpcaoLab, type ParteTexto,
} from '@/lib/financas/planejamento'

const NBSP = ' '
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** frase com números em negrito (`<b class="num">`) e tensão em coral */
function Texto({ partes }: { partes: ParteTexto[] }) {
  return (
    <>
      {partes.map((p, i) => {
        if (!p.b) return <span key={i}>{p.t}</span>
        const cls = (p.n ? 'num' : '') + (p.w ? (p.n ? ' w' : 'w') : '')
        return <b key={i} className={cls || undefined}>{p.t}</b>
      })}
    </>
  )
}

const sinalValor = (e: { tipo: 'in' | 'out'; valor: number }) => `${e.tipo === 'in' ? '+' : '–'}${NBSP}${reais2(e.valor)}`

interface ViewProps {
  d: PlanejamentoV5Data
  mob: boolean
  abrirCoach: (seed?: string) => void
  onNovo: () => void
  onEditar: (ev: PlanningEvent) => void
}

// ─── esqueleto e erro ─────────────────────────────────────────────────────────
function Esqueleto() {
  return (
    <section className="pl-esq" aria-busy="true" aria-label="Carregando a projeção">
      <span style={{ width: '40%' }} />
      <span style={{ width: '70%', height: 34 }} />
      <span style={{ width: '100%', height: 120 }} />
      <span style={{ width: '100%' }} />
      <span style={{ width: '100%' }} />
      <span style={{ width: '100%' }} />
    </section>
  )
}

// ─── a curva ──────────────────────────────────────────────────────────────────
interface Leitura { k: number; left: number; top: number }

function Curva({ d, mob }: { d: PlanejamentoV5Data; mob: boolean }) {
  const { analise: a, geo, serie, hoje, saldoHoje } = d
  const chartRef = useRef<HTMLDivElement>(null)
  const [leit, setLeit] = useState<Leitura | null>(null)
  if (!a || !geo) return null

  const cenarioRotulo = (CENARIOS.find(c => c.id === d.cenario)?.rotulo ?? 'Realista').toLowerCase()
  const Y = geo.y
  const valorEm = (k: number) => (k === 0 ? saldoHoje : serie[k - 1])
  const porMes: Record<number, number> = {}

  function ler(k: number) {
    const el = chartRef.current
    if (!el || !geo) return
    const w = el.clientWidth
    const x = (posX(k) / 100) * w
    setLeit({ k, left: Math.max(0, Math.min(w - 220, x - 110)), top: Math.max(0, (geo.y(valorEm(k)) / 100) * el.clientHeight - 14) })
  }
  function kDoX(e: PointerEvent<HTMLDivElement>): number {
    const r = e.currentTarget.getBoundingClientRect()
    const p = ((e.clientX - r.left) / r.width) * 100
    return Math.max(0, Math.min(13, Math.round((p - 1.5) / (96 / 13))))
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const k = leit ? leit.k + (e.key === 'ArrowRight' ? 1 : -1) : 0
    ler(Math.max(0, Math.min(13, k)))
  }

  const eventosMes = (k: number) => d.eventos.filter(e => idxMes(e.data, hoje) === k - 1)
  const tit = (k: number) => (k === 0 ? `Hoje · ${dataLonga(hoje)}` : cap(nomeMes(hoje, k - 1, true)))

  const pontos = d.eventos.flatMap(ev => {
    const i = idxMes(ev.data, hoje)
    if (i < 0 || i > 12) return []
    porMes[i] = (porMes[i] ?? 0) + 1
    const cls = ev.tipo === 'in' ? 'in' : ev.previa ? 'prev' : ''
    return [(
      <div key={ev.id} className="pt" style={{ left: `${posX(i + 1)}%`, top: `${Y(serie[i])}%` }}>
        <i className={'ev ' + cls} style={{ '--o': porMes[i] - 1 } as CSSProperties} title={ev.nome} />
      </div>
    )]
  })

  const head = (
    <>
      <p className="eyebrow">{`Curva do saldo · 13 meses · ${cenarioRotulo}${d.previa ? ' · prévia' : ''}`}</p>
      <div className="leg" aria-hidden="true">
        <span><i className="in" />{mob ? 'entrada' : 'entrada planejada'}</span>
        <span><i className="out" />{mob ? 'saída' : 'saída planejada'}</span>
        <span><i className="cr" />mês crítico</span>
      </div>
    </>
  )

  const y0 = geo.y0.toFixed(1)

  return (
    <section className="curva boot b3" aria-label="Curva do saldo">
      {mob ? head : <div className="curva-head">{head}</div>}
      <div
        className="chart"
        ref={chartRef}
        tabIndex={mob ? undefined : 0}
        role="img"
        aria-label={`Saldo projetado de ${nomeMes(hoje, 0, true)} a ${nomeMes(hoje, 12, true)}.${mob ? '' : ' Use as setas para ler mês a mês.'}`}
        onPointerMove={e => { if (e.pointerType === 'mouse') ler(kDoX(e)) }}
        onPointerDown={e => ler(kDoX(e))}
        onMouseLeave={() => { if (!mob) setLeit(null) }}
        onBlur={() => { if (!mob) setLeit(null) }}
        onKeyDown={mob ? undefined : onKey}
      >
        <svg viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a1ff62" stopOpacity=".22" /><stop offset="1" stopColor="#a1ff62" stopOpacity="0" /></linearGradient>
            <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f84131" stopOpacity="0" /><stop offset="1" stopColor="#f84131" stopOpacity=".2" /></linearGradient>
            <clipPath id="cA"><rect className="clipr" x="0" y="0" width="1000" height={y0} /></clipPath>
            <clipPath id="cB"><rect className="clipr" x="0" y={y0} width="1000" height={(240 - geo.y0).toFixed(1)} /></clipPath>
          </defs>
          <line x1="0" y1="12" x2="1000" y2="12" stroke="rgba(255,255,255,.06)" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="228" x2="1000" y2="228" stroke="rgba(255,255,255,.06)" vectorEffect="non-scaling-stroke" />
          <path d={geo.area} clipPath="url(#cA)" fill="url(#gp)" />
          <path d={geo.area} clipPath="url(#cB)" fill="url(#gn)" />
          <line className="zero" x1="0" x2="1000" y1={y0} y2={y0} stroke="rgba(255,255,255,.32)" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          <path d={geo.d} clipPath="url(#cA)" fill="none" stroke="#a1ff62" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={geo.d} clipPath="url(#cB)" fill="none" stroke="#f84131" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="ov">
          <div className="hoje" style={{ left: `${posX(0)}%` }}><span>Hoje</span></div>
          <span className="zr" style={{ top: `${Y(0)}%` }}>{`R$${NBSP}0`}</span>
          <div className="pt" style={{ left: `${posX(0)}%`, top: `${Y(saldoHoje)}%` }}><i className="dot0" /></div>
          {pontos}
          {a.critico && (
            <div className="pt" style={{ left: `${posX(a.critico.i + 1)}%`, top: `${Y(serie[a.critico.i])}%` }}><i className="ring" /></div>
          )}
          <div className="pt" style={{ left: `${posX(a.iMin + 1)}%`, top: `${Y(a.min)}%` }}>
            {a.critico && a.iMin === a.critico.i
              ? <span className="rot mn">e mais baixo</span>
              : <span className="rot mn">mais baixo <span className="num">{reais(a.min)}</span></span>}
          </div>
          {leit && <div className="guia on" style={{ left: `${posX(leit.k)}%` }} />}
        </div>
        {!mob && leit && (
          <div className="tip on" style={{ left: leit.left, top: leit.top }}>
            <p className="t">{tit(leit.k)}</p>
            <p className={'v num' + (valorEm(leit.k) < 0 ? ' w' : '')}>{reais(valorEm(leit.k))}</p>
            {eventosMes(leit.k).length > 0 && (
              <ul>
                {eventosMes(leit.k).map(ev => (
                  <li key={ev.id}><span>{ev.nome}</span><span className="num">{sinalValor(ev)}</span></li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!d.ehPro && (
          <Link className="free-chart" href="/configuracoes/plano" style={{ left: `${posX(7)}%` }}>
            <span>Projeção de 12 meses no PRO →</span>
          </Link>
        )}
      </div>
      <div className="eixo" aria-hidden="true">
        {serie.map((_, i) => {
          const cls = [i % 3 === 0 ? 'k' : '', rotuloEixo(hoje, i).includes(' ') && i > 0 ? 'ano' : '', a.critico?.i === i ? 'cr' : '']
            .filter(Boolean).join(' ')
          return <span key={i} className={cls || undefined} style={{ left: `${posX(i + 1)}%` }} title={a.critico?.i === i ? 'Mês crítico' : undefined}>{rotuloEixo(hoje, i)}</span>
        })}
      </div>
      {mob && (
        <p className="leitura" aria-live="polite">
          {leit ? (
            <>
              <b>{tit(leit.k)}</b> · saldo <b className={'num' + (valorEm(leit.k) < 0 ? ' w' : '')}>{reais(valorEm(leit.k))}</b>
              {eventosMes(leit.k).length > 0 && ` · ${eventosMes(leit.k).map(ev => `${ev.nome} ${sinalValor(ev)}`).join(', ')}`}
            </>
          ) : 'Toque num mês da curva para ler o saldo e os eventos dele.'}
        </p>
      )}
      <p className="prosa"><Texto partes={prosaCurva(serie, a, saldoHoje, hoje, cenarioRotulo, !!d.previa)} /></p>
    </section>
  )
}

// ─── laboratório ──────────────────────────────────────────────────────────────
function tendencia(e: EfeitosLab, ref: EfeitosLab, k: 'min' | 'viagem'): string {
  const v = k === 'min' ? e.min : e.viagem?.saldo ?? 0
  const r = k === 'min' ? ref.min : ref.viagem?.saldo ?? 0
  return v < r - 0.5 ? 'w' : v > r + 0.5 ? 'ok' : ''
}

function Lab({ d, mob }: { d: PlanejamentoV5Data; mob: boolean }) {
  const lab = d.lab
  const hoje = d.hoje
  if (!lab) return null
  const ev = lab.evento
  const sel: OpcaoLab = d.labSel
  const e = lab.efeitos[sel]
  const ref = lab.efeitos.manter
  if (!e || !ref) return null
  const opc = lab.opcoes.find(o => o.id === sel)
  const meta = lab.meta
  const nome = ev.nome
  const rotuloSel = opc?.rotulo ?? ''
  const nMeses = Math.abs(e.deslocamento)

  const chegaNota = sel === 'manter'
    ? 'como planejado'
    : `${plural(nMeses, 'mês', 'meses')} ${e.deslocamento < 0 ? 'antes' : 'depois'} do planejado`

  const sobre: ParteTexto[] = [
    { t: sel === 'manter' ? 'Você mantém a data. ' : `${cap(nome)} sai ` },
    ...(sel === 'manter' ? [] : [{ t: `${plural(nMeses, 'mês', 'meses')} ${e.deslocamento < 0 ? 'antes' : 'depois'}`, b: true }, { t: '. ' }]),
    { t: 'O ponto mais baixo do ano ' }, { t: sel === 'manter' ? 'é ' : 'passa a ser ' },
    { t: reais(e.min), b: true, n: true, w: e.min < 0 }, { t: `, em ${nomeMes(hoje, e.iMin, true)}.` },
    ...(e.viagem ? [
      { t: ` Em ${nomeMes(hoje, e.viagem.i, true)}, na meta ` }, { t: e.viagem.nome },
      { t: ', o saldo fica em ' }, { t: reais(e.viagem.saldo), b: true, n: true, w: e.viagem.saldo < 0 },
      { t: '.' },
    ] : []),
    ...(e.foraDaJanela ? [{ t: ' Nessa data o gasto sai da janela de 12 meses.' }] : []),
  ]

  const mods = meta ? '01 · 08' : '01'
  const modsNomes = meta ? 'Finanças, Experiências' : 'Finanças'
  const head = (
    <>
      <p className="eyebrow">Uma escolha, mais de um efeito</p>
      <h2>{`Quando pagar ${nome}?`}</h2>
    </>
  )

  return (
    <>
      <div className="sec-head rv">
        {mob ? head : <div>{head}</div>}
        <p>Experimente antes de decidir. Nada é lançado.</p>
      </div>
      <section className="lab rv" aria-label={`Laboratório: data de ${nome}`}>
        <div className="perg">
          <p className="eyebrow"><b>{mods}</b> · {modsNomes}</p>
          <h3>{cap(nome)} de <span className="num">{reais(ev.valor)}</span>, planejado para <span className="num">{dataLonga(ev.data)}</span>.</h3>
          <p>
            Compare o ponto mais baixo do ano{meta ? `, o saldo na meta ${meta.nome}` : ''} e quando o gasto acontece.
            Nenhuma opção é a certa: a prioridade é sua.
          </p>
          <div className="opcoes" role="group" aria-label="Data do gasto">
            {lab.opcoes.map(o => (
              <button key={o.id} className="opc" type="button" aria-pressed={o.id === sel} onClick={() => d.setLabSel(o.id)}>
                <span>{o.rotulo}</span><span className="n num">{dataCurta(o.data)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="efei">
          <div className="et"><b>{rotuloSel}</b><span className="eyebrow">{mob ? 'Simulação' : 'Simulação · cenário realista'}</span></div>
          <div className="imp" aria-live="polite">
            <div>
              <label><b>01</b>Ponto mais baixo</label>
              <strong className={'num ' + tendencia(e, ref, 'min')}>{reais(e.min)}</strong>
              <small>{`em ${nomeMes(hoje, e.iMin, true)}${sel === 'manter' ? ' · como hoje' : ''}`}</small>
            </div>
            {e.viagem && ref.viagem && (
              <div>
                <label><b>08</b>{`Saldo na meta ${e.viagem.nome}`}</label>
                <strong className={'num ' + tendencia(e, ref, 'viagem')}>{reais(e.viagem.saldo)}</strong>
                <small>{`fim de ${nomeMes(hoje, e.viagem.i, true)}${sel !== 'manter' && Math.abs(e.viagem.saldo - ref.viagem.saldo) < 0.5 ? ' · igual' : ''}`}</small>
              </div>
            )}
            <div>
              <label>Quando acontece</label>
              <strong className="num">{dataCurta(e.chega)}</strong>
              <small>{chegaNota}</small>
            </div>
          </div>
          <div className="expl">
            <Sy40 />
            <p><Texto partes={sobre} /></p>
          </div>
          <details className="evid">
            <summary>De onde vêm esses efeitos?</summary>
            <p>
              {`As ${plural(lab.opcoes.length, 'curva sai', 'curvas saem')} da mesma projeção realista, com o evento ${nome} (`}
              <span className="num">{reais(ev.valor)}</span>
              {`) em ${lab.opcoes.map(o => dataLonga(o.data)).join(', ').replace(/, ([^,]*)$/, ' ou $1')}. `}
              {`Ponto mais baixo é o menor saldo de fim de mês entre ${nomeMes(hoje, 0, true)} e ${nomeMes(hoje, 12, true)}.`}
              {meta ? ` O saldo na meta é o de fim de ${nomeMesDe(meta.data, true)}, mês da meta ${meta.nome}.` : ''}
            </p>
            <p>
              {`Não modelado: parcelar o gasto, mudança de preço até a data, venda de algo que sai. Fontes: ${plural(d.fontes.eventos, 'evento planejado', 'eventos planejados')}, ${plural(d.fontes.recorrentes, 'recorrente ativa', 'recorrentes ativas')}, renda e gasto variáveis médios de ${d.fontes.janela}${meta ? `, meta ${meta.nome}` : ''}.`}
            </p>
          </details>
          <div className="aplicar">
            <button className="btn-sm roxo" type="button" onClick={d.aplicarPrevia}>Experimentar nesta projeção →</button>
            <span>Prévia local, com desfazer. O evento planejado não muda.</span>
          </div>
          <div className="recibo" role="status" hidden={!d.previa}>
            {d.previa && (
              <span><b>{rotuloSel}</b> entrou na prévia da curva e do número principal. O evento {nome} não mudou.</span>
            )}
            <button type="button" onClick={d.desfazerPrevia}>Desfazer</button>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── eventos ──────────────────────────────────────────────────────────────────
function Selos({ ev }: { ev: EventoLinha }) {
  return (
    <>
      {ev.confirmado && <span className="etq ok">Confirmado</span>}
      {ev.previa && <span className="etq prev">Prévia</span>}
      {ev.fora && <span className="etq">Fora dos 12 meses</span>}
    </>
  )
}

function Eventos({ d, mob, onNovo, onEditar }: Pick<ViewProps, 'd' | 'mob' | 'onNovo' | 'onEditar'>) {
  const linhas = d.eventos.flatMap((ev, idx) => {
    const y = ev.data.slice(0, 4)
    const out = []
    if (idx === 0 || y !== d.eventos[idx - 1].data.slice(0, 4)) {
      out.push(<p key={'a' + y} className="eyebrow ano-div">{y}</p>)
    }
    const sub = ev.categoria ? ev.categoria + (ev.nota ? ` · ${ev.nota}` : '') : ev.nota ?? ''
    const val = sinalValor(ev)
    const cls = 'evrow' + (ev.tipo === 'in' ? ' in' : '')
    const edita = () => { if (ev.original) onEditar(ev.original) }
    if (mob) {
      out.push(
        <div
          key={ev.id}
          className={cls}
          role="button"
          tabIndex={0}
          aria-label={`Editar ${ev.nome}, ${val}`}
          onClick={edita}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); edita() } }}
        >
          <span className="d num">{dataCurta(ev.data)}</span>
          <div className="nm">
            <strong>{ev.nome}</strong>
            {sub && <small>{sub}</small>}
            {(ev.confirmado || ev.previa || ev.fora) && <span className="sl"><Selos ev={ev} /></span>}
          </div>
          <span className="v num">{val}</span>
        </div>,
      )
    } else {
      out.push(
        <div key={ev.id} className={cls}>
          <span className="d num">{dataCurta(ev.data)}</span>
          <div className="nm"><strong>{ev.nome}</strong>{sub && <small>{sub}</small>}</div>
          <span className="st"><Selos ev={ev} /></span>
          <span className="v num">{val}</span>
          <span className="ac">
            {!ev.confirmado && <button className="btn-sm ghost" type="button" onClick={() => void d.confirmar(ev.id)}>Confirmar</button>}
            <button className="btn-sm ghost" type="button" onClick={edita}>Editar</button>
          </span>
        </div>,
      )
    }
    return out
  })

  return (
    <section className="eventos rv" id="eventos" aria-label="Eventos planejados">
      <div className="secao-head">
        <div><p className="eyebrow">{mob ? 'Eventos planejados' : 'Eventos planejados · próximos 12 meses'}</p></div>
        <button className="btn-sm ghost" type="button" onClick={onNovo}>+ Novo evento</button>
      </div>
      {mob && <p className="dica">Próximos 12 meses · toque num evento para editar, confirmar ou excluir.</p>}
      <div>
        {linhas}
        {d.eventos.length === 0 && (
          <div>
            <p className="vazio-l">Nada planejado para os próximos 12 meses. Comece pelo que já tem data: 13º, IPVA, uma viagem.</p>
            <button className="btn-sm roxo" type="button" onClick={onNovo}>Planejar um evento</button>
          </div>
        )}
      </div>
      <div className="lista-foot">
        <span>
          <b className="num">{d.eventos.length}</b>{` ${d.eventos.length === 1 ? 'evento' : 'eventos'} · entradas `}
          <b className="num ele">{`+${NBSP}${reais2(d.entradas)}`}</b>{' · saídas '}
          <b className="num">{`–${NBSP}${reais2(d.saidas)}`}</b>
        </span>
        <output aria-live="polite">{d.aviso}</output>
      </div>
    </section>
  )
}

// ─── a tela ───────────────────────────────────────────────────────────────────
export function PlanejamentoView({ d, mob, abrirCoach, onNovo, onEditar }: ViewProps) {
  const a = d.analise
  const hoje = d.hoje

  const cabeca = (
    <>
      {mob ? (
        <Link className="eyebrow" href="/financas"><b>01</b>{`${NBSP}· Finanças`}</Link>
      ) : (
        <div>
          <Link className="eyebrow" href="/financas"><b>01</b> · Finanças</Link>
          <h1>Planejamento · próximos 12 meses</h1>
        </div>
      )}
      {mob && <h1>Planejamento · próximos 12 meses</h1>}
      <div className="cenarios" role="group" aria-label="Cenário da projeção">
        {!mob && <span className="rot">Cenário</span>}
        {CENARIOS.map(c => (
          <button
            key={c.id}
            className={'chip' + (d.cenario === c.id ? ' on' : '')}
            type="button"
            aria-pressed={d.cenario === c.id}
            onClick={() => d.setCenario(c.id)}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
    </>
  )

  const principal = a ? (
    <>
      <div className="eb">
        <p className="eyebrow">{`Saldo em 6 meses · ${nomeMes(hoje, 6, !mob)}`}</p>
        {d.previa && <span className="pill-q prev">Prévia</span>}
      </div>
      <div className={'big num' + (a.s6 < 0 ? ' w' : '')}>{reais(a.s6)}</div>
      <p className="de"><Texto partes={textoDe(a, hoje)} /></p>
      <div className="mini">
        <div><strong className="num">{reais(d.saldoHoje)}</strong><span>saldo hoje</span></div>
        <div><strong className={'num' + (a.s12 < 0 ? ' w' : '')}>{reais(a.s12)}</strong><span>{`em 12 meses, ${nomeMes(hoje, 12, true)}`}</span></div>
      </div>
    </>
  ) : null

  const sy = a ? (
    <div className="sy">
      <Sy40 />
      <div>
        <p className="fala"><Texto partes={falaPlanejamento(a, hoje)} /></p>
        <p className="fontes">
          {d.fontes.atualizadoAs ? `Atualizado às ${d.fontes.atualizadoAs} · ` : ''}
          {`fontes: ${plural(d.fontes.eventos, 'evento planejado', 'eventos planejados')}, ${plural(d.fontes.recorrentes, 'recorrente ativa', 'recorrentes ativas')}, gastos de ${d.fontes.janela}`}
        </p>
        <button className="falar" type="button" onClick={() => abrirCoach('Sobre o planejamento dos próximos 12 meses: ')}>
          Falar com Sy sobre o planejamento →
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <header className="objeto boot b1">{cabeca}</header>

      {d.erro && (
        <p className="pl-erro" role="alert">
          Não deu para carregar a projeção. <button type="button" onClick={d.recarregar}>Tentar de novo</button>
        </p>
      )}

      {d.carregando || !a ? (
        <Esqueleto />
      ) : (
        <>
          <section className="principal boot b2" aria-label="Saldo projetado">
            {mob ? <>{principal}{sy}</> : <><div>{principal}</div>{sy}</>}
          </section>
          <Curva d={d} mob={mob} />
          <Lab d={d} mob={mob} />
          <Eventos d={d} mob={mob} onNovo={onNovo} onEditar={onEditar} />
        </>
      )}
    </>
  )
}
