# SyncLife

> Sua vida inteira, organizada em um só lugar.

SyncLife é uma plataforma web (PWA) que centraliza a gestão de todos os aspectos da vida pessoal — finanças, metas, tempo, saúde, carreira, patrimônio e experiências — em uma interface unificada com design system próprio e **12 temas visuais**.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.1 (App Router) |
| Linguagem | TypeScript (strict) |
| UI | React 19 + shadcn/ui (new-york) |
| Estilo | Tailwind CSS v4 |
| Gráficos | Recharts |
| Backend / Auth / DB | Supabase (SSR + RLS) |
| IA | Vercel AI SDK + Google Gemini + Groq Llama |
| Deploy | Vercel |
| PWA | Service Worker + Manifest |

---

## Módulos (11)

| Módulo | Rota | Descrição |
|--------|------|-----------|
| Panorama | `/dashboard` | Dashboard central, score, XP, conquistas |
| Finanças | `/financas` | Transações, orçamentos, recorrentes, planejamento, calendário, relatórios |
| Futuro | `/futuro` | Objetivos de vida com progresso e milestones |
| Tempo | `/tempo` | Agenda, calendário semanal/mensal, blocos de foco, review |
| Corpo | `/corpo` | Atividades, peso/medidas, cardápio IA, saúde preventiva |
| Mente | `/mente` | Trilhas de aprendizado, timer, sessões, biblioteca |
| Patrimônio | `/patrimonio` | Carteira de investimentos, proventos, evolução, simulador IF |
| Carreira | `/carreira` | Perfil profissional, roadmap, habilidades, histórico |
| Experiências | `/experiencias` | Viagens, passaporte, memórias, bucket list, assistente IA |
| Conquistas | `/conquistas` | Badges, ranking, sistema de gamificação |
| Configurações | `/configuracoes` | Perfil, aparência (12 temas), notificações, categorias, integrações, plano |

Coach IA cross-module: `/coach`

---

## Experiência unificada

Desde mar/2026 o app **não possui** Modo Foco / Modo Jornada. Gamificação, insights e labels narrativos fazem parte da experiência padrão para todos os usuários. Detalhes: [`docs/Especificacoes funcionais/README.md`](docs/Especificacoes%20funcionais/README.md).

---

## Engines de Gamificação

- **Score Engine** — Life Sync Score calculado em 8 dimensões com pesos por módulo
- **Badge Engine** — 20+ evaluators que desbloqueiam conquistas automaticamente
- **XP System** — 21 ações rastreadas, sistema de levels progressivo

---

## APIs de IA

| Rota | Provider | Função |
|------|----------|--------|
| `/api/ai/cardapio` | Google Gemini | Geração de cardápio semanal personalizado |
| `/api/ai/coach` | Groq Llama 3.3 | Coach de saúde e bem-estar (streaming) |
| `/api/ai/financas` | Google Gemini | Consultor financeiro personalizado (streaming) |
| `/api/ai/viagem` | Google Gemini | Assistente de planejamento de viagens (streaming) |
| `/api/cotacoes` | brapi.dev | Cotações de ativos (cache 24h) |

---

## Quick Start

```bash
cd web
npm install

cp .env.example .env.local
# Preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# Opcional: GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY

npm run dev
# → http://localhost:3005
```

Windows: execute `web/INICIAR-SYNCLIFE.bat`

---

## Estrutura de Pastas

```
web/
├── src/
│   ├── app/
│   │   ├── (app)/          ← telas autenticadas (11 módulos)
│   │   ├── (auth)/         ← login, cadastro, forgot-password
│   │   ├── api/            ← API routes (IA + cotações + push + cron)
│   │   └── globals.css     ← design tokens + temas
│   ├── components/
│   │   ├── ui/             ← shadcn/ui + componentes base SyncLife
│   │   └── [módulo]/       ← componentes específicos por módulo
│   ├── hooks/              ← hooks customizados
│   ├── lib/                ← utilitários, Supabase client, engines
│   ├── stores/             ← Zustand stores
│   └── types/              ← TypeScript types
├── supabase/
│   └── migrations/         ← 25 migrations SQL
├── e2e/                    ← testes Playwright
└── public/
    ├── manifest.json       ← PWA manifest
    └── sw.js               ← Service Worker
```

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [`CLAUDE.md`](CLAUDE.md) | Guia de desenvolvimento, design system, convenções |
| [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | Tokens, cores, tipografia, componentes |
| [`docs/README.md`](docs/README.md) | Índice completo de specs, features e E2E |
| [`docs/AUDITORIA-COMPLETA-2026-03.md`](docs/AUDITORIA-COMPLETA-2026-03.md) | Auditoria de mar/2026 (referência histórica) |
| [`web/README.md`](web/README.md) | Quick start focado no app Next.js |

---

## Licença

Projeto privado. Todos os direitos reservados.

---

*Última atualização: maio 2026*
