# O que falta implementar para o MVP v1

Resumo com base no [02-MVP-V1.md](02-MVP-V1.md) e no estado atual do código (Fev/2026).

---

## 1. Transações: dados reais (Supabase)

**Situação:** A página de transações usa **mock** (`mockTransactions`). O formulário até chama Supabase no create/update, mas o banco espera `category_id` como **UUID** (FK para `categories`), e o app envia **slug** (ex: `'alimentacao'`), então o insert/update falha.

**Falta:**

- **1.1 Schema / categorias**
  - **Opção A (recomendada para v1):** Adicionar coluna `category_key TEXT` na tabela `transactions` (slug da categoria fixa). Manter `category_id` nullable. No app, usar só `category_key` no v1 (create/update/select e exibição).
  - **Opção B:** Fazer seed de categorias default (por usuário ou globais), mapear slug → UUID no front e enviar `category_id` UUID no insert/update.

- **1.2 Listar transações**
  - Buscar transações do usuário em `transactions` (Supabase), em vez de mock.
  - Refetch após criar, editar e excluir.

- **1.3 Excluir no Supabase**
  - Ao excluir, chamar `supabase.from('transactions').delete().eq('id', id)` e depois refetch (ou remover da lista).

- **1.4 Filtrar por mês**
  - Doc: “Filtrar por mês”. Conectar os filtros de data ao state e filtrar a lista (ou query) por período (ex.: mês/ano do seletor).

---

## 2. Dashboard: dados reais (Supabase)

**Situação:** Dashboard usa **mock** para tudo (cards, gráficos, últimas transações). Só o nome do usuário vem do Supabase (profiles).

**Falta:**

- **2.1 Resumo do mês (cards)**
  - Calcular receitas, despesas e saldo do mês a partir das transações do usuário no Supabase (soma por tipo e período).

- **2.2 Gráfico Receitas vs Despesas**
  - Dados agregados por mês (ex.: últimos 12 meses) a partir de `transactions`, em vez de `mockChartData`.

- **2.3 Gráfico de despesas por categoria**
  - Agregar despesas do mês por categoria (por `category_key` ou `category_id`) a partir do Supabase, em vez de `mockCategoryData`.

- **2.4 Últimas transações**
  - Buscar últimas N transações (ex.: 5 ou 6) do usuário no Supabase, em vez de `mockTransactions`.

- **2.5 Mês selecionado**
  - Garantir que trocar o mês no header altere todos os dados (cards, gráficos, e se aplicável “últimas”) conforme o mês escolhido.

---

## 3. Fluxo do formulário de transação

**Situação:** O form já chama Supabase no create/update, mas:

- Envia `category_id` com slug; o banco espera UUID (ou então passar a usar `category_key` após alteração do schema).
- Após sucesso, a página de transações não refaz a lista (continua mock).

**Falta:**

- Ajustar create/update para o que o banco aceitar: ou `category_key` (slug) ou `category_id` (UUID após seed).
- Na página de transações: após `onSuccess` do form, refetch da lista do Supabase (e fechar o form / limpar edição).

---

## 4. Itens já ok para v1

- Autenticação (cadastro, login, logout, recuperação de senha).
- Perfil (nome, moeda) em Configurações – lido e salvo no Supabase.
- Layout (sidebar, header, responsivo).
- Protótipos e telas: Login, Cadastro, Esqueci senha, Dashboard, Transações, Nova/Editar transação, Configurações.
- Schema base (profiles, transactions, categories, RLS, trigger de profile).
- Form de transação (campos, validação, chamada Supabase) – falta só alinhar categoria e refetch.

Orçamentos e Relatórios continuam “Em breve” e **não** fazem parte do escopo do v1.

---

## 5. Checklist resumido para fechar o v1

| # | Item |
|---|------|
| 1 | Definir e aplicar modelo de categoria no v1: `category_key` em `transactions` OU seed de categorias + uso de `category_id` UUID. |
| 2 | Listar transações a partir do Supabase (e refetch após create/update/delete). |
| 3 | Excluir transação no Supabase e atualizar a lista. |
| 4 | Filtrar transações por mês (e opcionalmente tipo/categoria). |
| 5 | Dashboard: cards do mês (receitas, despesas, saldo) a partir do Supabase. |
| 6 | Dashboard: gráfico Receitas vs Despesas com dados reais (agregados por mês). |
| 7 | Dashboard: gráfico de despesas por categoria com dados reais do mês. |
| 8 | Dashboard: últimas transações vindas do Supabase. |
| 9 | Sincronizar seletor de mês do dashboard com todos os dados (cards + gráficos). |
| 10 | Deploy na Vercel e testes com 5 pessoas (conforme doc de sucesso do v1). |

Depois disso, o v1 está pronto em termos de produto; os critérios de sucesso (performance, feedback, etc.) seguem o [02-MVP-V1.md](02-MVP-V1.md).
