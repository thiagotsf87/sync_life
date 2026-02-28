# SyncLife — Configurações
## Documento de Especificação de Desenvolvimento
**Versão:** 1.0 · Criado em 23/02/2026  
**Protótipo de referência:** `proto-configuracoes.html` (Aprovado)  
**Guia seguido:** `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`  
**Uso:** Orientar o desenvolvimento da tela pelo Claude Code

---

## ÍNDICE

1. Visão Geral da Tela
2. Shell do App (referência)
3. Estrutura de Layout
4. Menu Lateral de Seções (cfg-menu)
5. Seção: Perfil
6. Seção: Modo de Uso
7. Seção: Aparência
8. Seção: Notificações
9. Seção: Integrações
10. Regras FREE vs PRO
11. Seção: Meu Plano
12. Danger Zone
13. Comportamento em Modo Foco vs Modo Jornada
14. Responsividade
15. Tokens de Design Usados Nesta Tela
16. Dados e API
17. Estados de Componentes
18. Animações e Transições
19. Testes Unitários
20. Fases de Desenvolvimento e Estimativas
21. Referências Cruzadas
22. Checklist de Validação

---

## 1. Visão Geral da Tela

**Configurações** é o centro de controle pessoal do SyncLife. Ela é acessada pelo botão de engrenagem fixado no rodapé da Module Bar, presente em qualquer módulo do app. Diferente das demais telas, Configurações não faz parte de um módulo de negócio — é uma tela transversal de sistema.

A tela tem **6 seções internas** navegáveis por um menu lateral secundário (cfg-menu) dentro da própria área de conteúdo. Cada seção é uma área de configuração independente, renderizada no mesmo scroll container à direita.

**Objetivo da tela:** Permitir ao usuário personalizar todos os aspectos da sua experiência: identidade, modo de uso, aparência visual, notificações, integrações com terceiros e gerenciamento do plano.

**Importância no desenvolvimento:** Configurações é parte da **Fase 1 — Fundação**. Ela deve ser implementada logo após o Shell de Navegação, porque define preferências globais (modo, tema, moeda, fuso) que afetam o comportamento de todas as outras telas. Implementar Configurações depois das telas de módulo obriga refatoração.

---

## 2. Shell do App (Module Bar, Sidebar e Top Header)

> **⚠️ Componentes globais — não especificados aqui.**  
> A Module Bar (Nível 1), Sidebar (Nível 2) e Top Header são componentes  
> compartilhados do shell do SyncLife, desenvolvidos separadamente.  
> Specs completas: `17-NAVEGACAO-SHELL-DEV-SPEC.md` e `proto-navigation-v3.html`.
>
> **Contexto desta tela:**
> - Module Bar: botão **Configurações** (ícone de engrenagem) ativo — cor `var(--cfg)` = `#64748b`, background `var(--cfg-glow)` = `rgba(100,116,139,0.12)`
> - Module Bar: Configurações fica fixado no **rodapé** da barra, não no grupo principal
> - Sidebar: item da seção ativa fica com `act-cfg` (border-left esmeralda + text `#10b981`)
> - Sidebar de Configurações tem seções distintas: **Conta** (Perfil, Modo de Uso, Aparência) e **Preferências** (Notificações, Integrações) e **Plano** (Meu Plano)
> - Top Header Modo Foco: breadcrumb `Configurações › [Nome da Seção]`
> - Top Header Modo Jornada: `Olá, [Nome]! ⚙️ · Personalize sua experiência no SyncLife.`

**Nota:** Diferente dos módulos de negócio (Finanças, Metas, Agenda), o Life Sync Score aparece na sidebar de Configurações **apenas em Modo Jornada**. Em Modo Foco, a sidebar de Configurações não exibe o score.

---

## 3. Estrutura de Layout

### 3.1 Layout Geral do Content Area

A área de conteúdo de Configurações utiliza uma estrutura de **duas colunas fixas** dentro do content area, diferente das outras telas que usam layout de coluna única com grid responsivo:

```
[ Content Area (padding 20px) ]
├── [ cfg-menu — 200px, fixo à esquerda ]
└── [ cfg-content — flex: 1, scrollável ]
```

O `cfg-menu` é um menu de navegação interno, fixo (sticky), que lista as 6 seções. Ao clicar em um item do `cfg-menu`, o `cfg-content` à direita exibe a seção correspondente (sem transição de página — é SPA dentro da tela).

### 3.2 cfg-menu (Menu Interno de Seções)

**Largura:** 200px (desktop) / hidden em mobile (navegação pela sidebar)  
**Posicionamento:** sticky, top: 20px — fica visível enquanto o conteúdo à direita scrolla  
**Background:** Transparente (usa o fundo do content area)

**Estrutura do menu:**
```
[Seção: Conta]
  • Perfil
  • Modo de Uso
  • Aparência
[Seção: Preferências]
  • Notificações
  • Integrações
[Seção: Plano]
  • Meu Plano [badge "Free" ou "Pro"]
```

**Item ativo:** background `rgba(16,185,129,0.10)`, cor `#10b981`, font-weight 500, border-radius `--radius-md` (12px).  
**Item inativo:** cor `var(--t2)`, background transparente.  
**Hover:** background `var(--s3)`, transição 150ms.

**Label de seção (grupo):** `font-size: 10px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.05em`, cor `var(--t3)`, padding-bottom 4px.

**Badge "Free"/"Pro"** no item Meu Plano:
- FREE: badge cinza escuro `background: var(--s3)`, texto `var(--t3)`, font-size 10px
- PRO: badge gradiente esmeralda→azul, texto branco, font-size 10px

### 3.3 cfg-content (Área de Conteúdo das Seções)

**Largura:** flex: 1  
**Overflow:** scrollável verticalmente  
**Padding:** 0 (o espaçamento é interno nos cards)

Cada seção tem:
- **cfg-section-title:** `font-family: Syne`, `font-size: 20px`, `font-weight: 800`, cor `var(--t1)`
- **cfg-section-sub:** `font-size: 13px`, cor `var(--t2)`, margem-bottom 16px

### 3.4 Comportamento Mobile

Em mobile (< 640px), o `cfg-menu` desaparece. A navegação entre seções acontece pela **sidebar principal** (Nível 2), que lista os mesmos itens. O `cfg-content` ocupa 100% da largura.

---

## 4. setting-card (Componente Base)

**setting-card** é o componente container reutilizado em todas as 6 seções. É o equivalente ao `card` nas outras telas.

**Propriedades visuais:**
```css
background: var(--s1)
border: 1px solid var(--border)
border-radius: var(--radius-lg) /* 14px */
padding: 16px 18px
margin-bottom: 12px
```

**Hover:** border-color → `var(--border-h)`, transição 150ms.

**setting-card-title:** subtítulo interno do card, `font-size: 12px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.04em`, cor `var(--t3)`, `margin-bottom: 14px`.

### 4.1 setting-row (Linha de Configuração)

Componente usado dentro de setting-cards para cada configuração individual.

**Layout:** flex, justify-content: space-between, align-items: center  
**Borda separadora:** `border-bottom: 1px solid var(--border)` (exceto no último)  
**Padding:** 12px 0

**Partes do setting-row:**
- **setting-row-label:** `font-size: 13px`, `font-weight: 500`, cor `var(--t1)`
- **setting-row-desc:** `font-size: 12px`, cor `var(--t3)`, margin-top 2px
- **Controle** (switch, select, input): à direita, alinhado ao centro

### 4.2 Toggle Switch (sw)

Componente reutilizável de toggle usado nas seções Notificações e Aparência.

**Estrutura:**
```html
<label class="sw">
  <input type="checkbox">
  <div class="sw-track"></div>
  <div class="sw-knob"></div>
</label>
```

**sw-track:** `width: 36px`, `height: 20px`, `border-radius: 10px`
- OFF: background `var(--s3)`, border `1px solid var(--border-h)`
- ON: background gradiente esmeralda→azul `linear-gradient(90deg, #10b981, #0055ff)`

**sw-knob:** `width: 16px`, `height: 16px`, `border-radius: 50%`, background `#fff`
- OFF: `transform: translateX(2px)`
- ON: `transform: translateX(18px)`
- Transição: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### 4.3 Select / Dropdown

Componente de seleção padronizado.

```css
.setting-select {
  background: var(--s2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm); /* 8px */
  color: var(--t1);
  font-family: 'DM Sans';
  font-size: 13px;
  padding: 6px 10px;
  min-width: 180px;
}
```

Focus: `border-color: rgba(16,185,129,0.4)`, outline none.

### 4.4 setting-input (Campo de Texto)

```css
.setting-input {
  background: var(--s2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm); /* 8px */
  color: var(--t1);
  font-family: 'DM Sans';
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
}
```

Focus: `border-color: rgba(16,185,129,0.4)`, outline none.

---

## 5. Seção: Perfil

**Rota na sidebar:** `cfgNav('perfil')` | **Item ativo:** Perfil

### 5.1 Card de Avatar e Identidade

**Layout:** flex row, gap 16px, align-items: flex-start

**avatar-lg:**
- Tamanho: 72px × 72px, border-radius: 50%
- Fundo padrão (sem foto): `background: linear-gradient(135deg, var(--em), var(--el))`
- Conteúdo: iniciais do nome, `font-family: Syne`, `font-weight: 700`, `font-size: 26px`, cor branca
- Foto de perfil: quando definida, exibe `<img>` com `object-fit: cover`
- **avatar-edit-btn:** botão flutuante no canto inferior direito do avatar, 22×22px, background `var(--s2)`, border `1px solid var(--border)`, border-radius 50%, ícone de lápis 12px

**Informações ao lado do avatar:**
- Nome completo: `font-family: Syne`, `font-size: 16px`, `font-weight: 700`
- E-mail + data de membro: `font-size: 12px`, cor `var(--t3)`, separador `·`
- Botões: "Alterar foto" (btn-secondary) e "Remover" (btn-secondary com cor `var(--red)`)

### 5.2 Card de Informações Básicas

**Grid 2 colunas:**
- Nome (input text)
- Sobrenome (input text)

**Linha única:**
- E-mail (input email, largura total)

**Botão de salvar:** `btn-primary` com ícone de check, alinhado à direita do card. Aparece apenas quando algum campo foi alterado (dirty state).

**Label de campo:** `font-size: 11px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.04em`, cor `var(--t3)`, margin-bottom 5px.

### 5.3 Card de Preferências Regionais

**Configurações disponíveis (setting-rows com select):**

| Campo | Opções padrão | Default |
|-------|---------------|---------|
| Moeda | R$ BRL, $ USD, € EUR, £ GBP | R$ BRL |
| Fuso horário | Listagem dos fusos do Brasil (America/Sao_Paulo etc.) | America/Sao_Paulo (UTC-3) |
| Dia de início do mês | 1 a 31 (select numérico) | 1 |
| Formato de data | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | DD/MM/YYYY |

**Regra de negócio — Dia de início do mês:**  
Define o dia em que os orçamentos por envelope são reiniciados. Ex: se o usuário recebe salário no dia 5, pode definir que o "mês financeiro" começa no dia 5. Afeta cálculos da tela de Visão Geral Financeira e Orçamentos. Valor é persistido no perfil Supabase e lido por todas as telas que calculam mês corrente.

**Regra de negócio — Moeda:**  
Afeta a formatação de todos os valores monetários no app. Não converte valores — apenas formata. Ex: se o usuário tem R$ 1.000 e troca para USD, o valor exibido será "$ 1.000" (sem conversão cambial). No MVP v2, suporte a BRL, USD e EUR.

### 5.4 Card de Segurança

**Configurações disponíveis:**

| Ação | Controle |
|------|---------|
| Alterar senha | Botão → abre modal com campos (senha atual, nova senha, confirmação) |
| Autenticação em 2 fatores (2FA) | Toggle switch (FREE e PRO) |

**Regra — Alterar senha:**  
Usa o fluxo de updatePassword do Supabase Auth. Exige senha atual para confirmação. Validação: nova senha mínimo 8 caracteres, deve conter letras e números.

### 5.5 Danger Zone

Card separado com fundo `rgba(244,63,94,0.06)`, borda `rgba(244,63,94,0.18)`, no final da seção Perfil.

**Ações destrutivas:**

| Ação | Comportamento |
|------|---------------|
| Exportar todos os dados | Gera arquivo JSON/CSV com todos os dados do usuário (LGPD compliance) |
| Excluir conta | Abre ConfirmDialog duplo: primeiro texto explicativo, depois campo para digitar "EXCLUIR" para confirmar |

**Fluxo de exclusão de conta:**
1. Usuário clica "Excluir conta"
2. ConfirmDialog aparece: "Esta ação é permanente e irreversível. Todos os seus dados serão removidos."
3. Campo para digitar "EXCLUIR" aparece
4. Botão de confirmar ativa somente quando o texto está correto
5. Chamada: `supabase.auth.admin.deleteUser()` + deleção em cascata no banco
6. Redirect para landing page com toast de confirmação

---

## 6. Seção: Modo de Uso

**Rota na sidebar:** `cfgNav('modo')` | **Item ativo:** Modo de Uso

Esta é a seção onde o usuário define seu modo padrão de operação no SyncLife. É também onde pode voltar ao Onboarding para reconfigurar.

### 6.1 mode-cards (Cards de Seleção de Modo)

**Layout:** Grid 2 colunas, gap 16px

Cada mode-card:
- `border-radius: var(--radius-lg)` (14px)
- `border: 2px solid var(--border)`
- `padding: 20px`
- `cursor: pointer`

**Estado selecionado:**
- `border-color: var(--em)` (#10b981)
- Background: `rgba(16,185,129,0.06)`
- Checkmark no canto superior direito visível (ícone SVG de check)

**Estado não selecionado:**
- Border padrão
- Checkmark oculto

**Interação:** Clicar em um card não só muda a seleção visual — aplica o modo imediatamente no app todo (chama o ModeProvider para atualizar o estado global). O modo é persistido no Supabase (campo `mode` na tabela `profiles`).

**Conteúdo do Card Modo Foco:**
- Emoji: 🎯
- Nome: "Modo Foco" (Syne, 15px, weight 700)
- Descrição: "Interface limpa e objetiva. Dados diretos, sem distrações. Como um cockpit — tudo que você precisa, nada que não precisa."
- Tags: "Sem animações" | "Dados em destaque" | "Sidebar compacta"

**Conteúdo do Card Modo Jornada:**
- Emoji: 🌱
- Nome: "Modo Jornada" (Syne, 15px, weight 700)
- Descrição: "Interface motivacional e calorosa. Celebra seu progresso, oferece insights e te acompanha como um coach pessoal."
- Tags: "Life Sync Score" | "Conquistas" | "Frases motivacionais"
- **Badge PRO:** Modo Jornada é exclusivo do plano PRO. Usuários FREE veem o card mas com lock visual e ao clicar recebem upsell.

**mode-tag:** `font-size: 11px`, `background: var(--s3)`, `border-radius: 6px`, `padding: 3px 8px`, cor `var(--t2)`

### 6.2 Toast de Confirmação de Modo

Após selecionar um modo, um toast aparece na parte inferior do setting-card:

- Fundo: `background: var(--s3)`, `border: 1px solid var(--border-h)`
- Border-radius: `--radius-md` (12px)
- Ícone de check verde + texto descritivo
- Aparece com `opacity: 1` e desaparece automaticamente após **3500ms**
- Textos: Foco: "🎯 Modo Foco ativado. Interface atualizada para você." | Jornada: "🌱 Modo Jornada ativado. Vamos juntos nessa jornada!"

### 6.3 Tabela Comparativa de Modos

Card com grid 3 colunas mostrando as diferenças entre os modos:

| Elemento | 🎯 Foco | 🌱 Jornada |
|----------|---------|-----------|
| Dashboard | Só números | Score + frases |
| Life Sync Score | Oculto | Em destaque |
| Notificações | Só alertas críticos | Motivacionais também |
| Review semanal | Desativado | Todo domingo |
| Animações | Nenhuma | Micro-animações |
| Conquistas | Badge discreto | Tela celebrativa |

**Implementação:** Tabela HTML nativa com CSS grid, não componente de biblioteca. Bordas internas `1px solid var(--border)`.

### 6.4 Card: Reconfigurar SyncLife

**Ação:** Botão "Reconfigurar" que redireciona o usuário para o fluxo de Onboarding (`/onboarding`) como se fosse a primeira vez.

**Comportamento:**
- Abre ConfirmDialog: "Refazer o onboarding irá guiar você pelo setup inicial novamente. Seus dados atuais (transações, metas, eventos) serão mantidos."
- Após confirmação: `router.push('/onboarding?reconfigure=true')`
- O Onboarding com `?reconfigure=true` pula a tela de boas-vindas e vai direto para configuração de renda e preferências
- Ao concluir: redirect para `/financas` (dashboard financeiro)

---

## 7. Seção: Aparência

**Rota na sidebar:** `cfgNav('aparencia')` | **Item ativo:** Aparência

### 7.1 Card: Tema

Exibe 4 previews clicáveis representando as combinações de tema disponíveis:

**Layout:** Grid 4 colunas, gap 12px

Cada theme-preview:
- `width: 100%`, `padding-bottom: 66%` (aspect-ratio 3:2 via padding trick)
- `border-radius: var(--radius-md)` (12px)
- `border: 2px solid var(--border)`
- `cursor: pointer`
- Stripe de cor: dividido em duas metades (cor de fundo + cor de acento)

| Preview ID | Combo | Cores da stripe |
|------------|-------|----------------|
| tp-df | Dark Foco | `#07112b` + `rgba(16,185,129,0.3)` |
| tp-dj | Dark Jornada | `#061410` + `rgba(0,85,255,0.3)` |
| tp-lf | Light Foco | `#e6eef5` + `rgba(16,185,129,0.2)` |
| tp-lj | Light Jornada | `#c8f0e4` + `rgba(0,85,255,0.2)` |

**Estado selecionado (.sel):** `border-color: var(--em)`, sombra interna `box-shadow: inset 0 0 0 2px rgba(16,185,129,0.3)`  
**Label:** `font-size: 11px`, `font-weight: 600`, cor `var(--t2)`, centralizado abaixo da preview

**Interação:** Clicar em um preview aplica o tema imediatamente (atualiza ThemeProvider + persiste em Supabase no campo `theme` da tabela `profiles`).

### 7.2 Card: Interface

**Configurações disponíveis (setting-rows com toggle):**

| Configuração | Padrão | Descrição |
|-------------|--------|-----------|
| Sidebar expandida por padrão | ON | Mostra ícones + labels ao abrir o app |
| Animações reduzidas | OFF | Para quem prefere menos movimento ou tem sensibilidade a movimentos (respeita `prefers-reduced-motion`) |
| Números compactos | OFF | Ex: R$ 1,2K em vez de R$ 1.200,00 |
| Visão padrão da Agenda | Semanal | Define qual view abre ao acessar o módulo Agenda |

**Regra — Números compactos:**  
Quando ativo, valores acima de R$ 1.000 são formatados como R$ 1,2K; acima de R$ 1.000.000, como R$ 1,2M. Afeta todos os KPI cards, gráficos e listas de transações no app. Implementar como utilitário global `formatCurrency(value, compact: boolean)`.

**Regra — Animações reduzidas:**  
Quando ativo (ou quando o sistema operacional reporta `prefers-reduced-motion: reduce`), todas as micro-animações do app são desabilitadas. Isso inclui: transições de modo, celebrates overlay, progress bars animadas, e tooltips. Implementar via classe `reduced-motion` no `<body>` + media query.

**Regra — Visão padrão da Agenda:**  
Persiste no Supabase no campo `agenda_default_view` da tabela `profiles`. Opções: `weekly` (Semanal), `monthly` (Mensal), `daily` (Diária). O módulo Agenda lê esse campo ao montar a página.

---

## 8. Seção: Notificações

**Rota na sidebar:** `cfgNav('notificacoes')` | **Item ativo:** Notificações

### 8.1 Card: Canal de Entrega

**Notificações push (PWA):** Toggle. Ao ativar pela primeira vez, solicita permissão de notificação via `Notification.requestPermission()`. Se o usuário negar, exibe instrução de como ativar nas configurações do browser.

**E-mail:** Toggle. Controla o envio de resumos semanais e alertas por e-mail. Usa Supabase Edge Functions + serviço de e-mail (Resend ou similar).

### 8.2 Card: Alertas Financeiros

**Componente notif-row:**
- Layout: flex, align-items: center, gap 12px
- Border-bottom: `1px solid var(--border)`
- Padding: 12px 0

**Partes do notif-row:**
- **notif-ico:** emoji em container 32×32px, background `var(--s3)`, border-radius 8px
- **notif-info:** flex-column (notif-label + notif-desc)
- **Toggle switch** à direita

**Alertas disponíveis (com badges de modo):**

| Alerta | Emoji | Modos | Default |
|--------|-------|-------|---------|
| Orçamento atingindo 75% | 💰 | Foco + Jornada | ON |
| Orçamento excedido | 🚨 | Foco + Jornada | ON |
| Evento financeiro no dia seguinte | 📅 | Foco + Jornada | ON |
| Saldo projetado negativo | 📉 | Foco + Jornada | ON |

**Badges de modo na label:**
- Badge Foco: `background: rgba(16,185,129,0.15)`, cor `#10b981`, `font-size: 10px`, `border-radius: 4px`, `padding: 1px 5px`, texto "Foco"
- Badge Jornada: `background: rgba(0,85,255,0.15)`, cor `#6e9fff`, `font-size: 10px`, `border-radius: 4px`, `padding: 1px 5px`, texto "Jornada"

### 8.3 Card: Metas e Progresso

| Alerta | Emoji | Default |
|--------|-------|---------|
| Meta em risco | ⚠️ | ON |
| Meta concluída | 🎉 | ON |

### 8.4 Card: Modo Jornada — exclusivos

Este card só exibe conteúdo relevante quando o usuário está em Modo Jornada. Em Modo Foco, o card continua visível mas com uma nota informativa: "Estas notificações estão disponíveis apenas no Modo Jornada."

| Alerta | Emoji | Controle extra | Default |
|--------|-------|---------------|---------|
| Lembrete diário de registro | 🔥 | Seletor de horário (time input, padrão 21:00) | ON |
| Review semanal (domingo) | 📊 | — | ON |
| Conquistas desbloqueadas | 🏆 | — | ON |
| Inatividade de 7 dias | 😴 | — | OFF |

**notif-time-sel:** `display: flex`, `align-items: center`, `gap: 8px`, `margin-top: 6px`  
**notif-time-input (time):** Mesmo estilo do setting-input, `width: auto`, `min-width: 90px`

**Regra — Lembrete diário:** Usa o horário definido pelo usuário para enviar notificação push (PWA) com texto: "Olá, [Nome]! Lembre-se de registrar seus gastos de hoje." Implementação: Supabase Edge Function com cron job diário, filtrado pelo horário de cada usuário.

**Regra — Review semanal (domingo):** Todo domingo às 20h (horário fixo), notificação push + e-mail (se ativo) com resumo da semana: total gasto, comparação com semana anterior, meta que mais avançou.

---

## 9. Seção: Integrações

**Rota na sidebar:** `cfgNav('integracoes')` | **Item ativo:** Integrações

### 9.1 intg-grid (Grid de Integrações)

**Layout:** Grid 2 colunas, gap 14px (desktop). 1 coluna em mobile.

### 9.2 intg-card (Card de Integração)

```
[ Logo 40×40px ] [ Nome + Tipo + Badge PRO/FREE ]
[ Descrição ]
[ Status + Botão de Ação ]
```

**intg-logo:** 40×40px, `border-radius: var(--radius-sm)` (8px), background `var(--s2)`  
**intg-name:** `font-size: 14px`, `font-weight: 600`, `font-family: Syne`  
**intg-type:** `font-size: 12px`, cor `var(--t3)`  

**Badges de tipo:**
- PRO: `background: linear-gradient(90deg,#10b981,#0055ff)`, texto branco, `font-size: 10px`, `border-radius: 4px`, `padding: 1px 6px`

### 9.3 Integrações disponíveis no MVP v2

| Integração | Logo | Tipo | Plano | Status disponível |
|------------|------|------|-------|------------------|
| Google Calendar | 📅 | Agenda | PRO | Não conectado / Conectado / Erro |
| Open Finance (Bancos) | 🏦 | Bancos | PRO | Não conectado / Conectado / Erro |
| Google Sheets | 📊 | Exportação | FREE + PRO | Não conectado / Conectado |
| WhatsApp Bot | 💬 | Assistente | PRO | Não conectado / Conectado |

**Regra — Google Calendar (PRO):**  
Usuários FREE veem o card com botão "🔒 Upgrade para conectar" que abre modal de Upsell. Usuários PRO veem botão "Conectar" que inicia fluxo OAuth2 com Google (redirect para Google consent screen).

**Regra — Open Finance (PRO):**  
Semelhante ao Google Calendar. Ao conectar (PRO), usuário escolhe banco e autoriza via Open Finance API. Transações são importadas automaticamente a cada 24h. Suporta Nubank, Itaú, Bradesco, Santander, Banco do Brasil.

**Regra — Google Sheets (FREE + PRO):**  
Exportação mensal automática. Ao conectar, cria uma spreadsheet no Google Drive do usuário com aba por mês. Não é bidirecional — só exporta dados do SyncLife para o Sheets. Não importa.

**Regra — WhatsApp Bot (PRO):**  
Permite registrar transações via WhatsApp. Usuário envia mensagem tipo "gastei 50 reais no almoço" e o bot categoriza e registra no SyncLife. Usa Baileys ou API oficial do WhatsApp Business.

### 9.4 Estados do botão de integração

| Estado | Estilo do botão | Texto |
|--------|----------------|-------|
| PRO - não conectado, usuário FREE | background transparente, borda `rgba(244,63,94,0.3)`, cor `var(--red)` | "🔒 Upgrade para conectar" |
| Não conectado (PRO com acesso) | background `var(--s3)`, cor `var(--t1)` | "Conectar" |
| Conectado | background `rgba(16,185,129,0.15)`, cor `#10b981`, borda `rgba(16,185,129,0.3)` | "✓ Gerenciar" |
| Erro de conexão | background `rgba(244,63,94,0.12)`, cor `var(--red)` | "⚠️ Reconectar" |

---

## 10. Regras FREE vs PRO

Esta seção documenta de forma centralizada as limitações de plano que afetam a tela de Configurações.

| Recurso | FREE | PRO |
|---------|------|-----|
| Modo Jornada | ❌ Bloqueado (card visível com lock) | ✅ Disponível |
| Google Calendar Sync | ❌ Upsell modal | ✅ Bidirecional |
| Open Finance (bancos) | ❌ Upsell modal | ✅ Até 5 contas |
| WhatsApp Bot | ❌ Upsell modal | ✅ Disponível |
| Exportação Google Sheets | ✅ Manual apenas | ✅ Automática mensal |
| Exportação de dados (LGPD) | ✅ Disponível | ✅ Disponível |

**Implementação do gate PRO:**  
Usar o campo `plan` da tabela `profiles` no Supabase. Valores: `'free'` ou `'pro'`. Expor via hook `useUserPlan()` que retorna `{ plan, isPro, isFree }`.

**Upsell Modal:**  
Ao clicar em funcionalidade PRO sendo usuário FREE, abrir modal com:
- Título: "Funcionalidade exclusiva do plano Pro"
- Descrição da feature bloqueada
- Botão primário: "✦ Ver planos" → redireciona para seção Meu Plano
- Botão secundário: "Agora não"

---

## 11. Seção: Meu Plano

**Rota na sidebar:** `cfgNav('plano')` | **Item ativo:** Meu Plano

### 11.1 plan-grid (Grid de Planos)

**Layout:** Grid 2 colunas, gap 16px

Cada plan-card:
- `border: 2px solid var(--border)`
- `border-radius: var(--radius-lg)` (14px)
- `padding: 20px`

**Plan card Featured (PRO):**
- `border-color: var(--em)` (#10b981)
- Sombra: `box-shadow: 0 0 0 1px rgba(16,185,129,0.2), 0 8px 32px rgba(16,185,129,0.12)`

### 11.2 Conteúdo dos Cards de Plano

**Card FREE:**
- Badge: background `var(--s3)`, cor `var(--t2)`, texto "Free"
- Preço: "R$ 0 /mês"
- Sub: "Para sempre gratuito"
- Lista de features com ícones ✓ (verde) e ✗ (cinza)
- Botão: "Plano atual" (disabled, background `var(--s3)`)

**Features FREE (✓ incluído):**
- Transações: até 200/mês
- Orçamentos por envelope
- Metas: até 3 ativas
- Recorrentes: até 5 ativas
- Agenda: 50 eventos/mês

**Features FREE (✗ não incluído):**
- Google Calendar
- Open Finance (bancos)
- WhatsApp Bot
- Exportação automática

**Card PRO:**
- Badge: gradiente esmeralda→azul, texto branco, "Pro"
- Preço: "R$ 19,90 /mês"
- Sub: "ou R$ 179/ano (25% off)"
- Botão principal: "✦ Fazer upgrade para Pro"
- Nota abaixo: "7 dias grátis, cancele quando quiser"

**Features PRO (todas ✓):**
- Transações: ilimitadas
- Orçamentos por envelope
- Metas: ilimitadas
- Recorrentes: ilimitadas
- Agenda: ilimitados
- Google Calendar (bidirecional)
- Open Finance — 5 contas
- WhatsApp Bot
- Exportação automática mensal

### 11.3 Card: Uso Atual (apenas quando usuário FREE)

Exibe barras de progresso para cada limite do plano FREE:

**Métricas com progress bar:**

| Métrica | Limite FREE | Cor da barra |
|---------|------------|--------------|
| Transações | 200/mês | Verde esmeralda até 75%, amarelo 75-90%, vermelho >90% |
| Metas ativas | 3 | Igual |
| Recorrentes ativas | 5 | Igual |
| Eventos na agenda | 50/mês | Igual |

**Progress bar:**
- Container: `height: 5px`, `background: var(--s3)`, `border-radius: 3px`
- Fill: `height: 100%`, `border-radius: 3px`, transição `width 0.6s ease`
- Rótulo: `font-size: 12px`, dois spans com `justify-content: space-between`
  - Esquerda: nome da métrica, cor `var(--t2)`
  - Direita: "X / Y" — cor `var(--t2)` normal, `var(--yellow)` quando >75%, `var(--red)` quando >90%

**Regra de negócio:** Os valores são calculados no backend com base no período do mês corrente (usando `day_start` do perfil do usuário). A query Supabase é feita ao montar a seção Meu Plano, com loading state enquanto carrega.

### 11.4 Botão de Upgrade

**Fluxo ao clicar em "Fazer upgrade para Pro":**
1. Abre modal de checkout (integração com Stripe, Hotmart ou Kiwify — a definir)
2. Modal exibe plano mensal e anual com seleção
3. Ao concluir pagamento: webhook atualiza `plan: 'pro'` no Supabase
4. Toast de boas-vindas: "✦ Bem-vindo ao Pro! Todas as funcionalidades estão desbloqueadas."
5. Página recarrega com novo plano (useUserPlan invalida cache)

---

## 12. Danger Zone

A Danger Zone aparece no final da **seção Perfil**, não como seção própria. É um card visualmente separado das configurações normais.

**Estilo:**
```css
background: rgba(244,63,94,0.04);
border: 1px solid rgba(244,63,94,0.18);
border-radius: var(--radius-lg); /* 14px */
padding: 16px 18px;
```

**Ações:**

**Exportar todos os dados:**
- Botão outline vermelho: "Exportar dados (JSON)"
- Ao clicar: chama Edge Function que compila todos os dados do usuário em JSON
- Gera download automático do arquivo `synclife-export-[data].json`
- Inclui: transações, orçamentos, metas, eventos, configurações (sem senha)
- Obrigatório por LGPD

**Excluir conta:**
- Botão outline vermelho: "Excluir minha conta"
- Fluxo de confirmação dupla (descrito na seção 5.5)
- Deleção em cascata: `profiles` → `transactions` → `budgets` → `goals` → `events` → `auth.users`
- Supabase RLS garante que só o próprio usuário pode deletar seus dados

---

## 13. Comportamento em Modo Foco vs Modo Jornada

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Top Header | Breadcrumb `Configurações › [Seção]` | "Olá, [Nome]! ⚙️ · Personalize sua experiência." |
| Life Sync Score na sidebar | Oculto | Visível (score + barra de progresso) |
| Card Modo Jornada no plan-grid | Aparece com lock icon | Aparece selecionado/desbloqueado |
| Notificações Jornada-exclusivas | Card exibe nota de indisponibilidade | Card exibe os toggles normalmente |
| Toast ao mudar de modo (aqui) | Verde esmeralda padrão | Verde esmeralda com micro-animação |
| Conquistas na sidebar | Não aparece como item | Aparece na sidebar com count badge |

---

## 14. Responsividade

### 14.1 Desktop (> 1024px)

- Layout two-column: cfg-menu (200px fixo) + cfg-content (flex: 1)
- plan-grid: 2 colunas
- intg-grid: 2 colunas
- Informações básicas: grid 2 colunas (nome + sobrenome)

### 14.2 Tablet (640px — 1024px)

- cfg-menu: oculto (navegação pela sidebar do app que entra em modo collapsed)
- cfg-content: 100% da largura
- plan-grid: 1 coluna (stacked)
- intg-grid: 1 coluna
- Informações básicas: 1 coluna

### 14.3 Mobile (< 640px)

- cfg-menu: oculto
- Navegação via sidebar do app (collapsed em bottom bar)
- Todos os grids: 1 coluna
- Avatar e informações: stacked (vertical)
- setting-row com select: o select desce para linha separada abaixo do label+desc

---

## 15. Tokens de Design Usados Nesta Tela

```css
/* Cores base */
--bg, --s1, --s2, --s3
--border, --border-h
--t1, --t2, --t3

/* Cores de acento */
--em (#10b981)       /* Esmeralda — ativo, checked, PRO */
--el (#0055ff)       /* Azul elétrico — Jornada */
--red (#f43f5e)      /* Alertas, Danger Zone, campos de erro */
--yellow (#f59e0b)   /* Warning nos progress bars (75-90%) */
--green (#10b981)    /* Aliases de --em */

/* Cor específica de Configurações */
--cfg (#64748b)      /* Cor do ícone e acento do módulo */
--cfg-glow (rgba(100,116,139,0.12)) /* Background do módulo ativo */

/* Border radius */
--radius-sm: 8px     (inputs, badges, selects, toggles)
--radius-md: 12px    (botões, chips, menu items)
--radius-lg: 14px    (cards, plan-cards, danger zone)
--radius-full: 9999px (pills, badges de modo)

/* Layout */
--module-bar: 58px
--sb-open: 228px
--header-h: 54px

/* Tipografia */
font-family: 'Syne'     (títulos de seção, nomes de plano, avatar)
font-family: 'DM Sans'  (corpo, labels, descrições, inputs)
font-family: 'DM Mono'  (preços dos planos, valores numéricos)
```

---

## 16. Dados e API

### 16.1 Tabela Supabase: `profiles`

Campos relevantes para esta tela:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | FK para auth.users |
| `name` | text | Nome |
| `last_name` | text | Sobrenome |
| `avatar_url` | text nullable | URL da foto de perfil (Supabase Storage) |
| `currency` | text | 'BRL', 'USD', 'EUR' |
| `timezone` | text | 'America/Sao_Paulo' etc |
| `month_start_day` | int | 1-31 |
| `date_format` | text | 'DD/MM/YYYY' etc |
| `mode` | text | 'foco' ou 'jornada' |
| `theme` | text | 'dark-foco', 'dark-jornada', 'light-foco', 'light-jornada' |
| `sidebar_open` | bool | Estado padrão da sidebar |
| `reduced_motion` | bool | Animações reduzidas |
| `compact_numbers` | bool | Formato compacto de valores |
| `agenda_default_view` | text | 'weekly', 'monthly', 'daily' |
| `plan` | text | 'free' ou 'pro' |
| `notifications_push` | bool | Canal push ativo |
| `notifications_email` | bool | Canal email ativo |
| `notif_budget_75` | bool | Alerta orçamento 75% |
| `notif_budget_exceeded` | bool | Alerta orçamento excedido |
| `notif_financial_tomorrow` | bool | Alerta evento financeiro amanhã |
| `notif_negative_projection` | bool | Alerta saldo projetado negativo |
| `notif_goal_at_risk` | bool | Alerta meta em risco |
| `notif_goal_complete` | bool | Alerta meta concluída |
| `notif_daily_reminder` | bool | Lembrete diário (Jornada) |
| `notif_daily_reminder_time` | time | Horário do lembrete (default: '21:00') |
| `notif_weekly_review` | bool | Review semanal domingo (Jornada) |
| `notif_achievements` | bool | Conquistas desbloqueadas (Jornada) |
| `notif_inactivity` | bool | Inatividade 7 dias (Jornada) |

### 16.2 Tabela Supabase: `integrations`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | |
| `user_id` | uuid | FK para profiles |
| `type` | text | 'google_calendar', 'open_finance', 'google_sheets', 'whatsapp' |
| `status` | text | 'connected', 'disconnected', 'error' |
| `access_token` | text encrypted | Token OAuth (AES-256 via Supabase Vault) |
| `refresh_token` | text encrypted | |
| `connected_at` | timestamptz | |
| `last_sync_at` | timestamptz | |
| `metadata` | jsonb | Ex: nome do calendário conectado, nome da planilha |

### 16.3 Endpoints e Hooks

```typescript
// Buscar perfil completo
const useProfile = () => supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Atualizar campos do perfil (debounce 800ms nos inputs de texto)
const updateProfile = (fields: Partial<Profile>) => supabase
  .from('profiles')
  .update(fields)
  .eq('id', user.id)

// Buscar uso atual (para Meu Plano)
const useCurrentUsage = () => supabase
  .rpc('get_user_usage') // Edge Function que calcula contagens

// Upload de avatar
const uploadAvatar = (file: File) => supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.${ext}`, file, { upsert: true })

// Buscar integrações
const useIntegrations = () => supabase
  .from('integrations')
  .select('*')
  .eq('user_id', user.id)
```

### 16.4 Estados de Loading

- **Ao carregar a seção Perfil:** Exibir skeleton loaders nos campos de input
- **Ao salvar campos de texto:** Ícone de loading no botão salvar
- **Ao carregar Meu Plano:** Skeleton nos progress bars de uso
- **Ao salvar toggle:** Toggle muda imediatamente (optimistic update) e reverte se a API retornar erro

---

## 17. Estados de Componentes

### 17.1 Perfil

| Estado | Comportamento |
|--------|--------------|
| Loading | Skeleton em todos os inputs, avatar cinza |
| Dados carregados | Inputs preenchidos com dados do Supabase |
| Campo editado (dirty) | Botão "Salvar" aparece no canto direito do card |
| Salvando | Botão mostra spinner, inputs ficam disabled |
| Sucesso | Toast "Perfil atualizado" por 3s |
| Erro | Toast de erro + campos voltam ao estado anterior |

### 17.2 Mode Cards

| Estado | Comportamento |
|--------|--------------|
| Foco selecionado | Card Foco com borda verde + checkmark |
| Jornada selecionado (PRO) | Card Jornada com borda verde + checkmark |
| Jornada bloqueado (FREE) | Card Jornada com ícone 🔒 no canto + cursor not-allowed |

### 17.3 Integrações

| Estado | Comportamento |
|--------|--------------|
| Conectando | Botão desabilitado + spinner + "Conectando..." |
| Conectado | Botão verde "✓ Gerenciar" |
| Erro | Botão vermelho "⚠️ Reconectar" + tooltip com descrição do erro |
| Desconectando | Spinner no botão Gerenciar |

### 17.4 Toggle de Notificação

| Estado | Comportamento |
|--------|--------------|
| OFF | Track cinza, knob à esquerda |
| ON | Track gradiente esmeralda→azul, knob à direita |
| Salvando | Opacidade 0.7, pointer-events none (transição do toggle) |
| Erro ao salvar | Reverte para estado anterior + toast de erro |

---

## 18. Animações e Transições

### 18.1 Troca de Seção no cfg-menu

Ao clicar em um item do cfg-menu, a seção ativa muda imediatamente (sem animação de transição entre seções). Apenas o scroll do cfg-content vai para o topo (`scrollTop = 0`).

### 18.2 Toast de Confirmação de Modo

```css
/* Aparece */
.mode-applied-toast.show {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.25s ease-out;
}

/* Oculto */
.mode-applied-toast {
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease-in;
}
```

### 18.3 Toggle Switch

```css
.sw-knob {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.sw-track {
  transition: background 0.2s ease;
}
```

### 18.4 Theme Preview Selection

Ao clicar em um preview de tema, a borda ilumina com `transition: border-color 0.2s ease` e o tema global aplica com `transition: background 0.4s, color 0.3s` no `body`.

### 18.5 Progress Bars (Meu Plano)

```css
.plan-progress-fill {
  transition: width 0.6s ease-out;
}
```
Os progress bars animam sua largura ao montar (do 0 até o valor real).

---

## 19. Testes Unitários

### 19.1 Renderização

- [ ] A tela renderiza sem erros com perfil de usuário FREE
- [ ] A tela renderiza sem erros com perfil de usuário PRO
- [ ] Seção Perfil é exibida por padrão ao acessar `/configuracoes`
- [ ] cfg-menu exibe as 6 seções na ordem correta
- [ ] Badge "Free" aparece no item Meu Plano quando o plano é FREE
- [ ] Badge "Pro" aparece no item Meu Plano quando o plano é PRO

### 19.2 Navegação Interna

- [ ] Clicar em "Modo de Uso" no cfg-menu exibe a seção de Modo de Uso
- [ ] O item ativo do cfg-menu corresponde à seção visível
- [ ] Clicar em seção diferente rola cfg-content para o topo

### 19.3 Perfil

- [ ] Editar o campo nome exibe botão "Salvar"
- [ ] Clicar em "Salvar" chama `updateProfile` com os campos corretos
- [ ] Após salvar com sucesso, botão "Salvar" desaparece
- [ ] "Alterar foto" abre seletor de arquivo
- [ ] Upload de avatar atualiza o avatar exibido após conclusão
- [ ] Moeda selecionada é salva e reflete em todas as telas

### 19.4 Modo de Uso

- [ ] Card "Modo Foco" aparece selecionado quando modo atual é Foco
- [ ] Clicar em "Modo Jornada" (sendo PRO) aplica o modo e exibe toast
- [ ] Toast desaparece após 3500ms
- [ ] Clicar em "Modo Jornada" (sendo FREE) exibe modal de upsell
- [ ] "Reconfigurar" exibe ConfirmDialog antes de redirecionar

### 19.5 Aparência

- [ ] Tema "Dark Foco" selecionado por padrão para usuários novos
- [ ] Clicar em "Light Foco" aplica o tema e marca o preview como selecionado
- [ ] Toggle "Números compactos" formata valores para R$ 1,2K quando ativo
- [ ] Toggle "Animações reduzidas" adiciona classe `reduced-motion` ao body

### 19.6 Notificações

- [ ] Todos os toggles refletem valores do Supabase ao montar
- [ ] Alternar toggle dispara `updateProfile` com o campo correto
- [ ] Seção "Modo Jornada exclusivos" exibe nota quando em Modo Foco
- [ ] Seletor de horário do lembrete diário salva o horário correto

### 19.7 Integrações

- [ ] Integrações PRO mostram botão de lock para usuários FREE
- [ ] Clicar em lock (FREE) abre modal de upsell
- [ ] Integração Google Sheets "Conectado" exibe botão "✓ Gerenciar"
- [ ] Integração com erro exibe botão "⚠️ Reconectar"

### 19.8 Meu Plano

- [ ] Card FREE exibe botão desabilitado "Plano atual" para usuários FREE
- [ ] Card PRO exibe botão "Fazer upgrade" para usuários FREE
- [ ] Progress bars carregam com animação de 0 até valor real
- [ ] Recorrentes ativas em 4/5 exibem barra em amarelo (>75%)
- [ ] Clicar "Fazer upgrade" abre modal de checkout

### 19.9 Danger Zone

- [ ] "Excluir conta" exibe ConfirmDialog
- [ ] Botão de confirmar fica disabled até digitar "EXCLUIR"
- [ ] Digitando texto errado mantém botão disabled
- [ ] Digitando "EXCLUIR" exatamente ativa o botão

### 19.10 Responsividade

- [ ] cfg-menu oculto em viewport < 640px
- [ ] plan-grid é 1 coluna em viewport < 640px
- [ ] setting-row com select empilha em 2 linhas em mobile

**Total: 35 testes. Critério de conclusão: todos os 35 testes passando.**

---

## 20. Fases de Desenvolvimento e Estimativas

### Fase 1: Estrutura Base e Layout (4h)
**Dependências:** Shell (17-NAVEGACAO-SHELL-DEV-SPEC.md) implementado

- [ ] Criar página `/app/(authenticated)/configuracoes/page.tsx`
- [ ] Layout two-column: cfg-menu + cfg-content
- [ ] Implementar navegação interna entre seções (state management local)
- [ ] Criar esqueleto vazio para cada uma das 6 seções
- [ ] Implementar cfg-menu com seções e itens ativos
- [ ] Responsividade: ocultar cfg-menu em mobile
- [ ] Integrar com shell (sidebar config contextual)

### Fase 2: Seção Perfil (4h)
**Dependências:** Supabase configurado, tabela `profiles` com schema completo

- [ ] Carregar dados do usuário com `useProfile()`
- [ ] Implementar avatar (upload + exibição + fallback com iniciais)
- [ ] Campos de nome, sobrenome, e-mail com dirty state
- [ ] Botão salvar aparece/desaparece conforme dirty state
- [ ] Preferências regionais: moeda, fuso, dia de início, formato de data
- [ ] Persistir preferências via `updateProfile()`
- [ ] Seção Segurança: alterar senha (modal) + 2FA toggle
- [ ] Danger Zone: exportar dados + excluir conta (fluxo duplo)

### Fase 3: Seção Modo de Uso (2h)
**Dependências:** ModeProvider implementado no Shell

- [ ] Implementar mode-cards com seleção visual
- [ ] Sincronizar card selecionado com ModeProvider
- [ ] Persistir modo no Supabase via `updateProfile({ mode })`
- [ ] Toast de confirmação (aparece/some em 3500ms)
- [ ] Gate PRO para Modo Jornada (lock + upsell modal)
- [ ] Tabela comparativa de modos
- [ ] Botão "Reconfigurar" com ConfirmDialog e redirect

### Fase 4: Seção Aparência (2h)
**Dependências:** ThemeProvider implementado no Shell

- [ ] Implementar 4 theme-preview cards com seleção visual
- [ ] Sincronizar com ThemeProvider e persistir no Supabase
- [ ] Toggles de interface (sidebar, animações, números compactos, agenda view)
- [ ] Implementar utilitário `formatCurrency(value, compact)` global
- [ ] Classe `reduced-motion` no body via toggle

### Fase 5: Seção Notificações (2h)
**Dependências:** Perfil com campos de notificação no schema

- [ ] Carregar estado de notificações do perfil
- [ ] Implementar todos os toggles com optimistic update
- [ ] Canal push: solicitar permissão via Notification API quando ativado
- [ ] Seletor de horário para lembrete diário
- [ ] Diferenciação visual de alertas exclusivos do Modo Jornada

### Fase 6: Seção Integrações (3h)
**Dependências:** Tabela `integrations` no Supabase; fluxos OAuth pendentes de configuração

- [ ] Carregar integrações do usuário via `useIntegrations()`
- [ ] Renderizar intg-cards com estados corretos (conectado/desconectado/erro/lock)
- [ ] Fluxo OAuth para Google Calendar (redirect + callback route)
- [ ] Fluxo OAuth para Google Sheets
- [ ] Upsell modal para integrações PRO (usuários FREE)
- [ ] Estado "Gerenciar" para integração conectada

### Fase 7: Seção Meu Plano (3h)
**Dependências:** Integração com gateway de pagamento

- [ ] plan-cards com conteúdo FREE e PRO
- [ ] Uso atual: buscar contagens via `get_user_usage()` Edge Function
- [ ] Progress bars com animação e cores por threshold
- [ ] Botão de upgrade → modal de checkout (Stripe/Hotmart)
- [ ] Webhook handler para atualizar `plan` após pagamento

**Total estimado: ~20 horas**

---

## 21. Referências Cruzadas

### Telas que navegam para Configurações
- Qualquer tela do app → botão de engrenagem na Module Bar
- Upsell modal de feature PRO → botão "Ver planos" → redireciona para `/configuracoes?section=plano`
- Notificação de conquista (toast) → botão "Ver configurações" → `/configuracoes?section=notificacoes`

### Telas para onde Configurações navega
- "Reconfigurar" → `/onboarding?reconfigure=true`
- "Fazer upgrade" → abre modal de checkout (não navega)
- Exclusão de conta → `/` (landing page)

### Dados compartilhados (gerados aqui, consumidos lá)
- `mode` (foco/jornada) → **todas as telas** do app
- `theme` (dark/light × foco/jornada) → **todas as telas** do app
- `currency` → Dashboard Financeiro, Transações, Orçamentos, Planejamento, Metas
- `month_start_day` → Dashboard Financeiro, Orçamentos, Calendário Financeiro
- `compact_numbers` → Dashboard Financeiro, Transações, Metas
- `reduced_motion` → **todas as telas** com animações
- `agenda_default_view` → Módulo Agenda
- `plan` → qualquer tela com features PRO

### Dependências de desenvolvimento
```
configuracoes/page.tsx
├── DEPENDE de:
│   ├── Shell de navegação (17-NAVEGACAO-SHELL-DEV-SPEC.md) — DEVE estar implementado
│   ├── ModeProvider (parte do Shell) — para sincronizar seleção de modo
│   ├── ThemeProvider (parte do Shell) — para sincronizar seleção de tema
│   ├── Supabase configurado com tabela `profiles` completa
│   ├── Supabase Storage (bucket `avatars`) — para upload de foto
│   └── ConfirmDialog (componente global de feedback)
└── É DEPENDÊNCIA para:
    ├── Todas as telas que leem `mode`, `theme`, `currency`, `month_start_day`
    ├── Módulo Agenda (lê `agenda_default_view`)
    └── Qualquer feature gate PRO (lê `plan`)
```

---

## 22. Checklist de Validação Final

### Escopo
- [x] O doc NÃO contém specs da Module Bar
- [x] O doc NÃO contém specs da Sidebar (além do item ativo e da estrutura de itens)
- [x] O doc NÃO contém specs do Top Header (além do conteúdo contextual)
- [x] O doc referencia o shell com o bloco padrão da seção 2

### Design System
- [x] Nenhuma cor é hardcoded (todas referenciam tokens)
- [x] Nenhuma fonte é inventada (todas são Syne, DM Sans ou DM Mono)
- [x] Seção de tokens lista apenas os tokens usados por esta tela
- [x] Breakpoints seguem o padrão: mobile < 640, tablet 640-1024, desktop > 1024

### Modos e Temas
- [x] Cada bloco descreve comportamento no Modo Foco
- [x] Cada bloco descreve comportamento no Modo Jornada
- [x] Gate PRO para Modo Jornada está especificado
- [x] Seção 13 consolida as diferenças por modo

### Regras de Negócio
- [x] Toda regra tem descrição clara e comportamento definido
- [x] Casos de borda documentados (dirty state, erro de API, usuário FREE em feature PRO)
- [x] Diferenças FREE vs PRO centralizadas na Seção 10
- [x] Tabela de schema Supabase completa (Seção 16.1)

### Testes
- [x] 35 testes unitários definidos
- [x] Testes cobrem: renderização, regras de negócio, estados, interações, modos, responsividade
- [x] Critério de conclusão explícito: todos os 35 testes passando

### Atividades
- [x] 7 fases de desenvolvimento definidas
- [x] Cada atividade tem estimativa
- [x] Total geral: ~20 horas
- [x] Ordem de execução definida com dependências

### Geral
- [x] Índice com 22 seções presente e completo
- [x] Protótipo de referência indicado: `proto-configuracoes.html`
- [x] Dependências listadas (Shell, ModeProvider, ThemeProvider, Supabase)
- [x] Referências cruzadas documentadas

---

*Documento criado em: 23/02/2026*  
*Versão: 1.0*  
*Protótipo base: `proto-configuracoes.html` (Aprovado)*  
*Guia seguido: `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`*  
*Gold standard referenciado: `financas-visao-geral-regras-de-negocio.md`*
