# HANDOFF · Redesign SyncLife → DS v5 "Estúdio"

> Arquivo rolling: entrada mais recente no topo. Atualizado ao fim de TODA sessão, antes do commit final.
> Plano do programa: `~/.claude/plans/quirky-noodling-snail.md` (aprovado 2026-07-28). Branch: `poc/ds-v5`.
> Regras invioláveis: fidelidade ao `DESIGN-SYSTEM-v5.md` (protótipos vencem em divergência); protótipo → aprovação
> explícita do usuário → implementação → teste de identidade; mobile = protótipo dedicado por tela; handoff toda sessão.

## Retomada rápida (pra nova sessão)

- **Branch:** `poc/ds-v5` · último commit = r10. Servir: `python -m http.server 8123` em `prototypes/v5/` → hub em `http://localhost:8123/`.
- **Dois protótipos de landing:** `landing/landing.html` = **r4 segura** (congelada, tag `poc-landing-r4`) · `landing/landing-viva.html` = **r5→r13 em evolução** (é onde o trabalho acontece).
- **Já aprovado pelo usuário:** marca 3D cromo líquido (entrega dele, DS §5) · bússola WebGL viva (DS §5.6) · seção "As oito áreas" (hover→agulha) · direção da r11/r12 (animações + fundo roxo da IA).
- **Aguardando veredito:** r13 (aurora global azul/lilás/roxo fixa atrás de toda área clara, sem coral; palcos SEM pin — coreografia em scrub durante a travessia, a tela nunca congela; wordmark menor e inteiro).
- **Fila combinada:** h1 do hero com SplitText na entrada · mobile dedicado da landing-viva · depois Onda 0 fase de implementação em `web/` (Fundação A + `<Compass />`).
- **Stack decidida:** three.js (peça viva) + GSAP (landing) + motion.dev (app React, futuro); anime.js dispensada. Token pendente: verde-delta no claro `#44a616` (agora também no ticker/marquee).

## Status das ondas

| Onda | Escopo | Protótipo | Aprovação | Implementação | QA identidade |
|---|---|---|---|---|---|
| 00 | Landing v2 + marca 3D | ✅ viva r13 pronta (r4 segura preservada) | ⏳ **aguardando veredito da r13** (marca 3D, bússola WebGL, oito áreas e direção r11/r12 já aprovadas) | – | – |
| 01 | Público + auth (pricing, login, cadastro, senhas, onboarding) | – | – | – | – |
| 02 | Chrome do app + Dashboard (3 telas) | – | – | – | – |
| 03 | Coach | – | – | – | – |
| 04 | 01 Finanças (8 telas, 2 lotes) | – | – | – | – |
| 05 | 02 Futuro (4) | – | – | – | – |
| 06 | 03 Tempo (6) | – | – | – | – |
| 07 | 04 Corpo (6) | – | – | – | – |
| 08 | 05 Mente (6) | – | – | – | – |
| 09 | 06 Patrimônio (6) | – | – | – | – |
| 10 | 07 Carreira (5) | – | – | – | – |
| 11 | 08 Experiências (7) | – | – | – | – |
| 12 | Conquistas (2) | – | – | – | – |
| 13 | Configurações (7) | – | – | – | – |
| 14 | Varredura final (modais, assets, remoção v3, DS v5.1) | – | – | – | – |

---

## 2026-07-30 · Sessão 13 — Onda 0, r13: aurora global sem coral, palcos sem pin, wordmark inteiro

**Feedback do usuário na r12:** (1) tonalidade avermelhada na sombra do fundo do hero — manter só azul/lilás/roxo, e levar o movimento da sombra pra TODAS as telas de fundo branco; (2) transições dos palcos muito melhores, mas as telas ficam PARADAS até as transições acabarem — que aconteçam com a tela em movimento; (3) "SyncLife" no final grande demais e com a base cortada, lendo "sunklife".

**Feito (em `landing-viva.html`):**
- **Aurora global:** o canvas saiu do hero e virou `.aurora-fix` (position:fixed, z-index:-1, blur 56px, opacity .65) atrás de TODA área clara — hero, oito áreas, press, pricing e FAQ ganham a sombra viva; as bandas escuras/roxa cobrem naturalmente. Paleta nova SÓ azul/lilás/roxo: roxo 104,64,255 · azul 74,108,255 · lilás 165,138,255 · roxo profundo 82,39,230 (coral E verde saíram do fundo). Gotcha: canvas dentro de wrapper fixed mede o pai = viewport, `size()` original funciona sem mudança.
- **Palcos SEM pin (a tela nunca congela):** pins removidos por completo; as coreografias viraram scrub na TRAVESSIA da seção (produto `top 82%`→`top -12%`, IA `top 78%`→`top -18%`): as peças voam/assentam e as bolhas dão pop ENQUANTO a seção atravessa a viewport. Cabeçalhos seguem como once-tweens na aproximação. Página encolheu ~3k px (sem pin spacers) — resolve também o "blocos espaçados". Transições próprias por palco mantidas (voo × pop de mensageiro).
- **Wordmark inteiro:** clamp 110-250px/lh .8 + translateY(9%) → clamp 72-168px/lh .95, sem corte e com padding-bottom 40px (o descendente do y aparece completo; adeus "sunklife"). Scrub de subida mantido (yPercent 34).
- QA (`?v=r13` contra cache): 0 pins, aurora fixa medida, console limpo desktop + mobile 390 (0 pins, canvas 125px de bitmap), doc 10.9k→6.9k px; screenshots da travessia (peças montando com a seção em movimento), pricing com lilás atrás e wordmark completo.

**Pendências:** ⏳ veredito da r13; fila: SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 12 — Onda 0, r12: palcos nunca chegam vazios + transição própria por palco

**Feedback do usuário na r11:** GOSTOU das animações e do fundo roxo da IA. Problemas: blocos muito espaçados, transições demoram a começar (a tela fica toda preta/roxa antes da primeira transição) e produto e IA tinham as MESMAS transições.

**Diagnóstico (Playwright, medido):** com tudo dentro do scrub pinado, no início do pin h2/score/meta estavam com opacity 0 → banda 100% vazia na chegada; a manchete sozinha consumia ~430px de scroll. Pins longos (200%/240% = 1800/2160px) espaçavam os blocos.

**Feito (em `landing-viva.html`):**
- **A seção nunca chega vazia:** cabeçalho (`top 75%`) + score/coach (`top 52%`) do produto e cabeçalho (`top 72%`) + feats (`top 45%`) da IA entram como once-tweens NA APROXIMAÇÃO, antes do pin. Verificado no início do pin: h2/score/brief opacity 1 e a peça seguinte já a 0.09 (ação no primeiro pixel).
- **Pins encurtados:** produto 200%→130% (1170px), IA 240%→150% (1350px); respiros finais .5→.35/.3.
- **Transição própria por palco:** produto mantém o VOO com encaixe (`back.out`, 3 peças restantes no pin); IA agora tem POP DE MENSAGEIRO — bolhas nascem da cauda (scale .55, origin no canto correto por autor, `back.out(1.7)`), selo CARIMBA (scale 1.5 + rotação assentando) com check se desenhando, input sobe por último.
- QA: console limpo desktop e mobile; mobile segue 0 pins com nota "se monta sozinho" oculta. Gotcha de QA novo: o http.server serve com cache → validar mudanças com query-string (`?v=r12`), senão o browser reusa o HTML antigo e os pins medem os valores da rodada anterior.

**Pendências:** ⏳ veredito da r12; fila: SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 11 — Onda 0, r11: do produto ao final REFEITO (palcos pinados, à la refs)

**Feedback do usuário na r10 (duro):** sequência pós-produto ruim; combinação de cores do fundo da IA ruim; texto com "termos meio estranhos"; pricing e FAQ ruins. Refazer do produto até o final considerando Phamily/Jeton/Osmo: transições de seção excelentes, componentes se ENCAIXANDO conforme o scroll, a tela se TRANSFORMANDO ao descer. Conteúdo vendável e atrativo.

**Lição registrada:** a r10 ainda era "seção com entrada animada"; os refs fazem outra coisa: pin + scrub (a tela segura e se transforma com o scroll). E copy de landing vende benefício direto, sem metáfora literária ("uma terça de verdade", "o dia chega lido", relógios-fantasma 07:12/12:47 = reprovados).

**Feito (em `landing-viva.html`), do `#produto` ao rodapé:**
- **Palco 1 · O produto (pin ~200% de scroll):** h2 vendável "Chega de oito apps abertos. Aqui, tudo se encaixa." fixa à esquerda; à direita **o painel se monta peça a peça com o scroll**: 5 cards (Score 74 · Coach briefing · Finanças com lazer estourando o limite · Agenda · Meta Viagem Itália 68%) voam de fora com rotação e **assentam com overshoot** (`back.out`), grid limpo no final. Números canônicos da r10 preservados (essa parte não foi reclamada).
- **Palco 2 · IA (pin ~240%):** aurora2 **deletada** (canvas+JS); banda **ROXA SÓLIDA** (radial sutil #7c58ff→#5227e6, cor de marca à la Jeton) com texto branco e em elétrico. h2 "Uma IA que conhece sua vida. E resolve por você." A **conversa avança bolha a bolha com o scroll** (scrub, sem timers; ROTEIRO/IO removidos), bolhas do usuário em #171515 e da IA em branco (contraste real), selo "Ação executada" com check se desenhando no fim do pin.
- **Pricing:** tabela → **2 cartões** (Free branco · PRO escuro com tag elétrica "RECOMENDADO"), listas de 5-6 itens com check, CTA full-width em cada, microcopy "Sem cartão de crédito no teste" / "Grátis pra sempre, de verdade". Coerência nova: Free inclui "Coach IA com briefing diário" (casa com a pill do hero "Coach IA em todos os planos"); PRO = "Consultor IA que executa por você".
- **FAQ:** editorial 2 colunas (h2 + sub à esquerda, accordion à direita).
- **Final:** CTA + **wordmark gigante** Sync(branco)Life(roxo) clamp 110-250px cortado na base, subindo com scrub (item da fila Jeton, entregue).
- **Infra:** pins só desktop ≥1024 + sem reduce; `.rv` é removido via JS dentro dos palcos (o scrub é o único condutor); mobile/no-GSAP = seções estáticas completas (E-02); nota "role: o painel se monta sozinho" some no mobile; manchetes SplitText agora só em `.areas8 h2, .precos h2` (nos palcos quem conduz é o pin).
- QA: console 100% limpo (desktop e 390px); pins medidos (prod 2649→4449, ia 5420→7580); montagem verificada em 3 estágios do scrub; conversa scrubada verificada; mobile sem pins com 5 cards + 4 bolhas + 2 pcards presentes.

**Pendências:** ⏳ veredito da r11; fila: SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 10 — Onda 0, r10: a metade de baixo vira história ("uma terça de verdade")

**Feedback do usuário na r9 (escopo: da seção O Produto pra baixo):** informações não casam entre seções; animações não ficaram boas; fundo da seção IA ruim; pedir storytelling conectado ao tema e ao objetivo da ferramenta.

**Diagnóstico (QA visual + leitura do código):** Lazer existia em 3 estados (98% hero · 82% fig.02 · "estourou R$ 8" briefing/bússola); o aporte da viagem era narrado em 3 tempos conflitantes (agendado no hero, já rendido no briefing, sendo decidido no chat); chat dizia "hoje" mas agendava sexta; pricing vendia "11 módulos" numa página que só fala de 8 áreas; marquee repetia os nomes das áreas pela 3ª vez; aurora2 (4 blobs uniformes) virava lama esverdeada; cover da r9 media scale .97/y 36 no meio do scrub (imperceptível).

**Feito (em `landing-viva.html`) — conceito: a metade de baixo é UM DIA narrado (07:12 briefing planta → 12:47 conversa decide → sexta a ação executa → "começa hoje" fecha o arco), com um único conjunto de números canônicos:**
- **Números canônicos:** score 74 (+3) · Lazer 508/500 (estourou R$ 8; hero corrigido pra 102%, fig.03 com barra ATRAVESSANDO a linha do limite) · Alimentação 640/800 · Transporte 280/400 · Viagem Itália 68%→73% com aporte R$ 580 na sexta 31 jul (68% + 580 = 73% na matemática real da meta) · pricing agora fala "Áreas da vida · Todas as 8".
- **Seção #produto re-narrada:** eyebrow "uma terça de verdade", h2 "Às 07:12, o dia já chega lido.", relógio-fantasma gigante "07:12" em contorno (paralaxe sutil); briefing vira a peça-guia (fig. 01) e PLANTA a pergunta do capítulo seguinte ("a parcela da viagem pode ser antecipada. Quer ver se cabe?"); score e orçamentos viram as provas (fig. 02/03). **O briefing se escreve** (SplitText lines+mask) e, quando cita um número, a figura correspondente ACENDE (odômetro no 74; barra do lazer estoura 58%→103% na hora do "R$ 8"). Hover nas citações re-acende a prova. mnote: "uma vida só, uma fonte só".
- **Marquee → ticker do índice da vida:** nomes + scores + deltas idênticos à lista das 8 áreas (82▲2 · 71▲3 · 64▼1 · 58▲1 · 76▲2 · 80▲4 · 69– · 74▲1), verde-delta `#44a616` no claro. Skew com velocidade mantido.
- **Palco da IA recomposto:** aurora2 deixa de ser 4 blobs uniformes → luz composta (roxo direcional atrás da manchete + roxo-claro de fundo + sombreamento do lado do chat pra contraste das bolhas) e o ELÉTRICO virou luz reativa: só acende quando o selo "Ação executada" aparece (pulso `__iaGlow` 1→halo residual .16). Relógio-fantasma "12:47"; chat ganhou timestamp "terça · 12:47" e perdeu o "hoje" conflitante; lead amarra os capítulos ("De manhã, o briefing planta a pergunta…").
- **Covers com presença real:** scale .90 + y 130 + raio morfando 76→44px em scrub até top 28% (medido no meio: .9003/129.6/76px). SplitText agora espera `document.fonts.ready` (warnings de medição zerados).
- QA: console 100% limpo; ticker validado número a número contra a lista; hover→lit ok; barra 103% pós-timeline; pulso da luz medido (glow .27 em decaimento); pricing claro com "Todas as 8".

**Pendências:** ⏳ veredito da r10; fila: wordmark gigante no rodapé, SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 9 — Onda 0, r9: ritmo claro/escuro + transições de seção (GSAP entra)

**Feedback do usuário na r8:** fundo da IA ok, mas ficou "preto, escuro e preto" na sequência de bandas; falta o que Jeton/Osmo/Phamily têm em comum: cada seção entrar animada com transição própria no scroll — é isso que dá cara profissional.

**Feito (em `landing-viva.html`):**
- **Ritmo corrigido:** pricing voltou pro papel claro (saiu `.dk` e o radius). Sequência agora alterna: hero claro → áreas claro → paper ESCURO → marquee claro → IA ESCURA → pricing/FAQ claros → final ESCURO. O cartão da IA respira sozinho entre bandas claras.
- **GSAP adotado na landing** (gsap@3.13 + ScrollTrigger + SplitText + CustomEase via jsdelivr, todos gratuitos): easing assinatura registrada como ease `sl` (E-01); glue com Lenis via `_lenis.on('scroll', ScrollTrigger.update)`; tudo gated por `!reduce && window.gsap` com o sistema `.rv` preservado como fallback (CDN caiu → página segue completa, E-02).
- **Transições por seção:** (1) cartões escuros (.paper/.ia/.final) entram como **cover** com scale .94→1 + y 70→0 em scrub; (2) manchetes (.areas8/.paper/.ia/.precos h2) com **palavras subindo de máscara** linha a linha (SplitText, `.sl-line` com folga pra descendentes); (3) **cascatas** nas 8 áreas e nas linhas do pricing; (4) **marquee entorta** com a velocidade do scroll (quickTo skewX ±8°) e assenta ao parar.
- QA: 10 ScrollTriggers ativos, cover medido no meio do scrub (scale .9688 + y 36), pricing claro renderizado, console 100% limpo.

**Pendências:** ⏳ veredito da r9; fila: wordmark gigante no rodapé, mobile dedicado da viva, aplicar SplitText também no h1 do hero (entrada de página).

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 8 — Onda 0, r8: hero só com aurora + a seção da IA vira o segundo palco

**Feedback do usuário na r7:** gradiente animado do hero APROVADO; peça 3D do hero reprovada (resolução baixa e bússola demais na página); pedir algo forte na seção "Uma IA que conhece sua vida" (funcionalidade principal).

**Feito (em `landing-viva.html`):**
- **Peça 3D do hero removida** (canvas, CSS e instância do módulo; o three.js segue só na bússola da seção das 8 áreas, aprovada).
- **Aurora melhorada** e extraída pra função `vivaAurora(id, blobs, fw, fh)`: movimento com 2 harmônicos por eixo, raio "respirando" (±11%), inclinação sutil na direção do cursor (lerp .025) e um 4º blob roxo-claro de profundidade.
- **Seção IA = segundo momento vivo da página:** banda escura arredondada 44px com **aurora dark própria** (`#aurora2`: roxo/roxo-claro/elétrico/coral contido) e **a conversa que se escreve sozinha** quando a dobra entra (IO, roda 1×): pergunta → "digitando…" → resposta com números → "Então agenda pra sexta." → digitando → "Agendado…" → **selo elétrico "Ação executada · aporte agendado pra sexta, 31 jul" com o check se desenhando**. Sem `.anim` (reduce/no-JS) a conversa inteira já está na página (E-02).
- QA: hero limpo com aurora rica; sequência do chat verificada completa (6,2s); console 100% limpo.

**Pendências:** ⏳ veredito da r8; fila: morphing de cor entre seções, wordmark gigante no rodapé, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 7 — Onda 0, r7: fundo Jeton-like (aurora + peça gigante + bandas arredondadas)

**Feedback do usuário na r6:** fundo ainda não agradou (nem rota tracejada do mouse, nem isolinhas); referência explícita: o fundo e as transições do site do Jeton; pode ser só em partes do site.

**Análise do Jeton (ao vivo):** gradiente vivo full-bleed SÓ no hero + moeda 3D gigante e soft sangrando no canto; miolo branco limpo com tipografia colorida; seções emolduradas; wordmark gigante no fim. Padrão traduzido pro SyncLife:

**Feito (em `landing-viva.html`):**
- Campo v2 (rota + isolinhas) **removido** por completo. O fundo vivo agora mora SÓ no hero.
- **Aurora de estúdio** (`#aurora`, canvas 2D a 1/3 da resolução + blur 52px no CSS): três massas de cor da marca (roxo .62, elétrico .40, coral .24) derivando em ciclos de ~25s sobre o papel. Gotcha de implementação registrado: canvas é elemento *replaced*: `inset` não estica o box (colapsou pra 100×50 e o bitmap derivava do próprio box); fix = `width/height` percentuais explícitos + bitmap medido no `.hero` pai.
- **A peça gigante do hero** (equivalente da moeda do Jeton): segunda instância three.js da bússola (640px, DPR 1, `blur(2.2px)`, opacity .92) sangrando no canto superior direito; módulo refatorado pra função `montar(canvas, opts)` (cada contexto GL tem sua cena/PMREM), mola da agulha compartilhada entre as duas peças, oscilação Y própria no hero; `display:none` < 1180px e render pulado quando fora do layout.
- **Transições de seção**: bandas escuras com cantos arredondados 44px (`.paper`, `.precos`; `.final` só no topo), moldura Jeton contra o papel.
- QA: aurora visível e viva (pixel roxo confirmado no bitmap; box 1653×1575), peça do hero renderizando, cantos ok, console 100% limpo.

**Pendências:** ⏳ veredito da r7. Fila seguinte: transição de cor contínua entre seções no scroll (Jeton morphing), wordmark gigante no footer, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 6 — Onda 0, r6: feedback da landing viva aplicado

**Veredito do usuário na r5:** CAMPO (limalha) reprovado ("poluído, pouca interação"); **OBJETO (bússola three.js) APROVADO** → registrado no DS; + 3 ajustes de conteúdo/layout.

**Feito (tudo em `landing-viva.html`; a r4 segue intacta):**
- **CAMPO v2 "carta de navegação":** parado, o fundo é quase vazio (4 isolinhas longas e calmas, opacidade ~.05, cuja inclinação segue o rumo da agulha). Ao mover o cursor, ele desenha uma **rota tracejada roxa** (como trajeto num mapa) que evapora em ~2,6s. Interação alta, ruído zero. Validado por medição do canvas (72,5k→81,2k bytes após gesto).
- **DS §5.6 nova**: "A peça viva em WebGL (aprovada 2026-07-30)": construção 3D fiel ao §5.2, luz pela hora local, agulha com mola física, fallback CSS obrigatório, orçamento de perf (1 canvas, DPR ≤ 2).
- **CTAs**: "Começar grátis"/"Ver demonstração" + prova social movidos pra baixo do parágrafo do hero, alinhados à esquerda (hero-foot em coluna).
- **Régua de sintonia** preenche o vão sob o arco (strip 600→552px): escala com ticks + números 01-08 que **desliza sob um ponteiro roxo fixo** (como dial de rádio) sincronizada com o `--off` do arco; clicar num número assenta o card correspondente no norte (controle do próprio arco, sem tocar na bússola). Máscara de fade nas bordas.
- **Conteúdo IA sem repetição**: fig. 03 do "produto por dentro" deixou de ser um segundo chat e virou **"O briefing do dia · escrito pra você"** (prosa assinada "Escrito às 07:12 · terça" + "Fontes: orçamentos · agenda · aportes · treinos", E-07); a seção IA agora é conversa+ação, com feats renomeados: 01 Enxerga tudo de uma vez · 02 Age por você · 03 Relatórios completos (saíram "Insights diários" e "Pergunte qualquer coisa", redundantes).
- QA: régua clicável girando o arco (02 → Futuro no norte), briefing renderizado, console 100% limpo.

**Pendências:** ⏳ veredito da r6 (campo novo + régua + conteúdo); depois: mobile dedicado da viva e demais ideias da fila (partículas de dados, dia sincronizado, cursor-agulha).

**Arquivos:** `prototypes/v5/landing/landing-viva.html` · `DESIGN-SYSTEM-v5.md` (§5.6).

---

## 2026-07-29 · Sessão 5 — Onda 0, r5: EXPERIMENTO "landing viva" (WebGL liberado)

**Contexto:** o usuário liberou WebGL (a reprovação da r3 foi por desconhecimento da ferramenta) e pediu insights grandes a partir de three.js/gsap/anime.js/motion.dev (viés: capacidades) + Jeton/Osmo/Phamily (viés: conceito). Análise ao vivo dos 7 sites feita por browser. Tese aprovada pra experimento: **"o site É o instrumento"**, em 3 camadas (campo / objeto / tinta).

**Feito:**
- **`landing/landing-viva.html`** (arquivo NOVO; a `landing.html` r4 ficou intacta como versão segura + tag git `poc-landing-r4`):
  - **O CAMPO**: fundo de "limalha de ferro digital" (canvas 2D, ~1100 traços em grade com ruído) que se orienta pro rumo da agulha (`window.__vivaHeading`) e redemoinha ao redor do cursor (ímã, raio 170px). Visível só nas bandas claras (html carrega o bg, body transparente, canvas em z -1).
  - **O OBJETO**: a bússola da seção "As oito áreas" em **three.js cromo real** (torus cromado + mostrador rebaixado + 24 ticks 3D + agulha facetada roxa + pivô, RoomEnvironment via PMREM, ACES): luz temperada pela **hora local** (manhã dourada / tarde neutra / noite fria com tick elétrico mais forte), **agulha com mola física** (aceleração+amortecimento, overshoot emerge da física), peça acompanha o cursor e o reflexo corre com o scroll. Fallback: se WebGL/CDN falhar, o `catch` mantém a bússola CSS (`.gl-on` alterna).
  - **A TINTA**: scores da lista + badge 74 do hero assentam como instrumento (count-up com overshoot easeOutBack) ao entrar na viewport.
  - Ponte: `sel(i)` na lista → `__vivaHeading`/`__vivaSet(i)` → agulha 3D + campo, tudo junto. Arco de miniaturas segue independente (decisão da r4 mantida).
- Hub atualizado (r4 = "versão segura"; r5 = linha própria). CDN: three@0.170.0 via jsdelivr + importmap.
- QA: WebGL ativo (`gl-on`), hover/click na linha Patrimônio → agulha 225° + tick aceso + campo reorientado; console 100% limpo (warning de PMREM resolvido com sigma 0).

**Decisões/insights registrados (da análise das referências):** anime.js dispensada (redundante com GSAP+motion); GSAP (agora grátis) planejada pra fase de implementação (scroll/caligrafia/inércia); motion.dev candidata a lib de motion do DS no app React (springs nomeadas needle/detent/settle); ideias na fila: partículas de dados→norte, "dia sincronizado" (scroll-story com narrativa), gravidade nos badges (Jeton), cursor-agulha, arco em 3D real.

**Pendências:** ⏳ veredito do usuário entre **landing r4 (segura)** × **landing viva r5**, e o quanto da tese vira lei do DS; mobile dedicado da r5 só após o veredito; performance mobile do campo (gap 48px já reduz, falta validar em device real).

**Arquivos:** `prototypes/v5/landing/landing-viva.html` (novo) · `prototypes/v5/index.html` · tag `poc-landing-r4`.

---

## 2026-07-28 · Sessão 4 — Onda 0, rodada 4: seção "As oito áreas" (referência em imagem)

**Pedido do usuário** (referência: `docs/handoff/refs/2026-07-28-as-oito-areas.png`): substituir o bloco da bússola do hero pela seção "As oito áreas · o índice da sua vida"; a lista interage APENAS com a bússola (hover → agulha aponta); a bússola deve ser o **cromo** da imagem (não a cerâmica branca); o arco de miniaturas volta a ser independente (só drag/inércia).

**Feito:**
- Bloco `hero-bussola` (bússola + chips + focoline) **removido** das duas landings.
- Nova seção `#areas` conforme a imagem: eyebrow "As oito áreas · o índice da sua vida", headline "Cada área tem um rumo. A bússola mostra qual pede você hoje.", bússola **cromo (d3)** 200px à esquerda (sticky) com contador `NN · 08`, nome e frase da área, anotação manuscrita "role a lista: a agulha acompanha"; à direita, lista de 8 linhas com **ícone de área** (spec §05: cromo pequeno + marcação do rumo acesa + primitiva), nome + descrição, **score** grande e **delta** (▲ verde / ▼ coral / – neutro), linha ativa com highlight roxo sutil. Hover na linha (desktop) ou toque (mobile) → `point()` da agulha + meta da esquerda; **nada toca no arco**.
- `SLBussola3D.areaIcon(i, sz)` + primitivas das 8 áreas portadas pra `shared/bussola-3d.js` e CSS `.aic`/`.gly` pro `shared/bussola-3d.css` (gera `<span>` pra viver dentro de `<button>`).
- **Arco desacoplado:** removidos auto-busca, clique-área→norte, glance/peek/north e o clique nos cards; ficam drag 1:1 com peso, inércia, assentamento no card mais próximo, balanço idle, setas do teclado e tilt no hover.
- Delta positivo usa `#44a616` (elétrico rebaixado pra legibilidade no claro, cor da imagem) — **token pendente de aprovação** no DS.
- QA: desktop (hover/click na linha Corpo → agulha SE + meta 04·08) e mobile (toque em Carreira → agulha W) verificados; console limpo nos dois.

**Pendências:** ⏳ aprovação da landing v2 r4; decidir token do verde-delta no claro.

**Arquivos:** `prototypes/v5/landing/{landing.html,landing.mobile.html}` · `prototypes/v5/shared/{bussola-3d.css,bussola-3d.js}`.

---

## 2026-07-28 · Sessão 3 — Onda 0, rodada 3: marca 3D "cromo líquido" integrada

**Contexto:** o usuário entregou a marca repaginada em `SyncLife DS v5 — Estúdio (POC)/design_handoff_marca_3d/` (README + `marca-3d.html`, rodada 7 da marca): a bússola vira um **objeto renderizado em CSS/SVG** (cromo líquido padrão, cerâmica off-white no claro), com comportamento próprio da agulha e ícones de área que revogam parte da E-09. Isso supersede a página de 4 direções de lockup da sessão 2.

**Feito:**
- `shared/bussola-3d.css` + `shared/bussola-3d.js`: porte 1:1 do material (d3 cromo + dl cerâmica + modos `.s-sm`/`.s-xs`, thresholds 54/34/22px) e do comportamento (transição .52s, overshoot alvo+9° assentando em 330ms, `rotateX(16deg)` no trajeto, tick aceso com 260ms de atraso, sweep no hover >54px). Diferença deliberada e documentada: rotação acumulada por caminho-mais-curto e overshoot no sentido do movimento.
- **Bug corrigido no porte:** os seletores internos da spec são globais e `.tk` colidia com o `.tk` do ticker da landing (o texto saltava pra fora da barra). Todo o CSS da bússola foi escopado sob `.bs`.
- Landing desktop: bússola do hero agora é a peça 3D em **cerâmica** 224px (banda clara, conforme spec) com hit-areas invisíveis sobre os rumos; nav e footer com **cromo 22px** (`.s-sm/.s-xs` automático), gap do lockup 9→11px. Hover nos cards usa `glance()` (a agulha olha sem assentar); clique usa `point()` com overshoot. Sincronia arco↔bússola preservada.
- Landing mobile: cerâmica 170px centrada + cromo 21px no nav/footer, mesmo controle.
- Spec copiada pra `prototypes/v5/marca/marca-3d.html` (servida pelo hub); `marca/lockup.html` (4 direções) **removida** (superseded).
- `DESIGN-SYSTEM-v5.md` atualizado conforme a tabela do README: §5.1 (material oficial cromo líquido), §5.2 (construção com material, pivô = cabeça de eixo), §5.3 (degradação por thresholds 54/34/22 + lockup gap 11), §5.4 (.52s, overshoot 2 etapas, tilt, lit 260ms), §5.5 (favicon/tiles/ícones de área), E-06 (gradiente como iluminação na marca), E-09 (revogada em parte: ícone de rumo por área, cor de módulo segue proibida).
- QA: desktop + mobile verificados (ticker ok, clique 01 → agulha norte + arco sincronizado), console limpo nas landings (só 404 de favicon na spec copiada, que não declara ícone).

**Pendências:**
- ⏳ Aprovação da landing v2 r3 (agora com a marca 3D aplicada).
- Favicon dos protótipos ainda é o flat antigo (data-URI); o README manda exportar bitmap renderizando o componente — fazer na fase de implementação.
- Ícones das 8 áreas e set de UI (seções 05/06 da spec) entram quando o chrome do app for prototipado (Onda 2+).

**Próximo passo:** revisão do usuário na landing com a marca 3D; com o aprovado, implementação em `web/` (inclui `<Compass />`, `<Logo />`, manifest/favicon novos conforme README).

**Arquivos:** `prototypes/v5/shared/{bussola-3d.css,bussola-3d.js}` (novos) · `prototypes/v5/landing/{landing.html,landing.mobile.html}` · `prototypes/v5/marca/marca-3d.html` (novo, cópia da spec) · `prototypes/v5/marca/lockup.html` (removido) · `prototypes/v5/index.html` · `DESIGN-SYSTEM-v5.md` (§5, E-06, E-09).

---

## 2026-07-28 · Sessão 2 — Onda 0, rodada 2: feedback do usuário aplicado

**Feedback recebido:** (1) remover a linha vertical central do hero e a linha acima da bússola; (2) interatividade arco↔bússola "péssima", melhorar no padrão Osmo; (3) seção de decisão de marca não pertence à landing; (4) ícone da marca fraco; (5) bússola boa de ideia, execução fraca; (6) mobile: ajustar bússola e a última seção (footer). Usuário também apontou quebra de expectativa sobre o r6 ser "só validação de DS" (registrado: base r6 foi reaproveitada demais na v1 da landing).

**Feito:**
- Linhas removidas: `.guide` do hero (a linha central) e o `border-top` do bloco da bússola, nas duas landings.
- **Interação refeita (causa raiz do "péssimo"):** o `.scard` tinha `transition: transform .5s`, então cada frame de drag era re-suavizado pelo CSS e o arco respondia com atraso borrachudo. Nova arquitetura em 2 camadas: `.scard` gira SEM transition (o rAF conduz `offCur` com lerp: 1:1 no drag com fator .42, pursuit .17 no resto) e `.scin` (novo wrapper interno) faz a física do objeto (lift, scale, tilt, sombra) com a easing assinatura. Extras Osmo: **snap/detent** (solto o drag ou morta a inércia, o arco assenta no card mais próximo, sempre há um norte), **hover bidirecional** (hover num card → a agulha da bússola olha pra ele; hover num tick/chip/número → o card responde com `.peek`), **tilt sutil ao cursor** nos cards (rotateX/Y ≤7°), vitrine pausa com o cursor sobre o arco, setas do teclado andam de card em card.
- **Bússola do hero executada melhor:** versão cerimonial (viewBox 80) com os números `01…08` ao redor, 210px desktop / 176px mobile centrada, hit-areas maiores, número aceso acompanha o tick.
- **Marca:** decisão saiu da landing → página própria `marca/lockup.html` com **4 direções mais fortes** em nav 1:1 (A núcleo forte · B selo do favicon · C rosa completa reforçada · D agulha viva), escada de tamanhos e contexto claro. Nav/footer das landings usam a direção A provisoriamente (agulha larga + tick norte grosso, bem mais presente que a anterior).
- **Mobile:** bússola centrada com números; footer compacto (3 colunas lado a lado, tagline curta); seção de marca removida.
- QA: telas verificadas em 1440/390 via Playwright, console limpo nas 3 páginas, clique "01 Finanças" assenta Finanças no norte, `.scard` com transition 0s confirmado por computed style.

**Pendências:** ⏳ aprovação do usuário (landing v2 r2 + direção da marca em `marca/lockup.html`). O "sway" idle ficou em 2.2° em volta do detent; se o usuário quiser mais movimento, subir amplitude/frequência.

**Próximo passo:** aguardar a revisão; com o aprovado, aplicar a direção de marca escolhida em tudo + favicon, atualizar o DS e partir pra implementação em `web/` com teste de identidade.

**Arquivos:** `prototypes/v5/landing/{landing.html,landing.mobile.html}` (reescrita da interação + limpezas) · `prototypes/v5/marca/lockup.html` (novo) · `prototypes/v5/index.html` (hub atualizado).

---

## 2026-07-28 · Sessão 1 — Onda 0: landing v2 + bússola interativa + lockup ×3

**Feito:**
- Plano do programa aprovado (15 ondas, ~136 protótipos, ciclo por onda, mobile dedicado, branch `poc/ds-v5`).
- Nova estrutura `prototypes/v5/` com `shared/` extraído dos protótipos r6 (regra: CSS específico da tela fica inline nela):
  - `shared/tokens.css` (tokens DS §2, claro + `.dk`), `shared/base.css` (reset, `.num/.eyebrow/.hand/.hl/.btn/.rv/.boot` + peças do símbolo da bússola + chips/focoline), `shared/bussola.js` (AREAS canônicas, markup da versão padrão, controlador `live()` com caminho-mais-curto), `shared/mock-data.js` (SL_MOCK com numeração canônica).
- **Numeração canônica §5.2 aplicada** (01 Finanças · 02 Futuro · 03 Tempo · 04 Corpo · 05 Mente · 06 Patrimônio · 07 Carreira · 08 Experiências). No arco da landing, o card "Coach IA" saiu e entrou um card **Carreira** novo (3/5 skills + barras Inglês/Liderança + 1:1 de terça).
- **`landing/landing.html` (v2 desktop):** miniaturas 300→**340px** (ui 224px), passo 6.5°→**7.5°** (span ±26.25°), strip 520→600px, drag .028→.033, balanço idle mais rápido (`sin(t/1900)·3.0°` após 1100ms, antes `sin(t/2600)·2.4°` após 1600ms); **bússola da vida interativa abaixo do semicírculo** (SVG padrão 150px + hit-areas nos ticks + chips + focoline): clicar numa área gira o arco **card a card até a miniatura chegar ao norte** (tween com solver da easing assinatura, duração 500–1200ms pela distância), agulha em caminho-mais-curto acumulado, tick aceso, card do norte com borda roxa; sincronia inversa (drag/teclado → agulha segue o card mais próximo do norte); auto-busca vitrine a cada 5s até a 1ª interação; reduce-motion instantâneo (§5.4).
- **`landing/landing.mobile.html`** dedicada (390×844): card 250px (ui 172), pivô 2000px, strip 470px, drag .042, bússola 120px com chips em scroll-x, nav pill compacta, seções em coluna única, sem Lenis.
- **Marca do nav:** direção 1 (núcleo ampliado, 20px) aplicada como default no nav + footer; seção `#lockup` com as **3 direções** para escolha (1 núcleo ampliado · 2 versão-32 reforçada · 3 selo do favicon).
- **`index.html` (hub):** tabela das 15 ondas com links desktop/mobile e status (landing "em aprovação").
- QA visual via `python -m http.server 8123` + Playwright (1440×900 e 390×844): hero, arco, bússola, lockups, fullpage; interação testada de verdade (clique em "01 Finanças" → `--off` chegou a 26.25° com Finanças no norte; estado chip/tick/focoline/rot 100% consistente). Console limpo nas duas páginas.

**Decisões:**
- Lenis exposto como `window._lenis` na landing desktop (só p/ QA; `scrollTo immediate`).
- Screenshots fullPage: revelar `.rv/.draw` via classe antes do shot (scrollTo programático briga com `scroll-behavior:smooth`/Lenis).
- Nota pendente pro DS (aplicar QUANDO a landing for aprovada): na landing a bússola aponta sem dado real, como demo de marketing (exceção consciente ao §5.4) + registrar a numeração canônica no mock.

**Pendências:**
- ⏳ **Aprovação do usuário**: landing v2 desktop + mobile, e escolha da direção do lockup (1, 2 ou 3).
- Após aprovação: remover seção `#lockup`, aplicar direção escolhida em tudo, atualizar DS (changelog + exceção §5.4), e então implementar em `web/` (Fundação A: tokens-v5.css, v5.css, fontes Inter/Caveat, `Bussola.tsx`, landing page real) + teste de identidade.
- Polimento possível (se o usuário apontar): quebra do badge78 no h1 mobile; altura do strip desktop (600px deixa respiro grande com foco no centro).

**Próximo passo:** apresentar protótipos ao usuário (servir `prototypes/v5/` com `python -m http.server` e abrir `index.html`) e aguardar aprovação + escolha do lockup. Com o "aprovado": implementar a landing em `web/` (Onda 0, fase de código) e rodar o teste de identidade.

**Arquivos:** `prototypes/v5/{index.html, shared/{tokens.css,base.css,bussola.js,mock-data.js}, landing/{landing.html,landing.mobile.html}}` · `docs/handoff/HANDOFF-v5.md` (este) · screenshots de QA no scratchpad da sessão (`qa-onda0/`).
