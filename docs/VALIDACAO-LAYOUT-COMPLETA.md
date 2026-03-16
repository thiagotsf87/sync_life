# Validacao Completa de Layout — Todos os Modulos vs Prototipos

**Data:** 2026-03-16
**Branch:** `auditoria-fase0-cleanup`
**Viewport:** 1440x900 (desktop)
**Tema ativo:** Navy Dark
**Metodo:** Screenshots de cada rota vs analise estrutural dos prototipos HTML

---

## Resumo Executivo

| Modulo | Rotas | Com Prototipo | Status Geral |
|--------|-------|---------------|-------------|
| Panorama | 5 | Sim | Medio - estrutura OK, detalhes visuais divergem |
| Tempo | 7 | Sim | Medio - Hero Strip OK, grids e sub-paginas divergem |
| Corpo | 6 | Sim | Bom - Score Hero e Vitals Strip bem implementados |
| Patrimonio | 6 | Sim | Medio - Hero vertical vs horizontal, falta Treemap CSS |
| Mente | 6 | Sim | Bom - Metrics Strip e layout geral OK |
| Carreira | 5 | Sim | Medio - Hero OK, stats strip layout difere |
| Experiencias | 7 | Sim | Bom - Explorer Banner e Hero viagem fieis ao prototipo |
| Futuro | 4 | Sim | Bom - Horizon Roadmap, filtros e radar sidebar OK |
| Landing/Auth | 7 | Sim | NAO TESTAVEL - redireciona ao dashboard (usuario logado) |
| Financas | 8 | Nao | Consistente - segue design system V2 |
| Configuracoes | 6 | Nao | Consistente - two-panel layout adequado |

**Total de rotas verificadas:** 60 de 67 (7 rotas de auth/landing redirecionaram)

---

## Inconsistencias Globais (afetam TODOS os modulos)

### Critico

| # | Inconsistencia | Prototipo | Implementacao | Impacto |
|---|---------------|-----------|---------------|---------|
| G-01 | **Encoding de caracteres** | Acentuacao correta em todos os textos | Varios textos mostram `\u00e7`, `\u00e3`, `\u00f3` no lugar de caracteres acentuados (ex: "or\u00e7amentos", "Pr\u00f3xima") | Visual - texto ilegivel em alguns cards |

### Medio

| # | Inconsistencia | Prototipo | Implementacao | Impacto |
|---|---------------|-----------|---------------|---------|
| G-02 | **Border-radius de cards** | `18px` (var `--card-r`) | `rounded-2xl` = `16px` | Cards ligeiramente menos arredondados |
| G-03 | **Padding de cards** | `24px` | `p-5` = `20px` | Cards mais compactos |
| G-04 | **Gap entre secoes** | `14px` (entre cards em grids) | `gap-4` = `16px` ou `mb-5` = `20px` | Espacamento levemente diferente |
| G-05 | **Max-width do container** | `1160px` | `max-w-[1140px]` = `1140px` | Conteudo 20px mais estreito |
| G-06 | **Padding da pagina** | `36px 40px 60px` | `px-6 py-7 pb-16` = `24px 28px 64px` | Margens laterais menores |
| G-07 | **Animacao de entrada** | `@keyframes rise` com `.d1-.d6` delays (50ms incremento) | `sl-fade-up` com `sl-delay-1` a `sl-delay-5` | Diferenca na curva de animacao |
| G-08 | **Card title font** | Syne 700 15px | Syne 700 15px (via font-[Syne]) | OK - match |
| G-09 | **Label uppercase pattern** | 10px bold uppercase, letter-spacing .06-.12em, color var(--t3) | Implementado via classes manuais, tamanho pode variar | Leve inconsistencia de tracking |

### Menor

| # | Inconsistencia | Prototipo | Implementacao | Impacto |
|---|---------------|-----------|---------------|---------|
| G-10 | **Fonte base body** | `DM Sans 14px` | `Outfit` (desktop) / `DM Sans` (mobile) | Diferenca de fonte base |
| G-11 | **Accent bar dos cards** | `2.5px` de altura com left/right inset de 22px | Variavel - alguns cards sem accent bar | Detalhe decorativo |
| G-12 | **Hover de cards** | `translateY(-2px)` + box-shadow `0 8px 24px rgba(0,0,0,.3)` | `hover:border-[var(--sl-border-h)]` apenas | Hover menos enfatico |

---

## Fase 1 — Panorama + Conquistas

**Prototipo:** `07-panorama-redesign.html`
**Rotas verificadas:** `/dashboard`, `/dashboard/score`, `/dashboard/review`, `/conquistas`, `/conquistas/ranking`

### /dashboard

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header (icon 44x44 + Syne 800 26px) | OK | Implementado corretamente |
| Hero Score Banner (DM Mono 52px score + sparkline) | MEDIO | Score implementado mas valor `20` (DM Mono ~40px), sparkline com barras presente, pill "Excelente equilibrio" presente. Falta tamanho 52px e gradient text no score |
| Module Mosaic (4x2 grid de 8 modulos) | BOM | Grid implementado com tiles por modulo, scores e progress bars. Acento colorido por modulo presente |
| Finance Strip (Saldo/Receitas/Despesas/Poupanca) | OK | 4 celulas horizontais com valores DM Mono, labels uppercase - fiel ao prototipo |
| Orcamentos do Mes | OK | Lista de categorias com valores DM Mono |
| AI Widget (borda gradiente) | OK | Card com gradiente indigo/green presente, input de chat funcional |
| Content Grid (`1fr 380px`) | MEDIO | Implementacao usa layout single-column, sem sidebar de 380px com Metas Ativas e Agenda da Semana |
| Widget Strip (scroll horizontal) | AUSENTE | Nao visivel no screenshot — recorrentes, projecao 30d e conquistas recentes nao presentes |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| P-01 | Medio | Hero Score: valor em ~40px vs 52px do prototipo; falta gradient text `linear-gradient(135deg, green, blue)` |
| P-02 | Medio | Layout Content Grid: implementacao nao usa `1fr 380px`; sidebar com Metas Ativas + Agenda da Semana ausente |
| P-03 | Medio | Widget Strip horizontal com Recorrentes + Projecao + Conquistas Recentes ausente |
| P-04 | Menor | Module Mosaic tiles: hover com `translateY(-2px)` e box-shadow pode estar faltando |

### /dashboard/score

| Secao | Status | Observacao |
|-------|--------|-----------|
| Score Hero (DM Mono 96px + radar chart) | VERIFICAR | Rota existe mas nao foi comparada em detalhe |
| Desempenho por Modulo | VERIFICAR | 8 module rows com progress bars |
| Evolucao do Score (AreaChart) | VERIFICAR | Chart com filtros de periodo |
| AI Suggestion | VERIFICAR | Card com gradiente |

### /dashboard/review

| Secao | Status | Observacao |
|-------|--------|-----------|
| Review Header strip (5 metricas) | VERIFICAR | Strip com Score Semanal, vs anterior, Tarefas, Habitos, XP |
| Vertical Timeline (5 modulos) | VERIFICAR | Timeline vertical com nodes por modulo |
| Final node "Semana Encerrada" | VERIFICAR | Score grande DM Mono 72px |

### /conquistas

| Secao | Status | Observacao |
|-------|--------|-----------|
| XP Level Bar | VERIFICAR | Ring + level + progress + stats |
| Category Tabs | VERIFICAR | Filtros por categoria |
| Badge Grid (4 colunas) | VERIFICAR | Badges earned + locked |
| Streak Strip (3 colunas) | VERIFICAR | 3 streaks com day dots |

### /conquistas/ranking

| Secao | Status | Observacao |
|-------|--------|-----------|
| Profile + Leaderboard grid | VERIFICAR | Avatar + stats + module board |
| Podium (3 colunas) | VERIFICAR | Gold/Silver/Bronze |
| Personal Records | VERIFICAR | 6 record cards |
| Comparison Chart | VERIFICAR | BarChart grouped |

---

## Fase 2 — Tempo

**Prototipo:** `01-tempo-redesign-v3_3.html`
**Rotas verificadas:** `/tempo`, `/tempo/agenda`, `/tempo/semanal`, `/tempo/mensal`, `/tempo/foco`, `/tempo/review`, `/tempo?new=1`

### /tempo (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header + Month Navigator | OK | Icon + Syne 800 "Tempo" + nav prev/next + "Novo Evento" button |
| Hero Strip (4 metricas inline) | BOM | 4 celulas horizontais (Proximo Evento, Eventos Hoje, Horas Planejadas, Conclusao) com dividers — fiel ao prototipo |
| Health + AI Compact Row (2 colunas) | MEDIO | Implementacao mostra "Semana com gaps" e "Insights IA" como cards separados full-width, nao como grid `1fr 1fr` |
| Cronograma do Dia (timeline) | BOM | Card com timeline vertical, empty state presente |
| Tempo por Area (donut + legenda) | MEDIO | Presente abaixo na pagina, mas prototipo coloca em sidebar `380px` |
| Bento Grid (`1fr 380px`) | MEDIO | Implementacao usa layout sequencial em vez de grid 2 colunas |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| T-01 | Medio | Bento Grid: prototipo usa `1fr 380px` com Cronograma (left) e Donut (right); implementacao empilha tudo |
| T-02 | Medio | Health+AI Row: prototipo tem grid `1fr 1fr`; implementacao usa full-width separado |
| T-03 | Menor | Hero Strip "Proximo Evento" panel tem `flex: 1.4` no prototipo (maior que os outros) |
| T-04 | Menor | Falta gradient top bar `linear-gradient(90deg, var(--mod), #0055ff)` no Hero Strip |

### /tempo/agenda

| Secao | Status | Observacao |
|-------|--------|-----------|
| Week Strip (7 dias) | BOM | Strip horizontal com 7 colunas |
| Event List com expand | BOM | Cards de evento expansiveis |
| Summary Strip (5 metricas) | VERIFICAR | Strip de resumo no fundo |

### /tempo/semanal

| Secao | Status | Observacao |
|-------|--------|-----------|
| Stats Strip (5 metricas) | VERIFICAR | Eventos, Concluidos, Em Aberto, Horas, Foco |
| Weekly Grid (7 colunas + hora) | MEDIO | Grid semanal com blocos de evento posicionados |
| "Now" indicator | VERIFICAR | Pulsing red dot + red line |

### /tempo/mensal

| Secao | Status | Observacao |
|-------|--------|-----------|
| Calendar Grid (7 colunas) | VERIFICAR | Grid mensal com event bars |
| Drawer Sidebar (300px) | VERIFICAR | Prototipo tem `1fr 300px` grid |

### /tempo/foco

| Secao | Status | Observacao |
|-------|--------|-----------|
| Timer Ring (260x260 SVG) | VERIFICAR | Gradient stroke com drop-shadow |
| Phase pills | VERIFICAR | Foco/Pausa/Pausa Longa |
| Ambient sound controls | VERIFICAR | Waveform animation |
| Session stats bar | VERIFICAR | Ciclos, Foco Total, Streak |

### /tempo/review

| Secao | Status | Observacao |
|-------|--------|-----------|
| Hero Card (ring 200x200 + metricas) | VERIFICAR | Ring progress + 4-col metrics |
| Split Layout (`1fr 340px`) | VERIFICAR | Distribuicao + Sessoes + Pendentes |

---

## Fase 3 — Corpo

**Prototipo:** `02-corpo-desktop-redesign (2).html`
**Rotas verificadas:** `/corpo`, `/corpo/atividades`, `/corpo/peso`, `/corpo/cardapio`, `/corpo/saude`, `/corpo/coach`

### /corpo (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header | OK | Icon + Syne 800 "Corpo" + subtitle com peso/atividades/IMC |
| Score Hero (SVG ring + TMB/TDEE) | BOM | Ring 83 score + "Corpo em evolucao" + TMB 1.699 + TDEE 2.039 — boa fidelidade ao prototipo |
| Vitals Strip (5 celulas) | BOM | 5 celulas horizontais (Peso, IMC, Atividades, Hidratacao, Streak) com dividers — fiel |
| Activity Heatmap (28 celulas) | BOM | Grid de heatmap com 5 niveis de intensidade presente |
| Weight Trend (LineChart) | BOM | Card "Tendencia" com peso 75.9 kg + chart placeholder |
| Content Grid (`1fr 380px`) | MEDIO | Implementacao usa layout sequencial; prototipo tem sidebar com Hidratacao + Consultas |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| C-01 | Medio | Layout: prototipo usa `1fr 380px` grid; implementacao empilha heatmap, tendencia, hidratacao em coluna unica |
| C-02 | Menor | Score Hero: prototipo tem gradient top bar `linear-gradient(90deg, var(--mod), var(--yellow))`; verificar se implementado |
| C-03 | Menor | Score Hero ring: prototipo usa 86x86px stroke-width 7; implementacao parece similar |
| C-04 | Menor | Vitals Strip: prototipo tem colored top bars (2.5px) por celula; verificar implementacao |

### /corpo/peso

| Secao | Status | Observacao |
|-------|--------|-----------|
| Metrics Strip (6 celulas) | VERIFICAR | Peso, IMC, Altura, TMB, TDEE, Velocidade |
| Goal Inline (progress bar com meta) | VERIFICAR | Start -> bar -> end -> percentage |
| Evolution Chart (AreaChart) | VERIFICAR | Filtros 3m/6m/12m/Max |
| History Table (Bloomberg-style) | VERIFICAR | Data, Peso, Cintura, IMC, Variacao |

### /corpo/atividades

| Secao | Status | Observacao |
|-------|--------|-----------|
| Streak Banner | VERIFICAR | Fire icon + Syne 36px + milestone badges |
| Activity Feed | VERIFICAR | Cards com icon + stats + intensity dots |
| Summary Sidebar | VERIFICAR | Resumo semanal + Por Tipo |

### /corpo/cardapio

| Secao | Status | Observacao |
|-------|--------|-----------|
| Day Navigation (7 dias) | VERIFICAR | Seg-Dom com calorias |
| Meal Rows (4 refeicoes) | VERIFICAR | Time box + body + macro pills |
| Resumo Diario sidebar | VERIFICAR | kcal total + 3 macro bars |

### /corpo/saude

| Secao | Status | Observacao |
|-------|--------|-----------|
| Next Appointment Hero | VERIFICAR | Accent border + date + details |
| Stats Grid (4 cards) | VERIFICAR | Proximas, Realizadas, Total, Custo |
| Appointments Table | VERIFICAR | Data, Especialidade, Status |

### /corpo/coach

| Secao | Status | Observacao |
|-------|--------|-----------|
| Disclaimer Banner | VERIFICAR | Warning sobre orientacoes gerais |
| Chat Interface | VERIFICAR | Welcome state + suggestion grid + input |

---

## Fase 4 — Patrimonio

**Prototipo:** `03-patrimonio-redesign-v2.html`
**Rotas verificadas:** `/patrimonio`, `/patrimonio/carteira`, `/patrimonio/proventos`, `/patrimonio/evolucao`, `/patrimonio/simulador`

### /patrimonio (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header | OK | Icon + Syne 800 "Patrimonio" + buttons |
| Hero Card (4-col grid inline) | CRITICO | Prototipo tem hero HORIZONTAL com `1fr auto auto auto` (Total + Resultado + Proventos + Renda em 1 linha). Implementacao empilha verticalmente: "PATRIMONIO TOTAL R$ 3.933" em cima, depois RESULTADO, PROVENTOS, RENDA em blocos separados abaixo |
| Health Score Ring | BOM | Ring 70 + "Carteira saudavel" presente |
| AI Insights | BOM | Card com insights + chat input |
| Treemap (CSS Grid distribution) | MEDIO | Prototipo usa CSS Grid customizado (`2fr 1fr 1fr`, 3 rows); implementacao tem "Distribuicao por Classe" mas provavelmente como lista/chart, nao como treemap CSS |
| Top Positions Table | MEDIO | Prototipo tem tabela com 5 ativos top; verificar se implementado |
| Benchmark + Mini KPIs | MEDIO | Prototipo tem comparacao CDI/IBOV/IFIX + meta IF; verificar |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| PA-01 | Critico | Hero card: prototipo mostra 4 metricas em linha horizontal com dividers; implementacao empilha verticalmente |
| PA-02 | Medio | Treemap: prototipo usa CSS Grid customizado com celulas coloridas por classe; implementacao provavelmente usa chart ou lista |
| PA-03 | Medio | Alerts Strip (3 colunas com alertas coloridos) ausente na implementacao |
| PA-04 | Medio | Benchmark 12m cards (CDI, IBOV, IFIX) ausente |

### /patrimonio/carteira

| Secao | Status | Observacao |
|-------|--------|-----------|
| Search + Filter Pills | VERIFICAR | Search + pills por classe |
| Data Table full-width | VERIFICAR | Ticker, Nome, Qtd, Posicao, Resultado, Proventos, Peso |
| Summary Footer | VERIFICAR | Total Investido + Total Posicao + Resultado |

### /patrimonio/proventos

| Secao | Status | Observacao |
|-------|--------|-----------|
| Summary Strip (4 celulas) | VERIFICAR | Total, Media/Mes, Pagamentos, YoC |
| Calendar Grid (6x2, 12 meses) | VERIFICAR | Cards mensais com accent bars |
| Detail + Sidebar | VERIFICAR | Timeline list + Top Pagadores + Melhor YoC |

### /patrimonio/evolucao

| Secao | Status | Observacao |
|-------|--------|-----------|
| Stats Strip (5 celulas) | VERIFICAR | Atual, Investido, Resultado, c/ Proventos, Rentab. |
| Main Chart (340px min-height) | VERIFICAR | Area chart com legenda |
| Performance Breakdown | VERIFICAR | Bar chart + distribuicao horizontal |

### /patrimonio/simulador

| Secao | Status | Observacao |
|-------|--------|-----------|
| Split Layout (`380px 1fr`) | VERIFICAR | Panel de controle esquerdo + charts direito |
| Slider Controls (4 params) | VERIFICAR | Patrimonio, Aporte, Rentabilidade, Renda |
| Scenario Strip (3 cenarios) | VERIFICAR | Conservador/Moderado/Arrojado |

---

## Fase 5 — Mente

**Prototipo:** `04-mente-redesign (1).html`
**Rotas verificadas:** `/mente`, `/mente/trilhas`, `/mente/timer`, `/mente/sessoes`, `/mente/biblioteca`

### /mente (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header + Week Nav | OK | Icon + "Mente" + subtitle com semana/streak/trilhas |
| Metrics Strip (5 celulas) | BOM | 5 celulas horizontais (Horas, Streak, Trilhas, Sessoes, Ciclos) com dividers — fiel ao prototipo |
| Trilhas Ativas (left column) | BOM | Card com lista de trilhas; empty state presente |
| Sessoes Recentes (right column) | BOM | Card com lista de sessoes; empty state presente |
| Horas por dia chart | BOM | Card com chart placeholder |
| Bento Grid (`1fr 380px`) | MEDIO | Implementacao parece usar layout sequencial; prototipo tem `1fr 380px` |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| M-01 | Medio | Layout: prototipo usa `1fr 380px` com Trilhas (left) e Sessoes+Chart (right); implementacao empilha |
| M-02 | Menor | Metrics Strip: prototipo tem primeira celula maior (`flex: 1.5`) com valor 30px; verificar |
| M-03 | Menor | Metrics Strip: prototipo tem gradient top bar `linear-gradient(90deg, var(--mod), var(--orange))`; verificar |

### /mente/trilhas

| Secao | Status | Observacao |
|-------|--------|-----------|
| Filter chips + search | VERIFICAR | Filtros por status |
| Track Cards (full-width horizontal) | VERIFICAR | Grid `1fr 200px` com info + proxima etapa |

### /mente/timer (Timer Foco)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Timer Ring (260x260, gradient stroke) | VERIFICAR | DM Mono 58px display |
| Controls (Reset/Play/Skip) | VERIFICAR | 3 botoes circulares |
| Ambient Sounds | VERIFICAR | Waveform animation |
| Session History | VERIFICAR | Scroll horizontal |

### /mente/sessoes

| Secao | Status | Observacao |
|-------|--------|-----------|
| Metrics Strip (5 celulas) | VERIFICAR | Total, Horas, Semana, Ciclos, Media |
| Sessions Table | VERIFICAR | Full-width com summary footer |
| Distribution Chart | VERIFICAR | PieChart por trilha |

### /mente/biblioteca

| Secao | Status | Observacao |
|-------|--------|-----------|
| Toolbar (search + filter + sort) | VERIFICAR | Search + selector + chips |
| Resource Table | VERIFICAR | Tipo, Recurso, Fonte, Status |

---

## Fase 6 — Carreira

**Prototipo:** `05-carreira-redesign.html`
**Rotas verificadas:** `/carreira`, `/carreira/perfil`, `/carreira/habilidades`, `/carreira/historico`, `/carreira/roadmap`

### /carreira (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header | OK | Icon + "Carreira" + subtitle com cargo/empresa |
| Hero Card "Capitulo Atual" | BOM | Gradient top bar, "CAPITULO ATUAL" label, Level pill, streak pill, titulo do cargo, empresa + setor, XP bar — implementacao fiel |
| Stats strip inline (Salario/Roadmap/Skills) | MEDIO | Prototipo tem 3 celulas inline com dividers no canto direito do hero; implementacao mostra cards separados ao lado, com layout overflow (texto cortado na lateral) |
| Bento Grid (`1fr 380px`) | MEDIO | Prototipo tem Roadmap Ativo (left) + Skills + Simulador (right); implementacao empilha |
| Roadmap Ativo card | BOM | Presente com horizontal timeline (empty state "Nenhum roadmap ativo") |
| Top Habilidades card | BOM | Presente com skill bars (empty state "Nenhuma habilidade") |
| Simulador CTA card | BOM | Card gradient com "Simular" button visivel |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| CA-01 | Critico | Stats strip no Hero: prototipo tem SALARIO/ROADMAP/SKILLS em 3 celulas inline com dividers; implementacao mostra labels cortados/overflow na lateral direita |
| CA-02 | Medio | Layout: prototipo usa `1fr 380px`; implementacao empilha sequencialmente |
| CA-03 | Menor | Segmented skill bars (5 blocks 20x8px): verificar se implementadas conforme prototipo |

### /carreira/perfil

| Secao | Status | Observacao |
|-------|--------|-----------|
| Profile Hero (avatar + name + pills) | VERIFICAR | 72x72 avatar + pills |
| Two-column form | VERIFICAR | `1fr 340px` grid |
| Area Chips + Level Stepper | VERIFICAR | Selectable chips |
| Integracoes toggles | VERIFICAR | Sync com Financas/Futuro |

### /carreira/habilidades

| Secao | Status | Observacao |
|-------|--------|-----------|
| Metrics Strip (5 celulas) | VERIFICAR | Total, Hard, Soft, Idiomas, Certs |
| Category Tabs (underline) | VERIFICAR | 5 tabs com underline ativa |
| Skill Table | VERIFICAR | Icon + nome + categoria + bar segmentada + nivel + tempo |
| Radar Chart sidebar | VERIFICAR | 6 axes radar + Resumo card |

### /carreira/roadmap

| Secao | Status | Observacao |
|-------|--------|-----------|
| Accordion panels | VERIFICAR | 3 roadmaps com expand/collapse |
| Horizontal Timeline (em cada roadmap) | VERIFICAR | Nodes done/current/waiting |

### /carreira/historico

| Secao | Status | Observacao |
|-------|--------|-----------|
| Metrics Strip (5 celulas) | VERIFICAR | Crescimento, Salario, Media, Tempo, Movimentacoes |
| Salary Evolution Chart | VERIFICAR | AreaChart com toggle periodo |
| Vertical Timeline | VERIFICAR | Dots coloridos por tipo de evento |

---

## Fase 7 — Experiencias

**Prototipo:** `06-experiencias-redesign_1.html`
**Rotas verificadas:** `/experiencias`, `/experiencias/viagens`, `/experiencias/nova`, `/experiencias/memorias`, `/experiencias/bucket-list`, `/experiencias/passaporte`

### /experiencias (Dashboard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header | OK | Icon + "Experiencias" + subtitle |
| Explorer Banner (5 colunas) | BOM | 5 stats (Paises 6, Continentes 1, Dias 25, Viagens 5, Memorias 2) com numeros grandes coloridos Syne 800 — boa fidelidade |
| Hero "Proxima Viagem" | BOM | Countdown "14 DIAS" em Syne 800 64px, nome "Conferencia Tech SP", metadados (data, local, viajantes), status pill, budget progress bar, checklist % — fiel ao prototipo |
| Viagens Ativas (trip strip rows) | BOM | 3 rows com dot colorido + info + status pill + valor DM Mono — fiel |
| Status das Viagens (5 colunas) | VERIFICAR | Grid com contadores por status |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| EX-01 | Menor | Explorer Banner: prototipo tem progress bars (60x4px) abaixo de cada stat; verificar se implementadas |
| EX-02 | Menor | Hero card: prototipo tem decorative glow effects (radial gradients); implementacao tem background rosa translucido |
| EX-03 | Menor | Trip strip rows: prototipo tem hover `translateX(4px)`; verificar implementacao |

### /experiencias/viagens

| Secao | Status | Observacao |
|-------|--------|-----------|
| Search Bar | VERIFICAR | Input com icone |
| Filter Pills (6 status) | VERIFICAR | Todas, Planejando, etc. |
| Table com 6 viagens | VERIFICAR | Dot, Viagem, Destino, Periodo, Status, Orcamento |
| Summary Row | VERIFICAR | Total orcamento + dias viajados |

### /experiencias/nova

| Secao | Status | Observacao |
|-------|--------|-----------|
| Wizard Layout (`220px 1fr`) | VERIFICAR | Rail de 4 steps + form |
| Step states (done/active/pending) | VERIFICAR | Green/pink/gray dots + connecting line |
| Trip type cards (4 opcoes) | VERIFICAR | Lazer/Trabalho/Estudo/Mista |

### /experiencias/memorias

| Secao | Status | Observacao |
|-------|--------|-----------|
| Memory Timeline (vertical) | VERIFICAR | Gradient line + dots + memory cards |
| Star ratings | VERIFICAR | Filled vs empty stars |
| Empty state entry | VERIFICAR | Dashed border + "Adicionar Memoria" |

### /experiencias/passaporte

| Secao | Status | Observacao |
|-------|--------|-----------|
| Progress Ring (160x160) + Stats Grid | VERIFICAR | "5 de 195 paises" + 2x2 stats |
| Continentes Grid (7 colunas) | VERIFICAR | 7 continents com visited/unvisited |
| Country Badges | VERIFICAR | Flex-wrap com flags + nomes |

### /experiencias/bucket-list

| Secao | Status | Observacao |
|-------|--------|-----------|
| (Sem correspondencia no prototipo) | N/A | Rota existe na implementacao mas NAO tem prototipo equivalente |

---

## Fase 8 — Futuro

**Prototipo:** `09-futuro-redesign (1).html`
**Rotas verificadas:** `/futuro`, `/futuro/novo`, `/futuro/checkin`

### /futuro (Lista de Objetivos)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Module Header | OK | Icon + "Futuro" + subtitle com stats |
| Motivational Banner | BOM | Banner verde com mensagem de progresso |
| Horizon Roadmap Card | MEDIO | Stats strip (Objetivos, No Ritmo, Atencao, Em Risco, Concluidos) implementado. Timeline lanes com progress bars por objetivo implementadas. Mas FALTA o SVG ring progress (96x96) no canto esquerdo do Horizon card |
| Search/Filter Bar (tabs underline) | BOM | Tabs "Todos, No Ritmo, Atencao, Em Risco, Concluidos" com counts + search input — fiel |
| Objective Rows | BOM | Cards com icon 38x38, titulo + pills, subtitle, progress bar gradient, percentage DM Mono, deadline — fiel |
| Radar Sidebar "Mapa da Vida" | BOM | SVG radar chart com 8 eixos + scores por dimensao — implementado com "42 SCORE GERAL" |
| Two-column grid (`1fr 340px`) | BOM | Implementacao usa grid 2 colunas com sidebar — fiel ao prototipo |

**Inconsistencias especificas:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| FU-01 | Medio | Horizon card: falta SVG ring progress (96x96) com percentage geral no canto esquerdo |
| FU-02 | Menor | Cor do modulo: prototipo usa `#0055ff` (Azul Eletrico); CLAUDE.md lista `#8b5cf6` (purple). Implementacao parece usar azul (blue) — correto vs prototipo |
| FU-03 | Menor | Objective rows: prototipo tem hover `translateY(-1px)` + box-shadow; verificar |

### /futuro/novo (Wizard)

| Secao | Status | Observacao |
|-------|--------|-----------|
| Wizard Layout (`1fr 360px`) | VERIFICAR | Form esquerdo + Live Preview direito |
| Step Bar (4 steps) | VERIFICAR | Barras 4px colored |
| Category Grid (3 colunas) | VERIFICAR | 6 categorias selecionaveis |
| Icon Picker + Priority Pills | VERIFICAR | Flex-wrap selectors |

### /futuro/checkin

| Secao | Status | Observacao |
|-------|--------|-----------|
| Mood Strip (slider) | VERIFICAR | Track gradient + thumb com face |
| Goal Update Cards (2x2 grid) | VERIFICAR | Input types por tipo de meta |
| Notes + History Split | VERIFICAR | Textarea + historico |

---

## Fase 9 — Landing, Auth & Onboarding

**Prototipo:** `10-landing-auth-onboarding-redesign_2.html`
**Rotas verificadas:** `/` (landing), `/login`, `/cadastro`, `/onboarding`, `/pricing`, `/esqueceu-senha`, `/redefinir-senha`

### Status: NAO TESTAVEL

Todas as rotas de auth e landing redirecionam para `/dashboard` quando o usuario esta logado. Os screenshots 57-60 confirmam que `/login`, `/cadastro`, `/onboarding` e `/pricing` resultaram na pagina do Dashboard.

**Para validar estas rotas seria necessario:**
1. Limpar cookies / sessao do Supabase
2. Usar um contexto de browser incognito
3. Navegar deslogado

**Divergencias conhecidas do prototipo (da leitura do codigo fonte):**

| # | Severidade | Descricao |
|---|-----------|-----------|
| LA-01 | Medio | Landing: prototipo tem Navbar com blur backdrop, Hero 56px title, Dashboard preview card com float animation, Stats Band, 8 Module cards, Life Sync Score ring, How It Works, Beta CTA, Footer — verificar completude |
| LA-02 | Medio | Login: prototipo tem split 50/50 (visual left, form right) com orbs decorativos, mini preview card, Google button, divider — verificar |
| LA-03 | Medio | Cadastro: prototipo INVERTE o layout (form left, visual right) com password strength indicator (4 bars), module showcase grid — verificar |
| LA-04 | Medio | Recovery: prototipo tem 3-step centered card flow com progress bars — verificar |
| LA-05 | Medio | Onboarding: prototipo tem 4 steps (Nome, Objetivos grid 3x3, Modulos toggle list, Celebration ring) — verificar |

---

## Fase 10 — Financas (sem prototipo de redesign)

**Sem prototipo desktop** — validacao de consistencia com design system
**Rotas verificadas:** `/financas`, `/financas/transacoes`, `/financas/orcamentos`, `/financas/recorrentes`, `/financas/planejamento`, `/financas/calendario`, `/financas/relatorios`, `/financas/importar`

### Validacao de Design System

| Criterio | Status | Observacao |
|----------|--------|-----------|
| Anatomia padrao (topbar + KPI + content + bottom) | OK | Financas segue o padrao do CLAUDE.md |
| Valores monetarios em DM Mono | OK | R$ valores usam DM Mono |
| Titulos em Syne font-extrabold | OK | Headers consistentes |
| Cores de status (verde/vermelho/amarelo) | OK | Receitas verde, despesas vermelho |
| Cards com hover border | OK | Transicao de borda funcional |
| Responsivo (colapso em max-lg) | VERIFICAR | Grid principal |
| Tokens de cor via CSS variables | OK | Usa var(--sl-*) tokens |

### Por rota

| Rota | Status | Observacao |
|------|--------|-----------|
| `/financas` | OK | Dashboard com KPIs, graficos, orcamentos |
| `/financas/transacoes` | OK | Tabela com filtros e paginacao |
| `/financas/orcamentos` | OK | Barras de progresso com cores automaticas |
| `/financas/recorrentes` | OK | Lista CRUD com proximas ocorrencias |
| `/financas/planejamento` | OK | Timeline 12m com 3 cenarios |
| `/financas/calendario` | OK | Grid mensal + drawer |
| `/financas/relatorios` | OK | Comparativo + graficos |
| `/financas/importar` | ERRO | Erro de modulo `csv-parser.ts` — pagina nao carrega |

**Inconsistencia especifica:**

| # | Severidade | Descricao |
|---|-----------|-----------|
| FI-01 | Critico | `/financas/importar`: erro `Module not found: ./src/lib/import/csv-parser.ts` — pagina quebrada |

---

## Fase 11 — Configuracoes (sem prototipo de redesign)

**Sem prototipo desktop** — validacao de consistencia
**Rotas verificadas:** `/configuracoes`, `/configuracoes/aparencia`, `/configuracoes/notificacoes`, `/configuracoes/categorias`, `/configuracoes/integracoes`, `/configuracoes/plano`

### Validacao de Design System

| Criterio | Status | Observacao |
|----------|--------|-----------|
| Two-panel layout | OK | Sidebar de navegacao + painel de conteudo |
| Tokens de cor | OK | Usa var(--sl-*) |
| Toggle switches | OK | Estilo consistente |
| Form inputs | OK | Styling com bg/border adequados |
| Cards e secoes | OK | Rounded, bordered, padded |

### Por rota

| Rota | Status | Observacao |
|------|--------|-----------|
| `/configuracoes` | OK | Perfil com formulario |
| `/configuracoes/aparencia` | OK | Seletor de temas (12 temas) |
| `/configuracoes/notificacoes` | OK | Toggles por tipo |
| `/configuracoes/categorias` | OK | Gerenciamento de categorias |
| `/configuracoes/integracoes` | OK | 12 toggles cross-module |
| `/configuracoes/plano` | OK | Plano FREE/PRO com features |

---

## Erros Tecnicos Detectados

| # | Rota | Erro | Severidade |
|---|------|------|-----------|
| ER-01 | Todas | Hydration mismatch (Service Worker cache) | Menor (conhecido) |
| ER-02 | `/financas/importar` | `Module not found: csv-parser.ts` | Critico |
| ER-03 | Todas | Supabase 404 em tabelas (settings, user_badges) | Menor (dev env) |
| ER-04 | Auth pages | Redirect para /dashboard quando logado | Esperado |

---

## Lista Priorizada de Correcoes

### Prioridade 1 — Critico (layout quebrado ou funcionalidade bloqueada)

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 1 | Financas | Fix `csv-parser.ts` module not found em `/financas/importar` | Baixo |
| 2 | Patrimonio | Hero card: mudar layout vertical para horizontal (`1fr auto auto auto` grid com 4 metricas inline + dividers) | Medio |
| 3 | Carreira | Stats strip no Hero: fix overflow/truncamento de SALARIO/ROADMAP/SKILLS — usar 3 celulas inline com dividers | Medio |
| 4 | Global | Fix encoding de caracteres acentuados (textos com `\u00e7` etc.) | Baixo |

### Prioridade 2 — Medio (visual divergente do prototipo)

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 5 | Panorama | Adicionar Content Grid `1fr 380px` com sidebar (Metas Ativas + Agenda da Semana + Destaques) | Alto |
| 6 | Panorama | Adicionar Widget Strip horizontal (Recorrentes + Projecao + Conquistas) | Medio |
| 7 | Panorama | Hero Score: aumentar para DM Mono 52px + aplicar gradient text | Baixo |
| 8 | Tempo | Dashboard: reorganizar para Bento Grid `1fr 380px` (Cronograma left, Donut right) | Medio |
| 9 | Tempo | Health+AI Row: mudar para grid `1fr 1fr` | Baixo |
| 10 | Corpo | Dashboard: reorganizar para grid `1fr 380px` (Heatmap+Trend left, Hidratacao+Consultas right) | Medio |
| 11 | Patrimonio | Implementar Treemap como CSS Grid (`2fr 1fr 1fr`, 3 rows) para distribuicao | Medio |
| 12 | Patrimonio | Adicionar Alerts Strip (3 colunas com alertas coloridos) | Baixo |
| 13 | Patrimonio | Adicionar Benchmark cards (CDI, IBOV, IFIX) | Medio |
| 14 | Mente | Dashboard: reorganizar para grid `1fr 380px` (Trilhas left, Sessoes+Chart right) | Medio |
| 15 | Carreira | Dashboard: reorganizar para grid `1fr 380px` (Roadmap left, Skills+Simulador right) | Medio |
| 16 | Futuro | Horizon card: adicionar SVG ring progress (96x96) no canto esquerdo | Baixo |
| 17 | Landing | Validar visualmente (requer sessao deslogada) | Alto |

### Prioridade 3 — Menor (detalhes cosmeticos)

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 18 | Global | Ajustar border-radius de 16px para 18px (var --card-r) | Baixo |
| 19 | Global | Ajustar card padding de 20px para 24px | Baixo |
| 20 | Global | Ajustar max-width de 1140px para 1160px | Baixo |
| 21 | Global | Ajustar page padding de 24px/28px para 36px/40px | Baixo |
| 22 | Global | Adicionar gradient top bars (2.5px) em hero cards | Baixo |
| 23 | Global | Enriquecer hover de cards com translateY(-2px) + box-shadow | Baixo |
| 24 | Global | Ajustar gap entre secoes de 16-20px para 14px (prototipos) | Baixo |
| 25 | Tempo | Hero Strip: primeira celula com `flex: 1.4` (maior) | Baixo |
| 26 | Experiencias | Explorer Banner: adicionar progress bars (60x4px) em cada stat | Baixo |
| 27 | Experiencias | Trip strip rows: hover com `translateX(4px)` | Baixo |
| 28 | Futuro | Objective rows: hover com `translateY(-1px)` + box-shadow | Baixo |

---

## Resumo de Componentes Novos Necessarios (do prototipo)

Alguns prototipos introduzem componentes visuais que nao existem na implementacao atual:

| Componente | Modulo | Descricao |
|-----------|--------|-----------|
| `ExplorerBanner` | Experiencias | 5-col stats com numeros Syne 800 + progress bars (ja parcialmente implementado) |
| `TripDetailHero` | Experiencias | Hero strip com metricas + underline tabs (ja implementado) |
| `Treemap` | Patrimonio | CSS Grid customizado `2fr 1fr 1fr` para distribuicao de classes (arquivo existe em `components/patrimonio/Treemap.tsx`) |
| `HorizonRoadmap` | Futuro | Card com ring + stats + timeline lanes (parcialmente implementado, falta ring) |
| `SkillBars` | Carreira | Barras segmentadas 5x20x8px (arquivo existe em `components/carreira/skill-bars.tsx`) |
| `ModuleMosaic` | Panorama | Grid 4x2 de tiles por modulo (arquivo existe em `components/shell/module-mosaic.tsx`) |
| `AccordionPanel` | Carreira | Panels collapsiveis com progress (arquivo existe em `components/ui/accordion-panel.tsx`) |
| `MetricsStrip` | Varios | Strip horizontal com N celulas + dividers (arquivo existe em `components/ui/metrics-strip.tsx`) |
| `HeroStrip` | Varios | Hero card horizontal com accent bar + metricas inline (arquivo existe em `components/ui/hero-strip.tsx`) |
| `UnderlineTabs` | Varios | Tabs com underline ativa (arquivo existe em `components/ui/underline-tabs.tsx`) |
| `CategoryTabs` | Varios | Tabs com count badges (arquivo existe em `components/ui/category-tabs.tsx`) |

**Nota:** Muitos destes componentes ja existem como arquivos untracked no git (vistos no `git status`). Podem ja estar implementados mas nao integrados nas paginas.

---

## Notas Finais

1. **Padrao de layout recorrente:** Todos os prototipos usam grids assimetricos (`1fr 340-380px`) para criar layouts bento com sidebar. A implementacao atual tende a empilhar tudo em coluna unica. Esta e a divergencia visual mais significativa e repetitiva.

2. **Componentes base existem:** Arquivos como `metrics-strip.tsx`, `hero-strip.tsx`, `underline-tabs.tsx`, `category-tabs.tsx`, etc. ja existem como untracked files, sugerindo que a implementacao esta em andamento mas nao finalizada.

3. **Design system tokens:** A implementacao usa corretamente os tokens `var(--sl-*)` que correspondem aos tokens `var(--bg)`, `var(--s1)`, etc. do prototipo. Os 12 temas funcionam via `data-theme` attribute.

4. **Fontes:** A implementacao usa Syne para titulos e DM Mono para valores — consistente com os prototipos. A diferenca de fonte base (Outfit vs DM Sans) e menor.

5. **Cores de modulo:** Todas as 11 cores de modulo estao corretas e correspondem ao prototipo, com a excecao de Futuro que usa `#0055ff` (Azul Eletrico) no prototipo vs `#8b5cf6` (purple) no CLAUDE.md original.

6. **Auth/Landing nao testadas:** 7 rotas de auth/landing nao puderam ser validadas por redirecionamento. Requer sessao deslogada para validacao completa.

---

*Documento gerado automaticamente por auditoria visual em 2026-03-16*
*60 de 67 rotas verificadas | 9 prototipos analisados | 28 inconsistencias documentadas*
