'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Pencil, Trash2, Clock, Volume2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFocusSessions, type FocusSession, type FocusSessionFormData } from '@/hooks/use-focus-sessions'
import { useMetas } from '@/hooks/use-metas'
import { useAgenda } from '@/hooks/use-agenda'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ModuleHeader } from '@/components/ui/module-header'
import { FocusSessionModal } from '@/components/agenda/FocusSessionModal'
import { playCompletionSound, startAmbientSound, stopAmbientSound, AMBIENT_OPTIONS, type AmbientSound } from '@/lib/timer-sounds'

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TEMPO_TABS = [
  { label: 'Dashboard', href: '/tempo' },
  { label: 'Agenda', href: '/tempo/agenda' },
  { label: 'Semanal', href: '/tempo/semanal' },
  { label: 'Mensal', href: '/tempo/mensal' },
  { label: 'Review', href: '/tempo/review' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

type FilterPeriod = 'today' | 'week' | 'month'
type TimerState = 'idle' | 'running' | 'paused' | 'completed'
type ActiveTab = 'timer' | 'history'

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function groupSessionsByDate(sessions: FocusSession[]): { date: string; items: FocusSession[] }[] {
  const map: Record<string, FocusSession[]> = {}
  for (const s of sessions) {
    if (!map[s.date]) map[s.date] = []
    map[s.date].push(s)
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: FilterPeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
]

const DURATION_PRESETS = [15, 25, 45, 60]

export default function BlocosFocoPage() {
  const pathname = usePathname()

  // ── Filter + sessions ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterPeriod>('week')
  const { sessions, loading, kpis, create, update, remove } = useFocusSessions(filter)
  const { goals } = useMetas()
  const goalOptions = goals.map(g => ({ id: g.id, name: g.name, icon: g.icon }))

  const { events: weekEvents } = useAgenda({ mode: 'week', referenceDate: new Date() })
  const eventOptions = weekEvents.slice(0, 20).map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
  }))

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer')

  // ── Timer state ────────────────────────────────────────────────────────────
  const [duration, setDuration] = useState(25)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [selectedGoalId, setSelectedGoalId] = useState('')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<Date | null>(null)

  // Ambient sound state (Jornada only)
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none')

  // Session count for Jornada badge
  const todaySessionCount = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length

  // ── Timer effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setTimerState('completed')
            playCompletionSound()
            stopAmbientSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerState !== 'paused') {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerState])

  // Stop ambient sound on unmount
  useEffect(() => () => stopAmbientSound(), [])

  const handleAmbientChange = useCallback((sound: AmbientSound) => {
    setAmbientSound(sound)
    if (timerState === 'running') {
      startAmbientSound(sound)
    } else {
      stopAmbientSound()
    }
  }, [timerState])

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    session?: FocusSession | null
  }>({ open: false, mode: 'create' })

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleSave(data: FocusSessionFormData) {
    try {
      if (modal.mode === 'create') {
        await create(data)
        toast.success('Sessão registrada!')
      } else if (modal.session) {
        await update(modal.session.id, data)
        toast.success('Sessão atualizada!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id)
      toast.success('Sessão excluída!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  async function handleRegister() {
    const durationMins = Math.ceil((duration * 60 - timeLeft) / 60)
    if (durationMins < 5) {
      toast.error('Sessão muito curta (mínimo 5 min)')
      return
    }
    try {
      await create({
        duration_minutes: durationMins,
        date: new Date().toISOString().split('T')[0],
        start_time: startedAtRef.current
          ? startedAtRef.current.toTimeString().slice(0, 5)
          : undefined,
        goal_id: selectedGoalId || undefined,
      })
      toast.success(`🎯 +${durationMins}min registrados!`)
      setTimerState('idle')
      setTimeLeft(duration * 60)
      startedAtRef.current = null
    } catch {
      toast.error('Erro ao registrar sessão')
    }
  }

  // ── Dados agrupados ────────────────────────────────────────────────────────
  const grouped = groupSessionsByDate(sessions)

  // ── SVG ring values ────────────────────────────────────────────────────────
  const ringR = 88
  const ringDasharray = 2 * Math.PI * ringR
  const ringDashoffset = ringDasharray * (1 - timeLeft / (duration * 60))

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Sub-nav underline tabs (desktop) */}
      <div className="hidden lg:flex border-b border-[var(--sl-border)] mb-5">
        {TEMPO_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={cn(
              'relative px-4 py-2.5 text-[13px] transition-colors',
              pathname === tab.href
                ? 'text-[#06b6d4] font-semibold'
                : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
            )}>
            {tab.label}
            {pathname === tab.href && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[3px] rounded-t bg-[#06b6d4]" />
            )}
          </Link>
        ))}
      </div>

      {/* ① ModuleHeader */}
      <ModuleHeader
        icon={Target}
        iconBg="rgba(6,182,212,.1)"
        iconColor="#06b6d4"
        title="Modo Foco"
        subtitle="Timer Pomodoro com sons ambiente e historico de sessoes"
      >
        {timerState === 'running' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold bg-[rgba(6,182,212,.1)] text-[#06b6d4] border border-[rgba(6,182,212,.2)]">
            <Clock size={12} /> Sessao ativa
          </span>
        )}
      </ModuleHeader>

      {/* ② Split layout: Timer (left) + History (right) */}
      <div className="grid grid-cols-[1fr_340px] gap-3.5 max-lg:grid-cols-1">

      {/* LEFT: Timer */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up transition-colors hover:border-[var(--sl-border-h)] flex flex-col items-center" style={{ padding: '40px 24px' }}>

          {/* Session count badge */}
          <div className="text-center mb-4">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20">
              Sessão {todaySessionCount + 1} de 4
            </span>
          </div>

          {/* Duration presets — only when idle */}
          {timerState === 'idle' && (
            <div className="flex gap-2 justify-center mb-6 flex-wrap">
              {DURATION_PRESETS.map(d => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); setTimeLeft(d * 60) }}
                  className={cn(
                    'px-4 py-2 rounded-[10px] text-[13px] font-semibold border transition-all',
                    duration === d
                      ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}
                >
                  {d}min
                </button>
              ))}
            </div>
          )}

          {/* SVG Ring with gradient + drop-shadow */}
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: 260, height: 260 }}>
              <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 12px rgba(6,182,212,.25))' }}>
                <defs>
                  <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0055ff" />
                  </linearGradient>
                </defs>
                <circle cx="130" cy="130" r="115" fill="none" stroke="var(--sl-s3)" strokeWidth="12" />
                <circle
                  cx="130" cy="130" r="115" fill="none"
                  stroke="url(#timerGrad)" strokeWidth="12" strokeLinecap="round"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 115}`,
                    strokeDashoffset: `${2 * Math.PI * 115 * (1 - (1 - timeLeft / (duration * 60)))}`,
                    transition: timerState === 'running' ? 'stroke-dashoffset 1s linear' : 'none',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[DM_Mono] font-medium text-[52px] text-[var(--sl-t1)] leading-none">
                  {formatTime(timeLeft)}
                </span>
                {timerState === 'running' && (
                  <span className="text-[12px] text-[#06b6d4] mt-2 font-medium">de {duration}:00</span>
                )}
                {timerState === 'paused' && (
                  <span className="text-[12px] text-[#f59e0b] mt-2 font-medium">Pausado</span>
                )}
                {timerState === 'idle' && (
                  <span className="text-[12px] text-[var(--sl-t2)] mt-2">de {duration}:00</span>
                )}
                {timerState === 'completed' && (
                  <span className="text-[12px] text-[#10b981] mt-2 font-medium">Concluido</span>
                )}
              </div>
            </div>
          </div>

          {/* Completed state */}
          {timerState === 'completed' && (
            <div className="text-center mb-6">
              <p className="text-xl mb-4">🎉</p>
              <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-1">Sessão concluída!</p>
              <p className="text-[12px] text-[var(--sl-t2)] mb-4">{duration}min de foco intenso</p>
              <div className="flex gap-2 max-w-[300px] mx-auto">
                <button
                  onClick={handleRegister}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#03071a] hover:opacity-90 transition-opacity"
                  style={{ background: '#06b6d4' }}
                >
                  Registrar Sessão
                </button>
                <button
                  onClick={() => { setTimerState('idle'); setTimeLeft(duration * 60); startedAtRef.current = null }}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  Nova Sessão
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          {timerState !== 'completed' && (
            <div className="flex gap-2 justify-center max-w-[300px] mx-auto">
              {timerState === 'idle' && (
                <button
                  onClick={() => { setTimerState('running'); startedAtRef.current = new Date(); if (ambientSound !== 'none') startAmbientSound(ambientSound) }}
                  className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold text-[#03071a] hover:opacity-90 transition-opacity"
                  style={{ background: '#06b6d4' }}
                >
                  ▶ Iniciar
                </button>
              )}
              {timerState === 'running' && (
                <>
                  <button
                    onClick={() => { setTimerState('paused'); stopAmbientSound() }}
                    className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold text-[#03071a] hover:opacity-90 transition-opacity"
                    style={{ background: '#f59e0b' }}
                  >
                    ⏸ Pausar
                  </button>
                  <button
                    onClick={() => { setTimerState('idle'); setTimeLeft(duration * 60); startedAtRef.current = null; stopAmbientSound() }}
                    className="px-4 py-3 rounded-[10px] text-[14px] font-semibold border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                  >
                    ⏹
                  </button>
                </>
              )}
              {timerState === 'paused' && (
                <>
                  <button
                    onClick={() => { setTimerState('running'); if (ambientSound !== 'none') startAmbientSound(ambientSound) }}
                    className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold text-[#03071a] hover:opacity-90 transition-opacity"
                    style={{ background: '#06b6d4' }}
                  >
                    ▶ Retomar
                  </button>
                  <button
                    onClick={() => { setTimerState('idle'); setTimeLeft(duration * 60); startedAtRef.current = null; stopAmbientSound() }}
                    className="px-4 py-3 rounded-[10px] text-[14px] font-semibold border border-[#f43f5e] text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                  >
                    ⏹
                  </button>
                </>
              )}
            </div>
          )}

          {/* Goal selector — when idle */}
          {/* Ambient sound selector */}
          {timerState !== 'completed' && (
            <div className="mt-4 max-w-[300px] mx-auto">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Volume2 size={12} className="text-[var(--sl-t3)]" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">
                  Som ambiente
                </label>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {AMBIENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAmbientChange(opt.value)}
                    className="px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors"
                    style={{
                      background: ambientSound === opt.value ? 'rgba(6,182,212,0.15)' : 'var(--sl-s2)',
                      border: ambientSound === opt.value ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--sl-border)',
                      color: ambientSound === opt.value ? '#06b6d4' : 'var(--sl-t2)',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {timerState === 'idle' && goalOptions.length > 0 && (
            <div className="mt-4 max-w-[300px] mx-auto">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                Vincular meta (opcional)
              </label>
              <select
                value={selectedGoalId}
                onChange={e => setSelectedGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
              >
                <option value="">Sem meta vinculada</option>
                {goalOptions.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.icon ?? '🎯'} {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Cycles / Focus / Streak stats strip */}
          <div className="mt-7 flex gap-7 px-7 py-[18px] bg-[var(--sl-s2)] rounded-[14px] border border-[var(--sl-border)] w-full max-w-[360px]">
            <div className="text-center">
              <p className="text-[10px] text-[var(--sl-t3)] mb-[3px]">Ciclos</p>
              <p className="font-[DM_Mono] text-[20px] font-medium text-[var(--sl-t1)]">{todaySessionCount}/4</p>
            </div>
            <div className="w-px bg-[var(--sl-border)]" />
            <div className="text-center">
              <p className="text-[10px] text-[var(--sl-t3)] mb-[3px]">Foco Total</p>
              <p className="font-[DM_Mono] text-[20px] font-medium text-[#06b6d4]">{formatMinutes(kpis.todayMinutes)}</p>
            </div>
            <div className="w-px bg-[var(--sl-border)]" />
            <div className="text-center">
              <p className="text-[10px] text-[var(--sl-t3)] mb-[3px]">Streak</p>
              <p className="font-[DM_Mono] text-[20px] font-medium text-[#f59e0b]">{kpis.streakDays} dias</p>
            </div>
          </div>
        </div>
      {/* RIGHT: History + Weekly Summary */}
      <div className="flex flex-col gap-3.5">
        {/* Session history */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
          <div className="flex items-center gap-2 mb-[18px]">
            <Clock size={16} className="text-[#06b6d4]" />
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Historico de Sessoes</h2>
          </div>

          {loading ? (
            <p className="text-[13px] text-[var(--sl-t3)] text-center py-8">Carregando...</p>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="text-2xl">🎯</span>
              <p className="text-[12px] text-[var(--sl-t3)] text-center">Nenhuma sessao registrada</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {grouped.slice(0, 5).map(({ date, items }) => (
                items.slice(0, 2).map((session, si) => {
                  const goal = goals.find(g => g.id === session.goal_id)
                  const isLast = si === items.length - 1
                  return (
                    <div key={session.id} className="flex gap-3 relative pb-[18px] last:pb-0">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[var(--sl-s2)] border-2 border-[#06b6d4] flex items-center justify-center z-[1]">
                          <Clock size={12} className="text-[#06b6d4]" />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-[var(--sl-border)]" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{goal?.name ?? 'Sessao livre'}</p>
                        <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">{formatDate(date)}{session.start_time ? ` \u00B7 ${session.start_time}` : ''}</p>
                        <p className="font-[DM_Mono] text-[12px] font-medium text-[#06b6d4] mt-[2px]">{formatMinutes(session.duration_minutes)} de foco</p>
                      </div>
                    </div>
                  )
                })
              )).flat()}
            </div>
          )}
        </div>

        {/* Weekly summary */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[18px] sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
          <p className="font-[Syne] text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sl-t3)] mb-3">Resumo Semanal</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--sl-t2)]">Sessoes</span>
              <span className="font-[DM_Mono] font-medium">{sessions.length}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--sl-t2)]">Foco total</span>
              <span className="font-[DM_Mono] font-medium text-[#06b6d4]">{formatMinutes(kpis.weekMinutes)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--sl-t2)]">Streak</span>
              <span className="font-[DM_Mono] font-medium text-[#f59e0b]">{kpis.streakDays} dia{kpis.streakDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--sl-t2)]">Sessoes no mes</span>
              <span className="font-[DM_Mono] font-medium">{kpis.monthCount}</span>
            </div>
          </div>
        </div>
      </div>

      </div>{/* close split grid */}

      {/* FAB mobile */}
      <button
        onClick={() => setModal({ open: true, mode: 'create' })}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white z-30 transition-all hover:brightness-110"
        style={{ background: '#06b6d4' }}
      >
        <Plus size={22} />
      </button>

      {/* Modal */}
      <FocusSessionModal
        open={modal.open}
        mode={modal.mode}
        session={modal.session}
        goals={goalOptions}
        events={eventOptions}
        onClose={() => setModal(s => ({ ...s, open: false, session: null }))}
        onSave={handleSave}
      />

    </div>
  )
}
