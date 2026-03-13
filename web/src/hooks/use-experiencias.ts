'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { syncTripBudgetToFuturo, unlinkGoalsFromDeletedEntity } from '@/lib/integrations/futuro'
import { addXP } from '@/hooks/use-xp'
import { onTripCreated } from '@/lib/cross-module'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'reserved' | 'ongoing' | 'completed' | 'cancelled'
export type TripType = 'leisure' | 'work' | 'study' | 'mixed'
export type BookingStatus = 'estimated' | 'reserved' | 'paid'
export type ItineraryCategory =
  | 'sightseeing' | 'restaurant' | 'museum' | 'beach'
  | 'shopping' | 'transport' | 'rest' | 'other'
export type BudgetCategory =
  | 'accommodation' | 'air_transport' | 'ground_transport'
  | 'food' | 'tickets' | 'shopping' | 'insurance' | 'documents' | 'other'
export type ChecklistCategory = 'documents' | 'luggage' | 'before_trip' | 'other'
export type TransportType =
  | 'flight' | 'train' | 'bus' | 'car_rental' | 'taxi' | 'transfer' | 'other'

export interface Trip {
  id: string
  user_id: string
  name: string
  destinations: string[]
  trip_type: TripType
  start_date: string
  end_date: string
  travelers_count: number
  total_budget: number | null
  total_spent: number
  currency: string
  status: TripStatus
  notes: string | null
  objective_id: string | null
  created_at: string
  updated_at: string
}

export interface TripAccommodation {
  id: string
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
  created_at: string
}

export interface TripTransport {
  id: string
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
  notes: string | null
  created_at: string
}

export interface TripItineraryItem {
  id: string
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
  created_at: string
}

export interface TripBudgetItem {
  id: string
  trip_id: string
  category: BudgetCategory
  estimated_amount: number
  actual_amount: number
  currency: string
  created_at: string
}

export interface TripChecklistItem {
  id: string
  trip_id: string
  title: string
  category: ChecklistCategory
  is_completed: boolean
  sort_order: number | null
  created_at: string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  planning: 'Planejando',
  reserved: 'Reservado',
  ongoing: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  planning: '#f59e0b',
  reserved: '#0055ff',
  ongoing: '#10b981',
  completed: '#6e90b8',
  cancelled: '#f43f5e',
}

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  leisure: '🏖️ Lazer',
  work: '💼 Trabalho',
  study: '📚 Estudo',
  mixed: '🔀 Mista',
}

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  flight: '✈️ Voo',
  train: '🚆 Trem',
  bus: '🚌 Ônibus',
  car_rental: '🚗 Aluguel',
  taxi: '🚕 Táxi/App',
  transfer: '🚐 Transfer',
  other: '🚀 Outro',
}

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  accommodation: '🏨 Hospedagem',
  air_transport: '✈️ Aéreo',
  ground_transport: '🚗 Terrestre',
  food: '🍽️ Alimentação',
  tickets: '🎟️ Ingressos',
  shopping: '🛍️ Compras',
  insurance: '🛡️ Seguro',
  documents: '📄 Documentação',
  other: '💰 Outros',
}

export const ITINERARY_CATEGORY_LABELS: Record<ItineraryCategory, string> = {
  sightseeing: '🏛️ Passeio',
  restaurant: '🍽️ Restaurante',
  museum: '🎨 Museu',
  beach: '🏖️ Praia',
  shopping: '🛍️ Compras',
  transport: '🚗 Transporte',
  rest: '😴 Descanso',
  other: '📌 Outro',
}

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  documents: '📄 Documentos',
  luggage: '🧳 Bagagem',
  before_trip: '✅ Antes de viajar',
  other: '📌 Outros',
}

// ─── Default checklist items ───────────────────────────────────────────────

export const DEFAULT_CHECKLIST_ITEMS: { title: string; category: ChecklistCategory }[] = [
  // Documents
  { title: 'Passaporte/RG válido', category: 'documents' },
  { title: 'Visto (se necessário)', category: 'documents' },
  { title: 'Seguro viagem', category: 'documents' },
  { title: 'Reserva de hotel impressa', category: 'documents' },
  { title: 'Passagens impressas', category: 'documents' },
  // Luggage
  { title: 'Roupas para o clima', category: 'luggage' },
  { title: 'Itens de higiene pessoal', category: 'luggage' },
  { title: 'Carregador e adaptador', category: 'luggage' },
  { title: 'Medicamentos essenciais', category: 'luggage' },
  { title: 'Cartão de crédito internacional', category: 'luggage' },
  // Before trip
  { title: 'Avisar banco sobre viagem', category: 'before_trip' },
  { title: 'Verificar roaming/chip internacional', category: 'before_trip' },
  { title: 'Deixar chave com alguém de confiança', category: 'before_trip' },
  { title: 'Checar restrições do destino', category: 'before_trip' },
]

// ─── Calculations ─────────────────────────────────────────────────────────────

export function calcTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

export function calcTripProgress(trip: Trip, budget: TripBudgetItem[]): number {
  const total = budget.reduce((s, b) => s + b.estimated_amount, 0)
  const spent = budget.reduce((s, b) => s + b.actual_amount, 0)
  if (total === 0) return 0
  return Math.min((spent / total) * 100, 100)
}

// ─── Trips hook ───────────────────────────────────────────────────────────────

export function useTrips(status?: TripStatus) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      let query = sb.from('trips').select('*').eq('user_id', user.id)
        .order('start_date', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (error) throw error
      setTrips(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar viagens')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])
  return { trips, loading, error, reload: load }
}

// ─── Single trip with details ──────────────────────────────────────────────

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [accommodations, setAccommodations] = useState<TripAccommodation[]>([])
  const [transports, setTransports] = useState<TripTransport[]>([])
  const [itinerary, setItinerary] = useState<TripItineraryItem[]>([])
  const [budget, setBudget] = useState<TripBudgetItem[]>([])
  const [checklist, setChecklist] = useState<TripChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripRes, accomRes, transRes, itiRes, budgetRes, checkRes] = await Promise.all([
        sb.from('trips').select('*').eq('id', tripId).single(),
        sb.from('trip_accommodations').select('*').eq('trip_id', tripId).order('check_in'),
        sb.from('trip_transports').select('*').eq('trip_id', tripId).order('departure_datetime'),
        sb.from('trip_itinerary_items').select('*').eq('trip_id', tripId).order('day_date').order('sort_order'),
        sb.from('trip_budget_items').select('*').eq('trip_id', tripId),
        sb.from('trip_checklist_items').select('*').eq('trip_id', tripId).order('sort_order'),
      ]) as [
        { data: Trip | null; error: unknown },
        { data: TripAccommodation[] | null; error: unknown },
        { data: TripTransport[] | null; error: unknown },
        { data: TripItineraryItem[] | null; error: unknown },
        { data: TripBudgetItem[] | null; error: unknown },
        { data: TripChecklistItem[] | null; error: unknown },
      ]

      if (tripRes.error) throw tripRes.error
      setTrip(tripRes.data)
      setAccommodations(accomRes.data ?? [])
      setTransports(transRes.data ?? [])
      setItinerary(itiRes.data ?? [])
      setBudget(budgetRes.data ?? [])
      setChecklist(checkRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar viagem')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => { load() }, [load])
  return { trip, accommodations, transports, itinerary, budget, checklist, loading, error, reload: load }
}

// ─── Dashboard hook ───────────────────────────────────────────────────────────

export function useExperienciasDashboard() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [checklistPct, setChecklistPct] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error } = await sb.from('trips')
        .select('*').eq('user_id', user.id)
        .not('status', 'eq', 'cancelled')
        .order('start_date', { ascending: true })
        .limit(10)
      if (error) throw error
      const tripList: Trip[] = data ?? []
      setTrips(tripList)

      // RN-EXP-28: % checklist das viagens ativas
      const activeIds = tripList
        .filter(t => !['completed', 'cancelled'].includes(t.status))
        .map(t => t.id)
      if (activeIds.length > 0) {
        const { data: checkItems } = await sb
          .from('trip_checklist_items')
          .select('is_completed')
          .in('trip_id', activeIds)
        if (checkItems && checkItems.length > 0) {
          const done = checkItems.filter((c: { is_completed: boolean }) => c.is_completed).length
          setChecklistPct(Math.round((done / checkItems.length) * 100))
        } else {
          setChecklistPct(null)
        }
      } else {
        setChecklistPct(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { trips, checklistPct, loading, error, reload: load }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateTripData {
  name: string
  destinations: string[]
  trip_type: TripType
  start_date: string
  end_date: string
  travelers_count: number
  total_budget?: number | null
  currency?: string
  notes?: string | null
  objective_id?: string | null
}

export function useCreateTrip() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: CreateTripData, checklistItems?: { title: string; category: ChecklistCategory }[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: trip, error } = await sb.from('trips').insert({
      user_id: user.id,
      name: data.name,
      destinations: data.destinations,
      trip_type: data.trip_type,
      start_date: data.start_date,
      end_date: data.end_date,
      travelers_count: data.travelers_count,
      total_budget: data.total_budget ?? null,
      currency: data.currency ?? 'BRL',
      status: 'planning',
      notes: data.notes ?? null,
      objective_id: data.objective_id ?? null,
    }).select().single()

    if (error) throw error

    // Create default checklist
    const items = checklistItems ?? DEFAULT_CHECKLIST_ITEMS
    if (items.length > 0) {
      await sb.from('trip_checklist_items').insert(
        items.map((item, i) => ({
          trip_id: trip.id,
          title: item.title,
          category: item.category,
          is_completed: false,
          sort_order: i,
        }))
      )
    }

    // Create default budget categories
    const budgetCategories: BudgetCategory[] = [
      'accommodation', 'air_transport', 'ground_transport',
      'food', 'tickets', 'shopping', 'other'
    ]
    await sb.from('trip_budget_items').insert(
      budgetCategories.map(cat => ({
        trip_id: trip.id,
        category: cat,
        estimated_amount: 0,
        actual_amount: 0,
        currency: data.currency ?? 'BRL',
      }))
    )

    // RN-EXP-04: viagem vinculada a objetivo do Futuro cria meta técnica sincronizada.
    if (data.objective_id) {
      await sb.from('objective_goals').insert({
        objective_id: data.objective_id,
        user_id: user.id,
        name: `Viagem: ${data.name}`,
        indicator_type: 'monetary',
        target_module: 'experiencias',
        target_value: Number(data.total_budget ?? 0),
        current_value: 0,
        progress: 0,
        weight: 1,
        priority: 1,
        auto_sync: true,
        linked_entity_type: 'trip_budget',
        linked_entity_id: trip.id,
        status: 'active',
      })
    }

    addXP(user.id, 'trip_created').catch(() => {})
    // Cross-module: viagem → eventos de partida/retorno em Tempo
    onTripCreated(user.id, data.name, data.start_date, data.end_date).catch(() => {})
    return trip as Trip
  }, [])
}

export function useUpdateTrip() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string, data: Partial<Omit<Trip, 'id' | 'user_id' | 'created_at'>>) => {
    const { error } = await sb.from('trips').update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) throw error
  }, [])
}

export function useDeleteTrip() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error } = await sb.from('trips').delete().eq('id', id)
    if (error) throw error

    await unlinkGoalsFromDeletedEntity(user.id, 'trip_budget', [id])
  }, [])
}

// ─── Accommodation mutations ───────────────────────────────────────────────

export function useAddAccommodation() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: Omit<TripAccommodation, 'id' | 'created_at'>) => {
    const { error } = await sb.from('trip_accommodations').insert(data)
    if (error) throw error
  }, [])
}

export function useDeleteAccommodation() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('trip_accommodations').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Transport mutations ───────────────────────────────────────────────────

export function useAddTransport() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: Omit<TripTransport, 'id' | 'created_at'>) => {
    const { error } = await sb.from('trip_transports').insert(data)
    if (error) throw error
  }, [])
}

export function useDeleteTransport() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('trip_transports').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Itinerary mutations ───────────────────────────────────────────────────

export function useAddItineraryItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: Omit<TripItineraryItem, 'id' | 'created_at'>) => {
    const { error } = await sb.from('trip_itinerary_items').insert(data)
    if (error) throw error
  }, [])
}

export function useDeleteItineraryItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('trip_itinerary_items').delete().eq('id', id)
    if (error) throw error
  }, [])
}

export function useReorderItineraryDay() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (tripId: string, dayDate: string, orderedIds: string[]) => {
    if (orderedIds.length === 0) return

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      const { error } = await sb.from('trip_itinerary_items').update({
        sort_order: i,
      }).eq('id', id).eq('trip_id', tripId).eq('day_date', dayDate)
      if (error) throw error
    }
  }, [])
}

// ─── Budget mutations ──────────────────────────────────────────────────────

export function useUpdateBudgetItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string, data: Partial<Pick<TripBudgetItem, 'estimated_amount' | 'actual_amount'>>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: budgetItem, error: budgetItemError } = await sb
      .from('trip_budget_items')
      .select('trip_id')
      .eq('id', id)
      .single()
    if (budgetItemError) throw budgetItemError

    const { error } = await sb.from('trip_budget_items').update(data).eq('id', id)
    if (error) throw error

    // RN-FUT-49: orçamento da viagem atualiza progresso de metas vinculadas no Futuro.
    await syncTripBudgetToFuturo(user.id, budgetItem.trip_id)
  }, [])
}

// ─── Checklist mutations ───────────────────────────────────────────────────

export function useToggleChecklistItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string, completed: boolean) => {
    const { error } = await sb.from('trip_checklist_items').update({ is_completed: completed }).eq('id', id)
    if (error) throw error
  }, [])
}

export function useAddChecklistItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (tripId: string, title: string, category: ChecklistCategory) => {
    const { error } = await sb.from('trip_checklist_items').insert({
      trip_id: tripId, title, category, is_completed: false,
    })
    if (error) throw error
  }, [])
}

export function useDeleteChecklistItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('trip_checklist_items').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── Trip Memories types ───────────────────────────────────────────────────────

export interface TripMemory {
  id: string
  trip_id: string
  user_id: string
  rating: number
  favorite_moment: string | null
  best_food: string | null
  most_beautiful: string | null
  lesson_learned: string | null
  emotion_tags: string[]
  budget_planned: number | null
  budget_actual: number | null
  xp_awarded: number
  created_at: string
  updated_at: string
  trip?: Trip
}

export interface CreateTripMemoryData {
  rating: number
  favorite_moment?: string | null
  best_food?: string | null
  most_beautiful?: string | null
  lesson_learned?: string | null
  emotion_tags?: string[]
  budget_planned?: number | null
  budget_actual?: number | null
}

// ─── Bucket List types ────────────────────────────────────────────────────────

export type BucketPriority = 'high' | 'medium' | 'low'
export type BucketTripType = 'solo' | 'couple' | 'family' | 'friends'
export type BucketStatus = 'pending' | 'visited'

export interface BucketListItem {
  id: string
  user_id: string
  destination_country: string
  destination_city: string | null
  country_code: string | null
  flag_emoji: string | null
  continent: string | null
  priority: BucketPriority
  estimated_budget: number | null
  target_year: number | null
  trip_type: BucketTripType | null
  motivation: string | null
  status: BucketStatus
  trip_id: string | null
  visited_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateBucketItemData {
  destination_country: string
  destination_city?: string | null
  country_code?: string | null
  flag_emoji?: string | null
  continent?: string | null
  priority?: BucketPriority
  estimated_budget?: number | null
  target_year?: number | null
  trip_type?: BucketTripType | null
  motivation?: string | null
}

// ─── Passport types ───────────────────────────────────────────────────────────

export interface PassportCountryEntry {
  name: string
  flag: string
  continent: string
  visits: number
}

export interface PassportContinentEntry {
  name: string
  emoji: string
  visited: number
  total: number
  xp: number
}

export interface PassportBadgeEntry {
  type: string
  name: string
  icon: string
  desc: string
  unlocked: boolean
  xp: number
}

export interface PassportData {
  countries: number
  continents: number
  worldPct: string
  countriesList: PassportCountryEntry[]
  continentProgress: PassportContinentEntry[]
  badges: PassportBadgeEntry[]
}

// ─── Country / Continent lookup ───────────────────────────────────────────────

const COUNTRY_MAP: Record<string, { continent: string; flag: string }> = {
  'Brasil':         { continent: 'América do Sul', flag: '🇧🇷' },
  'Brazil':         { continent: 'América do Sul', flag: '🇧🇷' },
  'Argentina':      { continent: 'América do Sul', flag: '🇦🇷' },
  'Chile':          { continent: 'América do Sul', flag: '🇨🇱' },
  'Uruguai':        { continent: 'América do Sul', flag: '🇺🇾' },
  'Uruguay':        { continent: 'América do Sul', flag: '🇺🇾' },
  'Colômbia':       { continent: 'América do Sul', flag: '🇨🇴' },
  'Colombia':       { continent: 'América do Sul', flag: '🇨🇴' },
  'Peru':           { continent: 'América do Sul', flag: '🇵🇪' },
  'Bolívia':        { continent: 'América do Sul', flag: '🇧🇴' },
  'Paraguai':       { continent: 'América do Sul', flag: '🇵🇾' },
  'Venezuela':      { continent: 'América do Sul', flag: '🇻🇪' },
  'Equador':        { continent: 'América do Sul', flag: '🇪🇨' },
  'Portugal':       { continent: 'Europa', flag: '🇵🇹' },
  'Espanha':        { continent: 'Europa', flag: '🇪🇸' },
  'Spain':          { continent: 'Europa', flag: '🇪🇸' },
  'França':         { continent: 'Europa', flag: '🇫🇷' },
  'France':         { continent: 'Europa', flag: '🇫🇷' },
  'Itália':         { continent: 'Europa', flag: '🇮🇹' },
  'Italy':          { continent: 'Europa', flag: '🇮🇹' },
  'Alemanha':       { continent: 'Europa', flag: '🇩🇪' },
  'Germany':        { continent: 'Europa', flag: '🇩🇪' },
  'Grécia':         { continent: 'Europa', flag: '🇬🇷' },
  'Reino Unido':    { continent: 'Europa', flag: '🇬🇧' },
  'UK':             { continent: 'Europa', flag: '🇬🇧' },
  'Holanda':        { continent: 'Europa', flag: '🇳🇱' },
  'Suíça':          { continent: 'Europa', flag: '🇨🇭' },
  'Japão':          { continent: 'Ásia', flag: '🇯🇵' },
  'Japan':          { continent: 'Ásia', flag: '🇯🇵' },
  'China':          { continent: 'Ásia', flag: '🇨🇳' },
  'Tailândia':      { continent: 'Ásia', flag: '🇹🇭' },
  'Thailand':       { continent: 'Ásia', flag: '🇹🇭' },
  'Índia':          { continent: 'Ásia', flag: '🇮🇳' },
  'India':          { continent: 'Ásia', flag: '🇮🇳' },
  'Indonésia':      { continent: 'Ásia', flag: '🇮🇩' },
  'Singapura':      { continent: 'Ásia', flag: '🇸🇬' },
  'Vietnã':         { continent: 'Ásia', flag: '🇻🇳' },
  'Coreia do Sul':  { continent: 'Ásia', flag: '🇰🇷' },
  'EUA':            { continent: 'América do Norte', flag: '🇺🇸' },
  'USA':            { continent: 'América do Norte', flag: '🇺🇸' },
  'Estados Unidos': { continent: 'América do Norte', flag: '🇺🇸' },
  'México':         { continent: 'América do Norte', flag: '🇲🇽' },
  'Canadá':         { continent: 'América do Norte', flag: '🇨🇦' },
  'Canada':         { continent: 'América do Norte', flag: '🇨🇦' },
  'Cuba':           { continent: 'América do Norte', flag: '🇨🇺' },
  'África do Sul':  { continent: 'África', flag: '🇿🇦' },
  'Marrocos':       { continent: 'África', flag: '🇲🇦' },
  'Egito':          { continent: 'África', flag: '🇪🇬' },
  'Quênia':         { continent: 'África', flag: '🇰🇪' },
  'Tanzânia':       { continent: 'África', flag: '🇹🇿' },
  'Austrália':      { continent: 'Oceania', flag: '🇦🇺' },
  'Australia':      { continent: 'Oceania', flag: '🇦🇺' },
  'Nova Zelândia':  { continent: 'Oceania', flag: '🇳🇿' },
}

const CONTINENT_TOTALS: Record<string, number> = {
  'América do Sul': 12,
  'Europa': 44,
  'Ásia': 48,
  'África': 54,
  'América do Norte': 23,
  'Oceania': 14,
}

const CONTINENT_EMOJI: Record<string, string> = {
  'América do Sul': '🌎',
  'Europa': '🌍',
  'Ásia': '🌏',
  'África': '🌍',
  'América do Norte': '🌎',
  'Oceania': '🌏',
}

function extractCountriesFromTrips(trips: Trip[]): PassportCountryEntry[] {
  const countMap = new Map<string, { flag: string; continent: string; visits: number }>()

  for (const trip of trips) {
    if (trip.status !== 'completed') continue
    for (const dest of trip.destinations) {
      // Try exact match first, then partial match
      const entry = COUNTRY_MAP[dest]
      if (entry) {
        const existing = countMap.get(dest)
        if (existing) {
          existing.visits++
        } else {
          countMap.set(dest, { flag: entry.flag, continent: entry.continent, visits: 1 })
        }
        continue
      }
      // Partial match: check if any key is contained in the destination string
      for (const [countryName, data] of Object.entries(COUNTRY_MAP)) {
        if (dest.includes(countryName) || countryName.includes(dest)) {
          const existing = countMap.get(countryName)
          if (existing) {
            existing.visits++
          } else {
            countMap.set(countryName, { flag: data.flag, continent: data.continent, visits: 1 })
          }
          break
        }
      }
    }
  }

  return Array.from(countMap.entries()).map(([name, v]) => ({
    name,
    flag: v.flag,
    continent: v.continent,
    visits: v.visits,
  }))
}

function buildPassportBadges(
  countriesList: PassportCountryEntry[],
  trips: Trip[]
): PassportBadgeEntry[] {
  const saCountries = countriesList.filter(c => c.continent === 'América do Sul').length
  const euCountries = countriesList.filter(c => c.continent === 'Europa').length
  const continentsVisited = new Set(countriesList.map(c => c.continent)).size
  const totalDaysAbroad = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      const days = Math.round(
        (new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      return sum + Math.max(1, days)
    }, 0)

  return [
    {
      type: 'explorador_sa',
      name: 'Explorador SA',
      icon: '🌎',
      desc: '5 países na Am. Sul',
      unlocked: saCountries >= 5,
      xp: 50,
    },
    {
      type: 'eurotrip_iniciante',
      name: 'Eurotrip Iniciante',
      icon: '🇪🇺',
      desc: '2+ países na Europa',
      unlocked: euCountries >= 2,
      xp: 30,
    },
    {
      type: 'volta_ao_mundo',
      name: 'Volta ao Mundo',
      icon: '🔒',
      desc: 'Todos os continentes',
      unlocked: continentsVisited >= 6,
      xp: 80,
    },
    {
      type: 'nomade_digital',
      name: 'Nômade Digital',
      icon: '💻',
      desc: '30+ dias no exterior',
      unlocked: totalDaysAbroad >= 30,
      xp: 50,
    },
  ]
}

// ─── useTripMemories ──────────────────────────────────────────────────────────

export function useTripMemories() {
  const [memories, setMemories] = useState<TripMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error: err } = await sb
        .from('trip_memories')
        .select('*, trip:trips(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setMemories(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar memórias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { memories, loading, error, reload: load }
}

// ─── useCreateTripMemory ──────────────────────────────────────────────────────

export function useCreateTripMemory() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (tripId: string, data: CreateTripMemoryData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // Validation: rating required, ≥1 text field, ≥1 emotion tag
    if (!data.rating || data.rating < 1) throw new Error('Rating é obrigatório')
    const hasText = data.favorite_moment || data.best_food || data.most_beautiful || data.lesson_learned
    if (!hasText) throw new Error('Preencha ao menos um campo de texto')
    if (!data.emotion_tags || data.emotion_tags.length === 0) throw new Error('Selecione ao menos uma tag de emoção')

    const { data: memory, error } = await sb.from('trip_memories').insert({
      trip_id: tripId,
      user_id: user.id,
      rating: data.rating,
      favorite_moment: data.favorite_moment ?? null,
      best_food: data.best_food ?? null,
      most_beautiful: data.most_beautiful ?? null,
      lesson_learned: data.lesson_learned ?? null,
      emotion_tags: data.emotion_tags ?? [],
      budget_planned: data.budget_planned ?? null,
      budget_actual: data.budget_actual ?? null,
      xp_awarded: 30,
    }).select().single()

    if (error) throw error
    return memory as TripMemory
  }, [])
}

// ─── useUpdateTripMemory ──────────────────────────────────────────────────────

export function useUpdateTripMemory() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (memoryId: string, data: Partial<CreateTripMemoryData>) => {
    const { error } = await sb.from('trip_memories').update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq('id', memoryId)
    if (error) throw error
  }, [])
}

// ─── usePassportData ──────────────────────────────────────────────────────────

export function usePassportData() {
  const [passport, setPassport] = useState<PassportData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: trips } = await sb
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      const completedTrips: Trip[] = trips ?? []
      const countriesList = extractCountriesFromTrips(completedTrips)
      const uniqueContinents = new Set(countriesList.map(c => c.continent))
      const continentProgress: PassportContinentEntry[] = Object.entries(CONTINENT_TOTALS).map(([name, total]) => ({
        name,
        emoji: CONTINENT_EMOJI[name] ?? '🌐',
        visited: countriesList.filter(c => c.continent === name).length,
        total,
        xp: countriesList.filter(c => c.continent === name).length * 30,
      }))
      const badges = buildPassportBadges(countriesList, completedTrips)
      const worldPct = ((countriesList.length / 195) * 100).toFixed(1) + '%'

      setPassport({
        countries: countriesList.length,
        continents: uniqueContinents.size,
        worldPct,
        countriesList,
        continentProgress,
        badges,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { passport, loading, reload: load }
}

// ─── useBucketList ────────────────────────────────────────────────────────────

export function useBucketList() {
  const [items, setItems] = useState<BucketListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error: err } = await sb
        .from('bucket_list_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setItems(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar bucket list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { items, loading, error, reload: load }
}

// ─── useCreateBucketItem ──────────────────────────────────────────────────────

export function useCreateBucketItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: CreateBucketItemData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // FREE limit: max 10 items
    const { count } = await sb
      .from('bucket_list_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 10) {
      const err = new Error('LIMIT_REACHED: Limite de 10 itens no plano gratuito') as Error & { code: string }
      err.code = 'LIMIT_REACHED'
      throw err
    }

    const { data: item, error } = await sb.from('bucket_list_items').insert({
      user_id: user.id,
      destination_country: data.destination_country,
      destination_city: data.destination_city ?? null,
      country_code: data.country_code ?? null,
      flag_emoji: data.flag_emoji ?? null,
      continent: data.continent ?? null,
      priority: data.priority ?? 'medium',
      estimated_budget: data.estimated_budget ?? null,
      target_year: data.target_year ?? null,
      trip_type: data.trip_type ?? null,
      motivation: data.motivation ?? null,
      status: 'pending',
    }).select().single()

    if (error) throw error
    return item as BucketListItem
  }, [])
}

// ─── useUpdateBucketItem ──────────────────────────────────────────────────────

export function useUpdateBucketItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string, data: Partial<Omit<BucketListItem, 'id' | 'user_id' | 'created_at'>>) => {
    const { error } = await sb.from('bucket_list_items').update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) throw error
  }, [])
}

// ─── useDeleteBucketItem ──────────────────────────────────────────────────────

export function useDeleteBucketItem() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (id: string) => {
    const { error } = await sb.from('bucket_list_items').delete().eq('id', id)
    if (error) throw error
  }, [])
}

// ─── useTransformToTrip ───────────────────────────────────────────────────────

export function useTransformToTrip() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (bucketItemId: string): Promise<Partial<CreateTripData>> => {
    const { data: item, error } = await sb
      .from('bucket_list_items')
      .select('*')
      .eq('id', bucketItemId)
      .single()

    if (error) throw error
    const b = item as BucketListItem

    return {
      name: b.destination_city
        ? `${b.destination_city}, ${b.destination_country}`
        : b.destination_country,
      destinations: b.destination_city
        ? [b.destination_country, b.destination_city]
        : [b.destination_country],
      trip_type: 'leisure',
      travelers_count: b.trip_type === 'couple' ? 2 : b.trip_type === 'family' ? 4 : 1,
      total_budget: b.estimated_budget ?? null,
      notes: b.motivation ?? null,
    }
  }, [])
}

// ─── useUpdateTripStatus ──────────────────────────────────────────────────────

export function useUpdateTripStatus() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (tripId: string, newStatus: TripStatus) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // RN-EXP-23: only 1 active trip at a time
    if (newStatus === 'ongoing') {
      const { data: active } = await sb
        .from('trips')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'ongoing')
        .neq('id', tripId)

      if (active && active.length > 0) {
        const err = new Error('ACTIVE_LIMIT: Você já tem uma viagem em andamento') as Error & { code: string }
        err.code = 'ACTIVE_LIMIT'
        throw err
      }
    }

    const { error } = await sb.from('trips').update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', tripId)
    if (error) throw error

    // RN-EXP-02: when trip is completed, mark linked objective goal as 100% done
    if (newStatus === 'completed') {
      try {
        const nowIso = new Date().toISOString()
        await sb.from('objective_goals')
          .update({
            current_value: 1,
            progress: 100,
            status: 'completed',
            completed_at: nowIso,
            last_progress_update: nowIso,
            updated_at: nowIso,
          })
          .eq('user_id', user.id)
          .eq('target_module', 'experiencias')
          .eq('linked_entity_id', tripId)
          .eq('status', 'active')
      } catch (err) { console.warn('[CrossModule] Falha ao limpar integrações de viagem:', err) }
    }
  }, [])
}
