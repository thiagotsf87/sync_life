'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TRANSPORT_TYPE_LABELS,
  type TripTransport, type TransportType, type BookingStatus,
} from '@/hooks/use-experiencias'
import { TransportModal } from '@/components/experiencias/trip-detail/TransportModal'

interface TripTransportsTabProps {
  trip: { id: string; currency: string }
  transports: TripTransport[]
  formatTripAmountCompact: (value: number) => string
  addTransport: (data: {
    trip_id: string
    type: TransportType
    origin: string | null
    destination: string | null
    departure_datetime: string | null
    arrival_datetime: string | null
    company: string | null
    cost: number | null
    currency: string
    booking_status: BookingStatus
    confirmation_code: string | null
    notes: null
  }) => Promise<void>
  deleteTransport: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function TripTransportsTab({
  trip, transports, formatTripAmountCompact,
  addTransport, deleteTransport, reload,
}: TripTransportsTabProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✈️ Transportes</h2>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/20">
          <Plus size={13} />
          Adicionar
        </button>
      </div>

      {transports.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-[13px] text-[var(--sl-t2)]">Adicione voos, trens e outros transportes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transports.map(t => (
            <div key={t.id} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[13px] text-[var(--sl-t1)]">
                      {TRANSPORT_TYPE_LABELS[t.type]}
                    </span>
                    <span className="text-[11px] text-[var(--sl-t1)]">
                      {t.origin} → {t.destination}
                    </span>
                    <span className={cn(
                      'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full',
                      t.booking_status === 'paid' ? 'text-[#10b981] bg-[#10b981]/10' :
                      t.booking_status === 'reserved' ? 'text-[#0055ff] bg-[#0055ff]/10' :
                      'text-[#f59e0b] bg-[#f59e0b]/10'
                    )}>
                      {t.booking_status === 'paid' ? 'Pago' : t.booking_status === 'reserved' ? 'Reservado' : 'Estimado'}
                    </span>
                  </div>
                  {t.departure_datetime && (
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      🕐 {new Date(t.departure_datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      {t.arrival_datetime && ` → ${new Date(t.arrival_datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`}
                    </p>
                  )}
                  {t.company && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{t.company}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {t.cost != null && (
                    <span className="font-[DM_Mono] text-[12px] text-[#ec4899]">
                      {formatTripAmountCompact(t.cost)}
                    </span>
                  )}
                  <button onClick={async () => { await deleteTransport(t.id); await reload() }}
                    className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors">
                    <Trash2 size={12} className="text-[var(--sl-t3)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TransportModal
          tripId={trip.id}
          tripCurrency={trip.currency}
          onClose={() => setShowModal(false)}
          onSave={addTransport}
          onReload={reload}
        />
      )}
    </div>
  )
}
