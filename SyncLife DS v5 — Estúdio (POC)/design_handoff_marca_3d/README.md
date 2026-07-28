# Handoff: Marca SyncLife 3D — Bússola em cromo líquido

## Overview

Nova identidade do símbolo SyncLife: a "Bússola da Vida" deixa de ser um desenho vetorial hairline
e passa a ser um **instrumento renderizado** em cromo líquido — aro espelhado com horizonte
refletido, mostrador rebaixado escuro, marcações gravadas, agulha facetada roxa e pivô usinado.

O pacote cobre:

- o símbolo (5 tamanhos, escuro e claro);
- o lockup com o wordmark `Sync` + `Life`;
- ícone de app iOS/Android, favicon, splash;
- **ícones das 8 áreas** (novidade: cada área agora tem ícone, o que revoga em parte a regra E-09 do DS v5);
- set de 12 ícones de UI no mesmo material;
- o comportamento da agulha (busca com overshoot, corpo fixo).

Substitui, no repositório `thiagotsf87/sync_life`:

| Arquivo atual | O que muda |
|---|---|
| `web/src/components/shared/logo.tsx` | ícone de 3 elipses em tile com gradiente verde→azul → bússola em cromo |
| `web/public/icons/icon.svg` | curva verde/ciano/azul em tile → bússola em cromo sobre tile escuro |
| `web/public/manifest.json` | `theme_color: #10b981` → `#6840ff`; `background_color: #03071a` → `#151313` |
| `web/src/components/shell/icons.tsx` | ícones de UI e de módulo → set gravado (ver §Ícones) |

## About the Design Files

Os arquivos deste pacote são **referências de design feitas em HTML/CSS** — protótipos que mostram
aparência e comportamento pretendidos, **não código de produção para copiar direto**. A tarefa é
**recriar esses designs no ambiente já existente do codebase** (Next.js + React + Tailwind, em
`web/`), usando os padrões e utilitários que já estão lá.

Uma observação específica: o símbolo é feito **inteiramente em CSS/SVG** (gradientes cônicos,
box-shadows, clip-path) e não em bitmap. Isso é intencional — ele escala, muda de estado (a agulha
gira) e pesa quase nada. Ao portar, mantenha essa abordagem: um componente `<Compass size={n} />`
com as camadas descritas abaixo, não um PNG. Só exporte bitmap onde a plataforma exige
(favicon `.ico`, ícones de loja).

## Fidelity

**High-fidelity (hifi).** Cores, tipografia, espaçamentos, gradientes, sombras, durações e easings
abaixo são finais e devem ser reproduzidos com precisão. Onde o protótipo usa porcentagens
(agulha, pivô, mostrador), elas são relativas ao tamanho da peça e devem continuar relativas —
é o que faz o símbolo escalar sem redesenho.

## Design Tokens

### Cor (DS v5 — inalterado)

```css
--bg:#151313; --s1:#201d1d; --s2:#2a2727;
--line:rgba(255,255,255,.08); --line-h:rgba(255,255,255,.18);
--t1:#f4f4f4; --t2:#b8b8b8; --t3:#817f7f;
--bg-light:#f4f4f4; --s1-light:#ffffff; --s2-light:#eceaea;
--line-light:rgba(21,19,19,.12); --t1-light:#151313; --t2-light:#4f4c4c; --t3-light:#6b6868;
--paper:#f4f4f4; --ink:#151313; --ink2:#4f4c4c; --pline:rgba(21,19,19,.14);
--roxo:#6840ff;  /* ação, marca, agulha */
--roxo-h:#7a55ff;
--ele:#a1ff62;   /* positivo, dado vivo, marcação acesa (só no escuro) */
--coral:#f84131; /* alerta, voz do coach */
--ease:cubic-bezier(.625,.05,0,1);
```

### Cores próprias da marca 3D

| Papel | Valor |
|---|---|
| Agulha norte, faceta clara (peça grande) | `#9c7dff` |
| Agulha norte, faceta escura (peça grande) | `#5730e0` |
| Agulha norte, faceta clara (peça pequena) | `#ac90ff` |
| Agulha norte, faceta escura (peça pequena) | `#5d33ea` |
| Agulha sul, faceta clara (cromo) | `#cdc8c2` |
| Agulha sul, faceta escura (cromo) | `#3b3735` |
| Pivô, alto / baixo (cromo pequeno) | `#e8e4e0` / `#4a4644` |
| Marcação acesa, cromo pequeno | `#b8ff7a` |
| Marcação acesa, versão clara | `#5a2fe6` |

### Tipografia

| Papel | Fonte |
|---|---|
| Display, números, wordmark | Space Grotesk 400/500/700 |
| Body, labels | Inter 400/500/600 |
| Caligrafia (só voz do coach) | Caveat 600/700 |

Wordmark: Space Grotesk **700**, `letter-spacing:-.03em`. `Sync` em `--t1` (ou `--ink` no claro),
`Life` em `--roxo`.

### Raios

| Uso | Valor |
|---|---|
| Símbolo | `50%` (sempre círculo) |
| Tile iOS (squircle) | `22.5%` do lado |
| Tile Android maskable | `50%` |
| Tile de ícone de UI 44px | `13px` |
| Tile de ícone de área | círculo (é a própria bússola) |

## Anatomia do símbolo

Cinco camadas empilhadas, todas dentro de um quadrado de lado `--sz`:

```
.bs      position:relative; width/height:var(--sz); border-radius:50%; isolation:isolate
├ .rim   inset:0; border-radius:50%              ← aro cromado (conic-gradient + shadows)
├ .dial  inset:8.5%; border-radius:50%; overflow:hidden; perspective:640px
│  ├ .nsh  sombra projetada da agulha (blur 6px, opacity .5, offset 3%/4%)
│  ├ svg.tk  viewBox="0 0 200 200"  ← 24 marcações
│  ├ .nd   inset:0; transform:rotate(var(--rot))  ← grupo da agulha
│  │   ├ .nh  norte: top 8%, height 42%, width var(--nw,11.5%), left 50%, translateX(-50%)
│  │   │      clip-path:polygon(50% 0,100% 100%,0 100%)
│  │   └ .sh  sul:   top 50%, height 42%, mesma largura
│  │          clip-path:polygon(0 0,100% 0,50% 100%)
│  └ .pv   pivô: 12.5% × 12.5%, centrado, border-radius:50%
├ .gl    inset:0; reflexo/glare (pointer-events:none)
└ .sw    inset:0; varredura de luz no hover (pointer-events:none)
```

### Marcações (`svg.tk`, viewBox 0 0 200 200, centro 100,100)

- **8 maiores** (as áreas), a cada 45°, começando no norte (01 Finanças) no sentido horário.
  Cada uma é um par de linhas que simula gravação:
  - `line.d` (fundo do sulco): `x1=100 y1=13 x2=100 y2=31.6`, stroke `rgba(0,0,0,.8)`, width `5.4`
  - `line.l` (quina iluminada): `x1=100 y1=14.3 x2=100 y2=30.4`, stroke `#ffffff`, width `5.4`
  - ambas `stroke-linecap:round`, dentro de `<g transform="rotate(i*45 100 100)">`
- **16 menores**, a cada 15° pulando os múltiplos de 45°:
  `x1=100 y1=17 x2=100 y2=25`, stroke `rgba(255,255,255,.6)`, width `2.4`
- **Marcação acesa**: a do rumo em foco recebe `stroke:#b8ff7a` na linha `.l`. Nas peças grandes
  ela leva `filter:drop-shadow(0 0 6px rgba(161,255,98,.55))`; nas pequenas o filtro sai
  (borra em tamanho pequeno) e fica só a cor.

### Material cromo — peça grande (> 54px)

```css
.rim{
  background:conic-gradient(from 196deg,#f3f0ec 0%,#8c8781 9%,#2a2725 20%,#0f0e0e 29%,
    #5d5854 40%,#d9d4ce 50%,#f7f5f2 55%,#7d7873 66%,#1a1817 78%,#454140 88%,#cdc8c2 96%,#f3f0ec 100%);
  box-shadow:0 0 0 1px rgba(255,255,255,.2), inset 0 2px 0 rgba(255,255,255,.7),
    inset 0 -3px 4px rgba(0,0,0,.7), 0 30px 66px -22px rgba(0,0,0,.9);
}
.dial{
  background:conic-gradient(from 200deg,#2b2827 0%,#0f0e0e 22%,#6b6763 44%,#cfcac4 50%,
    #5e5a57 58%,#131211 80%,#2b2827 100%);
  box-shadow:inset 0 4px 14px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.4);
}
.gl{background:linear-gradient(150deg,rgba(255,255,255,.4) 0 12%,transparent 34%),
    radial-gradient(46% 30% at 74% 88%,rgba(255,255,255,.18),transparent 74%);}
.nh{background:linear-gradient(102deg,#9c7dff 0 47%,#5730e0 47% 100%);
    filter:drop-shadow(0 2px 4px rgba(0,0,0,.7));}
.sh{background:linear-gradient(102deg,#cdc8c2 0 47%,#3b3735 47%);}
.pv{background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.9),#8d8781 52%,#100f0f);
    box-shadow:0 2px 4px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.14);}
/* marcações nesta escala: --tkd rgba(0,0,0,.5) · --tkl rgba(255,255,255,.7) · --mn rgba(255,255,255,.42) */
```

### Material cromo — peça pequena (≤ 54px): **o contraste manda, o material cede**

Esta é a parte crítica do handoff. Abaixo de ~54px o cromo de meio-tom vira ruído e o símbolo
desaparece (foi o defeito corrigido nesta rodada). A regra: **aro de alto contraste + mostrador
escuro chapado**, agulha mais grossa, marcações mais grossas, zero blur.

```css
/* classe .s-sm, aplicada quando a peça mede ≤54px */
.dial{inset:11.5%}
--nw:16.5%;                        /* agulha engrossa */
.tk .d,.tk .l{stroke-width:9.5}
.pv{width:17%;height:17%}
.nsh,.sw{display:none}             /* sombra projetada e varredura saem */
.nh{filter:none}
.tk .t.on .l{stroke:#b8ff7a}       /* sem drop-shadow */

.rim{background:conic-gradient(from 200deg,#fbfaf8 0 5%,#57524e 14%,#0b0a0a 26%,#918c86 39%,
  #f2efeb 50%,#6b6663 61%,#100f0f 75%,#b9b4ae 89%,#fbfaf8 100%);
  box-shadow:0 0 0 1px rgba(255,255,255,.6), inset 0 1.5px 0 #fff,
    inset 0 -1.5px 2px rgba(0,0,0,.8), 0 6px 14px -4px rgba(0,0,0,.95);}
.dial{background:radial-gradient(120% 120% at 32% 16%,#2c2927,#0e0d0d 72%);
  box-shadow:inset 0 2px 5px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.4);}
.gl{background:linear-gradient(150deg,rgba(255,255,255,.55) 0 9%,transparent 26%);}
/* marcações: --tkd rgba(0,0,0,.8) · --tkl #ffffff · --mn rgba(255,255,255,.6) */
```

```css
/* classe .s-xs, aplicada quando a peça mede ≤22px (favicon, lockup mínimo) */
.dial{inset:16%}
--nw:22%;
.tk .d,.tk .l{stroke-width:14}
.pv{width:23%;height:23%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.gl{display:none}
```

### Degradação (thresholds exatos, medidos no lado da peça)

| Largura | O que sai |
|---|---|
| `< 54px` | as 16 marcações menores; entra o modo `.s-sm` |
| `< 34px` | as marcações maiores de índice ímpar (sobram 4: N/L/S/O) |
| `≤ 22px` | todas as marcações menos a do norte; entra o modo `.s-xs` |

Ordem conceitual de perda: **reflexo → marcações menores → aro → núcleo.** Em 16px sobram aro
brilhante + agulha roxa + marcação norte, e isso ainda é a marca.

### Versão clara (cerâmica) — bandas claras, impressão, mono

```css
.rim{background:radial-gradient(115% 115% at 28% 14%,#fff,#eae7e3 42%,#cbc7c2 78%,#b4b0ab 100%);
  box-shadow:0 0 0 1px rgba(21,19,19,.1), inset 0 2px 0 #fff,
    inset 0 -2px 3px rgba(21,19,19,.28), 0 26px 56px -24px rgba(21,19,19,.55);}
.dial{background:radial-gradient(120% 120% at 32% 18%,#fff,#efece8 48%,#d6d2cd);
  box-shadow:inset 0 3px 9px rgba(21,19,19,.22), inset 0 -1px 0 #fff;}
/* marcações: --tkd rgba(255,255,255,.85) · --tkl rgba(21,19,19,.5) · acesa #6840ff (nunca elétrico) */
/* agulha sul: #c9c4bf → #8d8883 · pivô: #dedad6 → #8b8681 */
```

## Interactions & Behavior

### A agulha (única parte que se move — o corpo **nunca** gira)

- Rotação = rumo da área em foco: `rot = i * 45°`, `i` = índice da área (01 Finanças = 0 = norte).
- A rotação vive numa CSS custom property herdada (`--rot` no `<html>` no protótipo), então
  **todas** as bússolas da página apontam junto. No app, prefira um contexto React
  (`FocusAreaProvider`) que escreve `--rot` num escopo, não no documento inteiro.
- Transição: `transform .52s cubic-bezier(.625,.05,0,1)`.
- **Overshoot em duas etapas:** vai para `alvo + 9°`, e depois de `330ms` assenta em `alvo`.
- **Inclinação em perspectiva durante o trajeto:** enquanto viaja, o grupo da agulha ganha
  `rotateX(16deg)` (o `.dial` tem `perspective:640px`); ao assentar, volta a 0.
- A marcação de destino acende `260ms` após o início do movimento (a luz chega depois da agulha).
- A sombra projetada (`.nsh`) acompanha a mesma rotação e a mesma transição.

### Varredura de luz (hover)

Assinatura do material, inspirada no componente de cartão do jeton.com. Só em peças > 54px:

```css
.sw{background:linear-gradient(112deg,transparent 32%,rgba(255,255,255,.3) 46%,
  rgba(255,255,255,.06) 53%,transparent 66%); transform:translateX(-125%); opacity:0}
@keyframes sweep{0%{transform:translateX(-125%);opacity:0}18%{opacity:1}
  100%{transform:translateX(125%);opacity:0}}
.bs:hover .sw{animation:sweep 1.15s var(--ease)}
```

### Regras de comportamento (herdadas do DS v5, §5.4)

- **A bússola nunca mente:** só aponta uma área quando existe dado real de foco (o briefing do
  dia). Sem dado, aponta o norte.
- **Nunca como spinner / loading.** A bússola aponta, não gira à toa.
- Agulha sempre roxa; sul sempre apagado; **coral nunca**.

### Reduced motion

`prefers-reduced-motion: reduce` → sem transição, sem overshoot, sem varredura, sem inclinação:
a mudança de rumo é instantânea e a interação continua funcionando. O HTML nasce com valores
finais; toda animação fica escopada sob a classe `.anim`, adicionada por JS só quando não há
reduce (regra E-02 do DS).

## State Management

Mínimo necessário:

| Estado | Tipo | Origem |
|---|---|---|
| `focusArea` | `0..7 \| null` | briefing do dia (IA). `null` → aponta o norte |
| `rot` | `number` (deg) | derivado: `focusArea * 45` |
| `settling` | `boolean` | interno, dura 330ms, controla o `rotateX(16deg)` |
| `litTick` | `0..7` | derivado de `focusArea`, com 260ms de atraso |

Sem data fetching próprio: o componente recebe `focusArea` de fora.

## Screens / Views (do protótipo)

O arquivo `marca-3d.html` é uma **página de especificação**, não uma tela de produto. Seções:

1. **Cabeçalho** — manchete + subtítulo + anotação manuscrita.
2. **01 · as três direções** — os três materiais explorados lado a lado (vidro fumê, titânio
   escovado, cromo líquido) + versão clara. **Cromo líquido é o padrão** (selo `PADRÃO`
   em `--ele`); vidro e titânio ficam registrados como exploração e **não** são variantes de uso.
3. **02 · comportamento** — bússola grande (360px) + lista das 8 áreas como botões; clicar move
   a agulha. Uma frase de foco (`aria-live="polite"`) narra o dado.
4. **03 · escala e degradação** — escada 96 / 64 / 48 / 32 / 24 / 16px nos quatro materiais.
5. **04 · aplicações** — tile iOS escuro e roxo, Android maskable circular claro e escuro,
   favicon 16px em mock de aba, lockups escuro e claro, splash 9:16.
6. **05 · as 8 áreas** — os ícones de área (grid 4×2).
7. **06 · ícones de UI** — 12 ícones.
8. **Folha final (banda papel)** — as regras do DS que precisam ser reescritas.

### Aplicações — medidas

| Aplicação | Tile | Símbolo dentro |
|---|---|---|
| iOS escuro | 104px, raio 22.5%, `radial-gradient(120% 120% at 30% 20%,#26222b,#100e11)` | 72px |
| iOS roxo | 72px, raio 22.5%, `radial-gradient(120% 120% at 28% 18%,#8a68ff,#5a2fe6 58%,#3d17b8)` | 50px, versão clara |
| Android maskable claro | 104px círculo, `radial-gradient(120% 120% at 30% 20%,#fff,#e7e4e0)` | 76px |
| Android maskable escuro | 72px círculo | 52px |
| Favicon | — | 15–16px, modo `.s-xs` |
| Lockup grande | — | 30px + wordmark 30px, **gap 11px**, alinhados no centro vertical |
| Lockup pequeno | — | 22px + wordmark 21px, gap 11px |
| Splash | 9:16, raio 14px, `radial-gradient(90% 60% at 50% 38%,#221e28,#131111 70%)` | 96px + wordmark 20px, gap 18px |

## Ícones

### Ícones das 8 áreas — **revoga em parte a regra E-09**

O DS v5 proibia ícone por módulo (só índice numérico). Isso muda: **cada área passa a ter ícone,
mas nenhuma área tem cor própria.** O que diferencia é geometria e rumo, nunca matiz.

Cada ícone **é a própria bússola em cromo pequeno** (72px, classes `.s-sm`), com três diferenças:

1. sem agulha e sem pivô;
2. as 16 marcações menores são removidas — ficam as 8 maiores, com `stroke-width:7`
   (a acesa vai a `8.5`);
3. a marcação do rumo daquela área (`i * 45°`) está **acesa** (`#b8ff7a`);
4. no lugar da agulha, no centro, entra a **primitiva geométrica** da área.

A primitiva vive num `<svg viewBox="0 0 56 56">` posicionado sobre o mostrador em
`left:-20%; top:-20%; width:140%; height:140%` (isso amplia a primitiva sem redesenhá-la), com
`stroke-width:2`. Padrão de gravação em todas: um traço escuro `rgba(0,0,0,.75)` deslocado
~0.9px **abaixo** e o traço claro `rgba(255,255,255,.9)` por cima. Roxo (`#9d7dff`) só onde a
área tem um "dado vivo".

| # | Área | Primitiva (coordenadas no viewBox 56) |
|---|---|---|
| 01 | Finanças | disco cheio roxo, `circle cx=28 cy=28 r=7` |
| 02 | Futuro | anel roxo, `circle r=7.4` (+ sulco escuro em `cy=28.9`) |
| 03 | Tempo | anel claro `r=7.6` + ponteiro roxo `M28 24.2 V28 h3.4` |
| 04 | Corpo | pill claro `x=24.2 y=21 w=7.6 h=14 rx=3.8` + nível roxo `M24.6 30.4 h6.8` |
| 05 | Mente | três círculos ascendentes: `(20.9,33.4) r3.5` e `(28,28) r3.5` claros, `(35.1,22.6) r3.8` roxo cheio |
| 06 | Patrimônio | quadrado claro `x=21.4 y=21.4 w=13.2 h=13.2 rx=2.4` |
| 07 | Carreira | chevron roxo `M21.4 30.6 L28 24.4 L34.6 30.6` |
| 08 | Experiências | losango claro `M28 20.6 L34.6 28 L28 35.4 L21.4 28 Z` |

**Todas as 8 primitivas têm o mesmo peso visual** (~19–20px de bbox renderizada dentro do tile de
72px). Isso é requisito, não estética: qualquer ícone novo de área precisa passar no teste de
"colocar lado a lado com Finanças e Patrimônio e não sumir".

### Ícones de UI

Tile 44px, raio 13px, `radial-gradient(120% 120% at 30% 18%,#2c2927,#0f0e0e 74%)` com
`inset 0 1.5px 0 rgba(255,255,255,.5)`, `inset 0 -1.5px 2px rgba(0,0,0,.85)`,
`0 0 0 1px rgba(255,255,255,.16)`, `0 10px 20px -10px rgba(0,0,0,.95)`.

Desenho em `viewBox 0 0 56 56`, `stroke-width:2.6`, `linecap/linejoin:round`, sempre em duas
passadas — **o mesmo caminho duas vezes**, a escura 0.9px abaixo da clara:

```
.eng { stroke: rgba(0,0,0,.6) }   ← gravação, desenhada primeiro, deslocada +0.9px em Y
.top { stroke: rgba(255,255,255,.82) }  ← quina iluminada, por cima
.acc { stroke: #6840ff }  ← substitui .top quando a ação é primária
.accf{ fill:   #6840ff }
```

Os 12: adicionar, confirmar, fechar, avançar, abrir fora, buscar, agenda, dados, ajustes, perfil,
carteira, ia. Cada um usa roxo apenas quando é ação primária ou dado vivo (adicionar, abrir fora,
dados, ajustes, carteira, ia); os neutros ficam em branco gravado.

## Assets

Nenhum bitmap. Tudo é CSS/SVG gerado, incluindo o grain (noise SVG em data-URI, `opacity .04`,
`z-index 90`, `pointer-events:none`).

Fontes via Google Fonts: `Space+Grotesk:wght@400;500;700`, `Inter:wght@400;500;600`,
`Caveat:wght@600;700`.

Para exportar bitmaps obrigatórios de plataforma (favicon `.ico`, ícones de loja, splash Android),
renderize o componente nos tamanhos pedidos e capture — não redesenhe.

## O que muda no DS v5 (aplicar em `DESIGN-SYSTEM-v5.md`)

| Regra | Mudança |
|---|---|
| **§5.1** | Material oficial: cromo líquido. Vidro fumê e titânio escovado ficam como exploração, não variantes. Versão clara = cerâmica off-white (impressão e mono). |
| **E-09** | Revogada em parte: módulo passa a ter ícone além do índice. Continua proibida a **cor de módulo** — mesmo material para as 8, muda geometria e rumo. |
| **E-06** | Exceção de marca: gradiente segue proibido em superfícies de seção, mas marca e ícones usam gradiente **como iluminação** (aro, bisel, faceta). Nenhuma cor nova. |
| **§5.2** | Construção atualizada: aro torneado, mostrador rebaixado, 24 marcações (8 maiores), agulha facetada em 2 planos, pivô usinado. O pivô deixa de ser "furo na cor do fundo" e passa a ser cabeça de eixo. |
| **§5.3** | Nova ordem de degradação: reflexo → marcações menores → aro → núcleo, com os thresholds de 54 / 34 / 22px. |

Regras de copy que continuam valendo: sem em-dash (—), sentence case, "você" nunca "o usuário",
sem emoji em chrome, microcopy seca.

## Files

| Arquivo | O que é |
|---|---|
| `marca-3d.html` | a especificação viva: os três materiais, o comportamento da agulha, a escada de tamanhos, as aplicações, os ícones de área e de UI. **Fonte de verdade visual.** |
| `DESIGN-SYSTEM-v5.md` | o DS v5 completo (tokens, motion, anatomia das telas, regras E-01…E-12). Ler §2, §3 e §5 antes de implementar. |

Abra `marca-3d.html` no navegador: passe o mouse nas peças grandes (varredura), clique nas 8 áreas
(agulha), e reduza o zoom para conferir a degradação.

## Ordem sugerida de implementação

1. `<Compass size focusArea variant="chrome|ceramic" />` com as 5 camadas e os 3 modos de
   tamanho (`md` / `sm` ≤54 / `xs` ≤22). Um só componente resolve marca, favicon e lockup.
2. `<Logo />` (`web/src/components/shared/logo.tsx`) = `Compass` 30px + wordmark, gap 11px.
   Remover o tile com gradiente verde→azul.
3. `web/public/icons/icon.svg` + `manifest.json` (`theme_color #6840ff`,
   `background_color #151313`).
4. `<AreaIcon area={0..7} />` e trocar a identificação de módulo na modbar (ícone **+** índice).
5. Set de ícones de UI em `web/src/components/shell/icons.tsx`.
6. `FocusAreaProvider` ligando o briefing do dia ao `--rot`.
