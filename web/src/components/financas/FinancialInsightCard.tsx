'use client'

import { Bot, RefreshCw, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react'
import { useFinancialInsights } from '@/hooks/use-financial-insights'

function InsightIcon({ type }: { type: 'positive' | 'warning' | 'tip' }) {
  switch (type) {
    case 'positive': return <TrendingUp size={14} className="text-[#10b981] shrink-0" />
    case 'warning':  return <AlertTriangle size={14} className="text-[#f59e0b] shrink-0" />
    case 'tip':      return <Sparkles size={14} className="text-[#0055ff] shrink-0" />
  }
}

function InsightContent({ month, year }: { month: number; year: number }) {
  const { insights, loading, error, regenerate } = useFinancialInsights({ month, year })

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
          <Bot size={16} className="text-[#10b981]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Insights Financeiros</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[rgba(16,185,129,0.1)] text-[#10b981]">IA</span>
          </div>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          className="w-7 h-7 rounded-lg border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[42px] rounded-xl bg-[var(--sl-s2)] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-[12px] text-[#f43f5e]">{error}</p>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]"
            >
              <InsightIcon type={insight.type} />
              <p className="text-[12px] text-[var(--sl-t2)] leading-[1.6]">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FinancialInsightCard({ month, year }: { month: number; year: number }) {
  return <InsightContent month={month} year={year} />
}
