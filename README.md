# SyncLife

> Sua vida inteira, organizada em um só lugar.

SyncLife é uma plataforma web (PWA) que centraliza a gestão de todos os aspectos da vida pessoal — finanças, metas, tempo, saúde, carreira, patrimônio e experiências — em uma interface unificada com design system próprio e 12 temas visuais.

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
| Corpo | `/corpo` | Atividades, peso/medidas, cardápio IA, saúde preventiva, coach IA |
| Mente | `/mente` | Trilhas de aprendizado, timer, sessões, biblioteca |
| Patrimônio | `/patrimonio` | Carteira de investimentos, proventos, evolução, simulador IF |
| Carreira | `/carreira` | Perfil profissional, roadmap, habilidades, histórico |
| Experiências | `/experiencias` | Viagens, passaporte, memórias, bucket list, assistente IA |
| Conquistas | `/conquistas` | Badges, ranking, sistema de gamificação |
| Configurações | `/configuracoes` | Perfil, aparência (12 temas), notificações, categorias, integrações, plano |

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
# Instalar dependências
cd web
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#            GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY

# Desenvolvimento
npm run dev

# Build
npm run build
```

---

## Estrutura de Pastas

```
web/
├── src/
│   ├── app/
│   │   ├── (app)/          ← telas autenticadas (11 módulos)
│   │   ├── (auth)/         ← login, cadastro, forgot-password
│   │   ├── api/            ← API routes (IA + cotações)
│   │   └── globals.css     ← design tokens + temas
│   ├── components/
│   │   ├── ui/             ← shadcn/ui + componentes base SyncLife
│   │   └── [módulo]/       ← componentes específicos por módulo
│   ├── hooks/              ← 29 hooks customizados
│   ├── lib/                ← utilitários, Supabase client, engines
│   ├── stores/             ← Zustand stores
│   └── types/              ← TypeScript types
├── supabase/
│   └── migrations/         ← 19 migrations SQL
└── public/
    ├── manifest.json       ← PWA manifest
    └── sw.js               ← Service Worker
```

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| `CLAUDE.md` | Guia de desenvolvimento, design system, convenções |
| `DESIGN-SYSTEM.md` | Tokens, cores, tipografia, componentes |
| `docs/SPEC-FUNCIONAL-*.md` | Specs funcionais por módulo (6 documentos) |
| `docs/PENDENCIAS-REGRAS-NEGOCIO.md` | Backlog de 199 regras de negócio auditadas |

---

## Licença

Projeto privado. Todos os direitos reservados.

---

*Última atualização: Março 2026*
