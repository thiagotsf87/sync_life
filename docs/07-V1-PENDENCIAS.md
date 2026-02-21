# O que falta implementar para o MVP v1

Resumo com base no [02-MVP-V1.md](02-MVP-V1.md) e no estado atual do código (Fev/2026).

---

## Status geral (atualizado em 21/02/2026)

Todos os itens críticos do MVP V1 foram implementados. O único pendente para encerrar o v1 é o **deploy na Vercel**.

---

## 1. Transações: dados reais (Supabase) ✅

| Item | Status |
|------|--------|
| Schema `category_key TEXT` em `transactions` | **Concluído** – Opção A implementada |
| Listar transações do Supabase | **Concluído** – fetch real com refetch após CRUD |
| Adicionar transação | **Concluído** – salva `category_key` (slug ou UUID custom) |
| Editar transação | **Concluído** – atualiza no Supabase com refetch |
| Excluir transação | **Concluído** – `delete().eq('id', id)` + refetch |
| Filtrar por mês | **Concluído** – inputs controlados com state; filtro lexicográfico por `date` |
| Filtros tipo/categoria/busca | **Concluído** – dropdown de categoria (padrões + custom), chips de tipo |
| Categoria no modal de exclusão | **Concluído** – exibe ícone + nome resolvido |
| Paginação | **Concluído** – 10 itens/página |

---

## 2. Dashboard: dados reais (Supabase) ✅

| Item | Status |
|------|--------|
| Cards (Receitas, Despesas, Saldo) | **Concluído** – calculados do Supabase por mês |
| Gráfico Receitas vs Despesas | **Concluído** – últimos 12 meses, dados reais |
| Gráfico pizza por categoria | **Concluído** – despesas do mês por `category_key` |
| Últimas transações | **Concluído** – 6 mais recentes do Supabase |
| Seletor de mês | **Concluído** – altera todos os dados (cards + gráficos + últimas) |
| Atualização automática | **Concluído** – evento `transaction:changed` + `visibilitychange` |

---

## 3. Formulário de transação ✅

| Item | Status |
|------|--------|
| Salvar `category_key` | **Concluído** – slug para defaults, UUID para custom |
| Categorias custom no seletor | **Concluído** – mescladas com as defaults no grid |
| Categoria no modal de confirmação de edição | **Concluído** – exibe ícone + nome |
| Refetch após sucesso | **Concluído** – `onSuccess` + `router.refresh()` |

---

## 4. Gerenciamento de categorias (novo – Fev/2026) ✅

Funcionalidade adicionada além do escopo original do MVP V1:

| Item | Status |
|------|--------|
| Listar defaults (readonly, badge "Padrão") | **Concluído** |
| Criar categoria custom (nome, tipo, ícone, cor) | **Concluído** |
| Editar categoria custom | **Concluído** |
| Excluir com verificação de uso em transações | **Concluído** – aviso se há transações vinculadas |
| Tabs Despesas / Receitas | **Concluído** |
| Resolução unificada: slug (default) ou UUID (custom) | **Concluído** – `resolveCategory()` |

---

## 5. Itens já ok para v1

- Autenticação (cadastro, login, logout, recuperação de senha) – validado com Playwright E2E.
- Perfil (nome, moeda) em Configurações – lido e salvo no Supabase.
- Layout (sidebar, header, responsivo).
- Schema base com `category_key` em `transactions` + tabela `categories` com RLS.
- Form de transação completo com validação.
- Gerenciamento de categorias custom em Configurações.

---

## 6. Checklist para fechar o v1

| # | Item | Status |
|---|------|--------|
| 1 | `category_key` em `transactions` + form alinhado | ✅ Concluído |
| 2 | Listar transações do Supabase + refetch | ✅ Concluído |
| 3 | Excluir transação no Supabase | ✅ Concluído |
| 4 | Filtrar transações por mês e categoria | ✅ Concluído |
| 5 | Dashboard: cards com dados reais | ✅ Concluído |
| 6 | Dashboard: gráfico Receitas vs Despesas real | ✅ Concluído |
| 7 | Dashboard: gráfico pizza por categoria real | ✅ Concluído |
| 8 | Dashboard: últimas transações do Supabase | ✅ Concluído |
| 9 | Seletor de mês sincroniza todos os dados | ✅ Concluído |
| 10 | **Deploy na Vercel + testes com 5 pessoas** | ⏳ Pendente |

Após o deploy, o v1 estará pronto. Critérios de sucesso seguem o [02-MVP-V1.md](02-MVP-V1.md).
