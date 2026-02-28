'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  usePortfolioAssets, usePortfolioDividends,
  useAddDividend, useDeleteDividend, useUpdateDividendStatus,
  DIVIDEND_TYPE_LABELS, ASSET_CLASS_LABELS,
  type DividendType, type DividendStatus,
} from '@/hooks/use-patrimonio'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { createTransactionFromProvento } from '@/lib/integrations/financas'

interface DividendForm {
  asset_id: string
  type: DividendType
  amount_per_unit: string
  total_amount: string
  payment_date: string
  ex_date: string
  status: DividendStatus
  syncToFinancas: boolean
}

const EMPTY_FORM: DividendForm = {
  asset_id: '',
  type: 'dividend',
  amount_per_unit: '',
  total_amount: '',
  payment_date: new Date().toISOString().split('T')[0],
  ex_date: '',
  status: 'received',
  syncToFinancas: false,
}

const DIVIDEND_TYPE_ICONS: Record<DividendType, string> = {
  dividend: '💰',
  jcp: '🏦',
  fii_yield: '🏢',
  fixed_income_interest: '📋',
  other: '💵',
}

export default function ProventosPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { dividends, loading, error, reload } = usePortfolioDividends()
  const { assets } = usePortfolioAssets()
  const addDividend = useAddDividend()
  const deleteDividend = useDeleteDividend()
  const updateDividendStatus = useUpdateDividendStatus()

  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<DividendForm>(EMPTY_FORM)
  const [filterType, setFilterType] = useState<DividendType | 'all'>('all')
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear())

  // Asset map for display
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]))

  // Filtered dividends
  const filtered = dividends.filter(d => {
    const year = new Date(d.payment_date).getFullYear()
    return (filterType === 'all' || d.type === filterType) && year === filterYear
  })

  // Stats
  const totalYear = filtered.filter(d => d.status === 'received').reduce((s, d) => s + d.total_amount, 0)
  const year12Ago = new Date(); year12Ago.setMonth(year12Ago.getMonth() - 12)
  const total12m = dividends.filter(d => d.status === 'received' && new Date(d.payment_date) >= year12Ago).reduce((s, d) => s + d.total_amount, 0)
  const monthlyAvg = total12m / 12

  // Projeção anual = média mensal 12m × 12 (RN-PTR-15)
  const annualProjection = monthlyAvg * 12

  // Yield on Cost por ativo (RN-PTR-14): (proventos_12m / valor_investido) × 100
  const yocByAsset = assets
    .filter(a => a.quantity > 0 && a.avg_price > 0)
    .map(a => {
      const invested = a.quantity * a.avg_price
      const div12m = dividends
        .filter(d =>
          d.asset_id === a.id &&
          d.status === 'received' &&
          new Date(d.payment_date) >= year12Ago
        )
        .reduce((s, d) => s + d.total_amount, 0)
      const yoc = invested > 0 ? (div12m / invested) * 100 : 0
      return { ticker: a.ticker, yoc, div12m, invested }
    })
    .filter(x => x.div12m > 0)
    .sort((a, b) => b.yoc - a.yoc)

  const avgYoc = yocByAsset.length > 0
    ? yocByAsset.reduce((s, x) => s + x.yoc, 0) / yocByAsset.length
    : 0

  // Monthly breakdown
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const total = filtered
      .filter(d => {
        const date = new Date(d.payment_date)
        return date.getMonth() + 1 === month && d.status === 'received'
      })
      .reduce((s, d) => s + d.total_amount, 0)
    return { month, total }
  })
  const maxMonthly = Math.max(...monthlyTotals.map(m => m.total), 1)

  // By type breakdown
  const byType = filtered.reduce<Record<string, number>>((acc, d) => {
    if (d.status === 'received') acc[d.type] = (acc[d.type] ?? 0) + d.total_amount
    return acc
  }, {})

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  async function handleSave() {
    if (!form.asset_id) { toast.error('Selecione um ativo'); return }
    if (!form.total_amount) { toast.error('Informe o valor total'); return }
    setIsSaving(true)
    try {
      await addDividend({
        asset_id: form.asset_id,
        type: form.type,
        amount_per_unit: form.amount_per_unit ? parseFloat(form.amount_per_unit) : null,
        total_amount: parseFloat(form.total_amount),
        payment_date: form.payment_date,
        ex_date: form.ex_date || null,
        status: form.status,
      })
      // RN-PTR-12: sincronizar com Finanças
      if (form.status === 'received' && form.syncToFinancas) {
        const ticker = assetMap[form.asset_id]?.ticker ?? form.asset_id
        await createTransactionFromProvento({
          ticker,
          dividendType: form.type,
          totalAmount: parseFloat(form.total_amount),
          paymentDate: form.payment_date,
        })
      }
      toast.success('Provento registrado!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      await reload()
    } catch {
      toast.error('Erro ao registrar provento')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este provento?')) return
    try {
      await deleteDividend(id)
      toast.success('Provento removido')
      await reload()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  async function handleMarkAsReceived(id: string) {
    try {
      await updateDividendStatus(id, 'received')
      toast.success('Provento marcado como recebido')
      await reload()
    } catch {
      toast.error('Erro ao atualizar status do provento')
    }
  }

  const availableYears = Array.from(
    new Set(dividends.map(d => new Date(d.payment_date).getFullYear()))
  ).sort((a, b) => b - a)
  if (!availableYears.includes(new Date().getFullYear())) {
    availableYears.unshift(new Date().getFullYear())
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/patrimonio')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Patrimônio
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          💰 Proventos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Registrar Provento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {[
          { label: `Proventos ${filterYear}`, value: totalYear.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#10b981' },
          { label: 'Últimos 12 meses', value: total12m.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#f59e0b' },
          { label: 'Média mensal (12m)', value: monthlyAvg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#0055ff' },
          { label: 'Projeção anual', value: annualProjection.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#a855f7' },
        ].map(stat => (
          <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
            <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b" style={{ background: stat.color }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{stat.label}</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          monthlyAvg > 0
            ? <>Você recebe em média <strong className="text-[#10b981]">{monthlyAvg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> por mês em proventos.
              {monthlyAvg >= 5000 && <> Sua renda passiva já cobre despesas significativas — continue reinvestindo!</>}
            </>
            : <>Registre seus proventos para acompanhar sua renda passiva e evolução para a independência financeira.</>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-0.5">
          {availableYears.slice(0, 5).map(y => (
            <button key={y} onClick={() => setFilterYear(y)}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all',
                filterYear === y
                  ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                  : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
              )}
            >{y}</button>
          ))}
        </div>

        <div className="flex gap-1 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-0.5">
          {(['all', 'dividend', 'jcp', 'fii_yield', 'fixed_income_interest'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all',
                filterType === t
                  ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                  : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
              )}
            >
              {t === 'all' ? 'Todos' : DIVIDEND_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_260px] gap-4 max-lg:grid-cols-1">

          {/* Left: Monthly chart + list */}
          <div className="flex flex-col gap-4">

            {/* Monthly bar chart */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">📅 Proventos por mês — {filterYear}</h2>
              <div className="flex items-end gap-1.5 h-28">
                {monthlyTotals.map(({ month, total }) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${total > 0 ? Math.max((total / maxMonthly) * 96, 4) : 2}px`,
                        background: total > 0 ? '#10b981' : 'var(--sl-s3)',
                      }}
                    />
                    <span className="text-[8px] text-[var(--sl-t3)]">{months[month - 1]}</span>
                    {total > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--sl-s3)] text-[var(--sl-t1)] text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                        {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dividends list */}
            {filtered.length === 0 ? (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-2">Nenhum provento em {filterYear}</h3>
                <p className="text-[13px] text-[var(--sl-t2)] mb-4">Registre seus dividendos, rendimentos e juros.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90"
                >
                  <Plus size={15} />
                  Registrar Provento
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(d => {
                  const asset = assetMap[d.asset_id]
                  const date = new Date(d.payment_date)
                  return (
                    <div key={d.id} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl p-4 flex items-center gap-3 hover:border-[var(--sl-border-h)] transition-colors">
                      <div className="text-xl shrink-0">{DIVIDEND_TYPE_ICONS[d.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-[DM_Mono] font-bold text-[13px] text-[var(--sl-t1)]">
                            {asset?.ticker ?? '???'}
                          </span>
                          <span className="text-[10px] text-[var(--sl-t3)] bg-[var(--sl-s2)] px-1.5 py-0.5 rounded-full">
                            {DIVIDEND_TYPE_LABELS[d.type]}
                          </span>
                          {d.status === 'announced' && (
                            <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded-full">
                              Anunciado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-[var(--sl-t3)]">
                            {date.toLocaleDateString('pt-BR')}
                          </span>
                          {d.amount_per_unit != null && (
                            <span className="text-[11px] text-[var(--sl-t3)]">
                              {d.amount_per_unit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/unit
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-[DM_Mono] font-bold text-[14px] text-[#10b981]">
                          +{d.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      {d.status === 'announced' && (
                        <button
                          onClick={() => handleMarkAsReceived(d.id)}
                          className="px-2 py-1 rounded-[8px] text-[10px] font-bold border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/10 transition-colors shrink-0"
                        >
                          Marcar recebido
                        </button>
                      )}
                      <button onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors shrink-0"
                      >
                        <Trash2 size={13} className="text-[var(--sl-t3)]" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: by type breakdown */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🏷️ Por tipo</h2>
              {Object.keys(byType).length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Sem dados</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {Object.entries(byType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, total]) => {
                      const pct = totalYear > 0 ? (total / totalYear) * 100 : 0
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] text-[var(--sl-t2)]">
                              {DIVIDEND_TYPE_ICONS[type as DividendType]} {DIVIDEND_TYPE_LABELS[type as DividendType]}
                            </span>
                            <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{pct.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
                              <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] mt-0.5">
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* By asset */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🏦 Por ativo</h2>
              {(() => {
                const byAsset = filtered.filter(d => d.status === 'received').reduce<Record<string, number>>((acc, d) => {
                  const ticker = assetMap[d.asset_id]?.ticker ?? d.asset_id
                  acc[ticker] = (acc[ticker] ?? 0) + d.total_amount
                  return acc
                }, {})
                const entries = Object.entries(byAsset).sort(([, a], [, b]) => b - a).slice(0, 8)
                if (entries.length === 0) return <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Sem dados</p>
                return (
                  <div className="flex flex-col gap-2">
                    {entries.map(([ticker, total]) => (
                      <div key={ticker} className="flex items-center justify-between">
                        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{ticker}</span>
                        <span className="font-[DM_Mono] text-[12px] text-[#10b981]">
                          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Yield on Cost (RN-PTR-14) */}
            {yocByAsset.length > 0 && (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📊 Yield on Cost</h2>
                  <span className="font-[DM_Mono] text-[11px] text-[#10b981]">
                    Média: {avgYoc.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {yocByAsset.slice(0, 6).map(({ ticker, yoc, div12m }) => (
                    <div key={ticker}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{ticker}</span>
                        <span className="font-[DM_Mono] text-[11px] text-[#10b981]">
                          {yoc.toFixed(2)}% a.a.
                        </span>
                      </div>
                      <div className="flex-1 bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '3px' }}>
                        <div
                          className="h-full rounded-full bg-[#10b981]"
                          style={{ width: `${Math.min(yoc / 20 * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                        {div12m.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em 12m
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--sl-t3)] mt-3">
                  YoC = proventos 12m ÷ valor investido
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">💰 Registrar Provento</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Ativo */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Ativo</label>
                {assets.length === 0 ? (
                  <p className="text-[12px] text-[var(--sl-t3)]">Adicione ativos à carteira primeiro.</p>
                ) : (
                  <select
                    value={form.asset_id}
                    onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  >
                    <option value="">Selecione...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.ticker} — {ASSET_CLASS_LABELS[a.asset_class]}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Tipo</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(DIVIDEND_TYPE_LABELS) as DividendType[]).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-2 rounded-[10px] border transition-all text-[10px]',
                        form.type === t
                          ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      <span className="text-base">{DIVIDEND_TYPE_ICONS[t]}</span>
                      <span>{DIVIDEND_TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Total recebido (R$)*</label>
                  <input type="number" step="0.01" value={form.total_amount}
                    onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Valor por unit (R$)</label>
                  <input type="number" step="0.0001" value={form.amount_per_unit}
                    onChange={e => setForm(f => ({ ...f, amount_per_unit: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de pagamento*</label>
                  <input type="date" value={form.payment_date}
                    onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data ex (opcional)</label>
                  <input type="date" value={form.ex_date}
                    onChange={e => setForm(f => ({ ...f, ex_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {(['received', 'announced'] as const).map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={cn(
                        'flex-1 py-2 rounded-[10px] text-[12px] font-medium border transition-all',
                        form.status === s
                          ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t3)]'
                      )}
                    >
                      {s === 'received' ? '✅ Recebido' : '📢 Anunciado'}
                    </button>
                  ))}
                </div>
              </div>

              {form.status === 'received' && (
                <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sl-t1)]">Registrar em Finanças</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">Cria receita automática em Finanças</p>
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, syncToFinancas: !f.syncToFinancas }))}
                    className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', form.syncToFinancas ? 'bg-[#10b981]' : 'bg-[var(--sl-s3)]')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', form.syncToFinancas ? 'left-5' : 'left-1')} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
