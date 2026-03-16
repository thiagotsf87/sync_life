'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  usePortfolioAssets, usePortfolioDividends,
  useAddDividend, useDeleteDividend, useUpdateDividendStatus,
  DIVIDEND_TYPE_LABELS, ASSET_CLASS_LABELS,
  type DividendType, type DividendStatus,
} from '@/hooks/use-patrimonio'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { PatrimonioMobile } from '@/components/patrimonio/PatrimonioMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'
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

export default function ProventosPage() {
  const router = useRouter()

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
  const paymentCount = filtered.filter(d => d.status === 'received').length

  // Yield on Cost por ativo (RN-PTR-14)
  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avg_price, 0)
  const avgYoc = totalInvested > 0 ? (total12m / totalInvested) * 100 : 0

  // Yield on Cost per asset
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

  // Monthly breakdown for calendar grid
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthDivs = filtered.filter(d => {
      const date = new Date(d.payment_date)
      return date.getMonth() + 1 === month && d.status === 'received'
    })
    const total = monthDivs.reduce((s, d) => s + d.total_amount, 0)
    const count = monthDivs.length
    return { month, total, count }
  })

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // By asset breakdown
  const byAsset = filtered.filter(d => d.status === 'received').reduce<Record<string, number>>((acc, d) => {
    const ticker = assetMap[d.asset_id]?.ticker ?? d.asset_id
    acc[ticker] = (acc[ticker] ?? 0) + d.total_amount
    return acc
  }, {})
  const assetEntries = Object.entries(byAsset).sort(([, a], [, b]) => b - a).slice(0, 5)

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Determine which month is selected for detail view (default = current month or first with data)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Filter dividends for the selected month detail
  const monthDetail = filtered.filter(d => {
    const date = new Date(d.payment_date)
    return date.getMonth() + 1 === selectedMonth
  })

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
    <>
      <PatrimonioMobile initialTab="proventos" />
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={CreditCard}
        iconBg="rgba(245,158,11,.10)"
        iconColor="#f59e0b"
        title="Proventos"
        subtitle={`${filterYear} · ${fmtCurrency(totalYear)} acumulados · ${paymentCount} pagamentos`}
      >
        <div className="flex bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-[3px] gap-0.5">
          {availableYears.slice(0, 5).map(y => (
            <button key={y} onClick={() => setFilterYear(y)}
              className={cn(
                'px-3 py-[6px] rounded-[8px] text-[12px] font-semibold transition-all',
                filterYear === y
                  ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                  : 'text-[var(--sl-t3)] hover:text-[var(--sl-t1)]'
              )}
            >{y}</button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#3b82f6] text-white hover:brightness-110 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(59,130,246,.25)] transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Registrar
        </button>
      </ModuleHeader>

      {/* MetricsStrip — inline horizontal strip */}
      <div className="mb-5 sl-fade-up sl-delay-1">
        <MetricsStrip
          items={[
            {
              label: `Total ${filterYear}`,
              value: fmtCurrency(totalYear),
              valueColor: '#10b981',
            },
            {
              label: 'Media/Mes',
              value: fmtCurrency(monthlyAvg),
            },
            {
              label: 'Pagamentos',
              value: String(paymentCount),
            },
            {
              label: 'YoC Medio',
              value: `${avgYoc.toFixed(1)}%`,
              valueColor: '#f59e0b',
            },
          ]}
        />
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          monthlyAvg > 0
            ? <>Voce recebe em media <strong className="text-[#10b981]">{fmtCurrency(monthlyAvg)}</strong> por mes em proventos.
              {monthlyAvg >= 5000 && <> Sua renda passiva ja cobre despesas significativas — continue reinvestindo!</>}
            </>
            : <>Registre seus proventos para acompanhar sua renda passiva e evolucao para a independencia financeira.</>
        }
      />

      {loading ? (
        <div className="h-64 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : (
        <>
          {/* 12-month Calendar Grid (unique layout per prototype) */}
          <div className="grid grid-cols-6 gap-2 mb-5 sl-fade-up sl-delay-2">
            {monthlyTotals.map(({ month, total, count }) => {
              const isCurrent = month === currentMonth && filterYear === currentYear
              const isPast = filterYear < currentYear || (filterYear === currentYear && month <= currentMonth)
              const isProjection = !isPast

              return (
                <div
                  key={month}
                  className={cn(
                    'bg-[var(--sl-s1)] border rounded-[14px] p-4 text-center relative overflow-hidden cursor-pointer transition-colors',
                    isCurrent
                      ? 'border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.03)]'
                      : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
                    selectedMonth === month && 'ring-1 ring-[#3b82f6]/40'
                  )}
                  onClick={() => setSelectedMonth(month)}
                >
                  {/* Top accent bar */}
                  {isPast && total > 0 && (
                    <div
                      className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b"
                      style={{ background: isCurrent ? '#3b82f6' : total > monthlyAvg ? '#10b981' : '#f59e0b' }}
                    />
                  )}
                  <div className={cn(
                    'text-[10px] font-bold uppercase mb-2',
                    isCurrent ? 'text-[#3b82f6]' : 'text-[var(--sl-t3)]'
                  )}>
                    {months[month - 1]}{isCurrent ? ' \u25cf' : ''}
                  </div>
                  <div className={cn(
                    'font-[DM_Mono] text-[18px] font-medium',
                    isProjection ? 'text-[var(--sl-t3)]' : total > 0 ? 'text-[#10b981]' : 'text-[var(--sl-t3)]'
                  )}>
                    {isProjection ? fmtCurrency(monthlyAvg) : fmtCurrency(total)}
                  </div>
                  <div className={cn(
                    'text-[10px] mt-1',
                    isCurrent ? 'text-[#3b82f6]' : 'text-[var(--sl-t3)]'
                  )}>
                    {isProjection ? 'projecao' : count > 0 ? `${count} pgto${count > 1 ? 's' : ''}${isCurrent ? ' · atual' : ''}` : '--'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail + Sidebar */}
          <div className="grid grid-cols-[1fr_280px] gap-3.5 max-lg:grid-cols-1 sl-fade-up sl-delay-3">
            {/* Left: Selected month detail */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-2.5 mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  {months[selectedMonth - 1]} {filterYear} — Detalhamento
                </span>
              </div>

              {monthDetail.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[var(--sl-t2)] mb-3">Nenhum provento em {months[selectedMonth - 1]} {filterYear}</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90"
                  >
                    <Plus size={15} />
                    Registrar Provento
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {monthDetail.map(d => {
                    const asset = assetMap[d.asset_id]
                    return (
                      <div key={d.id} className="flex gap-3 py-3 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                        <div
                          className="w-[3px] rounded-sm shrink-0"
                          style={{ background: d.type === 'jcp' ? '#a855f7' : '#10b981' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[var(--sl-t1)]">
                            {asset?.ticker ?? '???'} — {DIVIDEND_TYPE_LABELS[d.type]}
                          </div>
                          <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                            {new Date(d.payment_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            {d.amount_per_unit != null && ` · ${fmtCurrency(d.amount_per_unit)}/cota`}
                            {asset && ` · ${asset.quantity.toLocaleString('pt-BR')} cotas`}
                          </div>
                        </div>
                        <div className="font-[DM_Mono] text-[13px] text-[#10b981] shrink-0">
                          {fmtCurrency(d.total_amount)}
                        </div>
                        {d.status === 'announced' && (
                          <button
                            onClick={() => handleMarkAsReceived(d.id)}
                            className="px-2 py-1 rounded-[8px] text-[10px] font-bold border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/10 transition-colors shrink-0"
                          >
                            Recebido
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

            {/* Right sidebar */}
            <div className="flex flex-col gap-3.5">
              {/* Top Pagadores */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[18px]
                              transition-colors hover:border-[var(--sl-border-h)]">
                <div className="font-[Syne] text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sl-t3)] mb-3">
                  Top Pagadores
                </div>
                {assetEntries.length === 0 ? (
                  <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Sem dados</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {assetEntries.map(([ticker, total]) => (
                      <div key={ticker} className="flex justify-between">
                        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{ticker}</span>
                        <span className="font-[DM_Mono] text-[12px] text-[#10b981]">{fmtCurrency(total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Melhor YoC */}
              {yocByAsset.length > 0 && (
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[18px]
                                transition-colors hover:border-[var(--sl-border-h)]">
                  <div className="font-[Syne] text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sl-t3)] mb-3">
                    Melhor YoC
                  </div>
                  <div className="flex flex-col gap-2">
                    {yocByAsset.slice(0, 3).map(({ ticker, yoc }) => (
                      <div key={ticker}>
                        <div className="flex justify-between text-[11px] mb-[3px]">
                          <span className="font-[DM_Mono] text-[var(--sl-t1)]">{ticker}</span>
                          <span className="font-[DM_Mono] text-[#10b981]">{yoc.toFixed(1)}%</span>
                        </div>
                        <div className="h-[3px] bg-[var(--sl-s3)] rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm bg-[#10b981]"
                            style={{ width: `${Math.min(yoc / 15 * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(245,158,11,.10)' }}>
                  <CreditCard size={18} className="text-[#f59e0b]" />
                </div>
                Registrar Provento
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">x</button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Ativo */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Ativo</label>
                {assets.length === 0 ? (
                  <p className="text-[12px] text-[var(--sl-t3)]">Adicione ativos a carteira primeiro.</p>
                ) : (
                  <select
                    value={form.asset_id}
                    onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
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

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DividendType }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  >
                    {(Object.keys(DIVIDEND_TYPE_LABELS) as DividendType[]).map(t => (
                      <option key={t} value={t}>{DIVIDEND_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Valor Total (R$)*</label>
                  <input type="number" step="0.01" value={form.total_amount}
                    onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Data Ex</label>
                  <input type="date" value={form.ex_date}
                    onChange={e => setForm(f => ({ ...f, ex_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Pagamento*</label>
                  <input type="date" value={form.payment_date}
                    onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Status</label>
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
                      {s === 'received' ? 'Recebido' : 'Anunciado'}
                    </button>
                  ))}
                </div>
              </div>

              {form.status === 'received' && (
                <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sl-t1)]">Registrar em Financas</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">Cria receita automatica em Financas</p>
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, syncToFinancas: !f.syncToFinancas }))}
                    className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', form.syncToFinancas ? 'bg-[#10b981]' : 'bg-[var(--sl-s3)]')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', form.syncToFinancas ? 'left-5' : 'left-1')} />
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
