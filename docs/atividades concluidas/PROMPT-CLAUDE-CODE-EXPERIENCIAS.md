# ✈️ PROMPT — Implementação do Módulo Experiências no Claude Code

> **SyncLife — Módulo Experiências**  
> **Versão:** 1.0  
> **Data:** Março 2026  
> **Cor:** `#ec4899` (Pink) — **NÃO usar #06b6d4 nem #14b8a6**  
> **Ícone Lucide:** `Plane`  
> **Rota base:** `/experiencias`

---

## INSTRUÇÃO INICIAL — LEIA ANTES DE CODIFICAR

Antes de escrever QUALQUER código, leia os seguintes documentos na íntegra:

1. **`SPEC-FUNCIONAL-EXPERIENCIAS.md`** — Especificação funcional completa (18 seções)
2. **`proto-mobile-experiencias-v3.html`** — Protótipo visual com 14 telas (abra no browser)
3. **`CLAUDE.md`** — Guia de desenvolvimento do projeto (se existir no repo)
4. **`web/src/lib/modules.ts`** — Confirmar cor `#ec4899` para Experiências

Após ler, responda com: "Li os 3 documentos. A cor é #ec4899, o ícone é Plane, a rota é /experiencias. Pronto para começar Fase 1."

---

## CONTEXTO DO MÓDULO

| Propriedade | Valor |
|-------------|-------|
| Nome | Experiências |
| Cor hex | `#ec4899` |
| Cor glow | `rgba(236,72,153,0.14)` |
| Cor gradient | `linear-gradient(135deg, #ec4899, #f472b6)` |
| Ícone Lucide | `Plane` |
| Rota | `/experiencias` |
| Sub-rotas | `/experiencias/viagens`, `/experiencias/passaporte`, `/experiencias/memorias`, `/experiencias/bucket-list` |
| Tabelas DB | `trips`, `trip_memories`, `bucket_list_items`, `passport_badges` |
| Entidade principal | Viagem (trip) |
| Integrações | Finanças (envelope), Futuro (objective_goal), Tempo (calendar_event) |

---

## FASE 1: INFRAESTRUTURA E NAVEGAÇÃO
**Objetivo:** Criar a estrutura base do módulo com navegação funcional.  
**Referência visual:** Protótipo telas 01-05 (headers e tabs)  
**Referência funcional:** Spec seções 3, 4

### Atividades:

1.1. Criar pasta `web/src/app/(app)/experiencias/` com layout.tsx  
1.2. Criar page.tsx (dashboard) com sub-nav de 5 tabs (underline, NÃO pills)  
1.3. Criar sub-páginas: `viagens/page.tsx`, `passaporte/page.tsx`, `memorias/page.tsx`, `bucket-list/page.tsx`  
1.4. Configurar navegação com tabs underline usando cor `#ec4899`  
1.5. Registrar módulo em `modules.ts` se ainda não existir (confirmar cor)  
1.6. Modo Jornada: tabs renomeiam para Dashboard|Missões|Passaporte|Diário|Aventuras  

### Validação Fase 1:
- [ ] Navegação entre 5 tabs funcional
- [ ] Tab ativa tem underline `#ec4899` (NÃO pill)
- [ ] Header mostra ícone Plane + "Experiências" + badge
- [ ] Jornada: título muda para "Explorador Nível X" e tabs renomeiam
- [ ] Mobile 375px: tabs cabem sem scroll horizontal
- **Regras:** RN-EXP-19 (XP só Jornada), RN-EXP-25 (integrações opt-in)

---

## FASE 2: MODELO DE DADOS E MIGRATION
**Objetivo:** Criar tabelas no Supabase e tipos TypeScript.  
**Referência funcional:** Spec seção 16

### Atividades:

2.1. Criar migration SQL com tabelas: `trips`, `trip_memories`, `bucket_list_items`, `passport_badges`  
2.2. Criar índices conforme spec seção 16.2  
2.3. Gerar tipos TypeScript a partir do schema  
2.4. Criar hooks: `useTrips()`, `useTripMemories()`, `useBucketList()`, `usePassportBadges()`  
2.5. Configurar RLS (Row Level Security) — cada usuário vê apenas seus dados  

### Validação Fase 2:
- [ ] Migration roda sem erros
- [ ] RLS ativo: usuário A não vê dados do usuário B
- [ ] Tipos TypeScript gerados e importáveis
- [ ] Hooks retornam dados mockados corretamente
- **Regras:** RN-EXP-08 (bandeira automática), RN-EXP-24 (destino único)

---

## FASE 3: DASHBOARD
**Objetivo:** Implementar tela Dashboard com KPIs, próxima viagem, recentes e ações rápidas.  
**Referência visual:** Protótipo tela 01 (Foco) e 01J (Jornada)  
**Referência funcional:** Spec seção 5

### Atividades:

3.1. Componente KpiStrip (4 cards: viagens, países, continentes, média memórias)  
3.2. Componente AiCard (dica contextual — placeholder estático por enquanto)  
3.3. Componente TripFeatured (hero com progresso de orçamento)  
3.4. Componente RecentTrips (lista 3 últimas viagens com status)  
3.5. Componente QuickActions (grid 2×2 com 4 botões)  
3.6. Empty state quando não há viagens  
3.7. Modo Jornada: labels diferenciados conforme spec seção 14  

### Validação Fase 3:
- [ ] KPIs calculados corretamente (países = DISTINCT country de completed)
- [ ] Trip featured mostra viagem mais próxima por data
- [ ] Se sem viagens, mostra empty state (tela 11)
- [ ] Quick actions navegam corretamente
- [ ] Jornada: "Missões" em vez de "Viagens", "+50 XP" nos badges
- **Regras:** RN-EXP-16 (passaporte conta apenas completed), RN-EXP-23 (1 ativa por vez)

---

## FASE 4: CRUD DE VIAGENS
**Objetivo:** Implementar listagem, criação, detalhe e edição de viagens.  
**Referência visual:** Protótipo telas 02, 06, 07  
**Referência funcional:** Spec seções 6, 10.1

### Atividades:

4.1. Tela Viagens (lista): filtros por status + cards com border-left colorido  
4.2. Criar Viagem (wizard): formulário com campos + toggles de integração  
4.3. Detalhe da Viagem: hero + orçamento + checklist + ações de status  
4.4. Editar Viagem: modal/tela com campos editáveis  
4.5. Mudar status: planning → active → completed (com confirmações)  
4.6. Excluir viagem: soft delete com preservação de envelope e memória  
4.7. Badge "📸 Memória pendente" em viagens concluídas sem memória  
4.8. Limite FREE: máximo 5 viagens ativas → UpgradeModal  

### Validação Fase 4:
- [ ] Criar viagem com todos os campos funcional
- [ ] Filtros de status atualizam lista corretamente
- [ ] Mudar status planning→active→completed funcional
- [ ] Badge "Memória pendente" aparece quando aplicável
- [ ] FREE: bloqueio em 5 viagens ativas com UpgradeModal
- [ ] Soft delete preserva envelope e memória
- **Regras:** RN-EXP-01 a RN-EXP-06, RN-EXP-09, RN-EXP-10, RN-EXP-11, RN-EXP-13, RN-EXP-23, RN-EXP-24

---

## FASE 5: PASSAPORTE DO EXPLORADOR
**Objetivo:** Mapa-múndi com países visitados, progresso por continente, badges.  
**Referência visual:** Protótipo tela 03  
**Referência funcional:** Spec seção 7

### Atividades:

5.1. Componente PassportStats (países, continentes, % mundo)  
5.2. Componente WorldMap (SVG com estados visuais por país)  
5.3. Componente ContinentProgress (barras de progresso por continente)  
5.4. Componente BadgeGrid (badges conquistados e bloqueados)  
5.5. Componente CountryList (lista de países visitados com contagem)  
5.6. Lógica de cálculo de badges automáticos  
5.7. Jornada: XP por badge, labels diferenciados  

### Validação Fase 5:
- [ ] Mapa SVG renderiza sem scroll horizontal em 375px
- [ ] Países visitados coloridos corretamente (opacity 0.35 com #ec4899)
- [ ] % do mundo calcula sobre 195 países
- [ ] Badges desbloqueiam automaticamente (ex: 5 países SA = Explorador SA)
- [ ] Jornada: XP visível em badges e países
- **Regras:** RN-EXP-16, RN-EXP-17, RN-EXP-19

---

## FASE 6: MEMÓRIAS / DIÁRIO
**Objetivo:** Registro emocional de viagens com rating, campos, tags e orçado vs real.  
**Referência visual:** Protótipo telas 04, 09  
**Referência funcional:** Spec seções 8, 10.2

### Atividades:

6.1. Tela Memórias (lista): stats + highlights + viagens concluídas  
6.2. Componente Highlights (top 3 automáticos: comida, beleza, aprendizado)  
6.3. Memória Detalhe: hero + rating + 4 campos texto + tags emoções + orçado vs real  
6.4. Criar memória: validação (rating obrigatório, 1 campo texto, 1 tag)  
6.5. Editar memória  
6.6. Orçado vs Real: puxar dados do envelope vinculado em Finanças  
6.7. Jornada: labels diferenciados ("Momento épico", "Diário do Explorador")  

### Validação Fase 6:
- [ ] Highlights calculados automaticamente
- [ ] Rating interativo funcional (1-5 estrelas)
- [ ] Tags emoções multi-select funcional
- [ ] Orçado vs Real mostra dados reais se envelope vinculado
- [ ] Se não há envelope, seção não aparece
- [ ] Viagens sem memória mostram "Registrar"
- **Regras:** RN-EXP-12, RN-EXP-18, RN-EXP-22

---

## FASE 7: BUCKET LIST E INTEGRAÇÕES
**Objetivo:** Wishlist de destinos + integrações cross-módulo + celebração.  
**Referência visual:** Protótipo telas 05, 10, 12  
**Referência funcional:** Spec seções 9, 10.3, 11

### Atividades:

7.1. Tela Bucket List: mapa mini + filtros + cards de destino  
7.2. Adicionar Destino: formulário com prioridade, orçamento, motivação  
7.3. "Transformar em Viagem": pré-preenche Criar Viagem com dados do destino  
7.4. Integração Finanças: criar envelope ao criar viagem (se toggle ativo)  
7.5. Integração Tempo: criar calendar_event com datas da viagem (se toggle ativo)  
7.6. Integração Futuro: vincular a objective_goal (se toggle ativo)  
7.7. Celebração: modal de viagem concluída (confete Foco / XP+badge Jornada)  
7.8. Limite FREE: 10 destinos bucket list → UpgradeModal  

### Validação Fase 7:
- [ ] "Transformar em Viagem" pré-preenche formulário
- [ ] Trip completed → bucket item status = 'visited' automaticamente
- [ ] Integração Finanças: envelope criado com meta correta
- [ ] Integração Tempo: evento no calendário criado
- [ ] Celebração aparece ao completar viagem
- [ ] FREE: bloqueio em 10 destinos com UpgradeModal
- **Regras:** RN-EXP-01 a RN-EXP-03, RN-EXP-07, RN-EXP-14, RN-EXP-15, RN-EXP-20, RN-EXP-25

---

## FASE 8: TESTES E2E PLAYWRIGHT
**Objetivo:** 50 testes automatizados cobrindo todos os fluxos.

### Grupo 1: Navegação (5 testes)
```
T-EXP-01: Navegar para /experiencias carrega Dashboard
T-EXP-02: Tabs underline navegam corretamente (5 tabs)
T-EXP-03: Tab ativa tem underline cor #ec4899
T-EXP-04: Jornada: tabs renomeiam (Missões, Diário, Aventuras)
T-EXP-05: Mobile 375px: tabs cabem sem scroll horizontal
```

### Grupo 2: Dashboard (6 testes)
```
T-EXP-06: KPIs carregam com dados corretos
T-EXP-07: Trip featured mostra viagem mais próxima
T-EXP-08: Recentes mostra últimas 3 viagens
T-EXP-09: Quick actions navegam corretamente
T-EXP-10: Empty state aparece sem viagens
T-EXP-11: Jornada: labels diferenciados visíveis
```

### Grupo 3: CRUD Viagens (12 testes)
```
T-EXP-12: Criar viagem com todos os campos
T-EXP-13: Criar viagem com bandeira automática por país
T-EXP-14: Listar viagens com filtro "Todas"
T-EXP-15: Filtrar viagens por status "Planejando"
T-EXP-16: Filtrar viagens por status "Concluídas"
T-EXP-17: Abrir detalhe da viagem
T-EXP-18: Mudar status planning → active
T-EXP-19: Mudar status active → completed
T-EXP-20: Badge "Memória pendente" em viagem concluída sem memória
T-EXP-21: Editar viagem (alterar orçamento)
T-EXP-22: Excluir viagem (soft delete)
T-EXP-23: FREE: bloqueio em 5 viagens ativas
```

### Grupo 4: Passaporte (8 testes)
```
T-EXP-24: Stats mostram países/continentes/% mundo corretos
T-EXP-25: Mapa SVG renderiza sem scroll horizontal
T-EXP-26: Países visitados coloridos no mapa
T-EXP-27: Continentes com progresso correto
T-EXP-28: Badge "Explorador SA" desbloqueia com 5 países SA
T-EXP-29: Badge bloqueado mostra 🔒
T-EXP-30: Lista de países ordenada por viagens
T-EXP-31: Jornada: XP visível em badges
```

### Grupo 5: Memórias (8 testes)
```
T-EXP-32: Stats mostram registradas/pendentes/média
T-EXP-33: Highlights calculam top 3 automaticamente
T-EXP-34: Criar memória com rating + campo texto + tag
T-EXP-35: Validação: sem rating não salva
T-EXP-36: Tags emoções multi-select funcional
T-EXP-37: Orçado vs Real aparece com envelope vinculado
T-EXP-38: Orçado vs Real não aparece sem envelope
T-EXP-39: Editar memória altera dados
```

### Grupo 6: Bucket List (6 testes)
```
T-EXP-40: Adicionar destino à bucket list
T-EXP-41: Filtrar destinos (Todos/Visitados/Pendentes)
T-EXP-42: "Transformar em Viagem" pré-preenche formulário
T-EXP-43: Trip completed → bucket item = visited
T-EXP-44: FREE: bloqueio em 10 destinos
T-EXP-45: Custo total calcula soma dos orçamentos
```

### Grupo 7: Integrações (5 testes)
```
T-EXP-46: Criar viagem com toggle Finanças → envelope criado
T-EXP-47: Criar viagem com toggle Tempo → evento criado
T-EXP-48: Toggle desativado → integração não dispara
T-EXP-49: Excluir viagem → envelope preservado (desvinculado)
T-EXP-50: Celebração aparece ao completar viagem
```

---

## 10 REGRAS ABSOLUTAS

1. **Cor EXATA:** `#ec4899` — NÃO usar #06b6d4, #14b8a6 ou qualquer outra cor
2. **Tabs UNDERLINE:** Nunca usar pills para navegação do módulo
3. **Mobile-first:** Testar SEMPRE em 375px antes de desktop
4. **Modo Jornada:** Classe `.jornada-only` para elementos exclusivos, NUNCA alterar layout
5. **Testes antes de avançar:** Todos os testes da fase devem passar antes da próxima
6. **Integrações opt-in:** SEMPRE verificar toggle em Configurações antes de criar entidade em outro módulo
7. **Soft delete:** Excluir viagem = `status = 'deleted'`, NUNCA DELETE real
8. **Bandeira automática:** País → ISO 3166-1 → emoji flag (não hardcoded)
9. **FREE vs PRO:** Verificar limites ANTES da ação (não depois)
10. **Dados reais:** Orçado vs Real deve puxar de Finanças, não de dados mockados

---

## ORDEM DE EXECUÇÃO (Grafo de Dependências)

```
Fase 1 (Navegação)
    └──→ Fase 2 (Schema/DB)
              └──→ Fase 3 (Dashboard)
              └──→ Fase 4 (CRUD Viagens)
                        └──→ Fase 5 (Passaporte)
                        └──→ Fase 6 (Memórias)
                                  └──→ Fase 7 (Bucket List + Integrações)
                                            └──→ Fase 8 (Testes E2E)
```

**Fases 5 e 6 podem rodar em paralelo** após Fase 4 concluída.

---

## CHECKLIST DE CONCLUSÃO

- [ ] Todas as 8 fases implementadas
- [ ] 50 testes Playwright passando
- [ ] Cor `#ec4899` em TODOS os componentes (zero resquícios de #06b6d4)
- [ ] Navegação com underline tabs (zero pills)
- [ ] Mobile 375px sem scroll horizontal em nenhuma tela
- [ ] Modo Foco funcional
- [ ] Modo Jornada funcional (labels + XP + badges)
- [ ] FREE vs PRO: limites de 5 viagens e 10 bucket list respeitados
- [ ] Integrações com Finanças, Tempo e Futuro funcionando
- [ ] Empty states para todas as telas sem dados
- [ ] Celebração ao completar viagem
- [ ] Protótipo visual conferido: cada tela implementada deve corresponder ao protótipo

---

## FLUXO DE APROVAÇÃO

Após cada fase:
1. Claude Code reporta o que implementou
2. Lista testes que passaram/falharam
3. Mostra screenshot ou descreve o visual
4. **Aguarda aprovação** antes de avançar
5. Só avança para próxima fase após "OK" explícito

---

*Prompt criado em: Março 2026*  
*Módulo: Experiências*  
*Baseado em: SPEC-FUNCIONAL-EXPERIENCIAS.md + proto-mobile-experiencias-v3.html*
