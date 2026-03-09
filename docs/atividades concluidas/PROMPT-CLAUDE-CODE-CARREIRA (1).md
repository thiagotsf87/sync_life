# 💼 PROMPT CLAUDE CODE — Módulo Carreira

> **Instrução para Claude Code:** Leia INTEGRALMENTE os 3 documentos abaixo antes de escrever qualquer código:
> 1. `SPEC-FUNCIONAL-CARREIRA.md` — Especificação funcional (regras de negócio, componentes, critérios de aceite)
> 2. `proto-mobile-carreira-v3.html` — Protótipo visual (abrir no browser para referência de design)
> 3. `CLAUDE.md` — Convenções do projeto (imports, nomenclatura, testes)
>
> **Módulo:** Carreira  
> **Cor:** `#f43f5e` (Rose)  
> **Ícone Lucide:** `Briefcase`  
> **Rota base:** `/carreira`  
> **Entidade principal:** Habilidades (Skills)

---

## CONTEXTO DO MÓDULO

O módulo Carreira gerencia o perfil profissional, habilidades, roadmap de carreira, e histórico salarial do usuário. Ele se integra com Mente (skills ↔ trilhas), Finanças (promoção → receita), e Futuro (roadmap step → meta).

**Tabelas:**
- `career_profile` — Perfil profissional (bio, avatar, next_review_date, xp, level)
- `career_positions` — Posições/cargos (title, company, salary, is_current)
- `career_skills` — Habilidades (name, category, proficiency, linked_track_id)
- `career_education` — Formação (title, institution, type, status)
- `career_links` — Links profissionais (platform, url)
- `career_roadmap_steps` — Steps do roadmap (title, status, salary_min/max, target_date)
- `career_roadmap_step_skills` — Skills requeridas por step (step_id, skill_id)

**Cor do módulo:** `#f43f5e`
- CSS variable: `--car: #f43f5e`
- Glow: `rgba(244, 63, 94, 0.15)`
- Dim: `rgba(244, 63, 94, 0.08)`

**Integrações cross-módulo:**
- Carreira → Finanças: promoção atualiza receita (RN-CAR-15)
- Carreira ↔ Mente: skill ↔ trilha bidirecional (RN-CAR-16, RN-MNT-15)
- Carreira → Futuro: roadmap step → meta de objetivo (RN-CAR-17)

---

## FASE 1 — Infraestrutura e Schema (Migration)

**Objetivo:** Criar tabelas do módulo no Supabase.

**Referência visual:** N/A (infraestrutura)
**Referência funcional:** Seção 16 do spec (Modelo de Dados)

### Atividades:

1.1. Criar migration SQL com todas as 7 tabelas do módulo (career_profile, career_positions, career_skills, career_education, career_links, career_roadmap_steps, career_roadmap_step_skills)

1.2. Criar todos os índices recomendados (7 índices)

1.3. Configurar RLS (Row Level Security) para todas as tabelas:
   - Política: usuário só acessa seus próprios dados
   - `user_id = auth.uid()` para todas as tabelas

1.4. Criar seed data para testes:
   - 1 career_profile
   - 3 career_positions (Junior → Pleno → atual)
   - 10 career_skills (6 técnicas, 3 soft, 1 idioma)
   - 2 career_education
   - 3 career_links
   - 5 career_roadmap_steps (2 completed, 1 current, 1 next, 1 vision)
   - Skills vinculadas aos steps

### Validação Fase 1:
- [ ] Migration roda sem erros
- [ ] RLS configurado e testado
- [ ] Seed data inserido corretamente
- [ ] Índices criados

---

## FASE 2 — Rotas e Navegação

**Objetivo:** Criar estrutura de rotas e navegação do módulo.

**Referência visual:** Header e sub-nav do protótipo (todas as telas)
**Referência funcional:** Seção 3 do spec (Mapa de Navegação)

### Atividades:

2.1. Criar rota `/carreira` com layout do módulo:
   - Header: ícone 💼 + "Carreira" (Syne 20px) + botões contextuais
   - Sub-nav com 5 tabs UNDERLINE: Dashboard, Perfil, Roadmap, Habilidades, Histórico
   - Tab ativa: texto `#f43f5e` + underline 3px `#f43f5e`
   - Tabs inativas: texto `var(--t3)`, sem underline

2.2. Criar sub-rotas:
   - `/carreira` → Dashboard (default)
   - `/carreira/perfil` → Perfil Profissional
   - `/carreira/roadmap` → Roadmap
   - `/carreira/habilidades` → Mapa de Habilidades
   - `/carreira/historico` → Histórico Salarial

2.3. Criar rotas internas (L2):
   - `/carreira/habilidades/nova` → Adicionar Habilidade
   - `/carreira/historico/nova-promocao` → Registrar Promoção
   - `/carreira/perfil/editar` → Editar Perfil

2.4. Implementar navegação entre tabs (sem recarregar página)

### Validação Fase 2:
- [ ] RN-CAR-05: Navegação entre 5 tabs funciona sem reload
- [ ] Cor correta `#f43f5e` no underline da tab ativa
- [ ] Telas L2 têm header simplificado (← título Cancelar)
- [ ] Mobile-first: tabs scrolláveis em 375px

---

## FASE 3 — Dashboard

**Objetivo:** Implementar a tela principal com todos os componentes.

**Referência visual:** Tela 01 do protótipo (Foco)
**Referência funcional:** Seção 5 do spec (Dashboard)

### Atividades:

3.1. Hero Card do Cargo Atual
   - Query: `career_positions` WHERE `is_current = true`
   - Exibir: avatar, cargo, empresa, localidade, badges
   - Empty state se não há posição: CTA "Configure seu cargo"

3.2. KPI Grid (2×2)
   - Salário atual: `career_positions.salary` (current)
   - Próxima revisão: `career_profile.next_review_date`
   - Habilidades: COUNT `career_skills`
   - Roadmap %: cálculo de skills dominadas do próximo step

3.3. Próximo Milestone
   - Query: `career_roadmap_steps` WHERE `status = 'next'` com JOIN em step_skills e career_skills
   - Barra de progresso: skills dominadas (≥70%) / total requeridas × 100
   - Skills tags coloridas: verde (≥70%), cor módulo (40-69%), cinza (<40%)

3.4. Insight IA (card)
   - Implementar lógica de regras (seção 5.2.4 do spec)
   - 5 regras por prioridade

3.5. Quick Actions (grid 2×2)
   - 4 cards com navegação para sub-telas

### Validação Fase 3:
- [ ] RN-CAR-04: Progresso do roadmap calculado corretamente
- [ ] RN-CAR-06: Apenas 1 posição é "atual"
- [ ] RN-CAR-11: Tempo no nível calculado automaticamente
- [ ] KPIs carregam em < 2 segundos
- [ ] Empty state funciona quando não há dados

---

## FASE 4 — Perfil Profissional e CRUD de Posições

**Objetivo:** Tela de perfil com experiência, formação, links e CRUD de posições.

**Referência visual:** Tela 02 do protótipo
**Referência funcional:** Seções 6 e 10.2 do spec

### Atividades:

4.1. Card de Perfil (bio, avatar, cargo, empresa)
4.2. Seção Experiência (lista de posições, badge "Atual")
4.3. Seção Formação (lista de educação com status)
4.4. Seção Links (lista de links clicáveis)
4.5. Tela Editar Perfil (`/carreira/perfil/editar`)
4.6. CRUD de posições (criar, editar, excluir)
   - RN-CAR-07: Registrar nova posição encerra a anterior
   - RN-CAR-08: Salário obrigatório

### Validação Fase 4:
- [ ] RN-CAR-06: Apenas 1 posição "atual"
- [ ] RN-CAR-07: Posição anterior encerrada automaticamente
- [ ] Links abrem em nova aba
- [ ] Bio limitada a 280 chars

---

## FASE 5 — Roadmap e Mapa de Habilidades

**Objetivo:** Timeline vertical do roadmap e mapa de skills com proficiência.

**Referência visual:** Telas 03 e 04 do protótipo
**Referência funcional:** Seções 7 e 8 do spec

### Atividades:

5.1. Timeline vertical do roadmap
   - Steps com status visual: completed (verde ✓), current (cor módulo com glow), next (número), future (cinza), vision (🌟)
   - Indicador de posição atual
   - Skills tags por step

5.2. Mapa de Habilidades
   - Filtros por categoria (pills)
   - KPIs (total, em desenvolvimento)
   - Barras de proficiência por categoria
   - RN-CAR-02: Cores por nível (verde ≥70%, amarelo 40-69%, vermelho <40%)

5.3. CRUD de Habilidades
   - Tela Adicionar (`/carreira/habilidades/nova`)
   - Formulário: nome, categoria (chips), nível (1-5 visual), trilha vinculada, notas
   - RN-CAR-01: Limite FREE de 10 skills
   - RN-CAR-18: Nome único por usuário

5.4. CRUD de Roadmap Steps
   - Adicionar/editar/remover steps
   - Vincular skills a steps

5.5. Card integração Mente
   - Query: skills com `linked_track_id` não nulo
   - Link para módulo Mente

### Validação Fase 5:
- [ ] RN-CAR-01: Limite de 10 skills para FREE
- [ ] RN-CAR-02: Cores corretas por nível de proficiência
- [ ] RN-CAR-03: Skill dominada = proficiência ≥ nível 4
- [ ] RN-CAR-04: Progresso do roadmap recalcula ao alterar skill
- [ ] RN-CAR-13: Skills vinculadas a steps do roadmap
- [ ] RN-CAR-18: Nome de skill único (case-insensitive)
- [ ] RN-CAR-19: 4 categorias fixas (hard_skill, soft_skill, idioma, certificação)

---

## FASE 6 — Histórico Salarial e Registrar Promoção

**Objetivo:** Gráfico de evolução salarial, lista de promoções, formulário de promoção.

**Referência visual:** Telas 05 e 07 do protótipo
**Referência funcional:** Seções 9 e 10.2 do spec

### Atividades:

6.1. Gráfico de evolução salarial (barras por período)
6.2. Lista de promoções com aumento %
   - RN-CAR-09: Cálculo de aumento %
   - RN-CAR-10: Crescimento total desde o primeiro salário
6.3. Métricas de carreira (KPI Grid)
   - Tempo de carreira, promoções, crescimento médio, projeção
6.4. Tela Registrar Promoção (`/carreira/historico/nova-promocao`)
   - Formulário: cargo, empresa, salário, data
   - Comparação automática: salário anterior vs novo
   - Toggle integração Finanças
6.5. RN-CAR-15: Se toggle ativo, atualizar receita recorrente em Finanças

### Validação Fase 6:
- [ ] RN-CAR-08: Salário obrigatório
- [ ] RN-CAR-09: Aumento % calculado corretamente
- [ ] RN-CAR-10: Crescimento total correto
- [ ] RN-CAR-15: Integração com Finanças funciona (quando ativa)
- [ ] Gráfico renderiza corretamente com 1-10 posições

---

## FASE 7 — Integrações Cross-módulo e Modo Jornada

**Objetivo:** Implementar integrações bidirecional com Mente, Finanças e Futuro. Adicionar componentes Jornada.

**Referência visual:** Todas as telas modo Jornada do protótipo
**Referência funcional:** Seções 11, 14, 17 do spec

### Atividades:

7.1. Integração Carreira → Finanças (RN-CAR-15)
   - Ao registrar promoção → atualizar/criar receita recorrente
   - Condição: toggle ativo em Configurações

7.2. Integração Carreira ↔ Mente (RN-CAR-16)
   - Trilha concluída no Mente → skill sobe 1 nível
   - Condição: `linked_track_id` e toggle ativo

7.3. Integração Carreira → Futuro (RN-CAR-17)
   - Roadmap step vinculado a meta do Futuro → atualiza progresso

7.4. Componentes Jornada (classe `.jornada-only`):
   - XP Bar Profissional (RN-CAR-20)
   - Coach Carreira com insights
   - Simulador de Promoção (RN-CAR-22)
   - Radar Chart de habilidades
   - Celebração de Promoção (tela 09)
   - Narrativa "Jornada do Herói" no Roadmap

7.5. Life Sync Score — Carreira (15% peso)
   - Fórmula: (roadmap×0.4 + skills_dominadas×0.3 + perfil_completude×0.3) × 100

### Validação Fase 7:
- [ ] RN-CAR-15: Promoção atualiza Finanças
- [ ] RN-CAR-16: Trilha concluída incrementa skill
- [ ] RN-CAR-17: Roadmap atualiza meta no Futuro
- [ ] RN-CAR-20: XP calculado corretamente por ação
- [ ] RN-CAR-22: Simulador usa dados do roadmap
- [ ] Jornada só aparece para PRO
- [ ] Componentes Jornada não alteram layout (apenas visibilidade)

---

## FASE 8 — Testes E2E Playwright

**Objetivo:** 50-60 testes automatizados cobrindo todos os fluxos.

### Grupos de Testes:

**Grupo 1 — Navegação (5 testes)**
- Acessar `/carreira` redireciona para Dashboard
- Navegar entre 5 tabs sem reload
- Tab ativa mostra underline `#f43f5e`
- Telas L2 têm header simplificado
- Botão voltar funciona

**Grupo 2 — Dashboard (6 testes)**
- Hero card mostra cargo atual
- KPIs calculam corretamente
- Milestone mostra progresso correto
- Insight IA renderiza (regra aplicada)
- Quick actions navegam corretamente
- Empty state quando sem dados

**Grupo 3 — CRUD Habilidades (12 testes)**
- Criar habilidade com campos obrigatórios
- Validar nome único (RN-CAR-18)
- Validar limite FREE de 10 (RN-CAR-01)
- Editar nível de proficiência
- Cores por nível (RN-CAR-02)
- Vincular trilha do Mente
- Excluir habilidade com confirmação
- Filtros por categoria funcionam
- Barra de proficiência renderiza proporcionalmente
- Skill dominada (≥4) impacta roadmap (RN-CAR-03)
- KPIs atualizam após CRUD
- Card Mente mostra skills vinculadas

**Grupo 4 — Perfil e Posições (8 testes)**
- Perfil mostra dados corretos
- Experiência lista posições ordenadas
- Registrar promoção encerra posição anterior (RN-CAR-07)
- Salário obrigatório (RN-CAR-08)
- Aumento % calculado (RN-CAR-09)
- Formação com status correto
- Links abrem em nova aba
- Editar perfil salva alterações

**Grupo 5 — Roadmap (8 testes)**
- Timeline renderiza steps em ordem
- Step atual com glow visual
- Progresso recalcula ao dominar skill (RN-CAR-04)
- Step concluído mostra ✓ verde
- Adicionar step funciona
- Vincular skills a step
- Status unique para 'current' (RN-CAR-05)
- Skills tags com cores corretas

**Grupo 6 — Histórico Salarial (6 testes)**
- Gráfico renderiza com dados
- Lista promoções cronológica
- Crescimento total correto (RN-CAR-10)
- Métricas calculam corretamente
- Registrar promoção funciona
- Comparação salário anterior vs novo

**Grupo 7 — Integrações (5 testes)**
- Promoção atualiza Finanças (RN-CAR-15)
- Trilha concluída incrementa skill (RN-CAR-16)
- Roadmap step vinculado ao Futuro (RN-CAR-17)
- Toggle de integração respeita configuração
- Badge "Auto — 💼 Carreira" aparece em Finanças

**Grupo 8 — Responsividade (4 testes)**
- Layout funciona em 375px
- Tabs scrolláveis em mobile
- Cards empilham em tela pequena
- Touch targets ≥ 48×48px

---

## VALIDAÇÃO VISUAL

Após cada fase, comparar o resultado com o protótipo (`proto-mobile-carreira-v3.html`):
- [ ] Cor `#f43f5e` em todos os elementos do módulo
- [ ] Tabs com UNDERLINE (não pills)
- [ ] Tipografia: Syne para títulos, DM Sans para corpo, DM Mono para números
- [ ] Cards com border-radius 16px e border `var(--border)`
- [ ] KPIs em grid 2×2 com border-radius 10px
- [ ] Barras de skill com cores corretas por nível
- [ ] Timeline vertical com dots e linhas

---

## 10 REGRAS ABSOLUTAS

1. **Cor `#f43f5e`** — Esta é a cor oficial do módulo. NÃO usar `#ec4899`.
2. **Underline tabs** — Navegação usa underline 3px, NÃO pills com background.
3. **Mobile-first** — Todo componente funciona em 375px antes de adaptar para desktop.
4. **Modo Jornada = `.jornada-only`** — Componentes Jornada controlados por classe CSS. NÃO alteram layouts.
5. **Testes passam antes de avançar** — Cada fase tem checklist. Só avança se todos passam.
6. **RLS obrigatório** — Todas as tabelas com Row Level Security. `user_id = auth.uid()`.
7. **Posição atual única** — RN-CAR-06: apenas 1 posição com `is_current = true`.
8. **Skills com limite FREE** — RN-CAR-01: máximo 10 skills para FREE.
9. **Integrações opt-in** — Todas condicionadas a toggle em Configurações.
10. **Sem IA generativa no MVP** — Insights são regras de negócio, não LLM.

---

## ORDEM DE EXECUÇÃO

```
Fase 1 (Migration)
    │
    ▼
Fase 2 (Rotas/Nav) ──────────────────┐
    │                                  │
    ▼                                  │
Fase 3 (Dashboard) ← depende de 1+2  │
    │                                  │
    ├── Fase 4 (Perfil/Posições)      │
    │                                  │
    ├── Fase 5 (Roadmap/Skills)       │
    │                                  │
    ├── Fase 6 (Histórico/Promoção)   │
    │                                  │
    ▼                                  │
Fase 7 (Integrações + Jornada) ← depende de 3-6
    │
    ▼
Fase 8 (Testes Playwright)
```

---

## CHECKLIST DE CONCLUSÃO

- [ ] Migration aplicada com sucesso
- [ ] 7 tabelas criadas com RLS
- [ ] 5 telas L1 implementadas
- [ ] 4 telas L2 implementadas
- [ ] CRUD completo de Skills (criar, editar, excluir)
- [ ] CRUD completo de Posições (criar via promoção, editar, excluir)
- [ ] CRUD de Roadmap Steps
- [ ] Roadmap com progresso calculado
- [ ] Gráfico de evolução salarial
- [ ] Integração Carreira → Finanças funcionando
- [ ] Integração Carreira ↔ Mente funcionando
- [ ] Integração Carreira → Futuro funcionando
- [ ] Modo Jornada com XP, Coach, Simulador, Radar
- [ ] Life Sync Score calculando (15% peso)
- [ ] 50+ testes Playwright passando
- [ ] Visual 100% alinhado com protótipo
- [ ] Cor `#f43f5e` consistente em todos os componentes
- [ ] Mobile-first validado em 375px

---

*Documento criado em: Março 2026*
*Versão: 1.0*
*Executar com: Claude Code + Supabase MCP + Vercel MCP*
