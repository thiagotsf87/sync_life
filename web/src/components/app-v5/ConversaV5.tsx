'use client'

// Fase 1 · Task 15 · arquivo da conversa (/coach), template T2 aplicado a
// conversas. Porte 1:1 de prototypes/v5/app/conversa.html (desktop: lista de
// dias 320px | o dia selecionado) e conversa.mobile.html (a lista de dias é a
// tela; tocar num dia abre a thread em tela cheia com voltar). Não é uma segunda
// caixa de entrada: no fim do dia de hoje há o gatilho da camada, sem input.
// Dados reais via useConversa (coach_messages 60 dias + intencoes).

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { useConversa } from '@/hooks/use-conversa'
import {
  composicaoDoDia, contagem, diaPorExtenso, horaSP, quandoCurto, registrosDaIntencao,
  rotuloDiaLista, rotuloDiaThread, tituloDoCaminho, areasDaIntencao,
  type Bolha, type Dia, type Entrada, type FiltroTipo, type IntencaoRow,
} from '@/lib/conversa/agrupar'
import { NOME_AREA, areaDaTabela, listaHumana, rotuloFeito, separarRotulo, type AreaCodigo } from '@/lib/intencao/proposta'
import { mensagemDesfeito } from '@/lib/intencao/rotas'
import './conversa-v5.css'

const TIPOS: { id: FiltroTipo; nome: string }[] = [
  { id: 'tudo', nome: 'Tudo' },
  { id: 'pergunta', nome: 'Perguntas' },
  { id: 'acao', nome: 'Ações' },
  { id: 'intencao', nome: 'Intenções' },
]

const AREAS: AreaCodigo[] = ['01', '02', '03', '04', '05', '06', '07', '08']

// ─── ícones (SVG 1:1 do protótipo) ───────────────────────────────────────────
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

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function Lupa() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  )
}

function FaleComSy({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn-sm ghost coach-pill" type="button" onClick={onClick}>
      <CoachBussola />
      Fale com Sy
    </button>
  )
}

// ─── cartão de intenção ──────────────────────────────────────────────────────
const CLASSE_EST = { em_aberto: 'aberta', aplicada: 'aplicada', desfeita: 'desfeita' } as const
const NOME_EST = { em_aberto: 'Em aberto', aplicada: 'Aplicada', desfeita: 'Desfeita' } as const

/** "Quero começar um curso de inglês" → "Começar um curso de inglês" */
function tituloIntencao(texto: string): string {
  const t = texto.trim().replace(/^(eu\s+)?quero\s+/i, '').replace(/[.!]+$/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function Rotulo({ rotulo }: { rotulo: string }) {
  const { area, resto } = separarRotulo(rotulo)
  return area ? <span><b>{area}</b> · {resto}</span> : <span>{resto}</span>
}

interface IntentProps {
  it: IntencaoRow
  onDecidir: (texto: string) => void
  onDesfazer: (id: string) => Promise<number | null>
}

function IntentCard({ it, onDecidir, onDesfazer }: IntentProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(false)
  const [desfeitaAgora, setDesfeitaAgora] = useState<number | null>(null)
  const ref = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const simRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (confirmando) simRef.current?.focus({ preventScroll: true }) }, [confirmando])

  const status = desfeitaAgora !== null ? 'desfeita' : it.status
  const regs = registrosDaIntencao(it)
  const areas = areasDaIntencao(it)
  const nomesAreas = listaHumana(
    areas.map(a => NOME_AREA[a]),
  )
  const n = regs.length
  const caminho = tituloDoCaminho(it)

  const lead =
    status === 'em_aberto'
      ? `Caminho proposto: ${caminho ? caminho.charAt(0).toLowerCase() + caminho.slice(1) : 'ainda por escolher'}. Nada foi criado ainda. Isso fica em Meu dia, no que pede você, até você decidir.`
      : status === 'aplicada'
        ? `Caminho escolhido: ${caminho.charAt(0).toLowerCase() + caminho.slice(1)}. Os registros foram criados por você e o Desfazer continua aqui.`
        : `Caminho escolhido: ${caminho.charAt(0).toLowerCase() + caminho.slice(1)}.` +
          (it.aplicada_em ? ` Aplicada às ${horaSP(it.aplicada_em)} e desfeita por você.` : ' Desfeita por você.')

  const confirmar = async () => {
    setEnviando(true)
    setErro(false)
    const ficaram = await onDesfazer(it.id)
    setEnviando(false)
    if (ficaram === null) { setErro(true); return }
    setConfirmando(false)
    setDesfeitaAgora(ficaram)
    ref.current?.focus({ preventScroll: true })
  }

  const saiu = n === 1 ? `o registro saiu de ${nomesAreas}` : `os ${n} registros saíram de ${nomesAreas}`

  return (
    <section className="intent" data-estado={CLASSE_EST[status]} aria-label={`Intenção: ${tituloIntencao(it.texto)}`} ref={ref} tabIndex={-1}>
      <div className="ih">
        <div>
          <p className="eyebrow">Intenção · <b>{areas.join(' · ')}</b></p>
          <h3>{tituloIntencao(it.texto)}</h3>
        </div>
        <span className={`est ${CLASSE_EST[status]}`}>{NOME_EST[status]}</span>
      </div>
      <p className="lead">{lead}</p>
      {regs.length > 0 && (
        <ul className="regs">
          {regs.map((r, i) => (
            <li key={`${r.tabela}:${i}`}>
              <span className="ix num">{areaDaTabela(r.tabela) ?? ''}</span>
              <Rotulo rotulo={r.rotulo} />
              {status === 'aplicada' && r.href ? <Link href={r.href}>Ver →</Link> : <span />}
            </li>
          ))}
        </ul>
      )}
      <div className="ifoot">
        {status === 'em_aberto' && (
          <>
            <span>Sy não cobra. Decida quando fizer sentido.</span>
            <div className="acts">
              <button className="btn-sm ghost" type="button" onClick={() => onDecidir(it.texto)}>Decidir</button>
            </div>
          </>
        )}
        {status === 'aplicada' && (
          <>
            <span className="done">
              <Check />
              Feito · {rotuloFeito(regs)}{it.aplicada_em ? ` · ${horaSP(it.aplicada_em)}` : ''}
            </span>
            <div className="acts">
              <button className="btn-sm ghost" type="button" ref={btnRef} onClick={() => setConfirmando(true)}>Desfazer</button>
            </div>
          </>
        )}
        {status === 'desfeita' && (
          <span>
            {desfeitaAgora !== null
              ? `Desfeita por você · agora · ${desfeitaAgora > 0 ? mensagemDesfeito(desfeitaAgora).replace('Desfeito · ', '') : saiu}.`
              : `Desfeita por você${it.desfeita_em ? ` · ${quandoCurto(it.desfeita_em)}` : ''} · ${saiu}.`}
          </span>
        )}
      </div>
      {status === 'aplicada' && confirmando && (
        <div className="confirma" role="status">
          <span>
            {erro
              ? 'Não deu para desfazer agora. Tente de novo em instantes.'
              : <>Desfazer {n === 1 ? 'o ' : 'os '}<b>{n === 1 ? 'registro' : `${n} registros`}</b>? {n === 1 ? 'Ele sai' : 'Eles saem'} de {nomesAreas}. Nada mais muda.</>}
          </span>
          <button className="sim" type="button" ref={simRef} disabled={enviando} onClick={() => void confirmar()}>Desfazer</button>
          <button type="button" disabled={enviando} onClick={() => { setConfirmando(false); btnRef.current?.focus({ preventScroll: true }) }}>Manter</button>
        </div>
      )}
    </section>
  )
}

// ─── entradas ────────────────────────────────────────────────────────────────
function BolhaV({ b }: { b: Bolha }) {
  if (b.role === 'user') return <div className="bub u">{b.texto}</div>
  if (b.kind === 'acao') {
    return (
      <div className="action" role="status">
        <div className="al">Ação executada</div>
        <p>{b.texto}</p>
        <span className="done"><Check />Confirmado por você · {b.hora}</span>
      </div>
    )
  }
  return (
    <div className="bub a">
      {b.texto}
      {b.fontes.length > 0 && <span className="meta">Fontes: {b.fontes.join(' · ')}</span>}
    </div>
  )
}

function EntradaV({ e, onDecidir, onDesfazer }: { e: Entrada } & Omit<IntentProps, 'it'>) {
  return (
    <div className="ent" data-tipo={e.tipo}>
      <div className="divider">{e.hora}{e.tipo === 'nota' ? ' · dentro do seu acordo' : ''}</div>
      {e.intencao
        ? <IntentCard it={e.intencao} onDecidir={onDecidir} onDesfazer={onDesfazer} />
        : e.bolhas.map(b => <BolhaV key={b.id} b={b} />)}
    </div>
  )
}

// ─── tela ────────────────────────────────────────────────────────────────────
export function ConversaV5() {
  const c = useConversa()
  const mob = useMobV5()

  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const [verThread, setVerThread] = useState(false)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())

  const abrirCoach = (seed = '') => {
    setCoachSeed(seed)
    setCoachOpen(true)
  }
  const decidir = (texto: string) => abrirCoach(`Decidir: ${texto}`)

  const visiveis = c.visiveis
  const atual = visiveis.find(v => v.dia.dia === escolhido) ?? visiveis[0] ?? null

  const mostrar = (dia: string) => {
    setEscolhido(dia)
    if (mob) {
      setVerThread(true)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }
  const voltar = () => {
    setVerThread(false)
    const d = atual?.dia.dia
    requestAnimationFrame(() => { if (d) rowRefs.current.get(d)?.focus({ preventScroll: true }) })
  }

  const vazio = !c.loading && c.dias.length === 0
  const semResultado = !c.loading && c.dias.length > 0 && visiveis.length === 0

  // ── busca e filtros (no mobile a busca vem antes, numa linha própria) ──
  const busca = (
    <label className="busca">
      <Lupa />
      <input
        type="search"
        placeholder="Buscar nas conversas"
        aria-label="Buscar nas conversas"
        value={c.filtro.q}
        onChange={e => c.setQ(e.target.value)}
      />
    </label>
  )
  const chips = (
    <>
      {TIPOS.map(t => (
        <button
          key={t.id}
          className={c.filtro.tipo === t.id ? 'chip on' : 'chip'}
          type="button"
          aria-pressed={c.filtro.tipo === t.id}
          onClick={() => c.setTipo(t.id)}
        >
          {t.nome}
        </button>
      ))}
      <span className="sep" aria-hidden="true" />
      <div className="sel">
        <select aria-label="Por área" value={c.filtro.area} onChange={e => c.setArea(e.target.value as AreaCodigo | 'todas')}>
          <option value="todas">Por área: todas</option>
          {AREAS.map(a => <option key={a} value={a}>{a} {NOME_AREA[a]}</option>)}
        </select>
      </div>
    </>
  )
  const filtros = mob ? (
    <div className="boot b2 filtros-wrap">
      {busca}
      <div className="filtros" role="toolbar" aria-label="Filtros">{chips}</div>
    </div>
  ) : (
    <div className="filtros boot b2" role="toolbar" aria-label="Filtros">
      {chips}
      {busca}
    </div>
  )

  // ── lista de dias ──
  const dias = (
    <aside className="dias" aria-label="Dias">
      <p className="eyebrow">Por dia · <span className="num">{visiveis.length}</span> {visiveis.length === 1 ? 'dia' : 'dias'}</p>
      {visiveis.map(({ dia, visiveis: vis }) => {
        const r = rotuloDiaLista(dia.dia, c.hojeISO)
        const on = atual?.dia.dia === dia.dia
        const ints = dia.entradas.filter(e => e.intencao)
        return (
          <button
            key={dia.dia}
            ref={el => { if (el) rowRefs.current.set(dia.dia, el); else rowRefs.current.delete(dia.dia) }}
            className={'dia-row' + (on ? ' on' : '') + (r.hoje ? ' hoje' : '')}
            type="button"
            aria-pressed={on}
            onClick={() => mostrar(dia.dia)}
          >
            <span className="dd"><span>{r.hoje ? <><b>Hoje</b> · {r.resto}</> : r.resto}</span></span>
            <span className="fr">{dia.frase}</span>
            <span className="cnt">
              <span>{contagem(vis.length, dia.entradas.length, c.filtrando)}</span>
              {ints.map(e => e.intencao && (
                <span key={e.id} className={`sb ${CLASSE_EST[e.intencao.status]}`}>{NOME_EST[e.intencao.status]}</span>
              ))}
            </span>
          </button>
        )
      })}
      {semResultado && (
        <p className="sem-resultado">
          Nada com essa busca.
          <button type="button" onClick={c.limparBusca}>Limpar</button>
        </p>
      )}
    </aside>
  )

  // ── a thread do dia ──
  const thread = (dia: Dia, vis: Entrada[]) => {
    const r = rotuloDiaThread(dia.dia, c.hojeISO)
    const comp = composicaoDoDia(dia.entradas)
    return (
      <article className="thread" aria-label={r.resto}>
        <header className="th">
          <div>
            <button className="voltar" type="button" onClick={voltar}>← Todos os dias</button>
            <p className="eyebrow">{r.hoje ? <><b>Hoje</b> · {r.resto}</> : r.resto}</p>
            <h2>
              {comp.map((p, i) => (
                <span key={p.t}>
                  {i > 0 && (i === comp.length - 1 ? ' e ' : ', ')}
                  <span className="num">{p.n}</span> {p.t}
                </span>
              ))}
              .
            </h2>
          </div>
          <span className="cnt">{contagem(vis.length, dia.entradas.length, c.filtrando)}</span>
        </header>
        {vis.map(e => <EntradaV key={e.id} e={e} onDecidir={decidir} onDesfazer={c.desfazer} />)}
        {dia.hoje ? (
          <div className="continuar">
            <span>Para continuar, abra</span>
            <FaleComSy onClick={() => abrirCoach('')} />
          </div>
        ) : (
          <p className="fim">Fim do dia. Para continuar qualquer assunto, use Fale com Sy.</p>
        )}
      </article>
    )
  }

  const { aplicada, em_aberto, desfeita } = c.intencoes
  const nInt = aplicada + em_aberto + desfeita

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo="panorama" onCoachOpen={() => abrirCoach('')} />

      <main className={'conversa' + (mob && verThread ? ' ver-thread' : '')} id="topo">
        <div className="wrap">
          <header className="titulo boot b1">
            <p className="eyebrow"><b>Sy</b></p>
            <h1>Suas conversas com Sy</h1>
            <p className="sub">Tudo o que vocês já falaram, por dia. Nada aqui é uma segunda caixa de entrada: para falar, use Fale com Sy.</p>
          </header>

          {!vazio && filtros}

          {c.loading && (
            <div className="sk-rows" aria-hidden="true"><div className="sk-row" /><div className="sk-row" /><div className="sk-row" /></div>
          )}

          {vazio && (
            <section className="vazio-sec boot b3" aria-label="Arquivo da conversa">
              <p className="vazio">
                Sy ainda não falou com você.
                <small>Comece por Fale com Sy. O que vocês falarem aparece aqui, por dia.</small>
              </p>
              <FaleComSy onClick={() => abrirCoach('')} />
            </section>
          )}

          {!c.loading && !vazio && (
            <section className="arquivo boot b3" aria-label="Arquivo da conversa">
              {(!mob || !verThread) && dias}
              {(!mob || verThread) && (
                <div className="threads">
                  {atual && thread(atual.dia, atual.visiveis)}
                </div>
              )}
            </section>
          )}
        </div>

        {!c.loading && !vazio && (
          <footer className="colofao">
            <span>
              <b className="num">{c.dias.length}</b> {c.dias.length === 1 ? 'dia' : 'dias'} de conversa ·{' '}
              <b className="num">{c.totalEntradas}</b> {c.totalEntradas === 1 ? 'entrada' : 'entradas'}
              {c.desde ? ` desde ${diaPorExtenso(c.desde)}` : ''}
            </span>
            <div className="r">
              {nInt > 0 && (
                <span>
                  Intenções: <b className="num">{aplicada}</b> {aplicada === 1 ? 'aplicada' : 'aplicadas'} ·{' '}
                  <b className="num">{em_aberto}</b> em aberto ·{' '}
                  <b className="num">{desfeita}</b> {desfeita === 1 ? 'desfeita' : 'desfeitas'}
                </span>
              )}
              <span suppressHydrationWarning>Última sincronização às <b className="num">{c.ultimaSinc}</b></span>
            </div>
          </footer>
        )}
      </main>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={[]}
        onClose={() => setCoachOpen(false)}
        moduleId="panorama"
        leitura="as suas conversas"
      />
    </>
  )
}

export default ConversaV5
