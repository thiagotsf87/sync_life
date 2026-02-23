# 13 — LANDING PAGE: Especificação Completa para Desenvolvimento

**Documento de referência para implementação em Next.js**
**Protótipo aprovado:** `proto-landing.html`
**Dependência:** Nenhuma (pode ser desenvolvida independentemente)
**Prioridade:** Máxima — é a primeira impressão do produto no mundo

---

## ÍNDICE

1. [Visão Geral da Página](#1-visão-geral)
2. [Stack Técnica e Dependências](#2-stack-técnica)
3. [Design System: Tokens Obrigatórios](#3-design-system)
4. [Tipografia](#4-tipografia)
5. [Sistema de Animações](#5-animações)
6. [Seção por Seção: Especificação Completa](#6-seções)
   - 6.1 Navbar
   - 6.2 Hero
   - 6.3 Social Proof Strip
   - 6.4 Features (3 Módulos)
   - 6.5 Modo Foco vs Jornada
   - 6.6 Life Sync Score
   - 6.7 Planejamento Futuro
   - 6.8 Depoimentos
   - 6.9 Pricing
   - 6.10 CTA Final
   - 6.11 Footer
7. [Responsividade](#7-responsividade)
8. [SEO e Meta Tags](#8-seo)
9. [Analytics e Tracking](#9-analytics)
10. [Acessibilidade](#10-acessibilidade)
11. [Performance](#11-performance)
12. [Atividades para o Claude Code](#12-atividades)

---

## 1. VISÃO GERAL

A Landing Page do SyncLife é a porta de entrada do produto. Seu objetivo é converter visitantes em usuários cadastrados, comunicando o posicionamento: **"O sistema operacional da sua vida"**.

### Estrutura de Seções (ordem de cima para baixo)

| # | Seção | Objetivo | Âncora |
|---|-------|----------|--------|
| 1 | Navbar | Navegação fixa + CTAs | — |
| 2 | Hero | Primeira impressão + conversão | — |
| 3 | Social Proof Strip | Credibilidade por referências | — |
| 4 | Features (3 Módulos) | Comunicar funcionalidades | `#features` |
| 5 | Modo Foco vs Jornada | Diferencial competitivo | `#modos` |
| 6 | Life Sync Score | Explicar feature exclusiva | `#score` |
| 7 | Planejamento Futuro | Showcase da feature mais estratégica | — |
| 8 | Depoimentos | Social proof com personas | — |
| 9 | Pricing | Conversão free/pro | `#precos` |
| 10 | CTA Final | Última chance de conversão | — |
| 11 | Footer | Links legais e navegação auxiliar | — |

### Princípios de Design

- **Tema fixo:** Apenas dark mode (navy profundo). A landing page NÃO oferece toggle de tema.
- **Abordagem visual:** Premium fintech com gradientes sutis e efeitos de glow.
- **Tom:** Direto, confiante, brasileiro. Sem jargões excessivos, frases curtas e impactantes.
- **Conversão:** Pelo menos 3 pontos de CTA (Hero, Pricing e CTA Final).

---

## 2. STACK TÉCNICA E DEPENDÊNCIAS

### Framework
- **Next.js** (App Router)
- Rota: `/` (página raiz do projeto)
- A landing page é pública (sem autenticação)
- Server Component por padrão; Client Components apenas onde necessário (navbar scroll, animações)

### Dependências Necessárias
- **Fontes Google:** Syne (400-800), DM Sans (300-600), DM Mono (400-500) — via `next/font/google`
- **Lucide React** — para ícones SVG inline (seta do CTA, chevrons, etc.)
- **Framer Motion** (opcional mas recomendado) — para scroll reveal animations. Se não usar Framer Motion, usar Intersection Observer nativo
- **Nenhuma dependência de UI extra** — a landing page usa CSS puro/Tailwind, NÃO usa shadcn/ui

### Estrutura de Arquivos Sugerida

```
app/
  (landing)/
    page.tsx                  ← Server Component principal
    layout.tsx                ← Layout sem sidebar/nav do app
    components/
      Navbar.tsx              ← Client Component (scroll listener)
      Hero.tsx
      SocialStrip.tsx
      FeaturesModules.tsx
      ModesSection.tsx
      LifeScoreSection.tsx
      PlanningSection.tsx
      TestimonialsSection.tsx
      PricingSection.tsx
      CTAFinal.tsx
      Footer.tsx
      ScrollReveal.tsx        ← Client Component wrapper de animação
      AppPreview.tsx          ← Client Component (mockup interativo do hero)
    styles/
      landing.css             ← CSS específico da landing page (variáveis + estilos)
```

---

## 3. DESIGN SYSTEM: TOKENS OBRIGATÓRIOS

Todas as cores, espaçamentos e radii devem usar variáveis CSS. **Nenhuma cor hardcoded.**

### 3.1 Paleta de Cores (apenas Dark — landing page é fixa em dark)

```css
:root {
  /* Backgrounds (navy profundo) */
  --bg:       #03071a;     /* fundo principal da página */
  --s1:       #07112b;     /* surface 1: cards, painéis */
  --s2:       #0c1a3a;     /* surface 2: inputs, badges, barras */
  --s3:       #132248;     /* surface 3: hover states */

  /* Borders */
  --border:   rgba(255,255,255,0.06);   /* borda padrão sutil */
  --border-h: rgba(255,255,255,0.13);   /* borda hover — mais visível */

  /* Textos */
  --t1:  #dff0ff;    /* texto primário (headlines, valores) */
  --t2:  #6e90b8;    /* texto secundário (descrições, parágrafos) */
  --t3:  #2e4a6e;    /* texto terciário (labels, captions, metadata) */

  /* Brand: Esmeralda (primária) */
  --em:    #10b981;
  --em-g:  rgba(16,185,129,0.15);    /* glow/background sutil */

  /* Brand: Electric Blue (secundária) */
  --el:    #0055ff;
  --el-g:  rgba(0,85,255,0.15);

  /* Cores dos Módulos */
  --fin:   #10b981;   /* Finanças = Esmeralda */
  --meta:  #0055ff;   /* Metas = Electric Blue */
  --ag:    #06b6d4;   /* Agenda = Ciano */

  /* Semânticas */
  --green:  #10b981;
  --yellow: #f59e0b;
  --red:    #f43f5e;
  --orange: #f97316;

  /* Radii */
  --radius-sm: 10px;
  --radius:    16px;
  --radius-lg: 24px;
}
```

### 3.2 Gradientes Recorrentes

| Nome | CSS | Onde Usar |
|------|-----|-----------|
| grad-em | `linear-gradient(135deg, #10b981, #34d399)` | Texto gradiente esmeralda |
| grad-el | `linear-gradient(135deg, #0055ff, #3b82f6)` | Texto gradiente azul |
| grad-main | `linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #0055ff 100%)` | Texto gradiente hero "da sua vida." |
| brand-gradient | `linear-gradient(135deg, var(--em), var(--el))` | Logo icon, score ring |

### 3.3 Efeitos de Background

- **Orbs do Hero:** Esferas blur(100px) com opacidade 0.18 e animação `float` (8s ease-in-out infinite)
- **Grid pattern:** Background-image com linhas 48x48px a `rgba(255,255,255,0.025)`, mascaradas com `radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)`
- **Section backgrounds:** Gradientes verticais `transparent → var(--s1) → transparent` para separar seções visualmente

---

## 4. TIPOGRAFIA

### Famílias Obrigatórias

| Família | Import | Peso | Uso na Landing |
|---------|--------|------|----------------|
| **Syne** | Google Fonts | 400, 500, 600, 700, 800 | Hero title, section titles, preços, score numbers, logo text, card titles |
| **DM Sans** | Google Fonts | 300, 400, 500, 600 | Corpo de texto, descrições, botões, nav links, features list |
| **DM Mono** | Google Fonts | 400, 500 | URL no mockup, valores monetários, percentuais, labels de dados |

### Escala Tipográfica da Landing

| Elemento | Fonte | Tamanho | Peso | Cor | Extra |
|----------|-------|---------|------|-----|-------|
| Hero title | Syne | clamp(44px, 7vw, 80px) | 800 | var(--t1) | line-height: 1.08, letter-spacing: -0.03em |
| Hero subtitle | DM Sans | clamp(17px, 2vw, 20px) | 400 | var(--t2) | line-height: 1.65, max-width: 560px |
| Section label | DM Sans | 11px | 600 | var(--em) | uppercase, letter-spacing: 0.1em, com barra horizontal à esquerda (20px × 1px) |
| Section title | Syne | clamp(32px, 4.5vw, 52px) | 800 | var(--t1) | letter-spacing: -0.025em, line-height: 1.12 |
| Section subtitle | DM Sans | 17px | 400 | var(--t2) | line-height: 1.65, max-width: 520px |
| Module title (card) | Syne | 22px | 700 | var(--t1) | — |
| Module description | DM Sans | 14px | 400 | var(--t2) | line-height: 1.7 |
| Module feature item | DM Sans | 13px | 400 | var(--t2) | line-height: 1.5, seta "→" colorida à esquerda |
| Button primary | DM Sans | 15px | 600 | #03071a (dark sobre fundo verde) | — |
| Button secondary | DM Sans | 15px | 500 | var(--t2) | — |
| Nav link | DM Sans | 14px | 500 | var(--t2), hover: var(--t1) | — |
| Price number | Syne | 52px | 800 | var(--t1) ou grad-em | line-height: 1 |
| Footer links | DM Sans | 14px | 400 | var(--t2), hover: var(--t1) | — |
| Footer legal | DM Sans | 12px | 400 | var(--t3), hover: var(--t2) | — |

---

## 5. SISTEMA DE ANIMAÇÕES

### 5.1 Scroll Reveal (usado em praticamente todas as seções)

Criar um componente `<ScrollReveal>` (Client Component) que aplica a classe `.visible` quando o elemento entra no viewport.

```
Comportamento padrão:
- Estado inicial: opacity: 0, translateY(32px)
- Transição: opacity 0.7s ease, transform 0.7s ease
- Trigger: IntersectionObserver com threshold 0.12 e rootMargin '0px 0px -40px 0px'
- Uma vez visível, unobserve (não reverter)
```

**Delays escalonados (para cards em grid):**

| Classe | Delay |
|--------|-------|
| reveal-delay-1 | 0.1s |
| reveal-delay-2 | 0.2s |
| reveal-delay-3 | 0.3s |
| reveal-delay-4 | 0.4s |

### 5.2 Animações do Hero (CSS keyframes, sem IntersectionObserver)

Todos os elementos do Hero animam na entrada da página:

| Elemento | Animação | Delay |
|----------|----------|-------|
| Hero badge | fadeDown (translateY -12px → 0) | 0s |
| Hero title | fadeUp (translateY 24px → 0) | 0.1s |
| Hero subtitle | fadeUp | 0.2s |
| Hero actions | fadeUp | 0.3s |
| Hero disclaimer | fadeUp | 0.4s |
| App preview | fadeUp | 0.5s |

Duração de todas: 0.7s (badge: 0.6s), ease, `animation-fill-mode: both`.

### 5.3 Animações de Background

| Animação | Keyframes | Uso |
|----------|-----------|-----|
| float | `0%,100%: translateY(0) scale(1)` → `50%: translateY(-30px) scale(1.05)` | Orbs do hero, 8s ease-in-out infinite |
| pulse-dot | `0%,100%: opacity 1, scale(1)` → `50%: opacity 0.5, scale(0.7)` | Badge dot do hero, 2s ease-in-out infinite |
| rotate-ring | `0%: rotate(0)` → `100%: rotate(360deg)` | Anel do Life Sync Score, 12s linear infinite |
| marquee | `0%: translateX(0)` → `100%: translateX(-50%)` | Social proof strip, 20s linear infinite |

---

## 6. SEÇÃO POR SEÇÃO: ESPECIFICAÇÃO COMPLETA

---

### 6.1 — NAVBAR

**Tipo de componente:** Client Component (listener de scroll)

#### Layout
- Fixa no topo (position: fixed, z-index: 100)
- Altura: 64px
- Fundo: `rgba(3,7,26,0.72)` com `backdrop-filter: blur(20px)`
- Borda inferior: 1px solid var(--border)
- Layout: flex, align-items center, justify-content space-between
- Padding horizontal: 32px

#### Estado de Scroll
Quando `window.scrollY > 60`, adicionar classe `.scrolled`:
- Background muda para `rgba(3,7,26,0.92)` — mais opaco
- Border-bottom-color muda para `rgba(255,255,255,0.08)`
- Transição: all 0.3s

#### Elementos (esquerda → direita)

**Logo (esquerda):**
- Link para `#` (topo da página)
- Ícone SVG do SyncLife (32×32px) — usar o SVG base64 do protótipo, OU substituir por `<Image>` do Next.js se SVG for extraído como arquivo
- Texto "SyncLife" ao lado: Syne, 18px, weight 700, cor var(--t1)
- Gap entre ícone e texto: 10px

**Links de navegação (centro):**
- Flex, gap 4px
- Links: "Funcionalidades" (#features), "Modos" (#modos), "Life Score" (#score), "Preços" (#precos)
- Cada link: padding 6px 14px, border-radius 100px, cor var(--t2), font-size 14px, weight 500
- Hover: cor var(--t1)
- Smooth scroll ao clicar (usar `scrollIntoView({ behavior: 'smooth', block: 'start' })`)

**CTA (direita):**
- Flex, gap 10px
- Botão Ghost "Entrar": fundo transparent, cor var(--t2), 14px, weight 500, padding 9px 16px, radius 100px, sem borda
- Botão Primary "Começar grátis": fundo var(--em), cor #03071a, 14px, weight 600, padding 9px 20px, radius 100px

#### Mobile (≤768px)
- Links de navegação: `display: none`
- Mostrar ícone de hamburger (pode ser Lucide `Menu` icon)
- Menu mobile: drawer lateral ou dropdown — especificar comportamento
- **Nota:** No protótipo, o hamburger está marcado como `display: none` com placeholder `.nav-hamburger`. Implementar menu mobile funcional.

#### Regras de Negócio
- Scroll suave para todas as âncoras internas (`href="#..."`)
- Botão "Entrar" → rota `/login`
- Botão "Começar grátis" → rota `/cadastro`

---

### 6.2 — HERO

**Tipo de componente:** Server Component + Client Component (AppPreview)

#### Layout
- `min-height: 100vh` (ocupa tela inteira)
- Flex, column, align-items center, justify-content center, text-align center
- Padding: 120px 32px 80px (mobile: 100px 20px 60px)
- Position relative, overflow hidden

#### Background Mesh (decorativo)
Três esferas (orbs) absolutamente posicionadas com blur, atrás de todo o conteúdo:

| Orb | Tamanho | Cor | Posição | Blur | Opacidade | Animation-delay |
|-----|---------|-----|---------|------|-----------|-----------------|
| orb-1 | 600×600px | var(--em) | top: -200px, left: -150px | blur(100px) | 0.18 | 0s |
| orb-2 | 500×500px | var(--el) | top: -100px, right: -150px | blur(100px) | 0.18 | -3s |
| orb-3 | 400×400px | var(--ag) | bottom: -100px, left: 30% | blur(100px) | 0.10 | -6s |

Grid overlay por cima dos orbs: linhas de 48×48px, cor `rgba(255,255,255,0.025)`, com máscara radial elíptica.

#### Conteúdo do Hero

**1. Badge (topo):**
- Inline-flex, align-items center, gap 8px
- Background: `rgba(16,185,129,0.1)`, border `1px solid rgba(16,185,129,0.25)`, radius 100px
- Padding: 6px 16px
- Ícone SyncLife 16×16px à esquerda
- Texto: "MVP v2 — Beta aberto"
- Font-size: 12px, weight 600, cor var(--em), uppercase, letter-spacing 0.05em
- Margin-bottom: 28px

**2. Título Principal (H1):**
- Syne, clamp(44px, 7vw, 80px), weight 800
- Linha 1: "O sistema operacional" — cor var(--t1)
- Linha 2: "da sua vida." — gradiente `grad-main` (emerald → cyan → blue)
- Cada linha é um `<span>` com `display: block`
- Max-width: 860px, margin-bottom: 24px

**3. Subtítulo:**
- DM Sans, clamp(17px, 2vw, 20px), weight 400, cor var(--t2)
- Texto: "Finanças, metas e agenda num único app. Dois modos de uso — análise objetiva ou motivação diária — para quem quer evoluir, não só acompanhar."
- Max-width: 560px, line-height 1.65, margin-bottom 44px

**4. Botões de Ação:**
- Flex, center, gap 12px, wrap
- **Primary "Começar grátis":** padding 16px 36px, font-size 16px, com box-shadow `0 0 40px rgba(16,185,129,0.25)`. Ícone: seta para direita SVG inline (Lucide `ArrowRight`, 16px, stroke-width 2.5)
  - Hover: background #0ed99a, translateY(-1px), box-shadow `0 8px 32px rgba(16,185,129,0.35)`
- **Secondary "Ver funcionalidades":** link para #features

**5. Disclaimer:**
- Font-size: 12px, cor var(--t3)
- Texto: "Grátis para começar · Sem cartão de crédito · Cancele quando quiser"

**6. App Preview (mockup do dashboard):**
- Margin-top: 72px, max-width: 960px, width: 100%
- **Escondido em mobile (≤768px):** `display: none`
- Frame com background var(--s1), border `1px solid rgba(255,255,255,0.08)`, radius 20px, overflow hidden
- Box-shadow: `0 0 0 1px rgba(255,255,255,0.04), 0 40px 120px rgba(0,0,0,0.5), 0 0 80px rgba(16,185,129,0.06)`
- Hover no frame: box-shadow ganha mais glow verde

**Estrutura interna do mockup:**

```
┌─ Topbar ────────────────────────────────────────────────┐
│ [●][●][●]    app.synclife.com.br/dashboard              │
├─ Body ──────────────────────────────────────────────────┤
│ Sidebar │ Content                                       │
│ [Logo]  │ Header: "Boa tarde, Thiago! ✨" / "Fev 2026" │
│ [💰] ← │ [Life Sync Score bar: 74]                     │
│ [🎯]   │ [Receitas R$5.000] [Despesas R$3.200] [Saldo] │
│ [📅]   │ [Mini chart: barras income/expense alternadas] │
│         │                                               │
│ [⚙️]   │                                               │
└─────────┴───────────────────────────────────────────────┘
```

**Topbar do mockup:**
- Background var(--s2), border-bottom, padding 14px 20px
- 3 dots (vermelho/amarelo/verde com opacidade 0.5)
- URL bar: background var(--s3), border, radius 6px, DM Mono 11px, cor var(--t3), texto "app.synclife.com.br/dashboard"

**Sidebar do mockup:**
- Width 56px, background var(--s2), border-right
- Ícones: Logo SyncLife (36×36), 💰 (ativo, com background `rgba(16,185,129,0.15)` e cor var(--em)), 🎯, 📅, spacer, ⚙️
- Cada ícone: 36×36px, border-radius 10px, font-size 16px

**Content do mockup:**
- Header: "Boa tarde, Thiago! ✨" (Syne, 16px, 700) + "Fevereiro 2026" (11px, var(--t3)) + Badge "Fev 2026 ▼"
- Score bar: gradiente fundo, border esmeralda, "74" grande (Syne 28px 800, gradiente), label "Life Sync Score", frase, barra de progresso 74%
- 3 cards (grid 3 colunas): Receitas (+R$5.000, verde), Despesas (R$3.200, vermelho), Saldo (+R$1.800, verde)
- Mini chart: 12 barras alternando income (verde) e expense (vermelho) com alturas variadas

#### Regras de Negócio
- Botão "Começar grátis" → `/cadastro`
- Botão "Ver funcionalidades" → smooth scroll para `#features`
- O mockup é estático (apenas visual, sem interatividade)

---

### 6.3 — SOCIAL PROOF STRIP

**Tipo de componente:** Client Component (animação marquee)

#### Layout
- Padding: 40px 0
- Border-top e border-bottom: 1px solid var(--border)
- Container interno: flex, align-items center, gap 48px

#### Conteúdo
- **Label:** "Inspirado por apps de referência" — font-size 12px, cor var(--t3), white-space nowrap
- **Logos (texto):** Syne, 14px, weight 700, cor var(--t3), opacity 0.5, grayscale(1)
  - Hover: opacity 0.8, grayscale removido
  - Nomes: Monarch Money, Linear, Notion, Todoist, Fabulous, YNAB, Obsidian
  - **Duplicar os nomes** (total 14 itens) para criar loop infinito de marquee
  - Animação: `translateX(0) → translateX(-50%)`, 20s linear infinite

#### Regras de Negócio
- Nenhum link externo — são referências de benchmark, não parcerias
- O marquee roda infinitamente

---

### 6.4 — FEATURES: 3 MÓDULOS

**Tipo de componente:** Server Component + ScrollReveal wrapper
**Âncora:** `id="features"`

#### Layout
- Padding: 112px 0
- Background: gradiente vertical `transparent → var(--s1) 30% → var(--s1) 70% → transparent`
- Header centralizado: section-label "Funcionalidades" + title "Três módulos. Uma vida organizada." + subtitle

#### Grid de Módulos
- `grid-template-columns: repeat(3, 1fr)`, gap 20px
- 1024px: 2 colunas (terceiro card full width)
- 768px: 1 coluna

#### Card de Módulo (×3)

Cada card tem:
- Background: var(--bg)
- Border: 1px solid var(--border)
- Border-radius: var(--radius-lg) = 24px
- Padding: 36px 32px
- Hover: border-color var(--border-h), translateY(-4px)
- Pseudo-elemento `::before` para glow no topo: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(COR,0.08), transparent)` — aparece no hover (opacity 0 → 1)

**Card 1 — Finanças (classe .fin):**
- Ícone: 💰 (52×52px, radius 14px, background `rgba(16,185,129,0.12)`)
- Label: "FINANÇAS" — 11px, weight 600, cor var(--fin), uppercase
- Título: "Controle total do seu dinheiro" — Syne, 22px, 700
- Descrição: "Não apenas registrar gastos — mas entender o futuro do seu caixa e tomar decisões hoje que impactam amanhã."
- Features list (5 itens, seta "→" em cor var(--fin)):
  1. "Planejamento futuro com projeção de fluxo de caixa"
  2. "Sistema de orçamentos por envelopes (modelo 50/30/20)"
  3. "Transações recorrentes com geração automática"
  4. "Calendário financeiro visual"
  5. "Relatórios e exportação PDF/Excel"

**Card 2 — Metas (classe .meta):**
- Ícone: 🎯 (background `rgba(0,85,255,0.12)`)
- Label: "METAS" — cor var(--meta)
- Título: "Metas que você realmente atinge"
- Descrição: "Crie metas com prazo, acompanhe o ritmo real e saiba exatamente o que precisa fazer hoje para chegar lá."
- Features list (seta "→" em cor var(--meta)):
  1. "Metas financeiras conectadas ao orçamento"
  2. "Projeção automática de data de conclusão"
  3. "Registro de progresso com histórico"
  4. "Alertas quando o ritmo estiver abaixo do necessário"
  5. "Vínculo com agenda para bloqueio de tempo"

**Card 3 — Agenda (classe .ag):**
- Ícone: 📅 (background `rgba(6,182,212,0.12)`)
- Label: "AGENDA" — cor var(--ag) = #06b6d4
- Título: "Organize seu tempo com intenção"
- Descrição: "Uma agenda que sabe para onde você quer ir. Blocos de tempo conectados às suas metas e ao seu planejamento financeiro."
- Features list (seta "→" em cor var(--ag)):
  1. "Visão semanal e mensal integrada"
  2. "Eventos vinculados às suas metas ativas"
  3. "Compromissos financeiros no calendário"
  4. "Lembretes inteligentes por contexto"
  5. "Integração com Google Calendar (em breve)"

---

### 6.5 — MODO FOCO vs JORNADA

**Tipo de componente:** Server Component + ScrollReveal
**Âncora:** `id="modos"`

#### Layout
- Padding: 112px 0
- Background decorativo: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,85,255,0.05), transparent)` (position absolute)
- Grid interna: 2 colunas (1fr 1fr), gap 48px
- Header ocupa full width (grid-column: 1 / -1)
- 1024px: 1 coluna

#### Header
- Section label: "Personalização"
- Section title: "Um app, duas personalidades."
- Section subtitle: "Você decide como quer enxergar sua vida. Dados objetivos ou motivação diária — e pode trocar quando quiser."

**Toggle de Modos (visual, sem funcionalidade):**
- Flex, gap 12px, margin-top 32px
- 2 botões toggle (ambos `.active` no protótipo, mostram os dois modos simultaneamente):
  - **Modo Foco:** ícone 🎯, título "Modo Foco" (Syne 14px 700), descrição "Dados precisos, sem distrações" (12px, var(--t3)). Border 2px verde quando ativo, background `rgba(16,185,129,0.06)`
  - **Modo Jornada:** ícone 🌱, título "Modo Jornada", descrição "Motivação e progresso visual". Border 2px azul quando ativo, background `rgba(0,85,255,0.06)`
- Padding: 12px 20px, radius 12px

#### Card Foco (coluna esquerda)
- Background: var(--s1), border esmeralda `rgba(16,185,129,0.2)`, radius var(--radius-lg)
- **Header do card:**
  - Badge: "🎯 Modo Foco" — background `rgba(16,185,129,0.1)`, cor var(--em), border `rgba(16,185,129,0.2)`, 11px weight 700 uppercase
  - Título: "Fevereiro 2026" (Syne 16px 700)
  - Subtítulo: "Dashboard financeiro" (12px, var(--t3))
  - Border-bottom separador

- **Body — Painel de dados densos:**
  - 3 linhas de dados (foco-row):
    - `receita_total` → `+R$ 5.000,00` (verde)
    - `despesa_total` → `−R$ 3.200,00` (vermelho)
    - `saldo_mes` → `+R$ 1.800,00` (verde)
    - Cada linha: flex, space-between, padding 10px 14px, background var(--s2), border, radius 8px
    - Labels em DM Mono 12px, cor var(--t3)
    - Valores em DM Mono 14px, weight 500

  - 3 barras de progresso de categorias (foco-bar-row):
    - `alimentacao` → 87% (cor var(--orange))
    - `transporte` → 54% (cor var(--green))
    - `lazer` → 38% (cor var(--green))
    - Barra: height 4px, background var(--s3), fill com cor dinâmica

- **Traits (abaixo do painel):**
  - 📊 "Interface compacta" — "Só o que importa. Sem animações, sem distrações."
  - 🔢 "Números em destaque" — "Tipografia mono para precisão técnica total."

#### Card Jornada (coluna direita)
- Background: var(--s1), border azul `rgba(0,85,255,0.2)`, radius var(--radius-lg)
- **Header do card:**
  - Badge: "🌱 Modo Jornada" — background `rgba(0,85,255,0.1)`, cor var(--el), border azul
  - Título: "Boa tarde, Thiago! ✨" (Syne 16px 700)
  - Subtítulo: "Você está evoluindo. Continue assim! 🌟"

- **Body — Painel motivacional:**
  - **Score block:** gradiente fundo `rgba(16,185,129,0.08) → rgba(0,85,255,0.10)`, border esmeralda, radius 12px, padding 16px
    - Número "74" (Syne 40px 800, gradiente emerald→blue)
    - "LIFE SYNC SCORE" label
    - Frase: "Você está consistente!" (itálico, 13px)
    - Variação: "↑ +3 esta semana" (cor esmeralda, weight 600)

  - **Goal card:** Viagem Europa
    - Header: "✈️ Viagem Europa" + "⚠️ Em risco" (amarelo)
    - Barra de progresso: 28%, gradiente esmeralda
    - Footer: "28% — R$4.200 / R$15.000" + "Dez 2026"

  - **Insight block:** fundo `rgba(16,185,129,0.05)`, border `rgba(16,185,129,0.15)`
    - Ícone: 💡
    - Texto: "Se você adicionar **R$200/mês** a mais em Viagem Europa, atinge sua meta **2 meses antes**. Quer ajustar?"

- **Traits:**
  - 🏆 "Conquistas e badges" — "Celebra cada marco da sua jornada."
  - 🤖 "Insights com IA" — "Sugestões personalizadas baseadas nos seus dados."

---

### 6.6 — LIFE SYNC SCORE

**Tipo de componente:** Client Component (animação de anel rotativo)
**Âncora:** `id="score"`

#### Layout
- Padding: 112px 0
- Background: gradiente vertical `transparent → var(--s1) 20% → var(--s1) 80% → transparent`
- Grid: 2 colunas (1fr 1fr), gap 72px, align-items center
- 1024px: 1 coluna, gap 48px

#### Visual (coluna esquerda)
- Container de 380×380px centralizado

**Anel Rotativo (conic-gradient):**
- Anel externo: 260×260px (1024px: 200×200), border-radius 50%
- Background: `conic-gradient(var(--em) 0deg, var(--el) 148deg, var(--s3) 148deg, var(--s3) 360deg)` — representando ~41% preenchido (148°/360°)
- Animação: `rotate(0 → 360deg)`, 12s linear infinite
- Anel interno: 200×200px (1024px: 152×152), background var(--s1), border-radius 50%
- Animação reversa: `rotate(360deg → 0)` para o número parecer estático

**Número central:**
- "74" — Syne, 64px (1024px: 48px), weight 800, gradiente emerald→blue
- Label: "Life Score" — 11px, var(--t3), uppercase

**3 Pilares posicionados ao redor do anel:**
- Posição absoluta, width 52px cada

| Pilar | Ícone | % | Label | Posição |
|-------|-------|---|-------|---------|
| Finanças | 💰 | 85% | "Finanças" | top: 10px, center-x |
| Metas | 🎯 | 72% | "Metas" | bottom: 28px, left: 10px |
| Consistência | 🔥 | 60% | "Consistência" | bottom: 28px, right: 10px |

#### Content (coluna direita)
- Section label: "Life Sync Score"
- Title: "Um número que resume sua evolução."
- Subtitle: "O Life Sync Score calcula, em tempo real, como você está indo nas três dimensões da vida organizada."

**Lista de pilares detalhada (3 itens):**

| Pilar | Ícone | Nome | Peso | Barra | Descrição |
|-------|-------|------|------|-------|-----------|
| Financeiro | 💰 | Saúde Financeira | 40% do score | 85% preenchido, gradiente esmeralda | "Saldo positivo, orçamentos respeitados, nenhum alerta ativo." |
| Metas | 🎯 | Progresso em Metas | 35% do score | 72% preenchido, gradiente azul | "Metas no caminho, aportes em dia, nenhuma meta em risco." |
| Consistência | 🔥 | Consistência de Uso | 25% do score | 60% preenchido, gradiente ciano→azul | "Dias ativos no app, eventos da agenda concluídos, streak mantido." |

Cada barra: height 6px, background var(--s3), radius 3px, fill com gradiente.

---

### 6.7 — PLANEJAMENTO FUTURO

**Tipo de componente:** Server Component + ScrollReveal

#### Layout
- Padding: 112px 0
- Grid: `1fr 1.4fr`, gap 72px, align-items center
- 1024px: 1 coluna (visual com order: 2, content com order: 1 — texto primeiro)

#### Visual (coluna esquerda) — Mockup do Planejamento
- Background var(--s1), border, radius var(--radius-lg), overflow hidden, box-shadow `0 24px 80px rgba(0,0,0,0.35)`

**Header do mockup:**
- Background var(--s2), border-bottom, padding 14px 18px
- Título: "📈 Planejamento Futuro" (Syne 13px 700)
- Tabs: "3m", "6m" (ativo), "12m" — ativo tem background `rgba(16,185,129,0.15)`, cor var(--em)

**Gráfico SVG de linha:**
- ViewBox: 0 0 400 120
- Gradiente vertical verde (0.3 → 0, preenchendo área abaixo da linha)
- 3 linhas grid horizontais a `rgba(255,255,255,0.04)`
- Linha principal verde (#10b981) com curva Bézier passando por 5 pontos
- **Zona de alerta vermelha:** segmento em #f43f5e entre meses 4 e 5 (representando queda no saldo)
- Badge de alerta: retângulo com "⚠ IPVA" em vermelho, position sobre a zona de queda
- Dots nos pontos de inflexão (4 verdes, 1 vermelho)

**Grid de meses (6 colunas):**

| Mês | Valor | Cor |
|-----|-------|-----|
| Fev | 1,8k | verde (positivo) |
| Mar | 2,2k | verde |
| Abr | 620 | vermelho (negativo — mês do IPVA) |
| Mai | 1,9k | verde |
| Jun | 3,4k | verde |
| Jul | 2,8k | verde |

**Lista de eventos planejados (4 itens):**

| Dot cor | Nome | Valor | Badge |
|---------|------|-------|-------|
| Verde | Salário — todo dia 28 | +R$5.000 (verde) | recorrente (azul) |
| Azul | Aluguel — todo dia 5 | −R$1.500 (vermelho) | recorrente (azul) |
| Roxo | IPVA — Abril | −R$1.200 (vermelho) | planejado (roxo) |
| Amarelo | Meta: Viagem Europa | −R$800/mês (vermelho) | meta (amarelo) |

Badges: font-size 9px, padding 2px 6px, radius 4px, com background e cor contextual.

**Insight box:**
- 💡 "Em abril seu saldo cai para **R$620** por causa do IPVA. Quer criar um envelope de reserva agora para suavizar esse impacto?"

#### Content (coluna direita)
- Section label: "Planejamento Futuro"
- Title: "Veja seu dinheiro daqui a 12 meses."
- Subtitle: "A funcionalidade mais estratégica do SyncLife. Responde a pergunta que todo app brasileiro evita: *\"Como vai estar meu dinheiro daqui a 6 meses?\"*"

**Tags (4 categorias de dados):**
- Pills com dot colorido + texto: "Receitas recorrentes" (verde), "Despesas recorrentes" (azul), "Eventos planejados" (roxo), "Contribuições de metas" (amarelo)
- Cada pill: padding 7px 14px, radius 100px, border var(--border), font-size 12px, weight 600

**3 Traits:**
- 📅 "Horizonte de 3, 6 ou 12 meses" — "Ajuste o quanto quer ver à frente conforme sua necessidade."
- ⚠️ "Alertas de saldo negativo" — "Quando o saldo projetado fica vermelho, o app sugere ações concretas."
- 🤖 "Insights automáticos com IA" — "Análise contextual baseada nos seus dados reais, não em templates genéricos."

---

### 6.8 — DEPOIMENTOS

**Tipo de componente:** Server Component + ScrollReveal

#### Layout
- Padding: 112px 0
- Background: gradiente vertical `transparent → var(--s1) → transparent`
- Header centralizado: label "Depoimentos", title "Quem já está usando."
- Grid: repeat(3, 1fr), gap 20px
- 1024px: 2 colunas (terceiro card full width)
- 768px: 1 coluna

#### Card de Depoimento (×3)

Cada card:
- Background: var(--bg), border var(--border), radius var(--radius-lg), padding 28px
- Hover: border var(--border-h), translateY(-2px)

**Card 1:**
- ★★★★★ (amarelo, font-size 14px)
- Texto: *"Finalmente um app que mostra o futuro do meu dinheiro. A função de planejamento mudou completamente como eu tomo decisões financeiras."*
- Avatar: círculo 38px com letra "R", gradiente fundo
- Nome: "Rafael M." (13px, 600)
- Cargo: "Engenheiro de Software, 32 anos" (11px, var(--t3))
- Score badge: "🎯 Score: 81 ↑" — background `rgba(16,185,129,0.08)`, cor var(--em), radius 100px

**Card 2:**
- Texto: *"O Modo Jornada me motivou de um jeito que nenhum outro app conseguiu. Desbloqueei minha primeira conquista em 3 dias e não parei mais."*
- Avatar: "A" — Ana C., Designer, 27 anos
- Score: "🌱 Score: 67 ↑ +8"

**Card 3:**
- Texto: *"Uso no Modo Foco e é exatamente o que quero: dados objetivos sem frescura. A visão de orçamentos por envelope é a melhor que já vi em app brasileiro."*
- Avatar: "M" — Marcos T., Analista Financeiro, 38 anos
- Score: "🎯 Score: 91"

#### Regras de Negócio
- Os depoimentos são placeholders (não são reais). Em produção, podem ser substituídos por depoimentos coletados durante o beta.

---

### 6.9 — PRICING

**Tipo de componente:** Server Component + ScrollReveal
**Âncora:** `id="precos"`

#### Layout
- Padding: 112px 0
- Header centralizado: label "Preços", title "Simples e transparente.", subtitle "Comece grátis. Escale quando sua vida exigir mais."
- Grid: 2 colunas, gap 24px, max-width 800px, margin auto
- 768px: 1 coluna, max-width 440px

#### Card GRÁTIS

- Background: var(--s1), border var(--border), radius var(--radius-lg), padding 40px 36px
- Badge: "✦ Grátis" — background `rgba(110,144,184,0.12)`, cor var(--t2), border var(--border)
- Preço: R$ 0 /mês
  - "R$" → Syne 20px 700, cor var(--t2)
  - "0" → Syne 52px 800, cor var(--t1)
  - "/mês" → 14px, cor var(--t3)
- Descrição: "Tudo que você precisa para começar a organizar sua vida financeira."
- Divisor: 1px solid var(--border)

**Features incluídas (8 itens):**

| Ícone | Feature |
|-------|---------|
| ✅ | **Transações ilimitadas** |
| ✅ | **Dashboard financeiro completo** |
| ✅ | **Módulo Metas** (até 3 metas) |
| ✅ | **Agenda básica** |
| ✅ | **5 recorrentes ativas** |
| ✅ | **Planejamento futuro** (3 meses) |
| ⬜ | Life Sync Score (cor var(--t3) — desabilitado) |
| ⬜ | Exportação PDF/Excel (cor var(--t3) — desabilitado) |

- Botão: "Criar conta grátis" — botão secondary (borda, sem fill), full width
- CTA → `/cadastro`

#### Card PRO

- Background: gradiente `rgba(16,185,129,0.04) → rgba(0,85,255,0.04)`, border `rgba(16,185,129,0.3)`
- Pseudo-elemento `::before`: glow radial verde no topo
- **Badge "Recomendado":** position absolute, top 16px, right 16px, background var(--em), cor #03071a, font-size 10px weight 700 uppercase
- Badge: "🚀 PRO" — gradiente background, cor esmeralda, border esmeralda
- Preço: R$ 29 /mês
  - "29" usa gradiente esmeralda (grad-em)
- Descrição: "Para quem leva a sério a organização da vida. Desbloqueie tudo."
- Divisor

**Features incluídas (8 itens):**

| Ícone | Feature |
|-------|---------|
| ✅ | **Tudo do plano Grátis** |
| ✅ | **Life Sync Score** com histórico |
| ✅ | **Metas ilimitadas** |
| ✅ | **Recorrentes ilimitadas** |
| ✅ | **Planejamento futuro** até 12 meses |
| ✅ | **Relatórios + Exportação** PDF e Excel |
| ✅ | **Insights com IA** |
| ✅ | **Suporte prioritário** |

- Botão: "Começar PRO — 14 dias grátis" — botão primary (verde), full width
- Nota: "Sem compromisso. Cancele quando quiser." (12px, var(--t3), center)
- CTA → `/cadastro?plan=pro`

---

### 6.10 — CTA FINAL

**Tipo de componente:** Server Component + ScrollReveal

#### Layout
- Padding: 112px 0, text-align center
- Background decorativo: radial-gradient verde sutil (0.07 opacidade) + grid overlay (igual ao hero, mas com linhas mais sutis 0.02)

#### Conteúdo
- Title: "Sua vida organizada começa **hoje.**" — Syne, clamp(36px, 5vw, 60px), 800. "hoje." usa gradiente grad-main
- Subtitle: "Crie sua conta em menos de 2 minutos. Comece grátis. Sem cartão de crédito." — 18px, var(--t2), max-width 460px, margin auto
- Botões:
  - Primary "Criar conta grátis" — 17px, padding 18px 42px → `/cadastro`
  - Secondary "Explorar funcionalidades" → `#features`
- Nota: "Já tem uma conta? [Entrar →](#)" — 13px, var(--t3), link em cor esmeralda → `/login`

---

### 6.11 — FOOTER

**Tipo de componente:** Server Component

#### Layout
- Border-top: 1px solid var(--border)
- Padding: 56px 0 36px

#### Parte Superior (grid de 4 colunas)
- Grid: `1.5fr 1fr 1fr 1fr`, gap 48px
- 1024px: 2 colunas (2×2)
- 768px: 1 coluna

**Coluna 1 — Brand:**
- Logo: ícone 28×28 + "SyncLife" (Syne 16px 700)
- Tagline: "O sistema operacional da sua vida. Finanças, metas e agenda num único lugar." — 13px, var(--t3), max-width 240px

**Coluna 2 — Produto:**
- Título: "PRODUTO" — 12px, 600, uppercase, letter-spacing 0.08em, var(--t3)
- Links: Funcionalidades, Modo Foco, Modo Jornada, Life Sync Score, Preços

**Coluna 3 — Empresa:**
- Título: "EMPRESA"
- Links: Sobre nós, Blog, Changelog, Roadmap

**Coluna 4 — Suporte:**
- Título: "SUPORTE"
- Links: Central de ajuda, Contato, Status

Todos os links: DM Sans 14px, cor var(--t2), hover var(--t1), sem decoração.

#### Parte Inferior
- Border-top: 1px solid var(--border), padding-top 24px
- Flex, space-between
- Esquerda: "© 2026 SyncLife. Todos os direitos reservados." — 12px, var(--t3)
- Direita: "Termos de Uso", "Política de Privacidade", "Cookies" — 12px, var(--t3), gap 20px

---

## 7. RESPONSIVIDADE

### Breakpoints

| Breakpoint | Comportamento |
|------------|---------------|
| > 1024px | Layout completo, todas as colunas |
| ≤ 1024px | Grids colapsam para 2 colunas ou 1 coluna, score visual reduzido |
| ≤ 768px | Mobile — nav links escondidos, hero preview escondido, tudo 1 coluna |

### Tabela de Mudanças por Breakpoint

| Seção | ≤1024px | ≤768px |
|-------|---------|--------|
| Navbar | Sem mudanças | Nav links ocultos, hamburger visível |
| Hero | Sem mudanças | min-height: auto, padding reduzido, **preview oculto** |
| Features grid | 2 colunas (3º full width) | 1 coluna |
| Modos grid | 1 coluna | 1 coluna, toggle com `flex: 1` |
| Score grid | 1 coluna, anel menor (200px) | 1 coluna |
| Planning grid | 1 coluna (texto primeiro, visual depois via order) | 1 coluna |
| Testimonials grid | 2 colunas (3º full width) | 1 coluna |
| Pricing grid | Sem mudanças | 1 coluna, max-width 440px |
| Footer grid | 2 colunas | 1 coluna, bottom em column/center |
| Container padding | 32px | 20px |
| Section padding | 112px 0 | 72px 0 |

---

## 8. SEO E META TAGS

### Meta Tags Obrigatórias

```tsx
// app/(landing)/layout.tsx ou page.tsx — Next.js metadata export
export const metadata = {
  title: 'SyncLife — O sistema operacional da sua vida',
  description: 'Finanças, metas e agenda num único app. Dois modos de uso — análise objetiva ou motivação diária — para quem quer evoluir, não só acompanhar.',
  keywords: 'finanças pessoais, controle financeiro, metas pessoais, agenda, planejamento financeiro, orçamento pessoal, app financeiro brasileiro',
  authors: [{ name: 'SyncLife' }],
  openGraph: {
    title: 'SyncLife — O sistema operacional da sua vida',
    description: 'Finanças, metas e agenda num único app com Life Sync Score.',
    url: 'https://synclife.com.br',
    siteName: 'SyncLife',
    images: [
      {
        url: '/og-image.png',    // Criar imagem 1200×630px
        width: 1200,
        height: 630,
        alt: 'SyncLife — Dashboard com Life Sync Score',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SyncLife — O sistema operacional da sua vida',
    description: 'Finanças, metas e agenda num único app.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### Semântica HTML
- `<nav>` para navbar
- `<section>` para cada seção com `id` de âncora
- `<h1>` apenas no hero title
- `<h2>` para cada section title
- `<h3>` para card titles (módulos, modos)
- `<footer>` para o footer
- `<ul>` para listas de features
- Atributos `alt` em todas as imagens

---

## 9. ANALYTICS E TRACKING

### Setup Mínimo

- **Vercel Analytics**: `@vercel/analytics` — já incluso na plataforma
- **Plausible** (alternativa privacy-first): script leve, sem cookies

### Eventos para Rastrear

| Evento | Trigger | Dados |
|--------|---------|-------|
| `cta_click_hero` | Clique "Começar grátis" no hero | source: 'hero' |
| `cta_click_pricing_free` | Clique "Criar conta grátis" no pricing | plan: 'free' |
| `cta_click_pricing_pro` | Clique "Começar PRO" no pricing | plan: 'pro' |
| `cta_click_final` | Clique "Criar conta grátis" no CTA final | source: 'cta_final' |
| `nav_click_login` | Clique "Entrar" na navbar | — |
| `section_viewed` | IntersectionObserver por seção | section: 'features' / 'pricing' / etc |
| `scroll_depth` | 25%, 50%, 75%, 100% | depth: number |

---

## 10. ACESSIBILIDADE

### Requisitos Mínimos

- Todos os links e botões devem ser acessíveis via teclado (Tab/Enter)
- Contraste mínimo WCAG AA para texto sobre fundo escuro (verificar t2 e t3 contra backgrounds)
- Atributos `aria-label` nos botões de ícone (hamburger, etc.)
- Navegação por âncoras acessível
- Botão de skip-to-content como primeiro elemento focável
- `prefers-reduced-motion`: desabilitar animações de float, marquee e ring rotation

```css
@media (prefers-reduced-motion: reduce) {
  .hero-orb, .score-ring-outer, .social-logos {
    animation: none !important;
  }
  .reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## 11. PERFORMANCE

### Otimizações Obrigatórias

- **Fonts:** Usar `next/font/google` com `display: swap` e subset `latin`
- **Images:** Logo SVG inline (não base64 como no protótipo — extrair SVG puro)
- **Critical CSS:** A landing page carrega apenas seu CSS, não o CSS do app
- **Lazy sections:** Seções abaixo do fold podem ser lazy loaded (import dinâmico)
- **SVG do gráfico:** Inline, não como imagem externa
- **Nenhum JS desnecessário:** Mínimo de client components (apenas navbar scroll + reveal + marquee)

### Métricas Alvo

| Métrica | Alvo |
|---------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Performance Score (Lighthouse) | > 90 |

---

## 12. ATIVIDADES PARA O CLAUDE CODE

### ATIVIDADE 1 — Setup Inicial e Layout Base
**Estimativa:** ~30min
**Dependências:** Nenhuma

- [ ] Criar rota `app/(landing)/page.tsx` e `layout.tsx` (layout limpo, sem sidebar do app)
- [ ] Configurar fontes Syne, DM Sans, DM Mono via `next/font/google`
- [ ] Criar arquivo `app/(landing)/styles/landing.css` com todos os CSS tokens (copiar fielmente da seção 3 deste documento)
- [ ] Configurar metadata SEO no layout (seção 8)
- [ ] Garantir que o layout da landing NÃO herda o layout do app autenticado (sem sidebar, sem navigation)
- [ ] Testar: página carrega em `/` com fundo `#03071a` e fontes corretas

---

### ATIVIDADE 2 — Componente ScrollReveal
**Estimativa:** ~15min
**Dependências:** Atividade 1

- [ ] Criar `ScrollReveal.tsx` como Client Component
- [ ] Implementar IntersectionObserver (threshold 0.12, rootMargin '0px 0px -40px 0px')
- [ ] Suportar prop `delay` (0, 1, 2, 3, 4) para delays escalonados
- [ ] Suportar prop `className` para styling adicional
- [ ] Implementar CSS de `.reveal` / `.reveal.visible` (seção 5.1)
- [ ] Adicionar suporte a `prefers-reduced-motion` (seção 10)
- [ ] Testar: elemento aparece com fade-in ao scrollar

---

### ATIVIDADE 3 — Navbar
**Estimativa:** ~30min
**Dependências:** Atividade 1

- [ ] Criar `Navbar.tsx` como Client Component
- [ ] Logo SyncLife: extrair SVG do protótipo para arquivo `.svg` ou componente inline + texto "SyncLife" (Syne 18px 700)
- [ ] 4 nav links com smooth scroll para âncoras (#features, #modos, #score, #precos)
- [ ] Botão ghost "Entrar" → link para `/login`
- [ ] Botão primary "Começar grátis" → link para `/cadastro`
- [ ] Listener de scroll: classe `.scrolled` quando `scrollY > 60`
- [ ] Implementar menu mobile hamburger funcional (drawer/dropdown) para ≤768px
- [ ] Aplicar todos os estilos CSS da seção 6.1
- [ ] Testar: navbar fica opaca ao scrollar, links rolam suavemente

---

### ATIVIDADE 4 — Hero Section
**Estimativa:** ~45min
**Dependências:** Atividades 1, 2, 3

- [ ] Criar `Hero.tsx`
- [ ] Background mesh: 3 orbs com animação `float`, grid overlay com máscara radial
- [ ] Badge "MVP v2 — Beta aberto" com ícone SyncLife 16px e dot pulsante
- [ ] H1 com gradiente `grad-main` na segunda linha
- [ ] Subtítulo com max-width 560px
- [ ] Botão primary com ícone ArrowRight (Lucide React) + botão secondary
- [ ] Disclaimer "Grátis para começar · Sem cartão · Cancele quando quiser"
- [ ] Animações de entrada staggered (fadeUp/fadeDown com delays — seção 5.2)
- [ ] Testar: hero ocupa 100vh, animações suaves na carga

---

### ATIVIDADE 5 — App Preview (mockup no Hero)
**Estimativa:** ~40min
**Dependências:** Atividade 4

- [ ] Criar `AppPreview.tsx`
- [ ] Frame do browser: topbar com 3 dots + URL bar "app.synclife.com.br/dashboard"
- [ ] Sidebar com ícones: Logo SyncLife, 💰 (ativo), 🎯, 📅, ⚙️
- [ ] Content: header "Boa tarde, Thiago! ✨", badge período, score bar 74%, 3 KPI cards, mini chart com barras
- [ ] Hover glow effect no frame
- [ ] **Hidden em mobile (≤768px):** display none
- [ ] Testar: mockup renderiza fielmente ao protótipo

---

### ATIVIDADE 6 — Social Proof Strip
**Estimativa:** ~20min
**Dependências:** Atividade 1

- [ ] Criar `SocialStrip.tsx` como Client Component
- [ ] Label "Inspirado por apps de referência"
- [ ] 7 nomes × 2 (duplicados para loop infinito): Monarch Money, Linear, Notion, Todoist, Fabulous, YNAB, Obsidian
- [ ] Animação marquee CSS (translateX 0 → -50%, 20s linear infinite)
- [ ] Hover em cada nome: opacity 0.5 → 0.8
- [ ] Testar: strip rola infinitamente sem cortes

---

### ATIVIDADE 7 — Features (3 Módulos)
**Estimativa:** ~30min
**Dependências:** Atividades 1, 2

- [ ] Criar `FeaturesModules.tsx`
- [ ] Header centralizado: label + title + subtitle
- [ ] Grid 3 colunas com 3 cards (Finanças, Metas, Agenda)
- [ ] Cada card com: ícone 52px, label colorido, título, descrição, 5 features com seta
- [ ] Hover: translateY(-4px), border highlight, glow `::before` no topo
- [ ] Cor contextual por módulo (fin=verde, meta=azul, ag=ciano)
- [ ] ScrollReveal com delays escalonados (1, 2, 3)
- [ ] Responsivo: 2col → 1col
- [ ] Testar: cards aparecem com stagger, hover funcional

---

### ATIVIDADE 8 — Modo Foco vs Jornada
**Estimativa:** ~50min
**Dependências:** Atividades 1, 2

- [ ] Criar `ModesSection.tsx`
- [ ] Header com label, title, subtitle + 2 toggle buttons (visuais, sem toggle real)
- [ ] Grid 2 colunas com card Foco e card Jornada
- [ ] **Card Foco:** Badge, title "Fevereiro 2026", 3 data rows (receita/despesa/saldo), 3 barras de progresso (alimentação 87% laranja, transporte 54% verde, lazer 38% verde), 2 traits
- [ ] **Card Jornada:** Badge, title "Boa tarde, Thiago! ✨", score block 74 com gradiente, goal card (Viagem Europa 28%), insight com sugestão, 2 traits
- [ ] Todas as cores e estilos conforme seção 6.5
- [ ] ScrollReveal com delays
- [ ] Responsivo: 1 coluna em ≤1024px
- [ ] Testar: dois cards lado a lado, dados mockados fiéis ao protótipo

---

### ATIVIDADE 9 — Life Sync Score
**Estimativa:** ~40min
**Dependências:** Atividades 1, 2

- [ ] Criar `LifeScoreSection.tsx` como Client Component (animação de anel)
- [ ] Anel conic-gradient rotativo (12s linear infinite)
- [ ] Anel interno com contra-rotação
- [ ] Número "74" + "Life Score" no centro
- [ ] 3 pilares posicionados ao redor (absolutamente): 💰 85%, 🎯 72%, 🔥 60%
- [ ] Content: label, title, subtitle + 3 pilares detalhados com barras de progresso
- [ ] Responsivo: 1 coluna em ≤1024px, anel reduzido
- [ ] `prefers-reduced-motion`: parar rotação
- [ ] Testar: anel gira suavemente, número fica estático

---

### ATIVIDADE 10 — Planejamento Futuro
**Estimativa:** ~50min
**Dependências:** Atividades 1, 2

- [ ] Criar `PlanningSection.tsx`
- [ ] **Mockup visual (coluna esquerda):**
  - Header com título "📈 Planejamento Futuro" + tabs 3m/6m/12m
  - Gráfico SVG inline (copiar SVG do protótipo fielmente): curva verde, zona vermelha, dots, badge "⚠ IPVA"
  - Grid 6 meses com valores (cor verde/vermelho)
  - 4 eventos planejados com dots coloridos e badges
  - Insight box com 💡
- [ ] **Content (coluna direita):**
  - Label, title, subtitle (com itálico na pergunta)
  - 4 tags de categorias
  - 3 traits com ícones
- [ ] Responsivo: 1 coluna, texto primeiro (order 1), visual depois (order 2)
- [ ] Testar: mockup renderiza fielmente, SVG responsivo

---

### ATIVIDADE 11 — Depoimentos
**Estimativa:** ~25min
**Dependências:** Atividades 1, 2

- [ ] Criar `TestimonialsSection.tsx`
- [ ] Header centralizado: label + title
- [ ] Grid 3 colunas com 3 testimonial cards
- [ ] Cada card: 5 estrelas, texto itálico, avatar (círculo com inicial), nome, cargo, score badge
- [ ] Dados dos 3 depoimentos conforme seção 6.8
- [ ] Hover: translateY(-2px), border highlight
- [ ] ScrollReveal com delays 1, 2, 3
- [ ] Responsivo: 2col → 1col
- [ ] Testar: cards aparecem com stagger

---

### ATIVIDADE 12 — Pricing
**Estimativa:** ~40min
**Dependências:** Atividades 1, 2

- [ ] Criar `PricingSection.tsx`
- [ ] Header centralizado
- [ ] Grid 2 colunas (max-width 800px, margin auto)
- [ ] **Card Grátis:** badge, preço R$0, 6 features ✅ + 2 features ⬜ (desabilitadas), botão secondary → `/cadastro`
- [ ] **Card PRO:** badge "Recomendado" absolute top-right, badge "🚀 PRO", preço R$29 com gradiente, 8 features ✅, botão primary "Começar PRO — 14 dias grátis" → `/cadastro?plan=pro`, nota abaixo
- [ ] Card PRO com fundo gradiente e glow no topo
- [ ] Responsivo: 1 coluna em ≤768px
- [ ] Testar: os dois cards lado a lado, PRO com destaque visual claro

---

### ATIVIDADE 13 — CTA Final
**Estimativa:** ~15min
**Dependências:** Atividades 1, 2

- [ ] Criar `CTAFinal.tsx`
- [ ] Background: radial verde sutil + grid overlay
- [ ] Title com "hoje." em gradiente
- [ ] Subtitle
- [ ] 2 botões: primary "Criar conta grátis" + secondary "Explorar funcionalidades"
- [ ] Nota "Já tem uma conta? Entrar →"
- [ ] Testar: seção comunica urgência de conversão

---

### ATIVIDADE 14 — Footer
**Estimativa:** ~20min
**Dependências:** Atividade 1

- [ ] Criar `Footer.tsx`
- [ ] Grid 4 colunas: Brand + 3 colunas de links
- [ ] Logo + tagline
- [ ] Links das 3 colunas (Produto, Empresa, Suporte) — podem ser links `#` por agora
- [ ] Bottom: copyright + links legais (Termos, Privacidade, Cookies)
- [ ] Responsivo: 2col → 1col, bottom em column/center
- [ ] Testar: footer renderiza corretamente em todas as resoluções

---

### ATIVIDADE 15 — Montagem Final e QA
**Estimativa:** ~30min
**Dependências:** Atividades 1–14

- [ ] Montar todos os componentes na `page.tsx` na ordem correta
- [ ] Verificar smooth scroll de todas as âncoras
- [ ] Testar em mobile (≤768px): hamburger, hero sem preview, 1 coluna
- [ ] Testar em tablet (≤1024px): grids adaptados
- [ ] Testar em desktop (>1024px): layout completo
- [ ] Verificar Lighthouse: performance > 90, accessibility > 90
- [ ] Verificar que nenhuma cor está hardcoded fora das variáveis CSS
- [ ] Verificar que todas as fontes carregam corretamente
- [ ] Verificar `prefers-reduced-motion` desabilitando animações
- [ ] Gerar imagem OG (1200×630px) para compartilhamento em redes sociais

---

### RESUMO DE DEPENDÊNCIAS

```
Atividade 1 (Setup)
├── Atividade 2 (ScrollReveal)
├── Atividade 3 (Navbar)
│   └── Atividade 4 (Hero)
│       └── Atividade 5 (App Preview)
├── Atividade 6 (Social Strip)
├── Atividade 7 (Features)
├── Atividade 8 (Modos)
├── Atividade 9 (Life Score)
├── Atividade 10 (Planning)
├── Atividade 11 (Testimonials)
├── Atividade 12 (Pricing)
├── Atividade 13 (CTA Final)
├── Atividade 14 (Footer)
└── Atividade 15 (QA) ← depende de TODAS as anteriores
```

**Ordem recomendada de execução:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15

**Estimativa total:** ~7h30min de desenvolvimento

---

*Documento criado em: 22 de Fevereiro de 2026*
*Versão: 1.0*
*Protótipo de referência: proto-landing.html (aprovado)*
