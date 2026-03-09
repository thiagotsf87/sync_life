# Plano de Cenários E2E — SyncLife

> **Versão:** 1.1  
> **Data:** Março 2026  
> **Base:** Especificações funcionais em `docs/atividades a serem implementadas`  
> **Framework:** Playwright + TypeScript  
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Regras Globais dos Specs](#2-regras-globais-dos-specs)
3. [Cenários por Módulo](#3-cenários-por-módulo)
4. [Cross-Módulo](#4-cross-módulo)
5. [Mapeamento Spec → Cenário](#5-mapeamento-spec--cenário)
6. [Priorização Smoke vs Regression](#6-priorização-smoke-vs-regression)

---

## 1. Visão Geral

Este documento consolida os cenários de teste E2E baseados nas especificações funcionais dos 10 módulos do SyncLife. Os cenários devem ser implementados em `web/e2e/` usando Playwright.

**Convenções:**
- IDs de cenário: `[MÓDULO]-[NN]` (ex: PAN-01, FIN-02)
- Prioridade: `Smoke` (executa em toda PR, < 5 min) ou `Regression` (schedule/manual, < 30 min)
- Nomenclatura de testes: `test('deve [ação esperada]', ...)` em português

---

## 2. Regras Globais dos Specs

| Regra | Descrição |
|-------|-----------|
| Navegação | Tabs com **underline**, nunca pills |
| Design | Mobile-first, responsivo |
| Experiência unificada | Saudação, Life Sync Score, streaks, insights IA sempre visíveis (pós MIGRATION-ELIMINAR-MODO-DUAL) |
| Integrações | Opt-in via Configurações |
| Soft delete | `status = 'deleted'` onde aplicável |

### Cores por Módulo

| Módulo | Cor | Ícone Lucide |
|--------|-----|--------------|
| Panorama | `#6366f1` | Globe |
| Finanças | `#10b981` | DollarSign |
| Futuro | `#8b5cf6` | Target |
| Mente | `#eab308` | Brain |
| Corpo | `#f97316` | Activity |
| Experiências | `#ec4899` | Plane |
| Carreira | `#f43f5e` | Briefcase |
| Tempo | `#06b6d4` | Clock |
| Configurações | `#64748b` | Settings |
| Patrimônio | `#3b82f6` | TrendingUp |

---

## 3. Cenários por Módulo

### 3.1 Panorama (Dashboard + Conquistas + Ranking)

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| PAN-01 | Dashboard carrega com KPIs e heatmap de gastos | RN-PAN-10 | Smoke |
| PAN-03 | Ring do Life Score anima de 0 até valor em ~1.2s | RN-PAN-01 | Regression |
| PAN-04 | Saudação muda por período (Bom dia / Boa tarde / Boa noite) | RN-PAN-14 | Regression |
| PAN-05 | Streak badge visível (ex: "🔥 7 dias") | RN-PAN-08 | Regression |
| PAN-06 | Sub-nav com underline (Dashboard, Conquistas, Ranking) | Spec 3.3 | Regression |
| PAN-07 | Conquistas: filtros por categoria (Todas, Financeiras, Metas, Consistência) | Spec 6.2.5 | Regression |
| PAN-08 | Conquistas: modal de detalhe ao clicar em badge | Spec 8.1 | Regression |
| PAN-09 | Ranking: hero card com posição e score | Spec 7.2.2 | Regression |
| PAN-10 | Ranking: filtros Geral / Este mês / Esta semana | Spec 7.2.1 | Regression |
| PAN-11 | Ações rápidas (Transação, Evento, Revisão, Foto Recibo) | RN-PAN-15 | Regression |
| PAN-13 | Cor do módulo `#6366f1` na Module Bar | RN-PAN-17 | Regression |
| PAN-14 | Alertas de orçamento ≥ 75% exibidos | RN-PAN-16 | Regression |
| PAN-15 | Life Sync Score sempre visível | RN-PAN-18 | Regression |
| PAN-16 | Review Semanal acessível | Spec | Regression |

**Rotas:** `/dashboard`, `/conquistas`, `/conquistas/ranking`

---

### 3.2 Finanças

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| FIN-01 | Dashboard: KPIs Receitas, Despesas, Saldo visíveis | Spec 5 | Smoke |
| FIN-02 | Transações: criar receita e despesa | Spec 6 | Smoke |
| FIN-03 | Quick Entry: mínimo 3 toques (categoria, valor, confirmação) | Spec 2.2 | Regression |
| FIN-04 | Orçamentos: barra verde ≤70%, amarela 70–85%, vermelha >85% | Spec 8 | Regression |
| FIN-05 | Metas: gradiente `linear-gradient(90deg, #10b981, #0055ff)` | CLAUDE.md | Regression |
| FIN-06 | Recorrentes: criar, pausar, retomar | Spec 7 | Regression |
| FIN-07 | Calendário: grid mensal, dia com transação destacado | Spec 9 | Regression |
| FIN-08 | Planejamento: cenários | Spec 10 | Regression |
| FIN-09 | Relatórios: exportar CSV | Spec 11 | Regression |
| FIN-10 | Sub-nav com underline (7 tabs) | Spec 3 | Regression |
| FIN-11 | Busca transações case-insensitive | RN-FIN-21 | Regression |

**Rotas:** `/financas`, `/financas/transacoes`, `/financas/orcamentos`, `/financas/recorrentes`, `/financas/calendario`, `/financas/planejamento`, `/financas/relatorios`

---

### 3.3 Futuro

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| FUT-01 | Criar objetivo e adicionar metas | Spec | Smoke |
| FUT-03 | Milestones automáticos em 25/50/75/100% | Spec | Regression |
| FUT-05 | Progresso bidirecional objetivo ↔ meta | Spec | Regression |
| FUT-07 | Simulador de cenários | Spec | Regression |

**Rotas:** `/futuro`, `/futuro/[id]`

---

### 3.4 Mente

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| MEN-01 | Trilhas de aprendizado carregam | Spec | Smoke |
| MEN-02 | Pomodoro: iniciar, timer em background, registrar sessão ≥1 ciclo | Spec | Regression |
| MEN-04 | Sessões imutáveis após salvar | Spec | Regression |

**Rotas:** `/mente`

---

### 3.5 Corpo

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| COR-01 | Peso: 1 entrada por dia (upsert) | Spec | Smoke |
| COR-02 | Atividades e TMB/TDEE/IMC | Spec | Regression |
| COR-03 | Coach IA sempre disponível | Spec | Regression |

**Rotas:** `/corpo`

---

### 3.6 Experiências

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| EXP-01 | Dashboard e lista de viagens carregam | Spec | Smoke |
| EXP-02 | Wizard nova viagem (destino, datas) | Spec | Regression |
| EXP-03 | Bucket list: "Transformar em viagem" | Spec | Regression |
| EXP-05 | Soft delete para viagens | Spec | Regression |
| EXP-06 | Memória: rating e tags | Spec | Regression |

**Rotas:** `/experiencias`, `/experiencias/viagens/[id]`

---

### 3.7 Carreira

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| CAR-01 | Perfil, habilidades, roadmap carregam | Spec | Smoke |
| CAR-02 | Proficiência 1–5, cores por nível | Spec | Regression |
| CAR-03 | Roadmap: 1 step current | Spec | Regression |
| CAR-04 | Simulador de promoção sempre disponível | Spec | Regression |

**Rotas:** `/carreira`, `/carreira/habilidades`, `/carreira/roadmap`, `/carreira/perfil`, `/carreira/historico`

---

### 3.8 Tempo

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| TEM-01 | Agenda diária e eventos carregam | Spec | Smoke |
| TEM-02 | 4 tipos de evento: Compromisso, Tarefa, Foco, Lembrete | Spec | Regression |
| TEM-04 | Review semanal sempre disponível | Spec | Regression |
| TEM-05 | Evento vinculado a módulo (badge visual) | Spec | Regression |
| TEM-06 | Soft delete para eventos | RN-TMP-09 | Regression |

**Rotas:** `/tempo`

---

### 3.9 Configurações

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| CFG-01 | Perfil, Aparência, Notificações carregam | Spec | Smoke |
| CFG-02 | 12 temas (todos liberados) | Spec | Regression |
| CFG-03 | Persistência tema (localStorage + Supabase) | Spec | Regression |
| CFG-04 | Integrações opt-in | Spec | Regression |
| CFG-05 | LGPD: exportação e exclusão de conta | Spec | Regression |
| CFG-06 | Excluir conta: botão "EXCLUIR" com confirmação dupla | Spec | Regression |

**Rotas:** `/configuracoes`, `/configuracoes/aparencia`, `/configuracoes/notificacoes`, `/configuracoes/integracoes`, `/configuracoes/plano`

---

### 3.10 Patrimônio

| ID | Cenário | Regra de Negócio | Prioridade |
|----|---------|-----------------|------------|
| PAT-01 | Ativos e transações carregam | Spec | Smoke |
| PAT-02 | Simulador IF 4% sempre disponível | Spec | Regression |
| PAT-03 | Provento → Receita em Finanças (integração) | Spec | Regression |

**Rotas:** `/patrimonio`

---

## 4. Cross-Módulo

### Shell e Navegação

| ID | Cenário | Prioridade |
|----|---------|------------|
| SHL-01 | 11 módulos navegáveis sem erro | Smoke |
| SHL-03 | Trocar Dark ↔ Light | Smoke |
| SHL-04 | Persistência tema após reload | Regression |
| SHL-05 | Mobile bottom bar visível em 375px | Regression |

### Experiência Unificada (pós MIGRATION-ELIMINAR-MODO-DUAL)

| ID | Cenário | Prioridade |
|----|---------|------------|
| SHL-UNI-01 | NÃO deve existir atributo `data-mode` no `<html>` | Regression |
| SHL-UNI-02 | NÃO deve existir classe `.jornada-only` ou `.foco-only` em componentes | Regression |
| SHL-UNI-03 | Saudação personalizada sempre visível no header | Regression |
| SHL-UNI-04 | NÃO deve existir ModePill no header | Regression |
| SHL-UNI-05 | Todos os 12 temas selecionáveis sem restrição | Regression |
| SHL-UNI-06 | NÃO deve abrir UpgradeModal ao selecionar qualquer tema | Regression |

### Autenticação

| ID | Cenário | Prioridade |
|----|---------|------------|
| AUTH-01 | Login, cadastro, rotas protegidas | Smoke |

### Design System

| ID | Cenário | Prioridade |
|----|---------|------------|
| DS-01 | Fontes Syne, DM Mono, Outfit carregadas | Regression |
| DS-02 | Tokens --sl-* em Dark/Light | Regression |
| DS-03 | Anatomia: topbar → sum-strip → conteúdo | Regression |

---

## 5. Mapeamento Spec → Cenário

| Documento Spec | Cenários |
|----------------|----------|
| `01 - panorama/SPEC-FUNCIONAL-PANORAMA.md` | PAN-01, PAN-03 a PAN-16 |
| `02 - finanças/SPEC-FUNCIONAL-FINANCAS.md` | FIN-01 a FIN-11 |
| `03 - futuro/DOC-FUNCIONAL-FUTURO-COMPLETO.md` | FUT-01, FUT-03, FUT-05, FUT-07 |
| `04 - mente/spec funcional - modulo mente.md` | MEN-01, MEN-02, MEN-04 |
| `05 - corpo/SPEC-FUNCIONAL-CORPO.md` | COR-01 a COR-03 |
| `06 - experiencias/SPEC-FUNCIONAL-EXPERIENCIAS.md` | EXP-01 a EXP-03, EXP-05, EXP-06 |
| `07 - carreira/SPEC-FUNCIONAL-CARREIRA (1).md` | CAR-01 a CAR-04 |
| `08 - tempo/SPEC-FUNCIONAL-TEMPO.md` | TEM-01, TEM-02, TEM-04 a TEM-06 |
| `09 - configurações/SPEC-FUNCIONAL-CONFIGURACOES.md` | CFG-01 a CFG-06 |
| `11 - patrimonio/SPEC-FUNCIONAL-PATRIMONIO.md` | PAT-01 a PAT-03 |

---

## 6. Priorização Smoke vs Regression

### Smoke (executar em toda PR, target < 5 min)

- AUTH-01
- SHL-01, SHL-03
- PAN-01
- FIN-01, FIN-02
- FUT-01
- MEN-01
- COR-01
- EXP-01
- CAR-01
- TEM-01
- CFG-01
- PAT-01

### Regression (executar por schedule ou manual, target < 30 min)

- Todos os demais cenários listados neste documento.

---

*Documento gerado com base no Plano E2E Playwright Unificado. Não executar cenários até validação das implementações.*
