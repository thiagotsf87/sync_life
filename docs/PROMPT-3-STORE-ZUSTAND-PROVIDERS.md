# PROMPT 3 — Store Global (Zustand) e Providers

> **Quando usar:** Após tokens CSS aprovados. Cria o sistema de estado global
> que todos os componentes do shell vão consumir.
>
> **Pré-requisito:** PROMPT 2 concluído e aprovado.

---

## Prompt

```
Próxima tarefa: implementar o sistema de estado global do shell com Zustand.

Referências obrigatórias:
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seção de state management e persistência

O que implementar:

1. Instalar Zustand se não estiver no package.json:
   pnpm add zustand

2. `src/stores/shell-store.ts` (criar)
   Store com Zustand + persist (localStorage):
   - activeModule: string — módulo ativo ('home', 'financas', 'metas', 'agenda', 'configuracoes')
   - mode: 'foco' | 'jornada'
   - theme: 'dark' | 'light'
   - sidebarOpen: boolean
   - actions: setModule, setMode, setTheme, toggleSidebar, toggleMode, toggleTheme
   - Persistir em localStorage com key 'synclife-shell'

3. `src/hooks/useShell.ts` (criar)
   Hook que expõe o store de forma tipada e segura

4. `src/hooks/useMode.ts` (criar)
   - isJornada: boolean
   - isFoco: boolean
   - canUseJornada: boolean — busca campo `plan` do perfil Supabase
   - toggleMode(): troca modo com gate PRO (se FREE tentando ativar Jornada, bloqueia)

5. `src/hooks/useTheme.ts` (criar)
   - isDark, isLight: boolean
   - toggleTheme(): troca tema
   - Efeito colateral: aplica/remove classes `light` e `jornada` no document.body
   - Usa CSS transitions do tokens.css para a transição visual (background 0.4s, color 0.3s)

6. `src/hooks/useBreakpoint.ts` (criar)
   - isMobile: boolean (< 640px)
   - isTablet: boolean (640–1024px)
   - isDesktop: boolean (> 1024px)
   - Implementar com ResizeObserver ou window.matchMedia

7. `src/types/shell.ts` (criar)
   Tipos TypeScript: Module, NavItem, ShellMode, ShellTheme, ShellState

8. `src/app/layout.tsx` (atualizar)
   - Aplicar fontes Syne, DM Sans, DM Mono via next/font/google
   - Importar tokens.css
   - Adicionar providers necessários

Regra importante: a sincronização bidirecional mode/theme com o Supabase
(campo `mode` e `theme` na tabela `profiles`) será feita no PROMPT 10.
Agora é apenas estado local com localStorage.
```

---

## O que esperar como resposta

- `shell-store.ts` com Zustand + persist
- 4 hooks tipados: useShell, useMode, useTheme, useBreakpoint
- `shell.ts` com todos os tipos
- `layout.tsx` atualizado com fontes e providers

## Critério de aprovação

No DevTools do browser, em Application → Local Storage, após interagir com a app, deve aparecer a key `synclife-shell` com o estado persistido como JSON.

---

## Próximo passo após este prompt

→ **PROMPT-4-MODULE-BAR.md**

---

*Fase 1 — Fundação*
*Ordem: 3 de 10*
