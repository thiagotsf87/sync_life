'use client'

import { useMemo, useState } from 'react'
import type { FocusSession, StudyStreak } from '@/hooks/use-mente'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.14)'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEK_GOAL = 10 // hours

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return 'Hoje'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diff < 7) return `Há ${diff} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface MenteSessoesTabProps {
  sessions: FocusSession[]
  weekHours: number
  streak: StudyStreak
}

export function MenteSessoesTab({ sessions, weekHours, streak }: MenteSessoesTabProps) {
  const [filterTrackId, setFilterTrackId] = useState<string | null>(null)

  const trackOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: { id: string | null; label: string }[] = [{ id: null, label: 'Todas' }]
    sessions.forEach((s) => {
      if (s.track_id && s.track && !seen.has(s.track_id)) {
        seen.add(s.track_id)
        opts.push({ id: s.track_id, label: s.track.name })
      }
    })
    if (sessions.some((s) => !s.track_id)) {
      opts.push({ id: 'free', label: 'Estudo livre' })
    }
    return opts
  }, [sessions])

  const filteredSessions = useMemo(() => {
    if (!filterTrackId) return sessions
    if (filterTrackId === 'free') return sessions.filter((s) => !s.track_id)
    return sessions.filter((s) => s.track_id === filterTrackId)
  }, [sessions, filterTrackId])

  // Build daily hours for the current week (Sun=0 … Sat=6)
  const dailyHours = useMemo(() => {
    const result = [0, 0, 0, 0, 0, 0, 0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    sessions.forEach((s) => {
      const d = new Date(s.recorded_at)
      if (d >= weekStart) {
        result[d.getDay()] += s.focus_minutes / 60
      }
    })
    return result
  }, [sessions])

  const maxHours = Math.max(...dailyHours, 1)
  const weekPct = Math.min((weekHours / WEEK_GOAL) * 100, 100)

  return (
    <div className="pb-6">
      {/* Filter pills by track */}
      {trackOptions.length > 1 && (
        <div className="flex gap-[6px] px-4 py-3 overflow-x-auto scrollbar-hide">
          {trackOptions.map(({ id, label }) => {
            const active = filterTrackId === id
            return (
              <button
                key={id ?? 'all'}
                onClick={() => setFilterTrackId(id)}
                className="px-[14px] py-[7px] rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-colors"
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
      )}

      {/* Week summary card */}
      <div
        className="mx-4 mt-3 rounded-2xl p-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-[14px] font-semibold text-[var(--sl-t1)]">Esta semana</span>
          <span
            className="text-[11px] font-medium px-2 py-[3px] rounded-full"
            style={{ background: MENTE_BG, color: '#a78bfa' }}
          >
            {weekHours}h / {WEEK_GOAL}h
          </span>
        </div>

        {/* Week progress bar */}
        <div
          className="h-[10px] rounded-full overflow-hidden mb-3"
          style={{ background: 'var(--sl-s3)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${weekPct}%`,
              background: `linear-gradient(90deg, ${MENTE_COLOR}, rgba(139,92,246,0.5))`,
            }}
          />
        </div>

        {/* Daily bar chart */}
        <div className="flex items-end justify-around h-14 gap-1">
          {WEEK_DAYS.map((day, i) => {
            const h = dailyHours[i]
            const barH = h > 0 ? Math.max((h / maxHours) * 44, 10) : 10
            const isEmpty = h === 0
            return (
              <div key={day} className="flex flex-col items-center gap-[3px]">
                <div
                  className="w-[26px] rounded-t-[4px]"
                  style={{
                    height: barH,
                    background: isEmpty ? 'var(--sl-s2)' : MENTE_COLOR,
                    opacity: isEmpty ? 1 : 0.85,
                    border: isEmpty ? '1px dashed rgba(139,92,246,0.3)' : 'none',
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: isEmpty ? 'var(--sl-t3)' : 'var(--sl-t2)' }}
                >
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* History list */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pt-4 pb-2">
        Histórico
      </p>

      <div
        style={{
          background: 'var(--sl-s1)',
          borderTop: '1px solid var(--sl-border)',
          borderBottom: '1px solid var(--sl-border)',
        }}
      >
        {filteredSessions.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[var(--sl-t2)]">
            Nenhuma sessão registrada ainda.
          </div>
        ) : (
          filteredSessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0"
            >
              <div
                className="w-1 rounded-sm flex-shrink-0"
                style={{ height: 44, background: MENTE_COLOR }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-[var(--sl-t1)] truncate">
                  {session.track?.name ?? 'Sessão livre'}
                  {session.session_notes ? ` — ${session.session_notes}` : ''}
                </div>
                <div className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                  {formatRelativeDate(session.recorded_at)} · {session.cycles_completed} pomodoros
                </div>
                <div className="flex gap-[5px] mt-1">
                  <span
                    className="text-[11px] px-[7px] py-[2px] rounded-[8px]"
                    style={{ background: MENTE_BG, color: MENTE_COLOR }}
                  >
                    ⏱️ {formatDuration(session.focus_minutes)}
                  </span>
                  <span
                    className="text-[11px] px-[7px] py-[2px] rounded-[8px]"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                  >
                    ✓ Concluída
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI insight */}
      <div
        className="mx-4 mt-3 rounded-2xl p-4 flex items-start gap-[10px]"
        style={{ background: 'rgba(0,85,255,0.06)', border: '1px solid rgba(0,85,255,0.15)' }}
      >
        <span className="text-[18px]">🤖</span>
        <div className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
          {streak.current_streak > 7
            ? <>Você está em um ótimo ritmo! <span style={{ color: MENTE_COLOR }}>🔥 {streak.current_streak} dias</span> de streak. Suas sessões estão consistentes. Continue assim!</>
            : <>Tente manter pelo menos <span style={{ color: MENTE_COLOR }}>25 min de foco</span> diário para construir um hábito sólido de aprendizado.</>
          }
        </div>
      </div>
    </div>
  )
}
