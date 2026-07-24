# POC DS v5: duelo de direções visuais (A "Estúdio" vs C "Caderno")

**Data:** 2026-07-23
**Status:** aprovado em brainstorm, aguardando plano de implementação
**Branch alvo:** `poc/ds-v5` (criada a partir de `redesign/visual-refresh-v4`)

## 1. Contexto e motivação

O SyncLife está no meio do redesign v4 Coach-led (branch `redesign/visual-refresh-v4`, Finanças já recomposto no padrão P-A). O usuário quer explorar uma repaginação completa de layout, visual, anatomia e estrutura, inspirada em três referências premiadas cujos tokens foram extraídos em `poc-novo-ds/`:

- **Osmo** (osmo.supply): dark quente, neutros de 14 passos, tri-acento (roxo `#6840ff`, verde elétrico `#a1ff62`, coral `#f84131`), tipografia display enorme, easing assinatura, único com tokens de chrome de app.
- **Jeton** (jeton.com): minimalismo radical mono + 1 acento, tipografia fluida `clamp()`, Lenis smooth scroll. Eliminada no funil (usuário escolheu A e C).
- **Phamily Pharma** (phamilypharma.com): editorial claro, cream + verde profundo + acentos vivos, Anton uppercase + Poppins, motion com overshoot.

Objetivo declarado: algo moderno e inovador, com animações e componentes 3D como as referências, que não pareça "mais do mesmo com cara de IA".

## 2. Decisões tomadas com o usuário

1. **POC exploratória primeiro.** Nada é decidido sobre o v4 até a POC ser avaliada.
2. **Superfícies da POC:** Landing, Dashboard, Finanças e Coach.
3. **Formato:** protótipos HTML standalone (padrão `prototypes/` do projeto), sem tocar no app Next.
4. **Funil de estilo:** de 4 direções de paleta mostradas em mockup, sobreviveram **A (Osmo dark)** e **C (Phamily claro)**. A direção D (híbrido) e B (Jeton mono) foram descartadas.
5. **Duelo, não fusão:** as duas direções serão prototipadas e **uma só vence**; a vencedora vira a base do futuro DS v5.
6. **Abordagem em duas rodadas (Abordagem 1):**
   - Rodada 1: Landing + Dashboard nas duas direções (4 protótipos), usuário declara a vencedora.
   - Rodada 2: Finanças + Coach apenas na vencedora (+2 protótipos).
7. **Atualização (2026-07-24):** após ver a rodada 1, o usuário optou por estender o duelo: **Finanças + Coach nas DUAS direções** (4 protótipos na rodada 2, 8 no total). A decisão A vs C fica para depois das 8 telas. Plano da rodada 2: `docs/superpowers/plans/2026-07-24-poc-ds-v5-rodada2.md`.

## 3. Direção A: "Estúdio" (Osmo dark)

### Tokens

| Camada | Valores |
|---|---|
| Fundos | página `#151313` · card `#201d1d` · elevado `#2a2727` · borda `rgba(255,255,255,.07)` |
| Texto | primário `#f4f4f4` · secundário `#b8b8b8` · terciário `#817f7f` |
| Acentos | roxo `#6840ff` (CTA/marca) · verde elétrico `#a1ff62` (positivo/receitas) · coral `#f84131` (negativo/despesas) |
| Forma | radius 20px, profundidade por luminância (sem sombras duras) |

### Tipografia
- **Space Grotesk**: display, headlines e todos os números de valor.
- **Inter**: body.
- Headlines com line-height ~1.02 e letter-spacing negativo (-0.04em a -0.06em).

### Motion
- Easing assinatura `cubic-bezier(.625,.05,0,1)`; durações 300/400/1200ms.
- Marquees como divisores, reveals no scroll, tilt 3D no mouse.

### Anatomia (mudança ousada)
- Os 11 módulos **perdem as 11 cores**: identificação por numeração editorial monocromática ("01 Finanças", "02 Tempo"...).
- Os 3 acentos ficam reservados para significado: CTA, positivo, negativo.

### Vocabulário 3D (Three.js)
- **Sistema orbital**: 11 esferas orbitando um núcleo luminoso (o score), arrastável, parallax no scroll. Conecta com o logo SyncLife (orbitais, G-10).
- No dashboard, versão contida: stack de cards com tilt no mouse.

## 4. Direção C: "Caderno" (Phamily claro)

### Tokens

| Camada | Valores |
|---|---|
| Fundos | cream `#fffdf7` · tinta verde `#09543d` · marrom `#461e10` |
| Acentos | rosa `#ffa9e9` · lima `#ccf337` · amarelo `#ffc200` · laranja `#f45c24` (negativo) |
| Forma | bordas 2px marrom, sombras duras deslocadas (`4px 4px 0`), pills, stickers rotacionados |

### Tipografia
- **Anton**: display uppercase e números grandes (line-height ~0.93).
- **Poppins**: body e valores em listas.

### Motion
- Overshoot beziers `(0.17,0.67,0.3,1.1)` e `(0.17,0.67,0.3,1.33)`: elementos "quicam" ao entrar.
- Hover com efeito carimbo (sombra dura recolhe, elemento desloca 2px).

### Anatomia (mudança ousada)
- Dashboard vira **caderno editorial**: masthead tipo jornal, seções como capítulos, coach escreve bilhetes nas margens, KPIs viram stickers.
- Módulos identificados por etiquetas nos acentos vivos.

### Vocabulário 3D (Three.js)
- **Asterisco/flor extrudado** girando (verde, núcleo amarelo), a "estrela" da marca em volume.
- Moedas e pílulas extrudadas flutuando na landing, bounce físico ao interagir.

## 5. Compartilhado entre as direções

- Copy nova em tom editorial ("Sua semana rendeu mais que a média." em vez de saudação genérica). Regras de copy do CLAUDE.md mantidas (sem travessão, sentence case, você/nunca eu).
- G-07 mantido: zero emoji em chrome, ícones Lucide.
- Valores monetários com `fmtBRL` (`R$ 1.840,00`).
- Dados mockados idênticos nos 4 protótipos: score **78 (+4)**, saldo livre **R$ 1.840**, receitas **R$ 5.000**, despesas **R$ 3.160**, poupança **37%**, 11 módulos reais, 3 itens de agenda.
- Lenis smooth scroll nas landings.
- Nenhuma dependência do DS v3 atual nem do app Next.

## 6. Rodada 1: as 4 telas

### 6.1 Landing A "Estúdio"
1. Nav mínima (wordmark + CTA roxo).
2. Hero: headline Space Grotesk gigante com uma palavra em roxo + sistema orbital 3D interativo.
3. Marquee dos módulos como divisor.
4. "Como funciona": 3 painéis com cards do produto em perspectiva 3D (mocks construídos em HTML/CSS, não screenshots), reveal via ScrollTrigger.
5. Score: número gigante contando de 0 a 78 conforme o scroll.
6. Cross-módulo: frase causal enorme com highlight verde elétrico.
7. CTA final + footer de uma linha.

### 6.2 Landing C "Caderno"
1. Nav carimbo (wordmark com sombra dura + CTA verde).
2. Hero: Anton em 3 linhas coloridas (marrom/verde/outline) + asterisco 3D extrudado + stickers em parallax.
3. Fita marquee colorida (rosa/lima/amarelo).
4. Capítulos: 3 blocos de cor alternados (verde profundo/cream) numerados em Anton: "01 Dinheiro" (Finanças/Patrimônio), "02 Corpo e mente" (Corpo/Mente/Tempo), "03 Futuro" (Futuro/Carreira/Experiências).
5. "O coach escreve": texto do coach como bilhete datilografado com stickers de dados nas margens.
6. CTA final estilo carimbo + footer.

### 6.3 Dashboard A "Estúdio"
- Rail esquerdo monocromo com numeração editorial (sem 11 cores).
- Hero: saudação editorial curta + 78 gigante + delta elétrico + stack de cards 3D com tilt (saldo/poupança/despesas).
- Faixa do coach: 1 frase narrativa + ação primária (herda o conceito Coach-led do v4 com pele nova).
- Evidência: grid denso com sparklines, orçamentos (regra de cor <=70/85), agenda.
- Banda cross-módulo fechando a dobra.

### 6.4 Dashboard C "Caderno"
- Sem sidebar: masthead tipo jornal ("QUARTA, 23 JULHO · EDIÇÃO 214") com navegação por etiquetas coloridas.
- Hero: score 78 em selo circular carimbado + headline Anton do dia.
- Coach como bilhete: bloco amarelo, canto dobrado, sombra dura.
- KPIs como stickers rotacionados na margem; listas com borda 2px e check de carimbo.
- Gráfico de barras chapado verde/lima com tooltips estilo etiqueta.

Ambos os dashboards desktop-first, colapso simples abaixo de 900px. Mobile pixel-perfect fica fora da rodada 1.

## 7. Execução

### Estrutura de arquivos

```
prototypes/poc-v5/
├── a-estudio/
│   ├── landing.html
│   └── dashboard.html
├── c-caderno/
│   ├── landing.html
│   └── dashboard.html
└── shared/
    └── mock-data.js
```

Cada HTML é autocontido (CSS/JS inline, apenas CDNs externos). Sem build.

### CDNs

| Lib | Uso |
|---|---|
| Three.js 0.160+ | Sistema orbital (A), asterisco extrudado (C) |
| GSAP 3 + ScrollTrigger | Reveals, counter do score, parallax |
| Lenis | Smooth scroll nas landings |
| Google Fonts | Space Grotesk + Inter (A) · Anton + Poppins (C) |

O 3D é progressive enhancement: se um CDN falhar, a página degrada para versão estática sem quebrar.

### Git
- Branch `poc/ds-v5` a partir de `redesign/visual-refresh-v4`.
- Commits por protótipo.

## 8. Critérios de julgamento (rodada 1)

1. **Identidade:** dá pra reconhecer o SyncLife de longe, sem logo?
2. **Densidade:** o dashboard aguenta dados reais sem virar bagunça?
3. **3D:** agrega ou é enfeite que cansa na segunda visita?
4. **Longevidade:** vai parecer datado em 2 anos?
5. **Escala:** a linguagem estica pras 45 telas e 4 padrões de anatomia?
6. **Anti-genérico:** passa no teste "não parece template/feito por IA"?

## 9. Rodada 2 e pós-decisão

- Finanças + Coach na direção vencedora (+2 protótipos).
- O spec da vencedora vira a semente do `DESIGN-SYSTEM-v5.md` (tokens, tipografia, motion, anatomia).
- Só então se decide o destino do trabalho v4 (aproveitar anatomia Coach-led com pele nova, ou recompor).

## 10. Fora de escopo

- Mobile pixel-perfect nos protótipos.
- Integração no app Next / migração das 45 telas.
- Decisão sobre o merge ou descarte da branch v4.
- Fontes comerciais das referências (Haffer, Sequel Sans): usamos equivalentes Google Fonts.

## 11. Riscos

- **Performance 3D**: cenas Three.js precisam de `requestAnimationFrame` com pause quando fora do viewport; alvo 60fps em notebook comum.
- **CDN offline**: fallback estático embutido (seção 7).
- **Vício de mockup**: dados mockados idênticos e realistas nas duas direções para a comparação ser do estilo, não do conteúdo.
