'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAgenda, getWeekRange, EVENT_TYPES, PRIORITY_COLORS, type AgendaEvent, type AgendaEventFormData } from '@/hooks/use-agenda'
import { useMetas } from '@/hooks/use-metas'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { EventModal } from '@/components/agenda/EventModal'
import { DeleteEventModal } from '@/components/agenda/DeleteEventModal'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 60
const START_HOUR = 6
const END_HOUR = 22
const TOTAL_HOURS = END_HOUR - START_HOUR

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getEventPosition(event: AgendaEvent): { top: number; height: number } {
  const [sh, sm] = (event.start_time ?? '08:00').split(':').map(Number)
  const [eh, em] = (event.end_time ?? `${sh + 1}:00`).split(':').map(Number)
  const top = ((sh - START_HOUR) * 60 + sm) * (HOUR_HEIGHT / 60)
  const height = Math.max(((eh - sh) * 60 + (em - sm)) * (HOUR_HEIGHT / 60), 24)
  return { top, height }
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

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDateRange(days: Date[]): string {
  if (!days.length) return ''
  const start = days[0]
  const end = days[6]
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} de ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`
  }
  return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
}

// ─── LAYOUT DE CONFLITOS ──────────────────────────────────────────────────────

interface EventWithLayout extends AgendaEvent {
  column: number
  totalColumns: number
}

function layoutEvents(events: AgendaEvent[]): EventWithLayout[] {
  const sorted = [...events].sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  const result: EventWithLayout[] = sorted.map(ev => ({ ...ev, column: 0, totalColumns: 1 }))

  for (let i = 0; i < result.length; i++) {
    const ev = result[i]
    const [sh, sm] = (ev.start_time ?? '08:00').split(':').map(Number)
    const [eh, em] = (ev.end_time ?? `${sh + 1}:00`).split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em

    const overlapping = result.filter((other, j) => {
      if (j === i) return false
      const [osh, osm] = (other.start_time ?? '08:00').split(':').map(Number)
      const [oeh, oem] = (other.end_time ?? `${osh + 1}:00`).split(':').map(Number)
      const oStart = osh * 60 + osm
      const oEnd = oeh * 60 + oem
      return startMin < oEnd && endMin > oStart
    })

    ev.totalColumns = overlapping.length + 1
    const usedCols = new Set(overlapping.map(o => o.column))
    let col = 0
    while (usedCols.has(col)) col++
    ev.column = col
  }

  return result
}

// ─── EVENT CHIP ───────────────────────────────────────────────────────────────

function EventChip({ event, onClick }: { event: EventWithLayout; onClick: (e: React.MouseEvent) => void }) {
  const { top, height } = getEventPosition(event)
  const cfg = EVENT_TYPES[event.type]
  const widthPct = 100 / event.totalColumns
  const leftPct = event.column * widthPct
  const priorityColor = PRIORITY_COLORS[event.priority]
  const isDone = event.status === 'concluido'

  return (
    <div
      onClick={onClick}
      className="absolute rounded-[6px] cursor-pointer transition-all hover:brightness-110 hover:z-10 overflow-hidden"
      style={{
        top: top + 1,
        height: height - 2,
        left: `calc(${leftPct}% + 1px)`,
        width: `calc(${widthPct}% - 2px)`,
        background: `${cfg.color}20`,
        borderLeft: `3px solid ${priorityColor}`,
        opacity: isDone ? 0.5 : 1,
      }}
    >
      <div className="flex flex-col h-full px-1.5 py-1 overflow-hidden">
        <span className="text-[10px] font-bold leading-tight truncate" style={{ color: cfg.color }}>
          {event.title}
        </span>
        {height > 30 && event.start_time && (
          <span className="text-[9px] opacity-70 leading-tight font-[DM_Mono]" style={{ color: cfg.color }}>
            {event.start_time}{event.end_time ? `–${event.end_time}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── ALL DAY CHIP ─────────────────────────────────────────────────────────────

function AllDayChip({ event, onClick }: { event: AgendaEvent; onClick: (e: React.MouseEvent) => void }) {
  const cfg = EVENT_TYPES[event.type]
  return (
    <div
      onClick={onClick}
      className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold cursor-pointer truncate transition-all hover:brightness-110"
      style={{ background: `${cfg.color}25`, color: cfg.color }}
    >
      {event.title}
    </div>
  )
}

// ─── COLUNA DO DIA ────────────────────────────────────────────────────────────

function DayColumn({
  day,
  events,
  isToday,
  nowTop,
  onSlotClick,
  onEventClick,
}: {
  day: Date
  events: AgendaEvent[]
  isToday: boolean
  nowTop: number
  onSlotClick: (day: Date, hour: number) => void
  onEventClick: (ev: AgendaEvent, e: React.MouseEvent) => void
}) {
  const timedEvents = events.filter(e => !e.all_day)
  const laidOut = layoutEvents(timedEvents)

  return (
    <div
      className="relative flex-1 border-l border-[var(--sl-border)]"
      style={isToday ? { background: 'rgba(6,182,212,0.015)' } : {}}
    >
      {/* Linhas de grade */}
      {Array.from({ length: TOTAL_HOURS * 2 }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t"
          style={{
            top: i * (HOUR_HEIGHT / 2),
            borderColor: i % 2 === 0 ? 'var(--sl-border)' : 'rgba(128,128,128,0.06)',
          }}
        />
      ))}

      {/* Slots clicáveis */}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 hover:bg-[rgba(6,182,212,0.04)] cursor-pointer transition-colors"
          style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
          onClick={() => onSlotClick(day, START_HOUR + i)}
        />
      ))}

      {/* Linha de hora atual */}
      {isToday && nowTop >= 0 && nowTop <= TOTAL_HOURS * HOUR_HEIGHT && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
          style={{ top: nowTop }}
        >
          <div className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0 -ml-1" />
          <div className="flex-1 h-[1.5px] bg-[#f43f5e]" />
        </div>
      )}

      {/* Eventos */}
      {laidOut.map(ev => (
        <EventChip
          key={ev.id}
          event={ev}
          onClick={e => onEventClick(ev, e)}
        />
      ))}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function AgendaSemanalPage() {
  const searchParams = useSearchParams()

  const [referenceDate, setReferenceDate] = useState(() => {
    const weekParam = searchParams.get('week')
    if (weekParam) {
      const d = new Date(weekParam + 'T12:00:00')
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })

  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay())

  const weekDays = buildWeekDays(referenceDate)
  const { weekStart, weekEnd } = getWeekRange(referenceDate)
  const today = todayStr()

  const { events, loading, create, update, remove, toggleStatus } = useAgenda({
    mode: 'week',
    referenceDate,
  })

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

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: AgendaEvent | null }>({
    open: false,
    event: null,
  })

  // ── URL param: ?new=1 ──────────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEventModal({ open: true, mode: 'create', defaultDate: today })
    }
  }, [searchParams, today])

  // ── Hora atual ─────────────────────────────────────────────────────────────
  const [nowTop, setNowTop] = useState(() => {
    const now = new Date()
    return ((now.getHours() - START_HOUR) * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60)
  })
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function computeNow() {
      const now = new Date()
      const top = ((now.getHours() - START_HOUR) * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60)
      setNowTop(Math.max(0, Math.min(top, TOTAL_HOURS * HOUR_HEIGHT)))
    }
    computeNow()
    const interval = setInterval(computeNow, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Scroll para hora atual no mount
  useEffect(() => {
    if (gridRef.current && nowTop > 0) {
      gridRef.current.scrollTop = Math.max(0, nowTop - 200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Navegação ──────────────────────────────────────────────────────────────
  function prevWeek() {
    setReferenceDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextWeek() {
    setReferenceDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }
  function goToday() {
    setReferenceDate(new Date())
    setSelectedDay(new Date().getDay())
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleSlotClick(day: Date, hour: number) {
    const hStr = String(hour).padStart(2, '0')
    setEventModal({ open: true, mode: 'create', defaultDate: dateStr(day), defaultTime: `${hStr}:00` })
  }

  function handleEventClick(ev: AgendaEvent, e: React.MouseEvent) {
    e.stopPropagation()
    setEventModal({ open: true, mode: 'edit', event: ev })
  }

  async function handleSave(data: AgendaEventFormData) {
    try {
      if (eventModal.mode === 'create') {
        await create(data)
        toast.success('Evento criado!')
      } else if (eventModal.event) {
        await update(eventModal.event.id, data)
        toast.success('Evento atualizado!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar evento')
      throw err
    }
  }

  async function handleDelete() {
    if (!deleteModal.event) return
    try {
      await remove(deleteModal.event.id)
      toast.success('Evento excluído!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
      throw err
    }
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const weekEvents = events.filter(e => e.date >= weekStart && e.date <= weekEnd)
  const done = weekEvents.filter(e => e.status === 'concluido').length
  const pending = weekEvents.filter(e => e.status === 'pendente').length
  const totalHoras = weekEvents.reduce((sum, e) => {
    if (e.all_day || !e.start_time || !e.end_time) return sum
    const [sh, sm] = e.start_time.split(':').map(Number)
    const [eh, em] = e.end_time.split(':').map(Number)
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60
  }, 0)

  const isCurrentWeek = weekDays.some(d => dateStr(d) === today)
  const hasAllDay = events.some(e => e.all_day)

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)] [.jornada_&]:text-sl-grad">
          📅 Agenda Semanal
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={prevWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-semibold text-[var(--sl-t2)] px-2 min-w-[200px] text-center">
            {formatDateRange(weekDays)}
          </span>
          <button
            onClick={nextWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex-1" />
        {!isCurrentWeek && (
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-[8px] border border-[var(--sl-border)] text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Hoje
          </button>
        )}
        <button
          onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110"
          style={{ background: '#06b6d4' }}
        >
          <Plus size={15} />
          <span className="max-sm:hidden">Novo Evento</span>
        </button>
      </div>

      {/* ② JornadaInsight */}
      <JornadaInsight text={
        <span>
          Você tem <strong className="text-[#06b6d4]">{pending} evento{pending !== 1 ? 's' : ''} pendente{pending !== 1 ? 's' : ''}</strong> esta semana.
          {done > 0 ? ` Já concluiu ${done}.` : ''}{' '}
          Continue mantendo sua agenda organizada! ✨
        </span>
      } />

      {/* ③ KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Esta semana"
          value={String(weekEvents.length)}
          delta={weekEvents.length === 0 ? 'nenhum evento' : `${weekEvents.length} evento${weekEvents.length !== 1 ? 's' : ''}`}
          accent="#06b6d4"
        />
        <KpiCard
          label="Concluídos"
          value={String(done)}
          delta={weekEvents.length > 0 ? `${Math.round((done / weekEvents.length) * 100)}% de conclusão` : '—'}
          deltaType={done > 0 ? 'up' : 'neutral'}
          accent="#10b981"
        />
        <KpiCard
          label="Em aberto"
          value={String(pending)}
          delta={pending === 0 ? 'tudo em dia!' : 'pendentes'}
          deltaType={pending === 0 ? 'up' : 'warn'}
          accent="#f59e0b"
        />
        <KpiCard
          label="Horas agendadas"
          value={`${totalHoras.toFixed(1)}h`}
          delta="esta semana"
          accent="#8b5cf6"
        />
      </div>

      {/* ④ Time Grid */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden sl-fade-up">

        {/* Mobile: chips de navegação entre dias */}
        <div className="md:hidden flex gap-1 px-3 py-2 border-b border-[var(--sl-border)] overflow-x-auto">
          {weekDays.map((day, i) => {
            const ds = dateStr(day)
            const isToday = ds === today
            const count = events.filter(e => e.date === ds).length
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[8px] min-w-[44px] transition-all shrink-0',
                  selectedDay === i
                    ? 'text-white'
                    : isToday
                    ? 'text-[#06b6d4] bg-[rgba(6,182,212,0.1)]'
                    : 'text-[var(--sl-t2)] hover:bg-[var(--sl-s2)]',
                )}
                style={selectedDay === i ? { background: '#06b6d4' } : {}}
              >
                <span className="text-[9px] font-bold uppercase">{WEEK_DAYS[i]}</span>
                <span className="text-[14px] font-bold leading-none">{day.getDate()}</span>
                {count > 0 && <div className="w-1 h-1 rounded-full bg-current opacity-60" />}
              </button>
            )
          })}
        </div>

        {/* Desktop: header de colunas */}
        <div className="hidden md:flex border-b border-[var(--sl-border)]">
          <div className="w-12 shrink-0" />
          {weekDays.map((day, i) => {
            const ds = dateStr(day)
            const isToday = ds === today
            return (
              <div key={i} className="flex-1 flex flex-col items-center py-2.5 border-l border-[var(--sl-border)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">{WEEK_DAYS[i]}</span>
                <span
                  className={cn(
                    'text-[17px] font-bold leading-none mt-0.5',
                    isToday ? 'w-8 h-8 flex items-center justify-center rounded-full text-white' : 'text-[var(--sl-t1)]',
                  )}
                  style={isToday ? { background: '#06b6d4' } : {}}
                >
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* All-day row */}
        {hasAllDay && (
          <div className="hidden md:flex border-b border-[var(--sl-border)] min-h-[26px]">
            <div className="w-12 shrink-0 flex items-center justify-center">
              <span className="text-[8px] text-[var(--sl-t3)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                INTEIRO
              </span>
            </div>
            {weekDays.map((day, i) => {
              const dayAllDay = events.filter(e => e.date === dateStr(day) && e.all_day)
              return (
                <div key={i} className="flex-1 border-l border-[var(--sl-border)] px-0.5 py-0.5 flex flex-col gap-0.5">
                  {dayAllDay.map(ev => (
                    <AllDayChip
                      key={ev.id}
                      event={ev}
                      onClick={e => handleEventClick(ev, e)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* Grid body */}
        <div ref={gridRef} className="overflow-y-auto" style={{ maxHeight: 640 }}>
          <div className="flex" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>

            {/* Labels de hora */}
            <div className="w-12 shrink-0 relative">
              {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                <div
                  key={i}
                  className="absolute right-1.5 text-[9px] text-[var(--sl-t3)] font-[DM_Mono] leading-none"
                  style={{ top: i * HOUR_HEIGHT - 6 }}
                >
                  {String(START_HOUR + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Desktop: 7 colunas */}
            <div className="hidden md:flex flex-1">
              {weekDays.map((day, i) => (
                <DayColumn
                  key={i}
                  day={day}
                  events={events.filter(e => e.date === dateStr(day))}
                  isToday={dateStr(day) === today}
                  nowTop={nowTop}
                  onSlotClick={handleSlotClick}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>

            {/* Mobile: coluna do dia selecionado */}
            <div className="md:hidden flex flex-1">
              {weekDays[selectedDay] && (
                <DayColumn
                  day={weekDays[selectedDay]}
                  events={events.filter(e => e.date === dateStr(weekDays[selectedDay]))}
                  isToday={dateStr(weekDays[selectedDay]) === today}
                  nowTop={nowTop}
                  onSlotClick={handleSlotClick}
                  onEventClick={handleEventClick}
                />
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Legenda de tipos */}
      <div className="flex gap-4 flex-wrap mt-3 px-1">
        {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
            <span className="text-[11px] text-[var(--sl-t3)]">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => setEventModal({
          open: true,
          mode: 'create',
          defaultDate: weekDays[selectedDay] ? dateStr(weekDays[selectedDay]) : today,
        })}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white z-30 transition-all hover:brightness-110"
        style={{ background: '#06b6d4' }}
      >
        <Plus size={22} />
      </button>

      {/* Modais */}
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
      <DeleteEventModal
        open={deleteModal.open}
        event={deleteModal.event}
        onClose={() => setDeleteModal({ open: false, event: null })}
        onConfirm={handleDelete}
      />

    </div>
  )
}
