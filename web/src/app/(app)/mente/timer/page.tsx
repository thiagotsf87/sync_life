'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Clock, BookOpen, Brain, ChevronLeft } from 'lucide-react'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'
import { ModuleHeader } from '@/components/ui/module-header'
import { toast } from 'sonner'
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

  // Subtitle for ModuleHeader
  const selectedTrackName = activeTracks.find(t => t.id === null)?.name
  const subtitleParts: string[] = ['Foco profundo']
  if (activeTracks.length > 0) subtitleParts.push(activeTracks[0].name)

  return (
    <div className="max-w-[1160px] mx-auto px-4 lg:px-10 lg:py-9 lg:pb-16">

      <MobileFormHeader
        moduleId="mente"
        title="Timer Pomodoro"
        onBack={() => router.push('/mente')}
      />

      {/* Desktop ModuleHeader */}
      <div className="hidden lg:block">
        <ModuleHeader
          icon={Clock}
          iconBg="rgba(234,179,8,.1)"
          iconColor="#eab308"
          title="Timer Pomodoro"
          subtitle={subtitleParts.join(' \u00B7 ')}
        >
          <button
            onClick={() => router.push('/mente')}
            className="flex items-center gap-[7px] px-[14px] py-[7px] rounded-[11px] text-[12px] font-semibold
                       bg-transparent text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <ChevronLeft size={14} />
            Voltar
          </button>
        </ModuleHeader>
      </div>

      {/* Jornada insight */}
      <JornadaInsight
        text={
          streak.current_streak > 0
            ? <>Voce esta em uma sequencia de <strong className="text-[#f97316]">{streak.current_streak} dias</strong> de estudo! {weekHours.toFixed(1)}h de foco esta semana. Continue assim!</>
            : <>Use o Pomodoro para criar o habito de estudo. Uma sessao por dia ja constroi consistencia.</>
        }
      />

      <div className="grid grid-cols-[minmax(0,540px)_1fr] gap-6 max-lg:grid-cols-1">

        {/* Left: Timer */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-9 sl-fade-up text-center">
            {tracksLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 rounded-full border-2 border-[#eab308] border-t-transparent animate-spin" />
              </div>
            ) : (
              <PomodoroTimer
                tracks={activeTracks}
                onSessionComplete={handleSessionComplete}
                enableAmbient={isPro}
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
                className="accent-[#eab308] w-3.5 h-3.5"
              />
              <span className="text-[11px] text-[var(--sl-t3)]">Registrar sessao na Agenda ao finalizar</span>
            </label>
          </div>

          {/* Collapsible settings card */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[18px_22px] sl-delay-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-3">Tecnica Pomodoro</p>
            <div className="flex flex-col gap-2">
              {[
                { step: '1', text: 'Escolha uma tarefa ou trilha para estudar' },
                { step: '2', text: 'Trabalhe com foco total pelo tempo definido' },
                { step: '3', text: 'Faca uma pausa curta ao final de cada ciclo' },
                { step: '4', text: 'A cada 4 ciclos, faca uma pausa longa' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#eab308', color: '#000' }}>
                    <span className="text-[10px] font-bold">{step}</span>
                  </div>
                  <p className="text-[12px] text-[var(--sl-t2)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats (RN-MNT-16) */}
        <div className="flex flex-col gap-[14px] sl-delay-2">

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-[10px]">
            {/* Streak */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b" style={{ background: '#f97316' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Streak</p>
              <div className="flex items-center gap-1">
                <Flame size={16} className="text-[#f97316] shrink-0" />
                <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                  {streak.current_streak}d
                </span>
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">
                Recorde: {streak.longest_streak}d
              </p>
            </div>

            {/* Horas esta semana */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b" style={{ background: '#eab308' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Semana</p>
              <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                {weekHours.toFixed(1)}h
              </span>
              <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">
                {weekHours > 0 ? `~${(weekHours / 7).toFixed(1)}h/dia` : 'Sem foco ainda'}
              </p>
            </div>

            {/* Top track */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-4 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b" style={{ background: '#0055ff' }} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Top trilha</p>
              <span className="font-[DM_Mono] font-bold text-lg text-[var(--sl-t1)]">
                {topTrack ? `${(topTrack.total_hours ?? 0).toFixed(0)}h` : '\u2014'}
              </span>
              <p className="text-[10px] text-[var(--sl-t3)] mt-[3px] truncate">
                {topTrack?.name ?? 'Sem trilhas'}
              </p>
            </div>
          </div>

          {/* Session history — horizontal scroll per prototype */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[18px] transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] mb-[14px]">
              <Clock size={16} className="text-[#eab308]" />
              <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Historico de Sessoes</h3>
            </div>

            {recentSessions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma sessao ainda.</p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-1">Inicie o timer para registrar sua primeira!</p>
              </div>
            ) : (
              <div className="flex gap-[10px] overflow-x-auto pb-1.5">
                {recentSessions.map(session => {
                  const date = new Date(session.recorded_at)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dateLabel = isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  const hours = Math.floor(session.focus_minutes / 60)
                  const mins = session.focus_minutes % 60

                  return (
                    <div
                      key={session.id}
                      className="min-w-[170px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-[14px] shrink-0"
                    >
                      <p className="text-[12px] font-medium text-[var(--sl-t1)] mb-1 truncate">
                        {session.track?.name ?? 'Estudo livre'}
                      </p>
                      <p className="font-[DM_Mono] text-[18px] font-bold text-[#eab308]">
                        {hours}h {mins.toString().padStart(2, '0')}m
                      </p>
                      <p className="text-[10px] text-[var(--sl-t3)] mt-1">
                        {session.cycles_completed} ciclo{session.cycles_completed !== 1 ? 's' : ''} \u00B7 {dateLabel} {timeLabel}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Streak motivacional */}
          {streak.current_streak >= 3 && (
            <div
              className="rounded-[18px] p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,.08), rgba(249,115,22,.06))',
                border: '1px solid rgba(234,179,8,.15)',
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Flame size={22} className="text-[#f97316]" />
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  {streak.current_streak} dias de foco!
                </span>
              </div>
              <p className="text-[12px] text-[var(--sl-t2)]">
                Voce esta construindo um habito solido. Continue!
              </p>
            </div>
          )}

          {/* XP Jornada */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">XP Jornada</p>
            <p className="font-[Syne] font-extrabold text-2xl text-sl-grad">{jornadaXp}</p>
            <p className="text-[11px] text-[var(--sl-t2)] mt-1">Ganhe XP ao concluir sessoes de foco.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
