# PROMPT 8 — Onboarding

> **Quando usar:** Após autenticação aprovada. O Onboarding depende do redirect
> pós-cadastro estar configurado corretamente (feito no Prompt 7).
>
> **Pré-requisito:** PROMPT 7 concluído e aprovado.
>
> **Nota:** Esta é uma tela nova — não existe no MVP v1. Implementar do zero.

---

## Prompt

```
Próxima tarefa: implementar a tela de Onboarding.

Referências obrigatórias (leia antes de escrever código):
- `15-AUTH-ONBOARDING-DEV-SPEC.md` — seção completa de Onboarding
- `proto-onboarding.html` — design visual aprovado com todos os 5 passos

Rota: /onboarding
- Fora do grupo (app) — não usa o AppShell
- Exige autenticação (verificar no middleware)
- Tela cheia, sem ModuleBar nem Sidebar

Implementação como wizard de 5 passos com state machine local (useReducer):

Estado do wizard:
- currentStep: 1 a 5
- data: objeto com todos os campos coletados
- isSubmitting: boolean

Passo 1 — Boas-vindas e modo de uso:
- Apresentação visual do SyncLife (logo + headline)
- Seleção de modo: card Foco vs card Jornada
- Mesmo visual dos mode-cards da tela de Configurações
- Badge "PRO" no card Jornada (bloqueio real aplicado depois, não aqui)

Passo 2 — Informações básicas:
- Campo: Nome (obrigatório, mínimo 2 caracteres)
- Select: Moeda (padrão R$ BRL)
- Select: Fuso horário (padrão America/Sao_Paulo)
- Select: Dia de início do mês (1 a 31, padrão 1)

Passo 3 — Renda mensal:
- Campo monetário formatado em tempo real (ex: R$ 5.000,00)
- Select: Frequência (Mensal, Quinzenal, Semanal)
- Campo opcional: Renda extra/variável

Passo 4 — Primeiro orçamento:
- Sliders ou campos para definir percentual por categoria:
  Moradia, Alimentação, Transporte, Lazer, Outros
- Soma não pode ultrapassar 100% da renda
- Exibir valor em R$ ao lado do percentual (calculado em tempo real)
- Feedback visual se a soma ultrapassar 100% (barra vermelha)

Passo 5 — Pronto!
- Celebração visual (confetti CSS ou animação simples)
- Resumo do que foi configurado
- Botão "Começar minha jornada" → redireciona para /financas

Componente `WizardStepper` (criar em `src/components/shared/WizardStepper.tsx`):
- Barra de progresso no topo com os passos numerados
- Passo atual destacado, passos anteriores marcados como concluídos
- Reutilizável — será usado também no wizard de Nova Meta (Fase 3)

Navegação entre passos:
- Botões Voltar / Avançar no rodapé
- Avançar só ativa quando todos os campos obrigatórios do passo estão válidos
- Não voltar no Passo 1 (não há passo anterior)
- Validação por passo com mensagens de erro inline

Ao concluir o Passo 5 (clicar em "Começar"):
- Salvar no Supabase via updateProfile():
  name, currency, timezone, month_start_day, mode, theme
- Salvar orçamentos iniciais na tabela budget_envelopes (criar se não existir)
- Marcar onboarding_completed: true na tabela profiles
- Redirecionar para /financas

Reconfiguração:
- Se URL tiver ?reconfigure=true: pular o Passo 1 e ir direto para o Passo 2
- Manter os valores atuais do perfil pré-preenchidos nos campos

Acessibilidade mínima:
- Labels nos inputs
- Navegação por teclado entre os passos (Tab, Enter para avançar)
- Focus visible nos campos ativos
```

---

## O que esperar como resposta

- `/onboarding/page.tsx` completo com os 5 passos
- `WizardStepper.tsx` como componente compartilhado
- Validação por passo funcionando
- Persistência no Supabase ao concluir

## Critério de aprovação

Fluxo completo:
1. Novo cadastro → redirect para /onboarding
2. Completar todos os 5 passos → dados salvos no Supabase
3. Redirect para /financas com o modo selecionado ativo
4. Acessar /onboarding novamente estando com onboarding concluído → redirect /financas
5. Acessar /configuracoes → clicar "Reconfigurar" → /onboarding?reconfigure=true → Passo 1 pulado, campos pré-preenchidos

---

## Próximo passo após este prompt

→ **PROMPT-9-CONFIGURACOES.md**

---

*Fase 1 — Fundação*
*Ordem: 8 de 10*
