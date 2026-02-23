# SyncLife — Spec de Tela: Transações
**Versão:** 1.0 · 23/02/2026
**Path:** `/financas/transacoes`
**Protótipo de referência:** `proto-transacoes_6.html`

---

## 1. Visão Geral

A tela de Transações é o histórico completo de movimentações financeiras do usuário. Permite consultar, filtrar, criar, editar e excluir transações. É acessada pela sidebar do módulo Finanças e pelo botão "Ver todas" do widget de últimas transações no Dashboard.

**Quem usa:** todos os usuários do módulo Finanças (Free e PRO).
**Escopo padrão:** mês atual, alterável pelo seletor de mês.

---

## 2. Referência Visual

Arquivo: `C:/Projetos/sync_life/prototipos/proto-transacoes_6.html`

Layout identificado no protótipo:
- Topbar com título + contador de itens + botão "Nova Transação"
- Bloco de insight (visível no Jornada) abaixo da topbar
- Barra de filtros em card branco: busca + seletor de mês + chips de tipo + select de categoria + select de ordenação
- Tabela com colunas: Descrição | Data | Categoria | Método | Valor | Ações
- Rodapé de tabela com info de paginação + botões de página
- Modal de criação/edição com toggle Despesa/Receita, categoria grid, valor com prefixo, data, método, notas, toggle "Recorrente"
- Modal de confirmação de exclusão com resumo da transação
- Grid de categorias (4 colunas, ícone + nome)
- Badge roxo "🔄" para transações vinculadas a recorrentes

---

## 3. Layout Completo

### Estrutura da página

```
max-w-[1100px] mx-auto px-8 py-7 pb-16
```

**Ordem dos blocos (de cima para baixo):**

1. **Topbar** — título + contador + botão Nova Transação
2. **Insight Jornada** — oculto no Foco
3. **Barra de Filtros** — card branco com 2 linhas internas
4. **Tabela de Transações** — card com cabeçalho + linhas + rodapé paginado
5. **Modal de Criação/Edição** (overlay)
6. **Modal de Confirmação de Exclusão** (overlay)

### Topbar

```tsx
<div className="flex items-center gap-2.5 mb-5 flex-wrap">
  {/* Título + contador */}
  <div className="flex items-center gap-2.5">
    <h1 className={cn(
      'font-[Syne] font-extrabold text-[22px] tracking-tight',
      isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
    )}>
      Transações
    </h1>
    <span className="text-[11px] font-semibold text-[var(--sl-t2)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2.5 py-0.5">
      {total} itens
    </span>
  </div>
  <div className="flex-1" />
  {/* Botão nova */}
  <button className="flex items-center gap-1.5 bg-[#10b981] text-[#03071a] font-bold text-[13px] px-5 py-2.5 rounded-full border-none shadow-[0_4px_16px_rgba(16,185,129,.25)] hover:-translate-y-px hover:brightness-105 transition-all">
    <Plus size={14} />
    Nova Transação
  </button>
</div>
```

### Insight Jornada

```tsx
<JornadaInsight text={
  <>Você registrou <strong>R$ {fmtR$(totalMes)}</strong> em transações este mês.
  Ritmo de poupança: <span className="text-[#10b981]">{poupancaPct}%</span>.</>
} />
```

### Barra de Filtros

Card `bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-4`:

**Linha 1:**
- Campo de busca (flex-1, min-width 160px): ícone de lupa + input "Buscar transações..."
- Seletor de mês: chevron esquerda | mês/ano em DM Mono | chevron direita | separador | botão "Hoje"
- Dropdown picker de mês: grid 4×3 de meses, navegação de ano, células com estados: normal / selecionado (verde) / em range / today / future (disabled)

**Linha 2 (chips de tipo + filtros adicionais):**
- Chips: Todos (verde ativo) | Receitas (verde outline) | Despesas (vermelho outline) | Recorrentes (roxo outline)
- Separador vertical 1px
- Select de categoria: `<select>` estilizado com border-radius 100px
- Select de ordenação: Mais recente | Mais antigo | Maior valor | Menor valor

```tsx
// Tipos de chip e seus estilos ativos
const CHIP_STYLES = {
  all:      'bg-[#10b981] text-[#03071a] border-transparent font-bold',
  income:   'bg-[rgba(16,185,129,.10)] text-[#10b981] border-[rgba(16,185,129,.30)] font-semibold',
  expense:  'bg-[rgba(244,63,94,.08)] text-[#f43f5e] border-[rgba(244,63,94,.25)] font-semibold',
  recurring:'bg-[rgba(139,92,246,.12)] text-[#a78bfa] border-[rgba(139,92,246,.30)] font-semibold',
}
```

### Tabela de Transações

**Card:** `bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden`

**Cabeçalho da tabela** (`bg-[var(--sl-s2)] border-b border-[var(--sl-border)]`):

```
grid-template-columns: 1fr 160px 110px 140px 90px
Colunas: Descrição | Data | Categoria | Método | Valor | (Ações sem header)
```

**Linha de transação** (`grid-template-columns: 1fr 160px 110px 140px 90px`):

- **Coluna Descrição:** ícone 36×36 (border-radius 10px, bg `--sl-s3`) + nome + observações
  - Badge roxo `🔄 Recorrente` se `recurring_transaction_id != null`
  - Badge cinza `Previsto` se `is_future = true`
- **Coluna Data:** font DM Mono, 11px, cor `--sl-t3`
- **Coluna Categoria:** chip com ponto colorido + nome da categoria
- **Coluna Método:** pill/chip simples
- **Coluna Valor:** DM Mono, 14px, verde para receita / vermelho para despesa, `text-right`
- **Coluna Ações:** botões Editar (hover: verde) + Excluir (hover: vermelho), 30×30px

**Hover da linha:** `hover:bg-[rgba(255,255,255,.02)]` (dark) / `hover:bg-[var(--sl-s2)]` (light)

**Linha futura:** `opacity-55`

**Rodapé da tabela:**

```tsx
<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--sl-border)]">
  <span className="text-[12px] text-[var(--sl-t3)]">
    Exibindo <strong className="text-[var(--sl-t1)]">{start}–{end}</strong> de{' '}
    <strong className="text-[var(--sl-t1)]">{total}</strong> transações
  </span>
  <div className="flex items-center gap-1">
    {/* Botão anterior */}
    <button disabled={page === 1} className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] font-[DM_Mono] text-[12px] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] disabled:opacity-30" />
    {/* Páginas numeradas */}
    {pages.map(p => (
      <button key={p}
        className={cn('w-7 h-7 rounded-[8px] border font-[DM_Mono] text-[12px]',
          p === page
            ? 'bg-[#10b981] text-[#03071a] border-transparent font-bold'
            : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
        )}
      >{p}</button>
    ))}
    {/* Botão próximo */}
    <button disabled={page === totalPages} className="..." />
  </div>
</div>
```

---

## 4. Componentes

### TransacaoRow

```typescript
interface TransacaoRowProps {
  transaction: Transaction
  categories: Category[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}
```

### TransacaoModal (Criação e Edição)

```typescript
interface TransacaoModalProps {
  open: boolean
  mode: 'create' | 'edit'
  transaction?: Transaction  // para edição
  categories: Category[]
  defaultDate?: string       // para pré-preencher data (ex: vindo do Calendário)
  onClose: () => void
  onSave: (data: TransacaoFormData) => Promise<void>
}

interface TransacaoFormData {
  type: 'income' | 'expense'
  description: string
  amount: number
  category_id: string
  date: string              // YYYY-MM-DD
  payment_method: 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto'
  notes?: string
  is_recurring_link?: boolean  // toggle para vincular/criar recorrente
}
```

**Estrutura interna do modal:**

```
max-w-[520px] max-h-[90vh] flex flex-col
├── Header: título + botão fechar
├── Body (overflow-y: auto, flex: 1):
│   ├── Toggle Tipo (grid 2 colunas): Despesa 📤 | Receita 💰
│   ├── Campo Descrição (input text, required)
│   ├── Campo Valor (prefixo "R$" + input DM Mono)
│   ├── Grid de Categorias (4 colunas, ícone + nome, estado sel)
│   ├── Row (2 colunas): Data | Método de Pagamento
│   ├── Campo Notas (textarea, opcional)
│   └── Row toggle Recorrente (aparece se mode === 'create'):
│       card com switch toggle + label "Criar como recorrente"
│       → abre inline detalhes de frequência ao ativar
└── Footer: Cancelar | Salvar
```

**Toggle de tipo:**
```tsx
<div className="grid grid-cols-2 gap-2 mb-5">
  {(['expense', 'income'] as const).map(t => (
    <button
      key={t}
      onClick={() => setType(t)}
      className={cn(
        'py-3 rounded-[12px] border-[1.5px] bg-[var(--sl-s2)] cursor-pointer flex items-center justify-center gap-2 transition-all',
        type === 'expense' && t === 'expense'
          ? 'border-[#f43f5e] bg-[rgba(244,63,94,.07)]'
          : type === 'income' && t === 'income'
            ? 'border-[#10b981] bg-[rgba(16,185,129,.07)]'
            : 'border-[var(--sl-border)]'
      )}
    >
      <span className="text-xl">{t === 'expense' ? '📤' : '💰'}</span>
      <span className={cn('text-[14px] font-semibold',
        type === t
          ? t === 'expense' ? 'text-[#f43f5e]' : 'text-[#10b981]'
          : 'text-[var(--sl-t2)]'
      )}>
        {t === 'expense' ? 'Despesa' : 'Receita'}
      </span>
    </button>
  ))}
</div>
```

**Grid de categorias:**
```tsx
<div className="grid grid-cols-4 gap-2 mb-1">
  {categories.filter(c => c.type === type).map(cat => (
    <button
      key={cat.id}
      onClick={() => setCategoryId(cat.id)}
      className={cn(
        'py-2.5 px-1.5 rounded-[11px] border-[1.5px] bg-[var(--sl-s2)] cursor-pointer text-center transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-px',
        categoryId === cat.id
          ? 'border-[#10b981] bg-[rgba(16,185,129,.08)]'
          : 'border-[var(--sl-border)]'
      )}
    >
      <span className="text-[20px] block mb-1">{cat.icon}</span>
      <span className={cn('text-[11px] leading-tight',
        categoryId === cat.id ? 'text-[#10b981] font-semibold' : 'text-[var(--sl-t2)]'
      )}>
        {cat.name}
      </span>
    </button>
  ))}
</div>
```

### DeleteConfirmModal

```typescript
interface DeleteConfirmModalProps {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onConfirm: () => Promise<void>
}
```

Exibe resumo da transação (descrição, valor, data) em card `bg-[var(--sl-s2)]` antes de confirmar.

---

## 5. Hooks

### useTransactions

```typescript
interface UseTransactionsOptions {
  month: number       // 1–12
  year: number
  type?: 'all' | 'income' | 'expense' | 'recurring'
  search?: string     // debounced 300ms
  categoryId?: string
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest'
  page?: number
  pageSize?: number   // padrão: 30
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  total: number
  totalPages: number
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: TransacaoFormData) => Promise<Transaction>
  update: (id: string, data: Partial<TransacaoFormData>) => Promise<Transaction>
  remove: (id: string) => Promise<void>
}

function useTransactions(options: UseTransactionsOptions): UseTransactionsReturn
```

**Implementação do debounce na busca:**
```typescript
// Dentro do hook
const [debouncedSearch, setDebouncedSearch] = useState(options.search ?? '')
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(options.search ?? ''), 300)
  return () => clearTimeout(timer)
}, [options.search])
// Usar debouncedSearch na query, não options.search diretamente
```

### useCategories

```typescript
interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: Error | null
}

function useCategories(): UseCategoriesReturn
// Busca categorias do usuário + categorias padrão (is_default = true)
// Cache: mantém em memória durante a sessão
```

---

## 6. Queries Supabase

### Listar transações com paginação e filtros

```sql
-- Utilizado pelo useTransactions
SELECT
  t.id,
  t.amount,
  t.type,
  t.description,
  t.date,
  t.payment_method,
  t.notes,
  t.is_future,
  t.recurring_transaction_id,
  t.created_at,
  c.id   AS category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.user_id = auth.uid()
  AND EXTRACT(MONTH FROM t.date) = :month
  AND EXTRACT(YEAR FROM t.date) = :year
  -- Filtro de tipo (condicional):
  -- AND t.type = :type                    (se type IN ('income','expense'))
  -- AND t.recurring_transaction_id IS NOT NULL  (se type = 'recurring')
  -- Filtro de busca (condicional):
  -- AND (t.description ILIKE '%' || :search || '%'
  --      OR c.name ILIKE '%' || :search || '%')
  -- Filtro de categoria (condicional):
  -- AND t.category_id = :category_id
ORDER BY
  -- newest: t.date DESC, t.created_at DESC
  -- oldest: t.date ASC, t.created_at ASC
  -- highest: t.amount DESC
  -- lowest: t.amount ASC
  t.date DESC, t.created_at DESC
LIMIT :page_size OFFSET (:page - 1) * :page_size;

-- Query de contagem total (mesmos filtros, sem LIMIT/OFFSET):
SELECT COUNT(*) FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.user_id = auth.uid()
  AND EXTRACT(MONTH FROM t.date) = :month
  AND EXTRACT(YEAR FROM t.date) = :year
  -- mesmos filtros condicionais acima
```

**Código TypeScript:**

```typescript
const supabase = createClient()

async function fetchTransactions(opts: UseTransactionsOptions) {
  let query = supabase
    .from('transactions')
    .select(`
      id, amount, type, description, date,
      payment_method, notes, is_future, recurring_transaction_id, created_at,
      categories(id, name, icon, color)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .gte('date', `${opts.year}-${String(opts.month).padStart(2,'0')}-01`)
    .lte('date', `${opts.year}-${String(opts.month).padStart(2,'0')}-31`)

  if (opts.type === 'income')  query = query.eq('type', 'income')
  if (opts.type === 'expense') query = query.eq('type', 'expense')
  if (opts.type === 'recurring') query = query.not('recurring_transaction_id', 'is', null)
  if (opts.search) query = query.ilike('description', `%${opts.search}%`)
  if (opts.categoryId) query = query.eq('category_id', opts.categoryId)

  const orderCol = opts.sort === 'highest' || opts.sort === 'lowest' ? 'amount' : 'date'
  const ascending = opts.sort === 'oldest' || opts.sort === 'lowest'
  query = query.order(orderCol, { ascending })
    .range((opts.page! - 1) * opts.pageSize!, opts.page! * opts.pageSize! - 1)

  return query
}
```

### Criar transação

```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    user_id: userId,
    category_id: formData.category_id,
    amount: formData.amount,
    type: formData.type,
    description: formData.description,
    date: formData.date,
    payment_method: formData.payment_method,
    notes: formData.notes ?? null,
    is_future: new Date(formData.date) > new Date(),  // automático
    recurring_transaction_id: null,
  })
  .select()
  .single()
```

### Atualizar transação

```typescript
const { data, error } = await supabase
  .from('transactions')
  .update({
    category_id: formData.category_id,
    amount: formData.amount,
    type: formData.type,
    description: formData.description,
    date: formData.date,
    payment_method: formData.payment_method,
    notes: formData.notes ?? null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
  .eq('user_id', userId)  // RLS extra por segurança
  .select()
  .single()
```

### Excluir transação

```typescript
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', id)
  .eq('user_id', userId)
```

### Buscar categorias

```typescript
const { data: categories } = await supabase
  .from('categories')
  .select('id, name, icon, color, type, is_default')
  .or(`user_id.eq.${userId},is_default.eq.true`)
  .order('sort_order', { ascending: true })
```

---

## 7. Regras de Negócio

### 7.1 Agrupamento por data com subtotal do dia

As transações são exibidas em grupos por data. Cada grupo exibe o dia no header + subtotal líquido do dia (receitas - despesas):

```typescript
// Agrupar transações por data
function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = tx.date  // YYYY-MM-DD
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return Array.from(groups.entries()).map(([date, txns]) => ({
    date,
    transactions: txns,
    subtotal: txns.reduce((sum, t) =>
      sum + (t.type === 'income' ? t.amount : -t.amount), 0)
  }))
}

// Render do cabeçalho de grupo:
// "Quarta, 22 de fevereiro · R$ +1.230" (verde) ou "R$ -450" (vermelho)
```

**NOTA:** O agrupamento só é exibido quando o filtro de ordenação é "Mais recente" ou "Mais antigo" (ordenação por data). Quando o usuário ordena por valor, a lista é plana sem agrupamentos.

### 7.2 Paginação

- **Tamanho padrão:** 30 itens por página
- A contagem total vem da query `count: 'exact'` do Supabase
- Número de páginas: `Math.ceil(total / pageSize)`
- Exibir no máximo 7 botões de página; usar `...` para reticências quando total > 7 páginas
- Ao mudar filtros, resetar para página 1

### 7.3 Busca com debounce

- Debounce de **300ms** — nunca disparar query a cada keystroke
- Busca em `transactions.description` (case-insensitive, ILIKE)
- Ao buscar, a contagem total atualiza junto com os resultados
- Limpar busca: botão `×` no campo aparece quando há texto digitado

### 7.4 Edição inline vs modal

- **Edição** é sempre via modal (não inline)
- O botão de edição na tabela abre o `TransacaoModal` com `mode='edit'` e dados pré-preenchidos
- Transações vinculadas a recorrentes (`recurring_transaction_id != null`): exibem badge roxo "🔄 Recorrente"; são editáveis normalmente, mas a edição NÃO afeta a transação recorrente mãe — apenas esta ocorrência específica

### 7.5 Transações de recorrentes

- Transações geradas por recorrentes têm `recurring_transaction_id` preenchido
- Badge especial: `🔄 Recorrente` — cor `rgba(139,92,246,.12)`, texto `#a78bfa`, borda `rgba(139,92,246,.25)`
- Ao editar, exibir aviso no modal: "Esta é uma ocorrência gerada automaticamente. A edição altera apenas este lançamento, não a série."
- **Nunca** permitir editar a transação recorrente mãe a partir desta tela — para isso, usar a tela de Recorrentes

### 7.6 Ordenação padrão

- **Padrão ao carregar:** Mais recente (`date DESC, created_at DESC`)
- Opções disponíveis:
  - Mais recente (padrão)
  - Mais antigo
  - Maior valor
  - Menor valor
- Ao mudar ordenação que não seja por data, desativar agrupamento por data

### 7.7 Método de pagamento — mapeamento visual

```typescript
const PAYMENT_LABELS: Record<string, string> = {
  pix:      'Pix',
  credit:   'Crédito',
  debit:    'Débito',
  cash:     'Dinheiro',
  transfer: 'Transferência',
  boleto:   'Boleto',
}
```

### 7.8 Cálculo de is_future

Ao criar ou importar uma transação, `is_future` é calculado automaticamente:

```typescript
const isDateInFuture = (dateStr: string): boolean => {
  const txDate = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return txDate > today
}
```

Transações futuras aparecem com `opacity-55` na tabela e badge "Previsto".

---

## 8. Estados

### Loading State (skeleton)

```tsx
// Enquanto isLoading === true: exibir skeleton na tabela
// 10 linhas com animação pulse
{Array.from({ length: 10 }).map((_, i) => (
  <div key={i} className="grid grid-cols-[1fr_160px_110px_140px_90px] px-5 py-3 border-b border-[var(--sl-border)]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)] animate-pulse" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-32 bg-[var(--sl-s3)] rounded animate-pulse" />
        <div className="h-2.5 w-20 bg-[var(--sl-s3)] rounded animate-pulse" />
      </div>
    </div>
    <div className="h-3 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-center" />
    <div className="h-5 w-20 bg-[var(--sl-s3)] rounded-full animate-pulse self-center" />
    <div className="h-5 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-center" />
    <div className="h-4 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-end ml-auto" />
  </div>
))}
```

### Empty State

```tsx
// Quando não há transações no período/filtro
<div className="py-16 text-center">
  <span className="text-5xl block mb-3 opacity-60">
    {filterType === 'income' ? '💰' : filterType === 'expense' ? '📤' : '💳'}
  </span>
  <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1.5">
    {search ? 'Nenhum resultado encontrado' : 'Nenhuma transação neste período'}
  </h3>
  <p className="text-[13px] text-[var(--sl-t2)]">
    {search
      ? `Tente buscar por outro termo.`
      : 'Clique em "Nova Transação" para registrar um lançamento.'
    }
  </p>
</div>
```

### Error State

```tsx
// Quando error !== null
<div className="py-12 text-center">
  <AlertTriangle size={32} className="text-[#f43f5e] mx-auto mb-3" />
  <p className="text-[13px] text-[var(--sl-t2)]">
    Erro ao carregar transações. <button onClick={refresh} className="text-[#10b981] hover:underline">Tentar novamente</button>
  </p>
</div>
```

---

## 9. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` simples | `text-sl-grad` (gradiente Esmeralda→Azul) |
| Insight | Oculto | Visível — texto narrativo sobre o mês |
| Contador de itens | Badge neutro | Badge neutro (mesmo) |
| Tom dos textos | Analítico | Igual — dados são os mesmos |

**Implementação do insight Jornada:**
```typescript
// Template do insight — gerado no cliente com dados reais
function buildTransacoesInsight(data: {
  totalMes: number
  totalReceitas: number
  totalDespesas: number
  poupancaPct: number
  maiorCategoria: string
}): React.ReactNode {
  return (
    <>
      Este mês você registrou <strong>R$ {fmtR$(data.totalReceitas)}</strong> em receitas
      e <strong className="text-[#f43f5e]">R$ {fmtR$(data.totalDespesas)}</strong> em despesas.
      {data.poupancaPct > 0 && (
        <> Taxa de poupança: <span className="text-[#10b981]">{data.poupancaPct}%</span>.</>
      )}
      {data.maiorCategoria && (
        <> Maior gasto: <strong>{data.maiorCategoria}</strong>.</>
      )}
    </>
  )
}
```

---

## 10. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `>1024px` (lg) | Layout completo: tabela com 5 colunas + ações |
| `max-lg` (`≤1024px`) | Colunas Método e Data comprimidas |
| `max-md` (`≤768px`) | Cabeçalho da tabela oculto; linha vira card flex-col; valor em destaque; ações abaixo |
| `max-sm` (`≤640px`) | Padding reduzido (px-3); topbar empilha; filtros em coluna; picker de mês centralizado |

**Mobile — linha de transação:**
```tsx
// Em mobile (max-md), cada linha vira:
<div className="flex flex-col px-4 py-3 border-b border-[var(--sl-border)]">
  <div className="flex items-center gap-2.5 mb-1.5">
    <div className="w-8 h-8 rounded-[9px] bg-[var(--sl-s3)] flex items-center justify-center text-sm shrink-0">{cat.icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{tx.description}</p>
      <p className="text-[10px] text-[var(--sl-t3)]">{formatDate(tx.date)} · {PAYMENT_LABELS[tx.payment_method]}</p>
    </div>
    <p className={cn('font-[DM_Mono] text-[15px] font-medium shrink-0',
      tx.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
    )}>
      {tx.type === 'income' ? '+' : '-'}R$ {fmtR$(tx.amount)}
    </p>
  </div>
  {/* categoria em mobile */}
  <div className="flex items-center gap-2 mt-0.5">
    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
    <span className="text-[11px] text-[var(--sl-t3)]">{cat.name}</span>
  </div>
</div>
```

---

## 11. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Debounce de 300ms na busca implementado
- [ ] Paginação de 30 itens por página funcionando
- [ ] Agrupamento por data com subtotal visível
- [ ] Badge roxo em transações de recorrentes
- [ ] Aviso no modal ao editar transação de recorrente
- [ ] `is_future` calculado automaticamente ao criar
- [ ] Transações futuras com opacity-55 na tabela
- [ ] Valores monetários em `font-[DM_Mono]`
- [ ] Título em `font-[Syne] font-extrabold`
- [ ] `JornadaInsight` presente e oculto no Foco
- [ ] Skeleton de loading com 10 linhas
- [ ] Empty state para período sem transações E para busca sem resultados
- [ ] Error state com botão "Tentar novamente"
- [ ] Modal com toggle Despesa/Receita, grid de categorias, validação de campos obrigatórios
- [ ] Modal de confirmação de exclusão com resumo da transação
- [ ] Responsivo: tabela colapsa para card em mobile (`max-md`)
- [ ] Hover nas linhas da tabela
- [ ] Lucide React para ícones UI (lupa, chevron, editar, excluir, fechar)
- [ ] Nenhum `console.log` ou `any` em produção
