'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, RefreshCw, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  usePortfolioAssets, useAddTransaction, useUpdateAssetPrice, useDeleteAsset,
  useBulkUpdatePrices,
  ASSET_CLASS_LABELS, ASSET_CLASS_COLORS,
  type AssetClass, type AddTransactionData,
} from '@/hooks/use-patrimonio'
import { PatrimonioMobile } from '@/components/patrimonio/PatrimonioMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'
import { createTransactionFromAporte } from '@/lib/integrations/financas'

const ASSET_CLASSES: AssetClass[] = [
  'stocks_br', 'fiis', 'etfs_br', 'bdrs', 'fixed_income',
  'crypto', 'stocks_us', 'reits', 'other',
]

interface TransactionForm {
  ticker: string
  asset_name: string
  asset_class: AssetClass
  sector: string
  operation: 'buy' | 'sell'
  quantity: string
  price: string
  fees: string
  operation_date: string
  notes: string
  syncAporteToFinancas: boolean
}

const EMPTY_FORM: TransactionForm = {
  ticker: '',
  asset_name: '',
  asset_class: 'stocks_br',
  sector: '',
  operation: 'buy',
  quantity: '',
  price: '',
  fees: '',
  operation_date: new Date().toISOString().split('T')[0],
  notes: '',
  syncAporteToFinancas: false,
}

export default function CarteiraPage() {
  const router = useRouter()

  const { assets, loading, error, reload } = usePortfolioAssets()
  const addTransaction = useAddTransaction()
  const updatePrice = useUpdateAssetPrice()
  const deleteAsset = useDeleteAsset()
  const { updateAll, updating } = useBulkUpdatePrices()
  const { isPro } = useUserPlan()

  const [showModal, setShowModal] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState<{ id: string; ticker: string } | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [filterClass, setFilterClass] = useState<AssetClass | 'all'>('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM)

  async function handleSave() {
    if (!form.ticker.trim() || !form.asset_name.trim() || !form.quantity || !form.price) {
      toast.error('Preencha ticker, nome, quantidade e preço')
      return
    }
    // RN-PTR-07: Limite FREE = 10 ativos únicos (apenas em compras de ticker novo)
    if (form.operation === 'buy') {
      const tickerUpper = form.ticker.toUpperCase().trim()
      const isNewTicker = !assets.some(a => a.ticker === tickerUpper)
      if (isNewTicker) {
        const limitCheck = checkPlanLimit(isPro, 'portfolio_assets', assets.length)
        if (!limitCheck.allowed) {
          toast.error(limitCheck.upsellMessage)
          return
        }
      }
    }
    setIsSaving(true)
    try {
      const data: AddTransactionData = {
        ticker: form.ticker.toUpperCase().trim(),
        asset_name: form.asset_name.trim(),
        asset_class: form.asset_class,
        sector: form.sector || null,
        operation: form.operation,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        fees: form.fees ? parseFloat(form.fees) : 0,
        operation_date: form.operation_date,
        notes: form.notes || null,
      }
      await addTransaction(data)

      // RN-PTR-20: aporte pode ser vinculado ao orçamento via despesa em Finanças.
      if (form.operation === 'buy' && form.syncAporteToFinancas) {
        const aporteTotal = (parseFloat(form.quantity) * parseFloat(form.price)) + (parseFloat(form.fees || '0') || 0)
        await createTransactionFromAporte({
          ticker: data.ticker,
          amount: aporteTotal,
          operationDate: data.operation_date,
        })
      }

      toast.success(form.operation === 'buy' ? 'Compra registrada!' : 'Venda registrada!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      await reload()
    } catch {
      toast.error('Erro ao registrar operação')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdatePrice() {
    if (!showPriceModal || !newPrice) return
    setIsSaving(true)
    try {
      await updatePrice(showPriceModal.id, parseFloat(newPrice))
      toast.success('Cotação atualizada!')
      setShowPriceModal(null)
      setNewPrice('')
      await reload()
    } catch {
      toast.error('Erro ao atualizar cotação')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    // RN-PTR-24: avisar sobre transações vinculadas em Finanças
    if (!confirm('Excluir este ativo e todas as operações?\n\n⚠️ Transações de proventos geradas automaticamente em Finanças vinculadas a este ativo não serão removidas.')) return
    try {
      await deleteAsset(id)
      toast.success('Ativo removido')
      await reload()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  const filtered = assets.filter(a => {
    const matchClass = filterClass === 'all' || a.asset_class === filterClass
    const matchSearch = !search || a.ticker.toLowerCase().includes(search.toLowerCase()) || a.asset_name.toLowerCase().includes(search.toLowerCase())
    return matchClass && matchSearch
  })

  // Sort by position value descending
  const sorted = [...filtered].sort((a, b) => {
    const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
    const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
    return vb - va
  })

  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avg_price, 0)
  const totalCurrent = assets.reduce((s, a) =>
    s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price), 0)
  const totalPL = totalCurrent - totalInvested
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0

  const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Dividend data for proventos column
  const year12Ago = new Date()
  year12Ago.setMonth(year12Ago.getMonth() - 12)

  return (
    <>
      <PatrimonioMobile initialTab="carteira" onAddAsset={() => setShowModal(true)} />
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={Briefcase}
        iconBg="rgba(59,130,246,.08)"
        iconColor="#3b82f6"
        title="Carteira"
        subtitle={`${assets.length} ativo${assets.length !== 1 ? 's' : ''} · ${fmtCurrency(totalCurrent)} · ${assets.filter(a => a.current_price != null).length} com cotacao`}
      >
        {assets.length > 0 && (
          <button
            onClick={async () => {
              const result = await updateAll(assets, isPro)
              if (result.blockedByLimit) {
                toast.info('Cotações já atualizadas hoje. Plano PRO permite atualizações ilimitadas.')
                return
              }
              if (result.updated > 0) {
                toast.success(`${result.updated} cotação(ões) atualizada(s) via brapi.dev`)
                reload()
              }
              if (result.failed.length > 0) {
                toast.warning(`Sem cotação para: ${result.failed.join(', ')}`)
              }
            }}
            disabled={updating}
            className="inline-flex items-center gap-[7px] px-[14px] py-[7px] rounded-[9px] text-[12px] font-semibold
                       text-[var(--sl-t2)] bg-transparent border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={updating ? 'animate-spin' : ''} />
            {updating ? 'Atualizando...' : 'Cotacoes'}
          </button>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#3b82f6] text-white hover:brightness-110 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(59,130,246,.25)] transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Nova Operacao
        </button>
      </ModuleHeader>

      {/* Search + Filter (NO KPIs — this is a data view, per prototype) */}
      <div className="flex items-center gap-3 mb-5 flex-wrap sl-fade-up sl-delay-1">
        <div className="relative flex-1 max-w-[320px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ticker ou nome..."
            className="w-full pl-9 pr-3 py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterClass('all')}
            className={cn('px-[10px] py-[4px] rounded-[8px] text-[11px] font-semibold border transition-all',
              filterClass === 'all' ? 'border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.08)] text-[#3b82f6]' : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]')}>
            Todos
          </button>
          {ASSET_CLASSES.filter(c => assets.some(a => a.asset_class === c)).map(cls => (
            <button key={cls} onClick={() => setFilterClass(cls)}
              className={cn('px-[10px] py-[4px] rounded-[8px] text-[11px] font-semibold border transition-all',
                filterClass === cls ? 'text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]')}
              style={filterClass === cls ? { borderColor: ASSET_CLASS_COLORS[cls], background: ASSET_CLASS_COLORS[cls] + '20' } : undefined}>
              {ASSET_CLASS_LABELS[cls]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-[300px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
          <div className="text-4xl mb-3">📈</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90 mt-3">
            <Plus size={15} />
            Primeiro ativo
          </button>
        </div>
      ) : (
        <>
          {/* Full-width data table (matching prototype) */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden sl-fade-up sl-delay-2
                          transition-colors hover:border-[var(--sl-border-h)]"
               style={{ padding: 0 }}
          >
            {/* Table header */}
            <div className="grid gap-2 px-[18px] py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] border-b border-[var(--sl-border)]"
                 style={{ gridTemplateColumns: '110px 1fr 80px 90px 90px 80px 60px' }}>
              <span>Ticker</span>
              <span>Nome / Classe</span>
              <span className="text-right">Qtd</span>
              <span className="text-right">Posicao</span>
              <span className="text-right">Resultado</span>
              <span className="text-right">Proventos</span>
              <span className="text-right">Peso</span>
            </div>

            {/* Table rows */}
            {sorted.map((a) => {
              const invested = a.quantity * a.avg_price
              const currentVal = a.current_price != null ? a.quantity * a.current_price : invested
              const pl = currentVal - invested
              const plPct = invested > 0 ? (pl / invested) * 100 : 0
              const weight = totalCurrent > 0 ? (currentVal / totalCurrent) * 100 : 0

              return (
                <div
                  key={a.id}
                  className="grid gap-2 px-[18px] py-[14px] items-center border-b border-[rgba(120,165,220,.04)] last:border-b-0
                             cursor-pointer transition-colors hover:bg-[var(--sl-s2)]"
                  style={{ gridTemplateColumns: '110px 1fr 80px 90px 90px 80px 60px' }}
                  onClick={() => router.push(`/patrimonio/carteira/${encodeURIComponent(a.ticker)}`)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-[DM_Mono] font-medium text-[13px] text-[var(--sl-t1)]">{a.ticker}</span>
                    {a.current_price != null && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: pl >= 0 ? '#10b981' : '#f43f5e' }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] text-[var(--sl-t2)] truncate">{a.asset_name}</div>
                    <div className="text-[10px] text-[var(--sl-t3)]">
                      {ASSET_CLASS_LABELS[a.asset_class]}{a.sector ? ` · ${a.sector}` : ''}
                    </div>
                  </div>
                  <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t2)]">
                    {a.quantity.toLocaleString('pt-BR')}
                  </span>
                  <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t1)]">
                    {fmtCurrency(currentVal)}
                  </span>
                  <span
                    className="font-[DM_Mono] text-[12px] text-right"
                    style={{ color: pl >= 0 ? '#10b981' : '#f43f5e' }}
                  >
                    {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                  </span>
                  <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t1)]">
                    --
                  </span>
                  <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t2)]">
                    {weight.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Summary footer */}
          <div className="flex gap-5 py-4 justify-end sl-fade-up sl-delay-3">
            <span className="text-[11px] text-[var(--sl-t3)]">
              Total Investido: <span className="font-[DM_Mono] text-[var(--sl-t2)]">{fmtCurrency(totalInvested)}</span>
            </span>
            <span className="text-[11px] text-[var(--sl-t3)]">
              Total Posicao: <span className="font-[DM_Mono] text-[var(--sl-t1)]">{fmtCurrency(totalCurrent)}</span>
            </span>
            <span className="text-[11px] text-[var(--sl-t3)]">
              Resultado: <span className="font-[DM_Mono]" style={{ color: totalPL >= 0 ? '#10b981' : '#f43f5e' }}>
                {totalPL >= 0 ? '+' : ''}{fmtCurrency(totalPL)} ({totalPL >= 0 ? '+' : ''}{totalPLPct.toFixed(2)}%)
              </span>
            </span>
          </div>
        </>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(59,130,246,.08)' }}>
                  <Plus size={18} className="text-[#3b82f6]" />
                </div>
                Nova Operacao
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">x</button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Operation type */}
              <div className="flex gap-2">
                {(['buy', 'sell'] as const).map(op => (
                  <button key={op} onClick={() => setForm(f => ({ ...f, operation: op }))}
                    className={cn('flex-1 py-2 rounded-[10px] text-[13px] font-semibold border transition-all',
                      form.operation === op
                        ? op === 'buy' ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]' : 'border-[#f43f5e] bg-[#f43f5e]/15 text-[#f43f5e]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]')}>
                    {op === 'buy' ? 'Compra' : 'Venda'}
                  </button>
                ))}
              </div>

              {/* Ticker + Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Ticker</label>
                  <input type="text" value={form.ticker}
                    onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                    placeholder="Ex: PETR4"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Nome</label>
                  <input type="text" value={form.asset_name}
                    onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))}
                    placeholder="Petrobras PN"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Classe</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASSET_CLASSES.map(cls => (
                    <button key={cls} onClick={() => setForm(f => ({ ...f, asset_class: cls }))}
                      className={cn('px-2 py-1.5 rounded-[8px] text-[11px] border transition-all',
                        form.asset_class === cls ? 'text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]')}
                      style={form.asset_class === cls ? { borderColor: ASSET_CLASS_COLORS[cls], background: ASSET_CLASS_COLORS[cls] + '15' } : undefined}>
                      {ASSET_CLASS_LABELS[cls]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity, Price, Fees */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Quantidade</label>
                  <input type="number" step="0.00000001" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Preco (R$)</label>
                  <input type="number" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Taxas (R$)</label>
                  <input type="number" step="0.01" value={form.fees}
                    onChange={e => setForm(f => ({ ...f, fees: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.quantity && form.price && (
                <div className="flex items-center gap-2 p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-xl">
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Total: <strong className="font-[DM_Mono] text-[var(--sl-t1)]">
                      {(parseFloat(form.quantity) * parseFloat(form.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </p>
                </div>
              )}

              {form.operation === 'buy' && (
                <div className="p-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium text-[var(--sl-t1)]">Vincular aporte ao orcamento</p>
                      <p className="text-[11px] text-[var(--sl-t3)]">
                        Cria despesa automatica em Financas (categoria investimentos).
                      </p>
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, syncAporteToFinancas: !f.syncAporteToFinancas }))}
                      className={cn(
                        'w-10 h-6 rounded-full transition-all relative shrink-0',
                        form.syncAporteToFinancas ? 'bg-[#10b981]' : 'bg-[var(--sl-s3)]'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                          form.syncAporteToFinancas ? 'left-5' : 'left-1'
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-2">
                    Metas de patrimonio no Futuro ja sao atualizadas automaticamente por aporte.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Data da Operacao</label>
                <input type="date" value={form.operation_date}
                  onChange={e => setForm(f => ({ ...f, operation_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowPriceModal(null) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] w-full max-w-[340px]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Atualizar Cotacao — {showPriceModal.ticker}
              </h2>
              <button onClick={() => setShowPriceModal(null)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">x</button>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5 block">Cotacao Atual (R$)</label>
                <input type="number" step="0.01" value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="0,00" autoFocus
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPriceModal(null)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleUpdatePrice} disabled={isSaving || !newPrice}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90 disabled:opacity-50">
                  Atualizar
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
