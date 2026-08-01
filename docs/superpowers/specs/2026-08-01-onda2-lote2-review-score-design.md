# Onda 2 lote 2: Review semanal e Life Score no v5 (definição de produto)

**Data:** 2026-08-01
**Status:** aprovado em brainstorm, aguardando protótipos
**Branch alvo:** `poc/ds-v5`
**Origem:** lote 2 da Onda 2 do programa de redesign v5. O `DESIGN-SYSTEM-v5.md` registra explicitamente que a anatomia destas duas telas não estava especificada (diferente do Diário, herdado da POC r5/r6), então elas precisavam de definição de produto antes do protótipo.

## 1. Problema

O mapeamento das duas telas no v3 mostrou que nenhuma é caso de redesenho puro: as duas exibem informação que não corresponde ao estado real do usuário.

### 1.1 Review semanal: duas telas concorrentes, ambas incompletas

- `web/src/app/(app)/dashboard/review/page.tsx` é uma experiência de 7 slides (capa, finanças, metas, corpo, score, badges, CTA) com **todos os números hardcoded** no componente (gastos `R$ 1.240`, metas 68→70%, score 68, badges fixas). É, porém, a única tela que **persiste**: no slide final faz upsert em `weekly_reviews` (`completed_at`, `score_gained: 50`) e chama `updateStreak`.
- `web/src/app/(app)/tempo/review/page.tsx` tem **dados reais** (via `useAgenda({mode:'week'})` + `useFocusSessions('week')`: eventos concluídos, % de conclusão, horas de foco, distribuição por tipo, pendências), mas é travada por gate PRO e **não persiste nada** — o botão "Concluir Review (+10 XP)" só dispara um toast.
- **Schema quebrado:** `013_panorama.sql` criou `weekly_reviews` com `week_start`, `week_end`, `data JSONB`, `completed_at`, `shared`. A `016_tempo_weekly_review.sql` tentou criar a MESMA tabela com colunas diferentes (`total_events`, `completed_events`, `focus_minutes`, `module_distribution`, `pending_tasks`, `notes`, `xp_awarded`), mas usa `CREATE TABLE IF NOT EXISTS` e a tabela já existia: a 016 é código morto e essas colunas não existem no banco. Além disso, `types/database.ts` documenta uma coluna `score_gained` que não aparece em nenhuma migration versionada (alteração manual).
- **Consumidor real:** `use-badge-engine.ts` conta linhas de `weekly_reviews` com `completed_at IS NOT NULL` para desbloquear badges.
- **Janela de disponibilidade:** `isReviewAvailable()` só libera a tela de domingo às 20h até quarta; fora disso mostra "Review indisponível".
- O cron `/api/cron/weekly-digest` calcula um resumo semanal próprio direto das tabelas e manda push, sem tocar em `weekly_reviews` nem linkar para a review.

### 1.2 Life Score: a tela usa o motor errado

Existem dois motores de score paralelos e divergentes:

| | `useScoreEngine` (+ `lib/score-utils.ts`) | `useLifeMap` |
|---|---|---|
| Média | Ponderada por `WEIGHTS`, com redistribuição entre módulos ativos | Média simples |
| Áreas | 8 (inclui `tempo`) | 7 (não tem `tempo`) |
| Breakdown | `components: Record<string, number>` por módulo | Só um `value` final |
| Histórico | Persiste em `life_sync_scores` (upsert por dia) | Não persiste |
| Quem consome | `SidebarScore`, `use-diario` (Diário v5) | **`/dashboard/score`**, `LifeMapRadar`, `LifeMapWidget` |

Consequências na tela de score hoje: badge "+4 pontos esta semana · Melhor semana do mês" **hardcoded**; grid "POR MÓDULO" com **6 das 8 áreas** (faltam Carreira e Experiências); `score = overallScore || 72` (fallback fixo); **nenhum uso do histórico** de 30 dias que já existe em `life_sync_scores`; card "Como melhorar" com template e "+8 pontos" fixo.

## 2. Decisões (aprovadas em 2026-08-01)

1. **Review semanal vira "A edição da semana"**: carta editorial semanal do coach sobre dados reais, na linguagem do Diário, encerrada por uma ação explícita de fechar a semana. O formato de slides sai.
2. **A janela de disponibilidade cai**: a edição da semana é sempre legível; apenas a ação de fechar depende de a semana ter terminado.
3. **`/tempo/review` continua existindo** como painel analítico do módulo Tempo (PRO). Papéis distintos: uma é fechamento narrativo, a outra é análise de agenda. Sem duplicação.
4. **Life Score vira "A anatomia do número"** e passa a usar `useScoreEngine` como fonte única, incluindo o histórico real e o breakdown por componentes.
5. **`useLifeMap` não é mais fonte de score**, mas continua onde já está (radar do `/futuro`). Unificar os dois motores de vez é limpeza maior, com efeito no `/futuro`, e fica para sprint próprio.
6. **Sem IA no Life Score**: as sugestões de melhoria são derivadas deterministicamente dos componentes mais fracos do motor. IA só na carta semanal.

## 3. Review semanal v5 (rota `/dashboard/review`, movida para `(app-v5)`)

Ordem vertical:

1. **Masthead** — eyebrow `Edição da semana · 27 de julho a 2 de agosto`, título editorial, selo com o score no fim da semana e a variação da semana.
2. **A folha** (banda `.lt`) — carta do coach sobre a semana: prosa com números reais, rabisco `.hand`, assinatura (`Escrito em …, com base em …`). Cache semanal (uma geração por semana por usuário).
3. **A semana em números** — banda de 4 colunas: entradas, saídas, eventos concluídos (x de y) e horas de foco. Valores derivados, sem inventar.
4. **O que mudou** — as áreas ativas com a variação da semana (score atual − score de 7 dias atrás, de `life_sync_scores`); sem histórico suficiente, o bloco explica isso em vez de mostrar zeros.
5. **Fechar a semana** — ação única e explícita: persiste em `weekly_reviews` (`completed_at`, `data` com o snapshot exibido) e atualiza streak; alimenta as badges já existentes. Semana ainda em curso: o botão fica desabilitado com a razão dita em texto. Semana já fechada: vira estado de confirmação com a data.
6. **Colofão** — período coberto, o que entrou no cálculo, link para o Diário.

## 4. Life Score v5 (rota `/dashboard/score`, movida para `(app-v5)`)

Ordem vertical:

1. **Masthead** — eyebrow `Life Sync Score`, selo grande com o número real, label da faixa (`Iniciante`…`Excelente`) e delta real da semana (ausente quando não há histórico de 7 dias).
2. **A curva** — série dos últimos 30 dias de `life_sync_scores`, em SVG no vocabulário v5 (sem lib nova). Menos de 2 pontos: o bloco não renderiza.
3. **As 8 áreas** — lista com número canônico, nome, score, **peso** e **contribuição para o total** (peso redistribuído entre as áreas ativas). Áreas inativas aparecem na linha quieta, sem score.
4. **Por dentro de cada área** — os `components` reais do motor por área, com rótulos legíveis e o quanto cada um está entregando. Exemplos verificados no código: Finanças = orçamento do mês (40%), registro de transações (30%), tendência de saldo (30%); Corpo = atividades (30%), consulta agendada (30%), registros de peso (20%), hidratação (20%); Tempo = conclusão de eventos (50%), consistência (50%).
5. **Como melhorar** — até 3 ações derivadas dos componentes mais fracos das áreas de maior peso, com o efeito descrito qualitativamente (nunca "+8 pontos" fabricado) e link para a tela onde a ação acontece.
6. **Colofão** — como o score é calculado (média ponderada, áreas inativas excluídas), data do último cálculo.

## 5. Dados por bloco (fontes reais)

| Bloco | Fonte |
|---|---|
| Score, label, áreas, pesos, componentes | `useScoreEngine().result` (`total`, `modules[].{module,score,weight,components}`) |
| Delta e curva | `useLifeScore()` (`score`, `history` 30 dias desc, `delta`, `deltaWeek`) |
| Entradas/saídas da semana | `transactions` da semana corrente (mesmo padrão do `summarizeFinancas`) |
| Eventos concluídos, horas de foco | `useAgenda({mode:'week'})` + sessões de foco (mesma fonte do `/tempo/review`) |
| Fechamento e badges | `weekly_reviews` (`completed_at`, `data`), `updateStreak`, `use-badge-engine` |
| Carta semanal | `/api/ai/review-brief` (Gemini + cache semanal + fallback determinístico) |

## 6. Backend

- **Migration `028_weekly_review_reconcile.sql`**: reconcilia `weekly_reviews` com o que o app realmente usa. Adiciona de forma idempotente (`ADD COLUMN IF NOT EXISTS`) a coluna `score_gained` (hoje existe no banco sem migration) e quaisquer colunas do snapshot que a tela precise gravar em `data` mas queiramos tipadas. Documenta em comentário que `016_tempo_weekly_review.sql` é inerte. **Não** recria nem dropa a tabela.
- **`/api/ai/review-brief`**: mesmo padrão de `/api/ai/diario-brief` (auth → rate limit → zod → cache → IA → fallback determinístico → nunca 500 por falha de IA). Cache em `coach_briefs` com `module_id = 'review'` e `brief_date` = data de início da semana (uma geração por semana). Aceita `forceFallback` para o kill-switch `NEXT_PUBLIC_COACH_OS`.
- **Contexto semanal**: extensão do `buildModuleContext` com um escopo de semana (transações, eventos concluídos, foco, variação de score), sem quebrar o contexto diário existente.
- **Life Score**: nenhuma tabela nova, nenhuma rota de IA.

## 7. Fora de escopo

- Unificação definitiva `useScoreEngine` × `useLifeMap` (afeta `/futuro` e o radar): sprint próprio.
- Ligar o cron `weekly-digest` à edição da semana (hoje ele calcula resumo próprio e aponta para `/dashboard`).
- Migração de `/tempo/review` para o v5 (é tela do módulo Tempo, entra na onda do Tempo).
- Sistema central de XP (o `score_gained` continua sendo campo da linha, sem ledger).

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Sem histórico em `life_sync_scores` (drift do ambiente), curva e deltas ficam vazios | Blocos que dependem de histórico se explicam em vez de mostrar zero; o QA valida os dois estados |
| A carta semanal repetir o briefing diário | Prompt da semana foca em variação e fechamento (o que mudou de segunda a domingo), não no estado de hoje |
| "Fechar a semana" virar cobrança | Sem streak de reviews na UI, sem linguagem de culpa; fechar é opcional e o texto diz o que a ação faz |
| Migration mexer em tabela viva | Apenas `ADD COLUMN IF NOT EXISTS`; nada de drop/recreate; a 016 permanece inerte e documentada |
