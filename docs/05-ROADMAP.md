# 05 - Roadmap de Desenvolvimento

## 1. Visão Geral das Fases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ROADMAP SYNCLIFE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FASE 0          FASE 1           FASE 2          FASE 3               │
│  Protótipos      MVP v1           Validação       MVP v2               │
│  ─────────       ──────           ─────────       ──────               │
│  1-2 dias        2-3 semanas      1-2 semanas     4-6 semanas          │
│                                                                         │
│  [████████]      [░░░░░░░░]       [░░░░░░░░]      [░░░░░░░░]           │
│   Próximo                                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FASE 4          FASE 5           FASE 6          FASE 7               │
│  Lançamento      Módulo Metas     Módulo Agenda   Integrações          │
│  ──────────      ────────────     ─────────────   ───────────          │
│  1 semana        4-6 semanas      4-6 semanas     Ongoing              │
│                                                                         │
│  [░░░░░░░░]      [░░░░░░░░]       [░░░░░░░░]      [░░░░░░░░]           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fase 0: Protótipos HTML (1-2 dias)

### Objetivo
Validar layout e design antes de escrever código funcional.

### Entregas
- [ ] Protótipo: Tela de Login
- [ ] Protótipo: Tela de Cadastro
- [ ] Protótipo: Dashboard
- [ ] Protótipo: Lista de Transações
- [ ] Protótipo: Formulário de Nova Transação
- [ ] Protótipo: Tela de Configurações

### Tecnologia
- HTML puro + TailwindCSS via CDN
- Arquivos estáticos, sem backend
- Abre direto no navegador

### Critério de Sucesso
- Layout aprovado pelo stakeholder
- Responsivo mobile validado
- Decisões de cores/fontes definidas

---

## 3. Fase 1: MVP v1 - Core + Finanças Básico (2-3 semanas)

### Semana 1: Setup e Autenticação

| Dia | Tarefas |
|-----|---------|
| 1 | Setup Next.js + Tailwind + shadcn/ui |
| 1 | Configurar projeto Supabase |
| 2 | Estrutura de pastas |
| 2 | Configurar variáveis de ambiente |
| 3 | Implementar cadastro |
| 4 | Implementar login |
| 5 | Implementar logout + recuperar senha |
| 5 | Layout base (sidebar, header) |

**Entrega**: Usuário consegue criar conta e logar.

### Semana 2: Módulo Financeiro Base

| Dia | Tarefas |
|-----|---------|
| 1 | Modelo de dados (migrations Supabase) |
| 1 | Seed de categorias padrão |
| 2 | Lista de transações |
| 2 | Filtro por mês |
| 3 | Formulário de nova transação |
| 4 | Editar transação |
| 4 | Excluir transação |
| 5 | Testes manuais e correções |

**Entrega**: CRUD completo de transações funcionando.

### Semana 3: Dashboard e Polish

| Dia | Tarefas |
|-----|---------|
| 1 | Cards de resumo (receita, despesa, saldo) |
| 2 | Gráfico de pizza por categoria |
| 2 | Lista de últimas transações |
| 3 | Tela de configurações/perfil |
| 3 | Responsividade mobile |
| 4 | Ajustes de UX (loading, empty states) |
| 5 | Deploy na Vercel |
| 5 | Testes finais |

**Entrega**: MVP v1 em produção, pronto para testes.

---

## 4. Fase 2: Validação com Usuários (1-2 semanas)

### Objetivo
Coletar feedback real antes de investir em features avançadas.

### Atividades

| Semana | Atividade |
|--------|-----------|
| 1 | Convidar 5-10 usuários beta |
| 1 | Acompanhar uso (analytics básico) |
| 1 | Coletar feedback (formulário/entrevista) |
| 2 | Analisar feedback e priorizar ajustes |
| 2 | Implementar correções críticas |
| 2 | Documentar aprendizados |

### Perguntas a Responder

1. Usuários conseguem completar o fluxo básico?
2. O que está confuso ou frustrante?
3. Qual feature mais pedem?
4. Voltariam a usar?
5. Recomendariam para amigos?

### Critério de Sucesso

- [ ] 5+ usuários testaram ativamente
- [ ] NPS calculado
- [ ] Lista de melhorias priorizada
- [ ] Decisão: seguir para v2 ou pivotar

---

## 5. Fase 3: MVP v2 - Produto Completo (4-6 semanas)

### Semana 1: PWA + Orçamentos

| Dia | Tarefas |
|-----|---------|
| 1-2 | Configurar PWA (manifest, service worker) |
| 3 | Testes de instalação iOS/Android |
| 4-5 | Sistema de orçamentos (CRUD) |

### Semana 2: Orçamentos + Gráficos

| Dia | Tarefas |
|-----|---------|
| 1-2 | Alertas de orçamento (80%, 100%) |
| 3 | Múltiplos gráficos (barras, linha) |
| 4-5 | Integração gráficos no dashboard |

### Semana 3: Modo Foco/Jornada + Score

| Dia | Tarefas |
|-----|---------|
| 1-2 | Implementar Modo Foco vs Jornada |
| 3-4 | Life Sync Score (algoritmo + UI) |
| 5 | Histórico de score |

### Semana 4: Relatórios + Notificações

| Dia | Tarefas |
|-----|---------|
| 1-2 | Relatório mensal em tela |
| 3 | Exportação PDF/Excel |
| 4-5 | Sistema de notificações (config + push) |

### Semana 5: Categorias + Recorrentes

| Dia | Tarefas |
|-----|---------|
| 1-2 | Categorias personalizadas (CRUD) |
| 3-4 | Transações recorrentes |
| 5 | Geração automática de recorrentes |

### Semana 6: Polish + Dark Mode

| Dia | Tarefas |
|-----|---------|
| 1 | Dark mode |
| 2 | Onboarding guiado |
| 3 | "Modo Recomeço" |
| 4 | Animações e micro-interações |
| 5 | Testes finais e deploy |

---

## 6. Fase 4: Lançamento Público (1 semana)

### Atividades

| Dia | Atividade |
|-----|-----------|
| 1 | Preparar landing page |
| 2 | Configurar analytics (Vercel/Plausible) |
| 3 | Monitoramento de erros (Sentry) |
| 4 | Soft launch (comunidades, amigos) |
| 5 | Ajustes baseados em feedback |
| 6-7 | Lançamento em Product Hunt / redes |

### Critério de Sucesso

- [ ] 100+ cadastros na primeira semana
- [ ] Taxa de erro < 1%
- [ ] NPS > 40
- [ ] Primeiros usuários pagos (se pricing ativo)

---

## 7. Fase 5: Módulo Metas (4-6 semanas) - FUTURO

### Escopo Planejado

- Sistema de OKRs pessoais
- Metas financeiras vinculadas
- Progresso visual
- Milestones e celebrações
- Integração com Life Sync Score

---

## 8. Fase 6: Módulo Agenda (4-6 semanas) - FUTURO

### Escopo Planejado

- Calendário integrado
- Eventos e lembretes
- Integração Google Calendar
- Visão semanal/mensal
- Blocos de tempo para metas

---

## 9. Fase 7: Integrações (Ongoing) - FUTURO

### Possíveis Integrações

| Integração | Prioridade | Complexidade |
|------------|------------|--------------|
| Google Calendar | Alta | Média |
| Open Finance (bancos) | Alta | Alta |
| Notion | Média | Média |
| Todoist | Média | Baixa |
| Apple Health | Baixa | Alta |
| Google Fit | Baixa | Média |

---

## 10. Timeline Visual

```
2026
─────────────────────────────────────────────────────────────────────

FEV                              MAR                              ABR
├───────────────────────────────┼───────────────────────────────┼────
│                               │                               │
│ [Fase 0]  [====Fase 1====]   │[Fase 2][======Fase 3=======]  │[F4]
│ Protótipo   MVP v1            │Validação     MVP v2           │Lanç
│                               │                               │
│ ■■          ■■■■■■■■■■        │■■■    ■■■■■■■■■■■■■■■■■■■■    │■■
│                               │                               │

Legenda:
■ = Desenvolvimento ativo
= = Período estimado
```

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Atraso no MVP v1 | Média | Cortar escopo, não prazo |
| Baixa adoção beta | Média | Incentivar com features exclusivas |
| Escopo creep no v2 | Alta | Backlog fechado, não adicionar |
| Burnout solo dev | Média | Pausas planejadas, MVPs pequenos |
| Bugs em produção | Média | Sentry, logs, rollback rápido |

---

## 12. Checkpoints de Decisão

| Após Fase | Pergunta | Ação se Negativo |
|-----------|----------|------------------|
| Fase 2 | Usuários voltam? NPS > 20? | Pivotar ou ajustar proposta |
| Fase 4 | 100+ usuários? Engajamento? | Revisar marketing/produto |
| Fase 5 | Metas agrega valor? | Priorizar outro módulo |

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0*
