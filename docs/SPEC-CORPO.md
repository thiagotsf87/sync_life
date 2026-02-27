# SPEC-CORPO — 🏃 Módulo Corpo

> **Saúde e Atividades**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Corpo (anteriormente "Saúde")
> **Dependências:** Finanças (custos), Tempo (consultas/atividades), Futuro (objetivos de saúde)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Corpo

O módulo Corpo permite ao usuário gerenciar consultas médicas, acompanhar evolução corporal (peso, medidas, IMC), controlar nutrição com apoio de IA e registrar atividades físicas. O nome "Corpo" foi escolhido porque "Saúde" soa clínico, como app de hospital. "Corpo" transmite autocuidado, evolução pessoal e bem-estar — exatamente o tom do SyncLife.

### 1.2 Diferencial Competitivo

| App Concorrente | O que faz | O que NÃO faz (que o SyncLife faz) |
|----------------|-----------|--------------------------------------|
| MyFitnessPal | Contagem de calorias, nutrição | Não integra com finanças, agenda, metas de vida |
| Noom | Coaching de hábitos alimentares | Não conecta com carreira, estudos, patrimônio |
| HealthifyMe | Nutrição + exercício + IA | Não tem gestão de consultas médicas integrada |
| Google Fit | Registro de atividades | Não tem cardápio IA, não integra com finanças |

O SyncLife integra saúde com agenda (consultas), finanças (custos com saúde), e objetivos de vida (metas de peso/exercício vinculadas ao módulo Futuro).

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Dashboard Corpo | Peso atual, próxima consulta, atividades da semana, calorias | Alta |
| Consultas Médicas | Timeline de consultas passadas/futuras + retornos | Alta |
| Evolução Corporal | Gráfico de peso, medidas, TMB, IMC | Alta |
| Cardápio com IA | Chat para gerar cardápio semanal personalizado | Alta |
| Atividades Físicas | Registro de treinos, caminhadas, passos | Média |
| Metas de Saúde | Metas de peso, frequência academia, passos (vinculadas ao Futuro) | Alta |

---

## 3. FUNCIONALIDADE: CONSULTAS MÉDICAS

### 3.1 O que o usuário vê e faz

O usuário acessa "Consultas" dentro do módulo Corpo e vê uma timeline com consultas passadas (com notas) e futuras (com countdown). Ao criar nova consulta, informa: especialidade, médico, data/hora, local, notas/motivo, custo (opcional) e se tem retorno previsto.

A consulta é automaticamente criada como evento na Agenda (módulo Tempo). Quando concluída, o sistema pergunta sobre retorno. Se informado, cria lembrete automático que notifica na data prevista.

**Exemplo de uso:** Usuário registra consulta com cardiologista em 15/03. Médico pede retorno em 6 meses. Usuário marca "retorno em 6 meses". Em setembro, notificação: "Você tem retorno pendente com Dr. Fulano (Cardiologista). Já marcou? [Marcar agora] [Adiar 1 semana] [Já marquei]". Se não marcar em 7 dias, segundo lembrete. Após 30 dias, card de alerta no Dashboard.

### 3.2 Regras de Negócio

- **RN-CRP-01:** Toda consulta médica criada gera automaticamente evento na Agenda com tag "🏃 Corpo" e cor do módulo.
- **RN-CRP-02:** Ao concluir consulta, campo obrigatório de retorno: "Sem retorno", "1 mês", "2 meses", "3 meses", "6 meses", "1 ano", "Personalizado".
- **RN-CRP-03:** Lembrete de retorno enviado na data calculada. Sem ação em 7 dias → segundo lembrete. Limite de 3 lembretes.
- **RN-CRP-04:** Status de retorno: "Pendente", "Agendado", "Ignorado".
- **RN-CRP-05:** Retorno pendente há 30+ dias → alerta vermelho no Dashboard.
- **RN-CRP-06:** Especialidades pré-definidas: Clínico Geral, Cardiologista, Dermatologista, Endocrinologista, Ginecologista, Nutricionista, Oftalmologista, Ortopedista, Otorrino, Psicólogo, Psiquiatra, Urologista, Dentista, Outro (campo livre).
- **RN-CRP-07:** Custo da consulta (opcional) gera transação automática em Finanças na categoria "Saúde" com descrição "Consulta — [Especialidade] — Dr. [Nome]".
- **RN-CRP-08:** Limite FREE: 3 consultas ativas por mês. PRO: ilimitadas.
- **RN-CRP-09:** Consultas passadas ficam no histórico permanentemente e podem ser filtradas por especialidade, médico ou período.
- **RN-CRP-10:** Cada consulta pode ter anexos opcionais (fotos de exames, receitas) armazenados no Supabase Storage.

### 3.3 Critérios de Aceite

- [ ] Criar consulta gera evento na Agenda com ícone de saúde
- [ ] Concluir consulta com retorno agenda lembrete na data correta
- [ ] Lembrete aparece como notificação e card no Dashboard
- [ ] Custo informado gera transação em Finanças automaticamente
- [ ] Timeline mostra consultas passadas/futuras em ordem cronológica
- [ ] Editar, cancelar ou remarcar consultas funciona
- [ ] Filtro por especialidade funciona
- [ ] Limite FREE é respeitado com upsell

---

## 4. FUNCIONALIDADE: EVOLUÇÃO CORPORAL

### 4.1 O que o usuário vê e faz

Na primeira vez, cadastro básico: altura, peso atual, sexo biológico, idade, nível de atividade. Sistema calcula TMB (Taxa Metabólica Basal) usando fórmula Mifflin-St Jeor.

**Fórmulas (Mifflin-St Jeor):**
- Homens: TMB = (10 × peso kg) + (6,25 × altura cm) − (5 × idade) + 5
- Mulheres: TMB = (10 × peso kg) + (6,25 × altura cm) − (5 × idade) − 161
- TDEE = TMB × Fator de Atividade

| Nível | Fator | Descrição |
|-------|-------|-----------|
| Sedentário | 1,2 | Pouco exercício, trabalho de escritório |
| Levemente ativo | 1,375 | Exercício leve 1-3 dias/semana |
| Moderadamente ativo | 1,55 | Exercício moderado 3-5 dias/semana |
| Muito ativo | 1,725 | Exercício pesado 6-7 dias/semana |
| Extremamente ativo | 1,9 | Exercício muito pesado, trabalho físico |

Painel mostra: TMB, TDEE, calorias para perder peso (déficit 500kcal), manter ou ganhar (superávit 500kcal). Usuário registra peso periodicamente, gerando gráfico de evolução com linha de tendência e previsão de data para atingir meta.

### 4.2 Regras de Negócio

- **RN-CRP-11:** TMB recalculada automaticamente a cada novo registro de peso.
- **RN-CRP-12:** Gráfico de evolução: últimos 3, 6 ou 12 meses com toggle.
- **RN-CRP-13:** Meta de peso definida pelo usuário (emagrecimento ou ganho de massa).
- **RN-CRP-14:** Previsão de data para atingir meta baseada na velocidade dos últimos 30 dias.
- **RN-CRP-15:** Velocidade saudável: 0,5 a 1 kg/semana. Mais que isso → alerta educativo.
- **RN-CRP-16:** Medidas corporais opcionais: cintura, quadril, braço, coxa, peito. Gráfico separado.
- **RN-CRP-17:** Fotos de progresso opcionais (Supabase Storage, privadas).
- **RN-CRP-18:** IMC calculado e exibido: abaixo do peso (<18.5), normal (18.5-24.9), sobrepeso (25-29.9), obesidade I (30-34.9), II (35-39.9), III (40+).
- **RN-CRP-19:** Se o usuário tem meta de peso vinculada a um Objetivo no módulo Futuro, o progresso atualiza automaticamente a meta correspondente.

### 4.3 Critérios de Aceite

- [ ] TMB calculada corretamente para ambos os sexos
- [ ] TDEE calculado com cada fator de atividade
- [ ] Gráfico de peso com evolução e linha de tendência
- [ ] Previsão de data atualizada a cada novo registro
- [ ] Alerta de velocidade insegura funciona
- [ ] IMC calculado e classificação exibida
- [ ] Progresso sincroniza com meta no Futuro (se vinculada)

---

## 5. FUNCIONALIDADE: CARDÁPIO COM IA

### 5.1 O que o usuário vê e faz

Chat simplificado onde o usuário informa preferências: "Sou vegetariano", "Sem lactose", "Máximo R$ 80/semana", "Receitas rápidas". IA gera cardápio semanal com café, almoço, jantar e 2 lanches/dia. Cada refeição inclui: nome, ingredientes, calorias estimadas e macros (proteínas, carboidratos, gorduras).

### 5.2 Regras de Negócio

- **RN-CRP-20:** IA considera: TDEE, objetivo (perda/ganho/manutenção), restrições alimentares, preferências e orçamento.
- **RN-CRP-21:** Cada refeição: nome, ingredientes, calorias, proteínas (g), carboidratos (g), gorduras (g).
- **RN-CRP-22:** Cardápio gerado para 7 dias. Regeneração: 3/semana (FREE), ilimitado (PRO).
- **RN-CRP-23:** Usuário pode "travar" dias bons e regenerar apenas os ruins.
- **RN-CRP-24:** Cardápios salvos em histórico para consulta futura.
- **RN-CRP-25:** Orçamento alimentar gera transação planejada em Finanças na categoria "Alimentação".
- **RN-CRP-26:** Aviso legal obrigatório: "Este cardápio é sugestão gerada por IA e não substitui nutricionista."
- **RN-CRP-27:** IA via **Vercel AI SDK** com abstração de provider. Provider MVP: **Google Gemini 1.5 Flash** (free tier, sem cartão). Provider produção (pós-validação): **Anthropic Claude**. A troca de provider é feita alterando 1 linha no Route Handler — o restante do código não muda. Implementar como Next.js Route Handler em `/api/ai/cardapio`, nunca expor chave no client.
- **RN-CRP-28:** Coach IA de nutrição (PRO): modo conversacional que explica o "porquê" de cada sugestão e responde dúvidas sobre alimentação. Provider MVP: **Groq + Llama 3.3 70B** (free tier, baixa latência para chat). Provider produção: **Anthropic Claude**.

### 5.3 Critérios de Aceite

- [ ] Cardápio respeita TDEE e objetivo
- [ ] Restrições alimentares respeitadas
- [ ] Total calórico diário ±10% do TDEE alvo
- [ ] Macros balanceados conforme objetivo
- [ ] Aviso legal exibido
- [ ] Histórico acessível
- [ ] Regeneração parcial funciona
- [ ] Route Handler `/api/ai/cardapio` funciona com Gemini free tier
- [ ] Troca de provider (Gemini → Claude) não requer mudança no frontend

---

## 6. FUNCIONALIDADE: ATIVIDADES FÍSICAS

### 6.1 O que o usuário vê e faz

Registro manual de atividades: Caminhada, Corrida, Musculação, Ciclismo, Natação, Yoga, Futebol, Basquete, Dança, Outro. Para cada: duração, distância (opcional), passos (opcional), intensidade (1-5).

Sistema calcula calorias via tabela MET (Metabolic Equivalent of Task): Calorias = MET × peso (kg) × duração (horas).

Meta de passos diários: padrão sugerido 8.000. Registro manual com progresso diário/semanal.

### 6.2 Regras de Negócio

- **RN-CRP-29:** Tipos de atividade pré-definidos com valores MET associados.
- **RN-CRP-30:** Calorias = MET × peso × duração (horas).
- **RN-CRP-31:** Meta de atividade configurável: X vezes/semana, mínimo Y minutos/sessão.
- **RN-CRP-32:** Meta de passos diários configurável (padrão: 8.000).
- **RN-CRP-33:** Atividade registrada aparece na Agenda como evento "🏃 Corpo".
- **RN-CRP-34:** Relatório semanal: total atividades, minutos ativos, calorias queimadas, progresso.
- **RN-CRP-35:** Streak de atividade física: dias consecutivos com 1+ atividade. Alimenta conquistas.
- **RN-CRP-36:** Se meta de exercício vinculada ao Futuro, progresso semanal atualiza a meta correspondente.

### 6.3 Critérios de Aceite

- [ ] Registro com tipo, duração e intensidade
- [ ] Calorias calculadas via MET
- [ ] Meta de passos com barra de progresso
- [ ] Atividades na Agenda como eventos
- [ ] Streak calculado e exibido
- [ ] Relatório semanal no Dashboard

---

## 7. INTEGRAÇÃO COM OUTROS MÓDULOS

### 7.1 Corpo → Finanças

| Evento no Corpo | Ação em Finanças |
|-----------------|------------------|
| Custo de consulta registrado | Transação despesa na categoria "Saúde" |
| Orçamento alimentar definido | Meta de gasto na categoria "Alimentação" |
| Mensalidade academia (futuro) | Transação recorrente na categoria "Saúde" |

### 7.2 Corpo → Tempo (Agenda)

| Evento no Corpo | Ação no Tempo |
|-----------------|---------------|
| Consulta criada | Evento na agenda com tag "🏃 Corpo" |
| Retorno pendente | Lembrete com ações (marcar/adiar/ignorar) |
| Atividade registrada | Evento na agenda (retroativo ou agendado) |

### 7.3 Corpo → Futuro

| Evento no Corpo | Ação no Futuro |
|-----------------|----------------|
| Novo registro de peso | Atualiza meta de peso vinculada |
| Atividades da semana | Atualiza meta de exercício vinculada |
| Consultas em dia | Pode alimentar meta de "manter saúde em dia" |

### 7.4 Regras de Integração

- **RN-CRP-37:** Integrações são opt-in (configurável nas Settings).
- **RN-CRP-38:** Transações auto-geradas marcadas com badge "Auto — 🏃 Corpo".
- **RN-CRP-39:** Exclusão de consulta pergunta: "Excluir também evento na Agenda e transação em Finanças?"

---

## 8. MODO FOCO vs MODO JORNADA

| Elemento | Modo Foco (FREE) | Modo Jornada (PRO) |
|----------|-------------------|---------------------|
| Dashboard | Números: peso, TMB, calorias, consulta | Frase motivacional + progresso visual |
| Registro de peso | Formulário + gráfico | Celebração ao registrar, mensagens em marcos |
| Cardápio IA | Cardápio direto | Coach que explica cada sugestão |
| Atividades | Lista + contagem | Streak visual com chamas, badges (10/30/100 treinos) |
| Notificações | Alertas críticos apenas | Lembretes empáticos ("Lembrete de beber água") |
| Insights cruzados | ❌ | "Nas semanas com 4+ treinos, sua produtividade aumentou 23%" |

---

## 9. MODELO DE DADOS

```sql
-- ============ CORPO (SAÚDE) ============

CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    height_cm DECIMAL(5,1),
    current_weight DECIMAL(5,1),
    biological_sex TEXT CHECK (biological_sex IN ('male', 'female')),
    birth_date DATE,
    activity_level TEXT CHECK (activity_level IN (
        'sedentary', 'light', 'moderate', 'very_active', 'extreme'
    )),
    weight_goal_type TEXT CHECK (weight_goal_type IN ('lose', 'maintain', 'gain')),
    weight_goal_kg DECIMAL(5,1),
    daily_steps_goal INTEGER DEFAULT 8000,
    weekly_activity_goal INTEGER DEFAULT 3,
    min_activity_minutes INTEGER DEFAULT 30,
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    dietary_restrictions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    weight DECIMAL(5,1) NOT NULL,
    body_fat_pct DECIMAL(4,1),
    waist_cm DECIMAL(5,1),
    hip_cm DECIMAL(5,1),
    arm_cm DECIMAL(5,1),
    thigh_cm DECIMAL(5,1),
    chest_cm DECIMAL(5,1),
    recorded_at DATE NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    specialty TEXT NOT NULL,
    doctor_name TEXT,
    location TEXT,
    appointment_date TIMESTAMP NOT NULL,
    cost DECIMAL(10,2),
    notes TEXT,
    attachments TEXT[],
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'completed', 'cancelled'
    )),
    follow_up_months INTEGER,
    follow_up_status TEXT CHECK (follow_up_status IN (
        'pending', 'scheduled', 'ignored'
    )),
    follow_up_reminder_date DATE,
    follow_up_reminder_count INTEGER DEFAULT 0,
    agenda_event_id UUID,
    finance_transaction_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    steps INTEGER,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    calories_burned DECIMAL(8,2),
    met_value DECIMAL(4,2),
    recorded_at TIMESTAMP NOT NULL,
    notes TEXT,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    week_start DATE NOT NULL,
    plan_json JSONB NOT NULL,
    locked_days INTEGER[] DEFAULT '{}',
    dietary_restrictions TEXT[],
    weekly_budget DECIMAL(10,2),
    regeneration_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    recorded_date DATE NOT NULL,
    steps INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- Tabela MET de referência
CREATE TABLE activity_met_values (
    activity_type TEXT PRIMARY KEY,
    met_value DECIMAL(4,2) NOT NULL,
    display_name TEXT NOT NULL
);

INSERT INTO activity_met_values VALUES
    ('walking', 3.5, 'Caminhada'),
    ('running', 8.0, 'Corrida'),
    ('weightlifting', 6.0, 'Musculação'),
    ('cycling', 7.5, 'Ciclismo'),
    ('swimming', 7.0, 'Natação'),
    ('yoga', 3.0, 'Yoga'),
    ('soccer', 7.0, 'Futebol'),
    ('basketball', 6.5, 'Basquete'),
    ('dance', 5.0, 'Dança'),
    ('other', 4.0, 'Outro');

-- Índices
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, recorded_at);
CREATE INDEX idx_appointments_user_status ON medical_appointments(user_id, status);
CREATE INDEX idx_activities_user_date ON activities(user_id, recorded_at);
CREATE INDEX idx_daily_steps_user_date ON daily_steps(user_id, recorded_date);
```

---

## 10. RESUMO DAS REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-CRP-01 | Consulta gera evento na Agenda | Consultas |
| RN-CRP-02 | Campo obrigatório de retorno ao concluir | Consultas |
| RN-CRP-03 | Lembretes de retorno (máx 3) | Consultas |
| RN-CRP-04 | Status de retorno: pendente/agendado/ignorado | Consultas |
| RN-CRP-05 | Retorno 30+ dias → alerta vermelho | Consultas |
| RN-CRP-06 | Especialidades pré-definidas | Consultas |
| RN-CRP-07 | Custo → transação em Finanças | Consultas |
| RN-CRP-08 | Limite FREE: 3 consultas/mês | Consultas |
| RN-CRP-09 | Histórico permanente com filtros | Consultas |
| RN-CRP-10 | Anexos opcionais (Supabase Storage) | Consultas |
| RN-CRP-11 | TMB recalculada a cada novo peso | Evolução |
| RN-CRP-12 | Gráfico: 3/6/12 meses | Evolução |
| RN-CRP-13 | Meta de peso configurável | Evolução |
| RN-CRP-14 | Previsão baseada em 30 dias | Evolução |
| RN-CRP-15 | Alerta velocidade insegura (>1kg/sem) | Evolução |
| RN-CRP-16 | Medidas corporais opcionais | Evolução |
| RN-CRP-17 | Fotos de progresso opcionais | Evolução |
| RN-CRP-18 | IMC calculado e classificado | Evolução |
| RN-CRP-19 | Sincroniza com meta no Futuro | Evolução |
| RN-CRP-20 a 28 | Regras do cardápio IA | Nutrição |
| RN-CRP-29 a 36 | Regras de atividades físicas | Atividades |
| RN-CRP-37 a 39 | Regras de integração | Integração |

**Total: 39 regras de negócio**

---

---

## 11. ARQUITETURA DE IA — CORPO

### 11.1 Stack

```
Client (componente React)
    ↓ POST /api/ai/cardapio
Next.js Route Handler (app/api/ai/cardapio/route.ts)
    ↓ Vercel AI SDK — generateObject()
Provider MVP: Google Gemini 1.5 Flash (free)
Provider Prod: Anthropic Claude sonnet (pós-validação)
```

### 11.2 Packages necessários

```bash
npm install ai @ai-sdk/google @ai-sdk/groq
# na migração para produção:
npm install @ai-sdk/anthropic
```

### 11.3 Padrão de implementação (template)

```ts
// app/api/ai/cardapio/route.ts
import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar
import { generateObject } from 'ai'
import { z } from 'zod'

const model = google('gemini-1.5-flash')
// const model = anthropic('claude-sonnet-4-5')   // ← troca de 1 linha

const cardapioSchema = z.object({
  days: z.array(z.object({
    day: z.string(),
    meals: z.array(z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
    }))
  }))
})

export async function POST(req: Request) {
  const { tdee, goal, restrictions, budget } = await req.json()
  const { object } = await generateObject({
    model,
    schema: cardapioSchema,
    prompt: `Gere um cardápio semanal (7 dias) com café, almoço, jantar e 2 lanches/dia.
      TDEE: ${tdee} kcal/dia. Objetivo: ${goal}.
      Restrições: ${restrictions.join(', ') || 'nenhuma'}.
      Orçamento: R$ ${budget}/semana.
      Retorne JSON no schema solicitado. Inclua variedade e ingredientes acessíveis no Brasil.`,
  })
  return Response.json(object)
}
```

### 11.4 Rate limits do free tier

| Provider | Req/dia | Req/min | Tokens/dia |
|----------|---------|---------|-----------|
| Gemini 1.5 Flash | 1.500 | 15 | 1M |
| Groq + Llama 3.3 70B | 14.400 | 30 | — |

Para o MVP de validação, esses limites são mais que suficientes.

### 11.5 Critério de migração para Claude

Migrar quando **qualquer** uma das condições for atendida:
- MRR ≥ R$ 2.000 (receita PRO cobre custo da API)
- Rate limit do free tier sendo atingido diariamente
- Qualidade das respostas insatisfatória para os usuários

---

*Documento criado em: Fevereiro 2026*
*Atualizado em: Fevereiro 2026 — IA: Vercel AI SDK + Gemini (MVP) → Claude (produção)*
*Módulo: 🏃 Corpo — Saúde e Atividades*
*Próximos passos: Protótipo HTML seguindo design system MVP v2*
