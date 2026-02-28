'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Download, FileText, BarChart2, Lock, TrendingUp, Search, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SLCard } from '@/components/ui/sl-card'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  useRelatorios,
  PERIOD_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAGE_SIZE,
  PeriodKey,
  calcDeltaPct,
  generateNarrative,
} from '@/hooks/use-relatorios'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtR(value: number): string {
  const abs = Math.abs(value)
  const prefix = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${prefix}R$ ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${prefix}R$ ${(abs / 1_000).toFixed(1)}k`
  return `${prefix}R$ ${abs.toFixed(2).replace('.', ',')}`
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${String(y).slice(2)}`
}

const PERIOD_LABELS: Record<string, string> = {
  mes:    'Mês atual',
  tri:    'Último trimestre',
  sem:    'Último semestre',
  '12m':  'Últimos 12 meses',
  ano:    'Ano atual',
  custom: 'Personalizado',
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'
  const { isPro } = useUserPlan()

  const {
    period, setPeriod,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    transactions, profile,
    loading, error,
    periodStats, catCompData, savingsRateData,
    lineChartData, lineChartCats,
    barChartData, topExpenses,
    handleGenerate, exportCSV,
  } = useRelatorios()

  // Table state
  const [tableSearch, setTableSearch] = useState('')
  const [tableFilter, setTableFilter] = useState('todos')
  const [page, setPage] = useState(1)

  // AI narrative state
  const [aiNarrative, setAiNarrative] = useState('')
  const [aiNarrativeLoading, setAiNarrativeLoading] = useState(false)

  // Derived
  const periodLabel = PERIOD_LABELS[period] ?? period

  const recipeDelta  = calcDeltaPct(periodStats.totalRecipes,    periodStats.prevTotalRecipes)
  const expenseDelta = calcDeltaPct(periodStats.totalExpenses,   periodStats.prevTotalExpenses)
  const balanceDelta = calcDeltaPct(periodStats.totalBalance,    periodStats.prevTotalBalance)
  const savingsDelta = calcDeltaPct(periodStats.avgSavingsRate,  periodStats.prevAvgSavingsRate)

  const maxCatValue = useMemo(() =>
    catCompData.length > 0
      ? Math.max(...catCompData.map(c => Math.max(c.currentTotal, c.prevTotal)))
      : 1,
    [catCompData]
  )

  const goalRate = profile?.savings_goal_pct ?? 20
  const maxSavingsRate = useMemo(() =>
    Math.max(goalRate * 1.5, ...savingsRateData.map(m => m.rate), 1),
    [savingsRateData, goalRate]
  )
  const bestMonthSavings = useMemo(() =>
    savingsRateData.length > 0
      ? savingsRateData.reduce((best, m) => m.rate > best.rate ? m : best)
      : null,
    [savingsRateData]
  )
  const worstMonthSavings = useMemo(() =>
    savingsRateData.length > 0
      ? savingsRateData.reduce((worst, m) => m.rate < worst.rate ? m : worst)
      : null,
    [savingsRateData]
  )

  // Narrative
  const { text: narrativeText, tags: narrativeTags } = useMemo(() =>
    generateNarrative(periodStats, periodLabel, fmtR),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periodStats, periodLabel]
  )

  // Filtered/paginated table
  const filteredTxs = useMemo(() => {
    let txs = [...transactions]
    if (tableFilter === 'receitas') txs = txs.filter(t => t.type === 'income')
    if (tableFilter === 'despesas') txs = txs.filter(t => t.type === 'expense')
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase()
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.categories?.name ?? '').toLowerCase().includes(q)
      )
    }
    return txs
  }, [transactions, tableFilter, tableSearch])

  const paginatedTxs = useMemo(() =>
    filteredTxs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTxs, page]
  )

  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / PAGE_SIZE))

  const handleFilterChange = (f: string) => { setTableFilter(f); setPage(1) }
  const handleSearchChange = (s: string) => { setTableSearch(s); setPage(1) }

  // KPI helpers
  function getDeltaColor(type: 'recipes' | 'expenses' | 'balance' | 'savings', delta: number | null): string {
    if (delta === null) return 'text-[var(--sl-t3)]'
    if (type === 'expenses') return delta > 0 ? 'text-[#f43f5e]' : 'text-[#10b981]'
    return delta > 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
  }

  // ── AI Narrative Regenerate ─────────────────────────────────────────────
  const handleRegenerate = useCallback(async () => {
    if (aiNarrativeLoading) return
    setAiNarrativeLoading(true)
    setAiNarrative('')

    const financialContext = {
      periodo: periodLabel,
      meses: periodStats.monthCount,
      transacoes: periodStats.txCount,
      receitasTotais: periodStats.totalRecipes,
      despesasTotais: periodStats.totalExpenses,
      saldoAcumulado: periodStats.totalBalance,
      taxaPoupancaMedia: periodStats.avgSavingsRate,
      receitasAnterior: periodStats.prevTotalRecipes,
      despesasAnterior: periodStats.prevTotalExpenses,
      saldoAnterior: periodStats.prevTotalBalance,
      taxaPoupancaAnterior: periodStats.prevAvgSavingsRate,
      topCategorias: catCompData.slice(0, 5).map(c => ({
        nome: c.name,
        gastoAtual: c.currentTotal,
        gastoAnterior: c.prevTotal,
        delta: c.delta,
      })),
    }

    try {
      const res = await fetch('/api/ai/financas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Gere uma análise narrativa detalhada do período financeiro "${periodLabel}". Compare com o período anterior, destaque tendências positivas e negativas, e sugira 2-3 ações concretas para melhorar.`,
          }],
          financialContext,
        }),
      })

      if (!res.ok || !res.body) {
        setAiNarrative('Erro ao gerar análise. Tente novamente.')
        setAiNarrativeLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setAiNarrative(text)
      }
    } catch {
      setAiNarrative('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setAiNarrativeLoading(false)
    }
  }, [aiNarrativeLoading, periodLabel, periodStats, catCompData])

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-0.5">
            <span className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
            Módulo Finanças · Análise
          </div>
          <h1 className={cn(
            'font-[Syne] font-extrabold text-[22px] tracking-tight',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
          )}>
            📊 Relatórios Históricos
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
            {periodLabel} · {periodStats.monthCount} {periodStats.monthCount === 1 ? 'mês' : 'meses'} · {periodStats.txCount} transações
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t1)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)] transition-all">
            <Download size={13} />
            Exportar CSV
          </button>
          <button
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[rgba(16,185,129,0.25)] bg-gradient-to-br from-[rgba(16,185,129,0.1)] to-[rgba(0,85,255,0.08)] text-[#10b981] text-[12px] font-semibold cursor-pointer transition-all opacity-60">
            <FileText size={13} />
            PDF
            {!isPro && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(0,85,255,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.25)] ml-0.5">
                <Lock size={9} /> PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Upgrade Banner (FREE) ───────────────────────────────── */}
      {!isPro && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-[rgba(245,158,11,0.08)] to-[rgba(249,115,22,0.06)] border border-[rgba(245,158,11,0.2)] rounded-[10px] px-3.5 py-2.5 mb-3.5">
          <span className="text-[16px] shrink-0">🔒</span>
          <p className="flex-1 text-[12px] text-[var(--sl-t2)] leading-relaxed">
            Você está no plano <strong className="text-[var(--sl-t1)]">Gratuito</strong>. Acesse qualquer período,
            exportação PDF/Excel e análise narrativa de IA com o <strong className="text-[var(--sl-t1)]">Plano PRO</strong>.
          </p>
          <button className="px-3.5 py-1.5 rounded-[8px] border-none bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-white text-[11px] font-bold cursor-pointer shrink-0 whitespace-nowrap">
            Upgrade PRO — R$29/mês
          </button>
        </div>
      )}

      {/* ── Period Selector ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-3.5 py-2.5 mb-3.5 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] whitespace-nowrap mr-0.5">
          Período
        </span>

        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key as PeriodKey)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-[5px] rounded-[8px] border text-[12px] cursor-pointer transition-all whitespace-nowrap',
              period === opt.key
                ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)] font-semibold'
                : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
            )}>
            {opt.label}
            {opt.proOnly && !isPro && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(0,85,255,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.25)]">
                <Lock size={8} /> PRO
              </span>
            )}
          </button>
        ))}

        <div className="w-px h-[18px] bg-[var(--sl-border)] flex-shrink-0 mx-0.5" />

        <input
          type="date"
          value={customStart}
          onChange={e => setCustomStart(e.target.value)}
          max={customEnd}
          disabled={period !== 'custom'}
          className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-2 py-[5px] text-[11px] text-[var(--sl-t2)] outline-none focus:border-[rgba(16,185,129,0.35)] disabled:opacity-40 cursor-pointer"
        />
        <span className="text-[12px] text-[var(--sl-t3)] px-0.5">→</span>
        <input
          type="date"
          value={customEnd}
          onChange={e => setCustomEnd(e.target.value)}
          min={customStart}
          max={new Date().toISOString().split('T')[0]}
          disabled={period !== 'custom'}
          className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-2 py-[5px] text-[11px] text-[var(--sl-t2)] outline-none focus:border-[rgba(16,185,129,0.35)] disabled:opacity-40 cursor-pointer"
        />

        <span className="flex-1" />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[9px] border-none bg-[#10b981] text-white text-[12px] font-bold cursor-pointer shrink-0 disabled:opacity-60 hover:bg-[#0da876] transition-colors">
          <BarChart2 size={13} />
          {loading ? 'Carregando...' : 'Gerar relatório'}
        </button>
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-4">
          Erro ao carregar dados.{' '}
          <button onClick={handleGenerate} className="underline">Tentar novamente</button>
        </div>
      )}

      {/* ── Narrative Band (Jornada only) ───────────────────────── */}
      <div className="jornada-only flex items-start gap-3.5 bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] border border-[rgba(16,185,129,0.18)] rounded-2xl px-5 py-4 mb-3">
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
              onClick={handleRegenerate}
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

      {/* ── Loading skeleton ────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-4 gap-2.5 mb-3 max-lg:grid-cols-2 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <div className="h-3 w-16 bg-[var(--sl-s3)] rounded mb-3" />
              <div className="h-6 w-24 bg-[var(--sl-s3)] rounded mb-2" />
              <div className="h-3 w-20 bg-[var(--sl-s3)] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!loading && transactions.length === 0 && (
        <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl p-12 text-center mb-4">
          <span className="text-[40px] block mb-3 opacity-70">📊</span>
          <h3 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1.5">
            Nenhuma transação no período
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)]">
            Selecione outro período ou registre transações para ver os relatórios.
          </p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <>
          {/* ── KPI Comparativo ────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-2.5 mb-3 max-lg:grid-cols-2">

            {/* Receitas */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#10b981]" />
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(16,185,129,0.12)]">💰</div>
              <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Receitas Totais</p>
              <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
              <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#10b981]">
                {fmtR(periodStats.totalRecipes)}
              </p>
              <div className={cn('text-[11px]', getDeltaColor('recipes', recipeDelta))}>
                {recipeDelta !== null && (
                  <>{recipeDelta > 0 ? '↑' : '↓'} {Math.abs(recipeDelta).toFixed(1)}%</>
                )}
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                vs anterior: {fmtR(periodStats.prevTotalRecipes)}
              </p>
            </div>

            {/* Despesas */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-1">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#f43f5e]" />
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(244,63,94,0.12)]">💸</div>
              <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Despesas Totais</p>
              <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
              <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#f43f5e]">
                {fmtR(periodStats.totalExpenses)}
              </p>
              <div className={cn('text-[11px]', getDeltaColor('expenses', expenseDelta))}>
                {expenseDelta !== null && (
                  <>{expenseDelta > 0 ? '↑' : '↓'} {Math.abs(expenseDelta).toFixed(1)}%
                  {expenseDelta > 5 ? ' ⚠' : ''}</>
                )}
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                vs anterior: {fmtR(periodStats.prevTotalExpenses)}
              </p>
            </div>

            {/* Saldo */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
              <div
                className="absolute top-0 left-4 right-4 h-0.5 rounded-b"
                style={{ background: periodStats.totalBalance >= 0 ? '#10b981' : '#f43f5e' }}
              />
              <div
                className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5"
                style={{ background: periodStats.totalBalance >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)' }}>
                📈
              </div>
              <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Saldo Acumulado</p>
              <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
              <p
                className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5"
                style={{ color: periodStats.totalBalance >= 0 ? '#10b981' : '#f43f5e' }}>
                {fmtR(periodStats.totalBalance)}
              </p>
              <div className={cn('text-[11px]', getDeltaColor('balance', balanceDelta))}>
                {balanceDelta !== null && (
                  <>{balanceDelta > 0 ? '↑' : '↓'} {Math.abs(balanceDelta).toFixed(1)}%</>
                )}
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                vs anterior: {fmtR(periodStats.prevTotalBalance)}
              </p>
            </div>

            {/* Taxa de Poupança */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-3">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#f59e0b]" />
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(245,158,11,0.12)]">💹</div>
              <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Taxa de Poupança</p>
              <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Média mensal</p>
              <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#f59e0b]">
                {periodStats.avgSavingsRate.toFixed(1)}%
              </p>
              <div className={cn('text-[11px]', getDeltaColor('savings', savingsDelta))}>
                {savingsDelta !== null && (
                  <>{savingsDelta > 0 ? '↑' : '↓'} {Math.abs(savingsDelta).toFixed(1)}%</>
                )}
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                vs anterior: {periodStats.prevAvgSavingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* ── Charts Main (2 col) ─────────────────────────────── */}
          <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">

            {/* Multi-line: tendência por categoria */}
            <SLCard className="flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] flex items-center gap-1.5">
                  <TrendingUp size={15} />
                  Tendência de Gastos por Categoria
                </p>
                <span className="text-[11px] text-[var(--sl-t3)]">mês a mês no período</span>
              </div>
              {lineChartData.length > 0 && lineChartCats.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={lineChartData}>
                      <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }}
                        axisLine={false} tickLine={false}
                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                      />
                      <Tooltip
                        contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
                        formatter={(val: number | undefined, name: string | undefined) => [fmtR(val ?? 0), name ?? '']}
                      />
                      {lineChartCats.map(cat => (
                        <Line
                          key={cat.name}
                          type="monotone"
                          dataKey={cat.name}
                          stroke={cat.color}
                          strokeWidth={2}
                          dot={{ r: 3.5, fill: cat.color }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex gap-3.5 flex-wrap mt-2 shrink-0">
                    {lineChartCats.map(cat => (
                      <span key={cat.name} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
                        <span className="w-3 h-[3px] rounded-[2px] inline-block" style={{ background: cat.color }} />
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-[var(--sl-t3)] text-[12px]">
                  Sem dados suficientes para o gráfico
                </div>
              )}
            </SLCard>

            {/* Cat-comp: categorias período vs anterior */}
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
          </div>

          {/* ── Charts Bottom (2 col) ───────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 mb-4 max-lg:grid-cols-1">

            {/* Bar chart: receitas/despesas por mês */}
            <SLCard>
              <div className="flex items-center justify-between mb-3">
                <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
                  Receitas vs Despesas por Mês
                </p>
              </div>
              {barChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={barChartData} barGap={2}>
                      <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
                        formatter={(val: number | undefined, name: string | undefined) => [fmtR(val ?? 0), name === 'receitas' ? 'Receitas' : 'Despesas']}
                      />
                      <Bar dataKey="receitas" fill="#10b981" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="despesas" fill="#f43f5e" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--sl-t3)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] opacity-70" /> Receitas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e] opacity-60" /> Despesas
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[150px] text-[var(--sl-t3)] text-[12px]">
                  Sem dados para o gráfico
                </div>
              )}
            </SLCard>

            {/* Savings rate visualization */}
            <SLCard>
              <div className="flex items-center justify-between mb-3">
                <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
                  Taxa de Poupança Mensal
                </p>
                <span className="text-[11px] text-[var(--sl-t3)]">Meta: {goalRate}%</span>
              </div>

              {savingsRateData.length === 0 ? (
                <div className="flex items-center justify-center h-[120px] text-[var(--sl-t3)] text-[12px]">
                  Sem dados para o período
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    {savingsRateData.map(m => (
                      <div key={m.monthShort} className="flex items-center gap-2">
                        <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] w-12 shrink-0 truncate">{m.month}</span>
                        <div className="flex-1 relative">
                          <div className="w-full h-[10px] bg-[var(--sl-s2)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-[width] duration-700"
                              style={{
                                width: `${Math.min((m.rate / maxSavingsRate) * 100, 100)}%`,
                                background: m.rate >= goalRate ? '#10b981' : m.rate >= goalRate * 0.75 ? '#f59e0b' : '#f43f5e',
                              }}
                            />
                          </div>
                          <div
                            className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-[rgba(244,63,94,0.7)] rounded-[1px] z-[2] pointer-events-none"
                            style={{ left: `${Math.min((goalRate / maxSavingsRate) * 100, 99)}%` }}
                          />
                        </div>
                        <span className={cn(
                          'font-[DM_Mono] text-[11px] min-w-[36px] text-right shrink-0',
                          m.rate >= goalRate ? 'text-[#10b981]' : 'text-[#f43f5e]'
                        )}>
                          {m.rate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center pl-12 pr-11 mt-0.5">
                    <span className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)]">0%</span>
                    <span className="ml-auto font-[DM_Mono] text-[9px] text-[rgba(244,63,94,0.5)]">Meta {goalRate}%</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[var(--sl-border)]">
                    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                      <span
                        className="font-[DM_Mono] text-[13px] font-medium"
                        style={{ color: periodStats.avgSavingsRate >= goalRate ? '#10b981' : '#f43f5e' }}>
                        {periodStats.avgSavingsRate.toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Média do período</span>
                    </div>
                    <div className="w-px h-7 bg-[var(--sl-border)] shrink-0" />
                    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                      <span className="font-[DM_Mono] text-[13px] font-medium text-[#10b981] truncate w-full text-center">
                        {bestMonthSavings ? `${bestMonthSavings.month} (${bestMonthSavings.rate.toFixed(0)}%)` : '—'}
                      </span>
                      <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Melhor mês</span>
                    </div>
                    <div className="w-px h-7 bg-[var(--sl-border)] shrink-0" />
                    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                      <span className="font-[DM_Mono] text-[13px] font-medium text-[#f43f5e] truncate w-full text-center">
                        {worstMonthSavings ? `${worstMonthSavings.month} (${worstMonthSavings.rate.toFixed(0)}%)` : '—'}
                      </span>
                      <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Pior mês</span>
                    </div>
                  </div>
                </>
              )}
            </SLCard>
          </div>

          {/* ── Top Gastos ──────────────────────────────────────── */}
          <SLCard className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
                🏆 Top Despesas do Período
              </p>
              <span className="text-[11px] text-[var(--sl-t3)]">maiores gastos individuais</span>
            </div>
            {topExpenses.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] py-4 text-center">Nenhuma despesa no período</p>
            ) : (
              <div className="flex flex-col gap-1">
                {topExpenses.map((txn, i) => (
                  <div
                    key={txn.id}
                    className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] hover:bg-[var(--sl-s2)] transition-colors">
                    <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] w-3.5 text-center shrink-0">{i + 1}</span>
                    <span className="text-[14px] shrink-0">{txn.categories?.icon ?? '📤'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">{txn.description}</p>
                      <p className="text-[10px] text-[var(--sl-t3)]">{txn.categories?.name ?? '—'}</p>
                    </div>
                    <span className="font-[DM_Mono] text-[13px] text-[#f43f5e] shrink-0">{fmtR(txn.amount)}</span>
                    <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] shrink-0">{formatDate(txn.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </SLCard>

          {/* ── Tabela Completa ─────────────────────────────────── */}
          <SLCard className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[120px]">
                <Search size={13} className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--sl-t3)] pointer-events-none" />
                <input
                  value={tableSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Buscar transação..."
                  className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] py-1.5 pl-8 pr-3 text-[var(--sl-t1)] text-[12px] outline-none placeholder:text-[var(--sl-t3)] focus:border-[rgba(16,185,129,0.35)]"
                />
              </div>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'receitas', label: 'Receitas' },
                { key: 'despesas', label: 'Despesas' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => handleFilterChange(f.key)}
                  className={cn(
                    'px-2.5 py-[5px] rounded-[8px] border text-[11px] cursor-pointer transition-all',
                    tableFilter === f.key
                      ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                      : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    {['Data', 'Descrição', 'Categoria', 'Método', 'Valor'].map(h => (
                      <th
                        key={h}
                        className="text-left text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] px-2.5 py-1.5 border-b border-[var(--sl-border)] font-semibold last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTxs.map(txn => (
                    <tr key={txn.id} className="group">
                      <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[11px] text-[var(--sl-t3)] group-hover:bg-[var(--sl-s2)]">
                        {formatDate(txn.date)}
                      </td>
                      <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[var(--sl-t1)] font-medium max-w-[160px] truncate text-[12px] group-hover:bg-[var(--sl-s2)]">
                        {txn.description}
                      </td>
                      <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)]">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium"
                          style={{
                            background: `${txn.categories?.color ?? '#6b7280'}20`,
                            color: txn.categories?.color ?? '#6b7280',
                          }}>
                          {txn.categories?.icon} {txn.categories?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[11px] text-[var(--sl-t3)] group-hover:bg-[var(--sl-s2)]">
                        {txn.payment_method ? (PAYMENT_METHOD_LABELS[txn.payment_method] ?? txn.payment_method) : '—'}
                      </td>
                      <td className={cn(
                        'px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[12px] font-medium text-right group-hover:bg-[var(--sl-s2)]',
                        txn.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
                      )}>
                        {txn.type === 'income' ? '+' : '−'}{fmtR(txn.amount)}
                      </td>
                    </tr>
                  ))}
                  {paginatedTxs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[12px] text-[var(--sl-t3)]">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {filteredTxs.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-[var(--sl-t3)]">
                  Exibindo {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTxs.length)} de {filteredTxs.length}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          'px-2.5 py-1 rounded-[7px] border text-[11px] cursor-pointer transition-all',
                          p === page
                            ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                            : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
                        )}>
                        {p}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </SLCard>

          {/* ── Export Panel ─────────────────────────────────────── */}
          <SLCard>
            <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] mb-3">Exportar Dados</p>
            <div className="flex flex-col divide-y divide-[var(--sl-border)]">
              {[
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
              ].map((item, i) => {
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
        </>
      )}
    </div>
  )
}
