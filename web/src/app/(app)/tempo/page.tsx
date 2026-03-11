'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAgenda, EVENT_TYPES, getWeekRange, type AgendaEvent } from '@/hooks/use-agenda'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { EventModal } from '@/components/agenda/EventModal'
import { TempoMobile } from '@/components/tempo/TempoMobile'
import { TempoMobileShell } from '@/components/tempo/TempoMobileShell'
import { useMetas } from '@/hooks/use-metas'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MODULE_COLORS: Record<string, string> = {
  Carreira: '#f43f5e',
  Corpo: '#f97316',
  Mente: '#eab308',
  Finanças: '#10b981',
  Futuro: '#8b5cf6',
  Tempo: '#06b6d4',
  Experiências: '#ec4899',
}

const TEMPO_TABS = [
  { label: 'Dashboard', href: '/tempo' },
  { label: 'Agenda', href: '/tempo/agenda' },
  { label: 'Semanal', href: '/tempo/semanal' },
  { label: 'Mensal', href: '/tempo/mensal' },
  { label: 'Review', href: '/tempo/review', pro: true },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function buildWeekDays(refDate: Date): Date[] {
  const d = new Date(refDate)
  const day = d.getDay()
  const diff = d.getDate() - day
  const sunday = new Date(d)
  sunday.setDate(diff)
  sunday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(sunday)
    dt.setDate(sunday.getDate() + i)
    return dt
  })
}

function formatTime(t: string): string {
  return t
}

function getNextProximoEvento(events: AgendaEvent[], todayDate: string): AgendaEvent | null {
  const now = new Date()
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  // today's future events first
  const todayFuture = events
    .filter(e => e.date === todayDate && !e.all_day && (e.start_time ?? '00:00') > nowTime && e.status !== 'cancelado')
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  if (todayFuture.length > 0) return todayFuture[0]
  // future days
  const futureDays = events
    .filter(e => e.date > todayDate && e.status !== 'cancelado')
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  return futureDays[0] ?? null
}

// ─── DAY TIMELINE ITEM ────────────────────────────────────────────────────────

function DayTimelineItem({ event }: { event: AgendaEvent }) {
  const cfg = EVENT_TYPES[event.type]
  return (
    <div className="flex gap-3 items-start py-2.5 border-b border-[var(--sl-border)] last:border-0">
      {/* Time */}
      <div className="w-14 shrink-0 text-right">
        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
          {event.all_day ? 'Dia todo' : (event.start_time ?? '—')}
        </span>
      </div>
      {/* Bar */}
      <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: cfg.color }} />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]"
            style={{ color: cfg.color, background: `${cfg.color}18` }}>
            {cfg.icon} {cfg.label}
          </span>
          {event.location && (
            <span className="text-[10px] text-[var(--sl-t3)] truncate">📍 {event.location}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MODULE DISTRIBUTION BAR ─────────────────────────────────────────────────

function ModuleDistributionBar({
  label,
  hours,
  maxHours,
  color,
}: {
  label: string
  hours: number
  maxHours: number
  color: string
}) {
  const pct = maxHours > 0 ? Math.round((hours / maxHours) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[var(--sl-t2)] w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '6px' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-[DM_Mono] text-[11px] font-semibold w-10 text-right shrink-0"
        style={{ color }}>
        {hours.toFixed(1)}h
      </span>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function TempoDashboardPage() {
  const pathname = usePathname()

  const today = todayStr()
  const now = new Date()
  const weekDays = buildWeekDays(now)
  const [selectedDay, setSelectedDay] = useState(() => now.getDay())

  const { weekStart, weekEnd } = getWeekRange(now)
  const { events, create, update } = useAgenda({ mode: 'week', referenceDate: now })
  const { goals } = useMetas()
  const goalOptions = goals.map(g => ({ id: g.id, name: g.name, icon: g.icon }))

  // ── Modal state ────────────────────────────────────────────────────────────
  const [eventModal, setEventModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    event?: AgendaEvent | null
    defaultDate?: string
    defaultTime?: string
  }>({ open: false, mode: 'create' })

  // ── KPI calculations ───────────────────────────────────────────────────────
  const weekEvents = events.filter(e => e.date >= weekStart && e.date <= weekEnd)
  const todayEvents = events.filter(e => e.date === today)
  const todayCount = todayEvents.length

  const weekHoras = weekEvents.reduce((sum, e) => {
    if (e.all_day || !e.start_time || !e.end_time) return sum
    const [sh, sm] = e.start_time.split(':').map(Number)
    const [eh, em] = e.end_time.split(':').map(Number)
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60
  }, 0)

  const weekDone = weekEvents.filter(e => e.status === 'concluido').length
  const weekConclusaoPct = weekEvents.length > 0
    ? Math.round((weekDone / weekEvents.length) * 100)
    : 0

  const proxEvento = getNextProximoEvento(events, today)

  // ── Module distribution by event type label ───────────────────────────────
  const typeHours: Record<string, { hours: number; color: string }> = {}
  for (const ev of weekEvents) {
    if (ev.all_day || !ev.start_time || !ev.end_time) continue
    const [sh, sm] = ev.start_time.split(':').map(Number)
    const [eh, em] = ev.end_time.split(':').map(Number)
    const hrs = (eh * 60 + em - (sh * 60 + sm)) / 60
    const cfg = EVENT_TYPES[ev.type]
    const key = cfg.label
    if (!typeHours[key]) typeHours[key] = { hours: 0, color: cfg.color }
    typeHours[key].hours += hrs
  }
  const maxTypeHours = Math.max(...Object.values(typeHours).map(t => t.hours), 0.01)
  const typeHoursSorted = Object.entries(typeHours).sort((a, b) => b[1].hours - a[1].hours)

  // ── Next 5 upcoming events ─────────────────────────────────────────────────
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const upcomingEvents = [...events]
    .filter(e => e.status !== 'cancelado')
    .filter(e => e.date > today || (e.date === today && (e.start_time ?? '23:59') >= nowTime))
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      return (a.start_time ?? '').localeCompare(b.start_time ?? '')
    })
    .slice(0, 5)

  // ── Mobile event data ──────────────────────────────────────────────────────
  const mobileEvents = events.map(ev => {
    const cfg = EVENT_TYPES[ev.type]
    return {
      id: ev.id,
      title: ev.title,
      date: ev.date,
      startTime: ev.start_time ?? undefined,
      endTime: ev.end_time ?? undefined,
      location: ev.location ?? undefined,
      color: cfg?.color ?? '#06b6d4',
      tags: cfg ? [{ label: cfg.label, bg: `${cfg.color}15`, color: cfg.color }] : [],
    }
  })

  const mobileEventDotColors: Record<string, string> = {}
  events.forEach(ev => {
    if (!mobileEventDotColors[ev.date]) {
      mobileEventDotColors[ev.date] = EVENT_TYPES[ev.type]?.color ?? '#06b6d4'
    }
  })

  async function handleSave(data: Parameters<typeof create>[0]) {
    if (eventModal.mode === 'create') {
      await create(data)
    } else if (eventModal.event) {
      await update(eventModal.event.id, data)
    }
  }

  return (
    <>
      {/* ─── Mobile ─────────────────────────────────────────────── */}
      <TempoMobileShell
        rightAction={
          <button
            onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
            style={{ background: '#06b6d4' }}
            aria-label="Novo evento"
          >
            <Plus size={16} />
          </button>
        }
      >
        <div className="px-4 pb-[calc(68px+16px)]">
          {/* KPI grid 2×2 */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: 'Hoje', value: String(todayCount), sub: `evento${todayCount !== 1 ? 's' : ''}`, accent: '#06b6d4' },
              { label: 'Semana', value: `${weekHoras.toFixed(1)}h`, sub: 'planejadas', accent: '#8b5cf6' },
              { label: 'Conclusão', value: `${weekConclusaoPct}%`, sub: `${weekDone}/${weekEvents.length} eventos`, accent: '#10b981' },
              { label: 'Próximo', value: proxEvento ? (proxEvento.start_time ?? 'Dia todo') : '—', sub: proxEvento?.title ?? 'sem eventos', accent: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-3 right-3 h-[2px] rounded-b" style={{ background: kpi.accent }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{kpi.label}</p>
                <p className="font-[DM_Mono] font-semibold text-[20px] leading-none text-[var(--sl-t1)] truncate">{kpi.value}</p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-1 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Próximos eventos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📋 Próximos</h2>
              <Link href="/tempo/agenda" className="text-[11px] text-[#06b6d4]">Agenda →</Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum evento próximo</p>
            ) : (
              <div className="flex flex-col">
                {upcomingEvents.slice(0, 4).map(ev => <DayTimelineItem key={ev.id} event={ev} />)}
              </div>
            )}
          </div>

          {/* Tempo por área */}
          {typeHoursSorted.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🕐 Tempo por área</h2>
              <div className="flex flex-col gap-2.5">
                {typeHoursSorted.map(([label, { hours, color }]) => (
                  <ModuleDistributionBar key={label} label={label} hours={hours} maxHours={maxTypeHours} color={color} />
                ))}
              </div>
            </div>
          )}
        </div>
      </TempoMobileShell>

      {/* ─── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-4 py-7 pb-16">

        {/* Sub-nav underline tabs */}
        <div className="flex border-b border-[var(--sl-border)] mb-5">
          {TEMPO_TABS.map(tab => (
            <Link key={tab.href} href={tab.href}
              className={cn(
                'relative px-4 py-2.5 text-[13px] transition-colors',
                pathname === tab.href
                  ? 'text-[#06b6d4] font-semibold'
                  : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
              )}>
              {tab.label}
              {tab.pro && <span className="ml-1 text-[9px] font-bold bg-[#f59e0b] text-[#03071a] px-1 py-0.5 rounded">PRO</span>}
              {pathname === tab.href && (
                <span className="absolute bottom-[-1px] left-2 right-2 h-[3px] rounded-t bg-[#06b6d4]" />
              )}
            </Link>
          ))}
        </div>

        {/* ① Topbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
            📅 Tempo
          </h1>
          <div className="flex-1" />
          <button
            onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: '#06b6d4' }}
          >
            <Plus size={15} />
            Novo Evento
          </button>
        </div>

        {/* ② JornadaInsight */}
        <JornadaInsight text={
          <span>
            Você tem <strong className="text-[#06b6d4]">{todayCount} evento{todayCount !== 1 ? 's' : ''} hoje</strong>{' '}
            e <strong className="text-[#06b6d4]">{weekEvents.length} esta semana</strong>.{' '}
            {weekConclusaoPct > 0
              ? `Taxa de conclusão: ${weekConclusaoPct}%. Continue assim! ✨`
              : 'Adicione eventos para organizar seu tempo! ✨'}
          </span>
        } />

        {/* ③ KPI Grid */}
        <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
          <KpiCard
            label="Eventos hoje"
            value={String(todayCount)}
            delta={todayCount === 0 ? 'dia livre' : `${todayCount} agendado${todayCount !== 1 ? 's' : ''}`}
            accent="#06b6d4"
          />
          <KpiCard
            label="Horas planejadas"
            value={`${weekHoras.toFixed(1)}h`}
            delta="esta semana"
            accent="#8b5cf6"
          />
          <KpiCard
            label="Conclusão semana"
            value={`${weekConclusaoPct}%`}
            delta={`${weekDone} de ${weekEvents.length} eventos`}
            deltaType={weekConclusaoPct >= 75 ? 'up' : weekConclusaoPct >= 50 ? 'warn' : 'neutral'}
            accent="#10b981"
          />
          <KpiCard
            label="Próximo evento"
            value={proxEvento ? formatTime(proxEvento.start_time ?? 'Dia todo') : '—'}
            delta={proxEvento ? proxEvento.title : 'sem próximos eventos'}
            accent="#f59e0b"
          />
        </div>

        {/* ④ Main grid */}
        <div className="grid grid-cols-[1fr_340px] gap-4 max-lg:grid-cols-1">

          {/* Left: Próximos Eventos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">
                📋 Próximos Eventos
              </h2>
              <Link
                href="/tempo/agenda"
                className="text-[11px] text-[#06b6d4] hover:underline"
              >
                Ver agenda →
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <span className="text-3xl">📭</span>
                <p className="text-[13px] text-[var(--sl-t2)] text-center">
                  Nenhum evento próximo
                </p>
                <button
                  onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
                  className="text-[12px] text-[#06b6d4] hover:underline"
                >
                  + Criar primeiro evento
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {upcomingEvents.map(ev => (
                  <DayTimelineItem key={ev.id} event={ev} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Tempo por área */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
            <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-4">
              🕐 Tempo por área esta semana
            </h2>

            {typeHoursSorted.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="text-2xl">📊</span>
                <p className="text-[12px] text-[var(--sl-t3)] text-center">
                  Nenhum evento com horário definido esta semana
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {typeHoursSorted.map(([label, { hours, color }]) => (
                  <ModuleDistributionBar
                    key={label}
                    label={label}
                    hours={hours}
                    maxHours={maxTypeHours}
                    color={color}
                  />
                ))}
              </div>
            )}

            {/* Legenda MODULE_COLORS */}
            {typeHoursSorted.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--sl-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2">
                  Tipos de evento
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                      <span className="text-[10px] text-[var(--sl-t3)]">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal */}
      <EventModal
        open={eventModal.open}
        mode={eventModal.mode}
        event={eventModal.event}
        defaultDate={eventModal.defaultDate}
        defaultTime={eventModal.defaultTime}
        goals={goalOptions}
        onClose={() => setEventModal(s => ({ ...s, open: false, event: null }))}
        onSave={handleSave}
      />
    </>
  )
}
