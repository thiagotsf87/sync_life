'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { EXP_PRIMARY_LIGHT, EXP_GRAD } from '@/lib/exp-colors'

interface CheckItem {
  id: string
  text: string
  done: boolean
}

interface CheckSection {
  icon: string
  title: string
  items: CheckItem[]
}

interface ExpTabChecklistProps {
  sections?: CheckSection[]
  onToggle?: (id: string) => void
}

const MOCK_SECTIONS: CheckSection[] = [
  {
    icon: '📄', title: 'Documentos',
    items: [
      { id: 'd1', text: 'Passaporte/RG válido', done: true },
      { id: 'd2', text: 'Visto (se necessário)', done: true },
      { id: 'd3', text: 'Seguro viagem', done: false },
      { id: 'd4', text: 'Reserva de hotel impressa', done: false },
      { id: 'd5', text: 'Passagens impressas', done: true },
    ],
  },
  {
    icon: '🧳', title: 'Bagagem',
    items: [
      { id: 'b1', text: 'Roupas para o clima', done: true },
      { id: 'b2', text: 'Carregador e adaptador', done: true },
      { id: 'b3', text: 'Medicamentos essenciais', done: true },
      { id: 'b4', text: 'Cartão internacional', done: true },
    ],
  },
  {
    icon: '✅', title: 'Antes de Viajar',
    items: [
      { id: 'a1', text: 'Avisar banco', done: false },
      { id: 'a2', text: 'Verificar roaming/chip', done: true },
      { id: 'a3', text: 'Comprar yen em espécie', done: false },
      { id: 'a4', text: 'Baixar apps offline', done: false },
    ],
  },
]

export function ExpTabChecklist({ sections: propSections, onToggle }: ExpTabChecklistProps) {
  const sections = propSections ?? MOCK_SECTIONS
  const [localSections, setLocalSections] = useState(sections)

  const allItems = localSections.flatMap(s => s.items)
  const doneCount = allItems.filter(i => i.done).length
  const totalCount = allItems.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const xpPerItem = 3
  const xpGained = doneCount * xpPerItem
  const xpPending = (totalCount - doneCount) * xpPerItem

  function handleToggle(id: string) {
    if (onToggle) {
      onToggle(id)
    } else {
      setLocalSections(prev =>
        prev.map(s => ({
          ...s,
          items: s.items.map(item => item.id === id ? { ...item, done: !item.done } : item),
        }))
      )
    }
  }

  return (
    <div className="pt-3">
      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center mb-[6px]">
          <span className="text-[12px]" style={{ color: EXP_PRIMARY_LIGHT, fontWeight: 600 }}>
            Preparação da Missão
          </span>
          <span className="font-[DM_Mono] text-[13px] font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
            {doneCount}/{totalCount} · +{xpGained} XP ganhos
          </span>
        </div>
        <div className="h-2 rounded-[4px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
          <div className="h-full rounded-[4px]" style={{
            width: `${pct}%`,
            background: EXP_GRAD,
          }} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: EXP_PRIMARY_LIGHT }}>
          ⚡ +{xpPerItem} XP por item · {xpPending} XP pendentes
        </p>
      </div>

      {/* Sections */}
      {localSections.map((section, si) => {
        const sectionDone = section.items.filter(i => i.done).length
        const sectionTotal = section.items.length
        const allDone = sectionDone === sectionTotal
        const sectionPendingXp = (sectionTotal - sectionDone) * xpPerItem

        return (
          <div key={si}>
            <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 pb-2 mt-2">
              {section.icon} {section.title}
              <span style={{ color: allDone ? '#10b981' : EXP_PRIMARY_LIGHT }}>
                {allDone ? ' — ✓ Completo' : ` — +${sectionPendingXp} XP disponíveis`}
              </span>
            </p>
            <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
              {section.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: '1px solid var(--sl-border)' }}>
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0"
                    style={item.done
                      ? { background: '#10b981', borderColor: '#10b981', border: '2px solid #10b981' }
                      : { border: '2px solid var(--sl-border-h)' }
                    }
                  >
                    {item.done && <Check size={12} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={`text-[13px] flex-1 ${item.done ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t1)]'}`}>
                    {item.text}
                  </span>
                  {item.done ? (
                    <span className="text-[10px]" style={{ color: '#10b981' }}>✓ +{xpPerItem} XP</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-[1px] rounded-[10px] text-[9px] font-bold"
                      style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: EXP_PRIMARY_LIGHT }}>
                      +{xpPerItem} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
