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
| Deploy       | Vercel                             |

---

## Estrutura de pastas

```
web/
├── src/
│   ├── app/               ← App Router (pages, layouts, API routes)
│   │   ├── (auth)/        ← login, cadastro, forgot-password
│   │   ├── (dashboard)/   ← telas autenticadas
│   │   └── globals.css    ← tokens de cor SyncLife + Tailwind base
│   ├── components/
│   │   ├── ui/            ← componentes shadcn/ui (não editar diretamente)
│   │   └── [feature]/     ← componentes específicos por feature
│   ├── lib/
│   │   ├── supabase/      ← client, server, middleware
│   │   └── utils.ts       ← cn() e outros utilitários
│   └── hooks/             ← custom hooks
└── CLAUDE.md              ← este arquivo
```

---

## Regras absolutas de código

1. **Sempre TypeScript** — sem `.js` ou `.jsx`. Props tipadas com `interface`.
2. **Sempre Server Components por padrão** — usar `'use client'` só quando necessário (interatividade, hooks, estado).
3. **Nunca CSS inline em estilo arbitrário** — usar Tailwind classes ou CSS variables do `globals.css`.
4. **Imports absolutos** com `@/` — nunca `../../`.
5. **shadcn/ui primeiro** — antes de criar um componente do zero, verificar se existe em `@/components/ui/`.
6. **Fontes**: Syne (títulos/display), DM Mono (valores monetários e %). Outfit é a fonte base do body (já configurada). Adicionar `font-[Syne]` e `font-[DM_Mono]` via Tailwind quando necessário.

---

## Design System SyncLife

### Identidade visual

O SyncLife tem **duas personalidades** e **dois temas** — formando 4 combinações:

| Modo    | Tema  | Classe no `<body>` ou `<html>` |
|---------|-------|--------------------------------|
| Foco    | Dark  | *(nenhuma)* — padrão           |
| Jornada | Dark  | `jornada`                      |
| Foco    | Light | `light`                        |
| Jornada | Light | `light jornada`                |

**Foco** = analítico, denso, sem elementos motivacionais.  
**Jornada** = motivacional, narrativo, com score, conquistas e IA.

### Cores de marca (invariantes em todos os temas)

```css
--sl-em:   #10b981   /* Esmeralda — cor primária */
--sl-el:   #0055ff   /* Azul Elétrico — acento */
--sl-grad: linear-gradient(135deg, #10b981, #0055ff)
```

No Tailwind, usar as classes geradas pelos tokens do `globals.css`:
- `text-[#10b981]` ou `text-[var(--sl-em)]` para a cor Esmeralda
- `bg-[#0055ff]` ou `bg-[var(--sl-el)]` para o Azul Elétrico
- Para gradiente de texto: classe utilitária `text-sl-grad` (definida no globals.css)

### Tokens de superfície (mudam conforme o tema)

Usar via CSS variables — o tema atual define o valor automaticamente:

```tsx
// ✅ Correto — adapta ao tema
<div className="bg-[var(--sl-s1)] border border-[var(--sl-border)]">

// ❌ Errado — hardcoded, não adapta ao tema
<div className="bg-[#07112b] border border-white/10">
```

| Variable      | Dark Foco  | Dark Jornada | Light Foco | Light Jornada |
|---------------|-----------|--------------|------------|---------------|
| `--sl-bg`     | `#03071a` | `#020d08`    | `#e6edf5`  | `#c8f0e4`     |
| `--sl-s1`     | `#07112b` | `#061410`    | `#ffffff`  | `#ffffff`     |
| `--sl-s2`     | `#0c1a3a` | `#0b1e18`    | `#f0f6fa`  | `#e0f7ef`     |
| `--sl-s3`     | `#132248` | `#112b22`    | `#dde8f2`  | `#c4eede`     |
| `--sl-t1`     | `#dff0ff` | `#d6faf0`    | `#03071a`  | `#022016`     |
| `--sl-t2`     | `#6e90b8` | `#4da888`    | `#1e3a5c`  | `#0d5c3e`     |
| `--sl-t3`     | `#2e4a6e` | `#235c48`    | `#5a7a9e`  | `#4da888`     |

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

**Toda tela autenticada segue esta anatomia — sem exceções:**

```tsx
export default function NomeDaTela() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]">
          🎯 Nome da Tela
        </h1>
        <div className="flex-1" />
        {/* Pills de filtro opcional */}
        <button className="btn-primary">+ Nova Ação</button>
      </div>

      {/* ② Summary Strip — 4 KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Receitas" value="R$ 5.000" delta="+12%" accent="#10b981" />
        <KpiCard label="Despesas" value="R$ 3.200" delta="-5%"  accent="#f43f5e" />
        <KpiCard label="Saldo"    value="R$ 1.800" delta=""     accent="#0055ff" />
        <KpiCard label="Metas"    value="3 ativas" delta="1 em risco" accent="#f59e0b" />
      </div>

      {/* ③ Jornada Insight — oculto no Foco via CSS */}
      <JornadaInsight text="Você economizou R$ 180 em Alimentação este mês." />

      {/* ④ Conteúdo principal */}
      <div className="grid grid-cols-[1fr_340px] gap-4 mb-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-4">
          {/* Coluna principal */}
        </div>
        <div className="flex flex-col gap-4">
          {/* Coluna lateral */}
        </div>
      </div>

      {/* ⑤ Bottom grid — 3 colunas */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <SLCard>...</SLCard>
        <SLCard>...</SLCard>
        {/* Foco: dados/histórico. Jornada: conquistas */}
        <FocoJornadaSwitch
          foco={<HistoricoCard />}
          jornada={<ConquistasCard />}
        />
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
      // Sombra no light mode
      'dark:shadow-none shadow-sm',
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
      {/* Barra de acento no topo */}
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

### JornadaInsight — bloco de IA (invisível no Foco)

```tsx
// components/ui/jornada-insight.tsx
// Visibilidade controlada por CSS: oculto por padrão, visível em body.jornada

export function JornadaInsight({ text }: { text: React.ReactNode }) {
  return (
    // A classe 'jornada-insight' é definida no globals.css:
    // .jornada-insight { display: none }
    // body.jornada .jornada-insight { display: flex }
    <div className="jornada-insight mb-4 hidden items-start gap-3 p-4
                    bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/9
                    border border-[#10b981]/20 rounded-[18px] sl-fade-up
                    [.jornada_&]:flex">
      <span className="text-lg mt-0.5 shrink-0">💡</span>
      <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{text}</p>
    </div>
  )
}
```

### FocoJornadaSwitch — renderiza conteúdo diferente por modo

```tsx
// components/ui/foco-jornada-switch.tsx
export function FocoJornadaSwitch({
  foco,
  jornada,
}: {
  foco: React.ReactNode
  jornada: React.ReactNode
}) {
  return (
    <>
      {/* Visível apenas no Foco */}
      <div className="[.jornada_&]:hidden">{foco}</div>
      {/* Visível apenas no Jornada */}
      <div className="hidden [.jornada_&]:block">{jornada}</div>
    </>
  )
}
```

### ProgressBar — barra de progresso com cor automática

```tsx
// components/ui/progress-bar.tsx
interface ProgressBarProps {
  value: number  // 0–100
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
  const isGradient = variant === 'goal'

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
// dasharray = 2 * π * r   (r=44 → 276,  r=32 → 201)
// dashoffset = dasharray * (1 - pct/100)

interface RingProgressProps {
  value: number    // 0–100
  size?: number    // px, default 110
  strokeWidth?: number  // default 8
  color?: string
  gradient?: boolean
  label?: string   // texto abaixo do percentual
}

export function RingProgress({
  value,
  size = 110,
  strokeWidth = 8,
  color = '#10b981',
  gradient = false,
  label,
}: RingProgressProps) {
  const r = (size / 2) - strokeWidth
  const dasharray = 2 * Math.PI * r
  const dashoffset = dasharray * (1 - value / 100)
  const gradId = `ring-grad-${Math.random().toString(36).slice(2)}`

  return (
    <div className="relative inline-flex justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {gradient && (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0055ff" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--sl-s3)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={gradient ? `url(#${gradId})` : color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          style={{ strokeDasharray: dasharray, strokeDashoffset: dashoffset,
                   transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={cn(
          'font-[Syne] font-extrabold leading-none',
          gradient ? 'text-sl-grad' : '',
          size > 90 ? 'text-2xl' : 'text-lg'
        )} style={!gradient ? { color } : undefined}>
          {value}%
        </span>
        {label && (
          <span className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)]">{label}</span>
        )}
      </div>
    </div>
  )
}
```

---

## Regras Foco vs Jornada

### No Foco
- Título da tela: texto simples, cor `--sl-t1`
- Sem Life Sync Score
- Sem streak badge
- Insight IA: stats compactos (números, sem narrativa)
- Bottom card lateral: histórico / resumo de dados
- Sem badges de conquista
- Tom: preciso, analítico, neutro

### No Jornada
- Título da tela: **gradiente Esmeralda → Azul** (`text-sl-grad`)
- Life Sync Score: card hero com número grande e gradiente
- Streak badge no header: `🔥 7 dias`
- Insight IA: parágrafo narrativo com highlights coloridos
- Campo de pergunta "Pergunte algo..." no bloco de insight
- Bottom card lateral: conquistas/badges
- Cards de meta: tip contextual colorida
- Tom: motivacional, pessoal, celebrativo

### CSS para alternar por modo

```tsx
// Visível apenas no Foco
<div className="[.jornada_&]:hidden">...</div>

// Visível apenas no Jornada
<div className="hidden [.jornada_&]:block">...</div>

// Título que muda de estilo
<h1 className={cn(
  'font-[Syne] font-extrabold text-2xl',
  isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
)}>
  {isJornada ? `Boa tarde, ${user.name}! ✨` : 'Dashboard'}
</h1>
```

---

## Ícones por módulo

```tsx
const MODULE_ICONS = {
  financas:      { icon: '🐷', color: '#10b981' },
  metas:         { icon: '🎯', color: '#0055ff' },
  agenda:        { icon: '📅', color: '#06b6d4' },
  saude:         { icon: '🏥', color: '#f97316' },
  estudos:       { icon: '📚', color: '#a855f7' },
  carreira:      { icon: '💼', color: '#f59e0b' },
  investimentos: { icon: '📈', color: '#10b981' },
  receitas:      { icon: '💰', color: '#10b981' },
  despesas:      { icon: '📤', color: '#f43f5e' },
  recorrentes:   { icon: '🔄', color: '#f97316' },
  reserva:       { icon: '🛡️', color: '#0055ff' },
  streak:        { icon: '🔥', color: '#f97316' },
  conquistas:    { icon: '🏆', color: '#f59e0b' },
  ia:            { icon: '💡', color: '#10b981' },
  score:         { icon: '⭐', color: '#10b981' },
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

## Checklist antes de entregar qualquer tela

- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] Segue anatomia: topbar → sum-strip → insight → conteúdo → bottom-grid
- [ ] Valores monetários e % em `font-[DM_Mono]`
- [ ] Títulos em `font-[Syne] font-extrabold`
- [ ] Cores de barra seguem regra: ≤70% verde, 70–85% amarelo, >85% vermelho, metas gradiente
- [ ] `JornadaInsight` presente e oculto no Foco
- [ ] Bottom card alterna conteúdo por modo (dados vs conquistas)
- [ ] Animações `sl-fade-up` nos cards com delays `sl-delay-1` a `sl-delay-5`
- [ ] Hover de card: `hover:border-[var(--sl-border-h)]`
- [ ] Responsivo: colapsa para 1 coluna em `max-lg` (grid principal) e `max-sm` (KPIs)
- [ ] Lucide React para ícones UI (setas, fechar, menu) — emojis só para módulos e categoria
- [ ] Nenhum `console.log` ou `any` em produção

---

## Referências visuais

Os protótipos HTML (na raiz do projeto) mostram exatamente como cada componente deve ficar visualmente. Consulte-os quando tiver dúvida sobre aparência:

- `proto-dashboard.html` — Dashboard completo (Foco e Jornada)
- `proto-planejamento-v2.html` — Planejamento futuro com timeline
- `proto-metas.html` — Tela de metas com anéis de progresso
- `proto-navigation-v3.html` — Navegação + temas + estrutura geral
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
*SyncLife CLAUDE.md v1.0 — atualizar ao criar novos padrões globais*
