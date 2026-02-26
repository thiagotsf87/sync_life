'use client'

import { useState } from 'react'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { EVENT_TYPES, type AgendaEvent } from '@/hooks/use-agenda'

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

interface DeleteEventModalProps {
  open: boolean
  event: AgendaEvent | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteEventModal({ open, event, onClose, onConfirm }: DeleteEventModalProps) {
  const [deleting, setDeleting] = useState(false)

  if (!open || !event) return null

  const cfg = EVENT_TYPES[event.type]

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[400px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(244,63,94,.12)]">
              <AlertTriangle size={16} className="text-[#f43f5e]" />
            </div>
            <h2 className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)]">Excluir evento</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-[13px] text-[var(--sl-t2)] mb-4 leading-relaxed">
            Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
          </p>

          <div className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
              style={{ background: `${cfg.color}18` }}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{event.title}</p>
              <p className="text-[11px] text-[var(--sl-t3)]">
                {formatDate(event.date)}
                {!event.all_day && event.start_time && ` · ${event.start_time}`}
                {!event.all_day && event.start_time && event.end_time && `–${event.end_time}`}
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: cfg.color, background: `${cfg.color}18` }}
            >
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#f43f5e' }}
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Excluir
          </button>
        </div>

      </div>
    </div>
  )
}
