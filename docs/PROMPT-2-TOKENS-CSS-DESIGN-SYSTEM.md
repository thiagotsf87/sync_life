# PROMPT 2 — Tokens CSS e Design System Global

> **Quando usar:** Primeira tarefa de código da Fase 1. Estabelece a fundação visual
> que todos os outros componentes vão usar. Nenhum componente deve ser criado antes deste.
>
> **Pré-requisito:** PROMPT 1 concluído e aprovado.

---

## Prompt

```
Agora vamos começar a implementação. Primeira tarefa: criar o sistema de tokens CSS e configurar o design system do MVP v2.

Referências obrigatórias (leia antes de escrever qualquer código):
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seção de tokens (os 4 temas)
- `proto-navigation-v3.html` — fonte de verdade dos valores exatos de cor

O que implementar:

1. `src/styles/tokens.css` (criar arquivo novo)
   - CSS custom properties para os 4 temas:
     - `:root` → dark-foco (padrão)
     - `body.jornada` → dark-jornada
     - `body.light` → light-foco
     - `body.light.jornada` → light-jornada
   - Tokens obrigatórios em todos os temas: --bg, --s1, --s2, --s3, --border, --border-h, --t1, --t2, --t3, --em, --el, --red, --yellow, --green, --orange, --ag
   - Tokens de módulo: --fin, --fin-glow, --meta, --meta-glow, --agenda, --agenda-glow, --cfg, --cfg-glow
   - Tokens de layout: --module-bar (58px), --sb-open (228px), --sb-closed (0px), --header-h (54px)
   - Escala de border-radius: --radius-sm (8px), --radius-md (12px), --radius-lg (14px), --radius-xl (20px), --radius-full (9999px)

2. `src/lib/constants.ts` (criar ou atualizar)
   - Objeto LAYOUT com as dimensões do shell
   - Array MODULES com: id, label, path, color, colorGlow para cada módulo

3. `tailwind.config.ts` (atualizar)
   - Adicionar fontes: Syne, DM Sans, DM Mono
   - Mapear os tokens CSS como cores Tailwind onde fizer sentido

4. `src/app/globals.css` (atualizar)
   - Importar tokens.css
   - Base styles: body usa DM Sans, headings usam Syne, valores numéricos usam DM Mono
   - Classe `.reduced-motion` que desativa todas as transitions e animations

Regras importantes:
- Extraia os valores exatos dos tokens diretamente do `proto-navigation-v3.html`. Não invente valores.
- Valide os valores contra a seção de tokens do `17-NAVEGACAO-SHELL-DEV-SPEC.md`
- Nenhuma cor deve ser hardcoded nos componentes — tudo via var(--)

Entregue os 4 arquivos implementados com comentários explicando cada bloco de tokens.
```

---

## O que esperar como resposta

- `tokens.css` com os 4 temas completos e comentados
- `constants.ts` com LAYOUT e MODULES
- `tailwind.config.ts` atualizado com fontes e cores
- `globals.css` atualizado com import e base styles

## Critério de aprovação

Abra qualquer protótipo HTML no browser e compare a paleta de cores com a aplicação. Os backgrounds, textos e cores de acento devem ser visualmente idênticos.

---

## Próximo passo após este prompt

→ **PROMPT-3-STORE-ZUSTAND-PROVIDERS.md**

---

*Fase 1 — Fundação*
*Ordem: 2 de 10*
