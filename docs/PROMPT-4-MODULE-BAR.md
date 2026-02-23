# PROMPT 4 — Shell: Module Bar (Nível 1)

> **Quando usar:** Após store Zustand aprovado. Primeiro componente visual do shell.
>
> **Pré-requisito:** PROMPT 3 concluído e aprovado.

---

## Prompt

```
Próxima tarefa: implementar o ModuleBar, o Nível 1 do shell de navegação.

Referências obrigatórias (leia antes de escrever código):
- `17-NAVEGACAO-SHELL-DEV-SPEC.md` — seção 3 (Module Bar), inclui dimensões, estados, comportamento
- `proto-navigation-v3.html` — inspecione o HTML da .module-bar e todo o CSS associado

O que implementar:

`src/components/shell/ModuleBar.tsx`

Especificações visuais (extraia do protótipo, não invente):
- Largura fixa: 58px, height: 100vh, position: fixed, left: 0, top: 0
- Background: var(--s1), border-right: 1px solid var(--border)
- z-index: 60, flex-shrink: 0

Estrutura de cima para baixo:
- Logo SyncLife (SVG exato do protótipo, 34×34px, gradiente esmeralda→azul)
- Grupo principal de módulos: Home, Finanças, Metas, Agenda
- Spacer flex: 1
- Configurações (fixado no rodapé)
- Avatar do usuário (iniciais, gradiente esmeralda→azul, 32×32px)
- Tooltip ao hover (posicionado à direita do botão, z-index 999)

Botões de módulo (42×42px, border-radius 12px):
- Estado inativo: cor var(--t3), background transparente
- Hover: background var(--s3), cor var(--t2), transform scale(1.05)
- Estado ativo por módulo:
  - Home:         background rgba(238,242,255,.1), cor var(--t1)
  - Finanças:     background var(--fin-glow),      cor var(--fin)
  - Metas:        background var(--meta-glow),     cor var(--meta)
  - Agenda:       background var(--agenda-glow),   cor var(--agenda)
  - Configurações: background var(--cfg-glow),     cor var(--cfg)
- Pill vertical ativo (::before ou elemento absoluto):
  3px wide × 22px tall, left: -8px, top: 50%, translateY(-50%), border-radius: 0 3px 3px 0
  background: currentColor, transition height 0.2s cubic-bezier(.4,0,.2,1)

Ícones:
- Usar os SVGs inline extraídos do proto-navigation-v3.html (decisão já tomada no doc 12)
- Criar `src/components/shell/icons/ModuleIcons.tsx` com cada ícone como componente React
- Tamanho dos ícones: 21×21px, stroke="currentColor", strokeWidth="1.8"

Mobile (< 640px):
- ModuleBar fica oculto (display: none)
- Navegação mobile é feita pela MobileBottomBar (implementada no PROMPT 6)

Integração com o store:
- Lê activeModule do shell-store via useShell()
- Chama setModule() ao clicar em cada botão
- Usa router.push(module.path) para navegação
- Atualiza o título do documento (document.title) com o nome do módulo ativo

Entregue o componente completo, tipado, sem hardcode de cores.
Mostre também o ModuleIcons.tsx com todos os 5 ícones (Home, Finanças, Metas, Agenda, Configurações) + o logo.
```

---

## O que esperar como resposta

- `ModuleBar.tsx` completo e tipado
- `ModuleIcons.tsx` com os 6 SVGs extraídos do protótipo
- Sem nenhuma cor hardcoded — tudo via tokens CSS

## Critério de aprovação

Compare visualmente o ModuleBar renderizado no browser com o `proto-navigation-v3.html` aberto lado a lado. Deve ser pixel-perfect: largura, espaçamentos, ícones, cores de hover e estados ativos idênticos.

---

## Próximo passo após este prompt

→ **PROMPT-5-SIDEBAR.md**

---

*Fase 1 — Fundação*
*Ordem: 4 de 10*
