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
| Finanças | `/financas` | `#0F766E` (= accent) | `#10b981` |
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
   - **Space Grotesk** — display: títulos, scores, KPIs, **todos os números de valor** (peso 500/600/700)
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
  success: '#0F766E',  // = accent — receitas, ≤70% orçamento, on track
  warning: '#D9962E',  // âmbar — 70-85% orçamento, atenção
  danger:  '#DB6478',  // coral-vermelho — despesas, >85%, erros
  info:    '#3CA0B5',  // ciano — agenda, neutralidade
}
```

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
<h1 className="font-[Space_Grotesk] font-bold text-3xl tracking-tight">Dashboard</h1>

// Valores numéricos (moeda, %, contagens) — Space Grotesk + tabular-nums
<span className="font-[Space_Grotesk] font-medium tabular-nums text-xl text-[var(--sl-em)]">
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
.sl-num         /* Space Grotesk 500 + tabular-nums (valores em listas) */
.sl-num-strong  /* Space Grotesk 600 + tabular-nums (KPIs, hero) */
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
| **G-02** Mono apenas timestamps/IDs | IBM Plex Mono restrito a hora, código, IDs. Valores numéricos = Space Grotesk + tabular-nums |
| **G-03** Gradient só em logo + ring | `--sl-grad` proibido em botões, backgrounds, scores, eyebrows |
| **G-04** Scroll invisível em mobile | Containers em bezel mobile recebem `.phone-scroll` (scrollbar hidden) |
| **G-05** UM hero por tela | Cada tela tem 1 card hero (rounded-2xl, padding maior, ruído sutil opcional). Resto secundário |
| **G-06** Cor de módulo é identificação | Cores de módulo só em ícones/dots/bordas. CTAs sempre `--sl-em` |
| **G-07** Sem emoji em chrome | Estado bloqueado usa opacity 40% + grayscale + ícone `✕`. Nunca 🔒 |
| **G-08** SaveBar sticky em forms | Tela com edição mostra `<SaveBar>` ao bottom quando houver alterações não salvas |
| **G-09** Eyebrows numerados em forms longos | Forms com >3 seções: "01 · IDENTIDADE", "02 · LOCALIDADE"… em `--sl-em` |
| **G-10** Logo: petrol stroke + estrela gold | Logo SyncLife mantém Verde Esmeralda nos orbitais + Areia Dourada `--sl-gold` fixa na estrela |

---

## Componentes base v3 (em `@/components/ui/`)

### Layout & estrutura

| Componente | Uso |
|---|---|
| `<SLCard>` | Container base. bg `--sl-s1`, border `--sl-border`, radius 16px. Props: `hover`, `hero`, `noPadding` |
| `<KpiCard>` | Métrica com eyebrow + valor `.sl-num-strong` + delta. Props: `label`, `value`, `delta`, `deltaType`, `accent`, `icon` |
| `<HeroScore>` | Hero com score em fonte gigante + sparkline + pill (Panorama) |
| `<HeroLevel>` | Hero variant com ring SVG + nível + XP (Conquistas) |
| `<ProfileHero>` | Hero com avatar gradient + nome + meta info (Configurações) |
| `<ConsultorIA>` | Card com 4 insight tiles + chat input (Finanças, Dashboard) |
| `<SaveBar>` | Pill sticky no rodapé com Descartar/Salvar |
| `<DangerZone>` | Card com borda `--sl-danger` translúcida + ações destrutivas |
| `<BottomSheet>` | Sheet mobile com handle + content |

### Form primitives

| Componente | Props principais |
|---|---|
| `<TextField>` | `label, value, placeholder, hint, type, readOnly, prefix, suffix` |
| `<SelectField>` | `label, value, options` |
| `<ToggleRow>` | `label, sub, defaultOn` |
| `<SectionHeader>` | `eyebrow, title, sub` (eyebrow uppercase letterspaced em `--sl-em`) |

### Indicadores

| Componente | Uso |
|---|---|
| `<ProgressBar>` | Props: `value`, `variant` (budget/goal/habit), `height`. Cor automática pela regra |
| `<RingProgress>` | Anel SVG. **Sempre usa `--sl-grad`** (G-03 exception) |
| `<Sparkline>` | Linha SVG + área com gradient + tooltip ao hover (G-01) |
| `<ChartTooltip>` | Padrão de tooltip. bg `--sl-s-hero`, shadow longo. Conteúdo: título → linhas key/value → divisor opcional |

### Chips, pills, badges

| Componente | Uso |
|---|---|
| `<StatusTag>` | `success/warning/danger/info/cyan/orange/gray` |
| `<DomainChip>` | Pill com dot colorido + nome do módulo |
| `<RarityPill>` | `comum/rara/épica/lendária` (Conquistas) |
| `<KbdChip>` | Atalho de teclado (`⌘K`, `↵`, `esc`) — IBM Plex Mono |
| `<StreakBadge>` | Ícone Flame + N dias |

### Layout shells

| Componente | Uso |
|---|---|
| `<ModuleRail>` | Sidebar esquerda 60px. Item ativo: `border-left 2px` na cor do módulo |
| `<SubNav>` | Sidebar interna 240px com mini-card KPI âncora no topo + sub-rotas |
| `<TopBar>` | Header desktop com data eyebrow + saudação h1 + ações |
| `<MobileTabBar>` | Pill flutuante com 5 tabs e center `+` primary elevado |

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
          <h1 className="font-[Space_Grotesk] font-bold text-3xl tracking-tight text-[var(--sl-t1)]">
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

## Migração v2 → v3 (checklist)

Use a branch `redesign/visual-refresh-v3` para migrar. Em ordem:

### 1. Tokens
- [ ] Substituir `synclife-tokens.css` por `tokens-v3.css`
- [ ] Find/replace cores antigas → novas (ver `DESIGN-SYSTEM-v3.md` §10.1)
- [ ] Remover classes `body.jornada` e `body.light.jornada` do código (legado)

### 2. Tipografia
- [ ] `font-[Syne]` → `font-[Space_Grotesk]`
- [ ] `font-[DM_Mono]` em **valores** → `font-[Space_Grotesk]` + `tabular-nums` (classe `.sl-num` ou `.sl-num-strong`)
- [ ] `font-[DM_Mono]` em **timestamps/IDs** → `font-[IBM_Plex_Mono]`
- [ ] `font-[Outfit]` no desktop → `font-[DM_Sans]` (unificar com mobile)

### 3. Temas
- [ ] Reduzir `themes.css` de 12 → 4 temas: `navy-deep`, `midnight`, `charcoal`, `cream`
- [ ] Atualizar `ThemeId` em `types/shell.ts`
- [ ] Migrar profile dos usuários: temas antigos → mapear para `navy-deep` (default)

### 4. Iconografia
- [ ] Substituir TODOS os emojis (🐷🎯📅🏥📚) por Lucide React imports
- [ ] Atualizar mapping de ícones por módulo em `lib/icons.ts`
- [ ] Aplicar logo PNG v3 (mark + lockup) — copiar de `assets/logo-*.png`

### 5. Componentes
- [ ] Migrar `.card` legado → `<SLCard>`
- [ ] Migrar `.kpi-card` legado → `<KpiCard>`
- [ ] Adicionar novos: `<TextField>`, `<SelectField>`, `<ToggleRow>`, `<SectionHeader>`, `<SaveBar>`, `<DangerZone>`, `<RarityPill>`, `<ChartTooltip>`
- [ ] Refatorar todos os gráficos para incluir `<ChartTooltip>` (G-01)

### 6. Botões
- [ ] Remover gradient esmeralda→azul de TODOS os botões primary (regra G-03)
- [ ] Aplicar `--sl-em` sólido como bg de `.btn-primary`

### 7. Telas (ordem sugerida)
1. Dashboard (Panorama) — `/dashboard`
2. Finanças visão geral — `/financas`
3. Conquistas — `/conquistas`
4. Configurações — `/configuracoes`
5. Login + Cadastro — `/(auth)/login`, `/(auth)/cadastro`
6. Landing — `/`
7. Mobile (todas as telas)
8. Demais 38 telas (seguindo padrões §6 do DESIGN-SYSTEM-v3.md)

---

## Checklist antes de entregar qualquer tela (v3)

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Visual correto em **4 temas** (testar Navy Deep + Cream no mínimo)
- [ ] Segue um dos 6 padrões de composição (§6 DESIGN-SYSTEM-v3.md)
- [ ] Hero único na tela (G-05)
- [ ] Valores monetários e % em `font-[Space_Grotesk]` + `tabular-nums` (NUNCA Mono)
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
*SyncLife CLAUDE.md v3 — atualizado Mai 2026. Migração v2 → v3: paleta Petróleo, 4 temas, Space Grotesk display, IBM Plex Mono restrito, sem emoji em chrome, sem em-dash, 6 padrões de composição, regras G-01 a G-10.*
