# Spec — Tela: Calendário Financeiro (`/financas/calendario`)

> Esta spec é autocontida. Um desenvolvedor pode implementar a tela inteiramente lendo apenas este documento.

---

## 1. Visão Geral

O Calendário Financeiro exibe um calendário mensal com as transações de cada dia representadas por pontos coloridos. O usuário pode navegar entre meses, clicar em qualquer dia para ver um drawer lateral com detalhes das transações daquele dia, e adicionar novas transações diretamente do calendário. A tela também exibe um resumo semanal com 4 KPIs.

**Rota:** `/financas/calendario`
**Arquivo:** `web/src/app/(app)/financas/calendario/page.tsx`
**Componentes:** `'use client'` — estado de mês atual e dia selecionado são client-side.

---

## 2. Referência Visual

Protótipo: `prototipos/proto-calendario-financeiro_1.html`

**Elementos chave do protótipo:**
- Page header com eyebrow, título, btn-nav (prev/next mês), btn "Hoje", btn "+ Adicionar"
- JornadaInsight band: Life Sync Score + texto + tags
- Legend strip: 4 dots (Receita verde, Despesa vermelha, Recorrente azul, Planejado roxo) + dica
- Week summary strip: 4 KPI cards (Receitas, Despesas, Saldo, Pendentes)
- Calendar grid 7×N com:
  - Cabeçalho fixo (Seg–Dom), Dom em vermelho
  - Cada dia: número, balance do dia, 3 dots coloridos max + texto "N trans."
  - Dia hoje: fundo verde claro, número em verde sobre círculo
  - Dia com saldo positivo: fundo levemente verde
  - Dias de outros meses: `opacity: 0.35`
  - Linha de balanço semanal: entre a última linha de cada semana
- Drawer lateral (400px, slide from right):
  - Header: data em Syne, close button
  - Summary (3 mini-cards: Receitas, Despesas, Saldo do dia)
  - Seções separadas: "Transações", "Pendentes", "Futuros"
  - Cada item: ícone + nome + categoria + valor
  - Footer: balance card com gradiente + nota futura
  - Botão "+ Adicionar transação neste dia"
- Jornada Projection Card (oculto no Foco)
- FAB (floating action button) com gradient esmeralda→azul

---

## 3. Layout Completo

### Anatomia da Página

```
┌─────────────────────────────────────────────────────────┐
│  PAGE HEADER: eyebrow | título | spacer | nav | hoje |  │
│               + Adicionar                               │
├─────────────────────────────────────────────────────────┤
│  JORNADA INSIGHT / PROJ CARD (oculto no Foco)           │
├─────────────────────────────────────────────────────────┤
│  LEGEND STRIP (4 dots + dica)                           │
├─────────────────────────────────────────────────────────┤
│  WEEK SUMMARY: 4 KPI cards (Receitas|Despesas|Saldo|    │
│                              Pendentes)                  │
├─────────────────────────────────────────────────────────┤
│  CALENDAR GRID                                          │
│  ┌──┬──┬──┬──┬──┬──┬──┐                                │
│  │Dom│Seg│Ter│Qua│Qui│Sex│Sab│  ← header                │
│  ├──┼──┼──┼──┼──┼──┼──┤                                │
│  │  │  │  │  │  │  │  │  ← semana 1                    │
│  ├────────────── balanço semanal ──────────────┤        │
│  │  ...semanas 2–5...                          │        │
│  └──────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│  DRAWER (slide from right, 400px)                       │
│  [date header] [close]                                  │
│  [3 summary cards]                                      │
│  [txn items list]                                       │
│  [+ Adicionar neste dia]                                │
│  [footer: balance card]                                 │
└─────────────────────────────────────────────────────────┘
│  FAB button (fixed bottom-right)                        │
└─────────────────────────────────────────────────────────┘
```

### Page Header

```tsx
<div className="flex items-start justify-between mb-4 gap-4">
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-0.5">
      <span className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
      Finanças
    </div>
    <h1 className={cn(
      'font-[Syne] font-extrabold text-[22px] tracking-tight',
      isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
    )}>
      Calendário Financeiro
    </h1>
    <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Visualize e planeje suas finanças dia a dia.</p>
  </div>

  <div className="flex items-center gap-2 shrink-0">
    {/* Navegação de mês */}
    <div className="flex border border-[var(--sl-border)] rounded-[9px] overflow-hidden bg-[var(--sl-s1)]">
      <button onClick={prevMonth}
        className="px-2.5 py-1.5 border-none bg-transparent cursor-pointer text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all flex items-center">
        <ChevronLeft size={16} />
      </button>
      <span className="px-3.5 py-1.5 text-[12px] font-semibold text-[var(--sl-t1)] border-x border-[var(--sl-border)] min-w-[110px] text-center">
        {formatMonthYear(currentDate)}
      </span>
      <button onClick={nextMonth}
        className="px-2.5 py-1.5 border-none bg-transparent cursor-pointer text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all flex items-center">
        <ChevronRight size={16} />
      </button>
    </div>
    <button onClick={() => setCurrentDate(new Date())}
      className="px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] text-[12px] cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-all">
      Hoje
    </button>
    <button onClick={() => openAddModal(null)}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border-none bg-[#10b981] text-white text-[12px] font-bold cursor-pointer hover:opacity-85 transition-opacity">
      <Plus size={13} />
      Adicionar
    </button>
  </div>
</div>
```

### Jornada Projection Card

Visível apenas no modo Jornada (`[.jornada_&]:flex`):

```tsx
<div className="hidden [.jornada_&]:flex items-center gap-3 p-[11px] px-[14px] rounded-[11px] border border-[rgba(16,185,129,0.2)] bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] mb-4">
  <span className="text-[22px] shrink-0">📊</span>
  <div className="flex-1 min-w-0">
    <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-0.5">
      Projeção do mês
    </p>
    <p className="font-[DM_Mono] text-[18px] font-medium text-[#10b981] leading-none">
      {fmtR(monthProjectedBalance)}
    </p>
    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">saldo projetado no final do mês</p>
  </div>
  <span className="px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] text-[10px] font-bold text-[#10b981] shrink-0 whitespace-nowrap">
    {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
  </span>
</div>
```

### Legend Strip

```tsx
<div className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] mb-4 flex-wrap">
  {[
    { type: 'income',     label: 'Receita',    color: '#10b981' },
    { type: 'expense',    label: 'Despesa',    color: '#f43f5e' },
    { type: 'recorrente', label: 'Recorrente', color: '#60a5fa' },
    { type: 'planned',    label: 'Planejado',  color: '#a855f7' },
  ].map(l => (
    <span key={l.type} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
      {l.label}
    </span>
  ))}
  <span className="flex-1" />
  <span className="text-[10px] text-[var(--sl-t3)] italic">Clique em um dia para ver detalhes</span>
</div>
```

### Week Summary Strip

4 KPI cards calculados para a semana do dia selecionado (ou semana atual se nenhum selecionado).

```tsx
<div className="grid grid-cols-4 gap-2.5 mb-4 max-sm:grid-cols-2">
  <WsCard label="Receitas"  value={fmtR(weekRecipes)} color="#10b981" accentColor="green" />
  <WsCard label="Despesas"  value={fmtR(weekExpenses)} color="#f43f5e" accentColor="red" />
  <WsCard label="Saldo"     value={fmtR(weekBalance)}  color={weekBalance >= 0 ? '#10b981' : '#f43f5e'} />
  <WsCard label="Pendentes" value={`${weekPending}`}   color="#60a5fa" delta={`${weekPending} recorrentes`} />
</div>
```

`--wc` (week card accent color) é definida inline via `style={{ '--wc': color } as any}`.

---

## 4. Calendário Grid

### Estrutura

```tsx
<SLCard className="p-0 overflow-hidden mb-4">
  {/* Cabeçalho dos dias da semana */}
  <div className="grid grid-cols-7 border-b border-[var(--sl-border)] bg-[var(--sl-s2)]">
    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
      <div key={d} className={cn(
        'py-2 px-1 text-center text-[10px] font-bold uppercase tracking-[0.07em]',
        i === 0 ? 'text-[#f43f5e] opacity-70' : 'text-[var(--sl-t3)]'
      )}>
        {d}
      </div>
    ))}
  </div>

  {/* Grid de dias */}
  <div className="grid grid-cols-7">
    {calendarDays.map((day, index) => (
      <React.Fragment key={day.dateString}>
        <CalendarDay
          day={day}
          isSelected={selectedDay?.dateString === day.dateString}
          onClick={() => day.isCurrentMonth && setSelectedDay(day)}
        />
        {/* Linha de balanço semanal: após cada sábado (index % 7 === 6) */}
        {index % 7 === 6 && index < calendarDays.length - 1 && (
          <div className="col-span-7 flex items-center justify-end px-3 py-0.5 border-b border-[var(--sl-border)] bg-[var(--sl-s2)] gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">
              Semana {Math.floor(index / 7) + 1}
            </span>
            <span className={cn(
              'font-[DM_Mono] text-[10px] font-medium',
              weekBalances[Math.floor(index / 7)] >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
            )}>
              {weekBalances[Math.floor(index / 7)] >= 0 ? '+' : ''}{fmtR(weekBalances[Math.floor(index / 7)])}
            </span>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
</SLCard>
```

### CalendarDay Component

```tsx
interface CalendarDayData {
  date: Date
  dateString: string         // 'YYYY-MM-DD'
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  transactions: CalendarTransaction[]
  balance: number            // soma do dia (receitas - despesas)
  isFuture: boolean          // data futura
}

interface CalendarTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  dotType: 'income' | 'expense' | 'recorrente' | 'planned'  // para a cor do dot
  is_future: boolean
  recurring_transaction_id: string | null
}

function CalendarDay({ day, isSelected, onClick }: {
  day: CalendarDayData
  isSelected: boolean
  onClick: () => void
}) {
  const dotColors = {
    income:     '#10b981',
    expense:    '#f43f5e',
    recorrente: '#60a5fa',
    planned:    '#a855f7',
  }

  const visibleDots = day.transactions.slice(0, 3)
  const overflowCount = day.transactions.length - 3

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-r border-b border-[var(--sl-border)] p-1.5 min-h-[88px] cursor-pointer transition-colors relative flex flex-col gap-0.5',
        'nth-7n:border-r-0',
        !day.isCurrentMonth && 'opacity-35 cursor-default',
        day.isCurrentMonth && 'hover:bg-[var(--sl-s3)]',
        isSelected && 'bg-[var(--sl-s3)] border-[#10b981]! z-[2]',
        day.isToday && 'bg-[rgba(16,185,129,0.05)]',
        !day.isFuture && day.balance > 0 && 'bg-[rgba(16,185,129,0.04)]',
      )}>

      {/* Linha hoje no topo */}
      {day.isToday && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10b981] to-[#0055ff]" />
      )}

      {/* Tag "futuro" */}
      {day.isFuture && day.isCurrentMonth && day.transactions.length > 0 && (
        <span className="absolute top-[5px] right-[5px] text-[8px] font-bold px-1 py-px rounded-[3px] bg-[rgba(96,165,250,0.1)] text-[#60a5fa] whitespace-nowrap">
          futuro
        </span>
      )}

      {/* Top row: número + balanço do dia */}
      <div className="flex items-start justify-between mb-0.5">
        <span className={cn(
          'text-[12px] font-semibold leading-none min-w-[22px]',
          day.isToday
            ? 'text-[#10b981] bg-[rgba(16,185,129,0.15)] rounded-full w-[22px] h-[22px] flex items-center justify-center'
            : 'text-[var(--sl-t2)]'
        )}>
          {day.day}
        </span>
        {day.isCurrentMonth && day.balance !== 0 && (
          <span className={cn(
            'font-[DM_Mono] text-[10px] font-medium leading-none',
            day.balance > 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {day.balance > 0 ? '+' : ''}{fmtRShort(day.balance)}
          </span>
        )}
      </div>

      {/* Dots */}
      {visibleDots.length > 0 && (
        <div className="flex gap-0.5 flex-wrap mt-0.5">
          {visibleDots.map((t, i) => (
            <span key={i} className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{ background: dotColors[t.dotType] }} />
          ))}
          {overflowCount > 0 && (
            <span className="text-[9px] text-[var(--sl-t3)] opacity-70">+{overflowCount}</span>
          )}
        </div>
      )}

      {/* Contagem de transações */}
      {day.isCurrentMonth && day.transactions.length > 0 && (
        <span className="text-[9px] text-[var(--sl-t3)] mt-auto opacity-70">
          {day.transactions.length} trans.
        </span>
      )}
    </div>
  )
}
```

---

## 5. Drawer de Detalhes do Dia

O drawer desliza da direita quando um dia é selecionado. Largura 400px no desktop, 100% width com slide-from-bottom no mobile.

```tsx
<div className={cn(
  'absolute top-0 right-[-420px] w-[400px] h-full bg-[var(--sl-s1)] border-l border-[var(--sl-border)] flex flex-col transition-[right] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 overflow-hidden shadow-[-12px_0_40px_rgba(0,0,0,0.25)]',
  selectedDay && 'right-0',
  // Mobile: slide from bottom
  'max-md:w-full max-md:right-0 max-md:bottom-[-100%] max-md:top-auto max-md:h-[80%] max-md:border-l-0 max-md:border-t max-md:rounded-t-2xl',
  selectedDay && 'max-md:bottom-0',
)}>

  {/* Header */}
  <div className="px-[18px] py-4 border-b border-[var(--sl-border)] shrink-0">
    {/* Handle bar para mobile */}
    <div className="hidden max-md:block w-10 h-1 bg-[var(--sl-t3)] rounded mx-auto mb-3 opacity-40" />
    <div className="flex items-center justify-between mb-2.5">
      <h3 className="font-[Syne] text-[16px] font-extrabold text-[var(--sl-t1)]">
        {selectedDay && formatDayFull(selectedDay.date)}
      </h3>
      <button onClick={() => setSelectedDay(null)}
        className="w-7 h-7 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-s2)] cursor-pointer text-[var(--sl-t2)] flex items-center justify-center hover:border-[#f43f5e] hover:text-[#f43f5e] transition-all">
        <X size={14} />
      </button>
    </div>

    {/* 3 mini summary cards */}
    <div className="flex gap-2">
      {[
        { label: 'Receitas', value: fmtR(dayRecipes),  color: 'text-[#10b981]' },
        { label: 'Despesas', value: fmtR(dayExpenses), color: 'text-[#f43f5e]' },
        { label: 'Saldo',    value: fmtR(dayBalance),  color: dayBalance >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]' },
      ].map(c => (
        <div key={c.label} className="flex-1 px-[11px] py-[9px] rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-center">
          <p className="text-[9px] uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-0.5">{c.label}</p>
          <p className={cn('font-[DM_Mono] text-[14px] font-medium', c.color)}>{c.value}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Body */}
  <div className="flex-1 overflow-y-auto px-[18px] py-3.5">
    {/* Seção: Transações */}
    {dayTransactions.filter(t => !t.is_future && !t.recurring_transaction_id).length > 0 && (
      <DrawerSection title="Transações" items={...} />
    )}

    {/* Seção: Recorrentes */}
    {dayTransactions.filter(t => t.recurring_transaction_id).length > 0 && (
      <DrawerSection title="Recorrentes" items={...} />
    )}

    {/* Seção: Futuros / Planejados */}
    {dayTransactions.filter(t => t.is_future).length > 0 && (
      <DrawerSection title="Planejados" items={...} futureNote />
    )}

    {/* Empty state */}
    {dayTransactions.length === 0 && (
      <div className="text-center py-8 text-[var(--sl-t3)] text-[12px]">
        <span className="text-[28px] block mb-2 opacity-50">📅</span>
        Nenhuma transação neste dia.
      </div>
    )}

    {/* Botão adicionar */}
    <button onClick={() => openAddModal(selectedDay?.date)}
      className="w-full py-2.5 rounded-[10px] border border-dashed border-[var(--sl-border-h)] bg-transparent cursor-pointer text-[var(--sl-t2)] text-[12px] flex items-center justify-center gap-1.5 hover:border-[#10b981] hover:text-[#10b981] hover:bg-[rgba(16,185,129,0.04)] transition-all mt-2">
      <Plus size={14} />
      Adicionar transação neste dia
    </button>
  </div>

  {/* Footer: balance card */}
  <div className="px-[18px] py-3.5 border-t border-[var(--sl-border)] shrink-0">
    <div className="flex items-center justify-between px-3.5 py-[11px] rounded-[11px] bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] border border-[rgba(16,185,129,0.15)]">
      <span className="text-[11px] text-[var(--sl-t2)]">Saldo acumulado até aqui</span>
      <span className={cn('font-[DM_Mono] text-[16px] font-medium', cumulativeBalance >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
        {fmtR(cumulativeBalance)}
      </span>
    </div>
    {selectedDay?.isFuture && dayTransactions.some(t => t.is_future) && (
      <div className="flex items-start gap-1.5 mt-2.5 p-3 rounded-[9px] bg-[rgba(96,165,250,0.06)] border border-[rgba(96,165,250,0.2)] text-[11px] text-[#60a5fa] leading-relaxed">
        <Info size={13} className="shrink-0 mt-px" />
        Valores futuros são projeções baseadas em recorrentes e eventos planejados.
      </div>
    )}
  </div>
</div>
```

### DrawerSection Component

```tsx
function DrawerSection({ title, items, futureNote }: {
  title: string
  items: CalendarTransaction[]
  futureNote?: boolean
}) {
  return (
    <div className="mb-[18px]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-2">
        {title}
        <span className="flex-1 h-px bg-[var(--sl-border)]" />
      </div>
      {items.map(txn => (
        <div key={txn.id}
          className="flex items-center gap-2.5 p-2.5 px-[10px] rounded-[10px] border border-[var(--sl-border)] bg-[var(--sl-s2)] mb-1.5 cursor-pointer hover:border-[var(--sl-border-h)] transition-colors">
          <div className={cn(
            'w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[14px] shrink-0',
            txn.type === 'income' ? 'bg-[rgba(16,185,129,0.12)]' : 'bg-[rgba(244,63,94,0.1)]'
          )}>
            {txn.icon ?? (txn.type === 'income' ? '💰' : '📤')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">{txn.description}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">{txn.categoryName ?? '—'}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={cn(
              'font-[DM_Mono] text-[13px] font-medium',
              txn.is_future ? 'text-[#60a5fa]' : txn.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
            )}>
              {txn.type === 'income' ? '+' : '−'}{fmtR(txn.amount)}
            </span>
            {txn.is_future && (
              <span className="text-[8px] font-bold px-1.5 py-px rounded-[3px] bg-[rgba(96,165,250,0.12)] text-[#60a5fa] mt-0.5">
                previsto
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 6. FAB (Floating Action Button)

```tsx
<div className="fixed bottom-[22px] right-[22px] z-[90] flex flex-col items-end gap-1.5">
  {/* Itens do FAB (expandem ao clicar) */}
  <div className={cn(
    'flex flex-col gap-1.5 items-end transition-all duration-200',
    fabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1.5 pointer-events-none'
  )}>
    {[
      { icon: '📥', label: 'Nova Receita',  action: () => openAddModal(null, 'income') },
      { icon: '📤', label: 'Nova Despesa',  action: () => openAddModal(null, 'expense') },
      { icon: '📅', label: 'Evento futuro', action: () => openPlanningModal() },
    ].map(item => (
      <div key={item.label} className="flex items-center gap-1.5 cursor-pointer" onClick={item.action}>
        <span className="bg-[var(--sl-s2)] border border-[var(--sl-border-h)] rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[var(--sl-t1)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] whitespace-nowrap">
          {item.label}
        </span>
        <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border-h)]">
          {item.icon}
        </span>
      </div>
    ))}
  </div>

  {/* Botão principal */}
  <button onClick={() => setFabOpen(v => !v)}
    className={cn(
      'w-[46px] h-[46px] rounded-full border-none bg-gradient-to-br from-[#10b981] to-[#0055ff] text-white text-[22px] cursor-pointer shadow-[0_5px_20px_rgba(16,185,129,0.4)] transition-transform duration-200 flex items-center justify-center',
      fabOpen && 'rotate-45'
    )}>
    +
  </button>
</div>
```

---

## 7. Interfaces TypeScript

```ts
interface CalendarDayData {
  date: Date
  dateString: string            // 'YYYY-MM-DD'
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
  transactions: CalendarTransaction[]
  balance: number               // receitas - despesas do dia
}

interface CalendarTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryName: string | null
  icon: string | null
  dotType: 'income' | 'expense' | 'recorrente' | 'planned'
  is_future: boolean
  recurring_transaction_id: string | null
}

interface WeekBalance {
  weekIndex: number
  balance: number
}

interface DayStats {
  recipes: number
  expenses: number
  balance: number
  pendingCount: number
}
```

---

## 8. Hook `useCalendario`

```ts
// src/hooks/use-calendario.ts
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCalendario() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<any[]>([])
  const [planningEvents, setPlanningEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calcular intervalo do mês
  const { monthStart, monthEnd } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return {
      monthStart: new Date(year, month, 1).toISOString().split('T')[0],
      monthEnd: new Date(year, month + 1, 0).toISOString().split('T')[0],
    }
  }, [currentDate])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [txRes, planRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date'),
      supabase
        .from('planning_events')
        .select('*, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('planned_date', monthStart)
        .lte('planned_date', monthEnd),
    ])

    if (txRes.error) setError(txRes.error.message)
    else setTransactions((txRes.data as any) ?? [])

    if (planRes.data) setPlanningEvents((planRes.data as any) ?? [])
    setLoading(false)
  }, [monthStart, monthEnd])

  useEffect(() => { fetchData() }, [fetchData])

  // Gerar dias do calendário (inclui dias de meses adjacentes para completar as semanas)
  const calendarDays = useMemo(() => buildCalendarDays({
    currentDate,
    transactions,
    planningEvents,
  }), [currentDate, transactions, planningEvents])

  // Balanços semanais
  const weekBalances = useMemo(() => {
    const weeks: number[] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7)
      const weekBalance = week
        .filter(d => d.isCurrentMonth)
        .reduce((sum, d) => sum + d.balance, 0)
      weeks.push(weekBalance)
    }
    return weeks
  }, [calendarDays])

  // Stats do mês
  const monthStats = useMemo(() => {
    const monthDays = calendarDays.filter(d => d.isCurrentMonth)
    return {
      totalRecipes: monthDays.reduce((sum, d) => sum + d.transactions.filter(t => t.type === 'income' && !t.is_future).reduce((s, t) => s + t.amount, 0), 0),
      totalExpenses: monthDays.reduce((sum, d) => sum + d.transactions.filter(t => t.type === 'expense' && !t.is_future).reduce((s, t) => s + t.amount, 0), 0),
      pendingCount: transactions.filter(t => t.is_future).length + planningEvents.filter(e => !e.is_confirmed).length,
    }
  }, [calendarDays, transactions, planningEvents])

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return {
    currentDate,
    setCurrentDate,
    calendarDays,
    weekBalances,
    monthStats,
    loading,
    error,
    prevMonth,
    nextMonth,
    refresh: fetchData,
  }
}
```

### `buildCalendarDays`

```ts
function buildCalendarDays({ currentDate, transactions, planningEvents }: {
  currentDate: Date
  transactions: any[]
  planningEvents: any[]
}): CalendarDayData[] {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Primeiro dia do mês e da semana que inicia o calendário
  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = new Date(firstDayOfMonth)
  startDay.setDate(startDay.getDate() - startDay.getDay())  // domingo anterior (ou o próprio domingo)

  // Último dia do mês e da semana que termina o calendário
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const endDay = new Date(lastDayOfMonth)
  const daysUntilSaturday = 6 - endDay.getDay()
  endDay.setDate(endDay.getDate() + daysUntilSaturday)

  const days: CalendarDayData[] = []
  const cursor = new Date(startDay)

  while (cursor <= endDay) {
    const dateString = cursor.toISOString().split('T')[0]
    const isCurrentMonth = cursor.getMonth() === month
    const isToday = cursor.getTime() === today.getTime()
    const isFuture = cursor > today

    // Filtrar transações do dia
    const dayTxs: CalendarTransaction[] = transactions
      .filter(t => t.date === dateString)
      .map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        categoryName: t.categories?.name ?? null,
        icon: t.categories?.icon ?? null,
        dotType: t.recurring_transaction_id ? 'recorrente' : t.type,
        is_future: t.is_future,
        recurring_transaction_id: t.recurring_transaction_id,
      } as CalendarTransaction))

    // Adicionar planning_events do dia
    const dayPlanEvents: CalendarTransaction[] = planningEvents
      .filter(e => e.planned_date === dateString)
      .map(e => ({
        id: `plan-${e.id}`,
        description: e.name,
        amount: e.amount,
        type: e.type,
        categoryName: e.categories?.name ?? null,
        icon: e.categories?.icon ?? null,
        dotType: 'planned' as const,
        is_future: true,
        recurring_transaction_id: null,
      }))

    const allTxs = [...dayTxs, ...dayPlanEvents]
    const balance = allTxs
      .filter(t => !t.is_future)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)

    days.push({
      date: new Date(cursor),
      dateString,
      day: cursor.getDate(),
      isCurrentMonth,
      isToday,
      isFuture,
      transactions: allTxs,
      balance,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}
```

---

## 9. Queries Supabase

### Transações do mês

```sql
SELECT
  t.*,
  c.id    AS "categories.id",
  c.name  AS "categories.name",
  c.icon  AS "categories.icon",
  c.color AS "categories.color"
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.date >= $1   -- monthStart (YYYY-MM-DD)
  AND t.date <= $2   -- monthEnd (YYYY-MM-DD)
ORDER BY t.date, t.created_at;
```

### Planning events do mês

```sql
SELECT
  pe.*,
  c.id    AS "categories.id",
  c.name  AS "categories.name",
  c.icon  AS "categories.icon",
  c.color AS "categories.color"
FROM planning_events pe
LEFT JOIN categories c ON pe.category_id = c.id
WHERE pe.user_id = auth.uid()
  AND pe.planned_date >= $1
  AND pe.planned_date <= $2
ORDER BY pe.planned_date;
```

---

## 10. Regras de Negócio

### Geração do Grid

- O calendário sempre inicia no **domingo** antes (ou do próprio primeiro dia do mês se for domingo).
- O calendário sempre termina no **sábado** após (ou do próprio último dia do mês se for sábado).
- Isso garante sempre grades completas de 7 colunas (5 ou 6 semanas).

### Dots (3 máximo + overflow)

```ts
// Máximo de 3 dots visíveis por célula de dia
const MAX_DOTS = 3
const visibleDots = day.transactions.slice(0, MAX_DOTS)
const overflowCount = day.transactions.length - MAX_DOTS
// Quando overflowCount > 0: exibir texto "+N" ao lado dos dots
```

**Prioridade de dots:** recorrente > income > expense > planned
(Ordenar transações para que recorrentes apareçam primeiro)

### Cores dos dots

| Tipo | Cor |
|---|---|
| `income` (não recorrente) | `#10b981` (verde) |
| `expense` (não recorrente) | `#f43f5e` (vermelho) |
| `recorrente` (income ou expense com `recurring_transaction_id`) | `#60a5fa` (azul) |
| `planned` (planning_event) | `#a855f7` (roxo) |

### Balanço do dia

```ts
// Considera apenas transações não-futuras
balance = transactions
  .filter(t => !t.is_future)
  .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
```

### Saldo cumulativo no drawer

O saldo acumulado "até aqui" no footer do drawer é calculado somando todos os balanços dos dias do mês atual até o dia selecionado, partindo de `profiles.current_balance` do início do mês.

```ts
const cumulativeBalance = profile.current_balance + calendarDays
  .filter(d => d.isCurrentMonth && d.date <= selectedDay.date)
  .reduce((sum, d) => sum + d.balance, 0)
```

### Semana Summary Strip

A semana exibida é a **semana do dia selecionado**. Se nenhum dia selecionado, exibe a semana que contém "hoje".

```ts
const selectedWeekIndex = calendarDays.findIndex(d => d.dateString === (selectedDay?.dateString ?? todayString))
const weekStart = Math.floor(selectedWeekIndex / 7) * 7
const weekDays = calendarDays.slice(weekStart, weekStart + 7).filter(d => d.isCurrentMonth)
```

### "+ Adicionar neste dia" — pré-preencher data

Ao clicar em "+ Adicionar transação neste dia" no drawer, abrir o modal de nova transação com a data `selectedDay.dateString` pré-preenchida no campo `date`.

---

## 11. States

### Loading

```tsx
{loading && (
  <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden animate-pulse">
    {/* Cabeçalho */}
    <div className="grid grid-cols-7 border-b border-[var(--sl-border)] bg-[var(--sl-s2)]">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="py-2 px-1 h-8" />
      ))}
    </div>
    {/* Células */}
    <div className="grid grid-cols-7">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="border-r border-b border-[var(--sl-border)] min-h-[88px] p-2">
          <div className="h-3 w-5 bg-[var(--sl-s3)] rounded mb-1.5" />
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[var(--sl-s3)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--sl-s3)]" />
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### Error

```tsx
{error && (
  <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-4">
    Erro ao carregar calendário. <button onClick={refresh} className="underline">Tentar novamente</button>
  </div>
)}
```

---

## 12. Foco vs Jornada

| Elemento | Foco | Jornada |
|---|---|---|
| Título | `text-[var(--sl-t1)]` | `text-sl-grad` |
| JornadaInsight / Proj Card | `hidden` | `flex` |
| Proj Card conteúdo | — | Saldo projetado do mês + count pendentes |
| Drawer footer | Balance card simples | Mesma coisa |

```tsx
<div className="hidden [.jornada_&]:flex ...">
  {/* Jornada Projection Card */}
</div>
```

---

## 13. Responsividade

| Breakpoint | Comportamento |
|---|---|
| Desktop (>768px) | Drawer lateral 400px, slide from right |
| Mobile (≤768px) | Drawer inferior 80% height, slide from bottom, handle bar visível |
| Mobile | Module bar e sidebar ocultos (pelo AppShell) |
| Mobile | Week summary 2 colunas, page header em coluna |
| Mobile | Cells: `min-height: 70px`, texto menor |

```css
/* Drawer */
@media (max-width: 768px) {
  .drawer { width: 100%; right: 0; bottom: -100%; top: auto; height: 80%;
            border-left: none; border-top: 1px solid var(--sl-border);
            border-radius: 16px 16px 0 0; }
  .drawer.open { bottom: 0; }
}

/* Week summary */
@media (max-width: 640px) { .week-summary { grid-template-columns: repeat(2, 1fr); } }

/* Calendar cells */
@media (max-width: 768px) { .cal-day { min-height: 70px; padding: 5px 6px; } }
```

O conteúdo deve ser envolto em `<div className="content-area relative">` para que o drawer com `position: absolute` funcione corretamente.

---

## 14. Checklist de Entrega

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Grid de calendário: inicia na semana do 1º do mês, termina na semana do último dia
- [ ] Dias de outros meses exibidos com `opacity-35`, sem interação
- [ ] Máximo 3 dots por célula + texto "+N overflow"
- [ ] Cores de dots: verde (income), vermelho (expense), azul (recorrente), roxo (planejado)
- [ ] Dia hoje: fundo verde claro, número em círculo verde
- [ ] Linha verde no topo do dia hoje
- [ ] Dias com saldo positivo: fundo levemente verde
- [ ] Linha de balanço semanal entre cada semana
- [ ] Navegação de mês (prev/next/hoje) funcional
- [ ] Drawer: slide from right no desktop, slide from bottom no mobile
- [ ] Drawer: 3 mini summary cards (receitas, despesas, saldo do dia)
- [ ] Drawer: seções separadas por tipo (transações, recorrentes, planejados)
- [ ] Drawer footer: saldo cumulativo
- [ ] "+ Adicionar neste dia": pré-preenche data no modal de transação
- [ ] FAB com 3 opções expandíveis (rotação de 45° ao abrir)
- [ ] JornadaInsight / Proj Card oculto no Foco
- [ ] Week summary: dados da semana do dia selecionado (ou semana atual)
- [ ] Valores monetários em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] Responsivo: drawer inferior no mobile com handle bar
