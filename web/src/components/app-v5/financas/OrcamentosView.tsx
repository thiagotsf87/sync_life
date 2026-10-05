'use client'

// Fase 2 · Orçamentos (T2 com barras), apresentação pura por props. Porte 1:1 de
// prototypes/v5/app/financas-orcamentos.html (desktop) e financas-orcamentos.mobile.html (mobile,
// markup próprio). Desktop: título + mês, Sy em 1 linha, números hairline, filtros, captura inline,
// envelopes, fora de envelope, 50-30-20, laboratório do teto. Mobile: mesma ordem, sem captura
// inline (a captura é o sheet), filtros em scroll-x. Nenhum estado de dados aqui: o container
// (OrcamentosV5) injeta tudo, o que permite testar por renderToString.

import { useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { Sy40 } from '@/components/app-v5/Sy40'
import { Painel } from '@/components/app-v5/Painel'
import { Confirma } from '@/components/app-v5/Confirma'
import type { EnvelopeV5, FormEnvelope, OrcamentosV5Data } from '@/hooks/use-orcamentos-v5'
import { brl, brlInt, type ParteFala } from '@/lib/financas/hub'
import {
  copiaLab, estadoEnvelope, limiteEfetivo, passaFiltro, parseValor, pctEnvelope, regra5030, subEnvelope,
  totaisOrcamento, valorCampo, type EfeitosLab, type EntradaLab, type FiltroEnvelope,
} from '@/lib/financas/orcamentos'

const NBSP = ' '

function Partes({ partes }: { partes: ParteFala[] }) {
  return (
    <>
      {partes.map((p, i) => (p.b ? <b key={i} className={p.w ? 'num w' : 'num'}>{p.t}</b> : <span key={i}>{p.t}</span>))}
    </>
  )
}

/** copy do laboratório: negrito sem a classe .num (como o <b> do protótipo) */
function PartesCopia({ partes }: { partes: ParteFala[] }) {
  return <>{partes.map((p, i) => (p.b ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}</>
}

// ─── tipos da tela ───────────────────────────────────────────────────────────

export interface CapturaInline { catId: string; limite: string; alerta: string }

export interface LabVista {
  envNome: string
  tetoAtual: number
  opcoes: number[]
  sel: number
  entrada: EntradaLab
  efeitos: EfeitosLab
  /** teto aplicado na prévia (null = nada aplicado) */
  previa: number | null
}

export interface OrcamentosViewProps {
  d: OrcamentosV5Data
  /** envelopes já com a prévia do laboratório aplicada */
  envs: EnvelopeV5[]
  mob: boolean
  filtro: FiltroEnvelope
  onFiltro: (f: FiltroEnvelope) => void
  previaId: string | null
  fala: ParteFala[]
  fontes: string
  aviso: string
  destaqueId: string | null
  /** ref callback do campo de limite da captura inline (o container guarda o elemento) */
  aoMontarLimite?: (el: HTMLInputElement | null) => void
  captura: CapturaInline
  onCaptura: (p: Partial<CapturaInline>) => void
  onCriarInline: (e: FormEvent<HTMLFormElement>) => void
  onAbrir: (id: string) => void
  onNovo: (catId?: string) => void
  onFalar: (seed: string) => void
  regraVisivel: boolean
  onDispensarRegra: () => void
  desmarcados: Set<string>
  onToggleCopia: (id: string) => void
  onCopiar: () => void
  copiando: boolean
  lab: LabVista | null
  onTeto: (t: number) => void
  onAplicar: () => void
  onDesfazer: () => void
}

const ALERTAS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

// ─── peças ───────────────────────────────────────────────────────────────────

function SyTopo({ p }: { p: OrcamentosViewProps }) {
  const { d } = p
  return (
    <div className="sy">
      <Sy40 />
      <div>
        {d.loading ? (
          <div aria-hidden="true"><span className="sk l1" /><span className="sk l2" /></div>
        ) : (
          <>
            <p className="fala"><Partes partes={p.fala} /></p>
            <p className="fontes" suppressHydrationWarning>Atualizado às {d.atualizadoAs} · fontes: {p.fontes}</p>
          </>
        )}
        <button className="falar" type="button" onClick={() => p.onFalar(`Sobre os orçamentos de ${d.mesNome}: `)}>
          Falar com Sy sobre os orçamentos →
        </button>
      </div>
    </div>
  )
}

function MesNav({ p }: { p: OrcamentosViewProps }) {
  const { d } = p
  return (
    <div>
      <div className="mes" role="group" aria-label="Mês">
        <button type="button" onClick={() => d.irMes(-1)} aria-label={`Mês anterior, ${d.mesAntNome}`}>‹</button>
        <span className="num" suppressHydrationWarning>{d.mesNome} de {d.ano}</span>
        <button type="button" onClick={() => d.irMes(1)} aria-label={`Próximo mês, ${d.mesProxNome}`}>›</button>
      </div>
      <output className="mes-out" aria-live="polite">{p.aviso}</output>
    </div>
  )
}

function Numeros({ p }: { p: OrcamentosViewProps }) {
  const { d, envs } = p
  const t = totaisOrcamento(envs, d.receitas)
  const semReceita = d.receitas <= 0
  const livreNeg = !semReceita && t.naoAlocado < 0
  return (
    <section className="lnums boot b2" aria-label="Números do mês">
      <div>
        <p className="eyebrow">Orçado</p>
        <div className="v num">{brlInt(t.orcado)}</div>
        <div className="d"><span className="num">{t.qtd}</span> {t.qtd === 1 ? 'envelope' : 'envelopes'}{p.previaId ? ' · prévia' : ''}</div>
      </div>
      <div>
        <p className="eyebrow">Gasto</p>
        <div className="v num">{brlInt(t.gasto)}</div>
        <div className="d"><span className="num">{t.pctGasto}%</span> do orçado</div>
      </div>
      <div>
        <p className="eyebrow">Disponível</p>
        <div className="v num">{brlInt(t.disponivel)}</div>
        <div className="d">
          {d.dias > 0 ? <><span className="num">{d.dias}</span> {d.dias === 1 ? 'dia' : 'dias'} até o fim do mês</> : 'mês encerrado'}
        </div>
      </div>
      <div>
        <p className="eyebrow">Não alocado</p>
        <div className={livreNeg ? 'v num w' : 'v num'}>{semReceita ? '–' : brlInt(t.naoAlocado)}</div>
        <div className="d">
          {semReceita
            ? `Sem receitas realizadas em ${d.mesNome}`
            : livreNeg
              ? 'Orçamento maior que a renda'
              : <>receitas de <span className="num">{brlInt(d.receitas)}</span> menos o orçado</>}
        </div>
      </div>
    </section>
  )
}

function Filtros({ p }: { p: OrcamentosViewProps }) {
  const t = totaisOrcamento(p.envs, 0)
  const itens: { f: FiltroEnvelope; rotulo: string; n: number }[] = [
    { f: 'todos', rotulo: 'Todos', n: t.qtd },
    { f: 'atencao', rotulo: 'Pedem atenção', n: t.qtdAtencao },
    { f: 'ok', rotulo: 'Dentro do alerta', n: t.qtdOk },
  ]
  return (
    <div className="filtros boot b3" role="toolbar" aria-label="Filtros">
      {itens.map(i => (
        <button
          key={i.f}
          className={p.filtro === i.f ? 'chip on' : 'chip'}
          type="button"
          aria-pressed={p.filtro === i.f}
          onClick={() => p.onFiltro(i.f)}
        >
          {i.rotulo} <span className="n num">{i.n}</span>
        </button>
      ))}
    </div>
  )
}

function CapturaDesktop({ p }: { p: OrcamentosViewProps }) {
  const { d, captura, aoMontarLimite, onCriarInline, onCaptura } = p
  const semLivre = d.categoriasLivres.length === 0
  return (
    <form className="captura boot b3" onSubmit={onCriarInline} aria-label="Criar envelope" autoComplete="off">
      <div className="sel">
        <select
          aria-label="Categoria sem envelope"
          value={captura.catId}
          disabled={semLivre}
          onChange={e => onCaptura({ catId: e.target.value })}
        >
          {semLivre && <option value="">Sem categoria livre</option>}
          {d.categoriasLivres.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>
      <input
        ref={aoMontarLimite}
        className="ck-note num"
        type="text"
        inputMode="decimal"
        placeholder="Limite 0,00"
        aria-label="Limite mensal em reais"
        value={captura.limite}
        onChange={e => onCaptura({ limite: e.target.value })}
        disabled={semLivre}
        required
      />
      <div className="sel">
        <select aria-label="Alerta em" value={captura.alerta} onChange={e => onCaptura({ alerta: e.target.value })}>
          {ALERTAS.map(a => <option key={a} value={String(a)}>Alerta em {a}%</option>)}
        </select>
      </div>
      <button className="btn-sm roxo" type="submit" disabled={semLivre}>Criar envelope</button>
      <div className="cap-foot">
        <span>Só categorias de despesa sem envelope em {d.mesNome} · Enter cria</span>
      </div>
    </form>
  )
}

function Linha({ e, p }: { e: EnvelopeV5; p: OrcamentosViewProps }) {
  const st = estadoEnvelope(e)
  const pct = pctEnvelope(e)
  const lim = limiteEfetivo(e)
  const ab = (ev: KeyboardEvent<HTMLDivElement>) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === ev.currentTarget) {
      ev.preventDefault()
      p.onAbrir(e.id)
    }
  }
  const classe = ['orc', st !== 'ok' ? 'warn' : '', p.destaqueId === e.id ? 'nova' : ''].filter(Boolean).join(' ')
  const estilo = { '--w': `${Math.min(100, pct)}%`, '--a': `${e.alerta}%` } as CSSProperties
  return (
    <div
      className={classe}
      role="button"
      tabIndex={0}
      data-cat={e.categoria}
      style={estilo}
      aria-label={`Editar envelope ${e.categoria}, ${brl(e.gasto).replace(NBSP, ' ')} de ${brl(lim).replace(NBSP, ' ')}`}
      onClick={() => p.onAbrir(e.id)}
      onKeyDown={ab}
    >
      <span className="nm">
        {e.categoria}
        {st === 'estourado' && <> <span className="tag estourado">Estourado</span></>}
        {st === 'atencao' && <> <span className="tag warn">Atenção</span></>}
        {e.sobra > 0 && <> <span className="tag roll">Rollover + {brlInt(e.sobra)}</span></>}
        {p.previaId === e.id && <> <span className="tag prev">Prévia</span></>}
      </span>
      <span className="v num"><b>{brl(e.gasto)}</b> de {brl(lim)}</span>
      <div className="barra">
        <div className="track"><i /></div>
        <span className="marca" title={`Alerta em ${e.alerta}%`} />
      </div>
      <span className="sub num">{subEnvelope(e, p.d.dias)}</span>
    </div>
  )
}

function MesVazio({ p }: { p: OrcamentosViewProps }) {
  const { d } = p
  const marcados = d.anteriores.filter(a => !p.desmarcados.has(a.id))
  return (
    <div className="vazio">
      <p className="t">
        Nenhum envelope em {d.mesNome} ainda
        <small>
          {d.anteriores.length > 0
            ? `Copie os de ${d.mesAntNome} e ajuste depois, ou crie o primeiro${p.mob ? ' em Registrar' : ' na captura'}. Sy passa a comparar gasto e teto a partir dele.`
            : `Crie o primeiro${p.mob ? ' em Registrar' : ' na captura'}. Sy passa a comparar gasto e teto a partir dele.`}
        </small>
      </p>
      {d.anteriores.length > 0 && (
        <>
          <div className="copia">
            {d.anteriores.map(a => (
              <label key={a.id}>
                <input type="checkbox" checked={!p.desmarcados.has(a.id)} onChange={() => p.onToggleCopia(a.id)} />
                <span>{a.categoria}</span>
                <span className="num">{brlInt(a.limite)}</span>
              </label>
            ))}
          </div>
          <div className="copia-acts">
            <button className="btn-sm roxo" type="button" disabled={marcados.length === 0 || p.copiando} onClick={p.onCopiar}>
              Copiar {marcados.length} {marcados.length === 1 ? 'envelope' : 'envelopes'}
            </button>
            <span>Copia o limite base, o alerta e o rollover. Sobra não se copia.</span>
          </div>
        </>
      )}
    </div>
  )
}

function Envelopes({ p }: { p: OrcamentosViewProps }) {
  const { d, envs } = p
  const t = totaisOrcamento(envs, d.receitas)
  const visiveis = envs.filter(e => passaFiltro(e, p.filtro))

  if (d.loading) {
    return (
      <div className="sk-rows" aria-hidden="true">
        <div className="sk-row" /><div className="sk-row" /><div className="sk-row" /><div className="sk-row" />
      </div>
    )
  }
  if (d.erro) {
    return (
      <div className="erro" role="alert">
        <span>Não consegui carregar os envelopes.</span>
        <button type="button" onClick={d.tentarDeNovo}>Tentar de novo</button>
      </div>
    )
  }
  if (envs.length === 0) return <MesVazio p={p} />

  return (
    <>
      <div id="lista">
        {visiveis.map(e => <Linha key={e.id} e={e} p={p} />)}
      </div>
      {visiveis.length === 0 && <p className="sem-resultado">Nenhum envelope com esse filtro.</p>}
      <div className="envs-foot">
        <span><span className="num">{t.qtd} {t.qtd === 1 ? 'envelope' : 'envelopes'}</span> · a marca na barra é o alerta{p.mob ? '' : ' de cada um'}</span>
        <span>
          Gasto <b className="num">{brl(t.gasto)}</b> de <b className="num">{brl(t.orcado)}</b>
          {p.mob ? null : <> · disponível <b className="num">{brl(t.disponivel)}</b></>}
        </span>
        {p.mob && <span>Disponível <b className="num">{brl(t.disponivel)}</b></span>}
      </div>
    </>
  )
}

function Quietas({ p }: { p: OrcamentosViewProps }) {
  const { d } = p
  const base = d.receitas > 0 ? d.receitas : d.rendaPerfil
  const r = regra5030(base)
  const fora = d.fora.slice(0, 4)
  return (
    <>
      {fora.length > 0 && !d.loading && !d.erro && (
        <p className="quieta" id="fora">
          <span>
            Fora de envelope em {d.mesNome}:{' '}
            {fora.map((g, i) => (
              <span key={g.categoriaId}>{i > 0 && ' · '}{g.nome} <b className="num">{brl(g.valor)}</b></span>
            ))}
            {d.fora.length > fora.length && ` · e mais ${d.fora.length - fora.length}`}
          </span>
          <button className="lk" type="button" onClick={() => p.onNovo(fora[0].categoriaId)}>
            Criar envelope para {fora[0].nome} →
          </button>
        </p>
      )}
      {p.regraVisivel && base > 0 && !d.loading && !d.erro && (
        <p className="quieta" id="regra">
          <span>
            Referência 50-30-20 sobre a renda de <b className="num">{brlInt(base)}</b>: necessidades{' '}
            <b className="num">{brlInt(r.necessidades)}</b> · desejos <b className="num">{brlInt(r.desejos)}</b> · poupança{' '}
            <b className="num">{brlInt(r.poupanca)}</b>
          </span>
          <button className="lk" type="button" onClick={p.onDispensarRegra}>Dispensar</button>
        </p>
      )}
    </>
  )
}

// ─── laboratório do teto ─────────────────────────────────────────────────────

function LaboratorioTeto({ p, lab }: { p: OrcamentosViewProps; lab: LabVista }) {
  const { entrada: en, efeitos: x } = lab
  const aplicarRef = useRef<HTMLButtonElement>(null)
  const d = p.d
  const meta = en.meta
  const restoAtual = en.tetoAtual + en.sobra - en.gasto
  const diasTxt = en.dias > 0 ? `para ${en.dias} ${en.dias === 1 ? 'dia' : 'dias'}` : 'no mês'
  const copia = copiaLab(en, x, lab.envNome)
  const desfazer = () => {
    p.onDesfazer()
    aplicarRef.current?.focus()
  }
  return (
    <>
      <div className="sec-head rv">
        <div>
          <p className="eyebrow">Uma escolha, mais de um efeito</p>
          <h2>E se o teto de {lab.envNome} fosse outro?</h2>
        </div>
        <p>Experimente antes de decidir. Nada é lançado.</p>
      </div>
      <section className="lab rv" aria-label={`Laboratório do teto de ${lab.envNome}`}>
        <div className="perg">
          <p className="eyebrow"><b>{meta ? '01 · 02' : '01'}</b> · {meta ? 'Finanças, Futuro' : 'Finanças'}</p>
          <h3>
            {restoAtual >= 0
              ? <>{lab.envNome} tem <span className="num">{brlInt(restoAtual)}</span> {diasTxt}, com teto de <span className="num">{brlInt(en.tetoAtual)}</span>.</>
              : <>{lab.envNome} passou <span className="num">{brlInt(-restoAtual)}</span> do teto de <span className="num">{brlInt(en.tetoAtual)}</span>.</>}
          </h3>
          <p>Subir o teto alivia o mês e sai do que sobraria. Nenhuma opção é a certa: a prioridade é sua.</p>
          <div className="opcoes" role="group" aria-label={`Teto de ${lab.envNome}`}>
            {lab.opcoes.map(t => (
              <button key={t} className="opc" type="button" aria-pressed={t === lab.sel} onClick={() => p.onTeto(t)}>
                <span>{t === lab.tetoAtual ? 'Manter' : 'Subir para'} <span className="num">{brlInt(t)}</span></span>
                <span className="n num">{t === lab.tetoAtual ? 'atual' : `+ ${brlInt(t - lab.tetoAtual)}`}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="efei">
          <div className="et">
            <b>{x.delta ? 'Subir para ' : 'Manter '}<span className="num">{brlInt(lab.sel)}</span></b>
            <span className="eyebrow">Simulação</span>
          </div>
          <div className="imp" aria-live="polite">
            {x.fechamento !== null && (
              <div>
                <label><b>01</b>Fechamento projetado</label>
                <strong className={x.delta ? 'num w' : 'num'}>{brlInt(x.fechamento)}</strong>
                <small>{x.delta ? `– ${brlInt(x.delta)} no fechamento` : 'igual ao de hoje'}</small>
              </div>
            )}
            {x.poupancaPct !== null && (
              <div>
                <label><b>01</b>Poupança do mês</label>
                <strong className={x.delta ? 'num w' : 'num'}>{x.poupancaPct}%</strong>
                <small>{brlInt(x.poupado)} poupados das receitas</small>
              </div>
            )}
            {meta && x.aporteExtra !== null && (
              <div>
                <label><b>02</b>Para antecipar {meta.nome}</label>
                <strong className="num ok">{brlInt(x.aporteExtra)}</strong>
                <small>
                  {x.delta ? `– ${brlInt(x.delta)} para a meta · ` : ''}
                  {meta.aporteFixo > 0 ? `além do aporte fixo de ${brlInt(meta.aporteFixo)}` : 'o que sobra do mês'}
                </small>
              </div>
            )}
          </div>
          <div className="expl">
            <Sy40 />
            <p><PartesCopia partes={copia} /></p>
          </div>
          <details className="evid">
            <summary>De onde vêm esses efeitos?</summary>
            <p>
              O teto não muda o que já saiu (<span className="num">{brlInt(en.gasto)}</span> em {lab.envNome}); muda quanto o mês ainda deixa
              sair, supondo que você use o teto inteiro. Cada <span className="num">R$ 1</span> a mais no teto sai
              {en.fechamentoBase !== null && <> do fechamento projetado (<span className="num">{brlInt(en.fechamentoBase)}</span>)</>}
              {en.receitas > 0 && <>{en.fechamentoBase !== null ? ',' : ''} do que fica poupado (<span className="num">{brlInt(en.saldoMes)}</span>,{' '}
                <span className="num">{Math.round((en.saldoMes / en.receitas) * 100)}%</span> das receitas de <span className="num">{brlInt(en.receitas)}</span>)</>}
              {meta && <> e do que sobra para a meta {meta.nome}, que está em <span className="num">{brlInt(meta.atual)}</span> de{' '}
                <span className="num">{brlInt(meta.alvo)}</span>{meta.aporteFixo > 0 && <>, com aporte fixo de <span className="num">{brlInt(meta.aporteFixo)}</span></>}</>}.
            </p>
            <p>
              Fontes: orçamento {lab.envNome}, {d.txCount} {d.txCount === 1 ? 'transação' : 'transações'} de {d.mesNome}
              {en.fechamentoBase !== null ? ', projeção do mês' : ''}{meta ? `, meta ${meta.nome}` : ''}.
            </p>
          </details>
          <div className="aplicar">
            <button className="btn-sm roxo" type="button" ref={aplicarRef} onClick={p.onAplicar}>Experimentar nesta tela →</button>
            <span>Prévia local, com desfazer. O envelope de {lab.envNome} não muda.</span>
          </div>
          <div className="recibo" role="status" hidden={lab.previa === null}>
            {lab.previa !== null && (
              <span>
                {x.delta
                  ? <><b>Teto de {brlInt(lab.previa)}</b> entrou na prévia: veja a linha de {lab.envNome} e os números do topo. O envelope não foi alterado.</>
                  : <><b>Manter {brlInt(lab.previa)}</b>: nada muda na tela.</>}
              </span>
            )}
            <button type="button" onClick={desfazer}>Desfazer</button>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── a tela ──────────────────────────────────────────────────────────────────

export function OrcamentosView(p: OrcamentosViewProps) {
  const { d, mob } = p
  const cabeca = (
    <>
      <p className="eyebrow"><Link href="/financas"><b>01</b>{NBSP}· Finanças</Link></p>
    </>
  )
  return (
    <>
      {mob ? (
        <header className="titulo boot b1">
          {cabeca}
          <h1 suppressHydrationWarning>Orçamentos · {d.mesNome}</h1>
          <MesNav p={p} />
          <SyTopo p={p} />
        </header>
      ) : (
        <header className="titulo boot b1">
          <div className="cabrow">
            <div>
              {cabeca}
              <h1 suppressHydrationWarning>Orçamentos · {d.mesNome}</h1>
            </div>
            <MesNav p={p} />
          </div>
          <SyTopo p={p} />
        </header>
      )}

      {!d.loading && !d.erro && <Numeros p={p} />}
      {!d.loading && !d.erro && p.envs.length > 0 && <Filtros p={p} />}
      {!mob && !d.loading && !d.erro && <CapturaDesktop p={p} />}

      <section className="envs rv" id="envs" aria-label={`Envelopes de ${d.mesNome}`}>
        <Envelopes p={p} />
        <Quietas p={p} />
      </section>

      {p.lab && !d.loading && !d.erro && <LaboratorioTeto p={p} lab={p.lab} />}
    </>
  )
}

// ─── painel de captura / edição ──────────────────────────────────────────────

export interface PainelEnvelopeProps {
  open: boolean
  /** muda a cada abertura: zera o formulário sem remontar (a animação do painel continua) */
  abertura: number
  modo: 'novo' | 'editar'
  /** envelope em edição (snapshot do momento da abertura) */
  env: EnvelopeV5 | null
  catInicial: string
  categoriasLivres: { id: string; nome: string }[]
  mesNome: string
  mesAntNome: string
  mesProxNome: string
  mob: boolean
  onClose: () => void
  onSalvar: (catId: string, f: FormEnvelope) => Promise<void>
  onExcluir: () => Promise<void>
}

export function PainelEnvelope(p: PainelEnvelopeProps) {
  const [chave, setChave] = useState(p.abertura)
  const [catId, setCatId] = useState(p.catInicial)
  const [limite, setLimite] = useState(p.env ? valorCampo(p.env.limiteBase) : '')
  const [alerta, setAlerta] = useState(String(p.env?.alerta ?? 80))
  const [rollover, setRollover] = useState(p.env?.rollover ?? false)
  const [notas, setNotas] = useState(p.env?.notas ?? '')
  const [confirmando, setConfirmando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const limiteRef = useRef<HTMLInputElement>(null)

  // zera o formulário a cada abertura (padrão "ajustar estado durante o render")
  if (chave !== p.abertura) {
    setChave(p.abertura)
    setCatId(p.catInicial)
    setLimite(p.env ? valorCampo(p.env.limiteBase) : '')
    setAlerta(String(p.env?.alerta ?? 80))
    setRollover(p.env?.rollover ?? false)
    setNotas(p.env?.notas ?? '')
    setConfirmando(false)
    setSalvando(false)
    setErro('')
  }

  const editar = p.modo === 'editar' && p.env !== null
  const env = p.env
  const sobra = env?.sobra ?? 0
  const limiteNum = parseValor(limite)
  const semLivre = !editar && p.categoriasLivres.length === 0

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (!limiteNum) {
      limiteRef.current?.focus()
      return
    }
    if (!editar && !catId) return
    setSalvando(true)
    setErro('')
    try {
      await p.onSalvar(catId, { limite: limiteNum, alerta: Number(alerta), rollover, notas })
    } catch {
      setErro('Não consegui salvar. Tente de novo.')
      setSalvando(false)
    }
  }

  async function excluir() {
    setSalvando(true)
    setErro('')
    try {
      await p.onExcluir()
    } catch {
      setErro('Não consegui excluir. Tente de novo.')
      setConfirmando(false)
      setSalvando(false)
    }
  }

  const hint = rollover
    ? `O que sobrar em ${p.mesNome} soma ao limite de ${p.mesProxNome}.`
    : `O que sobrar em ${p.mesNome} não passa para ${p.mesProxNome}.`

  return (
    <Painel
      open={p.open}
      onClose={p.onClose}
      eyebrow={`01 · Envelope de ${p.mesNome}`}
      titulo={editar && env ? env.categoria : 'Novo envelope'}
      idTitulo="orc-painel-titulo"
      rodape={
        <>
          {confirmando && env && (
            <Confirma rotuloSim="Excluir" onSim={excluir} onNao={() => setConfirmando(false)}>
              Excluir o envelope <b>{env.categoria}</b>? Os gastos continuam em Transações; só o teto some. Não dá para desfazer.
            </Confirma>
          )}
          <output aria-live="polite">{erro}</output>
          <div className="acts">
            {editar && (
              <button className="btn-sm ghost perigo" type="button" disabled={salvando} onClick={() => setConfirmando(true)}>Excluir</button>
            )}
            <button className="btn-sm roxo" type="submit" form="orc-pform" disabled={salvando || semLivre}>
              {editar ? 'Salvar' : 'Criar envelope'}
            </button>
          </div>
        </>
      }
    >
      <form id="orc-pform" className="orc-painel" onSubmit={enviar} autoComplete="off">
        {editar && env ? (
          <div className="f">
            <span className="eyebrow">Categoria</span>
            <p className="trava"><span>{env.categoria}</span><small>Fixa depois de criada. Para trocar, exclua e crie outro envelope.</small></p>
          </div>
        ) : (
          <div className="f">
            <label className="eyebrow" htmlFor="orc-p-cat">Categoria sem envelope</label>
            <div className="sel">
              <select id="orc-p-cat" value={catId} disabled={semLivre} onChange={e => setCatId(e.target.value)}>
                {semLivre && <option value="">Sem categoria livre</option>}
                {p.categoriasLivres.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            {semLivre && <p className="hint">Todas as categorias de despesa já têm envelope em {p.mesNome}.</p>}
          </div>
        )}
        <div className="f2">
          <div className="f">
            <label className="eyebrow" htmlFor="orc-p-limite">{editar ? 'Limite base' : 'Limite mensal'}</label>
            <input
              ref={limiteRef}
              id="orc-p-limite"
              className="ck-note num"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={limite}
              onChange={e => setLimite(e.target.value)}
              required
            />
          </div>
          <div className="f">
            <label className="eyebrow" htmlFor="orc-p-alerta">Alerta em</label>
            <div className="sel">
              <select id="orc-p-alerta" value={alerta} onChange={e => setAlerta(e.target.value)}>
                {ALERTAS.map(a => <option key={a} value={String(a)}>{a}%</option>)}
              </select>
            </div>
          </div>
        </div>
        {editar && env && (
          <div className="base" aria-live="polite">
            <div><span>Sobra de {p.mesAntNome}</span><b className={sobra ? 'num ele' : 'num'}>{sobra ? `+ ${brl(sobra)}` : 'nenhuma'}</b></div>
            <div><span>Limite em {p.mesNome}</span><b className="num">{brl(limiteNum + sobra)}</b></div>
            <div><span>Gasto em {p.mesNome}</span><b className="num">{brl(env.gasto)}</b></div>
          </div>
        )}
        <div className="f">
          <span className="eyebrow">Rollover</span>
          <div className="tipo" role="group" aria-label="Rollover">
            <button className={rollover ? 'chip' : 'chip on'} type="button" aria-pressed={!rollover} onClick={() => setRollover(false)}>
              {p.mob ? 'Não levar' : 'Não levar a sobra'}
            </button>
            <button className={rollover ? 'chip on' : 'chip'} type="button" aria-pressed={rollover} onClick={() => setRollover(true)}>
              {p.mob ? 'Levar a sobra' : `Levar para ${p.mesProxNome}`}
            </button>
          </div>
          <p className="hint">{hint}</p>
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="orc-p-obs">Observações</label>
          <textarea id="orc-p-obs" className="ck-note" rows={3} placeholder="Opcional" value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </form>
    </Painel>
  )
}
