'use client'

import { EXP_PRIMARY_BG } from '@/lib/exp-colors'

interface ExpHotelCardProps {
  emoji: string
  name: string
  location: string
  dates: string
  nights: number
  pricePerNight: string
  total?: string
  status: string
  statusType: 'confirmed' | 'pending'
}

export function ExpHotelCard({
  emoji, name, location, dates, nights, pricePerNight, total, status, statusType,
}: ExpHotelCardProps) {
  const statusStyles = statusType === 'confirmed'
    ? { bg: 'rgba(15,118,110,0.12)', color: '#0F766E' }
    : { bg: 'rgba(217,150,46,0.12)', color: '#D9962E' }

  return (
    <div className="mx-4 mb-[10px] rounded-[16px] overflow-hidden"
      style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
      {/* Emoji hero */}
      <div className="h-[80px] flex items-center justify-center text-[32px]"
        style={{ background: 'linear-gradient(135deg, var(--sl-s2), var(--sl-s3))' }}>
        {emoji}
      </div>
      {/* Info */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{name}</p>
            <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{location}</p>
          </div>
          <span className="inline-flex items-center px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
            style={{ background: statusStyles.bg, color: statusStyles.color }}>
            {status}
          </span>
        </div>
        <div className="flex gap-4 text-[12px] text-[var(--sl-t2)] mb-2">
          <span>📅 {dates}</span>
          <span>🌙 {nights} noites</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-[IBM_Plex_Mono] text-[14px] font-semibold text-[var(--sl-t1)]">{pricePerNight}/noite</p>
          {total && (
            <p className="font-[IBM_Plex_Mono] text-[13px]" style={{ color: statusType === 'confirmed' ? '#C76795' : '#D9962E' }}>
              Total: {total}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
