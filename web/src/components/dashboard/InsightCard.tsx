'use client'

import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { fmt } from '@/components/dashboard/dashboard-utils'

interface BudgetItem {
  category: { name?: string } | null
  amount: number
  gasto: number
  pct: number
}

interface CategoryItem {
  name: string
  total: number
}

export interface InsightCardProps {
  monthLabel: string
  year: number
  now: Date
  budgetsOver: number
  goalsAtRisk: number
  projectedBalance: number
  balance: number
  totalIncome: number
  totalExpense: number
  savingsRate: number
  budgets: BudgetItem[]
  categorySpend: CategoryItem[]
  activeGoalsCount: number
  topExpenseCat: CategoryItem | undefined
  topExpensePct: number
}

export function InsightCard({
  monthLabel,
  year,
  now,
  budgetsOver,
  goalsAtRisk,
  projectedBalance,
  balance,
  totalIncome,
  totalExpense,
  savingsRate,
  budgets,
  categorySpend,
  activeGoalsCount,
  topExpenseCat,
  topExpensePct,
}: InsightCardProps) {
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleAiAsk = useCallback(async () => {
    const q = aiQuery.trim()
    if (!q || aiLoading) return

    setAiLoading(true)
    setAiResponse('')

    const financialContext = {
      mes: monthLabel,
      receitas: totalIncome,
      despesas: totalExpense,
      saldo: balance,
      taxaPoupanca: savingsRate,
      orcamentos: budgets.map(b => ({
        categoria: b.category?.name ?? 'Outro',
        limite: b.amount,
        gasto: b.gasto,
        pct: b.pct,
      })),
      topCategorias: categorySpend.slice(0, 5).map(c => ({ nome: c.name, valor: c.total })),
      metasAtivas: activeGoalsCount,
      metasEmRisco: goalsAtRisk,
    }

    try {
      const res = await fetch('/api/ai/financas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: q }],
          financialContext,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        setAiResponse(errorText || 'Erro ao consultar a IA. Tente novamente.')
        setAiLoading(false)
        return
      }

      if (!res.body) {
        setAiResponse('Erro ao consultar a IA. Tente novamente.')
        setAiLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setAiResponse(text)
      }

      if (!text.trim()) {
        setAiResponse('A IA n\u00e3o retornou uma resposta. Verifique a configura\u00e7\u00e3o ou tente novamente.')
      }
    } catch {
      setAiResponse('Erro de conex\u00e3o. Verifique sua internet e tente novamente.')
    } finally {
      setAiLoading(false)
    }
  }, [aiQuery, aiLoading, monthLabel, totalIncome, totalExpense, balance, savingsRate, budgets, categorySpend, activeGoalsCount, goalsAtRisk])

  return (
    <div className="relative rounded-[18px] overflow-hidden sl-fade-up sl-delay-2">
      {/* Gradient border via pseudo-element technique */}
      <div className="absolute -inset-px rounded-[19px] z-0" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.22), rgba(16,185,129,.12))' }} />
      <div className="absolute inset-0 rounded-[18px] bg-[var(--sl-s1)] z-0" />

      {/* Content - relative z-1 to sit above pseudo backgrounds */}
      <div className="relative z-[1] px-7 py-6">
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">Insight Inteligente</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: 'rgba(99,102,241,.12)', color: '#6366f1' }}>IA</span>
        </div>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.65]">
          {budgetsOver === 0
            ? <>Todos os seus or\u00e7amentos est\u00e3o dentro do planejado \u2014 \u00f3tima disciplina! Seu saldo est\u00e1
              projetado para <span style={{ color: '#10b981' }}><strong>{fmt(projectedBalance)} ao final do m\u00eas</strong></span>.
              {goalsAtRisk > 0 && <> Aten\u00e7\u00e3o: <span style={{ color: '#f59e0b' }}><strong>{goalsAtRisk} meta(s) abaixo do ritmo</strong></span>.</>}
            </>
            : <>Em {now.toLocaleDateString('pt-BR', { month: 'long' })} voc\u00ea tem <span style={{ color: '#f59e0b' }}>
              <strong>{budgetsOver} or\u00e7amento(s) estourado(s)</strong></span>.
              Saldo atual: <span style={{ color: '#10b981' }}><strong>{fmt(balance)}</strong></span>.
              {topExpenseCat && <> Maior gasto: <strong>{topExpenseCat.name}</strong> com {topExpensePct}% da renda.</>}
            </>
          }
        </p>
        <div className="flex items-center gap-2.5 mt-3.5 pt-3.5 px-4 py-[11px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl">
          <input
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: 'var(--sl-t1)' }}
            placeholder="Pergunte algo sobre sua vida..."
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAiAsk() }}
          />
          <button
            className="px-[18px] py-[7px] rounded-[9px] text-[12px] font-semibold text-white cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap disabled:opacity-50"
            style={{ background: '#6366f1', border: 'none' }}
            onClick={handleAiAsk}
            disabled={aiLoading || !aiQuery.trim()}
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : 'Enviar'}
          </button>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-3 px-4 py-3 rounded-[12px]" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(99,102,241,.12)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#6366f1]">Resposta da IA</span>
              {aiLoading && <Loader2 size={10} className="animate-spin text-[#6366f1]" />}
            </div>
            <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  )
}
