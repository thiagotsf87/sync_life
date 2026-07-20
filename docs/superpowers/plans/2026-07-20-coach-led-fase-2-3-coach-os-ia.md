# Coach-led v4 — Plano 2: Coach OS + IA real (Fases 2-3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar a camada "Coach como sistema operacional": overlays globais (`⌘K` command palette, `⌘J` coach drawer, `?` cheat sheet) montados no shell autenticado, o hero do Coach + CrossBand por módulo, e trocar a IA por real (`lib/coach/context.ts` server-side + 4 rotas `generateObject`/`streamText` + hooks), com Finanças como módulo-piloto.

**Architecture:** Estado dos overlays em um `stores/coach-store.ts` dedicado (um overlay por vez). Um hook `use-global-keys` liga ⌘K/⌘J/?/esc; um `<CoachOSOverlays/>` monta palette+drawer+cheat dentro do `<NewAppShell>` (único client boundary sempre montado, dentro do `<QueryProvider>`). Palette e cheat reusam `ui/dialog.tsx` (Radix); o drawer reusa `ui/sheet.tsx` (Radix `side="right"`) — ambos com override de z-scale (`--sl-z-*`), backdrop (`--sl-backdrop`) e superfícies (`--sl-*`). O chat vira um `<CoachChat>` compartilhado extraído de `coach/page.tsx`. Na Fase 3, `buildModuleContext` roda **no servidor** (fonte de verdade para UI afirmativa) e alimenta 4 rotas novas; hooks com cache por módulo+período trocam o regex frágil. Tudo atrás da feature flag `coachOsEnabled` (rollback de 1 linha).

**Tech Stack:** Next.js 16, React 19, TS strict, Tailwind v4, Zustand, Radix (`radix-ui` unificado), lucide-react, Vercel AI SDK v6 (`streamText().toTextStreamResponse()` + `generateObject`), `@ai-sdk/groq` + `@ai-sdk/google`, Zod v4, Supabase SSR, `@upstash/ratelimit`, vitest + `react-dom/server`.

**Escopo — Plano 2 de 3:** Cobre **Fase 2 (Coach OS)** + **Fase 3 (IA real, piloto Finanças)** da spec `docs/superpowers/specs/2026-07-19-coach-led-redesign-design.md`. Plano 1 (Fases 0-1) concluído. Plano 3 (rollout 68 telas + mobile, Fases 4-5) vem depois. As duas fases deste plano são commitáveis/testáveis de forma independente: ao fim da Fase 2 os overlays funcionam sobre a IA existente (`/api/ai/coach`); a Fase 3 troca por IA real.

---

## Convenções de verificação (todo o plano)

- **Precedência:** verificação canônica do `CLAUDE.md` = `tsc --noEmit` + `npm run build` + visual nos 4 temas. Reusar os smoke tests `renderToString` (sem DOM/RTL) para travar API/markup e lógica pura (stores, context builder, parsing) via vitest `environment: 'node'`. Página de specimens estende `app/dev/coach-specimens` (rota já gateada com `notFound()` em produção — ver Plano 1).
- Rodar comandos a partir de `web/` (CWD do terminal). `git add src/...` (nunca `web/src/...`).
- **React SSR insere `<!-- -->` entre nós de texto adjacentes** — em asserts de string, normalizar com `html.replace(/<!-- -->/g,'')` antes de checar substrings.
- Regras G: **G-01** (todo gráfico com tooltip), **G-02** (`.sl-num`/`.sl-num-strong`, mono só em timestamps/datas/atalhos), **G-03** (gradient só logo/ring), **G-05** (1 hero/tela), **G-06** (cor de módulo é identificação; CTA sempre `--sl-em`), **G-07** (Lucide, nunca emoji).
- **a11y dos overlays (§4.1 da spec):** Radix (`dialog`/`sheet`) já entrega `role=dialog` + `aria-modal` + foco preso + retorno de foco + scroll-lock + esc/click-backdrop. Não reimplementar. O `coach-store` garante **um overlay por vez**. Todo root de overlay carrega `data-sl-overlay` (herda o corte de `prefers-reduced-motion` de `globals.css`).
- **Segurança (Fase 3):** contexto afirmativo é gerado no servidor (`buildModuleContext` no route handler). O client não é fonte de verdade para fatos.

## File structure

| Arquivo | Responsabilidade |
|---|---|
| `web/src/lib/flags.ts` (criar) | `COACH_OS_ENABLED` — feature flag lida no AppShell (rollback 1 linha) |
| `web/src/stores/coach-store.ts` (criar) | estado dos overlays (um por vez) + prompt pendente do drawer |
| `web/src/hooks/use-global-keys.ts` (criar) | listener global ⌘K/⌘J/?/esc (ignora quando digitando) |
| `web/src/components/coach/CoachChat.tsx` (criar) | chat compartilhado (extraído de `coach/page.tsx`); props de endpoint/contexto/prompts/accent |
| `web/src/components/coach/CommandPalette.tsx` (criar) | ⌘K — grupos ir para / capturar / perguntar; nav por teclado |
| `web/src/components/coach/CoachDrawer.tsx` (criar) | ⌘J — Sheet right com `<CoachChat>` contextual por `activeModule` |
| `web/src/components/coach/CheatSheet.tsx` (criar) | ? — linhas atalho→descrição com `<KbdChip>` |
| `web/src/components/coach/CoachOSOverlays.tsx` (criar) | monta palette+drawer+cheat + chama `useGlobalKeys`; gate pela flag |
| `web/src/components/coach/CoachHero.tsx` (criar) | hero do Coach por módulo (mock na Fase 2, brief real na Fase 3) |
| `web/src/components/coach/CrossBand.tsx` (criar) | storytelling cross-módulo (mock na Fase 2, cross real na Fase 3) |
| `web/src/components/coach/CoachPill.tsx` (criar) | trigger desktop no `TopHeader` (abre drawer, `⌘J`) |
| `web/src/components/shell/AppShell.tsx` (modificar) | montar `<CoachOSOverlays/>` dentro do `<QueryProvider>` |
| `web/src/components/shell/TopHeader.tsx` (modificar) | inserir `<CoachPill/>` antes de `<ThemePill/>` |
| `web/src/components/shell/CoachFab.tsx` (modificar) | trigger mobile: abrir drawer em vez de `router.push('/coach')`; reposicionar |
| `web/src/lib/coach/context.ts` (criar) | `buildModuleContext(supabase,userId,moduleId)` (server) + `MODULE_PERSONA` |
| `web/src/app/api/ai/coach-thread/route.ts` (criar) | streamText/Groq contextual (drawer + `/coach`) |
| `web/src/app/api/ai/coach-brief/route.ts` (criar) | generateObject — hero + KpiStrip |
| `web/src/app/api/ai/coach-whisper/route.ts` (criar) | generateObject — whisper (aposenta o regex) |
| `web/src/app/api/ai/coach-cross/route.ts` (criar) | generateObject — CrossBand |
| `web/src/hooks/use-coach.ts` (criar) | `useCoachThread/Brief/Whisper/Cross` (cache módulo+período + regenerate) |
| `web/src/components/financas/FinancialInsightCard.tsx` (modificar) | trocar `useFinancialInsights` por `useCoachWhisper` |
| `web/src/app/dev/coach-specimens/specimens-content.tsx` (modificar) | adicionar CoachHero + CrossBand aos specimens |
| `web/src/**/*.test.ts(x)` (criar) | smoke tests dos itens acima |

---

# FASE 2 — Coach OS

## Task 1: `coach-store` (estado dos overlays, um por vez)

**Files:**
- Create: `web/src/stores/coach-store.ts`
- Test: `web/src/stores/coach-store.test.ts`

- [ ] **Step 1: Escrever o teste (falha primeiro)**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCoachStore } from './coach-store'

const reset = () => useCoachStore.setState({ open: null, pendingPrompt: null })

describe('coach-store', () => {
  beforeEach(reset)

  it('abre um overlay por vez (abrir palette fecha drawer)', () => {
    useCoachStore.getState().openOverlay('coachDrawer')
    expect(useCoachStore.getState().open).toBe('coachDrawer')
    useCoachStore.getState().openOverlay('palette')
    expect(useCoachStore.getState().open).toBe('palette')
  })

  it('toggleOverlay fecha se já estava aberto', () => {
    useCoachStore.getState().toggleOverlay('cheat')
    expect(useCoachStore.getState().open).toBe('cheat')
    useCoachStore.getState().toggleOverlay('cheat')
    expect(useCoachStore.getState().open).toBe(null)
  })

  it('closeAll zera overlay e prompt pendente', () => {
    useCoachStore.getState().openDrawerWithPrompt('Como está meu mês?')
    expect(useCoachStore.getState().open).toBe('coachDrawer')
    expect(useCoachStore.getState().pendingPrompt).toBe('Como está meu mês?')
    useCoachStore.getState().closeAll()
    expect(useCoachStore.getState().open).toBe(null)
    expect(useCoachStore.getState().pendingPrompt).toBe(null)
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/stores/coach-store.test.ts`
Expected: FAIL ("Cannot find module './coach-store'").

- [ ] **Step 3: Implementar o store**

```ts
import { create } from 'zustand'

export type OverlayName = 'palette' | 'coachDrawer' | 'cheat'

interface CoachState {
  /** Overlay aberto no momento (um por vez) ou null. */
  open: OverlayName | null
  /** Prompt a injetar no CoachChat quando o drawer abre via palette/sugestão. */
  pendingPrompt: string | null
  openOverlay: (name: OverlayName) => void
  toggleOverlay: (name: OverlayName) => void
  openDrawerWithPrompt: (prompt: string) => void
  consumePendingPrompt: () => string | null
  closeAll: () => void
}

export const useCoachStore = create<CoachState>((set, get) => ({
  open: null,
  pendingPrompt: null,
  openOverlay: (name) => set({ open: name }),
  toggleOverlay: (name) => set((s) => ({ open: s.open === name ? null : name })),
  openDrawerWithPrompt: (prompt) => set({ open: 'coachDrawer', pendingPrompt: prompt }),
  consumePendingPrompt: () => {
    const p = get().pendingPrompt
    if (p) set({ pendingPrompt: null })
    return p
  },
  closeAll: () => set({ open: null, pendingPrompt: null }),
}))
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/stores/coach-store.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/stores/coach-store.ts src/stores/coach-store.test.ts
git commit -m "feat(coach): coach-store — estado dos overlays (um por vez) + prompt pendente"
```

---

## Task 2: `lib/flags.ts` (feature flag `coachOsEnabled`)

**Files:**
- Create: `web/src/lib/flags.ts`
- Test: `web/src/lib/flags.test.ts`

- [ ] **Step 1: Escrever o teste (falha primeiro)**

```ts
import { describe, it, expect } from 'vitest'
import { COACH_OS_ENABLED } from './flags'

describe('flags', () => {
  it('COACH_OS_ENABLED é boolean e default ligado (não "off")', () => {
    expect(typeof COACH_OS_ENABLED).toBe('boolean')
    expect(COACH_OS_ENABLED).toBe(process.env.NEXT_PUBLIC_COACH_OS !== 'off')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run src/lib/flags.test.ts`
Expected: FAIL ("Cannot find module './flags'").

- [ ] **Step 3: Implementar a flag**

```ts
/**
 * Feature flag da camada Coach OS (overlays + hero + cross).
 * Rollback de 1 linha: setar NEXT_PUBLIC_COACH_OS=off desliga tudo.
 * Lida no client (AppShell) → precisa do prefixo NEXT_PUBLIC_.
 */
export const COACH_OS_ENABLED = process.env.NEXT_PUBLIC_COACH_OS !== 'off'
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run src/lib/flags.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flags.ts src/lib/flags.test.ts
git commit -m "feat(coach): feature flag COACH_OS_ENABLED (rollback de 1 linha)"
```

---

## Task 3: `CoachChat` (chat compartilhado, extraído de `coach/page.tsx`)

**Files:**
- Create: `web/src/components/coach/CoachChat.tsx`
- Test: `web/src/components/coach/CoachChat.test.tsx`

**Contexto:** `coach/page.tsx` (linhas 84-150) tem o loop `fetch → res.body.getReader() → TextDecoder` que reescreve a última mensagem do assistant. Extraímos esse comportamento para um componente parametrizável. Na Fase 2 os callers passam `endpoint="/api/ai/coach"` e `buildBody`. Na Fase 3, trocam por `useCoachThread` → `/api/ai/coach-thread`.

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachChat } from './CoachChat'

describe('CoachChat', () => {
  it('renderiza estado vazio com prompts sugeridos e placeholder', () => {
    const html = renderToString(
      <CoachChat
        endpoint="/api/ai/coach"
        buildBody={(messages) => ({ messages })}
        suggestedPrompts={['Como melhorar meu score?']}
        accent="var(--sl-em)"
        placeholder="Pergunte ao Coach"
      />,
    )
    expect(html).toContain('Como melhorar meu score?')
    expect(html).toContain('Pergunte ao Coach')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run src/components/coach/CoachChat.test.tsx`
Expected: FAIL ("Cannot find module './CoachChat'").

- [ ] **Step 3: Implementar o `CoachChat`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CoachChatProps {
  /** Rota AI a chamar (Fase 2: /api/ai/coach; Fase 3: /api/ai/coach-thread). */
  endpoint: string
  /** Monta o body do POST a partir do histórico (injeta contexto/moduleId). */
  buildBody: (messages: CoachMessage[]) => Record<string, unknown>
  suggestedPrompts?: string[]
  accent?: string
  placeholder?: string
  disclaimer?: string
  /** Prompt inicial injetado (drawer aberto via palette/sugestão). */
  initialPrompt?: string | null
  className?: string
}

/** Chat streaming compartilhado (drawer + /coach + hero-ask). Lê text stream via getReader(). */
export function CoachChat({
  endpoint, buildBody, suggestedPrompts = [], accent = 'var(--sl-em)',
  placeholder = 'Pergunte ao Coach', disclaimer, initialPrompt, className,
}: CoachChatProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const sentInitial = useRef(false)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    const next = [...messages, { role: 'user' as const, content: trimmed }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(next)),
      })
      if (!res.ok || !res.body) throw new Error(String(res.status))
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((m) => [...next, { role: 'assistant', content: acc }])
      }
      if (!acc) setMessages((m) => [...next, { role: 'assistant', content: 'Não consegui responder agora. Tente de novo.' }])
    } catch {
      setMessages((m) => [...next, { role: 'assistant', content: 'Erro ao consultar a IA. Tente novamente.' }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) { sentInitial.current = true; void send(initialPrompt) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex-1 space-y-3 overflow-y-auto phone-scroll">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2">
            {suggestedPrompts.map((p) => (
              <button key={p} type="button" onClick={() => send(p)}
                className="rounded-xl border border-dashed border-[var(--sl-border-em)] px-3 py-2 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-em-soft)]">
                <Sparkles size={13} className="mr-2 inline text-[var(--sl-em)]" />{p}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-normal',
              m.role === 'user'
                ? 'ml-auto bg-[var(--sl-em)] text-white'
                : 'bg-[var(--sl-s2)] text-[var(--sl-t1)]')}>
              {m.content || (isLoading && i === messages.length - 1 ? '…' : '')}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input) }}
        className="mt-3 flex items-end gap-2 border-t border-[var(--sl-border)] pt-3">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          rows={1} placeholder={placeholder}
          className="max-h-32 flex-1 resize-none bg-transparent text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]" />
        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Enviar"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
          style={{ background: accent }}>
          <Send size={14} />
        </button>
      </form>
      {disclaimer && <p className="mt-1.5 text-[10px] text-[var(--sl-t4)]">{disclaimer}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run src/components/coach/CoachChat.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS (exit 0). Nota: o param `m` não usado em `setMessages((m) => ...)` — trocar por `()` se o lint reclamar.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CoachChat.tsx src/components/coach/CoachChat.test.tsx
git commit -m "feat(coach): CoachChat — chat streaming compartilhado (getReader) parametrizavel"
```

---

## Task 4: `CommandPalette` (⌘K)

**Files:**
- Create: `web/src/components/coach/CommandPalette.tsx`
- Test: `web/src/components/coach/CommandPalette.test.tsx`

**Contexto:** reusa `ui/dialog.tsx` (Radix). Grupos: **Ir para** (de `MODULE_LIST` → `basePath` + `navItems` do módulo ativo), **Capturar** (de `MODULE_ACTIONS[activeModule]` em `shell/QuickActionSheet.tsx`), **Perguntar ao Coach** (texto livre → `openDrawerWithPrompt`). `cmdk` NÃO está instalado — a navegação por teclado é própria. Override de z (`--sl-z-palette`), backdrop e superfícies.

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CommandPalette } from './CommandPalette'

describe('CommandPalette', () => {
  it('não renderiza conteúdo quando fechado', () => {
    const html = renderToString(<CommandPalette open={false} onClose={() => {}} activeModule="financas" />)
    expect(html).not.toContain('Ir para')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npx vitest run src/components/coach/CommandPalette.test.tsx`
Expected: FAIL ("Cannot find module './CommandPalette'").

- [ ] **Step 3: Implementar o `CommandPalette`**

```tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CornerDownLeft, Search, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { KbdChip } from '@/components/ui/kbd-chip'
import { MODULES, MODULE_LIST } from '@/lib/modules'
import { MODULE_ACTIONS } from '@/components/shell/QuickActionSheet'
import { useCoachStore } from '@/stores/coach-store'
import type { ModuleId } from '@/types/shell'

interface Item { id: string; label: string; group: string; run: () => void }

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  activeModule: ModuleId
}

export function CommandPalette({ open, onClose, activeModule }: CommandPaletteProps) {
  const router = useRouter()
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const items = useMemo<Item[]>(() => {
    const go: Item[] = MODULE_LIST.map((m) => ({
      id: `go-${m.id}`, label: m.label, group: 'Ir para',
      run: () => { router.push(m.basePath); onClose() },
    }))
    const nav: Item[] = (MODULES[activeModule]?.navItems ?? []).map((n) => ({
      id: `nav-${n.id}`, label: `${MODULES[activeModule].label}: ${n.label}`, group: 'Ir para',
      run: () => { router.push(n.href); onClose() },
    }))
    const cap: Item[] = (MODULE_ACTIONS[activeModule] ?? MODULE_ACTIONS.panorama).map((a, i) => ({
      id: `cap-${i}`, label: a.label, group: 'Capturar',
      run: () => { if (!a.href.startsWith('__')) router.push(a.href); onClose() },
    }))
    return [...go, ...nav, ...cap]
  }, [activeModule, router, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items
    const ask: Item = {
      id: 'ask', label: q ? `Perguntar ao Coach: “${query.trim()}”` : 'Perguntar ao Coach…',
      group: 'Perguntar', run: () => { if (q) { openDrawerWithPrompt(query.trim()); onClose() } },
    }
    return [...base, ask]
  }, [items, query, openDrawerWithPrompt, onClose])

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>()
    filtered.forEach((it) => { const g = map.get(it.group) ?? []; g.push(it); map.set(it.group, g) })
    return [...map.entries()]
  }, [filtered])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[cursor]?.run() }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent showCloseButton={false} data-sl-overlay
        aria-label="Paleta de comandos"
        className="top-[18%] max-w-[560px] translate-y-0 gap-0 border-[var(--sl-border)] bg-[var(--sl-s-hero)] p-0"
        style={{ zIndex: 'var(--sl-z-palette)' }}>
        <div className="flex items-center gap-2 border-b border-[var(--sl-border)] px-4 py-3">
          <Search size={16} className="text-[var(--sl-t3)]" />
          <input autoFocus value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0) }} onKeyDown={onKeyDown}
            role="combobox" aria-expanded aria-controls="cmdk-list" aria-activedescendant={filtered[cursor]?.id}
            placeholder="Buscar ou perguntar…"
            className="flex-1 bg-transparent text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]" />
          <KbdChip>esc</KbdChip>
        </div>
        <div id="cmdk-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {groups.map(([group, its]) => (
            <div key={group} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--sl-t4)]">{group}</p>
              {its.map((it) => {
                const idx = filtered.indexOf(it)
                const active = idx === cursor
                return (
                  <button key={it.id} id={it.id} role="option" aria-selected={active}
                    onMouseEnter={() => setCursor(idx)} onClick={it.run}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-[var(--sl-t1)]"
                    style={{ background: active ? 'var(--sl-s2)' : 'transparent' }}>
                    {it.group === 'Perguntar' ? <Sparkles size={14} className="text-[var(--sl-em)]" /> : <ArrowRight size={14} className="text-[var(--sl-t3)]" />}
                    <span className="flex-1">{it.label}</span>
                    {active && <CornerDownLeft size={13} className="text-[var(--sl-t4)]" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

Run: `npx vitest run src/components/coach/CommandPalette.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS. Se `MODULE_ACTIONS` não estiver exportado em `QuickActionSheet.tsx`, exportá-lo (`export const MODULE_ACTIONS`) neste passo.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CommandPalette.tsx src/components/coach/CommandPalette.test.tsx src/components/shell/QuickActionSheet.tsx
git commit -m "feat(coach): CommandPalette (Cmd+K) — ir para / capturar / perguntar + nav por teclado"
```

---

## Task 5: `CoachDrawer` (⌘J)

**Files:**
- Create: `web/src/components/coach/CoachDrawer.tsx`
- Test: `web/src/components/coach/CoachDrawer.test.tsx`

**Contexto:** reusa `ui/sheet.tsx` (Radix, `side="right"` default). Renderiza `<CoachChat>` contextual por `activeModule`. Na Fase 2 usa `/api/ai/coach` com `buildBody` mínimo; na Fase 3 troca por `useCoachThread`. Injeta `pendingPrompt` do store como `initialPrompt`. Override z (`--sl-z-drawer`) e largura > `sm:max-w-sm`.

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachDrawer } from './CoachDrawer'

describe('CoachDrawer', () => {
  it('renderiza título contextual quando aberto', () => {
    const html = renderToString(
      <CoachDrawer open onClose={() => {}} activeModule="financas" pendingPrompt={null} />,
    )
    expect(html).toContain('Coach')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachDrawer.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachDrawer`**

```tsx
'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CoachChat } from './CoachChat'
import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

export interface CoachDrawerProps {
  open: boolean
  onClose: () => void
  activeModule: ModuleId
  pendingPrompt: string | null
}

/** Drawer do Coach (Cmd+J) — chat contextual por módulo ativo. */
export function CoachDrawer({ open, onClose, activeModule, pendingPrompt }: CoachDrawerProps) {
  const mod = MODULES[activeModule] ?? MODULES.panorama
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent data-sl-overlay
        className="flex w-full flex-col border-l border-[var(--sl-border)] bg-[var(--sl-s1)] sm:max-w-md"
        style={{ zIndex: 'var(--sl-z-drawer)' }}>
        <SheetHeader className="px-0">
          <SheetTitle className="font-syne text-[var(--sl-t1)]">
            Coach · <span style={{ color: mod.color }}>{mod.label}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <CoachChat
            endpoint="/api/ai/coach"
            buildBody={(messages) => ({ messages })}
            initialPrompt={pendingPrompt}
            suggestedPrompts={[`Como está meu módulo ${mod.label}?`, 'O que devo priorizar esta semana?']}
            placeholder={`Pergunte sobre ${mod.label}`}
            disclaimer="O Coach pode errar. Confira dados importantes."
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachDrawer.test.tsx` → PASS.

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CoachDrawer.tsx src/components/coach/CoachDrawer.test.tsx
git commit -m "feat(coach): CoachDrawer (Cmd+J) — chat contextual por modulo (Sheet right)"
```

---

## Task 6: `CheatSheet` (?)

**Files:**
- Create: `web/src/components/coach/CheatSheet.tsx`
- Test: `web/src/components/coach/CheatSheet.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CheatSheet } from './CheatSheet'

describe('CheatSheet', () => {
  it('lista os atalhos quando aberto', () => {
    const html = renderToString(<CheatSheet open onClose={() => {}} />)
    expect(html).toContain('Command palette')
    expect(html.replace(/<!-- -->/g, '')).toContain('⌘K')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CheatSheet.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CheatSheet`**

```tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KbdChip } from '@/components/ui/kbd-chip'

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘K'], label: 'Command palette' },
  { keys: ['⌘J'], label: 'Coach drawer' },
  { keys: ['?'], label: 'Atalhos (este painel)' },
  { keys: ['esc'], label: 'Fechar overlay' },
]

export interface CheatSheetProps { open: boolean; onClose: () => void }

export function CheatSheet({ open, onClose }: CheatSheetProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent data-sl-overlay
        className="max-w-[420px] border-[var(--sl-border)] bg-[var(--sl-s-hero)]"
        style={{ zIndex: 'var(--sl-z-cheat)' }}>
        <DialogHeader>
          <DialogTitle className="font-syne text-[var(--sl-t1)]">Atalhos</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-[13px] text-[var(--sl-t2)]">
              <span>{s.label}</span>
              <span className="flex gap-1">{s.keys.map((k) => <KbdChip key={k}>{k}</KbdChip>)}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CheatSheet.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/CheatSheet.tsx src/components/coach/CheatSheet.test.tsx
git commit -m "feat(coach): CheatSheet (?) — lista de atalhos com KbdChip"
```

---

## Task 7: `use-global-keys` (⌘K / ⌘J / ? / esc)

**Files:**
- Create: `web/src/hooks/use-global-keys.ts`
- Test: `web/src/hooks/use-global-keys.test.ts`

**Contexto:** nenhum listener global existe hoje. Ignorar quando o foco está em campo de texto (input/textarea/contenteditable) — exceto `esc`, que sempre fecha. `?` sem modificador. `⌘K`/`⌘J` com meta OU ctrl.

- [ ] **Step 1: Escrever o teste (lógica pura de decisão) — falha primeiro**

```ts
import { describe, it, expect } from 'vitest'
import { resolveShortcut } from './use-global-keys'

describe('resolveShortcut', () => {
  it('meta+k → palette', () => {
    expect(resolveShortcut({ key: 'k', metaKey: true, ctrlKey: false }, false)).toBe('palette')
  })
  it('ctrl+j → coachDrawer', () => {
    expect(resolveShortcut({ key: 'j', metaKey: false, ctrlKey: true }, false)).toBe('coachDrawer')
  })
  it('? sem foco de texto → cheat', () => {
    expect(resolveShortcut({ key: '?', metaKey: false, ctrlKey: false }, false)).toBe('cheat')
  })
  it('? digitando em campo → ignora', () => {
    expect(resolveShortcut({ key: '?', metaKey: false, ctrlKey: false }, true)).toBe(null)
  })
  it('esc sempre → close', () => {
    expect(resolveShortcut({ key: 'Escape', metaKey: false, ctrlKey: false }, true)).toBe('close')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/hooks/use-global-keys.test.ts` → FAIL.

- [ ] **Step 3: Implementar o hook + a função pura**

```ts
import { useEffect } from 'react'
import { useCoachStore } from '@/stores/coach-store'

type KeyInfo = { key: string; metaKey: boolean; ctrlKey: boolean }
export type ShortcutResult = 'palette' | 'coachDrawer' | 'cheat' | 'close' | null

/** Decisão pura de atalho (testável sem DOM). `typing` = foco em campo de texto. */
export function resolveShortcut(e: KeyInfo, typing: boolean): ShortcutResult {
  if (e.key === 'Escape') return 'close'
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'k') return 'palette'
  if (mod && e.key.toLowerCase() === 'j') return 'coachDrawer'
  if (!mod && e.key === '?' && !typing) return 'cheat'
  return null
}

function isTyping(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null
  if (!t) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable
}

/** Liga os atalhos globais. Chamar uma vez, no shell. */
export function useGlobalKeys() {
  const toggleOverlay = useCoachStore((s) => s.toggleOverlay)
  const closeAll = useCoachStore((s) => s.closeAll)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const r = resolveShortcut(e, isTyping(e.target))
      if (!r) return
      e.preventDefault()
      if (r === 'close') closeAll()
      else toggleOverlay(r)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleOverlay, closeAll])
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/hooks/use-global-keys.test.ts` → PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-global-keys.ts src/hooks/use-global-keys.test.ts
git commit -m "feat(coach): use-global-keys — atalhos globais Cmd+K/Cmd+J/?/esc"
```

---

## Task 8: `CoachPill` (trigger desktop) + wire no `TopHeader`

**Files:**
- Create: `web/src/components/coach/CoachPill.tsx`
- Modify: `web/src/components/shell/TopHeader.tsx` (inserir antes de `<ThemePill/>`, ~linha 35)
- Test: `web/src/components/coach/CoachPill.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachPill } from './CoachPill'

describe('CoachPill', () => {
  it('renderiza rótulo Coach e o atalho', () => {
    const html = renderToString(<CoachPill />)
    expect(html).toContain('Coach')
    expect(html.replace(/<!-- -->/g, '')).toContain('⌘J')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachPill.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachPill`**

```tsx
'use client'

import { Sparkles } from 'lucide-react'
import { KbdChip } from '@/components/ui/kbd-chip'
import { useCoachStore } from '@/stores/coach-store'

/** Trigger do Coach no header desktop — abre o drawer (Cmd+J). */
export function CoachPill() {
  const openOverlay = useCoachStore((s) => s.openOverlay)
  return (
    <button type="button" onClick={() => openOverlay('coachDrawer')} aria-label="Abrir Coach"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sl-border-em)] bg-[var(--sl-em-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--sl-t1)] hover:border-[var(--sl-em)]">
      <Sparkles size={13} className="text-[var(--sl-em)]" />
      Coach
      <KbdChip>⌘J</KbdChip>
    </button>
  )
}
```

- [ ] **Step 4: Wire no `TopHeader.tsx`** — no grupo `<div className="flex items-center gap-2">` (após o spacer `flex-1`, ~linha 34), inserir `<CoachPill/>` imediatamente **antes** de `<ThemePill/>`:

```tsx
import { CoachPill } from '@/components/coach/CoachPill'
// ...
<div className="flex items-center gap-2">
  <CoachPill />
  <ThemePill />
  <NotifButton />
</div>
```

- [ ] **Step 5: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachPill.test.tsx` → PASS; `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/coach/CoachPill.tsx src/components/coach/CoachPill.test.tsx src/components/shell/TopHeader.tsx
git commit -m "feat(coach): CoachPill no header desktop — abre o drawer (Cmd+J)"
```

---

## Task 9: Trigger mobile — repropor `CoachFab` para abrir o drawer

**Files:**
- Modify: `web/src/components/shell/CoachFab.tsx`

**Contexto:** `CoachFab` é órfão (não montado) e hoje faz `router.push('/coach')`. Trocar por abrir o drawer via `coach-store`. Reposicionar para `left-5` (evita colisão com o `+` FAB do `MobileBottomBar`, que fica em `right-5 z-50`). Será montado no `CoachOSOverlays` (Task 10), mobile-only.

- [ ] **Step 1: Reescrever `CoachFab.tsx`**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useCoachStore } from '@/stores/coach-store'

/** FAB mobile do Coach — abre o drawer. Oculto em /coach e /configuracoes. */
export function CoachFab() {
  const pathname = usePathname()
  const openOverlay = useCoachStore((s) => s.openOverlay)
  if (pathname?.startsWith('/coach') || pathname?.startsWith('/configuracoes')) return null
  return (
    <button type="button" onClick={() => openOverlay('coachDrawer')} aria-label="Abrir Coach"
      className="fixed bottom-[84px] left-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg lg:hidden"
      style={{ background: 'var(--sl-em)' }}>
      <Sparkles size={20} />
    </button>
  )
}
```

- [ ] **Step 2: Verificar tipos** — `npx tsc --noEmit` → PASS. (Sem teste dedicado: componente trivial; coberto pelo smoke do `CoachOSOverlays`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/CoachFab.tsx
git commit -m "feat(coach): CoachFab mobile abre o drawer (era router.push) + reposiciona"
```

---

## Task 10: `CoachOSOverlays` + montar no `AppShell` (atrás da flag)

**Files:**
- Create: `web/src/components/coach/CoachOSOverlays.tsx`
- Modify: `web/src/components/shell/AppShell.tsx` (dentro do `<QueryProvider>`, antes de `</QueryProvider>`)
- Test: `web/src/components/coach/CoachOSOverlays.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachOSOverlays } from './CoachOSOverlays'

describe('CoachOSOverlays', () => {
  it('renderiza sem lançar (overlays fechados por padrão)', () => {
    const html = renderToString(<CoachOSOverlays />)
    expect(typeof html).toBe('string')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachOSOverlays.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachOSOverlays`**

```tsx
'use client'

import { useShellStore } from '@/stores/shell-store'
import { useCoachStore } from '@/stores/coach-store'
import { useGlobalKeys } from '@/hooks/use-global-keys'
import { CommandPalette } from './CommandPalette'
import { CoachDrawer } from './CoachDrawer'
import { CheatSheet } from './CheatSheet'
import { CoachFab } from '@/components/shell/CoachFab'

/** Monta os 3 overlays + o FAB mobile e liga os atalhos globais. */
export function CoachOSOverlays() {
  useGlobalKeys()
  const activeModule = useShellStore((s) => s.activeModule)
  const open = useCoachStore((s) => s.open)
  const pendingPrompt = useCoachStore((s) => s.pendingPrompt)
  const closeAll = useCoachStore((s) => s.closeAll)
  return (
    <>
      <CommandPalette open={open === 'palette'} onClose={closeAll} activeModule={activeModule} />
      <CoachDrawer open={open === 'coachDrawer'} onClose={closeAll} activeModule={activeModule} pendingPrompt={pendingPrompt} />
      <CheatSheet open={open === 'cheat'} onClose={closeAll} />
      <CoachFab />
    </>
  )
}
```

- [ ] **Step 4: Montar no `AppShell.tsx`** — import no topo e render dentro do `<QueryProvider>`, como irmão do `<div className="flex h-screen ...">`, imediatamente antes de `</QueryProvider>` (linha ~144), gateado pela flag:

```tsx
import { COACH_OS_ENABLED } from '@/lib/flags'
import { CoachOSOverlays } from '@/components/coach/CoachOSOverlays'
// ...
    {/* ...layout existente... */}
    {COACH_OS_ENABLED && <CoachOSOverlays />}
  </QueryProvider>
```

- [ ] **Step 5: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachOSOverlays.test.tsx` → PASS; `npx tsc --noEmit` → PASS; `npm run build` → PASS.

- [ ] **Step 6: Validação visual (dev)** — subir dev (`npm run dev`, bg, porta 3005), navegar a `/dashboard`, testar `⌘K` (palette abre, ↑/↓/enter navega), `⌘J` (drawer abre, chat responde), `?` (cheat), `esc` (fecha). Confirmar z acima do ModuleBar e 0 erros de console. Validar em Navy Deep + Cream.

- [ ] **Step 7: Commit**

```bash
git add src/components/coach/CoachOSOverlays.tsx src/components/coach/CoachOSOverlays.test.tsx src/components/shell/AppShell.tsx
git commit -m "feat(coach): montar Coach OS overlays no AppShell atras da flag"
```

---

## Task 11: `CoachHero` (hero por módulo — mock na Fase 2)

**Files:**
- Create: `web/src/components/coach/CoachHero.tsx`
- Test: `web/src/components/coach/CoachHero.test.tsx`

**Contexto:** único hero da tela (G-05). Eyebrow `Coach · <Módulo> · <período>`, headline com o fato em cor do módulo (G-06: cor de módulo é identificação, não é CTA), `KpiStrip` (Task existente da Fase 1), sugestões que abrem o drawer com prompt. Props aceitam `brief` (mock agora; `useCoachBrief` na Fase 3).

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoachHero } from './CoachHero'

describe('CoachHero', () => {
  it('renderiza eyebrow, headline e KPIs', () => {
    const html = renderToString(
      <CoachHero moduleId="financas" period="maio 2026"
        brief={{ eyebrow: 'Coach · Finanças · maio 2026', headline: { text: 'Você poupou 37% este mês', emphasis: '37%' },
          stats: [{ label: 'Saldo', value: 'R$ 1.840', big: true }, { label: 'Poupança', value: '37%' }],
          suggestions: [{ id: 's1', label: 'Como economizar mais?', prompt: 'Como economizar mais?', primary: true }] }} />,
    )
    expect(html).toContain('Finanças')
    expect(html.replace(/<!-- -->/g, '')).toContain('37%')
    expect(html).toContain('Como economizar mais?')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CoachHero.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CoachHero`**

```tsx
'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import { KpiStrip } from './KpiStrip'
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

/** Hero único do Coach por módulo (G-05). Fato em cor do módulo (G-06). */
export function CoachHero({ moduleId, brief, className }: CoachHeroProps) {
  const mod = MODULES[moduleId] ?? MODULES.panorama
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const { headline } = brief
  const parts = headline.emphasis ? headline.text.split(headline.emphasis) : [headline.text]
  return (
    <section className={cn('relative overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s-hero)] p-6', className)}>
      <div className="sl-hero-noise pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">{brief.eyebrow}</p>
        <h2 className="mb-4 font-syne text-2xl font-bold tracking-tight text-[var(--sl-t1)]">
          {parts[0]}
          {headline.emphasis && <span style={{ color: mod.color }}>{headline.emphasis}</span>}
          {parts[1] ?? ''}
        </h2>
        <KpiStrip items={brief.stats.map((s) => ({ label: s.label, value: s.value }))} className="mb-4" />
        <div className="flex flex-wrap gap-2">
          {brief.suggestions.map((s) => (
            <button key={s.id} type="button" onClick={() => openDrawerWithPrompt(s.prompt)}
              className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium',
                s.primary ? 'bg-[var(--sl-em)] text-white' : 'border border-[var(--sl-border-em)] text-[var(--sl-t1)]')}>
              <Sparkles size={12} className={s.primary ? 'text-white' : 'text-[var(--sl-em)]'} />{s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CoachHero.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/coach/CoachHero.tsx src/components/coach/CoachHero.test.tsx
git commit -m "feat(coach): CoachHero — hero unico por modulo (fato em cor do modulo, KpiStrip, sugestoes)"
```

---

## Task 12: `CrossBand` (storytelling cross-módulo — mock na Fase 2)

**Files:**
- Create: `web/src/components/coach/CrossBand.tsx`
- Test: `web/src/components/coach/CrossBand.test.tsx`

- [ ] **Step 1: Escrever o smoke test (falha primeiro)**

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CrossBand } from './CrossBand'

describe('CrossBand', () => {
  it('renderiza os segmentos e a ação', () => {
    const html = renderToString(
      <CrossBand segments={[{ moduleId: 'financas', text: 'Seus gastos caíram 12%' }, { moduleId: 'futuro', text: 'e sua reserva chegou a 67%', bold: true }]}
        action={{ label: 'Ver em Futuro', targetModule: 'futuro', href: '/futuro' }} />,
    )
    expect(html).toContain('reserva chegou a 67%')
    expect(html).toContain('Ver em Futuro')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/components/coach/CrossBand.test.tsx` → FAIL.

- [ ] **Step 3: Implementar o `CrossBand`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

export interface CrossSegment { moduleId: ModuleId; text: string; bold?: boolean }
export interface CrossBandProps {
  segments: CrossSegment[]
  action: { label: string; targetModule: ModuleId; href: string }
  className?: string
}

/** Banda de narrativa cross-módulo — 2 segmentos coloridos + ação de navegação. */
export function CrossBand({ segments, action, className }: CrossBandProps) {
  const router = useRouter()
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-s1)] px-4 py-3', className)}>
      <p className="flex-1 text-[13px] leading-normal text-[var(--sl-t2)]">
        {segments.map((s, i) => {
          const color = (MODULES[s.moduleId] ?? MODULES.panorama).color
          return (
            <span key={i}>
              <span className="mr-1 inline-block h-[7px] w-[7px] rounded-full align-middle" style={{ background: color }} />
              <span className={s.bold ? 'font-semibold text-[var(--sl-t1)]' : ''}>{s.text}</span>{' '}
            </span>
          )
        })}
      </p>
      <button type="button" onClick={() => router.push(action.href)}
        className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold"
        style={{ color: (MODULES[action.targetModule] ?? MODULES.panorama).color }}>
        {action.label}<ArrowRight size={13} />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/components/coach/CrossBand.test.tsx` → PASS.

- [ ] **Step 5: Atualizar barrel + specimens** — em `src/components/coach/index.ts` exportar `CoachHero`, `CrossBand`, `CoachChat` (+ tipos `CoachBrief`, `CrossSegment`). Em `src/app/dev/coach-specimens/specimens-content.tsx` adicionar um `<CoachHero .../>` e um `<CrossBand .../>` com mock (para validação visual dark+cream).

- [ ] **Step 6: Verificar + Commit**

Run: `npx tsc --noEmit` → PASS; `npx vitest run src/components/coach` → todos verdes.

```bash
git add src/components/coach/CrossBand.tsx src/components/coach/CrossBand.test.tsx src/components/coach/index.ts src/app/dev/coach-specimens/specimens-content.tsx
git commit -m "feat(coach): CrossBand + barrel/specimens (fim da Fase 2 — Coach OS montavel)"
```

---

# FASE 3 — IA real (piloto Finanças)

> **Segurança (spec §5.2, §8.3):** o contexto afirmativo é montado **no servidor** (`buildModuleContext` roda no route handler). O client não envia fatos. O Coach nunca afirma sobre mock (spec §8.1): onde não há dado real, o whisper vira sugestão (`tone: 'suggestion'`), não fato.

## Task 13: `lib/coach/context.ts` — `buildModuleContext` (server) + `MODULE_PERSONA`

**Files:**
- Create: `web/src/lib/coach/context.ts`
- Test: `web/src/lib/coach/context.test.ts`

**Contexto:** re-implementa server-side a agregação hoje presa em hooks client (`use-transactions`, `use-budgets`, `use-financial-insights`). Template do padrão server: `calcFinancasScore(sb, userId)` em `use-score-engine.ts`. `MODULE_PERSONA` deriva label/cor de `MODULES` (`lib/modules.ts`) e semeia o system prompt dos prompts já existentes em `coach/route.ts` e `financas/route.ts`.

- [ ] **Step 1: Escrever o teste (lógica pura de formatação) — falha primeiro**

```ts
import { describe, it, expect } from 'vitest'
import { summarizeFinancas, MODULE_PERSONA } from './context'

describe('coach/context', () => {
  it('summarizeFinancas calcula saldo e taxa de poupança', () => {
    const s = summarizeFinancas(
      [
        { amount: 5000, type: 'income', category: null },
        { amount: 3000, type: 'expense', category: { name: 'Moradia' } },
      ] as never,
    )
    expect(s.income).toBe(5000)
    expect(s.expenses).toBe(3000)
    expect(s.balance).toBe(2000)
    expect(s.savingsRate).toBe(40) // (5000-3000)/5000
  })

  it('MODULE_PERSONA tem persona para finanças com label e cor', () => {
    expect(MODULE_PERSONA.financas.label).toBe('Finanças')
    expect(MODULE_PERSONA.financas.color).toMatch(/^#/)
    expect(MODULE_PERSONA.financas.system.length).toBeGreaterThan(20)
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/lib/coach/context.test.ts` → FAIL.

- [ ] **Step 3: Implementar `context.ts`**

```ts
import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

/** Persona por módulo: system prompt + label + cor (deriva de MODULES). */
export interface Persona { label: string; color: string; system: string }

const BASE_RULES =
  'Você é o Coach de Vida do SyncLife. Fale em português do Brasil, em segunda pessoa (você). ' +
  'Seja direto e prático, sem jargão. Nunca invente números: use apenas o contexto fornecido. ' +
  'Não use travessão (—) nem emoji. Respostas curtas.'

export const MODULE_PERSONA: Record<ModuleId, Persona> = Object.fromEntries(
  (Object.keys(MODULES) as ModuleId[]).map((id) => [
    id,
    {
      label: MODULES[id].label,
      color: MODULES[id].color,
      system: `${BASE_RULES}\nFoco do módulo: ${MODULES[id].label}.`,
    },
  ]),
) as Record<ModuleId, Persona>

// ─── Finanças (piloto) ───────────────────────────────────────────────
export interface FinancasContext {
  income: number; expenses: number; balance: number; savingsRate: number
  topCategories: { name: string; total: number }[]
}
type TxRow = { amount: number; type: 'income' | 'expense' | 'transfer'; category: { name: string } | null }

/** Agregação pura (testável sem DB). */
export function summarizeFinancas(txs: TxRow[]): FinancasContext {
  let income = 0, expenses = 0
  const cat = new Map<string, number>()
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') {
      expenses += t.amount
      const name = t.category?.name ?? 'Outros'
      cat.set(name, (cat.get(name) ?? 0) + t.amount)
    }
  }
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
  const topCategories = [...cat.entries()].map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total).slice(0, 5)
  return { income, expenses, balance, savingsRate, topCategories }
}

/** Snapshot server-side por módulo. `supabase` = cliente server (await createClient()). */
export async function buildModuleContext(
  supabase: unknown, userId: string, moduleId: ModuleId,
): Promise<Record<string, unknown>> {
  const sb = supabase as { from: (t: string) => any }
  if (moduleId === 'financas' || moduleId === 'panorama') {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
    const end = new Date(y, m + 1, 0).toISOString().slice(0, 10)
    const { data } = await sb.from('transactions')
      .select('amount, type, category:categories(name)')
      .eq('user_id', userId).eq('is_future', false).gte('date', start).lte('date', end)
    return { financas: summarizeFinancas((data ?? []) as TxRow[]) }
  }
  return {} // demais módulos: preenchidos no Plano 3 (rollout)
}
```

- [ ] **Step 4: Rodar e confirmar sucesso** — `npx vitest run src/lib/coach/context.test.ts` → PASS.

- [ ] **Step 5: Verificar tipos** — `npx tsc --noEmit` → PASS. (Nota: `sb ... any` segue o padrão do `use-score-engine.ts`; manter o `eslint-disable` se necessário.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/coach/context.ts src/lib/coach/context.test.ts
git commit -m "feat(coach): lib/coach/context — buildModuleContext (server) + MODULE_PERSONA"
```

---

## Task 14: `POST /api/ai/coach-thread` (streamText/Groq contextual)

**Files:**
- Create: `web/src/app/api/ai/coach-thread/route.ts`

**Contexto:** cópia de `api/ai/coach/route.ts` (streamText → `toTextStreamResponse()`), mas o system prompt vem de `MODULE_PERSONA[moduleId]` e o contexto de `buildModuleContext` (server), não do client. Auth/env/ratelimit **fora** do try/catch.

- [ ] **Step 1: Implementar a rota**

```ts
import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
const model = groq('llama-3.3-70b-versatile')

const InputSchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) })).min(1).max(50),
  moduleId: z.string(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GROQ_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde um momento.' }), { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return new Response(JSON.stringify(parsed.error.flatten().fieldErrors), { status: 400 })
    const moduleId = (parsed.data.moduleId as ModuleId)
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const system = `${persona.system}\n\nContexto (dados reais do usuário):\n${JSON.stringify(context, null, 2)}`
    const result = streamText({ model, system, messages: parsed.data.messages })
    return result.toTextStreamResponse()
  } catch (error) {
    captureApiError('ai/coach-thread', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar** — `npx tsc --noEmit` → PASS; `npm run build` → rota `/api/ai/coach-thread` listada.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ai/coach-thread/route.ts
git commit -m "feat(coach): rota /api/ai/coach-thread — streamText contextual (server context)"
```

---

## Task 15: `POST /api/ai/coach-brief` (generateObject — hero)

**Files:**
- Create: `web/src/app/api/ai/coach-brief/route.ts`

**Contexto:** cópia de `api/ai/cardapio/route.ts` (generateObject/Gemini + Zod de saída). Alimenta `CoachHero`. Saída = `CoachBrief` (mesma shape do componente da Task 11).

- [ ] **Step 1: Implementar a rota**

```ts
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const model = google('gemini-2.5-flash')

const BriefSchema = z.object({
  eyebrow: z.string(),
  headline: z.object({ text: z.string(), emphasis: z.string().optional() }),
  stats: z.array(z.object({ label: z.string(), value: z.string(), big: z.boolean().optional() })).max(4),
  suggestions: z.array(z.object({ id: z.string(), label: z.string(), prompt: z.string(), primary: z.boolean().optional() })).max(3),
})
const InputSchema = z.object({ moduleId: z.string(), period: z.string() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const moduleId = parsed.data.moduleId as ModuleId
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const prompt = `${persona.system}\nMódulo: ${persona.label}. Período: ${parsed.data.period}.\n` +
      `Gere um brief para o hero deste módulo com base SOMENTE nestes dados reais:\n${JSON.stringify(context, null, 2)}\n` +
      `eyebrow = "Coach · ${persona.label} · ${parsed.data.period}". headline com um fato e o trecho numérico em "emphasis". ` +
      `stats: até 4 KPIs (o principal com big:true). suggestions: até 3 perguntas úteis.`
    const { object } = await generateObject({ model, schema: BriefSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-brief', error)
    return NextResponse.json({ error: 'Erro ao gerar o brief.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar + Commit** — `npx tsc --noEmit` → PASS.

```bash
git add src/app/api/ai/coach-brief/route.ts
git commit -m "feat(coach): rota /api/ai/coach-brief — generateObject (hero)"
```

---

## Task 16: `POST /api/ai/coach-whisper` (generateObject — aposenta o regex)

**Files:**
- Create: `web/src/app/api/ai/coach-whisper/route.ts`

**Contexto:** substitui o parsing frágil de `use-financial-insights.ts`. Saída estruturada. `tone: 'suggestion'` quando o dado é insuficiente (spec §8.1 — nunca afirmar sobre mock).

- [ ] **Step 1: Implementar a rota**

```ts
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const model = google('gemini-2.5-flash')

const WhisperSchema = z.object({
  lead: z.string(),
  recommendation: z.string(),
  action: z.object({ label: z.string(), href: z.string() }).optional(),
  variant: z.enum(['soft', 'solid']),
  tone: z.enum(['fact', 'suggestion']),
})
const InputSchema = z.object({ moduleId: z.string() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const moduleId = parsed.data.moduleId as ModuleId
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const prompt = `${persona.system}\nGere UM nudge curto para ${persona.label} com base nestes dados reais:\n` +
      `${JSON.stringify(context, null, 2)}\nlead = fato principal (<= 18 palavras). recommendation = o que fazer. ` +
      `variant 'solid' se exigir atenção, senão 'soft'. tone 'fact' só se houver dado suficiente; senão 'suggestion'.`
    const { object } = await generateObject({ model, schema: WhisperSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-whisper', error)
    return NextResponse.json({ error: 'Erro ao gerar o insight.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar + Commit** — `npx tsc --noEmit` → PASS.

```bash
git add src/app/api/ai/coach-whisper/route.ts
git commit -m "feat(coach): rota /api/ai/coach-whisper — generateObject (substitui regex)"
```

---

## Task 17: `POST /api/ai/coach-cross` (generateObject — CrossBand)

**Files:**
- Create: `web/src/app/api/ai/coach-cross/route.ts`

- [ ] **Step 1: Implementar a rota**

```ts
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const model = google('gemini-2.5-flash')

const CrossSchema = z.object({
  segments: z.array(z.object({ moduleId: z.string(), text: z.string(), bold: z.boolean().optional() })).min(1).max(3),
  action: z.object({ label: z.string(), targetModule: z.string(), href: z.string() }),
})
const InputSchema = z.object({ moduleId: z.string() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const moduleId = parsed.data.moduleId as ModuleId
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const prompt = `${persona.system}\nConecte ${persona.label} a outro módulo com base nestes dados reais:\n` +
      `${JSON.stringify(context, null, 2)}\nsegments: 2 trechos (moduleId + text; o 2º com bold:true). ` +
      `action: label "Ver em <módulo>", targetModule e href do módulo alvo. Só use fatos do contexto.`
    const { object } = await generateObject({ model, schema: CrossSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-cross', error)
    return NextResponse.json({ error: 'Erro ao gerar o cross-insight.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verificar + Commit** — `npx tsc --noEmit` → PASS; `npm run build` → 4 rotas `/api/ai/coach-*` listadas.

```bash
git add src/app/api/ai/coach-cross/route.ts
git commit -m "feat(coach): rota /api/ai/coach-cross — generateObject (CrossBand)"
```

---

## Task 18: `use-coach.ts` — hooks brief/whisper/cross + ligar o thread real

**Files:**
- Create: `web/src/hooks/use-coach.ts`
- Modify: `web/src/components/coach/CoachDrawer.tsx` (trocar endpoint por `/api/ai/coach-thread` + `moduleId` no body)
- Test: `web/src/hooks/use-coach.test.ts` (parsing/cache-key puros)

**Contexto:** cache por módulo+período (TTL mês) como em `use-financial-insights.ts` (localStorage). `regenerate()` força refetch. O drawer passa a mandar `moduleId` para a rota contextual.

- [ ] **Step 1: Escrever o teste (funções puras) — falha primeiro**

```ts
import { describe, it, expect } from 'vitest'
import { coachCacheKey } from './use-coach'

describe('use-coach', () => {
  it('cacheKey inclui recurso, módulo e período', () => {
    expect(coachCacheKey('brief', 'financas', '2026-05')).toBe('sl_coach_brief_financas_2026-05')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/hooks/use-coach.test.ts` → FAIL.

- [ ] **Step 3: Implementar `use-coach.ts`**

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'

export function coachCacheKey(resource: string, moduleId: string, period: string) {
  return `sl_coach_${resource}_${moduleId}_${period}`
}

function readCache<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null } catch { return null }
}
function writeCache<T>(key: string, val: T) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

interface CoachResource<T> { data: T | null; loading: boolean; error: string | null; regenerate: () => void }

/** POST genérico com cache localStorage por módulo+período. */
function useCoachResource<T>(resource: string, endpoint: string, moduleId: string, period: string, body: Record<string, unknown>): CoachResource<T> {
  const key = coachCacheKey(resource, moduleId, period)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIt = useCallback(async (force: boolean) => {
    if (!force) { const cached = readCache<T>(key); if (cached) { setData(cached); return } }
    setLoading(true); setError(null)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as T
      setData(json); writeCache(key, json)
    } catch { setError('Não consegui gerar agora.') } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, endpoint])

  useEffect(() => { void fetchIt(false) }, [fetchIt])
  return { data, loading, error, regenerate: () => void fetchIt(true) }
}

export function useCoachBrief(moduleId: string, period: string) {
  return useCoachResource('brief', '/api/ai/coach-brief', moduleId, period, { moduleId, period })
}
export function useCoachWhisper(moduleId: string, period: string) {
  return useCoachResource('whisper', '/api/ai/coach-whisper', moduleId, period, { moduleId })
}
export function useCoachCross(moduleId: string, period: string) {
  return useCoachResource('cross', '/api/ai/coach-cross', moduleId, period, { moduleId })
}
```

- [ ] **Step 4: Ligar o thread real no `CoachDrawer.tsx`** — trocar as props do `<CoachChat>`:

```tsx
<CoachChat
  endpoint="/api/ai/coach-thread"
  buildBody={(messages) => ({ messages, moduleId: activeModule })}
  initialPrompt={pendingPrompt}
  suggestedPrompts={[`Como está meu módulo ${mod.label}?`, 'O que devo priorizar esta semana?']}
  placeholder={`Pergunte sobre ${mod.label}`}
  disclaimer="O Coach pode errar. Confira dados importantes."
/>
```

- [ ] **Step 5: Rodar e confirmar sucesso** — `npx vitest run src/hooks/use-coach.test.ts` → PASS; `npx tsc --noEmit` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/use-coach.ts src/hooks/use-coach.test.ts src/components/coach/CoachDrawer.tsx
git commit -m "feat(coach): use-coach hooks (brief/whisper/cross) + drawer usa /api/ai/coach-thread"
```

---

## Task 19: Piloto Finanças — hero + cross reais + trocar o regex

**Files:**
- Modify: `web/src/app/(app)/financas/page.tsx` (montar `CoachHero` + `CrossBand` reais, atrás da flag, com estados)
- Modify: `web/src/components/financas/FinancialInsightCard.tsx` (trocar `useFinancialInsights` por `useCoachWhisper`)

**Contexto:** o hero/cross renderizam **skeleton** durante o fetch, **empty** se o contexto não tiver dado, **erro** discreto + `regenerate()` (spec §5.3). Nunca mostrar hero/whisper vazio ou meio-carregado. `FinancialInsightCard` (único consumidor de `useFinancialInsights`) passa a exibir um `<CoachWhisper>` real.

- [ ] **Step 1: Wrapper client `FinancasCoachSection`** — criar `web/src/components/financas/FinancasCoachSection.tsx`:

```tsx
'use client'

import { COACH_OS_ENABLED } from '@/lib/flags'
import { CoachHero, type CoachBrief } from '@/components/coach/CoachHero'
import { CrossBand, type CrossSegment } from '@/components/coach/CrossBand'
import { useCoachBrief, useCoachCross } from '@/hooks/use-coach'
import type { ModuleId } from '@/types/shell'

export function FinancasCoachSection({ period }: { period: string }) {
  const brief = useCoachBrief('financas', period)
  const cross = useCoachCross('financas', period)
  if (!COACH_OS_ENABLED) return null
  return (
    <div className="mb-5 flex flex-col gap-4">
      {brief.loading && <div className="h-40 animate-pulse rounded-2xl bg-[var(--sl-s2)]" />}
      {brief.error && <button onClick={brief.regenerate} className="rounded-2xl border border-[var(--sl-border)] p-4 text-left text-[13px] text-[var(--sl-t3)]">{brief.error} Tentar de novo.</button>}
      {brief.data && <CoachHero moduleId="financas" period={period} brief={brief.data as CoachBrief} />}
      {cross.data && (
        <CrossBand
          segments={(cross.data as { segments: CrossSegment[] }).segments}
          action={(cross.data as { action: { label: string; targetModule: ModuleId; href: string } }).action}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Montar no topo do conteúdo de `financas/page.tsx`** — importar e renderizar `<FinancasCoachSection period={<período atual, ex "maio 2026">} />` logo após o header da página (antes do `KpiStrip`/conteúdo v3 existente). Como `financas/page.tsx` pode ser Server Component, o wrapper é client e recebe só a string `period`.

- [ ] **Step 3: Trocar o regex em `FinancialInsightCard.tsx`** — substituir `useFinancialInsights({month, year})` por `useCoachWhisper('financas', \`${year}-${MM}\`)` e renderizar um `<CoachWhisper>`:

```tsx
'use client'
import { CoachWhisper } from '@/components/coach'
import { useCoachWhisper } from '@/hooks/use-coach'

export function FinancialInsightCard({ month, year }: { month: number; year: number }) {
  const period = `${year}-${String(month).padStart(2, '0')}`
  const { data, loading, error, regenerate } = useCoachWhisper('financas', period)
  if (loading) return <div className="h-16 animate-pulse rounded-xl bg-[var(--sl-s2)]" />
  if (error) return <button onClick={regenerate} className="text-[13px] text-[var(--sl-t3)]">{error} Tentar de novo.</button>
  if (!data) return null
  const w = data as { lead: string; recommendation: string; action?: { label: string; href: string }; variant: 'soft' | 'solid' }
  return <CoachWhisper bold={w.lead} text={w.recommendation} action={w.action?.label} variant={w.variant} />
}
```

> Nota: preservar a assinatura `{month, year}` que o chamador já usa. O import antigo `useFinancialInsights` sai; `use-financial-insights.ts` pode ser deletado se não houver outro consumidor (grep confirmou consumidor único).

- [ ] **Step 4: Verificar** — `npx tsc --noEmit` → PASS; `npx vitest run` → suíte verde; `npm run build` → PASS.

- [ ] **Step 5: Validação visual (dev, Finanças)** — subir dev, abrir `/financas`: hero real com brief, CrossBand, e o card de insight como `CoachWhisper`. Testar skeleton→conteúdo, erro→regenerate. Confirmar que o Coach não afirma sobre mock (`tone`). Dark + Cream. 0 erros de console.

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/financas/page.tsx src/components/financas/FinancialInsightCard.tsx src/components/financas/FinancasCoachSection.tsx
git commit -m "feat(coach): piloto Financas — CoachHero+CrossBand reais + FinancialInsightCard via coach-whisper"
```

---

## Self-Review (feito na autoria — checklist da spec)

**Cobertura da spec (Fases 2-3):**
- §2.2 tokens → já na Fase 0 (Plano 1). §3 componentes: CoachChat (T3), CommandPalette (T4), CoachDrawer (T5), CheatSheet (T6), CoachHero (T11), CrossBand (T12). ✅
- §4 shell: mount em AppShell (T10), CoachPill/TopHeader (T8), trigger mobile/CoachFab (T9), coach-store (T1), rota `/coach` compartilha `CoachChat` (T3). ✅
- §4.1 a11y: Radix (foco preso/retorno/scroll-lock/esc) + um-overlay-por-vez no store (T1) + `data-sl-overlay` (T4-6,10). Nav por teclado da palette com `role=option`/`aria-activedescendant` (T4). ✅
- §5 IA: `lib/coach/context.ts` server + MODULE_PERSONA (T13); 4 rotas (T14-17); hooks brief/whisper/cross + estados (T18-19); troca do regex (T19). ✅
- §8.7 feature flag `coachOsEnabled` (T2, gate em T10 e T19). ✅
- **Fora de escopo deste plano (vai pro Plano 3):** rollout dos 68 telas (só Finanças é piloto aqui), mobile completo, `buildModuleContext` dos outros 10 módulos.

**Consistência de tipos:** `CoachBrief` (T11) = saída de `/api/ai/coach-brief` (T15). `CrossSegment`/`action` (T12) = saída de `/api/ai/coach-cross` (T17). `WhisperSchema` (T16) → props de `CoachWhisper` (Fase 1) em T19. `OverlayName` (T1) usado em T7/T10. `MODULE_PERSONA`/`buildModuleContext` (T13) importados em T14-17.

**Riscos conhecidos para o executor:**
- `MODULE_ACTIONS` precisa estar `export` em `QuickActionSheet.tsx` (T4 step 5).
- Radix `dialog`/`sheet` são `z-50`/`bg-background`: os overrides de `className`/`style` (z-scale + `--sl-*`) são obrigatórios (T4-6).
- `QuickActionSheet` usa `z-[100]` (colide com `--sl-z-backdrop`): no mobile, garantir que abrir um overlay Coach feche o QuickActionSheet (ou vice-versa) — o `closeAll`/`toggleOverlay` do store cobre os overlays Coach; o QuickActionSheet é estado separado (`MobileBottomBar`), então validar que os dois não empilham.
- Rate-limit é compartilhado (10/60s por usuário entre TODAS as rotas AI). Brief/whisper/cross são cacheados (T18) para não estourar.

---

## Execução

**REQUIRED SUB-SKILL:** superpowers:subagent-driven-development (fresh subagent por task + revisão spec → revisão qualidade). Fase 2 (T1-T12) entrega os overlays sobre a IA existente; Fase 3 (T13-T19) troca por IA real no piloto Finanças. Commit por task; validação visual (dev, Navy Deep + Cream) nos checkpoints T10 e T19.

