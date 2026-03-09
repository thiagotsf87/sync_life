# 🏃 Prompt de Implementação — Módulo Corpo

> **Para uso no Claude Code (Next.js + Supabase + Vercel)**  
> **Data:** Março 2026  
> **Módulo:** Corpo — Saúde e Atividades  
> **Cor:** `#f97316` (Orange)  
> **Ícone Lucide:** `Activity`

---

## INSTRUÇÃO INICIAL — LEIA ANTES DE CODIFICAR

Antes de escrever qualquer código, leia OBRIGATORIAMENTE estes 3 documentos:

1. **`SPEC-FUNCIONAL-CORPO.md`** — Especificação funcional completa (19 seções, 25 regras de negócio)
2. **`proto-mobile-corpo-v3.html`** — Protótipo visual de referência (14 telas)
3. **`CLAUDE.md`** — Regras globais do projeto SyncLife

Após ler, confirme que entendeu:
- A cor do módulo é `#f97316` (nunca confundir com outro módulo)
- A navegação usa **underline tabs** (não pills)
- O padrão é **mobile-first** (375px antes de desktop)
- O Modo Jornada usa classe `.jornada-only` e nunca altera layouts

---

## CONTEXTO DO MÓDULO

### Rotas

| Rota | Componente | Tela |
|------|-----------|------|
| `/corpo` | `CorpoPage` (Dashboard) | 01 |
| `/corpo/atividades` | `AtividadesPage` | 02 |
| `/corpo/peso` | `PesoPage` | 03 |
| `/corpo/cardapio` | `CardapioPage` | 04 |
| `/corpo/saude` | `SaudePage` | 05 |
| `/corpo/coach` | `CoachPage` | 06 |

### Tabelas Supabase

| Tabela | Entidade | RLS |
|--------|---------|-----|
| `health_profiles` | Perfil de saúde (1:1 com user) | user_id |
| `weight_entries` | Registros de peso/medidas | user_id |
| `activities` | Atividades físicas | user_id |
| `medical_appointments` | Consultas médicas | user_id |
| `meals` | Refeições diárias | user_id |
| `daily_water_intake` | Hidratação diária | user_id |
| `daily_steps` | Passos diários | user_id |

### Integrações (todas opt-in)

| ID Integração | Módulo destino | O que faz |
|--------------|---------------|-----------|
| `crp_consulta_tempo` | Tempo (Agenda) | Consulta agendada → evento na Agenda |
| `crp_consulta_financas` | Finanças | Custo de consulta → despesa na categoria "Saúde" |
| `crp_peso_futuro` | Futuro | Peso registrado → atualiza meta vinculada |
| `crp_atividade_futuro` | Futuro | Atividade → atualiza meta de frequência |

---

## FASES DE IMPLEMENTAÇÃO

### Fase 1: Schema de Dados e Hooks Base (3-4h)

**Objetivo:** Criar/atualizar tabelas no Supabase e implementar hooks de acesso a dados.

**Referência visual:** N/A (infraestrutura)  
**Referência funcional:** Spec seções 17 (Modelo de Dados), 14 (Regras de Negócio)

**Atividades:**
- 1.1 Criar migration SQL para tabelas: `health_profiles`, `weight_entries`, `activities`, `medical_appointments`, `meals`, `daily_water_intake`, `daily_steps`
- 1.2 Criar índices recomendados (conforme seção 17.2 da spec)
- 1.3 Configurar RLS policies (SELECT/INSERT/UPDATE/DELETE por user_id)
- 1.4 Atualizar hook `use-corpo.ts` — adicionar:
  - `useHealthProfile()` — CRUD do perfil de saúde
  - `useWeightEntries(period)` — lista com filtro de período
  - `useActivities(week)` — lista com filtro semanal + tipo
  - `useAppointments(status)` — lista com filtro de status
  - `useMeals(date)` — refeições de um dia
  - `useWaterIntake(date)` — hidratação de um dia
- 1.5 Implementar cálculos (já parcialmente existentes):
  - `calcBMR(weight, height, age, sex)` — Mifflin-St Jeor
  - `calcTDEE(bmr, activityLevel)` — BMR × fator
  - `calcIMC(weight, heightCm)` — peso/altura²
  - `calcCalories(met, weight, durationMin, intensity)` — MET × peso × duração × (intensity/3)

**Validação:**
- [ ] Todas as tabelas criadas com schema correto (RN-CRP-01 a RN-CRP-25)
- [ ] RLS ativo em todas as tabelas
- [ ] Hooks retornam dados mock corretamente
- [ ] Cálculos TMB/TDEE/IMC batem com valores de referência

---

### Fase 2: Dashboard (Tela 01) (3-4h)

**Objetivo:** Implementar a tela principal do módulo com KPIs, gráfico, hidratação e insight.

**Referência visual:** Protótipo tela 01 (Dashboard) e tela 13 (Empty State)  
**Referência funcional:** Spec seção 5

**Atividades:**
- 2.1 Implementar layout da página `/corpo` com sub-nav underline
- 2.2 KPI Grid 2×2: Peso/IMC, TMB/TDEE, Atividades/semana, Próxima consulta
- 2.3 Gráfico sparkline de peso (SVG ou Recharts LineChart)
- 2.4 Card de próxima consulta com countdown
- 2.5 Tracker de hidratação com botões rápidos (+250ml, +500ml)
- 2.6 [Jornada] Card de insight IA (regras de negócio, não IA generativa)
- 2.7 Empty state para Dashboard sem dados (tela 13 do protótipo)
- 2.8 Quick Actions (botões rápidos: +Peso, +Atividade)

**Validação:**
- [ ] KPIs calculam corretamente baseado em dados reais (RN-CRP-01, RN-CRP-02, RN-CRP-03)
- [ ] Gráfico renderiza com ≥ 2 pontos de peso
- [ ] Hidratação incrementa e persiste no banco (RN-CRP-09)
- [ ] Empty state aparece quando não há dados
- [ ] Insight IA só aparece no Modo Jornada

---

### Fase 3: Atividades Físicas (Tela 02 + CRUD) (4-5h)

**Objetivo:** Implementar lista de atividades, gráfico semanal e formulário de registro.

**Referência visual:** Protótipo telas 02 e 07  
**Referência funcional:** Spec seções 6, 11.1

**Atividades:**
- 3.1 Tela `/corpo/atividades` com sub-nav (tab "Atividades" ativa)
- 3.2 Resumo semanal: barra de progresso + total min/kcal
- 3.3 Gráfico de barras por dia da semana (7 barras, seg-dom)
- 3.4 Filtros por tipo de atividade (pills horizontais)
- 3.5 Lista de atividades recentes (cards com tipo, duração, kcal, intensidade)
- 3.6 Modal "Registrar Atividade" (tela 07):
  - Grid de tipos (10 opções com emoji)
  - Campos: descrição, duração, intensidade (1-5)
  - Preview de calorias calculadas em tempo real
  - Botão confirmar
- 3.7 Cálculo MET automático por tipo (RN-CRP-04)
- 3.8 Detalhe da atividade (tap em card → tela L2)
- 3.9 Exclusão de atividade (swipe ou botão)

**Validação:**
- [ ] Calorias calculam: MET × peso × duração × (intensidade/3) (RN-CRP-04)
- [ ] Meta semanal usa `health_profiles.weekly_activity_goal` (RN-CRP-05)
- [ ] Filtro por tipo funciona sem recarregar
- [ ] Registro persiste no banco e atualiza lista
- [ ] Se vinculada a meta no Futuro, progresso é atualizado (RN-CRP-22)

---

### Fase 4: Peso & Medidas (Tela 03 + CRUD) (3h)

**Objetivo:** Implementar tracking de peso com gráfico, medidas corporais e formulário.

**Referência visual:** Protótipo telas 03 e 08  
**Referência funcional:** Spec seções 7, 11.2

**Atividades:**
- 4.1 Tela `/corpo/peso` com sub-nav (tab "Peso" ativa)
- 4.2 Filtros de período (30d, 3m, 6m, 1a)
- 4.3 Gráfico de evolução do peso (Recharts LineChart com gradiente)
- 4.4 Linha tracejada da meta (de `health_profiles.target_weight`)
- 4.5 Grid de medidas corporais (cintura, quadril, gordura%, massa muscular)
- 4.6 CTA "Registrar medição" (gradiente laranja)
- 4.7 Histórico de medições (lista cronológica)
- 4.8 Modal "Registrar Peso" (tela 08): peso obrigatório + medidas opcionais
- 4.9 Regra: 1 registro por dia (RN-CRP-10) — se existir, atualiza

**Validação:**
- [ ] Gráfico filtra por período selecionado
- [ ] Apenas 1 registro por dia (upsert, não insert duplicado) (RN-CRP-10)
- [ ] IMC calcula automaticamente no preview
- [ ] Medidas são todas opcionais (RN-CRP-25)
- [ ] Se meta de peso no Futuro, progresso é atualizado (RN-CRP-22)

---

### Fase 5: Nutrição / Cardápio (Tela 04 + CRUD) (3-4h)

**Objetivo:** Implementar tracking nutricional simplificado com ring calórico e refeições.

**Referência visual:** Protótipo telas 04 e 10  
**Referência funcional:** Spec seções 8, 11.4

**Atividades:**
- 5.1 Tela `/corpo/cardapio` com sub-nav (tab "Cardápio" ativa)
- 5.2 Ring calórico SVG animado (meta vs consumido vs restante)
- 5.3 Barra de macronutrientes (3 cores: carbos, proteína, gordura)
- 5.4 Lista de 4 slots de refeição (café, almoço, lanche, jantar)
- 5.5 Slots não preenchidos com opacidade reduzida e "+" para adicionar
- 5.6 Modal "Registrar Refeição" (tela 10): descrição, calorias, macros opcionais
- 5.7 Preview de impacto: total do dia + restante após registrar
- 5.8 [PRO] Card de sugestão IA para próxima refeição
- 5.9 Lógica de sugestão por regras (catálogo de ~50 refeições pré-definidas)

**Validação:**
- [ ] Ring calórico atualiza ao registrar refeição
- [ ] Macros somam corretamente
- [ ] 4 slots por dia (RN-CRP-11)
- [ ] Sugestão IA só aparece para PRO (RN-CRP-12)
- [ ] Meta calórica = TDEE ajustado ao objetivo

---

### Fase 6: Saúde Preventiva (Tela 05 + CRUD) (4h)

**Objetivo:** Implementar gestão de consultas médicas com alertas e integrações.

**Referência visual:** Protótipo telas 05, 09 e 12  
**Referência funcional:** Spec seções 9, 11.3, 12.1, 12.2

**Atividades:**
- 6.1 Tela `/corpo/saude` com sub-nav (tab "Saúde" ativa)
- 6.2 Lista de próximas consultas (cards com countdown)
- 6.3 CTA "Agendar nova consulta" (card tracejado)
- 6.4 Histórico de consultas (cronológico)
- 6.5 Alertas de retorno (follow-up overdue e pending)
- 6.6 Modal "Agendar Consulta" (tela 09): especialidade, médico, data, custo, retorno
- 6.7 Toggles de integração no form (Agenda + Finanças)
- 6.8 Detalhe da consulta (tela 12): info, status, ações (realizar, remarcar, cancelar)
- 6.9 Integração Corpo → Tempo: criar evento na Agenda (RN-CRP-20)
- 6.10 Integração Corpo → Finanças: criar despesa (RN-CRP-21)
- 6.11 Lógica de follow-up automático (RN-CRP-07, RN-CRP-08)
- 6.12 Limite de 3 consultas agendadas para FREE (RN-CRP-06)

**Validação:**
- [ ] Consulta agendada cria evento na Agenda se toggle ativo (RN-CRP-20)
- [ ] Custo > 0 cria despesa em Finanças se toggle ativo (RN-CRP-21)
- [ ] Follow-up calcula data correta (data + months) (RN-CRP-07)
- [ ] Alerta overdue quando `follow_up_reminder_date < NOW()` (RN-CRP-08)
- [ ] Limite FREE de 3 consultas agendadas (RN-CRP-06)
- [ ] Cancelar consulta cancela evento mas mantém transação (RN-CRP-17)

---

### Fase 7: Coach IA + Perfil de Saúde + Integrações Futuro (3-4h)

**Objetivo:** Implementar tela Coach IA (PRO), perfil de saúde configurável, e integrações com Futuro.

**Referência visual:** Protótipo telas 06 e 11  
**Referência funcional:** Spec seções 10, 12.3, 12.4

**Atividades:**
- 7.1 Tela `/corpo/coach` com sub-nav (tab "Coach" ativa)
- 7.2 Gate PRO: FREE vê preview borrado + UpgradeModal (RN-CRP-13)
- 7.3 Insight principal do dia (regras de negócio)
- 7.4 Plano de ação semanal (3-5 ações baseadas em dados reais)
- 7.5 [Jornada] Desafio semanal com XP
- 7.6 Tela "Perfil de Saúde" (tela 11): configuração de sexo, idade, altura, peso meta, nível de atividade, metas
- 7.7 TMB/TDEE recalculados ao salvar perfil
- 7.8 Integração peso → Futuro (atualizar meta de peso) (RN-CRP-22)
- 7.9 Integração atividade → Futuro (atualizar meta de frequência) (RN-CRP-22)
- 7.10 Celebração ao atingir meta de peso (tela 14)

**Validação:**
- [ ] Coach IA é PRO-only com gate correto (RN-CRP-13)
- [ ] Insights gerados por regras de negócio (RN-MNT-20 como referência)
- [ ] Perfil de saúde salva e recalcula TMB/TDEE (RN-CRP-01, RN-CRP-02)
- [ ] Peso registrado atualiza meta no Futuro se vinculada (RN-CRP-22)
- [ ] Celebração exibe ao atingir target_weight

---

### Fase 8: Testes E2E Playwright (4-5h)

**Objetivo:** Implementar 50 testes Playwright cobrindo todos os fluxos.

**Referência:** Spec seção 14 (Regras), protótipos visuais

#### Grupo 1 — Navegação (6 testes)
```
test('navega para /corpo e mostra Dashboard')
test('tabs de sub-nav mudam entre 6 telas')
test('tab ativa mostra underline na cor #f97316')
test('botão + no header abre modal de registro')
test('botão ⚙️ abre Perfil de Saúde')
test('breadcrumb ← volta para tela anterior')
```

#### Grupo 2 — Dashboard (7 testes)
```
test('KPIs carregam dados corretos do perfil')
test('KPI peso mostra "—" quando não há registros')
test('gráfico sparkline renderiza com 2+ pontos')
test('hidratação incrementa ao clicar +250ml')
test('hidratação reseta à meia-noite')
test('próxima consulta mostra countdown correto')
test('[Jornada] insight IA aparece apenas em Jornada')
```

#### Grupo 3 — Atividades CRUD (10 testes)
```
test('registrar atividade com tipo e duração')
test('calorias calculam MET × peso × duração')
test('intensidade modifica cálculo de calorias')
test('resumo semanal conta atividades seg-dom')
test('barra semanal preenche dias com atividade')
test('filtro por tipo funciona')
test('detalhe da atividade exibe dados corretos')
test('excluir atividade com confirmação')
test('meta semanal usa weekly_activity_goal')
test('[Jornada] XP +15 por atividade registrada')
```

#### Grupo 4 — Peso & Medidas (7 testes)
```
test('registrar peso com IMC calculado automaticamente')
test('apenas 1 registro por dia — upsert')
test('gráfico filtra por período selecionado')
test('linha de meta aparece se target_weight existe')
test('medidas são opcionais no registro')
test('histórico ordena por data DESC')
test('classificação IMC com cores corretas')
```

#### Grupo 5 — Nutrição (6 testes)
```
test('ring calórico mostra meta vs consumido')
test('4 slots de refeição por dia')
test('registrar refeição atualiza ring e macros')
test('slot não preenchido mostra estado vazio')
test('[PRO] sugestão IA aparece com ≥1 refeição')
test('[FREE] limite de 3 sugestões/semana')
```

#### Grupo 6 — Consultas Médicas (8 testes)
```
test('agendar consulta cria registro')
test('countdown mostra dias corretos')
test('[integração] cria evento na Agenda se toggle ativo')
test('[integração] cria despesa em Finanças se custo > 0')
test('follow-up calcula data correta')
test('follow-up overdue muda status')
test('[FREE] limite 3 consultas agendadas')
test('cancelar consulta mantém transação financeira')
```

#### Grupo 7 — Coach IA + Perfil (4 testes)
```
test('coach IA é PRO-only com gate')
test('perfil salva e recalcula TMB/TDEE')
test('peso → Futuro atualiza meta vinculada')
test('celebração exibe ao atingir peso meta')
```

#### Grupo 8 — Responsividade (4 testes)
```
test('375px: todas as telas cabem sem overflow horizontal')
test('375px: sub-nav scroll horizontal funciona')
test('1024px: layout se adapta com sidebar')
test('temas dark/light renderizam cores corretas')
```

---

## 10 REGRAS ABSOLUTAS

1. **Cor:** `#f97316` — qualquer variação é bug. Glow: `rgba(249,115,22,0.14)`
2. **Navegação:** Underline tabs. NUNCA pills. `border-bottom: 3px solid #f97316`
3. **Mobile-first:** Testar em 375px antes de qualquer outra resolução
4. **Jornada = .jornada-only:** Nunca muda layout, só visibilidade
5. **RLS obrigatório:** Todas as tabelas com `user_id = auth.uid()`
6. **1 registro de peso/dia:** Use upsert, não insert
7. **Integrações opt-in:** Verificar toggle em Configurações antes de criar evento/transação
8. **Textos sobre fundo #f97316:** Sempre pretos (#000), nunca brancos
9. **Validações no frontend + backend:** Nunca confiar apenas em validação client-side
10. **Testes passando antes de avançar:** Cada fase valida com testes antes de iniciar a próxima

---

## ORDEM DE EXECUÇÃO (GRAFO DE DEPENDÊNCIAS)

```
Fase 1 (Schema + Hooks)
    ├── Fase 2 (Dashboard) ──── Fase 7 (Coach IA + Perfil)
    ├── Fase 3 (Atividades)
    ├── Fase 4 (Peso & Medidas)
    ├── Fase 5 (Nutrição)
    └── Fase 6 (Saúde Preventiva)
                    │
                    └── Fase 8 (Testes E2E) [após todas as fases 2-7]
```

**Fase 1 é pré-requisito de todas.** Fases 2-6 podem ser paralelizadas. Fase 7 depende de Fase 2 (Dashboard). Fase 8 executa por último.

---

## CHECKLIST DE CONCLUSÃO

- [ ] Todas as 6 rotas respondem (`/corpo`, `/corpo/atividades`, `/corpo/peso`, `/corpo/cardapio`, `/corpo/saude`, `/corpo/coach`)
- [ ] Sub-nav com underline tabs funciona em todas as telas
- [ ] 25 regras de negócio (RN-CRP-01 a RN-CRP-25) implementadas
- [ ] 4 integrações cross-módulo funcionando com opt-in
- [ ] Modo Foco e Jornada comportam-se conforme tabela da spec
- [ ] Limites FREE/PRO implementados (consultas, sugestões IA, coach)
- [ ] Empty states para todas as telas (primeiro uso)
- [ ] Celebração ao atingir meta de peso (Jornada)
- [ ] 50 testes Playwright passando
- [ ] Validação visual: todas as telas conferem com o protótipo v3
- [ ] Responsividade: 375px, 640px, 1024px testados
- [ ] Deploy no Vercel com zero erros de build

---

*Prompt criado em: 07/03/2026*  
*Versão: 1.0*  
*Baseado em: SPEC-FUNCIONAL-CORPO.md + proto-mobile-corpo-v3.html*  
*Total estimado: 27-35 horas de desenvolvimento*
