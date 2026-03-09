# ⚙️ Prompt para Claude Code — Módulo Configurações

**Data:** 07/03/2026
**Módulo:** Configurações
**Cor:** `#64748b` (Slate)
**Ícone Lucide:** `Settings`

---

## INSTRUÇÃO INICIAL

Antes de codificar QUALQUER coisa, leia ESTES 3 documentos na íntegra:

1. `SPEC-FUNCIONAL-CONFIGURACOES.md` — Especificação funcional completa
2. `proto-mobile-configuracoes-v3.html` — Protótipo HTML com 12 telas de referência
3. `CLAUDE.md` — Regras globais do projeto SyncLife

Após ler os 3 documentos, confirme que entendeu:
- A cor do módulo é `#64748b` (Slate), glow `rgba(100,116,139,0.14)`
- A navegação usa UNDERLINE TABS (não pills) no mobile
- Configurações é uma tela TRANSVERSAL (não é módulo de negócio)
- Configurações fica no RODAPÉ da Module Bar, não no grupo principal
- As 7 seções são: Perfil, Aparência, Modo de Uso, Notificações, Categorias, Integrações, Plano

---

## CONTEXTO DO MÓDULO

### Rotas
```
/configuracoes              → Perfil (default)
/configuracoes/aparencia    → Aparência
/configuracoes/modo         → Modo de Uso
/configuracoes/notificacoes → Notificações
/configuracoes/categorias   → Categorias
/configuracoes/integracoes  → Integrações
/configuracoes/plano        → Meu Plano
```

### Tabelas Supabase
```
profiles        → Campos de configuração (mode, theme, currency, notif_*, plan, etc.)
categories      → Categorias personalizadas (id, user_id, name, type, icon, color, is_system)
integrations    → Integrações externas futuras (id, user_id, type, status, tokens)
integration_toggles → Toggles cross-módulo (id, user_id, integration_key, enabled)
```

### Cor e tokens
```css
--cfg: #64748b;
--cfg-glow: rgba(100,116,139,0.14);
```

### Dependências
```
configuracoes/
├── DEPENDE de:
│   ├── Shell de navegação (Module Bar, Sidebar, Top Header)
│   ├── ModeProvider (Zustand store para modo foco/jornada)
│   ├── ThemeProvider (Zustand store para tema)
│   ├── Supabase (profiles, categories, integration_toggles)
│   ├── Supabase Storage (bucket avatars)
│   └── ConfirmDialog (componente global)
└── É DEPENDÊNCIA para:
    ├── TODOS os módulos (mode, theme, currency, plan)
    ├── Finanças (categories, month_start_day, compact_numbers)
    └── Feature gates PRO (plan)
```

---

## 8 FASES DE IMPLEMENTAÇÃO

### FASE 1: Layout e Navegação Interna (4h)
**Dependências:** Shell implementado

**Atividades:**
1.1. Verificar que `/app/(app)/configuracoes/layout.tsx` existe e funciona
1.2. Verificar que cfg-menu lateral (200px) exibe 7 seções em 3 grupos (Conta, Preferências, Plano)
1.3. Implementar navegação por rotas (Link para cada seção)
1.4. Item ativo: `bg-[rgba(16,185,129,0.10)] text-[#10b981] font-semibold`
1.5. Badge "Free"/"Pro" no item Meu Plano (dinâmico conforme `profiles.plan`)
1.6. Responsividade: cfg-menu hidden em `< lg`; navegação via underline tabs no mobile
1.7. Implementar underline tabs (sub-nav) no mobile com scroll horizontal + fade indicator

**Validação Fase 1:**
- [ ] Desktop: cfg-menu visível à esquerda, conteúdo à direita
- [ ] Mobile: cfg-menu oculto, underline tabs no topo com scroll horizontal
- [ ] Clicar em item navega para a rota correta
- [ ] Item ativo tem destaque visual correto

---

### FASE 2: Seção Perfil (4h)
**Dependências:** Supabase profiles, Storage (avatars)

**Atividades:**
2.1. Card Identidade: avatar com fallback de iniciais + upload
2.2. Campo nome editável com dirty state (botão "Salvar" aparece/desaparece)
2.3. Campo e-mail somente leitura com nota explicativa
2.4. Data "Membro desde" calculada de `created_at`
2.5. Card Preferências Regionais: selects para moeda, fuso, dia de início
2.6. Moeda: `BRL`, `USD`, `EUR`, `GBP` — ConfirmDialog ao trocar
2.7. Fuso: auto-detect com `Intl.DateTimeFormat().resolvedOptions().timeZone`
2.8. Dia do mês: select 1-28
2.9. Card Segurança: botão "Alterar senha" (modal) + toggle 2FA (PRO gate)
2.10. Card Zona de Perigo: exportar JSON + excluir conta (confirmação dupla)
2.11. Todos os campos persistem via `updateProfile()` com debounce 800ms

**Validação Fase 2:**
- [ ] Avatar exibe iniciais quando sem foto
- [ ] Upload de avatar funciona (JPG/PNG, max 2MB)
- [ ] Nome: dirty state ativa botão "Salvar"
- [ ] Moeda: ConfirmDialog aparece ao trocar
- [ ] Excluir conta: botão disabled até digitar "EXCLUIR"
- [ ] Exportar: download de JSON com dados do usuário

---

### FASE 3: Seção Aparência (3h)
**Dependências:** ThemeProvider (Zustand)

**Atividades:**
3.1. Toggle "Automático" que segue `prefers-color-scheme`
3.2. Grid de 3 temas gratuitos com mini-preview e checkmark no ativo
3.3. Grid de 6 temas PRO com lock icon e badge PRO
3.4. Clicar em tema PRO (FREE) → UpgradeModal
3.5. Mudança de tema instantânea via CSS custom properties
3.6. Persistência dual: localStorage + Supabase
3.7. Toggles de interface: sidebar expandida, animações reduzidas, números compactos
3.8. `reduced_motion` adiciona classe ao body
3.9. `compact_numbers` afeta formatação global via utility function

**Validação Fase 3:**
- [ ] Tema ativo tem borda esmeralda + checkmark
- [ ] Tema PRO bloqueado para FREE (lock + UpgradeModal)
- [ ] Mudança de tema sem reload
- [ ] Automático: detecta tema do OS
- [ ] Toggles persistem imediatamente

---

### FASE 4: Seção Modo de Uso (2h)
**Dependências:** ModeProvider (Zustand)

**Atividades:**
4.1. Mode-cards: Foco (FREE) e Jornada (PRO) com seleção visual
4.2. Card ativo: borda esmeralda + checkmark
4.3. Jornada para FREE → UpgradeModal
4.4. Toast de confirmação (3500ms) após mudança de modo
4.5. Tabela comparativa Foco vs Jornada (grid 3 colunas)
4.6. Card "Reconfigurar": ConfirmDialog → redirect `/onboarding?reconfigure=true`
4.7. Sincronizar com ModeProvider global

**Validação Fase 4:**
- [ ] Modo corrente selecionado ao montar
- [ ] Toast aparece e desaparece em 3500ms
- [ ] Jornada bloqueado para FREE
- [ ] Reconfigurar redireciona para onboarding

---

### FASE 5: Seção Notificações (2h)
**Dependências:** Perfil com campos notif_* no schema

**Atividades:**
5.1. Card Canal: toggles push + e-mail
5.2. Push: `Notification.requestPermission()` ao ativar
5.3. Card Alertas Financeiros: 4 toggles com badges [Foco] [Jornada]
5.4. Card Metas: 2 toggles
5.5. Card Exclusivos Jornada: nota de indisponibilidade em Foco + 4 toggles em Jornada
5.6. Seletor de horário para lembrete diário (incrementos de 30min)
5.7. Optimistic update em todos os toggles

**Validação Fase 5:**
- [ ] Push: solicita permissão, reverte se negada
- [ ] Toggles refletem valores do Supabase
- [ ] Card Jornada mostra nota em Modo Foco
- [ ] Seletor de horário funcional

---

### FASE 6: Seção Categorias (3h)
**Dependências:** Tabela categories com seed de categorias padrão

**Atividades:**
6.1. Header com botão "+ Nova categoria"
6.2. Toggle Despesas/Receitas (filter pills)
6.3. Grid de categorias: ícone + nome + badge "Padrão"
6.4. Modal "Nova Categoria": tipo, nome, emoji picker, color picker
6.5. Modal "Editar Categoria": mesmos campos preenchidos + botão excluir
6.6. Excluir: confirmação com aviso de reclassificação → "Outros"
6.7. Categorias padrão: apenas ícone e cor editáveis
6.8. FREE: limite de 10 categorias personalizadas por tipo

**Validação Fase 6:**
- [ ] Grid exibe categorias padrão + personalizadas
- [ ] Toggle Despesas/Receitas filtra corretamente
- [ ] Criar categoria aparece no grid imediatamente
- [ ] Excluir mostra confirmação com contagem de transações afetadas
- [ ] FREE: bloqueio ao atingir limite

---

### FASE 7: Seção Integrações (3h)
**Dependências:** Tabela integration_toggles

**Atividades:**
7.1. Lista de integrações cross-módulo agrupadas por módulo de origem
7.2. Toggle independente por integração
7.3. Descrição clara em cada toggle
7.4. Toggles desativados por padrão (opt-in)
7.5. Dados gerados carregam tag "Auto —"
7.6. Cards de integrações externas (Google Calendar, Open Finance) com estado "Em breve" / PRO lock
7.7. Persistência dos toggles em integration_toggles

**Validação Fase 7:**
- [ ] Toggles agrupados por módulo com ícone e cor
- [ ] Ativar/desativar persiste no banco
- [ ] Integrações externas mostram lock para FREE
- [ ] Descrições claras e legíveis

---

### FASE 8: Seção Meu Plano + UpgradeModal (3h)
**Dependências:** Edge function get_user_usage, gateway de pagamento

**Atividades:**
8.1. Card FREE: badge "Plano atual" se FREE
8.2. Card PRO: R$ 29,90/mês, botão "Fazer upgrade"
8.3. Progress bars de uso com animação (600ms ease-out)
8.4. Cores por threshold: verde < 50%, amarelo 50-75%, vermelho > 75%
8.5. Edge function `get_user_usage()` que calcula contagens
8.6. UpgradeModal reutilizável (usado em TODA a aplicação)
8.7. Features: trial 7 dias, opções mensal/anual
8.8. Botão upgrade → checkout modal (Stripe/Hotmart placeholder)

**Validação Fase 8:**
- [ ] Progress bars animam ao montar
- [ ] Cores mudam conforme threshold
- [ ] UpgradeModal abre de qualquer feature PRO bloqueada
- [ ] Card do plano ativo tem borda esmeralda

---

## TESTES PLAYWRIGHT (48 testes em 8 grupos)

### Grupo 1: Navegação (6 testes)
```
cfg-nav-01: Acessar /configuracoes exibe seção Perfil
cfg-nav-02: cfg-menu exibe 7 seções em 3 grupos
cfg-nav-03: Clicar "Aparência" navega para /configuracoes/aparencia
cfg-nav-04: Item ativo tem destaque visual correto
cfg-nav-05: Badge "Free" aparece no item Meu Plano (usuário FREE)
cfg-nav-06: Mobile: underline tabs visíveis, cfg-menu oculto
```

### Grupo 2: Perfil (8 testes)
```
cfg-perfil-01: Avatar exibe iniciais quando sem foto
cfg-perfil-02: Upload de avatar (JPG, < 2MB) atualiza exibição
cfg-perfil-03: Editar nome ativa botão "Salvar"
cfg-perfil-04: Salvar nome com sucesso esconde botão
cfg-perfil-05: E-mail não é editável
cfg-perfil-06: Moeda: select muda formatação global
cfg-perfil-07: Excluir conta: botão disabled até digitar "EXCLUIR"
cfg-perfil-08: Exportar dados: gera download JSON
```

### Grupo 3: Aparência (6 testes)
```
cfg-aparencia-01: Navy Dark selecionado por padrão
cfg-aparencia-02: Clicar Clean Light aplica tema sem reload
cfg-aparencia-03: Tema PRO (FREE) exibe UpgradeModal
cfg-aparencia-04: Toggle "Automático" detecta prefers-color-scheme
cfg-aparencia-05: Toggle "Números compactos" formata R$ 1,2K
cfg-aparencia-06: Toggle "Animações reduzidas" adiciona classe ao body
```

### Grupo 4: Modo de Uso (6 testes)
```
cfg-modo-01: Card Foco selecionado quando modo = foco
cfg-modo-02: Card Jornada (PRO) bloqueado para FREE
cfg-modo-03: Mudar para Foco exibe toast por 3500ms
cfg-modo-04: Tabela comparativa renderiza 6 linhas
cfg-modo-05: Reconfigurar exibe ConfirmDialog
cfg-modo-06: Confirmar reconfigurar redireciona para /onboarding
```

### Grupo 5: Notificações (6 testes)
```
cfg-notif-01: Toggles refletem valores do Supabase
cfg-notif-02: Push: solicita permissão do browser
cfg-notif-03: Alternar toggle persiste imediatamente
cfg-notif-04: Card Jornada: nota de indisponibilidade em Foco
cfg-notif-05: Seletor de horário salva valor correto
cfg-notif-06: E-mail toggle ativa/desativa resumo semanal
```

### Grupo 6: Categorias (6 testes)
```
cfg-cat-01: Grid exibe categorias padrão
cfg-cat-02: Toggle Despesas/Receitas filtra lista
cfg-cat-03: Criar categoria aparece no grid
cfg-cat-04: Categorias padrão não podem ser excluídas
cfg-cat-05: Excluir categoria reclassifica transações
cfg-cat-06: FREE: limite de 10 categorias por tipo
```

### Grupo 7: Integrações (5 testes)
```
cfg-intg-01: Lista agrupada por módulo de origem
cfg-intg-02: Toggles desativados por padrão
cfg-intg-03: Ativar toggle persiste no banco
cfg-intg-04: Integrações externas PRO bloqueadas para FREE
cfg-intg-05: Descrições legíveis em cada toggle
```

### Grupo 8: Meu Plano + UpgradeModal (5 testes)
```
cfg-plano-01: Card FREE com badge "Plano atual"
cfg-plano-02: Progress bars animam de 0 ao valor real
cfg-plano-03: Cores: verde < 50%, amarelo 50-75%, vermelho > 75%
cfg-plano-04: Botão upgrade abre checkout modal
cfg-plano-05: UpgradeModal exibe trial 7 dias + opções mensal/anual
```

---

## VALIDAÇÃO VISUAL

Após cada fase, abrir o protótipo `proto-mobile-configuracoes-v3.html` no browser e comparar:

1. **Tela A1 (Perfil):** Cards de identidade, preferências regionais, segurança, zona de perigo
2. **Tela A2 (Aparência):** Grid de 9 temas com lock nos PRO
3. **Tela A3 (Modo de Uso):** Mode-cards com tags e tabela comparativa
4. **Tela A4 (Notificações):** Toggles com badges [Foco] [Jornada]
5. **Tela A5 (Categorias):** Grid 2 colunas com ícones e badges "Padrão"
6. **Tela A6 (Integrações):** Toggles agrupados por módulo
7. **Tela A7 (Meu Plano):** Cards FREE/PRO + barras de uso

---

## 10 REGRAS ABSOLUTAS

1. **COR DO MÓDULO = `#64748b`** — verificar modules.ts, NÃO hardcodar outra cor
2. **Underline tabs no mobile** — NÃO usar pills para navegação entre seções
3. **Tema ≠ Modo** — São eixos INDEPENDENTES. Nunca acoplar
4. **Integrações são opt-in** — TODOS os toggles começam desativados
5. **LGPD obrigatória** — Exportar dados e excluir conta devem funcionar
6. **Confirmação dupla para exclusão** — Digitar "EXCLUIR" é obrigatório
7. **Persistência dual** — localStorage (instantâneo) + Supabase (durável) para tema e modo
8. **PRO gates claros** — UpgradeModal, não erro silencioso
9. **Tokens CSS, não hardcode** — Usar `var(--sl-*)` para todas as cores
10. **Mobile-first** — Testar em 375px ANTES de desktop

---

## ORDEM DE EXECUÇÃO (GRAFO DE DEPENDÊNCIAS)

```
FASE 1 (Layout) ──────────────────────────────────────────┐
    │                                                       │
    ├── FASE 2 (Perfil) ─── depende: profiles, Storage     │
    │                                                       │
    ├── FASE 3 (Aparência) ─── depende: ThemeProvider      │
    │                                                       │
    ├── FASE 4 (Modo de Uso) ─── depende: ModeProvider     │
    │                                                       │
    ├── FASE 5 (Notificações) ─── depende: profiles.notif  │
    │                                                       │
    ├── FASE 6 (Categorias) ─── depende: categories table  │
    │                                                       │
    ├── FASE 7 (Integrações) ─── depende: intg_toggles     │
    │                                                       │
    └── FASE 8 (Meu Plano) ─── depende: get_user_usage()  │
                                                            │
    FASES 2-7 podem ser executadas em PARALELO ────────────┘
    FASE 8 deve ser a ÚLTIMA (depende de Edge Function)
```

---

## CHECKLIST DE CONCLUSÃO

### Funcionalidade
- [ ] 7 seções renderizam sem erro
- [ ] Navegação interna funciona (desktop cfg-menu + mobile tabs)
- [ ] Todos os campos de Perfil persistem
- [ ] Upload de avatar funciona
- [ ] 9 temas aplicam instantaneamente
- [ ] Modo Foco/Jornada aplica globalmente
- [ ] Notificações persistem com optimistic update
- [ ] Categorias CRUD completo
- [ ] Integrações toggle opt-in funciona
- [ ] Meu Plano exibe uso atual com progress bars
- [ ] UpgradeModal funciona de qualquer feature PRO
- [ ] Excluir conta com confirmação dupla
- [ ] Exportar dados gera JSON

### Visual
- [ ] Cor `#64748b` no módulo (tabs, badges, CTAs)
- [ ] Underline tabs no mobile (não pills)
- [ ] Zona de Perigo com borda vermelha sutil
- [ ] Temas PRO com lock visual
- [ ] Mode-cards com checkmark esmeralda
- [ ] Progress bars coloridas por threshold

### Testes
- [ ] 48 testes Playwright passando
- [ ] Cobertura: renderização, regras de negócio, estados, modos, responsividade

### Mobile
- [ ] Testado em 375px width
- [ ] Tabs com scroll horizontal e fade indicator
- [ ] Touch targets ≥ 48x48px
- [ ] Cards não transbordam

---

*Prompt criado em: 07/03/2026*
*Módulo: ⚙️ Configurações*
*Cor: #64748b*
*Referências: SPEC-FUNCIONAL-CONFIGURACOES.md, proto-mobile-configuracoes-v3.html*
