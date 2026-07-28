# HANDOFF · Redesign SyncLife → DS v5 "Estúdio"

> Arquivo rolling: entrada mais recente no topo. Atualizado ao fim de TODA sessão, antes do commit final.
> Plano do programa: `~/.claude/plans/quirky-noodling-snail.md` (aprovado 2026-07-28). Branch: `poc/ds-v5`.
> Regras invioláveis: fidelidade ao `DESIGN-SYSTEM-v5.md` (protótipos vencem em divergência); protótipo → aprovação
> explícita do usuário → implementação → teste de identidade; mobile = protótipo dedicado por tela; handoff toda sessão.

## Status das ondas

| Onda | Escopo | Protótipo | Aprovação | Implementação | QA identidade |
|---|---|---|---|---|---|
| 00 | Landing v2 + marca (lockup) | ✅ pronto | ⏳ **aguardando usuário** | – | – |
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
