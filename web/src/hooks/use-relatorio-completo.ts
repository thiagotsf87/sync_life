'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRelatorioCompleto() {
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (lifeScore: number, dimensions: { name: string; score: number }[]) => {
    setGenerating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const sb = supabase as any
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuário'
      const period = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())

      // Fetch data in parallel
      const [txnRes, goalsRes, activitiesRes, assetsRes, eventsRes, sessionsRes, weightsRes] = await Promise.all([
        sb.from('transactions').select('amount, type, category:categories(name)').eq('user_id', user.id).gte('date', startDate).lte('date', endDate).eq('is_future', false),
        sb.from('goals').select('name, current_amount, target_amount, status').eq('user_id', user.id),
        sb.from('activities').select('duration_minutes').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
        sb.from('portfolio_assets').select('quantity, avg_price, current_price').eq('user_id', user.id),
        sb.from('agenda_events').select('id, status').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
        sb.from('study_sessions').select('duration_minutes').eq('user_id', user.id).gte('date', startDate).lte('date', endDate),
        sb.from('weight_entries').select('weight').eq('user_id', user.id).order('date', { ascending: false }).limit(1),
      ]) as [
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
        { data: any[] | null; error: unknown },
      ]

      // Build financial data
      let financas = undefined
      const txns = txnRes.data ?? []
      if (txns.length > 0) {
        const totalIncome = txns.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
        const totalExpense = txns.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0)
        const catMap: Record<string, number> = {}
        txns.filter((t: any) => t.type === 'expense').forEach((t: any) => {
          const name = t.category?.name ?? 'Outros'
          catMap[name] = (catMap[name] ?? 0) + t.amount
        })
        financas = {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
          topCategories: Object.entries(catMap).sort(([,a], [,b]) => b - a).slice(0, 5).map(([name, amount]) => ({ name, amount })),
        }
      }

      // Build goals data
      const allGoals = goalsRes.data ?? []
      let futuro = undefined
      if (allGoals.length > 0) {
        futuro = {
          activeGoals: allGoals.filter((g: any) => g.status === 'active').length,
          completedGoals: allGoals.filter((g: any) => g.status === 'completed').length,
          goals: allGoals.filter((g: any) => g.status === 'active').slice(0, 5).map((g: any) => ({
            name: g.name, progress: g.current_amount, target: g.target_amount,
          })),
        }
      }

      // Build corpo data
      const acts = activitiesRes.data ?? []
      let corpo = undefined
      if (acts.length > 0) {
        corpo = {
          activities: acts.length,
          totalMinutes: acts.reduce((s: number, a: any) => s + (a.duration_minutes ?? 0), 0),
          currentWeight: weightsRes.data?.[0]?.weight ?? undefined,
        }
      }

      // Build patrimonio data
      const assets = assetsRes.data ?? []
      let patrimonio = undefined
      if (assets.length > 0) {
        const totalValue = assets.reduce((s: number, a: any) => s + a.quantity * (a.current_price ?? a.avg_price), 0)
        const totalInvested = assets.reduce((s: number, a: any) => s + a.quantity * a.avg_price, 0)
        patrimonio = {
          totalValue,
          totalInvested,
          gainPct: totalInvested > 0 ? Math.round(((totalValue - totalInvested) / totalInvested) * 100) : 0,
        }
      }

      // Build tempo data
      const evts = eventsRes.data ?? []
      let tempo = undefined
      if (evts.length > 0) {
        tempo = {
          totalEvents: evts.length,
          completedEvents: evts.filter((e: any) => e.status === 'completed').length,
        }
      }

      // Build mente data
      const sessions = sessionsRes.data ?? []
      let mente = undefined
      if (sessions.length > 0) {
        const totalMins = sessions.reduce((s: number, ss: any) => s + (ss.duration_minutes ?? 0), 0)
        mente = {
          studyHours: Math.round(totalMins / 60),
          activeTracks: 0, // We'd need another query for this
        }
      }

      const { generateRelatorioPdfCompleto } = await import('@/lib/pdf/relatorio-completo')
      await generateRelatorioPdfCompleto({
        userName,
        period,
        lifeScore,
        dimensions,
        financas,
        futuro,
        corpo,
        patrimonio,
        tempo,
        mente,
      })
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generate, generating }
}
