# Análise completa – MVP V1 SyncLife

Documento gerado a partir do [02-MVP-V1.md](02-MVP-V1.md), [07-V1-PENDENCIAS.md](07-V1-PENDENCIAS.md) e validação com **Playwright** (navegador + testes E2E). Objetivo: listar o que falta implementar para **finalizar o MVP V1**.

---

## 1. Validação com Playwright

### 1.1 Navegação manual (MCP Playwright)

| Tela / Fluxo | URL | Resultado |
|--------------|-----|-----------|
| Landing | `/` | OK – Logo, "Entrar", "Criar conta", heading "Sua vida em sincronia..." |
| Login | `/login` | OK – "Bem-vindo de volta", E-mail, Senha, "Esqueceu a senha?", "Criar conta grátis" |
| Cadastro | `/cadastro` | OK – "Criar conta grátis", Nome, E-mail, Senha, Confirmar senha, checkbox Termos, botão desabilitado até aceitar termos |
| Rotas protegidas | `/dashboard` sem login | OK – Redireciona para `/login` |

### 1.2 Testes E2E (auth.spec.ts)

```
16 passed (15.6s)
```

- Landing: logo e links Entrar / Criar conta
- Login: redireciona para /login, erro com credenciais inválidas, links Esqueceu senha e Criar conta, permanece em /login com campos vazios, navegação para Cadastro
- Cadastro: botão habilitado após termos, link para login, erro senha &lt; 6 caracteres, erro senhas não coincidem, botão desabilitado sem termos
- Esqueceu senha: formulário e mensagem de sucesso, link Voltar para login
- Rotas protegidas: /dashboard, /transacoes e /configuracoes redirecionam para /login sem autenticação

**Conclusão:** Fluxos de autenticação e rotas protegidas estão consistentes com o MVP e estáveis para testes automatizados.

---

## 2. Estado atual por módulo

### 2.1 Autenticação e perfil (OK para V1)

| Item | Status | Observação |
|------|--------|------------|
| Cadastro email/senha | OK | Validado em E2E |
| Login email/senha | OK | Validado em E2E |
| Logout | OK | Implementado |
| Recuperação de senha | OK | Validado em E2E |
| Perfil: nome, email, moeda | OK | Configurações leem/salvam no Supabase |
| Layout: sidebar, header, responsivo | OK | Implementado |

### 2.2 Transações (pendências)

| Item | Status | Detalhe |
|------|--------|---------|
| Listar transações | Mock | Lista vem de `mockTransactions`; não busca no Supabase |
| Adicionar transação | Quebrado | Form envia `category_id` com **slug** (ex: `alimentacao`); banco espera **UUID** (FK `categories`) → insert falha |
| Editar transação | Quebrado | Mesmo problema de `category_id` (slug vs UUID); lista continua mock |
| Excluir transação | Só local | Remove apenas do state (mock); **não chama Supabase** |
| Filtrar por mês | Não funcional | Inputs de data são `defaultValue` (não controlados); não há state nem filtro por período |
| Filtros tipo/categoria/busca | OK | Funcionam em cima da lista (mock) |

**Evidência no código:**

- `web/src/app/(app)/transacoes/page.tsx`: `useState(mockTransactions)`, `handleDelete` só faz `setTransactions(prev => prev.filter(...))`.
- `web/src/components/transactions/transaction-form.tsx`: `category_id: categoryId` com `categoryId` = slug (ex: `alimentacao`).
- Schema `web/supabase/schema.sql`: `transactions.category_id UUID REFERENCES categories(id)`.

### 2.3 Dashboard (pendências)

| Item | Status | Detalhe |
|------|--------|---------|
| Cards (Receitas, Despesas, Saldo) | Mock | Valores de `mockChartData` (não calculados do Supabase) |
| Gráfico Receitas vs Despesas | Mock | `ExpenseChart` usa `mockChartData` |
| Gráfico pizza por categoria | Mock | `CategoryChart` usa `mockCategoryData` |
| Últimas transações | Mock | `RecentTransactions` usa `mockTransactions` |
| Seletor de mês | Parcial | Troca `currentDate`, mas **todos os dados continuam mock**; não reflete mês selecionado |
| Gráfico Projeção | Mock/estático | `ProjectionChart` – dados fixos; opcional para V1 |

**Evidência no código:**

- `web/src/app/(app)/dashboard/page.tsx`: `mockChartData`, `mockCategoryData`, `mockTransactions`; `currentMonthData`/`previousMonthData` vêm do mock; seletor de mês não dispara fetch por mês.

### 2.4 Formulário de transação (ajustes necessários)

- **Create/Update:** Ajustar payload para o que o banco aceitar: ou usar **`category_key`** (slug) no schema e no app, ou fazer **seed de categorias** e enviar **`category_id`** (UUID).
- **Após sucesso:** Na página de transações, fazer **refetch** da lista no Supabase e fechar o form / limpar edição.

---

## 3. Schema e categorias (decisão necessária)

**Problema:** App usa categorias fixas por **slug** (`constants/categories.ts`); tabela `transactions` tem `category_id UUID REFERENCES categories(id)` e não existe coluna para slug.

**Opções:**

| Opção | Ação | Prós | Contras |
|-------|------|------|---------|
| **A (recomendada para V1)** | Adicionar `category_key TEXT` em `transactions`; manter `category_id` nullable; no app usar só `category_key` no V1 | Pouca mudança, sem seed, rápido | Duplicação conceitual (key + id) |
| **B** | Seed de categorias (globais ou por usuário); mapear slug → UUID no front e enviar `category_id` | Modelo normalizado | Mais trabalho (migration, seed, mapeamento) |

Recomendação: **Opção A** para fechar o V1 com menos risco e depois evoluir para categorias customizáveis (V2) usando `category_id`.

---

## 4. Checklist para fechar o MVP V1

Com base no [02-MVP-V1.md](02-MVP-V1.md) e [07-V1-PENDENCIAS.md](07-V1-PENDENCIAS.md):

| # | Item | Prioridade | Observação |
|---|------|------------|------------|
| 1 | Definir modelo de categoria: **`category_key`** em `transactions` OU seed + **`category_id`** UUID | Alta | Necessário para create/update funcionarem |
| 2 | **Listar transações** do Supabase (e refetch após create/update/delete) | Alta | Substituir `mockTransactions` por fetch |
| 3 | **Excluir** transação no Supabase e atualizar a lista | Alta | Chamar `delete().eq('id', id)` e refetch |
| 4 | **Filtrar transações por mês** (e opcionalmente tipo/categoria) | Média | Conectar inputs de data ao state e filtrar (ou query por período) |
| 5 | Dashboard: **cards do mês** (receitas, despesas, saldo) a partir do Supabase | Alta | Calcular somas por tipo e mês/ano |
| 6 | Dashboard: **gráfico Receitas vs Despesas** com dados reais (agregados por mês) | Média | Substituir `mockChartData` por agregação de `transactions` |
| 7 | Dashboard: **gráfico pizza** despesas por categoria com dados reais do mês | Média | Substituir `mockCategoryData` por agregação por `category_key`/categoria |
| 8 | Dashboard: **últimas transações** vindas do Supabase | Alta | Query limit 5 (ou 6) ordenado por data |
| 9 | **Seletor de mês** do dashboard alterar todos os dados (cards + gráficos + últimas) | Alta | Passar mês/ano para fetches e recalcular |
| 10 | **Deploy na Vercel** e testes com 5 pessoas | Alta | Conforme [08-DEPLOY-VERCEL.md](08-DEPLOY-VERCEL.md) e critérios de sucesso do MVP |

---

## 5. Definição de “Pronto” (02-MVP-V1) – Status

| Critério | Status |
|----------|--------|
| Usuário consegue se cadastrar e logar | OK (validado com Playwright) |
| Usuário consegue adicionar, editar e excluir transações | Parcial – fluxo de UI existe; create/update falham por categoria; delete não persiste no Supabase |
| Dashboard mostra resumo correto do mês | Não – dados mock |
| Gráfico de pizza funciona | Parcial – componente existe; dados mock |
| Funciona no celular (responsivo) | OK (layout responsivo implementado) |
| Deploy realizado na Vercel | A definir (doc de deploy pronto) |
| 5 pessoas de fora testaram e deram feedback | A fazer |

---

## 6. Resumo executivo

- **Autenticação, perfil, layout e rotas protegidas** estão alinhados ao MVP e **validados** (Playwright + E2E).
- **Transações e Dashboard** ainda dependem de **dados mock**; create/update de transação falham por incompatibilidade **category_id (slug vs UUID)**; delete não persiste; filtro por mês não funcional.
- **Próximos passos críticos:** (1) Adicionar `category_key` (ou seed) e alinhar form + Supabase; (2) Trocar listagem e exclusão de transações para Supabase + refetch; (3) Alimentar dashboard (cards, gráficos, últimas) com dados reais e sincronizar com o seletor de mês; (4) Deploy Vercel e testes com usuários.

Após esses itens, o MVP V1 estará pronto em termos de produto; critérios de sucesso (performance, feedback, etc.) seguem o [02-MVP-V1.md](02-MVP-V1.md).
