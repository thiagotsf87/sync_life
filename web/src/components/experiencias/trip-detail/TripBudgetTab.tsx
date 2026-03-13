'use client'

import { toast } from 'sonner'
import { BUDGET_CATEGORY_LABELS, type TripBudgetItem } from '@/hooks/use-experiencias'

interface TripBudgetTabProps {
  budget: TripBudgetItem[]
  totalEstimated: number
  totalActual: number
  formatTripAmount: (value: number) => string
  updateBudgetItem: (id: string, data: Record<string, number>) => Promise<void>
  reload: () => Promise<void>
}

export function TripBudgetTab({
  budget, totalEstimated, totalActual,
  formatTripAmount, updateBudgetItem, reload,
}: TripBudgetTabProps) {

  async function handleUpdateBudget(id: string, field: 'estimated_amount' | 'actual_amount', value: string) {
    try {
      await updateBudgetItem(id, { [field]: parseFloat(value) || 0 })
      await reload()
    } catch {
      toast.error('Erro ao atualizar orçamento')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Estimado</p>
          <p className="font-[DM_Mono] text-xl text-[var(--sl-t1)]">{formatTripAmount(totalEstimated)}</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Gasto</p>
          <p className="font-[DM_Mono] text-xl" style={{ color: totalActual > totalEstimated ? '#f43f5e' : '#10b981' }}>
            {formatTripAmount(totalActual)}
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Saldo</p>
          <p className="font-[DM_Mono] text-xl" style={{ color: totalEstimated - totalActual >= 0 ? '#ec4899' : '#f43f5e' }}>
            {formatTripAmount(totalEstimated - totalActual)}
          </p>
        </div>
      </div>

      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
        <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">Por categoria</h3>
        <div className="flex flex-col gap-4">
          {budget.map(b => (
            <div key={b.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] text-[var(--sl-t2)] flex-1">{BUDGET_CATEGORY_LABELS[b.category]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider block mb-1">Estimado</label>
                  <input
                    type="number"
                    step="50"
                    defaultValue={b.estimated_amount}
                    onBlur={e => handleUpdateBudget(b.id, 'estimated_amount', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-[8px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider block mb-1">Gasto real</label>
                  <input
                    type="number"
                    step="10"
                    defaultValue={b.actual_amount}
                    onBlur={e => handleUpdateBudget(b.id, 'actual_amount', e.target.value)}
                    className="w-full px-2.5 py-2 rounded-[8px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]"
                  />
                </div>
              </div>
              {b.estimated_amount > 0 && (
                <div className="w-full bg-[var(--sl-s3)] rounded-full mt-2 overflow-hidden" style={{ height: '3px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((b.actual_amount / b.estimated_amount) * 100, 100)}%`,
                      background: b.actual_amount > b.estimated_amount ? '#f43f5e' : '#ec4899',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
