'use client'

import { useState } from 'react'
import type { Trip, TripStatus } from '@/hooks/use-experiencias'
import { TRIP_STATUS_LABELS, calcTripDays } from '@/hooks/use-experiencias'
import { ExpTripStatusSheet } from '@/components/experiencias/mobile/ExpTripStatusSheet'
import { ExpCelebrationModal } from '@/components/experiencias/mobile/ExpCelebrationModal'
import { ExpUpgradeModal } from '@/components/experiencias/mobile/ExpUpgradeModal'

interface ExpTabViagensProps {
  trips: Trip[]
  loading: boolean
  onUpdateStatus: (tripId: string, status: TripStatus) => Promise<void>
  onOpenMemoryForm?: (trip: Trip) => void
  memoriesMap?: Record<string, boolean> // tripId → has memory
}

type FilterKey = 'all' | 'planning' | 'reserved' | 'ongoing' | 'completed' | 'cancelled'

const BORDER_COLORS: Record<TripStatus, string> = {
  planning:  '#f59e0b',
  reserved:  '#0055ff',
  ongoing:   '#10b981',
  completed: '#6e90b8',
  cancelled: '#f43f5e',
}

const STATUS_BADGE: Record<TripStatus, { bg: string; color: string }> = {
  planning:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  reserved:  { bg: 'rgba(0,85,255,0.15)',    color: '#0055ff' },
  ongoing:   { bg: 'rgba(236,72,153,0.15)',  color: '#ec4899' },
  completed: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  cancelled: { bg: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
}

const FILTER_GROUPS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'planning',  label: 'Planejando' },
  { key: 'ongoing',   label: 'Ativas' },
  { key: 'completed', label: 'Concluídas' },
  { key: 'cancelled', label: 'Canceladas' },
]

function getStatusLabel(status: TripStatus): string {
  if (status === 'ongoing') return '🔥 Ativa'
  if (status === 'completed') return '✅ Conquistada'
  return TRIP_STATUS_LABELS[status]
}

export function ExpTabViagens({
  trips,
  loading,
  onUpdateStatus,
  onOpenMemoryForm,
  memoriesMap = {},
}: ExpTabViagensProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [statusSheetTrip, setStatusSheetTrip] = useState<Trip | null>(null)
  const [statusSheetLoading, setStatusSheetLoading] = useState(false)
  const [celebrationTrip, setCelebrationTrip] = useState<Trip | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const filtered = filter === 'all'
    ? trips.filter(t => t.status !== 'cancelled')
    : trips.filter(t => t.status === filter)

  const filterCounts: Record<FilterKey, number> = {
    all:       trips.filter(t => t.status !== 'cancelled').length,
    planning:  trips.filter(t => t.status === 'planning').length,
    reserved:  trips.filter(t => t.status === 'reserved').length,
    ongoing:   trips.filter(t => t.status === 'ongoing').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  }

  async function handleStatusSelect(newStatus: TripStatus) {
    if (!statusSheetTrip) return
    setStatusSheetLoading(true)
    try {
      await onUpdateStatus(statusSheetTrip.id, newStatus)
      if (newStatus === 'completed') {
        setCelebrationTrip(statusSheetTrip)
      }
    } catch (err: any) {
      if (err?.code === 'ACTIVE_LIMIT') {
        alert('Você já tem uma viagem em andamento. Finalize-a antes de iniciar outra.')
      } else {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar status')
      }
    } finally {
      setStatusSheetLoading(false)
      setStatusSheetTrip(null)
    }
  }

  if (loading) {
    return (
      <div className="px-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[90px] rounded-[14px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="px-5">
      {/* Filter pills */}
      <div className="flex gap-[6px] mb-[14px] flex-wrap">
        {FILTER_GROUPS.map(f => {
          const active = filter === f.key
          const count = filterCounts[f.key]
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[11px] font-medium px-3 py-[5px] rounded-[20px] transition-colors"
              style={{
                background: active ? 'rgba(139,92,246,0.15)' : 'var(--sl-s2)',
                color: active ? '#c4b5fd' : 'var(--sl-t2)',
                border: `1px solid ${active ? 'rgba(139,92,246,0.3)' : 'var(--sl-border)'}`,
              }}
            >
              {f.key === 'all' ? 'Missões' : (f.key === 'completed' ? 'Conquistadas' : f.label)} ({count})
            </button>
          )
        })}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[32px] mb-2">✈️</p>
          <p className="text-[13px] text-[var(--sl-t2)]">
            {filter === 'all' ? 'Nenhuma viagem ainda' : `Nenhuma viagem com status "${filter}"`}
          </p>
        </div>
      )}

      {/* Trip cards */}
      {filtered.map(trip => {
        const hasMemory = memoriesMap[trip.id] ?? false
        const memoryPending = trip.status === 'completed' && !hasMemory
        const budgetPct = trip.total_budget && trip.total_budget > 0
          ? Math.round((trip.total_spent / trip.total_budget) * 100)
          : null

        return (
          <div
            key={trip.id}
            className="rounded-[14px] p-[14px] mb-[10px] relative"
            style={{
              background: 'var(--sl-s1)',
              border: '1px solid var(--sl-border)',
              borderLeft: `3px solid ${BORDER_COLORS[trip.status]}`,
            }}
          >
            {/* Top row */}
            <div className="flex items-center gap-[10px] mb-2">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[22px]"
                style={{ background: 'var(--sl-s2)' }}>
                ✈️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">
                  {trip.status === 'completed'
                    ? `✅ ${trip.name}`
                    : `Missão: ${trip.name}`}
                </p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                  {trip.start_date} · {calcTripDays(trip.start_date, trip.end_date)} dias
                </p>
              </div>
              {/* Status badge — tap to change */}
              <button
                onClick={() => setStatusSheetTrip(trip)}
                className="text-[10px] font-semibold px-[10px] py-[3px] rounded-[20px] shrink-0"
                style={STATUS_BADGE[trip.status]}
              >
                {getStatusLabel(trip.status)} ›
              </button>
            </div>

            {/* Bottom tags */}
            <div className="flex gap-3 flex-wrap">
              <span className="text-[10px] text-[var(--sl-t3)]">
                👥 {trip.travelers_count} viajante{trip.travelers_count > 1 ? 's' : ''}
              </span>
              {trip.total_budget && trip.total_budget > 0 && (
                <span className="text-[10px] text-[var(--sl-t3)]">
                  💰 R$ {trip.total_budget.toLocaleString('pt-BR')}
                </span>
              )}
              {budgetPct !== null && (
                <span className="text-[10px]" style={{ color: '#c4b5fd' }}>
                  {budgetPct}% orçado
                </span>
              )}

              {/* 📸 Memory pending badge */}
              {memoryPending && (
                <button
                  onClick={() => onOpenMemoryForm?.(trip)}
                  className="text-[10px] px-2 py-[2px] rounded-[10px]"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
                >
                  📸 Sem diário
                </button>
              )}
              {/* 🔮 Futuro linked badge — RN-EXP-02 */}
              {trip.objective_id && (
                <span
                  className="text-[10px] px-2 py-[2px] rounded-[10px]"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}
                >
                  🔮 Missão de Vida
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* Status Sheet */}
      {statusSheetTrip && (
        <ExpTripStatusSheet
          open
          onClose={() => setStatusSheetTrip(null)}
          onSelect={handleStatusSelect}
          currentStatus={statusSheetTrip.status}
          tripName={statusSheetTrip.name}
          loading={statusSheetLoading}
        />
      )}

      {/* Celebration */}
      <ExpCelebrationModal
        open={!!celebrationTrip}
        onClose={() => setCelebrationTrip(null)}
        tripName={celebrationTrip?.name}
        onRegisterMemory={() => {
          if (celebrationTrip) onOpenMemoryForm?.(celebrationTrip)
          setCelebrationTrip(null)
        }}
      />

      {/* Upgrade modal */}
      <ExpUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="viagens"
        limitDescription="Você atingiu o limite de 5 viagens ativas no plano gratuito."
      />
    </div>
  )
}
