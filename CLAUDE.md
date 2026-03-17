# SyncLife — Guia de Desenvolvimento para o Claude Code

> Leia este arquivo **antes de qualquer tarefa**. Ele define o stack, as convenções
> e o Design System do projeto. Não improvise: siga estas regras.

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
│   │   └── globals.css    ← tokens de cor SyncLife + Tailwind base
│   ├── components/
│   │   ├── ui/            ← componentes shadcn/ui (não editar diretamente)
│   │   └── [feature]/     ← componentes específicos por feature
│   ├── lib/
│   │   ├── supabase/      ← client, server, middleware
│   │   └── utils.ts       ← cn() e outros utilitários
│   ├── hooks/             ← custom hooks (32+)
│   ├── stores/            ← Zustand stores
│   ├── styles/            ← themes.css (12 temas)
│   └── types/             ← TypeScript types
├── supabase/
│   └── migrations/        ← migrations SQL (24)
└── CLAUDE.md              ← este arquivo
```

---

## Módulos (11)

| Módulo | Rota base | Cor |
|--------|-----------|-----|
| Panorama | `/dashboard` | `#6366f1` |
| Finanças | `/financas` | `#10b981` |
| Futuro | `/futuro` | `#8b5cf6` |
| Tempo | `/tempo` | `#06b6d4` |
| Corpo | `/corpo` | `#f97316` |
| Mente | `/mente` | `#eab308` |
| Patrimônio | `/patrimonio` | `#3b82f6` |
| Carreira | `/carreira` | `#f43f5e` |
| Experiências | `/experiencias` | `#ec4899` |
| Conquistas | `/conquistas` | `#f59e0b` |
| Configurações | `/configuracoes` | `#64748b` |

---

## Regras absolutas de código

1. **Sempre TypeScript** — sem `.js` ou `.jsx`. Props tipadas com `interface`.
2. **Sempre Server Components por padrão** — usar `'use client'` só quando necessário (interatividade, hooks, estado).
3. **Nunca CSS inline em estilo arbitrário** — usar Tailwind classes ou CSS variables do `globals.css`.
4. **Imports absolutos** com `@/` — nunca `../../`.
5. **shadcn/ui primeiro** — antes de criar um componente do zero, verificar se existe em `@/components/ui/`.
6. **Fontes**: Syne (títulos/display), DM Mono (valores monetários e %). Outfit é a fonte base do body desktop. **DM Sans** é a fonte base do body mobile (< 1024px, aplicada via media query no globals.css). Adicionar `font-[Syne]` e `font-[DM_Mono]` via Tailwind quando necessário.
7. **Zod em API routes** — todo body de POST deve ser validado com Zod schema antes de processar.

---

## Design System SyncLife

### Sistema de temas

O SyncLife usa **12 temas** controlados via atributo `data-theme` no `<html>`:

| Tema | Tipo | ID |
|------|------|----|
| Navy Dark | Dark | `navy-dark` |
| Obsidian | Dark | `obsidian` |
| Rosewood | Dark | `rosewood` |
| Graphite | Dark | `graphite` |
| Twilight | Dark | `twilight` |
| Carbon | Dark | `carbon` |
| Clean Light | Light | `clean-light` |
| Mint Garden | Light | `mint-garden` |
| Arctic | Light | `arctic` |
| Sahara | Light | `sahara` |
| Blossom | Light | `blossom` |
| Serenity | Light | `serenity` |

Temas definidos em `web/src/styles/themes.css`. Tipos em `web/src/types/shell.ts` (`ThemeId`).
Tema selecionado via Zustand store (`shell-store.ts`) e persistido no profile do usuário.

### Cores de marca (invariantes em todos os temas)

```css
--sl-em:   #10b981   /* Esmeralda — cor primária */
--sl-el:   #0055ff   /* Azul Elétrico — acento */
--sl-grad: linear-gradient(135deg, #10b981, #0055ff)

/* Cores de módulo (usadas em bordas, ícones, badges, tabs mobile) */
--color-pan: #6366f1   /* Panorama / Home — Indigo */
```

No Tailwind, usar as classes geradas pelos tokens do `globals.css`:
- `text-[#10b981]` ou `text-[var(--sl-em)]` para a cor Esmeralda
- `bg-[#0055ff]` ou `bg-[var(--sl-el)]` para o Azul Elétrico
- Para gradiente de texto: classe utilitária `text-sl-grad` (definida no globals.css)

### Tokens de superfície (mudam conforme o tema)

Usar via CSS variables — o tema atual define o valor automaticamente:

```tsx
// Correto — adapta ao tema
<div className="bg-[var(--sl-s1)] border border-[var(--sl-border)]">

// Errado — hardcoded, não adapta ao tema
<div className="bg-[#07112b] border border-white/10">
```

Principais variáveis (valores variam por tema):

| Variable | Propósito |
|----------|-----------|
| `--sl-bg` | Background da página |
| `--sl-s1` | Superfície de cards |
| `--sl-s2` | Superfície secundária (hover, inputs) |
| `--sl-s3` | Superfície terciária (backgrounds de barras) |
| `--sl-t1` | Texto primário |
| `--sl-t2` | Texto secundário |
| `--sl-t3` | Texto terciário (labels, placeholders) |
| `--sl-border` | Borda padrão |
| `--sl-border-h` | Borda em hover |

### Cores de status (fixas)

```tsx
const STATUS_COLORS = {
  success: '#10b981',  // verde — receitas, metas no ritmo
  danger:  '#f43f5e',  // vermelho — despesas, acima do orçamento
  warning: '#f59e0b',  // amarelo — atenção, próximo do limite
  info:    '#06b6d4',  // cyan — agenda, saúde
  purple:  '#a855f7',  // roxo — estudos
  orange:  '#f97316',  // laranja — streaks, recorrentes
}
```

### Regra de cor para barras de orçamento

```tsx
function getProgressColor(pct: number): string {
  if (pct > 85) return '#f43f5e'  // vermelho — estourado
  if (pct > 70) return '#f59e0b'  // amarelo — atenção
  return '#10b981'                 // verde — no ritmo
}
// Metas: sempre gradiente  background: 'linear-gradient(90deg, #10b981, #0055ff)'
```

### Tipografia

```tsx
// Títulos de página, scores, números grandes
<h1 className="font-[Syne] font-extrabold text-2xl">Dashboard</h1>

// Valores monetários e percentuais — SEMPRE DM Mono
<span className="font-[DM_Mono] font-medium text-xl text-[#10b981]">
  R$ 5.000
</span>

// Label uppercase (categorias, seção headers)
<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">
  Receitas
</p>
```

---

## Estrutura padrão de tela

**Toda tela autenticada segue esta anatomia:**

```tsx
export default function NomeDaTela() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* 1. Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]">
          Nome da Tela
        </h1>
        <div className="flex-1" />
        <button className="btn-primary">+ Nova Ação</button>
      </div>

      {/* 2. Summary Strip — 4 KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Receitas" value="R$ 5.000" delta="+12%" accent="#10b981" />
        <KpiCard label="Despesas" value="R$ 3.200" delta="-5%"  accent="#f43f5e" />
        <KpiCard label="Saldo"    value="R$ 1.800" delta=""     accent="#0055ff" />
        <KpiCard label="Metas"    value="3 ativas" delta="1 em risco" accent="#f59e0b" />
      </div>

      {/* 3. Conteúdo principal */}
      <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-4">
          {/* Coluna principal */}
        </div>
        <div className="flex flex-col gap-4">
          {/* Coluna lateral */}
        </div>
      </div>

      {/* 4. Bottom grid — 3 colunas */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <SLCard>...</SLCard>
        <SLCard>...</SLCard>
        <SLCard>...</SLCard>
      </div>

    </div>
  )
}
```

---

## Componentes base do SyncLife

### SLCard — card base

```tsx
// components/ui/sl-card.tsx
interface SLCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function SLCard({ children, className, hover = true }: SLCardProps) {
  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5',
      'sl-fade-up',
      hover && 'transition-colors hover:border-[var(--sl-border-h)]',
      className
    )}>
      {children}
    </div>
  )
}
```

### KpiCard — card de métrica com barra de acento

```tsx
// components/ui/kpi-card.tsx
interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent?: string  // cor da barra no topo
}

export function KpiCard({ label, value, delta, deltaType = 'neutral', accent = '#10b981' }: KpiCardProps) {
  const deltaColor = {
    up:      'text-[#10b981]',
    down:    'text-[#f43f5e]',
    warn:    'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden
                    transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
      <div
        className="absolute top-0 left-5 right-5 h-0.5 rounded-b"
        style={{ background: accent }}
      />
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
        {label}
      </p>
      <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">
        {value}
      </p>
      {delta && (
        <p className={cn('text-[11px] mt-1', deltaColor)}>{delta}</p>
      )}
    </div>
  )
}
```

### ProgressBar — barra de progresso com cor automática

```tsx
// components/ui/progress-bar.tsx
interface ProgressBarProps {
  value: number  // 0-100
  variant?: 'budget' | 'goal' | 'habit'
  height?: string
}

function getColor(value: number, variant: string): string {
  if (variant === 'goal') return 'linear-gradient(90deg, #10b981, #0055ff)'
  if (value > 85) return '#f43f5e'
  if (value > 70) return '#f59e0b'
  return '#10b981'
}

export function ProgressBar({ value, variant = 'budget', height = '5px' }: ProgressBarProps) {
  const color = getColor(value, variant)

  return (
    <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: color,
        }}
      />
    </div>
  )
}
```

### RingProgress — anel SVG para metas

```tsx
// components/ui/ring-progress.tsx
interface RingProgressProps {
  value: number    // 0-100
  size?: number    // px, default 110
  strokeWidth?: number  // default 8
  color?: string
  gradient?: boolean
  label?: string   // texto abaixo do percentual
}
```

---

## Padrões de Supabase

```tsx
// Sempre usar createClient do SSR — nunca o client browser diretamente em Server Components
import { createClient } from '@/lib/supabase/server'

// Em Server Components (page.tsx, layout.tsx):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Em Client Components:
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

---

## APIs de IA

| Rota | Provider | Validação |
|------|----------|-----------|
| `/api/ai/cardapio` | Google Gemini | Zod input + output schema |
| `/api/ai/coach` | Groq Llama 3.3 | Zod input schema |
| `/api/ai/financas` | Google Gemini | Zod input schema |
| `/api/ai/viagem` | Google Gemini | Zod input schema |
| `/api/cotacoes` | brapi.dev | Zod ticker validation |

Todas as APIs de IA exigem autenticação Supabase e verificam env vars.
Para migrar para Anthropic Claude: trocar apenas a linha do `model` em cada route handler.

## APIs adicionais

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/api/push/subscribe` | POST/DELETE | Inscrição/remoção de push subscription (VAPID) |
| `/api/push/send` | POST | Envio de push notification para usuário |
| `/api/cron/weekly-digest` | GET (cron) | Resumo semanal automático (Domingo 10h UTC, protegido por CRON_SECRET) |
| `/api/integrations/google-calendar/auth` | GET | Inicia OAuth 2.0 flow com Google |
| `/api/integrations/google-calendar/callback` | GET | Callback OAuth, troca code por tokens |
| `/api/integrations/google-calendar/sync` | POST | Sincronização bidirecional com Google Calendar |

## Hooks adicionais (Sprint Mar 2026)

| Hook | Arquivo | Descrição |
|------|---------|-----------|
| `useFinancialInsights` | `hooks/use-financial-insights.ts` | Insights IA financeiros com cache mensal em localStorage (PRO) |
| `usePushNotifications` | `hooks/use-push-notifications.ts` | Subscribe/unsubscribe web push (VAPID) |
| `useRelatorioCompleto` | `hooks/use-relatorio-completo.ts` | Gerador PDF cross-module via jsPDF (PRO) |

## Componentes adicionais (Sprint Mar 2026)

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `FinancialInsightCard` | `components/financas/FinancialInsightCard.tsx` | Card de insights IA com ProGate (3 tipos: positive/warning/tip) |
| `CardapioWizard` | `components/corpo/CardapioWizard.tsx` | Wizard 4 passos: dados físicos + TMB, dieta, proteínas, refeições |
| `CoachFab` | `components/shell/CoachFab.tsx` | FAB flutuante para Coach IA (PRO only, oculto em /coach e /configuracoes) |

## Libs adicionais (Sprint Mar 2026)

| Lib | Arquivo | Descrição |
|-----|---------|-----------|
| `generateBadgeImage` | `lib/share/badge-image.ts` | Canvas API: gera card 600x400 PNG de badge com raridade |
| `shareBadgeImage` / `shareToWhatsApp` / `shareToTwitter` / `copyBadgeLink` | `lib/share/share-utils.ts` | Compartilhamento social de conquistas |
| `generateRelatorioPdfCompleto` | `lib/pdf/relatorio-completo.ts` | PDF A4 via jsPDF com 7 seções (score, finanças, futuro, corpo, patrimônio, tempo, mente) |

## Migrations recentes

| Migration | Arquivo | Descrição |
|-----------|---------|-----------|
| 023 | `supabase/migrations/023_dietary_preferences.sql` | Adiciona colunas de preferências alimentares a `health_profiles` |
| 024 | `supabase/migrations/024_user_integrations.sql` | Cria tabela `user_integrations` para OAuth tokens (Google Calendar) |

## Redirects e rotas especiais

- `/corpo/coach` redireciona para `/coach` (Coach IA cross-module, página standalone)
- `/metas` redireciona para `/futuro` (legacy)
- `/agenda` redireciona para `/tempo` (legacy)

---

## Checklist antes de entregar qualquer tela

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Visual correto nos 12 temas (testar ao menos 1 dark + 1 light)
- [ ] Segue anatomia: topbar → sum-strip → conteúdo → bottom-grid
- [ ] Valores monetários e % em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] Cores de barra seguem regra: <=70% verde, 70-85% amarelo, >85% vermelho, metas gradiente
- [ ] Animações `sl-fade-up` nos cards com delays `sl-delay-1` a `sl-delay-5`
- [ ] Hover de card: `hover:border-[var(--sl-border-h)]`
- [ ] Responsivo: colapsa para 1 coluna em `max-lg` (grid principal) e `max-sm` (KPIs)
- [ ] Lucide React para ícones UI (setas, fechar, menu) — emojis só para módulos e categoria
- [ ] Nenhum `console.log` ou `any` em produção
- [ ] API routes com Zod validation no body

---

## Referências visuais

Os protótipos HTML mostram exatamente como cada componente deve ficar visualmente:

- `synclife-design-system.html` — Design System completo (abrir no browser)
- `DESIGN-SYSTEM.md` — Documentação de tokens e regras

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
*SyncLife CLAUDE.md v2.1 — atualizado Mar 2026 (12 temas, 12 features avançadas: SW Toast, Import Nav, Share Badges, AI Insights, PDF Cross-Module, Push, Cron Digest, CI/CD, Coach Cross-Module, Cardápio Wizard, Google Calendar, PRO Gate)*
