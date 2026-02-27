# QA — Dashboard Home (Fase 5.1)

> Protótipo de referência: `prototipos/proto-dashboard-revisado.html`
> Arquivo: `web/src/app/(app)/dashboard/page.tsx`
> Data de validação: 2026-02-27

---

## Status Geral

| Item | Status |
|------|--------|
| Layout Foco Dark | ✅ Aprovado (com bugs corrigidos) |
| Layout Jornada Dark | ✅ Aprovado (com bugs corrigidos) |
| Layout Foco Light | ✅ |
| Layout Jornada Light | ✅ |
| Dados reais (Supabase) | ✅ Carregando corretamente |
| Responsividade mobile | ✅ |

---

## Checklist de Layout vs Protótipo

### ① Header Row
- [x] Foco: "Dashboard" em Syne extrabold + "Fevereiro 2026 · semana X de 4"
- [x] Jornada: saudação com nome + gradiente `text-sl-grad`
- [x] Jornada: streak badge "🔥 7 dias" visível
- [x] Foco: streak badge oculto
- [x] Period button com ícone calendário + mês/ano + chevron
- [x] Foco: breadcrumb no TopHeader (Home › Dashboard)
- [x] Jornada: saudação com emoji no TopHeader

### ② Life Sync Score Hero (Jornada only)
- [x] Oculto no Foco (`[.jornada_&]:hidden` não viola)
- [x] Número 74 em Syne 80px com gradiente
- [x] Barra de progresso animada via useEffect (0 → 74%)
- [x] 4 dimensões: Financeiro 82, Metas 61, Consistência 78, Agenda 67
- [x] Botão "Ver análise completa"
- [x] "↑ +3 vs. semana passada"

### ③ KPI Cards (4 cards)
- [x] Grid 4 colunas, colapsa para 2 em `max-sm`
- [x] Ícones com fundo colorido 32px
- [x] Valores em DM Mono 26px
- [x] Barra accent no topo (0.5px)
- [x] Card Despesas: mini-barra de % da receita
- [x] Card Metas: mini-barra gradiente + status de risco
- [x] Hover: translateY(-1px)
- [ ] ~~Delta "↑ +X% vs. mês ant."~~ → INFO: requer dados históricos, MVP usa texto genérico

### ④ Insight Card
- [x] Foco: "Resumo do mês" + badge "AUTO" + 4 stats em DM Mono
- [x] Foco: Orçamentos estourados (vermelho), Metas no ritmo (verde), Streak (azul), Poupança (verde)
- [x] Jornada: Gradiente verde/azul fundo, border
- [x] Jornada: "💡 Consultor Financeiro IA" + badge mês/ano
- [x] Jornada: Texto narrativo com highlights coloridos
- [x] Jornada: Input "Pergunte algo..." + botão "Perguntar"

### ⑤ Main Grid (1fr 340px)
- [x] Colapsa para 1 coluna em `max-lg`
- [x] **Orçamentos do Mês**: até 5 itens, barra h-1.5, cores corretas (≤70% verde, 70-85% amarelo, >85% vermelho)
- [x] **Gastos por Categoria**: barras customizadas altura 160px, % label acima, label categoria abaixo, linha baseline
- [x] **Metas em Destaque**: top 3 por prazo, barra gradiente, tip de atraso (Jornada)
- [x] **Agenda da Semana**: week strip 7 dias, hoje destacado em verde, pontos de eventos, lista 4 eventos

### ⑥ Bottom Grid (3 colunas)
- [x] Colapsa para 1 coluna em `max-lg`
- [x] **Próximas Recorrentes**: 4 items, separadores border-b, badge status colorido
- [x] **Projeção de Saldo**: sparkline Recharts AreaChart, "Hoje" e "30 dias", warning box
- [x] Foco: "📋 Resumo Financeiro" (4 linhas com border-b)
- [x] Jornada: "🏆 Conquistas Recentes" (5 badges, "Ver todas →", "Próxima conquista")
- [x] Switch Foco/Jornada funciona via CSS `[.jornada_&]`

---

## Bugs Encontrados e Corrigidos

### BUG-01 — HIGH — Week Strip com semana/dias errados ✅ CORRIGIDO
**Descrição:** `getWeekRange` em `use-agenda.ts` usa Domingo como início de semana (padrão EUA) e `.toISOString()` com conversão UTC que pode causar shift de 1 dia. Resultado: hoje (Sex 27/02) aparecia como "Dom" e a semana exibida era 21-27 ao invés de 23-Mar/1.

**Causa:**
- `const diff = d.getDate() - day` subtrai o `getDay()` (0=Dom) ao invés de calcular corretamente a Segunda-feira
- `sunday.toISOString().split('T')[0]` converte para UTC podendo recuar 1 dia em fusos UTC+

**Fix aplicado:** `use-agenda.ts` → `getWeekRange`: semana começa na Segunda + uso de string local `${y}-${mm}-${dd}` ao invés de `.toISOString()`. Dashboard loop também corrigido para usar string de data local.

---

### BUG-02 — LOW — "1 dias" deveria ser "1 dia" ✅ CORRIGIDO
**Descrição:** Badge de status das Próximas Recorrentes e texto da Projeção de Saldo mostravam "vence em 1 dias" ao invés de "vence em 1 dia".

**Fix aplicado:** Lógica de plural `${n} ${n === 1 ? 'dia' : 'dias'}` em ambos os locais.

---

## Checklist de Regras de Negócio

- [x] Período padrão: mês atual (baseado em `new Date()`)
- [x] Orçamentos: mostra até 5, link "Ver todos"
- [x] Metas: máx 3 em destaque, ordenadas por prazo mais próximo
- [x] Recorrentes: ordenadas por `daysLeft` crescente (hoje primeiro)
- [x] Projeção: saldo atual − total recorrentes 30 dias (simplificado)
- [x] Conquistas no Jornada: mock data (sistema completo em 5.2)
- [x] Life Sync Score: mock 74 com dimensões fixas

---

## Checklist de Acessibilidade / Código

- [x] `'use client'` presente (requer hooks e estado)
- [x] Greeting calculado client-side via `useEffect` (sem hydration error)
- [x] Score bar animado via `useEffect` após mount
- [x] Sparkline via Recharts `<AreaChart>`
- [x] Todos os valores monetários em `font-[DM_Mono]`
- [x] Títulos em `font-[Syne] font-extrabold`
- [x] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [x] Nenhum `Math.random()` fora de useEffect

---

## Resultado Final

**Total de bugs:** 2
**Bugs críticos/altos:** 1 (BUG-01 — corrigido)
**Bugs baixos:** 1 (BUG-02 — corrigido)
**Status:** ✅ Aprovado para commit em homologação
