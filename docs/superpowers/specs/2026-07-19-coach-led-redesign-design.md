# SyncLife — Redesign "Coach-led" (v4) · Design Spec

> **Data:** 2026-07-19 · **Branch:** `redesign/visual-refresh-v4` · **Status:** aguardando aprovação
> **Base git:** commit `297d4bc` (rollout v3 esmeralda) preservado; este redesign parte de base limpa.
> **Fonte de design:** projeto Claude Design "SyncLife Design System" (`e19451f3-caca-4cef-ae66-f03b73ef207b`), **Linhagem A (Coach-led, esmeralda)** — prototypes `app-v3`, `dashboard-v3`, `financas-v3`, `coach`, `*-subtelas`.
> **Base de análise:** workflow `wf_1ff47c20-982` (9 agentes, 68 telas inventariadas) — gap-analysis completo em `tasks/webp9c7tl.output`.

---

## 0. Contexto e objetivo

O SyncLife já tem o **Design System v3 esmeralda** implementado (accent `--sl-em #0F766E`, fontes Syne/DM Sans/IBM Plex Mono, 11 módulos com `--sl-mod-*`, 4 temas). O redesign **não muda cor, fonte nem estrutura de módulos**. Ele adiciona uma nova camada de produto: o **Coach como sistema operacional do app**.

**Objetivo:** transformar o SyncLife de "hub de módulos com score" em um app **narrado por um Coach de IA**, presente em 3 níveis:
1. **Ambiental** — hero do Coach contextual em cada módulo.
2. **Global** — command palette `⌘K`, Coach drawer `⌘J`, rota `/coach`.
3. **Inline** — "whispers" (CoachWhisper) dentro de listas e charts + storytelling cross-módulo (CrossBand).

**Escopo confirmado com o usuário:**
- ✅ **Full rollout** — todas as 68 telas dos 11 módulos.
- ✅ **Coach completo** — IA real (não mock), gerando headlines, whispers, cross-insights e o thread do drawer sobre dados reais.
- ✅ **Manter 11 módulos** — cores de domínio já existem (`--sl-mod-*`), regra "subtle, never neon", cyan **não** entra; esmeralda segue accent único.
- ✅ **Base limpa** — v3 commitado, branch nova.

---

## 1. Decisões travadas

| # | Decisão | Valor |
|---|---|---|
| D1 | Escopo | Full rollout (68 telas) |
| D2 | Coach | Completo, com IA real |
| D3 | Módulos | Manter 11; reusar `--sl-mod-*` existentes |
| D4 | Git | v3 commitado (`297d4bc`), branch `redesign/visual-refresh-v4` |
| D5 | **Estratégia de tokens dos componentes** | **Construir nativo** reusando análogos esmeralda que já existem no codebase; bundle cyan (Linhagem B) serve **só como referência de API/markup**. **Sem alias sheet** (`--sl-accent → --sl-em`). Ver §3. |
| D6 | Temas | Coach funciona nos 4 temas (não força dark como o auth). Validar Navy Deep + Cream. |
| D7 | Configurações | Fora do "Coach-led pleno" (Padrão 4 form) — só ganha Coach pill no header. |

> **D5 detalhado (supera a dúvida "aliasing vs reescrever"):** o gap-analysis achou análogos fortes já em tokens esmeralda no próprio codebase (`AiConsultant`, `HealthBand`, `FinancialStrip`, `CategoryProgress`, `MilestoneTimeline`, `donut-chart`, `sheet`, `dialog`). Portanto não portamos os componentes cyan do handoff nem criamos camada de alias — construímos os componentes Coach nativos, reaproveitando esses análogos e aplicando as regras G do projeto (`.sl-num`, tooltip G-01, Lucide G-07). O handoff cyan é consultado apenas para as APIs/props.

---

## 2. Fundação visual

### 2.1 Já existe e está correto (não tocar)
Accent `--sl-em` + variantes · 11 `--sl-mod-*` · status colors + `-bg` · fontes Syne/DM Sans/IBM Plex via `next/font` · `.sl-num`/`.sl-num-strong`/`.font-display` · 4 temas `navy-deep`/`midnight`/`charcoal`/`cream` via `data-theme` · superfícies `--sl-s1..s-hero`, texto `--sl-t1..t4`, bordas `--sl-border/-h/-em`. (`themes.css`, `globals.css`, `layout.tsx`.)

O Coach consome cor/label/período por módulo via `MODULES[activeModule]` (`lib/modules.ts`).

### 2.2 Tokens novos (Fase 0)
Pré-requisito dos overlays e do hero. Vão em `themes.css` (invariantes) + `globals.css` (utilitários/keyframes):

| Token / primitiva | Motivo |
|---|---|
| `--sl-noise` (data-URI) | ruído sutil no hero (G-05); hoje só `radial-gradient` ad-hoc |
| Motion: `--sl-ease`, `--sl-dur-fast/base/slow` | easing/duração consistentes dos overlays; hoje hardcoded espalhado |
| Keyframes: `slide-in-right`, `overlay-fade`, `pop-scale` | nenhum keyframe de overlay existe |
| Escala z-index + `--sl-backdrop` | **backdrop 100 · drawer 110 · palette 120 · cheat 130** — acima do chrome (ModuleBar hoje `z-[60]`) |
| `prefers-reduced-motion` global | acessibilidade; zerar animações dos overlays |
| Fix naming `--color-cqs` | aliases Tailwind não têm `cqs`/conquistas; unificar antes do Coach referenciar cor por nome |

---

## 3. Arquitetura de componentes

Tudo em `web/src/components/coach/` (exceto `KbdChip` em `ui/`). Status: **new** = greenfield · **partial** = há análogo esmeralda a adaptar.

| Componente | Status | Base a reusar (esmeralda, já no codebase) | Trabalho novo / regra G |
|---|---|---|---|
| **`ui/kbd-chip.tsx`** `KbdChip` | new | IBM Plex Mono | CLAUDE.md lista mas arquivo não existe. Renderiza `⌘K/⌘J/?/esc`. **Pré-req de palette, cheat, Coach pill** |
| **`KpiStrip`** | partial | `dashboard/FinancialStrip.tsx` (divisores hairline) + `ui/MetricsStrip.tsx` (`featured` amplia 1º valor) | âncora ≥30px em Syne; **trocar IBM Plex Mono→`.sl-num-strong` (G-02)**. **Pré-req: ~45 telas** |
| **`CoachWhisper`** | partial | `financas/HealthBand.tsx` (=solid) + tiles do `AiConsultant` + `JornadaInsight` (=soft) | API única soft/solid (`bold` ≤18 palavras + `text` + `action` + `variant`); texto de IA; **emoji 💡→Lucide (G-07)**. **Pré-req: ~40 telas** |
| **`ProgressList`** | partial | `conquistas/CategoryProgress.tsx` + `ui/ProgressBar.tsx` (regra de cor auto) | dots, badge status, modo `invert` ("menos é melhor"), `Check` Lucide; **valores mono→`.sl-num` (G-02)** |
| **`Timeline`** | partial | `metas/MilestoneTimeline.tsx` + `ui/HorizontalTimeline.tsx` | `✓`→`<Check>` Lucide (G-07); tag **`AGORA`** no `current`; generalizar marcos |
| **`Donut`** | partial | `ui/donut-chart.tsx` + `financas/DonutChart.tsx` | **centros mono→`.sl-num` (G-02)**; **tooltip no hover (G-01)** — hoje nenhum donut tem |
| **`Coach`** (hero) | partial | `financas/AiConsultant.tsx` (card hero + glow + ask/stream) + `HeroScoreMassive.tsx` (G-05) + `FinancialStrip` (4 stats, 1 big) | eyebrow `Coach · <Módulo> · <período>`, headline com fato em cor do módulo, sugestões que disparam no drawer. Depende de KpiStrip + CoachDrawer |
| **`CrossBand`** | new | `financas/RelatoriosNarrativeBand.tsx` + `HealthBand.tsx` (layout) | 2 segmentos coloridos `--sl-mod-*`, 1 trecho bold, action "Ver em `<módulo>` →" (`useRouter`) |
| **`CommandPalette`** (⌘K) | new | `ui/dialog.tsx` + `ui/input.tsx` + `shell/QuickActionSheet.tsx` (`MODULE_ACTIONS`) | grupos capturar/ir para/perguntar; navegação por teclado; `KbdChip` |
| **`CoachDrawer`** (⌘J) | partial | `ui/sheet.tsx` (side=right) + **lógica quase inteira em `coach/page.tsx`** (stream real, `lifeContext`, quick-chips) | extrair `CoachChat` compartilhado; thread contextual por `activeModule` |
| **`CheatSheet`** (?) | new | `ui/dialog.tsx` | linhas atalho→descrição com `KbdChip` |

**Ordem por dependência:** `KbdChip` → (KpiStrip · CoachWhisper · ProgressList · Timeline · Donut) → (useGlobalKeys · coach-store · CommandPalette · CoachDrawer · CheatSheet · Coach hero · CrossBand).

---

## 4. Camada Coach (OS) — integração no shell

**Mount point único:** `web/src/components/shell/AppShell.tsx` (`NewAppShell`), dentro do `<QueryProvider>` — único client component que envolve toda a árvore autenticada.

| Elemento | Arquivo | Mudança |
|---|---|---|
| `useGlobalKeys` (⌘K/⌘J/?/esc) | novo `hooks/use-global-keys.ts`, chamado em `AppShell.tsx` após `useActiveModuleSync()` | nenhum handler global de teclado existe hoje |
| `<CoachDrawer/>` (⌘J) | `AppShell.tsx` | `z: --sl-z-drawer`; reusa stream de `coach/page.tsx` |
| `<CommandPalette/>` (⌘K) | `AppShell.tsx` | `z: --sl-z-palette`; navegação de `MODULE_LIST`+`navItems` |
| `<CheatSheet/>` (?) | `AppShell.tsx` | `z: --sl-z-cheat` |
| Coach pill (⌘J) desktop | `shell/TopHeader.tsx` (antes do `<ThemePill>`) | dispara o mesmo state do ⌘J |
| Trigger Coach mobile | `shell/CoachFab.tsx` (**órfão, já existe**) ou `MobileBottomBar.tsx` | trocar `router.push('/coach')` por abrir o drawer |
| Estado dos overlays | **novo `stores/coach-store.ts`** | flags `coachDrawerOpen`/`paletteOpen`/`cheatOpen` + thread por módulo. Store dedicado evita re-render do shell |
| Rota `/coach` | `app/(app)/coach/page.tsx` (**já usa IA real**) | extrair `CoachChat` compartilhado por `/coach` + `CoachDrawer` |

**Contexto do módulo ativo (pipeline já pronto):** `use-active-module.ts` → `getModuleByPath()` (`lib/modules.ts`) → `shell-store.activeModule` → `MODULES[activeModule]`. Único ajuste: `getModuleByPath` mapeia `/coach` e `/conquistas` para `panorama` — resolver via `scope:'cross'` no thread, sem alterar o mapa.

### 4.1 Acessibilidade dos overlays (obrigatório)
Os três overlays (`⌘K` palette, `⌘J` drawer, `?` cheat) compartilham contrato a11y — `ui/dialog.tsx`/`ui/sheet.tsx` (Radix) já entregam a maior parte, **não reimplementar**:
- `role=dialog` + `aria-modal` + `aria-labelledby`; **foco preso** dentro do overlay enquanto aberto e **retornado** ao gatilho (Coach pill / elemento focado) ao fechar.
- **Scroll-lock** no body; `esc` e clique no backdrop fecham (já no `useGlobalKeys`/Radix).
- Só **um** overlay por vez: `coach-store` fecha os demais ao abrir um (evita empilhar drawer+palette).
- Navegação por teclado na palette (↑/↓/enter) com `aria-activedescendant`; itens são `role=option`.

---

## 5. IA real ("Coach completo")

### 5.1 Backend a reaproveitar
Rotas em `api/ai/*/route.ts` já usam AI SDK v6, auth Supabase, `checkRateLimit` (10/60s), Zod, Sentry, e comentário de troca p/ Claude (1 linha). `/api/ai/coach` (Groq, stream texto) = template do thread; `/api/ai/cardapio` (`generateObject`, Zod de saída) = template dos insights estruturados. Os chats leem stream via `res.body.getReader()` (não usam `useChat`).

### 5.2 Peça compartilhada crítica: `lib/coach/context.ts`
`buildModuleContext(supabase, userId, moduleId)` — lê Supabase **server-side** e retorna snapshot tipado por módulo, centralizando a agregação hoje presa em `coach/page.tsx` e no regex frágil de `use-financial-insights.ts`. Exporta `MODULE_PERSONA` (system prompt + cor + label por módulo). **Segurança: contexto gerado no server, client não é fonte de verdade** para insights afirmativos.

### 5.3 Quatro canais de IA (rotas novas)
| Rota | Formato | Alimenta | Saída (Zod) |
|---|---|---|---|
| `POST /api/ai/coach-thread` | `streamText().toTextStreamResponse()` | CoachDrawer + `/coach` | `{messages[], moduleId, scope:'module'\|'cross'}` |
| `POST /api/ai/coach-brief` | `generateObject` | Coach hero + KpiStrip | `{eyebrow, headline:{text,emphasis}, stats:{label,value,big}[], suggestions:{id,label,primary,prompt}[]}` |
| `POST /api/ai/coach-whisper` | `generateObject` | CoachWhisper (aposenta o regex) | `{lead, recommendation, action:{label,href}, variant, tone}` |
| `POST /api/ai/coach-cross` | `generateObject` | CrossBand | `{segments:{moduleId,text,bold?}[], action:{label,targetModule,href}}` |

**Client:** `useCoachThread(moduleId)` (encapsula o `getReader()` hoje duplicado) + `useCoachBrief/Whisper/Cross` com cache por módulo+período (TTL mês) + `regenerate()`.

**Estados (reusar do v3, não reinventar):** cada componente alimentado por IA renderiza os 3 estados que os protótipos v3 já têm — **skeleton** durante o fetch, **empty state** quando o contexto não tem dado suficiente, e **erro** (mensagem discreta + `regenerate()`). Regra: nunca mostrar hero/whisper/cross vazio ou meio-carregado; o skeleton do módulo cobre até o `generateObject` resolver.

**Fluxo:** `hooks (Supabase) + MODULE_PERSONA → buildModuleContext (server) → {brief, whisper, cross, thread}`. Modelo: Groq/Gemini free no MVP; Claude = 1 linha/rota.

---

## 6. Rollout por módulo (68 telas)

**Convenção:** raiz do módulo recebe anatomia Coach-led completa (Coach hero + CrossBand + KpiStrip); sub-telas recebem subconjunto (Coach pill + KpiStrip/CoachWhisper/ProgressList/Timeline/Donut). Detalhe tela-a-tela em `tasks/webp9c7tl.output` (array `screens`).

**Distribuição de esforço:**
| Effort | Qtd | O quê |
|---|---|---|
| **L** | 10 | as 10 raízes de módulo (definem hero + CrossBand que as sub-telas herdam) |
| **M** | ~34 | detalhes, listas densas, telas com charts |
| **S** | ~24 | wizards, redirects, sub-telas leves, 7 telas de Configurações |

≈122 pontos (S1·M2·L3 → 24+68+30). Altamente paralelizável por módulo depois que Fases 1-3 (primitivas + OS + IA) estiverem prontas. Saneamento G incluído onde há dívida (ex: `conquistas/ranking`: emojis→Lucide, mono→`.sl-num`, remover `text-sl-grad` do título).

---

## 7. Sequenciamento

| Fase | Entregáveis | Pronto quando |
|---|---|---|
| **0 · Fundação** | tokens §2.2 + `KbdChip` | tokens nos 4 temas; `KbdChip` em dark+cream; `tsc` limpo |
| **1 · Componentes base** | KpiStrip · CoachWhisper · ProgressList · Timeline · Donut (props/mock) | render dark+cream, valores `.sl-num`, correções G-01/G-02/G-07, sem regressão `tsc` |
| **2 · Coach OS** | coach-store · useGlobalKeys · CommandPalette · CoachDrawer · CheatSheet · Coach pill · `CoachChat` compartilhado · Coach hero + CrossBand (mock) | ⌘K/⌘J/?/esc em toda árvore; drawer contextual por `activeModule`; z-scale sem colidir com ModuleBar; **foco preso+retornado, scroll-lock e um-overlay-por-vez (§4.1)**; dark+cream |
| **3 · IA real** | `lib/coach/context.ts` + 4 rotas + hooks + substituir regex de `use-financial-insights` | hero/whisper/cross do módulo-piloto (Finanças) sobre dados reais; Zod in/out; rate-limit+Sentry; cache por módulo+período |
| **4 · Rollout desktop** | 10 raízes **L** primeiro, depois sub-telas. Ordem: **Finanças → Panorama → Futuro → Patrimônio → Corpo → Tempo → Mente → Carreira → Experiências → Conquistas** | cada módulo passa o checklist v3 (hero único, `.sl-num`, tooltip, cor de barra, CTA `--sl-em`, sem emoji/em-dash, dark+cream) |
| **5 · Mobile** | portar hero/whisper/cross p/ shells mobile; remover emoji/gradiente residuais; `.phone-scroll` (G-04); trigger no MobileBottomBar | telas mobile visualmente idênticas ao padrão Coach-led (regra mobile inviolável — validar screenshot a screenshot) |

---

## 8. Riscos & decisões abertas

1. **Mock vs real.** Telas afirmam fatos mock/heurísticos (`dashboard/review`, `conquistas/ranking`, `carreira` XP, `patrimonio`/`corpo` healthScore, `futuro/checkin`). **Regra:** IA afirmativa só sobre dados que passam por `buildModuleContext`; onde é mock, substituir por real antes **ou** marcar o whisper como sugestão (não fato). **O Coach nunca afirma sobre mock.**
2. **Custo/latência IA.** 4 canais × ~45 telas. Mitigar: brief/whisper/cross são `generateObject` cacheáveis por módulo+período + `regenerate()`; só o thread é on-demand; rate-limit já existe. Aberta: brief no server (SSR/cache) vs client-fetch com skeleton.
3. **Segurança do contexto.** Chats hoje confiam no `context` do client — ok p/ chat, **arriscado p/ UI afirmativa**. `buildModuleContext` roda no route handler.
4. **Temas.** Todo componente Coach deve funcionar em `cream` — só tokens `--sl-*`, validar Navy Deep + Cream.
5. **Performance recharts.** Donut/Timeline/ProgressList são SVG/CSS leves (não recharts); lazy-mount do drawer; `prefers-reduced-motion` corta animação.
6. **Duplicação de "Coach".** `coach/page.tsx`, `corpo/coach/page.tsx` (cópia), `CoachFab` (órfão), 4 `CoachCard` mobile → unificar num `CoachChat` compartilhado.
7. **Rollout de 68 telas sem válvula de escape.** Gate a camada Coach OS (overlays + hero + cross) atrás de uma **feature flag** (`coachOsEnabled`, lida no `AppShell`) durante Fases 4–5 — permite merge incremental na branch sem expor telas meio-migradas e dá rollback de 1 linha se a IA regredir em produção. Flag some quando as 10 raízes passarem o checklist.

---

## 9. Fora de escopo
- Reagrupar 11 módulos em 5 domínios (rejeitado em D3).
- Re-skin cyan / troca de fontes (Linhagem B rejeitada).
- Coach-led pleno em Configurações (D7 — só Coach pill).
- Persistência de threads em DB (opcional; MVP usa estado/localStorage).

---

## 10. Fontes consumidas
- **Design (Linhagem A):** `app-v3/{tokens,modules-data,overlays,engine}.jsx`, `coach/coach-page.jsx`, handoff `README.md`/`DESIGN-SYSTEM.md`/`SKILL.md` + 7 componentes (referência de API).
- **Codebase (via workflow `wf_1ff47c20-982`):** `themes.css`, `globals.css`, `layout.tsx`, `AppShell.tsx`, `TopHeader.tsx`, `lib/modules.ts`, `stores/shell-store.ts`, `hooks/use-active-module.ts`, `api/ai/*`, `coach/page.tsx`, `use-financial-insights.ts`, biblioteca de componentes, e as 68 telas dos 11 módulos.
- **Gap-analysis detalhado:** `tasks/webp9c7tl.output`.
