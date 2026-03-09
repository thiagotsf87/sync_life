# ✈️ Especificação Funcional — Módulo Experiências

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Experiências — Viagens e Roteiros  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#ec4899` (Pink)  
> **Ícone Lucide:** `Plane`  
> **Subtítulo descritivo:** "Viagens e roteiros"  
> **Pergunta norteadora:** "Como estão minhas Experiências?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Viagens (Lista)](#6-tela-02--viagens)
7. [Tela 03 — Passaporte do Explorador](#7-tela-03--passaporte)
8. [Tela 04 — Memórias / Diário](#8-tela-04--memórias)
9. [Tela 05 — Bucket List / Aventuras](#9-tela-05--bucket-list)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações com Outros Módulos](#11-integrações-com-outros-módulos)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Componente Experiências](#15-life-sync-score)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Experiências

O módulo Experiências é o centro de gestão de viagens, memórias e aspirações de exploração do SyncLife. Ele vai muito além de um simples planejador de viagens — é o sistema que conecta os sonhos de conhecer o mundo com o orçamento disponível, os objetivos de vida e o calendário de compromissos.

A proposta é responder à pergunta **"Como estão minhas Experiências?"** de forma integrada: quantos países visitei, quanto gastei versus planejei, quais memórias mais marcantes, e quais destinos ainda quero conquistar — tudo conectado com o restante da vida no SyncLife.

### 1.2 Por que este módulo existe

No mercado atual, quem quer planejar viagens usa o TripIt para itinerário, o Wanderlog para roteiro, o Polarsteps para tracking, o Splitwise para dividir gastos, e o iBucket para bucket list. São 5 apps diferentes que não conversam entre si e nenhum deles responde: **"Quanto falta para eu realizar meu sonho de ir ao Japão, considerando meu orçamento, meus investimentos e meus objetivos de vida?"**

O SyncLife Experiências é o único módulo que une planejamento + orçamento + memória + bucket list + conexão com objetivos de vida numa única interface.

### 1.3 Proposta de valor única

O módulo não compete com Wanderlog em planejamento de itinerário puro, nem com Polarsteps em tracking de rota GPS. Ele compete na **camada de significado**: cada viagem planejada tem um orçamento vinculado ao módulo Finanças, pode ser um objetivo de vida no módulo Futuro, pode bloquear tempo na agenda do módulo Tempo, e as memórias registradas alimentam o bem-estar pessoal. Essa integração completa é o diferencial.

### 1.4 As 5 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Visão geral: KPIs, próxima viagem, recentes, ações rápidas | Semanal |
| 02 | Viagens (Lista) | Gerenciar todas as viagens (planejadas, ativas, concluídas) | Semanal |
| 03 | Passaporte do Explorador | Mapa-múndi com países visitados, progresso por continente, badges | Episódica |
| 04 | Memórias / Diário | Registro emocional e avaliação das viagens concluídas | Pós-viagem |
| 05 | Bucket List / Aventuras | Wishlist de destinos com prioridade, custo estimado e motivação | Mensal |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **Wanderlog** | Planejamento visual com mapa, otimização de rota, colaboração em grupo, integração com TripAdvisor e Google Maps | Sem tracking de países/passaporte, sem bucket list integrada, sem conexão com finanças pessoais | Free + Pro $4.49/mês |
| **TripIt** | Auto-importação de emails de reserva, itinerário organizado, alertas de voo, compartilhamento fácil | Sem diário/memórias, sem bucket list, focado em organização não em planejamento aspiracional | Free + Pro $49/ano |
| **Polarsteps** | Tracking automático de rota por GPS, diário de viagem com fotos, mapa de países visitados, travel books impressos | Sem planejamento financeiro, sem bucket list, sem integração com objetivos de vida | Gratuito (paga travel books) |
| **iBucket** | Bucket list compartilhada (casal/amigos), passaporte digital com stamps, trip planner com itinerário e custo | Sem diário de memórias profundo, sem conexão com finanças pessoais, sem integração com objetivos | Free + Premium |
| **FindPenguins** | Travel tracker automático, 3D flyover videos de rotas, travel books, comunidade de 10M+ viajantes | Sem planejamento financeiro, sem bucket list com custo estimado, sem integração com vida pessoal | Free + Premium |
| **Travel Diaries** | Diário bonito com fotos, layouts customizáveis, publicação web como blog, multi-plataforma | Sem planejamento de viagem, sem bucket list, sem tracking de países, sem orçamento | Free + Premium |
| **Bucket List Family** | Bucket list gamificada com adventure map, comunidade, compartilhamento social com fotos/vídeos | Sem planejamento financeiro, sem diário aprofundado, sem conexão com vida pessoal | Free + Premium |
| **Sygic Travel** | Itinerários dia-a-dia otimizados, base de atrações mundial, estimativas de tempo de viagem | Sem diário/memórias, sem passaporte digital, sem orçamento vinculado, sem gamificação | Free + $4.99/mês |
| **Splitwise** | Divisão de gastos em grupo com liquidação de saldo, tracking de despesas por viagem | Não é app de viagem — não tem itinerário, destinos, memórias ou planejamento | Free + Pro $2.99/mês |

### 2.2 Diferenciais Competitivos do SyncLife Experiências

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Bucket List → Viagem → Orçamento** | Transformar um sonho (Bucket List) em viagem planejada com orçamento vinculado ao envelope de Finanças, tudo em 3 cliques | Ninguém |
| **Memória → Análise financeira** | Cada memória mostra "Orçado vs Real" integrado com dados reais do módulo Finanças — quanto planejou, quanto gastou, quanto economizou | Ninguém |
| **Viagem → Objetivo de vida** | Uma viagem pode ser vinculada a um Objetivo no módulo Futuro, atualizando progresso automaticamente pelo orçamento guardado | Ninguém |
| **Passaporte + Life Score** | O mapa de países visitados contribui para o Life Sync Score geral, incentivando experiências como dimensão de vida equilibrada | Ninguém |
| **Experiência unificada** | "Missões", "Aventuras", "Diário do Explorador", XP por país visitado, badges por continente | Parcial (iBucket tem badges básicos) |
| **IA de custo estimado** | A IA sugere estimativas de custo por destino baseadas no perfil do usuário e dados históricos de viagens anteriores | Ninguém com dados pessoais |

### 2.3 O que aprendemos com o benchmark

**Do Polarsteps:** O tracking automático de rota é encantador e viciante. No MVP não implementaremos GPS tracking (requer app nativo), mas o mapa-múndi SVG de países visitados captura o mesmo prazer de "colorir o mundo". Futuramente, com app nativo, podemos adicionar rota GPS.

**Do iBucket:** Bucket list compartilhada com casal/amigos é um killer feature social. A versão MVP do SyncLife será individual, mas a estrutura de dados deve prever o campo `shared_with` para futuro compartilhamento.

**Do Wanderlog:** A integração com Google Maps e TripAdvisor para sugestão de atrações é valiosa. No SyncLife, a IA pode cumprir papel similar sugerindo estimativas de custo e dicas baseadas em destino.

**Do Travel Diaries:** O diário bonito com fotos e layouts é um forte gerador de engagement. No SyncLife, o módulo de Memórias com campos emocionais (momento favorito, melhor comida, aprendizado) + tags de emoções + rating captura isso de forma mais estruturada.

**Do FindPenguins:** O 3D flyover video é wow-factor puro. Para futuro, considerar animação visual da rota da viagem no mapa — mesmo sem GPS, usando cidades visitadas como waypoints.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                   ✈️ EXPERIÊNCIAS — NAVEGAÇÃO PRINCIPAL               │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Viagens │ Passaporte │ Memórias │ Bucket List           │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
  │01       │ │02      │ │03        │ │04      │ │05        │
  │DASHBOARD│ │VIAGENS │ │PASSAPORTE│ │MEMÓRIAS│ │BUCKET    │
  │KPIs     │ │(Lista) │ │Mapa-múndi│ │Lista   │ │LIST      │
  │Próxima  │ │Filtros │ │Continen. │ │Highli. │ │Mapa mini │
  │Recentes │ │Cards   │ │Badges    │ │Viagens │ │Cards     │
  │Ações    │ │Status  │ │Países    │ │Rating  │ │Priorid.  │
  └────┬────┘ └───┬────┘ └──────────┘ └───┬────┘ └────┬─────┘
       │          │                        │           │
       │    ┌─────┼─────┐                  │           │
       │    │     │     │                  ▼           │
       │    ▼     ▼     ▼              ┌────────┐     │
       │   06    07    08              │09      │     │
       │  DETALHE CRIAR  EDITAR        │MEMÓRIA │     │
       │  VIAGEM  VIAGEM VIAGEM        │DETALHE │     │
       │    │                          │Rating  │     │
       │    │                          │Campos  │     │
       │    └──────────────────────────│Tags    │     │
       │                               │Budget  │     │
       │                               └────────┘     │
       │                                               │
       │                                          ┌────▼────┐
       │                                          │10       │
       │                                          │ADICIONAR│
       │                                          │DESTINO  │
       │                                          │Bucket   │
       │                                          └─────────┘
       │
       └──→ Quick Actions ──→ Nova Viagem (07) / Registrar Memória (09)
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Viagens | Sub-nav "Viagens" | Dashboard |
| **L1** | 03 Passaporte | Sub-nav "Passaporte" | Dashboard |
| **L1** | 04 Memórias | Sub-nav "Memórias" | Dashboard |
| **L1** | 05 Bucket List | Sub-nav "Bucket List" | Dashboard |
| **L2** | 06 Detalhe da Viagem | Tap no card da viagem (02) | Viagens |
| **L2** | 07 Criar Viagem | FAB (+) ou "Nova viagem" | Viagens |
| **L2** | 08 Editar Viagem | Ícone ✏️ no detalhe (06) | Detalhe da Viagem |
| **L2** | 09 Memória Detalhe | Tap na viagem concluída (04) | Memórias |
| **L2** | 10 Adicionar Destino | "+ Novo destino" em Bucket List | Bucket List |

### 3.3 Padrão de navegação

**Telas L1 (principais):** Header com ícone Plane + "Experiências" + badge, sub-nav com tabs underline (5 tabs). No modo Jornada, título muda para nível do explorador e labels das tabs mudam.

**Telas L2 (internas):** Header simplificado com ← e título da tela. Sem sub-nav. Voltar retorna à tela L1 de origem.

---

## 4. MAPA DE FUNCIONALIDADES

```
✈️ Experiências
├── 01 Dashboard
│   ├── KPIs (viagens, países, continentes, média memórias)
│   ├── Card IA — dica contextual [Jornada: Coach Explorador]
│   ├── Card "Próxima Viagem" (hero com progresso de orçamento)
│   ├── Lista "Recentes" (3 últimas viagens com status)
│   └── Grid "Ações Rápidas" (nova viagem, registrar memória, bucket list, relatório)
│
├── 02 Viagens (Lista)
│   ├── Filtros por status (Todas, Planejando, Ativa, Concluída)
│   ├── Cards de viagem (bandeira, nome, datas, status, orçamento, tags)
│   ├── Badge de memória pendente [se concluída sem memória]
│   └── FAB (+) → Criar Viagem
│
├── 03 Passaporte do Explorador
│   ├── Stats (países, continentes, % do mundo)
│   ├── Mapa-múndi SVG (visitados, parciais, planejados)
│   ├── Legenda (visitado, planejado, não visitado)
│   ├── Progresso por continente (barra + contagem)
│   ├── Badges [Jornada: com XP]
│   └── Lista de países visitados (bandeira, nome, nº viagens)
│
├── 04 Memórias / Diário
│   ├── Stats (registradas, pendentes, média)
│   ├── Highlights (melhor comida, lugar mais bonito, maior aprendizado)
│   ├── Lista de viagens concluídas (bandeira, nome, datas, tags, rating)
│   ├── Viagens sem memória → botão "Registrar"
│   └── [Jornada: renomeia para "Diário do Explorador", XP por registro]
│
├── 05 Bucket List / Aventuras
│   ├── Mapa-múndi mini SVG (pins de destinos)
│   ├── Filtros (Todos, Visitados, Pendentes)
│   ├── Cards de destino (bandeira, nome, país, continente, prioridade)
│   ├── Metadados (orçamento estimado, data alvo, tipo viagem)
│   ├── Motivação pessoal (frase do usuário)
│   ├── CTA "Transformar em Viagem →"
│   ├── Estimativa IA de custo [PRO]
│   └── Resumo (custo total, total destinos, visitados, pendentes)
│
├── 06 Detalhe da Viagem [L2]
│   ├── Hero (bandeira, destino, datas, duração, tipo)
│   ├── Status e progresso de orçamento
│   ├── Checklist de tarefas (passaporte, visto, passagem, hotel)
│   ├── Itinerário dia-a-dia (simplificado)
│   ├── Gastos (link para Finanças)
│   └── [Jornada: XP estimado ao concluir]
│
├── 07 Criar Viagem [L2]
│   ├── Passo 1: Destino (país, cidade, bandeira automática)
│   ├── Passo 2: Datas (início, fim, duração automática)
│   ├── Passo 3: Tipo (solo, casal, família, amigos, trabalho)
│   ├── Passo 4: Orçamento (valor total estimado)
│   ├── Passo 5: Vinculação (criar envelope em Finanças? vincular a Objetivo?)
│   └── Confirmação e criação
│
├── 09 Memória Detalhe [L2]
│   ├── Hero (bandeira, destino, datas)
│   ├── Rating (1-5 estrelas)
│   ├── Campos texto (momento favorito, melhor comida, lugar mais bonito, aprendizado)
│   ├── Tags de emoções (multi-select: Incrível, Gastronômico, Cultural, Relaxante...)
│   ├── Orçado vs Real (comparação financeira)
│   └── [Jornada: labels diferenciados, XP por registro]
│
└── 10 Adicionar Destino Bucket List [L2]
    ├── Destino (país, cidade)
    ├── Prioridade (Alta, Média, Baixa)
    ├── Orçamento estimado
    ├── Data alvo (ano)
    ├── Tipo (solo, casal, família, amigos)
    └── Motivação (frase livre)
```

---

## 5. TELA 01 — DASHBOARD

### Objetivo
Oferecer uma visão panorâmica do estado de experiências do usuário: quantas viagens já fez, qual a próxima, quais são recentes, e ações rápidas para os fluxos mais comuns. É a porta de entrada do módulo.

### Componentes

#### 5.1 KPI Strip (grid 2×2)
- **Objetivo:** Resumir em números a vida viajante do usuário.
- **Dados:**
  - Viagens: `COUNT(trips WHERE user_id = X)` — cor do módulo
  - Países: `COUNT(DISTINCT country FROM trips WHERE status = 'completed')` — verde
  - Continentes: `COUNT(DISTINCT continent FROM trips WHERE status = 'completed')` — amarelo
  - Média memórias: `AVG(rating FROM trip_memories)` — ícone ⭐
- **Critérios de aceite:**
  - CA-01: KPIs carregam em ≤ 1s
  - CA-02: Países conta apenas viagens concluídas
  - CA-03: Continentes agrupa corretamente (7 continentes padrão)
  - CA-04: Média memórias mostra "—" se nenhuma memória registrada
- **Resultado esperado:** Usuário vê instantaneamente seu "nível de explorador" em números.

#### 5.2 Card IA [Jornada]
- **Objetivo:** Insight contextual sobre viagens e orçamento.
- **Dados:** Combina dados de trips + budgets (Finanças) + objectives (Futuro).
- **Exemplos de insights:**
  - "Você já guardou 56% do orçamento para o Japão. Ao ritmo atual, atinge a meta em Maio."
  - "Sua viagem a Portugal custou 5.4% menos que o planejado. Bom controle!"
  - Jornada: "Faltam 3 países para o badge 'Sul-Americano Raiz'! Que tal Equador ou Peru?"
- **Critérios de aceite:**
  - CA-05: Card IA só aparece em modo Jornada (PRO)
  - CA-06: Foco mostra versão simplificada (dica genérica sem IA contextual)
  - CA-07: Insight é gerado com base em dados reais (não placeholder estático)
- **Resultado esperado:** Usuário sente que o app "sabe" do seu progresso e o incentiva.

#### 5.3 Card "Próxima Viagem" (Featured Trip)
- **Objetivo:** Destacar a próxima viagem com visual hero e progresso de orçamento.
- **Dados:** `trip WHERE status IN ('planning', 'active') ORDER BY start_date ASC LIMIT 1`
- **Layout:** Hero com gradient + bandeira + destino + datas + duração + tipo + badge de status + barra de progresso de orçamento.
- **Critérios de aceite:**
  - CA-08: Mostra a viagem mais próxima (por data de início)
  - CA-09: Barra de progresso = `orçamento_guardado / orçamento_total × 100`
  - CA-10: Se não há viagem planejada, mostra CTA "Planeje sua próxima aventura →"
  - CA-11: Tap no card navega para Detalhe da Viagem (tela 06)
- **Resultado esperado:** Viagem do Japão aparece com 56% de progresso, gerando antecipação.

#### 5.4 Lista "Recentes"
- **Objetivo:** Mostrar as 3 viagens mais recentes com status visual.
- **Dados:** `trips ORDER BY end_date DESC LIMIT 3`
- **Layout:** Mini-card com bandeira, nome, data, duração + badge de status (Concluída/Ativa/Planejando).
- **Critérios de aceite:**
  - CA-12: Mostra no máximo 3 viagens
  - CA-13: Link "Ver todas →" navega para tela Viagens (02)
  - CA-14: Badge de status com cor funcional (verde=concluída, cyan=ativa, amarelo=planejando)
- **Resultado esperado:** Visão rápida do histórico recente.

#### 5.5 Grid "Ações Rápidas"
- **Objetivo:** Atalhos para fluxos frequentes.
- **Botões (2×2):**
  - ✈️ Nova viagem → Criar Viagem (07)
  - 📸 Registrar memória → Memórias (04) com modal de seleção
  - 🗺️ Bucket List → Bucket List (05)
  - 📊 Relatório → Relatório de viagens [PRO]
- **Critérios de aceite:**
  - CA-15: Todos os botões navegam corretamente
  - CA-16: "Relatório" mostra UpgradeModal se FREE

---

## 6. TELA 02 — VIAGENS (LISTA)

### Objetivo
Gerenciar todas as viagens do usuário em um único lugar, com filtros por status para localizar rapidamente viagens planejadas, em andamento ou concluídas.

### Componentes

#### 6.1 Filtros por Status
- **Objetivo:** Segmentar viagens por fase.
- **Opções:** Todas (default) | Planejando | Ativa | Concluída
- **Layout:** Pills horizontais com contagem.
- **Critérios de aceite:**
  - CA-17: Filtro "Todas" é ativo por padrão
  - CA-18: Contagem entre parênteses se atualiza em tempo real
  - CA-19: Seleção de filtro atualiza lista sem reload da página

#### 6.2 Cards de Viagem
- **Objetivo:** Resumir informações de cada viagem visualmente.
- **Dados por card:**
  - Bandeira emoji (do país)
  - Nome do destino
  - Datas (período)
  - Badge de status com cor
  - Detalhes: orçamento, duração, tipo de viagem
  - Badge "memória pendente" se concluída sem memória registrada
- **Layout:** Card com border-left colorido por status (ativo=pink, concluída=verde, planejando=amarelo).
- **Critérios de aceite:**
  - CA-20: Cards ordenados por data de início (mais recente primeiro)
  - CA-21: Border-left usa cor correspondente ao status
  - CA-22: Badge "📸 Memória pendente" aparece se `status = 'completed' AND NOT EXISTS trip_memory`
  - CA-23: Tap no card navega para Detalhe (06)
- **Resultado esperado:** Usuário encontra qualquer viagem em ≤ 3s.

#### 6.3 FAB (+) Criar Viagem
- **Objetivo:** Acesso rápido à criação de nova viagem.
- **Critérios de aceite:**
  - CA-24: FAB fixo no canto inferior direito
  - CA-25: Tap navega para Criar Viagem (07)
  - CA-26: FREE: máximo 5 viagens ativas. Se limite atingido, mostra UpgradeModal

---

## 7. TELA 03 — PASSAPORTE DO EXPLORADOR

### Objetivo
Visualização gamificada dos países visitados. É o "cartão de visitas" do viajante — um mapa-múndi que vai sendo colorido conforme o usuário explora o mundo. Disponível em ambos os modos, mas com gamificação extra (XP, badges) no Jornada.

### Componentes

#### 7.1 Stats (grid 1×3)
- **Dados:**
  - Países: contagem de países únicos com `status = 'completed'`
  - Continentes: contagem de continentes únicos visitados
  - % do Mundo: `países_visitados / 195 × 100`
- **Critérios de aceite:**
  - CA-27: Contagem usa apenas viagens com `status = 'completed'`
  - CA-28: % do mundo calcula sobre 195 países reconhecidos pela ONU
  - CA-29: Atualiza automaticamente quando viagem muda para 'completed'

#### 7.2 Mapa-múndi SVG
- **Objetivo:** Visualização geográfica de onde o usuário já esteve.
- **Estados visuais por país:**
  - Visitado: preenchido com cor do módulo (opacity 0.35)
  - Parcial (trânsito/escala): preenchido com cor do módulo (opacity 0.18)
  - Planejado: contorno tracejado amarelo
  - Não visitado: cinza escuro (surface 3)
- **Pins:** Círculos nas capitais/cidades visitadas.
- **Critérios de aceite:**
  - CA-30: SVG renderiza sem scroll horizontal em 375px
  - CA-31: Países visitados são clicáveis — mostram drawer com detalhes
  - CA-32: Legenda visível abaixo do mapa (3 items)
  - CA-33: Mapa respeita tema dark (backgrounds navy)
- **Resultado esperado:** Experiência visual de "colorir o mundo" que gera orgulho e compartilhamento.

#### 7.3 Progresso por Continente
- **Dados:** Para cada continente com ≥ 1 país visitado: emoji, nome, "X de Y" países, barra de progresso.
- **Continentes:** América do Sul (12), América do Norte/Central (23), Europa (44), Ásia (48), África (54), Oceania (14).
- **Critérios de aceite:**
  - CA-34: Mostra apenas continentes com ≥ 1 país visitado OU planejado
  - CA-35: Barra de progresso = `visitados / total_continente × 100`
  - CA-36: Jornada: mostra XP acumulado por continente

#### 7.4 Badges
- **Objetivo:** Reconhecimentos visuais por marcos de exploração.
- **Badges previstos:**
  - 🌎 Explorador SA: 5+ países na América do Sul
  - 🇪🇺 Eurotrip Iniciante: 2+ países na Europa
  - 🌍 Volta ao Mundo: todos os 6 continentes
  - 🏝️ Nômade Digital: 30+ dias no exterior
  - ✈️ Frequent Flyer: 10+ viagens
  - 🗺️ Meia Volta: 3+ continentes
- **Critérios de aceite:**
  - CA-37: Badges não conquistados mostram ícone 🔒 com opacity reduzida
  - CA-38: Badges conquistados mostram check ✅
  - CA-39: Jornada: cada badge concede XP (30-80 XP)
  - CA-40: Foco: mostra badges sem XP
- **Resultado esperado:** Motivação para "coletar" badges viajando mais.

#### 7.5 Lista de Países Visitados
- **Dados:** Bandeira, nome, número de viagens ao país.
- **Critérios de aceite:**
  - CA-41: Ordenados por número de viagens (descrescente)
  - CA-42: Brasil mostra "Doméstico" em vez de contagem
  - CA-43: Jornada: mostra "X× · +Y XP" ao lado

---

## 8. TELA 04 — MEMÓRIAS / DIÁRIO

### Objetivo
Tela dedicada ao registro emocional e reflexivo das viagens concluídas. Não é apenas um log — é o diário que captura sentimentos, aprendizados e os melhores momentos de cada viagem.

### Componentes

#### 8.1 Stats (grid 1×3)
- **Dados:**
  - Registradas: `COUNT(trip_memories WHERE user_id = X)`
  - Pendentes: `COUNT(trips WHERE status = 'completed' AND NOT EXISTS memory)`
  - Média: `AVG(rating FROM trip_memories)`
- **Critérios de aceite:**
  - CA-44: Pendentes destaca número em amarelo (ação requerida)
  - CA-45: Média mostra ⭐ com 1 decimal

#### 8.2 Highlights
- **Objetivo:** Os 3 melhores momentos do usuário como viajante, calculados automaticamente.
- **Cards (grid 1×3):**
  - 🍝 Melhor comida: viagem com melhor avaliação no campo `best_food`
  - 📸 Lugar mais bonito: viagem com melhor avaliação no campo `most_beautiful`
  - 💡 Maior aprendizado: viagem com melhor avaliação no campo `lesson_learned`
- **Critérios de aceite:**
  - CA-46: Highlights calculados com base nas memórias registradas
  - CA-47: Se < 3 memórias, mostra placeholder "Registre mais memórias"
  - CA-48: Tap no highlight navega para memória da viagem correspondente

#### 8.3 Lista de Viagens Concluídas
- **Layout:** Cards com bandeira, nome do destino + cidades, datas, duração, tags de emoções, rating.
- **Estados:**
  - Com memória: mostra tags + rating
  - Sem memória: mostra botão "Registrar" (cor do módulo)
- **Critérios de aceite:**
  - CA-49: Viagens ordenadas por data de conclusão (mais recente primeiro)
  - CA-50: Viagens sem memória aparecem no final com CTA "Registrar"
  - CA-51: Tap em viagem com memória navega para Memória Detalhe (09)
  - CA-52: Tap em "Registrar" abre Memória Detalhe (09) em modo edição

#### 8.4 Memória Detalhe (Tela L2 — 09)
- **Hero:** Bandeira + destino + datas + duração + tipo.
- **Rating:** 5 estrelas interativas.
- **Campos texto (4):**
  - ⭐ Momento favorito (texto livre)
  - 🍽️ Melhor comida (texto livre)
  - 📸 Lugar mais bonito (texto livre)
  - 💡 Aprendizado (texto livre)
- **Tags de emoções:** Multi-select com 8 opções (Incrível, Gastronômico, Cultural, Relaxante, Praia, Aventura, Musical, Romântico).
- **Orçado vs Real:** Card com dados de Finanças (orçado, real gasto, diferença com % e cor verde/vermelho).
- **Critérios de aceite:**
  - CA-53: Rating é obrigatório para salvar memória
  - CA-54: Pelo menos 1 campo texto deve ser preenchido
  - CA-55: Tags de emoções permitem múltiplas seleções
  - CA-56: Orçado vs Real puxa dados do envelope vinculado em Finanças
  - CA-57: Se não há envelope vinculado, seção Orçado vs Real não aparece
  - CA-58: Jornada: labels mudam ("Momento épico", "Emoções da Aventura", etc.)
  - CA-59: Jornada: +50 XP ao registrar memória completa
- **Resultado esperado:** Usuário preserva memórias de forma estruturada e emocional.

---

## 9. TELA 05 — BUCKET LIST / AVENTURAS

### Objetivo
A wishlist aspiracional do viajante. Aqui ficam todos os destinos que o usuário sonha conhecer, com prioridade, custo estimado e motivação pessoal. A funcionalidade killer é o CTA "Transformar em Viagem" que converte o sonho em planejamento concreto com 1 tap.

### Componentes

#### 9.1 Mapa-múndi Mini SVG
- **Objetivo:** Visualização rápida de onde estão os destinos da bucket list.
- **Pins:** Bolinhas laranja (bucket) nas localizações dos destinos.
- **Critérios de aceite:**
  - CA-60: Mapa mini menor que o mapa do Passaporte
  - CA-61: Pins apenas de destinos pendentes (não visitados)
  - CA-62: Renderiza sem scroll horizontal

#### 9.2 Filtros
- **Opções:** Todos (N) | Visitados (N) | Pendentes (N)
- **Critérios de aceite:**
  - CA-63: "Todos" é ativo por padrão
  - CA-64: Contagens atualizam em tempo real

#### 9.3 Cards de Destino
- **Dados por card:**
  - Bandeira + nome do destino + cidade(s)
  - País + continente
  - Badge de prioridade (Alta=vermelho, Média=amarelo, Baixa=cyan)
  - Metadados: orçamento estimado, data alvo, tipo de viagem
  - Motivação: frase do usuário em itálico
  - CTA: "Transformar em Viagem →" (para destinos pendentes)
  - Estimativa IA: custo estimado pela IA [PRO]
- **Critérios de aceite:**
  - CA-65: Cards ordenados por prioridade (Alta → Média → Baixa)
  - CA-66: CTA "Transformar em Viagem" cria trip com dados pré-preenchidos
  - CA-67: Destinos visitados mostram badge "✅ Visitado" sem CTA
  - CA-68: Estimativa IA requer plano PRO
  - CA-69: Jornada: labels mudam ("Missão: Tóquio", XP por destino, emojis de prioridade 🔥⚡💎)
- **Resultado esperado:** Sonhos organizados com caminho claro para realização.

#### 9.4 Resumo Totalizador
- **Dados:** Custo total estimado, total de destinos, visitados, pendentes.
- **Layout:** Card centralizado no final da lista.
- **Critérios de aceite:**
  - CA-70: Custo total = soma dos orçamentos estimados de todos os destinos
  - CA-71: Atualiza quando destino é adicionado, removido ou marcado como visitado

---

## 10. FLUXOS CRUD DETALHADOS

### 10.1 VIAGEM (Entidade principal)

#### CRIAR VIAGEM

```
PASSO 1 — Acessar
├── Onde: FAB (+) em qualquer tela L1 OU "Nova viagem" no Dashboard OU "Transformar em Viagem" na Bucket List
├── Pré-condição: FREE permite máximo 5 viagens ativas
└── Se limite atingido → UpgradeModal

PASSO 2 — Preencher dados
├── Campo: Destino (país obrigatório, cidade opcional)
│   Autocomplete com lista de países + bandeira emoji automática
├── Campo: Datas (data início + data fim)
│   Duração calculada automaticamente
│   Validação: data início ≥ hoje (para novas viagens)
├── Campo: Tipo (solo, casal, família, amigos, trabalho)
│   Select com ícones
├── Campo: Orçamento estimado (R$, obrigatório)
│   Input numérico com máscara monetária
├── Campo: Notas (texto livre, opcional)
└── Toggle: "Criar envelope no Finanças?" (default: SIM)
    Se SIM → cria envelope com meta = orçamento

PASSO 3 — Vinculações opcionais
├── Vincular a Objetivo no Futuro? (select de objetivos ativos)
│   Se SIM → cria objective_goal tipo 'experience' vinculada
├── Bloquear datas na agenda? (toggle)
│   Se SIM → cria calendar_event no módulo Tempo
└── Preview: "Será criado: 🇯🇵 Japão · Jul 2026 · R$ 15.000 + Envelope Finanças"

PASSO 4 — Confirmar
├── Validação:
│   ├── Destino obrigatório (país)
│   ├── Datas obrigatórias
│   ├── Orçamento > 0
│   └── FREE: máximo 5 viagens ativas
├── Sistema:
│   ├── INSERT em trips (status = 'planning')
│   ├── Se toggle Finanças → INSERT em budgets/envelopes
│   ├── Se vincular Futuro → UPDATE objective_goals
│   ├── Se bloquear agenda → INSERT em calendar_events
│   ├── Gera bandeira emoji automaticamente pelo país
│   ├── Atualiza contagem de países se país é novo
│   └── Jornada: +30 XP por viagem criada
├── Feedback: Toast "Viagem criada! ✈️"
└── Navega para: Detalhe da Viagem (06)
```

#### EDITAR VIAGEM

```
PASSO 1 — Onde: Detalhe da Viagem (06) → ícone ✏️
PASSO 2 — Modal/tela abre com dados preenchidos
├── Editável: destino, datas, tipo, orçamento, notas
├── NÃO editável: status (usa fluxo específico de mudança)
├── Se orçamento muda e há envelope vinculado → atualiza envelope
├── Se datas mudam e há evento no Tempo → atualiza calendar_event
└── Se destino muda → recalcula bandeira e contagem de países
PASSO 3 — Salvar
├── UPDATE em trips
├── Atualiza entidades vinculadas
└── Feedback: Toast "Viagem atualizada"
```

#### MUDAR STATUS

| Ação | De | Para | Confirmação | O que acontece |
|------|-----|------|-------------|----------------|
| Iniciar viagem | planning | active | "Marcar como em andamento?" | Status muda, notificação in-app |
| Concluir viagem | active | completed | "Viagem concluída! Registrar memória?" | Status muda, prompt de memória, +50 XP (Jornada) |
| Cancelar | planning | cancelled | "Tem certeza? Envelope será mantido." | Status muda, envelope preservado |
| Reativar | cancelled | planning | "Reativar viagem?" | Status volta a planning |

#### EXCLUIR VIAGEM

```
PASSO 1 — Onde: Detalhe da Viagem (06) → menu ⋮ → "Excluir"
PASSO 2 — Confirmação com escolha:
├── "Excluir viagem '[destino]'?"
├── "O envelope no Finanças será mantido."
├── "A memória vinculada será preservada."
└── Botão: "Excluir" (vermelho) + "Cancelar"
PASSO 3 — Sistema:
├── DELETE da trip (soft delete: status = 'deleted')
├── NÃO exclui envelope em Finanças (desvincula)
├── NÃO exclui memória (preserva)
├── NÃO exclui calendar_event (preserva)
├── Desvincula objective_goal se existir
└── Feedback: Toast "Viagem removida"
```

### 10.2 MEMÓRIA

#### CRIAR MEMÓRIA

```
PASSO 1 — Acessar
├── Onde: Memórias (04) → tap em viagem sem memória → "Registrar"
│   OU: Dashboard → "Registrar memória" → seleciona viagem concluída
├── Pré-condição: viagem com status = 'completed'
└── Se já tem memória → abre em modo visualização/edição

PASSO 2 — Preencher
├── Rating: 1-5 estrelas (obrigatório)
├── Momento favorito: texto livre (mínimo 1 campo texto obrigatório)
├── Melhor comida: texto livre
├── Lugar mais bonito: texto livre
├── Aprendizado: texto livre
├── Tags de emoções: multi-select (mínimo 1)
└── Orçado vs Real: preenchido automaticamente se há envelope vinculado

PASSO 3 — Salvar
├── Validação:
│   ├── Rating obrigatório
│   ├── Pelo menos 1 campo texto preenchido
│   └── Pelo menos 1 tag de emoção selecionada
├── Sistema:
│   ├── INSERT em trip_memories
│   ├── Recalcula média de rating geral
│   ├── Atualiza highlights se necessário
│   └── Jornada: +50 XP por memória completa
├── Feedback: Toast "Memória registrada! 📸"
└── Navega para: Memória Detalhe (09) em modo visualização
```

#### EDITAR MEMÓRIA

```
PASSO 1 — Onde: Memória Detalhe (09) → ícone ✏️
PASSO 2 — Todos os campos editáveis
PASSO 3 — Salvar → UPDATE trip_memories → recalcula highlights e média
```

### 10.3 DESTINO BUCKET LIST

#### CRIAR DESTINO

```
PASSO 1 — Onde: Bucket List (05) → "+ Novo destino"
PASSO 2 — Preencher:
├── Destino: país (obrigatório) + cidade (opcional)
├── Prioridade: Alta / Média / Baixa
├── Orçamento estimado: R$ (opcional)
├── Data alvo: ano (opcional)
├── Tipo: solo / casal / família / amigos
└── Motivação: frase livre (opcional, max 200 chars)
PASSO 3 — Salvar:
├── INSERT em bucket_list_items
├── Adiciona pin no mapa-múndi mini
├── Atualiza contagens e custo total
├── Jornada: +10 XP por destino adicionado
└── FREE: máximo 10 destinos. PRO: ilimitado
```

#### TRANSFORMAR EM VIAGEM

```
PASSO 1 — Onde: Bucket List → card do destino → "Transformar em Viagem →"
PASSO 2 — Abre Criar Viagem (07) com dados pré-preenchidos:
├── Destino: já preenchido
├── Orçamento: já preenchido
├── Tipo: já preenchido
└── Usuário complementa datas e confirma
PASSO 3 — Sistema:
├── Cria trip normalmente
├── Vincula bucket_list_item.trip_id = nova trip
├── Quando trip = 'completed' → bucket_list_item.status = 'visited'
└── Jornada: +20 XP por transformar sonho em viagem
```

#### EXCLUIR DESTINO

```
PASSO 1 — Onde: Bucket List → card → menu ⋮ → "Remover"
PASSO 2 — Confirmação: "Remover '[destino]' da sua bucket list?"
PASSO 3 — DELETE bucket_list_items
```

---

## 11. INTEGRAÇÕES COM OUTROS MÓDULOS

### 11.1 Experiências → Finanças

- **Regra:** RN-EXP-01
- **Trigger:** Criar viagem com toggle "Criar envelope" ativado
- **O que acontece:** INSERT em budgets/envelopes com meta = orçamento da viagem, nome = destino
- **Condição:** Toggle ativo em Configurações > Integrações > Finanças
- **Cenários:**
  1. Usuário cria viagem "Japão R$ 15.000" → Envelope "Japão" aparece em Finanças com meta R$ 15.000/mês
  2. Usuário deposita R$ 1.000 no envelope → Progresso na viagem atualiza para R$ 1.000/15.000
  3. Viagem concluída → Memória mostra Orçado (R$ 15.000) vs Real (soma de gastos na categoria)
  4. Viagem cancelada → Envelope permanece, mas desvinculado da viagem

### 11.2 Experiências → Futuro

- **Regra:** RN-EXP-02
- **Trigger:** Criar viagem vinculada a Objetivo
- **O que acontece:** UPDATE objective_goals com linked_entity_type = 'trip', linked_entity_id = trip.id
- **Condição:** Toggle ativo em Configurações > Integrações > Futuro
- **Cenários:**
  1. Objetivo "Viajar o mundo" tem meta "Visitar 10 países" → Trip concluída incrementa current_value
  2. Objetivo "Experiência no Japão" com meta monetária → Envelope da viagem alimenta progresso
  3. Viagem concluída → Marco automático no Objetivo ("🇯🇵 Japão concluído!")

### 11.3 Experiências → Tempo

- **Regra:** RN-EXP-03
- **Trigger:** Criar viagem com toggle "Bloquear agenda" ativado
- **O que acontece:** INSERT em calendar_events com tipo 'trip', datas da viagem
- **Condição:** Toggle ativo em Configurações > Integrações > Tempo
- **Cenários:**
  1. Viagem 10-22 Jul → Bloco "✈️ Japão" aparece na agenda de 10 a 22 Jul
  2. Datas da viagem mudam → Evento no calendário atualiza automaticamente
  3. Viagem cancelada → Evento removido da agenda

### 11.4 Experiências → Mente

- **Regra:** RN-EXP-04
- **Trigger:** Memória registrada com campo "Aprendizado" preenchido
- **O que acontece:** Pode sugerir criação de trilha no Mente baseada no aprendizado (ex: "Aprender japonês")
- **Condição:** Toggle ativo + modo Jornada (sugestão IA)
- **Cenários:**
  1. Usuário registra "Viajar sozinho me ensinou paciência" → IA sugere trilha de mindfulness no Mente
  2. Usuário registra "Quero aprender japonês" → IA sugere trilha de idioma no Mente

### 11.5 Experiências → Corpo

- **Regra:** RN-EXP-05
- **Trigger:** Viagem concluída com atividades de aventura
- **O que acontece:** Sugestão de registro de atividade física no Corpo
- **Condição:** Toggle ativo + modo Jornada
- **Cenários:**
  1. Tag "Aventura" na memória → IA sugere registrar trilha/trekking no Corpo

---

## 12. DIAGRAMA DE INTEGRAÇÕES

```
                         ┌─────────────┐
                         │ 🔮 FUTURO    │
                         │             │
                         │• Meta tipo  │
                         │  'experience'│
                         │• Progresso  │
                         │  por viagem │
                         └──────┬──────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   ┌─────────────┐     ┌──────────────┐      ┌─────────────┐
   │ 💰 FINANÇAS  │     │ ✈️ EXPERIÊN. │      │ ⏳ TEMPO     │
   │             │ ←── │              │ ──→  │             │
   │• Envelope   │     │• Dashboard   │      │• Bloco trip │
   │  por viagem │     │• Viagens     │      │  no calendar│
   │• Gastos cat.│     │• Passaporte  │      │• Datas auto │
   │• Orçado vs  │     │• Memórias    │      │  atualizadas│
   │  Real       │     │• Bucket List │      └─────────────┘
   └─────────────┘     └──────┬───────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
                    ▼                   ▼
             ┌─────────────┐    ┌─────────────┐
             │ 🧠 MENTE     │    │ 🏃 CORPO    │
             │             │    │             │
             │• Sugestão   │    │• Sugestão   │
             │  trilha de  │    │  atividade  │
             │  idioma     │    │  (aventura) │
             └─────────────┘    └─────────────┘
```

---

## 13. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| RN-EXP-01 | Criar viagem cria envelope | Se toggle ativo, INSERT em Finanças com meta = orçamento |
| RN-EXP-02 | Viagem vinculável a Objetivo | Meta tipo 'experience' no Futuro. Trip concluída = 100% progresso |
| RN-EXP-03 | Viagem bloqueia agenda | Se toggle ativo, INSERT calendar_event com datas da viagem |
| RN-EXP-04 | Memória sugere trilha Mente | IA sugere trilha baseada em aprendizado (Jornada only) |
| RN-EXP-05 | Memória sugere atividade Corpo | IA sugere atividade baseada em tag "Aventura" (Jornada only) |
| RN-EXP-06 | FREE: máximo 5 viagens ativas | Status 'planning' ou 'active'. Completed não conta |
| RN-EXP-07 | FREE: máximo 10 destinos bucket list | PRO: ilimitado |
| RN-EXP-08 | Bandeira automática por país | Sistema mapeia ISO 3166-1 → emoji flag |
| RN-EXP-09 | Progresso orçamento = envelope/meta | `saved_amount / budget × 100` |
| RN-EXP-10 | Excluir viagem não exclui envelope | Soft delete: desvincula mas preserva dados financeiros |
| RN-EXP-11 | Excluir viagem não exclui memória | Memória é preservada independente |
| RN-EXP-12 | Memória requer rating + 1 campo texto + 1 tag | Validação mínima para registro |
| RN-EXP-13 | Concluir viagem prompta memória | Ao mudar status para 'completed', prompt: "Registrar memória?" |
| RN-EXP-14 | Bucket List → Viagem pré-preenche dados | Destino, orçamento e tipo carregados do bucket list item |
| RN-EXP-15 | Trip completed → bucket item visited | Se bucket item vinculado, atualiza status automaticamente |
| RN-EXP-16 | Passaporte conta apenas completed | Países e continentes contam só viagens com status 'completed' |
| RN-EXP-17 | % do mundo sobre 195 países | Divisão pela lista ONU de 195 estados-membros |
| RN-EXP-18 | Highlights automáticos | Top 3 memórias (comida, beleza, aprendizado) calculadas por rating |
| RN-EXP-19 | XP só no Jornada (PRO) | Toda gamificação requer modo Jornada ativo |
| RN-EXP-20 | Estimativa IA de custo é PRO | Bucket List com estimativa de custo por destino requer PRO |
| RN-EXP-21 | Relatório de viagens é PRO | Dashboard → Ação rápida "Relatório" requer PRO |
| RN-EXP-22 | Orçado vs Real puxa Finanças | Se envelope vinculado, dados financeiros são do módulo Finanças |
| RN-EXP-23 | Viagem ativa máximo 1 por vez | Apenas 1 viagem pode ter status 'active' simultaneamente |
| RN-EXP-24 | Nome do destino é único por usuário | Não pode ter 2 viagens com mesmo destino+datas |
| RN-EXP-25 | Integrações são opt-in | Cada integração deve estar habilitada em Configurações > Integrações |

---

## 14. MODELO DE DADOS

### 14.1 Schema SQL

```sql
-- trips: Viagens do usuário
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination_country TEXT NOT NULL,
    destination_city TEXT,
    country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 (ex: 'JP', 'BR')
    flag_emoji TEXT NOT NULL, -- ex: '🇯🇵'
    continent TEXT NOT NULL, -- south_america, europe, asia, africa, north_america, oceania
    start_date DATE,
    end_date DATE,
    duration_days INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,
    trip_type TEXT DEFAULT 'solo' CHECK (trip_type IN ('solo', 'couple', 'family', 'friends', 'business')),
    budget DECIMAL(12,2),
    budget_saved DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled', 'deleted')),
    notes TEXT,
    linked_envelope_id UUID, -- FK para Finanças
    linked_objective_id UUID, -- FK para Futuro
    linked_calendar_event_id UUID, -- FK para Tempo
    linked_bucket_item_id UUID, -- FK para bucket_list_items
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, destination_country, start_date)
);

-- trip_memories: Memórias/diário das viagens
CREATE TABLE trip_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    favorite_moment TEXT,
    best_food TEXT,
    most_beautiful TEXT,
    lesson_learned TEXT,
    emotion_tags TEXT[] DEFAULT '{}', -- array de tags: ['amazing', 'gastro', 'cultural', ...]
    budget_planned DECIMAL(12,2),
    budget_actual DECIMAL(12,2),
    budget_difference DECIMAL(12,2) GENERATED ALWAYS AS (budget_planned - budget_actual) STORED,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(trip_id) -- 1 memória por viagem
);

-- bucket_list_items: Destinos desejados
CREATE TABLE bucket_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination_country TEXT NOT NULL,
    destination_city TEXT,
    country_code TEXT NOT NULL,
    flag_emoji TEXT NOT NULL,
    continent TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    estimated_budget DECIMAL(12,2),
    target_year INTEGER,
    trip_type TEXT DEFAULT 'solo' CHECK (trip_type IN ('solo', 'couple', 'family', 'friends', 'business')),
    motivation TEXT, -- frase do usuário
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'visited')),
    trip_id UUID REFERENCES trips(id), -- vincula quando "Transformar em Viagem"
    visited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- passport_badges: Badges conquistados
CREATE TABLE passport_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL, -- 'explorer_sa', 'eurotrip', 'world_tour', 'nomad', 'frequent', 'half_world'
    badge_name TEXT NOT NULL,
    xp_awarded INTEGER DEFAULT 0,
    achieved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);
```

### 14.2 Índices Recomendados

```sql
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_trips_user_country ON trips(user_id, destination_country);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trip_memories_user ON trip_memories(user_id);
CREATE INDEX idx_trip_memories_trip ON trip_memories(trip_id);
CREATE INDEX idx_bucket_list_user_status ON bucket_list_items(user_id, status);
CREATE INDEX idx_bucket_list_priority ON bucket_list_items(user_id, priority);
CREATE INDEX idx_passport_badges_user ON passport_badges(user_id);
```

---

## 15. LIFE SYNC SCORE — COMPONENTE EXPERIÊNCIAS

### 15.1 Peso no Score Geral

O módulo Experiências contribui com **8%** do Life Sync Score total. É o módulo com menor peso individual porque é episódico (não diário), mas sua contribuição é importante para o equilíbrio de vida.

### 15.2 Fórmula

```
Experiências Score = (
    (viagens_concluidas_12meses > 0 ? 1.0 : 0.0) × 0.40 +
    (memorias_registradas / viagens_concluidas) × 0.30 +
    (bucket_list_items > 0 ? 1.0 : 0.0) × 0.15 +
    (budget_accuracy) × 0.15
) × 100

Onde:
- viagens_concluidas_12meses: COUNT de trips com status 'completed' nos últimos 12 meses
- memorias_registradas: COUNT de trip_memories para viagens concluídas
- viagens_concluidas: total de viagens concluídas (all time)
- bucket_list_items: COUNT de bucket_list_items com status 'pending' (ter sonhos = positivo)
- budget_accuracy: 1 - |budget_difference| / budget_planned (quanto mais próximo do orçado, melhor)
  Se não há envelope vinculado, budget_accuracy = 0.5 (neutro)

Limitado a 100 (teto)
```

### 15.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Estagnado — sem viagens recentes nem planos |
| 21-40 | Início — alguma atividade ou planos tímidos |
| 41-60 | Regular — viajando ocasionalmente, com planos |
| 61-80 | Bom — viajando com consistência e registrando memórias |
| 81-100 | Excelente — explorador ativo com memórias ricas e orçamento controlado |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 16.1 Funcionalidades que agregam valor para futuras versões

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Itinerário dia-a-dia** | Dentro do detalhe da viagem, planejar atividades por dia com horário, local e custo | Agrega valor de planejamento comparável ao Wanderlog. Reduz necessidade de app externo | Alta — pós-MVP |
| **Checklist de viagem** | Lista pré-configurada por tipo de viagem (passaporte, visto, seguro, vacinas, câmbio) | Reduz ansiedade pré-viagem. Modelos prontos aceleram setup | Alta — pós-MVP |
| **Compartilhamento de viagem** | Viagem compartilhada com parceiro/amigos (view-only ou colaborativa) | Killer feature social. iBucket já faz isso para bucket lists | Média — v4 |
| **GPS Tracking** | Com app nativo, tracking automático de rota (estilo Polarsteps) | Wow-factor visual. Requer app nativo (PWA não suporta background GPS) | Baixa — app nativo |
| **Travel Books** | Gerar PDF/livro bonito com fotos e memórias de cada viagem | Monetização forte. Polarsteps cobra R$ 150-600 por livro impresso | Média — v4 |
| **Templates de bucket list** | Listas pré-montadas ("7 Maravilhas do Mundo", "Destinos para nômades digitais") | Reduz fricção. Novos usuários já começam com destinos para se inspirar | Alta — pós-MVP |
| **Gastos detalhados por categoria** | Dentro da viagem, breakdown: hospedagem, alimentação, transporte, passeios | Diferencial financeiro. Nenhum app de viagem integra com finanças pessoais desta forma | Média — pós-MVP |
| **Integração com APIs de câmbio** | Converter automaticamente gastos em moeda estrangeira para BRL | Reduz trabalho manual. Útil para viagens internacionais | Média — pós-MVP |

### 16.2 Críticas e Pontos de Atenção ao Protótipo Atual

**1. Cor do módulo incorreta no protótipo**
Os protótipos v2 usam `#06b6d4` (Cyan/Teal), mas a cor definida é `#ec4899` (Pink). O protótipo v3 deve corrigir TODAS as referências de cor. Isso inclui: variáveis CSS, gradients, badges, fills SVG do mapa, barras de progresso, tabs ativas.

**2. Falta tela de "Criar Viagem" (Wizard)**
O protótipo mostra as 5 telas principais + Memória Detalhe, mas não prototipa o fluxo de criação de viagem. É o fluxo mais crítico — sem ele, o módulo não funciona. Precisa de mínimo 1 tela com campos.

**3. Falta tela de "Detalhe da Viagem"**
Os cards de viagem são clicáveis mas não há tela de detalhe prototipada. O detalhe é onde o usuário gerencia a viagem (mudar status, ver progresso, acessar checklist).

**4. Falta tela de "Adicionar Destino" na Bucket List**
O CTA "Transformar em Viagem" existe mas o modal de adição de novo destino não está prototipado.

**5. Falta estados vazios (Empty States)**
Nenhuma tela mostra o estado inicial sem dados. O empty state é a primeira coisa que um novo usuário vê e é crucial para onboarding.

**6. Tab naming no Jornada tem inconsistência**
Protótipo Jornada mostra: Dashboard | Missões | Passaporte | Diário | Aventuras
"Missões" substitui "Viagens" e "Aventuras" substitui "Bucket List" — ok.
"Diário" substitui "Memórias" — ok.
Mas "Dashboard" permanece igual — considerar renomear para "Base" ou "QG" para manter coerência de linguagem de aventura.

### 16.3 Recomendação de Telas Adicionais para Prototipagem

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 07 | Criar Viagem (Wizard) | 🔴 Alta | Fluxo principal de criação — sem isso, o módulo não funciona |
| 06 | Detalhe da Viagem | 🔴 Alta | Tela de gestão da viagem (status, progresso, checklist) |
| 10 | Adicionar Destino (Modal) | 🟡 Média | Fluxo de adição na Bucket List |
| 11 | Celebração — Viagem Concluída | 🟡 Média (Jornada) | Momento de dopamina: confete, XP, badge desbloqueado |
| 12 | Empty States (todas as telas) | 🟡 Média | Primeira experiência do novo usuário |
| 13 | Relatório de Viagens | 🟢 Baixa (PRO) | Analytics: gastos por viagem, países por ano, tendências |
| 14 | Transformar Bucket → Viagem (transição) | 🟢 Baixa | Feedback visual da transformação sonho → planejamento |

---

*Documento criado em: Março 2026*  
*Versão: 1.0 — Especificação Funcional Completa*  
*Protótipo base: `proto-experiencias-v2-parte1.html` + `proto-experiencias-v2-parte2.html`*  
*Cor definida pelo usuário: `#ec4899` (Pink) — protótipos v2 usam cor INCORRETA*  
*Próximo passo: Validação das funcionalidades → Prototipagem v3 com cor corrigida → Prompt Claude Code*
