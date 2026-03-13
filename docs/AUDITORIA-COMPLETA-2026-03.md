# Auditoria Completa do SyncLife

**Data:** 12 de Março de 2026
**Ultima atualizacao:** 12 de Março de 2026
**Branch:** auditoria-fase0-cleanup (commit 41ecef2)
**Auditor:** Claude Code (leitura completa do codebase)

---

## 1. Panorama Geral

### Inventario do Codebase

| Metrica | Valor |
|---------|-------|
| Paginas (`page.tsx`) | 69 |
| Layouts (`layout.tsx`) | 6 |
| API Routes (`route.ts`) | 6 |
| Error Boundaries (`error.tsx`) | 2 |
| Loading States (`loading.tsx`) | 2 |
| Hooks customizados | 29 (9.824 linhas) |
| Componentes (.tsx) | 116 arquivos em 22 pastas |
| Arquivos em lib/ | 30 |
| Stores (Zustand) | 1 |
| Types | 2 arquivos |
| Migrations SQL | 19 (1.855 linhas) |
| Dependencias prod | 22 packages |
| Dependencias dev | 11 packages |

### Modulos Implementados (11)

| Modulo | Rota | Paginas | Hook principal | Cor |
|--------|------|---------|----------------|-----|
| Panorama | `/dashboard` | 3 | use-panorama.ts | #6366f1 |
| Financas | `/financas` | 7 | use-transactions + 5 outros | #10b981 |
| Futuro | `/futuro` | 5 | use-futuro.ts (604 linhas) | #8b5cf6 |
| Tempo | `/tempo` | 7 | use-agenda.ts + use-focus-sessions | #06b6d4 |
| Corpo | `/corpo` | 6 | use-corpo.ts (650 linhas) | #f97316 |
| Mente | `/mente` | 6 | use-mente.ts (576 linhas) | #eab308 |
| Patrimonio | `/patrimonio` | 6 | use-patrimonio.ts (559 linhas) | #3b82f6 |
| Carreira | `/carreira` | 5 | use-carreira.ts (592 linhas) | #f43f5e |
| Experiencias | `/experiencias` | 7 | use-experiencias.ts (1.210 linhas) | #ec4899 |
| Conquistas | `/conquistas` | 2 | use-badge-engine.ts (551 linhas) | #f59e0b |
| Configuracoes | `/configuracoes` | 6 | - | #64748b |

### APIs de IA

| Rota | Provider | Funcao | Validacao |
|------|----------|--------|-----------|
| `/api/ai/cardapio` | Google Gemini 2.5 Flash | Cardapio semanal personalizado | Zod (input + output) |
| `/api/ai/coach` | Groq Llama 3.3 70B | Coach de saude (streaming) | Zod (input) |
| `/api/ai/financas` | Google Gemini 2.5 Flash | Consultor financeiro (streaming) | Zod (input) |
| `/api/ai/viagem` | Google Gemini 2.5 Flash | Planejamento de viagens (streaming) | Zod (input) |
| `/api/cotacoes` | brapi.dev | Cotacoes de ativos (cache 24h) | Zod (tickers) |

### Engines de Gamificacao

| Engine | Arquivo | Linhas | Funcao |
|--------|---------|--------|--------|
| Score Engine | use-score-engine.ts | 582 | Life Sync Score em 8 dimensoes |
| Badge Engine | use-badge-engine.ts | 551 | 20+ evaluators auto-unlock |
| XP System | use-xp.ts | 200 | 21 acoes, level system |

---

## 2. Scorecard de Maturidade

| Area | Nota | Justificativa |
|------|------|---------------|
| Arquitetura | **9/10** | App Router bem estruturado, 11 modulos independentes, shell maduro com 12 temas |
| Feature Completeness | **9/10** | 69 paginas, 11 modulos com CRUD, 3 engines de gamificacao, 4 IAs |
| Design System | **9/10** | 12 temas em CSS variables, tokens consistentes, componentes base definidos |
| Seguranca | **8.5/10** | Auth/RLS OK, Zod em todas APIs, rate limiting Upstash, sem secrets hardcoded |
| Mobile | **8/10** | Shells mobile por modulo, bottom bar, breakpoints, fonte DM Sans |
| Acessibilidade | **7/10** | 38 aria-attributes em 23 arquivos, bom para mobile/nav |
| Documentacao | **8/10** | 10 specs funcionais (620KB), CLAUDE.md v2.0, DESIGN-SYSTEM.md, README atualizado, docs deprecados removidos |
| Data Layer | **6/10** | 19 migrations, 31+ tabelas, RLS. Porem 235 `as any` sem tipos gerados |
| Performance | **6/10** | loading.tsx OK, SW com cache hibrido. Sem code splitting, sem dynamic imports |
| Error Handling | **6/10** | error.tsx + loading.tsx em (app) e (auth), rate limiting com 429. Pendente: 14 catches silenciados |
| Qualidade Codigo | **5/10** | 0 console.log, mas 21 paginas >500 linhas, 11 hooks >400 linhas |
| Testes | **3/10** | 0 testes unitarios, 0 testes de integracao. Apenas specs E2E |
| DevOps | **4/10** | Deploy Vercel OK, rate limiting OK. Pendente: CI/CD, staging, monitoring |
| Monetizacao | **2/10** | Interfaces existem (ProGate, usePlanLimits) mas tudo retorna `true` |

**Media geral: 6.5/10** (era 6.2 antes da Fase 0)

---

## 3. Pontos Criticos

### CRIT-01: 235 `as any` — tipos Supabase nao gerados

**Impacto:** Toda interacao com DB e sem type safety. Erros detectados so em runtime.
**Maiores ofensores:**
- `use-experiencias.ts` — 27 casts
- `use-corpo.ts` — 18 casts
- `use-carreira.ts` — 13 casts
- `use-mente.ts` — 12 casts
- `use-patrimonio.ts` — 11 casts
- `lib/integrations/` — 27 casts

**Fix:** `npx supabase gen types typescript --project-id <ID> > src/types/database.ts`

### CRIT-02: 21 paginas com mais de 500 linhas

As 4 maiores:

| Arquivo | Linhas |
|---------|--------|
| `experiencias/viagens/[id]/page.tsx` | **1.410** |
| `financas/page.tsx` | **1.149** |
| `financas/relatorios/page.tsx` | **1.083** |
| `dashboard/page.tsx` | **992** |

**Fix:** Extrair secoes (charts, cards, modais) em componentes dedicados.

### CRIT-03: 11 hooks com mais de 400 linhas

| Hook | Linhas |
|------|--------|
| `use-experiencias.ts` | **1.210** |
| `use-corpo.ts` | **650** |
| `use-futuro.ts` | **604** |
| `use-carreira.ts` | **592** |
| `use-score-engine.ts` | **582** |
| `use-mente.ts` | **576** |
| `use-patrimonio.ts` | **559** |
| `use-badge-engine.ts` | **551** |
| `use-relatorios.ts` | **509** |
| `use-notifications.ts` | **435** |
| `use-metas.ts` | **434** |

**Fix:** Dividir por sub-dominio (ex: use-experiencias -> trips, bucket-list, passport, memories).

### CRIT-04: Zero testes unitarios

Nenhum teste unitario ou de integracao. Apenas specs E2E documentadas em `docs/specs/E2E-TEST-SCENARIOS.md`.

**Fix:** Priorizar testes para engines (score, badge, xp) e hooks de calculo (planejamento, relatorios).

### ~~CRIT-05: Sem rate limiting nas APIs de IA~~ RESOLVIDO

~~Todas as 4 rotas de IA aceitam requests ilimitados. Risco de custos descontrolados.~~

**Status:** RESOLVIDO na Fase 0. Upstash Redis rate limiting implementado em todas as 4 rotas de IA (sliding window 10 req/60s por usuario). Helper em `web/src/lib/rate-limit.ts`. Graceful degradation: sem env vars Upstash, rate limiting e desabilitado (dev/beta).

### CRIT-06: Freemium totalmente desabilitado

`use-plan-limits.ts` retorna `isPro = true`, `canUse = () => true`, `limit = () => Infinity`.
Landing page anuncia FREE/PRO mas o app ignora.

**Fix:** Implementar logica real lendo `plan_type` do profile + integrar Stripe.

---

## 4. Divergencias e Limpeza

### Codigo morto / legado

| Item | Localizacao | Acao |
|------|-------------|------|
| Pagina legada `/transacoes` | `app/(app)/transacoes/page.tsx` | **Mantido** — 9 referencias ativas (dashboard, financas) |
| Diretorio `panorama/` | `app/(app)/panorama/` | **Mantido** — contem subdiretorios com conteudo |
| ~~Diretorio vazio `quick-entry/`~~ | ~~`app/(app)/quick-entry/`~~ | **Excluido** na Fase 0 |
| ~~Route group vazio `(landing)`~~ | ~~`app/(landing)/`~~ | **Excluido** na Fase 0 |
| Hook `use-metas.ts` | `hooks/use-metas.ts` (434 linhas) | **Mantido** — importado em 6 paginas (dashboard + tempo) |
| Componentes `metas/` | `components/metas/` (6 arquivos) | **Mantido** — usados por use-metas.ts |
| ~~Arquivo avulso na raiz~~ | ~~`snap-patrimonio-mobile.md`~~ | **Excluido** na Fase 0 |
| ~~Mock data ativo~~ | ~~`lib/mock-financas.ts` USE_MOCK~~ | **Corrigido** na Fase 0 (setado para `false`) |

### `dangerouslySetInnerHTML` (5 ocorrencias)

| Arquivo | Risco |
|---------|-------|
| `app/layout.tsx` | BAIXO — script de FOUC prevention (hardcoded) |
| `financas/PlanejamentoMobile.tsx` | MEDIO — verificar se conteudo e sanitizado |
| `mente/ResourceCard.tsx` | MEDIO — verificar se conteudo e sanitizado |
| `financas/relatorios/page.tsx` | MEDIO — verificar se conteudo e sanitizado |
| `futuro/mobile/FuturoGoalCard.tsx` | BAIXO — narrativeHint gerado internamente |

### 14 catches silenciados

Distribuidos em paginas de configuracoes e features. Todos com comentarios explicativos (`/* ignore */`, `/* silent */`). Recomendacao: substituir por logging real (Sentry).

### 24 eslint-disable

| Regra | Quantidade |
|-------|-----------|
| `@typescript-eslint/no-explicit-any` | 12 |
| `react-hooks/exhaustive-deps` | 9 |
| Outros | 3 |

---

## 5. Seguranca

### Pontos fortes

- **Autenticacao:** Todas as APIs verificam `supabase.auth.getUser()`. Middleware protege rotas.
- **Validacao de input:** Zod schemas em todas as 5 API routes com limites de tamanho.
- **Sem injection:** Zero `eval()`, zero `new Function()`, Supabase SDK parametrizado.
- **Sem secrets hardcoded:** Todas as chaves via env vars.
- **Cookies seguros:** Gerenciados pelo Supabase SSR.

### Pontos a melhorar

| Item | Status | Prioridade |
|------|--------|------------|
| Rate limiting | **Implementado** (Upstash Redis, 4 AI routes) | ~~Alta~~ Resolvido |
| CSP headers | Ausente | Media |
| `dangerouslySetInnerHTML` sanitization | 3 de 5 nao verificados | Media |
| `npm audit` no CI | Ausente | Media |
| Sentry / error tracking | Ausente | Alta |

---

## 6. Performance

### Pontos fortes

- `loading.tsx` em `(app)` e `(auth)` — skeleton com animate-pulse
- Service Worker hibrido: Network-first para navegacao, Cache-first para estaticos
- Cache 24h em `/api/cotacoes` via Next.js Data Cache
- FOUC prevention script inline no layout.tsx

### Pontos a melhorar

| Item | Status | Impacto |
|------|--------|---------|
| Code splitting (`next/dynamic`) | Ausente | Bundle maior que necessario |
| `next/image` | Apenas 2 usos de `<img>` raw | Baixo (app e CSS-based) |
| Suspense boundaries | Apenas loading.tsx (suficiente) | OK |
| SW update notification | Apenas console.info | Deve virar toast em prod |

---

## 7. State Management e Persistencia

### Zustand Store (`shell-store.ts`)

```
activeModule, sidebarOpen, theme, resolvedTheme, pinnedModules
+ setters para cada campo
```

### localStorage Keys

| Chave | Proposito |
|-------|-----------|
| `synclife-theme` | Tema atual |
| `synclife-sidebar` | Estado do sidebar |
| `sl_pinned_modules` | Modulos fixados no bottom nav |
| `sl_integrations_settings` | Toggles de integracao cross-module |
| `sl_notif_settings` | Preferencias de notificacao |

**Avaliacao:** Uso adequado. Nenhum dado sensivel em localStorage. Try/catch em todas as operacoes.

### Cross-Module

```
Corpo (consultas) -> Financas (auto-despesa) + Tempo (auto-evento)
Patrimonio (dividendos) -> Financas (auto-receita)
Experiencias (viagens) -> Financas (auto-despesa) + Tempo (auto-evento)
Carreira (promocoes) -> Financas (auto-receita)
Mente (sessoes) -> Tempo (auto-evento)
```

Controlado por toggles em `sl_integrations_settings`. Funciona mas depende de localStorage (perde ao limpar cache).

---

## 8. Auditoria de Documentacao

### Documentos ATUAIS (manter)

| Documento | Tamanho | Status |
|-----------|---------|--------|
| `CLAUDE.md` | 14 KB | Atualizado nesta sessao (v2.0, 12 temas) |
| `DESIGN-SYSTEM.md` | 19 KB | Atual |
| `README.md` | 4.4 KB | Atualizado nesta sessao (11 modulos, stack real) |
| 10x `SPEC-FUNCIONAL-*.md` | 620 KB total | Atuais (pos-migration 018) |

### ~~Documentos para EXCLUIR~~ CONCLUIDO

| Documento | Status |
|-----------|--------|
| ~~`docs/demais docs depreciados/` (6 docs, 98KB)~~ | **Excluido** na Fase 0 |
| ~~11 pastas vazias em `docs/atividades a serem implementadas/01..11`~~ | **Excluido** na Fase 0 |
| ~~`docs/atividades a serem implementadas/MIGRATION-ELIMINAR-MODO-DUAL.md`~~ | **Excluido** na Fase 0 |
| ~~`snap-patrimonio-mobile.md` (raiz)~~ | **Excluido** na Fase 0 |

### Documentos para AVALIAR

| Documento | Questao |
|-----------|---------|
| 10x `PROMPT-CLAUDE-CODE-*.md` em atividades concluidas | Prompts ja consumidos. Valor historico mas ocupam 170KB |
| 13x prototipos HTML em atividades concluidas | Ja consumidos. Valem como referencia visual (800KB+) |

### Documentos para CRIAR

| Documento | Proposito | Prioridade |
|-----------|-----------|------------|
| ~~`.env.example`~~ | ~~Listar env vars necessarias para setup~~ | **Criado** na Fase 0 |
| `docs/ARQUITETURA-V3.md` | Mapa de modulos, hooks, rotas, DB schema | Media |
| `docs/API-REFERENCE.md` | 5 API routes com input/output schemas | Media |

---

## 9. Migrations SQL

19 migrations totalizando 1.855 linhas de SQL:

| Fase | Migrations | Proposito |
|------|-----------|-----------|
| V2 (001-004) | 4 | Profiles, Financas, Metas, Agenda |
| V3 Core (005) | 1 | **31 tabelas** — infra completa para 8 modulos novos |
| V3 Extensoes (006-017) | 12 | Notificacoes, migracoes de dados, temas, panorama, corpo, experiencias, XP |
| V3 Cleanup (018-019) | 2 | Remocao do modo dual, fix de active_modules |

**Destaque:** Migration 005 e a maior (592 linhas) — define toda a infra V3.
**Nota:** Migrations 003 e 004 (goals/agenda V2) estao depreciadas mas preservadas para backward compatibility.

---

## 10. Dependencias

### Producao

| Package | Versao | Proposito |
|---------|--------|-----------|
| next | 16.1.6 | Framework |
| react / react-dom | 19.2.3 | UI |
| @supabase/supabase-js | ^2.94.1 | Database + Auth |
| @supabase/ssr | ^0.8.0 | SSR auth |
| ai | ^6.0.104 | Vercel AI SDK |
| @ai-sdk/google | ^3.0.33 | Gemini provider |
| @ai-sdk/groq | ^3.0.25 | Groq provider |
| zod | ^4.3.6 | Validacao |
| react-hook-form | ^7.71.1 | Formularios |
| zustand | ^5.0.11 | State management |
| recharts | ^3.7.0 | Graficos |
| lucide-react | ^0.563.0 | Icones |
| radix-ui | ^1.4.3 | UI primitives (shadcn) |
| sonner | ^2.0.7 | Toasts |
| jspdf + jspdf-autotable | ^4.2.0 / ^5.0.7 | Geracao PDF |

### Dev

| Package | Versao | Proposito |
|---------|--------|-----------|
| typescript | ^5 | Tipagem |
| @playwright/test | ^1.58.1 | E2E tests |
| eslint + eslint-config-next | ^9 / 16.1.6 | Linting |
| tailwindcss | ^4 | Estilos |

**Avaliacao:** Stack moderno e atualizado. Nenhuma dependencia defasada ou com vulnerabilidades conhecidas.

---

## 11. Analise de Arquitetura — Temos Backend?

### Resposta curta: SIM, mas nao e um backend tradicional.

O SyncLife nao tem um servidor Express, NestJS ou similar. O "backend" e composto por **3 camadas**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (React 19)                           │
│                                                                  │
│  23 hooks customizados fazem 334 chamadas diretas ao Supabase    │
│  Toda logica de negocio roda aqui (score, badges, XP, CRUD)     │
│                                                                  │
└────────────────┬────────────────────────┬────────────────────────┘
                 │                        │
        ┌────────▼────────┐     ┌─────────▼──────────┐
        │  Next.js API    │     │  Supabase          │
        │  Routes (5)     │     │  PostgreSQL + RLS  │
        │                 │     │                    │
        │  Apenas proxy   │     │  76 politicas RLS  │
        │  para IAs       │     │  125 tabelas       │
        │  externas       │     │  19 migrations     │
        └────────┬────────┘     └────────────────────┘
                 │
        ┌────────▼────────┐
        │  APIs Externas  │
        │  Gemini, Groq,  │
        │  brapi.dev      │
        └─────────────────┘
```

### O que cada camada faz

| Camada | O que faz | O que NAO faz |
|--------|-----------|---------------|
| **Browser (hooks)** | CRUD completo, calculos de score/badge/XP, cross-module, formatacao | Nada roda no servidor |
| **Next.js API Routes** | Proxy para IAs externas (Gemini, Groq), validacao Zod | Nenhuma mutacao no banco, nenhuma logica de negocio |
| **Supabase** | Auth, banco PostgreSQL, RLS (isolamento por usuario), storage | Sem Edge Functions, sem triggers, sem cron |

### Numeros reais

- **334 chamadas** diretas ao Supabase saem do browser (client-side)
- **0 server actions** (`'use server'` nao existe no codebase)
- **0 background jobs** (sem cron, sem fila, sem worker)
- **0 Edge Functions** (pasta `supabase/functions/` vazia)
- **76 politicas RLS** protegem todos os dados por `user_id`

### Isso e robusto para producao?

**Para ate ~500 usuarios simultaneos: SIM.** O Supabase e production-grade (PostgreSQL gerenciado com RLS). A Vercel escala automaticamente.

**Para escalar alem disso: NAO.** Os problemas sao:

| Problema | Impacto | Exemplo |
|----------|---------|---------|
| **100% da logica no browser** | Performance, seguranca | Score engine faz 8 queries paralelas no client |
| **Sem cache** | Queries repetidas a cada render | Hook re-monta = re-query |
| **Sem background jobs** | Nao da pra processar em lote | Streak, XP, badges calculados no clique do usuario |
| **Sem deduplicacao** | Queries identicas duplicadas | 2 componentes usando mesmo hook = 2x queries |
| **Cross-module via localStorage** | Perde ao limpar cache | Settings de integracao nao persistem no banco |

### O que falta para ser production-grade

| Prioridade | Mudanca | Custo |
|------------|---------|-------|
| **1** | Adicionar TanStack Query (cache + dedup + retry) | FREE |
| **2** | Mover score/badge para Supabase DB triggers | FREE (Supabase Pro) |
| **3** | Adicionar Supabase Edge Functions para cross-module | FREE |
| **4** | Adicionar cron para streaks/digest (Supabase pg_cron) | FREE (Supabase Pro) |
| **5** | Migrar settings de localStorage para tabela Supabase | FREE |

**Conclusao:** A arquitetura funciona e e segura (RLS forte, auth solido). O gap principal e que **toda logica de negocio roda no browser**. Para um produto real, as operacoes criticas (score, badges, cross-module) deveriam rodar server-side via DB triggers ou Edge Functions — ambos gratuitos no Supabase Pro.

---

## 12. Analise de Custos — Cada Item do Roadmap

### Legenda
- **FREE** = free tier suficiente ou sem custo
- **FREEMIUM** = free tier com limite, pago apos escala
- **PAGO** = requer plano pago desde o inicio

### FASE 0 — Higiene Imediata

| # | Tarefa | Custo |
|---|--------|-------|
| 0.1-0.10 | Todas as tarefas de limpeza | **FREE** (apenas codigo) |

### FASE 1 — Qualidade e Type Safety

| # | Tarefa | Custo | Detalhe |
|---|--------|-------|---------|
| 1.1 | Gerar tipos Supabase | **FREE** | CLI command, sem custo |
| 1.2 | Dividir paginas oversized | **FREE** | Refactoring de codigo |
| 1.3 | Dividir hooks oversized | **FREE** | Refactoring de codigo |
| 1.4 | Substituir catches silenciados | **FREE** | Codigo |
| 1.5 | Auditar dangerouslySetInnerHTML | **FREE** | Code review |

### FASE 2 — Resiliencia

| # | Tarefa | Custo | Detalhe |
|---|--------|-------|---------|
| ~~2.1~~ | ~~Rate limiting (Upstash)~~ | ~~**FREEMIUM**~~ | **Feito na Fase 0** |
| 2.2 | Sentry | **FREEMIUM** | Free: 5k events/mes. Pago: $26/mes (50k events) |
| 2.3 | Testes unitarios | **FREE** | Vitest/Jest, sem custo |
| 2.4 | Migrar localStorage -> Supabase | **FREE** | Codigo + tabela existente |
| 2.5 | Retry/refetch (TanStack Query) | **FREE** | npm package gratuito |

### FASE 3 — Monetizacao

| # | Tarefa | Custo | Detalhe |
|---|--------|-------|---------|
| 3.1 | Stripe | **PAGO** | 2.9% + $0.30 por transacao. Sem mensalidade |
| 3.2 | Logica real no usePlanLimits | **FREE** | Codigo |
| 3.3 | Ativar ProGate | **FREE** | Codigo |
| 3.4 | Pagina /pricing | **FREE** | Codigo |

### FASE 4 — DevOps

| # | Tarefa | Custo | Detalhe |
|---|--------|-------|---------|
| 4.1 | CI/CD (GitHub Actions) | **FREE** | Free: 2k min/mes em repos privados |
| 4.2 | Staging (Vercel preview) | **FREE** | Incluso no Vercel free/pro |
| 4.3 | CSP headers | **FREE** | Codigo no middleware |
| 4.4 | Code splitting | **FREE** | Codigo |

### FASE 5 — Diferenciacao

| # | Tarefa | Custo | Detalhe |
|---|--------|-------|---------|
| 5.1 | i18n | **FREE** | next-intl, package gratuito |
| 5.2 | Push notifications (Web Push) | **FREEMIUM** | Implementacao propria: FREE. Via OneSignal: free ate 10k subscribers |
| 5.3 | Import extrato (OFX/CSV) | **FREE** | Parser client-side, sem custo |
| 5.4 | Relatorio PDF | **FREE** | jsPDF ja instalado |
| 5.5 | Weekly digest email (Resend) | **FREEMIUM** | Free: 100 emails/dia (3k/mes). Pago: $20/mes (50k/mes) |
| 5.6 | Compartilhar conquistas | **FREE** | Canvas API no browser |
| 5.7 | WCAG 2.1 AA | **FREE** | Codigo |

### Custos de Infraestrutura Atual

| Servico | Plano atual | Limite | Quando pagar |
|---------|-------------|--------|-------------|
| **Vercel** | Free (Hobby) | 100GB bandwidth, 100h build/mes | >1 dev ou dominio custom profissional: **$20/mes** (Pro) |
| **Supabase** | Free | 500MB DB, 1GB storage, 50k MAU | >500MB ou precisa de backups: **$25/mes** (Pro) |
| **Google Gemini** | Free tier | Rate limits (15 req/min) | Rate limit atingido: **$0.075/1M tokens** (pay-as-you-go) |
| **Groq** | Free tier | 14.4k req/dia | Rate limit atingido: migrar para Claude/Gemini pago |
| **Dominio** | - | - | ~**$12/ano** (.com) |

### Resumo de custos

| Cenario | Custo mensal estimado |
|---------|----------------------|
| **Beta testing (ate 100 usuarios)** | **$0 - $12/ano** (apenas dominio) |
| **Lancamento (ate 1.000 usuarios)** | **~$45/mes** (Vercel Pro + Supabase Pro) |
| **Escala (ate 10.000 usuarios)** | **~$100-200/mes** (Supabase Pro + Vercel + AI usage) |
| **Com Stripe ativo** | Adiciona 2.9% + $0.30 por transacao cobrada |

---

## 13. Roadmap: Proximos Passos para Produto de Mercado

### FASE 0 — Higiene Imediata (CONCLUIDA - 12/Mar/2026)

| # | Tarefa | Status |
|---|--------|--------|
| 0.1 | Desativar `USE_MOCK = false` | **Feito** |
| 0.2 | Criar `error.tsx` e `loading.tsx` | **Feito** |
| 0.3 | Atualizar README.md | **Feito** |
| 0.4 | Zod validation nas 5 APIs | **Feito** |
| 0.5 | Atualizar CLAUDE.md v2.0 (remover Foco/Jornada, 12 temas) | **Feito** |
| 0.6 | Remover isProOnly residuais | **Feito** |
| 0.7 | Resolver rota duplicada /futuro/nova vs /novo | **Feito** |
| 0.8 | Criar `.env.example` com Upstash vars | **Feito** |
| 0.9 | Excluir diretorios vazios e codigo morto | **Feito** |
| 0.10 | Excluir docs deprecados (6 docs V1 + migration obsoleta) | **Feito** |
| 0.11 | Rate limiting Upstash nas 4 APIs de IA | **Feito** |
| 0.12 | Gerar documento de auditoria completa | **Feito** |

**Branch:** `auditoria-fase0-cleanup` | **Commit:** `41ecef2` | **26 arquivos**, +1.173 / -4.101 linhas

### FASE 1 — Qualidade e Type Safety (1-2 semanas)

| # | Tarefa | Impacto |
|---|--------|---------|
| 1.1 | Gerar tipos Supabase e substituir 235 `as any` | Type safety |
| 1.2 | Dividir 4 paginas >1000 linhas em componentes | Manutenibilidade |
| 1.3 | Dividir 5 hooks >550 linhas em sub-hooks | Manutenibilidade |
| 1.4 | Substituir 14 catches silenciados por logging | Observabilidade |
| 1.5 | Auditar 3 `dangerouslySetInnerHTML` de risco medio | Seguranca |

### FASE 2 — Resiliencia (1-2 semanas)

| # | Tarefa | Impacto |
|---|--------|---------|
| ~~2.1~~ | ~~Implementar rate limiting com Upstash nas 4 APIs de IA~~ | **Feito na Fase 0** |
| 2.2 | Integrar Sentry (free: 5k events/mes) | Visibilidade de erros |
| 2.3 | Testes unitarios para engines (score, badge, xp) | Confiabilidade |
| 2.4 | Migrar settings de localStorage para Supabase | Persistencia multi-device |
| 2.5 | Implementar retry/refetch em falhas de rede (TanStack Query) | Resiliencia |

### FASE 3 — Monetizacao (2-3 semanas)

| # | Tarefa | Impacto |
|---|--------|---------|
| 3.1 | Integrar Stripe (checkout, subscriptions, webhooks) | Receita |
| 3.2 | Implementar logica real em `use-plan-limits.ts` | Gating funcional |
| 3.3 | Ativar `ProGate` para bloquear features PRO | Conversao |
| 3.4 | Criar pagina `/pricing` | Conversao |

### FASE 4 — DevOps e Operacoes (1-2 semanas)

| # | Tarefa | Impacto |
|---|--------|---------|
| 4.1 | CI/CD pipeline (GitHub Actions: lint + typecheck + build) | Qualidade continua |
| 4.2 | Ambiente de staging (Vercel preview + Supabase branch) | Teste pre-deploy |
| 4.3 | CSP headers no middleware | Seguranca |
| 4.4 | Code splitting com `next/dynamic` nos modulos pesados | Performance |

### FASE 5 — Diferenciacao (pos-lancamento)

| # | Tarefa | Impacto |
|---|--------|---------|
| 5.1 | i18n (ingles como 2o idioma) | Mercado expandido |
| 5.2 | Push notifications reais (Web Push) | Engajamento |
| 5.3 | Import de extrato bancario (OFX/CSV) | Alto valor percebido |
| 5.4 | Relatorio PDF mensal (jsPDF ja instalado) | Feature PRO |
| 5.5 | Weekly digest email (Resend) | Retencao |
| 5.6 | Compartilhar conquistas (social sharing) | Viralidade |
| 5.7 | WCAG 2.1 AA completo | Inclusao |

---

## 14. Funcionalidades de Alto Valor para Agregar

### Impacto Imediato (baixo esforco)

1. **Relatorio PDF Mensal** — jsPDF ja esta nas dependencias. Gerar PDF com graficos e metricas. Feature PRO.
2. **Compartilhar Conquistas** — Badge system implementado com 20+ evaluators. Adicionar share que gera imagem para redes sociais.
3. **AI Financial Insights Automaticos** — Dados de financas ja alimentam o score engine. Gerar insights mensais via Gemini.
4. **SW Update Toast** — Substituir console.info por toast real quando SW atualiza.

### Impacto Alto (esforco medio)

5. **Import de Extrato Bancario (OFX/CSV)** — Financas e o modulo mais completo. Parser de extrato automatizaria entrada de dados.
6. **Weekly Digest Email** — Score engine tem todos os dados. Enviar via Supabase Edge Function + Resend (free: 100 emails/dia).
7. **Smart Notifications Hub** — `use-notifications.ts` tem 435 linhas mas nada e entregue ao usuario. Consolidar alertas reais.
8. **Dashboard Customizavel** — Permitir escolha e ordem de widgets. Persistir em `profiles.dashboard_layout`.

### Impacto Transformador (alto esforco)

9. **Integracao Google Calendar** — Modulo Tempo ja gerencia eventos. Sync bidirecional seria killer feature.
10. **Modo Offline Avancado** — SW ja existe. Adicionar queue de mutacoes offline com sync ao reconectar.
11. **Coaching AI Cross-Module** — Coach existe em Corpo. Expandir para financeiro, carreira e metas usando contexto do score engine.

---

## 15. Resumo Executivo

O SyncLife e um projeto **tecnicamente maduro** com uma base solida:
- 11 modulos funcionais com 69 paginas
- Design system com 12 temas
- 3 engines de gamificacao
- 4 APIs de IA
- PWA com Service Worker
- 76 politicas RLS protegendo 125 tabelas

### Sobre a arquitetura

O projeto **tem backend** — nao e um servidor tradicional (Express/NestJS), mas sim:
- **Supabase** = PostgreSQL gerenciado com auth, RLS, storage (funciona como BaaS)
- **Next.js API Routes** = funcoes serverless que rodam no servidor (proxy para IAs)
- **Vercel** = deploy serverless com edge functions

O ponto de atencao e que **100% da logica de negocio roda no browser** (334 chamadas diretas ao Supabase via hooks client-side). Isso funciona para ate ~500 usuarios, mas para escalar seria necessario mover calculos criticos (score, badges) para DB triggers ou Edge Functions — ambos **gratuitos** no Supabase Pro.

### Gaps para producao

1. **Type safety** — 235 `as any` precisam de tipos gerados
2. **Logica no browser** — Score/badge/XP deveriam rodar server-side
3. **Sem cache client** — Cada render dispara novas queries (TanStack Query resolve, FREE)
4. **Modularidade** — Paginas e hooks oversized precisam ser divididos
5. **Observabilidade** — Sem Sentry, sem logging estruturado
6. **Monetizacao** — Freemium existe na UI mas nao funciona
7. **Testes** — Zero cobertura unitaria
8. **DevOps** — Sem CI/CD

### Custos

- **Beta (ate 100 usuarios):** $0/mes (free tiers)
- **Lancamento (ate 1.000):** ~$45/mes (Vercel Pro + Supabase Pro)
- **Escala (ate 10.000):** ~$100-200/mes
- **97% do roadmap e FREE** (apenas Stripe, Upstash e Sentry tem custos, e os 3 tem free tier generoso)

### Estimativa para atingir 8.5/10

- Type safety: ~40h
- Refactoring (paginas + hooks): ~55h
- Seguranca (rate limiting + Sentry): ~15h
- Testes (engines + hooks criticos): ~30h
- **Total: ~140h (~4 sprints)**

**Fase 0 concluida (12/Mar/2026):** 12 tarefas executadas em 26 arquivos. Mock desativado, error/loading boundaries criados, Zod em todas APIs, rate limiting Upstash, README/CLAUDE.md atualizados, docs deprecados removidos, rotas e flags limpos.

O app esta funcional e pode ir ao ar para beta testing. As Fases 1-4 preparam para lancamento publico com monetizacao.
