# 15 — AUTH & ONBOARDING: Especificação Completa para Desenvolvimento

**Documento de referência para implementação em Next.js**
**Protótipos aprovados:** `proto-auth.html` · `proto-onboarding.html`
**Dependências:** Navegação (1.1) para o Onboarding; nenhuma para Auth
**Prioridade:** Máxima — são as portas de entrada da aplicação
**Fase:** 1.4 (Auth) e 1.2 (Onboarding) do roadmap MVP v2

---

## ÍNDICE

1. [Visão Geral e Contexto](#1-visão-geral-e-contexto)
2. [Stack Técnica e Dependências](#2-stack-técnica-e-dependências)
3. [Design System: Tokens Obrigatórios](#3-design-system-tokens-obrigatórios)
4. [Tipografia](#4-tipografia)
5. [Estrutura de Arquivos](#5-estrutura-de-arquivos)
6. [Schema do Banco de Dados](#6-schema-do-banco-de-dados)
7. [TELA: Login](#7-tela-login)
8. [TELA: Cadastro](#8-tela-cadastro)
9. [TELA: Recuperar Senha](#9-tela-recuperar-senha)
10. [TELA: Onboarding](#10-tela-onboarding)
11. [Middleware e Proteção de Rotas](#11-middleware-e-proteção-de-rotas)
12. [Fluxo Completo do Usuário](#12-fluxo-completo-do-usuário)
13. [Responsividade](#13-responsividade)
14. [Animações e Transições](#14-animações-e-transições)
15. [Acessibilidade](#15-acessibilidade)
16. [Validações e Regras de Negócio](#16-validações-e-regras-de-negócio)
17. [Integração com Supabase Auth](#17-integração-com-supabase-auth)
18. [Tratamento de Erros](#18-tratamento-de-erros)
19. [Performance e SEO](#19-performance-e-seo)
20. [Benchmark e Diferenciais Competitivos](#20-benchmark-e-diferenciais-competitivos)
21. [Atividades para o Claude Code](#21-atividades-para-o-claude-code)

---

## 1. VISÃO GERAL E CONTEXTO

### O que são estas telas

As telas de Auth (Login, Cadastro, Recuperar Senha) e Onboarding são as **primeiras telas que qualquer usuário do SyncLife vê ao decidir usar o produto**. Elas são a ponte entre a Landing Page (que vende o produto) e o Dashboard (onde o produto realmente é usado).

Pense nelas como a "porta de entrada" de uma loja. Se a porta for feia, confusa ou difícil de abrir, o cliente desiste antes de ver os produtos. Por isso, essas telas precisam ser impecáveis em design, performance e usabilidade.

### Por que refatorar (não criar do zero)

O MVP v1 já tem telas de auth funcionais (`/login`, `/cadastro`, `/esqueceu-senha`), mas elas usam o design antigo (slate/cinza, sem split-screen, sem os tokens da paleta Esmeralda). O objetivo é **substituí-las** pelo novo design aprovado nos protótipos, mantendo a lógica de integração com Supabase que já funciona.

### Fluxo macro do usuário

```
Landing Page → [Começar grátis] → Cadastro → Verificação de e-mail → Login → Onboarding (5 steps) → Dashboard
                                                                               ↑
                                                                    (só acontece 1x)
```

Usuário recorrente:
```
Landing Page → [Entrar] → Login → Dashboard
```

### O que muda vs. MVP v1

| Aspecto | MVP v1 (atual) | MVP v2 (novo) |
|---------|----------------|---------------|
| Layout do Auth | Coluna única centralizada, fundo escuro genérico | Split-screen no desktop (visual + form), coluna única no mobile |
| Paleta de cores | Slate (#0a0a0a, #111111) | Navy Esmeralda (#03071a, #07112b, #10b981) |
| Tipografia | System fonts + Inter | Syne (títulos) + DM Sans (corpo) + DM Mono (dados) |
| Onboarding | Não existe | Fluxo completo de 5 steps |
| Modo Foco/Jornada | Existe mas é escolhido em Configurações | Escolhido no Onboarding (Step 3) |
| Força da senha | Não mostra | Barra visual de 4 segmentos (Fraca/Média/Forte) |
| Painel visual (auth) | Não existe | Painel esquerdo com branding, stats e mini dashboard |
| Recuperar Senha | Página simples com campo de email | Wizard de 4 steps com feedback visual |

---

## 2. STACK TÉCNICA E DEPENDÊNCIAS

### Framework e Runtime
- **Next.js 16** com App Router
- **React 19**
- **TypeScript** (strict mode)

### Dependências Necessárias

| Dependência | Versão | Uso |
|-------------|--------|-----|
| `@supabase/ssr` | latest | Auth SSR (cookies) |
| `@supabase/supabase-js` | latest | Client-side auth |
| `next/font/google` | built-in | Syne, DM Sans, DM Mono |
| `lucide-react` | ^0.263 | Ícones SVG (Mail, Lock, Eye, EyeOff, ArrowRight, User, ChevronLeft, AlertCircle, Check) |
| `tailwindcss` | v4 | Estilização |
| `sonner` ou `react-hot-toast` | latest | Toasts de feedback |
| `zod` | latest | Validação de formulários |
| `react-hook-form` | latest | Gerenciamento de formulários (opcional, pode usar state) |

### O que NÃO usar
- **shadcn/ui** nas telas de Auth — os componentes são custom com CSS puro para reproduzir exatamente o protótipo. O shadcn/ui pode ser usado internamente nas telas do app (Dashboard, etc.), mas nas telas de auth o design é 100% custom.
- **Framer Motion** nas telas de Auth — animações são CSS puro (`@keyframes`). Framer Motion é reservado para o app principal (modo Jornada).

---

## 3. DESIGN SYSTEM: TOKENS OBRIGATÓRIOS

**Regra absoluta:** Nenhuma cor, fonte ou espaçamento pode ser hardcoded. Tudo usa variáveis CSS ou classes Tailwind mapeadas para variáveis.

### 3.1 Paleta de Cores (Dark Navy — Auth é fixo em dark)

```css
:root {
  /* Backgrounds (navy profundo) */
  --bg:       #03071a;     /* fundo principal da página */
  --s1:       #07112b;     /* surface 1: painel esquerdo, cards */
  --s2:       #0c1a3a;     /* surface 2: inputs, campos de form */
  --s3:       #132248;     /* surface 3: hover states */

  /* Borders */
  --border:   rgba(255,255,255,0.06);   /* borda padrão sutil */
  --border-h: rgba(255,255,255,0.13);   /* borda hover */
  --border-focus: rgba(16,185,129,0.5); /* borda focus (esmeralda) */

  /* Textos */
  --t1:  #dff0ff;    /* texto primário: títulos, nomes */
  --t2:  #6e90b8;    /* texto secundário: descrições, subtítulos */
  --t3:  #2e4a6e;    /* texto terciário: labels, placeholders, hints */

  /* Brand */
  --em:     #10b981;    /* Esmeralda — CTA principal, links */
  --el:     #0055ff;    /* Electric Blue — acentos secundários */

  /* Semânticas */
  --green:  #10b981;    /* sucesso, "forte" */
  --yellow: #f59e0b;    /* alerta, "média" */
  --red:    #f43f5e;    /* erro, "fraca" */
}
```

### 3.2 Gradientes

| Nome | CSS | Onde |
|------|-----|------|
| `grad-hero` | `linear-gradient(135deg, #10b981, #06b6d4, #0055ff)` | Texto "sincronia." no painel esquerdo |
| `grad-brand` | `linear-gradient(135deg, #10b981, #0055ff)` | Stats numéricas, score no mini card |
| `grad-btn-hover` | `box-shadow: 0 8px 24px rgba(16,185,129,0.3)` | Hover do botão primário |

### 3.3 Efeitos Visuais (Painel Esquerdo)

- **Orbs de fundo:** Dois círculos com `filter: blur(80px)` e opacidade baixa (~0.07-0.08), um esmeralda (canto superior esquerdo) e um azul (canto inferior direito)
- **Grid pattern:** Linhas de 40x40px com `rgba(255,255,255,0.02)`, posição absoluta cobrindo todo o painel
- **Border-right:** `1px solid var(--border)` separando os dois painéis

### 3.4 Radii

| Elemento | Radius |
|----------|--------|
| Inputs | `10px` |
| Cards | `16px` |
| Botão primário | `100px` (pill) |
| Botão Google | `100px` (pill) |
| Checkbox | `5px` |
| Success icon circle | `50%` |
| Step dots (onboarding) | `50%` |
| Mode cards (onboarding) | `16px` |
| Momento cards (onboarding) | `14px` |
| Step card (onboarding) | `24px` |

---

## 4. TIPOGRAFIA

### Famílias (importar via `next/font/google`)

```typescript
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})
```

### Uso por Elemento

| Elemento | Família | Peso | Tamanho | Cor |
|----------|---------|------|---------|-----|
| **Auth — Título do form** ("Bem-vindo de volta.") | Syne | 800 | 28px | `--t1` |
| **Auth — Subtítulo do form** | DM Sans | 400 | 14px | `--t2` |
| **Auth — Labels de input** | DM Sans | 500 | 13px | `--t2` |
| **Auth — Input text** | DM Sans | 400 | 14px | `--t1` |
| **Auth — Placeholder** | DM Sans | 400 | 14px | `--t3` |
| **Auth — Botão primário** | DM Sans | 700 | 15px | `#03071a` (fundo escuro) |
| **Auth — Botão Google** | DM Sans | 500 | 14px | `--t2` |
| **Auth — Links** | DM Sans | 500 | 13px | `--em` |
| **Auth — Erros de campo** | DM Sans | 400 | 12px | `--red` |
| **Auth — Hint de campo** | DM Sans | 400 | 12px | `--t3` |
| **Auth — Força da senha (label)** | DM Sans | 400 | 11px | varia |
| **Auth — Checkbox label** | DM Sans | 400 | 13px | `--t2` |
| **Painel esquerdo — Headline** | Syne | 800 | clamp(28px, 3vw, 40px) | `--t1` |
| **Painel esquerdo — Stats número** | Syne | 800 | 26px | gradiente |
| **Painel esquerdo — Stats label** | DM Sans | 400 | 12px | `--t3` |
| **Painel esquerdo — Card título** | Syne | 700 | 13px | `--t1` |
| **Painel esquerdo — Card valores** | DM Mono | 500 | 12px | varia |
| **Painel esquerdo — Quote** | DM Sans | 400 italic | 13px | `--t3` |
| **Onboarding — Step title** | Syne | 800 | clamp(22px, 3vw, 30px) | `--t1` |
| **Onboarding — Step sub** | DM Sans | 400 | 15px | `--t2` |
| **Onboarding — Eyebrow** | DM Sans | 700 | 11px | `--mode-accent` |
| **Onboarding — Name input** | Syne | 700 | 22px | `--t1` |
| **Onboarding — Botão next** | DM Sans | 700 | 15px | `#03071a` |
| **Onboarding — Botão back** | DM Sans | 400 | 14px | `--t3` |
| **Onboarding — Progress labels** | DM Sans | 400 | 10px | `--t3` |

---

## 5. ESTRUTURA DE ARQUIVOS

```
src/app/
├── (auth)/                           ← Route group sem layout do app
│   ├── layout.tsx                    ← Layout compartilhado das telas de auth
│   ├── login/
│   │   └── page.tsx                  ← Tela de Login
│   ├── cadastro/
│   │   └── page.tsx                  ← Tela de Cadastro
│   └── esqueceu-senha/
│       └── page.tsx                  ← Tela de Recuperar Senha (4 steps)
│
├── onboarding/
│   ├── layout.tsx                    ← Layout do Onboarding (sem sidebar do app)
│   └── page.tsx                      ← Wizard de 5 steps
│
├── auth/
│   └── callback/
│       └── route.ts                  ← OAuth callback handler (Google)
│   └── confirm/
│       └── route.ts                  ← Email confirmation handler
│
src/components/
├── auth/
│   ├── AuthShell.tsx                 ← Container split-screen (painel esquerdo + direito)
│   ├── AuthLeftPanel.tsx             ← Painel visual esquerdo com branding
│   ├── LoginForm.tsx                 ← Formulário de login
│   ├── CadastroForm.tsx              ← Formulário de cadastro
│   ├── ResetPasswordWizard.tsx       ← Wizard de 4 steps para reset
│   ├── PasswordStrengthMeter.tsx     ← Componente da barra de força de senha
│   ├── GoogleAuthButton.tsx          ← Botão "Continuar com Google"
│   ├── AuthDivider.tsx               ← Divisor "ou entre com e-mail"
│   └── AuthInput.tsx                 ← Input estilizado (ícone + toggle senha)
│
├── onboarding/
│   ├── OnboardingShell.tsx           ← Container geral (topbar + progress + card)
│   ├── OnboardingProgress.tsx        ← Barra de progresso com dots e labels
│   ├── StepNome.tsx                  ← Step 1: Nome do usuário
│   ├── StepMomento.tsx               ← Step 2: Momento de vida (multi-select)
│   ├── StepModo.tsx                  ← Step 3: Foco vs Jornada
│   ├── StepAreas.tsx                 ← Step 4: Módulos/áreas da vida
│   ├── StepResumo.tsx                ← Step 5: Resumo + CTA final
│   └── ConfettiEffect.tsx            ← Animação de confetti (modo Jornada)
│
src/lib/
├── validations/
│   └── auth.ts                       ← Schemas Zod para validação de forms
├── supabase/
│   ├── client.ts                     ← createBrowserClient()
│   ├── server.ts                     ← createServerClient()
│   └── middleware.ts                 ← updateSession()
│
src/styles/
└── auth.css                          ← CSS específico das telas de auth (variáveis + custom styles)
```

### Por que esta estrutura

- **Route group `(auth)`**: permite que Login, Cadastro e Esqueceu Senha compartilhem um layout próprio (sem sidebar, sem header do app) sem afetar as rotas `/login`, `/cadastro`, `/esqueceu-senha` que já existem
- **Componentes separados por domínio**: cada tela é um `page.tsx` magro que orquestra componentes. Isso facilita testes e manutenção
- **CSS próprio**: `auth.css` contém as custom properties e estilos que não fazem sentido como classes Tailwind (gradientes complexos, orbs, grid pattern)

---

## 6. SCHEMA DO BANCO DE DADOS

### Tabela `profiles` (campos relevantes)

```sql
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    mode TEXT DEFAULT 'focus' CHECK (mode IN ('focus', 'journey')),
    currency TEXT DEFAULT 'BRL',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    monthly_income DECIMAL(12,2),          -- adicionado no MVP v2
    life_moments TEXT[],                   -- NOVO: array com até 3 momentos de vida selecionados
    active_modules TEXT[] DEFAULT '{financas}', -- NOVO: módulos ativos do usuário
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migração necessária (adicionar colunas novas)

```sql
-- Rodar no SQL Editor do Supabase ANTES de implementar o onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS life_moments TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_modules TEXT[] DEFAULT '{financas}';
```

### Trigger existente (manter como está)

O trigger `on_auth_user_created` já cria automaticamente um registro em `profiles` quando um usuário se cadastra via Supabase Auth. Ele seta `full_name` a partir de `raw_user_meta_data->>'full_name'`. Os demais campos ficam com valores default.

---

## 7. TELA: LOGIN

### 7.1 Visão Geral

A tela de login é a entrada principal para usuários que já possuem conta. Ela usa um layout **split-screen** no desktop (painel visual à esquerda + formulário à direita) e **coluna única** no mobile (painel esquerdo desaparece).

### 7.2 Layout Desktop (acima de 900px)

```
┌─────────────────────────────────┬──────────────────────────────┐
│                                 │                              │
│         PAINEL ESQUERDO         │        PAINEL DIREITO        │
│         (branding visual)       │        (formulário)          │
│                                 │                              │
│   [Logo SyncLife centralizado]  │   "Bem-vindo de volta."      │
│                                 │   "Entre na sua conta..."    │
│   "Sua vida em                  │                              │
│    sincronia."   ← gradiente    │   [Continuar com Google]     │
│                                 │                              │
│   "Finanças, metas e agenda..." │   ── ou entre com e-mail ── │
│                                 │                              │
│   3 módulos  2 modos  100 pts   │   E-mail: [___________]     │
│                                 │   Senha:  [_________👁]     │
│   ┌── Mini Dashboard Card ──┐  │                              │
│   │ Fevereiro 2026 [Jornada]│  │       [Esqueci minha senha]  │
│   │ Score: 74  ↑+3 semana   │  │                              │
│   │ ████████████░░░░░░ 74%  │  │   [    Entrar →           ]  │
│   │ Saldo: +R$ 1.800        │  │                              │
│   │ Meta Viagem: 28%        │  │   Não tem conta? Criar conta │
│   │ Orçamento: ✓ controle   │  │                              │
│   └──────────────────────────┘  │                              │
│                                 │                              │
│   "Finalmente um app que..."    │                              │
│   — Rafael M., usuário beta     │                              │
│                                 │                              │
└─────────────────────────────────┴──────────────────────────────┘
```

### 7.3 Layout Mobile (abaixo de 900px)

```
┌──────────────────────────┐
│                          │
│  "Bem-vindo de volta."   │
│  "Entre na sua conta..." │
│                          │
│  [Continuar com Google]  │
│                          │
│  ── ou entre com e-mail ─│
│                          │
│  E-mail: [____________]  │
│  Senha:  [__________👁]  │
│                          │
│      [Esqueci minha senha│
│                          │
│  [     Entrar →        ] │
│                          │
│  Não tem conta? Criar    │
│                          │
└──────────────────────────┘
```

O painel esquerdo desaparece completamente via `display: none`. O painel direito ocupa 100% da largura com padding `80px 24px 48px` e `max-width: 440px` no container do form.

### 7.4 Painel Esquerdo — Componente `AuthLeftPanel`

Este componente é **compartilhado** entre Login, Cadastro e Recuperar Senha. O conteúdo é sempre o mesmo — é o "cartão de visita" do SyncLife.

#### Estrutura

```
AuthLeftPanel
├── Orb 1 (esmeralda, blur, canto superior esquerdo)
├── Orb 2 (azul, blur, canto inferior direito)
├── Grid pattern (linhas 40x40px, sutis)
├── Logo centralizado no topo (ícone 38px + "SyncLife" texto)
├── Conteúdo central (flex: 1, centralizado verticalmente)
│   ├── Headline: "Sua vida em\n sincronia." (sincronia com gradiente)
│   ├── Subtítulo: "Finanças, metas e agenda integrados..."
│   ├── Stats row (3 itens: módulos, modos, pontos)
│   └── Mini Dashboard Card
│       ├── Header: "Fevereiro 2026" + badge "Modo Jornada"
│       ├── Score: 74 + label + delta "+3 esta semana"
│       ├── Barra de progresso (74%, gradiente)
│       └── Rows: Saldo, Meta Viagem, Orçamento
└── Footer: quote + autor
```

#### CSS do Painel Esquerdo

```css
.auth-left {
  position: relative;
  background: var(--s1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 48px 40px;
  overflow: hidden;
  border-right: 1px solid var(--border);
}

/* Todos os filhos diretos centralizados com max-width */
.auth-left > * {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
}
```

#### Orbs de Fundo

```css
.left-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.left-orb-1 {
  width: 400px; height: 400px;
  background: var(--em);
  opacity: 0.08;
  top: -100px; left: -100px;
}
.left-orb-2 {
  width: 300px; height: 300px;
  background: var(--el);
  opacity: 0.07;
  bottom: -60px; right: -60px;
}
```

#### Grid Pattern

```css
.left-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
}
```

#### Mini Dashboard Card

O mini dashboard card é um componente puramente visual (dados estáticos, sem fetch). Seu propósito é mostrar ao visitante **como o SyncLife se parece por dentro**, criando desejo antes de se cadastrar.

```
┌────────────────────────────────────────────┐
│  Fevereiro 2026              Modo Jornada  │  ← header
│  74  ← score grande (gradiente)            │
│  LIFE SYNC SCORE  ↑ +3 esta semana         │
│  ████████████████████░░░░░░░░░░░░ 74%      │  ← barra
│  Saldo do mês          +R$ 1.800  (verde)  │
│  Meta: Viagem   ████░░░░ 28%  (amarelo)    │
│  Orçamento             ✓ No controle       │
└────────────────────────────────────────────┘
```

### 7.5 Painel Direito — Formulário de Login

#### Componente `LoginForm`

| Elemento | Tipo | Props/Config |
|----------|------|-------------|
| **Título** | `<h2>` | "Bem-vindo de volta." · Syne 800 28px |
| **Subtítulo** | `<p>` | "Entre na sua conta para continuar evoluindo." · DM Sans 14px `--t2` |
| **Botão Google** | `<button>` | Ícone Google SVG + "Continuar com Google" · borda `--border` · pill |
| **Divisor** | `<div>` | Linha + "ou entre com e-mail" + linha |
| **Campo E-mail** | `<input type="email">` | Ícone Mail à esquerda · placeholder "seu@email.com" · autocomplete="email" |
| **Campo Senha** | `<input type="password">` | Ícone Lock à esquerda · toggle Eye/EyeOff à direita · autocomplete="current-password" |
| **Link Esqueci** | `<button>` | "Esqueci minha senha" · alinhado à direita · cor `--em` |
| **Botão Submit** | `<button>` | "Entrar →" · fundo `--em` · texto `#03071a` · pill |
| **Footer** | `<span>` | "Não tem uma conta? Criar conta grátis" · link cor `--em` |

#### CSS dos Inputs

```css
.form-input {
  width: 100%;
  background: var(--s2);                    /* #0c1a3a */
  border: 1px solid var(--border);          /* rgba(255,255,255,0.06) */
  border-radius: 10px;
  padding: 12px 14px 12px 42px;             /* 42px para acomodar ícone */
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: var(--t1);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input::placeholder {
  color: var(--t3);
}

.form-input:focus {
  border-color: rgba(16,185,129,0.5);       /* borda esmeralda */
  box-shadow: 0 0 0 3px rgba(16,185,129,0.1); /* glow sutil */
}

.form-input.error {
  border-color: rgba(244,63,94,0.5);        /* borda vermelha */
  box-shadow: 0 0 0 3px rgba(244,63,94,0.08);
}
```

#### CSS do Botão Primário

```css
.btn-submit {
  width: 100%;
  background: var(--em);                    /* #10b981 */
  color: #03071a;                           /* texto escuro sobre verde */
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px;
  border-radius: 100px;                     /* pill */
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: #0ed99a;                      /* verde mais claro */
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,0.3);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit:disabled,
.btn-submit.loading {
  pointer-events: none;
  opacity: 0.8;
}
```

#### CSS do Botão Google

```css
.btn-google {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t2);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  padding: 13px;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.btn-google:hover {
  border-color: var(--border-h);
  color: var(--t1);
  background: var(--s2);
}
```

### 7.6 Estados do Login

| Estado | Visual | Trigger |
|--------|--------|---------|
| **Idle** | Formulário vazio, botão habilitado | Carga inicial |
| **Validação frontend** | Borda vermelha no campo + mensagem de erro abaixo | Submit sem preencher ou email inválido |
| **Loading** | Texto do botão muda para "Entrando..." · opacity 0.8 · pointer-events none | Submit com dados válidos |
| **Sucesso** | Texto muda para "Entrando... ✓" por 800ms · redirect para /dashboard | Autenticação ok |
| **Erro de credencial** | Toast de erro + campo com borda vermelha + mensagem "Credenciais incorretas" | Supabase retorna erro |
| **Email não confirmado** | Banner amarelo "Seu e-mail ainda não foi confirmado" + botão "Reenviar e-mail" | Supabase retorna email_not_confirmed |

### 7.7 Mensagens de Erro do Login

| Campo | Condição | Mensagem |
|-------|----------|----------|
| E-mail | Vazio ou formato inválido | "E-mail inválido" |
| Senha | Vazio | "Credenciais incorretas" |
| Geral | Supabase error.message | Exibir mensagem do Supabase via toast |
| E-mail não confirmado | `error.message` contém "email_not_confirmed" | Banner com "Reenviar confirmação" |

### 7.8 Lógica de Submit (Login)

```typescript
async function handleLogin(email: string, password: string) {
  // 1. Validar frontend
  if (!email || !isValidEmail(email)) → mostrar erro no campo
  if (!password) → mostrar erro no campo

  // 2. Setar loading
  setIsLoading(true)

  // 3. Chamar Supabase
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 4. Tratar resultado
  if (error) {
    if (error.message.includes('Email not confirmed')) {
      setEmailNotConfirmed(true)
    } else {
      toast.error('Credenciais incorretas')
    }
    return
  }

  // 5. Verificar se onboarding foi concluído
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .single()

  // 6. Redirecionar
  if (!profile?.onboarding_completed) {
    router.push('/onboarding')
  } else {
    router.push('/dashboard')
  }
}
```

---

## 8. TELA: CADASTRO

### 8.1 Visão Geral

A tela de cadastro segue o **mesmo layout split-screen** do login. O painel esquerdo é idêntico (reutiliza `AuthLeftPanel`). O painel direito muda para o formulário de criação de conta.

### 8.2 Campos do Formulário

| # | Campo | Tipo | Placeholder | Ícone | Obrigatório | Validação |
|---|-------|------|-------------|-------|-------------|-----------|
| 1 | Nome completo | `text` | "Seu nome" | User (👤) | Sim (*) | Não vazio, min 2 chars |
| 2 | E-mail | `email` | "seu@email.com" | Mail (✉) | Sim (*) | Formato de e-mail válido |
| 3 | Senha | `password` | "Mínimo 8 caracteres" | Lock (🔒) + toggle 👁 | Sim (*) | Min 8 chars |
| 4 | Confirmar senha | `password` | "Repita a senha" | Lock (🔒) + toggle 👁 | Sim (*) | Deve ser igual à senha |
| 5 | Aceite de termos | `checkbox` | — | Custom checkbox | Sim | Deve estar marcado |

### 8.3 Indicador de Força da Senha

O componente `PasswordStrengthMeter` é exibido abaixo do campo de senha e aparece apenas quando o usuário começa a digitar.

#### Regras de Cálculo do Score

```typescript
function calculateStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++     // comprimento mínimo
  if (password.length >= 12) score++    // comprimento forte
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++ // maiúscula + número
  if (/[^A-Za-z0-9]/.test(password)) score++  // caractere especial
  return score // 0 a 4
}
```

#### Visual

```
┌────┬────┬────┬────┐  Fraca    ← quando score ≤ 1
│████│    │    │    │
└────┴────┴────┴────┘

┌────┬────┬────┬────┐  Média    ← quando score = 2
│████│████│    │    │
└────┴────┴────┴────┘

┌────┬────┬────┬────┐  Forte    ← quando score ≥ 3
│████│████│████│████│
└────┴────┴────┴────┘
```

| Score | Label | Cor das barras preenchidas | Cor do label |
|-------|-------|--------------------------|--------------|
| 0–1 | "Fraca" | `--red` (#f43f5e) | `--red` |
| 2 | "Média" | `--yellow` (#f59e0b) | `--yellow` |
| 3–4 | "Forte" | `--green` (#10b981) | `--green` |

Barras não preenchidas usam `var(--s3)` (#132248).

#### CSS

```css
.password-strength {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  align-items: center;
  opacity: 0;                  /* oculto até digitar */
  transition: opacity 0.3s;
}

.password-strength.visible {
  opacity: 1;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: var(--s3);
  border-radius: 2px;
  transition: background 0.3s;
}

.strength-bar.weak   { background: var(--red); }
.strength-bar.medium { background: var(--yellow); }
.strength-bar.strong { background: var(--green); }

.strength-label {
  font-size: 11px;
  min-width: 44px;
  text-align: right;
}
.strength-label.weak   { color: var(--red); }
.strength-label.medium { color: var(--yellow); }
.strength-label.strong { color: var(--green); }
```

### 8.4 Checkbox de Termos

```
┌──┐
│  │  Li e aceito os Termos de Uso e a Política de Privacidade
└──┘
     ↑ checked: fundo --em, ícone ✓ branco
     ↑ unchecked: fundo --s2, borda --border
```

O checkbox é **custom** (o input nativo é escondido via `display: none`). O estado visual é controlado por CSS:

```css
.checkbox-input:checked + .checkbox-box {
  background: var(--em);
  border-color: var(--em);
}
```

Os links "Termos de Uso" e "Política de Privacidade" devem abrir em nova aba. No MVP, podem apontar para `/termos` e `/privacidade` (páginas placeholder).

### 8.5 Textos do Cadastro

- **Título:** "Crie sua conta."
- **Subtítulo:** "Grátis para começar. Sem cartão de crédito."
- **Botão Google:** "Cadastrar com Google"
- **Divisor:** "ou cadastre com e-mail"
- **Botão Submit:** "Criar conta grátis →"
- **Footer:** "Já tem uma conta? Entrar"

### 8.6 Mensagens de Erro do Cadastro

| Campo | Condição | Mensagem |
|-------|----------|----------|
| Nome | Vazio | "Nome obrigatório" |
| E-mail | Formato inválido | "E-mail inválido" |
| Senha | Menos de 8 chars | "Mínimo 8 caracteres" |
| Confirmar senha | Diferente da senha | "As senhas não coincidem" |
| Termos | Não marcado | Toast: "Você precisa aceitar os termos de uso" |
| Geral (Supabase) | Erro do backend | Toast com a mensagem do erro |

### 8.7 Lógica de Submit (Cadastro)

```typescript
async function handleCadastro(
  nome: string,
  email: string,
  senha: string,
  confirmar: string,
  termos: boolean
) {
  // 1. Validar todos os campos (setar erros visuais)
  // 2. Verificar se termos está marcado
  // 3. Setar loading → texto "Criando conta..."

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        full_name: nome,   // salvo em raw_user_meta_data
      },
    },
  })

  if (error) {
    toast.error(error.message)
    return
  }

  // Criar/atualizar perfil (fallback do trigger)
  if (data.user?.id) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, full_name: nome }, { onConflict: 'id' })
  }

  // 4. Texto do botão → "Conta criada! ✓"
  // 5. Toast de sucesso: "Conta criada com sucesso! Verifique seu e-mail."
  // 6. Redirecionar para /login (se confirm email estiver ativo)
  //    OU redirecionar para /onboarding (se confirm email estiver desativado em dev)
}
```

### 8.8 Fluxo pós-cadastro

**Se confirmação de e-mail está ativada (produção):**
1. Usuário é redirecionado para `/login`
2. Mostra toast "Verifique seu e-mail"
3. Usuário clica no link do email → rota `/auth/confirm` processa a confirmação
4. Usuário volta para `/login`, faz login, é redirecionado para `/onboarding`

**Se confirmação de e-mail está desativada (desenvolvimento):**
1. Usuário é automaticamente logado após o signup
2. Redirecionado diretamente para `/onboarding`

---

## 9. TELA: RECUPERAR SENHA

### 9.1 Visão Geral

A tela de recuperar senha é um **wizard de 4 steps**, todos exibidos no mesmo `page.tsx`. Apenas um step é visível por vez. Usa o mesmo layout split-screen.

### 9.2 Step 1 — Informar E-mail

```
┌──────────────────────────────────┐
│  "Recuperar senha."              │
│  "Informe o e-mail da sua conta. │
│   Enviaremos um link para        │
│   redefinir sua senha."          │
│                                  │
│  E-mail da conta                 │
│  [_________________________]     │
│   ⚠ E-mail não encontrado       │  ← erro (se aplicável)
│                                  │
│  [Enviar link de recuperação →]  │
│                                  │
│  Lembrou a senha? Voltar ao login│
└──────────────────────────────────┘
```

**Ação:** Chama `supabase.auth.resetPasswordForEmail(email)`. Se sucesso → vai para Step 2. Se erro → mostra erro inline.

### 9.3 Step 2 — Confirmação de Envio

```
┌──────────────────────────────────┐
│           📬                     │
│     "E-mail enviado!"            │
│                                  │
│  Enviamos o link de recuperação  │
│  para: usuario@email.com         │  ← exibe o email digitado
│                                  │
│  Verifique sua caixa de entrada  │
│  (e spam). O link expira em      │
│  30 minutos.                     │
│                                  │
│  Não recebeu? Reenviar ·         │
│  Voltar ao login                 │
└──────────────────────────────────┘
```

**Nota:** Este step é apenas informativo. Na implementação real, o Step 3 é acessado através do link enviado por e-mail (rota `/auth/confirm?type=recovery`).

### 9.4 Step 3 — Nova Senha (via link do e-mail)

Esta tela é acessada quando o usuário clica no link de recuperação enviado por e-mail. No Next.js, é processada pela rota `/auth/confirm` que troca o code por uma sessão, e então redireciona para `/esqueceu-senha?step=nova-senha`.

```
┌──────────────────────────────────┐
│  "Nova senha."                   │
│  "Escolha uma senha forte para   │
│   proteger sua conta."           │
│                                  │
│  Nova senha                      │
│  [_________________________👁]   │
│  ████ ████ ░░░░ ░░░░  Média     │  ← strength meter
│                                  │
│  Confirmar nova senha            │
│  [_________________________👁]   │
│   ⚠ As senhas não coincidem     │  ← erro (se aplicável)
│                                  │
│  [Redefinir senha →]             │
└──────────────────────────────────┘
```

**Ação:** Chama `supabase.auth.updateUser({ password: novaSenha })`. Se sucesso → vai para Step 4.

### 9.5 Step 4 — Sucesso

```
┌──────────────────────────────────┐
│           ✅                     │
│     "Senha redefinida!"          │
│                                  │
│  Sua senha foi atualizada com    │
│  sucesso. Você já pode entrar    │
│  na sua conta.                   │
│                                  │
│  [Ir para o login →]             │
└──────────────────────────────────┘
```

O ícone de sucesso é um círculo de 64px com fundo `rgba(16,185,129,0.12)`, borda `rgba(16,185,129,0.25)` e emoji ✅ de 28px centralizado.

---

## 10. TELA: ONBOARDING

### 10.1 Visão Geral

O onboarding é um **wizard de 5 steps** que aparece APENAS na primeira vez que o usuário acessa o app (quando `profiles.onboarding_completed = false`). Seu objetivo é personalizar a experiência coletando dados-chave do usuário.

### 10.2 Estrutura Visual

Diferente do Auth (split-screen), o Onboarding usa layout **centralizado de coluna única** com card arredondado.

```
┌─────────────────────────────────────────────────────┐
│  [Logo SyncLife]                [Pular configuração →] │
│                                                       │
│  (1)───(2)───(3)───(4)───(5)    ← barra de progresso │
│  Olá! Momento Estilo Áreas Pronto                    │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │                                                 │ │
│  │   PASSO X DE 5                                  │ │
│  │   Título do step                                │ │
│  │   Subtítulo explicativo                         │ │
│  │                                                 │ │
│  │   [Conteúdo do step]                            │ │
│  │                                                 │ │
│  │   ← Voltar              [Continuar →]           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 10.3 Background

```css
/* Orbs de fundo (fixas, não scrollam) */
.bg-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.orb-1 {
  width: 500px; height: 500px;
  background: var(--em);     /* esmeralda */
  top: -150px; left: -80px;
  filter: blur(110px);
  opacity: 0.09;
}
.orb-2 {
  width: 380px; height: 380px;
  background: var(--el);     /* azul */
  bottom: -80px; right: -80px;
  filter: blur(110px);
  opacity: 0.09;
}
```

### 10.4 Topbar

```
[Logo 32px SyncLife]          [Pular configuração →]
```

- Logo: ícone SVG 32px + "SyncLife" em Syne 17px 700
- "Pular configuração →": DM Sans 13px, cor `--t3`, hover `--t2`
- Ação do pular: `confirm('Pular configuração? Você pode refazer isso nas configurações a qualquer momento.')` → se sim, vai direto para Step 5 com defaults
- Largura máxima: 660px, centralizado

### 10.5 Barra de Progresso

```
  (1)────(2)────(3)────(4)────(5)
  Olá!  Momento Estilo  Áreas Pronto
```

#### Dots (bolinhas)

| Estado | Visual |
|--------|--------|
| **Não visitado** | Borda `--border-h`, fundo `--s2`, número em `--t3` |
| **Ativo** | Borda `--em`, fundo `--em`, número em `#03071a`, box-shadow glow |
| **Concluído** | Borda `--em`, fundo `rgba(16,185,129,0.12)`, ícone ✓ em `--em` |

Cada dot tem 28px de diâmetro. Font DM Mono 11px 700.

#### Linhas entre dots

| Estado | Visual |
|--------|--------|
| **Não visitada** | 2px, cor `--border` |
| **Concluída** | 2px, cor `rgba(16,185,129,0.45)` |

#### Labels

DM Sans 10px. Cor `--t3` por padrão, `--em` quando ativo, `--t2` quando concluído.

### 10.6 Step Card (container de cada step)

```css
.step-card {
  width: 100%;
  max-width: 660px;
  background: var(--s1);              /* #07112b */
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 48px;
  animation: stepIn 0.35s ease both;
}

@keyframes stepIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Mobile (abaixo de 580px): `padding: 28px 20px`.

### 10.7 Step 1 — Nome do Usuário

**Eyebrow:** "Passo 1 de 5"
**Título:** "Olá! Qual é o seu nome?"
**Subtítulo:** "Vamos personalizar o SyncLife do seu jeito."

**Input:**
```css
.name-input {
  width: 100%;
  background: var(--s2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--t1);
}
```

Placeholder: "Seu nome" · DM Sans (na verdade Syne pela herança do input) 600 · cor `--t3`
Hint abaixo: "É assim que vamos te chamar no app." · DM Sans 12px · cor `--t3`

**Botão Voltar:** Escondido (invisível) neste step — `opacity: 0; pointer-events: none`
**Botão Next:** "Continuar →"

**Dados coletados:** `state.nome` → será salvo em `profiles.full_name`

**Regra:** Este campo é opcional. Se o usuário não preencher e clicar "Continuar", ele avança normalmente. O nome pode ser adicionado depois nas configurações. Porém, se preencher, o Step 5 exibe "Pronto, [nome]!" em vez de "Pronto, você!".

### 10.8 Step 2 — Momento de Vida

**Eyebrow:** "Passo 2 de 5"
**Título:** "O que te trouxe até aqui?"
**Subtítulo:** "Pode escolher até 3 opções. Isso nos ajuda a personalizar sua experiência desde o primeiro dia."

**Grid:** 2 colunas, gap 12px. Mobile (abaixo de 580px): 1 coluna.

**Opções (6 cards):**

| Valor | Ícone | Título | Descrição |
|-------|-------|--------|-----------|
| `equilibrio` | ⚖️ | Quero mais equilíbrio | Sentindo que a vida está desorganizada e quer colocar tudo nos trilhos. |
| `crescimento` | 🚀 | Estou em fase de crescimento | Carreira, estudos ou projetos em ascensão. Quer acompanhar cada passo. |
| `virada` | 🔄 | Passando por uma virada | Mudança de emprego, cidade, relacionamento ou outro marco importante. |
| `financas` | 💰 | Quero controlar meu dinheiro | Foco em organizar as finanças, criar hábitos e parar de perder o controle. |
| `metas` | 🏆 | Tenho grandes metas | Objetivos claros que precisa transformar em plano concreto e acompanhar. |
| `habitos` | 🌱 | Quero construir hábitos | Pequenas mudanças consistentes que, com o tempo, transformam a vida. |

**Comportamento de seleção:**

- Multi-select (toggle): clicar seleciona, clicar de novo deseleciona
- **Limite de 3:** Ao tentar selecionar a 4ª opção, o hint muda para vermelho "Máximo de 3 seleções atingido." e volta ao normal após 2 segundos
- **Hint dinâmico:** "Selecione até 3 opções." → "1 selecionada · máximo 3" → "2 selecionadas · máximo 3" → "3 selecionadas · máximo 3" (este último em cor `--em`)

**Card selecionado:**

```css
.momento-card.selected {
  border-color: var(--mode-accent);           /* --em por padrão */
  box-shadow: 0 0 0 3px var(--mode-glow);     /* rgba(16,185,129,0.18) */
}
```

Ao selecionar, aparece um check circle (✓) no canto superior direito (20px, fundo `--em`, cor `#03071a`).

**Dados coletados:** `state.momentos` → será salvo em `profiles.life_moments` (array TEXT[])

**Regra:** Este step é opcional. O usuário pode avançar sem selecionar nenhum momento.

### 10.9 Step 3 — Modo de Interface (Foco vs Jornada)

**Eyebrow:** "Passo 3 de 5"
**Título:** "Como você prefere ver as informações?"
**Subtítulo:** "Dois estilos de interface, uma mesma plataforma. Pode mudar a qualquer hora."

**Grid:** 2 colunas, gap 16px. Mobile (abaixo de 580px): 1 coluna.

#### Card Foco

```
┌─────────────────────────────────┐
│  ✓  ← check circle (se selecionado)
│  🎯
│  MODO FOCO
│  Direto ao ponto
│  Interface objetiva, dados densos,
│  sem distrações. Você quer números,
│  não frases.
│  · Métricas em destaque
│  · Sem animações
│  · Sidebar compacta
└─────────────────────────────────┘
```

Quando selecionado: `border-color: var(--em)` · `background: rgba(16,185,129,0.04)` · `box-shadow: 0 0 0 4px rgba(16,185,129,0.1)`

#### Card Jornada

```
┌─────────────────────────────────┐
│  ✓  ← check circle (se selecionado)
│  🌱
│  MODO JORNADA
│  Acompanhe sua evolução
│  Insights, conquistas e motivação.
│  O app celebra com você cada
│  pequena vitória.
│  · Life Sync Score
│  · Conquistas & badges
│  · Insights com IA
└─────────────────────────────────┘
```

Quando selecionado: `border-color: var(--el)` · `background: rgba(0,85,255,0.04)` · `box-shadow: 0 0 0 4px rgba(0,85,255,0.1)`

**Comportamento especial — Mudança de tema visual:**

Quando o usuário seleciona **Jornada**, o `<body>` recebe a classe `mode-jornada`, que **muda toda a paleta de cores da tela** para o tema verde-profundo:

```css
body.mode-jornada {
  --bg:  #020d08;
  --s1:  #061410;
  --s2:  #0b1e18;
  --s3:  #112b22;
  --border:   rgba(16,185,129,0.08);
  --border-h: rgba(16,185,129,0.18);
  --t1:  #d6faf0;
  --t2:  #4da888;
  --t3:  #235c48;
  --mode-accent: #10b981;
  --mode-glow:   rgba(16,185,129,0.22);
}
```

Quando seleciona **Foco**, remove a classe `mode-jornada` e volta à paleta navy padrão.

Isso é um **diferencial muito importante**: o usuário sente a diferença entre os modos ANTES de confirmar a escolha. É um feedback instantâneo que aumenta a confiança na decisão.

**Dados coletados:** `state.modo` → será salvo em `profiles.mode` ('focus' | 'journey')

**Default:** Foco começa selecionado.

### 10.10 Step 4 — Áreas da Vida

**Eyebrow:** "Passo 4 de 5"
**Título:** "Quais áreas da sua vida quer gerenciar?"
**Subtítulo:** "Ativamos só o que você precisa agora. Você pode adicionar ou remover módulos depois."

**Grid:** 3 colunas, gap 10px. Mobile (abaixo de 580px): 2 colunas.

**Opções (6 módulos):**

| Valor | Ícone | Título | Subtítulo | Cor identitária |
|-------|-------|--------|-----------|-----------------|
| `financas` | 💰 | Finanças | Gastos, orçamentos, planejamento | `#10b981` (esmeralda) |
| `metas` | 🏆 | Metas | Objetivos pessoais e financeiros | `#8b5cf6` (violeta) |
| `agenda` | 📅 | Agenda | Compromissos e tempo | `#06b6d4` (ciano) |
| `saude` | 🩺 | Saúde | Hábitos, sono, bem-estar | `#f43f5e` (vermelho) |
| `carreira` | 💼 | Carreira | Evolução profissional | `#f59e0b` (amarelo) |
| `estudos` | 📚 | Estudos | Aprendizado contínuo | `#0055ff` (azul) |

**Comportamento de seleção:**

- Multi-select sem limite (pode selecionar quantos quiser)
- Cada card selecionado usa a cor identitária do módulo para borda e glow
- Check circle no canto superior direito com a cor do módulo
- Hint: "Selecione pelo menos uma área."

**CSS por módulo:**

```css
.area-fin  { --area-color: #10b981; --area-bg: rgba(16,185,129,0.05); --area-glow: rgba(16,185,129,0.1); }
.area-meta { --area-color: #8b5cf6; --area-bg: rgba(139,92,246,0.05); --area-glow: rgba(139,92,246,0.1); }
.area-ag   { --area-color: #06b6d4; --area-bg: rgba(6,182,212,0.05); --area-glow: rgba(6,182,212,0.1); }
.area-sau  { --area-color: #f43f5e; --area-bg: rgba(244,63,94,0.05);  --area-glow: rgba(244,63,94,0.1); }
.area-car  { --area-color: #f59e0b; --area-bg: rgba(245,158,11,0.05); --area-glow: rgba(245,158,11,0.1); }
.area-est  { --area-color: #0055ff; --area-bg: rgba(0,85,255,0.05);   --area-glow: rgba(0,85,255,0.1); }
```

**Aviso PRO:** Saúde e Carreira são módulos do plano PRO (MVP v3). Se selecionados, o Step 5 mostra um aviso amarelo: "⭐ Saúde e Carreira fazem parte do plano PRO. Você pode usar gratuitamente por 14 dias e decidir depois."

**Dados coletados:** `state.areas` → será salvo em `profiles.active_modules` (array TEXT[])

**Regra:** Se nenhum módulo for selecionado, o default é `['financas']`.

### 10.11 Step 5 — Resumo

**Visual diferente** dos outros steps — não tem eyebrow nem subtítulo de step. Tem um hero centralizado:

```
┌─────────────────────────────────────────────┐
│              ✅ (ou 🎉 se Jornada)          │
│         "Pronto, [nome]!"                   │
│   "Tudo configurado. Seu painel está pronto."│
│   (ou "Vamos acompanhar sua evolução..."     │
│    se Jornada)                               │
│                                             │
│  ┌─ Resumo ─────────────────────────────┐   │
│  │ 🙌 Seu momento                       │   │
│  │    Busco equilíbrio · Controlar...   │   │
│  ├──────────────────────────────────────┤   │
│  │ 🎯 Modo de interface                │   │
│  │    🎯 Modo Foco — Interface objetiva │   │
│  ├──────────────────────────────────────┤   │
│  │ 🗂️ Módulos ativados                  │   │
│  │    [Finanças] [Metas] [Agenda]       │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ⭐ Saúde e Carreira fazem parte do plano   │
│     PRO. Você pode usar gratuitamente por   │
│     14 dias e decidir depois.               │
│  (só aparece se selecionou Saúde ou Carreira)│
│                                             │
│  "Tudo pode ser ajustado nas configurações  │
│   a qualquer momento."                      │
│                                             │
│  ← Voltar        [Começar minha jornada 🚀] │
└─────────────────────────────────────────────┘
```

**Diferenças por modo:**

| Aspecto | Foco | Jornada |
|---------|------|---------|
| Emoji do hero | ✅ | 🎉 |
| Texto abaixo do nome | "Tudo configurado. Seu painel está pronto." | "Vamos acompanhar sua evolução juntos. Cada passo conta!" |
| Confetti | Não | Sim (animação de 70 partículas, 3.5s) |

**Animação do emoji:**

```css
.summary-emoji {
  font-size: 52px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes popIn {
  from { transform: scale(0.3); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
```

**Nome com gradiente:**

O nome do usuário no título "Pronto, [nome]!" usa `background: linear-gradient(135deg, var(--em), var(--el))` com `-webkit-background-clip: text`.

**Chips de módulos:**

Cada módulo selecionado é renderizado como um chip com borda na cor do módulo:

```css
.area-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  border: 1px solid;       /* cor varia por módulo */
}
```

### 10.12 Confetti (Modo Jornada)

Quando o Step 5 é renderizado e o modo é Jornada:

1. Gerar 70 elementos `<div>` com posição absoluta
2. Cada um recebe: posição X aleatória (0-100%), cor aleatória de 6 opções, tamanho 4-12px, border-radius 50% ou 2px (aleatório), `animation-duration` 1.5-3.5s, `animation-delay` 0-0.8s
3. Animação: `translateY(-20px)` → `translateY(100vh)` + `rotate(720deg)`, `opacity: 1 → 0`
4. Container é `position: fixed; inset: 0; z-index: 999; pointer-events: none`
5. Remove tudo após 3.5 segundos

Cores do confetti: `['#10b981', '#0055ff', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6']`

### 10.13 Lógica de Submit (Onboarding — Botão "Começar minha jornada")

```typescript
async function finishOnboarding(state: OnboardingState) {
  // 1. Texto do botão → "Abrindo seu painel..."
  // 2. Salvar no Supabase
  const supabase = createClient()
  const user = (await supabase.auth.getUser()).data.user

  await supabase
    .from('profiles')
    .update({
      full_name: state.nome || undefined,                        // Step 1
      life_moments: state.momentos.length > 0 ? state.momentos : null, // Step 2
      mode: state.modo === 'jornada' ? 'journey' : 'focus',     // Step 3
      active_modules: state.areas.length > 0 ? state.areas : ['financas'], // Step 4
      onboarding_completed: true,                                 // marca como concluído
    })
    .eq('id', user.id)

  // 3. Texto → "✓ Redirecionando..."
  // 4. Redirecionar para /dashboard (ou /financas/visao-geral)
  router.push('/dashboard')
}
```

### 10.14 Estado do Onboarding (client-side)

```typescript
interface OnboardingState {
  nome: string
  momentos: string[]     // max 3: 'equilibrio' | 'crescimento' | 'virada' | 'financas' | 'metas' | 'habitos'
  modo: 'foco' | 'jornada'
  areas: string[]        // 'financas' | 'metas' | 'agenda' | 'saude' | 'carreira' | 'estudos'
}

// Valores iniciais
const initialState: OnboardingState = {
  nome: '',
  momentos: [],
  modo: 'foco',
  areas: [],
}
```

---

## 11. MIDDLEWARE E PROTEÇÃO DE ROTAS

### Fluxo de decisão do middleware

```
Request chega
    │
    ├── É rota pública? (/login, /cadastro, /esqueceu-senha, /, /termos, /privacidade)
    │   └── Sim → Deixar passar
    │       └── MAS se usuário está logado e tenta acessar /login ou /cadastro:
    │           └── Redirecionar para /dashboard (ou /onboarding se não concluiu)
    │
    ├── É rota /onboarding?
    │   ├── Não está logado → Redirect para /login
    │   └── Está logado → Deixar passar (mesmo se onboarding já concluído)
    │
    ├── É rota protegida? (/dashboard, /financas, /metas, /agenda, /configuracoes, etc.)
    │   ├── Não está logado → Redirect para /login
    │   ├── Está logado + onboarding NÃO concluído → Redirect para /onboarding
    │   └── Está logado + onboarding concluído → Deixar passar
```

### Código do Middleware

```typescript
// middleware.ts (raiz do projeto)
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // O updateSession já lida com refresh de sessão e cookies.
  // Agora verificamos as regras de rota:

  const { pathname } = request.nextUrl
  const supabase = createMiddlewareClient(request, response)
  const { data: { user } } = await supabase.auth.getUser()

  // Rotas públicas que não precisam de verificação
  const publicRoutes = ['/', '/login', '/cadastro', '/esqueceu-senha', '/termos', '/privacidade']
  if (publicRoutes.some(route => pathname === route)) {
    // Se logado e tentando acessar auth pages, redirecionar
    if (user && (pathname === '/login' || pathname === '/cadastro')) {
      // Verificar onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Rotas protegidas
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar onboarding para rotas do app (exceto /onboarding)
  if (pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/confirm|api).*)',
  ],
}
```

---

## 12. FLUXO COMPLETO DO USUÁRIO

### 12.1 Novo Usuário (primeiro acesso)

```
1. Landing Page → clica "Começar grátis"
2. /cadastro → preenche nome, email, senha → clica "Criar conta grátis"
3. Supabase cria user + trigger cria profile (onboarding_completed = false)
4. (Se confirm email ativo) → vai para /login com toast "Verifique seu e-mail"
   4a. Usuário confirma email
   4b. Volta para /login
5. /login → preenche credenciais → clica "Entrar"
6. Middleware verifica: onboarding_completed = false → redireciona para /onboarding
7. /onboarding → 5 steps → clica "Começar minha jornada 🚀"
8. Salva dados no profiles + seta onboarding_completed = true
9. Redireciona para /dashboard
```

### 12.2 Usuário Recorrente

```
1. Landing Page → clica "Entrar"
2. /login → preenche credenciais → clica "Entrar"
3. Middleware verifica: onboarding_completed = true → redireciona para /dashboard
4. /dashboard
```

### 12.3 Usuário com Google OAuth

```
1. /login ou /cadastro → clica "Continuar com Google"
2. Supabase redireciona para Google
3. Google autentica → callback para /auth/callback
4. /auth/callback processa o code → sessão criada
5. Middleware verifica onboarding_completed
   5a. false → /onboarding
   5b. true → /dashboard
```

### 12.4 Recovery Flow

```
1. /login → clica "Esqueci minha senha"
2. /esqueceu-senha (Step 1) → digita email → clica "Enviar link"
3. Supabase envia email com link
4. /esqueceu-senha (Step 2) → mostra confirmação
5. Usuário abre email → clica no link
6. /auth/confirm?type=recovery → troca code por sessão
7. /esqueceu-senha?step=nova-senha (Step 3) → digita nova senha
8. Supabase atualiza senha
9. /esqueceu-senha (Step 4) → mostra "Senha redefinida!"
10. Clica "Ir para o login" → /login
```

---

## 13. RESPONSIVIDADE

### 13.1 Breakpoints

| Nome | Min-width | Comportamento |
|------|-----------|---------------|
| Mobile | < 580px | Onboarding: grids 1 col (momento, modo) e 2 col (áreas), card padding reduzido |
| Tablet | < 900px | Auth: painel esquerdo desaparece, form ocupa 100% |
| Desktop | ≥ 900px | Auth: split-screen 50/50, Onboarding: full-width centered |

### 13.2 Auth — Regras Responsivas

```css
@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;     /* remove split */
  }
  .auth-left {
    display: none;                   /* painel esquerdo some */
  }
  .auth-right {
    padding: 80px 24px 48px;        /* mais padding top para compensar */
  }
  .view {
    max-width: 440px;               /* form um pouco mais largo */
  }
}
```

### 13.3 Onboarding — Regras Responsivas

```css
@media (max-width: 580px) {
  .step-card {
    padding: 28px 20px;
  }
  .mode-cards {
    grid-template-columns: 1fr;      /* modo foco/jornada em coluna */
  }
  .momento-grid {
    grid-template-columns: 1fr;      /* momentos em coluna */
  }
  .areas-grid {
    grid-template-columns: repeat(2, 1fr);  /* áreas em 2 colunas */
  }
  .topbar {
    padding: 18px 0 28px;
  }
  .progress-wrap {
    margin-bottom: 28px;
  }
}
```

### 13.4 Regra Mobile-First

Conforme regra do projeto: **todo componente novo deve ser testado em 375px antes de qualquer adaptação desktop**. Isso significa que o CSS base deve ser pensado para mobile e os breakpoints adicionam complexidade para telas maiores.

---

## 14. ANIMAÇÕES E TRANSIÇÕES

### 14.1 Transições Globais

| Elemento | Propriedade | Duração | Easing |
|----------|-------------|---------|--------|
| Input focus | border-color, box-shadow | 0.2s | ease |
| Botão hover | all | 0.2s | ease |
| Link hover | color | 0.15s | ease |
| Toggle senha hover | color | 0.15s | ease |
| Card hover (onboarding) | all | 0.22s | ease |

### 14.2 Animações

| Nome | Onde | CSS |
|------|------|-----|
| `fadeIn` | Troca de view no Auth | `from { opacity: 0; translateY(12px) } to { opacity: 1; translateY(0) }` · 0.3s ease |
| `stepIn` | Troca de step no Onboarding | `from { opacity: 0; translateY(14px) } to { opacity: 1; translateY(0) }` · 0.35s ease |
| `popIn` | Emoji do Step 5 | `from { scale(0.3); opacity: 0 } to { scale(1); opacity: 1 }` · 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) |
| `confettiFall` | Partículas de confetti | `translateY(-20px) → translateY(100vh)` + `rotate(0deg → 720deg)` + `opacity 1 → 0` · 1.5-3.5s linear |

### 14.3 Transição de Tema (Onboarding Step 3)

Quando o usuário alterna entre Foco e Jornada:

```css
html, body {
  transition: background 0.5s, color 0.3s;
}
```

O `background` transiciona suavemente de navy (#03071a) para verde-profundo (#020d08) e vice-versa. É um efeito sutil mas perceptível que reforça a diferença entre os modos.

---

## 15. ACESSIBILIDADE

### 15.1 Formulários

- Todos os inputs têm `<label>` associado (via `htmlFor`/`id`)
- Inputs de senha têm `autocomplete="current-password"` (login) e `autocomplete="new-password"` (cadastro/reset)
- Input de email tem `autocomplete="email"`
- Input de nome tem `autocomplete="given-name"`
- Labels marcados como obrigatórios exibem `<span>*</span>` com `aria-hidden="true"` e o input tem `required`
- Erros de validação têm `role="alert"` e são associados ao campo via `aria-describedby`

### 15.2 Botões e Links

- Toggle de senha tem `type="button"` (não submete o form) e `aria-label="Mostrar senha"` / `aria-label="Ocultar senha"`
- Botão submit tem `type="submit"` dentro de um `<form>` (usar `<form onSubmit>`, não `<button onClick>`)
- Links de navegação entre views usam `<Link>` do Next.js ou `<button>` com `role` adequado

### 15.3 Navegação por Teclado

- Tab order segue a ordem visual (de cima para baixo, esquerda para direita)
- Enter no input submete o form
- Escape fecha tooltips/modals (se houver)

### 15.4 Contraste

Todas as combinações de texto/fundo atendem WCAG AA:
- `--t1` (#dff0ff) sobre `--bg` (#03071a) → ratio ~12:1
- `--t2` (#6e90b8) sobre `--bg` (#03071a) → ratio ~5.5:1
- `--t3` (#2e4a6e) sobre `--bg` (#03071a) → ratio ~2.8:1 (usado apenas para hints/labels decorativos)
- `--em` (#10b981) sobre `#03071a` (texto do botão) → ratio ~8.5:1

---

## 16. VALIDAÇÕES E REGRAS DE NEGÓCIO

### 16.1 Schemas Zod

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha obrigatória'),
})

export const cadastroSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome obrigatório')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  senha: z
    .string()
    .min(8, 'Mínimo 8 caracteres'),
  confirmar: z
    .string()
    .min(1, 'Confirme a senha'),
  termos: z
    .literal(true, {
      errorMap: () => ({ message: 'Você precisa aceitar os termos de uso' }),
    }),
}).refine(data => data.senha === data.confirmar, {
  message: 'As senhas não coincidem',
  path: ['confirmar'],
})

export const resetEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
})

export const novaSenhaSchema = z.object({
  senha: z
    .string()
    .min(8, 'Mínimo 8 caracteres'),
  confirmar: z
    .string()
    .min(1, 'Confirme a nova senha'),
}).refine(data => data.senha === data.confirmar, {
  message: 'As senhas não coincidem',
  path: ['confirmar'],
})
```

### 16.2 Validação de E-mail (regex usada no protótipo)

```typescript
function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email)
}
```

Na implementação real, usar o schema Zod que é mais robusto.

### 16.3 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Senha mínima** | 8 caracteres (validação frontend + Supabase default) |
| **Onboarding obrigatório** | Usuário não acessa o app sem concluir ou pular o onboarding |
| **Pular onboarding** | "Pular" vai para Step 5 com defaults (foco, financas), mas marca como concluído |
| **Modo default** | 'focus' (Foco) |
| **Módulo default** | ['financas'] (se nenhum selecionado) |
| **Nome opcional** | Pode ficar em branco no onboarding; editável em configurações |
| **Momentos de vida** | Máximo 3, mínimo 0 (opcional) |
| **OAuth (Google)** | Mesmo fluxo post-login: verifica onboarding_completed antes de redirecionar |
| **Link de recovery** | Expira em 30 minutos (configurável no Supabase Auth) |

---

## 17. INTEGRAÇÃO COM SUPABASE AUTH

### 17.1 Métodos Utilizados

| Método | Onde | O que faz |
|--------|------|-----------|
| `supabase.auth.signUp()` | Cadastro | Cria user no Supabase Auth |
| `supabase.auth.signInWithPassword()` | Login | Autentica com email/senha |
| `supabase.auth.signInWithOAuth()` | Login/Cadastro | Inicia fluxo Google OAuth |
| `supabase.auth.resetPasswordForEmail()` | Esqueceu Senha (Step 1) | Envia email de recuperação |
| `supabase.auth.updateUser()` | Esqueceu Senha (Step 3) | Atualiza a senha |
| `supabase.auth.getUser()` | Middleware, Onboarding | Verifica sessão |
| `supabase.auth.resend()` | Login (email não confirmado) | Reenvia confirmação |
| `supabase.auth.exchangeCodeForSession()` | /auth/callback | Troca code OAuth por sessão |

### 17.2 Callback Routes

#### `/auth/callback/route.ts` (OAuth)

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verificar onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

#### `/auth/confirm/route.ts` (Email Confirmation + Password Recovery)

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/esqueceu-senha?step=nova-senha`)
      }
      return NextResponse.redirect(`${origin}/login?confirmed=true`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_error`)
}
```

### 17.3 Configuração do Supabase

No painel do Supabase (Authentication → URL Configuration):

```
Site URL:       https://seu-dominio.vercel.app
Redirect URLs:  https://seu-dominio.vercel.app/**
                http://localhost:3000/**
```

---

## 18. TRATAMENTO DE ERROS

### 18.1 Erros de Autenticação (Supabase)

| Erro do Supabase | Mensagem para o Usuário | Componente |
|------------------|------------------------|------------|
| `Invalid login credentials` | "Credenciais incorretas. Verifique e-mail e senha." | Toast de erro |
| `Email not confirmed` | Banner amarelo com botão "Reenviar confirmação" | Banner inline |
| `User already registered` | "Este e-mail já está cadastrado. Faça login." | Toast de erro |
| `Password should be at least 6 characters` | "Senha muito curta. Use pelo menos 8 caracteres." | Toast de erro |
| `Email rate limit exceeded` | "Muitas tentativas. Tente novamente em alguns minutos." | Toast de erro |
| `Network error` | "Sem conexão. Verifique sua internet e tente novamente." | Toast de erro |
| Qualquer outro | Exibir `error.message` do Supabase | Toast de erro |

### 18.2 Feedback Visual de Erro nos Campos

```css
.field-error {
  font-size: 12px;
  color: var(--red);           /* #f43f5e */
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  display: none;               /* oculto por padrão */
}

.field-error.show {
  display: flex;
}

.field-error svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
```

Cada campo de erro tem um ícone SVG de alerta (círculo com !) seguido do texto da mensagem. O erro é exibido **somente após tentativa de submit** (não enquanto digita).

---

## 19. PERFORMANCE E SEO

### 19.1 Performance

- Telas de auth são **Client Components** (por causa dos forms interativos), mas o layout pode ser Server Component
- Imagens do logo: usar SVG inline (já está como base64 no protótipo) → converter para componente SVG React
- Fonts: carregar via `next/font` com `display: 'swap'` para evitar FOIT
- As orbs de fundo usam CSS puro (sem JS) para não bloquear o thread
- Lazy-load da animação de confetti (importar dinamicamente no Step 5)

### 19.2 SEO

As telas de auth não precisam de indexação agressiva, mas devem ter meta tags básicas:

```typescript
export const metadata: Metadata = {
  title: 'Login | SyncLife',
  description: 'Entre na sua conta SyncLife para gerenciar suas finanças, metas e agenda.',
  robots: 'noindex, nofollow',  // auth pages não devem ser indexadas
}
```

A tela de onboarding segue o mesmo padrão (`robots: 'noindex, nofollow'`).

---

## 20. BENCHMARK E DIFERENCIAIS COMPETITIVOS

### 20.1 O que os melhores fazem

| App | Auth UX | O que o SyncLife pode aprender |
|-----|---------|-------------------------------|
| **Linear** | Split-screen com visual do produto à esquerda, form minimalista à direita | ✅ Já implementado no protótipo |
| **Notion** | Tela simples mas com ilustrações que mudam por tema | O mini dashboard card no painel esquerdo do SyncLife é mais sofisticado |
| **Monarch Money** | Onboarding pergunta sobre situação financeira e objetivos | ✅ SyncLife faz isso com "Momento de Vida" e "Áreas" |
| **Copilot Money** | Conecta contas bancárias no onboarding | Para MVP, SyncLife coleta dados mais leves (modo, módulos) |
| **YNAB** | Onboarding longo mas educativo | SyncLife é mais rápido (5 steps curtos) sem sacrificar personalização |
| **Duolingo** | Pergunta o objetivo no onboarding e adapta a experiência | ✅ SyncLife faz isso com "Momento de Vida" e seleciona módulos relevantes |

### 20.2 Diferenciais do SyncLife

1. **Preview do produto no auth:** O mini dashboard card no painel esquerdo mostra como o app funciona ANTES de criar conta. Isso reduz a fricção de signup porque o usuário já sabe o que esperar.

2. **Mudança de tema em tempo real no onboarding:** Quando o usuário seleciona Jornada no Step 3, TODA a paleta da tela muda instantaneamente. Isso não existe em nenhum concorrente. É um microinteração que gera um "wow moment".

3. **Momento de vida como filtro de personalização:** Em vez de perguntar "qual seu objetivo?" (genérico), o SyncLife pergunta "o que te trouxe até aqui?" — uma pergunta emocionalmente mais conectada.

4. **Confetti celebratório:** O efeito de confetti ao concluir o onboarding no modo Jornada é um detalhe que reforça a proposta do produto (celebrar evoluções).

5. **Modularidade clara:** Mostrar os módulos no Step 4 com cores identitárias deixa claro que o SyncLife não é "mais um app de finanças" — é uma plataforma de vida.

### 20.3 Insight Inteligente — Oportunidades Futuras

Após validar o MVP v2, considerar adicionar ao onboarding:

- **Step intermediário de renda mensal:** Removido do protótipo atual mas previsto no schema (`monthly_income`). Pode ser adicionado entre Step 3 e Step 4 quando o módulo de Orçamentos estiver robusto o suficiente para sugerir envelopes automaticamente baseados na renda.
- **Onboarding contextual por módulo:** Quando o usuário acessar um módulo pela primeira vez, mostrar um mini-tour de 3 slides explicando o módulo. Isso é mais eficaz do que explicar tudo no onboarding geral.
- **A/B test do painel esquerdo:** Testar se um mini dashboard animado (simulando dados) converte mais que o card estático.

---

## 21. ATIVIDADES PARA O CLAUDE CODE

### Fase 1 — Auth (Refatoração)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 1.1 | Criar `auth.css` com todas as variáveis CSS e estilos custom | 1h | — |
| 1.2 | Criar `AuthLeftPanel` (painel visual esquerdo com logo, headline, stats, mini card, quote) | 2h | 1.1 |
| 1.3 | Criar `AuthShell` (container split-screen + responsivo) | 0.5h | 1.1 |
| 1.4 | Criar `AuthInput` (input com ícone + toggle senha + erro) | 1h | 1.1 |
| 1.5 | Criar `PasswordStrengthMeter` | 0.5h | 1.1 |
| 1.6 | Criar `GoogleAuthButton` + `AuthDivider` | 0.5h | 1.1 |
| 1.7 | Refatorar `LoginForm` com novo design | 1.5h | 1.2-1.6 |
| 1.8 | Refatorar `CadastroForm` com novo design | 1.5h | 1.2-1.6 |
| 1.9 | Criar `ResetPasswordWizard` (4 steps) | 2h | 1.2-1.6 |
| 1.10 | Atualizar layout `(auth)/layout.tsx` para novo design | 0.5h | 1.3 |
| 1.11 | Criar/atualizar `/auth/confirm/route.ts` para recovery flow | 1h | 1.9 |
| 1.12 | Criar schemas Zod (`src/lib/validations/auth.ts`) | 0.5h | — |
| 1.13 | Testar todos os fluxos (login, cadastro, reset, Google) | 1h | 1.7-1.11 |

**Total estimado Fase Auth:** ~13.5h

### Fase 2 — Onboarding (Novo)

| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 2.1 | Migração SQL: adicionar colunas `life_moments`, `active_modules` em profiles | 0.5h | — |
| 2.2 | Criar `OnboardingShell` (container + background orbs) | 1h | — |
| 2.3 | Criar `OnboardingProgress` (barra de progresso com dots e labels) | 1h | — |
| 2.4 | Criar `StepNome` (Step 1) | 0.5h | 2.2-2.3 |
| 2.5 | Criar `StepMomento` (Step 2 — grid de 6 cards com multi-select) | 1.5h | 2.2-2.3 |
| 2.6 | Criar `StepModo` (Step 3 — Foco/Jornada com mudança de tema) | 2h | 2.2-2.3 |
| 2.7 | Criar `StepAreas` (Step 4 — grid de 6 módulos) | 1h | 2.2-2.3 |
| 2.8 | Criar `StepResumo` (Step 5 — resumo + confetti) | 2h | 2.4-2.7 |
| 2.9 | Criar `ConfettiEffect` (animação de partículas) | 1h | — |
| 2.10 | Criar `onboarding/page.tsx` (orquestrador de state + steps) | 1.5h | 2.4-2.9 |
| 2.11 | Criar `onboarding/layout.tsx` (layout sem sidebar do app) | 0.5h | — |
| 2.12 | Lógica de submit: salvar dados no Supabase e redirecionar | 1h | 2.10 |
| 2.13 | Atualizar middleware para verificar `onboarding_completed` | 1h | 2.12 |
| 2.14 | Atualizar callback OAuth para checar onboarding | 0.5h | 2.13 |
| 2.15 | Testar fluxo completo: cadastro → onboarding → dashboard | 1h | 2.12-2.14 |

**Total estimado Fase Onboarding:** ~16h

### Fase 3 — Integração e QA

| # | Atividade | Estimativa |
|---|-----------|-----------|
| 3.1 | Testar em 375px (mobile) — todas as telas | 1h |
| 3.2 | Testar em tablet (640-900px) | 0.5h |
| 3.3 | Testar fluxo Google OAuth end-to-end | 1h |
| 3.4 | Testar fluxo de recovery end-to-end | 0.5h |
| 3.5 | Verificar tokens do design system (nenhuma cor hardcoded) | 0.5h |
| 3.6 | Lighthouse audit (performance + accessibility) | 0.5h |

**Total estimado Fase QA:** ~4h

---

### TOTAL GERAL ESTIMADO: ~33.5h

### Ordem de Execução Recomendada

```
1. auth.css + schemas Zod (fundação)
2. AuthLeftPanel + AuthShell (container visual)
3. AuthInput + PasswordStrengthMeter + GoogleAuthButton (componentes reutilizáveis)
4. LoginForm → testar
5. CadastroForm → testar
6. ResetPasswordWizard → atualizar callback routes → testar
7. Migração SQL (colunas novas)
8. OnboardingShell + Progress
9. Steps 1-5 (em ordem)
10. ConfettiEffect
11. page.tsx do Onboarding (orquestrador)
12. Middleware update
13. QA completo
```

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0 — Auth & Onboarding Dev Spec*
*Protótipos de referência: proto-auth.html (✅ Aprovado) · proto-onboarding.html (✅ Aprovado)*
