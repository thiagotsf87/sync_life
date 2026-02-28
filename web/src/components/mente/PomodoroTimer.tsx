'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipForward, RotateCcw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimerPhase = 'idle' | 'focusing' | 'short_break' | 'long_break' | 'paused'

export interface TimerConfig {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  cyclesPerLong: number
}

const DEFAULT_CONFIG: TimerConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesPerLong: 4,
}

const STORAGE_KEY = 'sl_pomodoro'

interface PersistedState {
  phase: TimerPhase
  remainingSeconds: number
  cyclesCompleted: number
  totalFocusSeconds: number
  totalBreakSeconds: number
  selectedTrackId: string | null
  config: TimerConfig
  sessionStarted: boolean
}

const PHASE_COLORS: Record<TimerPhase, string> = {
  idle: '#a855f7',
  focusing: '#0055ff',
  short_break: '#10b981',
  long_break: '#a855f7',
  paused: '#f59e0b',
}

const PHASE_LABELS: Record<TimerPhase, string> = {
  idle: 'Pronto',
  focusing: 'Foco',
  short_break: 'Pausa Curta',
  long_break: 'Pausa Longa',
  paused: 'Pausado',
}

function getTotalForPhase(phase: TimerPhase, config: TimerConfig): number {
  if (phase === 'short_break') return config.shortBreakMinutes * 60
  if (phase === 'long_break') return config.longBreakMinutes * 60
  return config.focusMinutes * 60
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PomodoroTimerProps {
  tracks: Array<{ id: string; name: string }>
  enableAmbient?: boolean
  isJornada?: boolean
  onXpEarned?: (payload: { gained: number; total: number }) => void
  onSessionComplete?: (data: {
    track_id: string | null
    duration_minutes: number
    focus_minutes: number
    break_minutes: number
    cycles_completed: number
  }) => Promise<void>
}

type AmbientMode = 'off' | 'rain' | 'lofi'

export function PomodoroTimer({
  tracks,
  onSessionComplete,
  enableAmbient = false,
  isJornada = false,
  onXpEarned,
}: PomodoroTimerProps) {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG)
  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_CONFIG.focusMinutes * 60)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0)
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [ambientMode, setAmbientMode] = useState<AmbientMode>('off')
  const [hydrated, setHydrated] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const ambientCleanupRef = useRef<(() => void) | null>(null)

  // Restore from localStorage (after hydration)
  useEffect(() => {
    setHydrated(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p: PersistedState = JSON.parse(saved)
        setConfig(p.config)
        // Never restore as running — require user to resume
        setPhase(p.phase === 'focusing' || p.phase === 'short_break' || p.phase === 'long_break' ? 'paused' : p.phase)
        setRemainingSeconds(p.remainingSeconds)
        setCyclesCompleted(p.cyclesCompleted)
        setTotalFocusSeconds(p.totalFocusSeconds)
        setTotalBreakSeconds(p.totalBreakSeconds)
        setSelectedTrackId(p.selectedTrackId)
        setSessionStarted(p.sessionStarted)
      }
    } catch { /* ignore */ }
  }, [])

  // Persist state
  useEffect(() => {
    if (!hydrated) return
    const state: PersistedState = {
      phase, remainingSeconds, cyclesCompleted, totalFocusSeconds,
      totalBreakSeconds, selectedTrackId, config, sessionStarted,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [hydrated, phase, remainingSeconds, cyclesCompleted, totalFocusSeconds, totalBreakSeconds, selectedTrackId, config, sessionStarted])

  const isRunning = phase === 'focusing' || phase === 'short_break' || phase === 'long_break'

  // Main interval
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1))
      if (phase === 'focusing') setTotalFocusSeconds(s => s + 1)
      else setTotalBreakSeconds(s => s + 1)
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, phase])

  // Phase transition when remaining hits 0
  useEffect(() => {
    if (remainingSeconds !== 0) return
    if (!isRunning) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (phase === 'focusing') {
      const newCycles = cyclesCompleted + 1
      setCyclesCompleted(newCycles)
      const isLong = newCycles % config.cyclesPerLong === 0
      const nextPhase: TimerPhase = isLong ? 'long_break' : 'short_break'
      setPhase(nextPhase)
      setRemainingSeconds(isLong ? config.longBreakMinutes * 60 : config.shortBreakMinutes * 60)
    } else {
      setPhase('focusing')
      setRemainingSeconds(config.focusMinutes * 60)
    }
    // Play a soft notification sound + background notification when available.
    try { new Audio('/sounds/bell.mp3').play().catch(() => {}) } catch { /* no sound if unavailable */ }
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const nextLabel = phase === 'focusing' ? 'Hora da pausa' : 'Hora de focar'
      try {
        new Notification(`Pomodoro • ${nextLabel}`, {
          body: phase === 'focusing'
            ? 'Ciclo concluído. Faça uma pausa e depois retome.'
            : 'Pausa concluída. Volte para o foco.',
        })
      } catch {
        // ignore if browser blocks notifications
      }
    }
  }, [remainingSeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
    if (phase === 'idle') {
      setPhase('focusing')
      setRemainingSeconds(config.focusMinutes * 60)
      setSessionStarted(true)
      setCyclesCompleted(0)
      setTotalFocusSeconds(0)
      setTotalBreakSeconds(0)
    } else if (phase === 'paused') {
      // Determine which phase to resume based on cycles
      setPhase('focusing')
    }
  }, [phase, config])

  const handlePause = useCallback(() => {
    if (isRunning) setPhase('paused')
  }, [isRunning])

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (phase === 'idle') return
    if (phase === 'focusing' || phase === 'paused') {
      const newCycles = cyclesCompleted + 1
      setCyclesCompleted(newCycles)
      const isLong = newCycles % config.cyclesPerLong === 0
      const nextPhase: TimerPhase = isLong ? 'long_break' : 'short_break'
      setPhase(nextPhase)
      setRemainingSeconds(isLong ? config.longBreakMinutes * 60 : config.shortBreakMinutes * 60)
    } else {
      setPhase('focusing')
      setRemainingSeconds(config.focusMinutes * 60)
    }
  }, [phase, cyclesCompleted, config])

  const handleFinish = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (sessionStarted && (totalFocusSeconds > 0) && onSessionComplete) {
      await onSessionComplete({
        track_id: selectedTrackId,
        duration_minutes: Math.round((totalFocusSeconds + totalBreakSeconds) / 60),
        focus_minutes: Math.round(totalFocusSeconds / 60),
        break_minutes: Math.round(totalBreakSeconds / 60),
        cycles_completed: cyclesCompleted,
      })
    }

    // RN-MNT-18: pontos de foco em Jornada
    if (isJornada && totalFocusSeconds > 0) {
      const focusMinutes = Math.max(1, Math.round(totalFocusSeconds / 60))
      const gained = (focusMinutes * 2) + (cyclesCompleted * 3)
      const current = Number(localStorage.getItem('sl_jornada_xp') ?? '0')
      const total = current + gained
      localStorage.setItem('sl_jornada_xp', String(total))
      onXpEarned?.({ gained, total })
    }

    setPhase('idle')
    setRemainingSeconds(config.focusMinutes * 60)
    setCyclesCompleted(0)
    setTotalFocusSeconds(0)
    setTotalBreakSeconds(0)
    setSessionStarted(false)
    localStorage.removeItem(STORAGE_KEY)
  }, [sessionStarted, totalFocusSeconds, totalBreakSeconds, cyclesCompleted, selectedTrackId, config, onSessionComplete, isJornada, onXpEarned])

  function stopAmbient() {
    if (ambientCleanupRef.current) {
      ambientCleanupRef.current()
      ambientCleanupRef.current = null
    }
  }

  async function startAmbient(mode: Exclude<AmbientMode, 'off'>) {
    stopAmbient()
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx()
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') await ctx.resume()

    if (mode === 'rain') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 900
      const gain = ctx.createGain()
      gain.gain.value = 0.03
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
      ambientCleanupRef.current = () => {
        noise.stop()
        noise.disconnect()
        filter.disconnect()
        gain.disconnect()
      }
      return
    }

    const oscillator = ctx.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = 180
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1200
    const gain = ctx.createGain()
    gain.gain.value = 0.02
    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    ambientCleanupRef.current = () => {
      oscillator.stop()
      oscillator.disconnect()
      filter.disconnect()
      gain.disconnect()
    }
  }

  useEffect(() => {
    if (!enableAmbient) {
      setAmbientMode('off')
      stopAmbient()
      return
    }
    if (ambientMode === 'off') {
      stopAmbient()
      return
    }
    startAmbient(ambientMode).catch(() => {})
    return () => {
      stopAmbient()
    }
  }, [ambientMode, enableAmbient])

  useEffect(() => {
    return () => {
      stopAmbient()
      audioContextRef.current?.close().catch(() => {})
    }
  }, [])

  // SVG ring
  const r = 90
  const circumference = 2 * Math.PI * r
  const totalSecs = getTotalForPhase(phase === 'paused' ? 'focusing' : phase, config)
  const progress = phase === 'idle' ? 0 : 1 - remainingSeconds / totalSecs
  const dashoffset = circumference * (1 - progress)
  const color = PHASE_COLORS[phase]
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0')

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isRunning) {
      document.title = `${minutes}:${seconds} • ${PHASE_LABELS[phase]} • SyncLife`
    } else {
      document.title = 'SyncLife'
    }
  }, [isRunning, minutes, seconds, phase])

  const settingsConfig = [
    { label: 'Foco (min)', key: 'focusMinutes' as keyof TimerConfig, min: 15, max: 90 },
    { label: 'Pausa curta (min)', key: 'shortBreakMinutes' as keyof TimerConfig, min: 3, max: 15 },
    { label: 'Pausa longa (min)', key: 'longBreakMinutes' as keyof TimerConfig, min: 10, max: 30 },
    { label: 'Ciclos por pausa longa', key: 'cyclesPerLong' as keyof TimerConfig, min: 2, max: 6 },
  ]

  return (
    <div className="flex flex-col items-center gap-6 max-w-[400px] mx-auto">

      {/* Track selector */}
      <div className="w-full">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
          Trilha (opcional)
        </label>
        <select
          value={selectedTrackId ?? ''}
          onChange={e => setSelectedTrackId(e.target.value || null)}
          disabled={isRunning || sessionStarted}
          className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#a855f7] transition-colors disabled:opacity-50"
        >
          <option value="">Estudo livre (sem trilha)</option>
          {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Phase label */}
      <div className="text-center">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
          {PHASE_LABELS[phase]}
        </span>
        {cyclesCompleted > 0 && (
          <span className="ml-2 text-[11px] text-[var(--sl-t3)]">
            {cyclesCompleted} ciclo{cyclesCompleted !== 1 ? 's' : ''} completo{cyclesCompleted !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* SVG ring */}
      <div className="relative">
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="pom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={phase === 'focusing' ? '#10b981' : color} />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r={r} fill="none" stroke="var(--sl-s3)" strokeWidth="10" />
          <circle
            cx="110" cy="110" r={r} fill="none"
            stroke={phase === 'focusing' ? 'url(#pom-grad)' : color}
            strokeWidth="10" strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
              transition: 'stroke-dashoffset 0.8s linear',
            }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[DM_Mono] text-5xl font-bold text-[var(--sl-t1)] tabular-nums">
            {minutes}:{seconds}
          </span>
          {sessionStarted && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: config.cyclesPerLong }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i < (cyclesCompleted % config.cyclesPerLong)
                      ? color
                      : 'var(--sl-s3)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleFinish}
          className="p-3 rounded-full hover:bg-[var(--sl-s2)] transition-colors"
          title="Encerrar e salvar sessão"
        >
          <RotateCcw size={18} className="text-[var(--sl-t3)]" />
        </button>

        {isRunning ? (
          <button
            onClick={handlePause}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ background: color }}
          >
            <Pause size={24} className="text-white" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ background: color }}
          >
            <Play size={24} className="text-white ml-1" />
          </button>
        )}

        <button
          onClick={handleSkip}
          disabled={phase === 'idle'}
          className="p-3 rounded-full hover:bg-[var(--sl-s2)] transition-colors disabled:opacity-30"
          title="Pular fase"
        >
          <SkipForward size={18} className="text-[var(--sl-t3)]" />
        </button>
      </div>

      {/* Session stats */}
      {sessionStarted && (
        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { label: 'Foco', value: `${Math.floor(totalFocusSeconds / 60)}m`, color: '#0055ff' },
            { label: 'Ciclos', value: String(cyclesCompleted), color: '#10b981' },
            { label: 'Pausa', value: `${Math.floor(totalBreakSeconds / 60)}m`, color: '#a855f7' },
          ].map(({ label, value, color: c }) => (
            <div key={label} className="bg-[var(--sl-s2)] rounded-xl p-3 text-center">
              <p className="font-[DM_Mono] text-[16px] font-bold" style={{ color: c }}>{value}</p>
              <p className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* RN-MNT-14: sons ambiente (Jornada + PRO) */}
      <div className="w-full">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5">
          Sons ambiente
        </p>
        {enableAmbient ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'off', label: 'Off' },
              { id: 'rain', label: 'Chuva' },
              { id: 'lofi', label: 'Lo-fi' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setAmbientMode(opt.id as AmbientMode)}
                className={cn(
                  'py-2 rounded-[10px] border text-[11px] transition-all',
                  ambientMode === opt.id
                    ? 'border-[#a855f7] bg-[#a855f7]/10 text-[var(--sl-t1)]'
                    : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--sl-t3)]">
            Disponível no modo Jornada + plano PRO.
          </p>
        )}
      </div>

      {/* Settings toggle */}
      <button
        onClick={() => setShowSettings(v => !v)}
        className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)] hover:text-[var(--sl-t2)] transition-colors"
      >
        <Settings size={12} />
        {showSettings ? 'Ocultar configurações' : 'Configurar timer'}
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-4 flex flex-col gap-3">
          {settingsConfig.map(({ label, key, min, max }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--sl-t2)]">{label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfig(c => ({ ...c, [key]: Math.max(min, (c[key] as number) - 1) }))}
                  disabled={isRunning}
                  className="w-6 h-6 rounded-full bg-[var(--sl-s3)] text-[var(--sl-t2)] text-sm flex items-center justify-center hover:bg-[var(--sl-border)] disabled:opacity-40"
                >-</button>
                <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] w-7 text-center">
                  {config[key]}
                </span>
                <button
                  onClick={() => setConfig(c => ({ ...c, [key]: Math.min(max, (c[key] as number) + 1) }))}
                  disabled={isRunning}
                  className="w-6 h-6 rounded-full bg-[var(--sl-s3)] text-[var(--sl-t2)] text-sm flex items-center justify-center hover:bg-[var(--sl-border)] disabled:opacity-40"
                >+</button>
              </div>
            </div>
          ))}
          <p className={cn(
            'text-[10px] text-[var(--sl-t3)] text-center',
            isRunning && 'opacity-70'
          )}>
            {isRunning ? 'Pause o timer para alterar configurações.' : 'Configurações aplicadas no próximo início.'}
          </p>
        </div>
      )}
    </div>
  )
}
