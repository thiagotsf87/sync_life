# Plano A — Rollout Design System v3 nas telas remanescentes

> **Criado:** Mai 2026 (final da sessão de port 1:1 inicial).
> **Status atual:** 8 telas portadas 1:1 ao protótipo (Landing, Login, Cadastro, Dashboard, Finanças visão geral, Conquistas, Configurações Perfil+Aparência, DashboardMobile). Restam ~61 web + 14 mobile + 19 modals em padrão antigo.
> **Premissa:** essas telas remanescentes **não têm protótipo v3 dedicado**. O caminho é aplicar **conformidade ao Design System** (tokens, padrões 1-6, regras G-01 a G-10), não port pixel-perfect.

---

## Referências obrigatórias (ler antes de cada sprint)

- `CLAUDE.md` — spec atualizada (Mai 2026). Seções críticas:
  - §"Cores de status" (linha ~150) — `--sl-em #0F766E` brand DIFERENTE de `--sl-success #1FA67A`
  - §"Tipografia" (linha ~176) — Syne primary, DM Sans body, IBM Plex Mono mono only
  - §"6 Padrões de composição" (linha ~233)
  - §"10 Regras visuais G-01 a G-10" (linha ~329)
  - §"Componentes base v3" (linha ~346) — inventário do que existe e pode reusar
- `memory/project_v3_migration.md` — histórico das 3 rodadas de migração feitas
- `docs/prototypes-v3/dashboard-v2/tokens.css` — fonte da verdade dos tokens
- `docs/prototypes-v3/` (auth, landing, dashboard-v2, financas, conquistas, configuracoes, mobile) — protótipos para mapear padrões similares

---

## Componentes disponíveis para reuso (NÃO criar do zero)

### Layout
- `<SLCard>`, `<KpiCard>`, `<SaveBar>`, `<DangerZone>`, `<SectionHeader>`, `<BottomSheet>`

### Form
- `<TextField>`, `<SelectField>`, `<ToggleRow>` em `components/ui/`
- `<ToggleSwitch>` em `components/settings/`

### Brand
- `<SyncLifeLockup>` (height, withTagline)

### Indicadores
- `<ProgressBar>` (variant: budget/goal/habit), `<RingProgress>`, `<Sparkline>`, `<ChartTooltip>`

### Dashboard family
- `<HeroScoreMassive>`, `<SparklineCurve>`, `<FinancialStrip>`, `<HighlightsCard>`

### Finanças family
- `<KpiStrip>`, `<HealthBand>`, `<AiConsultant>`, `<HistoricoChart>`, `<FluxoCaixaSection>`

### Conquistas family
- `<HeroLevel>`, `<ConqKpiStrip>`, `<RecentBadges>`, `<CategoryProgress>`, `<FriendsRanking>`, `<BadgeCollection>`, `<BadgeCard>`, `<RarityPill>`

### Configurações
- `<ProfileHero>`

### Shell
- `<ModuleBar>`, `<Sidebar>` (com `<SidebarScore>` per-módulo), `<TopHeader>` (sem saudação), `<MobileBottomBar>`

### Helpers
- `fmtBRL` (compact/full) de `@/lib/format/currency`
- Tokens via `var(--sl-*)`

---

## Cheat-sheet por padrão (qual usar)

| Padrão | Quando | Template |
|---|---|---|
| **P1 Overview com KPIs** | Dashboard de módulo (Tempo, Corpo, Mente, Patrimônio, Carreira, Experiências home) | TopBar + Hero único + Mosaic + KPI strip + Grid 1.4fr/1fr |
| **P2 Módulo denso com IA** | Sub-views com muito chart (Finanças relatórios, Patrimônio carteira) | TopBar período + 4 KPIs + Health alert + AI card + 2 charts + timeline full |
| **P3 Lista + filtros** | Transações, Atividades, Trilhas, Carteira, Viagens | Header + filtros pill + lista/tabela + paginação |
| **P4 Form-heavy** | Onboarding, wizards (Nova viagem, Nova meta), Configurações resto | TopBar + Hero opcional + Cards numerados (01·…) + DangerZone + SaveBar sticky |
| **P5 Emocional/gamificação** | Conquistas + Ranking + Coach | Hero level + 4 KPIs + Recém + Progress+Ranking + Coleção grid 6 cols |
| **P6 Marketing/público** | Landing, Pricing, Login/Cadastro, Esqueceu-senha | TopNav + Hero + social proof + features + pricing + FAQ + CTA + Footer |

---

## Checklist de conformidade por tela (antes de marcar PR como ready)

- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Padrão de composição identificado e seguido (1 dos 6 acima)
- [ ] Hero único (G-05) — se aplicável
- [ ] Tipografia: títulos em `font-[Syne]`, números em `.sl-num`/`.sl-num-strong`, body DM Sans, mono SÓ timestamps/IDs
- [ ] Valores monetários via `fmtBRL()`
- [ ] Tooltips em todos gráficos (G-01) com `<ChartTooltip>`
- [ ] Barras de orçamento: `≤70%` success / `70-85%` warning / `>85%` danger; metas usam `--sl-grad`
- [ ] Hover em cards: `hover:border-[var(--sl-border-h)]`
- [ ] Lucide React para TODOS ícones (G-07) — nenhum emoji em chrome (preservar emojis em dados do user)
- [ ] CTA primary `var(--sl-em)` sólido — sem gradient (G-03), EXCETO logo e RingProgress
- [ ] Sem em-dash (`—`) na copy — usar `,` `:` ou `·` em eyebrows
- [ ] Forms com >3 seções: `<SectionHeader eyebrow="01 · …" />` (G-09)
- [ ] Forms com edição: `<SaveBar>` sticky com `isDirty` tracking (G-08)
- [ ] Cores via tokens CSS vars, NUNCA hex hardcoded
- [ ] Responsivo: colapsa para 1 col em `max-lg`
- [ ] Mobile: containers de scroll com `.phone-scroll` ou `scrollbar-hide` (G-04)
- [ ] Validação visual em 2 temas (Navy Deep + Cream no mínimo)
- [ ] Sem `console.log`, sem `: any` novos
- [ ] API routes com Zod validation no body

---

## Sprints priorizados

### 🚀 Sprint 1 — Telas críticas do dia-a-dia (~15-20h)

**Objetivo:** as rotas que o usuário mais usa devem estar conformes primeiro.

#### 1.1 Finanças sub-rotas (Padrão P3 lista + P2 denso)
- `/financas/transacoes` (928L) — P3 lista com filtros (categoria, conta, período). KpiCard topo opcional. TransacaoModal precisa virar `<TextField>`/`<SelectField>`.
- `/financas/orcamentos` (759L) — Grid de cards de categoria com `<ProgressBar variant="budget">` (regra ≤70/70-85/>85). EnvelopeModal idem.
- `/financas/calendario` (760L) — Mês grid customizado, drawer lateral com `<BottomSheet>` em mobile.
- `/financas/recorrentes` (664L) — P3 lista com próximas ocorrências.
- `/financas/planejamento` (593L) — P2 com 3 cenários + timeline 12m + AiConsultant pattern.
- `/financas/relatorios` (359L) — P2 com comparativo + gráficos. `<ChartTooltip>` em todos.
- `/financas/importar` (695L) — P4 wizard de upload PDF.

#### 1.2 Tempo (agenda principal)
- `/tempo` ou `/tempo/agenda` (497L) — P1 + drawer evento.
- `EventModal` (478L) — refator para `<TextField>`, `<SelectField>`, `<ToggleRow>`.

#### 1.3 Onboarding
- `/onboarding` (513L) — P4 wizard com `<SectionHeader>` numerada + `<SaveBar>` ao fim.

**Esforço:** 5 dias de dev focado.

---

### 🎯 Sprint 2 — Módulos dashboard novos (~20-25h)

**Objetivo:** os 4 módulos novos do V3 (Corpo, Mente, Futuro, Patrimônio) com suas dashboards.

#### 2.1 Corpo
- `/corpo` (410L) — P1 Overview: hero score corpo + mosaic categorias + KPIs (peso, atividades, calorias) + grid charts.
- `/corpo/atividades` (551L) — P3 lista.
- `/corpo/cardapio` (582L) — P3 com CardapioWizard refatorado.
- `/corpo/peso` (741L) — P2 denso com LineChart medidas.
- `/corpo/saude` (523L), `/corpo/coach` (247L) — P1.

#### 2.2 Mente
- `/mente` (413L) — P1 + indicadores meditação/leitura.
- `/mente/trilhas` (319L) + `/mente/trilhas/[id]` (589L) — P3 lista + P4 detalhe.
- `/mente/biblioteca` (408L) — P3.
- `/mente/sessoes` (277L), `/mente/timer` (281L) — P1.
- `PomodoroTimer` (569L) — refator visual.

#### 2.3 Futuro
- `/futuro` (764L) — P3 lista de metas + KPIs topo.
- `/futuro/[id]` (800L) — P5 (gamificação) com `<HeroLevel>` adapt para meta.
- `/futuro/novo` (535L), `/futuro/nova` (681L) — P4 wizards.
- `/futuro/checkin` (621L) — P4.
- `MetaModal` (522L), `ObjectiveWizard` (392L), `AddGoalModal` (411L) — refator.

#### 2.4 Patrimônio
- `/patrimonio` (529L) — P1 com hero patrimônio total + mosaic classes ativo + KPIs.
- `/patrimonio/carteira` (555L) — P3 lista + PieChart setores (já implementado).
- `/patrimonio/carteira/[ticker]` (294L) — P2.
- `/patrimonio/evolucao` (327L), `/patrimonio/simulador` (395L), `/patrimonio/proventos` (577L) — P2.

**Esforço:** 8-10 dias.

---

### 🧹 Sprint 3 — Resto + Mobile + Modals (~25-30h)

#### 3.1 Carreira (4 telas)
- `/carreira` (486L), `/carreira/habilidades` (533L), `/carreira/historico` (611L), `/carreira/perfil` (558L), `/carreira/roadmap` (600L) — P1, P3, P3, P4, P3.

#### 3.2 Experiências (7 telas)
- `/experiencias` (375L) — P1.
- `/experiencias/viagens` (251L), `/experiencias/viagens/[id]` (438L) — P3 + P2 (com 6 abas existentes).
- `/experiencias/nova` (681L) — P4 wizard.
- `/experiencias/memorias`, `/bucket-list`, `/passaporte` — P3.
- `TripAIChat` (499L) — refator.

#### 3.3 Configurações resto (5 subpáginas)
- Já parcialmente migradas (Notificações, Integrações, Plano com SectionHeader). Falta:
- `/configuracoes/contas` — P4 listagem + form.
- `/configuracoes/categorias` — refator de `CategoryManager` (446L).
- `AccountManager` (461L), `CategoryManager` (446L) — refator usando `<TextField>` etc.

#### 3.4 Mobile shells (13)
Cada mobile shell deve seguir o padrão de `DashboardMobile.tsx` como template:
- Header eyebrow + saudação compacta + bell
- Hero compacto (~64px score) + mini sparkline
- Mini KPIs em grid 2 cols ou scroll horizontal
- Lista vertical de itens "Hoje" / "Próximas ações"
- Grid de tiles do módulo (2 cols)
- Scrollbar invisível (G-04)

Componentes:
- CarreiraMobile (241L), CorpoMobile (320L), ExperienciasMobile (315L), FuturoMobile (427L), MenteMobile (487L), FinancasMobile (212L), PatrimonioMobile (544L), TempoMobile + Shell, OnboardingMobile (307L)
- Shells: PanoramaMobileShell, FinancasMobileShell, TempoMobileShell
- Sub-views: PlanejamentoMobile, RelatoriosMobileView

#### 3.5 Modals críticos
Refator usando form primitives novos:
- TransacaoModal (670L), MetaModal (522L), EventModal (478L), RecorrenteModal, EnvelopeModal, PlanningEventModal, AddGoalModal (411L), ObjectiveWizard (392L), TrackWizard (422L), CardapioWizard (316L), FocusSessionModal, DeleteEventModal/DeleteConfirmModal, QuickEntryFAB (544L), QuickEntrySheet, QuickActionSheet, MobileMoreSheet

#### 3.6 Misc
- `/coach` (283L) — P5 (chat AI dedicado).
- `/transacoes` (legado, 541L) — possivelmente deletar se duplicado de `/financas/transacoes`.
- `/dashboard/review` (464L), `/dashboard/score` — P2.
- `(auth)/esqueceu-senha`, `/redefinir-senha` — usar protótipo `docs/prototypes-v3/auth/` como referência (P6).

**Esforço:** 10-12 dias.

---

## Estratégia de execução por sprint

### Fluxo padrão para CADA tela
1. **Identificar padrão** (P1-P6) — qual se encaixa? Olhar protótipo similar como template.
2. **Inventariar hooks/data** existentes — preservar TODO data layer.
3. **Esqueleto JSX** seguindo o padrão escolhido.
4. **Substituir componentes** legados por v3 (KpiCard, SectionHeader, etc.).
5. **Aplicar tokens** (cores, espaçamento, fontes).
6. **Validar checklist** (acima).
7. **Screenshot** dark + cream para regressão visual.
8. **`tsc --noEmit`** antes do PR.

### Como paralelizar
Cada sprint comporta 4-6 agentes em paralelo desde que **escopos não sobreponham arquivos**:
- Por módulo (Agente A = Finanças, B = Tempo, C = Onboarding)
- Por tela dentro do módulo (em sprints grandes)
- Sempre rodar `tsc` no fim de cada agente
- Resolver conflitos em batch ao fim

### Riscos conhecidos
1. **Data layer breakage:** ao refatorar JSX, preservar 100% dos hooks. Erro mais comum: remover state que outro componente consome.
2. **Hooks Supabase:** padrão Promise.all sem `as const` (vide memory MEMORY.md).
3. **Hidratação SSR:** evitar `Math.random()` fora de useEffect. Componentes com data dinâmica precisam de fallback estável.
4. **Service Worker cache:** ao testar mudanças visuais, limpar SW (Application → Unregister + Ctrl+Shift+R).
5. **Themes:** valores hardcoded de cor quebram light theme. Use SEMPRE `var(--sl-*)`.

---

## Critério de "pronto" por sprint

- ✅ Todas as telas listadas no sprint têm padrão de composição correto
- ✅ Checklist de conformidade passa em cada tela
- ✅ `tsc --noEmit` limpo
- ✅ Screenshot validation em pelo menos 2 temas (dark + cream)
- ✅ Memory `project_v3_migration.md` atualizada com o que foi feito
- ✅ Sem regressões em funcionalidades existentes (hooks, mutations, navegação)

---

## Pendências cross-sprint (não-bloqueantes)

Trabalhar entre sprints conforme tempo permita:

- [ ] **`fmtBRL` adoption residual** (~70 ocorrências de `toLocaleString` manual fora de Finanças)
- [ ] **87 `any` types** em hooks (use-score-engine: 22, use-relatorio-completo: 18, use-badge-engine: 12)
- [ ] **Emojis remanescentes** em ~35 arquivos mobile/secundários
- [ ] **Migration DB 026** aplicar: `supabase migration up` (perfil v3 columns)
- [ ] **Cleanup órfãos extra** se algum componente legado ficar sem uso após sprints
- [ ] **DESIGN-SYSTEM-v3.md** — alinhar com CLAUDE.md (mesmas correções de fonte/cor)

---

## Entregáveis ao final do Plano A

1. **75 telas conformes** com Design System v3
2. **0 erros TypeScript**
3. **0 emojis em chrome**, 0 em-dash em copy, 0 gradients indevidos
4. **Todos os form-heavy** com SaveBar G-08 + SectionHeader G-09
5. **Todos os gráficos** com ChartTooltip G-01
6. **CHANGELOG-v3.md** sumarizando o que mudou (opcional mas útil)
7. **Memory atualizada** com decisões tomadas

---

## Notas finais para a próxima sessão

- **Sempre começar lendo:** `CLAUDE.md`, este arquivo, e `memory/project_v3_migration.md`.
- **Antes de qualquer refator:** rodar `npx tsc --noEmit` para baseline limpo.
- **Antes de tocar em componente:** grep para descobrir quem o usa (`grep -r "ComponentName" src/`).
- **Padrão de teste visual:** Playwright já configurado, use para screenshots dark+cream.
- **Quando em dúvida:** o protótipo mais próximo em `docs/prototypes-v3/` é a referência. Para módulos sem protótipo (Tempo, Mente, Corpo, Futuro, Patrimônio, Carreira, Experiências), use o protótipo do **Dashboard** (Padrão 1) ou **Finanças** (Padrão 2) como template estrutural.
- **NÃO criar novos componentes** se o que existe serve. Reusar é a regra.
- **Credenciais admin para validação:** `admin@synclife.dev` / `SyncLife@Admin2026!` (já testado).
- **Servir protótipos para comparação:** `cd docs/prototypes-v3 && python -m http.server 8765` → abrir `http://localhost:8765/<pasta>/`.
