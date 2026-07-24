# POC DS v5 · Rodada 3: anatomia híbrida + motion referência + 3D com craft

**Data:** 2026-07-24
**Status:** aprovado em brainstorm (híbrido escolhido no companion), aguardando revisão do spec
**Branch:** `poc/ds-v5`
**Pré-requisito:** veredito do duelo (spec 2026-07-23, decisão 8): linguagem **A "Estúdio"** vence; C descartada.

## 1. O que esta rodada corrige (feedback do usuário sobre as 8 telas)

1. **Anatomia reprovada:** landing "genérica" (fórmula hero + seções) e telas de app com "cara de dashboard comum", hierarquia que não guia o olho.
2. **Motion abaixo das referências:** faltou scroll-storytelling, transições e coreografia de hover como em osmo.supply/jeton.com/phamilypharma.com.
3. **3D "muito pobre e mal construído":** o orbital atual tem materiais básicos, sem pós-processamento nem integração com a página.

## 2. Decisões tomadas com o usuário

1. Rodada 3 acontece **só na linguagem A** (tokens, tipografia e acentos da direção Estúdio permanecem).
2. **Anatomia vencedora: híbrido "Revista × Mesa"** (escolhido entre 3 conceitos + 1 híbrido mostrados no companion):
   - Esqueleto **Revista**: coluna narrativa dominante onde o coach escreve e os números vivem dentro do texto; rubricas nas margens (agenda, fluxo, módulos); hierarquia por fio e tipografia; sem grid de cards.
   - Fisicalidade **Mesa**: objetos com profundidade e leve rotação que atravessam os fios: o score é uma placa inclinada, o saldo é uma tira de filme que escapa da coluna, o alerta do coach é um bilhete preso sobre a matéria.
3. **Escopo da rodada:** Landing + Dashboard primeiro (as duas dores apontadas). Finanças e Coach herdam a anatomia vencedora numa rodada 4, sem duplicação especulativa.
4. Protótipos novos ficam em **`prototypes/poc-v5/r3-estudio/`** (landing.html, dashboard.html), preservando os da rodada 1-2 para comparação lado a lado.

## 3. Landing r3: scroll-story (não mais hero + seções)

Estrutura em **cenas encadeadas pelo scroll** (GSAP ScrollTrigger com pinning/scrub + Lenis):

| Cena | Conteúdo | Motion |
|---|---|---|
| 1 · Abertura | Headline gigante + orbital 3D reconstruído ocupando a tela | Orbital nasce em zoom suave; headline em stagger; Lenis desde o primeiro pixel |
| 2 · As onze frentes | PINNED: o orbital fica preso enquanto o scroll destaca 4-5 módulos, um por vez (esfera acende + rótulo "01 Finanças" entra na margem) | Scrub: cada tick de scroll gira a câmera até a próxima esfera |
| 3 · O número | A câmera mergulha no núcleo; fade pro **78** tipográfico gigante contando com scrub | Transição 3D→tipografia; counter atrelado ao scroll, não a timer |
| 4 · A matéria | A anatomia Revista×Mesa aparece como demonstração do produto: a "página" do Panorama monta-se peça por peça (placa desliza, tira encaixa, bilhete carimba) | Entrada orquestrada com o easing assinatura; parallax de profundidade no mouse |
| 5 · Cross-módulo | Frase causal enorme com highlight elétrico | Palavras entram por máscara, linha a linha |
| 6 · CTA | "Comece hoje. De graça." + footer de uma linha | Reveal simples; nada compete com o CTA |

Regras: marquee dos módulos pode existir como divisor entre cenas 3-4; toda cena degrada pra layout estático legível sem GSAP/Lenis (progressive enhancement, `gsap.from`/`fromTo` only); prefers-reduced-motion desliga pinning/scrub e mostra as cenas empilhadas.

## 4. Dashboard r3: híbrido Revista × Mesa aplicado

Referência visual: mockup aprovado no companion (`.superpowers/brainstorm/6534-1784912591/content/hibrido-revista-mesa.html`).

- **Grade editorial de 3 colunas** (rubricas 170px · matéria 1fr · margem do número 250px) com fios `--line` no lugar de cards.
- **Margem esquerda:** wordmark, rubrica "Hoje" (agenda), chip de fluxo rotacionado (objeto Mesa).
- **Matéria (centro):** eyebrow + headline editorial do dia (Space Grotesk ~2.4rem) + parágrafo do coach com números em destaque inline (strong t1, elétrico, coral) + tira de filme do saldo (escapa da coluna, rotate .8deg, sparkline) + bilhete do coach (rotate -.9deg, border-left roxo, CTA "Resolver agora").
- **Margem direita:** placa do score (rotate -1.6deg, atravessa o fio por cima, gradient sutil, 78 + pill delta) + rubrica "Módulos" (lista monocromática numerada).
- **Motion:** entrada orquestrada (placa desliza e assenta, tira encaixa, bilhete "carimba" com micro-overshoot) + **parallax de profundidade no mouse** (objetos Mesa deslocam 2-6px em camadas; fios e texto ficam parados) + hovers com o easing assinatura.
- **Navegação:** os 11 módulos saem do rail; viram um **índice compacto** acessível pelo wordmark/menu (overlay simples no protótipo) + a rubrica "Módulos" na margem direita como atalho contextual. (A navegação definitiva do produto fica pra fase de DS; o protótipo demonstra a intenção.)
- Dados: mesmos do mock (`SL_MOCK`), com fallbacks estáticos idênticos.

## 5. 3D reconstruído (o orbital com craft)

Aplica-se à Landing r3 (dashboard segue sem WebGL; profundidade lá é CSS).

- **Pipeline:** Three.js 0.160 via importmap incluindo `three/addons/`; `EffectComposer + RenderPass + UnrealBloomPass` (bloom real no núcleo e nas esferas de acento); `RoomEnvironment` + `PMREMGenerator` para reflexos físicos.
- **Materiais:** núcleo `MeshPhysicalMaterial` (emissive roxo, clearcoat, leve transmissão); esferas de módulo com metalness/roughness calibrados; anéis como linhas finas com opacidade por profundidade.
- **Integração:** a cena pertence à página: rotação/câmera respondem ao scroll (cenas 1-3), drag com inércia continua, DPR cap 2, `IntersectionObserver` pausa fora do viewport, resize com clamp de aspecto.
- **Fallback:** sem WebGL/CDN → composição estática (SVG/CSS) equivalente; reduced-motion → cena renderizada uma vez, sem rotação automática (drag permitido).
- Critério de aceite: **screenshot do orbital deve parecer render de produto** (bloom visível, profundidade real), não "esferas de tutorial".

## 6. Execução

- Arquivos: `prototypes/poc-v5/r3-estudio/landing.html` e `dashboard.html`, standalone, mesmos padrões das rodadas anteriores (guards, favicon data:, sem em-dash/emoji, NBSP, fallbacks estáticos = mock).
- CDNs: Google Fonts (Space Grotesk/Inter), GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.14 (unpkg), Three 0.160 + addons (jsdelivr importmap).
- QA: python http.server efêmero + Playwright MCP (nunca curl; nunca file://); screenshots com scroll-force + espera de entrances; console 0 erros; verificação das cenas pinadas em pelo menos 3 posições de scroll; reduced-motion testado.
- Julgamento: usuário compara r3 vs telas antigas de A e responde se a rodada 3 resolveu as 3 críticas (anatomia, motion, 3D). Aprovada → rodada 4 propaga pra Finanças/Coach e nasce o `DESIGN-SYSTEM-v5.md`.

## 7. Fora de escopo

- Finanças/Coach r3 (rodada 4), mobile pixel-perfect, integração no app Next, navegação definitiva dos 11 módulos, decisão sobre a branch v4.

## 8. Riscos

- **Pinning + Lenis** têm interações delicadas (jitter): usar `ScrollTrigger.scrollerProxy`/`lenis.on('scroll', ScrollTrigger.update)` e testar em 1440 e 1100.
- **Bloom custa GPU:** limitar resolução do composer (metade do DPR se necessário) e medir; alvo 60fps em notebook comum, degradar bloom antes de degradar a cena.
- **Scroll-story quebra sem JS:** cada cena precisa de layout estático legível (verificado com CDNs bloqueados).
