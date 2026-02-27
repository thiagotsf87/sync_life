# SPEC-PATRIMÔNIO — 📈 Módulo Patrimônio

> **Investimentos e Ativos**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Patrimônio (anteriormente "Investimentos")
> **Dependências:** Finanças (proventos/aportes), Tempo (proventos no calendário), Futuro (objetivos patrimoniais)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Patrimônio

O Patrimônio é a gestão da riqueza acumulada: carteira de investimentos, cotações, proventos, evolução patrimonial e simulador de independência financeira. O nome "Patrimônio" foi escolhido porque abrange mais que ações e FIIs — inclui imóveis, veículos e bens no escopo futuro.

### 1.2 Posicionamento Estratégico

O SyncLife não compete com Investidor 10 (R$ 39,90/mês) em profundidade de análise fundamentalista. O foco é na **gestão da carteira pessoal conectada ao ecossistema de vida**: como os investimentos alimentam objetivos (aposentadoria, viagem, casa), como proventos aparecem no calendário financeiro junto com despesas, e como o patrimônio evolui em relação às metas de vida.

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Dashboard Patrimônio | Patrimônio total, rentabilidade, distribuição | Alta |
| Carteira | Lista de ativos com preço médio, valor atual, variação | Alta |
| Adicionar Ativo | Formulário de compra/venda | Alta |
| Evolução Patrimonial | Gráfico de evolução ao longo do tempo | Alta |
| Proventos | Calendário/histórico de dividendos e rendimentos | Alta |
| Simulador IF | Projeção de independência financeira | Média (PRO) |

---

## 3. FUNCIONALIDADE: GESTÃO DE CARTEIRA

### 3.1 O que o usuário vê e faz

Carteira organizada por classe: Ações BR, FIIs, ETFs BR, BDRs, Renda Fixa, Criptomoedas, Stocks US, REITs, Outros. Para cada ativo: ticker, quantidade, preço médio, cotação atual, valor investido, valor atual, variação (R$ e %), participação na carteira (%).

Para adicionar ativo: tipo operação (compra/venda), ticker, data, quantidade, preço unitário, taxas (opcional). Sistema calcula preço médio ponderado automaticamente.

### 3.2 Regras de Negócio

- **RN-PTR-01:** Classes suportadas: Ações BR, FIIs, ETFs BR, BDRs, Renda Fixa (Tesouro, CDB, LCI, LCA), Criptomoedas, Stocks US, REITs, Outros.
- **RN-PTR-02:** Preço médio = média ponderada: (Σ quantidade × preço) / Σ quantidade. Vendas não alteram preço médio, apenas reduzem quantidade.
- **RN-PTR-03:** Cotações via API gratuita (Alpha Vantage, Brapi ou Yahoo Finance). FREE: 1x/dia. PRO: tempo real.
- **RN-PTR-04:** Distribuição exibida em pizza por classe e por setor.
- **RN-PTR-05:** Rentabilidade = ((Valor Atual + Proventos - Valor Investido) / Valor Investido) × 100.
- **RN-PTR-06:** Comparativo vs benchmarks: CDI, IBOVESPA, IFIX. Gráfico de linha da carteira vs benchmark. (PRO)
- **RN-PTR-07:** Limite FREE: 10 ativos. PRO: ilimitado.
- **RN-PTR-08:** Histórico de todas as operações com filtros por data, ativo e tipo.
- **RN-PTR-09:** Se patrimônio vinculado a Objetivo no Futuro, valor total alimenta progresso automaticamente.

### 3.3 Critérios de Aceite

- [ ] CRUD de operações com cálculo de preço médio
- [ ] Distribuição por classe em gráfico de pizza
- [ ] Rentabilidade total e por ativo calculada
- [ ] Gráfico de evolução patrimonial
- [ ] Comparativo vs CDI e IBOVESPA
- [ ] Cotações atualizadas diariamente

---

## 4. FUNCIONALIDADE: PROVENTOS

### 4.1 O que o usuário vê e faz

Calendário mensal com dividendos, JCP e rendimentos de FIIs. Tabela: ativo, tipo provento, data, valor/cota, quantidade, valor total. Gráfico de barras com proventos nos últimos 12 meses.

**Insight diferencial:** Proventos integrados no calendário financeiro. O usuário vê no mesmo calendário que recebe R$ 320 de dividendos e paga R$ 800 de aluguel no mesmo dia.

### 4.2 Regras de Negócio

- **RN-PTR-10:** Proventos cadastrados manualmente (futuro: integração B3).
- **RN-PTR-11:** Tipos: Dividendos, JCP, Rendimentos FII, Juros Renda Fixa, Outros.
- **RN-PTR-12:** Proventos recebidos → receita automática em Finanças: "Investimentos — Proventos".
- **RN-PTR-13:** Proventos futuros (anunciados) → previsão no calendário financeiro.
- **RN-PTR-14:** Yield on Cost = (Proventos 12m / Valor Investido) × 100, por ativo.
- **RN-PTR-15:** Projeção de proventos futuros baseada nos últimos 12 meses.
- **RN-PTR-16:** Se meta de renda passiva vinculada ao Futuro, proventos médios alimentam progresso.

---

## 5. FUNCIONALIDADE: SIMULADOR DE INDEPENDÊNCIA FINANCEIRA

### 5.1 O que o usuário vê e faz

Calculadora interativa: patrimônio atual, aporte mensal, rentabilidade esperada (%), renda passiva desejada. Resultado: anos/meses para IF + gráfico de crescimento com 3 cenários (pessimista, base, otimista).

### 5.2 Regras de Negócio

- **RN-PTR-17:** Cálculo com juros compostos: VF = VP × (1 + i)^n + PMT × [(1 + i)^n − 1] / i.
- **RN-PTR-18:** IF = rendimento mensal ≥ renda desejada, considerando taxa de retirada 4%/ano.
- **RN-PTR-19:** Cenários: pessimista (taxa -2%), base, otimista (taxa +2%).
- **RN-PTR-20:** Aporte pode ser vinculado a meta no Futuro e item do orçamento.
- **RN-PTR-21:** Exclusivo PRO/Modo Jornada.

---

## 6. INTEGRAÇÃO COM OUTROS MÓDULOS

### 6.1 Patrimônio → Finanças

| Evento | Ação em Finanças |
|--------|------------------|
| Provento recebido | Receita automática "Investimentos — Proventos" |
| Aporte mensal | Despesa planejada "Investimentos — Aportes" |
| Provento futuro anunciado | Previsão no calendário financeiro |

### 6.2 Patrimônio → Tempo

| Evento | Ação no Tempo |
|--------|---------------|
| Data de pagamento de provento | Evento no calendário financeiro |

### 6.3 Patrimônio → Futuro

| Evento | Ação no Futuro |
|--------|----------------|
| Patrimônio total atualizado | Progresso da meta patrimonial |
| Proventos médios mensais | Progresso da meta de renda passiva |
| IF calculada | Contexto para objetivo de independência financeira |

### 6.4 Patrimônio → Carreira

| Evento | Ação em Carreira |
|--------|------------------|
| Renda de investimentos | Complementa projeção de renda total |

### 6.5 Regras de Integração

- **RN-PTR-22:** Integrações opt-in.
- **RN-PTR-23:** Transações auto-geradas com badge "Auto — 📈 Patrimônio".
- **RN-PTR-24:** Exclusão de ativo pergunta sobre transações vinculadas.

---

## 7. MODO FOCO vs MODO JORNADA

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Dashboard | Patrimônio, rentabilidade, composição | Barra de progresso para IF + frase motivacional |
| Proventos | Tabela com valores | "Sua renda passiva paga X dias do seu aluguel!" |
| Simulador | Cálculo matemático | Timeline visual gamificada com marcos |
| Relatório | Dados tabulares | "Patrimônio cresceu mais que CDI pelo 3º mês. Parabéns!" |

---

## 8. MODELO DE DADOS

```sql
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
    finance_transaction_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX idx_portfolio_assets_user ON portfolio_assets(user_id);
CREATE INDEX idx_portfolio_transactions_asset ON portfolio_transactions(asset_id);
CREATE INDEX idx_portfolio_dividends_user_date ON portfolio_dividends(user_id, payment_date);
```

---

## 9. RESUMO — 24 REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-PTR-01 a 09 | Gestão de carteira | Carteira |
| RN-PTR-10 a 16 | Proventos e rendimentos | Proventos |
| RN-PTR-17 a 21 | Simulador IF | Simulador |
| RN-PTR-22 a 24 | Regras de integração | Integração |

---

*Documento criado em: Fevereiro 2026*
*Módulo: 📈 Patrimônio — Investimentos e Ativos*
