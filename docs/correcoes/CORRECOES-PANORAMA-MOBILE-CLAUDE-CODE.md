# 🔧 Guia de Correções — Módulo Panorama Mobile
## Documento para Claude Code

**Data:** 01/03/2026  
**Escopo:** Corrigir inconsistências mobile do módulo Panorama (Dashboard, Conquistas, Ranking) + Drawer "Mais"  
**Branch de trabalho:** Criar branch `fix/panorama-mobile-inconsistencias`  
**Regra de ouro:** Desktop (≥1024px) NÃO PODE mudar. Todas as alterações mobile usam classes Tailwind `max-lg:` ou `max-sm:`.

---

## ⚠️ REGRAS OBRIGATÓRIAS ANTES DE COMEÇAR

1. **NÃO alterar layout desktop** — use exclusivamente `max-lg:` e `max-sm:` para mudanças mobile
2. **NÃO hardcodar cores** — use tokens `var(--sl-*)` do design system
3. **NÃO inventar fontes** — apenas Syne (títulos), DM Sans (texto), DM Mono (números)
4. **Testar nos 4 modos** após cada tarefa: Foco Dark, Jornada Dark, Foco Light, Jornada Light
5. **Viewport de teste:** 390×844 (iPhone 14 Pro)

---

## TAREFA 1 — Sub-tabs do Panorama (Estilo Inconsistente)
**Prioridade:** 🔴 ALTA  
**Arquivos:** `web/src/app/(app)/dashboard/page.tsx`, `web/src/app/(app)/conquistas/page.tsx`, `web/src/app/(app)/conquistas/ranking/page.tsx`  
**Problema:** A sub-tab "Dashboard" aparece como pill verde, enquanto "Conquistas" e "Ranking" são texto sem background. O estilo deve ser uniforme.

### O que fazer:
Localizar o componente de sub-tabs do módulo Panorama. As 3 abas (Dashboard, Conquistas, Ranking) devem usar o mesmo estilo visual:

**Aba ativa:**
```
background: var(--sl-em-glow) ou rgba(16,185,129,0.12)
color: var(--sl-em) ou #10b981
font-weight: 600
padding: 6px 14px
border-radius: 20px (pill)
```

**Aba inativa:**
```
background: transparent
color: var(--sl-t2)
font-weight: 500
padding: 6px 14px
border-radius: 20px (pill) — manter hit area consistente
hover: background var(--sl-s3)
```

### CSS de referência (do protótipo aprovado):
```css
/* Todas as tabs com o mesmo padding e shape */
.sub-tab {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: var(--sl-t2);
  background: transparent;
  transition: all 0.15s;
  cursor: pointer;
  white-space: nowrap;
}
.sub-tab:hover {
  background: var(--sl-s3);
  color: var(--sl-t1);
}
.sub-tab.active {
  background: rgba(16,185,129,0.12);
  color: #10b981;
  font-weight: 600;
}
```

### Validação:
- [ ] As 3 abas (Dashboard, Conquistas, Ranking) têm o mesmo shape e padding
- [ ] Apenas 1 aba está "ativa" por vez com background verde sutil
- [ ] As inativas são texto plain com hover
- [ ] No mobile, as tabs tem scroll horizontal se necessário (overflow-x: auto, scrollbar hidden)
- [ ] Funciona nos 4 modos visuais

---

## TAREFA 2 — Saudação Jornada: Posicionar Corretamente no Mobile
**Prioridade:** 🔴 ALTA  
**Arquivo:** `web/src/app/(app)/dashboard/page.tsx`  
**Problema:** A saudação "Boa noite, Teste! ✨" aparece depois das sub-tabs, solta no conteúdo. No protótipo aprovado (`proto-dashboard-revisado.html`), a saudação é a PRIMEIRA coisa visível na área de conteúdo, ANTES das sub-tabs, com o streak badge ao lado.

### Layout esperado no mobile (modo Jornada):
```
[MobileHeader — Linha 1: breadcrumb + ações]
[Sub-tabs: Dashboard | Conquistas | Ranking]

[Saudação + Streak]
  "Boa noite, Teste! ✨"                    🔥 7 dias
  "Registros em dia — continue assim."

[📅 Março de 2026 ▼]                        

[Life Sync Score Card]
[KPI Cards]
...
```

### O que fazer:

1. **Mover o bloco de saudação Jornada** para ACIMA do seletor de mês, como primeiro elemento do conteúdo da página (após as sub-tabs do shell)

2. **Layout da saudação no mobile:**
```tsx
{/* Jornada greeting — primeira coisa no conteúdo */}
<div className="jornada-only flex items-start justify-between mb-4">
  <div>
    <h1 className="font-[Syne] font-extrabold text-[22px] max-sm:text-[20px] text-[var(--sl-t1)] leading-tight">
      Boa noite, {userName}!
      <span className="ml-1">✨</span>
    </h1>
    <p className="text-[13px] text-[var(--sl-t3)] mt-0.5">
      Registros em dia — continue assim.
    </p>
  </div>
  {/* Streak badge */}
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                  bg-[rgba(16,185,129,0.10)] text-[#10b981] text-[12px] font-semibold 
                  whitespace-nowrap shrink-0">
    🔥 7 dias
  </div>
</div>
```

3. **No modo Foco**, essa saudação NÃO aparece. Usar a classe `jornada-only` que já existe no projeto.

### Validação:
- [ ] No Jornada: saudação com nome do usuário aparece como primeiro elemento
- [ ] Streak badge "🔥 7 dias" alinhado à direita da saudação
- [ ] No Foco: saudação não aparece, página começa direto no seletor de mês
- [ ] A frase motivacional está abaixo do nome
- [ ] Desktop não foi afetado

---

## TAREFA 3 — Life Sync Score Card: Layout Mobile Vertical
**Prioridade:** 🔴 ALTA  
**Arquivo:** `web/src/app/(app)/dashboard/page.tsx`  
**Problema:** O card usa layout horizontal (score à esquerda, dimensões à direita) que transborda no mobile. Precisa fazer stack vertical em telas pequenas.

### Layout atual (desktop — MANTER):
```
[Score 74]  [Título + Frase + Barra + 4 Dimensões]  [Botão "Ver análise"]
```

### Layout esperado no mobile (stack vertical):
```
[SEMANA ↑ +3] (badge no canto)
[Score 74 grande, centralizado]
[LIFE SYNC SCORE label]
[Frase "Há espaço para crescer"]
[Barra de progresso gradiente esmeralda→azul]
[Grid 2×2 ou 4×2 de dimensões com barras coloridas]
[Botão "Ver análise completa →"]  [↑ +3 esta semana]
```

### O que fazer:

Localizar o bloco do Life Sync Score no `dashboard/page.tsx`. Adicionar classes responsivas para stack vertical no mobile:

```tsx
{/* Life Sync Score Card */}
<div className="jornada-only bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-[rgba(0,85,255,0.08)]
                border border-[rgba(16,185,129,0.15)] rounded-[20px] p-6 mb-5
                flex gap-6 items-start
                max-sm:flex-col max-sm:items-center max-sm:text-center max-sm:gap-4 max-sm:p-5">
```

Para as dimensões, mudar de `grid-cols-4` para `grid-cols-2` no mobile:
```tsx
<div className="grid grid-cols-4 gap-x-5 gap-y-2 max-sm:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-3">
```

Para o botão + delta, empilhar no mobile:
```tsx
<div className="flex-shrink-0 flex flex-col gap-2 items-end
                max-sm:flex-row max-sm:w-full max-sm:justify-between max-sm:items-center max-sm:mt-2">
```

### Validação:
- [ ] Desktop: layout horizontal mantido sem alterações
- [ ] Mobile 390px: card faz stack vertical sem overflow horizontal
- [ ] Score grande centralizado no mobile
- [ ] Dimensões em grid 2 colunas no mobile
- [ ] Botão "Ver análise completa" e delta "↑ +3" visíveis sem corte
- [ ] O card inteiro cabe na tela sem scroll horizontal

---

## TAREFA 4 — KPI Cards: Adicionar Ícones e Ajustar Mobile
**Prioridade:** 🟠 MÉDIA-ALTA  
**Arquivo:** `web/src/components/ui/kpi-card.tsx`, `web/src/app/(app)/dashboard/page.tsx`  
**Problema:** Os KPI cards não têm o ícone colorido que o protótipo mostra. No mobile, o padding é grande demais.

### O que fazer no `kpi-card.tsx`:

O componente já aceita props `icon` e `iconBg` (verificar no `dashboard/page.tsx` que já passa `icon="💰"` e `iconBg="rgba(16,185,129,0.12)"`). Porém o componente `KpiCard` original no arquivo `kpi-card.tsx` **NÃO renderiza o ícone**. Precisa adicionar.

**Interface atualizada:**
```tsx
interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent?: string
  icon?: string        // emoji, ex: "💰"
  iconBg?: string      // background do ícone, ex: "rgba(16,185,129,0.12)"
  barPct?: number      // barra de progresso opcional (0-100)
  barBg?: string       // cor da barra
  delay?: string       // classe de delay de animação
}
```

**Estrutura do card atualizada:**
```tsx
export function KpiCard({ label, value, delta, deltaType = 'neutral', accent = '#10b981', icon, iconBg, barPct, barBg, delay }: KpiCardProps) {
  const deltaColor = {
    up: 'text-[#10b981]',
    down: 'text-[#f43f5e]',
    warn: 'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className={cn(
      'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden',
      'p-5 max-sm:p-3',  // ← padding reduzido no mobile
      'transition-colors hover:border-[var(--sl-border-h)] sl-fade-up',
      delay
    )}>
      {/* Barra de acento no topo */}
      <div className="absolute top-0 left-5 right-5 max-sm:left-3 max-sm:right-3 h-0.5 rounded-b"
           style={{ background: accent }} />
      
      {/* Ícone + Label */}
      <div className="flex items-center gap-2 mb-1.5">
        {icon && (
          <div className="w-7 h-7 max-sm:w-6 max-sm:h-6 rounded-lg flex items-center justify-center text-sm max-sm:text-xs shrink-0"
               style={{ background: iconBg || 'rgba(16,185,129,0.12)' }}>
            {icon}
          </div>
        )}
        <p className="text-[10px] font-bold uppercase tracking-widest max-sm:tracking-wider text-[var(--sl-t3)]">
          {label}
        </p>
      </div>

      {/* Valor */}
      <p className="font-[DM_Mono] font-medium text-xl max-sm:text-lg text-[var(--sl-t1)] leading-none truncate">
        {value}
      </p>

      {/* Delta */}
      {delta && (
        <p className={cn('text-[11px] mt-1 truncate', deltaColor)}>{delta}</p>
      )}

      {/* Barra de progresso opcional */}
      {barPct !== undefined && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-[width] duration-700"
               style={{ width: `${Math.min(100, barPct)}%`, background: barBg || accent }} />
        </div>
      )}
    </div>
  )
}
```

### Pontos-chave mobile:
- `p-5` → `p-5 max-sm:p-3` (reduzir padding)
- `text-xl` → `text-xl max-sm:text-lg` (reduzir fonte do valor)
- `tracking-widest` → `tracking-widest max-sm:tracking-wider` (reduzir tracking da label)
- Adicionar `truncate` no valor para evitar overflow

### Validação:
- [ ] Cada KPI card mostra ícone emoji com background colorido
- [ ] No mobile, padding é menor e texto não transborda
- [ ] Valores monetários como "R$ 7.780" aparecem completos sem corte
- [ ] A barra de acento no topo está visível em todos os cards
- [ ] Desktop mantido sem alterações visuais

---

## TAREFA 5 — Conquistas: Recent Cards Horizontal no Mobile
**Prioridade:** 🟠 MÉDIA  
**Arquivo:** `web/src/app/(app)/conquistas/page.tsx`  
**Problema:** Os recent cards (últimas conquistas desbloqueadas) estão em stack vertical no mobile. O protótipo especifica horizontal com scroll.

### O que fazer:

Localizar o container dos recent cards. No protótipo:
```css
@media (max-width:768px) {
  .recent-strip { flex-direction: row; overflow-x: auto; }
  .recent-card { min-width: 240px; }
}
```

**Traduzir para Tailwind:**

No container dos recent cards, alterar:
```tsx
{/* De: */}
<div className="flex flex-col gap-[10px] min-w-[280px] flex-shrink-0 max-sm:min-w-0">

{/* Para: */}
<div className="flex flex-col gap-[10px] min-w-[280px] flex-shrink-0 
                max-sm:flex-row max-sm:overflow-x-auto max-sm:min-w-0 max-sm:pb-2
                max-sm:scrollbar-none max-sm:snap-x max-sm:snap-mandatory">
```

Em cada recent card individual, adicionar:
```tsx
<div className="... max-sm:min-w-[240px] max-sm:flex-shrink-0 max-sm:snap-start">
```

### Validação:
- [ ] Desktop: recent cards em coluna vertical (sem mudança)
- [ ] Mobile: recent cards em linha horizontal com scroll
- [ ] Scroll suave com snap points
- [ ] Scrollbar escondida
- [ ] Barra lateral colorida de 3px visível em cada card

---

## TAREFA 6 — Conquistas: Grid View no Modo Jornada
**Prioridade:** 🟡 MÉDIA  
**Arquivo:** `web/src/app/(app)/conquistas/page.tsx`  
**Problema:** No modo Jornada os badges deveriam aparecer em grid (cards com ícone grande). No modo Foco, em lista compacta.

### O que fazer:

O protótipo define:
- **Jornada** → Grid view (`badges-grid`, 2 colunas no mobile)
- **Foco** → List view (items horizontais compactos)

Verificar se a lógica de `FocoJornadaSwitch` ou controle por CSS `jornada-only` / `foco-only` está aplicada no grid de badges. Se não estiver:

```tsx
{/* Grid view — Jornada only */}
<div className="jornada-only">
  <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
    {badges.map(badge => <BadgeCardGrid key={badge.id} badge={badge} />)}
  </div>
</div>

{/* List view — Foco only */}
<div className="foco-only">
  <div className="flex flex-col gap-1">
    {badges.map(badge => <BadgeCardList key={badge.id} badge={badge} />)}
  </div>
</div>
```

### Validação:
- [ ] Modo Jornada: badges em grid (2 colunas mobile, 4 desktop)
- [ ] Modo Foco: badges em lista horizontal compacta
- [ ] Transição suave entre os modos

---

## TAREFA 7 — Conquistas: Scroll Horizontal nas Category Tabs
**Prioridade:** 🟡 MÉDIA  
**Arquivo:** `web/src/app/(app)/conquistas/page.tsx`  
**Problema:** As category tabs (Todas, Financeiras, Metas, Consistência) podem transbordar no mobile sem scroll.

### O que fazer:

Envolver as category tabs em um container com scroll horizontal:

```tsx
<div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1
                max-sm:mask-r-from-80">
  {categories.map(cat => (
    <button key={cat.id} 
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0',
              'border transition-all',
              activeCat === cat.id 
                ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border-[rgba(16,185,129,0.2)]'
                : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
            )}>
      {cat.label} <span className="text-[var(--sl-t3)] ml-1">{cat.done}/{cat.total}</span>
    </button>
  ))}
</div>
```

Se a classe `scrollbar-none` não existir no Tailwind, adicionar no `globals.css`:
```css
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
```

Para o fade mask no lado direito (indicar que há mais conteúdo):
```css
.max-sm\:mask-r-from-80 {
  -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
  mask-image: linear-gradient(to right, black 80%, transparent 100%);
}
```

### Validação:
- [ ] Todas as tabs visíveis via scroll horizontal no mobile
- [ ] Scrollbar escondida
- [ ] Fade visual no lado direito indicando mais conteúdo
- [ ] Tab ativa scrollada para o centro (usar `scrollIntoView` no click)

---

## TAREFA 8 — Ranking: Avatar do Usuário com Cor Correta
**Prioridade:** 🟢 BAIXA  
**Arquivo:** `web/src/app/(app)/conquistas/ranking/page.tsx`  
**Problema:** O avatar "EU" no hero card do ranking aparece com fundo azul, mas deveria usar a cor esmeralda (#10b981) conforme o design system do SyncLife.

### O que fazer:

Localizar o avatar do current user no hero card e verificar a `avatarColor`. No mock data:
```tsx
{ position: 15, name: 'Você', initials: 'EU', avatarColor: '#10b981', ... isCurrentUser: true }
```

Se a cor estiver setada como `#10b981` no dado mas renderiza azul, verificar se o componente de avatar está usando a cor corretamente:

```tsx
<div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
     style={{ background: user.avatarColor || '#10b981' }}>
  {user.initials}
</div>
```

### Validação:
- [ ] Avatar "EU" do hero card usa fundo esmeralda (#10b981)
- [ ] Os avatares dos outros usuários no leaderboard usam suas respectivas cores

---

## TAREFA 9 — Drawer "Mais": Ajustes Menores
**Prioridade:** 🟢 BAIXA  
**Arquivo:** `web/src/components/shell/MobileMoreSheet.tsx`  
**Problema menor:** O drawer funciona bem, mas tem 2 refinamentos.

### 9a — Label do tema: Mostrar nome do tema ativo

Localizar a seção PREFERÊNCIAS > Tema. Em vez de apenas "🌙 Personalizar", mostrar:

```tsx
<div className="flex items-center justify-between">
  <span className="text-[var(--sl-t2)] text-sm">Tema</span>
  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                     bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[12px]"
          onClick={() => navigate('/configuracoes/aparencia')}>
    <span>🌙</span>
    <span className="text-[var(--sl-t2)]">{activeThemeName}</span>
    {/* Ex: "Navy Dark", "Clean Light", etc. */}
  </button>
</div>
```

Obter o nome do tema ativo do `useShellStore` (campo `theme`).

### 9b — Conquistas: Considerar badge de engajamento

Adicionar badge de contagem quando há conquistas novas não visualizadas:

```tsx
<button onClick={() => navigate('/conquistas')} className="flex items-center gap-3 ...">
  <IconConquistas size={20} style={{ color: MODULES.conquistas.color }} />
  <span>Conquistas</span>
  {newBadgeCount > 0 && (
    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full
                     bg-[rgba(245,158,11,0.15)] text-[#f59e0b]">
      {newBadgeCount} novas
    </span>
  )}
</button>
```

### Validação:
- [ ] O nome do tema ativo aparece no drawer (ex: "Navy Dark")
- [ ] Badge de conquistas novas aparece quando aplicável

---

## 📋 CHECKLIST GERAL DE VALIDAÇÃO

Após concluir TODAS as tarefas, executar esta checklist:

### Mobile (390×844):
- [ ] Dashboard Foco Dark: Sem overflow, sem saudação, sub-tabs uniformes
- [ ] Dashboard Jornada Dark: Saudação no topo, streak badge, Life Sync Score vertical
- [ ] Dashboard Foco Light: Mesmo layout de Foco Dark, cores light corretas
- [ ] Dashboard Jornada Light: Mesmo layout de Jornada Dark, cores light corretas
- [ ] Conquistas Jornada: Hero card, recent cards horizontal, grid de badges
- [ ] Conquistas Foco: Hero card, recent cards horizontal, lista de badges
- [ ] Ranking: Hero card com avatar esmeralda, grid 2×2 de categorias
- [ ] Drawer "Mais": Grid 3×3, módulo ativo destacado, nome do tema visível

### Desktop (≥1024px):
- [ ] Dashboard: Layout IDÊNTICO ao antes das mudanças
- [ ] Conquistas: Layout IDÊNTICO ao antes das mudanças
- [ ] Ranking: Layout IDÊNTICO ao antes das mudanças
- [ ] Nenhum componente desktop quebrado

### Cross-cutting:
- [ ] Nenhuma cor hardcoded fora dos tokens `var(--sl-*)`
- [ ] Nenhuma fonte fora de Syne / DM Sans / DM Mono
- [ ] Animações sl-fade-up funcionando
- [ ] Transição de modo Foco↔Jornada funciona sem reload

---

## 🗂️ REFERÊNCIA DE ARQUIVOS

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `web/src/components/ui/kpi-card.tsx` | MODIFICAR — adicionar ícone, ajustar padding mobile |
| `web/src/app/(app)/dashboard/page.tsx` | MODIFICAR — saudação, Life Sync Score vertical, sub-tabs |
| `web/src/app/(app)/conquistas/page.tsx` | MODIFICAR — recent cards horizontal, grid/list view, category tabs scroll |
| `web/src/app/(app)/conquistas/ranking/page.tsx` | MODIFICAR — cor do avatar |
| `web/src/components/shell/MobileMoreSheet.tsx` | MODIFICAR — label do tema |
| `web/src/app/globals.css` | MODIFICAR — adicionar utilitários (scrollbar-none, mask) se necessário |

## 🗂️ REFERÊNCIA DE PROTÓTIPOS APROVADOS

| Protótipo | Tela |
|-----------|------|
| `proto-dashboard-revisado.html` | Dashboard (Foco + Jornada, Dark + Light) |
| `proto-conquistas.html` | Conquistas (todas as abas, Foco + Jornada) |
| O componente ranking já existe em `ranking/page.tsx` | Ranking |

## 📐 TOKENS DE COR USADOS

```
--sl-bg, --sl-s1, --sl-s2, --sl-s3       → backgrounds
--sl-border, --sl-border-h                → bordas
--sl-t1, --sl-t2, --sl-t3                → textos
--sl-em (#10b981)                         → esmeralda (accent primário)
--sl-el (#0055ff)                         → electric blue
```

**Cores de status (fixas):**
```
success: #10b981  (verde)
danger:  #f43f5e  (vermelho)
warning: #f59e0b  (amarelo/laranja)
info:    #06b6d4  (cyan)
```

---

## ⏱️ ORDEM DE EXECUÇÃO RECOMENDADA

```
1. TAREFA 1 — Sub-tabs uniformes          (~30 min)
2. TAREFA 4 — KPI cards com ícone         (~45 min)
3. TAREFA 3 — Life Sync Score vertical    (~45 min)
4. TAREFA 2 — Saudação posicionamento     (~30 min)
5. TAREFA 5 — Recent cards horizontal     (~30 min)
6. TAREFA 7 — Category tabs scroll        (~20 min)
7. TAREFA 6 — Grid/List por modo          (~30 min)
8. TAREFA 8 — Avatar cor                  (~10 min)
9. TAREFA 9 — Drawer refinamentos         (~20 min)
                                    Total: ~4.5 horas
```

---

*Documento gerado em 01/03/2026 com base na auditoria de inconsistências do módulo Panorama mobile.*
*Protótipos de referência: `proto-dashboard-revisado.html`, `proto-conquistas.html`*
*Especificações de referência: `PLANO-MVP-V4.md`, `AUDITORIA-MOBILE.md`, `CLAUDE.md`*
