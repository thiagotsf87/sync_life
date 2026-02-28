'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import {
  useExperienciasDashboard,
  TRIP_STATUS_LABELS, TRIP_STATUS_COLORS,
  calcTripDays,
  type Trip,
} from '@/hooks/use-experiencias'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { TripCard } from '@/components/experiencias/TripCard'

export default function ExperienciasPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { trips, checklistPct, loading, error } = useExperienciasDashboard()

  // Derived stats
  const upcoming = trips.filter(t => ['planning', 'reserved', 'ongoing'].includes(t.status))
  const completed = trips.filter(t => t.status === 'completed')
  const totalBudget = trips.reduce((s, t) => s + (t.total_budget ?? 0), 0)
  const totalSpent = trips.reduce((s, t) => s + t.total_spent, 0)

  // Next trip
  const now = new Date()
  const nextTrip = upcoming
    .filter(t => new Date(t.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0]

  const daysUntilNext = nextTrip
    ? Math.ceil((new Date(nextTrip.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Trips by status
  const ongoingTrips = trips.filter(t => t.status === 'ongoing')
  const upcomingTrips = upcoming.filter(t => t.status !== 'ongoing').slice(0, 4)

  function getTripStatusText(t: Trip) {
    if (t.status === 'ongoing') return 'Em andamento'
    const days = Math.ceil((new Date(t.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return TRIP_STATUS_LABELS[t.status]
    return `em ${days} dias`
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          ✈️ Experiências
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/experiencias/viagens')}
          className="px-4 py-2 rounded-[10px] text-[13px] font-medium border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
        >
          Ver todas
        </button>
        <button
          onClick={() => router.push('/experiencias/nova')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Viagem
        </button>
      </div>

      {/* ② KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Próxima viagem"
          value={nextTrip ? nextTrip.destinations[0] : '—'}
          delta={daysUntilNext != null ? (daysUntilNext === 0 ? 'Hoje!' : `em ${daysUntilNext} dias`) : 'Nenhuma planejada'}
          deltaType={daysUntilNext != null && daysUntilNext <= 7 ? 'up' : 'neutral'}
          accent="#06b6d4"
        />
        <KpiCard
          label="Viagens ativas"
          value={String(upcoming.length)}
          delta={`${ongoingTrips.length} em andamento`}
          deltaType={ongoingTrips.length > 0 ? 'up' : 'neutral'}
          accent="#10b981"
        />
        <KpiCard
          label="Concluídas"
          value={String(completed.length)}
          delta={completed.length > 0 ? `${completed.reduce((s, t) => s + calcTripDays(t.start_date, t.end_date), 0)} dias viajados` : 'Nenhuma ainda'}
          deltaType="neutral"
          accent="#f59e0b"
        />
        <KpiCard
          label="Checklist ativas"
          value={checklistPct != null ? `${checklistPct}%` : '—'}
          delta={checklistPct != null ? (checklistPct >= 80 ? 'Quase pronto!' : checklistPct >= 50 ? 'Em andamento' : 'Atenção pendente') : 'Sem itens'}
          deltaType={checklistPct != null && checklistPct >= 80 ? 'up' : checklistPct != null && checklistPct < 30 ? 'warn' : 'neutral'}
          accent="#f59e0b"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          nextTrip
            ? <>Sua próxima aventura é <strong className="text-[#06b6d4]">{nextTrip.name}</strong>
                {daysUntilNext != null && daysUntilNext > 0 && <> em <strong className="text-[var(--sl-t1)]">{daysUntilNext} dias</strong></>}!
                {calcTripDays(nextTrip.start_date, nextTrip.end_date) > 0 && <> São <strong className="text-[#06b6d4]">{calcTripDays(nextTrip.start_date, nextTrip.end_date)} dias</strong> de experiências inesquecíveis.</>}
              </>
            : <>Planeje sua próxima viagem e deixe o SyncLife ajudar com roteiro, orçamento e checklist completo.</>
        }
      />

      {/* ④ Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 006 no Supabase.' : error}
          </p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-2">Nenhuma viagem planejada</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-6 max-w-sm mx-auto">
            Comece planejando sua próxima aventura com roteiro, orçamento e checklist completo.
          </p>
          <button
            onClick={() => router.push('/experiencias/nova')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90"
          >
            <Plus size={16} />
            Planejar minha primeira viagem
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* Ongoing */}
          {ongoingTrips.length > 0 && (
            <div>
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">
                🟢 Em andamento
              </h2>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {ongoingTrips.map(t => (
                  <TripCard key={t.id} trip={t} onClick={() => router.push(`/experiencias/viagens/${t.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">
                  📅 Próximas viagens
                </h2>
                {upcoming.length > 4 && (
                  <button onClick={() => router.push('/experiencias/viagens')} className="text-[12px] text-[#06b6d4] hover:opacity-80">
                    Ver todas →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {upcomingTrips.map(t => (
                  <TripCard key={t.id} trip={t} onClick={() => router.push(`/experiencias/viagens/${t.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Status overview */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">📊 Resumo</h2>
            <div className="grid grid-cols-5 gap-3 max-sm:grid-cols-3">
              {(['planning', 'reserved', 'ongoing', 'completed', 'cancelled'] as const).map(status => {
                const count = trips.filter(t => t.status === status).length
                const color = TRIP_STATUS_COLORS[status]
                return (
                  <div key={status} className="text-center">
                    <p className="font-[DM_Mono] font-bold text-2xl" style={{ color }}>{count}</p>
                    <p className="text-[10px] text-[var(--sl-t3)]">{TRIP_STATUS_LABELS[status]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mt-4 max-sm:grid-cols-1">
        {[
          { label: '🗺️ Minhas Viagens', href: '/experiencias/viagens', color: '#06b6d4' },
          { label: '✈️ Nova Viagem', href: '/experiencias/nova', color: '#10b981' },
          { label: '✅ Checklists', href: '/experiencias/viagens', color: '#f59e0b' },
        ].map(({ label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 text-left hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
          >
            <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: color }} />
            <p className="font-medium text-[13px] text-[var(--sl-t1)]">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
