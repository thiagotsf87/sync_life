# Redesign Mobile SyncLife — Card Stack (V5)
## Plano Completo de Atividades

**Data:** 2026-03-04
**Branch:** mobile/redesign-v5-cardstack
**Direcao:** Card Stack (Apple Health / Google Pay)
**Escopo:** Shell + Dashboard (desktop intocado)

---

## Contexto

O layout mobile atual tem 3 problemas estruturais:
1. Dashboard tem 6-8 telas de scroll sem progressive disclosure
2. Navegacao fragmentada (8/11 modulos atras de "Mais", drawer abre da esquerda)
3. Visual generico (desktop encolhido, sem profundidade)

Direcao escolhida: **Card Stack** (Apple Health/Google Pay) — Shell + Dashboard juntos.

**Principios do redesign:**
- Progressive disclosure: cards colapsados mostram 1 metrica, expandem com detalhes
- Floating bottom bar com backdrop blur (padrao 2025-2026)
- Bottom sheet para modulos (nao drawer esquerdo)
- Segmented tabs substituem sub-nav
- Desktop 100% preservado (lg:hidden / hidden lg:block)

---

## FASE 1 — Prototipo HTML Interativo

### Objetivo
Criar prototipo visual completo para validacao no celular real antes de tocar no codigo.

### Atividades

**F1-01: Criar arquivo `prototipos/mobile/proto-mobile-v5-cardstack.html`**
- HTML unico com CSS embutido e JS interativo
- Viewport 390x844 (iPhone 14 Pro)
- Incluir todas as fonts (Syne, DM Mono, Outfit) via Google Fonts
- Usar tokens CSS do design system SyncLife (--sl-bg, --sl-s1, etc.)

**F1-02: Implementar Floating Bottom Bar no prototipo**
- 5 slots: Inicio, Financas, FAB central, Tempo, Grid
- position fixed, bottom 12px, left/right 12px
- border-radius 24px, backdrop-filter blur(20px)
- bg var(--sl-s1) com 85% opacity
- box-shadow: 0 8px 32px rgba(0,0,0,0.3)
- border: 1px solid var(--sl-border)
- FAB: circulo 52px com gradiente #10b981→#0055ff, elevado -mt-3
- Active indicator: dot 4px abaixo do icone com cor do modulo
- Icones SVG inline (house, piggy, plus, clock, grid)
- Safe area padding-bottom

**F1-03: Implementar Header limpo no prototipo**
- Altura 52px, sticky top
- Esquerda: titulo de pagina em Syne 18px bold
- Direita: mode pill compacto + bell (18px) + avatar (34px)
- Foco: titulo em var(--sl-t1), texto simples
- Jornada: titulo gradiente text-sl-grad

**F1-04: Implementar Module Picker (bottom sheet) no prototipo**
- Transicao translateY(100%) → 0 com cubic-bezier(0.32,0.72,0,1) 0.3s
- Handle bar 40px x 4px no topo
- Overlay escuro rgba(0,0,0,0.6)
- Grid 3x3 de modulos (9 celulas, 40px icone, 11px label)
- Abaixo: links Conquistas + Configuracoes
- Abaixo: toggle Foco/Jornada + botao tema
- JS: abrir/fechar ao clicar no icone Grid da bottom bar

**F1-05: Implementar Segmented Tabs no prototipo**
- 3 abas: "Visao Geral", "Financas", "Vida"
- Pill shape, scroll-snap-type: x mandatory
- Active: underline gradiente 2px + text var(--sl-t1) + font-semibold
- Inactive: text var(--sl-t3)
- Tap target minimo 44px de altura
- Sticky abaixo do header (z-30)
- JS: trocar conteudo ao clicar na aba

**F1-06: Implementar Card Stack expansivel no prototipo**
- Card colapsado: 60px altura
  - Flex row: emoji (20px) + titulo (13px semibold) + spacer + metrica (DM Mono 15px) + chevron
  - Accent bar 2px na borda esquerda com cor do modulo
  - bg var(--sl-s1), border var(--sl-border), rounded-2xl, p-4
- Card expandido: auto height com conteudo completo
  - Animacao: grid-template-rows 0fr→1fr em 250ms ease-out
  - Conteudo: opacity 0→1 em 150ms, delay 100ms
  - Chevron gira 180deg
- Comportamento accordion: 1 card aberto por vez
- JS: click no card colapsado expande, click no header do expandido colapsa

**F1-07: Implementar conteudo da aba "Visao Geral"**
- Life Score card compacto (Jornada only): ring SVG 100px, score, "+3 pts" badge
- KPI strip horizontal: 4 cards (150px wide), scroll-snap, peek 2.5 visiveis
  - Receitas (verde), Despesas (vermelho), Saldo (azul), Metas (amarelo)
  - Fade mask gradient na direita
- Quick Actions: grid 2x2 (Transacao, Evento, Revisao, Recibo)
- Insight: Foco = row de stats compactos, Jornada = paragrafo narrativo

**F1-08: Implementar conteudo da aba "Financas"**
- ExpandableCard: Orcamentos — colapsado "2 de 5 no limite", expandido mostra barras de progresso
- ExpandableCard: Gastos por Categoria — colapsado "Maior: Alimentacao 32%", expandido mostra lista categorias
- ExpandableCard: Recorrentes — colapsado "Proxima: Aluguel em 3d", expandido mostra lista
- ExpandableCard: Projecao — colapsado "30d: R$ 2.1k", expandido mostra sparkline

**F1-09: Implementar conteudo da aba "Vida"**
- ExpandableCard: Metas — colapsado "3 ativas, 1 em risco", expandido mostra lista com barras
- ExpandableCard: Agenda — colapsado "Hoje: 2 eventos", expandido mostra day strip + lista
- ExpandableCard: Corpo — colapsado "3 sessoes, 45 min", expandido mostra detalhes semana
- ExpandableCard: Patrimonio — colapsado "R$ 3.9k", expandido mostra rentabilidade
- ExpandableCard: Experiencias — colapsado "0 viagens", expandido mostra proxima

**F1-10: Implementar toggle Foco/Jornada funcional no prototipo**
- Toggle no header ou picker alterna classes no body
- Foco: titulo simples, sem Life Score, insight compacto
- Jornada: titulo gradiente, Life Score visivel, insight narrativo, streak badge
- Tokens mudam conforme modo (cores Jornada esverdeadas)

**F1-11: Implementar animacoes no prototipo**
- Stagger entry: cards entram com 60ms de delay entre cada
- Expand/collapse: grid-template-rows + opacity
- Progress bar fill: width 0→X% em 900ms ease-out on first paint
- Bottom bar FAB: active:scale-95 on press
- Tab switch: fade out 100ms, content swap, fade in 200ms

**F1-12: Testar prototipo no celular real**
- Abrir via localhost ou servir estatico
- Testar toque, scroll, expand/collapse
- Verificar que nada quebra em viewport 375px (iPhone SE) e 430px (iPhone 15 Pro Max)
- Screenshot de cada estado para referencia futura

### Criterio de aprovacao Fase 1
> Usuario abre prototipo no celular, valida visual e interacoes, aprova antes de seguir.

---

## FASE 2 — Implementacao do Shell V5

### Objetivo
Substituir os 4 componentes mobile do shell por versoes V5 no codigo React.

### Atividades

**F2-01: Adicionar novos tokens CSS em `globals.css`**
- Arquivo: `web/src/app/globals.css`
- Novos tokens:
  ```css
  --mob-bottom-bar-h: 60px;
  --mob-bottom-bar-radius: 24px;
  --mob-bottom-bar-margin: 12px;
  --mob-card-expand-duration: 250ms;
  --mob-card-expand-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --mob-stagger-delay: 60ms;
  ```
- Novos keyframes:
  ```css
  @keyframes cardContentIn { from { opacity: 0 } to { opacity: 1 } }
  ```

**F2-02: Criar `MobileBottomBarV5.tsx`**
- Arquivo: `web/src/components/shell/MobileBottomBarV5.tsx`
- Position fixed, bottom/left/right 12px, border-radius 24px
- backdrop-filter blur(20px), bg sl-s1/85%, sombra, border
- 5 slots: Inicio (panorama), Financas, FAB (centro 52px), Tempo, Grid (picker)
- Icones: Lucide (Home, PiggyBank, Plus, Clock, LayoutGrid)
- Active state: dot 4px com cor do modulo ativo
- FAB contextual: panorama/financas→QuickEntrySheet, tempo→/tempo/novo, corpo→/corpo/atividades
- lg:hidden
- Tap targets >= 44px
- Renderizar QuickEntrySheet inline (mesmo padrao atual)

**F2-03: Criar `MobileHeaderV5.tsx`**
- Arquivo: `web/src/components/shell/MobileHeaderV5.tsx`
- Altura 52px, sticky top 0, z-40
- Esquerda: titulo pagina (Syne 18px bold)
  - Derivar de activeModule + pathname via MODULES config
  - Foco: text var(--sl-t1)
  - Jornada: text-sl-grad
- Direita: mode pill compacto + bell icon (w-9 h-9) + avatar (w-8 h-8)
- Mode pill: botao toggle inline (Foco/Jornada)
- bg var(--sl-s1), border-bottom var(--sl-border)
- lg:hidden

**F2-04: Criar `MobileModulePickerV5.tsx`**
- Arquivo: `web/src/components/shell/MobileModulePickerV5.tsx`
- Usar shadcn Sheet com `side="bottom"` (em vez de "left")
- Conteudo: mesmo layout do MobileModulePicker atual
  - Handle bar (40px x 4px), grid 3x3, Conquistas/Config, Preferencias
- SheetContent: rounded-t-[20px], max-h-[85vh]
- Controlado por modulePickerOpen do Zustand

**F2-05: Criar componente `SegmentedTabs.tsx`**
- Arquivo: `web/src/components/mobile/SegmentedTabs.tsx`
- Props: tabs[], activeTab, onTabChange, className
- Layout: flex horizontal, scroll-snap-type: x mandatory
- Active tab: underline gradiente 2px, text sl-t1, font-semibold
- Inactive: text sl-t3
- Min tap target 44px
- Fade mask gradient na direita
- Reutilizavel por qualquer pagina

**F2-06: Criar componente `ExpandableCard.tsx`**
- Arquivo: `web/src/components/mobile/ExpandableCard.tsx`
- Props: id, title, icon, metric, metricColor, accentColor, expanded, onToggle, children, delay
- Colapsado: 60px, flex row (icon + titulo + metrica + chevron)
- Expandido: grid-template-rows 0fr→1fr (250ms)
- Conteudo: opacity 0→1 (150ms, delay 100ms)
- Chevron: ChevronDown rotacao 180deg
- Accent bar 2px na esquerda
- bg sl-s1, border sl-border, rounded-2xl, p-4
- hover:border-[var(--sl-border-h)]
- sl-fade-up com delay configuravel

**F2-07: Atualizar `shell-store.ts` com novo estado**
- Arquivo: `web/src/stores/shell-store.ts`
- Adicionar ao state:
  - `dashboardTab: string` (default: 'overview')
  - `setDashboardTab: (tab: string) => void`
  - `expandedCardId: string | null` (default: null)
  - `setExpandedCardId: (id: string | null) => void`
- setExpandedCardId: toggle (se mesmo id, fecha; se diferente, abre)

**F2-08: Atualizar tipos em `types/shell.ts`**
- Arquivo: `web/src/types/shell.ts`
- Adicionar campos ao ShellState interface

**F2-09: Atualizar `AppShell.tsx` para usar componentes V5**
- Arquivo: `web/src/components/shell/AppShell.tsx`
- Trocar imports:
  - MobileHeader → MobileHeaderV5
  - MobileBottomBar → MobileBottomBarV5
  - MobileModulePicker → MobileModulePickerV5
- Remover import de MobileSubNav
- Remover renderizacao de MobileSubNav
- Manter todos os componentes desktop intocados

**F2-10: Atualizar `ContentArea.tsx` para usar tokens**
- Arquivo: `web/src/components/shell/ContentArea.tsx`
- Padding mobile: 22px → var(--mob-page-x) = 16px
- Bottom padding mobile: calc(60px + 24px + var(--mob-safe-bottom))
- Desktop: manter p-[22px] via lg:p-[22px]

**F2-11: QA do Shell V5 — 4 modos**
- Testar Dark Foco, Dark Jornada, Light Foco, Light Jornada
- Verificar:
  - Bottom bar flutua com blur
  - Picker sobe de baixo
  - Header mostra titulo
  - Mode toggle funciona
  - FAB abre QuickEntrySheet
  - Navegacao entre modulos funciona
  - Safe areas respeitadas
  - Desktop IDENTICO ao pre-mudanca
- Screenshots de validacao em 390x844

### Criterio de aprovacao Fase 2
> Shell V5 funcional nos 4 modos, desktop intocado, screenshots validados.

---

## FASE 3 — Dashboard Card Stack

### Objetivo
Reescrever o dashboard mobile usando Card Stack com 3 tabs e cards expansiveis.

### Atividades

**F3-01: Criar `MobileKpiStrip.tsx`**
- Arquivo: `web/src/components/mobile/MobileKpiStrip.tsx`
- Props: kpis[] (label, value, delta, deltaType, accent, icon, iconBg)
- Layout: overflow-x-auto, scroll-snap-type: x mandatory
- Cards: min-width 150px, scroll-snap-align: start
- Mostra 2.5 cards visiveis (peek effect)
- Fade mask gradient na direita
- Estilo de cada card: p-3, rounded-[14px], 17px DM Mono value, 2px accent bar top

**F3-02: Criar `MobileDashboard.tsx`**
- Arquivo: `web/src/components/dashboard/MobileDashboard.tsx`
- Props: recebe todos os dados computados do dashboard (financeiros, metas, agenda, life score, etc.)
- Renderiza: SegmentedTabs + conteudo por tab
- Usa dashboardTab e expandedCardId do Zustand
- Reset expandedCardId quando tab muda

**F3-03: Implementar tab "Visao Geral" do MobileDashboard**
- Jornada only: Life Score card compacto (ring SVG 100px, score, badge "+3 pts", 3 dimension pills)
- KPI strip horizontal (MobileKpiStrip com 4 KPIs)
- Quick Actions: grid 2x2 (Transacao, Evento, Revisao, Recibo)
- Insight: Foco = row stats, Jornada = narrativa AI

**F3-04: Implementar tab "Financas" do MobileDashboard**
- ExpandableCard: Orcamentos
  - Colapsado: "X de Y no limite" + barra geral
  - Expandido: lista de orcamentos com barras coloridas
- ExpandableCard: Gastos por Categoria
  - Colapsado: "Maior: [categoria] X%"
  - Expandido: lista de categorias com valores
- ExpandableCard: Recorrentes
  - Colapsado: "Proxima: [nome] em Xd"
  - Expandido: lista de recorrentes com datas
- ExpandableCard: Projecao
  - Colapsado: "30d: R$ X.Xk"
  - Expandido: sparkline chart + valores hoje/30d

**F3-05: Implementar tab "Vida" do MobileDashboard**
- ExpandableCard: Metas
  - Colapsado: "X ativas, Y em risco"
  - Expandido: lista metas com barras de progresso
- ExpandableCard: Agenda
  - Colapsado: "Hoje: X eventos"
  - Expandido: day strip + lista de eventos
- ExpandableCard: Corpo
  - Colapsado: "X sessoes, Y min"
  - Expandido: detalhes semana
- ExpandableCard: Patrimonio
  - Colapsado: valor carteira
  - Expandido: rentabilidade + ativos
- ExpandableCard: Experiencias
  - Colapsado: proxima viagem ou "0 viagens"
  - Expandido: detalhes

**F3-06: Refatorar `dashboard/page.tsx` com split mobile/desktop**
- Arquivo: `web/src/app/(app)/dashboard/page.tsx`
- Envolver JSX desktop existente em `<div className="hidden lg:block">`
- Adicionar `<div className="lg:hidden"><MobileDashboard {...props} /></div>`
- Manter todos os hooks e data fetching existentes
- Passar dados como props para MobileDashboard
- Zero mudanca no comportamento desktop

**F3-07: QA do Dashboard Card Stack**
- Verificar:
  - 3 tabs funcionam, estado persiste na navegacao
  - Cards expandem/colapsam com animacao suave
  - Accordion: apenas 1 card aberto por tab
  - KPI strip scrolla com snap
  - Scroll total mobile < 3 telas (vs 6-8 atual)
  - Foco: sem Life Score, insight compacto
  - Jornada: Life Score, insight narrativo, streak
  - Desktop IDENTICO
- Screenshots de validacao

### Criterio de aprovacao Fase 3
> Dashboard mobile com card stack funcional, scroll reduzido ~60%, desktop intocado.

---

## FASE 4 — Propagacao para Outros Modulos

### Objetivo
Aplicar pattern Card Stack nos dashboards de Financas, Futuro e Tempo. Substituir MobileSubNav por SegmentedTabs por pagina.

### Atividades

**F4-01: Criar `MobileModuleLayout.tsx`**
- Arquivo: `web/src/components/mobile/MobileModuleLayout.tsx`
- Props: title, tabs?, activeTab?, onTabChange?, children
- Wrapper consistente: titulo + tabs opcionais + conteudo

**F4-02: Aplicar Card Stack no dashboard Financas**
- Arquivo: `web/src/app/(app)/financas/page.tsx`
- Split mobile/desktop (mesmo padrao do dashboard)
- Mobile: SegmentedTabs ("Resumo", "Orcamentos", "Categorias") + ExpandableCards

**F4-03: Aplicar Card Stack no dashboard Futuro**
- Arquivo: `web/src/app/(app)/futuro/page.tsx`
- Goals como ExpandableCards com barras de progresso

**F4-04: Aplicar Card Stack no dashboard Tempo**
- Arquivo: `web/src/app/(app)/tempo/page.tsx`
- Week view com cards de dia expansiveis

**F4-05: Substituir sub-nav por SegmentedTabs em modulos com sub-paginas**
- Financas (7 navItems): renderizar SegmentedTabs no layout do modulo
- Corpo (6 navItems): idem
- Mente, Patrimonio, Carreira: idem
- Cada modulo renderiza `<SegmentedTabs>` com seus navItems do MODULES config

**F4-06: Testar navegacao completa**
- Todos os modulos acessiveis via bottom bar (3 diretos) ou picker (8 via grid)
- Sub-nav funciona via SegmentedTabs em cada modulo
- Voltar entre modulos mantem estado correto
- Desktop regressao: zero mudancas

**F4-07: QA final — regressao completa**
- Testar todas as 11 paginas de modulo no mobile
- Testar nos 4 modos (Dark/Light x Foco/Jornada)
- Screenshots finais vs prototipo aprovado
- Verificar que nenhuma pagina desktop foi afetada

---

## Inventario de Componentes

### Novos (a criar)

| # | Componente | Caminho | Fase |
|---|---|---|---|
| 1 | MobileBottomBarV5 | `web/src/components/shell/MobileBottomBarV5.tsx` | F2 |
| 2 | MobileHeaderV5 | `web/src/components/shell/MobileHeaderV5.tsx` | F2 |
| 3 | MobileModulePickerV5 | `web/src/components/shell/MobileModulePickerV5.tsx` | F2 |
| 4 | SegmentedTabs | `web/src/components/mobile/SegmentedTabs.tsx` | F2 |
| 5 | ExpandableCard | `web/src/components/mobile/ExpandableCard.tsx` | F2 |
| 6 | MobileKpiStrip | `web/src/components/mobile/MobileKpiStrip.tsx` | F3 |
| 7 | MobileDashboard | `web/src/components/dashboard/MobileDashboard.tsx` | F3 |
| 8 | MobileModuleLayout | `web/src/components/mobile/MobileModuleLayout.tsx` | F4 |

### Modificados

| # | Arquivo | Mudanca | Fase |
|---|---|---|---|
| 1 | `web/src/app/globals.css` | Tokens + keyframes | F2 |
| 2 | `web/src/stores/shell-store.ts` | dashboardTab, expandedCardId | F2 |
| 3 | `web/src/types/shell.ts` | Estender ShellState | F2 |
| 4 | `web/src/components/shell/AppShell.tsx` | Trocar imports V4→V5, remover SubNav | F2 |
| 5 | `web/src/components/shell/ContentArea.tsx` | Padding mobile 22px→16px | F2 |
| 6 | `web/src/app/(app)/dashboard/page.tsx` | Split mobile/desktop | F3 |
| 7 | `web/src/app/(app)/financas/page.tsx` | Split mobile/desktop | F4 |
| 8 | `web/src/app/(app)/futuro/page.tsx` | Split mobile/desktop | F4 |
| 9 | `web/src/app/(app)/tempo/page.tsx` | Split mobile/desktop | F4 |

### Deprecados (manter arquivo, remover import)

| # | Componente | Substituido por | Fase |
|---|---|---|---|
| 1 | `MobileBottomBar.tsx` | MobileBottomBarV5 | F2 |
| 2 | `MobileHeader.tsx` | MobileHeaderV5 | F2 |
| 3 | `MobileModulePicker.tsx` | MobileModulePickerV5 | F2 |
| 4 | `MobileSubNav.tsx` | SegmentedTabs (por pagina) | F2 |

---

## Decisoes Tecnicas

| Decisao | Escolha | Motivo |
|---|---|---|
| Accordion vs multi-expand | Accordion (1 por vez) | Progressive disclosure |
| Sufixo V5 vs overwrite | V5 (novos arquivos) | Rollback facil |
| Animacao expand | CSS grid-template-rows 0fr→1fr | Smooth nativo, sem medir altura |
| dashboardTab | Zustand in-memory | UI state efemero |
| Sub-nav | SegmentedTabs por pagina | Cada pagina controla seus tabs |
| Split mobile/desktop | div lg:hidden / hidden lg:block | Zero risco ao desktop |
| Bottom bar | Floating com blur | Padrao moderno 2025-2026 |
| Module picker | Bottom sheet | Mais natural que drawer esquerdo |

---

## Resumo Quantitativo

| Metrica | Valor |
|---|---|
| Total de atividades | 37 |
| Componentes novos | 8 |
| Arquivos modificados | 9 |
| Componentes deprecados | 4 |
| Fases | 4 |
| Sessoes estimadas | 7-8 |
