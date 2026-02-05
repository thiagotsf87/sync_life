# 02 - MVP v1 (Validação)

## 1. Objetivo

Criar a **versão mínima funcional** do SyncLife para:
- ✅ Validar layout e design
- ✅ Validar usabilidade
- ✅ Testar com usuários reais
- ✅ Coletar feedback antes de investir em features avançadas

**Pergunta que queremos responder**: *"Pessoas usam e voltam a um app web para registrar gastos?"*

---

## 2. Prazo Estimado

| Fase | Duração |
|------|---------|
| Protótipos HTML | 1-2 dias |
| Desenvolvimento | 2-3 semanas |
| Testes com usuários | 1-2 semanas |
| **Total** | **4-6 semanas** |

---

## 3. Escopo do MVP v1

### 3.1 Core (Infraestrutura)

#### Autenticação
- [x] Cadastro com email/senha
- [x] Login com email/senha
- [x] Logout
- [x] Recuperação de senha (email)

#### Perfil do Usuário
- [x] Nome
- [x] Email (não editável)
- [x] Preferência de moeda (BRL padrão)

#### Layout Base
- [x] Sidebar com navegação
- [x] Header com avatar/menu
- [x] Responsivo (mobile/desktop)
- [x] Tema claro (dark mode no v2)

### 3.2 Módulo Finanças (Básico)

#### Transações
- [x] Listar transações
- [x] Adicionar transação (despesa ou receita)
  - Valor
  - Categoria (lista fixa)
  - Data
  - Descrição (opcional)
- [x] Editar transação
- [x] Excluir transação
- [x] Filtrar por mês

#### Categorias (Fixas - Sem Customização)

**Despesas:**
- 🏠 Moradia
- 🍔 Alimentação
- 🚗 Transporte
- 💡 Contas
- 🏥 Saúde
- 🎓 Educação
- 🎮 Lazer
- 👔 Vestuário
- 📦 Outros

**Receitas:**
- 💼 Salário
- 💰 Freelance/Extra
- 📈 Investimentos
- 📦 Outros

#### Dashboard
- [x] Card: Total de Receitas do mês
- [x] Card: Total de Despesas do mês
- [x] Card: Saldo do mês
- [x] Gráfico: Pizza de despesas por categoria
- [x] Lista: Últimas 5 transações

---

## 4. O que NÃO está no MVP v1

| Feature | Motivo da Exclusão | Vai para |
|---------|-------------------|----------|
| PWA/Offline | Complexidade extra | MVP v2 |
| Sistema de orçamentos | Nice to have | MVP v2 |
| Múltiplos gráficos | Demora para fazer | MVP v2 |
| Modo Foco vs Jornada | Complexidade de UX | MVP v2 |
| Life Sync Score | Prematura | MVP v2 |
| Relatórios/Export | Nice to have | MVP v2 |
| Notificações/Alertas | Infra extra | MVP v2 |
| Categorias personalizadas | Nice to have | MVP v2 |
| Dark mode | Nice to have | MVP v2 |
| Transações recorrentes | Complexidade | MVP v2 |
| Anexar comprovantes | Storage extra | Futuro |
| Integração com bancos | Complexidade alta | Futuro |

---

## 5. Telas do MVP v1

### 5.1 Telas de Autenticação
1. **Login** - Email + Senha + Link para cadastro
2. **Cadastro** - Nome + Email + Senha + Confirmação
3. **Esqueci Senha** - Email para recuperação

### 5.2 Telas da Aplicação
1. **Dashboard** - Visão geral financeira
2. **Transações** - Lista com filtros
3. **Nova Transação** - Formulário (modal ou página)
4. **Editar Transação** - Mesmo formulário preenchido
5. **Perfil/Configurações** - Dados do usuário

### 5.3 Wireframe Conceitual

```
┌──────────────────────────────────────────────────────────────┐
│  🔄 SyncLife                              [👤 Thiago ▼]      │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  📊        │   Fevereiro 2026                    [< >]      │
│  Dashboard │   ┌──────────┬──────────┬──────────┐           │
│  ─────────│   │ Receitas │ Despesas │  Saldo   │           │
│  💰        │   │ R$ 5.000 │ R$ 3.200 │ R$ 1.800 │           │
│  Transações│   │    ↑12%  │    ↓5%   │    ↑23%  │           │
│            │   └──────────┴──────────┴──────────┘           │
│  ─────────│                                                 │
│  ⚙️        │   ┌─────────────────┬──────────────────────┐   │
│  Config    │   │                 │ Últimas Transações   │   │
│            │   │   [Gráfico      │ ─────────────────── │   │
│            │   │    Pizza]       │ • Mercado    -R$234 │   │
│            │   │                 │ • Salário  +R$5.000 │   │
│            │   │                 │ • Uber       -R$45  │   │
│            │   └─────────────────┴──────────────────────┘   │
│            │                                                 │
│            │   [+ Nova Transação]                           │
└────────────┴─────────────────────────────────────────────────┘
```

---

## 6. Stack Técnica (MVP v1)

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR, rotas simples, ótimo DX |
| Styling | TailwindCSS | Rápido, responsivo |
| Componentes | shadcn/ui | Bonitos, acessíveis, customizáveis |
| Gráficos | Recharts | Simples, React nativo |
| Forms | React Hook Form + Zod | Validação tipada |
| Backend | Supabase | Auth + DB prontos, free tier |
| Deploy | Vercel | Integração Next.js, free tier |

---

## 7. Critérios de Sucesso do MVP v1

| Critério | Meta | Como Medir |
|----------|------|------------|
| Funciona sem bugs críticos | 0 bugs bloqueantes | Testes manuais |
| Carrega em < 3s | LCP < 3s | Lighthouse |
| Mobile funcional | Score > 90 | Lighthouse mobile |
| Usuários de teste | 5-10 pessoas | Convites manuais |
| Feedback coletado | 5+ respostas | Formulário/Entrevista |
| Taxa de erro | < 1% | Logs Supabase |

---

## 8. Definição de "Pronto"

O MVP v1 está pronto quando:

- [ ] Usuário consegue se cadastrar e logar
- [ ] Usuário consegue adicionar, editar e excluir transações
- [ ] Dashboard mostra resumo correto do mês
- [ ] Gráfico de pizza funciona
- [ ] Funciona no celular (responsivo)
- [ ] Deploy realizado na Vercel
- [ ] 5 pessoas de fora testaram e deram feedback

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0*
