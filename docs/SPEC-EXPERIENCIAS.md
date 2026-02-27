# SPEC-EXPERIÊNCIAS — ✈️ Módulo Experiências

> **Viagens e Roteiros**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Experiências (anteriormente "Viagem/SyncTrip")
> **Dependências:** Finanças (custos), Tempo (dias bloqueados), Futuro (objetivos de viagem)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Experiências

O módulo Experiências permite planejar viagens de ponta a ponta: roteiro dia a dia, hospedagem, deslocamentos, ingressos, alimentação, custos e sugestões IA. O nome "Experiências" foi escolhido porque "Viagem" é limitante — no futuro, o módulo pode incluir eventos, shows, restaurantes especiais e hobbies.

O nome interno para branding pode ser **SyncTrip** (reforça a marca SyncLife).

### 1.2 Diferencial Competitivo

| App | O que faz | O que NÃO faz |
|-----|-----------|---------------|
| Wanderlog | Planejamento visual com mapa, colaboração | Não integra orçamento com finanças pessoais |
| TripIt | Organização de reservas (scaneia emails) | Não planeja roteiro dia a dia |
| TriPandoo | Planejamento com IA | Não conecta com metas de vida |

SyncLife: custo da viagem é despesa planejada em Finanças, dias na Agenda, economia vinculada a Objetivo no Futuro.

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Minhas Viagens | Lista de viagens (planejando, reservado, em andamento, concluída) | Alta |
| Planejador (Wizard) | Wizard 5 etapas para criar viagem | Alta |
| Roteiro Diário | Itinerário dia a dia com timeline e mapa | Alta |
| Orçamento da Viagem | Estimativa e controle por categoria | Alta |
| Hospedagem e Deslocamentos | Hotéis, voos, transfers | Alta |
| Checklist | Itens para levar, documentos | Média |
| Sugestões IA | Chat para sugestões de atrações, roteiros, cuidados | Média |

---

## 3. FUNCIONALIDADE: PLANEJADOR DE VIAGEM (WIZARD)

### 3.1 O que o usuário vê e faz

Wizard de 5 etapas:

**Etapa 1 — Destino e Datas:** Destino(s), data ida/volta, tipo (Lazer, Trabalho, Estudo, Mista), nº viajantes.

**Etapa 2 — Orçamento:** Orçamento total estimado (ou "não sei, me ajude" → IA sugere). Opção de vincular a Meta no Futuro ou criar nova.

**Etapa 3 — Hospedagem:** Hotel/Airbnb com nome, endereço, check-in/out, custo/noite, status (reservado, pendente, pago). Total automático.

**Etapa 4 — Deslocamentos:** Voos (ida, volta, conexões), transporte terrestre (aluguel, transfer, trem). Total automático.

**Etapa 5 — Confirmação:** Resumo + custo total. Dias na Agenda. Custo em Finanças como despesa planejada.

### 3.2 Regras de Negócio

- **RN-EXP-01:** Status da viagem: "Planejando", "Reservado", "Em andamento", "Concluída", "Cancelada".
- **RN-EXP-02:** Dias bloqueados na Agenda como eventos "✈️ Experiências".
- **RN-EXP-03:** Custo total registrado como despesa planejada em Finanças: "Viagem".
- **RN-EXP-04:** Se vinculada a Meta no Futuro, progresso atualizado conforme economia.
- **RN-EXP-05:** Multi-destino: viagem pode ter várias cidades com datas diferentes.
- **RN-EXP-06:** Cada item de custo: "Estimado", "Reservado", "Pago".
- **RN-EXP-07:** Limite FREE: 1 viagem ativa. PRO: ilimitadas.
- **RN-EXP-08:** Ao criar viagem, sugerir: "Deseja criar Objetivo no Futuro para acompanhar?"

### 3.3 Critérios de Aceite

- [ ] Wizard 5 etapas navega corretamente
- [ ] Multi-destino funciona
- [ ] Dias aparecem na Agenda
- [ ] Custo total aparece em Finanças
- [ ] Vinculação com meta no Futuro funciona
- [ ] Limite FREE respeitado

---

## 4. FUNCIONALIDADE: ROTEIRO DIÁRIO

### 4.1 O que o usuário vê e faz

Para cada dia: timeline de atividades com horário, nome, endereço, custo, categoria (Passeio, Restaurante, Museu, Praia, Compras, Transporte, Descanso, Outro), notas. Visualização lista ou mapa (pins conectados). Funcionalidade "Alternativas": 1-2 alternativas por atividade ("Se chover: Museu ao invés do Jardim").

### 4.2 Regras de Negócio

- **RN-EXP-09:** 0 a 20 atividades por dia.
- **RN-EXP-10:** Reordenação por drag-and-drop.
- **RN-EXP-11:** Custo de cada atividade somado ao orçamento diário/total.
- **RN-EXP-12:** Até 2 alternativas por atividade.
- **RN-EXP-13:** Mapa mostra pins com rota sugerida.
- **RN-EXP-14:** Estimativa de tempo entre atividades (opcional, via API de mapas).
- **RN-EXP-15:** Export PDF do roteiro completo (PRO).

---

## 5. FUNCIONALIDADE: ORÇAMENTO DA VIAGEM

### 5.1 O que o usuário vê e faz

Mini-módulo financeiro da viagem. Orçamento dividido em categorias: Hospedagem, Transporte Aéreo, Transporte Terrestre, Alimentação, Ingressos/Passeios, Compras, Seguro, Documentação, Outros. Barra de progresso tipo envelope. IA pode estimar custos por dia no destino.

### 5.2 Regras de Negócio

- **RN-EXP-16:** Categorias pré-definidas de custo de viagem.
- **RN-EXP-17:** Itens em moeda diferente (USD, EUR, BRL) com conversão automática.
- **RN-EXP-18:** Diferença "Estimado" vs "Real/Pago" exibida por categoria.
- **RN-EXP-19:** Pós-viagem: resumo custo real vs estimado.
- **RN-EXP-20:** Custo real gera transações em Finanças quando confirmado.
- **RN-EXP-21:** Estimador IA: "Quanto custa por dia um viajante moderado em Lisboa?"

---

## 6. FUNCIONALIDADE: SUGESTÕES COM IA

### 6.1 O que o usuário vê e faz

Chat com IA para sugestões: "10 atrações em Roma para 5 dias", "Roteiro de 3 dias em Buenos Aires gastronômico", "Cuidados ao viajar para Egito?", "Preciso de visto para Japão?". Sugestões podem ser adicionadas ao roteiro com 1 clique.

### 6.2 Regras de Negócio

- **RN-EXP-22:** IA via **Vercel AI SDK** com abstração de provider. Provider MVP: **Google Gemini 1.5 Flash** (free tier). Provider produção (pós-validação): **Anthropic Claude**. Implementar como Next.js Route Handler em `/api/ai/viagem`. A troca de provider não altera frontend nem schema de resposta.
- **RN-EXP-23:** Sugestão aceita → atividade no roteiro do dia correspondente.
- **RN-EXP-24:** Limite FREE: 5 interações IA/viagem. PRO: ilimitado.
- **RN-EXP-25:** Aviso: "Sugestões IA podem conter informações desatualizadas."

---

## 7. FUNCIONALIDADE: CHECKLIST DE VIAGEM

### 7.1 O que o usuário vê e faz

Checklist inteligente sugerida por tipo/destino:
- Documentos: passaporte, visto, seguro, reservas, vacinação
- Bagagem: roupas por clima, higiene, medicamentos, adaptador
- Antes de viajar: avisar banco, roaming, chaves

### 7.2 Regras de Negócio

- **RN-EXP-26:** Checklist base gerada por destino (nacional/internacional), duração e tipo.
- **RN-EXP-27:** Itens personalizáveis pelo usuário.
- **RN-EXP-28:** % concluída exibida no Dashboard.
- **RN-EXP-29:** Alerta se passaporte vence antes ou até 6 meses após viagem.

---

## 8. INTEGRAÇÃO COM OUTROS MÓDULOS

### 8.1 Experiências → Finanças

| Evento | Ação em Finanças |
|--------|------------------|
| Viagem criada | Despesa planejada "Viagem — [Destino]" |
| Item pago | Transação individual na categoria correspondente |
| Pós-viagem confirmada | Transações reais substituem estimativas |

### 8.2 Experiências → Tempo

| Evento | Ação no Tempo |
|--------|---------------|
| Viagem criada | Período bloqueado na agenda |
| Check-in/out hospedagem | Eventos na agenda |

### 8.3 Experiências → Futuro

| Evento | Ação no Futuro |
|--------|----------------|
| Economia para viagem | Meta financeira vinculada progride |
| Viagem concluída | Objetivo de viagem pode ser concluído |
| Viagem criada | Sugestão de criar Objetivo para acompanhar |

### 8.4 Regras de Integração

- **RN-EXP-30:** Integrações opt-in.
- **RN-EXP-31:** Transações auto-geradas com badge "Auto — ✈️ Experiências".
- **RN-EXP-32:** Cancelamento de viagem pergunta sobre exclusão de items vinculados.

---

## 9. MODO FOCO vs MODO JORNADA

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Planejamento | Formulários e listas | Assistente IA conversacional monta roteiro interativamente |
| Countdown | Data em texto | Countdown visual animado com imagem do destino |
| Orçamento | Tabela de custos | "Cada R$ 100 economizado é uma refeição em Paris!" |
| Pós-viagem | Resumo de gastos | "Diário de viagem" automático com highlights |

---

## 10. MODELO DE DADOS

```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    destinations TEXT[] NOT NULL,
    trip_type TEXT CHECK (trip_type IN ('leisure','work','study','mixed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers_count INTEGER DEFAULT 1,
    total_budget DECIMAL(12,2),
    total_spent DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning','reserved','ongoing','completed','cancelled'
    )),
    notes TEXT,
    objective_id UUID REFERENCES objectives(id),
    agenda_event_ids UUID[],
    finance_transaction_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    cost_per_night DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN (
        'estimated','reserved','paid'
    )),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN (
        'flight','train','bus','car_rental','taxi','transfer','other'
    )),
    origin TEXT,
    destination TEXT,
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    company TEXT,
    cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN (
        'estimated','reserved','paid'
    )),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    day_date DATE NOT NULL,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'sightseeing','restaurant','museum','beach','shopping',
        'transport','rest','other'
    )),
    address TEXT,
    estimated_time TIME,
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_itinerary_alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_item_id UUID REFERENCES trip_itinerary_items(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 1
);

CREATE TABLE trip_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN (
        'accommodation','air_transport','ground_transport',
        'food','tickets','shopping','insurance','documents','other'
    )),
    estimated_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'documents','luggage','before_trip','other'
    )),
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips(user_id, status);
CREATE INDEX idx_trip_itinerary_day ON trip_itinerary_items(trip_id, day_date);
CREATE INDEX idx_trip_checklist ON trip_checklist_items(trip_id);
```

---

## 11. RESUMO — 32 REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-EXP-01 a 08 | Planejador de viagem | Wizard |
| RN-EXP-09 a 15 | Roteiro diário | Roteiro |
| RN-EXP-16 a 21 | Orçamento da viagem | Orçamento |
| RN-EXP-22 a 25 | Sugestões IA | IA |
| RN-EXP-26 a 29 | Checklist | Checklist |
| RN-EXP-30 a 32 | Regras de integração | Integração |

---

---

## 12. ARQUITETURA DE IA — EXPERIÊNCIAS

### 12.1 Stack

```
Client (componente React — chat ou botão "Sugerir roteiro")
    ↓ POST /api/ai/viagem
Next.js Route Handler (app/api/ai/viagem/route.ts)
    ↓ Vercel AI SDK — generateText() ou streamText()
Provider MVP: Google Gemini 1.5 Flash (free)
Provider Prod: Anthropic Claude sonnet (pós-validação)
```

### 12.2 Packages necessários

```bash
npm install ai @ai-sdk/google
# na migração para produção:
npm install @ai-sdk/anthropic
```

### 12.3 Padrão de implementação (template)

```ts
// app/api/ai/viagem/route.ts
import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar
import { streamText } from 'ai'

const model = google('gemini-1.5-flash')
// const model = anthropic('claude-sonnet-4-5')   // ← troca de 1 linha

export async function POST(req: Request) {
  const { message, destination, startDate, endDate, preferences } = await req.json()

  const result = streamText({
    model,
    system: `Você é um assistente de viagens especializado em roteiros para brasileiros.
      Contexto da viagem: destino ${destination}, de ${startDate} a ${endDate}.
      Preferências: ${preferences}.
      Responda em português, seja prático e inclua dicas de custo em BRL quando possível.
      Aviso: suas informações podem estar desatualizadas — sempre oriente o usuário a confirmar.`,
    messages: [{ role: 'user', content: message }],
    maxTokens: 1024,
  })

  return result.toDataStreamResponse()
}
```

### 12.4 Critério de migração para Claude

Mesmos critérios do módulo Corpo: MRR ≥ R$ 2.000, rate limit atingido, ou qualidade insatisfatória.

---

*Documento criado em: Fevereiro 2026*
*Atualizado em: Fevereiro 2026 — IA: Vercel AI SDK + Gemini (MVP) → Claude (produção)*
*Módulo: ✈️ Experiências — Viagens e Roteiros*
