/**
 * SyncLife — Integrações Cross-Module → Finanças
 *
 * Funções bridge standalone que criam transações automaticamente a partir
 * de ações em outros módulos (opt-in pelo usuário).
 *
 * Badge "Auto — <módulo>" identifica transações geradas automaticamente.
 *
 * Regras: RN-PTR-12, RN-CAR-01, RN-EXP-03, RN-CRP-07, RN-MNT-09
 *         RN-CRP-38, RN-PTR-23, RN-EXP-31, RN-CAR-19
 */

import { createClient } from '@/lib/supabase/client'

function isDateInFuture(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d > today
}

// ─── Patrimônio → Finanças (RN-PTR-12) ───────────────────────────────────────

/**
 * Provento recebido → receita automática em Finanças
 * Categoria: "investimentos" | Badge: "Auto — 📈 Patrimônio"
 */
export async function createTransactionFromProvento(opts: {
  ticker: string
  dividendType: string
  totalAmount: number
  paymentDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const typeLabel: Record<string, string> = {
    dividend: 'Dividendo',
    jcp: 'JCP',
    fii_yield: 'Rendimento FII',
    fixed_income_interest: 'Juros RF',
    other: 'Provento',
  }

  const description = `Auto — 📈 Patrimônio | ${opts.ticker} ${typeLabel[opts.dividendType] ?? 'Provento'}`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'investimentos',
    type: 'income',
    amount: opts.totalAmount,
    description,
    date: opts.paymentDate,
    payment_method: 'transfer',
    is_future: isDateInFuture(opts.paymentDate),
    notes: `Gerado automaticamente a partir de provento de ${opts.ticker}`,
    recurring_transaction_id: null,
  })
}

/**
 * Aporte em patrimônio (compra de ativo) -> despesa em Finanças.
 * Categoria: "investimentos" | Badge: "Auto — 📈 Patrimônio"
 */
export async function createTransactionFromAporte(opts: {
  ticker: string
  amount: number
  operationDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — 📈 Patrimônio | Aporte ${opts.ticker}`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'investimentos',
    type: 'expense',
    amount: opts.amount,
    description,
    date: opts.operationDate,
    payment_method: 'transfer',
    is_future: isDateInFuture(opts.operationDate),
    notes: `Gerado automaticamente a partir de aporte em ${opts.ticker}`,
    recurring_transaction_id: null,
  })
}

// ─── Carreira → Finanças (RN-CAR-01) ─────────────────────────────────────────

/**
 * Salário atualizado → receita recorrente em Finanças
 * Categoria: "salario" | Badge: "Auto — 💼 Carreira"
 */
export async function createTransactionFromSalario(opts: {
  title: string
  grossSalary: number
  competenceDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — 💼 Carreira | Salário ${opts.title ? `— ${opts.title}` : ''}`.trim()

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'salario',
    type: 'income',
    amount: opts.grossSalary,
    description,
    date: opts.competenceDate,
    payment_method: 'transfer',
    is_future: isDateInFuture(opts.competenceDate),
    notes: `Gerado automaticamente a partir do perfil de carreira`,
    recurring_transaction_id: null,
  })
}

// ─── Corpo → Finanças (RN-CRP-07) ────────────────────────────────────────────

/**
 * Consulta médica com custo → despesa em Finanças
 * Categoria: "saude" | Badge: "Auto — 🏃 Corpo"
 */
export async function createTransactionFromConsulta(opts: {
  specialty: string
  cost: number
  appointmentDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — 🏃 Corpo | Consulta ${opts.specialty}`
  const dateOnly = opts.appointmentDate.slice(0, 10)

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'saude',
    type: 'expense',
    amount: opts.cost,
    description,
    date: dateOnly,
    payment_method: 'credit',
    is_future: isDateInFuture(dateOnly),
    notes: `Gerado automaticamente a partir da consulta de ${opts.specialty}`,
    recurring_transaction_id: null,
  })
}

// ─── Mente → Finanças (RN-MNT-09) ────────────────────────────────────────────

/**
 * Trilha de estudo com custo → despesa em Finanças
 * Categoria: "educacao" | Badge: "Auto — 📚 Mente"
 */
export async function createTransactionFromCurso(opts: {
  trackName: string
  cost: number
  enrollmentDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — 📚 Mente | Curso "${opts.trackName}"`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'educacao',
    type: 'expense',
    amount: opts.cost,
    description,
    date: opts.enrollmentDate,
    payment_method: 'credit',
    is_future: isDateInFuture(opts.enrollmentDate),
    notes: `Gerado automaticamente ao criar trilha de estudo "${opts.trackName}"`,
    recurring_transaction_id: null,
  })
}

// ─── Experiências → Finanças (RN-EXP-03) ─────────────────────────────────────

/**
 * Viagem criada com orçamento → despesa planejada em Finanças
 * Categoria: "lazer" | Badge: "Auto — ✈️ Experiências"
 */
export async function createTransactionFromViagem(opts: {
  tripName: string
  totalBudget: number
  startDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — ✈️ Experiências | ${opts.tripName}`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'lazer',
    type: 'expense',
    amount: opts.totalBudget,
    description,
    date: opts.startDate,
    payment_method: 'credit',
    is_future: isDateInFuture(opts.startDate),
    notes: `Gerado automaticamente a partir do orçamento da viagem "${opts.tripName}"`,
    recurring_transaction_id: null,
  })
}

// ─── Experiências → Finanças: custo real (RN-EXP-20) ─────────────────────────

/**
 * Viagem concluída com gasto real → despesa em Finanças
 * Categoria: "lazer" | Badge: "Auto — ✈️ Experiências"
 */
export async function createTransactionFromTripActual(opts: {
  tripName: string
  actualSpent: number
  completionDate: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — ✈️ Experiências | Gasto real: ${opts.tripName}`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'lazer',
    type: 'expense',
    amount: opts.actualSpent,
    description,
    date: opts.completionDate,
    payment_method: 'credit',
    is_future: false,
    notes: `Gasto real registrado ao concluir a viagem "${opts.tripName}"`,
    recurring_transaction_id: null,
  })
}

// ─── Corpo → Finanças: orçamento alimentar (RN-CRP-25) ───────────────────────

/**
 * Orçamento alimentar semanal → despesa planejada em Finanças
 * Categoria: "alimentacao" | Badge: "Auto — 🏃 Corpo"
 */
export async function createTransactionFromCardapio(opts: {
  weeklyBudget: number
  weekStart: string  // YYYY-MM-DD
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const description = `Auto — 🏃 Corpo | Orçamento alimentar semanal`

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'alimentacao',
    type: 'expense',
    amount: opts.weeklyBudget,
    description,
    date: opts.weekStart,
    payment_method: 'debit',
    is_future: isDateInFuture(opts.weekStart),
    notes: `Orçamento semanal alimentar gerado via Cardápio IA`,
    recurring_transaction_id: null,
  })
}

// ─── Futuro → Finanças (RN-FUT-31) ────────────────────────────────────────────
export async function createTransactionFromFuturoGoal(opts: {
  goalName: string
  objectiveName: string
  amount: number
  date: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  await (supabase as any).from('transactions').insert({
    user_id: user.id,
    category_id: 'investimentos',
    type: 'expense',
    amount: opts.amount,
    description: `Auto — 🔮 Futuro | Meta financeira: ${opts.goalName}`,
    date: opts.date,
    payment_method: 'transfer',
    is_future: isDateInFuture(opts.date),
    notes: `Planejamento gerado automaticamente para o objetivo "${opts.objectiveName}"`,
    recurring_transaction_id: null,
  })
}
