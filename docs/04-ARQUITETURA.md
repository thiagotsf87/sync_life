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

> Estrutura real do repositório em 21/02/2026. Itens marcados com `(v2)` ainda não implementados.

```
web/src/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx                # Layout raiz
│   ├── 📄 page.tsx                  # Landing page (/)
│   ├── 📄 globals.css               # Estilos globais
│   │
│   ├── 📁 (auth)/                   # Grupo de rotas de auth
│   │   ├── 📁 login/page.tsx
│   │   ├── 📁 cadastro/page.tsx
│   │   └── 📁 recuperar-senha/page.tsx
│   │
│   └── 📁 (app)/                    # Grupo de rotas protegidas
│       ├── 📄 layout.tsx            # Layout com sidebar + app-shell
│       ├── 📁 dashboard/page.tsx    # Dashboard com dados reais do Supabase
│       ├── 📁 transacoes/page.tsx   # Lista, CRUD, filtros, paginação
│       └── 📁 configuracoes/page.tsx # Perfil + gerenciador de categorias
│
├── 📁 components/
│   ├── 📁 ui/                       # shadcn/ui (button, input, label, dialog,
│   │                                #   checkbox, sheet, sonner)
│   ├── 📁 layout/
│   │   ├── 📄 app-shell.tsx         # Wrapper com sidebar + conteúdo
│   │   ├── 📄 sidebar.tsx           # Sidebar fixa, expansível
│   │   ├── 📄 header.tsx            # Header com seletor de mês e ações
│   │   └── 📄 mobile-nav.tsx        # Navegação inferior mobile
│   ├── 📁 dashboard/
│   │   ├── 📄 summary-cards.tsx     # Cards Receitas / Despesas / Saldo
│   │   ├── 📄 expense-chart.tsx     # Gráfico Receitas vs Despesas (12 meses)
│   │   ├── 📄 category-chart.tsx    # Gráfico donut por categoria
│   │   ├── 📄 projection-chart.tsx  # Projeção de despesas (estático)
│   │   └── 📄 recent-transactions.tsx # Últimas 6 transações
│   ├── 📁 transactions/
│   │   └── 📄 transaction-form.tsx  # Form create/edit com modal de confirmação
│   ├── 📁 settings/
│   │   └── 📄 category-manager.tsx  # CRUD de categorias custom
│   └── 📁 shared/
│       └── 📄 logo.tsx
│
├── 📁 hooks/
│   └── 📄 use-user-categories.ts    # Busca categorias custom do Supabase
│
├── 📁 lib/
│   ├── 📁 supabase/
│   │   ├── 📄 client.ts             # Cliente browser (createClient)
│   │   └── 📄 middleware.ts         # Auth middleware (proteção de rotas)
│   └── 📄 format.ts                 # formatCurrency, formatDate, formatMonthYear
│
└── 📁 constants/
    └── 📄 categories.ts             # DefaultCategory[], CustomCategory,
                                     # EXPENSE_CATEGORIES, INCOME_CATEGORIES,
                                     # ALL_CATEGORIES, getCategoryById,
                                     # isUUID, resolveCategory
```

---

## 4. Modelo de Dados

### 4.1 Diagrama ER

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│   profiles   │     │  categories  │     │   transactions    │
├──────────────┤     ├──────────────┤     ├───────────────────┤
│ id (PK, FK)  │◄────│ user_id (FK) │     │ id (PK)           │
│ full_name    │     │ id (PK)      │◄────│ category_id (FK?) │ nullable
│ avatar_url   │     │ name         │     │ category_key TEXT │ slug ou UUID
│ currency     │     │ icon         │     │ user_id (FK)      │────►┐
│ theme        │     │ color        │     │ amount            │     │
│ created_at   │     │ type         │     │ type              │     │
│ updated_at   │     │ is_default   │     │ description       │     │
└──────────────┘     │ sort_order   │     │ date              │     │
       ▲             │ created_at   │     │ created_at        │     │
       │             └──────────────┘     │ updated_at        │     │
       │                                  └───────────────────┘     │
       └──────────────────────────────────────────────────────────┘

┌──────────────┐
│   budgets    │  (MVP v2)
├──────────────┤
│ id (PK)      │
│ user_id (FK) │
│ category_id  │
│ amount       │
│ month / year │
│ created_at   │
└──────────────┘
```

**Nota sobre `category_key`:** campo TEXT adicionado em fevereiro/2026 (Opção A). Armazena o slug para categorias default (ex: `'alimentacao'`) ou o UUID para categorias custom criadas pelo usuário. `category_id` permanece nullable para compatibilidade futura.

### 4.2 SQL Completo

> Schema real em produção. Arquivo fonte: `web/supabase/schema.sql`.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    mode TEXT DEFAULT 'focus' CHECK (mode IN ('focus', 'journey')),
    currency TEXT DEFAULT 'BRL',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorias (defaults readonly + custom por usuário)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#6B7280',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT FALSE,   -- FALSE = categoria custom do usuário
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,  -- nullable (legado)
    category_key TEXT,  -- slug (ex: 'alimentacao') ou UUID de categoria custom
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orçamentos (MVP v2)
CREATE TABLE IF NOT EXISTS budgets (
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM auth.users u WHERE u.id = profiles.id));
CREATE POLICY "Users can manage own categories"   ON categories   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets"      ON budgets      FOR ALL USING (auth.uid() = user_id);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: criar profile após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
