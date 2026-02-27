# SPEC-CARREIRA — 💼 Módulo Carreira

> **Profissão e Crescimento**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Carreira
> **Dependências:** Mente (habilidades/trilhas), Finanças (salário), Futuro (objetivos profissionais), Tempo (entrevistas/deadlines)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Carreira

O módulo Carreira permite planejar e rastrear evolução profissional: cargo atual, roadmap para onde quer chegar, habilidades em desenvolvimento e impacto financeiro de cada movimentação. É o espaço privado onde o usuário planeja de verdade sua trajetória — não para exibir publicamente como LinkedIn, mas para construir um caminho concreto.

### 1.2 Diferencial Competitivo

Não existe app popular de planejamento de carreira pessoal integrado com finanças e estudos. O SyncLife preenche: "Quero ser gerente em 2 anos. O que preciso estudar? Quanto vou ganhar? Como isso afeta meu planejamento financeiro?"

O ciclo virtuoso único: **Estudo (Mente) → Habilidade → Roadmap → Promoção → Salário → Finanças**

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Dashboard Carreira | Cargo atual, próximo passo, habilidades, metas | Alta |
| Perfil Profissional | Cargo, empresa, salário, histórico | Alta |
| Roadmap de Carreira | Timeline visual: onde estou → onde quero chegar | Alta |
| Mapa de Habilidades | Habilidades com nível de proficiência | Alta |
| Histórico Profissional | Timeline de cargos, promoções, certificações | Média |

---

## 3. FUNCIONALIDADE: PERFIL PROFISSIONAL

### 3.1 O que o usuário vê e faz

Cadastra: cargo atual, empresa, área de atuação, nível hierárquico, salário bruto, data de início. Salário sincroniza com Finanças como receita recorrente. Mudanças de cargo/salário atualizam projeções financeiras automaticamente.

### 3.2 Regras de Negócio

- **RN-CAR-01:** Salário sincronizado como receita recorrente em Finanças (opt-in).
- **RN-CAR-02:** Toda edição de cargo/empresa/salário gera registro histórico com data.
- **RN-CAR-03:** Áreas pré-definidas: Tecnologia, Finanças, Saúde, Educação, Direito, Engenharia, Marketing, Vendas, RH, Design, Gestão, Outra.
- **RN-CAR-04:** Níveis: Estagiário, Júnior, Pleno, Sênior, Especialista, Coordenador, Gerente, Diretor, C-Level, Autônomo/Freelancer, Empreendedor.

### 3.3 Critérios de Aceite

- [ ] Perfil profissional salvo corretamente
- [ ] Salário sincroniza com Finanças (se opt-in)
- [ ] Histórico de mudanças registrado
- [ ] Edição de salário recalcula projeções financeiras

---

## 4. FUNCIONALIDADE: ROADMAP DE CARREIRA

### 4.1 O que o usuário vê e faz

Timeline vertical: cargo atual (início) → cargo alvo (fim). Entre os dois, passos intermediários com: nome, habilidades necessárias, prazo estimado, status. Cada passo pode vincular habilidades que são alimentadas por trilhas de estudo do módulo Mente.

**Exemplo:** João é Dev Pleno, quer ser Tech Lead em 2 anos:
1. "Aprofundar React e arquitetura" (habilidade: React, 6 meses) → trilha "React Avançado"
2. "Desenvolver liderança" (habilidade: Liderança, 6 meses) → trilha "Gestão para tech leads"
3. "Mentorar 2 devs júnior" (habilidade: Mentoria, 6 meses) → sem estudo formal
4. "Aplicar para vaga de Tech Lead" (6 meses)

Progresso nos estudos avança o roadmap automaticamente.

### 4.2 Regras de Negócio

- **RN-CAR-05:** Roadmap: cargo atual (início), cargo alvo (fim), prazo total, passos intermediários.
- **RN-CAR-06:** Cada passo pode ter 0+ habilidades vinculadas.
- **RN-CAR-07:** Habilidades compartilhadas entre Roadmap e Trilhas de Estudo (Mente).
- **RN-CAR-08:** Progresso do passo = média do progresso das habilidades vinculadas.
- **RN-CAR-09:** Concluir roadmap → sugerir atualização do perfil profissional.
- **RN-CAR-10:** Cargo alvo pode ter "salário esperado" que alimenta cenários no simulador financeiro.
- **RN-CAR-11:** Limite FREE: 1 roadmap ativo. PRO: 3 simultâneos.
- **RN-CAR-12:** Roadmap vinculável a Objetivo no Futuro. Progresso do roadmap alimenta a meta correspondente.

### 4.3 Critérios de Aceite

- [ ] Criação de roadmap com passos intermediários
- [ ] Visualização em timeline vertical
- [ ] Vinculação passo → habilidade → trilha funciona
- [ ] Progresso automático ao completar trilhas/habilidades
- [ ] Salário esperado conecta com projeções financeiras
- [ ] Progresso sincroniza com meta no Futuro

---

## 5. FUNCIONALIDADE: MAPA DE HABILIDADES

### 5.1 O que o usuário vê e faz

Lista visual de habilidades: nome, categoria (Hard Skills, Soft Skills, Idiomas, Certificações), nível (1-5: Iniciante a Expert), fonte de desenvolvimento (trilhas vinculadas, experiência, cursos).

Nível pode ser autoavaliado e/ou calculado automaticamente via progresso de trilhas vinculadas.

### 5.2 Regras de Negócio

- **RN-CAR-13:** Habilidades vinculáveis a múltiplas trilhas de estudo (N:N).
- **RN-CAR-14:** Nível: 1 (Iniciante), 2 (Básico), 3 (Intermediário), 4 (Avançado), 5 (Expert).
- **RN-CAR-15:** Trilha vinculada → progresso sugere atualização do nível.
- **RN-CAR-16:** Habilidades alimentam Roadmap (pré-requisitos de cada passo).
- **RN-CAR-17:** Categorias: Hard Skills, Soft Skills, Idiomas, Certificações.

---

## 6. INTEGRAÇÃO COM OUTROS MÓDULOS

### 6.1 Carreira → Finanças

| Evento | Ação em Finanças |
|--------|------------------|
| Salário informado | Receita recorrente "Salário" |
| Salário atualizado | Receita recorrente ajustada + projeções recalculadas |
| Salário esperado (cargo alvo) | Cenário futuro no planejamento financeiro |

### 6.2 Carreira → Mente

| Evento | Ação em Mente |
|--------|---------------|
| Passo do roadmap precisa de habilidade | Sugere criar trilha no módulo Mente |
| Habilidade precisa de atualização | Sugere retomar trilha vinculada |

### 6.3 Carreira → Tempo

| Evento | Ação no Tempo |
|--------|---------------|
| Deadline de passo do roadmap | Evento na agenda |
| Entrevista/reunião de carreira | Evento na agenda com tag "💼 Carreira" |

### 6.4 Carreira → Futuro

| Evento | Ação no Futuro |
|--------|----------------|
| Roadmap progride | Meta profissional vinculada atualiza |
| Promoção efetivada | Objetivo profissional concluído |
| Salário muda | Contexto para impacto financeiro no objetivo |

### 6.5 Regras de Integração

- **RN-CAR-18:** Integrações opt-in.
- **RN-CAR-19:** Transações auto-geradas com badge "Auto — 💼 Carreira".
- **RN-CAR-20:** Promoção efetivada (PRO/Jornada) → calcula impacto: "Com novo salário, IF X anos antes!"

---

## 7. MODO FOCO vs MODO JORNADA

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Roadmap | Timeline com status | "Jornada do herói" gamificada com marcos |
| Habilidades | Lista com níveis | Radar chart (gráfico aranha) que evolui visualmente |
| Dashboard | Cargo, próximo passo | "Você está a X% do próximo cargo. Habilidades mais críticas: ..." |
| Promoção | Registro manual | Celebração + impacto financeiro: "Novo salário → IF 2 anos antes!" |

---

## 8. MODELO DE DADOS

```sql
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_title TEXT,
    current_company TEXT,
    field TEXT CHECK (field IN (
        'technology','finance','health','education','law',
        'engineering','marketing','sales','hr','design',
        'management','other'
    )),
    level TEXT CHECK (level IN (
        'intern','junior','mid','senior','specialist',
        'coordinator','manager','director','c_level',
        'freelancer','entrepreneur'
    )),
    gross_salary DECIMAL(12,2),
    start_date DATE,
    sync_salary_to_finance BOOLEAN DEFAULT FALSE,
    finance_recurring_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    field TEXT,
    level TEXT,
    salary DECIMAL(12,2),
    start_date DATE NOT NULL,
    end_date DATE,
    change_type TEXT CHECK (change_type IN (
        'initial','promotion','lateral','company_change','salary_change','other'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    current_title TEXT NOT NULL,
    target_title TEXT NOT NULL,
    target_salary DECIMAL(12,2),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN (
        'active','completed','paused','abandoned'
    )),
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending','in_progress','completed'
    )),
    progress DECIMAL(5,2) DEFAULT 0,
    sort_order INTEGER NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'hard_skill','soft_skill','language','certification'
    )),
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Relação N:N entre steps e skills
CREATE TABLE roadmap_step_skills (
    step_id UUID REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, skill_id)
);

-- Relação N:N entre skills e trilhas de estudo
CREATE TABLE skill_study_tracks (
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, track_id)
);

CREATE INDEX idx_professional_profiles_user ON professional_profiles(user_id);
CREATE INDEX idx_career_roadmaps_user ON career_roadmaps(user_id, status);
CREATE INDEX idx_skills_user ON skills(user_id);
```

---

## 9. RESUMO — 20 REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-CAR-01 a 04 | Perfil profissional | Perfil |
| RN-CAR-05 a 12 | Roadmap de carreira | Roadmap |
| RN-CAR-13 a 17 | Mapa de habilidades | Habilidades |
| RN-CAR-18 a 20 | Regras de integração | Integração |

---

*Documento criado em: Fevereiro 2026*
*Módulo: 💼 Carreira — Profissão e Crescimento*
