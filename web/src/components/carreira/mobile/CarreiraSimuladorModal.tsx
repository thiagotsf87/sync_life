'use client'

import { useState } from 'react'

interface CarreiraSimuladorModalProps {
  currentTitle?: string
  currentSalary?: number
  onClose: () => void
}

export function CarreiraSimuladorModal({ currentTitle, currentSalary, onClose }: CarreiraSimuladorModalProps) {
  const [targetTitle, setTargetTitle] = useState('')
  const [targetSalary, setTargetSalary] = useState('')
  const [months, setMonths] = useState('12')

  const curr = currentSalary ?? 0
  const target = parseFloat(targetSalary) || 0
  const increase = curr > 0 && target > curr ? ((target - curr) / curr) * 100 : 0
  const monthlyIncrease = curr > 0 && target > curr ? (target - curr) / 12 : 0
  const readyInMonths = increase > 30 ? parseInt(months) + 3 : parseInt(months)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-s1)] border rounded-2xl w-full max-w-[440px]"
        style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
        <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#c4b5fd' }}>✦ SIMULADOR</p>
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Projeção de Promoção</h2>
          </div>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
        </div>
        <div className="p-5 flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo Atual</label>
              <div className="px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t2)]">
                {currentTitle ?? '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo Alvo</label>
              <input type="text" value={targetTitle} onChange={e => setTargetTitle(e.target.value)}
                placeholder="Ex: Dev Sênior"
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#8b5cf6]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário Atual (R$)</label>
              <div className="px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t2)] font-[DM_Mono]">
                {curr > 0 ? curr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário Esperado (R$)</label>
              <input type="number" value={targetSalary} onChange={e => setTargetSalary(e.target.value)}
                placeholder="Ex: 15000" min="0"
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#8b5cf6] font-[DM_Mono]" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Prazo para promoção (meses)</label>
            <div className="flex gap-2">
              {['6', '12', '18', '24'].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold border transition-all"
                  style={months === m ? {
                    borderColor: '#8b5cf6', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd'
                  } : {
                    borderColor: 'var(--sl-border)', color: 'var(--sl-t2)'
                  }}>
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {target > curr && curr > 0 && (
            <div className="rounded-xl p-4 border" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06))', borderColor: 'rgba(139,92,246,0.2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#c4b5fd' }}>Projeção</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--sl-t3)] mb-0.5">Aumento</p>
                  <p className="font-[DM_Mono] font-bold text-[15px] text-[#10b981]">+{increase.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--sl-t3)] mb-0.5">+R$/mês</p>
                  <p className="font-[DM_Mono] font-bold text-[15px] text-[#10b981]">
                    +{monthlyIncrease.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-[var(--sl-t2)] mt-3 leading-relaxed">
                {increase > 50
                  ? `Você estaria pronto em ~${readyInMonths} meses dominando as habilidades-chave do cargo alvo.`
                  : `Com foco nas habilidades certas, você pode atingir ${targetTitle || 'o cargo alvo'} em ${readyInMonths} meses.`}
              </p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 rounded-[10px] text-[13px] font-semibold transition-opacity"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
