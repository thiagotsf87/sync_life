'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAgenda, EVENT_TYPES, PRIORITY_COLORS, type AgendaEvent, type AgendaEventFormData } from '@/hooks/use-agenda'
import { useMetas } from '@/hooks/use-metas'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { EventModal } from '@/components/agenda/EventModal'
import { DeleteEventModal } from '@/components/agenda/DeleteEventModal'
import { TempoMobile } from '@/components/tempo/TempoMobile'
import { TempoMobileShell } from '@/components/tempo/TempoMobileShell'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

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

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

function formatDayTitle(d: Date): string {
  return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} · ${WEEK_DAYS[d.getDay()]}`
}

// ─── EVENT LIST ITEM ──────────────────────────────────────────────────────────

function EventListItem({
  event,
  onEdit,
  onDelete,
}: {
  event: AgendaEvent
  onEdit: (ev: AgendaEvent) => void
  onDelete: (ev: AgendaEvent) => void
}) {
  const cfg = EVENT_TYPES[event.type]
  const priorityColor = PRIORITY_COLORS[event.priority]
  const isDone = event.status === 'concluido'

  return (
    <div className={cn(
      'flex gap-3 items-start py-3 border-b border-[var(--sl-border)] last:border-0 group',
      isDone && 'opacity-60'
    )}>
      {/* Time */}
      <div className="w-16 shrink-0 text-right pt-0.5">
        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
          {event.all_day ? 'Dia todo' : (event.start_time ?? '—')}
        </span>
        {event.end_time && !event.all_day && (
          <span className="block font-[DM_Mono] text-[10px] text-[var(--sl-t3)]">
            {event.end_time}
          </span>
        )}
      </div>

      {/* Priority bar */}
      <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: priorityColor }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-semibold text-[var(--sl-t1)] truncate',
          isDone && 'line-through'
        )}>
          {event.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]"
            style={{ color: cfg.color, background: `${cfg.color}18` }}>
            {cfg.icon} {cfg.label}
          </span>
          {event.location && (
            <span className="text-[10px] text-[var(--sl-t3)] truncate">📍 {event.location}</span>
          )}
        </div>
        {event.description && (
          <p className="text-[11px] text-[var(--sl-t3)] mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(event)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors text-[11px]"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(event)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[var(--sl-s2)] transition-colors text-[11px]"
          title="Excluir"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function AgendaDiariaPage() {
  const pathname = usePathname()

  const today = todayStr()
  const now = new Date()
  const weekDays = buildWeekDays(now)
  const [selectedDay, setSelectedDay] = useState(() => now.getDay())
  const [referenceWeek, setReferenceWeek] = useState(() => now)

  const currentWeekDays = buildWeekDays(referenceWeek)

  const { events, create, update, remove } = useAgenda({
    mode: 'week',
    referenceDate: referenceWeek,
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

  // ── Selected day data ──────────────────────────────────────────────────────
  const selectedDate = currentWeekDays[selectedDay]
  const selectedDateStr = selectedDate ? dateStr(selectedDate) : today
  const selectedEvents = events
    .filter(e => e.date === selectedDateStr)
    .sort((a, b) => {
      if (a.all_day && !b.all_day) return -1
      if (!a.all_day && b.all_day) return 1
      return (a.start_time ?? '').localeCompare(b.start_time ?? '')
    })

  // Tomorrow's events
  const tomorrowDate = selectedDate ? addDays(selectedDate, 1) : addDays(now, 1)
  const tomorrowDateStr = dateStr(tomorrowDate)
  const tomorrowEvents = events
    .filter(e => e.date === tomorrowDateStr)
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handlePrevDay() {
    const newIdx = selectedDay - 1
    if (newIdx < 0) {
      // Go to previous week
      const newRef = addDays(referenceWeek, -7)
      setReferenceWeek(newRef)
      setSelectedDay(6)
    } else {
      setSelectedDay(newIdx)
    }
  }

  function handleNextDay() {
    const newIdx = selectedDay + 1
    if (newIdx > 6) {
      // Go to next week
      const newRef = addDays(referenceWeek, 7)
      setReferenceWeek(newRef)
      setSelectedDay(0)
    } else {
      setSelectedDay(newIdx)
    }
  }

  function handleGoToday() {
    setReferenceWeek(now)
    setSelectedDay(now.getDay())
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

  // Mobile event data
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

  const isSelectedToday = selectedDateStr === today

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
        <TempoMobile
          weekDays={weekDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          today={today}
          events={mobileEvents}
          onNewEvent={() => setEventModal({ open: true, mode: 'create', defaultDate: today })}
          onEventClick={(id) => {
            const ev = events.find(e => e.id === id)
            if (ev) setEventModal({ open: true, mode: 'edit', event: ev })
          }}
          eventDotColors={mobileEventDotColors}
        />
      </TempoMobileShell>

      {/* ─── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

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

        {/* ① ModuleHeader */}
        <ModuleHeader
          icon={CalendarIcon}
          iconBg="rgba(6,182,212,.1)"
          iconColor="#06b6d4"
          title="Agenda Diaria"
          subtitle="Visualize e gerencie os eventos do dia selecionado"
          weekNav={{
            label: selectedDate ? formatDayTitle(selectedDate) : '--',
            onPrev: handlePrevDay,
            onNext: handleNextDay,
          }}
        >
          {!isSelectedToday && (
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-[8px] border border-[var(--sl-border)] text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
            >
              Hoje
            </button>
          )}
          <button
            onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: selectedDateStr })}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold text-white transition-all hover:brightness-110 hover:-translate-y-px"
            style={{ background: '#06b6d4' }}
          >
            <Plus size={16} />
            Novo Evento
          </button>
        </ModuleHeader>

        {/* ② JornadaInsight */}
        <JornadaInsight text={
          <span>
            {selectedEvents.length > 0
              ? <>Você tem <strong className="text-[#06b6d4]">{selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}</strong> neste dia. Boa produtividade! ✨</>
              : <>Dia livre! Que tal planejar algo novo? ✨</>
            }
          </span>
        } />

        {/* ③ WeekStrip */}
        <div className="flex gap-1.5 mb-5">
          {currentWeekDays.map((day, i) => {
            const ds = dateStr(day)
            const isToday = ds === today
            const isSelected = i === selectedDay
            const dayEvents = events.filter(e => e.date === ds)
            const dotColors = [...new Set(dayEvents.slice(0, 3).map(e => EVENT_TYPES[e.type]?.color ?? '#06b6d4'))]
            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={cn(
                  'flex-1 flex flex-col items-center py-2.5 px-1 rounded-[14px] border transition-all',
                  isToday ? 'bg-[rgba(6,182,212,0.14)] border-[rgba(6,182,212,0.4)]' : 'bg-[var(--sl-s1)] border-[var(--sl-border)]',
                  isSelected && !isToday ? 'border-[#f59e0b]' : '',
                  !isToday && !isSelected ? 'hover:border-[var(--sl-border-h)]' : ''
                )}>
                <span className={cn('text-[10px] font-medium', isToday ? 'text-[#06b6d4]' : 'text-[var(--sl-t2)]')}>
                  {WEEK_DAYS[i]}
                </span>
                <span className={cn('font-[DM_Mono] text-[15px] font-medium', isToday ? 'text-[#06b6d4]' : 'text-[var(--sl-t1)]')}>
                  {day.getDate()}
                </span>
                <div className="flex gap-[3px] mt-1 min-h-[8px]">
                  {dotColors.map((color, di) => (
                    <div key={di} className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* ④ Event List for selected day */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 mb-4 sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
              {selectedDate ? formatDayTitle(selectedDate) : 'Hoje'}
              {isSelectedToday && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(6,182,212,0.15)] text-[#06b6d4]">Hoje</span>}
            </h2>
            <span className="text-[11px] text-[var(--sl-t3)]">
              {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <span className="text-3xl">📅</span>
              <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Dia livre!</p>
              <p className="text-[13px] text-[var(--sl-t3)] text-center">
                Sua agenda está vazia
              </p>
              <button
                onClick={() => setEventModal({ open: true, mode: 'create', defaultDate: selectedDateStr })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold text-white transition-all hover:brightness-110"
                style={{ background: '#06b6d4' }}
              >
                <Plus size={13} />
                Criar primeiro evento
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {selectedEvents.map(ev => (
                <EventListItem
                  key={ev.id}
                  event={ev}
                  onEdit={(e) => setEventModal({ open: true, mode: 'edit', event: e })}
                  onDelete={(e) => setDeleteModal({ open: true, event: e })}
                />
              ))}
            </div>
          )}
        </div>

        {/* ⑤ Tomorrow Preview */}
        {tomorrowEvents.length > 0 && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up transition-colors hover:border-[var(--sl-border-h)]" style={{ opacity: 0.75 }}>
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t2)] mb-3">
              Amanhã — {tomorrowEvents.length} evento{tomorrowEvents.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex flex-col gap-2">
              {tomorrowEvents.slice(0, 4).map(ev => {
                const cfg = EVENT_TYPES[ev.type]
                return (
                  <div key={ev.id} className="flex items-center gap-3 py-1">
                    <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-12 text-right shrink-0">
                      {ev.all_day ? '—' : (ev.start_time ?? '—')}
                    </span>
                    <div className="w-[2px] self-stretch rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-[12px] text-[var(--sl-t2)] truncate">{ev.title}</span>
                    <span className="text-[10px] font-bold ml-auto shrink-0" style={{ color: cfg.color }}>
                      {cfg.icon}
                    </span>
                  </div>
                )
              })}
              {tomorrowEvents.length > 4 && (
                <p className="text-[11px] text-[var(--sl-t3)] text-center pt-1">
                  +{tomorrowEvents.length - 4} mais eventos
                </p>
              )}
            </div>
          </div>
        )}

      </div>

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
    </>
  )
}
