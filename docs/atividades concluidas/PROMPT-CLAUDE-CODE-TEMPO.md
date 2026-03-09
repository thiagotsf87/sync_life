# PROMPT — Claude Code: Implementação do Módulo Tempo
**Projeto:** SyncLife  
**Módulo:** ⏳ Tempo (Agenda e Compromissos)  
**Cor:** `#06b6d4` (Cyan)  
**Ícone Lucide:** `Clock`  
**Data:** 07/03/2026  

---

## INSTRUÇÃO INICIAL

Antes de escrever qualquer código, leia e compreenda estes documentos nesta ordem:

1. `SPEC-FUNCIONAL-TEMPO.md` — especificação funcional completa (18 seções, 1351 linhas, 35 regras de negócio RN-TMP-01 a RN-TMP-35, 8 integrações cross-módulo detalhadas com cenários, schema SQL com 3 tabelas)
2. `proto-mobile-tempo-v3.html` — protótipo visual com 12 telas estáticas (abrir no browser e comparar visualmente durante implementação)
3. `CLAUDE.md` — convenções do projeto, stack, estrutura de pastas
4. `DOC-FUNCIONAL-FUTURO-COMPLETO.md` — referência de padrão de integrações cross-módulo
5. `SPEC-FUNCIONAL-MENTE.md` — referência de implementação do Timer Pomodoro (reutilizar padrão para Timer Foco)

Após ler, faça um diagnóstico do estado atual do código e apresente um plano de execução detalhado antes de começar a codificar. Não escreva código ainda — apenas analise e planeje.

---

## CONTEXTO DO MÓDULO

| Propriedade | Valor |
|-------------|-------|
| Nome | Tempo |
| Cor CSS | `var(--tempo)` = `#06b6d4` |
| Cor glow CSS | `var(--tempo-g)` = `rgba(6,182,212,0.14)` |
| Ícone Lucide | `Clock` |
| Rota base | `/tempo` |
| Sub-rotas | `/tempo` (Dashboard), `/tempo/agenda`, `/tempo/semanal`, `/tempo/mensal`, `/tempo/review` |
| Tabelas Supabase | `calendar_events`, `focus_sessions`, `weekly_reviews` |
| Sub-nav tabs | Dashboard \| Agenda \| Semanal \| Mensal \| Review |
| Tipos de evento | appointment, task, focus, reminder |
| Integrações | Finanças (custos), Corpo (consultas), Mente (Pomodoro), Futuro (metas/deadlines), Carreira (steps), Experiências (viagens), Patrimônio (proventos) |

---

## PLANO DE IMPLEMENTAÇÃO — 8 FASES

### Fase 1: Estrutura e Navegação (2-3h)

**Atividades:**
1.1. Criar rota `/tempo` com layout do módulo no App Router
1.2. Criar componente `TempoLayout` com header do módulo (⏳ Tempo + badge "N hoje")
1.3. Criar componente `TempoSubNav` com 5 tabs underline: Dashboard | Agenda | Semanal | Mensal | Review
1.4. Tab ativa usa underline de 3px em `var(--tempo)` (#06b6d4), texto `var(--t1)`. Tabs inativas: texto `var(--t3)`, sem underline. **UNDERLINE, não pills.**
1.5. Badge no header: contagem dinâmica de eventos do dia (`SELECT COUNT(*) FROM calendar_events WHERE user_id = ? AND start_date = CURRENT_DATE AND status != 'deleted'`)
1.6. Integrar com AppShell: Module Bar e Sidebar devem apontar para `/tempo` com ícone Clock e cor cyan
1.7. Criar páginas placeholder para cada sub-rota (5 arquivos page.tsx)

**Validação Fase 1:**
- [ ] Navegar entre as 5 tabs sem erro (URL muda)
- [ ] Header mostra "⏳ Tempo" + badge com contagem real
- [ ] Tab ativa tem underline cyan, inativas sem underline
- [ ] Module Bar e Sidebar reconhecem o módulo Tempo
- [ ] Mobile (375px): tabs cabem na tela sem overflow

---

### Fase 2: Dashboard (3-4h)

**Atividades:**
2.1. Criar componente `TempoDashboard` com 5 sub-componentes
2.2. `KpiGrid` — 4 cards em grid 2×2:
   - Eventos hoje: count de calendar_events do dia
   - Horas planejadas: soma de (end_time - start_time) dos eventos do dia
   - Conclusão semana: (completed / total) × 100 da semana corrente
   - Próximo: primeiro evento com start_time > now()
   - Cores dinâmicas: conclusão ≥70% verde, 40-69% amarelo, <40% vermelho
2.3. `DayTimeline` — lista dos próximos 5 eventos (EventCard compacto com barra de cor do módulo)
   - Evento em andamento: borda glow cyan
   - Eventos passados: opacidade 0.5
   - Zero eventos: empty state "Dia livre! 🎉"
2.4. `ModuleDistribution` — barras horizontais de horas por módulo na semana
   - Cada barra na cor do módulo (var(--carreira), var(--mente), etc.)
   - Ordenadas de maior para menor
   - Se zero módulos vinculados: "Vincule eventos a módulos para ver sua distribuição"
2.5. `QuickFoco` — card atalho para Timer Foco (PRO only, FREE mostra 🔒)
2.6. `[Jornada] TimeInsight` — card com insight IA (regras de negócio, não IA generativa)

**Validação Fase 2:**
- [ ] KPIs mostram dados reais do Supabase
- [ ] Timeline lista eventos do dia com cores de módulo corretas
- [ ] Distribuição mostra barras proporcionais
- [ ] Empty state aparece quando zero eventos
- [ ] Quick Foco bloqueado para FREE, funcional para PRO

---

### Fase 3: Agenda Diária (3-4h)

**Atividades:**
3.1. Criar componente `TempoAgenda` com WeekStrip + EventList
3.2. `WeekStrip` — 7 bolhas flexíveis (flex:1) sem scroll horizontal:
   - Cada bolha: abreviação do dia (DOM/SEG...), número, até 3 dots coloridos
   - Dia atual: fundo var(--tempo-g), borda cyan, texto cyan
   - Dots: calculados por módulos distintos com eventos naquele dia
   - Tap troca dia selecionado → atualiza EventList
   - Swipe horizontal → navega para semana anterior/seguinte
3.3. `EventList` — lista cronológica do dia selecionado:
   - EventCard: hora início/fim, título, sub-texto (📍 local · duração), barra lateral 3px na cor do módulo, badges (módulo + custo)
   - Eventos "dia todo" no topo em seção separada
   - Evento concluído: ✓ + tachado + opacidade 0.5
   - Evento em andamento: borda glow
3.4. `TomorrowPreview` — aparece apenas quando dia selecionado = hoje:
   - "Amanhã — N eventos" + primeiros 2 em opacidade 0.6
3.5. FAB "+" para criar evento (posição fixa, bottom-right, acima do bottom bar)

**Validação Fase 3:**
- [ ] Trocar dia no WeekStrip atualiza lista instantaneamente
- [ ] Dots coloridos refletem módulos dos eventos reais de cada dia
- [ ] EventCard mostra hora, título, módulo badge, custo badge
- [ ] Preview "Amanhã" aparece só no dia atual
- [ ] Tap em evento navega para Detalhe

---

### Fase 4: CRUD de Eventos (4-5h)

**Atividades:**
4.1. Criar Wizard 2 steps como página L2 (`/tempo/novo`):
   - Step 1: título (obrigatório), tipo (grid 2×2: Compromisso/Tarefa/Foco/Lembrete), data, hora, duração rápida (pills: 30min/1h/2h/Dia todo)
   - Step 2: módulo vinculado (dropdown com ícones), local, custo (R$), repetição, lembrete, notas, cor
   - "Criar rápido" no Step 1 pula Step 2
4.2. Se custo > 0: chamar `createTransactionFromEvent()` para criar transação pendente em Finanças
   - Descrição: "📅 [título]"
   - Categoria mapeada pelo módulo (Corpo→Saúde, Mente→Educação, etc.)
4.3. Detalhe do Evento (`/tempo/evento/[id]`):
   - Hero card com gradiente do módulo
   - Informações completas (data, hora, local, custo, lembrete, notas, módulo)
   - Link para entidade vinculada ("→ Ver consulta no Corpo")
   - Botões: Concluir (tarefa/foco) | Editar | Excluir
4.4. Editar Evento: mesma UI do wizard com dados preenchidos
   - Se recorrente: modal "Alterar só este / Este e futuros / Todos"
4.5. Excluir Evento:
   - Confirmação "Tem certeza?"
   - Se recorrente: modal de escopo
   - Soft delete (status = 'deleted')
   - Se transação vinculada: "Excluir transação de R$ [valor] também?"
4.6. Concluir (Tarefa/Foco):
   - status = 'completed', completed_at = now()
   - Se meta vinculada no Futuro: atualizar progress
   - [Jornada] +3 XP (tarefa) ou +8 XP (foco)

**Validação Fase 4:**
- [ ] Criar evento mínimo (título + hora) funciona
- [ ] Criar com custo gera transação em Finanças
- [ ] Módulo vinculado define cor correta do evento
- [ ] Editar recorrente oferece 3 opções de escopo
- [ ] Concluir tarefa atualiza status + progresso de meta vinculada
- [ ] Excluir faz soft delete com confirmação
- [ ] FREE: bloqueio com UpgradeModal no 31º evento do mês

---

### Fase 5: Visões Semanal e Mensal (3-4h)

**Atividades:**
5.1. `TempoSemanal` — grid de calendário semanal:
   - Coluna fixa com rótulos de hora (08:00–22:00)
   - Mobile: 3 colunas de dias visíveis + scroll horizontal
   - Desktop: 7 colunas
   - Blocos posicionados por start_time, altura proporcional à duração
   - Cor do bloco = cor do módulo vinculado
   - Sobreposição: split horizontal (2 eventos na mesma hora dividem largura)
   - Linha "agora" vermelha (2px, atualiza a cada 60s via setInterval)
   - Tap em bloco → Detalhe do Evento
   - Tap em slot vazio → Criar Evento com data/hora pré-preenchidas
   - Header: "← 1–7 Mar 2026 →" com navegação entre semanas
5.2. Card resumo semanal abaixo do grid: "📊 Esta semana: Xh planejadas em Y módulos"
5.3. `TempoMensal` — grid 7×5/6 do mês:
   - Cada célula: número do dia + até 3 dots coloridos (módulos)
   - Dia atual: fundo var(--tempo-g), borda cyan, número bold cyan
   - Dias fora do mês: opacidade 0.3
   - Header: "← Março 2026 →" com navegação
   - Tap em dia → navega para tab Agenda com dia selecionado
5.4. Mini preview do dia selecionado no rodapé: "Hoje, 1 Mar — 3 eventos" + inline list

**Validação Fase 5:**
- [ ] Semanal: blocos posicionados corretamente por hora
- [ ] Semanal: tap em bloco abre detalhe, tap em slot vazio abre wizard
- [ ] Semanal: linha vermelha "agora" visível e atualiza
- [ ] Mensal: dots coloridos por módulo em cada dia
- [ ] Mensal: tap no dia navega para Agenda com dia correto

---

### Fase 6: Review Semanal (2-3h)

**Atividades:**
6.1. Criar componente `TempoReview` (PRO only)
6.2. Hero card com range da semana: "📊 Review — 24 Fev a 1 Mar"
6.3. Métricas: total eventos (DM Mono 22px cyan), % concluídos (verde), horas dedicadas
6.4. Barras de distribuição por módulo: barras horizontais com cor e % (Carreira 55%, Mente 22%...)
6.5. Lista de pendências (eventos tipo Tarefa não concluídos da semana):
   - Cada pendência com botão "Mover" (cria novo evento na segunda seguinte) e "Descartar"
6.6. FREE gate: preview borrado (CSS blur(6px)) + UpgradeModal sobreposto
6.7. Salvar review em `weekly_reviews` com UNIQUE(user_id, week_start)
6.8. [Jornada] +10 XP ao concluir + tela de celebração (tela 12 do protótipo)

**Validação Fase 6:**
- [ ] PRO: review mostra dados reais da semana calculados do Supabase
- [ ] FREE: preview borrado + UpgradeModal
- [ ] Mover pendência cria evento na segunda seguinte
- [ ] UNIQUE constraint impede 2 reviews na mesma semana
- [ ] Salvar review persiste em weekly_reviews

---

### Fase 7: Timer de Foco (2-3h)

**Atividades:**
7.1. Criar componente `TempoFoco` como tela L2 (`/tempo/foco`) — PRO only
7.2. Badge de contexto: pill mostrando meta/evento vinculado ("🧠 React Avançado — Meta 62%")
7.3. Timer circular SVG ring (200×200px):
   - Track de fundo var(--s3), progresso em var(--tempo) que diminui
   - Countdown DM Mono 48px no centro
   - Label "de 25:00" abaixo
7.4. Controles: 3 botões circulares (Pausar/56px, Parar/72px primário, Pular/56px)
7.5. Card stats: "Sessão 3 de 4 · Streak: 5 dias" com progress bar
7.6. Card info: "Ao concluir: +1,5h registradas na meta 'Aprender React' no Futuro. Progresso atual: 62%"
7.7. Ao concluir (timer=0 ou tap Parar com >5min):
   - Registrar em focus_sessions (planned_minutes, actual_minutes, status)
   - Se goal_id: atualizar objective_goals.current_value com horas
   - [Jornada] +8 XP
7.8. Se <5min: não registra (RN-TMP-34)
7.9. FREE gate: card 🔒 com "Desbloqueie Timer de Foco — PRO"

**Validação Fase 7:**
- [ ] Timer funciona com countdown preciso (±1s)
- [ ] Pausar/retomar mantém estado
- [ ] Concluir registra horas em focus_sessions
- [ ] Meta vinculada atualiza current_value
- [ ] <5min não registra sessão
- [ ] FREE vê card bloqueado

---

### Fase 8: Integrações Cross-Módulo + Testes (3-4h)

**Atividades:**
8.1. Integração Corpo → Tempo: consulta criada no Corpo gera evento automático (se toggle ativo)
   - Reutilizar/criar `createEventFromAppointment()` em `lib/integrations/tempo.ts`
8.2. Integração Mente → Tempo: sessão Pomodoro concluída registra bloco de estudo (se toggles ativos)
   - Reutilizar/criar `createEventFromPomodoro()` 
8.3. Integração Futuro → Tempo: meta tipo tarefa com deadline gera evento
   - Criar `createEventFromGoalDeadline()`
8.4. Integração Experiências → Tempo: viagem com datas gera bloqueio de dias
   - Criar `createEventsFromTrip()`
8.5. Integração Patrimônio → Tempo: provento com data gera lembrete
   - Criar `createReminderFromDividend()`
8.6. Verificar que TODOS os toggles em Configurações > Integrações controlam essas integrações (opt-in)
8.7. Rodar testes Playwright (ver seção abaixo)

**Validação Fase 8:**
- [ ] Criar consulta no Corpo com toggle ativo → evento aparece no Tempo
- [ ] Pomodoro no Mente com toggle ativo → bloco de estudo no Tempo
- [ ] Meta tipo tarefa no Futuro → evento com deadline no Tempo
- [ ] Viagem no Experiências → dias bloqueados no Tempo
- [ ] Toggle desativado → integração não dispara
- [ ] 55 testes Playwright passando

---

## TESTES PLAYWRIGHT — 55 TESTES EM 8 GRUPOS

### Grupo 1: Navegação (7 testes)
- [ ] Sub-nav com 5 tabs visíveis e clicáveis
- [ ] Tab ativa tem underline cyan (3px, var(--tempo))
- [ ] Tab inativa não tem underline
- [ ] Header mostra "⏳ Tempo" + badge com contagem
- [ ] Navegar entre tabs atualiza URL (/tempo, /tempo/agenda, etc.)
- [ ] Badge atualiza ao criar/excluir evento
- [ ] Mobile 375px: tabs cabem sem overflow

### Grupo 2: Dashboard (7 testes)
- [ ] 4 KPI cards renderizam com dados do Supabase
- [ ] "Próximo" mostra evento correto ou "Livre"
- [ ] Cor de "Conclusão" muda: verde ≥70%, amarelo 40-69%, vermelho <40%
- [ ] Timeline mostra max 5 eventos
- [ ] Evento em andamento tem borda glow cyan
- [ ] Distribuição por módulo mostra barras com cores corretas
- [ ] Empty state quando zero eventos: "Dia livre! 🎉"

### Grupo 3: Agenda (8 testes)
- [ ] WeekStrip mostra 7 dias sem scroll (flex:1)
- [ ] Dia atual tem fundo var(--tempo-g) e texto cyan
- [ ] Dots coloridos refletem módulos dos eventos (max 3 dots)
- [ ] Trocar dia atualiza lista de eventos instantaneamente
- [ ] EventCard mostra hora, título, barra de cor do módulo, badge módulo
- [ ] Evento com custo mostra badge "💰 R$ X"
- [ ] Preview "Amanhã" aparece só no dia atual
- [ ] Tap em EventCard navega para Detalhe

### Grupo 4: CRUD (9 testes)
- [ ] Criar evento mínimo (título + data + hora) via "Criar rápido"
- [ ] Criar evento completo via wizard 2 steps
- [ ] Criar com custo > 0 gera transação pendente em Finanças
- [ ] Criar com módulo vinculado define cor automaticamente
- [ ] Editar evento atualiza dados no Supabase
- [ ] Editar evento recorrente oferece modal com 3 opções
- [ ] Concluir tarefa atualiza status=completed e progresso de meta vinculada
- [ ] Excluir com confirmação faz soft delete (status=deleted)
- [ ] FREE: UpgradeModal no 31º evento do mês

### Grupo 5: Visão Semanal (6 testes)
- [ ] Grid mostra 3 colunas de dias em mobile (375px)
- [ ] Blocos posicionados proporcionalmente por hora
- [ ] Cor do bloco = cor do módulo vinculado
- [ ] Tap em bloco navega para Detalhe
- [ ] Tap em slot vazio abre wizard com data/hora pré-preenchidas
- [ ] Linha vermelha "agora" visível e posicionada corretamente

### Grupo 6: Visão Mensal (6 testes)
- [ ] Grid 7×5/6 renderiza corretamente para meses de 28-31 dias
- [ ] Dia atual com fundo cyan glow e número bold
- [ ] Dots coloridos por módulo em cada dia (max 3)
- [ ] Tap em dia navega para Agenda com dia selecionado
- [ ] Mini preview mostra eventos do dia no rodapé
- [ ] Dias fora do mês com opacidade 0.3

### Grupo 7: Review Semanal (6 testes)
- [ ] PRO: review completo renderiza com métricas da semana
- [ ] FREE: preview borrado (blur) + UpgradeModal
- [ ] Barras de distribuição com cores corretas dos módulos
- [ ] "Mover" pendência cria evento na segunda seguinte
- [ ] Salvar review persiste em weekly_reviews
- [ ] UNIQUE constraint impede 2 reviews na mesma semana

### Grupo 8: Timer Foco + Integrações (6 testes)
- [ ] PRO: timer countdown funciona (±1s de precisão)
- [ ] FREE: card bloqueado com 🔒
- [ ] Concluir sessão >5min registra em focus_sessions
- [ ] Meta vinculada atualiza current_value com horas
- [ ] Integração Corpo→Tempo: consulta gera evento (toggle ativo)
- [ ] Integração Mente→Tempo: Pomodoro gera bloco estudo (toggle ativo)

---

## 10 REGRAS ABSOLUTAS

1. **Cor:** `#06b6d4` em tudo — usar `var(--tempo)` e `var(--tempo-g)`. Nunca hardcode hex.
2. **Sub-nav:** UNDERLINE TABS com 3px, não pills. Padrão do módulo Futuro.
3. **Zero scrollbar:** Nenhuma barra de rolagem visível em qualquer componente. Overflow: hidden ou auto com scrollbar-width: none.
4. **Tipos de evento:** 4 tipos distintos (appointment, task, focus, reminder) com comportamento específico cada.
5. **FREE: 30 eventos/mês.** PRO: ilimitado. Review e Timer são PRO only.
6. **Custo > 0 = transação.** Sempre cria transação pendente em Finanças. Excluir evento pergunta se exclui transação.
7. **Soft delete em tudo.** Nunca `DELETE FROM`. Sempre `status = 'deleted'`.
8. **Integrações são opt-in.** Verificar toggle em Configurações > Integrações antes de criar eventos automáticos.
9. **Mobile-first.** Testar em 375px antes de desktop. WeekStrip sem scroll (flex:1). Semanal com 3 colunas.
10. **Visual = protótipo.** Comparar cada tela implementada com `proto-mobile-tempo-v3.html`. Cor, espaçamento, tipografia devem ser idênticos.

---

## ORDEM DE EXECUÇÃO (GRAFO DE DEPENDÊNCIAS)

```
Fase 1 (Navegação) ←── Bloqueadora de tudo
  │
  ├── Fase 2 (Dashboard)
  │     └── Depende de: rotas + sub-nav funcionando
  │
  ├── Fase 3 (Agenda)
  │     └── Depende de: rotas + sub-nav + EventCard component
  │
  └── Fase 4 (CRUD) ←── Bloqueadora das fases 5-8
        │     └── Depende de: Agenda para exibir eventos criados
        │
        ├── Fase 5 (Semanal/Mensal)
        │     └── Depende de: CRUD para ter eventos a exibir
        │
        ├── Fase 6 (Review)
        │     └── Depende de: CRUD para ter dados de métricas
        │
        ├── Fase 7 (Timer Foco)
        │     └── Depende de: CRUD para vincular eventos + Futuro para metas
        │
        └── Fase 8 (Integrações + Testes) ←── ÚLTIMA
              └── Depende de: TUDO funcionando
```

**Estimativa total:** ~22-28 horas de desenvolvimento

---

## CHECKLIST DE CONCLUSÃO

- [ ] 5 tabs L1 navegáveis com underline cyan (Dashboard, Agenda, Semanal, Mensal, Review)
- [ ] Header "⏳ Tempo" + badge dinâmico de contagem
- [ ] KPIs do Dashboard calculando com dados reais do Supabase
- [ ] WeekStrip com 7 bolhas flex:1, dots coloridos dinâmicos, dia atual cyan
- [ ] EventCard com barra de cor do módulo + badge módulo + badge custo
- [ ] CRUD completo: criar (wizard 2 steps), editar, concluir, excluir (soft delete)
- [ ] 4 tipos de evento com comportamento distinto (appointment/task/focus/reminder)
- [ ] Custo de evento → transação automática em Finanças
- [ ] Visão Semanal: grid com blocos posicionados + linha "agora" + 3 cols mobile
- [ ] Visão Mensal: grid 7×5/6 com dots coloridos + mini preview
- [ ] Review Semanal PRO: métricas, distribuição, pendências com "Mover"
- [ ] Timer Foco PRO: countdown SVG, registro de horas, atualização de meta
- [ ] Integrações: Corpo→consultas, Mente→Pomodoro, Futuro→deadlines, Experiências→viagens
- [ ] Empty states em todas as telas (Dashboard, Agenda, Review)
- [ ] FREE vs PRO: limite 30/mês + UpgradeModal + gates para Review e Timer
- [ ] [Jornada] XP: +5 criar, +3 concluir tarefa, +8 foco, +10 review
- [ ] 55 testes Playwright passando (8 grupos)
- [ ] Visual 100% consistente com proto-mobile-tempo-v3.html
- [ ] Zero barras de rolagem visíveis em qualquer tela
- [ ] Responsivo: testado em 375px, 768px, 1024px, 1440px

---

*Prompt criado em: 07/03/2026*  
*Módulo: ⏳ Tempo — Agenda e Compromissos*  
*Spec de referência: SPEC-FUNCIONAL-TEMPO.md (1351 linhas, 35 regras de negócio)*  
*Protótipo: proto-mobile-tempo-v3.html (12 telas)*  
*Estimativa: ~22-28h de desenvolvimento*
