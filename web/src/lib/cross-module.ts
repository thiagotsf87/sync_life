'use client'

import { createClient } from '@/lib/supabase/client'
import { getCachedIntegrationSettings } from '@/lib/user-preferences'

// ─── CROSS-MODULE INTEGRATION ENGINE ───────────────────────────────────────────
//
// Implements auto-transactions and auto-events between modules.
// Each integration function checks the user's integration settings
// (stored in Supabase + cached in memory, fallback to localStorage).

const SETTINGS_KEY = 'sl_integrations_settings'

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function getIntegrationSettings(): Record<string, boolean> {
  // 1. Try in-memory cache (populated by AppShell via hydratePreferences)
  const cached = getCachedIntegrationSettings()
  if (cached) return cached

  // 2. Fallback to localStorage (backwards compat)
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function isEnabled(settingKey: string): boolean {
  const settings = getIntegrationSettings()
  return settings[settingKey] === true
}

// ─── AUTO-TRANSACTION HELPERS ──────────────────────────────────────────────────

async function createAutoTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  categoryName: string,
  sourceModule: string,
): Promise<void> {
  const sb = createClient() as any

  // Find or create category
  let categoryId: string | null = null
  const { data: cats } = await sb
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', categoryName)
    .limit(1)

  if (cats && cats.length > 0) {
    categoryId = cats[0].id
  }

  await sb.from('transactions').insert({
    user_id: userId,
    type,
    amount: Math.abs(amount),
    description,
    category_id: categoryId,
    date: new Date().toISOString().slice(0, 10),
    notes: `Auto-criado pelo módulo ${sourceModule}`,
    payment_method: 'other',
  })
}

// ─── AUTO-EVENT HELPER ─────────────────────────────────────────────────────────

async function createAutoEvent(
  userId: string,
  title: string,
  date: string,
  type: string,
  sourceModule: string,
  startTime?: string,
  endTime?: string,
): Promise<void> {
  const sb = createClient() as any

  await sb.from('agenda_events').insert({
    user_id: userId,
    title,
    date,
    type,
    start_time: startTime ?? null,
    end_time: endTime ?? null,
    all_day: !startTime,
    status: 'pendente',
    priority: 'normal',
    description: `Auto-criado pelo módulo ${sourceModule}`,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION FUNCTIONS — Called from module hooks
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Corpo → Finanças: Consulta médica → despesa ───────────────────────────────

export async function onAppointmentCreated(
  userId: string,
  specialty: string,
  doctor: string,
  cost: number | null,
  date: string,
): Promise<void> {
  // Auto-transaction
  if (isEnabled('corpo_financas') && cost && cost > 0) {
    await createAutoTransaction(
      userId,
      'expense',
      cost,
      `Consulta ${specialty} — Dr. ${doctor}`,
      'Saúde',
      'Corpo',
    )
  }

  // Auto-event
  if (isEnabled('corpo_tempo')) {
    await createAutoEvent(
      userId,
      `Consulta ${specialty}`,
      date,
      'saude',
      'Corpo',
    )
  }
}

// ─── Patrimônio → Finanças: Provento → receita ────────────────────────────────

export async function onDividendReceived(
  userId: string,
  assetTicker: string,
  amount: number,
  date: string,
): Promise<void> {
  if (!isEnabled('patrimonio_financas') || amount <= 0) return

  await createAutoTransaction(
    userId,
    'income',
    amount,
    `Provento ${assetTicker}`,
    'Investimentos',
    'Patrimônio',
  )
}

// ─── Patrimônio → Finanças: Aporte → despesa ──────────────────────────────────

export async function onAssetPurchased(
  userId: string,
  assetTicker: string,
  amount: number,
): Promise<void> {
  if (!isEnabled('patrimonio_financas') || amount <= 0) return

  await createAutoTransaction(
    userId,
    'expense',
    amount,
    `Aporte ${assetTicker}`,
    'Investimentos',
    'Patrimônio',
  )
}

// ─── Experiências → Finanças: Despesa de viagem ───────────────────────────────

export async function onTripExpenseAdded(
  userId: string,
  tripName: string,
  category: string,
  amount: number,
): Promise<void> {
  if (!isEnabled('experiencias_financas') || amount <= 0) return

  await createAutoTransaction(
    userId,
    'expense',
    amount,
    `Viagem: ${tripName} — ${category}`,
    'Viagens',
    'Experiências',
  )
}

// ─── Experiências → Tempo: Viagem → eventos ───────────────────────────────────

export async function onTripCreated(
  userId: string,
  tripName: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  if (!isEnabled('experiencias_tempo')) return

  // Create event for departure
  await createAutoEvent(
    userId,
    `✈️ Início: ${tripName}`,
    startDate,
    'pessoal',
    'Experiências',
  )

  // Create event for return
  if (endDate && endDate !== startDate) {
    await createAutoEvent(
      userId,
      `🏠 Volta: ${tripName}`,
      endDate,
      'pessoal',
      'Experiências',
    )
  }
}

// ─── Carreira → Finanças: Promoção → receita ──────────────────────────────────

export async function onPromotionRecorded(
  userId: string,
  newRole: string,
  salaryIncrease: number | null,
): Promise<void> {
  if (!isEnabled('carreira_financas') || !salaryIncrease || salaryIncrease <= 0) return

  await createAutoTransaction(
    userId,
    'income',
    salaryIncrease,
    `Aumento salarial — ${newRole}`,
    'Salário',
    'Carreira',
  )
}

// ─── Mente → Tempo: Sessão de estudo → evento ────────────────────────────────

export async function onStudySessionCompleted(
  userId: string,
  trackName: string,
  durationMinutes: number,
  date: string,
): Promise<void> {
  if (!isEnabled('mente_tempo')) return

  await createAutoEvent(
    userId,
    `📚 Estudo: ${trackName} (${durationMinutes}min)`,
    date,
    'estudo',
    'Mente',
  )
}

// ─── Carreira ↔ Mente: Skill → Track linking ─────────────────────────────────

export async function onSkillLinkedToTrack(
  userId: string,
  skillId: string,
  trackId: string,
): Promise<void> {
  if (!isEnabled('carreira_mente')) return

  const sb = createClient() as any

  // Update the skill with linked track
  await sb
    .from('skills')
    .update({ linked_track_id: trackId })
    .eq('id', skillId)
    .eq('user_id', userId)
}

export async function onTrackCompleted(
  userId: string,
  trackId: string,
): Promise<void> {
  if (!isEnabled('carreira_mente')) return

  const sb = createClient() as any

  // Find skills linked to this track and increment level
  const { data: skills } = await sb
    .from('skills')
    .select('id, current_level')
    .eq('user_id', userId)
    .eq('linked_track_id', trackId)

  if (skills && skills.length > 0) {
    for (const skill of skills) {
      await sb
        .from('skills')
        .update({ current_level: (skill.current_level ?? 0) + 1 })
        .eq('id', skill.id)
    }
  }
}
