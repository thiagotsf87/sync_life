# Coach como camada + Diário: definição de produto (v5)

**Data:** 2026-07-31
**Status:** aprovado em brainstorm, aguardando protótipos (Onda 2)
**Branch alvo:** `poc/ds-v5`
**Origem:** discussão pré-Onda 2 do programa de redesign v5 (15 ondas). O usuário questionou se o Panorama deveria "ser a casa do coach", e a conversa revelou que o produto Coach nunca foi definido: funcionalidades, acesso, interatividade e viabilidade em IA free estavam em aberto.

## 1. Problema

1. O Coach aparecia no programa como "mais um destino de navegação" (Onda 3), contradizendo a própria filosofia do DS (E-07 "IA nunca vira widget", P-01 "IA é o sistema, não um card").
2. O Panorama ("Edição do dia") era percebido como desperdício: mostra as 8 dimensões sempre, mesmo que o usuário só acompanhe algumas, e é passivo (só leitura).
3. O protótipo r6 do Coach promete três coisas que não existem no backend: fontes citadas, cartão "Ação executada" e histórico persistente. O backend real (herança v4) é um narrador + Q&A amnésico.

## 2. Decisões tomadas com o usuário (2026-07-31)

1. **Panorama vira "Diário":** o diário que o coach escreve com você. Mesma rota `/dashboard` (URLs intactas, regra do programa), nome exibido no modbar = **Diário**.
2. **Diário tem check-in do usuário:** além do briefing do coach, um registro mínimo diário (humor em 1 toque + 1 linha opcional). Não é só digest; há reciprocidade.
3. **Coach é camada global, fora do menu:** askbar/gatilho disponível em qualquer tela; a conversa abre como painel por cima da tela atual, com contexto do módulo onde o usuário está. A vista cheia (`/coach`) continua existindo, mas se chega expandindo a camada, não pelo menu. Coach sai do modbar.
4. **Escopo de implementação da Onda 3 = N1+N2 reais** (briefing cacheado + conversa persistida com fontes citadas). N3 (executar ações via tool calling) aparece no protótipo como visual, mas a implementação é um sprint dedicado pós-ondas.
5. Ressalva de tom (inviolável): **o coach nunca cobra check-in perdido.** Sem culpa de streak; o briefing segue com os dados que tem.

## 3. O produto Coach: escada de 4 capacidades

| Nível | O que faz | Estado no código hoje | Quando |
|---|---|---|---|
| **N1 Narrar** | Escreve o briefing diário assinado do Diário (e o brief de hero por módulo). Gerado 1×/dia e cacheado no banco | ~70%: `api/ai/coach-brief` (Gemini 2.5 Flash, `generateObject`, schema eyebrow/headline/stats/suggestions) já lê dados reais via `buildModuleContext`. Falta: cache em banco (hoje gera a cada chamada) | Onda 3 |
| **N2 Responder** | Conversa com contexto do módulo + histórico persistido + fontes citadas | ~50%: `api/ai/coach-thread` (Groq Llama 3.3 70B, `streamText`) injeta contexto real mas é stateless (histórico só no client, máx. 50 msgs) e sem citações | Onda 3 |
| **N3 Executar** | Tool calling com whitelist curta (criar transação, marcar hábito, criar evento/meta), sempre com confirmação. Cartão "Ação executada" vira real | Não existe | Sprint dedicado pós-ondas |
| **N4 Provocar** | Proatividade: whispers nos módulos, alertas, digest semanal | Parcial: `coach-whisper`, `coach-cross` e cron do weekly digest existem | Contínuo, pós-ondas |

Rotas herdadas da v4 que permanecem: `coach-brief`, `coach-thread`, `coach-whisper`, `coach-cross`, todas sobre `lib/coach/context.ts` (`buildModuleContext` + `MODULE_PERSONA`) e `checkRateLimit`.

## 4. Tela Diário (anatomia, evolui a "Edição do dia" aprovada na r5)

Ordem vertical:

1. **Masthead:** eyebrow `Edição nº N · seu diário`, saudação em display, selo do Life Sync Score à direita.
2. **A folha:** briefing do coach (N1), banda papel, prosa assinada (`Escrito às…, com base em…`), 3 recomendações numeradas + input de pergunta. O input é a **porta da camada de conversa** (pergunta semeada na thread).
3. **Check-in (novo):** humor em 1 toque (escala de 5) + 1 linha opcional. Registrado, colapsa para estado discreto (`Registrado às 21:14`). O briefing do dia seguinte referencia o registro. Tipografia do texto do usuário é normal (Inter): **Caveat continua exclusiva do coach (E-10)**.
4. **Hoje:** linha scroll-x de eventos/contas (como na anatomia atual).
5. **Suas áreas (personalização):** só as áreas em `profiles.active_modules` (gravado pelo onboarding v5, lido por `use-score-engine`/`use-futuro`) ganham linha rica: nome display, indicador principal, score, tendência. As demais colapsam numa linha única quieta ao final (`Outras: 05 Mente 71 · 07 Carreira 64 · …`), acessíveis pelo modbar normalmente.
6. **Atenção + Metas:** grid atual, filtrado pelas áreas ativas.
7. **Colofão.**

## 5. A camada do coach (chrome)

- **Gatilho no chrome:** pílula compacta "Pergunte ao coach" no `bar` (ao lado do ticker), presente em todas as telas autenticadas.
- **Camada:** painel sobre a tela atual (desktop: drawer/painel; mobile: bottom sheet). Abre com contexto do módulo corrente (`buildModuleContext` já é per-módulo). Estado vazio povoado pelos chips de sugestão que o `coach-brief` já gera (mata o problema de chat em branco).
- **Vista cheia `/coach`:** o grid do protótipo r6 (thread central + margem de contexto sticky + askbar fixa). Alcançada expandindo a camada. Histórico completo mora aqui.
- **Modbar:** Diário + módulos numerados 01-08 (+ Conquistas/Config conforme chrome). **Sem item Coach.**

## 6. Backend (Onda 3, tudo free tier)

- **`coach_briefs`** (nova): `user_id`, `date`, `module_id` (null = diário), `payload` JSONB. Gerado no primeiro acesso do dia; 1 chamada Gemini/dia/usuário para o diário. RLS por usuário.
- **`coach_messages`** (nova): thread contínua por usuário com divisores de data na UI (como no protótipo r6). Campos mínimos: `role`, `content`, `sources` JSONB, `created_at`. RLS por usuário.
- **`daily_checkins`** (nova): `user_id`, `date` (unique por par), `mood` smallint 1-5, `note` text opcional. Verificado: o módulo Mente não tem estrutura de humor (tabelas são `study_*`/`focus_sessions_mente`), então a tabela é nova e o Mente pode consumi-la depois.
- **Fontes citadas:** `buildModuleContext` passa a retornar também a lista de conjuntos de dados usados (ex.: `orçamento Lazer · 34 transações · score Corpo`); `coach-thread` devolve essa lista junto da resposta; UI renderiza a linha `.meta` (`Fontes: …`).
- **Check-in no contexto:** `daily_checkins` entra no `buildModuleContext` do diário (e do Mente futuramente).
- **Custo/viabilidade free:** briefing cacheado (1 req/dia/usuário no Gemini free), chat on-demand com `checkRateLimit` já existente (Groq free ~30 req/min). Tool calling (N3) é suportado nos dois free tiers quando chegar a vez. Migração para Claude segue o plano existente (MRR ≥ R$ 2k).

## 7. Impacto no programa de ondas e no DS

- **Onda 2 =** chrome (com gatilho + camada do coach) + **Diário** desktop e mobile dedicado. Ciclo normal: protótipo → aprovação explícita → implementação → teste de identidade.
- **Onda 3 =** Coach: camada expandida + vista cheia `/coach` (protótipos) + backend N1/N2 (implementação).
- **`DESIGN-SYSTEM-v5.md`:** antes de prototipar a Onda 2, atualizar §6.2 (anatomia do Diário no lugar da "Edição do dia"), §6.4 (coach = camada global + vista cheia; acesso e comportamento) e §6.1 (chrome ganha gatilho do coach; modbar sem Coach). Regra de fidelidade do programa se mantém: em divergência, protótipos vencem.
- **Protótipo r6 do coach** (`prototypes/poc-v5/r6-estudio/coach.html`) continua válido como linguagem da vista cheia; a camada é superfície nova a prototipar.

## 8. Fora de escopo (registrado, não esquecido)

- **N3 Executar:** sprint próprio pós-ondas, com whitelist de ações, confirmação obrigatória e testes de segurança.
- **N4 além do existente** (novos alertas proativos): pós-ondas.
- Definição real de indicadores/gráficos por módulo: segue o recorte de escopo da POC (conteúdo dos protótipos é ilustrativo; discussão por módulo, onda a onda).

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Check-in vira culpa de streak quebrado | 1 toque, opcional, coach nunca cobra (decisão 5); sem streak de check-in na UI do Diário |
| Chat vazio (usuário não sabe o que perguntar) | Chips de sugestão do `coach-brief` povoam a camada vazia |
| Free tier estourar com crescimento | Briefing cacheado 1×/dia; rate limit por usuário já existe; upgrade barato (Gemini Flash pago) antes da migração Claude |
| Diário virar "dashboard renomeado" | Check-in + personalização por `active_modules` + autoria explícita do coach são os três diferenciais; sem eles a tela regride ao problema original |
