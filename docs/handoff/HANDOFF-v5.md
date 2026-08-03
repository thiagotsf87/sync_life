# HANDOFF · Redesign SyncLife → DS v5 "Estúdio"

> Arquivo rolling: entrada mais recente no topo. Atualizado ao fim de TODA sessão, antes do commit final.
> Plano do programa: `~/.claude/plans/quirky-noodling-snail.md` (aprovado 2026-07-28). Branch: `poc/ds-v5`.
> Regras invioláveis: fidelidade ao `DESIGN-SYSTEM-v5.md` (protótipos vencem em divergência); protótipo → aprovação
> explícita do usuário → implementação → teste de identidade; mobile = protótipo dedicado por tela; handoff toda sessão.

## Onde estamos

**Ondas 00 e 01 fechadas e no ar em `web/`.** Landing (r15 desktop + m1 mobile), marca 3D, pricing,
login, cadastro, senhas e onboarding, todas com teste de identidade passado.

**Onda 02 pela metade.** O lote 1 (`/dashboard` = o Diário, chrome v5 e a camada do coach) está no ar.
O **lote 2 está parado** desde 2026-08-01. O lugar da Edição da semana **deixou de estar aberto**: ela
virou uma apresentação de Sy dentro do próprio Diário (ver a maquete da bancada). O Life Score segue
esperando aceite.

**Onda 03 é a frente ativa.** A identidade fechou em 2026-08-02: **Sy**, corpo **o Enxame**. Agora existe
a **maquete da bancada** (`app/diario-bancada.html`), que redesenha o Diário como a sala onde Sy mora,
com voz real ligada. Ela está **em refino, não aprovada**: o usuário gostou da bancada e pediu ajustes,
que foram aplicados em três rodadas na mesma sessão. Em 2026-08-03 o **Google Cloud TTS entrou como
provedor de voz** (a opção C). A maquete agora só espera a **chave do GCP** pra destravar os três votos
e a decisão de gênero da voz.

**Ondas 04 a 14 não começaram.**

## Decisões fechadas (não reabrir sem motivo novo)

| Decisão | O que ficou | Quando |
|---|---|---|
| **Nome do coach** | **`Sy`**, pronúncia "sai", da contração de **Sy**ncLife. Grafia travada (nunca SY nem sy). **Sem artigo**: nunca "o Sy" nem "a Sy". Sy é sujeito ou vocativo, nunca objeto com preposição contraída. "Sy achou uma coisa" ✅ · "pergunte ao Sy" ✅ · "o Sy disse" ❌ | 2026-08-02 |
| **Corpo do coach** | **O Enxame**: bando sem forma fixa com coração coral. 6 estados (repouso, ouvindo, pensando, falando, alerta, comemorando), cada um com silhueta própria e não só escala. Corpo roxo (marca), coração coral (a voz do coach no DS). O elétrico `#a1ff62` fica **fora**, é da marcação acesa da bússola | 2026-08-02 |
| **Superfície do coach** | Sy é **objeto sempre escuro** (DS §2.2, mesma regra da pill nav e das mini-telas): carrega a própria chapa escura pra dentro de página clara, inclusive no selo de 34px. Luz aditiva não brilha sobre fundo claro. O render não conhece tema | 2026-08-02 |
| **Enquadramento** | O editorial é o **formato da saída**, não a identidade do personagem. O Diário e a Edição da semana ficam intactos; Sy entrega uma edição mas **não é colunista**, é presença | 2026-08-02 |
| **A bússola é marca, não ator** | Usá-la como avatar do coach colapsaria duas identidades que precisam ficar distintas | 2026-08-02 |
| **Contrato de vida** | Os 7 sinais moram em `personagem/vida.js`, implementação única. Trocar a forma não pode significar reescrever comportamento | 2026-08-02 |
| **Stack de animação** | three.js (peça viva) + GSAP (landing) + motion.dev (app React, futuro). anime.js dispensada | 2026-07-31 |
| **O Diário é a sala de Sy** | O Diário deixa de ser "o dashboard" e vira o lugar onde Sy mora e é **ator**. Nas outras 67 telas ele é **copiloto**. Regra de dois registros, vale pras 68 telas sem decidir tela a tela | 2026-08-02 |
| **As 6 leis do cockpit** | 1 Sy oferece o caminho curto e nunca bloqueia o longo (saber/fazer × Sy faz/você faz) · 2 **modalidade é porta, não caminho**: voz e texto entram no mesmo lugar e a voz de saída nunca diz nada que não esteja escrito · 3 toda resposta com número traz o objeto visual junto · 4 ator no Diário, copiloto no resto · 5 todo destino é URL real com caminho de volta visível · 6 a Edição da semana é uma apresentação, não uma tela | 2026-08-02 |
| **Disciplina que contamina as ondas 04-14** | **Toda tela daqui pra frente entrega o pacote de contexto dela pro Sy.** Sem isso, "Sy traduz o que você está vendo" vira retrofit em 60 telas | 2026-08-02 |
| **Confirmação de ação** | Irreversível pede licença antes; reversível Sy faz e avisa, com desfazer à mão | 2026-08-02 |
| **Provedor de voz** | **Google Cloud TTS.** Vozes pt-BR nativas (sem o problema de sotaque), 1 milhão de caracteres grátis por mês, e aceita chamada direta do navegador (CORS verificado). Escolhido contra ElevenLabs Starter por resolver o sotaque na raiz e por ser o mesmo provedor da produção | 2026-08-02 |
| **Sy fala conclusão, a lâmina mostra a cifra** | O sintetizador lê "R$ 2.120" como "dois mil cento e vinte reais": 8 caracteres viram 28 falados. Número se mostra, não se recita. Tirar os números das falas cortou 18% da duração sem tirar nada da tela | 2026-08-02 |

## Aberto agora

- **O CONTEÚDO do Diário é frente própria, e não foi aprovado** (registro do usuário, 2026-08-03).
  Tudo que a Onda 03 fechou até aqui é **forma**: a bancada, os dois estados, lâmina × recorte, a voz,
  a altura. **O que Sy de fato traz** (com que critério ele escolhe o assunto, o que vira lâmina, o que
  entra na folha, em que ordem, com que recorte editorial) fica **para retomar depois**, como assunto
  separado. As falas do protótipo são **preenchimento para julgar o modelo**, não a copy final nem o
  modelo de conteúdo. Não tratar como decidido.

- **Os três votos da maquete da bancada**, que o usuário ainda não deu: (1) a bancada em si, elogiada mas
  ainda em refino; (2) **check-in na conversa ou em bloco**; (3) **`/coach` vira arquivo da conversa**, já
  que no Diário a conversa é a própria página e a camada lateral perde função ali.
- **A duração da apresentação.** Com voz medida, 25,2s no sintetizador do Windows. O corte disponível é
  fundir os tempos 2 e 3, que leva pra perto de 17s. **Não acelerar a digitação:** ela segue a duração real
  do áudio de propósito, e descolar quebra a lei 2.
- ~~A bancada fica alta no estado assentado.~~ **RESOLVIDO em 2026-08-03:** Sy encolheu de 200px pra
  164px no repouso, a coluna da fala alargou, a frase caiu de 3 linhas pra 2 e a bancada foi de 368px
  pra 288px. Falta só o aceite visual.
- **Gênero da voz.** Sy é sem artigo e sem gênero por decisão de marca, e todo TTS oferece vozes gendradas.
  A maquete deixa ouvir sem escolher: lista as vozes pt-BR do Google **rotuladas com o gênero**, premium
  primeiro. A decisão continua aberta, e agora dá pra tomar ouvindo.
- **Contradição na grafia de Sy, no próprio handoff:** a regra diz "sem artigo, nunca objeto com preposição
  contraída", e logo abaixo marca "pergunte ao Sy" como correto. A maquete evita as duas formas. Decidir
  qual vale antes da copy definitiva.
- **Riscos do nome, a medir antes de investir em voz:** a leitura padrão de "Sy" em pt-BR é "si", não
  "sai" (o Y vira /i/: Sylvia→Silvia), então a pronúncia tem que ser **ensinada no onboarding e na
  primeira edição** e o TTS precisa de fonema explícito; e "sai" é palavra comum do português, o que é
  risco de wake word.
- **Token pendente:** verde-delta no claro `#44a616` (também no ticker e no marquee).

## Próxima sessão (pauta do usuário)

**O Google Cloud TTS está ligado e já foi ouvido** (sessão 26, 2026-08-03). A chave foi criada, a
apresentação rodou com voz pt-BR nativa e o veredito do usuário foi **"a voz ficou boa"**. Sobra a
decisão, que é dele:

1. **Dar os três votos abertos** (a bancada, check-in na conversa ou em bloco, `/coach` vira arquivo)
   e **decidir o gênero da voz**. O painel lista as vozes pt-BR do Google com o gênero no rótulo,
   premium primeiro, e toca amostra na hora em que você troca: dá pra comparar sem rodar a apresentação.
2. Decidir também **a duração** (fundir os tempos 2 e 3 leva de 25,2s pra perto de 17s) e **a altura da
   bancada no assentado** (encurtar a frase da próxima ação, ou Sy encolher mais no repouso).
3. Com os votos, fechar a maquete e virar protótipo definitivo da onda (desktop + mobile dedicado 390×844).

**Por que o ElevenLabs caiu:** no plano grátis a API **bloqueia as vozes da biblioteca**
(`paid_plan_required`), inclusive as que já estão salvas na conta. Sobram só as 21 vozes premade, todas de
locutores nativos de inglês, que falam português puxando pro europeu. Verificado com o ID público e com o
ID da própria biblioteca do usuário, nos dois modelos. Destravar custaria o Starter, ~US$ 5/mês.

## Como rodar

| O quê | Comando |
|---|---|
| Protótipos | `python -m http.server 8123` dentro de `prototypes/v5/`, hub em `http://localhost:8123/` |
| App | `node node_modules/next/dist/bin/next start -p 3006` dentro de `web/` |

Gotchas de ambiente: `npx next start` dá **exit 127** aqui, por isso o caminho completo do bin · no QA de
protótipo, validar com `?v=rN` por causa do cache do `http.server` · nunca usar `curl` em localhost no
MINGW64, trava a sessão · o terminal roda com CWD em `web/`, então é `git add src/...` e não `web/src/...`.

Tags: `poc-landing-r4` · `poc-landing-viva-r15` · `poc-landing-viva-mobile-m1` · `poc-onda1-publico-auth-r2`.

## Status das ondas

| Onda | Escopo | Protótipo | Aprovação | Implementação | QA identidade |
|---|---|---|---|---|---|
| 00 | Landing v2 + marca 3D | ✅ viva r15 + mobile m1 (r4 segura preservada) | ✅ **COMPLETA: desktop r15 + mobile m1 (2026-07-30)** | ✅ `web/` (2026-07-30) | ✅ desktop delta 0px · mobile ok (nota scrollbar) |
| 01 | Público + auth (pricing, login, cadastro, senhas, onboarding) | ✅ 6 telas ×2 (2026-07-31) | ✅ **APROVADA (r2, 2026-07-31)** | ✅ `web/` (2026-07-31) | ✅ desktop + mobile ok, console zero |
| 02 | Chrome do app + Dashboard (3 telas) | ✅ lote 1: Diário + camada do coach (2026-07-31) · ✅ lote 2: Edição da semana + Life Score, D+M (2026-08-01) | ✅ **lote 1 APROVADO (2026-07-31)** · 🟡 **lote 2: o lugar da Edição da semana foi RESOLVIDO** em 2026-08-02 (vira apresentação de Sy no Diário, ver Onda 03); o conteúdo do protótipo sobrevive, a moldura de tela separada cai · ⏳ Life Score só esperando aceite, não foi criticado | ✅ lote 1 em `web/` (2026-08-01) · lote 2 parado | ✅ lote 1 desktop 1440 + mobile 390 (diff CSS regra a regra, 0 ausentes) · ✅ lote 2 QA dos protótipos PASS (console 0/0, E-02 com JS off, consistência cruzada nas 6 telas) |
| 03 | Coach **Sy**: identidade + **a bancada** + vista cheia + backend N1-N2 | ✅ **Sy, o Enxame** (`personagem/enxame.html`) + **maquete da bancada** (`app/diario-bancada.html`, 2026-08-02): dois estados do Diário, lâmina × recorte, ações com licença, voz real · ✅ **Google Cloud TTS ligado (2026-08-03)** | ✅ **IDENTIDADE APROVADA (2026-08-02)** · 🟡 **bancada em refino**: elogiada, 3 rodadas de ajuste aplicadas, faltam os 3 votos (bancada, check-in, `/coach`) + gênero da voz, todos **esperando a chave do GCP** | – (nada em `web/` ainda) | ✅ console 0/0 em 18 recargas · fluxos de ação, licença, desfazer e portão verificados por DOM · sincronia de voz medida · ✅ voz: troca de provedor, chave inválida, degradação sem chave e 15 asserções de lógica pura (`window.__voz`) · ✅ **síntese real ouvida em voz pt-BR nativa e aprovada** pelo usuário (2026-08-03) · ✅ altura da bancada travada: oscilação 0px em apresentando, assentado, durante a digitação e em corrida real |
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

## 2026-08-03 · Sessão 26 — Google Cloud TTS ligado na maquete (a opção C virou código)

> Sessão curta e de uma coisa só: o passo 1 da pauta. **Nada em `web/` foi tocado** e
> **nada da bancada mudou de desenho** — só a camada de voz. A maquete continua **em refino**,
> esperando os mesmos três votos, que agora dependem só da chave do usuário.

### O que entrou

O painel de voz virou **um bloco só servindo dois provedores**. O segmento ganhou **Google** ao lado
de ElevenLabs (Google primeiro, porque é a decisão), e o que muda entre eles é só a lista de vozes, o
segmento de modelo (que só o ElevenLabs tem) e o tamanho da cota. A disciplina dos três cuidados
continua idêntica: chave só no `localStorage`, áudio cacheado no Cache API por (voz + modelo + texto),
gasto contado e à vista.

**Estado por provedor, em chaves separadas.** Escolher o Google não apaga a chave do ElevenLabs: cada
um tem `sy.<provedor>.{chave,voz,modelo,gasto}`, e as chaves `sy.11.*` que já existiam seguem valendo.
A chave de cache não mudou de formato de propósito — id de voz do Google (`pt-BR-Chirp3-HD-Aoede`) e do
ElevenLabs (hexadecimal) não colidem, então **o áudio já gerado em sessões passadas sobreviveu**.

**As vozes vêm da API, filtradas em pt-BR, premium primeiro** (Chirp3-HD → Neural2 → Studio → Polyglot
→ WaveNet → Standard) e **rotuladas com o gênero**. Isso é de propósito: Sy é sem gênero por decisão de
marca, e a escolha (ou a recusa das duas) tem que ser **ouvida**, não deduzida de um nome de voz.

**O corpo do `synthesize` é mínimo** — `audioEncoding: MP3` e nada mais. Sem `speakingRate`, porque a
lei "não acelerar a digitação" quer rate 1; e sem `pitch`, porque as vozes Chirp rejeitam parte dos
ajustes de `audioConfig`. Corpo mínimo é também o menor número de modos de rejeição.

### Gotchas novos (LEI)

9. **A chave do Google vai no cabeçalho `X-Goog-Api-Key`, nunca em `?key=`.** Query string vaza em log
   de rede, histórico e referer. **Verificado empiricamente** com chave falsa antes de escrever o
   provedor: o preflight passa e a resposta é legível, em GET (`/v1/voices`) e em POST
   (`/v1/text:synthesize`). Era isso que decidia a implementação, por isso foi testado primeiro.
10. **A cota grátis do Google é por família de voz, não uma só**, e o contador troca de teto quando
    você troca de voz. Números lidos na **tabela viva** da página de preços em 2026-08-03:
    Chirp3-HD 1 M (US$ 30/M depois) · Neural2 1 M (US$ 16/M) · Polyglot 1 M (US$ 16/M) ·
    Studio 1 M (**US$ 160/M**, a mais cara de longe) · WaveNet e Standard 4 M (US$ 4/M).
    **A WaveNet foi repreçada pro SKU da Standard** e hoje custa US$ 4/M, não os US$ 16/M antigos.
    Ler a página viva não foi preciosismo: **o WebFetch trunca a tabela e a busca devolve os números
    velhos** (dava WaveNet como 1 M grátis). Foi preciso abrir no navegador e ler o DOM.
11. **`audioContent` vem em base64, não em binário.** Diferente do ElevenLabs, que devolve o mp3 no
    corpo. Precisa de `atob` → `Uint8Array` → `Blob('audio/mpeg')`, senão o `<audio>` recebe texto.
12. **Chave recusada não pode ser gravada.** O `localStorage` só recebe a chave **depois** da API
    responder com vozes. Testado com chave inválida: mensagem limpa na tela e `sy.gg.*` continua vazio.
13. **`Requests from referer <empty> are blocked` quer dizer protótipo aberto como `file://`.** Página
    aberta como arquivo não tem origem pra mandar, e sem `Referer` **nenhuma** restrição de site do
    Google pode casar, por mais certa que a lista esteja. Custou uma rodada de diagnóstico. A maquete
    agora traduz esse erro sozinha, e as duas chamadas ao Google mandam `referrerPolicy: 'origin'`
    explícito, porque a política padrão do navegador nem sempre manda `Referer`.
14. **Transição de CSS não avança em página oculta (`document.hidden`), e `getComputedStyle` devolve o
    valor DE PARTIDA indefinidamente.** Envenenou três medições nesta sessão e quase virou dois
    diagnósticos errados: o `min-height` parecia preso em 82,44px, e Sy parecia **não crescer** pra
    280px no apresentando (a regra sempre esteve certa, e o CSSOM confirmou que ela existia e casava).
    **Regra de QA: antes de medir qualquer propriedade que tenha `transition`, desligue a transição**
    (`el.style.transition='none'` + reflow forçado), senão a medida é do estado anterior. Aqui isso vale
    pro `min-height` da fala, pro `grid-template-columns` do `.bin` e pro `width` do Sy, os três.
15. **QA de protótipo: `requestAnimationFrame` não roda em aba de segundo plano** e o `setTimeout` é
    afunilado pra ~1s, o que subamostra qualquer medição por tempo e estoura o limite da ferramenta.
    Para medir layout, ou frontear a aba, ou (melhor) medir **de forma síncrona**: escrever cada texto
    no elemento e ler a altura no mesmo laço, que nenhum timer consegue interleave.

### A voz rodou, e a bancada parou de respirar

**O usuário ouviu e aprovou: "a voz ficou boa".** Primeira vez que a apresentação foi julgada com som
nativo. Os três votos e o gênero continuam abertos.

Ouvindo, ele achou um defeito que só aparece em movimento: **a chapa da bancada crescia e encolhia
conforme o tamanho da frase**, letra a letra enquanto Sy digitava. Medido antes do conserto: a fala
oscilava **93px** entre a frase mais longa (3 linhas, 140px) e o check-in (1 linha, 47px). O
`min-height:2.3em` que existia cobria só **2** linhas.

**O conserto é medir, não contar linha.** A fonte é `clamp()` e a quebra depende da largura, então
"reserve 3 linhas" erra em algum viewport. Um clone fora da tela recebe a mesma tipografia e a mesma
largura da coluna, mede cada frase, e a altura trava na maior. A trava é aplicada **antes** de digitar,
então a caixa já nasce do tamanho final. `abertura()` trava na frase mais alta da apresentação inteira,
então ela não mexe uma vez sequer do primeiro tempo ao check-in. Quem troca de layout (assentar, repouso,
resize) zera o piso e remede, porque a fonte e a largura da coluna mudam junto.

**Resultado medido:** oscilação **0px** com 7 frases no estado apresentando, **0px** com 7 no assentado,
**0px** em 12 pontos de amostra durante a digitação de uma frase de 3 linhas, e **0px** numa corrida real
da apresentação (12 amostras, 5 frases diferentes). A única variação que sobrou é entre apresentando e
assentado, que é a transição de estado desenhada, não o texto.

### Sy encolhe no repouso: 164px, medido

Travar estabilizou mas não encurtou, e a bancada seguia **alta** no assentado. O usuário aprovou aplicar
a preferência que já estava registrada: Sy encolhe, em vez de encurtar a frase.

**O tamanho saiu de medição, não de olho.** Encolher Sy alarga a coluna da fala, e a pergunta é em que
ponto a frase da próxima ação cai de 3 linhas pra 2:

| Sy | Coluna da fala | Frase | Bancada |
|---|---|---|---|
| 200 (antes) | 578px | 3 linhas | 368px |
| 180 | 598px | 2 linhas | 327px |
| **164 (agora)** | 614px | 2 linhas | **288px** |
| 148 e abaixo | 630px+ | 2 linhas | 288px, não baixa mais |

**164px é o ponto ótimo:** abaixo dele quem passa a mandar na altura é o bloco da fala, então a chapa
para de encolher e só se perde presença de Sy. Resultado: **368px → 288px, 22% mais baixa**, com
oscilação **0** em 5 frases. O apresentando não muda (Sy 280px, bancada 401px, oscilação 0).

### QA (feito, sem chave válida — esse é o limite honesto)

Console **0/0** em todo o exercício. Verificado por DOM: troca de provedor repinta o painel inteiro
(placeholder, lista, segmento de modelo, cota) · chave inválida dá mensagem específica do Google e
**não grava nada** · pré-gerar sem chave avisa em vez de tentar · voltar pro ElevenLabs restaura a
lista, o segmento e o **gasto próprio dele** · mudo esconde o painel · a apresentação com Google
selecionado e sem chave **degrada pra mudo com aviso, não trava** · apresentação no mudo segue
rodando · pular segue caindo no check-in.

Lógica pura testada pelo gancho novo `window.__voz` (15 asserções, todas passando): família extraída
do nome da voz, cota por família, ordenação premium-primeiro, e o base64 → Blob (tipo, tamanho e os
bytes de cabeçalho ID3, mais o caso de entrada vazia).

**O que NÃO foi verificado, e não dá pra verificar aqui:** a síntese de verdade. Ela precisa de uma
chave válida, e a chave depende do usuário criar o projeto no GCP. O timbre, a duração real das falas
em voz nativa e a pronúncia de "Sy" continuam **não medidos**.

### Risco a registrar

Chave de API dentro do navegador é exposta por construção. Pra maquete em `localhost` está certo, e a
restrição por referenciador e por API reduz o estrago. **Em produção a chamada tem que ir pro
servidor** — o que também casa com o roteiro das APIs de IA, que já são route handlers.

### Arquivos

- `prototypes/v5/app/diario-bancada.html` — só a camada de voz e o painel. O desenho da bancada,
  os dois estados, lâmina × recorte e os fluxos de ação não foram tocados.
- este handoff.

---

## 2026-08-02 · Sessão 25 — A bancada: o Diário vira a sala de Sy (maquete de decisão, em refino)

> Sessão de desenho, não de implementação. **Nada em `web/` foi tocado.** O usuário disse
> explicitamente que não conseguia aprovar a bancada por descrição, então a sessão virou
> construção de uma **maquete de decisão** e três rodadas de refino em cima dela.

### A pesquisa que abriu a sessão (pedido do usuário)

O `hectorg2211/jarvis` que ele mandou é **um arquivo Python**: detecta duas palmas por pico de
amplitude, toca uma saudação do ElevenLabs e abre Spotify, Chrome e Cursor. Sem interface, sem LLM,
sem function calling. Pedido dele, pesquisei projetos mais completos. Saíram **três famílias**:

1. **Assistentes de desktop** (DawoodTouseef, novik133/KDE, Hasan-Ikbal, kishanrajput23). O "Jarvis"
   deles é controlar o computador. A tela é chat escuro + onda de áudio. **Não serve.**
2. **Cockpit de voz no navegador** ([eadmin2/jarvis_ai](https://github.com/eadmin2/jarvis_ai)). O mais
   útil: anel central, transcrição ao vivo, **painéis convocados pelo agente**, cartão de aprovação
   antes de operação perigosa, STOP e Esc sempre à mão, boot cinematográfico. JS puro + FastAPI +
   faster-whisper + ElevenLabs em streaming, round-trip 3 a 5s.
3. **HUD que apresenta um cenário** ([calesthio/Crucix](https://github.com/calesthio/Crucix)). 27 fontes,
   globo WebGL, **painel de delta** (o que mudou desde a última varredura) e alertas em três níveis.

**O achado desconfortável:** o Crucix embute um botão **"VISUALS LITE"** que desliga a própria estética.
Scanline e blur são caros e viram ruído na segunda semana. Conclusão levada pro desenho: o que faz
parecer Jarvis não é a scanline, são quatro **comportamentos** (leu tudo antes de você chegar · mostra o
que olha enquanto fala · age e pede licença no irreversível · pode ser interrompido).

### O que a conversa fechou

O Diário deixa de ser "o dashboard" e vira **a sala onde Sy mora**. Detalhe em "Decisões fechadas", no
topo: os dois registros (ator/copiloto), as 6 leis, a disciplina do pacote de contexto por tela, e a
regra de confirmação. A Edição da semana **parou de ser um problema em aberto**: virou uma apresentação
de Sy, e o botão fantasma do chrome morre.

### A maquete: `prototypes/v5/app/diario-bancada.html`

Desktop só, de propósito: mobile dedicado depois dos votos, senão faz duas vezes. Painel flutuante no
canto (instrumento, não produto) com 5 alternadores e 6 ações de teste.

**A bancada** é uma chapa escura ancorada no topo com o Enxame, a fala de Sy e a linha de comando. O nome
resolve a briga entre "cockpit" e o DS editorial: bancada é onde o apresentador senta.

**Dois verbos de materialização, e só dois.** *Acender* (o objeto já está na edição, pisca quando Sy cita,
custo quase zero) e *recortar* (a resposta entra impressa embaixo da bancada). A entrada do recorte é
**impressão**, varredura da esquerda pra direita, não holograma: scanline de ficção científica brigaria
com o DS.

**A tela tem dois estados** (isso veio da rodada 2 de feedback): na **apresentação** Sy cresce pra 280px,
tudo em volta recua pra 40% e **a edição não existe**; ele fala em quatro tempos e cada um deixa uma
**lâmina** na tela. No fim ele **para e espera**. A edição só abre quando você responde o check-in (que É
o aceno) ou pede pra ver. Nos acessos seguintes a tela já nasce assentada, e aí a folha é o **registro
escrito** do que ele disse, **sem byline**.

**Lâmina × recorte** têm vidas opostas de propósito: lâmina é passageira (filete neutro, "ao vivo", some
quando a edição assenta), recorte é permanente (filete roxo, veio de pergunta sua, tem dispensar). Ao
assentar, **só as lâminas saem**; um recorte pedido no meio fica.

### A voz

Pedido do usuário: "sem a voz fica difícil avaliar em sua plenitude". Entrou via **Web Speech API** e
depois **ElevenLabs**, com chave em `localStorage`, cache de áudio e contador de cota à vista.

**Decisão final: Google Cloud TTS** (opção C), porque no grátis do ElevenLabs a API **bloqueia as vozes da
biblioteca**, inclusive as já salvas na conta, e sobram só locutores nativos de inglês puxando o português
pro europeu. Detalhe e números em "Próxima sessão".

### Gotchas novos (LEI)

1. **`speechSynthesis.cancel()` dispara o `onend` da fala cancelada.** Sem um contador de geração,
   pular a apresentação **ressuscitava** o tempo seguinte pelo callback de uma fala já descartada.
2. **TTS expande número.** "R$ 2.120" é lido como "dois mil cento e vinte reais": 8 caracteres viram 28
   falados. Qualquer modelo de caracteres-por-segundo erra feio em copy financeira. Daí a lei "Sy fala
   conclusão, a lâmina mostra a cifra", que cortou a apresentação de 30,8s pra 25,2s sem tirar nada da tela.
3. **Curva de rate do SAPI pt-BR, medida:** 11,9 c/s em rate 1 · 14,7 em 1.6 · 16,4 em 2.2. Retorno
   decrescente forte; 1.6 é o ponto que representa locução natural.
4. **ElevenLabs grátis bloqueia voz de biblioteca via API** (`paid_plan_required`), mesmo depois de
   adicioná-la à conta. Verificado com o ID público e com o da biblioteca do usuário, nos dois modelos.
5. **ElevenLabs e Google TTS aceitam chamada direta do navegador** (CORS verificado nos dois). Protótipo
   estático não precisa de backend pra voz.
6. **Cache API funciona em `http://localhost`** (é contexto seguro). Cachear áudio por
   `voz|modelo|texto` é obrigatório com cota pequena: sem isso cada replay queima a apresentação inteira.
7. **Estado de check-in vaza entre rodadas.** `abertura()` precisa limpar as fichas de humor, senão dava
   pra responder no meio da apresentação e furar o portão. (Achado testando, corrigido.)
8. **Nunca acelerar a digitação pra encurtar a apresentação.** Ela segue a duração real do áudio de
   propósito; descolar quebra a lei 2. O corte é menos tempos ou frases mais curtas.

### Arquivos

- **novo** `prototypes/v5/personagem/enxame.js` — o renderizador do Enxame extraído do `enxame.html`,
  porque a partir da bancada ele vive em três escalas na mesma página. `vida.js` continua sendo o
  comportamento, `enxame.js` passa a ser a forma.
- `prototypes/v5/personagem/enxame.html` — agora importa o módulo. **Re-verificado: 4 instâncias, 165 fps,
  console limpo, idêntico ao aprovado.**
- **novo** `prototypes/v5/app/diario-bancada.html` — a maquete.
- `prototypes/v5/index.html` — a linha "Diário como cockpit de Sy" virou link pra maquete, em aprovação.
- este handoff.

---

## 2026-08-02 · Sessão 24 — O personagem fecha: Sy, o Enxame (forma, nome e enquadramento APROVADOS)

> Sessão longa, com 5 reprovações antes do acerto. As rodadas abaixo estão em ordem **decrescente**
> (a que valeu primeiro). O que ficou de pé está na Rodada 5; as rodadas 1 a 4 ficam registradas
> porque o motivo de cada reprovação evita que alguém refaça o caminho.

**As quatro decisões desta sessão** (detalhe em "Decisões fechadas", no topo do arquivo): o corpo é
**o Enxame** · o nome é **Sy** · o editorial é **formato da saída, não identidade** · Sy é
**objeto sempre escuro**.

### Rodada 5 — recomeço do zero: o contrato de vida, três corpos, e o Enxame escolhido

Depois de cinco reprovações seguidas o usuário mandou apagar tudo sobre cérebro e rosto e recomeçar.
**A causa raiz das cinco:** eu insistia em código desenhar coisas que o olho humano tem detector treinado
pra reprovar. Rosto com 2% de erro não fica quase bom, fica horrível. **A saída** veio das próprias
referências dele: Jarvis não tem forma nenhuma (anéis, partículas e luz), HAL é um círculo, Eve são dois
traços. Logo, **aliveness é problema de comportamento, não de anatomia** — e comportamento é justamente o
que código faz bem.

**`personagem/vida.js` (novo, fonte única):** os sete sinais — 01 respiração (nunca para) · 02 atenção
(se orienta pra você) · 03 antecipação (130ms recuando antes de ir) · 04 inércia (mola subamortecida,
zeta ~.59) · 05 assimetria (ruído baixo em tudo) · 06 esforço (o estado tem peso) · 07 recuperação (volta
pela mesma mola). Mais `Mistura`, que dá **uma mola por parâmetro de estado**: partes do corpo chegam
antes das outras, e é isso que separa transição de corpo de crossfade. Consumido por `vivo.html` e
`enxame.html`.

**`personagem/vivo.html` (rodada 4):** Enxame · Lente · Matéria, mesmo contrato, só a forma muda.
**O usuário escolheu o Enxame.** A Lente e a Matéria ficam como registro da comparação.

**`personagem/enxame.html` (rodada 5, o que está em aprovação):** 6 estados × 3 escalas.
Corpo roxo (marca) com coração coral (o DS já define coral como a voz do coach); o elétrico `#a1ff62`
ficou **deliberadamente de fora**, é a língua da bússola.

**Achados que valem pra implementação:**
- **Raio comum produz casca de bola.** Cada ponto precisa do seu raio-alvo (`camada[i]`, expoente < 1
  pra adensar o miolo), senão o bando sai como uma esfera de pontinhos.
- **Sortear o núcleo por índice quebra**, porque o índice já define a latitude na espiral de Fibonacci:
  os 12% iniciais caíram todos num polo e o miolo saiu como um risco branco atravessado. Tem que ser hash.
- **Empilhar sprite aditivo satura em branco.** O coração virou peça própria (um `Sprite` controlado), e
  os pontos pararam de precisar estourar.
- **Giro uniforme faz anéis coerentes**, e anel de pontos brilhantes lê como arame. **Rotação diferencial**
  (velocidade angular por camada) cisalha o anel e o que sobra é braço espiral, que é o que bando faz.
- **Campo de turbulência suave move vizinhos em bloco.** Precisa de fase por ponto (`i * .017`), senão o
  miolo anda rígido.
- **Estado precisa de silhueta, não de escala.** Os seis saíram idênticos em tamanhos diferentes até
  entrarem `anel` (achata contra o plano da órbita, vira disco) e `oco` (esvazia o miolo, vira casca).
- **Achatar em Z é invisível de frente:** disco virado pra câmera continua círculo. Sem inclinar o objeto,
  "ouvindo" saía idêntico a "repouso".
- **`metalness` alto sem environment map renderiza quase preto** (engoliu as lâminas da íris na Lente).
  A saída certa aqui não foi acrescentar PMREM e sim baixar o metal: verniz sobre corpo fosco lê macio, e
  macio é o que separa o coach da bússola, que é cromo espelhado. De quebra sumiu o warning de shader que
  o PMREM dispara no ANGLE.
- **Aditivo não sobrevive ao tema claro:** somar coral sobre branco dá branco. A primeira saída (duas
  texturas de núcleo + troca de blending + corte de brilho) entregava uma versão pior no claro, e o
  usuário reprovou o claro por isso. **A saída certa era a regra que o DS já tem:** §2.2, "objetos sempre
  escuros" (pill nav, mini-telas). O enxame virou objeto sempre escuro — carrega a própria chapa `.chapa`
  mesmo em página clara, inclusive o selo de 34px dentro do cartão branco da folha do briefing. Isso
  **apagou** o ramo de tema no render inteiro: `quadro(dt, estado)` não conhece mais o tema.

**QA:** console 0/0 · 165 fps com as 4 instâncias simultâneas · claro e escuro · `prefers-reduced-motion`
sem movimento nenhum (pose por estado, redesenhada só na troca) · `noscript` explícito.
Ganchos de QA: `window.__enxame.{estado,tema,pecas}` e `window.__vivo.{estado,tema,pecas}`.
**Gotcha da folha de contato:** o buffer WebGL some no fim do quadro, então antes de cada `drawImage` é
preciso chamar `peca.quadro(...)` na hora; sem isso a folha sai vazia.

### Rodada 3 — "O projetado": luz em camadas (Minority Report) · O ROSTO FINALMENTE LÊ

**Veredito do usuário sobre a rodada 2e:** *"Nenhuma forma está correta, nem o cérebro nem o rosto."*
Correto. Tentei ainda **giros por conjunto-zero de campo de ruído** (a única coisa aqui que é
genuinamente proceduralizável, porque giro É um labirinto): melhorou a superfície, **não resolveu**.
Registrado como tentativa medida, não como conserto.

**Diagnóstico final do beco, e ele é meu:** eu pedi **silhuetas**, e silhueta é contorno — contorno
joga fora tudo que está dentro dele. Só que a identidade de um cérebro (os giros) e de um rosto (as
feições) mora **dentro**. Silhueta entrega **proporção**, e proporção correta produz exatamente o que
estava na tela: uma bolha com as medidas certas. Escultura por procedimento tem teto, e o teto é esse.

**A virada veio do usuário:** e se a inspiração fosse **Matrix, Eu Robô, Minority Report**? Escolha
dele: **Minority Report lidera**. E isso não é troca de gosto, é troca de categoria que **resolve o
beco por construção**: o personagem deixa de ser escultura e vira **projeção**, e projeção é
**esquemática por convenção** — ninguém cobra pele de um holograma. Um rosto de linhas no idioma de
**rastreamento facial** lê como rosto sem nenhuma anatomia.

**`personagem/projetado.html` (novo).** Lâminas de vidro translúcido em profundidade, cada uma com
conteúdo próprio, que se reorganizam por estado. Vidro azul-frio e luz aditiva; **sem cromo e sem
neon** (é por isso que Minority Report envelheceu bem). Nada opaco. Não usa nada da linguagem da
bússola. Linguagem emprestada, desenho autoral — os designs dos filmes têm dono e não foram copiados.

| Estado | O que a peça faz |
|---|---|
| dormindo | uma lâmina quase parada, cantos em colchete, varredura lenta. Discreto, que é o requisito |
| lendo | as lâminas abrem em profundidade e o dado corre por elas, cada uma no seu passo |
| pensando | as lâminas **deitam** e viram cortes empilhados, leitura de exame. Reaproveita a silhueta do cérebro |
| **falando** | **o rosto lê**: contorno oval autoral, órbitas, íris, sobrancelha, nariz, boca que abre na amplitude da voz, mais a malha esparsa de marcos |
| ouvindo | tudo recolhe e sobra um medidor de nível: atenção como quietude |
| alertando | coral, lâminas desalinhadas, triângulo de alerta |

**Avaliação honesta por estado:** cinco dos seis leem bem. **`pensando` é o mais fraco** — lê como
pilha de fatias formando um volume, mas a forma do cérebro não fica legível nesse arranjo. Não vou
chamar de resolvido.

**Decisões de execução que importaram:** o contorno da cabeça é **oval autoral**, não a silhueta
extraída (`cabeca_frente` trazia ombro e cabelo junto e virava mancha) · a malha de marcos liga pontos
**por proximidade**, com faixa de distância, senão vira grade em cima da cara · moldura só nos cantos,
porque quadro inteiro competia com o conteúdo · `orbita.scale 2.3` porque a lâmina tem 1 unidade e a
peça ocupava 1/4 do quadro.

**Gotcha novo:** o buffer WebGL é limpo a cada quadro, então `drawImage(canvas)` fora do laço de
render copia vazio. Para montar folha de contato de estados é preciso `renderer.render()` **imediato**
antes de cada cópia. (A folha de 6 estados num screenshot é o loop de feedback que faltava desde o
começo desta sessão.)

**QA:** 165 fps · console 0/0 nos 6 estados.

**Próximo passo:** aceite da direção. Se aprovada: consertar `pensando`, decidir o nome, e a boa
notícia é que **o problema de escala pode ter morrido junto** — uma projeção chapada tem chance real
de sobreviver a 38px, coisa que nenhum dos 3D conseguiu. Depois: integração no Diário. O lugar da
revisão semanal segue **sem decisão** desde a sessão 23.

**Arquivos:** `prototypes/v5/personagem/laboratorio.html` (rodada 1) · `prototypes/v5/personagem/laboratorio-3d.html` (rodada 2) · `prototypes/v5/index.html` · este handoff.
**Nenhum código de `web/` e nenhum protótipo do lote 2 foi tocado.**

---

### Rodada 2e — cérebro construído pelas duas vistas; cabeça bloqueada em referência

**Construção por duas vistas ortogonais, implementada.** Para cada vértice: a altura vem do próprio
vértice, a **seção naquela altura** sai das duas silhuetas (a de lado dá o par frente/trás em Z, a de
frente dá o par esquerda/direita em X), e o **azimute** decide de que lado da seção o vértice cai.
Meia-elipse **por quadrante**, para a assimetria da forma real sobreviver (lobo frontal na frente,
occipital atrás). Extensões pré-calculadas numa LUT de 129 alturas: sem isso seriam ~3,7 M operações
por quadro, com isso é O(1) por vértice.

- **Cérebro: FUNCIONANDO.** A silhueta extraída manda na forma — lobo frontal, calota, occipital,
  temporal e tronco aparecem porque estão na referência, não porque eu chutei. Fissura e giros entram
  como **relevo por cima** da forma construída, não como a forma.
- **Cabeça: bloqueada, e não por esforço.** O `ref3.svg` **não serve como fonte de perfil**: nele a
  cabeça é um recorte escuro de contorno fino, então o que o limiar acha de mais brilhante é o reflexo
  da calota e as bolhas flutuantes, nunca nariz/lábio/queixo. Varredura de desfoque 10→34 confirmou:
  em nenhum ponto o contorno pega o rosto. Isolar o maior componente conectado também não resolve,
  porque o desfoque necessário já funde as bolhas na cabeça. **`cabeca_perfil` foi removida do
  `silhuetas.json`** (com `_nota` explicando) e o estado "falando" cai no aproximado, declarado na
  ficha da peça. **Falta uma referência de perfil com a cabeça clara contra fundo uniforme.**

**Melhoria no extrator:** `folha.html` ganhou isolamento do **maior componente conectado** (rotulagem
por BFS 8-vizinhos), útil para referências com sujeira solta em volta. Não salvou o `ref3`, mas fica
para as próximas.

**QA:** 165 fps · console 0/0 em 2 corpos × 6 estados.

### Rodada 2d — as formas reprovadas, e o pipeline de silhueta que resolve

**Veredito do usuário:** *"Nenhuma forma está correta. A textura eu gostei. O cérebro nem de longe
parece um cérebro, e o rosto muito menos: basicamente um círculo com uma área pulsando."* Correto.
**Textura aprovada, formas reprovadas.**

**Causa raiz (minha, e repetida 4 vezes):** eu estava esculpindo **fórmulas sobre uma esfera**. Cérebro
e cabeça não são esfera perturbada; nenhuma combinação de gaussianas chega lá. Insisti em calibrar em
vez de trocar de técnica. Também tinha um loop de feedback ruim: um screenshot por tentativa, chute
numérico em cima de forma 3D.

**A virada veio do usuário perguntar "o que eu posso fazer pra te ajudar".** Resposta: referências que
sirvam de **geometria**, não de clima. E daí saiu a ferramenta que destrava tudo.

**`refs/silhueta.html` e `refs/folha.html` (novos):** pegam qualquer referência (SVG, PNG, JPG),
**desfocam** pra fundir a estrutura interna num corpo sólido, limiarizam e marcham de fora pra dentro
em 180 direções, devolvendo a **silhueta como tabela de raios** a partir do centro de massa. Reportam
**rugosidade** pra dizer se a extração ficou limpa. O `folha.html` faz isso em lote, com contorno
desenhado por cima pra conferência visual.
- **Isso resolve o caso do SVG vetorizado automaticamente** (1950 paths de manchas de cor, sem contorno
  único pra ler): a silhueta sai do **raster**, não dos paths. E baixa a exigência sobre o usuário —
  render neon serve, não precisa ser silhueta chapada; o que importa é o **ângulo**.
- Gotcha: dentro de um documento SVG, `document.createElement('canvas')` cria no namespace SVG e não
  tem `getContext`. Tem que ser `createElementNS` com o namespace XHTML.

**`refs/silhuetas.json` (novo):** as 4 vistas necessárias já extraídas e validadas, 180 raios cada —
`cerebro_lado` (rug .0128) · `cerebro_frente` (.0082) · `cabeca_perfil` (.0145) · `cabeca_frente`
(.0166). Todas abaixo de .02, que é o limiar de "limpa". **É este arquivo que alimenta a construção
3D na próxima rodada.** Os SVGs de origem ficam fora do git (`.gitignore` na pasta, asset de terceiro).

**Rede orgânica (pedido do usuário, feito):** a icosfera regular lia como domo geodésico. Agora os
vértices levam um empurrão **tangencial** de ~30% do passo da malha (tangencial pra não inflar a
esfera), **28% das arestas são derrubadas** com brilho próprio por aresta, ~12% dos nós pesam 2-3× mais
que os outros, e o repouso deixou de ser esfera perfeita. Núcleo e filamentos foram baixados porque
estouravam em branco no centro.

**QA:** 160 fps · console 0/0 em 2 corpos × 6 estados.

### Rodada 2c — "O simbionte": um corpo só, com referências visuais do usuário

**Correções do usuário nesta rodada (duas, em sequência):**
1. **"O núcleo é o menos pior"** + 4 referências visuais (rede triangulada densa · cérebro wireframe ·
   **rosto de perfil** wireframe · poliedro facetado com brilho neon). Primeira tentativa minha:
   casca facetada por fora com a forma morfando por dentro.
2. **Rejeitado:** *"Não quero que o cérebro fique dentro de outra coisa, ou o rosto, não vai ficar
   legal; a 4ª imagem é só referência para textura."* Especificação final: **um corpo só**, forma base
   da **referência 3** (esfera de nós com núcleo aceso e filamentos), **textura da referência 4**
   (sólida, 3D, cores do DS), que **se molda conforme o estado ou a interação**.

**Estado atual (`personagem/laboratorio-3d.html`, 2 corpos):**
- **1 · O simbionte** — icosfera indexada (detalhe 4) com **painéis sólidos facetados translúcidos**
  (`flatShading`, opacity ~.3, violeta do DS), arestas e nós acesos, **núcleo emissivo no centro** e
  **90 filamentos** do núcleo até a superfície. Sem casca externa, sem anel, nada aninhado. Morfa em:
  esfera · lente com varredura · cérebro · cabeça de perfil · côncavo · espinhos.
- **2 · A trança** — mantida como alternativa de material (nó tórico com iridescência).

**Três achados técnicos desta rodada (todos custaram uma iteração cada, valem pra implementação):**
1. **Deslocamento radial não faz perfil.** No alto do crânio o raio aponta pra cima, então empurrar
   "pra frente" no raio nunca vira testa-nariz-queixo. O perfil tem que empurrar **no eixo Z**.
2. **Gaussianas soltas viram espinho, não silhueta.** Trocadas por uma **tabela de 22 pontos**
   (altura, avanço) traçando o perfil humano do crânio ao pescoço, com interpolação suavizada.
3. **Feição menor que o passo da malha não desenha** (já visto na rodada 2b) e **relevo visto de
   frente não aparece em wireframe** — daí o rosto sair **de perfil** (silhueta lê, relevo não).

**Limite honesto, escrito também na página:** cérebro e cabeça saem de **fórmula sobre uma esfera**,
então são **aproximação** — dá pra ler a intenção, não pra chamar de retrato. O caminho pra fidelidade
real é trocar a fórmula por **malhas modeladas como alvos de morph** (a topologia já é fixa, então o
motor de transição não muda). **Não afirmar que o rosto está resolvido.**

**QA:** **159 fps** no estado mais pesado · console **0/0** varrendo 2 corpos × 6 estados + troca de
tema nos dois sentidos · claro e escuro OK.

### Rodada 2b — o conceito 1 refeito a partir de referência do usuário

**Veredito:** "o núcleo é o menos pior". O usuário anexou uma **referência visual** (membrana
triangulada densa, vértices acesos, azul no centro e magenta na silhueta) e especificou o que quer do
comportamento: **a forma muda por estado** — "quando estiver pensando ficar em formato de cérebro,
quando estiver falando moldar um rosto e movimentar a boca como se estivesse realmente falando".

**"A rede" foi substituída por "A malha".** Não era ajuste: o antigo era um grafo esparso solto no
volume; o pedido é uma **superfície triangulada**. Agora é uma icosfera indexada (detalhe 5, 10242
vértices) onde **cada vértice tem destino próprio por estado**, com topologia fixa, então a transição
é só interpolar. Formas: esfera dormindo · lente achatada com varredura lendo · **cérebro** pensando
(fissura longitudinal, duas oitavas de giros, cerebelo) · **rosto** falando (órbitas, globos, nariz,
queixo e **boca cuja abertura é a amplitude da voz**) · parábola côncava ouvindo · espinhos alertando.

**O estado "escrevendo" virou "pensando"** em todos os três corpos, porque é a palavra do usuário e é
o estado que vira cérebro; gerar o briefing é a mesma coisa.

**Três problemas de fundo resolvidos (valem pra qualquer implementação futura disso):**
1. **Relevo radial visto de frente não aparece em wireframe puro** — só muda profundidade, e sem luz
   o rosto nunca fecha. Resolvido dando **casca sombreada** (`MeshStandardMaterial` com normais
   recomputadas por quadro) e, principalmente, **mapeando deslocamento em brilho** no wireframe: o que
   sobe acende, o que afunda apaga.
2. **Albedo preto não sombreia.** Com a casca em `0x0d0a16` não havia gradiente nenhum; subiu pra
   `0x241d3a`, escuro o bastante pra não competir com a malha e claro o bastante pra ter sombra.
3. **Feição menor que o passo da malha não desenha.** No detalhe 4 uma órbita de raio .12 cobria 2-3
   vértices. Subiu pra detalhe 5 e as feições foram ampliadas: é uma **máscara estilizada**, não um
   rosto realista, e isso é decisão de projeto, não limitação temporária.

**Limite honesto, escrito também na própria página:** cérebro e rosto são esculpidos **por fórmula**
sobre uma esfera deformada, então hoje leem como **sugestão** — reconhece-se órbita, nariz, boca e
giros, mas não é um rosto convincente, e o cérebro lê mais como massa dobrada que como cérebro. Se a
direção for aprovada, o passo seguinte é trocar a fórmula por **malhas modeladas como alvos de morph**,
e aí a fidelidade deixa de ser o limite. **Não afirmar que o rosto está resolvido.**

**QA:** **166 fps** medido no estado mais pesado (rosto, detalhe 5, normais recomputadas por quadro),
então há folga larga · console **0/0** numa varredura de 3 corpos × 6 estados + troca de tema nos dois
sentidos · claro e escuro OK.

### Rodada 2 — 3D (`personagem/laboratorio-3d.html`, novo)

**Veredito do usuário sobre a rodada 1:** criatura **descartada**; a tinta agradou mais que a presença,
mas nenhuma chegou lá. Pedido: **mais realista, tridimensional, tecnológico**, no vocabulário de
**rede neural / simbionte**, com **textura**. Registro: a ressalva do clichê de bolha de IA foi
reafirmada por mim uma vez e o usuário manteve a direção, então foi executada — mitigando pela forma
(nenhum dos três é esfera lisa) e não pela recusa.

**Três corpos, três linguagens de material distintas:**

| # | Corpo | Como funciona | Material |
|---|---|---|---|
| 1 | **A rede** | grafo real de 260 nós ligados aos vizinhos; os sinais caminham de nó em nó e **o que muda por estado é o critério de escolha do próximo vizinho** (varre, converge, irradia), então o comportamento emerge em vez de ser roteirizado | pontos e arestas aditivos; a matéria é luz |
| 2 | **A trança** | 5 fios escuros trançados em volta de um **nó tórico** (frames de Frenet sobre a curva base) + 3 fios finos de luz por dentro; o pulso viaja pela UV do tubo | físico: metal escuro, clearcoat, iridescência, **mapa de rugosidade procedural** |
| 3 | **O núcleo** | casca facetada onde **cada face desliza pela própria normal**; o miolo aceso aparece pelas frestas. Fenda zero ouvindo, máxima alertando | metal escuro fosco com rugosidade mapeada + emissivo interno |

**Alinhamento de versão:** este protótipo já nasce em **three 0.185.1**, igual ao `web/` (`^0.185.1`),
em vez do 0.170 dos protótipos antigos. Mata o drift anotado na sessão 23 para todo código novo.
Um canvas por vez (a peça anterior é descartada de verdade no switch), então o teto de 1 peça WebGL
por página do DS §5.6 continua respeitado.

**Achado que decide uma coisa fora da escolha do corpo:** **nenhum dos três sobrevive a 38px** — os três
viram uma manchinha. Em 3D o personagem **não pode ser a marca da byline**. Ou ele vive só grande
(camada do coach, topo da folha), ou ganha um **sinal chapado** que o represente no miúdo. Isso é uma
decisão a mais, posterior à escolha do corpo, e está anotada na própria página.

**Correções feitas durante o QA (todas eram erro meu, não do conceito):** enquadramento — os três
estouravam a moldura, resolvido com escala base por peça num envoltório (`peca.base`) mais câmera em
z=7.4 · os fios de luz da trança orbitavam **por fora** virando uma gaiola verde; a luz agora corre
**por dentro** via `emissiveMap` de listras com `offset.x` animado na UV do tubo · iridescência saía
rosa-doce: sem mapa de espessura o three usa o **topo** da faixa como valor único, então `[200,300]` +
`iridescence: .5` + `envMapIntensity` baixo trouxeram pro violeta da marca · o metal do núcleo lia
cinza-claro porque o ambiente lavava tudo (`envMapIntensity` .5) · `IcosahedronGeometry.toNonIndexed()`
emitia aviso porque ela já vem não-indexada.

**Correção de conteúdo:** a ficha do núcleo afirmava "silhueta forte, sobrevive melhor em escala
pequena". O teste desmentiu e o texto foi trocado — a afirmação estava enviesando a decisão.

**QA:** console **0/0** numa varredura completa de 3 corpos × 6 estados + troca de tema nos dois
sentidos · claro e escuro OK · o palco tem estado de falha explícito se o WebGL não subir (sem queda
graciosa possível aqui: o conceito É 3D, e isso está escrito na página).

### Rodada 1 — 2D: tinta, criatura e presença (reprovada; criatura descartada pelo usuário)

**Decisão do usuário sobre as direções da sessão 23:** **A está descartada.** O argumento dele derruba o
da sessão anterior: a Bússola da Vida é **instrumento e marca**, e o que se quer é um **ator/personagem**;
personificar aproxima o usuário, e usar a marca como avatar do coach colapsa duas identidades que precisam
ficar separadas (um jornal tem cabeçalho e tem colunista, e não são a mesma coisa). Ele também registrou
que **"cromado" foi sugestão dele, não decisão** — material e forma seguem abertos, e ele levantou
"matéria escura" como alternativa. Pediu **protótipos só do personagem antes de avançar**.

**Reenquadramento aceito:** A/B/C não eram três alternativas paralelas. **C (nome próprio, byline,
assinatura em Caveat, voz de escrita) é piso, não opção** — até um simbionte precisa de nome. O que estava
de fato em aberto era só qual **corpo** senta em cima disso.

**Entregue:** `prototypes/v5/personagem/laboratorio.html` (novo), isolado como pedido — sem chrome, sem
Diário, sem nome, os três em tinta neutra com o roxo como único acento pra a escolha não ser por cor.
Controles: 6 estados que movem os três juntos, 3 escalas (palco 240px / cartão 96px / **assinatura 34px**),
ciclo automático, e alternância claro/escuro. Linkado no hub em Onda 03.

| # | Conceito | Natureza | Custo |
|---|---|---|---|
| 1 | **A tinta** | matéria líquida sem rosto; em repouso é uma gota, falando os satélites descolam, escrevendo ela percorre a cursiva e o traço nasce atrás | SVG + filtro goo |
| 2 | **A criatura** | pássaro de nanquim com olhar e postura; o bico é a pena e risca a linha embaixo de si | SVG com grupos transformados |
| 3 | **A presença** | massa lobulada que ocupa o negativo da página, com núcleo que acende | canvas 2D |

Nenhum usa WebGL, então o teto de 1 canvas por página (DS §5.6) continua livre pra bússola.

**Achados de QA que importam pra decisão (não são bugs, são informação):**
- **Escala é o filtro mais duro.** A 34px (o lugar natural dele, ao lado da byline) só a **criatura**
  sobrevive: silhueta se reconhece. A tinta vira dois pontos soltos e a presença vira borrão.
- **"Dormindo" é o estado de 95% do tempo** e é onde a presença quase desaparece — coerente com o conceito,
  mas é o custo real dele.
- **No escuro, "matéria escura" não pode ser desenhada mais escura que o fundo** (some sobre `#151313`).
  A massa virou névoa violeta **aditiva**; no claro segue subtrativa como tinta sobre papel.
- **Coroa nítida transforma a massa em esfera**, que é justamente o clichê de bolha de IA que o conceito 3
  existe pra evitar. Foi trocada por queda difusa + lóbulos irregulares.

**Bugs achados e corrigidos durante o QA (os dois valem pra implementação futura):**
- `.peca svg{display:block}` **vence o atributo `hidden` da UA**, então o fallback estático da presença
  ficava empilhado com o canvas e era ele que aparecia. Mesma armadilha do lote 1; corrigido com
  `.peca [hidden]{display:none!important}`.
- **`SVGElement` não herda de `HTMLElement`**, então `svg.hidden = true` cria só uma propriedade solta em
  JS e **nunca escreve o atributo**. Tem que ser `setAttribute('hidden','')`.
- Sob `prefers-reduced-motion` os alvos ainda oscilavam com o tempo: agora os três congelam o relógio
  (`if (reduz) t = 0`) e mostram pose estática por estado, com a escrita completa.

**QA:** console 0 erros e 0 warnings no lab e no hub, com varredura pelos 6 estados · claro e escuro
verificados · E-02 confirmado pelo caminho estático (os três palcos são SVG/markup e renderam sem o JS
ter rodado nas rodadas r1-r4). **Reduce foi tratado em código mas não emulado** — o `chrome-devtools` MCP
não expõe `reducedMotion` no `emulate`.

**MCP verificados nesta sessão:** `chrome-devtools` ✅ (30 tools, usado no QA inteiro) · `magic` ✅ (free,
2 retrievals/dia) · `shadcn` ⚠️ conecta e lê o `components.json` do `web/`, mas `registries` está **vazio**,
então `search_items_in_registries` responde "No registries are configured" — inútil até alguém declarar um
registry. Não foi mexido (fora do escopo e o v5 é escrito à mão).

## 2026-08-01 · Sessão 23 — Identidade da IA (nome, corpo, voz) + lugar da revisão semanal

> **Resolvida na sessão 24**, exceto o lugar da revisão semanal, que segue aberto. As direções A/B/C e a shortlist de nomes abaixo estão **superadas**: A caiu (a bússola é marca, não ator) e nenhum dos nomes da lista foi o escolhido. Ficam como registro do raciocínio.

> **Nenhum código ou protótipo foi tocado nesta sessão.** Ela produziu análise e opções; a
> escolha do usuário está pendente. Ferramental novo foi instalado e validado (ver ao fim).

**Veredito do usuário sobre o lote 2 (não aprovado como está):** (1) o **ponto de acesso da revisão
semanal** não ficou bom, e ele questiona se ela deve viver dentro do Diário; (2) **faltou impacto no
Diário** — "o coach está muito apagado, falta presença, destaque e personalidade". Pedidos explícitos:
dar **nome próprio** à IA (achou "coach" genérico), representá-la visualmente (ideia dele: **simbionte
em cromo, 3D, se mexendo**), e permitir que ela **comente por voz e receba voz** (referência: Jarvis).

### Diagnóstico da revisão semanal
Hoje é um **botão fantasma no chrome** (`btn-sm ghost` "Revisão semanal", `diario.html:152`), colado no
gatilho do coach. Três defeitos: peso morto 6 dias por semana; disputa atenção justamente com a IA, que
é o que se quer destacar; e trata como *ferramenta* o que é *conteúdo*.

**Proposta (aguarda decisão):** a revisão semanal **não é outra tela, é outra edição do mesmo diário**.
No dia em que a semana fecha, o próprio Diário muda de forma — masthead vira `Edição da semana · nº 30`,
a folha vira a carta semanal, o check-in vira o fechamento que persiste e conta badge. Some um item do
chrome, o produto visivelmente muda de forma 1×/semana (isso é presença de graça), e é editorialmente
correto no v5 (jornal diário × edição de domingo). A rota `/dashboard/review` continua como permalink e
arquivo. Alternativas registradas: (b) manter a rota e chamar do colofão; (c) seção "Edições anteriores".

### Diagnóstico da presença da IA
**Contra o simbionte como objeto separado (3 riscos):** (1) **compete com a marca** — a Bússola da Vida
já É o objeto cromado 3D vivo, e o §5.6 teto de 1 canvas por página; dois cromos e nenhum lê como "o"
objeto; (2) **a bolha cromada é o clichê visual da IA desta era** (Siri, Copilot, Gemini, Alexa) — a
queixa foi "genérico demais", e um orb é a versão visual do mesmo problema; (3) **E-07 diz "IA nunca
vira widget"** — uma criatura no canto é um widget com rosto.

**Reframe:** o simbionte já existe, é a bússola. Ela é literalmente um organismo que vive dos dados do
usuário e aponta. Só está muda. O caminho forte é dar **sistema nervoso ao corpo que já existe**.

**Direções (escolha pendente):**
| Dir | Tese | Custo | Nota |
|---|---|---|---|
| **A** *(recomendada)* | **O instrumento é o corpo.** A bússola 3D ganha estados: dormente · lendo (varredura no aro, agulha percorre as 8 áreas) · escrevendo (pivô pulsa, marcação acende) · **falando** (as 24 marcações viram medidor de nível pela amplitude da voz) · ouvindo (agulha treme na mola) · alertando (marcação em coral + agulha aponta sem ser pedida) | baixo — reaproveita `lib/v5/compass-gl.ts`, sem canvas novo | o "falando" é o momento Jarvis sem objeto novo |
| **B** | Simbionte cromado separado (ideia crua do usuário). Se for por aqui, a única saída pra não ser genérico é **não ser bolha**: tinta cromada que escorre e escreve o diário | alto — 2º canvas, linguagem de movimento do zero | paga os 3 riscos acima |
| **C** *(recomendada com A)* | **O colunista.** Sem corpo: nome, byline, assinatura em Caveat, voz de escrita própria, TTS | baixo | mais fiel ao pilar "editorial, não painel" |

**Recomendação registrada: A + C.** B fica como exploração.

**Shortlist de nomes:** **Lume** *(recomendado)* — fogo/luz em pt-BR, É a marcação acesa da bússola
(E-06: elétrico = dado vivo), então nome e tell visual são a mesma coisa; curto, raro, bom wake word ·
**Tino** — "ter tino" = ter bom senso; nome de gente, quente, brasileiro · **Norte** — **descartar**:
colide, a bússola já tem um norte (01 Finanças), e é palavra comum demais pra voz · **Prumo** (soa
objeto) · **Boreal** (ressoa com a aurora da landing) · **Vega** (muito usada por outros produtos).

**Voz — o que é real:** o sentimento Jarvis vem de **latência baixa + resposta curta + interface reagindo
enquanto ele fala**, não do motor de voz. Ordem sugerida: (1) **TTS do briefing** ("ouvir a edição") —
maior impacto pelo menor custo, o briefing já é cacheado por dia em `coach_briefs`, então gera-se o áudio
1×/dia/usuário (~45-70s) e guarda junto; casa com A (ela lê, a bússola aponta cada área citada, o ticker
destaca o número citado). (2) **STT push-to-talk** na camada, cai na mesma thread; Web Speech API é grátis
mas irregular no iOS/Safari, server-side é confiável e custa por minuto. (3) **Wake word: não fazer** —
caro, hostil pra bateria e ruim em background num PWA de navegador.

### Auditoria das 4 libs de animação (verificada no código, não no handoff)
| Lib | `web/` | protótipos | Onde de fato |
|---|---|---|---|
| three.js | ✅ `^0.185.1`, import dinâmico em `lib/v5/compass-gl.ts` | ✅ `three@0.170.0` (CDN) | **só a landing** |
| GSAP | ✅ `^3.15.0` + ScrollTrigger/SplitText/CustomEase | ✅ `gsap@3.13.0` (CDN) | **só a landing** |
| Anime.js | ❌ | ❌ | dispensada, confirmado |
| Motion.dev | ❌ | ❌ | **nunca entrou** (os 7 hits eram `prefers-reduced-motion`) |
| Lenis | ✅ `^1.3.25` | ✅ `1.1.14` | landing desktop + pricing |

**Achado relevante:** as duas libs em uso vivem **exclusivamente na landing**. Nenhuma tela do app
(Diário, chrome, camada, review-semanal, life-score) usa qualquer uma delas — tudo é CSS transition sob
o gate `.anim`. **Isso explica parte do "coach apagado": o cromo 3D, a mola física e a luz pela hora do
dia só existem na página de marketing; quem já é cliente nunca vê o instrumento vivo.** Se o caminho A
for escolhido, boa parte do trabalho é *portar pro app o que já foi aprovado na landing*, não criar do zero.

**Novas pendências técnicas:** (1) **drift de versão** protótipo × implementação (three 0.170 × 0.185,
gsap 3.13 × 3.15) — risco de atribuir ao porte uma diferença que é da lib; alinhar antes da próxima onda.
(2) **reabrir a decisão do motion.dev** em vez de executá-la por inércia: o GSAP já está instalado e já
tem a easing assinatura em `CustomEase`; duas libs de animação pro mesmo trabalho é custo sem retorno.

### Ferramental novo (instalado e validado por handshake JSON-RPC)
- **Node v22.4.1 → v24.18.1 LTS** (winget). Era bloqueio duro: `chrome-devtools-mcp` exige `>=22.12`
  em toda versão desde a 0.4.0. O npm ficou em 10.8.2 (o instalador não trocou o empacotado); sem impacto.
- **`.mcp.json` (escopo projeto, commitável, sem segredo):** `chrome-devtools` (30 tools, inclui
  `lighthouse_audit` e `performance_start_trace` — úteis pra medir o custo do WebGL) e `shadcn`
  (com `-c C:\Projetos\sync_life\web`, senão não acha o `components.json`). Liberados via
  `enabledMcpjsonServers` em `.claude/settings.local.json`.
- **`magic` (21st.dev) foi pro escopo de USUÁRIO** (`~/.claude.json`), porque `.mcp.json` seria commitado
  e a chave é segredo. Confirmado por busca que `21st_sk_` não aparece no repo.
- **Skill `web-design-guidelines`** (Vercel) em `.claude/skills/` — auditoria de a11y/foco/teclado/animação
  em formato `file:line`. É a de maior utilidade real pro nosso QA de identidade.
- Ressalva: `shadcn` e `magic` têm uso limitado aqui — o v5 é anti-card e escrito à mão, e o magic gera
  no estilo genérico de landing SaaS, o oposto do DS v5.

**Próximo passo:** decisão do usuário em (1) lugar da revisão semanal e (2) direção A/B/C + nome. Com
isso, revisar os protótipos do lote 2 antes de qualquer implementação.

**Arquivos:** `.mcp.json` (novo) · `.claude/settings.local.json` · `.claude/skills/web-design-guidelines/SKILL.md` (novo) · este handoff. **Nenhum protótipo ou código de `web/` foi tocado.**

---

## 2026-08-01 · Sessão 22 — Onda 2 lote 2: protótipos da Edição da semana e do Life Score (em aprovação)

**Decisão de produto (spec `docs/superpowers/specs/2026-08-01-onda2-lote2-review-score-design.md`, commit 162a626):** as duas telas do lote 2 não eram redesenho, eram **conserto**. A `/dashboard/review` v3 é uma sequência de slides com TODOS os números hardcoded, mas é a única que persiste em `weekly_reviews` e alimenta as badges; a `/tempo/review` tem dados reais mas é PRO e não persiste nada; e o schema está quebrado (a migration `016` tentou recriar a tabela que a `013` já criara, então as colunas que ela declara não existem, e `score_gained` existe no banco sem migration). A `/dashboard/score` usa `useLifeMap` (fórmulas próprias, média simples, sem a área Tempo, sem persistência) em vez do `useScoreEngine` oficial, e por isso mostra "+4 pontos esta semana" hardcoded, 6 das 8 áreas e ignora os 30 dias de histórico que já existem em `life_sync_scores`. **Decisões:** review vira **"A edição da semana"** (carta semanal do coach sobre dados reais, com fechamento explícito que persiste e conta badge; o formato de slides sai; a janela "domingo 20h a quarta" cai; a `/tempo/review` continua como painel analítico do módulo Tempo); Life Score vira **"A anatomia do número"** com `useScoreEngine` como fonte única, curva de 30 dias, peso e contribuição por área, componentes reais do motor e sugestões determinísticas (sem IA nesta tela).

**Entregue (protótipos, plano `docs/superpowers/plans/2026-08-01-onda2-lote2-prototipos.md`):** mock do lote 2 com `semana` e `scoreDetalhe` (923fd6e) · `review-semanal.html` (0831490) e `review-semanal.mobile.html` (252ad22) · `life-score.html` (6e7c648) e `life-score.mobile.html` (53e0e8e) · hub com as 4 linhas da onda 02 (5433604) · rodadas de fix de review: b20a4e1 (sub sem headline duplicada, delta unificado), 17541b6 (histórico fecha o delta 3, curva regenerada), 42af59b (cross-link vivo + polimentos), 62dc34f (contradição da hidratação, arredondamento explícito, label do selo, `hidden` na camada), b1db85c (base do cálculo da semana coerente).

**Reconciliação de dados (importante para quem for implementar):** o mock passou a **fechar a própria matemática**. Os scores das 4 áreas ativas viraram **83/79/69/78** porque com os pesos reais (20/20/15/5 redistribuídos sobre 60) eles somam 77,75, que arredonda para os **78** que o mock declara; os valores antigos somavam 75. O **delta semanal é 3** em todas as telas (o `score.delta` do mock era 4 e virou 3), o histórico tem **75 no índice 22** (7 dias atrás) e o label do selo é **`Consistente`** em todas as telas (o Diário dizia "No ritmo"). O Diário teve só esses números tocados; identidade visual intacta.

**QA (PASS, sem fixes):** console 0 erros e 0 warnings nas 4 telas · sem scroll-x · **E-02 validado em reduce E com JavaScript desligado** (as curvas continuam desenhadas porque são markup estático) · consistência cruzada verificada por DOM nas **6 telas** (score, delta, label, áreas, semana 75→78, histórico decodificado do path SVG batendo com o mock, contribuições e o texto do arredondamento) · 8 cross-links navegados de verdade sem vazamento de formato · regressão do hub, Diário, landing e login limpa.

**Gotchas novos:**
- O **cache do perfil do Playwright serve `shared/*.js` velho mesmo com `?v=` no HTML** (o cache-buster só invalida o documento): forçar `fetch(..., {cache:'reload'})` no arquivo e re-navegar.
- **Agentes rodando em paralelo compartilham o MESMO browser MCP**, então toda medição precisa conferir `location.href` dentro do próprio `evaluate` antes de confiar no resultado.
- `shared/app.js` escondia o estado vazio da camada com `style.display` (violação do contrato do lote 1, `[hidden]{display:none!important}`); agora usa `hidden`.

**Para a implementação (quando o lote for aprovado):** migration `028` reconciliando `weekly_reviews` (`ADD COLUMN IF NOT EXISTS`, sem drop; a `016` permanece inerte e documentada) · rota `/api/ai/review-brief` no padrão da do Diário (cache semanal em `coach_briefs` com `module_id='review'`, contexto de semana, fallback determinístico, `forceFallback`) · as duas rotas movendo para `(app-v5)` · o `ChromeV5` já tem o link de "Revisão semanal" apontando para `/dashboard/review`.

**Notas de rodada de feedback (registradas, decidir com o usuário):** o ticker do chrome repete dados mensais numa vista semanal (decidir o escopo do ticker) · a marcação coral do componente mais fraco marca 4 componentes com severidades diferentes · o alvo de toque do `✕` da camada e do "Conversa completa" está em 32/28px na primitiva compartilhada (varredura futura) · o Diário mobile ficou 1px abaixo do contrato de 40px nos alvos.

**Fora de escopo (registrado):** unificação definitiva `useScoreEngine` × `useLifeMap` (afeta `/futuro` e o radar) · migração da `/tempo/review` · ligar o cron `weekly-digest` à edição da semana · ledger central de XP.

**Próximo passo:** aprovação do usuário no hub (as 4 telas da onda 02 estão linkadas lá); depois implementação do lote 2 em `web/` e Onda 3 (`/coach` vista cheia + N2).

**Arquivos:** `docs/superpowers/specs/2026-08-01-onda2-lote2-review-score-design.md` · `docs/superpowers/plans/2026-08-01-onda2-lote2-prototipos.md` · `prototypes/v5/app/{review-semanal,life-score}{.html,.mobile.html}` (novos) · `prototypes/v5/shared/{mock-data.js,app.js}` · `prototypes/v5/app/diario{,.mobile}.html` (só números) · `prototypes/v5/index.html` · este handoff.

---

## 2026-08-01 · Sessão 21 — Onda 2 lote 1 IMPLEMENTADA em `web/` (Diário + chrome v5 + camada do coach)

**Aprovação:** protótipos da Onda 2 lote 1 aprovados pelo usuário em 2026-07-31; a implementação seguiu o plano `docs/superpowers/plans/2026-07-31-onda2-implementacao-web.md` (commit 2b4de6b), subagent-driven com revisão dupla por task.

**Entregue (commits):**
- **Backend:** migration `027_diario_v5.sql` com `coach_briefs` + `daily_checkins` (RLS per-user), aplicada no projeto `xmtzpjtbqhgwmebycxmx` (ce6a54a; d95fb83 renomeia o alias `CoachBrief`→`CoachBriefRow` por colisão com CoachHero).
- **CSS:** `styles/app-v5.css` = porte de `shared/app.css` sob `.v5` + Space Grotesk 400 (b3ca3d5).
- **IA:** `/api/ai/diario-brief` com cache diário em `coach_briefs`, contexto de panorama enriquecido (score, orçamentos, contas, metas, check-in de ontem), fallback determinístico e `forceFallback` pro kill-switch (26fde4e, 14fa30a).
- **Hooks:** `use-checkin` / `use-diario-brief` / `use-diario` (4382c54, 41dd87a).
- **Shell:** route group `(app-v5)` com guard próprio + `AppV5Boot` + `ChromeV5` + `CamadaCoach` com streaming do coach-thread (a6c2602, 2e02a99).
- **Tela:** `DiarioV5` + `(app-v5)/dashboard/page.tsx`, com `(app)/dashboard/page.tsx` DELETADO e `review/`+`score/` mantidos no v3 (6fadbc7, 008c2c2). Fix de QA na máscara de moeda em be7e456.

**Decisões de escopo:** N1 (brief cacheado) e o check-in foram puxados da Onda 3 pra cá, senão a folha e a banda seriam fake; N2 (thread persistida + fontes citadas) e a vista cheia `/coach` seguem na Onda 3; N3 (cartão "Ação executada" / tool calling) não entrou no app (sprint próprio); `Conversa completa →` renderiza com `aria-disabled` e não navega; `Revisão semanal` e o selo apontam pra `/dashboard/review` e `/dashboard/score`, ainda no shell v3 (lote 2).

**QA de identidade e funcional (Task 7, PASS):** desktop 1440 e mobile 390 comparados aos protótipos por estilo computado com diff CSS regra a regra (0 declarações ausentes; só faltam seletores exclusivos do protótipo e 2 nomes de keyframe prefixados). A camada abre pelo pill e pelo ask com seed, foca o input no desktop e não foca no sheet mobile; pergunta real retornou streaming do Groq (200, não fallback); check-in persistiu e sobreviveu ao reload; brief gerou na primeira carga (linha em `coach_briefs`, payload do Gemini) e voltou com `cached:true` no reload; `/financas` abre o shell v3 e voltar ao Diário mantém o fundo v5 sem vazamento de `data-theme`. Console: 0 erros de JS/React; os 13 erros observados são HTTP 404 do Supabase pra tabelas que NÃO existem neste projeto (drift conhecido: `life_sync_scores`, `agenda_events`, `user_streaks`, `badges`, `user_badges` e outras) — a tela degrada graciosamente e em ambiente com schema completo esses 404 somem.

**Gotchas novos da implementação:**
- `tokens-v5.css` declara dark como `.v5 .dk` (descendente), então o boot renderiza `<div class="v5"><div class="dk anim">`; `v5 dk` no MESMO elemento renderiza a paleta clara silenciosamente.
- `npx next start` deu exit 127 neste ambiente; usar `node node_modules/next/dist/bin/next start -p 3006`.
- `.next/dev/types/validator.ts` stale referencia rota deletada e quebra o build: `rm -rf .next` antes de buildar depois de deletar rota.
- Regras de CSS de página que empatam especificidade com `app-v5.css` precisam de bump por classe repetida (`.v5 .bar.bar`) pra não depender da ordem de emissão do Next.
- O payload do Gemini vem com `R$0` colado e pontuação dupla; `use-diario-brief` normaliza NBSP e prosa no client.

**Polish e dívidas registradas (não bloqueantes):** count-up dos números não foi portado (valores estáticos) · ênfases tipográficas dentro de `p1/p2` (o protótipo tem `strong`/`warn`; hoje o texto é puro, sem HTML da IA por segurança) · linha `Outras:` mostra só nomes, sem número nem score, porque o engine não calcula score de área inativa (divergência honesta do protótipo) · selo mobile mantém o link `como melhorar →` que o protótipo dobra no `.d` · `ultimaSinc` usa a hora do render (a coluna `recorded_date` é DATE puro) · branches de `daysLeft<=0` são código morto pela regra do v3 · estado ativo do modbar é hardcoded no Diário, vira prop quando outros módulos migrarem · dívidas de a11y herdadas do protótipo: focus trap na camada, teclado iOS sobre o sheet fixo, `.rec` clicável sem semântica de botão, heading h2→h4 sem h3.

**Próximo passo:** aceite visual do usuário no app real; depois lote 2 da Onda 2 (Review semanal, Life Score detalhado no v5) e Onda 3 (vista cheia `/coach` + N2: `coach_messages` com fontes citadas).

**Arquivos:** `web/supabase/migrations/027_diario_v5.sql` · `web/src/styles/app-v5.css` · `web/src/app/api/ai/diario-brief/route.ts` · `web/src/hooks/{use-checkin,use-diario-brief,use-diario}.ts` · `web/src/lib/coach/context.ts` · `web/src/app/(app-v5)/{layout,dashboard/page}.tsx` · `web/src/components/app-v5/{AppV5Boot,ChromeV5,CamadaCoach,DiarioV5}.tsx` + `{chrome-v5,diario-v5}.css` · `docs/superpowers/plans/2026-07-31-onda2-implementacao-web.md` · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-31 · Sessão 20 — Onda 2 lote 1: Diário + camada do coach (protótipos em aprovação)

**Decisão de produto (pré-onda):** discussão sobre "Panorama ser a casa do coach" virou a spec `docs/superpowers/specs/2026-07-31-coach-diario-v5-design.md` (commit e297150): Panorama vira **Diário** (rota /dashboard mantida) com briefing do coach + check-in do usuário (humor 1 toque + linha opcional, nunca cobrado) + "Suas áreas" personalizadas por `profiles.active_modules`; **coach vira camada global fora do menu** (gatilho no bar em toda tela, ask da folha semeia pergunta, vista cheia /coach só via expansão); escada N1-N4 com Onda 3 = N1 (brief cacheado em `coach_briefs`) + N2 (thread persistida `coach_messages` + fontes citadas via buildModuleContext); N3 (ações/tool calling) em sprint próprio pós-ondas; tudo viável em free tier (Gemini brief 1×/dia + Groq chat com rate limit existente). Verificado: Mente NÃO tem tabela de humor (check-in = tabela nova `daily_checkins`); onboarding v5 já grava `active_modules`.

**Entregue (subagent-driven, plano `docs/superpowers/plans/2026-07-31-onda2-chrome-diario.md`, commit fc89ab7):**
- DS v5 atualizado: §6.1 chrome com gatilho do coach e modbar sem item Coach (Conquistas/Config sem número, corrigindo a numeração 09/10 do r6 que violava §5.2), §6.2 Diário, §6.4 coach como camada, flip `.lt` documentado, inventário §7 + E-04/§6.6 reconciliados (commits 9d9b0ca, 51958aa, 71e1de8).
- Mock: `ativas/diario/dims` + `coach.{saudacaoCamada,sugestoes,thread}` com NBSP real; thread usa campo `msg` (commits 7595dc6, f8c1c7d).
- `shared/app.css` + `shared/app.js` novos: chrome (bar/ticker/modbar/colofão), bolhas, camada (painel desktop + `.sheet` mobile), check-in primitives, `SLApp.boot()` (commits 34a5606, 4cecd76).
- Protótipos: `app/diario.html` (5433f3c + 8181de6) e `app/diario.mobile.html` 390×844 dedicado (a32611d + 73b3fd4). Hub atualizado com lote 1 em aprovação, Review semanal/Life Score preservados como lote 2 planejado (8efce8a).
- QA integral (Task 7): console 0/0, sem overflow, interações completas nos dois, E-02 em 4 combinações (reduce/no-JS), varreduras limpas, regressão hub/landing/login intacta. Zero fixes.

**Gotchas novos (valem para as próximas telas da onda 2+):**
- `[hidden]` vs display autoral: `app.css` tem `[hidden]{display:none!important}`; NUNCA style inline de display em elemento toggled por `hidden`.
- Colisão `.in`: o observer põe `.in` em `.rv/.draw`; wrappers estruturais `.in` (folha/hoje) exigem child combinator (`.folha > .in`), nunca descendente.
- Sheet mobile: `86dvh` com fallback `vh`, sem autofocus (app.js pula em `.sheet`), `play()` rola `.cbody` pro fim, safe-area no `.cfull`.
- Screenshot fullPage mobile pinta o sheet fixo no meio (artefato Chromium): usar screenshots por segmento.
- Alvos de toque: primitivas shared têm ~35px; páginas mobile fazem override ≥40px no CSS da tela.
- Deltas "+12%/+8%" dos números ficam cinza no desktop (`.nums .d` vence `.ele`): paridade com o r6 aprovado, decidir na rodada de feedback.

**Checklist para a implementação web/ (dívidas conhecidas do protótipo):** focus trap + `role="dialog"`/`aria-modal` + restauração de foco na camada; teclado iOS sobre sheet fixo (visualViewport ou `interactive-widget=resizes-content`); `.rec` clicável sem semântica de botão; níveis de heading (h2 → h4 sem h3); token para alphas de roxo (`--roxo-soft`); `data-cnt` só suporta inteiros.

**Próximo passo:** aprovação explícita do usuário no hub (Onda 2 lote 1); depois implementação em `web/` + lote 2 (Review semanal, Life Score detalhado) + Onda 3.

**Arquivos:** `docs/superpowers/specs/2026-07-31-coach-diario-v5-design.md` · `docs/superpowers/plans/2026-07-31-onda2-chrome-diario.md` · `DESIGN-SYSTEM-v5.md` §6 · `prototypes/v5/shared/{app.css,app.js,mock-data.js}` · `prototypes/v5/app/{diario.html,diario.mobile.html}` · `prototypes/v5/index.html` · este handoff.

---

## 2026-07-31 · Sessão 19b — Infra: `SUPABASE_SERVICE_ROLE_KEY` de produção restaurada

**Contexto:** a sessão 19 flagrou a service_role do `web/.env.local` inválida (era do projeto de HOMOLOG contra a URL de produção; provavelmente sempre foi). O usuário foi trocar a chave e o diagnóstico passou por três pegadinhas reais, todas resolvidas:

1. **Arquivo errado:** o usuário salvava em `web/.env` e a validação lia `web/.env.local` (que tem precedência no Next). Detectado pelo mtime dos arquivos.
2. **Projeto errado:** a primeira chave colada era `service_role` do `sync_life_homolog` (`bculmhmoxxpjlcilkgmp`). Diagnóstico definitivo: decodificar o claim `ref` do próprio JWT (o token diz de qual projeto foi emitido). Nomes canônicos da org: **sync_life Project** = `xmtzpjtbqhgwmebycxmx` = produção · **sync_life_homolog** = `bculmhmoxxpjlcilkgmp` (o usuário também reativou o homolog, que estava pausado).
3. **Chave errada:** a segunda colagem era o **JWT Secret** (chave de ASSINATURA da página "JWT Keys"), não a service_role. Solução: derivar a service_role localmente (HS256 sobre header+payload `{iss:supabase, ref, role:service_role}` com o secret), validar contra `auth/v1/admin/users` e salvar — sem o usuário precisar copiar de novo.

**Estado final (validado):** `SUPABASE_SERVICE_ROLE_KEY` nos DOIS arquivos (`web/.env` e `web/.env.local`) é service_role de produção com **HTTP 200** no endpoint admin; o secret cru saiu da posição de API key; ambos os arquivos seguem no `.gitignore` (nada rastreado) e nenhum segredo passou pelo transcript (validações leram do env e reportaram só status/claims).

**Receitas de QA que ficam:** (a) suspeitou de chave Supabase → decodificar o claim `ref`/`role` do JWT antes de qualquer coisa; (b) "salvei mas não mudou" → conferir mtime e procurar outros `.env*` (o Next carrega `.env` E `.env.local`, com `.local` vencendo); (c) com o JWT Secret legacy dá pra derivar anon/service_role localmente em caso de resgate.

**Arquivos:** `web/.env` e `web/.env.local` (fora do git) · este handoff.

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
