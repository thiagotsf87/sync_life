# PROMPT 7 — Autenticação: Login, Cadastro e Recovery

> **Quando usar:** Após AppShell completo aprovado. Atualiza o visual das telas
> de auth para o design do MVP v2 sem quebrar a lógica Supabase existente.
>
> **Pré-requisito:** PROMPT 6 concluído e aprovado.
>
> **Atenção:** O código de auth do Supabase já está funcionando no MVP v1.
> O objetivo é ATUALIZAR O VISUAL, não recriar a lógica. Não quebre o que funciona.

---

## Prompt

```
Próxima tarefa: atualizar as telas de autenticação para o design do MVP v2.

Referências obrigatórias:
- `15-AUTH-ONBOARDING-DEV-SPEC.md` — seções de Login, Cadastro e Recovery
- `proto-auth.html` — design visual aprovado

Estado atual: o projeto já tem rotas de auth funcionando com lógica Supabase.
O objetivo é atualizar o visual para corresponder ao protótipo aprovado.
Não recrie a lógica de autenticação. Foque no visual e nos redirects.

1. `app/(auth)/layout.tsx`
   - Fundo: var(--bg) do tema dark-foco como padrão (sem shell, sem ModuleBar)
   - Centralizar conteúdo vertical e horizontalmente (min-height: 100vh)
   - Logo SyncLife no topo (usar o SVG do ModuleIcons.tsx)
   - Background com detalhe sutil (gradiente radial ou padrão de pontos conforme o protótipo)

2. `app/(auth)/login/page.tsx`
   Comparar design atual com proto-auth.html e ajustar:
   - Card centralizado: background var(--s1), border 1px solid var(--border), border-radius var(--radius-lg) (14px)
   - Título "Bem-vindo de volta" — Syne, 24px, weight 800, cor var(--t1)
   - Subtítulo — DM Sans, 14px, cor var(--t2)
   - Campos e-mail e senha com estilo dos tokens: background var(--s2), border var(--border), border-radius var(--radius-sm)
   - Botão primário: background linear-gradient(90deg, var(--em), var(--el)), Syne bold, border-radius var(--radius-md)
   - Link "Esqueceu a senha?" e link "Criar conta"
   - Manter toda a lógica Supabase intacta
   - Redirect pós-login: checar onboarding_completed → se false: /onboarding → se true: /financas

3. `app/(auth)/cadastro/page.tsx`
   - Mesma abordagem: visual atualizado, lógica mantida
   - Campos: nome, e-mail, senha, confirmação de senha
   - Redirect pós-cadastro: /onboarding (sempre — usuário novo nunca concluiu onboarding)

4. `app/(auth)/esqueceu-senha/page.tsx`
   - Visual atualizado
   - Estado 1: formulário de e-mail com botão "Enviar link"
   - Estado 2: confirmação "Verifique seu e-mail" com ícone de envelope
   - Link de volta para /login

5. `lib/supabase/middleware.ts` (verificar e corrigir se necessário)
   Garantir que os redirects estão corretos:
   - Rotas (app)/*: exigem autenticação → redirect /login se não autenticado
   - Rotas (auth)/*: se já autenticado → redirect /financas
   - Rota /onboarding: exige autenticação mas não exige onboarding completo
   - Após onboarding: redirect /financas (não /dashboard)
```

---

## O que esperar como resposta

- 3 telas de auth com visual do protótipo aprovado
- Layout base `(auth)/layout.tsx` atualizado
- Middleware com redirects corretos
- Lógica Supabase intacta (sem regressão)

## Critério de aprovação

Fluxo completo a testar:
1. Acesse `/login` sem estar logado → deve mostrar a tela de login com o novo visual
2. Login com credenciais corretas → deve redirecionar para `/financas`
3. Acesse `/financas` sem estar logado → deve redirecionar para `/login`
4. Acesse `/login` estando logado → deve redirecionar para `/financas`
5. Novo cadastro → deve redirecionar para `/onboarding`

---

## Próximo passo após este prompt

→ **PROMPT-8-ONBOARDING.md**

---

*Fase 1 — Fundação*
*Ordem: 7 de 10*
