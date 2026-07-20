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
  return { income, expenses, balance, savingsRate, topCategories }
}

/** Snapshot server-side por módulo. `supabase` = cliente server (await createClient()). */
export async function buildModuleContext(
  supabase: unknown, userId: string, moduleId: ModuleId,
): Promise<Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as { from: (t: string) => any }
  if (moduleId === 'financas' || moduleId === 'panorama') {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const end = new Date(y, m + 1, 0).toISOString().slice(0, 10)
    const { data } = await sb.from('transactions')
      .select('amount, type, category:categories(name)')
      .eq('user_id', userId).eq('is_future', false).gte('date', start).lte('date', end)
    return { financas: summarizeFinancas((data ?? []) as TxRow[]) }
  }
  return {}
}
