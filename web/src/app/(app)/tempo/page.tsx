'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Plus, Clock, Calendar, CheckSquare, Play, BarChart3, ChevronsRight, RefreshCw, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAgenda, EVENT_TYPES, getWeekRange, type AgendaEvent } from '@/hooks/use-agenda'
import { ModuleHeader } from '@/components/ui/module-header'
import { HeroStrip } from '@/components/ui/hero-strip'
import { HealthAIRow } from '@/components/ui/health-ai-row'
import { DonutChart, DonutLegend } from '@/components/ui/donut-chart'
import { EventModal } from '@/components/agenda/EventModal'
import { TempoMobile } from '@/components/tempo/TempoMobile'
import { TempoMobileShell } from '@/components/tempo/TempoMobileShell'
import { useMetas } from '@/hooks/use-metas'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const MODULE_COLORS: Record<string, string> = {
  Carreira: '#f43f5e',
  Corpo: '#f97316',
  Mente: '#eab308',
  Financas: '#10b981',
  Futuro: '#8b5cf6',
  Tempo: '#06b6d4',
  Experiencias: '#ec4899',
}

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

function getMonthLabel(d: Date): string {
  const months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return months[d.getMonth()]
}

function getWeekOfMonth(d: Date): number {
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  return Math.ceil((d.getDate() + first.getDay()) / 7)
}

function getTotalWeeksInMonth(d: Date): number {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  return Math.ceil((last.getDate() + first.getDay()) / 7)
}

function getDaysRemaining(d: Date): number {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.getDate() - d.getDate()
}

function calcEventDuration(ev: AgendaEvent): number {
  if (ev.all_day || !ev.start_time || !ev.end_time) return 0
  const [sh, sm] = ev.start_time.split(':').map(Number)
  const [eh, em] = ev.end_time.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}min`
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

// ─── DAY TIMELINE ITEM ────────────────────────────────────────────────────────

function DayTimelineItem({ event, isPast }: { event: AgendaEvent; isPast?: boolean }) {
  const cfg = EVENT_TYPES[event.type]
  const duration = calcEventDuration(event)
  return (
    <div
      className={cn(
        'flex gap-3.5 items-start py-3 border-b border-[rgba(120,165,220,.04)] last:border-0',
        isPast && 'opacity-45',
      )}
    >
      {/* Time */}
      <div className="w-[52px] shrink-0 text-right pt-[3px]">
        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
          {event.all_day ? 'Dia todo' : (event.start_time ?? '--')}
        </span>
      </div>
      {/* Bar */}
      <div className="w-[3px] self-stretch rounded-[3px] shrink-0 min-h-[36px]" style={{ background: cfg.color }} />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{event.title}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-lg text-[11px] font-semibold"
            style={{ color: cfg.color, background: `${cfg.color}15` }}
          >
            {cfg.icon} {cfg.label}
          </span>
          {event.start_time && event.end_time && (
            <span className="text-[10px] text-[var(--sl-t3)]">
              {event.start_time} - {event.end_time}
              {duration > 0 && ` \u00B7 ${formatDuration(duration)}`}
            </span>
          )}
          {event.location && (
            <span className="text-[10px] text-[var(--sl-t3)] truncate">\u00B7 {event.location}</span>
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

// ─── PAGINA PRINCIPAL ─────────────────────────────────────────────────────────

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

  const weekHoras = weekEvents.reduce((sum, e) => sum + calcEventDuration(e), 0)

  const weekDone = weekEvents.filter(e => e.status === 'concluido').length
  const weekPending = weekEvents.filter(e => e.status === 'pendente').length
  const weekConclusaoPct = weekEvents.length > 0
    ? Math.round((weekDone / weekEvents.length) * 100)
    : 0

  const proxEvento = getNextProximoEvento(events, today)

  // ── Compute next event duration ────────────────────────────────────────────
  const proxEventoDuration = proxEvento ? calcEventDuration(proxEvento) : 0
  const proxEventoCfg = proxEvento ? EVENT_TYPES[proxEvento.type] : null

  // ── Today events: done/pending ─────────────────────────────────────────────
  const todayDone = todayEvents.filter(e => e.status === 'concluido').length
  const todayPending = todayCount - todayDone

  // ── Module distribution by event type label ───────────────────────────────
  const typeHours: Record<string, { hours: number; color: string }> = {}
  for (const ev of weekEvents) {
    const hrs = calcEventDuration(ev)
    if (hrs <= 0) continue
    const cfg = EVENT_TYPES[ev.type]
    const key = cfg.label
    if (!typeHours[key]) typeHours[key] = { hours: 0, color: cfg.color }
    typeHours[key].hours += hrs
  }
  const maxTypeHours = Math.max(...Object.values(typeHours).map(t => t.hours), 0.01)
  const typeHoursSorted = Object.entries(typeHours).sort((a, b) => b[1].hours - a[1].hours)

  // ── Donut segments ──────────────────────────────────────────────────────────
  const donutSegments = typeHoursSorted.map(([label, { hours, color }]) => ({
    value: hours,
    color,
    label: `${label} (${hours.toFixed(1)}h)`,
  }))

  // ── Now indicator time ──────────────────────────────────────────────────────
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // ── Today's events sorted by time for timeline ─────────────────────────────
  const todayTimeline = [...todayEvents]
    .filter(e => e.status !== 'cancelado')
    .sort((a, b) => (a.start_time ?? '23:59').localeCompare(b.start_time ?? '23:59'))

  // ── Upcoming events (next 7 days) ──────────────────────────────────────────
  const upcomingEvents = [...events]
    .filter(e => e.status !== 'cancelado')
    .filter(e => e.date > today || (e.date === today && (e.start_time ?? '23:59') >= nowTime))
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      return (a.start_time ?? '').localeCompare(b.start_time ?? '')
    })
    .slice(0, 5)

  // ── Hours per day for week ─────────────────────────────────────────────────
  const dayHours = useMemo(() => {
    const result: { day: string; hours: number; date: string }[] = []
    for (const wd of weekDays) {
      const ds = dateStr(wd)
      const dayEvents = weekEvents.filter(e => e.date === ds)
      const hrs = dayEvents.reduce((s, e) => s + calcEventDuration(e), 0)
      result.push({ day: WEEK_DAYS[wd.getDay()], hours: hrs, date: ds })
    }
    return result
  }, [weekDays, weekEvents])

  const busiestDay = dayHours.reduce((max, d) => d.hours > max.hours ? d : max, dayHours[0])
  const freestDay = dayHours.reduce((min, d) => d.hours < min.hours ? d : min, dayHours[0])
  const avgHoursPerDay = weekHoras / 7

  // ── Health score (simple heuristic based on balance + conclusion) ──────────
  const healthScore = Math.min(100, Math.round(weekConclusaoPct * 0.6 + (typeHoursSorted.length >= 3 ? 30 : typeHoursSorted.length * 10) + 10))

  // ── Health pills ──────────────────────────────────────────────────────────
  const healthPills: { label: string; type: 'success' | 'warning' | 'danger' }[] = []
  if (weekConclusaoPct >= 70) healthPills.push({ label: 'Boa conclusao', type: 'success' })
  else if (weekConclusaoPct >= 40) healthPills.push({ label: `Conclusao ${weekConclusaoPct}%`, type: 'warning' })
  else healthPills.push({ label: `Conclusao ${weekConclusaoPct}%`, type: 'danger' })

  if (typeHoursSorted.length >= 4) healthPills.push({ label: 'Equilibrado', type: 'success' })
  else if (typeHoursSorted.length >= 2) healthPills.push({ label: `${typeHoursSorted.length} areas`, type: 'warning' })

  if (weekPending > 0) healthPills.push({ label: `${weekPending} pendentes`, type: weekPending > 5 ? 'danger' : 'warning' })

  // ── AI insights ────────────────────────────────────────────────────────────
  const aiInsights = useMemo(() => {
    const insights: { title: string; description: string }[] = []
    if (typeHoursSorted.length > 0) {
      const topArea = typeHoursSorted[0]
      const topPct = weekHoras > 0 ? Math.round((topArea[1].hours / weekHoras) * 100) : 0
      insights.push({
        title: 'Foco principal',
        description: `${topArea[0]} ocupa ${topPct}% do seu tempo esta semana.`,
      })
    }
    if (busiestDay && busiestDay.hours > 0) {
      insights.push({
        title: 'Dia mais cheio',
        description: `${busiestDay.day} com ${formatDuration(busiestDay.hours)} planejadas.`,
      })
    }
    return insights
  }, [typeHoursSorted, weekHoras, busiestDay])

  // ── Week nav label ─────────────────────────────────────────────────────────
  const weekNavLabel = `${getMonthLabel(now)} ${now.getFullYear()}`

  // ── Subtitle ───────────────────────────────────────────────────────────────
  const subtitle = `${getMonthLabel(now)} de ${now.getFullYear()} \u00B7 semana ${getWeekOfMonth(now)} de ${getTotalWeeksInMonth(now)} \u00B7 ${getDaysRemaining(now)} dias restantes`

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
          {/* KPI grid 2x2 */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: 'Hoje', value: String(todayCount), sub: `evento${todayCount !== 1 ? 's' : ''}`, accent: '#06b6d4' },
              { label: 'Semana', value: `${weekHoras.toFixed(1)}h`, sub: 'planejadas', accent: '#8b5cf6' },
              { label: 'Conclusao', value: `${weekConclusaoPct}%`, sub: `${weekDone}/${weekEvents.length} eventos`, accent: '#10b981' },
              { label: 'Proximo', value: proxEvento ? (proxEvento.start_time ?? 'Dia todo') : '--', sub: proxEvento?.title ?? 'sem eventos', accent: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-3 right-3 h-[2px] rounded-b" style={{ background: kpi.accent }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{kpi.label}</p>
                <p className="font-[DM_Mono] font-semibold text-[20px] leading-none text-[var(--sl-t1)] truncate">{kpi.value}</p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-1 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Proximos eventos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Proximos</h2>
              <Link href="/tempo/agenda" className="text-[11px] text-[#06b6d4]">Agenda</Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum evento proximo</p>
            ) : (
              <div className="flex flex-col">
                {upcomingEvents.slice(0, 4).map(ev => <DayTimelineItem key={ev.id} event={ev} />)}
              </div>
            )}
          </div>

          {/* Tempo por area */}
          {typeHoursSorted.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">Tempo por area</h2>
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
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* S1 ModuleHeader */}
        <ModuleHeader
          icon={Clock}
          iconBg="rgba(6,182,212,.10)"
          iconColor="#06b6d4"
          title="Tempo"
          subtitle={subtitle}
          weekNav={{
            label: weekNavLabel,
            onPrev: () => {},
            onNext: () => {},
          }}
        >
          <button
            onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold text-white transition-all hover:brightness-110 hover:-translate-y-px"
            style={{ background: '#06b6d4' }}
          >
            <Plus size={16} />
            Novo Evento
          </button>
        </ModuleHeader>

        {/* S2 HeroStrip */}
        <HeroStrip
          gradient={['#06b6d4', '#0055ff']}
          className="mb-7"
          items={[
            {
              label: 'Proximo Evento',
              value: proxEvento
                ? formatDuration(proxEventoDuration)
                : '--',
              meta: proxEvento
                ? `${proxEvento.start_time ?? 'Dia todo'}${proxEvento.location ? ` \u00B7 ${proxEvento.location}` : ''}${proxEventoCfg ? ` \u00B7 ${proxEventoCfg.label}` : ''}`
                : 'sem eventos proximos',
              icon: Play,
              color: '#06b6d4',
              featured: true,
            },
            {
              label: 'Eventos Hoje',
              value: String(todayCount),
              meta: `${todayDone} concluido${todayDone !== 1 ? 's' : ''} \u00B7 ${todayPending} pendente${todayPending !== 1 ? 's' : ''}`,
              icon: Calendar,
              color: '#10b981',
            },
            {
              label: 'Horas Planejadas',
              value: `${weekHoras.toFixed(0)}h`,
              meta: 'Esta semana',
              icon: Clock,
              color: '#a855f7',
            },
            {
              label: 'Conclusao',
              value: `${weekConclusaoPct}%`,
              meta: `${weekDone} de ${weekEvents.length} concluidos`,
              icon: CheckSquare,
              color: weekConclusaoPct >= 70 ? '#10b981' : weekConclusaoPct >= 40 ? '#f59e0b' : '#f43f5e',
            },
          ]}
        />

        {/* S3 Health + AI Row */}
        <HealthAIRow
          score={healthScore}
          title={weekConclusaoPct >= 70 ? 'Semana equilibrada' : weekConclusaoPct >= 40 ? 'Semana razoavel' : 'Semana com gaps'}
          pills={healthPills}
          insights={aiInsights}
          accentColor="#06b6d4"
          className="mb-7"
        />

        {/* S4 Bento Grid: Cronograma (1fr) + Distribuicao (380px) */}
        <div className="grid grid-cols-[1fr_380px] gap-3.5 mb-7 max-lg:grid-cols-1 sl-fade-up sl-delay-3">

          {/* Left: Cronograma do Dia */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-2 mb-[18px]">
              <Clock size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Cronograma do Dia</h2>
              <span
                className="ml-auto text-[10px] font-semibold px-2.5 py-[3px] rounded-[7px]"
                style={{ background: 'rgba(6,182,212,.08)', color: '#06b6d4' }}
              >
                {todayCount} evento{todayCount !== 1 ? 's' : ''}
              </span>
            </div>

            {todayTimeline.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <span className="text-3xl">📭</span>
                <p className="text-[13px] text-[var(--sl-t2)] text-center">Nenhum evento hoje</p>
                <button
                  onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
                  className="text-[12px] text-[#06b6d4] hover:underline"
                >
                  + Criar evento
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {todayTimeline.map((ev, idx) => {
                  const evTime = ev.start_time ?? '23:59'
                  const isPast = evTime < nowTime && ev.date === today
                  // Check if "now" indicator should appear before this event
                  const prevTime = idx > 0 ? (todayTimeline[idx - 1].end_time ?? todayTimeline[idx - 1].start_time ?? '00:00') : '00:00'
                  const showNow = !isPast && prevTime <= nowTime && evTime > nowTime

                  return (
                    <div key={ev.id}>
                      {showNow && (
                        <div className="flex items-center gap-0 my-2 ml-[66px]">
                          <div className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0 animate-pulse" />
                          <div className="flex-1 h-[1.5px] bg-[#f43f5e]" />
                          <span className="font-[DM_Mono] text-[10px] text-[#f43f5e] ml-1.5 font-medium">{nowTime} agora</span>
                        </div>
                      )}
                      <DayTimelineItem event={ev} isPast={isPast} />
                    </div>
                  )
                })}
                {/* Show "now" at end if all events are past */}
                {todayTimeline.every(ev => (ev.start_time ?? '23:59') <= nowTime) && (
                  <div className="flex items-center gap-0 my-2 ml-[66px]">
                    <div className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0 animate-pulse" />
                    <div className="flex-1 h-[1.5px] bg-[#f43f5e]" />
                    <span className="font-[DM_Mono] text-[10px] text-[#f43f5e] ml-1.5 font-medium">{nowTime} agora</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Donut + Legend */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-2 mb-[18px]">
              <BarChart3 size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Tempo por Area</h2>
              {typeHoursSorted.length > 0 && typeHoursSorted[typeHoursSorted.length - 1] && (
                <span
                  className="ml-auto text-[10px] font-semibold px-2.5 py-[3px] rounded-[7px] inline-flex items-center gap-1"
                  style={{ background: 'rgba(245,158,11,.08)', color: '#f59e0b' }}
                >
                  {typeHoursSorted[typeHoursSorted.length - 1][0]}{' '}
                  {weekHoras > 0
                    ? `${Math.round((typeHoursSorted[typeHoursSorted.length - 1][1].hours / weekHoras) * 100)}%`
                    : '0%'}
                </span>
              )}
            </div>

            {typeHoursSorted.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="text-2xl">📊</span>
                <p className="text-[12px] text-[var(--sl-t3)] text-center">
                  Nenhum evento com horario definido esta semana
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-[18px]">
                  <DonutChart
                    segments={donutSegments}
                    centerLabel={`${weekHoras.toFixed(0)}h`}
                    centerSub="SEMANA"
                    size={140}
                    strokeWidth={14}
                  />
                </div>
                <DonutLegend segments={donutSegments} />
              </>
            )}
          </div>
        </div>

        {/* S5 Bento 50/50: Horas por Dia + Proximos 7 Dias */}
        <div className="grid grid-cols-[1fr_1fr] gap-3.5 mb-7 max-lg:grid-cols-1 sl-fade-up sl-delay-4">

          {/* Horas por Dia */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-2 mb-[18px]">
              <BarChart3 size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Horas por Dia -- Esta Semana</h2>
            </div>

            {/* Simple bar visualization */}
            <div className="flex items-end gap-2 h-[120px] mb-4 px-2">
              {dayHours.map(d => {
                const maxH = Math.max(...dayHours.map(x => x.hours), 1)
                const h = Math.max((d.hours / maxH) * 100, 4)
                const isToday = d.date === today
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)]">{d.hours > 0 ? `${d.hours.toFixed(1)}h` : ''}</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-700"
                      style={{
                        height: `${h}%`,
                        background: isToday
                          ? 'linear-gradient(180deg, #06b6d4, #0055ff)'
                          : d.hours > 0
                            ? 'rgba(6,182,212,.25)'
                            : 'var(--sl-s3)',
                        minHeight: '4px',
                      }}
                    />
                    <span className={cn('text-[10px] font-semibold', isToday ? 'text-[#06b6d4]' : 'text-[var(--sl-t3)]')}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[var(--sl-s2)] rounded-[11px] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1">Dia Cheio</p>
                <p className="font-[DM_Mono] text-[16px] font-medium text-[#f43f5e]">{busiestDay?.day ?? '--'}</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{busiestDay ? formatDuration(busiestDay.hours) : '--'}</p>
              </div>
              <div className="bg-[var(--sl-s2)] rounded-[11px] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1">Dia Livre</p>
                <p className="font-[DM_Mono] text-[16px] font-medium text-[#10b981]">{freestDay?.day ?? '--'}</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{freestDay?.hours === 0 ? '0h \u00B7 livre' : formatDuration(freestDay?.hours ?? 0)}</p>
              </div>
              <div className="bg-[var(--sl-s2)] rounded-[11px] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1">Media/Dia</p>
                <p className="font-[DM_Mono] text-[16px] font-medium text-[#06b6d4]">{avgHoursPerDay.toFixed(1)}h</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{weekHoras.toFixed(0)}h / 7</p>
              </div>
              <div className="bg-[var(--sl-s2)] rounded-[11px] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1">Conclusao</p>
                <p className="font-[DM_Mono] text-[16px] font-medium text-[#a855f7]">{weekConclusaoPct}%</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{weekDone} de {weekEvents.length}</p>
              </div>
            </div>
          </div>

          {/* Proximos 7 Dias */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-2 mb-[18px]">
              <ChevronsRight size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Proximos 7 Dias</h2>
              <Link href="/tempo/agenda" className="ml-auto text-[12px] font-medium text-[#06b6d4] hover:underline">
                Ver agenda
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <span className="text-2xl">📭</span>
                <p className="text-[12px] text-[var(--sl-t3)] text-center">Nenhum evento proximo</p>
                <button
                  onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
                  className="text-[12px] text-[#06b6d4] hover:underline"
                >
                  + Criar evento
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {upcomingEvents.map((ev) => {
                  const cfg = EVENT_TYPES[ev.type]
                  const dur = calcEventDuration(ev)
                  const evDate = new Date(ev.date + 'T12:00:00')
                  const dayName = WEEK_DAYS[evDate.getDay()]
                  const dayNum = evDate.getDate()
                  const monthNum = String(evDate.getMonth() + 1).padStart(2, '0')
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 py-[11px] border-b border-[rgba(120,165,220,.04)] last:border-0"
                    >
                      <div
                        className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
                        style={{ background: `${cfg.color}12` }}
                      >
                        <span className="text-sm">{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{ev.title}</p>
                        <p className="text-[11px] text-[var(--sl-t3)]">
                          {dayName}, {dayNum}/{monthNum} {ev.start_time ? `\u00B7 ${ev.start_time}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-[DM_Mono] text-[13.5px] font-medium" style={{ color: cfg.color }}>
                          {dur > 0 ? formatDuration(dur) : (ev.all_day ? 'Dia' : '--')}
                        </p>
                        <p className="text-[10px] text-[var(--sl-t3)]">{cfg.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* S6 Tendencia Semanal (full width) */}
        <div className="sl-fade-up sl-delay-5 mb-7">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-2 mb-[18px]">
              <TrendingUp size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Resumo da Semana</h2>
              <Link href="/tempo/review" className="ml-auto text-[12px] font-medium text-[#06b6d4] hover:underline">
                Ver review
              </Link>
            </div>

            {/* Summary strip */}
            <div className="bg-[var(--sl-s2)] rounded-[13px] p-[18px_20px] mb-4 flex items-center gap-5 flex-wrap">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">Horas Semana Atual</p>
                <p className="font-[DM_Mono] text-[26px] font-medium mt-1 leading-none text-[var(--sl-t1)]">
                  {weekHoras.toFixed(1)}<span className="text-[14px] text-[var(--sl-t2)]">h</span>
                </p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-[3px]">
                  {now.getDate()} de {getMonthLabel(now).toLowerCase()} de {now.getFullYear()} \u00B7 {weekDone} concluidos
                </p>
              </div>
              <div className="ml-auto flex gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-[3px]">Conclusao</p>
                  <p className="font-[DM_Mono] text-[15px]" style={{ color: weekConclusaoPct >= 70 ? '#10b981' : '#f59e0b' }}>
                    {weekConclusaoPct}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-[3px]">Pendentes</p>
                  <p className="font-[DM_Mono] text-[15px] text-[#f43f5e]">{weekPending}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-[3px]">Areas</p>
                  <p className="font-[DM_Mono] text-[15px] text-[#06b6d4]">{typeHoursSorted.length}</p>
                </div>
              </div>
            </div>

            {/* Day trend cells */}
            <div className="flex gap-0">
              {dayHours.map((d, idx) => {
                const isFirst = idx === 0
                const isLast = idx === dayHours.length - 1
                const isCurrentDay = d.date === today
                const isBusiest = d === busiestDay && d.hours > 0
                const isFreest = d === freestDay
                return (
                  <div
                    key={d.day}
                    className={cn(
                      'flex-1 text-center py-4 px-2.5 border border-[var(--sl-border)] border-r-0',
                      isFirst && 'rounded-l-[14px]',
                      isLast && 'rounded-r-[14px] border-r',
                      isBusiest && 'border-[rgba(244,63,94,.25)] bg-[rgba(244,63,94,.02)]',
                      isFreest && d.hours === 0 && 'border-[rgba(16,185,129,.25)] bg-[rgba(16,185,129,.02)]',
                    )}
                  >
                    <p className="text-[10px] font-semibold text-[var(--sl-t3)] uppercase tracking-[.06em]">{d.day}</p>
                    <p
                      className="font-[DM_Mono] text-[18px] font-medium mt-[5px]"
                      style={{
                        color: isBusiest ? '#f43f5e' : (isFreest && d.hours === 0) ? '#10b981' : isCurrentDay ? '#06b6d4' : 'var(--sl-t1)',
                      }}
                    >
                      {d.hours > 0 ? `${d.hours.toFixed(1)}h` : '0h'}
                    </p>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">
                      {isCurrentDay ? 'atual' : isBusiest ? 'cheio' : (isFreest && d.hours === 0) ? 'livre' : ''}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Trend note */}
            {weekHoras > 0 && (
              <div className="mt-3 py-2 px-3.5 rounded-[9px] border text-[11px] text-[var(--sl-t2)]"
                style={{
                  background: 'rgba(6,182,212,.03)',
                  borderColor: 'rgba(6,182,212,.08)',
                }}>
                <TrendingUp size={11} className="inline -mt-px mr-1 text-[#06b6d4]" />
                <b className="text-[#06b6d4]">Semana ativa.</b>{' '}
                {weekHoras.toFixed(1)}h planejadas em {typeHoursSorted.length} area{typeHoursSorted.length !== 1 ? 's' : ''} diferentes.
                {weekConclusaoPct >= 70 ? ' Otima taxa de conclusao!' : weekConclusaoPct >= 40 ? ' Continue focando nas pendencias.' : ' Revise suas prioridades.'}
              </div>
            )}
          </div>
        </div>

        {/* S7 Recorrentes */}
        {weekEvents.filter(e => e.recurrence).length > 0 && (
          <div className="sl-fade-up sl-delay-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={16} className="text-[#06b6d4]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Eventos Recorrentes</h2>
              <span className="ml-auto text-[12px] font-medium text-[#06b6d4] cursor-pointer hover:underline">Ver todos</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weekEvents
                .filter(e => e.recurrence)
                .filter((e, i, arr) => arr.findIndex(x => x.title === e.title) === i)
                .slice(0, 6)
                .map(ev => {
                  const cfg = EVENT_TYPES[ev.type]
                  return (
                    <div
                      key={ev.id}
                      className="min-w-[185px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-4 shrink-0 transition-colors hover:border-[var(--sl-border-h)]"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <div
                          className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center"
                          style={{ background: `${cfg.color}15` }}
                        >
                          <span className="text-xs">{cfg.icon}</span>
                        </div>
                        <span className="ml-auto text-[10px] font-semibold px-2 py-[2px] rounded-md bg-[var(--sl-s3)] text-[var(--sl-t3)]">
                          {ev.recurrence}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-[var(--sl-t1)]">{ev.title}</p>
                      <p className="text-[12px] text-[var(--sl-t3)] mt-[3px]">
                        {ev.start_time ?? 'Dia todo'}
                        {ev.start_time && ev.end_time ? ` \u00B7 ${formatDuration(calcEventDuration(ev))}` : ''}
                      </p>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

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
