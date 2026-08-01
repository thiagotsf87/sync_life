'use client'

// Onda 2 · tela Diário v5 — árvore única responsiva (desktop base +
// compaction <1024px via diario-v5.css), porte de prototypes/v5/app/diario.html
// e diario.mobile.html. Blocos na ordem da spec §4: masthead → folha (briefing
// do coach) → check-in → hoje → números do mês → suas áreas → atenção + metas
// → colofão. Dados 100% reais (use-diario / use-diario-brief / use-checkin);
// vazios honestos, sem números inventados. A banda "Estados · anotação do
// protótipo" dos protótipos NÃO entra aqui. Dono do estado da camada do coach
// (open + seed): ask da folha abre semeado, coach-pill abre limpo.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { useDiario } from '@/hooks/use-diario'
import { useDiarioBrief } from '@/hooks/use-diario-brief'
import { MOOD_LABELS, useCheckin, type Mood } from '@/hooks/use-checkin'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'
import './diario-v5.css'

interface DiarioV5Props {
  userName: string
  accountCreatedAt: string
}

const SP_TZ = 'America/Sao_Paulo'
const NBSP = ' '
const MOODS: readonly Mood[] = [1, 2, 3, 4, 5]
const ASK_SEED = 'Pergunte algo sobre o seu mês'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Saudação pela hora em São Paulo (determinística dentro do período). */
function saudacao(): string {
  const h = Number(
    new Date().toLocaleString('en-US', { timeZone: SP_TZ, hour: '2-digit', hourCycle: 'h23' }),
  )
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Nº da edição: dias (SP) desde a criação da conta + 1. Sempre >= 1. */
function edicaoN(accountCreatedAt: string): number {
  const created = new Date(accountCreatedAt)
  if (Number.isNaN(created.getTime())) return 1
  const dia = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: SP_TZ })
  const diff = Math.round((Date.parse(dia(new Date())) - Date.parse(dia(created))) / 86400000)
  return Math.max(diff, 0) + 1
}

/** HH:MM em São Paulo a partir de um timestamp ISO. */
function horaSP(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--:--'
  return d.toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit' })
}

/** Moeda inteira dos cards grandes (formato do protótipo: R$ 1.840, NBSP pós-R$). */
function fmtInt(v: number): string {
  const abs = Math.round(Math.abs(v)).toLocaleString('pt-BR')
  return `${v < 0 ? '– ' : ''}R$${NBSP}${abs}`
}

// ─── SVGs (1:1 do protótipo) ──────────────────────────────────────────────────

function HandArrow() {
  return (
    <svg className="hand-arrow" width="42" height="24" viewBox="0 0 42 24" aria-hidden="true">
      <path d="M40 4 C28 20, 15 22, 3 15 M9 21 L3 15 L10 11" />
    </svg>
  )
}

function RecArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function AskSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function DiarioV5({ userName, accountCreatedAt }: DiarioV5Props) {
  const data = useDiario()
  const briefQ = useDiarioBrief()
  const ck = useCheckin()

  // camada do coach: componente controlado, o Diário é o dono do estado
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')

  // check-in: estado local do form
  const [mood, setMood] = useState<Mood | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const mainRef = useRef<HTMLElement>(null)

  // reveals .rv/.draw: re-observa quando o brief chega (o .draw da folha só
  // monta com o brief carregado; elementos já .in seguem visíveis)
  const briefLoading = briefQ.loading
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  }, [briefLoading])

  function openCoach() {
    setCoachSeed('')
    setCoachOpen(true)
  }

  function openCoachSeeded() {
    setCoachSeed(ASK_SEED)
    setCoachOpen(true)
  }

  async function handleSaveCheckin() {
    if (mood === null || saving) return
    setSaving(true)
    setSaveError(false)
    const ok = await ck.save(mood, note)
    if (!ok) setSaveError(true)
    setSaving(false)
  }

  const brief = briefQ.brief
  const score = data.score
  const nums = data.nums

  const deltaTxt =
    score === null
      ? ''
      : score.deltaWeek > 0
        ? `+${score.deltaWeek} esta semana`
        : score.deltaWeek < 0
          ? `−${Math.abs(score.deltaWeek)} esta semana`
          : 'estável'

  const despLegend =
    nums && nums.receitas > 0
      ? `${Math.round((nums.despesas / nums.receitas) * 100)}% da receita`
      : 'este mês'

  const streakDias = data.colofao.streakDias

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ticker={data.ticker} onCoachOpen={openCoach} />

      <main className="diario" ref={mainRef}>
        {/* 1 · masthead */}
        <div className="wrap">
          <section className="mast boot b1">
            <div>
              <p className="eyebrow" suppressHydrationWarning>Edição nº {edicaoN(accountCreatedAt)} · seu diário</p>
              <h1 suppressHydrationWarning>{saudacao()}, {userName}.</h1>
              <p className="sub">Seu dia, lido pelo coach.</p>
            </div>
            <div className="selo">
              <div className="k">LIFE SYNC SCORE</div>
              <div className="n num">{score ? score.total : '–'}</div>
              {score !== null && <div className="d num">{deltaTxt}</div>}
              <Link className="s" href="/dashboard/score">
                {score ? `${score.label} · como melhorar →` : 'como melhorar →'}
              </Link>
            </div>
          </section>
        </div>

        {/* 2 · a folha */}
        <section className="folha lt boot b2" aria-label="Briefing do coach">
          <div className="in">
            <article>
              <p className="eyebrow"><b>O briefing de hoje</b> · escrito pelo coach</p>
              {briefQ.loading ? (
                <div aria-hidden="true">
                  <span className="sk sk-h2" />
                  <span className="sk sk-l" />
                  <span className="sk sk-l c2" />
                  <span className="sk sk-l c3" />
                </div>
              ) : brief ? (
                <>
                  <h2>{brief.headline}</h2>
                  <p className="body">{brief.p1}</p>
                  <p className="body">{brief.p2}</p>
                  <div className="draw rv">
                    <HandArrow />
                    <span className="hand">{brief.hand}</span>
                  </div>
                  <p className="ass">Escrito às {horaSP(brief.generatedAt)}, com base em {brief.basedOn}.</p>
                </>
              ) : (
                <p className="body">O briefing de hoje não carregou. Tente recarregar.</p>
              )}
            </article>
            {(briefQ.loading || brief) && (
              <aside className="recs">
                <p className="eyebrow">Recomendações de hoje</p>
                {briefQ.loading ? (
                  <div aria-hidden="true">
                    {[0, 1, 2].map(i => (
                      <div className="sk-rec" key={i}>
                        <span className="sk sk-rn" />
                        <div>
                          <span className="sk sk-rt" />
                          <span className="sk sk-rd" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  brief?.recs.slice(0, 3).map((r, i) => (
                    <div className="rec" key={`${i}:${r.title}`}>
                      <span className="rn num">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>{r.title}<RecArrow /></h4>
                        <p>{r.detail}</p>
                      </div>
                    </div>
                  ))
                )}
                <button className="ask" type="button" onClick={openCoachSeeded}>
                  <span>Pergunte algo sobre o seu mês…</span>
                  <AskSend />
                </button>
              </aside>
            )}
          </div>
        </section>

        {/* 3 · check-in */}
        {!ck.loading && !ck.unavailable && (
          <div className="wrap">
            <section className="checkin boot b3" aria-label="Check-in do dia">
              <div>
                <p className="eyebrow">Check-in</p>
                <p className="frase">Como foi o dia?</p>
                <div className="moods">
                  {MOODS.map(m => {
                    const on = ck.checkin ? ck.checkin.mood === m : mood === m
                    return (
                      <button
                        key={m}
                        className={'mood' + (on ? ' on' : '')}
                        type="button"
                        disabled={ck.checkin !== null}
                        onClick={() => setMood(m)}
                      >
                        {MOOD_LABELS[m]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                {ck.checkin ? (
                  <div className="ck-done">
                    Registrado às {horaSP(ck.checkin.created_at)} · <b>
                      {MOOD_LABELS[ck.checkin.mood as Mood]}
                      {ck.checkin.note ? ` · "${ck.checkin.note}"` : ''}
                    </b>
                  </div>
                ) : (
                  <>
                    <div className="ck-form">
                      <input
                        className="ck-note"
                        type="text"
                        placeholder="Uma linha sobre hoje (opcional)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                      />
                      <button
                        className="btn-sm roxo ck-save"
                        type="button"
                        disabled={mood === null || saving}
                        onClick={() => void handleSaveCheckin()}
                      >
                        Registrar
                      </button>
                    </div>
                    {saveError && <div className="ck-err">Não deu pra salvar. Tente de novo.</div>}
                  </>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 4 · hoje */}
        <section className="hoje boot b4" aria-label="Hoje">
          <div className="wrap in">
            <span className="eyebrow">Hoje</span>
            {data.hoje.length > 0 ? (
              data.hoje.map((item, i) =>
                item.money ? (
                  <span className="ev money" key={`${i}:${item.tx}`}>
                    {item.tag && <span className={'tag' + (item.due ? ' due' : '')}>{item.tag}</span>}
                    <span>{item.tx}</span>
                    <span className="num">{item.t}</span>
                  </span>
                ) : (
                  <span className="ev" key={`${i}:${item.tx}`}>
                    <time className="num">{item.t}</time>
                    <span>{item.tx}</span>
                  </span>
                ),
              )
            ) : data.loading ? (
              <span className="sk sk-ev" aria-hidden="true" />
            ) : (
              <span className="ev quiet"><span>Nada na agenda de hoje.</span></span>
            )}
          </div>
        </section>

        <div className="wrap">
          {/* 5 · números do mês (legendas deriváveis, sem comparativos inventados) */}
          <section className="nums boot b5" aria-label="Números do mês">
            <div>
              <p className="eyebrow">Saldo</p>
              <div className="v num">{fmtInt(nums?.saldo ?? 0)}</div>
              <div className="d num">receitas menos despesas</div>
            </div>
            <div>
              <p className="eyebrow">Receitas</p>
              <div className="v num">{fmtInt(nums?.receitas ?? 0)}</div>
              <div className="d num">este mês</div>
            </div>
            <div>
              <p className="eyebrow">Despesas</p>
              <div className="v num">{fmtInt(nums?.despesas ?? 0)}</div>
              <div className="d num">{despLegend}</div>
            </div>
            <div>
              <p className="eyebrow">Poupança</p>
              <div className="v num">{nums ? nums.poupancaPct : 0}%</div>
              <div className="d num">da receita</div>
            </div>
          </section>

          {/* 6 · suas áreas */}
          <section className="dims-sec boot b5" aria-label="Suas áreas">
            <div className="dims-head">
              <p className="eyebrow">Suas áreas</p>
              <Link href="/dashboard/score">Ver todas →</Link>
            </div>
            <div className="dims">
              {data.areas.ativas.length > 0 ? (
                data.areas.ativas.map(a => (
                  <div className="dimrow" key={a.n}>
                    <span className="di num">{a.n}</span>
                    <div>
                      <div className="nm">{a.nome}</div>
                      {a.meta && <div className="mt num">{a.meta}</div>}
                    </div>
                    <span className="sc num">
                      {a.score}
                      {a.tendencia !== undefined &&
                        (a.tendencia > 0 ? (
                          <span className="tr ele">▲{a.tendencia}</span>
                        ) : a.tendencia < 0 ? (
                          <span className="tr coral">▼{Math.abs(a.tendencia)}</span>
                        ) : (
                          <span className="tr t3">–</span>
                        ))}
                    </span>
                  </div>
                ))
              ) : !score ? (
                [0, 1, 2, 3].map(i => (
                  <div className="sk-dim" key={i} aria-hidden="true">
                    <span className="sk sk-di" />
                    <span className="sk sk-nm" />
                    <span className="sk sk-sc" />
                  </div>
                ))
              ) : null}
            </div>
            {data.areas.outras.length > 0 && (
              <p className="outras">Outras: {data.areas.outras.map(a => a.nome).join(' · ')}</p>
            )}
          </section>

          {/* 7 · atenção + metas */}
          <section className="aten" aria-label="Atenção e metas">
            <div className="rv">
              <p className="eyebrow">Atenção</p>
              {data.atencao.length > 0 ? (
                data.atencao.map((n, i) => (
                  <div
                    className={'nota' + (n.tipo === 'ok' ? ' ok' : n.tipo === 'warn' ? ' warn' : '')}
                    key={`${i}:${n.strong}`}
                  >
                    <span className="mark" />
                    <span className="tx"><strong>{n.strong}</strong> {n.texto}</span>
                    <span className="v num">{n.valor}</span>
                  </div>
                ))
              ) : data.loading ? (
                <div aria-hidden="true">
                  <span className="sk sk-l" />
                  <span className="sk sk-l c2" />
                </div>
              ) : (
                <p className="vazio">Nada pedindo atenção hoje.</p>
              )}
            </div>
            <div className="metas rv">
              <p className="eyebrow">Metas em andamento</p>
              {data.metas.length > 0 ? (
                data.metas.map(m => (
                  <div className="mrow" key={m.nome}>
                    <div className="r1">
                      <span className="nm">{m.nome}</span>
                      <span className="pct num">{m.pct}%</span>
                    </div>
                    <div className="track"><i style={{ width: `${Math.min(m.pct, 100)}%` }} /></div>
                    <div className="sub">{m.sub}</div>
                  </div>
                ))
              ) : data.loading ? (
                <div aria-hidden="true">
                  <span className="sk sk-l" />
                  <span className="sk sk-l c2" />
                </div>
              ) : (
                <p className="vazio">Sem metas ativas.</p>
              )}
            </div>
          </section>
        </div>

        {/* 8 · colofão */}
        <footer className="colofao">
          <span>Saldo do mês: <b className="num">{data.colofao.saldoMes}</b></span>
          <div className="r">
            {streakDias > 0 && (
              <span>Streak <b className="num">{streakDias} {streakDias === 1 ? 'dia' : 'dias'}</b></span>
            )}
            {data.colofao.badges !== '–' && (
              <span>Badges <b className="num">{data.colofao.badges}</b></span>
            )}
            <span>
              Última sincronização <b className="num" suppressHydrationWarning>{data.colofao.ultimaSinc}</b>
            </span>
          </div>
        </footer>
      </main>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={brief?.recs.map(r => r.title) ?? []}
        onClose={() => setCoachOpen(false)}
      />
    </>
  )
}
