'use client'

// Fase 2 · Calendário (T3, grade mensal). Apresentação pura por props: porte 1:1 do corpo de
// prototypes/v5/app/financas-calendario.html (desktop) e financas-calendario.mobile.html (mobile
// dedicado, markup próprio). Estrutura: cabeçalho do objeto com ‹ mês › e Hoje → números do mês em
// linha → grade dom a sáb (pontos por forma, saldo do dia, saldo da semana) → dia selecionado
// (painel ao lado no desktop, lista abaixo da grade no mobile). A moldura (chrome, faixa,
// voltar/subbar, camada) vem de SubtelaV5; os painéis de captura, evento e provento, do container.

import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import {
  DOW_CURTO_DESK, DOW_CURTO_MOB, agruparPorDia, ariaCelula, assinadoBrl, brlAbs, brlInteiro, capitalizar, classePonto,
  curtoDesk, curtoMob, diaDoMes, diasNoMes, entra, isoDoDia, nomeDiaSemana, numerosDoMes, pontosDoDia, saldoAcumulado,
  semanasDoMes, somaDia, subItem, valorItem, type ItemCal, type ModoMes,
} from '@/lib/financas/calendario'
import { nomeMes, rotuloMes, type MesRef } from '@/lib/financas/transacoes'

export interface CalendarioViewProps {
  mob: boolean
  hoje: string
  mes: MesRef
  onMes: (delta: -1 | 1) => void
  onHoje: () => void
  itens: ItemCal[]
  /** projeção do mês (a de Planejamento e do hub), ou null */
  projecao: number | null
  loading: boolean
  erro: boolean
  onRecarregar: () => void
  /** dia selecionado (YYYY-MM-DD, dentro do mês) */
  sel: string
  onSelecionar: (iso: string, foco?: boolean) => void
  /** item recém-gravado (destaque curto) */
  novaId: string | null
  /** mensagem curta depois de gravar um evento */
  aviso: string
  onAdicionarTx: (iso: string) => void
  onAdicionarEvento: (iso: string) => void
  onAbrirItem: (i: ItemCal) => void
  onFalar: (seed: string) => void
}

const TRACO = '–'

// ─── números do mês ───────────────────────────────────────────────────────────

const TEXTOS: Record<ModoMes, { saldo: string; ent: string; sai: string }> = {
  atual: { saldo: 'Saldo até hoje', ent: 'já recebidas', sai: 'já pagas' },
  passado: { saldo: 'Saldo do mês', ent: 'recebidas no mês', sai: 'pagas no mês' },
  futuro: { saldo: 'Saldo previsto', ent: 'previstas', sai: 'previstas' },
}

function Numeros({ p }: { p: CalendarioViewProps }) {
  const { mob, hoje, mes, projecao, loading } = p
  const n = numerosDoMes(mes, p.itens, hoje)
  const nome = nomeMes(mes)
  const ate = Number(hoje.slice(8, 10))
  const t = TEXTOS[n.modo]
  const valor = (v: string) => (loading ? TRACO : v)

  const dSaldo = n.modo === 'atual'
    ? (ate === 1 ? `entradas menos saídas de 1 de ${nome}` : `entradas menos saídas de 1 a ${ate} de ${nome}`)
    : n.modo === 'passado' ? `entradas menos saídas de ${nome}` : `o que está marcado em ${nome}`
  const dProj = projecao !== null
    ? (n.modo === 'atual'
      ? (mob ? 'o mesmo de Finanças' : `fechamento em ${diasNoMes(mes)} de ${nome}, o mesmo de Finanças`)
      : `saldo projetado no fim de ${nome}`)
    : n.modo === 'passado' ? 'mês já fechado' : 'além da curva de 12 meses'
  const subPend = `${brlAbs(n.pendentes.aSair)} a sair · ${brlAbs(n.pendentes.aEntrar)} a entrar`

  const principal = (
    <div className="principal">
      <p className="eyebrow">{t.saldo}</p>
      <div className="v num" id="nSaldo">{valor(brlInteiro(n.saldo))}</div>
      <p className="d">{dSaldo}</p>
    </div>
  )
  const ent = (
    <div>
      <p className="eyebrow">Entradas</p>
      <div className="v num in" id="nEnt">{valor(brlInteiro(n.entradas))}</div>
      {!mob && <p className="d">{t.ent}</p>}
    </div>
  )
  const sai = (
    <div>
      <p className="eyebrow">Saídas</p>
      <div className="v num" id="nSai">{valor(brlInteiro(n.saidas))}</div>
      {!mob && <p className="d">{t.sai}</p>}
    </div>
  )
  const proj = (
    <div>
      <p className="eyebrow">Projeção do mês</p>
      <div className="v num" id="nProj">{loading || projecao === null ? TRACO : brlInteiro(projecao)}</div>
      {(!mob || !loading) && <p className="d">{dProj}</p>}
    </div>
  )
  const pend = (
    <div>
      <p className="eyebrow">Pendentes</p>
      <div className="v num" id="nPend">{valor(String(n.pendentes.qtd))}</div>
      <p className="d num" id="nPendSub">{loading ? TRACO : subPend}</p>
    </div>
  )

  return (
    <section className="mesnums boot b2" aria-label="Números do mês" aria-busy={loading || undefined}>
      {mob ? (
        <>
          {principal}
          <div className="q">{ent}{sai}{proj}{pend}</div>
        </>
      ) : (
        <>{principal}{ent}{sai}{proj}{pend}</>
      )}
    </section>
  )
}

// ─── grade ────────────────────────────────────────────────────────────────────

function Legenda({ mob }: { mob: boolean }) {
  return (
    <div className="legenda" aria-label="Legenda">
      <span><i className="pt entrada" />Entrada</span>
      <span><i className="pt saida" />Saída</span>
      <span><i className="pt transferencia" />{mob ? 'Transf.' : 'Transferência'}</span>
      <span><i className="pt recorrente" />Recorrente</span>
      <span><i className="pt planejado" />Planejado</span>
      <span><i className="pt provento" />Provento</span>
      <span className="dica">{mob ? 'Sem. = saldo da semana · prev. = previsto' : 'Saldo da semana: entradas menos saídas · prev. = previsto'}</span>
    </div>
  )
}

function GradeEsqueleto({ mob }: { mob: boolean }) {
  return (
    <div className="cal-esq" aria-busy="true" aria-label="Carregando o mês">
      {Array.from({ length: mob ? 28 : 35 }, (_, i) => <span key={i} />)}
    </div>
  )
}

function Grade({ p, porDia }: { p: CalendarioViewProps; porDia: Map<string, ItemCal[]> }) {
  const { mob, hoje, mes, sel } = p
  const semanas = semanasDoMes(mes, porDia, hoje)
  const curto = mob ? curtoMob : curtoDesk
  const n = diasNoMes(mes)

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const passo: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const k = passo[e.key]
    if (!k || !(e.target as HTMLElement).classList.contains('dia')) return
    e.preventDefault()
    const dia = Math.max(1, Math.min(n, Number(sel.slice(8, 10)) + k))
    p.onSelecionar(isoDoDia(mes, dia), true)
  }

  return (
    <div className="grade" id="grade" onKeyDown={onKey}>
      {semanas.map((s, wi) => (
        <div className="sem" key={wi}>
          {s.celulas.map((c, ci) => {
            if (c.fora || !c.iso) {
              return <span key={`f${ci}`} className="dia fora" aria-hidden="true"><span className="n num">{c.dia}</span></span>
            }
            const iso = c.iso
            const its = porDia.get(iso) ?? []
            const t = somaDia(its, hoje)
            const pts = pontosDoDia(its)
            const cls = 'dia' + (iso === hoje ? ' hoje' : '') + (iso > hoje ? ' fut' : '')
            return (
              <button
                key={iso}
                className={cls}
                type="button"
                data-d={iso}
                aria-pressed={iso === sel}
                tabIndex={iso === sel ? 0 : -1}
                aria-label={ariaCelula(iso, its, hoje)}
                onClick={() => p.onSelecionar(iso)}
              >
                <span className="n num">{c.dia}</span>
                <span className="pts">
                  {pts.classes.map(k => <i key={k} className={'pt ' + k} />)}
                  {pts.mais > 0 && <i className="pt mais">+{pts.mais}</i>}
                </span>
                {t.conta && <span className={'s num' + (t.saldo > 0 ? ' in' : '')}>{curto(t.saldo)}</span>}
              </button>
            )
          })}
          <div className={'wk' + (s.prev ? ' prev' : '')}>
            {s.prev && <small>prev.</small>}
            {s.tem ? <b className={'num' + (s.saldo > 0 ? ' in' : '')}>{curto(s.saldo)}</b> : <small>nada</small>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── dia selecionado ──────────────────────────────────────────────────────────

function Dia({ p, porDia }: { p: CalendarioViewProps; porDia: Map<string, ItemCal[]> }) {
  const { hoje, mes, sel } = p
  const lista = porDia.get(sel) ?? []
  const t = somaDia(lista, hoje)
  const fut = sel > hoje
  const acum = saldoAcumulado(mes, porDia, hoje, sel)
  const planOk = sel >= hoje
  const nomeDia = diaDoMes(sel)

  const pill = sel === hoje
    ? <span className="pill-q hj">Hoje</span>
    : fut ? <span className="pill-q proj">Projeção</span> : <span className="pill-q">Passado</span>

  return (
    <>
      <div className="dhead">
        <div>
          <p className="eyebrow">{capitalizar(nomeDiaSemana(sel))}</p>
          <h2>{nomeDia}</h2>
        </div>
        {pill}
      </div>
      <div className="dnums">
        <div><span className="eyebrow">Entradas</span><b className={'num' + (t.e ? ' in' : '')}>{brlAbs(t.e)}</b></div>
        <div><span className="eyebrow">Saídas</span><b className="num">{brlAbs(t.s)}</b></div>
        <div><span className="eyebrow">Saldo do dia</span><b className={'num' + (t.saldo > 0 ? ' in' : '')}>{assinadoBrl(t.saldo)}</b></div>
      </div>
      {fut && (
        <p className="dproj">É projeção: soma o que está marcado (recorrentes, eventos planejados e proventos anunciados). Nada aqui foi lançado.</p>
      )}
      {lista.length > 0 ? (
        <ul className="ditens">
          {lista.map(i => {
            const sub = subItem(i, hoje)
            const v = valorItem(i)
            const interno = (
              <>
                <i className={'pt ' + classePonto(i)} />
                <span className="ds">{i.desc}<small>{sub}</small></span>
                <span className={'v num' + (entra(i) ? ' in' : '')}>{v}</span>
              </>
            )
            // ocorrência de recorrente ainda sem lançamento: a edição é da própria recorrente
            if (i.origem === 'recorrente') {
              return (
                <li key={i.id}>
                  <Link className={'it resto' + (i.data > hoje ? ' prev' : '')} href="/financas/recorrentes" aria-label={`${i.desc}, ${sub.replace(' →', '')}, ${v}`}>
                    {interno}
                  </Link>
                </li>
              )
            }
            return (
              <li key={i.id}>
                <button
                  className={'it' + (i.data > hoje ? ' prev' : '') + (p.novaId === i.id ? ' nova' : '')}
                  type="button"
                  data-id={i.id}
                  aria-label={`${i.desc}, ${sub}, ${v}, ${i.origem === 'provento' ? 'ver origem' : 'editar'}`}
                  onClick={() => p.onAbrirItem(i)}
                >
                  {interno}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="dvazio">Nada marcado em {nomeDia}.</p>
      )}
      <p className="dacum">
        <span>{fut ? 'Saldo previsto do mês até aqui' : 'Saldo do mês até aqui'}</span>
        <b className={'num' + (acum < 0 ? ' w' : '')}>{assinadoBrl(acum)}</b>
      </p>
      <div className="dacts">
        <button className="btn-sm roxo" type="button" onClick={() => p.onAdicionarTx(sel)}>+ Transação neste dia</button>
        <button
          className="btn-sm ghost"
          type="button"
          disabled={!planOk}
          aria-describedby={planOk ? undefined : 'dactsNota'}
          onClick={() => p.onAdicionarEvento(sel)}
        >
          + Evento planejado
        </button>
      </div>
      <p className="dacts-nota" id="dactsNota" aria-live="polite">{planOk ? p.aviso : 'Eventos planejados só de hoje em diante.'}</p>
      <button className="falar" type="button" onClick={() => p.onFalar(`Sobre ${nomeDia}: `)}>Falar com Sy sobre este dia →</button>
    </>
  )
}

// ─── a tela ───────────────────────────────────────────────────────────────────

export function CalendarioView(p: CalendarioViewProps) {
  const { mob, mes, loading, erro, itens } = p
  const porDia = agruparPorDia(itens)
  const nome = nomeMes(mes)
  const pronto = !loading && !erro
  const vazio = pronto && itens.length === 0

  const objeto = (
    <>
      <div>
        <p className="eyebrow"><Link href="/financas"><b>01</b>{mob ? ' ' : ' '}· Finanças</Link></p>
        <h1>Calendário</h1>
      </div>
      <div className="mesnav" role="group" aria-label="Mês">
        <button className="seta" type="button" aria-label="Mês anterior" onClick={() => p.onMes(-1)}>‹</button>
        <span className="mes" aria-live="polite">{rotuloMes(mes)}</span>
        <button className="seta" type="button" aria-label="Próximo mês" onClick={() => p.onMes(1)}>›</button>
        <button className="btn-sm ghost" type="button" onClick={p.onHoje}>Hoje</button>
      </div>
    </>
  )

  const erroBloco = (
    <p className="cal-erro" role="alert">
      Não deu para carregar o calendário. <button type="button" onClick={p.onRecarregar}>Tentar de novo</button>
    </p>
  )

  const vazioBloco = (
    <div className="forames">
      <b>Nada marcado em {nome} ainda.</b>
      Recorrentes e eventos planejados aparecem aqui sozinhos quando o mês chega perto.
      <div>
        <button className="btn-sm roxo" type="button" onClick={() => p.onAdicionarTx(p.sel)}>+ Transação</button>{' '}
        <button className="btn-sm ghost" type="button" disabled={p.sel < p.hoje} onClick={() => p.onAdicionarEvento(p.sel)}>+ Evento planejado</button>
      </div>
    </div>
  )

  const dow = mob ? DOW_CURTO_MOB : DOW_CURTO_DESK
  const cabecaDow = (
    <div className="dow" aria-hidden="true">
      {dow.map((d, i) => <span key={i}>{d}</span>)}
      <span className="wkh">{mob ? 'Sem.' : 'Semana'}</span>
    </div>
  )

  const corpoGrade = (
    <>
      {cabecaDow}
      {erro ? erroBloco : loading ? <GradeEsqueleto mob={mob} /> : <Grade p={p} porDia={porDia} />}
      {vazio && vazioBloco}
      <Legenda mob={mob} />
    </>
  )

  const painelDia = pronto ? <Dia p={p} porDia={porDia} /> : null

  if (mob) {
    return (
      <>
        <header className="objeto boot b1">{objeto}</header>
        <Numeros p={p} />
        <section className="gsec boot b3" aria-label={`Calendário de ${nome}`}>{corpoGrade}</section>
        <section className="dpanel" id="dpanel" aria-label="Dia selecionado" aria-live="polite">{painelDia}</section>
      </>
    )
  }

  return (
    <>
      <header className="objeto boot b1">{objeto}</header>
      <Numeros p={p} />
      <section className="cal boot b3" aria-label={`Calendário de ${nome}`}>
        <div className="grade-col">{corpoGrade}</div>
        <aside className="dpanel" id="dpanel" aria-label="Dia selecionado" aria-live="polite">{painelDia}</aside>
      </section>
    </>
  )
}

