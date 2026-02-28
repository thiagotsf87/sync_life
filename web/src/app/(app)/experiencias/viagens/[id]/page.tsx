'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react'
import { TripAIChat } from '@/components/experiencias/TripAIChat'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import { createTransactionFromTripActual } from '@/lib/integrations/financas'
import {
  useTripDetail, useUpdateTrip, useDeleteTrip,
  useAddAccommodation, useDeleteAccommodation,
  useAddTransport, useDeleteTransport,
  useAddItineraryItem, useDeleteItineraryItem,
  useUpdateBudgetItem,
  useToggleChecklistItem, useAddChecklistItem, useDeleteChecklistItem,
  TRIP_STATUS_LABELS, TRIP_STATUS_COLORS,
  TRIP_TYPE_LABELS,
  TRANSPORT_TYPE_LABELS,
  BUDGET_CATEGORY_LABELS,
  ITINERARY_CATEGORY_LABELS,
  CHECKLIST_CATEGORY_LABELS,
  calcTripDays, calcTripProgress,
  type TripStatus, type TransportType, type ItineraryCategory,
  type ChecklistCategory, type BookingStatus,
} from '@/hooks/use-experiencias'

type Tab = 'overview' | 'itinerary' | 'budget' | 'checklist' | 'transports' | 'accommodation' | 'ai'

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

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
  const updateBudgetItem = useUpdateBudgetItem()
  const toggleChecklistItem = useToggleChecklistItem()
  const addChecklistItem = useAddChecklistItem()
  const deleteChecklistItemHook = useDeleteChecklistItem()

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Modals
  const [showAccomModal, setShowAccomModal] = useState(false)
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [showItineraryModal, setShowItineraryModal] = useState(false)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Accommodation form
  const [accomForm, setAccomForm] = useState({
    name: '', address: '', check_in: '', check_out: '',
    cost_per_night: '', booking_status: 'estimated' as BookingStatus,
    confirmation_code: '', notes: '',
  })

  // Transport form
  const [transportForm, setTransportForm] = useState({
    type: 'flight' as TransportType,
    origin: '', destination: '',
    departure_datetime: '', arrival_datetime: '',
    company: '', cost: '',
    booking_status: 'estimated' as BookingStatus,
    confirmation_code: '',
  })

  // Itinerary form
  const [itiForm, setItiForm] = useState({
    day_date: trip?.start_date ?? '',
    title: '',
    category: 'sightseeing' as ItineraryCategory,
    address: '',
    estimated_time: '',
    estimated_cost: '',
    notes: '',
  })

  // Checklist new item
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newChecklistCategory, setNewChecklistCategory] = useState<ChecklistCategory>('other')

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

  const days = calcTripDays(trip.start_date, trip.end_date)
  const statusColor = TRIP_STATUS_COLORS[trip.status]
  const budgetProgress = calcTripProgress(trip, budget)
  const totalEstimated = budget.reduce((s, b) => s + b.estimated_amount, 0)
  const totalActual = budget.reduce((s, b) => s + b.actual_amount, 0)
  const checklistDone = checklist.filter(c => c.is_completed).length
  const checklistPct = checklist.length > 0 ? (checklistDone / checklist.length) * 100 : 0

  // Group itinerary by day
  const itineraryByDay = itinerary.reduce<Record<string, typeof itinerary>>((acc, item) => {
    const day = item.day_date
    acc[day] = [...(acc[day] ?? []), item]
    return acc
  }, {})

  // Available days for itinerary
  const tripDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(trip.start_date + 'T12:00:00')
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  async function handleStatusChange(newStatus: TripStatus) {
    if (!trip) return

    // RN-EXP-32: confirmação ao cancelar viagem
    if (newStatus === 'cancelled') {
      const hasItems = accommodations.length + transports.length + itinerary.length + checklist.length
      const warning = hasItems > 0 ? ` Esta viagem tem ${hasItems} item(ns) vinculado(s) que permanecerão no histórico.` : ''
      if (!confirm(`Cancelar "${trip.name}"?${warning} Esta ação poderá ser revertida alterando o status.`)) return
    }

    try {
      await updateTrip(trip.id, { status: newStatus })

      // RN-EXP-20: viagem concluída com gastos → oferecer registro em Finanças
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

  async function handleSaveAccommodation() {
    if (!trip) return
    if (!accomForm.name || !accomForm.check_in || !accomForm.check_out) {
      toast.error('Preencha nome e datas')
      return
    }
    setIsSaving(true)
    try {
      const nights = Math.max(1, Math.ceil((new Date(accomForm.check_out).getTime() - new Date(accomForm.check_in).getTime()) / (1000 * 60 * 60 * 24)))
      const costPerNight = accomForm.cost_per_night ? parseFloat(accomForm.cost_per_night) : null
      await addAccommodation({
        trip_id: trip.id,
        name: accomForm.name,
        address: accomForm.address || null,
        check_in: accomForm.check_in,
        check_out: accomForm.check_out,
        cost_per_night: costPerNight,
        total_cost: costPerNight != null ? costPerNight * nights : null,
        currency: trip.currency,
        booking_status: accomForm.booking_status,
        confirmation_code: accomForm.confirmation_code || null,
        notes: accomForm.notes || null,
      })
      toast.success('Hospedagem adicionada')
      setShowAccomModal(false)
      setAccomForm({ name: '', address: '', check_in: '', check_out: '', cost_per_night: '', booking_status: 'estimated', confirmation_code: '', notes: '' })
      await reload()
    } catch {
      toast.error('Erro ao adicionar hospedagem')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveTransport() {
    if (!trip) return
    if (!transportForm.origin || !transportForm.destination) {
      toast.error('Preencha origem e destino')
      return
    }
    setIsSaving(true)
    try {
      await addTransport({
        trip_id: trip.id,
        type: transportForm.type,
        origin: transportForm.origin || null,
        destination: transportForm.destination || null,
        departure_datetime: transportForm.departure_datetime || null,
        arrival_datetime: transportForm.arrival_datetime || null,
        company: transportForm.company || null,
        cost: transportForm.cost ? parseFloat(transportForm.cost) : null,
        currency: trip.currency,
        booking_status: transportForm.booking_status,
        confirmation_code: transportForm.confirmation_code || null,
        notes: null,
      })
      toast.success('Transporte adicionado')
      setShowTransportModal(false)
      setTransportForm({ type: 'flight', origin: '', destination: '', departure_datetime: '', arrival_datetime: '', company: '', cost: '', booking_status: 'estimated', confirmation_code: '' })
      await reload()
    } catch {
      toast.error('Erro ao adicionar transporte')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveItinerary() {
    if (!trip) return
    if (!itiForm.title || !itiForm.day_date) {
      toast.error('Preencha título e data')
      return
    }
    setIsSaving(true)
    try {
      const dayItems = itineraryByDay[itiForm.day_date] ?? []
      await addItineraryItem({
        trip_id: trip.id,
        day_date: itiForm.day_date,
        sort_order: dayItems.length,
        title: itiForm.title,
        category: itiForm.category,
        address: itiForm.address || null,
        estimated_time: itiForm.estimated_time || null,
        estimated_cost: itiForm.estimated_cost ? parseFloat(itiForm.estimated_cost) : null,
        currency: trip.currency,
        notes: itiForm.notes || null,
      })
      toast.success('Atividade adicionada')
      setShowItineraryModal(false)
      setItiForm({ day_date: trip.start_date, title: '', category: 'sightseeing', address: '', estimated_time: '', estimated_cost: '', notes: '' })
      await reload()
    } catch {
      toast.error('Erro ao adicionar atividade')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateBudget(id: string, field: 'estimated_amount' | 'actual_amount', value: string) {
    try {
      await updateBudgetItem(id, { [field]: parseFloat(value) || 0 })
      await reload()
    } catch {
      toast.error('Erro ao atualizar orçamento')
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

  async function handleAddChecklistItem() {
    if (!trip || !newChecklistTitle.trim()) return
    try {
      await addChecklistItem(trip.id, newChecklistTitle.trim(), newChecklistCategory)
      setNewChecklistTitle('')
      toast.success('Item adicionado')
      await reload()
    } catch {
      toast.error('Erro ao adicionar item')
    }
  }

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
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

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
          <h1 className={cn(
            'font-[Syne] font-extrabold text-xl truncate',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
          )}>
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
        {/* Status selector */}
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
                ? 'bg-[#06b6d4]/10 border border-[#06b6d4] text-[var(--sl-t1)]'
                : 'border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-[#06b6d4]/20 text-[#06b6d4] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-[1fr_280px] gap-4 max-lg:grid-cols-1">
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Orçamento</p>
                <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">
                  {totalEstimated > 0 ? totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                </p>
                {totalActual > 0 && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{totalActual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} gastos</p>}
              </div>
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Atividades</p>
                <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">{itinerary.length}</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">em {tripDays.length} dias</p>
              </div>
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Checklist</p>
                <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">{checklistDone}/{checklist.length}</p>
                <div className="w-full bg-[var(--sl-s3)] rounded-full mt-1 overflow-hidden" style={{ height: '3px' }}>
                  <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${checklistPct}%` }} />
                </div>
              </div>
            </div>

            {/* Dates timeline */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">📅 Timeline</h3>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-[var(--sl-t3)]">Ida</p>
                  <p className="font-[DM_Mono] text-[12px] text-[#06b6d4] font-bold">
                    {new Date(trip.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex-1 h-0.5 bg-[#06b6d4]/30 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-[var(--sl-s1)] px-2 text-[10px] text-[var(--sl-t3)]">{days} dias</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[var(--sl-t3)]">Volta</p>
                  <p className="font-[DM_Mono] text-[12px] text-[#06b6d4] font-bold">
                    {new Date(trip.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {trip.notes && (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
                <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-2">📝 Notas</h3>
                <p className="text-[13px] text-[var(--sl-t2)] whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}

            {/* RN-EXP-19: Resumo pós-viagem quando concluída */}
            {trip.status === 'completed' && (
              <div className="bg-gradient-to-br from-[#06b6d4]/10 to-[#10b981]/10 border border-[#06b6d4]/30 rounded-2xl p-5">
                <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🏆 Resumo da Viagem</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Duração</p>
                    <p className="font-[DM_Mono] text-[15px] font-bold text-[#06b6d4]">{days} dias</p>
                  </div>
                  <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Gasto Total</p>
                    <p className="font-[DM_Mono] text-[15px] font-bold text-[var(--sl-t1)]">
                      {totalActual > 0
                        ? totalActual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </p>
                  </div>
                  <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Atividades</p>
                    <p className="font-[DM_Mono] text-[15px] font-bold text-[var(--sl-t1)]">{itinerary.length}</p>
                  </div>
                  <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Checklist</p>
                    <p className="font-[DM_Mono] text-[15px] font-bold text-[#10b981]">{Math.round(checklistPct)}%</p>
                  </div>
                </div>
                {totalEstimated > 0 && totalActual > 0 && (
                  <div className="mt-3 p-3 bg-[var(--sl-s1)] rounded-xl">
                    <p className="text-[11px] text-[var(--sl-t2)]">
                      {totalActual <= totalEstimated
                        ? `✅ Ficou ${(totalEstimated - totalActual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} abaixo do orçamento!`
                        : `⚠️ Excedeu o orçamento em ${(totalActual - totalEstimated).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side */}
          <div className="flex flex-col gap-3">
            {/* Budget progress */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">💰 Orçamento</h3>
              {budget.filter(b => b.estimated_amount > 0 || b.actual_amount > 0).map(b => {
                const pct = b.estimated_amount > 0 ? (b.actual_amount / b.estimated_amount) * 100 : 0
                return (
                  <div key={b.id} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] text-[var(--sl-t3)]">{BUDGET_CATEGORY_LABELS[b.category]}</span>
                      <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t2)]">
                        {b.actual_amount > 0 ? `${b.actual_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / ` : ''}
                        {b.estimated_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    {b.estimated_amount > 0 && (
                      <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '3px' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct > 100 ? '#f43f5e' : pct > 85 ? '#f59e0b' : '#06b6d4',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
              {budget.every(b => b.estimated_amount === 0) && (
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-[12px] text-[#06b6d4] hover:opacity-80"
                >
                  Definir orçamento →
                </button>
              )}
            </div>

            {/* Quick checklist */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✅ Checklist</h3>
                <span className="text-[11px] text-[var(--sl-t3)]">{checklistDone}/{checklist.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {checklist.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleToggleChecklist(item.id, item.is_completed)}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all',
                      item.is_completed ? 'bg-[#10b981] border-[#10b981]' : 'border-[var(--sl-border)]'
                    )}>
                      {item.is_completed && <Check size={10} className="text-[#03071a]" />}
                    </div>
                    <span className={cn(
                      'text-[11px] transition-colors',
                      item.is_completed ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t2)]'
                    )}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
              {checklist.length > 5 && (
                <button onClick={() => setActiveTab('checklist')} className="text-[11px] text-[#06b6d4] mt-2 hover:opacity-80">
                  Ver todos ({checklist.length}) →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ITINERARY */}
      {activeTab === 'itinerary' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🗺️ Roteiro dia a dia</h2>
            <button
              onClick={() => { setItiForm(f => ({ ...f, day_date: trip.start_date })); setShowItineraryModal(true) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/20"
            >
              <Plus size={13} />
              Atividade
            </button>
          </div>

          {tripDays.map(day => {
            const dayItems = itineraryByDay[day] ?? []
            const dayDate = new Date(day + 'T12:00:00')
            const dayLabel = dayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
            const dayCost = dayItems.reduce((s, i) => s + (i.estimated_cost ?? 0), 0)

            return (
              <div key={day} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[11px] font-bold text-[#06b6d4] capitalize">{dayLabel}</div>
                  {dayCost > 0 && (
                    <span className="text-[10px] text-[var(--sl-t3)]">
                      · {dayCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  <button
                    onClick={() => { setItiForm(f => ({ ...f, day_date: day })); setShowItineraryModal(true) }}
                    className="ml-auto text-[10px] text-[#06b6d4] hover:opacity-80"
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
                      <div key={item.id} className="flex items-start gap-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl p-3">
                        <div className="w-6 h-6 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-[#06b6d4] font-bold">{idx + 1}</span>
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
                              {item.estimated_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          )}
                        </div>
                        <button onClick={async () => { await deleteItineraryItem(item.id); await reload() }}
                          className="p-1 rounded hover:bg-[rgba(244,63,94,0.1)] transition-colors shrink-0">
                          <Trash2 size={11} className="text-[var(--sl-t3)]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* BUDGET */}
      {activeTab === 'budget' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Estimado</p>
              <p className="font-[DM_Mono] text-xl text-[var(--sl-t1)]">{totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Gasto</p>
              <p className="font-[DM_Mono] text-xl" style={{ color: totalActual > totalEstimated ? '#f43f5e' : '#10b981' }}>
                {totalActual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Saldo</p>
              <p className="font-[DM_Mono] text-xl" style={{ color: totalEstimated - totalActual >= 0 ? '#06b6d4' : '#f43f5e' }}>
                {(totalEstimated - totalActual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">Por categoria</h3>
            <div className="flex flex-col gap-4">
              {budget.map(b => (
                <div key={b.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] text-[var(--sl-t2)] flex-1">{BUDGET_CATEGORY_LABELS[b.category]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider block mb-1">Estimado</label>
                      <input
                        type="number"
                        step="50"
                        defaultValue={b.estimated_amount}
                        onBlur={e => handleUpdateBudget(b.id, 'estimated_amount', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-[8px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider block mb-1">Gasto real</label>
                      <input
                        type="number"
                        step="10"
                        defaultValue={b.actual_amount}
                        onBlur={e => handleUpdateBudget(b.id, 'actual_amount', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-[8px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                      />
                    </div>
                  </div>
                  {b.estimated_amount > 0 && (
                    <div className="w-full bg-[var(--sl-s3)] rounded-full mt-2 overflow-hidden" style={{ height: '3px' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((b.actual_amount / b.estimated_amount) * 100, 100)}%`,
                          background: b.actual_amount > b.estimated_amount ? '#f43f5e' : '#06b6d4',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[var(--sl-t2)]">
              {checklistDone} de {checklist.length} itens concluídos ({checklistPct.toFixed(0)}%)
            </p>
          </div>

          {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(cat => {
            const catItems = checklist.filter(c => c.category === cat)
            if (catItems.length === 0) return null
            return (
              <div key={cat} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
                <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-3">{CHECKLIST_CATEGORY_LABELS[cat]}</h3>
                <div className="flex flex-col gap-2">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleToggleChecklist(item.id, item.is_completed)}
                        className={cn(
                          'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                          item.is_completed ? 'bg-[#10b981] border-[#10b981]' : 'border-[var(--sl-border)] hover:border-[#10b981]'
                        )}
                      >
                        {item.is_completed && <Check size={11} className="text-[#03071a]" />}
                      </button>
                      <span className={cn(
                        'flex-1 text-[12px] transition-colors',
                        item.is_completed ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t2)]'
                      )}>
                        {item.title}
                      </span>
                      <button
                        onClick={async () => { await deleteChecklistItemHook(item.id); await reload() }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(244,63,94,0.1)]"
                      >
                        <Trash2 size={11} className="text-[var(--sl-t3)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Add item */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-3">+ Adicionar item</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={e => setNewChecklistTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddChecklistItem() }}
                placeholder="Novo item..."
                className="flex-1 px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
              />
              <select
                value={newChecklistCategory}
                onChange={e => setNewChecklistCategory(e.target.value as ChecklistCategory)}
                className="px-2 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
              >
                {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(c => (
                  <option key={c} value={c}>{CHECKLIST_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <button onClick={handleAddChecklistItem}
                className="p-2 rounded-[10px] bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/20">
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOMMODATION */}
      {activeTab === 'accommodation' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏨 Hospedagens</h2>
            <button onClick={() => setShowAccomModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/20">
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
                        <span className="font-[DM_Mono] text-[12px] text-[#06b6d4]">
                          {a.total_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
        </div>
      )}

      {/* TRANSPORTS */}
      {activeTab === 'transports' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✈️ Transportes</h2>
            <button onClick={() => setShowTransportModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-[12px] font-medium bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/20">
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
                        <span className="font-[DM_Mono] text-[12px] text-[#06b6d4]">
                          {t.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
        </div>
      )}

      {/* AI CHAT */}
      {activeTab === 'ai' && (
        <TripAIChat tripId={tripId} trip={trip} />
      )}

      {/* ── MODALS ── */}

      {/* Accommodation modal */}
      {showAccomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAccomModal(false) }}>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">🏨 Adicionar Hospedagem</h2>
              <button onClick={() => setShowAccomModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome*</label>
                <input type="text" value={accomForm.name} onChange={e => setAccomForm(f => ({ ...f, name: e.target.value }))} placeholder="Hotel, Airbnb, Pousada..." className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Endereço</label>
                <input type="text" value={accomForm.address} onChange={e => setAccomForm(f => ({ ...f, address: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Check-in*</label>
                  <input type="date" value={accomForm.check_in} min={trip.start_date} max={trip.end_date} onChange={e => setAccomForm(f => ({ ...f, check_in: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Check-out*</label>
                  <input type="date" value={accomForm.check_out} min={accomForm.check_in || trip.start_date} max={trip.end_date} onChange={e => setAccomForm(f => ({ ...f, check_out: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo por noite</label>
                  <input type="number" step="10" value={accomForm.cost_per_night} onChange={e => setAccomForm(f => ({ ...f, cost_per_night: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Status</label>
                  <select value={accomForm.booking_status} onChange={e => setAccomForm(f => ({ ...f, booking_status: e.target.value as BookingStatus }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]">
                    <option value="estimated">Estimado</option>
                    <option value="reserved">Reservado</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Código de confirmação</label>
                <input type="text" value={accomForm.confirmation_code} onChange={e => setAccomForm(f => ({ ...f, confirmation_code: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAccomModal(false)} className="flex-1 py-2.5 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-t2)]">Cancelar</button>
                <button onClick={handleSaveAccommodation} disabled={isSaving} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Adicionar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transport modal */}
      {showTransportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowTransportModal(false) }}>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">✈️ Adicionar Transporte</h2>
              <button onClick={() => setShowTransportModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Tipo</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(TRANSPORT_TYPE_LABELS) as TransportType[]).map(t => (
                    <button key={t} onClick={() => setTransportForm(f => ({ ...f, type: t }))}
                      className={cn('py-1.5 rounded-[8px] border text-[9px] text-center transition-all', transportForm.type === t ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t3)]')}>
                      {TRANSPORT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Origem*</label>
                  <input type="text" value={transportForm.origin} onChange={e => setTransportForm(f => ({ ...f, origin: e.target.value }))} placeholder="Ex: São Paulo (GRU)" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Destino*</label>
                  <input type="text" value={transportForm.destination} onChange={e => setTransportForm(f => ({ ...f, destination: e.target.value }))} placeholder="Ex: Lisboa (LIS)" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Saída</label>
                  <input type="datetime-local" value={transportForm.departure_datetime} onChange={e => setTransportForm(f => ({ ...f, departure_datetime: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Chegada</label>
                  <input type="datetime-local" value={transportForm.arrival_datetime} onChange={e => setTransportForm(f => ({ ...f, arrival_datetime: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Empresa</label>
                  <input type="text" value={transportForm.company} onChange={e => setTransportForm(f => ({ ...f, company: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo</label>
                  <input type="number" step="10" value={transportForm.cost} onChange={e => setTransportForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Status</label>
                  <select value={transportForm.booking_status} onChange={e => setTransportForm(f => ({ ...f, booking_status: e.target.value as BookingStatus }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]">
                    <option value="estimated">Estimado</option>
                    <option value="reserved">Reservado</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Confirmação</label>
                <input type="text" value={transportForm.confirmation_code} onChange={e => setTransportForm(f => ({ ...f, confirmation_code: e.target.value }))} placeholder="Código de reserva" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowTransportModal(false)} className="flex-1 py-2.5 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-t2)]">Cancelar</button>
                <button onClick={handleSaveTransport} disabled={isSaving} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Adicionar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary modal */}
      {showItineraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowItineraryModal(false) }}>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">📍 Adicionar Atividade</h2>
              <button onClick={() => setShowItineraryModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Dia*</label>
                  <select value={itiForm.day_date} onChange={e => setItiForm(f => ({ ...f, day_date: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]">
                    {tripDays.map(d => (
                      <option key={d} value={d}>
                        {new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Horário</label>
                  <input type="time" value={itiForm.estimated_time} onChange={e => setItiForm(f => ({ ...f, estimated_time: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Título*</label>
                <input type="text" value={itiForm.title} onChange={e => setItiForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Torre Eiffel, Museu do Louvre..." className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Categoria</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(ITINERARY_CATEGORY_LABELS) as ItineraryCategory[]).map(c => (
                    <button key={c} onClick={() => setItiForm(f => ({ ...f, category: c }))}
                      className={cn('py-1.5 rounded-[8px] border text-[9px] text-center transition-all', itiForm.category === c ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t3)]')}>
                      {ITINERARY_CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Endereço</label>
                <input type="text" value={itiForm.address} onChange={e => setItiForm(f => ({ ...f, address: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo estimado</label>
                <input type="number" step="10" value={itiForm.estimated_cost} onChange={e => setItiForm(f => ({ ...f, estimated_cost: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas</label>
                <input type="text" value={itiForm.notes} onChange={e => setItiForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowItineraryModal(false)} className="flex-1 py-2.5 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-t2)]">Cancelar</button>
                <button onClick={handleSaveItinerary} disabled={isSaving} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Adicionar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
