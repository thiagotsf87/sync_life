# 🏃 Especificação Funcional — Módulo Corpo

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Corpo — Saúde e Atividades  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#f97316` (Orange)  
> **Ícone Lucide:** `Activity`  
> **Subtítulo descritivo:** "Saúde e bem-estar físico"  
> **Pergunta norteadora:** "Como está meu Corpo?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Atividades Físicas](#6-tela-02--atividades-físicas)
7. [Tela 03 — Peso & Medidas](#7-tela-03--peso--medidas)
8. [Tela 04 — Cardápio / Nutrição](#8-tela-04--cardápio--nutrição)
9. [Tela 05 — Saúde Preventiva](#9-tela-05--saúde-preventiva)
10. [Tela 06 — Coach IA](#10-tela-06--coach-ia)
11. [Fluxos CRUD Detalhados](#11-fluxos-crud-detalhados)
12. [Integrações com Outros Módulos](#12-integrações-com-outros-módulos)
13. [Diagrama de Integrações](#13-diagrama-de-integrações)
14. [Regras de Negócio Consolidadas](#14-regras-de-negócio-consolidadas)
15. [Modelo de Dados](#15-modelo-de-dados)
16. [Life Sync Score — Componente Corpo](#16-life-sync-score)
17. [Insights e Sugestões Adicionais](#17-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Corpo

O módulo Corpo é o centro de gestão da **saúde física e bem-estar** do SyncLife. Ele não é um simples contador de calorias ou um log de academia — é o sistema que conecta o corpo do usuário com seus objetivos de vida. Quando o usuário registra um treino, esse dado alimenta o progresso de uma meta de saúde no Futuro. Quando agenda uma consulta médica, o custo aparece em Finanças e o compromisso no Tempo.

A proposta é responder à pergunta **"Como está meu Corpo?"** de forma quantificável: quanto peso perdi/ganhei, quantas atividades fiz esta semana, minhas consultas estão em dia, e como minha nutrição apoia meus objetivos.

### 1.2 Por que este módulo existe

No mercado atual, a gestão da saúde física é brutalmente fragmentada. O usuário precisa de 4-5 apps distintos para cobrir o que o SyncLife Corpo faz em um só lugar:

- **MyFitnessPal** para contar calorias (~R$40/mês premium)
- **Strong** ou **Hevy** para logar treinos de musculação
- **Apple Health / Google Fit** para passos e métricas de saúde
- **Planilha do Excel** para tracking de peso
- **Agenda do celular** para lembrar consultas médicas

Nenhuma dessas ferramentas responde: **"Meu treino de 4x/semana está me ajudando a atingir a meta de emagrecer 5kg que vinculei ao meu objetivo de saúde no Futuro?"**. O SyncLife faz isso.

### 1.3 Proposta de valor única

O módulo Corpo não compete com o MyFitnessPal em banco de dados de alimentos (MFP tem 20 milhões de foods). Ele compete na **camada de significado e integração**:

- Cada atividade registrada alimenta o Life Sync Score
- Cada consulta agendada sincroniza com Tempo (agenda) e Finanças (custo)
- O peso e medidas corporais conectam-se a metas no Futuro
- O Coach IA cruza dados de Corpo + Finanças + Tempo para sugerir ajustes reais
- O cardápio IA calcula o TDEE real (baseado em TMB + nível de atividade do próprio módulo)

### 1.4 As 6 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Visão geral do estado físico (KPIs, gráfico, próxima consulta) | Diária |
| 02 | Atividades Físicas | Registrar treinos, ver histórico semanal, streak de exercício | Diária (3-5x/semana) |
| 03 | Peso & Medidas | Tracking de peso, gordura, medidas corporais, evolução gráfica | Semanal |
| 04 | Cardápio / Nutrição | Registro de refeições, meta calórica, macros, sugestão IA | Diária |
| 05 | Saúde Preventiva | Consultas médicas, alertas de retorno, check-ups em dia | Mensal |
| 06 | Coach IA | Insights personalizados, plano de ação, análise cross-módulo | Semanal |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **MyFitnessPal** | Maior banco de dados de alimentos do mundo (20M+), barcode scanner, meal scan com IA (foto), vasta integração com wearables (35+ parceiros) | Sem tracking de consultas médicas, sem conexão com objetivos de vida, sem coaching cross-módulo. Free ficou muito limitado (barcode agora é premium) | Free / Premium $79.99/ano / Premium+ $99.99/ano |
| **Cronometer** | Rastreamento de 84 micronutrientes, dados verificados USDA, foco em precisão nutricional | Interface densa e técnica, sem gamificação, sem tracking de treinos ou consultas, curva de aprendizado alta | Free c/ ads / Gold $49.99/ano |
| **MacroFactor** | Algoritmo adaptativo que ajusta macros semanalmente baseado em peso real, "metabolic coach" | Sem versão free, sem desktop, foco exclusivo em nutrição (sem atividades, sem consultas), caro para casual | ~$71.99/ano (sem free) |
| **Samsung Health** | Ecossistema completo (passos, sono, frequência cardíaca, estresse), integração Galaxy Watch, readiness score | Preso ao ecossistema Samsung, sem tracking de consultas, sem integração com finanças ou objetivos, sem meal planning IA | Gratuito (requer Samsung) |
| **Apple Health** | Hub de saúde universal iOS, integração com qualquer wearable, trends adaptativas, dados clínicos | Apenas agregador (não cria planos), iOS only, sem coach IA, sem nutrição, sem consultas médicas | Gratuito (requer Apple) |
| **Noom** | Coaching comportamental baseado em psicologia, lições diárias, foco em mudança de hábito, GLP-1 med access | Muito caro ($209/ano), não rastreia macros detalhados, sem consultas médicas, sem integração com objetivos | ~$209/ano |
| **WHOOP** | Recovery score de nível médico, strain coach, HRV analytics, gamificação por dados biométricos | Requer hardware (pulseira), foco em atletas de alta performance, sem nutrição, sem consultas | $30/mês + hardware |
| **CareClinic** | Tracking médico completo (medicamentos, sintomas, consultas, lab results), compartilhamento com profissional | Focado em doenças crônicas, sem fitness/nutrição, sem gamificação, interface médica (não lifestyle) | Freemium |
| **Guava Health** | Correlação entre sintomas, hábitos e ambiente, preparação para consultas médicas, period tracking | Focado em saúde feminina e condições crônicas, sem tracking de atividades fitness, sem nutrição | Freemium |

### 2.2 Diferenciais Competitivos do SyncLife Corpo

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Atividade → Objetivo** | Registrar "4x musculação/semana" alimenta automaticamente a meta "Emagrecer 5kg" no módulo Futuro, que por sua vez atualiza o progresso geral do Objetivo | Ninguém |
| **Consulta → Finanças + Tempo** | Agendar consulta médica cria evento no Tempo e registra custo em Finanças na categoria "Saúde", tudo automaticamente | Ninguém |
| **TDEE Real (não estimado)** | O cálculo de TDEE usa dados reais: TMB + atividades registradas naquela semana (com valores MET por tipo). Não é uma estimativa estática — é dinâmica | MacroFactor (parcial, por nutrição) |
| **Saúde Preventiva Inteligente** | Alertas de retorno médico baseados na frequência recomendada por especialidade. "Seu retorno ao oftalmo vence em 2 meses" com custo estimado em Finanças | CareClinic (parcial, sem custo) |
| **Cardápio IA Contextual** | A IA sugere refeições considerando: meta calórica, macros restantes do dia, custo do orçamento mensal de alimentação (Finanças), e preferências alimentares | MyFitnessPal Premium+ (parcial, sem integração financeira) |
| **Coach IA Cross-Módulo** | Insights que cruzam Corpo + Finanças + Tempo: "Você gasta R$600/mês em delivery. Cozinhando 3x/semana economizaria R$240 e cortaria 800 kcal/mês" | Ninguém |
| **Experiência unificada** | XP por treino, streak de atividades, badges de consistência, celebrações de marco | WHOOP (gamificação parcial por dados) |

### 2.3 O que aprendemos com o benchmark

**Do MyFitnessPal:** O banco de dados de alimentos é fundamental para adoção. No MVP do SyncLife, em vez de tentar competir com 20M de foods, usamos cardápio simplificado por refeição (nome + calorias estimadas + macros). Na v2, integração com API externa de alimentos. A feature de Meal Scan (foto → IA reconhece calorias) é algo que podemos incorporar via Coach IA.

**Do MacroFactor:** Ajuste adaptativo de macros é um diferencial poderoso. No SyncLife, a IA do Coach pode recalcular metas nutricionais semanalmente com base no peso real, simulando o comportamento do MacroFactor sem custo adicional ao usuário.

**Do Samsung Health / Apple Health:** O papel de "hub agregador" é valioso. O SyncLife não precisa ter sensores — precisa ser o lugar onde todos os dados convergem e ganham significado. Integração com Apple Health / Google Health Connect é roadmap pós-MVP.

**Do CareClinic:** O tracking de consultas médicas com lembretes de retorno é uma funcionalidade negligenciada por apps fitness. No SyncLife, consultas médicas são cidadãs de primeira classe — com custo, data, especialidade, notas e follow-up automático.

**Do Noom:** Coaching comportamental funciona. No SyncLife, o Coach IA preenche esse papel — mas sem o custo proibitivo de R$209/ano.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🏃 CORPO — NAVEGAÇÃO PRINCIPAL                     │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Atividades │ Peso │ Cardápio │ Saúde │ Coach IA        │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────┬──────┘
       │          │          │          │          │           │
       ▼          ▼          ▼          ▼          ▼           ▼
  ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────┐
  │01       │ │02      │ │03      │ │04      │ │05        │ │06    │
  │DASHBOARD│ │ATIVID. │ │PESO &  │ │CARDÁPIO│ │SAÚDE     │ │COACH │
  │         │ │FÍSICAS │ │MEDIDAS │ │NUTRIÇÃO│ │PREVENTIVA│ │IA    │
  └────┬────┘ └───┬────┘ └───┬────┘ └────┬───┘ └────┬─────┘ └──────┘
       │          │          │           │          │
       │    ┌─────┼─────┐    │     ┌─────┼────┐     │
       │    │     │     │    │     │     │    │     │
       │    ▼     ▼     ▼    ▼     ▼     ▼    ▼     ▼
       │   07    08    09   10    11    12   13    14
       │  REGIST DETALHE PERFIL REGIST REGIST AGEN DETALHE
       │  RATIV  ATIVID  SAÚDE  REFEI  PESO  DAR  CONSULT
       │  IDADE  ADE           ÇÃO   MEDIDA CONS
       │                                      ULTA
       │
       └──→ Quick Actions: +Peso, +Atividade, +Refeição
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Atividades Físicas | Sub-nav "Atividades" | — |
| **L1** | 03 Peso & Medidas | Sub-nav "Peso" | — |
| **L1** | 04 Cardápio / Nutrição | Sub-nav "Cardápio" | — |
| **L1** | 05 Saúde Preventiva | Sub-nav "Saúde" | — |
| **L1** | 06 Coach IA | Sub-nav "Coach IA" | — |
| **L2** | 07 Registrar Atividade | Botão "+" no header (02) | ✕ Fecha (volta 02) |
| **L2** | 08 Detalhe Atividade | Tap em card de atividade (02) | ← Atividades (02) |
| **L2** | 09 Perfil de Saúde | Botão ⚙️ no Dashboard (01) | ← Dashboard (01) |
| **L2** | 10 Registrar Refeição | CTA "+Adicionar" (04) | ✕ Fecha (volta 04) |
| **L2** | 11 Registrar Peso/Medida | CTA "Registrar" (03) | ✕ Fecha (volta 03) |
| **L2** | 12 Agendar Consulta | Botão "+" no header (05) | ✕ Fecha (volta 05) |
| **L2** | 13 Detalhe Consulta | Tap em card de consulta (05) | ← Saúde (05) |
| **L2** | 14 Celebração | Automático ao atingir meta | Botão → Dashboard (01) |

### 3.3 Padrão de Navegação (idêntico ao módulo Futuro)

**Header do módulo:**
- Ícone do módulo (🏃) + Nome ("Corpo") à esquerda
- Badge de contagem à direita (ex: "3/4 atividades")

**Sub-nav:**
- Tabs com underline (não pills)
- Tab ativa: texto branco/claro + underline na cor do módulo (#f97316)
- Tabs inativas: texto cinza (var(--t3)), sem underline
- 6 tabs: Dashboard, Atividades, Peso, Cardápio, Saúde, Coach IA

**Telas internas (L2):**
- Header simplificado: botão voltar (←) + título centralizado + ação contextual
- Sem sub-nav (pois está num nível abaixo)

---

## 4. MAPA DE FUNCIONALIDADES

### 4.1 Visão Geral por Tela

```
🏃 CORPO
│
├── 📊 Dashboard
│   ├── KPIs (peso atual/IMC, TMB/TDEE, atividades semana, próxima consulta)
│   ├── Gráfico sparkline de evolução de peso (30 dias)
│   ├── Próxima consulta (card destacado)
│   ├── Hidratação diária (tracker rápido)
│   ├── Quick Actions (+Peso, +Atividade, +Refeição)
│   └── [Jornada] Insight IA contextual
│
├── 🏋️ Atividades Físicas
│   ├── Resumo semanal (barra de progresso da meta)
│   ├── Gráfico de barras por dia da semana
│   ├── Filtros por tipo (Todos, Musculação, Cardio, Yoga, etc.)
│   ├── Lista de atividades recentes (tipo, duração, calorias, intensidade)
│   ├── Registrar nova atividade (wizard)
│   ├── Detalhe da atividade
│   └── [Jornada] Streak de treino + XP por atividade
│
├── ⚖️ Peso & Medidas
│   ├── Filtros de período (30d, 3m, 6m, 1a)
│   ├── Gráfico de evolução do peso com linha de meta
│   ├── Grid de medidas corporais (cintura, quadril, gordura%, massa muscular)
│   ├── CTA "Registrar medição"
│   ├── Histórico de medições (lista cronológica)
│   └── [PRO] Gráficos de composição corporal
│
├── 🍽️ Cardápio / Nutrição
│   ├── Ring calórico do dia (meta vs consumido vs restante)
│   ├── Barra de macronutrientes (carbos, proteína, gordura)
│   ├── Lista de refeições do dia (café, almoço, lanche, jantar)
│   ├── Registrar refeição (manual)
│   ├── [PRO] Sugestão IA para próxima refeição
│   ├── [PRO] Cardápio semanal gerado por IA
│   └── [Jornada] Insight nutricional do dia
│
├── 🏥 Saúde Preventiva
│   ├── Próximas consultas (cards com countdown)
│   ├── CTA "Agendar nova consulta"
│   ├── Histórico de consultas
│   ├── Alertas de retorno (por especialidade)
│   ├── Detalhe da consulta (notas, custo, anexos, follow-up)
│   └── [Jornada] Score de saúde preventiva
│
└── 🤖 Coach IA [PRO]
    ├── Insight principal do dia (cross-módulo)
    ├── Plano de ação semanal
    ├── Análise de tendências (peso, atividade, nutrição)
    ├── Sugestões de otimização (custo × saúde)
    └── [Jornada] Desafios semanais personalizados
```

---

## 5. TELA 01 — DASHBOARD

### 5.1 Objetivo

Fornecer uma **fotografia instantânea** do estado físico do usuário. Em 3 segundos ele deve saber: quanto pesa, se está treinando na frequência certa, quando é a próxima consulta, e se está se hidratando. É a "porta de entrada" do módulo — tudo aqui é resumo, os detalhes vivem nas sub-telas.

### 5.2 Componentes

#### 5.2.1 KPI Grid (2×2)

| KPI | Valor exemplo | Cor | Lógica de cálculo |
|-----|---------------|-----|-------------------|
| **Peso Atual** | 78,4 kg | `#f97316` (corpo) | Último registro em `weight_entries` ordenado por `recorded_at DESC`. Sub-texto: IMC + classificação (Normal, Sobrepeso, etc.) |
| **TMB / TDEE** | 1.680 kcal | `#f59e0b` (yellow) | TMB = Mifflin-St Jeor (peso, altura, idade, sexo). TDEE = TMB × fator de atividade (de `health_profiles.activity_level`) |
| **Atividades (semana)** | 3/4 | `#10b981` (green) | Count de `activities` onde `recorded_at` está na semana corrente (seg-dom). Meta = `health_profiles.weekly_activity_goal` (padrão: 4) |
| **Próxima Consulta** | 4 Mar | `#06b6d4` (cyan) | Próxima `medical_appointments` onde `appointment_date > NOW()` e `status = 'scheduled'`. Sub-texto: dias restantes + especialidade |

**Critérios de aceite:**
- Os 4 KPIs carregam em até 2 segundos
- Cada KPI mostra label, valor principal, e sub-texto contextual
- Valores vazios mostram "—" (nunca fica em branco) com CTA contextual ("Registre seu peso", "Configure perfil", etc.)
- IMC calcula automaticamente: peso(kg) / (altura(m))²
- Classificação IMC segue tabela OMS: < 18.5 Abaixo, 18.5-24.9 Normal, 25-29.9 Sobrepeso, 30-34.9 Obesidade I, 35-39.9 Obesidade II, ≥ 40 Obesidade III
- Cor do IMC muda conforme faixa: verde (normal), amarelo (sobrepeso), laranja (obesidade I), vermelho (obesidade II/III)

**Resultado esperado:** O usuário vê seus 4 indicadores-chave sem precisar scrollar. Entende imediatamente: peso, metabolismo, atividade física e próximo compromisso médico.

#### 5.2.2 Gráfico Sparkline de Peso

**Objetivo:** Visualizar a tendência de peso dos últimos 30 dias num gráfico compacto.

**Funcionamento:**
- Linha SVG com gradiente sutil abaixo
- Linha tracejada horizontal mostrando meta de peso (de `health_profiles.target_weight`)
- Ponto final destacado com valor atual
- Label de período: "1 Fev" ... "Hoje · 78,4kg"
- Badge no topo: "↓ 1,8kg no mês" (verde) ou "↑ 0,5kg no mês" (vermelho)

**Critérios de aceite:**
- Renderiza com dados de `weight_entries` dos últimos 30 dias
- Se menos de 2 registros, mostra empty state: "Registre pelo menos 2 pesagens para ver a evolução"
- Linha de meta só aparece se `target_weight` está configurado
- Gradiente usa cor do módulo `#f97316` com opacidade

**Resultado esperado:** O usuário vê a tendência de peso ao longo do tempo, sabe se está convergindo para a meta e se sente motivado (ou alertado) pela direção.

#### 5.2.3 Card de Próxima Consulta

**Objetivo:** Destacar o próximo compromisso médico com informações contextuais.

**Funcionamento:**
- Card com borda na cor do módulo
- Ícone da especialidade (emoji: 🦷 dentista, ❤️ cardio, 👁️ oftalmo, etc.)
- Nome do médico + especialidade
- Data + horário
- Custo alocado (se informado) com link visual para Finanças
- Badge de countdown: "Em 3 dias", "Amanhã", "Hoje!"

**Critérios de aceite:**
- Se não há consulta futura, mostra CTA: "Nenhuma consulta agendada. Agendar?"
- Custo mostra apenas se `cost > 0`
- Badge muda de cor: > 7 dias (neutro), 3-7 dias (amarelo), 1-2 dias (laranja), hoje (vermelho)

#### 5.2.4 Tracker de Hidratação

**Objetivo:** Registro rápido da ingestão de água diária com visualização de progresso.

**Funcionamento:**
- Barra horizontal ou círculo mostrando progresso (ex: 1,8L de 2,5L)
- Botões rápidos: +250ml, +500ml
- Meta diária baseada em peso: `peso(kg) × 35ml` (regra aproximada)
- Persistido em `daily_water_intake` por dia

**Critérios de aceite:**
- Um toque em "+250ml" incrementa e persiste no banco
- Reseta automaticamente à meia-noite (fuso do usuário)
- Meta calcula automaticamente baseada no peso, mas é editável
- Cor progride: < 50% amarelo, 50-80% laranja, > 80% verde

**Resultado esperado:** O usuário registra hidratação em 1 segundo, sem abrir tela separada.

#### 5.2.5 [Jornada] Insight IA Contextual

**Objetivo:** Fornecer análise inteligente do estado físico do usuário, cruzando dados do módulo.

**Componente visual:**
- Card com fundo azulado sutil
- Ícone de robô (🤖)
- Texto personalizado com dados reais

**Exemplos de insights:**
- "Seu peso atual é **78,4 kg** (IMC **24,1 — Normal**). Você fez **3 atividades** essa semana. Beba mais **700ml** hoje para atingir a meta de hidratação."
- "Nas últimas 4 semanas, terças e quintas são seus dias mais ativos. Considere adicionar uma sessão aos sábados para atingir 4x/semana."
- "Sua consulta com o Dentista é em 3 dias. R$ 280 já está alocado na categoria Saúde."
- "Você perdeu 1,8kg no último mês. No ritmo atual, atingirá 76kg em 5 semanas."

**Lógica de geração (regras por prioridade):**
1. Se consulta em ≤ 3 dias → lembrete com custo
2. Se peso está caindo consistentemente → projeção de quando atinge meta
3. Se atividades < meta semanal e é quinta-feira → alerta para não perder
4. Se hidratação < 60% e são 15h+ → empurrãozinho
5. Fallback: resumo geral do estado físico

**Critérios de aceite:**
- Sempre visível
- O insight muda a cada visita ao módulo
- Gerado por regras de negócio (não IA generativa no MVP)
- Se não há dados suficientes, mostra dica genérica de saúde

---

## 6. TELA 02 — ATIVIDADES FÍSICAS

### 6.1 Objetivo

Registrar e acompanhar todas as atividades físicas do usuário — treinos de academia, corridas, caminhadas, yoga, esportes, etc. A tela responde: "Quantas vezes treinei esta semana? Estou consistente? Quanto queimei?"

### 6.2 Componentes

#### 6.2.1 Resumo Semanal

**Card principal:**
- Barra de progresso: "3 de 4 atividades esta semana"
- Total de minutos e calorias da semana
- Comparativo visual com semana anterior: "↑ 1 atividade vs semana passada"

**Critérios de aceite:**
- Semana = segunda a domingo (fuso do usuário)
- Meta vem de `health_profiles.weekly_activity_goal` (padrão: 4)
- Se meta atingida, barra muda para verde com "✓ Meta atingida!"

#### 6.2.2 Gráfico de Barras Semanal

**Visual:**
- 7 barras (Seg-Dom), altura proporcional à duração
- Barras preenchidas = dias com atividade (cor do módulo)
- Barras vazias = dias sem atividade (outline tracejado)
- Dia atual com borda destacada

**Critérios de aceite:**
- Se dia tem múltiplas atividades, barra soma as durações
- Tooltip ao tocar: "Seg: Musculação 55min · 430 kcal"

#### 6.2.3 Filtros por Tipo

**Tabs horizontais scrolláveis:**
- Todos (default)
- 🏋️ Musculação
- 🏃 Cardio
- 🧘 Yoga/Flexibilidade
- ⚽ Esportes
- 🏅 Outro

**Critérios de aceite:**
- Filtro é local (não recarrega página)
- Contagem entre parênteses: "Musculação (12)"
- Tab ativa tem fundo da cor do módulo

#### 6.2.4 Lista de Atividades Recentes

**Para cada atividade:**
- Ícone/emoji do tipo (🏋️, 🏃, 🧘, ⚽, etc.)
- Nome da atividade (ex: "Musculação — Peito/Tríceps")
- Data relativa + local + duração (ex: "Ontem · Academia · 55 min")
- Tags: tipo (💪 Força) + calorias (🔥 430 kcal)
- Intensidade visual (barra ou cor)

**Critérios de aceite:**
- Lista ordenada por `recorded_at DESC`
- Agrupa por dia (header de data)
- Card clicável navega para detalhe
- Swipe left para excluir (com confirmação)

#### 6.2.5 Cálculo de Calorias (MET)

**A queima calórica é calculada automaticamente:**

```
Calorias = MET × Peso(kg) × Duração(horas)
```

**Tabela MET por tipo (já implementada em `use-corpo.ts`):**

| Tipo | MET | Exemplo 70kg × 1h |
|------|-----|-------------------|
| Caminhada | 3.5 | 245 kcal |
| Corrida | 8.0 | 560 kcal |
| Musculação | 6.0 | 420 kcal |
| Ciclismo | 7.5 | 525 kcal |
| Natação | 7.0 | 490 kcal |
| Yoga | 3.0 | 210 kcal |
| Futebol | 7.0 | 490 kcal |
| Basquete | 6.5 | 455 kcal |
| Dança | 5.0 | 350 kcal |
| Outro | 4.0 | 280 kcal |

---

## 7. TELA 03 — PESO & MEDIDAS

### 7.1 Objetivo

Acompanhar a evolução corporal do usuário ao longo do tempo — peso, IMC, gordura corporal, massa muscular, e medidas específicas (cintura, quadril). Responde: "Estou progredindo em direção à minha meta de composição corporal?"

### 7.2 Componentes

#### 7.2.1 Filtros de Período

**Chips horizontais:**
- 30 dias (default)
- 3 meses
- 6 meses
- 1 ano

#### 7.2.2 Gráfico de Evolução do Peso

**Visual:**
- Gráfico de linha com preenchimento gradiente abaixo
- Linha tracejada horizontal = meta de peso
- Label da meta: "Meta: 76kg"
- Ponto final destacado com valor atual
- Período e delta no header: "↓ 1,8kg no período" (badge verde)

**Critérios de aceite:**
- Dados de `weight_entries` no período selecionado
- Se ≤ 1 ponto, mostra empty state
- Interpolação suave entre pontos (curva bézier)
- Zoom de eixo Y: mostra apenas range útil (min-2 a max+2)

#### 7.2.3 Grid de Medidas Corporais (2×2)

| Medida | Fonte | Cálculo |
|--------|-------|---------|
| Cintura | `weight_entries.waist_cm` | Último registro, delta vs mês anterior |
| Quadril | `weight_entries.hip_cm` | Último registro, delta vs mês anterior |
| Gordura corporal % | `weight_entries.body_fat_pct` | Último registro (bioimpedância ou manual) |
| Massa muscular kg | `weight_entries.muscle_mass_kg` | Último registro |

**Critérios de aceite:**
- Medidas opcionais — mostram "—" se não registradas
- Delta mostra seta verde (↓ cintura, ↑ músculo = bom), vermelha (oposto), neutra (estável)
- Tooltip ao tocar: "Último registro: 28 Fev"

#### 7.2.4 CTA "Registrar Medição"

**Card com gradiente:**
- Ícone 📏
- "Registrar medição"
- Sub-texto: "Último: [data do último registro]"
- Abre modal/tela L2 de registro

#### 7.2.5 Histórico de Medições

**Lista cronológica:**
- Peso em destaque (fonte mono, cor do módulo)
- Data
- IMC + Gordura% no sub-texto
- Delta vs medição anterior (↓0,6 em verde)

---

## 8. TELA 04 — CARDÁPIO / NUTRIÇÃO

### 8.1 Objetivo

Registrar o que o usuário comeu no dia e acompanhar se está dentro da meta calórica e de macros. Não pretende substituir o MyFitnessPal — é uma versão simplificada que prioriza **velocidade de registro** sobre precisão atômica.

### 8.2 Filosofia: Simples > Preciso

O maior problema de apps nutricionais é a **fricção de registro**. MyFitnessPal tem 20 milhões de alimentos, mas o usuário médio desiste em 2 semanas porque logar cada ingrediente é tedioso. O SyncLife adota abordagem diferente:

- **Registro por refeição** (não por ingrediente individual)
- Campos: nome da refeição, calorias estimadas, macros principais (proteína, carbos, gordura)
- Sugestão rápida: presets comuns ("Almoço padrão: 680 kcal")
- [PRO] Foto da refeição → IA estima calorias

### 8.3 Componentes

#### 8.3.1 Ring Calórico do Dia

**Visual:**
- Anel circular SVG (stroke-dasharray animado)
- Centro: calorias consumidas (grande, cor do módulo)
- Esquerda: META (valor do TDEE ajustado ao objetivo)
- Direita: RESTANTE (meta - consumido)
- Cores: se consumido > meta, anel fica vermelho

#### 8.3.2 Barra de Macronutrientes

**Visual:**
- Barra horizontal segmentada em 3 cores:
  - Carboidratos (azul `#0055ff`)
  - Proteína (verde `#10b981`)
  - Gordura (amarelo `#f59e0b`)
- Legend abaixo com gramas de cada

**Critérios de aceite:**
- Proporção visual = proporção real dos macros
- Metas de macro calculadas: proteína = 2g/kg, gordura = 25% kcal, carbo = restante
- Ajustável nas configurações do perfil de saúde

#### 8.3.3 Lista de Refeições do Dia

**4 slots fixos:**
- 🌅 Café da manhã
- ☀️ Almoço
- 🌇 Lanche
- 🌙 Jantar

**Para refeições registradas:**
- Ícone + nome + horário
- Descrição breve (o que comeu)
- Calorias em fonte mono

**Para refeições não registradas:**
- Opacidade reduzida
- "Toque para adicionar"
- Ícone "+"

#### 8.3.4 [PRO] Sugestão IA para Próxima Refeição

**Card com fundo roxo:**
- 🤖 "Sugestão para o jantar"
- "Você ainda tem 360 kcal e 30g proteína disponíveis"
- Sugestão: "🥗 Salada + Filé de frango grelhado"
- "~340 kcal · 35g proteína"
- Botão: tap abre como refeição pré-preenchida

**Critérios de aceite:**
- Só aparece se há pelo menos 1 refeição registrada no dia
- Calcula restante de calorias e proteína
- Sugestões são baseadas em regras (não IA generativa no MVP)
- Catálogo de ~50 sugestões pré-definidas com dados nutricionais

---

## 9. TELA 05 — SAÚDE PREVENTIVA

### 9.1 Objetivo

Gerenciar consultas médicas, lembretes de retorno, e check-ups preventivos. Responde: "Minhas consultas estão em dia? Quando preciso voltar ao médico?"

### 9.2 Componentes

#### 9.2.1 Próximas Consultas

**Cards expandidos para cada consulta futura:**
- Ícone da especialidade (emoji)
- Nome da especialidade + médico
- Local (clínica/hospital)
- Data, horário, custo estimado em mini-grid 3 colunas
- Badge de countdown: "Em 3 dias"

**Critérios de aceite:**
- Ordenadas por data ascendente (mais próxima primeiro)
- Cards com borda na cor do módulo
- Se custo > 0, mostra com ícone 💰

#### 9.2.2 CTA "Agendar Nova Consulta"

**Card tracejado:**
- 📅 "Agendar nova consulta"
- "Sincroniza com Tempo e Finanças"

#### 9.2.3 Histórico de Consultas

**Lista cronológica (mais recente primeiro):**
- Ícone da especialidade
- Nome da especialidade + médico
- Data + custo
- Badge de follow-up: "↩ Retorno em Jul 2026"

#### 9.2.4 Alertas de Retorno

**Cards de alerta (amarelo/laranja):**
- ⚠️ "Retorno [Especialidade]"
- "Vence em [data] · Faltam [X] meses"
- Botão: "Agendar retorno"

**Critérios de aceite:**
- Alertas gerados automaticamente: consulta.follow_up_months define frequência
- Status: pending (não agendou retorno), scheduled (agendou), overdue (passou da data)
- Overdue = destaque vermelho + notificação
- Alertas consideram apenas consultas com `follow_up_months > 0`

#### 9.2.5 Especialidades Suportadas (pré-definidas)

Conforme já implementado em `use-corpo.ts`:
Clínico Geral, Cardiologista, Dermatologista, Endocrinologista, Ginecologista, Nutricionista, Oftalmologista, Ortopedista, Otorrino, Psicólogo, Psiquiatra, Urologista, Dentista, Outro

---

## 10. TELA 06 — COACH IA

### 10.1 Objetivo

Fornecer **insights personalizados** que cruzam dados de Corpo com outros módulos. Sempre disponível no MVP.

### 10.2 Componentes

#### 10.2.1 Insight Principal do Dia

**Card grande:**
- Análise contextual baseada em dados reais
- Exemplo: "Você perdeu 1,8kg este mês treinando 3x/semana. Se mantiver + adicionar 1 sessão de cardio, projeção: 76kg em 6 semanas."

#### 10.2.2 Plano de Ação Semanal

**Lista de 3-5 ações concretas:**
- "Treinar [tipo] na [dia]" (baseado no gap de atividades)
- "Beber 2,5L de água (meta atual: 1,8L/dia)"
- "Agendar retorno no Oftalmo (vence em 2 meses)"
- "Reduzir carbos em 50g para acelerar perda de gordura"

#### 10.2.3 Análise de Tendências

**Gráficos compactos:**
- Tendência de peso (30 dias)
- Frequência de treinos (4 semanas)
- Consumo calórico médio (7 dias)

#### 10.2.4 [Jornada] Desafios Semanais

**Card gamificado:**
- "Desafio: 4 treinos esta semana (você fez 3 na última)"
- Recompensa: "+100 XP"
- Barra de progresso do desafio

**Critérios de aceite:**
- Tela inteira sempre disponível no MVP
- Insights são gerados por regras de negócio no MVP
- Dados cruzam: weight_entries, activities, medical_appointments, daily_water_intake
- Se dados insuficientes (< 1 semana de uso), mostra "Continue registrando por 7 dias para receber insights personalizados"

---

## 11. FLUXOS CRUD DETALHADOS

### 11.1 Atividade Física

#### CRIAR ATIVIDADE

```
PASSO 1 — Onde: Tela Atividades → botão "+" no header
PASSO 2 — Modal/Sheet de registro:
├── Tipo de atividade (grid 2×5 com emojis: 🚶🏃🏋️🚴🏊🧘⚽🏀💃🏅)
├── Nome/descrição (opcional, ex: "Peito/Tríceps")
├── Duração (minutes, slider 10-180, default 30)
├── Intensidade (1-5 estrelas, default 3)
├── Distância (km, opcional — para corrida/ciclismo)
├── Passos (opcional — para caminhada)
├── Notas (texto livre, opcional)
├── Data/hora (default: agora)
└── Preview: "Calorias estimadas: ~430 kcal" (cálculo MET em tempo real)

PASSO 3 — Confirmar
├── Validação:
│   ├── Tipo: obrigatório
│   ├── Duração: obrigatório, 1-720 minutos
│   ├── Intensidade: 1-5
│   └── Data: não pode ser futura
├── Sistema:
│   ├── Insere em `activities`
│   ├── Calcula calorias: MET × peso(kg) × duração(h) × (intensidade/3)
│   ├── Atualiza KPI de atividades no Dashboard
│   ├── Se vinculada a meta no Futuro → atualiza progresso
│   └── [Jornada] +15 XP por atividade registrada
├── Feedback: Toast "Atividade registrada! 🔥 430 kcal"
└── Retorna para lista de atividades
```

#### EDITAR ATIVIDADE

```
PASSO 1 — Tela Detalhe da Atividade → "Editar"
PASSO 2 — Campos editáveis: tipo, nome, duração, intensidade, distância, passos, notas
├── NÃO editável: data/hora (para manter integridade)
├── Ao mudar tipo ou duração → recalcula calorias
PASSO 3 — Salvar → atualiza `activities`, recalcula KPIs
```

#### EXCLUIR ATIVIDADE

```
PASSO 1 — Swipe left ou Detalhe → "Excluir"
PASSO 2 — Confirmação: "Excluir atividade '[nome]'?"
PASSO 3 — Ao confirmar:
├── Remove de `activities`
├── Recalcula KPIs e streak
├── Se vinculada a meta no Futuro → recalcula progresso
└── Evento na Agenda é mantido (não exclui em cascata)
```

### 11.2 Registro de Peso/Medidas

#### CRIAR REGISTRO

```
PASSO 1 — Tela Peso & Medidas → CTA "Registrar medição"
PASSO 2 — Modal de registro:
├── Peso (kg, obrigatório, input numérico com 1 decimal)
├── Gordura corporal % (opcional)
├── Massa muscular kg (opcional)
├── Cintura cm (opcional)
├── Quadril cm (opcional)
├── Notas (opcional)
├── Data (default: hoje)
└── Preview: "IMC calculado: 24,1 — Normal"

PASSO 3 — Confirmar
├── Validação:
│   ├── Peso: obrigatório, 20-300 kg
│   ├── Data: não pode ser futura
│   └── Medidas: positivas se preenchidas
├── Sistema:
│   ├── Insere em `weight_entries`
│   ├── Calcula IMC automaticamente
│   ├── Atualiza gráfico e KPIs
│   ├── Se vinculada a meta de peso no Futuro → atualiza progresso
│   └── [Jornada] +10 XP por registro de peso
├── Feedback: Toast "Peso registrado: 78,4 kg (IMC 24,1)"
```

### 11.3 Consulta Médica

#### CRIAR CONSULTA

```
PASSO 1 — Tela Saúde Preventiva → botão "+"
PASSO 2 — Formulário:
├── Especialidade (dropdown das 14 especialidades)
├── Nome do médico (texto, opcional)
├── Local (texto, opcional)
├── Data e horário (obrigatório)
├── Custo estimado (R$, opcional)
├── Notas (texto, opcional)
├── Retorno em quantos meses? (0 = sem retorno, 3, 6, 12)
└── Anexar arquivo (foto de pedido médico, etc.) — futuro

PASSO 3 — Confirmar
├── Validação:
│   ├── Especialidade: obrigatório
│   ├── Data: obrigatório, pode ser futura
│   └── Custo: ≥ 0 se preenchido
├── Sistema:
│   ├── Insere em `medical_appointments` com status 'scheduled'
│   ├── Se integração `crp_consulta_tempo` ativa → cria evento na Agenda
│   ├── Se integração `crp_consulta_financas` ativa e custo > 0 → cria despesa em Finanças
│   ├── Se retorno > 0 → cria `follow_up_reminder_date` = data + retorno meses
│   └── [Jornada] +10 XP por consulta agendada
├── Feedback: Toast "Consulta agendada! 📅"
```

#### MUDAR STATUS

| Ação | De | Para | Confirmação | O que acontece |
|------|----|------|-------------|----------------|
| Realizar | scheduled | completed | Não | Registra data realizada, mantém custo |
| Cancelar | scheduled | cancelled | Sim | Cancela evento na Agenda se existir, marca como cancelada |
| Remarcar | scheduled | scheduled | Não | Abre form com nova data, atualiza evento na Agenda |
| Registrar custo final | completed | completed | Não | Atualiza campo custo com valor real pago |

#### EXCLUIR CONSULTA

```
PASSO 1 — Detalhe → "Excluir"
PASSO 2 — Confirmação: "Excluir consulta? A transação em Finanças será mantida."
PASSO 3 — Remove consulta, mantém transação financeira (histórico)
```

### 11.4 Refeição

#### CRIAR REFEIÇÃO

```
PASSO 1 — Tela Nutrição → tap no slot de refeição não registrado
PASSO 2 — Modal:
├── Tipo de refeição (pré-selecionado: café, almoço, lanche, jantar)
├── Horário (default: agora)
├── Descrição (texto, ex: "Arroz, feijão, carne, salada")
├── Calorias (numérico, obrigatório)
├── Proteína g (opcional)
├── Carboidratos g (opcional)
├── Gordura g (opcional)
└── [PRO] "Não sabe as calorias? Descreva e a IA estima."

PASSO 3 — Confirmar
├── Validação:
│   ├── Tipo: obrigatório
│   ├── Calorias: > 0
│   └── Macros: ≥ 0 se preenchidos
├── Sistema:
│   ├── Insere em `meals`
│   ├── Atualiza ring calórico e barra de macros
│   └── [Jornada] +5 XP por refeição registrada
```

---

## 12. INTEGRAÇÕES COM OUTROS MÓDULOS

### 12.1 Corpo → Tempo (Agenda)

**Regra:** RN-CRP-20 — Consulta Médica → Evento na Agenda

**Trigger:** Criação de consulta médica com status 'scheduled'

**O que acontece:**
- Cria evento na tabela `agenda_events` com:
  - `title`: "🏥 [Especialidade] — [Médico]"
  - `description`: "Auto — 🏃 Corpo | Consulta médica"
  - `type`: 'saude'
  - `status`: 'pending'
  - Data e horário da consulta

**Condição:** Integração `crp_consulta_tempo` deve estar ativa em Configurações > Integrações

**Cenários:**
- Criar consulta com integração ativa → cria evento
- Cancelar consulta → cancela evento na Agenda
- Remarcar consulta → atualiza data do evento
- Excluir consulta → remove evento da Agenda

### 12.2 Corpo → Finanças

**Regra:** RN-CRP-21 — Custo de Consulta → Transação em Finanças

**Trigger:** Criação ou realização de consulta com `custo > 0`

**O que acontece:**
- Cria transação na tabela `transactions` com:
  - `description`: "🏥 Consulta: [Especialidade] — [Médico]"
  - `amount`: valor do custo
  - `type`: 'expense'
  - `category_id`: categoria "Saúde" (criada automaticamente se não existir)
  - Badge visual: "Auto — 🏃 Corpo"

**Condição:** Integração `crp_consulta_financas` deve estar ativa em Configurações > Integrações

**Cenários:**
- Agendar consulta com R$280 → cria despesa futura de R$280
- Realizar consulta e custo final diferente → atualiza transação
- Cancelar consulta → marca transação como cancelada (não exclui)
- Excluir consulta → NÃO exclui transação (histórico financeiro)

### 12.3 Corpo → Futuro

**Regra:** RN-CRP-22 — Peso/Atividade → Atualiza Meta no Futuro

**Trigger:** Novo registro de peso OU nova atividade registrada, E existe meta vinculada no Futuro

**O que acontece (peso):**
- A tabela `objective_goals` tem meta do tipo `linked` com `linked_entity_type = 'weight_tracking'`
- O `current_value` da meta é atualizado com o peso atual
- Progresso recalculado: se meta = 76kg, peso atual = 78,4kg, peso inicial = 80,2kg → progresso = (80,2-78,4)/(80,2-76) × 100 = 42,8%

**O que acontece (atividade):**
- Meta com `indicator_type = 'frequency'` e `target_module = 'corpo'`
- `current_value` = contagem de atividades da semana/mês
- Progresso recalculado: se meta = 4 ativ/semana e fez 3 → 75%

**Cenários:**
- Objetivo "Emagrecer para o casamento" com meta "Atingir 76kg" → peso atualiza progresso
- Objetivo "Vida saudável" com meta "Treinar 4x/semana" → atividades atualizam progresso
- Excluir atividade → recalcula progresso

### 12.4 Futuro → Corpo

**Regra:** RN-FUT-XX — Criar Meta de saúde → Sugere configurar tracking no Corpo

**Trigger:** Usuário cria meta do tipo 'linked' com `target_module = 'corpo'`

**O que acontece:**
- Se tipo é peso e não tem `target_weight` configurado → sugere: "Quer definir um peso alvo?"
- Se tipo é frequência de atividade e não tem `weekly_activity_goal` → sugere: "Configure sua meta semanal de atividades"

---

## 13. DIAGRAMA DE INTEGRAÇÕES

```
┌─────────────────────────────────────────────────────────────────┐
│                     🔮 FUTURO (Cockpit)                          │
│                                                                   │
│  Objetivo: "Emagrecer para o casamento"                         │
│  ├── Meta: "Atingir 76kg" (🏃 Corpo) ← peso atualiza           │
│  ├── Meta: "Treinar 4x/semana" (🏃 Corpo) ← atividades         │
│  └── Meta: "Reduzir 10% gordura" (🏃 Corpo) ← medidas          │
│                                                                   │
│  Progresso: recalcula quando peso ou atividade muda             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ bidirecional
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       🏃 CORPO                                    │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ Atividades       │    │ Peso & Medidas    │                    │
│  │ 4x/semana meta   │    │ 78,4kg atual      │                    │
│  │ MET × kcal       │    │ IMC 24,1          │                    │
│  └──────┬───────────┘    └──────┬────────────┘                    │
│         │                       │                                 │
│  ┌──────┴───────────┐    ┌──────┴────────────┐                    │
│  │ Consultas Médicas│    │ Nutrição          │                    │
│  │ Dentista 4 Mar   │    │ TDEE: 2.100 kcal  │                    │
│  │ R$ 280           │    │ Consumo: 1.740    │                    │
│  └──────┬───────────┘    └───────────────────┘                    │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
    ┌─────┼───────────────────────────────────┐
    │     │                                   │
    ▼     ▼                                   ▼
┌──────┐ ┌──────────┐              ┌──────────────┐
│💰    │ │⏳        │              │📊 Life Sync  │
│FINAN │ │TEMPO     │              │Score         │
│ÇAS   │ │(Agenda)  │              │              │
│      │ │          │              │Corpo: 0.15   │
│Trans.│ │Evento:   │              │peso no score │
│Saúde │ │Consulta  │              │              │
│R$280 │ │Dentista  │              │Fórmula:      │
│      │ │4 Mar     │              │(ativ/meta    │
│Badge:│ │14:00     │              │ ×0.3)        │
│"Auto │ │          │              │+(consul.×0.3)│
│—🏃"  │ │Badge:    │              │+(peso×0.2)   │
│      │ │"Auto—🏃" │              │+(passos×0.2) │
└──────┘ └──────────┘              └──────────────┘
```

---

## 14. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| **RN-CRP-01** | Cálculo TMB | TMB usa Mifflin-St Jeor: Homem = (10×peso) + (6,25×altura) - (5×idade) + 5. Mulher = mesma fórmula - 161. Requer peso, altura, idade e sexo biológico configurados no perfil. |
| **RN-CRP-02** | Cálculo TDEE | TDEE = TMB × fator de atividade. Fatores: sedentário 1.2, leve 1.375, moderado 1.55, muito ativo 1.725, extremo 1.9. |
| **RN-CRP-03** | Cálculo IMC | IMC = peso(kg) / (altura(m))². Classificação OMS com cores: verde (normal), amarelo (sobrepeso), laranja/vermelho (obesidade). |
| **RN-CRP-04** | Cálculo MET | Calorias = MET × peso(kg) × duração(horas). Cada tipo de atividade tem MET fixo. Intensidade modifica MET: (base × intensidade/3). |
| **RN-CRP-05** | Meta semanal de atividades | Padrão: 4 atividades/semana. Configurável de 1 a 7. Semana = segunda a domingo no fuso do usuário. |
| **RN-CRP-06** | Limite consultas | (pós-MVP) Consultas simultâneas ilimitadas no MVP. |
| **RN-CRP-07** | Follow-up automático | Ao criar consulta com `follow_up_months > 0`, o sistema calcula `follow_up_reminder_date` e cria alerta automático. |
| **RN-CRP-08** | Follow-up overdue | Se `follow_up_reminder_date` < NOW() e não há nova consulta da mesma especialidade, status muda para 'overdue'. |
| **RN-CRP-09** | Hidratação diária | Meta padrão = peso(kg) × 35ml. Reseta à meia-noite (fuso do usuário). Registro por incrementos (250ml, 500ml, custom). |
| **RN-CRP-10** | Peso: 1 registro por dia | Apenas 1 registro de peso por dia por usuário. Se tentar registrar novamente no mesmo dia, atualiza o registro existente. |
| **RN-CRP-11** | Refeição: 4 slots por dia | Cada dia tem exatamente 4 slots: café, almoço, lanche, jantar. Cada slot aceita 1 registro. Para registrar mais, usar notas. |
| **RN-CRP-12** | Cardápio IA | (pós-MVP) Sugestões de refeição ilimitadas no MVP. |
| **RN-CRP-13** | Coach IA | Coach IA completo sempre disponível no MVP. |
| **RN-CRP-14** | Perfil de saúde obrigatório parcial | TMB/TDEE só calculam se peso, altura, idade e sexo biológico estão preenchidos. Dashboard mostra CTA "Configure perfil" se incompleto. |
| **RN-CRP-15** | Integração Agenda opt-in | Toggle `crp_consulta_tempo` em Configurações > Integrações. Padrão: desativado. |
| **RN-CRP-16** | Integração Finanças opt-in | Toggle `crp_consulta_financas` em Configurações > Integrações. Padrão: desativado. |
| **RN-CRP-17** | Exclusão de consulta | Ao excluir consulta, transação financeira é MANTIDA (histórico). Evento na Agenda é REMOVIDO. |
| **RN-CRP-18** | XP por atividade | [Jornada] +15 XP por atividade, +10 XP por peso registrado, +10 XP por consulta agendada, +5 XP por refeição. +50 XP por meta semanal atingida. |
| **RN-CRP-19** | Streak de treino | Dias consecutivos com pelo menos 1 atividade registrada. Sábado/domingo sem treino NÃO quebram o streak se `weekly_activity_goal ≤ 5`. |
| **RN-CRP-20** | Consulta → Agenda | Consulta agendada cria evento automático na Agenda se integração ativa. |
| **RN-CRP-21** | Consulta → Finanças | Custo de consulta cria transação na categoria "Saúde" se integração ativa. |
| **RN-CRP-22** | Peso/Atividade → Futuro | Registros de peso e atividades atualizam progresso de metas vinculadas no módulo Futuro. |
| **RN-CRP-23** | Especialidades fixas | 14 especialidades pré-definidas no MVP. Categoria "Outro" para demais. |
| **RN-CRP-24** | Nutrição simplificada | Registro por refeição (não por ingrediente). Calorias e macros são estimativas manuais. Sem banco de dados de alimentos no MVP. |
| **RN-CRP-25** | Dados de medidas opcionais | Gordura%, massa muscular, cintura, quadril são todos opcionais. Apenas peso é "recomendado" para funcionamento do módulo. |

---

## 15. MODELO DE DADOS

### 15.1 Tabelas do Módulo

```sql
-- health_profiles: Perfil de saúde do usuário (1:1 com profiles)
health_profiles (
    id UUID PK,
    user_id UUID FK → profiles (UNIQUE),
    biological_sex TEXT CHECK ('male', 'female'),
    birth_date DATE,
    height_cm DECIMAL(5,1),
    activity_level TEXT DEFAULT 'moderate' CHECK ('sedentary','light','moderate','very_active','extreme'),
    weight_goal TEXT DEFAULT 'maintain' CHECK ('lose','maintain','gain'),
    target_weight DECIMAL(5,1),
    weekly_activity_goal INTEGER DEFAULT 4,
    daily_water_goal_ml INTEGER,
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- weight_entries: Registros de peso e medidas
weight_entries (
    id UUID PK,
    user_id UUID FK → profiles,
    weight DECIMAL(5,1) NOT NULL,
    body_fat_pct DECIMAL(4,1),
    muscle_mass_kg DECIMAL(5,1),
    waist_cm DECIMAL(5,1),
    hip_cm DECIMAL(5,1),
    notes TEXT,
    recorded_at DATE NOT NULL,
    created_at TIMESTAMP,
    UNIQUE(user_id, recorded_at) -- 1 registro por dia
)

-- activities: Atividades físicas
activities (
    id UUID PK,
    user_id UUID FK → profiles,
    type TEXT NOT NULL, -- walking, running, weightlifting, cycling, swimming, yoga, soccer, basketball, dance, other
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    steps INTEGER,
    intensity INTEGER DEFAULT 3 CHECK (1-5),
    calories_burned DECIMAL(8,2),
    met_value DECIMAL(4,1),
    notes TEXT,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP
)

-- medical_appointments: Consultas médicas
medical_appointments (
    id UUID PK,
    user_id UUID FK → profiles,
    specialty TEXT NOT NULL,
    doctor_name TEXT,
    location TEXT,
    appointment_date TIMESTAMP NOT NULL,
    cost DECIMAL(10,2),
    notes TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK ('scheduled','completed','cancelled'),
    follow_up_months INTEGER,
    follow_up_status TEXT CHECK ('pending','scheduled','overdue'),
    follow_up_reminder_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- meals: Refeições diárias
meals (
    id UUID PK,
    user_id UUID FK → profiles,
    meal_type TEXT NOT NULL CHECK ('breakfast','lunch','snack','dinner'),
    description TEXT,
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(6,1),
    carbs_g DECIMAL(6,1),
    fat_g DECIMAL(6,1),
    meal_time TIME,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP
)

-- daily_water_intake: Hidratação diária
daily_water_intake (
    id UUID PK,
    user_id UUID FK → profiles,
    amount_ml INTEGER NOT NULL DEFAULT 0,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, recorded_date)
)

-- daily_steps: Passos diários (import de wearable futuro)
daily_steps (
    id UUID PK,
    user_id UUID FK → profiles,
    steps INTEGER NOT NULL,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP,
    UNIQUE(user_id, recorded_date)
)
```

### 15.2 Índices Recomendados

```sql
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, recorded_at DESC);
CREATE INDEX idx_activities_user_date ON activities(user_id, recorded_at DESC);
CREATE INDEX idx_activities_user_type ON activities(user_id, type);
CREATE INDEX idx_medical_appointments_user_status ON medical_appointments(user_id, status);
CREATE INDEX idx_medical_appointments_date ON medical_appointments(user_id, appointment_date);
CREATE INDEX idx_meals_user_date ON meals(user_id, recorded_date);
CREATE INDEX idx_daily_water_user_date ON daily_water_intake(user_id, recorded_date);
```

---

## 16. LIFE SYNC SCORE — COMPONENTE CORPO

### 16.1 Peso no Score Geral

O módulo Corpo contribui com **15%** do Life Sync Score total.

### 16.2 Fórmula

```
Corpo Score = (
    (atividades_semana / meta_semanal) × 0.30 +
    (consultas_em_dia) × 0.30 +
    (registro_peso_atualizado) × 0.20 +
    (hidratacao_media / meta_hidratacao) × 0.20
) × 100

Onde:
- atividades_semana: count de activities na semana corrente
- meta_semanal: health_profiles.weekly_activity_goal (padrão 4)
- consultas_em_dia: 1.0 se nenhum follow_up está overdue, 0.5 se 1 overdue, 0.0 se 2+ overdue
- registro_peso_atualizado: 1.0 se último peso ≤ 7 dias, 0.5 se ≤ 30 dias, 0.0 se > 30 dias
- hidratacao_media: média de daily_water_intake dos últimos 7 dias
- meta_hidratacao: health_profiles.daily_water_goal_ml

Limitado a 100 (teto)
```

### 16.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Corpo negligenciado — sem atividade, consultas atrasadas, sem tracking |
| 21-40 | Início — alguma atividade esporádica, tracking irregular |
| 41-60 | Regular — mantendo ritmo mínimo de exercício e tracking |
| 61-80 | Bom — consistente em atividades, consultas em dia, hidratação |
| 81-100 | Excelente — disciplina completa, todos os indicadores no verde |

---

## 17. INSIGHTS E SUGESTÕES ADICIONAIS

### 17.1 Funcionalidades que agregam valor para futuras versões

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Foto da refeição → IA estima calorias** | Usuário fotografa o prato, IA (Vision API) identifica alimentos e estima calorias + macros automaticamente. Similar ao MyFitnessPal Meal Scan. | Reduz drasticamente a fricção de registro nutricional. É a feature #1 que faria o SyncLife competir diretamente com MFP. | Alta — pós-MVP |
| **Integração Apple Health / Google Health Connect** | Importar automaticamente passos, frequência cardíaca, sono, e atividades registradas em wearables. O SyncLife vira o "significado" dos dados, não o coletor. | Elimina entrada manual para quem tem wearable. Samsung Health e Apple Health dominam o hardware — SyncLife domina o significado. | Alta — pós-MVP |
| **Banco de dados de alimentos (API externa)** | Integrar com Nutritionix API ou USDA FoodData Central para lookup de alimentos com dados nutricionais precisos. | Transforma o tracking nutricional de "estimativa" para "preciso". Fundamental se quiser competir com Cronometer. | Média — v2 |
| **Treinos estruturados (séries × repetições)** | Para musculação, permitir registrar exercícios com séries, repetições e carga. Progressão de força ao longo do tempo. Garmin e Strong fazem isso bem. | Atrai público de academia que hoje usa Strong ou Hevy. É feature de engajamento diário para esse público. | Média — v2 |
| **Recorrência de atividades** | "Treinar musculação toda segunda, quarta e sexta" — cria lembretes automáticos e marca como "não feito" se o dia passar. | Aumenta consistência. O comportamento é padrão em habit trackers. | Média — pós-MVP |
| **Score de saúde preventiva** | Dashboard visual mostrando quais especialidades estão "em dia" (verde), "próximo do vencimento" (amarelo), "atrasado" (vermelho). Tipo um "placar de check-ups". | Feature diferenciadora que nenhum app fitness tem. Posiciona o SyncLife como "saúde completa", não apenas fitness. | Alta — pós-MVP |
| **Export PDF de histórico médico** | Gerar PDF com histórico de consultas, medidas, atividades para levar ao médico. Similar ao CareClinic doctor visit prep. | Valor percebido alto para PRO. Funcionalidade "wow" que gera compartilhamento. | Baixa — v3 |
| **Modo jejum intermitente** | Timer de jejum (16:8, 20:4, OMAD) com tracking de janelas alimentares. Funcionalidade presente no MyFitnessPal Premium e YAZIO. | Feature popular no público fitness. Relativamente simples de implementar sobre o tracker de refeições. | Baixa — pós-MVP |

### 17.2 Críticas e Pontos de Atenção ao Protótipo Atual

**1. Protótipo tem apenas 5 telas — faltam telas essenciais**
O protótipo atual cobre Dashboard, Evolução, Consultas, Atividades e Nutrição, mas com height fixa de 812px causando scroll interno. O novo protótipo v3 deve ter **altura automática** e incluir telas de CRUD (registrar atividade, registrar peso, agendar consulta, registrar refeição).

**2. Navegação usa pills ao invés de underline tabs**
O protótipo atual usa `.module-tab` com `border-radius:20px` (pills). O padrão aprovado (como no Futuro e Mente) é **underline tabs**. Deve ser corrigido no v3.

**3. Falta tela do Coach IA**
A 6ª tab "Coach IA" (definida em `modules.ts`) não está prototipada. É uma feature exclusiva PRO, mas precisa de protótipo para o preview borrado e para o conteúdo completo.

**4. Falta tela de Perfil de Saúde (configuração)**
A configuração de peso, altura, sexo biológico, nível de atividade, e metas é fundamental para TMB/TDEE. Precisa de tela L2 dedicada acessível via ícone ⚙️ no Dashboard.

**5. Falta estados vazios (empty states)**
Nenhuma tela tem empty state prototipado. Essencial para primeira visita do usuário (sem dados).

**6. Hidratação não aparece no protótipo**
O tracker de hidratação (presente no KPI do Dashboard) não tem interação prototipada. Precisa de botões rápidos (+250ml, +500ml).

**7. Falta modal de registro de refeição**
A tela de Nutrição mostra refeições, mas não prototipa o fluxo de adicionar uma refeição.

### 17.3 Recomendação de Telas Adicionais para Prototipagem

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 07 | Registrar Atividade (Modal/Sheet) | 🔴 Alta | Fluxo principal de entrada de dados — sem isso o módulo não funciona |
| 08 | Registrar Peso/Medida (Modal) | 🔴 Alta | Segundo fluxo mais importante — tracking semanal |
| 09 | Perfil de Saúde (Configuração) | 🔴 Alta | TMB/TDEE dependem disso, é pré-requisito |
| 10 | Registrar Refeição (Modal) | 🟡 Média | Fluxo de nutrição |
| 11 | Agendar Consulta (Form) | 🟡 Média | CRUD de consultas médicas |
| 12 | Coach IA (Tela completa) | 🟡 Média | Feature diferenciadora PRO |
| 13 | Detalhe de Consulta | 🟡 Média | Onde o usuário edita notas, custo, status |
| 14 | Celebração (Meta de peso atingida) | 🟢 Baixa (Jornada) | Momento de dopamina |
| 15 | Empty States | 🟢 Baixa | Cada tela sem dados precisa de um visual |

---

*Documento criado em: 07/03/2026*  
*Versão: 1.0 — Especificação Funcional Completa*  
*Protótipo base: `proto-mobile-corpo.html`*  
*Referências: use-corpo.ts, modules.ts, DOC-FUNCIONAL-FUTURO-COMPLETO.md, SPEC-FUNCIONAL-MENTE.md*  
*Próximo passo: Gerar protótipo v3 (12+ telas) e prompt para Claude Code*
