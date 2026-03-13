'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { BookingStatus } from '@/hooks/use-experiencias'

interface AccommodationForm {
  name: string
  address: string
  check_in: string
  check_out: string
  cost_per_night: string
  booking_status: BookingStatus
  confirmation_code: string
  notes: string
}

const INITIAL_FORM: AccommodationForm = {
  name: '', address: '', check_in: '', check_out: '',
  cost_per_night: '', booking_status: 'estimated',
  confirmation_code: '', notes: '',
}

interface AccommodationModalProps {
  tripId: string
  tripCurrency: string
  startDate: string
  endDate: string
  onClose: () => void
  onSave: (data: {
    trip_id: string
    name: string
    address: string | null
    check_in: string
    check_out: string
    cost_per_night: number | null
    total_cost: number | null
    currency: string
    booking_status: BookingStatus
    confirmation_code: string | null
    notes: string | null
  }) => Promise<void>
  onReload: () => Promise<void>
}

export function AccommodationModal({
  tripId, tripCurrency, startDate, endDate,
  onClose, onSave, onReload,
}: AccommodationModalProps) {
  const [form, setForm] = useState<AccommodationForm>(INITIAL_FORM)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.name || !form.check_in || !form.check_out) {
      toast.error('Preencha nome e datas')
      return
    }
    setIsSaving(true)
    try {
      const nights = Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24)))
      const costPerNight = form.cost_per_night ? parseFloat(form.cost_per_night) : null
      await onSave({
        trip_id: tripId,
        name: form.name,
        address: form.address || null,
        check_in: form.check_in,
        check_out: form.check_out,
        cost_per_night: costPerNight,
        total_cost: costPerNight != null ? costPerNight * nights : null,
        currency: tripCurrency,
        booking_status: form.booking_status,
        confirmation_code: form.confirmation_code || null,
        notes: form.notes || null,
      })
      toast.success('Hospedagem adicionada')
      onClose()
      await onReload()
    } catch {
      toast.error('Erro ao adicionar hospedagem')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">🏨 Adicionar Hospedagem</h2>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome*</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hotel, Airbnb, Pousada..." className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Endereço</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Check-in*</label>
              <input type="date" value={form.check_in} min={startDate} max={endDate} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Check-out*</label>
              <input type="date" value={form.check_out} min={form.check_in || startDate} max={endDate} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo por noite</label>
              <input type="number" step="10" value={form.cost_per_night} onChange={e => setForm(f => ({ ...f, cost_per_night: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Status</label>
              <select value={form.booking_status} onChange={e => setForm(f => ({ ...f, booking_status: e.target.value as BookingStatus }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]">
                <option value="estimated">Estimado</option>
                <option value="reserved">Reservado</option>
                <option value="paid">Pago</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Código de confirmação</label>
            <input type="text" value={form.confirmation_code} onChange={e => setForm(f => ({ ...f, confirmation_code: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
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
