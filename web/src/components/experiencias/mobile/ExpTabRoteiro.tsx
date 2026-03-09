'use client'

import { useState } from 'react'
import { EXP_PRIMARY_LIGHT, EXP_PRIMARY_BORDER, EXP_GRAD } from '@/lib/exp-colors'
import { ExpDayChip } from './ExpDayChip'
import { ExpCoachCard } from './ExpCoachCard'

interface ItineraryItem {
  time: string
  title: string
  subtitle: string
  isPast?: boolean
  xpAmount?: number
}

interface DayData {
  weekday: string
  day: number
  month: string
  title: string
  subtitle: string
  cost: string
  items: ItineraryItem[]
}

interface ExpTabRoteiroProps {
  days: DayData[]
}

// Mock data
const MOCK_DAYS: DayData[] = [
  {
    weekday: 'SEX', day: 10, month: 'JUL',
    title: 'Dia 1 — Sexta, 10 Jul', subtitle: 'Chegada em Tóquio · Shinjuku', cost: '¥ 12.400',
    items: [
      { time: '08:00', title: '✈️ Voo GRU → NRT', subtitle: 'ANA Airlines · 23h de voo', isPast: true, xpAmount: 5 },
      { time: '15:00', title: '🏨 Check-in Hotel Shinjuku', subtitle: 'Gracery Hotel · ¥ 8.200/noite', xpAmount: 5 },
      { time: '17:00', title: '🏙️ Explorar Shinjuku', subtitle: 'Kabukicho · Mirante Metropolitan', xpAmount: 10 },
      { time: '19:30', title: '🍜 Jantar — Ramen Ichiran', subtitle: 'Famoso ramen solo · ¥ 1.200', xpAmount: 10 },
      { time: '21:00', title: '🌃 Golden Gai', subtitle: 'Rua de bares históricos', xpAmount: 10 },
    ],
  },
  { weekday: 'SÁB', day: 11, month: 'JUL', title: 'Dia 2 — Sábado, 11 Jul', subtitle: 'Tóquio — Akihabara · Asakusa', cost: '¥ 8.200', items: [] },
  { weekday: 'DOM', day: 12, month: 'JUL', title: 'Dia 3 — Domingo, 12 Jul', subtitle: 'Tóquio — Shibuya · Harajuku', cost: '¥ 6.500', items: [] },
  { weekday: 'SEG', day: 13, month: 'JUL', title: 'Dia 4 — Segunda, 13 Jul', subtitle: 'Tóquio — Ginza · Tsukiji', cost: '¥ 9.800', items: [] },
  { weekday: 'TER', day: 14, month: 'JUL', title: 'Dia 5 — Terça, 14 Jul', subtitle: 'Viagem para Kyoto', cost: '¥ 18.000', items: [] },
]

export function ExpTabRoteiro({ days: propDays }: ExpTabRoteiroProps) {
  const allDays = propDays.length > 0 ? propDays : MOCK_DAYS
  const [activeDay, setActiveDay] = useState(0)
  const day = allDays[activeDay]

  return (
    <div className="pt-3">
      {/* Level badge */}
      <div className="mx-4 mb-[10px] flex items-center justify-between px-[13px] py-2 rounded-[12px]"
        style={{ background: 'var(--sl-s1)', border: `1px solid ${EXP_PRIMARY_BORDER}` }}>
        <div className="flex items-center gap-2">
          <span className="font-[Syne] text-[10px] font-extrabold text-white rounded-lg px-2 py-[2px]"
            style={{ background: EXP_GRAD }}>Nível 4</span>
          <span className="text-[11px] text-[var(--sl-t2)]">Explorador Audacioso</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: EXP_PRIMARY_LIGHT }}>+40 XP hoje</span>
      </div>

      {/* Day chips */}
      <div className="flex gap-[6px] px-4 pb-3 overflow-x-auto scrollbar-hide">
        {allDays.map((d, i) => (
          <ExpDayChip
            key={i}
            weekday={d.weekday}
            day={d.day}
            month={d.month}
            active={i === activeDay}
            onClick={() => setActiveDay(i)}
          />
        ))}
      </div>

      {/* Day header */}
      {day && (
        <>
          <div className="px-5 pb-3 flex justify-between items-center">
            <div>
              <p className="text-[16px] font-bold text-[var(--sl-t1)]">
                {day.title.split('—')[0]}— Chegada! 🛬
              </p>
              <p className="text-[12px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                {day.subtitle}
              </p>
            </div>
            <div className="text-right">
              <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">{day.cost}</p>
              <p className="text-[10px] font-bold" style={{ color: EXP_PRIMARY_LIGHT }}>+40 XP disponíveis</p>
            </div>
          </div>

          {/* Timeline */}
          {day.items.map((item, i) => (
            <div key={i} className="flex gap-3 px-5 py-2">
              <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-[42px] shrink-0 pt-[2px]">
                {item.time}
              </span>
              <div
                className="flex-1 rounded-[0_10px_10px_0] p-[8px_10px]"
                style={{
                  background: 'var(--sl-s1)',
                  borderLeft: `3px solid ${
                    item.isPast ? 'rgba(139,92,246,0.35)' : '#8b5cf6'
                  }`,
                }}
              >
                <p className="text-[13px] font-medium text-[var(--sl-t1)]">{item.title}</p>
                <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{item.subtitle}</p>
                {item.xpAmount && (
                  <p className="text-[10px] font-bold mt-[3px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                    ⚡ +{item.xpAmount} XP{item.isPast ? ' — chegou ao Japão!' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Coach card */}
          <div className="mt-2">
            <ExpCoachCard
              label="Coach Sync — Dia 1 🛬"
              message={<>Jet lag de 12h é real. Plano <strong>perfeito</strong> — leve e focado. <strong>Dorme às 22h</strong> e no Dia 2 vai sentir a diferença.</>}
              cta="Ver Dia 2"
              onCtaClick={() => setActiveDay(Math.min(activeDay + 1, allDays.length - 1))}
            />
          </div>
        </>
      )}
    </div>
  )
}
