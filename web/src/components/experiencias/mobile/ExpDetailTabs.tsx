'use client'

import { useRef, useEffect } from 'react'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'

export type DetailTab = 'overview' | 'roteiro' | 'orcamento' | 'checklist' | 'hospedagem' | 'transporte'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: '📊 Visão geral' },
  { id: 'roteiro', label: '🗺️ Roteiro' },
  { id: 'orcamento', label: '💰 Orçamento' },
  { id: 'checklist', label: '✅ Checklist' },
  { id: 'hospedagem', label: '🏨 Hospedagem' },
  { id: 'transporte', label: '✈️ Transporte' },
]

interface ExpDetailTabsProps {
  active: DetailTab
  onChange: (tab: DetailTab) => void
}

export function ExpDetailTabs({ active, onChange }: ExpDetailTabsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current.querySelector(`[data-tab="${active}"]`) as HTMLElement
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  return (
    <div
      ref={ref}
      className="flex gap-0 px-4 pb-3 overflow-x-auto scrollbar-hide"
      style={{ borderBottom: '1px solid var(--sl-border)' }}
    >
      {TABS.map(t => (
        <button
          key={t.id}
          data-tab={t.id}
          onClick={() => onChange(t.id)}
          className="px-3 py-2 text-[12px] font-medium whitespace-nowrap shrink-0"
          style={{
            color: active === t.id ? EXP_PRIMARY_LIGHT : 'var(--sl-t3)',
            borderBottom: `2px solid ${active === t.id ? EXP_PRIMARY : 'transparent'}`,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
