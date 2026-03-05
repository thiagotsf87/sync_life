# 🔍 Auditoria de Inconsistências — Módulo Panorama (Mobile)

**Data:** 01/03/2026  
**Comparação:** Screenshots da implementação atual vs. Protótipos HTML aprovados  
**Viewport:** ~390px (mobile)  
**Telas auditadas:** Dashboard, Conquistas, Ranking  

---

## Legenda de Severidade

| Ícone | Severidade | Significado |
|-------|-----------|-------------|
| 🔴 | CRÍTICO | Quebra funcionalidade ou fere o design system gravemente |
| 🟠 | GRAVE | Desvio visual importante que compromete a experiência |
| 🟡 | MODERADO | Diferença visual perceptível que não bloqueia uso |
| 🟢 | LEVE | Polimento / refinamento menor |

---

## 📱 TELA 1 — Dashboard (Panorama)

### Referência: `proto-dashboard-revisado.html` (modo Jornada, Dark)

---

### 🔴 INC-D01 — Header: Layout do MobileHeader difere do plano MVP v4

**Esperado (PLANO-MVP-V4.md, Sprint 1.1):**
```
Linha 1: [☰ Módulo > Página]                    [🔔] [avatar]
Linha 2: (somente Jornada) [Boa noite, Usuário!]       [Foco | Jornada]
```
Altura total: 44px (Foco) ou 80px (Jornada com saudação).

**Encontrado na implementação:**
```
Linha 1: [⊕ Panorama / Dashboard]  [● Foco] [● Jornada]  [🔔] [avatar]
```
O header atual mostra breadcrumb + pills Foco/Jornada + notificação + avatar **tudo em uma única linha**. No modo Jornada, a saudação "Boa noite, Teste!" aparece ABAIXO das sub-tabs, misturada com o conteúdo — não no header.

**Problemas:**
- Pills Foco/Jornada deveriam estar na Linha 2 do header (ou no drawer "Mais"), não na Linha 1
- A saudação deveria estar dentro do header compacto, não solta no conteúdo
- O ícone de módulo deveria ser ☰ (hamburger/módulo), não ⊕ (globe)

**Como corrigir:**
Reestruturar o MobileHeader conforme o plano: Linha 1 com breadcrumb compacto + ações, Linha 2 (Jornada only) com saudação + pills de modo.

---

### 🟠 INC-D02 — Saudação "Boa noite, Teste!" posicionada no corpo da página

**Esperado (protótipo):**
A saudação Jornada é parte do header ou imediatamente abaixo dele com destaque visual, incluindo ícone ✨ e frase motivacional embaixo ("7 dias consecutivos de registros — continue assim.").

**Encontrado:**
"Boa noite, Teste!" com ícone ✨ aparece depois das sub-tabs, como se fosse um H1 de página. A frase complementar abaixo diz "Registros em dia — continue assim." mas sem mencionar "7 dias consecutivos".

**Como corrigir:**
Mover a saudação para dentro do MobileHeader (Linha 2) conforme spec, ou no mínimo posicioná-la ANTES das sub-tabs com o layout correto do protótipo.

---

### 🟠 INC-D03 — Sub-tabs: "Dashboard" tem estilo pill, mas "Conquistas" e "Ranking" são texto simples

**Esperado (protótipo):**
As sub-tabs devem ter estilo uniforme — todas como pills com background quando ativas, ou todas como texto. O protótipo desktop mostra todas as tabs como nav-items com estilo consistente.

**Encontrado:**
"Dashboard" está dentro de uma pill verde com border-radius, enquanto "Conquistas" e "Ranking" são texto plain sem background. Quando o usuário está na aba ativa, deveria haver apenas UM estilo de indicação de aba ativa.

**Como corrigir:**
Aplicar o mesmo estilo de pill a todas as sub-tabs. A aba ativa recebe background (pill preenchida), as inativas ficam sem background mas com o mesmo padding/border-radius para manter hit area consistente.

---

### 🟠 INC-D04 — Card Life Sync Score: Layout e dados diferem do protótipo

**Esperado (proto-dashboard-revisado.html):**
```
[Score 74 grande]  |  [Título "Evolução consistente"]
[Label "Life Sync Score"]  |  [Frase motivacional da IA]
                           |  [Barra de progresso gradiente]
                           |  [4 dimensões: Financeiro 82, Metas 61, Consistência 78, Agenda 67]
[Botão "Ver análise completa"]  [↑ +3 vs. semana passada]
```
No mobile (PLANO-MVP-V4, Sprint 2.1), deveria ser stack vertical.

**Encontrado:**
- Score mostra **18** (não 74 como no protótipo — isso pode ser dado real, OK)
- Label "LIFE SYNC SCORE" está correto
- Frase "Há espaço para crescer" está OK (diferente do protótipo que diz "Evolução consistente" — aceitável se dinâmico)
- **PROBLEMA:** As dimensões mostram **7 módulos** (Finanças 0, Futuro 43, Corpo 5, Mente 5, Carreira 20, Patrimônio 35, Viagens 20) em vez de **4 dimensões** (Financeiro, Metas, Consistência, Agenda)
- As barras coloridas por dimensão não estão seguindo as cores do design system por módulo
- Indicador "SEMANA ↑ +3" está no canto superior direito em vez de estar abaixo como no protótipo
- Botões "Ver análise completa →" e "↑ +3 esta semana" estão alinhados horizontalmente na parte inferior — OK

**Como corrigir:**
- Verificar se as dimensões deveriam ser as 4 do protótipo (Financeiro, Metas, Consistência, Agenda) ou as 7 dimensões de módulos. Se o design evoluiu para 7 módulos, as barras de progresso por dimensão precisam seguir as cores oficiais de cada módulo (Finanças=#10b981, Futuro=#8b5cf6, etc.)
- O layout mobile deveria ser stack vertical conforme Sprint 2.1

---

### 🟡 INC-D05 — Streak badge posicionamento e estilo

**Esperado (protótipo):**
Streak badge "🔥 7 dias" aparece no header-right, como pill com background sutil. É um elemento Jornada-only.

**Encontrado:**
O streak aparece como "🔥 7 dias" com background verde à esquerda, na área de conteúdo (entre saudação e seletor de mês), não no header.

**Como corrigir:**
Mover o streak para dentro do MobileHeader ou posicioná-lo ao lado da saudação conforme o protótipo.

---

### 🟡 INC-D06 — Seletor de mês: estilo difere do protótipo

**Esperado (protótipo):**
```
[📅 ícone] Fevereiro 2026 [▼ chevron]
```
Pill com border e ícone de calendário à esquerda, dentro do header-right.

**Encontrado:**
```
[📅 Março de 2026 ▼]
```
O seletor está na área de conteúdo, posicionado ao lado do streak. O ícone está correto mas o layout geral está fora do lugar.

---

### 🟡 INC-D07 — KPI Cards: Layout e dados

**Esperado (protótipo):**
4 KPI cards em grid 2×2:
- Receitas: R$ 5.000 (verde, ícone 💰)
- Despesas: R$ 3.200 (vermelho, ícone 💸)
- Saldo do Mês: R$ 1.800 (verde/amarelo, ícone 📊)
- Metas Ativas: 3 (com "⚠ 1 em risco", ícone 🎯)

Cada card tem: ícone colorido + label UPPERCASE + valor grande + delta vs. mês anterior.

**Encontrado:**
4 KPI cards em grid 2×2:
- RECEITAS: R$ 0 com "+receitas do mês" (verde)
- DESPESAS: R$ 0 com "—" (sem delta)
- SALDO DO MÊS: R$ 0 com "± saldo positivo" 
- METAS ATIVAS: 3 com "⚠ 1 em risco"

**Diferenças:**
- Os cards NÃO têm ícones (💰, 💸, 📊, 🎯) — o protótipo tem ícones com background colorido
- Os cards não mostram barra de acento no topo (o design system especifica `::before` com 2px de altura)
- Os deltas estão com texto placeholder ("+ receitas do mês") em vez de comparação real vs. mês anterior ("↑ +12% vs jan")
- **Falta o ícone colorido circular à esquerda** que é parte fundamental do design de KPI cards

**Como corrigir:**
Adicionar ícones com background circular colorido. Adicionar barra de acento no topo do card (`::before` com cor do módulo). Implementar deltas reais com comparação percentual.

---

### 🟢 INC-D08 — Bottom Navigation: FAB "+" central

**Esperado (PLANO-MVP-V4):**
Bottom nav com 5 itens: `[Início | Finanças | + (FAB) | Tempo | Mais]`

**Encontrado:**
Bottom nav com 5 itens: `[Início | Finanças | + (FAB verde) | Tempo | Mais]`

Está correto no geral. O FAB verde central funciona como atalho de criação rápida.

**Observação menor:** O ícone de "Início" é um globo (⊕) — verificar se deveria ser o ícone oficial do módulo Panorama.

---

## 📱 TELA 2 — Conquistas

### Referência: `proto-conquistas.html` (modo Jornada, Dark)

---

### 🔴 INC-C01 — Header: Mesmos problemas do Dashboard (INC-D01)

Aplica-se a mesma inconsistência do MobileHeader da tela Dashboard. O header mostra breadcrumb + pills na mesma linha.

---

### 🟠 INC-C02 — Hero Card: Layout simplificado em relação ao protótipo

**Esperado (protótipo):**
```
Layout horizontal (desktop): [Hero Score Card] [Recent Strip (3 cards verticais)]
Layout mobile: [Hero Score Card full-width] → [Recent Strip horizontal com scroll]
```

Hero Score Card contém:
- Número grande "15" em gradiente laranja→rosa com "/ 33" ao lado
- Título "Conquistas desbloqueadas"
- Subtítulo "Você está no **Top 15%** dos usuários do SyncLife."
- Barra de progresso com gradiente laranja→rosa→roxo
- Percentual "45% do total desbloqueado"

**Encontrado:**
- ✅ Número "15 / 33" está correto com gradiente
- ✅ "Conquistas desbloqueadas" está correto
- ✅ "Você está no **Top 15%** dos usuários do SyncLife." está correto
- ✅ Barra de progresso com gradiente está correta
- ✅ "45% do total desbloqueado" está correto
- ✅ Layout mobile está em stack vertical — correto!

**Diferenças encontradas:**
- A barra de gradiente do hero card no protótipo é `linear-gradient(90deg, #f59e0b, #f97316, #ec4899)` (laranja→rosa). Na implementação parece ter um gradiente similar, mas com uma seção rosa/magenta no final — verificar se as cores exatas batem
- O hero card tem uma borda top `::before` com `background: linear-gradient(90deg, #f59e0b, #f97316, #ec4899, #8b5cf6)` (4 cores) no protótipo. Na implementação, essa borda parece existir mas sutil

**Veredito:** Esta seção está **boa** no geral. Poucas diferenças.

---

### 🟠 INC-C03 — Recent Cards: Cards de conquistas recentes diferem do protótipo

**Esperado (protótipo):**
```
Cards recentes em strip vertical (desktop) / horizontal com scroll (mobile):
- Barra lateral colorida de 3px na esquerda (cor da categoria)
- Ícone emoji grande (28px)
- Label "RECENTE · Última conquista" ou "RECENTE"
- Nome da conquista em bold
- Data em texto sutil
```

**Encontrado:**
Os 3 recent cards estão presentes:
- "Analista" (10 Fev 2026) — com label "RECENTE · ÚLTIMA CONQUISTA" ✅
- "Check-up Registrado" (10 Fev 2026) — com label "RECENTE" ✅
- "Primeira Aventura" (08 Fev 2026) — com label "RECENTE" ✅

**Diferenças:**
- Os ícones mostrados são **imagens/ilustrações** (parece ser um ícone de gráfico/analista, uma maleta médica, um avião) em vez de **emojis** como no protótipo. Isso pode ter sido uma decisão intencional de upgrade — verificar se foi aprovado
- A barra lateral colorida de 3px na esquerda parece ausente ou muito sutil nos screenshots
- O layout mobile mostra os cards em **stack vertical** em vez de **horizontal com scroll** como especificado no CSS mobile do protótipo (`@media max-width:768px { .recent-strip { flex-direction:row; overflow-x:auto; } }`)

**Como corrigir:**
- Se os ícones foram atualizados para ilustrações, OK — mas manter consistência com o design system
- Verificar se a barra lateral de 3px da categoria está visível
- O layout mobile deveria ser **horizontal com scroll** conforme o protótipo mobile. Stack vertical ocupa muito espaço na tela

---

### 🟠 INC-C04 — Jornada Motivational Phrase: texto e estilo

**Esperado (protótipo):**
```
[🤖] "Você tem 15 conquistas desbloqueadas e contando. 
      Seu próximo marco é 6 Meses no Verde — continue assim!"
```
Card com background gradiente sutil (esmeralda→azul), border esmeralda, ícone de robô.

**Encontrado:**
Card presente com:
```
"Você tem 15 conquistas desbloqueadas e contando. 
 Seu próximo marco é 6 Meses no Verde — continue assim!"
```

✅ Texto está correto.

**Diferenças:**
- O card na implementação parece ter um background mais escuro/sólido em vez do gradiente sutil `from-[#10b981]/7 to-[#0055ff]/7`
- O ícone 🤖 pode estar ausente — verificar no screenshot (difícil confirmar pela resolução)

---

### 🟡 INC-C05 — Category Tabs: Layout e labels

**Esperado (protótipo):**
```
[Todas 12/34] [Financeiras 4/7] [Metas 3/5] [Consistência 3/5] [Agenda 2/5]
+ Toggle "Mostrar bloqueadas"
```
Tabs com contagem `done/total` ao lado do nome.

**Encontrado:**
```
[Todas 15/33] [💰 Financeiras 4/7] [🎯 Metas 3/5] [📅 Consistência 3/5]
```
- A tab "Agenda" não é visível — pode estar cortada à direita (sem scroll horizontal)
- Os emojis antes dos nomes (💰, 🎯, 📅) são um acréscimo em relação ao protótipo — OK se intencional
- O toggle "Mostrar bloqueadas" parece ausente na versão mobile

**Como corrigir:**
- Garantir scroll horizontal nas tabs para que "Agenda" (ou qualquer tab extra) fique acessível
- Avaliar se o toggle "Mostrar bloqueadas" deveria aparecer no mobile ou ser acessível por outro mecanismo

---

### 🟢 INC-C06 — Grid vs. List view

**Esperado (protótipo):**
- Modo Foco: List view (items em linha horizontal compacta)
- Modo Jornada: Grid view (cards com ícone grande)

**Encontrado:**
Estamos no modo Jornada (baseado nos pills no header), mas os badges parecem estar em list view (cards horizontais com ícone à esquerda), não em grid view como esperado.

**Como corrigir:**
No modo Jornada, os badges deveriam estar em grid (2 colunas no mobile), não em lista.

---

## 📱 TELA 3 — Ranking

### Referência: `proto-conquistas.html` (aba Ranking, ou componente separado)

---

### 🔴 INC-R01 — Header: Mesmos problemas globais (INC-D01)

Mesmo problema de layout do MobileHeader em todas as telas.

---

### 🟠 INC-R02 — Topbar: Título e tabs de período

**Esperado (protótipo / implementação `ranking/page.tsx`):**
```
[🏆 Ranking Global]
[247 participantes · atualizado em tempo real]
                                    [Geral | Este mês | Esta semana]
```
O título deveria ser "🏆 Ranking Global" com gradiente no modo Jornada.

**Encontrado:**
- Título "Ranking" como sub-tab, não como H1 da página
- "247 participantes · atualizado em tempo real" presente ✅
- Tabs de período [Geral | Este mês | Esta semana] presentes ✅

**Diferença:** 
O título "🏆 Ranking Global" do H1 parece não existir como heading separado — ele está sendo representado apenas pela sub-tab "Ranking" no topo. No protótipo/implementação desktop, existe um H1 grande.

**Como corrigir:**
Manter o H1 "Ranking Global" visível abaixo do header (em mobile pode ser compacto, ex: `text-lg font-bold`).

---

### 🟠 INC-R03 — Hero Card do Usuário: Posição e avatar

**Esperado (ranking/page.tsx):**
```
[Avatar "EU" grande]  #38 de 247
                      [Top 25% dos usuários] (badge verde)
                      🔥 7 dias de streak
PONTUAÇÃO TOTAL
195 pts
[Próxima marca — Top 25]      [195/208]
[Faltam 13 pts para o Top 25]
[Barra de progresso]
```

**Encontrado:**
- Avatar "EU" com fundo azul ✅
- "#38 de 247" ✅
- Badge "Top 25% dos usuários" em verde ✅
- "🔥 7 dias de streak" ✅
- "PONTUAÇÃO TOTAL 195 pts" ✅
- "Próxima marca — Top 25" com "195 / 208" ✅
- "Faltam 13 pts para o Top 25" ✅
- Barra de progresso ✅

**Diferenças:**
- O avatar na implementação parece ser um círculo azul com "EU" — no protótipo deveria usar as iniciais do usuário e a cor `avatarColor: '#10b981'` (esmeralda). Na implementação está azul (#0055ff?) em vez de esmeralda
- A badge "Top 25% dos usuários" deveria ter `background: rgba(16,185,129,0.12)` com texto esmeralda. Verificar se as cores batem

**Veredito:** Esta seção está **razoável**, diferenças menores de cor.

---

### 🟠 INC-R04 — Category Score Cards: Layout e dados

**Esperado:**
Grid 2×2 com scores por categoria:
```
[💰 FINANCEIRAS]  [🎯 METAS]
[70 pts]          [60 pts]
[4/7 badges]      [3/5 badges]

[📅 CONSISTÊNCIA] [📆 AGENDA]
[45 pts]          [20 pts]
[3/5 badges]      [2/4 badges]
```
Cada card com ícone da categoria, pontuação grande, contagem de badges.

**Encontrado:**
- Grid 2×2 com 4 cards ✅
- FINANCEIRAS: 70 pts, 4/7 badges ✅
- METAS: 60 pts, 3/5 badges ✅
- CONSISTÊNCIA: 45 pts, 3/5 badges ✅
- AGENDA: 20 pts, 2/4 badges ✅

**Diferenças:**
- Os cards parecem ter uma borda colorida no topo (barra de acento) que varia por categoria — verificar se as cores seguem as cores oficiais do design system
- Os ícones das categorias (💰, 🎯, etc.) parecem corretos
- A fonte DM Mono para os valores numéricos parece correta

**Veredito:** Esta seção está **boa**. Apenas verificar cores das barras de acento.

---

### 🟡 INC-R05 — Leaderboard Section: Preview do Top 20

**Esperado:**
Seção "🏆 Leaderboard" com "Top 20 de 247" mostrando lista dos top users com:
- Posição (#1, #2, etc.)
- Avatar com iniciais e cor
- Nome
- Score
- Trend (↑, ↓, ─)

**Encontrado:**
Seção "🏆 Leaderboard · Top 20 de 247" está visível na parte inferior da tela.

**Diferenças:**
- O conteúdo da lista está cortado no screenshot — impossível avaliar completamente
- Verificar se os items do leaderboard seguem o layout esperado com indicadores de trend

---

### 🟢 INC-R06 — Espaçamento inferior para Bottom Nav

**Observação:**
Verificar se há padding-bottom suficiente (`pb-16` ou equivalente) no conteúdo para que o último item da página não fique escondido atrás do bottom navigation bar.

---

## 📋 RESUMO — Problemas Globais (afetam todas as 3 telas)

### 🔴 GLOB-01 — MobileHeader não segue especificação do PLANO-MVP-V4

**Descrição:** O header em todas as telas mostra tudo em uma linha (breadcrumb + pills + notificação + avatar) causando densidade visual excessiva. O plano aprovado especifica 2 linhas: Linha 1 compacta + Linha 2 para Jornada.

**Impacto:** 100% das telas.

**Ação para Claude Code:** Refatorar `MobileHeader.tsx` para implementar o layout de 2 linhas conforme PLANO-MVP-V4.md Sprint 1.1.

---

### 🟠 GLOB-02 — Sub-tabs inconsistentes entre telas

**Descrição:** Na Dashboard, a sub-tab ativa ("Dashboard") é uma pill verde, mas em Conquistas e Ranking o estilo de aba ativa muda para underline ou pill diferente.

**Impacto:** Inconsistência visual entre telas do mesmo módulo.

**Ação para Claude Code:** Padronizar o componente `ScrollTabs` (ou equivalente) para usar o mesmo estilo de tab ativa em todas as telas — pill com background sutil conforme design system.

---

### 🟡 GLOB-03 — Tipografia: verificar consistência de fontes

**Descrição:** Verificar se todos os títulos usam Syne, textos DM Sans, e valores numéricos DM Mono conforme design system.

**Impacto:** Percepção de qualidade e consistência visual.

---

## 📊 Contagem Final

| Severidade | Qtde | IDs |
|-----------|------|-----|
| 🔴 CRÍTICO | 3 | INC-D01, INC-C01, INC-R01 (mesmo problema: MobileHeader) |
| 🟠 GRAVE | 9 | INC-D02, INC-D03, INC-D04, INC-C02, INC-C03, INC-C04, INC-R02, INC-R03, INC-R04 |
| 🟡 MODERADO | 5 | INC-D05, INC-D06, INC-C05, INC-R05, GLOB-03 |
| 🟢 LEVE | 3 | INC-D07→ícones, INC-D08, INC-R06, INC-C06 |

**Total: 20 inconsistências identificadas**

---

## 🎯 Prioridade de Correção para Claude Code

### Sprint Imediato (resolver primeiro):
1. **GLOB-01 / INC-D01** — Refatorar MobileHeader (resolve 3 críticos de uma vez)
2. **INC-D04** — Life Sync Score card layout + dimensões
3. **INC-D03 + GLOB-02** — Padronizar sub-tabs

### Sprint Seguinte:
4. **INC-D02** — Posicionar saudação corretamente
5. **INC-D07** — Adicionar ícones e barras de acento nos KPI cards
6. **INC-C03** — Recent cards layout horizontal no mobile
7. **INC-C06** — Grid view para badges no modo Jornada
8. **INC-R02** — Adicionar H1 "Ranking Global" no mobile

### Polimento:
9. **INC-D05/D06** — Streak e seletor de mês no lugar correto
10. **INC-C05** — Scroll horizontal nas category tabs
11. **INC-R03** — Cor do avatar no hero do ranking

---

*Documento gerado comparando screenshots mobile da implementação atual com os protótipos HTML aprovados (`proto-dashboard-revisado.html`, `proto-conquistas.html`) e especificações (`PLANO-MVP-V4.md`, `AUDITORIA-MOBILE.md`, `synclife-design-system.html`)*
