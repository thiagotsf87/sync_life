# PROMPT — Claude Code: Implementação do Módulo Mente

> **Objetivo:** Implementar o módulo Mente (Estudos e Aprendizado) do SyncLife em Next.js
> **Duração estimada:** ~35h de desenvolvimento
> **Pré-requisitos:** Shell de navegação implementado, Supabase com migration 005 aplicada, módulos Futuro e Corpo como referência de padrão

---

## INSTRUÇÃO INICIAL

Você vai implementar o módulo 🧠 **Mente** do SyncLife. Antes de escrever qualquer código:

1. **Leia INTEGRALMENTE** o arquivo `SPEC-FUNCIONAL-MENTE.md` — é a especificação funcional completa com 18 seções, 21 regras de negócio, 4 integrações cross-módulo, fluxos CRUD detalhados e modelo de dados
2. **Abra no browser** o arquivo `proto-mobile-mente-v3.html` — são 12 telas que definem exatamente o visual de cada componente
3. **Leia** o `CLAUDE.md` na raiz do projeto para entender as regras de código do SyncLife
4. **Analise** a implementação existente do módulo Corpo (`web/src/app/(app)/corpo/`) e do módulo Futuro (`web/src/app/(app)/futuro/`) como referência de padrões e estrutura
5. **Analise** o arquivo `web/src/lib/modules.ts` para entender a configuração de navegação do módulo Mente (cor: `#eab308`, sub-tabs, rotas)

**Somente após ter lido e compreendido todos os documentos**, crie um plano de implementação e me apresente para aprovação antes de começar a codificar.

---

## CONTEXTO DO MÓDULO

- **Nome:** Mente
- **Subtítulo:** Estudos e aprendizado
- **Cor do módulo:** `#eab308` (Yellow/Amber)
- **Ícone Lucide:** `Brain`
- **Rota base:** `/mente`
- **Sub-navegação (tabs com underline):** Dashboard | Trilhas | Timer | Sessões | Biblioteca

### Tabelas do Banco (migration 005 — já existem)

- `study_tracks` — Trilhas de aprendizado
- `study_track_steps` — Etapas de cada trilha
- `focus_sessions_mente` — Sessões de estudo (Pomodoro)
- `library_items` — Recursos da biblioteca

### Integrações Cross-Módulo (opt-in via Configurações > Integrações)

- **Mente → Tempo:** Sessão Pomodoro cria evento "Bloco de Estudo" na Agenda (RN-MNT-13)
- **Mente → Finanças:** Custo de trilha cria transação "Educação" (RN-MNT-14)
- **Mente → Carreira:** Trilha concluída atualiza habilidade vinculada (RN-MNT-15)
- **Mente → Futuro:** Progresso de trilha atualiza meta vinculada no Objetivo (RN-MNT-16)

---

## PLANO DE IMPLEMENTAÇÃO — 8 FASES

### Fase 1 — Estrutura e Navegação (2h)

**Objetivo:** Criar a estrutura de rotas e componentes base do módulo.

**Atividades:**
```
1.1  Verificar que web/src/lib/modules.ts já tem a config do módulo Mente com cor #eab308
1.2  Criar a página principal: web/src/app/(app)/mente/page.tsx (Dashboard)
1.3  Criar as sub-páginas:
     - web/src/app/(app)/mente/trilhas/page.tsx
     - web/src/app/(app)/mente/timer/page.tsx
     - web/src/app/(app)/mente/sessoes/page.tsx
     - web/src/app/(app)/mente/biblioteca/page.tsx
1.4  Verificar que a sub-navegação (tabs com underline) funciona entre as 5 rotas
1.5  Verificar que o header do módulo mostra: 🧠 Mente + badge "X trilhas"
1.6  Garantir que a tab ativa tem underline na cor #eab308
```

**Validação:**
- Navegar entre as 5 tabs sem erro
- Header mostra ícone + nome + badge
- Tab ativa tem underline amarela (#eab308)
- URL muda corretamente (/mente, /mente/trilhas, etc.)

---

### Fase 2 — Dashboard (4h)

**Objetivo:** Implementar a tela 01 do protótipo.

**Referência visual:** Tela 01 do `proto-mobile-mente-v3.html`
**Referência funcional:** Seção 5 do `SPEC-FUNCIONAL-MENTE.md`

**Atividades:**
```
2.1  KPI Grid (2×2):
     - "Horas esta semana" = soma focus_minutes da semana / 60, cor #eab308
     - "Streak de estudo" = dias consecutivos com sessão, cor #f97316
     - "Trilhas ativas" = count study_tracks status='in_progress'
     - "Pomodoros hoje" = count focus_sessions_mente de hoje, cor #10b981
     
2.2  Streak Heatmap:
     - Grid 7 colunas (S T Q Q S S D) mostrando o mês corrente
     - Cada célula com opacidade proporcional às horas estudadas (0, 0.35, 0.5, 0.8)
     - Cor das células: rgba(234,179,8, [opacidade])
     - Dia atual com borda branca semi-transparente
     
2.3  Trilhas Ativas (resumo):
     - Máximo 3 trilhas, ordenadas por atividade recente
     - Card com: ícone, nome, categoria, etapas (X/Y), badge %, barra de progresso
     - Link "Ver todas →" para /mente/trilhas
     - Empty state se não tem trilhas: CTA "Criar primeira trilha"
     
2.4  Quick Start Pomodoro:
     - Card com gradiente rgba(234,179,8,0.18) → rgba(234,179,8,0.04)
     - Mostra trilha mais recente com sessão
     - Toque navega para /mente/timer com trilha pré-selecionada
     
2.5  [Jornada] Insight IA:
     - Card com fundo rgba(0,85,255,0.06)
     - Ícone 🤖 + texto de insight personalizado
     - Só visível com classe .jornada-only
     - Lógica baseada em regras (não IA generativa): ver RN-MNT-20
```

**Validação conforme spec:**
- [ ] 4 KPIs carregam em < 2 segundos
- [ ] Valores vazios mostram "0", nunca em branco
- [ ] Streak mostra "🔥 Recorde pessoal!" quando current == longest
- [ ] Heatmap renderiza todos os dias do mês corrente
- [ ] Quick Start pré-seleciona a última trilha com sessão
- [ ] Insight IA só aparece no modo Jornada

---

### Fase 3 — Trilhas de Aprendizado (6h)

**Objetivo:** Implementar telas 03, 04, 05, 06 do protótipo — lista, detalhe e wizard de criação.

**Referência visual:** Telas 03-06 do protótipo
**Referência funcional:** Seção 6 + Seção 10.1 (CRUD) do spec

**Atividades:**
```
3.1  Tela de Lista (03):
     - Filter pills: Ativas (default), Concluídas, Explorar
     - Indicador de limite: "MINHAS TRILHAS (X/3 FREE)"
     - Card de trilha: ícone, nome, categoria, início, badge %, barra, próxima etapa
     - CTA de upgrade para usuários FREE com 3 trilhas ativas
     - Botão "+" no header para abrir wizard de criação

3.2  Tela de Detalhe (04):
     - Criar rota: web/src/app/(app)/mente/trilhas/[id]/page.tsx
     - Header: botão ← + nome da trilha + menu ⋮
     - Hero: emoji grande, badges (status + categoria), 3 KPIs (progresso, horas, custo)
     - Barra de progresso com texto "X de Y etapas · Meta: DD MMM AAAA (Z dias)"
     - Lista de etapas: checkbox interativo, texto, data de conclusão
     - Etapa "próximo" destacada com fundo rgba(234,179,8,0.06)
     - Ações: Pausar, Editar, Excluir (com confirmação)
     
3.3  Wizard de Criação (05-06):
     - Criar componente TrackWizard (modal/drawer)
     - Passo 1: Grid 2×2 com 12 categorias, seleção visual
     - Passo 2: Nome, emoji picker, data-alvo, custo, skill vinculada, notas
     - Passo 3: Adicionar etapas (campo + botão, drag to reorder)
     - Dots de progresso (3 steps)
     - Botão "Criar trilha" salva no Supabase

3.4  Lógica de CRUD completa:
     - CREATE: validações (nome obrigatório, 1+ etapa, nome único, limite FREE)
     - UPDATE: marcar/desmarcar etapas recalcula progresso automático (RN-MNT-02)
     - UPDATE: se última etapa marcada, pergunta se deseja concluir (RN-MNT-03)
     - STATUS: pausar, retomar, concluir, abandonar — cada um com regras específicas
     - DELETE: confirmação, cascade em etapas, sessões mantêm track_id=NULL (RN-MNT-17)
```

**Validação conforme spec:**
- [ ] Progresso recalcula automaticamente ao marcar etapas
- [ ] Usuário FREE não consegue criar 4ª trilha ativa (gate PRO aparece)
- [ ] Trilhas pausadas/concluídas não contam no limite FREE
- [ ] Marcar última etapa mostra prompt de conclusão
- [ ] Excluir trilha mantém sessões vinculadas (track_id vira null)
- [ ] Nome duplicado de trilha ativa é bloqueado (RN-MNT-19)
- [ ] Se trilha tem custo + integração ativa → cria transação em Finanças (RN-MNT-14)
- [ ] Se trilha vinculada a skill + concluída → atualiza skill no Carreira (RN-MNT-15)

---

### Fase 4 — Timer Pomodoro (6h)

**Objetivo:** Implementar telas 07, 08, 09 do protótipo — timer ativo, pausa e configurações.

**Referência visual:** Telas 07-09 do protótipo
**Referência funcional:** Seção 7 do spec

**Atividades:**
```
4.1  Timer Ring (SVG circular):
     - Anel de 220px com stroke-dasharray animado
     - Countdown em DM Mono 48px no centro
     - Texto de estado: "🧠 Foco profundo" ou "☕ Pausa curta"
     - Indicador "Sessão X de Y"

4.2  Controles:
     - Play/Pause central (76px, cor #eab308, shadow)
     - Reset à esquerda (52px, confirmação)
     - Skip à direita (52px, confirmação)
     - Ícone muda: play ↔ pause

4.3  Cycle Dots:
     - Barras horizontais mostrando ciclos (4 por padrão)
     - Concluído = sólido, atual = sólido, futuro = transparente

4.4  Seletor de Trilha:
     - Badge pill centralizada: "⚛️ React Avançado · Hooks avançados"
     - Clicar abre seletor com trilhas ativas + opção "Estudo livre"

4.5  Stats do Dia (3 mini-cards):
     - Pomodoros (count), Foco total (horas), Streak (dias)
     - Atualiza em tempo real ao completar ciclo

4.6  Estado de Pausa (tela 08):
     - Ring verde (var(--em)) com opacidade 0.6
     - Countdown da pausa
     - Card "Sugestões para a pausa" (alongar, água, 20/20/20)
     - Visual claramente diferente do foco

4.7  Configurações do Timer (tela 09):
     - Durações: foco (15/25/45/60), pausa curta (3/5/10), pausa longa (10/15/20)
     - Ciclos até pausa longa (3/4/5)
     - Toggles: auto-iniciar pausa, auto-iniciar foco, notificação sonora, registrar na agenda
     - Sons ambiente (PRO): 4 opções com gate PRO (seção com opacity 0.5)
     - Persistir configurações em localStorage + Supabase

4.8  Lógica do Timer:
     - Web Worker para countdown preciso mesmo com tab em background (RN-MNT-21)
     - Notificação sonora ao fim de foco/pausa (sons distintos)
     - Registro automático de sessão ao completar 1+ ciclo (RN-MNT-07)
     - Sessões são imutáveis após registro (RN-MNT-08)

4.9  Registro automático de sessão:
     - Salvar em focus_sessions_mente: user_id, track_id, duration_minutes, focus_minutes, break_minutes, cycles_completed, recorded_at
     - Atualizar total_hours da trilha vinculada (RN-MNT-04)
     - Atualizar streak (RN-MNT-05)
     - Se toggle "Registrar na Agenda" ativo → chamar createEventFromPomodoro() (RN-MNT-13)
     - [Jornada] Calcular XP ganho (RN-MNT-10)
```

**Validação conforme spec:**
- [ ] Timer funciona com tab em background (Web Worker)
- [ ] Countdown preciso (±1 segundo)
- [ ] Sessão registrada automaticamente ao completar 1 ciclo
- [ ] Sessão NÃO registrada se 0 ciclos completados
- [ ] Trilha pré-selecionada é a última com sessão
- [ ] Pausa tem visual verde, claramente diferente do foco amarelo
- [ ] Configurações persistem entre sessões
- [ ] Sons ambiente desabilitados para FREE (gate PRO visível)

---

### Fase 5 — Sessões de Estudo (3h)

**Objetivo:** Implementar tela 02 do protótipo.

**Referência visual:** Tela 02 do protótipo
**Referência funcional:** Seção 8 do spec

**Atividades:**
```
5.1  Resumo Semanal:
     - Badge "X,Xh / Yh" (horas acumuladas / meta semanal)
     - Barra de progresso grossa (10px) com gradiente da cor do módulo
     - Meta semanal configurável (padrão: 10h) — RN-MNT-11

5.2  Gráfico de Barras (Seg-Dom):
     - Barras verticais proporcionais
     - Dias com estudo: cor #eab308
     - Dias sem estudo: var(--s3)
     - Dias futuros: borda tracejada

5.3  Filtros:
     - Pills: Todas, por trilha (dinâmico), Estudo livre
     - Filtrar sessões pela trilha selecionada

5.4  Histórico de Sessões:
     - Lista cronológica (mais recentes primeiro)
     - Barra lateral colorida por trilha
     - Info: nome da trilha, data, horário, pomodoros, duração, status
     - Load more on scroll (20 por página)

5.5  [Jornada] Insight IA:
     - Card com análise de padrões (requer 10+ sessões)
     - Classe .jornada-only
```

**Validação conforme spec:**
- [ ] Semana começa na segunda-feira
- [ ] Meta semanal usa valor configurado pelo usuário
- [ ] Filtro por trilha funciona corretamente
- [ ] Sessões sem trilha aparecem como "Estudo livre"
- [ ] Insight só aparece com 10+ sessões e modo Jornada

---

### Fase 6 — Biblioteca de Recursos (3h)

**Objetivo:** Implementar telas 10 e 11 do protótipo.

**Referência visual:** Telas 10-11 do protótipo
**Referência funcional:** Seção 9 do spec

**Atividades:**
```
6.1  Lista de Recursos:
     - Filter pills: Todos, 📚 Livros, 🎥 Cursos, 🎧 Podcasts, 🔗 Artigos
     - Seção "Em andamento": cards expandidos com barra de progresso
     - Seção "Salvos para depois": lista compacta com ações por tipo
     - Seção "Concluídos": lista compacta com data e badge ✓
     - CTA "+ Adicionar recurso" no final

6.2  Formulário de Adição (tela 11):
     - Modal/drawer com seleção de tipo (4 cards)
     - Campos específicos por tipo (livro: autor/páginas, curso: plataforma/horas, etc.)
     - Vincular a trilha (dropdown)
     - Status inicial: Em andamento / Salvo para depois
     - Validação: título obrigatório

6.3  Edição e Exclusão:
     - Editar recurso: formulário pré-preenchido
     - Atualizar progresso: campo rápido por tipo
     - Excluir: confirmação
```

**Validação conforme spec:**
- [ ] Biblioteca não tem limite FREE/PRO (RN-MNT-12)
- [ ] Filtro por tipo funciona
- [ ] Recurso vinculado a trilha aparece no detalhe da trilha
- [ ] Título é obrigatório na criação

---

### Fase 7 — Integrações e Celebração (4h)

**Objetivo:** Implementar integrações cross-módulo e tela de celebração (tela 12).

**Referência visual:** Tela 12 do protótipo
**Referência funcional:** Seções 11-12 do spec

**Atividades:**
```
7.1  Integração Mente → Tempo (RN-MNT-13):
     - Após sessão Pomodoro, se integração ativa + toggle ativo → chamar createEventFromPomodoro()
     - Verificar que a função já existe em web/src/lib/integrations/agenda.ts

7.2  Integração Mente → Finanças (RN-MNT-14):
     - Ao criar/editar trilha com custo > 0, se integração ativa → criar transação "Educação"

7.3  Integração Mente → Carreira (RN-MNT-15):
     - Ao concluir trilha com linked_skill_id → atualizar skill no módulo Carreira

7.4  Integração Mente → Futuro (RN-MNT-16):
     - Ao atualizar progresso de trilha vinculada a objective_goal → recalcular progresso da meta e do objetivo

7.5  Tela de Celebração (12):
     - Exibida quando trilha é concluída
     - Emoji 🎉 + stats da trilha (etapas, horas, custo)
     - XP ganho + Life Score boost + Badge
     - Card "Impacto na Carreira" (se skill vinculada)
     - Botões: "Ver próximas trilhas" e "Voltar ao Dashboard"
     - Classe .jornada-only (só aparece no modo Jornada)
```

**Validação conforme spec:**
- [ ] Integração só dispara se toggle ativo em Configurações > Integrações
- [ ] Transação financeira tem badge "Auto — 🧠 Mente"
- [ ] Excluir trilha NÃO exclui transação financeira
- [ ] Celebração mostra impacto na Carreira se skill vinculada
- [ ] Celebração só aparece no modo Jornada

---

### Fase 8 — Testes E2E com Playwright (7h)

**Objetivo:** Validar todos os fluxos críticos descritos no spec funcional.

**Referência:** Seção 13 (Regras de negócio) + Seção 10 (CRUD) do spec

**Configuração:** Usar `web/playwright.config.ts` existente, criar arquivo `web/e2e/mente.spec.ts`

**Suíte de testes:**

```typescript
// ═══ GRUPO 1: Navegação (5 testes) ═══
test('deve navegar entre as 5 tabs do módulo Mente')
test('deve exibir header com ícone 🧠, nome "Mente" e badge de contagem')
test('tab ativa deve ter underline na cor #eab308')
test('deve carregar Dashboard como tab padrão ao acessar /mente')
test('URLs devem ser corretas: /mente, /mente/trilhas, /mente/timer, /mente/sessoes, /mente/biblioteca')

// ═══ GRUPO 2: Dashboard (6 testes) ═══
test('deve exibir 4 KPIs com valores corretos')
test('deve exibir heatmap com dias do mês corrente')
test('deve exibir resumo de trilhas ativas (máximo 3)')
test('deve exibir empty state quando não há trilhas')
test('Quick Start deve navegar para /mente/timer com trilha pré-selecionada')
test('Insight IA deve aparecer apenas no modo Jornada')

// ═══ GRUPO 3: Trilhas — CRUD (12 testes) ═══
test('deve listar trilhas ativas com progresso')
test('deve filtrar trilhas por status (ativas, concluídas)')
test('deve criar nova trilha via wizard (3 passos)')
test('deve validar nome obrigatório e mínimo 1 etapa')
test('deve bloquear criação de 4ª trilha para usuário FREE — RN-MNT-01')
test('deve abrir detalhe da trilha ao clicar no card')
test('deve marcar etapa e recalcular progresso automaticamente — RN-MNT-02')
test('deve perguntar se deseja concluir ao marcar última etapa — RN-MNT-03')
test('deve pausar e retomar trilha')
test('deve excluir trilha com confirmação — RN-MNT-17')
test('deve bloquear nome duplicado de trilha ativa — RN-MNT-19')
test('deve atualizar total_hours ao registrar sessão vinculada — RN-MNT-04')

// ═══ GRUPO 4: Timer Pomodoro (10 testes) ═══
test('deve exibir timer com countdown e ring SVG')
test('deve iniciar/pausar timer com botão central')
test('deve completar ciclo de foco e iniciar pausa automaticamente')
test('deve exibir estado de pausa com visual verde diferenciado')
test('deve registrar sessão ao completar 1+ ciclo — RN-MNT-07')
test('deve NÃO registrar sessão se 0 ciclos completados')
test('deve exibir stats do dia atualizados após sessão')
test('deve atualizar streak de estudo — RN-MNT-05')
test('deve abrir configurações e alterar duração do foco')
test('sons ambiente devem mostrar gate PRO para FREE — RN-MNT-09')

// ═══ GRUPO 5: Sessões (5 testes) ═══
test('deve exibir resumo semanal com barra de progresso vs meta')
test('deve exibir gráfico de barras Seg-Dom')
test('deve filtrar sessões por trilha')
test('deve exibir sessões sem trilha como "Estudo livre"')
test('Insight IA deve aparecer apenas com 10+ sessões no Jornada — RN-MNT-20')

// ═══ GRUPO 6: Biblioteca (5 testes) ═══
test('deve listar recursos organizados por status')
test('deve filtrar por tipo (livros, cursos, podcasts, artigos)')
test('deve criar novo recurso com título obrigatório')
test('deve vincular recurso a uma trilha')
test('biblioteca não deve ter limite FREE/PRO — RN-MNT-12')

// ═══ GRUPO 7: Integrações (5 testes) ═══
test('deve criar evento na Agenda ao completar Pomodoro se integração ativa — RN-MNT-13')
test('deve criar transação em Finanças ao cadastrar trilha com custo — RN-MNT-14')
test('deve NÃO criar transação se integração desativada')
test('deve atualizar habilidade no Carreira ao concluir trilha vinculada — RN-MNT-15')
test('deve atualizar progresso no Futuro ao avançar trilha vinculada — RN-MNT-16')

// ═══ GRUPO 8: Responsividade (4 testes) ═══
test('deve funcionar em viewport 375px (mobile)')
test('deve funcionar em viewport 768px (tablet)')
test('deve funcionar em viewport 1280px (desktop)')
test('sub-nav tabs devem ser scrolláveis horizontalmente em mobile')

// TOTAL: 52 testes
```

**Para cada teste, seguir o padrão:**
1. Navegar para a rota correta
2. Aguardar carregamento (loading states)
3. Executar a ação
4. Validar o resultado esperado
5. Validar efeitos colaterais (banco, integrações)

---

## VALIDAÇÃO VISUAL

Após implementar cada fase, comparar o resultado visual com o protótipo HTML:

1. Abrir `proto-mobile-mente-v3.html` no browser
2. Abrir a tela implementada em Next.js lado a lado
3. Verificar:
   - Cor do módulo é `#eab308` (não purple, não qualquer outra)
   - Fonts: Syne para títulos, DM Sans para corpo, DM Mono para valores
   - Espaçamentos e border-radius consistentes com design system
   - Cards usam `var(--s1)` de background com `var(--border)`
   - Badges e pills seguem o mesmo estilo do protótipo
   - Tab ativa tem underline (não pill/background)
   - Textos sobre fundo amarelo são pretos (#000) para contraste
   - Ícones são do lucide-react

---

## REGRAS ABSOLUTAS

1. **Ler spec ANTES de codificar** — cada funcionalidade tem critérios de aceite claros
2. **Cor do módulo é #eab308** — nunca usar purple (#8b5cf6) para Mente
3. **Navegação com underline tabs** — não usar pills/background para sub-nav
4. **Timer usa Web Worker** — não confiar em setInterval do thread principal
5. **Sessões são imutáveis** — não permitir edição após registro
6. **Integrações são opt-in** — sempre verificar toggle antes de disparar
7. **Limite FREE = 3 trilhas ativas** — pausadas/concluídas não contam
8. **Mobile-first** — testar em 375px antes de adaptar para desktop
9. **Modo Jornada = classe .jornada-only** — não mudar cores por modo
10. **Testes devem passar** — cada fase só está concluída quando os testes passam

---

## ORDEM DE EXECUÇÃO

```
Fase 1 (Estrutura)  →  nenhuma dependência
Fase 2 (Dashboard)  →  depende de Fase 1
Fase 3 (Trilhas)    →  depende de Fase 1
Fase 4 (Timer)      →  depende de Fase 1 + Fase 3 (seletor de trilha)
Fase 5 (Sessões)    →  depende de Fase 4 (precisa de dados de sessões)
Fase 6 (Biblioteca) →  depende de Fase 1 + Fase 3 (vínculo com trilha)
Fase 7 (Integr.)    →  depende de Fase 3 + Fase 4 (todas as entidades)
Fase 8 (Testes)     →  depende de TODAS as fases anteriores
```

**FLUXO:** Ao concluir cada fase, reportar o que foi implementado e quais testes passaram. Aguardar aprovação antes de avançar para a próxima fase.

---

## CHECKLIST DE CONCLUSÃO

Ao finalizar toda a implementação, validar:

- [ ] As 5 sub-rotas do módulo funcionam (/mente, /trilhas, /timer, /sessoes, /biblioteca)
- [ ] Todas as 21 regras de negócio (RN-MNT-01 a RN-MNT-21) estão implementadas
- [ ] Todas as 4 integrações cross-módulo funcionam quando ativas
- [ ] Layout visual confere com as 12 telas do protótipo
- [ ] Cor #eab308 aplicada consistentemente (nunca purple)
- [ ] Navegação com underline tabs (nunca pills)
- [ ] Modo Foco vs Jornada respeita .jornada-only / .foco-only
- [ ] FREE vs PRO gates funcionam (trilhas, sons, insights)
- [ ] Mobile responsive em 375px, 768px, 1280px
- [ ] 52 testes Playwright passando
- [ ] Nenhum console.error no browser

---

*Prompt criado em: Março 2026*
*Documentos de referência: SPEC-FUNCIONAL-MENTE.md + proto-mobile-mente-v3.html*
*Padrão seguido: 21-TEMAS-E-MODOS-DEV-SPEC.md (seção 18) + configuracoes-dev-spec.md (seção 20)*
