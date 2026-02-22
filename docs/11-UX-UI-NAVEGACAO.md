# 11 - UX/UI e Estratégia de Navegação

> Documento de referência para design e experiência do usuário no SyncLife MVP v2+

---

## 1. A Pergunta Central de Design

"Como criar uma interface que seja simples para quem quer praticidade e poderosa para quem
quer profundidade, sem que um grupo sacrifique a experiência do outro?"

A resposta do SyncLife é: **arquitetura progressiva de disclosure** — mostrar o mínimo
necessário por padrão, e revelar profundidade conforme o usuário quer ir mais fundo.

---

## 2. Princípios de Design do SyncLife

**1. Contexto sempre visível:** O usuário nunca deve se perguntar "onde estou?" ou "qual
mês estou vendo?". O contexto temporal e o módulo atual são sempre explícitos.

**2. Uma ação principal por tela:** Cada tela tem um botão/ação primária óbvia. O usuário
não precisa decidir entre muitas opções ao mesmo tempo.

**3. Feedback imediato:** Toda ação do usuário tem resposta visual em menos de 200ms.
Salvar, excluir, confirmar — sempre com toast, animação ou mudança visual.

**4. Dados são meios, não fins:** O SyncLife não é uma planilha. Os dados existem para
gerar insights e decisões, não para serem admirados. A interface deve sempre "dizer algo"
sobre os dados, não apenas exibi-los.

**5. Mobile-first, mas não mobile-only:** O layout é projetado primeiro para telas de 375px
e escala elegantemente para 1440px+. No desktop, o espaço extra é usado para mostrar mais
contexto, não para tornar elementos maiores.

---

## 3. Arquitetura de Navegação

### O Problema da Sidebar Poluída

Com 3 módulos no MVP v2 (Finanças, Metas, Agenda) e mais 4+ chegando no v3+, uma sidebar
tradicional com todos os itens visíveis vai parecer um menu de restaurante — muitas opções
sem hierarquia clara.

### Solução: Navegação em Dois Níveis

**Nível 1 — Módulos (barra de módulos):** Uma barra vertical muito fina com apenas ícones
grandes, representando cada módulo principal. Fica sempre visível na extremidade esquerda.
O usuário clica no ícone do módulo para entrar nele.

**Nível 2 — Seções do módulo (sidebar expansível):** Ao selecionar um módulo, uma sidebar
secundária abre ao lado, mostrando as seções daquele módulo. Essa sidebar pode ser colapsada
(só ícones pequenos) ou expandida (ícones + labels). O estado fica salvo na preferência do
usuário.

**Resultado visual:**

```
┌──┬─────────────┬──────────────────────────────────────────────────┐
│  │             │                                                  │
│🏠│  💰 Finanças │  [Conteúdo principal do módulo]                  │
│  │  ─────────  │                                                  │
│💰│  📊 Dashboard│                                                  │
│  │  💳 Transações                                                 │
│🎯│  🔄 Recorrentes                                                │
│  │  📅 Calendário                                                 │
│📅│  📈 Planejamento                                               │
│  │  💼 Orçamentos                                                 │
│⚙️│  📄 Relatórios                                                 │
│  │             │                                                  │
└──┴─────────────┴──────────────────────────────────────────────────┘
  ↑                ↑
  Barra de          Sidebar do
  Módulos           Módulo Atual
  (sempre visível)  (expansível)
```

**No mobile:** A barra de módulos vira uma barra de navegação inferior (bottom tab bar),
igual ao Instagram ou WhatsApp. A sidebar some — as seções do módulo ficam acessíveis
por um menu hambúrguer ou aba no topo da tela.

```
┌───────────────────────────────────────┐
│                                       │
│  [Conteúdo do módulo]                 │
│                                       │
│                                       │
│                                       │
├───────────────────────────────────────┤
│  🏠    💰    🎯    📅    ⚙️           │
│ Home  Fin  Metas Agenda Config        │
└───────────────────────────────────────┘
```

### Hierarquia de Navegação

```
SyncLife
├── 🏠 Home (Dashboard Unificado)
├── 💰 Finanças
│   ├── Dashboard Financeiro
│   ├── Transações
│   ├── Recorrentes
│   ├── Orçamentos
│   ├── Calendário Financeiro
│   ├── Planejamento Futuro
│   └── Relatórios
├── 🎯 Metas
│   ├── Minhas Metas
│   └── Nova Meta
├── 📅 Agenda
│   ├── Semanal (padrão)
│   ├── Mensal
│   └── Novo Evento
└── ⚙️ Configurações
    ├── Perfil
    ├── Modo de Uso (Foco/Jornada)
    ├── Notificações
    ├── Categorias
    ├── Integrações
    └── Plano
```

### Por que não um menu lateral tradicional com tudo junto?

Porque o usuário não precisa ver "Relatórios" quando está em Metas. A navegação em dois
níveis resolve isso: a sidebar sempre mostra apenas o contexto do módulo atual. Isso
reduz a carga cognitiva (o número de opções que o cérebro precisa processar) e torna
o produto mais focado.

---

## 4. Layout por Tela — Especificação

### 4.1 Dashboard Unificado (Home)

**Desktop:**
```
┌─────────────────────────────────────────────────────────────┐
│  SyncLife              [Fevereiro 2026]     [👤 Thiago]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [MODO JORNADA — Life Sync Score: 74 ↑ +3 esta semana]    │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │  💰 Receitas  │  📤 Despesas  │  💚 Saldo   │            │
│  │  R$ 5.000    │  R$ 3.200    │  R$ 1.800   │            │
│  │  ↑ vs mês ant│  ↓ vs mês ant│  ↑ vs mês  │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  📅 Esta Semana     │  │  🎯 Metas em Destaque       │ │
│  │  Seg: Reunião 14h   │  │  Viagem Europa: 28%         │ │
│  │  Qua: Pagar aluguel │  │  Reserva Emergência: 65%    │ │
│  │  Sex: Gym 7h        │  │  + 2 metas ativas           │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  💡 Análise do mês (IA) — "Em fevereiro você reduziu..." ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📈 Planejamento: Saldo projetado para os próximos 3 meses│
│  │  [███████████████████▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░]    ││
│  │  Fev R$1.8k    Mar R$2.2k    Abr R$1.1k (IPVA!)        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Mobile (simplificado):**
```
┌────────────────────────────┐
│  Fevereiro 2026    [👤]   │
├────────────────────────────┤
│  Score: 74 ↑               │  (Modo Jornada)
│                            │
│  Receitas    Despesas      │
│  R$ 5.000   R$ 3.200      │
│  Saldo: R$ 1.800           │
│                            │
│  [Gráfico pizza compacto]  │
│                            │
│  ── Esta Semana ──         │
│  • Reunião cliente - seg   │
│  • Pagar aluguel - qua     │
│                            │
│  ── Metas ──               │
│  Viagem: 28% ████░░░░      │
│                            │
│  [+ Adicionar]             │
└────────────────────────────┘
```

### 4.2 Tela de Planejamento Futuro

**Desktop (layout horizontal — a mais importante):**
```
┌─────────────────────────────────────────────────────────────┐
│  📈 Planejamento Futuro      [3 meses ▼]   [+ Adicionar]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Saldo atual: R$ 1.800                                      │
│                                                             │
│  SALDO PROJETADO:                                           │
│  R$ 2.000 ──────────────────╮                              │
│                              │  ← Queda pelo IPVA          │
│                              ╰───────────────╮              │
│  R$ 0 ─────────────────────────────────────── Mar Abr Mai  │
│                                                             │
│  ─────────────────── EVENTOS ──────────────────────────    │
│  FEV:                                                       │
│  🔵 25 - Aluguel R$ 1.500 (recorrente)                     │
│  🟢 28 - Salário R$ 5.000 (recorrente)                     │
│                                                             │
│  MAR:                                                       │
│  🔵 10 - Netflix R$ 47 (recorrente)                        │
│  🟣 15 - IPVA R$ 1.200 (planejado) ⚠️                      │
│  🟢 31 - Salário R$ 5.000 (recorrente)                     │
│                                                             │
│  ABR:                                                       │
│  🟣 01 - Meta: Viagem R$ 800 (contribuição)                │
│  🔵 05 - Condomínio R$ 450 (recorrente)                    │
│  🟢 30 - Salário R$ 5.000 (recorrente)                     │
│                                                             │
│  ────────────────────────────────────────────────────────  │
│  💡 Em março, seu saldo cai para R$ 620 por causa do IPVA. │
│     Quer criar um envelope de reserva para isso?           │
│                          [Ignorar]  [Criar envelope ▶]     │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Tela de Metas (Lista)

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Minhas Metas                           [+ Nova Meta]   │
├─────────────────────────────────────────────────────────────┤
│  3 ativas · 1 concluída · 0 em risco                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✈️ Viagem para Europa           🟡 Em risco          │  │
│  │  Meta: R$ 15.000  Acumulado: R$ 4.200 (28%)          │  │
│  │  ████████░░░░░░░░░░░░░░░░░░░░░░ 28%                  │  │
│  │  Prazo: Dez 2026 · Faltam R$ 10.800                  │  │
│  │  Ritmo atual: R$ 700/mês · Necessário: R$ 1.100/mês  │  │
│  │                      [Ver detalhes] [Registrar progresso] │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🛡️ Reserva de Emergência        🟢 No caminho        │  │
│  │  Meta: R$ 15.000  Acumulado: R$ 9.750 (65%)          │  │
│  │  ████████████████████░░░░░░░░░░ 65%                  │  │
│  │  Prazo: Jun 2026 · R$ 5.250 restante                 │  │
│  │  Ritmo: R$ 1.050/mês · ✅ Dentro do planejado        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📚 Certificação AWS              🟢 No caminho        │  │
│  │  Progresso: 40% do material      ████████░░░░░░░░░░░  │  │
│  │  Prazo: Mai 2026 · 3 sessões/semana agendadas         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ✅ CONCLUÍDAS (1)                           [Ver todas]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Sistema de Cores e Tokens de Design

### Paleta Principal

```
MODO CLARO (Light):
Background:     #ffffff (branco puro)
Surface:        #f8fafc (slate-50)
Surface Alt:    #f1f5f9 (slate-100)
Border:         #e2e8f0 (slate-200)
Text Primary:   #0f172a (slate-900)
Text Secondary: #64748b (slate-500)

MODO ESCURO (Dark) — atual do v1:
Background:     #0a0a0a (quase preto)
Surface:        #111111 (slate-900 ajustado)
Surface Alt:    #1a1a1a (slate-800)
Border:         #2a2a2a (slate-700)
Text Primary:   #f8fafc (slate-50)
Text Secondary: #94a3b8 (slate-400)
```

### Cor de Acento por Módulo

Cada módulo tem sua cor identitária. Isso ajuda o usuário a saber visualmente em qual
módulo está, mesmo sem ler o texto.

```
Finanças:  Indigo (#6366f1) — transmite confiança, seriedade financeira
Metas:     Violet (#7c3aed) — transmite aspiração, crescimento
Agenda:    Sky (#0ea5e9) — transmite organização, clareza, tempo
Saúde:     Emerald (#10b981) — saúde, vitalidade (v3)
Estudos:   Amber (#f59e0b) — conhecimento, energia (v3)
Carreira:  Rose (#f43f5e) — ambição, destaque (v3)
```

### Cores Funcionais (iguais nos dois modos)

```
Verde (positivo/sucesso):  #22c55e
Amarelo (atenção/aviso):   #f59e0b
Vermelho (erro/alerta):    #ef4444
Azul (informação):         #3b82f6
```

---

## 6. Modo Foco vs. Modo Jornada — Diferenciação Visual Detalhada

### Modo Foco — "O Painel de Controle"

**Conceito:** Interface limpa, sem distrações, focada em dados objetivos. Como um cockpit
de avião — tudo que precisa, nada que não precisa.

**Características visuais:**
- Sidebar compacta: apenas ícones, sem labels (o hover mostra o tooltip)
- Header: mostra só o nome da tela e o mês/período
- Cards: borda sutil, sem sombras fortes, dados em destaque
- Tipografia: fonte mono para números (transmite precisão técnica)
- Sem animações de entrada — elementos aparecem instantaneamente
- Paleta de cores: tons frios (slate, blue, gray)
- Botões: sem bordas arredondadas excessivas, mais "quadrados"
- Ícones de conquistas: aparecem apenas como um número no perfil (+3 conquistas)
- Empty states: texto curto e direto ("Sem transações em fevereiro. [Adicionar]")

**Exemplo de saudação no header:**
> "Fevereiro 2026"

**Exemplo de alerta de orçamento:**
> "Alimentação: R$ 720 / R$ 800 (90%)"

### Modo Jornada — "O Diário de Evolução"

**Conceito:** Interface calorosa, motivacional, que celebra o progresso. Como ter um
coach pessoal no bolso.

**Características visuais:**
- Sidebar expandida: ícones + labels + mini barra de progresso do Life Sync Score
- Header: "Boa tarde, Thiago! ✨" com frase motivacional rotativa
- Cards: sombras suaves, gradientes sutis, mais arredondados
- Tipografia: fonte arredondada para números (mais amigável)
- Micro-animações: cards surgem com fade-in suave, progresso anima ao carregar
- Paleta de cores: tons quentes (violet, indigo, amber, emerald)
- Botões: bastante arredondados (border-radius grande)
- Ícones de conquistas: aparecem com animação ao desbloquear
- Empty states: mensagem encorajadora com ilustração ("Que tal registrar o primeiro
  gasto do mês? Cada detalhe conta para sua visão financeira! 🌱")

**Exemplo de saudação no header:**
> "Boa tarde, Thiago! Você está evoluindo. 🌟"

**Exemplo de alerta de orçamento:**
> "Quase no limite de Alimentação! Faltam apenas R$ 80. Quer ajustar o orçamento?"

**Life Sync Score no Modo Jornada:**
```
┌─────────────────────────────┐
│   LIFE SYNC SCORE           │
│          74                 │
│   ████████████████░░░░      │
│   ↑ +3 esta semana          │
│   "Você está consistente!"  │
└─────────────────────────────┘
```

### O Toggle de Modo

Na tela de configurações, o toggle de modo tem uma interface visual que mostra claramente
a diferença entre os dois modos antes de o usuário trocar:

```
┌─────────────────────────────────────────────────────────────────┐
│  Como você quer usar o SyncLife?                                │
│                                                                 │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │  🎯 MODO FOCO         │    │  🌱 MODO JORNADA       │       │
│  │  ───────────          │    │  ─────────────         │       │
│  │  Direto ao ponto.     │    │  Acompanhe sua         │       │
│  │  Dados precisos.      │    │  evolução.             │       │
│  │  Sem distrações.      │    │  Celebre conquistas.   │       │
│  │                       │    │                         │       │
│  │  ✓ Interface compacta │    │  ✓ Life Sync Score      │       │
│  │  ✓ Sem animações      │    │  ✓ Motivação diária     │       │
│  │  ✓ Foco nos números   │    │  ✓ Review semanal       │       │
│  │                       │    │                         │       │
│  │  [Ativo ✓]            │    │  [Mudar para Jornada]  │       │
│  └───────────────────────┘    └───────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Componentes de UI Críticos

### 7.1 Card de Módulo (Dashboard)

Cada módulo no dashboard tem um card de resumo com: ícone do módulo na cor identitária,
título, dado principal (em destaque grande), dado secundário, e um link "Ver tudo →".

### 7.2 Barra de Progresso de Orçamento (Envelope)

A barra muda de cor conforme o uso:
- 0–59%: Verde (#22c55e) — "Tranquilo"
- 60–79%: Amarelo (#f59e0b) — "Atenção"
- 80–99%: Laranja (#f97316) — "Quase no limite"
- 100%+: Vermelho (#ef4444) + barra que "transborda" visualmente

### 7.3 Linha do Tempo de Planejamento

Os eventos na linha do tempo têm cores distintas:
- 🔵 Azul: despesa recorrente comprometida
- 🟢 Verde: receita recorrente comprometida
- 🟣 Roxo: evento pontual planejado (manual)
- 🟡 Amarelo: evento vinculado a meta
- ⚫ Cinza: evento do Google Calendar (leitura)

### 7.4 Notificações In-App (Toast)

Aparecem no canto superior direito (desktop) ou no topo (mobile):
- ✅ Sucesso: fundo verde, ícone de check, desaparece em 3s
- ⚠️ Aviso: fundo amarelo, ícone de alerta, desaparece em 5s
- ❌ Erro: fundo vermelho, ícone de X, requer dismiss manual
- 🏆 Conquista: fundo com gradiente dourado, animação de estrelas, 5s

---

## 8. Responsividade — Breakpoints

| Breakpoint | Largura | Layout |
|------------|---------|--------|
| Mobile | < 640px | Bottom tabs, sem sidebar, layout single column |
| Tablet | 640–1024px | Bottom tabs, sem sidebar, layout 2 colunas |
| Desktop | > 1024px | Barra de módulos + sidebar + layout 3 colunas |
| Wide | > 1440px | Sidebar sempre expandida, mais espaço para gráficos |

No mobile, o Planejamento Futuro muda de layout horizontal para vertical (scroll down
em vez de scroll horizontal), mantendo a mesma informação.

---

## 9. Como Validar o Layout

Minha recomendação é seguir este processo antes de implementar:

**Passo 1 — Referências visuais (moodboard):** Coletar capturas de tela dos apps que
servem de inspiração para o SyncLife: Linear (navegação em dois níveis), Monarch Money
(dashboard financeiro), Todoist (gestão de tarefas), Notion (sidebars), Fabulous (modo
jornada). Criar um moodboard no Figma, Notion ou até uma pasta de imagens.

**Passo 2 — Protótipos HTML simples:** Antes de codificar o Next.js real, criar protótipos
HTML estáticos das telas mais complexas: Dashboard unificado, Planejamento futuro, Lista
de metas. Usar TailwindCSS via CDN (já está no projeto). O objetivo não é ser bonito —
é validar o layout e a navegação.

**Passo 3 — Teste com 3-5 pessoas:** Mostrar os protótipos para pessoas do perfil-alvo
(25-45 anos, vida corrida) e observar sem falar. Ver onde o dedo hesita, o que confunde,
o que agrada. As dúvidas deles valem mais que qualquer opinião técnica.

**Passo 4 — Iterar e depois codificar:** Com o feedback, ajustar os protótipos antes de
escrever código. É sempre mais fácil mover um div em HTML do que refatorar um componente
React completo.

**Ferramentas gratuitas para protótipos:** Figma (versão free), Framer (versão free),
ou simplesmente HTML + Tailwind (já familiar no projeto).

**Posso ajudar:** Consigo analisar layouts, sugerir melhorias de UX, identificar problemas
de usabilidade, comparar com benchmarks e descrever como implementar componentes específicos.
O que não consigo fazer diretamente é criar o arquivo de design visual (.fig) e ver o
resultado em tempo real — mas posso gerar HTML/JSX dos componentes para você visualizar
no browser.

---

## 10. Próximos Passos de Design

1. Criar protótipo HTML do Dashboard Unificado (Modo Foco e Modo Jornada — dois arquivos)
2. Criar protótipo HTML da tela de Planejamento Futuro
3. Criar protótipo HTML da tela de Metas (lista)
4. Testar com 3-5 pessoas e coletar feedback
5. Definir design system (tokens de cor, tipografia, espaçamento) em um arquivo CSS global
6. Implementar no Next.js com os componentes shadcn/ui como base

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0*
