# 04 - Arquitetura Técnica

## 1. Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO                                 │
│              (Browser / PWA instalado)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL                                 │
│                   (Hosting CDN)                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   NEXT.JS 14+                         │ │
│  │              (App Router + SSR)                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │ │
│  │  │    Pages    │  │    API      │  │   Static     │  │ │
│  │  │  (React)    │  │   Routes    │  │   Assets     │  │ │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │     Auth     │  │  PostgreSQL  │  │    Storage      │   │
│  │   (GoTrue)   │  │   Database   │  │   (Arquivos)    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Realtime   │  │   Edge       │                        │
│  │  (Websocket) │  │  Functions   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14+ | Framework React com SSR |
| React | 18+ | Biblioteca UI |
| TypeScript | 5+ | Tipagem estática |
| TailwindCSS | 3+ | Estilização utility-first |
| shadcn/ui | latest | Componentes base |
| Recharts | 2+ | Gráficos |
| React Hook Form | 7+ | Formulários |
| Zod | 3+ | Validação de schemas |
| Lucide React | latest | Ícones |
| Framer Motion | 10+ | Animações (MVP v2) |

### 2.2 Backend / Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| Supabase | Auth, Database, Storage |
| PostgreSQL | Banco de dados (via Supabase) |
| Vercel | Hosting e deploy |

### 2.3 Ferramentas de Desenvolvimento

| Ferramenta | Uso |
|------------|-----|
| pnpm | Gerenciador de pacotes |
| ESLint | Linting |
| Prettier | Formatação |
| Git | Controle de versão |
| GitHub | Repositório |

---

## 3. Estrutura de Pastas

```
sync_life/
├── 📁 src/
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📄 layout.tsx            # Layout raiz
│   │   ├── 📄 page.tsx              # Landing page (/)
│   │   ├── 📄 globals.css           # Estilos globais
│   │   │
│   │   ├── 📁 (auth)/               # Grupo de rotas de auth
│   │   │   ├── 📁 login/
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 cadastro/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 recuperar-senha/
│   │   │       └── 📄 page.tsx
│   │   │
│   │   └── 📁 (app)/                # Grupo de rotas protegidas
│   │       ├── 📄 layout.tsx        # Layout com sidebar
│   │       ├── 📁 dashboard/
│   │       │   └── 📄 page.tsx
│   │       ├── 📁 transacoes/
│   │       │   ├── 📄 page.tsx      # Lista
│   │       │   └── 📁 [id]/
│   │       │       └── 📄 page.tsx  # Editar
│   │       ├── 📁 orcamentos/       # MVP v2
│   │       │   └── 📄 page.tsx
│   │       ├── 📁 relatorios/       # MVP v2
│   │       │   └── 📄 page.tsx
│   │       └── 📁 configuracoes/
│   │           └── 📄 page.tsx
│   │
│   ├── 📁 components/
│   │   ├── 📁 ui/                   # shadcn/ui (auto-gerado)
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   └── ...
│   │   ├── 📁 layout/
│   │   │   ├── 📄 sidebar.tsx
│   │   │   ├── 📄 header.tsx
│   │   │   └── 📄 mobile-nav.tsx
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 summary-cards.tsx
│   │   │   ├── 📄 expense-chart.tsx
│   │   │   └── 📄 recent-transactions.tsx
│   │   ├── 📁 transactions/
│   │   │   ├── 📄 transaction-list.tsx
│   │   │   ├── 📄 transaction-form.tsx
│   │   │   └── 📄 transaction-filters.tsx
│   │   └── 📁 shared/
│   │       ├── 📄 loading.tsx
│   │       ├── 📄 empty-state.tsx
│   │       └── 📄 error-boundary.tsx
│   │
│   ├── 📁 lib/
│   │   ├── 📄 supabase/
│   │   │   ├── 📄 client.ts         # Cliente browser
│   │   │   ├── 📄 server.ts         # Cliente server
│   │   │   └── 📄 middleware.ts     # Auth middleware
│   │   ├── 📄 utils.ts              # Funções utilitárias
│   │   └── 📄 format.ts             # Formatação (moeda, data)
│   │
│   ├── 📁 hooks/
│   │   ├── 📄 use-transactions.ts
│   │   ├── 📄 use-categories.ts
│   │   ├── 📄 use-user.ts
│   │   └── 📄 use-media-query.ts
│   │
│   ├── 📁 types/
│   │   ├── 📄 database.ts           # Tipos do Supabase
│   │   ├── 📄 transaction.ts
│   │   └── 📄 user.ts
│   │
│   ├── 📁 constants/
│   │   ├── 📄 categories.ts         # Categorias padrão
│   │   └── 📄 routes.ts             # Rotas da aplicação
│   │
│   └── 📁 validators/
│       ├── 📄 transaction.ts        # Schema Zod
│       └── 📄 user.ts
│
├── 📁 public/
│   ├── 📄 manifest.json             # PWA manifest (v2)
│   ├── 📁 icons/                    # Ícones PWA
│   └── 📄 favicon.ico
│
├── 📁 docs/                         # Documentação
│   └── ...
│
├── 📄 .env.local                    # Variáveis de ambiente
├── 📄 .env.example                  # Exemplo de variáveis
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
├── 📄 package.json
└── 📄 README.md
```

---

## 4. Modelo de Dados

### 4.1 Diagrama ER

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │  categories  │     │ transactions │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK, FK)  │◄────│ user_id (FK) │     │ id (PK)      │
│ full_name    │     │ id (PK)      │◄────│ category_id  │
│ avatar_url   │     │ name         │     │ user_id (FK) │────►┐
│ mode         │     │ icon         │     │ amount       │     │
│ currency     │     │ color        │     │ type         │     │
│ theme        │     │ type         │     │ description  │     │
│ created_at   │     │ is_default   │     │ date         │     │
│ updated_at   │     │ created_at   │     │ created_at   │     │
└──────────────┘     └──────────────┘     │ updated_at   │     │
       ▲                                   └──────────────┘     │
       │                                                        │
       └────────────────────────────────────────────────────────┘

┌──────────────┐     ┌────────────────────┐
│   budgets    │     │ recurring_trans... │  (MVP v2)
├──────────────┤     ├────────────────────┤
│ id (PK)      │     │ id (PK)            │
│ user_id (FK) │     │ user_id (FK)       │
│ category_id  │     │ category_id (FK)   │
│ amount       │     │ amount             │
│ month        │     │ type               │
│ year         │     │ frequency          │
│ created_at   │     │ start_date         │
└──────────────┘     │ end_date           │
                     │ is_active          │
                     └────────────────────┘
```

### 4.2 SQL Completo

```sql
-- =============================================
-- TABELAS PRINCIPAIS (MVP v1)
-- =============================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extensão do auth.users do Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    mode TEXT DEFAULT 'focus' CHECK (mode IN ('focus', 'journey')),
    currency TEXT DEFAULT 'BRL',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#6B7280',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orçamentos
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);

-- =============================================
-- TABELAS MVP v2
-- =============================================

-- Transações recorrentes
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    last_generated DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de notificação
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    budget_alert BOOLEAN DEFAULT TRUE,
    daily_reminder BOOLEAN DEFAULT FALSE,
    daily_reminder_time TIME DEFAULT '20:00',
    weekly_review BOOLEAN DEFAULT TRUE,
    achievements BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life Sync Score histórico
CREATE TABLE life_sync_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    budget_component INTEGER CHECK (budget_component BETWEEN 0 AND 100),
    consistency_component INTEGER CHECK (consistency_component BETWEEN 0 AND 100),
    trend_component INTEGER CHECK (trend_component BETWEEN 0 AND 100),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_life_sync_scores_user ON life_sync_scores(user_id, calculated_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_sync_scores ENABLE ROW LEVEL SECURITY;

-- Policies: usuários só veem seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recurring" ON recurring_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notification_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scores" ON life_sync_scores FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. Variáveis de Ambiente

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SyncLife

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## 6. Decisões Arquiteturais

### 6.1 Por que Next.js App Router?

| Critério | Decisão |
|----------|---------|
| SSR/SSG | Melhor SEO e performance inicial |
| Rotas | File-based routing simples |
| API Routes | Backend leve sem servidor separado |
| React Server Components | Menos JS no cliente |
| Ecossistema | Integração perfeita com Vercel |

### 6.2 Por que Supabase?

| Critério | Decisão |
|----------|---------|
| Auth | Pronto, seguro, múltiplos providers |
| Database | PostgreSQL gerenciado |
| Realtime | Websockets inclusos |
| Free tier | Generoso para MVP |
| Solo dev | Menos infra para gerenciar |

### 6.3 Por que shadcn/ui?

| Critério | Decisão |
|----------|---------|
| Não é dependência | Código fica no projeto |
| Customizável | Tailwind nativo |
| Acessível | ARIA compliant |
| Bonito | Design moderno |
| Copy-paste | Só instala o que usa |

---

## 7. Segurança

### 7.1 Medidas Implementadas

- [x] HTTPS obrigatório (Vercel)
- [x] Row Level Security (RLS) no Supabase
- [x] Tokens JWT com expiração
- [x] Sanitização de inputs (Zod)
- [x] CORS configurado
- [x] Headers de segurança (Next.js)

### 7.2 Dados Sensíveis

| Dado | Tratamento |
|------|------------|
| Senhas | Hash no Supabase Auth (bcrypt) |
| Emails | Armazenados, não expostos publicamente |
| Dados financeiros | RLS garante isolamento por usuário |
| Tokens | HttpOnly cookies, não localStorage |

---

## 8. Performance

### 8.1 Metas

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.5s | Lighthouse |

### 8.2 Estratégias

- Server Components para dados estáticos
- Lazy loading de componentes pesados
- Image optimization (next/image)
- Edge caching na Vercel
- Índices no banco de dados
- Paginação de listas longas

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0*
