# PROMPT — Claude Code: Mobile Layout Redesign + Design System Update
**Projeto:** SyncLife  
**Data:** 01/03/2026  
**Versão:** 1.0  
**Objetivo:** Corrigir todos os problemas críticos de mobile identificados na auditoria, criar componentes mobile padronizados e atualizar o Design System para contemplar mobile nativamente — sem alterar nenhum layout desktop.

---

## CONTEXTO PARA O CLAUDE CODE

O SyncLife é uma aplicação web em Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Supabase. A aplicação está **100% funcional no desktop** com todos os 8 módulos implementados (Finanças, Tempo, Futuro, Corpo, Mente, Patrimônio, Carreira, Experiências).

Foi realizada uma auditoria mobile em 28/02/2026 que identificou **3 problemas críticos** que afetam 100% das telas e **5 problemas graves** em módulos específicos. Existem também 4 problemas moderados e 3 leves.

**REGRA ABSOLUTA: o layout desktop (≥1024px) NÃO pode sofrer nenhuma alteração.** Todo código mobile deve usar prefixos `max-lg:` ou `max-sm:` do Tailwind. Nunca usar `@media` diretamente no CSS.

---

## PARTE 1 — DESIGN SYSTEM: TOKENS MOBILE

### 1.1 — Atualizar `globals.css` adicionando tokens mobile

Adicione a seguinte seção ao final do arquivo `web/src/app/globals.css`, após todos os tokens de tema existentes:

```css
/* ═══════════════════════════════════════════════════════════
   TOKENS MOBILE — SyncLife Design System v2.0
   REGRA: Estes tokens são usados APENAS em contexto mobile.
   Nunca remover ou alterar tokens desktop existentes.
═══════════════════════════════════════════════════════════ */

:root {
  /* ── Dimensões da navegação mobile ── */
  --mob-bottom-nav-height: 68px;        /* Altura da bottom navigation */
  --mob-header-height-foco: 52px;       /* Altura do header mobile no modo Foco */
  --mob-header-height-jornada: 88px;    /* Altura do header mobile no modo Jornada (2 linhas) */
  --mob-safe-bottom: env(safe-area-inset-bottom, 0px); /* Notch inferior iPhone */
  --mob-safe-top: env(safe-area-inset-top, 0px);       /* Dynamic Island */

  /* ── Espaçamento mobile ── */
  --mob-page-x: 16px;      /* Padding horizontal padrão de página */
  --mob-card-p: 14px;      /* Padding interno de cards em mobile */
  --mob-section-gap: 12px; /* Gap entre seções */
  --mob-item-h: 52px;      /* Altura mínima de item de lista (toque confortável) */
  --mob-tap-min: 44px;     /* Tamanho mínimo de área de toque (Apple HIG) */

  /* ── Tipografia mobile ── */
  --mob-kpi-value: 18px;   /* Valor de KPI em mobile (reduzido de 20px) */
  --mob-kpi-label: 10px;   /* Label de KPI em mobile */
  --mob-card-title: 13px;  /* Título de card em mobile */
  --mob-body: 13px;        /* Texto corrido em mobile */
  --mob-caption: 11px;     /* Caption / label secundário */

  /* ── Bottom Navigation ── */
  --mob-nav-bg: var(--sl-s1);
  --mob-nav-border: var(--sl-border);
  --mob-nav-active: var(--sl-accent, #10b981);
  --mob-nav-inactive: var(--sl-t3);

  /* ── Sub-tabs com scroll ── */
  --mob-tabs-h: 40px;           /* Altura das abas de módulo em mobile */
  --mob-tab-fade-width: 40px;   /* Largura do fade indicator de overflow */
}
```

### 1.2 — Documentar tokens de módulo (unificar nomenclatura)

Adicione ao `globals.css` os tokens de cor de módulo com nomenclatura padronizada para uso em classes mobile:

```css
/* ── Cores de módulo — usadas em mobile badges e ícones ── */
:root {
  --mod-financas:    #10b981;
  --mod-tempo:       #06b6d4;
  --mod-futuro:      #0055ff;
  --mod-corpo:       #f97316;
  --mod-mente:       #8b5cf6;
  --mod-patrimonio:  #f59e0b;
  --mod-carreira:    #ec4899;
  --mod-experiencias: #14b8a6;
}
```

---

## PARTE 2 — NOVOS COMPONENTES MOBILE

### 2.1 — Criar `MobileHeader.tsx`

**Arquivo:** `web/src/components/shell/MobileHeader.tsx`

Este componente substitui o `TopHeader` em viewports `< 1024px`. Deve ser renderizado via `lg:hidden` no AppShell.

**Especificação visual:**

```
MODO FOCO (altura: 52px):
┌─────────────────────────────────────────────────────┐
│ [☰]  [ícone módulo] Módulo > Página        [🔔] [👤] │
└─────────────────────────────────────────────────────┘

MODO JORNADA (altura: 88px):
┌─────────────────────────────────────────────────────┐
│ [☰]  [ícone módulo] Módulo > Página        [🔔] [👤] │
│      🌙 Boa noite, Thiago!          [Foco | Jornada] │
└─────────────────────────────────────────────────────┘
```

**Requisitos técnicos:**
- Usar `sticky top-0 z-40` para ficar fixo no scroll
- Background: `bg-[var(--sl-s1)] border-b border-[var(--sl-border)]`
- Linha 1 sempre visível; linha 2 só com `isJornada`
- Botão `☰` (menu) → abre `MobileModulePicker` (drawer lateral)
- Breadcrumb: `[ícone módulo na cor do módulo] NomeMódulo > NomePágina`
- Ícone de notificação (`Bell`) → link para `/configuracoes/notificacoes`
- Avatar circular com iniciais → link para `/configuracoes/perfil`
- Saudação: `🌙 Boa noite` / `☀️ Bom dia` / `🌅 Boa tarde` por horário
- Pills Foco/Jornada na linha 2 (Jornada = gate PRO, abrir modal se FREE)

**Prop types:**
```typescript
interface MobileHeaderProps {
  moduleName: string        // Ex: "Finanças"
  pageTitle: string         // Ex: "Transações"
  moduleColor: string       // Ex: "#10b981"
  moduleIcon: React.ReactNode
}
```

---

### 2.2 — Criar `MobileModulePicker.tsx`

**Arquivo:** `web/src/components/shell/MobileModulePicker.tsx`

Drawer que abre ao tocar no `☰` do MobileHeader. Contém acesso a todos os módulos + configurações de tema/modo.

**Layout do drawer (bottom sheet deslizando da esquerda, largura 85vw, máx 320px):**

```
┌────────────────────────────────────┐
│  ⚡ SyncLife          [✕ fechar]   │
│                                    │
│  MÓDULOS                           │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  💰  │ │  ⏳  │ │  🔮  │       │
│  │Finan.│ │Tempo │ │Futuro│       │
│  └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  🏃  │ │  🧠  │ │  📈  │       │
│  │Corpo │ │Mente │ │Patri.│       │
│  └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐                │
│  │  💼  │ │  ✈️  │               │
│  │Carr. │ │Expe. │                │
│  └──────┘ └──────┘                │
│  ────────────────────────────────  │
│  PREFERÊNCIAS                      │
│  [🎯 Modo Foco] [✨ Jornada PRO]  │
│  [🎨 Tema: Navy Dark ▾]           │
│  ────────────────────────────────  │
│  [⚙️ Configurações]  [🏆 Conquistas] │
└────────────────────────────────────┘
```

**Requisitos:**
- Grid 3 colunas para os módulos
- Módulo atualmente ativo com borda na cor do módulo e fundo suave
- Overlay escuro no resto da tela ao abrir
- Fechar ao clicar fora ou no `✕`
- Usar `useRouter` para navegação — fechar drawer após navegar
- Toggle Foco/Jornada com gate PRO
- Dropdown de tema (só para PRO, mas visível para todos com lock icon)

---

### 2.3 — Criar `ScrollTabs.tsx`

**Arquivo:** `web/src/components/ui/scroll-tabs.tsx`

Componente universal de abas com scroll horizontal para mobile. Deve substituir todos os `<nav>` de sub-navegação de módulos.

**Especificação:**
```
[Dashboard] [Transações] [Recorrentes] [Orçamentos ▷]
            ↑ aba ativa com underline na cor do módulo
                                         ↑ fade indica mais itens
```

**Requisitos:**
```typescript
interface ScrollTabsProps {
  tabs: { label: string; href: string; badge?: number }[]
  activeHref: string
  moduleColor: string     // cor do underline da aba ativa
  className?: string
}
```

- `overflow-x: auto`, `scrollbar-width: none`, `-webkit-overflow-scrolling: touch`
- Aba ativa: underline `2px solid moduleColor`, texto cor `--sl-t1`
- Aba inativa: texto cor `--sl-t3`, sem underline
- Fade mask no lado direito: `mask-image: linear-gradient(to right, black 80%, transparent)` quando há overflow
- Scroll automático para centralizar aba ativa ao montar
- Altura: `var(--mob-tabs-h)` = 40px
- Em desktop (`lg:`), usar o componente de tabs original do módulo (não substituir)

---

### 2.4 — Criar `KpiCard.tsx` (atualização)

**Arquivo:** `web/src/components/ui/kpi-card.tsx`

Atualizar o componente existente de KPI cards para ser responsivo sem quebrar o desktop.

**Mudanças mobile (`max-sm:`):**
- Padding: `p-5 max-sm:p-3`
- Valor: `text-xl max-sm:text-base` com `font-[DM_Mono]`
- Label: `text-[11px] max-sm:text-[10px]`
- Adicionar `min-w-0 overflow-hidden` no container do valor
- Adicionar `truncate` no valor se necessário (mas preferir reduzir fonte)
- Gap entre ícone e conteúdo: `gap-3 max-sm:gap-2`

---

## PARTE 3 — MODIFICAÇÕES NOS COMPONENTES EXISTENTES

### 3.1 — `AppShell.tsx` — Renderização condicional de header

No `AppShell`, adicionar lógica de renderização condicional:

```tsx
{/* Desktop header — visível apenas ≥1024px */}
<div className="hidden lg:block">
  <TopHeader ... />
</div>

{/* Mobile header — visível apenas <1024px */}
<div className="lg:hidden">
  <MobileHeader
    moduleName={currentModule.name}
    pageTitle={currentPage.title}
    moduleColor={currentModule.color}
    moduleIcon={currentModule.icon}
  />
</div>
```

O `TopHeader` original não deve ser alterado em nada.

---

### 3.2 — Bottom Navigation — Modificar comportamento do "Mais"

**Arquivo:** `web/src/components/shell/BottomNav.tsx` (ou equivalente)

**Mudança:** O botão "Mais" não deve mais abrir um drawer de lista vertical. Deve abrir o `MobileModulePicker` (grid 3x colunas, criado no item 2.2).

**Antes:**
```
[Início | Finanças | Futuro | Tempo | Mais]
          "Mais" → lista vertical de módulos
```

**Depois:**
```
[Início | Finanças | Futuro | Tempo | ☰ Mais]
          "Mais" → MobileModulePicker (grid + preferências)
```

Adicionar indicador visual quando o módulo ativo está no menu "Mais":
- Ícone do "Mais" fica com a cor do módulo ativo quando está em módulo oculto
- Pequeno dot colorido na cor do módulo no ícone "Mais"

---

### 3.3 — Dashboard — Life Sync Score Card

**Arquivo:** `web/src/app/(app)/dashboard/page.tsx`

O card do Life Sync Score usa layout `grid grid-cols-2`. Em mobile deve ser vertical.

**Mudança:**
```tsx
// Antes
<div className="grid grid-cols-2 gap-6">

// Depois
<div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-3">
```

No bloco do score grande (esquerda), adicionar `max-sm:text-center`.
No bloco da lista de dimensões (direita), em mobile passar para baixo do score.
O botão "Ver análise completa" deve ser `w-full max-sm:mt-2`.

---

### 3.4 — Todos os módulos — Sub-tabs

**Arquivos afetados:**
- `web/src/app/(app)/financas/layout.tsx` (ou onde as tabs são renderizadas)
- `web/src/app/(app)/mente/layout.tsx`
- `web/src/app/(app)/carreira/layout.tsx`
- `web/src/app/(app)/patrimonio/layout.tsx`
- `web/src/app/(app)/corpo/layout.tsx`
- `web/src/app/(app)/configuracoes/layout.tsx`

**Ação:** Substituir o componente de tabs atual pelo `ScrollTabs` criado no item 2.3 em cada layout de módulo.

Cada módulo deve passar sua `moduleColor` correspondente:
```
financas:    #10b981
tempo:       #06b6d4
futuro:      #0055ff
corpo:       #f97316
mente:       #8b5cf6
patrimonio:  #f59e0b
carreira:    #ec4899
experiencias: #14b8a6
```

---

### 3.5 — Finanças/Transações — Filtros colapsáveis

**Arquivo:** `web/src/app/(app)/financas/transacoes/page.tsx`

Em mobile, os filtros devem ser colapsáveis para liberar espaço para as transações.

**Comportamento mobile:**
```
Estado recolhido (padrão):
[Fevereiro 2026 ◀▶]  [🔍 Buscar]  [Filtros ▾]

Estado expandido (ao clicar em "Filtros ▾"):
[Fevereiro 2026 ◀▶]  [🔍 Buscar]  [Filtros ▴]
[Todos] [Receitas] [Despesas] [Recorrentes]
[Todas as categorias ▼]  [Mais recente ▼]
```

Implementar com `useState(false)` para `filtersExpanded`. Em desktop (`lg:`), sempre mostrar tudo expandido (comportamento atual sem alteração).

---

### 3.6 — Módulo Tempo — Agenda Semanal em mobile

**Arquivo:** `web/src/app/(app)/tempo/page.tsx`

A view semanal com 7 colunas é ilegível em 390px. Em mobile, alternar para view diária.

**Comportamento mobile:**
- Por padrão, exibir **view diária** (lista de eventos do dia selecionado)
- Seletor de dia como scroll horizontal: `[DOM 2] [SEG 3] [TER 4★] [QUA 5] [QUI 6]`
- Dia com eventos marcado com dot verde abaixo do número
- Botão `[📅 Semana]` no topo para voltar à view semanal (que fica horizontal scroll)
- Em desktop: comportamento atual inalterado

---

### 3.7 — Subpages de módulo — Remover títulos duplicados

**Arquivos afetados:**
- `web/src/app/(app)/corpo/atividades/page.tsx`
- `web/src/app/(app)/corpo/peso/page.tsx`
- Outras subpages que exibem H1 redundante com o breadcrumb

**Ação:** Identificar todos os `<h1>` de página que repetem a informação do breadcrumb e adicionar `max-sm:hidden` neles OU reduzir para `<p className="text-sm font-semibold max-sm:hidden">`.

O breadcrumb no MobileHeader já mostra `Módulo > Página`, tornando o H1 redundante em mobile.

---

### 3.8 — Corrigir rota quebrada `/mente/timer-foco`

**Arquivo:** `web/src/app/(app)/mente/timer-foco/page.tsx` (criar se não existir)

A rota `/mente/timer-foco` retorna 404. Criar um redirect:

```tsx
// web/src/app/(app)/mente/timer-foco/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TimerFocoRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/mente?tab=timer') }, [router])
  return null
}
```

---

### 3.9 — Patrimônio/Carteira — KPIs em grid 2×2

**Arquivo:** `web/src/app/(app)/patrimonio/carteira/page.tsx`

Os KPI cards aparecem em coluna única. Adicionar grid 2×2 em mobile:

```tsx
// Onde os KPI cards estão
<div className="grid grid-cols-4 gap-3 max-sm:grid-cols-2">
  {/* KpiCard components */}
</div>
```

---

### 3.10 — FAB duplicado no Tempo

**Arquivo:** `web/src/app/(app)/tempo/page.tsx`

Remover um dos dois botões de "novo evento" (FAB flutuante OU botão no header, manter apenas um). Em mobile, manter apenas o FAB flutuante (`fixed bottom-[calc(var(--mob-bottom-nav-height)+16px)] right-4`). Em desktop, manter o botão no header.

---

## PARTE 4 — ORÇAMENTO CARD MOBILE

### 4.1 — Widget de Orçamentos (Dashboard) e Finanças/Orçamentos

**Problema:** Nomes longos como "Contas e Serviços" quebram para 2 linhas.

**Solução:** Em mobile, usar layout compacto em linha única:

```
Antes (2 linhas):
[🏠 Moradia          R$ 1.200 / R$ 1.500 ]
[████████████░░░░░░░  80%                ]

Depois mobile (1 linha + barra):
[🏠 Moradia (truncate)      R$ 1.200  80%]
[████████████░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

Implementar com `flex items-center justify-between` + `truncate` no nome da categoria + `shrink-0` nos valores numéricos.

---

## PARTE 5 — CONFIGURAÇÕES MOBILE

### 5.1 — Sub-tabs de configurações com scroll

As abas de Configurações (Perfil / Aparência / Modo de Uso / Notificações / Categorias / Plano / Integrações) devem usar o `ScrollTabs` criado no item 2.3.

**Arquivo:** `web/src/app/(app)/configuracoes/layout.tsx`

Cor do módulo para as tabs de configurações: `var(--sl-t2)` (neutro, sem cor de módulo).

---

## PARTE 6 — AVATAR / PERFIL MOBILE

### 6.1 — Avatar no MobileHeader

O círculo de iniciais no `MobileHeader` (canto direito) deve:
- Ter `cursor-pointer`
- Ao tocar: navegar para `/configuracoes/perfil`
- Adicionar `title="Meu perfil"` para acessibilidade
- Tamanho: 32×32px, `rounded-full`

---

## PARTE 7 — PADDING E SAFE AREAS

### 7.1 — Adicionar safe area no bottom nav

O bottom navigation deve respeitar o notch inferior do iPhone:

```tsx
<nav 
  className="fixed bottom-0 left-0 right-0 lg:hidden"
  style={{ paddingBottom: 'var(--mob-safe-bottom)' }}
>
```

### 7.2 — Page content com padding correto

O conteúdo de página em mobile deve ter padding-bottom para não ficar atrás do bottom nav:

```tsx
// No layout mobile das páginas
<main className="pb-[calc(var(--mob-bottom-nav-height)+var(--mob-safe-bottom)+8px)] lg:pb-0">
```

---

## PARTE 8 — CRITÉRIOS DE ACEITE E TESTES

### 8.1 — Checklist de validação por componente

Após cada sprint de implementação, validar:

**MobileHeader:**
- [ ] Exibe corretamente em 375px (iPhone SE) sem overflow
- [ ] Exibe corretamente em 390px (iPhone 14 Pro) sem overflow
- [ ] Linha 2 aparece apenas no modo Jornada
- [ ] Breadcrumb não trunca o módulo, trunca a página se necessário
- [ ] Todos os 4 modos funcionam: Foco Dark, Jornada Dark, Foco Light, Jornada Light

**MobileModulePicker:**
- [ ] Abre e fecha corretamente (swipe + botão + overlay)
- [ ] Módulo ativo tem destaque visual correto
- [ ] Navegação fecha o drawer
- [ ] Grid 3 colunas não quebra em 320px

**ScrollTabs:**
- [ ] Todas as abas acessíveis via scroll
- [ ] Fade indicator aparece quando há overflow
- [ ] Aba ativa centralizada ao montar
- [ ] Funciona nos 8 módulos com suas respectivas cores

**Agenda Mobile:**
- [ ] View diária padrão em mobile
- [ ] Scroll horizontal de dias funciona
- [ ] View semanal acessível via botão

**Dashboard:**
- [ ] Life Sync Score sem overflow em 375px
- [ ] KPI cards valores completos sem truncamento

### 8.2 — Viewports a testar

| Dispositivo | Largura | Prioridade |
|---|---|---|
| iPhone SE (3ª gen) | 375px | Alta |
| iPhone 14 Pro | 390px | Alta |
| Samsung Galaxy S23 | 360px | Alta |
| iPad Mini | 768px | Média |
| iPhone 14 Pro Max | 430px | Média |

### 8.3 — Testar os 4 modos em cada tela

Após implementar qualquer componente mobile, verificar nas 4 combinações:
1. Dark + Foco
2. Dark + Jornada
3. Light + Foco
4. Light + Jornada

---

## PARTE 9 — ORDEM DE EXECUÇÃO RECOMENDADA

Execute nesta ordem para desbloquear dependências:

**Sprint 1 — Bloqueador (deve ser primeiro):**
1. `globals.css` — adicionar tokens mobile (item 1.1 e 1.2)
2. `MobileHeader.tsx` — criar componente (item 2.1)
3. `MobileModulePicker.tsx` — criar componente (item 2.2)
4. `AppShell.tsx` — renderização condicional (item 3.1)
5. Bottom Nav — comportamento do "Mais" (item 3.2)
6. Safe areas (item 7.1 e 7.2)

**Sprint 2 — Navegação e KPIs:**
7. `ScrollTabs.tsx` — criar componente (item 2.3)
8. Todos os layouts de módulo — substituir tabs (item 3.4)
9. `KpiCard.tsx` — tornar responsivo (item 2.4)
10. Dashboard Life Sync Score (item 3.3)

**Sprint 3 — Módulos específicos:**
11. Finanças/Transações — filtros (item 3.5)
12. Tempo — agenda semanal mobile (item 3.6)
13. Subpages — remover títulos duplicados (item 3.7)
14. Orçamento card compacto (item 4.1)

**Sprint 4 — Polimento:**
15. Corrigir rota 404 do timer (item 3.8)
16. Patrimônio/Carteira grid (item 3.9)
17. FAB duplicado no Tempo (item 3.10)
18. Configurações scroll tabs (item 5.1)
19. Avatar com link de perfil (item 6.1)

---

## PARTE 10 — REGRAS ABSOLUTAS DE IMPLEMENTAÇÃO

1. **NUNCA** usar `@media` diretamente em CSS — somente classes Tailwind `max-lg:` e `max-sm:`
2. **NUNCA** alterar componentes desktop existentes — adicionar apenas classes responsivas
3. **NUNCA** hardcodar cores — usar `var(--sl-*)` e `var(--mod-*)` sempre
4. **NUNCA** quebrar tipagem TypeScript — todas as props devem ser tipadas com `interface`
5. **SEMPRE** usar `'use client'` quando usar `useState`, `useEffect`, `useRouter`
6. **SEMPRE** testar nos 4 modos (Foco Dark, Foco Light, Jornada Dark, Jornada Light)
7. **SEMPRE** respeitar safe areas com `env(safe-area-inset-*)`
8. **SEMPRE** usar `min-w-0` em flex containers com texto truncado
9. Breakpoints: `max-lg:` = `< 1024px` (mobile + tablet) | `max-sm:` = `< 640px` (mobile apenas)
10. Fontes: Syne para títulos/display, DM Mono para valores monetários, DM Sans para corpo

---

## REFERÊNCIAS DE PROTÓTIPOS

Os seguintes arquivos HTML foram criados como referência visual do design mobile aprovado. Use-os como guia visual para implementação:

- `proto-mobile-auth-config.html` — Auth, Onboarding, Configurações mobile
- `proto-mobile-financas-futuro-tempo.html` — Finanças, Futuro, Tempo mobile
- `proto-mobile-corpo.html` — Módulo Corpo mobile (5 telas)
- `proto-mobile-mente.html` — Módulo Mente mobile (5 telas)
- `proto-mobile-patrimonio.html` — Módulo Patrimônio mobile (5 telas)
- `proto-mobile-carreira.html` — Módulo Carreira mobile (4 telas)
- `proto-mobile-experiencias.html` — Módulo Experiências mobile (4 telas)

Padrões visuais a respeitar dos protótipos:
- Phone frame: 375×812px como referência base
- Bottom nav com 5 itens + drawer "Mais" em grid 3×3
- KPI cards: grid 2×2, padding compacto, fonte menor
- Listas: `min-height: 52px` por item, ícone 36×36px com `border-radius: 9px`
- Badges de status: `border-radius: 20px`, `font-size: 10px`, `font-weight: 700`
- Progress bars: `height: 6px`, `border-radius: 3px`
- Cards: `border-radius: 14px`, `border: 1px solid var(--sl-border)`

---

## RESUMO DO IMPACTO ESPERADO

| Problema | Severidade | Sprint | Resolução |
|---|---|---|---|
| Header quebrado em 100% das telas | 🔴 Crítico | 1 | MobileHeader novo |
| Sub-tabs com itens ocultos | 🔴 Crítico | 2 | ScrollTabs universal |
| Life Sync Score overflow | 🔴 Crítico | 2 | Layout vertical mobile |
| KPI cards com valores cortados | 🟠 Grave | 2 | KpiCard responsivo |
| Módulos ocultos no "Mais" | 🟠 Grave | 1 | MobileModulePicker grid |
| Agenda semanal ilegível | 🟠 Grave | 3 | View diária mobile |
| Títulos duplicados | 🟠 Grave | 3 | max-sm:hidden |
| Filtros ocupam muito espaço | 🟠 Grave | 3 | Filtros colapsáveis |
| Patrimônio KPIs em coluna | 🟡 Moderado | 4 | Grid 2×2 |
| Orçamento nome quebra | 🟡 Moderado | 3 | Linha compacta |
| Config abas cortadas | 🟡 Moderado | 4 | ScrollTabs |
| FAB duplicado | 🟡 Moderado | 4 | Remover duplicata |
| Rota 404 timer | 🟢 Leve | 4 | Redirect |
| Tema/modo escondido | 🟢 Leve | 1 | MobileModulePicker |
| Avatar sem feedback | 🟢 Leve | 4 | Link + cursor |

---

*Documento criado em: 01/03/2026*  
*Versão: 1.0*  
*Auditoria base: docs/mobile-v4/AUDITORIA-MOBILE.md*  
*Protótipos de referência: 7 arquivos HTML mobile aprovados*  
*Contexto técnico: Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui*
