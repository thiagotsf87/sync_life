# 18 — STATUS DAS DEV SPECS POR TELA

> **O que é uma Dev Spec?** É o documento de implementação detalhado que guia o Claude Code
> (ou qualquer desenvolvedor) a construir uma tela no Next.js. Contém: tokens CSS exatos,
> ordem dos blocos, regras de cálculo, estados de componentes, comportamento de hover/click,
> e regras de responsividade. Nível de detalhe: suficiente para implementar sem ambiguidade.
>
> **Template:** Seguir o padrão do `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`
> **Referência de qualidade:** `financas-visao-geral-regras-de-negocio.md` (gold standard)

---

## STATUS POR TELA — ORGANIZADO POR FASE DE DESENVOLVIMENTO

---

### FASE 1 — Fundação (infraestrutura do app)

> Deve ser totalmente implementada antes de qualquer módulo de negócio.
> Estabelece o shell, autenticação, onboarding e preferências globais do usuário.

| Tela | Protótipo | Dev Spec | Status |
|------|-----------|----------|--------|
| Navegação (Shell) + Modo Foco/Jornada | `proto-navigation-v3.html` ✅ | `17-NAVEGACAO-SHELL-DEV-SPEC.md` | ✅ Pronta |
| Autenticação (Login + Cadastro + Recovery) | `proto-auth.html` ✅ | `15-AUTH-ONBOARDING-DEV-SPEC.md` | ✅ Pronta |
| Onboarding | `proto-onboarding.html` ✅ | `15-AUTH-ONBOARDING-DEV-SPEC.md` | ✅ Pronta |
| Configurações | `proto-configuracoes.html` ✅ | `configuracoes-dev-spec.md` | ✅ Pronta |

> ✅ **Fase 1 — 100% das dev specs prontas.** Pode iniciar desenvolvimento.

**Notas importantes para Fase 1:**
- O "Modo Foco/Jornada" é um sistema de estado global implementado dentro do Shell (ModeProvider + ThemeProvider), não uma tela separada.
- Configurações deve ser implementada logo após o Shell porque define `mode`, `theme`, `currency` e `month_start_day` que são consumidos por todas as telas seguintes.
- Ordem de implementação recomendada: Shell → Auth → Onboarding → Configurações.

---

### FASE 2 — Módulo Finanças

> Implementar na ordem abaixo. Cada tela depende da anterior para ter dados a exibir.
> O Dashboard Financeiro é a tela principal — deve ser a primeira a ser implementada.

| # | Tela | Protótipo | Dev Spec | Status |
|---|------|-----------|----------|--------|
| 2.1 | Dashboard Financeiro (Visão Geral) | `proto-financas-dashboard.html` ✅ | `financas-visao-geral-regras-de-negocio.md` | ✅ Pronta |
| 2.2 | Transações | `proto-transacoes.html` ✅ | — | ❌ Criar antes de iniciar 2.2 |
| 2.3 | Orçamentos | `proto-orcamentos-revisado.html` ✅ | — | ❌ Criar antes de iniciar 2.3 |
| 2.4 | Planejamento Futuro | `proto-planejamento-v2-revisado.html` ✅ | — | ❌ Criar antes de iniciar 2.4 |
| 2.5 | Recorrentes | `proto-recorrentes-revisado.html` ✅ | — | ❌ Criar antes de iniciar 2.5 |
| 2.6 | Calendário Financeiro | `proto-calendario-financeiro.html` ✅ | — | ❌ Criar antes de iniciar 2.6 |
| 2.7 | Relatórios | `proto-relatorios-revisado.html` ✅ | — | ❌ Criar antes de iniciar 2.7 |

**Notas importantes para Fase 2:**
- A ordem interna segue a lógica de dependência de dados: Dashboard usa transações → Transações usam categorias dos Orçamentos → Orçamentos usam Recorrentes para gastos fixos → Planejamento usa Recorrentes para projeções → Calendário Financeiro visualiza tudo no tempo → Relatórios agregam para análise.
- Relatórios: verificar que `proto-relatorios-revisado.html` usa `--sb: 228px` e `--hh: 54px` antes de criar a spec (já corrigido na versão revisada).

---

### FASE 3 — Módulo Metas

> Implementar após a Fase 2 estar completa. O wizard de Nova Meta compartilha o
> componente WizardStepper com o Onboarding — oportunidade de reutilização.

| # | Tela | Protótipo | Dev Spec | Status |
|---|------|-----------|----------|--------|
| 3.1 | Lista de Metas | `proto-metas-revisado.html` ✅ | — | ❌ Criar antes de iniciar 3.1 |
| 3.2 | Nova Meta (Wizard) | `proto-meta-nova.html` ✅ | — | ❌ Criar antes de iniciar 3.2 |
| 3.3 | Detalhe da Meta | `proto-meta-detalhe-revisado.html` ✅ | — | ❌ Criar antes de iniciar 3.3 |

**Notas importantes para Fase 3:**
- A integração Meta↔Agenda ("Agendar sessão de foco") deve ser documentada na spec de Detalhe da Meta e na spec de Agenda CRUD — identificada como gap no audit-report (ISSUE RN-03).
- O wizard de criação de meta (3.2) e o detalhe (3.3) podem ser desenvolvidos em paralelo por dependerem ambos da lista (3.1).

---

### FASE 4 — Módulo Agenda

> Implementar após a Fase 3. A integração com Google Calendar é PRO e pós-MVP v2.

| # | Tela | Protótipo | Dev Spec | Status |
|---|------|-----------|----------|--------|
| 4.1 | Agenda Principal (visão semanal/mensal) | `proto-agenda.html` ✅ | — | ❌ Criar antes de iniciar 4.1 |
| 4.2 | Agenda CRUD (criar/editar eventos) | `proto-agenda-crud-v2.html` ✅ | — | ❌ Criar antes de iniciar 4.2 |

**Notas importantes para Fase 4:**
- Google Calendar Sync foi **removido do MVP v2**. É uma integração OAuth bidirecional de alta complexidade. Estará disponível no card de Integrações em Configurações (como botão PRO bloqueado), mas o fluxo de conexão completo é pós-MVP v2.
- A integração Meta↔Agenda (evento "Sessão de foco" vinculado a uma meta) deve ser implementada na Fase 4, referenciando a spec de Detalhe da Meta.

---

### FASE 5 — Transversais

> Implementar por último, pois depende de dados de todos os módulos anteriores.
> Dashboard Home agrega Finanças + Metas + Agenda. Conquistas depende de ações em todos os módulos.

| # | Tela | Protótipo | Dev Spec | Status |
|---|------|-----------|----------|--------|
| 5.1 | Dashboard Home | `proto-dashboard-revisado.html` ✅ | — | ❌ Criar antes de iniciar 5.1 |
| 5.2 | Conquistas | `proto-conquistas.html` ✅ | — | ❌ Criar antes de iniciar 5.2 |
| 5.3 | Landing Page | `proto-landing.html` ✅ | `13-LANDING-PAGE-ATIVIDADES.md` | ✅ Pronta |
| 5.4 | PWA (configuração técnica) | — | — | ⚙️ Não é tela — implementar ao final da Fase 5 |

**Notas importantes para Fase 5:**
- **Life Sync Score não é uma tela separada.** É um componente (`LifeSyncScore`) dentro do Shell de Navegação (sidebar), já especificado na `17-NAVEGACAO-SHELL-DEV-SPEC.md`. Para MVP v2, o score é exibido apenas no shell. Uma tela dedicada de evolução do score seria MVP v3+.
- **Notificações não é uma tela separada.** O sistema de notificações é: (a) toast global no shell, (b) badge no ícone do sino no Top Header, (c) configurações de preferências na tela de Configurações. Não há uma tela dedicada de "central de notificações" no MVP v2.
- Landing Page pode ser deployada independentemente das fases de app, pois é uma página pública sem autenticação.
- **PWA:** Implementar no final — `manifest.json`, service worker, ícones, configuração de `next-pwa`. Não bloqueia nenhuma outra fase.

---

## RESUMO EXECUTIVO

| Fase | Telas | Dev Specs Prontas | Status |
|------|-------|-------------------|--------|
| Fase 1 — Fundação | 4 | 4/4 | ✅ Pode iniciar |
| Fase 2 — Finanças | 7 | 1/7 | ⏳ Criar specs sob demanda |
| Fase 3 — Metas | 3 | 0/3 | ⏳ Criar specs sob demanda |
| Fase 4 — Agenda | 2 | 0/2 | ⏳ Criar specs sob demanda |
| Fase 5 — Transversais | 3+PWA | 1/3 | ⏳ Criar specs sob demanda |
| **TOTAL** | **19 telas** | **6/19 prontas** | — |

| Status | Quantidade |
|--------|-----------|
| ✅ Dev Spec pronta | 6 (Shell, Auth/Onboarding, Configurações, Dashboard Financeiro, Landing) |
| ❌ Dev Spec pendente | 13 (criar sob demanda antes de cada fase) |
| **Total de telas MVP v2** | **19** |

---

## ABORDAGEM RECOMENDADA: SPECS SOB DEMANDA

**Criar dev specs imediatamente antes de iniciar cada subtarefa**, na ordem de desenvolvimento:

1. Antes de iniciar uma tela, criar sua dev spec
2. Usar o protótipo HTML aprovado como base visual
3. Seguir o template do `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`
4. O nível de detalhe do `financas-visao-geral-regras-de-negocio.md` é o gold standard
5. Em caso de dúvida sobre regras de negócio, perguntar antes de assumir

**Por que não criar todas agora?** Porque as specs devem refletir o estado final do protótipo. Se algum ajuste fino for feito durante o desenvolvimento, a spec seria atualizada imediatamente. Criar sob demanda garante que a spec está sempre sincronizada com a realidade.

---

## DECISÕES ARQUITETURAIS REGISTRADAS

> Estas decisões foram tomadas durante a organização das fases e devem ser respeitadas
> em todas as dev specs futuras.

| Decisão | Descrição |
|---------|-----------|
| Google Calendar Sync → pós-MVP v2 | Alta complexidade OAuth bidirecional. Aparece como card bloqueado em Configurações > Integrações. |
| Life Sync Score → componente do Shell | Não é tela separada. Exibido na sidebar em Modo Jornada. Tela dedicada de evolução = MVP v3+. |
| Notificações → sem tela própria no MVP v2 | Toast global + badge no sino. Configurações centralizadas em Configurações > Notificações. |
| Modo Foco/Jornada → estado global do Shell | Implementado como ModeProvider + ThemeProvider. Não é uma tela, é Context do React. |
| PWA → última tarefa da Fase 5 | Não bloqueia nenhuma outra fase. Implementar com `next-pwa` ao final. |
| Specs sob demanda | Criar spec imediatamente antes de cada tela. Nunca criar spec de tela que ainda não vai ser desenvolvida. |

---

## HISTÓRICO DE ATUALIZAÇÕES

| Data | Versão | Mudança |
|------|--------|---------|
| 23/02/2026 | 1.0 | Criação inicial do documento |
| 23/02/2026 | 2.0 | Reorganização completa por fases de desenvolvimento; Configurações adicionada como Fase 1; spec de Configurações criada; Google Calendar Sync movido para pós-MVP v2; Life Sync Score e Notificações clarificados como não-telas; decisões arquiteturais documentadas |

---

*Versão: 2.0*  
*Última atualização: 23/02/2026*  
*Criado por: Claude (com base em análise do audit-report.md e reorganização das fases)*
