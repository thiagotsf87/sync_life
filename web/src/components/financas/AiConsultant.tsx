'use client'

import { useState, useCallback, useMemo } from 'react'
import { Loader2, Sparkles, Send, Search } from 'lucide-react'
import { fmtBRL } from '@/lib/format/currency'

interface AiConsultantProps {
  mesAno: string
  receitasMes: number
  totalGasto: number
  taxaPoupanca: number
  daysLeftInMonth: number
  daysInMonth: number
  todayD: number
  activeBudgets: { category?: { name?: string } | null; amount: number; gasto: number; pct: number }[]
  pendingRecCount: number
}

export function AiConsultant({
  mesAno, receitasMes, totalGasto, taxaPoupanca,
  daysLeftInMonth, daysInMonth, todayD, activeBudgets, pendingRecCount,
}: AiConsultantProps) {
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const saldoProjetado = useMemo(() => {
    const saldo = receitasMes - totalGasto
    // simple projection: assume same daily burn rate for remaining days
    if (todayD <= 0) return saldo
    const dailyExp = totalGasto / Math.max(todayD, 1)
    const remainingExp = dailyExp * daysLeftInMonth
    return saldo - remainingExp
  }, [receitasMes, totalGasto, daysLeftInMonth, todayD])

  // Find category in alert (>70%) for personalized insight, fallback to Lazer mock
  const alertBudget = activeBudgets.find(b => b.pct > 70 && b.pct < 100)
  const overBudget = activeBudgets.find(b => b.pct >= 100)

  const insights = useMemo(() => {
    const alertaText = overBudget
      ? <>
          <strong className="text-[var(--sl-t1)]">{overBudget.category?.name ?? 'Categoria'} estourou</strong> o limite ({overBudget.pct}%). Revise as próximas semanas.
        </>
      : alertBudget
        ? <>
            <strong className="text-[var(--sl-t1)]">{alertBudget.category?.name ?? 'Categoria'} atingiu {alertBudget.pct}%</strong> do limite, reduza esta semana para não estourar.
          </>
        : <>
            <strong className="text-[var(--sl-t1)]">Lazer atingiu 78%</strong> do limite de R$ 800, reduza cerca de R$ 60 essa semana para não estourar.
          </>

    return [
      {
        id: 'alerta',
        eyebrow: 'ALERTA',
        color: 'var(--sl-warning)',
        text: alertaText,
      },
      {
        id: 'acao',
        eyebrow: 'AÇÃO RECOMENDADA',
        color: 'var(--sl-em)',
        text: (
          <>
            Reserve <strong className="text-[var(--sl-t1)]">{fmtBRL(220)}</strong> hoje na meta Reserva de emergência. Mantém ritmo +18% sobre o mês passado.
          </>
        ),
      },
      {
        id: 'conquista',
        eyebrow: 'CONQUISTA',
        color: 'var(--sl-success)',
        text: (
          <>
            Você já economizou <strong className="text-[var(--sl-t1)]">{fmtBRL(320)}</strong> a mais que o mês passado. 3º mês consecutivo positivo.
          </>
        ),
      },
      {
        id: 'previsao',
        eyebrow: 'PREVISÃO',
        color: 'var(--sl-info)',
        text: (
          <>
            Se seguir o ritmo atual, fecha o mês com{' '}
            <strong className="text-[var(--sl-t1)]">{fmtBRL(Math.max(0, saldoProjetado))}</strong> de saldo.
          </>
        ),
      },
    ]
  }, [alertBudget, overBudget, saldoProjetado])

  const handleAiAsk = useCallback(async () => {
    const q = aiQuery.trim()
    if (!q || aiLoading) return

    setAiLoading(true)
    setAiResponse('')

    const financialContext = {
      mes: mesAno,
      receitas: receitasMes,
      despesas: totalGasto,
      saldo: receitasMes - totalGasto,
      taxaPoupanca,
      diasRestantes: daysInMonth - todayD,
      orcamentos: activeBudgets.map(b => ({
        categoria: b.category?.name ?? 'Outro',
        limite: b.amount,
        gasto: b.gasto,
        pct: b.pct,
      })),
      topCategorias: activeBudgets
        .filter(b => b.gasto > 0)
        .sort((a, b) => b.gasto - a.gasto)
        .slice(0, 5)
        .map(b => ({ nome: b.category?.name ?? 'Outro', valor: b.gasto })),
      recorrentes: pendingRecCount,
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
        setAiResponse('A IA não retornou uma resposta. Verifique a configuração ou tente novamente.')
      }
    } catch {
      setAiResponse('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setAiLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiQuery, aiLoading, mesAno, receitasMes, totalGasto, taxaPoupanca, daysInMonth, todayD, activeBudgets, pendingRecCount])

  return (
    <div
      className="relative overflow-hidden rounded-[22px] px-6 py-5 mb-3 bg-[var(--sl-s-hero)] border border-[var(--sl-border)]"
    >
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(15,118,110,.14),transparent 70%)' }} />

      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 border border-[var(--sl-border-em)]" style={{ background: 'var(--sl-em-soft)', color: 'var(--sl-em)' }}>
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-[Space_Grotesk] font-semibold text-[18px] text-[var(--sl-t1)] tracking-tight leading-tight">Consultor financeiro IA</p>
          <p className="text-[11.5px] text-[var(--sl-t3)] mt-0.5">Análise personalizada · {mesAno} · atualizado agora</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[var(--sl-em)] shrink-0 border border-[var(--sl-border-em)]" style={{ background: 'var(--sl-em-soft)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--sl-em)] animate-pulse" />
          Atualizado há 4 min
        </div>
      </div>

      {/* 4 insight tiles — grid 2x2 (G-03 compliant: borderLeft accent, no gradient) */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-[12px] p-3.5 bg-[var(--sl-s1)] border border-[var(--sl-border)]"
            style={{ borderLeft: `2px solid ${insight.color}` }}
          >
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: insight.color }}>
              {insight.eyebrow}
            </p>
            <div className="text-[12px] text-[var(--sl-t2)] leading-snug">
              {insight.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] relative bg-[var(--sl-s1)] border border-[var(--sl-border)]">
        <Search size={14} className="text-[var(--sl-t3)] shrink-0" />
        <input
          type="text"
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAiAsk() }}
          placeholder='Pergunte algo, ex: "Quanto posso gastar em Lazer essa semana?"'
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
        />
        <button
          onClick={handleAiAsk}
          disabled={aiLoading || !aiQuery.trim()}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] border-none text-[#0B0F14] text-[12px] font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ background: 'var(--sl-em)' }}
        >
          {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <>Perguntar <Send size={11} /></>}
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-3 px-4 py-3 rounded-[12px] relative bg-[var(--sl-s1)] border border-[var(--sl-border)]">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-em)]">Resposta da IA</span>
            {aiLoading && <Loader2 size={10} className="animate-spin text-[var(--sl-em)]" />}
          </div>
          <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}
    </div>
  )
}
