# Coach-led v4 — Plano 1: Fundação + Componentes base (Fases 0-1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar os tokens de suporte (motion, z-scale, noise, reduced-motion) e construir os 6 componentes-base do design system Coach-led (`KbdChip` + `KpiStrip`, `CoachWhisper`, `ProgressList`, `Timeline`, `Donut`), todos nativos em tokens esmeralda e validados nos 4 temas — sem tocar em shell nem IA ainda.

**Architecture:** Componentes stateless/presentacionais em `web/src/components/coach/` (+ `ui/kbd-chip.tsx`), no idioma do projeto (Tailwind arbitrary + `var(--sl-*)` + `.sl-num`/`.sl-num-strong` + Lucide). Tradução 1:1 da markup de referência do handoff (Linhagem B, cyan) para tokens esmeralda + conformidade com as regras G (G-01 tooltip, G-02 `.sl-num`, G-07 Lucide). Verificação por `tsc --noEmit` + smoke test `renderToString` (vitest) + página de specimens em dark+cream.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, lucide-react, vitest + `react-dom/server`.

**Escopo — Plano 1 de 3:** Este plano cobre **Fase 0 (tokens) + Fase 1 (componentes base)** da spec `docs/superpowers/specs/2026-07-19-coach-led-redesign-design.md`. Plano 2 (Coach OS + IA + piloto, Fases 2-3) e Plano 3 (rollout + mobile, Fases 4-5) vêm depois, cada um após validação do anterior.

---

## Convenções de verificação (todo o plano)

- **Precedência:** o projeto não faz unit test de componente visual; a verificação canônica do `CLAUDE.md` é `tsc --noEmit` + `npm run build` + visual nos 4 temas. Adotamos smoke tests `renderToString` (sem DOM/RTL) para travar a API e o markup mínimo, e a página de specimens para o visual.
- Rodar comandos a partir de `web/` (é o CWD do terminal). Ex.: `npx tsc --noEmit`, `npx vitest run <arquivo>`.
- **Pré-checagem (fazer uma vez, antes da Task 1):** confirmar que o vitest roda `.tsx`. Rodar `npx vitest run --version` e criar um teste trivial se necessário. Se o vitest não tiver ambiente React, o smoke test `renderToString` ainda funciona (é server-render puro, sem DOM).
- Regras G aplicáveis aqui: **G-01** (todo gráfico tem tooltip no hover), **G-02** (número de valor usa `.sl-num`/`.sl-num-strong`, nunca mono — exceto timestamps/datas), **G-05** (hero único — não se aplica a estes componentes), **G-07** (Lucide, nunca emoji).

## File structure

| Arquivo | Responsabilidade |
|---|---|
| `web/src/styles/themes.css` (modificar) | tokens invariantes novos: motion, z-scale, backdrop, noise |
| `web/src/app/globals.css` (modificar) | keyframes de overlay, `prefers-reduced-motion`, fix `--color-cqs` |
| `web/src/components/ui/kbd-chip.tsx` (criar) | `<KbdChip>` — tecla em IBM Plex Mono |
| `web/src/components/coach/KpiStrip.tsx` (criar) | linha de KPIs hairline, 1º valor âncora ≥30px |
| `web/src/components/coach/CoachWhisper.tsx` (criar) | nudge inline soft/solid |
| `web/src/components/coach/ProgressList.tsx` (criar) | card de barras de meta current/target |
| `web/src/components/coach/Timeline.tsx` (criar) | marcos verticais done/now/future |
| `web/src/components/coach/Donut.tsx` (criar) | share chart conic-gradient + tooltip |
| `web/src/components/coach/index.ts` (criar) | barrel export |
| `web/src/components/coach/*.test.tsx` (criar) | smoke tests renderToString |
| `web/src/app/dev/coach-specimens/page.tsx` (criar, temporário) | validação visual dark+cream |

---

## Task 1: Tokens de fundação (Fase 0)

**Files:**
- Modify: `web/src/styles/themes.css` (bloco `:root` invariante, após `--transition-theme`; e bloco de animações no fim)
- Modify: `web/src/app/globals.css` (`@theme inline` para `--color-cqs`; `@layer base` para keyframes + reduced-motion)

- [ ] **Step 1: Adicionar tokens invariantes em `themes.css`**

No bloco `:root { ... }` (invariantes), logo após o bloco `--transition-theme: ...;` (linha ~56, antes do `}` que fecha o `:root`), inserir:

```css
  /* ── Coach OS: motion ── */
  --sl-ease:      cubic-bezier(0.22, 1, 0.36, 1);
  --sl-ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --sl-dur-fast:  160ms;
  --sl-dur-base:  240ms;
  --sl-dur-slow:  420ms;

  /* ── Coach OS: overlays (z-scale acima do chrome; ModuleBar usa z-60) ── */
  --sl-z-backdrop: 100;
  --sl-z-drawer:   110;
  --sl-z-palette:  120;
  --sl-z-cheat:    130;
  --sl-backdrop:   rgba(8, 12, 18, 0.62);

  /* ── Ruído sutil para hero (G-05) ── */
  --sl-noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.035 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
```

- [ ] **Step 2: Adicionar keyframes de overlay + `.sl-hero-noise` em `themes.css`**

No fim do arquivo (após o bloco `ANIMAÇÕES GLOBAIS`, depois de `@keyframes fadeUp {...}`), acrescentar:

```css
/* ── Coach OS: overlay motion ── */
@keyframes sl-slide-in-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes sl-overlay-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes sl-pop-scale {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.sl-hero-noise { background-image: var(--sl-noise); background-size: 160px 160px; }
```

- [ ] **Step 3: Adicionar `--color-cqs` em `globals.css`**

No bloco `@theme inline`, na seção `/* Módulos (paleta v3 dessaturada) */` (após `--color-cfg: #6F7986;`, linha ~89), inserir a linha faltante:

```css
  --color-cqs: #D9962E;
```

- [ ] **Step 4: Adicionar `prefers-reduced-motion` em `globals.css`**

Dentro do `@layer base` das utilidades SyncLife, antes do fechamento `} /* end @layer base — SyncLife utilities */` (linha ~325), inserir:

```css
/* ── Acessibilidade: respeitar redução de movimento (overlays Coach) ── */
@media (prefers-reduced-motion: reduce) {
  .sl-fade-up, .sl-fade, .animate-fadeup,
  [data-sl-overlay] {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 5: Verificar tipos e build de estilo**

Run: `npx tsc --noEmit`
Expected: PASS (exit 0) — CSS não afeta tipos, mas confirma que nada quebrou.

Run: `npx next build --no-lint 2>&1 | tail -5` (opcional; CSS válido não quebra o build)
Expected: build completa; se falhar, revisar sintaxe CSS dos passos 1-4.

- [ ] **Step 6: Commit**

```bash
git add web/src/styles/themes.css web/src/app/globals.css
git commit -m "feat(coach): tokens de fundação — motion, z-scale, noise, reduced-motion, fix --color-cqs"
```

---

## Task 2: `KbdChip` (pré-requisito de palette/cheat/Coach pill)

**Files:**
- Create: `web/src/components/ui/kbd-chip.tsx`
- Test: `web/src/components/ui/kbd-chip.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { KbdChip } from './kbd-chip'

describe('KbdChip', () => {
  it('renders the key inside a <kbd> with mono font', () => {
    const html = renderToString(<KbdChip>⌘K</KbdChip>)
    expect(html).toContain('<kbd')
    expect(html).toContain('⌘K')
    expect(html).toContain('font-ibm-plex-mono')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/ui/kbd-chip.test.tsx`
Expected: FAIL — `Cannot find module './kbd-chip'`.

- [ ] **Step 3: Implementar `KbdChip`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KbdChipProps {
  children: ReactNode
  className?: string
}

/** Atalho de teclado (⌘K, ⌘J, ?, esc) em IBM Plex Mono. */
export function KbdChip({ children, className }: KbdChipProps) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-[18px] items-center justify-center rounded-[4px] border border-[var(--sl-border)] bg-[var(--sl-s2)] px-1.5 py-0.5 font-ibm-plex-mono text-[10px] font-medium leading-none text-[var(--sl-t1)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/ui/kbd-chip.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/ui/kbd-chip.tsx web/src/components/ui/kbd-chip.test.tsx
git commit -m "feat(coach): KbdChip — atalho de teclado em mono"
```

---

## Task 3: `KpiStrip`

Referência de markup: `SyncLife Design System/design_handoff_synclife_v3/components/KpiStrip/KpiStrip.jsx.txt` (cyan). Remapear: `--sl-bg-surface`→`--sl-s1`, `--sl-line-subtle`→`--sl-border`, `--sl-fg-muted`→`--sl-t4`, `--sl-fg-primary`→`--sl-t1`, `--sl-fg-tertiary`→`--sl-t3`, valor em `.sl-num-strong` (G-02), ícone Lucide `ArrowUpRight` (G-07). Convenção: 1º valor é a âncora (≥30px).

**Files:**
- Create: `web/src/components/coach/KpiStrip.tsx`
- Test: `web/src/components/coach/KpiStrip.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { KpiStrip } from './KpiStrip'

describe('KpiStrip', () => {
  it('renders labels, values, the up-delta and uses sl-num-strong', () => {
    const html = renderToString(
      <KpiStrip
        items={[
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', up: true },
          { label: 'Receitas', value: 'R$ 5.000' },
        ]}
      />,
    )
    expect(html).toContain('Saldo')
    expect(html).toContain('R$ 1.840')
    expect(html).toContain('+12%')
    expect(html).toContain('sl-num-strong')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/coach/KpiStrip.test.tsx`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `KpiStrip`**

```tsx
'use client'

import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Kpi {
  label: string
  value: string
  delta?: string
  up?: boolean
  tone?: string
}

export interface KpiStripProps {
  items: Kpi[]
  className?: string
}

/** Linha de KPIs com divisores hairline; o 1º valor é a âncora (≥30px). */
export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-[14px] border border-[var(--sl-border)] bg-[var(--sl-border)]',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length || 1}, minmax(0, 1fr))` }}
    >
      {items.map((k, i) => (
        <div key={i} className="flex flex-col gap-1.5 bg-[var(--sl-s1)] px-[18px] py-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--sl-t4)]">
            {k.label}
          </span>
          <span
            className={cn('sl-num-strong leading-none', i === 0 ? 'text-[30px]' : 'text-[22px]')}
            style={{ color: k.tone ?? 'var(--sl-t1)' }}
          >
            {k.value}
          </span>
          {(k.delta || k.up) && (
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{ color: k.up ? 'var(--sl-success)' : 'var(--sl-t3)' }}
            >
              {k.up && <ArrowUpRight size={11} />}
              {k.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/coach/KpiStrip.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/coach/KpiStrip.tsx web/src/components/coach/KpiStrip.test.tsx
git commit -m "feat(coach): KpiStrip — linha de KPIs hairline com valor ancora"
```

---

## Task 4: `CoachWhisper`

Referência: `.../components/CoachWhisper/CoachWhisper.jsx.txt`. Remapear accent cyan→`--sl-em`, `--sl-accent-soft`→`--sl-em-soft`, `--sl-line-accent`→`--sl-border-em`, `--sl-bg-base`→`--sl-bg`, botão texto `#fff` (padrão dos CTAs). Ícone Lucide `Sparkles`.

**Files:**
- Create: `web/src/components/coach/CoachWhisper.tsx`
- Test: `web/src/components/coach/CoachWhisper.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachWhisper } from './CoachWhisper'

describe('CoachWhisper', () => {
  it('renders the bold lead, the text and an optional action', () => {
    const html = renderToString(
      <CoachWhisper bold="Você gastou 18% acima" text="em Lazer este mês." action="Ver categoria" variant="solid" />,
    )
    expect(html).toContain('Você gastou 18% acima')
    expect(html).toContain('em Lazer este mês.')
    expect(html).toContain('Ver categoria')
  })

  it('hides the action button when no action is given', () => {
    const html = renderToString(<CoachWhisper bold="Tudo certo" text="nenhuma ação necessária." />)
    expect(html).not.toContain('<button')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/coach/CoachWhisper.test.tsx`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `CoachWhisper`**

```tsx
'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CoachWhisperProps {
  /** Fato-líder, em bold e cor primária. */
  bold: string
  /** Contexto + recomendação. */
  text: string
  /** Rótulo do botão de ação; omitir esconde o botão. */
  action?: string
  onAction?: () => void
  /** 'soft' (dashed inline) ou 'solid' (callout preenchido). */
  variant?: 'soft' | 'solid'
  className?: string
}

/** Nudge inline do Coach — fato + recomendação + ação opcional. Nunca modal. */
export function CoachWhisper({ bold, text, action, onAction, variant = 'soft', className }: CoachWhisperProps) {
  const solid = variant === 'solid'
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-[var(--sl-border-em)] px-[15px] py-[11px] text-[13px] text-[var(--sl-t2)]',
        solid ? 'border-solid' : 'border-dashed',
        className,
      )}
      style={{
        background: solid ? 'var(--sl-em-soft)' : 'linear-gradient(90deg, var(--sl-em-soft) 0%, transparent 74%)',
      }}
    >
      <span className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border-em)] bg-[var(--sl-bg)] text-[var(--sl-em)]">
        <Sparkles size={13} />
      </span>
      <span className="flex-1 leading-normal">
        <strong className="text-[var(--sl-t1)]">{bold}</strong> {text}
      </span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-full bg-[var(--sl-em)] px-[13px] py-[7px] text-[12px] font-semibold text-white"
        >
          {action}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/coach/CoachWhisper.test.tsx`
Expected: PASS (2 testes).

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/coach/CoachWhisper.tsx web/src/components/coach/CoachWhisper.test.tsx
git commit -m "feat(coach): CoachWhisper — nudge inline soft/solid"
```

---

## Task 5: `ProgressList`

Referência: `.../components/ProgressList/ProgressList.jsx.txt`. Remapear tokens; **G-02**: valores current/target passam de mono para `.sl-num`; track da barra `--sl-bg-elevated`→`--sl-s3`; complete→accent `--sl-em`; `Check` Lucide (G-07). Preservar lógica `invert` ("menos é melhor").

**Files:**
- Create: `web/src/components/coach/ProgressList.tsx`
- Test: `web/src/components/coach/ProgressList.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ProgressList } from './ProgressList'

describe('ProgressList', () => {
  it('renders title, rows and current/target labels in sl-num', () => {
    const html = renderToString(
      <ProgressList
        title="Metas ativas"
        rows={[
          { label: 'Reserva', current: 12, target: 18, color: 'var(--sl-mod-fut)', currentLabel: 'R$ 12k', targetLabel: 'R$ 18k' },
          { label: 'Sono', current: 6, target: 8, color: 'var(--sl-mod-crp)', unit: 'h', invert: false, check: true },
        ]}
      />,
    )
    expect(html).toContain('Metas ativas')
    expect(html).toContain('Reserva')
    expect(html).toContain('R$ 12k')
    expect(html).toContain('sl-num')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/coach/ProgressList.test.tsx`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `ProgressList`**

```tsx
'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressRow {
  label: string
  current: number
  target: number
  color: string
  unit?: string
  sub?: string
  currentLabel?: string
  targetLabel?: string
  /** "Menos é melhor": acima de 100% lê danger, perto lê warning. */
  invert?: boolean
  /** Mostra check ao concluir (só linhas não-invertidas). */
  check?: boolean
  badge?: string
  badgeColor?: string
}

export interface ProgressListProps {
  title: string
  sub?: string
  rows: ProgressRow[]
  className?: string
}

/** Card de barras de meta (current / target) com dots, badges e modo invert. */
export function ProgressList({ title, sub, rows, className }: ProgressListProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 className="font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>
        {sub && <span className="text-[11.5px] text-[var(--sl-t3)]">{sub}</span>}
      </div>
      {rows.map((r, i) => {
        const pct = Math.round((r.current / r.target) * 100)
        const near = r.invert ? pct >= 90 && pct < 100 : false
        const complete = r.invert ? pct < 100 : pct >= 100
        const bar = r.invert
          ? pct >= 100
            ? 'var(--sl-danger)'
            : near
              ? 'var(--sl-warning)'
              : r.color
          : pct >= 100
            ? 'var(--sl-em)'
            : r.color
        return (
          <div key={i} className={cn('py-[13px]', i > 0 && 'border-t border-[var(--sl-border)]')}>
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--sl-t1)]">
                <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: r.color }} />
                {r.label}
                {r.sub && <span className="text-[10.5px] text-[var(--sl-t4)]">· {r.sub}</span>}
                {complete && !r.invert && r.check && <Check size={13} className="text-[var(--sl-em)]" />}
                {r.badge && (
                  <span className="text-[9.5px] font-bold tracking-[0.06em]" style={{ color: r.badgeColor ?? 'var(--sl-warning)' }}>
                    {r.badge}
                  </span>
                )}
              </span>
              <span className="sl-num text-[12.5px] text-[var(--sl-t2)]">
                <span className="font-semibold text-[var(--sl-t1)]">
                  {r.currentLabel ?? `${r.current}${r.unit ?? ''}`}
                </span>
                <span className="text-[var(--sl-t4)]"> / {r.targetLabel ?? `${r.target}${r.unit ?? ''}`}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--sl-s3)]">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: bar }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/coach/ProgressList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/coach/ProgressList.tsx web/src/components/coach/ProgressList.test.tsx
git commit -m "feat(coach): ProgressList — barras de meta com invert/badge/check"
```

---

## Task 6: `Timeline`

Referência: `.../components/Timeline/Timeline.jsx.txt`. Remapear tokens; `when` fica em `font-ibm-plex-mono` (é data/timestamp — G-02 permite mono); `Check` Lucide (G-07); tag `AGORA` no `current`; accent `--sl-em`.

**Files:**
- Create: `web/src/components/coach/Timeline.tsx`
- Test: `web/src/components/coach/Timeline.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Timeline } from './Timeline'

describe('Timeline', () => {
  it('renders items and the AGORA tag on the current node', () => {
    const html = renderToString(
      <Timeline
        title="Roadmap Q2"
        items={[
          { when: 'abr', title: 'Projeto Atlas', meta: 'concluído', done: true },
          { when: 'mai', title: 'Curso arquitetura', current: true },
          { when: 'jun', title: 'Certificação', color: 'var(--sl-mod-car)' },
        ]}
      />,
    )
    expect(html).toContain('Roadmap Q2')
    expect(html).toContain('Projeto Atlas')
    expect(html).toContain('AGORA')
    expect(html).toContain('font-ibm-plex-mono')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/coach/Timeline.test.tsx`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `Timeline`**

```tsx
'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineItem {
  /** Marcador da coluna esquerda (data, mês, "Q3"). */
  when: string
  title: string
  meta?: string
  /** Concluído — nó preenchido + check. */
  done?: boolean
  /** Marco ativo — nó anelado + tag "AGORA". */
  current?: boolean
  /** Cor do anel para nó pendente. */
  color?: string
}

export interface TimelineProps {
  title?: string
  items: TimelineItem[]
  className?: string
}

/** Timeline vertical de marcos com nós done/now/future. */
export function Timeline({ title, items, className }: TimelineProps) {
  return (
    <div className={cn('rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      {title && <h3 className="mb-[18px] font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>}
      <div className="flex flex-col">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <div key={i} className="grid items-stretch gap-3" style={{ gridTemplateColumns: '90px 32px 1fr' }}>
              <div className="pt-0.5 text-right">
                <span
                  className={cn(
                    'font-ibm-plex-mono text-[11.5px]',
                    it.current ? 'font-bold text-[var(--sl-em)]' : 'font-medium text-[var(--sl-t3)]',
                  )}
                >
                  {it.when}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    background: it.done ? 'var(--sl-em)' : it.current ? 'var(--sl-em-soft)' : 'var(--sl-s3)',
                    borderColor: it.done || it.current ? 'var(--sl-em)' : it.color ?? 'var(--sl-border-h)',
                  }}
                >
                  {it.done && <Check size={9} className="text-white" />}
                </span>
                {!last && (
                  <span
                    className="w-0.5 flex-1"
                    style={{ minHeight: 22, background: it.done ? 'var(--sl-em)' : 'var(--sl-border)' }}
                  />
                )}
              </div>
              <div className={last ? 'pb-0' : 'pb-5'}>
                <div className="text-[13.5px] font-semibold text-[var(--sl-t1)]">
                  {it.title}
                  {it.current && <span className="ml-2 text-[9.5px] font-bold tracking-[0.06em] text-[var(--sl-em)]">AGORA</span>}
                </div>
                {it.meta && <div className="mt-0.5 text-[12px] text-[var(--sl-t3)]">{it.meta}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/coach/Timeline.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/coach/Timeline.tsx web/src/components/coach/Timeline.test.tsx
git commit -m "feat(coach): Timeline — marcos verticais done/now/future com tag AGORA"
```

---

## Task 7: `Donut`

Referência: `.../components/Donut/Donut.jsx.txt`. Remapear tokens; **G-02**: centro e % em `.sl-num`/`.sl-num-strong` (não mono); **G-01**: adicionar realce + tooltip no hover das fatias/legenda (a referência não tem).

**Files:**
- Create: `web/src/components/coach/Donut.tsx`
- Test: `web/src/components/coach/Donut.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Donut } from './Donut'

describe('Donut', () => {
  it('renders center value, slices and shares in sl-num', () => {
    const html = renderToString(
      <Donut
        title="Gastos por categoria"
        center="R$ 3.160"
        centerSub="maio"
        slices={[
          { label: 'Moradia', share: 42, color: 'var(--sl-mod-fin)' },
          { label: 'Lazer', share: 18, color: 'var(--sl-mod-exp)' },
          { label: 'Transporte', share: 40, color: 'var(--sl-mod-tmp)' },
        ]}
      />,
    )
    expect(html).toContain('Gastos por categoria')
    expect(html).toContain('R$ 3.160')
    expect(html).toContain('Moradia')
    expect(html).toContain('42%')
    expect(html).toContain('conic-gradient')
    expect(html).toContain('sl-num')
  })
})
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run src/components/coach/Donut.test.tsx`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `Donut`**

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface DonutSlice {
  label: string
  /** Percentual do anel (fatias somam ~100). */
  share: number
  color: string
}

export interface DonutProps {
  title?: string
  center: string
  centerSub?: string
  slices: DonutSlice[]
  className?: string
}

/** Share chart conic-gradient com centro + legenda. Tooltip/realce no hover (G-01). */
export function Donut({ title, center, centerSub, slices, className }: DonutProps) {
  const [hover, setHover] = useState<number | null>(null)
  let acc = 0
  const stops = slices
    .map((s) => {
      const from = acc
      acc += s.share * 3.6
      return `${s.color} ${from}deg ${acc}deg`
    })
    .join(', ')
  return (
    <div className={cn('flex flex-col gap-4 rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      {title && <h3 className="font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>}
      <div className="flex items-center gap-[22px]">
        <div
          className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-[var(--sl-s1)]">
            <span className="sl-num-strong text-[18px] leading-none text-[var(--sl-t1)]">
              {hover != null ? `${slices[hover].share}%` : center}
            </span>
            <span className="mt-[3px] text-[9.5px] text-[var(--sl-t4)]">
              {hover != null ? slices[hover].label : centerSub}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {slices.map((s, i) => (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'flex cursor-default items-center gap-2.5 rounded-md px-1.5 py-1 text-[12.5px] transition-colors',
                hover === i && 'bg-[var(--sl-s2)]',
              )}
            >
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: s.color }} />
              <span className="flex-1 text-[var(--sl-t2)]">{s.label}</span>
              <span className="sl-num font-semibold text-[var(--sl-t1)]">{s.share}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

> **Nota G-01:** o realce da legenda + a troca do centro para a fatia sob o cursor cobrem o hover. Quando o Donut for ligado a dados reais na Fase 4, considerar o padrão `ChartTooltip` do projeto para paridade total com os demais gráficos.

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run src/components/coach/Donut.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check + Commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add web/src/components/coach/Donut.tsx web/src/components/coach/Donut.test.tsx
git commit -m "feat(coach): Donut — share chart conic-gradient com hover (G-01)"
```

---

## Task 8: Barrel export + specimens visuais + gate da fase

**Files:**
- Create: `web/src/components/coach/index.ts`
- Create: `web/src/app/dev/coach-specimens/page.tsx` (temporário, dev-only)

- [ ] **Step 1: Criar o barrel export**

```ts
export { KpiStrip } from './KpiStrip'
export type { Kpi, KpiStripProps } from './KpiStrip'
export { CoachWhisper } from './CoachWhisper'
export type { CoachWhisperProps } from './CoachWhisper'
export { ProgressList } from './ProgressList'
export type { ProgressRow, ProgressListProps } from './ProgressList'
export { Timeline } from './Timeline'
export type { TimelineItem, TimelineProps } from './Timeline'
export { Donut } from './Donut'
export type { DonutSlice, DonutProps } from './Donut'
```

- [ ] **Step 2: Criar a página de specimens (validação visual)**

```tsx
'use client'

import { KpiStrip, CoachWhisper, ProgressList, Timeline, Donut } from '@/components/coach'
import { KbdChip } from '@/components/ui/kbd-chip'

export default function CoachSpecimensPage() {
  return (
    <div className="mx-auto max-w-[900px] space-y-8 p-10">
      <div className="flex items-center gap-2">
        <KbdChip>⌘K</KbdChip>
        <KbdChip>⌘J</KbdChip>
        <KbdChip>?</KbdChip>
        <KbdChip>esc</KbdChip>
      </div>

      <KpiStrip
        items={[
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', up: true },
          { label: 'Receitas', value: 'R$ 5.000', delta: '+8%', up: true },
          { label: 'Despesas', value: 'R$ 3.160', delta: '63%' },
          { label: 'Poupança', value: '37%', delta: 'meta 30%', up: true },
        ]}
      />

      <CoachWhisper bold="Você gastou 18% acima" text="da média em Lazer este mês." action="Ver categoria" variant="solid" />
      <CoachWhisper bold="Dia 28 concentra R$ 1.240" text="em despesas. Vale antecipar a reserva." />

      <div className="grid grid-cols-2 gap-5">
        <ProgressList
          title="Metas ativas"
          rows={[
            { label: 'Reserva', current: 12, target: 18, color: 'var(--sl-mod-fut)', currentLabel: 'R$ 12k', targetLabel: 'R$ 18k', check: true },
            { label: 'Sono', current: 9, target: 8, color: 'var(--sl-mod-crp)', unit: 'h', invert: true, badge: 'ATENÇÃO' },
            { label: 'Curso', current: 90, target: 100, color: 'var(--sl-mod-car)', unit: '%' },
          ]}
        />
        <Timeline
          title="Roadmap Q2"
          items={[
            { when: 'abr', title: 'Projeto Atlas', meta: 'concluído', done: true },
            { when: 'mai', title: 'Curso arquitetura', meta: '90%', current: true },
            { when: 'jun', title: 'Certificação cloud', color: 'var(--sl-mod-car)' },
          ]}
        />
      </div>

      <Donut
        title="Gastos por categoria"
        center="R$ 3.160"
        centerSub="maio"
        slices={[
          { label: 'Moradia', share: 42, color: 'var(--sl-mod-fin)' },
          { label: 'Lazer', share: 18, color: 'var(--sl-mod-exp)' },
          { label: 'Transporte', share: 22, color: 'var(--sl-mod-tmp)' },
          { label: 'Outros', share: 18, color: 'var(--sl-mod-fut)' },
        ]}
      />
    </div>
  )
}
```

- [ ] **Step 3: Rodar todos os smoke tests + type-check + build**

Run: `npx vitest run src/components/coach src/components/ui/kbd-chip.test.tsx`
Expected: PASS (todos os arquivos de teste verdes).

Run: `npx tsc --noEmit`
Expected: PASS (exit 0).

Run: `npm run build 2>&1 | tail -8`
Expected: build completa, rota `/dev/coach-specimens` listada.

- [ ] **Step 4: Validação visual (manual, obrigatória — 4 temas)**

Subir `npm run dev` (porta 3005, `run_in_background: true`) e abrir `http://localhost:3005/dev/coach-specimens`. Validar em **Navy Deep** e **Cream** (mínimo): KpiStrip com 1º valor maior; whispers soft (dashed) e solid; ProgressList com barra invert (Sono acima do alvo em danger) e badge; Timeline com nó AGORA; Donut com hover (centro troca pra fatia + realce da legenda). Nenhum valor em fonte mono; nenhum emoji.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/coach/index.ts web/src/app/dev/coach-specimens/page.tsx
git commit -m "feat(coach): barrel export + pagina de specimens (dev) para validacao visual"
```

> A página `dev/coach-specimens` é temporária (harness de validação). Removê-la ou gateá-la por `NODE_ENV !== 'production'` antes do deploy — tratada no Plano 3.

---

## Self-Review (feito na escrita)

- **Cobertura da spec (Fases 0-1):** Fase 0 tokens §2.2 → Task 1 (motion, z-scale, backdrop, noise, reduced-motion, fix `--color-cqs`); `KbdChip` → Task 2. Fase 1 componentes: KpiStrip (T3), CoachWhisper (T4), ProgressList (T5), Timeline (T6), Donut (T7). Correções G: G-02 nos valores (T3/T5/T7), G-01 tooltip (T7), G-07 Lucide (T3-T7). Validação dark+cream → Task 8 step 4. ✅
- **Placeholders:** nenhum — todo passo de código traz o código completo; comandos com saída esperada. ✅
- **Consistência de tipos:** as interfaces (`Kpi`, `KpiStripProps`, `CoachWhisperProps`, `ProgressRow`, `ProgressListProps`, `TimelineItem`, `TimelineProps`, `DonutSlice`, `DonutProps`) batem entre implementação, testes e barrel export. ✅
- **Fora deste plano (vai pro Plano 2/3):** `Coach` hero, `CrossBand`, overlays (`CommandPalette`/`CoachDrawer`/`CheatSheet`), `useGlobalKeys`, `coach-store`, `lib/coach/context.ts`, rotas de IA, rollout das telas. Correto — dependem de shell/IA.
