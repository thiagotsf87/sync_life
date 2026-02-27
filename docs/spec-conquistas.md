# Spec — Conquistas (Fase 5.2)

> Protótipo de referência: `prototipos/proto-conquistas.html`
> Rota: `/conquistas` (app/(app)/conquistas/page.tsx)
> Status: Implementação do zero (placeholder existente tem apenas 10 linhas)

---

## 1. Estrutura da Tela

```
max-w-[1140px] mx-auto px-6 py-7 pb-16
├── ① Hero Summary (count card + 3 recent cards)
├── ② Jornada Motivational Phrase (hidden no Foco)
├── ③ Category Tabs + toggle "Mostrar bloqueadas"
├── ④-A Grid View (Jornada): Desbloqueadas → Bloqueadas
└── ④-B List View (Foco): Desbloqueadas → Bloqueadas
```

---

## 2. Header (via Shell TopHeader — não precisa duplicar na página)

No Foco: breadcrumb "Conquistas › Minhas Conquistas"
No Jornada: "🏆 Suas Conquistas" + "12 desbloqueadas · continue crescendo!"

---

## 3. Hero Summary

Layout: `flex gap-5 items-stretch mb-[22px] max-sm:flex-col`

### 3.1 Hero Score Card (flex: 1)

```
bg: var(--sl-s1)
border: var(--sl-border)
rounded-[20px] p-[24px_28px]
relative overflow-hidden
```

- Barra topo 3px: `linear-gradient(90deg, #f59e0b, #f97316, #ec4899, #8b5cf6)`
- Contador principal:
  - Número: `font-[Syne] font-extrabold text-[44px] leading-none bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-transparent bg-clip-text`
  - `/ {total}`: DM Mono 18px text-[var(--sl-t3)]
- Título: `font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]` — "Conquistas desbloqueadas"
- Sub: `text-[12px] text-[var(--sl-t3)]` — "Você está no **Top 15%** dos usuários do SyncLife."
- Barra de progresso: h-2, bg `var(--sl-s3)`, fill `linear-gradient(90deg, #f59e0b, #f97316, #ec4899)`, `transition width 1.4s`
- % texto: `text-[11px] text-[var(--sl-t3)]` — "X% do total desbloqueado"
- Animação: contador numérico (0 → total via requestAnimationFrame / intervalo)

### 3.2 Recent Strip (min-width: 280px, flex-shrink: 0)

3 cards das conquistas desbloqueadas mais recentes (ordenadas por data desc):

```
bg: var(--sl-s1) border: var(--sl-border) rounded-[16px] p-[14px_18px]
flex items-center gap-[14px]
cursor-pointer transition hover:border-[var(--sl-border-h)] hover:translate-x-0.5
```

- Barra esquerda 3px: cor da categoria
- Emoji (28px) + bloco info:
  - Label: `text-[9px] font-bold uppercase tracking-widest text-[var(--sl-t3)]` — "Recente · Última conquista" (só no 1º)
  - Nome: `text-[13px] font-bold text-[var(--sl-t1)]`
  - Data: `text-[11px] text-[var(--sl-t3)]`

---

## 4. Jornada Motivational Phrase

```tsx
<div className="hidden [.jornada_&]:flex items-center gap-3 p-[14px_18px] rounded-[14px] mb-5
                bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/7
                border border-[#10b981]/18 sl-fade-up">
  <span className="text-[22px] shrink-0">🤖</span>
  <span className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">
    Você tem <strong>X conquistas desbloqueadas</strong> e contando...
  </span>
</div>
```

Texto varia por contexto: cita a próxima conquista mais próxima de ser desbloqueada.

---

## 5. Category Tabs

Layout: `flex items-center gap-2 mb-[22px] flex-wrap`

Categorias: `all | fin | meta | cons | agenda`

Labels:
- `all` → "Todas"
- `fin` → "💰 Financeiras"
- `meta` → "🎯 Metas"
- `cons` → "📅 Consistência"
- `agenda` → "📆 Agenda"

Tab ativa: `border-[#0055ff] bg-[rgba(0,85,255,0.15)] text-[#0055ff]`
Tab inativa: `border-[var(--sl-border)] text-[var(--sl-t3)]`

Cada tab mostra contador: `{desbloqueadas}/{total}` (DM Mono 10px opacity-70)

Toggle direito: `<label>` com checkbox + "Mostrar bloqueadas" — margin-left auto

---

## 6. Badge Grid (Jornada) — 4 colunas

```
grid grid-cols-4 gap-[14px] mb-7
max-[900px]:grid-cols-3
max-sm:grid-cols-2
```

### Badge Card

```
bg: var(--sl-s1) border: var(--sl-border) rounded-[16px] p-[18px_16px]
text-center cursor-pointer relative overflow-hidden
transition hover:-translate-y-[3px] hover:border-[var(--sl-border-h)]
```

**Desbloqueada:**
- Barra bottom 3px: cor da categoria
- Rarity border/glow especial (ver abaixo)
- Icon wrap: 54x54px rounded-[16px] bg `{catColor}22` mx-auto mb-3, emoji 28px
  - `hover:scale-[1.08]` no icon wrap
- Rarity pill (acima do ícone)
- Nome: `font-[Syne] font-bold text-[12px] text-[var(--sl-t1)]`
- Desc: `text-[11px] text-[var(--sl-t2)] leading-[1.5] mb-2`
- Data: `text-[10px] text-[var(--sl-t3)]` — "🗓 DD Mês YYYY"

**Bloqueada:**
- `cursor-default` sem hover translate
- Icon wrap: `grayscale opacity-40`
- Lock overlay: 20x20px top-[10px] right-[10px] bg `var(--sl-s3)` rounded-[6px] "🔒" 11px
- Barra de progresso: h-1 bg `var(--sl-s3)` fill cor categoria, label "X/Y"
- `hover:transform-none` (sem efeito)

### Rarity Styles

| Rarity | Pill | Card Border/Shadow |
|--------|------|-------------------|
| common | bg `rgba(100,116,139,0.15)` text `#64748b` | sem especial |
| uncommon | bg green/12% text `#10b981` | border `rgba(16,185,129,0.4)` |
| rare | bg purple/15% text `#8b5cf6` | border `rgba(139,92,246,0.5)` shadow purple |
| legendary | bg yellow/15% text `#f59e0b` | border `rgba(245,158,11,0.6)` shadow yellow; bg gradient; shimmer animation no ícone |

### Hover glows (Jornada only, desbloqueadas)
- cat-fin: `shadow-[0_8px_28px_rgba(16,185,129,0.18)]`
- cat-meta: `shadow-[0_8px_28px_rgba(0,85,255,0.18)]`
- cat-cons: `shadow-[0_8px_28px_rgba(245,158,11,0.18)]`
- cat-agenda: `shadow-[0_8px_28px_rgba(6,182,212,0.18)]`

---

## 7. Badge List (Foco) — layout lista

```
flex flex-col gap-2 mb-7
```

### List Item

```
flex items-center gap-[14px] p-[12px_16px]
bg: var(--sl-s1) border: var(--sl-border) rounded-[12px]
cursor-pointer hover:border-[var(--sl-border-h)]
```

- Emoji 22px (locked: grayscale opacity-50)
- Dot colorido 12x12px rounded-full (locked: `{color}44`)
- Info: nome `text-[13px] font-semibold text-[var(--sl-t1)]` + desc `text-[12px] text-[var(--sl-t3)]`
- Direita: unlocked → data + badge "✅ Obtida" verde; locked → "X/Y" DM Mono + badge "🔒 X%" gray

---

## 8. Section Labels

```tsx
<div className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--sl-t3)] mb-[14px]
                flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[var(--sl-border)]">
  ✅ Desbloqueadas ({count})
</div>
```

---

## 9. Modal de Badge

Abre ao clicar em qualquer badge (desbloqueada ou bloqueada).

```
fixed inset-0 bg-black/65 backdrop-blur-[4px] z-[60]
flex items-center justify-center
```

Modal box: `bg-[var(--sl-s1)] border border-[var(--sl-border-h)] rounded-[22px] p-8 max-w-[440px] w-full mx-4`

Conteúdo:
1. Emoji grande (64px) + animação `bounceIn` (scale 0→1.15→1)
2. Nome: `font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)]`
3. Desc: `text-[13px] text-[var(--sl-t2)] leading-[1.7]`
4. Rarity pill + categoria pill
5. Box "Como desbloquear": bg `var(--sl-s2)` border `var(--sl-border)` rounded-[12px] p-[14px_16px]
6. Se bloqueada: barra de progresso + texto "Faltam X para desbloquear"
7. Se desbloqueada: box verde "🏆 Conquistado em DD/MM/YYYY"
8. Motivação (Jornada only): `hidden [.jornada_&]:block` bg gradient green/7%→blue/6% border green/18% italic

---

## 10. Dados (mock para MVP)

Badges são dados estáticos definidos no componente. Estrutura:

```ts
interface Badge {
  id: number
  cat: 'fin' | 'meta' | 'cons' | 'agenda'
  icon: string
  name: string
  desc: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  unlocked: boolean
  date: string | null
  criteria: string
  progress: number
  progressMax: number
  motivation: string
}
```

### Badges Definidos (21 total — do protótipo aprovado)

**Financeiras (7):**
1. 💰 Primeiro Passo — common — unlocked (15 Jan 2026)
2. 🟢 3 Meses no Verde — uncommon — unlocked (01 Fev 2026)
3. 🎯 Orçamento Cumprido — common — unlocked (31 Jan 2026)
4. 📊 Analista — common — unlocked (10 Fev 2026)
5. 🔥 6 Meses no Verde — rare — locked (progress 3/6)
6. 💎 Investidor Iniciante — uncommon — locked
7. 🏦 Reserva Construída — legendary — locked (progress 75/100)

**Metas (5):**
8. 🎯 Sonhador — common — unlocked (12 Jan 2026)
9. 🚀 Na Velocidade — uncommon — unlocked (20 Jan 2026)
10. 🏆 Meta Concluída — uncommon — unlocked (05 Fev 2026)
11. ⭐ Triatleta de Metas — rare — locked (progress 1/3)
12. 🌟 Lendário — legendary — locked (progress 1/5)

**Consistência (5):**
13. 🔥 Sequência de 7 dias — common — unlocked (22 Jan 2026)
14. 📅 Mês Completo — uncommon — unlocked (31 Jan 2026)
15. 💪 Madrugador — common — unlocked (18 Jan 2026)
16. 🏅 Sequência de 30 dias — rare — locked (progress 22/30)
17. 👑 Veterano — legendary — locked (progress 2/6)

**Agenda (4):**
18. 📅 Organizador — common — unlocked (14 Jan 2026)
19. ✅ 100% Concluído — uncommon — unlocked (02 Fev 2026)
20. 🔗 Integrador — uncommon — locked
21. 🗓️ Planner Master — rare — locked (progress 12/50)

**Total desbloqueadas: 12 / 21 (57%)**

---

## 11. Cores de Categoria

```ts
const CAT_COLORS = {
  fin:    '#10b981',
  meta:   '#0055ff',
  cons:   '#f59e0b',
  agenda: '#06b6d4',
}
```

---

## 12. Animações

- `sl-fade-up` em hero card e badge cards (com delay incremental)
- Contador numérico: 0 → total com `setInterval` 30ms
- Barra hero: anima após mount via `useEffect` (width 0 → X%)
- Badge legendário: shimmer keyframe `@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }` no ícone (Jornada)
- Modal open: `modalUp` keyframe `translateY(20px)→0`
- Badge click (Jornada new unlock simulation): `flipIn` keyframe `rotateY(90deg)→0`
- Confetti/particles: canvas animation (Jornada only) ao simular desbloqueio (MVP: apenas visual demo)

---

## 13. Responsividade

| Breakpoint | Mudança |
|-----------|---------|
| `max-[900px]` | Badge grid: 3 colunas |
| `max-sm` | Badge grid: 2 colunas; Hero: flex-col |

---

## 14. Checklist de Implementação

- [ ] `'use client'` (filtros, modal, animações)
- [ ] State: `curCat`, `showLocked`, `modalBadge`
- [ ] Badges como constante estática (não fetch de DB no MVP)
- [ ] Contador animado via `useEffect` + `requestAnimationFrame`
- [ ] Barra hero animada via `useEffect` após mount
- [ ] Modal com `z-[60]` para ficar acima do shell
- [ ] Tecla ESC fecha modal
- [ ] Click fora do modal fecha
- [ ] Grid view (Jornada) / List view (Foco) via CSS `hidden [.jornada_&]:block`
- [ ] Shimmer legendary apenas em Jornada
- [ ] Funciona nos 4 modos: Dark Foco, Dark Jornada, Light Foco, Light Jornada
- [ ] `useShellStore` para checar `mode`
