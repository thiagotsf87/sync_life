'use client'

import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useShellStore } from '@/stores/shell-store'

const WEEK_DAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface EventItem {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  duration?: string
  color: string
  moduleLabel?: string
  moduleBg?: string
  moduleColor?: string
  tags?: { label: string; bg: string; color: string }[]
}

interface TempoMobileProps {
  weekDays: Date[]
  selectedDay: number
  onSelectDay: (index: number) => void
  today: string
  events: EventItem[]
  onNewEvent: () => void
  onEventClick: (id: string) => void
  eventDotColors: Record<string, string> // dateStr -> color of first event
}

export function TempoMobile({
  weekDays,
  selectedDay,
  onSelectDay,
  today,
  events,
  onNewEvent,
  onEventClick,
  eventDotColors,
}: TempoMobileProps) {
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const selectedDate = weekDays[selectedDay]
  const dateLabel = selectedDate
    ? `${selectedDate.getDate()} de ${MONTH_NAMES[selectedDate.getMonth()]}, ${WEEK_DAYS_SHORT[selectedDate.getDay()].charAt(0) + WEEK_DAYS_SHORT[selectedDate.getDay()].slice(1).toLowerCase()}`
    : ''

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups: { label: string; dateStr: string; events: EventItem[] }[] = []
    const dateStr = (d: Date) => d.toISOString().split('T')[0]

    // Only show the selected day + next day
    const selected = weekDays[selectedDay]
    const nextIdx = selectedDay + 1
    const next = nextIdx < weekDays.length ? weekDays[nextIdx] : null

    const dates = [selected, next].filter(Boolean) as Date[]

    dates.forEach(d => {
      const ds = dateStr(d)
      const isToday = ds === today
      const dayLabel = isToday
        ? `Hoje, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`
        : `${WEEK_DAYS_SHORT[d.getDay()].charAt(0) + WEEK_DAYS_SHORT[d.getDay()].slice(1).toLowerCase()}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`
      const dayEvents = events.filter(e => e.date === ds)
      if (dayEvents.length > 0 || isToday) {
        groups.push({ label: dayLabel, dateStr: ds, events: dayEvents })
      }
    })

    return groups
  }, [events, weekDays, selectedDay, today])

  return (
    <div className="lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 className={`font-[Syne] text-[20px] font-bold ${isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'}`}>
            Tempo
          </h1>
          <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{dateLabel}</p>
        </div>
        <button
          onClick={onNewEvent}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Week strip */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {weekDays.map((day, i) => {
          const ds = day.toISOString().split('T')[0]
          const isToday = ds === today
          const isSelected = selectedDay === i
          const dotColor = eventDotColors[ds]

          return (
            <button
              key={i}
              onClick={() => onSelectDay(i)}
              className="flex flex-col items-center py-2.5 px-3 rounded-[14px] shrink-0 transition-all border"
              style={{
                minWidth: 46,
                background: isToday && !isSelected ? 'rgba(16,185,129,0.15)' : isSelected ? 'var(--sl-s2)' : 'var(--sl-s1)',
                borderColor: isToday ? 'rgba(16,185,129,0.4)' : isSelected ? 'var(--sl-border-h)' : 'var(--sl-border)',
              }}
            >
              <span
                className="text-[10px] font-medium mb-1"
                style={{ color: isToday ? '#10b981' : 'var(--sl-t2)' }}
              >
                {WEEK_DAYS_SHORT[day.getDay()]}
              </span>
              <span
                className="font-[DM_Mono] text-[16px] font-medium"
                style={{ color: isToday ? '#10b981' : 'var(--sl-t1)' }}
              >
                {day.getDate()}
              </span>
              <div
                className="w-[5px] h-[5px] rounded-full mt-1"
                style={{ background: dotColor ?? 'transparent' }}
              />
            </button>
          )
        })}
      </div>

      {/* Event groups */}
      {groupedEvents.map((group) => (
        <div key={group.dateStr}>
          <p className="px-5 pb-2 pt-1 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
            {group.label}
          </p>

          {group.events.length === 0 ? (
            <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-6 text-center">
              <p className="text-[12px] text-[var(--sl-t3)]">Nenhum evento hoje.</p>
            </div>
          ) : (
            group.events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onEventClick(ev.id)}
                className="mx-4 mb-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px]
                           py-3 px-3.5 flex items-start gap-3 cursor-pointer transition-colors active:bg-[var(--sl-s2)]"
              >
                {/* Time column */}
                <div className="text-right shrink-0" style={{ minWidth: 44 }}>
                  <p className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t2)]">
                    {ev.startTime ?? '—'}
                  </p>
                  {ev.endTime && (
                    <p className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t2)]">
                      {ev.endTime}
                    </p>
                  )}
                </div>

                {/* Color bar */}
                <div className="w-[3px] rounded-[2px] self-stretch shrink-0" style={{ background: ev.color }} />

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--sl-t1)]">{ev.title}</p>
                  {(ev.location || ev.duration) && (
                    <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">
                      {ev.location}{ev.location && ev.duration ? ' · ' : ''}{ev.duration}
                    </p>
                  )}
                  {/* Module tags — Jornada only */}
                  {isJornada && ev.tags && ev.tags.length > 0 && (
                    <div className="flex gap-[5px] mt-1.5">
                      {ev.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="px-2 py-[2px] rounded-[8px] text-[10px] font-medium"
                          style={{ background: tag.bg, color: tag.color }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ))}

      {/* Scroll padding for bottom bar */}
      <div className="h-6" />
    </div>
  )
}
