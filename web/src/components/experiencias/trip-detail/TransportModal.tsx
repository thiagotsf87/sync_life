'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  TRANSPORT_TYPE_LABELS,
  type TransportType, type BookingStatus,
} from '@/hooks/use-experiencias'

interface TransportForm {
  type: TransportType
  origin: string
  destination: string
  departure_datetime: string
  arrival_datetime: string
  company: string
  cost: string
  booking_status: BookingStatus
  confirmation_code: string
}

const INITIAL_FORM: TransportForm = {
  type: 'flight', origin: '', destination: '',
  departure_datetime: '', arrival_datetime: '',
  company: '', cost: '',
  booking_status: 'estimated', confirmation_code: '',
}

interface TransportModalProps {
  tripId: string
  tripCurrency: string
  onClose: () => void
  onSave: (data: {
    trip_id: string
    type: TransportType
    origin: string | null
    destination: string | null
    departure_datetime: string | null
    arrival_datetime: string | null
    company: string | null
    cost: number | null
    currency: string
    booking_status: BookingStatus
    confirmation_code: string | null
    notes: null
  }) => Promise<void>
  onReload: () => Promise<void>
}

export function TransportModal({
  tripId, tripCurrency,
  onClose, onSave, onReload,
}: TransportModalProps) {
  const [form, setForm] = useState<TransportForm>(INITIAL_FORM)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!form.origin || !form.destination) {
      toast.error('Preencha origem e destino')
      return
    }
    setIsSaving(true)
    try {
      await onSave({
        trip_id: tripId,
        type: form.type,
        origin: form.origin || null,
        destination: form.destination || null,
        departure_datetime: form.departure_datetime || null,
        arrival_datetime: form.arrival_datetime || null,
        company: form.company || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        currency: tripCurrency,
        booking_status: form.booking_status,
        confirmation_code: form.confirmation_code || null,
        notes: null,
      })
      toast.success('Transporte adicionado')
      onClose()
      await onReload()
    } catch {
      toast.error('Erro ao adicionar transporte')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">✈️ Adicionar Transporte</h2>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl">×</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Tipo</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(TRANSPORT_TYPE_LABELS) as TransportType[]).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={cn('py-1.5 rounded-[8px] border text-[9px] text-center transition-all', form.type === t ? 'border-[#ec4899] bg-[#ec4899]/10 text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t3)]')}>
                  {TRANSPORT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Origem*</label>
              <input type="text" value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="Ex: São Paulo (GRU)" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Destino*</label>
              <input type="text" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Ex: Lisboa (LIS)" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Saída</label>
              <input type="datetime-local" value={form.departure_datetime} onChange={e => setForm(f => ({ ...f, departure_datetime: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Chegada</label>
              <input type="datetime-local" value={form.arrival_datetime} onChange={e => setForm(f => ({ ...f, arrival_datetime: e.target.value }))} className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Empresa</label>
              <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Opcional" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo</label>
              <input type="number" step="10" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Confirmação</label>
            <input type="text" value={form.confirmation_code} onChange={e => setForm(f => ({ ...f, confirmation_code: e.target.value }))} placeholder="Código de reserva" className="w-full px-3 py-2.5 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]" />
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
