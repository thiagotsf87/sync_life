# Fase 2 · Finanças, subtelas · brief dos protótipos

> Data: 2026-10-05. Plano-mãe: `2026-10-03-rollout-ds-v5-sem-metafora.md` §4 Fase 2.
> Ciclo: protótipo desktop → mobile dedicado → aprovação → implementação → identidade. **Este brief cobre só os protótipos.**
> Inventário funcional do v3: seção 6 abaixo (paridade obrigatória, nada some sem decisão).

## 1. Arquivos a produzir (em `prototypes/v5/app/`)

| Tela | Desktop | Mobile | Template | Sy | Laboratório |
|---|---|---|---|---|---|
| Transações (r2 do `_t2-lista`) | `financas-transacoes.html` | `financas-transacoes.mobile.html` | T2 | camada | não |
| Orçamentos | `financas-orcamentos.html` | `financas-orcamentos.mobile.html` | T2, linhas com barra | topo, 1 linha | **sim**: teto de Lazer |
| Recorrentes | `financas-recorrentes.html` | `financas-recorrentes.mobile.html` | T2 | camada | não |
| Planejamento | `financas-planejamento.html` | `financas-planejamento.mobile.html` | T3, o mês como objeto | topo | **sim**: data da troca do notebook |
| Calendário | `financas-calendario.html` | `financas-calendario.mobile.html` | T3, grade mensal | camada | não |
| Relatórios | `financas-relatorios.html` | `financas-relatorios.mobile.html` | T1 reduzido, só evidência | topo, 1 linha por gráfico (opcional) | não |
| Importar extrato | `financas-importar.html` | `financas-importar.mobile.html` | T4, 3 passos | topo, "o que reconheci" | não |

**Não editar** `shared/*`, `financas-a*`, `meu-dia-d*`, nem os `_t*` (são referência aprovada). Peça que faltar no shared
fica inline na página, num bloco comentado `/* candidata a shared */`.

## 2. Referências obrigatórias (ler antes de escrever)

- `DESIGN-SYSTEM-v5.md` §1, §4, §6.1 (chrome, bottom bar), §6.3 (T1 a T4 e "O que Sy lê aqui"), §6.4 (Sy), regras de copy.
- Template da tela: `_t2-lista(.mobile).html`, `_t3-detalhe(.mobile).html`, `_t4-form(.mobile).html`. O laboratório de T3
  (`_t3-detalhe.html`) é o modelo de laboratório fora de Meu dia.
- Chrome e hub: `financas-a(.mobile).html` (desktop: bar + modbar com 01 Finanças ativo).
- **Mobile com a bottom bar aprovada:** markup em `_intencao.mobile.html` (`<nav class="bbar">` + `#sheetAreas`). O CSS e o
  wiring agora estão no shared (`app.css`, `app.js`): só copie o markup. Nas páginas mobile o `modbar` sai; o bar superior fica
  com a marca e o `+`. A camada de Sy vem **antes** do `#sheetAreas` no DOM. Cabeçalho de subtela no mobile: a peça `.subbar`
  sticky (voltar + título curto) de `life-score-v2.mobile.html`.
- **Painel lateral de edição** (`.painel`, `.confirma`, `.btn-sm.ghost.perigo`) está no shared desde hoje: use-o no desktop.
  No mobile, a edição e a captura são **sheet** (ver `_t2-lista.mobile.html`).
- **Dados: só `shared/mock-data.js`.** `SL_MOCK.fin` (novo) tem contas, recorrentes, planejamento, orçamentos, relatórios,
  importar e calendário, gerados por script e coerentes com o hub (`SL_MOCK.financas`, `transacoes`, `orcamentos`). Nenhum
  número fora do mock. Hoje no protótipo é **sexta, 3 de outubro de 2026**.

## 3. Regras (LEI, herdadas do programa)

1. Sem metáfora e sem estilo revista: nada de `.lt`, `.selo`, Caveat/`.hand`/`.hl`, ticker, cabeçalho de frase longa, encenação.
2. Palavras proibidas em texto visível: edição, folha, manchete, colofão, jornal, byline, redação, diário, coach, assessor,
   "o Sy", "ao Sy", "do Sy". Grafia certa: "com Sy", "Sy leu". **Sem travessão (—)** na copy; en-dash só em negativo: `– R$ 320,00`.
3. Números: `.num`; `R$&nbsp;` (NBSP) sempre; moeda com centavos em listas, sem centavos em KPIs (como no hub).
4. Toda tela termina com a anotação `<section class="proto-estados" inert>`: **Estados** (vazio, carregando, erro, limite do
   plano FREE quando houver, e os estados próprios da tela) e **"O que Sy lê aqui"** (tabelas e colunas que o pacote de
   contexto da tela expõe). Sem isso a tela não entra em aprovação.
5. Laboratório ("uma escolha, mais de um efeito") só nas duas telas marcadas. Tem "De onde vêm esses efeitos?" com as fontes,
   "Experimentar" que muda só a tela (prévia local) e "Desfazer". Nada é lançado.
6. Mobile é tela dedicada a 390×844: uma coluna, alvos de toque ≥ 40px, `clamp(min, Xdvh, max)` para alturas, sheets no lugar
   de painéis e modais, teclado testado com foco nos campos do sheet.
7. Irreversível pede licença **inline** (`.confirma`), nunca modal. Vale para excluir em todas as telas.
8. Sem JS ou com `prefers-reduced-motion`, a página fica completa e estática.
9. Navegação dentro da área (decidida na aprovação da Fase 2, 2026-10-05): **faixa de subtelas** (`.subnav`, no shared) como primeira
   coisa dentro do `.wrap` de TODAS as telas da área, hub incluído: pílulas Visão geral · Transações · Orçamentos · Recorrentes ·
   Planejamento · Calendário · Relatórios · Importar, a atual com `aria-current="page"`. Mobile: rola na horizontal, 40px, e a atual
   é centralizada. Substitui a linha "Mais em Finanças" do rodapé. O padrão se repete nas demais áreas: Visão geral + as subtelas
   da área. Atalhos contextuais (ver orçamento em Meu dia, Ajustar no hub) continuam além da faixa.

## 4. Tela a tela

### 4.1 Transações (r2 do template T2)
Parte do `_t2-lista` aprovado e acrescenta, sem mudar o que foi aprovado:
- **Mês:** `‹ outubro de 2026 ›` no cabeçalho e "Voltar para hoje" fora do mês atual.
- **Ordenar** (pílula/select): mais recente, mais antigo, maior valor, menor valor. Por data, a lista agrupa por dia com o
  subtotal (já existe); por valor, lista plana.
- **Filtro de tipo** ganha "Transferências" e "Recorrentes".
- **Selos na linha:** `Recorrente`, `Previsto` (lançamento futuro, opacidade reduzida), `Transf.` com `Nubank → Inter`.
- **Painel de edição** (desktop) e **sheet** (mobile): tipo Despesa · Receita · Transferência; descrição, valor, categoria,
  data, **método** (Pix, crédito, débito, dinheiro, transferência, boleto), **observações**. Transferência troca categoria por
  conta de origem e destino (`SL_MOCK.fin.contas`, diferentes entre si) e gera a descrição `Origem → Destino` se vazia. Em
  ocorrência de recorrente, aviso: "Editar muda só este lançamento."
- Excluir com `.confirma` inline **também no mobile** (o v3 não deixava).
- "Carregar mais" no fim (sem paginação numérica); o total do rodapé é do **mês inteiro**, não da página.
- Sy pela camada; chips de sugestão de Transações.
- Mobile: bottom bar; o item **Registrar** da bottom bar abre o sheet de captura desta tela.

### 4.2 Orçamentos (T2 com barras) · laboratório
Fonte: `SL_MOCK.fin.orcamentos`.
- Cabeçalho curto com mês navegável; **Sy no topo em 1 linha** (ex.: só Lazer pede atenção) com fontes.
- Números em linha hairline: total orçado, gasto, disponível, não alocado (`receitas realizadas − orçado`; negativo vira
  "Orçamento maior que a renda").
- Lista dos 6 envelopes, cada linha com barra (peça `.orc` do hub): `gasto de limite`, %, sobra e dias restantes; selo
  `Atenção` quando passa o alerta do envelope, `Estourado` ≥ 100%; selo `Rollover +R$ 50` em Saúde. **Um só critério de
  alerta: o `alert_threshold` de cada envelope** (o v3 tinha dois).
- Gastos fora de envelope (Investimento R$ 300) numa linha quieta abaixo.
- Captura inline: novo envelope (categoria de despesa sem envelope + limite + alerta). Painel/sheet de edição: limite,
  alerta (50 a 100, passo 5), rollover, observações; **categoria travada na edição**; mostra o limite base e a sobra
  do mês anterior separados (o v3 gravava o limite inflado). Excluir com `.confirma`.
- "Copiar do mês anterior" como estado próprio (mês vazio) na anotação, com a lista de envelopes de setembro marcáveis.
- Referência 50-30-20 sobre a renda (`regra5030_20`) como nota dispensável, não banner.
- **Laboratório: "E se o teto de Lazer fosse outro?"** opções 420 (atual), 470, 520. Efeitos (do mock `lab.efeitos`):
  01 Finanças fechamento projetado; 01 Finanças poupança do mês; 02 Futuro quanto sobra para antecipar a Itália. Experimentar
  muda a linha de Lazer e os números da tela; Desfazer volta.

### 4.3 Recorrentes (T2)
Fonte: `SL_MOCK.fin.recorrentes`.
- Cabeçalho com 4 números: saída mensal, entrada mensal, impacto líquido, custo anual; e "% da renda comprometida" (53%,
  sobre a renda do perfil; o v3 usava 3.000 fixo).
- "Próximos 30 dias": as próximas ocorrências em ordem de data, com aviso ≤ 7 dias.
- Lista agrupada por frequência (mensais, quinzenais, trimestrais, anuais) com total por grupo; linha: nome, categoria,
  `dia 6` ou `a cada 14 dias`, valor e equivalente mensal quando não é mensal.
- Ações por linha: editar, **pausar/retomar** (pausada fica esmaecida, nome riscado, "não gera lançamentos"), excluir com
  `.confirma` ("os lançamentos já registrados ficam"). **Tudo isso também no mobile** (o v3 só deixava ver e criar).
- Captura inline e painel/sheet: tipo, nome, valor, frequência, dia do mês (só mensal/trimestral/anual), início, fim
  opcional, categoria, observações.
- Estado de limite FREE (5 ativas) na anotação; o mock é PRO.
- Sy pela camada.

### 4.4 Planejamento (T3: o mês como objeto) · laboratório
Fonte: `SL_MOCK.fin.planejamento`.
- Cabeçalho do objeto: voltar, "Planejamento · próximos 12 meses", pílulas de cenário (Pessimista, **Realista**, Otimista).
- **Número principal**: saldo em 6 meses (realista R$ 1.682) com o ponto mais baixo do ano (R$ 488 em mar/27) e o próximo
  mês crítico (jan/27, Gastos na Itália). Sy no topo em 1 ou 2 linhas.
- Curva do saldo em 13 meses (SVG como o fluxo do hub, linha do zero tracejada, marca "hoje"), com os eventos como pontos.
- Lista de eventos planejados (próximos 12 meses): data, nome, valor, selo `Confirmado`; ações editar, confirmar, excluir
  (`.confirma`). "Confirmar" só marca; não vira transação (diga isso na anotação).
- Captura: novo evento (tipo, nome, valor, data ≥ hoje, categoria, notas) em painel/sheet.
- **Laboratório: "Quando trocar o notebook?"** dezembro (antecipar), março (atual), maio (adiar), dados em `lab`. Efeitos:
  01 Finanças ponto mais baixo e o mês dele; 08 Experiências folga para a Itália em janeiro; 07 Carreira quando o notebook
  novo chega. Experimentar redesenha a curva e o número principal; Desfazer volta.
- A regra de projeção (`regra` no mock) vai na anotação, com a nota de que o v3 ignorava renda e gasto variáveis.

### 4.5 Calendário (T3: grade mensal)
Fonte: `SL_MOCK.transacoes` (1 a 3 de outubro) + `SL_MOCK.fin.calendario.extras` (recorrentes, planejado, provento).
- Cabeçalho: voltar, `‹ outubro de 2026 ›`, "Hoje". Números do mês em linha: entradas, saídas, saldo até hoje, projeção do mês
  (R$ 2.120, igual ao hub), pendentes.
- Grade domingo a sábado; em cada dia, pontos por tipo (recorrente, entrada, saída, transferência, planejado, provento) e o
  saldo curto do dia; hoje marcado. Saldo de cada semana no fim da linha.
- Dia selecionado (padrão: hoje): painel do dia ao lado no desktop, lista abaixo da grade no mobile. Mostra entradas, saídas,
  saldo do dia, os itens com tipo e o "saldo acumulado até aqui"; dia futuro diz que é projeção. Ações: **adicionar transação
  neste dia** (abre a captura com a data), adicionar evento planejado, e editar um item tocando nele.
- O provento de MXRF11 vem de 06 Patrimônio: diga a origem na linha.
- **Mobile adiciona** (o v3 não deixava): Registrar da bottom bar abre a captura com o dia selecionado.
- Sy pela camada.

### 4.6 Relatórios (T1 reduzido: só evidência)
Fonte: `SL_MOCK.fin.relatorios`.
- Cabeçalho curto: período em pílulas (Mês atual, **Último trimestre**, Último semestre, 12 meses, Ano atual,
  Personalizado). Períodos PRO com marca discreta; o mock é PRO. **Trocar o período recarrega na hora** (sem botão Gerar).
- Números (4 colunas hairline): receitas, despesas, saldo, poupança média, cada um com o delta contra abril a junho.
- Gráficos, cada um com 1 linha de Sy opcional em cima e tooltip ao passar o mouse (dados do mock): receitas × despesas por
  mês; categorias atual × anterior com delta; poupança por mês contra a meta de 30%; top 5 despesas.
- Exportar CSV (formato no mock); PDF e Excel só no estado PRO da anotação.
- Mobile: uma coluna, gráficos simplificados, período em scroll-x.

### 4.7 Importar extrato (T4: 3 passos)
Fonte: `SL_MOCK.fin.importar`.
- Passos numerados (G-09): **01 Arquivo** (arrastar ou escolher; PDF, CSV, OFX, QFX) → **02 Revisão** → **03 Categorias**.
- Sy no topo do passo 02, "o que reconheci": banco Nubank, 18 linhas, 15 com categoria, 3 sem, 2 possíveis duplicatas.
- Revisão: tabela com marcar/desmarcar, data, descrição, valor, tipo, categoria sugerida, selo `Duplicata?`. **Proposta: as
  linhas reconhecidas começam marcadas e as duplicatas desmarcadas** (o v3 começava tudo desmarcado).
- Categorias: select por linha sem categoria, "aplicar a todas", criar categoria inline.
- SaveBar sticky: "Importar 16 transações" (as marcadas). Depois, o concluído com "Ver transações".
- Histórico de importações (2 lotes) com "Desfazer este lote" e `.confirma`.
- Estados na anotação: CSV sem banco reconhecido (passo de mapear colunas Data, Descrição, Valor), PDF com senha, arquivo sem
  transações, importando com progresso.

## 5. QA que cada arquivo passa antes de entregar

Servidor: `python -m http.server 8765` em `prototypes/v5` (já de pé nesta sessão). De `web/`:

```
node scripts/qa-proto-v5.mjs app/financas-<tela>.html app/financas-<tela>.mobile.html
```

Tem que dar: `erros 0`, `overflow 0`, `proibidas` vazio, `revista` vazio, `caveat false`, `syLe true`, e no mobile
`alvos40 0`. Screenshots saem em `.playwright-mcp/qa-proto/`: abra e olhe as duas (desktop e mobile) antes de entregar.
Teste à mão (Playwright): painel/sheet abre e fecha (X, scrim, Esc), confirmação inline de excluir, laboratório
experimentar/desfazer, camada de Sy pelo bar (desktop) e pela bottom bar (mobile), sheet de Áreas.

## 6. Inventário v3 (resumo para paridade)

Código v3 de referência: `web/src/app/(app)/financas/<tela>/page.tsx` e os modais em `web/src/components/financas/`
(`TransacaoModal`, `EnvelopeModal`, `RecorrenteModal`, `PlanningEventModal`, `DeleteConfirmModal`). O essencial por tela:
- **Transações:** mês ‹›, busca, tipo (inclui transferências e recorrentes), categoria, ordenar, CRUD, transferência entre
  contas, método, observações, selos Previsto/Recorrente/Transf., XP +5 e streak ao criar, sync com metas de Futuro.
- **Orçamentos:** envelopes por categoria de despesa, limite, alerta 50 a 100, rollover (só com envelope no mês anterior),
  observações, copiar do mês anterior, não alocado, 50-30-20, limite FREE (hoje não aplicado no v3).
- **Recorrentes:** 5 frequências, dia do mês, início/fim, pausar, excluir lógico, próximas ocorrências, normalização mensal,
  limite FREE 5.
- **Planejamento:** 3 cenários, 13 meses, eventos com data ≥ hoje, confirmar, mês crítico (queda > 30%).
- **Calendário:** grade dom a sáb, tipos de ponto, gaveta do dia, adicionar no dia, proventos de Patrimônio, projeção do mês.
- **Relatórios:** 6 períodos (3 PRO), comparação com o período anterior, 4 KPIs, tendência por categoria, comparação de
  categorias, receitas × despesas, poupança × meta, top 5, tabela, CSV, análise de IA.
- **Importar:** PDF, CSV, OFX/QFX; bancos reconhecidos; mapear colunas; revisão com duplicatas; categorias; lotes de 50;
  histórico e desfazer por lote.

## 7. Correções do v3 embutidas (vão para aprovação junto com as telas)

1. Excluir pede confirmação inline em todas as telas (Orçamentos e Planejamento excluíam direto).
2. Mobile com paridade: editar, excluir, pausar e adicionar em todas as telas (o v3 tinha 4 lacunas).
3. Orçamentos: um só critério de alerta (o do envelope); edição mostra limite base e sobra separados.
4. Recorrentes: % comprometido sobre a renda do perfil (não 3.000 fixo).
5. Planejamento: projeção com renda e gasto variáveis médios e recorrentes normalizadas (o v3 inflava o saldo).
6. Relatórios: troca de período recarrega na hora, também no mobile.
7. Importar: linhas reconhecidas já marcadas, duplicatas desmarcadas.
8. Transações: totais do rodapé sobre o mês inteiro, não sobre a página.
