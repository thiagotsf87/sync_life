# Rollout do modelo "Meu dia · Áreas · Sy" para todo o SyncLife

**Data:** 2026-10-03 · **Branch:** `poc/ds-v5` · **Status:** plano para aprovação do usuário
**Substitui:** o programa de 15 ondas de 2026-07-28 a partir da Onda 02 (as Ondas 00 e 01, landing e auth, ficam como estão e fora deste plano).
**Base aprovada (2026-10-03, desktop):** `prototypes/v5/app/meu-dia-d.html` (Meu dia) e `prototypes/v5/app/financas-a.html` (tela de área).
**Documentos de apoio:** `DESIGN-SYSTEM-v5.md` (tokens, motion, marca, regras E-01 a E-12), `docs/superpowers/specs/2026-10-03-conceito-sem-metafora-design.md` (conceito, critério de gatilhos §4.1, pacote de contexto por área §5, intenção N3 §6.2), `docs/superpowers/plans/2026-10-03-meu-dia-versoes-brief.md` (o que fica e o que sai), `docs/handoff/HANDOFF-v5.md` (rolling).

---

## 1. O que este plano entrega

Todas as telas autenticadas do SyncLife (68 do inventário + as rotas que o hub não listava) redesenhadas no modelo aprovado, **em desktop e em mobile dedicado**, prototipadas, aprovadas tela a tela, implementadas em `web/` com teste de identidade, e o v3 removido no fim.

O modelo, em uma frase por camada:

- **Meu dia** mostra o que merece atenção agora: margem de hoje, ritmo, uma escolha com seus efeitos, o que pede você, o dia, o acordo com Sy, as áreas, os números. Sem metáfora, sem encenação.
- **Áreas** são onde você organiza e aprofunda. Toda tela de área segue um de **quatro templates** (§3) e entrega a Sy o pacote de contexto dela.
- **Sy** é presença de 40px: lê, responde com fontes, propõe com efeitos visíveis, age só com a sua escolha e dentro do acordo de atenção.

## 2. Regras do programa (herdadas e novas)

Herdadas, continuam valendo:
1. Ciclo por lote: **protótipo desktop → protótipo mobile dedicado 390×844 → aprovação explícita → implementação em `web/` → teste de identidade em `next start`**. Zero código antes do "aprovado".
2. Em divergência entre DS e protótipo, o protótipo aprovado vence e o DS é corrigido.
3. Mudança em `prototypes/v5/shared/*` depois de um lote aprovado exige smoke visual do hub.
4. Fim de toda sessão: handoff atualizado antes do commit final. Trabalho só local (sem push) até o usuário liberar.
5. Numeração canônica das áreas (LEI): 01 Finanças · 02 Futuro · 03 Tempo · 04 Corpo · 05 Mente · 06 Patrimônio · 07 Carreira · 08 Experiências. Conquistas e Configurações não são áreas.

Novas, a partir deste plano:
6. **Sai tudo que é estilo revista** (lista fechada no brief §2): banda clara `.lt`, `.selo` com moldura dupla, Caveat/`.hand`/`.hl`, ticker, cabeçalho com frase longa, encenação de Sy (tempos, lâminas, portão, voz). Fica a base do DS v5.
7. **Palavras proibidas em texto visível:** edição, folha, manchete, colofão, jornal, byline, redação, diário, coach, assessor, "o Sy", "ao Sy", "do Sy". Classes e nomes internos só mudam na Fase 8.
8. **Toda tela entrega "O que Sy lê aqui":** seção obrigatória no fim de cada protótipo listando as fontes (tabelas) que o pacote de contexto da tela expõe (spec §5). Sem isso o protótipo não entra em aprovação.
9. **Uma escolha, mais de um efeito** só onde há decisão real com efeito em mais de uma área. Nunca como enfeite. A tabela do §4 marca onde entra.
10. **Mobile é tela dedicada, não breakpoint.** Modais do v3 viram sheets no mobile e painéis laterais ou inline no desktop, conforme o template.
11. **Mock em outubro de 2026.** `shared/mock-data.js` é re-ancorado na Fase 0 (datas, "vs setembro"), e nenhum protótipo inventa número fora dele.

## 3. Os quatro templates (fixados na Fase 0)

| Template | Pitch | Ordem vertical no desktop | Mobile | Origem |
|---|---|---|---|---|
| **T1 · Área (hub)** | Sy em 1 ou 2 linhas, depois os dados | Cabeçalho curto (eyebrow `01 · Finanças`, título `Finanças · outubro`) → Sy 40px + 1 ou 2 linhas + fontes + "Falar com Sy sobre…" → números (4 colunas hairline) → zona de evidência em 2 colunas → lista densa → 2 colunas de apoio → rodapé | Mesma ordem em 1 coluna; números 2×2; evidência empilhada; Sy continua no topo | `financas-a.html` aprovada |
| **T2 · Lista + captura** | Registrar e filtrar sem sair da lista | Cabeçalho curto com filtros em pílula → captura inline (1 linha: campo + botão) → lista densa em grid com hover que desliza → total/rodapé. Sy só pela camada | Filtros em scroll-x; captura vira botão `+` fixo que abre **sheet** de 1 tela; lista em cartões de linha (hairline) | Transações, Recorrentes, Atividades, Sessões, Carteira, Biblioteca |
| **T3 · Detalhe** | Um objeto, suas partes, suas ações | Cabeçalho com voltar + nome + estado → número principal (1 por dobra) → abas ou seções hairline → ações no fim; irreversível pede licença | Cabeçalho sticky com voltar; abas em scroll-x; ações em barra inferior | Detalhe do objetivo, da viagem, do ativo, da trilha |
| **T4 · Formulário** | Editar confortável, salvar óbvio | Cabeçalho → seções numeradas só quando há >3 (G-09) → zona de perigo → **SaveBar** sticky com alterações | Uma seção por dobra; SaveBar sobre a safe-area | Novo objetivo, Nova viagem, Configurações |

Peças compartilhadas que a Fase 0 extrai da D e da A para `shared/app.css` + `shared/app.js` (hoje estão inline nas páginas): `.sy40` (Enxame 40px + laço de estados repouso/ouvindo), `.margem` (anel + linha do dia + rodapé de 3 números), `.ritmo` (3 pílulas + nota, sobre o wiring do check-in), `.lab` (cenários + 3 efeitos + hipóteses + experimentar/desfazer, parametrizado por dados), `.row` (lista "pede você"), `.ag` (linha de agenda), `.presenca` (acordo com Sy), `.nums`, `.dimrow`, `.semana`, `.sheet` (mobile) e `.painel` (desktop lateral, reaproveitando `.camada`).

## 4. Inventário por fase

Legenda: **T** template · **Sy** presença (topo = 1 ou 2 linhas; camada = só pelo gatilho; inline = conversa ou cartão dentro da tela) · **Lab** há "uma escolha, mais de um efeito" · **M** modais do v3 que viram sheet/painel.

### Fase 0 · Fundação do modelo (sem tela nova para o usuário)
Objetivo: fixar o que todas as fases vão copiar, para não decidir tela a tela.

| Entregável | Arquivo | Critério de pronto |
|---|---|---|
| Mobile dedicado de Meu dia D | `app/meu-dia-d.mobile.html` | 390×844, uma dobra por bloco (margem; ritmo; laboratório com cenários em pílulas e efeitos empilhados; pede você; dia; acordo), console 0, sem overflow, teclado testado com foco. **Aprovação do usuário** |
| Mobile dedicado de Finanças A | `app/financas-a.mobile.html` | Idem, com números 2×2 e Sy no topo. **Aprovação do usuário** |
| Mock re-ancorado | `shared/mock-data.js` | Datas em outubro de 2026, "vs setembro", `semana` 29 set a 5 out; smoke do hub (landing, login, Meu dia D, Finanças A sem regressão) |
| Peças compartilhadas | `shared/app.css`, `shared/app.js`, `shared/sy40.js` (novo, módulo do Enxame 40px) | D e A refeitas sobre as peças sem diferença visual (diff de screenshot = 0) |
| Templates T2, T3, T4 | `app/_t2-lista.html`, `app/_t3-detalhe.html`, `app/_t4-form.html` + `.mobile.html` de cada | Protótipos-espécime com dados de Finanças (T2 = transações, T3 = detalhe de uma meta, T4 = nova meta). **Aprovação do usuário dos 3 templates D+M** |
| DS reescrito | `DESIGN-SYSTEM-v5.md` §1, §4 (remover 2 caligrafia, 3 marca-texto, 5 selo; manter ticker só na landing), §6.2 (Meu dia), §6.3 (T1), novos §6.3.1 a §6.3.3 (T2 a T4), §6.4 (Sy: 40px, acordo, laboratório, intenção), §7 inventário, E-07 e E-10 | Sem contradição com os protótipos aprovados; checklist "O que Sy lê aqui" no §6.3 |
| Spec corrigida | `specs/2026-10-03-conceito-sem-metafora-design.md` §4.2, §7.2, §7.3, §8, §11 | Reescritos com a anatomia da D; status sai de "superada no alcance" para "vigente" |
| Hub reorganizado | `prototypes/v5/index.html` | Ondas 02 a 14 substituídas pelas Fases 0 a 8 deste plano, com status por tela e por dispositivo |

Gate da Fase 0: os 2 mobiles e os 3 templates aprovados. Nada em `web/`.

### Fase 1 · Núcleo: Meu dia, Finanças hub, Sy
Objetivo: a casa nova no ar, com Sy funcionando de verdade (N1 com critério, N2 persistido, N3 em uma intenção).

| Tela | Rota | T | Sy | Lab | M | Mobile |
|---|---|---|---|---|---|---|
| Meu dia | `/dashboard` | D | inline (laboratório + acordo) + camada | jantar (Tempo, Finanças, Experiências) | QuickEntrySheet, QuickActionSheet | aprovado na Fase 0 |
| Finanças hub | `/financas` | T1 | topo | não | TransacaoModal → sheet | aprovado na Fase 0 |
| Life Score | `/dashboard/score` | T3 | topo (1 linha: "o que mais pesou") | não | – | refazer `life-score.mobile.html` sem selo |
| Sua semana | `/dashboard/review` | T3 | topo | não | – | refazer `review-semanal.mobile.html` sem "edição" nem encenação; fechamento persiste em `weekly_reviews` |
| Arquivo da conversa | `/coach` | T2 (lista de conversas + busca) | inline (é a própria conversa) | não | CoachDrawer, CommandPalette, CheatSheet (removidos) | novo |
| Intenção composta | dentro de Meu dia e da camada | cartão de proposta (padrão do laboratório com registros marcáveis) | inline | sim (é o laboratório aplicado a 5 áreas) | – | dentro de Meu dia mobile |
| Chrome | bar + modbar + camada + bottom bar mobile | – | gatilho "Fale com Sy" | – | MobileBottomBar, MobileMoreSheet, CoachFab (substituído pelo gatilho) | novo bottom bar mobile sem FAB central |

Implementação em `web/` (ordem): migration `029_intencoes` + `coach_messages` persistido · `/api/ai/diario-brief` passa a seguir os gatilhos do §4.1 da spec · `/api/ai/intencao`, `/api/intencao/aplicar`, `/api/intencao/desfazer` · `(app-v5)/dashboard` refeito (D) · `(app-v5)/financas/page.tsx` (T1) · `(app-v5)/dashboard/score`, `/review`, `(app-v5)/coach` · chrome v5 completo (desktop + mobile) · `(app)/dashboard/review|score` e `(app)/coach` deletados. Teste de identidade desktop e mobile por tela.

Gate: 5 telas no ar com identidade, intenção criando e desfazendo registros no banco de homologação.

### Fase 2 · Finanças, subtelas (7 telas + 5 modais)

| Tela | Rota | T | Sy | Lab | M |
|---|---|---|---|---|---|
| Transações | `/financas/transacoes` | T2 | camada | não | TransacaoModal, DeleteConfirmModal → sheet + confirmação inline |
| Orçamentos | `/financas/orcamentos` | T2 (linhas com barra) | topo (1 linha) | **sim**: mexer num teto mostra efeito no fechamento e na meta | EnvelopeModal → sheet |
| Recorrentes | `/financas/recorrentes` | T2 | camada | não | RecorrenteModal → sheet |
| Planejamento | `/financas/planejamento` | T3 (mês como objeto) | topo | **sim**: antecipar ou adiar um evento planejado | PlanningEventModal → sheet |
| Calendário | `/financas/calendario` | T3 (grade mensal) | camada | não | – |
| Relatórios | `/financas/relatorios` | T1 reduzido (só evidência) | topo (1 linha por gráfico, opcional) | não | – |
| Importar extrato | `/financas/importar` | T4 (3 passos) | topo ("o que reconheci") | não | – |

Gate: 7 telas D+M aprovadas e no ar; `(app)/financas/*` deletado; `/transacoes` legado deletado.

### Fase 3 · Tempo (7) e Futuro (5)
Por que juntas e já aqui: a margem de Meu dia depende da agenda (Tempo) e o laboratório depende das metas (Futuro). Sem elas no modelo novo, Meu dia fica apoiado em telas v3.

| Tela | Rota | T | Sy | Lab | M |
|---|---|---|---|---|---|
| Tempo hub | `/tempo` | T1 | topo | **sim**: proteger ou ceder a janela livre | EventModal, FocusSessionModal → sheet |
| Agenda diária | `/tempo/agenda` | T2 (linha do dia) | camada | não | EventModal |
| Agenda semanal | `/tempo/semanal` | T3 (semana como objeto) | topo | não | EventModal |
| Agenda mensal | `/tempo/mensal` | T3 (grade) | camada | não | – |
| Novo evento | `/tempo/novo` | T4 | camada | não | substitui EventModal no desktop |
| Modo foco | `/tempo/foco` | tela própria (timer, 1 número) | camada | não | FocusSessionModal |
| Review do tempo | `/tempo/review` | T3 | topo | não | – (analítico; a semana geral está em `/dashboard/review`) |
| Futuro hub | `/futuro` | T1 | topo | **sim**: antecipar aporte mexe em saldo e prazo | AddGoalModal, MetaModal → T4 |
| Novo objetivo | `/futuro/novo` (e `/futuro/nova`, unificar) | T4 | camada | não | – |
| Detalhe do objetivo | `/futuro/[id]` | T3 | topo (1 linha) | **sim**: aporte extra × prazo | AddContributionModal → sheet |
| Check-in semanal | `/futuro/checkin` | T4 curto | topo | não | – |

Gate: 11 telas D+M aprovadas e no ar; redirects `metas→futuro`, `agenda→tempo` mantidos.

### Fase 4 · Corpo (6) e Mente (6)

| Tela | Rota | T | Sy | Lab | M |
|---|---|---|---|---|---|
| Corpo hub | `/corpo` | T1 | topo | não | CorpoProfileModal → T4 |
| Atividades | `/corpo/atividades` | T2 | camada | não | CorpoActivityModal → sheet |
| Cardápio com IA | `/corpo/cardapio` | T3 (semana de refeições) | **inline** (é gerado por Sy; Gemini) | **sim**: trocar uma refeição mostra custo e preparo | CorpoMealModal → sheet |
| Coach do corpo | `/corpo/coach` | **some**: vira a camada com contexto de Corpo | – | – | – |
| Peso e medidas | `/corpo/peso` | T2 + gráfico | camada | não | CorpoWeightModal → sheet |
| Saúde preventiva | `/corpo/saude` | T2 (consultas) | camada | não | CorpoAppointmentModal → sheet |
| Mente hub | `/mente` | T1 | topo | não | – |
| Biblioteca | `/mente/biblioteca` | T2 | camada | não | – |
| Sessões | `/mente/sessoes` | T2 | camada | não | – |
| Timer | `/mente/timer` | tela própria (compartilha com Modo foco) | camada | não | – |
| Trilhas | `/mente/trilhas` | T2 | camada | não | MenteTrackEditModal, MenteTrackDeleteModal → sheet + confirmação |
| Detalhe da trilha | `/mente/trilhas/[id]` | T3 | topo (1 linha) | não | – |

Decisão embutida: `/corpo/coach` deixa de ser rota (viola "Sy é camada, não destino"); redirect para `/corpo` com a camada aberta.

### Fase 5 · Patrimônio (6) e Carreira (5)

| Tela | Rota | T | Sy | Lab | M |
|---|---|---|---|---|---|
| Patrimônio hub | `/patrimonio` | T1 | topo | não | – |
| Carteira | `/patrimonio/carteira` | T2 | camada | não | – |
| Detalhe do ativo | `/patrimonio/carteira/[ticker]` | T3 | topo (1 linha) | não | – |
| Evolução | `/patrimonio/evolucao` | T3 (gráfico como objeto) | topo | não | – |
| Proventos | `/patrimonio/proventos` | T2 | camada | não | – |
| Simulador IF | `/patrimonio/simulador` | **laboratório em tela cheia** (o padrão da D, com 3 cenários) | inline | **sim** | CarreiraSimuladorModal (reaproveita a peça) |
| Carreira hub | `/carreira` | T1 | topo | não | CarreiraAddPromotionModal → sheet |
| Perfil profissional | `/carreira/perfil` | T4 | camada | não | – |
| Habilidades | `/carreira/habilidades` | T2 | camada | não | CarreiraAddSkillModal → sheet |
| Histórico | `/carreira/historico` | T2 (linha do tempo) | camada | não | – |
| Roadmap | `/carreira/roadmap` | T3 | topo | **sim**: mover um marco mexe em Mente e Tempo | – |

### Fase 6 · Experiências (7) e Conquistas (2)

| Tela | Rota | T | Sy | Lab | M |
|---|---|---|---|---|---|
| Experiências hub | `/experiencias` | T1 | topo | não | – |
| Minhas viagens | `/experiencias/viagens` | T2 (cartões de viagem são objetos, E-04 permite) | camada | não | ExpTripStatusSheet |
| Detalhe da viagem | `/experiencias/viagens/[id]` | T3 (abas: roteiro, hospedagem, transporte, orçamento) | topo | **sim**: orçamento da viagem × meta × lazer | ItineraryModal, AccommodationModal, TransportModal → sheets |
| Nova viagem | `/experiencias/nova` | T4 | **inline** (roteiro por IA, Gemini) | não | – |
| Bucket list | `/experiencias/bucket-list` | T2 | camada | não | – |
| Memórias | `/experiencias/memorias` | T2 (grade de fotos) | camada | não | – |
| Passaporte | `/experiencias/passaporte` | T3 | camada | não | ExpCelebrationModal → estado inline |
| Conquistas hub | `/conquistas` | T3 (nível como objeto; **sem** `--sl-grad`, sem selo) | topo (1 linha) | não | – |
| Ranking | `/conquistas/ranking` | T2 | camada | não | – |

### Fase 7 · Configurações (7) e o acordo com Sy

| Tela | Rota | T | Sy | M |
|---|---|---|---|---|
| Configurações hub | `/configuracoes` | T4 (perfil) | camada | – |
| Aparência | `/configuracoes/aparencia` | T4 | camada | decisão de produto: tema claro no app entra ou não (DS §2.2) |
| Categorias | `/configuracoes/categorias` | T2 | camada | category-manager → inline |
| Contas | `/configuracoes/contas` | T2 | camada | account-manager → inline |
| Integrações | `/configuracoes/integracoes` | T2 | camada | – |
| Notificações | `/configuracoes/notificacoes` | T4 | camada | – |
| **Sy** (nova) | `/configuracoes/sy` | T4 | inline | o acordo de atenção (quando Sy pode sugerir), horário do resumo, memória editável de prioridades declaradas ("até dezembro, priorizo a viagem"), apagar conversa |
| Meu plano | `/configuracoes/plano` | T4 | camada | UpgradeModal, ExpUpgradeModal → sheet único |

Também nesta fase, com aprovação explícita porque toca uma tela aprovada: o **onboarding** ganha um passo final curto com o acordo de atenção (padrão "quando algo importante mudar") e a pronúncia de "Sy", sem mudar o resto.

### Fase 8 · Varredura e fechamento

| Entregável | Critério |
|---|---|
| Estados vazios e de erro de todas as telas | cada protótipo tem a seção "Estados"; implementação cobre vazio, carregando, erro, sem permissão (FREE/PRO via `ProGate`) |
| Modais restantes do v3 | zero `Dialog` do shadcn nas rotas v5; só sheet/painel/inline |
| Nomes internos | `.folha`→`.sy-texto`, `.colofao`→`.rodape`, `diario*`→`meu-dia*`, `coach_briefs`→mantida (tabela, migração desnecessária), `use-diario`→`use-meu-dia`, `DiarioV5`→`MeuDia` |
| Remoção do v3 | route group `(app)` deletado, `components/{shell,coach,mobile/*}` v3 deletados, `styles/themes.css` reduzido, `dev/coach-specimens` deletado, `tokens-v3.css` arquivado |
| Assets da marca | SVG mestre, ICO/PNG, ícones iOS/Android, versão mono |
| DS v5.1 | documento consolidado com os 4 templates, inventário final de componentes, matriz tela → template → Sy → mobile |
| CLAUDE.md | reescrito para o v5 (hoje descreve o v3) |

## 5. Sequência dentro de cada fase (o ciclo, sempre igual)

1. **Lote de protótipos desktop** da fase, começando pelo hub (T1) e seguindo T2 → T3 → T4. Cada arquivo: chrome comum, peças de `shared/`, mock, seção "Estados" e seção "O que Sy lê aqui". QA do brief §8 (console 0, sem overflow, regex de palavras, sem dispositivos de revista, camada, links cruzados).
2. **Lote mobile dedicado** das mesmas telas (`<tela>.mobile.html`, 390×844). Sheets no lugar de modais; teclado testado com foco; `clamp(min, Xdvh, max)` em vez de `min(px, vh)`.
3. **Aprovação explícita** do usuário, tela a tela, pelo hub ou por artifact privado quando estiver no celular. Feedback vira rodada (r2, r3) no mesmo arquivo, com o número registrado no handoff.
4. **Implementação em `web/`**: rota no group `(app-v5)`, lógica Supabase do v3 preservada, componente v5 nunca importa componente estilizado v3, CSS da tela em arquivo próprio sob `.v5` (regra de especificidade: bump por classe repetida quando empatar com `app-v5.css`).
5. **Teste de identidade** em `next start` (nunca dev, por causa do Turbopack e do service worker): screenshot do protótipo × screenshot da rota, desktop e mobile, delta aceitável só em texto dinâmico. Login real com o usuário de QA.
6. **Deleção da rota v3** correspondente + `rm -rf .next` antes do build. Handoff e hub atualizados. Commit.

## 6. Tamanho e ordem

| Fase | Telas (D+M) | Modais → sheets | Peso | Depende de |
|---|---|---|---|---|
| 0 Fundação | 2 mobiles + 3 templates ×2 | – | M | aprovação de D e A (feita) |
| 1 Núcleo | 5 + chrome | 6 | XL | Fase 0 |
| 2 Finanças | 7 | 5 | L | Fase 1 (T1 de Finanças no ar) |
| 3 Tempo + Futuro | 11 | 5 | XL | Fase 1 |
| 4 Corpo + Mente | 12 | 7 | L | Fase 3 (Timer compartilha com Foco) |
| 5 Patrimônio + Carreira | 11 | 3 | L | Fase 1 |
| 6 Experiências + Conquistas | 9 | 6 | L | Fase 3 (viagem usa agenda e meta) |
| 7 Configurações + Sy | 8 + onboarding | 4 | M | Fase 1 |
| 8 Varredura | – | restantes | M | todas |

Total: **63 telas em desktop e mobile (as 2 já aprovadas em desktop incluídas) + 3 templates + chrome**, 36 modais convertidos. As Fases 2, 3 e 5 não dependem entre si e podem intercalar conforme o que você quiser ver primeiro; a ordem acima é a que deixa Meu dia apoiado em dados reais mais cedo.

Referência de ritmo, pelo histórico do programa: Onda 01 (6 telas D+M) levou 2 sessões de protótipo e 1 de implementação. Nesse ritmo, cada fase L leva cerca de 4 sessões de protótipo (com rodadas de feedback) e 2 de implementação.

## 7. Decisões embutidas neste plano (confirmar na aprovação)

1. **Sua semana vira tela** (`/dashboard/review`, T3), não apresentação. A encenação saiu; o fechamento continua persistindo e contando para o streak.
2. **`/corpo/coach` deixa de existir** como rota: é a camada com contexto de Corpo.
3. **`/futuro/nova` e `/futuro/novo` viram uma só** (`/novo`), com redirect.
4. **Nova rota `/configuracoes/sy`** para o acordo de atenção, horário do resumo e memória editável de prioridades. É a única tela nova do plano.
5. **Laboratório só nas 9 telas marcadas** no §4. Pedidos de novos laboratórios entram como rodada, não como regra.
6. **Tema claro no app** continua decisão aberta até a Fase 7 (Aparência). Até lá o app é escuro.
7. **Voz, gênero da voz e pronúncia de "Sy"** continuam adiados; a Fase 7 só ensina a pronúncia no onboarding em texto.

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Fase 1 inchar (Sy real + chrome + 5 telas) | Intenção composta limitada a uma; N2 persistido sem busca semântica (busca é `ilike`); chrome mobile sem FAB |
| Templates não cobrirem uma tela | A tela ganha variante do template mais próximo, nunca template novo; variante registrada no DS §6.3 |
| Laboratório virar enfeite | Regra 9 e a tabela do §4; cada laboratório tem "De onde vêm esses efeitos?" com fontes reais |
| Mobile atrasar o desktop | O lote mobile é feito logo depois do desktop, antes da aprovação; nenhuma tela é aprovada só em desktop a partir da Fase 1 |
| Regressão em `shared/` | Smoke do hub a cada mudança; D e A têm screenshot de referência |
| Mock de julho contaminar | Fase 0 re-ancora; o QA de cada protótipo compara 3 números com o mock |

## 9. Primeiro passo depois da aprovação deste plano

Fase 0, nesta ordem: `meu-dia-d.mobile.html` → `financas-a.mobile.html` → aceite → mock re-ancorado + peças extraídas para `shared/` (com diff de screenshot zero) → templates T2/T3/T4 D+M → aceite → DS e spec reescritos → hub reorganizado por fases → handoff.
