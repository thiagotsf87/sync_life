import { ExpKpiGrid } from '@/components/experiencias/mobile/ExpKpiGrid'
import type { Trip } from '@/hooks/use-experiencias'
import { calcTripDays } from '@/hooks/use-experiencias'

interface ExpTabDashboardProps {
  onTabChange: (tab: string) => void
  onNewTrip: () => void
  trips?: Trip[]
  loading?: boolean
}

const STATUS_STYLE = {
  completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Concluída' },
  ongoing:   { bg: 'rgba(236,72,153,0.15)', color: '#ec4899', label: 'Ativa' },
  planning:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Planejando' },
  reserved:  { bg: 'rgba(0,85,255,0.15)',   color: '#0055ff', label: 'Reservado' },
  cancelled: { bg: 'rgba(244,63,94,0.15)',  color: '#f43f5e', label: 'Cancelada' },
}

function deriveKpis(trips: Trip[]) {
  const active = trips.filter(t => ['planning', 'reserved', 'ongoing'].includes(t.status))
  const completed = trips.filter(t => t.status === 'completed')
  // Unique country extraction from destinations (simple heuristic: 1 country per trip)
  const uniqueCountries = new Set<string>()
  for (const t of completed) {
    if (t.destinations.length > 0) uniqueCountries.add(t.destinations[0])
  }
  // Rough continent estimate from country count
  const continentCount = uniqueCountries.size === 0 ? 0
    : uniqueCountries.size <= 3 ? 1
    : uniqueCountries.size <= 6 ? 2 : 3

  return {
    total: trips.filter(t => t.status !== 'cancelled').length,
    activeCount: active.length,
    countries: uniqueCountries.size,
    continents: continentCount,
  }
}

function getNextTrip(trips: Trip[]): Trip | null {
  const upcoming = trips.filter(t => ['planning', 'reserved'].includes(t.status))
  if (upcoming.length === 0) return null
  return upcoming.sort((a, b) => a.start_date.localeCompare(b.start_date))[0]
}

function getRecentTrips(trips: Trip[]) {
  return trips
    .filter(t => t.status !== 'cancelled')
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .slice(0, 3)
}

export function ExpTabDashboard({ onTabChange, onNewTrip, trips = [], loading }: ExpTabDashboardProps) {
  const kpis = deriveKpis(trips)
  const nextTrip = getNextTrip(trips)
  const recentTrips = getRecentTrips(trips)

  const kpiItems = [
    { label: 'Missões', value: String(kpis.total), sub: `${kpis.activeCount} ativas`, valueColor: undefined },
    { label: 'Países', value: String(kpis.countries), sub: '+80 XP próximo', valueColor: undefined },
    { label: 'Continentes', value: String(kpis.continents), sub: kpis.continents > 0 ? 'desbloqueados' : 'Explore!', valueColor: undefined },
    { label: 'Missões ativas', value: String(kpis.activeCount), sub: kpis.activeCount > 0 ? '🔥' : 'Nenhuma', valueColor: undefined },
  ]

  // Loading skeleton
  if (loading) {
    return (
      <div className="px-5">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-[12px] animate-pulse" style={{ background: 'var(--sl-s2)' }} />
          ))}
        </div>
        <div className="h-[80px] rounded-[14px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
        <div className="h-[150px] rounded-[14px] animate-pulse" style={{ background: 'var(--sl-s2)' }} />
      </div>
    )
  }

  return (
    <div>
      {/* KPIs */}
      <ExpKpiGrid items={kpiItems} />

      {/* Empty state hero — shown when no trips, in place of trip sections */}
      {trips.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-6 pb-4 text-center">
          <div className="text-[52px] mb-4">✈️</div>
          <h3 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-2">
            Sua primeira missão aguarda!
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4 leading-[1.5]">
            Comece planejando sua primeira aventura épica. O mundo é seu mapa!
          </p>
        </div>
      )}

      {/* AI Card */}
      <div
        className="mx-4 mb-3 rounded-[14px] p-[12px_14px] flex gap-[10px] items-start"
        style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
          style={{ background: 'rgba(139,92,246,0.15)' }}
        >
          🧭
        </div>
        <p className="text-[12px] text-[var(--sl-t2)] leading-[1.5]">
          <strong className="text-[#c4b5fd]">Coach Explorador:</strong> {kpis.activeCount > 0 ? `${kpis.activeCount} missões ativas! Continue guardando para a próxima aventura. 🌎` : 'Planeje sua próxima missão épica e desbloqueie novos continentes!'}
        </p>
      </div>

      {/* Next Trip Hero */}
      {nextTrip && (
        <>
          <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] px-5 mb-[10px]">
            Próxima Missão
          </p>
          <div
            className="mx-4 mb-[14px] rounded-[16px] overflow-hidden"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <div
              className="h-[100px] relative flex items-end px-[14px] pb-[10px]"
              style={{
                background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #ec4899 150%)',
              }}
            >
              <span className="text-[28px] mr-[10px]">✈️</span>
              <div className="flex-1">
                <p className="font-[Syne] text-[16px] font-bold text-white">
                  Missão: {nextTrip.name}
                </p>
                <p className="text-[11px] text-white/70 mt-[2px]">
                  {nextTrip.start_date} → {nextTrip.end_date} · {calcTripDays(nextTrip.start_date, nextTrip.end_date)} dias
                </p>
              </div>
              <span
                className="absolute top-[10px] right-[10px] text-[10px] font-semibold px-[10px] py-[3px] rounded-[20px] backdrop-blur-sm"
                style={{
                  background: 'rgba(139,92,246,0.3)',
                  color: '#c4b5fd',
                }}
              >
                +50 XP
              </span>
            </div>
            {nextTrip.total_budget && nextTrip.total_budget > 0 && (
              <div className="px-[14px] py-[12px]">
                <div className="flex justify-between text-[11px] mb-[6px]">
                  <span className="text-[var(--sl-t2)]">Orçamento guardado</span>
                  <span className="font-[DM_Mono] font-medium" style={{ color: '#c4b5fd' }}>
                    {Math.round((nextTrip.total_spent / nextTrip.total_budget) * 100)}% · R$ {nextTrip.total_spent.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="h-[6px] rounded-[4px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
                  <div
                    className="h-full rounded-[4px]"
                    style={{
                      width: `${Math.min((nextTrip.total_spent / nextTrip.total_budget) * 100, 100)}%`,
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      transition: 'width 0.6s',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Recent Trips */}
      {recentTrips.length > 0 && (
        <>
          <div className="flex justify-between items-center px-5 mb-[10px]">
            <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]" style={{ marginBottom: 0 }}>
              Conquistadas
            </p>
            <button
              onClick={() => onTabChange('viagens')}
              className="text-[11px] font-medium"
              style={{ color: '#c4b5fd' }}
            >
              Ver todas →
            </button>
          </div>
          <div
            className="mx-4 mb-[14px] rounded-[12px] px-[12px]"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            {recentTrips.map((trip, i) => {
              const statusStyle = STATUS_STYLE[trip.status] ?? STATUS_STYLE['planning']
              return (
                <div
                  key={trip.id}
                  className="flex items-center gap-[10px] py-[10px]"
                  style={{ borderBottom: i < recentTrips.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[22px]"
                    style={{ background: 'var(--sl-s2)' }}>
                    ✈️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{trip.name}</p>
                    <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                      {trip.start_date} · {calcTripDays(trip.start_date, trip.end_date)} dias
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-[3px] rounded-[20px] shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {trip.status === 'completed' ? '✅' :
                     trip.status === 'ongoing' ? '🔥 Ativa' : statusStyle.label}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] px-5 mb-[10px]" style={{ marginTop: 4 }}>
        Ações rápidas
      </p>
      <div className="grid grid-cols-2 gap-[10px] mx-4 mb-4">
        {[
          { icon: '🚀', label: 'Nova missão', action: () => onNewTrip() },
          { icon: '📸', label: 'Registrar diário', action: () => onTabChange('memorias') },
          { icon: '🗺️', label: 'Aventuras', action: () => onTabChange('bucketlist') },
          { icon: '🏆', label: 'Passaporte', action: () => onTabChange('passaporte') },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="rounded-[12px] p-[12px] text-center transition-colors"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <div className="text-[20px] mb-1">{item.icon}</div>
            <div className="text-[11px] font-medium text-[var(--sl-t2)]">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
