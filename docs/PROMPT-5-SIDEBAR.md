# PROMPT 5 — Shell: Sidebar (Nível 2)

> **Quando usar:** Após ModuleBar aprovado. A Sidebar depende do activeModule
> do store para saber qual navegação renderizar.
>
> **Pré-requisito:** PROMPT 4 concluído e aprovado.

---

## Prompt

```
Próxima tarefa: implementar a Sidebar, o Nível 2 do shell de navegação.

Referências obrigatórias (leia antes de escrever código):
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seção 4 (Sidebar), incluindo Life Sync Score
- `proto-navigation-v3.html` — inspecione a .sidebar, .sb-header, .sb-nav e .sb-score
- `proto-configuracoes.html` — a sidebar de configurações tem estrutura de navegação diferente (seções com labels)

O que implementar:

`src/components/shell/Sidebar.tsx`

Comportamento e dimensões:
- Desktop: largura 228px (sidebarOpen=true) ou 0px (sidebarOpen=false)
- Transição: width 0.25s ease, overflow: hidden durante a transição
- Mobile (< 640px): display: none sempre (navegação via MobileBottomBar)
- Position: fixed, left: 58px, top: 0, height: 100vh
- Background: var(--s1), border-right: 1px solid var(--border)
- z-index: 50 (abaixo da ModuleBar)

Estrutura interna (de cima para baixo):
1. sb-header: ícone do módulo ativo (32×32px) + nome do módulo + botão de recolher (chevron)
2. sb-score: Life Sync Score — APENAS em Modo Jornada (display: none em Modo Foco)
3. sb-nav: lista de itens de navegação dinâmica conforme módulo ativo

Navegação por módulo (definir em `src/lib/modules.ts`):

Finanças:
  Seção Principal: Visão Geral (/financas), Transações (/financas/transacoes), Orçamentos (/financas/orcamentos)
  Seção Planejamento: Planejamento (/financas/planejamento), Recorrentes (/financas/recorrentes), Calendário (/financas/calendario)
  Seção Análise: Relatórios (/financas/relatorios)

Metas:
  Seção Principal: Minhas Metas (/metas), Nova Meta (/metas/nova)

Agenda:
  Seção Principal: Semanal (/agenda), Mensal (/agenda/mensal)

Configurações:
  Seção Conta: Perfil, Modo de Uso, Aparência
  Seção Preferências: Notificações, Integrações
  Seção Plano: Meu Plano (com badge Free/Pro)
  Obs: itens de configuração NÃO mudam de rota — usam URL param ?section=

Home:
  Sem sidebar (ou sidebar mínima com apenas o Life Sync Score em Jornada)

Estado ativo do nav item:
- background: rgba(16,185,129,0.14)
- cor: #10b981 (var(--em))
- font-weight: 500
- border-radius: var(--radius-sm) (8px)
- Detectar item ativo via usePathname() do Next.js

Label de seção:
- font-size: 10px, font-weight: 700, text-transform: uppercase, letter-spacing: 0.05em
- cor: var(--t3)

`src/components/shell/SidebarScore.tsx` (componente separado)
- Exibido apenas em Modo Jornada
- Score global (ex: 74) com gradiente esmeralda→azul no texto
- Barra de progresso com fill gradiente
- Delta da semana (ex: ↑ +3 esta semana)
- Dados mockados agora com TODO para integração real
- Extraia o estilo exato do proto-navigation-v3.html

Integração com o store:
- Lê activeModule, mode, sidebarOpen via useShell()
- Chama toggleSidebar() no botão de recolher
- useMode() para mostrar/ocultar SidebarScore
```

---

## O que esperar como resposta

- `Sidebar.tsx` com navegação dinâmica por módulo
- `SidebarScore.tsx` com dados mockados
- `src/lib/modules.ts` com a definição completa de todos os módulos e seus nav items

## Critério de aprovação

Navegue entre todos os módulos no browser. Para cada módulo ativo, a Sidebar deve exibir os itens corretos com os labels e caminhos correspondentes. O Life Sync Score deve aparecer apenas em Modo Jornada.

---

## Próximo passo após este prompt

→ **PROMPT-6-TOP-HEADER-APPSHELL.md**

---

*Fase 1 — Fundação*
*Ordem: 5 de 10*
