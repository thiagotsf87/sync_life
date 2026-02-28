# ADR-001 — Nomenclatura e Reestruturação Arquitetural do MVP v3

> **Architecture Decision Record**
> **Data:** Fevereiro 2026
> **Status:** ✅ Aprovado
> **Impacto:** Alto — afeta todos os módulos, navegação, onboarding, branding e modelo de dados
> **Versão anterior:** MVP v3 Especificação v1.0
> **Versão resultante:** MVP v3 Especificação v2.0

---

## ÍNDICE

1. [Contexto e Motivação](#1-contexto-e-motivação)
2. [Decisão 1: Nomenclatura dos Módulos](#2-decisão-1-nomenclatura-dos-módulos)
3. [Decisão 2: Reestruturação Metas → Futuro (Objetivos)](#3-decisão-2-reestruturação-metas--futuro)
4. [Decisão 3: Estratégia de Exibição (Nome + Subtítulo)](#4-decisão-3-estratégia-de-exibição)
5. [Alternativas Avaliadas e Descartadas](#5-alternativas-avaliadas-e-descartadas)
6. [Impacto nas Entregas Existentes](#6-impacto-nas-entregas-existentes)
7. [Plano de Migração v2 → v3](#7-plano-de-migração)
8. [Glossário de Termos](#8-glossário-de-termos)
9. [Registro de Decisões Complementares](#9-registro-de-decisões-complementares)

---

## 1. CONTEXTO E MOTIVAÇÃO

### 1.1 O Problema

O MVP v3 adiciona 5 novos módulos ao SyncLife (Saúde, Investimentos, Estudos, Carreira, Viagem). Com 8 módulos no total, dois problemas emergiram durante o planejamento:

**Problema 1 — Identidade genérica:** Os nomes funcionais (Saúde, Investimentos, Estudos, Viagem) fazem o SyncLife parecer uma coleção de apps separados colados juntos. Não transmitem a proposta de "sistema operacional da vida pessoal". Qualquer concorrente pode ter módulos com esses mesmos nomes.

**Problema 2 — Metas como silos:** O módulo "Metas" do v2 trata metas como itens isolados (economizar R$ 10.000, perder 5kg, ler 12 livros). Isso gera três deficiências: falta de propósito (o usuário esquece o porquê), visão fragmentada (meta financeira num lugar, meta de saúde em outro) e ausência de conexão entre dimensões da vida.

### 1.2 O Objetivo das Mudanças

Criar uma identidade de produto única que nenhum concorrente replica facilmente, e reestruturar o sistema de metas para que o SyncLife responda não "como está minha meta financeira?" mas sim **"como está meu progresso rumo ao sonho de ter uma casa própria?"** — com a resposta envolvendo finanças, investimentos, carreira e tempo, tudo integrado.

### 1.3 Princípio Norteador

Cada módulo do SyncLife deve responder a uma pergunta pessoal sobre a vida do usuário:

> "Como está meu(minha) ___?"

Se o nome do módulo completa essa frase de forma natural e poderosa, é o nome certo.

---

## 2. DECISÃO 1: NOMENCLATURA DOS MÓDULOS

### 2.1 Tabela Comparativa Completa

| # | Nome v2 / Original | Nome v3 Aprovado | Tipo de Nome | Justificativa da Mudança |
|---|---------------------|------------------|--------------|--------------------------|
| 1 | Finanças | **Finanças** (mantido) | Funcional | Ancora na clareza. Módulo fundador, mais robusto, usuários já reconhecem |
| 2 | Agenda | **Tempo** | Conceitual | "Agenda" é concreto mas limitante. "Tempo" abrange gestão de tempo como recurso de vida |
| 3 | Metas | **Futuro** | Conceitual | Reestruturado completamente. De lista de metas para cockpit de objetivos de vida |
| 4 | Saúde (novo) | **Corpo** | Conceitual | "Saúde" soa clínico, como app hospitalar. "Corpo" transmite autocuidado e evolução pessoal |
| 5 | Estudos (novo) | **Mente** | Conceitual | "Estudos" limita a contexto acadêmico. "Mente" permite leitura, meditação, journaling no futuro |
| 6 | Investimentos (novo) | **Patrimônio** | Conceitual | "Investimentos" limita a ações/FIIs. "Patrimônio" abrange imóveis, veículos, bens |
| 7 | Carreira (novo) | **Carreira** (mantido) | Funcional | Já transmite o conceito correto. Não precisa de abstração |
| 8 | Viagem (novo) | **Experiências** | Conceitual | "Viagem" limita a deslocamento. "Experiências" permite eventos, shows, hobbies no futuro |

### 2.2 Padrão de Nomenclatura

A nomenclatura final é **híbrida por design**, não por acidente:

- **6 nomes conceituais:** Tempo, Futuro, Corpo, Mente, Patrimônio, Experiências — criam a camada aspiracional e emocional do SyncLife
- **2 nomes funcionais:** Finanças, Carreira — ancoram a lista na realidade e na clareza imediata

Esse equilíbrio é intencional. Um app com 100% nomes conceituais pode parecer vago ou pretensioso. Os dois nomes funcionais (Finanças e Carreira) são os mais "sérios" e diretos, dando peso e credibilidade à lista. Os conceituais ao redor criam identidade.

### 2.3 O Teste da Pergunta

Cada nome aprovado passa no teste "Como está meu(minha) ___?":

| Pergunta | Sensação |
|----------|----------|
| "Como está meu **Futuro**?" | Poderosa, motivacional, abrangente |
| "Como está meu **Corpo**?" | Pessoal, autocuidado, evolução |
| "Como está minha **Mente**?" | Profunda, desenvolvimento pessoal |
| "Como está meu **Patrimônio**?" | Sofisticada, visão de longo prazo |
| "Como está meu **Tempo**?" | Reflexiva, gestão de vida |
| "Como estão minhas **Experiências**?" | Aspiracional, qualidade de vida |
| "Como estão minhas **Finanças**?" | Direta, controle, seriedade |
| "Como está minha **Carreira**?" | Objetiva, crescimento profissional |

### 2.4 Análise Detalhada por Módulo

#### 💰 Finanças (mantido)

**Por que não mudar?** Foram avaliadas 8 alternativas:

| Alternativa | Problema | Veredito |
|-------------|----------|----------|
| Dinheiro | Coloquial demais para orçamento, projeção, relatórios | ❌ Descartado |
| Bolso | Informal, minimiza a seriedade do controle financeiro | ❌ Descartado |
| Caixa | Restritivo, implica só saldo (módulo tem orçamento, projeção, relatórios) | ❌ Descartado |
| Cofre | Implica guardar dinheiro, mas módulo também trata gastos e planejamento | ❌ Descartado |
| Fluxo | Único, remete a fluxo de caixa. Abstrato para leigos, mas funcional com subtítulo | ⚠️ Segunda opção |
| Grana | Juvenil, destoa da seriedade | ❌ Descartado |
| Renda | Foca no que entra, ignora o que sai | ❌ Descartado |
| Equilíbrio | Confunde com equilíbrio emocional/mental | ❌ Descartado |

**Decisão final:** Manter "Finanças". É o módulo fundador, o mais robusto, e usuários do v2 já reconhecem o nome. "Carreira" também é funcional e funciona na lista — ter dois nomes diretos ancora a identidade na realidade.

**Nota:** Se no futuro houver necessidade de mudança, "Fluxo" é a alternativa reservada.

#### ⏳ Tempo (antes: Agenda)

**Por que mudar?** "Agenda" é uma ferramenta. "Tempo" é um recurso de vida. O SyncLife não é um calendário — é um sistema que ajuda o usuário a gerenciar como distribui o recurso mais precioso que tem.

**Risco identificado:** "Tempo" é abstrato. Usuário pode não entender imediatamente que ali marca compromissos. **Mitigação:** Subtítulo "Agenda e compromissos" resolve 100% da ambiguidade.

#### 🔮 Futuro (antes: Metas)

**Por que mudar?** Mudança mais profunda do v3. Não é apenas renomeação — é reestruturação completa. Detalhes na [Decisão 2](#3-decisão-2-reestruturação-metas--futuro).

**Por que "Futuro" e não "Horizonte"?** "Horizonte" é bonito mas distante — algo que se vê mas nunca se alcança literalmente. "Futuro" é algo que **chega**. Cada objetivo é algo que o usuário quer para o futuro dele. "Como está meu Futuro?" é uma pergunta que gera engajamento imediato. Quando o usuário vê objetivos com progresso avançando, a sensação é de **construir o futuro ativamente**.

No Modo Jornada, frases como "Seu Futuro está 64% mais perto este mês" soam naturais. Com "Horizonte", seriam forçadas.

#### 🏃 Corpo (antes: Saúde)

**Por que mudar?** "Saúde" evoca consultório médico, exame de sangue, doença. "Corpo" evoca academia, bem-estar, evolução, autoconhecimento. O SyncLife não é um prontuário — é uma ferramenta de evolução pessoal.

**Benefício adicional:** "Corpo" permite no futuro incluir funcionalidades de bem-estar que não são estritamente "saúde": registro de humor, qualidade do sono, hidratação, meditação física (yoga, alongamento).

#### 🧠 Mente (antes: Estudos)

**Por que mudar?** "Estudos" limita a contexto acadêmico (provas, cursos, universidade). "Mente" abrange desenvolvimento cognitivo completo: estudos formais, leitura, meditação, journaling, desenvolvimento de habilidades mentais.

**Benefício adicional:** Permite no futuro adicionar: hábito de leitura (livros/mês), prática de meditação (integração com Corpo), journaling diário, exercícios de mindfulness. Tudo sem que o nome "Estudos" pareça deslocado.

#### 📈 Patrimônio (antes: Investimentos)

**Por que mudar?** "Investimentos" implica ações, FIIs, renda variável. "Patrimônio" abrange a riqueza total: investimentos financeiros + imóveis + veículos + bens de valor. Isso prepara o módulo para evolução futura sem necessidade de renomear.

**Escopo v3:** Apenas investimentos financeiros (carteira, proventos, simulador). **Escopo futuro:** Cadastro de imóveis, veículos, bens com valor de mercado, cálculo de patrimônio líquido total.

#### 💼 Carreira (mantido)

**Por que não mudar?** "Carreira" já é conceitual e funcional ao mesmo tempo. Transmite crescimento, trajetória, evolução — sem ser abstrato demais. Não existe nome melhor.

#### ✈️ Experiências (antes: Viagem)

**Por que mudar?** "Viagem" limita a deslocamento geográfico. "Experiências" abrange tudo que o usuário quer *viver*: viagens (caso de uso principal no v3), mas no futuro também: eventos marcantes, shows, restaurantes especiais, hobbies, aventuras.

**Nome interno (branding):** O nome de produto interno pode ser **SyncTrip** para a funcionalidade de viagem, enquanto o módulo se chama "Experiências". Isso permite que "SyncTrip" vire um sub-produto dentro de "Experiências".

---

## 3. DECISÃO 2: REESTRUTURAÇÃO METAS → FUTURO

### 3.1 O Problema Central

O módulo "Metas" do v2 funciona assim:
- Usuário cria meta: "Economizar R$ 60.000"
- Meta vive no módulo Metas
- Progresso é manual ou vinculado a uma categoria financeira
- Cada meta é independente das demais

Isso funciona para o v2 (que é focado em finanças), mas no v3 com 8 módulos, o modelo quebra:

> "Comprar um carro" — é meta financeira? É objetivo de vida? Onde fica?
> "Viajar para Europa" — é meta financeira (economia) ou experiência (planejamento)?
> "Ser promovido" — é carreira? É educação (precisa estudar)? É financeiro (vai ganhar mais)?

A resposta é: **é tudo ao mesmo tempo**. E o modelo do v2 não suporta isso.

### 3.2 A Nova Arquitetura: Objetivo → Metas

**Conceito fundamental:**

| Conceito | Definição | Exemplo | Pergunta |
|----------|-----------|---------|----------|
| **Objetivo** | Qualitativo, aspiracional. O sonho com intenção. | "Comprar minha casa própria" | O que eu quero para minha vida? |
| **Meta** | Quantitativa, mensurável. O caminho concreto. | "Economizar R$ 200.000 até Dez/2028" | Como sei que estou progredindo? |

**Relação hierárquica:**
- Um Objetivo mora no módulo **Futuro** (cockpit central)
- Um Objetivo contém 1 a N **Metas**
- Cada Meta pertence a um **módulo específico** (Finanças, Corpo, Mente, etc.)
- Cada Meta é tipada conforme o módulo (valor monetário, peso corporal, horas de estudo, etc.)
- Progresso do Objetivo = média ponderada dos progressos das Metas

### 3.3 Antes vs Depois

**Antes (v2) — Modelo plano:**
```
Módulo Metas
├── Meta: Economizar R$ 60.000 (progresso: 42%)
├── Meta: Perder 10kg (progresso: 30%)
├── Meta: Ler 12 livros (progresso: 50%)
└── Meta: Concluir curso React (progresso: 80%)

→ 4 metas isoladas sem conexão entre si
→ Usuário não percebe que estudar React o aproxima da promoção
→ Sem contexto: POR QUE economizar R$ 60.000?
```

**Depois (v3) — Modelo hierárquico:**
```
Módulo Futuro (Cockpit de Vida)
│
├── 🎯 Objetivo: "Comprar um carro"
│   ├── 💰 Meta: Economizar R$ 60.000 (Finanças) → 42%
│   ├── 📈 Meta: Investir reserva em CDB (Patrimônio) → 50%
│   └── ⏳ Meta: Pesquisar modelos (Tempo) → 0%
│   └── Progresso do Objetivo: 31%
│
├── 🎯 Objetivo: "Ser promovido a Tech Lead"
│   ├── 🧠 Meta: Concluir curso React (Mente) → 80%
│   ├── 💼 Meta: Liderar 2 projetos (Carreira) → 50%
│   └── 🧠 Meta: Certificação AWS (Mente) → 20%
│   └── Progresso do Objetivo: 50%
│
└── 🎯 Objetivo: "Ficar saudável"
    ├── 🏃 Meta: Perder 10kg (Corpo) → 30%
    ├── 🏃 Meta: 4x academia/semana (Corpo) → 75%
    └── 🧠 Meta: Ler 12 livros de bem-estar (Mente) → 50%
    └── Progresso do Objetivo: 52%

→ Cada meta mora no módulo certo E aparece no Objetivo
→ Progresso em qualquer módulo reflete no Futuro automaticamente
→ Contexto claro: R$ 60.000 é para comprar o carro
→ Conexão visível: estudar React → promoção → mais dinheiro
```

### 3.4 Fluxo Bidirecional

O aspecto mais poderoso da nova arquitetura é a **bidirecionalidade**:

```
┌──────────────────────────────────────────────────┐
│                    FUTURO                          │
│  Objetivo: "Ser promovido a Tech Lead"            │
│  Progresso: 50% ←── recalcula automaticamente     │
└──────┬───────────────────┬───────────────────┬────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🧠 MENTE    │  │ 💼 CARREIRA  │  │  🧠 MENTE    │
│              │  │              │  │              │
│ Trilha React │  │ Roadmap Step │  │ Trilha AWS   │
│ Avançado     │  │ "Liderar     │  │ Certification│
│              │  │  2 projetos" │  │              │
│ Progresso:   │  │ Progresso:   │  │ Progresso:   │
│ 80% ─────────│──│──────────────│──│──► atualiza  │
│              │  │ 50%          │  │  Objetivo    │
└──────────────┘  └──────────────┘  └──────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
    Usuário             Usuário             Usuário
    marca etapa         marca passo         marca etapa
    na trilha           no roadmap          na trilha
```

O usuário interage com cada módulo normalmente (marca etapa na trilha, conclui step do roadmap). O progresso sobe automaticamente para o Objetivo no Futuro. Não precisa entrar no módulo Futuro para atualizar — tudo sincroniza.

### 3.5 Impacto no Produto

| Aspecto | Antes (v2) | Depois (v3) |
|---------|------------|-------------|
| Proposta de valor | "Organize suas metas" | "Construa seu futuro" |
| Pergunta central | "Como estão minhas metas?" | "Como está meu futuro?" |
| Engajamento | Atualizar meta manualmente | Progresso automático ao usar qualquer módulo |
| Visão de vida | Fragmentada (lista de metas) | Unificada (cockpit com radar de dimensões) |
| Modo Jornada | Frases por meta | "Seu Futuro está 64% construído — Mente é sua área mais forte" |
| Retenção | Usuário esquece de atualizar metas | Progresso atualiza sozinho, gerando dopamina passiva |

### 3.6 Por que essa mudança é um diferencial competitivo

Nenhum app no mercado oferece essa visão integrada. Comparação:

| App | O que oferece | O que falta |
|-----|---------------|-------------|
| Habitica | Gamificação de hábitos | Sem conexão entre hábitos e vida financeira/carreira |
| Notion | Organização genérica | Sem cálculos automáticos, sem integração entre áreas |
| ClickUp Goals | Metas com OKRs | Focado em trabalho, não em vida pessoal |
| Strides | Tracking de hábitos | Sem hierarquia objetivo→meta, sem módulos especializados |
| **SyncLife Futuro** | Objetivos de vida com metas distribuídas em módulos especializados, progresso automático bidirecional | — |

---

## 4. DECISÃO 3: ESTRATÉGIA DE EXIBIÇÃO

### 4.1 O Problema da Abstração

Nomes conceituais são bonitos mas podem confundir se não tiverem contexto. "Mente" é lindo, mas o usuário novato pode pensar "o que é isso?".

### 4.2 A Solução: Nome + Subtítulo

Cada módulo tem dois níveis de informação:

**Nível 1 — Module Bar (barra lateral de ícones):**
Apenas ícone + nome curto conceitual. Para quem já conhece o app.

```
🏃 Corpo
🧠 Mente
📈 Patrimônio
```

**Nível 2 — Sidebar expandida:**
Nome conceitual + subtítulo descritivo. Para clareza.

```
🏃 Corpo
   Saúde e atividades

🧠 Mente
   Estudos e aprendizado

📈 Patrimônio
   Investimentos e ativos
```

**Nível 3 — Onboarding (primeira vez):**
Nome conceitual + frase explicativa. Para quem não conhece nada.

```
🏃 Corpo
   "Acompanhe sua saúde, consultas, evolução física e nutrição"

🧠 Mente
   "Organize seus estudos, trilhas de aprendizado e sessões de foco"
```

### 4.3 Mapa Completo de Exibição

| Ícone | Module Bar | Sidebar Expandida | Onboarding | Header da Tela |
|-------|-----------|-------------------|------------|----------------|
| 💰 | Finanças | Finanças e orçamento | Controle total do seu dinheiro: orçamento, fluxo de caixa e planejamento | Finanças |
| ⏳ | Tempo | Agenda e compromissos | Organize sua agenda, compromissos e gestão do tempo | Tempo |
| 🔮 | Futuro | Objetivos e metas de vida | Defina seus sonhos e acompanhe o progresso rumo a cada um | Futuro |
| 🏃 | Corpo | Saúde e atividades | Acompanhe saúde, consultas, evolução física e nutrição | Corpo |
| 🧠 | Mente | Estudos e aprendizado | Organize estudos, trilhas de aprendizado e sessões de foco | Mente |
| 📈 | Patrimônio | Investimentos e ativos | Gerencie sua carteira de investimentos e evolução patrimonial | Patrimônio |
| 💼 | Carreira | Profissão e crescimento | Planeje sua trajetória profissional e evolução na carreira | Carreira |
| ✈️ | Experiências | Viagens e roteiros | Planeje viagens de ponta a ponta com roteiro, orçamento e dicas | Experiências |

---

## 5. ALTERNATIVAS AVALIADAS E DESCARTADAS

### 5.1 Nomenclatura 100% Conceitual

**Proposta:** Usar nomes conceituais para TODOS os módulos, incluindo Finanças → "Fluxo" ou "Bolso".

**Por que descartada:** Finanças é o módulo fundador do SyncLife, o mais robusto e reconhecido. Trocar o nome criaria ruptura desnecessária com usuários do v2. Além disso, dois nomes funcionais (Finanças e Carreira) ancoram a lista na realidade e dão credibilidade.

### 5.2 Nomenclatura 100% Funcional

**Proposta:** Manter nomes descritivos para todos: Finanças, Agenda, Metas, Saúde, Estudos, Investimentos, Carreira, Viagem.

**Por que descartada:** O SyncLife pareceria uma coleção de apps genéricos. Sem identidade diferenciada. Qualquer concorrente pode ter os mesmos nomes de módulo.

### 5.3 "Horizonte" para o módulo de objetivos

**Proposta:** Usar "Horizonte" em vez de "Futuro".

**Por que descartada:** "Horizonte" é bonito mas distante — algo que se vê mas nunca se alcança literalmente. "Futuro" é algo que **chega**. As frases do Modo Jornada ficam naturais com "Futuro" ("Seu Futuro está 64% mais perto") e forçadas com "Horizonte".

### 5.4 Metas como camada dentro de cada módulo (sem módulo central)

**Proposta:** Não ter módulo Futuro. Cada módulo teria suas próprias metas e um "dashboard de metas" seria apenas uma visão consolidada.

**Por que descartada:** Sem um módulo central, o usuário perde a visão "de cima" da sua vida. O objetivo "comprar um carro" que envolve finanças, patrimônio e tempo não teria um "lar". O módulo Futuro é necessário como cockpit de decisões de vida.

### 5.5 "Bolso" para Finanças

**Proposta:** Usar "Bolso" como nome amigável.

**Por que descartada:** Muito casual para um módulo que inclui orçamento, projeção de fluxo de caixa e relatórios financeiros. Minimiza a percepção de valor e seriedade do controle financeiro.

---

## 6. IMPACTO NAS ENTREGAS EXISTENTES

### 6.1 Protótipos HTML (19 telas aprovadas)

| Protótipo | Impacto | Ação Necessária |
|-----------|---------|-----------------|
| proto-navigation-v3.html | 🔴 Alto | Atualizar Module Bar com novos nomes e ícones |
| proto-landing.html | 🟡 Médio | Atualizar seção de features com nova nomenclatura |
| proto-auth.html | 🟢 Nenhum | Não referencia módulos |
| proto-onboarding.html | 🔴 Alto | Atualizar seleção de módulos com novos nomes |
| proto-transacoes.html | 🟢 Nenhum | Nome "Finanças" não mudou |
| proto-agenda.html | 🟡 Médio | Header deve mostrar "Tempo" em vez de "Agenda" |
| proto-configuracoes.html | 🟡 Médio | Seção de módulos deve usar novos nomes |
| proto-metas-revisado.html | 🔴 Alto | Reestruturar completamente para "Futuro" |
| proto-meta-nova.html | 🔴 Alto | Refazer como Wizard de Objetivo com Metas distribuídas |
| proto-meta-detalhe-revisado.html | 🔴 Alto | Refazer como Detalhe do Objetivo |
| Demais protótipos | 🟢 Nenhum | Não afetados diretamente |

**Resumo:** 5 protótipos precisam de atualização significativa, 3 de ajuste menor, 11 não são afetados.

### 6.2 Dev Specs Existentes (6 prontas)

| Dev Spec | Impacto | Ação Necessária |
|----------|---------|-----------------|
| 15-AUTH-ONBOARDING-DEV-SPEC.md | 🟡 Médio | Atualizar step de seleção de módulos no onboarding |
| 17-NAVEGACAO-SHELL-DEV-SPEC.md | 🔴 Alto | Atualizar Module Bar: nomes, ícones, subtítulos |
| configuracoes-dev-spec.md | 🟡 Médio | Atualizar referências a nomes de módulos |
| Demais specs | 🟢 Nenhum | Não referenciam módulos por nome |

### 6.3 Modelo de Dados

| Tabela | Impacto | Ação |
|--------|---------|------|
| goals (v2) | 🔴 Alto | Migrar para objectives + objective_goals |
| goal_deposits (v2) | 🔴 Alto | Migrar para objective_goals com tipo "monetary" |
| Novas tabelas | — | Criar conforme SPEC-FUTURO.md |

### 6.4 Código Existente (se já implementado)

| Área | Impacto |
|------|---------|
| Rotas / URLs | `/metas` → `/futuro`, `/agenda` → `/tempo` |
| Componentes de navegação | Module Bar, Sidebar — novos nomes/ícones |
| Strings/i18n | Todas as referências textuais aos módulos |
| CSS tokens de cor | Associar cores aos novos nomes de módulo |
| RLS policies | Novas tabelas precisam de RLS |

---

## 7. PLANO DE MIGRAÇÃO

### 7.1 Migração de Dados (v2 → v3)

**Metas do v2 → Objetivos do v3:**

Cada meta existente no v2 se transforma em:
- 1 **Objetivo** no Futuro com o nome da meta original
- 1 **Meta** do tipo correspondente vinculada ao Objetivo

Exemplo:
```
v2: Meta "Economizar R$ 30.000 para entrada do apartamento"
    → Tipo: financeira, Progresso: 45%, Valor: R$ 13.500 / R$ 30.000

v3: Objetivo "Economizar R$ 30.000 para entrada do apartamento"
    → Meta 1: "Economizar R$ 30.000" (Finanças, tipo monetary)
       → Progresso: 45%, current_value: 13.500, target_value: 30.000
```

O usuário pode depois enriquecer o objetivo adicionando mais metas (investir a reserva em CDB, pesquisar imóveis, etc.).

**Script de migração deve:**
1. Preservar todo o histórico e progresso
2. Preservar conquistas vinculadas a metas
3. Criar objetivo + meta 1:1 para cada meta antiga
4. Notificar o usuário sobre a mudança com onboarding educativo
5. Permitir que o usuário "desmembre" objetivos (separar ou agrupar)

### 7.2 Onboarding de Transição

Usuários do v2 que fizerem upgrade para v3 devem ver:

**Tela 1:** "Novidades no SyncLife v3 — Conheça o módulo Futuro"
Explicação visual de como Objetivos funcionam, com exemplo animado.

**Tela 2:** "Suas metas foram migradas"
Lista das metas antigas → novos objetivos. Opção de agrupar ("Essas metas fazem parte do mesmo sonho?").

**Tela 3:** "Novos módulos disponíveis"
Apresentação de Corpo, Mente, Patrimônio, Carreira, Experiências com opção de ativar.

---

## 8. GLOSSÁRIO DE TERMOS

| Termo | Definição no SyncLife |
|-------|-----------------------|
| **Objetivo** | Meta qualitativa de vida. O sonho com intenção. Mora no módulo Futuro. Exemplo: "Comprar minha casa" |
| **Meta** | Indicador quantitativo e mensurável vinculado a um Objetivo. Mora em um módulo específico. Exemplo: "Economizar R$ 200.000" (Finanças) |
| **Módulo** | Área temática do SyncLife. Cada módulo gerencia uma dimensão da vida. |
| **Cockpit** | Visão centralizada do módulo Futuro com todos os objetivos e progresso agregado |
| **Mapa da Vida** | Visualização radial (radar chart) com as 8 dimensões da vida e seus progressos. Feature do Modo Jornada |
| **Nome conceitual** | Nome aspiracional/emocional de um módulo (ex: Corpo, Mente, Patrimônio) |
| **Nome funcional** | Nome descritivo/direto de um módulo (ex: Finanças, Carreira) |
| **Subtítulo descritivo** | Texto complementar que aparece na sidebar expandida (ex: "Saúde e atividades") |
| **Vinculação** | Conexão entre uma Meta no Futuro e um item em outro módulo (trilha, step de roadmap, categoria do orçamento) |
| **Progresso bidirecional** | Atualização de progresso que funciona nos dois sentidos: atualizar no módulo reflete no Futuro, e vice-versa |
| **Module Bar** | Barra vertical de ícones na extremidade esquerda da tela (Nível 1 de navegação) |

---

## 9. REGISTRO DE DECISÕES COMPLEMENTARES

### 9.1 Decisões Tomadas

| # | Decisão | Data | Justificativa |
|---|---------|------|---------------|
| 1 | Nomenclatura híbrida (conceitual + funcional) | Fev/2026 | Equilíbrio entre identidade e clareza |
| 2 | "Finanças" mantido (não mudou para Fluxo/Bolso) | Fev/2026 | Módulo fundador, clareza, reconhecimento |
| 3 | "Futuro" aprovado (não Horizonte) | Fev/2026 | Futuro chega, horizonte nunca se alcança |
| 4 | Reestruturação Metas → Objetivos + Metas distribuídas | Fev/2026 | Metas isoladas não escalam para 8 módulos |
| 5 | Nome + subtítulo na sidebar expandida | Fev/2026 | Resolve ambiguidade de nomes conceituais |
| 6 | "Experiências" (não "Viagem") | Fev/2026 | Permite expansão futura para eventos, shows, hobbies |
| 7 | "Corpo" (não "Saúde") | Fev/2026 | Evita tom clínico, permite bem-estar amplo |
| 8 | "Mente" (não "Estudos") | Fev/2026 | Permite leitura, meditação, journaling futuro |
| 9 | "Patrimônio" (não "Investimentos") | Fev/2026 | Permite imóveis, veículos, bens futuros |
| 10 | "Tempo" (não "Agenda") | Fev/2026 | Gestão de tempo como recurso, não apenas calendário |

### 9.2 Decisões Pendentes

| # | Decisão | Dependência |
|---|---------|-------------|
| 1 | Cores por módulo no design system v3 | Definir paleta para 8 módulos |
| 2 | Ícones definitivos (emoji vs custom SVG) | Definir durante prototipação v3 |
| 3 | Ordem dos módulos na Module Bar | Definir durante prototipação v3 |
| 4 | SyncTrip como sub-brand de Experiências | Definir durante branding v3 |

---

*Documento criado em: Fevereiro 2026*
*Tipo: Architecture Decision Record (ADR)*
*Próxima revisão: Ao iniciar prototipação dos módulos v3*
