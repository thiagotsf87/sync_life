'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  text: string
  type: 'positive' | 'warning' | 'tip'
}

interface UseFinancialInsightsReturn {
  insights: Insight[]
  loading: boolean
  error: string | null
  regenerate: () => void
}

const CACHE_KEY_PREFIX = 'sl_fin_insights_'

function getCacheKey(year: number, month: number): string {
  return `${CACHE_KEY_PREFIX}${year}-${String(month).padStart(2, '0')}`
}

function getCache(year: number, month: number): Insight[] | null {
  try {
    const raw = localStorage.getItem(getCacheKey(year, month))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // TTL: same month only
    if (parsed.year === year && parsed.month === month) {
      return parsed.insights
    }
    return null
  } catch {
    return null
  }
}

function setCache(year: number, month: number, insights: Insight[]): void {
  try {
    localStorage.setItem(getCacheKey(year, month), JSON.stringify({ year, month, insights }))
  } catch {}
}

export function useFinancialInsights({ month, year }: { month: number; year: number }): UseFinancialInsightsReturn {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCache(year, month)
      if (cached) {
        setInsights(cached)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Não autenticado'); setLoading(false); return }

      // Fetch month transactions
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: txns } = await (supabase as any)
        .from('transactions')
        .select('amount, type, description, category:categories(name, icon)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_future', false)

      if (!txns || txns.length === 0) {
        setInsights([{ text: 'Adicione transações este mês para receber insights da IA.', type: 'tip' }])
        setLoading(false)
        return
      }

      const totalIncome = txns.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
      const totalExpense = txns.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0)

      // Group by category
      const catMap: Record<string, number> = {}
      txns.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        const name = t.category?.name ?? 'Outros'
        catMap[name] = (catMap[name] ?? 0) + t.amount
      })
      const topCats = Object.entries(catMap).sort(([,a], [,b]) => b - a).slice(0, 5)

      const financialContext = {
        totalIncome, totalExpense,
        balance: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
        topCategories: topCats.map(([name, amount]) => ({ name, amount })),
        transactionCount: txns.length,
      }

      const res = await fetch('/api/ai/financas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analise meus dados financeiros deste mês e me dê exatamente 3 insights concretos e acionáveis. Para cada insight, comece com [POSITIVO], [ALERTA] ou [DICA]. Seja direto e específico com números.`,
          }],
          financialContext,
        }),
      })

      if (!res.ok) throw new Error('Falha ao consultar IA')

      // The API uses streamText, so we need to consume the stream
      if (!res.body) throw new Error('Resposta sem corpo')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
      }

      // Parse insights from text
      const lines = text.split('\n').filter(l => l.trim().length > 0)
      const parsed: Insight[] = []
      for (const line of lines) {
        const clean = line.replace(/^\d+[\.\)]\s*/, '').trim()
        if (!clean) continue
        let type: Insight['type'] = 'tip'
        let insightText = clean
        if (clean.startsWith('[POSITIVO]')) { type = 'positive'; insightText = clean.replace('[POSITIVO]', '').trim() }
        else if (clean.startsWith('[ALERTA]')) { type = 'warning'; insightText = clean.replace('[ALERTA]', '').trim() }
        else if (clean.startsWith('[DICA]')) { type = 'tip'; insightText = clean.replace('[DICA]', '').trim() }
        if (insightText) parsed.push({ type, text: insightText })
      }

      const result = parsed.length > 0 ? parsed.slice(0, 3) : [{ text: text.slice(0, 300), type: 'tip' as const }]
      setInsights(result)
      setCache(year, month, result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar insights')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const regenerate = useCallback(() => {
    fetchInsights(true)
  }, [fetchInsights])

  return { insights, loading, error, regenerate }
}
