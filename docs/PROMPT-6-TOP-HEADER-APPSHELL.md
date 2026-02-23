# PROMPT 6 — Shell: TopHeader + Pills + AppShell Completo

> **Quando usar:** Após Sidebar aprovada. Finaliza o shell montando todos os
> componentes juntos no AppShell e criando todas as rotas placeholder.
>
> **Pré-requisito:** PROMPT 5 concluído e aprovado.

---

## Prompt

```
Próxima tarefa: implementar o TopHeader, montar o AppShell completo e criar todas as rotas placeholder.

Referências obrigatórias (leia antes de escrever código):
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seções 5 (TopHeader) e 6 (AppShell)
- `proto-navigation-v3.html` e `proto-financas-dashboard.html` — inspecione o .top-hdr e os pills

Componentes a implementar:

`src/components/shell/TopHeader.tsx`
- Height: 54px (var(--header-h)), position: sticky, top: 0, z-index: 40
- Background: transparente com leve gradiente no topo
- Modo Jornada: background: linear-gradient(90deg, rgba(16,185,129,0.06), transparent 60%)
- Border-bottom: 1px solid var(--border)
- Layout: flex, align-items: center, justify-content: space-between, padding: 0 20px

Lado esquerdo:
- Botão expandir (chevron-right): visível apenas quando sidebarOpen=false, chama toggleSidebar()
- Modo Foco: breadcrumb "[Módulo] › [Página atual]" (lê activeModule + usePathname)
- Modo Jornada: "Olá, [Nome]! [emoji]" com nome em gradiente esmeralda→azul + frase de contexto
  - Nome do usuário: buscado do perfil Supabase (fallback: "usuário" enquanto carrega)
  - Emoji e frase variam por módulo (definir em modules.ts junto com os outros dados do módulo)

Lado direito (sempre visível):
- ModePill
- ThemePill
- NotifButton (sino com dot vermelho — dot visível sempre por enquanto, lógica real na Fase 5)

`src/components/shell/ModePill.tsx`
- border-radius: 9999px, padding: 5px 12px, gap: 6px
- Background: var(--s2), border: 1px solid var(--border)
- Emoji (🎯 ou 🌱) + label ("Modo Foco" ou "Modo Jornada")
- font-size: 12px, font-weight: 500
- Hover: border-color var(--border-h)
- Ao clicar: chama toggleMode() do useMode()
- Se usuário FREE tentando ativar Jornada: exibe toast informativo "Modo Jornada disponível no plano Pro"

`src/components/shell/ThemePill.tsx`
- Mesmo estilo visual da ModePill
- Emoji (🌙 ou ☀️) + label ("Dark" ou "Light")
- Ao clicar: chama toggleTheme() do useTheme()

`src/components/shell/MobileBottomBar.tsx`
- Visível apenas em mobile (< 640px)
- Position: fixed, bottom: 0, width: 100%, height: 56px, z-index: 50
- Background: var(--s1), border-top: 1px solid var(--border)
- 4 tabs na ordem: Home, Finanças, Metas, Agenda
- Tab ativa: ícone + label na cor do módulo (var(--fin), var(--meta), etc.)
- Tab inativa: ícone + label cor var(--t3)
- Usar os mesmos ícones do ModuleBar (ModuleIcons.tsx)

`src/components/shell/AppShell.tsx`
- Orquestra: ModuleBar + Sidebar + TopHeader + {children} + MobileBottomBar
- Layout:
  display: flex, height: 100vh, overflow: hidden
  ModuleBar: fixed left-0 (já implementado)
  Sidebar: fixed left-58px (já implementado)
  Main: margin-left calculado (58px + sidebarWidth), flex: 1, display: flex, flex-direction: column
  ContentArea: flex: 1, overflow-y: auto, padding: 20px

`src/app/(app)/layout.tsx` (atualizar)
- Substituir layout antigo pelo novo AppShell
- Verificação de autenticação: se não autenticado → redirect /login
- Se autenticado mas onboarding_completed=false → redirect /onboarding

Criar todas as rotas placeholder (página com apenas <h1> e nome da tela):
- (app)/page.tsx — Dashboard Home placeholder
- (app)/financas/page.tsx — Visão Geral placeholder
- (app)/financas/transacoes/page.tsx
- (app)/financas/orcamentos/page.tsx
- (app)/financas/planejamento/page.tsx
- (app)/financas/recorrentes/page.tsx
- (app)/financas/calendario/page.tsx
- (app)/financas/relatorios/page.tsx
- (app)/metas/page.tsx
- (app)/metas/nova/page.tsx
- (app)/metas/[id]/page.tsx
- (app)/agenda/page.tsx
- (app)/agenda/mensal/page.tsx
- (app)/conquistas/page.tsx

Teste manual antes de entregar: navegue por todos os módulos no localhost:3000.
O shell deve renderizar corretamente com ModuleBar, Sidebar e TopHeader em todas as rotas.
Os pills de Modo e Tema devem funcionar visualmente. Mobile deve mostrar a BottomBar.
```

---

## O que esperar como resposta

- `TopHeader.tsx`, `ModePill.tsx`, `ThemePill.tsx`, `MobileBottomBar.tsx`, `AppShell.tsx`
- `(app)/layout.tsx` atualizado
- 14 arquivos de rotas placeholder criados

## Critério de aprovação

Testar em 3 tamanhos de tela:
- Desktop (1280px): ModuleBar + Sidebar + TopHeader visíveis, pills funcionando
- Tablet (768px): Sidebar recolhe ao diminuir, ModuleBar permanece
- Mobile (375px): ModuleBar e Sidebar ocultos, MobileBottomBar visível no rodapé

---

## Próximo passo após este prompt

→ **PROMPT-7-AUTENTICACAO.md**

---

*Fase 1 — Fundação*
*Ordem: 6 de 10*
