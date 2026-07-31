# HANDOFF · Redesign SyncLife → DS v5 "Estúdio"

> Arquivo rolling: entrada mais recente no topo. Atualizado ao fim de TODA sessão, antes do commit final.
> Plano do programa: `~/.claude/plans/quirky-noodling-snail.md` (aprovado 2026-07-28). Branch: `poc/ds-v5`.
> Regras invioláveis: fidelidade ao `DESIGN-SYSTEM-v5.md` (protótipos vencem em divergência); protótipo → aprovação
> explícita do usuário → implementação → teste de identidade; mobile = protótipo dedicado por tela; handoff toda sessão.

## Retomada rápida (pra nova sessão)

- **Branch:** `poc/ds-v5`. Servir: `python -m http.server 8123` em `prototypes/v5/` → hub em `http://localhost:8123/`. (QA: validar com `?v=rN` por causa do cache do http.server.)
- **Dois protótipos de landing:** `landing/landing.html` = **r4 segura** (congelada, tag `poc-landing-r4`) · `landing/landing-viva.html` = **r15 APROVADA em 2026-07-30** (tag `poc-landing-viva-r15`).
- **✅ LANDING DESKTOP APROVADA (r15):** aurora global azul/lilás/roxo passeando atrás das áreas claras · palcos produto/IA sem pin com coreografia na travessia (voo com encaixe × pop de mensageiro) · banda roxa sólida da IA · pricing em 2 cartões iguais · FAQ 2 colunas · wordmark gigante inteiro · copy vendável com números canônicos. Já aprovados antes: marca 3D cromo líquido (DS §5), bússola WebGL (DS §5.6), seção "As oito áreas".
- **✅ ONDA 0 IMPLEMENTADA em `web/` (2026-07-30):** rota `/` agora renderiza a landing v5 (`LandingV5` = árvores `LandingVivaDesktop` r15 + `LandingVivaMobile` m1, CSS decide qual aparece em 1024px; árvore oculta = E-02 estático). Fundação A no lugar: `styles/{tokens-v5,v5,bussola-3d}.css` escopados sob `.v5`, Inter+Caveat no `layout.tsx`, `lib/v5/{bussola-3d,viva,compass-gl}.ts`, deps gsap+lenis+three. Teste de identidade: desktop DELTA 0px em todas as âncoras (doc 6947px idêntico); mobile idêntico em device (no preview desktop o protótipo perde 15px pra scrollbar nativa; o app usa a scrollbar do globals v3). Servir local: `npx next start -p 3006` (porta 3006; se EADDRINUSE, matar o listener antigo).
- **✅ MOBILE m1 APROVADO (2026-07-30, tag `poc-landing-viva-mobile-m1`):** `landing/landing-viva.mobile.html` (390×844, dedicado) porta a r15 inteira pro toque: aurora global, arco com régua de sintonia, bússola WebGL (DPR 1) com fallback CSS, coreografia em scrub por elemento (voo com encaixe × pop de mensageiro), pricing empilhado, wordmark inteiro. Scroll nativo, sem Lenis.
- **✅ ONDA 1 COMPLETA (2026-07-31):** protótipos aprovados (tag `poc-onda1-publico-auth-r2`) e IMPLEMENTADOS em `web/`: `/pricing` (página real, era redirect), `/login`, `/cadastro`, `/esqueceu-senha`, `/redefinir-senha`, `/onboarding`, todos no v5 com a lógica Supabase do v3 preservada. QA de identidade em `next start -p 3006`: pricing delta 0 (doc 3816px idêntico), tipografia exata nas 6, console zero em 12 navegações. **Próximo: Onda 2 (chrome do app + Dashboard, 3 telas ×2 + decisão do chrome mobile), protótipos primeiro.**
- **Stack decidida:** three.js (peça viva) + GSAP (landing) + motion.dev (app React, futuro); anime.js dispensada. Token pendente: verde-delta no claro `#44a616` (agora também no ticker/marquee).

## Status das ondas

| Onda | Escopo | Protótipo | Aprovação | Implementação | QA identidade |
|---|---|---|---|---|---|
| 00 | Landing v2 + marca 3D | ✅ viva r15 + mobile m1 (r4 segura preservada) | ✅ **COMPLETA: desktop r15 + mobile m1 (2026-07-30)** | ✅ `web/` (2026-07-30) | ✅ desktop delta 0px · mobile ok (nota scrollbar) |
| 01 | Público + auth (pricing, login, cadastro, senhas, onboarding) | ✅ 6 telas ×2 (2026-07-31) | ✅ **APROVADA (r2, 2026-07-31)** | ✅ `web/` (2026-07-31) | ✅ desktop + mobile ok, console zero |
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

## 2026-07-31 · Sessão 19 — ✅ APROVAÇÃO da Onda 1 + IMPLEMENTAÇÃO em `web/` + QA de identidade

**Veredito do usuário:** "prototipos aprovados." → tag `poc-onda1-publico-auth-r2`; ciclo do programa seguiu direto pra implementação.

**Implementado (tudo v5, lógica Supabase do v3 preservada):**
- **Fundação da onda:** `styles/auth-v5.css` (porte do shared/auth.css sob `.v5`) · `v5.css` ganhou `html.v5-scroll.v5-dark body{background:#151313}` (telas escuras) e o utilitário `.d-only/.m-only` (copy do protótipo certo por viewport na árvore única) · `components/auth-v5/chrome.tsx` (useAuthBoot: gate `.anim`+aurora+bússolas+reveals; AreaIconSlot responsivo; Forca; ícones SVG 1:1).
- **Auth (árvore ÚNICA responsiva — formulários com estado não podem duplicar DOM por causa do autofill):** `LoginV5` (signInWithPassword + checagem de onboarding + OAuth Google + reenviar confirmação; credenciais incorretas = msg inline do protótipo, não-confirmado = banner), `CadastroV5` (signUp + upsert do profile + força de senha + termos; e-mail já cadastrado = banner), `EsqueceuSenhaV5` (resetPasswordForEmail; estado 02 com eco do e-mail e check `#44a616` se desenhando), `RedefinirSenhaV5` (updateUser). CSS: `auth-screens.css` = desktop base + `@media <1024` com os valores dos protótipos mobile dedicados.
- **`OnboardingV5`** (+`onboarding-v5.css`): guard de sessão + prefill do nome + persistência (profiles: full_name/mode/onboarding_completed/life_moments/active_modules → `/financas`); 4 passos com tabs desktop/prog mobile no mesmo DOM, ícones de rumo por área, bússola apontando a última área ativada (mínimo 1: nunca sem norte), selo 70 com prosa ecoando escolhas reais.
- **`PricingV5`** (duas árvores `.pv-d`/`.pv-m`, padrão da landing): página real em `/pricing` (substitui o redirect pro `#precos`); alternador mensal/anual por árvore, comparativo, FAQ, Lenis só no desktop.
- **Rotas:** `(auth)/{login,cadastro,esqueceu-senha,redefinir-senha}/page.tsx` viraram server pages finas com metadata + componente v5; `(auth)/layout.tsx` sem o wrapper v3 (`.auth-page`/tema forçado — loading/error usam Tailwind, seguem ok); `onboarding/{page,layout}.tsx` v5; `pricing/page.tsx` real.

**Bugs reais pegos no QA de identidade (`next start -p 3006` × http.server 8123):**
1. `.proof span` (4 classes) vencia `.v5 .m-only{display:none}` (2) e mostrava as DUAS copies ("Sem cartão de crédito Sem cartão") → seletor de filho direto `.proof > span`. Lição: com `.d-only/.m-only`, nunca estilizar `span` genérico por descendência.
2. Seta do submit do esqueceu-senha aparecia no mobile: `style={{display:'inline-flex'}}` inline vencia a media query → classe `.btn-ico` com override no bloco mobile.
3. **Onboarding SEM `.dk`** no wrapper (o protótipo tem `html.dk`): a tela era clara; parecia escura em QA anterior por VAZAMENTO do tema v3 (`data-theme` aplicado após visitar /dashboard) — falso positivo perigoso. Fix: `.onb dk`. Lição: nunca validar tela v5 logo após navegar pelo app v3 sem full reload limpo.

**QA de identidade (medido):** pricing desktop DELTA 0 (doc 3816px idêntico, cartões 410×456, h1 76.8px/500); login/cadastro tipografia e larguras exatas (delta 7-8px de x = scrollbar do protótipo que tem a seção de estados, documentado); mobile 390 sem overflow-x, h1 35.1px idêntico, tease/wcol alternando certo; onboarding com fluxo completo REAL (login do usuário de QA → prefill "Admin SyncLife" → "Admin, o que você quer mudar?" → agulha -45° na área 08 → "Pronto, Admin."); **console 0 erros/0 warnings em 12 navegações** (6 rotas × 2 viewports).

**Infra/QA (gotchas novos):**
- Porta 3006: TaskStop não mata o filho do npx; um `next start` velho + `.next` rebuildado = servidor FRANKENSTEIN (markup novo, CSS 404). Sempre matar o listener por PID e subir de novo após build.
- Supabase produção estava INACTIVE (restore via MCP) e o usuário de QA `admin@synclife.dev` existia mas a `SUPABASE_SERVICE_ROLE_KEY` do `.env.local` está PODRE (Invalid API key; anon ok). Queries logo após restore podem dar 42P01 transitório (banco subindo).
- Senha de QA sem passar pelo transcript: env → arquivo temporário servido pelo http.server dos protótipos → `page.request.get` → fill → apagar arquivo (o sandbox do run_code não tem require/import de fs).
- /onboarding tem guard TAMBÉM no middleware (307 sem sessão): QA visual exige login real.

**Pendências:** flag do usuário de QA restaurada (onboarding_completed=true). Estados de erro que dependem de backend (e-mail já cadastrado etc.) validados visualmente via protótipo; fluxo real herdado do v3. Próximo: **Onda 2 — chrome do app + Dashboard** (shell v5 D+M com decisão do chrome mobile, dashboard, review, score), protótipos primeiro.

**Arquivos:** `web/src/styles/{auth-v5.css,v5.css}` · `web/src/components/auth-v5/{chrome.tsx,auth-screens.css,LoginV5,CadastroV5,EsqueceuSenhaV5,RedefinirSenhaV5,OnboardingV5,onboarding-v5.css}` · `web/src/components/pricing-v5/{PricingV5.tsx,pricing-v5.css}` · `web/src/app/{(auth)/*,onboarding/*,pricing/page.tsx}` · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-31 · Sessão 18b — Onda 1, rodada 2: feedback do usuário (onboarding centrado + wordmark junto)

**Feedback recebido:** (1) onboarding desktop com disposição à esquerda, tela vazia à direita/abaixo no passo 1 → centralizar; (2) "SyncLife" aparecendo SEPARADO no cabeçalho das telas novas e da landing (no wordmark do final aparece junto, correto); (3) pergunta: as regras de negócio (obrigatoriedade, mensagens) entram nos protótipos ou depois?

**Feito:**
- **Onboarding desktop centrado:** `.step` virou palco flex centrado (`min-height:calc(100vh - 64px)`, conteúdo no eixo central); nome em manchete com texto centrado, listas (prox/objetivos/comece) com largura própria e texto à esquerda por dentro; passo 04 recomposto em coluna central (selo em cima, prosa e "comece por aqui" abaixo). Mobile não mudou (não tinha o problema de vazio).
- **CAUSA RAIZ do "Sync Life" separado:** `.brand`/`.lockup` são `inline-flex` com `gap` e o markup era `<span class=bs></span>Sync<em>Life</em>`: o texto "Sync" e o `<em>Life</em>` viram DOIS itens flex anônimos e o gap entra no meio. O wordmark gigante do final não é flex, por isso lá sempre foi junto. **Fix: embrulhar em `<span class="wm">Sync<em>Life</em></span>`** (o gap fica só entre a bússola e o texto). Aplicado nos **25 pontos** dos protótipos (Onda 1 inteira + landing-viva desktop/mobile + landing r4 segura + hub) e nos **4 pontos da implementação** (`LandingVivaDesktop/Mobile.tsx`, navs + footers; wordmarks gigantes intactos).
- **Teste de identidade do fix:** `npm run build` + `next start -p 3006` (listener velho da 3006 morto antes) → `.wm` computa "SyncLife" com **73px nos dois lados** (protótipo × app), navs visualmente idênticas.
- QA do onboarding centrado: fluxo completo com cliques FÍSICOS (passos 1→4, eco "Pronto, Thiago."). Nota de QA: uma bateria de cliques falhou por instabilidade do BROWSER do Playwright rodando junto com `npm run build` (CPU saturada, browser chegou a morrer); em browser novo sem build paralelo, tudo passa. Não confundir com bug de página.
- **Resposta ao ponto 3 (registrada):** os protótipos cobrem o VISUAL dos estados (seções "Estados · anotação do protótipo": erros de credencial, e-mail não confirmado, senhas divergentes, força, e-mail já cadastrado); o COMPORTAMENTO (campos obrigatórios, validação, redirects, reenvio) entra na implementação herdando o que o app v3 já faz hoje (Supabase auth + validações existentes), com a copy seca do v5. Se o usuário quiser aprovar a matriz completa de mensagens por campo, ela pode ser adicionada às seções de estados antes do "aprovado".

**Pendências:** ⏳ veredito da rodada 2 (onboarding centrado) + demais telas da Onda 1.

**Arquivos:** `prototypes/v5/auth/*.html` · `prototypes/v5/landing/*.html` · `prototypes/v5/index.html` · `web/src/components/landing-v5/{LandingVivaDesktop,LandingVivaMobile}.tsx` · este handoff.

---

## 2026-07-31 · Sessão 18 — Onda 1: protótipos de público + auth (6 telas ×2)

**Escopo:** fase de protótipo da Onda 1 completa: pricing, login, cadastro, esqueceu a senha, redefinir senha e onboarding, cada uma com desktop (1440) e mobile dedicado (390×844).

**Feito:**
- **`shared/` ganhou 2 arquivos novos** (as telas da onda repetem as mesmas peças; nada das ondas aprovadas foi tocado): `shared/auth.css` (campo com label eyebrow + input objeto radius 12/foco roxo, OAuth pills, divisor editorial, checkbox, força de senha em 4 segmentos coral→neutro→`#44a616`, passos de fluxo, `.win` janela escura E-11, seção de estados do protótipo) e `shared/public.js` (`SLPub.boot()`: gate `.anim` E-02 + classe `.js`, reveals IO, aurora global com a paleta r15, montagem `[data-bs3d]`, olho de senha `[data-eye]`, medidor `[data-strength]`).
- **Pricing** (`landing/pricing.html` + `.mobile`): página dedicada da família da landing r15 (aurora, pill nav + ticker, Lenis no desktop): hero editorial + **alternador mensal/anual** (PRO 24,90 ↔ 20,75/mês cobrado R$ 249/ano, tag elétrica "2 meses grátis"), os MESMOS 2 pcards aprovados, comparativo linha a linha em hairlines (4 grupos numerados, coluna PRO com pill roxa), FAQ estendida (6 perguntas), CTA final escuro + footer. Hoje `/pricing` no app é só redirect pro `#precos`; essa é a primeira página real.
- **Login** (`auth/login.html` + `.mobile`): palco formulário × **janela escura do briefing** (E-11/E-07: quote do coach com os números canônicos, score 74 +3, assinatura "Escrito às 07:12 · com base em…"), caligrafia "entre: o dia de hoje já está pronto", nav pill sem ticker (auth é tarefa, não marketing). Estados anotados no fim (credenciais incorretas, e-mail não confirmado + reenviar).
- **Cadastro** (`auth/cadastro.html` + `.mobile`): mesmo palco; a janela mostra as **8 áreas com os ícones de rumo da marca** (`SLBussola3D.areaIcon`, §5.5) + prova (14 dias PRO · sem cartão · LGPD). Força de senha ao vivo, termos, estados (senhas não coincidem, e-mail já cadastrado, confirmação pendente).
- **Esqueceu a senha** (`auth/esqueceu-senha.html` + `.mobile`): coluna centrada SEM caixa (E-04), lockup bússola 30px + passos 01/03; "enviar" troca pro estado 02 (selo com check `#44a616` se desenhando, e-mail ecoado, infos hairline 30 min/spam); sem JS os 2 estados ficam empilhados (E-02).
- **Redefinir senha** (`auth/redefinir-senha.html` + `.mobile`): passo 03 de 03, força + validação viva de confirmação, nota de segurança (sessões antigas desconectadas).
- **Onboarding** (`auth/onboarding.html` + `.mobile`): a "primeira edição" em modo escuro do app. 4 passos: nome em **input manchete** (display 50px, caret roxo, hand "pode ser apelido") → objetivos em linhas hairline selecionáveis (9, contagem viva) → **as 8 áreas canônicas com ícone de rumo + toggle**, bússola cromo 200px sticky apontando a última área ativada (caminho mais curto §5.4; a bússola nunca fica sem norte: a última área ativa não desliga) → passo 04 com **selo do score inicial 70** (moldura dupla + breathe, spec do dashboard r6) e prosa assinada E-07 que ecoa nome/contagens reais ("Pronto, Thiago. Sua bússola está calibrada." · "6 áreas ativas e 3 objetivos"). Tabs numeradas no topo (eco da modbar da Onda 2), nav fixa embaixo; sem JS = 4 passos empilhados completos.
- Hub: 6 linhas da Onda 01 com links desktop/mobile e status "em aprovação".

**Bug real pego no QA (o gotcha da r15 de novo):** `padding:X 0 Y` (shorthand) em elementos que TÊM `.wrap` zerava o gutter de 20px no mobile (login/cadastro `.sheet`/`.tease`) e o lateral do onboarding (`.step`). Trocado por `padding-top/bottom` nos 4 arquivos; computado 20px confirmado.

**QA (Playwright, http.server 8123, cache-buster `?v=o1/o1b`):** console 100% limpo em todas as 12 páginas; interações verificadas de verdade (eco de e-mail no estado 02, força f4 "Muito forte", "senhas não coincidem", nome→"Thiago, o que você quer mudar?", contagem 06 áreas, agulha a -45° pela rota curta até a área 08, alternador anual trocando preço e rodapé); sem overflow-x no mobile; **E-02 medido**: com reduce, `.anim` não entra e todo `.rv/.boot` computa opacity 1. Screenshots das dobras no scratchpad (`o1-*.png`).

**Pendências:** ⏳ aprovação do usuário das 6 telas (feedback → iterar). Números de plano (50 transações, R$ 249/ano, suporte prioritário) são ilustrativos como todo indicador de protótipo; bater com `use-plan-limits.ts` na implementação.

**Próximo passo:** apresentar o hub (Onda 01) ao usuário e aguardar veredito tela a tela; com o "aprovado", implementação em `web/` (route público + `(auth)` + onboarding no v5) e teste de identidade.

**Arquivos:** `prototypes/v5/auth/{login,cadastro,esqueceu-senha,redefinir-senha,onboarding}{.html,.mobile.html}` (novos) · `prototypes/v5/landing/{pricing.html,pricing.mobile.html}` (novos) · `prototypes/v5/shared/{auth.css,public.js}` (novos) · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-30 · Sessão 17 — ✅ IMPLEMENTAÇÃO da Onda 0 em `web/` + teste de identidade

**Escopo:** Fundação A (plano §5) + landing real desktop (r15) e mobile (m1) na rota `/`, teste de identidade em `next start`.

**Feito:**
- **Deps/fontes:** gsap 3.13 + lenis + three (npm) · Inter (400/500/600) e Caveat (600/700) via next/font no `layout.tsx` (`--font-inter`/`--font-caveat`; Space Grotesk já existia).
- **Fundação CSS** (escopada sob `.v5`, coexiste com v3 sem colisão): `src/styles/tokens-v5.css` (tokens §2, fontes mapeadas pras vars do next/font), `src/styles/v5.css` (base.css portado; gate `.anim` no ROOT de cada árvore: árvore não inicializada = estática completa E-02; keyframes prefixados `v5*` — o `pulse` do Tailwind colidia), `src/styles/bussola-3d.css` (1:1, keyframe `v5sweep`).
- **Libs `src/lib/v5/`:** `bussola-3d.ts` (mount/control/areaIcon tipados), `viva.ts` (solver da easing, initStrip com régua + cleanup, initAreas8, initAurora, odômetros, `loadDisplayFonts` — pede as faces pela FAMÍLIA COMPUTADA porque o next/font renomeia as famílias, o literal 'Space Grotesk' não casaria), `compass-gl.ts` (three por import dinâmico, dispose completo, luz pela hora local).
- **Componentes `src/components/landing-v5/`:** `content.tsx` (conteúdo canônico compartilhado: cards do arco, lista das 8 áreas, palco do produto, chat, pricing, FAQ, tickers com scores), `LandingVivaDesktop.tsx` + `landing-viva-desktop.css` (escopo `.lv-d`, keyframes `lvd-*`; coreografia r15: timelines na travessia do stage/chat, Lenis + glue ScrollTrigger, magnéticos, SplitText pós-fontes) e `LandingVivaMobile.tsx` + `landing-viva-mobile.css` (`.lv-m`/`lvm-*`; coreografia m1: scrub POR ELEMENTO, scroll nativo). Cada árvore inicializa via matchMedia(1024) só quando visível; GSAP em `gsap.context(root)` com `ctx.revert()` no unmount. `page.tsx` → `<LandingV5 />` (v3 `LandingClient` fica intacto até a Onda 14).
- **Bug real achado no QA:** a aurora sumia — no protótipo o fundo mora no BODY (canvas z-index:-1 pinta acima do fundo do canvas raiz); o `.v5` com background opaco a cobria (negative child pinta ABAIXO de block background do mesmo stacking context). Fix: `html.v5-scroll body{background:#f4f4f4}` e `.v5` sem background.
- **Teste de identidade (Playwright, `next start -p 3006` vs http.server 8123):** DESKTOP: âncoras EXATAS (areas 1381 · produto 2649 · precos 4520 · final 5898 · doc 6947 — delta 0px), tipografia conferida por computed style (h1 SG 500 132.48px/-7.29px, tokens hex exatos), pares de screenshot idênticos em hero/produto/preços/final. MOBILE: estrutura e visual idênticos; alturas de 4 blocos ~1 linha menores porque o PREVIEW do protótipo em browser desktop perde 15px pra scrollbar nativa (útil 375px) e o app esconde scrollbar no mobile via globals v3 (útil 390px = comportamento de device real). Console: mobile 0 avisos; desktop só o info do compilador de shader ANGLE (three/Windows).
- Hub: as duas linhas da viva marcadas "QA ok".

**Pendências:** nenhuma da Onda 0. Próximo: **Onda 1 (público + auth)** — pricing, login, cadastro, senhas, onboarding (6 telas ×2, protótipos primeiro). Favicon/manifest da bússola ficam pra Onda 14 (assets).

**Arquivos:** `web/src/app/{layout,page}.tsx` · `web/src/styles/{tokens-v5,v5,bussola-3d}.css` · `web/src/lib/v5/{bussola-3d,viva,compass-gl}.ts` · `web/src/components/landing-v5/*` · `web/package.json` · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-30 · Sessão 16b — ✅ APROVAÇÃO do mobile m1 (Onda 0: fase de protótipo COMPLETA)

**Veredito do usuário:** "aprovado". O `landing-viva.mobile.html` m1 é a landing mobile oficial da Onda 0.

**Registrado:**
- Tag git `poc-landing-viva-mobile-m1` no commit da aprovação; hub com a linha do mobile marcada aprovada.
- Onda 0 fecha a fase de protótipo com os dois oficiais: desktop r15 (`poc-landing-viva-r15`) + mobile m1. A r4 segura segue congelada em `poc-landing-r4`.
- **Próximo passo do ciclo (regra do programa): IMPLEMENTAÇÃO em `web/`** — Fundação A (tokens v5 sob `.v5`, Inter/Caveat via next/font, `<Compass />` three.js com fallback, landing real desktop+mobile com GSAP) e teste de identidade screenshot a screenshot contra os 2 protótipos, sempre em `next start` (nunca dev). Levar o fix do `document.fonts.load()` pro SplitText.

---

## 2026-07-30 · Sessão 16 — Onda 0, m1: protótipo MOBILE dedicado da landing viva

**Contexto:** com a desktop r15 aprovada, o ciclo do programa pede o protótipo mobile dedicado (390×844, hierarquia própria, não breakpoint). Base estrutural: o esqueleto mobile da r4 (nav pill compacta, arco 250px/pivô 2000px, áreas centradas, footer 3 colunas) + TODO o conteúdo e as camadas vivas da r15.

**Feito (`landing/landing-viva.mobile.html`, novo):**
- **Conteúdo 1:1 com a r15 aprovada:** copy vendável, números canônicos (score 74+3 · Lazer 102% e 508/500 atravessando a linha do limite · viagem 68→73% c/ R$ 580 sexta 31 jul), pricing em 2 cartões (Free branco · PRO escuro, EMPILHADOS, tag elétrica), FAQ com sub editorial, wordmark gigante inteiro, ticker do índice da vida com scores/deltas, banda roxa sólida da IA.
- **Camadas vivas adaptadas pro toque:** aurora global fixa (mesma paleta/amplitudes da r15, blur 48px) · arco com régua de sintonia (SPC 52, tocar no número assenta o card) · bússola WebGL cromo na seção das áreas (DPR 1, orçamento §5.6, fallback CSS via catch) · odômetro nos scores.
- **Coreografia em scrub SEM pin, gatilho no próprio elemento** (regra da r14: nada anima fora da tela): produto = cada peça do painel voa e ENCAIXA na própria travessia (`top 97%`→`top 58%`, back.out; medido: entra a scale .82/rot 4°/+64px, assenta com overshoot 1.01); IA = bolhas com pop de mensageiro por mensagem + selo carimbando com check se desenhando; wordmark sobe em scrub; manchetes SplitText (áreas/preços); cascatas nas listas; ticker entorta com a velocidade. **Scroll nativo (sem Lenis — o momentum do device já é o peso).** E-02: sem GSAP/reduce = página estática completa via `.rv`.
- **Fix de console:** `document.fonts.ready` pode resolver ANTES do Space Grotesk começar a baixar (nenhum load pendente) e o SplitText media errado ("called before fonts loaded" ×10). Fix: `document.fonts.load('500/700 32px Space Grotesk')` explícito antes do split. A desktop r15 tem o mesmo padrão latente (lá mascarado por cache) — corrigir na implementação.
- Hub: linha da viva desktop marcada APROVADA + linha nova do mobile m1 em aprovação.
- QA (`?v=m1`/`?v=m1b`, 390×844): console 100% limpo (os 2 warnings de Canvas2D são do probe do próprio Playwright, já documentados na r15) · 20 ScrollTriggers, 0 pins, sem overflow-x, doc 7374px · gl-on com agulha respondendo ao toque na lista (Corpo → SE + meta 04·08) · régua sintonizando (tap 05 → arco a -3.75°) · voo medido nas 2 pontas · screenshots das 7 dobras no scratchpad (`qa-onda0-mobile/`).

**Pendências:** ⏳ veredito do usuário no mobile m1; com o aprovado, implementação da Onda 0 em `web/` + teste de identidade.

**Arquivos:** `prototypes/v5/landing/landing-viva.mobile.html` (novo) · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-30 · Sessão 15b — ✅ APROVAÇÃO da landing desktop (r15)

**Veredito do usuário:** "aprovado". A `landing-viva.html` r15 é a landing desktop oficial da Onda 0.

**Registrado:**
- Tag git `poc-landing-viva-r15` no commit da aprovação; a r4 segura segue congelada em `poc-landing-r4`.
- O que a aprovação cobre: aurora global (azul/lilás/roxo, drift amplo), palcos produto/IA sem pin (coreografia na travessia, transição própria por palco), banda roxa sólida da IA, pricing 2 cartões, FAQ 2 colunas, CTA final com wordmark gigante, copy vendável, números canônicos, ticker de scores, fallbacks E-02 (mobile/no-GSAP estático completo).
- Próximo passo do ciclo (regra do programa): protótipo MOBILE dedicado da landing-viva → aprovação → implementação em `web/` + teste de identidade.

---

## 2026-07-30 · Sessão 15 — Onda 0, r15: a nuvem passeia + margens dos palcos alinhadas

**Feedback do usuário na r14:** nuvens ainda parecem paradas; margem lateral das seções produto e IA diferente das demais.

**Diagnóstico e feito (em `landing-viva.html`):**
- **Nuvem:** o problema não era velocidade e sim AMPLITUDE — os blobs oscilavam só ~14% da largura em volta de âncoras fixas (com blur 56px isso lê como parado). Amplitudes dobradas (.14/.06→.26/.10 no x, .12/.05→.22/.08 no y): agora os blobs varrem ~metade da tela por ciclo (~10s). Verificado por centroide do canal roxo: deslocou ~70px de tela em 2s.
- **Margens:** causa raiz — `padding:70px 0` (shorthand) em `.prod-wrap` e `.ia .wrap` ZERAVA o gutter lateral de `4vw` herdado do `.wrap` base. Trocado por `padding-top/bottom` (o shorthand nunca deve ser usado pra "só vertical" sobre o .wrap). Medido: conteúdo de hero, produto e IA alinhados a 90px; FAQ segue mais estreito por design (max-width 1080).
- QA (`?v=r15`): console limpo (warning restante é do probe getImageData do próprio QA), screenshot com o eyebrow "O PRODUTO" alinhado à seção de imprensa acima.

**Pendências:** ⏳ veredito da r15; fila: SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

---

## 2026-07-30 · Sessão 14 — Onda 0, r14: 4 finos sobre a r13 aprovada ("ficou bom")

**Feedback do usuário na r13:** "ficou bom" + 4 ajustes: (1) a nuvem do fundo precisa estar em movimento; (2) transições acontecendo cedo demais, algumas fora da tela; (3) Free e PRO com o mesmo tamanho; (4) trocar "role: o painel se monta sozinho" por algo referente à aplicação.

**Feito (em `landing-viva.html`):**
- **Aurora em movimento visível:** deriva ~3x mais rápida (fx/fy .10-.21 → .30-.58; ciclo ~30s → ~10s) + respiração do raio .0003 → .0007. Verificado por diff de bitmap em 2 instantes (delta 1129).
- **Gatilhos nos próprios elementos:** `.prod-head`/`.prod-stage`/`.ia .head`/`.ia-feats`/`#iachat` como triggers (antes era a seção inteira de 100vh, que disparava com o conteúdo ainda abaixo da dobra). Palco do produto: scrub `top 92%`→`top 22%` do stage; chat idem. Nada anima fora da tela.
- **Pricing:** `repeat(2, minmax(300px,410px))` — Free e PRO idênticos (medido: 410×456 ambos).
- **Nota do painel:** "é assim que a sua vida aparece no app" (e voltou a aparecer no mobile, já que não fala mais de scroll).
- QA (`?v=r14`): console limpo (único warning era do próprio probe getImageData do QA), travessia re-verificada com peças chegando dentro do quadro.

**Pendências:** ⏳ veredito da r14; fila: SplitText no h1 do hero, mobile dedicado da viva.

**Arquivos:** `prototypes/v5/landing/landing-viva.html`.

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
