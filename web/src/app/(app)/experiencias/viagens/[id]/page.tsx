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
      <div className="max-w-[1160px] mx-auto px-10 py-9">
        <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9">
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

  const balance = totalEstimated - totalActual

  return (
    <>
    {/* Mobile */}
    <ExpDetailMobile trip={trip} checklistPct={Math.round(checklistPct)} />

    {/* Desktop */}
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Back link */}
      <div className="mb-5 sl-fade-up sl-delay-1">
        <button
          onClick={() => router.push('/experiencias/viagens')}
          className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t3)] hover:text-[var(--sl-t2)] transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          Voltar para viagens
        </button>
      </div>

      {/* Detail Hero Strip */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 pb-0 relative overflow-hidden sl-fade-up sl-delay-2">
        {/* Bottom gradient accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #ec4899)', opacity: 0.6 }}
        />

        {/* Top row: title + actions */}
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-[10px] mb-[6px]">
              <h1 className="font-[Syne] font-extrabold text-[24px]">{trip.name}</h1>
              <span
                className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                style={{
                  background: `${statusColor}14`,
                  color: statusColor,
                }}
              >
                {TRIP_STATUS_LABELS[trip.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-[var(--sl-t2)]">
              <span>{trip.destinations.join(' \u2192 ')}</span>
              <span className="text-[var(--sl-t3)]">{'\u00B7'}</span>
              <span>{new Date(trip.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')} {'\u2014'} {new Date(trip.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}</span>
              <span className="text-[var(--sl-t3)]">{'\u00B7'}</span>
              <span>{days} dias</span>
              <span className="text-[var(--sl-t3)]">{'\u00B7'}</span>
              <span>{trip.travelers_count} viajante{trip.travelers_count > 1 ? 's' : ''}</span>
              <span className="text-[var(--sl-t3)]">{'\u00B7'}</span>
              <span>{TRIP_TYPE_LABELS[trip.trip_type]}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              value={trip.status}
              onChange={e => handleStatusChange(e.target.value as TripStatus)}
              className="px-[14px] py-2 rounded-[10px] text-[12px] font-bold border outline-none cursor-pointer bg-transparent"
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
              className="w-[36px] h-[36px] rounded-[10px] border border-[var(--sl-border)] flex items-center justify-center text-[#f43f5e] hover:border-[#f43f5e] transition-colors bg-transparent cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Metrics strip inside hero */}
        <div className="flex items-center gap-0 mt-5 pt-4 border-t border-[var(--sl-border)] pb-6">
          <div className="flex-1 text-center">
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">Orcamento</div>
            <div className="font-[DM_Mono] text-[20px] font-medium text-[var(--sl-t1)]">
              {formatTripAmount(totalEstimated)}
            </div>
          </div>
          <div className="w-px h-[36px] bg-[var(--sl-border)]" />
          <div className="flex-1 text-center">
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">Gasto</div>
            <div className="font-[DM_Mono] text-[20px] font-medium text-[#ec4899]">
              {formatTripAmount(totalActual)}
            </div>
          </div>
          <div className="w-px h-[36px] bg-[var(--sl-border)]" />
          <div className="flex-1 text-center">
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">Saldo</div>
            <div className="font-[DM_Mono] text-[20px] font-medium text-[#10b981]">
              {formatTripAmount(balance)}
            </div>
          </div>
          <div className="w-px h-[36px] bg-[var(--sl-border)]" />
          <div className="flex-1 text-center">
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">Atividades</div>
            <div className="font-[DM_Mono] text-[20px] font-medium text-[var(--sl-t1)]">
              {itinerary.length}
            </div>
          </div>
          <div className="w-px h-[36px] bg-[var(--sl-border)]" />
          <div className="flex-1 text-center">
            <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-1">Checklist</div>
            <div className="font-[DM_Mono] text-[20px] font-medium text-[#10b981]">
              {Math.round(checklistPct)}%
            </div>
          </div>
        </div>
      </div>

      {/* Underline Tabs */}
      <div className="flex gap-0 border-b border-[var(--sl-border)] my-6 sl-fade-up sl-delay-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-[6px] px-5 py-3 text-[12.5px] font-semibold border-b-2 bg-transparent cursor-pointer transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'text-[var(--sl-t1)] border-b-[#ec4899]'
                : 'text-[var(--sl-t3)] border-b-transparent hover:text-[var(--sl-t2)]'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="text-[10px] px-[7px] py-[2px] rounded-[6px] bg-[var(--sl-s3)] text-[var(--sl-t2)]">
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
