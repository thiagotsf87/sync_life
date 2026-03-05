'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useTrips, useDeleteTrip,
  TRIP_STATUS_LABELS,
  type TripStatus,
} from '@/hooks/use-experiencias'
import { TripCard } from '@/components/experiencias/TripCard'

type FilterStatus = TripStatus | 'all'

export default function ViagensPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const { trips, loading, error, reload } = useTrips()
  const deleteTrip = useDeleteTrip()

  const filtered = filterStatus === 'all'
    ? trips
    : trips.filter(t => t.status === filterStatus)

  async function handleDelete(id: string) {
    if (!confirm('Remover esta viagem? Todos os dados serão apagados.')) return
    try {
      await deleteTrip(id)
      toast.success('Viagem removida')
      await reload()
    } catch {
      toast.error('Erro ao remover viagem')
    }
  }

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'planning', label: 'Planejando' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'ongoing', label: 'Em andamento' },
    { value: 'completed', label: 'Concluídas' },
    { value: 'cancelled', label: 'Canceladas' },
  ]

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/experiencias')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Experiências
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🗺️ Minhas Viagens
        </h1>
        <button
          onClick={() => router.push('/experiencias/nova')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Viagem
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {statusFilters.map(f => {
          const count = f.value === 'all' ? trips.length : trips.filter(t => t.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-[10px] text-[12px] font-medium border transition-all',
                filterStatus === f.value
                  ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[var(--sl-t1)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
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
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">✈️</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {filterStatus === 'all' ? 'Nenhuma viagem ainda' : `Nenhuma viagem ${TRIP_STATUS_LABELS[filterStatus as TripStatus]?.toLowerCase()}`}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">
            {filterStatus === 'all'
              ? 'Comece planejando sua próxima aventura!'
              : 'Altere o filtro para ver outras viagens.'}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => router.push('/experiencias/nova')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90"
            >
              <Plus size={15} />
              Planejar viagem
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {filtered.map(t => (
            <TripCard
              key={t.id}
              trip={t}
              onClick={() => router.push(`/experiencias/viagens/${t.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
