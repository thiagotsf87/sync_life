# 🔧 Guia de Correções — Módulo FINANÇAS Mobile
## Documento para Claude Code

**Data:** 01/03/2026  
**Escopo:** Corrigir inconsistências mobile de TODAS as subpages de Finanças + Quick Entry do FAB  
**Branch de trabalho:** `fix/financas-mobile-inconsistencias`  
**Regra de ouro:** Desktop (≥1024px) NÃO PODE mudar.

---

## ⚠️ REGRAS OBRIGATÓRIAS

1. **NÃO alterar layout desktop** — usar `max-lg:` e `max-sm:` exclusivamente
2. **NÃO hardcodar cores** — usar tokens `var(--sl-*)`
3. **Fontes:** Syne (títulos), DM Sans (texto), DM Mono (números/valores)
4. **Testar nos 4 modos** após cada tarefa: Foco Dark, Jornada Dark, Foco Light, Jornada Light
5. **Viewport de teste:** 390×844 (iPhone 14 Pro)

---

# 🔴 BUGS CRÍTICOS (Fix imediato)

---

## TAREFA 1 — FAB (+): Navega para Panorama/Dashboard em vez de Finanças
**Prioridade:** 🔴 CRÍTICO — Bug funcional  
**Arquivo principal:** O componente que renderiza o FAB central na bottom bar  
**Evidência:** Print 10 — breadcrumb mostra "Panorama / Dashboard", bottom nav destaca "Início"

### Problema:
Ao clicar no botão **"+"** (FAB) centralizado no MobileBottomBar, o app:
1. **Navega para `/dashboard`** (Panorama) em vez de abrir o Quick Entry no contexto atual
2. O **breadcrumb mostra "Panorama / Dashboard"** (errado)
3. A **bottom nav destaca "Início"** em vez de "Finanças" (errado)
4. Abre uma tela de Quick Entry com numpad, mas **no contexto errado**

### Comportamento esperado:
O FAB (+) central deve **abrir um bottom sheet / overlay** de Quick Entry **SEM navegar para outra rota**. Ou seja:
- Se o usuário está em `/financas/transacoes`, o FAB abre o Quick Entry sobreposto
- Se o usuário está em `/financas/orcamentos`, idem
- O breadcrumb e a bottom nav NÃO mudam — permanecem no módulo atual
- Após salvar a transação, o Quick Entry fecha e a tela atual faz refresh

### O que investigar e corrigir:

**Passo 1:** Localizar onde o FAB central é renderizado. Procurar no `MobileBottomBar.tsx` ou em um componente irmão. O FAB com gradiente esmeralda→azul no centro da bottom bar provavelmente tem um `onClick` que faz `router.push('/dashboard')` ou `router.push('/')`.

**Passo 2:** O FAB deveria abrir um Sheet/Modal de Quick Entry, NÃO navegar. Mudar o comportamento:

```tsx
// ERRADO (provavelmente atual):
onClick={() => router.push('/dashboard')}

// CORRETO:
onClick={() => setQuickEntryOpen(true)}
```

**Passo 3:** Criar ou localizar o componente `QuickEntrySheet` que renderiza:
- Overlay/bottom sheet com fundo escuro
- Display do valor com numpad
- Seletor de categoria (ver TAREFA 2)
- Data (default: hoje)
- Botão salvar

**Passo 4:** O QuickEntrySheet deve usar o hook `useTransactions` para criar a transação no contexto correto (mês e ano atuais).

### Validação:
- [ ] FAB (+) abre overlay de Quick Entry sem mudar de rota
- [ ] Breadcrumb permanece no módulo onde o usuário estava
- [ ] Bottom nav permanece destacando o módulo correto
- [ ] Após salvar, o overlay fecha e a tela atualiza

---

## TAREFA 2 — Quick Entry: Categoria "Toque para mudar" não funciona
**Prioridade:** 🔴 CRÍTICO — Bug funcional  
**Arquivo:** O componente QuickEntry / QuickEntrySheet  
**Evidência:** Print 10 — Badge "Alimentação / Toque para mudar" não responde ao toque

### Problema:
O Quick Entry abre com a categoria "Alimentação" hardcoded como padrão. O badge mostra "Toque para mudar" mas **o click/tap não faz nada**. O usuário fica preso na categoria Alimentação sem poder trocar.

### O que corrigir:

**Passo 1:** Localizar o componente de seleção de categoria no Quick Entry. O `onClick` provavelmente está ausente ou aponta para uma função vazia.

**Passo 2:** Implementar um seletor de categoria. Ao tocar no badge de categoria, abrir um **sub-sheet ou dropdown** com a lista de categorias do usuário:

```tsx
const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

// No badge de categoria:
<button 
  onClick={() => setCategoryPickerOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-full 
             bg-[var(--sl-s2)] border border-[var(--sl-border)]"
>
  <span className="text-lg">{selectedCategory?.icon || '🍔'}</span>
  <div className="text-left">
    <span className="text-sm font-medium text-[var(--sl-t1)]">
      {selectedCategory?.name || 'Alimentação'}
    </span>
    <span className="text-[10px] text-[var(--sl-t3)] block">
      Toque para mudar
    </span>
  </div>
</button>
```

**Passo 3:** O CategoryPicker deve:
- Mostrar categorias agrupadas por tipo (Despesas / Receitas)
- Permitir busca rápida
- Mostrar ícone + nome + cor de cada categoria
- Ao selecionar, fechar o picker e atualizar o badge
- Usar `useCategories()` hook para carregar categorias reais do Supabase

**Passo 4:** Além de "Toque para mudar", adicionar um toggle Receita/Despesa no Quick Entry. O valor padrão pode ser "Despesa" mas o usuário deve poder trocar.

### Validação:
- [ ] Toque no badge de categoria abre um picker funcional
- [ ] Lista de categorias carregada do banco (não hardcoded)
- [ ] Ao selecionar categoria, badge atualiza com ícone e nome corretos
- [ ] Toggle Receita/Despesa funciona
- [ ] A transação é salva com a categoria selecionada (não sempre "Alimentação")

---

# 🟠 PROBLEMAS GRAVES (UX afetada)

---

## TAREFA 3 — Gráfico "Gastos por Categoria": Texto cortado no mobile
**Prioridade:** 🟠 GRAVE  
**Arquivo:** `web/src/app/(app)/financas/page.tsx` (ou componente do donut chart)  
**Evidência:** Print 2 — "Nenhum or..." cortado à direita do donut chart

### Problema:
O card "Gastos por Categoria" com o donut chart está em layout 2 colunas lado a lado com "Histórico — Receitas vs Despesas". Em 390px, o donut chart empurra o texto da legenda para fora da viewport.

### O que fazer:

Localizar o grid que contém os 2 cards (Histórico + Gastos por Categoria). No desktop é `grid-cols-2`. No mobile, deve ser `grid-cols-1`:

```tsx
{/* De: */}
<div className="grid grid-cols-2 gap-4">

{/* Para: */}
<div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
```

O card do donut chart precisa garantir que em full-width:
- O donut fica centralizado
- A legenda de categorias fica abaixo (não ao lado)
- O texto "Nenhum gasto registrado" não é cortado

### Validação:
- [ ] Desktop: 2 colunas lado a lado (sem mudança)
- [ ] Mobile: stack vertical, cada card full-width
- [ ] Donut chart centralizado, legenda abaixo
- [ ] Nenhum texto cortado

---

## TAREFA 4 — Fluxo de Caixa: X-axis ilegível no mobile
**Prioridade:** 🟠 GRAVE  
**Arquivo:** `web/src/app/(app)/financas/page.tsx` (componente Fluxo de Caixa)  
**Evidência:** Print 2 — Os 31 labels de dia (01, 02, 03... 31) estão comprimidos em 390px

### Problema:
O gráfico "Fluxo de Caixa — Dia a Dia" tenta exibir 28-31 colunas com labels individuais em 390px de largura. Resultado: tudo fica ilegível e comprimido.

### Solução — 2 opções (escolher a mais adequada):

**Opção A — Scroll horizontal no gráfico:**
```tsx
<div className="max-sm:overflow-x-auto max-sm:scrollbar-none">
  <div className="max-sm:min-w-[600px]">
    {/* Gráfico com largura mínima, scroll para ver o resto */}
  </div>
</div>
```
Nesta opção, o gráfico mantém sua largura natural e o container permite scroll. É a mais simples de implementar e preserva a legibilidade.

**Opção B — Amostragem de labels no eixo X:**
No mobile, mostrar apenas labels alternados (dia 1, 5, 10, 15, 20, 25, 30) e ocultar os intermediários:
```tsx
const showLabel = (day: number) => {
  if (isMobile) return [1, 5, 10, 15, 20, 25, 30].includes(day)
  return true
}
```

**Recomendação:** Opção A (scroll horizontal) é mais robusta e consistente com o padrão de gráficos financeiros em apps mobile.

### Validação:
- [ ] Desktop: gráfico full-width sem scroll (sem mudança)
- [ ] Mobile: gráfico com scroll horizontal suave OU labels filtrados
- [ ] Labels do eixo X legíveis em 390px
- [ ] Barras e linha de saldo corretamente renderizados

---

## TAREFA 5 — Recorrentes: Nome truncado ("Academia Sma...")
**Prioridade:** 🟠 GRAVE  
**Arquivo:** `web/src/app/(app)/financas/recorrentes/page.tsx`  
**Evidência:** Print 4 — "Academia Sma..." truncado de forma agressiva

### Problema:
O card de recorrente em modo lista (list view) mostra o nome "Academia Smart..." truncado prematuramente. O card tem espaço suficiente para mostrar mais texto.

### O que investigar:
1. Verificar se o título tem `max-width` ou `truncate` aplicado de forma desnecessária
2. O layout do card de recorrente mostra: `[Nome] [Badge Despesa] → valor` em linha horizontal. Se o nome e o valor competem por espaço, o nome é sacrificado.

### Solução:
Reorganizar o card para que o nome tenha mais espaço no mobile:

```tsx
{/* Layout do card de recorrente no mobile */}
<div className="flex flex-col gap-2 p-4">
  {/* Linha 1: Nome + Valor */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-[var(--sl-t1)] text-[15px] truncate">
        {recorrente.name}  {/* Agora com truncate mas em full-width */}
      </h3>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="badge-tipo">{recorrente.type === 'expense' ? 'Despesa' : 'Receita'}</span>
        <span className="text-[11px] text-[var(--sl-t3)]">📅 Todo dia {recorrente.day}</span>
      </div>
    </div>
    <span className="font-[DM_Mono] font-medium text-[16px] whitespace-nowrap shrink-0"
          style={{ color: recorrente.type === 'expense' ? '#f43f5e' : '#10b981' }}>
      {recorrente.type === 'expense' ? '−' : '+'} R$ {recorrente.amount}
    </span>
  </div>
</div>
```

A chave é dar `flex-1 min-w-0` ao container do nome para que ele ocupe todo o espaço disponível antes do valor.

### Validação:
- [ ] Nomes de recorrentes aparecem completos (ou com truncate inteligente em nomes muito longos)
- [ ] O valor monetário nunca é cortado
- [ ] O badge de tipo (Despesa/Receita) está visível

---

## TAREFA 6 — Planejamento: Timeline pode ter overflow horizontal
**Prioridade:** 🟠 GRAVE  
**Arquivo:** `web/src/app/(app)/financas/planejamento/page.tsx`  
**Evidência:** Print 8 — Timeline de meses (mar/26, abr/26...) com cards de receita/despesa lado a lado

### Problema:
A seção "Curva de Saldo — 6 meses" e a timeline de meses abaixo dela mostram colunas lado a lado. Em 390px, se houver muitos meses visíveis, pode transbordar.

### O que fazer:
Envolver a timeline em container com scroll horizontal:

```tsx
<div className="max-sm:overflow-x-auto max-sm:scrollbar-none max-sm:pb-2">
  <div className="max-sm:min-w-[600px]">
    {/* Timeline de meses */}
  </div>
</div>
```

Para a "Curva de Saldo" (gráfico de linhas), aplicar a mesma estratégia da Tarefa 4 — scroll horizontal no mobile.

### Validação:
- [ ] Desktop: timeline completa sem scroll
- [ ] Mobile: scroll horizontal suave para ver todos os meses
- [ ] Gráfico de curva de saldo não transborda

---

# 🟡 PROBLEMAS MODERADOS (Melhorias de UX)

---

## TAREFA 7 — Dashboard Finanças: Saudação Jornada posicionada após sub-tabs
**Prioridade:** 🟡 MODERADO  
**Arquivo:** `web/src/app/(app)/financas/page.tsx`  
**Evidência:** Print 1 — "Boa noite, Teste QA!" com pills Foco/Jornada aparece entre header e sub-tabs

### Problema:
No header mobile, a saudação "Boa noite, Teste QA!" com os pills de modo Foco/Jornada aparece comprimida em uma única linha. Isso é funcional, mas o espaço é apertado.

### Observação:
Isso é na verdade um problema GLOBAL do MobileHeader (mesmo problema do Panorama — TAREFA do documento anterior). Se a TAREFA do MobileHeader 2-linhas do Panorama já foi implementada, isso se resolve automaticamente aqui. Caso contrário, incluir este módulo na mesma correção global.

O MobileHeader deveria ser:
```
Linha 1: [$ Finanças > Dashboard]     [🔔] [N]
Linha 2 (Jornada): [Boa noite, QA!]  [Foco | Jornada]
```

### Validação:
- [ ] MobileHeader com 2 linhas no modo Jornada (44px Foco, 80px Jornada)
- [ ] Saudação legível, pills não sobrepostos ao breadcrumb

---

## TAREFA 8 — Calendário Financeiro: KPIs semanais sem acentuação visual
**Prioridade:** 🟡 MODERADO  
**Arquivo:** `web/src/app/(app)/financas/calendario/page.tsx`  
**Evidência:** Print 6 — 4 KPI cards (Receitas Semana, Despesas Semana, Saldo, Pendentes) sem barra de acento

### Problema:
Os 4 KPI cards do Calendário Financeiro não usam o componente `KpiCard` com a barra de acento colorida no topo. Parecem genéricos em vez de seguir o design system.

### O que fazer:
Verificar se o Calendário está usando o `KpiCard` oficial ou um layout custom. Se custom, migrar para `KpiCard`:

```tsx
<div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-2">
  <KpiCard label="Receitas Semana" value={fmt(weekIncome)} 
           accent="#10b981" icon="💰" iconBg="rgba(16,185,129,0.12)" />
  <KpiCard label="Despesas Semana" value={fmt(weekExpense)} 
           accent="#f43f5e" icon="📤" iconBg="rgba(244,63,94,0.12)" />
  <KpiCard label="Saldo Semana" value={fmt(weekBalance)} 
           accent="#10b981" icon="💚" iconBg="rgba(16,185,129,0.12)" />
  <KpiCard label="Pendentes" value={String(pending)} 
           accent="#06b6d4" icon="📋" iconBg="rgba(6,182,212,0.12)" />
</div>
```

### Validação:
- [ ] KPIs do calendário usam o componente KpiCard oficial
- [ ] Barra de acento colorida no topo de cada card
- [ ] Ícone emoji com background colorido presente

---

## TAREFA 9 — Relatórios: Tela OK, porém pills de período sem scroll
**Prioridade:** 🟡 MODERADO  
**Arquivo:** `web/src/app/(app)/financas/relatorios/page.tsx`  
**Evidência:** Print 9 — pills de período (Mês atual, Último trimestre, Último semestre...) empilham em 3 linhas

### Problema:
Os pills de seleção de período (Mês atual, Último trimestre, Último semestre, Últimos 12 meses, Ano atual, Personalizado) ocupam 3 linhas em 390px. Isso é funcional, mas consome muito espaço vertical antes do conteúdo real.

### Solução:
Opção A — Scroll horizontal (recomendado):
```tsx
<div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 max-sm:flex-nowrap">
  {periods.map(p => (
    <button key={p.id} className="shrink-0 whitespace-nowrap ...">
      {p.label}
    </button>
  ))}
</div>
```

Opção B — Grid 2 colunas em mobile:
```tsx
<div className="flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-2">
```

### Validação:
- [ ] Pills de período cabem em 1-2 linhas no mobile
- [ ] Todos os períodos acessíveis

---

# 🟢 OBSERVAÇÕES POSITIVAS

Estas telas estão **bem implementadas** no mobile:

| Tela | Avaliação | Nota |
|------|-----------|------|
| **Transações** (Print 3) | ✅ Excelente | Layout limpo, busca + filtros compactos, empty state bom |
| **Recorrentes Summary** (Print 5) | ✅ Muito bom | KPIs 2×2, lista de ocorrências clara e legível |
| **Orçamentos** (Print 7) | ✅ Bom | KPIs ok, sugestão 50-30-20 é ótimo toque. Empty state com CTA claro |
| **Planejamento KPIs** (Print 8 topo) | ✅ Bom | 4 KPIs em 2×2, cenários Pessimista/Realista/Otimista funcionam |
| **Relatórios KPIs** (Print 9 base) | ✅ Bom | Valores claros, deltas com setas coloridas |
| **Calendário Grid** (Print 6) | ✅ Bom | 7 colunas cabem em 390px, dia atual destacado |

---

# 📋 CHECKLIST GERAL DE VALIDAÇÃO

### Após todas as tarefas:

**Mobile (390×844):**
- [ ] FAB (+) abre Quick Entry como overlay, sem navegar para outra rota
- [ ] Category picker funcional no Quick Entry
- [ ] Dashboard Finanças: gráficos não transbordam horizontalmente
- [ ] Fluxo de Caixa legível (scroll horizontal ou labels filtrados)
- [ ] Recorrentes: nomes completos nos cards
- [ ] Planejamento: timeline com scroll horizontal
- [ ] Relatórios: pills de período cabem na tela

**Desktop (≥1024px):**
- [ ] TODAS as 7 subpages de Finanças: layout IDÊNTICO ao antes
- [ ] FAB desktop continua funcionando normalmente
- [ ] Nenhum componente desktop quebrado

**Cross-cutting:**
- [ ] Nenhuma cor hardcoded fora dos tokens `var(--sl-*)`
- [ ] Transição Foco↔Jornada funciona em todas as subpages
- [ ] Dados salvos corretamente (transações criadas via Quick Entry)

---

# 🗂️ REFERÊNCIA DE ARQUIVOS

| Arquivo | Mudança |
|---------|---------|
| Componente FAB / QuickEntry (localizar) | REFATORAR — separar navegação do Quick Entry |
| Componente QuickEntry / CategoryPicker (criar se não existir) | CRIAR — seletor de categoria funcional |
| `web/src/app/(app)/financas/page.tsx` | MODIFICAR — grids responsivos para gráficos |
| `web/src/app/(app)/financas/recorrentes/page.tsx` | MODIFICAR — layout dos cards de recorrente |
| `web/src/app/(app)/financas/planejamento/page.tsx` | MODIFICAR — scroll horizontal na timeline |
| `web/src/app/(app)/financas/relatorios/page.tsx` | MODIFICAR — pills de período responsivos |
| `web/src/app/(app)/financas/calendario/page.tsx` | MODIFICAR — migrar KPIs para componente oficial |
| `web/src/components/shell/MobileBottomBar.tsx` | MODIFICAR — handler do FAB central |
| `web/src/app/globals.css` | MODIFICAR — utilitários scrollbar-none se necessário |

# 🗂️ REFERÊNCIA DE PROTÓTIPOS

| Protótipo | Tela |
|-----------|------|
| `proto-financas-dashboard.html` | Visão Geral (Foco + Jornada) |
| `proto-transacoes_6.html` | Transações (grid, filtros, modal nova transação) |
| `proto-recorrentes-revisado.html` | Recorrentes (cards + summary) |
| `proto-orcamentos-revisado.html` | Orçamentos (envelopes) |
| `proto-calendario-financeiro_1.html` | Calendário Financeiro |
| `proto-planejamento-revisado.html` | Planejamento (timeline + cenários) |
| `proto-relatorios-revisado.html` | Relatórios (período + análise) |

---

# ⏱️ ORDEM DE EXECUÇÃO

```
1. TAREFA 1 — FAB rota errada              (~1.5h)  🔴
2. TAREFA 2 — Category picker Quick Entry   (~2h)    🔴
3. TAREFA 3 — Donut chart overflow          (~20min) 🟠
4. TAREFA 4 — Fluxo de Caixa X-axis        (~30min) 🟠
5. TAREFA 5 — Recorrentes nome truncado     (~30min) 🟠
6. TAREFA 6 — Timeline Planejamento         (~30min) 🟠
7. TAREFA 7 — MobileHeader (se não feito)   (~30min) 🟡
8. TAREFA 8 — Calendário KPIs              (~20min) 🟡
9. TAREFA 9 — Relatórios pills             (~15min) 🟡
                                     Total: ~6.5h
```

**Nota importante:** As Tarefas 1 e 2 são bugs FUNCIONAIS — o usuário literalmente não consegue criar transações por outra categoria que não seja Alimentação, e o FAB o expulsa do módulo. Prioridade absoluta.

---

*Documento gerado em 01/03/2026 com base em 10 screenshots do módulo Finanças mobile.*
*Referências: protótipos aprovados, `PLANO-MVP-V4.md`, `financas-visao-geral-regras-de-negocio.md`, `MobileBottomBar.tsx`*
