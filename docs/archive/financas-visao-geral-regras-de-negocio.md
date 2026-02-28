# SyncLife — Finanças · Visão Geral
## Documento de Regras de Negócio
**Versão:** 1.1 · Revisado em 23/02/2026 (7 correções aplicadas vs. protótipo)  
**Protótipo de referência:** `proto-financas-dashboard.html`  
**Uso:** Orientar o desenvolvimento da tela pelo Claude Code

---

## 1. Visão Geral da Tela

A **Visão Geral** é a tela principal do módulo Finanças. É a primeira tela exibida ao acessar o módulo. Seu objetivo é dar ao usuário uma leitura completa da saúde financeira do mês corrente em uma única tela, sem precisar navegar para subpáginas.

O escopo da tela é **sempre o mês corrente**. O usuário pode trocar o mês pelo seletor no cabeçalho da página, mas o padrão ao carregar é sempre o mês atual.

---

## 2. Layout e Navegação

### 2.1 Estrutura Geral

A tela segue o shell padrão do SyncLife com três camadas de navegação:

```
[ Module Bar 58px ] [ Sidebar 220px ] [ Main Content — flex: 1 ]
```

O Main Content é dividido em:
- **Top Header** (50px, fixo): breadcrumb / saudação + controles globais
- **Content Area**: scrollável verticalmente, padding 20px

### 2.2 Module Bar (Nível 1)

Barra vertical fixa à esquerda, 58px de largura. Contém:

- **Logo SyncLife** no topo (SVG oficial, 34×34px)
- **Botões de módulo** (ícones, 40×40px, border-radius 12px):
  - Home
  - **Finanças** ← ativo nesta tela
  - Metas
  - Agenda
- **Configurações** fixado no rodapé

**Estado ativo:** background `rgba(16,185,129,0.14)`, cor `#10b981`, pill verde de 3px na borda esquerda do botão (`::before`).

### 2.3 Sidebar (Nível 2)

220px de largura. Contém a navegação interna do módulo Finanças, organizada em 3 seções:

**Seção Principal:**
- Visão Geral ← ativo nesta tela
- Transações
- Orçamentos

**Seção Planejamento:**
- Planejamento
- Recorrentes
- Calendário (exibe badge numérico vermelho com contagem de itens pendentes)

**Seção Análise:**
- Relatórios

**Estado ativo do item de nav:** background `rgba(16,185,129,0.14)`, cor `#10b981`, font-weight 500.

**Modo Jornada:** A sidebar exibe adicionalmente o **Life Sync Score** abaixo do header, com score global (ex: 74) e score financeiro (ex: 88), barra de progresso gradiente Esmeralda→Âmbar, e variação da semana.

### 2.4 Top Header

**Modo Foco:** Exibe breadcrumb `Finanças › Visão Geral · Mês/Ano`

**Modo Jornada:** Substitui o breadcrumb por saudação personalizada com o nome do usuário e frase de contexto financeiro (ex: "Financeiro em 88 pts — melhor mês do semestre.")

**Controles globais** (sempre visíveis, lado direito):
- Pill **Modo**: alterna entre Foco (🎯) e Jornada (🌱)
- Pill **Tema**: alterna entre Dark (🌙) e Light (☀️)
- Botão de **Notificações** com indicador de ponto vermelho quando há notificações não lidas

### 2.5 Cabeçalho da Página (dentro do Content)

- Eyebrow: "MÓDULO FINANÇAS" em verde Esmeralda
- Título: "Visão Geral" (Syne 22px, weight 800)
- Subtítulo: `[Mês Ano] · semana X de Y · Z dias restantes`
- **Botão seletor de mês** (dropdown): exibe o mês atual, permite navegar para meses anteriores
- **Botão Nova Transação** (CTA principal): cor Esmeralda, abre modal/drawer de criação de transação

---

## 3. Ordem dos Blocos de Conteúdo

A tela exibe os blocos **nesta ordem exata**, de cima para baixo:

1. KPI Strip (4 cards)
2. Saúde Financeira / Foco Band (muda conforme o modo)
3. **Consultor Financeiro IA** ← posição de destaque, logo após os KPIs
4. Histórico + Gastos por Categoria (grid lado a lado)
5. Fluxo de Caixa — dia a dia
6. Orçamentos + Últimas Transações (grid lado a lado)
7. Projeção de Saldo — Timeline
8. Próximas Recorrentes

---

## 4. KPI Strip

Grid de 4 cards em linha, gap 10px.

Cada card tem:
- Linha decorativa de 2px no topo (cor temática do card)
- Ícone (28×28px, border-radius 8px, fundo com opacidade da cor)
- Label em uppercase pequeno
- Valor principal (DM Mono, 21px)
- Delta vs. mês anterior (seta + porcentagem)
- Campo extra opcional (badge interno)

### 4.1 Cards e seus dados

| Card | Cor da linha | Valor | Delta | Extra |
|---|---|---|---|---|
| 💰 Receitas | Verde `#10b981` | `SUM(receitas do mês)` | `% vs mês anterior` | — |
| 📤 Despesas | Vermelho `#f43f5e` | `SUM(despesas do mês)` | `% vs mês anterior` | — |
| 💚 Saldo do Mês | Esmeralda | `receitas - despesas` | `+R$ X vs mês anterior` | "Disponível livre: R$ X" |
| 📊 Taxa de Poupança | Electric Blue `#0055ff` | `(saldo / receitas) * 100` | `+Xpp vs mês anterior` | "Meta: X% · ✓ acima / ✗ abaixo" |

### 4.2 Regras dos Deltas

- Receitas: delta **sempre verde** quando positivo (mais receita = bom)
- Despesas: delta **sempre vermelho** quando positivo (mais despesa = ruim), mesmo que a seta seja "↑"
- Saldo e Poupança: verde quando positivo, vermelho quando negativo

### 4.3 Campo "Disponível Livre" (Saldo do Mês)

`Disponível livre = Saldo do mês - total comprometido com recorrentes futuras do mês`

É o dinheiro que o usuário pode gastar sem comprometer obrigações já conhecidas.

### 4.4 Campo "Taxa de Poupança"

`Taxa de Poupança = (Saldo do Mês / Receitas do Mês) * 100`

Exibe comparação com a meta de poupança definida pelo usuário nas configurações. Se não houver meta, omite o campo extra.

---

## 5. Saúde Financeira / Foco Band

Dois componentes mutuamente exclusivos — apenas um é exibido por vez conforme o modo ativo.

### 5.1 Saúde Financeira (Modo Jornada)

Card com gradiente sutil Esmeralda→Electric Blue, borda `rgba(16,185,129, 0.18)`.

Contém:
- **Score de Saúde Financeira** (0–100, número grande à esquerda): calculado com base na taxa de poupança, envelopes dentro do limite, streak de registros e metas no ritmo
- **Título motivacional** gerado dinamicamente conforme o score
- **Texto descritivo** contextualizado ao mês atual (streak, situação dos gastos)
- **Tags de status** (chips): verde `✓` para itens positivos, amarelo `⚠` para alertas
- **Botão** "Ver análise completa" → navega para Relatórios

**Exemplos de tags:**
- `✓ Poupança acima da meta`
- `✓ X metas no ritmo`
- `⚠ [Categoria] em X%`
- `⚠ X meta(s) atrasada(s)`

### 5.2 Foco Band (Modo Foco)

Card horizontal com 4 métricas em linha, separadas por bordas verticais. Sem score, sem texto motivacional — apenas dados concretos.

| Métrica | Valor exibido |
|---|---|
| Orçamentos OK | `X / Y` (ativos dentro do limite / total de envelopes ativos) |
| Maior categoria | Nome da categoria com maior gasto no mês |
| Streak de registro | Número de dias consecutivos com ao menos 1 transação registrada |
| Recorrentes pendentes | Contagem de recorrentes que vencem até o fim do mês e ainda não foram pagas |

---

## 6. Consultor Financeiro IA

**Posição:** Logo após os KPIs / banda de saúde. É o bloco mais proeminente da tela, visível sem scroll.

**Visual:** Card full-width com gradiente de fundo Esmeralda→Electric Blue (opacity baixa), borda `rgba(16,185,129, 0.28)`, dois glows decorativos de fundo (radial-gradient, apenas visual).

### 6.1 Header do Card

- Ícone 38×38px com gradiente sólido Esmeralda→Electric Blue + box-shadow colorido
- Título: "Consultor Financeiro IA"
- Subtítulo: "Análise personalizada · [Mês Ano] · atualizado agora"
- Badge pulsante: "● X insights hoje" (animação `pulse` de opacidade/escala, 2s loop)

### 6.2 Grid de Insights (2×2)

Quatro cards em grid de 2 colunas, gap 8px. Cada card tem:
- Ícone emoji (20px)
- Tag de tipo (uppercase, 9px, cor temática)
- Texto do insight com partes em negrito, coloridas conforme urgência

**Quatro tipos de insight com visual distinto:**

| Tipo | Classe | Borda | Fundo | Cor da tag |
|---|---|---|---|---|
| Alerta | `urgent` | `rgba(244,63,94, 0.25)` | `rgba(244,63,94, 0.04)` | Vermelho `#f43f5e` |
| Ação recomendada | `action` | `rgba(0,85,255, 0.2)` | `rgba(0,85,255, 0.04)` | Electric Blue `#0055ff` |
| Conquista | `positive` | `rgba(16,185,129, 0.2)` | `rgba(16,185,129, 0.04)` | Verde `#10b981` |
| Previsão | `heads-up` | `rgba(245,158,11, 0.2)` | `rgba(245,158,11, 0.04)` | Amarelo `#f59e0b` |

**Hover dos cards de insight:** Todos os tipos têm o **mesmo comportamento** de hover — sublinhado reluzente na base do card (`::after`, height 2px, border-radius 2px) na cor temática do tipo, com `box-shadow` glow correspondente. Borda e fundo também ficam mais intensos. Nenhum tipo tem vantagem sobre outro — comportamento 100% consistente.

```css
/* Exemplo para urgent: */
.ai-ins-card.urgent::after {
  background: #f43f5e;
  box-shadow: 0 0 8px rgba(244,63,94, 0.6);
}
```

### 6.3 Regras de Geração dos Insights

Os insights são gerados automaticamente com base nos dados do usuário. **Prioridade de exibição:**

1. **Alerta** — envelope de categoria ≥ 80% do orçamento com dias restantes no mês
2. **Ação recomendada** — meta atrasada com valor de aporte calculado
3. **Conquista** — categoria que reduziu gasto ≥ 15% vs. mês anterior
4. **Previsão** — despesa pontual futura identificada (ex: IPVA, IPTU) que impactará o saldo

Se não houver dados suficientes para preencher os 4 quadrantes, o sistema prioriza os tipos mais urgentes e repete categorias diferentes.

### 6.4 Campo de Pergunta

Barra de input full-width na base do card, com:
- Ícone 💬
- Placeholder sugestivo com exemplos reais
- Botão "Perguntar" (gradiente Esmeralda→Electric Blue)

O input deve aceitar perguntas em linguagem natural sobre as finanças do usuário. A resposta é exibida inline no próprio card (não abre nova tela).

---

## 7. Histórico — Receitas vs Despesas

Card à esquerda do grid `1fr 400px`. Exibe os últimos 6 meses (incluindo o mês atual em destaque).

### 7.1 Gráfico de Barras Agrupadas

- **Eixo Y:** valores monetários, 5 gridlines horizontais (0, 1k, 3k, 5k, 7k ou ajustado ao maior valor)
- **Eixo X:** abreviação do mês (Set, Out, Nov, Dez, Jan, Fev)
- Cada mês tem 2 barras agrupadas: verde (receitas) e vermelha (despesas)
- O mês atual tem barras com opacidade total + label `Fev ●` destacado
- Meses anteriores têm opacidade reduzida nas barras

### 7.2 Legenda (sempre visível)

Abaixo das barras, linha de legenda permanente (separada por borda superior):
- ● Verde — Receitas
- ● Vermelho — Despesas

### 7.3 Tooltip ao Hover

Ao passar o mouse sobre um mês, exibe tooltip flutuante (acima da coluna) com:
- Nome completo do mês/ano em uppercase + indicador "— atual" para o mês corrente
- Receitas (verde, DM Mono)
- Despesas (vermelho, DM Mono)
- Saldo positivo/negativo separado por borda superior do tooltip

---

## 8. Gastos por Categoria

Card à direita do grid (400px fixo). Exibe distribuição percentual das despesas do mês.

### 8.1 Donut Chart

- SVG circular, 140×140px
- Centro exibe o **total gasto no mês** em R$
- Cada fatia corresponde a uma categoria
- Rotação de -90° (começa do topo)
- No header do card: badge de alerta `⚠ [Categoria] +X%` para a categoria mais fora do padrão

**Paleta de cores das categorias** (fixada por categoria):

| Categoria | Cor |
|---|---|
| Moradia | `#3b82f6` (azul) |
| Alimentação | `#10b981` (verde) |
| Transporte | `#f59e0b` (âmbar) |
| Lazer | `#f97316` (laranja) |
| Saúde | `#8b5cf6` (roxo) |
| Outros | `#64748b` (cinza) |

### 8.2 Lista de Categorias

Ao lado do donut, lista vertical com cada categoria. Cada linha contém:

- **Ponto colorido** (9×9px, cor da categoria)
- **Nome da categoria** com emoji + variação mês a mês inline
- **Percentual** do total (valor principal visível, sem coluna de valor)
- **Tooltip** ao hover: exibe o valor em R$ + contexto da variação

**Variação mês a mês (inline no nome):**

| Variação | Visual | Cor |
|---|---|---|
| `= 0%` ou `< ±5%` | `= 0%` ou `= estável` | Cinza `--t3` |
| Reduziu (`< -5%`) | `↓ -X%` | Verde `#10b981` |
| Aumentou (+5% a +14%) | `↑ +X%` | Amarelo `#f59e0b` |
| Aumentou (≥ +15%) | `⚠ +X%` | Laranja `#f97316` |

**Regra do warning no header:** O badge de alerta no cabeçalho do card exibe a categoria com a **maior variação positiva** dentre as que ultrapassaram o threshold de ≥ +15%. Se nenhuma categoria atingir +15%, o badge não é exibido.

**Tooltip de categoria (aparece à esquerda do item no hover):**
- Posição: `right: calc(100% + 8px)`, vertically centered (`top: 50%`, `translateY(-50%)`)
- Valor em R$ (DM Mono, 14px)
- Percentual do total
- Variação vs. mês anterior com texto contextual (ex: "↓ -20% vs jan · ótimo!")

---

## 9. Fluxo de Caixa — Dia a Dia

Card full-width. Exibe o movimento financeiro diário do mês corrente, combinando barras de entrada/saída com linha de saldo.

### 9.1 Instruções de Leitura

Sempre exibir abaixo do título uma **caixa explicativa** com texto didático:

> Como ler: Cada coluna = 1 dia do mês. ■ Verde = dinheiro que entrou naquele dia. ■ Vermelho = quanto saiu em gastos. — Linha azul = saldo na sua conta ao final do dia. Colunas esmaecidas após [dd/mm] são previsões.

### 9.2 Estrutura do Gráfico

**Escala — MAX_VAL:** Antes de renderizar, calcular o valor máximo de referência:
```
MAX_VAL = Math.ceil(Math.max(...days.map(d => Math.max(d.inc, d.bal))) / 500) * 500
```
Todas as alturas de barras e posições da linha de saldo são proporcionais a este MAX_VAL. A área de barras tem altura fixa de **88px** (`.cf-grid` tem 110px de altura total, mas as barras ocupam 88px).

- **28/30/31 colunas** (dependendo do mês) com gap de 2px entre cada uma
- Cada coluna representa 1 dia e contém:
  - **Barra verde** (entrada): altura proporcional ao total de receitas do dia. Se não houver receita, altura 0. Mínimo de 4px quando há valor.
  - **Barra vermelha** (saída): altura proporcional ao total de despesas do dia. Se não houver despesa, altura 0. Mínimo de 2px quando há valor.
  - **Label** no eixo X: formato `dd/mm` (ex: `01/02`, `15/02`), font-size 7px, DM Mono
- **Marcador do dia atual:** coluna com classe `.today` exibe uma **linha vertical + tag "Hoje"** acima das barras (além das demais regras visuais)
- **Eixo Y:** 4 labels à esquerda posicionados **absolutamente** sobre a altura de 88px, com `transform: translateY(-50%)`:
  - `top: 0%` → valor máximo da escala (ex: 5k)
  - `top: 33%` → 2/3 do máximo (ex: 3.5k)
  - `top: 66%` → 1/3 do máximo (ex: 2k)
  - `top: 100%` → valor base (ex: 500)

  > **Nota:** os labels do eixo Y não são quartos iguais do MAX_VAL — são valores representativos e legíveis escolhidos com base no range dos dados. Na implementação, calcule labels "redondos" que façam sentido para o range (ex: se MAX_VAL = 6.000, use 6k / 4k / 2k / 0).

- **Gridlines:** 4 linhas horizontais sutis (opacity baixa) atravessando toda a largura, espaçadas igualmente por `justify-content: space-between`

### 9.3 Linha de Saldo

SVG overlay posicionado absolutamente sobre as barras (`position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 88px`, `z-index: 5`), com:
- **Path cubic bezier** conectando o saldo ao final de cada dia (smooth, não angular). Cada ponto de controle usa 1/3 da distância horizontal entre os pontos adjacentes.
- Stroke: `#0055ff` (Electric Blue), stroke-width 2, stroke-linecap round
- Fill: área abaixo da linha com gradiente vertical `rgba(0,85,255,0.18)` → `rgba(0,85,255,0.01)`
- **Ponto marcador "hoje"**: círculo r=4 preenchido `#0055ff`, borda 2px `--s1`. Posicionado no ponto da linha correspondente ao dia marcado como `today`.
- **Ponto marcador saldo mínimo**: círculo r=3.5 preenchido `var(--red)`, borda 1.5px `--s1`. Posicionado no dia com o **menor valor de saldo** do mês — calculado dinamicamente como `days.reduce((minIdx, d, i) => d.bal < days[minIdx].bal ? i : minIdx, 0)`.

A linha é **calculada via JavaScript** após as barras serem renderizadas, usando `getBoundingClientRect()` para posicionar cada ponto exatamente sobre o centro horizontal de sua coluna de dia.

### 9.4 Marcadores de Eventos

Dias com eventos relevantes exibem um mini-label **acima** da coluna (posicionado antes das barras no DOM). Exemplos de eventos suportados:
- 💰 Salário
- 🏠 Aluguel / Condomínio
- ⚡ Contas (pacote de contas do mês)
- 🔄 Recorr. (dia de cobrança de assinaturas)

**Lógica de cor** do evento (fundo + texto):

| Condição | Fundo | Texto |
|---|---|---|
| Dia com entrada (`inc > 0`) | `rgba(16,185,129, 0.15)` | `var(--green)` |
| Saída grande (`exp > 300`) | `rgba(244,63,94, 0.12)` | `var(--red)` |
| Saída moderada (demais) | `rgba(245,158,11, 0.12)` | `var(--orange)` |

### 9.5 Dias Futuros

Dias **a partir do dia seguinte ao dia atual** (não inclusive hoje) são marcados como futuros e exibidos com:
- Barras com `opacity: 0.3`
- Label do dia com `opacity: 0.35`
- O dia atual (hoje) é o último dia "real" — exibe barras com opacidade total
- Os dados dos dias futuros vêm das **transações recorrentes agendadas** e das **previsões do planejamento**

### 9.6 Tooltip ao Hover

Ao passar o mouse sobre qualquer coluna:
- Cabeçalho: "Dia X/MM" + indicador `· prev.` em span menor (font-size 9px) se futuro
- Entrada do dia em verde + DM Mono (omite linha se zero)
- Saída do dia em vermelho + DM Mono (omite linha se zero)
- Evento especial do dia (se houver, com emoji)
- Saldo ao final do dia com cor dinâmica:

| Faixa de saldo | Cor |
|---|---|
| > R$ 2.000 | Verde `var(--green)` |
| R$ 500 – R$ 2.000 | Amarelo `var(--yellow)` |
| < R$ 500 | Vermelho `var(--red)` |

### 9.7 Cards de Resumo (abaixo do gráfico)

Grid de 4 cards com os highlights do mês:

| Card | Dado | Cor do valor |
|---|---|---|
| Maior entrada | Valor + dia + descrição | Verde |
| Maior saída num dia | Valor + dia + descrição | Vermelho |
| Saldo mais baixo | Valor + dia + contexto | Vermelho |
| Saldo hoje | Valor + data + contexto | Electric Blue |

### 9.8 Legenda

Abaixo dos cards de resumo:
- ■ Verde — Entrada no dia
- ■ Vermelho — Saída no dia
- — Azul — Saldo na conta
- □ tracejado — Dias previstos (alinhado à direita)

---

## 10. Orçamentos do Mês

Metade esquerda do grid `1fr 1fr`. Exibe o status dos envelopes de orçamento do mês.

### 10.1 Budget Health Score

Barra no topo do card mostrando a saúde geral dos envelopes com dots coloridos:
- Ponto **verde**: envelope ≤ 60% utilizado
- Ponto **amarelo**: envelope entre 61% e 79% utilizado
- Ponto **laranja**: envelope entre 80% e 99% utilizado
- Ponto **vermelho**: envelope estourado (≥ 100%)
- Ponto **cinza/transparente**: envelope inativo (sem gastos no mês)

Texto resumo: `X ok · Y atenção · Z inativo`

### 10.2 Lista de Envelopes

Cada envelope exibe:
- Emoji da categoria + nome
- Valor gasto (`R$ X`) / Limite (`R$ Y`)
- Percentual utilizado
- Barra de progresso (cor = status do envelope)

**Cor da barra de progresso:**

| Faixa | Cor |
|---|---|
| 0–60% | Verde `#10b981` |
| 61–79% | Amarelo `#f59e0b` |
| 80–99% | Laranja `#f97316` |
| ≥ 100% | Vermelho `#f43f5e` |

Envelopes inativos (sem gastos no mês) são exibidos com `opacity: 0.45` ao final da lista.

### 10.3 Não Alocado

Abaixo da lista, badge verde exibindo o valor não alocado em envelopes no mês:

`Não alocado = Receitas do mês - SUM(limites de todos os envelopes ativos)`

---

## 11. Últimas Transações

Metade direita do grid. Lista as **7 transações mais recentes** do mês, ordenadas por data decrescente.

Cada item exibe:
- Ícone emoji da categoria (29×29px, border-radius 8px, fundo `--s3`)
- Nome da transação
- Data + método de pagamento
- Valor com sinal (− vermelho para despesas, + verde para receitas)
- Categoria

**Hover** no item: fundo suave `--s2`, padding lateral ajustado, border-radius 8px.

**Botão "Ver todas"** → navega para a tela de Transações.

---

## 12. Projeção de Saldo — Timeline

Card full-width. Projeta o saldo esperado nos próximos 5 meses com base em receitas recorrentes conhecidas, despesas recorrentes cadastradas e padrão histórico de gastos.

### 12.1 Bloco de Saldo Atual

Seção destacada com gradiente e borda Esmeralda no topo do card:
- **Saldo disponível agora** (valor grande, 28px DM Mono): `saldo atual na conta`
- Data e contexto (ex: "22 de fevereiro de 2026 · após condomínio")
- **Três pills** lado a lado:
  - Comprometido: soma das recorrentes futuras do mês (vermelho)
  - Livre estimado: `saldo atual - comprometido` (verde)
  - Taxa de poupança do mês atual (Electric Blue)

### 12.2 Timeline Horizontal

Linha do tempo com **5 nós** (mês atual + 4 meses seguintes):

Cada nó tem:
- **Dot colorido** (14px, border 2px branca) indicando o status do mês
- **Card do mês** com: nome do mês, saldo projetado, variação vs. mês anterior, nota contextual

**Tipos de nó:**

| Tipo | Dot | Borda do card | Fundo do card | Quando usar |
|---|---|---|---|---|
| `current` | Esmeralda + glow | `rgba(16,185,129, 0.3)` | `rgba(16,185,129, 0.06)` | Mês atual |
| `good` | Electric Blue + glow | `rgba(0,85,255, 0.2)` | `rgba(0,85,255, 0.04)` | Saldo crescendo |
| `warn` | Vermelho + pulsante | `rgba(244,63,94, 0.3)` | `rgba(244,63,94, 0.05)` | Queda significativa ou saldo crítico |

**Trilho da timeline:** Linha de 2px com preenchimento proporcional ao progresso do mês atual (ex: dia 22 de um mês de 28 dias = ~78% preenchido em Esmeralda→Electric Blue).

**Regra do nó `warn`:** Um mês é marcado como `warn` quando o saldo projetado é ≤ 30% do saldo do mês anterior **ou** quando há uma despesa pontual identificada (IPVA, IPTU, anuidade) que representa ≥ 30% do saldo atual.

O dot do nó `warn` tem animação `pulse` (mesma animação do badge do Consultor IA).

### 12.3 Alerta Contextual

Se houver ao menos um nó `warn` na timeline, exibe abaixo da timeline um banner de alerta (fundo vermelho opacity, borda vermelha) com:
- Ícone ⚠
- Texto explicativo com o motivo da queda e a **ação recomendada** (valor a reservar por mês para cobrir o impacto)

---

## 13. Próximas Recorrentes

Card full-width. Exibe as recorrentes do mês corrente e as primeiras do próximo mês, em grid de 5 colunas.

Cada item exibe:
- Emoji da categoria
- Badge de status (canto superior direito)
- Nome da recorrente
- Data de vencimento ou pagamento
- Valor em vermelho

**Status das recorrentes:**

| Status | Badge | Cor | Quando |
|---|---|---|---|
| `hoje` | Amarelo | `#f59e0b` | Vence hoje |
| `X dias` | Amarelo | `#f59e0b` | Vence em X dias (≤ 7 dias) |
| `pago` | Verde | `#10b981` | Já foi paga no mês |
| `[mês abv]` | Cinza | `--t3` | Vence no próximo mês |

---

## 14. FAB — Botão de Ação Rápida

Botão flutuante fixo no canto inferior direito (bottom: 22px, right: 22px):
- Círculo 46px, gradiente Esmeralda→Electric Blue, ícone `+`
- Ao clicar: rotaciona 45° (vira `×`) e expande 3 opções em coluna:
  - Nova Transação 💳
  - Nova Recorrente 🔄
  - Novo Orçamento 💼
- Cada opção tem label à esquerda + ícone à direita

---

## 15. Modo Foco vs. Modo Jornada

A tela se adapta completamente ao modo selecionado. A preferência é salva por usuário.

| Elemento | Modo Foco | Modo Jornada |
|---|---|---|
| Header | Breadcrumb técnico | Saudação personalizada com score |
| Sidebar | Score oculto | Life Sync Score visível |
| Banda de status | Foco Band (4 métricas secas) | Saúde Financeira (score + tags + texto) |
| Tom geral | Analítico, denso | Motivacional, celebratório |
| Dados | Idênticos em ambos os modos | Idênticos em ambos os modos |

Os dados exibidos são **exatamente os mesmos** nos dois modos — o que muda é a apresentação, o tom e a presença de elementos motivacionais.

---

## 16. Temas (Dark / Light)

A tela suporta 4 combinações de tema:

| Combinação | Classe no body |
|---|---|
| Dark Foco | (padrão, sem classes extras) |
| Dark Jornada | `.jornada` |
| Light Foco | `.light` |
| Light Jornada | `.light.jornada` |

Todos os tokens de cor são CSS custom properties em `:root`, sobrescritas pelas classes de tema. Nenhuma cor é hardcoded fora do design system.

### Tokens principais

```css
/* Dark (padrão) */
--bg: #03071a
--s1: #07112b    /* surface 1 — cards, sidebars */
--s2: #0c1a3a    /* surface 2 — inputs, badges */
--s3: #132248    /* surface 3 — hover states */
--t1: #dff0ff    /* texto primário */
--t2: #6e90b8    /* texto secundário */
--t3: #2e4a6e    /* texto terciário / labels */
--em: #10b981    /* Esmeralda (brand primary) */
--el: #0055ff    /* Electric Blue (brand secondary) */
--green: #10b981
--yellow: #f59e0b
--orange: #f97316
--red: #f43f5e
```

---

## 17. Tipografia

| Família | Uso |
|---|---|
| **Syne** (400–800) | Títulos de página, títulos de card, scores, nome do módulo na sidebar |
| **DM Sans** (300–600) | Todo o restante: labels, textos, nav items, botões |
| **DM Mono** (400–500) | Valores monetários, percentuais, dados numéricos, eixos de gráficos |

---

## 18. Animações e Interações

### 18.1 Entrada da Página

Todos os blocos de conteúdo entram com animação `fadeUp` (translateY de 10px → 0, opacity 0 → 1), com delays escalonados:

```
KPI Strip:         delay 0.05s
Saúde / Foco band: delay 0.10s
Consultor IA:      delay 0.10s
Top Grid:          delay 0.15s
Fluxo de Caixa:    delay 0.20s
Orçamentos / Txn:  delay 0.20s
Projeção:          delay 0.25s
Recorrentes:       delay 0.30s
```

### 18.2 Barras do Histórico

As barras do gráfico de histórico animam sua altura de 0 até o valor real com `transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1)`, disparado 250ms após o carregamento da página.

### 18.3 Barras do Fluxo de Caixa

Mesmo padrão das barras do histórico: `transition: height 0.7s cubic-bezier(0.4, 0, 0.2, 1)`, disparado 400ms após o carregamento. A linha de saldo SVG é desenhada 650ms após o carregamento (após as barras estarem visíveis).

### 18.4 Barras de Progresso dos Envelopes

`transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1)`, disparado 250ms após o carregamento.

### 18.5 Redimensionamento da Janela

O SVG da linha de saldo do Fluxo de Caixa é **redesenhado completamente** a cada evento `resize` da janela, garantindo que os pontos continuem alinhados às colunas de dia.

---

## 19. Referências de API / Dados Necessários

Para implementar a tela, os seguintes dados precisam ser fornecidos pela API:

```
GET /finances/overview?month=YYYY-MM&userId=X

Retorna:
{
  kpis: { receitas, despesas, saldo, taxaPoupanca, metaPoupanca },
  saudeScore: number,                    // 0-100
  foco: { orcamentosOK, maiorCategoria, streak, recorrentesPendentes },
  insights: Insight[],                   // máx 4, ordenados por prioridade
  historico: MonthData[],                // últimos 6 meses
  categorias: CategoriaGasto[],          // com variacao vs mês anterior
  fluxoCaixa: DayData[],                 // todos os dias do mês (reais + previstos)
  orcamentos: Envelope[],
  transacoes: Transacao[],               // últimas 7
  projecao: ProjecaoMes[],              // 5 meses (atual + 4 futuros)
  recorrentes: Recorrente[]             // mês atual + próximo
}
```

---

*Documento gerado com base no protótipo aprovado `proto-financas-dashboard.html` em 22/02/2026.*
