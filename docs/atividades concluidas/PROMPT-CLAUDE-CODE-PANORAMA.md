# 🌐 Prompt de Implementação — Módulo Panorama

> **Para uso no Claude Code (Next.js + Supabase + Vercel)**  
> **Data:** Março 2026  
> **Módulo:** Panorama — Visão Geral e Gamificação  
> **Cor:** `#6366f1` (Indigo) — **NOVA COR** (anteriormente #10b981)  
> **Ícone Lucide:** `Globe`

---

## INSTRUÇÃO INICIAL — LEIA ANTES DE CODIFICAR

Antes de escrever qualquer código, leia OBRIGATORIAMENTE:

1. **`SPEC-FUNCIONAL-PANORAMA.md`** — 18 seções, 20 regras de negócio, 33 badges catalogadas
2. **`proto-mobile-panorama-v3.html`** — 7 telas de referência visual com cor Indigo
3. **`CLAUDE.md`** — Regras globais do projeto

**AÇÃO CRÍTICA #1:** Atualizar `web/src/lib/modules.ts` — mudar a cor do Panorama de `#10b981` para `#6366f1`. Isso afeta Module Bar, Sidebar, glow, e todos os componentes do módulo.

---

## CONTEXTO DO MÓDULO

### Rotas

| Rota | Componente | Tela |
|------|-----------|------|
| `/dashboard` | `DashboardPage` | 01 — Dashboard |
| `/conquistas` | `ConquistasPage` | 02 — Conquistas |
| `/conquistas/ranking` | `RankingPage` | 03 — Ranking |

### Tabelas Supabase

| Tabela | Entidade | RLS |
|--------|---------|-----|
| `badges` | Catálogo de 33 badges (seed) | public read |
| `user_badges` | Badges desbloqueadas por user | user_id |
| `life_sync_scores` | Histórico diário do Life Score | user_id |
| `user_streaks` | Streak de uso do usuário | user_id |
| `weekly_reviews` | Reviews semanais completados | user_id |

### Este módulo RECEBE dados de TODOS os outros

Panorama não tem entidades próprias editáveis pelo usuário (exceto review semanal). Ele agrega dados de: Finanças, Futuro, Corpo, Mente, Patrimônio, Carreira, Tempo, Experiências.

---

## FASES DE IMPLEMENTAÇÃO

### Fase 1: Cor + Schema + Seeds (2-3h)

**Objetivo:** Atualizar cor do módulo, criar tabelas e seed de 33 badges.

**Atividades:**
- 1.1 Atualizar `modules.ts`: panorama.color = `#6366f1`, glowColor = `rgba(99,102,241,0.14)`
- 1.2 Atualizar CSS tokens: `--pan: #6366f1; --pan-g: rgba(99,102,241,0.14);`
- 1.3 Criar migration: `badges`, `user_badges`, `life_sync_scores`, `user_streaks`, `weekly_reviews`
- 1.4 Seed 33 badges no banco (conforme catálogo da spec seção 6.3)
- 1.5 RLS policies: `badges` = public read, demais = user_id filter
- 1.6 Criar hook `use-panorama.ts`: `useBadges()`, `useUserBadges()`, `useLifeScore()`, `useStreak()`, `useRanking()`

**Validação:**
- [ ] Cor `#6366f1` aparece na Module Bar e Sidebar
- [ ] 33 badges inseridas no banco
- [ ] Hooks retornam dados corretamente

### Fase 2: Dashboard — Life Score + KPIs (4-5h)

**Objetivo:** Implementar a tela principal com Life Score, alertas e ações rápidas.

**Referência visual:** Protótipo tela 01 (Jornada) e tela 06 (Foco)

**Atividades:**
- 2.1 Sub-nav underline com 3 tabs (Dashboard, Conquistas, Ranking)
- 2.2 [Jornada] Saudação + streak badge
- 2.3 [Jornada] Life Score ring SVG animado com gradiente indigo→blue
- 2.4 [Jornada] Dimensões do score (grid de módulos ativos com valor)
- 2.5 [Jornada] Insight IA cross-módulo (card com regras de negócio)
- 2.6 Alertas de orçamento (dados de Finanças, % ≥ 75%)
- 2.7 Heatmap de gastos do mês (grid de dias coloridos)
- 2.8 Ações rápidas (grid 2×2: Transação, Evento, Revisão, Foto Recibo)
- 2.9 Modo Foco: apenas KPIs financeiros + alertas + heatmap (sem gamificação)
- 2.10 Empty state para primeiro uso (tela 07)

**Validação:**
- [ ] Life Score calcula corretamente (fórmula seção 17) (RN-PAN-01)
- [ ] Ring anima de 0 até score em 1.2s (RN-PAN-01)
- [ ] Saudação muda por período (RN-PAN-14)
- [ ] Streak conta dias consecutivos (RN-PAN-08)
- [ ] Modo Foco esconde toda gamificação (RN-PAN-18)
- [ ] Alertas mostram orçamentos ≥ 75% (RN-PAN-16)

### Fase 3: Life Score Engine (3-4h)

**Objetivo:** Implementar o motor de cálculo do Life Sync Score com histórico.

**Atividades:**
- 3.1 Função `calculateLifeScore(userId)` que consulta dados de todos os módulos
- 3.2 Score por módulo (8 fórmulas individuais conforme seção 17.2)
- 3.3 Média ponderada com redistribuição de módulos inativos
- 3.4 Salvar score diário em `life_sync_scores` (upsert por data)
- 3.5 Delta vs dia anterior e vs 7 dias atrás
- 3.6 Cron/trigger para recalcular diariamente (ou on-demand)

**Validação:**
- [ ] Score calcula com dados reais de cada módulo (RN-PAN-01)
- [ ] Módulos inativos são excluídos e pesos redistribuídos (RN-PAN-01)
- [ ] Histórico salva 1 registro por dia por usuário (RN-PAN-02)
- [ ] Delta calcula corretamente

### Fase 4: Conquistas — Catálogo + Desbloqueio (4-5h)

**Objetivo:** Implementar tela de Conquistas com catálogo, filtros e desbloqueio automático.

**Referência visual:** Protótipo tela 02 e tela 04

**Atividades:**
- 4.1 Tela `/conquistas` com sub-nav (tab "Conquistas" ativa)
- 4.2 Header com contagem (N de 33)
- 4.3 Card-resumo (N/33, top X%, barra de progresso)
- 4.4 [Jornada] Card de motivação IA
- 4.5 Filtros por categoria (pills)
- 4.6 Grid 2×2 de badges desbloqueadas (com raridade, ícone, data)
- 4.7 Grid 2×2 de badges bloqueadas (lock, progresso parcial, dica)
- 4.8 Modal de detalhe da badge (tela 04)
- 4.9 Engine de desbloqueio automático: `checkBadgeUnlock(userId, action)`
- 4.10 Verificação após cada ação em cada módulo
- 4.11 Toast de celebração ao desbloquear nova badge (Jornada)

**Validação:**
- [ ] 33 badges renderizam no catálogo (RN-PAN-19)
- [ ] Desbloqueio automático ao atender critério (RN-PAN-03)
- [ ] Badge não pode ser perdida após desbloqueio (RN-PAN-04)
- [ ] Pontos corretos por raridade (RN-PAN-05)
- [ ] Filtros funcionam sem recarregar
- [ ] Gate PRO: Conquistas é Jornada-only (RN-PAN-18)

### Fase 5: Ranking — Leaderboard (3-4h)

**Objetivo:** Implementar leaderboard com posição, evolução e breakdown.

**Referência visual:** Protótipo tela 03

**Atividades:**
- 5.1 Tela `/conquistas/ranking` com sub-nav (tab "Ranking" ativa)
- 5.2 Filtros temporais (Geral, Este mês, Esta semana)
- 5.3 Hero card: posição, avatar, score, top X%, streak
- 5.4 Score breakdown por categoria (4 barras)
- 5.5 Gráfico de evolução (Recharts AreaChart)
- 5.6 Leaderboard: lista de posições com top 3 medals
- 5.7 Card fixo do usuário se fora do top 20
- 5.8 Dados anonimizados (apenas iniciais) (RN-PAN-07)
- 5.9 Próximos marcos com barras de progresso
- 5.10 Gate PRO: Ranking é Jornada-only (RN-PAN-18)

**Validação:**
- [ ] Score = soma dos pontos de badges (RN-PAN-05)
- [ ] Ranking mostra apenas iniciais (RN-PAN-07)
- [ ] Atualização diária, não real-time (RN-PAN-06)
- [ ] Card do usuário destacado visualmente
- [ ] Filtros temporais funcionam

### Fase 6: Review Semanal (2-3h)

**Objetivo:** Implementar flow de review semanal tipo stories/cards.

**Referência visual:** Protótipo tela 05

**Atividades:**
- 6.1 Modal/fullscreen com slides (7 passos: Capa, Finanças, Metas, Corpo, Score, Badges, CTA)
- 6.2 Dados da semana puxados de cada módulo
- 6.3 Navegação por swipe ou botões
- 6.4 Dots de progresso (step indicator)
- 6.5 +50 XP ao completar (Jornada) (RN-PAN-20)
- 6.6 [PRO] Compartilhar como imagem
- 6.7 Disponibilidade: domingo 20h a quarta 23:59 (RN-PAN-12)
- 6.8 Registro em `weekly_reviews` ao completar

**Validação:**
- [ ] Review só disponível no período correto (RN-PAN-12)
- [ ] 7 slides com dados reais da semana
- [ ] +50 XP ao completar (RN-PAN-20)
- [ ] Compartilhar é PRO-only (RN-PAN-13)

### Fase 7: Streak Engine + Integração Módulos (2-3h)

**Objetivo:** Implementar sistema de streak e hooks de integração com todos os módulos.

**Atividades:**
- 7.1 Função `updateStreak(userId)` chamada após qualquer ação registrada
- 7.2 Verificação: se `last_activity_date` = ontem → streak++, se < ontem → streak = 1
- 7.3 Atualizar `longest_streak` se `current_streak > longest_streak`
- 7.4 Hook nos módulos: após INSERT em transactions, activities, weight_entries, focus_sessions, etc. → `updateStreak()` + `checkBadgeUnlock()`
- 7.5 Badge triggers: 7d streak, 30d streak, 90d streak, 365d streak

**Validação:**
- [ ] Streak incrementa ao usar qualquer módulo (RN-PAN-08)
- [ ] Streak reseta se dia sem ação (RN-PAN-08)
- [ ] Timezone do usuário usado no cálculo (RN-PAN-09)
- [ ] Badge "7 Dias" desbloqueada ao atingir streak 7

### Fase 8: Testes E2E Playwright (4-5h)

#### Grupo 1 — Navegação (5 testes)
```
test('navega para /dashboard e mostra sub-nav com 3 tabs')
test('tab ativa mostra underline #6366f1')
test('tab Conquistas e Ranking têm gate PRO no Modo Foco')
test('cor #6366f1 aparece na Module Bar')
test('ações rápidas navegam para módulos corretos')
```

#### Grupo 2 — Life Score (8 testes)
```
test('Life Score ring renderiza com animação')
test('score calcula média ponderada de módulos ativos')
test('módulos inativos são excluídos do cálculo')
test('delta mostra variação vs semana anterior')
test('dimensões mostram score por módulo')
test('score 0-100 range, nunca negativo')
test('[Foco] Life Score não aparece')
test('histórico diário salva em life_sync_scores')
```

#### Grupo 3 — Dashboard (7 testes)
```
test('saudação muda por período (manhã/tarde/noite)')
test('streak badge mostra dias consecutivos')
test('alertas de orçamento mostram ≥75%')
test('heatmap renderiza dias do mês com cores')
test('insight IA aparece apenas no Jornada')
test('empty state para primeiro uso')
test('[Foco] dashboard mostra apenas KPIs financeiros')
```

#### Grupo 4 — Conquistas (10 testes)
```
test('33 badges no catálogo')
test('badges desbloqueadas com data e pontos')
test('badges bloqueadas com lock e progresso')
test('filtros por categoria funcionam')
test('detalhe da badge abre no tap')
test('badge desbloqueia automaticamente ao atingir critério')
test('badge não pode ser perdida')
test('pontos corretos: 10/25/50/100')
test('toast de celebração ao desbloquear')
test('[Foco] Conquistas mostra gate PRO')
```

#### Grupo 5 — Ranking (7 testes)
```
test('leaderboard mostra posições 1-20')
test('top 3 com medals emoji')
test('card do usuário destacado')
test('score = soma pontos das badges')
test('dados anonimizados (só iniciais)')
test('filtros temporais mudam lista')
test('[Foco] Ranking mostra gate PRO')
```

#### Grupo 6 — Review Semanal (5 testes)
```
test('review disponível domingo 20h a quarta 23:59')
test('7 slides com dados reais')
test('+50 XP ao completar')
test('compartilhar é PRO-only')
test('registro salvo em weekly_reviews')
```

#### Grupo 7 — Streak (4 testes)
```
test('streak incrementa após ação em qualquer módulo')
test('streak reseta se dia sem ação')
test('longest_streak atualiza')
test('badge de streak desbloqueia nos marcos')
```

#### Grupo 8 — Responsividade (4 testes)
```
test('375px: todo conteúdo visível')
test('375px: sub-nav não tem overflow')
test('1024px: sidebar + conteúdo coexistem')
test('dark/light themes renderizam')
```

**Total: 50 testes**

---

## 10 REGRAS ABSOLUTAS

1. **Cor:** `#6366f1` — NÃO é mais `#10b981`. Atualizar modules.ts PRIMEIRO.
2. **Gradiente padrão:** `linear-gradient(135deg, #6366f1, #0055ff)` para scores e hero cards
3. **Navegação:** Underline tabs, 3 tabs (Dashboard, Conquistas, Ranking)
4. **Jornada-only:** Conquistas e Ranking são PRO/Jornada. Dashboard funciona em ambos os modos
5. **Badges imutáveis:** Uma vez desbloqueada, nunca pode ser removida
6. **Ranking anonimizado:** Apenas iniciais + avatar. NUNCA mostrar email ou nome completo
7. **Score range:** 0-100, nunca negativo, nunca > 100
8. **Streak timezone:** Usar fuso do usuário, não UTC
9. **Mobile-first:** 375px antes de desktop
10. **Textos sobre fundo #6366f1:** Sempre brancos (#fff), nunca pretos

---

## ORDEM DE EXECUÇÃO

```
Fase 1 (Cor + Schema + Seeds) ← PRIMEIRO
    ├── Fase 2 (Dashboard)
    ├── Fase 3 (Life Score Engine)
    │       └── depende de dados de TODOS os módulos
    ├── Fase 4 (Conquistas)
    ├── Fase 5 (Ranking) ← depende de Fase 4
    ├── Fase 6 (Review Semanal)
    └── Fase 7 (Streak Engine)
                │
                └── Fase 8 (Testes) [após tudo]
```

---

## CHECKLIST DE CONCLUSÃO

- [ ] Cor `#6366f1` em modules.ts e todos os componentes
- [ ] 3 rotas respondem (`/dashboard`, `/conquistas`, `/conquistas/ranking`)
- [ ] Sub-nav underline funciona com cor indigo
- [ ] Life Score calcula com dados reais de todos os módulos ativos
- [ ] 33 badges no catálogo, desbloqueio automático funcionando
- [ ] Ranking com leaderboard, anonimização e card do usuário
- [ ] Review semanal com 7 slides e dados reais
- [ ] Streak engine integrada com todos os módulos
- [ ] Modo Foco: Dashboard limpo. Conquistas/Ranking: gate PRO
- [ ] 50 testes Playwright passando
- [ ] Deploy no Vercel com zero erros

---

*Prompt criado em: 07/03/2026*  
*Versão: 1.0*  
*Total estimado: 24-32 horas de desenvolvimento*
