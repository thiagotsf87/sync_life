# 📈 Prompt para Claude Code — Módulo Patrimônio

**Versão:** 1.0  
**Data:** 07/03/2026  
**Módulo:** Patrimônio  
**Cor:** `#3b82f6`  
**Ícone Lucide:** `TrendingUp`

---

## INSTRUÇÃO INICIAL

Antes de codificar QUALQUER coisa, leia os seguintes arquivos na ordem indicada:

1. **`CLAUDE.md`** — Regras gerais do projeto, convenções, estrutura
2. **`SPEC-FUNCIONAL-PATRIMONIO.md`** — Especificação funcional completa (18 seções)
3. **`proto-mobile-patrimonio-v3.html`** — Protótipo visual de referência (12 telas)
4. **`web/src/lib/modules.ts`** — Verificar cor do módulo (#3b82f6)
5. **`web/supabase/migrations/005_fase6_infra_v3.sql`** — Schema de tabelas existente

Após ler todos os documentos, confirme que entendeu o escopo antes de iniciar.

---

## CONTEXTO DO MÓDULO

```
Nome:       Patrimônio
Subtítulo:  Investimentos e ativos
Cor:        #3b82f6
Glow:       rgba(59,130,246,0.14)
Ícone:      TrendingUp (lucide-react)
Rota base:  /patrimonio
Subrotas:   /patrimonio (dashboard)
            /patrimonio/carteira
            /patrimonio/proventos
            /patrimonio/evolucao
            /patrimonio/simulador

Tabelas:    portfolio_assets
            portfolio_transactions
            portfolio_dividends
            fi_simulations

Integrações:
  → Finanças: proventos → receita, aportes → despesa (via lib/integrations/financas.ts)
  → Tempo: proventos anunciados → eventos no calendário
  → Futuro: metas patrimoniais → portfolio_total auto-sync
  → Carreira: salário e projeção de aumento → simulador IF cenários
```

---

## 8 FASES DE IMPLEMENTAÇÃO

### FASE 1 — Infraestrutura e tipos (2h)

```
1.1  Verificar se tabelas existem no Supabase (portfolio_assets, portfolio_transactions, portfolio_dividends, fi_simulations)
1.2  Criar/atualizar tipos TypeScript em web/src/types/patrimonio.ts:
     - PortfolioAsset, PortfolioTransaction, PortfolioDividend, FISimulation
     - AssetClass enum, OperationType enum, DividendType enum
1.3  Verificar hooks existentes em web/src/hooks/use-patrimonio.ts
     - Se existem e funcionam: manter. Se precisam de ajustes: atualizar.
1.4  Garantir que modules.ts tem patrimônio com cor #3b82f6 e ícone TrendingUp
1.5  Verificar rotas no app router: web/src/app/(app)/patrimonio/

VALIDAÇÃO: Tipos compilam sem erros. Hooks retornam dados do Supabase.
```

### FASE 2 — Dashboard (3h)

```
2.1  Implementar tela principal /patrimonio/page.tsx
2.2  Componentes do Dashboard:
     - HeroCard: patrimônio total + variação mensal
     - KPIGrid: 4 cards (Renda Fixa, RV, FIIs, Cripto) com accent bar
     - DonutChart: alocação por classe (SVG ou Recharts)
     - IFProgressBar: progresso para independência financeira
     - Top5Assets: lista dos 5 maiores ativos
2.3  [Jornada] AIInsightCard: insight contextual (componente jornada-only)
2.4  [Jornada] BenchmarkMiniChart: carteira vs CDI (jornada-only)
2.5  Navegação: sub-nav com underline tabs (NÃO pills)
2.6  Responsive: mobile-first 375px, breakpoints tablet/desktop
2.7  Testar com carteira vazia (estado empty state)
2.8  Testar com dados (usar seed ou dados manuais)

VALIDAÇÃO: Dashboard renderiza corretamente em mobile e desktop.
          KPIs calculam corretamente. Donut proporcional aos dados.
          Sub-nav usa underline (não pills).
          Cor do módulo é #3b82f6 em todos os componentes.
```

### FASE 3 — Carteira de Ativos (3h)

```
3.1  Implementar /patrimonio/carteira/page.tsx
3.2  Filter Pills: Todos | Renda Fixa | Ações | FIIs | ETFs | BDRs | Cripto | Outros
3.3  SummaryBar: total investido, rendimento, variação dia
3.4  GroupedAssetList: ativos agrupados por classe
     - AssetRow: dot colorido + ticker + nome + valor + variação %
     - Tap → navega para /patrimonio/carteira/[id] (detalhe)
3.5  Botão + no header → abre modal de operação
3.6  Botão Atualizar Cotações (bulk):
     - FREE: 1x/dia (RN-PTR-03)
     - PRO: ilimitado
     - Usar hook existente useBulkUpdatePrices
3.7  Busca por ticker/nome (campo search)
3.8  Estado vazio com CTA

VALIDAÇÃO: Filtros funcionam client-side. Lista agrupa por classe.
          Limite FREE de atualização de cotações funciona.
          Limite FREE de 10 tickers funciona (RN-PTR-07).
```

### FASE 4 — CRUD de Operações (3h)

```
4.1  Modal Registrar Operação (compra/venda):
     - Toggle Compra/Venda
     - Campos: ticker, nome, classe, setor, quantidade, preço, taxas, data, notas
     - Toggle "Registrar aporte em Finanças" (opt-in)
     - Validações conforme SPEC seção 10
4.2  Lógica de compra:
     - Se ticker novo: insere em portfolio_assets + portfolio_transactions
     - Se ticker existente: atualiza quantity e recalcula avg_price (PM ponderado)
     - Se toggle Finanças ativo: chama createTransactionFromAporte()
4.3  Lógica de venda:
     - Quantidade ≤ posição atual
     - Se venda total: pergunta se mantém ativo zerado
     - Insere em portfolio_transactions (operation='sell')
4.4  Modal Atualizar Cotação:
     - Input de novo preço
     - Atualiza current_price e last_price_update
4.5  Detalhe do Ativo (/patrimonio/carteira/[id]):
     - Header: ticker + nome + classe + setor
     - KPIs: quantidade, PM, valor investido, valor atual, P/L
     - Lista de operações do ativo
     - Lista de proventos do ativo
     - Botões: + Operação, Excluir
4.6  Excluir ativo com confirmação e alerta sobre Finanças (RN-PTR-24)

VALIDAÇÃO: Compra atualiza PM corretamente.
          Venda respeita limite de quantidade.
          Toggle Finanças gera transação.
          Exclusão funciona com confirmação.
```

### FASE 5 — Proventos (2.5h)

```
5.1  Implementar /patrimonio/proventos/page.tsx
5.2  HeroCard: total acumulado + breakdown por tipo + média mensal
5.3  Gráfico de barras mensais (passado real + previsão tracejada)
5.4  Lista Próximos Pagamentos (status='announced')
5.5  Histórico de proventos (status='received')
5.6  Modal Registrar Provento:
     - Select ativo, tipo, valor, data pagamento, data ex, status
     - Toggle "Registrar em Finanças"
5.7  Integração Finanças (RN-PTR-12):
     - Se status='received' + toggle ativo → createTransactionFromProvento()
5.8  Toggle global Auto-registro em Finanças
5.9  [Jornada] Yield on Cost por ativo
5.10 [Jornada] Projeção de dividendos 12 meses

VALIDAÇÃO: Proventos calculam totais corretamente.
          Auto-registro em Finanças funciona.
          YoC calcula corretamente (proventos 12m ÷ valor investido).
```

### FASE 6 — Evolução Patrimonial (2h)

```
6.1  Implementar /patrimonio/evolucao/page.tsx
6.2  Period Filter: 6M | 1A | 3A | 5A | Tudo
6.3  Gráfico de linha: evolução patrimonial (Recharts LineChart)
     - Linha da meta IF como referência (tracejada)
6.4  Resumo do período: patrimônio hoje + variação
6.5  Crescimento por classe: lista com variação absoluta e %
6.6  Aportes × Rendimentos: gráfico de barras empilhadas
6.7  [Jornada] Benchmark overlay (CDI, Ibovespa)
6.8  [Jornada] Projeção futura (linhas pontilhadas)

VALIDAÇÃO: Gráfico renderiza com dados reais.
          Período filter altera todos os componentes.
          Breakdown por classe soma = total.
```

### FASE 7 — Simulador IF (2.5h)

```
7.1  Implementar /patrimonio/simulador/page.tsx
7.2  Gate PRO: FREE vê paywall com preview borrado + CTA upgrade
7.3  Inputs ajustáveis com +/-:
     - Patrimônio atual (pré-preenchido da carteira real)
     - Aporte mensal (sugestão de Finanças se integrado)
     - Rentabilidade a.a. (default 10%)
     - Renda desejada/mês (sugestão de Finanças se integrado)
7.4  Cálculo (juros compostos mês a mês):
     - patrimonio_alvo = renda × 12 ÷ 0.04
     - Projeção: patrimonio[n+1] = patrimonio[n] × (1+taxa_mensal) + aporte
     - Encontrar primeiro mês onde patrimonio ≥ alvo
7.5  Resultado Hero: tempo para IF + data + patrimônio alvo
7.6  KPI Grid: 4 métricas
7.7  Gráfico de projeção (Recharts AreaChart)
7.8  3 Cenários comparativos:
     - Cenário 1: aporte × 0.5 (vermelho)
     - Cenário 2: aporte atual (azul, destacado)
     - Cenário 3: aporte × 1.75 (verde) — label "Após promoção" se Carreira integrado
7.9  [Jornada] AI Cross-Module Insight
7.10 Salvar simulação em fi_simulations (opcional)
7.11 Botão Resetar

VALIDAÇÃO: Cálculo de IF correto (testar com calculadora).
          FREE vê paywall. PRO vê simulador completo.
          Cenários calculam corretamente.
          Pré-preenchimento automático funciona.
```

### FASE 8 — Integrações e polish (2h)

```
8.1  Verificar integração Patrimônio → Finanças:
     - createTransactionFromProvento() funciona
     - createTransactionFromAporte() funciona
     - Descrição: "Auto — 📈 Patrimônio | {ticker} {tipo}"
8.2  Verificar integração com Futuro:
     - Metas tipo patrimonio atualizam current_value corretamente
8.3  Score Patrimônio para Life Sync Score:
     - (aporte_realizado ÷ planejado × 0.5) + (diversificação × 0.5)
8.4  Gamificação (Jornada only):
     - Badge "Primeiro Ativo" (primeiro ativo adicionado)
     - Badge "Diversificado" (3+ classes)
     - Badge "Acúmulo Consistente" (6 meses seguidos com aportes)
     - +10 XP por operação, +5 XP por provento, +30 XP por usar simulador
8.5  Responsividade final:
     - Mobile 375px: testar todas as telas
     - Tablet 640-1024px
     - Desktop 1024px+
8.6  Validação visual: comparar cada tela com protótipo HTML
8.7  Performance: lazy loading de gráficos, skeleton states
8.8  Acessibilidade: ARIA labels, keyboard navigation

VALIDAÇÃO: Todas as integrações funcionam.
          Score calcula corretamente.
          Todas as telas responsivas.
          Comparação visual com protótipo aprovada.
```

---

## 50 TESTES PLAYWRIGHT

### Grupo 1 — Dashboard (8 testes)

```
T-01  Dashboard renderiza hero card com patrimônio total
T-02  KPI Grid mostra 4 classes com valores e porcentagens corretas
T-03  Donut chart renderiza com proporções corretas
T-04  Barra de progresso IF calcula % corretamente
T-05  Top 5 ativos lista os 5 maiores por valor
T-06  Sub-nav usa underline tabs (não pills)
T-07  [Jornada] AI Insight card aparece apenas no modo Jornada
T-08  Estado vazio renderiza corretamente quando carteira vazia
```

### Grupo 2 — Carteira (8 testes)

```
T-09  Carteira lista ativos agrupados por classe
T-10  Filtro por classe funciona (client-side)
T-11  Summary bar atualiza ao trocar filtro
T-12  Busca por ticker funciona
T-13  Tap em ativo navega para detalhe
T-14  Botão + abre modal de operação
T-15  Limite FREE de 10 tickers bloqueia novo ticker com upsell
T-16  Atualização de cotações respeita limite FREE (1x/dia)
```

### Grupo 3 — CRUD Operações (8 testes)

```
T-17  Compra de ticker novo cria ativo + transação
T-18  Compra de ticker existente atualiza PM (preço médio ponderado)
T-19  Venda parcial reduz quantity sem alterar PM
T-20  Venda total pergunta se mantém ativo zerado
T-21  Validação: quantidade de venda ≤ posição atual
T-22  Validação: data não pode ser futura
T-23  Toggle "Registrar em Finanças" cria despesa quando ativo
T-24  Exclusão de ativo exibe confirmação e alerta sobre Finanças
```

### Grupo 4 — Proventos (7 testes)

```
T-25  Hero card mostra total acumulado e breakdown por tipo
T-26  Gráfico de barras renderiza meses passados + previsão
T-27  Próximos pagamentos lista proventos com status 'announced'
T-28  Registrar provento com status 'received' gera receita em Finanças
T-29  Toggle auto-registro em Finanças persiste
T-30  [Jornada] YoC calcula corretamente (proventos 12m ÷ investido)
T-31  [Jornada] Projeção 12m exibe valores projetados
```

### Grupo 5 — Evolução (5 testes)

```
T-32  Gráfico de evolução renderiza com dados reais
T-33  Period filter altera todos os componentes
T-34  Crescimento por classe soma = total
T-35  Aportes × Rendimentos calcula decomposição correta
T-36  [Jornada] Benchmark overlay renderiza com CDI
```

### Grupo 6 — Simulador IF (7 testes)

```
T-37  FREE vê paywall com preview borrado
T-38  PRO vê simulador completo com inputs
T-39  Patrimônio atual pré-preenchido da carteira real
T-40  Cálculo IF correto: R$ 10k/mês × 12 ÷ 0.04 = R$ 3M alvo
T-41  3 cenários comparativos calculam tempos diferentes
T-42  Gráfico de projeção renderiza curva de juros compostos
T-43  Botão resetar limpa customizações
```

### Grupo 7 — Integrações (4 testes)

```
T-44  Provento → Finanças: transação criada com descrição correta
T-45  Aporte → Finanças: despesa criada quando toggle ativo
T-46  Meta patrimonial do Futuro atualiza current_value
T-47  Score Patrimônio calcula: (aporte % × 0.5) + (diversificação × 0.5)
```

### Grupo 8 — Visual e Responsivo (3 testes)

```
T-48  Cor #3b82f6 usada em todos os componentes do módulo
T-49  Mobile 375px: todas as telas renderizam sem overflow horizontal
T-50  Modo dark: contraste adequado em todos os textos
```

---

## VALIDAÇÃO VISUAL

Para cada tela, comparar visualmente com o protótipo `proto-mobile-patrimonio-v3.html`:

| Tela | Protótipo | Verificar |
|------|-----------|-----------|
| Dashboard | A1 | Hero card, KPIs, donut, IF bar, top 5, underline tabs |
| Carteira | A2 | Filter pills, asset list agrupada, summary bar |
| Proventos | A3 | Hero, barras mensais, próximos, toggle Finanças |
| Evolução | A4 | Gráfico, período, por classe, aportes×rend |
| Simulador IF | A5 | Inputs, resultado hero, cenários, AI insight |
| Modal Operação | B1 | Toggle compra/venda, campos, toggle Finanças |
| Modal Provento | B2 | Select ativo, tipos, toggle Finanças |
| Detalhe Ativo | B3 | KPIs, operações, proventos, botões |
| Dashboard Jornada | C1 | AI insight, benchmark, gamificação |
| Proventos Jornada | C2 | Projeção 12m, YoC |
| Estado Vazio | D1 | Ilustração, CTA |
| Paywall IF | D2 | Preview borrado, CTA PRO |

---

## 10 REGRAS ABSOLUTAS

```
1. COR DO MÓDULO É #3b82f6 — NÃO usar #f59e0b (antiga). Verificar modules.ts.
2. NAVEGAÇÃO USA UNDERLINE TABS — NÃO pills com border-radius.
3. MOBILE-FIRST — Testar TUDO em 375px antes de desktop.
4. INTEGRAÇÕES SÃO OPT-IN — Verificar toggle em Configurações > Integrações antes de executar.
5. LIMITE FREE 10 TICKERS — Compra adicional de ticker existente é permitida.
6. PROVENTOS → FINANÇAS automático — Usar createTransactionFromProvento() existente.
7. APORTES → FINANÇAS opt-in por operação — Usar createTransactionFromAporte() existente.
8. SIMULADOR É PRO ONLY — FREE vê paywall com preview borrado.
9. JORNADA NÃO ALTERA LAYOUT — Apenas adiciona/remove componentes com .jornada-only.
10. TODA FASE TERMINA COM VALIDAÇÃO — Não prosseguir sem testes passando.
```

---

## ORDEM DE EXECUÇÃO (GRAFO DE DEPENDÊNCIAS)

```
FASE 1 (Infra)
    │
    ├──→ FASE 2 (Dashboard)
    │        │
    │        └──→ FASE 6 (Evolução) ──→ FASE 8 (Polish)
    │
    ├──→ FASE 3 (Carteira)
    │        │
    │        └──→ FASE 4 (CRUD Operações)
    │                │
    │                └──→ FASE 5 (Proventos) ──→ FASE 8 (Polish)
    │
    └──→ FASE 7 (Simulador IF) ──→ FASE 8 (Polish)

Ordem sugerida: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
Tempo estimado total: ~20 horas
```

---

## CHECKLIST DE CONCLUSÃO

```
[ ] Fase 1: Tipos compilam, hooks funcionam, rotas existem
[ ] Fase 2: Dashboard com hero, KPIs, donut, IF bar, top 5
[ ] Fase 3: Carteira com filtros, agrupamento, busca, limites
[ ] Fase 4: CRUD completo (compra, venda, PM, exclusão, Finanças)
[ ] Fase 5: Proventos com hero, barras, próximos, auto-Finanças
[ ] Fase 6: Evolução com gráfico, período, classe, aportes×rend
[ ] Fase 7: Simulador IF com paywall FREE, cálculo, cenários
[ ] Fase 8: Integrações, score, gamificação, responsive, visual
[ ] Todos os 50 testes Playwright passando
[ ] Cor #3b82f6 verificada em TODOS os componentes
[ ] Underline tabs (não pills) em todas as sub-navs
[ ] Mobile 375px testado em todas as telas
[ ] Comparação visual com protótipo aprovada
[ ] Modo Foco e Jornada testados
[ ] FREE e PRO testados (limites respeitados)
```

---

*Documento criado em: 07/03/2026*  
*Baseado em: SPEC-FUNCIONAL-PATRIMONIO.md + proto-mobile-patrimonio-v3.html*  
*Referências: DOC-FUNCIONAL-FUTURO-COMPLETO.md, MVP-V3, migration 005*
