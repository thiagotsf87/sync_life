# Plano de Implementação Mobile — SyncLife
**Versão:** 1.0
**Data:** 01/03/2026
**Branch base:** `homologacao`
**Objetivo:** Adaptar todos os módulos web para experiência mobile-first sem alterar nenhum layout desktop.

---

## ÍNDICE

1. [Princípio Fundamental](#1-princípio-fundamental)
2. [Regras de Processo — Obrigatórias](#2-regras-de-processo--obrigatórias)
3. [Compatibilidade com Temas e Modos](#3-compatibilidade-com-temas-e-modos)
4. [Checklist Universal de Qualidade](#4-checklist-universal-de-qualidade)
5. [Regras Absolutas de Código](#5-regras-absolutas-de-código)
6. [Sprint 1 — Fundação Shell Mobile](#6-sprint-1--fundação-shell-mobile)
7. [Sprint 2 — Navegação e KPIs Globais](#7-sprint-2--navegação-e-kpis-globais)
8. [Sprint 3 — Auth Mobile](#8-sprint-3--auth-mobile)
9. [Sprint 4 — Módulo Finanças](#9-sprint-4--módulo-finanças)
10. [Sprint 5 — Módulos Futuro e Tempo](#10-sprint-5--módulos-futuro-e-tempo)
11. [Sprint 6 — Módulos Corpo, Mente e Patrimônio](#11-sprint-6--módulos-corpo-mente-e-patrimônio)
12. [Sprint 7 — Módulos Carreira e Experiências](#12-sprint-7--módulos-carreira-e-experiências)
13. [Sprint 8 — Polimento Final](#13-sprint-8--polimento-final)
14. [Referências Visuais](#14-referências-visuais)
15. [Escopo Total](#15-escopo-total)

---

## 1. PRINCÍPIO FUNDAMENTAL

**O layout desktop (≥ 1024px) NÃO pode sofrer nenhuma alteração.**

Toda implementação mobile é **puramente aditiva**: novos componentes, classes responsivas adicionadas, nenhuma linha de código desktop removida ou alterada. O código mobile e o código desktop coexistem no mesmo arquivo, separados exclusivamente por breakpoints Tailwind.

---

## 2. REGRAS DE PROCESSO — OBRIGATÓRIAS

Estas regras se aplicam a **cada sprint individualmente**, sem exceção. Não há flexibilidade neste fluxo.

### 2.1 Antes de iniciar qualquer sprint

```bash
# 1. Garantir que está na branch base correta
git checkout homologacao
git pull origin homologacao

# 2. Criar branch dedicada para o sprint
git checkout -b mobile/sprint-N-nome-do-sprint

# Exemplos:
# git checkout -b mobile/sprint-1-shell-foundation
# git checkout -b mobile/sprint-2-navigation-kpis
# git checkout -b mobile/sprint-3-auth
```

> **NUNCA** implementar diretamente em `homologacao`, `main`, ou em uma branch de sprint anterior.

### 2.2 Durante a implementação

- Commits intermediários são permitidos e encorajados durante o desenvolvimento
- Mensagem de commit intermediário: `wip(mobile): [descrição curta]`
- Nunca fazer push de código com erros TypeScript (`tsc --noEmit` deve passar)

### 2.3 Critérios de conclusão (antes do commit final)

Antes de dar o sprint como concluído e fazer o commit final, **todos os itens abaixo devem estar verificados**:

#### Testes funcionais obrigatórios

**A — Compatibilidade com os 12 temas**

Testar cada tela implementada nos seguintes temas (abrir o app, trocar o tema, verificar visualmente):

| Tema | Tipo | Esquema |
|------|------|---------|
| `navy-dark` | FREE | Dark |
| `clean-light` | FREE | Light |
| `mint-garden` | FREE | Light |
| `obsidian` | PRO | Dark |
| `rosewood` | PRO | Dark |
| `arctic` | PRO | Light |
| `graphite` | PRO | Dark |
| `twilight` | PRO | Dark |
| `sahara` | PRO | Light |
| `carbon` | PRO | Dark |
| `blossom` | PRO | Light |
| `serenity` | PRO | Light |

**Verificar em cada tema:**
- [ ] Texto legível com contraste adequado
- [ ] Bordas visíveis (não some com o fundo)
- [ ] Cards com separação visual clara
- [ ] Cores de acento (`--sl-accent`) aplicadas corretamente
- [ ] Sem cores hardcoded visíveis (nenhum `#07112b` ou `#ffffff` literal)

**B — Compatibilidade com os 2 modos**

Testar cada tela nos dois modos (`data-mode="foco"` e `data-mode="jornada"`):

| Verificação | Foco | Jornada |
|-------------|------|---------|
| Elementos `.jornada-only` ocultos/visíveis | Ocultos ✓ | Visíveis ✓ |
| Elementos `.foco-only` ocultos/visíveis | Visíveis ✓ | Ocultos ✓ |
| Animações `sl-fade-up` | Desativadas | Ativadas |
| Insight de IA (quando presente) | Oculto | Visível |
| Tom da saudação (MobileHeader) | Neutro | Personalizado |

**C — Compatibilidade com viewports mobile**

| Dispositivo | Largura | Prioridade |
|-------------|---------|------------|
| iPhone SE (3ª gen) | 375px | Alta — testar primeiro |
| Samsung Galaxy S23 | 360px | Alta |
| iPhone 14 Pro | 390px | Alta |
| iPhone 14 Pro Max | 430px | Média |
| iPad Mini | 768px | Média |

**D — Verificações de layout**

- [ ] Nenhum elemento com overflow horizontal (sem scroll lateral indesejado)
- [ ] Touch targets com mínimo 44×44px
- [ ] Conteúdo não fica atrás da bottom navigation (padding-bottom correto)
- [ ] Conteúdo não fica atrás do MobileHeader (padding-top correto)
- [ ] Safe areas do iPhone respeitadas (`env(safe-area-inset-*)`)
- [ ] Valores monetários e % em `font-[DM_Mono]` — nunca truncados
- [ ] Sem scroll horizontal na página

**E — Verificações técnicas**

```bash
# Sem erros TypeScript
npx tsc --noEmit

# Sem console.log ou any em produção
# (verificar manualmente nos arquivos modificados)
```

**F — Validação Web Desktop (regressão visual — obrigatória antes do commit final)**

Para cada arquivo modificado no sprint, abrir o módulo correspondente no browser em viewport **≥ 1024px** e confirmar que o layout desktop está **idêntico ao estado anterior ao sprint**. Nenhum pixel de layout desktop pode ter mudado.

**O que verificar no desktop para cada módulo do sprint:**

| O que validar | Como verificar |
|---------------|----------------|
| Layout geral da tela | Não houve deslocamento de elementos, grids ou colunas |
| Sidebar e ModuleBar | Continuam visíveis e com larguras corretas |
| TopHeader | Não foi afetado (breadcrumb, pills, sino intactos) |
| Cards e KPIs | Padding, tamanho de fonte e espaçamentos preservados |
| Gráficos (Recharts) | Sem redimensionamento inesperado |
| Modais e drawers | Continuam abrindo e fechando corretamente |
| Animações `sl-fade-up` | Continuam funcionando no modo Jornada |
| Scroll da página | Sem scroll horizontal introduzido |

**Roteiro de validação por sprint:**

| Sprint | Módulos/telas a validar no desktop (≥ 1024px) |
|--------|-----------------------------------------------|
| **1 — Shell** | Todas as telas — TopHeader, ModuleBar, Sidebar intactos em todos os módulos |
| **2 — Nav + KPIs** | Dashboard Home + todos os layouts de módulo (abas de navegação) |
| **3 — Auth** | `/login`, `/cadastro`, `/recuperar-senha` em viewport wide |
| **4 — Finanças** | `/financas`, `/financas/transacoes`, `/financas/orcamentos`, `/financas/recorrentes`, `/financas/calendario`, `/financas/relatorios` |
| **5 — Futuro + Tempo** | `/futuro`, `/futuro/[id]`, `/futuro/nova`, `/tempo`, `/tempo/novo` |
| **6 — Corpo + Mente + Patrimônio** | Todas as sub-telas dos 3 módulos |
| **7 — Carreira + Experiências** | Todas as sub-telas dos 2 módulos |
| **8 — Polimento** | `/configuracoes` (todas as abas) + `/conquistas` |

**Critério de aprovação:** Se qualquer elemento do layout desktop diferir do estado antes do sprint (mesmo que sutilmente), o sprint **não pode ser commitado**. Identificar a classe responsiva que causou o impacto, corrigir com escopo `max-lg:` e re-validar.

> **Dica de verificação rápida:** Redimensionar o browser de 375px → 1280px enquanto observa a página. A transição deve ser suave e o layout desktop deve ser exatamente igual ao estado anterior em 1280px.

### 2.4 Commit final do sprint

Somente após **100% do checklist verificado e todos os bugs corrigidos**:

```bash
git add [arquivos específicos do sprint]
git commit -m "feat(mobile): sprint N — [descrição do que foi implementado]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin mobile/sprint-N-nome-do-sprint
```

### 2.5 Passagem para o próximo sprint

Após o commit final do sprint N:
1. Fazer merge da branch `mobile/sprint-N-*` em `homologacao` (via PR ou merge local)
2. Verificar que `homologacao` está funcionando corretamente no desktop após o merge
3. Somente então criar a branch `mobile/sprint-(N+1)-*` e iniciar o próximo sprint

---

## 3. COMPATIBILIDADE COM TEMAS E MODOS

### 3.1 Como os temas funcionam

O sistema de temas usa atributos no `<html>`:
- `data-theme="navy-dark"` — define o tema ativo (aplica vars CSS)
- `data-scheme="dark"` — define se é dark ou light (para `color-scheme`)
- `data-mode="foco"` ou `data-mode="jornada"` — define o modo ativo

Todos os tokens de cor mudam via CSS variables. **Nenhum componente mobile pode usar cores hardcoded.**

### 3.2 Tokens que todo componente mobile DEVE usar

```css
/* Fundos */
bg-[var(--sl-bg)]          /* Fundo da página */
bg-[var(--sl-s1)]          /* Card nível 1 (mais claro que bg) */
bg-[var(--sl-s2)]          /* Card nível 2 / inputs */
bg-[var(--sl-s3)]          /* Bordas sólidas / fundos de pill inativo */

/* Textos */
text-[var(--sl-t1)]        /* Texto primário */
text-[var(--sl-t2)]        /* Texto secundário */
text-[var(--sl-t3)]        /* Texto terciário / labels */

/* Bordas */
border-[var(--sl-border)]  /* Borda padrão */
border-[var(--sl-border-h)] /* Borda hover */

/* Acento (muda por tema — não é sempre verde!) */
text-[var(--sl-accent)]    /* Cor de acento do tema ativo */
bg-[var(--sl-accent)]      /* Fundo de acento */

/* Módulos (sempre fixos, não mudam por tema) */
--color-fin: #10b981   /* Finanças */
--color-tmp: #06b6d4   /* Tempo */
--color-fut: #8b5cf6   /* Futuro */
--color-crp: #f97316   /* Corpo */
--color-mnt: #eab308   /* Mente */
--color-ptr: #3b82f6   /* Patrimônio */
--color-car: #f43f5e   /* Carreira */
--color-exp: #ec4899   /* Experiências */
```

> **ATENÇÃO:** `--sl-accent` varia por tema (verde no navy-dark, dourado no obsidian, teal no carbon, etc.). Não assuma que o acento é sempre `#10b981`.

### 3.3 Visibilidade por modo

```tsx
// Visível APENAS no modo Foco
<div className="foco-only">...</div>

// Visível APENAS no modo Jornada
<div className="jornada-only">...</div>

// Alternativa com Tailwind (v2 compat):
<div className="[.jornada_&]:hidden">...</div>   // some no Jornada
<div className="hidden [.jornada_&]:block">...</div>  // aparece no Jornada
```

### 3.4 Verificação de tema em componente — exemplo correto

```tsx
// ✅ Correto — adapta a qualquer tema
<div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
  <p className="text-[var(--sl-t3)] text-[10px] font-bold uppercase tracking-widest">
    Saldo
  </p>
  <p className="font-[DM_Mono] text-xl text-[var(--sl-t1)]">
    R$ 1.800
  </p>
</div>

// ❌ Errado — hardcoded, quebra em outros temas
<div className="bg-[#07112b] border border-white/10 rounded-2xl p-4">
  <p className="text-[#2e4a6e] text-[10px]">Saldo</p>
  <p className="text-white">R$ 1.800</p>
</div>
```

---

## 4. CHECKLIST UNIVERSAL DE QUALIDADE

Aplicar em **toda** tela ou componente implementado, sem exceção:

```
LAYOUT
[ ] Funciona em 375px sem overflow horizontal
[ ] Funciona em 390px sem overflow horizontal
[ ] Funciona em 360px sem overflow horizontal
[ ] Conteúdo não fica atrás da bottom nav (padding-bottom)
[ ] Conteúdo não fica atrás do MobileHeader (padding-top)

TEMAS (12 temas)
[ ] navy-dark — texto legível, bordas visíveis
[ ] clean-light — texto legível, bordas visíveis
[ ] mint-garden — texto legível, bordas visíveis
[ ] obsidian — acento dourado aplicado corretamente
[ ] carbon — acento teal aplicado corretamente
[ ] [demais 7 temas PRO] — sem cores quebradas

MODOS
[ ] Foco: elementos .jornada-only ocultos
[ ] Jornada: elementos .foco-only ocultos
[ ] MobileHeader linha 2 (saudação) aparece só no Jornada

DESKTOP
[ ] Layout desktop (≥1024px) idêntico ao estado anterior
[ ] Nenhuma classe desktop foi removida ou alterada

COMPONENTES
[ ] Touch targets ≥ 44×44px
[ ] Valores monetários em font-[DM_Mono]
[ ] Títulos em font-[Syne] font-extrabold
[ ] Sem hardcode de cores (#hex direto)
[ ] Sem console.log
[ ] Sem TypeScript errors (tsc --noEmit)
```

---

## 5. REGRAS ABSOLUTAS DE CÓDIGO

1. **Breakpoints:** `max-lg:` = < 1024px (mobile + tablet) | `max-sm:` = < 640px (mobile apenas)
2. **NUNCA** usar `@media` diretamente no CSS — somente classes Tailwind `max-lg:` e `max-sm:`
3. **NUNCA** alterar componentes desktop existentes — apenas adicionar classes responsivas
4. **NUNCA** hardcodar cores — usar `var(--sl-*)` e `var(--color-*)` sempre
5. **NUNCA** usar `Math.random()` fora de `useEffect/useState` — causa erro de hidratação SSR
6. **SEMPRE** usar `'use client'` quando usar `useState`, `useEffect`, `useRouter`
7. **SEMPRE** respeitar safe areas: `env(safe-area-inset-bottom)`, `env(safe-area-inset-top)`
8. **SEMPRE** usar `min-w-0` em flex containers que contêm texto truncado
9. **SEMPRE** tipar props com `interface` — sem `any` em produção
10. **SEMPRE** testar nos 12 temas e 2 modos antes de commitar

---

## 6. SPRINT 1 — Fundação Shell Mobile

**Branch:** `mobile/sprint-1-shell-foundation`
**Prioridade:** Bloqueador de todos os outros sprints
**Protótipos de referência:** `proto-mobile-synclife.html`, `proto-mobile-grupo1-auth-financas.html`

> Este sprint resolve os 3 problemas críticos identificados na auditoria: header quebrado em 100% das telas, módulos inacessíveis via "Mais" e conteúdo atrás da bottom nav.

### 6.1 Tokens CSS mobile
**Arquivo:** `web/src/app/globals.css`

Adicionar ao final do arquivo, após todos os tokens de tema existentes:

```css
/* ═══════════════════════════════════════════════════════════
   TOKENS MOBILE — SyncLife Design System v2.0
   REGRA: Usados APENAS em contexto mobile (< 1024px).
   Nunca remover ou alterar tokens desktop existentes.
═══════════════════════════════════════════════════════════ */
:root {
  --mob-bottom-nav-height: 68px;
  --mob-header-height-foco: 52px;
  --mob-header-height-jornada: 88px;
  --mob-safe-bottom: env(safe-area-inset-bottom, 0px);
  --mob-safe-top: env(safe-area-inset-top, 0px);
  --mob-page-x: 16px;
  --mob-card-p: 14px;
  --mob-section-gap: 12px;
  --mob-item-h: 52px;
  --mob-tap-min: 44px;
  --mob-kpi-value: 18px;
  --mob-kpi-label: 10px;
  --mob-card-title: 13px;
  --mob-body: 13px;
  --mob-caption: 11px;
  --mob-tabs-h: 40px;
  --mob-tab-fade-width: 40px;
}
```

### 6.2 `MobileHeader.tsx` — novo componente
**Arquivo:** `web/src/components/shell/MobileHeader.tsx`

```
MODO FOCO (altura: 52px):
┌─────────────────────────────────────────────────────┐
│ [☰]  [ícone módulo] Módulo > Página        [🔔] [👤] │
└─────────────────────────────────────────────────────┘

MODO JORNADA (altura: 88px):
┌─────────────────────────────────────────────────────┐
│ [☰]  [ícone módulo] Módulo > Página        [🔔] [👤] │
│      ☀️ Bom dia, Thiago!         [Foco | Jornada ✨] │
└─────────────────────────────────────────────────────┘
```

**Requisitos:**
- `sticky top-0 z-40`
- `bg-[var(--sl-s1)] border-b border-[var(--sl-border)]`
- Saudação por horário: `☀️ Bom dia` (6h–12h) / `🌅 Boa tarde` (12h–18h) / `🌙 Boa noite` (18h–6h)
- Botão `☰` → abre `MobileModulePicker`
- Ícone de notificação → link `/configuracoes/notificacoes`
- Avatar com iniciais → link `/configuracoes/perfil`
- Pills Foco/Jornada na linha 2 (Jornada = gate PRO)
- Linha 2 visível apenas com `data-mode="jornada"`

```typescript
interface MobileHeaderProps {
  moduleName: string      // Ex: "Finanças"
  pageTitle: string       // Ex: "Transações"
  moduleColor: string     // Ex: "var(--color-fin)"
  moduleIcon: React.ReactNode
}
```

### 6.3 `MobileModulePicker.tsx` — novo componente
**Arquivo:** `web/src/components/shell/MobileModulePicker.tsx`

```
┌────────────────────────────────────┐
│  ⚡ SyncLife             [✕ fechar]│
│                                    │
│  MÓDULOS                           │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  💰  │ │  ⏳  │ │  🔮  │       │
│  │Finan.│ │Tempo │ │Futuro│       │
│  └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  🏃  │ │  📚  │ │  📈  │       │
│  │Corpo │ │Mente │ │Patri.│       │
│  └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐                │
│  │  💼  │ │  ✈️  │               │
│  │Carr. │ │Expe. │                │
│  └──────┘ └──────┘                │
│  ─────────────────────────────    │
│  PREFERÊNCIAS                      │
│  [🎯 Foco] [✨ Jornada PRO]       │
│  [🎨 Tema ativo ▾]                │
│  ─────────────────────────────    │
│  [⚙️ Configurações] [🏆 Conquistas]│
└────────────────────────────────────┘
```

**Requisitos:**
- Drawer da esquerda: `85vw`, máx `320px`, `z-50`
- Overlay escuro no fundo: fechar ao clicar fora
- Grid 3 colunas para os módulos
- Módulo ativo: borda na cor do módulo + fundo suave (`rgba(--color-mod, 0.1)`)
- Toggle Foco/Jornada com gate PRO
- Fechar ao navegar ou pressionar `Escape`
- Usar `useRouter` para navegação

### 6.4 `AppShell.tsx` — renderização condicional
**Arquivo:** `web/src/components/shell/AppShell.tsx`

Adicionar renderização condicional — `TopHeader` **não é tocado**:

```tsx
{/* Desktop header — visível apenas ≥ 1024px */}
<div className="hidden lg:block">
  <TopHeader ... />
</div>

{/* Mobile header — visível apenas < 1024px */}
<div className="lg:hidden">
  <MobileHeader
    moduleName={currentModule.name}
    pageTitle={currentPage.title}
    moduleColor={currentModule.color}
    moduleIcon={<currentModule.icon />}
  />
</div>
```

### 6.5 BottomNav — atualizar comportamento do "Mais"
**Arquivo:** `web/src/components/shell/BottomNav.tsx`

- "Mais" passa a abrir `MobileModulePicker` (grid 3×3) em vez da lista vertical atual
- Quando o módulo ativo está no menu "Mais": ícone do "Mais" assume a cor do módulo + dot colorido

### 6.6 Safe areas e padding de página

**Bottom nav:**
```tsx
<nav
  className="fixed bottom-0 left-0 right-0 lg:hidden"
  style={{ paddingBottom: 'var(--mob-safe-bottom)' }}
>
```

**Conteúdo de página:**
```tsx
// No layout principal das páginas
<main className="pb-[calc(var(--mob-bottom-nav-height)+var(--mob-safe-bottom)+8px)] lg:pb-0">
```

### Testes do Sprint 1

- [ ] MobileHeader exibe corretamente em 375px, 390px e 360px sem overflow
- [ ] Linha 2 do MobileHeader aparece **apenas** no modo Jornada
- [ ] MobileModulePicker abre e fecha (swipe, botão ✕, overlay, Escape)
- [ ] Módulo ativo tem destaque visual correto
- [ ] Navegação pelo drawer fecha o drawer e muda de módulo
- [ ] Grid 3×3 não quebra em 320px
- [ ] Conteúdo das páginas não fica atrás da bottom nav em nenhum dos 12 temas
- [ ] TopHeader permanece idêntico no desktop (≥1024px) em todos os temas
- [ ] Toggle Foco/Jornada no MobileHeader funciona corretamente (muda `data-mode`)

---

## 7. SPRINT 2 — Navegação e KPIs Globais

**Branch:** `mobile/sprint-2-navigation-kpis`
**Prioridade:** Alta — afeta todos os módulos
**Protótipos de referência:** todos os módulos (tabs de navegação)

### 7.1 `ScrollTabs.tsx` — novo componente universal
**Arquivo:** `web/src/components/ui/scroll-tabs.tsx`

```
[Dashboard] [Transações] [Recorrentes] [Orçamentos ▷]
            ↑ aba ativa                 ↑ fade = mais itens
```

```typescript
interface ScrollTabsProps {
  tabs: { label: string; href: string; badge?: number }[]
  activeHref: string
  moduleColor: string   // cor do underline da aba ativa
  className?: string
}
```

**Requisitos:**
- `overflow-x: auto`, `scrollbar-width: none`, `-webkit-overflow-scrolling: touch`
- Fade mask direita: `mask-image: linear-gradient(to right, black 80%, transparent)` quando há overflow
- Scroll automático para centralizar aba ativa ao montar
- Aba ativa: underline `2px solid moduleColor`, texto `var(--sl-t1)`
- Aba inativa: texto `var(--sl-t3)`, sem underline
- Altura: `var(--mob-tabs-h)` = 40px
- Em desktop (`lg:`): usar o componente de tabs original do módulo (não substituir)

### 7.2 Aplicar `ScrollTabs` em todos os layouts de módulo
**Arquivos:**
- `web/src/app/(app)/financas/layout.tsx`
- `web/src/app/(app)/futuro/layout.tsx`
- `web/src/app/(app)/tempo/layout.tsx`
- `web/src/app/(app)/corpo/layout.tsx`
- `web/src/app/(app)/mente/layout.tsx`
- `web/src/app/(app)/patrimonio/layout.tsx`
- `web/src/app/(app)/carreira/layout.tsx`
- `web/src/app/(app)/experiencias/layout.tsx`
- `web/src/app/(app)/configuracoes/layout.tsx`

**Cores por módulo:**
```
financas:     var(--color-fin)  → #10b981
tempo:        var(--color-tmp)  → #06b6d4
futuro:       var(--color-fut)  → #8b5cf6
corpo:        var(--color-crp)  → #f97316
mente:        var(--color-mnt)  → #eab308
patrimonio:   var(--color-ptr)  → #3b82f6
carreira:     var(--color-car)  → #f43f5e
experiencias: var(--color-exp)  → #ec4899
configuracoes: var(--sl-t2)     → neutro
```

### 7.3 `KpiCard.tsx` — tornar responsivo
**Arquivo:** `web/src/components/ui/kpi-card.tsx`

Adicionar apenas classes responsivas — não alterar nada do estilo desktop:
- `p-5 max-sm:p-3`
- `text-xl max-sm:text-base` no valor (mantendo `font-[DM_Mono]`)
- `text-[11px] max-sm:text-[10px]` no label
- `gap-3 max-sm:gap-2`
- Adicionar `min-w-0 overflow-hidden` no container do valor

### 7.4 Dashboard Home — Life Sync Score mobile
**Arquivo:** `web/src/app/(app)/dashboard/page.tsx`

- `grid grid-cols-2 gap-6` → `grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-3`
- Score card: adicionar `max-sm:text-center`
- Botão "Ver análise completa": adicionar `max-sm:w-full`

### Testes do Sprint 2

- [ ] Todas as abas de módulo são acessíveis via scroll horizontal
- [ ] Fade indicator aparece quando há overflow nas tabs
- [ ] Aba ativa centralizada ao montar o componente
- [ ] Cores de underline corretas em cada módulo
- [ ] KPI cards com valores completos em 375px (sem truncamento)
- [ ] Grid do Life Sync Score empilha verticalmente em mobile
- [ ] Desktop de todos os módulos idêntico ao estado anterior

---

## 8. SPRINT 3 — Auth Mobile

**Branch:** `mobile/sprint-3-auth`
**Prioridade:** Alta — porta de entrada do app
**Protótipos de referência:** `proto-mobile-grupo1-auth-financas.html` (telas 01, 02, 03)

### 8.1 Login mobile
**Arquivo:** `web/src/app/(auth)/login/page.tsx`

- Logo em gradiente centralizado, com espaçamento correto em 375px
- Inputs com estado focused: borda `var(--sl-accent)`, sem borda padrão
- Botão "Entrar": `w-full`, gradiente `var(--sl-grad)`
- Botão Google: `w-full`, borda `var(--sl-border)`
- Link "Criar conta grátis" visível sem scroll em 375px
- Label dos inputs em uppercase, tamanho `11px`, cor `var(--sl-t3)`

### 8.2 Cadastro mobile
**Arquivo:** `web/src/app/(auth)/cadastro/page.tsx`

- 4 inputs empilhados com `gap-3`
- Password strength bar: 4 segmentos visuais
  - Vermelho: senha fraca (< 8 chars ou só letras)
  - Amarelo: senha média (letras + números)
  - Verde: senha forte (letras + números + símbolos)
- Disclaimer com links em `var(--sl-accent)`
- Formulário inteiro visível em 375px sem scroll (ou scroll suave)

### 8.3 Recuperação de senha mobile — 3 steps
**Arquivo:** `web/src/app/(auth)/recuperar-senha/page.tsx`

- Step dots no topo (3 círculos: done/active/pending)
- **Step 1:** Ícone + input email + botão "Enviar código"
- **Step 2:** 6 input boxes de código OTP (44×52px cada)
  - Borda `var(--sl-accent)` quando preenchido
  - Borda dashed `var(--sl-border)` quando vazio
  - Texto "Reenviar (54s)" com countdown
- **Step 3:** Input nova senha + input confirmar senha + botão "Redefinir"

### Testes do Sprint 3

- [ ] Login funciona em 375px sem nenhum elemento cortado ou atrás do teclado virtual
- [ ] Todos os inputs com touched state correto em todos os 12 temas
- [ ] Botões com contraste adequado em temas claros (arctic, blossom, sahara, serenity, clean-light, mint-garden)
- [ ] Password strength bar muda de cor corretamente
- [ ] Step dots do recovery refletem progresso corretamente
- [ ] Inputs OTP aceitam apenas números e avançam automaticamente para o próximo campo

---

## 9. SPRINT 4 — Módulo Finanças

**Branch:** `mobile/sprint-4-financas`
**Prioridade:** Alta — módulo mais usado
**Protótipos de referência:** `proto-mobile-grupo1-auth-financas.html` (telas 04–07) + `proto-mobile-financas-futuro-tempo.html` (telas 01–04)

### 9.1 Transações — filtros colapsáveis
**Arquivo:** `web/src/app/(app)/financas/transacoes/page.tsx`

- Mobile recolhido (padrão): `[Fev 2026 ◀▶]  [🔍 Buscar]  [Filtros ▾]`
- Mobile expandido (ao clicar): chips de tipo + dropdown categoria abaixo
- `useState(false)` para `filtersExpanded`
- Desktop (`lg:`): sempre expandido, comportamento atual inalterado

### 9.2 Orçamentos — envelopes compactos
**Arquivo:** `web/src/app/(app)/financas/orcamentos/page.tsx`

Layout de cada envelope em mobile:
```
[🏠 Moradia (truncate)          R$ 1.200  80%]
[████████████████░░░░░░░░░░░░░░░░░░░░░░░░]
```
- `flex items-center justify-between` + `truncate` no nome + `shrink-0` nos valores

### 9.3 Recorrentes mobile
**Arquivo:** `web/src/app/(app)/financas/recorrentes/page.tsx`

- Alert banner "⚠️ X vencimentos em Y dias" (`max-sm:`) quando vencimentos ≤ 3 dias
- Cada item da lista: `min-h-[var(--mob-item-h)]`
- Badge de próximo vencimento com `⚠️` e cor amarela quando ≤ 3 dias

### 9.4 Calendário Financeiro mobile
**Arquivo:** `web/src/app/(app)/financas/calendario/page.tsx`

- Grid 7×5 deve caber em 375px (verificar larguras das colunas com `w-[calc(100%/7)]`)
- Heatmap strip de intensidade de gastos: linha de 30 dias com cores gradientes
- Seções "HOJE" e "PRÓXIMOS EVENTOS" com cards compactos (`min-h-[var(--mob-item-h)]`)

### 9.5 Relatórios mobile
**Arquivo:** `web/src/app/(app)/financas/relatorios/page.tsx`

- Tabs de meses: usar `ScrollTabs` com scroll horizontal
- Bar chart: `ResponsiveContainer` do Recharts já deve funcionar — verificar min-height
- Grid de KPIs de resumo: `grid-cols-3` → `max-sm:grid-cols-1 gap-2`

### Testes do Sprint 4

- [ ] Filtros de transações colapsam e expandem corretamente
- [ ] Envelopes de orçamento em linha única sem quebra em 375px
- [ ] Alert de vencimentos aparece nos temas com fundo claro (legível)
- [ ] Grid do calendário cabe em 375px sem scroll horizontal
- [ ] Bar chart de relatórios redimensiona corretamente
- [ ] Valores monetários em DM Mono em todos os estados

---

## 10. SPRINT 5 — Módulos Futuro e Tempo

**Branch:** `mobile/sprint-5-futuro-tempo`
**Prioridade:** Alta — módulos de retenção
**Protótipos de referência:** `proto-mobile-financas-futuro-tempo.html` (telas 05–08)

### 10.1 Futuro — Detalhe de objetivo
**Arquivo:** `web/src/app/(app)/futuro/[id]/page.tsx`

- Hero ring progress: SVG 160×160px, gradiente `var(--sl-em)` → `var(--sl-el)`
- 2 KPI cards lado a lado: "Ritmo atual" (verde) vs "Necessário" (amarelo/vermelho)
- Lista de metas vinculadas: `min-h-[var(--mob-item-h)]` por item, barras + badges
- Timeline de marcos: dots com linhas verticais

### 10.2 Futuro — Wizard novo objetivo
**Arquivo:** `web/src/app/(app)/futuro/nova/page.tsx`

- Step bar com 5 dots (done ✓ verde / active gradiente / pending cinza)
- Linhas entre dots: verde se done, cinza se pending
- Input de valor em `font-[DM_Mono]` com cursor animado (`animate-pulse`)
- Card de projeção IA: ícone ✦, cálculo automático, fundo `var(--sl-em-g)`
- Botão "Próximo →": `w-full`, gradiente `var(--sl-grad)`

### 10.3 Tempo — Vista diária (padrão mobile)
**Arquivo:** `web/src/app/(app)/tempo/page.tsx`

- Mobile: view diária por padrão (`useState('day')`)
- Scroll horizontal de dias: `[DOM 2] [SEG 3] [TER 4●] [QUA 5]`
- Dot verde abaixo dos dias que têm eventos
- Botão `[📅 Vista mensal]` no topo para alternar
- Desktop: comportamento atual **inalterado**

### 10.4 Tempo — Vista mensal mobile
**Arquivo:** `web/src/app/(app)/tempo/page.tsx` (variante de estado)

- Grid 7×5 com legenda de cores por módulo (Tempo cyan, Corpo laranja, Mente amarelo, Carreira vermelho)
- Dia selecionado mostra events embaixo do calendário
- Event cards: hora (DM Mono) + barra colorida 3px + título + tag módulo

### 10.5 Tempo — Criar evento mobile
**Arquivo:** `web/src/app/(app)/tempo/novo/page.tsx`

- Header: `[Cancelar]  Novo evento  [Salvar em var(--color-tmp)]`
- Pills de módulo scrolláveis horizontalmente: `[Geral] [Corpo] [Mente] [Carreira] [Exp]`
- Campos: título (input focus automático), data + hora (side by side), localização, lembrete
- Toggle "Vincular ao financeiro": `bg-[var(--sl-s2)]`, com valor + categoria quando ativo

### 10.6 Corrigir rota 404 `/mente/timer-foco`
**Arquivo:** `web/src/app/(app)/mente/timer-foco/page.tsx` (criar)

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TimerFocoRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/mente?tab=timer') }, [router])
  return null
}
```

### Testes do Sprint 5

- [ ] Ring progress do detalhe de objetivo renderiza corretamente em todos os 12 temas
- [ ] Wizard de novo objetivo avança e volta entre steps sem perder dados
- [ ] View diária é o padrão em mobile, semanal no desktop
- [ ] Scroll horizontal de dias funciona sem scroll horizontal de página
- [ ] Criar evento fecha e redireciona para a agenda após salvar
- [ ] Rota `/mente/timer-foco` redireciona sem flash de 404

---

## 11. SPRINT 6 — Módulos Corpo, Mente e Patrimônio

**Branch:** `mobile/sprint-6-corpo-mente-patrimonio`
**Protótipos de referência:** `proto-mobile-corpo.html`, `proto-mobile-mente.html`, `proto-mobile-patrimonio.html`

### Corpo (5 telas)

| Arquivo | Adaptações mobile |
|---------|-------------------|
| `corpo/page.tsx` (dashboard) | KPI 2×2 (`max-sm:grid-cols-2`), ring de calorias redimensionado |
| `corpo/evolucao/page.tsx` | Sparkline de peso responsivo, medidas em grid 2×2 |
| `corpo/consultas/page.tsx` | Appointment cards: data/horário/custo em layout compacto |
| `corpo/atividades/page.tsx` | Week bar chart com `ResponsiveContainer`, activity list `min-h-[var(--mob-item-h)]` |
| `corpo/nutricao/page.tsx` | Donut SVG responsivo, macronutrientes em grid 2×2, refeições em lista |

### Mente (5 telas)

| Arquivo | Adaptações mobile |
|---------|-------------------|
| `mente/page.tsx` (dashboard) | KPI 2×2, streak heatmap 24 dias com células `min-w-[12px]` |
| `mente/trilhas/page.tsx` | Cards de trilha em coluna única com progress bars |
| `mente/timer/page.tsx` | SVG ring 200×200px centralizado, controls (undo/play/redo) em row, cycle dots |
| `mente/sessoes/page.tsx` | Timeline bar colorida por trilha, `min-h-[var(--mob-item-h)]` |
| `mente/biblioteca/page.tsx` | Resource cards em coluna única, gate PRO com CTA |

### Patrimônio (5 telas)

| Arquivo | Adaptações mobile |
|---------|-------------------|
| `patrimonio/page.tsx` (dashboard) | Net Worth hero centralizado, KPI 4 classes em 2×2 |
| `patrimonio/carteira/page.tsx` | KPIs em `grid-cols-2 max-sm:grid-cols-2`, asset rows sem truncamento |
| `patrimonio/proventos/page.tsx` | Bar chart responsivo, próximos pagamentos em lista |
| `patrimonio/evolucao/page.tsx` | Line chart responsivo, botões de período (6M/1A/3A/5A/Tudo) em scroll |
| `patrimonio/simulador/page.tsx` | Inputs com botões +/- 44px, resultado centralizado, tabela de cenários em coluna |

### Testes do Sprint 6

- [ ] Timer Pomodoro (Mente): SVG ring sem overflow em 375px, controles com touch target ≥ 44px
- [ ] Streak heatmap (Mente): células visíveis sem overflow horizontal
- [ ] Charts Recharts responsivos: sem overflow, sem texto cortado nos eixos
- [ ] Patrimônio/Carteira: KPIs em grid 2×2 em mobile
- [ ] Todos os list items com `min-h-[var(--mob-item-h)]` (52px)

---

## 12. SPRINT 7 — Módulos Carreira e Experiências

**Branch:** `mobile/sprint-7-carreira-experiencias`
**Protótipos de referência:** `proto-mobile-carreira.html`, `proto-mobile-experiencias.html`

### Carreira (4 telas)

| Arquivo | Adaptações mobile |
|---------|-------------------|
| `carreira/page.tsx` (dashboard) | Cargo hero centralizado, KPI 2×2, milestone card com checklist |
| `carreira/perfil/page.tsx` | Avatar + bio em coluna, timeline de experiências vertical |
| `carreira/roadmap/page.tsx` | Timeline vertical com pulsing dot no step atual (`animate-pulse`) |
| `carreira/habilidades/page.tsx` | Skill bars em coluna única, filtro por categoria scrollável |

### Experiências (4 telas)

| Arquivo | Adaptações mobile |
|---------|-------------------|
| `experiencias/page.tsx` (dashboard) | KPI 2×2, trip card hero com cover gradient |
| `experiencias/nova/page.tsx` | Wizard 5 steps: step indicator, mini calendar com range, botão `w-full` |
| `experiencias/viagens/[id]/page.tsx` | Day selector scroll horizontal, timeline de events por dia |
| `experiencias/viagens/[id]/orcamento/page.tsx` | Breakdown por categoria em coluna, toggle envelope automático |

### Testes do Sprint 7

- [ ] Roadmap timeline renderiza corretamente em 375px (sem overflow horizontal)
- [ ] Pulsing dot do step atual animado corretamente
- [ ] Mini calendar do wizard de viagem com range highlight em todos os temas
- [ ] Day selector scroll horizontal sem bloquear scroll vertical da página
- [ ] Skill bars com cores corretas por nível (vermelho/amarelo/verde)

---

## 13. SPRINT 8 — Polimento Final

**Branch:** `mobile/sprint-8-polimento`
**Prioridade:** Média — qualidade e acabamento

### 13.1 Configurações — ScrollTabs em todas as abas
**Arquivo:** `web/src/app/(app)/configuracoes/layout.tsx`

As 7 abas (Perfil, Aparência, Modo de Uso, Notificações, Categorias, Plano, Integrações) devem usar `ScrollTabs` com `moduleColor: var(--sl-t2)` (cor neutra).

### 13.2 Títulos H1 duplicados — remover em subpages
**Arquivos:** subpages onde o H1 repete o breadcrumb do MobileHeader

- Identificar todos os `<h1>` de subpage que duplicam a informação já exibida no breadcrumb
- Adicionar `max-lg:hidden` nesses H1
- Manter H1 visível no desktop (não remover, apenas ocultar)

### 13.3 FAB duplicado no Tempo
**Arquivo:** `web/src/app/(app)/tempo/page.tsx`

- Mobile (`max-lg:`): manter apenas o FAB flutuante em `fixed bottom-[calc(var(--mob-bottom-nav-height)+16px)] right-4`
- Desktop (`lg:`): manter apenas o botão no header
- Remover duplicata com classe de visibilidade

### 13.4 Avatar no MobileHeader com link de perfil

- Adicionar `cursor-pointer` no avatar circular de iniciais
- `title="Meu perfil"` para acessibilidade
- Tamanho: `w-8 h-8 rounded-full`
- Navegar para `/configuracoes/perfil` ao clicar

### 13.5 Conquistas mobile
**Arquivo:** `web/src/app/(app)/conquistas/page.tsx`

- Grid de badges: `grid-cols-3 max-sm:grid-cols-3` (já funciona em 375px com 3 colunas)
- Badge cards: `min-h-[var(--mob-tap-min)]`
- Modal de badge: `z-[60]`, full-width em mobile

### 13.6 Performance e acessibilidade

- Adicionar `prefers-reduced-motion` nas animações `sl-fade-up` do `globals.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .sl-fade-up { animation: none !important; }
  }
  ```
- Verificar `will-change: transform` nas animações de slide/drawer

### 13.7 Configurar Lighthouse CI no Vercel

No `vercel.json` ou no painel do projeto Vercel, configurar meta mínima de **90 em Performance mobile** antes de cada deploy para produção.

### Testes do Sprint 8

- [ ] Configurações: todas as 7 abas acessíveis por scroll horizontal em 375px
- [ ] Nenhum H1 duplicado visível em mobile (comparar com breadcrumb)
- [ ] Apenas 1 botão de novo evento no Tempo mobile
- [ ] Modal de conquistas não tem overflow e fecha corretamente
- [ ] `prefers-reduced-motion` desativa animações quando configurado no SO
- [ ] Lighthouse Performance mobile ≥ 90 em pelo menos 3 telas principais

---

## 14. REFERÊNCIAS VISUAIS

Os protótipos HTML abaixo são a **fonte da verdade visual** para toda implementação mobile. Comparar a implementação Next.js contra eles antes de cada commit final.

| Arquivo | Grupo | Telas | Módulos |
|---------|-------|-------|---------|
| `proto-mobile-grupo1-auth-financas.html` | 1/5 | 7 | Auth (3) + Finanças sub (4) |
| `proto-mobile-financas-futuro-tempo.html` | 2/5 | 8 | Finanças sub (4) + Futuro (2) + Tempo (2) |
| `proto-mobile-corpo.html` | 3/5 | 5 | Corpo completo |
| `proto-mobile-mente.html` | 3/5 | 5 | Mente completo |
| `proto-mobile-patrimonio.html` | 3/5 | 5 | Patrimônio completo |
| `proto-mobile-carreira.html` | 4/5 | 4 | Carreira completo |
| `proto-mobile-experiencias.html` | 4/5 | 4 | Experiências completo |
| `proto-mobile-synclife.html` | Geral | 12 | Home, Quick Entry, Life Score, Onboarding |

**Padrões visuais dos protótipos a respeitar:**
- Phone frame: 375×812px como referência base
- Bottom nav: altura 68px + safe area + FAB central 52px (posição -6px acima da nav)
- KPI cards: grid 2×2 em mobile, padding 14px, fonte menor
- List items: `min-height: 52px` por item, ícone `36×36px` com `border-radius: 9px`
- Badges de status: `border-radius: 20px`, `font-size: 10px`, `font-weight: 700`
- Progress bars: `height: 6px`, `border-radius: 3px`
- Cards: `border-radius: 14px`, `border: 1px solid var(--sl-border)`

---

## 15. ESCOPO TOTAL

### Resumo de sprints

| Sprint | Branch | Entrega | Impacto |
|--------|--------|---------|---------|
| **1 — Fundação Shell** | `mobile/sprint-1-shell-foundation` | MobileHeader + MobileModulePicker + AppShell condicional + Safe areas | Desbloqueia 100% das telas |
| **2 — Nav + KPIs** | `mobile/sprint-2-navigation-kpis` | ScrollTabs universal + KpiCard responsivo + Dashboard mobile | Remove overflow em todos os módulos |
| **3 — Auth** | `mobile/sprint-3-auth` | Login, cadastro, recuperação mobile | Porta de entrada funcional |
| **4 — Finanças** | `mobile/sprint-4-financas` | 5 sub-telas financeiras mobile | Módulo mais usado |
| **5 — Futuro + Tempo** | `mobile/sprint-5-futuro-tempo` | Objetivos, wizard, agenda diária, criar evento | Módulos de retenção |
| **6 — Corpo + Mente + Patrimônio** | `mobile/sprint-6-corpo-mente-patrimonio` | 15 telas de 3 módulos | Cobertura V3 |
| **7 — Carreira + Experiências** | `mobile/sprint-7-carreira-experiencias` | 8 telas de 2 módulos | Cobertura completa |
| **8 — Polimento** | `mobile/sprint-8-polimento` | Configurações, Conquistas, acessibilidade, CI | Produção ready |

### Contagem de telas

| Categoria | Telas |
|-----------|-------|
| Shell (componentes globais) | 3 componentes novos |
| Auth | 3 |
| Dashboard Home | 1 |
| Finanças (5 sub-telas) | 5 |
| Futuro | 3 |
| Tempo | 3 |
| Corpo | 5 |
| Mente | 5 |
| Patrimônio | 5 |
| Carreira | 4 |
| Experiências | 4 |
| Configurações (layout) | 1 |
| Conquistas | 1 |
| **Total** | **~43 telas + 3 componentes globais** |

### Premissas garantidas

- ✅ **Zero impacto no desktop** — todas as mudanças usam `max-lg:` ou `max-sm:`
- ✅ **12 temas suportados** — nenhum componente usa cores hardcoded
- ✅ **2 modos suportados** — Foco e Jornada com visibilidade condicional correta
- ✅ **Banco de dados inalterado** — nenhuma migração necessária para este plano
- ✅ **Branch por sprint** — rollback possível a qualquer momento
- ✅ **Commit só após testes** — qualidade garantida antes de avançar

---

*Documento gerado em: 01/03/2026*
*Base: 9 protótipos HTML aprovados + auditoria mobile de Março 2026*
*Stack: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase*
*Temas: 12 (3 FREE + 9 PRO) | Modos: 2 (Foco + Jornada)*
