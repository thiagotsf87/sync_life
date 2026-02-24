# SyncLife — Spec de Tela: Orçamentos
**Versão:** 1.0 · 23/02/2026
**Path:** `/financas/orcamentos`
**Protótipo de referência:** `proto-orcamentos-revisado.html`

---

## 1. Visão Geral

A tela de Orçamentos gerencia os "envelopes" financeiros mensais do usuário — limites de gasto por categoria. Cada envelope define um teto de gasto para uma categoria em um determinado mês. O objetivo é ajudar o usuário a controlar gastos por categoria e visualizar rapidamente quais estão dentro ou fora do limite.

**Quem usa:** todos os usuários do módulo Finanças (Free e PRO).
**Plano Free:** sem limite de envelopes.
**Escopo padrão:** mês atual, alterável pelo seletor de mês.

---

## 2. Referência Visual

Arquivo: `C:/Projetos/sync_life/prototipos/proto-orcamentos-revisado.html`

Layout identificado no protótipo:
- Header com título + seletor de mês + botão "Novo Envelope"
- Summary Strip (4 KPIs): Total Orçado, Total Gasto, Saldo Livre, Envelopes OK
- Banner 50-30-20 (condicional — só se há renda cadastrada)
- Insight Jornada (oculto no Foco)
- Bloco "Não Alocado" (card dashed com valor destacado)
- Seção "Envelopes Ativos" com lista de cards de envelope
- Seção "Envelopes Inativos" (sem gastos no mês, ao final, opacity 45%)
- Tutorial modal (5 passos) para primeiro uso
- Modal de criação/edição de envelope

---

## 3. Layout Completo

### Estrutura da página

```
max-w-[1000px] mx-auto px-6 py-8 pb-20
```

**Ordem dos blocos:**

1. Header (topbar)
2. Summary Strip (4 KPIs)
3. Banner 50-30-20 (condicional)
4. Insight Jornada
5. Não Alocado (card dashed)
6. Seção "ENVELOPES ATIVOS" + lista
7. Seção "ENVELOPES INATIVOS" + lista

### Header (Topbar)

```tsx
<div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
  <div>
    <p className="text-[11px] text-[#10b981] font-bold uppercase tracking-[.07em] mb-1">
      💰 Finanças
    </p>
    <h1 className={cn(
      'font-[Syne] font-extrabold text-[24px] tracking-tight',
      isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
    )}>
      Orçamentos
    </h1>
  </div>
  <div className="flex items-center gap-2.5">
    {/* Seletor de mês */}
    <button className="flex items-center gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2 hover:border-[var(--sl-border-h)] transition-colors">
      <span className="font-[DM_Mono] text-[13px] font-semibold text-[var(--sl-t1)]">{mesLabel}</span>
      <ChevronDown size={14} className="text-[var(--sl-t3)]" />
    </button>
    {/* Novo envelope */}
    <button className="flex items-center gap-1.5 bg-[#10b981] text-[#03071a] font-bold text-[13px] px-[18px] py-[9px] rounded-full border-none shadow-[0_4px_16px_rgba(16,185,129,.25)] hover:-translate-y-px hover:brightness-106 transition-all">
      <Plus size={14} />
      Novo Envelope
    </button>
  </div>
</div>
```

### Summary Strip (4 KPIs)

```tsx
<div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
  <KpiCard label="Total Orçado" value={`R$ ${fmtR$(totalOrcado)}`} accent="#0055ff"
    delta={`${qtdEnvelopes} envelopes`} deltaType="neutral" />
  <KpiCard label="Total Gasto" value={`R$ ${fmtR$(totalGasto)}`} accent="#f43f5e"
    delta={`${pctGasto}% do orçado`}
    deltaType={pctGasto > 85 ? 'down' : pctGasto > 60 ? 'warn' : 'neutral'} />
  <KpiCard label="Disponível" value={`R$ ${fmtR$(totalOrcado - totalGasto)}`} accent="#10b981"
    delta={pctGasto < 60 ? 'Dentro do limite' : pctGasto < 85 ? 'Atenção' : 'Limite próximo'}
    deltaType={pctGasto < 60 ? 'up' : pctGasto < 85 ? 'warn' : 'down'} />
  <KpiCard label="Envelopes OK" value={`${qtdOk} / ${qtdTotal}`} accent="#10b981"
    delta={`${qtdAlert} em atenção · ${qtdOver} estourado${qtdOver !== 1 ? 's' : ''}`}
    deltaType={qtdOver > 0 ? 'down' : qtdAlert > 0 ? 'warn' : 'up'} />
</div>
```

### Banner 50-30-20

**Condição de exibição:** `profiles.monthly_income > 0` E `totalOrcado === 0` (nenhum envelope criado ainda) OU usuário ainda não dispensou o banner (estado em `localStorage`).

```tsx
{monthlyIncome > 0 && showBanner50_30_20 && (
  <div className="relative overflow-hidden flex items-start gap-3.5 bg-[rgba(16,185,129,.05)] border border-[rgba(16,185,129,.15)] rounded-[14px] px-5 py-4 mb-6">
    {/* Linha gradiente no topo */}
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10b981] to-transparent" />
    <span className="text-[22px] shrink-0 mt-0.5">💡</span>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-[var(--sl-t1)] mb-0.5">
        Sugestão 50-30-20 baseada na sua renda
      </p>
      <p className="text-[12px] text-[var(--sl-t2)] leading-[1.55]">
        Com renda de <strong>R$ {fmtR$(monthlyIncome)}</strong>: destine{' '}
        <strong>R$ {fmtR$(monthlyIncome * 0.5)}</strong> para necessidades (50%),{' '}
        <strong>R$ {fmtR$(monthlyIncome * 0.3)}</strong> para desejos (30%) e{' '}
        <strong>R$ {fmtR$(monthlyIncome * 0.2)}</strong> para poupança (20%).
      </p>
      <div className="flex gap-2 mt-2.5">
        <button onClick={handleApply5030_20}
          className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full bg-[#10b981] text-[#03071a] border-none cursor-pointer hover:brightness-105 transition-all">
          Aplicar sugestão
        </button>
        <button onClick={handleDismissBanner}
          className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-[var(--sl-border-h)] text-[var(--sl-t2)] bg-none cursor-pointer hover:brightness-110">
          Ignorar
        </button>
      </div>
    </div>
    <button onClick={handleDismissBanner} className="shrink-0 text-[16px] text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors bg-none border-none cursor-pointer p-0.5">
      ×
    </button>
  </div>
)}
```

**Quando "Aplicar sugestão" é clicado:** criar automaticamente envelopes pré-configurados com base na renda (ver regra 7.5).

### Não Alocado

```tsx
<div className="flex items-center gap-3.5 bg-[var(--sl-s1)] border border-dashed border-[rgba(16,185,129,.30)] rounded-[14px] px-5 py-4 mb-6">
  <div className="w-10 h-10 rounded-[12px] bg-[rgba(16,185,129,.10)] flex items-center justify-center text-[20px] shrink-0">
    🟢
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-[11px] text-[var(--sl-t3)] uppercase tracking-[.06em] mb-0.5">
      Não Alocado
    </p>
    <p className="font-[DM_Mono] text-[20px] font-medium text-[#10b981]">
      R$ {fmtR$(naoAlocado)}
    </p>
    <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">
      Receitas do mês (R$ {fmtR$(receitasMes)}) minus total orçado (R$ {fmtR$(totalOrcado)})
    </p>
  </div>
  {naoAlocado > 0 && (
    <button onClick={openNewEnvelopeModal}
      className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-[rgba(16,185,129,.25)] text-[#10b981] bg-none cursor-pointer hover:bg-[rgba(16,185,129,.08)] transition-all shrink-0">
      + Criar envelope
    </button>
  )}
</div>
```

### Lista de Envelopes

**Seção header:**
```tsx
<div className="flex items-center justify-between mb-3">
  <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t2)] uppercase tracking-[.06em]">
    Envelopes Ativos
  </h2>
  <span className="text-[11px] text-[var(--sl-t3)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2 py-0.5">
    {qtdAtivos}
  </span>
</div>
```

**Card de Envelope:**
```tsx
<div className={cn(
  'bg-[var(--sl-s1)] border rounded-[14px] px-5 py-4 transition-all cursor-default relative overflow-hidden',
  pct >= 100 ? 'border-l-[3px] border-l-[#f43f5e] border-[var(--sl-border)]'
             : pct >= 75 ? 'border-l-[3px] border-l-[#f59e0b] border-[var(--sl-border)]'
             : 'border-[var(--sl-border)]',
  'hover:border-[var(--sl-border-h)] hover:shadow-[0_2px_12px_rgba(0,0,0,.12)]'
)}>
  {/* Linha principal */}
  <div className="flex items-center gap-3 mb-2.5">
    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
      style={{ background: `${getEnvColor(pct)}20` }}>
      {cat.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">{envelope.name}</span>
        {/* Badge de status */}
        {pct >= 100 && <span className="badge-over">Estourado</span>}
        {pct >= budget.alert_threshold && pct < 100 && <span className="badge-alert">Atenção</span>}
        {pct < 60 && pct > 0 && <span className="badge-ok">OK</span>}
      </div>
      <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t3)]">
        <span className="text-[var(--sl-t1)] text-[13px] font-medium">R$ {fmtR$(gasto)}</span>
        {' '}/ R$ {fmtR$(envelope.amount)}
      </p>
    </div>
    <div className="flex items-center gap-3.5 shrink-0">
      <span className="font-[DM_Mono] text-[14px] font-bold min-w-[36px] text-right"
        style={{ color: getEnvColor(pct) }}>
        {pct}%
      </span>
      <div className="flex gap-1">
        <button onClick={() => onEdit(envelope)} className="env-action-btn">Editar</button>
        <button onClick={() => onCopy(envelope)} className="env-action-btn">Copiar</button>
        <button onClick={() => onDelete(envelope)} className="env-action-btn text-[#f43f5e]">Excluir</button>
      </div>
    </div>
  </div>
  {/* Barra de progresso */}
  <div className="mb-2">
    <div className="h-[6px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ width: `${Math.min(pct, 100)}%`, background: getEnvColor(pct) }} />
    </div>
  </div>
  {/* Linha de detalhe */}
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-[var(--sl-t2)]">
      Restam <strong className="text-[var(--sl-t1)]">R$ {fmtR$(Math.max(0, envelope.amount - gasto))}</strong>
    </span>
    <span className="text-[11px] text-[var(--sl-t3)]">
      {daysRemaining} dias restantes
    </span>
  </div>
</div>
```

### Envelopes Inativos

Exibidos abaixo dos ativos, com `opacity-45`. Sem barra de alert (pois pct = 0).

```tsx
{inactiveEnvelopes.length > 0 && (
  <div className="mt-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t2)] uppercase tracking-[.06em]">
        Envelopes Inativos
      </h2>
      <span className="text-[11px] text-[var(--sl-t3)] text-italic">Sem gastos neste mês</span>
    </div>
    <div className="flex flex-col gap-2.5 opacity-45">
      {inactiveEnvelopes.map(e => <EnvelopeCard key={e.id} envelope={e} gasto={0} pct={0} />)}
    </div>
  </div>
)}
```

---

## 4. Componentes

### EnvelopeCard

```typescript
interface EnvelopeCardProps {
  envelope: Budget
  gasto: number         // soma das transações da categoria no mês
  pct: number           // (gasto / envelope.amount) * 100, arredondado para inteiro
  daysRemaining: number // dias restantes no mês
  onEdit: (envelope: Budget) => void
  onCopy: (envelope: Budget) => void
  onDelete: (id: string) => void
}
```

### EnvelopeModal (Criação e Edição)

```typescript
interface EnvelopeModalProps {
  open: boolean
  mode: 'create' | 'edit'
  envelope?: Budget
  categories: Category[]
  monthlyIncome: number    // para exibir sugestão 50-30-20
  month: number
  year: number
  onClose: () => void
  onSave: (data: EnvelopeFormData) => Promise<void>
}

interface EnvelopeFormData {
  category_id: string
  amount: number
  month: number
  year: number
  alert_threshold: number   // padrão: 80
  rollover: boolean         // padrão: false
  notes?: string
}
```

**Estrutura interna do modal:**

```
max-w-[480px]
├── Título: "Novo Envelope" / "Editar Envelope"
├── Seletor de Ícone (grid de emojis de categoria)
├── Campo Nome/Categoria (select de categorias)
├── Campo Limite (R$ + input DM Mono)
├── [Condicional: se monthly_income > 0] Sugestão baseada em renda:
│   "Sugestão 50-30-20: para Moradia, R$ X (50% de Y)"
├── Slider/Input Alert Threshold (padrão 80%)
│   "Alertar quando atingir: 80%"
├── Toggle Rollover: "Carregar saldo não gasto para o próximo mês"
├── Campo Notas (textarea opcional)
└── Footer: Cancelar | Criar / Salvar
```

**Sugestão automática 50-30-20 no modal:**

```typescript
// Categorias mapeadas para grupos
const CATEGORY_GROUPS: Record<string, '50' | '30' | '20'> = {
  'moradia':      '50',  // Necessidades
  'alimentacao':  '50',
  'transporte':   '50',
  'saude':        '50',
  'lazer':        '30',  // Desejos
  'roupas':       '30',
  'restaurantes': '30',
  'poupanca':     '20',  // Poupança
  'investimentos':'20',
}

function getSuggestedAmount(categoryKey: string, monthlyIncome: number): number | null {
  const group = CATEGORY_GROUPS[categoryKey]
  if (!group || !monthlyIncome) return null
  const pct = group === '50' ? 0.5 : group === '30' ? 0.3 : 0.2
  // Distribuir igualmente entre categorias do mesmo grupo
  return monthlyIncome * pct / CATEGORIES_IN_GROUP[group].length
}
```

### CopiarEnvelopesModal

```typescript
interface CopiarEnvelopesModalProps {
  open: boolean
  envelopes: Budget[]     // envelopes do mês anterior
  currentMonth: number
  currentYear: number
  onClose: () => void
  onConfirm: (selectedIds: string[]) => Promise<void>
}
```

Modal que aparece quando o usuário clica "Copiar do mês anterior" — lista os envelopes do mês anterior com checkboxes e botão "Copiar selecionados".

---

## 5. Hooks

### useBudgets

```typescript
interface UseBudgetsOptions {
  month: number
  year: number
}

interface BudgetWithSpend extends Budget {
  gasto: number       // calculado no hook
  pct: number         // (gasto / amount) * 100 arredondado para int
  isActive: boolean   // gasto > 0
}

interface UseBudgetsReturn {
  budgets: BudgetWithSpend[]
  activeBudgets: BudgetWithSpend[]
  inactiveBudgets: BudgetWithSpend[]
  totalOrcado: number
  totalGasto: number
  naoAlocado: number              // receitasMes - totalOrcado
  receitasMes: number
  qtdOk: number                   // pct < 60
  qtdAlert: number                // 60 <= pct < 100
  qtdOver: number                 // pct >= 100
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: EnvelopeFormData) => Promise<Budget>
  update: (id: string, data: Partial<EnvelopeFormData>) => Promise<Budget>
  remove: (id: string) => Promise<void>
  copyFromPreviousMonth: (ids: string[]) => Promise<void>
}

function useBudgets(opts: UseBudgetsOptions): UseBudgetsReturn
```

**Cálculo de `gasto` por envelope:**
```typescript
// Para cada budget, buscar SUM das transações da categoria no mês
// usando uma única query com GROUP BY para eficiência
```

---

## 6. Queries Supabase

### Buscar envelopes com gastos calculados

```sql
-- Buscar orçamentos do mês
SELECT
  b.id,
  b.category_id,
  b.amount,
  b.month,
  b.year,
  b.alert_threshold,
  b.rollover,
  b.notes,
  b.is_active,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  COALESCE(spend.total, 0) AS gasto
FROM budgets b
LEFT JOIN categories c ON c.id = b.category_id
LEFT JOIN (
  SELECT
    category_id,
    SUM(amount) AS total
  FROM transactions
  WHERE user_id = auth.uid()
    AND type = 'expense'
    AND EXTRACT(MONTH FROM date) = :month
    AND EXTRACT(YEAR FROM date) = :year
    AND is_future = false
  GROUP BY category_id
) spend ON spend.category_id = b.category_id
WHERE b.user_id = auth.uid()
  AND b.month = :month
  AND b.year = :year
ORDER BY
  CASE WHEN COALESCE(spend.total, 0) = 0 THEN 1 ELSE 0 END,  -- inativos por último
  (COALESCE(spend.total, 0) / b.amount) DESC;                  -- maior % primeiro
```

**Código TypeScript (via Supabase client):**

```typescript
// Buscar budgets
const { data: budgets } = await supabase
  .from('budgets')
  .select('*, categories(id, name, icon, color)')
  .eq('user_id', userId)
  .eq('month', month)
  .eq('year', year)

// Buscar gastos por categoria no período
const { data: spends } = await supabase
  .from('transactions')
  .select('category_id, amount')
  .eq('user_id', userId)
  .eq('type', 'expense')
  .eq('is_future', false)
  .gte('date', `${year}-${String(month).padStart(2,'0')}-01`)
  .lte('date', `${year}-${String(month).padStart(2,'0')}-31`)

// Calcular gastos por categoria no cliente
const spendMap = new Map<string, number>()
for (const s of spends ?? []) {
  spendMap.set(s.category_id, (spendMap.get(s.category_id) ?? 0) + s.amount)
}

// Buscar receitas do mês (para calcular Não Alocado)
const { data: receitas } = await supabase
  .from('transactions')
  .select('amount')
  .eq('user_id', userId)
  .eq('type', 'income')
  .eq('is_future', false)
  .gte('date', `${year}-${String(month).padStart(2,'0')}-01`)
  .lte('date', `${year}-${String(month).padStart(2,'0')}-31`)

const receitasMes = receitas?.reduce((s, r) => s + r.amount, 0) ?? 0
```

### Criar envelope

```typescript
const { data, error } = await supabase
  .from('budgets')
  .insert({
    user_id: userId,
    category_id: formData.category_id,
    amount: formData.amount,
    month: formData.month,
    year: formData.year,
    alert_threshold: formData.alert_threshold ?? 80,
    rollover: formData.rollover ?? false,
    notes: formData.notes ?? null,
    is_active: true,
  })
  .select()
  .single()
```

### Atualizar envelope

```typescript
const { data, error } = await supabase
  .from('budgets')
  .update({
    category_id: formData.category_id,
    amount: formData.amount,
    alert_threshold: formData.alert_threshold,
    rollover: formData.rollover,
    notes: formData.notes ?? null,
  })
  .eq('id', id)
  .eq('user_id', userId)
  .select()
  .single()
```

### Excluir envelope

```typescript
const { error } = await supabase
  .from('budgets')
  .delete()
  .eq('id', id)
  .eq('user_id', userId)
```

### Copiar envelopes do mês anterior

```typescript
async function copyFromPreviousMonth(
  selectedBudgetIds: string[],
  targetMonth: number,
  targetYear: number,
  userId: string
) {
  // Buscar envelopes selecionados
  const { data: source } = await supabase
    .from('budgets')
    .select('*')
    .in('id', selectedBudgetIds)
    .eq('user_id', userId)

  if (!source?.length) return

  // Verificar se já existem envelopes no mês alvo para as mesmas categorias
  const { data: existing } = await supabase
    .from('budgets')
    .select('category_id')
    .eq('user_id', userId)
    .eq('month', targetMonth)
    .eq('year', targetYear)
    .in('category_id', source.map(b => b.category_id))

  const existingCategoryIds = new Set(existing?.map(e => e.category_id) ?? [])

  // Inserir apenas os que não existem ainda
  const toInsert = source
    .filter(b => !existingCategoryIds.has(b.category_id))
    .map(b => ({
      user_id: userId,
      category_id: b.category_id,
      amount: b.amount,
      month: targetMonth,
      year: targetYear,
      alert_threshold: b.alert_threshold,
      rollover: b.rollover,
      notes: b.notes,
      is_active: true,
    }))

  if (toInsert.length > 0) {
    await supabase.from('budgets').insert(toInsert)
  }
}
```

---

## 7. Regras de Negócio

### 7.1 Cor das barras de orçamento

```typescript
function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'   // vermelho — estourado
  if (pct >= 80)  return '#f97316'   // laranja — próximo do limite
  if (pct >= 61)  return '#f59e0b'   // amarelo — atenção
  return '#10b981'                    // verde — dentro do limite (≤ 60%)
}
```

**IMPORTANTE:** Esta regra é específica da tela de Orçamentos e DIFERE da regra global do CLAUDE.md (`>85% vermelho, >70% amarelo`). A regra correta para orçamentos é: `≤60% verde, 61-79% amarelo, 80-99% laranja, ≥100% vermelho`.

### 7.2 Cálculo de "Não Alocado"

```typescript
// Não Alocado = Receitas do mês - SUM de todos os limites (amount) dos envelopes ativos do mês
const naoAlocado = receitasMes - budgets.reduce((sum, b) => sum + b.amount, 0)

// Se negativo: o usuário orçou mais do que recebe
// Exibir com cor vermelha e aviso "⚠ Orçamento maior que a renda"
```

### 7.3 Banner 50-30-20

**Condição de exibição:**
1. `profiles.monthly_income > 0` (renda cadastrada no onboarding)
2. O banner não foi dispensado pelo usuário (verificar `localStorage.getItem('orcamentos_50_30_20_dismissed')`)

**Dispensar o banner:** salvar `localStorage.setItem('orcamentos_50_30_20_dismissed', '1')`

**Quando "Aplicar sugestão" é clicado:**
```typescript
async function handleApply5030_20(monthlyIncome: number, month: number, year: number) {
  // Criar envelopes sugeridos (apenas os que não existem ainda no mês)
  const SUGERIDOS = [
    { category_key: 'moradia',      amount: monthlyIncome * 0.35, icon: '🏠' },
    { category_key: 'alimentacao',  amount: monthlyIncome * 0.15, icon: '🍔' },
    { category_key: 'transporte',   amount: monthlyIncome * 0.10, icon: '🚗' },
    { category_key: 'lazer',        amount: monthlyIncome * 0.10, icon: '🎮' },
    { category_key: 'saude',        amount: monthlyIncome * 0.10, icon: '💊' },
    { category_key: 'poupanca',     amount: monthlyIncome * 0.20, icon: '🛡️' },
  ]
  // Inserir cada um com a categoria correspondente
  // Salvar localStorage.setItem('orcamentos_50_30_20_dismissed', '1')
}
```

### 7.4 Copiar envelopes do mês anterior

- Botão "Copiar do mês anterior" aparece no header quando não há envelopes no mês atual E há envelopes no mês anterior
- Abre modal com lista dos envelopes do mês anterior + checkboxes (todos selecionados por padrão)
- Botão "Copiar selecionados" cria os envelopes no mês atual (sem os já existentes)

### 7.5 Envelopes inativos

- **Definição:** envelope com `gasto === 0` no mês corrente
- Aparecem ao final da lista, após todos os ativos
- Exibidos com `opacity: 0.45`
- O cabeçalho da seção inativa diz "Sem gastos neste mês" em itálico

### 7.6 Alert threshold e badge "Atenção"

- O campo `alert_threshold` (padrão 80%) define quando o badge "Atenção" aparece
- Badge "Atenção": exibido quando `pct >= alert_threshold AND pct < 100`
- Badge "Estourado": exibido quando `pct >= 100`
- Badge "OK": exibido quando `pct < 60 AND pct > 0`

```typescript
function getEnvelopeBadge(pct: number, alertThreshold: number): 'ok' | 'alert' | 'over' | null {
  if (pct >= 100) return 'over'
  if (pct >= alertThreshold) return 'alert'
  if (pct > 0 && pct < 60) return 'ok'
  return null
}
```

### 7.7 Sugestão automática ao criar primeiro envelope

Quando o usuário cria o **primeiro** envelope (total de envelopes no mês === 0 antes da criação) E tem renda cadastrada, exibir no modal de criação a sugestão de valor baseada na regra 50-30-20 para a categoria selecionada.

### 7.8 Rollover

- `rollover: true` significa que o saldo não gasto do mês anterior é somado ao limite do mês atual
- **Exemplo:** envelope Alimentação com limite R$ 900, gastou R$ 700 em janeiro → em fevereiro, limite fica R$ 900 + R$ 200 = R$ 1.100
- Cálculo no hook: ao carregar envelopes do mês atual, verificar se `rollover = true` e se há envelope do mês anterior com o mesmo `category_id`; somar a diferença `(amount - gasto_mes_anterior)` ao amount atual

```typescript
function calculateAmountWithRollover(
  envelope: Budget,
  previousMonthSpend: number,
  previousMonthAmount: number
): number {
  if (!envelope.rollover) return envelope.amount
  const leftover = Math.max(0, previousMonthAmount - previousMonthSpend)
  return envelope.amount + leftover
}
```

---

## 8. Estados

### Loading State

```tsx
// Skeleton de 5 cards de envelope
{Array.from({ length: 5 }).map((_, i) => (
  <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-5 py-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)]" />
      <div className="flex-1">
        <div className="h-3.5 w-32 bg-[var(--sl-s3)] rounded mb-1.5" />
        <div className="h-3 w-24 bg-[var(--sl-s3)] rounded" />
      </div>
      <div className="h-5 w-12 bg-[var(--sl-s3)] rounded" />
    </div>
    <div className="h-1.5 bg-[var(--sl-s3)] rounded-full" />
  </div>
))}
```

### Empty State (sem envelopes no mês)

```tsx
<div className="text-center py-12 bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-[14px]">
  <span className="text-[40px] block mb-3 opacity-70">💼</span>
  <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1.5">
    Nenhum orçamento definido
  </h3>
  <p className="text-[13px] text-[var(--sl-t2)] mb-4">
    Crie envelopes de gastos para controlar seu orçamento mensal.
  </p>
  <button onClick={openNewEnvelopeModal}
    className="inline-flex items-center gap-1.5 bg-[#10b981] text-[#03071a] font-bold text-[13px] px-4 py-2 rounded-full">
    <Plus size={14} />
    Criar primeiro envelope
  </button>
</div>
```

### Error State

```tsx
<div className="py-10 text-center">
  <AlertTriangle size={28} className="text-[#f43f5e] mx-auto mb-2.5" />
  <p className="text-[13px] text-[var(--sl-t2)]">
    Erro ao carregar orçamentos.{' '}
    <button onClick={refresh} className="text-[#10b981] hover:underline">Tentar novamente</button>
  </p>
</div>
```

---

## 9. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` simples | `text-sl-grad` |
| Insight | Oculto | Parágrafo narrativo sobre os orçamentos |
| Score de Saúde | Ausente | Budget Health Score numérico no KPI |

**Insight Jornada — templates:**

```typescript
function buildOrcamentosInsight(data: {
  pctGeral: number
  qtdEstourados: number
  maiorCategoria: string
  economiaVsUltimoMes: number
}): React.ReactNode {
  if (data.qtdEstourados > 0) {
    return (
      <>
        <strong className="text-[#f43f5e]">{data.qtdEstourados} envelope{data.qtdEstourados > 1 ? 's' : ''} estourado{data.qtdEstourados > 1 ? 's' : ''}</strong>!
        Revise seus gastos em <strong>{data.maiorCategoria}</strong> — está acima do limite este mês.
      </>
    )
  }
  if (data.pctGeral < 60) {
    return (
      <>
        Seus gastos estão em <span className="text-[#10b981]">{data.pctGeral}%</span> do orçamento total.
        {data.economiaVsUltimoMes > 0 && (
          <> Você economizou <strong className="text-[#10b981]">R$ {fmtR$(data.economiaVsUltimoMes)}</strong> a mais que no mês anterior.</>
        )}
      </>
    )
  }
  return (
    <>
      Orçamento em <span className="text-[#f59e0b]">{data.pctGeral}%</span> utilizado.
      Atenção em <strong>{data.maiorCategoria}</strong> — categoria com maior % de uso.
    </>
  )
}
```

---

## 10. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `>1024px` | Layout completo com ações inline nos cards |
| `max-lg` | Botões de ação nos cards recolhidos em menu dropdown |
| `max-sm` | Summary Strip 2 colunas; cards em full width; banner 50-30-20 sem botões side-by-side |

```tsx
// Summary strip responsivo
<div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
```

---

## 11. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Cor das barras: `≤60% verde, 61-79% amarelo, 80-99% laranja, ≥100% vermelho` (DIFERENTE da regra global)
- [ ] Cálculo de "Não Alocado" = receitas do mês - SUM(limites dos envelopes)
- [ ] Não Alocado negativo exibido em vermelho com aviso
- [ ] Banner 50-30-20 exibido apenas quando `monthly_income > 0`
- [ ] Banner pode ser dispensado (persistido em localStorage)
- [ ] "Aplicar sugestão" cria envelopes pré-configurados com base na renda
- [ ] Envelopes inativos (gasto = 0) ao final da lista com `opacity-45`
- [ ] Badge "Atenção" quando `pct >= alert_threshold AND pct < 100`
- [ ] Badge "Estourado" quando `pct >= 100`
- [ ] Sugestão automática 50-30-20 ao criar primeiro envelope (com renda cadastrada)
- [ ] Copiar envelopes do mês anterior funciona corretamente
- [ ] Rollover calculado corretamente ao carregar envelopes
- [ ] Valores monetários em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] `JornadaInsight` presente e oculto no Foco
- [ ] Summary Strip 4 KPIs com breakpoint `max-sm:grid-cols-2`
- [ ] Skeleton loading, empty state e error state implementados
- [ ] Nenhum `console.log` ou `any` em produção
