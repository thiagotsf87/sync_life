'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useStudySessions } from '@/hooks/use-mente'
import { KpiCard } from '@/components/ui/kpi-card'
import { StudySessionCard } from '@/components/mente/StudySessionCard'
import { useRouter } from 'next/navigation'

export default function SessoesPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { sessions, loading, error } = useStudySessions(100)
  const [trackFilter, setTrackFilter] = useState<string>('all')

  // Compute KPIs from sessions
  const totalMinutes = sessions.reduce((acc, s) => acc + s.focus_minutes, 0)
  const totalCycles = sessions.reduce((acc, s) => acc + s.cycles_completed, 0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekSessions = sessions.filter(s => new Date(s.recorded_at) >= weekStart)
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.focus_minutes, 0)

  // Unique tracks for filter
  const tracksInSessions = Array.from(
    new Map(
      sessions
        .filter(s => s.track)
        .map(s => [s.track_id!, { id: s.track_id!, name: s.track!.name }])
    ).values()
  )

  const filtered = trackFilter === 'all'
    ? sessions
    : sessions.filter(s => s.track_id === trackFilter)

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📊 Histórico de Sessões
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/mente/timer')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
        >
          ⏱ Iniciar Timer
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Total de Sessões" value={String(sessions.length)} accent="#a855f7" />
        <KpiCard
          label="Horas Totais"
          value={`${(totalMinutes / 60).toFixed(1)}h`}
          accent="#0055ff"
        />
        <KpiCard
          label="Esta Semana"
          value={`${(weekMinutes / 60).toFixed(1)}h`}
          delta={`${weekSessions.length} sessões`}
          deltaType="neutral"
          accent="#10b981"
        />
        <KpiCard
          label="Ciclos Totais"
          value={String(totalCycles)}
          accent="#f59e0b"
        />
      </div>

      {/* Filter by track */}
      {tracksInSessions.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setTrackFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
              trackFilter === 'all'
                ? 'bg-[#a855f7] text-white border-[#a855f7]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            Todas
          </button>
          <button
            onClick={() => setTrackFilter('free')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
              trackFilter === 'free'
                ? 'bg-[#a855f7] text-white border-[#a855f7]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            Estudo livre
          </button>
          {tracksInSessions.map(t => (
            <button
              key={t.id}
              onClick={() => setTrackFilter(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
                trackFilter === t.id
                  ? 'bg-[#a855f7] text-white border-[#a855f7]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Sessions grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">⏱</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            Nenhuma sessão registrada
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            Use o Timer Pomodoro para registrar suas sessões de estudo.
          </p>
          <button
            onClick={() => router.push('/mente/timer')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#a855f7] text-white hover:opacity-90"
          >
            Iniciar Timer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {filtered.map((session, idx) => (
            <div key={session.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
              <StudySessionCard session={session} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
