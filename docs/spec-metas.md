# Spec: Módulo Metas — Fase 3

> Documento de referência para desenvolvimento, QA e futuras manutenções.

---

## 1. Visão Geral

O módulo **Metas** permite ao usuário criar, acompanhar e concluir objetivos financeiros e de hábitos. É o terceiro módulo do SyncLife MVP V2, construído sobre a base da Fase 2 (Finanças).

---

## 2. Modelo de Dados

### 2.1 Tabela `goals`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | Identificador único |
| `user_id` | uuid FK → auth.users | Dono da meta |
| `name` | text NOT NULL | Nome da meta |
| `description` | text | Descrição opcional |
| `icon` | text | Emoji do ícone |
| `category` | text | viagem, reserva, moradia, veiculo, educacao, saude, tecnologia, casamento, fitness, outros |
| `goal_type` | text | `monetary` \| `habit` |
| `target_amount` | numeric(12,2) | Valor-alvo (0 para hábitos) |
| `current_amount` | numeric(12,2) | Valor acumulado atual |
| `monthly_contribution` | numeric(12,2) | Aporte mensal planejado |
| `target_date` | date | Prazo (opcional) |
| `start_date` | date | Data de início |
| `status` | text | `active` \| `paused` \| `completed` \| `archived` |
| `completed_at` | timestamptz | Preenchido ao completar |
| `notes` | text | Observações livres |
| `created_at` | timestamptz | Criação |
| `updated_at` | timestamptz | Última atualização (trigger auto) |

### 2.2 Tabela `goal_contributions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | |
| `goal_id` | uuid FK → goals | Meta relacionada |
| `user_id` | uuid FK → auth.users | |
| `amount` | numeric(12,2) | Valor do aporte |
| `date` | date | Data do aporte |
| `notes` | text | Observação opcional |
| `created_at` | timestamptz | |

### 2.3 Tabela `goal_milestones`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | |
| `goal_id` | uuid FK → goals | Meta relacionada |
| `user_id` | uuid FK → auth.users | |
| `name` | text | Nome do marco |
| `target_pct` | integer | 25, 50, 75 ou 100 |
| `reached_at` | timestamptz | NULL até ser alcançado |
| `created_at` | timestamptz | |

---

## 3. Regras de Negócio

### 3.1 Tipos de Meta

- **Monetária** (`monetary`): tem `target_amount`, aportes financeiros, projeção de conclusão calculada
- **Hábito** (`habit`): meta de frequência — sem valor financeiro (MVP: apenas monetária implementada)

### 3.2 Ciclo de Status

```
active ──► paused   (usuário pausa manualmente)
active ──► completed (current_amount >= target_amount, automático no aporte)
active ──► archived  (usuário arquiva manualmente)
paused ──► active   (usuário reativa)
paused ──► archived
```

### 3.3 Progresso e Cor do Anel

```ts
pct = Math.min(100, Math.round((current_amount / target_amount) * 100))

// Cor do RingProgress:
timePct = (hoje - start_date) / (target_date - start_date) * 100

if pct >= 100          → '#10b981' (verde, meta batida)
if timePct > 99        → '#f43f5e' (vermelho, prazo ultrapassado)
if timePct > 85 && pct < timePct → '#f43f5e' (vermelho, em risco)
if timePct > 70 && pct < timePct → '#f59e0b' (amarelo, atenção)
else                   → '#10b981' + gradiente (verde, no ritmo)
```

Metas sem `target_date` → sempre verde/gradiente.

### 3.4 Milestones Automáticos

- Criados automaticamente ao criar a meta: 25%, 50%, 75%, 100%
- `reached_at` é preenchido automaticamente quando `addContribution` detecta que `current_amount` cruzou o threshold
- Milestones são exibidos em linha vertical (`MilestoneTimeline`) com estado: done / current / future

### 3.5 Aportes

- Cada aporte registrado incrementa `current_amount` na goal
- Histórico preservado em `goal_contributions`
- Se `current_amount >= target_amount` após aporte → status muda para `completed` + `completed_at` = agora
- Milestones cruzados são marcados automaticamente

### 3.6 Projeção de Conclusão

```
meses_restantes = ceil((target_amount - current_amount) / monthly_contribution)
data_conclusao  = hoje + meses_restantes meses
```

Exibida nos cards e no simulador. Não exibida se `monthly_contribution <= 0`.

### 3.7 Simulador de Aportes — 4 Cenários

| # | Cenário | Cor | Aporte |
|---|---------|-----|--------|
| 1 | Aporte selecionado (slider) | Verde `#10b981` | controlado pelo usuário |
| 2 | Ritmo atual | Amarelo `#f59e0b` | `monthly_contribution` da meta |
| 3 | Para cumprir o prazo | Azul `#0055ff` | `ceil((target - current) / meses_até_prazo)` |
| 4 | Sem novos aportes | Vermelho `#f43f5e` | 0 — exibe "Não concluirá" |

---

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|------------|---------|-----------------|
| `MetaCard` | `components/metas/MetaCard.tsx` | Card de listagem com RingProgress, deadline, projeção, tip Jornada e botão de aporte rápido |
| `MetaModal` | `components/metas/MetaModal.tsx` | Wizard 4 passos para criar/editar meta |
| `SimuladorAportes` | `components/metas/SimuladorAportes.tsx` | Seletor de meta + slider + 4 cenários de projeção |
| `MilestoneTimeline` | `components/metas/MilestoneTimeline.tsx` | Linha vertical com dots done/current/future |
| `AddContributionModal` | `components/metas/AddContributionModal.tsx` | Dialog rápido para registrar aporte com sugestão do aporte mensal |
| `MetaDetailHero` | `components/metas/MetaDetailHero.tsx` | Hero da tela de detalhe: anel grande, stats grid, prazo, projeção, frase Jornada |

---

## 5. Hook

### `useMetas({ status? })`

```ts
{
  goals: Goal[]
  kpis: MetasKpis          // total, active, completed, paused, totalSaved, totalTarget, overallProgress
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: GoalFormData) => Promise<Goal>
  update: (id, data) => Promise<Goal>
  remove: (id) => Promise<void>
  addContribution: (goalId, amount, date, notes?) => Promise<void>
}
```

### `useMetaDetail(id)`

```ts
{
  goal: Goal | null
  contributions: GoalContribution[]
  milestones: GoalMilestone[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}
```

---

## 6. Telas

### 6.1 `/metas` — Lista de Metas

**Anatomia:**
```
① Topbar: título + filtros (Todas/Ativas/Concluídas/Pausadas) + botão "Nova Meta"
② KPI Strip: Total de metas | Ativas | Concluídas | Total guardado
③ JornadaInsight: resumo do progresso global
④ Grid principal (2 colunas) + Sidebar (340px):
   - Grid: MetaCards com link para detalhe + ações inline (editar/excluir)
   - Sidebar: SimuladorAportes + (Jornada: Conquistas / Foco: Resumo Global)
```

**Estado vazio:** ilustração + CTA "Criar Primeira Meta"

### 6.2 `/metas/nova` — Nova Meta (Wizard)

Abre `MetaModal` em modo `create` diretamente. Ao fechar/salvar, redireciona para `/metas`.

**4 passos do wizard:**
1. **Identidade** — Nome, descrição, ícone (grid de emojis), categoria
2. **Alvo** — Valor da meta, valor já possuído, data início, prazo
3. **Estratégia** — Aporte mensal + preview de projeção + observações
4. **Revisão** — Resumo completo antes de confirmar

### 6.3 `/metas/[id]` — Detalhe da Meta

**Anatomia:**
```
Breadcrumb (← Voltar) + Ações (Aporte | Editar | ··· dropdown)
③ JornadaInsight contextual
④ Grid principal (1fr + 320px):
   Coluna principal:
     - MetaDetailHero (anel + stats + prazo + projeção + frase Jornada)
     - Histórico de aportes (lista cronológica)
   Coluna lateral:
     - MilestoneTimeline (marcos 25/50/75/100%)
     - Informações (categoria, tipo, início, notas)
```

**Dropdown de ações:** Pausar / Reativar / Arquivar / Excluir

---

## 7. Diferenças Foco vs Jornada

| Elemento | Foco | Jornada |
|----------|------|---------|
| Título `/metas` | `text-[var(--sl-t1)]` | `text-sl-grad` |
| JornadaInsight | oculto | visível |
| MetaCard tip | oculto | caixa colorida (ok/warn/celebrar) |
| Sidebar bottom | Resumo Global (números) | Conquistas concluídas |
| MetaDetailHero | sem frase | frase motivacional |
| Título hero `/metas/[id]` | `text-[var(--sl-t1)]` | `text-sl-grad` |

---

## 8. Migration

Arquivo: `web/supabase/migrations/003_fase3_metas.sql`

**Como rodar:**
1. Supabase Dashboard → SQL Editor
2. Colar o conteúdo do arquivo
3. Run (F5)

Inclui: criação das 3 tabelas, índices, trigger `updated_at`, RLS com políticas por `user_id`.

---

## 9. Seed de Homologação

Arquivo: `web/supabase/seeds/001_seed_homolog.sql` (bloco de metas adicionado na Fase 3)

**Dados incluídos:**
| Meta | Status | Progresso | Aportes |
|------|--------|-----------|---------|
| ✈️ Viagem Europa | active | 52% | 6 aportes |
| 🛡️ Reserva de Emergência | active | 62% | 11 aportes |
| 📚 Curso de Dados | completed | 100% | 2 aportes |
| 🚗 Carro Novo | active | 15% | 3 aportes |

Milestones automáticos incluídos com `reached_at` preenchido conforme progresso.

---

## 10. Checklist de QA

- [ ] Criar meta via wizard (4 passos)
- [ ] Milestones criados automaticamente (25/50/75/100)
- [ ] Registrar aporte → `current_amount` atualizado
- [ ] Aporte que bate 100% → status muda para `completed`
- [ ] Milestone marcado automaticamente ao cruzar threshold
- [ ] Simulador: 4 cenários calculados corretamente
- [ ] Filtros de status funcionando na lista
- [ ] Pausar / Reativar / Arquivar / Excluir
- [ ] Detalhe: histórico de aportes + milestones
- [ ] Foco vs Jornada: tip do card, insight, títulos, sidebar
- [ ] Light/Dark: tokens de cor corretos
- [ ] Responsivo: colapsa para 1 coluna em mobile
- [ ] TypeScript: `npx tsc --noEmit` sem erros
