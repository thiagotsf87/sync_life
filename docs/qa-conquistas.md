# QA — Conquistas (Fase 5.2)

> Protótipo de referência: `prototipos/proto-conquistas.html`
> Arquivo: `web/src/app/(app)/conquistas/page.tsx`
> Data de validação: 2026-02-27

---

## Status Geral

| Item | Status |
|------|--------|
| Layout Foco Dark | ✅ Aprovado |
| Layout Jornada Dark | ✅ Aprovado |
| Layout Foco Light | ✅ Aprovado |
| Layout Jornada Light | ✅ Aprovado |
| Dados mock (21 badges / 12 desbloqueadas) | ✅ Corretos |
| Responsividade mobile | ✅ |

---

## Checklist de Layout vs Protótipo

### ① Hero Summary
- [x] Hero Score Card: contador animado 0 → 12 (requestAnimationFrame)
- [x] Hero Score Card: barra animada 0 → 57% após mount
- [x] Hero Score Card: gradiente amarelo→laranja no número
- [x] Hero Score Card: barra de progresso com gradiente correto
- [x] Recent Strip: 3 cards ordenados por data desc (10 Fev, 05 Fev, 02 Fev)
- [x] Recent Strip: barra esquerda 3px com cor da categoria
- [x] Recent Strip: label "Recente · Última conquista" apenas no 1º card
- [x] Hero em coluna em `max-sm`

### ② Jornada Motivational Phrase
- [x] Oculto no Foco (`[.jornada_&]:hidden`)
- [x] Visível no Jornada com gradiente verde/azul
- [x] Cita a próxima conquista mais próxima ("Reserva Construída")
- [x] Ícone 🤖 com texto descritivo

### ③ Category Tabs
- [x] Tabs: Todas 12/21, 💰 Financeiras 4/7, 🎯 Metas 3/5, 📅 Consistência 3/5, 📆 Agenda 2/4
- [x] Tab ativa: borda azul + bg azul/15%
- [x] Tab inativa: borda e texto `--sl-t3`
- [x] Contador DM Mono 10px em cada tab
- [x] Toggle "Mostrar bloqueadas" à direita

### ④-A Grid View (Jornada — 4 colunas)
- [x] Visível apenas no Jornada (`hidden [.jornada_&]:block`)
- [x] 4 colunas → 3 em max-900px → 2 em max-sm
- [x] Desbloqueadas: hover translateY(-3px), barra bottom 3px
- [x] Bloqueadas: grayscale/opacity-40 no ícone, lock overlay 🔒, barra de progresso
- [x] Rarity pills corretos: Comum/Incomum/Raro/Lendário com cores
- [x] Shimmer animation no badge lendário (Jornada only)
- [x] Seções "✅ Desbloqueadas" e "🔒 Bloqueadas" com label separador

### ④-B List View (Foco — layout lista)
- [x] Visível apenas no Foco (`[.jornada_&]:hidden`)
- [x] Desbloqueadas: dot colorido, data + badge "✅ Obtida"
- [x] Bloqueadas: emoji grayscale, "X/Y" + badge "🔒 X%"
- [x] Hover `border-[var(--sl-border-h)]`

### ⑤ Modal de Badge
- [x] z-[60] — acima de todos os outros elementos
- [x] Backdrop blur + bg-black/65
- [x] Modal box max-w-[440px], rounded-[22px]
- [x] Emoji grande 64px com animação bounceIn
- [x] Nome em Syne extrabold 20px
- [x] Rarity pill + categoria pill
- [x] Box "Como desbloquear" com critério
- [x] Badge desbloqueada: box verde "🏆 Conquistado em DD Mês YYYY"
- [x] Badge bloqueada: barra de progresso + "Faltam X para desbloquear"
- [x] Motivação (Jornada only): gradiente verde/azul, texto italic
- [x] ESC fecha modal
- [x] Botão X fecha modal
- [x] Click fora do modal fecha (overlay click)

---

## Testes Funcionais

### Filtros de Categoria
- [x] Financeiras: exibe 4 desbloqueadas + 3 bloqueadas (com toggle ativo)
- [x] Metas: exibe 3 desbloqueadas + 2 bloqueadas
- [x] Consistência: exibe 3 desbloqueadas + 2 bloqueadas
- [x] Agenda: exibe 2 desbloqueadas + 2 bloqueadas
- [x] Todas: exibe 12 desbloqueadas + 9 bloqueadas

### Toggle "Mostrar bloqueadas"
- [x] Ativo por padrão — mostra seção "🔒 Bloqueadas"
- [x] Desativado — oculta seção "🔒 Bloqueadas"

### Animações
- [x] Contador hero: 0 → 12 via requestAnimationFrame
- [x] Barra hero: 0% → 57% via useEffect/setTimeout(100ms)
- [x] `sl-fade-up` nos cards com delay incremental
- [x] Modal open: animação `modalUp` (translateY 20px → 0)
- [x] Badge emoji: animação `bounceIn` ao abrir modal
- [x] Shimmer no badge lendário (Jornada only)

---

## Bugs Encontrados e Corrigidos

### BUG-01 — LOW — ThemePill hydration mismatch (pré-existente no shell) ⚠️ NÃO BLOQUEANTE
**Descrição:** Quando o localStorage tem `theme: "light"` salvo, o servidor renderiza `🌙` (dark default) mas o cliente renderiza `☀️` (light do localStorage). Erro de hydration no console.

**Causa:** `ThemePill` usa `useShellStore` que lê localStorage client-side. O server não tem acesso ao localStorage e renderiza com o valor padrão do store (dark).

**Status:** Bug pré-existente no shell (`components/shell/TopHeader`), não introduzido pela tela Conquistas. React re-renderiza corretamente no cliente. **Não bloqueia aprovação.**

**Fix recomendado (fora do escopo desta fase):** Inicializar o store com `undefined` e usar `suppressHydrationWarning` no span do emoji, ou usar `useEffect` para renderizar o emoji apenas no cliente.

---

## Checklist de Regras de Negócio

- [x] 21 badges estáticos (sem fetch DB no MVP)
- [x] 12 desbloqueadas / 9 bloqueadas (57%)
- [x] Recent strip: top 3 ordenadas por data desc (determinístico, sem Math.random)
- [x] Próxima conquista no Jornada: badge bloqueada com maior progresso (Reserva Construída 75%)
- [x] Filtro por categoria funcional com contadores corretos
- [x] Modal mostra critério, progresso (bloqueadas) ou data (desbloqueadas)
- [x] Click-outside fecha modal (testado via Playwright)

---

## Checklist de Acessibilidade / Código

- [x] `'use client'` presente
- [x] Nenhum `Math.random()` fora de useEffect
- [x] TypeScript sem erros (`tsc --noEmit` passa)
- [x] Todos os valores numéricos em `font-[DM_Mono]`
- [x] Títulos em `font-[Syne] font-extrabold`
- [x] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [x] ESC fecha modal (keydown listener com cleanup no useEffect)
- [x] `useShellStore` para checar `mode`

---

## Resultado Final

**Total de bugs:** 1
**Bugs críticos/altos:** 0
**Bugs baixos/não-bloqueantes:** 1 (BUG-01 — pré-existente no shell, não bloqueia)
**Status:** ✅ Aprovado para commit em homologação
