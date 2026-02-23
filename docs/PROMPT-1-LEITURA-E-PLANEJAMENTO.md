# PROMPT 1 — Leitura e Planejamento

> **Quando usar:** Envie este prompt SEMPRE antes de qualquer desenvolvimento.
> É obrigatório no início de cada nova sessão do Claude Code relacionada à Fase 1.
> Ele garante que o Claude Code entenda o contexto completo antes de escrever uma linha de código.
>
> **Regra:** Não pule este prompt. Claude Code não tem memória entre sessões.

---

## Prompt

```
Antes de começar qualquer implementação, preciso que você leia e compreenda toda a documentação relevante para o que vamos desenvolver.

Leia os seguintes arquivos nesta ordem:

1. `17-NAVEGACAO-SHELL-DEV-SPEC.md` — spec completa do Shell de Navegação (Module Bar, Sidebar, TopHeader, Modo Foco/Jornada)
2. `15-AUTH-ONBOARDING-DEV-SPEC.md` — spec de Autenticação e Onboarding
3. `configuracoes-dev-spec.md` — spec da tela de Configurações
4. `12-DECISOES-FASE1-CLAUDE-CODE.md` — decisões técnicas já tomadas para esta fase (leia antes de fazer perguntas)
5. `proto-navigation-v3.html` — abra e analise o HTML/CSS do protótipo aprovado do shell
6. `proto-auth.html` — protótipo de auth
7. `proto-onboarding.html` — protótipo de onboarding
8. `proto-configuracoes.html` — protótipo de configurações

Depois de ler, faça um levantamento do estado atual do projeto:
- Liste os componentes de layout existentes (`components/layout/`)
- Liste as rotas existentes em `app/(app)/` e `app/(auth)/`
- Liste os hooks e providers existentes
- Identifique o que pode ser aproveitado vs. o que precisa ser reconstruído para o MVP v2

Com base nisso, me apresente:
1. Um diagnóstico do que existe vs. o que a spec exige
2. O plano de execução detalhado para a Fase 1, dividido em subtarefas
3. Perguntas ou ambiguidades que precisa esclarecer antes de começar

Não escreva código ainda. Apenas leia, analise e planeje.
```

---

## O que esperar como resposta

O Claude Code deve entregar:

- **Diagnóstico** listando o que existe vs. o que a spec exige (gap analysis)
- **Plano de execução** com subtarefas ordenadas e estimativas
- **Perguntas** apenas sobre ambiguidades não cobertas pelos docs

Se ele levantar perguntas já respondidas no `12-DECISOES-FASE1-CLAUDE-CODE.md`, aponte o arquivo e peça que ele releia antes de continuar.

---

## Próximo passo após este prompt

→ **PROMPT-2-TOKENS-CSS-DESIGN-SYSTEM.md**

---

*Fase 1 — Fundação*
*Ordem: 1 de 10*
