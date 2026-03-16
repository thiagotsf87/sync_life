'use client'

import { useRouter } from 'next/navigation'
import { Plane, Plus, List, ArrowRight, CheckSquare, Clock, MapPin, Users } from 'lucide-react'
import {
  useExperienciasDashboard,
  TRIP_STATUS_LABELS, TRIP_STATUS_COLORS,
  calcTripDays,
  type Trip,
} from '@/hooks/use-experiencias'
import { ModuleHeader } from '@/components/ui/module-header'
import { ExplorerBanner } from '@/components/experiencias/explorer-banner'
import { TripStripRow } from '@/components/experiencias/trip-strip-row'
import { StatusGrid } from '@/components/ui/status-grid'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'

export default function ExperienciasPage() {
  const router = useRouter()

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
  const activeTrips = upcoming.slice(0, 5)

  // Stats for explorer banner
  const totalDaysViajados = completed.reduce((s, t) => s + calcTripDays(t.start_date, t.end_date), 0)
  const allDestinations = completed.flatMap(t => t.destinations)
  const uniqueCountries = new Set(allDestinations).size

  // Status counts for the grid
  const statusCounts: Record<string, number> = {
    planning: trips.filter(t => t.status === 'planning').length,
    reserved: trips.filter(t => t.status === 'reserved').length,
    ongoing: ongoingTrips.length,
    completed: completed.length,
    cancelled: 0, // Dashboard hook filters out cancelled trips
  }

  // Budget progress for next trip
  const nextTripBudgetPct = nextTrip && nextTrip.total_budget
    ? Math.min(Math.round((nextTrip.total_spent / nextTrip.total_budget) * 100), 100)
    : 0

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  function getTripSubtitle(t: Trip): string {
    const dest = t.destinations[0] ?? ''
    const days = calcTripDays(t.start_date, t.end_date)
    const dateRange = `${formatDate(t.start_date)} - ${formatDate(t.end_date)}`
    const parts = [dest, dateRange, `${days} dias`]
    if (t.travelers_count > 1) parts.push(`${t.travelers_count} viajantes`)
    return parts.join(' \u00B7 ')
  }

  function getTripDotColor(t: Trip): string {
    return TRIP_STATUS_COLORS[t.status] ?? '#3b82f6'
  }

  return (
    <>
    {/* Mobile */}
    <ExperienciasMobile />

    {/* Desktop */}
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* 1. Module Header */}
      <ModuleHeader
        icon={Plane}
        iconBg="rgba(236,72,153,.1)"
        iconColor="#ec4899"
        title="Experiencias"
        subtitle={`${upcoming.length + completed.length} viagens ativas \u00B7 ${completed.length} conclu\u00EDdas \u00B7 ${totalDaysViajados} dias viajados`}
      >
        <button
          onClick={() => router.push('/experiencias/viagens')}
          className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] bg-transparent hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
        >
          <List size={16} />
          Todas
        </button>
        <button
          onClick={() => router.push('/experiencias/nova')}
          className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(236,72,153,.25)] transition-all"
        >
          <Plus size={16} />
          Nova Viagem
        </button>
      </ModuleHeader>

      {/* 2. Explorer Banner */}
      <div className="mb-7">
        <ExplorerBanner
          stats={[
            {
              value: uniqueCountries || 0,
              label: 'Pa\u00EDses Visitados',
              color: '#ec4899',
              progress: { current: uniqueCountries, total: 195 },
            },
            {
              value: new Set(completed.flatMap(t => t.destinations)).size > 0
                ? new Set(
                    // simple continent estimation from destinations count
                    completed.map(() => 'continent')
                  ).size
                : 0,
              label: 'Continentes',
              color: '#06b6d4',
              progress: { current: Math.min(new Set(completed.map(() => 'c')).size, 7), total: 7 },
            },
            {
              value: totalDaysViajados,
              label: 'Dias Viajados',
              color: '#f59e0b',
              subtext: completed.length > 0 ? `desde ${new Date(completed[completed.length - 1]?.start_date ?? '').getFullYear() || '---'}` : 'nenhum ainda',
            },
            {
              value: trips.length,
              label: 'Total Viagens',
              color: '#10b981',
              subtext: `${completed.length} conclu\u00EDdas`,
            },
            {
              value: completed.length,
              label: 'Mem\u00F3rias',
              color: '#a855f7',
              subtext: 'Ver passaporte \u2192',
              onClick: () => router.push('/experiencias/passaporte'),
            },
          ]}
        />
      </div>

      {/* 3. Content area */}
      {loading ? (
        <div className="flex flex-col gap-3.5">
          <div className="h-[140px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-[56px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-[56px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
          <div className="grid grid-cols-5 gap-2.5">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-[80px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />)}
          </div>
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 006 no Supabase.' : error}
          </p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-16 text-center">
          <div className="text-6xl mb-4">{'\u2708\uFE0F'}</div>
          <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-2">Nenhuma viagem planejada</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-6 max-w-sm mx-auto">
            Comece planejando sua pr\u00F3xima aventura com roteiro, or\u00E7amento e checklist completo.
          </p>
          <button
            onClick={() => router.push('/experiencias/nova')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#ec4899] text-white hover:opacity-90"
          >
            <Plus size={16} />
            Planejar minha primeira viagem
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-7">

          {/* Hero: Next Trip */}
          {nextTrip && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden relative sl-fade-up sl-delay-2">
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-[18px]"
                style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #ec4899)' }}
              />
              {/* Decorative glows */}
              <div className="absolute top-[-60px] right-[-20px] w-[320px] h-[320px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(236,72,153,.1) 0%, transparent 65%)' }} />
              <div className="absolute bottom-[-80px] left-[-40px] w-[240px] h-[240px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 65%)' }} />

              <div className="flex items-center">
                {/* Left: Countdown */}
                <div className="flex flex-col items-center justify-center min-w-[160px] py-8 px-9 border-r border-[var(--sl-border)] relative"
                  style={{ background: 'linear-gradient(135deg, rgba(236,72,153,.06), rgba(168,85,247,.04))' }}>
                  <div className="font-[Syne] font-extrabold text-[64px] leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 12px rgba(236,72,153,.3))',
                    }}>
                    {daysUntilNext != null ? (daysUntilNext <= 0 ? '0' : daysUntilNext) : '--'}
                  </div>
                  <div className="text-[13px] text-[var(--sl-t2)] font-bold uppercase tracking-[.14em] mt-2">
                    dias
                  </div>
                  <div className="text-[11px] text-[var(--sl-t3)] mt-1">
                    para decolar
                  </div>
                </div>

                {/* Mid: Trip info */}
                <div className="flex-1 py-7 px-8">
                  <div className="flex items-center gap-[10px] mb-[10px]">
                    <span className="inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[10px] font-bold uppercase tracking-[.06em] bg-[rgba(236,72,153,.1)] text-[#ec4899]">
                      Pr\u00F3xima Viagem
                    </span>
                  </div>
                  <h2 className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] mb-2">
                    {nextTrip.name}
                  </h2>
                  <div className="flex items-center gap-4 text-[12.5px] text-[var(--sl-t2)] mb-4">
                    <span className="flex items-center gap-[5px]">
                      <Clock size={14} className="text-[#ec4899]" />
                      {formatDate(nextTrip.start_date)} - {formatDate(nextTrip.end_date)}
                    </span>
                    <span className="flex items-center gap-[5px]">
                      <MapPin size={14} className="text-[#ec4899]" />
                      {nextTrip.destinations[0]}
                    </span>
                    <span className="flex items-center gap-[5px]">
                      <Users size={14} className="text-[#ec4899]" />
                      {nextTrip.travelers_count} viajante{nextTrip.travelers_count > 1 ? 's' : ''}
                    </span>
                    <span
                      className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                      style={{
                        background: `${TRIP_STATUS_COLORS[nextTrip.status]}14`,
                        color: TRIP_STATUS_COLORS[nextTrip.status],
                      }}
                    >
                      {TRIP_STATUS_LABELS[nextTrip.status]}
                    </span>
                  </div>

                  {/* Budget bar */}
                  <div className="grid items-center gap-4" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <div>
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-[3px]">
                        Or\u00E7amento
                      </div>
                      <div className="font-[DM_Mono] text-[17px] font-medium text-[var(--sl-t1)]">
                        {nextTrip.total_budget ? formatCurrency(nextTrip.total_budget) : '--'}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--sl-t3)] mb-[5px]">
                        <span>{formatCurrency(nextTrip.total_spent)} gastos</span>
                        <span className="text-[#ec4899] font-semibold">{nextTripBudgetPct}%</span>
                      </div>
                      <div className="w-full h-[6px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                        <div
                          className="h-full rounded-[3px] transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                          style={{
                            width: `${nextTripBudgetPct}%`,
                            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-[3px]">
                        Checklist
                      </div>
                      <div className="font-[DM_Mono] text-[17px] font-medium text-[#10b981]">
                        {checklistPct != null ? `${checklistPct}%` : '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 py-7 px-8 border-l border-[var(--sl-border)]">
                  <button
                    onClick={() => router.push(`/experiencias/viagens/${nextTrip.id}`)}
                    className="flex items-center gap-[7px] px-[22px] py-[9px] rounded-[11px] text-[12px] font-semibold bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px transition-all w-full justify-center"
                  >
                    <ArrowRight size={14} />
                    Ver detalhes
                  </button>
                  <button
                    onClick={() => router.push(`/experiencias/viagens/${nextTrip.id}?tab=checklist`)}
                    className="flex items-center gap-[7px] px-[22px] py-[9px] rounded-[11px] text-[12px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] bg-transparent hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all w-full justify-center"
                  >
                    <CheckSquare size={14} />
                    Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trip Strips (active/upcoming) */}
          {activeTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-[14px] sl-fade-up sl-delay-3">
                <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Viagens Ativas
                </h2>
                {trips.length > 5 && (
                  <span
                    onClick={() => router.push('/experiencias/viagens')}
                    className="text-[12px] text-[#ec4899] cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    Ver todas →
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {activeTrips.map((t, i) => (
                  <div key={t.id} className={`sl-fade-up sl-delay-${Math.min(i + 3, 5)}`}>
                    <TripStripRow
                      name={t.name}
                      subtitle={getTripSubtitle(t)}
                      status={TRIP_STATUS_LABELS[t.status]}
                      statusColor={TRIP_STATUS_COLORS[t.status]}
                      budget={t.total_budget ? formatCurrency(t.total_budget) : undefined}
                      dotColor={getTripDotColor(t)}
                      onClick={() => router.push(`/experiencias/viagens/${t.id}`)}
                      className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-5 py-4 hover:border-[var(--sl-border-h)] hover:translate-x-1 transition-all cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Grid */}
          <div>
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[14px] sl-fade-up sl-delay-4">
              Status das Viagens
            </h2>
            <StatusGrid
              className="sl-delay-5"
              items={[
                { label: 'Planejando', count: statusCounts.planning, color: '#f59e0b' },
                { label: 'Reservado', count: statusCounts.reserved, color: '#3b82f6' },
                { label: 'Em andamento', count: statusCounts.ongoing, color: '#10b981' },
                { label: 'Conclu\u00EDdas', count: statusCounts.completed, color: 'var(--sl-t3)' },
                { label: 'Cancelada', count: statusCounts.cancelled, color: '#f43f5e' },
              ]}
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
}
