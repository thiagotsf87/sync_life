# Auditoria Mobile — SyncLife MVP v4
**Data:** 28/02/2026 | **Viewport testado:** 390×844 (iPhone 14 Pro)
**Branch:** homologacao | **Método:** Playwright navegação real + screenshots

---

## Sumário Executivo

A aplicação foi construída com foco desktop e adaptada parcialmente para mobile.
A navegação funciona, mas há **3 problemas críticos** que quebram a experiência em
todas as telas e **5 problemas graves** que tornam módulos específicos difíceis de usar.

| Severidade | Qtde | Impacto |
|------------|------|---------|
| 🔴 CRÍTICO  | 3    | Todas as telas afetadas |
| 🟠 GRAVE    | 5    | Módulos específicos |
| 🟡 MODERADO | 4    | Visual/UX degradado |
| 🟢 LEVE     | 3    | Polimento |

---

## 🔴 P1 — TopHeader quebrado em TODAS as telas

**Telas afetadas:** 100% das telas autenticadas

**Problema:**
O header tenta exibir 3 grupos em uma linha de 390px:
- `[ícone módulo > breadcrumb]` (esquerda)
- `[🌙 Boa noite, NomeUsuário]` (centro)
- `[Foco PRO | Auto | 🔔]` (direita)

Resultado: "noite, Teste" quebra em 2 linhas e estoura para fora da área visível.
O botão de modo/tema fica cortado. O header ocupa ~54px mas visualmente parece ~70px
por causa do overflow.

**Screenshot:** `01-dashboard-00.png` (linha 1: "noite, / Teste" cortado à direita)

**Gravidade:** O header aparece em 100% das telas. É o problema #1 de percepção de qualidade.

---

## 🔴 P2 — Abas de sub-navegação sem scroll horizontal visível

**Telas afetadas:** Mente, Carreira, Patrimônio, Finanças, Configurações, Corpo

**Problema:**
As abas de módulo (sub-tabs) transbordam horizontalmente sem indicar que há mais
itens. O usuário não sabe que pode deslizar.

| Módulo | Abas | Cortado |
|--------|------|---------|
| Mente | Dashboard \| Trilhas \| Timer Foco \| Sessões \| **Biblioteca** | "Biblioteca" cortado |
| Carreira | Dashboard \| **Perfil Profissional** \| Roadmap \| Habilidades | Itens cortados |
| Patrimônio | Dashboard \| Carteira \| Proventos \| Evolução \| **Simulador IF** | "Simulador" cortado |
| Finanças | Dashboard \| Transações \| Recorrentes \| **Orçamentos** | Parcialmente cortado |
| Config | Perfil \| Aparência \| Modo de Uso \| Notificações \| **Categorias** | Última cortada |

**Screenshot:** `05-mente-00.png`, `06-carreira-00.png`, `07-patrimonio-00.png`, `13-config-00.png`

**Gravidade:** Funcionalidades inteiras ficam inacessíveis pois o usuário não descobre as abas escondidas.

---

## 🔴 P3 — Card Life Sync Score (Dashboard) — layout 2 colunas quebrado

**Telas afetadas:** Dashboard

**Problema:**
O card Life Sync Score usa um layout de 2 colunas (número grande à esquerda,
lista de dimensões à direita). No mobile, a coluna direita transborda para fora
do card, mostrando texto cortado ("Há espaço para crescer", lista de módulos)
e o botão "Ver" parcialmente visível.

**Screenshot:** `01-dashboard-00.png` (card central com overflow visível)

---

## 🟠 P4 — KPI Cards com valores monetários cortados

**Telas afetadas:** Dashboard, Finanças, Futuro, Corpo, Mente, Carreira, Patrimônio, Experiências

**Problema:**
O grid 2×2 de KPI cards usa padding generoso e fonte grande (DM Mono xl).
Valores como "R$ 7.780" e "R$ 4.397" ficam cortados à direita.

**Detalhe:**
- `R$ 7.78█` → o "0" final some
- Labels em UPPERCASE tracking-widest ocupam quase toda a largura
- Em Patrimônio: "R$ 3.933,00" fica cortado após a vírgula

**Screenshot:** `01-dashboard-01.png` (KPIs cortados), `07-patrimonio-00.png`

---

## 🟠 P5 — Bottom Navigation — 7 módulos escondidos em "Mais"

**Telas afetadas:** Navegação global

**Problema:**
O bottom nav exibe apenas: `Início | Finanças | Futuro | Tempo | Mais`

O botão "Mais" abre um drawer com: Corpo, Mente, Patrimônio, Carreira,
Experiências, Conquistas, Configurações — **7 destinos** importantes que requerem
2 toques para acesso.

**Impacto:**
- Usuários não descobrem módulos como Conquistas e Corpo facilmente
- O drawer de "Mais" funciona bem visualmente, mas a arquitetura penaliza módulos importantes
- Sem indicador visual de qual módulo do "Mais" está ativo atualmente

**Screenshot:** `18-mais-menu.png`

---

## 🟠 P6 — Agenda Semanal — view muito densa e ilegível

**Telas afetadas:** Tempo/Semanal

**Problema:**
A view semanal tenta exibir 7 colunas (DOM a SÁB) em 390px. Cada coluna fica
com ~48px de largura — muito pouco para mostrar eventos. O resultado é um
calendário quase ilegível onde os eventos ficam cortados.

**Screenshot:** `03-tempo-01.png` (grid vertical de horários sem eventos visíveis)

---

## 🟠 P7 — Título de módulo repetido e desperdiça espaço

**Telas afetadas:** Corpo/Atividades, Corpo/Peso, Mente subpages, e outros

**Problema:**
Subpages exibem um H1 grande (ex: "🏃 Atividades Físicas") logo abaixo do header
que já mostra "Corpo > Atividades" no breadcrumb. Duplicação que consome ~80px
verticais preciosos na tela.

**Screenshot:** `14-corpo-atividades-00.png`

---

## 🟠 P8 — Finanças/Transações — filtros em 3 linhas empilhadas

**Telas afetadas:** Finanças/Transações

**Problema:**
Os controles de filtro ficam em 3 linhas separadas:
1. `[Fevereiro 2026 < >]`
2. `[Todos] [Receitas] [Despesas] [Recorrentes] [Todas as categorias ▼]`
3. `[Mais recente ▼]`

Isso consome ~180px antes de mostrar qualquer transação. Em mobile o conteúdo
principal deve aparecer o mais cedo possível.

**Screenshot:** `10-fin-transacoes-00.png`

---

## 🟡 P9 — Patrimônio/Carteira — KPIs em coluna única (sem grid)

**Telas afetadas:** Patrimônio/Carteira

**Problema:**
Os KPIs (Total de Ativos, Total Investido, Com Cotação) aparecem como cards
individuais full-width em vez de grid 2×2. Ocupa muito espaço vertical.

**Screenshot:** `15-patrimonio-carteira-00.png`

---

## 🟡 P10 — Cards de orçamento — nome de categoria em 2 linhas

**Telas afetadas:** Dashboard (widget orçamentos), Finanças/Orçamentos

**Problema:**
Nomes longos como "Contas e Serviços" + valor + percentual não cabem em 1 linha.
O nome quebra para 2 linhas desalinhando todo o card.

**Screenshot:** `01-dashboard-02.png`

---

## 🟡 P11 — Configurações — layout two-panel não funciona em mobile

**Telas afetadas:** Configurações (todas as subpages)

**Problema:**
O layout de configurações parece ter sido simplificado para mobile (mostra apenas
o panel de conteúdo), mas as abas ainda transbordam horizontalmente.
O `dropdown` de moeda e fuso horário ocupa quase toda a largura disponível.

**Screenshot:** `13-config-00.png`

---

## 🟡 P12 — Botão FAB duplicado/inconsistente

**Telas afetadas:** Tempo, algumas subpages

**Problema:**
Tempo tem um botão FAB verde flutuante E um botão "+" no topo da página.
Duplicação confusa para o usuário.

**Screenshot:** `03-tempo-00.png` (FAB verde no canto inferior direito)

---

## 🟢 P13 — Rota /mente/timer-foco retorna 404

**Impacto:** Funcional — link quebrado

A rota `/mente/timer-foco` não existe. O Timer Pomodoro está em `/mente`
(aba na página principal de Mente), não como subpage separada.

---

## 🟢 P14 — Modo/Tema não visível em mobile (escondido no "Mais")

**Problema:**
Em mobile, o toggle Foco/Jornada fica no header (cortado) e no drawer "Mais".
Muitos usuários não vão descobrir como trocar de modo.

---

## 🟢 P15 — Avatar/iniciais do usuário sem funcionalidade visível

**Problema:**
O círculo "N" (iniciais) no canto inferior esquerdo do bottom nav não tem feedback
visual de que é clicável nem indica o que faz.

---

## Resumo de Páginas Funcionais vs. Quebradas

| Página | Status Mobile |
|--------|--------------|
| Dashboard | ⚠️ Card Score quebrado, header cortado |
| Finanças (main) | ❌ Erro runtime Turbopack (bug dev only) |
| Finanças/Transações | ⚠️ Filtros ocupam muito espaço |
| Finanças/Orçamentos | ✅ Aceitável |
| Finanças/Recorrentes | ✅ Aceitável |
| Futuro | ✅ Bom |
| Tempo/Semanal | ⚠️ View semanal ilegível |
| Tempo/Mensal | ✅ Não verificado |
| Corpo/Dashboard | ✅ Bom |
| Corpo/Atividades | ⚠️ Título duplicado |
| Mente/Dashboard | ✅ Bom |
| Mente/Timer | ❌ 404 |
| Carreira | ✅ Bom |
| Patrimônio | ✅ Bom |
| Patrimônio/Carteira | ⚠️ KPIs em coluna única |
| Experiências | ✅ Bom |
| Conquistas | ✅ Bom |
| Configurações | ⚠️ Abas cortadas |
