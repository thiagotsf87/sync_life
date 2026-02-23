# Spec — Tela: Transações Recorrentes (`/financas/recorrentes`)

> Esta spec é autocontida. Um desenvolvedor pode implementar a tela inteiramente lendo apenas este documento.

---

## 1. Visão Geral

A tela de Transações Recorrentes exibe e gerencia despesas e receitas que se repetem automaticamente em intervalos configurados (semanal, quinzenal, mensal, trimestral, anual). O usuário pode criar, editar, pausar e excluir recorrentes. A tela também projeta as próximas ocorrências nos próximos 30 dias.

**Rota:** `/financas/recorrentes`
**Arquivo:** `web/src/app/(app)/financas/recorrentes/page.tsx`
**Componentes:** `'use client'` — dados carregados via hook.

---

## 2. Referência Visual

Protótipo: `prototipos/proto-recorrentes-revisado.html`

**Elementos chave do protótipo:**
- Banner FREE com contador de uso `"X de 5 recorrentes usadas"` (cor roxa `#8b5cf6`)
- Summary strip de 4 KPI cards
- Card de próximas ocorrências (mini calendário horizontal)
- Seções agrupadas por frequência (`Mensais`, `Anuais`, etc.)
- Cada recorrente card: ícone + nome + badge tipo + meta info + valor + ações (Editar / Pausar / Excluir)
- Linha "Próximo lançamento" com data e countdown no rodapé de cada card
- Cartões pausados: `opacity: 0.55`, nome com `text-decoration: line-through`
- Modal de criação/edição com type toggle, freq grid 4 colunas, valor com prefixo R$
- Modal de exclusão com 2 opções: "Esta ocorrência" ou "Toda a série"
- JornadaInsight com percentual da renda e próximo lançamento

---

## 3. Layout Completo

### Anatomia da Página

```
┌────────────────────────────────────────────────────────┐
│  TOPBAR: título + subtítulo + botão "+ Nova recorrente"│
├────────────────────────────────────────────────────────┤
│  FREE BANNER (se plano free e ≥4 ativas)               │
├────────────────────────────────────────────────────────┤
│  SUMMARY STRIP: 4 KPI cards (Saída | Entrada | Líquido │
│                              | Custo anual)             │
├────────────────────────────────────────────────────────┤
│  JORNADA INSIGHT (hidden no Foco)                      │
├────────────────────────────────────────────────────────┤
│  PRÓXIMAS OCORRÊNCIAS — card com lista próximos 30 dias│
├────────────────────────────────────────────────────────┤
│  SEÇÃO: Mensais (count ativas) — total R$/mês          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ rec-card: icon | nome+badge | meta | valor | ações│  │
│  │ linha rodapé: Próximo lançamento: DD/MM/YYYY      │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  SEÇÃO: Anuais (count ativas) — total R$/ano           │
│  └── rec-cards...                                      │
├────────────────────────────────────────────────────────┤
│  SEÇÃO: Semanais / Quinzenais / Trimestrais (se houver)│
└────────────────────────────────────────────────────────┘
```

### Topbar

```tsx
<div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#10b981] mb-1">
      💰 Finanças
    </p>
    <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)] tracking-tight">
      Transações Recorrentes
    </h1>
    <p className="text-[13px] text-[var(--sl-t2)] mt-1">
      Despesas e receitas que acontecem automaticamente todo período.
    </p>
  </div>
  <button onClick={() => setModalOpen(true)}
    className="inline-flex items-center gap-2 bg-[#10b981] text-[#03071a] font-bold text-[13px] px-5 py-2.5 rounded-full border-none cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all shrink-0">
    <Plus size={14} strokeWidth={2.5} />
    Nova recorrente
  </button>
</div>
```

### FREE Banner

Exibido quando: plano FREE e `activeCount >= 4` (4 de 5 usadas).
Quando `activeCount === 5`: botão `"+ Nova recorrente"` fica desabilitado.

```tsx
{isPlanFree && activeCount >= 4 && (
  <div className="flex items-center gap-3 bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)] rounded-xl px-[18px] py-[14px] mb-5">
    <span className="text-xl shrink-0">⭐</span>
    <div className="flex-1">
      <div className="text-[13px] font-semibold text-[var(--sl-t1)] mb-0.5">
        Você está usando {activeCount} de 5 recorrentes do plano Free
      </div>
      <div className="text-[12px] text-[var(--sl-t2)]">
        Assine o PRO para criar recorrentes ilimitadas e nunca perder um lançamento.
      </div>
    </div>
    <button className="text-[12px] font-bold px-[14px] py-[6px] rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#a78bfa] cursor-pointer hover:bg-[rgba(139,92,246,0.25)] transition-all whitespace-nowrap">
      Ver PRO
    </button>
  </div>
)}
```

### Summary Strip

```tsx
<div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
  <KpiCard label="Saída mensal"    value={`− ${fmtR(totalExpenseMonthly)}`}  delta={`${expenseCount} despesas ativas`}  accent="#f43f5e" deltaType="down" />
  <KpiCard label="Entrada mensal"  value={`+ ${fmtR(totalIncomeMonthly)}`}   delta={`${incomeCount} receitas ativas`}   accent="#10b981" deltaType="up" />
  <KpiCard label="Impacto líquido" value={`${netMonthly >= 0 ? '+ ' : '− '}${fmtR(Math.abs(netMonthly))}`} delta="por mês" accent={netMonthly >= 0 ? '#10b981' : '#f43f5e'} deltaType={netMonthly >= 0 ? 'up' : 'down'} />
  <KpiCard label="Custo anual"     value={fmtR(totalExpenseAnnual)}          delta="só em despesas fixas"                accent="#f59e0b" deltaType="warn" />
</div>
```

**Fórmulas dos KPIs:**
- `totalExpenseMonthly`: soma de `normalizedMonthlyAmount` de todas as recorrentes ativas do tipo `expense`
- `totalIncomeMonthly`: soma de `normalizedMonthlyAmount` de todas as recorrentes ativas do tipo `income`
- `netMonthly`: `totalIncomeMonthly - totalExpenseMonthly`
- `totalExpenseAnnual`: `totalExpenseMonthly * 12`
- `activeCount`: todas as recorrentes com `is_active = true` e `is_paused = false`

**Normalização para mensal:**
```ts
function normalizeToMonthly(amount: number, frequency: Frequency): number {
  const multipliers: Record<Frequency, number> = {
    weekly:      4.33,
    biweekly:    2.17,
    monthly:     1,
    quarterly:   1/3,
    annual:      1/12,
  }
  return amount * multipliers[frequency]
}
```

### JornadaInsight

```tsx
<JornadaInsight text={
  <>
    Suas despesas recorrentes representam{' '}
    <strong>{expensePct}% da sua renda mensal</strong>
    {expensePct <= 20 ? ' — isso é saudável.' : expensePct <= 35 ? ' — atenção ao orçamento.' : ' — acima do recomendado.'}
    {nextOccurrence && (
      <> O próximo lançamento é <strong>{nextOccurrence.name} dia {nextOccurrence.day}</strong>, em {nextOccurrence.daysLeft} dias.</>
    )}
  </>
} />
```

`expensePct = Math.round((totalExpenseMonthly / (profile.monthly_income || 1)) * 100)`

### Card de Próximas Ocorrências

```tsx
<SLCard className="mb-7">
  <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.06em] mb-4">
    📅 Próximas ocorrências — {formatMonthYear(nextMonth)}
  </p>
  <div className="flex flex-col divide-y divide-[var(--sl-border)]">
    {upcomingOccurrences.map(occ => (
      <div key={occ.id} className="flex items-center gap-3 py-[9px]">
        {/* Data */}
        <div className="w-11 shrink-0 text-center">
          <div className="font-[DM_Mono] text-[18px] font-bold text-[var(--sl-t1)] leading-none">
            {occ.day.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] text-[var(--sl-t3)] uppercase tracking-[0.05em]">
            {occ.monthShort}
          </div>
        </div>
        {/* Ícone */}
        <span className="text-[18px] shrink-0">{occ.icon}</span>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{occ.name}</div>
          <div className="text-[11px] text-[var(--sl-t3)]">{FREQ_LABELS[occ.frequency]}</div>
        </div>
        {/* Valor */}
        <span className={cn(
          'font-[DM_Mono] text-[13px] font-medium whitespace-nowrap',
          occ.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
        )}>
          {occ.type === 'income' ? '+ ' : '− '}{fmtR(occ.amount)}
        </span>
      </div>
    ))}
  </div>
</SLCard>
```

### Seções de Recorrentes

Agrupamentos por frequência: `monthly`, `annual`, `quarterly`, `biweekly`, `weekly`.
Cada seção só é exibida se houver ao menos 1 recorrente daquela frequência.

```tsx
{FREQUENCY_GROUPS.map(freq => {
  const items = grouped[freq]
  if (!items || items.length === 0) return null
  const totalMonthly = items
    .filter(r => r.is_active && !r.is_paused)
    .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)
  return (
    <section key={freq} className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-[Syne] text-[13px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.06em]">
            {FREQ_SECTION_LABELS[freq]}
          </span>
          <span className="text-[11px] text-[var(--sl-t3)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2 py-0.5">
            {items.filter(r => r.is_active && !r.is_paused).length} ativas
          </span>
        </div>
        <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)]">
          − {fmtR(totalMonthly)} / mês
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(rec => <RecorrenteCard key={rec.id} rec={rec} onEdit={...} onPause={...} onDelete={...} />)}
      </div>
    </section>
  )
})}
```

**Ordem de exibição das seções:** `monthly` → `biweekly` → `weekly` → `quarterly` → `annual`

### RecorrenteCard

```tsx
interface RecorrenteCardProps {
  rec: RecurrenteWithCategory
  onEdit: (rec: RecurrenteWithCategory) => void
  onPause: (id: string, isPaused: boolean) => Promise<void>
  onDelete: (rec: RecurrenteWithCategory) => void
}

function RecorrenteCard({ rec, onEdit, onPause, onDelete }: RecorrenteCardProps) {
  const isPaused = rec.is_paused
  const nextDate = isPaused ? null : calcNextOccurrence(rec)

  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[18px] py-4 transition-colors hover:border-[var(--sl-border-h)] relative',
      isPaused && 'opacity-55'
    )}>
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Ícone */}
        <div className={cn(
          'w-10 h-10 rounded-[11px] flex items-center justify-center text-xl shrink-0',
          rec.type === 'income'
            ? 'bg-[rgba(16,185,129,0.12)]'
            : 'bg-[rgba(244,63,94,0.1)]'
        )}>
          {rec.categories?.icon ?? (rec.type === 'income' ? '💰' : '📤')}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('text-[14px] font-semibold text-[var(--sl-t1)] truncate', isPaused && 'line-through opacity-70')}>
              {rec.name}
            </span>
            <span className={cn(
              'text-[10px] font-bold px-[7px] py-[2px] rounded-full shrink-0',
              rec.type === 'income'
                ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.2)]'
                : 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e] border border-[rgba(244,63,94,0.2)]'
            )}>
              {rec.type === 'income' ? 'Receita' : 'Despesa'}
            </span>
            {isPaused && (
              <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full bg-[rgba(110,144,184,0.1)] text-[var(--sl-t2)] border border-[rgba(110,144,184,0.2)] shrink-0">
                Pausada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] text-[var(--sl-t3)]">
              <Calendar size={12} />
              {getDayOfMonthLabel(rec)}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-[var(--sl-t3)]">
              <Clock size={12} />
              Desde {formatMonthYear(rec.start_date)}
            </span>
            {rec.categories?.name && (
              <span className="text-[12px] text-[var(--sl-t3)]">
                {rec.categories.icon} {rec.categories.name}
              </span>
            )}
          </div>
        </div>

        {/* Valor + Ações */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn(
            'font-[DM_Mono] text-[16px] font-medium whitespace-nowrap',
            isPaused && 'opacity-50',
            rec.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {rec.type === 'income' ? '+ ' : '− '}{fmtR(rec.amount)}
          </span>

          {/* Ações — hidden on mobile */}
          <div className="flex gap-1 max-sm:hidden">
            <button onClick={() => onEdit(rec)}
              className="flex items-center gap-1 border border-[var(--sl-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all">
              <Pencil size={12} />
              Editar
            </button>
            <button onClick={() => onPause(rec.id, rec.is_paused)}
              className={cn(
                'flex items-center gap-1 border rounded-lg px-2.5 py-1 text-[11px] transition-all',
                isPaused
                  ? 'border-[rgba(16,185,129,0.3)] text-[#10b981] hover:bg-[rgba(16,185,129,0.06)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[rgba(245,158,11,0.4)] hover:text-[#f59e0b]'
              )}>
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
            <button onClick={() => onDelete(rec)}
              className="flex items-center gap-1 border border-[var(--sl-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--sl-t3)] hover:border-[rgba(244,63,94,0.4)] hover:text-[#f43f5e] transition-all">
              <Trash2 size={12} />
              Excluir
            </button>
          </div>

          {/* Menu kebab no mobile */}
          <button className="sm:hidden border border-[var(--sl-border)] rounded-lg p-1.5 text-[var(--sl-t3)]">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Rodapé: próximo lançamento */}
      <div className={cn(
        'flex items-center justify-between mt-3 pt-3 border-t border-[var(--sl-border)]',
        isPaused && 'opacity-50'
      )}>
        <span className="text-[11px] text-[var(--sl-t3)]">
          {isPaused ? 'Pausada — não vai gerar lançamentos' : 'Próximo lançamento'}
        </span>
        {!isPaused && nextDate && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--sl-t2)] font-medium">
              {formatDateLong(nextDate)}
            </span>
            <span className={cn(
              'text-[11px]',
              nextDate.daysLeft <= 7 ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]'
            )}>
              em {nextDate.daysLeft} dias{nextDate.daysLeft <= 7 ? ' ⚠' : ''}
            </span>
          </div>
        )}
        {isPaused && (
          <span className="text-[12px] text-[var(--sl-t2)]">Retomar para reativar</span>
        )}
      </div>
    </div>
  )
}
```

---

## 4. Interfaces TypeScript

```ts
// src/types/financas.ts (se não existir, criar ou estender)

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'

interface RecurringTransaction {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number              // sempre positivo
  type: 'income' | 'expense'
  frequency: Frequency
  day_of_month: number | null
  start_date: string          // ISO date
  end_date: string | null     // ISO date
  is_active: boolean
  is_paused: boolean
  last_paid_at: string | null // ISO date
  notes: string | null
  created_at: string
  updated_at: string
}

interface RecurrenteWithCategory extends RecurringTransaction {
  categories: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

interface NextOccurrence {
  date: Date
  daysLeft: number
  day: number
  monthShort: string
}

interface RecorrenteFormData {
  type: 'income' | 'expense'
  name: string
  amount: string             // valor como string, ex: "150,00"
  frequency: Frequency
  day_of_month: number
  start_date: string
  end_date: string
  category_id: string
  notes: string
}

interface DeleteOption {
  mode: 'single' | 'series'  // 'single' = apenas esta ocorrência, 'series' = toda a série
}
```

---

## 5. Constantes

```ts
const FREQ_LABELS: Record<Frequency, string> = {
  weekly:    'Semanal',
  biweekly:  'Quinzenal',
  monthly:   'Mensal',
  quarterly: 'Trimestral',
  annual:    'Anual',
}

const FREQ_SECTION_LABELS: Record<Frequency, string> = {
  weekly:    'Semanais',
  biweekly:  'Quinzenais',
  monthly:   'Mensais',
  quarterly: 'Trimestrais',
  annual:    'Anuais',
}

// Ordem de exibição das seções
const FREQUENCY_GROUPS: Frequency[] = ['monthly', 'biweekly', 'weekly', 'quarterly', 'annual']

const FREE_PLAN_LIMIT = 5  // máximo de recorrentes ativas no plano FREE

// Retorna o label do dia para exibição no card
function getDayOfMonthLabel(rec: RecurringTransaction): string {
  if (rec.frequency === 'weekly') return 'Toda semana'
  if (rec.frequency === 'biweekly') return 'A cada 15 dias'
  if (rec.day_of_month) return `Todo dia ${rec.day_of_month}`
  return FREQ_LABELS[rec.frequency]
}
```

---

## 6. Hook `useRecorrentes`

```ts
// src/hooks/use-recorrentes.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseRecorrentesReturn {
  recorrentes: RecurrenteWithCategory[]
  upcomingOccurrences: UpcomingOccurrence[]
  grouped: Partial<Record<Frequency, RecurrenteWithCategory[]>>
  loading: boolean
  error: string | null
  activeCount: number
  totalExpenseMonthly: number
  totalIncomeMonthly: number
  netMonthly: number
  totalExpenseAnnual: number
  createRecorrente: (data: RecorrenteFormData) => Promise<void>
  updateRecorrente: (id: string, data: Partial<RecorrenteFormData>) => Promise<void>
  togglePause: (id: string, currentPaused: boolean) => Promise<void>
  deleteRecorrente: (id: string, mode: 'series') => Promise<void>
  markAsPaid: (id: string) => Promise<void>
  refresh: () => void
}

interface UpcomingOccurrence {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  amount: number
  frequency: Frequency
  date: Date
  day: number
  monthShort: string
  daysLeft: number
}

export function useRecorrentes(): UseRecorrentesReturn {
  const supabase = createClient()
  const [recorrentes, setRecorrentes] = useState<RecurrenteWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*, categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('frequency')
      .order('day_of_month', { ascending: true, nullsFirst: false })
      .order('name')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRecorrentes((data as any) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Cálculos derivados
  const activeItems = recorrentes.filter(r => !r.is_paused)
  const activeCount = activeItems.length

  const totalExpenseMonthly = activeItems
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)

  const totalIncomeMonthly = activeItems
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)

  const netMonthly = totalIncomeMonthly - totalExpenseMonthly
  const totalExpenseAnnual = totalExpenseMonthly * 12

  // Agrupamento por frequência
  const grouped = recorrentes.reduce((acc, r) => {
    if (!acc[r.frequency]) acc[r.frequency] = []
    acc[r.frequency]!.push(r)
    return acc
  }, {} as Partial<Record<Frequency, RecurrenteWithCategory[]>>)

  // Próximas ocorrências (próximos 30 dias)
  const upcomingOccurrences = calcUpcoming(recorrentes, 30)

  // Ações
  const createRecorrente = async (formData: RecorrenteFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload = {
      user_id: user.id,
      type: formData.type,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount.replace(',', '.')),
      frequency: formData.frequency,
      day_of_month: formData.day_of_month || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      category_id: formData.category_id || null,
      notes: formData.notes || null,
      is_active: true,
      is_paused: false,
    }

    const { error } = await supabase.from('recurring_transactions').insert(payload as any)
    if (error) throw error
    await fetchData()
  }

  const updateRecorrente = async (id: string, updates: Partial<RecorrenteFormData>) => {
    const payload: any = { ...updates, updated_at: new Date().toISOString() }
    if (updates.amount) payload.amount = parseFloat((updates.amount as string).replace(',', '.'))
    const { error } = await supabase.from('recurring_transactions').update(payload).eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const togglePause = async (id: string, currentPaused: boolean) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_paused: !currentPaused, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteRecorrente = async (id: string, mode: 'series') => {
    // 'series': soft-delete (marca is_active = false)
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: false, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const markAsPaid = async (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ last_paid_at: today, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  return {
    recorrentes,
    upcomingOccurrences,
    grouped,
    loading,
    error,
    activeCount,
    totalExpenseMonthly,
    totalIncomeMonthly,
    netMonthly,
    totalExpenseAnnual,
    createRecorrente,
    updateRecorrente,
    togglePause,
    deleteRecorrente,
    markAsPaid,
    refresh: fetchData,
  }
}
```

---

## 7. Queries Supabase

### Listar recorrentes ativas

```sql
SELECT
  rt.*,
  c.id    AS "categories.id",
  c.name  AS "categories.name",
  c.icon  AS "categories.icon",
  c.color AS "categories.color"
FROM recurring_transactions rt
LEFT JOIN categories c ON rt.category_id = c.id
WHERE rt.user_id = auth.uid()
  AND rt.is_active = true
ORDER BY rt.frequency, rt.day_of_month ASC NULLS LAST, rt.name;
```

### Criar recorrente

```sql
INSERT INTO recurring_transactions (
  user_id, type, name, amount, frequency,
  day_of_month, start_date, end_date,
  category_id, notes, is_active, is_paused
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false
)
RETURNING *;
```

### Atualizar recorrente

```sql
UPDATE recurring_transactions
SET name = $2, amount = $3, frequency = $4,
    day_of_month = $5, end_date = $6,
    category_id = $7, notes = $8,
    updated_at = NOW()
WHERE id = $1 AND user_id = auth.uid();
```

### Pausar/Retomar

```sql
UPDATE recurring_transactions
SET is_paused = $2, updated_at = NOW()
WHERE id = $1 AND user_id = auth.uid();
```

### Excluir série (soft delete)

```sql
UPDATE recurring_transactions
SET is_active = false, updated_at = NOW()
WHERE id = $1 AND user_id = auth.uid();
```

### Marcar como pago

```sql
UPDATE recurring_transactions
SET last_paid_at = CURRENT_DATE, updated_at = NOW()
WHERE id = $1 AND user_id = auth.uid();
```

---

## 8. Regras de Negócio

### Limite FREE

```ts
const FREE_PLAN_LIMIT = 5

// Conta como ativa: is_active = true (independente de is_paused)
// Verificar antes de criar nova:
const canCreate = isPlanFree
  ? recorrentes.filter(r => r.is_active).length < FREE_PLAN_LIMIT
  : true

// Ao tentar criar com limite atingido: exibir modal de upgrade, NÃO abrir modal de criação
```

### Algoritmo de Próxima Ocorrência

```ts
function calcNextOccurrence(rec: RecurringTransaction): NextOccurrence | null {
  if (rec.is_paused || !rec.is_active) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Para frequências com day_of_month
  if (rec.frequency === 'monthly' || rec.frequency === 'quarterly' || rec.frequency === 'annual') {
    const targetDay = rec.day_of_month ?? 1
    let candidate = new Date(today.getFullYear(), today.getMonth(), targetDay)

    // Se o dia do mês não existe (ex: dia 31 em fevereiro), usa o último dia do mês
    function clampDay(year: number, month: number, day: number): Date {
      const lastDay = new Date(year, month + 1, 0).getDate()
      return new Date(year, month, Math.min(day, lastDay))
    }

    candidate = clampDay(today.getFullYear(), today.getMonth(), targetDay)

    if (candidate <= today) {
      // Avança para o próximo período
      let nextMonth = today.getMonth()
      let nextYear = today.getFullYear()

      if (rec.frequency === 'monthly') {
        nextMonth += 1
      } else if (rec.frequency === 'quarterly') {
        nextMonth += 3
      } else if (rec.frequency === 'annual') {
        nextYear += 1
      }

      // Normalizar overflow de mês
      if (nextMonth > 11) { nextYear += Math.floor(nextMonth / 12); nextMonth = nextMonth % 12 }
      candidate = clampDay(nextYear, nextMonth, targetDay)
    }

    // Verificar end_date
    if (rec.end_date && candidate > new Date(rec.end_date)) return null

    const daysLeft = Math.ceil((candidate.getTime() - today.getTime()) / 86400000)
    return {
      date: candidate,
      daysLeft,
      day: candidate.getDate(),
      monthShort: candidate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    }
  }

  // Para weekly/biweekly: calcula a partir da start_date
  if (rec.frequency === 'weekly' || rec.frequency === 'biweekly') {
    const intervalDays = rec.frequency === 'weekly' ? 7 : 14
    const start = new Date(rec.start_date)
    let candidate = new Date(start)

    while (candidate <= today) {
      candidate = new Date(candidate.getTime() + intervalDays * 86400000)
    }

    if (rec.end_date && candidate > new Date(rec.end_date)) return null

    const daysLeft = Math.ceil((candidate.getTime() - today.getTime()) / 86400000)
    return {
      date: candidate,
      daysLeft,
      day: candidate.getDate(),
      monthShort: candidate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    }
  }

  return null
}
```

### Algoritmo de Próximas 30 Dias (card de upcoming)

```ts
function calcUpcoming(recorrentes: RecurringTransaction[], days: number): UpcomingOccurrence[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today.getTime() + days * 86400000)

  const result: UpcomingOccurrence[] = []

  for (const rec of recorrentes) {
    if (!rec.is_active || rec.is_paused) continue

    const next = calcNextOccurrence(rec)
    if (next && next.date >= today && next.date <= limit) {
      result.push({
        id: rec.id,
        name: rec.name,
        icon: rec.categories?.icon ?? (rec.type === 'income' ? '💰' : '📤'),
        type: rec.type,
        amount: rec.amount,
        frequency: rec.frequency,
        date: next.date,
        day: next.day,
        monthShort: next.monthShort,
        daysLeft: next.daysLeft,
      } as any)
    }
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime())
}
```

### Day of Month — Meses Curtos

```
Dia 31 em fevereiro → usa dia 28 (ou 29 em ano bissexto)
Dia 31 em abril, junho, setembro, novembro → usa dia 30
Implementado via função clampDay() acima
```

### Excluir

O modal de exclusão apresenta 2 opções:

**Opção 1 — Toda a série** (soft delete: `is_active = false`)
- O histórico de transações vinculadas (`recurring_transaction_id`) permanece intacto.
- Use o texto: "Remove esta recorrente e impede novos lançamentos futuros. Lançamentos já criados não são afetados."

**Nota:** Não existe "excluir apenas esta ocorrência" na tabela `recurring_transactions` — esta operação seria realizada na tabela `transactions` para transações já geradas. No contexto da tela de Recorrentes, sempre excluir a série completa. O modal de 2 opções é apresentado para clareza, mas ambas executam o mesmo soft delete na recorrente. A diferença é contextual.

---

## 9. Modais

### Modal Criar/Editar Recorrente

Campos:
1. **Tipo** — type toggle: `Despesa` | `Receita` (2 botões, selecionado tem borda colorida)
2. **Nome** — input texto, obrigatório, placeholder "Ex: Netflix, Aluguel..."
3. **Valor** — input com prefixo "R$", DM Mono, máscara monetária
4. **Frequência** — grid 4 colunas: `Semanal | Quinzenal | Mensal | Trimestral | Anual`
   - No banco, os valores válidos são: `weekly | biweekly | monthly | quarterly | annual`
5. **Dia do mês** — input number (1–31), visível apenas para `monthly | quarterly | annual`
6. **Data de início** — date input, obrigatório
7. **Encerramento** — date input, opcional, label: "Encerramento (opcional)"
8. **Categoria** — select dropdown com categorias do usuário
9. **Notas** — textarea opcional

Validação:
- Nome: obrigatório, mínimo 2 caracteres
- Valor: obrigatório, maior que 0
- Frequência: obrigatório
- Data de início: obrigatória
- Encerramento: se preenchido, deve ser posterior à data de início

### Modal Excluir Recorrente

```tsx
<div className="modal">
  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--sl-t2)] mb-1.5">
    Atenção
  </div>
  <h2 className="font-[Syne] text-[20px] font-extrabold text-[var(--sl-t1)] mb-2">
    Excluir recorrente
  </h2>
  <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">
    Escolha o que deseja fazer com <strong>"{rec.name}"</strong>:
  </p>

  {/* Opção: Toda a série */}
  <div className="flex items-start gap-3 p-[14px] border-[1.5px] border-[var(--sl-border)] rounded-xl cursor-pointer bg-[var(--sl-s2)] hover:border-[rgba(244,63,94,0.35)] hover:bg-[rgba(244,63,94,0.04)] transition-all mb-2.5"
    onClick={() => handleDelete('series')}>
    <span className="text-[22px] shrink-0 mt-0.5">🗑️</span>
    <div>
      <div className="text-[13px] font-semibold text-[var(--sl-t1)] mb-0.5">Excluir toda a série</div>
      <div className="text-[12px] text-[var(--sl-t2)] leading-relaxed">
        Remove esta recorrente e impede novos lançamentos futuros. Lançamentos já registrados não são excluídos.
      </div>
    </div>
  </div>
</div>
```

---

## 10. States

### Loading

```tsx
// Skeleton para seção de recorrentes
<div className="flex flex-col gap-2">
  {Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[11px] bg-[var(--sl-s3)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-48 bg-[var(--sl-s3)] rounded" />
          <div className="h-3 w-32 bg-[var(--sl-s3)] rounded" />
        </div>
        <div className="h-5 w-24 bg-[var(--sl-s3)] rounded" />
      </div>
    </div>
  ))}
</div>
```

### Empty State

```tsx
{recorrentes.length === 0 && !loading && (
  <div className="text-center py-12 px-6 bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl">
    <span className="text-[40px] block mb-3 opacity-70">🔄</span>
    <h3 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1.5">
      Nenhuma recorrente cadastrada
    </h3>
    <p className="text-[13px] text-[var(--sl-t2)] mb-4">
      Cadastre suas despesas fixas e receitas regulares para nunca perder um lançamento.
    </p>
    <button onClick={() => setModalOpen(true)}
      className="inline-flex items-center gap-2 bg-[#10b981] text-[#03071a] font-bold text-[13px] px-5 py-2.5 rounded-full">
      <Plus size={14} />
      Criar primeira recorrente
    </button>
  </div>
)}
```

### Error State

```tsx
{error && (
  <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e]">
    Erro ao carregar recorrentes. <button onClick={refresh} className="underline">Tentar novamente</button>
  </div>
)}
```

---

## 11. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` | `text-sl-grad` (gradiente) |
| JornadaInsight | `hidden` | `flex` (via `[.jornada_&]:flex`) |
| Conteúdo insight | — | "Suas despesas fixas são X% da renda. Próximo: [nome] em N dias." |
| KPI summary | Dados puros | Mesmos dados |

```tsx
// Título adaptativo
<h1 className={cn(
  'font-[Syne] font-extrabold text-2xl tracking-tight',
  isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
)}>
  Transações Recorrentes
</h1>
```

---

## 12. Responsividade

| Breakpoint | Comportamento |
|---|---|
| Desktop (>768px) | Summary strip 4 colunas, ações visíveis no card |
| Tablet (≤768px) | Summary strip 2 colunas |
| Mobile (≤640px) | Summary strip 2 colunas, ações do card ocultas (kebab menu), modal row colunas colapsam para 1, freq-grid 2 colunas |

```css
/* Summary strip */
@media (max-width: 640px) { grid-template-columns: repeat(2, 1fr) }

/* Freq grid no modal */
@media (max-width: 640px) { grid-template-columns: repeat(2, 1fr) }

/* Ações no card */
.rec-actions { display: flex }
@media (max-width: 640px) { .rec-actions { display: none } }
```

---

## 13. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] FREE banner exibido quando `activeCount >= 4` no plano Free
- [ ] Botão "+ Nova" desabilitado quando `activeCount >= FREE_PLAN_LIMIT` no plano Free
- [ ] Seções agrupadas por frequência, na ordem: mensal → quinzenal → semanal → trimestral → anual
- [ ] `normalizeToMonthly` correto para todos os 5 tipos de frequência
- [ ] `calcNextOccurrence`: dia clampado para último dia do mês quando necessário
- [ ] Recorrentes pausadas: `opacity-55`, nome com `line-through`
- [ ] Card rodapé: data e countdown corretos, amarelo para ≤7 dias
- [ ] Card de Próximas Ocorrências com os próximos 30 dias
- [ ] Valores em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] JornadaInsight presente e oculto no Foco
- [ ] Modal de exclusão com 2 opções (apenas visual — ambas executam soft delete)
- [ ] Animações `sl-fade-up` com delays nos cards
- [ ] Responsivo: summary strip 2 colunas em mobile, ações ocultas no card
- [ ] `hover:border-[var(--sl-border-h)]` em todos os cards
