'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, Plus, Search, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useTrips,
  TRIP_STATUS_LABELS, TRIP_STATUS_COLORS,
  TRIP_TYPE_LABELS,
  calcTripDays,
  type TripStatus,
} from '@/hooks/use-experiencias'
import { ModuleHeader } from '@/components/ui/module-header'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'

type FilterStatus = TripStatus | 'all'

export default function ViagensPage() {
  const router = useRouter()

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { trips, loading, error } = useTrips()

  const totalBudget = trips.reduce((s, t) => s + (t.total_budget ?? 0), 0)

  const filtered = useMemo(() => {
    let result = filterStatus === 'all'
      ? trips
      : trips.filter(t => t.status === filterStatus)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.destinations.some(d => d.toLowerCase().includes(q)) ||
        t.start_date.includes(q) ||
        t.end_date.includes(q)
      )
    }

    return result
  }, [trips, filterStatus, searchQuery])

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'planning', label: 'Planejando' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'ongoing', label: 'Em andamento' },
    { value: 'completed', label: 'Concluidas' },
    { value: 'cancelled', label: 'Canceladas' },
  ]

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <>
    {/* Mobile — usa aba Viagens do ExperienciasMobile */}
    <ExperienciasMobile />

    {/* Desktop */}
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Module Header */}
      <ModuleHeader
        icon={Plane}
        iconBg="rgba(236,72,153,.1)"
        iconColor="#ec4899"
        title="Minhas Viagens"
        subtitle={`${trips.length} viagens registradas \u00B7 ${formatCurrency(totalBudget)} total investido`}
      >
        <button
          onClick={() => router.push('/experiencias/nova')}
          className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(236,72,153,.25)] transition-all"
        >
          <Plus size={16} />
          Nova Viagem
        </button>
      </ModuleHeader>

      {/* Search Bar */}
      <div className="flex items-center gap-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] px-4 py-[10px] mb-4 transition-colors focus-within:border-[var(--sl-border-h)] sl-fade-up sl-delay-1">
        <Search size={16} className="text-[var(--sl-t3)] shrink-0" />
        <input
          type="text"
          placeholder="Buscar viagens por nome, destino ou data..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] font-[DM_Sans]"
        />
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 mb-5 flex-wrap sl-fade-up sl-delay-2">
        {statusFilters.map(f => {
          const count = f.value === 'all' ? trips.length : trips.filter(t => t.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={cn(
                'inline-flex items-center gap-[5px] px-[14px] py-[6px] rounded-[9px] text-[12px] font-semibold border cursor-pointer transition-all whitespace-nowrap',
                filterStatus === f.value
                  ? 'bg-[rgba(236,72,153,.1)] border-[rgba(236,72,153,.3)] text-[var(--sl-t1)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {f.label}
              <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)]">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-[6px]">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-[52px] rounded-[14px] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 006 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
          <div className="text-5xl mb-3">{'\u2708\uFE0F'}</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {filterStatus === 'all' ? 'Nenhuma viagem ainda' : `Nenhuma viagem ${TRIP_STATUS_LABELS[filterStatus as TripStatus]?.toLowerCase()}`}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">
            {filterStatus === 'all'
              ? 'Comece planejando sua proxima aventura!'
              : 'Altere o filtro para ver outras viagens.'}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => router.push('/experiencias/nova')}
              className="inline-flex items-center gap-1.5 px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold bg-[#ec4899] text-white hover:brightness-110"
            >
              <Plus size={15} />
              Planejar viagem
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Data Table */}
          <table className="w-full border-collapse sl-fade-up sl-delay-3" style={{ borderSpacing: '0 6px' }}>
            <thead>
              <tr>
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-left" style={{ width: '40px' }} />
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-left">Viagem</th>
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-left">Destino</th>
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-left">Periodo</th>
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-left">Status</th>
                <th className="text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] px-4 pb-2 text-right">Orcamento</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const days = calcTripDays(t.start_date, t.end_date)
                const statusColor = TRIP_STATUS_COLORS[t.status]
                const isCancelled = t.status === 'cancelled'
                const isCompleted = t.status === 'completed'
                return (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/experiencias/viagens/${t.id}`)}
                    className="cursor-pointer group"
                  >
                    <td className="bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-l border-[var(--sl-border)] rounded-l-[14px] group-hover:bg-[var(--sl-s2)] transition-colors">
                      <div
                        className="w-[10px] h-[10px] rounded-full mx-auto"
                        style={{ background: statusColor }}
                      />
                    </td>
                    <td className="bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)] transition-colors">
                      <div className={cn('font-semibold text-[13.5px]', isCancelled && 'text-[var(--sl-t2)]')}>{t.name}</div>
                      <div className="text-[11.5px] text-[var(--sl-t3)] mt-0.5">
                        {t.travelers_count} viajante{t.travelers_count > 1 ? 's' : ''} {'\u00B7'} {TRIP_TYPE_LABELS[t.trip_type]}
                      </div>
                    </td>
                    <td className={cn('bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)] transition-colors', isCancelled && 'text-[var(--sl-t3)]')}>
                      {t.destinations[0] ?? '--'}
                    </td>
                    <td className="bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)] transition-colors">
                      <span className={cn('font-[DM_Mono] text-[12px]', isCancelled && 'text-[var(--sl-t3)]')}>
                        {formatDate(t.start_date)} {'\u2014'} {formatDate(t.end_date)}
                      </span>
                      <div className="text-[11.5px] text-[var(--sl-t3)] mt-0.5">{days} dias</div>
                    </td>
                    <td className="bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)] transition-colors">
                      <span
                        className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: isCompleted ? 'var(--sl-s3)' : `${statusColor}14`,
                          color: isCompleted ? 'var(--sl-t2)' : statusColor,
                        }}
                      >
                        {TRIP_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="bg-[var(--sl-s1)] px-4 py-4 text-[13px] border-t border-b border-r border-[var(--sl-border)] rounded-r-[14px] text-right group-hover:bg-[var(--sl-s2)] transition-colors">
                      <span className={cn('font-[DM_Mono] font-medium', (isCancelled || !t.total_budget) ? 'text-[var(--sl-t3)]' : isCompleted ? 'text-[var(--sl-t2)]' : '')}>
                        {t.total_budget ? formatCurrency(t.total_budget) : '\u2014'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Summary Row */}
          <div className="flex items-center justify-between px-5 py-[14px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] mt-[14px] sl-fade-up sl-delay-4">
            <div className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t2)]">
              <List size={14} className="text-[var(--sl-t3)]" />
              <span>{filtered.length} viagens exibidas de {trips.length}</span>
            </div>
            <div className="flex gap-5">
              <div className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t2)]">
                <span>Orcamento total:</span>
                <span className="font-[DM_Mono] font-medium text-[var(--sl-t1)]">
                  {formatCurrency(filtered.reduce((s, t) => s + (t.total_budget ?? 0), 0))}
                </span>
              </div>
              <div className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t2)]">
                <span>Dias viajados:</span>
                <span className="font-[DM_Mono] font-medium text-[var(--sl-t1)]">
                  {filtered.reduce((s, t) => s + calcTripDays(t.start_date, t.end_date), 0)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  )
}
