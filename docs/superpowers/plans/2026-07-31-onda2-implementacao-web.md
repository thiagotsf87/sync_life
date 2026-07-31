# Onda 2 · lote 1 · Implementação em web/: Diário + chrome v5 + camada do coach — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar em `web/` os protótipos APROVADOS da Onda 2 lote 1: rota `/dashboard` vira o **Diário v5** (route group novo `(app-v5)` com chrome v5: bar + ticker + modbar + camada do coach), com dados REAIS (score engine, orçamentos, agenda, recorrentes, metas, streak/badges), check-in persistido e briefing do coach cacheado 1×/dia.

**Architecture:** Segue as convenções das Ondas 0-1: CSS escopado sob `.v5` (wrapper `<div className="v5 dk">`), tokens em `styles/tokens-v5.css` via `var(--gro/--int/--hand)`, page.tsx server fino + componente client, classes `v5-scroll v5-dark` no `<html>` via boot hook. O Diário é **árvore ÚNICA responsiva** (mesmos blocos do desktop compactados <1024px, padrão auth da Onda 1; os dois protótipos são a fonte de identidade). `(app-v5)/layout.tsx` faz o guard de auth/onboarding SEM montar o shell v3; `/dashboard/review` e `/dashboard/score` FICAM no `(app)` v3 (lote 2). Backend puxado da Onda 3 (mínimo honesto): migration `027` com `coach_briefs` (cache do brief) + `daily_checkins`, e rota `/api/ai/diario-brief` (Gemini prose + cache + fallback determinístico com os números reais). Camada do coach conversa via `/api/ai/coach-thread` existente (stateless; persistência = Onda 3). Cartão "Ação executada" NÃO entra no app real (era visual do N3 no protótipo).

**Tech Stack:** Next.js 16 App Router · React 19 · TS strict · Supabase SSR · Vercel AI SDK (`generateObject` Gemini 2.5 Flash) · hooks v3 existentes · CSS puro escopado (sem Tailwind nas telas v5).

**Fontes de verdade:** protótipos `prototypes/v5/app/diario.html` + `diario.mobile.html` (identidade visual, LEI) · spec `docs/superpowers/specs/2026-07-31-coach-diario-v5-design.md` · `DESIGN-SYSTEM-v5.md` §6.1/6.2/6.4 · exploração consolidada abaixo.

**Decisões de escopo (registradas):**
1. **Puxado da Onda 3 pra cá:** `coach_briefs` + `daily_checkins` (migration) e o brief prose com cache. Sem isso a folha e o check-in seriam fake, violando a regra de entrega. N2 (thread persistida + fontes citadas) e vista cheia `/coach` continuam na Onda 3.
2. Cartão "Ação executada" fica FORA do app (N3 = sprint próprio). A camada real tem: vazio (saudação + chips), conversa streaming, typing.
3. Link `Conversa completa →` renderiza (identidade) mas não navega (aria-disabled + preventDefault); Onda 3 cria `/coach`.
4. `Revisão semanal` do bar navega para `/dashboard/review` (v3, lote 2); selo "como melhorar →" navega para `/dashboard/score` (v3).
5. Modbar numera 01-08 para as rotas v3 existentes (`/financas` etc.) — módulos migram onda a onda.

---

## Contexto consolidado (da exploração; NÃO re-explorar)

- **Escopo v5:** wrapper `<div className="v5">`; dark = `.dk` na subárvore. `styles/tokens-v5.css` define `--bg/--s1/--s2/--line/--line-h/--t1/--t2/--t3/--roxo/--roxo-h/--ele/--coral/--gro/--int/--hand` sob `.v5` e re-declara sob `.v5 .dk`. Fundo do body: `v5.css` tem `html.v5-scroll body{background:#f4f4f4}` e `html.v5-scroll.v5-dark body{background:#151313}`; boot que adiciona classes: `components/auth-v5/chrome.tsx` (`useAuthBoot`).
- **Fontes:** `app/layout.tsx` carrega Inter(400;500;600, `--font-inter`), Caveat(600;700, `--font-caveat`), Space_Grotesk(500;600;700, `--font-space-grotesk`) — **falta o peso 400 do Space Grotesk** (usado em `.metas .sub` etc.).
- **Padrão de tela:** page.tsx server fino (metadata + `<Componente/>`); componente `'use client'` importa `@/styles/tokens-v5.css`, `@/styles/v5.css` e o css da tela.
- **Middleware:** `/dashboard` já está na allowlist protegida; login redireciona pra `/dashboard`.
- **(app)/layout.tsx v3:** getUser → redirect /login; profile.onboarding_completed → redirect /onboarding; monta `NewAppShell` (QueryProvider + ModuleBar/Sidebar/TopHeader + tema `data-theme` no html). `(app-v5)` replica o guard SEM o shell. QueryProvider importável de `@/components/providers/query-provider` (conferir path exato ao implementar; é o usado por `AppShell.tsx`).
- **Gotcha de tema (handoff s19):** tela v5 após navegar app v3 herda `data-theme` no html — inofensivo pros tokens `.v5`, mas o BODY background precisa vir de `html.v5-scroll.v5-dark` (boot adiciona/remove).
- **Dados reais:**
  - Score: `useScoreEngine()` → `result.total`, `result.modules: {module, score, weight}[]` (8 dims, keys `financas|futuro|tempo|corpo|mente|patrimonio|carreira|experiencias`). Delta: `useLifeScore()` (`hooks/use-panorama.ts`) → `{ score, history, delta, deltaWeek }` de `life_sync_scores` (colunas por dim: `financas_score`…`experiencias_score`, `recorded_date`). Tendência por dim = atual − linha de ~7 dias atrás no `history`.
  - Números do mês: `useBudgets({month,year})` → `receitasMes`, `totalDespesas` (+ `budgets[]` com `pct/gasto/amount/category`); saldo = receitas−despesas; poupança% = saldo/receitas.
  - Hoje: `useAgenda({mode:'week', referenceDate})` → `events[]` (`date:'YYYY-MM-DD'`, `start_time`, `title`; filtrar `date === hoje local`); `useRecorrentes()` → `upcomingOccurrences[]` (`{name, amount, daysLeft, date}`).
  - Metas: `useMetas({status:'active'})` → `goals[]` (`name, target_amount, current_amount, target_date`) + `calcProgress`.
  - Atenção: montar manual (padrão v3): budgets `pct>85` danger / `70-85` warn; `upcomingOccurrences` com `daysLeft<=3`; streak.
  - Colofão: `useStreak()` (`use-panorama.ts`) → `streak.current_streak`; `useUserBadges()`/`useBadges()` (contagem leve) — conferir shapes em `use-panorama.ts`.
  - `profiles.active_modules: string[]` (keys tipo `financas`) já tipado em `types/database.ts`.
  - Ordem canônica área→número: 01 financas · 02 futuro · 03 tempo · 04 corpo · 05 mente · 06 patrimonio · 07 carreira · 08 experiencias.
- **Coach APIs:** `coach-thread` (Groq streaming, `{messages, moduleId}`); `coach-brief` (hero de módulo, NÃO serve pra folha); `lib/coach/context.ts` com `buildModuleContext` (panorama hoje = só finanças) e `MODULE_PERSONA`; `lib/rate-limit.ts` `checkRateLimit`. Client hook existente: `hooks/use-coach.ts` (conferir; se não servir, fetch direto).
- **Migrations:** última = `026_profile_v3_columns.sql`; padrão RLS = `ENABLE ROW LEVEL SECURITY` + policy `FOR ALL USING (auth.uid() = user_id) WITH CHECK (...)`; `types/database.ts` é manual.
- **QA de identidade (procedimento do programa):** `npm run build` + `next start -p 3006` (matar listener stale por PID; nunca reusar server velho pós-build), protótipos em `python -m http.server 8123` na pasta `prototypes/v5`; comparar âncoras/tipografia/espacamentos e console 0. Login de QA: `admin@synclife.dev` (senha nos env de `web/.env.local`; NUNCA colar senha no transcript — usar o truque do arquivo temp). Playwright MCP bloqueia `file://`; NUNCA curl. **Não rodar QA de interação em paralelo com `npm run build`** (browser do Playwright morre).

## Regras herdadas (todas as tasks)

- Branch `poc/ds-v5`. Commit por task, só os arquivos da task, trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- TS strict sem `any` novo; zod em body de POST; sem `console.log`; imports `@/`; sem em-dash em copy; sem emoji; `R$` com NBSP nos literais de UI; Caveat só voz do coach; telas v5 NUNCA importam componentes estilizados v3 (hooks de dados PODEM).
- CSS: tudo sob `.v5 `; keyframes prefixados (`v5d-`); `var(--gro/--int/--hand)`; NUNCA fonte por nome literal primeiro.
- Client components: `'use client'`; nada de `Math.random` em render (hydration).
- Terminal: CWD pode estar na raiz do repo; paths git relativos à raiz (`web/src/...`). Usar Bash pra git/node.

## Estrutura de arquivos (resultado)

```
web/supabase/migrations/027_diario_v5.sql                 ← T1
web/src/types/database.ts                                 ← T1 (+2 tabelas)
web/src/styles/app-v5.css                                 ← T2 (porte do shared/app.css sob .v5)
web/src/app/layout.tsx                                    ← T2 (Space Grotesk +400)
web/src/lib/coach/context.ts                              ← T3 (contexto panorama enriquecido)
web/src/app/api/ai/diario-brief/route.ts                  ← T3
web/src/hooks/use-checkin.ts                              ← T4
web/src/hooks/use-diario.ts                               ← T4
web/src/hooks/use-diario-brief.ts                         ← T4
web/src/app/(app-v5)/layout.tsx                           ← T5
web/src/components/app-v5/AppV5Boot.tsx                   ← T5
web/src/components/app-v5/ChromeV5.tsx                    ← T5
web/src/components/app-v5/CamadaCoach.tsx                 ← T5
web/src/components/app-v5/chrome-v5.css                   ← T5
web/src/components/app-v5/DiarioV5.tsx                    ← T6
web/src/components/app-v5/diario-v5.css                   ← T6
web/src/app/(app-v5)/dashboard/page.tsx                   ← T6
web/src/app/(app)/dashboard/page.tsx                      ← T6 (DELETADO; review/ e score/ FICAM)
prototypes/v5/index.html + docs/handoff/HANDOFF-v5.md     ← T8
```

---

### Task 1: Migration 027 + tipos

**Files:** Create `web/supabase/migrations/027_diario_v5.sql` · Modify `web/src/types/database.ts`

- [ ] **Step 1: Escrever a migration**

```sql
-- 027_diario_v5.sql — Onda 2 lote 1: cache do brief do coach + check-in diário (spec 2026-07-31-coach-diario-v5-design.md)

CREATE TABLE coach_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brief_date DATE NOT NULL,
  module_id TEXT NOT NULL DEFAULT 'diario',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, brief_date, module_id)
);
ALTER TABLE coach_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own coach briefs"
  ON coach_briefs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own daily checkins"
  ON daily_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Tipos em `types/database.ts`** — adicionar `coach_briefs` e `daily_checkins` no padrão Row/Insert/Update do arquivo (payload: `Json`; mood: `number`; note: `string | null`). Seguir o estilo manual existente.

- [ ] **Step 3: Aplicar a migration no banco do ambiente** — usar a tool MCP do Supabase (`apply_migration`) no projeto que `web/.env.local` aponta (aditiva: só cria 2 tabelas novas; NÃO toca em nada existente). Se o MCP não alcançar o projeto, reportar BLOCKED com o SQL pronto (o código das tasks seguintes degrada com tabela ausente, mas o QA da T7 exige as tabelas).

- [ ] **Step 4: Commit** — `git add web/supabase/migrations/027_diario_v5.sql web/src/types/database.ts` + `feat(v5): migration 027 - coach_briefs + daily_checkins (diario, onda 2)`.

---

### Task 2: styles/app-v5.css + peso 400 do Space Grotesk

**Files:** Create `web/src/styles/app-v5.css` · Modify `web/src/app/layout.tsx`

- [ ] **Step 1:** Portar `prototypes/v5/shared/app.css` (estado atual, commit 73b3fd4) para `web/src/styles/app-v5.css` com TODAS as regras prefixadas por `.v5 ` (ex.: `.v5 .bar{...}`, `.v5 .lt{...}`, `.v5 [hidden]{display:none!important}`, `.v5 .camada.sheet{...}`); keyframes renomeados com prefixo `v5d-` (`sl-mqtk`→`v5d-mqtk`, `sl-tdot`→`v5d-tdot`) e referências atualizadas; `html{-webkit-tap-highlight-color:transparent}` vira `.v5{-webkit-tap-highlight-color:transparent}`. A media query `(max-width:960px)` do `.bar .date` vira `(max-width:1023px)` (breakpoint único v5 = 1024, padrão das ondas 0-1). Manter o comentário de cabeçalho citando a fonte.
- [ ] **Step 2:** Em `app/layout.tsx`, adicionar `"400"` aos weights do `Space_Grotesk`.
- [ ] **Step 3:** Commit — `feat(v5): styles do chrome do app sob .v5 (porte do shared/app.css) + Space Grotesk 400`.

---

### Task 3: contexto panorama enriquecido + /api/ai/diario-brief

**Files:** Modify `web/src/lib/coach/context.ts` · Create `web/src/app/api/ai/diario-brief/route.ts`

- [ ] **Step 1: Enriquecer `buildModuleContext` para `panorama`** — além de `financas: summarizeFinancas(txs)`, incluir (queries agregadas leves, mesmo padrão do arquivo): `score` (última linha de `life_sync_scores`: total + por dim + recorded_date), `orcamentos` (top 3 por pct: `{category, gasto, limite, pct}`), `contas` (próximas 3 de `recurring_transactions` via cálculo simples de próximo vencimento OU omitir se complexo — preferir simples: nome/valor/day_of_month), `metas` (até 3 goals ativos: nome/atual/alvo/prazo), `checkin_ontem` (linha de `daily_checkins` de ontem, se houver: mood/note). Tipar o retorno (sem `any`). Falha de qualquer query = campo omitido (try/catch por bloco), nunca 500.
- [ ] **Step 2: Rota `diario-brief`** — POST, padrão das rotas irmãs (auth 401, env 503, rate limit 429, zod 400, captureApiError 500):

```ts
const InputSchema = z.object({ period: z.string().min(1).max(40) })

const BriefSchema = z.object({
  headline: z.string(),                 // frase editorial do dia
  p1: z.string(),                       // parágrafo com números do mês
  p2: z.string(),                       // parágrafo do resto da vida
  hand: z.string(),                     // rabisco curto do coach (1 linha, tom leve)
  recs: z.array(z.object({ title: z.string(), detail: z.string() })).length(3),
  basedOn: z.string(),                  // "34 transações, 6 orçamentos e 3 metas"
})
```

Fluxo: (1) `today = date local America/Sao_Paulo` (YYYY-MM-DD); (2) SELECT em `coach_briefs` por `(user_id, today, 'diario')` → cache hit devolve `{...payload, generatedAt: created_at, cached: true}`; (3) miss: `buildModuleContext(supabase, user.id, 'panorama')` → `generateObject` (gemini-2.5-flash, persona panorama + regras: prosa pt-BR, você, sem em-dash, números REAIS do contexto apenas, nunca cobrar check-in perdido) → sanitizar strings (reutilizar o padrão `clean()` do coach-brief) → INSERT em `coach_briefs` (ignorar erro de INSERT: cache é best-effort) → devolver. (4) **Fallback determinístico**: se `GOOGLE_GENERATIVE_AI_API_KEY` ausente OU `generateObject` falhar, montar o brief LOCALMENTE com template fixo usando os números do contexto (ex.: headline com maior tensão de orçamento, p1 com receitas/despesas/poupança, recs derivadas de orçamento>85 / conta próxima / meta mais perto do alvo) e marcar `fallback: true` — NUNCA 500 por falha de IA, NUNCA números inventados.
- [ ] **Step 3:** `npx tsc --noEmit` (em `web/`) limpo nos arquivos tocados.
- [ ] **Step 4:** Commit — `feat(v5): /api/ai/diario-brief com cache diario em coach_briefs + contexto panorama rico`.

---

### Task 4: hooks use-checkin / use-diario-brief / use-diario

**Files:** Create `web/src/hooks/use-checkin.ts`, `web/src/hooks/use-diario-brief.ts`, `web/src/hooks/use-diario.ts`

- [ ] **Step 1: `use-checkin.ts`** — client hook: lê o check-in de HOJE (`daily_checkins`, date local) e expõe `{ checkin: {mood, note, created_at} | null, loading, save(mood: 1-5, note?: string) }`; `save` faz upsert `onConflict: 'user_id,checkin_date'` e atualiza estado local. Moods na UI: 1 Péssimo · 2 Ruim · 3 Neutro · 4 Bem · 5 Ótimo (exportar `MOOD_LABELS`). Erro de tabela ausente → `{ checkin: null, unavailable: true }` (UI esconde a banda sem quebrar).
- [ ] **Step 2: `use-diario-brief.ts`** — fetch POST `/api/ai/diario-brief` com `{period}` no mount (uma vez; sem retry agressivo), estado `{ brief, loading, error }`. `period` ex.: `"julho 2026"` derivado da data local.
- [ ] **Step 3: `use-diario.ts`** — composição client dos hooks v3 (SEM lógica nova de negócio; só agregação):
  - `score`: `useScoreEngine().result` + `useLifeScore()` → `{ total, deltaWeek, label }`.
  - `nums`: de `useBudgets(mes atual)` → `{ receitas, despesas, saldo, poupancaPct }`.
  - `hoje`: merge ordenado de eventos de hoje (`useAgenda`) + `upcomingOccurrences` com `daysLeft<=7` (limit 6 itens; shape `{t, tx, tag?, due?, money?}` — `due = daysLeft<=3`).
  - `areas`: das 8 dims canônicas com `n/nome/score/tendencia` (score de `result.modules`; tendência = atual − valor da linha ~7 dias atrás do `history` de `useLifeScore`, arredondado; 0 = "–"), divididas em `ativas` (via `profiles.active_modules` — ler junto do score engine ou query própria leve) e `outras`. Metadado por área: usar dado disponível barato (financas: saldo+orçamento mais tenso; futuro: X metas · média%; demais: `score` apenas se não houver fonte barata — NÃO inventar).
  - `atencao`: notas derivadas (budgets pct>70 com cor por faixa, contas daysLeft<=3, streak) limit 4.
  - `metas`: top 3 goals ativos com `%` (`calcProgress`), valores fmt e prazo.
  - `colofao`: `{ projecao (saldo atual como proxy honesto: rotular "saldo do mês"), streakDias, badges: "x/y", ultimaSinc (recorded_date do score) }`.
  - Retorna também `ticker: string[]` (SCORE · POUPANÇA · orçamento mais tenso · próxima conta) e `loading` agregado.
  - Formato monetário: reutilizar `fmtBRL` de `@/lib/format/currency` MAS com NBSP (conferir se o helper já usa; se não, wrapper local `fmtV5` que troca o espaço pós-R$ por ` ` — não alterar o helper global do v3).
- [ ] **Step 4:** `npx tsc --noEmit` limpo. Commit — `feat(v5): hooks do Diario (checkin, brief, agregacao de dados reais)`.

---

### Task 5: (app-v5) layout + ChromeV5 + CamadaCoach

**Files:** Create `web/src/app/(app-v5)/layout.tsx`, `web/src/components/app-v5/{AppV5Boot.tsx, ChromeV5.tsx, CamadaCoach.tsx, chrome-v5.css}`

- [ ] **Step 1: `(app-v5)/layout.tsx`** (server) — replica o guard do `(app)/layout.tsx`: `createClient()` → `getUser()` (senão `redirect('/login')`); busca `profiles.onboarding_completed` (senão `redirect('/onboarding')`); NÃO monta shell v3; renderiza `<QueryProvider><AppV5Boot>{children}</AppV5Boot></QueryProvider>` (QueryProvider: mesmo import usado pelo `AppShell.tsx`).
- [ ] **Step 2: `AppV5Boot.tsx`** (client) — no mount adiciona `v5-scroll v5-dark` no `documentElement` e remove no cleanup (padrão `useAuthBoot` de `auth-v5/chrome.tsx`; reusar o hook se ele aceitar `{dark:true}`, senão replicar 6 linhas). Renderiza `<div className="v5 dk">{children}</div>` (raiz do escopo).
- [ ] **Step 3: `ChromeV5.tsx`** (client) — porta do protótipo (`diario.html` linhas do chrome): `.bar` (brand bússola SVG + `<span className="wm">Sync<em>Life</em></span>` + data local pt-BR + acts: Revisão semanal → `href="/dashboard/review"`, coach-pill (abre camada via prop/callback), `+ Nova entrada` → por ora `href="/financas"` (ação real de captura é das ondas dos módulos)); `.ticker` (recebe `items: string[]`, duplica 4× pra marquee; com `items` vazio renderiza banda vazia estável); `.modbar` (Diário ativo sem nº; 01-08 → `/financas /futuro /tempo /corpo /mente /patrimonio /carreira /experiencias`; Conquistas → `/conquistas`; Configurações → `/configuracoes`; sem Coach; `<Link>` do Next). Mobile (<1024px via CSS): bar 56px só brand + coach-pill "Coach" + `+`; data some (regra já em app-v5.css). SVGs da bússola: copiar do protótipo.
- [ ] **Step 4: `CamadaCoach.tsx`** (client) — estados: `open`, `messages: {role:'user'|'assistant', content}[]`, `streaming`. Markup do protótipo: scrim + aside `.camada` (+ `.sheet` via CSS <1024px? NÃO: variante sheet é por classe — aplicar `sheet` condicionalmente via matchMedia OU duas classes CSS: usar `matchMedia('(max-width:1023px)')` no mount, padrão v5). Header eyebrow `Coach · lendo: seu diário de hoje` + fechar; vazio = saudação + chips (props `suggestions: string[]` vindas do brief `recs[].title` ou fallback fixo); enviar/chip → POST `/api/ai/coach-thread` `{messages, moduleId:'panorama'}` lendo o stream de texto incremental (mesmo padrão do hook/consumidor existente de coach-thread no v4 — conferir `hooks/use-coach.ts` e reutilizar se aplicável); typing dots enquanto aguarda 1º chunk; erros → bolha do coach com mensagem curta ("Não consegui responder agora."). Askbar = form com input controlado; Esc/scrim fecham; abrir com `seed` preenche o input (desktop foca, sheet não). `Conversa completa →` com `aria-disabled` + preventDefault. SEM cartão Ação executada.
- [ ] **Step 5: `chrome-v5.css`** — CSS específico que o app-v5.css não cobre (ajustes de Link vs `<a>`, wm, coach-pill mobile), mínimo possível; tudo sob `.v5 `.
- [ ] **Step 6:** `tsc --noEmit` limpo. Commit — `feat(v5): chrome do app (bar/ticker/modbar) + camada do coach streaming`.

---

### Task 6: DiarioV5 + troca da rota /dashboard

**Files:** Create `web/src/components/app-v5/DiarioV5.tsx`, `diario-v5.css`, `web/src/app/(app-v5)/dashboard/page.tsx` · Delete `web/src/app/(app)/dashboard/page.tsx` (manter `review/` e `score/`!)

- [ ] **Step 1: `DiarioV5.tsx`** — árvore única responsiva, blocos na ordem da spec §4, portando markup/medidas dos DOIS protótipos (desktop base; `@media (max-width:1023px)` aplica a compaction do `diario.mobile.html`: masthead empilhado + selo faixa, folha 1 col, nums 2×2, dims 1 col, colofão coluna, paddings de toque ≥40px). Bind:
  - Masthead: eyebrow `Edição nº N · seu diário` (N = dias desde a criação da conta OU contagem de `life_sync_scores` — escolher o disponível barato e registrar no código), saudação por hora local (`Bom dia/Boa tarde/Boa noite, {preferred_name || full_name.split(' ')[0]}.`), sub = `brief.headline` (ou 1ª frase do p1 se headline for longa — decidir 1 e manter), selo = score real + `+N esta semana` (deltaWeek; delta 0 = "estável") + link score.
  - Folha `.lt`: `brief.p1/p2` (strongs: renderizar texto puro — SEM dangerouslySetInnerHTML; ênfases tipográficas ficam pra iteração futura), `.hand` = `brief.hand` (rotação fixa), assinatura = `Escrito às HH:MM, com base em {brief.basedOn}.` (hora de `generatedAt`); recs = `brief.recs` numeradas; ask = botão que abre a camada com seed. Estado loading: banda `.lt` com opacidade reduzida e linhas skeleton simples (CSS local, sem lib); `brief.fallback` não muda a UI.
  - Check-in: `use-checkin` — sem registro hoje = form (5 moods + nota + Registrar); com registro = linha `Registrado às HH:MM · {label} · "{note}"`; `unavailable` esconde a banda.
  - Hoje/Números/Suas áreas/Atenção/Metas/Colofão: dados do `use-diario`; Números com `.num` (count-up NÃO nesta fase: valores estáticos ao carregar — o count-up do protótipo era JS de protótipo; registrar como polish futuro em handoff); "Outras:" linha única; vazios honestos (sem eventos → "Nada na agenda de hoje."; sem metas → linha t3 "Sem metas ativas.").
  - Reveals `.rv/.boot`: replicar via CSS + IntersectionObserver local do componente (gate `prefers-reduced-motion`), padrão dos componentes v5 existentes (ver LandingVivaDesktop) — SEM GSAP.
- [ ] **Step 2: rota** — criar `(app-v5)/dashboard/page.tsx` (server fino: metadata `SyncLife · Diário` + render `<DiarioV5/>` passando props server se necessário → preferir tudo client via hooks, padrão v3 dashboard). DELETAR `(app)/dashboard/page.tsx`. NÃO tocar em `review/` e `score/`.
- [ ] **Step 3:** `npm run build` passa (conflito de rota = falha aqui); `tsc --noEmit` limpo; `npm run lint` sem erros novos.
- [ ] **Step 4:** Commit — `feat(v5): /dashboard vira o Diario v5 (dados reais + check-in + folha do coach)`.

---

### Task 7: QA de identidade + funcional (gate do programa)

- [ ] **Step 1:** `cd web && npm run build` (sem QA de browser em paralelo). Matar listeners stale das portas 3006/8123 por PID. `npx next start -p 3006` (background) + `python -m http.server 8123` em `prototypes/v5` (background).
- [ ] **Step 2 (identidade):** login com o usuário de QA (senha só via env/arquivo temp). Comparar `/dashboard` (3006) vs `app/diario.html?v=impl1` (8123) em 1440×900 e vs `diario.mobile.html` em 390×844: âncoras estruturais (bar 64/56, ticker, modbar, ordem dos 8 blocos, folha clara `.lt`, grid suas áreas), tipografia computada (família/peso/tamanho de masthead h1, `.num`, eyebrow), espaçamentos-chave. Conteúdo NUMÉRICO difere (dados reais) — identidade é estrutura/tipografia/cores/espaçamento. Screenshots de evidência (desktop full + mobile por segmentos).
- [ ] **Step 3 (funcional):** console 0 erros nas 2 viewports; camada abre (gatilho + ask com seed), pergunta real → resposta streaming do Groq (se 503 por env ausente, validar a bolha de erro graciosa e REGISTRAR no report); check-in salva → reload mantém colapsado; brief: 1ª carga gera (ou fallback), 2ª carga vem do cache (verificar 1 linha em `coach_briefs` via MCP/SQL); modbar navega pra `/financas` (v3 abre normal) e volta (tema v3 NÃO vaza pro body do Diário); `/dashboard/review` e `/dashboard/score` abrem no shell v3.
- [ ] **Step 4:** fixes do que reprovar + commit `fix(v5): QA de identidade do Diario` (só se houver). Matar servers ao final.

---

### Task 8: hub + handoff

- [ ] **Step 1:** `prototypes/v5/index.html`: linhas do Diário e da Camada na onda 02 → status `implementado` (vira `qa` só depois do aceite visual do usuário no app real, se o programa exigir — manter `implementado`).
- [ ] **Step 2:** `docs/handoff/HANDOFF-v5.md`: tabela (Onda 2 lote 1 implementada) + entrada datada: decisões de escopo 1-5 do header deste plano, arquivos criados, o que ficou pra Onda 3 (N2, vista cheia, fontes citadas, `Conversa completa`), polish futuro registrado (count-up, ênfases tipográficas no p1/p2, edição nº definitiva), dívidas a11y herdadas do protótipo (focus trap etc.), gotchas novos da implementação.
- [ ] **Step 3:** Commit — `docs(v5): handoff onda 2 lote 1 implementada em web/`.

## Fora deste plano

- Onda 3 (N2 thread persistida + fontes citadas + `/coach` vista cheia), N3 (ações), lote 2 (Review semanal, Life Score v5).
- Migração dos outros módulos pro `(app-v5)`.
- Aceite visual final do usuário no app real (gate humano do programa).
