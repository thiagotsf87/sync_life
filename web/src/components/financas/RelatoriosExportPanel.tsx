'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SLCard } from '@/components/ui/sl-card'

interface RelatoriosExportPanelProps {
  isPro: boolean
  exportCSV: () => void
}

export function RelatoriosExportPanel({ isPro, exportCSV }: RelatoriosExportPanelProps) {
  const items = [
    {
      icon: '📊', bg: 'rgba(16,185,129,0.1)',
      label: 'CSV — Transações',
      proOnly: false,
      desc: 'Todas as transações do período em formato planilha.',
      action: exportCSV,
    },
    {
      icon: '📄', bg: 'rgba(0,85,255,0.1)',
      label: 'PDF — Relatório Completo',
      proOnly: true,
      desc: 'Relatório formatado com gráficos, sumários e análise.',
      action: () => {},
    },
    {
      icon: '📋', bg: 'rgba(245,158,11,0.1)',
      label: 'Excel (.xlsx)',
      proOnly: true,
      desc: 'Exportação com múltiplas abas: transações, categorias, resumo.',
      action: () => {},
    },
  ]

  return (
    <SLCard>
      <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] mb-3">Exportar Dados</p>
      <div className="flex flex-col divide-y divide-[var(--sl-border)]">
        {items.map((item, i) => {
          const disabled = item.proOnly && !isPro
          return (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 py-3 transition-opacity',
                disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              )}
              onClick={!disabled ? item.action : undefined}>
              <div
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
                style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-px flex items-center gap-1 flex-wrap">
                  {item.label}
                  {item.proOnly && !isPro && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(0,85,255,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.25)]">
                      <Lock size={9} /> PRO
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-[var(--sl-t3)] leading-snug">{item.desc}</p>
              </div>
              <button
                className={cn(
                  'px-2.5 py-1 rounded-[7px] border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] text-[11px] cursor-pointer transition-all shrink-0 whitespace-nowrap hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]',
                  disabled && 'pointer-events-none'
                )}
                onClick={e => { e.stopPropagation(); if (!disabled) item.action() }}>
                {disabled ? 'PRO' : 'Baixar'}
              </button>
            </div>
          )
        })}
      </div>
    </SLCard>
  )
}
