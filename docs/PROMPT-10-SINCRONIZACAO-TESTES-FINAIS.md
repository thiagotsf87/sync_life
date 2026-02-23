# PROMPT 10 — Sincronização Supabase + Testes Finais da Fase 1

> **Quando usar:** Último prompt da Fase 1. Conecta o estado do shell ao Supabase,
> garante sincronização bidirecional e valida o fluxo completo antes de commitar.
>
> **Pré-requisito:** PROMPT 9 concluído e aprovado.

---

## Prompt

```
Última tarefa da Fase 1: sincronizar o estado do shell com o Supabase e validar o fluxo completo.

Referências obrigatórias:
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seção de persistência e sincronização
- `configuracoes-dev-spec.md` — seção 16 (Dados e API) e seção 19 (Testes)

O que implementar:

1. Sincronização de perfil no carregamento do app
   Em `src/app/(app)/layout.tsx`, ao montar:
   - Buscar o perfil do usuário do Supabase
   - Inicializar o shell-store com os valores do perfil: mode, theme, sidebarOpen
   - Aplicar classes no body: .light e/ou .jornada conforme valores do perfil
   - Se onboarding_completed=false: redirecionar para /onboarding
   - Loading state durante a busca (skeleton ou spinner de tela cheia)

2. Sincronização bidirecional de Modo e Tema
   Quando o usuário troca via ModePill ou ThemePill:
   - Atualiza o store imediatamente (otimista)
   - Persiste no Supabase em background: updateProfile({ mode }) ou updateProfile({ theme })
   - Se falhar: reverte o store + toast "Erro ao salvar preferência"
   Adicionar a persistência nos hooks useMode.ts e useTheme.ts já criados

3. Hook `src/hooks/useUserPlan.ts` (criar)
   - Lê o campo `plan` do perfil Supabase
   - Retorna: { plan: 'free' | 'pro', isPro: boolean, isFree: boolean }
   - Usado pelo ModePill (gate Jornada) e pela tela de Configurações

4. Checklist de validação completo da Fase 1 — verificar TODOS os itens:

   Fluxo de novos usuários:
   [ ] Cadastro → /onboarding → completa 5 passos → dados no Supabase → /financas com shell
   [ ] Shell exibe nome do usuário no TopHeader (Modo Jornada) e no avatar
   [ ] Modo selecionado no onboarding está ativo ao abrir o app

   Fluxo de usuários existentes:
   [ ] Login → /financas com shell completo (sem onboarding)
   [ ] Reload preserva modo, tema e estado da sidebar

   Shell:
   [ ] ModePill troca modo, aplica visual, persiste no reload
   [ ] ThemePill troca tema, aplica visual, persiste no reload
   [ ] Sidebar abre/fecha com transição suave (width 0.25s ease)
   [ ] Trocar módulo no ModuleBar: sidebar mostra itens do módulo correto
   [ ] Item ativo da Sidebar corresponde à rota atual (usePathname)

   Mobile (testar em 375px):
   [ ] ModuleBar e Sidebar ocultos
   [ ] MobileBottomBar visível com 4 tabs
   [ ] Tab ativa com cor do módulo correto

   Configurações:
   [ ] Perfil: salvar nome → reload → nome persistido
   [ ] Modo: trocar → reload → modo persiste, shell reflete
   [ ] Tema: trocar → reload → tema persiste, app reflete
   [ ] Notificações: toggle → reload → estado persiste

   Autenticação:
   [ ] Rota protegida sem auth → redirect /login
   [ ] Usuário logado em /login → redirect /financas
   [ ] Novo usuário após cadastro → redirect /onboarding

5. Commit final da Fase 1 (quando todos os itens passarem):
   git add .
   git commit -m "feat(fase-1): shell MVP v2 completo — ModuleBar, Sidebar, TopHeader, Modo Foco/Jornada, Auth, Onboarding, Configurações"
```

---

## O que esperar como resposta

- `useUserPlan.ts` implementado
- `(app)/layout.tsx` com sync de perfil no carregamento
- `useMode.ts` e `useTheme.ts` com persistência no Supabase
- Relatório do checklist com status de cada item

## Critério de aprovação

**Todos os 18 itens do checklist passando.** Nenhum commit antes disso.

---

## Após este prompt — Iniciando a Fase 2

Antes de começar a Fase 2 (Módulo Finanças):
1. Criar a dev spec de Transações seguindo o `16-GUIA-CRIACAO-SPEC-DE-TELAS.md`
2. Usar `proto-transacoes.html` como referência visual
3. Replicar a estrutura do PROMPT 1 adaptada para a Fase 2

---

*Fase 1 — Fundação*
*Ordem: 10 de 10 — ÚLTIMO PROMPT DA FASE 1*
