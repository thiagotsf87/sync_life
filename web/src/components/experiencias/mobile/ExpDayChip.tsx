'use client'

import { EXP_PRIMARY } from '@/lib/exp-colors'

interface ExpDayChipProps {
  weekday: string
  day: number
  month: string
  active: boolean
  onClick?: () => void
}

export function ExpDayChip({ weekday, day, month, active, onClick }: ExpDayChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-[3px] rounded-[12px] min-w-[48px]"
      style={
        active
          ? { background: EXP_PRIMARY, padding: '8px 10px' }
          : { background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', padding: '8px 10px' }
      }
    >
      <span className="text-[9px]" style={{ color: active ? '#fff' : 'var(--sl-t3)' }}>{weekday}</span>
      <span className="text-[16px] font-bold" style={{ color: active ? '#fff' : 'var(--sl-t2)' }}>{day}</span>
      <span className="text-[9px]" style={{ color: active ? '#fff' : 'var(--sl-t3)' }}>{month}</span>
    </button>
  )
}
