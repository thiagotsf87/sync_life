import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

/** Persona por módulo: system prompt + label + cor (deriva de MODULES). */
export interface Persona { label: string; color: string; system: string }

const BASE_RULES =
  'Você é o Coach de Vida do SyncLife. Fale em português do Brasil, em segunda pessoa (você). ' +
  'Seja direto e prático, sem jargão. Nunca invente números: use apenas o contexto fornecido. ' +
  'Não use travessão (—) nem emoji. Respostas curtas.'

export const MODULE_PERSONA: Record<ModuleId, Persona> = Object.fromEntries(
  (Object.keys(MODULES) as ModuleId[]).map((id) => [
    id,
    {
      label: MODULES[id].label,
      color: MODULES[id].color,
      system: `${BASE_RULES}\nFoco do módulo: ${MODULES[id].label}.`,
    },
  ]),
) as Record<ModuleId, Persona>

// ─── Finanças (piloto) ───────────────────────────────────────────────
export interface FinancasContext {
  income: number; expenses: number; balance: number; savingsRate: number
  txCount: number
  topCategories: { name: string; total: number }[]
}
type TxRow = { amount: number; type: 'income' | 'expense' | 'transfer'; category: { name: string } | null }

/** Agregação pura (testável sem DB). */
export function summarizeFinancas(txs: TxRow[]): FinancasContext {
  let income = 0, expenses = 0
  const cat = new Map<string, number>()
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') {
      expenses += t.amount
      const name = t.category?.name ?? 'Outros'
      cat.set(name, (cat.get(name) ?? 0) + t.amount)
    }
  }
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
  const topCategories = [...cat.entries()].map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total).slice(0, 5)
  return { income, expenses, balance, savingsRate, txCount: txs.length, topCategories }
}

// ─── Panorama (diário) ───────────────────────────────────────────────
// Type aliases (não interfaces) para o objeto ser atribuível a Record<string, unknown>.
export type ScoreSnapshot = {
  total: number
  financas: number | null
  futuro: number | null
  tempo: number | null
  corpo: number | null
  mente: number | null
  patrimonio: number | null
  carreira: number | null
  experiencias: number | null
  recorded_date: string
}
export type OrcamentoResumo = { category: string; gasto: number; limite: number; pct: number }
export type ContaResumo = { name: string; amount: number; day_of_month: number | null }
export type MetaResumo = { name: string; current_amount: number; target_amount: number; target_date: string | null }
export type CheckinResumo = { mood: number; note: string | null }

export type PanoramaContext = {
  financas: FinancasContext
  score?: ScoreSnapshot
  orcamentos?: OrcamentoResumo[]
  contas?: ContaResumo[]
  metas?: MetaResumo[]
  checkin_ontem?: CheckinResumo
}

/** Data de ontem no fuso America/Sao_Paulo (YYYY-MM-DD). */
function yesterdaySaoPaulo(): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const d = new Date(`${today}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Snapshot server-side por módulo. `supabase` = cliente server (await createClient()). */
export async function buildModuleContext(
  supabase: unknown, userId: string, moduleId: ModuleId,
): Promise<Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as { from: (t: string) => any }
  if (moduleId !== 'financas' && moduleId !== 'panorama') return {}

  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const end = new Date(y, m + 1, 0).toISOString().slice(0, 10)
  const { data } = await sb.from('transactions')
    .select('amount, type, category:categories(name)')
    .eq('user_id', userId).eq('is_future', false).gte('date', start).lte('date', end)
  const txs = (data ?? []) as TxRow[]
  const ctx: PanoramaContext = { financas: summarizeFinancas(txs) }
  if (moduleId === 'financas') return ctx

  // Panorama: enriquecimento best-effort. Cada bloco tolera falha (tabela
  // ausente por schema drift, erro de query): campo omitido, nunca throw.
  try {
    const { data: row }: { data: (Record<'score' | 'financas_score' | 'futuro_score' | 'tempo_score' | 'corpo_score' | 'mente_score' | 'patrimonio_score' | 'carreira_score' | 'experiencias_score', number | null> & { score: number; recorded_date: string }) | null } =
      await sb.from('life_sync_scores')
        .select('score, financas_score, futuro_score, tempo_score, corpo_score, mente_score, patrimonio_score, carreira_score, experiencias_score, recorded_date')
        .eq('user_id', userId).order('recorded_date', { ascending: false }).limit(1).maybeSingle()
    if (row) {
      ctx.score = {
        total: row.score,
        financas: row.financas_score, futuro: row.futuro_score, tempo: row.tempo_score,
        corpo: row.corpo_score, mente: row.mente_score, patrimonio: row.patrimonio_score,
        carreira: row.carreira_score, experiencias: row.experiencias_score,
        recorded_date: row.recorded_date,
      }
    }
  } catch { /* life_sync_scores pode não existir neste ambiente */ }

  try {
    const { data: buds }: { data: { amount: number; category: { name: string } | null }[] | null } =
      await sb.from('budgets')
        .select('amount, category:categories(name)')
        .eq('user_id', userId).eq('month', m + 1).eq('year', y)
    if (buds && buds.length > 0) {
      const spent = new Map<string, number>()
      for (const t of txs) {
        if (t.type !== 'expense') continue
        const name = t.category?.name ?? 'Outros'
        spent.set(name, (spent.get(name) ?? 0) + t.amount)
      }
      const rows: OrcamentoResumo[] = []
      for (const b of buds) {
        const name = b.category?.name
        if (!name || b.amount <= 0) continue
        const gasto = spent.get(name) ?? 0
        rows.push({ category: name, gasto, limite: b.amount, pct: Math.round((gasto / b.amount) * 100) })
      }
      rows.sort((a, b) => b.pct - a.pct)
      if (rows.length > 0) ctx.orcamentos = rows.slice(0, 3)
    }
  } catch { /* orçamentos são opcionais no contexto */ }

  try {
    const { data: recs }: { data: { description: string; amount: number; day_of_month: number | null }[] | null } =
      await sb.from('recurring_transactions')
        .select('description, amount, day_of_month')
        .eq('user_id', userId).eq('is_active', true).eq('type', 'expense')
        .order('day_of_month', { ascending: true }).limit(3)
    if (recs && recs.length > 0) {
      ctx.contas = recs.map(r => ({ name: r.description, amount: r.amount, day_of_month: r.day_of_month }))
    }
  } catch { /* contas fixas são opcionais no contexto */ }

  try {
    const { data: goals }: { data: MetaResumo[] | null } =
      await sb.from('goals')
        .select('name, current_amount, target_amount, target_date')
        .eq('user_id', userId).eq('status', 'active')
        .order('created_at', { ascending: false }).limit(3)
    if (goals && goals.length > 0) ctx.metas = goals
  } catch { /* metas são opcionais no contexto */ }

  try {
    const { data: checkin }: { data: CheckinResumo | null } =
      await sb.from('daily_checkins')
        .select('mood, note')
        .eq('user_id', userId).eq('checkin_date', yesterdaySaoPaulo()).maybeSingle()
    if (checkin) ctx.checkin_ontem = checkin
  } catch { /* check-in de ontem é opcional no contexto */ }

  return ctx
}
