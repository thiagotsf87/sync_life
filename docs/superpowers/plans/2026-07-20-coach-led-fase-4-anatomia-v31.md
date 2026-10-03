# Coach-led v4 — Plano 3: Anatomia v3.1 (Fase 4) — padrão P-A Coach-led + piloto Finanças

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a anatomia de tela dos 6 padrões antigos para os **4 padrões da Anatomia v3.1** do DS, construir o scaffold do **padrão P-A (Coach-led Module)** e recompor **Finanças** 100% em P-A (Variante B) como tela-referência — Coach conduz por uma headline conversacional, KPIs viram evidência inline (sem strip, sem 4 tiles), cross-band, e a grade de evidência (1 chart + agenda) embaixo.

**Architecture:** A fonte de verdade da anatomia passa a ser a Anatomia v3.1 (`prototypes/financas-anatomia/` do projeto de design `e19451`). Criamos 3 peças reutilizáveis em `components/coach/`: `MicroStatRail` (stats inline sem card), `CoachLedLayout` (o esqueleto vertical do P-A) e `CoachAgenda` (a coluna-evidência lateral). Refatoramos o `CoachHero` existente (Plano 2) para a anatomia da Variante B: grid `[1fr_280px]` com headline editorial + pílulas de ação à esquerda e o `MicroStatRail` à direita. `financas/page.tsx` deixa de empilhar `KpiStrip + HealthBand + AiConsultant + FinancialInsightCard` (o anti-pattern auditado) e passa a compor `CoachLedLayout(hero, crossBand, evidence, aside)`. Identidade visual **inalterada** (esmeralda `--sl-em`, Syne, DM Sans, 4 temas). Tudo atrás da flag `COACH_OS_ENABLED` (rollback de 1 linha).

**Tech Stack:** Next.js 16, React 19, TS strict, Tailwind v4, lucide-react, Zustand, Vercel AI SDK (hooks `use-coach` do Plano 2), vitest + `react-dom/server`.

**Escopo — Plano 3 de N:** Cobre a **fundação da Anatomia v3.1** + o **padrão P-A** + o **piloto Finanças em P-A**. Os outros 4 módulos narrativos (Tempo, Patrimônio, Carreira, Mente) e os padrões P-B (Hero Score), P-C (List+Capture), P-D (Form Flow) ficam nos Planos 4-6 — mapeados na **matriz de rollout** ao fim deste doc. Justificativa da divisão (skill writing-plans, scope-check): cada padrão é um subsistema independente e cada plano entrega software testável sozinho; recompor 45+ telas num único plano seria inauditável.

---

## Fontes de verdade (DS `e19451`, via DesignSync)

| Blueprint | Path no projeto de design | O que define |
|---|---|---|
| Anatomia v3.1 — princípios | `prototypes/financas-anatomia/Anatomia.jsx` (§02) | P-01…P-06 |
| Anatomia v3.1 — 4 padrões | `prototypes/financas-anatomia/section-anatomy.jsx` (§03) | P-A/B/C/D: layout em px, breakpoints, anti-patterns |
| Finanças em P-A (recomendada) | `prototypes/financas-anatomia/variant-b.jsx` (§04) | composição concreta do piloto |
| Checklist estrutural | `prototypes/financas-anatomia/section-checklist.jsx` (§05) | 40 perguntas / 7 categorias |
| Auditoria | `prototypes/financas-anatomia/section-audit.jsx` (§01) | por que o Finanças atual falha |
| Tokens reais | `prototypes/app-v3/tokens.css` | `--sl-em #0F766E`, Syne, DM Sans (identidade = a do app) |

**Os 6 princípios (guiam tudo):** P-01 IA é o sistema, não card · P-02 um número grande por dobra (≥30px) · P-03 container só quando agrupa (metade das bordas) · P-04 módulos conversam (≥1 elo cross) · P-05 próxima ação visível em ≤1 scroll · P-06 densidade por estado.

**P-A · Coach-led (ordem vertical, do §03):** Coach Hero (conversação, 280-360px, **sem 4 tiles fixos**) → Próxima ação (CTA IA, some se não houver) → Evidência primária (`1.6fr/1fr`: chart/tabela + lista lateral; **KPIs entram aqui, não como strip**) → Cross-module elo (96px) → Detalhe full-width (opcional). Breakpoints: ≥1280 cheio · 960-1280 lateral some, KPIs viram strip · <960 empilha, Coach vira pill.

---

## Convenções de verificação (todo o plano)

- Verificação canônica (`CLAUDE.md`): `tsc --noEmit` + `npm run build` + visual nos 4 temas. Smoke tests `renderToString` (vitest `environment: 'node'`, sem DOM) travam API/markup.
- **React SSR insere `<!-- -->` entre nós de texto adjacentes** — em asserts de string, normalizar com `html.replace(/<!-- -->/g,'')` antes de checar substrings.
- Rodar de `web/` (CWD do terminal). `git add src/...` (nunca `web/src/...`).
- **Validação visual de overlay/anatomia deve ser em `next start` (build), não no dev** — o Turbopack dev não gera algumas utilities arbitrárias/responsivas dessas telas (paleta off-screen, drawer full-width no dev; ambos corretos em produção). Ver `memory/project_turbopack_dev_css_gap.md`.
- Regras G: **G-01** (todo gráfico com tooltip), **G-02** (`.sl-num`/`.sl-num-strong`, mono só timestamps), **G-03** (gradient só logo/ring), **G-05** (1 hero/tela), **G-06** (cor de módulo é identificação; CTA `--sl-em`), **G-07** (Lucide, nunca emoji), sem em-dash na copy.
- Identidade **não muda**: esmeralda/Syne/DM Sans/4 temas. Este plano é só anatomia.

## File structure

| Arquivo | Responsabilidade |
|---|---|
| `DESIGN-SYSTEM-v3.md` (modificar) | §"6 padrões" → **4 padrões + 6 princípios** (Anatomia v3.1) |
| `CLAUDE.md` (modificar) | tabela "6 Padrões de composição" → 4 padrões; nota de que a fonte é a Anatomia v3.1 |
| `web/src/components/coach/MicroStatRail.tsx` (criar) | stats verticais inline (sem card) — evidência do hero |
| `web/src/components/coach/CoachLedLayout.tsx` (criar) | scaffold do P-A: hero → cross → grade evidência `1fr/320px` → detalhe opcional |
| `web/src/components/coach/CoachAgenda.tsx` (criar) | coluna-evidência lateral "próximos N dias" (agenda genérica) |
| `web/src/components/coach/CoachHero.tsx` (modificar) | refatorar para anatomia Variante B (headline + pílulas à esq., `MicroStatRail` à dir.) |
| `web/src/components/coach/CoachHero.test.tsx` (modificar) | cobrir a nova anatomia |
| `web/src/components/coach/index.ts` (modificar) | exportar `MicroStatRail`, `CoachLedLayout`, `CoachAgenda` (+ tipos) |
| `web/src/components/financas/FinancasCoachSection.tsx` (modificar) | virar a composição P-A completa do Finanças (hero+cross+evidência) |
| `web/src/app/(app)/financas/page.tsx` (modificar) | remover `KpiStrip/HealthBand/AiConsultant/FinancialInsightCard` do topo; usar a seção P-A |
| `web/src/**/*.test.tsx` (criar) | smoke tests dos itens acima |

---

## Task 1: Reescrever a anatomia (6 padrões → 4 padrões + 6 princípios)

**Files:**
- Modify: `DESIGN-SYSTEM-v3.md` (seção "6 Padrões de composição")
- Modify: `CLAUDE.md` (seção "## 6 Padrões de composição (anatomia de tela v3)")

**Contexto:** hoje ambos documentam 6 padrões. A Anatomia v3.1 os substitui por 4 (P-A…P-D) + 6 princípios. Sem isso, a fonte de verdade contradiz o DS e o rollout não tem âncora.

- [ ] **Step 1: Substituir a seção de padrões no `DESIGN-SYSTEM-v3.md`**

Localizar a seção que lista os 6 padrões e substituir por (texto integral):

```markdown
## Anatomia v3.1 — 6 princípios + 4 padrões

> Fonte: Anatomia v3.1 (projeto de design `e19451`, `prototypes/financas-anatomia/`). Substitui os 6 padrões prosados da v3.

### 6 princípios
- **P-01 IA é o sistema, não um card.** O Coach narra a vida, conversa, sugere acoes e faz a transicao entre modulos. Nunca 4 tiles estaticos num hero.
- **P-02 Um numero grande por dobra.** Cada dobra tem 1 KPI dominante (30-64px). Os demais sao secundarios.
- **P-03 Container so quando agrupa.** Borda + radius + bg = sinal de agrupamento. Bloco solitario nao tem card. Reduzir bordas pela metade.
- **P-04 Modulos conversam.** Toda tela mostra >=1 elo cross-module. A IA costura.
- **P-05 Proxima acao visivel.** Toda tela responde "o que eu faco agora?" em ate 1 scroll.
- **P-06 Densidade por estado.** Saudavel = resumo curto, IA discreta. Alerta = mais detalhe, IA expande.

### 4 padrões
| Padrao | Pitch | Ordem vertical | Quando | Anti |
|---|---|---|---|---|
| **P-A Coach-led** | A IA conduz, o resto e evidencia | Coach Hero (280-360px) -> Proxima acao -> Evidencia primaria (1.6fr/1fr, KPIs aqui) -> Cross elo -> Detalhe opcional | Financas, Tempo, Patrimonio, Carreira, Mente | Nao para gamificacao/CRUD; nao inflar com 4 KPI cards |
| **P-B Hero Score** | Um numero grande, tudo orbita | Hero Score (360-480px) -> Proximos eventos IA -> Mosaic 3xN -> Cross elo | Panorama, Conquistas, perfil publico | Nao em modulos densos; nunca 2 hero score |
| **P-C List+Capture** | Lista + captura inline | TopBar filtros -> captura inline -> lista densa -> IA lateral opcional | Transacoes, Tarefas, Habitos, Ativos, Eventos | Nada de KPI strip no topo; sem paginacao 1-2-3 |
| **P-D Form Flow** | Editar confortavel, salvar obvio | TopBar -> hero opcional -> secoes numeradas -> DangerZone -> SaveBar sticky | Configuracoes, Onboarding, criacao | Nao jogar tudo numa pagina; >12 campos sem agrupar = bug |

Breakpoints P-A: >=1280 cheio; 960-1280 lateral some, KPIs viram strip; <960 empilha, Coach vira pill.
```

- [ ] **Step 2: Atualizar a tabela de padrões no `CLAUDE.md`**

Na seção "## 6 Padrões de composição", trocar o título para "## Anatomia v3.1 — 4 padrões de composição" e substituir a lista dos 6 padrões pela tabela de 4 padrões do Step 1 (resumida), com a nota: `> Fonte de verdade: Anatomia v3.1 (projeto de design e19451). Os 6 padroes antigos foram consolidados em 4.`

- [ ] **Step 3: Verificar**

Run: `grep -c "P-A Coach-led" DESIGN-SYSTEM-v3.md CLAUDE.md`
Expected: cada arquivo retorna >=1.

- [ ] **Step 4: Commit**

```bash
git add DESIGN-SYSTEM-v3.md CLAUDE.md
git commit -m "docs(anatomia): Anatomia v3.1 — 6 principios + 4 padroes (substitui 6 padroes v3)"
```

---

## Task 2: `MicroStatRail` (stats inline, sem card — a evidência do hero)

**Files:**
- Create: `web/src/components/coach/MicroStatRail.tsx`
- Test: `web/src/components/coach/MicroStatRail.test.tsx`

**Contexto:** na Variante B (`variant-b.jsx`, `VBMicroStat`), os KPIs ficam à direita do hero como stats verticais **sem cards** (P-03) — 1 deles `big` (30px, cor `--sl-em`; P-02). Substitui o `KpiStrip` boxed dentro do hero.

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { MicroStatRail } from './MicroStatRail'

describe('MicroStatRail', () => {
  it('renderiza labels, valores e destaca o item big em sl-num-strong', () => {
    const html = renderToString(
      <MicroStatRail
        items={[
          { label: 'Receitas', value: 'R$ 5.000', delta: '+8%' },
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', big: true },
        ]}
      />,
    )
    expect(html).toContain('Receitas')
    expect(html).toContain('R$ 1.840')
    expect(html).toContain('sl-num-strong')
    expect(html.replace(/<!-- -->/g, '')).toContain('+12%')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/MicroStatRail.test.tsx` → FAIL ("Cannot find module './MicroStatRail'").

- [ ] **Step 3: Implementar o `MicroStatRail`**

```tsx
'use client'

import { cn } from '@/lib/utils'

export interface MicroStat {
  label: string
  value: string
  delta?: string
  /** Item ancora da dobra (P-02): valor 30px em cor --sl-em. */
  big?: boolean
  /** Cor do delta; default t3 (neutro). Use 'em' para positivo. */
  deltaTone?: 'em' | 'muted'
}

export interface MicroStatRailProps {
  items: MicroStat[]
  className?: string
}

/** Coluna de stats inline (sem card, P-03). 1 valor big (P-02). Evidencia do hero. */
export function MicroStatRail({ items, className }: MicroStatRailProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {items.map((s, i) => (
        <div key={i} className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t4)]">
            {s.label}
          </span>
          <span
            className={cn('sl-num-strong leading-none', s.big ? 'text-[30px]' : 'text-[22px]')}
            style={{ color: s.big ? 'var(--sl-em)' : 'var(--sl-t1)' }}
          >
            {s.value}
          </span>
          {s.delta && (
            <span
              className="sl-num text-[11px]"
              style={{ color: s.deltaTone === 'muted' ? 'var(--sl-t3)' : 'var(--sl-em)' }}
            >
              {s.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/MicroStatRail.test.tsx` → PASS.

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/MicroStatRail.tsx src/components/coach/MicroStatRail.test.tsx
git commit -m "feat(anatomia): MicroStatRail — stats inline sem card (evidencia do hero, P-02/P-03)"
```

---

## Task 3: Refatorar `CoachHero` para a anatomia Variante B

**Files:**
- Modify: `web/src/components/coach/CoachHero.tsx`
- Modify: `web/src/components/coach/CoachHero.test.tsx`

**Contexto:** o `CoachHero` do Plano 2 empilha headline + `KpiStrip` boxed + pílulas. A Variante B (`VBHero`) quer grid `[1fr_280px]`: à esquerda eyebrow + **headline editorial grande** + **pílulas de ação** (1ª primária = próxima acao P-05, resto ghost); à direita o `MicroStatRail`. A shape de `brief` (`CoachBrief`) **não muda** (vem de `/api/ai/coach-brief`, Plano 2): `{ eyebrow, headline{text,emphasis}, stats[], suggestions[] }`. Só muda o layout.

- [ ] **Step 1: Atualizar o smoke test (falha primeiro)**

Substituir o teste existente por:

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachHero } from './CoachHero'

describe('CoachHero', () => {
  it('renderiza eyebrow, headline com emphasis, pilulas de acao e o MicroStatRail', () => {
    const html = renderToString(
      <CoachHero moduleId="financas" period="maio 2026"
        brief={{
          eyebrow: 'Coach · Financas · maio 2026',
          headline: { text: 'Voce fecha maio em 1.840 positivo', emphasis: '1.840' },
          stats: [
            { label: 'Receitas', value: 'R$ 5.000' },
            { label: 'Saldo', value: 'R$ 1.840', big: true },
          ],
          suggestions: [
            { id: 's1', label: 'Cortar R$ 100 de Lazer', prompt: 'Como cortar Lazer?', primary: true },
            { id: 's2', label: 'Ver projecao', prompt: 'Projecao ate dez' },
          ],
        }} />,
    )
    const clean = html.replace(/<!-- -->/g, '')
    expect(html).toContain('Financas')
    expect(clean).toContain('1.840')            // emphasis no headline
    expect(html).toContain('Cortar R$ 100 de Lazer') // pilula primaria
    expect(html).toContain('Ver projecao')      // pilula secundaria
    expect(html).toContain('sl-num-strong')     // MicroStatRail
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachHero.test.tsx` → FAIL (layout antigo não bate; ou pass parcial). Confirmar que roda antes de reimplementar.

- [ ] **Step 3: Reimplementar o `CoachHero`**

```tsx
'use client'

import { Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import { MicroStatRail, type MicroStat } from './MicroStatRail'
import { useCoachStore } from '@/stores/coach-store'
import type { ModuleId } from '@/types/shell'

export interface CoachBrief {
  eyebrow: string
  headline: { text: string; emphasis?: string }
  stats: { label: string; value: string; big?: boolean }[]
  suggestions: { id: string; label: string; prompt: string; primary?: boolean }[]
}

export interface CoachHeroProps {
  moduleId: ModuleId
  period: string
  brief: CoachBrief
  className?: string
}

/**
 * Hero unico do Coach (G-05) na anatomia P-A Variante B:
 * grid [1fr_280px] — headline editorial + pilulas de acao (esq.) e MicroStatRail (dir.).
 * A frase E a tela. KPIs sao evidencia inline, nao strip (P-01/P-02/P-03).
 */
export function CoachHero({ moduleId, brief, className }: CoachHeroProps) {
  const mod = MODULES[moduleId] ?? MODULES.panorama
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const { headline } = brief
  const parts = headline.emphasis ? headline.text.split(headline.emphasis) : [headline.text]
  // 1 stat ancora (P-02): o marcado big, senao o de indice 1 (saldo), senao o 0.
  const stats: MicroStat[] = brief.stats.map((s) => ({ label: s.label, value: s.value, big: s.big }))
  if (!stats.some((s) => s.big) && stats.length) (stats[Math.min(1, stats.length - 1)] as MicroStat).big = true

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s-hero)] px-6 py-7',
        'grid grid-cols-[1fr_280px] gap-10 items-end max-lg:grid-cols-1 max-lg:gap-6',
        className,
      )}
    >
      <div className="sl-hero-noise pointer-events-none absolute inset-0 opacity-60" />

      {/* Esquerda: conversacao do Coach */}
      <div className="relative min-w-0">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--sl-border-em)] bg-[var(--sl-em-soft)] text-[var(--sl-em)]">
            <Sparkles size={13} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)]">
            {brief.eyebrow}
          </span>
        </div>

        <h2 className="max-w-[22ch] font-[Syne] text-[clamp(24px,3.4vw,38px)] font-medium leading-[1.15] tracking-tight text-[var(--sl-t1)]">
          {parts[0]}
          {headline.emphasis && (
            <span className="font-semibold" style={{ color: mod.color }}>{headline.emphasis}</span>
          )}
          {parts[1] ?? ''}
        </h2>

        {/* Pilulas de acao (P-05): 1a primaria = proxima acao, resto ghost */}
        <div className="mt-6 flex flex-wrap gap-2">
          {brief.suggestions.map((s) => (
            <button key={s.id} type="button" onClick={() => openDrawerWithPrompt(s.prompt)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full text-[13px] font-medium',
                s.primary
                  ? 'bg-[var(--sl-em)] px-[18px] py-[11px] font-semibold text-white'
                  : 'border border-[var(--sl-border-h)] px-4 py-2.5 text-[var(--sl-t2)] hover:border-[var(--sl-em)]',
              )}>
              {s.primary && <Check size={14} />}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direita: KPIs como evidencia inline (sem card) */}
      <MicroStatRail items={stats} className="relative pb-1.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-8" />
    </section>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachHero.test.tsx` → PASS.

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CoachHero.tsx src/components/coach/CoachHero.test.tsx
git commit -m "feat(anatomia): CoachHero na Variante B (headline editorial + pilulas + MicroStatRail)"
```

---

## Task 4: `CoachLedLayout` (o scaffold do padrão P-A)

**Files:**
- Create: `web/src/components/coach/CoachLedLayout.tsx`
- Test: `web/src/components/coach/CoachLedLayout.test.tsx`

**Contexto:** o esqueleto vertical do P-A (§03): hero → cross → evidência (`1fr/320px`) → detalhe opcional. Componível por slots. Colapsa em 1 coluna em `<lg` (breakpoint P-A).

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachLedLayout } from './CoachLedLayout'

describe('CoachLedLayout', () => {
  it('renderiza os slots na ordem P-A', () => {
    const html = renderToString(
      <CoachLedLayout
        hero={<div>HERO</div>}
        crossBand={<div>CROSS</div>}
        evidence={<div>EVID</div>}
        aside={<div>ASIDE</div>}
        detail={<div>DETALHE</div>}
      />,
    )
    expect(html.indexOf('HERO')).toBeLessThan(html.indexOf('CROSS'))
    expect(html.indexOf('CROSS')).toBeLessThan(html.indexOf('EVID'))
    expect(html.indexOf('EVID')).toBeLessThan(html.indexOf('DETALHE'))
    expect(html).toContain('ASIDE')
  })

  it('omite cross/aside/detalhe quando ausentes', () => {
    const html = renderToString(<CoachLedLayout hero={<div>H</div>} evidence={<div>E</div>} />)
    expect(html).toContain('H')
    expect(html).toContain('E')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachLedLayout.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachLedLayout`**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CoachLedLayoutProps {
  /** Coach Hero (conversacao). Unico hero da tela (G-05). */
  hero: ReactNode
  /** Elo cross-module (P-04). Opcional mas recomendado. */
  crossBand?: ReactNode
  /** Evidencia primaria: chart/tabela central. */
  evidence: ReactNode
  /** Coluna lateral da evidencia (agenda/lista). Some em <lg. */
  aside?: ReactNode
  /** Detalhe full-width opcional (timeline/breakdown denso). */
  detail?: ReactNode
  className?: string
}

/** Scaffold do padrao P-A (Coach-led). Ordem vertical fixa da Anatomia v3.1 §03. */
export function CoachLedLayout({ hero, crossBand, evidence, aside, detail, className }: CoachLedLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {hero}
      {crossBand}
      <div className={cn('grid gap-5', aside ? 'grid-cols-[1fr_320px] max-lg:grid-cols-1' : 'grid-cols-1')}>
        <div className="min-w-0">{evidence}</div>
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
      {detail}
    </div>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachLedLayout.test.tsx` → PASS (2 testes).

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CoachLedLayout.tsx src/components/coach/CoachLedLayout.test.tsx
git commit -m "feat(anatomia): CoachLedLayout — scaffold do padrao P-A (hero/cross/evidencia/detalhe)"
```

---

## Task 5: `CoachAgenda` (coluna-evidência lateral "próximos N dias")

**Files:**
- Create: `web/src/components/coach/CoachAgenda.tsx`
- Test: `web/src/components/coach/CoachAgenda.test.tsx`

**Contexto:** a coluna lateral da evidência na Variante B (`VBAgenda`): lista de eventos com dia/mês mono (G-02), título, dot de módulo (G-06) e valor `.sl-num`. Genérica (reusada por Finanças/Tempo/Patrimônio).

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachAgenda } from './CoachAgenda'

describe('CoachAgenda', () => {
  it('renderiza titulo, contagem e itens com dia/valor', () => {
    const html = renderToString(
      <CoachAgenda
        title="Proximos 7 dias"
        items={[
          { id: '1', day: '24', weekday: 'dom', label: 'Aluguel', amount: '- R$ 1.200', moduleColor: 'var(--sl-mod-ptr)' },
          { id: '2', day: '26', weekday: 'ter', label: 'Salario', amount: '+ R$ 2.500', moduleColor: 'var(--sl-em)', positive: true },
        ]}
      />,
    )
    expect(html).toContain('Proximos 7 dias')
    expect(html).toContain('Aluguel')
    expect(html.replace(/<!-- -->/g, '')).toContain('R$ 2.500')
    expect(html).toContain('font-ibm-plex-mono') // weekday em mono (G-02)
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachAgenda.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachAgenda`**

```tsx
'use client'

import { cn } from '@/lib/utils'

export interface CoachAgendaItem {
  id: string
  /** Numero do dia (grande, sl-num-strong). */
  day: string
  /** Rotulo curto do dia da semana (mono, G-02). */
  weekday: string
  label: string
  /** Valor ja formatado (fmtBRL). */
  amount?: string
  /** Verde quando entrada/positivo. */
  positive?: boolean
  /** Cor de identificacao do modulo de origem (G-06). */
  moduleColor?: string
}

export interface CoachAgendaProps {
  title: string
  items: CoachAgendaItem[]
  emptyLabel?: string
  className?: string
}

/** Coluna-evidencia lateral do P-A: agenda "proximos N dias". */
export function CoachAgenda({ title, items, emptyLabel = 'Nada nos proximos dias.', className }: CoachAgendaProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <header className="flex items-baseline justify-between px-1">
        <h3 className="font-[Syne] text-base font-semibold tracking-tight text-[var(--sl-t1)]">{title}</h3>
        <span className="text-[11px] text-[var(--sl-t3)]">{items.length} eventos</span>
      </header>
      {items.length === 0 ? (
        <p className="px-1 text-[13px] text-[var(--sl-t3)]">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((it) => (
            <div key={it.id}
              className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[10px] border border-[var(--sl-border)] px-3 py-2.5">
              <div className="border-r border-[var(--sl-border)] pr-2 text-center">
                <div className="sl-num-strong text-base leading-none text-[var(--sl-t1)]">{it.day}</div>
                <div className="font-ibm-plex-mono text-[9px] text-[var(--sl-t4)]">{it.weekday}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-medium text-[var(--sl-t1)]">{it.label}</div>
                {it.moduleColor && (
                  <span className="mt-0.5 inline-block h-[5px] w-[5px] rounded-full align-middle" style={{ background: it.moduleColor }} />
                )}
              </div>
              {it.amount && (
                <span className="sl-num text-[13px] font-semibold"
                  style={{ color: it.positive ? 'var(--sl-em)' : 'var(--sl-t1)' }}>
                  {it.amount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachAgenda.test.tsx` → PASS.

- [ ] **Step 5: Atualizar o barrel** — em `src/components/coach/index.ts` exportar `MicroStatRail` (+ `MicroStat`), `CoachLedLayout` (+ `CoachLedLayoutProps`), `CoachAgenda` (+ `CoachAgendaItem`).

- [ ] **Step 6: Verificar + Commit** — `npx tsc --noEmit` → PASS; `npx vitest run src/components/coach` → verde.

```bash
git add src/components/coach/CoachAgenda.tsx src/components/coach/CoachAgenda.test.tsx src/components/coach/index.ts
git commit -m "feat(anatomia): CoachAgenda (coluna-evidencia lateral) + barrel"
```

---

## Task 6: Recompor Finanças em P-A (Variante B) — a tela-referência

**Files:**
- Modify: `web/src/components/financas/FinancasCoachSection.tsx` (vira a composição P-A completa)
- Modify: `web/src/app/(app)/financas/page.tsx` (remove o anti-pattern; monta a seção P-A)

**Contexto (auditoria §01):** o Finanças atual empilha `ModuleHeader → FinancasCoachSection(hero+cross) → KpiStrip → HealthBand → AiConsultant(4 tiles) → FinancialInsightCard → HistoricoChart → FluxoCaixaSection → grid(Orcamentos+Ultimas) → ProjecaoSaldo → ProximasRecorrentes`. Os 4 blocos do meio (`KpiStrip/HealthBand/AiConsultant/FinancialInsightCard`) são o anti-pattern (P-01/P-02/P-03). Na Variante B eles somem: KPIs -> `MicroStatRail` do hero; "saúde" -> `CoachWhisper` inline na evidência; consultor de 4 tiles -> a headline conversacional + o drawer `⌘J`.

**Alvo (Variante B):** `CoachLedLayout( hero=CoachHero, crossBand=CrossBand, evidence=[FluxoCaixaSection + CoachWhisper inline], aside=CoachAgenda(proximas recorrentes), detail=HistoricoChart )`.

- [ ] **Step 1: Reescrever `FinancasCoachSection.tsx` como a composição P-A**

`FinancasCoachSection` já roda `useCoachBrief('financas', period)` + `useCoachCross(...)` (Plano 2). Estender para montar o `CoachLedLayout` inteiro. Recebe os blocos de evidência já existentes por props (o page passa `FluxoCaixaSection`/`HistoricoChart` reais e os itens de agenda), para não acoplar hooks de dados aqui.

```tsx
'use client'

import type { ReactNode } from 'react'
import { COACH_OS_ENABLED } from '@/lib/flags'
import { CoachHero, type CoachBrief } from '@/components/coach/CoachHero'
import { CrossBand, type CrossSegment } from '@/components/coach/CrossBand'
import { CoachLedLayout } from '@/components/coach/CoachLedLayout'
import { CoachAgenda, type CoachAgendaItem } from '@/components/coach/CoachAgenda'
import { CoachWhisper } from '@/components/coach/CoachWhisper'
import { useCoachBrief, useCoachCross, useCoachWhisper } from '@/hooks/use-coach'
import type { ModuleId } from '@/types/shell'

export interface FinancasCoachSectionProps {
  period: string
  /** Evidencia primaria real (chart do fluxo de caixa). */
  evidence: ReactNode
  /** Detalhe full-width real (historico). */
  detail?: ReactNode
  /** Itens da agenda lateral (proximas recorrentes/eventos). */
  agenda: CoachAgendaItem[]
}

/** Composicao P-A (Coach-led) do modulo Financas. Anatomia v3.1 Variante B. */
export function FinancasCoachSection({ period, evidence, detail, agenda }: FinancasCoachSectionProps) {
  const brief = useCoachBrief('financas', period)
  const cross = useCoachCross('financas', period)
  const whisper = useCoachWhisper('financas', period)
  if (!COACH_OS_ENABLED) return null

  const hero = brief.data
    ? <CoachHero moduleId={'financas' as ModuleId} period={period} brief={brief.data as CoachBrief} />
    : brief.error
      ? <button onClick={brief.regenerate} className="rounded-2xl border border-[var(--sl-border)] p-4 text-left text-[13px] text-[var(--sl-t3)]">{brief.error} Tentar de novo.</button>
      : <div className="h-40 animate-pulse rounded-2xl bg-[var(--sl-s2)]" />

  const crossBand = cross.data
    ? <CrossBand
        segments={(cross.data as { segments: CrossSegment[] }).segments}
        action={(cross.data as { action: { label: string; targetModule: ModuleId; href: string } }).action} />
    : undefined

  const w = whisper.data as { lead: string; recommendation: string; action?: { label: string; href: string }; variant: 'soft' | 'solid' } | null
  const evidenceWithWhisper = (
    <div className="flex flex-col gap-3">
      {evidence}
      {w && <CoachWhisper bold={w.lead} text={w.recommendation} action={w.action?.label} variant={w.variant} />}
    </div>
  )

  return (
    <CoachLedLayout
      hero={hero}
      crossBand={crossBand}
      evidence={evidenceWithWhisper}
      aside={<CoachAgenda title="Proximos 7 dias" items={agenda} emptyLabel="Nenhuma recorrente proxima." />}
      detail={detail}
    />
  )
}
```

- [ ] **Step 2: Recompor `financas/page.tsx` (desktop)**

No ramo desktop (`hidden lg:block`), **remover** `<KpiStrip/>`, `<HealthBand/>`, `<AiConsultant/>` e `<FinancialInsightCard/>` do topo. Manter `<ModuleHeader/>`. Substituir a `<FinancasCoachSection period={period}/>` antiga pela nova, passando evidência/detalhe/agenda reais já existentes na página:

```tsx
import { FinancasCoachSection } from '@/components/financas/FinancasCoachSection'
import { FluxoCaixaSection } from '@/components/financas/FluxoCaixaSection'
import { HistoricoChart } from '@/components/financas/HistoricoChart'
import { fmtBRL } from '@/lib/format/currency'
// ...
// derivar a agenda das proximas recorrentes ja carregadas na page (ex.: `recorrentes`):
const agenda = (proximasRecorrentes ?? []).slice(0, 5).map((r) => ({
  id: r.id,
  day: String(new Date(r.next_date).getDate()),
  weekday: new Date(r.next_date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
  label: r.description,
  amount: (r.type === 'income' ? '+ ' : '- ') + fmtBRL(r.amount, { compact: true }),
  positive: r.type === 'income',
  moduleColor: 'var(--sl-em)',
}))
// ...
<ModuleHeader /* ...props existentes... */ />
<FinancasCoachSection
  period={period}
  evidence={<FluxoCaixaSection /* ...props existentes... */ />}
  detail={<HistoricoChart /* ...props existentes... */ />}
  agenda={agenda}
/>
{/* manter abaixo: grid(OrcamentosCard + UltimasTransacoes), ProjecaoSaldo — ou mover ProjecaoSaldo para dentro da agenda depois */}
```

> Nota: `KpiStrip`, `HealthBand`, `AiConsultant`, `FinancialInsightCard` continuam existindo no repo (usados no mobile/legado) — só saem da composição desktop do Finanças. Deletar em plano futuro se ficarem órfãos (grep antes).

- [ ] **Step 3: Verificar tipos e testes** — `npx tsc --noEmit` → PASS; `npx vitest run` → suíte verde. Ajustar os nomes reais das props de `FluxoCaixaSection`/`HistoricoChart`/campo de recorrentes conforme a página (o executor abre os arquivos e casa os tipos).

- [ ] **Step 4: Build** — `npm run build` → PASS; rota `/financas` compila.

- [ ] **Step 5: Validação visual (em produção, obrigatória)** — `npm run build` + `npx next start -p 3006`, logar (usuário de QA `admin@synclife.dev`, ver `memory/reference_qa_test_user.md`; Supabase precisa estar `ACTIVE_HEALTHY`), abrir `/financas`. Conferir contra a Variante B: (1) hero com headline + pílulas à esq. e MicroStatRail à dir.; (2) **sem** KPI strip, **sem** HealthBand, **sem** consultor de 4 tiles; (3) CrossBand; (4) grade evidência = Fluxo + agenda; (5) 1 número grande na dobra (P-02); (6) ≤6 blocos na dobra. Rodar o **checklist de 40 perguntas** (`section-checklist.jsx`) — alvo ≥80% verde. Validar Navy Deep + Cream.

- [ ] **Step 6: Commit**

```bash
git add src/components/financas/FinancasCoachSection.tsx src/app/\(app\)/financas/page.tsx
git commit -m "feat(anatomia): Financas recomposto em P-A (Variante B) — remove KPI strip/HealthBand/4-tiles"
```

---

## Self-Review (feito na autoria)

- **Cobertura da spec (Anatomia v3.1):** princípios P-01…P-06 e 4 padrões → doc reescrito (T1). P-A concreto: hero conversacional sem 4 tiles (T3, P-01), 1 número grande (MicroStatRail big, T2/P-02), container só quando agrupa (evidência sem cards solitários, T5/P-03), elo cross (CrossBand no layout, T6/P-04), próxima ação (pílula primária, T3/P-05). Piloto Finanças recomposto na Variante B removendo o anti-pattern auditado (T6). Checklist rodado em T6 step 5. ✅
- **Placeholders:** nenhum código com TODO; os únicos pontos "casar props reais" (T6 step 2/3) são explícitos porque dependem das assinaturas vivas de `FluxoCaixaSection`/`HistoricoChart` na página — o executor abre e casa os tipos. ✅
- **Consistência de tipos:** `CoachBrief` (T3) = saída de `/api/ai/coach-brief` (Plano 2, inalterada). `MicroStat` (T2) consumido por `CoachHero` (T3). `CoachLedLayoutProps` (T4) e `CoachAgendaItem` (T5) consumidos por `FinancasCoachSection` (T6). `useCoachBrief/Cross/Whisper` (Plano 2) reusados sem mudança. ✅
- **Fora deste plano (Planos 4-6):** rollout P-A em Tempo/Patrimônio/Carreira/Mente (exige estender `buildModuleContext` a esses módulos — hoje só financas/panorama); P-B (Panorama, Conquistas); P-C (Transações e listas); P-D (Configurações, já perto). Mapeados abaixo.

---

## Matriz de rollout (documenta o rollout completo dos 4 padrões)

> Cada linha vira uma task no seu plano. As raízes L primeiro (definem hero+cross que as sub-telas herdam). "Dep" = dependência técnica.

| Tela / rota | Padrão | Plano | Mudança principal | Dep |
|---|---|---|---|---|
| **Finanças** `/financas` | P-A | **3 (este)** | Variante B: remove KPI strip/HealthBand/4-tiles; hero conduz | — |
| Tempo `/tempo` | P-A | 4 | idem, dados de Tempo | `buildModuleContext(tempo)` |
| Patrimônio `/patrimonio` | P-A | 4 | idem; treemap vira evidência | `buildModuleContext(patrimonio)` |
| Carreira `/carreira` | P-A | 4 | idem; roadmap `Timeline` vira detalhe | `buildModuleContext(carreira)` |
| Mente `/mente` | P-A | 4 | idem; trilhas viram evidência | `buildModuleContext(mente)` |
| Panorama `/dashboard` | P-B | 5 | HeroScore + mosaic 3×N + eventos IA + cross; remove KPI strip aninhado | reusa `HeroScoreMassive`, `ModuleMosaic` |
| Conquistas `/conquistas` | P-B | 5 | HeroLevel vira o hero-score; narrativa IA de progresso | — |
| Transações `/financas/transacoes` | P-C | 6 | captura inline no topo; remove `JornadaInsight` strip; IA lateral opcional | — |
| Ativos `/patrimonio/carteira` | P-C | 6 | idem | — |
| Tarefas/Eventos `/tempo/agenda` | P-C | 6 | idem | — |
| Configurações `/configuracoes` | P-D | 6 | já perto: + busca de config + assistente IA opcional | — |
| Onboarding `/onboarding` | P-D | 6 | seções numeradas + SaveBar (já perto) | — |
| Sub-telas restantes (≈38) | herdam do pai | 4-6 | Coach pill + subset (KpiStrip/Whisper/ProgressList/Timeline/Donut) | — |
| Mobile (todas) | cross-pattern | 7 | portar P-A/B/C/D para shells mobile; drill-down; IA em tela própria | — |

**Receita P-A (para replicar nos Planos 4):** (1) garantir `buildModuleContext(<mod>)` no servidor; (2) `<ModuleHeader/>` + `<XCoachSection period evidence detail agenda/>` copiando `FinancasCoachSection`; (3) hero via `useCoachBrief(<mod>)`, cross via `useCoachCross(<mod>)`, whisper inline; (4) evidência = o chart/tabela mais informativo do módulo; (5) rodar o checklist ≥80%.

---

## Execução

**REQUIRED SUB-SKILL:** superpowers:subagent-driven-development (fresh subagent por task + revisão spec → revisão qualidade). Tasks 1-5 são fundação (docs + 3 componentes + refactor do hero); Task 6 é o piloto Finanças em P-A. Commit por task; validação visual **em `next start`** (não dev) no checkpoint T6.
