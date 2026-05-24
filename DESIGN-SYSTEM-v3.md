# SyncLife — Design System v3

> **Fonte única de verdade** para implementação visual do SyncLife.
> **Última atualização:** mar/2026 · **Status:** pronto pra implementação na branch `redesign/visual-refresh-v3`

---

## Sumário

1. [Princípios](#1-princípios)
2. [Tokens](#2-tokens)
3. [Tipografia](#3-tipografia)
4. [Iconografia](#4-iconografia)
5. [Componentes base](#5-componentes-base)
6. [Padrões de composição](#6-padrões-de-composição)
7. [Matriz de telas](#7-matriz-das-45-telas)
8. [Regras de copy](#8-regras-de-copy)
9. [Regras visuais](#9-regras-visuais)
10. [Migração v2 → v3](#10-migração-v2--v3)
11. [Roadmap UX v3.1](#11-roadmap-ux-v31)

---

## 1. Princípios

O SyncLife é um app de **gestão de vida** (não B2B). Tudo decorre destes 5 princípios:

| # | Princípio | Tradução prática |
|---|---|---|
| 1 | **Calmo > Energético** | Sem gradients tech, sem cores neon, sem confete |
| 2 | **Petróleo é a marca** | Verde Esmeralda `#0F766E` é o ÚNICO accent. Cores de módulo são identificação, não accent |
| 3 | **Hierarquia clara** | UM hero por tela. O resto recua |
| 4 | **Tom humano** | Sem em-dashes (—), sem "Olá!" exclamação, sem emoji em chrome |
| 5 | **Dados são reais** | Toda moeda formatada, todo gráfico com tooltip, todo número em fonte tabular |

---

## 2. Tokens

Todos os valores ficam em `tokens-v3.css`. Use **sempre via variável CSS**, nunca hex literal.

### 2.1 Cores de marca

| Token | Hex | Uso |
|---|---|---|
| `--sl-em` | `#0F766E` | **Accent primário** (CTAs, focus, key data) |
| `--sl-em-soft` | `rgba(15,118,110,0.12)` | Backgrounds de accent (chips, badges) |
| `--sl-em-strong` | `#138A80` | Hover de accent |
| `--sl-el` | `#0B2D34` | Azul Petróleo profundo (text accent em light, glow em dark) |
| `--sl-mist` | `#96D1C6` | Verde Névoa — toques sutis (borders no light theme) |
| `--sl-gold` | `#D9C89A` | Areia Dourada — marcos especiais, estrela do logo, conquistas raras |
| `--sl-grad` | `linear-gradient(135deg, #0F766E, #0B2D34)` | **APENAS** em logo e ring de metas |

### 2.2 Cores por módulo (identificação, não accent)

| Módulo | Token | Hex |
|---|---|---|
| Panorama | `--sl-mod-pan` | `#6B6FD4` |
| Finanças | `--sl-mod-fin` | `#0F766E` (= accent) |
| Tempo | `--sl-mod-tmp` | `#3CA0B5` |
| Futuro | `--sl-mod-fut` | `#8B7BD4` |
| Corpo | `--sl-mod-crp` | `#D97534` |
| Mente | `--sl-mod-mnt` | `#D9962E` |
| Patrimônio | `--sl-mod-ptr` | `#4F88D4` |
| Carreira | `--sl-mod-car` | `#DB6478` |
| Experiências | `--sl-mod-exp` | `#C76795` |
| Conquistas | `--sl-mod-cqs` | `#D9962E` |
| Configurações | `--sl-mod-cfg` | `#6F7986` |

> Todas dessaturadas ~15-20% em relação ao app antigo. Mantêm identificação, baixam ruído visual.

### 2.3 Status (semântico)

| Token | Hex | Uso |
|---|---|---|
| `--sl-success` | `#0F766E` | Receitas, ≤70% orçamento, on track |
| `--sl-warning` | `#D9962E` | 70-85% orçamento, atenção |
| `--sl-danger` | `#DB6478` | Despesas, >85% orçamento, erros |
| `--sl-info` | `#3CA0B5` | Agenda, neutralidade |

Cada um tem variação `-bg` (opacity 10%) para backgrounds de chips.

### 2.4 Superfícies por tema

**4 temas oficiais (reduzido de 12)**. Controlados via `data-theme` no `<html>`.

| Token | Navy (default) | Midnight | Carbon | Cream (light) |
|---|---|---|---|---|
| `--sl-bg` | `#0B0F14` | `#0F0B1F` | `#181818` | `#F5F2EC` |
| `--sl-s1` (card) | `#131922` | `#161232` | `#222222` | `#FFFFFF` |
| `--sl-s2` (hover/input) | `#1A2230` | `#1F1B40` | `#2B2B2B` | `#EFEBE2` |
| `--sl-s3` (progress bg) | `#232C3B` | `#2A2552` | `#363636` | `#E5DFD2` |
| `--sl-s-hero` | `#161D28` | `#1A1638` | `#252525` | `#FAF7F1` |
| `--sl-t1` (texto primário) | `#E7ECF1` | `#E7ECF1` | `#E7ECF1` | `#1A2230` |
| `--sl-t2` (texto secundário) | `#A7B0BC` | `#A7B0BC` | `#A7B0BC` | `#4F5663` |
| `--sl-t3` (texto terciário) | `#6F7986` | `#6F7986` | `#6F7986` | `#818A95` |
| `--sl-t4` (muted) | `#4A535F` | `#4A535F` | `#4A535F` | `#B4BAC2` |
| `--sl-border` | `rgba(255,255,255,0.06)` | idem | idem | `rgba(0,0,0,0.08)` |
| `--sl-border-h` (hover) | `rgba(255,255,255,0.12)` | idem | idem | `rgba(0,0,0,0.16)` |

> **Regra:** background nunca é preto puro (#000) nem branco puro (#FFF). Sempre uma versão "respirável".

### 2.5 Espaçamento, radii, motion

```css
/* Spacing (base 4px) */
--sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
--sp-5: 20px;  --sp-6: 24px;  --sp-7: 32px;  --sp-8: 48px;
--sp-9: 64px;  --sp-10: 96px;

/* Radii */
--r-sm: 8px;     /* botões pequenos */
--r-md: 12px;    /* inputs, tooltips */
--r-lg: 16px;    /* cards padrão */
--r-xl: 20px;    /* cards de seção */
--r-2xl: 28px;   /* hero, bottom sheets */
--r-pill: 999px; /* pills, avatares */

/* Motion */
--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);    /* narrativo */
--ease-soft:   cubic-bezier(0.4, 0, 0.2, 1);      /* UI padrão */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* micro-afirmação */

--dur-fast: 160ms;
--dur-base: 240ms;
--dur-slow: 420ms;
```

---

## 3. Tipografia

### 3.1 Famílias

| Família | Papel | Pesos |
|---|---|---|
| **Space Grotesk** | Display — títulos, scores, KPIs, números | 500, 600, 700 |
| **DM Sans** | Body — textos, labels, botões | 400, 500, 600 |
| **IBM Plex Mono** | Mono — timestamps, IDs, código | 400, 500 |

> ⚠️ **Substituições do app v2**: Syne → Space Grotesk · Outfit → DM Sans · DM Mono → IBM Plex Mono (zero sem corte).

### 3.2 Escala

| Token | Tamanho | Uso |
|---|---|---|
| `--text-xs` | 10px | Eyebrows uppercase (mín. permitido — só em ALL CAPS) |
| `--text-sm` | 11.5px | Meta, deltas, timestamps |
| `--text-base` | 13px | Body padrão, list items |
| `--text-md` | 14px | Sub-headings, labels de form |
| `--text-lg` | 16px | Sub-valores |
| `--text-xl` | 20px | KPI values |
| `--text-2xl` | 24px | Section h3 |
| `--text-3xl` | 32px | Page h1 |
| `--text-4xl` | 44px | Hero secundário |
| `--text-5xl` | 64-96px | Hero principal (score, level) |

### 3.3 Classes utilitárias

```css
.sl-num         /* Space Grotesk 500 + tabular-nums (use em todo valor) */
.sl-num-strong  /* Space Grotesk 600 + tabular-nums (KPIs, hero) */
```

**Regra G-02:** todo valor monetário/percentual usa `.sl-num` ou `.sl-num-strong`, NUNCA mono.

### 3.4 Máscara de valores

| Tipo | Formato | Exemplo |
|---|---|---|
| Moeda BRL | `R$ X.XXX,XX` | `R$ 1.840,00` |
| Moeda compacta | `R$ X,Yk` | `R$ 24,5k` (em espaços apertados) |
| Percentual | `X%` ou `X,Y%` | `37%`, `8,2%` |
| Negativo | `– R$ X,XX` (en-dash + espaço) | `– R$ 320,00` |
| Delta | `+X%` ou `-X%` em cor | `+12%` (verde), `-5%` (vermelho) |

Helper de referência:
```js
const fmtBRL = (n, { compact = false } = {}) => {
  if (compact && Math.abs(n) >= 1000)
    return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
```

---

## 4. Iconografia

**Biblioteca oficial:** [Lucide React](https://lucide.dev) · stroke 1.75px · `currentColor` para herdar cor.

### 4.1 Regras

- **Stroke icons apenas** — não misturar com fill icons
- **Tamanhos:** 12/14/16/18/20/24px
- **Cor:** sempre `currentColor`. O parent decide a cor.
- **Emojis:** ❌ proibidos em chrome do produto. Permitidos apenas em conteúdo gerado pelo usuário (notas, habit names).
- **Substituições antigas:** 🐷→`<Wallet>` · 🎯→`<Target>` · 📅→`<Calendar>` · 🏥→`<HeartPulse>` · 📚→`<Brain>` etc

### 4.2 Mapping de ícones por módulo

```tsx
import { Globe, Wallet, Target, Clock, HeartPulse, Brain, TrendingUp,
         Briefcase, Plane, Trophy, Settings } from 'lucide-react'

const MODULE_ICONS = {
  panorama:    Globe,
  financas:    Wallet,
  futuro:      Target,
  tempo:       Clock,
  corpo:       HeartPulse,
  mente:       Brain,
  patrimonio:  TrendingUp,
  carreira:    Briefcase,
  experiencias: Plane,
  conquistas:  Trophy,
  config:      Settings,
}
```

### 4.3 Logo SyncLife (Conceito 2 — órbita + estrela dourada)

SVG do mark está em `protótipos/dashboard-v2/icons.jsx` → `SLIcons.logo`. Use sempre como componente React, herda `currentColor` no orbital + amarelo `--sl-gold` fixo na estrela central.

---

## 5. Componentes base

Cada componente abaixo foi prototipado em algum dos 7 protótipos. **Use-os como ponto de partida.**

### 5.1 Layout primitives

#### `<SLCard>`
Container base. Background `--sl-s1`, borda `--sl-border`, radius 16px.
```tsx
<SLCard hover={true}>
  {/* conteúdo */}
</SLCard>
```
Props: `hover?`, `hero?` (usa `--sl-s-hero` + ruído), `noPadding?`

#### `<KpiCard>`
Card de métrica com label + valor + delta.
```tsx
<KpiCard
  label="Saldo do mês"
  value="R$ 1.840,00"
  delta="+12% vs anterior"
  deltaType="up"  // up | down | warn | neutral
  accent="var(--sl-em)"
  icon={Wallet}
/>
```

### 5.2 Form primitives

| Componente | Props principais | Onde foi prototipado |
|---|---|---|
| `<TextField>` | `label, value, placeholder, hint, type, readOnly, prefix, suffix` | Configurações |
| `<SelectField>` | `label, value, options` | Configurações |
| `<ToggleRow>` | `label, sub, defaultOn` | Configurações |
| `<AuthField>` | (variante simplificada de TextField pra Login/Cadastro) | Auth |

**Regras gerais de form:**
- Background do input: `--sl-s2`
- Border: `--sl-border` em rest, `--sl-em` em focus, `--sl-danger` em erro
- Radius: `--r-md` (12px)
- Padding: `9-11px 14px`
- Label sempre acima do input
- Hint texto pequeno (`--text-sm`) abaixo, `--sl-t3`

### 5.3 Botões

```css
.btn-primary   /* bg --sl-em, color #0B0F14, peso 700, sombra suave */
.btn-secondary /* bg --sl-s2, color --sl-t1, border --sl-border */
.btn-ghost     /* transparent, border --sl-border, color --sl-t2 */
.btn-danger    /* bg rgba(--sl-danger, 0.10), color --sl-danger */
.btn-icon      /* 36×36 square, ícone centralizado */
```

Tamanhos: `.btn-sm` (padding 6×12, font 12), default (10×18, font 13), `.btn-lg` (14×22, font 15).

> **Regra de gradient:** NUNCA em botões. Gradient `--sl-grad` é APENAS para logo + anel de meta.

### 5.4 Indicadores

#### `<ProgressBar>`
```tsx
<ProgressBar
  value={68}
  variant="budget"  // budget | goal | habit
  height="5px"
/>
```
Regra de cor: `<=70% → success` · `70-85% → warning` · `>85% → danger` · `goal → --sl-grad`.

#### `<RingProgress>`
Anel SVG, raio configurável. **Sempre usa `--sl-grad`** (único uso permitido fora do logo).

#### `<Sparkline>`
Linha SVG + área com gradient sob a linha. Tooltip ao hover (G-01).

#### `<ChartTooltip>` — padrão obrigatório (Regra G-01)
**Todo** gráfico tem tooltip ao hover. Fundo `--sl-s-hero`, border `--sl-border-h`, padding 9×13, shadow longo. Conteúdo estruturado: título → linhas chave/valor → linha de total quando faz sentido.

### 5.5 Chips, pills, badges

| Componente | Uso |
|---|---|
| `<StatusTag>` | `green/red/yellow/blue/cyan/orange/gray` — chip pequeno com border + bg translúcido |
| `<DomainChip>` | Pill com dot colorido + nome do módulo |
| `<RarityPill>` | `comum/rara/épica/lendária` (Conquistas) |
| `<KbdChip>` | Atalho de teclado (`⌘K`, `↵`, `esc`) — IBM Plex Mono |
| `<StreakBadge>` | Chama 🔥 (ícone Lucide `Flame`) + N dias |

### 5.6 Layout shells

| Componente | Uso |
|---|---|
| `<ModuleRail>` | Sidebar esquerda 60px, ícones verticais dos 11 módulos. Item ativo: `border-left 2px` na cor do módulo |
| `<SubNav>` | Sidebar interna 240px com mini-card no topo (KPI âncora do módulo) + lista de sub-rotas |
| `<TopBar>` (desktop) | Header com data eyebrow + saudação h1 + ações + sino |
| `<MobileTabBar>` | Pill flutuante com 5 tabs (Home, Finanças, +, Tempo, Mais) |

### 5.7 Composições especializadas

| Componente | Uso |
|---|---|
| `<HeroScore>` | Card hero com score em fonte gigante + sparkline + pill (Panorama) |
| `<HeroLevel>` | Variação com ring SVG + nível + XP (Conquistas) |
| `<ProfileHero>` | Hero com avatar gradient + nome + meta info (Configurações) |
| `<ConsultorIA>` | Card com 4 insight tiles + chat input (Finanças, Dashboard) |
| `<SaveBar>` | Pill sticky no rodapé "Você tem N alterações" + Descartar/Salvar |
| `<DangerZone>` | Card com borda vermelha + 2 ações destrutivas (Configurações) |
| `<BottomSheet>` | Sheet mobile com handle + content (Captura, Picker) |

---

## 6. Padrões de composição

Toda tela do SyncLife cai em **um destes 6 padrões**. Use o protótipo correspondente como blueprint.

### 6.1 `Overview com KPIs` (blueprint: Dashboard)
```
┌─ TopBar ─────────────────────────────┐
│ ┌─ Hero (1 elemento focal) ────────┐ │
│ │ Score/level + sparkline + pill   │ │
│ └──────────────────────────────────┘ │
│ ┌─ Mosaic (grid 4×N módulos/áreas)─┐ │
│ ├─ KPI strip (4 cols)             ─┤ │
│ ├─ Grid 1.4fr / 1fr (LEFT + RIGHT)─┤ │
│ │   LEFT: lista densa + IA         │ │
│ │   RIGHT: 2-3 cards laterais      │ │
└──┴──────────────────────────────────┘
```
**Aplica em:** Panorama, Corpo dashboard, Patrimônio dashboard, Mente dashboard

### 6.2 `Módulo denso com IA` (blueprint: Finanças)
```
TopBar com navegador de período + CTA "+ Nova X"
↓
4 KPI cards (com pill de status quando relevante)
↓
Saúde do módulo (alerta horizontal com eyebrow)
↓
Consultor IA (card hero com 4 insight tiles + ask input)
↓
2 charts side-by-side (1.4fr / 1fr)
↓
Chart full-width (timeline dia-a-dia)
```
**Aplica em:** Visão geral de Finanças, Tempo, Patrimônio, Experiências

### 6.3 `Lista + filtros` (variação de Finanças)
```
Header + filtros (pill group + date range)
↓
Tabela ou lista de cards
↓
Paginação ou scroll infinito
```
**Aplica em:** Transações, Recorrentes, Orçamentos, Calendário, Atividades, Viagens, Memórias, Habilidades, Histórico

### 6.4 `Form-heavy` (blueprint: Configurações)
```
TopBar
↓
Hero opcional (profile, contexto)
↓
Cards numerados (01 · IDENTIDADE, 02 · ...)
  - SectionHeader (eyebrow + título + sub)
  - Form fields em grid 1fr ou 1fr/1fr
↓
DangerZone (se aplicável)
↓
SaveBar sticky no bottom
```
**Aplica em:** Configurações (todas as sub), Nova viagem, Cardápio Wizard, Onboarding, Edição de meta

### 6.5 `Emocional/gamificação` (blueprint: Conquistas)
```
HeroLevel (ring + nível + próximo desbloqueio)
↓
4 KPI cards de gamificação
↓
Recém-conquistadas (3 cards horizontais)
↓
Progresso/Ranking (2 cols)
↓
Coleção full-width (grid 6 cols com filtros)
```
**Aplica em:** Conquistas, Ranking, Coach IA, Review semanal

### 6.6 `Marketing/público` (blueprint: Landing + Auth)
```
TopNav sticky com blur
↓
Hero (headline gigante + sub + CTAs + mockup 3D)
↓
Social proof (logos, números)
↓
Seções de feature em grid (cards)
↓
Card hero featured (ex: IA section)
↓
Pricing (2-3 planos)
↓
FAQ (acordeão)
↓
CTA final
↓
Footer (5 colunas)
```
**Aplica em:** Landing, Pricing, Forgot password, Onboarding inicial

---

## 7. Matriz das 45 telas

| Tela | Rota | Padrão | Componentes-chave | Notas |
|---|---|---|---|---|
| Panorama | `/dashboard` | 6.1 Overview | `HeroScore`, `ModuleMosaic`, `FinancialStrip`, `BudgetsCard`, `InsightCard`, `MetasCard`, `AgendaCard`, `DestaquesCard` | ✅ Prototipado |
| Coach IA (cross) | `/coach` | 6.5 Emocional | `ConsultorIA` expandido + lista de conversas | Padrão de chat à la ChatGPT |
| Review semanal | `/dashboard/review` | 6.5 Emocional | `HeroLevel` adaptado + cards por dia | Storytelling, não dashboard |
| Life Score detail | `/dashboard/score` | 6.1 Overview | `HeroScore` grande + breakdown 8 dimensões | |
| **Finanças — Visão** | `/financas` | 6.2 Denso+IA | `FinKpiStrip`, `SaudeAlerta`, `ConsultorIA`, `HistoricoChart`, `GastosCategoria`, `FluxoCaixa` | ✅ Prototipado |
| Transações | `/financas/transacoes` | 6.3 Lista | Filtros (pill group) + linha por transação + categoria chip | |
| Recorrentes | `/financas/recorrentes` | 6.3 Lista | Status pills (ativa/pausada) + frequência | |
| Orçamentos | `/financas/orcamentos` | 6.3 Lista | Cards de categoria com ProgressBar (regra de cor) | |
| Calendário | `/financas/calendario` | Customizado (calendar grid) | Calendário grande com transações por dia | Único caso especial |
| Planejamento | `/financas/planejamento` | 6.2 Denso+IA | KPIs projetados + scenarios pill group | |
| Relatórios | `/financas/relatorios` | 6.1 Overview | Cards de relatório + botão "Gerar PDF" | |
| Importar | `/financas/importar` | 6.4 Form-heavy | Steps (upload → mapear → confirmar) | |
| **Futuro** | `/futuro` | 6.1 Overview | Grid 3 cols de metas com `RingProgress` + filtros | Adaptar do MetasCard |
| **Tempo** | `/tempo` | 6.2 Denso+IA | Calendário semana + blocos foco + agenda | |
| Foco (Pomodoro) | `/tempo/foco` | Customizado (timer) | Timer grande + lista de sessões | Único caso especial |
| **Corpo** | `/corpo` | 6.1 Overview | KPIs (steps, sono, peso) + atividades semana | |
| Atividades | `/corpo/atividades` | 6.3 Lista | Lista de atividades por tipo | |
| Cardápio IA | `/corpo/cardapio` | 6.4 Form-heavy | Wizard 4 passos + cards de refeição | |
| Peso | `/corpo/peso` | 6.1 Overview | Chart de evolução + KPIs (atual, meta, IMC) | |
| Saúde | `/corpo/saude` | 6.1 Overview | KPIs de saúde + agenda médica | |
| **Mente** | `/mente` | 6.1 Overview | Trilhas em andamento + biblioteca + timer | |
| **Patrimônio** | `/patrimonio` | 6.2 Denso+IA | KPIs + carteira chart + proventos | |
| **Carreira** | `/carreira` | 6.1 Overview | KPIs profissionais + roadmap visual | |
| Perfil | `/carreira/perfil` | 6.4 Form-heavy | Idêntico a Config/Perfil | |
| Habilidades | `/carreira/habilidades` | 6.3 Lista | Cards de skill com nível (1-5) | |
| Histórico | `/carreira/historico` | 6.3 Lista | Timeline vertical de experiências | |
| Roadmap | `/carreira/roadmap` | Customizado (timeline) | Linha temporal de objetivos | |
| **Experiências** | `/experiencias` | 6.1 Overview | Próxima viagem hero + lista de viagens | |
| Viagens | `/experiencias/viagens` | 6.3 Lista | Cards de viagem com status + destino | |
| Viagem detalhe | `/experiencias/viagens/[id]` | Customizado | Hero da viagem + dias + checklist | |
| Nova viagem | `/experiencias/nova` | 6.4 Form-heavy | Wizard de criação | |
| Bucket list | `/experiencias/bucket-list` | 6.3 Lista | Lista checkable | |
| Memórias | `/experiencias/memorias` | 6.3 Lista | Cards com foto + descrição | |
| Passaporte | `/experiencias/passaporte` | 6.1 Overview | Stats de países visitados + mapa | |
| **Conquistas** | `/conquistas` | 6.5 Emocional | `HeroLevel`, `ConqKpiStrip`, `RecentBadges`, `BadgeCollection`, `ProgressByCategory`, `RankingPreview` | ✅ Prototipado |
| Ranking | `/conquistas/ranking` | 6.5 Emocional | Top 10 + você + filtros (BR/Amigos) | |
| **Configurações** | `/configuracoes` | 6.4 Form-heavy | `ProfileHero`, `FormCard`, `SectionHeader`, `TextField`, `ToggleRow`, `SaveBar`, `DangerZone` | ✅ Prototipado (Perfil) |
| Aparência | `/configuracoes/aparencia` | 6.4 Form-heavy | Theme picker (4 temas) + accent picker | |
| Categorias | `/configuracoes/categorias` | 6.3 Lista | Lista editável de categorias com cor | |
| Notificações | `/configuracoes/notificacoes` | 6.4 Form-heavy | Lista de toggles por tipo | |
| Integrações | `/configuracoes/integracoes` | 6.3 Lista | Cards de integração com status (Google Calendar, etc) | |
| Plano | `/configuracoes/plano` | Customizado | Card grande do plano atual + comparação | |
| **Landing** | `/` | 6.6 Marketing | ✅ Prototipado | |
| Pricing | `/pricing` | 6.6 Marketing | Reaproveitar seção `Pricing` da landing | |
| **Login** | `/login` | 6.6 Marketing | `BrandSide`, `LoginForm` | ✅ Prototipado |
| **Cadastro** | `/cadastro` | 6.6 Marketing | `BrandSide`, `RegisterForm` | ✅ Prototipado |
| Forgot password | `/forgot-password` | 6.6 Marketing | Mesma estrutura do Login com 1 campo | |
| Onboarding | `/onboarding` | 6.4 Form-heavy | Wizard com steps (perfil, módulos, primeiro registro) | |

**Total:** 45 telas. 7 prototipadas (✅). 38 cobertas por padrões.

---

## 8. Regras de copy

### 8.1 Tom
- **Você**, nunca "o usuário"
- **Nós** apenas quando SyncLife faz algo pelo usuário
- **Nunca eu** (sem persona de chatbot)
- **Sentence case** em tudo (botões, headings)
- Sem **emoji** em chrome

### 8.2 Pontuação
- ❌ **Travessão (—) proibido na copy** (é o tell de "AI-generated")
- ✅ Use vírgula, ponto, dois-pontos, ou `·` (middle dot) em eyebrows
- En-dash (–) permitido em valores negativos: `– R$ 320,00`

### 8.3 Microcopy
| Don't | Do |
|---|---|
| "Great! Your task is saved! ✅" | "Salvo." |
| "Welcome back, User!" | "Sábado, 23 maio." |
| "ERROR: validation failed" | "Faltou preencher o e-mail." |
| "Add Your First Habit To Get Started!" | "Comece registrando algo do seu dia." |

### 8.4 Valores
Sempre máscara completa (§ 3.4). Tabular-nums (§ 3.3).

---

## 9. Regras visuais

### G-01 — Tooltips obrigatórias em gráficos
Todo gráfico (barras, linhas, donut, pie, area, sparkline interativa) **DEVE** ter tooltip ao hover. Use `<ChartTooltip>` (§ 5.4).

### G-02 — Mono APENAS pra timestamps e código
IBM Plex Mono está reservado pra: hora (`21:14`), IDs (`#a4f...`), código inline. Valores monetários/%/contagens usam Space Grotesk + tabular-nums (`.sl-num` ou `.sl-num-strong`).

### G-03 — Gradient só em logo e ring de meta
`--sl-grad` é proibido em: botões, backgrounds, page titles, scores, eyebrows. Permitido em: logo SVG, ring de meta SVG.

### G-04 — Scroll invisível em mobile
Containers dentro de bezel de dispositivo recebem `.phone-scroll`:
```css
.phone-scroll { scrollbar-width: none; }
.phone-scroll::-webkit-scrollbar { display: none; }
```
Desktop mantém scrollbar fina (6-8px).

### G-05 — Hierarquia: UM hero por tela
Toda tela tem **um** card hero (rounded-2xl, padding maior, possível ruído sutil). Demais cards usam rounded-xl, padding menor.

### G-06 — Cor de domínio é identificação, não accent
Cores de módulo (--sl-mod-X) só aparecem em: ícones do módulo, dots de identificação, bordas de KPI cards do módulo. CTAs e accent visual usam `--sl-em`.

### G-07 — Sem ícone "🔒" pra locked state
Estado bloqueado em badges/features: opacity 40% + grayscale + ícone `✕` pequeno no canto inferior direito. NÃO usar emoji 🔒.

### G-08 — SaveBar sticky em todo form com edição
Tela com edição mostra `<SaveBar>` sticky no bottom QUANDO houver alterações não salvas. Persiste até salvar/descartar.

### G-09 — Eyebrows numerados em formulários longos
Forms com >3 seções: numere os eyebrows ("01 · IDENTIDADE", "02 · LOCALIDADE"). Cor `--sl-em`.

### G-10 — Logo: petrol stroke + estrela dourada
SVG do mark herda `currentColor` no orbital (petrol em dark, navy em light) + amarelo `--sl-gold` fixo na estrela central. Nunca trocar o gold por outra cor.

---

## 10. Migração v2 → v3

Mapping de tokens antigos para novos. Use isso na branch `redesign/visual-refresh-v3`.

### 10.1 Cores

| v2 (app atual) | v3 (este sistema) |
|---|---|
| `--em: #10b981` | `--sl-em: #0F766E` |
| `--el: #0055ff` | `--sl-el: #0B2D34` |
| `--grad: 135deg #10b981→#0055ff` | `--sl-grad: 135deg #0F766E→#0B2D34` |
| 12 temas (`navy-dark`, `obsidian`, `rosewood`, etc) | **4 temas** (`navy-deep`, `midnight`, `charcoal`, `cream`) |
| Cores de status saturadas | Mesmas dessaturadas ~15-20% |
| `--bg: #03071a` | `--sl-bg: #0B0F14` (mais respirável) |
| Módulos com cores saturadas | Mesmas dessaturadas (§ 2.2) |

### 10.2 Tipografia

| v2 | v3 |
|---|---|
| Syne (display) | **Space Grotesk** (display) |
| Outfit (body desktop) | **DM Sans** (body unificado) |
| DM Sans (body mobile) | **DM Sans** (mesmo) |
| DM Mono (mono) | **IBM Plex Mono** (zero sem corte) |

### 10.3 Iconografia

| v2 | v3 |
|---|---|
| Emojis (🐷🎯📅) | **Lucide React** (Wallet/Target/Calendar) |
| Logo SyncLife antigo | **Logo orbital** (órbita pontilhada + estrela dourada) |

### 10.4 Componentes (mapping de classes/funções)

| v2 | v3 |
|---|---|
| `.card` | `<SLCard>` |
| `.kpi-card` | `<KpiCard>` |
| `.progress-bg` + `.progress-fill.{ok/warn/over/goal}` | `<ProgressBar variant={budget/goal/habit}>` |
| Ring SVG manual | `<RingProgress>` |
| `.btn-primary` (com gradient) | `<button>` com `--sl-em` sólido |
| `body.jornada` (legado) | Removido (já feito em v2) |

### 10.5 Anatomia de tela

A anatomia v2 (topbar → sum-strip → conteúdo → bottom-grid) continua válida, **mas:**
- `sum-strip` vira `<KpiStrip>` componente
- `bottom-grid` vira parte do conteúdo no padrão correto (§ 6)
- Espaçamentos aumentam ~50% (`--sp-4 → --sp-6` em gaps principais)

---

## 11. Roadmap UX v3.1

Itens identificados na avaliação UX (mar/2026) que ficaram fora do escopo dos protótipos. Implementar depois do design system estável.

| # | Item | Impacto | Esforço |
|---|---|---|---|
| 1 | **Captura global (`⌘K` + FAB onipresente)** | 🔥🔥🔥🔥🔥 | M |
| 2 | **Cross-module storytelling** (cards de conexão) | 🔥🔥🔥🔥 | G |
| 3 | **Empty states elegantes** em todos os widgets | 🔥🔥🔥🔥🔥 | M |
| 4 | **Edição inline** (clicar valor edita direto) | 🔥🔥🔥🔥 | M |
| 5 | **Hierarquia adaptativa** (módulos ascendem por uso) | 🔥🔥🔥 | G |
| 6 | **Notification drawer** (sino → painel lateral) | 🔥🔥🔥🔥 | M |
| 7 | **Atalhos de teclado documentados** + cheat sheet (`?`) | 🔥🔥🔥 | M |
| 8 | **Filtro de período unificado** em Finanças | 🔥🔥🔥 | P |
| 9 | **NextActions card** abaixo do Hero do Dashboard | 🔥🔥🔥🔥 | M |
| 10 | **Mobile drill-down completo** (todas as telas mobile) | 🔥🔥🔥🔥 | G |

---

## Arquivos relacionados

- `tokens-v3.css` — todos os tokens CSS prontos pra import
- `prototypes/dashboard-v2/` → padrão 6.1 + componentes base
- `prototypes/financas/` → padrão 6.2 + componentes financeiros + charts
- `prototypes/conquistas/` → padrão 6.5 + componentes de gamificação
- `prototypes/configuracoes/` → padrão 6.4 + form primitives
- `prototypes/mobile/` → padrões mobile + tab bar + mais menu
- `prototypes/landing/` → padrão 6.6 marketing
- `prototypes/auth/` → padrão 6.6 auth

---

**SyncLife Design System v3 · mar/2026**
*Atualizar este documento ao criar novos padrões ou alterar tokens.*
