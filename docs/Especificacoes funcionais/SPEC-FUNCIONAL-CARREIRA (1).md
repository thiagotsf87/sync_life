# 💼 Especificação Funcional — Módulo Carreira

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Carreira — Profissão e Crescimento  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#f43f5e` (Rose)  
> **Ícone Lucide:** `Briefcase`  
> **Subtítulo descritivo:** "Profissão e crescimento"  
> **Pergunta norteadora:** "Como está minha Carreira?"
>
> ✅ **COR CONFIRMADA:** `#f43f5e` (Rose). Protótipos anteriores usavam `#ec4899` — esta cor foi atualizada para `#f43f5e` conforme definição final. Atualizar `web/src/lib/modules.ts` se necessário.
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Perfil Profissional](#6-tela-02--perfil-profissional)
7. [Tela 03 — Roadmap de Carreira](#7-tela-03--roadmap-de-carreira)
8. [Tela 04 — Mapa de Habilidades](#8-tela-04--mapa-de-habilidades)
9. [Tela 05 — Histórico Salarial e Promoções](#9-tela-05--histórico-salarial-e-promoções)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações com Outros Módulos](#11-integrações-com-outros-módulos)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Componente Carreira](#15-life-sync-score)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Carreira

O módulo Carreira é o **centro de gestão profissional e crescimento de carreira** do SyncLife. Ele transforma a progressão profissional — algo que a maioria das pessoas acompanha de forma abstrata na cabeça — em um sistema visual, mensurável e conectado com todas as outras dimensões da vida.

Não é um LinkedIn resumido nem um currículo digital. É a ferramenta que responde à pergunta **"Como está minha Carreira?"** de forma quantificável: qual meu cargo atual, quais habilidades tenho e preciso desenvolver, qual minha evolução salarial, e — o mais importante — **como tudo isso se conecta com meus estudos (Mente), meus objetivos de vida (Futuro) e minhas finanças (Finanças).**

A Carreira é onde o esforço de estudo vira progressão real, onde promoções viram impacto financeiro, e onde o usuário entende que investir em si mesmo tem retorno mensurável.

### 1.2 Por que este módulo existe

No mercado atual, o profissional usa o LinkedIn para perfil público, o Glassdoor para pesquisar salários, o Levels.fyi para comparar remuneração de tech, planilhas no Google Sheets para acompanhar habilidades, e o Notion para PDIs (Planos de Desenvolvimento Individual). Nenhuma dessas ferramentas responde à pergunta: **"se eu completar minha trilha de React no módulo Mente, isso me coloca mais perto da promoção a Sênior, que me dá um aumento de R$ 4.800/mês, que acelera minha reserva de emergência no módulo Finanças?"**

O SyncLife Carreira faz exatamente isso. Ele conecta **habilidade → posição → salário → impacto financeiro → objetivos de vida** em um fluxo contínuo e automatizado.

### 1.3 Proposta de valor única

O módulo Carreira não compete com o LinkedIn em networking nem com o Glassdoor em reviews de empresa. Ele compete na **camada de integração pessoal**: cada habilidade desenvolvida pode ser vinculada a uma trilha de estudo (Mente), cada promoção registrada atualiza a receita mensal (Finanças), cada milestone do roadmap pode ser uma meta em um Objetivo de vida (Futuro), e cada conquista é celebrada com XP e badges (Jornada).

A tese é simples: **sua carreira não existe isolada do resto da sua vida.** Estudar impacta carreira, carreira impacta salário, salário impacta finanças, finanças impactam objetivos. O SyncLife torna essa cadeia visível e gerenciável.

### 1.4 As 5 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Visão geral: cargo, KPIs, próximo milestone, ações rápidas | Semanal |
| 02 | Perfil Profissional | Bio, experiência, formação, certificações, links | Episódica (ao atualizar) |
| 03 | Roadmap de Carreira | Timeline visual: posição atual → próximo cargo → visão de longo prazo | Semanal |
| 04 | Mapa de Habilidades | Skills técnicas, soft skills e idiomas com proficiência | Semanal |
| 05 | Histórico Salarial e Promoções | Evolução salarial, timeline de promoções, métricas de crescimento | Mensal |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **LinkedIn** | Maior rede profissional do mundo, perfil público, networking, vagas, LinkedIn Learning integrado | Sem tracking privado de habilidades, sem roadmap pessoal, sem histórico salarial pessoal, sem conexão com finanças | Free / Premium ~R$ 120/mês |
| **Levels.fyi** | Base de dados salarial por nível (IC1-IC7), comparação entre empresas, negociação de ofertas, transparência de comp | Foco em tech/EUA, sem tracking pessoal de carreira, sem skills, sem roadmap pessoal | Free / Paid negociação |
| **Glassdoor** | Reviews de empresas, salários por cargo/localidade, entrevistas, comparações | Dados agregados (não tracking pessoal), sem roadmap, sem habilidades, sem integração com aprendizado | Gratuito |
| **Teal (tealhq.com)** | Job tracker com Kanban, career goal tracker com cargo-alvo e data-meta, AI resume builder | Focado em busca de emprego e não em desenvolvimento contínuo, sem histórico salarial pessoal, sem skills mapping | Free / Pro $29/mês |
| **Huntr** | AI Resume Builder, Job Tracker com analytics de aplicações, extensão para autofill | Focado apenas em job search, sem tracking de habilidades, sem roadmap de carreira de longo prazo | Free / $40/mês |
| **Kickresume Career Map** | AI que analisa currículo e sugere career paths com salários e skills necessários | Não é tracking pessoal, é ferramenta one-shot, sem progresso ao longo do tempo | Freemium |
| **Career.io Career Pathways** | Explorar paths para 12K+ cargos, salários, skill gaps, dados de demanda | Ferramenta de exploração e não de acompanhamento pessoal, sem tracking de evolução salarial | Pago (parte do ecossistema) |
| **Notion (uso manual)** | Flexibilidade total para organizar PDIs, OKRs, skills | Sem cálculos automáticos, sem integração com finanças/estudos, requer setup manual extenso | Free / $10+/mês |
| **Fuel50** | Career pathing com IA, skills ontology dinâmica, talent marketplace, analytics poderosos | Enterprise-only (não individual), caro, complexo, focado em RH corporativo | Enterprise ($$$$) |
| **Lattice Grow** | Performance reviews, goal setting, career tracks dentro de empresas | Enterprise HR tool, não para uso pessoal individual, sem histórico salarial | Enterprise ($11+/user/mês) |

### 2.2 Diferenciais Competitivos do SyncLife Carreira

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Habilidade ↔ Trilha de Estudo (Mente)** | Cada habilidade pode ser vinculada a uma trilha de estudo. Ao completar a trilha, a proficiência da skill avança automaticamente. | Ninguém (apps de career pathing enterprise fazem parcialmente, mas sem integração com aprendizado pessoal) |
| **Promoção → Receita (Finanças)** | Registrar uma promoção com novo salário pode atualizar automaticamente a receita recorrente no módulo Finanças | Ninguém |
| **Roadmap → Objetivo (Futuro)** | O próximo milestone do roadmap pode ser uma meta dentro de um Objetivo no módulo Futuro, com progresso bidirecional | Ninguém |
| **Simulador de Promoção** | No modo Jornada, o usuário simula o impacto financeiro de uma promoção: ganho anual, impacto no patrimônio, % de aumento | Levels.fyi (parcial — mostra salários, mas não simula impacto pessoal) |
| **Coach IA de Carreira** | A IA analisa o gap de habilidades entre a posição atual e a desejada e sugere ações concretas: "complete Node.js avançado para desbloquear Sênior" | Fuel50 (enterprise), Career.io (parcial) |
| **Histórico salarial pessoal** | Timeline completa de evolução salarial com gráfico, métricas de crescimento médio, projeções | Ninguém oferece tracking pessoal privado |
| **Experiência unificada** | Narrativa "Jornada do Herói", XP profissional, coach gamificado, radar chart | Ninguém |

### 2.3 O que aprendemos com o benchmark

**Do LinkedIn:** O perfil profissional com experiência e formação é um padrão consolidado. O SyncLife absorve essa estrutura como tela de Perfil, mas adiciona uma camada que o LinkedIn não oferece: tracking privado de evolução e conexão com outras dimensões de vida.

**Do Levels.fyi:** Transparência salarial por nível é poderosa. O SyncLife adapta isso para uso pessoal: em vez de comparar com outros, o usuário compara consigo mesmo ao longo do tempo ("cresci 156% em 5 anos"). A projeção salarial do próximo nível é inspirada no Levels, mas personalizada.

**Do Teal:** A ideia de "career goal tracker" com cargo-alvo, salário desejado e data-meta é exatamente o que o roadmap do SyncLife faz, mas o SyncLife vai além: conecta o goal com habilidades reais, trilhas de estudo e impacto financeiro.

**Do Fuel50:** Skills ontology dinâmica e AI-powered career pathing são o estado da arte em enterprise. O SyncLife traduz esse conceito para uso pessoal: o usuário mapeia suas habilidades, vincula a trilhas, e o sistema sugere gaps baseado no roadmap.

**Do Glassdoor:** Dados salariais por cargo e localidade são essenciais para projeções. No futuro, o SyncLife pode integrar dados públicos de mercado para enriquecer as projeções do simulador de promoção.

**Insight fundamental do benchmark:** Todas as ferramentas de carreira no mercado são ou enterprise (focadas em RH) ou fragmentadas (focadas em job search). **Nenhuma oferece um sistema pessoal integrado de gestão de carreira que conecta habilidades → estudos → salário → finanças → objetivos de vida.** Este é o gap que o SyncLife preenche.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                    💼 CARREIRA — NAVEGAÇÃO PRINCIPAL                    │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Perfil │ Roadmap │ Habilidades │ Histórico              │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
  │01       │ │02      │ │03      │ │04        │ │05        │
  │DASHBOARD│ │PERFIL  │ │ROADMAP │ │HABILIDA  │ │HISTÓRICO │
  │         │ │Prof.   │ │Carreira│ │DES       │ │Salarial  │
  └────┬────┘ └───┬────┘ └───┬────┘ └────┬─────┘ └────┬─────┘
       │          │          │           │             │
       │          ▼          │           ▼             ▼
       │         08          │          06            07
       │        EDITAR       │        ADICIONAR     REGISTRAR
       │        PERFIL       │        HABILIDADE    PROMOÇÃO
       │                     │           │             │
       │                     │           │             │ (ao salvar)
       │                     │           │             ▼
       │                     │           │            09
       │                     │           │          CELEBRAÇÃO
       │                     │           │          Promoção
       │                     │           │
       └── Quick actions ────┘           │
           (Perfil, Roadmap,             │
            Habilidades,                 │
            Histórico)                   └── Vincular Trilha (→ Mente)
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Perfil Profissional | Sub-nav "Perfil" | — |
| **L1** | 03 Roadmap de Carreira | Sub-nav "Roadmap" | — |
| **L1** | 04 Mapa de Habilidades | Sub-nav "Habilidades" | — |
| **L1** | 05 Histórico Salarial | Sub-nav "Histórico" | — |
| **L2** | 06 Adicionar Habilidade | Botão "+" no header (04) | ✕ Fecha (volta 04) |
| **L2** | 07 Registrar Promoção | Botão "+" no header (05) ou CTA Dashboard | ← Voltar (volta 05) |
| **L2** | 08 Editar Perfil | Ícone ✏️ no header (02) | ← Voltar (volta 02) |
| **L2** | 09 Celebração Promoção | Automático ao registrar promoção (Jornada) | Botão → Dashboard (01) |

### 3.3 Padrão de Navegação (idêntico ao módulo Futuro)

**Header do módulo:**
- Ícone do módulo (💼) + Nome ("Carreira") à esquerda
- Botões contextuais à direita (busca, adicionar)

**Sub-nav:**
- Tabs com underline (não pills)
- Tab ativa: texto branco/claro + underline 3px na cor do módulo (`#f43f5e`)
- Tabs inativas: texto cinza (`var(--t3)`), sem underline
- 5 tabs: Dashboard, Perfil, Roadmap, Habilidades, Histórico

**Telas internas (L2):**
- Header simplificado: botão voltar (←) + título centralizado + ação contextual (Cancelar)
- Sem sub-nav (pois está num nível abaixo)

---

## 4. MAPA DE FUNCIONALIDADES

### 4.1 Visão Geral por Tela

```
💼 CARREIRA
│
├── 📊 Dashboard
│   ├── Hero card do cargo atual (avatar, cargo, empresa, localidade)
│   ├── KPIs (salário atual, próxima revisão, habilidades, roadmap %)
│   ├── Próximo Milestone (card com progresso e skills pendentes)
│   ├── Insight IA (sugestão baseada em gap de skills)
│   ├── Quick Actions (grid 2×2: Perfil, Roadmap, Habilidades, Histórico)
│   ├── [Jornada] XP bar profissional com nível
│   ├── [Jornada] Coach Carreira com sugestão personalizada
│   └── [Jornada] Simulador de Promoção (impacto financeiro)
│
├── 👤 Perfil Profissional
│   ├── Card de perfil (avatar, nome, cargo, empresa, bio)
│   ├── Experiência profissional (lista de cargos, empresas, datas)
│   ├── Formação acadêmica (graduação, pós, certificações)
│   ├── Links profissionais (LinkedIn, GitHub, Portfolio, outros)
│   ├── Botão Editar (abre formulário de edição)
│   ├── [Jornada] "Herói em Evolução" com XP total, badges, streak
│   └── [Jornada] "Capítulos da Jornada" com XP por experiência
│
├── 🗺️ Roadmap de Carreira
│   ├── Indicador de posição atual ("Você está aqui: Desenvolvedor Pleno")
│   ├── Timeline vertical (cargos passados → atual → próximos → visão)
│   ├── Cada step: cargo, empresa, data, skills requeridas, status
│   ├── Skills por nível: ✓ dominada, ⟳ em desenvolvimento, ○ pendente
│   ├── [Jornada] "Jornada do Herói" com Atos e narrativa
│   ├── [Jornada] XP e badges por step concluído
│   └── [Jornada] Hero banner com progresso do "Ato" atual
│
├── ⭐ Mapa de Habilidades
│   ├── Filtros por categoria (Todas, Técnicas, Soft Skills, Idiomas)
│   ├── KPIs (total mapeadas, em desenvolvimento)
│   ├── Skills por categoria com barras de proficiência
│   ├── Cores por nível: verde (≥70%), amarelo (40-69%), vermelho (<40%)
│   ├── Link de integração com Mente (trilhas vinculadas)
│   ├── Adicionar habilidade (formulário: nome, categoria, nível, trilha, notas)
│   ├── [Jornada] Radar chart visual de habilidades
│   ├── [Jornada] Coach Skills com sugestão de gap prioritário
│   ├── [Jornada] XP por skill dominada
│   └── [PRO] Habilidades ilimitadas (FREE = 10)
│
└── 📜 Histórico Salarial e Promoções
    ├── Gráfico de evolução salarial (barras por ano)
    ├── Salário atual + crescimento total (%)
    ├── Lista de promoções (cargo, empresa, data, aumento %)
    ├── Métricas (tempo de carreira, total promoções, crescimento médio, projeção)
    ├── Registrar promoção (formulário: cargo, empresa, salário, data)
    ├── [Jornada] Hero "Sua Evolução" com salário inicial → atual
    ├── [Jornada] "Conquistas do Herói" com XP e badges por promoção
    └── [Jornada] Coach com projeção de crescimento futuro
```

---

## 5. TELA 01 — DASHBOARD

### 5.1 Objetivo

Fornecer uma **visão panorâmica** do estado profissional do usuário. Em 5 segundos, ele deve saber: qual seu cargo atual, quanto ganha, quão perto está da próxima promoção, e o que precisa fazer para avançar.

É a tela de entrada do módulo — tudo que aparece aqui é resumo. Os detalhes vivem nas sub-telas.

### 5.2 Componentes

#### 5.2.1 Hero Card do Cargo Atual

**Objetivo:** Contextualizar imediatamente quem é o usuário profissionalmente.

**Elementos visuais:**
- Avatar/emoji profissional (52×52px, border-radius 16px, fundo com glow da cor do módulo)
- Cargo atual em destaque (16px, bold, `var(--t1)`)
- Empresa + localidade (13px, `var(--t2)`)
- Badges contextuais: "3 anos nível" (verde), "⭐ Sênior em vista" (cor do módulo)

**Dados e fonte:**
- Cargo: `career_positions.title` onde `is_current = true`
- Empresa: `career_positions.company`
- Localidade: `career_positions.location`
- Tempo no nível: cálculo `now() - career_positions.start_date`

**Critérios de aceite:**
- Card renderiza com gradiente sutil da cor do módulo no background
- Se não há posição cadastrada, mostra empty state: "Configure seu cargo atual" com CTA
- Badge "X anos nível" é calculado automaticamente
- Badge contextual muda conforme progresso do roadmap: <50% = "Em desenvolvimento", ≥50% = "[Próximo cargo] em vista"

**Resultado esperado:** O usuário se identifica imediatamente: "sou Desenvolvedor Pleno na TechCorp".

#### 5.2.2 KPI Grid (2×2)

| KPI | Valor exemplo | Cor | Lógica de cálculo |
|-----|---------------|-----|-------------------|
| **Salário atual** | R$ 9.200 | `#f43f5e` (carreira) | `career_positions.salary` onde `is_current = true`. Sub-texto: "Meta sênior: R$ 14k" (salário do próximo step do roadmap) |
| **Próxima revisão** | Jun 2026 | `var(--t1)` | `career_profile.next_review_date`. Sub-texto: "X meses · PDI criado/pendente" |
| **Habilidades** | 14 | `var(--t1)` | Count de `career_skills`. Sub-texto: "X em desenvolvimento" (nível < 70%) |
| **Roadmap** | 55% | `#f59e0b` (yellow) | Progresso calculado do step atual do roadmap. Sub-texto: "Promoção a [próximo cargo]" |

**Critérios de aceite:**
- Os 4 KPIs carregam em até 2 segundos
- Cada KPI mostra label, valor principal, e sub-texto contextual
- Valores vazios mostram "—" (nunca fica em branco)
- Salário é formatado como moeda brasileira sem centavos
- Roadmap % é calculado: skills dominadas do próximo step / total de skills requeridas

**Resultado esperado:** O usuário vê seus 4 indicadores-chave profissionais sem precisar scrollar.

#### 5.2.3 Próximo Milestone

**Objetivo:** Mostrar o objetivo de carreira mais imediato com progresso visual e skills pendentes.

**Elementos:**
- Título: "Promoção a Sênior" (título do próximo step do roadmap)
- Subtítulo: "Meta: Jun 2026 · Revisão anual"
- Badge: "55%" (progresso)
- Barra de progresso (8px, border-radius 4px, cor do módulo)
- Skills tags: ✓ dominadas (verde), ⟳ em desenvolvimento (cor do módulo), ○ pendentes (cinza)

**Dados e fonte:**
- Próximo step: `career_roadmap_steps` onde `status = 'next'`
- Skills: `career_roadmap_step_skills` vinculadas ao step, com JOIN em `career_skills` para proficiência
- Status da skill: ≥70% = dominada (✓), 40-69% = em desenvolvimento (⟳), <40% = pendente (○)

**Critérios de aceite:**
- Mostra apenas o próximo step do roadmap (não todos)
- Skills são chips coloridos: verde para dominadas, cor do módulo para em desenvolvimento, cinza para pendentes
- Barra de progresso reflete o % de skills dominadas vs total requeridas
- Card é clicável e navega para a tela de Roadmap

**Resultado esperado:** O usuário sabe exatamente o que falta para a próxima promoção.

#### 5.2.4 Insight IA

**Objetivo:** Sugestão acionável baseada nos dados de carreira, habilidades e módulo Mente.

**Componente visual:**
- Card com fundo azulado sutil (diferente dos cards normais)
- Ícone 🤖
- Texto em formato de dica personalizada

**Exemplos de insights:**
- "Sua trilha de React (Mente) está alinhada com o que o mercado exige para sênior. Complete em Março para chegar à revisão de Jun com a skill validada. Chance +40%."
- "Sua habilidade de Arquitetura está em 32%. É o maior gap para Sênior. Crie uma trilha no módulo Mente para acelerar."
- "Sua revisão salarial é em 3 meses. 3 de 4 skills para Sênior estão dominadas. Foque em Node.js Avançado."
- "Você está no mesmo nível há 3 anos. A média do mercado para promoção de Pleno a Sênior é 2-3 anos."

**Lógica de geração (regras por prioridade):**
1. Se próxima revisão está em < 3 meses → alerta com skills pendentes
2. Se há skill vinculada a trilha do Mente → incentivo para completar trilha
3. Se há skill com proficiência < 40% requerida pelo próximo step → alerta de gap
4. Se tempo no nível atual > média do mercado → incentivo a agir
5. Fallback: dica genérica sobre desenvolvimento profissional

**Critérios de aceite:**
- O insight muda com base nos dados do usuário (não é estático)
- O texto referencia dados reais: nomes de skills, percentuais, datas
- Se não há dados suficientes, mostra dica genérica
- Visível em ambos os modos (Foco e Jornada), mas no modo Jornada o card tem design "Coach" mais elaborado

**Resultado esperado:** O usuário sente que o app entende sua situação profissional e está ativamente ajudando.

#### 5.2.5 Quick Actions (Grid 2×2)

**Objetivo:** Atalhos de um toque para as sub-telas mais importantes.

**4 cards:**
- 👤 Perfil → navega para tela 02
- 🗺️ Roadmap → navega para tela 03
- ⭐ Habilidades → navega para tela 04
- 📜 Histórico → navega para tela 05

**Cada card:**
- Barra superior colorida (2px × 24px) na cor contextual
- Ícone + nome da seção
- Background `var(--s1)`, border `var(--border)`

**Critérios de aceite:**
- Todos os 4 cards são clicáveis e navegam para a tela correta
- Design compacto, sem texto excessivo

#### 5.2.6 [Jornada] XP Bar Profissional

**Objetivo:** Gamificar o progresso profissional com sistema de XP e níveis.

**Elementos:**
- Badge de nível: "Nível 6" com gradiente car/roxo
- Nome do nível: "Profissional Estratégico"
- Streak de dias: "🔥 28 dias"
- Barra de XP (5px, gradiente car→roxo)
- Texto: "720 / 1000 XP → Nível 7"

**Níveis de XP profissional:**
| Nível | Nome | XP necessário |
|-------|------|---------------|
| 1 | Noviço | 0 |
| 2 | Iniciante | 100 |
| 3 | Aprendiz | 250 |
| 4 | Praticante | 450 |
| 5 | Profissional | 700 |
| 6 | Profissional Estratégico | 1000 |
| 7 | Especialista | 1400 |
| 8 | Referência | 1900 |
| 9 | Mestre | 2500 |
| 10 | Lenda | 3200 |

**Critérios de aceite:**
- Sempre visível
- XP acumula por ações: adicionar habilidade, dominar skill, registrar promoção, completar roadmap step
- Nível sobe automaticamente quando XP atinge threshold

#### 5.2.7 [Jornada] Coach Carreira

**Objetivo:** Versão gamificada do insight IA, com narrativa de mentoria.

**Elementos:**
- Avatar circular com gradiente car/roxo (36px)
- Label: "COACH CARREIRA" (10px, uppercase, roxo)
- Texto personalizado com dados reais em bold
- CTA: "Ver simulador de promoção →"

**Exemplo:** "Você está a **2 habilidades** de Tech Lead. Complete **Node.js Avançado** e **Arquitetura** para desbloquear o próximo nível. Seu salário pode subir **52%**!"

**Critérios de aceite:**
- Sempre visível
- O texto usa nomes reais de skills e percentuais calculados
- O CTA navega para o Simulador de Promoção

#### 5.2.8 [Jornada] Simulador de Promoção

**Objetivo:** Mostrar o impacto financeiro concreto da próxima promoção, criando motivação tangível.

**Elementos:**
- Label: "💰 IMPACTO FINANCEIRO — [Próximo Cargo]"
- Comparação visual: Salário atual → Projeção (seta →)
- Grid 2 colunas: "Ganho anual: +R$ 57.600" | "Impacto Patrimônio: +R$ 4.800/mês"
- [Jornada] Texto de XP: "Promoção vale +100 XP + badge"

**Cálculo:**
- Ganho mensal: `salary_próximo_step - salary_atual`
- Ganho anual: `ganho_mensal × 12`
- % aumento: `(salary_próximo_step / salary_atual - 1) × 100`

**Critérios de aceite:**
- Sempre visível
- Valores são calculados a partir do roadmap
- Se o próximo step não tem salário definido, não mostra o simulador
- Formatação em moeda brasileira

**Resultado esperado:** O usuário vê o "preço" de não evoluir e se motiva a agir.

---

## 6. TELA 02 — PERFIL PROFISSIONAL

### 6.1 Objetivo

Centralizar todas as informações profissionais do usuário em um formato organizado e editável. É o "mini-currículo privado" que o usuário mantém atualizado para si mesmo — não para o mercado, mas para ter clareza sobre seu histórico.

### 6.2 Componentes

#### 6.2.1 Card de Perfil Principal

**Elementos:**
- Avatar (64×64px, border-radius 20px, borda com cor do módulo)
- Nome completo (17px, bold)
- Cargo + especialidade (13px, cor do módulo): "Dev Pleno · Full Stack"
- Empresa + localidade (12px, `var(--t2)`)
- Bio descritiva (13px, `var(--t2)`, max 280 chars)
- [Jornada] Label "✦ HERÓI EM EVOLUÇÃO", XP total, badges conquistados, streak

**Dados:** `career_profile` + `career_positions` (current)

**Critérios de aceite:**
- Card tem gradiente sutil da cor do módulo
- Bio é truncada em 280 chars com "..."
- Se avatar não configurado, mostra emoji profissional padrão (👨‍💻 / 👩‍💻)
- Botão de editar (✏️) no header

#### 6.2.2 Seção Experiência

**Lista de posições profissionais (mais recente primeiro):**
- Ícone 💼 (cor do módulo para atual, cinza para anteriores)
- Cargo
- Empresa · Especialidade · Período (ex: "Mar 2022 → atual")
- Badge "Atual" (cor do módulo) para posição current
- [Jornada] "Capítulo X" com XP ganho no período

**Dados:** `career_positions` ordenado por `start_date DESC`

**Critérios de aceite:**
- Posição atual sempre aparece primeiro com badge "Atual"
- Períodos calculados automaticamente: "X anos e Y meses"
- Se só tem 1 posição, não mostra separador

#### 6.2.3 Seção Formação

**Lista de formações acadêmicas e certificações:**
- Ícone 🎓 (graduação) ou 📜 (certificação)
- Título do curso/certificação
- Instituição · Tipo · Período
- Badge: "Concluído" (verde), "Em andamento" (amarelo), "Válida" (azul para certs)
- [Jornada] XP por formação concluída

**Dados:** `career_education`

#### 6.2.4 Seção Links Profissionais

**Lista de links externos:**
- Ícone contextual: 💼 LinkedIn, 🐙 GitHub, 🌐 Portfolio, 📎 Outro
- Nome da plataforma
- URL (truncada)
- Cada link é clicável e abre em nova aba

**Dados:** `career_links`

**Critérios de aceite:**
- Máximo de 5 links
- URLs são validadas no momento do cadastro

---

## 7. TELA 03 — ROADMAP DE CARREIRA

### 7.1 Objetivo

Visualizar a trajetória profissional do usuário como uma **timeline vertical** que vai do primeiro cargo até a visão de longo prazo. É onde o usuário enxerga: "onde estou, onde quero chegar, e o que precisa acontecer no meio do caminho".

### 7.2 Conceito de Roadmap

O roadmap é uma sequência de steps (etapas/cargos) que representam a jornada profissional:

Cada step tem:
- Título do cargo (obrigatório)
- Empresa (opcional — pode ser genérico "Mercado")
- Data de início e fim (para steps concluídos)
- Data-meta (para steps futuros)
- Faixa salarial (opcional — para projeções)
- Status: concluído, atual, próximo, futuro, visão
- Skills requeridas (lista de `career_skills` vinculadas)

### 7.3 Componentes

#### 7.3.1 Indicador de Posição Atual

**Card com fundo sutil da cor do módulo:**
- Dot pulsante (10px, cor do módulo com glow)
- Texto: "Você está aqui: [Cargo Atual]"

**Critérios de aceite:**
- Mostra sempre o cargo do step com status 'current'
- Se não há roadmap, mostra CTA: "Monte seu roadmap profissional"

#### 7.3.2 Timeline Vertical

**Para cada step do roadmap:**

| Status | Visual |
|--------|--------|
| **Concluído** | Dot verde com ✓, linha verde, textos verdes |
| **Atual** | Dot cor do módulo com glow + dot branco interno, barra de progresso, linha semi-transparente |
| **Próximo** | Dot com número, borda cor do módulo, skills tags coloridas |
| **Futuro** | Dot com número, borda cinza |
| **Visão** | Dot com 🌟, borda tracejada amarela |

**Para o step ATUAL:**
- Nome do cargo (bold, cor do módulo)
- Período: "Mar 2022 → presente"
- Badge "Atual"
- Barra de progresso: "55% do critério para próximo nível"
- Progresso = (skills requeridas pelo próximo step que estão ≥70%) / (total skills requeridas)

**Para o step PRÓXIMO:**
- Nome do cargo
- Data-meta + faixa salarial (se informada)
- Skills tags: ✓ dominada (verde), ⟳ em desenvolvimento (cor módulo), ○ pendente (cinza)

**Critérios de aceite:**
- Timeline renderiza de cima para baixo (mais antigo → mais recente → futuro)
- Dot do step atual tem glow/shadow para destaque
- Linha entre steps concluídos é sólida, entre atuais e futuros é mais fraca
- Skills tags são clicáveis e navegam para detalhe da skill
- [Jornada] Steps se tornam "Atos" da Jornada do Herói com XP por etapa

**Resultado esperado:** O usuário vê sua carreira como um percurso visual e sabe exatamente onde está e o que falta.

#### 7.3.3 [Jornada] Hero Banner "Jornada do Herói"

**Card com gradiente roxo/car no topo:**
- Label: "✦ JORNADA DO HERÓI — ATO X"
- Título: "De [Cargo Atual] a [Próximo Cargo]"
- Texto: "Você completou X% do caminho · Faltam Y skills"
- Barra de progresso grossa (10px) com gradiente car→roxo
- XP acumulado no ato

**Critérios de aceite:**
- Sempre visível
- "Ato" é o nome gamificado do step atual
- Progresso é o mesmo do indicador do step atual

---

## 8. TELA 04 — MAPA DE HABILIDADES

### 8.1 Objetivo

Mapear todas as habilidades profissionais do usuário, categorizadas, com nível de proficiência mensurável. É onde o gap analysis acontece: o usuário vê o que sabe, o que precisa aprender, e pode vincular cada skill a uma trilha de estudo no módulo Mente.

### 8.2 Conceito de Habilidade (Skill)

Uma habilidade tem:
- Nome (obrigatório, ex: "React", "Liderança", "Inglês")
- Categoria (obrigatório: hard_skill, soft_skill, idioma, certificação)
- Nível de proficiência (1-5 ou 0-100%)
- Trilha vinculada (opcional — `linked_track_id` para trilha do módulo Mente)
- Status: em desenvolvimento, dominada
- Notas livres

**Escala de proficiência:**

| Nível | Nome (Foco) | Nome (Jornada) | % equivalente |
|-------|-------------|----------------|---------------|
| 1 | Iniciante | Noviço | 0-20% |
| 2 | Básico | Aprendiz | 21-40% |
| 3 | Intermediário | Guerreiro | 41-60% |
| 4 | Avançado | Mestre | 61-80% |
| 5 | Expert | Lenda | 81-100% |

**Cores por nível:**
- ≥70%: verde (`--green`)
- 40-69%: amarelo (`--yellow`)
- <40%: vermelho (`--red`)

### 8.3 Componentes

#### 8.3.1 Filtros por Categoria

**Pills horizontais scrolláveis:**
- Todas (default)
- Técnicas (hard_skill)
- Soft Skills (soft_skill)
- Idiomas (idioma)

**Critérios de aceite:**
- Pill ativa tem fundo da cor do módulo
- Contagem entre parênteses
- Filtro atualiza a lista sem recarregar

#### 8.3.2 KPIs (2 cards)

| KPI | Valor | Lógica |
|-----|-------|--------|
| **Total mapeadas** | 14 | Count total de `career_skills` do usuário. Sub: "X dominadas" (proficiência ≥70%) |
| **Em desenvolvimento** | 8 | Count de `career_skills` com proficiência <70%. Sub: "Vinculadas a trilhas" (com `linked_track_id`) |

#### 8.3.3 Barras de Proficiência por Categoria

**Para cada categoria, um card com:**
- Seção title (ex: "TÉCNICAS")
- Para cada skill: nome (100px) | barra horizontal (flex) | percentual (36px)
- Barra preenchida com cor por nível (verde/amarelo/vermelho)

**Critérios de aceite:**
- Skills ordenadas por proficiência (maior primeiro dentro de cada categoria)
- Barra tem animação suave de preenchimento
- Percentual usa DM Mono
- Toque em uma skill abre detalhe/edição

#### 8.3.4 Card de Integração com Mente

**Card com fundo roxo sutil:**
- Ícone 🧠
- Texto: "X habilidades vinculadas a Mente"
- Sub-texto: lista das skills com trilhas ativas
- Seta → (navegável para o módulo Mente)

**Critérios de aceite:**
- Mostra apenas se há pelo menos 1 skill com `linked_track_id`
- Clicável, navega para o módulo Mente

#### 8.3.5 [Jornada] Radar Chart

**Gráfico radar simplificado mostrando as top 6 skills:**
- Formato circular com 6 eixos
- Área preenchida com gradiente car/roxo
- Labels por skill nos vértices
- Texto abaixo: "Área forte: [categoria dominante] · Gap: [skills com menor %]"

**Critérios de aceite:**
- Sempre visível
- Seleciona as 6 skills com maior relevância (vinculadas ao roadmap ou maior proficiência)
- Se tem menos de 6 skills, mostra as que existem

#### 8.3.6 [Jornada] Coach Skills

**Card coach com sugestão de gap prioritário:**
- "Seu ponto forte é **Frontend** (88%). Para Sênior, invista em **Arquitetura** (32%) — trilha no Mente está disponível e vale **+15 XP**."
- CTA: "Iniciar trilha Arquitetura →"

---

## 9. TELA 05 — HISTÓRICO SALARIAL E PROMOÇÕES

### 9.1 Objetivo

Documentar a evolução salarial e profissional do usuário ao longo do tempo. É a tela que responde: **"quanto eu evoluí financeiramente na carreira? Qual meu crescimento médio? Se mantiver esse ritmo, onde chego?"**

### 9.2 Componentes

#### 9.2.1 Gráfico de Evolução Salarial

**Barras verticais por ano/período:**
- Cada barra representa o salário naquele período
- Barras passadas: cor do módulo com opacidade crescente
- Barra atual: cor sólida do módulo
- Eixo X: anos (2020, 2021, ..., 2025)
- Valores acima das barras no toque (tooltip)

**Header do gráfico:**
- Salário atual: R$ 9.200 (DM Mono, 22px, cor do módulo)
- Crescimento total: +156% (DM Mono, 18px, verde)

**Critérios de aceite:**
- Gráfico renderiza todas as posições registradas
- Se só tem 1 posição, mostra barra única
- Tooltip ao tocar: "2022: R$ 6.000"
- Escala dinâmica baseada no maior valor

#### 9.2.2 Lista de Promoções

**Timeline cronológica (mais recente primeiro):**
- Ícone 📈 (cor do módulo para atual, cinza para anteriores)
- Título: "[Cargo] → R$ [Salário]"
- Detalhes: "[Empresa] · [Data] · +X% aumento"
- Badge "Atual" para posição vigente

**Critérios de aceite:**
- Mostra todas as posições registradas
- O aumento % é calculado: `(salário_novo / salário_anterior - 1) × 100`
- Para a primeira posição (sem anterior), mostra apenas o valor

#### 9.2.3 Métricas de Carreira (KPI Grid 2×2)

| Métrica | Valor | Cálculo |
|---------|-------|---------|
| **Tempo de carreira** | 5 anos | `now() - career_positions.min(start_date)` |
| **Promoções** | 2 | Count de `career_positions` - 1. Sub: "Média: X anos/promoção" |
| **Crescimento médio** | +51% | Média dos % de aumento por promoção |
| **Projeção próximo nível** | R$ 14k | Salário do próximo step do roadmap. Sub: "+X% do atual" |

#### 9.2.4 [Jornada] Hero "Sua Evolução"

**Card com gradiente roxo/car:**
- Label: "✦ SUA EVOLUÇÃO"
- Visual: R$ 3.600 (tachado, cinza) → R$ 9.200 (grande, gradiente)
- Texto: "+156% em 5 anos · 2 promoções conquistadas"
- XP: "+480 XP totais de carreira · Próximo: +100 XP (Sênior)"

#### 9.2.5 [Jornada] Conquistas do Herói

**Lista de promoções como conquistas gamificadas:**
- Ícone 🏆
- "Promoção a [Cargo]"
- Detalhes + XP ganho + Badge desbloqueado

---

## 10. FLUXOS CRUD DETALHADOS

### 10.1 Habilidade (Skill)

#### CRIAR HABILIDADE

**Passo a passo do usuário:**
1. Na tela de Habilidades, toca no botão "+" no header
2. Abre formulário de criação (tela L2)
3. Preenche:
   - Nome da habilidade (obrigatório, ex: "Docker")
   - Categoria (obrigatório, seleção entre: Hard Skill, Soft Skill, Idioma, Certificação)
   - Nível de proficiência (1-5, seleção visual com cards)
   - Vincular trilha do Mente (opcional, dropdown com trilhas ativas)
   - Notas (opcional, texto livre)
4. Confirma → habilidade criada

**Validações:**
- Nome: obrigatório, 1-100 caracteres, não pode duplicar skill existente do mesmo usuário
- Categoria: obrigatório
- Nível: obrigatório, 1-5
- Limite FREE: se o usuário já tem 10 skills, não permite criar (mostra gate PRO)

**Integrações disparadas:**
- Se `linked_track_id` preenchido → vincula skill à trilha no Mente
- Se a skill está no `career_roadmap_step_skills` de algum step → recalcula progresso do roadmap
- [Jornada] +10 XP por adicionar habilidade, +5 XP bônus se vinculou trilha

#### EDITAR HABILIDADE

**Campos editáveis:**
- Nome, categoria, nível, trilha vinculada, notas
- NÃO pode editar: data de criação

**Passo a passo:**
1. Na tela de Habilidades, toca na barra de uma skill
2. Abre detalhe/edição da skill
3. Altera o que desejar
4. Confirma → dados atualizados

**Validações:** Mesmas da criação.

**Integrações disparadas ao mudar nível:**
- Se nível subiu para ≥4 (≥70%) → skill é considerada "dominada"
- Se skill está vinculada a trilha no Mente e a trilha está concluída → confirma proficiência
- Se skill é requerida por step do roadmap → recalcula progresso do step
- [Jornada] +15 XP ao dominar skill (nível ≥4), +30 XP se nível 5

#### EXCLUIR HABILIDADE

**Passo a passo:**
1. No detalhe da skill, toca em "Excluir"
2. Confirmação: "Excluir a habilidade '[nome]'? O vínculo com trilhas e roadmap será removido."
3. Ao confirmar: skill removida, referências em roadmap_step_skills removidas

### 10.2 Posição Profissional (Experiência)

#### CRIAR POSIÇÃO (via Perfil ou Registrar Promoção)

**Passo a passo:**
1. Na tela de Histórico, toca no botão "+" (Registrar Promoção)
2. Preenche:
   - Novo cargo (obrigatório)
   - Empresa (obrigatório)
   - Salário bruto (obrigatório, numérico)
   - Data de início (obrigatório)
   - Especialidade (opcional)
   - Localidade (opcional)
3. Se já existe posição "atual":
   - A posição anterior é encerrada (`end_date = data do novo cargo - 1 dia`, `is_current = false`)
   - Nova posição é marcada como `is_current = true`
4. Confirma → posição criada

**Validações:**
- Cargo: obrigatório, 1-100 chars
- Empresa: obrigatório, 1-100 chars
- Salário: obrigatório, ≥ 0
- Data: obrigatória, não pode ser no futuro

**Integrações disparadas:**
- Se integração `car_promo_financas` está ativa → atualiza receita recorrente no módulo Finanças
- Se novo cargo coincide com próximo step do roadmap → marca step como 'completed', avança 'current' para próximo
- [Jornada] XP variável: +50 XP para primeira posição, +80 XP para promoção simples, +100 XP para promoção que completa step do roadmap
- [Jornada] Badge desbloqueado: "Primeira Promoção", "Evolução", "Líder", etc.

#### EDITAR POSIÇÃO

**Campos editáveis:** cargo, empresa, salário, data de início, data de fim, especialidade, localidade
- NÃO pode editar: `is_current` diretamente (gerenciado pelo sistema)

#### EXCLUIR POSIÇÃO

**Passo a passo:**
1. Na tela de Perfil, swipe ou long press na posição
2. Confirmação: "Excluir esta posição? O histórico salarial será recalculado."
3. Ao confirmar: posição removida
   - Se era a posição atual, a anterior se torna atual
   - Se era a única, perfil fica sem posição

### 10.3 Step do Roadmap

#### CRIAR STEP

**Passo a passo:**
1. Na tela de Roadmap, botão "Adicionar etapa" (no final da timeline)
2. Preenche:
   - Título do cargo (obrigatório)
   - Tipo: emprego anterior, atual, meta, visão
   - Empresa (opcional)
   - Faixa salarial (opcional)
   - Data-meta (opcional)
   - Skills requeridas (seleção múltipla das skills do usuário + novas)
3. Confirma → step adicionado à timeline

**Validações:**
- Título: obrigatório
- Só pode ter 1 step com status 'current'
- Steps são ordenados cronologicamente

#### MUDAR STATUS DE STEP

| Ação | De | Para | Confirmação? | O que acontece |
|------|----|------|--------------|---------------|
| Concluir | current | completed | Sim: "Marcar como concluído?" | Registra conclusão, próximo step se torna 'current' |
| Definir atual | next | current | Sim | O step anterior vira 'completed' |
| Remover | qualquer | — | Sim | Step removido, skills desvinculadas |

### 10.4 Formação/Certificação

#### CRIAR FORMAÇÃO

**Campos:** título, instituição, tipo (graduação, pós, certificação, curso livre), data início, data fim, status (em andamento, concluído)

**Validações:** título e instituição obrigatórios.

#### EDITAR/EXCLUIR

Segue padrão CRUD simples. Excluir pede confirmação.

---

## 11. INTEGRAÇÕES COM OUTROS MÓDULOS

### 11.1 Carreira → Finanças

**Regra:** RN-CAR-15 — Promoção → Atualização de Receita

**Trigger:** Registrar nova promoção com salário informado

**O que acontece:**
- Atualiza ou cria receita recorrente na tabela `recurring_transactions` com:
  - `description`: "💼 Salário — [cargo] ([empresa])"
  - `amount`: valor do novo salário
  - `type`: 'income'
  - `frequency`: 'monthly'
  - Badge visual: "Auto — 💼 Carreira"

**Condição:** Integração `car_promo_financas` deve estar ativa nas Configurações > Integrações

**Cenários:**
- Integração ativa + promoção registrada → atualiza receita
- Integração desativa → nada acontece
- Promoção sem salário informado → nada acontece (campo obrigatório, então sempre tem)
- Edição do salário da posição atual → pergunta se quer atualizar Finanças

### 11.2 Carreira → Mente

**Regra:** RN-CAR-16 — Skill com Trilha Vinculada → Atualização Bidirecional

**Trigger:** Trilha concluída no módulo Mente que está vinculada a uma skill

**O que acontece:**
- A proficiência da skill vinculada é incrementada automaticamente em 1 nível (se < 5)
- Se a skill está em um step do roadmap, o progresso do step é recalculado

**Condição:** A skill deve ter `linked_track_id` preenchido e a integração `car_mente_sync` ativa

**Cenários:**
- Trilha "React Avançado" concluída no Mente → skill "React" no Carreira sobe de nível 3 para 4
- Se "React" é requerida pelo step "Sênior" → progresso do roadmap recalculado
- Se a trilha é pausada ou abandonada → nenhuma ação automática

### 11.3 Mente → Carreira

**Regra:** RN-MNT-15 — Trilha Concluída → Atualizar Skill

**Trigger:** Trilha com `linked_skill_id` concluída

**O que acontece:**
- Busca a skill vinculada em `career_skills`
- Incrementa proficiência em 1 nível
- Registra data da atualização

**Condição:** Integração `mnt_trilha_carreira` ativa e `linked_skill_id` válido

### 11.4 Carreira → Futuro

**Regra:** RN-CAR-17 — Step do Roadmap → Meta de Objetivo

**Trigger:** Step do roadmap pode ser vinculado a uma meta no módulo Futuro

**O que acontece:**
- A tabela `objective_goals` tem uma meta do tipo `linked` com `linked_entity_type = 'career_roadmap_step'` e `linked_entity_id = step.id`
- O progresso da meta é atualizado com o progresso do step (% de skills dominadas)
- O progresso do Objetivo é recalculado

**Cenários:**
- Objetivo "Ser promovido a Tech Lead" tem meta "Completar roadmap até Sênior" vinculada ao step "Sênior"
- Ao dominar 3 de 4 skills (75%), a meta no Futuro atualiza para 75%
- O Objetivo recalcula seu progresso geral

### 11.5 Futuro → Carreira

**Regra:** RN-FUT-XX — Meta profissional → Sugere Roadmap

**Trigger:** Usuário cria meta do tipo 'linked' com `target_module = 'carreira'` no módulo Futuro

**O que acontece:**
- Se não existe roadmap configurado, sugere: "Quer montar seu roadmap de carreira para acompanhar esta meta?"
- Se já existe, sugere vincular a meta ao step correspondente

---

## 12. DIAGRAMA DE INTEGRAÇÕES

```
┌─────────────────────────────────────────────────────────────────┐
│                     🔮 FUTURO (Cockpit)                          │
│                                                                   │
│  Objetivo: "Ser promovido a Tech Lead"                           │
│  ├── Meta: "Completar roadmap Sênior" (💼 Carreira) ← progresso │
│  ├── Meta: "Completar React Avançado" (🧠 Mente) ← progresso    │
│  └── Meta: "Economizar R$ 80k" (💰 Finanças)                    │
│                                                                   │
│  Progresso: recalcula quando roadmap step avança                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ bidirecional
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       💼 CARREIRA                                  │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ Roadmap:          │    │ Skill: "React"   │                    │
│  │ Step "Sênior"     │◄───│ Nível: 4 (88%)   │                    │
│  │ Progresso: 75%    │    │ Trilha: React Av. │                    │
│  │ Skills: 3/4       │    └────────┬─────────┘                    │
│  └──────────────────┘             │                              │
│                                    │                              │
│  ┌──────────────────┐             │                              │
│  │ Posição atual:    │             │                              │
│  │ "Dev Pleno"       │             │                              │
│  │ R$ 9.200/mês      │             │                              │
│  └──────┬───────────┘             │                              │
│         │                         │                              │
└─────────┼─────────────────────────┼──────────────────────────────┘
          │                         │
    ┌─────┼─────────────────────────┼──────────┐
    │     │                         │          │
    ▼     ▼                         ▼          ▼
┌──────┐ ┌──────────┐    ┌──────────┐  ┌──────────────┐
│💰    │ │🧠        │    │⏳        │  │📊 Life Sync  │
│FINAN │ │MENTE     │    │TEMPO     │  │Score         │
│ÇAS   │ │          │    │(Agenda)  │  │              │
│      │ │Trilha    │    │          │  │Carreira:0.15 │
│Receita│ │"React"   │    │Revisão   │  │peso no score │
│Recor-│ │concluída │    │salarial  │  │              │
│rente │ │→ Skill   │    │como      │  │Fórmula:      │
│R$9200│ │"React"   │    │evento    │  │(roadmap×0.4) │
│      │ │sobe      │    │agendado  │  │+(skills×0.3) │
│Badge:│ │nível     │    │          │  │+(atualiz×0.3)│
│"Auto │ │          │    │          │  │              │
│—💼"  │ │          │    │          │  │              │
└──────┘ └──────────┘    └──────────┘  └──────────────┘
```

---

## 13. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| **RN-CAR-01** | Limite de skills FREE | Usuários FREE podem ter no máximo 10 habilidades cadastradas. Não há distinção por status. |
| **RN-CAR-02** | Proficiência por escala | Proficiência usa escala 1-5 (mapeada para 0-20%, 21-40%, 41-60%, 61-80%, 81-100%). Cor da barra: ≥70% verde, 40-69% amarelo, <40% vermelho. |
| **RN-CAR-03** | Skill dominada | Uma skill é considerada "dominada" quando proficiência ≥ nível 4 (70%+). Isso impacta o cálculo de progresso do roadmap. |
| **RN-CAR-04** | Progresso do roadmap step | Calculado como: (skills dominadas requeridas pelo step / total skills requeridas) × 100. Recalculado em tempo real ao alterar proficiência. |
| **RN-CAR-05** | Step atual único | Apenas 1 step do roadmap pode ter status 'current' por vez. Ao promover, o anterior vira 'completed'. |
| **RN-CAR-06** | Posição atual única | Apenas 1 posição pode ter `is_current = true`. Ao registrar nova, a anterior é encerrada automaticamente. |
| **RN-CAR-07** | Registro de promoção encerra posição anterior | Ao registrar promoção, `end_date` da posição anterior = `start_date` da nova - 1 dia. |
| **RN-CAR-08** | Salário obrigatório em posição | O salário é obrigatório ao registrar uma posição. É usado para histórico salarial e integrações com Finanças. |
| **RN-CAR-09** | Cálculo de aumento % | `(salário_novo / salário_anterior - 1) × 100`. Se não há posição anterior, não mostra %. |
| **RN-CAR-10** | Crescimento total | `(salário_atual / primeiro_salário - 1) × 100`. Considera o primeiro salário registrado. |
| **RN-CAR-11** | Tempo no nível | `now() - career_positions.start_date` (posição atual). Formatado: "X anos e Y meses". |
| **RN-CAR-12** | Próxima revisão | Data configurável pelo usuário em `career_profile.next_review_date`. Se não definida, KPI mostra "—". |
| **RN-CAR-13** | Roadmap skills vinculadas | Skills requeridas por um step do roadmap são referências a `career_skills`. Se a skill não existe, sugere criar. |
| **RN-CAR-14** | Skill ↔ Trilha Mente | Uma skill pode ter `linked_track_id` apontando para uma trilha em `study_tracks`. É bidirecional: trilha concluída → skill sobe; skill criada → sugere criar trilha. |
| **RN-CAR-15** | Promoção → Finanças | Registrar promoção com salário pode atualizar receita recorrente em Finanças, condicionado à integração ativa. |
| **RN-CAR-16** | Trilha concluída → Skill sobe | Trilha vinculada concluída no Mente incrementa proficiência da skill em 1 nível (max 5), condicionado à integração ativa. |
| **RN-CAR-17** | Step do roadmap → Meta Futuro | Step do roadmap pode ser vinculado a meta do Futuro, com progresso bidirecional. |
| **RN-CAR-18** | Nome único de skill | O nome da skill deve ser único por usuário. Case-insensitive. |
| **RN-CAR-19** | Categorias de skill | As 4 categorias são fixas no MVP: hard_skill, soft_skill, idioma, certificação. |
| **RN-CAR-20** | XP por ações (Jornada) | +10 XP criar skill, +15 XP dominar skill (nível ≥4), +30 XP skill nível 5, +50/80/100 XP registrar promoção, +5 XP vincular trilha. |
| **RN-CAR-21** | Coach IA por regras | Insights do Coach são gerados por regras de negócio, não por IA generativa no MVP. Requerem dados de skills e roadmap. |
| **RN-CAR-22** | Simulador usa dados do roadmap | O simulador de promoção calcula impacto usando salário do próximo step vs salário atual. Sem step com salário, não exibe. |
| **RN-CAR-23** | Formação com tipo | Formações acadêmicas usam tipos fixos: graduação, pós-graduação, mestrado, doutorado, certificação, curso_livre. |
| **RN-CAR-24** | Links profissionais max 5 | Máximo de 5 links por usuário. Tipos: linkedin, github, portfolio, website, outro. |

---

## 14. MODELO DE DADOS

### 14.1 Tabelas do Módulo

```sql
-- career_profile: Perfil profissional do usuário
career_profile (
    id UUID PK,
    user_id UUID FK → profiles (UNIQUE),
    bio TEXT,
    avatar_emoji TEXT DEFAULT '👨‍💻',
    next_review_date DATE,
    career_xp INTEGER DEFAULT 0,
    career_level INTEGER DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- career_positions: Posições/cargos profissionais
career_positions (
    id UUID PK,
    user_id UUID FK → profiles,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    specialty TEXT,
    location TEXT,
    salary DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- career_skills: Habilidades profissionais
career_skills (
    id UUID PK,
    user_id UUID FK → profiles,
    name TEXT NOT NULL,
    category TEXT CHECK (hard_skill, soft_skill, idioma, certificação),
    proficiency INTEGER NOT NULL CHECK (1-5),
    linked_track_id UUID FK → study_tracks (nullable),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- career_education: Formação acadêmica e certificações
career_education (
    id UUID PK,
    user_id UUID FK → profiles,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    type TEXT CHECK (graduação, pós-graduação, mestrado, doutorado, certificação, curso_livre),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'completed' CHECK (in_progress, completed),
    notes TEXT,
    created_at TIMESTAMP
)

-- career_links: Links profissionais
career_links (
    id UUID PK,
    user_id UUID FK → profiles,
    platform TEXT CHECK (linkedin, github, portfolio, website, outro),
    url TEXT NOT NULL,
    label TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP
)

-- career_roadmap_steps: Steps do roadmap de carreira
career_roadmap_steps (
    id UUID PK,
    user_id UUID FK → profiles,
    title TEXT NOT NULL,
    company TEXT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    target_date DATE,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'future' CHECK (completed, current, next, future, vision),
    sort_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- career_roadmap_step_skills: Skills requeridas por step
career_roadmap_step_skills (
    id UUID PK,
    step_id UUID FK → career_roadmap_steps (ON DELETE CASCADE),
    skill_id UUID FK → career_skills (ON DELETE CASCADE),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    UNIQUE(step_id, skill_id)
)
```

### 14.2 Índices Recomendados

```sql
CREATE INDEX idx_career_positions_user_current ON career_positions(user_id, is_current);
CREATE INDEX idx_career_skills_user_category ON career_skills(user_id, category);
CREATE INDEX idx_career_skills_linked_track ON career_skills(linked_track_id);
CREATE INDEX idx_career_roadmap_user_status ON career_roadmap_steps(user_id, status);
CREATE INDEX idx_career_step_skills_step ON career_roadmap_step_skills(step_id);
CREATE INDEX idx_career_education_user ON career_education(user_id);
CREATE INDEX idx_career_links_user ON career_links(user_id);
```

---

## 15. LIFE SYNC SCORE — COMPONENTE CARREIRA

### 15.1 Peso no Score Geral

O módulo Carreira contribui com **15%** do Life Sync Score total.

**Justificativa:** Carreira tem peso levemente maior que Mente (10%) porque impacta diretamente renda e estabilidade financeira. Porém, é menor que Finanças (20%) porque é um indicador de longo prazo, não de gestão diária.

### 15.2 Fórmula

```
Carreira Score = (
    (roadmap_progresso) × 0.40 +
    (skills_dominadas / skills_total) × 0.30 +
    (perfil_completude) × 0.30
) × 100

Onde:
- roadmap_progresso: progresso do step 'current' do roadmap (0.0 a 1.0)
  → Se não tem roadmap: 0.0
- skills_dominadas: count de skills com proficiência ≥ 4
- skills_total: count total de skills (min 1 para evitar divisão por zero)
  → Se não tem skills: 0.0
- perfil_completude: (campos preenchidos / campos totais)
  → Campos: cargo_atual (0.3), bio (0.1), experiência ≥1 (0.2), formação ≥1 (0.2), skills ≥3 (0.2)

Limitado a 100 (teto)
```

### 15.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Carreira não mapeada — sem dados ou configuração mínima |
| 21-40 | Início — perfil básico, poucas skills |
| 41-60 | Regular — roadmap definido, skills em desenvolvimento |
| 61-80 | Bom — avançando no roadmap, skills sendo dominadas |
| 81-100 | Excelente — roadmap avançado, skills dominadas, perfil completo |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 16.1 Funcionalidades que agregam valor para futuras versões

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Dados salariais de mercado** | Integrar com APIs públicas (Glassdoor, Salary.com) para mostrar faixa salarial de mercado por cargo e localidade. O simulador de promoção mostraria dados reais. | Diferencial competitivo forte. Transforma projeção de "chute" para "dado". | Alta — pós-MVP |
| **PDI (Plano de Desenvolvimento Individual)** | Templates de PDI vinculados ao roadmap, com atividades, prazos e checkpoints. Exportável como PDF para levar à reunião com gestor. | Resolve uma necessidade real de quem tem revisões salariais periódicas. | Alta — pós-MVP |
| **Certificações com validade** | Certificações com campo de validade e alerta de expiração (ex: AWS expira em 3 anos). Notificação 3 meses antes. | Funcionalidade prática que evita perda de certificação. Não visto em apps pessoais. | Média — pós-MVP |
| **Networking tracker** | Registro de contatos profissionais importantes, frequência de contato, notas de reuniões. "Faz 6 meses que não fala com seu mentor" | Feature diferencial que nenhum career app individual oferece. | Média — v4 |
| **Market intelligence** | IA que analisa tendências do mercado e sugere skills emergentes: "Empresas de tech estão contratando 40% mais para IA/ML. Considere adicionar esta skill." | Valor percebido altíssimo para PRO. Requer API de dados de mercado. | Baixa — v5 |
| **Import LinkedIn** | Importar perfil do LinkedIn para preencher automaticamente experiência, formação e skills. Reduz drasticamente fricção de onboarding. | UX premium. Requer LinkedIn API (difícil) ou scraping (arriscado). Alternativa: upload de PDF do perfil. | Alta — pós-MVP |
| **Comparação histórica** | Gráficos comparando: "meu salário vs inflação", "meu crescimento vs média do mercado", "tempo até promoção vs benchmark". | Contextualiza a evolução pessoal. Motivador quando está acima da média. | Média — v4 |
| **Templates de roadmap** | Roadmaps pré-montados por área: "Dev Junior → Sênior → Tech Lead", "Marketing Analyst → Manager → Director", "Designer Jr → Sr → Design Lead" | Reduz fricção de configuração. Similar a templates de trilha no Mente. | Alta — pós-MVP |

### 16.2 Críticas e Pontos de Atenção ao Protótipo Atual

**1. Falta tela de "Editar Perfil"**
O protótipo mostra o ícone de edição (✏️) no header do Perfil, mas não prototipa a tela de edição. Para o protótipo completo, é essencial incluir o formulário de edição com todos os campos (bio, experiência, formação, links).

**2. Falta tela de "Editar Roadmap Step"**
O roadmap está bem visual mas não há protótipo de como o usuário adiciona ou edita um step. O wizard de criação de roadmap (ou pelo menos "adicionar step") precisa ser prototipado.

**3. Falta Empty State para módulo vazio**
Quando o usuário abre Carreira pela primeira vez, não há dados. O protótipo não mostra essa experiência. Recomendo tela de onboarding: "Vamos configurar sua carreira em 3 passos: 1) Cargo atual 2) Skills 3) Roadmap".

**4. Cor do módulo atualizada**
O protótipo usava `#ec4899` (Pink). A cor oficial foi confirmada como `#f43f5e` (Rose). O novo protótipo v3 já usa a cor correta.

**5. Falta interação de "Atualizar Proficiência"**
O protótipo mostra barras de skill mas não prototipa como o usuário altera o nível (slider? tap nos 5 níveis? input numérico?). Recomendo prototipara a interação de edição rápida de proficiência.

**6. Falta tela de "Detalhe da Habilidade"**
O tap em uma skill deveria abrir um detalhe mostrando: histórico de evolução, trilha vinculada, steps do roadmap que requerem essa skill. Não prototipado.

### 16.3 Recomendação de Telas Adicionais para Prototipagem

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 08 | Editar Perfil | 🔴 Alta | Fluxo essencial — sem isso, o perfil não é editável |
| 09 | Celebração de Promoção | 🟡 Média (Jornada) | Momento de dopamina que reforça engajamento |
| 10 | Onboarding / Empty State | 🔴 Alta | Primeira experiência do módulo — crítico para ativação |
| 11 | Detalhe da Habilidade | 🟡 Média | Tela de interação frequente (atualizar proficiência) |
| 12 | Adicionar Step ao Roadmap | 🟡 Média | Configuração do roadmap é core do módulo |
| 13 | Editar Step do Roadmap | 🟡 Média | Permite ajustar skills requeridas e metas |
| 14 | Configurações do módulo | 🟢 Baixa | Data de revisão, integrações, preferências |

---

*Documento criado em: Março 2026*  
*Versão: 1.0 — Especificação Funcional Completa*  
*Protótipo base: `proto-carreira-estatico-parte1.html` e `proto-carreira-estatico-parte2.html`*  
*Próximo passo: Validação das funcionalidades → Geração do Protótipo HTML v3 → Prompt Claude Code*
