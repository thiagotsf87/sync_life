'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { syncPassiveIncomeToFuturo, syncPortfolioTotalToFuturo } from '@/lib/integrations/futuro'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssetClass =
  | 'stocks_br' | 'fiis' | 'etfs_br' | 'bdrs' | 'fixed_income'
  | 'crypto' | 'stocks_us' | 'reits' | 'other'

export type OperationType = 'buy' | 'sell'

export type DividendType =
  | 'dividend' | 'jcp' | 'fii_yield' | 'fixed_income_interest' | 'other'

export type DividendStatus = 'announced' | 'received'

export interface PortfolioAsset {
  id: string
  user_id: string
  ticker: string
  asset_name: string
  asset_class: AssetClass
  sector: string | null
  quantity: number
  avg_price: number
  current_price: number | null
  last_price_update: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioTransaction {
  id: string
  user_id: string
  asset_id: string
  operation: OperationType
  quantity: number
  price: number
  fees: number
  operation_date: string
  notes: string | null
  created_at: string
}

export interface PortfolioDividend {
  id: string
  user_id: string
  asset_id: string
  type: DividendType
  amount_per_unit: number | null
  total_amount: number
  payment_date: string
  ex_date: string | null
  status: DividendStatus
  created_at: string
}

export interface FiSimulation {
  id: string
  user_id: string
  current_portfolio: number
  monthly_contribution: number
  expected_return_rate: number
  desired_passive_income: number
  result_months: number | null
  result_date: string | null
  created_at: string
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  stocks_br: 'Ações BR',
  fiis: 'FIIs',
  etfs_br: 'ETFs BR',
  bdrs: 'BDRs',
  fixed_income: 'Renda Fixa',
  crypto: 'Criptomoedas',
  stocks_us: 'Stocks US',
  reits: 'REITs',
  other: 'Outros',
}

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  stocks_br: '#0055ff',
  fiis: '#10b981',
  etfs_br: '#06b6d4',
  bdrs: '#a855f7',
  fixed_income: '#f59e0b',
  crypto: '#f97316',
  stocks_us: '#3b82f6',
  reits: '#14b8a6',
  other: '#6e90b8',
}

export const DIVIDEND_TYPE_LABELS: Record<DividendType, string> = {
  dividend: 'Dividendo',
  jcp: 'JCP',
  fii_yield: 'Rendimento FII',
  fixed_income_interest: 'Juros RF',
  other: 'Outros',
}

// ─── Calculations ─────────────────────────────────────────────────────────────

/** Compound interest: FV = PV × (1+r)^n + PMT × [(1+r)^n - 1] / r */
export function calcFutureValue(pv: number, pmt: number, ratePerMonth: number, months: number): number {
  if (ratePerMonth === 0) return pv + pmt * months
  const factor = Math.pow(1 + ratePerMonth, months)
  return pv * factor + pmt * (factor - 1) / ratePerMonth
}

/** Months to reach target where withdrawal = passiveIncome (4% rule: target = passiveIncome * 12 / 0.04) */
export function calcMonthsToIF(
  pv: number, pmt: number, annualRate: number, desiredMonthlyIncome: number
): { months: number; targetPortfolio: number } {
  const targetPortfolio = desiredMonthlyIncome * 12 / 0.04
  const monthlyRate = annualRate / 100 / 12

  if (pv >= targetPortfolio) return { months: 0, targetPortfolio }

  let months = 0
  let portfolio = pv
  while (portfolio < targetPortfolio && months < 600) {
    portfolio = portfolio * (1 + monthlyRate) + pmt
    months++
  }
  return { months, targetPortfolio }
}

export function buildIFProjection(
  pv: number, pmt: number, annualRate: number, desiredIncome: number, months: number
): { month: number; pessimistic: number; base: number; optimistic: number }[] {
  const r = annualRate / 100 / 12
  const rPess = (annualRate - 2) / 100 / 12
  const rOpt = (annualRate + 2) / 100 / 12

  return Array.from({ length: Math.min(months, 360) + 1 }, (_, i) => ({
    month: i,
    pessimistic: calcFutureValue(pv, pmt, Math.max(0, rPess), i),
    base: calcFutureValue(pv, pmt, r, i),
    optimistic: calcFutureValue(pv, pmt, rOpt, i),
  }))
}

// ─── Assets hook ──────────────────────────────────────────────────────────────

export function usePortfolioAssets() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error } = await sb.from('portfolio_assets')
        .select('*').eq('user_id', user.id)
        .order('asset_class', { ascending: true })
      if (error) throw error
      setAssets(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar carteira')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { assets, loading, error, reload: load }
}

// ─── Transactions hook ────────────────────────────────────────────────────────

export function usePortfolioTransactions(assetId?: string) {
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let query = sb.from('portfolio_transactions')
        .select('*').eq('user_id', user.id)
        .order('operation_date', { ascending: false })
      if (assetId) query = query.eq('asset_id', assetId)
      const { data } = await query
      setTransactions(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => { load() }, [load])
  return { transactions, loading, reload: load }
}

// ─── Dividends hook ───────────────────────────────────────────────────────────

export function usePortfolioDividends() {
  const [dividends, setDividends] = useState<PortfolioDividend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      const { data, error } = await sb.from('portfolio_dividends')
        .select('*').eq('user_id', user.id)
        .order('payment_date', { ascending: false })
      if (error) throw error
      setDividends(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar proventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { dividends, loading, error, reload: load }
}

// ─── Dashboard hook ───────────────────────────────────────────────────────────

export function usePatrimonioDashboard() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [dividends, setDividends] = useState<PortfolioDividend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const [assetsRes, dividendsRes] = await Promise.all([
        sb.from('portfolio_assets').select('*').eq('user_id', user.id),
        sb.from('portfolio_dividends').select('*').eq('user_id', user.id)
          .eq('status', 'received').order('payment_date', { ascending: false }).limit(50),
      ]) as [
        { data: PortfolioAsset[] | null; error: unknown },
        { data: PortfolioDividend[] | null; error: unknown },
      ]

      setAssets(assetsRes.data ?? [])
      setDividends(dividendsRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { assets, dividends, loading, error, reload: load }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface AddTransactionData {
  ticker: string
  asset_name: string
  asset_class: AssetClass
  sector?: string | null
  operation: OperationType
  quantity: number
  price: number
  fees?: number
  operation_date: string
  notes?: string | null
}

export function useAddTransaction() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: AddTransactionData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // Upsert asset
    const { data: existing } = await sb.from('portfolio_assets')
      .select('*').eq('user_id', user.id).eq('ticker', data.ticker.toUpperCase()).single()

    let assetId: string
    if (existing) {
      // Recalculate avg_price for buy operations
      let newQty = existing.quantity
      let newAvg = existing.avg_price
      if (data.operation === 'buy') {
        const totalCost = existing.quantity * existing.avg_price + data.quantity * data.price
        newQty = existing.quantity + data.quantity
        newAvg = totalCost / newQty
      } else {
        newQty = existing.quantity - data.quantity
      }
      const { error } = await sb.from('portfolio_assets').update({
        quantity: newQty,
        avg_price: newAvg,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
      if (error) throw error
      assetId = existing.id
    } else {
      const { data: newAsset, error } = await sb.from('portfolio_assets').insert({
        user_id: user.id,
        ticker: data.ticker.toUpperCase(),
        asset_name: data.asset_name,
        asset_class: data.asset_class,
        sector: data.sector ?? null,
        quantity: data.operation === 'buy' ? data.quantity : 0,
        avg_price: data.price,
      }).select().single()
      if (error) throw error
      assetId = newAsset.id
    }

    // Insert transaction
    const { error: txErr } = await sb.from('portfolio_transactions').insert({
      user_id: user.id,
      asset_id: assetId,
      operation: data.operation,
      quantity: data.quantity,
      price: data.price,
      fees: data.fees ?? 0,
      operation_date: data.operation_date,
      notes: data.notes ?? null,
    })
    if (txErr) throw txErr

    // RN-FUT-43: operação de carteira atualiza metas de patrimônio no Futuro
    await syncPortfolioTotalToFuturo(user.id)
  }, [])
}

export function useUpdateAssetPrice() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (assetId: string, price: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('portfolio_assets').update({
      current_price: price,
      last_price_update: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', assetId)
    if (error) throw error
    // RN-FUT-43: cotação atualizada reflete no patrimônio total das metas vinculadas
    await syncPortfolioTotalToFuturo(user.id)
  }, [])
}

export function useDeleteAsset() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('portfolio_assets').delete().eq('id', id)
    if (error) throw error
    await syncPortfolioTotalToFuturo(user.id)
  }, [])
}

export interface AddDividendData {
  asset_id: string
  type: DividendType
  amount_per_unit?: number | null
  total_amount: number
  payment_date: string
  ex_date?: string | null
  status?: DividendStatus
}

export function useAddDividend() {
  const supabase = createClient()
  const sb = supabase as any

  return useCallback(async (data: AddDividendData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('portfolio_dividends').insert({ user_id: user.id, ...data })
    if (error) throw error
    // RN-FUT-44: proventos recebidos atualizam metas de renda passiva vinculadas
    await syncPassiveIncomeToFuturo(user.id)
  }, [])
}

export function useDeleteDividend() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('portfolio_dividends').delete().eq('id', id)
    if (error) throw error
    await syncPassiveIncomeToFuturo(user.id)
  }, [])
}

export function useUpdateDividendStatus() {
  const supabase = createClient()
  const sb = supabase as any
  return useCallback(async (id: string, status: DividendStatus) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const { error } = await sb.from('portfolio_dividends').update({ status }).eq('id', id)
    if (error) throw error
    // RN-PTR-16 / RN-FUT-44: mudança de status pode alterar média de proventos recebidos.
    await syncPassiveIncomeToFuturo(user.id)
  }, [])
}

// ─── Bulk cotações brapi (RN-PTR-03) ─────────────────────────────────────────

interface BrapiQuote {
  symbol: string
  regularMarketPrice: number
}

interface BulkUpdateResult {
  updated: number
  failed: string[]
  blockedByLimit?: boolean
}

/**
 * Atualiza preços de todos os ativos via brapi.dev.
 * FREE: 1x/dia (verifica last_price_update dos ativos)
 * PRO: sem limite
 */
export function useBulkUpdatePrices() {
  const supabase = createClient()
  const sb = supabase as any
  const [updating, setUpdating] = useState(false)

  const updateAll = useCallback(async (
    assets: PortfolioAsset[],
    isPro: boolean
  ): Promise<BulkUpdateResult> => {
    // Filtra apenas ativos com ticker (exclui renda fixa / outros sem ticker)
    const tickerAssets = assets.filter((a) =>
      a.ticker && ['stocks_br', 'fiis', 'etfs_br', 'bdrs', 'stocks_us', 'reits'].includes(a.asset_class)
    )
    if (tickerAssets.length === 0) return { updated: 0, failed: [] }

    // FREE: checa se algum ativo foi atualizado nas últimas 22h
    if (!isPro) {
      const threshold = new Date(Date.now() - 22 * 3600000).toISOString()
      const alreadyUpdated = tickerAssets.some(
        (a) => a.last_price_update && a.last_price_update > threshold
      )
      if (alreadyUpdated) {
        return { updated: 0, failed: [], blockedByLimit: true }
      }
    }

    setUpdating(true)
    try {
      const tickers = tickerAssets.map((a) => a.ticker).join(',')
      const res = await fetch(`/api/cotacoes?tickers=${encodeURIComponent(tickers)}`)
      if (!res.ok) throw new Error('API error')

      const json = await res.json()
      const quotes: BrapiQuote[] = json.results ?? []

      const quoteMap = new Map<string, number>()
      for (const q of quotes) {
        if (q.symbol && q.regularMarketPrice > 0) {
          quoteMap.set(q.symbol.toUpperCase(), q.regularMarketPrice)
        }
      }

      const now = new Date().toISOString()
      let updated = 0
      const failed: string[] = []

      for (const asset of tickerAssets) {
        const price = quoteMap.get(asset.ticker.toUpperCase())
        if (price) {
          const { error } = await sb.from('portfolio_assets').update({
            current_price: price,
            last_price_update: now,
            updated_at: now,
          }).eq('id', asset.id)
          if (!error) updated++
          else failed.push(asset.ticker)
        } else {
          failed.push(asset.ticker)
        }
      }

      if (updated > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await syncPortfolioTotalToFuturo(user.id)
      }

      return { updated, failed }
    } finally {
      setUpdating(false)
    }
  }, [sb])

  return { updateAll, updating }
}
