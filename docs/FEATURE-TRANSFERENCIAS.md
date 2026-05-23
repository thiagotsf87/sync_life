# Feature: Transferências entre Contas

## Resumo
Transferências entre contas próprias (ex: Nubank → Inter, Conta Corrente → Poupança) são **movimentações neutras** — o dinheiro não sai do patrimônio do usuário, apenas troca de lugar. Hoje o SyncLife não tem conceito de "conta bancária", então transferências eram salvas como despesa, inflando os indicadores.

## Problema
- Usuário faz Pix de R$ 2.000 do Nubank para o Inter
- Isso era registrado como despesa de R$ 2.000
- Todos os KPIs ficavam distorcidos: despesa inflada, saldo errado, taxa de poupança baixa

## Solução

### 1. Sistema de Contas Bancárias (NOVO)

#### Tabela `user_accounts`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → profiles |
| `name` | text | Nome da conta (ex: "Nubank", "Inter Checking") |
| `bank` | text | Nome do banco (ex: "Nubank", "Inter") |
| `type` | enum | `checking` \| `savings` \| `investment` \| `wallet` |
| `icon` | text | Emoji (ex: 🟣 para Nubank) |
| `color` | text | Hex cor (ex: #820AD1 para Nubank) |
| `is_active` | boolean | Se a conta está ativa |
| `sort_order` | int | Ordem de exibição |
| `created_at` | timestamp | Data de criação |

#### Bancos pré-configurados (sugestões rápidas)
| Banco | Ícone | Cor |
|-------|-------|-----|
| Nubank | 🟣 | #820AD1 |
| Inter | 🟠 | #FF7A00 |
| Itaú | 🟠 | #EC7000 |
| Bradesco | 🔴 | #CC092F |
| Banco do Brasil | 🟡 | #FFED00 |
| Caixa | 🔵 | #005CA9 |
| Santander | 🔴 | #CC0000 |
| C6 Bank | ⚫ | #242424 |
| BTG | 🔵 | #1C3D73 |
| PicPay | 🟢 | #21C25E |
| Mercado Pago | 🔵 | #009EE3 |
| Carteira (cash) | 💵 | #10b981 |

#### Onde gerenciar contas
- **Configurações > Contas Bancárias** — CRUD completo
- **Inline no modal de transferência** — botão "+ Nova conta" para criar rápido

### 2. Modal de Transação — Modo Transfer

Quando o usuário seleciona "Transferência", o formulário **muda completamente**:

#### Campos que APARECEM (específicos de transfer):
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Conta de Origem | Dropdown de `user_accounts` | Sim |
| Conta de Destino | Dropdown de `user_accounts` | Sim |
| Valor | Input monetário (R$) | Sim |
| Data | Date picker | Sim |
| Observações | Textarea | Não |

#### Campos que SOMEM (irrelevantes para transfer):
- ~~Categoria~~ (transfer não tem categoria)
- ~~Método de pagamento~~ (a transfer É o método)

#### Validações:
- Conta origem ≠ Conta destino
- Valor > 0
- Ambas as contas obrigatórias

#### Descrição auto-gerada:
```
{conta_origem.name} → {conta_destino.name}
```
Ex: "Nubank → Inter"

### 3. Campos na tabela `transactions`

Adicionar 2 colunas opcionais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `account_from_id` | UUID \| null | FK → user_accounts (conta origem) |
| `account_to_id` | UUID \| null | FK → user_accounts (conta destino) |

Preenchidos **apenas quando `type = 'transfer'`**. Para income/expense continuam null.

### 4. Exibição na Lista de Transações

```
🔄  Nubank → Inter          15/03    Pix    R$ 2.000,00     [azul #0055ff]
    [🟣 Nubank]  →  [🟠 Inter]                              badges com cores dos bancos
```

- Cor do valor: azul `#0055ff` (neutro)
- Sem sinal +/- (não é receita nem despesa)
- Badges com ícone/cor de cada conta

### 5. Impacto nos Cálculos

| Indicador | Impacto da transfer |
|-----------|-------------------|
| Total Receitas | **Ignora** (não é receita) |
| Total Despesas | **Ignora** (não é despesa) |
| Saldo mensal | **Ignora** (neutro) |
| Taxa de poupança | **Ignora** |
| Orçamentos | **Ignora** (sem categoria) |
| Life Sync Score | **Ignora** |
| Calendário | Dot azul `#0055ff` |
| Relatórios | Aparece como "Transferência" no CSV |

### 6. Fluxo do Usuário

```
1. Abre modal "Nova Transação"
2. Clica em "🔄 Transfer."
3. Form muda — aparece:
   ┌────────────────────────────────┐
   │ CONTA DE ORIGEM               │
   │ [🟣 Nubank              ▼]   │
   │                               │
   │ CONTA DE DESTINO              │
   │ [🟠 Inter               ▼]   │
   │                               │
   │ VALOR                         │
   │ [R$  2.000,00            ]    │
   │                               │
   │ DATA                          │
   │ [15/03/2026              ]    │
   │                               │
   │ OBSERVAÇÕES (OPCIONAL)        │
   │ [Reserva de emergência   ]    │
   │                               │
   │ [Cancelar]  [Transferir]      │
   └────────────────────────────────┘
4. Salva → cria transaction com:
   - type: 'transfer'
   - description: 'Nubank → Inter'
   - account_from_id: uuid_nubank
   - account_to_id: uuid_inter
   - amount: 2000
   - category_id: null
```

### 7. Página de Configurações — Contas Bancárias

Nova sub-rota: `/configuracoes/contas`

```
┌─────────────────────────────────────────────────┐
│ 🏦 Contas Bancárias                [+ Nova]     │
├─────────────────────────────────────────────────┤
│ 🟣 Nubank          Conta Corrente    [⚙️] [🗑️] │
│ 🟠 Inter           Conta Corrente    [⚙️] [🗑️] │
│ 🟡 Banco do Brasil Poupança          [⚙️] [🗑️] │
│ 💵 Carteira        Carteira          [⚙️] [🗑️] │
├─────────────────────────────────────────────────┤
│ Sugestões rápidas:                              │
│ [Nubank] [Inter] [Itaú] [Bradesco] [C6] [BTG]  │
└─────────────────────────────────────────────────┘
```

### 8. Escopo MVP vs. Futuro

| Feature | MVP (agora) | Futuro |
|---------|-------------|--------|
| CRUD de contas | ✅ | |
| Transfer com conta origem/destino | ✅ | |
| Sugestões rápidas de bancos | ✅ | |
| Saldo por conta | ❌ | ✅ Calcular automaticamente |
| Reconciliação bancária | ❌ | ✅ |
| Importar extrato por conta | ❌ | ✅ |
| Multi-moeda | ❌ | ✅ |

### 9. Arquivos a criar/modificar

#### Novos:
- `supabase/migrations/025_user_accounts.sql` — tabela + account columns em transactions
- `hooks/use-accounts.ts` — CRUD de contas
- `app/(app)/configuracoes/contas/page.tsx` — gerenciamento de contas
- `components/financas/AccountSelector.tsx` — dropdown de conta com ícone/cor

#### Modificar:
- `components/financas/TransacaoModal.tsx` — form condicional para transfer
- `components/financas/QuickEntryFAB.tsx` — account selectors para transfer
- `app/(app)/financas/transacoes/page.tsx` — badges de conta na lista
- `hooks/use-transactions.ts` — incluir account_from/account_to no tipo
- `types/database.ts` — atualizar Transaction type
- `lib/modules.ts` — adicionar nav item "Contas" em configurações
