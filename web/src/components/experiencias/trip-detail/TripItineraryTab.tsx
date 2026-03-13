'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatMoney } from '@/lib/currency'
import {
  ITINERARY_CATEGORY_LABELS,
  type TripItineraryItem,
  type ItineraryCategory,
} from '@/hooks/use-experiencias'
import { ItineraryModal } from '@/components/experiencias/trip-detail/ItineraryModal'

interface TripItineraryTabProps {
  trip: { id: string; start_date: string; end_date: string; name: string; destinations: string[]; currency: string }
  itinerary: TripItineraryItem[]
  itineraryByDay: Record<string, TripItineraryItem[]>
  tripDays: string[]
  isPro: boolean
  formatTripAmountCompact: (value: number) => string
  deleteItineraryItem: (id: string) => Promise<void>
  addItineraryItem: (data: {
    trip_id: string
    day_date: string
    sort_order: number
    title: string
    category: ItineraryCategory
    address: string | null
    estimated_time: string | null
    estimated_cost: number | null
    currency: string
    notes: string | null
  }) => Promise<void>
  reorderItineraryDay: (tripId: string, dayDate: string, ids: string[]) => Promise<void>
  reload: () => Promise<void>
}

function getMapPinLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function getSuggestedRouteLink(addresses: string[]) {
  if (addresses.length < 2) return null
  return `https://www.google.com/maps/dir/${addresses.map(a => encodeURIComponent(a)).join('/')}`
}

function estimateTransitMinutes(fromAddress?: string | null, toAddress?: string | null): number {
  if (!fromAddress || !toAddress) return 30
  const from = fromAddress.trim().toLowerCase()
  const to = toAddress.trim().toLowerCase()
  if (from === to) return 5
  const fromToken = from.split(',')[0]?.trim()
  const toToken = to.split(',')[0]?.trim()
  if (fromToken && toToken && fromToken === toToken) return 15
  return 35
}

export function TripItineraryTab({
  trip, itinerary, itineraryByDay, tripDays, isPro,
  formatTripAmountCompact,
  deleteItineraryItem, addItineraryItem, reorderItineraryDay,
  reload,
}: TripItineraryTabProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [modalInitialDay, setModalInitialDay] = useState(trip.start_date)
  const [draggingItineraryId, setDraggingItineraryId] = useState<string | null>(null)

  function handleExportItineraryPdf() {
    if (!isPro) {
      toast.info('Exportar roteiro em PDF é um recurso PRO.', {
        action: { label: 'Ver plano PRO', onClick: () => router.push('/configuracoes/plano') },
      })
      return
    }
    if (itinerary.length === 0) {
      toast.info('Adicione atividades ao roteiro para exportar.')
      return
    }
    const fmtCompact = (v: number) => formatMoney(v, trip.currency)
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(16)
    doc.text(`Roteiro da Viagem: ${trip.name}`, 40, 48)
    doc.setFontSize(10)
    doc.text(`Destino(s): ${trip.destinations.join(' -> ')}`, 40, 66)
    doc.text(
      `Periodo: ${new Date(trip.start_date + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(trip.end_date + 'T12:00:00').toLocaleDateString('pt-BR')}`,
      40, 80
    )
    const rows = itinerary.slice().sort((a, b) => {
      if (a.day_date === b.day_date) return a.sort_order - b.sort_order
      return a.day_date.localeCompare(b.day_date)
    }).map((item) => [
      new Date(item.day_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      item.estimated_time ? item.estimated_time.slice(0, 5) : '-',
      item.title,
      ITINERARY_CATEGORY_LABELS[item.category],
      item.address ?? '-',
      item.estimated_cost != null ? fmtCompact(item.estimated_cost) : '-',
    ])
    autoTable(doc, {
      startY: 96,
      head: [['Dia', 'Hora', 'Atividade', 'Categoria', 'Endereco', 'Custo']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [6, 182, 212], textColor: [3, 7, 26] },
    })
    const safeName = trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    doc.save(`roteiro-${safeName}.pdf`)
    toast.success('PDF do roteiro gerado!')
  }

  const itineraryAddresses = itinerary
    .filter(item => item.address && item.address.trim().length > 0)
    .map(item => ({
      id: item.id,
      title: item.title,
      address: item.address!.trim(),
      day: item.day_date,
      time: item.estimated_time,
    }))

  async function handleReorderItinerary(dayDate: string, draggedId: string, targetId: string) {
    if (draggedId === targetId) return
    const dayItems = itineraryByDay[dayDate] ?? []
    const fromIdx = dayItems.findIndex(i => i.id === draggedId)
    const toIdx = dayItems.findIndex(i => i.id === targetId)
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return

    const reordered = [...dayItems]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    try {
      await reorderItineraryDay(trip.id, dayDate, reordered.map(i => i.id))
      await reload()
    } catch {
      toast.error('Erro ao reordenar roteiro')
    }
  }

  function openModalForDay(day: string) {
    setModalInitialDay(day)
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🗺️ Roteiro dia a dia</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportItineraryPdf}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium border',
              isPro
                ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981] hover:bg-[#10b981]/20'
                : 'bg-[var(--sl-s2)] border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {!isPro && <Crown size={12} />}
            {isPro ? 'Exportar PDF' : 'PDF (PRO)'}
          </button>
          <button
            onClick={() => openModalForDay(trip.start_date)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/20"
          >
            <Plus size={13} />
            Atividade
          </button>
        </div>
      </div>

      {/* RN-EXP-13: mapa com pins e rota sugerida (via links de mapas) */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🗺️ Mapa da viagem</h3>
          {(() => {
            const routeLink = getSuggestedRouteLink(itineraryAddresses.map(i => i.address))
            if (!routeLink) return null
            return (
              <a
                href={routeLink}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#ec4899] hover:opacity-80"
              >
                Abrir rota sugerida →
              </a>
            )
          })()}
        </div>
        {itineraryAddresses.length === 0 ? (
          <p className="text-[11px] text-[var(--sl-t3)]">
            Adicione endereço nas atividades para visualizar pins e rota sugerida.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {itineraryAddresses.slice(0, 6).map((pin, idx) => (
              <a
                key={pin.id}
                href={getMapPinLink(pin.address)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-[10px] border border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center text-[10px] font-bold text-[#ec4899] shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--sl-t1)] truncate">
                    {pin.title} {pin.time ? `· ${pin.time.slice(0, 5)}` : ''}
                  </p>
                  <p className="text-[10px] text-[var(--sl-t3)] truncate">{pin.address}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {tripDays.map(day => {
        const dayItems = itineraryByDay[day] ?? []
        const dayDate = new Date(day + 'T12:00:00')
        const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
        const dayCost = dayItems.reduce((s, i) => s + (i.estimated_cost ?? 0), 0)
        const transitEstimates = dayItems
          .map((item, idx) => {
            const next = dayItems[idx + 1]
            if (!next) return null
            return {
              fromTitle: item.title,
              toTitle: next.title,
              etaMinutes: estimateTransitMinutes(item.address, next.address),
            }
          })
          .filter(Boolean) as { fromTitle: string; toTitle: string; etaMinutes: number }[]

        return (
          <div key={day} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[11px] font-bold text-[#ec4899] capitalize">{dayLabel}</div>
              {dayCost > 0 && (
                <span className="text-[10px] text-[var(--sl-t3)]">
                  · {formatTripAmountCompact(dayCost)}
                </span>
              )}
              <button
                onClick={() => openModalForDay(day)}
                className="ml-auto text-[10px] text-[#ec4899] hover:opacity-80"
              >
                + Adicionar
              </button>
            </div>

            {dayItems.length === 0 ? (
              <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-xl p-4 text-center">
                <p className="text-[11px] text-[var(--sl-t3)]">Nenhuma atividade — clique em + Adicionar</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {dayItems.map((item, idx) => (
                  <div key={item.id}>
                    <div
                      draggable
                      onDragStart={() => setDraggingItineraryId(item.id)}
                      onDragEnd={() => setDraggingItineraryId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault()
                        if (!draggingItineraryId) return
                        await handleReorderItinerary(day, draggingItineraryId, item.id)
                        setDraggingItineraryId(null)
                      }}
                      className={cn(
                        'flex items-start gap-3 bg-[var(--sl-s1)] border rounded-xl p-3',
                        'transition-colors cursor-move',
                        draggingItineraryId === item.id
                          ? 'border-[#ec4899] opacity-70'
                          : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-[#ec4899] font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-[12px] text-[var(--sl-t1)]">{item.title}</span>
                          <span className="text-[9px] text-[var(--sl-t3)] bg-[var(--sl-s2)] px-1.5 py-0.5 rounded-full">
                            {ITINERARY_CATEGORY_LABELS[item.category]}
                          </span>
                          {item.estimated_time && (
                            <span className="text-[10px] text-[var(--sl-t3)]">🕐 {item.estimated_time.slice(0, 5)}</span>
                          )}
                        </div>
                        {item.address && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">📍 {item.address}</p>}
                        {item.notes && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{item.notes}</p>}
                        {item.estimated_cost != null && (
                          <p className="font-[DM_Mono] text-[10px] text-[var(--sl-t2)] mt-0.5">
                            {formatTripAmountCompact(item.estimated_cost)}
                          </p>
                        )}
                      </div>
                      <button onClick={async () => { await deleteItineraryItem(item.id); await reload() }}
                        className="p-1 rounded hover:bg-[rgba(244,63,94,0.1)] transition-colors shrink-0">
                        <Trash2 size={11} className="text-[var(--sl-t3)]" />
                      </button>
                    </div>
                    {transitEstimates[idx] && (
                      <div className="ml-9 mt-1 mb-1 px-2.5 py-1.5 rounded-lg bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                        <p className="text-[10px] text-[var(--sl-t3)]">
                          🚗 Deslocamento estimado (beta): ~{transitEstimates[idx].etaMinutes} min entre
                          {' '}<span className="text-[var(--sl-t2)]">{transitEstimates[idx].fromTitle}</span> e
                          {' '}<span className="text-[var(--sl-t2)]">{transitEstimates[idx].toTitle}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {showModal && (
        <ItineraryModal
          tripId={trip.id}
          tripCurrency={trip.currency}
          tripDays={tripDays}
          initialDayDate={modalInitialDay}
          itineraryByDay={itineraryByDay}
          onClose={() => setShowModal(false)}
          onSave={addItineraryItem}
          onReload={reload}
        />
      )}
    </div>
  )
}
