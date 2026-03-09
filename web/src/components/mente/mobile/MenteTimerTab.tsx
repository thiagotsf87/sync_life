'use client'

import { RotateCcw, RotateCw, Play, Pause } from 'lucide-react'
import type { StudyTrack, StudyStreak } from '@/hooks/use-mente'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.14)'
const MENTE_BORDER = 'rgba(234,179,8,0.3)'
const MENTE_GRAD = 'linear-gradient(135deg, #eab308, #f97316)'

export type TimerPhase = 'focus' | 'short_break' | 'long_break'

export const PHASE_DURATIONS: Record<TimerPhase, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
}

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: '🧠 Foco profundo',
  short_break: '☕ Pausa curta',
  long_break: '🌟 Pausa longa',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const SVG_R = 96
const SVG_SIZE = 220
const DASHARRAY = 2 * Math.PI * SVG_R // ≈ 603

interface MenteTimerTabProps {
  timerRunning: boolean
  timerSeconds: number
  timerPhase: TimerPhase
  cycleCount: number
  selectedTrackId: string | null
  tracks: StudyTrack[]
  todaySessions: number
  weekHours: number
  streak: StudyStreak
  onTogglePlay: () => void
  onReset: () => void
  onSkip: () => void
  onSelectTrack: (id: string | null) => void
}

export function MenteTimerTab({
  timerRunning,
  timerSeconds,
  timerPhase,
  cycleCount,
  selectedTrackId,
  tracks,
  todaySessions,
  weekHours,
  streak,
  onTogglePlay,
  onReset,
  onSkip,
  onSelectTrack,
}: MenteTimerTabProps) {
  const totalForPhase = PHASE_DURATIONS[timerPhase]
  const elapsed = totalForPhase - timerSeconds
  const dashoffset = DASHARRAY * (1 - Math.max(0, elapsed) / totalForPhase)
  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null
  const sessionNumber = (cycleCount % 4) + 1
  const nextPause = (cycleCount + 1) % 4 === 0 ? 15 : 5

  return (
    <div className="pb-6">
      {/* Context badge / track selector */}
      <div className="flex justify-center px-6 pt-4 pb-5">
        {selectedTrack ? (
          <button
            onClick={() => onSelectTrack(null)}
            className="inline-flex items-center gap-2 px-4 py-[7px] rounded-full text-[13px] font-medium"
            style={{ background: MENTE_BG, border: `1px solid ${MENTE_BORDER}`, color: MENTE_COLOR }}
          >
            <span>⚛️</span>
            <span>{selectedTrack.name}</span>
            <span className="text-[10px] opacity-60">✕</span>
          </button>
        ) : (
          <select
            value={selectedTrackId ?? ''}
            onChange={(e) => onSelectTrack(e.target.value || null)}
            className="px-4 py-[7px] rounded-full text-[13px] font-medium outline-none"
            style={{ background: MENTE_BG, border: `1px solid ${MENTE_BORDER}`, color: MENTE_COLOR }}
          >
            <option value="">Sem trilha vinculada</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* SVG Pomodoro Ring */}
      <div className="relative mx-auto" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          style={{ width: SVG_SIZE, height: SVG_SIZE, transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={SVG_R}
            fill="none"
            stroke="var(--sl-s3)"
            strokeWidth={14}
          />
          {/* Progress */}
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={SVG_R}
            fill="none"
            stroke={MENTE_COLOR}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={DASHARRAY}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-[DM_Mono] text-[48px] font-bold text-[var(--sl-t1)] leading-none">
            {formatTime(timerSeconds)}
          </div>
          <div className="text-[14px] font-medium mt-[6px]" style={{ color: MENTE_COLOR }}>
            {PHASE_LABELS[timerPhase]}
          </div>
          <div className="text-[12px] text-[var(--sl-t2)] mt-[3px]">
            Sessão {sessionNumber} de 4
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-7 pt-7 pb-5">
        <button
          onClick={onReset}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          aria-label="Reiniciar"
        >
          <RotateCcw size={22} />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-[76px] h-[76px] rounded-full flex items-center justify-center"
          style={{ background: MENTE_COLOR, boxShadow: '0 6px 24px rgba(234,179,8,0.4)' }}
          aria-label={timerRunning ? 'Pausar' : 'Iniciar'}
        >
          {timerRunning
            ? <Pause size={30} style={{ color: '#000' }} fill="#000" />
            : <Play size={30} style={{ color: '#000', marginLeft: 3 }} fill="#000" />
          }
        </button>

        <button
          onClick={onSkip}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          aria-label="Avançar"
        >
          <RotateCw size={22} />
        </button>
      </div>

      {/* Cycle dots — 4 bars */}
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => {
          const posInCycle = cycleCount % 4
          const isCompleted = i < posInCycle
          const isCurrent = i === posInCycle && timerPhase === 'focus'
          return (
            <div
              key={i}
              className="w-9 h-2 rounded-full"
              style={{
                background: isCompleted
                  ? MENTE_COLOR
                  : isCurrent
                  ? 'rgba(139,92,246,0.55)'
                  : 'rgba(139,92,246,0.25)',
              }}
            />
          )
        })}
      </div>

      {/* Today stats */}
      <div className="flex gap-2 px-4 mb-4">
        {[
          { value: String(todaySessions), label: 'Pomodoros', color: MENTE_COLOR },
          { value: `${weekHours}h`, label: 'Foco total', color: '#10b981' },
          { value: `${streak.current_streak}🔥`, label: 'Streak dias', color: '#f59e0b' },
        ].map(({ value, label, color }) => (
          <div
            key={label}
            className="flex-1 rounded-[10px] p-3 text-center"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <div className="font-[DM_Mono] text-[22px] font-bold leading-none" style={{ color }}>
              {value}
            </div>
            <div className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{label}</div>
          </div>
        ))}
      </div>

      {/* Next break card */}
      <div
        className="mx-4 rounded-2xl p-4"
        style={{ background: 'rgba(139,92,246,0.07)', border: `1px solid ${MENTE_BORDER}` }}
      >
        <div className="flex items-center gap-[10px]">
          <span className="text-[18px]">☕</span>
          <div>
            <div className="text-[13px] font-semibold text-[var(--sl-t1)]">
              {timerPhase === 'focus'
                ? `Próxima: Pausa de ${nextPause} min`
                : 'Próxima: Sessão de foco (25 min)'}
            </div>
            <div className="text-[12px] text-[var(--sl-t2)]">
              {timerPhase === 'focus'
                ? 'Depois da sessão 4 → Pausa longa 15 min'
                : 'Continue estudando!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
