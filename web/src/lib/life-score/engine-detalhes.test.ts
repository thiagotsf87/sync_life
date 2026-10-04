// Prova de que acrescentar `detalhes` aos calculadores de use-score-engine.ts
// NÃO mudou nenhuma fórmula: para um conjunto fixo de linhas (cliente Supabase
// falso), o total e o score de cada área ficam idênticos aos valores congelados
// ANTES da mudança (capturados rodando este teste contra o motor original).
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

type Linha = Record<string, unknown>
interface Tabela { data?: Linha[] | Linha | null; count?: number }

// por tabela; `transactions` diferencia entradas e saídas pelo eq('type', …)
const FIXTURE: Record<string, Tabela> = {
  budgets: { count: 2 },
  objectives: { data: [{ id: 'o1', status: 'active' }, { id: 'o2', status: 'completed' }], count: 1 },
  objective_goals: { data: [
    { objective_id: 'o1', current_value: 5, target_value: 10 },
    { objective_id: 'o2', current_value: 0, target_value: 10 },
  ] },
  health_profiles: { data: { weekly_activity_goal: 4 } },
  activities: { count: 3 },
  medical_appointments: { count: 1 },
  weight_entries: { count: 2 },
  daily_water_intake: { data: { intake_ml: 1200, goal_ml: 2000 } },
  focus_sessions: { data: [{ duration_minutes: 90 }, { duration_minutes: 60 }] },
  user_streaks: { data: { current_streak: 12 } },
  study_tracks: { count: 1 },
  asset_transactions: { data: [{ type: 'buy', amount: 500 }, { type: 'sell', amount: 100 }] },
  portfolio_assets: { data: [{ asset_class: 'acoes' }, { asset_class: 'fii' }] },
  career_roadmaps: { data: [{ steps: [{ status: 'in_progress' }, { status: 'pending' }] }] },
  skills: { data: [{ proficiency_level: 2 }, { proficiency_level: 0 }, { proficiency_level: 3 }] },
  agenda_events: { data: [{ status: 'concluido' }, { status: 'pendente' }], count: 6 },
  trips: { data: [{ id: 't1', status: 'planning' }, { id: 't2', status: 'completed' }] },
  bucket_list_items: { count: 4 },
}

function builder(tabela: string) {
  let head = false
  let tipo: string | null = null
  let single = false
  const b: Record<string, unknown> = {}
  const self = () => b
  b.select = (_c?: string, opts?: { head?: boolean }) => { head = Boolean(opts?.head); return b }
  b.eq = (col: string, val: unknown) => { if (col === 'type') tipo = String(val); return b }
  for (const m of ['in', 'gte', 'lte', 'order', 'limit']) b[m] = self
  b.maybeSingle = () => { single = true; return b }
  b.single = () => { single = true; return b }
  b.then = (ok: (v: unknown) => unknown) => {
    if (tabela === 'transactions') {
      if (head) return Promise.resolve({ count: 10, data: null }).then(ok)
      const data = tipo === 'income' ? [{ amount: 3000 }] : [{ amount: 1000 }]
      return Promise.resolve({ data }).then(ok)
    }
    const t = FIXTURE[tabela] ?? {}
    if (head) return Promise.resolve({ count: t.count ?? 0, data: null }).then(ok)
    const data = t.data ?? null
    return Promise.resolve({ data: single && Array.isArray(data) ? data[0] ?? null : data }).then(ok)
  }
  return b
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: (t: string) => builder(t) }),
}))

describe('calculateAllScores com detalhes', () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-04T15:00:00-03:00')) })
  afterAll(() => { vi.useRealTimers() })

  it('total e scores por área idênticos aos do motor original (todas as áreas)', async () => {
    const { calculateAllScores } = await import('@/hooks/use-score-engine')
    const r = await calculateAllScores('u1')
    const porArea = Object.fromEntries(r.modules.map((m) => [m.module, m.score]))
    expect({ total: r.total, porArea }).toEqual(CONGELADO_TODAS)
  })

  it('total idêntico com só 4 áreas ativas (pesos redistribuídos)', async () => {
    const { calculateAllScores } = await import('@/hooks/use-score-engine')
    const r = await calculateAllScores('u1', ['financas', 'futuro', 'corpo', 'experiencias'])
    expect(r.total).toBe(CONGELADO_QUATRO)
  })

  it('detalhes reproduzem a fórmula: pesos internos somam 1 e Σ peso × valor = score da área', async () => {
    const { calculateAllScores } = await import('@/hooks/use-score-engine')
    const r = await calculateAllScores('u1')
    for (const m of r.modules) {
      const d = m.detalhes ?? []
      expect(d.length).toBe(Object.keys(m.components).length)
      expect(d.reduce((s, c) => s + c.peso, 0)).toBeCloseTo(1, 10)
      for (const c of d) expect(c.valor).toBe(m.components[c.chave])
      expect(d.reduce((s, c) => s + c.peso * c.valor, 0)).toBeCloseTo(m.score, 1)
    }
  })
})

// valores do motor ANTES de `detalhes` (capturados contra o use-score-engine.ts original)
const CONGELADO_TODAS = {
  total: 52.91,
  porArea: {
    financas: 60, futuro: 41.67, corpo: 68.5, mente: 43.67,
    patrimonio: 50, carreira: 58.33, tempo: 45, experiencias: 52,
  } as Record<string, number>,
}
const CONGELADO_QUATRO = 55.35
