# 03 - MVP v2 (Produto Completo)

## 1. Objetivo

Evoluir o MVP v1 para uma **versão completa e polida** do módulo de Finanças, incluindo todas as features removidas da primeira versão, pronta para lançamento público.

**Pré-requisito**: MVP v1 validado com usuários reais.

---

## 2. Prazo Estimado

| Fase | Duração |
|------|---------|
| Desenvolvimento | 4-6 semanas |
| Testes e ajustes | 1-2 semanas |
| **Total** | **5-8 semanas** |

---

## 3. Features do MVP v2

### 3.1 PWA (Progressive Web App)

- [ ] Manifest.json configurado
- [ ] Service Worker para cache
- [ ] Funciona offline (leitura)
- [ ] Sincronização quando online
- [ ] Instalável no celular (Add to Home Screen)
- [ ] Ícones em todos os tamanhos
- [ ] Splash screen

**Benefício**: Experiência de app nativo sem precisar de app stores.

---

### 3.2 Sistema de Orçamentos

- [ ] Definir orçamento mensal geral
- [ ] Definir orçamento por categoria
- [ ] Barra de progresso visual (gasto vs orçamento)
- [ ] Alerta ao atingir 80% do orçamento
- [ ] Alerta ao exceder orçamento
- [ ] Histórico de orçamentos anteriores
- [ ] Sugestão de orçamento baseado em média de gastos

**Tela**: Nova seção "Orçamentos" na sidebar.

---

### 3.3 Múltiplos Gráficos e Visualizações

- [ ] Gráfico de pizza: Despesas por categoria
- [ ] Gráfico de barras: Comparativo mensal (últimos 6 meses)
- [ ] Gráfico de linha: Evolução do saldo
- [ ] Gráfico de barras empilhadas: Receitas vs Despesas por mês
- [ ] Mini-sparklines nos cards do dashboard

**Biblioteca**: Recharts (já incluída no v1).

---

### 3.4 Modo Foco vs Modo Jornada

#### Seleção no Onboarding
```
┌─────────────────────────────────────────────────────────────┐
│   "Como você prefere usar o SyncLife?"                     │
│                                                             │
│   ┌─────────────────────┐    ┌─────────────────────┐       │
│   │  🎯 MODO FOCO       │    │  🌱 MODO JORNADA    │       │
│   │                     │    │                     │       │
│   │  Direto ao ponto.   │    │  Acompanhe sua      │       │
│   │  Dados objetivos.   │    │  evolução.          │       │
│   │  Mínimo de texto.   │    │  Insights e dicas.  │       │
│   └─────────────────────┘    └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### Diferenças entre Modos

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Dashboard | Só números | Life Sync Score + frases |
| Notificações | Só alertas críticos | Motivacionais também |
| Reviews semanais | Desabilitado | Guiado todo domingo |
| Tom de voz | Neutro | Empático, coach |
| Gamificação | Nenhuma | Streaks, conquistas |

- [ ] Toggle nas configurações para trocar de modo
- [ ] Persistir preferência no perfil
- [ ] UI adapta automaticamente

---

### 3.5 Life Sync Score (Modo Jornada)

Índice de 0-100 que mede "saúde" da vida financeira:

```
         ┌─────────────────────┐
         │   LIFE SYNC SCORE   │
         │         72          │
         │    ▲ +5 esta semana │
         └─────────────────────┘
```

#### Cálculo (v1 do algoritmo)
```
Score = (Orçamento * 0.4) + (Consistência * 0.3) + (Tendência * 0.3)

Onde:
- Orçamento: % do orçamento respeitado (0-100)
- Consistência: % de dias com registro no mês (0-100)
- Tendência: Melhoria vs mês anterior (0-100, 50 = neutro)
```

- [ ] Card no dashboard (Modo Jornada)
- [ ] Histórico semanal
- [ ] Explicação do que compõe o score
- [ ] Dicas para melhorar

---

### 3.6 Relatórios e Exportação

- [ ] Relatório mensal em tela
  - Resumo do mês
  - Top 5 categorias
  - Comparativo com mês anterior
  - Insights automáticos
- [ ] Exportar para PDF
- [ ] Exportar para Excel/CSV
- [ ] Exportar para JSON (backup)

---

### 3.7 Notificações e Alertas

- [ ] Configuração de notificações por tipo
- [ ] Alerta de orçamento (80%, 100%)
- [ ] Lembrete para registrar gastos (configurável)
- [ ] Resumo semanal (domingo)
- [ ] Push notifications (PWA)

#### Tipos de Notificação

| Tipo | Modo Foco | Modo Jornada |
|------|-----------|--------------|
| Orçamento excedido | ✅ | ✅ |
| 80% do orçamento | ❌ | ✅ |
| Lembrete diário | ❌ | ✅ (configurável) |
| Review semanal | ❌ | ✅ |
| Conquistas | ❌ | ✅ |

---

### 3.8 Categorias Personalizadas

- [ ] Criar nova categoria
  - Nome
  - Ícone (lista de emojis)
  - Cor
  - Tipo (receita/despesa)
- [ ] Editar categoria existente
- [ ] Excluir categoria (move transações para "Outros")
- [ ] Ordenar categorias
- [ ] Limite de 20 categorias personalizadas (free)

---

### 3.9 Transações Recorrentes

- [ ] Marcar transação como recorrente
  - Frequência: diária, semanal, mensal, anual
  - Data de início
  - Data de fim (opcional)
- [ ] Gerar automaticamente transações futuras
- [ ] Editar série ou ocorrência única
- [ ] Cancelar recorrência

---

### 3.10 Dark Mode

- [ ] Tema escuro completo
- [ ] Toggle no header ou configurações
- [ ] Respeitar preferência do sistema
- [ ] Persistir escolha do usuário

---

### 3.11 Melhorias de UX

- [ ] Onboarding guiado (tour do app)
- [ ] "Modo Recomeço" para usuários que voltam após dias
- [ ] Busca em transações
- [ ] Atalhos de teclado (desktop)
- [ ] Animações suaves (Framer Motion)
- [ ] Loading states em todas as ações
- [ ] Feedback visual em ações (toast notifications)
- [ ] Confirmação antes de excluir

---

## 4. Novas Telas no MVP v2

| Tela | Descrição |
|------|-----------|
| Orçamentos | Lista e gestão de orçamentos |
| Relatórios | Relatório mensal detalhado |
| Categorias | Gerenciar categorias personalizadas |
| Recorrentes | Lista de transações recorrentes |
| Onboarding | Tour guiado para novos usuários |
| Notificações | Configurações de alertas |

---

## 5. Modelo de Dados (Adições)

```sql
-- Orçamentos (já existia, adicionar campos)
ALTER TABLE budgets ADD COLUMN alert_threshold INTEGER DEFAULT 80;
ALTER TABLE budgets ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Transações recorrentes
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    last_generated DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações de notificação
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
    budget_alert BOOLEAN DEFAULT TRUE,
    daily_reminder BOOLEAN DEFAULT FALSE,
    daily_reminder_time TIME DEFAULT '20:00',
    weekly_review BOOLEAN DEFAULT TRUE,
    achievements BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Life Sync Score histórico
CREATE TABLE life_sync_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    score INTEGER NOT NULL,
    budget_component INTEGER,
    consistency_component INTEGER,
    trend_component INTEGER,
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Atualizar profiles para novos campos
ALTER TABLE profiles ADD COLUMN mode TEXT DEFAULT 'focus'; -- 'focus' ou 'journey'
ALTER TABLE profiles ADD COLUMN theme TEXT DEFAULT 'light'; -- 'light', 'dark', 'system'
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMP;
```

---

## 6. Critérios de Sucesso do MVP v2

| Critério | Meta | Como Medir |
|----------|------|------------|
| PWA instalável | 100% funcional | Teste manual iOS/Android |
| Lighthouse PWA | Score > 90 | Lighthouse |
| Usuários ativos semanais | 100+ | Analytics |
| Retenção D7 | > 30% | Analytics |
| Retenção D30 | > 15% | Analytics |
| NPS | > 40 | Pesquisa |
| Bugs reportados | < 5/semana | Suporte |

---

## 7. Definição de "Pronto"

O MVP v2 está pronto quando:

- [ ] Todas as features listadas implementadas
- [ ] PWA funciona offline
- [ ] Testes em iOS e Android
- [ ] Dark mode funcional
- [ ] Onboarding guiado funciona
- [ ] Exportação PDF/Excel funciona
- [ ] Performance mantida (LCP < 3s)
- [ ] Documentação de usuário básica
- [ ] Pronto para lançamento público

---

## 8. Transição v1 → v2

Para usuários que já usam v1:
- [ ] Migração de dados automática
- [ ] Modal explicando novas features
- [ ] Opção de escolher modo (Foco/Jornada)
- [ ] Categorias antigas mantidas

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.0*
