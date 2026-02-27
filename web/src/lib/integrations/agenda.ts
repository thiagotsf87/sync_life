/**
 * SyncLife — Integrações Cross-Module → Agenda
 *
 * Funções bridge standalone que criam eventos automaticamente a partir
 * de ações em outros módulos (opt-in pelo usuário).
 *
 * Badge "Auto — <módulo>" identifica eventos gerados automaticamente.
 *
 * Regras: RN-CRP-01, RN-EXP-02
 */

import { createClient } from '@/lib/supabase/client'

// ─── Corpo → Agenda (RN-CRP-01) ──────────────────────────────────────────────

/**
 * Consulta agendada → evento na Agenda
 * Tipo: 'saude' | Badge: "Auto — 🏃 Corpo"
 */
export async function createEventFromConsulta(opts: {
  specialty: string
  doctorName: string | null
  location: string | null
  appointmentDate: string  // ISO datetime "2026-03-15T14:30"
}): Promise<void> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const dateOnly = opts.appointmentDate.slice(0, 10)
  const timeRaw = opts.appointmentDate.slice(11, 16)
  // time can be "HH:MM" or empty
  const startTime = timeRaw.length >= 5 ? timeRaw : undefined

  const descParts: string[] = ['Auto — 🏃 Corpo']
  if (opts.doctorName) descParts.push(`Dr(a). ${opts.doctorName}`)
  if (opts.location) descParts.push(opts.location)

  await supabase.from('agenda_events').insert({
    user_id: user.id,
    title: `🏥 Consulta — ${opts.specialty}`,
    description: descParts.join(' · '),
    type: 'saude',
    date: dateOnly,
    all_day: !startTime,
    start_time: startTime ?? null,
    end_time: null,
    priority: 'normal',
    status: 'pending',
    reminder: null,
    recurrence: 'none',
    location: opts.location ?? null,
    checklist: [],
  })
}

// ─── Experiências → Agenda (RN-EXP-02) ───────────────────────────────────────

/**
 * Viagem criada → dois eventos na Agenda (partida + retorno)
 * Tipo: 'pessoal' | Badge: "Auto — ✈️ Experiências"
 */
export async function createEventsFromViagem(opts: {
  tripName: string
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}): Promise<void> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const baseEvent = {
    user_id: user.id,
    type: 'pessoal',
    all_day: true,
    start_time: null,
    end_time: null,
    priority: 'normal',
    status: 'pending',
    reminder: null,
    recurrence: 'none',
    checklist: [],
  }

  await supabase.from('agenda_events').insert([
    {
      ...baseEvent,
      title: `✈️ ${opts.tripName} — Partida`,
      description: `Auto — ✈️ Experiências | Início da viagem: ${opts.tripName}`,
      date: opts.startDate,
      location: null,
    },
    {
      ...baseEvent,
      title: `🏠 ${opts.tripName} — Retorno`,
      description: `Auto — ✈️ Experiências | Fim da viagem: ${opts.tripName}`,
      date: opts.endDate,
      location: null,
    },
  ])
}
