# PROMPT 9 — Tela de Configurações

> **Quando usar:** Após Onboarding aprovado. Configurações é a última tela
> da Fase 1 e a mais complexa — tem 6 seções internas e integração com Supabase
> em quase todos os campos.
>
> **Pré-requisito:** PROMPT 8 concluído e aprovado.

---

## Prompt

```
Próxima tarefa: implementar a tela de Configurações.

Referências obrigatórias (leia TUDO antes de escrever código):
- `configuracoes-dev-spec.md` — spec completa com 22 seções. Esta é a referência principal.
- `proto-configuracoes.html` — design visual aprovado

Rota: /configuracoes (dentro do grupo (app) — usa o AppShell)

Esta tela tem estrutura interna própria com 6 seções navegáveis.
Implemente na seguinte ordem de prioridade:

PRIORIDADE 1 — Estrutura base e navegação interna:
- Layout two-column: cfg-menu (200px sticky) + cfg-content (flex: 1, scrollável)
- Navegação entre seções via URL param: ?section=perfil (padrão), ?section=modo, etc.
- cfg-menu com grupos e itens conforme spec seção 3.2
- Ao mudar de seção: cfg-content scrolla para o topo
- Em mobile (< 640px): cfg-menu oculto, navegação pela sidebar principal

PRIORIDADE 2 — Seção Perfil:
- Avatar: exibição (iniciais com gradiente) + upload (Supabase Storage, bucket 'avatars')
- Campos nome, sobrenome, e-mail com dirty state (botão Salvar aparece ao editar)
- Debounce de 800ms nos inputs de texto antes de habilitar o botão Salvar
- Preferências regionais: moeda, fuso horário, dia de início do mês, formato de data
- Persistir via updateProfile() ao clicar Salvar
- Toast de sucesso "Perfil atualizado" por 3s
- Danger Zone: exportar dados (JSON download gerado no client) + excluir conta (confirm duplo)

PRIORIDADE 3 — Seção Modo de Uso:
- mode-cards com seleção visual (spec seção 6.1)
- Ao selecionar: atualiza shell-store + persiste no Supabase via updateProfile({ mode })
- Toast de confirmação (aparece e some em 3500ms, spec seção 6.2)
- Gate PRO para Modo Jornada: usuário FREE → toast "Disponível no plano Pro"
- Tabela comparativa de modos (spec seção 6.3)
- Botão "Reconfigurar SyncLife": ConfirmDialog → redirect /onboarding?reconfigure=true

PRIORIDADE 4 — Seção Aparência:
- 4 theme-preview cards clicáveis (spec seção 7.1)
- Ao clicar: atualiza ThemeProvider + ModeProvider + persiste no Supabase
- Toggle "Sidebar expandida por padrão": persiste em profiles.sidebar_open
- Toggle "Animações reduzidas": adiciona/remove classe reduced-motion no body + persiste
- Toggle "Números compactos": persiste em profiles.compact_numbers
  Implementar formatCurrency(value, compact) em src/lib/format.ts:
  - compact=false: "R$ 1.200,00"
  - compact=true: "R$ 1,2K" (acima de 1.000), "R$ 1,2M" (acima de 1.000.000)
- Select "Visão padrão da Agenda": persiste em profiles.agenda_default_view

PRIORIDADE 5 — Seção Notificações:
- Carregar estado de notificações do perfil Supabase ao montar
- Todos os toggles com optimistic update (muda visual imediatamente, persiste em background)
- Se persistência falhar: reverte o toggle + toast de erro
- Seletor de horário para lembrete diário (time input, padrão 21:00)
- Cards de alertas com badges de modo (spec seção 8.2 e 8.4)
- Em Modo Foco: card "Modo Jornada exclusivos" exibe nota informativa

PRIORIDADE 6 — Seção Integrações:
- Grid de intg-cards (spec seção 9.1 e 9.2)
- Para cada integração, exibir estado correto conforme tabela da spec seção 9.4
- Integrações PRO para usuário FREE: botão "🔒 Upgrade para conectar"
- Clicar no botão de lock: toast "Disponível no plano Pro — veja os planos em Meu Plano"
- Google Sheets aparece como "Conectado" por padrão (mock)
- OAuth real: deixar como TODO comentado

PRIORIDADE 7 — Seção Meu Plano:
- Dois plan-cards: FREE (atual) e PRO com as features listadas (spec seção 11.2)
- Card FREE com botão disabled "Plano atual"
- Card PRO com botão "✦ Fazer upgrade para Pro"
  → ao clicar: toast "Em breve — integração com gateway de pagamento"
- Uso atual: buscar contagens via Supabase queries diretas (não Edge Function ainda)
  - Contar transações do mês atual
  - Contar metas ativas
  - Contar recorrentes ativas
  - Contar eventos do mês atual
- Progress bars com animação width 0→valor ao montar (spec seção 11.3)
- Cores das barras: verde até 75%, amarelo 75–90%, vermelho >90%

Schema Supabase: verifique se todos os campos da spec seção 16.1 existem na tabela profiles.
Execute as migrations pendentes antes de implementar qualquer seção.
```

---

## O que esperar como resposta

- `/configuracoes/page.tsx` com as 6 seções funcionando
- Todos os campos persistindo no Supabase
- `formatCurrency` atualizado com suporte a compact mode
- Schema Supabase completo verificado e atualizado

## Critério de aprovação

Execute os 35 testes da `configuracoes-dev-spec.md` seção 19 manualmente:
- Editar nome → salvar → reload → nome persistido
- Trocar modo → reload → modo persistido (shell reflete)
- Trocar tema → reload → tema persistido (cores do app mudam)
- Toggle de notificação → reload → estado persistido
- Progress bars de uso: valores reais do banco, animam ao abrir a seção

---

## Próximo passo após este prompt

→ **PROMPT-10-SINCRONIZACAO-TESTES-FINAIS.md**

---

*Fase 1 — Fundação*
*Ordem: 9 de 10*
