'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { CARREIRA_PRIMARY, CARREIRA_GRAD } from '@/lib/carreira-colors'

interface CarreiraAddPromotionModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    company: string
    salary: number
    startDate: string
    syncFinance: boolean
  }) => Promise<void>
  currentSalary?: number
}

export function CarreiraAddPromotionModal({ open, onClose, onSave, currentSalary = 9200 }: CarreiraAddPromotionModalProps) {
  const accent = CARREIRA_PRIMARY
  const grad = CARREIRA_GRAD

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [salary, setSalary] = useState('')
  const [startDate, setStartDate] = useState('')
  const [syncFinance, setSyncFinance] = useState(true)
  const [saving, setSaving] = useState(false)

  const newSalary = salary ? parseFloat(salary) : 0
  const diff = newSalary - currentSalary
  const diffPct = currentSalary > 0 ? Math.round((diff / currentSalary) * 100) : 0
  const annualGain = diff * 12

  async function handleSave() {
    if (!title.trim() || !salary) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        company: company.trim(),
        salary: newSalary,
        startDate,
        syncFinance,
      })
      onClose()
      setTitle('')
      setCompany('')
      setSalary('')
      setStartDate('')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-bg)] w-full max-h-[92vh] rounded-t-3xl overflow-y-auto animate-[modalUp_0.3s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
          <button onClick={onClose} className="w-9 h-9 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center justify-center">
            <ChevronLeft size={16} className="text-[var(--sl-t2)]" />
          </button>
          <div className="text-center">
            <p className="text-[12px] font-medium" style={{ color: '#c4b5fd' }}>
              ✦ Conquista Desbloqueada!
            </p>
            <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">Nova Promoção</p>
          </div>
          <button onClick={onClose} className="text-[13px] text-[var(--sl-t3)]">Cancelar</button>
        </div>

        {/* Celebration banner */}
        <div
          className="mx-4 mb-[14px] rounded-2xl p-4 border text-center"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.08))', borderColor: 'rgba(139,92,246,0.28)' }}
        >
          <div className="text-[36px] mb-[6px]">🎉</div>
          <p className="text-[11px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-1">
            NOVO CAPÍTULO DESBLOQUEADO
          </p>
          <p
            className="font-[DM_Mono] text-[28px] font-bold"
            style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            +100 XP
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-1">
            Badge "Evolução" + Atualização do Roadmap
          </p>
        </div>

        <div className="px-4 pb-4">
          {/* Cargo */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Novo cargo
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Desenvolvedor Sênior"
            className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none mb-[14px]"
            style={{ borderColor: 'rgba(139,92,246,0.3)' }}
          />

          {/* Empresa */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Empresa
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="TechCorp"
            className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none mb-[14px]"
            style={{ borderColor: 'rgba(139,92,246,0.3)' }}
          />

          {/* Salary + Date row */}
          <div className="flex gap-2 mb-[14px]">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
                style={{ color: '#c4b5fd' }}>
                Novo salário bruto
              </label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="14.000"
                min="0"
                className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
                style={{ borderColor: 'rgba(139,92,246,0.3)' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
                style={{ color: '#c4b5fd' }}>
                Data
              </label>
              <input
                type="month"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] outline-none"
                style={{ borderColor: 'rgba(139,92,246,0.3)' }}
              />
            </div>
          </div>

          {/* Comparison */}
          <div
            className="rounded-2xl p-[14px] border mb-[14px]"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(236,72,153,0.06))',
              borderColor: 'rgba(16,185,129,0.2)',
            }}
          >
            <p className="text-[11px] font-bold mb-2"
              style={{ color: '#c4b5fd' }}>
              💰 IMPACTO DA CONQUISTA
            </p>
            <div className="flex justify-between mb-[6px]">
              <span className="text-[12px] text-[var(--sl-t2)]">Salário anterior</span>
              <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] line-through">
                R$ {currentSalary.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between mb-[6px]">
              <span className="text-[12px] text-[var(--sl-t2)]">Novo salário</span>
              <span className="font-[DM_Mono] text-[13px] font-semibold" style={{ color: accent }}>
                R$ {newSalary.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-px bg-[var(--sl-border)] my-2" />
            <div className="flex justify-between">
              <span className="text-[12px] font-semibold text-[var(--sl-t1)]">Aumento</span>
              <span className="font-[DM_Mono] text-[14px] font-bold text-[#10b981]">
                {diff > 0 ? '+' : ''}{diffPct}% · {diff > 0 ? '+' : ''}R$ {Math.abs(diff).toLocaleString('pt-BR')}/mês
              </span>
            </div>
            {diff > 0 && (
              <p className="text-[10px] text-[#c4b5fd] font-semibold mt-[6px]">
                ⚡ Impacto anual: +R$ {annualGain.toLocaleString('pt-BR')} · Patrimônio acelera
              </p>
            )}
          </div>

          {/* Toggle Finanças */}
          <div
            className="flex items-center justify-between px-3 py-3 rounded-[10px] border mb-[14px]"
            style={{ background: 'var(--sl-s1)', borderColor: 'var(--sl-border)' }}
          >
            <div className="flex items-center gap-[10px]">
              <span className="text-[16px]">💰</span>
              <div>
                <p className="text-[13px] text-[var(--sl-t1)]">
                  Aliado: Finanças
                </p>
                <p className="text-[11px]" style={{ color: '#c4b5fd' }}>
                  Atualiza receita · +5 XP bônus
                </p>
              </div>
            </div>
            <button
              onClick={() => setSyncFinance(!syncFinance)}
              className="w-10 h-[22px] rounded-full relative transition-all"
              style={{ background: syncFinance ? '#10b981' : 'var(--sl-s3)' }}
            >
              <div className="w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all"
                style={{ left: syncFinance ? '21px' : '3px' }} />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 pb-8">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !salary}
            className="w-full rounded-[14px] text-white font-semibold disabled:opacity-50"
            style={{
              background: grad,
              height: '54px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            ✦ Registrar Conquista · +100 XP
          </button>
        </div>
      </div>
    </div>
  )
}
