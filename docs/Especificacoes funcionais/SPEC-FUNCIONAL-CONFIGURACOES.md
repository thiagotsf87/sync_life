# ⚙️ Especificação Funcional — Módulo Configurações

**Versão:** 1.0
**Data:** 07/03/2026
**Módulo:** ⚙️ Configurações (Centro de Controle)
**Cor:** `#64748b` (Slate)
**Ícone Lucide:** `Settings`
**Subtítulo:** Personalize sua experiência no SyncLife
**Pergunta norteadora:** "Como está minha configuração?"
**Status:** 📋 Especificação funcional para desenvolvimento
**Referências:** configuracoes-dev-spec.md, 21-TEMAS-E-MODOS-DEV-SPEC, modules.ts

> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP. Tela Modo de Uso removida. 12 temas liberados.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela: Perfil](#5-tela-perfil)
6. [Tela: Aparência](#6-tela-aparência)
7. [Tela: Notificações](#7-tela-notificações)
8. [Tela: Categorias](#8-tela-categorias)
9. [Tela: Integrações](#9-tela-integrações)
10. [Tela: Meu Plano](#10-tela-meu-plano)
11. [Fluxos CRUD Detalhados](#11-fluxos-crud-detalhados)
12. [Integrações Cross-Módulo](#12-integrações-cross-módulo)
13. [Diagrama de Integrações](#13-diagrama-de-integrações)
14. [Regras de Negócio Consolidadas](#14-regras-de-negócio-consolidadas)
15. [Modelo de Dados](#15-modelo-de-dados)
16. [Life Sync Score — Componente do Módulo](#16-life-sync-score)
17. [Insights e Sugestões Adicionais](#17-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o módulo Configurações

Configurações é o **centro de controle pessoal** do SyncLife. Diferente dos 8 módulos de negócio (Finanças, Tempo, Futuro, Corpo, Mente, Patrimônio, Carreira, Experiências), Configurações é uma **tela transversal de sistema** — ela não gerencia uma dimensão da vida do usuário, mas sim **como o usuário experimenta** todas as dimensões.

Pense assim: se os módulos são os instrumentos de uma orquestra, Configurações é o painel do maestro. É onde o usuário decide o volume (notificações), o estilo (tema e modo), a afinação (moeda, fuso, categorias) e as conexões (integrações entre módulos).

### 1.2 Por que existe

Sem Configurações, o SyncLife seria uma experiência genérica e inflexível. O módulo resolve três problemas fundamentais:

1. **Personalização de identidade** — O usuário precisa se reconhecer no app (nome, avatar, preferências regionais). Um app de gestão de vida que não sabe quem você é não inspira confiança.

2. **Controle sobre a experiência** — O SyncLife oferece experiência unificada com saudação, Life Sync Score, streaks e insights IA sempre visíveis.

3. **Governança dos dados** — Num app que gerencia finanças, saúde e carreira, o usuário precisa sentir que está no controle. Exportar dados (LGPD), excluir conta, gerenciar integrações — tudo isso é confiança.

### 1.3 Proposta de valor única

O diferencial competitivo de Configurações no SyncLife não é ter mais toggles que os concorrentes. É ter **configurações que conectam módulos entre si**:

- A seção **Integrações** define quais módulos conversam automaticamente (ex: "quando registrar salário em Carreira, criar receita em Finanças")
- A seção **Categorias** permite categorias personalizadas que afetam Finanças, Corpo e Experiências
- Os **12 temas visuais** garantem que o app se adapte à personalidade do usuário (todos liberados no MVP)

Nenhum app concorrente de gestão pessoal oferece um centro de controle que governe simultaneamente a aparência, o comportamento e as integrações de 8 módulos diferentes.

### 1.4 Sub-telas e frequência de uso

| Sub-tela | Frequência | Descrição |
|----------|-----------|-----------|
| Perfil | Rara (1x setup + edições pontuais) | Identidade, preferências regionais, segurança, danger zone |
| Aparência | Rara (1-3x/mês) | Temas visuais (9 opções), opção automático |
| Notificações | Moderada (mensal) | Canais, alertas por módulo |
| Categorias | Moderada (setup + ajustes) | Categorias de despesas e receitas, personalização |
| Integrações | Rara (setup) | Toggles cross-módulo, conexões externas futuras |
| Meu Plano | Rara (conversão FREE→PRO) | Plano atual, uso, upgrade |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Apps analisados

| App | O que faz bem | O que falta | Preço |
|-----|--------------|-------------|-------|
| **YNAB** | Settings minimalistas e eficazes; preferências de moeda e formato de data; educação financeira integrada; compartilhamento familiar (até 5 pessoas) | Sem temas visuais; sem modos de experiência; zero gamificação | $14.99/mês ou $109/ano |
| **Monarch Money** | Dashboard completo; categorias customizáveis com regras; colaboração em casal; integrações bancárias robustas | Sem temas escuros diferenciados; settings fragmentados entre web e mobile | $14.99/mês ou $99.99/ano |
| **Copilot Money** | UI mais bonita do mercado; auto-categorização por IA; ícones customizáveis por categoria; temas visuais ricos | Apenas Apple; sem integrações cross-módulo; sem gamificação ou modos | $13/mês ou $95/ano |
| **Notion** | Personalização extrema de workspace; sidebar customizável; conexões com 200+ apps via Zapier; espaços compartilhados | Overwhelming para setup; sem categorias financeiras; sem modo focado | FREE + $10-15/mês |
| **Todoist** | Settings limpos e eficientes; sistema Karma (gamificação leve); temas visuais; integrações nativas com Google Calendar | Focado apenas em tarefas; sem módulos de vida; sem controle financeiro | FREE + $5-9/mês |
| **Headspace** | Onboarding excepcional; personalização de jornada por nível; notificações motivacionais calibradas; temas visuais zen | Só meditação; sem gestão de vida; sem categorias ou integrações | $12.99/mês ou $69.99/ano |
| **Mobills** | Categorias com ícones e cores; preferências regionais (BRL); notificações de orçamento; exportação CSV/PDF | Sem modo escuro premium; sem integrações cross-módulo; sem gamificação | FREE + R$ 21.99/mês |
| **Habitica** | Gamificação profunda (avatar, XP, quests); modo escuro; perfil com estatísticas; integração com calendários | UI datada; confusa para novos usuários; sem gestão financeira | FREE + $4.99/mês |
| **Fabulous** | Onboarding como jornada narrativa; personalização de rotina; notificações inteligentes baseadas em horário; temas visuais refinados | Só hábitos/rotinas; sem finanças ou carreira; limitado em configurações técnicas | FREE + $12.99/mês |

### 2.2 Diferenciais do SyncLife

| Diferencial | Descrição | Quem mais faz? |
|------------|-----------|----------------|
| **Experiência unificada** | Saudação, Life Sync Score, streaks, insights IA sempre visíveis em todos os módulos | Nenhum — apps oferecem temas, não integração de vida |
| **12 temas visuais** | Todos liberados no MVP. Tema altera apenas cores e tokens visuais | Copilot tem temas, mas acoplados ao plano |
| **Integrações cross-módulo opt-in** | O usuário escolhe quais módulos se comunicam. Ex: "Carreira → Finanças" como toggle | Notion tem integrações externas, mas não entre módulos internos |
| **Categorias compartilhadas** | Categorias criadas em Configurações afetam Finanças e filtros globais | Monarch e Copilot têm categorias, mas em contexto único |
| **Centro de controle unificado** | Perfil + Temas + Notificações + Categorias + Integrações + Plano em um só lugar | A maioria fragmenta settings em 3-4 telas desconectadas |
| **Reconfigurar onboarding** | Botão para refazer o setup inicial mantendo dados existentes | Nenhum concorrente oferece "segundo onboarding" |
| **Danger Zone com LGPD** | Exportação JSON completa + exclusão de conta com confirmação dupla | YNAB e Monarch permitem exportação, mas sem UI dedicada |

### 2.3 O que aprendemos com o benchmark

1. **Copilot lidera em UI** — A estética clean e os ícones customizáveis são um padrão que devemos igualar ou superar com nossos 12 temas.
2. **YNAB lidera em educação** — O componente educacional nas settings (links para tutoriais) é algo que podemos integrar.
3. **Notion lidera em integrações** — Mas suas integrações são externas (Zapier). Nossas integrações são internas (entre módulos) — um diferencial que precisa ser comunicado claramente.
4. **Gamificação é subexplorada** — Só Habitica e Todoist (Karma) usam gamificação em settings. Nossa experiência unificada é uma versão sofisticada disso.
5. **Settings fragmentados são comuns** — A maioria dos apps espalha configurações em 3-4 telas diferentes. Nosso centro de controle unificado é uma vantagem de UX.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Diagrama ASCII do fluxo entre telas

```
                    ┌─────────────────────────────┐
                    │      MODULE BAR (rodapé)      │
                    │    ⚙️ Configurações (ícone)    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   SIDEBAR CONFIGURAÇÕES      │
                    │                              │
                    │  [Conta]                     │
                    │    ├── Perfil ◄── default    │
                    │    └── Aparência             │
                    │  [Preferências]              │
                    │    ├── Notificações          │
                    │    ├── Categorias            │
                    │    └── Integrações           │
                    │  [Plano]                     │
                    │    └── Meu Plano [badge]     │
                    └──────────────┬──────────────┘
                                   │
          ┌────────┬────────┬──────┼──────┬────────┬────────┐
          ▼        ▼        ▼      ▼      ▼        ▼        ▼
      ┌───────┐┌───────┐┌─────┐┌──────┐┌──────┐┌──────┐
      │Perfil ││Aparên.││Notif││Categ.││Integ.││Plano │
      │       ││       ││     ││      ││      ││      │
      └───┬───┘└───────┘└──┬───┘└─────┘└──┬───┘└──────┘└──┬───┘
          │                │              │                │
          ▼                ▼              ▼                ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Alterar  │   │Reconfig. │   │ Nova     │   │ Checkout │
    │ Senha    │   │Onboarding│   │ Categ.   │   │ Upgrade  │
    │ (modal)  │   │ (redirect│   │ (modal)  │   │ (modal)  │
    └──────────┘   │  /onboard│   └──────────┘   └──────────┘
    ┌──────────┐   │  ing)    │   ┌──────────┐
    │ Excluir  │   └──────────┘   │ Editar   │
    │ Conta    │                  │ Categ.   │
    │ (confirm)│                  │ (modal)  │
    └──────────┘                  └──────────┘
```

### 3.2 Tabela de hierarquia

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| L1 | Perfil (default) | Sidebar item "Perfil" | — (é default) |
| L1 | Aparência | Sidebar item "Aparência" | Perfil |
| L1 | Notificações | Sidebar item "Notificações" | Perfil |
| L1 | Categorias | Sidebar item "Categorias" | Perfil |
| L1 | Integrações | Sidebar item "Integrações" | Perfil |
| L1 | Meu Plano | Sidebar item "Meu Plano" | Perfil |
| L2 | Alterar Senha | Botão "Alterar" em Perfil | Perfil (modal fecha) |
| L2 | Excluir Conta | Botão "Excluir" em Perfil | Perfil (confirm fecha) |
| L2 | Nova Categoria | Botão "+ Nova categoria" em Categorias | Categorias (modal fecha) |
| L2 | Editar Categoria | Tap na categoria | Categorias (modal fecha) |
| L2 | Reconfigurar | Botão "Reconfigurar" em Perfil | /onboarding (redirect) |
| L2 | Checkout PRO | Botão "Fazer upgrade" em Meu Plano | Meu Plano (modal fecha) |

### 3.3 Padrão de navegação

**Mobile (< 640px):** Navegação via underline tabs horizontais no topo da tela. Tabs: Perfil | Aparência | Notificações | Categorias (scroll horizontal para Integrações e Plano que ficam fora da viewport inicial — fade indicator à direita).

**Desktop (> 1024px):** Navegação via cfg-menu lateral fixo (200px) com grupos "Conta", "Preferências" e "Plano". Conteúdo renderizado à direita (flex: 1).

**Tablet (640px–1024px):** cfg-menu oculto; navegação pela sidebar principal do app (Nível 2).

---

## 4. MAPA DE FUNCIONALIDADES

```
⚙️ Configurações
├── 📋 Perfil
│   ├── Identidade
│   │   ├── Avatar (upload + fallback iniciais)
│   │   ├── Nome completo (editável)
│   │   ├── E-mail (somente leitura)
│   │   └── Membro desde (data de criação)
│   ├── Preferências Regionais
│   │   ├── Moeda (BRL, USD, EUR, etc.)
│   │   ├── Fuso horário (detectado + editável)
│   │   └── Dia de início do mês (1-28)
│   ├── Segurança
│   │   ├── Alterar senha (modal)
│   │   └── Autenticação 2FA (toggle) [PRO]
│   ├── Reconfigurar SyncLife (refazer onboarding)
│   └── Zona de Perigo
│       ├── Exportar dados JSON (LGPD)
│       └── Excluir conta (confirmação dupla)
├── 🎨 Aparência
│   ├── Tema
│   │   ├── Automático (segue OS)
│   │   └── 12 temas (todos liberados no MVP)
│   └── Interface
│       ├── Sidebar expandida por padrão (toggle)
│       ├── Animações reduzidas (toggle)
│       └── Números compactos (toggle)
├── 🔔 Notificações
│   ├── Canal de Entrega
│   │   ├── Push (requer permissão do browser)
│   │   └── E-mail (resumos semanais)
│   ├── Alertas Financeiros
│   │   ├── Orçamento atingindo 75%
│   │   ├── Orçamento excedido
│   │   ├── Evento financeiro amanhã
│   │   └── Saldo projetado negativo
│   ├── Metas e Progresso
│   │   ├── Meta em risco
│   │   └── Meta concluída
│   └── Alertas de Engajamento
│       ├── Lembrete diário (horário configurável)
│       ├── Review semanal (domingo)
│       ├── Conquistas desbloqueadas
│       └── Inatividade 7 dias
├── 🏷️ Categorias
│   ├── Categorias de Despesas (grid com ícone + nome + badge)
│   ├── Categorias de Receitas (toggle despesas/receitas)
│   ├── Criar nova categoria (modal: ícone, nome, cor, tipo)
│   ├── Editar categoria existente (modal)
│   ├── Excluir categoria (confirmação + reclassificação)
│   └── Categorias padrão (sistema, não excluíveis)
├── 🔗 Integrações
│   ├── Integrações entre módulos (toggles opt-in)
│   │   ├── Corpo → Finanças (custos de saúde)
│   │   ├── Corpo → Agenda (consultas)
│   │   ├── Mente → Agenda (blocos de estudo)
│   │   ├── Mente → Finanças (custos de cursos)
│   │   ├── Patrimônio → Finanças (proventos)
│   │   ├── Carreira → Finanças (salário)
│   │   ├── Futuro → Agenda (prazos de objetivos)
│   │   └── Experiências → Futuro (sugestão de objetivo)
│   └── Integrações externas (futuro pós-MVP)
│       ├── Google Calendar [PRO]
│       ├── Open Finance [PRO]
│       ├── Google Sheets [PRO]
│       └── WhatsApp [PRO]
└── 👑 Meu Plano
    ├── Plano atual (FREE ou PRO)
    ├── Uso atual (barras de progresso)
    │   ├── Contas conectadas (x/2 FREE, ilimitado PRO)
    │   ├── Recorrentes ativas (x/5 FREE, ilimitado PRO)
    │   ├── Metas ativas (x/3 FREE, ilimitado PRO)
    │   ├── Objetivos ativos (x/2 FREE, ilimitado PRO)
    │   └── Trilhas ativas (x/2 FREE, ilimitado PRO)
    ├── Comparativo FREE vs PRO (feature list)
    └── Botão Upgrade (abre checkout modal)
```

---

## 5. TELA: PERFIL

### 5.1 Objetivo da tela

Perfil é a primeira tela que o usuário vê ao acessar Configurações. Seu papel é triplo: (a) permitir que o usuário se identifique com o app (avatar, nome), (b) ajustar preferências regionais que afetam todo o sistema (moeda, fuso, dia do mês) e (c) garantir segurança e controle sobre a conta (senha, 2FA, LGPD).

### 5.2 Componentes

#### Card: Identidade

**Objetivo:** Mostrar quem é o usuário e permitir edição básica de perfil.

**Dados exibidos:**
- Avatar circular (64px) com iniciais como fallback
- Nome completo (editável, campo de texto)
- E-mail (somente leitura, cinza, nota "O e-mail não pode ser alterado")
- Data "Membro desde [mês] de [ano]" (calculado de `created_at`)

**Critérios de aceite:**
- [ ] Avatar exibe iniciais (primeira letra do nome) quando não há foto
- [ ] Botão de editar avatar (ícone de lápis sobre o avatar) abre file picker
- [ ] Upload aceita JPG/PNG até 2MB
- [ ] Ao alterar nome, botão "Salvar" aparece (antes estava hidden)
- [ ] Salvar com sucesso esconde o botão e exibe toast "Perfil atualizado"
- [ ] E-mail não possui cursor pointer nem affordance de edição

**Resultado esperado:** O usuário se reconhece no app, sente ownership. Avatar e nome aparecem no Top Header e na sidebar.

#### Card: Preferências Regionais

**Objetivo:** Definir parâmetros que afetam todo o sistema financeiro e temporal.

**Dados exibidos:**
- Moeda: Select com opções (R$ Real BRL, $ Dollar USD, € Euro EUR, £ Pound GBP)
- Fuso horário: Select com timezones (default detectado do browser)
- Dia de início do mês: Select 1-28

**Critérios de aceite:**
- [ ] Moeda altera formatação de TODOS os valores monetários no app
- [ ] Fuso horário afeta horários exibidos em eventos e notificações
- [ ] Dia de início do mês recalcula períodos orçamentários automaticamente
- [ ] Mudança de moeda exibe ConfirmDialog: "Isso afetará como todos os valores são exibidos. Valores não serão convertidos."
- [ ] Persistência imediata via updateProfile() ao alterar cada select

**Resultado esperado:** Usuário internacional (ou que muda de país) consegue ajustar sem fricção. Dia de início flexível atende quem recebe salário no dia 5, 15, 25, etc.

#### Card: Segurança

**Objetivo:** Proteger a conta do usuário.

**Dados exibidos:**
- Alterar senha: botão outline "Alterar" → abre modal com senha atual + nova senha + confirmar nova senha
- Autenticação 2FA: toggle (PRO only)

**Critérios de aceite:**
- [ ] Modal de alterar senha valida: senha atual correta, nova senha ≥ 8 chars, confirmação idêntica
- [ ] Erro de senha atual exibe mensagem inline vermelha
- [ ] 2FA toggle desabilitado para FREE com tooltip "Recurso PRO"
- [ ] 2FA ativo exibe badge de verificação no card

#### Card: Zona de Perigo

**Objetivo:** Dar ao usuário controle total sobre seus dados (LGPD compliance).

**Dados exibidos:**
- Exportar dados: botão outline vermelho "Exportar (JSON)"
- Excluir conta: botão outline vermelho "Excluir conta"

**Critérios de aceite:**
- [ ] Exportar gera JSON com: transações, orçamentos, metas, eventos, configurações (sem senha)
- [ ] Download automático como `synclife-export-[YYYY-MM-DD].json`
- [ ] Excluir conta exibe ConfirmDialog com campo de texto para digitar "EXCLUIR"
- [ ] Botão de confirmar fica disabled até digitar exatamente "EXCLUIR"
- [ ] Após confirmar: deleção em cascata + logout + redirect para landing page
- [ ] Zona de Perigo tem borda vermelha sutil `rgba(244,63,94,0.18)`

**Resultado esperado:** Conformidade com LGPD. Usuário sente que está no controle. Fricção intencional na exclusão previne acidentes.

---

## 6. TELA: APARÊNCIA

### 6.1 Objetivo da tela

Permitir ao usuário personalizar o visual do SyncLife. Aparência altera apenas cores e tokens visuais. O SyncLife oferece 12 temas — todos liberados no MVP — além de uma opção automática que segue o tema do sistema operacional.

### 6.2 Componentes

#### Card: Tema

**Objetivo:** Selecionar o tema visual do app.

**Dados exibidos:**
- Toggle "Automático" com descrição "Segue o tema do sistema operacional"
- Grid de 12 temas (todos liberados): Navy Dark (selecionado por padrão), Clean Light, Mint Garden, Obsidian, Rosewood, Arctic, Graphite, Twilight, Sahara, e demais conforme design system

**Critérios de aceite:**
- [ ] Cada tema exibido como mini-preview card mostrando faixas de cores representativas
- [ ] Tema ativo tem checkmark verde e borda esmeralda
- [ ] Mudança de tema é instantânea (sem reload) via CSS custom properties
- [ ] "Automático" detecta `prefers-color-scheme` do browser e aplica Navy Dark (dark) ou Clean Light (light)
- [ ] Persistência: localStorage (instantâneo) + Supabase (durável)

**Resultado esperado:** O app se adapta à personalidade e preferência visual do usuário.

#### Card: Interface (toggles)

**Objetivo:** Ajustes finos de experiência visual.

**Dados exibidos:**
- "Sidebar expandida por padrão" — toggle (mostra ícones + labels vs só ícones)
- "Animações reduzidas" — toggle (adiciona `reduced-motion` ao body)
- "Números compactos" — toggle (R$ 1.234,56 → R$ 1,2K)

**Critérios de aceite:**
- [ ] Toggle "Animações reduzidas" respeita `prefers-reduced-motion` do OS como default
- [ ] "Números compactos" afeta TODOS os valores monetários no app
- [ ] Cada toggle persiste imediatamente no Supabase
- [ ] Toggles funcionam independentemente do tema selecionado

---

## 7. TELA: NOTIFICAÇÕES

### 7.1 Objetivo da tela

Dar ao usuário controle granular sobre como e quando o SyncLife se comunica com ele. Notificações bem calibradas aumentam retenção; notificações excessivas causam churn. A tela separa notificações por contexto (financeiro, metas, comportamento).

### 7.2 Componentes

#### Card: Canal de Entrega

**Dados:** Push notifications (toggle + "requer permissão") | E-mail (toggle + "resumos semanais e alertas importantes")

**Critérios de aceite:**
- [ ] Push: ao ativar, chama `Notification.requestPermission()` do browser
- [ ] Se permissão negada: toggle reverte + toast "Permissão negada no navegador"
- [ ] E-mail: ativa resumo semanal enviado na segunda-feira de manhã

#### Card: Alertas Financeiros

**Dados:** 4 toggles.

| Alerta | Descrição | Default |
|--------|-----------|---------|
| Orçamento atingindo 75% | Avise quando um envelope estiver próximo do limite | ON |
| Orçamento excedido | Notifique quando ultrapassar o limite | ON |
| Evento financeiro amanhã | Lembrete de vencimentos e recorrências | ON |
| Saldo projetado negativo | Alerta quando a projeção mensal ficar no vermelho | ON |

#### Card: Metas e Progresso

**Dados:** 2 toggles.

| Alerta | Descrição | Default |
|--------|-----------|---------|
| Meta em risco | Alerta quando progresso abaixo do esperado | ON |
| Meta concluída | Comemore ao atingir 100% de uma meta | ON |

#### Card: Alertas de Engajamento

**Dados:** 4 toggles + seletor de horário para lembrete diário.

| Alerta | Descrição | Default |
|--------|-----------|---------|
| Lembrete diário | "Hora de registrar seu dia!" + horário customizável | ON (21:00) |
| Review semanal | Resumo dominical do progresso da semana | ON |
| Conquistas desbloqueadas | Celebre badges e milestones | ON |
| Inatividade 7 dias | "Sentimos sua falta. Volte para manter seu streak." | ON |

**Critérios de aceite:**
- [ ] Seletor de horário permite escolher hora em incrementos de 30min (06:00 a 23:30)
- [ ] Todos os toggles persistem via `updateProfile()` com optimistic update

---

## 8. TELA: CATEGORIAS

### 8.1 Objetivo da tela

Permitir ao usuário criar, editar e organizar categorias personalizadas para suas transações financeiras. As categorias são fundamentais no módulo Finanças — elas determinam como gastos são agrupados, analisados e orçamentados.

### 8.2 Componentes

#### Header: Categorias + Botão "+ Nova categoria"

**Dados:** Título "Categorias", descrição "Crie e gerencie categorias personalizadas para suas transações", botão CTA

#### Toggle: Despesas / Receitas

**Dados:** Duas pills (Despesas | Receitas) para filtrar a lista. Default: Despesas.

#### Grid: Lista de Categorias

**Dados:** Grid 2 colunas mobile (cards compactos) com: ícone emoji, nome truncado, badge "Padrão" se for categoria do sistema.

**Critérios de aceite:**
- [ ] Categorias padrão (sistema): Alimentação, Moradia, Transporte, Contas, Saúde, Educação, Lazer, Vestuário, Compras, Serviços, Outros, Editora (para despesas) + Salário, Freelance, Investimentos, Outros (para receitas)
- [ ] Categorias padrão não podem ser excluídas (botão de delete disabled/hidden)
- [ ] Categorias personalizadas podem ser editadas e excluídas
- [ ] Grid responsiva: 2 colunas em mobile, 3 em tablet, 4 em desktop
- [ ] Tap na categoria abre modal de edição

---

## 9. TELA: INTEGRAÇÕES

### 9.1 Objetivo da tela

Configurar quais ações em um módulo criam dados automaticamente em outros módulos. Todas as integrações são opt-in — nenhuma ligação cross-módulo acontece sem o usuário ativar explicitamente.

### 9.2 Componentes

#### Integrações entre módulos (toggles agrupados por módulo)

**Dados:** Lista de integrações organizadas por módulo de origem, com toggle para cada uma.

| Grupo | Integração | De → Para | Descrição |
|-------|-----------|-----------|-----------|
| 🏃 Corpo | Custo de consulta → Finanças | Corpo → Finanças | Registra custos de consultas como despesa "Saúde" |
| 🏃 Corpo | Consulta agendada → Agenda | Corpo → Tempo | Cria evento na agenda para consultas médicas |
| 🧠 Mente | Sessão Pomodoro → Agenda | Mente → Tempo | Registra sessões de estudo como eventos |
| 🧠 Mente | Custo de trilha → Finanças | Mente → Finanças | Custos de cursos viram despesa "Educação" |
| 📈 Patrimônio | Provento → Finanças | Patrimônio → Finanças | Dividendos viram receita "Investimentos" |
| 💼 Carreira | Salário → Finanças | Carreira → Finanças | Atualização salarial sincroniza com renda |
| 🔮 Futuro | Prazo de objetivo → Agenda | Futuro → Tempo | Cria lembrete na data-prazo do objetivo |
| ✈️ Experiências | Viagem → Futuro | Experiências → Futuro | Sugere criar objetivo de economia |

**Critérios de aceite:**
- [ ] Cada integração tem toggle independente
- [ ] Toggles desativados por padrão (opt-in)
- [ ] Dados gerados por integração carregam tag "Auto —" para identificação
- [ ] Descrição clara do que acontece em linguagem simples
- [ ] Agrupamento visual por módulo de origem com ícone e cor

#### Integrações externas (futuro, pós-MVP)

**Dados:** Grid de cards para integrações externas (Google Calendar, Open Finance, Google Sheets, WhatsApp) — todos com estado "Em breve" ou "PRO" lock.

**Critérios de aceite:**
- [ ] Cards de integrações externas exibem logo, nome, tipo e status
- [ ] Todas marcadas como PRO
- [ ] Usuário FREE vê lock + "Upgrade para conectar"
- [ ] Futuramente: fluxo OAuth para conectar

---

## 10. TELA: MEU PLANO

### 10.1 Objetivo da tela

Mostrar ao usuário seu plano atual, quanto está usando dos limites do FREE, e incentivá-lo naturalmente a fazer upgrade para PRO. A tela deve ser honesta (sem dark patterns) mas aspiracional (mostrar o que PRO oferece).

### 10.2 Componentes

#### Cards: Plano FREE e Plano PRO

**Dados:**
- Card FREE: descrição "Funcionalidades essenciais para começar", badge "Plano atual" se FREE, botão disabled
- Card PRO (R$ 29,90/mês): descrição "Experiência completa com IA, temas e integrações avançadas", botão "Fazer upgrade" se FREE, badge "Plano atual" se PRO

**Critérios de aceite:**
- [ ] Card do plano ativo tem borda esmeralda e badge "Plano atual"
- [ ] Card inativo tem borda neutra
- [ ] Botão "Fazer upgrade" abre modal de checkout (Stripe/Hotmart)

#### Card: Uso Atual

**Dados:** Progress bars mostrando consumo dos limites FREE.

| Recurso | Limite FREE | Limite PRO | Cor da barra |
|---------|------------|-----------|--------------|
| Contas conectadas | 2 | Ilimitado | Verde < 50%, Amarelo 50-75%, Vermelho > 75% |
| Recorrentes ativas | 5 | Ilimitado | idem |
| Metas ativas | 3 | Ilimitado | idem |
| Objetivos ativos | 2 | Ilimitado | idem |
| Trilhas ativas | 2 | Ilimitado | idem |

**Critérios de aceite:**
- [ ] Progress bars animam de 0 ao valor real ao montar (600ms ease-out)
- [ ] Cores mudam conforme threshold: verde (< 50%), amarelo (50-75%), vermelho (> 75%)
- [ ] Texto: "X de Y usados" para FREE | "X em uso (ilimitado)" para PRO
- [ ] Barras no limite (ex: 5/5) pulsam sutilmente para criar urgência

#### Comparativo: Features FREE vs PRO

**Dados:** Lista expandida de todas as features com checkmarks.

**Critérios de aceite:**
- [ ] Features PRO que o usuário FREE não tem ficam com ícone de lock
- [ ] Scroll horizontal em mobile se necessário
- [ ] Botão "Fazer upgrade" fixo no bottom da tela em mobile

---

## 11. FLUXOS CRUD DETALHADOS

### 11.1 Categorias

#### CRIAR CATEGORIA

```
PASSO 1 — Onde: Categorias → botão "+ Nova categoria"
PASSO 2 — Modal abre com campos:
├── Tipo: Despesa ou Receita (pills)
├── Nome: texto (obrigatório, max 30 chars)
├── Ícone: emoji picker (grid de emojis relevantes)
├── Cor: seletor de 12 cores pré-definidas
└── Descrição: texto opcional (max 100 chars)

PASSO 3 — Validações:
├── Nome obrigatório
├── Nome não pode duplicar categoria existente do mesmo tipo
├── Ícone obrigatório (default: 📁)
└── FREE: máximo 10 categorias personalizadas por tipo

PASSO 4 — Sistema:
├── INSERT em `categories`
├── Categoria aparece no grid imediatamente
├── Disponível em: Finanças (transações, orçamentos), filtros globais
└── Feedback: Toast "Categoria '[nome]' criada"
```

#### EDITAR CATEGORIA

```
PASSO 1 — Onde: Categorias → tap na categoria
PASSO 2 — Modal abre com dados preenchidos
├── Editável: Nome, Ícone, Cor, Descrição
├── NÃO editável: Tipo (Despesa/Receita)
├── Categorias padrão: apenas Ícone e Cor são editáveis
└── Validações: mesmas da criação

PASSO 3 — Salvar:
├── UPDATE em `categories`
├── Transações existentes mantêm a categoria (nome atualizado)
└── Feedback: Toast "Categoria atualizada"
```

#### EXCLUIR CATEGORIA

```
PASSO 1 — Onde: Categorias → tap na categoria → botão "Excluir" no modal
PASSO 2 — Confirmação:
├── "Excluir categoria '[nome]'?"
├── "X transações usam esta categoria. Elas serão movidas para 'Outros'."
└── Botões: "Cancelar" | "Excluir" (vermelho)

PASSO 3 — Sistema:
├── Transações com esta categoria → reclassificadas para "Outros"
├── DELETE em `categories`
├── Orçamentos com esta categoria → marcados como "sem categoria"
└── Feedback: Toast "Categoria excluída. X transações movidas para 'Outros'."
```

### 11.2 Perfil

#### EDITAR PERFIL

```
PASSO 1 — Onde: Perfil → editar campo de nome
PASSO 2 — Dirty state ativado → botão "Salvar" aparece
PASSO 3 — Salvar:
├── Validação: nome não vazio, max 60 chars
├── UPDATE em `profiles`
├── Nome atualizado no Top Header e sidebar (Jornada)
├── Dirty state desativado → botão "Salvar" desaparece
└── Feedback: Toast "Perfil atualizado"
```

#### UPLOAD DE AVATAR

```
PASSO 1 — Onde: Perfil → botão de editar sobre o avatar
PASSO 2 — File picker abre (aceita JPG, PNG)
PASSO 3 — Validações:
├── Formato: JPG ou PNG
├── Tamanho: máximo 2MB
└── Erro: Toast "Arquivo deve ser JPG ou PNG com até 2MB"

PASSO 4 — Sistema:
├── Upload para Supabase Storage (bucket `avatars`)
├── Path: `{user_id}/avatar.{ext}` (upsert)
├── URL pública atualizada em `profiles.avatar_url`
├── Avatar recarrega no componente
└── Feedback: Toast "Foto atualizada"
```

#### ALTERAR SENHA

```
PASSO 1 — Onde: Perfil → Segurança → botão "Alterar"
PASSO 2 — Modal com campos:
├── Senha atual (obrigatório)
├── Nova senha (obrigatório, min 8 chars)
└── Confirmar nova senha (deve ser idêntica)

PASSO 3 — Validações:
├── Senha atual verificada via Supabase Auth
├── Nova senha ≥ 8 caracteres
├── Confirmação idêntica à nova senha
└── Erros: inline em cada campo

PASSO 4 — Sistema:
├── Supabase Auth updateUser({ password })
├── Modal fecha
└── Feedback: Toast "Senha alterada com sucesso"
```

#### EXCLUIR CONTA

```
PASSO 1 — Onde: Perfil → Zona de Perigo → botão "Excluir conta"
PASSO 2 — ConfirmDialog:
├── "Ação permanente e irreversível. Todos os dados serão removidos."
├── Campo de texto: "Digite EXCLUIR para confirmar"
├── Botão "Excluir minha conta" disabled até texto = "EXCLUIR"
└── Botão "Cancelar"

PASSO 3 — Sistema:
├── Edge Function `delete_user_data()`:
│   ├── DELETE transactions WHERE user_id
│   ├── DELETE budgets WHERE user_id
│   ├── DELETE objectives WHERE user_id
│   ├── DELETE calendar_events WHERE user_id
│   ├── DELETE categories WHERE user_id
│   ├── DELETE integrations WHERE user_id
│   ├── DELETE profiles WHERE id
│   └── DELETE auth.users WHERE id (via admin API)
├── Supabase Storage: delete avatar
├── Logout forçado
├── Redirect para `/` (landing page)
└── Feedback: (nenhum, pois o usuário já saiu)
```

---

## 13. INTEGRAÇÕES CROSS-MÓDULO

Configurações é o módulo que **governa** as integrações entre todos os outros módulos. Ele não recebe dados — ele controla quais dados fluem e para onde.

### 12.1 Integrações que Configurações controla

| Código | Trigger | O que acontece | Condição | Cenários |
|--------|---------|---------------|----------|----------|
| RN-CFG-INT-01 | Toggle "Corpo → Finanças" ativado | Consultas médicas geram despesa "Saúde" automaticamente | Toggle ativo em Integrações | Dr. João R$ 350 → transação em Finanças categoria "Saúde" com tag "Auto —" |
| RN-CFG-INT-02 | Toggle "Corpo → Agenda" ativado | Consultas agendadas criam evento no calendário | Toggle ativo em Integrações | Consulta 15/04 10h → evento no Tempo com cor Corpo |
| RN-CFG-INT-03 | Toggle "Mente → Agenda" ativado | Sessões Pomodoro viram blocos de estudo na agenda | Toggle ativo em Integrações | Pomodoro 25min React → evento "Estudo: React" no Tempo |
| RN-CFG-INT-04 | Toggle "Mente → Finanças" ativado | Custos de trilhas/cursos geram despesa "Educação" | Toggle ativo em Integrações | Trilha React R$ 97 → despesa "Educação" com tag "Auto —" |
| RN-CFG-INT-05 | Toggle "Patrimônio → Finanças" ativado | Proventos recebidos viram receita "Investimentos" | Toggle ativo em Integrações | Dividendo ITSA4 R$ 45 → receita "Investimentos — Proventos" |
| RN-CFG-INT-06 | Toggle "Carreira → Finanças" ativado | Atualização de salário sincroniza receita mensal | Toggle ativo em Integrações | Promoção R$ 8.000 → R$ 10.000: receita recorrente atualizada |
| RN-CFG-INT-07 | Toggle "Futuro → Agenda" ativado | Prazos de objetivos criam lembretes na agenda | Toggle ativo em Integrações | Objetivo "Apartamento" prazo Dez/2028 → evento lembrete |
| RN-CFG-INT-08 | Toggle "Experiências → Futuro" ativado | Criar viagem sugere objetivo de economia | Toggle ativo em Integrações | Viagem "Europa" R$ 15K → sugestão de objetivo "Juntar para Europa" |

### 12.2 Dados que Configurações compartilha

| Dado | Gerado em | Consumido por | Impacto |
|------|-----------|--------------|---------|
| `mode` (foco/jornada) | Modo de Uso | TODOS os módulos | Visibilidade de componentes Jornada |
| `theme` (9 opções) | Aparência | TODOS os módulos | Tokens CSS globais |
| `currency` (BRL/USD/EUR/GBP) | Perfil | Finanças, Patrimônio, Experiências, Futuro | Formatação monetária |
| `month_start_day` | Perfil | Finanças (orçamentos, períodos) | Recálculo de períodos |
| `compact_numbers` | Aparência | Finanças, Patrimônio, Dashboard | Formatação R$ 1,2K vs R$ 1.234 |
| `reduced_motion` | Aparência | TODOS os módulos | Desabilita animações |
| `plan` (free/pro) | Meu Plano | TODOS os módulos | Feature gates PRO |
| `categories` | Categorias | Finanças | Classificação de transações |
| `integration_toggles` | Integrações | Todos os módulos envolvidos | Ativa/desativa fluxos automáticos |

---

## 13. DIAGRAMA DE INTEGRAÇÕES

```
┌──────────────────────────────────────────────────────────────────┐
│                    ⚙️ CONFIGURAÇÕES                               │
│                  (Centro de Controle)                              │
│                                                                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ mode    │ │ theme    │ │ currency │ │ plan     │ │integr.  │ │
│  │foco/jor.│ │ 9 opções │ │ BRL/USD  │ │ free/pro │ │ toggles │ │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
└───────│──────────│──────────│──────────│──────────│────────────────┘
        │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼
  ┌───────────────────────────────────────────────────────────┐
  │              TODOS OS 8 MÓDULOS                            │
  │                                                            │
  │  mode ──────→ visibilidade de componentes Jornada          │
  │  theme ─────→ tokens CSS (cores, backgrounds, borders)     │
  │  currency ──→ formatação de valores (R$, $, €, £)          │
  │  plan ──────→ feature gates (PRO lock / FREE limit)        │
  └────────────────────────────────────────────────────────────┘

  ┌───────────────── INTEGRAÇÕES (toggles) ──────────────────┐
  │                                                           │
  │  🏃 Corpo ────┬──→ 💰 Finanças (custos saúde)            │
  │               └──→ ⏳ Tempo (consultas)                   │
  │                                                           │
  │  🧠 Mente ────┬──→ ⏳ Tempo (sessões estudo)             │
  │               └──→ 💰 Finanças (custos cursos)           │
  │                                                           │
  │  📈 Patrimônio ──→ 💰 Finanças (proventos)               │
  │                                                           │
  │  💼 Carreira ────→ 💰 Finanças (salário)                 │
  │                                                           │
  │  🔮 Futuro ──────→ ⏳ Tempo (prazos)                     │
  │                                                           │
  │  ✈️ Experiências ─→ 🔮 Futuro (sugestão objetivo)       │
  │                                                           │
  │  ⚙️ Categorias ──→ 💰 Finanças (classificação)          │
  └───────────────────────────────────────────────────────────┘
```

---

## 14. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| RN-CFG-01 | Perfil default ao cadastro | Moeda BRL, fuso detectado, dia 1, modo Foco, tema Navy Dark |
| RN-CFG-02 | E-mail imutável | O e-mail de cadastro não pode ser alterado pelo usuário |
| RN-CFG-03 | Avatar fallback | Quando sem foto, exibe iniciais (primeira letra do nome) em círculo colorido |
| RN-CFG-04 | Moeda não converte valores | Trocar de BRL para USD muda apenas a formatação, não converte valores existentes |
| RN-CFG-05 | Dia de início recalcula períodos | Alterar dia de início do mês recalcula todos os períodos orçamentários a partir do mês atual |
| RN-CFG-06 | Tema independente de modo | Trocar tema não altera modo. Trocar modo não altera tema. São eixos independentes |
| RN-CFG-07 | Experiência unificada | (removido — gates PRO desativados no MVP) |
| RN-CFG-08 | Temas PRO bloqueados para FREE | 6 temas marcados como PRO exibem lock e UpgradeModal ao clicar |
| RN-CFG-09 | Automático segue OS | Tema "Automático" aplica Navy Dark (prefers-color-scheme: dark) ou Clean Light (light) |
| RN-CFG-10 | Notificações push requerem permissão | Toggle push só funciona se `Notification.requestPermission()` retornar "granted" |
| RN-CFG-11 | Integrações são opt-in | Nenhuma integração cross-módulo é ativada por padrão |
| RN-CFG-12 | Dados auto-gerados são rastreáveis | Transações/eventos criados por integração carregam tag "Auto —" + módulo de origem |
| RN-CFG-13 | Categorias padrão protegidas | Categorias do sistema não podem ser excluídas, apenas ícone e cor editáveis |
| RN-CFG-14 | Exclusão reclassifica | Excluir categoria move transações vinculadas para "Outros" |
| RN-CFG-15 | FREE limita categorias | Máximo 10 categorias personalizadas por tipo (despesa/receita) no plano FREE |
| RN-CFG-16 | Exclusão de conta é cascata | Deleção remove TODOS os dados do usuário de TODAS as tabelas |
| RN-CFG-17 | Exportação LGPD completa | Export JSON inclui transações, orçamentos, metas, eventos, configs (sem senha) |
| RN-CFG-18 | Exclusão requer digitação | Botão de excluir conta fica disabled até digitar exatamente "EXCLUIR" |
| RN-CFG-19 | 2FA é PRO | Autenticação em dois fatores disponível apenas no plano PRO |
| RN-CFG-20 | Progress bars colorizados | Uso atual: verde < 50%, amarelo 50-75%, vermelho > 75% |
| RN-CFG-21 | Persistência dual | Tema e modo salvos em localStorage (instantâneo) E Supabase (durável). Supabase vence após login |
| RN-CFG-22 | Reconfigurar mantém dados | Refazer onboarding não apaga transações, metas ou eventos existentes |
| RN-CFG-23 | Toast de modo temporizado | Toast de confirmação de modo desaparece após 3500ms |
| RN-CFG-24 | Números compactos global | Toggle de números compactos afeta formatação em TODOS os módulos |
| RN-CFG-25 | Animações reduzidas respeita OS | Default do toggle "Animações reduzidas" segue `prefers-reduced-motion` do sistema |

---

## 15. MODELO DE DADOS

### 15.1 Tabela: profiles (campos relevantes para Configurações)

```sql
-- Campos existentes em profiles usados por Configurações
profiles (
  id UUID PK,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  -- mode removido (experiência unificada pós MIGRATION-ELIMINAR-MODO-DUAL)
  theme TEXT DEFAULT 'navy-dark', -- 12 opções
  currency TEXT DEFAULT 'BRL', -- BRL, USD, EUR, GBP
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  month_start_day INTEGER DEFAULT 1, -- 1-28
  compact_numbers BOOLEAN DEFAULT false,
  sidebar_expanded BOOLEAN DEFAULT true,
  reduced_motion BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'free', -- 'free' | 'pro'
  plan_expires_at TIMESTAMPTZ,
  -- Notificações
  notif_push BOOLEAN DEFAULT false,
  notif_email BOOLEAN DEFAULT false,
  notif_budget_75 BOOLEAN DEFAULT true,
  notif_budget_exceeded BOOLEAN DEFAULT true,
  notif_financial_tomorrow BOOLEAN DEFAULT true,
  notif_negative_projection BOOLEAN DEFAULT true,
  notif_goal_at_risk BOOLEAN DEFAULT true,
  notif_goal_complete BOOLEAN DEFAULT true,
  notif_daily_reminder BOOLEAN DEFAULT true,
  notif_daily_reminder_time TIME DEFAULT '21:00',
  notif_weekly_review BOOLEAN DEFAULT true,
  notif_achievements BOOLEAN DEFAULT true,
  notif_inactivity BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

### 15.2 Tabela: categories

```sql
categories (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → profiles NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense' | 'income'
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#64748b',
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- categorias padrão
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name, type)
)

-- Índices
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
CREATE INDEX idx_categories_system ON categories(is_system);
```

### 15.3 Tabela: integrations

```sql
integrations (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → profiles NOT NULL,
  type TEXT NOT NULL, -- 'google_calendar', 'open_finance', 'google_sheets', 'whatsapp'
  status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  access_token TEXT, -- encrypted via Supabase Vault
  refresh_token TEXT, -- encrypted
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB, -- ex: nome do calendário, nome da planilha
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Índices
CREATE INDEX idx_integrations_user ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(user_id, type);
```

### 15.4 Tabela: integration_toggles

```sql
integration_toggles (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → profiles NOT NULL,
  integration_key TEXT NOT NULL, -- 'crp_consulta_financas', 'mnt_pomodoro_agenda', etc.
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, integration_key)
)

-- Índice
CREATE INDEX idx_intg_toggles_user ON integration_toggles(user_id);
```

---

## 16. LIFE SYNC SCORE — COMPONENTE DO MÓDULO

Configurações **não contribui diretamente** para o Life Sync Score. Diferente dos 8 módulos de negócio, Configurações não mede uma dimensão da vida do usuário — é uma tela de sistema.

No entanto, Configurações **influencia indiretamente** o score de duas formas:

### 19.1 Influência indireta

1. **Completude do perfil:** Perfis completos (avatar + nome + preferências regionais) indicam engajamento. Isso poderia ser um multiplicador no cálculo geral.

2. **Integrações ativas:** Mais integrações cross-módulo ativadas = mais dados fluindo automaticamente = módulos mais completos = scores mais altos.

### 16.2 Proposta: Bonus de Engajamento

| Condição | Bonus | Descrição |
|----------|-------|-----------|
| Perfil completo (avatar + nome + moeda + fuso) | +2 pts no score geral | "Seu perfil está completo!" |
| ≥ 3 integrações cross-módulo ativas | +3 pts no score geral | "3 módulos conversando!" |
| ≥ 5 integrações ativas | +5 pts no score geral | "Ecossistema conectado!" |
| Uso consistente há 30+ dias | +2 pts no score geral | "Consistência!" |

**Peso no score geral:** 0% direto. Bonus de engajamento: até +12 pts (cap) adicionados ao score final calculado pelos 8 módulos.

---

## 17. INSIGHTS E SUGESTÕES ADICIONAIS

### 17.1 Funcionalidades futuras

| Feature | Descrição | Impacto | Prioridade |
|---------|-----------|---------|-----------|
| **Backup automático** | Backup semanal dos dados do usuário em formato JSON, armazenado no Supabase Storage (30 dias) | Segurança, confiança | Alta |
| **Perfis compartilhados** | Convidar parceiro(a) para acessar módulo Finanças em conjunto (como YNAB Together) | Retenção em casal, diferencial | Alta |
| **Atalhos de teclado** | Configurar atalhos para ações rápidas (Cmd+N = nova transação, etc.) | Poder-usuário, retenção | Média |
| **Idioma da interface** | Suporte a EN/ES além de PT-BR | Expansão internacional | Média |
| **Webhook de eventos** | Permitir integração com Zapier/Make para automações externas | Power users, integrações | Baixa |
| **Modo Família** | Múltiplos perfis dentro de uma conta, com visões individuais e compartilhadas | Diferencial competitivo forte | Baixa (v4) |
| **Importação de dados** | Importar CSV de outros apps (Mobills, YNAB, Monarch) com mapeamento de campos | Migração de usuários, aquisição | Média |
| **Audit log** | Histórico de alterações em configurações críticas (quem mudou, quando, o quê) | Segurança corporativa | Baixa |

### 17.2 Críticas ao protótipo atual

| Problema | Severidade | Sugestão |
|----------|-----------|----------|
| **Falta seção Integrações no protótipo mobile** | Alta | Os screenshots mostram Perfil, Aparência, Notificações e Categorias, mas Integrações e Meu Plano não estão visíveis. Precisam ser prototipados. |
| **Tabs horizontais cortadas em mobile** | Alta | Conforme auditoria mobile P2, as tabs "Categorias" já ficam cortadas. Com 7 seções, pior. Implementar scroll horizontal com fade indicator. |
| **Zona de Perigo sem destaque suficiente** | Média | O card de Zona de Perigo poderia ter ícone ⚠️ e espaçamento maior para separação visual. |
| **Aparência usa sistema antigo de 4 temas** | Alta | O protótipo mostra Dark Foco / Dark Jornada / Light Foco / Light Jornada (sistema antigo). O novo sistema tem 12 temas (todos liberados). O protótipo precisa ser atualizado. |
| **Sem tela de Meu Plano** | Alta | Não há screenshot/protótipo da tela de planos e uso atual. Crítico para conversão FREE→PRO. |
| **Sem tela de estado empty para categorias** | Média | O que aparece quando o usuário não tem categorias personalizadas? Precisa de empty state com CTA. |
| **Seletor de horário do lembrete não prototipado** | Média | A tela de Notificações mostra os toggles mas não o seletor de horário para o lembrete diário. |

### 17.3 Telas adicionais recomendadas para prototipagem

1. **Integrações (completa)** — Grid de integrações cross-módulo com toggles + cards de integrações externas
2. **Meu Plano** — Cards FREE/PRO + barras de uso + comparativo + botão upgrade
3. **Alterar Senha (modal)** — 3 campos + validações
4. **Excluir Conta (confirm)** — ConfirmDialog com campo de digitação
5. **Nova Categoria (modal)** — Formulário com emoji picker, nome, cor
6. **Editar Categoria (modal)** — Mesmo formulário preenchido + botão excluir
7. **Empty State: Categorias** — Ilustração + CTA "Criar sua primeira categoria"
8. **Checkout PRO (modal)** — Plano mensal/anual, resumo, botão de pagamento
9. **UpgradeModal** — Modal genérico que aparece ao tentar acessar feature PRO

---

*Documento criado em: 07/03/2026*
*Versão: 1.0*
*Módulo: ⚙️ Configurações*
*Cor: #64748b (Slate)*
*Referências: configuracoes-dev-spec.md, 21-TEMAS-E-MODOS-DEV-SPEC, modules.ts, DOC-FUNCIONAL-FUTURO-COMPLETO.md*
