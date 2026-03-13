'use client'

import { useRouter } from 'next/navigation'
import { EVENT_TYPES, type EventType } from '@/hooks/use-agenda'
import { cn } from '@/lib/utils'

interface AgendaEvent {
  id: string
  title: string
  date: string
  type: string
  start_time?: string | null
}

function getEventTypeInfo(type: string) {
  return EVENT_TYPES[type as EventType] as { label: string; icon: string; color: string } | undefined
}

interface WeekDay {
  date: Date
  isToday: boolean
  events: AgendaEvent[]
}

export interface WeekAgendaWidgetProps {
  weekDays: WeekDay[]
  events: AgendaEvent[]
  now: Date
}

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function WeekAgendaWidget({ weekDays, events, now }: WeekAgendaWidgetProps) {
  const router = useRouter()

  return (
    <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-3 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📅 Agenda da Semana</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/tempo')}>Ver agenda →</button>
      </div>
      {/* week strip */}
      <div className="flex gap-1 mb-3.5">
        {weekDays.map((wd, i) => (
          <div key={i}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 px-0.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--sl-s2)]',
              wd.isToday && 'bg-[rgba(16,185,129,0.15)]'
            )}>
            <span className="text-[9px] uppercase tracking-[0.05em] text-[var(--sl-t3)]">{DAY_NAMES[i]}</span>
            <span className={cn(
              'font-[Syne] font-bold text-[13px] w-6 h-6 rounded-full flex items-center justify-center',
              wd.isToday ? 'bg-[#10b981] text-white' : 'text-[var(--sl-t1)]'
            )}>{wd.date.getDate()}</span>
            <div className="flex gap-0.5">
              {wd.events.slice(0, 2).map((ev, j) => (
                <div key={j} className="w-1 h-1 rounded-full" style={{ background: getEventTypeInfo(ev.type)?.color ?? '#6e90b8' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* events */}
      <div className="flex flex-col">
        {events.length === 0
          ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-4">Nenhum evento esta semana</p>
          : events.slice(0, 4).map((ev, i) => {
              const typeInfo = getEventTypeInfo(ev.type)
              const evDate = new Date(ev.date + 'T12:00:00')
              const isToday = evDate.toDateString() === now.toDateString()
              const dayLabel = isToday ? 'Hoje' : DAY_NAMES[(evDate.getDay() + 6) % 7]
              return (
                <div key={ev.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5 cursor-pointer transition-colors rounded-lg hover:bg-[var(--sl-s2)]',
                    i < Math.min(events.length, 4) - 1 && 'border-b border-[var(--sl-border)]'
                  )}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeInfo?.color ?? '#6e90b8' }} />
                  <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-8 flex-shrink-0">{dayLabel}</span>
                  <span className={cn('text-[13px] flex-1 truncate', isToday ? 'text-[var(--sl-t1)] font-medium' : 'text-[var(--sl-t2)]')}>
                    {ev.title}{ev.start_time ? ` \u2014 ${ev.start_time.slice(0, 5)}` : ''}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[6px] flex-shrink-0"
                    style={{ background: `${typeInfo?.color ?? '#6e90b8'}1a`, color: typeInfo?.color ?? '#6e90b8' }}>
                    {typeInfo?.label ?? ev.type}
                  </span>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
