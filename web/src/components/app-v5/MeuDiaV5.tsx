'use client'

// Fase 1 · /dashboard vira Meu dia D. Porte 1:1 de prototypes/v5/app/meu-dia-d.html
// (desktop) e meu-dia-d.mobile.html (mobile dedicado: mesma árvore de dados, a
// marcação muda onde o protótipo mobile muda, via useMob). Ordem: .cab → .margem
// + ritmo → laboratório → pede você hoje → o dia continua seu + acordo com Sy →
// suas áreas → números do mês → sua semana → .colofao. Dados reais via useMeuDia;
// vazios honestos (sem número inventado, área inativa sem score).

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import type { AreaNum, AreaScores } from '@/components/app-v5/SheetAreas'
import { Ritmo } from '@/components/app-v5/Ritmo'
import { Laboratorio, hm } from '@/components/app-v5/Laboratorio'
import { Presenca } from '@/components/app-v5/Presenca'
import { horaCurta, useMeuDia } from '@/hooks/use-meu-dia'
import { fmtV5Int } from '@/hooks/use-diario'
import { EVENT_TYPES, type AgendaEvent } from '@/hooks/use-agenda'
import { brl0, type Cenario } from '@/lib/meu-dia/laboratorio'
import { hhmmToMin } from '@/lib/meu-dia/margem'
import type { ItemPedeVoce } from '@/lib/meu-dia/gatilhos'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'
import './meu-dia-v5.css'

interface MeuDiaV5Props {
  userName: string
}

const SP_TZ = 'America/Sao_Paulo'
const DIA_MIN = 480
const LAZER_ALERTA = 20

// ─── mobile dedicado (mesmo critério do AppV5Boot / CamadaCoach) ─────────────
const MQ = '(max-width:1023px)'
function subscribeMob(cb: () => void) {
  const mq = window.matchMedia(MQ)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const lerMob = () => window.matchMedia(MQ).matches
const mobServidor = () => false

function useMob(): boolean {
  return useSyncExternalStore(subscribeMob, lerMob, mobServidor)
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** lazer restante no rodapé: en-dash + espaço quando negativo */
function brlSinal(n: number): string {
  return (n < 0 ? '– ' : '') + brl0(n)
}

function mesLongo(): string {
  return new Date().toLocaleDateString('pt-BR', { timeZone: SP_TZ, month: 'long' })
}

/** "Uma sexta" / "Um sábado"; sem data ainda, "Um dia". */
function artigoDia(dia: string): string {
  if (!dia) return 'Um dia'
  return /s[aá]bado|domingo/i.test(dia) ? `Um ${dia}` : `Uma ${dia}`
}

function duracao(e: AgendaEvent): number | null {
  const s = hhmmToMin(e.start_time), f = hhmmToMin(e.end_time)
  return s !== null && f !== null && f > s ? f - s : null
}

// ─── componente ───────────────────────────────────────────────────────────────

export function MeuDiaV5({ userName }: MeuDiaV5Props) {
  const d = useMeuDia()
  const mob = useMob()
  const { diario } = d

  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const [previa, setPrevia] = useState<Cenario | null>(null)

  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  }, [mob])

  const abrirSy = (seed = '') => {
    setCoachSeed(seed)
    setCoachOpen(true)
  }

  // ── cabeçalho ──────────────────────────────────────────────────────────────
  const { janela, lazer, metaViagem, lab, eventoLazer } = d
  const livreBase = janela.livreMin
  const cheio = livreBase < 60
  const lazerTenso = lazer !== null && lazer.pct > 85
  const mostraFala = d.acordo !== 'pedir' && d.brief !== null && d.brief.fala.trim() !== ''

  const subDerivada = mob
    ? `${cheio ? 'Pouca margem livre hoje' : 'Uma janela livre hoje'}${lazerTenso ? ', uma atenção no lazer' : ''}${lab ? ' e um jantar que você decide como quiser' : ''}.`
    : `${artigoDia(d.diaSemana)} com ${cheio ? 'pouca margem livre' : 'uma janela livre'}${lazerTenso ? ', uma atenção no lazer' : ''}${lab ? ' e um jantar que você pode decidir como quiser' : ''}.`

  const score = diario.score
  const delta = score?.deltaWeek ?? null
  const scoreAria = score
    ? `Life Sync Score ${score.total}${delta !== null && delta !== 0 ? `, ${delta > 0 ? 'mais' : 'menos'} ${Math.abs(delta)} na semana` : ''}`
    : 'Life Sync Score'

  // ── margem (com a prévia do laboratório aplicada por cima) ─────────────────
  const prep = previa?.prep ?? 0
  const livre = previa ? Math.max(0, livreBase - prep) : livreBase
  const segmentos = janela.segmentos8.map(s => (s === 'on' ? 'on' : '')) as string[]
  const ultimoOn = segmentos.lastIndexOf('on')
  if (previa && ultimoOn >= 0) segmentos[ultimoOn] = prep ? 'prep' : 'on'

  const ini = janela.inicio, fim = janela.fim
  const livreCopy = previa ? (
    <><b className="num">{livre}</b> minutos continuam livres depois dessa escolha{prep ? `, com ${prep} min de preparo dentro da janela.` : '.'}</>
  ) : livreBase > 0 && ini && fim ? (
    mob
      ? <>Há <b className="num">{livreBase}</b> minutos livres das {horaCurta(ini)} às {horaCurta(fim)}. Você decide o que fazer com eles.</>
      : <>Há uma janela de <b className="num">{livreBase}</b> minutos na sua agenda, das {horaCurta(ini)} às {horaCurta(fim)}. Você decide se quer ocupá-la.</>
  ) : (
    <>Não sobra janela livre até as 22h. O que já está marcado continua seu.</>
  )
  const janelaLabel = previa && prep
    ? `janela de ${livreBase} min · ${prep} min de preparo`
    : ini && fim ? `${ini} a ${fim} · livre` : 'sem janela livre'
  const statusDia = previa ? (prep ? 'Com preparo' : 'Sem pressa') : cheio ? 'Dia cheio' : 'Sem pressa'

  const lazerAgora = lazer ? (previa ? previa.efeitos.lazer : lazer.restante) : null
  const metaPct = metaViagem ? (previa && previa.efeitos.metaPct !== null ? previa.efeitos.metaPct : metaViagem.pct) : null

  const anelStyle = { '--p': (livre / DIA_MIN).toFixed(4) } as CSSProperties

  // ── agenda de hoje + espaço livre ──────────────────────────────────────────
  const agora = d.agoraMin ?? 0
  const proximo = d.eventosHoje.find(e => e.status !== 'concluido' && (hhmmToMin(e.start_time) ?? -1) >= agora)
  type LinhaAg = { k: string; t: number; el: React.ReactNode }
  const linhasAg: LinhaAg[] = d.eventosHoje.map(e => {
    const tipo = EVENT_TYPES[e.type]?.label ?? 'Agenda'
    const isLazer = eventoLazer?.id === e.id
    const dur = duracao(e)
    let sub = e.status === 'concluido'
      ? `${tipo} · feita`
      : [tipo, dur ? `${dur} min` : '', e.end_time ? `até ${horaCurta(e.end_time)}` : ''].filter(Boolean).join(' · ')
    let titulo = e.title
    if (isLazer && lab) {
      const fora = lab.cenarios[0]
      titulo = previa ? previa.agenda : e.title
      sub = previa
        ? `Prévia · ${previa.agendaSub} · ${brl0(previa.custo)} estimados`
        : `Plano atual · fora · ${brl0(fora.custo)} estimados`
    }
    const tag = e.status === 'concluido'
      ? <span className="tag ok">Feita</span>
      : isLazer ? <span className="tag">Lazer</span>
        : proximo?.id === e.id ? <span className="tag">A seguir</span> : <span />
    return {
      k: e.id,
      t: hhmmToMin(e.start_time) ?? -1,
      el: (
        <div className="ag" key={e.id}>
          <time className="num">{e.all_day || !e.start_time ? 'Dia' : e.start_time.slice(0, 5)}</time>
          <div><strong>{titulo}</strong><small>{sub}</small></div>
          {tag}
        </div>
      ),
    }
  })
  if (livreBase > 0 && ini) {
    linhasAg.push({
      k: 'livre',
      t: hhmmToMin(ini) ?? 0,
      el: (
        <div className="ag livre" key="livre">
          <time className="num">{ini}</time>
          <div>
            <strong id="agLivre">{previa && prep ? 'Espaço livre + preparo do jantar' : 'Espaço livre'}</strong>
            <small id="agLivreSub">{livre} min{previa && prep ? ` livres · ${prep} min de preparo` : previa ? ' livres sem tarefa sugerida' : ' sem tarefa sugerida'}</small>
          </div>
          <span className="tag ok">Protegido</span>
        </div>
      ),
    })
  }
  linhasAg.sort((a, b) => a.t - b.t)

  // ── pede você hoje ─────────────────────────────────────────────────────────
  const intencoesTexto = d.intencoes.map(i => i.texto)
  let iIntencao = 0
  const rowAcao = (it: ItemPedeVoce) => {
    if (it.acao.tipo === 'decidir') {
      const texto = intencoesTexto[iIntencao++] ?? ''
      return (
        <button className="btn-sm ghost act" type="button" onClick={() => abrirSy(texto ? `Decidir: ${texto}` : '')}>
          {it.acao.rotulo}
        </button>
      )
    }
    if (it.acao.tipo === 'link') {
      return <Link className="btn-sm ghost act" href={it.acao.href ?? '/dashboard'}>{it.acao.rotulo}</Link>
    }
    return <a className="btn-sm ghost act" href={it.acao.href ?? '#'}>{it.acao.rotulo}</a>
  }

  // ── áreas ──────────────────────────────────────────────────────────────────
  const ativas = diario.areas.ativas
  const visiveis = ativas.slice(0, 4)
  const outras = [...ativas.slice(4), ...diario.areas.outras]
  const scores: AreaScores = {}
  for (const a of ativas) if (a.score !== undefined) scores[a.n as AreaNum] = a.score
  const dimRows = visiveis.map(a => {
    const inner = (
      <>
        <span className="di num">{a.n}</span>
        <div>
          <div className="nm">{a.nome}</div>
          {a.meta && <div className="mt num">{a.meta}</div>}
        </div>
        <span className="sc num">
          {a.score}
          {a.tendencia !== undefined && (a.tendencia > 0
            ? <span className="tr ele">▲{a.tendencia}</span>
            : a.tendencia < 0
              ? <span className="tr" style={{ color: 'var(--coral)' }}>▼{Math.abs(a.tendencia)}</span>
              : <span className="tr" style={{ color: 'var(--t3)' }}>–</span>)}
        </span>
      </>
    )
    return a.n === '01'
      ? <Link className="dimrow" href="/financas" key={a.n}>{inner}</Link>
      : <div className="dimrow" key={a.n}>{inner}</div>
  })

  // ── números do mês ─────────────────────────────────────────────────────────
  const nums = diario.nums
  const despLegend = nums && nums.receitas > 0 ? `${Math.round((nums.despesas / nums.receitas) * 100)}% da receita` : 'este mês'

  // ── semana ─────────────────────────────────────────────────────────────────
  const sem = d.semana
  const partesSemana: React.ReactNode[] = []
  if (sem.scoreInicio !== null && sem.scoreFim !== null) {
    partesSemana.push(<>score de <b className="num">{sem.scoreInicio}</b> para <b className="num">{sem.scoreFim}</b></>)
  }
  if (sem.total > 0) partesSemana.push(<><b className="num">{sem.feitos} de {sem.total}</b> compromissos feitos</>)
  if (sem.focoMin > 0) partesSemana.push(<><b className="num">{hm(sem.focoMin)}</b> de foco</>)

  const streak = diario.colofao.streakDias

  // ── blocos que mudam de casca entre desktop e mobile ───────────────────────
  const cabTexto = (
    <>
      <p className="eyebrow" suppressHydrationWarning>{d.dataCurta}</p>
      <h1>{cheio ? 'Hoje está cheio.' : 'Hoje pode caber menos.'}</h1>
      <p className="sub">{mostraFala ? d.brief?.fala : subDerivada}</p>
      {mostraFala && d.brief?.fontesTexto && <p className="fontes">{d.brief.fontesTexto}</p>}
    </>
  )

  const margem = (
    <section className={mob ? 'margem boot b2' : undefined} aria-label="Sua margem hoje">
      <div className="mhead">
        <p className="eyebrow">{mob ? 'Sua margem' : 'Sua margem hoje'} · <b>14h às 22h</b></p>
        <span className="pill-q" id="statusDia">{statusDia}</span>
      </div>
      <div className="livre">
        <div className="anel" id="anel" style={anelStyle}>
          <svg viewBox="0 0 132 132" aria-hidden="true"><circle className="trk" cx="66" cy="66" r="60" /><circle className="arc" cx="66" cy="66" r="60" /></svg>
          <div className="c"><div><strong className="num" id="tempoLivre">{hm(livre)}</strong><small>sem compromisso</small></div></div>
        </div>
        <div>
          <h2>Tempo livre também é um plano.</h2>
          <p id="livreCopy">{livreCopy}</p>
        </div>
      </div>
      <div className="linha-dia" id="linhaDia" aria-label="Agenda das 14h às 22h">
        {segmentos.map((s, i) => <i key={i} className={s || undefined} />)}
      </div>
      <div className="horas"><span>14:00</span><span id="janelaLabel">{janelaLabel}</span><span>22:00</span></div>
      <div className="mfoot">
        {lazer && lazerAgora !== null && (
          <div><strong className={'num' + (lazerAgora < LAZER_ALERTA ? ' w' : '')} id="lazerLivre">{brlSinal(lazerAgora)}</strong><span>de lazer no mês</span></div>
        )}
        <div><strong className="num">{d.compromissosAFrente}</strong><span>{d.compromissosAFrente === 1 ? 'compromisso à frente' : 'compromissos à frente'}</span></div>
        {metaViagem && metaPct !== null && (
          <div><strong className="num" id="itaMeta">{metaPct}%</strong><span>da meta {metaViagem.nome}</span></div>
        )}
      </div>
    </section>
  )

  const ritmo = (
    <Ritmo
      atual={d.ritmo.atual}
      registro={d.ritmo.registro}
      unavailable={d.ritmo.unavailable}
      salvar={d.ritmo.salvar}
      className={mob ? 'boot b3' : undefined}
    />
  )

  const diaHoje = (
    <section className={mob ? 'dia rv' : undefined} aria-label="O dia continua seu">
      <p className="eyebrow">Hoje</p>
      <h2>O dia continua seu.</h2>
      {linhasAg.length > 0
        ? linhasAg.map(l => l.el)
        : (
          <div className="ag">
            <time className="num">–</time>
            <div><strong>Nada na agenda de hoje.</strong><small>O dia está aberto.</small></div>
            <span />
          </div>
        )}
    </section>
  )

  const presenca = <Presenca acordo={d.acordo} onChange={d.setAcordo} className={mob ? 'rv' : undefined} />

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo="meu-dia" onCoachOpen={() => abrirSy()} scores={scores} />

      <main className="wrap meu-dia" ref={mainRef} aria-label={`Meu dia de ${userName}`}>
        {/* cabeçalho */}
        <section className="cab boot b1">
          {mob ? cabTexto : <div>{cabTexto}</div>}
          <div className="score" role="img" aria-label={scoreAria}>
            <div className="v num">{score ? score.total : '–'}</div>
            <div className="l">
              Life Sync Score
              {delta !== null && (
                <> · <span className={'num' + (delta > 0 ? ' ele' : '')}>{delta > 0 ? `+${delta}` : delta < 0 ? `–${Math.abs(delta)}` : '0'}</span> na semana</>
              )}
            </div>
            <Link href="/dashboard/score">{mob ? 'Entender →' : 'Entender o número →'}</Link>
          </div>
        </section>

        {/* 1. a margem de hoje + o seu ritmo */}
        {mob ? (
          <>{margem}{ritmo}</>
        ) : (
          <div className="margem boot b2">{margem}{ritmo}</div>
        )}

        {/* 2. laboratório */}
        {lab && lazer ? (
          <Laboratorio
            lab={lab}
            lazer={lazer}
            janelaMin={livreBase}
            mediaN={d.mediaN}
            metaViagem={metaViagem}
            previa={previa}
            onAplicar={setPrevia}
            onDesfazer={() => setPrevia(null)}
            mob={mob}
          />
        ) : (
          <div className={'sec-head boot ' + (mob ? 'b4' : 'b3')}>
            {mob
              ? <p className="eyebrow">Nenhuma escolha aberta hoje.</p>
              : <div><p className="eyebrow">Nenhuma escolha aberta hoje.</p></div>}
          </div>
        )}

        {/* 3. pede você hoje */}
        <section className={'pede boot ' + (mob ? 'b5' : 'b4')} aria-label="Pede você hoje">
          {mob
            ? <p className="eyebrow">Pede você hoje</p>
            : <div className="sec-head"><div><p className="eyebrow">Pede você hoje</p></div></div>}
          {d.itens.map((it, i) => {
            const valor = it.valor ? <span className="val num" dangerouslySetInnerHTML={{ __html: it.valor }} /> : <span className="val num" />
            const acao = rowAcao(it)
            return (
              <div className={'row' + (it.tom === 'warn' ? ' warn' : '')} key={`${i}:${it.prioridade}:${it.destaque}`}>
                <span className="ix num">{it.area}</span>
                <div>
                  {/* destaque/titulo/sub/valor já vêm escapados de lib/meu-dia/gatilhos */}
                  <div
                    className="tx"
                    dangerouslySetInnerHTML={{ __html: it.destaque ? `<strong>${it.destaque}</strong> ${it.titulo}` : it.titulo }}
                  />
                  <div className="sub" dangerouslySetInnerHTML={{ __html: it.sub }} />
                </div>
                {mob ? <div className="r2">{valor}{acao}</div> : <>{valor}{acao}</>}
              </div>
            )
          })}
        </section>

        {/* 4. o dia continua seu + presença de Sy */}
        {mob ? (
          <>{diaHoje}{presenca}</>
        ) : (
          <div className="baixo boot b5">{diaHoje}{presenca}</div>
        )}

        {/* suas áreas */}
        <section className="dims-sec rv" id="areas" aria-label="Suas áreas">
          <div className="dims-head">
            <p className="eyebrow">Suas áreas</p>
            <Link href="/dashboard/score">Ver todas →</Link>
          </div>
          {mob ? dimRows : <div className="dims">{dimRows}</div>}
          {outras.length > 0 && (
            <p className="outras">
              Outras:{' '}
              {outras.map((a, i) => (
                <span key={a.n}>
                  {i > 0 && ' · '}
                  {a.n} {a.nome}
                  {a.score !== undefined && <> <span className="num">{a.score}</span></>}
                </span>
              ))}
            </p>
          )}
        </section>

        {/* números do mês */}
        <section className="nums rv" aria-label="Números do mês">
          <div><p className="eyebrow">Saldo livre</p><div className="v num">{nums ? fmtV5Int(nums.saldo) : '–'}</div><div className="d num">receitas menos despesas</div></div>
          <div><p className="eyebrow">Receitas</p><div className="v num">{nums ? fmtV5Int(nums.receitas) : '–'}</div><div className="d num">este mês</div></div>
          <div><p className="eyebrow">Despesas</p><div className="v num">{nums ? fmtV5Int(nums.despesas) : '–'}</div><div className="d num">{despLegend}</div></div>
          <div><p className="eyebrow">Poupança</p><div className="v num">{nums ? `${nums.poupancaPct}%` : '–'}</div><div className="d num">da receita</div></div>
        </section>

        {/* sua semana */}
        <section className="semana rv" aria-label="Sua semana">
          <p>
            Sua semana
            {partesSemana.length > 0
              ? <>: {partesSemana.map((p, i) => <span key={i}>{i > 0 && ', '}{p}</span>)}.</>
              : ' ainda está começando.'}
            {' '}Fecha domingo.
          </p>
          <Link href="/dashboard/review">Ver a semana →</Link>
        </section>
      </main>

      {/* rodapé */}
      <footer className="colofao">
        <span suppressHydrationWarning>Saldo de {mesLongo()}: <b className="num">{diario.colofao.saldoMes}</b></span>
        <div className="r">
          {streak > 0 && <span>Streak <b className="num">{streak} {streak === 1 ? 'dia' : 'dias'}</b></span>}
          {diario.colofao.badges !== '–' && <span>Badges <b className="num">{diario.colofao.badges}</b></span>}
          <span>Última sincronização às <b className="num" suppressHydrationWarning>{diario.colofao.ultimaSinc}</b></span>
        </div>
      </footer>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={d.brief?.recs.map(r => r.title) ?? []}
        onClose={() => setCoachOpen(false)}
        moduleId="panorama"
        leitura="o seu dia"
      />
    </>
  )
}
