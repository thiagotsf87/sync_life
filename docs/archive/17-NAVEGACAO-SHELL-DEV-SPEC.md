# 17 — NAVEGAÇÃO (SHELL DO APP): Especificação Completa para Desenvolvimento

**Documento de referência para implementação em Next.js**
**Protótipo aprovado:** `proto-navigation-v3.html`
**Dependências:** Nenhuma — este é o componente fundacional do SyncLife
**Prioridade:** Máxima — todas as telas dependem deste shell
**Fase:** 1.1 do roadmap MVP v2

---

## ÍNDICE

1. [Visão Geral e Contexto](#1-visão-geral-e-contexto)
2. [Stack Técnica e Dependências](#2-stack-técnica-e-dependências)
3. [Design System: Tokens Obrigatórios](#3-design-system-tokens-obrigatórios)
4. [Tipografia](#4-tipografia)
5. [Estrutura de Arquivos Next.js](#5-estrutura-de-arquivos-nextjs)
6. [Arquitetura do Shell — Visão Geral](#6-arquitetura-do-shell--visão-geral)
7. [Componente: Module Bar (Nível 1)](#7-componente-module-bar-nível-1)
8. [Componente: Sidebar (Nível 2)](#8-componente-sidebar-nível-2)
9. [Componente: Top Header (Nível 3)](#9-componente-top-header-nível-3)
10. [Componente: Mobile Bottom Bar](#10-componente-mobile-bottom-bar)
11. [Componente: Content Area](#11-componente-content-area)
12. [Sistema de Módulos — Dados e Roteamento](#12-sistema-de-módulos--dados-e-roteamento)
13. [Toggle de Modo (Foco/Jornada) + Gate PRO](#13-toggle-de-modo-focojornada--gate-pro)
14. [Toggle de Tema (Dark/Light)](#14-toggle-de-tema-darklight)
15. [Life Sync Score — Widget na Sidebar](#15-life-sync-score--widget-na-sidebar)
16. [Sistema de Tooltips](#16-sistema-de-tooltips)
17. [Sistema de Notificações (Sino)](#17-sistema-de-notificações-sino)
18. [Quatro Combinações Visuais](#18-quatro-combinações-visuais)
19. [Responsividade](#19-responsividade)
20. [Animações e Transições](#20-animações-e-transições)
21. [Acessibilidade](#21-acessibilidade)
22. [Performance](#22-performance)
23. [Testes Unitários](#23-testes-unitários)
24. [Atividades para o Claude Code](#24-atividades-para-o-claude-code)
25. [Benchmark e Diferenciais Competitivos](#25-benchmark-e-diferenciais-competitivos)

---

## 1. VISÃO GERAL E CONTEXTO

### O que é este documento

Este documento especifica o **shell do app** — a estrutura visual e funcional que envolve **todas** as telas do SyncLife. Pense no shell como a "moldura" de um quadro: o conteúdo muda conforme o módulo (Finanças, Metas, Agenda...), mas a moldura permanece constante. O shell é composto por quatro camadas:

1. **Module Bar** (Nível 1) — barra vertical esquerda com ícones de módulos
2. **Sidebar** (Nível 2) — painel lateral com sub-navegação do módulo ativo
3. **Top Header** (Nível 3) — barra superior com contexto, toggles e notificações
4. **Content Area** — a área central onde cada tela renderiza seu conteúdo

Adicionalmente, no mobile existe a **Bottom Bar** que substitui a Module Bar e a Sidebar.

### Por que este é o documento mais importante

Toda tela do SyncLife depende do shell. Se o shell for implementado com falhas — espaçamentos errados, estados inconsistentes, responsive quebrado — **todas as 15+ telas do MVP v2 herdam esses problemas**. Por isso, investir em uma implementação impecável do shell economiza semanas de retrabalho futuro.

### Escopo: o que está e o que NÃO está neste documento

**Está neste documento:**
- Toda a especificação visual, funcional e técnica do shell
- Module Bar, Sidebar, Top Header, Mobile Bottom Bar, Content Area
- Toggle de modo (Foco/Jornada), Toggle de tema (Dark/Light)
- Life Sync Score na sidebar (Modo Jornada)
- Sistema de tooltips da Module Bar
- Botão de notificações (sino) — apenas a aparência e o badge de contagem
- Sistema de roteamento e dados dos módulos
- Comportamento responsivo em todos os breakpoints

**NÃO está neste documento:**
- Conteúdo de nenhuma tela específica (Dashboard, Transações, etc.)
- Painel/drawer de notificações (será spec separada)
- Conteúdo real do Life Sync Score (cálculos e componentes detalhados)
- Tela de Configurações (será spec separada)

### Decisões de produto confirmadas

| Decisão | Definição | Impacto |
|---------|-----------|---------|
| Modo Jornada | **PRO-only** — usuários FREE ficam no Foco | Toggle de modo precisa de gate de paywall |
| Tema Dark/Light | **Livre para todos** — FREE e PRO | Toggle de tema sem restrições |
| Sidebar colapsada | **56px com ícones** no desktop, **0px** no mobile | Duas implementações CSS distintas |
| Conquistas | **Módulo separado** na Module Bar | Module Bar tem 6 botões (Home + 4 módulos + Conquistas) |

---

## 2. STACK TÉCNICA E DEPENDÊNCIAS

### Framework e Bibliotecas

| Tecnologia | Uso no Shell | Versão |
|------------|--------------|--------|
| **Next.js 16** (App Router) | Layout raiz `app/layout.tsx` com shell | 16.x |
| **React 19** | Componentes do shell (Client Components) | 19.x |
| **TypeScript** | Tipagem de módulos, estados, props | 5.x |
| **Tailwind CSS v4** | Estilização responsiva + tokens CSS | 4.x |
| **shadcn/ui** | Base para tooltips, dropdowns, sheets | latest |
| **Lucide React** | Ícones SVG inline | 0.263+ |
| **Supabase** | Persistência de preferências (modo, tema, sidebar) | latest |
| **Framer Motion** | Animações da sidebar, transições de modo (opcional) | 11.x |
| **Zustand** (ou Context API) | Estado global: módulo ativo, modo, tema, sidebar | 5.x |

### Por que essas escolhas

**Zustand vs Context API:** Para o estado do shell, Zustand é preferível ao Context API porque o shell tem múltiplos estados independentes (módulo ativo, modo, tema, sidebar aberta/fechada) que mudam com frequência. O Context API re-renderizaria todos os consumers a cada mudança de qualquer estado, enquanto o Zustand permite subscriptions granulares — a sidebar só re-renderiza quando `sidebarOpen` muda, não quando o `theme` muda. Isso é crítico porque o shell está presente em todas as páginas.

**Framer Motion:** Opcional, mas recomendado para as animações da sidebar (abertura/fechamento), transição entre modos e o fade-in do conteúdo. Sem ele, as transições ficam engessadas com CSS puro. Se a decisão for não usar Framer Motion, substituir por `transition` CSS com `cubic-bezier(.4,0,.2,1)`.

---

## 3. DESIGN SYSTEM: TOKENS OBRIGATÓRIOS

### 3.1 Tokens de Superfície (variam por tema)

O shell usa **todos** os tokens de superfície porque contém todos os níveis visuais do app.

```css
/* ═══ DARK FOCO (padrão) ═══ */
:root {
  --bg:        #03071a;   /* Background principal — page background */
  --s1:        #07112b;   /* Surface 1 — Module Bar, Sidebar, cards */
  --s2:        #0c1a3a;   /* Surface 2 — inputs, badges, hover interno */
  --s3:        #132248;   /* Surface 3 — hover states, separadores */
  --border:    rgba(255,255,255,0.06);  /* Bordas padrão */
  --border-h:  rgba(255,255,255,0.13);  /* Bordas em hover */
  --t1:        #dff0ff;   /* Texto primário — títulos, labels ativos */
  --t2:        #6e90b8;   /* Texto secundário — nav items, subtítulos */
  --t3:        #2e4a6e;   /* Texto terciário — placeholders, dicas */
}

/* ═══ DARK JORNADA ═══ */
body.jornada {
  --bg:        #020d08;   /* Verde-escuro profundo */
  --s1:        #061410;
  --s2:        #0b1e18;
  --s3:        #112b22;
  --border:    rgba(16,185,129,0.08);   /* Bordas com tint esmeralda */
  --border-h:  rgba(16,185,129,0.18);
  --t1:        #d6faf0;
  --t2:        #4da888;
  --t3:        #235c48;
}

/* ═══ LIGHT FOCO ═══ */
body.light {
  --bg:        #e6eef5;   /* Cinza-azulado claro */
  --s1:        #ffffff;
  --s2:        #f0f6fa;
  --s3:        #e0eaf3;
  --border:    rgba(3,7,26,0.09);
  --border-h:  rgba(3,7,26,0.18);
  --t1:        #03071a;
  --t2:        #1e3a5c;
  --t3:        #5a7a9e;
}

/* ═══ LIGHT JORNADA ═══ */
body.light.jornada {
  --bg:        #c8f0e4;   /* Mint saturado vibrante */
  --s1:        #ffffff;
  --s2:        #e0f7ef;
  --s3:        #c4eede;
  --border:    rgba(5,80,56,0.12);
  --border-h:  rgba(5,80,56,0.24);
  --t1:        #022016;
  --t2:        #0d5c3e;
  --t3:        #4da888;
}
```

### 3.2 Tokens de Brand e Módulos

```css
:root {
  /* ── Brand ── */
  --em:          #10b981;  /* Esmeralda — cor primária da marca, CTAs, sucesso */
  --em-glow:     rgba(16,185,129,0.16);
  --el:          #0055ff;  /* Electric Blue — cor secundária, links, dados */
  --el-glow:     rgba(0,85,255,0.16);

  /* ── Cores por módulo ── */
  --fin:         #10b981;  /* Finanças: Esmeralda */
  --fin-glow:    rgba(16,185,129,0.16);
  --meta:        #0055ff;  /* Metas: Azul Elétrico */
  --meta-glow:   rgba(0,85,255,0.16);
  --agenda:      #06b6d4;  /* Agenda: Ciano */
  --agenda-glow: rgba(6,182,212,0.16);
  --conq:        #f59e0b;  /* Conquistas: Amber */
  --conq-glow:   rgba(245,158,11,0.16);
  --cfg:         #64748b;  /* Configurações: Slate */
  --cfg-glow:    rgba(100,116,139,0.12);

  /* ── Cores funcionais ── */
  --green:       #10b981;  /* Positivo, receitas, sucesso */
  --yellow:      #f59e0b;  /* Atenção, aviso */
  --orange:      #f97316;  /* Quase no limite */
  --red:         #f43f5e;  /* Erro, despesas, ultrapassado */
}
```

### 3.3 Tokens de Layout (fixos — não variam por tema)

```css
:root {
  --module-bar-w:    58px;   /* Largura da Module Bar */
  --sb-open:         228px;  /* Sidebar expandida */
  --sb-collapsed:    56px;   /* Sidebar colapsada (só ícones) */
  --sb-closed:       0px;    /* Sidebar mobile (desaparece) */
  --header-h:        54px;   /* Altura do Top Header */
  --bottom-bar-h:    64px;   /* Altura da Bottom Bar mobile */
  --content-padding: 22px;   /* Padding interno da Content Area */
}
```

### 3.4 Tokens em Light (overrides que variam por tema para módulos)

```css
body.light {
  --fin-glow:    rgba(16,185,129,0.12);
  --meta-glow:   rgba(0,85,255,0.12);
  --agenda-glow: rgba(6,182,212,0.12);
  --conq-glow:   rgba(245,158,11,0.12);
  --cfg-glow:    rgba(100,116,139,0.10);
}
```

---

## 4. TIPOGRAFIA

O shell utiliza as três famílias de fontes do SyncLife:

| Família | Peso | Uso no Shell | Tamanho |
|---------|------|-------------|---------|
| **Syne** | 700–800 | Label do módulo no topo da sidebar, Life Sync Score número, page-title | 13px (sidebar), 32px (score), 22px (title) |
| **DM Sans** | 300–600 | Nav items, breadcrumb, greeting, mode/theme labels, badges, tooltips | 9–14px conforme contexto |
| **DM Mono** | 400–500 | Não usado diretamente no shell (usado no conteúdo das telas) | — |

### Carregamento via Next.js

```typescript
// app/fonts.ts
import { Syne, DM_Sans, DM_Mono } from 'next/font/google';

export const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});
```

---

## 5. ESTRUTURA DE ARQUIVOS NEXT.JS

```
src/
├── app/
│   ├── layout.tsx              ← Layout raiz: carrega fontes + providers
│   ├── (auth)/                 ← Grupo: páginas sem shell (login, cadastro)
│   │   ├── layout.tsx          ← Layout sem shell
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── esqueceu-senha/page.tsx
│   ├── (app)/                  ← Grupo: páginas COM shell
│   │   ├── layout.tsx          ← Layout com AppShell (Module Bar + Sidebar + Header)
│   │   ├── page.tsx            ← Home / Dashboard Unificado
│   │   ├── financas/
│   │   │   ├── page.tsx        ← Dashboard Financeiro
│   │   │   ├── transacoes/page.tsx
│   │   │   ├── recorrentes/page.tsx
│   │   │   ├── orcamentos/page.tsx
│   │   │   ├── calendario/page.tsx
│   │   │   ├── planejamento/page.tsx
│   │   │   └── relatorios/page.tsx
│   │   ├── metas/
│   │   │   ├── page.tsx        ← Minhas Metas
│   │   │   ├── nova/page.tsx
│   │   │   └── [id]/page.tsx   ← Detalhe da Meta
│   │   ├── agenda/
│   │   │   ├── page.tsx        ← Semanal (padrão)
│   │   │   └── mensal/page.tsx
│   │   ├── conquistas/
│   │   │   └── page.tsx        ← Tela de Conquistas
│   │   └── configuracoes/
│   │       └── page.tsx        ← Tela de Configurações
│   └── onboarding/
│       └── page.tsx            ← Onboarding (sem shell, tela cheia)
│
├── components/
│   ├── shell/                  ← TODOS os componentes deste documento
│   │   ├── AppShell.tsx        ← Container principal que orquestra tudo
│   │   ├── ModuleBar.tsx       ← Nível 1 — barra vertical de módulos
│   │   ├── Sidebar.tsx         ← Nível 2 — navegação do módulo ativo
│   │   ├── SidebarScore.tsx    ← Widget do Life Sync Score (Jornada)
│   │   ├── TopHeader.tsx       ← Nível 3 — breadcrumb/greeting + toggles
│   │   ├── MobileBottomBar.tsx ← Barra inferior mobile
│   │   ├── ModePill.tsx        ← Toggle Foco/Jornada
│   │   ├── ThemePill.tsx       ← Toggle Dark/Light
│   │   ├── NotifButton.tsx     ← Botão de notificações (sino)
│   │   ├── ContentArea.tsx     ← Wrapper da área de conteúdo
│   │   └── ModuleTooltip.tsx   ← Tooltip da Module Bar
│   └── ui/                     ← shadcn/ui components
│
├── stores/
│   └── shell-store.ts          ← Zustand store: módulo, modo, tema, sidebar
│
├── lib/
│   ├── modules.ts              ← Definição de módulos (roteamento, ícones, cores, nav items)
│   └── constants.ts            ← Constantes do layout (dimensões)
│
├── hooks/
│   ├── useShell.ts             ← Hook para acessar o shell store
│   ├── useMode.ts              ← Hook para verificar modo (foco/jornada) e gate PRO
│   ├── useTheme.ts             ← Hook para tema (dark/light)
│   └── useBreakpoint.ts        ← Hook para detectar mobile/tablet/desktop
│
└── types/
    └── shell.ts                ← Tipos TypeScript: Module, NavItem, ShellState
```

### Explicação da Estrutura

**Route Groups `(auth)` e `(app)`:** O Next.js App Router permite agrupar rotas com parênteses. As rotas dentro de `(auth)` não têm shell (login é tela cheia), enquanto `(app)` sempre renderiza o `AppShell` como layout wrapper. O parêntese não afeta a URL — `/financas/transacoes` continua funcionando normalmente.

**`components/shell/`:** Todos os componentes do shell ficam isolados em uma pasta dedicada. Isso facilita encontrar, manter e testar o shell como uma unidade coesa.

**`stores/shell-store.ts`:** Um único Zustand store centraliza todo o estado do shell. Isso evita prop drilling entre 5 camadas de componentes e permite que qualquer componente da aplicação acesse o estado sem providers aninhados.

---

## 6. ARQUITETURA DO SHELL — VISÃO GERAL

### 6.1 Estrutura de Camadas (Desktop)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────┬───────────┬──────────────────────────────────────────────────┐│
│ │      │           │ [Top Header — 54px]                             ││
│ │      │           ├──────────────────────────────────────────────────┤│
│ │  58px│  228px ou │                                                 ││
│ │      │   56px    │                                                 ││
│ │Module│  Sidebar  │         Content Area                            ││
│ │ Bar  │           │         (renderiza {children})                  ││
│ │      │           │                                                 ││
│ │      │           │                                                 ││
│ │      │           │                                                 ││
│ └──────┴───────────┴──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Estrutura de Camadas (Mobile)

```
┌──────────────────────────────────┐
│ [Top Header — 54px]              │
├──────────────────────────────────┤
│                                  │
│       Content Area               │
│       (renderiza {children})     │
│                                  │
│                                  │
├──────────────────────────────────┤
│ [Bottom Bar — 64px]              │
└──────────────────────────────────┘
```

### 6.3 Componente Orquestrador: AppShell

O `AppShell.tsx` é o componente raiz que monta todas as camadas. Ele é usado como children do layout `(app)/layout.tsx`.

```tsx
// Pseudo-código do AppShell — NÃO copiar literalmente, serve para entender a lógica
export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, activeModule, mode, theme } = useShellStore();
  const isMobile = useBreakpoint('mobile');

  return (
    <div className="app-shell" data-mode={mode} data-theme={theme}>
      {!isMobile && <ModuleBar />}
      {!isMobile && <Sidebar />}

      <div className="main-column">
        <TopHeader />
        <ContentArea>{children}</ContentArea>
      </div>

      {isMobile && <MobileBottomBar />}
    </div>
  );
}
```

### 6.4 CSS Grid do Shell

```css
/* Desktop: 3 colunas fixas */
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Impede que o flex child extravase */
}
```

**Por que `min-width: 0`?** Sem isso, quando o conteúdo interno é muito largo (ex: tabela de transações), o flex item recusa encolher e empurra a sidebar/module bar para fora da tela. Com `min-width: 0`, o conteúdo respeita os limites.

---

## 7. COMPONENTE: MODULE BAR (NÍVEL 1)

### 7.1 O que é

A Module Bar é a barra vertical fixa na extremidade esquerda da tela. Ela contém o logo do SyncLife e um botão para cada módulo do app. Funciona como o "hub" de navegação de primeiro nível — o usuário clica aqui para trocar de módulo (Finanças → Metas → Agenda, etc.).

### 7.2 Dimensões e Posicionamento

| Propriedade | Valor |
|-------------|-------|
| Largura | 58px (`--module-bar-w`) |
| Altura | 100vh (ocupa toda a altura da tela) |
| Background | `var(--s1)` |
| Border-right | `1px solid var(--border)` |
| Padding | `12px 0` (top e bottom) |
| z-index | 60 (acima do conteúdo, abaixo de modais) |
| flex-shrink | 0 (nunca encolhe) |

### 7.3 Elementos Internos (de cima para baixo)

```
┌────────┐
│  Logo  │  ← 34×34px, cursor pointer, navega para Home
│        │
│  Home  │  ← Botão 42×42px
│  Fin   │  ← Botão 42×42px
│  Meta  │  ← Botão 42×42px
│  Agen  │  ← Botão 42×42px
│  Conq  │  ← Botão 42×42px (NOVO — módulo separado)
│        │
│ spacer │  ← flex: 1 (empurra Config e Avatar para baixo)
│        │
│  Cfg   │  ← Botão 42×42px
│  [T]   │  ← Avatar 32×32px
└────────┘
```

### 7.4 Logo

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 34×34px |
| Conteúdo | SVG inline (o "S" com anéis orbitais do protótipo) |
| Cursor | `pointer` |
| Ação | Clique navega para Home (`/`) |
| Margin-bottom | 14px (espaço antes dos botões) |

**O SVG do logo** está definido no protótipo (linhas 954–995). Ele usa os gradientes `#sl-bg`, `#sl-brand`, `#sl-r1`, `#sl-r2` com as cores Esmeralda→Electric Blue. Deve ser extraído como componente `SyncLifeLogo.tsx`.

**Comportamento no Light Foco:** O fundo do logo fica transparente (a cor da module bar aparece), com o container usando `background: linear-gradient(135deg, #051c14, #03091f)` e `border-radius: 9px`.

### 7.5 Botões de Módulo

Cada botão segue a mesma estrutura:

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 42×42px |
| Border-radius | 12px |
| Ícone SVG | 21×21px (viewBox 0 0 24 24, stroke, sem fill) |
| Estado padrão | `background: transparent`, `color: var(--t3)` |
| Hover | `background: var(--s3)`, `color: var(--t2)`, `transform: scale(1.05)` |
| Transição | `background 0.15s, color 0.15s, transform 0.1s` |
| Tooltip | Aparece à direita ao hover (veja seção 16) |

### 7.6 Estados Ativos dos Botões

Quando um módulo está ativo, o botão correspondente recebe fundo e cor identitários:

| Módulo | Classe CSS | Background | Color |
|--------|-----------|------------|-------|
| Home | `.act-home` | `rgba(238,242,255,0.10)` | `var(--t1)` |
| Finanças | `.act-fin` | `var(--fin-glow)` | `var(--fin)` |
| Metas | `.act-meta` | `var(--meta-glow)` | `var(--meta)` |
| Agenda | `.act-agenda` | `var(--agenda-glow)` | `var(--agenda)` |
| Conquistas | `.act-conq` | `var(--conq-glow)` | `var(--conq)` |
| Configurações | `.act-cfg` | `var(--cfg-glow)` | `var(--cfg)` |

### 7.7 Pill Indicator (Barra Lateral de Ativo)

Quando um módulo está ativo, uma barra vertical aparece na borda esquerda do botão, indicando qual módulo está selecionado — é o equivalente visual de um "você está aqui":

```css
.module-btn::before {
  content: '';
  position: absolute;
  left: -8px;              /* Alinhado à borda esquerda da Module Bar */
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;               /* Padrão: invisível */
  border-radius: 0 3px 3px 0;
  background: currentColor; /* Herda a cor do módulo ativo */
  transition: height 0.2s cubic-bezier(.4,0,.2,1);
}

/* Quando ativo: pill aparece */
.module-btn.active::before {
  height: 22px;
}
```

**Detalhe importante:** O `currentColor` faz a pill herdar a cor do módulo automaticamente — esmeralda para Finanças, azul para Metas, ciano para Agenda, etc. Isso garante que a pill sempre combine com o botão ativo sem CSS extra.

### 7.8 Avatar do Usuário

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 32×32px |
| Border-radius | 50% (circular) |
| Background | `linear-gradient(135deg, var(--em), var(--el))` |
| Border | `2px solid var(--border)` |
| Conteúdo | Inicial do nome do usuário (ex: "T" para Thiago) |
| Fonte | Syne, 700, 12px, `#fff` |
| Hover | `border-color: var(--border-h)` |
| Margin-top | 6px |
| Ação ao clicar | Navega para `/configuracoes` (perfil) |

### 7.9 Ícones SVG dos Módulos

Todos os ícones usam `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.8"`. A cor do stroke é herdada do `color` CSS do botão pai.

| Módulo | Ícone | SVG Path |
|--------|-------|----------|
| Home | Casa | `<path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>` |
| Finanças | Porco (cofrinho) | SVG complexo (ver protótipo linhas 1011–1018) |
| Metas | Alvo (3 círculos concêntricos) | `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>` |
| Agenda | Calendário | `<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><rect x="7" y="14" width="3" height="3" rx="0.5"/><rect x="13" y="14" width="3" height="3" rx="0.5"/>` |
| Conquistas | Troféu | `<path d="M6 9H4a2 2 0 010-4h2M18 9h2a2 2 0 000-4h-2M6 9v2a6 6 0 0012 0V9M6 5v4h12V5"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>` |
| Configurações | Engrenagem | SVG padrão Lucide `Settings` (ver protótipo linhas 1049–1051) |

### 7.10 Overrides de Tema na Module Bar

**Light Foco:** A Module Bar mantém fundo escuro (esmeralda escuro) para funcionar como âncora visual — evita que toda a interface fique "lavada" de branco:

```css
body.light .module-bar {
  background: linear-gradient(180deg, #083d2c 0%, #052b1e 100%);
  box-shadow: 2px 0 24px rgba(8,61,44,0.28);
}
body.light .module-bar .module-btn { color: rgba(255,255,255,0.42); }
body.light .module-bar .module-btn:hover {
  background: rgba(255,255,255,0.09);
  color: rgba(255,255,255,0.85);
}
/* Botões ativos ficam verde-claro sobre fundo escuro */
body.light .module-bar .module-btn.active {
  color: #6ee7b7;
  background: rgba(110,231,183,0.12);
}
```

**Light Jornada:** A Module Bar recebe um gradiente vibrante Esmeralda→Electric Blue:

```css
body.light.jornada .module-bar {
  background: linear-gradient(180deg, #0c9e6e 0%, #0844cc 100%);
  box-shadow: 2px 0 24px rgba(5,80,56,0.20);
}
body.light.jornada .module-bar .module-btn { color: rgba(255,255,255,0.65); }
body.light.jornada .module-bar .module-btn:hover {
  background: rgba(255,255,255,0.15);
  color: #ffffff;
}
body.light.jornada .module-bar .module-btn.active { color: #ffffff; }
```

### 7.11 Estados do Componente

| Estado | Comportamento |
|--------|--------------|
| **Padrão** | Visível, botão Home ativo |
| **Módulo ativo** | Botão correspondente com fundo colorido + pill lateral |
| **Hover em botão** | Scale 1.05, fundo `--s3`, tooltip aparece à direita |
| **Mobile** | Componente NÃO renderiza (`display: none` abaixo de 768px) |
| **Loading** | Skeleton dos botões (círculos 42x42 em cinza pulsante) |

---

## 8. COMPONENTE: SIDEBAR (NÍVEL 2)

### 8.1 O que é

A Sidebar é o painel lateral que mostra a navegação interna do módulo selecionado. Quando o usuário clica em "Finanças" na Module Bar, a Sidebar mostra: Dashboard, Transações, Recorrentes, Orçamentos, Calendário, Planejamento e Relatórios. Cada módulo tem seu próprio conjunto de itens.

### 8.2 Dimensões e Posicionamento

| Propriedade | Valor (expandida) | Valor (colapsada) |
|-------------|-------------------|-------------------|
| Largura | 228px (`--sb-open`) | 56px (`--sb-collapsed`) |
| Altura | 100vh |  100vh |
| Background | `var(--s1)` | `var(--s1)` |
| Border-right | `1px solid var(--border)` | `1px solid var(--border)` |
| Transição | `width 0.24s cubic-bezier(.4,0,.2,1)` | — |
| Overflow | `hidden` | `hidden` |
| flex-shrink | 0 | 0 |

### 8.3 Estrutura Interna

```
┌──────────────────────┐
│  [Icon] Label  [◀]  │  ← Header: ícone do módulo + nome + botão toggle
├──────────────────────┤
│  ╔═══════════════╗   │  ← Life Sync Score (só Jornada — ver seção 15)
│  ║  SCORE: 74    ║   │
│  ╚═══════════════╝   │
├──────────────────────┤
│  SEÇÃO LABEL         │  ← Label de seção (opcional)
│  📊 Dashboard    ●   │  ← Nav item ativo (com indicador)
│  💳 Transações       │  ← Nav item normal
│  🔄 Recorrentes      │  ← Nav item normal
│  📁 Orçamentos  2!   │  ← Nav item com badge de alerta
│  📅 Calendário       │
│  📈 Planej.    PRO   │  ← Nav item com badge PRO
│  📄 Relatórios       │
└──────────────────────┘
```

### 8.4 Sidebar Header

O header da sidebar tem altura igual ao Top Header (54px = `--header-h`) para alinhar horizontalmente:

| Elemento | Descrição |
|----------|-----------|
| Ícone do módulo | 28×28px, border-radius 8px, SVG do módulo colorido |
| Label do módulo | Syne 700, 13px, letter-spacing 0.02em, cor `var(--t1)` |
| Botão toggle | 26×26px, border-radius 7px, cor `var(--t3)`, hover `var(--s3)` |

**Comportamento do botão toggle:**
- Sidebar expandida → ícone `◀` (chevron-left) → clicar colapsa para 56px
- Sidebar colapsada → ícone `▶` (chevron-right) → clicar expande para 228px
- No estado colapsado, apenas o ícone do módulo e o botão toggle ficam visíveis (label escondido via `overflow: hidden`)

### 8.5 Nav Items

Cada item de navegação na sidebar segue este layout:

| Propriedade | Valor |
|-------------|-------|
| Display | flex, align-items center, gap 10px |
| Padding | 8px 10px |
| Border-radius | 10px |
| Fonte | DM Sans, 13px |
| Cor padrão | `var(--t2)` |
| Hover | `background: var(--s3)`, `color: var(--t1)` |
| Transição | `background 0.12s, color 0.12s` |
| Ícone SVG | 16×16px, stroke `currentColor`, stroke-width 1.7 |

### 8.6 Estados Ativos dos Nav Items

Assim como na Module Bar, o item ativo recebe fundo e cor do módulo:

| Módulo | Classe | Background | Color | Font-weight |
|--------|--------|------------|-------|-------------|
| Finanças | `.act-fin` | `var(--fin-glow)` | `var(--fin)` | 500 |
| Metas | `.act-meta` | `var(--meta-glow)` | `var(--meta)` | 500 |
| Agenda | `.act-agenda` | `var(--agenda-glow)` | `var(--agenda)` | 500 |
| Conquistas | `.act-conq` | `var(--conq-glow)` | `var(--conq)` | 500 |
| Configurações | `.act-cfg` | `var(--cfg-glow)` | `var(--cfg)` | 500 |

### 8.7 Badges nos Nav Items

Alguns itens têm badges no lado direito que comunicam informações rápidas:

| Tipo | Visual | Exemplo |
|------|--------|---------|
| Alerta amarelo | `background: rgba(245,158,11,0.15)`, `color: var(--yellow)`, font 9px 700 | "2 alertas" |
| Alerta vermelho | `background: rgba(244,63,94,0.15)`, `color: var(--red)` | "vencido" |
| PRO | `background: linear-gradient(135deg, var(--em), var(--el))`, `color: #fff` | "PRO" |
| Contador | `background: rgba(245,158,11,0.15)`, `color: var(--yellow)` | "5" |
| Status | `background: rgba(245,158,11,0.15)`, `color: var(--yellow)` | "hoje" |

**Badge PRO:** Aparece em itens que exigem plano PRO (ex: Planejamento Futuro). Ao clicar, em vez de navegar, abre o modal de upgrade.

### 8.8 Sidebar Colapsada (56px)

Quando colapsada, a sidebar mostra apenas os ícones dos nav items, sem labels. Os ícones ficam centralizados horizontalmente. Ao fazer hover em um ícone, um tooltip aparece à direita com o label do item (mesmo mecanismo dos tooltips da Module Bar).

```
┌──────┐
│ [📊] │  ← 56px, só ícone centralizado
│ [💳] │
│ [🔄] │
│ [📁] │  ← hover mostra tooltip "Orçamentos" à direita
│ [📅] │
│ [📈] │
│ [📄] │
└──────┘
```

**Detalhes técnicos do colapso:**
- Os labels ficam com `opacity: 0`, `width: 0`, `overflow: hidden` (não `display: none`, para permitir animação suave)
- Badges ficam escondidos no modo colapsado (informação acessível ao expandir)
- O Life Sync Score fica escondido no modo colapsado
- Padding dos nav items muda para centralizar o ícone: `padding: 8px 0; justify-content: center;`

### 8.9 Persistência do Estado

O estado da sidebar (aberta/colapsada) deve ser persistido no `localStorage` (offline-first) e sincronizado com Supabase (quando online) no campo `profiles.sidebar_state`:

```typescript
// Ao abrir o app:
// 1. Ler localStorage (instantâneo, sem delay)
// 2. Aplicar estado
// 3. Em background, sincronizar com Supabase (se diferente, Supabase vence)
```

### 8.10 Overrides de Tema na Sidebar

**Light Foco:**
```css
body.light .sidebar {
  background: #f5fbf8;                        /* Off-white com toque esmeralda */
  border-right: 1px solid rgba(16,185,129,0.16);
  box-shadow: 2px 0 20px rgba(16,185,129,0.06);
}
body.light .sidebar .sb-mod-label { color: #083d2c; }
body.light .sidebar .sb-section-label { color: #4da888; }
body.light .nav-item { color: #1a5c42; }
body.light .nav-item:hover { background: rgba(16,185,129,0.07); color: #083d2c; }
body.light .nav-item.active { background: rgba(16,185,129,0.10); color: #10b981; }
```

**Light Jornada:**
```css
body.light.jornada .sidebar {
  background: linear-gradient(180deg, #0fbe82 0%, #0a56d6 100%);
  box-shadow: 2px 0 24px rgba(5,80,56,0.16);
}
body.light.jornada .nav-item { color: rgba(255,255,255,0.75); }
body.light.jornada .nav-item:hover { background: rgba(255,255,255,0.15); color: #ffffff; }
body.light.jornada .nav-item.active { background: rgba(255,255,255,0.20); color: #ffffff; }
body.light.jornada .sb-mod-label { color: #ffffff; }
```

### 8.11 Itens de Navegação por Módulo

#### Home

| ID | Label | Ícone | Ativo por padrão | Badge |
|----|-------|-------|-------------------|-------|
| `dash` | Dashboard | `grid` (4 quadrados) | ✅ | — |

**Nota:** Home tem um único item na sidebar. Pode-se considerar esconder a sidebar quando Home está ativo e mostrar o conteúdo em tela cheia. Decisão do Thiago.

#### Finanças

| ID | Label | Ícone | Badge |
|----|-------|-------|-------|
| `dash` | Dashboard | `chart` (gráfico de linha) | — |
| `trans` | Transações | `list` (linhas) | — |
| `recorr` | Recorrentes | `repeat` (setas circulares) | — |
| `orcamento` | Orçamentos | `wallet` (carteira) | Dinâmico: "X alertas" (amarelo) |
| `calendario` | Calendário | `cal` (calendário) | — |
| `plan` | Planejamento | `trend` (gráfico ascendente) | "PRO" (gradiente) |
| `rel` | Relatórios | `doc` (documento) | — |

#### Metas

| ID | Label | Ícone | Badge |
|----|-------|-------|-------|
| `list` | Minhas Metas | `target` (alvo) | Dinâmico: "X ativas" (amarelo) |
| `nova` | Nova Meta | `plus` (cruz) | — |

**Nota:** Conquistas foi removido daqui para ser módulo separado.

#### Agenda

| ID | Label | Ícone | Badge |
|----|-------|-------|-------|
| `sem` | Semanal | `week` (grid 3 colunas) | "hoje" (amarelo) |
| `mensal` | Mensal | `month` (calendário) | — |
| `novo` | Novo Evento | `plus` (cruz) | — |
| `foco` | Blocos de Foco | `clock` (relógio) | — |

#### Conquistas

| ID | Label | Ícone | Badge |
|----|-------|-------|-------|
| `todas` | Todas | `trophy` (troféu) | Dinâmico: "X novas" (amarelo) |
| `ranking` | Ranking | `star` (estrela) | — |

#### Configurações

| ID | Label | Ícone | Badge |
|----|-------|-------|-------|
| `perfil` | Perfil | `user` (pessoa) | — |
| `modo` | Modo de Uso | `toggle` (switch) | — |
| `notif` | Notificações | `bell` (sino) | — |
| `cat` | Categorias | `tag` (etiqueta) | — |
| `plano` | Plano | `star` (estrela) | Dinâmico: "FREE" ou "PRO" (amarelo) |

### 8.12 Estados do Componente

| Estado | Comportamento |
|--------|--------------|
| **Expandida** | 228px, ícones + labels + badges, Score visível (Jornada) |
| **Colapsada** | 56px, só ícones centralizados, tooltips no hover |
| **Mobile** | `display: none` — completamente escondida |
| **Transição** | Animação suave de 240ms com easing cubic-bezier |
| **Loading** | Skeletons dos nav items (retângulos cinza pulsantes) |
| **Mudança de módulo** | Conteúdo da sidebar atualiza instantaneamente (sem animação de saída/entrada) |

---

## 9. COMPONENTE: TOP HEADER (NÍVEL 3)

### 9.1 O que é

O Top Header é a barra horizontal no topo da Content Area. Ele fornece contexto sobre onde o usuário está (breadcrumb ou saudação) e contém os controles globais (toggle de modo, toggle de tema, notificações).

### 9.2 Dimensões e Posicionamento

| Propriedade | Valor |
|-------------|-------|
| Altura | 54px (`--header-h`) |
| Display | flex, align-items center |
| Padding | 0 20px |
| Gap | 12px |
| Border-bottom | `1px solid var(--border)` |
| Background | Transparente (Dark Foco), gradiente sutil (Light e Jornada) |

### 9.3 Elementos Internos (esquerda para direita)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [▶] [Finanças › Dashboard · Fevereiro 2026]    [🎯 Foco] [🌙 Dark] [🔔]│
│       ↑                                          ↑          ↑         ↑  │
│  Expand btn    Breadcrumb (Foco)              ModePill  ThemePill  Notif │
│  (só se sidebar                                                          │
│   colapsada)                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Modo Jornada** — o breadcrumb é substituído por uma saudação personalizada:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [▶] Boa tarde, Thiago! ✨                      [🌱 Jornada] [🌙] [🔔]│
│       Você está evoluindo — 74 pontos esta semana.                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Botão de Expandir Sidebar

Só aparece quando a sidebar está colapsada (56px). Fica no início do header:

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 28×28px |
| Border-radius | 8px |
| Border | `1px solid var(--border)` |
| Ícone | Chevron-right (▶) — 15×15px |
| Cor | `var(--t3)`, hover `var(--t2)` |
| Hover | `background: var(--s3)` |
| Visibilidade | `display: none` por padrão, `display: flex` quando sidebar colapsada |

### 9.5 Breadcrumb (Modo Foco)

Formato: `[Nome do Módulo] › [Nome da Tela] · [Contexto temporal]`

Exemplos:
- `Finanças › Dashboard · Fevereiro 2026`
- `Metas › Minhas Metas · 3 ativas`
- `Agenda › Semanal · 17–23 Fev 2026`

| Parte | Estilo |
|-------|--------|
| Nome do módulo | DM Sans, 13px, 600, `var(--t1)` |
| Separador (›) | DM Sans, 13px, `opacity: 0.4` |
| Nome da tela | DM Sans, 13px, `var(--t3)` |
| Separador (·) | DM Sans, 13px, `opacity: 0.4` |
| Contexto temporal | DM Sans, 13px, `var(--t3)` |

### 9.6 Saudação (Modo Jornada)

Substitui o breadcrumb quando o modo é Jornada:

| Elemento | Estilo |
|----------|--------|
| Nome | DM Sans, 14px, 600, gradiente texto `var(--t1) → #10b981` |
| Frase | DM Sans, 11px, `var(--t3)`, estilo normal |

**Frases contextuais rotativas** (exemplos):
- "Boa tarde, Thiago! ✨" + "Você está evoluindo — 74 pontos esta semana."
- "Bom dia, Thiago! 🌅" + "Novo dia, novas oportunidades de evoluir."
- "Boa noite, Thiago! 🌙" + "Hora de revisar o dia e planejar o amanhã."

**Regras da saudação:**
- 06h–12h: "Bom dia" + 🌅
- 12h–18h: "Boa tarde" + ✨
- 18h–06h: "Boa noite" + 🌙
- O score é puxado do Life Sync Score do usuário (API)
- Se não houver score ainda (usuário novo), usar: "Vamos começar sua jornada!"

### 9.7 Overrides de Tema no Header

**Light Foco:**
```css
body.light .header {
  background: linear-gradient(90deg, rgba(16,185,129,0.07) 0%, #ffffff 35%);
  border-color: rgba(16,185,129,0.10);
}
```

**Dark Jornada:**
```css
body.jornada .header {
  background: linear-gradient(90deg, rgba(16,185,129,0.06), transparent 60%);
}
```

**Light Jornada:**
```css
body.light.jornada .header {
  background: linear-gradient(90deg, #0fbe82 0%, #0a56d6 100%);
  border-color: transparent;
}
/* Textos ficam brancos sobre o gradiente colorido */
body.light.jornada .hd-breadcrumb,
body.light.jornada .hd-greeting-name { color: #ffffff; }
body.light.jornada .hd-greeting-phrase { color: rgba(255,255,255,0.65); }
```

### 9.8 Estados do Componente

| Estado | Comportamento |
|--------|--------------|
| **Foco** | Breadcrumb visível, saudação escondida |
| **Jornada** | Saudação visível, breadcrumb escondido |
| **Sidebar expandida** | Botão de expandir escondido |
| **Sidebar colapsada** | Botão de expandir aparece no início do header |
| **Mobile** | Sem botão de expandir (não tem sidebar), breadcrumb simplificado |
| **Light Jornada** | Header com fundo gradiente vibrante, textos brancos |

---

## 10. COMPONENTE: MOBILE BOTTOM BAR

### 10.1 O que é

No mobile, a Module Bar e a Sidebar são substituídas por uma barra de navegação fixa no rodapé da tela (bottom tab bar), seguindo o padrão do iOS e Android. Funciona como o Instagram e WhatsApp.

### 10.2 Dimensões e Posicionamento

| Propriedade | Valor |
|-------------|-------|
| Altura | 64px (`--bottom-bar-h`) |
| Posição | `position: fixed`, `bottom: 0`, `left: 0`, `right: 0` |
| Background | `var(--s1)` |
| Border-top | `1px solid var(--border)` |
| z-index | 200 |
| Display | `none` por padrão, `flex` abaixo de 768px |
| Justify-content | `space-around` |
| Align-items | `center` |

### 10.3 Tabs (Botões)

A Bottom Bar mostra **5 tabs** (não inclui Conquistas e Configurações diretamente — ver decisão abaixo):

| Tab | Ícone | Label | Cor ativa |
|-----|-------|-------|-----------|
| Home | Casa | "Home" | `var(--t1)` |
| Finanças | Cofrinho | "Finanças" | `var(--fin)` |
| Metas | Alvo | "Metas" | `var(--meta)` |
| Agenda | Calendário | "Agenda" | `var(--agenda)` |
| Mais | `...` (3 pontos) | "Mais" | `var(--t2)` |

**Decisão de design: "Mais" vs mostrar tudo**

Com 6 módulos (Home + Finanças + Metas + Agenda + Conquistas + Config), colocar todos na bottom bar criaria botões muito apertados em telas de 375px. A solução é usar um botão "Mais" que abre um sheet (bottom drawer) com as opções extras: Conquistas, Configurações e o Avatar/perfil.

Isso segue o padrão do Instagram (que usa "Mais" para agrupar funcionalidades secundárias no mobile) e evita a sobrecarga visual de 6+ ícones apertados.

### 10.4 Estilo de cada Tab

```css
.mob-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--t3);         /* Inativo: cor terciária */
  transition: color 0.15s;
}
.mob-tab svg { width: 22px; height: 22px; }
.mob-tab span { font-size: 10px; font-weight: 500; }

/* Ativo: cor do módulo */
.mob-tab.active { color: var(--fin); /* ou --meta, --agenda, etc. */ }
```

### 10.5 Sub-navegação Mobile

Quando o usuário está dentro de um módulo (ex: Finanças), as sub-telas (Dashboard, Transações, Orçamentos...) ficam acessíveis por **tabs horizontais no topo da Content Area** (abaixo do header):

```
┌──────────────────────────────┐
│ [Top Header]                 │
├──────────────────────────────┤
│ [Dashboard] [Transações] [+] │  ← Scroll horizontal, tab ativa sublinhada
├──────────────────────────────┤
│                              │
│     Conteúdo da tela         │
│                              │
├──────────────────────────────┤
│ [🏠] [💰] [🎯] [📅] [•••]   │
└──────────────────────────────┘
```

Essas tabs horizontais:
- Ficam fixas abaixo do header (não rolam com o conteúdo)
- Usam scroll horizontal quando não cabem na tela
- A tab ativa tem `border-bottom: 2px solid var(--[cor-módulo])` e `color: var(--[cor-módulo])`
- Inativas: `color: var(--t3)`
- Podem incluir um botão `+` no final (ex: "+ Transação" no módulo Finanças)

### 10.6 Sheet "Mais" (bottom drawer)

Quando o usuário toca no botão "Mais":

```
┌──────────────────────────────┐
│         ─────                │  ← Handle (barra cinza arrastável)
│                              │
│  🏆  Conquistas    5 novas   │  ← Item com badge
│  ⚙️  Configurações           │
│  👤  Meu Perfil              │
│                              │
│  ─────────────────────────── │
│  🌙 Dark   🎯 Modo Foco     │  ← Toggles compactos
│                              │
└──────────────────────────────┘
```

---

## 11. COMPONENTE: CONTENT AREA

### 11.1 O que é

A Content Area é o espaço onde o conteúdo real de cada tela é renderizado. Ela é essencialmente o `{children}` do layout do shell.

### 11.2 Dimensões e Comportamento

| Propriedade | Valor |
|-------------|-------|
| flex | 1 (ocupa todo o espaço restante) |
| overflow-y | `auto` (scroll vertical quando conteúdo excede) |
| overflow-x | `hidden` (nunca scroll horizontal) |
| Padding | 22px (`--content-padding`) em todos os lados |
| Mobile padding-bottom | `76px` (espaço extra para a bottom bar não cobrir conteúdo) |

### 11.3 Animação de Entrada

Quando o conteúdo muda (troca de tela ou módulo), um fade-in suave é aplicado:

```css
.content-inner {
  animation: fadeUp 0.2s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Regra de modo:** No Modo Foco, a animação é reduzida para `opacity` apenas (sem `translateY`), para transmitir mais objetividade. No Modo Jornada, mantém o efeito completo de deslizar + aparecer.

---

## 12. SISTEMA DE MÓDULOS — DADOS E ROTEAMENTO

### 12.1 Definição de Tipos TypeScript

```typescript
// types/shell.ts

export type ModuleId = 'home' | 'financas' | 'metas' | 'agenda' | 'conquistas' | 'configuracoes';

export type ModuleColor = 'home' | 'fin' | 'meta' | 'agenda' | 'conq' | 'cfg';

export interface NavBadge {
  text: string;
  variant: 'yellow' | 'red' | 'pro';
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;          // Nome do ícone Lucide ou chave para SVG custom
  href: string;          // Rota Next.js (ex: '/financas/transacoes')
  badge?: NavBadge;      // Badge opcional
  isProOnly?: boolean;   // Se true, mostra badge PRO e abre modal upgrade ao clicar
}

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  color: ModuleColor;
  icon: string;           // Ícone SVG para a Module Bar
  basePath: string;       // Rota base (ex: '/financas')
  navItems: NavItem[];    // Itens da sidebar
  defaultNavId: string;   // ID do item padrão ao entrar no módulo
}

export interface ShellState {
  activeModule: ModuleId;
  sidebarOpen: boolean;   // true = expandida (228px), false = colapsada (56px)
  mode: 'foco' | 'jornada';
  theme: 'dark' | 'light';
  setActiveModule: (module: ModuleId) => void;
  toggleSidebar: () => void;
  setMode: (mode: 'foco' | 'jornada') => void;
  setTheme: (theme: 'dark' | 'light') => void;
}
```

### 12.2 Configuração dos Módulos

```typescript
// lib/modules.ts

export const MODULES: Record<ModuleId, ModuleConfig> = {
  home: {
    id: 'home',
    label: 'Home',
    color: 'home',
    icon: 'home',
    basePath: '/',
    defaultNavId: 'dash',
    navItems: [
      { id: 'dash', label: 'Dashboard', icon: 'layout-grid', href: '/' },
    ],
  },

  financas: {
    id: 'financas',
    label: 'Finanças',
    color: 'fin',
    icon: 'piggy-bank',
    basePath: '/financas',
    defaultNavId: 'dash',
    navItems: [
      { id: 'dash',       label: 'Dashboard',    icon: 'chart-line',   href: '/financas' },
      { id: 'trans',      label: 'Transações',   icon: 'list',         href: '/financas/transacoes' },
      { id: 'recorr',     label: 'Recorrentes',  icon: 'repeat',       href: '/financas/recorrentes' },
      { id: 'orcamento',  label: 'Orçamentos',   icon: 'wallet',       href: '/financas/orcamentos' },
      { id: 'calendario', label: 'Calendário',   icon: 'calendar',     href: '/financas/calendario' },
      { id: 'plan',       label: 'Planejamento', icon: 'trending-up',  href: '/financas/planejamento', isProOnly: true },
      { id: 'rel',        label: 'Relatórios',   icon: 'file-text',    href: '/financas/relatorios' },
    ],
  },

  metas: {
    id: 'metas',
    label: 'Metas',
    color: 'meta',
    icon: 'target',
    basePath: '/metas',
    defaultNavId: 'list',
    navItems: [
      { id: 'list', label: 'Minhas Metas', icon: 'target',  href: '/metas' },
      { id: 'nova', label: 'Nova Meta',    icon: 'plus',    href: '/metas/nova' },
    ],
  },

  agenda: {
    id: 'agenda',
    label: 'Agenda',
    color: 'agenda',
    icon: 'calendar',
    basePath: '/agenda',
    defaultNavId: 'sem',
    navItems: [
      { id: 'sem',    label: 'Semanal',       icon: 'columns',   href: '/agenda' },
      { id: 'mensal', label: 'Mensal',        icon: 'calendar',  href: '/agenda/mensal' },
      { id: 'novo',   label: 'Novo Evento',   icon: 'plus',      href: '/agenda/novo' },
      { id: 'foco',   label: 'Blocos de Foco', icon: 'clock',    href: '/agenda/foco' },
    ],
  },

  conquistas: {
    id: 'conquistas',
    label: 'Conquistas',
    color: 'conq',
    icon: 'trophy',
    basePath: '/conquistas',
    defaultNavId: 'todas',
    navItems: [
      { id: 'todas',   label: 'Todas',   icon: 'trophy', href: '/conquistas' },
      { id: 'ranking', label: 'Ranking', icon: 'star',   href: '/conquistas/ranking' },
    ],
  },

  configuracoes: {
    id: 'configuracoes',
    label: 'Configurações',
    color: 'cfg',
    icon: 'settings',
    basePath: '/configuracoes',
    defaultNavId: 'perfil',
    navItems: [
      { id: 'perfil', label: 'Perfil',       icon: 'user',          href: '/configuracoes' },
      { id: 'modo',   label: 'Modo de Uso',  icon: 'toggle-right',  href: '/configuracoes/modo' },
      { id: 'notif',  label: 'Notificações', icon: 'bell',          href: '/configuracoes/notificacoes' },
      { id: 'cat',    label: 'Categorias',   icon: 'tag',           href: '/configuracoes/categorias' },
      { id: 'plano',  label: 'Plano',        icon: 'star',          href: '/configuracoes/plano' },
    ],
  },
};
```

### 12.3 Detecção Automática de Módulo Ativo

O módulo ativo é determinado pela rota atual usando `usePathname()` do Next.js:

```typescript
// hooks/useActiveModule.ts
import { usePathname } from 'next/navigation';
import { MODULES, ModuleId } from '@/lib/modules';

export function useActiveModule(): ModuleId {
  const pathname = usePathname();

  // Percorre os módulos e encontra qual basePath combina com a rota
  for (const [id, config] of Object.entries(MODULES)) {
    if (id === 'home' && pathname === '/') return 'home';
    if (id !== 'home' && pathname.startsWith(config.basePath)) {
      return id as ModuleId;
    }
  }

  return 'home'; // Fallback
}
```

---

## 13. TOGGLE DE MODO (FOCO/JORNADA) + GATE PRO

### 13.1 Componente: ModePill

A pill de modo fica no Top Header e permite alternar entre Foco e Jornada:

| Propriedade | Valor |
|-------------|-------|
| Display | flex, align-items center, gap 7px |
| Padding | 5px 12px 5px 8px |
| Border-radius | 20px (pill shape) |
| Border | `1px solid var(--border)` |
| Background | `var(--s2)` |
| Hover | `border-color: var(--border-h)`, `background: var(--s3)` |
| Font | DM Sans, 12px, `var(--t2)` |
| Cursor | pointer |

### 13.2 Visual do ModePill

```
Modo Foco:     [🎯] Modo Foco
Modo Jornada:  [🌱] Modo Jornada
```

O ícone-dot (🎯/🌱) tem fundo próprio:

| Modo | Emoji | Dot background | Dot color |
|------|-------|----------------|-----------|
| Foco | 🎯 | `rgba(16,185,129,0.15)` | `#10b981` |
| Jornada | 🌱 | `rgba(16,185,129,0.18)` | `#10b981` |

### 13.3 Gate PRO para Modo Jornada

**Regra de negócio:** Modo Jornada é exclusivo do plano PRO.

**Fluxo quando usuário FREE clica no toggle estando no Foco:**

1. Ao invés de trocar para Jornada, abre modal de upgrade
2. Modal mostra:
   - Título: "✨ Modo Jornada — Plano PRO"
   - Descrição: "Acompanhe sua evolução com o Life Sync Score, insights personalizados e celebração de conquistas."
   - Lista de features: Life Sync Score, saudação motivacional, insights IA, animações de progresso
   - Botão primário: "Fazer upgrade — R$ 19,90/mês"
   - Botão secundário: "Agora não"
3. Se o usuário é PRO, o toggle funciona normalmente

**Implementação:**

```typescript
function handleModeToggle() {
  if (currentMode === 'jornada') {
    // Voltar para Foco é sempre permitido
    setMode('foco');
    return;
  }

  // Tentar ir para Jornada
  if (userPlan === 'free') {
    openUpgradeModal('jornada');
    return;
  }

  setMode('jornada');
}
```

### 13.4 O que muda no Shell quando alterna o modo

| Componente | Foco | Jornada |
|------------|------|---------|
| **Top Header** | Breadcrumb técnico | Saudação com nome + emoji |
| **Sidebar** | Sem Life Sync Score | Com Life Sync Score widget |
| **Sidebar (Light)** | Background off-white | Gradiente Emerald→Blue |
| **Module Bar (Light)** | Background esmeralda escuro | Gradiente Emerald→Blue |
| **Header background** | Transparente ou sutil | Gradiente com tint esmeralda |
| **Page titles** | `color: var(--t1)` simples | Gradiente texto `var(--t1) → #10b981` |
| **Content animation** | Fade simples (opacity only) | Fade + slide up (fadeUp) |
| **Body class** | Sem `.jornada` | Com `.jornada` |
| **Tokens CSS** | Padrão (navy no dark) | Override (verde-escuro no dark) |

### 13.5 Persistência do Modo

- **localStorage:** Lido imediatamente ao carregar para evitar flash
- **Supabase:** Campo `profiles.mode` (`'focus'` ou `'journey'`)
- **Prioridade:** localStorage para leitura rápida, Supabase como source of truth
- **Sync:** Ao alterar, gravar nos dois simultaneamente

---

## 14. TOGGLE DE TEMA (DARK/LIGHT)

### 14.1 Componente: ThemePill

| Propriedade | Valor |
|-------------|-------|
| Layout | Idêntico ao ModePill |
| Sem gate PRO | Livre para FREE e PRO |

### 14.2 Visual

```
Dark:    [🌙] Dark
Light:   [☀️] Light
```

### 14.3 O que muda

| Mudança | Mecanismo |
|---------|-----------|
| Tokens de superfície | Classes CSS no body: `.light` |
| Module Bar (Light) | Fundo escuro esmeralda (âncora) |
| Sidebar (Light) | Fundo off-white ou gradiente (Jornada) |
| Cards e conteúdo | Seguem os tokens automaticamente |
| Sombras | Mais sutis no dark, mais visíveis no light |

### 14.4 Persistência

- **localStorage:** Lido imediatamente para evitar flash de tema errado (FOUC)
- **Supabase:** Campo `profiles.theme` (`'dark'` ou `'light'`)
- **Sync:** Igual ao modo

### 14.5 Script Anti-FOUC

Para evitar o flash de tema errado ao carregar a página (ex: o body aparece dark por 200ms antes de trocar para light), um script inline no `<head>` deve ser injetado:

```html
<script>
  // Lê tema do localStorage ANTES de qualquer renderização
  (function() {
    try {
      var t = localStorage.getItem('synclife-theme');
      var m = localStorage.getItem('synclife-mode');
      if (t === 'light') document.documentElement.classList.add('light');
      if (m === 'jornada') document.documentElement.classList.add('jornada');
    } catch(e) {}
  })();
</script>
```

**No Next.js:** Isso é feito via o `app/layout.tsx` com um `<Script strategy="beforeInteractive">` ou diretamente no template HTML.

---

## 15. LIFE SYNC SCORE — WIDGET NA SIDEBAR

### 15.1 O que é

O Life Sync Score é um número de 0 a 100 que representa o quão "em dia" o usuário está com seus registros e metas no SyncLife. Ele aparece **exclusivamente no Modo Jornada**, dentro da sidebar, logo abaixo do header.

### 15.2 Visibilidade

| Condição | Visível? |
|----------|---------|
| Modo Foco | ❌ Escondido (`display: none`) |
| Modo Jornada + Sidebar expandida | ✅ Visível |
| Modo Jornada + Sidebar colapsada | ❌ Escondido (não cabe) |
| Mobile | ❌ Escondido (sem sidebar) |

### 15.3 Layout do Widget

```
╔══════════════════════════════╗
║  LIFE SYNC SCORE             ║  ← Label: 9px, 700, uppercase, var(--t3)
║  74            ↑ +3 semana   ║  ← Número: Syne 800, 32px + delta
║  ████████████████░░░░░░░░    ║  ← Barra de progresso (74%)
║                Fin: 80       ║  ← Sub-detalhe
╚══════════════════════════════╝
```

### 15.4 Estilo do Widget

| Propriedade | Valor |
|-------------|-------|
| Margin | `10px 10px 0` |
| Padding | 12px |
| Border-radius | 12px |
| Border | `1px solid rgba(16,185,129,0.22)` |
| Background | `linear-gradient(135deg, rgba(16,185,129,0.10), rgba(0,85,255,0.10))` |

**Número do score:**
- Syne 800, 32px
- Gradiente texto: `linear-gradient(135deg, #10b981, #0055ff)` via `-webkit-background-clip: text`

**Barra de progresso:**
- Height: 4px
- Background: `rgba(255,255,255,0.08)`
- Fill: `linear-gradient(90deg, var(--fin), #f59e0b)` — da esmeralda para âmbar
- Border-radius: 2px
- Width: `{score}%`

**Delta:**
- Font: DM Sans, 11px, `var(--green)` quando positivo

### 15.5 Override Light Jornada

No Light Jornada, a sidebar tem fundo gradiente, então o score widget se adapta:

```css
body.light.jornada .sb-score {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.30);
}
body.light.jornada .sb-score-num {
  background: linear-gradient(135deg, #ffffff, #c4f8e8);
  -webkit-background-clip: text;
}
body.light.jornada .sb-score-fill {
  background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(196,248,232,0.8));
}
```

---

## 16. SISTEMA DE TOOLTIPS

### 16.1 Onde são usados

Tooltips aparecem em dois contextos no shell:
1. **Module Bar:** Ao hover em qualquer botão de módulo
2. **Sidebar colapsada:** Ao hover em qualquer nav item

### 16.2 Posicionamento

O tooltip aparece **à direita** do elemento, alinhado verticalmente ao centro:

```
[Botão] ◁─── Tooltip
         ↑
     Seta (triângulo)
```

### 16.3 Estilo

| Propriedade | Valor |
|-------------|-------|
| Position | `fixed` |
| Left | `calc(var(--module-bar-w) + 8px)` para Module Bar, ou `calc(var(--module-bar-w) + var(--sb-collapsed) + 8px)` para sidebar |
| Background | `var(--s3)` |
| Border | `1px solid var(--border-h)` |
| Border-radius | 8px |
| Padding | 5px 10px |
| Font | DM Sans, 12px, 500, `var(--t1)` |
| Box-shadow | `0 4px 16px rgba(0,0,0,0.3)` |
| z-index | 999 |
| Opacity | 0 → 1 (transição 120ms) |
| Seta | Pseudo-element `::before` rotacionado 45° |

### 16.4 Override Light

```css
body.light .tip {
  background: #03071a;              /* Invertido: tooltip escuro em fundo claro */
  border-color: rgba(0,0,0,0.2);
  color: #dff0ff;
}
```

---

## 17. SISTEMA DE NOTIFICAÇÕES (SINO)

### 17.1 Componente: NotifButton

O botão de notificações fica no final do Top Header (extremidade direita):

| Propriedade | Valor |
|-------------|-------|
| Tamanho | 34×34px |
| Border-radius | 10px |
| Border | `1px solid var(--border)` |
| Ícone | Bell (sino), 17×17px, stroke `currentColor` |
| Cor padrão | `var(--t3)` |
| Hover | `background: var(--s3)`, `color: var(--t2)` |

### 17.2 Badge de Contagem (Dot)

Um ponto vermelho aparece quando há notificações não lidas:

| Propriedade | Valor |
|-------------|-------|
| Position | `absolute`, `top: 8px`, `right: 8px` |
| Tamanho | 6×6px |
| Border-radius | 50% |
| Background | `var(--red)` |
| Border | `1.5px solid var(--bg)` (cria efeito de "recorte") |
| Visibilidade | Só aparece se `unreadCount > 0` |

### 17.3 Ação ao clicar

O clique no sino abre um **painel/drawer de notificações**. A spec desse painel será um documento separado. Por agora, o componente apenas dispara um callback `onNotifClick()`.

---

## 18. QUATRO COMBINAÇÕES VISUAIS

O SyncLife possui dois eixos visuais independentes que se combinam em 4 variantes:

### 18.1 Dark Foco (padrão)

- Body: sem classes adicionais
- Visual: Navy profundo, limpo, técnico
- Module Bar: `var(--s1)` (navy escuro)
- Sidebar: `var(--s1)` (navy escuro)
- Header: transparente
- Sensação: "Cockpit de controle"

### 18.2 Dark Jornada

- Body: `.jornada`
- Visual: Verde-escuro profundo com gradientes Esmeralda→Blue
- Module Bar: tokens de Jornada
- Sidebar: tokens de Jornada + Life Sync Score visível
- Header: gradiente sutil esmeralda
- Sensação: "Floresta à noite — crescimento orgânico"

### 18.3 Light Foco

- Body: `.light`
- Visual: Off-white limpo com Module Bar escura como âncora
- Module Bar: `linear-gradient(180deg, #083d2c, #052b1e)` — esmeralda escuro
- Sidebar: `#f5fbf8` (off-white com tint esmeralda)
- Header: gradiente sutil partindo de esmeralda
- Sensação: "Escritório clean — profissional e arejado"

### 18.4 Light Jornada

- Body: `.light.jornada`
- Visual: Mint vibrante com gradientes Esmeralda→Blue em todos os controles
- Module Bar: `linear-gradient(180deg, #0c9e6e, #0844cc)` — colorido vibrante
- Sidebar: `linear-gradient(180deg, #0fbe82, #0a56d6)` — colorido vibrante
- Header: `linear-gradient(90deg, #0fbe82, #0a56d6)` — gradiente horizontal
- Textos de nav e header: brancos sobre gradiente
- Cards: branco puro sobre fundo mint
- Sensação: "Jardim tropical — energia, motivação, cor"

---

## 19. RESPONSIVIDADE

### 19.1 Breakpoints

| Nome | Largura | Layout do Shell |
|------|---------|-----------------|
| **Mobile** | < 640px | Sem Module Bar, sem Sidebar. Bottom Bar + tabs horizontais |
| **Tablet** | 640–1024px | Sem Module Bar, sem Sidebar. Bottom Bar + tabs horizontais |
| **Desktop** | > 1024px | Module Bar + Sidebar (expandida ou colapsada) + Header |
| **Wide** | > 1440px | Sidebar sempre expandida (override do estado salvo) |

### 19.2 Comportamento por Breakpoint

| Componente | Mobile/Tablet | Desktop | Wide |
|------------|--------------|---------|------|
| Module Bar | Escondida | Visível (58px) | Visível (58px) |
| Sidebar | Escondida | Visível (228px ou 56px) | Forçada expandida (228px) |
| Top Header | Visível (breadcrumb simples) | Visível (breadcrumb + pills) | Visível (completo) |
| Bottom Bar | Visível (64px) | Escondida | Escondida |
| Content padding | 16px | 22px | 22px |
| Sub-nav | Tabs horizontais | Na sidebar | Na sidebar |

### 19.3 CSS Media Queries

```css
/* Mobile e Tablet: ocultar shell desktop */
@media (max-width: 1024px) {
  .module-bar, .sidebar { display: none; }
  .mob-bar { display: flex; }
  .content { padding-bottom: 76px; } /* Espaço para bottom bar */
}

/* Wide: forçar sidebar expandida */
@media (min-width: 1441px) {
  .sidebar { width: var(--sb-open) !important; }
  .sidebar .nav-label { opacity: 1 !important; width: auto !important; }
}
```

---

## 20. ANIMAÇÕES E TRANSIÇÕES

### 20.1 Lista de Animações

| Animação | Trigger | Duração | Easing | Modo |
|----------|---------|---------|--------|------|
| Sidebar expand/collapse | Toggle sidebar | 240ms | `cubic-bezier(.4,0,.2,1)` | Ambos |
| Content fade-in | Troca de tela | 200ms | `ease` | Jornada (completo), Foco (opacity only) |
| Module button scale | Hover | 100ms | `ease` | Ambos |
| Pill indicator height | Módulo ativo muda | 200ms | `cubic-bezier(.4,0,.2,1)` | Ambos |
| Tooltip appear | Hover módulo | 120ms | `ease` | Ambos |
| Theme transition | Toggle tema | 400ms (bg), 300ms (color) | `ease` | Ambos |
| Mode transition | Toggle modo | 400ms | `ease` | Jornada |
| Score bar fill | Carregamento | 600ms | `cubic-bezier(.4,0,.2,1)` | Jornada |

### 20.2 Regra de Modo Foco

No Modo Foco, animações são minimizadas para transmitir objetividade:
- Sem `translateY` no content fade-in (apenas opacity)
- Score bar sem animação de fill (renderiza no estado final)
- Sem animação na troca de módulo na sidebar (conteúdo muda instantaneamente)

---

## 21. ACESSIBILIDADE

### 21.1 Navegação por Teclado

| Tecla | Ação |
|-------|------|
| `Tab` | Navega entre elementos interativos do shell |
| `Enter` / `Space` | Ativa o elemento focado (botão, link) |
| `Escape` | Fecha sidebar em overlay (tablet), fecha sheet "Mais" (mobile) |
| `Ctrl/⌘ + B` | Toggle sidebar (atalho) |
| `Ctrl/⌘ + K` | Abrir busca global (futuro) |

### 21.2 ARIA Labels

| Componente | Role | aria-label |
|------------|------|------------|
| Module Bar | `navigation` | "Navegação de módulos" |
| Sidebar | `navigation` | "Menu do módulo {nome}" |
| Top Header | `banner` | — |
| Bottom Bar | `navigation` | "Navegação principal" |
| ModePill | `button` | "Alternar modo: atualmente {modo}" |
| ThemePill | `button` | "Alternar tema: atualmente {tema}" |
| NotifButton | `button` | "Notificações: {count} não lidas" |
| Tooltip | `tooltip` | — |

### 21.3 Focus Styles

Todos os elementos interativos devem ter foco visível (outline). Usar:

```css
:focus-visible {
  outline: 2px solid var(--em);
  outline-offset: 2px;
}
```

### 21.4 Contraste

Todos os textos no shell devem ter contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande). Os tokens do design system foram definidos com isso em mente, mas o Light Jornada com textos brancos sobre gradiente merece atenção especial — testar com ferramentas como axe-core.

---

## 22. PERFORMANCE

### 22.1 Metas

| Métrica | Meta | Por quê |
|---------|------|---------|
| FCP | < 1.2s | O shell deve aparecer rápido |
| LCP | < 2.0s | Conteúdo principal visível rapidamente |
| CLS | < 0.1 | Sem layout shifts ao carregar |
| TTI | < 3.0s | Interativo rapidamente |

### 22.2 Estratégias

1. **Tema via script inline:** Evita flash de tema errado (FOUC) — ver seção 14.5
2. **Sidebar state em localStorage:** Evita layout shift se sidebar abrisse depois
3. **Fontes com `display: swap`:** Texto visível imediatamente com fallback
4. **SVG ícones inline:** Sem requests de rede para ícones (todos são componentes React)
5. **Lazy load do conteúdo:** O shell carrega imediatamente; o conteúdo da tela pode ser Suspense-wrapped
6. **Zustand sem providers:** Zustand não usa React Context (zero overhead de providers aninhados)

### 22.3 Server vs Client Components

| Componente | Tipo | Por quê |
|------------|------|---------|
| `AppShell` | Client | Precisa de estado (sidebar, modo, tema) |
| `ModuleBar` | Client | Interações (clique, hover, tooltip) |
| `Sidebar` | Client | Estado (expandida/colapsada), animação |
| `TopHeader` | Client | Toggle de modo/tema, breadcrumb dinâmico |
| `ContentArea` | Server (wrapper) | Renderiza {children} do layout |

---

## 23. TESTES UNITÁRIOS

### 23.1 Categorias de Testes

| ID | Teste | Tipo | Componente |
|----|-------|------|------------|
| T01 | Renderiza Module Bar com 6 botões de módulo + avatar | Renderização | ModuleBar |
| T02 | Botão de módulo ativo tem classe e cor corretas | Estado | ModuleBar |
| T03 | Clique no módulo navega para a rota correta | Interação | ModuleBar |
| T04 | Pill indicator aparece no módulo ativo | Estado visual | ModuleBar |
| T05 | Tooltip aparece ao hover e desaparece ao sair | Interação | ModuleBar |
| T06 | Module Bar não renderiza abaixo de 1024px | Responsividade | ModuleBar |
| T07 | Sidebar renderiza items corretos para cada módulo | Renderização | Sidebar |
| T08 | Nav item ativo tem classe e cor do módulo | Estado | Sidebar |
| T09 | Toggle sidebar alterna entre 228px e 56px | Interação | Sidebar |
| T10 | Sidebar colapsada mostra só ícones | Estado | Sidebar |
| T11 | Life Sync Score aparece só no modo Jornada | Modo | SidebarScore |
| T12 | Life Sync Score esconde na sidebar colapsada | Estado | SidebarScore |
| T13 | Badge PRO aparece em item isProOnly | Renderização | Sidebar |
| T14 | Click em item PRO abre modal upgrade (user FREE) | Regra de negócio | Sidebar |
| T15 | Breadcrumb mostra módulo e tela corretos | Renderização | TopHeader |
| T16 | Breadcrumb aparece no Foco, saudação no Jornada | Modo | TopHeader |
| T17 | Saudação usa período correto (manhã/tarde/noite) | Regra de negócio | TopHeader |
| T18 | Toggle modo funciona para usuário PRO | Interação | ModePill |
| T19 | Toggle modo abre modal upgrade para FREE | Regra de negócio | ModePill |
| T20 | Toggle tema alterna entre dark e light | Interação | ThemePill |
| T21 | Toggle tema não tem gate PRO | Regra de negócio | ThemePill |
| T22 | Notif button mostra dot quando há não lidas | Estado | NotifButton |
| T23 | Notif button esconde dot quando count = 0 | Estado | NotifButton |
| T24 | Bottom Bar renderiza no mobile | Responsividade | MobileBottomBar |
| T25 | Bottom Bar tem 5 tabs (Home, Fin, Metas, Agenda, Mais) | Renderização | MobileBottomBar |
| T26 | Tab ativa tem cor do módulo | Estado | MobileBottomBar |
| T27 | Tab "Mais" abre sheet com Conquistas e Config | Interação | MobileBottomBar |
| T28 | Content area tem padding correto | Renderização | ContentArea |
| T29 | Content area tem padding-bottom extra no mobile | Responsividade | ContentArea |
| T30 | Fade-in anima ao trocar de tela | Animação | ContentArea |
| T31 | Estado sidebar persiste em localStorage | Persistência | AppShell |
| T32 | Estado tema persiste e evita FOUC | Persistência | AppShell |
| T33 | Estado modo persiste em localStorage | Persistência | AppShell |
| T34 | Módulo ativo correto baseado na rota | Roteamento | AppShell |
| T35 | Classes .jornada e .light aplicadas corretamente no body | Tema | AppShell |
| T36 | Dark Foco: tokens corretos aplicados | Tema | AppShell |
| T37 | Dark Jornada: tokens override corretos | Tema | AppShell |
| T38 | Light Foco: tokens corretos + Module Bar escura | Tema | AppShell |
| T39 | Light Jornada: gradientes aplicados em MB, Sidebar e Header | Tema | AppShell |
| T40 | Wide (>1440px): sidebar forçada expandida | Responsividade | AppShell |

### 23.2 Stack de Testes

- **Framework:** Vitest
- **Renderização:** React Testing Library
- **Localização:** `__tests__/shell/`
- **Critério de conclusão:** Todos os 40 testes passando

---

## 24. ATIVIDADES PARA O CLAUDE CODE

### Fase 1 — Fundação (Estimativa: 4h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 1.1 | Criar tipos TypeScript (`types/shell.ts`) | 0.5h | — |
| 1.2 | Criar constantes de layout (`lib/constants.ts`) | 0.25h | — |
| 1.3 | Criar configuração de módulos (`lib/modules.ts`) | 0.75h | 1.1 |
| 1.4 | Criar Zustand store (`stores/shell-store.ts`) | 0.75h | 1.1 |
| 1.5 | Criar hooks: `useShell`, `useMode`, `useTheme`, `useBreakpoint`, `useActiveModule` | 1h | 1.4 |
| 1.6 | Configurar fontes Google no Next.js (`app/fonts.ts`) | 0.25h | — |
| 1.7 | Criar tokens CSS globais (variáveis dos 4 temas) | 0.5h | — |

### Fase 2 — Componentes Shell (Estimativa: 10h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 2.1 | Criar `SyncLifeLogo.tsx` (SVG inline extraído do protótipo) | 0.5h | — |
| 2.2 | Criar `ModuleTooltip.tsx` | 0.5h | — |
| 2.3 | Criar `ModuleBar.tsx` (6 botões + avatar + pill indicators) | 2h | 1.3, 2.1, 2.2 |
| 2.4 | Criar `SidebarScore.tsx` (Life Sync Score widget) | 1h | 1.7 |
| 2.5 | Criar `Sidebar.tsx` (expandida + colapsada + nav items + badges) | 2.5h | 1.3, 2.4 |
| 2.6 | Criar `ModePill.tsx` (toggle + gate PRO) | 1h | 1.4, 1.5 |
| 2.7 | Criar `ThemePill.tsx` (toggle sem restrição) | 0.5h | 1.4 |
| 2.8 | Criar `NotifButton.tsx` (sino + badge dot) | 0.5h | — |
| 2.9 | Criar `TopHeader.tsx` (breadcrumb + greeting + pills + notif) | 1.5h | 2.6, 2.7, 2.8 |

### Fase 3 — Mobile (Estimativa: 4h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 3.1 | Criar `MobileBottomBar.tsx` (5 tabs) | 1.5h | 1.3 |
| 3.2 | Criar Sheet "Mais" (Conquistas, Config, Perfil, toggles) | 1h | 2.6, 2.7 |
| 3.3 | Criar sub-nav horizontal (tabs scrolláveis no topo do conteúdo) | 1.5h | 1.3 |

### Fase 4 — Orquestração (Estimativa: 4h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 4.1 | Criar `ContentArea.tsx` (wrapper com fade-in e padding) | 0.5h | — |
| 4.2 | Criar `AppShell.tsx` (orquestrador que monta tudo) | 1.5h | Todas Fase 2 e 3 |
| 4.3 | Criar `(app)/layout.tsx` (integra AppShell com App Router) | 0.5h | 4.2 |
| 4.4 | Script anti-FOUC para tema/modo | 0.5h | — |
| 4.5 | Integrar persistência localStorage + Supabase | 1h | 1.4 |

### Fase 5 — Temas Visuais (Estimativa: 3h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 5.1 | Implementar Dark Foco (padrão — já coberto pelos tokens) | 0.25h | 1.7 |
| 5.2 | Implementar Dark Jornada (overrides) | 0.75h | 5.1 |
| 5.3 | Implementar Light Foco (overrides + Module Bar escura) | 0.75h | 5.1 |
| 5.4 | Implementar Light Jornada (gradientes vibrantes) | 1h | 5.3 |
| 5.5 | QA visual: testar as 4 combinações side by side | 0.25h | 5.4 |

### Fase 6 — Testes (Estimativa: 4h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 6.1 | Escrever testes T01–T10 (Module Bar) | 1h | 2.3 |
| 6.2 | Escrever testes T11–T14 (Sidebar + Score) | 0.75h | 2.5 |
| 6.3 | Escrever testes T15–T23 (Header + Pills + Notif) | 1h | 2.9 |
| 6.4 | Escrever testes T24–T30 (Mobile + Content) | 0.75h | 3.1 |
| 6.5 | Escrever testes T31–T40 (Persistência + Temas) | 0.5h | 4.5, 5.4 |

### Fase 7 — QA Final (Estimativa: 2h)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 7.1 | Teste responsivo: 375px, 768px, 1024px, 1440px, 1920px | 0.5h | Tudo |
| 7.2 | Teste de acessibilidade com axe-core | 0.5h | Tudo |
| 7.3 | Teste de performance (Lighthouse) | 0.25h | Tudo |
| 7.4 | Fix de bugs encontrados nos testes | 0.75h | 7.1–7.3 |

### Resumo de Estimativas

| Fase | Horas |
|------|-------|
| 1 — Fundação | 4h |
| 2 — Componentes Shell | 10h |
| 3 — Mobile | 4h |
| 4 — Orquestração | 4h |
| 5 — Temas Visuais | 3h |
| 6 — Testes | 4h |
| 7 — QA Final | 2h |
| **Total** | **~31h** |

### Ordem de Execução Recomendada

1. Fase 1 inteira (fundação precisa existir primeiro)
2. 2.1 → 2.2 → 2.3 (Module Bar — componente mais independente)
3. 2.4 → 2.5 (Sidebar — depende do Score)
4. 2.6 → 2.7 → 2.8 → 2.9 (Header + controles)
5. 3.1 → 3.2 → 3.3 (Mobile bottom bar + sheet + sub-nav)
6. 4.1 → 4.2 → 4.3 → 4.4 → 4.5 (montagem final)
7. 5.1 → 5.2 → 5.3 → 5.4 → 5.5 (temas visuais)
8. Fase 6 inteira (testes)
9. Fase 7 (QA final)

---

## 25. BENCHMARK E DIFERENCIAIS COMPETITIVOS

### 25.1 Apps de Referência Analisados

| App | O que faz bem | O que o SyncLife faz diferente |
|-----|--------------|-------------------------------|
| **Linear** | Navegação em 2 níveis (workspace → projeto → issues), sidebar colapsável, atalhos de teclado | SyncLife adapta a navegação ao modo do usuário (Foco: compacta / Jornada: expandida + Score) |
| **Notion** | Sidebar com tree hierárquica, colapsável, bread crumb contextual | SyncLife simplifica: em vez de tree infinita, cada módulo tem máximo ~7 itens na sidebar |
| **Discord** | Module bar com ícones circulares + sidebar de canais, pill indicator no servidor ativo | SyncLife usa o mesmo padrão pill indicator, mas com cores semânticas por módulo |
| **Figma** | Sidebar contextual (muda conforme a ferramenta), header com breadcrumb + ações | SyncLife segue o mesmo princípio: sidebar muda por módulo |
| **Monarch Money** | Dashboard financeiro limpo, navegação lateral simples | SyncLife adiciona modo dual (Foco/Jornada) e Life Sync Score — gamificação que Monarch não tem |
| **Todoist** | Bottom bar mobile com 5 tabs, clean e rápido | SyncLife segue o mesmo padrão com "Mais" para overflow |
| **Copilot Money** | Interface premium dark, navegação bottom bar no mobile | SyncLife tem 4 variantes visuais vs 2 do Copilot (dark/light × modo) |

### 25.2 Diferenciais do Shell SyncLife

1. **Dual-mode visual system:** Nenhum app financeiro oferece dois modos de interface que mudam fundamentalmente a experiência (dados puros vs coaching motivacional). Isso permite que o mesmo app atenda perfis diferentes sem comprometer nenhum.

2. **4 combinações de tema:** Dark×Foco, Dark×Jornada, Light×Foco, Light×Jornada criam 4 identidades visuais distintas. Isso dá ao usuário uma sensação de personalização profunda — "esse app é meu, do meu jeito".

3. **Life Sync Score integrado na navegação:** O score está na sidebar (não escondido em uma tela separada), funcionando como um lembrete constante de progresso. É um loop motivacional passivo — toda vez que o usuário olha para a esquerda, vê seu score.

4. **Cores semânticas por módulo:** Cada módulo tem sua cor identitária. O usuário sabe instintivamente "estou em finanças" pelo tom esmeralda ou "estou em metas" pelo azul. Isso reduz carga cognitiva e acelera a navegação.

5. **Gate PRO elegante:** Em vez de esconder funcionalidades PRO (que frustra), o SyncLife mostra tudo mas aplica gates contextuais. O usuário vê o badge PRO no Planejamento, clica, e recebe um pitch focado. É upsell nativo sem ser intrusivo.

### 25.3 Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| 4 temas aumentam complexidade de QA | Automated visual regression tests com Percy ou Chromatic |
| Shell com muitos componentes Client → bundle grande | Tree-shaking + dynamic imports para Bottom Bar (mobile-only) |
| Persistência localStorage + Supabase pode dessincar | Regra clara: localStorage para leitura rápida, Supabase como truth, sync em background |
| Sidebar colapsada pode confundir usuários novos | Tooltip no primeiro uso ("Clique para expandir o menu") + expandida por padrão no primeiro acesso |

---

## REFERÊNCIAS CRUZADAS

### Telas que dependem deste shell

Todas as telas dentro do grupo `(app)` dependem do shell:
- Home (Dashboard Unificado)
- Finanças: Dashboard, Transações, Recorrentes, Orçamentos, Calendário, Planejamento, Relatórios
- Metas: Minhas Metas, Nova Meta, Detalhe da Meta
- Agenda: Semanal, Mensal
- Conquistas
- Configurações

### Dados compartilhados

- **Módulo ativo:** Determinado pela rota, consumido por Module Bar, Sidebar e Header
- **Modo (Foco/Jornada):** Zustand store → consumido por todos os componentes para adaptar visual
- **Tema (Dark/Light):** Zustand store → classes CSS no body
- **Sidebar state:** Zustand store → persistido em localStorage + Supabase
- **User plan (FREE/PRO):** Necessário para gate do Modo Jornada e badges PRO
- **Notif count:** Necessário para badge do sino

### Dependências de desenvolvimento

```
Este documento (17-NAVEGACAO-SHELL-DEV-SPEC.md)
├── NÃO depende de nenhuma outra tela (é fundacional)
├── Depende de:
│   ├── Supabase configurado (auth + profiles table com campos mode, theme, sidebar_state)
│   ├── Next.js App Router com route groups (auth) e (app)
│   └── Design system tokens (este doc define os tokens)
└── É dependência para:
    ├── TODAS as telas do MVP v2
    └── Qualquer spec futura de tela (referencia este shell)
```

---

## CHECKLIST DE VALIDAÇÃO FINAL

### Escopo
- [x] O doc especifica APENAS componentes do shell
- [x] O doc NÃO contém specs de conteúdo de telas específicas
- [x] Todas as 4 camadas estão especificadas (Module Bar, Sidebar, Header, Bottom Bar)

### Design System
- [x] Nenhuma cor é hardcoded (todas referenciam tokens)
- [x] Nenhuma fonte é inventada (todas são Syne, DM Sans ou DM Mono)
- [x] Seção de tokens lista os 4 temas completos
- [x] Breakpoints seguem o padrão: mobile < 640, tablet 640-1024, desktop > 1024, wide > 1440

### Modos e Temas
- [x] Cada componente descreve comportamento no Modo Foco
- [x] Cada componente descreve comportamento no Modo Jornada
- [x] As 4 combinações visuais estão documentadas
- [x] Gate PRO para Modo Jornada está especificado

### Regras de Negócio
- [x] Gate PRO tem fluxo claro
- [x] Persistência de estado está definida (localStorage + Supabase)
- [x] Conquistas definido como módulo separado na Module Bar
- [x] Sidebar colapsa para 56px no desktop, desaparece no mobile

### Testes
- [x] 40 testes unitários definidos
- [x] Testes cobrem: renderização, estados, interações, modos, temas, responsividade
- [x] Critério de conclusão: todos os 40 testes passando

### Atividades
- [x] 7 fases de desenvolvimento definidas
- [x] Cada atividade tem estimativa e dependências
- [x] Total geral: ~31 horas
- [x] Ordem de execução definida

### Geral
- [x] Índice completo com 25 seções
- [x] Protótipo de referência indicado: `proto-navigation-v3.html`
- [x] Dependências listadas (Supabase, route groups, tokens)
- [x] Referências cruzadas documentadas (todas as telas dependem deste shell)
- [x] Benchmark competitivo com 7 apps analisados

---

*Documento criado em: 23/02/2026*
*Versão: 1.0*
*Protótipo base: `proto-navigation-v3.html` (Aprovado)*
*Guia seguido: `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`*
