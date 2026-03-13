'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ITINERARY_CATEGORY_LABELS,
  type ItineraryCategory,
} from '@/hooks/use-experiencias'

interface ItineraryForm {
  day_date: string
  title: string
  category: ItineraryCategory
  address: string
  estimated_time: string
  estimated_cost: string
  notes: string
}

interface ItineraryModalProps {
  tripId: string
  tripCurrency: string
  tripDays: string[]
  initialDayDate: string
  itineraryByDay: Record<string, { id: string }[]>
  onClose: () => void
  onSave: (data: {
    trip_id: string
    day_date: string
    sort_order: number
    title: string
    category: ItineraryCategory
    address: string | null
    estimated_time: string | null
    estimated_cost: number | null
    currency: string
    notes: string | null
  }) => Promise<void>
  onReload: () => Promise<void>
}

export function ItineraryModal({
  tripId, tripCurrency, tripDays, initialDayDate,
  itineraryByDay, onClose, onSave, onReload,
}: ItineraryModalProps) {
  const [form, setForm] = useState<ItineraryForm>({
    day_date: initialDayDate,
    title: '',
    category: 'sightseeing',
    address: '',
    estimated_time: '',
    estimated_cost: '',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.title || !form.day_date) {
      toast.error('Preencha título e data')
      return
    }
    setIsSaving(true)
    try {
      const dayItems = itineraryByDay[form.day_date] ?? []
      await onSave({
        trip_id: tripId,
        day_date: form.day_date,
        sort_order: dayItems.length,
        title: form.title,
        category: form.category,
        address: form.address || null,
        estimated_time: form.estimated_time || null,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        currency: tripCurrency,
        notes: form.notes || null,
      })
      toast.success('Atividade adicionada')
      onClose()
      await onReload()
    } catch {
      toast.error('Erro ao adicionar atividade')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">📍 Adicionar Atividade</h2>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Dia*</label>
              <select value={form.day_date} onChange={e => setForm(f => ({ ...f, day_date: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]">
                {tripDays.map(d => (
                  <option key={d} value={d}>
                    {new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Horário</label>
              <input type="time" value={form.estimated_time} onChange={e => setForm(f => ({ ...f, estimated_time: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Título*</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Torre Eiffel, Museu do Louvre..." className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Categoria</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(ITINERARY_CATEGORY_LABELS) as ItineraryCategory[]).map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                  className={cn('py-1.5 rounded-[8px] border text-[9px] text-center transition-all', form.category === c ? 'border-[#ec4899] bg-[#ec4899]/10 text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t3)]')}>
                  {ITINERARY_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Endereço</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo estimado</label>
            <input type="number" step="10" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-t2)]">Cancelar</button>
            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold bg-[#ec4899] text-[#03071a] hover:opacity-90 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Adicionar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
