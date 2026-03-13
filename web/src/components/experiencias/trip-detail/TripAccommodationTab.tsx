'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TripAccommodation, BookingStatus } from '@/hooks/use-experiencias'
import { AccommodationModal } from '@/components/experiencias/trip-detail/AccommodationModal'

interface TripAccommodationTabProps {
  trip: { id: string; start_date: string; end_date: string; currency: string }
  accommodations: TripAccommodation[]
  formatTripAmountCompact: (value: number) => string
  addAccommodation: (data: {
    trip_id: string
    name: string
    address: string | null
    check_in: string
    check_out: string
    cost_per_night: number | null
    total_cost: number | null
    currency: string
    booking_status: BookingStatus
    confirmation_code: string | null
    notes: string | null
  }) => Promise<void>
  deleteAccommodation: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function TripAccommodationTab({
  trip, accommodations, formatTripAmountCompact,
  addAccommodation, deleteAccommodation, reload,
}: TripAccommodationTabProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏨 Hospedagens</h2>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/20">
          <Plus size={13} />
          Adicionar
        </button>
      </div>

      {accommodations.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏨</div>
          <p className="text-[13px] text-[var(--sl-t2)]">Adicione hotéis, Airbnb ou pousadas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {accommodations.map(a => (
            <div key={a.id} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">{a.name}</span>
                    <span className={cn(
                      'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full',
                      a.booking_status === 'paid' ? 'text-[#10b981] bg-[#10b981]/10' :
                      a.booking_status === 'reserved' ? 'text-[#0055ff] bg-[#0055ff]/10' :
                      'text-[#f59e0b] bg-[#f59e0b]/10'
                    )}>
                      {a.booking_status === 'paid' ? 'Pago' : a.booking_status === 'reserved' ? 'Reservado' : 'Estimado'}
                    </span>
                  </div>
                  {a.address && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">📍 {a.address}</p>}
                  <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                    Check-in: {new Date(a.check_in + 'T12:00:00').toLocaleDateString('pt-BR')} →
                    Check-out: {new Date(a.check_out + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.total_cost != null && (
                    <span className="font-[DM_Mono] text-[12px] text-[#ec4899]">
                      {formatTripAmountCompact(a.total_cost)}
                    </span>
                  )}
                  <button onClick={async () => { await deleteAccommodation(a.id); await reload() }}
                    className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors">
                    <Trash2 size={12} className="text-[var(--sl-t3)]" />
                  </button>
                </div>
              </div>
              {a.confirmation_code && (
                <p className="text-[10px] text-[var(--sl-t3)] mt-1.5 font-[DM_Mono]">Confirmação: {a.confirmation_code}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AccommodationModal
          tripId={trip.id}
          tripCurrency={trip.currency}
          startDate={trip.start_date}
          endDate={trip.end_date}
          onClose={() => setShowModal(false)}
          onSave={addAccommodation}
          onReload={reload}
        />
      )}
    </div>
  )
}
