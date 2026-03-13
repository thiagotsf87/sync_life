'use client'

import { cn } from '@/lib/utils'
import { BarChart2 } from 'lucide-react'
import { SLCard } from '@/components/ui/sl-card'
import { fmtR } from '@/components/financas/relatorios-helpers'
import type { CategoryComparison } from '@/hooks/use-relatorios'

interface RelatoriosCategoryComparisonProps {
  catCompData: CategoryComparison[]
  maxCatValue: number
}

export function RelatoriosCategoryComparison({ catCompData, maxCatValue }: RelatoriosCategoryComparisonProps) {
  return (
    <SLCard>
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] flex items-center gap-1.5">
          <BarChart2 size={15} />
          Categorias vs Anterior
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--sl-t3)]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-[3px] bg-[#10b981] rounded inline-block" />Atual
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-[3px] bg-[var(--sl-s3)] rounded inline-block" />Anterior
          </span>
        </div>
      </div>
      {catCompData.length === 0 ? (
        <div className="flex items-center justify-center h-[150px] text-[var(--sl-t3)] text-[12px]">
          Sem categorias no período
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {catCompData.map(cat => (
            <div
              key={cat.name}
              className="flex items-center gap-2 px-2.5 py-2 rounded-[9px] hover:bg-[var(--sl-s2)] transition-colors">
              <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ background: cat.color }} />
              <span className="w-[80px] text-[12px] text-[var(--sl-t2)] truncate shrink-0">{cat.name}</span>
              <div className="flex-1 flex flex-col gap-[3px]">
                <div
                  className="h-[5px] rounded-[3px] transition-[width] duration-700"
                  style={{
                    width: `${maxCatValue > 0 ? (cat.currentTotal / maxCatValue) * 100 : 0}%`,
                    background: cat.color,
                  }}
                />
                <div
                  className="h-[5px] rounded-[3px] opacity-40 transition-[width] duration-700"
                  style={{
                    width: `${maxCatValue > 0 ? (cat.prevTotal / maxCatValue) * 100 : 0}%`,
                    background: cat.color,
                  }}
                />
              </div>
              <div className="flex flex-col items-end shrink-0 min-w-[62px]">
                <span className="font-[DM_Mono] text-[11px] font-medium text-[var(--sl-t1)]">
                  {fmtR(cat.currentTotal)}
                </span>
                {cat.delta !== null && (
                  <span className={cn('text-[10px]',
                    cat.delta > 10 ? 'text-[#f43f5e]' :
                    cat.delta < -5 ? 'text-[#10b981]' :
                    'text-[var(--sl-t3)]'
                  )}>
                    {cat.delta > 0 ? '↑' : '↓'} {Math.abs(cat.delta).toFixed(0)}%
                    {cat.delta > 10 ? ' ⚠' : cat.delta < -5 ? ' ✓' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SLCard>
  )
}
