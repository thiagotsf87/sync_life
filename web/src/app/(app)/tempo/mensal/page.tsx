'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAgenda, getMonthRange, EVENT_TYPES, PRIORITY_COLORS, type AgendaEvent, type AgendaEventFormData } from '@/hooks/use-agenda'
import { useMetas } from '@/hooks/use-metas'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { EventModal } from '@/components/agenda/EventModal'
import { DeleteEventModal } from '@/components/agenda/DeleteEventModal'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function buildCalendarDays(currentDate: Date): { date: Date; dateString: string; isCurrentMonth: boolean }[] {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const startDay = new Date(firstDay)
  startDay.setDate(startDay.getDate() - startDay.getDay())

  const lastDay = new Date(year, month + 1, 0)
  const endDay = new Date(lastDay)
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))

  const days: { date: Date; dateString: string; isCurrentMonth: boolean }[] = []
  const cursor = new Date(startDay)

  while (cursor <= endDay) {
    days.push({
      date: new Date(cursor),
      dateString: dateStr(cursor),
      isCurrentMonth: cursor.getMonth() === month,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function formatTime(t?: string): string {
  if (!t) return ''
  return t
}

// ─── COMPONENTE CÉLULA DO CALENDÁRIO ─────────────────────────────────────────

function CalendarCell({
  day,
  events,
  isSelected,
  onClick,
}: {
  day: { date: Date; dateString: string; isCurrentMonth: boolean }
  events: AgendaEvent[]
  isSelected: boolean
  onClick: () => void
}) {
  const today = todayStr()
  const isToday = day.dateString === today
  const visibleDots = events.slice(0, 3)
  const overflow = events.length - 3

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-r border-b border-[var(--sl-border)] p-1.5 min-h-[80px] flex flex-col gap-0.5 relative cursor-pointer',
        'transition-colors',
        !day.isCurrentMonth && 'opacity-30 cursor-default',
        day.isCurrentMonth && 'hover:bg-[var(--sl-s3)]',
        isSelected && 'bg-[var(--sl-s3)] ring-1 ring-inset ring-[#06b6d4] z-[2]',
        isToday && !isSelected && 'bg-[rgba(6,182,212,0.05)]',
      )}
    >
      {/* Today bar */}
      {isToday && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#06b6d4] to-[#0055ff]" />
      )}

      <div className="flex items-start justify-between">
        <span className={cn(
          'text-[12px] font-semibold leading-none',
          isToday
            ? 'w-[22px] h-[22px] flex items-center justify-center rounded-full text-white text-[11px]'
            : 'text-[var(--sl-t2)]',
        )}
        style={isToday ? { background: '#06b6d4' } : {}}>
          {day.date.getDate()}
        </span>
      </div>

      {/* Dots de eventos */}
      <div className="flex gap-0.5 flex-wrap mt-0.5">
        {visibleDots.map(ev => (
          <div
            key={ev.id}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: EVENT_TYPES[ev.type].color }}
            title={ev.title}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[8px] text-[var(--sl-t3)] leading-none">+{overflow}</span>
        )}
      </div>

      {/* Títulos de eventos (no desktop, máx 2) */}
      {events.slice(0, 2).map(ev => (
        <span
          key={ev.id}
          className="text-[9px] font-semibold truncate leading-tight hidden sm:block"
          style={{ color: EVENT_TYPES[ev.type].color }}
        >
          {ev.title}
        </span>
      ))}
      {events.length > 2 && (
        <span className="text-[9px] text-[var(--sl-t3)] hidden sm:block">+{events.length - 2} mais</span>
      )}
    </div>
  )
}

// ─── DRAWER DE EVENTOS DO DIA ─────────────────────────────────────────────────

function DayDrawer({
  selectedDate,
  events,
  onClose,
  onNew,
  onEdit,
  onDelete,
  onToggle,
}: {
  selectedDate: string | null
  events: AgendaEvent[]
  onClose: () => void
  onNew: () => void
  onEdit: (ev: AgendaEvent) => void
  onDelete: (ev: AgendaEvent) => void
  onToggle: (ev: AgendaEvent) => void
}) {
  if (!selectedDate) return null

  const [d, m, y] = [
    parseInt(selectedDate.split('-')[2]),
    parseInt(selectedDate.split('-')[1]),
    selectedDate.split('-')[0],
  ]
  const formattedDate = `${d}/${m}/${y}`

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-4 flex flex-col gap-3">

      <div className="flex items-center justify-between">
        <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)]">
          {formattedDate}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: '#06b6d4' }}
          >
            <Plus size={12} />
            Evento
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="text-2xl">📭</span>
          <p className="text-[12px] text-[var(--sl-t3)]">Nenhum evento neste dia</p>
          <button
            onClick={onNew}
            className="text-[11px] text-[#06b6d4] hover:underline"
          >
            Adicionar evento
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map(ev => {
            const cfg = EVENT_TYPES[ev.type]
            const priorityColor = PRIORITY_COLORS[ev.priority]
            const isDone = ev.status === 'concluido'
            return (
              <div
                key={ev.id}
                className={cn(
                  'flex items-start gap-3 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s1)] border transition-all',
                  isDone ? 'opacity-60 border-[var(--sl-border)]' : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
                )}
                style={{ borderLeft: `3px solid ${priorityColor}` }}
              >
                <span className="text-lg shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[13px] font-semibold text-[var(--sl-t1)] truncate', isDone && 'line-through')}>
                    {ev.title}
                  </p>
                  <p className="text-[11px] text-[var(--sl-t3)]">
                    {ev.all_day ? 'Dia inteiro' : ev.start_time ? `${ev.start_time}${ev.end_time ? `–${ev.end_time}` : ''}` : '—'}
                    {' · '}
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggle(ev)}
                    className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all',
                      isDone ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-[var(--sl-t3)] text-transparent hover:border-[#10b981]',
                    )}
                    title={isDone ? 'Reabrir' : 'Concluir'}
                  >
                    <Check size={11} />
                  </button>
                  <button
                    onClick={() => onEdit(ev)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
                    title="Editar"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(ev)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[var(--sl-s3)] transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function AgendaMensalPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { events, create, update, remove, toggleStatus } = useAgenda({
    mode: 'month',
    referenceDate: currentDate,
  })

  const { goals } = useMetas()
  const goalOptions = goals.map(g => ({ id: g.id, name: g.name, icon: g.icon }))

  const calendarDays = buildCalendarDays(currentDate)
  const today = todayStr()

  // ── Modal state ────────────────────────────────────────────────────────────
  const [eventModal, setEventModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    event?: AgendaEvent | null
    defaultDate?: string
  }>({ open: false, mode: 'create' })

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: AgendaEvent | null }>({
    open: false,
    event: null,
  })

  // ── Navigation ─────────────────────────────────────────────────────────────
  function prevMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    setSelectedDate(null)
  }
  function nextMonth() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleDayClick(ds: string, isCurrentMonth: boolean) {
    if (!isCurrentMonth) return
    setSelectedDate(prev => prev === ds ? null : ds)
  }

  function handleNewForDate(date?: string) {
    setEventModal({ open: true, mode: 'create', defaultDate: date ?? selectedDate ?? today })
  }

  function handleEdit(ev: AgendaEvent) {
    setEventModal({ open: true, mode: 'edit', event: ev })
  }

  function handleDeleteRequest(ev: AgendaEvent) {
    setDeleteModal({ open: true, event: ev })
  }

  async function handleToggle(ev: AgendaEvent) {
    const newStatus = ev.status === 'concluido' ? 'pendente' : 'concluido'
    try {
      await toggleStatus(ev.id, newStatus)
      toast.success(newStatus === 'concluido' ? 'Evento concluído!' : 'Evento reaberto!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro')
    }
  }

  async function handleSave(data: AgendaEventFormData) {
    try {
      if (eventModal.mode === 'create') {
        await create(data)
        toast.success('Evento criado!')
        setSelectedDate(data.date)
      } else if (eventModal.event) {
        await update(eventModal.event.id, data)
        toast.success('Evento atualizado!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
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
  const { monthStart, monthEnd } = getMonthRange(currentDate)
  const monthEvents = events.filter(e => e.date >= monthStart && e.date <= monthEnd)
  const daysWithEvents = new Set(monthEvents.map(e => e.date)).size

  const typeCounts = monthEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []

  // Navigate to weekly view on day click
  function handleNavToWeek(dateStr: string) {
    router.push(`/tempo?week=${dateStr}`)
  }

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)] [.jornada_&]:text-sl-grad">
          📅 Agenda Mensal
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-semibold text-[var(--sl-t2)] px-2 min-w-[160px] text-center">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => handleNewForDate(today)}
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
          Em {MONTH_NAMES[currentDate.getMonth()]}, você tem{' '}
          <strong className="text-[#06b6d4]">{monthEvents.length} evento{monthEvents.length !== 1 ? 's' : ''}</strong>{' '}
          distribuídos em {daysWithEvents} dia{daysWithEvents !== 1 ? 's' : ''}.
          {topType && ` Categoria mais frequente: ${EVENT_TYPES[topType[0] as keyof typeof EVENT_TYPES]?.label ?? topType[0]}. ✨`}
        </span>
      } />

      {/* ③ KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Eventos no mês"
          value={String(monthEvents.length)}
          delta={`${daysWithEvents} dia${daysWithEvents !== 1 ? 's' : ''} com eventos`}
          accent="#06b6d4"
        />
        <KpiCard
          label="Tipo principal"
          value={topType ? EVENT_TYPES[topType[0] as keyof typeof EVENT_TYPES]?.label ?? '—' : '—'}
          delta={topType ? `${topType[1]} evento${topType[1] !== 1 ? 's' : ''}` : 'sem eventos'}
          accent={topType ? EVENT_TYPES[topType[0] as keyof typeof EVENT_TYPES]?.color ?? '#06b6d4' : '#06b6d4'}
        />
        <KpiCard
          label="Dias com evento"
          value={String(daysWithEvents)}
          delta={`de ${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()} dias`}
          accent="#10b981"
        />
        <KpiCard
          label="Concluídos"
          value={String(monthEvents.filter(e => e.status === 'concluido').length)}
          delta={`de ${monthEvents.length} total`}
          deltaType={monthEvents.filter(e => e.status === 'concluido').length > 0 ? 'up' : 'neutral'}
          accent="#8b5cf6"
        />
      </div>

      {/* ④ Layout: calendário + drawer */}
      <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

        {/* Calendário */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden sl-fade-up">
          {/* Headers de dias da semana */}
          <div className="grid grid-cols-7 border-b border-[var(--sl-border)]">
            {DAY_HEADERS.map(d => (
              <div key={d} className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">
                {d}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 border-l border-[var(--sl-border)]">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(e => e.date === day.dateString)
              return (
                <CalendarCell
                  key={i}
                  day={day}
                  events={dayEvents}
                  isSelected={selectedDate === day.dateString}
                  onClick={() => {
                    if (!day.isCurrentMonth) return
                    handleDayClick(day.dateString, day.isCurrentMonth)
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Drawer lateral */}
        <div className="flex flex-col gap-3">
          {selectedDate ? (
            <DayDrawer
              selectedDate={selectedDate}
              events={selectedEvents}
              onClose={() => setSelectedDate(null)}
              onNew={() => handleNewForDate(selectedDate)}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onToggle={handleToggle}
            />
          ) : (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[180px]">
              <span className="text-3xl">📅</span>
              <p className="text-[13px] text-[var(--sl-t2)] text-center">
                Clique em um dia para ver os eventos
              </p>
              <button
                onClick={() => handleNewForDate(today)}
                className="text-[12px] text-[#06b6d4] hover:underline mt-1"
              >
                + Novo evento hoje
              </button>
            </div>
          )}

          {/* Legenda */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-3">Tipos de evento</p>
            <div className="flex flex-col gap-2">
              {Object.entries(EVENT_TYPES).map(([key, cfg]) => {
                const count = typeCounts[key] ?? 0
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-[12px] text-[var(--sl-t2)] flex-1">{cfg.label}</span>
                    {count > 0 && (
                      <span className="text-[11px] font-[DM_Mono] font-semibold" style={{ color: cfg.color }}>
                        {count}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Link para semana */}
          <button
            onClick={() => router.push('/tempo')}
            className="w-full py-2.5 rounded-[10px] border border-[var(--sl-border)] text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Ver vista semanal →
          </button>
        </div>

      </div>

      {/* FAB mobile */}
      <button
        onClick={() => handleNewForDate(selectedDate ?? today)}
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
