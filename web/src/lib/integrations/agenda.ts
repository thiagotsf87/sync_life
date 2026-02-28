/**
 * SyncLife — Integrações Cross-Module → Agenda
 *
 * Funções bridge standalone que criam eventos automaticamente a partir
 * de ações em outros módulos (opt-in pelo usuário).
 *
 * Badge "Auto — <módulo>" identifica eventos gerados automaticamente.
 *
 * Regras: RN-CRP-01, RN-EXP-02, RN-CRP-33, RN-MNT-13, RN-FUT-35
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

// ─── Corpo → Agenda (atividade física) (RN-CRP-33) ───────────────────────────

/**
 * Atividade física registrada → evento na Agenda
 * Tipo: 'saude' | Badge: "Auto — 🏃 Corpo"
 */
export async function createEventFromAtividade(opts: {
  activityLabel: string
  durationMinutes: number
  recordedAt: string  // "2026-03-15T10:30" or "2026-03-15T10:30:00"
}): Promise<void> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const dateOnly = opts.recordedAt.slice(0, 10)
  const timeRaw = opts.recordedAt.slice(11, 16)
  const startTime = timeRaw.length >= 5 ? timeRaw : '00:00'

  // Calculate end time
  const [h, m] = startTime.split(':').map(Number)
  const totalMins = h * 60 + m + opts.durationMinutes
  const endH = Math.floor(totalMins / 60) % 24
  const endM = totalMins % 60
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

  await supabase.from('agenda_events').insert({
    user_id: user.id,
    title: `🏋️ ${opts.activityLabel}`,
    description: `Auto — 🏃 Corpo | ${opts.durationMinutes}min de ${opts.activityLabel}`,
    type: 'saude',
    date: dateOnly,
    all_day: false,
    start_time: startTime,
    end_time: endTime,
    priority: 'normal',
    status: 'done',
    reminder: null,
    recurrence: 'none',
    location: null,
    checklist: [],
  })
}

// ─── Mente → Agenda (Pomodoro) (RN-MNT-13) ───────────────────────────────────

/**
 * Sessão Pomodoro concluída → evento "Bloco de Estudo" na Agenda
 * Tipo: 'estudo' | Badge: "Auto — 📚 Mente"
 */
export async function createEventFromPomodoro(opts: {
  trackName: string | null
  focusMinutes: number
  date: string  // YYYY-MM-DD
}): Promise<void> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const title = opts.trackName
    ? `📚 Bloco de Estudo — ${opts.trackName}`
    : '📚 Bloco de Estudo'

  await supabase.from('agenda_events').insert({
    user_id: user.id,
    title,
    description: `Auto — 📚 Mente | Sessão Pomodoro de ${opts.focusMinutes}min`,
    type: 'estudo',
    date: opts.date,
    all_day: true,
    start_time: null,
    end_time: null,
    priority: 'normal',
    status: 'done',
    reminder: null,
    recurrence: 'none',
    location: null,
    checklist: [],
  })
}

// ─── Futuro → Agenda (prazo de objetivo) (RN-FUT-35) ─────────────────────────

/**
 * Prazo de objetivo → evento lembrete na Agenda no dia do prazo
 * Tipo: 'pessoal' | Badge: "Auto — 🔮 Futuro"
 */
export async function createEventFromObjective(opts: {
  objectiveName: string
  targetDate: string  // YYYY-MM-DD
}): Promise<void> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  await supabase.from('agenda_events').insert({
    user_id: user.id,
    title: `🔮 ${opts.objectiveName} — Prazo`,
    description: `Auto — 🔮 Futuro | Lembrete de prazo do objetivo: ${opts.objectiveName}`,
    type: 'pessoal',
    date: opts.targetDate,
    all_day: true,
    start_time: null,
    end_time: null,
    priority: 'high',
    status: 'pending',
    reminder: null,
    recurrence: 'none',
    location: null,
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
