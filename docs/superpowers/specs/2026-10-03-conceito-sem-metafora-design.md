# SyncLife sem metáfora: Meu dia · Áreas · Sy

**Data:** 2026-10-03
**Status:** aprovado em conversa, aguardando revisão do texto
**Branch alvo:** `poc/ds-v5`
**Origem:** o usuário aprovou o visual, as cores, as fontes e a estrutura do DS v5, mas rejeitou o tema de
jornal (edição, folha, manchete, colofão, "a IA é o redator"). Pediu um produto **sem metáfora**, em que a
pessoa se reconheça, organize o dia, os objetivos e a vida, e tenha um assessor que facilita com insights,
responde dúvidas e orienta olhando todos os aspectos. Pediu também análise imparcial de uma proposta do
Codex em três camadas e inspiração no app Meu Assessor.

Esta spec **não redesenha nada**: muda o conceito, as palavras visíveis, o critério do que a tela inicial
mostra e antecipa uma fatia do N3. Layout, tokens, tipografia, motion e a bancada aprovada ficam intactos.

---

## 1. Problema

1. O DS §1 define cada tela como "publicação editorial" e a IA como "redator". Isso briga com o produto em
   quatro pontos: jornal fala dos outros (SyncLife fala de você); jornal é mão única (SyncLife tem check-in
   e conversa); jornal sai em edições (SyncLife é contínuo, e o ticker diz "ao vivo" sob um "Edição nº");
   jornal tem autor (a byline já foi retirada da bancada em 2026-08-03).
2. Três metáforas convivem: jornal nas telas, bússola na marca, estúdio no nome do DS e na bancada. A
   marca aponta para um lado e as telas para outro.
3. A frente de **conteúdo** do Diário (o que Sy escolhe mostrar e por quê) estava aberta desde 2026-08-03,
   sem critério.
4. A disciplina "toda tela entrega o pacote de contexto dela pro Sy" (2026-08-02) não tinha definição do
   que é esse pacote, área por área.

Medição nos protótipos aprovados (2026-10-03): 115 "folha", 82 "edição", 45 "diário", 18 "manchete",
2 "byline", 1 "jornal". No DS: 14 "diário", 6 "manchete", 4 "edição", 1 "matéria", 1 "imprensa".
O tema mora nas palavras e no §1, não no desenho.

## 2. Decisões tomadas com o usuário (2026-10-03)

| Decisão | O que ficou |
|---|---|
| **Sem metáfora** | O produto não é jornal, não é bordo, não é estúdio. É o que ele faz: organizar o dia, as áreas e a vida, com Sy ligando as partes. Nenhuma palavra visível pode exigir que a pessoa entenda uma analogia |
| **Três camadas** | **Meu dia** (o que merece atenção agora) · **Áreas** (onde você organiza e aprofunda) · **Sy** (quem conecta as áreas e age com você). É o enquadramento do Codex, adotado com as correções do §5 |
| **Nome da tela inicial** | **Meu dia**. Rota `/dashboard` intacta (regra do programa). "Diário" sai de toda copy visível |
| **Fatia do N3 entra na Onda 03** | Uma única intenção composta, de ponta a ponta, prototipada e implementada: "quero começar um curso de inglês". O restante do N3 continua no sprint próprio pós-ondas |
| **Grafia de Sy, contradição resolvida** | Sem artigo e sem contração: "Sy", "com Sy", "para Sy", "Fale com Sy" ✅ · "o Sy", "ao Sy", "do Sy", "pergunte ao Sy" ❌. O handoff marcava "pergunte ao Sy" como correto; não é mais |
| **"Assessor" é palavra interna** | Descreve o papel de Sy nesta spec e nas conversas de produto. **Não** vira substantivo de marketing nem rótulo na UI: "Meu Assessor" já ocupa a palavra no mercado brasileiro (250 mil usuários, influenciadores). Na UI Sy é só Sy |
| **Uma identidade, não personas** | Mantida a decisão de 2026-08-02. O Meu Assessor usa seis personas; o SyncLife não copia isso |
| **Bancada e leis do cockpit continuam** | As 6 leis, os dois estados, lâmina × recorte, check-in na conversa e `/coach` como arquivo da conversa seguem aprovados. Esta spec só troca o conteúdo e as palavras |

## 3. O que o Meu Assessor ensina (benchmark, 2026-10-03)

Secretária executiva por WhatsApp: texto, áudio ou foto de boleto viram registro, lembrete, cobrança ou
compromisso. Seis personas, Open Finance com 114 bancos, Google Agenda, briefing matinal, nota fiscal e
link de cobrança, R$ 29,90/mês no anual, público de autônomos e empreendedores.

**Entra como inspiração:**
- A conversa como porta de **captura** ("me lembre de pagar o condomínio amanhã às 9h"). No SyncLife a
  porta já existe: a linha de comando de Sy (lei 2, voz e texto no mesmo lugar).
- Perguntas em linguagem natural sobre o próprio dado ("quanto gastei com alimentação?"). É o N2 com
  `buildModuleContext`.
- Briefing matinal. É o N1, que já está no ar.
- Open Finance como alavanca futura de Finanças (infra pós-MVP, fora desta spec).

**Fica de fora:** personas, funções de negócio (NF, cobrança, ata de reunião), WhatsApp como produto.

**O que ele não faz e é a tese do SyncLife:** conectar áreas. Lá cada módulo vive em paralelo; não há score,
não há "esse curso mexe no seu orçamento e na sua meta". A camada 3 desta spec é exatamente esse lugar.

## 4. Camada 1 · Meu dia

**O que é:** a tela em que Sy mostra o que merece atenção agora. **O que não é:** um resumo das oito áreas
nem uma edição com seções fixas.

### 4.1 Critério de seleção (resolve a frente de conteúdo)

A cada abertura do dia, Sy monta no máximo **4 tempos** (a apresentação aprovada já é "N × fala curta + um
objeto visual"). Cada tempo nasce de um **gatilho** com prioridade fixa; o conteúdo muda conforme a situação,
e por isso um dia é dinheiro, outro é agenda, outro é a viagem que chega.

| Prioridade | Gatilho | Exemplo de tempo | Área que fornece |
|---|---|---|---|
| 1 | **Decisão pendente** que Sy propôs e você ainda não respondeu (inclui intenções em aberto, §6) | "Ontem você deixou a proposta do curso em aberto. Quer decidir hoje?" | qualquer |
| 2 | **Risco em janela curta** (≤ 7 dias): orçamento encostando no teto, conta vencendo sem saldo, meta com prazo, conflito de agenda | "O lazer encostou no teto. Restam R$ 10 até quinta" | Finanças, Tempo, Futuro |
| 3 | **Compromisso de hoje** com preparo (viagem, consulta, entrevista, prova) | "Amanhã é a entrevista. A vaga que você cadastrou pede inglês" | Tempo, Carreira, Experiências, Corpo |
| 4 | **Mudança desde o último acesso** nas áreas ativas (score subiu ou caiu, hábito quebrou, aporte caiu) | "Nas suas quatro áreas, três subiram. Só Experiências ficou parada" | todas as ativas |
| 5 | **Próxima ação** única, se nada acima preencheu | "Segure o lazer até sexta e o mês fecha redondo" | a área do tempo anterior |

Regras: só áreas em `profiles.active_modules` disparam gatilhos 2 a 5; prioridade 1 vale para qualquer
área. Um tempo por gatilho; se dois gatilhos da mesma prioridade competem, vence o de maior valor
monetário ou menor prazo. Sem nenhum gatilho, Sy diz isso em uma frase e a edição assenta direto ("Nada
pede você hoje. Como foi o dia?"). Sy nunca cobra check-in perdido (regra de 2026-07-31, inviolável).

### 4.2 Estrutura (não muda, só renomeia)

A ordem vertical aprovada da bancada e do Diário fica. O que cada bloco passa a ser, em palavras do produto:

1. **Cabeçalho:** eyebrow com a data por extenso (`Sexta, 3 de outubro`), saudação, selo do **Life Sync
   Score**. Nenhum número de edição.
2. **Sy apresentando** (estado 1) ou **Sy assentado** com a conversa (estado 2). O briefing escrito que
   fica depois da apresentação é o registro do que Sy falou, com hora e fontes (`Atualizado às 7h12 ·
   fontes: orçamento Lazer, 34 transações, agenda da semana`). E-07 continua valendo: prosa com fontes.
3. **Lâminas e recortes:** nomes mantidos. São de oficina (impressão), não de jornal.
4. **Check-in na conversa** (decisão de 2026-08-03).
5. **Hoje:** linha do dia (eventos e contas).
6. **Números do mês**, **Suas áreas**, **Atenção e metas**: iguais.
7. **Rodapé:** última sincronização, streak, badges. A palavra "colofão" sai.

**Sua semana** (antes "Edição da semana"): continua sendo um momento de apresentação dentro de Meu dia, nunca
tela separada (lei 6). Eyebrow `Sua semana · 29 set a 5 out`. O fechamento continua persistindo em
`weekly_reviews` e contando para o streak.

**Life Score** (`/dashboard/score`): sem mudança de conceito; "A anatomia do número" fica. Protótipo
continua esperando aceite.

## 5. Camada 2 · Áreas

As oito áreas continuam sendo a estrutura, com a numeração canônica (LEI §5.2). Conquistas e Configurações
não são áreas e não entram na tabela. A coluna "o que acrescenta às decisões" é a **definição do pacote de
contexto** que cada área entrega a Sy: é o que `buildModuleContext` precisa expor por área, e é o que o
protótipo de cada tela, da Onda 04 em diante, precisa listar numa seção "O que Sy lê aqui".

| Área | O que acrescenta às decisões | Fontes reais (tabelas) |
|---|---|---|
| 01 Finanças | Margem do mês, orçamentos por categoria, contas a vencer, recorrentes | `transactions`, `budgets`, `recurring_transactions`, `user_accounts` |
| 02 Futuro | Objetivos e metas de longo prazo, prazos, aportes planejados | `goals`, `goal_contributions`, `objectives`, `objective_goals` |
| 03 Tempo | Horários realmente livres, conflitos, carga da semana, foco | `agenda_events`, `planning_events`, `focus_sessions` |
| 04 Corpo | Rotinas, consultas, peso, água, passos, o que a pessoa registrou | `health_profiles`, `medical_appointments`, `weight_entries`, `daily_steps`, `daily_water_intake`, `meals` |
| 05 Mente | Trilhas de aprendizado, horas de estudo, streaks, espaço para descanso | `study_tracks`, `study_track_steps`, `study_streaks`, `focus_sessions_mente`, `library_resources` |
| 06 Patrimônio | O que está **acumulado**: carteira, proventos, evolução, simulações. (Não "planos financeiros", que é Finanças/Futuro) | `portfolio_assets`, `portfolio_transactions`, `portfolio_dividends`, `fi_simulations` |
| 07 Carreira | Trabalho atual, habilidades, roadmap, oportunidades cadastradas | `career_profiles`, `skills`, `career_roadmaps`, `roadmap_steps`, `career_history` |
| 08 Experiências | Viagens, orçamento de viagem, lista de desejos, memórias | `trips`, `trip_budget_items`, `trip_itinerary_items`, `bucket_list_items` |

Correção à tabela do Codex: Patrimônio e Finanças estavam sobrepostos. Finanças é o que **passa pelo mês**;
Patrimônio é o que **fica**.

## 6. Camada 3 · Sy

### 6.1 Papel

Sy é a presença que lê as oito áreas e devolve três coisas: **o que importa** (N1, narrar), **resposta a
dúvida com fonte** (N2, responder) e **ação combinada em várias áreas** (N3, executar), sempre com a lei 1
(caminho curto oferecido, caminho longo nunca bloqueado). Ator em Meu dia, copiloto nas outras telas.

Estado da escada depois desta spec:

| Nível | Estado | Onde |
|---|---|---|
| N1 Narrar | No ar (`/api/ai/diario-brief`, cache diário em `coach_briefs`) | passa a seguir o critério do §4.1 |
| N2 Responder | Thread stateless; persistência e fontes citadas pendentes | Onda 03 (já previsto) |
| N3 Executar | Não existe | **Onda 03: uma intenção** (§6.2). Restante: sprint próprio |
| N4 Provocar | Parcial (whisper, cross, digest semanal) | pós-ondas |

### 6.2 A fatia do N3: uma intenção, cinco áreas

**Intenção escolhida:** "Quero começar um curso de inglês." Única da whitelist nesta onda. Qualquer outra
intenção composta recebe resposta N2 normal, sem promessa de ação.

**Por que essa:** toca cinco áreas com dados que já existem no banco (`study_tracks` já tem `cost` e
`linked_skill_id`; `skills` e `study_tracks` já se ligam por `onSkillLinkedToTrack`), e é o exemplo que
o usuário validou.

**Fluxo, na bancada aprovada:**

1. **Porta.** A pessoa digita ou fala na linha de comando de Sy (Meu dia) ou na camada (qualquer tela).
2. **Leitura.** Sy monta o contexto das cinco áreas: horários livres da semana (Tempo), margem do mês e
   categoria Educação (Finanças), objetivo compatível (Futuro), habilidade ou oportunidade com "inglês"
   (Carreira), trilhas existentes (Mente). Estado `pensando`.
3. **Proposta.** Uma lâmina `Proposta · curso de inglês` com **2 ou 3 caminhos** (começar agora · carga
   menor · esperar X terminar), cada um com o impacto por área em uma linha (`Tempo: 2 noites, ter e qui
   20h · Finanças: R$ 180/mês, margem cai para R$ 310 · Futuro: entra na meta "Fluência até 2027"`).
   Sy fala a conclusão; a lâmina mostra as cifras (regra de 2026-08-02). Se faltar um dado essencial
   (custo ou carga horária), Sy pergunta **uma** coisa antes de propor; o resto ele assume e deixa
   editável.
4. **Escolha.** A pessoa escolhe um caminho e marca quais registros quer criar (cada registro é uma
   linha com toggle, valor editável). Essa escolha **é** a confirmação: criar registros é reversível,
   então Sy faz e avisa, com desfazer à mão (decisão de 2026-08-02). Nada aqui pede "licença" extra.
5. **Feito.** Lâmina `Feito · 4 registros em 4 áreas`, cada linha com link real para o registro (lei 5) e
   um único **Desfazer** que remove todos. A lâmina vira recorte permanente (veio de pedido seu).
6. **Dia seguinte.** Se a proposta ficou em aberto, vira gatilho de prioridade 1 em Meu dia (§4.1).

**Registros possíveis (whitelist por tabela, decidida no servidor, nunca pelo modelo):**

| Área | Tabela | Campos preenchidos |
|---|---|---|
| Mente | `study_tracks` | `name`, `category='idiomas'`, `cost`, `target_date`, `linked_skill_id` |
| Tempo | `agenda_events` | N eventos recorrentes semanais nos horários escolhidos |
| Finanças | `recurring_transactions` | `type='despesa'`, `amount`, `frequency='monthly'`, categoria Educação |
| Carreira | `skills` (cria se não existe) | `name='Inglês'`, vínculo com a trilha |
| Futuro | `goals` | vincula a meta existente ou cria `name`, `target_date`, `category='aprendizado'` |

**Backend (padrão "planejar, depois aplicar", sem loop de tool calling):**

- `POST /api/ai/intencao` (Zod no body: `texto`, `moduleId`): classifica; se for a intenção da whitelist,
  chama Gemini Flash com `generateObject` e schema `Proposta { caminhos[]: { titulo, resumo, registros[]:
  { area, tabela, rotulo, payload } } }`, com o contexto das cinco áreas. Payloads validados por um
  Zod schema **por tabela**; o que não bate é descartado, não corrigido. 1 chamada por intenção.
- `POST /api/intencao/aplicar` (Zod: `propostaId`, `caminho`, `registros[]` selecionados): insere tudo
  numa função SQL `aplicar_intencao` (atomicidade), grava uma linha em `intencoes` (`user_id`, `texto`,
  `proposta` JSONB, `aplicado` JSONB com os ids criados, `status`) e devolve os ids e as URLs.
- `POST /api/intencao/desfazer` (Zod: `intencaoId`): apaga os registros criados **se não foram
  editados depois** (`updated_at = created_at`); se algum foi, apaga os demais e avisa quais ficaram.
- Migration na próxima numeração livre (a `028` está reservada para `weekly_reviews` no lote 2).
  Tabela `intencoes` com RLS por usuário.
- Rate limit: `checkRateLimit` existente. Custo free: 1 req Gemini por intenção.
- Kill-switch: `forceFallback` existente desliga a proposta e Sy responde em N2.

### 6.3 `/coach`, o arquivo da conversa

Sem mudança de decisão (2026-08-03): histórico contínuo com divisores de data, busca, e os recortes que
cada conversa deixou. As intenções aparecem como entradas com o estado (`aplicada`, `desfeita`, `em
aberto`) e o Desfazer continua acessível ali. Protótipo desktop + mobile ainda não existem: entram na
Onda 03.

## 7. Vocabulário

### 7.1 O que muda na copy visível

| Hoje | Passa a ser | Onde |
|---|---|---|
| Diário | **Meu dia** | modbar, título, eyebrows, camada, DS |
| Edição nº 208 · seu diário | `Sexta, 3 de outubro` | cabeçalho de Meu dia |
| A folha / o briefing do coach | o texto de Sy, sem título próprio; eyebrow `Sy · hoje` | banda clara de Meu dia e das telas de módulo |
| Manchete | primeira frase de Sy | cabeçalho de Meu dia e das telas de módulo |
| Escrito às 7h12, com base em… | `Atualizado às 7h12 · fontes: …` | rodapé do texto de Sy |
| Selo de edição | **selo do score** (o objeto fica; a palavra "edição" sai) | DS §4.5 |
| Edição da semana nº 30 | **Sua semana** · `29 set a 5 out` | apresentação semanal, `weekly_reviews` |
| Colofão | **Rodapé** (`Última sincronização às…`) | todas as telas do app |
| Coach (na UI) | **Sy** | gatilho da camada (`Fale com Sy`), eyebrows (`Sy · lendo: Finanças`) |
| Pergunte ao coach | **Fale com Sy** | gatilho no bar |
| Recomendações de hoje | **O que fazer hoje** | coluna de recs |
| Saúde do mês (selo de módulo) | mantém | telas de módulo |

### 7.2 O que fica

Lâmina, recorte, ticker ("ao vivo"), caligrafia de Sy, selo, números 01 a 08, "Suas áreas", "Hoje",
"Números do mês", "Atenção", "Metas", check-in, Life Sync Score, Conquistas.

### 7.3 Nomes internos

Classes CSS (`.folha`, `.mast`, `.colofao`, `.selo`), nomes de arquivo (`diario.html`, `diario-bancada*`,
`bancada.roteiro.js`, `use-diario`, `DiarioV5`, `/api/ai/diario-brief`) e a tabela `coach_briefs`
**não são renomeados agora**. Renomear é tarefa da Onda 14 (varredura), para não gerar diff estrutural
numa mudança de copy. A regra: nenhuma string visível ao usuário pode conter as palavras da coluna "Hoje"
do §7.1.

## 8. Impacto nos documentos e no programa

### 8.1 `DESIGN-SYSTEM-v5.md`

- **§1 Conceito:** reescrever. Sai "publicação editorial", "a IA é o redator", "matéria de capa". Entra:
  três camadas (Meu dia · Áreas · Sy), e os cinco pilares passam a ser: hairline em vez de card; Sy é
  presença, não widget; um número grande por dobra; ritmo claro/escuro; interação com física.
- **§4.5:** "Selo de edição" vira "Selo do score".
- **§6.2:** título "Meu dia (rota /dashboard)"; incluir o critério de seleção do §4.1 desta spec; ordem
  vertical com os nomes do §7.1.
- **§6.3:** "Masthead editorial" vira "Cabeçalho"; "manchete-frase" vira "primeira frase de Sy";
  acrescentar a seção obrigatória "O que Sy lê aqui" (pacote de contexto, §5).
- **§6.4:** trocar "coach" por "Sy" na prosa; gatilho `Fale com Sy`; acrescentar a lâmina de proposta e
  o Desfazer como estados do N3.
- **§7 Inventário:** `.colofao` descrito como rodapé; `.folha` como "banda clara com o texto de Sy".
- **E-07:** "Briefing assinado (`Escrito às…`)" vira "Texto de Sy com hora e fontes (`Atualizado às…
  · fontes: …`)".
- **§11:** marcar "Veredito do Diário/finanças/coach como conjunto" como substituído por esta spec.

### 8.2 Protótipos aprovados (varredura de copy, sem mexer em layout)

`app/diario.html`, `app/diario.mobile.html`, `app/diario-bancada.html`, `app/diario-bancada.mobile.html`,
`app/bancada.roteiro.js`, `app/review-semanal*.html`, `app/life-score*.html`, `shared/app.js` (seed do
gatilho), `index.html` (hub). Landing e auth: conferir se "edição" aparece; se sim, trocar. O smoke visual
do hub é obrigatório depois (regra do programa para mudança em `shared/`).

### 8.3 Programa de ondas (handoff)

- **Onda 03 passa a ter:** bancada D+M (aprovada) · copy sem metáfora (re-aprovação só de texto) ·
  protótipo do fluxo da intenção D+M · protótipo de `/coach` arquivo D+M · implementação em `web/`:
  N1 com o critério do §4.1, N2 persistido com fontes, bancada, intenção (§6.2), `/coach`.
- **Onda 02 lote 2:** "Edição da semana" vira "Sua semana" (apresentação). Life Score sem mudança.
- **Ondas 04 a 14:** cada protótipo de tela ganha a seção "O que Sy lê aqui" (§5). Onda 14 renomeia
  nomes internos (§7.3).

### 8.4 Memória do projeto

Registrar: sem metáfora; três camadas; "Meu dia"; grafia de Sy resolvida; "assessor" é palavra interna;
fatia N3 na Onda 03.

## 9. Fora de escopo

- Outras intenções compostas (viagem, mudança de emprego, dieta): sprint do N3, com a mesma arquitetura
  planejar/aplicar e a whitelist crescendo uma tabela por vez.
- Open Finance, WhatsApp como canal, personas: não.
- Renomear classes, arquivos, hooks, rotas de API e tabelas: Onda 14.
- Tema claro/escuro selecionável, gênero da voz, duração da apresentação, pronúncia de "Sy": adiados pelo
  usuário, continuam no "Aberto agora" do handoff.
- Conteúdo definitivo das falas de Sy: o §4.1 dá o **critério**; a copy final de cada gatilho é escrita
  no protótipo da Onda 03 e aprovada lá.

## 10. Riscos

| Risco | Mitigação |
|---|---|
| A fatia N3 incha a Onda 03 | Whitelist de **uma** intenção e **cinco** tabelas; padrão planejar/aplicar sem tool calling; qualquer outra intenção cai em N2 |
| O modelo inventa payload | Zod por tabela no servidor; campo inválido descarta o registro, nunca corrige; tabelas e colunas são decididas no código |
| Desfazer apaga coisa editada | Só apaga se `updated_at = created_at`; o resto fica e Sy avisa |
| Critério do §4.1 gera dia vazio ou repetitivo | Prioridade 5 garante uma frase; prioridade 4 só dispara com mudança real desde o último acesso; QA com 5 cenários de mock (dinheiro, agenda, viagem, nada, decisão pendente) |
| "Meu dia" soa a app de tarefas | O conteúdo é de Sy, não lista de to-do; a primeira frase sempre liga duas áreas ou traz um número |
| Varredura de copy quebra identidade visual | Zero mudança de CSS; teste de identidade compara screenshot antes e depois, só texto pode diferir |
| Colisão com a marca Meu Assessor | "assessor" nunca aparece na UI nem no marketing |

## 11. Critérios de aceite

1. `grep` nos **nós de texto** (não em classes nem em nomes de arquivo) dos protótipos listados no §8.2 e das
   rotas v5 em `web/` não encontra: edição, edições, manchete, folha, colofão, jornal, byline, redação,
   redator, diário, "ao Sy", "o Sy", "do Sy", assessor.
2. DS atualizado conforme §8.1, sem contradição com os protótipos aprovados.
3. Protótipo do fluxo da intenção aprovado em desktop e mobile: proposta com 2 ou 3 caminhos, escolha de
   registros, lâmina Feito com links reais, Desfazer.
4. Em `web/`: a intenção cria os registros escolhidos nas tabelas do §6.2, cada link abre o registro, o
   Desfazer remove tudo que não foi editado, e a intenção em aberto reaparece em Meu dia no dia seguinte.
5. Cinco cenários de mock do §4.1 produzem apresentações diferentes e nenhuma delas cobra check-in.
6. Teste de identidade da copy: screenshots antes e depois diferem só em texto.
7. Handoff e memória atualizados; hub sem regressão visual.
