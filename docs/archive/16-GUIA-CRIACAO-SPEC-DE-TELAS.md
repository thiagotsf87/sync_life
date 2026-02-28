# 16 — Guia para Criação de Documentos de Especificação de Telas

> **O que é este documento:** Um guia obrigatório (meta-prompt) que define as regras, estrutura e padrões que todo documento de especificação de desenvolvimento de tela deve seguir. Antes de criar qualquer novo doc de spec, leia este guia por completo.
>
> **Como usar:** Quando solicitado a criar uma spec de tela, o Claude deve:
> 1. Ler este documento inteiro
> 2. Ler o protótipo HTML aprovado correspondente
> 3. Ler o documento `11-UX-UI-NAVEGACAO.md` (referência de design system e navegação)
> 4. Ler o documento `10-MVP-V2-COMPLETO.md` (regras de negócio gerais)
> 5. Criar o doc de spec seguindo rigorosamente as regras abaixo
> 6. Em caso de **qualquer dúvida**, perguntar ao Thiago antes de assumir

---

## 1. PRINCÍPIO FUNDAMENTAL: SEPARAÇÃO DE RESPONSABILIDADES

### 1.1 O que um documento de spec de tela DEVE conter

O documento de especificação de uma tela é responsável **exclusivamente** pelo conteúdo da área de conteúdo daquela tela — ou seja, tudo que está dentro do `Main Content` do shell do app.

Isso inclui:

- **Cabeçalho da página** (eyebrow, título, subtítulo, ações primárias da tela)
- **Todos os blocos de conteúdo** da tela, na ordem exata em que aparecem
- **Regras de negócio detalhadas** de cada funcionalidade presente na tela
- **Comportamento diferenciado entre Modo Foco e Modo Jornada** para cada bloco
- **Comportamento diferenciado entre Tema Dark e Tema Light** quando houver variações visuais além dos tokens
- **Estados de cada componente** (vazio, carregando, com dados, erro, hover, ativo, desabilitado)
- **Fórmulas e cálculos** (se a tela exibir dados calculados)
- **Modais, drawers, tooltips e popovers** que são acionados a partir desta tela
- **Dados e API necessários** para alimentar a tela
- **Responsividade específica da tela** (como os blocos se reorganizam em mobile/tablet)
- **Animações e transições** específicas dos componentes da tela
- **Testes unitários automatizados** obrigatórios (veja seção 7)
- **Atividades faseadas** para o Claude Code executar

### 1.2 O que um documento de spec de tela NUNCA deve conter

Os componentes abaixo são **globais do shell do app** e já estão especificados nos documentos de navegação (`11-UX-UI-NAVEGACAO.md` e `proto-navigation-v3.html`). Eles serão desenvolvidos **uma única vez como componentes reutilizáveis** e não devem ser re-especificados em cada tela.

**NUNCA inclua especificações de:**

- **Module Bar (Nível 1):** A barra vertical de 58px com logo e botões de módulo. Largura, ícones, estados ativos, pill verde, comportamento mobile — NADA disso entra no doc de tela.
- **Sidebar (Nível 2):** A sidebar de 220px com navegação interna do módulo. Itens do menu, estados ativos, Life Sync Score, comportamento colapsado/expandido — NADA disso entra no doc de tela.
- **Top Header:** A barra superior de 50px com breadcrumb/saudação, pills de modo/tema, botão de notificações — NADA disso entra no doc de tela.
- **Ícones de navegação:** Todos os ícones usados na Module Bar, Sidebar e Top Header estão definidos no arquivo de navegação. O doc de tela não lista nem especifica ícones de navegação.
- **Toggle de modo Foco/Jornada:** O mecanismo de troca é global. O doc de tela apenas descreve como o **conteúdo** daquela tela muda entre os modos.
- **Toggle de tema Dark/Light:** O mecanismo de troca é global. O doc de tela apenas descreve variações visuais específicas do conteúdo quando relevantes.

### 1.3 Como referenciar o shell do app

Todo doc de tela DEVE incluir uma seção curta de referência ao shell, seguindo este modelo exato:

```markdown
### X.X Shell do App (Module Bar, Sidebar e Top Header)

> **⚠️ Componentes globais — não especificados aqui.**
> A Module Bar (Nível 1), Sidebar (Nível 2) e Top Header são componentes
> compartilhados do shell do SyncLife, desenvolvidos separadamente.
> Specs completas: `11-UX-UI-NAVEGACAO.md` e `proto-navigation-v3.html`.
>
> **Contexto desta tela:**
> - Module Bar: botão **[Nome do Módulo]** ativo
> - Sidebar: item **[Nome da Tela]** ativo, dentro do módulo [Nome do Módulo]
> - Top Header Modo Foco: breadcrumb `[Módulo] › [Tela] · [Contexto temporal]`
> - Top Header Modo Jornada: [descrever a saudação/frase contextual específica]
```

Substituir os placeholders `[...]` pelos valores reais da tela sendo especificada.

---

## 2. DESIGN SYSTEM: REGRA DE OURO

### 2.1 Tudo deve estar em cima do Design System

O SyncLife possui um Design System documentado com tokens de cores, tipografia, espaçamento, border-radius e sombras. **Nenhuma cor, fonte ou tamanho deve ser inventado ou hardcoded.** Todo valor visual utilizado no documento deve referenciar um token existente do Design System.

### 2.2 Tokens obrigatórios que todo doc deve referenciar

Todo documento de spec DEVE incluir uma seção de "Design System: Tokens Obrigatórios" listando **apenas os tokens que aquela tela utiliza**. Não copie todos os tokens — liste apenas os relevantes.

Os tokens de referência são:

```css
/* === CORES DE SUPERFÍCIE (variam por tema) === */
--bg: #03071a           /* Background principal (dark) / #f8fafc (light) */
--s1: #07112b           /* Surface 1 — cards, sidebars */
--s2: #0c1a3a           /* Surface 2 — inputs, badges, hover interno */
--s3: #132248           /* Surface 3 — hover states, separadores */

/* === CORES DE TEXTO (variam por tema) === */
--t1: #dff0ff           /* Texto primário (dark) / #0f172a (light) */
--t2: #6e90b8           /* Texto secundário */
--t3: #2e4a6e           /* Texto terciário / labels */

/* === CORES DA MARCA (fixas nos dois temas) === */
--em: #10b981           /* Esmeralda — brand primary, CTAs, sucesso */
--el: #0055ff           /* Electric Blue — brand secondary, links, dados */

/* === CORES FUNCIONAIS (fixas nos dois temas) === */
--green: #10b981        /* Positivo, receitas, sucesso */
--yellow: #f59e0b       /* Atenção, aviso */
--orange: #f97316       /* Quase no limite */
--red: #f43f5e          /* Erro, despesas, ultrapassado */

/* === CORES DE MÓDULO (para identificação visual) === */
Finanças:  Emerald (#10b981)
Metas:     Violet (#7c3aed)
Agenda:    Sky (#0ea5e9)
Saúde:     Emerald (#10b981) — v3
Estudos:   Amber (#f59e0b) — v3
Carreira:  Rose (#f43f5e) — v3
```

### 2.3 Tipografia

| Família | Uso | Observação |
|---|---|---|
| **Syne** (400–800) | Títulos de página, títulos de card, scores, eyebrows de módulo | Nunca usar para corpo de texto |
| **DM Sans** (300–600) | Corpo, labels, nav items, botões, textos em geral | Fonte padrão da interface |
| **DM Mono** (400–500) | Valores monetários, percentuais, dados numéricos, eixos de gráficos | Sempre que exibir números financeiros |

O doc deve especificar qual fonte, peso e tamanho usa em cada elemento relevante.

### 2.4 Quatro combinações de tema obrigatórias

O SyncLife possui **dois eixos visuais independentes** que se combinam:

| # | Combinação | Modo | Tema |
|---|---|---|---|
| 1 | Foco + Dark | 🎯 Foco | 🌙 Dark |
| 2 | Foco + Light | 🎯 Foco | ☀️ Light |
| 3 | Jornada + Dark | 🌱 Jornada | 🌙 Dark |
| 4 | Jornada + Light | 🌱 Jornada | ☀️ Light |

O documento de spec deve descrever claramente o que muda no conteúdo da tela entre Modo Foco e Modo Jornada. As diferenças de tema Dark/Light geralmente são resolvidas pelos tokens CSS (que já variam automaticamente), mas se houver diferenças visuais além dos tokens (ex: ilustrações diferentes, textos que mudam), essas devem ser documentadas.

**O que tipicamente muda entre Foco e Jornada no conteúdo:**

- Foco: dados diretos, sem contexto motivacional, sem animações de entrada
- Jornada: insights de IA, frases motivacionais, animações suaves, Life Sync Score integrado, celebrações de conquistas, textos mais humanizados

---

## 3. ESTRUTURA PADRÃO DO DOCUMENTO

Todo documento de spec de tela DEVE seguir esta estrutura de seções. Seções podem ser adicionadas se necessário, mas **nenhuma seção obrigatória pode ser omitida**.

```
# [Número] — [NOME DA TELA]: Especificação Completa para Desenvolvimento

**Documento de referência para implementação em Next.js**
**Protótipo aprovado:** `[nome-do-arquivo.html]`
**Dependências:** [listar telas/componentes que precisam existir antes]
**Prioridade:** [Alta / Média / Baixa]
**Fase:** [número da fase no roadmap]

---

## ÍNDICE
[listar todas as seções numeradas]

---

## 1. Visão Geral da Tela
   - O que é esta tela e qual problema resolve para o usuário
   - Contexto dentro do módulo (é a tela principal? é acessada a partir de onde?)
   - Escopo da tela (o que ela mostra e o que NÃO mostra)

## 2. Layout
   ### 2.1 Estrutura Geral (referência ao shell 3 camadas)
   ### 2.2 Shell do App (referência — NÃO especificar, seguir modelo da seção 1.3)
   ### 2.3 Cabeçalho da Página (conteúdo específico desta tela)

## 3. Blocos de Conteúdo (ordem exata)
   - Listar todos os blocos na ordem em que aparecem na tela
   - Cada bloco tem sua própria subseção detalhada

## 4–N. [Um capítulo por bloco de conteúdo]
   Para cada bloco:
   - Descrição do que exibe
   - Layout interno (grid, flex, posicionamento)
   - Dados exibidos e de onde vêm
   - Fórmulas / cálculos (se aplicável)
   - Estados: vazio, carregando, com dados, erro
   - Comportamento Foco vs. Jornada
   - Interações: hover, click, drag, etc.
   - Tooltips, modais ou drawers acionados

## [N+1]. Design System: Tokens Utilizados
   - Apenas os tokens que esta tela usa (não copiar todos)

## [N+2]. Tipografia da Tela
   - Mapeamento fonte/peso/tamanho por elemento

## [N+3]. Responsividade
   - Como a tela se comporta em cada breakpoint
   - Mobile (< 640px): layout de coluna única, reorganização de blocos
   - Tablet (640–1024px): adaptações intermediárias
   - Desktop (> 1024px): layout completo
   - Wide (> 1440px): uso do espaço extra
   - Regra: mobile-first — toda decisão parte de 375px

## [N+4]. Animações e Transições
   - Animações de entrada dos blocos (delays escalonados)
   - Transições de estado (hover, active, focus)
   - Animações de dados (barras crescendo, números contando)
   - Diferença Foco (sem animações) vs. Jornada (com animações)

## [N+5]. Acessibilidade
   - Roles ARIA obrigatórios
   - Navegação por teclado
   - Contraste mínimo
   - Leitores de tela (alt texts, aria-labels)

## [N+6]. Regras de Negócio Detalhadas
   - TODA regra que governa o comportamento da tela
   - Condições, validações, limites FREE vs PRO
   - Fórmulas com exemplos numéricos
   - Casos de borda (edge cases)
   - Qualquer dúvida → perguntar ao Thiago

## [N+7]. Dados e API
   - Estrutura do endpoint necessário
   - Shape dos dados esperados (TypeScript types)
   - Campos obrigatórios vs. opcionais

## [N+8]. Testes Unitários Automatizados (OBRIGATÓRIO)
   - Lista completa de testes obrigatórios
   - Critério de conclusão: todos os testes passando

## [N+9]. Atividades para o Claude Code
   - Fases de desenvolvimento com estimativas
   - Tabela de atividades com dependências
   - Ordem de execução recomendada
   - Total geral estimado

## Rodapé
   - Data de criação
   - Versão
   - Protótipo de referência
```

---

## 4. REGRAS DE NEGÓCIO: NÍVEL DE DETALHE ESPERADO

### 4.1 O que significa "regras de negócio detalhadas"

Regras de negócio são as leis que governam como a tela funciona. Elas respondem perguntas como: "O que acontece quando...?", "Qual é o limite de...?", "Como é calculado o...?", "O que o usuário vê se...?"

O documento deve ser detalhado o suficiente para que um desenvolvedor consiga implementar a tela **sem precisar olhar o protótipo**. O protótipo é a referência visual; o doc é a referência lógica.

### 4.2 Formato esperado

Para cada regra, incluir:

- **Descrição clara** do que acontece
- **Fórmula ou cálculo** quando aplicável, com exemplo numérico
- **Condições e limites** (quando se aplica, quando não se aplica)
- **Diferença FREE vs PRO** se houver
- **Caso de borda** (o que acontece em situações extremas)

**Exemplo bom:**
> A Taxa de Poupança é calculada como `(saldo / receitas) * 100`. Se receitas = R$ 5.000 e despesas = R$ 3.200, o saldo é R$ 1.800 e a taxa é 36%. O delta compara com o mês anterior em pontos percentuais (não em percentual sobre percentual). Se não houver receitas no mês, exibir "—" em vez de 0% ou Infinity. FREE e PRO: sem diferença.

**Exemplo ruim:**
> A tela mostra a taxa de poupança.

### 4.3 Regra de ouro das regras de negócio

> **Se você (Claude) tiver QUALQUER dúvida sobre uma regra de negócio — seja sobre como algo deve funcionar, qual é a prioridade entre regras conflitantes, ou se determinado comportamento é intencional — PERGUNTE AO THIAGO antes de inventar uma resposta.** Nunca assuma. É melhor perguntar do que implementar errado.

---

## 5. MODOS FOCO E JORNADA: COMO DOCUMENTAR

### 5.1 Toda tela tem duas faces

Cada tela do app se comporta de forma diferente dependendo do modo ativo. O documento deve ter, **para cada bloco de conteúdo**, uma descrição clara do que muda entre os modos.

### 5.2 Padrão de documentação

Usar este formato sempre que houver diferença entre modos:

```markdown
**Modo Foco:**
[Descrever o comportamento/visual no modo Foco]

**Modo Jornada:**
[Descrever o comportamento/visual no modo Jornada]
```

### 5.3 Diferenças típicas por modo

| Aspecto | Modo Foco | Modo Jornada |
|---|---|---|
| Tom dos textos | Direto, objetivo, técnico | Humanizado, motivacional, contextual |
| Dados exibidos | Números puros, sem interpretação | Números + insight de IA / frase contextual |
| Animações | Nenhuma — elementos aparecem instantaneamente | Fade-in suave, barras animando, delays escalonados |
| Empty states | Texto curto e direto + CTA | Mensagem encorajadora + ilustração + CTA |
| Life Sync Score | Não exibido | Integrado no contexto da tela |
| Celebrações | Não exibidas | Badges, confetti, mensagens de parabéns |
| Cards | Bordas sutis, sem sombra, dados em destaque | Sombras suaves, gradientes sutis, mais arredondados |
| Alertas | "Alimentação: R$ 720 / R$ 800 (90%)" | "Quase no limite de Alimentação! Faltam R$ 80." |

---

## 6. TEMAS DARK E LIGHT: COMO DOCUMENTAR

### 6.1 A maioria das diferenças é automática

Os tokens CSS (`--bg`, `--s1`, `--s2`, `--t1`, `--t2`, etc.) já possuem valores diferentes para Dark e Light. Se a tela usa apenas tokens, **não é necessário documentar diferenças de tema** — o design system cuida disso automaticamente.

### 6.2 Quando documentar diferenças de tema

Documentar **apenas** quando houver elementos que mudam além dos tokens:

- Ilustrações ou imagens com versões diferentes por tema
- Gradientes que usam cores calculadas (não tokens puros)
- Efeitos de glow, sombras especiais ou overlays que mudam significativamente
- Textos ou labels que mudam por tema (raro, mas possível)

Usar o formato:

```markdown
**Tema Dark:** [descrição]
**Tema Light:** [descrição]
```

---

## 7. TESTES UNITÁRIOS AUTOMATIZADOS (OBRIGATÓRIO)

### 7.1 Regra inegociável

> **Nenhuma tela é considerada concluída sem testes unitários automatizados escritos E passando.** Testes não são opcionais, não são "nice to have", não são "fase futura". São parte integral do desenvolvimento de cada tela.

### 7.2 O que os testes devem cobrir

Cada doc de spec deve incluir uma seção de testes que liste **explicitamente** o que deve ser testado:

**a) Renderização básica:**
- Todos os blocos de conteúdo renderizam sem erro
- Textos, labels e títulos estão presentes
- CTAs e botões estão visíveis e clicáveis

**b) Regras de negócio:**
- Cada fórmula/cálculo tem pelo menos um teste com valores conhecidos
- Cada condição (if/else) tem teste para ambos os caminhos
- Limites FREE vs PRO são respeitados
- Casos de borda retornam resultados corretos

**c) Estados:**
- Estado vazio (sem dados) renderiza o empty state correto
- Estado de carregamento exibe skeleton/loading
- Estado com dados exibe os dados formatados corretamente
- Estado de erro exibe mensagem de erro adequada

**d) Interações:**
- Clicks acionam as ações corretas
- Hovers exibem tooltips/popovers
- Formulários validam inputs
- Modais abrem e fecham corretamente

**e) Modos (Foco vs Jornada):**
- Componentes exclusivos do Modo Jornada não aparecem no Foco
- Componentes exclusivos do Modo Foco não aparecem no Jornada
- Textos mudam conforme o modo ativo

**f) Responsividade:**
- Layout mobile (375px) renderiza corretamente
- Elementos que devem sumir no mobile estão ocultos
- Elementos que devem reorganizar estão na posição correta

### 7.3 Formato da seção de testes no documento

```markdown
## [N]. Testes Unitários Automatizados

### Critério de conclusão
> ✅ A tela só é considerada CONCLUÍDA quando TODOS os testes abaixo
> estiverem escritos e passando (green). Nenhuma exceção.

### Testes obrigatórios

| # | Teste | Tipo | Bloco |
|---|---|---|---|
| T01 | Renderiza KPI Strip com 4 cards | Renderização | KPI Strip |
| T02 | Calcula saldo = receitas - despesas | Regra de negócio | KPI Strip |
| T03 | Delta de despesas é vermelho quando positivo | Regra de negócio | KPI Strip |
| T04 | Exibe empty state quando não há transações | Estado | Últimas Transações |
| T05 | Tooltip aparece ao hover na categoria | Interação | Gastos por Categoria |
| T06 | Insight IA aparece apenas no Modo Jornada | Modo | Consultor IA |
| T07 | Layout mobile empilha cards em coluna | Responsividade | KPI Strip |
| ... | ... | ... | ... |

### Stack de testes
- **Framework:** Vitest (ou Jest se já configurado)
- **Renderização:** React Testing Library
- **Localização:** `__tests__/[nome-da-tela]/` no diretório do módulo
```

### 7.4 Quantidade mínima de testes

Não existe número fixo, mas como referência:

- Tela simples (1-3 blocos): mínimo 15 testes
- Tela média (4-6 blocos): mínimo 25 testes
- Tela complexa (7+ blocos, como a Visão Geral de Finanças): mínimo 40 testes

O número real depende da complexidade das regras de negócio. **Mais regras = mais testes.**

---

## 8. ATIVIDADES PARA O CLAUDE CODE: FORMATO PADRÃO

### 8.1 Estrutura obrigatória

As atividades devem ser organizadas em fases:

- **Fase 1 — Fundação:** Tokens, tipos TypeScript, schemas Zod, componentes base
- **Fase 2 — Componentes:** Um por um, na ordem de dependência
- **Fase 3 — Orquestração:** Page.tsx que monta tudo, lógica de estado, API calls
- **Fase 4 — Testes:** Escrever e rodar todos os testes da seção 7
- **Fase 5 — QA:** Responsividade, acessibilidade, performance

### 8.2 Formato da tabela de atividades

```markdown
| # | Atividade | Estimativa | Depende de |
|---|-----------|-----------|------------|
| 1.1 | Criar types TypeScript para os dados da tela | 0.5h | — |
| 1.2 | Criar componente KPICard | 1h | 1.1 |
| ... | ... | ... | ... |
```

### 8.3 Incluir sempre

- Estimativa de tempo por atividade
- Dependências entre atividades
- Total geral estimado
- Ordem de execução recomendada (lista numerada)

---

## 9. REFERÊNCIAS CRUZADAS

### 9.1 Conexões entre telas

Cada doc deve listar:

- **Telas que navegam para esta tela** (ex: "Acessível via botão 'Ver todas' na Visão Geral")
- **Telas para onde esta tela navega** (ex: "Botão 'Nova Transação' abre o modal de criação")
- **Dados compartilhados** (ex: "Os envelopes exibidos aqui são os mesmos da tela de Orçamentos")

### 9.2 Dependências de desenvolvimento

Listar explicitamente quais componentes ou telas precisam existir antes para que esta tela funcione:

```markdown
**Dependências:**
- Shell de navegação (`proto-navigation-v3.html`) — DEVE estar implementado
- Componente de Modal de Transação — compartilhado com Visão Geral
- API de transações — endpoint GET /transactions
```

---

## 10. CHECKLIST DE VALIDAÇÃO FINAL

Antes de entregar um doc de spec, o Claude DEVE verificar todos os itens abaixo:

### Escopo
- [ ] O doc NÃO contém specs da Module Bar
- [ ] O doc NÃO contém specs da Sidebar (além do item ativo)
- [ ] O doc NÃO contém specs do Top Header (além do conteúdo contextual)
- [ ] O doc NÃO contém specs de ícones de navegação
- [ ] O doc referencia o shell com o bloco padrão da seção 1.3

### Design System
- [ ] Nenhuma cor é hardcoded (todas referenciam tokens)
- [ ] Nenhuma fonte é inventada (todas são Syne, DM Sans ou DM Mono)
- [ ] Seção de tokens lista apenas os tokens usados pela tela
- [ ] Breakpoints seguem o padrão: mobile < 640, tablet 640-1024, desktop > 1024, wide > 1440

### Modos e Temas
- [ ] Cada bloco descreve comportamento no Modo Foco
- [ ] Cada bloco descreve comportamento no Modo Jornada
- [ ] Diferenças de tema Dark/Light são documentadas APENAS quando vão além dos tokens

### Regras de Negócio
- [ ] Toda regra tem descrição clara, fórmula (se aplicável) e exemplo
- [ ] Casos de borda estão documentados
- [ ] Diferenças FREE vs PRO estão listadas
- [ ] Nenhuma regra foi "inventada" — em caso de dúvida, foi perguntado ao Thiago

### Testes
- [ ] Seção de testes unitários está presente
- [ ] Testes cobrem: renderização, regras de negócio, estados, interações, modos
- [ ] Critério de conclusão está explícito: "todos os testes passando"
- [ ] Quantidade de testes é proporcional à complexidade da tela

### Atividades
- [ ] Fases de desenvolvimento estão definidas
- [ ] Cada atividade tem estimativa e dependências
- [ ] Total geral estimado está presente
- [ ] Ordem de execução está definida

### Geral
- [ ] Índice numerico está presente e completo
- [ ] Protótipo de referência está indicado no cabeçalho
- [ ] Dependências de outras telas/componentes estão listadas
- [ ] Referências cruzadas (de onde vem, para onde vai) estão documentadas

---

## 11. DOCUMENTOS DE REFERÊNCIA

Ao criar qualquer spec de tela, o Claude deve consultar:

| Documento | Conteúdo | Quando usar |
|---|---|---|
| `11-UX-UI-NAVEGACAO.md` | Design system, navegação, modos, breakpoints | **Sempre** — é a base de tudo |
| `proto-navigation-v3.html` | Protótipo do shell com Module Bar, Sidebar e Top Header | Para entender a estrutura visual do shell |
| `10-MVP-V2-COMPLETO.md` | Regras de negócio detalhadas de todos os módulos | Para extrair regras de negócio da tela |
| `14-PROTOTIPOS-STATUS-E-ATIVIDADES.md` | Status de aprovação dos protótipos e checklist | Para verificar se o protótipo está aprovado |
| `proto-[nome-da-tela].html` | Protótipo HTML da tela específica | Para extrair layout, componentes e comportamentos visuais |

---

## 12. FLUXO DE TRABALHO DO CLAUDE

Quando o Thiago solicitar: _"Leia o guia e crie a spec do proto-X.html"_, o Claude deve:

```
1. Ler este documento (16-GUIA-CRIACAO-SPEC-DE-TELAS.md) por completo
2. Ler o protótipo HTML indicado (proto-X.html)
3. Ler o 11-UX-UI-NAVEGACAO.md (design system + navegação)
4. Ler o 10-MVP-V2-COMPLETO.md (regras de negócio do módulo)
5. Analisar os dados e identificar:
   a. Blocos de conteúdo da tela
   b. Regras de negócio aplicáveis
   c. Diferenças Foco vs Jornada
   d. Estados dos componentes
   e. Interações e fluxos
6. Listar dúvidas (se houver) e PERGUNTAR ao Thiago antes de prosseguir
7. Criar o documento seguindo a estrutura da seção 3
8. Rodar o checklist da seção 10 antes de entregar
9. Entregar o documento como arquivo .md
```

---

## 13. CONVENÇÕES DE NOMENCLATURA

### Arquivos
- Documentos de spec: `[número]-[NOME-DA-TELA]-DEV-SPEC.md` (ex: `17-TRANSACOES-DEV-SPEC.md`)
- Número sequencial segue a partir do último documento existente

### Dentro do documento
- Seções: numeração sequencial (`## 1.`, `## 2.`, etc.)
- Subseções: numeração composta (`### 2.1`, `### 2.2`, etc.)
- Referências a tokens: usar o nome da variável CSS (`--em`, `--s1`, `--t1`)
- Referências a protótipos: usar o nome do arquivo (`proto-transacoes.html`)
- Referências a outros docs: usar o número + nome (`11-UX-UI-NAVEGACAO.md`)

---

*Documento criado em: 23/02/2026*
*Versão: 1.0*
*Uso: Meta-prompt obrigatório para geração de documentos de spec de telas*
