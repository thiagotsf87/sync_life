# Análise de Impacto Mobile — Proteção do que Funciona na Web

> **Data:** Março 2026  
> **Premissa absoluta:** ZERO impacto no que já está funcional na versão web  
> **Objetivo:** Mapear cada sugestão da análise mobile e garantir que nenhuma altera, remove ou quebra funcionalidade web existente  
> **Princípio:** Mobile e Web são camadas separadas. Toda adição mobile é aditiva, nunca substitutiva.

---

## ÍNDICE

1. [Entendendo o Problema de Impacto](#1-entendendo-o-problema)
2. [Inventário do que Funciona na Web Hoje](#2-inventário-web-funcional)
3. [Análise de Impacto por Sugestão](#3-análise-por-sugestão)
4. [Tabela Consolidada de Impacto](#4-tabela-consolidada)
5. [Regras de Proteção para Desenvolvimento](#5-regras-de-proteção)
6. [Arquitetura que Garante Isolamento](#6-arquitetura-de-isolamento)

---

## 1. ENTENDENDO O PROBLEMA

### 1.1 Por que existe risco de impacto?

Quando se adiciona funcionalidades mobile a um sistema que já tem versão web funcional, existem 3 vetores de risco:

**Vetor 1 — Mudanças de banco de dados:** Adicionar colunas, alterar tipos de dados ou criar novas tabelas no Supabase pode quebrar queries existentes da versão web se não forem feitas de forma retrocompatível.

**Vetor 2 — Mudanças de componentes compartilhados:** O SyncLife usa Next.js — os componentes React são os mesmos para web e mobile (responsividade via Tailwind). Se um componente for alterado para funcionar melhor no mobile, pode quebrar o layout desktop do mesmo componente.

**Vetor 3 — Mudanças de lógica de negócio:** Se uma regra de negócio for alterada (ex: limites FREE vs. PRO) para suportar uma feature mobile nova, a lógica web precisa refletir a mesma mudança — caso contrário os sistemas ficam inconsistentes.

### 1.2 A boa notícia

Como o SyncLife ainda está em fase de protótipos HTML (sem código Next.js implementado), o risco de impacto é mínimo hoje. Porém, é o momento ideal para estabelecer as regras de proteção ANTES de começar a implementação, garantindo que o desenvolvimento seja seguro desde o primeiro commit.

---

## 2. INVENTÁRIO DO QUE FUNCIONA NA WEB HOJE

### 2.1 Funcional na versão web (protótipos aprovados)

Com base na análise do repositório, o que está aprovado e considerado "funcional" são os 19 protótipos HTML. Para fins desta análise, tratamos como "funcional" tudo que já tem protótipo aprovado e/ou dev spec criada.

| # | Tela / Funcionalidade | Status | Dev Spec |
|---|----------------------|--------|----------|
| 1 | Landing Page | ✅ Protótipo aprovado | ✅ Spec pronta |
| 2 | Autenticação (Login / Cadastro / Recuperação) | ✅ Protótipo aprovado | ✅ Spec pronta |
| 3 | Onboarding (5 etapas) | ✅ Protótipo aprovado | ✅ Spec pronta |
| 4 | Navigation Shell (Module Bar + Sidebar) | ✅ Protótipo aprovado | ✅ Spec pronta |
| 5 | Configurações (todas as abas) | ✅ Protótipo aprovado | ✅ Spec pronta |
| 6 | Dashboard Financeiro (Overview) | ✅ Protótipo aprovado | ✅ Spec pronta |
| 7 | Transações (lista + filtros + modais) | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 8 | Recorrentes | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 9 | Orçamentos (envelope model) | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 10 | Calendário Financeiro | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 11 | Planejamento Futuro | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 12 | Relatórios | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 13 | Metas (lista) | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 14 | Nova Meta | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 15 | Detalhe de Meta | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 16 | Agenda (semanal + mensal) | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 17 | Agenda CRUD (criação de evento) | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 18 | Conquistas | ✅ Protótipo aprovado | ⏳ Spec pendente |
| 19 | Financas Dashboard revisado | ✅ Protótipo aprovado | ✅ Spec pronta |

### 2.2 O que "funcional" significa neste contexto

Como o código Next.js ainda não foi escrito, "funcional" aqui significa: **o design, fluxo, regras de negócio e comportamentos definidos nos protótipos HTML aprovados são a fonte da verdade**. Nenhuma sugestão mobile pode contradizer, remover ou alterar o que está documentado nesses arquivos.

---

## 3. ANÁLISE DE IMPACTO POR SUGESTÃO

Para cada sugestão da análise mobile, avaliamos o impacto em três dimensões:
- **🟢 ZERO IMPACTO:** Adição pura, não toca nada existente
- **🟡 IMPACTO CONTROLÁVEL:** Requer atenção, mas com implementação correta não quebra nada
- **🔴 IMPACTO CRÍTICO:** Exigiria mudança em algo aprovado — portanto, a abordagem deve ser ajustada

---

### 3.1 Quick Entry (Lançamento Rápido de Transações)

**Sugestão:** Adicionar um modo de entrada rápida de transações — botão flutuante que abre teclado numérico, lança em 3 toques.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** O Quick Entry é um componente adicional que não substitui o formulário completo de transação existente nos protótipos. Ele é um atalho — como uma porta dos fundos que leva ao mesmo lugar mais rápido. O formulário completo (`proto-transacoes.html`) permanece 100% inalterado. No mobile, o botão FAB flutuante aparece; no desktop, ele simplesmente não aparece (controlado por CSS `@media` query). O banco de dados recebe os mesmos campos de sempre — o Quick Entry só pré-preenche menos campos e usa defaults para os opcionais.

**Como implementar sem impacto:**
```css
/* Desktop: Quick Entry FAB não aparece */
.quick-entry-fab { display: none; }

/* Mobile: FAB aparece */
@media (max-width: 768px) {
  .quick-entry-fab { display: flex; }
}
```

**Requisito de banco de dados:** Nenhum campo novo. O Quick Entry usa os mesmos campos da tabela `transactions` — apenas preenche valor, categoria e data com defaults para os campos opcionais (descrição pode ficar vazia, tags não são obrigatórias).

---

### 3.2 Toggle Foco/Jornada no Header do Módulo

**Sugestão:** Mover o toggle Foco/Jornada das Configurações para o header visível de cada módulo.

**Impacto na web:** 🟡 **IMPACTO CONTROLÁVEL**

**Por quê:** A lógica de troca de modo já existe no sistema e funciona. O que muda é apenas onde o controle aparece — não o que ele faz. No desktop (web), o toggle pode continuar existindo em Configurações como antes. No mobile, um toggle adicional aparece no header. Os dois controlam a mesma variável de estado — `theme_mode: 'foco' | 'jornada'` — que já existe.

**Como implementar sem impacto:**
- O toggle em Configurações permanece exatamente como está no protótipo `proto-configuracoes.html`
- O toggle no header do módulo é um componente adicional, visível apenas em viewport mobile
- Ambos escrevem no mesmo campo do banco (preferência do usuário)
- No desktop, o toggle do header simplesmente não renderiza

**Cuidado:** Não remover o toggle das Configurações. Apenas adicionar um novo ponto de acesso no header mobile.

---

### 3.3 Navegação Bottom Bar com "Mais" para 8 Módulos (v3)

**Sugestão:** Substituir a Bottom Tab Bar simples por uma arquitetura de 5 posições fixas + sheet deslizável "Mais" para acomodar 8+ módulos no v3.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** A navegação web usa Module Bar vertical (barra lateral esquerda com ícones) + Sidebar secundária. Essa estrutura não muda. A Bottom Bar é exclusivamente mobile — definida no arquivo de navegação como comportamento para viewport < 768px. O shell de navegação desktop (`proto-navigation-v3.html`) fica intocado.

**Como implementar sem impacto:**
- O componente `MobileNavBar` é separado do `DesktopModuleBar`
- Cada um renderiza independentemente baseado em viewport
- Compartilham apenas o estado de "módulo ativo" — nada mais
- O Module Bar desktop continua com sua lógica de sidebar expandível/colapsável

**Nota importante:** Esta mudança resolve um problema futuro (v3 com 8 módulos) sem criar nenhum problema presente. Implementar a arquitetura correta no v2 evita refatoração dolorosa no v3.

---

### 3.4 Onboarding Simplificado para 3 Telas

**Sugestão:** Reduzir o onboarding para 3 telas (seleção de módulos → renda mensal → pronto) ao invés do fluxo multi-etapas atual.

**Impacto na web:** 🟡 **IMPACTO CONTROLÁVEL**

**Por quê:** Esta é a sugestão que mais requer atenção. O protótipo `proto-onboarding.html` tem um fluxo aprovado com múltiplas etapas. Alterar esse fluxo impacta o que foi aprovado.

**Duas abordagens sem impacto:**

**Opção A (recomendada) — Onboarding adaptativo por dispositivo:**
- Desktop: Onboarding completo como no protótipo aprovado
- Mobile: Versão simplificada de 3 telas
- Implementado como duas variantes do mesmo componente, controladas por viewport
- O banco de dados recebe os mesmos dados de configuração inicial — apenas menos campos são preenchidos no mobile (o resto tem defaults que o usuário pode ajustar depois)

**Opção B — Progressive Onboarding universal:**
- Tornar o onboarding de 3 telas para todos (web e mobile)
- As etapas extras do onboarding atual viram "dicas contextuais" que aparecem na primeira vez que o usuário acessa cada seção
- **Requer aprovação de mudança no protótipo aprovado**

**Recomendação:** Usar Opção A. Zero risco, implementação simples, mantém o protótipo web intocado.

---

### 3.5 Mini-Heatmap no Dashboard (em vez de Calendário separado)

**Sugestão:** Adicionar um mini-heatmap de 30 dias no Dashboard principal mostrando intensidade de gastos por dia.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** O heatmap é um componente adicional no Dashboard — não substitui nada. O `proto-calendario-financeiro.html` permanece como tela independente acessível pelo menu de navegação. O heatmap no dashboard é apenas uma visualização resumida adicional que oferece acesso rápido.

**Como implementar sem impacto:**
- No desktop: O heatmap pode aparecer no Dashboard como widget opcional (modo Jornada)
- No mobile: O heatmap aparece no Dashboard por padrão (mais compacto)
- O Calendário Financeiro completo continua acessível pela sidebar/navigation
- Os dados são os mesmos — apenas a visualização muda

---

### 3.6 Notificações Proativas com IA

**Sugestão:** Implementar notificações que antecipam comportamentos em vez de apenas reagir a eventos.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** Notificações são um sistema separado do frontend. Elas são processadas no backend (Edge Function no Supabase) e entregues via Push Notification API. A interface web não muda em nada. O Centro de Notificações (já previsto nas specs) permanece o mesmo — apenas o conteúdo das notificações é mais inteligente.

**Como implementar sem impacto:**
- Edge Function rodando cron job diário analisa dados e gera notificações
- O sistema de notificações é agnóstico de plataforma — a mesma notificação pode ir para web (browser) e mobile (PWA)
- A interface de Configurações de Notificações (`proto-configuracoes.html`) permanece idêntica
- O usuário controla quais notificações recebe — a configuração existente já suporta isso

---

### 3.7 OCR de Comprovantes

**Sugestão:** Implementar reconhecimento óptico de recibos via câmera do celular.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** OCR é uma feature exclusivamente mobile (câmera). Na web, simplesmente não aparece a opção de câmera — ou aparece a opção de upload de arquivo (que pode ser útil também no desktop para importar PDFs de extrato).

**Como implementar sem impacto:**
- No modal de nova transação: botão "Foto do recibo" aparece apenas em mobile (CSS media query)
- No desktop: pode aparecer como "Importar extrato PDF" — feature diferente, mesma infraestrutura de OCR
- O formulário de transação resultante é idêntico ao formulário manual — apenas pré-preenchido
- Banco de dados: adicionar coluna opcional `receipt_image_url` na tabela `transactions` — nullable, sem breaking change

---

### 3.8 Widget de Home Screen

**Sugestão:** Implementar widgets para a tela inicial do iOS/Android.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** Widgets são uma feature de sistema operacional mobile, completamente fora do escopo da aplicação web. O desenvolvimento do widget não toca nenhum arquivo da aplicação Next.js — é uma entidade separada (Swift Widget Extension no iOS, App Widget no Android ou configuração do Web App Manifest no PWA).

**Nota:** Esta feature é futura (pós-validação do PWA) e não há decisão a tomar agora. Registrado apenas para deixar claro que não há risco.

---

### 3.9 Weekly Review (Revisão Semanal)

**Sugestão:** Tela de revisão semanal guiada de 5 minutos, acionada por notificação toda segunda.

**Impacto na web:** 🟢 **ZERO IMPACTO**

**Por quê:** O Weekly Review é uma tela nova, não uma modificação de tela existente. Ela usa dados que já existem (transações da semana, eventos da agenda) mas os apresenta em um formato novo de review. Não altera nenhuma tela aprovada.

**Como implementar sem impacto:**
- Nova rota: `/review/weekly` (ou modal acessível pela notificação)
- Usa dados já existentes nas tabelas `transactions` e `calendar_events`
- Não cria novos campos obrigatórios — apenas lê dados existentes
- A experiência pode estar disponível em web e mobile (não é exclusiva de mobile)

---

### 3.10 Life Sync Score como Protagonista da Home

**Sugestão:** Tornar o Life Sync Score o elemento central e mais proeminente da tela Home.

**Impacto na web:** 🟡 **IMPACTO CONTROLÁVEL**

**Por quê:** O dashboard home (`proto-dashboard-revisado.html`) e o dashboard financeiro (`proto-financas-dashboard.html`) têm layouts aprovados. Mudar a hierarquia visual pode impactar o que foi aprovado.

**Como implementar sem impacto:**

**No mobile:** O Life Sync Score aparece como o primeiro e maior elemento da Home — acima do fold, sem scroll. O restante do dashboard está abaixo.

**No desktop:** O layout aprovado do `proto-dashboard-revisado.html` permanece exatamente como está. O Life Sync Score já existe no design — apenas no mobile ele ganha posição de protagonista.

**Cuidado:** Não alterar o layout desktop dos dashboards aprovados. A mudança de hierarquia visual é exclusiva para mobile.

---

### 3.11 Otimizações de Performance

**Sugestão:** Implementar animações otimizadas para GPU, limitar duração a 300ms, usar `will-change: transform`.

**Impacto na web:** 🟡 **IMPACTO CONTROLÁVEL**

**Por quê:** Animações afetam tanto web quanto mobile — são definidas no mesmo CSS. Otimizar animações para performance mobile geralmente melhora a performance web também. O risco é alterar uma animação e ela ficar diferente do que foi aprovado no protótipo.

**Como implementar sem impacto:**
- Nunca remover uma animação aprovada — apenas otimizá-la tecnicamente
- A experiência visual deve ser idêntica ou melhor que o protótipo — apenas mais performática
- Usar `prefers-reduced-motion` como adição, não substituição
- Testar qualquer mudança de animação contra o protótipo HTML aprovado antes de commitar

---

## 4. TABELA CONSOLIDADA DE IMPACTO

| # | Sugestão | Impacto Web | Ação Necessária | Prioridade de Proteção |
|---|----------|-------------|-----------------|----------------------|
| 1 | Quick Entry de Transações | 🟢 Zero | CSS media query | Baixa |
| 2 | Toggle Foco/Jornada no Header | 🟡 Controlável | Manter toggle em Config + adicionar no header | Média |
| 3 | Bottom Bar com "Mais" para v3 | 🟢 Zero | Componente separado por viewport | Baixa |
| 4 | Onboarding Simplificado | 🟡 Controlável | Versão adaptativa por device (Opção A) | Alta |
| 5 | Mini-Heatmap no Dashboard | 🟢 Zero | Widget adicional, calendário intocado | Baixa |
| 6 | Notificações Proativas com IA | 🟢 Zero | Backend-only, frontend não muda | Baixa |
| 7 | OCR de Comprovantes | 🟢 Zero | Botão exclusivo mobile + coluna nullable | Baixa |
| 8 | Widget de Home Screen | 🟢 Zero | Feature de SO, fora da web app | Nenhuma |
| 9 | Weekly Review | 🟢 Zero | Nova rota, dados existentes | Baixa |
| 10 | Life Sync Score Protagonista | 🟡 Controlável | Hierarquia diferente por viewport | Média |
| 11 | Otimizações de Performance | 🟡 Controlável | Otimizar sem alterar comportamento visual | Média |

**Resultado:** 7 de 11 sugestões têm ZERO impacto na web. As 4 com impacto controlável têm estratégia clara de implementação que mantém o design web aprovado intocado.

---

## 5. REGRAS DE PROTEÇÃO PARA DESENVOLVIMENTO

### Regra 1 — Princípio da Adição Pura

> Toda feature mobile nova deve ser ADICIONADA ao sistema, nunca SUBSTITUÍDA de algo existente.

Na prática: se uma tela web foi aprovada, ela permanece exatamente como está. Features mobile são elementos adicionais que aparecem em viewports menores. Nunca remover uma feature web para "simplificar" a experiência mobile.

### Regra 2 — Viewport como Controle de Exibição

> O critério de qual versão (mobile ou desktop) de um componente aparece é sempre o viewport — nunca um campo de banco de dados, nunca uma feature flag, nunca uma preferência de usuário (salvo exceções explicitamente documentadas).

Na prática: usar Tailwind CSS `md:` e `lg:` prefixes para controlar visibilidade. O componente mobile e o componente desktop existem no mesmo arquivo mas com visibilidade controlada por CSS.

```tsx
// Correto
<MobileQuickEntry className="block md:hidden" />
<DesktopTransactionButton className="hidden md:block" />
```

### Regra 3 — Banco de Dados Retrocompatível

> Toda migração de banco de dados para suportar feature mobile deve ser retrocompatível com as queries existentes.

Regras específicas:
- Novas colunas sempre com `DEFAULT` value ou `NULLABLE`
- Nunca alterar o tipo de uma coluna existente
- Nunca renomear uma coluna existente (criar nova + migrar dados + remover antiga em etapas separadas)
- Índices novos só adicionam performance, nunca quebram
- Row Level Security só deve ser adicionado, nunca removido

### Regra 4 — Componentes Compartilhados São Sagrados

> Componentes que são usados tanto em mobile quanto em desktop não podem ser alterados sem revisão de ambos os contextos.

Na prática: criar uma lista de "componentes compartilhados" no início do desenvolvimento. Qualquer PR que toca esses componentes precisa incluir evidência de teste em ambos os viewports (screenshot desktop 1440px + screenshot mobile 375px).

### Regra 5 — Protótipos HTML Como Teste de Regressão Visual

> Antes de qualquer deploy para produção, a implementação Next.js deve ser comparada contra o protótipo HTML aprovado correspondente.

Na prática: o processo de QA inclui abrir o protótipo HTML ao lado da implementação Next.js e verificar que todos os elementos, espaçamentos, cores e comportamentos são idênticos no viewport desktop. No mobile, comparar com os novos protótipos mobile aprovados.

### Regra 6 — Lógica de Negócio em Camada Separada

> Regras de negócio (limites FREE/PRO, cálculos de orçamento, validações) devem existir em uma única camada compartilhada, consumida igualmente por web e mobile.

Na prática: criar uma pasta `/lib/business-rules/` com funções puras TypeScript para todas as regras de negócio. O componente web e o componente mobile chamam as mesmas funções. Nunca duplicar lógica de negócio entre os dois.

---

## 6. ARQUITETURA QUE GARANTE ISOLAMENTO

### 6.1 Estrutura de pastas recomendada

```
/src
  /app                        ← Rotas Next.js (App Router)
  /components
    /desktop                  ← Componentes exclusivos desktop
    /mobile                   ← Componentes exclusivos mobile
    /shared                   ← Componentes compartilhados (sagrados)
  /lib
    /business-rules           ← Lógica de negócio compartilhada
    /supabase                 ← Queries de banco
    /notifications            ← Sistema de notificações
  /styles
    /tokens                   ← CSS vars (design tokens)
    /themes                   ← 4 temas (dark/light × foco/jornada)
```

### 6.2 Padrão de componente com variante mobile

```tsx
// TransactionForm.tsx — componente compartilhado
interface TransactionFormProps {
  mode?: 'full' | 'quick';  // 'full' = desktop padrão, 'quick' = mobile rápido
}

export function TransactionForm({ mode = 'full' }: TransactionFormProps) {
  return (
    <>
      {/* Quick Entry — apenas mobile */}
      {mode === 'quick' && <QuickEntryKeypad />}
      
      {/* Formulário completo — desktop e mobile expandido */}
      <div className={mode === 'quick' ? 'hidden' : 'block'}>
        {/* Formulário aprovado no proto-transacoes.html */}
      </div>
    </>
  );
}
```

### 6.3 Como adicionar feature mobile sem tocar o desktop

**Exemplo real: adicionar Quick Entry no mobile sem impactar desktop**

```tsx
// layout.tsx (Shell de navegação)
export default function AppLayout({ children }) {
  return (
    <div>
      <DesktopModuleBar />      {/* md:flex hidden — só desktop */}
      <DesktopSidebar />        {/* md:block hidden — só desktop */}
      
      <main>{children}</main>
      
      <MobileBottomBar />       {/* md:hidden block — só mobile */}
      <MobileQuickEntryFab />   {/* md:hidden block — só mobile */}
    </div>
  );
}
```

Nenhuma linha de código do `DesktopModuleBar` é tocada. Nenhuma linha do `DesktopSidebar` é tocada. Apenas adicionamos dois novos componentes que são invisíveis no desktop.

### 6.4 Proteção de banco de dados — exemplo prático

**Adicionando suporte a OCR de comprovantes:**

```sql
-- MIGRAÇÃO RETROCOMPATÍVEL
-- Adiciona coluna opcional — não quebra nenhuma query existente
ALTER TABLE transactions 
ADD COLUMN receipt_image_url TEXT DEFAULT NULL;

-- Índice opcional para performance
CREATE INDEX idx_transactions_receipt 
ON transactions(id) 
WHERE receipt_image_url IS NOT NULL;
```

Nenhuma query existente que faz `SELECT` das `transactions` quebra com essa migração, porque a coluna nova é `NULLABLE` e tem `DEFAULT NULL`. Queries que não mencionam `receipt_image_url` continuam funcionando exatamente como antes.

---

## CONCLUSÃO

Das 11 sugestões da análise mobile, **nenhuma requer alteração em algo aprovado** quando implementada com as estratégias corretas descritas neste documento. As 4 sugestões marcadas como "impacto controlável" têm caminhos claros de implementação que preservam 100% do design e comportamento web aprovado.

**A proteção do que funciona na web não é uma limitação — é uma arquitetura intencional.**

O SyncLife pode e deve ter uma experiência mobile rica e diferenciada sem sacrificar nenhuma linha de código ou pixel de design já aprovado para a versão web.

---

*Este documento deve ser consultado antes de qualquer PR que adicione features mobile ao projeto. Qualquer sugestão que não se encaixe nas categorias de impacto aqui mapeadas deve ser avaliada com o mesmo rigor antes de ser implementada.*
