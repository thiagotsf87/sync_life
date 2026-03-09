# 📈 Especificação Funcional — Módulo Patrimônio

**Versão:** 1.0  
**Data:** 07/03/2026  
**Módulo:** 📈 Patrimônio (Investimentos e Ativos)  
**Cor:** `#3b82f6` (Blue)  
**Ícone Lucide:** `TrendingUp`  
**Subtítulo:** Investimentos e ativos  
**Pergunta norteadora:** "Como está meu patrimônio?"  
**Status:** 📋 Especificação funcional para desenvolvimento  
**Referências:** ADR-001, MVP-V3-ESPECIFICACAO-COMPLETA-V2, migration 005_fase6_infra_v3.sql

> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 1 — Dashboard](#5-tela-1--dashboard)
6. [Tela 2 — Carteira de Ativos](#6-tela-2--carteira-de-ativos)
7. [Tela 3 — Proventos](#7-tela-3--proventos)
8. [Tela 4 — Evolução Patrimonial](#8-tela-4--evolução-patrimonial)
9. [Tela 5 — Simulador IF](#9-tela-5--simulador-if)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações Cross-Módulo](#11-integrações-cross-módulo)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Componente Patrimônio](#15-life-sync-score--componente-patrimônio)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o módulo Patrimônio

O Patrimônio é o **módulo de construção de riqueza** do SyncLife. Ele permite ao usuário acompanhar toda a sua carteira de investimentos — ações, FIIs, renda fixa, ETFs, BDRs, criptomoedas e outros ativos — em um único lugar, visualizando a evolução patrimonial ao longo do tempo, acompanhando proventos recebidos e simulando cenários de independência financeira.

Enquanto o módulo Finanças cuida do **fluxo** do dinheiro (quanto entra, quanto sai, quanto sobra), o Patrimônio cuida do **estoque** de riqueza (quanto o usuário acumulou, quanto rende, quanto falta para a liberdade financeira). São lados complementares da mesma moeda.

### 1.2 Por que existe

Sem o Patrimônio, o SyncLife seria apenas um app de controle de gastos. A maioria das pessoas que se organiza financeiramente tem um objetivo: **investir e construir riqueza**. O módulo Patrimônio fecha esse ciclo — o dinheiro que sobra no orçamento (Finanças) vira aporte (Patrimônio) que gera rendimento que vira renda passiva que alimenta os sonhos (Futuro).

### 1.3 Proposta de valor única (diferencial competitivo)

O grande diferencial do Patrimônio no SyncLife não é ser um tracker de carteira — Kinvo, Investidor 10 e Snowball Analytics já fazem isso. O diferencial é a **conexão com todas as outras dimensões da vida**:

- O provento que entra na carteira vira automaticamente receita no Finanças
- O aporte mensal sai como despesa planejada do orçamento
- O salário de Carreira alimenta a projeção de aportes futuros
- Os objetivos de Futuro puxam metas patrimoniais automáticas
- A promoção simulada em Carreira encurta o prazo de IF no Simulador
- As viagens de Experiências mostram o impacto no patrimônio

Nenhum app concorrente conecta "receber um aumento" com "chegar na IF 3 anos antes" com "conseguir viajar mais" num fluxo integrado. O SyncLife faz isso.

### 1.4 Sub-telas e frequência de uso

| Sub-tela | Frequência | Objetivo |
|----------|-----------|----------|
| Dashboard | Diária/Semanal | Visão geral rápida do patrimônio, KPIs, alocação |
| Carteira | Semanal | Gestão dos ativos individuais, compra/venda, cotações |
| Proventos | Mensal | Acompanhamento de dividendos, JCP, rendimentos de FIIs |
| Evolução | Mensal | Gráfico histórico, crescimento por classe, aportes vs rendimentos |
| Simulador IF | Eventual | Projeção de independência financeira, cenários comparativos |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Apps analisados

| App | O que faz bem | O que falta | Preço |
|-----|--------------|-------------|-------|
| **Kinvo** (BR) | Consolidação via B3, proventos detalhados, comparação com benchmarks (CDI, Ibov), sensibilidade de ativos | Não conecta investimentos com orçamento ou metas de vida, lento para atualizar cotações, sem simulador de IF robusto | FREE (limitado) / Premium R$ 19,90/mês |
| **Investidor 10** (BR) | Análises fundamentalistas aprofundadas, comunidade ativa, screeners, bom para research, nota alta nas stores | Foco mais analítico que de gestão pessoal, não rastreia orçamento, sem integração com vida financeira do dia a dia | FREE (limitado) / PRO R$ 14,90/mês |
| **Empower** (US) | Melhor tracker gratuito, visão de net worth completa, análise de fees, planejamento de aposentadoria, tudo integrado | Não disponível no Brasil, sem suporte a ativos brasileiros (FIIs, Tesouro Direto), interface densa | FREE (tracker) / Wealth Management (0.49-0.89% AUM) |
| **Snowball Analytics** | Excelente para dividendos, tracking detalhado, rebalanceamento, diversas currencies | Sem conexão com orçamento pessoal, pago para usar de verdade, sem simulador de IF, sem metas de vida | FREE (1 portfolio, 10 holdings) / $14,99/mês |
| **Sharesight** (AU) | 50+ exchanges globais, relatórios fiscais por país, análise de overlap de ETFs, multi-currency nativo | Fraco em ativos não-listados, sem rastreio de dívidas, currency travada no setup, caro para uso básico | FREE (1 portfolio) / Investor $19/mês |
| **getquin** (EU) | Social/comunidade, dark mode excelente, tracking por região/indústria/classe, dividendos visuais | Problemas de sincronização reportados, sem simulador, sem integração com finanças pessoais | FREE / PLUS €6,99/mês |
| **Delta by eToro** | Dashboard unificado cripto + ações, dark mode clean, alertas de preço, design minimalista | Limitado em análise fundamentalista, sem proventos detalhados, sem net worth, sem metas | FREE / PRO $59,99/ano |
| **Kubera** (US) | Melhor para HNWI, suporta ativos alternativos (imóveis, arte, domínios), beneficiary management, multi-entity | Muito caro ($249/ano), sem tracking de transações individuais, sem tax reporting, sem historical cost basis | $249/ano / Black $2.499/ano |
| **Gorila** (BR) | Consolidação brasileira, dados oficiais, ilimitado grátis, app intuitivo | Funcionalidades limitadas, sem simulador robusto, sem cross-module | FREE / GorilaPRO (B2B) |

### 2.2 Diferenciais do SyncLife

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Proventos → Receita automática** | Dividendos recebidos viram receita no módulo Finanças automaticamente, categorizados corretamente | Nenhum |
| **Aportes → Despesa no orçamento** | Compra de ativo pode gerar despesa planejada no Finanças, mantendo orçamento realista | Nenhum |
| **Simulador IF conectado à vida** | Usa salário real (Carreira), gastos reais (Finanças), promoções simuladas para projetar IF | Nenhum |
| **Meta patrimonial via Futuro** | Objetivos de vida distribuem metas para Patrimônio que são rastreadas automaticamente | Nenhum |
| **Experiência unificada** | Insights motivacionais, benchmark vs CDI, contexto emocional sempre visíveis | Nenhum |
| **Cross-module insight IA** | "Sua promoção para sênior (Carreira) encurtaria sua IF em 5 anos" | Nenhum |
| **Proventos no calendário** | Datas de pagamento de dividendos aparecem automaticamente no módulo Tempo | Kinvo (calendário próprio, não integrado) |
| **Regra dos 4% integrada** | Simulador calcula patrimônio-alvo baseado nos gastos reais do usuário (dados do Finanças) | Nenhum com dados reais de gastos |

### 2.3 O que aprendemos com o benchmark

1. **Kinvo é o referencial brasileiro**: Com 1M+ de usuários e aquisição pelo BTG, é o app que os brasileiros mais usam. Mas é silo — não conecta com nada. O SyncLife preenche esse gap.

2. **Empower prova o modelo integrado**: É o app mais recomendado nos EUA justamente porque junta investimentos + orçamento + net worth. O SyncLife faz o mesmo para o mercado brasileiro, com camadas adicionais (metas de vida, carreira, saúde).

3. **Dividendos são o grande engajador**: Snowball, getquin e Kinvo todos enfatizam dividendos como feature-chave. Investidores adoram ver renda passiva crescendo. O módulo de Proventos precisa ser excelente.

4. **Simulador de IF é diferencial emocional**: Poucos apps oferecem, e quando oferecem é genérico. Conectar com dados reais do usuário (salário, gastos, carteira) torna o simulador significativamente mais poderoso e preciso.

5. **Dark mode é padrão**: Todos os apps modernos de investimentos usam dark mode como default. O SyncLife Navy Dark já atende isso perfeitamente.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Diagrama de fluxo entre telas

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULE BAR / SIDEBAR                      │
│                    📈 Patrimônio                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              HEADER: 📈 Patrimônio [badge: N ativos]        │
│  ─── Dashboard ── Carteira ── Proventos ── Evolução ───     │
│                    (underline tabs)                          │
└──────┬──────────┬──────────┬──────────┬─────────────────────┘
       │          │          │          │
       ▼          │          │          │
┌──────────┐      │          │          │
│DASHBOARD │      │          │          │
│ L1       │      │          │          │
│          │      │          │          │
│ [Hero]   │      │          │          │
│ [KPIs]   │      │          │          │
│ [Donut]  │      │          │          │
│ [IF bar] │      │          │          │
│ [Top5]   │      │          │          │
│ [AI tip] │      │          │          │
└──────────┘      │          │          │
                  ▼          │          │
           ┌──────────┐      │          │
           │CARTEIRA  │      │          │
           │ L1       │      │          │
           │          │      │          │
           │ [Filter] │      │          │
           │ [Assets] │──────┼──→ [Detalhe Ativo L2]
           │ [+Oper.] │──────┼──→ [Modal Compra/Venda]
           │ [Setor]  │      │   [Modal Atualizar Cotação]
           └──────────┘      │
                             ▼
                      ┌──────────┐
                      │PROVENTOS │
                      │ L1       │
                      │          │
                      │ [Acum.]  │
                      │ [Barras] │
                      │ [Próxim] │──→ [Modal Registrar Provento]
                      │ [Histór] │
                      │ [Auto$]  │
                      └──────────┘
                                       ▼
                                ┌──────────────┐
                                │  EVOLUÇÃO    │
                                │  L1          │
                                │              │
                                │  [Período]   │
                                │  [Gráfico]   │
                                │  [Por classe]│
                                │  [Aportes×R] │
                                └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SIMULADOR IF — Acesso via Dashboard CTA ou Sidebar item    │
│  L2 (tela interna, header ← Patrimônio / Simulador IF)     │
│                                                              │
│  [Inputs]  →  [Resultado Hero]  →  [Cenários]  →  [AI tip] │
│  PRO only (FREE vê paywall)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Tabela de hierarquia

| Tela | Nível | Acesso via | Voltar para |
|------|-------|-----------|-------------|
| Dashboard | L1 | Tab "Dashboard" (default) | — |
| Carteira | L1 | Tab "Carteira" | — |
| Proventos | L1 | Tab "Proventos" | — |
| Evolução | L1 | Tab "Evolução" | — |
| Simulador IF | L2 | CTA no Dashboard / Sidebar sub-item | ← Patrimônio (Dashboard) |
| Detalhe do Ativo | L2 | Tap no ativo na Carteira | ← Carteira |
| Modal Compra/Venda | Modal | Botão + na Carteira | Fechar → Carteira |
| Modal Registrar Provento | Modal | Botão + nos Proventos | Fechar → Proventos |
| Modal Atualizar Cotação | Modal | Botão no card do ativo | Fechar → Carteira |

### 3.3 Padrão de navegação

- **Header (L1):** Ícone 📈 + "Patrimônio" + badge com total de ativos
- **Sub-nav:** Tabs com **underline** (não pills) — Dashboard | Carteira | Proventos | Evolução
- **Telas L2 (Simulador, Detalhe):** Header simplificado ← Patrimônio / [Nome da tela], sem sub-nav
- **Modais:** Overlay com backdrop blur, fechar com × ou tap fora

---

## 4. MAPA DE FUNCIONALIDADES

```
📈 PATRIMÔNIO
│
├── Dashboard (L1 — tab default)
│   ├── Hero — Patrimônio líquido total + variação mensal
│   ├── KPI Grid — Renda Fixa, Renda Variável, FIIs, Cripto (valores + %)
│   ├── Donut Chart — Alocação por classe de ativos
│   │   └── Legenda interativa (tap expande detalhes)
│   ├── Barra IF — Progresso para independência financeira + projeção
│   ├── Top 5 Ativos — Lista dos maiores por valor com variação
│   ├── [Jornada] AI Insight Card — Insight contextual sobre a carteira
│   ├── [Jornada] Benchmark vs CDI — Comparação rentabilidade × CDI
│   └── CTA Simulador IF → navega para tela L2
│
├── Carteira (L1 — tab)
│   ├── Filter Pills — Todos | Renda Fixa | Ações | FIIs | ETFs | BDRs | Cripto | Outros
│   ├── Summary Bar — Total investido + rendimento total + variação do dia
│   ├── Grouped Asset List — Agrupados por classe
│   │   └── Asset Row — Ticker, nome, quantidade, cotação, valor total, variação %
│   │       ├── Tap → Detalhe do Ativo (L2)
│   │       └── Long press → Ações rápidas (atualizar cotação, excluir)
│   ├── [Jornada] Distribuição por Setor — Donut secundário
│   ├── Botão + FAB → Modal Registrar Operação (compra/venda)
│   └── Botão Atualizar Cotações (bulk) — manual FREE (1x/dia) / PRO (ilimitado)
│
├── Proventos (L1 — tab)
│   ├── Hero — Proventos acumulados no ano + breakdown por tipo
│   ├── Gráfico de barras — Proventos por mês (passado + previsão)
│   ├── Próximos Pagamentos — Lista de proventos anunciados/previstos
│   │   └── Row: Ícone + Ticker + Tipo + Data pagamento + Valor
│   ├── Histórico — Lista de proventos recebidos com filtros
│   ├── Toggle Auto-Finanças — Registrar proventos automaticamente como receita
│   ├── [Jornada] Yield on Cost por ativo
│   ├── [Jornada] Projeção de dividendos 12 meses
│   └── Botão + → Modal Registrar Provento Manual
│
├── Evolução (L1 — tab)
│   ├── Period Filter — 6M | 1A | 3A | 5A | Tudo
│   ├── Gráfico Linha — Evolução patrimonial ao longo do tempo
│   │   └── Linha tracejada = meta IF (se existir)
│   ├── Resumo — Patrimônio hoje + variação no período
│   ├── Crescimento por Classe — Lista com variação absoluta e % por classe
│   ├── Aportes × Rendimentos — Gráfico de barras empilhadas por mês
│   ├── [Jornada] Benchmark overlay (CDI, Ibovespa, IFIX)
│   └── [Jornada] Projeção futura (linhas pontilhadas otimista/conservador)
│
├── Simulador IF (L2 — PRO only)
│   ├── Inputs ajustáveis:
│   │   ├── Patrimônio atual (pré-preenchido da carteira)
│   │   ├── Aporte mensal (sugestão baseada no orçamento do Finanças)
│   │   ├── Rentabilidade esperada a.a. (default 10%)
│   │   └── Renda passiva desejada/mês
│   ├── Resultado Hero — "Você atinge a IF em X anos" + data + patrimônio-alvo
│   ├── KPI Grid — Tempo para IF, Patrimônio alvo, Progresso %, Proventos/mês
│   ├── Gráfico Projeção — Curva de crescimento patrimonial
│   ├── Cenários Comparativos — 3 cenários (menor aporte, atual, maior aporte)
│   ├── [Jornada] AI Insight Cross-Module
│   │   └── "Promoção sênior reduziria IF em 5 anos"
│   └── Botão Resetar
│
├── Detalhe do Ativo (L2)
│   ├── Header: Ticker + Nome + Classe + Setor
│   ├── Cotação atual + variação dia/semana/mês
│   ├── KPIs: Quantidade, PM, Valor investido, Valor atual, P/L
│   ├── Histórico de operações (compras e vendas)
│   ├── Proventos recebidos deste ativo
│   ├── Botão Atualizar Cotação
│   ├── Botão Registrar Operação
│   └── Botão Excluir Ativo (com confirmação)
│
└── Modais / Sheets
    ├── Modal Registrar Operação (Compra/Venda)
    │   ├── Tipo: Compra / Venda (toggle)
    │   ├── Ticker (com autocomplete)
    │   ├── Nome do ativo
    │   ├── Classe do ativo (select)
    │   ├── Setor (opcional)
    │   ├── Quantidade
    │   ├── Preço unitário
    │   ├── Taxas/corretagem
    │   ├── Data da operação
    │   ├── Notas (opcional)
    │   ├── Toggle: Sincronizar aporte com Finanças
    │   └── Botão Salvar
    ├── Modal Registrar Provento
    │   ├── Ativo (select dos ativos na carteira)
    │   ├── Tipo: Dividendo | JCP | Rendimento FII | Juros RF | Outro
    │   ├── Valor total
    │   ├── Data de pagamento
    │   ├── Data ex (opcional)
    │   ├── Status: Anunciado | Recebido
    │   └── Toggle: Registrar em Finanças
    └── Modal Atualizar Cotação
        ├── Ativo (read-only)
        ├── Cotação atual
        ├── Nova cotação
        └── Botão Atualizar
```

---

## 5. TELA 1 — DASHBOARD

### 5.1 Objetivo

Ser o "cockpit patrimonial" — em 5 segundos o usuário sabe: quanto tem investido, se está ganhando ou perdendo, como está a diversificação, e quanto falta para a independência financeira. É a tela mais visitada do módulo.

### 5.2 Componentes

#### C1 — Hero Card (Patrimônio Líquido Total)

- **Objetivo:** Impacto visual imediato com o valor total da carteira e a tendência mensal
- **Dados exibidos:**
  - Patrimônio líquido total = Σ(ativo.quantity × ativo.current_price OU ativo.avg_price)
  - Variação mensal absoluta (R$ +X.XXX) e percentual (+X,XX%)
  - Badge de status: verde (positivo) ou vermelho (negativo)
- **Critérios de aceite:**
  - CA-01: Valor total é calculado com current_price quando disponível, fallback para avg_price
  - CA-02: Variação mensal compara valor atual vs valor do primeiro dia do mês
  - CA-03: Fundo do card usa gradiente suave com cor do módulo `rgba(59,130,246,0.12)` a `rgba(59,130,246,0.04)`
  - CA-04: Valor exibido em DM Mono, tamanho proeminente (34px mobile)
  - CA-05: Estado vazio mostra "R$ 0,00" com CTA "Adicionar primeiro ativo"
- **Resultado esperado:** Usuário vê o valor total do patrimônio e sabe imediatamente se cresceu ou diminuiu no mês

#### C2 — KPI Grid (4 cards)

- **Objetivo:** Breakdown rápido por tipo de investimento, mostrando distribuição da carteira
- **Dados exibidos:**
  - Card 1: Renda Fixa (valor + % da carteira) — cor `#10b981`
  - Card 2: Renda Variável (valor + % da carteira) — cor `#f59e0b`
  - Card 3: FIIs (valor + % da carteira) — cor `#06b6d4`
  - Card 4: Cripto (valor + % da carteira) — cor `#f97316`
- **Critérios de aceite:**
  - CA-06: Grid 2×2 em mobile (375px), 4 colunas em desktop
  - CA-07: Valores em DM Mono, porcentagens em DM Sans
  - CA-08: Classes são agrupadas: stocks_br + bdrs = "Renda Variável", fiis = "FIIs", fixed_income = "Renda Fixa", crypto = "Cripto", etfs_br + stocks_us + reits = contados conforme classe subjacente, other = "Outros"
  - CA-09: Se uma classe não tem ativos, o card ainda aparece com R$ 0 e 0%
- **Resultado esperado:** Usuário entende a composição geral da carteira sem acessar detalhes

#### C3 — Donut Chart (Alocação por Classe)

- **Objetivo:** Visualização gráfica da diversificação da carteira
- **Dados exibidos:**
  - Gráfico donut SVG com segmentos proporcionais ao valor por classe
  - Centro: "N classes" ou total da carteira
  - Legenda: Grid 2×2 com cor + classe + porcentagem
- **Critérios de aceite:**
  - CA-10: Donut é responsivo, 140px no mobile, 180px no desktop
  - CA-11: Cores seguem padrão por classe (consistente com KPI Grid)
  - CA-12: Animação suave de desenho ao aparecer (1s, easeOut)
  - CA-13: Tap em segmento destaca classe e mostra tooltip com valor
  - CA-14: Legenda é grid 2×2, não lista vertical
- **Resultado esperado:** Usuário visualiza instantaneamente se a carteira está diversificada ou concentrada

#### C4 — Barra de Progresso IF

- **Objetivo:** Contextualizar o patrimônio atual dentro do objetivo maior de independência financeira
- **Dados exibidos:**
  - Meta IF baseada na regra dos 4% × gastos mensais do Finanças (ou input manual se não integrado)
  - Progresso atual em % (patrimônio ÷ meta)
  - Projeção em texto: "R$ XXk de R$ X,XM · Projeção: 20XX (N anos)"
- **Critérios de aceite:**
  - CA-15: Barra de progresso com gradient `#3b82f6` → `#10b981`
  - CA-16: Se Finanças integrado, gastos mensais médios (últimos 3 meses) × 300 = meta IF
  - CA-17: Se não integrado, usuário define meta IF manualmente nas configurações
  - CA-18: Projeção calcula com aporte médio (últimos 3 meses) e rentabilidade configurada
  - CA-19: Tap na barra navega para Simulador IF (se PRO) ou mostra UpgradeModal (se FREE)
- **Resultado esperado:** Usuário tem noção constante de "onde estou vs onde quero chegar"

#### C5 — Top 5 Ativos

- **Objetivo:** Mostrar os maiores ativos da carteira por valor, para monitoramento rápido
- **Dados exibidos:**
  - Lista dos 5 ativos com maior (quantity × current_price)
  - Cada item: Ticker, nome resumido, valor total, variação %
- **Critérios de aceite:**
  - CA-20: Ordenado por valor decrescente, máximo 5 itens
  - CA-21: Tap em ativo navega para Detalhe do Ativo (L2)
  - CA-22: Variação % com cor condicional (verde positivo, vermelho negativo, cinza zero)
  - CA-23: Se carteira vazia, componente não aparece
- **Resultado esperado:** Usuário monitora os ativos mais relevantes sem abrir a Carteira

#### C6 — [Jornada] AI Insight Card

- **Objetivo:** Prover insight contextual e motivacional sobre a carteira do usuário
- **Dados exibidos:**
  - Mensagem gerada com base nos dados reais da carteira
  - Exemplos: "Seu patrimônio cresceu 3,2% este mês — acima do CDI!", "28% concentrado em PETR4 — considere diversificar", "Seus dividendos mensais já cobrem 15% das suas contas fixas"
- **Critérios de aceite:**
  - CA-24: Componente marcado com classe `.jornada-only`
  - CA-25: Ícone 🤖 + fundo com gradiente azul sutil
  - CA-26: Mensagem contextual (não genérica), baseada em dados reais
  - CA-27: FREE: 1 insight/semana (genérico). PRO + Jornada: ilimitados e contextuais
- **Resultado esperado:** Usuário recebe orientação inteligente sobre sua carteira

#### C7 — [Jornada] Benchmark vs CDI

- **Objetivo:** Comparar a rentabilidade da carteira contra o CDI (benchmark mais usado no Brasil)
- **Dados exibidos:**
  - Mini gráfico de linhas: Carteira vs CDI (últimos 12 meses)
  - Texto: "Sua carteira rendeu X% vs CDI X% no período"
- **Critérios de aceite:**
  - CA-28: Componente `.jornada-only`
  - CA-29: Se carteira < 3 meses, mostra "Dados insuficientes para benchmark"
  - CA-30: Cores: carteira = `#3b82f6`, CDI = `#10b981`
- **Resultado esperado:** Usuário sabe se a carteira está superando ou perdendo para o CDI

---

## 6. TELA 2 — CARTEIRA DE ATIVOS

### 6.1 Objetivo

Tela de gestão operacional: listar todos os ativos, filtrar por classe, registrar operações de compra/venda, atualizar cotações. É a "mesa de trabalho" do investidor.

### 6.2 Componentes

#### C8 — Filter Pills

- **Objetivo:** Permitir filtrar ativos por classe rapidamente
- **Dados:** Pills horizontais: Todos | Renda Fixa | Ações | FIIs | ETFs | BDRs | Cripto | Outros
- **Critérios de aceite:**
  - CA-31: Pill ativa usa cor do módulo `#3b82f6` com texto preto
  - CA-32: Scroll horizontal em mobile se necessário
  - CA-33: "Todos" é default selecionado ao abrir a tela
  - CA-34: Filtro atua instantaneamente (client-side)
- **Resultado esperado:** Usuário navega entre classes de ativos com 1 tap

#### C9 — Summary Bar

- **Objetivo:** Resumo numérico compacto do estado geral da carteira
- **Dados:** Total investido (Σ quantity × avg_price), rendimento total (Σ lucro/prejuízo), variação do dia %
- **Critérios de aceite:**
  - CA-35: Atualiza ao trocar filtro (mostra total da classe filtrada, não geral)
  - CA-36: Variação do dia = (valor atual - valor anterior) ÷ valor anterior × 100
  - CA-37: Renderiza como card compacto com DM Mono para valores
- **Resultado esperado:** Usuário sabe o resumo financeiro da seleção atual

#### C10 — Grouped Asset List

- **Objetivo:** Listar todos os ativos agrupados por classe para fácil navegação
- **Dados:** Para cada ativo: ticker, nome, quantidade, cotação, valor total, variação %
- **Critérios de aceite:**
  - CA-38: Agrupamento segue ordem: Renda Fixa → Ações → FIIs → ETFs → BDRs → Cripto → Outros
  - CA-39: Cada grupo tem section-title com nome e quantidade de ativos
  - CA-40: Asset Row mostra dot colorido (cor da classe) + ticker + nome + valor + variação
  - CA-41: Tap em ativo navega para Detalhe do Ativo (L2)
  - CA-42: Estado vazio: ilustração + "Sua carteira está vazia. Registre sua primeira operação!"
  - CA-43: Busca por ticker ou nome (campo search no topo)
- **Resultado esperado:** Usuário visualiza toda a carteira organizada por classe

#### C11 — Botão Atualizar Cotações (Bulk)

- **Objetivo:** Atualizar todas as cotações dos ativos de uma vez
- **Critérios de aceite:**
  - CA-44: FREE: 1 atualização por dia. PRO: ilimitado
  - CA-45: Botão no header da carteira com ícone RefreshCw
  - CA-46: Loading spinner durante atualização
  - CA-47: Toast de sucesso com "X cotações atualizadas"
  - CA-48: Se FREE atingiu limite, toast informativo com upsell para PRO
- **Resultado esperado:** Usuário mantém cotações atualizadas com um clique

#### C12 — FAB de nova operação

- **Objetivo:** Acesso rápido ao modal de compra/venda
- **Critérios de aceite:**
  - CA-49: Botão + no header ou FAB flutuante, consistente com outros módulos
  - CA-50: Abre Modal Registrar Operação
- **Resultado esperado:** Registrar compra/venda com mínimo de atrito

---

## 7. TELA 3 — PROVENTOS

### 7.1 Objetivo

Acompanhar toda a renda passiva gerada pelos investimentos: dividendos, JCP, rendimentos de FIIs, juros de renda fixa. Mostrar acumulado, mensal e próximos pagamentos.

### 7.2 Componentes

#### C13 — Hero Card Proventos

- **Objetivo:** Impacto visual com total de proventos acumulados no ano
- **Dados:** Total acumulado no ano, breakdown por tipo (Dividendo, JCP, FII Yield, Juros RF), média mensal
- **Critérios de aceite:**
  - CA-51: Valor total em DM Mono 30px, destaque com cor do módulo
  - CA-52: Breakdown em 3 colunas com separadores verticais
  - CA-53: Filtro de ano (seletor no header: 2024, 2025, 2026)
  - CA-54: Fundo com gradiente azul suave
- **Resultado esperado:** Usuário vê o total de renda passiva gerada no período

#### C14 — Gráfico de Barras Mensal

- **Objetivo:** Visualizar a evolução mensal dos proventos, incluindo previsão
- **Dados:** Barras por mês — meses passados com valor real, mês futuro com previsão (tracejado)
- **Critérios de aceite:**
  - CA-55: Barras preenchidas para meses realizados, tracejadas para previsão
  - CA-56: Mês atual destacado com cor cheia do módulo
  - CA-57: Valor em DM Mono sobre cada barra
  - CA-58: Scroll horizontal se mais de 6 meses
- **Resultado esperado:** Usuário percebe tendência de crescimento (ou queda) nos proventos

#### C15 — Próximos Pagamentos

- **Objetivo:** Listar proventos anunciados mas ainda não recebidos
- **Dados:** Lista de proventos com status = 'announced': ticker, tipo, data de pagamento, valor estimado, valor por unidade
- **Critérios de aceite:**
  - CA-59: Ordenado por data de pagamento crescente (próximo primeiro)
  - CA-60: Ícone diferente por tipo (🏢 FII, 💰 Dividendo, 📊 JCP)
  - CA-61: Se nenhum provento anunciado, mostra "Nenhum pagamento próximo"
  - CA-62: Valor por unidade exibido em DM Mono menor
- **Resultado esperado:** Usuário sabe exatamente quando e quanto vai receber

#### C16 — Toggle Auto-Finanças

- **Objetivo:** Controlar se proventos recebidos devem gerar automaticamente uma receita no módulo Finanças
- **Dados:** Switch on/off, descrição explicativa
- **Critérios de aceite:**
  - CA-63: Persistido em `profiles.patrimonio_auto_financas` ou em settings
  - CA-64: Quando ativo, todo provento com status = 'received' dispara `createTransactionFromProvento()`
  - CA-65: Descrição: "Proventos recebidos entram automaticamente como Receita em Finanças"
  - CA-66: Ícone 🔄 ao lado do toggle
- **Resultado esperado:** Usuário não precisa registrar manualmente proventos no Finanças

#### C17 — [Jornada] Yield on Cost

- **Objetivo:** Mostrar o rendimento de dividendos em relação ao preço médio de aquisição
- **Dados:** Para cada ativo com proventos, YoC = proventos 12m ÷ valor investido × 100
- **Critérios de aceite:**
  - CA-67: Componente `.jornada-only`
  - CA-68: Ordenado por YoC decrescente (melhores pagadores primeiro)
  - CA-69: Barra visual proporcional ao YoC
- **Resultado esperado:** Investidor entende quais ativos são os melhores geradores de renda passiva proporcionalmente

#### C18 — [Jornada] Projeção de Dividendos 12 meses

- **Objetivo:** Estimar quanto o usuário receberá em proventos nos próximos 12 meses
- **Dados:** Projeção baseada na média dos últimos 12 meses × ativos atuais
- **Critérios de aceite:**
  - CA-70: Componente `.jornada-only`
  - CA-71: Exibe valor mensal projetado e anual projetado
  - CA-72: Disclaimer: "Projeção baseada em histórico. Proventos não são garantidos."
- **Resultado esperado:** Usuário tem expectativa realista de renda passiva futura

---

## 8. TELA 4 — EVOLUÇÃO PATRIMONIAL

### 8.1 Objetivo

Visualizar a trajetória patrimonial ao longo do tempo com gráficos de evolução, decomposição por classe e comparação entre aportes e rendimentos.

### 8.2 Componentes

#### C19 — Period Filter

- **Objetivo:** Selecionar o período de visualização
- **Dados:** Pills: 6M | 1A | 3A | 5A | Tudo
- **Critérios de aceite:**
  - CA-73: Pill ativa com cor do módulo `#3b82f6`
  - CA-74: "1A" (1 Ano) é default
  - CA-75: Alterar período recalcula todos os componentes da tela
- **Resultado esperado:** Usuário escolhe o horizonte temporal desejado

#### C20 — Gráfico de Linha (Evolução)

- **Objetivo:** Mostrar o crescimento patrimonial ao longo do tempo
- **Dados:** Linha contínua com valor do patrimônio por mês, área preenchida, ponto atual destacado
- **Critérios de aceite:**
  - CA-76: Linha com cor `#3b82f6`, área com gradiente suave
  - CA-77: Linha tracejada da meta IF (se configurada) como referência
  - CA-78: Tooltip ao tocar: mês + valor exato
  - CA-79: Eixo X: meses/anos, Eixo Y: valores em R$
  - CA-80: Ponto final (hoje) com círculo preenchido
- **Resultado esperado:** Usuário visualiza a tendência de crescimento do patrimônio

#### C21 — Resumo do Período

- **Objetivo:** Números-chave do período selecionado
- **Dados:** Patrimônio hoje + Variação absoluta + Variação %
- **Critérios de aceite:**
  - CA-81: Valores em DM Mono, proeminentes
  - CA-82: Variação positiva em verde, negativa em vermelho
- **Resultado esperado:** Contexto numérico do gráfico

#### C22 — Crescimento por Classe

- **Objetivo:** Decompor o crescimento por tipo de ativo
- **Dados:** Lista: classe + valor atual + variação absoluta + variação %
- **Critérios de aceite:**
  - CA-83: Dot colorido por classe (consistente com Dashboard)
  - CA-84: Ordenado por variação absoluta decrescente
  - CA-85: Variação com cor condicional
- **Resultado esperado:** Usuário identifica quais classes de ativos mais cresceram/caíram

#### C23 — Aportes × Rendimentos

- **Objetivo:** Mostrar a decomposição mensal entre quanto o usuário colocou e quanto rendeu
- **Dados:** Gráfico de barras horizontais por mês: barra aporte (cor do módulo) + barra rendimento (verde)
- **Critérios de aceite:**
  - CA-86: Legenda: Aportes (azul `#3b82f6`) + Rendimentos (verde `#10b981`)
  - CA-87: Cada mês mostra ambas as barras lado a lado
  - CA-88: Aportes = soma de operações de compra no mês
  - CA-89: Rendimentos = variação de patrimônio - aportes
- **Resultado esperado:** Usuário distingue entre crescimento por esforço (aportes) e por retorno (rendimentos)

#### C24 — [Jornada] Benchmark Overlay

- **Objetivo:** Sobrepor no gráfico de evolução linhas de CDI, Ibovespa e IFIX para comparação
- **Critérios de aceite:**
  - CA-90: Componente `.jornada-only`
  - CA-91: Linhas tracejadas com cores distintas
  - CA-92: Toggle para ativar/desativar cada benchmark
- **Resultado esperado:** Usuário compara sua performance contra os principais benchmarks brasileiros

---

## 9. TELA 5 — SIMULADOR IF

### 9.1 Objetivo

Projetar quando o usuário atingirá a independência financeira, considerando patrimônio atual, aportes mensais, rentabilidade esperada e renda passiva desejada. Recurso PRO exclusivo e diferencial competitivo.

### 9.2 Componentes

#### C25 — Inputs Ajustáveis

- **Objetivo:** Permitir ao usuário parametrizar a simulação
- **Dados:** 
  - Patrimônio atual (pré-preenchido da carteira real)
  - Aporte mensal (sugestão = sobra do orçamento no Finanças)
  - Rentabilidade esperada a.a. (default 10%, range 0-30%)
  - Renda passiva desejada/mês (sugestão = gastos médios do Finanças)
- **Critérios de aceite:**
  - CA-93: Cada input com botões +/- para ajuste rápido
  - CA-94: Patrimônio atual pré-preenchido = soma da carteira real
  - CA-95: Se Finanças integrado, aporte sugerido = (receita - despesas) últimos 3 meses
  - CA-96: Renda desejada sugerida = média de despesas mensais do Finanças (se integrado)
  - CA-97: Campos em DM Mono, labels em DM Sans uppercase
- **Resultado esperado:** Simulação personalizada com dados reais do usuário

#### C26 — Resultado Hero

- **Objetivo:** Impacto visual com o tempo estimado para atingir IF
- **Dados:** "Você atinge a IF em X anos" + data + patrimônio-alvo
- **Critérios de aceite:**
  - CA-98: Tempo em Syne bold 42px, cor do módulo
  - CA-99: Data e patrimônio alvo abaixo
  - CA-100: Sub-cards: Patrimônio Alvo (regra dos 4%) + Renda Passiva projetada
  - CA-101: Se já atingiu IF, mostra "Já atingiu! 🎉" com confetti (Jornada)
  - CA-102: Fundo com gradiente azul/verde
- **Resultado esperado:** Momento "uau" — usuário vê uma projeção concreta e realista

#### C27 — KPI Grid do Simulador

- **Objetivo:** Contextualizar os números da simulação
- **Dados:** Tempo para IF, Patrimônio alvo, Progresso %, Proventos/mês (média 12m)
- **Critérios de aceite:**
  - CA-103: Grid 4 colunas (2×2 mobile)
  - CA-104: Cada card com accent-bar na cor distinta
  - CA-105: Progresso com mini progress bar
- **Resultado esperado:** Visão 360° do cenário de independência financeira

#### C28 — Gráfico de Projeção

- **Objetivo:** Visualizar a curva de crescimento patrimonial até atingir IF
- **Dados:** Linha de projeção mês a mês (juros compostos)
- **Critérios de aceite:**
  - CA-106: Eixo X em anos, Eixo Y em valor
  - CA-107: Linha horizontal tracejada = patrimônio-alvo
  - CA-108: Ponto de interseção destacado (quando atinge IF)
  - CA-109: PRO: gráfico completo. FREE: paywall
- **Resultado esperado:** Usuário visualiza a curva de juros compostos trabalhando a favor

#### C29 — Cenários Comparativos

- **Objetivo:** Comparar 3 cenários para motivar aumento de aportes
- **Dados:** 3 linhas: menor aporte, aporte atual (destacado), maior aporte
- **Critérios de aceite:**
  - CA-110: Cenário 1 (menor aporte): vermelho + prazo maior
  - CA-111: Cenário 2 (atual): cor do módulo + marcado com ✓ Atual
  - CA-112: Cenário 3 (maior aporte): verde + prazo menor
  - CA-113: Label "Após promoção sênior" no cenário 3 se Carreira integrado
- **Resultado esperado:** Usuário percebe o impacto tangível de aumentar aportes

#### C30 — [Jornada] AI Cross-Module Insight

- **Objetivo:** Mostrar conexões entre módulos que impactam a IF
- **Dados:** Insight IA baseado em dados de Carreira + Finanças + Patrimônio
- **Critérios de aceite:**
  - CA-114: Componente `.jornada-only`
  - CA-115: Exemplo: "Atingir o cargo sênior (meta em Carreira) aumentaria seu aporte para R$ 3.500 e reduziria sua IF em 5 anos"
  - CA-116: Ícone 🤖 + fundo azul suave
- **Resultado esperado:** Usuário percebe como o SyncLife conecta todas as dimensões da vida

---

## 10. FLUXOS CRUD DETALHADOS

### 10.1 Ativo (via Operação)

#### CRIAR (Registrar Operação de Compra)

```
PASSO 1 — Acessar
├── Onde: Carteira → botão + (FAB ou header)
├── Ação: Abre Modal Registrar Operação
└── Default: Tipo = Compra selecionado

PASSO 2 — Preencher
├── Toggle: Compra / Venda
├── Campo: Ticker (uppercase, obrigatório)
│   └── Se ticker já existe na carteira, preenche nome e classe automaticamente
├── Campo: Nome do ativo (obrigatório)
├── Select: Classe do ativo (obrigatório)
│   └── Opções: Ações BR, FIIs, ETFs BR, BDRs, Renda Fixa, Cripto, Ações US, REITs, Outros
├── Campo: Setor (opcional, texto livre)
├── Campo: Quantidade (numérico > 0, obrigatório)
├── Campo: Preço unitário (numérico > 0, obrigatório)
├── Campo: Taxas/Corretagem (numérico ≥ 0, default 0)
├── Campo: Data da operação (date, default hoje)
├── Campo: Notas (opcional, texto)
└── Toggle: "Registrar aporte em Finanças" (default off)
    └── Se ativo: gera despesa automática no Finanças

PASSO 3 — Validações
├── Ticker: obrigatório, uppercase automático
├── Nome: obrigatório
├── Classe: obrigatória
├── Quantidade: > 0
├── Preço: > 0
├── FREE: máximo 10 ativos únicos (tickers distintos)
│   └── Se ticker já existe, permite nova compra (média preço)
│   └── Se ticker é novo e limite atingido, bloqueia com upsell
└── Data: não pode ser futura (máximo = hoje)

PASSO 4 — Sistema processa
├── Se ticker já existe em portfolio_assets:
│   ├── Atualiza quantity += nova quantidade
│   ├── Recalcula avg_price (preço médio ponderado incluindo taxas)
│   └── Insere em portfolio_transactions
├── Se ticker é novo:
│   ├── Insere em portfolio_assets
│   └── Insere em portfolio_transactions
├── Se toggle "Registrar em Finanças" ativo:
│   └── Chama createTransactionFromAporte() → cria despesa em Finanças
│       └── Descrição: "Auto — 📈 Patrimônio | Compra XXXX"
│       └── Categoria: "investimentos"
├── Recalcula totais do Dashboard
├── [Jornada] Gamificação:
│   ├── Primeiro ativo → Badge "Primeiro Ativo" (+30 XP)
│   ├── 3 classes → Badge "Diversificado" (+50 XP)
│   └── +10 XP por operação registrada
└── Feedback: Toast "Compra registrada!" + modal fecha + lista atualiza
```

#### EDITAR (Ativo)

```
PASSO 1 — Onde: Detalhe do Ativo → botão ✏️
PASSO 2 — Editável: nome, classe, setor, notas
├── NÃO editável: ticker (para mudar, excluir e recriar)
├── NÃO editável: quantidade e preço médio (gerenciados por operações)
PASSO 3 — Salvar: Atualiza portfolio_assets
└── Feedback: Toast "Ativo atualizado"
```

#### REGISTRAR VENDA

```
PASSO 1 — Acessar: Carteira → botão + → Toggle "Venda"
   OU: Detalhe do Ativo → botão "Registrar Venda"

PASSO 2 — Preencher
├── Ticker: pré-preenchido (se via Detalhe)
├── Quantidade: obrigatório, ≤ quantidade atual do ativo
├── Preço de venda: obrigatório, > 0
├── Taxas: ≥ 0
├── Data da operação: ≤ hoje
└── Notas: opcional

PASSO 3 — Validações
├── Quantidade vendida ≤ quantidade possuída
│   └── Se igual: venda total
│   └── Se menor: venda parcial
├── Se venda total: quantity do ativo vai para 0
│   └── Pergunta: "Manter ativo zerado na carteira para histórico?"
│       ├── Sim: mantém com quantity = 0
│       └── Não: soft-delete (status = 'sold')

PASSO 4 — Sistema processa
├── Atualiza portfolio_assets.quantity -= quantidade vendida
├── Recalcula avg_price (se venda parcial, mantém PM)
├── Insere em portfolio_transactions (operation = 'sell')
├── Calcula P/L da operação:
│   └── P/L = (preço_venda - avg_price) × quantidade - taxas
├── [Jornada] +10 XP por operação
└── Feedback: Toast "Venda registrada! P/L: +R$ X.XXX"
```

#### EXCLUIR (Ativo)

```
PASSO 1 — Onde: Detalhe do Ativo → botão Excluir (ícone lixeira)
PASSO 2 — Confirmação:
├── "Excluir XXXX e todas as operações?"
├── "⚠️ Transações de proventos geradas em Finanças NÃO serão removidas."
├── Botão "Cancelar" + Botão "Excluir" (vermelho)
PASSO 3 — Sistema processa:
├── DELETE portfolio_transactions WHERE asset_id = X
├── DELETE portfolio_dividends WHERE asset_id = X
├── DELETE portfolio_assets WHERE id = X
├── Recalcula Dashboard
├── Se ativo vinculado a objective_goal (Futuro):
│   └── Desvincula (linked_entity_id = NULL), não exclui a meta
└── Feedback: Toast "Ativo removido"
```

### 10.2 Provento

#### CRIAR (Registrar Provento)

```
PASSO 1 — Acessar: Proventos → botão + ou "Registrar Provento"
PASSO 2 — Preencher
├── Select: Ativo (lista dos ativos na carteira, obrigatório)
├── Select: Tipo (Dividendo | JCP | Rendimento FII | Juros RF | Outro)
├── Campo: Valor total (numérico > 0, obrigatório)
├── Campo: Valor por unidade (calculado automaticamente ou input manual)
├── Campo: Data de pagamento (obrigatório)
├── Campo: Data ex (opcional)
├── Select: Status (Anunciado | Recebido, default Recebido)
└── Toggle: "Registrar em Finanças" (segue config global, pode ser overridden)

PASSO 3 — Validações
├── Ativo obrigatório (deve existir na carteira)
├── Tipo obrigatório
├── Valor > 0
├── Data de pagamento obrigatória
└── Se valor_por_unidade informado: total = valor_por_unidade × ativo.quantity

PASSO 4 — Sistema processa
├── Insere em portfolio_dividends
├── Se status = 'received' E toggle Finanças ativo:
│   └── Chama createTransactionFromProvento()
│       └── Descrição: "Auto — 📈 Patrimônio | XXXX Dividendo"
│       └── Tipo: income
│       └── Categoria: "investimentos"
├── [Jornada] Badges:
│   ├── Primeiro provento → "Primeira Colheita" (+20 XP)
│   ├── 6 meses consecutivos com proventos → "Acúmulo Consistente" (+50 XP)
│   └── +5 XP por provento registrado
└── Feedback: Toast "Provento registrado!"
```

#### MUDAR STATUS (Provento)

| Ação | De | Para | Confirmação | O que acontece |
|------|-----|------|-------------|----------------|
| Receber provento | Anunciado | Recebido | Sim | Se auto-Finanças ativo, cria receita |
| Cancelar anúncio | Anunciado | (Excluído) | Sim | Remove registro |
| Devolver | Recebido | Anunciado | Sim | Se criou receita no Finanças, alerta para remover manualmente |

#### EXCLUIR (Provento)

```
PASSO 1 — Onde: Proventos → Histórico → swipe ou ícone lixeira
PASSO 2 — Confirmação:
├── "Excluir provento de XXXX (R$ XXX)?"
├── Se gerou receita no Finanças: "⚠️ A receita gerada em Finanças não será removida automaticamente."
PASSO 3 — DELETE portfolio_dividends WHERE id = X
└── Feedback: Toast "Provento removido"
```

### 10.3 Simulação IF

#### CRIAR/EXECUTAR SIMULAÇÃO

```
PASSO 1 — Acessar: Dashboard → CTA "Simular IF" ou Sidebar → Simulador IF
├── PRO only: FREE vê paywall com preview borrado

PASSO 2 — Ajustar parâmetros
├── Patrimônio atual: pré-preenchido, editável com +/-
├── Aporte mensal: sugestão automática, editável
├── Rentabilidade: slider ou input, default 10% a.a.
├── Renda desejada: sugestão = gastos médios, editável

PASSO 3 — Cálculo (instantâneo, a cada mudança de input)
├── patrimonio_alvo = renda_desejada × 12 ÷ 0.04 (regra dos 4%)
├── Projeção mês a mês (juros compostos):
│   └── patrimonio[n+1] = patrimonio[n] × (1 + taxa_mensal) + aporte_mensal
│   └── taxa_mensal = (1 + taxa_anual)^(1/12) - 1
├── meses_para_if = primeiro mês onde patrimonio ≥ patrimonio_alvo
├── Cenários:
│   ├── Cenário 1: aporte × 0.5
│   ├── Cenário 2: aporte atual
│   └── Cenário 3: aporte × 1.75 (ou baseado em promoção do Carreira)

PASSO 4 — Salvar (opcional)
├── Insere em fi_simulations para histórico
├── Botão "Resetar" limpa customizações e volta aos defaults
└── [Jornada] +30 XP por usar simulador pela primeira vez
```

---

## 11. INTEGRAÇÕES CROSS-MÓDULO

### 11.1 Patrimônio → Finanças

- **Regra:** RN-PTR-12
- **Trigger:** Provento com status = 'received' + toggle auto-Finanças ativo
- **O que acontece:** Cria transação type='income' em Finanças com descrição "Auto — 📈 Patrimônio | {ticker} {tipo}"
- **Condição:** Toggle "Auto-registro em Finanças" ativo em Configurações > Integrações
- **Cenários:**
  1. Usuário registra dividendo PETR4 de R$ 184 → receita de R$ 184 aparece em Finanças na categoria "Investimentos"
  2. FII HGLG11 paga rendimento mensal → receita automática todo mês
  3. Toggle desativado → provento é registrado apenas no Patrimônio

### 11.2 Patrimônio → Finanças (Aportes)

- **Regra:** RN-PTR-20
- **Trigger:** Operação de compra com toggle "Sincronizar aporte com Finanças" ativo
- **O que acontece:** Cria transação type='expense' em Finanças com descrição "Auto — 📈 Patrimônio | Compra {ticker}"
- **Condição:** Toggle por operação (não global)
- **Cenários:**
  1. Compra de VALE3 por R$ 9.420 + R$ 4,90 de taxa → despesa de R$ 9.424,90 em Finanças
  2. Compra sem toggle ativo → apenas registrada em Patrimônio

### 11.3 Patrimônio → Tempo

- **Regra:** RN-PTR-13
- **Trigger:** Provento com status = 'announced' + ex_date ou payment_date definida
- **O que acontece:** Cria evento no calendário do Tempo com tipo "provento"
- **Condição:** Integração Patrimônio → Tempo ativa em Configurações
- **Cenários:**
  1. Dividendo PETR4 anunciado para 20/03 → evento "💰 Dividendo PETR4 — R$ 184" no dia 20/03
  2. Rendimento FII todo dia 15 → evento recorrente no calendário

### 11.4 Futuro → Patrimônio

- **Regra:** RN-FUT-03 (via objective_goals)
- **Trigger:** Usuário cria meta tipo 'monetary' com target_module = 'patrimonio' no módulo Futuro
- **O que acontece:** Meta vincula ao patrimônio total ou a ativo específico. Current_value atualiza automaticamente.
- **Condição:** auto_sync = TRUE na meta
- **Cenários:**
  1. Objetivo "Comprar apartamento" → Meta "Acumular R$ 200k em investimentos" → linked_entity_type = 'portfolio_total'
  2. Objetivo "Independência financeira" → Meta "Atingir R$ 2,5M" → vinculada ao simulador IF

### 11.5 Carreira → Patrimônio (via Simulador)

- **Regra:** RN-PTR-22
- **Trigger:** Dados de salário atual e projeção de aumento de Carreira alimentam o Simulador IF
- **O que acontece:** Cenário "Após promoção" no simulador usa aumento salarial projetado para calcular novo aporte possível
- **Condição:** Módulo Carreira ativo + roadmap com promoção planejada
- **Cenários:**
  1. Salário atual R$ 8k, promoção para sênior projetada → Simulador mostra cenário com aporte R$ 3.500 (atual R$ 2.000) → IF em 13 anos vs 18

---

## 12. DIAGRAMA DE INTEGRAÇÕES

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                       📈 PATRIMÔNIO                              │
│                                                                   │
│   ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐  │
│   │ Carteira     │ │ Proventos  │ │ Evolução   │ │Simulador  │  │
│   │ (Assets)     │ │ (Divid.)   │ │ (Histórico)│ │   IF      │  │
│   └──────┬───────┘ └─────┬──────┘ └────────────┘ └─────┬─────┘  │
│          │                │                              │        │
└──────────│────────────────│──────────────────────────────│────────┘
           │                │                              │
     ┌─────▼──────┐  ┌─────▼──────┐                ┌─────▼──────┐
     │ 💰 FINANÇAS│  │ 💰 FINANÇAS│                │ 💼 CARREIRA│
     │            │  │            │                │            │
     │ Aporte →   │  │ Provento → │                │ Salário →  │
     │ Despesa    │  │ Receita    │                │ Aporte     │
     │ (opt-in)   │  │ (auto)     │                │ projetado  │
     └────────────┘  └────────────┘                └────────────┘
           │                │                              │
           │          ┌─────▼──────┐                       │
           │          │ ⏳ TEMPO   │                       │
           │          │            │                       │
           │          │ Pagamento  │                       │
           │          │ de provento│                       │
           │          │ no calendar│                       │
           │          └────────────┘                       │
           │                                               │
     ┌─────▼──────────────────────────────────────────────▼──────┐
     │                       🔮 FUTURO                            │
     │                                                             │
     │  Meta patrimonial ←→ portfolio_total ou ativo específico    │
     │  Progresso auto-sync: valor da carteira → current_value     │
     │  Simulador alimenta cenários do Futuro                      │
     └─────────────────────────────────────────────────────────────┘
```

---

## 13. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| RN-PTR-01 | Ticker único por usuário | Não podem existir dois ativos com mesmo ticker para o mesmo user_id. Nova compra do mesmo ticker atualiza o ativo existente. |
| RN-PTR-02 | Preço médio ponderado | avg_price = Σ(quantidade × preço + taxas) ÷ Σ(quantidade) para todas as compras do ativo. Vendas não alteram PM. |
| RN-PTR-03 | Atualização de cotações FREE | Usuários FREE podem atualizar cotações (bulk) 1 vez por dia. PRO: ilimitado. |
| RN-PTR-04 | Distribuição por setor | A carteira deve exibir alocação por setor (se informado) além de por classe. |
| RN-PTR-05 | Patrimônio total | Calculado como Σ(ativo.quantity × (ativo.current_price ?? ativo.avg_price)) para todos os ativos. |
| RN-PTR-06 | Venda parcial | Venda com quantidade < possuída reduz quantity mas mantém avg_price. |
| RN-PTR-07 | Limite FREE 10 ativos | Plano FREE permite máximo 10 tickers distintos. Novo ticker bloqueado com upsell. Compra adicional de ticker existente é permitida. |
| RN-PTR-08 | Classes de ativos | Valores válidos: stocks_br, fiis, etfs_br, bdrs, fixed_income, crypto, stocks_us, reits, other. |
| RN-PTR-09 | Proventos por tipo | Tipos válidos: dividend, jcp, fii_yield, fixed_income_interest, other. |
| RN-PTR-10 | Yield on Cost | YoC = (proventos últimos 12 meses do ativo) ÷ (quantity × avg_price) × 100. |
| RN-PTR-11 | Projeção IF | patrimonio_alvo = (renda_desejada_mensal × 12) ÷ 0.04. Fórmula da regra dos 4% (safe withdrawal rate). |
| RN-PTR-12 | Proventos → Finanças | Provento com status 'received' + toggle ativo → cria transação income em Finanças. Categoria: "investimentos". |
| RN-PTR-13 | Proventos → Tempo | Provento com payment_date + integração ativa → cria evento no calendário. |
| RN-PTR-14 | Exclusão de ativo preserva Finanças | Ao excluir ativo, transações geradas automaticamente em Finanças NÃO são removidas. |
| RN-PTR-15 | Simulador PRO only | Simulador IF é recurso exclusivo do plano PRO. FREE vê paywall. |
| RN-PTR-16 | Venda total com opção de manter | Venda de 100% da posição pergunta se deseja manter ativo zerado para histórico. |
| RN-PTR-17 | Data da operação ≤ hoje | Operações não podem ter data futura. |
| RN-PTR-18 | Variação mensal | Calculada como (patrimônio_hoje - patrimônio_inicio_mês) ÷ patrimônio_inicio_mês × 100. |
| RN-PTR-19 | Score Patrimônio | Componente do Life Sync Score = (aporte_realizado ÷ aporte_planejado × 0.5) + (diversificação × 0.5). |
| RN-PTR-20 | Aportes → Finanças | Compra de ativo com toggle "Sincronizar" → cria despesa em Finanças. Opt-in por operação. |
| RN-PTR-21 | Benchmark Jornada only | Comparação vs CDI/Ibovespa/IFIX só disponível no modo Jornada (PRO). |
| RN-PTR-22 | Carreira → Simulador | Se Carreira ativo com promoção planejada, cenário "Após promoção" calcula novo aporte com salário projetado. |
| RN-PTR-23 | Proventos vinculados | Provento registrado deve ter asset_id válido (ativo deve existir na carteira). |
| RN-PTR-24 | Alerta ao excluir | Confirmação de exclusão alerta sobre transações em Finanças que não serão removidas. |
| RN-PTR-25 | Integrações opt-in | Todas as integrações cross-módulo verificam toggle em Configurações > Integrações antes de executar. |

---

## 14. MODELO DE DADOS

### 14.1 Schema SQL (já existente na migration 005_fase6_infra_v3.sql)

```sql
-- Ativos da carteira
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    ticker TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (asset_class IN (
        'stocks_br','fiis','etfs_br','bdrs','fixed_income',
        'crypto','stocks_us','reits','other'
    )),
    sector TEXT,
    quantity DECIMAL(15,8) NOT NULL DEFAULT 0,
    avg_price DECIMAL(15,4) NOT NULL DEFAULT 0,
    current_price DECIMAL(15,4),
    last_price_update TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Operações de compra e venda
CREATE TABLE portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('buy','sell')),
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0,
    operation_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Proventos (dividendos, JCP, rendimentos)
CREATE TABLE portfolio_dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'dividend','jcp','fii_yield','fixed_income_interest','other'
    )),
    amount_per_unit DECIMAL(15,6),
    total_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    ex_date DATE,
    status TEXT DEFAULT 'received' CHECK (status IN ('announced','received')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Simulações de IF salvas
CREATE TABLE fi_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    current_portfolio DECIMAL(15,2) NOT NULL,
    monthly_contribution DECIMAL(15,2) NOT NULL,
    expected_return_rate DECIMAL(5,2) NOT NULL,
    desired_passive_income DECIMAL(15,2) NOT NULL,
    result_months INTEGER,
    result_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 14.2 Índices recomendados

```sql
-- Busca por usuário (essencial para RLS)
CREATE INDEX idx_portfolio_assets_user ON portfolio_assets(user_id);
CREATE INDEX idx_portfolio_transactions_user ON portfolio_transactions(user_id);
CREATE INDEX idx_portfolio_dividends_user ON portfolio_dividends(user_id);

-- Busca por ativo
CREATE INDEX idx_portfolio_transactions_asset ON portfolio_transactions(asset_id);
CREATE INDEX idx_portfolio_dividends_asset ON portfolio_dividends(asset_id);

-- Ordenação por data
CREATE INDEX idx_portfolio_transactions_date ON portfolio_transactions(operation_date DESC);
CREATE INDEX idx_portfolio_dividends_date ON portfolio_dividends(payment_date DESC);

-- Ticker único por usuário
CREATE UNIQUE INDEX idx_portfolio_assets_ticker ON portfolio_assets(user_id, ticker);

-- Filtro por classe
CREATE INDEX idx_portfolio_assets_class ON portfolio_assets(user_id, asset_class);

-- Filtro por status de provento
CREATE INDEX idx_portfolio_dividends_status ON portfolio_dividends(user_id, status);
```

### 14.3 RLS Policies

```sql
-- Todas as tabelas seguem o padrão:
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own assets" ON portfolio_assets
  FOR ALL USING (auth.uid() = user_id);

-- Repetido para portfolio_transactions, portfolio_dividends, fi_simulations
```

---

## 15. LIFE SYNC SCORE — COMPONENTE PATRIMÔNIO

### 15.1 Peso no score geral

**10%** do Life Sync Score total (conforme MVP-V3-ESPECIFICACAO-COMPLETA-V2)

### 15.2 Fórmula detalhada

```
Score Patrimônio = (
    componente_aporte      × 0.50 +
    componente_diversificação × 0.50
)

Onde:

componente_aporte = MIN(aporte_realizado_mes ÷ aporte_planejado_mes, 1.0) × 100
  ├── aporte_realizado_mes = Σ compras no mês atual
  ├── aporte_planejado_mes = meta de aporte mensal (configurável)
  └── Se nenhum aporte planejado configurado: usa média dos últimos 3 meses como referência

componente_diversificação = MIN(classes_com_ativos ÷ 3, 1.0) × 100
  ├── classes_com_ativos = COUNT(DISTINCT asset_class) WHERE quantity > 0
  └── Meta: ter pelo menos 3 classes distintas para score máximo
```

### 15.3 Tabela de interpretação

| Score | Faixa | Interpretação | Ação sugerida |
|-------|-------|---------------|---------------|
| 0-20 | Crítico | Não está aportando e/ou carteira sem diversificação | "Comece investindo — qualquer valor" |
| 21-40 | Atenção | Aportes irregulares ou carteira muito concentrada | "Aumente a consistência dos aportes" |
| 41-60 | Regular | Aportando, mas diversificação ou consistência podem melhorar | "Considere diversificar classes de ativos" |
| 61-80 | Bom | Aportes regulares com boa diversificação | "Continue assim! Considere aumentar aportes" |
| 81-100 | Excelente | Aportes consistentes acima da meta, carteira bem diversificada | "Patrimônio evoluindo de forma saudável" |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 16.1 Funcionalidades futuras

| Feature | Descrição | Impacto | Prioridade |
|---------|-----------|---------|-----------|
| **Patrimônio Líquido Completo** | Incluir imóveis, veículos, bens de valor (não só investimentos financeiros) | Alto — diferencia de todos os concorrentes BR | Média (v4) |
| **Importação via B3 (CEI/Canal Eletrônico)** | Importar automaticamente posições e proventos da B3 via integração | Alto — elimina trabalho manual | Alta (v3.1) |
| **Cotações automáticas via API** | Integrar com API de cotações (Alpha Vantage, Brapi) para atualização automática | Alto — reduz trabalho manual | Alta (v3.1) |
| **Rebalanceamento IA** | Sugerir ajustes na carteira para manter alocação-alvo por classe | Médio — feature PRO premium | Média (v4) |
| **Tax helper (IR)** | Calcular DARF mensal para operações em renda variável (vendas > R$ 20k) | Alto — dor real do investidor BR | Alta (v3.2) |
| **Alertas de preço** | Notificar quando ativo atingir preço-alvo (compra ou venda) | Médio — engajamento | Baixa (v4) |
| **Dividend DRIP tracker** | Rastrear reinvestimento de dividendos automaticamente | Baixo — nicho | Baixa (v4) |
| **Multi-currency completo** | Suportar ativos em USD, EUR com câmbio real | Médio — para investidores internacionais | Média (v3.2) |
| **Análise de risco (Sharpe, Sortino)** | Métricas de risco-retorno avançadas | Médio — feature PRO | Baixa (v4) |
| **Export PDF do portfólio** | Gerar relatório PDF da carteira para assessor ou contador | Médio — utilidade prática | Média (v3.2) |

### 16.2 Críticas ao protótipo atual

1. **Cor incorreta**: O protótipo antigo usa `#f59e0b` (amber/yellow) como cor do Patrimônio. A cor correta é `#3b82f6` (blue), conforme definido em `modules.ts` e no protótipo do Mente. **Todo o protótipo v3 deve usar #3b82f6.**

2. **Navegação com pills em vez de underline**: O protótipo usa tabs com `border-radius:20px` (pills). O padrão aprovado é **underline tabs** (como no módulo Futuro e Mente). Corrigido no v3.

3. **Apenas 5 telas**: Faltam telas essenciais como estados vazios, modais CRUD, detalhe do ativo, e estados de erro/loading. O v3 expande para 12+ telas.

4. **Phone frames fixos (812px)**: O protótipo antigo usa altura fixa, cortando conteúdo. O v3 usa **altura automática** conforme padrão aprovado.

5. **Sem modo Jornada**: Protótipo não mostra componentes Jornada (AI insights, benchmark, gamificação). Adicionados no v3.

6. **Simulador IF muito simplista**: No protótipo original, o simulador tem inputs básicos. O v3 adiciona pré-preenchimento automático (carteira, Finanças, Carreira), cenários comparativos e insight IA cross-module.

7. **Sem integração visual com outros módulos**: Protótipo não mostra os links com Finanças, Futuro, Carreira. O v3 adiciona toggle de auto-Finanças, cross-module insights e conexão com o Simulador.

### 16.3 Telas recomendadas para o protótipo v3

| # | Tela | Grupo | Tag | Justificativa |
|---|------|-------|-----|---------------|
| A1 | Dashboard | A: Visualização | ✦ Melhorado | Hub principal, corrigido com cor #3b82f6 e underline tabs |
| A2 | Carteira de Ativos | A: Visualização | ✦ Melhorado | Lista com filtros, agrupada por classe |
| A3 | Proventos | A: Visualização | ✦ Melhorado | Acumulado + barras + próximos + toggle Finanças |
| A4 | Evolução Patrimonial | A: Visualização | ✦ Melhorado | Gráfico de linha + período + classe + aportes×rend |
| A5 | Simulador IF (PRO) | A: Visualização | ⭐ Alta prioridade | Diferencial competitivo, com cenários e AI |
| B1 | Modal Registrar Operação | B: CRUD | ★ Novo | Formulário compra/venda com toggle Finanças |
| B2 | Modal Registrar Provento | B: CRUD | ★ Novo | Formulário de dividendo/JCP/rendimento |
| B3 | Detalhe do Ativo | B: CRUD | ★ Novo | Info do ativo + histórico operações + proventos |
| C1 | Dashboard Jornada | C: Jornada | ★ Novo | Dashboard com AI insight + benchmark vs CDI |
| C2 | Proventos Jornada | C: Jornada | ★ Novo | YoC + projeção 12m |
| D1 | Estado Vazio | D: Estados | ★ Novo | Carteira vazia com CTA de primeiro ativo |
| D2 | Simulador FREE (Paywall) | D: Estados | ★ Novo | Preview borrado + CTA upgrade PRO |

---

*Documento criado em: 07/03/2026*  
*Versão: 1.0*  
*Referências: DOC-FUNCIONAL-FUTURO-COMPLETO.md, MVP-V3-ESPECIFICACAO-COMPLETA-V2.md, migration 005_fase6_infra_v3.sql*  
*Próximo passo: Gerar protótipo HTML v3 e prompt para Claude Code*
