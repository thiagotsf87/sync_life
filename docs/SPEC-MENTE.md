# SPEC-MENTE — 🧠 Módulo Mente

> **Estudos e Aprendizado**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Mente (anteriormente "Estudos")
> **Dependências:** Carreira (habilidades/roadmap), Tempo (blocos de estudo), Futuro (objetivos de aprendizado), Finanças (custos de cursos)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Mente

O módulo Mente combina gestão de aprendizado com produtividade. Trilhas de conhecimento, Timer Pomodoro, biblioteca de recursos e sessões de estudo — tudo conectado ao módulo Carreira (estudar para evoluir profissionalmente) e Tempo (blocos de estudo agendados). O nome "Mente" foi escolhido porque "Estudos" limita o escopo. "Mente" permite incluir leitura, meditação, journaling e desenvolvimento cognitivo no futuro.

### 1.2 Diferencial Competitivo

Nenhum app conecta **estudo → habilidade → carreira → salário → finanças**. No SyncLife, estudar "React Avançado" avança a meta "Promoção para Tech Lead" que alimenta projeção salarial no módulo Finanças.

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Dashboard Mente | Horas da semana, streak, trilhas ativas, próximas sessões | Alta |
| Trilhas de Aprendizado | Cursos/habilidades em andamento com progresso | Alta |
| Timer de Foco (Pomodoro) | Timer configurável com foco/pausa | Alta |
| Sessões de Estudo | Histórico de sessões, tempo por matéria | Alta |
| Biblioteca de Recursos | Links, PDFs, notas organizados por trilha | Média |

---

## 3. FUNCIONALIDADE: TRILHAS DE APRENDIZADO

### 3.1 O que o usuário vê e faz

Trilhas representam tema/habilidade em estudo. Cada trilha: nome, categoria, meta de conclusão (opcional, com data), progresso (0-100%), lista de etapas. A trilha pode vincular a Habilidade no módulo Carreira — avançar a trilha avança a habilidade automaticamente.

**Insight:** SyncLife rastreia progresso de QUALQUER fonte: livros, cursos online (qualquer plataforma), mentorias, workshops, prática autônoma. Diferente de Coursera/Udemy que só rastreiam dentro da própria plataforma.

### 3.2 Regras de Negócio

- **RN-MNT-01:** Cada trilha: 1 a 50 etapas/módulos.
- **RN-MNT-02:** Progresso = (etapas concluídas / total) × 100, calculado automaticamente.
- **RN-MNT-03:** Trilhas vinculáveis a habilidades no Carreira (N:1 — várias trilhas → uma habilidade).
- **RN-MNT-04:** Trilhas vinculáveis a metas no Futuro. Progresso da trilha alimenta a meta.
- **RN-MNT-05:** Status: "Em andamento", "Pausada", "Concluída", "Abandonada".
- **RN-MNT-06:** Conclusão de trilha → conquista no sistema de Conquistas.
- **RN-MNT-07:** Categorias: Tecnologia, Idiomas, Gestão, Marketing, Design, Finanças, Saúde, Concurso, Graduação, Pós-graduação, Certificação, Outro.
- **RN-MNT-08:** Limite FREE: 3 trilhas ativas. PRO: ilimitadas.
- **RN-MNT-09:** Custo de curso/material (opcional) pode gerar transação em Finanças na categoria "Educação".

### 3.3 Critérios de Aceite

- [ ] CRUD de trilhas com etapas funcional
- [ ] Progresso automático ao marcar etapas
- [ ] Vinculação trilha → habilidade no Carreira funciona
- [ ] Vinculação trilha → meta no Futuro funciona
- [ ] Conclusão gera conquista
- [ ] Dashboard mostra trilhas ativas

---

## 4. FUNCIONALIDADE: TIMER DE FOCO (POMODORO)

### 4.1 O que o usuário vê e faz

Seleciona trilha (ou "estudo livre"), inicia timer. Padrão Pomodoro: 25min foco + 5min pausa + 15min pausa longa a cada 4 ciclos. Timer circular grande, nome da trilha, contagem de ciclos. Ao final, som de notificação + transição automática para pausa. Pode anotar o que estudou em cada ciclo.

### 4.2 Regras de Negócio

- **RN-MNT-10:** Padrão: 25min foco, 5min pausa curta, 15min pausa longa, 4 ciclos.
- **RN-MNT-11:** Personalizável: foco (15-90 min), pausa curta (3-15 min), pausa longa (10-30 min), ciclos (2-6).
- **RN-MNT-12:** Pomodoro concluído → tempo registrado na trilha selecionada.
- **RN-MNT-13:** Sessão associável a evento "Bloco de Estudo" na Agenda.
- **RN-MNT-14:** Sons ambiente durante foco (chuva, natureza, lo-fi) — exclusivo Jornada/PRO.
- **RN-MNT-15:** Streak: dias consecutivos com 1+ Pomodoro. Perder streak → notificação empática.
- **RN-MNT-16:** Relatório semanal: horas totais, média/dia, trilha mais estudada, comparativo semana anterior.
- **RN-MNT-17:** Timer funciona em background com notificação ativa.
- **RN-MNT-18:** Pontos de foco por sessão completa → alimenta conquistas e sistema de XP (Jornada).

### 4.3 Critérios de Aceite

- [ ] Timer com contagem regressiva e transição automática foco → pausa
- [ ] Som de notificação ao final de cada ciclo
- [ ] Tempo registrado na trilha selecionada
- [ ] Streak calculado e exibido
- [ ] Personalização de tempos funciona
- [ ] Relatório semanal com totais e comparativos

---

## 5. FUNCIONALIDADE: BIBLIOTECA DE RECURSOS

### 5.1 O que o usuário vê e faz

Mini-biblioteca por trilha: links, vídeos YouTube, livros, notas, PDFs. Cada recurso: título, tipo (Link, Livro, Vídeo, PDF, Nota, Outro), URL (se aplicável), nota pessoal, status (Para estudar, Estudando, Concluído).

### 5.2 Regras de Negócio

- **RN-MNT-19:** Tipos: Link, Livro, Vídeo, PDF, Nota de texto, Outro.
- **RN-MNT-20:** Organizados por trilha, filtráveis por status.
- **RN-MNT-21:** Nota pessoal em texto livre (Markdown básico).
- **RN-MNT-22:** Limite FREE: 10 recursos/trilha. PRO: ilimitado.
- **RN-MNT-23:** Recursos são referências (links, títulos), não armazenam arquivos.

---

## 6. INTEGRAÇÃO COM OUTROS MÓDULOS

### 6.1 Mente → Carreira

| Evento na Mente | Ação em Carreira |
|------------------|------------------|
| Trilha progride | Habilidade vinculada sugere aumento de nível |
| Trilha concluída | Habilidade vinculada marca como "completa" |
| Sessão de Pomodoro | Alimenta "horas de desenvolvimento" no perfil profissional |

### 6.2 Mente → Tempo (Agenda)

| Evento | Ação no Tempo |
|--------|---------------|
| Bloco de estudo agendado | Evento na agenda com tag "🧠 Mente" |
| Meta de conclusão com prazo | Deadline na agenda |

### 6.3 Mente → Futuro

| Evento | Ação no Futuro |
|--------|----------------|
| Trilha progride | Meta vinculada atualiza progresso |
| Trilha concluída | Meta vinculada marca 100% |
| Horas semanais | Meta de estudo atualiza |

### 6.4 Mente → Finanças

| Evento | Ação em Finanças |
|--------|------------------|
| Custo de curso registrado | Transação "Educação" |

### 6.5 Regras de Integração

- **RN-MNT-24:** Integrações opt-in.
- **RN-MNT-25:** Eventos auto-gerados com badge "Auto — 🧠 Mente".
- **RN-MNT-26:** Exclusão de trilha notifica sobre metas/habilidades vinculadas.

---

## 7. MODO FOCO vs MODO JORNADA

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Timer | Timer simples | Sons ambiente, animação, celebração |
| Trilhas | Barra de progresso | "Nível" do estudante com XP, badges por trilhas concluídas |
| Dashboard | Horas e média | Ranking pessoal, insights ("Você estuda melhor entre 19h-21h") |
| Streak | Número de dias | Chamas visuais que crescem, perda com mensagem empática |

---

## 8. MODELO DE DADOS

```sql
CREATE TABLE study_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'technology','languages','management','marketing','design',
        'finance','health','exam','undergraduate','postgraduate',
        'certification','other'
    )),
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'in_progress','paused','completed','abandoned'
    )),
    target_date DATE,
    progress DECIMAL(5,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(10,2),
    linked_skill_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_track_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    sort_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    track_id UUID REFERENCES study_tracks(id),
    duration_minutes INTEGER NOT NULL,
    focus_minutes INTEGER NOT NULL,
    break_minutes INTEGER NOT NULL,
    cycles_completed INTEGER DEFAULT 0,
    session_notes TEXT,
    recorded_at TIMESTAMP NOT NULL,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('link','book','video','pdf','note','other')),
    url TEXT,
    personal_notes TEXT,
    status TEXT DEFAULT 'to_study' CHECK (status IN (
        'to_study','studying','completed'
    )),
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_study_tracks_user ON study_tracks(user_id, status);
CREATE INDEX idx_focus_sessions_user_date ON focus_sessions(user_id, recorded_at);
CREATE INDEX idx_study_resources_track ON study_resources(track_id);
```

---

## 9. RESUMO — 26 REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-MNT-01 a 09 | Trilhas de aprendizado | Trilhas |
| RN-MNT-10 a 18 | Timer de Foco (Pomodoro) | Timer |
| RN-MNT-19 a 23 | Biblioteca de recursos | Biblioteca |
| RN-MNT-24 a 26 | Regras de integração | Integração |

---

*Documento criado em: Fevereiro 2026*
*Módulo: 🧠 Mente — Estudos e Aprendizado*
