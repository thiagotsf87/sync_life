# 13 — Status de Protótipos e Atividades Faltantes

> **Como usar este documento:**
> Conforme cada atividade for concluída, substitua `[ ]` por `[x]` e atualize o status
> da tela de `❌ Pendente` para `✅ Aprovado` ou `🔄 Em revisão`.
> Protótipos aprovados desbloqueiam o desenvolvimento em Next.js correspondente.

---

## LEGENDA DE STATUS

| Ícone | Significado |
|-------|-------------|
| ✅ Aprovado | Protótipo concluído e aprovado — pode ir para Next.js |
| 🔄 Em revisão | Protótipo existe mas aguarda feedback/ajuste |
| 🛠️ Em construção | Protótipo sendo criado agora |
| ❌ Pendente | Ainda não foi iniciado |

---

## PARTE 1 — PROTÓTIPOS EXISTENTES (MVP v2)

> Todos os 14 protótipos abaixo já existem como arquivos HTML no projeto
> e estão marcados como aprovados para início do desenvolvimento em Next.js.

---

### GRUPO A — Páginas Públicas

#### A.1 — Landing Page (`proto-landing.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-landing.html`
**Desbloqueia:** Fase 1.5 — Landing Page em Next.js

- [x] Hero section com headline + CTA "Começar grátis"
- [x] Seção de features (Finanças, Metas, Agenda)
- [x] Showcase Modo Foco vs Modo Jornada
- [x] Seção Life Sync Score
- [x] Pricing FREE vs PRO
- [x] Social proof / depoimentos (placeholders)
- [x] Footer com links legais
- [x] Responsiva mobile + desktop

---

#### A.2 — Autenticação (`proto-auth.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-auth.html`
**Desbloqueia:** Fase 1.4 — Refatoração das telas de Auth em Next.js

- [x] Login: email + senha + "Entrar com Google"
- [x] Login: split screen desktop / single column mobile
- [x] Login: estados de loading, erro e sucesso
- [x] Cadastro: nome, email, senha, confirmar senha
- [x] Cadastro: força da senha visual
- [x] Cadastro: aceite de Termos e Política
- [x] Recuperar Senha: Step 1 — campo de email
- [x] Recuperar Senha: Step 2 — confirmação "Email enviado"
- [x] Recuperar Senha: Step 3 — nova senha + confirmação

---

#### A.3 — Onboarding (`proto-onboarding.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-onboarding.html`
**Desbloqueia:** Fase 1.2 — Onboarding em Next.js

- [x] Barra de progresso de 5 steps
- [x] Step 1: Boas-vindas + nome do usuário
- [x] Step 2: Escolha do modo (Foco vs Jornada) com explicação visual
- [x] Step 3: Renda mensal
- [x] Step 4: Categorias de despesas principais
- [x] Step 5: Resumo + CTA "Ir para o Dashboard"

---

### GRUPO B — Navegação e Estrutura

#### B.1 — Navegação (`proto-navigation-v3.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-navigation-v3.html`
**Desbloqueia:** Fase 1.1 — Refatoração da navegação em Next.js

- [x] Barra de módulos lateral (primeiro nível) — apenas ícones
- [x] Sidebar secundária por módulo — expansível/colapsável
- [x] Bottom tab bar mobile com 5 itens
- [x] Estado ativo por módulo com cor identitária
- [x] Comportamento em diferentes breakpoints

---

### GRUPO C — Módulo Finanças

#### C.1 — Dashboard Principal (`proto-dashboard.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-dashboard.html`
**Desbloqueia:** Fase 2.1 — Dashboard em Next.js

- [x] KPI cards: receitas, despesas, saldo
- [x] Life Sync Score (modo Jornada)
- [x] Gráfico de pizza por categoria
- [x] Lista de últimas transações
- [x] Card de conquistas recentes (modo Jornada)
- [x] Saudação personalizada + streak (modo Jornada)
- [x] Toggle Foco/Jornada

---

#### C.2 — Dashboard Financeiro (`proto-financas-dashboard.html`)
**Status:** ✅ Aprovado — 22/02/2026 · 🔧 Correção de paleta — 23/02/2026
**Arquivo:** `proto-financas-dashboard.html`
**Desbloqueia:** Fase 2.1 — Módulo Finanças completo

- [x] Visão consolidada do módulo financeiro
- [x] Cards de resumo do mês
- [x] Gráficos integrados
- [x] Acesso rápido às sub-seções de finanças
- [x] **Correção de paleta (23/02):** tokens alinhados com `proto-navigation-v3.html` — gradiente Life Sync Score corrigido de `esmeralda→amarelo` para `esmeralda→azul elétrico`, `--sb` 220→228px, `--hh` 50→54px, `--bg` light corrigido, overrides completos para `light` e `light.jornada` adicionados (module-bar, sidebar, top-hdr, nav-item)

---

#### C.3 — Transações (`proto-transacoes.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-transacoes.html`
**Desbloqueia:** Fase 2.1 — Transações em Next.js (refatoração)

- [x] Lista de transações com paginação
- [x] Filtros: mês, tipo (receita/despesa), categoria
- [x] Busca por descrição
- [x] Modal de nova transação
- [x] Modal de edição
- [x] Confirmação de exclusão
- [x] Empty state

---

#### C.4 — Orçamentos (`proto-orcamentos.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-orcamentos.html`
**Desbloqueia:** Fase 2.3 — Sistema de Orçamentos em Next.js

- [x] Grid de envelopes por categoria
- [x] Barra de progresso com 4 estados de cor (verde → vermelho)
- [x] Card "Não alocado" quando total < renda
- [x] Distribuição sugerida 50/30/20
- [x] Modal de criação/edição de envelope
- [x] Histórico por mês (dropdown)

---

#### C.5 — Transações Recorrentes (`proto-recorrentes.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-recorrentes.html`
**Desbloqueia:** Fase 2.5 — Recorrentes em Next.js

- [x] Lista de recorrentes ativas
- [x] Card por recorrente: título, valor, próxima ocorrência, status
- [x] Toggle de pausa/ativar
- [x] Modal de criação: frequência, data início, data fim
- [x] Confirmação de exclusão (futuras ou todas)
- [x] Indicador de limite FREE (5 recorrentes)

---

#### C.6 — Planejamento Futuro (`proto-planejamento-v2.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-planejamento-v2.html`
**Desbloqueia:** Fase 2.2 — Planejamento em Next.js

- [x] Timeline de fluxo de caixa futuro
- [x] Projeções: pessimista, realista, otimista
- [x] Bandas de categorias na timeline (até 3 com overflow)
- [x] Atualização de valores ao trocar cenário
- [x] Saldo projetado por período

---

### GRUPO D — Módulo Metas

#### D.1 — Lista de Metas (`proto-metas.html`)
**Status:** ✅ Aprovado
**Arquivo:** `proto-metas.html`
**Desbloqueia:** Fase 3.1 — Lista de Metas em Next.js

- [x] Grid/lista de metas ativas com status visual
- [x] Card: % progresso, ritmo atual vs necessário, prazo
- [x] Badge de status: no caminho / em risco / concluída
- [x] Ordenação: em risco primeiro
- [x] Seção "Concluídas" colapsada
- [x] Botão "+ Nova Meta"

---

### GRUPO E — Módulo Agenda

#### E.1 — Agenda Principal (`proto-agenda.html`)
**Status:** ✅ Aprovado — 22/02/2026
**Arquivo:** `proto-agenda.html`
**Desbloqueia:** Fase 4.1 — Agenda em Next.js

- [x] Visão semanal: colunas por dia com blocos de tempo
- [x] Visão mensal: grid de calendário
- [x] Toggle semanal/mensal
- [x] Eventos com cores por tipo (pessoal, trabalho, financeiro, meta, saúde)
- [x] Botão "+ Novo evento" fixo

---

#### E.2 — Agenda CRUD (`proto-agenda-crud-v2.html`)
**Status:** ✅ Aprovado — 22/02/2026
**Arquivo:** `proto-agenda-crud-v2.html`
**Desbloqueia:** Fase 4.1 — CRUD de eventos em Next.js

- [x] Modal/formulário de criação de evento
- [x] Campos: título, data/hora, tipo, duração
- [x] Vínculo com meta (opcional)
- [x] Lembrete configurável
- [x] Edição de evento existente
- [x] Confirmação de exclusão

---

### GRUPO F — Configurações

#### F.1 — Configurações (`proto-configuracoes.html`)
**Status:** ✅ Aprovado — 22/02/2026
**Arquivo:** `proto-configuracoes.html`
**Desbloqueia:** Fase 1.3 + Fase 5 — Configurações em Next.js

- [x] Perfil do usuário (nome, email, avatar)
- [x] Toggle Modo Foco/Jornada
- [x] Preferência de tema (claro/escuro/automático)
- [x] Gerenciador de categorias
- [x] Configurações de notificações
- [x] Preferências de moeda e idioma
- [x] Plano atual (FREE/PRO) + botão de upgrade
- [x] Opção de excluir conta

---

---

## PARTE 2 — PROTÓTIPOS COMPLEMENTARES (MVP v2) — ✅ TODOS APROVADOS

> Os 4 protótipos abaixo completaram o MVP v2 em 23/02/2026.
> Todas as telas correspondentes estão liberadas para desenvolvimento em Next.js.

---

### PRIORIDADE 1 — Calendário Financeiro

#### G.1 — Calendário Financeiro (`proto-calendario-financeiro.html`)
**Status:** ✅ Aprovado — 23/02/2026
**Prioridade:** 🔴 Alta — único módulo de Finanças sem protótipo
**Desbloqueia:** Fase 2.4 — Calendário Financeiro em Next.js

> **O que é:** Uma visão temporal do dinheiro no mês. Diferente da lista de transações
> (passado) e do Planejamento (futuro puro), o calendário mistura os dois: dias passados
> com transações reais já registradas, dias futuros com recorrentes previstas. O usuário
> consegue enxergar o mês inteiro de uma vez e entender quando o saldo sobe e cai.
> **Diferencial competitivo:** Nubank, Mobills e Organizze não têm esse visual integrado.

**Atividades para criar este protótipo:**

- [x] **Layout base do calendário**
  - Grid mensal com 7 colunas (dom–sab) e linhas por semana
  - Cabeçalho com mês/ano e setas de navegação (mês anterior / próximo)
  - Dias do mês anterior/próximo aparecem em cinza desbotado
  - Dia atual destacado com borda ou fundo suave em Esmeralda

- [x] **Indicadores visuais por dia**
  - Bolinha verde: dia com receita registrada
  - Bolinha vermelha: dia com despesa registrada
  - Bolinha azul: transação recorrente prevista (ainda não ocorreu)
  - Bolinha roxa: evento vinculado ao Planejamento Futuro
  - Múltiplas bolinhas quando há mais de um tipo no mesmo dia
  - Valor líquido do dia embaixo da data (ex: "+R$ 200" ou "-R$ 350")

- [x] **Linha de saldo semanal**
  - Abaixo de cada linha de semana, mostrar o saldo acumulado até o final daquela semana
  - Cor verde se saldo positivo, vermelho se negativo

- [x] **Painel lateral ao clicar num dia**
  - Abre um drawer/painel lateral (não modal) para não perder o contexto do calendário
  - Lista todas as transações daquele dia separadas por receitas e despesas
  - Total do dia no topo do painel
  - Botão "Adicionar transação neste dia" dentro do painel
  - Dias futuros mostram apenas recorrentes previstas com label "Previsto"

- [x] **Interação de adicionar transação pelo calendário**
  - Clicar em qualquer dia (passado ou futuro) permite adicionar transação
  - A data já vem preenchida automaticamente com o dia clicado
  - Para dias futuros, exibe aviso: "Esta transação entrará no Planejamento como prevista"

- [x] **Legenda de cores**
  - Barra de legenda no topo ou rodapé do calendário
  - Verde = Receita, Vermelho = Despesa, Azul = Recorrente prevista, Roxo = Planejado

- [x] **Variante Foco**
  - Grid limpo, sem animações, painel lateral com lista densa
  - Sem elementos decorativos

- [x] **Variante Jornada**
  - Animação suave ao abrir o painel lateral
  - Dias com saldo positivo têm leve fundo esverdeado
  - Card motivacional no topo: "Seu saldo projetado no fim do mês: R$ X"

- [x] **Responsividade mobile**
  - Em telas pequenas, o calendário ocupa a tela inteira
  - Painel lateral vira bottom sheet no mobile
  - Bolinhas menores para caber no grid

---

### PRIORIDADE 2 — Relatórios e Exportação

#### H.1 — Relatórios (`proto-relatorios.html`)
**Status:** ✅ Aprovado — 23/02/2026
**Prioridade:** 🔴 Alta — finaliza o módulo Finanças para MVP v2
**Desbloqueia:** Fase 2.6 — Relatórios e Exportação em Next.js

> **O que é:** Tela onde o usuário analisa seu histórico financeiro de forma consolidada.
> Escolhe um período e recebe gráficos, resumo textual e opção de exportar em PDF ou Excel.
> **Diferencial:** No modo Jornada, o resumo é gerado como texto narrativo pela IA
> ("Em fevereiro você gastou 20% a mais em alimentação — veja o que mudou").

**Atividades para criar este protótipo:**

- [x] **Seletor de período**
  - Dropdown com opções: Mês atual, Mês anterior, Último trimestre, Último semestre, Ano atual, Período personalizado
  - Período personalizado abre date range picker com data início e data fim
  - Botão "Gerar relatório" após selecionar

- [x] **Resumo executivo (topo da tela)**
  - 4 cards em linha: Total Receitas, Total Despesas, Saldo do Período, Maior Categoria de Gasto
  - Comparativo vs período anterior: "↑ +12% vs mês anterior" em verde/vermelho
  - No modo Jornada: parágrafo narrativo no lugar dos cards frios (ou abaixo deles)

- [x] **Gráfico de barras comparativo — últimos 6 meses**
  - Barras side-by-side: receitas (verde) vs despesas (vermelho) por mês
  - Eixo X: meses, Eixo Y: valores em R$
  - Tooltip ao hover mostrando valores exatos
  - Linha de meta de orçamento sobreposta (opcional, modo PRO)

- [x] **Gráfico de pizza — gastos por categoria**
  - Mesmo componente já existente no Dashboard (reutilizar)
  - Legenda lateral com percentual e valor absoluto por categoria
  - Clique numa fatia filtra a tabela de transações abaixo

- [x] **Gráfico de linha — evolução do saldo**
  - Linha contínua mostrando como o saldo variou dia a dia no período
  - Área abaixo da linha com cor suave (verde se saldo positivo, vermelho se negativo)
  - Marcadores nos dias com maior variação

- [x] **Tabela de transações detalhada**
  - Lista paginada de todas as transações do período
  - Colunas: Data, Descrição, Categoria, Tipo, Valor
  - Filtro rápido por categoria (clicando na pizza ou dropdown)
  - Ordenação por data, valor ou categoria

- [x] **Botões de exportação**
  - Botão "Exportar PDF" — abre preview antes de baixar
  - Botão "Exportar Excel" — baixa direto
  - Botão "Exportar CSV" — baixa direto
  - No plano FREE: apenas mês atual. Outros períodos mostram lock + "Upgrade para PRO"

- [x] **Preview do PDF** (modal ou drawer)
  - Mostra como vai ficar o PDF antes de exportar
  - Inclui: logo SyncLife, nome do usuário, período, todos os gráficos e tabela
  - Botão "Confirmar e baixar"

- [x] **Variante Foco**
  - Tela densa com todos os dados visíveis sem rolagem excessiva
  - Sem resumo narrativo da IA

- [x] **Variante Jornada**
  - Resumo narrativo em destaque ("Você evoluiu em X, mas pode melhorar em Y")
  - Animação de entrada dos gráficos
  - Badge "Melhor mês do ano 🏆" quando aplicável

- [x] **Responsividade mobile**
  - Gráficos empilhados verticalmente
  - Tabela com scroll horizontal ou cards por transação

---

### PRIORIDADE 3 — Módulo Metas (Complementares)

#### I.1 — Nova Meta — Wizard (`proto-meta-nova.html`)
**Status:** ✅ Aprovado — 23/02/2026
**Prioridade:** 🟡 Média — dependência da Fase 3 em Next.js
**Desbloqueia:** Fase 3.2 — Wizard de criação de meta em Next.js

> **O que é:** Um fluxo passo a passo para criar uma meta. Em vez de um formulário único
> e intimidador, o usuário responde perguntas simples uma de cada vez. O último step já
> mostra uma projeção: "Se você guardar R$ X por mês, atinge sua meta em [mês/ano]".
> Isso torna a criação de meta um momento motivante, não burocrático.

**Atividades para criar este protótipo:**

- [x] **Estrutura do wizard**
  - Barra de progresso com 4 steps visíveis no topo
  - Botão "Voltar" e "Continuar" em cada step
  - Animação de transição entre steps (slide da direita para a esquerda)
  - Botão "×" para sair sem salvar (com confirmação)

- [x] **Step 1 — Tipo da meta**
  - Cards visuais para cada tipo: 💰 Financeira, 🏃 Pessoal, 💼 Profissional, ❤️ Saúde, 🎓 Educação
  - Um card por vez, seleção visual com borda destacada
  - Texto explicativo abaixo do tipo selecionado ("Metas financeiras se conectam ao seu orçamento")
  - Somente um tipo selecionável por vez

- [x] **Step 2 — Detalhes da meta**
  - Campo: Título da meta (ex: "Viagem para Europa", "Reserva de Emergência")
  - Campo: Valor alvo (obrigatório para metas financeiras, opcional para outros tipos)
  - Campo: Prazo — date picker com seleção de mês/ano (não precisa de dia exato)
  - Seletor de ícone: grid com ~20 emojis/ícones pré-definidos por tipo
  - Seletor de cor: paleta com 8 cores para o card da meta
  - Preview do card da meta atualizado em tempo real enquanto preenche

- [x] **Step 3 — Vínculo financeiro (apenas se tipo = Financeira)**
  - Campo: Valor mensal que pretende poupar (com sugestão automática: valor_alvo / meses_até_prazo)
  - Seletor de envelope: "Vincular a um orçamento" — dropdown com envelopes existentes
  - Opção: "Criar novo envelope exclusivo para esta meta"
  - Card informativo: "Ao vincular, toda reserva neste envelope conta como progresso"
  - Se tipo ≠ Financeira: este step é pulado automaticamente

- [x] **Step 4 — Confirmação e projeção**
  - Resumo visual da meta criada (card grande com ícone, título, prazo, valor)
  - Projeção em destaque: "Se você guardar R$ X/mês, atinge sua meta em [data]"
  - Alternativa: "Para atingir até [prazo], você precisa guardar R$ X/mês"
  - Botão principal: "Criar minha meta 🚀"
  - Link secundário: "Ajustar detalhes" (volta para Step 2)

- [x] **Variante Foco**
  - Layout mais compacto, sem animações de transição
  - Projeção mostrada como dado simples: "Prazo atingível: Sim / Não"

- [x] **Variante Jornada**
  - Animação de confete ou celebração ao concluir o Step 4
  - Frases motivacionais entre os steps ("Ótima escolha! Metas claras são metas atingidas")
  - Preenchimento do ícone com animação de entrada

- [x] **Responsividade mobile**
  - Steps ocupam tela inteira no mobile
  - Botões fixos no rodapé da tela

---

#### I.2 — Detalhe da Meta (`proto-meta-detalhe.html`)
**Status:** ✅ Aprovado — 23/02/2026
**Prioridade:** 🟡 Média — dependência da Fase 3 em Next.js
**Desbloqueia:** Fase 3.2 — Detalhe de meta em Next.js

> **O que é:** A tela de cada meta individual. O usuário acessa aqui para ver o progresso
> real, registrar um novo aporte/avanço, e entender exatamente o que precisa fazer para
> chegar na meta dentro do prazo. A projeção dinâmica é o coração desta tela — ela
> recalcula em tempo real baseada no ritmo dos aportes realizados até agora.

**Atividades para criar este protótipo:**

- [x] **Cabeçalho da meta**
  - Ícone/emoji grande da meta com cor de fundo personalizada
  - Título da meta em destaque
  - Badge de status com cor: 🟢 No caminho / 🟡 Em risco / ✅ Concluída / ⏸️ Pausada
  - Prazo original e dias restantes ("Faltam 47 dias")
  - Botão de menu (⋯) com opções: Editar, Pausar, Arquivar, Excluir

- [x] **Barra de progresso principal**
  - Barra larga e proeminente ocupando largura total
  - Porcentagem em texto grande ao lado da barra (ex: "67%")
  - Abaixo da barra: "R$ 6.700 de R$ 10.000" ou "18 de 30 sessões"
  - Animação de preenchimento ao entrar na tela

- [x] **Bloco de projeção dinâmica**
  - Frase principal: "No ritmo atual, você atinge esta meta em [mês/ano]"
  - Se antes do prazo: texto em verde, ícone ✅
  - Se depois do prazo: texto em âmbar/vermelho, ícone ⚠️
  - Detalhe: "Ritmo atual: R$ X/mês | Ritmo necessário: R$ Y/mês"
  - Botão "O que fazer para chegar no prazo?" abre modal com sugestão

- [x] **Botão principal — Registrar progresso**
  - Botão grande e proeminente (Esmeralda) fixo ou em destaque
  - Abre modal com campo de valor (para metas financeiras) ou campo de nota (para outras)
  - Para metas financeiras: campo de valor + campo de data + campo de nota (opcional)
  - Para metas não financeiras: campo descritivo + data + campo de quanto % avançou
  - Confirmação com feedback visual: "✅ Progresso registrado! +R$ 500"

- [x] **Histórico de aportes/registros**
  - Lista cronológica (mais recente no topo) de todos os registros feitos
  - Cada item: data, valor ou descrição, nota (se houver)
  - Opção de excluir um registro com confirmação
  - Paginação ou "Carregar mais" se histórico for longo

- [x] **Vínculo com Orçamento (apenas metas financeiras)**
  - Card mostrando o envelope vinculado: nome, valor alocado este mês
  - Link direto para o orçamento: "Ver envelope completo →"
  - Mensagem se não vinculado: "Vincular ao orçamento para controle automático"

- [x] **Vínculo com Agenda (todas as metas)**
  - Seção "Eventos relacionados" com próximos compromissos vinculados a esta meta
  - Botão "Agendar sessão de foco" — cria evento na Agenda pré-preenchido

- [x] **Variante Foco**
  - Dados densos, projeção numérica em destaque
  - Histórico como tabela compacta, sem ícones decorativos

- [x] **Variante Jornada**
  - Animação de progresso na barra ao carregar a tela
  - Card motivacional quando no caminho: "🔥 Você está indo muito bem!"
  - Celebração ao registrar um aporte (confete ou animação de moeda)
  - Frase personalizada baseada no prazo: "47 dias. Você consegue."

- [x] **Responsividade mobile**
  - Botão "Registrar progresso" fixo no rodapé no mobile
  - Barra de progresso e projeção dobradas em coluna

---

### PRIORIDADE 4 — Camada Transversal

#### J.1 — Conquistas (`proto-conquistas.html`)
**Status:** ✅ Aprovado — 23/02/2026
**Prioridade:** 🟢 Baixa — depende de dados de todos os módulos
**Desbloqueia:** Fase 5 — Conquistas em Next.js

> **O que é:** A galeria de badges do SyncLife. É o sistema de gamificação do modo Jornada
> tornado visível. Conquistas desbloqueadas mostram quando e como foram ganhas.
> Conquistas bloqueadas mostram o que o usuário precisa fazer para ganhar.
> Isso cria um loop de engajamento que aumenta a retenção — quem ainda não tem
> "3 meses no verde" vai se motivar a completar.

**Atividades para criar este protótipo:**

- [x] **Cabeçalho / resumo de conquistas**
  - Total de conquistas desbloqueadas vs total existente: "12 de 34 conquistas"
  - Barra de progresso geral
  - Última conquista desbloqueada em destaque (com data)
  - No modo Jornada: frase motivacional ("Você está no Top 20% dos usuários!")

- [x] **Filtro por categoria**
  - Tabs ou chips horizontais: Todas | 💰 Financeiras | 🎯 Metas | 📅 Consistência | 📆 Agenda
  - Ao filtrar, grid anima suavemente mostrando apenas as da categoria selecionada
  - Contador por categoria: "Financeiras: 4/10"

- [x] **Grid de conquistas desbloqueadas**
  - Cards em grade (3 colunas desktop, 2 mobile)
  - Card desbloqueado: ícone/emoji colorido com fundo da cor da categoria, nome, descrição curta, data de desbloqueio
  - Borda sutil em Esmeralda ou dourado para as conquistas raras/especiais
  - Hover: tooltip com descrição completa e critério

- [x] **Grid de conquistas bloqueadas**
  - Mesmos cards porém em escala de cinza + ícone de cadeado sobreposto
  - Mostrar critério de desbloqueio: "Registre transações por 7 dias seguidos"
  - Mostrar progresso quando aplicável: "4 de 7 dias concluídos"
  - Opção de ocultar as bloqueadas (toggle "Mostrar bloqueadas")

- [x] **Modal de detalhe da conquista**
  - Ao clicar em qualquer conquista (desbloqueada ou não)
  - Ícone grande, nome, descrição completa, categoria
  - Se desbloqueada: "Conquistado em [data]" com animação comemorativa
  - Se bloqueada: progresso atual + o que falta fazer para desbloquear
  - Raridade da conquista: Comum / Incomum / Rara / Lendária

- [x] **Animação de desbloqueio (modo Jornada)**
  - Quando uma conquista nova é desbloqueada (via toast no app ou ao entrar nesta tela)
  - Card "vira" de cinza para colorido com animação de flip 3D
  - Partículas ou brilho ao redor do card por 2–3 segundos
  - Som (opcional, com opção de desativar nas configurações)

- [x] **Conquistas em destaque / recentes**
  - Seção no topo "Desbloqueadas recentemente" com os últimos 3 badges
  - Cards ligeiramente maiores com efeito de brilho

- [x] **Variante Foco**
  - Lista simples sem animações: nome da conquista, critério, data, status
  - Sem grid visual, sem efeitos especiais
  - Foco nos critérios e progresso numérico

- [x] **Variante Jornada**
  - Grid visual completo com animações
  - Particles no fundo da tela ao desbloquear
  - Cards com hover effect (leve flutuação)

- [x] **Responsividade mobile**
  - Grid de 2 colunas no mobile
  - Modal vira bottom sheet
  - Animações simplificadas para não impactar performance

---

---

## PARTE 3 — PLANEJAMENTO FUTURO (MVP v3)

> Os módulos abaixo **não fazem parte do MVP v2**.
> Serão planejados, documentados e prototipados somente após o MVP v2 estar
> lançado e validado com usuários reais. Estão registrados aqui apenas para
> garantir que o design system e a arquitetura do v2 sejam pensados com eles em mente.

---

### MVP v3 — Módulo Saúde

**Objetivo:** Rastreamento de hábitos físicos e bem-estar integrado ao Life Sync Score.

Telas previstas: Dashboard de Saúde, Registro de Hábitos Diários, Histórico de Sono, Hidratação, Humor, Medicamentos, Relatório de Saúde.

**Diferencial planejado:** O score de saúde alimenta o Life Sync Score — quem dorme bem e se exercita tem score maior, criando um loop motivacional que conecta saúde e finanças.

---

### MVP v3 — Módulo Carreira

**Objetivo:** Rastreamento de crescimento profissional e metas de carreira.

Telas previstas: Dashboard de Carreira, Metas Profissionais, Habilidades em Desenvolvimento, Histórico de Conquistas Profissionais, Renda por Fonte.

**Diferencial planejado:** Conecta com Finanças (renda variável por projetos) e com Metas (meta de promoção, aumento salarial).

---

### MVP v3 — Módulo Estudos

**Objetivo:** Log de estudos, técnica Pomodoro e progresso em aprendizado.

Telas previstas: Dashboard de Estudos, Log de Sessões, Progresso por Matéria/Habilidade, Timer Pomodoro, Meta de Horas Semanais, Biblioteca de Referências.

**Diferencial planejado:** Conecta com Agenda (blocos de estudo agendados) e com Metas (meta de concluir curso em X meses).

---

---

## RESUMO EXECUTIVO

### Estado atual dos protótipos

| Grupo | Total | Aprovados | Pendentes |
|-------|-------|-----------|-----------|
| A — Páginas Públicas | 3 | ✅ 3 | 0 |
| B — Navegação | 1 | ✅ 1 | 0 |
| C — Módulo Finanças | 6 | ✅ 6 | 0 |
| D — Módulo Metas | 1 | ✅ 1 | 0 |
| E — Módulo Agenda | 2 | ✅ 2 | 0 |
| F — Configurações | 1 | ✅ 1 | 0 |
| G — Calendário Financeiro | 1 | ✅ 1 | 0 |
| H — Relatórios | 1 | ✅ 1 | 0 |
| I — Metas Complementares | 2 | ✅ 2 | 0 |
| J — Conquistas | 1 | ✅ 1 | 0 |
| **TOTAL** | **19** | **✅ 19** | **0** |

> 🎉 **MVP v2 — 100% dos protótipos aprovados.** Todas as telas estão liberadas para desenvolvimento em Next.js.

---

### Ordem recomendada de desenvolvimento Next.js

Com todos os 19 protótipos aprovados, a ordem de implementação recomendada é:

1. **Fase 1 — Infraestrutura:** Shell de navegação, Auth, Onboarding, Configurações
2. **Fase 2 — Módulo Finanças:** Dashboard Financeiro → Transações → Orçamentos → Planejamento → Recorrentes → Calendário Financeiro → Relatórios
3. **Fase 3 — Módulo Metas:** Lista de Metas → Nova Meta (Wizard) → Detalhe da Meta
4. **Fase 4 — Módulo Agenda:** Agenda Principal → CRUD de Eventos
5. **Fase 5 — Transversais:** Dashboard Home → Conquistas → Landing Page

---

### Regras de atualização deste documento

**Regra 1:** Ao concluir uma atividade, marcar `[x]` no checkbox correspondente.
**Regra 2:** Ao aprovar um protótipo completo, atualizar o Status de `❌ Pendente` para `✅ Aprovado` e adicionar a data de aprovação.
**Regra 3:** Se um protótipo for aprovado com ressalvas, marcar como `🔄 Em revisão` e adicionar uma nota com o que precisa ser ajustado antes de passar para o Next.js.
**Regra 4:** Nenhuma tela começa a ser desenvolvida em Next.js antes de ter `✅ Aprovado` neste documento.

---

*Documento criado em: 22/02/2026*
*Versão: 2.0 — MVP v2 100% aprovado (23/02/2026)*
*Todos os 19 protótipos aprovados. Desenvolvimento Next.js liberado.*
