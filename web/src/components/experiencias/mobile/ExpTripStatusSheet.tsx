'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { EXP_PRIMARY, EXP_GRAD } from '@/lib/exp-colors'
import type { TripStatus } from '@/hooks/use-experiencias'
import { TRIP_STATUS_LABELS } from '@/hooks/use-experiencias'

interface StatusOption {
  value: TripStatus
  label: string
  icon: string
  color: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'planning',  label: 'Planejando',     icon: '🗓️', color: '#f59e0b' },
  { value: 'reserved',  label: 'Reservado',       icon: '✅', color: '#0055ff' },
  { value: 'ongoing',   label: 'Em andamento',    icon: '🔥', color: '#10b981' },
  { value: 'completed', label: 'Concluída',       icon: '🏆', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelada',       icon: '❌', color: '#f43f5e' },
]

interface ExpTripStatusSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (status: TripStatus) => void
  currentStatus: TripStatus
  tripName: string
  loading?: boolean
}

export function ExpTripStatusSheet({
  open,
  onClose,
  onSelect,
  currentStatus,
  tripName,
  loading,
}: ExpTripStatusSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<TripStatus | null>(null)
  const accent = EXP_PRIMARY

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (open) setSelected(null) }, [open])

  if (!open || !mounted) return null

  function handleConfirm() {
    if (!selected) return
    onSelect(selected)
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 99999, background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[24px] p-5 pb-8"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--sl-s3)' }} />

        <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1">
          Atualizar Missão
        </p>
        <p className="text-[12px] text-[var(--sl-t3)] mb-4">{tripName}</p>

        {/* Status options */}
        <div className="flex flex-col gap-2 mb-5">
          {STATUS_OPTIONS.map(opt => {
            const isCurrent = opt.value === currentStatus
            const isSelected = opt.value === selected
            return (
              <button
                key={opt.value}
                onClick={() => !isCurrent && setSelected(opt.value)}
                disabled={isCurrent}
                className="flex items-center gap-3 p-3 rounded-[12px] text-left transition-colors"
                style={{
                  background: isSelected
                    ? 'rgba(139,92,246,0.15)'
                    : 'var(--sl-s2)',
                  border: `1px solid ${isSelected ? accent : 'var(--sl-border)'}`,
                  opacity: isCurrent ? 0.5 : 1,
                }}
              >
                <span className="text-[20px]">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{opt.label}</p>
                  {isCurrent && (
                    <p className="text-[10px]" style={{ color: opt.color }}>Status atual</p>
                  )}
                </div>
                {isSelected && (
                  <span className="text-[16px]" style={{ color: accent }}>✓</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full rounded-[14px] h-[50px] text-[15px] font-semibold text-white mb-2"
          style={{
            background: selected ? EXP_GRAD : 'var(--sl-s3)',
            opacity: !selected || loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Salvando...' : 'Confirmar'}
        </button>
        <button onClick={onClose} className="w-full h-[40px] text-[13px] text-[var(--sl-t3)]">
          Cancelar
        </button>
      </div>
    </div>,
    document.body
  )
}
