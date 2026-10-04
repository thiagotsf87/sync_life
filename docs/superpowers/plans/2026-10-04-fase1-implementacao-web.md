# Fase 1 · Implementação em `web/`: Meu dia, Finanças hub, Sy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** colocar no ar, em `web/`, as 7 telas aprovadas da Fase 1 (Meu dia D, Finanças hub A, Life Score v2, Sua semana, arquivo da conversa, intenção composta, chrome mobile com bottom bar), com Sy real (briefing por gatilhos, conversa persistida com fontes, uma intenção composta de ponta a ponta), teste de identidade protótipo × rota em desktop e mobile, e as rotas v3 correspondentes deletadas.

**Architecture:** route group `(app-v5)` cresce módulo a módulo (URLs intactas); cada tela é um Server Component fino + componente client que agrega os hooks v3 reais (sem lógica de negócio nova fora de `lib/`); CSS do protótipo portado 1:1 para arquivos sob `.v5` (`styles/app-v5.css` para as peças compartilhadas da Fase 0, `components/app-v5/<tela>.css` para o específico); Sy = `lib/coach/context.ts` (pacote de contexto por área) + rotas em `/api/ai/*` e `/api/intencao/*` com Zod; dados novos em 2 migrations (`028_fase1_sy.sql`, `029_weekly_reviews_fix.sql`) aplicadas no projeto de homologação `bculmhmoxxpjlcilkgmp` (produção é `xmtzpjtbqhgwmebycxmx`, só com ok explícito do usuário).

**Tech Stack:** Next.js 16 App Router, React 19, TS strict, Supabase SSR (`as unknown as { from }` para schema drift), Vercel AI SDK (Gemini 2.5 Flash `generateObject`, Groq Llama 3.3 `streamText`), Zod, three.js (Enxame via `lib/v5`), Playwright (identidade), Vitest (lógica pura).

**Fontes de verdade:** protótipos em `prototypes/v5/app/` (`meu-dia-d*`, `financas-a*`, `life-score-v2*`, `sua-semana*`, `conversa*`, `_intencao*`), `prototypes/v5/shared/{app.css,lab.js,sy40.js,mock-data.js}`, `DESIGN-SYSTEM-v5.md` §6.1 a §6.4, spec `docs/superpowers/specs/2026-10-03-conceito-sem-metafora-design.md` §4.1 (gatilhos), §5 (pacote de contexto), §6.2 (intenção), plano de rollout §4 Fase 1. Mapa de dados reais: seção "Fontes de dados" abaixo (levantado em 2026-10-04).

---

## Fontes de dados reais (levantamento 2026-10-04, não reinventar)

| Tela | Hook / lib existente | Tabelas | Regra que não pode se perder |
|---|---|---|---|
| Meu dia | `useDiario()` (`hooks/use-diario.ts:149`) compõe `useScoreEngine`, `useLifeScore`, `useBudgets`, `useAgenda('week')`, `useRecorrentes`, `useMetas`, `useStreak`, `useUserBadges` | `life_sync_scores`, `budgets`, `transactions`, `agenda_events`, `recurring_transactions`, `goals`, `user_streaks`, `user_badges` | áreas inativas sem score (nunca 0 fabricado); `deltaWeek` só com ≥7 registros |
| Finanças hub | `useBudgets({month,year})` (`use-budgets.ts:63`), `useTransactions` (`:140`), `useRecorrentes` (`:180`), `usePlanejamento` (`use-planejamento.ts:235`) | `budgets`+`categories`, `transactions`, `recurring_transactions`, `planning_events`, `profiles.monthly_income` | `saldoMes = receitas − despesas`; `taxaPoupanca = round(saldo/receitas×100)`; **rollover** do limite (`use-budgets.ts:186-197`); só `is_future=false`; `calcNextOccurrence` → `daysLeft`; projeção = `usePlanejamento` (p .7 / r 1 / o 1.3) |
| Life Score | **`useScoreEngine`** (`use-score-engine.ts:517`, oficial) + `useLifeScore` (`use-panorama.ts:126`, histórico 30) | `life_sync_scores`, `profiles.active_modules` | pesos em `lib/score-utils.ts:23`, redistribuídos entre ativos; componentes por área em `use-score-engine.ts:47-423`; **`useLifeMap` NÃO** (média simples, sem persistência) |
| Sua semana | `useAgenda('week')`, `useFocusSessions('week')`, `useTransactions`, `useLifeScore`, `updateStreak` (`use-panorama.ts:219`), `addXP` (`use-xp.ts:20`) | `weekly_reviews` (schema real da 013: `week_start`, `week_end` NOT NULL, `data` JSONB, `completed_at`), `user_streaks`, `user_xp_log` | **bug atual:** `review/page.tsx:364` manda `score_gained` (não existe) e omite `week_end` → insert falha em silêncio; `addXP('review_completed')` (50) nunca é chamado |
| Conversa | `coach-thread` (stateless), `buildModuleContext` (só `financas` e `panorama`) | nova `coach_messages` | **bug:** `context.ts:155` seleciona `description` em `recurring_transactions`, coluna real é `name` |
| Intenção | tabelas da spec §6.2 | ver DDL abaixo | whitelist no servidor |

**DDL para a intenção (NOT NULL sem default e checks):**
- `recurring_transactions`: `user_id, name, amount>0, type in (income, expense), frequency in (weekly, biweekly, monthly, quarterly, annual), start_date`; `day_of_month 1..31`; `category_id` → `categories` (SET NULL).
- `agenda_events`: `user_id, title, date 'YYYY-MM-DD'`; `start_time/end_time 'HH:MM'`; `type` default `pessoal`; `recurrence` default `none`; `source` default `manual`; `goal_id` → `goals`.
- `goals`: `user_id (auth.users), name`; `goal_type in (monetary, habit)`; `status in (active, paused, completed, archived)`; defaults para valores.
- `study_tracks`: `user_id (profiles), name`; `category in (technology, languages, management, marketing, design, finance, health, exam, undergraduate, postgraduate, certification, other)`; `status` default `in_progress`; `target_date, cost, linked_skill_id`.
- `skills`: `user_id (profiles), name`; `category in (hard_skill, soft_skill, language, certification)`; junção `skill_study_tracks(skill_id, track_id)`.

---

## Mapa de arquivos

**Criar**
- `web/supabase/migrations/028_fase1_sy.sql` (coach_messages, intencoes, funções `aplicar_intencao`/`desfazer_intencao`)
- `web/supabase/migrations/029_weekly_reviews_fix.sql` (`week_end` com default, colunas `score_gained`, `data` garantidas)
- `web/src/styles/app-v5.css` (acrescentar a seção "Fase 0 · peças" e a bottom bar, portadas de `shared/app.css` sob `.v5`; `html.mob` vira `.v5 .mob` no root interno)
- `web/src/lib/v5/sy40.ts` (porte de `shared/sy40.js` para React: `useSy40(ref, estado)`)
- `web/src/lib/meu-dia/gatilhos.ts` + `gatilhos.test.ts` (critério §4.1, puro)
- `web/src/lib/meu-dia/margem.ts` + `margem.test.ts` (janela livre do dia a partir de `agenda_events`)
- `web/src/lib/meu-dia/laboratorio.ts` + `.test.ts` (cenários do jantar a partir de orçamento de lazer + evento de lazer de hoje)
- `web/src/hooks/use-meu-dia.ts` (agrega `useDiario` + margem + ritmo + gatilhos + laboratório)
- `web/src/components/app-v5/MeuDiaV5.tsx` + `meu-dia-v5.css`
- `web/src/components/app-v5/Sy40.tsx`
- `web/src/components/app-v5/Laboratorio.tsx`
- `web/src/components/app-v5/Ritmo.tsx`
- `web/src/components/app-v5/Presenca.tsx`
- `web/src/components/app-v5/BottomBar.tsx` + `SheetAreas.tsx`
- `web/src/components/app-v5/FinancasV5.tsx` + `financas-v5.css`
- `web/src/components/app-v5/LifeScoreV5.tsx` + `life-score-v5.css`
- `web/src/components/app-v5/SuaSemanaV5.tsx` + `sua-semana-v5.css`
- `web/src/components/app-v5/ConversaV5.tsx` + `conversa-v5.css`
- `web/src/components/app-v5/PropostaIntencao.tsx`
- `web/src/hooks/use-financas-v5.ts`, `use-life-score-v5.ts`, `use-sua-semana.ts`, `use-conversa.ts`, `use-intencao.ts`
- `web/src/app/(app-v5)/financas/page.tsx`, `(app-v5)/dashboard/score/page.tsx`, `(app-v5)/dashboard/review/page.tsx`, `(app-v5)/coach/page.tsx`
- `web/src/app/api/ai/intencao/route.ts`, `web/src/app/api/intencao/aplicar/route.ts`, `web/src/app/api/intencao/desfazer/route.ts`
- `web/src/lib/intencao/schemas.ts` (Zod por tabela) + `schemas.test.ts`
- `web/e2e/identidade-v5.spec.ts` + `web/scripts/identidade-v5.mjs` (captura protótipo × rota, diff por pixel)

**Modificar**
- `web/src/lib/coach/context.ts` (bug `description`→`name`; contextos `tempo`, `futuro`, `mente`, `carreira`; `fontes[]` no retorno)
- `web/src/app/api/ai/coach-thread/route.ts` (persistir em `coach_messages`; devolver fontes no header `x-sy-fontes`)
- `web/src/app/api/ai/diario-brief/route.ts` (schema do brief vira o de Meu dia: `fala`, `fontes`, `gatilhos`; cache mantido)
- `web/src/components/app-v5/ChromeV5.tsx` (sem ticker; "Meu dia"; "Fale com Sy"; bottom bar no mobile; modbar some no mobile)
- `web/src/components/app-v5/CamadaCoach.tsx` (eyebrow `Sy · lendo: …`; fontes `.meta`; cartão de proposta; `Conversa completa →` para `/coach`)
- `web/src/app/(app-v5)/dashboard/page.tsx` (renderiza `MeuDiaV5`)
- `web/src/hooks/use-diario.ts` (mantido; exportar `useDiario` como está)
- `web/next.config.ts` (redirects: `/corpo/coach` não é desta fase; nada aqui)

**Deletar (no fim, após identidade)**
- `web/src/app/(app)/dashboard/review/page.tsx`, `(app)/dashboard/score/page.tsx`, `(app)/coach/page.tsx`, `(app)/financas/page.tsx` (só o hub; subtelas ficam até a Fase 2)
- `web/src/components/app-v5/DiarioV5.tsx` + `diario-v5.css`
- `web/src/hooks/use-diario-brief.ts` (substituído por `use-meu-dia`), `web/src/app/dev/coach-specimens` (Fase 8, não agora)

---

## Ordem de execução (lotes com gate)

| Lote | Tarefas | Gate |
|---|---|---|
| **L0 Fundação** | 1, 2, 3 | `tsc` limpo; `/dashboard` atual continua renderizando |
| **L1 Dados e Sy** | 4, 5, 6, 7 | migrations aplicadas em homolog; `vitest` verde; `coach-thread` persiste |
| **L2 Meu dia** | 8, 9, 10, 11 | identidade `meu-dia-d` D+M |
| **L3 Finanças hub** | 12 | identidade `financas-a` D+M |
| **L4 Score e semana** | 13, 14 | identidade `life-score-v2`, `sua-semana` D+M; fechamento persiste |
| **L5 Conversa** | 15 | identidade `conversa` D+M; histórico real |
| **L6 Intenção** | 16, 17 | intenção cria e desfaz registros em homolog |
| **L7 Fechamento** | 18, 19 | rotas v3 deletadas; build limpo; handoff |

---

### Task 1: CSS compartilhado da Fase 0 portado para `.v5`

**Files:**
- Modify: `web/src/styles/app-v5.css`
- Reference: `prototypes/v5/shared/app.css` (seção "Fase 0 · peças do modelo sem metáfora" até o fim, inclusive o bloco `html.mob`)

- [ ] **Step 1: copiar a seção Fase 0 do shared** para o fim de `app-v5.css`, prefixando cada seletor com `.v5 ` e trocando `html.mob` por `.v5 .mob` (o root interno do `AppV5Boot` recebe `mob` quando `matchMedia('(max-width:1023px)')`; ver Task 3). Manter a ordem das regras (a cascata foi validada byte a byte nos protótipos). Keyframes ganham prefixo `v5d-`.
- [ ] **Step 2: remover o que saiu do modelo:** regras `.ticker` e `.lt` ficam (landing usa `.lt`? não: a landing tem CSS próprio; `.lt` em `app-v5.css` pode ser removido) → remover `.v5 .ticker*` e `.v5 .lt`.
- [ ] **Step 3: acrescentar a bottom bar** copiando o `<pre>` da seção `inert` de `prototypes/v5/app/_intencao.mobile.html` (`.bbar`, itens, `.sypill`, `.sy40` 34px, `.camada.sheet.areas`, `.arow/.asep`), sob `.v5 .mob`.
- [ ] **Step 4: verificar** `cd web && npx tsc --noEmit` (CSS não afeta) e `npm run build` sem erro de CSS. Abrir `/dashboard` em `next start -p 3006` e confirmar que o Diário atual ainda renderiza (a seção nova só adiciona seletores).
- [ ] **Step 5: commit** `style(v5): pecas da Fase 0 e bottom bar portadas para app-v5.css`

### Task 2: Enxame 40px como hook React

**Files:**
- Create: `web/src/lib/v5/sy40.ts`, `web/src/components/app-v5/Sy40.tsx`
- Reference: `prototypes/v5/shared/sy40.js`, `prototypes/v5/personagem/{enxame,vida}.js`, `web/src/lib/v5/` (como a landing já importa three)

- [ ] **Step 1:** criar `lib/v5/sy40.ts` exportando `montarSy40(canvas: HTMLCanvasElement, semente: number): { quadro(dt: number, estado: 'repouso'|'ouvindo'): void; destruir(): void }`, portando `criarEnxame` com o perfil `{ n: 190, tam: .7, compacto: .78, dpr: 3 }`. `vida.js`/`enxame.js` são ES modules sem tipos: copiar para `lib/v5/enxame/{vida,enxame}.ts` com `// @ts-nocheck` no topo (mesma técnica do `compass-gl.ts`), três via `import * as THREE from 'three'`.
- [ ] **Step 2:** `Sy40.tsx` (`'use client'`): `<span className="sy40" aria-hidden><canvas ref/></span>`; `useEffect` monta, roda `requestAnimationFrame` com `estado` vindo de prop (`repouso` default), respeita `prefersReduce()` (3 quadros e para), destrói no unmount. Prop `tamanho?: 40 | 34`.
- [ ] **Step 3: teste de fumaça** `web/src/components/app-v5/Sy40.test.tsx` com `renderToString(<Sy40/>)` contendo `class="sy40"` e um `<canvas`.
- [ ] **Step 4:** `npx vitest run src/components/app-v5/Sy40.test.tsx` → PASS. Commit `feat(v5): Sy40, o Enxame de 40px como componente`.

### Task 3: Chrome v5 sem revista + bottom bar mobile

**Files:**
- Modify: `web/src/components/app-v5/ChromeV5.tsx`, `AppV5Boot.tsx`, `chrome-v5.css`
- Create: `web/src/components/app-v5/BottomBar.tsx`, `SheetAreas.tsx`
- Reference: `prototypes/v5/app/financas-a.html` (bar/modbar), `_intencao.mobile.html` (bbar + sheet de áreas)

- [ ] **Step 1 `AppV5Boot`:** além de `anim`, pôr `mob` no root interno quando `matchMedia('(max-width:1023px)')` casar (listener de `change`). Sem JS: desktop.
- [ ] **Step 2 `ChromeV5`:** remover o ticker e a prop `ticker`; `.date` igual; ações: `Fale com Sy` (`coach-pill`, só `.d-only` no texto; no mobile a pílula do bar some) e `+ Registrar` (`/financas/transacoes`); modbar: `Meu dia` (ativo em `/dashboard*`), 01 a 08, Conquistas, Configurações; prop `ativo: 'meu-dia' | ModuleId`. Modbar recebe classe `d-only` (some no mobile).
- [ ] **Step 3 `BottomBar.tsx`:** 5 itens conforme `_intencao.mobile.html` (Meu dia · 01 Finanças · pílula `Fale com Sy` com `<Sy40 tamanho={34}/>` · Áreas · Registrar); `onCoachOpen`, `onAreasOpen`; `aria-current` no ativo. `SheetAreas.tsx`: `.camada.sheet.areas` com as 8 áreas (`useDiario().areas` para o score ao lado) + Conquistas + Configurações; fecha por scrim, X, Esc.
- [ ] **Step 4:** `ChromeV5` renderiza `<BottomBar/>` e `<SheetAreas/>` sempre (CSS esconde no desktop via `.v5:not(.mob)`); `main` ganha `padding-bottom` no mobile (regra já portada na Task 1).
- [ ] **Step 5:** `renderToString` smoke: `ChromeV5` contém `Fale com Sy`, `Meu dia`, não contém `ticker`, `Pergunte ao coach`, `Diário`. Commit `feat(v5): chrome sem ticker, Meu dia, bottom bar mobile`.

### Task 4: Migration 028 (coach_messages, intencoes, funções)

**Files:**
- Create: `web/supabase/migrations/028_fase1_sy.sql`

- [ ] **Step 1:** escrever:
```sql
-- 028_fase1_sy.sql — Fase 1: conversa persistida + intenção composta
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  module_id TEXT NOT NULL DEFAULT 'panorama',
  fontes JSONB NOT NULL DEFAULT '[]',
  kind TEXT NOT NULL DEFAULT 'mensagem' CHECK (kind IN ('mensagem','acao','intencao','nota')),
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coach_messages_user_day ON coach_messages (user_id, created_at DESC);
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach messages" ON coach_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS intencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('iniciar_curso')),
  proposta JSONB NOT NULL,
  caminho TEXT,
  aplicado JSONB NOT NULL DEFAULT '[]',   -- [{tabela, id, rotulo, href}]
  status TEXT NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto','aplicada','desfeita')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  aplicada_em TIMESTAMPTZ,
  desfeita_em TIMESTAMPTZ
);
ALTER TABLE intencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own intencoes" ON intencoes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- aplicar: recebe os registros já validados pelo servidor e insere tudo numa transação
CREATE OR REPLACE FUNCTION aplicar_intencao(p_intencao UUID, p_caminho TEXT, p_registros JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE r JSONB; novo UUID; feitos JSONB := '[]'::jsonb; uid UUID := auth.uid(); track UUID; skill UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM intencoes WHERE id = p_intencao AND user_id = uid AND status = 'em_aberto') THEN
    RAISE EXCEPTION 'intencao_invalida';
  END IF;
  FOR r IN SELECT * FROM jsonb_array_elements(p_registros) LOOP
    CASE r->>'tabela'
      WHEN 'study_tracks' THEN
        INSERT INTO study_tracks (user_id, name, category, target_date, cost)
        VALUES (uid, r->>'name', 'languages', (r->>'target_date')::date, (r->>'cost')::numeric) RETURNING id INTO novo; track := novo;
      WHEN 'skills' THEN
        INSERT INTO skills (user_id, name, category) VALUES (uid, r->>'name', 'language') RETURNING id INTO novo; skill := novo;
      WHEN 'recurring_transactions' THEN
        INSERT INTO recurring_transactions (user_id, name, amount, type, frequency, day_of_month, start_date)
        VALUES (uid, r->>'name', (r->>'amount')::numeric, 'expense', 'monthly', (r->>'day_of_month')::int, current_date) RETURNING id INTO novo;
      WHEN 'agenda_events' THEN
        INSERT INTO agenda_events (user_id, title, date, start_time, end_time, type, recurrence)
        VALUES (uid, r->>'title', r->>'date', r->>'start_time', r->>'end_time', 'estudo', 'weekly') RETURNING id INTO novo;
      WHEN 'goals' THEN
        INSERT INTO goals (user_id, name, goal_type, category, target_date)
        VALUES (uid, r->>'name', 'habit', 'aprendizado', (r->>'target_date')::date) RETURNING id INTO novo;
      ELSE RAISE EXCEPTION 'tabela_fora_da_whitelist: %', r->>'tabela';
    END CASE;
    feitos := feitos || jsonb_build_object('tabela', r->>'tabela', 'id', novo, 'rotulo', r->>'rotulo', 'href', r->>'href');
  END LOOP;
  IF track IS NOT NULL AND skill IS NOT NULL THEN
    INSERT INTO skill_study_tracks (skill_id, track_id) VALUES (skill, track) ON CONFLICT DO NOTHING;
    UPDATE study_tracks SET linked_skill_id = skill WHERE id = track;
  END IF;
  UPDATE intencoes SET status = 'aplicada', caminho = p_caminho, aplicado = feitos, aplicada_em = now() WHERE id = p_intencao;
  RETURN feitos;
END $$;

-- desfazer: apaga só o que não foi editado depois (updated_at = created_at quando a tabela tem as duas)
CREATE OR REPLACE FUNCTION desfazer_intencao(p_intencao UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE r JSONB; ficaram JSONB := '[]'::jsonb; uid UUID := auth.uid(); n INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM intencoes WHERE id = p_intencao AND user_id = uid AND status = 'aplicada') THEN
    RAISE EXCEPTION 'intencao_invalida';
  END IF;
  FOR r IN SELECT * FROM jsonb_array_elements((SELECT aplicado FROM intencoes WHERE id = p_intencao)) LOOP
    CASE r->>'tabela'
      WHEN 'study_tracks' THEN DELETE FROM study_tracks WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
      WHEN 'skills' THEN DELETE FROM skills WHERE id = (r->>'id')::uuid AND user_id = uid;
      WHEN 'recurring_transactions' THEN DELETE FROM recurring_transactions WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
      WHEN 'agenda_events' THEN DELETE FROM agenda_events WHERE id = (r->>'id')::uuid AND user_id = uid;
      WHEN 'goals' THEN DELETE FROM goals WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
    END CASE;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN ficaram := ficaram || r; END IF;
  END LOOP;
  UPDATE intencoes SET status = 'desfeita', desfeita_em = now() WHERE id = p_intencao;
  RETURN ficaram;
END $$;
```
  Conferir antes de rodar: `skills.updated_at` e `agenda_events.updated_at` existem? (`grep -n updated_at supabase/migrations/004_*.sql supabase/migrations/005_*.sql`). Se não existirem, a cláusula `updated_at = created_at` sai dessas tabelas (como já está acima para `skills` e `agenda_events`). `agenda_events.type` não tem CHECK no banco; `'estudo'` precisa estar no enum TS de `use-agenda.ts:10` (se não estiver, usar `'pessoal'`).
- [ ] **Step 2: aplicar em homolog** via MCP Supabase `apply_migration` no projeto de homologação `bculmhmoxxpjlcilkgmp` (restaurar se `INACTIVE`); produção `xmtzpjtbqhgwmebycxmx` só com ok explícito. Verificar com `list_tables` que `coach_messages` e `intencoes` existem e com `execute_sql` `select proname from pg_proc where proname like '%intencao%'`.
- [ ] **Step 3: commit** `feat(db): migration 028, conversa persistida e intencoes`.

### Task 5: Migration 029 (weekly_reviews consertada)

**Files:**
- Create: `web/supabase/migrations/029_weekly_reviews_fix.sql`

- [ ] **Step 1:**
```sql
-- 029_weekly_reviews_fix.sql — o fechamento semanal nunca persistiu: faltava week_end e score_gained não existia
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_gained INT NOT NULL DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_inicio INT;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_fim INT;
ALTER TABLE weekly_reviews ALTER COLUMN week_end DROP NOT NULL;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}';
```
- [ ] **Step 2:** aplicar em homolog; `execute_sql`: `select column_name, is_nullable from information_schema.columns where table_name='weekly_reviews'`.
- [ ] **Step 3: commit** `fix(db): weekly_reviews aceita o fechamento (029)`.

### Task 6: `buildModuleContext` por área + fontes

**Files:**
- Modify: `web/src/lib/coach/context.ts`; Test: `web/src/lib/coach/context.test.ts`

- [ ] **Step 1 (bug):** trocar `description` por `name` na query de `recurring_transactions` (`:155-160`) e no map (`r.name`).
- [ ] **Step 2:** o retorno passa a ser `{ ctx: Record<string, unknown>; fontes: string[] }` via nova função `buildContextoComFontes(supabase, userId, moduleId)`; `buildModuleContext` continua (compat) chamando a nova e devolvendo só `ctx`. `fontes` acumula rótulos humanos por bloco lido com sucesso: `"34 transações"`, `"3 orçamentos"`, `"3 contas fixas"`, `"3 metas"`, `"seu Life Sync Score"`, `"check-in de ontem"`, `"agenda da semana"`, `"6h30 de foco"`.
- [ ] **Step 3:** novos módulos: `tempo` (agenda da semana: eventos de hoje com `start_time/end_time`, janela livre calculada por `lib/meu-dia/margem.ts`; `focus_sessions` da semana), `futuro` (`goals` ativos + `objectives` com progresso via `calcObjectiveProgress`), `mente` (`study_tracks` ativas, horas da semana), `carreira` (`skills`, `career_roadmaps` passo atual). `panorama` passa a incluir `tempo.janelaLivre` e `intencoes_em_aberto` (count + texto da mais recente).
- [ ] **Step 4: testes** em `context.test.ts`: `summarizeFinancas` (existe) + novo `fontesDe(ctx)` puro: dado um ctx com `financas.txCount=34`, `orcamentos.length=3`, retorna `['34 transações','3 orçamentos']`. `npx vitest run src/lib/coach` → PASS.
- [ ] **Step 5: commit** `feat(sy): contexto por area com fontes citadas; fix name em recorrentes`.

### Task 7: `coach-thread` persiste e cita fontes

**Files:**
- Modify: `web/src/app/api/ai/coach-thread/route.ts`

- [ ] **Step 1:** após validar, gravar a última mensagem do usuário em `coach_messages` (`role='user'`, `module_id`), best-effort (try/catch). Montar `system` com `ctx` e a instrução "Termine SEM listar fontes; o app mostra as fontes". Responder com `result.toTextStreamResponse({ headers: { 'x-sy-fontes': encodeURIComponent(JSON.stringify(fontes)) } })`.
- [ ] **Step 2:** persistir a resposta: usar `onFinish` do `streamText` (`onFinish: async ({ text }) => { await sb.from('coach_messages').insert({ user_id, role: 'assistant', content: text, module_id, fontes }) }`).
- [ ] **Step 3:** `CamadaCoach` lê o header e renderiza `<span class="meta">Fontes: a · b · c</span>` sob a bolha ao terminar (Task 10).
- [ ] **Step 4:** teste manual em `next start` com login de QA: 2 mensagens → `execute_sql select role, left(content,40), fontes from coach_messages order by created_at desc limit 4` mostra as 4 linhas. Commit `feat(sy): conversa persistida em coach_messages com fontes`.

### Task 8: Lógica pura de Meu dia (gatilhos, margem, laboratório)

**Files:**
- Create: `web/src/lib/meu-dia/gatilhos.ts`, `margem.ts`, `laboratorio.ts` e os `.test.ts`

- [ ] **Step 1 `margem.ts`:** `janelaLivre(eventos: {start_time: string|null; end_time: string|null; all_day: boolean}[], agora: {h: number; m: number}, fim = 22*60): { livreMin: number; inicio: string|null; fim: string|null; segmentos8: ('on'|'off')[] }` — maior intervalo sem evento entre `max(agora, 14:00)` e 22:00; eventos sem `end_time` valem 60 min; `segmentos8` = 8 fatias de 1h (14h a 22h) marcadas `on` quando dentro da janela. Testes: sem eventos → 480/… ; evento 15:00-16:30 e 20:00 → janela 16:30-20:00 = 210; só all_day → ignora.
- [ ] **Step 2 `gatilhos.ts`:** `montarItens(input): ItemPedeVoce[]` com prioridades da spec §4.1: (1) `intencoesEmAberto` → "A proposta de … continua em aberto", ação `decidir`; (2) risco ≤7 dias: orçamento `pct>85` (coral), conta `daysLeft<=3`, meta com `target_date` ≤7 dias; (3) compromisso de hoje com preparo: evento de hoje com `type in (saude, trabalho, viagem)` ou título com "consulta|entrevista|prova|voo"; (4) mudança desde último acesso: áreas ativas com `tendencia != 0` (uma linha agregada); (5) próxima ação: `recs[0]` do brief. Máx. 4 itens; só áreas ativas em 2 a 5. Testes: cenário mock (lazer 98%, aluguel 3 dias, fisioterapia, intenção em aberto) → 4 itens na ordem 1,2,2,3; cenário vazio → 1 item ("Nada pede você hoje").
- [ ] **Step 3 `laboratorio.ts`:** `cenariosJantar({ lazerRestante, teto, janelaMin, eventoLazerHoje: {title, start_time}|null, metaViagem: {nome, atual, alvo}|null })` → `null` quando não há evento de lazer hoje OU não há orçamento de lazer; senão os 3 cenários (fora = média dos últimos 3 gastos de Lazer do mês, default 120; casa 55/50min; simples 35/20min) com os 3 efeitos (igual `SL_MOCK.lab`). Testes: com mock → 3 cenários, `lazer` do fora = 10−120 = −110; sem evento → null.
- [ ] **Step 4:** `npx vitest run src/lib/meu-dia` → PASS. Commit `feat(meu-dia): gatilhos, margem e laboratorio como funcoes puras`.

### Task 9: `diario-brief` vira o briefing de Meu dia

**Files:**
- Modify: `web/src/app/api/ai/diario-brief/route.ts`

- [ ] **Step 1:** `BriefSchema` → `{ fala: string (2 a 3 frases, números do contexto), fontes: string, recs: 3 }`; o prompt pede "texto de Sy em segunda pessoa, direto, sem 'edição', sem caligrafia"; `module_id` do cache vira `'meu-dia'` (chave nova, sem colidir com o payload antigo). Fallback determinístico reescrito com os números (sem `hand`, sem `headline`).
- [ ] **Step 2:** `use-meu-dia.ts` consome `fala`, `fontes`, `recs`.
- [ ] **Step 3:** `curl`-free check: abrir `/dashboard` em `next start`, ver `coach_briefs` com `module_id='meu-dia'`. Commit `feat(sy): briefing de Meu dia (fala + fontes), cache diario`.

### Task 10: Meu dia D em React

**Files:**
- Create: `web/src/hooks/use-meu-dia.ts`, `web/src/components/app-v5/MeuDiaV5.tsx`, `meu-dia-v5.css`, `Laboratorio.tsx`, `Ritmo.tsx`, `Presenca.tsx`
- Modify: `web/src/app/(app-v5)/dashboard/page.tsx`, `CamadaCoach.tsx`
- Reference: `prototypes/v5/app/meu-dia-d.html` e `.mobile.html` (markup e copy 1:1), `shared/lab.js` (lógica do laboratório, portar para `Laboratorio.tsx` com estado React), `shared/mock-data.js` `SL_MOCK.lab` (textos)

- [ ] **Step 1 `use-meu-dia.ts`:** compõe `useDiario()`, `useAgenda({mode:'week'})` filtrado para hoje → `janelaLivre`, `useBudgets` (lazer) → `cenariosJantar`, `useCheckin` (ritmo: `mood` 2 = Mais lento, 3 = No meu ritmo, 4 = Com energia), `useDiarioBrief` (fala, fontes, recs), intenções em aberto (`supabase.from('intencoes').select().eq('status','em_aberto')`), `montarItens`. Preferência do acordo: `localStorage['sy.acordo']` nesta fase (Configurações/Sy é Fase 7), default `mudar`.
- [ ] **Step 2 `MeuDiaV5.tsx`:** porte 1:1 das seções do protótipo: `.cab` (data por extenso, h1 do brief ou "Hoje pode caber menos.", sub, `.score`), `.margem` (anel com `--p = livreMin/480`, linha do dia, rodapé: lazer restante coral se <0, compromissos à frente, % da meta mais próxima), `<Ritmo/>`, `<Laboratorio/>` (ou a linha "Nenhuma escolha aberta hoje" quando `cenarios === null`), `.pede` (itens dos gatilhos com ações reais: `decidir` abre a camada com a proposta; `Ver orçamento` → `/financas/orcamentos`; `Abrir agenda` → `#hoje`), `.dia` (`.ag` por evento de hoje + "Espaço livre" protegido), `<Presenca/>`, `.dims-sec`, `.nums`, `.semana` (link `/dashboard/review`), `.colofao`. Copy e classes idênticas ao protótipo; números com NBSP e `.num`.
- [ ] **Step 3 `meu-dia-v5.css`:** só `.wrap` e os 2 ajustes de `.nums` (como o protótipo). Tudo o mais vem de `app-v5.css`.
- [ ] **Step 4 `CamadaCoach`:** eyebrow `Sy · lendo: o seu dia`; `aria-label="Sy"`; `.meta` com fontes (header da Task 7); `Conversa completa →` → `/coach`; prop `proposta?: Proposta` renderiza `<PropostaIntencao/>` (Task 17) no lugar do estado vazio.
- [ ] **Step 5 `dashboard/page.tsx`:** renderiza `<MeuDiaV5 userName accountCreatedAt/>`.
- [ ] **Step 6:** `npx tsc --noEmit` limpo; `next build`; identidade (Task 18) `meu-dia-d` D+M. Commit `feat(v5): /dashboard vira Meu dia D`.

### Task 11: Deletar o Diário editorial

**Files:**
- Delete: `web/src/components/app-v5/DiarioV5.tsx`, `diario-v5.css`

- [ ] **Step 1:** `rm`, `grep -rn "DiarioV5\|diario-v5" src` vazio, `rm -rf .next && npm run build`. Commit `chore(v5): remove o Diario editorial`.

### Task 12: Finanças hub (T1)

**Files:**
- Create: `web/src/hooks/use-financas-v5.ts`, `web/src/components/app-v5/FinancasV5.tsx`, `financas-v5.css`, `web/src/app/(app-v5)/financas/page.tsx`
- Reference: `prototypes/v5/app/financas-a.html` e `.mobile.html`; hooks em "Fontes de dados"

- [ ] **Step 1 `use-financas-v5.ts`:** `useBudgets({month,year})` (receitas, despesas, saldo, poupança, orçamentos com rollover e `pct`), `useTransactions({month,year,sort:'newest',pageSize:8})`, `useRecorrentes()` (3 próximos por `daysLeft`), `useMetas({status:'active'})` (3), `usePlanejamento` (fechamento projetado `r`), série do fluxo = saldo acumulado por dia do mês em 12 leituras (reusar o cálculo de `cfDays` da página v3, movido para `lib/financas/fluxo.ts` + teste), brief do módulo via `/api/ai/coach-brief` com `moduleId='financas'` (fala de 1 ou 2 frases: reaproveitar a rota, schema reduzido a `fala`+`fontes`).
- [ ] **Step 2 `FinancasV5.tsx`:** porte 1:1: `.titulo` + `.sy` (fala, fontes, `Falar com Sy sobre <mês>`), `.nums`, `.duo` (orçamentos `.orc` com `--w`, `.cats`, `.prox` = `recs[0]`; `.fluxo` SVG com a série real, legenda em prosa calculada), `.trans` (8 `.tx`, `Ver todas →` `/financas/transacoes`), `.duo2` (metas `.mrow`, recorrentes `.rec`, agenda do dia filtrada por tipo financeiro), `.colofao`; camada com `moduleId='financas'`.
- [ ] **Step 3:** `(app-v5)/financas/page.tsx` server fino (user) → `<FinancasV5/>`. As subtelas `/financas/*` continuam no `(app)` v3 até a Fase 2; conflito de rota: o hub `(app)/financas/page.tsx` é deletado na Task 19 (até lá, Next acusa rota duplicada → deletar o v3 já nesta task, deixando o `(app)/financas/layout.tsx` se existir).
- [ ] **Step 4:** identidade `financas-a` D+M. Commit `feat(v5): /financas vira o hub T1`.

### Task 13: Life Score v2

**Files:**
- Create: `web/src/hooks/use-life-score-v5.ts`, `web/src/components/app-v5/LifeScoreV5.tsx`, `life-score-v5.css`, `web/src/app/(app-v5)/dashboard/score/page.tsx`
- Delete: `web/src/app/(app)/dashboard/score/page.tsx`
- Reference: `prototypes/v5/app/life-score-v2.html` e `.mobile.html`

- [ ] **Step 1 hook:** `useScoreEngine()` (scores por módulo + total + `componentes` por módulo: expor do engine via retorno de `calculateAllScores`; se o engine só devolve o número, acrescentar `detalhes: Record<ModuleKey, {nome, peso, valor}[]>` no retorno dos calculadores, sem mudar o cálculo), `useLifeScore()` (history 30, deltaWeek), `profiles.active_modules`, pesos de `lib/score-utils.ts` redistribuídos (`contrib = score × pesoEfetivo`), "como melhorar" = 3 componentes mais fracos com `ganho = (100−valor) × pesoInterno × pesoEfetivo` (regra do protótipo).
- [ ] **Step 2 componente:** porte 1:1 (voltar → `/dashboard`, `.principal`, `.sy` com "O que mais pesou esta semana foi <área com maior |delta|>", curva SVG com `history`, `.dimrow` com peso/contrib, `Por dentro de cada área`, `Como melhorar`, rodapé). Estados: `history.length < 7` → "A curva aparece a partir do 7º dia".
- [ ] **Step 3:** identidade `life-score-v2` D+M; `(app)/dashboard/score` deletado. Commit `feat(v5): Life Score v2 com o motor oficial`.

### Task 14: Sua semana

**Files:**
- Create: `web/src/hooks/use-sua-semana.ts`, `web/src/components/app-v5/SuaSemanaV5.tsx`, `sua-semana-v5.css`, `web/src/app/(app-v5)/dashboard/review/page.tsx`
- Delete: `web/src/app/(app)/dashboard/review/page.tsx`
- Reference: `prototypes/v5/app/sua-semana.html` e `.mobile.html`

- [ ] **Step 1 hook:** semana = segunda a domingo em SP (`week_start` = segunda, `week_end` = domingo); `useAgenda({mode:'week'})` → compromissos feitos/total; `useFocusSessions('week')` → minutos; `useTransactions` da semana → entradas/saídas; `useLifeScore().history` → score início (7 dias atrás) e fim; "o que mudou" = áreas ativas com `history[0]` vs `history[6]` por módulo (colunas `<modulo>_score`); "o que ficou" = eventos pendentes da semana (máx. 3). `fechar()` → upsert `weekly_reviews { user_id, week_start, week_end, completed_at: now, score_inicio, score_fim, score_gained: 50, data: {entradas, saidas, feitos, total, focoMin} }` onConflict `user_id,week_start`; depois `updateStreak(user.id)` e `addXP(user.id, 'review_completed')`; `fechada` = existe linha com `completed_at`.
- [ ] **Step 2 componente:** porte 1:1, data do bar = domingo da semana quando fechando; estado "sem dados" antes de quinta; botão fixo no mobile.
- [ ] **Step 3:** teste em homolog: fechar → linha em `weekly_reviews`, `user_streaks` incrementado, `user_xp_log` com `review_completed`. Identidade D+M. Commit `feat(v5): Sua semana persiste o fechamento (e corrige o bug do v3)`.

### Task 15: Arquivo da conversa (`/coach`)

**Files:**
- Create: `web/src/hooks/use-conversa.ts`, `web/src/components/app-v5/ConversaV5.tsx`, `conversa-v5.css`, `web/src/app/(app-v5)/coach/page.tsx`
- Delete: `web/src/app/(app)/coach/page.tsx`
- Reference: `prototypes/v5/app/conversa.html` e `.mobile.html`

- [ ] **Step 1 hook:** `coach_messages` do usuário (últimos 60 dias, order asc), agrupadas por dia SP; `intencoes` do usuário mescladas como entradas `kind='intencao'` no dia de `created_at` (estado e `aplicado`); busca client (`ilike` local no texto), filtros (perguntas = `role=user kind=mensagem`; ações = `kind=acao`; intenções; por área = `module_id`). `desfazer(intencaoId)` chama `/api/intencao/desfazer`.
- [ ] **Step 2 componente:** porte 1:1 (lista de dias + thread; mobile navega com `hidden`); fim do dia de hoje = gatilho da camada; estado vazio "Sy ainda não falou com você".
- [ ] **Step 3:** identidade D+M (com 2 dias de mensagens reais do usuário de QA). Commit `feat(v5): /coach vira o arquivo da conversa`.

### Task 16: APIs da intenção

**Files:**
- Create: `web/src/lib/intencao/schemas.ts` + `schemas.test.ts`, `web/src/app/api/ai/intencao/route.ts`, `web/src/app/api/intencao/aplicar/route.ts`, `web/src/app/api/intencao/desfazer/route.ts`

- [ ] **Step 1 `schemas.ts`:** Zod por tabela (whitelist): `RegStudyTrack {tabela:'study_tracks', name, target_date (YYYY-MM-DD), cost ≥0, rotulo, href}`, `RegAgenda {tabela:'agenda_events', title, date, start_time HH:MM, end_time HH:MM}` (array de 2), `RegRecorrente {tabela:'recurring_transactions', name, amount>0, day_of_month 1..31}`, `RegSkill {tabela:'skills', name}`, `RegGoal {tabela:'goals', name, target_date}`; `PropostaSchema { tipo:'iniciar_curso', caminhos: [{ id, titulo, resumo, registros: Registro[] , efeitos: {area, texto}[] }] (2..3) }`. Testes: payload bom passa; `tabela:'profiles'` falha; `amount:-1` falha.
- [ ] **Step 2 `/api/ai/intencao` POST** `{ texto, moduleId }`: auth + rate limit; classifica por regex simples nesta fase (`/curso|aula|ingl[eê]s|idioma/i` → `iniciar_curso`; senão `{ tipo: null }` e o client manda para `coach-thread`); se for curso: contexto das 5 áreas (`buildContextoComFontes` para `tempo`, `financas`, `futuro`, `carreira`, `mente`), `generateObject` (Gemini) com `PropostaSchema` e prompt da spec §6.2 (3 caminhos, impacto por área, nunca rotular melhor); registros inválidos descartados pelo Zod (`safeParse` por item); fallback determinístico com os 3 caminhos do protótipo (R$ 180 / R$ 120 / janeiro) quando sem chave; grava `intencoes {texto, tipo, proposta, status:'em_aberto'}` e `coach_messages` (user: texto; assistant: "Li suas cinco áreas…" `kind='intencao'`, `ref_id`); devolve `{ intencaoId, proposta, fontes }`.
- [ ] **Step 3 `/api/intencao/aplicar` POST** `{ intencaoId, caminho, registros }`: Zod; `rpc('aplicar_intencao', { p_intencao, p_caminho, p_registros })`; devolve `feitos` com `href` resolvido no servidor (`recurring_transactions` → `/financas/recorrentes`, `goals` → `/futuro`, `agenda_events` → `/tempo/agenda`, `study_tracks` → `/mente/trilhas`, `skills` → `/carreira/habilidades`); grava `coach_messages kind='acao'`.
- [ ] **Step 4 `/api/intencao/desfazer` POST** `{ intencaoId }`: `rpc('desfazer_intencao')`; devolve `ficaram`.
- [ ] **Step 5:** `npx vitest run src/lib/intencao` PASS; teste manual com o usuário de QA: aplicar → 5 linhas nas tabelas; desfazer → 0. Commit `feat(sy): intencao composta, planejar/aplicar/desfazer`.

### Task 17: Cartão de proposta na camada e em Meu dia

**Files:**
- Create: `web/src/hooks/use-intencao.ts`, `web/src/components/app-v5/PropostaIntencao.tsx`
- Modify: `CamadaCoach.tsx`, `MeuDiaV5.tsx`
- Reference: `prototypes/v5/app/_intencao.html` e `.mobile.html` (cartão `.prop`, registros marcáveis, Feito, Desfazer)

- [ ] **Step 1:** `use-intencao.ts`: `propor(texto)`, `aplicar(caminho, registrosMarcados)`, `desfazer()`; estado `em_aberto|aplicada|desfeita`; invalida `useDiario`/`useAgenda`/`useRecorrentes` queries ao aplicar/desfazer.
- [ ] **Step 2:** `PropostaIntencao.tsx` porte 1:1 do cartão (caminhos `.opc`, registros com checkbox cobrindo a linha e valor editável, efeito por área, `De onde vêm esses efeitos?`, `Criar N registros`, cartão Feito com links reais, Desfazer com confirmação inline).
- [ ] **Step 3:** `CamadaCoach`: no `send`, antes do `coach-thread`, chama `/api/ai/intencao`; se `tipo` vier, renderiza a proposta; o chip "Decidir" de Meu dia abre a camada com a intenção em aberto carregada de `intencoes`.
- [ ] **Step 4:** fluxo completo em homolog (Decidir → marcar → Criar → links abrem → Desfazer). Identidade da camada aberta (desktop) × `_intencao.html`. Commit `feat(v5): cartao de proposta na camada de Sy`.

### Task 18: Teste de identidade protótipo × rota

**Files:**
- Create: `web/scripts/identidade-v5.mjs`, `web/e2e/identidade-v5.spec.ts`

- [ ] **Step 1 script:** para cada par `[protótipo, rota, viewport]` (`meu-dia-d`/`/dashboard`, `financas-a`/`/financas`, `life-score-v2`/`/dashboard/score`, `sua-semana`/`/dashboard/review`, `conversa`/`/coach`, em 1440×900 e 390×844): login real com `QA_EMAIL/QA_PASSWORD` do `.env.local`, `reducedMotion: 'reduce'`, `addStyleTag` escondendo `.sy40 canvas` e `.grain`, full-page de ambos, diff com `pixelmatch` (adicionar `pixelmatch` + `pngjs` como devDependencies) → `% de pixels diferentes` e PNG de diff em `.playwright-mcp/identidade/`. Critério: diferença só em regiões de texto dinâmico; relatório lista as regiões (bounding boxes dos clusters de diff).
- [ ] **Step 2:** `next start -p 3006` (NUNCA dev: Turbopack e service worker); protótipos em `:8765`. Rodar para cada lote; anexar números no handoff.
- [ ] **Step 3: commit** `test(v5): identidade prototipo x rota`.

### Task 19: Fechamento da Fase 1

- [ ] **Step 1:** deletar `(app)/financas/page.tsx` (hub), `(app)/dashboard/review`, `(app)/dashboard/score`, `(app)/coach`, `DiarioV5`; `rm -rf .next && npm run build` limpo; `npx tsc --noEmit` 0; `npx vitest run` verde.
- [ ] **Step 2:** `grep -rn "Pergunte ao coach\|Edição nº\|Diário" src/components/app-v5 src/app/\(app-v5\)` vazio.
- [ ] **Step 3:** hub (`prototypes/v5/index.html`): linhas da Fase 1 → `implementado`/`qa`; handoff: sessão + tabela + gotchas; memória.
- [ ] **Step 4: commit** `docs(v5): Fase 1 no ar`.

---

## Decisões de implementação (fixadas aqui para não reabrir tela a tela)

1. **Ritmo grava em `daily_checkins.mood`** com 2/3/4 (lento/normal/energia); a nota opcional vai em `note`. Sem tabela nova.
2. **Acordo de atenção** vive em `localStorage['sy.acordo']` até a Fase 7 criar `/configuracoes/sy`; o briefing respeita `pedir` (não gera fala espontânea, só a lista).
3. **Laboratório do jantar só aparece com dado real** (evento de lazer hoje + orçamento de lazer); sem isso a seção mostra uma linha quieta "Nenhuma escolha aberta hoje" e nunca inventa cenário.
4. **Classificação de intenção por regex** nesta fase (whitelist de 1 tipo); o modelo só gera a proposta. Tool calling fica para o sprint do N3.
5. **Fontes citadas** vêm do servidor (`x-sy-fontes`), nunca do texto do modelo.
6. **`useLifeMap` não é usado** no v5; o Life Score é o `useScoreEngine` + `life_sync_scores`.
7. **Semana = segunda a domingo** (SP); o v3 usava domingo como `week_start` com data UTC: as linhas antigas, se existirem, não colidem porque nunca persistiram.
8. **Identidade em `next start`**, com o service worker desregistrado antes (memória do projeto).

## Riscos

| Risco | Mitigação |
|---|---|
| `calculateAllScores` não expõe componentes | acrescentar `detalhes` ao retorno sem tocar na fórmula; teste compara `total` antes/depois |
| Rota duplicada `(app)/financas` × `(app-v5)/financas` quebra o build | deletar o hub v3 na própria Task 12 |
| Projeto Supabase pausado | `get_project` → `restore_project` antes das migrations |
| Gemini sem chave em homolog | fallback determinístico em brief e proposta; nunca quebra a tela |
| `agenda_events.type='estudo'` fora do enum TS | validar em `use-agenda.ts:10`; usar `pessoal` se não existir |
