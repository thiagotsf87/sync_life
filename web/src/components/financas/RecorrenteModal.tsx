'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/hooks/use-categories'
import type { RecurrenteWithCategory, RecorrenteFormData, Frequency } from '@/hooks/use-recorrentes'

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'weekly',    label: 'Semanal' },
  { value: 'biweekly',  label: 'Quinzenal' },
  { value: 'monthly',   label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual',    label: 'Anual' },
]

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

interface RecorrenteModalProps {
  open: boolean
  mode: 'create' | 'edit'
  recorrente?: RecurrenteWithCategory
  categories: Category[]
  onClose: () => void
  onSave: (data: RecorrenteFormData) => Promise<void>
}

export function RecorrenteModal({
  open, mode, recorrente, categories, onClose, onSave,
}: RecorrenteModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && recorrente) {
      setType(recorrente.type)
      setName(recorrente.name)
      setAmount(String(recorrente.amount))
      setFrequency(recorrente.frequency)
      setDayOfMonth(recorrente.day_of_month ?? 1)
      setStartDate(recorrente.start_date)
      setEndDate(recorrente.end_date ?? '')
      setCategoryId(recorrente.category_id ?? '')
      setNotes(recorrente.notes ?? '')
    } else {
      setType('expense')
      setName('')
      setAmount('')
      setFrequency('monthly')
      setDayOfMonth(1)
      setStartDate(todayStr())
      setEndDate('')
      setCategoryId('')
      setNotes('')
    }
    setErrors({})
  }, [open, mode, recorrente])

  if (!open) return null

  const showDayOfMonth = ['monthly', 'quarterly', 'annual'].includes(frequency)
  const filteredCategories = categories.filter(c => c.type === type)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = 'Nome deve ter ao menos 2 caracteres'
    const amt = parseFloat(amount.replace(',', '.'))
    if (!amount || isNaN(amt) || amt <= 0) errs.amount = 'Valor inválido'
    if (!startDate) errs.startDate = 'Data de início obrigatória'
    if (endDate && endDate <= startDate) errs.endDate = 'Encerramento deve ser após a data de início'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({ type, name, amount, frequency, day_of_month: dayOfMonth, start_date: startDate, end_date: endDate, category_id: categoryId, notes })
      onClose()
    } catch { /* parent toasts */ }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[520px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
            {mode === 'create' ? 'Nova Recorrente' : 'Editar Recorrente'}
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
              placeholder="Ex: Netflix, Aluguel, Salário..."
              className={cn('w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none transition-colors',
                errors.name ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]')} />
            {errors.name && <p className="text-[11px] text-[#f43f5e]">{errors.name}</p>}
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Valor</label>
            <div className={cn('flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border transition-colors',
              errors.amount ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus-within:border-[#10b981]')}>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
              <input type="text" inputMode="decimal" value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="0,00"
                className="flex-1 bg-transparent outline-none font-[DM_Mono] text-[16px] font-medium text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]" />
            </div>
            {errors.amount && <p className="text-[11px] text-[#f43f5e]">{errors.amount}</p>}
          </div>

          {/* Frequência */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Frequência</label>
            <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-2">
              {FREQ_OPTIONS.map(f => (
                <button key={f.value} onClick={() => setFrequency(f.value)}
                  className={cn(
                    'py-2.5 px-3 rounded-[10px] border-[1.5px] text-[13px] font-semibold transition-all cursor-pointer',
                    frequency === f.value
                      ? 'bg-[rgba(16,185,129,.08)] border-[#10b981] text-[#10b981]'
                      : 'bg-[var(--sl-s2)] border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dia do mês + Data início */}
          <div className="grid grid-cols-2 gap-3">
            {showDayOfMonth && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Dia do mês</label>
                <input type="number" min={1} max={31} value={dayOfMonth}
                  onChange={e => setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value))))}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] outline-none focus:border-[#10b981] transition-colors font-[DM_Mono]" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Data de início</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={cn('w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono]',
                  errors.startDate ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]')} />
              {errors.startDate && <p className="text-[11px] text-[#f43f5e]">{errors.startDate}</p>}
            </div>
          </div>

          {/* Encerramento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Encerramento (opcional)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className={cn('w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono]',
                errors.endDate ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]')} />
            {errors.endDate && <p className="text-[11px] text-[#f43f5e]">{errors.endDate}</p>}
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Categoria (opcional)</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] outline-none focus:border-[#10b981] transition-colors cursor-pointer">
              <option value="">Sem categoria</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Observações (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Adicione uma observação..." rows={2}
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
            {mode === 'create' ? 'Criar recorrente' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
