# 💰 Prompt de Implementação — Módulo Finanças

> **Para uso no Claude Code (Next.js + Supabase + Vercel)**  
> **Data:** Março 2026  
> **Módulo:** Finanças — Controle Financeiro Completo  
> **Cor:** `#10b981` (Emerald)  
> **Ícone Lucide:** `DollarSign`

---

## INSTRUÇÃO INICIAL — LEIA ANTES DE CODIFICAR

1. **`SPEC-FUNCIONAL-FINANCAS.md`** — 20 seções, 25 regras de negócio, 7 sub-telas
2. **`proto-mobile-financas-v3.html`** — 9 telas de referência visual
3. **`financas-visao-geral-regras-de-negocio.md`** — Spec detalhada do Dashboard (já existe no knowledge)
4. **`CLAUDE.md`** — Regras globais do projeto

**NOTA:** O módulo Finanças é o mais maduro do SyncLife — já tem implementação parcial. Este prompt guia a implementação COMPLETA do v3 com todas as 7 sub-telas.

---

## CONTEXTO DO MÓDULO

### Rotas (7 sub-telas)

| Rota | Componente | Status |
|------|-----------|--------|
| `/financas` | Dashboard | ✅ Implementado (precisa v3 updates) |
| `/financas/transacoes` | Transações | ✅ Implementado |
| `/financas/recorrentes` | Recorrentes | ✅ Implementado |
| `/financas/orcamentos` | Orçamentos | ✅ Implementado |
| `/financas/calendario` | Calendário | ⚠️ Parcial |
| `/financas/planejamento` | Planejamento [PRO] | ⚠️ Parcial |
| `/financas/relatorios` | Relatórios | ⚠️ Parcial |

### Tabelas Supabase (já existentes)

`categories`, `transactions`, `recurrences`, `budgets`, `planning_events`

### Integrações (recebe de outros módulos)

| Módulo | O que envia | Badge |
|--------|------------|-------|
| Corpo | Custo de consulta médica | "Auto — 🏃 Corpo" |
| Mente | Custo de trilha de estudo | "Auto — 🧠 Mente" |
| Patrimônio | Aportes em investimentos | "Auto — 📈 Patrimônio" |
| Experiências | Custos de viagem | "Auto — ✈️ Experiências" |

---

## FASES DE IMPLEMENTAÇÃO

### Fase 1: Sub-nav Underline + Atualização de Layout (2-3h)

**Objetivo:** Atualizar navegação de todos as sub-telas para underline tabs (padrão v3).

- 1.1 Criar/atualizar componente `FinancasSubNav` com 7 tabs underline
- 1.2 Tab ativa: underline `#10b981`, texto branco
- 1.3 Tab "Planejamento": badge PRO pequeno
- 1.4 Scroll horizontal em mobile (overflow-x com fade)
- 1.5 Atualizar todas as 7 páginas para usar `FinancasSubNav`
- 1.6 Header com ícone DollarSign + "Finanças" + seletor de período

**Validação:**
- [ ] 7 tabs visíveis e navegáveis
- [ ] Underline (não pills) com cor `#10b981`
- [ ] Mobile: scroll horizontal funciona

### Fase 2: Quick Entry (FAB) (3-4h)

**Objetivo:** Implementar o registro rápido em 3 toques acessível via FAB.

**Referência visual:** Protótipo tela 05

- 2.1 FAB button no bottom bar (gradiente emerald→blue)
- 2.2 Fullscreen overlay com numpad customizado
- 2.3 Toggle: Despesa | Receita | Transferência
- 2.4 Display de valor grande (DM Mono 52px)
- 2.5 Categoria sugerida com badge "IA"
- 2.6 Seletor de data (default: hoje)
- 2.7 "▼ Adicionar detalhes" (expande form)
- 2.8 Botão confirmar full-width
- 2.9 Após confirmar: toast + fecha + lista atualiza

**Validação:**
- [ ] 3 toques mínimos: tipo → numpad → confirmar (RN-FIN-09)
- [ ] Categoria sugerida por IA (regras simples no MVP)
- [ ] Transação salva e dashboard/orçamento atualiza

### Fase 3: Dashboard v3 (4-5h)

**Objetivo:** Completar o dashboard com todos os componentes da spec.

**Referência visual:** Protótipo tela 01
**Referência funcional:** financas-visao-geral-regras-de-negocio.md

- 3.1 Card de saldo hero com gradiente
- 3.2 Grid receitas/despesas (2 cards)
- 3.3 [Jornada] Insight de projeção IA
- 3.4 Budget Health Score (dots coloridos)
- 3.5 Lista de envelopes com barra colorida (RN-FIN-05)
- 3.6 Últimas 7 transações
- 3.7 Gráfico de fluxo de caixa diário (Recharts BarChart + Line)
- 3.8 Projeção de saldo (timeline 5 meses) — estrutura para PRO
- 3.9 Próximas recorrentes (5)
- 3.10 Empty state

**Validação:**
- [ ] Saldo calcula: receitas - despesas + transportado (RN-FIN-01)
- [ ] Barras de orçamento com cores por faixa (RN-FIN-05)
- [ ] Budget Health Score dots corretos (RN-FIN-13)
- [ ] Projeção IA Jornada-only (RN-FIN-24)

### Fase 4: Transações Completas (3-4h)

**Objetivo:** Lista de transações com filtros, form completo e edição.

**Referência visual:** Protótipo telas 02 e 06

- 4.1 Filtros: período, tipo, categoria, ordenação
- 4.2 Lista com emoji + nome + data + valor + método + badge
- 4.3 Badge "Auto — [módulo]" para transações geradas por integração
- 4.4 Form completo de nova transação (tela 06)
- 4.5 Edição de transação (tap → form pré-preenchido)
- 4.6 Exclusão com confirmação
- 4.7 Busca por texto (RN-FIN-21)

**Validação:**
- [ ] Filtros combinados (AND) funcionam (RN-FIN-21)
- [ ] Transações auto-geradas mostram badge de origem
- [ ] Criar/editar/excluir recalcula dashboard e orçamentos

### Fase 5: Recorrentes (2-3h)

**Objetivo:** Gestão de despesas fixas com geração automática.

**Referência visual:** Protótipo tela 04

- 5.1 KPIs (3 cards: rec receitas, rec despesas, % comprometida)
- 5.2 [Jornada] Insight de próxima ocorrência
- 5.3 Próximas ocorrências (30 dias)
- 5.4 Lista de recorrentes ativas
- 5.5 Criar/editar recorrente (form)
- 5.6 Pausar/retomar toggle (RN-FIN-08)
- 5.7 Motor de geração automática (RN-FIN-07)

**Validação:**
- [ ] Geração automática cria transação no dia correto (RN-FIN-07)
- [ ] Pausar para geração, retomar não gera retroativo (RN-FIN-08)
- [ ] % comprometida calcula corretamente

### Fase 6: Orçamentos + Calendário + Relatórios (5-6h)

**Objetivo:** Completar as 3 telas analíticas.

**Referência visual:** Protótipos telas 03 e 08

- 6.1 Orçamentos: doughnut chart + lista de envelopes + criar/editar
- 6.2 Card "Não alocado" (RN-FIN-06)
- 6.3 Calendário: grid mensal com dots de cor (RN-FIN-10)
- 6.4 Drawer do dia (bottom sheet com transações) (RN-FIN-11)
- 6.5 Cards de resumo (maior entrada, maior saída, saldo baixo, saldo hoje)
- 6.6 Relatórios: comparativo mensal + gráfico evolução + breakdown por categoria
- 6.7 Exportação CSV (RN-FIN-16)
- 6.8 [PRO] Exportação PDF

**Validação:**
- [ ] Cores dinâmicas dos envelopes (RN-FIN-05)
- [ ] Calendário mostra dias futuros com opacity (RN-FIN-10)
- [ ] Drawer mostra transações + saldo acumulado (RN-FIN-11)
- [ ] CSV exporta dados corretos

### Fase 7: Planejamento PRO + Integrações (3-4h)

**Objetivo:** Tela de projeção financeira e integrações cross-módulo.

- 7.1 Planejamento: saldo atual + 3 pills (comprometido, livre, taxa poupança)
- 7.2 Timeline 5 meses com nós (current, good, warn) (RN-FIN-12)
- 7.3 Eventos de planejamento (CRUD)
- 7.4 Gate PRO (RN-FIN-17)
- 7.5 Integração: Corpo → Finanças (consulta cria despesa)
- 7.6 Integração: Mente → Finanças (trilha cria despesa)
- 7.7 Integração: Finanças → Futuro (envelope alimenta meta)
- 7.8 Integração: Finanças → Panorama (dados para dashboard/alertas/heatmap)

**Validação:**
- [ ] Timeline warn se saldo ≤ 30% do anterior (RN-FIN-12)
- [ ] Planejamento é PRO-only (RN-FIN-17)
- [ ] Transação auto-gerada por Corpo tem badge (RN-FIN-14)
- [ ] Envelope vinculado atualiza meta no Futuro (RN-FIN-20)

### Fase 8: Testes E2E Playwright (5-6h)

#### Grupo 1 — Navegação (6 testes)
```
test('7 tabs underline com cor #10b981')
test('tab Planejamento mostra badge PRO')
test('scroll horizontal funciona no mobile')
test('seletor de período muda mês')
test('FAB abre Quick Entry')
test('tabs navegam entre sub-telas')
```

#### Grupo 2 — Quick Entry (7 testes)
```
test('numpad digita valor correto')
test('toggle despesa/receita/transferência')
test('categoria sugerida por IA aparece')
test('mudar categoria funciona')
test('confirmar cria transação')
test('expandir detalhes mostra campos extras')
test('após confirmar fecha e lista atualiza')
```

#### Grupo 3 — Dashboard (8 testes)
```
test('saldo calcula receitas - despesas')
test('card receita/despesa com valores corretos')
test('orçamentos listam com barras coloridas')
test('budget health score dots corretos')
test('últimas 7 transações mostram')
test('[Jornada] insight de projeção aparece')
test('[Foco] insight não aparece')
test('empty state para primeiro uso')
```

#### Grupo 4 — Transações CRUD (8 testes)
```
test('criar transação via form completo')
test('editar transação pré-preenche form')
test('excluir transação com confirmação')
test('filtros combinados AND funcionam')
test('busca por texto retorna resultados')
test('transação auto-gerada mostra badge')
test('ordenação por data/valor funciona')
test('seletor de período filtra transações')
```

#### Grupo 5 — Recorrentes (6 testes)
```
test('criar recorrente salva no banco')
test('pausar recorrente para geração')
test('retomar não gera retroativo')
test('KPIs calculam corretamente')
test('próximas ocorrências listam 30 dias')
test('geração automática cria transação')
```

#### Grupo 6 — Orçamentos (5 testes)
```
test('criar envelope por categoria')
test('barras com cores dinâmicas por faixa')
test('não alocado calcula: receitas - SUM(limites)')
test('doughnut chart renderiza')
test('limite FREE de 5 envelopes')
```

#### Grupo 7 — Calendário + Relatórios (6 testes)
```
test('grid mensal renderiza 28-31 dias')
test('tap em dia abre drawer')
test('dias futuros com opacity 0.3')
test('cards resumo mostram valores corretos')
test('relatório comparativo mês vs anterior')
test('exportação CSV gera arquivo')
```

#### Grupo 8 — Responsividade (4 testes)
```
test('375px: todo conteúdo visível')
test('375px: sub-nav scroll horizontal')
test('1024px: layout desktop funciona')
test('temas dark/light renderizam')
```

**Total: 50 testes**

---

## 10 REGRAS ABSOLUTAS

1. **Cor:** `#10b981` — Emerald em todo o módulo
2. **Navegação:** 7 underline tabs (NUNCA pills)
3. **Quick Entry:** Acessível via FAB. 3 toques mínimos
4. **Orçamento cores:** ≤60% verde, 61-79% amarelo, 80-99% laranja, ≥100% vermelho
5. **Recorrente automática:** Gera transação no dia configurado sem intervenção
6. **Valor sempre positivo:** Tipo (income/expense) determina sinal na exibição
7. **Transações de integração:** Badge "Auto — [módulo]", não editáveis pela origem
8. **Mobile-first:** 375px antes de desktop
9. **Jornada:** Insights IA, projeção, sugestões. Foco: dados puros
10. **Textos sobre fundo #10b981:** Sempre pretos (#000)

---

## ORDEM DE EXECUÇÃO

```
Fase 1 (Sub-nav + Layout) ← PRIMEIRO
    ├── Fase 2 (Quick Entry)
    ├── Fase 3 (Dashboard v3) ← depende de todas as tabelas
    ├── Fase 4 (Transações)
    ├── Fase 5 (Recorrentes)
    ├── Fase 6 (Orçamentos + Calendário + Relatórios)
    └── Fase 7 (Planejamento + Integrações)
                │
                └── Fase 8 (Testes) [após tudo]
```

---

## CHECKLIST DE CONCLUSÃO

- [ ] 7 rotas respondem com sub-nav underline
- [ ] Quick Entry funciona via FAB em 3 toques
- [ ] Dashboard completo com todos os componentes
- [ ] 25 regras de negócio implementadas
- [ ] Integrações Corpo/Mente/Futuro/Panorama funcionando
- [ ] Limites FREE/PRO: 5 envelopes, 10 recorrentes, sem Planejamento
- [ ] Calendário com grid + drawer do dia
- [ ] Relatórios com comparativo + exportação CSV
- [ ] Empty states em todas as telas
- [ ] 50 testes Playwright passando
- [ ] Deploy no Vercel com zero erros

---

*Prompt criado em: 07/03/2026*  
*Versão: 1.0*  
*Total estimado: 27-35 horas de desenvolvimento*
