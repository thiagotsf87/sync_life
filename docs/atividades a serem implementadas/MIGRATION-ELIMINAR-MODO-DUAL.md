# MIGRAÇÃO: Eliminar Sistema Dual Foco/Jornada — Experiência Única para MVP

**Data:** 08/03/2026 · **Versão:** 4.0 — MIGRAÇÃO 100% CONCLUÍDA
**Tipo:** Migration Guide + Prompt de Execução para Claude Code
**Impacto:** Muito Alto — afetou **~130 arquivos** com **~1.200 ocorrências** de padrões de modo
**Contexto:** Decisão de produto de eliminar o sistema dual de modos (Foco/Jornada) e adotar uma experiência única onde tudo que era "Jornada" vira comportamento padrão para todos os usuários. Todos os 12 temas e todas as features ficam desbloqueados no MVP — sem gate PRO em nenhum lugar.

### STATUS FINAL — Todos os Blocos Completos

| Bloco | Fase | Descrição | Status |
|-------|------|-----------|--------|
| A | 1-3 | Fundação (types, store, CSS, shell, onboarding, configurações) | ✅ |
| B | 4-5 | PRO gates removidos (themes, UpgradeModal, ProGate, plan-limits) | ✅ |
| C | 6 | Dead code cleanup (~130 arquivos, isJornada, color aliases, labels) | ✅ |
| D | 7-8 | Supabase migration + validação final + e2e tests | ✅ |

**Validação final (08/03/2026):**
- `npx tsc --noEmit` → 0 erros
- `npm run build` → sucesso
- 19 grep-zero checks → todos passaram (isJornada, data-mode, AppMode, etc.)
- E2e tests atualizados: 6 arquivos (design-system, design-compliance, configuracoes, financas, shell-navigation, futuro, experiencias)
- Migration SQL: `018_remove_mode_system.sql` criada (rodar manualmente no Supabase)

---

## 1. CONTEXTO E DECISÃO

### O que estava em vigor

O SyncLife tinha dois "modos de uso":

- **Modo Foco** — interface limpa, sem gamificação, sem insights IA, sem Life Sync Score, sem animações. Era o padrão (FREE).
- **Modo Jornada** — interface motivacional com gamificação, streaks, badges, insights IA, celebrações, animações. Era PRO-only.

Isso era implementado via:
- Atributo `data-mode="foco|jornada"` no `<html>`
- Classes CSS `.jornada-only` e `.foco-only` para visibilidade condicional
- `AppMode` type no TypeScript (`'foco' | 'jornada'`)
- Campo `mode` na tabela `profiles` do Supabase
- Componente `ModePill` no header para toggle
- Step 3 do onboarding para escolha de modo
- Seção "Modo de Uso" nas Configurações com cards comparativos
- Store Zustand com `mode` state e `setMode` action
- Hook `useMode()` retornando `{ mode, isJornada, isFoco }`
- Componente `<ModeVisible>` para renderização condicional

Adicionalmente, os 12 temas tinham gate PRO (3 FREE, 9 PRO) com `PRO_THEMES` array e `UpgradeModal`.

### O que foi decidido

1. **Eliminar completamente o sistema dual de modos.** Não existe mais Foco nem Jornada como conceitos separados.
2. **Tudo que era "Jornada" vira comportamento base.** Saudação personalizada, Life Sync Score, streaks, insights IA, animações, celebrações — tudo visível para todos, sempre.
3. **Todos os 12 temas ficam desbloqueados.** Sem gate PRO. Sem `UpgradeModal` para temas.
4. **Sem nenhum gate PRO no MVP.** Todas as features ficam liberadas. A definição de planos e monetização acontecerá após validação do MVP com dados reais de uso.
5. **O sistema de 12 temas continua intacto** (Navy Dark, Clean Light, Mint Garden, Obsidian, Rosewood, Arctic, Graphite, Twilight, Sahara, Carbon, Blossom, Serenity + System). Apenas o gate PRO é removido.

---

## 1.1 ESCOPO REAL — AUDITORIA DO CODEBASE (Adição V2)

Auditoria executada em 08/03/2026 via grep no codebase. O escopo REAL desta migração é significativamente maior do que os ~15 arquivos de fundação. Números concretos:

| Padrão | Arquivos afetados | Ocorrências |
|--------|-------------------|-------------|
| `isJornada` (em componentes e pages) | **127 arquivos** | **1.055** |
| `mode.*jornada` / `[.jornada_&]` (CSS/Tailwind) | **84 arquivos** | — |
| `jornada-only` / `foco-only` (CSS classes) | **15 arquivos** | — |
| `futuroColor(isJornada)` e similares (cores por modo) | **49 arquivos** | **125** |
| `jornadaLabel()` / `JORNADA_LABELS` (labels por modo) | **9 arquivos** | — |
| `isPro` / `isFree` / `ProGate` / `usePlanLimits` (gates PRO) | **35 arquivos** | **130** |
| `UpgradeModal` (modal de upgrade PRO) | **9 arquivos** | — |

**Conclusão:** A fundação (shell, store, types, CSS) é ~20% do trabalho. Os outros 80% são o cleanup de `isJornada` nos módulos e componentes mobile. Este documento agora cobre ambos.

---

## 2. INVENTÁRIO COMPLETO DE MUDANÇAS

### 2.1 Arquivos que precisam ser MODIFICADOS

```
web/src/types/shell.ts                          ← Remover AppMode, PRO_THEMES, FREE_THEMES
web/src/stores/shell-store.ts                    ← Remover mode do state e setMode action
web/src/styles/themes.css                        ← Remover seção de modo CSS (.jornada-only, .foco-only, data-mode)
web/src/components/shell/AppShell.tsx             ← Remover initialMode, setMode, applyMode
web/src/components/shell/TopHeader.tsx            ← Remover ModePill import, remover breadcrumb foco-only, saudação sempre visível
web/src/app/(app)/layout.tsx                     ← Remover mapMode, remover initialMode prop
web/src/app/onboarding/page.tsx                  ← Remover Step 3 (escolha de modo), renumerar steps de 5 para 4
web/src/app/(app)/layout.tsx                     ← Remover referências a mode no anti-FOUC script
web/src/hooks/use-theme.ts                       ← Manter (sem mudanças — temas continuam)
```

### 2.2 Arquivos que precisam ser DELETADOS

```
web/src/components/shell/ModePill.tsx             ← Componente inteiro (toggle Foco/Jornada no header desktop)
web/src/components/shell/ModeTogglePill.tsx        ← Componente inteiro (toggle Foco/Jornada mobile — EXISTE)
web/src/components/ui/mode-visible.tsx            ← Componente inteiro (renderização condicional por modo — EXISTE)
web/src/components/ui/foco-jornada-switch.tsx      ← Componente inteiro (renderiza conteúdo diferente por modo — EXISTE)
web/src/hooks/use-mode.ts                         ← Hook inteiro (EXISTE — retorna {mode, isJornada, isFoco})
web/src/app/(app)/configuracoes/modo/page.tsx      ← Página inteira de configuração de modo (EXISTE)
```

### 2.3 Arquivos que precisam ser SIMPLIFICADOS (não deletados)

```
web/src/components/ui/jornada-insight.tsx          ← EXISTE — remover classe condicional, tornar sempre visível
web/src/components/shell/SidebarScore.tsx           ← EXISTE — remover check de modo, Score sempre visível
web/src/lib/jornada-labels.ts                      ← EXISTE — simplificar (ver seção 3.17)
web/src/lib/futuro-colors.ts                       ← EXISTE — remover variantes FOCO/JORNADA, manter cor padrão do módulo
web/src/lib/exp-colors.ts                          ← EXISTE — remover variantes FOCO/JORNADA, manter cor padrão do módulo
web/src/lib/carreira-colors.ts                     ← EXISTE — remover variantes FOCO/JORNADA, manter cor padrão do módulo
web/src/lib/plan-limits.ts                         ← EXISTE — simplificar, remover checks de plano
web/src/hooks/use-plan-limits.ts                   ← EXISTE — retornar sempre sem limites
web/src/hooks/use-user-plan.ts                     ← EXISTE — retornar sempre isPro: true
web/src/components/ui/pro-gate.tsx                 ← EXISTE — tornar transparente (sempre renderiza children)
web/src/components/onboarding/OnboardingMobile.tsx ← EXISTE — remover step de modo (mesmo tratamento que onboarding desktop)
```

### 2.4 Arquivos que NÃO devem ser chamados (manter dormindo no codebase)

```
web/src/components/modals/UpgradeModal.tsx         ← EXISTE — manter mas remover TODAS as chamadas (9 arquivos chamam)
web/src/components/experiencias/mobile/ExpUpgradeModal.tsx ← EXISTE — manter mas remover chamadas
```

### 2.5 Módulos — Cleanup massivo de `isJornada` (~127 arquivos)

Cada page e componente mobile que usa `isJornada` precisa ser editado para:
1. Remover `const mode = useShellStore((s) => s.mode)` e `const isJornada = mode === 'jornada'`
2. Remover blocos condicionais `if (isJornada)` — manter o conteúdo Jornada como padrão
3. Remover `isJornada` de props de componentes filhos
4. Substituir chamadas de cor `futuroColor(isJornada)` → `FUTURO_PRIMARY` (constante direta)
5. Substituir `jornadaLabel(...)` → label padrão (Jornada) direto

**Lista dos 127 arquivos está na seção 4.1 (busca global).**

### 2.4 Supabase Migration

```sql
-- Nova migration: eliminar campo mode da tabela profiles
-- O campo mode pode ser removido ou mantido com valor fixo — preferir manter e setar como 'jornada' para evitar breaking changes em queries existentes.
```

---

## 3. MUDANÇAS DETALHADAS POR ARQUIVO

### 3.1 `web/src/types/shell.ts`

**Estado atual:**
```typescript
export type AppMode = 'foco' | 'jornada'
export const PRO_THEMES: ResolvedThemeId[] = ['obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara', 'carbon', 'blossom', 'serenity']
export const FREE_THEMES: ResolvedThemeId[] = ['navy-dark', 'clean-light', 'mint-garden']
```

**Ações:**
1. Remover o type `AppMode` completamente
2. Remover a constante `PRO_THEMES`
3. Remover a constante `FREE_THEMES`
4. Remover `mode: AppMode` do interface `ShellState`
5. Remover `setMode: (mode: AppMode) => void` do interface `ShellState`
6. Manter `ThemeId`, `ResolvedThemeId`, `DARK_THEMES`, `LIGHT_THEMES`, `isDarkTheme`, `resolveSystemTheme` — todos continuam válidos
7. Remover o type deprecated `AppTheme` se ainda existir

**Resultado final do ShellState:**
```typescript
export interface ShellState {
  activeModule: ModuleId
  sidebarOpen: boolean
  theme: ThemeId
  resolvedTheme: ResolvedThemeId

  setActiveModule: (module: ModuleId) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: ThemeId) => void
}
```

---

### 3.2 `web/src/stores/shell-store.ts`

**Estado atual:**
```typescript
mode: 'foco' as AppMode,
// ...
setMode: (mode: AppMode) => {
  applyMode(mode)
  writeLocal('synclife-mode', mode)
  set({ mode })
},
```

**Ações:**
1. Remover import de `AppMode`
2. Remover a função `applyMode()` inteira
3. Remover `mode` do state inicial
4. Remover `setMode` do store
5. Manter todo o resto (theme, sidebar, module) intacto

---

### 3.3 `web/src/styles/themes.css`

**Estado atual — seção de modo (final do arquivo):**
```css
/* ══════════════════════════════════════════
   MODO: Visibilidade Foco / Jornada
   ══════════════════════════════════════════ */

[data-mode="foco"] .jornada-only,
:root:not([data-mode]) .jornada-only {
  display: none !important;
}

[data-mode="jornada"] .foco-only {
  display: none !important;
}

[data-mode="jornada"] .sl-fade-up { ... }
[data-mode="foco"] .sl-fade-up { ... }
[data-mode="jornada"] .animate-fadeup { ... }
[data-mode="foco"] .animate-fadeup { ... }
```

**Ações:**
1. Remover TODA a seção "MODO: Visibilidade Foco / Jornada"
2. Remover TODAS as regras CSS que referenciam `data-mode`, `.jornada-only`, `.foco-only`
3. As animações `fadeUp` e `sl-fade-up` devem ser MANTIDAS mas sem condicional de modo — ficam sempre ativas:

```css
/* ══════════════════════════════════════════
   ANIMAÇÕES GLOBAIS
   ══════════════════════════════════════════ */

.sl-fade-up {
  animation: sl-fade-up 0.4s ease-out both;
}

.animate-fadeup {
  animation: fadeUp 0.4s ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sl-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

4. **Os 12 temas CSS continuam exatamente como estão** — nenhuma alteração nos tokens de tema

---

### 3.4 `web/src/components/shell/TopHeader.tsx`

**Estado atual:**
```tsx
import { ModePill } from './ModePill'

// Foco: Breadcrumb
<div className="sl-breadcrumb foco-only flex items-center gap-1.5 text-sm">
  ...breadcrumb...
</div>

// Jornada: Greeting  
<div className="jornada-only flex items-center gap-2">
  <span className="text-lg">{greeting.emoji}</span>
  <h1 className="font-[Syne] font-bold text-base text-sl-grad">
    {greeting.text}
  </h1>
</div>

// Controls
<ModePill />
```

**Ações:**
1. Remover import do `ModePill`
2. Remover o bloco inteiro do breadcrumb `foco-only` (a saudação personalizada é agora o comportamento padrão e único)
3. Remover as classes `jornada-only` do bloco de greeting — ele fica sempre visível, sem classe condicional
4. Remover `<ModePill />` do JSX
5. Manter `<ThemePill />` e `<NotifButton />`

**Resultado do header:**
```tsx
{/* Saudação — sempre visível */}
<div className="flex items-center gap-2">
  <span className="text-lg">{greeting.emoji}</span>
  <h1 className="font-[Syne] font-bold text-base text-sl-grad">
    {greeting.text}
  </h1>
</div>

{/* Spacer */}
<div className="flex-1" />

{/* Right side controls */}
<div className="flex items-center gap-2">
  <ThemePill />
  <NotifButton />
</div>
```

---

### 3.5 `web/src/components/shell/ModePill.tsx`

**Ação:** DELETAR o arquivo inteiro. Este componente não tem mais razão de existir.

---

### 3.6 `web/src/components/shell/AppShell.tsx`

**Estado atual:**
```tsx
interface AppShellProps {
  initialMode?: AppMode
  // ...
}

// Hydrate
if (initialMode) setMode(initialMode)

// OS listener references data-mode
```

**Ações:**
1. Remover `AppMode` do import
2. Remover `initialMode` da interface `AppShellProps`
3. Remover `initialMode` do destructuring dos props
4. Remover `const mode = useShellStore((s) => s.mode)` 
5. Remover `const setMode = useShellStore((s) => s.setMode)`
6. Remover `if (initialMode) setMode(initialMode)` do useEffect de hydration
7. Manter toda a lógica de tema e sidebar intacta

---

### 3.7 `web/src/app/(app)/layout.tsx`

**Estado atual:**
```tsx
import type { AppMode, ThemeId } from '@/types/shell'

interface ProfileData {
  mode: 'focus' | 'journey' | 'foco' | 'jornada' | null
  // ...
}

const mapMode = (dbMode: string | null): AppMode | undefined => {
  if (dbMode === 'journey' || dbMode === 'jornada') return 'jornada'
  if (dbMode === 'focus' || dbMode === 'foco') return 'foco'
  return undefined
}

const initialMode = mapMode(profile?.mode ?? null)

<NewAppShell
  initialMode={initialMode}
  // ...
>
```

**Ações:**
1. Remover `AppMode` do import (manter `ThemeId`)
2. Remover `mode` do interface `ProfileData` (ou mantê-lo mas não usá-lo)
3. Remover a função `mapMode` inteira
4. Remover `const initialMode = ...`
5. Remover `initialMode` prop do `<NewAppShell>`
6. Manter toda a lógica de tema intacta

---

### 3.8 `web/src/app/onboarding/page.tsx`

**Estado atual:**
O onboarding tem 5 steps:
1. Nome
2. Momento (motivações)
3. **Modo Foco/Jornada** ← REMOVER
4. Áreas de interesse (módulos)
5. Resumo/Confirmação

**Ações:**
1. Remover Step 3 inteiro (escolha de modo)
2. Renumerar os steps: o antigo Step 4 vira Step 3, o antigo Step 5 vira Step 4
3. Atualizar o total de steps de 5 para 4 em todos os textos "Passo X de Y"
4. Atualizar o stepper/progress bar para 4 dots em vez de 5
5. Remover `state.modo` do state do onboarding
6. No momento de salvar o perfil ao finalizar onboarding: NÃO enviar campo `mode` (ou enviar fixo como `'jornada'`)
7. Remover referências a `isJornada` e `mode-jornada` no className
8. Atualizar o texto do botão final: manter "Começar minha jornada 🚀" — faz sentido como texto motivacional mesmo sem ser um "modo"

**Novo fluxo do onboarding (4 steps):**
1. **Nome** — "Olá! Qual é o seu nome?"
2. **Momento** — "O que te trouxe até aqui?" (até 3 motivações)
3. **Áreas** — "Quais áreas quer organizar?" (módulos de interesse)
4. **Resumo** — Resumo das escolhas + botão "Começar minha jornada 🚀"

---

### 3.9 Script anti-FOUC (`app/layout.tsx` — `<head>`)

**Estado atual do script inline:**
```javascript
var mode = localStorage.getItem('synclife-mode') || 'foco';
document.documentElement.setAttribute('data-mode', mode);
```

**Ações:**
1. Remover a linha que lê `synclife-mode` do localStorage
2. Remover a linha que aplica `data-mode` no documentElement
3. Manter toda a lógica de tema (`synclife-theme`, `data-theme`, `data-scheme`)

**Script anti-FOUC atualizado:**
```javascript
(function() {
  try {
    var theme = localStorage.getItem('synclife-theme') || 'system';
    
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'navy-dark' : 'clean-light';
    }
    
    var darkThemes = ['navy-dark','obsidian','rosewood','graphite','twilight','carbon'];
    var scheme = darkThemes.indexOf(theme) !== -1 ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-scheme', scheme);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'navy-dark');
    document.documentElement.setAttribute('data-scheme', 'dark');
  }
})();
```

---

### 3.10 `web/src/hooks/use-mode.ts` (se existir)

**Ação:** DELETAR o arquivo inteiro. Não há mais conceito de modo.

---

### 3.11 `web/src/components/ui/mode-visible.tsx` (se existir)

**Ação:** DELETAR o arquivo inteiro. Não há mais componentes condicionais por modo.

---

### 3.12 `web/src/hooks/use-user-plan.ts` (se existir)

**Estado atual:** Provavelmente retorna `{ isFree, isPro }` para gates de PRO.

**Ação para MVP:** Fazer o hook retornar sempre `{ isFree: false, isPro: true }` — ou seja, todo mundo é "PRO" no MVP. Isso é mais seguro do que deletar o hook, pois outros componentes podem depender dele. Alternativamente, se nenhum componente usa gate PRO de fato, pode ser simplificado.

**Buscar por todos os usos de `useUserPlan`, `isFree`, `isPro` no codebase e garantir que nenhum gate PRO está ativo.**

---

### 3.13 `web/src/components/modals/UpgradeModal.tsx` (se existir)

**Ação para MVP:** Não deletar o componente, mas garantir que ele NUNCA é chamado. Buscar por todas as instâncias de `<UpgradeModal` e `setShowUpgrade(true)` e remover as chamadas. O componente pode ficar dormindo no codebase para uso futuro pós-MVP.

---

### 3.15 Arquivos de Cores por Módulo (Adição V2)

**Contexto:** Três módulos definem cores diferentes para Foco e Jornada. A decisão é **manter a cor padrão do módulo** (a cor do design system) e eliminar a variante alternativa.

#### `web/src/lib/futuro-colors.ts`

**Estado atual:** O módulo Futuro já usa `#8b5cf6` (violeta) para ambos os modos. As funções `futuroColor(_isJornada)` já ignoram o parâmetro. Apenas `futuroGrad()` difere: Foco → purple→blue, Jornada → purple→pink.

**Ações:**
1. Remover TODAS as constantes `FUTURO_FOCO_*` e `FUTURO_JORNADA_*` (aliases redundantes)
2. Remover `FUTURO_GRAD_FOCO` e `FUTURO_SECONDARY_FOCO`
3. Manter uma única constante de gradiente: `FUTURO_GRAD = 'linear-gradient(135deg, #8b5cf6, #0055ff)'` — purple→blue diferencia do Experiências (pink) e usa a cor secundária da marca
4. Substituir as funções `futuroColor(isJornada)`, `futuroBg(isJornada)`, etc. por constantes diretas — sem parâmetro
5. **Alternativa pragmática:** manter as funções mas sem parâmetro (`futuroColor()` retorna sempre `FUTURO_PRIMARY`). Isso reduz o diff nos 11 arquivos que chamam.

**Resultado:**
```typescript
export const FUTURO_PRIMARY = '#8b5cf6'
export const FUTURO_PRIMARY_LIGHT = '#c4b5fd'
export const FUTURO_PRIMARY_BG = 'rgba(139,92,246,0.15)'
export const FUTURO_PRIMARY_BORDER = 'rgba(139,92,246,0.22)'
export const FUTURO_PRIMARY_GLOW = 'rgba(139,92,246,0.4)'
export const FUTURO_GRAD = 'linear-gradient(135deg, #8b5cf6, #0055ff)'

// Funções simplificadas (sem parâmetro) — retrocompatíveis, callers antigos compilam
export function futuroColor() { return FUTURO_PRIMARY }
export function futuroColorLight() { return FUTURO_PRIMARY_LIGHT }
export function futuroBg() { return FUTURO_PRIMARY_BG }
export function futuroBorder() { return FUTURO_PRIMARY_BORDER }
export function futuroGlow() { return FUTURO_PRIMARY_GLOW }
export function futuroGrad() { return FUTURO_GRAD }
```

#### `web/src/lib/exp-colors.ts`

**Estado atual:** Foco usa `#ec4899` (pink — cor do design system para Experiências), Jornada usa `#8b5cf6` (purple).

**Decisão:** Manter `#ec4899` (pink) como cor padrão do módulo Experiências — é a cor do design system.

**Ações:**
1. Remover TODAS as constantes `EXP_JORNADA_*`
2. Renomear `EXP_FOCO_*` → `EXP_*` (ex: `EXP_FOCO` → `EXP_PRIMARY`)
3. Simplificar funções: remover parâmetro `isJornada`, retornar sempre a cor pink
4. Manter 1 gradiente: `EXP_GRAD = 'linear-gradient(135deg, #ec4899, #f472b6)'`

**Resultado:**
```typescript
export const EXP_PRIMARY = '#ec4899'
export const EXP_PRIMARY_LIGHT = '#f472b6'
export const EXP_PRIMARY_BG = 'rgba(236,72,153,0.06)'
export const EXP_PRIMARY_DIM = 'rgba(236,72,153,0.08)'
export const EXP_PRIMARY_BORDER = 'rgba(236,72,153,0.15)'
export const EXP_PRIMARY_GLOW = 'rgba(236,72,153,0.4)'
export const EXP_PRIMARY_TAG = 'rgba(236,72,153,0.12)'
export const EXP_GRAD = 'linear-gradient(135deg, #ec4899, #f472b6)'

export function expColor() { return EXP_PRIMARY }
export function expColorLight() { return EXP_PRIMARY_LIGHT }
export function expBg() { return EXP_PRIMARY_BG }
export function expBorder() { return EXP_PRIMARY_BORDER }
export function expGlow() { return EXP_PRIMARY_GLOW }
export function expGrad() { return EXP_GRAD }
export function expTag() { return EXP_PRIMARY_TAG }
```

**Impacto:** 63 ocorrências em 29 arquivos. As funções continuam compilando (parâmetro `isJornada` era posicional e agora é ignorado — TypeScript aceita args extras se a função não os declara).

#### `web/src/lib/carreira-colors.ts`

**Estado atual:** Foco usa `#ec4899` (pink), Jornada usa `#8b5cf6` (purple).

**Decisão:** A cor oficial do módulo Carreira no design system é `#f43f5e` (Rose). O codebase usava `#ec4899` (pink) como variante Foco — corrigir para a cor oficial `#f43f5e`.

**Ações:**
1. Remover TODAS as constantes `CARREIRA_FOCO_*` e `CARREIRA_JORNADA_*`
2. Criar constantes com a cor oficial `#f43f5e` (Rose):
```typescript
export const CARREIRA_PRIMARY = '#f43f5e'
export const CARREIRA_PRIMARY_LIGHT = '#fb7185'
export const CARREIRA_PRIMARY_BG = 'rgba(244,63,94,0.12)'
export const CARREIRA_PRIMARY_BORDER = 'rgba(244,63,94,0.2)'
export const CARREIRA_PRIMARY_GLOW = 'rgba(244,63,94,0.35)'
export const CARREIRA_GRAD = 'linear-gradient(135deg, #f43f5e, #fb7185)'

export function carreiraColor() { return CARREIRA_PRIMARY }
export function carreiraColorLight() { return CARREIRA_PRIMARY_LIGHT }
export function carreiraBg() { return CARREIRA_PRIMARY_BG }
export function carreiraBorder() { return CARREIRA_PRIMARY_BORDER }
export function carreiraGlow() { return CARREIRA_PRIMARY_GLOW }
export function carreiraGrad() { return CARREIRA_GRAD }
```

**Impacto:** 31 ocorrências em 9 arquivos.

---

### 3.16 `web/src/components/ui/jornada-insight.tsx` (Adição V2)

**Estado atual:** Componente com classe `hidden [.jornada_&]:flex` — só aparece no modo Jornada.

**Ações:**
1. Remover as classes condicionais `hidden [.jornada_&]:flex`
2. Tornar sempre visível: `flex` diretamente
3. Renomear o componente para `AIInsight` (remover "Jornada" do nome) — opcional, pode ser feito depois

**Resultado:**
```tsx
export function JornadaInsight({ text }: { text: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3 p-4
                    bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/9
                    border border-[#10b981]/20 rounded-[18px] sl-fade-up">
      <span className="text-lg mt-0.5 shrink-0">💡</span>
      <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{text}</p>
    </div>
  )
}
```

---

### 3.17 `web/src/lib/jornada-labels.ts` — Decisão de Labels (Adição V2)

**Contexto:** Este arquivo define labels alternativos para o modo Jornada (ex: "Transações" → "Movimentos", "Viagens" → "Missões"). Com a eliminação do modo dual, **os labels Jornada viram os labels padrão** (pois a experiência Jornada é o comportamento único).

**Decisão:** Simplificar. Ao invés de manter o sistema dual de labels, incorporar os labels motivacionais diretamente onde são usados. O arquivo `jornada-labels.ts` pode ser mantido como dicionário de referência mas a função `jornadaLabel()` deve retornar sempre o label Jornada.

**Ações:**
1. Simplificar `jornadaLabel()` para sempre retornar o label motivacional:
```typescript
export function jornadaLabel(
  module: ModuleKey,
  key: string,
  _defaultLabel: string,
): string {
  const moduleLabels = JORNADA_LABELS[module] as Record<string, string> | undefined
  return moduleLabels?.[key] ?? _defaultLabel
}
```
2. Remover o parâmetro `isJornada` de `jornadaLabel()` e `getLabel()`
3. Nos 9 arquivos que chamam `jornadaLabel(...)`: remover o argumento `isJornada`
4. Renomear o arquivo para `labels.ts` — opcional, pode ser feito depois

**Arquivos que usam labels (9):**
- `components/experiencias/ExperienciasMobile.tsx`
- `components/futuro/FuturoMobile.tsx`
- `components/patrimonio/PatrimonioMobile.tsx`
- `components/carreira/CarreiraMobile.tsx`
- `components/mente/MenteMobile.tsx`
- `components/corpo/CorpoMobile.tsx`
- `components/financas/FinancasMobileShell.tsx`
- `components/tempo/TempoMobileShell.tsx`
- `lib/jornada-labels.ts` (o próprio)

---

### 3.18 `web/src/components/onboarding/OnboardingMobile.tsx` (Adição V2)

**Estado atual:** Componente mobile do onboarding — provavelmente tem o mesmo step de escolha de modo que `onboarding/page.tsx`.

**Ações:** Mesmo tratamento que `onboarding/page.tsx`:
1. Remover step de escolha de modo
2. Renumerar steps de 5 para 4
3. Remover `isJornada` / referências a modo do state e UI

---

### 3.19 Gates PRO — Inventário Completo (Adição V2)

**130 ocorrências de gates PRO em 35 arquivos.** Todos devem ser desativados para o MVP.

**Arquivos com gates PRO (agrupados por tipo):**

**Hooks e lib:**
```
web/src/hooks/use-user-plan.ts       ← Retornar sempre { isPro: true, isFree: false }
web/src/hooks/use-plan-limits.ts     ← Retornar sempre limites infinitos
web/src/lib/plan-limits.ts           ← Manter mas com valores sem limite
web/src/components/ui/pro-gate.tsx   ← Tornar transparente: sempre renderiza children sem bloqueio
```

**Pages com <ProGate> ou checks isPro (remover o gate, manter o conteúdo):**
```
web/src/app/(app)/futuro/page.tsx                    (7 ocorrências)
web/src/app/(app)/futuro/[id]/page.tsx               (6 ocorrências)
web/src/app/(app)/financas/relatorios/page.tsx       (8 ocorrências)
web/src/app/(app)/financas/recorrentes/page.tsx      (4 ocorrências)
web/src/app/(app)/financas/planejamento/page.tsx     (3 ocorrências)
web/src/app/(app)/mente/trilhas/page.tsx             (4 ocorrências)
web/src/app/(app)/mente/biblioteca/page.tsx          (4 ocorrências)
web/src/app/(app)/mente/timer/page.tsx               (3 ocorrências)
web/src/app/(app)/carreira/roadmap/page.tsx          (3 ocorrências)
web/src/app/(app)/corpo/saude/page.tsx               (3 ocorrências)
web/src/app/(app)/patrimonio/page.tsx                (3 ocorrências)
web/src/app/(app)/patrimonio/carteira/page.tsx       (4 ocorrências)
web/src/app/(app)/patrimonio/simulador/page.tsx      (3 ocorrências)
web/src/app/(app)/tempo/foco/page.tsx                (3 ocorrências)
web/src/app/(app)/tempo/review/page.tsx              (3 ocorrências)
web/src/app/(app)/futuro/checkin/page.tsx            (3 ocorrências)
web/src/app/(app)/experiencias/nova/page.tsx         (3 ocorrências)
web/src/app/(app)/experiencias/viagens/[id]/page.tsx (6 ocorrências)
web/src/app/(app)/configuracoes/aparencia/page.tsx   (4 ocorrências)
web/src/app/(app)/configuracoes/modo/page.tsx        (3 ocorrências — será deletada)
```

**UpgradeModal — 9 arquivos que chamam (remover chamadas, manter componente dormindo):**
```
web/src/components/experiencias/ExperienciasMobile.tsx
web/src/components/ui/pro-gate.tsx
web/src/components/experiencias/mobile/ExpTabViagens.tsx
web/src/components/experiencias/mobile/ExpTabBucketList.tsx
web/src/components/experiencias/mobile/ExpUpgradeModal.tsx
web/src/app/(app)/configuracoes/aparencia/page.tsx
web/src/app/(app)/configuracoes/modo/page.tsx
web/src/components/shell/ModePill.tsx
web/src/components/modals/UpgradeModal.tsx
```

---

### 3.20 Configurações — Navegação e Layout (Adição V2)

**Arquivos que referenciam rota `configuracoes/modo`:**
```
web/src/lib/modules.ts              ← Remover navItem "Modo" do array de navItems de configurações
web/src/app/(app)/configuracoes/layout.tsx  ← Remover link para /configuracoes/modo no menu lateral
```

---

### 3.14 Supabase Migration

**Criar nova migration:**
```sql
-- Migration: XXX_remove_mode_system
-- Remove o sistema dual de modos. Todos os usuários usam experiência unificada.
-- O campo mode é mantido por compatibilidade mas fixado em 'jornada'.

-- 1. Atualizar todos os profiles para mode = 'jornada'
UPDATE profiles SET mode = 'jornada' WHERE mode IS DISTINCT FROM 'jornada';

-- 2. Remover constraint antiga e adicionar nova que só aceita 'jornada'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_mode_check;
ALTER TABLE profiles 
  ALTER COLUMN mode SET DEFAULT 'jornada',
  ADD CONSTRAINT profiles_mode_check CHECK (mode = 'jornada');

-- 3. Remover gate PRO dos temas (constraint atualizada para aceitar todos os 12)
-- Nota: constraint de temas já aceita todos os 12 + system desde migration 012
-- Nenhuma alteração necessária em temas
```

---

## 4. BUSCA GLOBAL — PADRÕES A ELIMINAR

### 4.1 Buscas de Modo (executar ANTES e DEPOIS da migração)

```bash
# ── Padrões de modo (ZERO resultados esperados após migração) ──────────────────
grep -rn "data-mode" web/src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -rn "jornada-only" web/src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -rn "foco-only" web/src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -rn "AppMode" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "setMode" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "useMode" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "ModePill" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "ModeTogglePill" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "ModeVisible" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "FocoJornadaSwitch" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "mode.*foco" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "mode.*jornada" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "isJornada" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "isFoco" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "synclife-mode" web/src/ --include="*.tsx" --include="*.ts" --include="*.css"
grep -rn "\.jornada_&" web/src/ --include="*.tsx" --include="*.ts" --include="*.css"

# ── Cores duais por modo (ZERO resultados esperados) ───────────────────────────
grep -rn "FUTURO_FOCO\|FUTURO_JORNADA" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "EXP_FOCO\|EXP_JORNADA" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "CARREIRA_FOCO\|CARREIRA_JORNADA" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "futuroColor(isJornada)" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "expColor(isJornada)" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "carreiraColor(isJornada)" web/src/ --include="*.tsx" --include="*.ts"

# ── Gates PRO (ZERO resultados ativos esperados) ──────────────────────────────
grep -rn "PRO_THEMES" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "FREE_THEMES" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "isFree" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "UpgradeModal" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "openUpgradeModal" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "showUpgrade" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "<ProGate" web/src/ --include="*.tsx" --include="*.ts"

# ── Labels duais (ZERO resultados com isJornada esperados) ────────────────────
grep -rn "jornadaLabel.*isJornada" web/src/ --include="*.tsx" --include="*.ts"
grep -rn "getLabel.*isJornada" web/src/ --include="*.tsx" --include="*.ts"
```

**Cada resultado encontrado deve ser tratado:** removido ou atualizado conforme as regras desta migration.

### 4.2 Contagem Esperada ANTES vs DEPOIS

| Padrão | Antes | Depois |
|--------|-------|--------|
| `isJornada` | 1.055 | **0** |
| `[.jornada_&]` | ~200 | **0** |
| `jornada-only` / `foco-only` | ~30 | **0** |
| `AppMode` | ~10 | **0** |
| `PRO_THEMES` / `FREE_THEMES` | ~5 | **0** |
| `<ProGate` | ~30 | **0** |
| `isPro` / `isFree` (ativos) | ~130 | **0** (hooks retornam fixo) |

---

## 5. LIMPEZA DO localStorage

Após deploy, usuários existentes podem ter `synclife-mode` no localStorage. Isso não causa erro porque o código não lê mais esse valor. Mas para manter o storage limpo, adicionar uma limpeza one-time:

```typescript
// No AppShell.tsx ou similar, executar uma vez:
useEffect(() => {
  try {
    localStorage.removeItem('synclife-mode')
  } catch {
    // Ignore
  }
}, [])
```

---

## 6. O QUE NÃO MUDA

Lista explícita do que deve ser mantido intacto:

| Aspecto | Status |
|---------|--------|
| Sistema de 12 temas (tokens CSS) | ✅ Mantido intacto |
| `data-theme` no `<html>` | ✅ Mantido |
| `data-scheme` no `<html>` | ✅ Mantido |
| ThemePill no header | ✅ Mantido |
| ThemeId type com 12 temas + system | ✅ Mantido |
| Store Zustand para tema | ✅ Mantido |
| Hook useTheme() | ✅ Mantido |
| Script anti-FOUC para temas | ✅ Mantido (apenas sem mode) |
| Persistência de tema no localStorage e Supabase | ✅ Mantido |
| Listener de prefers-color-scheme para tema system | ✅ Mantido |
| DARK_THEMES e LIGHT_THEMES arrays | ✅ Mantido |
| isDarkTheme() e resolveSystemTheme() | ✅ Mantido |
| Animações fadeUp e sl-fade-up | ✅ Mantido (agora sempre ativas) |
| Layout do Shell (ModuleBar, Sidebar, Header, ContentArea) | ✅ Mantido |
| Tipografia (Syne, DM Sans, DM Mono) | ✅ Mantido |
| Cores funcionais (success, danger, warning, info) | ✅ Mantido |
| Supabase migration 012 (12 temas) | ✅ Mantido |
| **Cores padrão dos módulos** | ✅ **Mantido — cada módulo preserva sua cor do design system** |
| Futuro → `#8b5cf6` (Violeta) | ✅ Mantido como PRIMARY único |
| Experiências → `#ec4899` (Pink) | ✅ Mantido (era FOCO, agora é a cor padrão) |
| Carreira → `#f43f5e` (Rose) | ✅ Corrigido para cor oficial do design system |
| Finanças → `#10b981` (Esmeralda) | ✅ Mantido (sem variante dual) |
| Mente → `#eab308` (Yellow) | ✅ Mantido (sem variante dual) |
| Corpo → `#f97316` (Orange) | ✅ Mantido (sem variante dual) |
| Tempo → `#06b6d4` (Cyan) | ✅ Mantido (sem variante dual) |
| Patrimônio → `#3b82f6` (Blue) | ✅ Mantido (sem variante dual) |
| Panorama → `#6366f1` (Indigo) | ✅ Mantido (sem variante dual) |
| Labels motivacionais (ex: "Missões", "Cofre") | ✅ Mantido — viram labels padrão |
| Sistema de XP e badges | ✅ Mantido — sempre ativo |
| Life Sync Score | ✅ Mantido — sempre visível |
| Insights IA | ✅ Mantido — sempre visíveis |

---

## 7. TESTES — O QUE REMOVER E O QUE MANTER

### Testes a REMOVER (se existirem)

Todos os 14 testes de "Mode System":
- `deve aplicar data-mode="foco" por padrão` ← REMOVER
- `deve trocar modo ao chamar setMode()` ← REMOVER
- `deve persistir modo no localStorage` ← REMOVER
- `deve ocultar .jornada-only quando modo é foco` ← REMOVER
- `deve ocultar .foco-only quando modo é jornada` ← REMOVER
- ... (todos os 14)

Todos os 8 testes de "ModePill Component" ← REMOVER

Testes de persistência que referenciam modo:
- `deve sincronizar modo com Supabase ao alterar` ← REMOVER
- `deve migrar modo antigo ('focus'→'foco', 'journey'→'jornada')` ← REMOVER

Testes de gate PRO:
- `deve bloquear tema PRO para usuário FREE (abre modal)` ← REMOVER
- `deve reverter para "system" quando PRO faz downgrade usando tema PRO` ← REMOVER
- `deve bloquear Jornada para usuário FREE (abre modal)` ← REMOVER
- `deve permitir Jornada para usuário PRO` ← REMOVER
- `deve reverter para Foco quando PRO faz downgrade` ← REMOVER

### Testes a MANTER

Todos os testes de tema (ajustar para 12 temas, sem gate):
- `deve aplicar data-theme="navy-dark" por padrão quando system preference é dark` ← MANTER
- `deve trocar tema ao chamar setTheme()` ← MANTER
- `deve persistir tema no localStorage ao trocar` ← MANTER
- `deve reagir a mudança de prefers-color-scheme quando tema é "system"` ← MANTER
- Testes de tokens CSS para cada um dos 12 temas ← MANTER
- `deve manter cores funcionais (--green, --red) iguais em todos os 12 temas` ← MANTER (ajustar de 9 para 12)
- `deve manter cores de módulo iguais em todos os 12 temas` ← MANTER (ajustar de 9 para 12)
- `deve aplicar --accent diferente para cada tema` ← MANTER
- `deve manter --em fixo (#10b981) mesmo em todos os temas` ← MANTER

### Testes NOVOS a criar

```
describe('Experiência Unificada — Sem Modo')
  ✓ NÃO deve existir atributo data-mode no <html>
  ✓ NÃO deve existir classe .jornada-only em nenhum componente renderizado
  ✓ NÃO deve existir classe .foco-only em nenhum componente renderizado
  ✓ Saudação personalizada deve estar sempre visível no header
  ✓ Animações fadeUp devem estar sempre ativas
  ✓ NÃO deve existir ModePill no header
  ✓ Todos os 12 temas devem ser selecionáveis sem restrição
  ✓ NÃO deve existir UpgradeModal ao selecionar qualquer tema
```

---

## 8. IMPACTO EM DOCUMENTAÇÃO EXISTENTE

Os seguintes documentos precisarão de atualização para refletir a decisão. Não é necessário atualizar agora — é referência para quando forem consultados:

| Documento | O que muda |
|-----------|-----------|
| `21-TEMAS-E-MODOS-DEV-SPEC.md` | Remover seções 6-8 (modo) inteiras. Renomear para "21-SISTEMA-DE-TEMAS.md". Atualizar de 9 para 12 temas. Remover gates PRO. |
| `DESIGN-SYSTEM.md` | Remover seção "Modo Foco vs Modo Jornada". Remover regras de `.jornada-only` e `.foco-only`. |
| `configuracoes-dev-spec.md` | Remover seção 6 "Modo de Uso" inteira. Remover tabela comparativa. Atualizar seção de Aparência (todos os 12 temas sem lock PRO). |
| `15-AUTH-ONBOARDING-DEV-SPEC.md` | Remover step de escolha de modo. Ajustar de 5 para 4 steps. |
| `17-NAVEGACAO-SHELL-DEV-SPEC.md` | Remover toggle de modo do header. Remover seção "Toggle de Modo". Atualizar ShellState. |
| `QA-VALIDACAO-HOMOLOGACAO.md` | Remover items 0.4 (trocar modo), 0.11 (breadcrumb Foco), 2.5-2.7 (gates PRO). Atualizar de 9 para 12 temas. |
| `MVP-V3-ESPECIFICACAO-COMPLETA.md` | Remover seção 12 "Modo Jornada por Módulo" inteira. |
| Todos os `SPEC-*.md` de módulos | Remover seções "Foco vs Jornada". Todo componente vira base. |
| `proto-12-temas-synclife.html` | Remover toggle de modo Foco/Jornada. |

---

## 9. ORDEM DE EXECUÇÃO (Revisada V2 — com fase intermediária)

Executar as mudanças nesta sequência para evitar erros de compilação.
**Total estimado: 8 fases, ~130 arquivos editados.**

```
═══════════════════════════════════════════════════════════════════════════════
FASE 1 — Types, Store e Hooks de fundação ✅ IMPLEMENTADA (08/03/2026)
═══════════════════════════════════════════════════════════════════════════════

  ✅ 1.1  Editar web/src/types/shell.ts
       → Removido AppMode, PRO_THEMES, FREE_THEMES
       → Removido mode e setMode do ShellState interface

  ✅ 1.2  Editar web/src/stores/shell-store.ts
       → Removido import de AppMode
       → Removido applyMode()
       → mode mantido como shim readonly ('jornada') para compatibilidade
         temporária com ~70 arquivos que ainda leem s.mode (Bloco C)
       → setMode mantido como no-op temporário

  ✅ 1.3  Deletar web/src/hooks/use-mode.ts — DELETADO

  ✅ 1.4  Deletar web/src/components/ui/mode-visible.tsx — DELETADO

  ✅ 1.5  Deletar web/src/components/ui/foco-jornada-switch.tsx — DELETADO

  ✅ 1.6  Editar web/src/hooks/use-user-plan.ts
       → Retorna sempre { isPro: true, isFree: false, isLoading: false }

  ✅ 1.7  Editar web/src/hooks/use-plan-limits.ts
       → Retorna sempre limites infinitos, canUse() → true

  ✅ 1.8  Editar web/src/components/ui/pro-gate.tsx
       → ProGate e ProLimitGate sempre renderizam {children}


═══════════════════════════════════════════════════════════════════════════════
FASE 2 — CSS ✅ IMPLEMENTADA (08/03/2026)
═══════════════════════════════════════════════════════════════════════════════

  ✅ 2.1  Editar web/src/styles/themes.css
       → Removida seção "MODO: Visibilidade Foco / Jornada"
       → Substituída por seção "ANIMAÇÕES GLOBAIS" (sl-fade-up e fadeUp sempre ativos)
       → Atualizado comentário header (sem "Modo Foco/Jornada")

  ✅ 2.2  Editar web/src/app/globals.css
       → Removidas custom-variant jornada e foco


═══════════════════════════════════════════════════════════════════════════════
FASE 3 — Componentes do Shell ✅ IMPLEMENTADA (08/03/2026)
═══════════════════════════════════════════════════════════════════════════════

  ✅ 3.1  Deletar web/src/components/shell/ModePill.tsx — DELETADO
  ✅ 3.2  Deletar web/src/components/shell/ModeTogglePill.tsx — DELETADO

  ✅ 3.3  Editar web/src/components/shell/TopHeader.tsx
       → Removido import ModePill e usePathname/MODULES/getActiveNavItem
       → Removido breadcrumb foco-only inteiro
       → Saudação sempre visível (sem classe jornada-only)
       → Removido <ModePill /> do JSX

  ✅ 3.4  Editar web/src/components/shell/AppShell.tsx
       → Removido AppMode import, initialMode prop, setMode usage
       → Supabase sync não salva mais mode
       → Rollback não restaura mais mode

  ✅ 3.5  Editar web/src/components/shell/SidebarScore.tsx
       → Removida classe jornada-only — Score sempre visível

  ✅ 3.6  Editar web/src/components/ui/jornada-insight.tsx
       → Removida classe jornada-only — insight sempre visível (flex)

  ── Extras implementados no Bloco A ──

  ✅ 3.7  Deletar web/src/app/(app)/configuracoes/modo/page.tsx — DELETADO
  ✅ 3.8  Editar web/src/app/(app)/configuracoes/layout.tsx
       → Removido item "Modo de Uso" da navegação lateral
       → Removido import Sparkles
  ✅ 3.9  Editar web/src/lib/modules.ts
       → Removido navItem cfg-modo do array de configurações
  ✅ 3.10 Editar web/src/app/(app)/layout.tsx
       → Removido AppMode import, mapMode(), initialMode prop
       → select agora pega só full_name, theme, sidebar_state
  ✅ 3.11 Editar web/src/app/(app)/configuracoes/aparencia/page.tsx
       → Removido import PRO_THEMES
       → handleThemeSelect: removido gate PRO (todos temas liberados)
  ✅ 3.12 Editar web/src/components/carreira/CarreiraMobile.tsx
       → Removido import ModeTogglePill (arquivo deletado)

  ✅ Verificação: `npx tsc --noEmit` — ZERO erros


═══════════════════════════════════════════════════════════════════════════════
FASE 4 — Pages e Layout (parcialmente feita no Bloco A)
═══════════════════════════════════════════════════════════════════════════════

  ✅ 4.1  (Feito no Bloco A — 3.10) Editar web/src/app/(app)/layout.tsx

  ✅ 4.2  Editar web/src/app/layout.tsx (script anti-FOUC)
       → Removidas linhas que liam synclife-mode e aplicavam data-mode
       → Adicionados 3 temas faltantes ao valid list (carbon, blossom, serenity)
       → Adicionado localStorage.removeItem('synclife-mode') cleanup

  ✅ 4.3  Editar web/src/app/onboarding/page.tsx
       → Removido step 3 (escolha de modo), renumerado de 5 para 4 steps
       → Removido state 'modo', isJornada, PRO_MODULES/hasPro check
       → Sempre salva mode='jornada' no Supabase

  ✅ 4.4  Editar web/src/components/onboarding/OnboardingMobile.tsx
       → Removido step 2 (modo), renumerado de 3 para 2 steps
       → ProgressDots agora mostra 2 dots
       → Sempre salva mode='jornada' no Supabase

  ✅ 4.5  (Feito no Bloco A — 3.7) Deletar configuracoes/modo/page.tsx
  ✅ 4.6  (Feito no Bloco A — 3.9) Editar modules.ts
  ✅ 4.7  (Feito no Bloco A — 3.8) Editar configuracoes/layout.tsx

  ✅ Verificação: `npx tsc --noEmit` — ZERO erros


═══════════════════════════════════════════════════════════════════════════════
FASE 5 — Cores e Labels (simplificação) ✅ IMPLEMENTADA (08/03/2026)
═══════════════════════════════════════════════════════════════════════════════

  ✅ 5.1  Reescrever web/src/lib/futuro-colors.ts
       → Cor única #8b5cf6 (Violet), gradient purple→blue
       → Funções com _isJornada? opcional (compat shim), sempre retornam PRIMARY
       → Aliases per-mode adicionados (FUTURO_FOCO, FUTURO_JORNADA, etc.) para
         compatibilidade com mobile components — serão removidos no Bloco C

  ✅ 5.2  Reescrever web/src/lib/exp-colors.ts
       → Cor única #ec4899 (Pink), gradient pink→light pink
       → Funções com _isJornada? opcional, sempre retornam PRIMARY
       → 12 aliases per-mode adicionados (EXP_FOCO, EXP_JORNADA_LIGHT, etc.)

  ✅ 5.3  Reescrever web/src/lib/carreira-colors.ts
       → Cor única #f43f5e (Rose), gradient rose→light rose
       → Funções com _isJornada? opcional, sempre retornam PRIMARY
       → Alias CARREIRA_GRAD_JORNADA adicionado

  ✅ 5.4  Simplificar web/src/lib/jornada-labels.ts
       → Renomeado para LABELS (com alias JORNADA_LABELS para compat)
       → jornadaLabel() e getLabel() sempre retornam label motivacional
       → _isJornada param mantido como opcional (ignorado)
       → Removido "modo" key de configuracoes labels

  ✅ Verificação: `npx tsc --noEmit` — ZERO erros


═══════════════════════════════════════════════════════════════════════════════
FASE 6 — CLEANUP MASSIVO DE MÓDULOS ⚠️ PARCIALMENTE IMPLEMENTADA (08/03/2026)
         ~127 arquivos com ~1.055 ocorrências de isJornada
         Estado: 42 arquivos limpos, 83 restantes (código morto funcional)
═══════════════════════════════════════════════════════════════════════════════

  Estratégia: processar por módulo, rodar tsc após cada módulo.

  ESTADO ATUAL (08/03/2026):
  - tsc = 0 erros ✅
  - [.jornada_&] CSS = 0 ocorrências ✅ (todos corrigidos)
  - foco-only = 5 (ocultos via CSS rule em themes.css) ✅
  - jornada-only = 16 (classe inerte, elementos visíveis = correto) ✅
  - isJornada = 825 em 83 arquivos — CÓDIGO MORTO funcional
    (store shim retorna mode='jornada', então isJornada=true sempre)
  - Agentes limparam 42 arquivos + corrigiram 156 erros tsc
  - Pendente: limpeza mecânica dos 83 arquivos restantes (dead code removal)

  6.1  Módulo Finanças (14 arquivos)
       → Pages: financas/page, transacoes, orcamentos, recorrentes,
         planejamento, calendario, relatorios
       → Componentes: FinancasMobile, FinancasMobileShell, PlanejamentoMobile,
         QuickEntryFAB, TransacaoModal, RecorrenteModal, TimelineScroll
       → Para cada arquivo:
          a) Remover `const mode = useShellStore((s) => s.mode)`
          b) Remover `const isJornada = mode === 'jornada'`
          c) Em ternários `isJornada ? X : Y` → manter X (o valor Jornada)
          d) Remover `[.jornada_&]:` classes Tailwind — usar o valor Jornada direto
          e) Remover props `isJornada` passadas a componentes filhos
          f) Remover import de useShellStore se não tiver outro uso
          g) Remover chamadas a UpgradeModal e <ProGate>

  6.2  Módulo Futuro (16 arquivos)
       → Pages: futuro/page, futuro/[id], futuro/checkin
       → Componentes mobile: FuturoMobile, FuturoDetailMobile, FuturoEditarMobile,
         FuturoWizardMobile, FuturoSimuladorMobile, FuturoHistoricoMobile,
         FuturoArquivoMobile, FuturoArquivoTab, FuturoTimelineTab,
         FuturoGoalCard, FuturoScoreBand, FuturoMilestoneTimeline,
         FuturoCelebracaoMobile, ContribMonthBand, ScenarioCard
       → Substituir futuroColor(isJornada) → FUTURO_PRIMARY
       → Substituir futuroGrad(isJornada) → FUTURO_GRAD

  6.3  Módulo Experiências (31 arquivos)
       → Pages: experiencias/page, nova, viagens, viagens/[id],
         bucket-list, memorias, passaporte
       → Componentes mobile (24): ExperienciasMobile, ExpTabDashboard,
         ExpTabViagens, ExpTabOrcamento, ExpTabRoteiro, ExpTabChecklist,
         ExpTabHospedagem, ExpTabTransporte, ExpTabMemorias, ExpTabPassaporte,
         ExpTabBucketList, ExpTabOverview, ExpWizardMobile, ExpWizardStep1-5,
         ExpWizardStepper, ExpDetailMobile, ExpDetailTabs, ExpKpiGrid,
         ExpDayChip, ExpBudgetCategory, ExpTripCard, ExpTripStatusSheet,
         ExpHotelCard, ExpTransportCard, ExpWorldMap, ExpMemoryFormMobile,
         ExpMemoryDetailMobile, ExpBucketList, ExpBucketItemFormMobile,
         ExpCelebrationModal, ExpUpgradeModal
       → Substituir expColor(isJornada) → EXP_PRIMARY
       → Remover chamadas a ExpUpgradeModal

  6.4  Módulo Carreira (11 arquivos)
       → Pages: carreira/page, perfil, roadmap, habilidades, historico
       → Componentes mobile: CarreiraMobile, CarreiraTabDashboard,
         CarreiraTabPerfil, CarreiraTabRoadmap, CarreiraTabHistorico,
         CarreiraTabHabilidades, CarreiraAddPromotionModal, CarreiraAddSkillModal
       → Substituir carreiraColor(isJornada) → CARREIRA_PRIMARY

  6.5  Módulo Corpo (8 arquivos)
       → Pages: corpo/page, atividades, peso, cardapio, coach, saude
       → Componentes mobile: CorpoMobile, CorpoTabDashboard, CorpoTabCoach

  6.6  Módulo Mente (8 arquivos)
       → Pages: mente/page, trilhas, sessoes, biblioteca, timer
       → Componentes: MenteMobile, MenteSessoesTab, PomodoroTimer

  6.7  Módulo Tempo (7 arquivos)
       → Pages: tempo/page, foco, review, agenda, semanal, mensal
       → Componentes: TempoMobile, TempoMobileShell

  6.8  Módulo Patrimônio (6 arquivos)
       → Pages: patrimonio/page, carteira, carteira/[ticker], proventos,
         evolucao, simulador
       → Componentes: PatrimonioMobile

  6.9  Panorama / Dashboard (5 arquivos)
       → Pages: dashboard/page, dashboard/score, conquistas/page,
         conquistas/ranking
       → Componentes: DashboardMobile, PanoramaMobileShell

  6.10 Configurações (3 arquivos restantes)
       → Pages: configuracoes/notificacoes, configuracoes/integracoes,
         configuracoes/aparencia (remover gate PRO de temas)

  6.11 Hooks e libs (4 arquivos)
       → hooks/use-notifications.ts (4 ocorrências de isJornada)
       → hooks/use-futuro.ts (1 ocorrência)
       → lib/modules.ts (referências a modo)
       → types/database.ts (se tiver AppMode)

  ✅ Verificação por módulo: `npx tsc --noEmit` após cada sub-fase (6.1–6.11)


═══════════════════════════════════════════════════════════════════════════════
FASE 7 — Supabase
═══════════════════════════════════════════════════════════════════════════════

  7.1  Criar migration XXX_remove_mode_system.sql
       → UPDATE profiles SET mode = 'jornada' WHERE mode IS DISTINCT FROM 'jornada';
       → ALTER TABLE profiles ALTER COLUMN mode SET DEFAULT 'jornada';


═══════════════════════════════════════════════════════════════════════════════
FASE 8 — Limpeza Final e Verificação
═══════════════════════════════════════════════════════════════════════════════

  8.1  Executar TODAS as buscas globais (seção 4) — ZERO resultados esperados
  8.2  Limpar localStorage orphan (synclife-mode) via useEffect no AppShell
  8.3  Rodar: npm run build — sem erros
  8.4  Rodar: npx tsc --noEmit — sem erros
  8.5  Testar visualmente nos 12 temas
  8.6  Verificar onboarding (4 steps, sem step de modo)
  8.7  Verificar que saudação aparece, Score sempre visível, animações ativas
  8.8  Remover/atualizar testes quebrados por referência a modo
```

---

## 10. CHECKLIST DE VALIDAÇÃO FINAL

Após executar todas as fases, verificar:

```
── Build e Compilação ──────────────────────────────────────────────────────
[ ] npm run build — sem erros
[ ] npx tsc --noEmit — sem erros
[ ] npm run lint — sem erros relacionados a modo

── Grep ZERO (todos devem retornar 0 resultados em web/src/) ──────────────
[ ] "data-mode"
[ ] "jornada-only"
[ ] "foco-only"
[ ] "AppMode"
[ ] "ModePill"
[ ] "ModeTogglePill"
[ ] "ModeVisible"
[ ] "FocoJornadaSwitch"
[ ] "setMode" (exceto contextos não-relacionados a app mode)
[ ] "isJornada"
[ ] "isFoco"
[ ] "synclife-mode"
[ ] "[.jornada_&]"
[ ] "PRO_THEMES"
[ ] "FREE_THEMES"
[ ] "FUTURO_FOCO" / "FUTURO_JORNADA"
[ ] "EXP_FOCO" / "EXP_JORNADA"
[ ] "CARREIRA_FOCO" / "CARREIRA_JORNADA"

── Visual e Funcional ──────────────────────────────────────────────────────
[ ] App carrega sem erros no browser
[ ] Saudação personalizada aparece no header (sempre, em todas as páginas)
[ ] Nenhum breadcrumb Foco aparece
[ ] Nenhum ModePill/ModeTogglePill aparece no header
[ ] Life Sync Score sempre visível no sidebar
[ ] ThemePill funciona — todos os 12 temas selecionáveis
[ ] Nenhum UpgradeModal aparece ao selecionar qualquer tema
[ ] Nenhum <ProGate> bloqueia conteúdo
[ ] Onboarding desktop tem 4 steps (sem step de modo)
[ ] Onboarding mobile tem 4 steps (sem step de modo)
[ ] Configurações não tem seção "Modo de Uso"
[ ] Animações fadeUp funcionam em cards (sempre ativas)
[ ] Insights IA visíveis em todas as telas que os tinham
[ ] XP badges e streaks visíveis onde existiam
[ ] data-theme e data-scheme aplicam corretamente no <html>
[ ] data-mode NÃO existe no <html>
[ ] Troca de tema persiste no reload
[ ] Cores dos módulos corretas (Futuro=violeta, Exp=pink, Carreira=rose #f43f5e)
[ ] Labels motivacionais presentes (ex: "Missões" no Futuro, "Cofre" no Finanças)
```

---

## 11. RESUMO EXECUTIVO

| Métrica | Antes | Depois |
|---------|-------|--------|
| Modos de uso | 2 (Foco + Jornada) | 1 (experiência única) |
| Temas | 12 (3 FREE + 9 PRO) | 12 (todos liberados) |
| Combinações visuais para testar | 24 (12 temas × 2 modos) | 12 (12 temas × 1 experiência) |
| Atributos no `<html>` | 3 (data-theme, data-scheme, data-mode) | 2 (data-theme, data-scheme) |
| Classes CSS condicionais | 2 (.jornada-only, .foco-only) | 0 |
| Componentes de UI para modo | 6 (ModePill, ModeTogglePill, ModeVisible, FocoJornadaSwitch, breadcrumb, modo page) | 0 |
| Funções de cor com `isJornada` | 18 (6 por módulo × 3 módulos) | 0 |
| Steps no onboarding | 5 | 4 |
| Gates PRO ativos | Temas + Modo + Features (35 arquivos, 130 ocorrências) | 0 (MVP) |
| Testes unitários de modo | ~24 | 0 |
| Ocorrências de `isJornada` no codebase | **1.055 em 127 arquivos** | **0** |
| Esforço estimado por tela futura | 2x (duas versões) | 1x (uma versão) |

### Estimativa de esforço

| Fase | Descrição | Arquivos | Complexidade |
|------|-----------|----------|-------------|
| 1 | Types, Store, Hooks fundação | 8 | Baixa |
| 2 | CSS | 2 | Baixa |
| 3 | Shell components | 6 | Baixa |
| 4 | Pages, Layout, Onboarding | 7 | Média |
| 5 | Cores e Labels | 4 | Baixa |
| **6** | **Cleanup massivo de módulos** | **~110** | **Alta (repetitiva)** |
| 7 | Supabase migration | 1 | Baixa |
| 8 | Validação final | — | Média |
| **Total** | | **~130 arquivos** | |

**Nota:** A Fase 6 é mecanicamente simples (remover checks de isJornada e manter o valor Jornada), mas volumosa. Cada arquivo segue o mesmo padrão de transformação. Pode ser paralelizada por módulo.

---

*Documento criado em: 08/03/2026*
*Versão: 2.3 — Blocos A+B+C (Fases 1-6) implementados — migração funcional completa*
*Decisão de produto: Thiago (owner) — validada em conversa*
*Auditoria V2: Claude Code (08/03/2026) — quantificou escopo real*
*Execução Bloco A: Claude Code (08/03/2026) — 15 arquivos editados/deletados, 0 erros tsc*
*Execução Bloco B: Claude Code (08/03/2026) — 7 arquivos editados (layout, onboarding desktop/mobile, 3 color files, labels), 0 erros tsc*
*Execução Bloco C (parcial): Claude Code (08/03/2026) — 10 agentes paralelos processaram ~42 arquivos, corrigiram [.jornada_&] patterns*
*Execução Bloco C (completo): Claude Code (08/03/2026) — 16 agentes adicionais limparam 83 arquivos restantes. Resultado final:*
*  - isJornada em componentes/pages: 0 (era 1.055)*
*  - foco-only / jornada-only CSS: 0 (era 21)*
*  - [.jornada_&] patterns: 0 (era 84)*
*  - data-mode: 0*
*  - Per-mode color aliases (FUTURO_JORNADA, EXP_FOCO, etc.): 0 (era 125)*
*  - Compat functions (carreiraColor, expBg, etc.): 0*
*  - Store mode/setMode shim: removido*
*  - BadgeListItem (dead foco-only function): removido*
*  - 4 lib files simplificados (colors + labels): zero compat code restante*
*  - tsc --noEmit: 0 erros*
*Próximo: Bloco D (Fases 7+8 — Supabase migration + validação final)*
