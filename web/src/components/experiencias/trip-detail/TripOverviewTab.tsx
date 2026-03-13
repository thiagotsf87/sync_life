'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Trip, TripItineraryItem, TripBudgetItem, TripChecklistItem } from '@/hooks/use-experiencias'
import { BUDGET_CATEGORY_LABELS } from '@/hooks/use-experiencias'

interface TripOverviewTabProps {
  trip: Trip
  itinerary: TripItineraryItem[]
  budget: TripBudgetItem[]
  checklist: TripChecklistItem[]
  days: number
  tripDays: string[]
  totalEstimated: number
  totalActual: number
  checklistDone: number
  checklistPct: number
  shouldShowPassportCard: boolean
  passportExpiry: string
  passportRisk: 'before_trip' | 'within_6_months' | 'ok' | null
  passportLimitDate: Date
  formatTripAmount: (value: number) => string
  formatTripAmountCompact: (value: number) => string
  savePassportExpiry: (value: string) => void
  handleToggleChecklist: (id: string, current: boolean) => void
  setActiveTab: (tab: 'budget' | 'checklist') => void
}

export function TripOverviewTab({
  trip, itinerary, budget, checklist,
  days, tripDays, totalEstimated, totalActual,
  checklistDone, checklistPct,
  shouldShowPassportCard, passportExpiry, passportRisk, passportLimitDate,
  formatTripAmount, formatTripAmountCompact,
  savePassportExpiry, handleToggleChecklist, setActiveTab,
}: TripOverviewTabProps) {
  return (
    <div className="grid grid-cols-[1fr_280px] gap-4 max-lg:grid-cols-1">
      <div className="flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Orçamento</p>
            <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">
              {totalEstimated > 0 ? formatTripAmount(totalEstimated) : '—'}
            </p>
            {totalActual > 0 && <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{formatTripAmount(totalActual)} gastos</p>}
          </div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Atividades</p>
            <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">{itinerary.length}</p>
            <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">em {tripDays.length} dias</p>
          </div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Checklist</p>
            <p className="font-[DM_Mono] font-medium text-lg text-[var(--sl-t1)]">{checklistDone}/{checklist.length}</p>
            <div className="w-full bg-[var(--sl-s3)] rounded-full mt-1 overflow-hidden" style={{ height: '3px' }}>
              <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${checklistPct}%` }} />
            </div>
          </div>
        </div>

        {/* Dates timeline */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">📅 Timeline</h3>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-[10px] text-[var(--sl-t3)]">Ida</p>
              <p className="font-[DM_Mono] text-[12px] text-[#ec4899] font-bold">
                {new Date(trip.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex-1 h-0.5 bg-[#ec4899]/30 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-[var(--sl-s1)] px-2 text-[10px] text-[var(--sl-t3)]">{days} dias</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[var(--sl-t3)]">Volta</p>
              <p className="font-[DM_Mono] text-[12px] text-[#ec4899] font-bold">
                {new Date(trip.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {shouldShowPassportCard && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-2">🛂 Validade do passaporte</h3>
            <p className="text-[11px] text-[var(--sl-t3)] mb-3">
              Para viagens internacionais, idealmente o passaporte deve vencer depois de {passportLimitDate.toLocaleDateString('pt-BR')} (6 meses após o retorno).
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={passportExpiry}
                onChange={(e) => savePassportExpiry(e.target.value)}
                className="px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]"
              />
              {!passportExpiry && (
                <span className="text-[11px] text-[#f59e0b]">Informe a data para validar risco.</span>
              )}
              {passportRisk === 'before_trip' && (
                <span className="text-[11px] text-[#f43f5e]">⚠️ Passaporte vence antes do fim da viagem.</span>
              )}
              {passportRisk === 'within_6_months' && (
                <span className="text-[11px] text-[#f59e0b]">⚠️ Vence em até 6 meses após o retorno.</span>
              )}
              {passportRisk === 'ok' && (
                <span className="text-[11px] text-[#10b981]">✅ Validade adequada para o período da viagem.</span>
              )}
            </div>
          </div>
        )}

        {trip.notes && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-2">📝 Notas</h3>
            <p className="text-[13px] text-[var(--sl-t2)] whitespace-pre-wrap">{trip.notes}</p>
          </div>
        )}

        {/* RN-EXP-19: Resumo pós-viagem quando concluída */}
        {trip.status === 'completed' && (
          <div className="bg-gradient-to-br from-[#ec4899]/10 to-[#10b981]/10 border border-[#ec4899]/30 rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🏆 Resumo da Viagem</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Duração</p>
                <p className="font-[DM_Mono] text-[15px] font-bold text-[#ec4899]">{days} dias</p>
              </div>
              <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Gasto Total</p>
                <p className="font-[DM_Mono] text-[15px] font-bold text-[var(--sl-t1)]">
                  {totalActual > 0
                    ? formatTripAmount(totalActual)
                    : '—'}
                </p>
              </div>
              <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Atividades</p>
                <p className="font-[DM_Mono] text-[15px] font-bold text-[var(--sl-t1)]">{itinerary.length}</p>
              </div>
              <div className="bg-[var(--sl-s1)] rounded-xl p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Checklist</p>
                <p className="font-[DM_Mono] text-[15px] font-bold text-[#10b981]">{Math.round(checklistPct)}%</p>
              </div>
            </div>
            {totalEstimated > 0 && totalActual > 0 && (
              <div className="mt-3 p-3 bg-[var(--sl-s1)] rounded-xl">
                <p className="text-[11px] text-[var(--sl-t2)]">
                  {totalActual <= totalEstimated
                    ? `✅ Ficou ${formatTripAmount(totalEstimated - totalActual)} abaixo do orçamento!`
                    : `⚠️ Excedeu o orçamento em ${formatTripAmount(totalActual - totalEstimated)}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side */}
      <div className="flex flex-col gap-3">
        {/* Budget progress */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">💰 Orçamento</h3>
          {budget.filter(b => b.estimated_amount > 0 || b.actual_amount > 0).map(b => {
            const pct = b.estimated_amount > 0 ? (b.actual_amount / b.estimated_amount) * 100 : 0
            return (
              <div key={b.id} className="mb-2">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px] text-[var(--sl-t3)]">{BUDGET_CATEGORY_LABELS[b.category]}</span>
                  <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t2)]">
                    {b.actual_amount > 0 ? `${formatTripAmountCompact(b.actual_amount)} / ` : ''}
                    {formatTripAmountCompact(b.estimated_amount)}
                  </span>
                </div>
                {b.estimated_amount > 0 && (
                  <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '3px' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct > 100 ? '#f43f5e' : pct > 85 ? '#f59e0b' : '#ec4899',
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
          {budget.every(b => b.estimated_amount === 0) && (
            <button
              onClick={() => setActiveTab('budget')}
              className="text-[12px] text-[#ec4899] hover:opacity-80"
            >
              Definir orçamento →
            </button>
          )}
        </div>

        {/* Quick checklist */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✅ Checklist</h3>
            <span className="text-[11px] text-[var(--sl-t3)]">{checklistDone}/{checklist.length}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {checklist.slice(0, 5).map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleToggleChecklist(item.id, item.is_completed)}
              >
                <div className={cn(
                  'w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all',
                  item.is_completed ? 'bg-[#10b981] border-[#10b981]' : 'border-[var(--sl-border)]'
                )}>
                  {item.is_completed && <Check size={10} className="text-[#03071a]" />}
                </div>
                <span className={cn(
                  'text-[11px] transition-colors',
                  item.is_completed ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t2)]'
                )}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
          {checklist.length > 5 && (
            <button onClick={() => setActiveTab('checklist')} className="text-[11px] text-[#ec4899] mt-2 hover:opacity-80">
              Ver todos ({checklist.length}) →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
