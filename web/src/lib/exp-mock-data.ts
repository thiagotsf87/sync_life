// Deterministic mock data for Experiências V2 — Passaporte, Memórias, Bucket List
// No Math.random() — safe for SSR hydration

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════

export interface MapPin {
  cx: number
  cy: number
  type: 'visited' | 'planned' | 'bucket'
  label?: string
}

export interface PassportCountry {
  flag: string
  name: string
  visits: number
  xp: number
}

export interface ContinentProgress {
  emoji: string
  name: string
  visited: number
  total: number
  xp: number
  note?: string
}

export interface PassportBadge {
  icon: string
  name: string
  desc: string
  unlocked: boolean
  xp: number
}

export interface MemoryItem {
  id: string
  flag: string
  name: string
  dates: string
  days: number
  rating: number | null
  tags: string[]
  registered: boolean
  xp: number
}

export interface MemoryHighlight {
  emoji: string
  country: string
  label: string
}

export interface MemoryDetail {
  flag: string
  name: string
  dates: string
  days: number
  type: string
  rating: number
  favoriteMoment: string
  bestFood: string
  beautifulPlace: string
  learning: string
  tags: { label: string; selected: boolean }[]
  budgetPlanned: number
  budgetReal: number
}

export interface BucketItem {
  id: string
  flag: string
  destination: string
  country: string
  continent: string
  priority: 'high' | 'medium' | 'low'
  cost: number
  date: string
  type?: string
  motivation: string
  visited: boolean
  aiEstimate?: string
  xp: number
}

// ══════════════════════════════════════
// PASSAPORTE DATA
// ══════════════════════════════════════

export const PASSPORT_COUNTRIES: PassportCountry[] = [
  { flag: '🇧🇷', name: 'Brasil', visits: 0, xp: 0 },
  { flag: '🇦🇷', name: 'Argentina', visits: 2, xp: 30 },
  { flag: '🇨🇱', name: 'Chile', visits: 1, xp: 30 },
  { flag: '🇺🇾', name: 'Uruguai', visits: 1, xp: 30 },
  { flag: '🇨🇴', name: 'Colômbia', visits: 1, xp: 30 },
  { flag: '🇵🇹', name: 'Portugal', visits: 1, xp: 50 },
  { flag: '🇪🇸', name: 'Espanha', visits: 1, xp: 50 },
]

export const PASSPORT_STATS = {
  countries: 8,
  continents: 3,
  worldPct: '4.1%',
}

export const PASSPORT_CONTINENTS: ContinentProgress[] = [
  { emoji: '🌎', name: 'América do Sul', visited: 5, total: 12, xp: 150 },
  { emoji: '🌍', name: 'Europa', visited: 2, total: 44, xp: 100 },
  { emoji: '🌏', name: 'Ásia', visited: 0, total: 48, xp: 80, note: '🇯🇵 planejado' },
  { emoji: '🌍', name: 'África', visited: 0, total: 54, xp: 0 },
  { emoji: '🌏', name: 'Oceania', visited: 0, total: 14, xp: 0 },
]

export const PASSPORT_BADGES: PassportBadge[] = [
  { icon: '🌎', name: 'Explorador SA', desc: '5 países na Am. Sul', unlocked: true, xp: 50 },
  { icon: '🇪🇺', name: 'Eurotrip Iniciante', desc: '2+ países na Europa', unlocked: true, xp: 30 },
  { icon: '🔒', name: 'Volta ao Mundo', desc: 'Todos continentes', unlocked: false, xp: 80 },
  { icon: '🔒', name: 'Nômade Digital', desc: '30+ dias no exterior', unlocked: false, xp: 50 },
]

export const PASSPORT_PINS: MapPin[] = [
  { cx: 72, cy: 110, type: 'visited', label: 'Brasil' },
  { cx: 68, cy: 138, type: 'visited', label: 'Argentina' },
  { cx: 60, cy: 135, type: 'visited', label: 'Chile' },
  { cx: 74, cy: 130, type: 'visited', label: 'Uruguai' },
  { cx: 62, cy: 92, type: 'visited', label: 'Colômbia' },
  { cx: 148, cy: 44, type: 'visited', label: 'Portugal' },
  { cx: 156, cy: 42, type: 'visited', label: 'Espanha' },
  { cx: 312, cy: 35, type: 'planned', label: 'Japão' },
]

// ══════════════════════════════════════
// MEMÓRIAS DATA
// ══════════════════════════════════════

export const MEMORY_STATS = {
  registered: 5,
  pending: 2,
  avgRating: 4.3,
}

export const MEMORY_HIGHLIGHTS: MemoryHighlight[] = [
  { emoji: '🍝', country: 'Portugal', label: 'Melhor comida' },
  { emoji: '📸', country: 'Espanha', label: 'Lugar mais bonito' },
  { emoji: '💡', country: 'Argentina', label: 'Maior aprendizado' },
]

export const MEMORY_ITEMS: MemoryItem[] = [
  { id: 'pt', flag: '🇵🇹', name: 'Portugal — Lisboa & Porto', dates: 'Jan 2026 · 14 dias', days: 14, rating: 4.8, tags: ['🤩 Incrível', '🍝 Gastro'], registered: true, xp: 50 },
  { id: 'es', flag: '🇪🇸', name: 'Espanha — Barcelona', dates: 'Ago 2025 · 10 dias', days: 10, rating: 4.5, tags: ['😍 Apaixonante', '🏛️ Cultura'], registered: true, xp: 50 },
  { id: 'ar', flag: '🇦🇷', name: 'Argentina — Buenos Aires', dates: 'Jun 2025 · 7 dias', days: 7, rating: 4.2, tags: ['🎶 Tango', '🥩 Asado'], registered: true, xp: 30 },
  { id: 'uy', flag: '🇺🇾', name: 'Uruguai — Montevidéu', dates: 'Abr 2025 · 5 dias', days: 5, rating: 3.8, tags: ['😌 Relaxante'], registered: true, xp: 30 },
  { id: 'br', flag: '🇧🇷', name: 'Fernando de Noronha', dates: 'Fev 2025 · 6 dias', days: 6, rating: 4.2, tags: ['🏖️ Praia', '🐢 Natureza'], registered: true, xp: 30 },
  { id: 'cl', flag: '🇨🇱', name: 'Chile — Santiago', dates: 'Nov 2025 · 8 dias', days: 8, rating: null, tags: [], registered: false, xp: 0 },
  { id: 'co', flag: '🇨🇴', name: 'Colômbia — Bogotá', dates: 'Set 2025 · 10 dias', days: 10, rating: null, tags: [], registered: false, xp: 0 },
]

export const MEMORY_DETAIL_PORTUGAL: MemoryDetail = {
  flag: '🇵🇹',
  name: 'Portugal — Lisboa & Porto',
  dates: '05–19 Jan 2026 · 14 dias · Solo',
  days: 14,
  type: 'Solo',
  rating: 4.8,
  favoriteMoment: 'Assistir ao pôr do sol no Miradouro da Graça em Lisboa, com o Tejo brilhando e o som do fado ao fundo.',
  bestFood: 'Bacalhau à Brás no restaurante Ramiro em Lisboa. Simples, mas perfeito.',
  beautifulPlace: 'A Livraria Lello no Porto — parece que entrei num filme do Harry Potter.',
  learning: 'Viajar sozinho me ensinou a ser mais paciente e a apreciar os momentos de silêncio.',
  tags: [
    { label: '🤩 Incrível', selected: true },
    { label: '🍝 Gastronômico', selected: true },
    { label: '📚 Cultural', selected: true },
    { label: '😌 Relaxante', selected: false },
    { label: '🏖️ Praia', selected: false },
    { label: '🏔️ Aventura', selected: false },
    { label: '🎶 Musical', selected: true },
    { label: '💑 Romântico', selected: false },
  ],
  budgetPlanned: 13000,
  budgetReal: 12300,
}

// ══════════════════════════════════════
// BUCKET LIST DATA
// ══════════════════════════════════════

export const BUCKET_ITEMS: BucketItem[] = [
  { id: 'jp', flag: '🇯🇵', destination: 'Tóquio & Quioto', country: 'Japão', continent: 'Ásia', priority: 'high', cost: 15000, date: 'Jul 2026', type: 'Solo', motivation: 'Sempre sonhei em ver o Monte Fuji e comer ramen legítimo.', visited: false, xp: 80 },
  { id: 'it', flag: '🇮🇹', destination: 'Roma & Toscana', country: 'Itália', continent: 'Europa', priority: 'high', cost: 14000, date: '2027', motivation: 'Pizza napolitana e o Coliseu — obrigatório.', visited: false, aiEstimate: 'R$ 13.500–16.000', xp: 50 },
  { id: 'gr', flag: '🇬🇷', destination: 'Santorini & Atenas', country: 'Grécia', continent: 'Europa', priority: 'medium', cost: 12000, date: '2027', motivation: 'Aquele pôr do sol azul e branco que todo mundo posta.', visited: false, xp: 50 },
  { id: 'eg', flag: '🇪🇬', destination: 'Cairo & Pirâmides', country: 'Egito', continent: 'África', priority: 'low', cost: 10000, date: '2028', motivation: 'As pirâmides são uma das 7 maravilhas.', visited: false, xp: 80 },
  { id: 'us', flag: '🇺🇸', destination: 'Nova York', country: 'EUA', continent: 'Am. Norte', priority: 'high', cost: 12000, date: '2027', motivation: 'Central Park, Broadway e a estátua da Liberdade.', visited: false, xp: 50 },
  { id: 'au', flag: '🇦🇺', destination: 'Sydney & Melbourne', country: 'Austrália', continent: 'Oceania', priority: 'medium', cost: 18000, date: '2028', motivation: 'Opera House e a Grande Barreira de Coral.', visited: false, xp: 80 },
  { id: 'mx', flag: '🇲🇽', destination: 'Cidade do México', country: 'México', continent: 'Am. Norte', priority: 'medium', cost: 6000, date: '2027', motivation: 'Tacos de rua e as pirâmides de Teotihuacán.', visited: false, xp: 50 },
  { id: 'pe', flag: '🇵🇪', destination: 'Cusco & Machu Picchu', country: 'Peru', continent: 'Am. Sul', priority: 'high', cost: 8000, date: '2027', motivation: 'Machu Picchu é um sonho de infância.', visited: false, xp: 50 },
  { id: 'th', flag: '🇹🇭', destination: 'Bangkok & Chiang Mai', country: 'Tailândia', continent: 'Ásia', priority: 'low', cost: 9000, date: '2028', motivation: 'Templos dourados e comida de rua incrível.', visited: false, xp: 80 },
  { id: 'ma', flag: '🇲🇦', destination: 'Marrakech', country: 'Marrocos', continent: 'África', priority: 'low', cost: 7000, date: '2028', motivation: 'As cores e os cheiros do souk.', visited: false, xp: 80 },
  // Visited items
  { id: 'pt-v', flag: '🇵🇹', destination: 'Lisboa & Porto', country: 'Portugal', continent: 'Europa', priority: 'high', cost: 12300, date: 'Jan 2026', motivation: 'Fado, pastéis de nata e história.', visited: true, xp: 50 },
  { id: 'es-v', flag: '🇪🇸', destination: 'Barcelona', country: 'Espanha', continent: 'Europa', priority: 'high', cost: 11000, date: 'Ago 2025', motivation: 'Gaudí e a vida noturna.', visited: true, xp: 50 },
  { id: 'ar-v', flag: '🇦🇷', destination: 'Buenos Aires', country: 'Argentina', continent: 'Am. Sul', priority: 'medium', cost: 5500, date: 'Jun 2025', motivation: 'Tango no San Telmo.', visited: true, xp: 30 },
  { id: 'cl-v', flag: '🇨🇱', destination: 'Santiago', country: 'Chile', continent: 'Am. Sul', priority: 'medium', cost: 5800, date: 'Nov 2025', motivation: 'Vinhos e a Cordilheira.', visited: true, xp: 30 },
]

export const BUCKET_SUMMARY = {
  totalCost: 85000,
  totalItems: 14,
  visited: 4,
  pending: 10,
}

export const BUCKET_PINS: MapPin[] = [
  { cx: 312, cy: 35, type: 'bucket', label: 'Japão' },
  { cx: 170, cy: 35, type: 'bucket', label: 'Itália' },
  { cx: 186, cy: 60, type: 'bucket', label: 'Egito' },
  { cx: 75, cy: 44, type: 'bucket', label: 'NYC' },
  { cx: 304, cy: 120, type: 'bucket', label: 'Austrália' },
  { cx: 175, cy: 30, type: 'bucket', label: 'Grécia' },
]

// ══════════════════════════════════════
// DASHBOARD DATA (quick KPIs)
// ══════════════════════════════════════

export const DASHBOARD_STATS = {
  totalTrips: 12,
  countries: 8,
  continents: 3,
  avgRating: 4.3,
}

export const DASHBOARD_RECENT_TRIPS = [
  { flag: '🇵🇹', name: 'Portugal', meta: 'Jan 2026 · 14 dias', status: 'done' as const, xp: 50 },
  { flag: '🇨🇱', name: 'Chile', meta: 'Nov 2025 · 8 dias', status: 'done' as const, xp: 30 },
  { flag: '🇨🇴', name: 'Colômbia', meta: 'Set 2025 · 10 dias', status: 'active' as const, xp: 0 },
]

export const DASHBOARD_NEXT_TRIP = {
  flag: '🇯🇵',
  name: 'Japão',
  dates: '10–22 Jul 2026 · 12 dias · Solo',
  status: 'Planejando',
  budgetPct: 56,
  budgetSaved: 'R$ 8.400',
  xp: 80,
}

// ══════════════════════════════════════
// VIAGENS TAB DATA
// ══════════════════════════════════════

export interface TripListItem {
  id: string
  flag: string
  name: string
  dates: string
  days: number
  status: 'planning' | 'active' | 'done'
  group: string
  budget: number
  budgetPct?: number
  rating?: number
  hasMemory: boolean
  xp: number
}

export const TRIP_LIST: TripListItem[] = [
  { id: 'jp-trip', flag: '🇯🇵', name: 'Japão — Tóquio & Quioto', dates: '10–22 Jul 2026', days: 12, status: 'planning', group: 'Solo', budget: 15000, budgetPct: 56, hasMemory: false, xp: 80 },
  { id: 'co-trip', flag: '🇨🇴', name: 'Colômbia — Bogotá', dates: '01–10 Set 2025', days: 10, status: 'active', group: 'Casal', budget: 6200, hasMemory: false, xp: 50 },
  { id: 'pt-trip', flag: '🇵🇹', name: 'Portugal — Lisboa & Porto', dates: '05–19 Jan 2026', days: 14, status: 'done', group: 'Solo', budget: 12300, rating: 4.8, hasMemory: true, xp: 50 },
  { id: 'cl-trip', flag: '🇨🇱', name: 'Chile — Santiago', dates: '10–18 Nov 2025', days: 8, status: 'done', group: 'Amigos', budget: 5800, hasMemory: false, xp: 30 },
  { id: 'es-trip', flag: '🇪🇸', name: 'Espanha — Barcelona', dates: '20–30 Ago 2025', days: 10, status: 'done', group: 'Casal', budget: 11000, rating: 4.5, hasMemory: true, xp: 50 },
]

export const TRIP_FILTER_COUNTS = {
  all: 12,
  planning: 1,
  active: 3,
  done: 7,
}

// ══════════════════════════════════════
// MOCK OBJECTIVES (Futuro integration — RN-EXP-02)
// Used as fallback in wizard when user has no active objectives in DB
// ══════════════════════════════════════

export interface MockObjective {
  id: string
  name: string
  icon: string
}

export const MOCK_OBJECTIVES_FUTURO: MockObjective[] = [
  { id: 'mock-obj-1', name: 'Viajar o mundo', icon: '🌍' },
  { id: 'mock-obj-2', name: 'Conhecer 10 países', icon: '🗺️' },
  { id: 'mock-obj-3', name: 'Experiência na Europa', icon: '🏰' },
]
