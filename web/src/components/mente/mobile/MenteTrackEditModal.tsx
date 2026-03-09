'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { TrackCategory, StudyTrack } from '@/hooks/use-mente'
import { CATEGORY_LABELS } from '@/hooks/use-mente'
import { cn } from '@/lib/utils'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.12)'

export interface EditTrackData {
  name: string
  category: TrackCategory
  target_date: string
  cost: string
  notes: string
}

interface MenteTrackEditModalProps {
  open: boolean
  track: StudyTrack | null
  onClose: () => void
  onSave: (data: EditTrackData) => Promise<void>
}

export function MenteTrackEditModal({
  open,
  track,
  onClose,
  onSave,
}: MenteTrackEditModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TrackCategory>('technology')
  const [targetDate, setTargetDate] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && track) {
      setName(track.name)
      setCategory(track.category)
      setTargetDate(track.target_date ? track.target_date.split('T')[0] : '')
      setCost(track.cost != null ? String(track.cost) : '')
      setNotes(track.notes ?? '')
    }
  }, [open, track])

  if (!open) return null

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        category,
        target_date: targetDate || '',
        cost: cost.trim() || '',
        notes: notes.trim() || '',
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden"
        style={{
          background: 'var(--sl-s1)',
          border: '1px solid var(--sl-border)',
          maxHeight: '92vh',
        }}
      >
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--sl-s3)' }} />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] font-medium" style={{ color: MENTE_COLOR }}>
              Editar trilha
            </p>
            <h2 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)]">
              {track?.name ?? 'Trilha'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--sl-t2)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: '70vh' }}>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                Nome da trilha *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: React Avançado"
                className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-2">
                Categoria *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(CATEGORY_LABELS) as [TrackCategory, string][]).map(([k, v]) => {
                  const selected = category === k
                  const [emoji, ...textParts] = v.split(' ')
                  const label = textParts.join(' ')
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setCategory(k)}
                      className={cn(
                        'rounded-[12px] p-3 flex flex-col items-center gap-1 transition-colors',
                      )}
                      style={{
                        background: selected ? MENTE_BG : 'var(--sl-s2)',
                        border: selected ? `1.5px solid ${MENTE_COLOR}` : '1px solid var(--sl-border)',
                      }}
                    >
                      <span className="text-[22px]">{emoji}</span>
                      <span className="text-[11px] font-medium leading-tight text-center text-[var(--sl-t1)]">
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                Prazo (opcional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                Custo investido (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a trilha..."
                rows={3}
                className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)] resize-none"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full py-3.5 rounded-[10px] font-[Syne] font-bold text-[15px] text-black disabled:opacity-50 transition-opacity"
              style={{ background: MENTE_COLOR }}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
