'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/hooks/use-categories'
import type { PlanningEvent, EventFormData } from '@/hooks/use-planejamento'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface PlanningEventModalProps {
  open: boolean
  mode: 'create' | 'edit'
  event?: PlanningEvent
  categories: Category[]
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
}

export function PlanningEventModal({
  open, mode, event, categories, onClose, onSave,
}: PlanningEventModalProps) {
  const [type, setType]       = useState<'income' | 'expense'>('expense')
  const [name, setName]       = useState('')
  const [amount, setAmount]   = useState('')
  const [date, setDate]       = useState(todayStr())
  const [catId, setCatId]     = useState('')
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && event) {
      setType(event.type)
      setName(event.name)
      setAmount(String(event.amount))
      setDate(event.planned_date)
      setCatId(event.category_id ?? '')
      setNotes(event.notes ?? '')
    } else {
      setType('expense')
      setName('')
      setAmount('')
      setDate(todayStr())
      setCatId('')
      setNotes('')
    }
    setErrors({})
  }, [open, mode, event])

  if (!open) return null

  const filteredCats = categories.filter(c => c.type === type)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = 'Nome deve ter ao menos 2 caracteres'
    const amt = parseFloat(amount.replace(',', '.'))
    if (!amount || isNaN(amt) || amt <= 0) errs.amount = 'Valor inválido'
    if (!date) errs.date = 'Data obrigatória'
    else if (date < todayStr()) errs.date = 'A data deve ser hoje ou futura'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({ type, name, amount, planned_date: date, category_id: catId, notes })
      onClose()
    } catch { /* parent toasts */ }
    finally { setSaving(false) }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[480px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
            {mode === 'create' ? 'Novo Evento' : 'Editar Evento'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={cn(
                  'py-3 rounded-[12px] border-[1.5px] bg-[var(--sl-s2)] cursor-pointer flex items-center justify-center gap-2 transition-all',
                  type === 'expense' && t === 'expense' ? 'border-[#f43f5e] bg-[rgba(244,63,94,.07)]'
                    : type === 'income' && t === 'income' ? 'border-[#10b981] bg-[rgba(16,185,129,.07)]'
                    : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                )}>
                <span className="text-xl">{t === 'expense' ? '📤' : '💰'}</span>
                <span className={cn('text-[14px] font-semibold',
                  type === t ? (t === 'expense' ? 'text-[#f43f5e]' : 'text-[#10b981]') : 'text-[var(--sl-t2)]')}>
                  {t === 'expense' ? 'Despesa' : 'Receita'}
                </span>
              </button>
            ))}
          </div>

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Compra do carro, Bônus, Viagem..."
              className={cn('w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none transition-colors',
                errors.name ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]')} />
            {errors.name && <p className="text-[11px] text-[#f43f5e]">{errors.name}</p>}
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Valor</label>
              <div className={cn('flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border transition-colors',
                errors.amount ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus-within:border-[#10b981]')}>
                <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
                <input type="text" inputMode="decimal" value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="0,00"
                  className="flex-1 bg-transparent outline-none font-[DM_Mono] text-[15px] font-medium text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]" />
              </div>
              {errors.amount && <p className="text-[11px] text-[#f43f5e]">{errors.amount}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Data prevista</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className={cn('w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono]',
                  errors.date ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]')} />
              {errors.date && <p className="text-[11px] text-[#f43f5e]">{errors.date}</p>}
            </div>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Categoria (opcional)</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] outline-none focus:border-[#10b981] transition-colors cursor-pointer">
              <option value="">Sem categoria</option>
              {filteredCats.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Notas (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Descrição adicional..." rows={2}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Criar evento' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
