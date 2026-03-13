'use client'

import { RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeTag } from '@/hooks/use-relatorios'

interface RelatoriosNarrativeBandProps {
  periodLabel: string
  narrativeText: string
  narrativeTags: NarrativeTag[]
  aiNarrative: string
  aiNarrativeLoading: boolean
  onRegenerate: () => void
}

export function RelatoriosNarrativeBand({
  periodLabel,
  narrativeText,
  narrativeTags,
  aiNarrative,
  aiNarrativeLoading,
  onRegenerate,
}: RelatoriosNarrativeBandProps) {
  return (
    <div className="flex items-start gap-3.5 bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] border border-[rgba(16,185,129,0.18)] rounded-2xl px-5 py-4 mb-3">
      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[rgba(16,185,129,0.2)] to-[rgba(0,85,255,0.2)] flex items-center justify-center text-[18px] shrink-0 mt-0.5">
        🤖
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <h3 className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
            Análise do Período: {periodLabel}
          </h3>
          <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-[rgba(16,185,129,0.15)] text-[#10b981] uppercase tracking-[0.05em]">
            IA Financeira
          </span>
          <button
            onClick={onRegenerate}
            disabled={aiNarrativeLoading}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[var(--sl-border)] bg-transparent text-[var(--sl-t3)] text-[11px] cursor-pointer hover:bg-[var(--sl-s2)] transition-all disabled:opacity-50"
          >
            {aiNarrativeLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Regenerar
          </button>
        </div>
        {aiNarrative ? (
          <p className="text-[13px] text-[var(--sl-t2)] leading-[1.65] whitespace-pre-wrap">
            {aiNarrative}
            {aiNarrativeLoading && <Loader2 size={12} className="inline-block ml-1 animate-spin text-[#10b981]" />}
          </p>
        ) : (
          <>
            <p
              className="text-[13px] text-[var(--sl-t2)] leading-[1.65]"
              dangerouslySetInnerHTML={{ __html: narrativeText }}
            />
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {narrativeTags.map(tag => (
                <span
                  key={tag.text}
                  className={cn(
                    'px-2.5 py-0.5 rounded-[7px] text-[11px] font-medium',
                    tag.type === 'pos' ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981]' :
                    tag.type === 'neg' ? 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e]' :
                    'bg-[var(--sl-s2)] text-[var(--sl-t2)]'
                  )}>
                  {tag.text}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
