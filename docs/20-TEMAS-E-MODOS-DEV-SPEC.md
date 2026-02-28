# 19 — SISTEMA DE TEMAS + SEPARAÇÃO MODO FOCO/JORNADA: Especificação de Implementação

**Documento de referência para implementação em Next.js**  
**Data:** 28/02/2026 · **Versão:** 1.0  
**Dependências:** 17-NAVEGACAO-SHELL-DEV-SPEC.md (Shell), 11-UX-UI-NAVEGACAO-REVISADO.md (Design System)  
**Prioridade:** Alta — impacta todas as telas do SyncLife  
**Fase:** 1.0 do roadmap (executar ANTES das telas de conteúdo)  

---

## ÍNDICE

1. [Objetivo e Escopo](#1-objetivo-e-escopo)
2. [O que NÃO muda](#2-o-que-não-muda)
3. [Decisão Arquitetural: Tema ≠ Modo](#3-decisão-arquitetural-tema--modo)
4. [Sistema de Temas — 6 Temas (3 FREE + 3 PRO)](#4-sistema-de-temas)
5. [Tokens CSS por Tema](#5-tokens-css-por-tema)
6. [Sistema de Modos — Foco vs Jornada](#6-sistema-de-modos)
7. [Ícones dos Modos](#7-ícones-dos-modos)
8. [Camada Jornada por Módulo — O que muda](#8-camada-jornada-por-módulo)
9. [Implementação Técnica — CSS](#9-implementação-técnica-css)
10. [Implementação Técnica — Zustand Store](#10-implementação-técnica-zustand)
11. [Implementação Técnica — Componentes React](#11-implementação-técnica-componentes)
12. [Gate PRO — Temas e Modo](#12-gate-pro)
13. [Persistência e Sync](#13-persistência-e-sync)
14. [Tela de Configurações — Aparência](#14-tela-de-configurações)
15. [Migração do Sistema Antigo](#15-migração-do-sistema-antigo)
16. [Impacto nos Documentos Existentes](#16-impacto-nos-documentos-existentes)
17. [Testes Unitários](#17-testes-unitários)
18. [Atividades para o Claude Code](#18-atividades-para-o-claude-code)

---

## 1. OBJETIVO E ESCOPO

### O que este documento resolve

O SyncLife v2 tratava Modo (Foco/Jornada) e Tema (Dark/Light) como uma coisa só, gerando **4 variantes visuais completas** (Dark Foco, Dark Jornada, Light Foco, Light Jornada) onde cada combinação mudava a paleta inteira de cores. Isso criava três problemas:

1. **Confusão cognitiva** — trocar de Foco para Jornada parecia trocar de app
2. **Valor do PRO diluído** — Jornada era percebido como "skin diferente" em vez de "funcionalidades extras"
3. **Complexidade de dev** — 4 paletas completas = 4x o esforço de teste visual

### O que este documento implementa

**Separação total em dois eixos independentes:**

- **TEMA** = aparência visual (cores). 6 opções. Configuração pessoal. Não vinculado a plano (FREE tem 3, PRO tem 6).
- **MODO** = experiência funcional. 2 opções (Foco/Jornada). Jornada é PRO. Controla visibilidade de componentes, não cores.

### Escopo estrito

Este documento cobre APENAS:

- Definição dos 6 temas com tokens CSS
- Lógica de visibilidade de componentes Foco/Jornada
- Ícones dos modos
- Store Zustand para tema + modo
- Persistência (localStorage + Supabase)
- Gate PRO para temas e modo
- Tela de aparência em Configurações
- Migração do sistema antigo

---

## 2. O QUE NÃO MUDA

**REGRA ABSOLUTA: Este documento não altera nenhum layout, estrutura, posicionamento, tipografia ou componente existente.**

| Aspecto | Status |
|---------|--------|
| Layouts de telas (grid, flex, posições) | ❌ NÃO muda |
| Tipografia (Syne, DM Sans, DM Mono) | ❌ NÃO muda |
| Estrutura do Shell (Module Bar, Sidebar, Header, Content Area) | ❌ NÃO muda |
| Dimensões (sidebar 228px, header 54px, Module Bar 64px) | ❌ NÃO muda |
| Breakpoints responsivos | ❌ NÃO muda |
| Componentes (cards, inputs, modais, tabelas) | ❌ NÃO muda |
| Lógica de negócio | ❌ NÃO muda |
| Gradientes do Life Sync Score | ❌ NÃO muda (sempre esmeralda→blue) |
| Cores funcionais (--green, --yellow, --red) | ❌ NÃO muda (iguais em todos os temas) |
| Cores de módulo (Finanças=esmeralda, Metas=blue etc.) | ❌ NÃO muda |
| **Tokens de superfície (--bg, --s1, --s2, --s3)** | ✅ MUDA (por tema) |
| **Tokens de texto (--t1, --t2, --t3)** | ✅ MUDA (por tema) |
| **Tokens de acento (--accent, --accent2)** | ✅ MUDA (por tema PRO) |
| **Tokens de borda (--border, --border-h)** | ✅ MUDA (por tema) |
| **Module Bar background** | ✅ MUDA (por tema) |
| **Sidebar background** | ✅ MUDA (por tema) |
| **Visibilidade de componentes Jornada** | ✅ MUDA (por modo) |
| **Ícones do toggle Foco/Jornada** | ✅ MUDA |

---

## 3. DECISÃO ARQUITETURAL: TEMA ≠ MODO

### Antes (v2 — 4 combinações visuais)

```
Tema Dark + Modo Foco    = Paleta Navy (#03071a)
Tema Dark + Modo Jornada = Paleta Verde (#020d08)  ← paleta inteira muda
Tema Light + Modo Foco   = Paleta Off-white (#e6eef5)
Tema Light + Modo Jornada = Paleta Menta (#c8f0e4)  ← paleta inteira muda
```

### Depois (v3 — tema e modo independentes)

```
TEMA (6 opções) → define cores
MODO (2 opções) → define visibilidade de componentes

Tema Navy Dark  + Modo Foco    = Navy Dark, sem insight IA, sem score
Tema Navy Dark  + Modo Jornada = Navy Dark, COM insight IA, COM score
Tema Obsidian   + Modo Foco    = Obsidian, sem insight IA, sem score
Tema Obsidian   + Modo Jornada = Obsidian, COM insight IA, COM score
```

**O modo Jornada NÃO muda nenhuma cor.** Ele adiciona/remove componentes funcionais.

---

## 4. SISTEMA DE TEMAS

### 4.1 Tabela dos 6 Temas

| # | ID | Nome | Tipo | Plano | Cor Acento | Sensação |
|---|---|---|---|---|---|---|
| 1 | `navy-dark` | Navy Dark | Dark | FREE | Esmeralda `#10b981` | Cockpit fintech — padrão do SyncLife |
| 2 | `clean-light` | Clean Light | Light | FREE | Esmeralda `#10b981` | Escritório clean e arejado |
| 3 | `mint-garden` | Mint Garden | Light | FREE | Esmeralda `#10b981` | Tropical vibrante |
| 4 | `obsidian` | Obsidian | Dark | PRO | Dourado `#d4a853` | Luxo discreto, private banking |
| 5 | `rosewood` | Rosewood | Dark | PRO | Rose Gold `#c17d6a` | Elegância quente |
| 6 | `arctic` | Arctic | Light | PRO | Cyan `#0891b2` | Minimalismo escandinavo |

> **Nota:** Os 3 temas PRO foram escolhidos após avaliação de 6 candidatos. Obsidian, Rosewood e Arctic foram os aprovados. Graphite, Twilight e Sahara foram descartados.

### 4.2 Tema padrão

- **Default:** `system` (segue preferência do OS)
- **System → Dark:** Aplica `navy-dark`
- **System → Light:** Aplica `clean-light`
- **Usuários existentes:** Migrados para `system` (ver seção 15)

### 4.3 Regras dos temas

- **RN-TEMA-01:** Temas FREE (navy-dark, clean-light, mint-garden) disponíveis para todos os planos.
- **RN-TEMA-02:** Temas PRO (obsidian, rosewood, arctic) só podem ser ativados por usuários com plano PRO.
- **RN-TEMA-03:** Se usuário PRO faz downgrade para FREE e está usando tema PRO, sistema reverte para `system`.
- **RN-TEMA-04:** Tema é salvo em `profiles.theme` no Supabase e em `localStorage` para leitura instantânea.
- **RN-TEMA-05:** A opção `system` observa `prefers-color-scheme` do OS e reage em tempo real se o OS mudar.
- **RN-TEMA-06:** Tema é aplicado via atributo `data-theme` no `<html>`. Ex: `<html data-theme="obsidian">`.
- **RN-TEMA-07:** Transições de tema usam `transition: background 0.4s, color 0.4s, border-color 0.4s`.

---

## 5. TOKENS CSS POR TEMA

### 5.1 Tokens comuns (NÃO mudam entre temas)

Esses tokens são idênticos em todos os 6 temas:

```css
/* Cores funcionais — fixas globalmente */
--green:  #10b981;
--yellow: #f59e0b;
--orange: #f97316;
--red:    #f43f5e;

/* Cores de módulo — fixas globalmente */
--fin:    #10b981;   /* Finanças */
--meta:   #0055ff;   /* Metas/Futuro */
--agenda: #06b6d4;   /* Tempo */
--conq:   #f59e0b;   /* Conquistas */
--cfg:    #64748b;   /* Configurações */
/* v3: corpo, mente, patrimônio, carreira, experiências — manter cores aprovadas */

/* Gradiente brand — fixo globalmente (usado no Life Sync Score, logo) */
--grad-brand: linear-gradient(135deg, #10b981, #0055ff);

/* Layout tokens — fixos */
--sb:       228px;    /* sidebar expandida */
--sb-c:     56px;     /* sidebar colapsada */
--mb:       64px;     /* module bar */
--header-h: 54px;     /* header */

/* Tipografia — fixa */
/* Syne, DM Sans, DM Mono — nenhuma alteração */

/* Radii — fixos */
--radius-xs: 6px;
--radius-sm: 10px;
--radius:    16px;
--radius-lg: 24px;
```

### 5.2 Tema 1: Navy Dark (FREE — padrão)

```css
[data-theme="navy-dark"] {
  /* Superfícies */
  --bg:   #03071a;
  --s1:   #07112b;
  --s2:   #0c1a3a;
  --s3:   #132248;
  
  /* Texto */
  --t1:   #dff0ff;
  --t2:   #6e90b8;
  --t3:   #2e4a6e;
  
  /* Bordas */
  --border:   rgba(110, 144, 184, 0.12);
  --border-h: rgba(110, 144, 184, 0.22);
  
  /* Acento (herda da marca nos temas FREE) */
  --accent:     #10b981;   /* = --em */
  --accent-rgb: 16, 185, 129;
  --accent2:    #0055ff;   /* = --el */
  
  /* Estruturais */
  --module-bar-bg: #020510;
  --sidebar-bg:    #050e20;
  --header-bg:     rgba(3, 7, 26, 0.85);
  
  /* Utilitários */
  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  --glass:       rgba(7, 17, 43, 0.7);
  
  color-scheme: dark;
}
```

### 5.3 Tema 2: Clean Light (FREE)

```css
[data-theme="clean-light"] {
  --bg:   #e6eef5;
  --s1:   #ffffff;
  --s2:   #f0f6fa;
  --s3:   #e0eaf3;
  
  --t1:   #03071a;
  --t2:   #1e3a5c;
  --t3:   #5a7a9e;
  
  --border:   rgba(3, 7, 26, 0.08);
  --border-h: rgba(3, 7, 26, 0.15);
  
  --accent:     #10b981;
  --accent-rgb: 16, 185, 129;
  --accent2:    #0055ff;
  
  --module-bar-bg: #064e3b;
  --sidebar-bg:    #f8fafc;
  --header-bg:     rgba(230, 238, 245, 0.85);
  
  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  --glass:       rgba(255, 255, 255, 0.7);
  
  color-scheme: light;
}
```

### 5.4 Tema 3: Mint Garden (FREE)

```css
[data-theme="mint-garden"] {
  --bg:   #c8f0e4;
  --s1:   #ffffff;
  --s2:   #e0f7ef;
  --s3:   #c4eede;
  
  --t1:   #022016;
  --t2:   #0d5c3e;
  --t3:   #4da888;
  
  --border:   rgba(2, 32, 22, 0.08);
  --border-h: rgba(2, 32, 22, 0.15);
  
  --accent:     #10b981;
  --accent-rgb: 16, 185, 129;
  --accent2:    #0055ff;
  
  --module-bar-bg: linear-gradient(180deg, #064e3b, #0c4a6e);
  --sidebar-bg:    linear-gradient(180deg, #e0f7ef, #d0ecf8);
  --header-bg:     rgba(200, 240, 228, 0.85);
  
  --card-shadow: 0 2px 12px rgba(0, 80, 50, 0.06);
  --glass:       rgba(255, 255, 255, 0.65);
  
  color-scheme: light;
}
```

### 5.5 Tema 4: Obsidian (PRO)

```css
[data-theme="obsidian"] {
  --bg:   #0a0a0f;
  --s1:   #12121a;
  --s2:   #1a1a24;
  --s3:   #22222e;
  
  --t1:   #e8e8f0;
  --t2:   #7a7a8e;
  --t3:   #4a4a58;
  
  --border:   rgba(212, 168, 83, 0.10);
  --border-h: rgba(212, 168, 83, 0.20);
  
  /* ACENTO DIFERENTE: Dourado substitui esmeralda na interface */
  --accent:     #d4a853;
  --accent-rgb: 212, 168, 83;
  --accent2:    #e8c87a;
  
  --module-bar-bg: #06060a;
  --sidebar-bg:    #0e0e14;
  --header-bg:     rgba(10, 10, 15, 0.88);
  
  --card-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  --glass:       rgba(18, 18, 26, 0.75);
  
  color-scheme: dark;
}
```

**Nota sobre acento em temas PRO:** Quando `--accent` muda (ex: dourado no Obsidian), todos os componentes que usam `--accent` atualizam automaticamente — botões, links, barras de progresso, ícones ativos, badges. As cores funcionais (--green para receita, --red para despesa) e as cores de módulo (--fin, --meta etc.) NÃO mudam — continuam fixas. O `--accent` substitui APENAS o que hoje é `--em` na interface geral (CTAs, links, seleções ativas genéricas).

### 5.6 Tema 5: Rosewood (PRO)

```css
[data-theme="rosewood"] {
  --bg:   #0f0a0d;
  --s1:   #1a1216;
  --s2:   #241a1f;
  --s3:   #2e2228;
  
  --t1:   #f0e4e8;
  --t2:   #9e7a84;
  --t3:   #5e4a52;
  
  --border:   rgba(193, 125, 106, 0.10);
  --border-h: rgba(193, 125, 106, 0.20);
  
  --accent:     #c17d6a;
  --accent-rgb: 193, 125, 106;
  --accent2:    #d4a090;
  
  --module-bar-bg: #0a0608;
  --sidebar-bg:    #120c10;
  --header-bg:     rgba(15, 10, 13, 0.88);
  
  --card-shadow: 0 2px 16px rgba(0, 0, 0, 0.45);
  --glass:       rgba(26, 18, 22, 0.75);
  
  color-scheme: dark;
}
```

### 5.7 Tema 6: Arctic (PRO)

```css
[data-theme="arctic"] {
  --bg:   #f0f4f8;
  --s1:   #ffffff;
  --s2:   #e8eef4;
  --s3:   #dce4ee;
  
  --t1:   #1a2332;
  --t2:   #4a5c72;
  --t3:   #8a9bb0;
  
  --border:   rgba(26, 35, 50, 0.07);
  --border-h: rgba(26, 35, 50, 0.13);
  
  --accent:     #0891b2;
  --accent-rgb: 8, 145, 178;
  --accent2:    #06b6d4;
  
  --module-bar-bg: linear-gradient(180deg, #1a2332, #0c4a6e);
  --sidebar-bg:    #f6f8fb;
  --header-bg:     rgba(240, 244, 248, 0.88);
  
  --card-shadow: 0 2px 12px rgba(0, 20, 40, 0.05);
  --glass:       rgba(255, 255, 255, 0.7);
  
  color-scheme: light;
}
```

### 5.8 Relação --accent vs --em vs cores de módulo

Para evitar confusão, aqui está exatamente o que cada token controla:

| Token | Controla | Muda por tema? |
|---|---|---|
| `--accent` | Cor de acento genérica da UI: botões primários, links, toggles ativos, barras de progresso genéricas, badge ativo na sidebar genérica | ✅ SIM — dourado no Obsidian, rose gold no Rosewood, cyan no Arctic |
| `--em` | Cor brand Esmeralda. Usada no logo, no gradiente do Life Sync Score, e como referência fixa | ❌ NÃO — sempre `#10b981` |
| `--el` | Cor brand Electric Blue. Usada no gradiente brand, dados | ❌ NÃO — sempre `#0055ff` |
| `--fin`, `--meta`, `--agenda`... | Cor identitária de cada módulo. Module Bar, Sidebar items ativos, badges de módulo | ❌ NÃO — fixas por módulo |
| `--green`, `--red`, `--yellow` | Semânticas: receita/despesa, sucesso/erro, aviso | ❌ NÃO — fixas globalmente |

**Na prática para os temas FREE:** `--accent` = `--em` = `#10b981`. Sem diferença visível.  
**Na prática para os temas PRO:** `--accent` ≠ `--em`. O botão CTA será dourado, mas o logo continua esmeralda.

**Implementação:** Os componentes que hoje referenciam `--em` para a cor de acento da UI devem ser migrados para `--accent`. Os que referenciam `--em` como cor brand (logo, score ring) devem permanecer com `--em`.

---

## 6. SISTEMA DE MODOS — FOCO VS JORNADA

### 6.1 O que é Modo

Modo é um toggle funcional que controla **quais componentes são visíveis** na tela. Não altera nenhuma cor ou token CSS.

| Propriedade | Foco | Jornada |
|---|---|---|
| Plano | FREE (todos) | PRO (exclusivo) |
| Dados e funcionalidades básicas | ✅ Completo | ✅ Completo |
| Layout e estrutura | Idêntico | Idêntico |
| Cores e tema | Idêntico | Idêntico |
| Componentes de IA (insights, sugestões) | ❌ Oculto | ✅ Visível |
| Gamificação (streaks, badges, XP) | ❌ Oculto | ✅ Visível |
| Life Sync Score | ❌ Oculto | ✅ Visível |
| Saudação personalizada no header | ❌ Breadcrumb técnico | ✅ "Boa tarde, Thiago!" |
| Textos motivacionais / empáticos | ❌ Dados puros | ✅ Contextual ("Melhor mês!") |
| Reviews periódicos | ❌ Oculto | ✅ Visível |
| Celebrações (confetti, badges) | ❌ Oculto | ✅ Visível |
| Micro-animações (fadeUp, stagger) | ❌ Instant | ✅ Animado |

### 6.2 Regras do Modo

- **RN-MODO-01:** Modo Foco é o padrão para todos os usuários (FREE e PRO).
- **RN-MODO-02:** Modo Jornada só pode ser ativado por usuários PRO.
- **RN-MODO-03:** Usuário FREE que clica em Jornada vê modal de upgrade (não troca).
- **RN-MODO-04:** Usuário PRO que faz downgrade para FREE é revertido para Foco automaticamente.
- **RN-MODO-05:** Modo é aplicado via atributo `data-mode` no `<html>`. Ex: `<html data-mode="foco">`.
- **RN-MODO-06:** Modo é salvo em `profiles.mode` no Supabase e em `localStorage`.
- **RN-MODO-07:** Trocar de modo NÃO recarrega a página — é reatividade CSS + state.

### 6.3 Implementação CSS do Modo

```css
/* Componentes visíveis APENAS no Jornada */
.jornada-only {
  display: block; /* ou flex, grid conforme contexto */
}

[data-mode="foco"] .jornada-only {
  display: none;
}

/* Componentes visíveis APENAS no Foco */
.foco-only {
  display: none;
}

[data-mode="foco"] .foco-only {
  display: block; /* ou flex, grid conforme contexto */
}

/* Animações apenas no Jornada */
[data-mode="jornada"] .animate-fadeup {
  animation: fadeUp 0.4s ease-out both;
}

[data-mode="foco"] .animate-fadeup {
  animation: none;
}
```

**Importante:** Usar `display: none` (não `opacity: 0` ou `max-height: 0`). Componentes ocultos NÃO devem ocupar espaço no layout, NÃO devem fazer fetch de dados, NÃO devem consumir resources.

---

## 7. ÍCONES DOS MODOS

### 7.1 Novos ícones (Lucide React)

O sistema antigo usava emojis (🎯/🌱). O novo usa ícones Lucide consistentes com o restante da interface.

| Modo | Ícone Lucide | Nome | Justificativa |
|---|---|---|---|
| **Foco** | `Crosshair` | crosshair | Mira/foco preciso. Transmite objetividade e precisão. Diferente do alvo (🎯) que é emoji |
| **Jornada** | `Sparkles` | sparkles | Brilho/magia. Transmite experiência enriquecida e premium. Sem conotação de planta (🌱) |

### 7.2 Visual no ModePill (Top Header)

```
Modo Foco:     [⊕] Foco       ← ícone Crosshair 14×14px
Modo Jornada:  [✦] Jornada    ← ícone Sparkles 14×14px
```

| Propriedade | Foco | Jornada |
|---|---|---|
| Ícone | `<Crosshair size={14} />` | `<Sparkles size={14} />` |
| Cor do ícone | `var(--t2)` | `var(--accent)` |
| Cor do texto | `var(--t2)` | `var(--accent)` |
| Background dot | `var(--s3)` | `rgba(var(--accent-rgb), 0.15)` |
| Tooltip | "Modo Foco — dados diretos" | "Modo Jornada — experiência enriquecida ✨" |

### 7.3 Componente ModePill atualizado

```tsx
import { Crosshair, Sparkles } from 'lucide-react';

function ModePill() {
  const { mode, setMode, userPlan } = useShellStore();

  const handleToggle = () => {
    if (mode === 'jornada') {
      setMode('foco');
      return;
    }
    if (userPlan === 'free') {
      openUpgradeModal('jornada');
      return;
    }
    setMode('jornada');
  };

  return (
    <button onClick={handleToggle} aria-label={`Alternar modo: atualmente ${mode}`}>
      <span className="mode-dot">
        {mode === 'foco' ? <Crosshair size={14} /> : <Sparkles size={14} />}
      </span>
      <span className="mode-label">
        {mode === 'foco' ? 'Foco' : 'Jornada'}
      </span>
    </button>
  );
}
```

### 7.4 Ícones do toggle no onboarding e configurações

Nos contextos onde Foco e Jornada são mostrados lado a lado (onboarding, configurações), usar:

```
┌─────────────────────┐   ┌─────────────────────┐
│  ⊕ Foco             │   │  ✦ Jornada     PRO  │
│                      │   │                      │
│  Dados diretos e     │   │  IA, gamificação,    │
│  objetivos. Sem      │   │  reviews, streaks    │
│  distrações.         │   │  e celebrações.      │
└─────────────────────┘   └─────────────────────┘
     Crosshair                  Sparkles
```

---

## 8. CAMADA JORNADA POR MÓDULO — O QUE MUDA

Esta seção define EXATAMENTE quais elementos são `.jornada-only` em cada módulo. Componentes não listados aqui são visíveis em ambos os modos.

### 8.1 Shell (Global — todas as telas)

| Componente | Classe | Foco | Jornada |
|---|---|---|---|
| Life Sync Score (sidebar) | `.jornada-only` | Oculto | Visível |
| Saudação personalizada (header) | `.jornada-only` | Oculto (mostra breadcrumb) | Visível |
| Breadcrumb técnico (header) | `.foco-only` | Visível | Oculto |
| Animações fadeUp no content | `[data-mode]` | Sem animação | Com animação |

### 8.2 Finanças

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Card Insight IA | `.jornada-only` | Dica personalizada baseada nos dados ("Você poupou 23% mais...") |
| Texto contextual nos stat cards | `.jornada-only` | "melhor mês!" em vez de só "↑ 12%" |
| Alertas empáticos nos orçamentos | `.jornada-only` | "🚨 Restam R$ 40!" abaixo da barra |
| Streak de registro | `.jornada-only` | Card com dias consecutivos de registro |
| Badge de conquista | `.jornada-only` | Card "Mão de Ferro" (orçamento 100%) |
| Review semanal | `.jornada-only` | Resumo de domingo |
| Resumo narrativo IA nos relatórios | `.jornada-only` | Parágrafo interpretativo acima dos gráficos |

### 8.3 Tempo (Agenda)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Insight "dia cheio" | `.jornada-only` | "6 compromissos — respire fundo 🧘" |
| Análise de distribuição de tempo | `.jornada-only` | Pie chart: "40% trabalho, 20% saúde..." |
| Sugestão de bloco de foco IA | `.jornada-only` | "Seu melhor horário para estudar é 9h-11h" |
| Badge de pontualidade | `.jornada-only` | Streak de eventos sem atraso |

### 8.4 Futuro (Objetivos)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Frase "Seu Futuro está X% construído" | `.jornada-only` | Substitui header numérico |
| Radar chart Mapa da Vida | `.jornada-only` | Visualização das 8 dimensões |
| Insights por meta ("acelerando!") | `.jornada-only` | Texto abaixo das barras |
| Previsão narrativa | `.jornada-only` | "Se mantiver, chega 2 meses antes!" |
| Celebração de marco com confetti | `.jornada-only` | Animação ao atingir marco |
| Timeline visual animada | `.jornada-only` | Substitui lista cronológica simples |

### 8.5 Corpo (Saúde)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Frase motivacional no peso | `.jornada-only` | "↓1.2kg — você está no caminho certo!" |
| Coach IA no cardápio | `.jornada-only` | Explicações por trás das sugestões |
| Streak de exercício 🔥 | `.jornada-only` | Contador visual de dias consecutivos |
| Badges fitness | `.jornada-only` | 10/30/100 treinos |
| Insights cruzados | `.jornada-only` | "Semanas com 4+ treinos = +23% produtividade" |
| Celebração em marcos (-5kg, -10kg) | `.jornada-only` | Confetti + badge |

### 8.6 Mente (Estudos)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Sons ambiente no Pomodoro | `.jornada-only` | Chuva, café, biblioteca |
| Sistema XP e níveis | `.jornada-only` | Barra de XP, nível atual |
| Streak visual tipo GitHub | `.jornada-only` | Grid de contribuições |
| Insights de produtividade | `.jornada-only` | "Sessões de 45min são 30% melhores" |
| Sugestões IA de recursos | `.jornada-only` | "Baseado na trilha React, este curso..." |

### 8.7 Patrimônio (Investimentos)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Frase motivacional patrimônio | `.jornada-only` | "Cresceu 3.2% — acima do CDI!" |
| Simulador IF | `.jornada-only` | Independência financeira em X anos |
| Benchmark vs CDI/Ibovespa | `.jornada-only` | Gráfico comparativo |
| Projeção patrimonial futura | `.jornada-only` | Cenários otimista/conservador |
| Insights IA concentração | `.jornada-only` | "28% em PETR4 — diversificar?" |

### 8.8 Carreira

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Frase no dashboard | `.jornada-only` | "Você está a 2 habilidades de Tech Lead" |
| Radar chart de habilidades animado | `.jornada-only` | Visualização radial |
| Simulador de promoção | `.jornada-only` | Impacto financeiro do próximo cargo |
| Timeline "jornada do herói" | `.jornada-only` | Roadmap animado |

### 8.9 Experiências (Viagens)

| Componente | Classe | Descrição no Jornada |
|---|---|---|
| Countdown animado | `.jornada-only` | "Faltam 45 dias para Lisboa! 🇵🇹" |
| Sugestões IA ilimitadas | `.jornada-only` | Assistente conversacional |
| Diário pós-viagem | `.jornada-only` | Registro de memórias |
| Export PDF | `.jornada-only` | Roteiro exportável |

---

## 9. IMPLEMENTAÇÃO TÉCNICA — CSS

### 9.1 Arquivo de temas

Criar arquivo dedicado:

```
src/
  styles/
    themes.css          ← definições de todos os 6 temas
    globals.css         ← tokens comuns + imports
```

### 9.2 themes.css — Estrutura

```css
/* ═══ TOKENS COMUNS (não variam por tema) ═══ */
:root {
  /* Cores funcionais */
  --green: #10b981;
  --yellow: #f59e0b;
  --orange: #f97316;
  --red: #f43f5e;
  
  /* Brand (fixas) */
  --em: #10b981;
  --el: #0055ff;
  --grad-brand: linear-gradient(135deg, #10b981, #0055ff);
  
  /* Cores de módulo (fixas) */
  --fin: #10b981;
  --meta: #0055ff;
  --agenda: #06b6d4;
  --conq: #f59e0b;
  --cfg: #64748b;
  
  /* Glows de módulo (fixos) */
  --fin-glow: rgba(16, 185, 129, 0.12);
  --meta-glow: rgba(0, 85, 255, 0.12);
  --agenda-glow: rgba(6, 182, 212, 0.12);
  --conq-glow: rgba(245, 158, 11, 0.12);
  --cfg-glow: rgba(100, 116, 139, 0.12);
  
  /* Layout */
  --sb: 228px;
  --sb-c: 56px;
  --mb: 64px;
  --header-h: 54px;
  
  /* Radii */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius: 16px;
  --radius-lg: 24px;
  
  /* Transições */
  --transition-theme: background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══ TEMA 1: Navy Dark ═══ */
[data-theme="navy-dark"] { /* ... tokens da seção 5.2 ... */ }

/* ═══ TEMA 2: Clean Light ═══ */
[data-theme="clean-light"] { /* ... tokens da seção 5.3 ... */ }

/* ... demais temas ... */

/* ═══ MODO: Foco/Jornada ═══ */
[data-mode="foco"] .jornada-only { display: none !important; }
[data-mode="jornada"] .foco-only { display: none !important; }

/* Animações condicionais */
[data-mode="jornada"] .animate-fadeup {
  animation: fadeUp 0.4s ease-out both;
}
[data-mode="foco"] .animate-fadeup {
  animation: none;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 9.3 Script anti-FOUC (Flash of Unstyled Content)

Inserir no `<head>` ANTES do CSS para evitar flash de tema errado:

```html
<!-- Em app/layout.tsx, dentro do <head> -->
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    try {
      var theme = localStorage.getItem('synclife-theme') || 'system';
      var mode = localStorage.getItem('synclife-mode') || 'foco';
      
      if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'navy-dark' : 'clean-light';
      }
      
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-mode', mode);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'navy-dark');
      document.documentElement.setAttribute('data-mode', 'foco');
    }
  })();
`}} />
```

---

## 10. IMPLEMENTAÇÃO TÉCNICA — ZUSTAND STORE

### 10.1 Store atualizado

Substituir os campos `theme: 'dark' | 'light'` e `mode: 'foco' | 'jornada'` da spec 17 por:

```typescript
// store/shell-store.ts

type ThemeId = 'navy-dark' | 'clean-light' | 'mint-garden' | 'obsidian' | 'rosewood' | 'arctic' | 'system';
type ModeId = 'foco' | 'jornada';

interface ShellState {
  // ... demais campos do doc 17 ...
  
  theme: ThemeId;
  resolvedTheme: Exclude<ThemeId, 'system'>; // o tema efetivo após resolver 'system'
  mode: ModeId;
  
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: ModeId) => void;
}
```

### 10.2 Lógica de resolução do tema system

```typescript
function resolveSystemTheme(): 'navy-dark' | 'clean-light' {
  if (typeof window === 'undefined') return 'navy-dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'navy-dark' : 'clean-light';
}
```

### 10.3 Listener de mudança do OS

```typescript
// Em useEffect no AppShell ou provider raiz
useEffect(() => {
  if (theme !== 'system') return;
  
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    const resolved = e.matches ? 'navy-dark' : 'clean-light';
    document.documentElement.setAttribute('data-theme', resolved);
    setResolvedTheme(resolved);
  };
  
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, [theme]);
```

---

## 11. IMPLEMENTAÇÃO TÉCNICA — COMPONENTES REACT

### 11.1 Helper component para condicional de modo

```tsx
// components/ui/mode-visible.tsx

interface ModeVisibleProps {
  mode: 'foco' | 'jornada';
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function ModeVisible({ mode, children, as: Tag = 'div', className = '' }: ModeVisibleProps) {
  const visibilityClass = mode === 'jornada' ? 'jornada-only' : 'foco-only';
  return <Tag className={`${visibilityClass} ${className}`}>{children}</Tag>;
}

// Uso:
<ModeVisible mode="jornada">
  <InsightCard text="Você poupou 23% mais este mês!" />
</ModeVisible>

<ModeVisible mode="foco">
  <Breadcrumb path={["Finanças", "Dashboard", "Fevereiro 2026"]} />
</ModeVisible>
```

### 11.2 Hook useMode

```tsx
// hooks/use-mode.ts

export function useMode() {
  const mode = useShellStore(s => s.mode);
  return {
    mode,
    isJornada: mode === 'jornada',
    isFoco: mode === 'foco',
  };
}
```

### 11.3 Quando usar CSS (.jornada-only) vs JavaScript (useMode)

| Cenário | Abordagem | Motivo |
|---|---|---|
| Mostrar/ocultar um bloco visual | CSS (`.jornada-only`) | Zero JS, rendering instantâneo |
| Alterar texto de um elemento | JS (`useMode`) | Conteúdo textual não é controlável por CSS |
| Decidir se faz fetch de dados | JS (`useMode`) | Evitar requests desnecessários no Foco |
| Controlar animações | CSS (`[data-mode]`) | Performance de animação |

---

## 12. GATE PRO — TEMAS E MODO

### 12.1 Gate de Temas PRO

```typescript
const PRO_THEMES: ThemeId[] = ['obsidian', 'rosewood', 'arctic'];

function handleThemeChange(newTheme: ThemeId) {
  if (PRO_THEMES.includes(newTheme) && userPlan === 'free') {
    openUpgradeModal('theme', newTheme);
    return;
  }
  setTheme(newTheme);
}
```

### 12.2 Gate de Modo Jornada

Mantido conforme doc 17, seção 13.3 — sem alterações na lógica, apenas nos ícones (seção 7 deste doc).

### 12.3 Downgrade handling

```typescript
// Executar quando plano mudar de PRO para FREE
function handlePlanDowngrade() {
  // Reverter tema PRO
  if (PRO_THEMES.includes(currentTheme)) {
    setTheme('system');
  }
  // Reverter modo Jornada
  if (currentMode === 'jornada') {
    setMode('foco');
  }
}
```

---

## 13. PERSISTÊNCIA E SYNC

### 13.1 localStorage (leitura rápida)

```
synclife-theme = 'navy-dark' | 'clean-light' | 'mint-garden' | 'obsidian' | 'rosewood' | 'arctic' | 'system'
synclife-mode  = 'foco' | 'jornada'
```

### 13.2 Supabase (source of truth)

```sql
-- Alteração na tabela profiles
ALTER TABLE profiles
  DROP COLUMN IF EXISTS theme,       -- era 'dark' | 'light'
  ADD COLUMN theme TEXT DEFAULT 'system'
    CHECK (theme IN ('navy-dark', 'clean-light', 'mint-garden', 'obsidian', 'rosewood', 'arctic', 'system')),
  DROP COLUMN IF EXISTS mode,        -- era 'focus' | 'journey'
  ADD COLUMN mode TEXT DEFAULT 'foco'
    CHECK (mode IN ('foco', 'jornada'));
```

### 13.3 Fluxo de sync

1. **Ao carregar:** localStorage → aplicar tema/modo instantaneamente (anti-FOUC)
2. **Após auth:** Supabase `profiles` → comparar com localStorage → se diferente, Supabase vence
3. **Ao alterar:** gravar em localStorage E disparar upsert no Supabase simultaneamente

---

## 14. TELA DE CONFIGURAÇÕES — APARÊNCIA

### 14.1 Nova seção em Configurações

Adicionar item na sidebar de Configurações:

```typescript
// Em MODULES.configuracoes.navItems, adicionar:
{ id: 'aparencia', label: 'Aparência', icon: 'palette', href: '/configuracoes/aparencia' }
```

**Posição:** Após "Perfil", antes de "Modo de Uso".

### 14.2 Conteúdo da tela

```
┌──────────────────────────────────────────────────────────┐
│  Aparência                                               │
│                                                          │
│  TEMA                                                    │
│  ──────────────────────────────────────────               │
│                                                          │
│  ● Automático (segue seu dispositivo)                    │
│    Usa Navy Dark no modo escuro e Clean Light no claro   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  FREE                                               │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                      │ │
│  │  │ mini │  │ mini │  │ mini │                      │ │
│  │  │ prev │  │ prev │  │ prev │                      │ │
│  │  │      │  │      │  │      │                      │ │
│  │  │ Navy │  │Clean │  │ Mint │                      │ │
│  │  │ Dark │  │Light │  │Garden│                      │ │
│  │  └──────┘  └──────┘  └──────┘                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  PRO ✨                                             │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                      │ │
│  │  │ mini │  │ mini │  │ mini │                      │ │
│  │  │ prev │  │ prev │  │ prev │                      │ │
│  │  │  🔒  │  │  🔒  │  │  🔒  │                      │ │
│  │  │Obsid.│  │ Rose │  │Arctic│                      │ │
│  │  │      │  │ wood │  │      │                      │ │
│  │  └──────┘  └──────┘  └──────┘                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  MODO DE EXPERIÊNCIA                                     │
│  ──────────────────────────────────────────               │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  ⊕ Foco        ✓   │  │  ✦ Jornada    PRO   │       │
│  │                      │  │                      │       │
│  │  Dados diretos sem   │  │  + Insights IA       │       │
│  │  distrações. Ideal   │  │  + Gamificação       │       │
│  │  para quem quer só   │  │  + Reviews semanais  │       │
│  │  controle.           │  │  + Celebrações       │       │
│  └─────────────────────┘  └─────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 14.3 Miniatura dos temas

Cada miniatura é um retângulo 120×80px mostrando uma versão simplificada do dashboard (Module Bar + sidebar + 2 cards) nas cores do tema. Ao clicar, aplica o tema imediatamente como preview. O tema é salvo ao sair da tela.

---

## 15. MIGRAÇÃO DO SISTEMA ANTIGO

### 15.1 Tabela de migração

| Campo antigo (profiles) | Valor antigo | Novo campo | Novo valor |
|---|---|---|---|
| `theme = 'dark'` | Dark mode | `theme = 'system'` | Automático |
| `theme = 'light'` | Light mode | `theme = 'system'` | Automático |
| `mode = 'focus'` | Modo Foco | `mode = 'foco'` | Foco |
| `mode = 'journey'` | Modo Jornada | `mode = 'jornada'` | Jornada |

### 15.2 Migration SQL

```sql
-- Migration: migrate_theme_mode_v2
UPDATE profiles SET
  theme = 'system',
  mode = CASE
    WHEN mode = 'focus' THEN 'foco'
    WHEN mode = 'journey' THEN 'jornada'
    ELSE 'foco'
  END;
```

### 15.3 CSS: Eliminar paletas antigas

Remover completamente:
- `[data-theme="dark"][data-mode="jornada"]` (antigo Dark Jornada verde #020d08)
- `[data-theme="light"][data-mode="jornada"]` (antigo Light Jornada menta)
- Qualquer override de `--bg`, `--s1` etc. condicionado a `.jornada`

O modo Jornada NÃO tem overrides de cor. Apenas `.jornada-only` / `.foco-only` para visibilidade.

---

## 16. IMPACTO NOS DOCUMENTOS EXISTENTES

| Documento | Seção impactada | Ação necessária |
|---|---|---|
| **11-UX-UI-NAVEGACAO-REVISADO.md** | "Paleta Principal — Tema Dark Jornada" e "Light Jornada" | Remover essas duas paletas. Substituir por referência a este doc (19). |
| **11-UX-UI-NAVEGACAO-REVISADO.md** | "Cor de Acento por Módulo" | Adicionar nota: "--accent pode variar em temas PRO, mas cores de módulo são fixas" |
| **16-GUIA-CRIACAO-SPEC-DE-TELAS.md** | Seção 2.4 "Quatro combinações de tema obrigatórias" | Reescrever: de "4 combinações" para "6 temas × 2 modos = 12 combinações teóricas, mas temas são automáticos via tokens" |
| **16-GUIA-CRIACAO-SPEC-DE-TELAS.md** | Seção 5 "Modos Foco e Jornada" | Adicionar: "Jornada NÃO muda cores. Usar classe .jornada-only para elementos exclusivos." |
| **17-NAVEGACAO-SHELL-DEV-SPEC.md** | Seção 13 "Toggle de Modo" | Atualizar ícones (Crosshair/Sparkles). Atualizar ShellState type de `'dark'\|'light'` para ThemeId. |
| **17-NAVEGACAO-SHELL-DEV-SPEC.md** | Seção 14 "Toggle de Tema" | Reescrever: de ThemePill (Dark/Light toggle) para link "Aparência" nas Configurações, ou manter pill mas com seleção dos 6 temas. |
| **17-NAVEGACAO-SHELL-DEV-SPEC.md** | Seção 18 "Quatro Combinações Visuais" | Reescrever: de 4 para 6 temas, e explicar que modo é funcional. |
| **configuracoes-dev-spec.md** | Seção de Modo de Uso | Adicionar seção "Aparência" com seletor de temas. |
| **15-AUTH-ONBOARDING-DEV-SPEC.md** | Step de escolha de modo | Atualizar ícones e textos. Remover menção a "duas personalidades visuais". Focar em funcionalidades. |
| **Todos os SPEC-*.md de módulos** | Seções "Modo Foco vs Jornada" | Validar que as diferenças listadas são apenas de componentes visíveis, não de cores. |

---

## 17. TESTES UNITÁRIOS

### 17.1 Testes de temas (18 testes)

```
describe('Theme System')
  ✓ deve aplicar data-theme="navy-dark" por padrão quando system preference é dark
  ✓ deve aplicar data-theme="clean-light" por padrão quando system preference é light
  ✓ deve trocar tema ao chamar setTheme()
  ✓ deve persistir tema no localStorage ao trocar
  ✓ deve ler tema do localStorage ao inicializar
  ✓ deve reagir a mudança de prefers-color-scheme quando tema é "system"
  ✓ deve NÃO reagir a prefers-color-scheme quando tema é fixo (não "system")
  ✓ deve aplicar tokens CSS corretos para navy-dark
  ✓ deve aplicar tokens CSS corretos para clean-light
  ✓ deve aplicar tokens CSS corretos para mint-garden
  ✓ deve aplicar tokens CSS corretos para obsidian
  ✓ deve aplicar tokens CSS corretos para rosewood
  ✓ deve aplicar tokens CSS corretos para arctic
  ✓ deve bloquear tema PRO para usuário FREE (abre modal)
  ✓ deve permitir tema PRO para usuário PRO
  ✓ deve reverter para "system" quando PRO faz downgrade usando tema PRO
  ✓ deve manter cores funcionais (--green, --red) iguais em todos os temas
  ✓ deve manter cores de módulo (--fin, --meta) iguais em todos os temas
```

### 17.2 Testes de modo (14 testes)

```
describe('Mode System')
  ✓ deve aplicar data-mode="foco" por padrão
  ✓ deve trocar modo ao chamar setMode()
  ✓ deve persistir modo no localStorage
  ✓ deve ocultar .jornada-only quando modo é foco
  ✓ deve ocultar .foco-only quando modo é jornada
  ✓ deve exibir .jornada-only quando modo é jornada
  ✓ deve exibir .foco-only quando modo é foco
  ✓ deve bloquear Jornada para usuário FREE (abre modal)
  ✓ deve permitir Jornada para usuário PRO
  ✓ deve reverter para Foco quando PRO faz downgrade
  ✓ deve NÃO alterar nenhum token CSS ao trocar modo
  ✓ deve desabilitar animações no modo Foco
  ✓ deve habilitar animações no modo Jornada
  ✓ deve manter mesmo layout (dimensões) em ambos os modos
```

### 17.3 Testes do ModePill (8 testes)

```
describe('ModePill Component')
  ✓ deve renderizar ícone Crosshair no modo Foco
  ✓ deve renderizar ícone Sparkles no modo Jornada
  ✓ deve exibir texto "Foco" no modo Foco
  ✓ deve exibir texto "Jornada" no modo Jornada
  ✓ deve abrir modal upgrade ao clicar para Jornada sendo FREE
  ✓ deve trocar para Jornada ao clicar sendo PRO
  ✓ deve sempre permitir voltar para Foco
  ✓ deve ter aria-label correto
```

### 17.4 Testes de persistência (6 testes)

```
describe('Persistence')
  ✓ deve sincronizar tema com Supabase ao alterar
  ✓ deve sincronizar modo com Supabase ao alterar
  ✓ deve priorizar Supabase sobre localStorage após auth
  ✓ deve usar localStorage quando offline
  ✓ deve migrar tema antigo ('dark'→'system') corretamente
  ✓ deve migrar modo antigo ('focus'→'foco', 'journey'→'jornada')
```

**Total: 46 testes unitários**

---

## 18. ATIVIDADES PARA O CLAUDE CODE

### Fase 1 — CSS Foundation (estimativa: 2h)

```
1.1  Criar src/styles/themes.css com os 6 temas + tokens comuns
1.2  Criar classes .jornada-only e .foco-only
1.3  Adicionar script anti-FOUC no app/layout.tsx
1.4  Remover paletas antigas (Dark Jornada #020d08, Light Jornada #c8f0e4 como modo)
```

### Fase 2 — Store e Lógica (estimativa: 2h)

```
2.1  Atualizar shell-store.ts: ThemeId (7 opções), ModeId (2 opções)
2.2  Implementar resolveSystemTheme() e listener de OS
2.3  Implementar gate PRO para temas e modo
2.4  Implementar handlePlanDowngrade()
```

### Fase 3 — Componentes (estimativa: 2h)

```
3.1  Atualizar ModePill: ícones Crosshair/Sparkles (Lucide)
3.2  Criar componente <ModeVisible mode="jornada|foco">
3.3  Criar hook useMode()
3.4  Criar hook useTheme() (retorna tema + resolvedTheme + isDark)
```

### Fase 4 — Configurações (estimativa: 3h)

```
4.1  Adicionar rota /configuracoes/aparencia
4.2  Criar tela com seletor de temas (miniaturas) + seletor de modo
4.3  Implementar preview ao clicar
4.4  Implementar gate PRO (lock nos temas PRO, modal upgrade)
```

### Fase 5 — Persistência (estimativa: 1h)

```
5.1  Migration SQL: alterar profiles (theme, mode)
5.2  Sync localStorage ↔ Supabase
5.3  Migration de dados antigos
```

### Fase 6 — Testes (estimativa: 3h)

```
6.1  46 testes unitários conforme seção 17
6.2  Teste visual: cada tema em tela de Finanças Dashboard
6.3  Teste visual: Foco vs Jornada em tela de Finanças Dashboard
```

**Estimativa total: ~13h de desenvolvimento**

---

*Documento criado em: 28/02/2026*  
*Versão: 1.0*  
*Autor: Claude (assistente de desenvolvimento SyncLife)*  
*Status: Aguardando aprovação para implementação*
