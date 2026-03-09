'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Pencil, Trash2, Clock, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFocusSessions, type FocusSession, type FocusSessionFormData } from '@/hooks/use-focus-sessions'
import { useMetas } from '@/hooks/use-metas'
import { useAgenda } from '@/hooks/use-agenda'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { FocusSessionModal } from '@/components/agenda/FocusSessionModal'
import { ProGate } from '@/components/ui/pro-gate'
import { playCompletionSound, startAmbientSound, stopAmbientSound, AMBIENT_OPTIONS, type AmbientSound } from '@/lib/timer-sounds'

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TEMPO_TABS = [
  { label: 'Dashboard', href: '/tempo' },
  { label: 'Agenda', href: '/tempo/agenda' },
  { label: 'Semanal', href: '/tempo/semanal' },
  { label: 'Mensal', href: '/tempo/mensal' },
  { label: 'Review', href: '/tempo/review', pro: true },
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
    <div className="max-w-[1140px] mx-auto px-4 py-7 pb-16">

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
            {tab.pro && <span className="ml-1 text-[9px] font-bold bg-[#f59e0b] text-[#03071a] px-1 py-0.5 rounded">PRO</span>}
            {pathname === tab.href && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[3px] rounded-t bg-[#06b6d4]" />
            )}
          </Link>
        ))}
      </div>

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
          🎯 Blocos de Foco
        </h1>
        {todaySessionCount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
            🔥 {todaySessionCount} sessão{todaySessionCount !== 1 ? 'ões' : ''} hoje
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setModal({ open: true, mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110"
          style={{ background: '#06b6d4' }}
        >
          <Plus size={15} />
          <span className="max-sm:hidden">Nova Sessão</span>
        </button>
      </div>

      {/* ② JornadaInsight */}
      <JornadaInsight text={
        <span>
          {kpis.streakDays > 0
            ? <><strong className="text-[#f97316]">🔥 {kpis.streakDays} dias seguidos</strong> de foco! Continue assim — a consistência é o segredo do progresso. ✨</>
            : <>Registre sua primeira sessão de foco hoje e comece seu streak! 💪</>
          }
        </span>
      } />

      {/* ③ KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Horas hoje"
          value={formatMinutes(kpis.todayMinutes)}
          delta="sessões registradas"
          accent="#06b6d4"
        />
        <KpiCard
          label="Horas esta semana"
          value={formatMinutes(kpis.weekMinutes)}
          delta="nos últimos 7 dias"
          accent="#10b981"
        />
        <KpiCard
          label="Streak"
          value={`${kpis.streakDays}d`}
          delta={kpis.streakDays > 0 ? 'dias consecutivos!' : 'comece hoje'}
          deltaType={kpis.streakDays > 0 ? 'up' : 'neutral'}
          accent="#f97316"
        />
        <KpiCard
          label="Sessões no mês"
          value={String(kpis.monthCount)}
          delta={`${formatMinutes(kpis.monthMinutes)} total`}
          accent="#8b5cf6"
        />
      </div>

      {/* ④ Tab bar */}
      <div className="flex gap-6 border-b border-[var(--sl-border)] mb-6">
        <button
          onClick={() => setActiveTab('timer')}
          className={cn(
            'pb-2 text-[13px] font-semibold border-b-[3px] transition-colors',
            activeTab === 'timer'
              ? 'text-[#06b6d4] border-[#06b6d4]'
              : 'text-[var(--sl-t2)] border-transparent hover:text-[var(--sl-t1)]'
          )}
        >
          ⏱ Timer
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'pb-2 text-[13px] font-semibold border-b-[3px] transition-colors',
            activeTab === 'history'
              ? 'text-[#06b6d4] border-[#06b6d4]'
              : 'text-[var(--sl-t2)] border-transparent hover:text-[var(--sl-t1)]'
          )}
        >
          📋 Histórico
        </button>
      </div>

      {/* ⑤ Tab content */}

      {/* Timer Tab */}
      {activeTab === 'timer' && (
        <ProGate module="tempo" feature="timerFoco" preview label="Timer Foco é exclusivo PRO">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[480px] mx-auto sl-fade-up">

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

          {/* SVG Ring */}
          <div className="flex justify-center mb-6">
            <div className="relative" style={{ width: 240, height: 240 }}>
              <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="120" cy="120" r={ringR} fill="none" stroke="var(--sl-s3)" strokeWidth="12" />
                <circle
                  cx="120" cy="120" r={ringR} fill="none"
                  stroke="#06b6d4" strokeWidth="12" strokeLinecap="round"
                  style={{
                    strokeDasharray: `${ringDasharray}`,
                    strokeDashoffset: `${ringDashoffset}`,
                    transition: timerState === 'running' ? 'stroke-dashoffset 1s linear' : 'none',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[DM_Mono] font-bold text-5xl text-[var(--sl-t1)] leading-none">
                  {formatTime(timeLeft)}
                </span>
                {timerState === 'running' && (
                  <span className="text-[11px] text-[#06b6d4] mt-2 font-medium">Em foco ●</span>
                )}
                {timerState === 'paused' && (
                  <span className="text-[11px] text-[#f59e0b] mt-2 font-medium">Pausado ⏸</span>
                )}
                {timerState === 'idle' && (
                  <span className="text-[11px] text-[var(--sl-t3)] mt-2">{duration}min</span>
                )}
                {timerState === 'completed' && (
                  <span className="text-[11px] text-[#10b981] mt-2 font-medium">Concluído ✓</span>
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
        </div>
        </ProGate>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Filtro de período */}
          <div className="flex gap-2 mb-5">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  'px-4 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                  filter === opt.value
                    ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                    : 'border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Lista de sessões */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px] text-[var(--sl-t3)]">Carregando sessões...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
              <span className="text-4xl">🎯</span>
              <p className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">Nenhuma sessão registrada</p>
              <p className="text-[13px] text-[var(--sl-t3)] text-center max-w-[280px]">
                Use a aba Timer para iniciar uma sessão ou clique em &quot;Nova Sessão&quot; para registrar manualmente.
              </p>
              <button
                onClick={() => setActiveTab('timer')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 mt-1"
                style={{ background: '#06b6d4' }}
              >
                ⏱ Ir para Timer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {grouped.map(({ date, items }) => {
                const totalMin = items.reduce((s, i) => s + i.duration_minutes, 0)
                return (
                  <div key={date}>
                    {/* Header do grupo */}
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">
                        {formatDate(date)}
                      </p>
                      <div className="flex-1 h-px bg-[var(--sl-border)]" />
                      <span className="text-[11px] font-[DM_Mono] font-semibold text-[#06b6d4]">
                        {formatMinutes(totalMin)}
                      </span>
                    </div>

                    {/* Cards de sessão */}
                    <div className="flex flex-col gap-2">
                      {items.map(session => {
                        const goal = goals.find(g => g.id === session.goal_id)
                        return (
                          <div
                            key={session.id}
                            className="flex items-start gap-3 px-4 py-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
                          >
                            {/* Ícone de foco */}
                            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-[rgba(6,182,212,0.1)]">
                              <Clock size={18} className="text-[#06b6d4]" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              {goal ? (
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-sm">{goal.icon}</span>
                                  <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                                    {goal.name}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[13px] font-semibold text-[var(--sl-t2)] mb-0.5">Sessão livre</p>
                              )}

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-[DM_Mono] text-[13px] font-bold text-[#06b6d4]">
                                  {formatMinutes(session.duration_minutes)}
                                </span>
                                {session.start_time && (
                                  <span className="text-[11px] text-[var(--sl-t3)] font-[DM_Mono]">
                                    às {session.start_time}
                                  </span>
                                )}
                              </div>

                              {session.notes && (
                                <p className="text-[11px] text-[var(--sl-t3)] mt-1 line-clamp-2">{session.notes}</p>
                              )}
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setModal({ open: true, mode: 'edit', session })}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
                                title="Editar"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[var(--sl-s2)] transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

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
