'use client'

// Fase 2 · Transações v5: apresentação pura por props (teste de render por renderToString).
// Porte 1:1 de prototypes/v5/app/financas-transacoes.html (desktop) e .mobile.html (mobile,
// markup próprio): cabeçalho curto com o mês navegável → filtros em pílula → captura inline
// (só desktop; no mobile o Registrar abre o sheet) → lista densa com previstos no topo e os
// dias com subtotal (lista plana quando a ordem é por valor) → Carregar mais → total do MÊS
// INTEIRO. A moldura (chrome, faixa de subtelas, voltar, Sy) é do SubtelaV5.

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { brlInt, brl } from '@/lib/financas/hub'
import {
  ORDENS, PREVISTOS_VISIVEIS, agruparPorDia, ariaLinha, assinado, capitalizar, contagemTela, ctTxt, dataCurta,
  nomeMes, parseValor, maskValor, rotuloMes, somaLinhas, textoPrevistos, valorTxt,
  ordenaPorData, type FiltroTipo, type MesRef, type Ordem, type TotaisMes, type TxLinha,
} from '@/lib/financas/transacoes'
import type { RascunhoTx } from '@/components/app-v5/financas/TransacaoPainel'
import './transacoes-v5.css'

export interface CategoriaOpcao { id: string; name: string; type: 'income' | 'expense' }

export interface CapturaRapida { desc: string; valor: number; categoriaId: string; data: string }

export interface TransacoesViewProps {
  mob: boolean
  hoje: string
  mes: MesRef
  mesAtual: boolean
  podeAvancar: boolean
  onMes: (delta: -1 | 1) => void
  onHoje: () => void

  tipo: FiltroTipo
  onTipo: (t: FiltroTipo) => void
  categoriaId: string
  onCategoria: (id: string) => void
  q: string
  onQ: (s: string) => void
  ordem: Ordem
  onOrdem: (o: Ordem) => void
  filtrando: boolean
  categorias: CategoriaOpcao[]

  linhas: TxLinha[]
  previstos: TxLinha[]
  totalFiltrado: number
  temMais: boolean
  onMais: () => void
  totais: TotaisMes | null

  loading: boolean
  trocandoMes: boolean
  erro: boolean
  onRecarregar: () => void

  prevAberto: boolean
  onPrevAberto: (aberto: boolean) => void
  /** linha recém-registrada (realce de 1,8 s) */
  novaId: string | null

  onAbrir: (l: TxLinha) => void
  onCapturar: (c: CapturaRapida) => Promise<{ ok: boolean; msg: string }>
  onCapturaMais: (r: RascunhoTx) => void
  onFalar: (seed: string) => void
}

const SETA = {
  ant: <polyline points="15 5 8 12 15 19" />,
  prox: <polyline points="9 5 16 12 9 19" />,
}

function Chevron({ lado, tam }: { lado: 'ant' | 'prox'; tam: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SETA[lado]}
    </svg>
  )
}

function Selo({ t }: { t: string }) {
  return <span className="tag">{t}</span>
}

function Linha({ l, mob, nova, onAbrir }: { l: TxLinha; mob: boolean; nova: boolean; onAbrir: (l: TxLinha) => void }) {
  const cls = 'tx' + (l.tipo === 'in' ? ' in' : '') + (l.tipo === 'tr' ? ' tr' : '') + (l.previsto ? ' prev' : '') + (nova ? ' nova' : '')
  const v = <span className="v num">{valorTxt(l)}</span>
  const ct = <span className="ct">{ctTxt(l)}</span>
  return (
    <div
      className={cls} role="button" tabIndex={0} data-id={l.id} aria-label={ariaLinha(l)}
      onClick={() => onAbrir(l)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrir(l) } }}
    >
      <span className="d num">{dataCurta(l.date)}</span>
      <span className="ds">
        <span className="nm">{l.desc}</span>
        {l.tipo === 'tr' && <Selo t="Transf." />}
        {l.recorrente && <Selo t="Recorrente" />}
        {l.previsto && <Selo t="Previsto" />}
      </span>
      {mob ? <>{v}{ct}</> : <>{ct}{v}</>}
    </div>
  )
}

function Divisor({ rotulo, soma, temValor }: { rotulo: string; soma: number; temValor: boolean }) {
  return (
    <div className="dia">
      <p className="eyebrow">{rotulo}</p>
      <span className={soma > 0 ? 'st num in' : 'st num'}>{temValor ? assinado(soma) : ''}</span>
    </div>
  )
}

function Esqueleto() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="tx skel"><span className="d" /><span className="ds" /><span className="ct" /><span className="v" /></div>
      ))}
    </div>
  )
}

/** Captura inline do desktop: 1 linha, Enter registra. */
function CapturaInline({ hoje, categorias, vazio, onCapturar, onCapturaMais }: {
  hoje: string
  categorias: CategoriaOpcao[]
  vazio: boolean
  onCapturar: TransacoesViewProps['onCapturar']
  onCapturaMais: TransacoesViewProps['onCapturaMais']
}) {
  const despesas = categorias.filter(c => c.type === 'expense')
  const receitas = categorias.filter(c => c.type === 'income')
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [cat, setCat] = useState('')
  const [data, setData] = useState(hoje)
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const descRef = useRef<HTMLInputElement>(null)
  const valorRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  // a categoria padrão é a primeira de despesa; categorias chegam depois da montagem
  const catEf = categorias.some(c => c.id === cat) ? cat : (despesas[0] ?? categorias[0])?.id ?? ''

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const v = parseValor(valor)
    if (!desc.trim() || !v) { (desc.trim() ? valorRef : descRef).current?.focus(); return }
    if (!catEf || enviando) return
    setEnviando(true)
    const r = await onCapturar({ desc: desc.trim(), valor: v, categoriaId: catEf, data: data || hoje })
    setEnviando(false)
    if (r.ok) { setDesc(''); setValor(''); descRef.current?.focus() }
    setAviso(r.msg)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAviso(''), 2200)
  }

  return (
    <form className={vazio ? 'captura destaque boot b3' : 'captura boot b3'} id="tx-captura" aria-label="Registrar transação" autoComplete="off" onSubmit={enviar}>
      <input ref={descRef} id="tx-cap-desc" className="ck-note" name="desc" type="text" placeholder="Descrição" aria-label="Descrição" value={desc} onChange={e => setDesc(e.target.value)} />
      <input ref={valorRef} className="ck-note num" name="valor" type="text" inputMode="decimal" placeholder="0,00" aria-label="Valor em reais" value={valor} onChange={e => setValor(maskValor(e.target.value))} />
      <div className="sel">
        <select name="cat" aria-label="Categoria" value={catEf} onChange={e => setCat(e.target.value)} disabled={categorias.length === 0}>
          {despesas.length > 0 && <optgroup label="Despesas">{despesas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
          {receitas.length > 0 && <optgroup label="Receitas">{receitas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
        </select>
      </div>
      <input className="ck-note num" name="data" type="date" value={data} aria-label="Data" onChange={e => setData(e.target.value)} />
      <button className="btn-sm roxo" type="submit" disabled={enviando}>Registrar</button>
      <div className="cap-foot">
        <span>Enter registra · categoria de receita entra como entrada · data futura entra como prevista</span>
        <output aria-live="polite">{aviso}</output>
        <button className="link" type="button" onClick={() => onCapturaMais({ desc: desc.trim(), valor, categoriaId: catEf, data })}>
          Transferência, método e observações →
        </button>
      </div>
    </form>
  )
}

export function TransacoesView(p: TransacoesViewProps) {
  const { mob } = p
  const nome = nomeMes(p.mes)
  const listaRef = useRef<HTMLElement>(null)
  const antesDoMais = useRef<number | null>(null)

  // "Carregar mais": o foco vai para a primeira linha nova
  const qtd = p.linhas.length
  useEffect(() => {
    if (antesDoMais.current === null || qtd <= antesDoMais.current) return
    const novas = listaRef.current?.querySelectorAll<HTMLElement>('.grupo:not(.previstos) .tx')
    novas?.[antesDoMais.current]?.focus({ preventScroll: true })
    antesDoMais.current = null
  }, [qtd])

  const porData = ordenaPorData(p.ordem)
  const grupos = porData ? agruparPorDia(p.linhas, mob) : []
  const todosPrev = p.prevAberto || p.filtrando
  const prevVisiveis = todosPrev ? p.previstos : p.previstos.slice(0, PREVISTOS_VISIVEIS)
  const somaPrev = somaLinhas(p.previstos)
  const semNada = !p.loading && !p.erro && p.linhas.length === 0 && p.previstos.length === 0
  const vazioDoMes = semNada && !p.filtrando
  const t = p.totais

  const blocoPrev = p.previstos.length > 0 && (
    <div className="grupo previstos">
      <Divisor rotulo={`Previstos até o fim de ${nome}`} soma={somaPrev.soma} temValor={somaPrev.temValor} />
      {prevVisiveis.map(l => <Linha key={l.id} l={l} mob={mob} nova={false} onAbrir={p.onAbrir} />)}
      {p.previstos.length > PREVISTOS_VISIVEIS && !p.filtrando && (
        <button type="button" className="ver-prev" aria-expanded={p.prevAberto} onClick={() => p.onPrevAberto(!p.prevAberto)}>
          {textoPrevistos(p.previstos.length, p.prevAberto)}
        </button>
      )}
    </div>
  )

  const titulo = (
    <header className="titulo boot b1">
      <p className="eyebrow"><Link href="/financas"><b>01</b> · Finanças</Link></p>
      {mob ? (
        <>
          <h1 suppressHydrationWarning>Transações · {nome}</h1>
          <Sub p={p} />
          <Mesnav p={p} tam={13} />
        </>
      ) : (
        <>
          <div className="tline">
            <h1 suppressHydrationWarning>Transações · {nome}</h1>
            <Mesnav p={p} tam={12} />
          </div>
          <Sub p={p} />
        </>
      )}
    </header>
  )

  const chipsTipo = (
    <>
      {([['todas', 'Todas'], ['in', 'Entradas'], ['out', 'Saídas'], ['tr', 'Transferências'], ['rec', 'Recorrentes']] as const).map(([v, r]) => (
        <button key={v} className={p.tipo === v ? 'chip on' : 'chip'} type="button" aria-pressed={p.tipo === v} onClick={() => p.onTipo(v)}>{r}</button>
      ))}
    </>
  )
  const selOrdem = (
    <div className="sel">
      <select aria-label="Ordenar" value={p.ordem} onChange={e => p.onOrdem(e.target.value as Ordem)}>
        {ORDENS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
  const busca = (
    <label className="busca">
      <svg width={mob ? 15 : 14} height={mob ? 15 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" /></svg>
      <input type="search" placeholder="Buscar na descrição" aria-label="Buscar na descrição" value={p.q} onChange={e => p.onQ(e.target.value)} />
    </label>
  )

  const filtros = mob ? (
    <div className="boot b2">
      {busca}
      <div className="filtros" role="toolbar" aria-label="Filtros">
        {chipsTipo}
        <span className="sep" aria-hidden="true" />
        {selOrdem}
        <span className="sep" aria-hidden="true" />
        {p.categorias.map(c => (
          <button
            key={c.id} className={p.categoriaId === c.id ? 'chip on' : 'chip'} type="button" aria-pressed={p.categoriaId === c.id}
            onClick={() => p.onCategoria(p.categoriaId === c.id ? '' : c.id)}
          >{c.name}</button>
        ))}
      </div>
    </div>
  ) : (
    <div className="filtros boot b2" role="toolbar" aria-label="Filtros">
      {chipsTipo}
      <span className="sep" aria-hidden="true" />
      <div className="sel">
        <select aria-label="Categoria" value={p.categoriaId} onChange={e => p.onCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {p.categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {selOrdem}
      {busca}
    </div>
  )

  const corpoLista = (
    <>
      {p.erro && !p.loading && (
        <div className="erro" role="alert"><span>Não consegui carregar.</span><button type="button" onClick={p.onRecarregar}>Tentar de novo</button></div>
      )}
      {p.loading && <Esqueleto />}
      {!p.loading && !p.erro && (
        <>
          {porData ? (
            <>
              {p.ordem === 'recente' && blocoPrev}
              {grupos.map(g => (
                <div key={g.date} className="grupo" data-date={g.date}>
                  <Divisor rotulo={g.rotulo} soma={g.soma} temValor={g.temValor} />
                  {g.linhas.map(l => <Linha key={l.id} l={l} mob={mob} nova={l.id === p.novaId} onAbrir={p.onAbrir} />)}
                </div>
              ))}
              {p.ordem === 'antigo' && blocoPrev}
            </>
          ) : (
            <>
              {blocoPrev}
              <div className="grupo plano">
                {p.linhas.map(l => <Linha key={l.id} l={l} mob={mob} nova={l.id === p.novaId} onAbrir={p.onAbrir} />)}
              </div>
            </>
          )}
          {semNada && p.filtrando && <p className="sem-resultado">Nada com esse filtro.</p>}
          {vazioDoMes && (
            p.mesAtual ? (
              <p className="vazio">Nenhuma transação em {nome} ainda<small>{mob ? 'Toque em Registrar para lançar a primeira.' : 'Registre a primeira acima. Sy passa a ler o mês a partir dela.'}</small></p>
            ) : (
              <p className="vazio">Nenhuma transação em {nome}<small>Os previstos do mês, se houver, continuam no topo.</small></p>
            )
          )}
        </>
      )}
    </>
  )

  const lista = mob ? (
    <section className={'sec lista rv' + (p.trocandoMes ? ' trocando' : '')} id="tx-lista" aria-label="Transações" ref={listaRef}>{corpoLista}</section>
  ) : (
    <section className={'trans rv' + (p.trocandoMes ? ' trocando' : '')} id="tx-lista" aria-label="Transações" ref={listaRef}>{corpoLista}</section>
  )

  const na = <span className="num">{contagemTela(p.linhas.length, p.totalFiltrado)}</span>
  const saldoCls = t && t.saldo > 0 ? 'num ele' : 'num'
  const totalMes = t && (
    <>
      <span className="tot">
        {capitalizar(nome)} inteiro · Entradas <b className="num">+ {brl(t.entradas)}</b> · Saídas <b className="num">– {brl(t.saidas)}</b>
        {!mob && <> · Saldo <b className={saldoCls}>{assinado(t.saldo)}</b></>}
      </span>
      {mob && <span className="tot">Saldo do mês <b className={saldoCls}>{assinado(t.saldo)}</b></span>}
    </>
  )

  return (
    <>
      {titulo}
      {filtros}
      {!mob && (
        <CapturaInline hoje={p.hoje} categorias={p.categorias} vazio={vazioDoMes && p.mesAtual} onCapturar={p.onCapturar} onCapturaMais={p.onCapturaMais} />
      )}
      {lista}
      {p.temMais && !p.loading && (
        <div className="mais-wrap">
          <button className="btn-sm ghost" type="button" onClick={() => { antesDoMais.current = p.linhas.length; p.onMais() }}>Carregar mais</button>
        </div>
      )}
      <div className="lista-foot rv">
        {mob ? <>{totalMes}<span>{na} na tela</span></> : <><span>{na} na tela</span>{totalMes}</>}
      </div>
      <div className="pergunte rv">
        <button className="falar" type="button" onClick={() => p.onFalar('Sobre estas transações: ')}>Perguntar sobre estas transações →</button>
      </div>
    </>
  )
}

function Sub({ p }: { p: TransacoesViewProps }) {
  const t = p.totais
  if (!t) return <p className="sub">Somando o mês</p>
  if (t.quantidade === 0) return <p className="sub">Sem lançamentos em {nomeMes(p.mes)}</p>
  return (
    <p className="sub">
      <span className="num">{t.quantidade}</span> {t.quantidade === 1 ? 'transação' : 'transações'} em {nomeMes(p.mes)} · entradas <span className="num">{brlInt(t.entradas)}</span> · saídas <span className="num">{brlInt(t.saidas)}</span>
    </p>
  )
}

function Mesnav({ p, tam }: { p: TransacoesViewProps; tam: number }) {
  return (
    <div className="mesnav" role="group" aria-label="Mês">
      <button className="mn" type="button" aria-label="Mês anterior" onClick={() => p.onMes(-1)}><Chevron lado="ant" tam={tam} /></button>
      <span className="ml" aria-live="polite" suppressHydrationWarning>{rotuloMes(p.mes)}</span>
      <button className="mn" type="button" aria-label="Próximo mês" disabled={!p.podeAvancar} onClick={() => p.onMes(1)}><Chevron lado="prox" tam={tam} /></button>
      {!p.mesAtual && <button className="hoje" type="button" onClick={p.onHoje}>Voltar para hoje</button>}
    </div>
  )
}
