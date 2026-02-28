# QA — Validação de Homologação
> SyncLife MVP V3 · Fases 1–13 + Sistema de Temas V3
> Ambiente: `homologacao` branch → Vercel preview
> Última atualização: 28 Fev 2026

---

## Como usar este documento

1. Abra o app no ambiente de homologação
2. Execute cada item marcando ✅ (passou), ❌ (falhou) ou ⚠️ (parcial)
3. Para falhas, anote o comportamento esperado vs. observado na coluna "Observação"
4. Repita os testes visuais nos **9 temas × 2 modos** (18 combinações). Prioridade: Navy Dark + Clean Light + Obsidian + Sahara em ambos os modos

---

## PRÉ-REQUISITO — Setup de Banco

> ✅ **Validado em 25/02/2026 via Management API** — homolog e prod verificados programaticamente.

### Migrações

| Arquivo | Homolog | Prod |
|---------|---------|------|
| `web/supabase/schema.sql` — schema base | ✅ | ✅ |
| `001_mvp_v2.sql` — Fase 1 | ✅ | ✅ |
| `002_fase2_financas.sql` — Fase 2 | ✅ | ✅ |
| `003_fase3_metas.sql` — Fase 3 | ✅ | ✅ |
| `004_fase4_agenda.sql` — Fase 4 | | |
| `005_fase6_infra_v3.sql` — Fase 6 (31 tabelas V3) | | |
| `007_futuro_migracao.sql` — Goals V2 → Objectives V3 | | |
| `008_link_objectives.sql` — Links objectives/tracks/roadmaps | | |
| `009_corpo_storage.sql` — Storage corpo-files | | |
| `010_temas_modos_v3.sql` — Temas V3 + modo foco/jornada constraints | ✅ | ✅ |
| `011_add_3_new_themes.sql` — Adiciona graphite, twilight, sahara | ✅ | ✅ |

### Seed — Homolog (`001_seed_homolog.sql`)

| Tabela | Esperado | Encontrado | Status |
|--------|----------|------------|--------|
| `categories` | 14 | 14 | ✅ |
| `recurring_transactions` | 12 | 12 | ✅ |
| `transactions` | ~65 | 79 | ✅ |
| `budgets` | 11 | 11 | ✅ |
| `planning_events` | 7 | 7 | ✅ |
| `goals` | 4 | 4 | ✅ aplicado em 25/02/2026 |
| `goal_contributions` | 22 | 22 | ✅ aplicado em 25/02/2026 |
| `goal_milestones` | 16 | 16 | ✅ aplicado em 25/02/2026 |

> **Nota:** o QA doc original indicava 13 recorrentes — o seed tem 12 (12 inserções confirmadas no banco). Número corrigido acima.

---

## BLOCO 0 — Shell e Navegação

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 0.1 | ModuleBar visível (72px) | 11 ícones: panorama, finanças, futuro, tempo, corpo, mente, patrimônio, carreira, experiências, conquistas, configs | | |
| 0.2 | ModuleBar divisórias visíveis | 4 separadores horizontais entre grupos de módulos, visíveis em todos os 9 temas | | |
| 0.3 | Sidebar aparece ao clicar módulo | 228px, navItems do módulo ativo | | |
| 0.4 | Trocar modo Foco → Jornada (ModePill) | `data-mode` alterna no `<html>`, componentes `.jornada-only` aparecem | | |
| 0.5 | Trocar tema (ThemePill → Aparência) | `data-theme` e `data-scheme` atualizam, tokens CSS mudam | | |
| 0.6 | 9 temas renderizam corretamente | Navy Dark, Clean Light, Mint Garden, Obsidian, Rosewood, Arctic, Graphite, Twilight, Sahara | | |
| 0.7 | Tema `system` segue OS | Dark OS → Navy Dark, Light OS → Clean Light | | |
| 0.8 | Anti-FOUC funciona | Sem flash de tema errado no reload (script inline aplica antes do paint) | | |
| 0.9 | Tema e modo persistidos após reload | localStorage + Supabase sync | | |
| 0.10 | Sidebar fecha em mobile | Overlay cobre conteúdo, X fecha | | |
| 0.11 | TopHeader breadcrumb (Foco) | Mostra caminho atual Ex.: Finanças › Transações | | |
| 0.12 | TopHeader saudação (Jornada) | "Boa tarde, [nome]!" | | |
| 0.13 | Life Sync Score visível na Sidebar (Jornada) | Score numérico com gradiente | | |

---

## BLOCO 1 — Auth e Onboarding

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 1.1 | Cadastro com email/senha | Conta criada, redireciona para onboarding | | |
| 1.2 | Onboarding completo (5 passos) | Dados salvos no perfil, redireciona para home | | |
| 1.3 | Login com conta criada | Redireciona para dashboard | | |
| 1.4 | Logout | Sessão encerrada, redireciona para login | | |
| 1.5 | Recuperação de senha | Email enviado, link funciona | | |
| 1.6 | Rota protegida sem login | Redireciona para /login | | |
| 1.7 | Persistência de sessão | Reload mantém o usuário logado | | |

---

## BLOCO 2 — Configurações

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 2.1 | Perfil: editar nome e foto | Salva e reflete no TopHeader | | |
| 2.2 | Aparência: grid de 3 temas FREE | Navy Dark, Clean Light, Mint Garden — selecionáveis | | |
| 2.3 | Aparência: grid de 6 temas PRO | Obsidian, Rosewood, Arctic, Graphite, Twilight, Sahara — lock para FREE | | |
| 2.4 | Aparência: tema System/Auto | Segue preferência do OS | | |
| 2.5 | Aparência: PRO gate para temas | Clique em tema PRO (user FREE) abre UpgradeModal | | |
| 2.6 | Aparência: modo Foco/Jornada cards | Dois cards, Jornada com badge PRO | | |
| 2.7 | Aparência: PRO gate para Jornada | Clique em Jornada (user FREE) abre UpgradeModal | | |
| 2.8 | Aparência: toast de confirmação | "Tema X aplicado" / "Modo X ativado" com animação | | |
| 2.9 | Aparência: tema persiste no Supabase | Reload mantém tema escolhido | | |
| 2.10 | Notificações: toggles salvam | Preferências persistidas | | |
| 2.11 | Categorias: criar categoria | Aparece nas transações | | |
| 2.12 | Categorias: editar/excluir | Funciona sem quebrar transações existentes | | |
| 2.13 | Plano: exibe plano atual | Free exibido com CTA para upgrade | | |

---

## BLOCO 3 — Finanças: Dashboard

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 3.1 | KPIs corretos para o mês | Receitas / Despesas / Saldo / Economia calculados | | |
| 3.2 | Gráfico Fluxo de Caixa | 28 dias visíveis, hoje em verde, eixo X legível | | |
| 3.3 | Gráfico de categorias | Pizza ou barras com top despesas | | |
| 3.4 | Lista de transações recentes | Últimas 5–10 do mês atual | | |
| 3.5 | Navegação entre meses | Setas < > trocam mês, KPIs atualizam | | |
| 3.6 | JornadaInsight presente | Oculto no Foco, visível no Jornada | | |
| 3.7 | Bottom card alterna por modo | Foco: histórico · Jornada: conquistas | | |

---

## BLOCO 4 — Finanças: Transações

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 4.1 | Listar transações do mês | Paginação, total correto | | |
| 4.2 | Criar transação (receita) | Aparece na lista, KPIs atualizam | | |
| 4.3 | Criar transação (despesa) | Idem | | |
| 4.4 | Editar transação | Valores atualizados, data e categoria preservadas | | |
| 4.5 | Excluir transação | Removida da lista, KPIs recalculados | | |
| 4.6 | Filtro por tipo (receita/despesa/recorrente) | Lista filtrada corretamente | | |
| 4.7 | Filtro por categoria | Apenas transações da categoria selecionada | | |
| 4.8 | Busca por descrição | Filtra em tempo real (debounce 300ms) | | |
| 4.9 | Ordenação (mais recente/valor) | Lista reordena | | |
| 4.10 | Transação futura | Badge "Futuro" visível | | |

---

## BLOCO 5 — Finanças: Orçamentos

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 5.1 | Listar orçamentos do mês | Barras de progresso com % e valor | | |
| 5.2 | Cor da barra correta | ≤70% verde · 70–85% amarelo · >85% vermelho | | |
| 5.3 | Criar orçamento | Aparece na lista | | |
| 5.4 | Editar orçamento | Valor e categoria atualizados | | |
| 5.5 | Excluir orçamento | Removido da lista | | |
| 5.6 | Alerta ao ultrapassar limite | Badge/destaque em vermelho | | |
| 5.7 | Progresso calculado a partir das transações | % = gasto real / limite | | |

---

## BLOCO 6 — Finanças: Recorrentes

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 6.1 | Listar recorrentes | Agrupados por frequência | | |
| 6.2 | Criar recorrente | Aparece na lista com próximas datas | | |
| 6.3 | Editar recorrente | Dados atualizados | | |
| 6.4 | Pausar/reativar recorrente | Status altera, badge muda | | |
| 6.5 | Excluir recorrente | Removido da lista | | |
| 6.6 | Próximas ocorrências | Datas calculadas corretamente (mensal, semanal, etc.) | | |

---

## BLOCO 7 — Finanças: Planejamento

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 7.1 | Timeline exibe 6 meses futuros | Eventos posicionados no mês correto | | |
| 7.2 | 3 cenários (otimista/realista/pessimista) | Linhas distintas, cores corretas | | |
| 7.3 | Linha de saldo fina | Não sobrescreve os cenários | | |
| 7.4 | Eixos do gráfico legíveis | Meses no eixo X, valores no eixo Y | | |
| 7.5 | Criar evento de planejamento | Aparece na timeline no mês correto | | |
| 7.6 | Editar/excluir evento | Funciona sem erro | | |

---

## BLOCO 8 — Finanças: Calendário

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 8.1 | Grid mensal renderiza | 28–31 dias do mês atual | | |
| 8.2 | Dia com transação tem indicador | Dot colorido (verde/vermelho) | | |
| 8.3 | Clicar no dia abre drawer | Lista de transações daquele dia | | |
| 8.4 | Navegação entre meses | Mês anterior/próximo | | |
| 8.5 | Hoje destacado | Dia atual com borda ou fundo | | |

---

## BLOCO 9 — Finanças: Relatórios

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 9.1 | Comparativo de períodos | Mês atual vs. anterior | | |
| 9.2 | Gráfico de evolução | Linha de receita e despesa por mês | | |
| 9.3 | Gráfico por categoria | Barras horizontais ou pizza | | |
| 9.4 | Exportar CSV | Download gerado com dados corretos | | |
| 9.5 | Filtrar por período | 3m, 6m, 12m — dados mudam | | |

---

## BLOCO 10 — Futuro: Lista `/futuro`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 10.1 | KPIs corretos | Total / Ativas / Concluídas / Total guardado | | |
| 10.2 | Grid de MetaCards | 2 colunas, RingProgress animado | | |
| 10.3 | Cor do anel por progresso/prazo | Verde gradiente (no ritmo) · Amarelo (atenção) · Vermelho (risco) | | |
| 10.4 | Filtro por status | Todas / Ativas / Concluídas / Pausadas | | |
| 10.5 | Tip Jornada no card | Oculto no Foco, visível no Jornada | | |
| 10.6 | Botão "+ Registrar Aporte" no card | Abre AddContributionModal | | |
| 10.7 | Link "Ver detalhe →" | Navega para `/metas/[id]` | | |
| 10.8 | Botão editar card | Abre MetaModal no modo edit | | |
| 10.9 | Botão excluir card | Confirma e remove | | |
| 10.10 | Estado vazio | Ilustração + CTA "Criar Primeira Meta" | | |
| 10.11 | SimuladorAportes — slider | Slider altera valor e recalcula 4 cenários | | |
| 10.12 | SimuladorAportes — seletor de meta | Troca a meta e recalcula | | |
| 10.13 | Sidebar Foco: Resumo Global | Valores de totalSaved, totalTarget, progress | | |
| 10.14 | Sidebar Jornada: Conquistas | Lista metas concluídas com data | | |
| 10.15 | JornadaInsight | Oculto no Foco, visível no Jornada com texto contextual | | |

---

## BLOCO 11 — Futuro: Wizard `/futuro/nova`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 11.1 | Wizard abre ao acessar a rota | MetaModal aparece automaticamente | | |
| 11.2 | Passo 1 — Identidade | Nome, descrição, ícone (grid), categoria selecionável | | |
| 11.3 | Validação: nome obrigatório | Erro inline ao clicar Próximo sem preencher | | |
| 11.4 | Passo 2 — Alvo | Valor-alvo, já possuo, data início, prazo | | |
| 11.5 | Validação: valor inválido | Erro inline ao informar valor zero ou vazio | | |
| 11.6 | Passo 3 — Estratégia | Aporte mensal + preview de projeção + observações | | |
| 11.7 | Preview de projeção no passo 3 | Atualiza em tempo real ao digitar aporte | | |
| 11.8 | Passo 4 — Revisão | Resumo de todos os campos preenchidos | | |
| 11.9 | Botão "Anterior" retorna ao passo anterior | Dados preservados | | |
| 11.10 | Criar meta | Salva no banco, milestones 25/50/75/100 criados | | |
| 11.11 | Redireciona para `/metas` após criar | Novo card aparece na lista | | |
| 11.12 | Fechar wizard | Redireciona para `/metas` sem salvar | | |

---

## BLOCO 12 — Futuro: Detalhe `/futuro/[id]`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12.1 | MetaDetailHero carrega | Anel animado, stats corretos | | |
| 12.2 | Anel tamanho 120px com progresso | stroke-dashoffset animado no mount | | |
| 12.3 | Prazo e projeção exibidos | Datas formatadas, dias restantes | | |
| 12.4 | Frase motivacional (Jornada) | Oculta no Foco, visível no Jornada | | |
| 12.5 | Registrar aporte | AddContributionModal abre, salva, current_amount atualiza | | |
| 12.6 | Aporte atinge 100% | Status muda para "completed", anel fica verde | | |
| 12.7 | Histórico de aportes | Lista cronológica com data e valor | | |
| 12.8 | Estado vazio de aportes | Mensagem + link para registrar | | |
| 12.9 | MilestoneTimeline | 4 marcos ordenados, dot verde nos alcançados | | |
| 12.10 | Marco marcado automaticamente | Após aporte cruzar 25/50/75/100% | | |
| 12.11 | Botão Editar | MetaModal abre com dados preenchidos | | |
| 12.12 | Pausar meta | Status muda para "paused", badge aparece | | |
| 12.13 | Reativar meta pausada | Status volta para "active" | | |
| 12.14 | Arquivar meta | Status muda para "archived" | | |
| 12.15 | Excluir meta | Confirmação → redireciona para `/metas` | | |
| 12.16 | Botão "← Voltar" | Retorna para `/metas` | | |
| 12.17 | JornadaInsight contextual | Texto muda conforme % de progresso | | |

---

## BLOCO 12A — Módulo Corpo `/corpo`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12A.1 | Dashboard Corpo | KPIs de peso, atividades, saúde | | |
| 12A.2 | Peso: registrar pesagem | Salva no banco, gráfico atualiza | | |
| 12A.3 | Peso: gráfico de evolução | LineChart com medidas ao longo do tempo | | |
| 12A.4 | Atividades: registrar treino | MET × duração calcula calorias | | |
| 12A.5 | Saúde: registrar consulta | Dados salvos, lista atualiza | | |
| 12A.6 | Cardápio IA (Jornada) | Gemini gera cardápio personalizado | | |

---

## BLOCO 12B — Módulo Mente `/mente`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12B.1 | Trilhas de estudo | Lista de tracks com progresso | | |
| 12B.2 | Timer Pomodoro | 25min trabalho, 5min pausa, ciclos | | |
| 12B.3 | Biblioteca | Lista de itens (livros, cursos, artigos) | | |
| 12B.4 | Sessão registrada | Track session salva com duração | | |

---

## BLOCO 12C — Módulo Patrimônio `/patrimonio`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12C.1 | Dashboard Patrimônio | KPIs de patrimônio total, proventos | | |
| 12C.2 | Carteira: adicionar ativo | Salva, recalcula totais | | |
| 12C.3 | Carteira: PieChart por setor | Agrupamento correto | | |
| 12C.4 | Proventos: registrar dividendo | Salva com data e valor | | |
| 12C.5 | Simulador IF | Campos de aporte/rentabilidade/prazo funcionam | | |

---

## BLOCO 12D — Módulo Carreira `/carreira`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12D.1 | Habilidades: lista de skills | Grid com cards de skill | | |
| 12D.2 | Habilidades: adicionar/editar | Modal funciona, salva no banco | | |
| 12D.3 | Roadmap: timeline de steps | Steps ordenados com progresso | | |
| 12D.4 | Promoções: registrar promoção | Salva com salário e data | | |

---

## BLOCO 12E — Módulo Experiências `/experiencias`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12E.1 | Lista de viagens | TripCards com status e datas | | |
| 12E.2 | Nova viagem | Wizard de criação funciona | | |
| 12E.3 | Detalhe: 6 abas | Overview, itinerário, orçamento, checklist, hospedagem, transporte | | |
| 12E.4 | IA viagem (Jornada) | Gemini sugere roteiros | | |

---

## BLOCO 12F — Módulo Tempo `/tempo`

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 12F.1 | Vista semanal | 7 dias com eventos posicionados | | |
| 12F.2 | Vista mensal | Grid do mês com indicadores | | |
| 12F.3 | Criar evento | Modal funciona, salva, aparece na agenda | | |
| 12F.4 | Editar/excluir evento | Funciona sem erro | | |

---

## BLOCO 13 — Responsividade

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 13.1 | KPI Strip em mobile | 2 colunas (`max-sm:grid-cols-2`) | | |
| 13.2 | Grid principal em tablet | 1 coluna (`max-lg:grid-cols-1`) | | |
| 13.3 | MetaCards em mobile | 1 coluna | | |
| 13.4 | Sidebar do app fecha em mobile | Overlay funciona | | |
| 13.5 | Modais em mobile | Ocupam tela inteira, scroll interno | | |
| 13.6 | Gráficos em mobile | Não transbordam, tooltip funciona | | |

---

## BLOCO 14 — Design System e Temas

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 14.1 | Fontes carregadas | Syne (títulos), DM Mono (valores), Outfit (body) | | |
| 14.2 | Tokens Navy Dark | `--sl-bg: #03071a`, `--sl-accent: #10b981` | | |
| 14.3 | Tokens Obsidian | `--sl-bg: #0a0a0f`, `--sl-accent: #d4a853` (dourado) | | |
| 14.4 | Tokens Graphite | `--sl-bg: #111114`, `--sl-accent: #a0a0b8` (silver) | | |
| 14.5 | Tokens Twilight | `--sl-bg: #0c0a14`, `--sl-accent: #8b5cf6` (violeta) | | |
| 14.6 | Tokens Sahara | `--sl-bg: #f5f0e8`, `--sl-accent: #c2703e` (terracota) | | |
| 14.7 | Tokens Arctic | `--sl-bg: #f0f4f8`, `--sl-accent: #0891b2` (cyan) | | |
| 14.8 | Tokens Rosewood | `--sl-bg: #0f0a0d`, `--sl-accent: #c17d6a` (rose gold) | | |
| 14.9 | `--sl-accent` aplica em botões, links, toggles | Cor de acento do tema ativo se reflete nos CTAs | | |
| 14.10 | Cores de módulo fixas em todos os temas | `--color-fin`, `--color-tmp` etc. não mudam por tema | | |
| 14.11 | Cores funcionais fixas | `--green`, `--red`, `--yellow` iguais em todos os temas | | |
| 14.12 | Gradiente `text-sl-grad` visível | Verde → Azul nos títulos Jornada | | |
| 14.13 | Animação `sl-fade-up` (Jornada) | Cards aparecem com slide-up suave; desabilitado no Foco | | |
| 14.14 | `.jornada-only` / `.foco-only` | Componentes respeitam visibilidade por modo | | |
| 14.15 | Hover nos cards | `border-[var(--sl-border-h)]` visível em todos os temas | | |
| 14.16 | Valores monetários em DM Mono | Todas as telas respeitam a fonte | | |
| 14.17 | Barras de orçamento com cor correta | ≤70% verde · 70–85% amarelo · >85% vermelho | | |
| 14.18 | Transição de tema suave | `transition: background 0.4s, color 0.4s, border-color 0.4s` | | |

---

## BLOCO 15 — Integridade de Dados

| # | Item | Esperado | ✅❌⚠️ | Obs |
|---|------|----------|--------|-----|
| 15.1 | RLS ativo — usuário A não vê dados de B | Criar 2 contas e verificar isolamento | | |
| 15.2 | Seed carregado corretamente | 14 categorias, 13 recorrentes, ~65 transações, 4 metas | | |
| 15.3 | Milestones gerados ao criar meta | 4 marcos (25/50/75/100) no banco | | |
| 15.4 | current_amount atualiza após aporte | `goals.current_amount` = soma de `goal_contributions` | | |
| 15.5 | completed_at preenchido ao concluir | Campo não-nulo quando status = completed | | |
| 15.6 | Excluir meta remove contribuições e milestones | CASCADE configurado no banco | | |

---

## Resumo de Execução

| Bloco | Total | ✅ | ❌ | ⚠️ |
|-------|-------|----|----|-----|
| 0 — Shell e Navegação | 13 | | | |
| 1 — Auth | 7 | | | |
| 2 — Configurações | 13 | | | |
| 3 — Dashboard Financeiro | 7 | | | |
| 4 — Transações | 10 | | | |
| 5 — Orçamentos | 7 | | | |
| 6 — Recorrentes | 6 | | | |
| 7 — Planejamento | 6 | | | |
| 8 — Calendário | 5 | | | |
| 9 — Relatórios | 5 | | | |
| 10 — Futuro Lista | 15 | | | |
| 11 — Futuro Wizard | 12 | | | |
| 12 — Futuro Detalhe | 17 | | | |
| 12A — Corpo | 6 | | | |
| 12B — Mente | 4 | | | |
| 12C — Patrimônio | 5 | | | |
| 12D — Carreira | 4 | | | |
| 12E — Experiências | 4 | | | |
| 12F — Tempo | 4 | | | |
| 13 — Responsividade | 6 | | | |
| 14 — Design System e Temas | 18 | | | |
| 15 — Integridade | 6 | | | |
| **TOTAL** | **185** | | | |

---

## Registro de Bugs

| # | Bloco | Descrição | Prioridade | Status |
|---|-------|-----------|------------|--------|
| | | | | |

> **Prioridade:** P0 = bloqueante · P1 = crítico · P2 = médio · P3 = cosmético
