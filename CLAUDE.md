# SyncLife — Guia de Desenvolvimento para o Claude Code

> Leia este arquivo **antes de qualquer tarefa**. Ele define o stack, as convenções
> e o **Design System v3** do projeto. Não improvise: siga estas regras.
>
> **Fontes de verdade visuais:**
> - `DESIGN-SYSTEM-v3.md` — documento completo do sistema visual
> - `tokens-v3.css` — todos os tokens prontos pra import

---

## Stack e tecnologias

| Camada       | Tecnologia                         |
|--------------|------------------------------------|
| Framework    | Next.js 16 (App Router)            |
| Linguagem    | TypeScript (strict)                |
| UI           | React 19 + shadcn/ui (new-york)    |
| Estilo       | Tailwind CSS v4                    |
| Ícones       | lucide-react                       |
| Formulários  | react-hook-form + zod              |
| Backend/Auth | Supabase (SSR)                     |
| Gráficos     | recharts                           |
| IA           | Vercel AI SDK + Google Gemini + Groq |
| Deploy       | Vercel                             |

---

## Estrutura de pastas

```
web/
├── src/
│   ├── app/               ← App Router (pages, layouts, API routes)
│   │   ├── (auth)/        ← login, cadastro, forgot-password
│   │   ├── (app)/         ← telas autenticadas (11 módulos)
│   │   ├── api/           ← API routes (IA + cotações)
│   │   └── globals.css    ← tokens v3 + Tailwind base
│   ├── components/
│   │   ├── ui/            ← componentes shadcn/ui + SL base (não editar shadcn diretamente)
│   │   └── [feature]/     ← componentes específicos por feature
│   ├── lib/
│   │   ├── supabase/      ← client, server, middleware
│   │   ├── format/        ← fmtBRL e helpers de formato (NOVO em v3)
│   │   └── utils.ts       ← cn() e outros utilitários
│   ├── hooks/             ← custom hooks (32+)
│   ├── stores/            ← Zustand stores
│   ├── styles/            ← themes.css (4 temas — reduzido em v3)
│   └── types/             ← TypeScript types
├── supabase/
│   └── migrations/        ← migrations SQL
└── CLAUDE.md              ← este arquivo
```

---

## Módulos (11) — cores dessaturadas v3

| Módulo | Rota base | Cor v3 | Cor v2 (antiga) |
|--------|-----------|--------|-----------------|
| Panorama | `/dashboard` | `#6B6FD4` | `#6366f1` |
| Finanças | `/financas` | `#1FA67A` (= success) | `#10b981` |
| Futuro | `/futuro` | `#8B7BD4` | `#8b5cf6` |
| Tempo | `/tempo` | `#3CA0B5` | `#06b6d4` |
| Corpo | `/corpo` | `#D97534` | `#f97316` |
| Mente | `/mente` | `#D9962E` | `#eab308` |
| Patrimônio | `/patrimonio` | `#4F88D4` | `#3b82f6` |
| Carreira | `/carreira` | `#DB6478` | `#f43f5e` |
| Experiências | `/experiencias` | `#C76795` | `#ec4899` |
| Conquistas | `/conquistas` | `#D9962E` | `#f59e0b` |
| Configurações | `/configuracoes` | `#6F7986` | `#64748b` |

**Cores de módulo são identificação, NÃO accent.** CTAs e foco usam sempre `--sl-em` (Verde Esmeralda).

---

## Regras absolutas de código

1. **Sempre TypeScript** — sem `.js` ou `.jsx`. Props tipadas com `interface`.
2. **Sempre Server Components por padrão** — usar `'use client'` só quando necessário (interatividade, hooks, estado).
3. **Nunca CSS inline arbitrário** — usar Tailwind classes ou CSS variables do `tokens-v3.css`.
4. **Imports absolutos** com `@/` — nunca `../../`.
5. **shadcn/ui primeiro** — antes de criar um componente do zero, verificar se existe em `@/components/ui/`.
6. **Fontes (v3):**
   - **Syne** — display: títulos, scores, KPIs, **todos os números de valor** (peso 500/600/700/800). Space Grotesk é fallback.
   - **DM Sans** — body unificado (desktop e mobile, sem mudar entre devices)
   - **IBM Plex Mono** — APENAS para timestamps, IDs, código (zero sem corte, ao contrário do DM Mono)
7. **Zod em API routes** — todo body de POST deve ser validado com Zod schema antes de processar.
8. **Sem emoji em chrome** (G-07) — usar lucide-react para tudo, inclusive ícones de categoria.

---

## Design System v3

### Sistema de temas (4 — reduzido de 12)

| Tema | Tipo | ID | --sl-bg |
|------|------|----|---------| 
| Navy Deep | Dark (padrão) | `navy-deep` | `#0B0F14` |
| Midnight | Dark | `midnight` | `#0F0B1F` |
| Charcoal | Dark | `charcoal` | `#181818` |
| Cream | Light | `cream` | `#F5F2EC` |

Temas controlados via `data-theme` no `<html>`. Selecionado via Zustand store e persistido no profile.

> Os 8 temas antigos (Obsidian, Rosewood, Graphite, Twilight, Mint Garden, Arctic, Sahara, Blossom, Serenity) foram **removidos** na v3 para reduzir custo de manutenção.

### Cores de marca (invariantes em todos os temas)

```css
--sl-em:         #0F766E    /* Verde Esmeralda — accent primário */
--sl-em-soft:    rgba(15, 118, 110, 0.12)
--sl-em-strong:  #138A80    /* hover */
--sl-el:         #0B2D34    /* Azul Petróleo profundo */
--sl-mist:       #96D1C6    /* Verde Névoa — toques sutis */
--sl-gold:       #D9C89A    /* Areia Dourada — marcos especiais, conquistas raras */

/* Gradient SyncLife — uso restrito (ver G-03) */
--sl-grad: linear-gradient(135deg, #0F766E, #0B2D34)
```

**Regra G-03:** `--sl-grad` é proibido em botões, backgrounds, page titles, scores e eyebrows. **Permitido apenas em:** logo SVG, anel de meta (RingProgress).

### Tokens de superfície (mudam conforme o tema)

```tsx
// Correto — adapta ao tema
<div className="bg-[var(--sl-s1)] border border-[var(--sl-border)]">

// Errado — hardcoded
<div className="bg-[#131922] border border-white/10">
```

| Variable | Propósito |
|----------|-----------|
| `--sl-bg` | Background da página |
| `--sl-s1` | Superfície de cards |
| `--sl-s2` | Superfície secundária (hover, inputs) |
| `--sl-s3` | Superfície terciária (progress backgrounds) |
| `--sl-s-hero` | Superfície hero (cards de destaque) |
| `--sl-t1` | Texto primário (off-white no dark, navy no light) |
| `--sl-t2` | Texto secundário |
| `--sl-t3` | Texto terciário (labels, placeholders) |
| `--sl-t4` | Texto muted (disabled, captions) |
| `--sl-border` | Borda padrão (luminance, não cor sólida) |
| `--sl-border-h` | Borda em hover |
| `--sl-border-em` | Borda accent (Verde Esmeralda translúcido) |

### Cores de status

```tsx
const STATUS = {
  success: '#1FA67A',  // verde vivo — receitas, Finanças, ≤70% orçamento, on track (distinto do accent --sl-em #0F766E)
  warning: '#D9962E',  // âmbar — 70-85% orçamento, atenção
  danger:  '#DB6478',  // coral-vermelho — despesas, >85%, erros
  info:    '#3CA0B5',  // ciano — agenda, neutralidade
}
```

> **Importante:** `--sl-em` (`#0F766E`, petróleo profundo) é o **accent de marca** (CTAs, foco, brand). `--sl-success` (`#1FA67A`, esmeralda viva) é a **cor de status positivo**. Eles são **distintos**, não conflate.

Cada um tem variação `-bg` (opacity 10%) para backgrounds de chips.

### Regra de cor para barras de orçamento

```tsx
function getProgressColor(pct: number): string {
  if (pct > 85) return 'var(--sl-danger)'
  if (pct > 70) return 'var(--sl-warning)'
  return 'var(--sl-success)'
}
// Metas: SEMPRE gradient — única exceção da regra G-03
// background: 'var(--sl-grad)'
```

### Tipografia

```tsx
// Display — títulos, KPIs, scores, valores numéricos
<h1 className="font-[Syne] font-bold text-3xl tracking-tight">Dashboard</h1>

// Valores numéricos (moeda, %, contagens) — Syne + tabular-nums (via .sl-num/.sl-num-strong)
<span className="sl-num-strong text-xl text-[var(--sl-em)]">
  R$ 1.840,00
</span>

// Body — DM Sans
<p className="font-[DM_Sans] text-sm text-[var(--sl-t2)]">
  Texto corrido em DM Sans 13px.
</p>

// Mono — APENAS timestamps, IDs, código
<time className="font-[IBM_Plex_Mono] text-xs text-[var(--sl-t3)]">21:14</time>

// Eyebrow uppercase (categorias, seção headers)
<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
  RECEITAS · MAIO 2026
</p>
```

#### Classes utilitárias

```css
.sl-num         /* Syne 500 + tabular-nums + letter-spacing -0.015em (valores em listas) */
.sl-num-strong  /* Syne 600 + tabular-nums + letter-spacing -0.02em (KPIs, hero) */
.font-display   /* Syne — alias para títulos quando não usar font-[Syne] inline */
```

**Regra G-02:** todo valor monetário/percentual/contagem usa `.sl-num` ou `.sl-num-strong`, **nunca** mono.

### Máscara de valores (G-08)

| Tipo | Formato | Exemplo |
|---|---|---|
| Moeda BRL | `R$ X.XXX,XX` | `R$ 1.840,00` |
| Moeda compacta | `R$ X,Yk` | `R$ 24,5k` (em espaços apertados) |
| Percentual | `X%` ou `X,Y%` | `37%`, `8,2%` |
| Negativo | `– R$ X,XX` (en-dash + espaço) | `– R$ 320,00` |
| Delta | `+X%` ou `-X%` em cor | `+12%` (verde), `-5%` (vermelho) |

Helper em `@/lib/format/currency.ts`:

```ts
export const fmtBRL = (n: number, { compact = false } = {}) => {
  if (compact && Math.abs(n) >= 1000)
    return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k'
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
```

---

## 6 Padrões de composição (anatomia de tela v3)

Toda tela do SyncLife cai em um destes 6 padrões. Veja `DESIGN-SYSTEM-v3.md` §7 para a matriz que mapeia cada uma das 45 telas ao padrão correto.

### Padrão 1 — Overview com KPIs (ex: Dashboard, Corpo)

```
TopBar (saudação + ações)
↓
Hero (1 elemento focal — score gigante + sparkline)
↓
Mosaic (grid 4×N módulos)
↓
KPI strip (4 cols)
↓
Grid 1.4fr / 1fr (LEFT: lista densa + IA · RIGHT: 2-3 cards laterais)
```

### Padrão 2 — Módulo denso com IA (ex: Finanças, Tempo, Patrimônio)

```
TopBar com navegador de período + CTA "+ Nova X"
↓
4 KPI cards (com pill de status)
↓
Saúde do módulo (alerta horizontal com eyebrow vertical)
↓
Consultor IA (card hero com 4 insight tiles + ask input)
↓
2 charts side-by-side (1.4fr / 1fr)
↓
Chart full-width (timeline dia-a-dia)
```

### Padrão 3 — Lista + filtros (ex: Transações, Atividades, Viagens)

```
Header + filtros (pill group + date range)
↓
Tabela ou lista de cards
↓
Paginação ou scroll infinito
```

### Padrão 4 — Form-heavy (ex: Configurações, Onboarding, Nova viagem)

```
TopBar
↓
Hero opcional (profile, contexto)
↓
Cards numerados (01 · IDENTIDADE, 02 · LOCALIDADE…)
  - SectionHeader (eyebrow + título + sub)
  - Form fields em grid 1fr ou 1fr/1fr
↓
DangerZone (se aplicável)
↓
SaveBar sticky no bottom (G-09)
```

### Padrão 5 — Emocional/gamificação (ex: Conquistas, Ranking)

```
HeroLevel (ring + nível + próximo desbloqueio)
↓
4 KPI cards de gamificação
↓
Recém-conquistadas (3 cards horizontais)
↓
Progresso + Ranking lado a lado
↓
Coleção full-width (grid 6 cols com filtros pill toggle)
```

### Padrão 6 — Marketing/público (ex: Landing, Pricing, Login)

```
TopNav sticky com blur
↓
Hero (headline gigante + sub + CTAs + mockup 3D)
↓
Social proof (logos, números)
↓
Seções de feature em grid (cards)
↓
Card hero featured
↓
Pricing (2-3 planos)
↓
FAQ (acordeão)
↓
CTA final + Footer 5 colunas
```

---

## 10 Regras visuais (G-01 a G-10)

| Regra | Resumo |
|---|---|
| **G-01** Tooltips obrigatórias | Todo gráfico (barras, linhas, donut, sparkline interativa) DEVE ter tooltip ao hover usando `<ChartTooltip>` |
| **G-02** Mono apenas timestamps/IDs | IBM Plex Mono restrito a hora, código, IDs. Valores numéricos = Syne + tabular-nums (`.sl-num`/`.sl-num-strong`) |
| **G-03** Gradient só em logo + ring | `--sl-grad` proibido em botões, backgrounds, scores, eyebrows |
| **G-04** Scroll invisível em mobile | Containers em bezel mobile recebem `.phone-scroll` (scrollbar hidden) |
| **G-05** UM hero por tela | Cada tela tem 1 card hero (rounded-2xl, padding maior, ruído sutil opcional). Resto secundário |
| **G-06** Cor de módulo é identificação | Cores de módulo só em ícones/dots/bordas. CTAs sempre `--sl-em` |
| **G-07** Sem emoji em chrome | Estado bloqueado usa opacity 40% + grayscale + ícone `✕`. Nunca 🔒 |
| **G-08** SaveBar sticky em forms | Tela com edição mostra `<SaveBar>` ao bottom quando houver alterações não salvas |
| **G-09** Eyebrows numerados em forms longos | Forms com >3 seções: "01 · IDENTIDADE", "02 · LOCALIDADE"… em `--sl-em` |
| **G-10** Logo: petrol stroke + estrela gold | Logo SyncLife mantém Verde Esmeralda nos orbitais + Areia Dourada `--sl-gold` fixa na estrela |

---

## Componentes base v3 (em `@/components/`)

### Layout & estrutura (em `@/components/ui/`)

| Componente | Uso |
|---|---|
| `<SLCard>` | Container base. bg `--sl-s1`, border `--sl-border`, radius 16px. Props: `hover`, `hero`, `noPadding` |
| `<KpiCard>` | Métrica com eyebrow + valor `.sl-num-strong` + delta. Props: `label`, `value`, `delta`, `deltaType`, `accent`, `icon` |
| `<SaveBar>` | Pill sticky no rodapé com Descartar/Salvar. Props: `hasChanges, onSave, onDiscard, saving` (G-08) |
| `<DangerZone>` | Card com borda `--sl-danger` translúcida + ações destrutivas |
| `<BottomSheet>` | Sheet mobile com handle + content |
| `<SectionHeader>` | Eyebrow numerada uppercase em `--sl-em` + título + sub. Props: `eyebrow, title, sub` (G-09) |

### Brand (em `@/components/`)

| Componente | Uso |
|---|---|
| `<SyncLifeLockup>` | Logo lockup: mark PNG + texto "Sync" (`--sl-t1`) + "Life" (`--sl-em`) + tagline opcional. Props: `height, withTagline`. Usado em auth e marketing. |

### Form primitives (em `@/components/ui/`)

| Componente | Props principais |
|---|---|
| `<TextField>` | `label, hint, error, type, placeholder, prefix, suffix, value, onChange` (forwardRef) |
| `<SelectField>` | `label, value, onChange, options: {value, label}[], hint, error` (com ChevronDown overlay) |
| `<ToggleRow>` | `label, sub, defaultOn` ou `checked + onChange`. Reusa `<ToggleSwitch>` |

### Dashboard (em `@/components/dashboard/`)

| Componente | Uso |
|---|---|
| `<HeroScoreMassive>` | Hero único do Dashboard: score `clamp(80,11vw,120px)` em Syne + sparkline + pill status + "Como melhorar →" |
| `<SparklineCurve>` | SVG curve (Catmull-Rom→Bezier) + área gradient + dot final |
| `<FinancialStrip>` | KPI strip 4 cols com divisores: Saldo / Receitas / Despesas / Poupança |
| `<HighlightsCard>` | Card lateral com Corpo + Patrimônio + Próxima viagem |

### Finanças (em `@/components/financas/`)

| Componente | Uso |
|---|---|
| `<KpiStrip>` | 4 cards Receitas/Despesas/Saldo/Poupança em valores `.sl-num-strong` |
| `<HealthBand>` | Alerta horizontal com border-left status + eyebrow vertical + CTA "Ver análise →" |
| `<AiConsultant>` (= ConsultorIA) | Card hero com header + 4 insight tiles 2×2 (border-left status colorido) + input ask |
| `<HistoricoChart>` | Grid 1.4fr/1fr: BarChart Receitas vs Despesas + Donut Gastos por categoria com lista lateral |
| `<FluxoCaixaSection>` | Eyebrow "FLUXO DE CAIXA" + H3 "Saldo dia a dia" + timeline scroll horizontal |

### Conquistas (em `@/components/conquistas/`)

| Componente | Uso |
|---|---|
| `<HeroLevel>` | Ring SVG 150px com `--sl-grad` (exceção G-03) + nível em Syne 64px + side rail (Top X% + SuperPaws) |
| `<ConqKpiStrip>` | 4 KPIs: Badges / Streak / Economizado (fmtBRL) / SuperPaws |
| `<RecentBadges>` | 3 cards horizontais com ícone tinted + RarityPill + data |
| `<CategoryProgress>` | Lista 7 categorias com barra horizontal colorida + `X/Y` badges |
| `<FriendsRanking>` | Top 5 com avatar inicial + nível + SuperPaws. "Você" destacado |
| `<BadgeCollection>` | Grid 6 cols xl / 4 md / 2 sm + filtros pill por categoria + toggle "Mostrar bloqueadas" |
| `<BadgeCard>` | Card individual. Locked = `opacity-40 grayscale + <X>` (G-07, NUNCA 🔒) |
| `<RarityPill>` | `comum/rara/epica/lendaria` com cores: t3 / info / mod-fut / gold |

### Configurações (em `@/components/`)

| Componente | Uso |
|---|---|
| `<ProfileHero>` | Hero com avatar gradient 88px + dot online + PRO/FREE badge + nome Syne + meta info + "Ver perfil público →" |

### Indicadores (em `@/components/ui/`)

| Componente | Uso |
|---|---|
| `<ProgressBar>` | Props: `value`, `variant` (budget/goal/habit), `height`. Cor automática pela regra |
| `<RingProgress>` | Anel SVG. **Sempre usa `--sl-grad`** (G-03 exception) |
| `<Sparkline>` | Linha SVG + área com gradient + tooltip ao hover (G-01) |
| `<ChartTooltip>` | Padrão de tooltip. bg `--sl-s-hero`, shadow longo. Conteúdo: título → linhas key/value → divisor opcional |

### Chips, pills, badges (em `@/components/ui/`)

| Componente | Uso |
|---|---|
| `<StatusTag>` | `success/warning/danger/info/cyan/orange/gray` |
| `<DomainChip>` | Pill com dot colorido + nome do módulo |
| `<KbdChip>` | Atalho de teclado (`⌘K`, `↵`, `esc`) — IBM Plex Mono |
| `<StreakBadge>` | Ícone Flame + N dias |

### Layout shells (em `@/components/shell/`)

| Componente | Uso |
|---|---|
| `<ModuleBar>` | Rail esquerda 60-72px. Item ativo: `border-left 2-3px` na cor do módulo + dot/glow |
| `<Sidebar>` | Sidebar interna 228px com `<SidebarScore>` no topo + sub-rotas do módulo ativo |
| `<SidebarScore>` | Mini-card âncora **per-módulo** (detecta `activeModule` via `useShellStore`). Renderiza eyebrow + value + delta + progress bar via hooks reais: `useScoreEngine`, `useBudgets`, `useXP`. Retorna `null` em Configurações. |
| `<TopHeader>` | Header desktop **enxuto** (h-48px). Theme pill + notif bell + toggle sidebar. **Sem saudação** — saudação fica em cada `page.tsx`. |
| `<MobileBottomBar>` | Pill flutuante mobile com 5 tabs + center `+` FAB sólido `var(--sl-em)` (G-03) |

### Auth (em `@/components/SyncLifeLockup.tsx` + `app/(auth)/`)

- **Auth layout** força tema dark via `data-theme="navy-deep" data-scheme="dark"` no wrapper `.auth-page`. Isso ignora a preferência de tema do user porque o protótipo de auth foi feito dark-only.
- Use `<SyncLifeLockup height={120} withTagline />` no painel visual e `<SyncLifeLockup height={56} />` no formulário (centralizado via `.auth-logo-brand-link { display: flex; justify-content: center }`).

---

## Estrutura padrão de tela v3 (template)

```tsx
'use client'

import { SLCard, KpiCard, SectionHeader } from '@/components/ui'
import { fmtBRL } from '@/lib/format/currency'

export default function NomeDaTela() {
  return (
    <div className="max-w-[1400px] mx-auto px-10 py-8">

      {/* 1. TopBar */}
      <header className="flex items-end justify-between gap-6 mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
            FINANÇAS · MAIO 2026
          </p>
          <h1 className="font-[Syne] font-bold text-3xl tracking-tight text-[var(--sl-t1)]">
            Visão geral
          </h1>
        </div>
        <button className="btn-primary">+ Nova transação</button>
      </header>

      {/* 2. KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Receitas"   value={fmtBRL(5000)} delta="+8%"  accent="var(--sl-em)" />
        <KpiCard label="Despesas"   value={fmtBRL(3160)} delta="63%"  accent="var(--sl-danger)" />
        <KpiCard label="Saldo"      value={fmtBRL(1840)} delta="+12%" accent="var(--sl-em)" />
        <KpiCard label="Poupança"   value="37%"           delta="Meta: 30%" accent="var(--sl-em)" />
      </div>

      {/* 3. Conteúdo principal */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-5 mb-5 max-lg:grid-cols-1">
        <div className="flex flex-col gap-5">
          {/* Coluna principal: charts, Consultor IA */}
        </div>
        <div className="flex flex-col gap-5">
          {/* Coluna lateral: metas, agenda, destaques */}
        </div>
      </div>

    </div>
  )
}
```

---

## Regras de copy (v3)

### Tom
- **Você**, nunca "o usuário"
- **Nós** apenas quando SyncLife faz algo pelo usuário
- **Nunca eu** (sem persona de chatbot)
- **Sentence case** em tudo (botões, headings)

### Pontuação
- ❌ **Travessão (—) proibido na copy** (é o tell de "AI-generated")
- ✅ Use vírgula, ponto, dois-pontos, ou `·` (middle dot) em eyebrows
- En-dash (–) permitido em valores negativos: `– R$ 320,00`

### Microcopy
| Don't | Do |
|---|---|
| "Great! Saved! ✅" | "Salvo." |
| "Welcome back, User!" | "Sábado, 23 maio." |
| "ERROR: validation failed" | "Faltou preencher o e-mail." |
| "Add Your First Habit!" | "Comece registrando algo do seu dia." |

---

## Padrões de Supabase (inalterado v2 → v3)

```tsx
// Server Components:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Client Components:
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

---

## APIs de IA (inalterado)

| Rota | Provider | Validação |
|------|----------|-----------|
| `/api/ai/cardapio` | Google Gemini | Zod input + output schema |
| `/api/ai/coach` | Groq Llama 3.3 | Zod input schema |
| `/api/ai/financas` | Google Gemini | Zod input schema |
| `/api/ai/viagem` | Google Gemini | Zod input schema |
| `/api/cotacoes` | brapi.dev | Zod ticker validation |

Todas as APIs de IA exigem autenticação Supabase e verificam env vars.

## APIs adicionais (inalterado)

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/api/push/subscribe` | POST/DELETE | Inscrição/remoção de push (VAPID) |
| `/api/push/send` | POST | Envio de push notification |
| `/api/cron/weekly-digest` | GET (cron) | Resumo semanal automático (Dom 10h UTC) |
| `/api/integrations/google-calendar/auth` | GET | OAuth flow |
| `/api/integrations/google-calendar/callback` | GET | OAuth callback |
| `/api/integrations/google-calendar/sync` | POST | Sync bidirecional |

---

## Migração v2 → v3 (concluída — Mai 2026)

Branch `redesign/visual-refresh-v3`. Migração estrutural completa nas 7 telas-base (Landing, Login, Cadastro, Dashboard, Finanças, Conquistas, Configurações) + Mobile Dashboard.

**Resumo das mudanças aplicadas:**
- Tokens: `synclife-tokens.css` removido; `globals.css` + `themes.css` espelham `tokens-v3.css`. Cores migradas (paleta v2 → dessaturada v3, vide tabela §"Módulos"). `--sl-em #0F766E` (brand) distinto de `--sl-success #1FA67A`.
- Tipografia: Syne carregada via `next/font/google` como primária para display/números. DM Sans body unificado. IBM Plex Mono restrito a timestamps/IDs. DM Mono e Outfit removidos.
- Temas: 12 → 4 (`navy-deep` default, `midnight`, `charcoal`, `cream`). Map de migração legacy em `(app)/layout.tsx`. Auth força `navy-deep`.
- Iconografia: ~150 emojis migrados para Lucide React. Logo via `<SyncLifeLockup>` (mark PNG + texto). G-07 aplicado em chrome.
- Componentes: criados `<TextField>`, `<SelectField>`, `<ToggleRow>`, `<SectionHeader>`, `<SaveBar>`, `<DangerZone>`, `<SyncLifeLockup>`, família Conquistas (`HeroLevel`, `BadgeCollection`, etc.), família Dashboard (`HeroScoreMassive`, `SparklineCurve`, `FinancialStrip`, `HighlightsCard`).
- Sidebar: `<SidebarScore>` refatorado para mostrar dado real per-módulo (não mais hardcoded "74").
- TopHeader: saudação removida (page header é o único). Altura reduzida.
- Botões: sem gradient (G-03). `--sl-em` sólido nos CTAs.
- DB: migration `026_profile_v3_columns.sql` adiciona `preferred_name`, `phone`, `bio`, `language`, `date_format`, `week_start` em `profiles`.

**Pendências não-bloqueantes:**
- Mobile screens fora de Dashboard (FinancasMobile, ConquistasMobile etc.) ainda seguem padrão antigo — protótipo só tem `mobile/Mobile.jsx`.
- ~35 arquivos mobile genéricos podem ter emojis residuais — sweep futuro.
- ~70 ocorrências de `toLocaleString` manual fora de Finanças — substituir por `fmtBRL`.
- ~87 `any` types em hooks (use-score-engine, use-relatorio-completo, use-badge-engine).

Para detalhes completos do que foi mudado em cada arquivo, ver `memory/project_v3_migration.md`.

---

## Checklist antes de entregar qualquer tela (v3)

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Visual correto em **4 temas** (testar Navy Deep + Cream no mínimo)
- [ ] Segue um dos 6 padrões de composição (§6 DESIGN-SYSTEM-v3.md)
- [ ] Hero único na tela (G-05)
- [ ] Valores monetários e % em `font-[Syne]` + `tabular-nums` (use `.sl-num` ou `.sl-num-strong`, NUNCA Mono)
- [ ] Moeda formatada com `fmtBRL()` — `R$ 1.840,00`
- [ ] Tooltip em todo gráfico (G-01)
- [ ] Cor de barra segue regra: <=70% verde, 70-85% amarelo, >85% vermelho, metas gradient
- [ ] Hover de card: `hover:border-[var(--sl-border-h)]`
- [ ] Responsivo: colapsa para 1 coluna em `max-lg`
- [ ] Lucide React para TUDO — nenhum emoji em chrome (G-07)
- [ ] Sem em-dash (—) na copy
- [ ] CTA primary em `--sl-em` sólido (nunca gradient — G-03)
- [ ] Form com >3 seções: eyebrows numerados (G-09)
- [ ] Tela de edição: `<SaveBar>` sticky aparece com alterações (G-08)
- [ ] Nenhum `console.log` ou `any` em produção
- [ ] API routes com Zod validation no body

---

## Referências

- **`DESIGN-SYSTEM-v3.md`** — documento completo (tokens, type, 15+ componentes, 6 padrões, matriz das 45 telas, regras G-01 a G-10, migração)
- **`tokens-v3.css`** — todos os tokens prontos pra import
- `prototypes/` — 7 protótipos React standalone (dashboard, finanças, conquistas, configurações, mobile, landing, auth) que servem de blueprint
- `web/src/app/globals.css` — Tailwind + tokens-v3.css imported
- `web/src/styles/themes.css` — 4 temas via `data-theme`

---
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Write(*)",
      "Edit(*)",
      "MultiEdit(*)"
    ]
  }
}
*SyncLife CLAUDE.md v3 — atualizado Mai 2026. Migração v2 → v3 concluída: paleta Petróleo (`--sl-em #0F766E` brand, `--sl-success #1FA67A`), 4 temas, **Syne** display (Space Grotesk fallback), IBM Plex Mono restrito, sem emoji em chrome, sem em-dash, 6 padrões de composição, regras G-01 a G-10.*
