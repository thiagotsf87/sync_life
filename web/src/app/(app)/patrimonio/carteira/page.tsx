'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  usePortfolioAssets, useAddTransaction, useUpdateAssetPrice, useDeleteAsset,
  useBulkUpdatePrices,
  ASSET_CLASS_LABELS, ASSET_CLASS_COLORS,
  type AssetClass, type AddTransactionData,
} from '@/hooks/use-patrimonio'
import { AssetCard } from '@/components/patrimonio/AssetCard'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'

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
}

export default function CarteiraPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

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
    if (!confirm('Excluir este ativo e todas as operações?')) return
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

  // Group by class
  const grouped = ASSET_CLASSES.map(cls => ({
    cls,
    assets: filtered.filter(a => a.asset_class === cls),
  })).filter(g => g.assets.length > 0)

  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avg_price, 0)

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => router.push('/patrimonio')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors">
          <ArrowLeft size={16} />
          Patrimônio
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          💼 Carteira
        </h1>
        {/* Botão atualizar cotações (RN-PTR-03) */}
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold
                       border border-[var(--sl-border)] text-[var(--sl-t2)] hover:text-[var(--sl-t1)]
                       hover:border-[var(--sl-border-h)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={updating ? 'animate-spin' : ''} />
            {updating ? 'Atualizando…' : 'Cotações'}
          </button>
        )}
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90">
          <Plus size={16} />
          Nova Operação
        </button>
      </div>

      {/* Stats */}
      {assets.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5 max-sm:grid-cols-1">
          {[
            { label: 'Total de Ativos', value: String(assets.length), color: '#10b981' },
            { label: 'Total Investido', value: totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#0055ff' },
            { label: 'Com Cotação', value: String(assets.filter(a => a.current_price != null).length), color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: s.color }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{s.label}</p>
              <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ticker ou nome..."
            className="w-full pl-8 pr-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterClass('all')}
            className={cn('px-3 py-1.5 rounded-[8px] text-[11px] border transition-all',
              filterClass === 'all' ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]')}>
            Todos
          </button>
          {ASSET_CLASSES.filter(c => assets.some(a => a.asset_class === c)).map(cls => (
            <button key={cls} onClick={() => setFilterClass(cls)}
              className={cn('px-3 py-1.5 rounded-[8px] text-[11px] border transition-all',
                filterClass === cls ? 'text-[var(--sl-t1)]' : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]')}
              style={filterClass === cls ? { borderColor: ASSET_CLASS_COLORS[cls], background: ASSET_CLASS_COLORS[cls] + '20' } : undefined}>
              {ASSET_CLASS_LABELS[cls]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">💼</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 mt-3">
            <Plus size={15} />
            Primeiro ativo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ cls, assets: clsAssets }) => (
            <div key={cls}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-[Syne] font-bold text-[13px]" style={{ color: ASSET_CLASS_COLORS[cls] }}>
                  {ASSET_CLASS_LABELS[cls]}
                </h2>
                <span className="text-[10px] text-[var(--sl-t3)]">({clsAssets.length})</span>
                <div className="flex-1 h-px bg-[var(--sl-border)]" />
              </div>
              <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {clsAssets.map(a => (
                  <AssetCard key={a.id} asset={a}
                    onDelete={handleDelete}
                    onUpdatePrice={() => setShowPriceModal({ id: a.id, ticker: a.ticker })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">📈 Nova Operação</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Operation type */}
              <div className="flex gap-2">
                {(['buy', 'sell'] as const).map(op => (
                  <button key={op} onClick={() => setForm(f => ({ ...f, operation: op }))}
                    className={cn('flex-1 py-2 rounded-[10px] text-[13px] font-semibold border transition-all',
                      form.operation === op
                        ? op === 'buy' ? 'border-[#10b981] bg-[#10b981]/15 text-[#10b981]' : 'border-[#f43f5e] bg-[#f43f5e]/15 text-[#f43f5e]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]')}>
                    {op === 'buy' ? '📈 Compra' : '📉 Venda'}
                  </button>
                ))}
              </div>

              {/* Ticker + Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Ticker</label>
                  <input type="text" value={form.ticker}
                    onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                    placeholder="Ex: PETR4"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome</label>
                  <input type="text" value={form.asset_name}
                    onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))}
                    placeholder="Petrobras PN"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Classe</label>
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

              {/* Quantity, Price, Date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Quantidade</label>
                  <input type="number" step="0.00000001" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Preço (R$)</label>
                  <input type="number" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Taxas (R$)</label>
                  <input type="number" step="0.01" value={form.fees}
                    onChange={e => setForm(f => ({ ...f, fees: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.quantity && form.price && (
                <div className="flex items-center gap-2 p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Total: <strong className="font-[DM_Mono] text-[var(--sl-t1)]">
                      {(parseFloat(form.quantity) * parseFloat(form.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data da Operação</label>
                <input type="date" value={form.operation_date}
                  onChange={e => setForm(f => ({ ...f, operation_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Registrar'}
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
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[340px]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                💲 Atualizar Cotação — {showPriceModal.ticker}
              </h2>
              <button onClick={() => setShowPriceModal(null)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cotação Atual (R$)</label>
                <input type="number" step="0.01" value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="0,00" autoFocus
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPriceModal(null)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleUpdatePrice} disabled={isSaving || !newPrice}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 disabled:opacity-50">
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
