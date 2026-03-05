'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Flame, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useStudyTracks, useSaveSession, useMenteDashboard,
  type SaveSessionData,
} from '@/hooks/use-mente'
import { PomodoroTimer } from '@/components/mente/PomodoroTimer'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { createEventFromPomodoro } from '@/lib/integrations/agenda'
import { useUserPlan } from '@/hooks/use-user-plan'

export default function TimerPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'
  const { isPro } = useUserPlan()

  const { tracks, loading: tracksLoading } = useStudyTracks()
  const saveSession = useSaveSession()
  const [syncToAgenda, setSyncToAgenda] = useState(false)
  const [jornadaXp, setJornadaXp] = useState(0)

  // RN-MNT-16: stats semanais
  const { weekHours, streak, recentSessions, activeTracks: dashTracks, reload: reloadStats } = useMenteDashboard()

  const activeTracks = tracks.filter(t => t.status === 'in_progress')

  // RN-MNT-18: XP local do modo Jornada
  useEffect(() => {
    if (typeof window === 'undefined') return
    setJornadaXp(Number(window.localStorage.getItem('sl_jornada_xp') ?? '0'))
  }, [])

  const handleSessionComplete = useCallback(async (data: Omit<SaveSessionData, 'session_notes'>) => {
    try {
      await saveSession({ ...data })
      // RN-MNT-13: registrar bloco de estudo na Agenda se opt-in
      if (syncToAgenda && data.focus_minutes > 0) {
        const trackName = activeTracks.find(t => t.id === data.track_id)?.name ?? null
        await createEventFromPomodoro({
          trackName,
          focusMinutes: data.focus_minutes,
          date: new Date().toISOString().split('T')[0],
        }).catch(() => {})
      }
      toast.success(`Sessão salva! ${data.focus_minutes}m de foco, ${data.cycles_completed} ciclos.`)
      await reloadStats()
    } catch {
      toast.error('Erro ao salvar sessão')
    }
  }, [saveSession, reloadStats, syncToAgenda, activeTracks])

  // Trilha mais estudada (maior total_hours entre as ativas)
  const topTrack = dashTracks.length > 0
    ? [...dashTracks].sort((a, b) => (b.total_hours ?? 0) - (a.total_hours ?? 0))[0]
    : null

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/mente')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Mente
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          ⏱ Timer Pomodoro
        </h1>
      </div>

      {/* Jornada insight */}
      <JornadaInsight
        text={
          streak.current_streak > 0
            ? <>🔥 Você está em uma sequência de <strong className="text-[#f97316]">{streak.current_streak} dias</strong> de estudo! {weekHours.toFixed(1)}h de foco esta semana. Continue assim!</>
            : <>Use o Pomodoro para criar o hábito de estudo. Uma sessão por dia já constrói consistência.</>
        }
      />

      <div className="grid grid-cols-[minmax(0,520px)_1fr] gap-6 max-lg:grid-cols-1">

        {/* ── Coluna esquerda: Timer ── */}
        <div className="flex flex-col gap-5">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 sl-fade-up">
            {tracksLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 rounded-full border-2 border-[#a855f7] border-t-transparent animate-spin" />
              </div>
            ) : (
              <PomodoroTimer
                tracks={activeTracks}
                onSessionComplete={handleSessionComplete}
                isJornada={isJornada}
                enableAmbient={isJornada && isPro}
                onXpEarned={({ gained, total }) => {
                  setJornadaXp(total)
                  toast.success(`+${gained} XP de foco conquistados!`)
                }}
              />
            )}
            {/* RN-MNT-13: Sync to Agenda */}
            <label className="flex items-center gap-2 cursor-pointer select-none mt-4 justify-center">
              <input
                type="checkbox"
                checked={syncToAgenda}
                onChange={e => setSyncToAgenda(e.target.checked)}
                className="accent-[#a855f7] w-3.5 h-3.5"
              />
              <span className="text-[11px] text-[var(--sl-t3)]">Registrar sessão na Agenda ao finalizar</span>
            </label>
          </div>

          {/* Técnica Pomodoro — tips */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-delay-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-3">Técnica Pomodoro</p>
            <div className="flex flex-col gap-2">
              {[
                { step: '1', text: 'Escolha uma tarefa ou trilha para estudar' },
                { step: '2', text: 'Trabalhe com foco total pelo tempo definido' },
                { step: '3', text: 'Faça uma pausa curta ao final de cada ciclo' },
                { step: '4', text: 'A cada 4 ciclos, faça uma pausa longa' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#a855f7', color: 'white' }}>
                    <span className="text-[10px] font-bold">{step}</span>
                  </div>
                  <p className="text-[12px] text-[var(--sl-t2)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Coluna direita: Stats (RN-MNT-16) ── */}
        <div className="flex flex-col gap-4 sl-delay-2">

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#f97316' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Streak</p>
              <div className="flex items-center gap-1">
                <Flame size={14} className="text-[#f97316] shrink-0" />
                <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                  {streak.current_streak}d
                </span>
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                Recorde: {streak.longest_streak}d
              </p>
            </div>

            {/* Horas esta semana */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#a855f7' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Esta semana</p>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-[#a855f7] shrink-0" />
                <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                  {weekHours.toFixed(1)}h
                </span>
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {weekHours > 0 ? `~${(weekHours / 7).toFixed(1)}h/dia` : 'Sem foco ainda'}
              </p>
            </div>

            {/* Top track */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#0055ff' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Top trilha</p>
              <div className="flex items-center gap-1">
                <BookOpen size={14} className="text-[#0055ff] shrink-0" />
                <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                  {topTrack ? `${(topTrack.total_hours ?? 0).toFixed(0)}h` : '—'}
                </span>
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5 truncate">
                {topTrack?.name ?? 'Sem trilhas'}
              </p>
            </div>
          </div>

          {isJornada && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">XP Jornada</p>
              <p className="font-[Syne] font-extrabold text-2xl text-sl-grad">{jornadaXp}</p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-1">Ganhe XP ao concluir sessões de foco.</p>
            </div>
          )}

          {/* Sessões recentes */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🕐 Sessões Recentes</h3>

            {recentSessions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma sessão ainda.</p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-1">Inicie o timer para registrar sua primeira!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentSessions.map(session => {
                  const date = new Date(session.recorded_at)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dateLabel = isToday
                    ? 'Hoje'
                    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 bg-[var(--sl-s2)] rounded-xl"
                    >
                      {/* Círculo cor */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(168,85,247,0.15)' }}>
                        <span className="text-[12px]">⏱</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">
                          {session.track?.name ?? 'Estudo livre'}
                        </p>
                        <p className="text-[10px] text-[var(--sl-t3)]">
                          {session.cycles_completed} ciclo{session.cycles_completed !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-[DM_Mono] text-[13px] font-medium text-[#a855f7]">
                          {session.focus_minutes}m
                        </p>
                        <p className="text-[10px] text-[var(--sl-t3)]">{dateLabel}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Streak motivacional (Jornada) */}
          {streak.current_streak >= 3 && (
            <div className="jornada-only bg-gradient-to-br from-[#f97316]/10 to-[#a855f7]/10
                            border border-[#f97316]/20 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🔥</p>
              <p className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">
                {streak.current_streak} dias de foco!
              </p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-1">
                Você está construindo um hábito sólido. Continue!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
