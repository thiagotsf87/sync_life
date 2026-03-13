'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { TripAIChat } from '@/components/experiencias/TripAIChat'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createTransactionFromTripActual } from '@/lib/integrations/financas'
import { useUserPlan } from '@/hooks/use-user-plan'
import { formatMoney, formatMoneyWithBrl } from '@/lib/currency'
import { ExpDetailMobile } from '@/components/experiencias/mobile/ExpDetailMobile'
import {
  useTripDetail, useUpdateTrip, useDeleteTrip,
  useAddAccommodation, useDeleteAccommodation,
  useAddTransport, useDeleteTransport,
  useAddItineraryItem, useDeleteItineraryItem,
  useReorderItineraryDay,
  useUpdateBudgetItem,
  useToggleChecklistItem, useAddChecklistItem, useDeleteChecklistItem,
  TRIP_STATUS_LABELS, TRIP_STATUS_COLORS,
  TRIP_TYPE_LABELS,
  calcTripDays,
  type TripStatus,
} from '@/hooks/use-experiencias'
import { TripOverviewTab } from '@/components/experiencias/trip-detail/TripOverviewTab'
import { TripItineraryTab } from '@/components/experiencias/trip-detail/TripItineraryTab'
import { TripBudgetTab } from '@/components/experiencias/trip-detail/TripBudgetTab'
import { TripChecklistTab } from '@/components/experiencias/trip-detail/TripChecklistTab'
import { TripAccommodationTab } from '@/components/experiencias/trip-detail/TripAccommodationTab'
import { TripTransportsTab } from '@/components/experiencias/trip-detail/TripTransportsTab'

type Tab = 'overview' | 'itinerary' | 'budget' | 'checklist' | 'transports' | 'accommodation' | 'ai'

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const { isPro } = useUserPlan()

  const {
    trip, accommodations, transports, itinerary, budget, checklist,
    loading, error, reload,
  } = useTripDetail(tripId)

  const updateTrip = useUpdateTrip()
  const deleteTrip = useDeleteTrip()
  const addAccommodation = useAddAccommodation()
  const deleteAccommodation = useDeleteAccommodation()
  const addTransport = useAddTransport()
  const deleteTransport = useDeleteTransport()
  const addItineraryItem = useAddItineraryItem()
  const deleteItineraryItem = useDeleteItineraryItem()
  const reorderItineraryDay = useReorderItineraryDay()
  const updateBudgetItem = useUpdateBudgetItem()
  const toggleChecklistItem = useToggleChecklistItem()
  const addChecklistItem = useAddChecklistItem()
  const deleteChecklistItemHook = useDeleteChecklistItem()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [passportExpiry, setPassportExpiry] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(`synclife:trip:${tripId}:passport-expiry`)
    setPassportExpiry(stored ?? '')
  }, [tripId])

  if (loading) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error?.includes('does not exist') ? 'Execute a migration 006 no Supabase.' : error ?? 'Viagem não encontrada'}
          </p>
        </div>
      </div>
    )
  }

  // ─── Derived data ──────────────────────────────────────────────────────────
  const days = calcTripDays(trip.start_date, trip.end_date)
  const statusColor = TRIP_STATUS_COLORS[trip.status]
  const totalEstimated = budget.reduce((s, b) => s + b.estimated_amount, 0)
  const totalActual = budget.reduce((s, b) => s + b.actual_amount, 0)
  const tripEndDate = new Date(trip.end_date + 'T12:00:00')
  const passportExpiryDate = passportExpiry ? new Date(passportExpiry + 'T12:00:00') : null
  const passportLimitDate = new Date(tripEndDate)
  passportLimitDate.setMonth(passportLimitDate.getMonth() + 6)
  const passportRisk = passportExpiryDate
    ? passportExpiryDate < tripEndDate
      ? 'before_trip'
      : passportExpiryDate <= passportLimitDate
        ? 'within_6_months'
        : 'ok'
    : null
  const shouldShowPassportCard = trip.currency !== 'BRL' || trip.destinations.length > 1
  const checklistDone = checklist.filter(c => c.is_completed).length
  const checklistPct = checklist.length > 0 ? (checklistDone / checklist.length) * 100 : 0

  const itineraryByDay = itinerary.reduce<Record<string, typeof itinerary>>((acc, item) => {
    const day = item.day_date
    acc[day] = [...(acc[day] ?? []), item]
    return acc
  }, {})

  const tripDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(trip.start_date + 'T12:00:00')
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const formatTripAmount = (value: number) => formatMoneyWithBrl(value, trip.currency)
  const formatTripAmountCompact = (value: number) => formatMoney(value, trip.currency)

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleStatusChange(newStatus: TripStatus) {
    if (!trip) return
    if (newStatus === 'cancelled') {
      const hasItems = accommodations.length + transports.length + itinerary.length + checklist.length
      const warning = hasItems > 0 ? ` Esta viagem tem ${hasItems} item(ns) vinculado(s) que permanecerão no histórico.` : ''
      if (!confirm(`Cancelar "${trip.name}"?${warning} Esta ação poderá ser revertida alterando o status.`)) return
    }
    try {
      await updateTrip(trip.id, { status: newStatus })
      if (newStatus === 'completed' && totalActual > 0) {
        toast.success('Viagem concluída!', {
          action: {
            label: 'Registrar gasto em Finanças',
            onClick: async () => {
              await createTransactionFromTripActual({
                tripName: trip.name,
                actualSpent: totalActual,
                completionDate: trip.end_date,
              }).catch(() => {})
              toast.success('Gasto registrado em Finanças!')
            },
          },
          duration: 10000,
        })
      } else {
        toast.success('Status atualizado')
      }
      await reload()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  async function handleDeleteTrip() {
    if (!trip) return
    if (!confirm('Remover esta viagem? Todos os dados serão apagados permanentemente.')) return
    try {
      await deleteTrip(trip.id)
      toast.success('Viagem removida')
      router.push('/experiencias/viagens')
    } catch {
      toast.error('Erro ao remover viagem')
    }
  }

  function savePassportExpiry(value: string) {
    setPassportExpiry(value)
    if (typeof window === 'undefined') return
    const key = `synclife:trip:${tripId}:passport-expiry`
    if (value) {
      window.localStorage.setItem(key, value)
    } else {
      window.localStorage.removeItem(key)
    }
  }

  async function handleToggleChecklist(id: string, current: boolean) {
    try {
      await toggleChecklistItem(id, !current)
      await reload()
    } catch {
      toast.error('Erro ao atualizar checklist')
    }
  }

  // ─── Tabs config ───────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: '📊 Visão geral' },
    { id: 'itinerary', label: '🗺️ Roteiro', badge: itinerary.length },
    { id: 'budget', label: '💰 Orçamento' },
    { id: 'checklist', label: '✅ Checklist', badge: checklist.filter(c => !c.is_completed).length },
    { id: 'accommodation', label: '🏨 Hospedagem', badge: accommodations.length },
    { id: 'transports', label: '✈️ Transporte', badge: transports.length },
    { id: 'ai', label: '🤖 Assistente IA' },
  ]

  return (
    <>
    {/* Mobile */}
    <ExpDetailMobile trip={trip} checklistPct={Math.round(checklistPct)} />

    {/* Desktop */}
    <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={() => router.push('/experiencias/viagens')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Viagens
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-[Syne] font-extrabold text-xl truncate text-sl-grad">
            {trip.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-[var(--sl-t3)]">
              📍 {trip.destinations.join(' → ')}
            </span>
            <span className="text-[11px] text-[var(--sl-t3)]">·</span>
            <span className="text-[11px] text-[var(--sl-t3)]">{days} dias</span>
            <span className="text-[11px] text-[var(--sl-t3)]">·</span>
            <span className="text-[11px] text-[var(--sl-t3)]">{TRIP_TYPE_LABELS[trip.trip_type]}</span>
          </div>
        </div>
        <select
          value={trip.status}
          onChange={e => handleStatusChange(e.target.value as TripStatus)}
          className="px-3 py-1.5 rounded-[10px] text-[12px] font-bold border outline-none cursor-pointer"
          style={{
            borderColor: statusColor,
            color: statusColor,
            background: statusColor + '15',
          }}
        >
          {(Object.keys(TRIP_STATUS_LABELS) as TripStatus[]).map(s => (
            <option key={s} value={s}>{TRIP_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          onClick={handleDeleteTrip}
          className="p-2 rounded-[10px] border border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[#f43f5e] hover:text-[#f43f5e] transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-[#ec4899]/10 border border-[#ec4899] text-[var(--sl-t1)]'
                : 'border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-[#ec4899]/20 text-[#ec4899] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}

      {activeTab === 'overview' && (
        <TripOverviewTab
          trip={trip}
          itinerary={itinerary}
          budget={budget}
          checklist={checklist}
          days={days}
          tripDays={tripDays}
          totalEstimated={totalEstimated}
          totalActual={totalActual}
          checklistDone={checklistDone}
          checklistPct={checklistPct}
          shouldShowPassportCard={shouldShowPassportCard}
          passportExpiry={passportExpiry}
          passportRisk={passportRisk}
          passportLimitDate={passportLimitDate}
          formatTripAmount={formatTripAmount}
          formatTripAmountCompact={formatTripAmountCompact}
          savePassportExpiry={savePassportExpiry}
          handleToggleChecklist={handleToggleChecklist}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'itinerary' && (
        <TripItineraryTab
          trip={trip}
          itinerary={itinerary}
          itineraryByDay={itineraryByDay}
          tripDays={tripDays}
          isPro={isPro}
          formatTripAmountCompact={formatTripAmountCompact}
          deleteItineraryItem={deleteItineraryItem}
          addItineraryItem={addItineraryItem}
          reorderItineraryDay={reorderItineraryDay}
          reload={reload}
        />
      )}

      {activeTab === 'budget' && (
        <TripBudgetTab
          budget={budget}
          totalEstimated={totalEstimated}
          totalActual={totalActual}
          formatTripAmount={formatTripAmount}
          updateBudgetItem={updateBudgetItem}
          reload={reload}
        />
      )}

      {activeTab === 'checklist' && (
        <TripChecklistTab
          tripId={trip.id}
          checklist={checklist}
          checklistDone={checklistDone}
          checklistPct={checklistPct}
          toggleChecklistItem={toggleChecklistItem}
          addChecklistItem={addChecklistItem}
          deleteChecklistItem={deleteChecklistItemHook}
          reload={reload}
        />
      )}

      {activeTab === 'accommodation' && (
        <TripAccommodationTab
          trip={trip}
          accommodations={accommodations}
          formatTripAmountCompact={formatTripAmountCompact}
          addAccommodation={addAccommodation}
          deleteAccommodation={deleteAccommodation}
          reload={reload}
        />
      )}

      {activeTab === 'transports' && (
        <TripTransportsTab
          trip={trip}
          transports={transports}
          formatTripAmountCompact={formatTripAmountCompact}
          addTransport={addTransport}
          deleteTransport={deleteTransport}
          reload={reload}
        />
      )}

      {activeTab === 'ai' && (
        <TripAIChat tripId={tripId} trip={trip} itinerary={itinerary} onItineraryAdded={reload} />
      )}
    </div>
    </>
  )
}
