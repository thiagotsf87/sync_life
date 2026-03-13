/**
 * Mock data para o módulo Finanças — visual validation only.
 * Setar USE_MOCK = false para desativar e usar dados reais do Supabase.
 */
export const USE_MOCK = false

// ─── CATEGORIAS ──────────────────────────────────────────────────────────────

const CAT = {
  alimentacao: { id: 'cat-1', name: 'Alimentação', icon: '🛒', color: '#10b981' },
  moradia:     { id: 'cat-2', name: 'Moradia',     icon: '🏠', color: '#0055ff' },
  transporte:  { id: 'cat-3', name: 'Transporte',  icon: '🚗', color: '#f59e0b' },
  lazer:       { id: 'cat-4', name: 'Lazer',        icon: '🎮', color: '#a855f7' },
  saude:       { id: 'cat-5', name: 'Saúde',        icon: '🏥', color: '#f97316' },
  educacao:    { id: 'cat-6', name: 'Educação',     icon: '📚', color: '#06b6d4' },
  salario:     { id: 'cat-7', name: 'Salário',      icon: '💰', color: '#10b981' },
  freelance:   { id: 'cat-8', name: 'Freelance',    icon: '💻', color: '#0055ff' },
  assinaturas: { id: 'cat-9', name: 'Assinaturas',  icon: '📺', color: '#a855f7' },
  vestuario:   { id: 'cat-10', name: 'Vestuário',   icon: '👕', color: '#f43f5e' },
} as const

// ─── MOCK: useBudgets ────────────────────────────────────────────────────────

export const MOCK_BUDGETS = [
  { id: 'b1', category_id: CAT.alimentacao.id, amount: 2000, month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.alimentacao, gasto: 1250, pct: 63, isActive: true },
  { id: 'b2', category_id: CAT.moradia.id,     amount: 2500, month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.moradia,     gasto: 2500, pct: 100, isActive: true },
  { id: 'b3', category_id: CAT.transporte.id,  amount: 800,  month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.transporte,  gasto: 620,  pct: 78, isActive: true },
  { id: 'b4', category_id: CAT.lazer.id,       amount: 600,  month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.lazer,       gasto: 510,  pct: 85, isActive: true },
  { id: 'b5', category_id: CAT.saude.id,       amount: 400,  month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.saude,       gasto: 150,  pct: 38, isActive: true },
  { id: 'b6', category_id: CAT.educacao.id,    amount: 500,  month: 3, year: 2026, alert_threshold: 80, rollover: false, notes: null, is_active: true, category: CAT.educacao,    gasto: 350,  pct: 70, isActive: true },
]

export const MOCK_RECEITAS_MES = 10500
export const MOCK_MONTHLY_INCOME = 8000

// ─── MOCK: useTransactions ───────────────────────────────────────────────────

export const MOCK_TRANSACTIONS = [
  // Fevereiro 2026
  { id: 'tx-feb-01', amount: 8000, type: 'income' as const, description: 'Salário fevereiro',    date: '2026-02-05', payment_method: 'transfer', notes: null, is_future: false, recurring_transaction_id: 'rec-1', created_at: '2026-02-05T08:00:00Z', category: CAT.salario },
  { id: 'tx-feb-02', amount: 2500, type: 'expense' as const, description: 'Aluguel fevereiro',   date: '2026-02-01', payment_method: 'boleto',   notes: null, is_future: false, recurring_transaction_id: 'rec-2', created_at: '2026-02-01T07:00:00Z', category: CAT.moradia },
  { id: 'tx-feb-03', amount: 520,  type: 'expense' as const, description: 'Supermercado fev',    date: '2026-02-10', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-02-10T11:00:00Z', category: CAT.alimentacao },
  { id: 'tx-feb-04', amount: 280,  type: 'expense' as const, description: 'Posto fevereiro',     date: '2026-02-15', payment_method: 'debit',    notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-02-15T14:00:00Z', category: CAT.transporte },
  // Março 2026
  { id: 'tx-01', amount: 8000, type: 'income' as const, description: 'Salário março',           date: '2026-03-05', payment_method: 'transfer', notes: null, is_future: false, recurring_transaction_id: 'rec-1', created_at: '2026-03-05T08:00:00Z', category: CAT.salario },
  { id: 'tx-02', amount: 2500, type: 'income' as const, description: 'Projeto freelance XYZ',   date: '2026-03-03', payment_method: 'pix',      notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-03T10:00:00Z', category: CAT.freelance },
  { id: 'tx-03', amount: 2500, type: 'expense' as const, description: 'Aluguel apartamento',    date: '2026-03-01', payment_method: 'boleto',   notes: null, is_future: false, recurring_transaction_id: 'rec-2', created_at: '2026-03-01T07:00:00Z', category: CAT.moradia },
  { id: 'tx-04', amount: 487,  type: 'expense' as const, description: 'Supermercado Extra',     date: '2026-03-02', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-02T11:30:00Z', category: CAT.alimentacao },
  { id: 'tx-05', amount: 320,  type: 'expense' as const, description: 'Posto combustível',      date: '2026-03-01', payment_method: 'debit',    notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-01T14:00:00Z', category: CAT.transporte },
  { id: 'tx-06', amount: 150,  type: 'expense' as const, description: 'Farmácia',               date: '2026-03-03', payment_method: 'pix',      notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-03T16:45:00Z', category: CAT.saude },
  { id: 'tx-07', amount: 89,   type: 'expense' as const, description: 'iFood — Jantar',         date: '2026-03-04', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-04T20:30:00Z', category: CAT.alimentacao },
  { id: 'tx-08', amount: 250,  type: 'expense' as const, description: 'Cinema + pipoca',        date: '2026-03-02', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-02T19:00:00Z', category: CAT.lazer },
  { id: 'tx-09', amount: 120,  type: 'expense' as const, description: 'Academia SmartFit',      date: '2026-03-05', payment_method: 'debit',    notes: null, is_future: false, recurring_transaction_id: 'rec-5', created_at: '2026-03-05T06:00:00Z', category: CAT.saude },
  { id: 'tx-10', amount: 350,  type: 'expense' as const, description: 'Curso Udemy — React',    date: '2026-03-01', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-01T09:15:00Z', category: CAT.educacao },
  { id: 'tx-11', amount: 55,   type: 'expense' as const, description: 'Netflix + Spotify',      date: '2026-03-05', payment_method: 'credit',   notes: null, is_future: false, recurring_transaction_id: 'rec-4', created_at: '2026-03-05T00:00:00Z', category: CAT.assinaturas },
  { id: 'tx-12', amount: 300,  type: 'expense' as const, description: 'Uber — semana',          date: '2026-03-04', payment_method: 'pix',      notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-04T08:30:00Z', category: CAT.transporte },
  { id: 'tx-13', amount: 415,  type: 'expense' as const, description: 'Mercado municipal',      date: '2026-03-05', payment_method: 'debit',    notes: null, is_future: false, recurring_transaction_id: null,    created_at: '2026-03-05T10:00:00Z', category: CAT.alimentacao },
  { id: 'tx-14', amount: 260,  type: 'expense' as const, description: 'Restaurante japonês',    date: '2026-03-03', payment_method: 'credit',   notes: 'Aniversário amigo', is_future: false, recurring_transaction_id: null,    created_at: '2026-03-03T13:00:00Z', category: CAT.lazer },
  { id: 'tx-15', amount: 150,  type: 'expense' as const, description: 'Internet Vivo Fibra',    date: '2026-03-04', payment_method: 'boleto',   notes: null, is_future: false, recurring_transaction_id: 'rec-3', created_at: '2026-03-04T00:00:00Z', category: CAT.moradia },
  // Future transactions
  { id: 'tx-16', amount: 180,  type: 'expense' as const, description: 'Dentista — limpeza',     date: '2026-03-15', payment_method: 'pix',      notes: null, is_future: true,  recurring_transaction_id: null,    created_at: '2026-03-01T00:00:00Z', category: CAT.saude },
  { id: 'tx-17', amount: 299,  type: 'expense' as const, description: 'Tênis Nike',             date: '2026-03-20', payment_method: 'credit',   notes: null, is_future: true,  recurring_transaction_id: null,    created_at: '2026-03-01T00:00:00Z', category: CAT.vestuario },
  { id: 'tx-18', amount: 89,   type: 'expense' as const, description: 'Presente aniversário',   date: '2026-03-12', payment_method: 'pix',      notes: null, is_future: true,  recurring_transaction_id: null,    created_at: '2026-03-01T00:00:00Z', category: CAT.lazer },
  // Abril 2026
  { id: 'tx-abr-01', amount: 8000, type: 'income' as const, description: 'Salário abril',       date: '2026-04-05', payment_method: 'transfer', notes: null, is_future: true,  recurring_transaction_id: 'rec-1', created_at: '2026-03-01T00:00:00Z', category: CAT.salario },
  { id: 'tx-abr-02', amount: 2500, type: 'expense' as const, description: 'Aluguel abril',        date: '2026-04-01', payment_method: 'boleto',   notes: null, is_future: true,  recurring_transaction_id: 'rec-2', created_at: '2026-03-01T00:00:00Z', category: CAT.moradia },
]

// ─── MOCK: useRecorrentes ────────────────────────────────────────────────────

const now = new Date()
const today = now.toISOString().split('T')[0]

export const MOCK_RECORRENTES = [
  {
    id: 'rec-1', user_id: 'u1', category_id: CAT.salario.id, name: 'Salário', amount: 8000, type: 'income' as const,
    frequency: 'monthly' as const, day_of_month: 5, start_date: '2025-01-05', end_date: null,
    is_active: true, is_paused: false, last_paid_at: today, notes: null, created_at: '2025-01-01T00:00:00Z', updated_at: today,
    categories: CAT.salario,
  },
  {
    id: 'rec-6', user_id: 'u1', category_id: CAT.freelance.id, name: 'Freelance mensal', amount: 2500, type: 'income' as const,
    frequency: 'monthly' as const, day_of_month: 15, start_date: '2025-06-15', end_date: null,
    is_active: true, is_paused: false, last_paid_at: null, notes: null, created_at: '2025-06-01T00:00:00Z', updated_at: today,
    categories: CAT.freelance,
  },
  {
    id: 'rec-2', user_id: 'u1', category_id: CAT.moradia.id, name: 'Aluguel', amount: 2500, type: 'expense' as const,
    frequency: 'monthly' as const, day_of_month: 10, start_date: '2024-06-10', end_date: null,
    is_active: true, is_paused: false, last_paid_at: today, notes: null, created_at: '2024-06-01T00:00:00Z', updated_at: today,
    categories: CAT.moradia,
  },
  {
    id: 'rec-3', user_id: 'u1', category_id: CAT.moradia.id, name: 'Internet Vivo', amount: 150, type: 'expense' as const,
    frequency: 'monthly' as const, day_of_month: 15, start_date: '2024-06-15', end_date: null,
    is_active: true, is_paused: false, last_paid_at: null, notes: null, created_at: '2024-06-01T00:00:00Z', updated_at: today,
    categories: CAT.moradia,
  },
  {
    id: 'rec-4', user_id: 'u1', category_id: CAT.assinaturas.id, name: 'Netflix + Spotify', amount: 55, type: 'expense' as const,
    frequency: 'monthly' as const, day_of_month: 20, start_date: '2024-01-20', end_date: null,
    is_active: true, is_paused: false, last_paid_at: null, notes: null, created_at: '2024-01-01T00:00:00Z', updated_at: today,
    categories: CAT.assinaturas,
  },
  {
    id: 'rec-5', user_id: 'u1', category_id: CAT.saude.id, name: 'Academia SmartFit', amount: 120, type: 'expense' as const,
    frequency: 'monthly' as const, day_of_month: 5, start_date: '2025-03-05', end_date: null,
    is_active: true, is_paused: false, last_paid_at: today, notes: null, created_at: '2025-03-01T00:00:00Z', updated_at: today,
    categories: CAT.saude,
  },
  {
    id: 'rec-7', user_id: 'u1', category_id: CAT.transporte.id, name: 'Seguro Auto', amount: 350, type: 'expense' as const,
    frequency: 'quarterly' as const, day_of_month: 1, start_date: '2025-01-01', end_date: null,
    is_active: true, is_paused: false, last_paid_at: null, notes: null, created_at: '2025-01-01T00:00:00Z', updated_at: today,
    categories: CAT.transporte,
  },
]

// ─── MOCK: usePlanejamento ───────────────────────────────────────────────────

export const MOCK_PLANNING_EVENTS = [
  { id: 'pe-1', user_id: 'u1', category_id: CAT.saude.id,     name: 'Check-up anual',                    amount: 450,  type: 'expense' as const, planned_date: '2026-03-26', is_confirmed: false, notes: null, created_at: '2026-02-01T00:00:00Z', categories: CAT.saude },
  { id: 'pe-2', user_id: 'u1', category_id: CAT.freelance.id, name: 'Bônus projeto grande — Cliente D',  amount: 5000, type: 'income' as const,  planned_date: '2026-04-10', is_confirmed: false, notes: null, created_at: '2026-02-15T00:00:00Z', categories: CAT.freelance },
  { id: 'pe-3', user_id: 'u1', category_id: CAT.educacao.id,  name: 'Especialização em Product Design',  amount: 2400, type: 'expense' as const, planned_date: '2026-04-25', is_confirmed: true,  notes: null, created_at: '2026-01-10T00:00:00Z', categories: CAT.educacao },
  { id: 'pe-4', user_id: 'u1', category_id: CAT.transporte.id,name: 'IPVA parcela única',                amount: 3200, type: 'expense' as const, planned_date: '2026-05-15', is_confirmed: false, notes: null, created_at: '2026-02-01T00:00:00Z', categories: CAT.transporte },
  { id: 'pe-5', user_id: 'u1', category_id: CAT.lazer.id,     name: 'Viagem de férias — Florianópolis',  amount: 4800, type: 'expense' as const, planned_date: '2026-07-15', is_confirmed: false, notes: null, created_at: '2026-01-20T00:00:00Z', categories: CAT.lazer },
]

export const MOCK_PROFILE = {
  current_balance: 38472,
  monthly_income: 8000,
  savings_goal_pct: 20,
}

// ─── MOCK: useCalendario — transactions for full month ───────────────────────

function generateCalendarTransactions(): Record<string, unknown>[] {
  // Spread transactions across March 2026
  const txs: Record<string, unknown>[] = []
  const descriptions = [
    { desc: 'Supermercado Extra', cat: CAT.alimentacao, type: 'expense', amounts: [487, 320, 410, 195] },
    { desc: 'iFood', cat: CAT.alimentacao, type: 'expense', amounts: [45, 89, 62, 38, 75] },
    { desc: 'Uber', cat: CAT.transporte, type: 'expense', amounts: [32, 28, 45, 18, 55] },
    { desc: 'Farmácia', cat: CAT.saude, type: 'expense', amounts: [150, 85] },
  ]

  let id = 100
  for (let day = 1; day <= 28; day++) {
    const date = `2026-03-${String(day).padStart(2, '0')}`
    // Salary on day 5
    if (day === 5) {
      txs.push({ id: `tx-cal-${id++}`, description: 'Salário março', amount: 8000, type: 'income', date, is_future: day > 5, recurring_transaction_id: 'rec-1', categories: CAT.salario })
    }
    // Freelance on day 15
    if (day === 15) {
      txs.push({ id: `tx-cal-${id++}`, description: 'Projeto freelance XYZ', amount: 2500, type: 'income', date, is_future: day > 5, recurring_transaction_id: null, categories: CAT.freelance })
    }
    // Rent on day 1
    if (day === 1) {
      txs.push({ id: `tx-cal-${id++}`, description: 'Aluguel apartamento', amount: 2500, type: 'expense', date, is_future: false, recurring_transaction_id: 'rec-2', categories: CAT.moradia })
    }
    // Random expenses every 2-3 days
    if (day % 3 === 0 || day % 5 === 0) {
      const group = descriptions[day % descriptions.length]
      const amount = group.amounts[day % group.amounts.length]
      txs.push({ id: `tx-cal-${id++}`, description: group.desc, amount, type: group.type, date, is_future: day > 5, recurring_transaction_id: null, categories: group.cat })
    }
  }
  return txs
}

export const MOCK_CALENDAR_TRANSACTIONS = generateCalendarTransactions()

export const MOCK_CALENDAR_PLANNING_EVENTS = [
  { id: 'pe-1', name: 'Check-up anual', amount: 450, type: 'expense', planned_date: '2026-03-26', is_confirmed: false, categories: CAT.saude },
]

// ─── MOCK: useRelatorios — 3 months of transactions ──────────────────────────

function generateReportTransactions(): { current: any[]; prev: any[] } {
  const cats = [CAT.alimentacao, CAT.moradia, CAT.transporte, CAT.lazer, CAT.saude, CAT.educacao]
  const current: any[] = []
  const prev: any[] = []
  let id = 200

  // Current period: Jan-Mar 2026
  for (const m of ['2026-01', '2026-02', '2026-03']) {
    // Income
    current.push({ id: `rtx-${id++}`, description: 'Salário', amount: 8000, type: 'income', date: `${m}-05`, payment_method: 'transfer', notes: null, is_future: false, categories: CAT.salario })
    current.push({ id: `rtx-${id++}`, description: 'Freelance', amount: 2500, type: 'income', date: `${m}-15`, payment_method: 'pix', notes: null, is_future: false, categories: CAT.freelance })

    // Expenses (varied by month)
    const monthNum = parseInt(m.split('-')[1])
    const variance = monthNum === 1 ? 0.85 : monthNum === 2 ? 1.1 : 1.0
    const expenses = [
      { cat: CAT.alimentacao, base: 1800 },
      { cat: CAT.moradia,     base: 2500 },
      { cat: CAT.transporte,  base: 650 },
      { cat: CAT.lazer,       base: 450 },
      { cat: CAT.saude,       base: 200 },
      { cat: CAT.educacao,    base: 350 },
    ]
    for (const exp of expenses) {
      const amount = Math.round(exp.base * variance)
      current.push({ id: `rtx-${id++}`, description: `${exp.cat.name} — ${m}`, amount, type: 'expense', date: `${m}-${String(10 + cats.indexOf(exp.cat)).padStart(2, '0')}`, payment_method: 'credit', notes: null, is_future: false, categories: exp.cat })
    }
  }

  // Previous period: Oct-Dec 2025
  for (const m of ['2025-10', '2025-11', '2025-12']) {
    prev.push({ id: `rtx-${id++}`, description: 'Salário', amount: 7500, type: 'income', date: `${m}-05`, payment_method: 'transfer', notes: null, is_future: false, categories: CAT.salario })
    prev.push({ id: `rtx-${id++}`, description: 'Freelance', amount: 2000, type: 'income', date: `${m}-15`, payment_method: 'pix', notes: null, is_future: false, categories: CAT.freelance })

    const expenses = [
      { cat: CAT.alimentacao, base: 1600 },
      { cat: CAT.moradia,     base: 2500 },
      { cat: CAT.transporte,  base: 550 },
      { cat: CAT.lazer,       base: 380 },
      { cat: CAT.saude,       base: 180 },
      { cat: CAT.educacao,    base: 300 },
    ]
    for (const exp of expenses) {
      prev.push({ id: `rtx-${id++}`, description: `${exp.cat.name} — ${m}`, amount: exp.base, type: 'expense', date: `${m}-${String(10 + cats.indexOf(exp.cat)).padStart(2, '0')}`, payment_method: 'credit', notes: null, is_future: false, categories: exp.cat })
    }
  }

  return { current, prev }
}

export const MOCK_REPORT_DATA = generateReportTransactions()
