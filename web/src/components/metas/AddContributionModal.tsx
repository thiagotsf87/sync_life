'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Goal } from '@/hooks/use-metas'

// ── Currency mask ─────────────────────────────────────────────────────────
function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const n = parseInt(digits, 10)
  return (n / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCurrency(masked: string): number {
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

interface AddContributionModalProps {
  open: boolean
  goal: Goal | null
  onClose: () => void
  onSave: (goalId: string, amount: number, date: string, notes?: string) => Promise<void>
}

export function AddContributionModal({ open, goal, onClose, onSave }: AddContributionModalProps) {
  const [amountStr, setAmountStr] = useState('')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && goal) {
      // Preenche com aporte mensal como sugestão
      if (goal.monthly_contribution > 0) {
        setAmountStr(goal.monthly_contribution.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
      } else {
        setAmountStr('')
      }
      setDate(todayStr())
      setNotes('')
      setErrors({})
    }
  }, [open, goal])

  if (!open || !goal) return null

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const amt = parseCurrency(amountStr)
    if (!amountStr || isNaN(amt) || amt <= 0) errs.amount = 'Valor inválido'
    if (!date) errs.date = 'Data obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(goal!.id, parseCurrency(amountStr), date, notes.trim() || undefined)
      onClose()
    } catch {
      // handled by parent
    } finally {
      setSaving(false)
    }
  }

  const remaining = Math.max(0, goal.target_amount - goal.current_amount)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[420px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{goal.icon}</span>
            <h2 className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)]">
              Registrar Aporte
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Info da meta */}
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--sl-s2)]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Faltam</p>
              <p className="font-[DM_Mono] font-medium text-[15px] text-[var(--sl-t1)]">
                {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Meta</p>
              <p className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)]">
                {goal.name}
              </p>
            </div>
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Valor do aporte</label>
            <div className={cn(
              'flex items-center gap-2 px-3.5 py-3 rounded-[10px] bg-[var(--sl-s2)] border transition-colors',
              errors.amount ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus-within:border-[#10b981]',
            )}>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={e => setAmountStr(maskCurrency(e.target.value))}
                placeholder="0,00"
                className="flex-1 bg-transparent outline-none font-[DM_Mono] text-[18px] font-medium text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
              />
            </div>
            {errors.amount && <p className="text-[11px] text-[#f43f5e]">{errors.amount}</p>}
          </div>

          {/* Data */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono]',
                errors.date ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]',
              )}
            />
            {errors.date && <p className="text-[11px] text-[#f43f5e]">{errors.date}</p>}
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Observação (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Aporte mensal, bônus..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Confirmar Aporte
          </button>
        </div>

      </div>
    </div>
  )
}
