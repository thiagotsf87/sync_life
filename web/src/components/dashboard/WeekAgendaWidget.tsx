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
    <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-3 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Agenda da Semana
        </span>
        <button className="text-[12px] font-medium text-[#6366f1] hover:opacity-70 transition-opacity cursor-pointer"
          onClick={() => router.push('/tempo')}>Mar 10-16</button>
      </div>
      {/* week strip - prototype grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-3.5">
        {weekDays.map((wd, i) => {
          const hasEvents = wd.events.length > 0
          const dotColor = wd.isToday ? '#6366f1' : hasEvents ? (getEventTypeInfo(wd.events[0].type)?.color ?? '#06b6d4') : undefined
          return (
            <div key={i}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-1 rounded-[10px] cursor-pointer transition-colors',
                wd.isToday && 'bg-[rgba(99,102,241,.08)] border border-[rgba(99,102,241,.2)]'
              )}>
              <span className={cn('text-[10px] font-semibold', wd.isToday ? 'text-[#6366f1]' : 'text-[var(--sl-t3)]')}>{DAY_NAMES[i]}</span>
              <div
                className="w-2 h-2 rounded-full mb-1"
                style={{
                  background: dotColor ?? 'var(--sl-s3)',
                  boxShadow: wd.isToday && dotColor ? `0 0 8px rgba(99,102,241,.4)` : undefined,
                }}
              />
              <span className={cn('font-[DM_Mono] text-[11px]', wd.isToday ? 'text-[#6366f1]' : hasEvents ? 'text-[var(--sl-t2)]' : 'text-[var(--sl-t3)]')}>
                {hasEvents ? wd.events.length : '\u2014'}
              </span>
            </div>
          )
        })}
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
