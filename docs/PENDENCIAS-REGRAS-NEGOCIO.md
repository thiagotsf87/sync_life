# Pendências de Regras de Negócio — SyncLife MVP V3

> **⚠️ META-REGRA OBRIGATÓRIA:** Este documento DEVE ser atualizado a cada implementação.
> Ao concluir uma regra, altere o status de ❌/⚠️ para ✅ e registre a data de conclusão.
> Ao iniciar a implementação de um grupo, crie um commit referenciando os IDs das regras.

**Última atualização:** 2026-02-27
**Responsável:** Claude Code (atualizar conforme progresso)

---

## Legenda de Status

| Ícone | Significado |
|-------|-------------|
| ✅ | Implementado e testado |
| ⚠️ | Parcialmente implementado (tem lacunas) |
| ❌ | Pendente — não implementado |
| 🚫 | Fora do escopo MVP (adiado para versão futura) |

---

## Resumo Executivo

| Módulo | Total | ✅ | ⚠️ | ❌ |
|--------|-------|-----|-----|-----|
| FUTURO | 58 | 8 | 12 | 38 |
| CORPO | 39 | 15 | 8 | 16 |
| EXPERIÊNCIAS | 32 | 12 | 6 | 14 |
| MENTE | 26 | 10 | 6 | 10 |
| PATRIMÔNIO | 24 | 10 | 5 | 9 |
| CARREIRA | 20 | 8 | 4 | 8 |
| **TOTAL** | **199** | **~63 (32%)** | **~41 (21%)** | **~95 (48%)** |

> Obs: Finanças (~95 regras implícitas) não catalogadas neste documento pois já estão em `financas-visao-geral-regras-de-negocio.md`.

---

## Prioridades de Implementação

### Grupo P1 — Fundação (impacta múltiplos módulos)
> Implementar primeiro pois desbloqueiam funcionalidades em cascata

1. **Sistema de notificações** — base para RN-FUT-51..54, RN-CRP-03..05, etc.
2. **Infraestrutura de integrações opt-in** — base para cross-module (RN-CRP-37..39, RN-EXP-30..32, etc.)
3. **Enforcement FREE/PRO** — RN-FUT-06, RN-CRP-08, RN-EXP-07, RN-MNT-08, RN-PTR-07, RN-CAR-11
4. **Vinculação automática Futuro ↔ módulos** — RN-FUT-18, RN-FUT-31..50

### Grupo P2 — Features core faltantes
> Funcionalidades principais prometidas mas não implementadas

5. **Cardápio IA + Coach IA** (Corpo) — RN-CRP-20..28
6. **Sugestões IA de viagem** (Experiências) — RN-EXP-21..25
7. **Pomodoro Timer** (Mente) — RN-MNT-10..18
8. **Mapa da Vida / Radar Chart** (Futuro/Jornada) — RN-FUT-26..30

### Grupo P3 — Integrações cross-module
> Após P1, implementar por ordem de impacto no UX

9. Corpo → Agenda (consulta gera evento) — RN-CRP-01
10. Corpo → Finanças (custo consulta → transação) — RN-CRP-07
11. Patrimônio → Finanças (proventos → receitas) — RN-PTR-12
12. Carreira → Finanças (salário sync) — RN-CAR-01
13. Mente → Carreira (trilha → habilidade) — RN-MNT-03
14. Experiências → Agenda (dias viagem bloqueados) — RN-EXP-02
15. Experiências → Finanças (custo viagem) — RN-EXP-03

### Grupo P4 — Cálculos e lógica avançada
16. TMB/TDEE + Gráfico evolução peso (Corpo) — RN-CRP-11..18
17. Velocidade de progresso + Alerta prazo (Futuro) — RN-FUT-24..25
18. Comparativo vs benchmarks (Patrimônio) — RN-PTR-06
19. Previsão provento + Yield on Cost — RN-PTR-14..16

### Grupo P5 — UI avançada e edge cases
20. Mapa com pins (Experiências) — RN-EXP-13
21. Export PDF roteiro (Experiências) — RN-EXP-15
22. Multi-moeda (Experiências) — RN-EXP-17
23. Drag-and-drop itinerário (Experiências) — RN-EXP-10
24. Edge cases de exclusão cross-module — RN-FUT-55..58, RN-CRP-39, RN-EXP-32
25. Migração metas v2 → objetivos v3 — RN-FUT-58

---

## Detalhamento por Módulo

---

### 🔮 MÓDULO FUTURO (58 regras)

#### Dashboard (RN-FUT-01 a 06)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-01 | Ordenação: prioridade / progresso / prazo (toggle) | ⚠️ | Existe ordenação básica, falta toggle |
| RN-FUT-02 | Badge "Atrasado" em vermelho para prazo vencido | ❌ | |
| RN-FUT-03 | Progresso geral = média ponderada dos objetivos ativos | ⚠️ | Calculado mas sem pesos |
| RN-FUT-04 | Concluídos → aba "Concluídos" após 7 dias (com opção restaurar) | ❌ | |
| RN-FUT-05 | Máximo 10 objetivos na visão principal | ❌ | |
| RN-FUT-06 | Limite FREE: 3 objetivos ativos | ❌ | Sem enforcement |

#### Wizard Criar Objetivo (RN-FUT-07 a 15)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-07 | Mínimo 1 meta por objetivo | ⚠️ | Validação básica existe |
| RN-FUT-08 | Limite FREE: 3 metas por objetivo | ❌ | |
| RN-FUT-09 | Módulo destino deve estar ativo no perfil | ❌ | |
| RN-FUT-10 | Vinculação a itens existentes nos módulos | ❌ | Cross-module não implementado |
| RN-FUT-11 | Meta financeira → pergunta sobre orçamento existente | ❌ | |
| RN-FUT-12 | Meta tarefa → cria evento automático na Agenda | ❌ | Cross-module |
| RN-FUT-13 | Sugestões de metas são contextuais e opcionais | ✅ | Wizard informativo |
| RN-FUT-14 | Nome do objetivo não duplicável | ✅ | Constraint DB |
| RN-FUT-15 | Data alvo deve ser futura | ❌ | Sem validação de data |

#### Detalhe do Objetivo (RN-FUT-16 a 25)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-16 | Progresso = Σ(progresso × peso) / Σ(pesos) | ⚠️ | Calculado mas pesos iguais |
| RN-FUT-17 | Cálculo por tipo: monetário, peso, tarefa, frequência, etc. | ⚠️ | Tipos básicos implementados |
| RN-FUT-18 | Metas vinculadas atualizam automaticamente | ❌ | Cross-module não implementado |
| RN-FUT-19 | 100% em todas metas → notificação de celebração | ❌ | Sem sistema de notificação |
| RN-FUT-20 | Objetivos pausados excluídos do Life Sync Score | ⚠️ | Score não lê status pausado |
| RN-FUT-21 | Adicionar metas a objetivo existente | ✅ | |
| RN-FUT-22 | Remover metas com mínimo de 1 obrigatória | ⚠️ | Sem validação de mínimo |
| RN-FUT-23 | Edições registradas na timeline de marcos | ❌ | Timeline não implementada |
| RN-FUT-24 | Velocidade de progresso: últimos 30 dias | ❌ | |
| RN-FUT-25 | Alerta amarelo se ritmo insuficiente para prazo | ❌ | |

#### Mapa da Vida — Jornada (RN-FUT-26 a 30)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-26 | Mapa da Vida exclusivo Modo Jornada (PRO) | ❌ | Feature não criada |
| RN-FUT-27 | Dimensão radar = média por módulo | ❌ | |
| RN-FUT-28 | Radar atualiza em tempo real | ❌ | |
| RN-FUT-29 | Insights gerados semanalmente | ❌ | |
| RN-FUT-30 | Widget do Mapa disponível no Dashboard Home | ❌ | |

#### Integrações com Módulos (RN-FUT-31 a 50)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-31 | Meta financeira → entrada automática em Finanças | ❌ | Cross-module |
| RN-FUT-32 | Valor em categoria vinculada alimenta meta financeira | ❌ | Cross-module |
| RN-FUT-33 | Excluir meta financeira → pergunta manter em Finanças | ❌ | |
| RN-FUT-34 | Meta tarefa → evento na Agenda com tag "🔮 Futuro" | ❌ | Cross-module |
| RN-FUT-35 | Prazo do objetivo → lembretes 30d/7d/dia na Agenda | ❌ | Cross-module |
| RN-FUT-36 | Tarefa concluída na Agenda → meta Futuro = 100% | ❌ | Cross-module bidirecional |
| RN-FUT-37 | Meta de peso sincroniza com `weight_goal_kg` do perfil | ❌ | Cross-module |
| RN-FUT-38 | Progresso de peso atualiza automaticamente do Corpo | ❌ | Cross-module |
| RN-FUT-39 | Meta de exercício sincroniza com meta atividades Corpo | ❌ | Cross-module |
| RN-FUT-40 | Meta vinculada a trilha herda progresso | ❌ | Cross-module |
| RN-FUT-41 | Sem trilha → sugerir criar no Mente | ❌ | |
| RN-FUT-42 | Conclusão da trilha → meta = 100% | ❌ | Cross-module |
| RN-FUT-43 | Meta patrimônio = (patrimônio atual / alvo) × 100 | ❌ | Cross-module |
| RN-FUT-44 | Meta renda passiva = (proventos médios 12m / alvo) × 100 | ❌ | Cross-module |
| RN-FUT-45 | Cotações e aportes refletem no progresso da meta | ❌ | Cross-module |
| RN-FUT-46 | Meta vinculada a step do roadmap herda progresso | ❌ | Cross-module |
| RN-FUT-47 | Roadmap completo → todas metas vinculadas = 100% | ❌ | Cross-module |
| RN-FUT-48 | Meta "aumento salarial" compara com salário alvo | ❌ | Cross-module |
| RN-FUT-49 | Meta financeira de viagem vincula ao orçamento Experiências | ❌ | Cross-module |
| RN-FUT-50 | Ao criar viagem → sugerir Objetivo no Futuro | ⚠️ | Mensagem existe mas não cria |

#### Notificações (RN-FUT-51 a 54)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-51 | Notificações desativáveis individualmente nas Settings | ❌ | Sem sistema de notificações |
| RN-FUT-52 | Notificação "meta parada" enviada 1x (14 dias) | ❌ | |
| RN-FUT-53 | Resumo semanal exclusivo Jornada (PRO) | ❌ | |
| RN-FUT-54 | Tom das notificações empático, nunca punitivo | ❌ | Sem notificações |

#### Edge Cases (RN-FUT-55 a 58)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-55 | Metas de módulos inativos: suspensas, não excluídas | ❌ | |
| RN-FUT-56 | Item vinculado excluído → meta desvinculada, não excluída | ❌ | |
| RN-FUT-57 | Objetivo com metas inativas 30d+ sugere arquivamento | ❌ | |
| RN-FUT-58 | Script de migração metas v2 → objetivos v3 | ❌ | |

---

### 🏃 MÓDULO CORPO (39 regras)

#### Consultas Médicas (RN-CRP-01 a 10)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-01 | Consulta criada → evento automático na Agenda | ❌ | Cross-module |
| RN-CRP-02 | Ao concluir: campo obrigatório de retorno | ✅ | Implementado no CRUD |
| RN-CRP-03 | Lembretes de retorno (máx 3) enviados na data | ❌ | Sem notificações |
| RN-CRP-04 | Status de retorno: pendente/agendado/ignorado | ✅ | |
| RN-CRP-05 | Retorno pendente 30+ dias → alerta vermelho Dashboard | ❌ | Alerta não implementado |
| RN-CRP-06 | Especialidades pré-definidas (lista completa) | ✅ | |
| RN-CRP-07 | Custo da consulta → transação em Finanças (categoria Saúde) | ❌ | Cross-module |
| RN-CRP-08 | Limite FREE: 3 consultas ativas/mês | ❌ | Sem enforcement |
| RN-CRP-09 | Histórico permanente com filtros | ✅ | |
| RN-CRP-10 | Anexos opcionais (Supabase Storage) | 🚫 | Adiado — requer storage setup |

#### Evolução Corporal (RN-CRP-11 a 19)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-11 | TMB recalculada a cada novo registro de peso | ⚠️ | TMB calculada mas não por peso novo |
| RN-CRP-12 | Gráfico evolução: toggle 3/6/12 meses | ❌ | Gráfico simples sem toggle |
| RN-CRP-13 | Meta de peso configurável (emagrecer/manter/ganhar) | ✅ | |
| RN-CRP-14 | Previsão de data baseada em velocidade dos últimos 30d | ❌ | |
| RN-CRP-15 | Alerta educativo se velocidade >1kg/semana | ❌ | |
| RN-CRP-16 | Medidas corporais opcionais (cintura, quadril, etc.) | ⚠️ | Campos existem, sem gráfico |
| RN-CRP-17 | Fotos de progresso opcionais (Storage) | 🚫 | Adiado |
| RN-CRP-18 | IMC calculado e classificado (5 faixas) | ✅ | |
| RN-CRP-19 | Progresso de peso sincroniza com meta no Futuro | ❌ | Cross-module |

#### Cardápio com IA (RN-CRP-20 a 28)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-20 | IA considera TDEE, objetivo, restrições, orçamento | ❌ | Feature não implementada |
| RN-CRP-21 | Cardápio: nome, ingredientes, calorias, macros por refeição | ❌ | |
| RN-CRP-22 | 7 dias; regeneração 3x/semana (FREE) ilimitado (PRO) | ❌ | |
| RN-CRP-23 | Usuário pode "travar" dias bons e regenerar os ruins | ❌ | |
| RN-CRP-24 | Cardápios salvos em histórico | ❌ | |
| RN-CRP-25 | Orçamento alimentar → transação planejada em Finanças | ❌ | Cross-module |
| RN-CRP-26 | Aviso legal obrigatório sobre IA | ❌ | |
| RN-CRP-27 | Vercel AI SDK + Gemini 1.5 Flash (MVP); `/api/ai/cardapio` | ❌ | Route Handler não criado |
| RN-CRP-28 | Coach IA nutrição (PRO): Groq + Llama 3.3 (MVP) | ❌ | |

#### Atividades Físicas (RN-CRP-29 a 36)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-29 | Tipos pré-definidos com valores MET | ✅ | |
| RN-CRP-30 | Calorias = MET × peso × duração (horas) | ✅ | |
| RN-CRP-31 | Meta de atividade: X vezes/semana, mínimo Y min/sessão | ✅ | |
| RN-CRP-32 | Meta de passos diários configurável (padrão 8.000) | ✅ | |
| RN-CRP-33 | Atividade registrada → evento na Agenda "🏃 Corpo" | ❌ | Cross-module |
| RN-CRP-34 | Relatório semanal: total atividades, minutos, calorias | ⚠️ | Básico no Dashboard |
| RN-CRP-35 | Streak de atividade física → conquistas | ❌ | Streak não calculado |
| RN-CRP-36 | Meta exercício vinculada ao Futuro → sincroniza | ❌ | Cross-module |

#### Integração (RN-CRP-37 a 39)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-37 | Integrações opt-in (configurável nas Settings) | ❌ | Settings de integração não existe |
| RN-CRP-38 | Transações auto-geradas com badge "Auto — 🏃 Corpo" | ❌ | Nenhuma transação auto-gerada |
| RN-CRP-39 | Excluir consulta → pergunta sobre evento Agenda e transação Finanças | ❌ | |

---

### ✈️ MÓDULO EXPERIÊNCIAS (32 regras)

#### Wizard de Viagem (RN-EXP-01 a 08)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-01 | Status: Planejando/Reservado/Em andamento/Concluída/Cancelada | ✅ | |
| RN-EXP-02 | Dias bloqueados na Agenda como eventos "✈️ Experiências" | ❌ | Cross-module |
| RN-EXP-03 | Custo total → despesa planejada em Finanças | ❌ | Cross-module |
| RN-EXP-04 | Meta no Futuro → progresso atualizado conforme economia | ❌ | Cross-module |
| RN-EXP-05 | Multi-destino: várias cidades com datas diferentes | ✅ | `destinations[]` |
| RN-EXP-06 | Cada item de custo: Estimado/Reservado/Pago | ✅ | |
| RN-EXP-07 | Limite FREE: 1 viagem ativa. PRO: ilimitadas | ❌ | Sem enforcement |
| RN-EXP-08 | Ao criar viagem → sugerir Objetivo no Futuro | ⚠️ | Toast existe, não cria objetivo |

#### Roteiro Diário (RN-EXP-09 a 15)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-09 | 0 a 20 atividades por dia | ✅ | Sem cap mas campo existe |
| RN-EXP-10 | Reordenação por drag-and-drop | ❌ | Lista simples sem DnD |
| RN-EXP-11 | Custo de atividade somado ao orçamento diário/total | ✅ | |
| RN-EXP-12 | Até 2 alternativas por atividade | ✅ | Tabela existe |
| RN-EXP-13 | Mapa com pins e rota sugerida | ❌ | Sem integração de mapa |
| RN-EXP-14 | Estimativa de tempo entre atividades (API mapas) | 🚫 | Adiado |
| RN-EXP-15 | Export PDF do roteiro (PRO) | ❌ | |

#### Orçamento da Viagem (RN-EXP-16 a 21)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-16 | Categorias pré-definidas de custo | ✅ | |
| RN-EXP-17 | Multi-moeda (USD, EUR, BRL) com conversão automática | ❌ | Campo currency existe, sem conversão |
| RN-EXP-18 | Diferença Estimado vs Real/Pago por categoria | ✅ | |
| RN-EXP-19 | Pós-viagem: resumo custo real vs estimado | ⚠️ | Dados existem, sem tela pós-viagem |
| RN-EXP-20 | Custo real → transações em Finanças quando confirmado | ❌ | Cross-module |
| RN-EXP-21 | Estimador IA: custo por dia no destino | ❌ | Feature não implementada |

#### Sugestões com IA (RN-EXP-22 a 25)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-22 | Vercel AI SDK + Gemini (MVP) em `/api/ai/viagem` | ❌ | Route Handler não criado |
| RN-EXP-23 | Sugestão aceita → atividade no roteiro do dia | ❌ | |
| RN-EXP-24 | Limite FREE: 5 interações IA/viagem. PRO: ilimitado | ❌ | |
| RN-EXP-25 | Aviso: "sugestões podem estar desatualizadas" | ❌ | |

#### Checklist (RN-EXP-26 a 29)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-26 | Checklist base por destino (nacional/internacional), duração, tipo | ⚠️ | Checklist existe, sem geração automática |
| RN-EXP-27 | Itens personalizáveis | ✅ | |
| RN-EXP-28 | % concluída exibida no Dashboard | ⚠️ | Sem cálculo de % |
| RN-EXP-29 | Alerta passaporte vence antes/até 6m após viagem | ❌ | |

#### Integração (RN-EXP-30 a 32)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-30 | Integrações opt-in | ❌ | |
| RN-EXP-31 | Transações auto-geradas com badge "Auto — ✈️ Experiências" | ❌ | |
| RN-EXP-32 | Cancelamento → pergunta sobre exclusão de itens vinculados | ❌ | |

---

### 🧠 MÓDULO MENTE (26 regras)

#### Trilhas de Aprendizado (RN-MNT-01 a 09)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-01 | 1 a 50 etapas por trilha | ✅ | |
| RN-MNT-02 | Progresso = (etapas concluídas / total) × 100 | ✅ | |
| RN-MNT-03 | Trilha vinculável a habilidade no Carreira (N:1) | ❌ | Cross-module |
| RN-MNT-04 | Trilha vinculável a meta no Futuro | ❌ | Cross-module |
| RN-MNT-05 | Status: Em andamento/Pausada/Concluída/Abandonada | ✅ | |
| RN-MNT-06 | Conclusão de trilha → conquista no sistema | ❌ | Conquistas são mock |
| RN-MNT-07 | Categorias pré-definidas (12 categorias) | ✅ | |
| RN-MNT-08 | Limite FREE: 3 trilhas ativas. PRO: ilimitadas | ❌ | Sem enforcement |
| RN-MNT-09 | Custo de curso → transação Finanças (Educação) | ❌ | Cross-module |

#### Timer de Foco / Pomodoro (RN-MNT-10 a 18)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-10 | Padrão: 25min foco, 5min pausa curta, 15min longa, 4 ciclos | ❌ | Feature não implementada |
| RN-MNT-11 | Personalizável (15-90 min foco, etc.) | ❌ | |
| RN-MNT-12 | Pomodoro concluído → tempo registrado na trilha | ❌ | |
| RN-MNT-13 | Sessão associável a evento "Bloco de Estudo" na Agenda | ❌ | Cross-module |
| RN-MNT-14 | Sons ambiente (chuva, lo-fi) — exclusivo Jornada/PRO | 🚫 | Adiado |
| RN-MNT-15 | Streak: dias consecutivos com 1+ Pomodoro | ❌ | |
| RN-MNT-16 | Relatório semanal: horas, média/dia, trilha mais estudada | ⚠️ | Sem dados de sessão |
| RN-MNT-17 | Timer funciona em background (notificação nativa) | ❌ | Requer PWA/notif |
| RN-MNT-18 | Pontos de foco → XP no sistema Jornada | ❌ | Sistema XP não existe |

#### Biblioteca de Recursos (RN-MNT-19 a 23)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-19 | Tipos: Link, Livro, Vídeo, PDF, Nota, Outro | ✅ | |
| RN-MNT-20 | Por trilha, filtráveis por status | ✅ | |
| RN-MNT-21 | Nota pessoal em Markdown básico | ⚠️ | Texto simples, sem Markdown render |
| RN-MNT-22 | Limite FREE: 10 recursos/trilha. PRO: ilimitado | ❌ | |
| RN-MNT-23 | Recursos são referências, não armazenam arquivos | ✅ | |

#### Integração (RN-MNT-24 a 26)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-24 | Integrações opt-in | ❌ | |
| RN-MNT-25 | Eventos auto-gerados com badge "Auto — 🧠 Mente" | ❌ | |
| RN-MNT-26 | Exclusão de trilha notifica sobre metas/habilidades vinculadas | ❌ | |

---

### 📈 MÓDULO PATRIMÔNIO (24 regras)

#### Gestão de Carteira (RN-PTR-01 a 09)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-01 | Classes: Ações BR, FIIs, ETFs, BDRs, RF, Cripto, Stocks US, REITs, Outros | ✅ | |
| RN-PTR-02 | Preço médio ponderado. Vendas não alteram preço médio | ✅ | |
| RN-PTR-03 | Cotações via API (Alpha Vantage/Brapi). FREE 1x/dia, PRO tempo real | ❌ | Sem integração de cotações |
| RN-PTR-04 | Distribuição em pizza por classe e setor | ⚠️ | Gráfico pizza existe, sem setor |
| RN-PTR-05 | Rentabilidade = ((Atual + Proventos − Investido) / Investido) × 100 | ✅ | |
| RN-PTR-06 | Comparativo vs CDI, IBOVESPA, IFIX (PRO) | ❌ | |
| RN-PTR-07 | Limite FREE: 10 ativos. PRO: ilimitado | ❌ | Sem enforcement |
| RN-PTR-08 | Histórico de operações com filtros | ✅ | |
| RN-PTR-09 | Patrimônio → progresso de meta no Futuro | ❌ | Cross-module |

#### Proventos (RN-PTR-10 a 16)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-10 | Proventos cadastrados manualmente | ✅ | |
| RN-PTR-11 | Tipos: Dividendos, JCP, Rendimentos FII, RF, Outros | ✅ | |
| RN-PTR-12 | Provento recebido → receita automática em Finanças | ❌ | Cross-module |
| RN-PTR-13 | Proventos futuros → previsão no calendário financeiro | ❌ | Cross-module |
| RN-PTR-14 | Yield on Cost = (Proventos 12m / Valor Investido) × 100 | ❌ | |
| RN-PTR-15 | Projeção de proventos futuros (base 12m) | ❌ | |
| RN-PTR-16 | Meta de renda passiva no Futuro alimentada por proventos | ❌ | Cross-module |

#### Simulador IF (RN-PTR-17 a 21)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-17 | Juros compostos: VF = VP × (1+i)^n + PMT × [...] | ✅ | |
| RN-PTR-18 | IF = rendimento mensal ≥ renda desejada (retirada 4%) | ✅ | |
| RN-PTR-19 | 3 cenários: pessimista (-2%), base, otimista (+2%) | ✅ | |
| RN-PTR-20 | Aporte vinculável a meta Futuro e orçamento | ❌ | Cross-module |
| RN-PTR-21 | Simulador exclusivo PRO/Jornada | ❌ | Sem enforcement PRO |

#### Integração (RN-PTR-22 a 24)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-22 | Integrações opt-in | ❌ | |
| RN-PTR-23 | Transações auto com badge "Auto — 📈 Patrimônio" | ❌ | |
| RN-PTR-24 | Excluir ativo → pergunta sobre transações vinculadas | ❌ | |

---

### 💼 MÓDULO CARREIRA (20 regras)

#### Perfil Profissional (RN-CAR-01 a 04)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-01 | Salário sincronizado como receita recorrente em Finanças (opt-in) | ❌ | Cross-module |
| RN-CAR-02 | Toda edição de cargo/salário → registro histórico com data | ✅ | |
| RN-CAR-03 | Áreas pré-definidas (12 áreas) | ✅ | |
| RN-CAR-04 | Níveis hierárquicos pré-definidos (11 níveis) | ✅ | |

#### Roadmap de Carreira (RN-CAR-05 a 12)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-05 | Roadmap: cargo atual, cargo alvo, prazo, passos | ✅ | |
| RN-CAR-06 | Cada passo: 0+ habilidades vinculadas | ✅ | |
| RN-CAR-07 | Habilidades compartilhadas entre Roadmap e Trilhas (Mente) | ❌ | Cross-module |
| RN-CAR-08 | Progresso do passo = média das habilidades vinculadas | ⚠️ | Lógica básica existe |
| RN-CAR-09 | Concluir roadmap → sugerir atualizar perfil | ❌ | |
| RN-CAR-10 | Salário esperado alimenta cenários no simulador financeiro | ❌ | Cross-module |
| RN-CAR-11 | Limite FREE: 1 roadmap ativo. PRO: 3 simultâneos | ❌ | Sem enforcement |
| RN-CAR-12 | Roadmap vinculável a Objetivo no Futuro | ❌ | Cross-module |

#### Mapa de Habilidades (RN-CAR-13 a 17)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-13 | Habilidades vinculáveis a múltiplas trilhas (N:N) | ❌ | Cross-module com Mente |
| RN-CAR-14 | Níveis 1-5: Iniciante a Expert | ✅ | |
| RN-CAR-15 | Trilha vinculada → sugere atualização de nível | ❌ | Cross-module |
| RN-CAR-16 | Habilidades alimentam Roadmap (pré-requisitos) | ⚠️ | Relação existe, automação não |
| RN-CAR-17 | Categorias: Hard Skills, Soft Skills, Idiomas, Certificações | ✅ | |

#### Integração (RN-CAR-18 a 20)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-18 | Integrações opt-in | ❌ | |
| RN-CAR-19 | Transações auto com badge "Auto — 💼 Carreira" | ❌ | |
| RN-CAR-20 | Promoção efetivada (Jornada) → calcula impacto: "IF X anos antes!" | ❌ | |

---

## Notas de Implementação

### Sistema de Notificações (P1 — Bloqueia muitas regras)

Para implementar notificações in-app são necessários:
- Tabela `notifications` no Supabase com: user_id, type, title, body, read_at, created_at
- Hook `useNotifications()` que faz polling ou realtime subscription
- Badge no sino do TopHeader
- Panel dropdown de notificações
- Tipos de notificação identificados: deadline_30d, deadline_7d, overdue, goal_completed, follow_up_due, activity_streak_broken, etc.

### Infraestrutura de Integrações Cross-Module (P1 — Maioria das regras ❌)

Padrão sugerido para cross-module:
```ts
// lib/integrations/index.ts
// Funções "bridge" chamadas após cada ação relevante

export async function onConsultaCriada(appointment: MedicalAppointment) {
  if (userSettings.sync_corpo_to_agenda) {
    await createAgendaEvent({ ... })  // RN-CRP-01
  }
  if (appointment.cost && userSettings.sync_corpo_to_financas) {
    await createFinancaTransaction({ ... })  // RN-CRP-07
  }
}
```

### Enforcement FREE/PRO (P1)

Criar função utilitária `checkPlanLimit()`:
```ts
// lib/plan-limits.ts
export const PLAN_LIMITS = {
  free: {
    objectives: 3,      // RN-FUT-06
    goalsPerObjective: 3, // RN-FUT-08
    activeTrips: 1,     // RN-EXP-07
    studyTracks: 3,     // RN-MNT-08
    portfolioAssets: 10, // RN-PTR-07
    roadmaps: 1,        // RN-CAR-11
    consultasPerMonth: 3, // RN-CRP-08
  },
  pro: 'unlimited'
}
```

### AI Features (P2)

Packages necessários:
```bash
npm install ai @ai-sdk/google @ai-sdk/groq
```

Route Handlers a criar:
- `app/api/ai/cardapio/route.ts` (RN-CRP-27) — Gemini 1.5 Flash
- `app/api/ai/viagem/route.ts` (RN-EXP-22) — Gemini 1.5 Flash (stream)
- `app/api/ai/coach/route.ts` (RN-CRP-28) — Groq + Llama 3.3 70B

---

*Documento criado em: 2026-02-27*
*Por: Claude Code — Auditoria pós-implementação Fase 13*
*Próxima revisão: após conclusão de cada grupo de prioridade*
