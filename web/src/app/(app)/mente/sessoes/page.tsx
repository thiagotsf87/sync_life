'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useStudySessions } from '@/hooks/use-mente'
import { MetricsStrip } from '@/components/ui/metrics-strip'
import { ModuleHeader } from '@/components/ui/module-header'
import { useRouter } from 'next/navigation'
import { Brain, Play, Plus, Search, Clock } from 'lucide-react'

export default function SessoesPage() {
  const router = useRouter()
  const { sessions, loading, error } = useStudySessions(100)
  const [trackFilter, setTrackFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Compute KPIs from sessions
  const totalMinutes = sessions.reduce((acc, s) => acc + s.focus_minutes, 0)
  const totalCycles = sessions.reduce((acc, s) => acc + s.cycles_completed, 0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekSessions = sessions.filter(s => new Date(s.recorded_at) >= weekStart)
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.focus_minutes, 0)

  const avgPerDay = sessions.length > 0
    ? (totalMinutes / 60 / Math.max(1, Math.ceil((Date.now() - new Date(sessions[sessions.length - 1]?.recorded_at ?? Date.now()).getTime()) / 86400000))).toFixed(1)
    : '0'

  // Unique tracks for filter
  const tracksInSessions = Array.from(
    new Map(
      sessions
        .filter(s => s.track)
        .map(s => [s.track_id!, { id: s.track_id!, name: s.track!.name }])
    ).values()
  )

  let filtered = trackFilter === 'all'
    ? sessions
    : trackFilter === 'free'
      ? sessions.filter(s => !s.track_id)
      : sessions.filter(s => s.track_id === trackFilter)

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(s =>
      (s.track?.name ?? 'Estudo livre').toLowerCase().includes(q)
    )
  }

  // Compute total of displayed sessions
  const displayedMinutes = filtered.reduce((acc, s) => acc + s.focus_minutes, 0)
  const displayedHours = Math.floor(displayedMinutes / 60)
  const displayedMins = displayedMinutes % 60

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={Brain}
        iconBg="rgba(234,179,8,.1)"
        iconColor="#eab308"
        title="Historico de Sessoes"
        subtitle={`${sessions.length} sessoes registradas \u00B7 ${(totalMinutes / 60).toFixed(1)}h de estudo acumulado`}
      >
        <button
          onClick={() => router.push('/mente/timer')}
          className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#eab308] text-black hover:brightness-110 transition-all"
        >
          <Play size={16} />
          Timer
        </button>
      </ModuleHeader>

      {/* MetricsStrip */}
      <MetricsStrip
        gradient={['#eab308', '#f97316']}
        className="mb-7"
        items={[
          {
            label: 'Total sessoes',
            value: String(sessions.length),
          },
          {
            label: 'Horas totais',
            value: `${(totalMinutes / 60).toFixed(1)}h`,
            valueColor: '#eab308',
          },
          {
            label: 'Esta semana',
            value: `${(weekMinutes / 60).toFixed(1)}h`,
            note: `${weekSessions.length} sessoes`,
          },
          {
            label: 'Ciclos totais',
            value: String(totalCycles),
          },
          {
            label: 'Media/dia',
            value: `${avgPerDay}h`,
          },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-[18px] flex-wrap">
        <button
          onClick={() => setTrackFilter('all')}
          className={cn(
            'flex items-center gap-[5px] px-[14px] py-[6px] rounded-lg text-[12px] font-medium transition-all border',
            trackFilter === 'all'
              ? 'bg-[rgba(234,179,8,.08)] border-[#eab308] text-[#eab308] font-semibold'
              : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
          )}
        >
          Todas
          <span className={cn(
            'font-[DM_Mono] text-[10px] font-bold px-1.5 py-px rounded-md',
            trackFilter === 'all' ? 'bg-[rgba(234,179,8,.2)] text-[#eab308]' : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]'
          )}>
            {sessions.length}
          </span>
        </button>
        <button
          onClick={() => setTrackFilter('free')}
          className={cn(
            'flex items-center gap-[5px] px-[14px] py-[6px] rounded-lg text-[12px] font-medium transition-all border',
            trackFilter === 'free'
              ? 'bg-[rgba(234,179,8,.08)] border-[#eab308] text-[#eab308] font-semibold'
              : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
          )}
        >
          Estudo livre
          <span className={cn(
            'font-[DM_Mono] text-[10px] font-bold px-1.5 py-px rounded-md',
            trackFilter === 'free' ? 'bg-[rgba(234,179,8,.2)] text-[#eab308]' : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]'
          )}>
            {sessions.filter(s => !s.track_id).length}
          </span>
        </button>
        {tracksInSessions.map(t => (
          <button
            key={t.id}
            onClick={() => setTrackFilter(t.id)}
            className={cn(
              'flex items-center gap-[5px] px-[14px] py-[6px] rounded-lg text-[12px] font-medium transition-all border',
              trackFilter === t.id
                ? 'bg-[rgba(234,179,8,.08)] border-[#eab308] text-[#eab308] font-semibold'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {t.name}
            <span className={cn(
              'font-[DM_Mono] text-[10px] font-bold px-1.5 py-px rounded-md',
              trackFilter === t.id ? 'bg-[rgba(234,179,8,.2)] text-[#eab308]' : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]'
            )}>
              {sessions.filter(s => s.track_id === t.id).length}
            </span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2 w-[200px]
                        focus-within:border-[rgba(234,179,8,.4)] transition-colors">
          <Search size={16} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar sessao..."
            className="bg-transparent text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 border-b border-[var(--sl-border)] animate-pulse bg-[var(--sl-s2)]" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
          <Clock size={32} className="text-[#eab308] mx-auto mb-3 opacity-60" />
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            Nenhuma sessao registrada
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            Use o Timer Pomodoro para registrar suas sessoes de estudo.
          </p>
          <button
            onClick={() => router.push('/mente/timer')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#eab308] text-black hover:brightness-110"
          >
            Iniciar Timer
          </button>
        </div>
      ) : (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden sl-fade-up sl-delay-2 transition-colors hover:border-[var(--sl-border-h)]">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 pl-[22px] w-[36px]"></th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Assunto / Trilha</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Data</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Horario</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Ciclos</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 pr-[22px] border-b border-[var(--sl-border)]">Duracao</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => {
                const date = new Date(session.recorded_at)
                const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const hours = Math.floor(session.focus_minutes / 60)
                const mins = session.focus_minutes % 60

                return (
                  <tr key={session.id} className="hover:bg-[rgba(120,165,220,.02)] transition-colors">
                    <td className="py-3 px-3 pl-[22px] align-middle border-b border-[rgba(120,165,220,.04)]">
                      <div
                        className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(234,179,8,.1)' }}
                      >
                        <Clock size={15} style={{ color: '#eab308' }} />
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle border-b border-[rgba(120,165,220,.04)]">
                      <p className="text-[13px] font-medium text-[var(--sl-t1)]">
                        {session.track?.name ?? 'Estudo livre'}
                      </p>
                      <p className="text-[11px] text-[var(--sl-t3)]">Pomodoro</p>
                    </td>
                    <td className="py-3 px-3 align-middle text-[11px] text-[var(--sl-t3)] border-b border-[rgba(120,165,220,.04)]">
                      {dateLabel}
                    </td>
                    <td className="py-3 px-3 align-middle text-[11px] text-[var(--sl-t3)] border-b border-[rgba(120,165,220,.04)]">
                      {timeLabel}
                    </td>
                    <td className="py-3 px-3 align-middle font-[DM_Mono] font-medium text-[13px] text-[var(--sl-t2)] border-b border-[rgba(120,165,220,.04)]">
                      {session.cycles_completed}
                    </td>
                    <td className="py-3 px-3 pr-[22px] align-middle text-right font-[DM_Mono] font-semibold text-[13px] text-[#eab308] border-b border-[rgba(120,165,220,.04)]">
                      {hours}h {mins.toString().padStart(2, '0')}min
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* Summary footer */}
          <div className="px-[22px] py-[14px] border-t border-[var(--sl-border)] bg-[var(--sl-s2)] flex justify-between items-center">
            <span className="text-[12px] text-[var(--sl-t3)]">
              Exibindo {filtered.length} de {sessions.length} sessoes
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-[var(--sl-t3)]">Total exibido:</span>
              <span className="font-[DM_Mono] text-[14px] font-semibold text-[#eab308]">
                {displayedHours}h {displayedMins.toString().padStart(2, '0')}min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
