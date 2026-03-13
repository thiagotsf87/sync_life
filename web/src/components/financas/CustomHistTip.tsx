'use client'

import { cn } from '@/lib/utils'
import { fmtR$ } from '@/components/financas/helpers'

interface CustomHistTipProps {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}

export function CustomHistTip({ active, payload, label }: CustomHistTipProps) {
  if (!active || !payload?.length) return null
  const rec = payload.find(p => p.name === 'rec')?.value ?? 0
  const des = payload.find(p => p.name === 'des')?.value ?? 0
  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border-h)] rounded-xl px-3 py-2.5 text-[11px] shadow-xl">
      <p className="font-bold uppercase text-[10px] text-[var(--sl-t3)] mb-1.5">{label}</p>
      <div className="flex justify-between gap-3 mb-0.5">
        <span className="text-[var(--sl-t3)]">Receitas</span>
        <span className="font-[DM_Mono] text-[#10b981] font-medium">R$ {fmtR$(rec)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-[var(--sl-t3)]">Despesas</span>
        <span className="font-[DM_Mono] text-[#f43f5e] font-medium">R$ {fmtR$(des)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-[var(--sl-border)] mt-2 pt-1.5">
        <span className="text-[var(--sl-t3)]">Saldo</span>
        <span className={cn('font-[DM_Mono] font-medium', rec - des >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
          R$ {fmtR$(rec - des)}
        </span>
      </div>
    </div>
  )
}
