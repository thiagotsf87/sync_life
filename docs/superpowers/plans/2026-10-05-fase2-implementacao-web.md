# Fase 2 · implementação em `web/` das 7 subtelas de Finanças

> Data: 2026-10-05. Protótipos APROVADOS pelo usuário no mesmo dia (`prototypes/v5/app/financas-*.html` e `.mobile.html`).
> Brief dos protótipos: `2026-10-05-fase2-financas-brief.md` (regras, correções do v3, inventário). Plano-mãe: `2026-10-03-rollout-ds-v5-sem-metafora.md`.
> Trabalho só local (sem push, produção congelada). Migrations novas só em homolog.

## 1. Base comum (já no repositório, feita antes dos agentes)

| Peça | Arquivo | Uso |
|---|---|---|
| Faixa de subtelas | `components/app-v5/SubnavArea.tsx` (`SUBNAV_FINANCAS`) | primeira coisa do `.wrap`; o hub já usa |
| Moldura da subtela | `components/app-v5/SubtelaV5.tsx` | chrome + faixa + voltar/subbar + camada de Sy; o corpo vem como render-prop `({ abrirCoach, mob })` |
| Painel de edição | `components/app-v5/Painel.tsx` | lateral no desktop, bottom sheet no mobile; X, scrim e Esc; foco |
| Confirmação inline | `components/app-v5/Confirma.tsx` | excluir/desfazer; nunca modal |
| CSS comum | `styles/app-v5.css` (final do arquivo) | `.subnav`, `.painel`, `.confirma`, `.subtela`, `.subbar`, `.btn-sm.ghost.perigo` |
| Registrar | `ChromeV5`/`BottomBar` prop `onRegistrar` | sem a prop, leva a `/financas/transacoes#registrar` |
| Mobile | `hooks/use-mob-v5.ts` (`useMobV5`) | `SubtelaV5` já entrega `mob` |

**Não edite** esses arquivos. Precisa de algo neles? Pare e descreva o pedido no relatório.

## 2. Contrato de cada tela

Cada agente entrega, **só nos seus arquivos**:

```
web/src/app/(app-v5)/financas/<rota>/page.tsx          server fino, só metadata + <TelaV5 />  (mesmo molde de (app-v5)/financas/page.tsx)
web/src/components/app-v5/financas/<Tela>V5.tsx        container: hook de dados + estado de UI + <SubtelaV5>
web/src/components/app-v5/financas/<Tela>View.tsx      (opcional, recomendado) apresentação pura por props, para teste de render
web/src/components/app-v5/financas/<tela>-v5.css       CSS da tela, escopo `.v5 .<classe>`; desktop `.v5 .dk:not(.mob) …`, mobile `.v5 .mob …`
web/src/hooks/use-<tela>-v5.ts                         adaptador sobre o hook v3 da tela (lógica de dados preservada)
web/src/lib/financas/<tela>.ts + <tela>.test.ts        cálculo/formatação PURA com vitest (a lógica que o protótipo calcula no JS da página)
web/src/components/app-v5/financas/<Tela>View.test.tsx smoke de renderToString: classes-chave, textos, e NENHUMA palavra proibida
```

E **apaga** `web/src/app/(app)/financas/<rota>/` (a rota v3 dessa tela), no mesmo passo em que cria a rota v5 (duas rotas iguais quebram o build).
Não rode `next build`, `next dev` nem `rm -rf .next`: o build é da sessão principal. Pode rodar `npx tsc --noEmit` (ignore erros em `.next/types`),
`npx vitest run <seus arquivos>` e `npx eslint <seus arquivos>`. Não faça commit.

### Regras de porte (LEI)

1. **O protótipo aprovado é a verdade.** Porte 1:1 a marcação, as classes e o CSS de `financas-<tela>.html` (desktop) e `financas-<tela>.mobile.html` (mobile
   dedicado: markup próprio). O que o protótipo traz inline e já existe em `styles/app-v5.css` (bar, nums, orc, tx, sy, camada, painel, confirma, subnav, btn-sm, chip,
   sel, ck-note, lab) NÃO se duplica; o que é só da tela vai para o `<tela>-v5.css`. Leia `styles/app-v5.css`, `financas-v5.css` e `life-score-v5.css` para ver o molde de escopo.
2. **Desktop e mobile são árvores diferentes** (`mob ? mobile : desktop`, com `mob` vindo do `SubtelaV5`). O servidor sempre entrega o desktop; não leia `window` no render.
3. **Dados reais, nenhum número do mock.** O mock do protótipo (`SL_MOCK.fin`) é ilustração. Os números vêm dos hooks v3 da tela (a lógica e os efeitos colaterais continuam:
   XP, streak e sync com Futuro ao criar transação, rollover, normalização mensal, projeção). Estados honestos: vazio, carregando (esqueleto), erro com "Tentar de novo".
4. **Correções do v3 embutidas** (brief §7): são parte do contrato, não opcionais. Excluir sempre com `<Confirma>`; paridade total no mobile; um só critério de alerta em Orçamentos;
   % comprometido sobre `profiles.monthly_income`; projeção com renda e gasto variáveis médios; Relatórios sem botão "Gerar"; Importar com reconhecidas marcadas e duplicatas desmarcadas;
   totais de Transações sobre o mês inteiro.
5. **Supabase:** cliente `createClient()` de `@/lib/supabase/client`; schema drift → `as unknown as { from: (t: string) => any }` com o eslint-disable da linha, como em `use-financas-v5.ts`. Sem `any` solto.
6. **Copy:** sem em-dash (en-dash só em negativo), sem as palavras proibidas (edição, folha, manchete, colofão, jornal, byline, redação, diário, coach, assessor, "o Sy", "ao Sy", "do Sy").
   Números em `.num`, moeda com NBSP após `R$`, `fmtBRL` de `@/lib/format/currency` onde existir.
7. **Acessibilidade e alvos:** ≥ 40px no mobile; foco visível; Esc fecha painel; sem JS o desktop já tem o conteúdo (E-02: o servidor renderiza o estado carregado ou o esqueleto, nunca vazio mudo).
8. **Sy:** `coach={{ leitura, saudacao, sugestoes }}` do protótipo; o `moduloCoach` é `'financas'`. A seção "O que Sy lê aqui" do protótipo é anotação e NÃO entra no app;
   a ampliação do contexto do servidor é tarefa separada (não mexa em `lib/coach/context.ts`).
9. **Ownership dos hooks v3** (só edite o seu; os outros são somente leitura, peça por relatório): Transações → `use-transactions.ts`, `use-accounts.ts`;
   Orçamentos → `use-budgets.ts`; Recorrentes → `use-recorrentes.ts`; Planejamento → `use-planejamento.ts`; Calendário → `use-calendario.ts`; Relatórios → `use-relatorios.ts`
   (e `use-relatorio-completo.ts`); Importar → `use-import.ts`, `lib/import/*`. `use-categories.ts`/`use-user-categories.ts`: somente leitura.
10. **Entre telas:** links com `next/link` para as rotas reais (`/financas/…`); a faixa já está no `SubtelaV5`. Painéis reutilizáveis entre telas são exportados pela tela dona:
    Transações exporta `TransacaoPainel` (captura/edição de transação, usado no Calendário); Planejamento exporta `EventoPlanejadoPainel` (usado no Calendário).

### Ondas

- **Onda A (paralelo):** Transações · Orçamentos · Recorrentes · Planejamento · Relatórios · Importar.
- **Onda B:** Calendário (depende de `TransacaoPainel` e `EventoPlanejadoPainel`).

### Tela a tela (o que cada protótipo pede, além do porte)

| Tela | Rota | Hook v3 | Pontos de atenção |
|---|---|---|---|
| Transações | `/financas/transacoes` | `use-transactions` | mês ‹›; ordenar; filtros (Todas, Entradas, Saídas, Transferências, Recorrentes) + categoria + busca (debounce 300 ms); selos Recorrente/Previsto/Transf.; bloco "Previstos"; painel com tipo Despesa/Receita/Transferência, método, observações, contas (`use-accounts`); excluir com `Confirma` também no mobile; "Carregar mais" com 20 por vez e total do MÊS INTEIRO (query de agregação separada, não só a página); abre a captura com `#registrar`; XP, streak e sync com Futuro seguem no hook |
| Orçamentos | `/financas/orcamentos` | `use-budgets` | 1 critério de alerta (`alert_threshold` do envelope); edição mostra limite base e sobra do rollover separados e grava só o base (corrigir `use-budgets.ts:200`); categoria travada na edição; copiar do mês anterior; não alocado; referência 50-30-20 dispensável (`localStorage`); **laboratório do teto**: cálculo puro em `lib/financas/orcamentos.ts`, efeitos 01 fechamento, 01 poupança, 02 aporte extra para a meta de viagem (derivados dos dados reais; se não houver meta, o efeito 02 some); limite FREE: aplicar `financas:maxBudgets = 5` em `use-plan-limits.ts` é DECISÃO PENDENTE, não implemente |
| Recorrentes | `/financas/recorrentes` | `use-recorrentes` | % comprometido sobre `profiles.monthly_income` (sem 3000 fixo); próximos 30 dias; pausar/retomar/excluir (lógico) também no mobile; frequências com dia do mês só em mensal/trimestral/anual; limite FREE 5 ativas (pausadas contam) |
| Planejamento | `/financas/planejamento` | `use-planejamento` | 3 cenários; projeção 13 meses com renda e gasto variáveis médios (últimos 3 meses de `transactions`) e recorrentes normalizadas por mês; mês crítico (queda > 30%); eventos (data ≥ hoje); confirmar só marca; **laboratório do notebook** só se houver objetivo/meta com data de compra (use a meta de `goals` mais próxima do tipo equipamento ou o evento planejado de maior valor; sem candidato, o laboratório não aparece); exporta `EventoPlanejadoPainel` |
| Relatórios | `/financas/relatorios` | `use-relatorios` | 6 períodos (3 PRO, sem bloqueio novo: manter o comportamento atual); troca recarrega sem botão; 4 KPIs com delta; 4 gráficos SVG com tooltip (mouse, setas, toque); linhas de Sy calculadas (texto), nunca chamada de IA; CSV `;` com BOM; "Mês a mês" recolhido |
| Importar | `/financas/importar` | `use-import` | 3 passos na mesma página (01 reabrível); reconhecidas marcadas e duplicatas desmarcadas; importar sem categoria permitido; "aplicar a todas" respeita o tipo; nova categoria só com nome e tipo; histórico e desfazer lote com `Confirma`; Sy "o que reconheci" calculado; SaveBar sticky; sem dedupe novo (a regra do hook continua) |
| Calendário | `/financas/calendario` | `use-calendario` | grade dom–sáb, pontos por forma, saldo do dia e da semana; saldo do mês (não o `current_balance`); painel do dia; adicionar no dia com a data; editar/excluir; provento de Patrimônio só leitura; no mobile Registrar abre a captura com o dia selecionado |

## 3. Depois dos agentes (sessão principal)

1. `rm -rf .next && NEXT_PUBLIC_SUPABASE_ENV=homolog npm run build`; `tsc`, `vitest`, `eslint` globais.
2. Semear homolog para as subtelas (recorrentes, planning_events, orçamentos, transferência, import) e estender `identidade-v5.mjs` com os 14 pares.
3. Ampliar o contexto de Sy de Finanças (`planning_events`, `portfolio_dividends`, `user_accounts`) com fontes citadas.
4. Remover componentes v3 órfãos (`FinancasMobileShell`, modais e cards só dessas telas), handoff, hub e memória.
5. Atualizar `prototypes/v5/index.html` (Fase 2 em `qa`).

## 4. Fora de escopo

Gerar transações automáticas a partir das recorrentes (o v3 também não gera), PDF/Excel em Relatórios, limite FREE novo, qualquer migration de produção.
