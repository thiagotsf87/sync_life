'use client'

import { CARREIRA_PRIMARY, CARREIRA_GRAD } from '@/lib/carreira-colors'
import type { CareerHistoryEntry } from '@/hooks/use-carreira'

interface CarreiraTabHistoricoProps {
  history: CareerHistoryEntry[]
  onAddPromotion: () => void
}

interface SalaryPoint {
  year: string
  value: number
  heightPct: number
}

const MOCK_SALARY_DATA: SalaryPoint[] = [
  { year: '2020', value: 3600, heightPct: 23 },
  { year: '', value: 3600, heightPct: 23 },
  { year: '2021', value: 6000, heightPct: 40 },
  { year: '', value: 6000, heightPct: 40 },
  { year: '2022', value: 7500, heightPct: 50 },
  { year: '2023', value: 7800, heightPct: 64 },
  { year: '', value: 8200, heightPct: 70 },
  { year: '2024', value: 8800, heightPct: 82 },
  { year: '', value: 9000, heightPct: 92 },
  { year: '2025', value: 9200, heightPct: 100 },
]

export function CarreiraTabHistorico({ history, onAddPromotion }: CarreiraTabHistoricoProps) {
  const accent = CARREIRA_PRIMARY
  const grad = CARREIRA_GRAD

  return (
    <div>
      {/* Hero evolução */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border text-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.08))', borderColor: 'rgba(139,92,246,0.28)' }}
      >
        <p className="text-[11px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[6px]">
          ✦ SUA EVOLUÇÃO
        </p>
        <div className="flex justify-center items-baseline gap-2 mb-1">
          <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t3)] line-through">R$ 3.600</span>
          <span className="text-[18px] text-[var(--sl-t3)]">→</span>
          <span
            className="font-[DM_Mono] text-[26px] font-bold"
            style={{ background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            R$ 9.200
          </span>
        </div>
        <p className="text-[12px] text-[#10b981] font-semibold">
          +156% em 5 anos · 2 promoções conquistadas
        </p>
        <p className="text-[10px] text-[#c4b5fd] mt-[6px]">
          ⚡ +480 XP totais de carreira · Próximo: +100 XP (Sênior)
        </p>
      </div>

      {/* Salary evolution */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
        EVOLUÇÃO SALARIAL
      </p>
      <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-[60px] mb-2">
          {MOCK_SALARY_DATA.map((d, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px]"
              style={{
                height: `${d.heightPct}%`,
                background: d.heightPct >= 64 ? grad : `rgba(139,92,246,${d.heightPct >= 40 ? '0.35' : '0.2'})`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {['2020', '2021', '2022', '2023', '2024', '2025'].map(y => (
            <span key={y} className="text-[10px] text-[var(--sl-t3)]">{y}</span>
          ))}
        </div>
      </div>

      {/* Conquistas */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
        CONQUISTAS DO HERÓI
      </p>
      <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
        {/* Pleno */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)]">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            🏆
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">
              Promoção a Pleno
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">TechCorp · Mar 2022 · +53%</p>
            <p className="text-[10px] text-[#c4b5fd] font-bold mt-[2px]">✅ +100 XP · Badge "Evolução"</p>
          </div>
          <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd' }}>
            Conquistado
          </span>
        </div>
        {/* Junior */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)]">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            🏆
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">
              Promoção a Junior
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">TechCorp · Jan 2021 · +50%</p>
            <p className="text-[10px] text-[#10b981] font-semibold mt-[2px]">✅ +80 XP · Badge "Primeira Promoção"</p>
          </div>
          <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(16,185,129,0.12)] text-[#10b981]">
            Conquistado
          </span>
        </div>
        {/* Primeiro emprego */}
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0 bg-[rgba(100,100,100,0.1)]">
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">Primeiro emprego → R$ 3.600</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">StartupXYZ · Jan 2020</p>
            <p className="text-[10px] text-[#10b981] font-semibold mt-[2px]">✅ +50 XP · Badge "Início da Jornada"</p>
          </div>
        </div>
      </div>

      {/* Coach */}
      <div className="mx-4 mt-3 mb-3 flex gap-[11px] p-[13px_14px] rounded-2xl border border-[rgba(139,92,246,0.25)]"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))' }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[3px]">Coach Carreira</p>
          <p className="text-[12px] text-[var(--sl-t2)] leading-[1.55]">
            Sua média de crescimento é <strong className="text-[var(--sl-t1)]">+51% por promoção</strong>. Se manter esse ritmo, pode chegar a <strong className="text-[var(--sl-t1)]">R$ 14k como Sênior</strong> e <strong className="text-[var(--sl-t1)]">R$ 21k como Tech Lead</strong>.
          </p>
          <button className="inline-flex items-center gap-1 mt-[6px] text-[11px] font-bold text-[#c4b5fd]">
            Ver projeção completa →
          </button>
        </div>
      </div>

      {/* Métricas */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-2">
        MÉTRICAS
      </p>
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Tempo de carreira</p>
          <p className="font-[DM_Mono] text-[19px] font-bold text-[var(--sl-t1)]">5 anos</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">Desde Jan 2020</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Promoções</p>
          <p className="font-[DM_Mono] text-[19px] font-bold text-[#10b981]">2</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">Média: 2.5 anos/promoção</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Crescimento médio</p>
          <p className="font-[DM_Mono] text-[19px] font-bold" style={{ color: accent }}>+51%</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">Por promoção</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Projeção sênior</p>
          <p className="font-[DM_Mono] text-[15px] font-bold text-[#f59e0b]">R$ 14k</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">+52% do atual</p>
        </div>
      </div>
    </div>
  )
}
