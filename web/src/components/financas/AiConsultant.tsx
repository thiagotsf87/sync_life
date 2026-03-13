'use client'

import { useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

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
      className="relative overflow-hidden rounded-[14px] px-5 py-[18px] mb-3"
      style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.10),rgba(0,85,255,.10))', border: '1px solid rgba(16,185,129,.28)' }}
    >
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)' }} />
      <div className="absolute -bottom-10 left-1/3 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,85,255,.10),transparent 70%)' }} />

      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', boxShadow: '0 4px 16px rgba(16,185,129,.35)' }}>
          💡
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] tracking-tight">Consultor Financeiro IA</p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Análise personalizada · {mesAno} · atualizado agora</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold text-[#10b981] shrink-0" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.20)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          4 insights hoje
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 max-sm:grid-cols-1 relative">
        {[
          { type: 'urgent', ico: '🔥', tag: 'Alerta', border: 'rgba(244,63,94,.25)', bg: 'rgba(244,63,94,.04)', tagColor: '#f43f5e', text: <><strong>Lazer atingiu 82%</strong> do orçamento. Com {daysLeftInMonth} dias restantes, risco de estouro.</> },
          { type: 'action', ico: '🎯', tag: 'Ação recomendada', border: 'rgba(0,85,255,.20)', bg: 'rgba(0,85,255,.04)', tagColor: '#0055ff', text: <>Meta <strong>Reserva de emergência</strong> está abaixo do ritmo. Considere um aporte extra este mês.</> },
          { type: 'positive', ico: '🌟', tag: 'Conquista', border: 'rgba(16,185,129,.20)', bg: 'rgba(16,185,129,.04)', tagColor: '#10b981', text: <>Taxa de poupança em <strong>{taxaPoupanca}%</strong>{taxaPoupanca >= 30 ? ' — acima da meta de 30%! Continue!' : ' — tente chegar a 30% este mês.'}</> },
          { type: 'heads-up', ico: '📅', tag: 'Previsão', border: 'rgba(245,158,11,.20)', bg: 'rgba(245,158,11,.04)', tagColor: '#f59e0b', text: <>Faltam <strong>{daysLeftInMonth} dias</strong> no mês. Revise seus orçamentos e planeje os gastos restantes.</> },
        ].map(ins => (
          <div
            key={ins.type}
            className="flex gap-2.5 px-3 py-3 rounded-[11px] cursor-default group relative overflow-hidden transition-all duration-200"
            style={{ border: `1px solid ${ins.border}`, background: ins.bg }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 16px ${ins.border}` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <span className="text-[20px] shrink-0 leading-none mt-0.5">{ins.ico}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: ins.tagColor }}>{ins.tag}</p>
              <p className="text-[12px] text-[var(--sl-t2)] leading-snug">{ins.text}</p>
            </div>
            <div className="absolute bottom-0 left-[10%] right-[10%] h-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ins.tagColor, boxShadow: `0 0 8px ${ins.tagColor}` }} />
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] relative"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(16,185,129,.15)' }}
      >
        <span className="text-sm opacity-70">💬</span>
        <input
          type="text"
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAiAsk() }}
          placeholder='Pergunte algo... ex: "Quanto gastei em lazer este mês?"'
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
        />
        <button
          onClick={handleAiAsk}
          disabled={aiLoading || !aiQuery.trim()}
          className="shrink-0 px-3 py-1.5 rounded-[8px] border-none text-white text-[12px] font-bold transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}
        >
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : 'Perguntar'}
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-3 px-4 py-3 rounded-[12px] relative" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(16,185,129,.12)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#10b981]">Resposta da IA</span>
            {aiLoading && <Loader2 size={10} className="animate-spin text-[#10b981]" />}
          </div>
          <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}
    </div>
  )
}
