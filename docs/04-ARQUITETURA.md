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
│  │                   NEXT.JS 16                          │ │
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
| Next.js | 16 | Framework React com SSR |
| React | 19 | Biblioteca UI |
| TypeScript | 5+ | Tipagem estática |
| TailwindCSS | v4 | Estilização utility-first |
| shadcn/ui | latest | Componentes base |
| Recharts | 2+ | Gráficos |
| React Hook Form | 7+ | Formulários |
| Zod | 3+ | Validação de schemas |
| Lucide React | latest | Ícones |
| Zustand | 5+ | Estado global (shell, mode, theme) |
| Vercel AI SDK | 5+ | Integração com LLMs (Gemini, Groq) |

### 2.2 Backend / Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| Supabase | Auth, Database, Storage |
| PostgreSQL | Banco de dados (via Supabase) |
| Vercel | Hosting e deploy |

### 2.3 Ferramentas de Desenvolvimento

| Ferramenta | Uso |
|------------|-----|
| npm | Gerenciador de pacotes |
| ESLint | Linting |
| Prettier | Formatação |
| Git | Controle de versão |
| GitHub | Repositório |

---

## 3. Estrutura de Pastas

> Estrutura real do repositório em Fev/2026 (MVP V3 completo).

```
web/src/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx                # Layout raiz
│   ├── 📄 page.tsx                  # Landing page (/)
│   ├── 📄 globals.css               # Tokens de cor + Design System
│   │
│   ├── 📁 (auth)/                   # Grupo de rotas de auth
│   │   ├── 📁 login/page.tsx
│   │   ├── 📁 cadastro/page.tsx
│   │   └── 📁 recuperar-senha/page.tsx
│   │
│   ├── 📁 (app)/                    # Grupo de rotas protegidas
│   │   ├── 📄 layout.tsx            # AppShell wrapper (Server Component)
│   │   ├── 📁 dashboard/            # Dashboard Home
│   │   ├── 📁 financas/             # Dashboard, Transações, Orçamentos, Recorrentes, Planejamento, Calendário, Relatórios
│   │   ├── 📁 futuro/               # Objetivos e Metas (ex-Metas)
│   │   ├── 📁 tempo/                # Agenda semanal/mensal (ex-Agenda)
│   │   ├── 📁 corpo/                # Peso, Atividades, Saúde, Cardápio IA
│   │   ├── 📁 mente/                # Trilhas, Timer Pomodoro, Biblioteca
│   │   ├── 📁 patrimonio/           # Dashboard, Carteira, Proventos, Simulador IF
│   │   ├── 📁 carreira/             # Habilidades, Roadmap, Promoções
│   │   ├── 📁 experiencias/         # Viagens, Nova viagem, Detalhe
│   │   ├── 📁 conquistas/           # Badges e Ranking
│   │   └── 📁 configuracoes/        # Perfil, Modo, Notificações, Integrações, Plano
│   │
│   └── 📁 api/                      # Route Handlers
│       └── 📁 ai/                   # IA endpoints
│           ├── 📁 cardapio/route.ts  # Gemini — cardápio personalizado
│           ├── 📁 viagem/route.ts    # Gemini — sugestões de viagem
│           └── 📁 coach/route.ts     # Groq — coach nutricional
│
├── 📁 components/
│   ├── 📁 ui/                       # shadcn/ui (button, input, dialog, etc.)
│   ├── 📁 shell/                    # ModuleBar, Sidebar, TopHeader, AppShell
│   ├── 📁 settings/                 # Componentes de configurações
│   ├── 📁 financas/                 # Componentes de finanças
│   ├── 📁 futuro/                   # MetaCard, AddGoalModal, etc.
│   ├── 📁 corpo/                    # AppointmentCard, WeightChart, etc.
│   ├── 📁 mente/                    # PomodoroTimer, TrackWizard, etc.
│   ├── 📁 patrimonio/               # AssetCard, IFSimulator, etc.
│   ├── 📁 carreira/                 # SkillCard, RoadmapTimeline, etc.
│   ├── 📁 experiencias/             # TripCard, TripAIChat, etc.
│   └── 📁 pwa/                      # Service Worker registration
│
├── 📁 hooks/                        # Custom hooks por módulo
│   ├── 📄 use-transactions.ts       # Finanças: transações
│   ├── 📄 use-orcamentos.ts         # Finanças: orçamentos
│   ├── 📄 use-recorrentes.ts        # Finanças: recorrentes
│   ├── 📄 use-futuro.ts             # Futuro: objetivos e metas
│   ├── 📄 use-agenda.ts             # Tempo: eventos
│   ├── 📄 use-corpo.ts              # Corpo: peso, atividades, saúde
│   ├── 📄 use-mente.ts              # Mente: trilhas, timer
│   ├── 📄 use-patrimonio.ts         # Patrimônio: ativos, proventos
│   ├── 📄 use-carreira.ts           # Carreira: skills, roadmap
│   ├── 📄 use-experiencias.ts       # Experiências: viagens
│   └── 📄 use-notifications.ts      # Notificações globais
│
├── 📁 lib/
│   ├── 📁 supabase/
│   │   ├── 📄 client.ts             # Cliente browser (createClient)
│   │   ├── 📄 server.ts             # Cliente server async (createClient)
│   │   └── 📄 middleware.ts         # Auth middleware
│   ├── 📁 integrations/             # Bridges cross-module
│   ├── 📄 modules.ts                # MODULES config (11 módulos)
│   ├── 📄 constants.ts              # Constantes globais
│   └── 📄 utils.ts                  # cn() e utilitários
│
├── 📁 stores/
│   └── 📄 shell-store.ts            # Zustand: mode, theme, sidebarOpen
│
└── 📁 types/
    └── 📄 shell.ts                  # AppMode, AppTheme, ModuleId
```

---

## 4. Modelo de Dados

### 4.1 Resumo do Schema (V3)

O banco de dados possui ~35 tabelas distribuídas em 9 migrations:

| Migration | Scope | Tabelas principais |
|-----------|-------|--------------------|
| `schema.sql` | Base | profiles, categories, transactions, budgets |
| `001_mvp_v2.sql` | Fase 1 | +monthly_income, life_moments, active_modules em profiles |
| `002_fase2_financas.sql` | Fase 2 | recurring_transactions, planning_events |
| `003_fase3_metas.sql` | Fase 3 | goals, goal_contributions, goal_milestones |
| `004_fase4_agenda.sql` | Fase 4 | calendar_events |
| `005_fase6_infra_v3.sql` | Fase 6 | objectives, objective_goals, study_tracks, track_sessions, library_items, mental_journal, skills, skill_study_tracks, roadmaps, roadmap_steps, roadmap_step_skills, career_promotions, weight_entries, body_measurements, activities, medical_appointments, assets, asset_transactions, dividends, trips, trip_days, trip_items, trip_checklist, trip_accommodations, trip_transports |
| `007_futuro_migracao.sql` | Futuro | Migração goals V2 → objectives V3 |
| `008_link_objectives.sql` | Links | Vínculos objectives ↔ tracks/roadmaps |
| `009_corpo_storage.sql` | Storage | Bucket corpo-files, attachment columns |

### 4.2 RLS e Segurança

Todas as tabelas têm Row Level Security (RLS) habilitado com políticas `auth.uid() = user_id`. Triggers automáticos para `updated_at` e criação de profile no signup.

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

# IA (MVP — free tiers)
GOOGLE_GENERATIVE_AI_API_KEY=...
GROQ_API_KEY=...
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
*Versão: 2.0 (atualizado Fev 2026 — MVP V3 completo)*
