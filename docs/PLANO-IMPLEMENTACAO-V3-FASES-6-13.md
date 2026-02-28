# Plano de Implementação — MVP V3 (Fases 6–13)

> **Branch de trabalho:** `mvp-v3`
> **Base:** `main` (MVP V2 completo — Fases 1–5)
> **Data:** Fevereiro 2026
> **Estimativa:** 16–20 semanas

---

## CONTEXTO: O QUE JÁ EXISTE (MVP V2)

### Módulos implementados
- `💰 Finanças` → `/financas` (dashboard, transações, orçamentos, recorrentes, planejamento, calendário, relatórios)
- `🎯 Metas` → `/metas` (lista, wizard, detalhe) — **será migrado para `/futuro` no V3**
- `📅 Agenda` → `/agenda` (semana, mensal, foco) — **será renomeado para `/tempo` no V3**
- `🏠 Dashboard` → `/dashboard`
- `🏆 Conquistas` → `/conquistas` (badges, ranking)
- `⚙️ Configurações` → `/configuracoes`

### Stack e convenções (OBRIGATÓRIO seguir)
- **Framework:** Next.js 16 (App Router), TypeScript strict
- **UI:** TailwindCSS v4 + shadcn/ui (new-york)
- **Supabase:** `createClient()` de `@/lib/supabase/client` (client) ou `@/lib/supabase/server` (server)
- **Estado global:** Zustand (`web/src/stores/shell-store.ts`)
- **Módulos:** configurados em `web/src/lib/modules.ts`
- **Shell:** `ModuleBar` (58px) + `Sidebar` (220px) + `TopHeader` (54px)
- **Tokens de cor:** sempre usar `var(--sl-bg)`, `var(--sl-s1/s2/s3)`, `var(--sl-t1/t2/t3)`
- **Fontes:** `font-[Syne]` (títulos), `font-[DM_Mono]` (valores $/%),  Outfit (body)
- **Cast Supabase:** usar `as any` para contornar tipos — schema não gerado automaticamente
- **Promise.all:** NÃO usar `as const` — ver padrão em MEMORY.md
- **Math.random():** NUNCA fora de useEffect/useState (causa erro de hidratação SSR)

### Arquivos chave para referência
```
web/src/app/(app)/layout.tsx              ← AppShell wrapper
web/src/components/shell/AppShell.tsx     ← Shell client component
web/src/components/shell/Sidebar.tsx      ← nav sidebar
web/src/stores/shell-store.ts             ← Zustand store (mode, theme)
web/src/lib/modules.ts                    ← MODULES config (navItems por módulo)
web/src/types/shell.ts                    ← AppMode, AppTheme, ModuleId types
web/src/app/globals.css                   ← tokens de cor + animações
web/supabase/migrations/                  ← migrations existentes (001 a 004)
```

---

## FASE 6 — Infraestrutura V3 (2 semanas)

> **Objetivo:** Preparar banco, navegação e stack de IA para os 6 novos módulos.
> Pode iniciar imediatamente — não precisa aguardar métricas de validação do V2.

### 6.1 — Migration SQL (arquivo: `005_fase6_infra_v3.sql`)

Criar em `web/supabase/migrations/005_fase6_infra_v3.sql` com todas as tabelas dos novos módulos:

```sql
-- ============================================================
-- MÓDULO FUTURO (substitui goals do v2)
-- ============================================================
CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    category TEXT NOT NULL CHECK (category IN (
        'financial','health','professional','educational',
        'experience','personal','other'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
    target_date DATE,
    target_date_reason TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
    completed_at TIMESTAMP,
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE objective_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    target_module TEXT NOT NULL CHECK (target_module IN (
        'financas','tempo','corpo','mente','patrimonio','carreira','experiencias'
    )),
    indicator_type TEXT NOT NULL CHECK (indicator_type IN (
        'monetary','weight','task','frequency','percentage','quantity','linked'
    )),
    target_value DECIMAL(15,2),
    current_value DECIMAL(15,2) DEFAULT 0,
    initial_value DECIMAL(15,2),
    target_unit TEXT,
    linked_entity_type TEXT,
    linked_entity_id UUID,
    weight DECIMAL(3,1) DEFAULT 1.0 CHECK (weight BETWEEN 0.5 AND 3.0),
    frequency_period TEXT CHECK (frequency_period IN ('daily','weekly','monthly')),
    frequency_target INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
    progress DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP,
    last_progress_update TIMESTAMP,
    auto_sync BOOLEAN DEFAULT TRUE,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE objective_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES objective_goals(id),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'created','goal_added','goal_completed','goal_removed',
        'progress_50','progress_75','progress_90',
        'objective_completed','objective_edited',
        'objective_paused','objective_resumed'
    )),
    description TEXT NOT NULL,
    progress_snapshot DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO CORPO
-- ============================================================
CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    height_cm DECIMAL(5,1),
    current_weight DECIMAL(5,1),
    biological_sex TEXT CHECK (biological_sex IN ('male','female')),
    birth_date DATE,
    activity_level TEXT CHECK (activity_level IN (
        'sedentary','light','moderate','very_active','extreme'
    )),
    weight_goal_type TEXT CHECK (weight_goal_type IN ('lose','maintain','gain')),
    weight_goal_kg DECIMAL(5,1),
    daily_steps_goal INTEGER DEFAULT 8000,
    weekly_activity_goal INTEGER DEFAULT 3,
    min_activity_minutes INTEGER DEFAULT 30,
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    dietary_restrictions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    weight DECIMAL(5,1) NOT NULL,
    body_fat_pct DECIMAL(4,1),
    waist_cm DECIMAL(5,1),
    hip_cm DECIMAL(5,1),
    arm_cm DECIMAL(5,1),
    thigh_cm DECIMAL(5,1),
    chest_cm DECIMAL(5,1),
    recorded_at DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    specialty TEXT NOT NULL,
    doctor_name TEXT,
    location TEXT,
    appointment_date TIMESTAMP NOT NULL,
    cost DECIMAL(10,2),
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    follow_up_months INTEGER,
    follow_up_status TEXT CHECK (follow_up_status IN ('pending','scheduled','ignored')),
    follow_up_reminder_date DATE,
    follow_up_reminder_count INTEGER DEFAULT 0,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    steps INTEGER,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    calories_burned DECIMAL(8,2),
    met_value DECIMAL(4,2),
    recorded_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    week_start DATE NOT NULL,
    plan_json JSONB NOT NULL,
    locked_days INTEGER[] DEFAULT '{}',
    dietary_restrictions TEXT[],
    weekly_budget DECIMAL(10,2),
    regeneration_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    recorded_date DATE NOT NULL,
    steps INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- ============================================================
-- MÓDULO MENTE
-- ============================================================
CREATE TABLE study_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'technology','languages','management','marketing','design',
        'finance','health','exam','undergraduate','postgraduate',
        'certification','other'
    )),
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'in_progress','paused','completed','abandoned'
    )),
    target_date DATE,
    progress DECIMAL(5,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(10,2),
    linked_skill_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_track_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    sort_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE focus_sessions_mente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    track_id UUID REFERENCES study_tracks(id),
    duration_minutes INTEGER NOT NULL,
    focus_minutes INTEGER NOT NULL,
    break_minutes INTEGER NOT NULL,
    cycles_completed INTEGER DEFAULT 0,
    session_notes TEXT,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('link','book','video','pdf','note','other')),
    url TEXT,
    personal_notes TEXT,
    status TEXT DEFAULT 'to_study' CHECK (status IN ('to_study','studying','completed')),
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO CARREIRA
-- ============================================================
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_title TEXT,
    current_company TEXT,
    field TEXT CHECK (field IN (
        'technology','finance','health','education','law',
        'engineering','marketing','sales','hr','design','management','other'
    )),
    level TEXT CHECK (level IN (
        'intern','junior','mid','senior','specialist',
        'coordinator','manager','director','c_level','freelancer','entrepreneur'
    )),
    gross_salary DECIMAL(12,2),
    start_date DATE,
    sync_salary_to_finance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    field TEXT,
    level TEXT,
    salary DECIMAL(12,2),
    start_date DATE NOT NULL,
    end_date DATE,
    change_type TEXT CHECK (change_type IN (
        'initial','promotion','lateral','company_change','salary_change','other'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    current_title TEXT NOT NULL,
    target_title TEXT NOT NULL,
    target_salary DECIMAL(12,2),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
    progress DECIMAL(5,2) DEFAULT 0,
    sort_order INTEGER NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('hard_skill','soft_skill','language','certification')),
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_step_skills (
    step_id UUID REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, skill_id)
);

CREATE TABLE skill_study_tracks (
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, track_id)
);

-- ============================================================
-- MÓDULO PATRIMÔNIO
-- ============================================================
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    ticker TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (asset_class IN (
        'stocks_br','fiis','etfs_br','bdrs','fixed_income',
        'crypto','stocks_us','reits','other'
    )),
    sector TEXT,
    quantity DECIMAL(15,8) NOT NULL DEFAULT 0,
    avg_price DECIMAL(15,4) NOT NULL DEFAULT 0,
    current_price DECIMAL(15,4),
    last_price_update TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('buy','sell')),
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0,
    operation_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portfolio_dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'dividend','jcp','fii_yield','fixed_income_interest','other'
    )),
    amount_per_unit DECIMAL(15,6),
    total_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    ex_date DATE,
    status TEXT DEFAULT 'received' CHECK (status IN ('announced','received')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fi_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    current_portfolio DECIMAL(15,2) NOT NULL,
    monthly_contribution DECIMAL(15,2) NOT NULL,
    expected_return_rate DECIMAL(5,2) NOT NULL,
    desired_passive_income DECIMAL(15,2) NOT NULL,
    result_months INTEGER,
    result_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO EXPERIÊNCIAS
-- ============================================================
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    destinations TEXT[] NOT NULL,
    trip_type TEXT CHECK (trip_type IN ('leisure','work','study','mixed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers_count INTEGER DEFAULT 1,
    total_budget DECIMAL(12,2),
    total_spent DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning','reserved','ongoing','completed','cancelled'
    )),
    notes TEXT,
    objective_id UUID REFERENCES objectives(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    cost_per_night DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('estimated','reserved','paid')),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('flight','train','bus','car_rental','taxi','transfer','other')),
    origin TEXT,
    destination TEXT,
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    company TEXT,
    cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('estimated','reserved','paid')),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    day_date DATE NOT NULL,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'sightseeing','restaurant','museum','beach','shopping',
        'transport','rest','other'
    )),
    address TEXT,
    estimated_time TIME,
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN (
        'accommodation','air_transport','ground_transport',
        'food','tickets','shopping','insurance','documents','other'
    )),
    estimated_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('documents','luggage','before_trip','other')),
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX idx_objectives_user_status ON objectives(user_id, status);
CREATE INDEX idx_objective_goals_objective ON objective_goals(objective_id);
CREATE INDEX idx_objective_goals_module ON objective_goals(target_module);
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, recorded_at);
CREATE INDEX idx_appointments_user_status ON medical_appointments(user_id, status);
CREATE INDEX idx_activities_user_date ON activities(user_id, recorded_at);
CREATE INDEX idx_study_tracks_user ON study_tracks(user_id, status);
CREATE INDEX idx_focus_sessions_mente_user ON focus_sessions_mente(user_id, recorded_at);
CREATE INDEX idx_career_roadmaps_user ON career_roadmaps(user_id, status);
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_portfolio_assets_user ON portfolio_assets(user_id);
CREATE INDEX idx_portfolio_dividends_user_date ON portfolio_dividends(user_id, payment_date);
CREATE INDEX idx_trips_user ON trips(user_id, status);
CREATE INDEX idx_trip_itinerary_day ON trip_itinerary_items(trip_id, day_date);

-- ============================================================
-- RLS (Row Level Security) — padrão igual às tabelas existentes
-- ============================================================
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_track_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions_mente ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE fi_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies padrão (user só acessa seus próprios dados)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'objectives','objective_goals','objective_milestones',
    'health_profiles','weight_entries','medical_appointments',
    'activities','meal_plans','daily_steps',
    'study_tracks','study_track_steps','focus_sessions_mente',
    'study_resources','study_streaks',
    'professional_profiles','career_history','career_roadmaps',
    'roadmap_steps','skills',
    'portfolio_assets','portfolio_transactions','portfolio_dividends','fi_simulations',
    'trips','trip_accommodations','trip_transports','trip_itinerary_items',
    'trip_budget_items','trip_checklist_items','trip_ai_conversations'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "%s_user_policy" ON %I FOR ALL USING (user_id = auth.uid())', t, t);
  END LOOP;
END $$;
```

> **Como rodar:** Dashboard Supabase → SQL Editor → colar o conteúdo acima → Run.
> Ou via CLI: `supabase db push` (se tiver CLI configurado).

---

### 6.2 — Shell V3: expandir para 8 módulos

**Arquivo:** `web/src/lib/modules.ts`

Adicionar os 6 novos módulos ao array `MODULES` e renomear:
- `metas` → `futuro` (rota `/futuro`, ícone 🔮)
- `agenda` → `tempo` (rota `/tempo`, ícone ⏳)
- Adicionar: `corpo` (🏃), `mente` (🧠), `patrimonio` (📈), `carreira` (💼), `experiencias` (✈️)

**Arquivo:** `web/src/types/shell.ts`

Adicionar novos `ModuleId` ao tipo union:
```ts
type ModuleId = 'home' | 'financas' | 'futuro' | 'tempo' | 'corpo' | 'mente' | 'patrimonio' | 'carreira' | 'experiencias' | 'conquistas' | 'configuracoes'
```

**Renomear rotas:**
- `web/src/app/(app)/metas/` → `web/src/app/(app)/futuro/`
- `web/src/app/(app)/agenda/` → `web/src/app/(app)/tempo/`
- Adicionar redirects em `next.config.ts` para `/metas` → `/futuro` e `/agenda` → `/tempo`

### 6.3 — Stack de IA

```bash
cd web && npm install ai @ai-sdk/google @ai-sdk/groq
```

Criar os Route Handlers:

**`web/src/app/api/ai/cardapio/route.ts`** — Cardápio semanal (Corpo)
**`web/src/app/api/ai/viagem/route.ts`** — Sugestões de viagem (Experiências)
**`web/src/app/api/ai/coach/route.ts`** — Coach nutricional conversacional (Corpo PRO)

Template base de cada Route Handler: ver `docs/SPEC-CORPO.md` seção §11.

Variável de ambiente necessária (`.env.local` + Vercel):
```
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
GROQ_API_KEY=sua_chave_aqui
```

### 6.4 — API de Cotações (Patrimônio)

Criar `web/src/app/api/cotacoes/route.ts`:
- Proxy para `brapi.dev` com cache de 1x/dia no Supabase
- Endpoint: `GET /api/cotacoes?tickers=PETR4,MXRF11`

Variável de ambiente:
```
BRAPI_TOKEN=sua_chave_aqui   # brapi.dev — free tier sem token, token opcional para mais limites
```

### 6.5 — Life Sync Score V3

**Arquivo:** `web/src/hooks/use-life-sync-score.ts` (criar ou atualizar)

Novo cálculo com 8 dimensões, pesos redistribuídos por módulos ativos do usuário:
```
Score = (Finanças×0.20 + Futuro×0.20 + Corpo×0.15 + Patrimônio×0.10 +
         Mente×0.10 + Carreira×0.10 + Tempo×0.10 + Experiências×0.05) × 100
```
Se módulo inativo: redistribuir peso proporcionalmente entre os ativos.

---

## FASE 7 — Módulo Futuro (2–3 semanas)

> **Prioridade máxima** — é o módulo conector. Sem ele os demais são silos.
> **Spec completa:** `docs/SPEC-FUTURO.md` (58 regras de negócio)

### Estrutura de arquivos a criar

```
web/src/app/(app)/futuro/
├── page.tsx                    ← Dashboard Futuro (lista de objetivos)
├── novo/
│   └── page.tsx                ← Wizard criação (4 etapas)
└── [id]/
    └── page.tsx                ← Detalhe do objetivo

web/src/hooks/use-futuro.ts     ← hook principal
web/src/components/futuro/
├── ObjectiveCard.tsx            ← card do objetivo com progresso agregado
├── ObjectiveWizard.tsx          ← wizard 4 etapas
├── GoalCard.tsx                 ← card de meta individual dentro do objetivo
├── ObjectiveMilestoneTimeline.tsx
└── LifeMapRadar.tsx             ← radar chart 8 eixos (Jornada only)
```

### Hook `use-futuro.ts`

```ts
// Exportar:
useObjectives()           // lista + KPIs do dashboard
useObjectiveDetail(id)    // detalhe + metas + milestones
useCreateObjective()      // mutation criar objetivo
useUpdateObjective(id)    // mutation editar/pausar/concluir
useAddGoal(objectiveId)   // mutation adicionar meta
useUpdateGoalProgress()   // mutation atualizar progresso de meta
```

### Tela Dashboard `/futuro`

Seguir anatomia padrão (CLAUDE.md):
1. **Topbar:** "🔮 Futuro" (Foco) / gradiente (Jornada) + botão "Novo Objetivo"
2. **Summary Strip (4 KPIs):** Objetivos ativos, Progresso geral %, Próximo prazo, Concluídos
3. **JornadaInsight:** "Você avançou X objetivos esta semana"
4. **Grid de ObjectiveCards** com filtros (status, tipo, módulo)
5. **Bottom card:** histórico (Foco) / Mapa da Vida radar chart (Jornada)

### Progresso do Objetivo (fórmula)

```ts
// Calcular localmente no frontend — não depende de view SQL para renderização
const progress = goals.reduce((acc, g) => acc + g.progress * g.weight, 0)
  / goals.reduce((acc, g) => acc + g.weight, 0)
```

---

## FASE 8 — Módulo Mente (3 semanas)

> **Spec completa:** `docs/SPEC-MENTE.md` (26 regras de negócio)
> **Por que antes do Corpo:** Timer Pomodoro = engajamento diário imediato, sem API externa.

### Estrutura de arquivos

```
web/src/app/(app)/mente/
├── page.tsx                    ← Dashboard (horas semana, streak, trilhas)
├── trilhas/
│   └── page.tsx                ← lista + CRUD de trilhas
├── timer/
│   └── page.tsx                ← Timer Pomodoro
├── sessoes/
│   └── page.tsx                ← histórico de sessões
└── biblioteca/
    └── page.tsx                ← recursos por trilha

web/src/hooks/use-mente.ts
web/src/components/mente/
├── TrackCard.tsx
├── TrackWizard.tsx             ← criar/editar trilha com etapas
├── PomodoroTimer.tsx           ← timer circular com estados
├── StudySessionCard.tsx
└── ResourceCard.tsx
```

### Timer Pomodoro — estados

```ts
type TimerState = 'idle' | 'focusing' | 'short_break' | 'long_break' | 'paused'
// Ciclo: focusing → short_break → focusing → short_break → ... → long_break (a cada 4)
// Persistir estado no localStorage para sobreviver refresh
```

### Integrações a implementar nesta fase

- Trilha concluída → atualizar `objective_goals` vinculados (se `linked_entity_type = 'study_track'`)
- Custo de trilha → transação em `transactions` categoria "Educação"
- Bloco de estudo agendado → evento em `agenda_events`

---

## FASE 9 — Módulo Carreira (3 semanas)

> **Spec completa:** `docs/SPEC-CARREIRA.md` (20 regras de negócio)
> **Dependência:** Mente concluída (habilidades ← trilhas).

### Estrutura de arquivos

```
web/src/app/(app)/carreira/
├── page.tsx                    ← Dashboard
├── perfil/
│   └── page.tsx                ← perfil profissional + histórico
├── roadmap/
│   └── page.tsx                ← timeline vertical cargo atual → alvo
└── habilidades/
    └── page.tsx                ← mapa de habilidades + radar chart

web/src/hooks/use-carreira.ts
web/src/components/carreira/
├── RoadmapTimeline.tsx         ← timeline vertical com steps
├── SkillCard.tsx
├── SkillRadarChart.tsx         ← Recharts RadarChart (Jornada)
└── CareerProfileForm.tsx
```

### Integração chave: Salário → Finanças

```ts
// Ao salvar perfil profissional com sync_salary_to_finance = true:
// 1. Verificar se já existe transação recorrente de salário
// 2. Se sim: atualizar valor
// 3. Se não: criar nova transação recorrente "Salário" em transactions/recorrentes
```

---

## FASE 10 — Módulo Corpo (4 semanas)

> **Spec completa:** `docs/SPEC-CORPO.md` (39 regras de negócio)
> **Dividir em 2 entregas:** v1 (sem IA) e v2 (com IA).

### Estrutura de arquivos

```
web/src/app/(app)/corpo/
├── page.tsx                    ← Dashboard
├── evolucao/
│   └── page.tsx                ← gráfico de peso, IMC, TMB/TDEE
├── consultas/
│   └── page.tsx                ← CRUD consultas médicas + retornos
├── atividades/
│   └── page.tsx                ← registro de atividades + meta passos
└── cardapio/
    └── page.tsx                ← chat IA + histórico de cardápios

web/src/app/api/ai/
├── cardapio/route.ts           ← POST → Gemini 1.5 Flash (já criado na Fase 6)
└── coach/route.ts              ← streaming → Groq Llama 3.3 70B (já criado na Fase 6)

web/src/hooks/use-corpo.ts
web/src/components/corpo/
├── WeightChart.tsx             ← Recharts LineChart com linha de tendência
├── AppointmentCard.tsx
├── ActivityCard.tsx
├── MealPlanCard.tsx
└── BmrTdeePanel.tsx            ← painel com cálculos nutricionais
```

### Fórmulas TMB/TDEE (implementar no hook)

```ts
// Mifflin-St Jeor
const bmr = sex === 'male'
  ? (10 * weight) + (6.25 * height) - (5 * age) + 5
  : (10 * weight) + (6.25 * height) - (5 * age) - 161

const activityFactors = {
  sedentary: 1.2, light: 1.375, moderate: 1.55,
  very_active: 1.725, extreme: 1.9
}
const tdee = bmr * activityFactors[activityLevel]
```

### Calorias por atividade (MET)

```ts
const MET: Record<string, number> = {
  walking: 3.5, running: 8.0, weightlifting: 6.0,
  cycling: 7.5, swimming: 7.0, yoga: 3.0,
  soccer: 7.0, basketball: 6.5, dance: 5.0, other: 4.0
}
// calories = MET[type] * weight_kg * (duration_minutes / 60)
```

---

## FASE 11 — Módulo Patrimônio (3–4 semanas)

> **Spec completa:** `docs/SPEC-PATRIMONIO.md` (24 regras de negócio)
> **Dependência técnica:** API de cotações configurada na Fase 6.

### Estrutura de arquivos

```
web/src/app/(app)/patrimonio/
├── page.tsx                    ← Dashboard (total, rentabilidade, pizza)
├── carteira/
│   └── page.tsx                ← lista de ativos + adicionar operação
├── proventos/
│   └── page.tsx                ← calendário + histórico de proventos
└── simulador/
    └── page.tsx                ← calculadora IF (PRO)

web/src/app/api/cotacoes/route.ts   ← já criado na Fase 6
web/src/hooks/use-patrimonio.ts
web/src/components/patrimonio/
├── AssetCard.tsx
├── PortfolioPieChart.tsx       ← Recharts PieChart distribuição
├── PortfolioEvolutionChart.tsx ← Recharts LineChart vs CDI
├── DividendCalendar.tsx
└── FiSimulatorForm.tsx
```

### Cálculo de preço médio (implementar no hook)

```ts
// Ao registrar nova compra:
const newAvgPrice = (currentQty * currentAvgPrice + newQty * newPrice) / (currentQty + newQty)
// Venda: não altera preço médio, apenas reduz quantity
```

### Fórmula Simulador IF

```ts
// Juros compostos: VF = VP * (1+i)^n + PMT * ((1+i)^n - 1) / i
// Onde: VP = patrimônio atual, i = taxa mensal, PMT = aporte mensal, n = meses
// IF atingida quando: VF * 0.04 / 12 >= renda_desejada (regra dos 4%)
```

---

## FASE 12 — Módulo Experiências (3–4 semanas)

> **Spec completa:** `docs/SPEC-EXPERIENCIAS.md` (32 regras de negócio)
> **Mais independente** — menor interdependência com outros módulos.

### Estrutura de arquivos

```
web/src/app/(app)/experiencias/
├── page.tsx                    ← Dashboard (próxima viagem, countdown)
├── nova/
│   └── page.tsx                ← Wizard 5 etapas
└── [id]/
    ├── page.tsx                ← visão geral da viagem
    ├── roteiro/
    │   └── page.tsx            ← itinerário dia a dia
    ├── orcamento/
    │   └── page.tsx            ← estimado vs real por categoria
    └── checklist/
        └── page.tsx            ← documentos, bagagem, antes de viajar

web/src/app/api/ai/viagem/route.ts  ← já criado na Fase 6
web/src/hooks/use-experiencias.ts
web/src/components/experiencias/
├── TripCard.tsx
├── TripWizard.tsx              ← wizard 5 etapas
├── ItineraryDayCard.tsx        ← drag-and-drop com @hello-pangea/dnd
├── BudgetCategoryBar.tsx       ← barra estimado vs real
├── TripChecklistCard.tsx
└── TravelAIChat.tsx            ← chat com sugestões IA
```

### Drag-and-drop no roteiro

```bash
npm install @hello-pangea/dnd   # fork do react-beautiful-dnd para React 18+
```

---

## FASE 13 — Integrações + Jornada Polish (2–3 semanas)

### 13.1 — Validar matriz de integrações

Testar cada seta do grafo de integrações (ver seção 11.1 de `MVP-V3-ESPECIFICACAO-COMPLETA-V2.md`).
Prioridade: integrações que já devem ter sido implementadas parcialmente nas fases anteriores.

### 13.2 — Dashboard Home V3

**Arquivo:** `web/src/app/(app)/dashboard/page.tsx`

Atualizar para agregar dados dos 8 módulos:
- Novo widget: progresso do Objetivo mais próximo do prazo
- Novo widget: próxima consulta médica (Corpo)
- Novo widget: sessões de estudo da semana (Mente)
- Widget existente de Finanças: manter
- Modo Jornada: Mapa da Vida como widget resumido

### 13.3 — Conquistas V3

**Arquivo:** `web/src/app/(app)/conquistas/page.tsx`

Adicionar badges dos novos módulos:
- 🏃 Corpo: "Primeira consulta registrada", "10 treinos", "30 dias de streak"
- 🧠 Mente: "Primeira trilha concluída", "10h de Pomodoro", "Streak 7 dias"
- 💼 Carreira: "Roadmap criado", "Primeira promoção"
- 📈 Patrimônio: "Primeiro ativo cadastrado", "Primeiro provento"
- 🔮 Futuro: "Primeiro objetivo criado", "Primeiro objetivo concluído"
- ✈️ Experiências: "Primeira viagem planejada"

### 13.4 — Life Sync Score V3

Finalizar cálculo com dados reais de todos os módulos ativos.

### 13.5 — Jornada Polish

Revisar em cada módulo:
- `JornadaInsight` com texto motivacional real (não mock)
- Celebrações ao atingir marcos (confetti, animação `bounceIn`)
- Frases empáticas nas notificações (nunca punitivas)

### 13.6 — Testes E2E

```bash
cd web && npx playwright test
```

Flows críticos:
- Criar objetivo → adicionar meta → atualizar progresso → ver no Futuro
- Trilha Mente → habilidade Carreira → roadmap step
- Registro de peso Corpo → meta de peso no Futuro atualiza

---

## BRANCH E DEPLOY

### Branch de trabalho

```
mvp-v3   ← branch principal do V3 (já criada, base: main)
```

Para cada fase, trabalhar diretamente na `mvp-v3`. Commits por fase:
```bash
git commit -m "feat(infra-v3): fase 6 — migration, shell v3, stack IA"
git commit -m "feat(futuro): fase 7 — dashboard, wizard, detalhe, mapa da vida"
git commit -m "feat(mente): fase 8 — trilhas, timer pomodoro, sessões"
# etc.
```

### Variáveis de ambiente necessárias

Adicionar no `.env.local` (desenvolvimento) e no painel Vercel (produção):

```env
# IA — MVP (free)
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=

# Cotações — Patrimônio
BRAPI_TOKEN=                    # opcional no free tier

# Já existem (não alterar)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Deploy por fase (lançamento incremental)

| Release | Conteúdo | Branch → main |
|---------|----------|---------------|
| v3.0 | Infra + Futuro | Após Fase 7 |
| v3.1 | + Mente | Após Fase 8 |
| v3.2 | + Carreira | Após Fase 9 |
| v3.3 | + Corpo | Após Fase 10 |
| v3.4 | + Patrimônio | Após Fase 11 |
| v3.5 | + Experiências | Após Fase 12 |
| v3.6 | Integrações + Polish | Após Fase 13 |

---

## CHECKLIST POR FASE

### Antes de commitar cada fase

- [ ] `tsc --noEmit` sem erros
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Segue anatomia: topbar → sum-strip → insight → conteúdo → bottom-grid
- [ ] `JornadaInsight` presente e oculto no Foco
- [ ] Valores monetários em `font-[DM_Mono]`, títulos em `font-[Syne] font-extrabold`
- [ ] Cores de barra seguem regra (≤70% verde, 70–85% amarelo, >85% vermelho)
- [ ] Animações `sl-fade-up` nos cards com delays
- [ ] Responsivo: colapsa para 1 coluna em `max-lg`
- [ ] Nenhum `console.log` em produção
- [ ] Migration SQL testada no Supabase (se houver)
- [ ] Integrações da fase implementadas e testadas

---

*Criado em: Fevereiro 2026*
*Branch: `mvp-v3`*
*Referências: SPEC-FUTURO/CORPO/MENTE/CARREIRA/PATRIMONIO/EXPERIENCIAS, ADR-001, MVP-V3-ESPECIFICACAO-COMPLETA-V2, ROADMAP-MVP-V3*
