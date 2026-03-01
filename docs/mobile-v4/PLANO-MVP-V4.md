# Plano MVP v4 — Mobile UX/UI
**Foco:** Melhorias de UX/UI mobile sem afetar o layout desktop (≥1024px)
**Princípio:** Usar breakpoint `max-lg` (< 1024px) e `max-sm` (< 640px) para todas as mudanças

---

## Estratégia Geral

Todas as mudanças usam CSS responsivo. O desktop não é afetado.
Breakpoints usados:
- `@media (max-width: 1023px)` = mobile/tablet → `max-lg:` no Tailwind
- `@media (max-width: 639px)` = mobile → `max-sm:` no Tailwind

Componentes **novos** para mobile:
- `MobileHeader` — substitui TopHeader em viewports < 1024px
- `MobileModulePicker` — bottom sheet para "Mais"

Componentes **modificados** (responsivos):
- `AppShell` — lógica de renderização condicional header
- Tabs de módulo — adicionar scroll horizontal
- KPI cards — ajuste de padding e tamanho de fonte
- Life Sync Score card — layout vertical em mobile

---

## Sprints do MVP v4

### Sprint 1 — Shell Mobile (BLOQUEADOR — deve ser feito primeiro)
**Impacto:** Resolve P1 + melhora P5

#### 1.1 — Novo Mobile Header (2 linhas compactas)
**Antes:**
```
[ícone Panorama > Dashboard] [🌙 Boa noite, Usuário] [Foco PRO | Auto | 🔔]
```
**Depois (mobile):**
```
Linha 1: [☰ Módulo > Página]                    [🔔] [avatar]
Linha 2: (somente Jornada) [Boa noite, Usuário!]       [Foco | Jornada]
```
- Altura total: 44px (Foco) ou 80px (Jornada com saudação)
- Pills Foco/Jornada + Tema migram para linha 2 ou drawer "Mais"

#### 1.2 — Bottom Navigation repaginado
**Antes:** `[Início | Finanças | Futuro | Tempo | Mais]`

**Depois:** Mantém 5 itens mas muda o comportamento do "Mais":
- Drawer com grid 3×2 de módulos (não lista vertical)
- Módulo ativo destacado no grid
- Toggle Foco/Jornada e Tema dentro do drawer "Mais"

#### 1.3 — Sub-tabs com scroll horizontal
Todos os `<nav>` de abas de módulo ganham:
```css
overflow-x: auto;
scrollbar-width: none; /* Firefox */
-webkit-overflow-scrolling: touch;
/* Fade mask no lado direito para indicar mais conteúdo */
```
- Adicionar `mask-image: linear-gradient(to right, black 85%, transparent)` quando há overflow
- Aba ativa sempre scrollada para o centro

---

### Sprint 2 — Dashboard Mobile
**Impacto:** Resolve P3 + P4

#### 2.1 — Card Life Sync Score — layout vertical em mobile
**Antes:** 2 colunas (score | dimensões)
**Depois:** Stack vertical:
```
[Score grande centrado]
[Label "Life Sync Score"]
[Barra horizontal de progresso por dimensão — 2 colunas]
[Botão "Ver análise completa"]
```

#### 2.2 — KPI Cards — ajuste de padding e fonte
- Reduzir padding: `p-5` → `p-3 max-sm:p-3`
- Label uppercase: `text-[10px]` → mantém, mas reduzir tracking
- Valor: `text-xl` → `text-lg max-sm:text-base` para caber em 2 colunas
- Adicionar `truncate` ou `text-ellipsis` nos valores

#### 2.3 — Widget de Orçamentos (Dashboard) — linha compacta
Substituir layout atual por linha horizontal:
```
[emoji] [nome (truncate)]   [R$ atual / total]   [77%]
[barra de progresso full-width]
```

---

### Sprint 3 — Módulos com problemas específicos
**Impacto:** Resolve P6 + P7 + P8

#### 3.1 — Tempo/Agenda Semanal — view mobile adaptada
**Desktop:** Grid 7 colunas com eventos
**Mobile:**
- Header com seletor de dia (scroll horizontal de dias)
- Lista de eventos do dia selecionado (full-width, vertical)
- Botão "Semana" / "Dia" no topo

#### 3.2 — Subpages de módulo — remover H1 redundante
Nas subpages que têm título duplicado com o breadcrumb:
- Remover ou encolher o H1 de página em mobile
- Ou transformar em H2 compacto `text-sm font-semibold`

#### 3.3 — Finanças/Transações — filtros colapsáveis
**Mobile:** Filtros dentro de um accordion/expander
- Por padrão: mostra só `[mês] [busca]`
- Botão "Filtros ▾" expande os demais filtros

---

### Sprint 4 — Polimento e correções menores
**Impacto:** Resolve P9, P10, P11, P12, P13

#### 4.1 — Patrimônio/Carteira — KPIs em grid 2×2
#### 4.2 — Configurações — abas com scroll
#### 4.3 — Corrigir rota /mente/timer-foco (404)
#### 4.4 — Remover FAB duplicado em Tempo
#### 4.5 — Toggle modo/tema mais acessível

---

## Componentes a criar/modificar

| Componente | Arquivo | Tipo |
|------------|---------|------|
| MobileHeader | `components/shell/MobileHeader.tsx` | NOVO |
| MobileModulePicker | `components/shell/MobileModulePicker.tsx` | NOVO |
| ScrollTabs | `components/ui/scroll-tabs.tsx` | NOVO |
| AppShell | `components/shell/AppShell.tsx` | MODIFICAR |
| KpiCard | `components/ui/kpi-card.tsx` | MODIFICAR |
| Life Sync Score (Dashboard) | `app/(app)/dashboard/page.tsx` | MODIFICAR |
| Orçamento row | `app/(app)/financas/page.tsx` | MODIFICAR |
| Agenda Semanal | `app/(app)/tempo/page.tsx` | MODIFICAR |

---

## Regras de implementação

1. **NUNCA usar `@media` direto em CSS** — usar classes Tailwind `max-lg:` / `max-sm:`
2. **Desktop (≥1024px) não pode mudar** — todo novo código mobile deve estar em classes com prefixo `max-lg:` ou `max-sm:`
3. **MobileHeader renderiza apenas em mobile** — usar `hidden lg:block` / `lg:hidden` no JSX
4. **Testar nos 4 modos** (Foco Dark, Jornada Dark, Foco Light, Jornada Light) após cada sprint
5. **Tokens de cor**: usar `var(--sl-*)` — não hardcodar cores

---

## Critérios de aceite

- [ ] Header visível e legível em iPhone 14 Pro (390px) sem overflow
- [ ] Todas as abas de módulo acessíveis via scroll horizontal com fade indicator
- [ ] KPI cards com valores numéricos completos (sem corte)
- [ ] Life Sync Score card sem overflow
- [ ] Agenda semanal legível em mobile
- [ ] Bottom nav "Mais" com grid de módulos (não lista)
- [ ] Zero problemas de overflow horizontal na viewport
- [ ] Todos os módulos acessíveis em ≤ 2 toques

---

## O que NÃO muda

- Layout desktop (≥ 1024px) — nenhuma alteração
- Design system tokens (cores, fontes, animações)
- Lógica de negócio e dados
- Modos Foco/Jornada e temas Light/Dark
- Estrutura de componentes shadcn/ui
