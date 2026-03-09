'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { jornadaLabel } from '@/lib/jornada-labels'
import {
  useMenteDashboard,
  useStudyTracks,
  useStudySessions,
  useCreateTrack,
} from '@/hooks/use-mente'
import type { StudyTrack, StudyStreak, FocusSession, CreateTrackData } from '@/hooks/use-mente'
import { MOCK_TRACKS, MOCK_SESSIONS, MOCK_STREAK } from '@/lib/mente-mock-data'
import { MenteTrackCardMobile } from '@/components/mente/mobile/MenteTrackCardMobile'
import { MenteTimerTab } from '@/components/mente/mobile/MenteTimerTab'
import type { TimerPhase } from '@/components/mente/mobile/MenteTimerTab'
import { PHASE_DURATIONS } from '@/components/mente/mobile/MenteTimerTab'
import { MenteSessoesTab } from '@/components/mente/mobile/MenteSessoesTab'
import { MenteBibliotecaTab } from '@/components/mente/mobile/MenteBibliotecaTab'
import { MenteTrackWizardMobile } from '@/components/mente/mobile/MenteTrackWizardMobile'
import { toast } from 'sonner'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.12)'
const MENTE_BORDER = 'rgba(234,179,8,0.3)'
const MENTE_GRAD = 'linear-gradient(135deg, #eab308, #f97316)'

type Tab = 'dashboard' | 'trilhas' | 'timer' | 'sessoes' | 'biblioteca'

const TABS: { key: Tab; label: string; labelKey: string }[] = [
  { key: 'dashboard', label: 'Dashboard', labelKey: 'dashboard' },
  { key: 'trilhas', label: 'Trilhas', labelKey: 'trilhas' },
  { key: 'timer', label: 'Timer', labelKey: 'timer' },
  { key: 'sessoes', label: 'Sessões', labelKey: 'sessoes' },
  { key: 'biblioteca', label: 'Biblioteca', labelKey: 'biblioteca' },
]

export function MenteMobile() {
  const router = useRouter()

  const {
    activeTracks: realActiveTracks,
    weekHours: realWeekHours,
    todaySessions: realTodaySessions,
    streak: realStreak,
    recentSessions: realRecentSessions,
    loading,
  } = useMenteDashboard()
  const { tracks: realTracks, reload: reloadTracks } = useStudyTracks()
  const { sessions: realSessions } = useStudySessions(30)

  // ─── Mock fallback (ativo quando Supabase retorna vazio) ───────
  const activeTracks = realActiveTracks.length > 0 ? realActiveTracks : MOCK_TRACKS
  const weekHours    = realWeekHours    > 0 ? realWeekHours    : parseFloat((MOCK_SESSIONS.reduce((s, ss) => s + ss.focus_minutes, 0) / 60).toFixed(1))
  const todaySessions= realTodaySessions> 0 ? realTodaySessions: MOCK_SESSIONS.filter((s) => new Date(s.recorded_at).toDateString() === new Date().toDateString()).length
  const streak       = realStreak.current_streak > 0 ? realStreak : MOCK_STREAK
  const recentSessions = realRecentSessions.length > 0 ? realRecentSessions : MOCK_SESSIONS.slice(0, 5)
  const tracks       = realTracks.length > 0 ? realTracks : MOCK_TRACKS
  const sessions     = realSessions.length > 0 ? realSessions : MOCK_SESSIONS
  const createTrack = useCreateTrack()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [filterStatus, setFilterStatus] = useState<'in_progress' | 'completed' | 'explore'>('in_progress')
  const [wizardOpen, setWizardOpen] = useState(false)

  // Timer state — persists across tab switches
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(PHASE_DURATIONS.focus)
  const [timerPhase, setTimerPhase] = useState<TimerPhase>('focus')
  const [cycleCount, setCycleCount] = useState(0)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tabsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll active tab into view
  useEffect(() => {
    const container = tabsRef.current
    if (!container) return
    const activeEl = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeEl) {
      const scrollLeft = activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeTab])

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            advancePhase()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerRunning])

  function advancePhase() {
    setTimerRunning(false)
    setCycleCount((prev) => {
      const next = prev + 1
      if (timerPhase === 'focus') {
        const nextPhase: TimerPhase = next % 4 === 0 ? 'long_break' : 'short_break'
        setTimerPhase(nextPhase)
        setTimerSeconds(PHASE_DURATIONS[nextPhase])
        toast.success(next % 4 === 0 ? '🌟 Pausa longa! Você completou 4 sessões.' : '☕ Hora da pausa!')
      } else {
        setTimerPhase('focus')
        setTimerSeconds(PHASE_DURATIONS.focus)
        toast(`🧠 Pronto para mais ${PHASE_DURATIONS.focus / 60} min de foco?`)
      }
      return next
    })
  }

  function handleTogglePlay() {
    setTimerRunning((prev) => !prev)
  }

  function handleReset() {
    setTimerRunning(false)
    setTimerSeconds(PHASE_DURATIONS[timerPhase])
  }

  function handleSkip() {
    setTimerRunning(false)
    advancePhase()
  }

  // Streak heatmap — 28-day calendar grid aligned to Mon-Sun
  const heatmap28Days = useMemo(() => {
    const today = new Date()
    const todayDow = today.getDay() // 0=Sun...6=Sat
    const dowMon = (todayDow + 6) % 7 // Mon=0...Sun=6
    const thisWeekMon = new Date(today)
    thisWeekMon.setDate(today.getDate() - dowMon)
    thisWeekMon.setHours(0, 0, 0, 0)
    const startDate = new Date(thisWeekMon)
    startDate.setDate(thisWeekMon.getDate() - 21)
    const result: number[] = []
    const cur = new Date(startDate)
    for (let i = 0; i < 28; i++) {
      if (cur > today) {
        result.push(-1)
      } else {
        const dayStr = cur.toISOString().split('T')[0]
        const hasSession = sessions.some((s) => s.recorded_at.startsWith(dayStr))
        const diffDays = Math.floor((today.getTime() - cur.getTime()) / 86400000)
        const inStreak = streak.current_streak > 0 && diffDays < streak.current_streak
        result.push(hasSession || inStreak ? 1 : 0)
      }
      cur.setDate(cur.getDate() + 1)
    }
    return result
  }, [sessions, streak])

  async function handleCreateTrack(data: CreateTrackData) {
    await createTrack(data)
    toast.success(`Trilha "${data.name}" criada!`)
    setWizardOpen(false)
    await reloadTracks()
  }

  const filteredTracks = tracks.filter((t) => {
    if (filterStatus === 'completed') return t.status === 'completed'
    if (filterStatus === 'explore') return t.status === 'paused' || t.status === 'abandoned'
    return t.status === 'in_progress'
  })

  const activeTracks_ = tracks.filter((t) => t.status === 'in_progress')
  const isAtLimit = activeTracks_.length >= 3

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-3">
        <div>
            <p className="text-[12px] font-semibold mb-[2px]" style={{ color: MENTE_COLOR }}>
            🧠 {jornadaLabel('mente', 'module', 'Mente')} · {streak.current_streak > 0 ? `🔥 ${streak.current_streak}d streak` : 'Comece hoje!'}
          </p>
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            Sua mente hoje
          </h1>
        </div>

        {activeTab === 'trilhas' && (
          <button
            onClick={() => setWizardOpen(true)}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white"
            style={{ background: MENTE_COLOR }}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        ref={tabsRef}
        className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              data-active={active}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors"
              style={{
                color: active ? MENTE_COLOR : 'var(--sl-t3)',
                borderBottomColor: active ? MENTE_COLOR : 'transparent',
              }}
            >
              {jornadaLabel('mente', tab.labelKey, tab.label)}
            </button>
          )
        })}
      </div>

      {/* ── Dashboard tab ─────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div>
          {loading ? (
            <div className="px-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI grid 2×2 */}
              <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                {[
                  { label: 'Horas esta semana', value: `${weekHours}h`, color: MENTE_COLOR, sub: 'Meta: 10h/semana' },
                  { label: 'Streak de estudo', value: `${streak.current_streak}dias`, color: '#f59e0b', sub: streak.current_streak > 0 ? `Recorde: ${streak.longest_streak}d` : 'Comece hoje!' },
                  { label: 'Trilhas ativas', value: String(activeTracks.length), color: 'var(--sl-t1)', sub: `Limite FREE: 3` },
                  { label: 'Pomodoros hoje', value: String(todaySessions), color: '#10b981', sub: `${(todaySessions * 25 / 60).toFixed(1)}h de foco puro` },
                ].map(({ label, value, color, sub }) => (
                  <div
                    key={label}
                    className="rounded-[10px] p-3"
                    style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
                  >
                    <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">{label}</p>
                    <p className="font-[DM_Mono] text-[20px] font-bold leading-none" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Streak heatmap — 7×4 calendar grid */}
              <div
                className="mx-4 mb-3 rounded-2xl p-4"
                style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
              >
                <div className="flex justify-between items-center mb-[10px]">
                  <span className="text-[14px] font-semibold text-[var(--sl-t1)]">🔥 Streak de estudos</span>
                  <span className="font-[DM_Mono] text-[14px]" style={{ color: '#f59e0b' }}>
                    {streak.current_streak} dias
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-[3px] mb-[4px]">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-medium text-[var(--sl-t3)]">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-[3px]">
                  {heatmap28Days.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-[4px]"
                      style={{
                        aspectRatio: '1',
                        background: v < 0
                          ? 'transparent'
                          : v === 1
                          ? 'rgba(234,179,8,0.85)'
                          : 'var(--sl-s3)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Active tracks */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">
                Trilhas Ativas
              </p>

              {activeTracks.length === 0 ? (
                <div className="mx-4 rounded-2xl p-6 text-center" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
                  <p className="text-[13px] text-[var(--sl-t2)]">Nenhuma trilha ativa ainda.</p>
                  <button
                    onClick={() => { setActiveTab('trilhas'); setWizardOpen(true) }}
                    className="text-[13px] font-medium mt-2"
                    style={{ color: MENTE_COLOR }}
                  >
                    + Criar trilha →
                  </button>
                </div>
              ) : (
                <div className="px-4 space-y-2">
                  {activeTracks.slice(0, 3).map((track) => (
                    <MenteTrackCardMobile
                      key={track.id}
                      track={track}
                      variant="compact"
                      onClick={() => router.push(`/mente/trilhas/${track.id}`)}
                    />
                  ))}
                </div>
              )}

              {/* Quick-start CTA */}
              <div className="px-4 mt-3">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="w-full flex items-center justify-between p-[14px] rounded-[10px]"
                  style={{
                    background: 'linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.04))',
                    border: `1.5px solid ${MENTE_BORDER}`,
                  }}
                >
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[22px]">⏱️</span>
                    <div className="text-left">
                      <div className="text-[14px] font-semibold text-[var(--sl-t1)]">Iniciar sessão de foco</div>
                      <div className="text-[12px] text-[var(--sl-t2)]">
                        Pomodoro 25 min · {activeTracks[0]?.name ?? 'Sessão livre'}
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: MENTE_COLOR }}
                  >
                    <svg viewBox="0 0 24 24" fill="white" width={18} height={18}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* AI insight */}
              <div
                className="mx-4 mt-3 mb-2 rounded-2xl p-4 flex items-start gap-[10px]"
                style={{ background: 'rgba(0,85,255,0.06)', border: '1px solid rgba(0,85,255,0.15)' }}
              >
                <span className="text-[18px]">🤖</span>
                <div className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                  {streak.current_streak > 7
                    ? <>Excelente ritmo! <span style={{ color: MENTE_COLOR }}>🔥 {streak.current_streak} dias</span> de streak. Suas sessões mais longas são de manhã — continue nesse horário!</>
                    : <>Tente estudar <span style={{ color: MENTE_COLOR }}>25 min por dia</span> para construir consistência. Pequenos hábitos criam grandes resultados!</>
                  }
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Trilhas tab ───────────────────────────────────────────── */}
      {activeTab === 'trilhas' && (
        <div>
          {/* Filter pills */}
          <div className="flex gap-1 px-4 pb-3">
            {([
              { key: 'in_progress', label: 'Ativas' },
              { key: 'completed', label: 'Concluídas' },
              { key: 'explore', label: 'Explorar' },
            ] as const).map(({ key, label }) => {
              const active = filterStatus === key
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className="px-[14px] py-[6px] rounded-full text-[13px] font-medium transition-colors"
                  style={{
                    background: active ? MENTE_COLOR : 'var(--sl-s1)',
                    color: active ? '#fff' : 'var(--sl-t2)',
                    border: active ? 'none' : '1px solid var(--sl-border)',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">
            MINHAS TRILHAS ({activeTracks_.length}/3 FREE)
          </p>

          {filteredTracks.length === 0 ? (
            <div className="mx-4 py-8 text-center text-[13px] text-[var(--sl-t2)]">
              Nenhuma trilha aqui.
            </div>
          ) : (
            filteredTracks.map((track) => (
              <MenteTrackCardMobile
                key={track.id}
                track={track}
                variant="full"
                onClick={() => router.push(`/mente/trilhas/${track.id}`)}
              />
            ))
          )}

          {/* PRO upsell when at limit */}
          {isAtLimit && filterStatus === 'in_progress' && (
            <div className="px-4 pb-3">
              <div
                className="rounded-[10px] p-[14px] flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(139,92,246,0.1))',
                  border: '1.5px solid rgba(245,158,11,0.3)',
                }}
              >
                <span className="text-[24px]">💎</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold" style={{ color: '#f59e0b' }}>
                    Quer mais trilhas?
                  </div>
                  <div className="text-[12px] text-[var(--sl-t2)] mt-[2px]">
                    PRO: trilhas ilimitadas + IA personalizada
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Timer tab ─────────────────────────────────────────────── */}
      {activeTab === 'timer' && (
        <MenteTimerTab
          timerRunning={timerRunning}
          timerSeconds={timerSeconds}
          timerPhase={timerPhase}
          cycleCount={cycleCount}
          selectedTrackId={selectedTrackId}
          tracks={activeTracks}
          todaySessions={todaySessions}
          weekHours={weekHours}
          streak={streak}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onSkip={handleSkip}
          onSelectTrack={setSelectedTrackId}
        />
      )}

      {/* ── Sessões tab ───────────────────────────────────────────── */}
      {activeTab === 'sessoes' && (
        <MenteSessoesTab
          sessions={sessions}
          weekHours={weekHours}
          streak={streak}
        />
      )}

      {/* ── Biblioteca tab ────────────────────────────────────────── */}
      {activeTab === 'biblioteca' && <MenteBibliotecaTab />}

      {/* Track wizard */}
      <MenteTrackWizardMobile
        open={wizardOpen}
        existingTrackCount={activeTracks_.length}
        onClose={() => setWizardOpen(false)}
        onSave={handleCreateTrack}
      />
    </div>
  )
}
