'use client'

import { useState, useMemo, useCallback } from 'react'
import { Download, FileText, BarChart2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  useRelatorios,
  PERIOD_OPTIONS,
  PeriodKey,
  calcDeltaPct,
  generateNarrative,
} from '@/hooks/use-relatorios'
import { fmtR, PERIOD_LABELS } from '@/components/financas/relatorios-helpers'
import { RelatoriosMobileView } from '@/components/financas/RelatoriosMobileView'
import { RelatoriosKpiStrip } from '@/components/financas/RelatoriosKpiStrip'
import { RelatoriosTrendChart } from '@/components/financas/RelatoriosTrendChart'
import { RelatoriosCategoryComparison } from '@/components/financas/RelatoriosCategoryComparison'
import { RelatoriosBarChart } from '@/components/financas/RelatoriosBarChart'
import { RelatoriosSavingsRate } from '@/components/financas/RelatoriosSavingsRate'
import { RelatoriosTopExpenses } from '@/components/financas/RelatoriosTopExpenses'
import { RelatoriosTransactionTable } from '@/components/financas/RelatoriosTransactionTable'
import { RelatoriosExportPanel } from '@/components/financas/RelatoriosExportPanel'
import { RelatoriosNarrativeBand } from '@/components/financas/RelatoriosNarrativeBand'

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
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
    <>
      {/* ═══════════ MOBILE VIEW ═══════════ */}
      <RelatoriosMobileView
        period={period}
        setPeriod={setPeriod}
        isPro={isPro}
        periodStats={periodStats}
        catCompData={catCompData}
        barChartData={barChartData}
        expenseDelta={expenseDelta}
        exportCSV={exportCSV}
      />

      {/* ═══════════ DESKTOP VIEW ═══════════ */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-0.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
              Módulo Finanças · Análise
            </div>
            <h1 className={cn(
              'font-[Syne] font-extrabold text-[22px] tracking-tight',
              'text-sl-grad'
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

      {/* ── Narrative Band ────────────────────────────────────── */}
      <RelatoriosNarrativeBand
        periodLabel={periodLabel}
        narrativeText={narrativeText}
        narrativeTags={narrativeTags}
        aiNarrative={aiNarrative}
        aiNarrativeLoading={aiNarrativeLoading}
        onRegenerate={handleRegenerate}
      />

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
          <RelatoriosKpiStrip
            periodStats={periodStats}
            periodLabel={periodLabel}
            recipeDelta={recipeDelta}
            expenseDelta={expenseDelta}
            balanceDelta={balanceDelta}
            savingsDelta={savingsDelta}
          />

          {/* ── Charts Main (2 col) ─────────────────────────────── */}
          <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">
            <RelatoriosTrendChart
              lineChartData={lineChartData}
              lineChartCats={lineChartCats}
            />
            <RelatoriosCategoryComparison
              catCompData={catCompData}
              maxCatValue={maxCatValue}
            />
          </div>

          {/* ── Charts Bottom (2 col) ───────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 mb-4 max-lg:grid-cols-1">
            <RelatoriosBarChart barChartData={barChartData} />
            <RelatoriosSavingsRate
              savingsRateData={savingsRateData}
              goalRate={goalRate}
              maxSavingsRate={maxSavingsRate}
              avgSavingsRate={periodStats.avgSavingsRate}
              bestMonthSavings={bestMonthSavings}
              worstMonthSavings={worstMonthSavings}
            />
          </div>

          {/* ── Top Gastos ──────────────────────────────────────── */}
          <RelatoriosTopExpenses topExpenses={topExpenses} />

          {/* ── Tabela Completa ─────────────────────────────────── */}
          <RelatoriosTransactionTable transactions={transactions} />

          {/* ── Export Panel ─────────────────────────────────────── */}
          <RelatoriosExportPanel isPro={isPro} exportCSV={exportCSV} />
        </>
      )}
      </div>
    </>
  )
}
