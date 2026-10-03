# Brief · Meu dia e Finanças sem metáfora, três versões para escolha

**Data:** 2026-10-03 · **Branch:** `poc/ds-v5` · **Pasta:** `prototypes/v5/app/`
**Spec de origem:** `docs/superpowers/specs/2026-10-03-conceito-sem-metafora-design.md` (ler o status no topo:
o alcance mudou, sai tudo que é estilo revista).

O usuário aprovou a base do DS v5 (tokens, Inter + Space Grotesk, hairlines, tri-acento, Bússola, chrome com
áreas numeradas) e rejeitou o tema de jornal **e** os dispositivos de revista. Ele quer um produto sem
metáfora, com usabilidade melhor, e quer **escolher vendo**. Entregamos três versões de desktop (1440 de
referência) da tela inicial **Meu dia** e, para cada uma, a tela **Finanças** correspondente, porque a
pergunta "como Sy aparece numa tela de área" só se responde olhando.

## 1. Arquivos a produzir

| Versão | Meu dia | Finanças |
|---|---|---|
| A · Sy fala, a lista responde | `app/meu-dia-a.html` | `app/financas-a.html` |
| B · Blocos por área | `app/meu-dia-b.html` | `app/financas-b.html` |
| C · A conversa é a casa | `app/meu-dia-c.html` | `app/financas-c.html` |

Desktop só, nesta rodada. O mobile dedicado 390×844 é feito depois, para a versão escolhida.

## 2. O que fica e o que sai (LEI desta rodada)

**Fica:** `<html lang="pt-BR" class="dk">`; `../shared/tokens.css`, `../shared/base.css`, `../shared/app.css`,
`../shared/mock-data.js`, `../shared/app.js` (`SLApp.boot()`); `.wrap` com `--wrap-max:1180px`; `.eyebrow`;
`.num` em todo valor; hairlines `var(--line)`; roxo = ação e marca, elétrico = positivo e dado vivo, coral =
alerta e voz de Sy (E-06); a camada de Sy (`.camada` + `.scrim`, markup copiado de `app/diario.html` linhas
327 a 365, trocando "Coach" por "Sy"); o check-in (`.checkin`, `.mood`, `.ck-form`, `.ck-note`, `.ck-save`,
`.ck-done [data-out]`, wiring já em `app.js`); `.grain`; reveals `.boot .b1..b5` e `.rv`; count-up
`data-cnt`.

**Sai (não pode aparecer em nenhum dos 6 arquivos):**
- `.ticker` e a faixa elétrica sob o bar.
- `.lt` e qualquer banda clara no meio da página escura.
- `.selo` com moldura dupla e `breathe`. O score aparece como número com rótulo, sem moldura.
- `.hand`, `.hand-arrow`, `.hl`, a fonte Caveat (não carregar no `<link>` do Google Fonts).
- `.mast` com frase longa em display. Título de página tem no máximo 6 palavras, 28 a 36px.
- Qualquer encenação: apresentação em tempos, lâmina que cai, portão, voz, digitação letra a letra.
- Palavras visíveis: edição, edições, folha, manchete, colofão, jornal, byline, redação, redator, diário,
  coach, assessor, "o Sy", "ao Sy", "do Sy". Em classe CSS interna do shared (`.colofao`, `.coach-pill`)
  pode continuar; em texto visível, não.

## 3. Chrome comum (copiar igual nas 6 páginas)

```html
<header class="bar">
  <a class="brand" href="#"><!-- svg da bússola: copiar de app/diario.html linha 147 --><span class="wm">Sync<em>Life</em></span></a>
  <span class="date">Sexta · 3 de outubro de 2026</span>
  <div class="acts">
    <button class="btn-sm ghost coach-pill" type="button" data-coach-open><!-- svg linha 152 -->Fale com Sy</button>
    <button class="btn-sm roxo" type="button">+ Registrar</button>
  </div>
</header>
<nav class="modbar" aria-label="Áreas"><div class="in">
  <a class="on" href="meu-dia-X.html">Meu dia</a>
  <a href="financas-X.html"><span class="n">01</span>Finanças</a>
  <a href="#"><span class="n">02</span>Futuro</a> … até 08 Experiências …
  <a href="#">Conquistas</a><a href="#">Configurações</a>
</div></nav>
```

Em Finanças o `.on` vai para `01 Finanças`. Os dois arquivos da mesma versão se linkam entre si. Sem
"Revisão semanal" no bar: "Sua semana" entra como item de conteúdo onde a versão achar lugar.

## 4. Sy, o Enxame pequeno e quieto (igual nas 6 páginas)

Decisão do usuário: Sy continua tendo corpo, como avatar discreto de **40px** ao lado do texto, estado
`repouso`, sem palco e sem crescer. Padrão:

```html
<span class="sy40" aria-hidden="true"><canvas></canvas></span>
<style>.sy40{width:40px;height:40px;flex:none;border-radius:11px;overflow:hidden;background:#0f0d0d;display:inline-block}
.sy40 canvas{display:block;width:100%;height:100%}</style>
<script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.185.1/build/three.module.js"}}</script>
<script type="module">
import { REDUZ } from '../personagem/vida.js'
import { criarEnxame } from '../personagem/enxame.js'
const pecas = [...document.querySelectorAll('.sy40 canvas')].map((cv, i) =>
  criarEnxame(cv, { n: 190, tam: .7, compacto: .78, dpr: 3, semente: 4.6 + i }))
let ultimo = performance.now()
function laco (agora) { const dt = Math.min((agora - ultimo) / 1000, .05); ultimo = agora
  for (const p of pecas) p.quadro(dt, 'repouso'); requestAnimationFrame(laco) }
if (REDUZ) { for (let i = 0; i < 3; i++) for (const p of pecas) p.quadro(1 / 60, 'repouso') } else requestAnimationFrame(laco)
</script>
```

Único estado permitido além de `repouso`: `ouvindo` enquanto o input de Sy tem foco (`focus-within`),
voltando a `repouso` no blur. Nada de `falando`, `pensando`, `alerta` nesta rodada. Sem WebGL o `<span>`
fica como quadrado escuro: aceitável. O Enxame é objeto sempre escuro; a página já é escura.

## 5. Conteúdo (fonte única: `shared/mock-data.js`, sem inventar números)

Meu dia mostra o que merece atenção agora, pelo critério do §4.1 da spec (gatilhos com prioridade). Com o
mock de hoje, os itens são, nesta ordem:

1. **Decisão pendente:** "A proposta do curso de inglês continua em aberto" (Mente, Tempo, Finanças,
   Carreira, Futuro). Ação: "Decidir" abre a camada com a pergunta semeada. É mock: a proposta não existe
   em `mock-data.js`, usar R$ 180/mês, 2 noites por semana, meta "Fluência até 2027".
2. **Risco em janela curta:** lazer `R$ 410 de R$ 420` (98%), restam R$ 10 até quinta. Área 01.
3. **Compromisso de hoje com preparo:** fisioterapia às 07:30 (04) e aluguel `R$ 1.200,00` em 3 dias (01).
4. **Mudança desde o último acesso:** nas 4 áreas ativas, 3 subiram (01 +2, 02 +1, 04 +3) e 08 ficou
   parada. Score 78, +3 na semana.
5. **Próxima ação:** "Segure o lazer até sexta e o mês fecha com R$ 2.120".

Blocos de apoio, quando a versão usar: Hoje (`diario.hoje`), Números do mês (`financas`), Suas áreas
(`dims` filtrado por `ativas`, as outras numa linha quieta "Outras: 03 Tempo 71 · …"), Metas, Check-in
(`diario.checkin`), Sua semana (`semana`: um link ou um item, nunca tela), rodapé com `Última sincronização
às 14:05`.

Texto de Sy em Meu dia (2 a 3 frases, números embutidos em `.num`, tom direto, "você"):
> Boa tarde, Thiago. Desde ontem mudou uma coisa: o lazer encostou no teto, restam R$ 10 até quinta. Fora
> isso, outubro já está ganho e a poupança fecha acima da meta. A proposta do curso de inglês continua
> esperando você.

Linha de fontes sob o texto, sempre (E-07 continua): `Atualizado às 7h12 · fontes: orçamento Lazer, 34
transações, agenda da semana`.

**Finanças** (dados: `financas`, `orcamentos`, `transacoes`, `gastosPorCategoria`, `agenda` filtrada,
`coach.acoes[0]`): título "Finanças · outubro"; 4 números (Receitas 5.000 · Despesas 3.160 · Saldo livre
1.840 · Poupança 37% com meta 30%); orçamentos em linhas hairline com barra 4px (`--w`), Lazer em coral;
fluxo de caixa SVG com `sparkSaldo` e legenda em prosa; últimas transações em grid `52px 1fr 130px 110px`
(entrada em elétrico com `+`, saída neutra); metas e recorrentes em 2 colunas; rodapé. Texto de Sy em
Finanças (1 ou 2 linhas): "O mês está 83% executado. Só o lazer pede atenção: R$ 10 até quinta."

## 6. As três versões

### A · Sy fala, a lista responde
- **Meu dia:** topo em 2 colunas: à esquerda Enxame 40px + texto de Sy (3 frases) + linha de fontes +
  input em pílula "Pergunte ou registre algo" (abre a camada); à direita, quieto, `78` em 44px com rótulo
  `Life Sync Score · +3 na semana` e link "Entender o número". Abaixo, eyebrow `PEDE VOCÊ HOJE` e **lista
  densa** com hairlines: cada linha = índice da área em roxo, texto, valor em `.num`, ação à direita
  (`Decidir`, `Ver orçamento`, `Abrir agenda`). Depois: Check-in, Hoje, Suas áreas, Números do mês, Sua
  semana (uma linha), rodapé.
- **Finanças:** sob o título, a mesma unidade Sy (40px + 1 a 2 linhas + fontes + link `Falar com Sy sobre
  outubro`). Depois os dados do §5. Sy não aparece em mais nenhum lugar da página.

### B · Blocos por área
- **Meu dia:** topo em 1 linha: Enxame 40px + **uma frase** de Sy + `78 · +3` à direita. Abaixo, grade
  2×2 das 4 áreas ativas, células separadas por hairline (sem borda de card): eyebrow `01 · FINANÇAS`,
  número principal em 32px (`R$ 1.840` saldo livre; 02 `61%` das metas; 04 `3 de 7` treinos; 08 `92 dias`
  para a Itália), tendência, e **o que pede você** nessa área (1 linha com ação). A decisão pendente do
  curso aparece como faixa de 1 linha acima da grade (hairline, roxo no índice) porque toca 5 áreas.
  Depois: Hoje, Check-in, linha quieta das outras áreas, Números do mês, rodapé.
- **Finanças:** a página é uma grade de blocos do módulo (Números · Orçamentos · Fluxo · Transações ·
  Metas · Recorrentes), e **Sy é um bloco** da grade, do mesmo tamanho dos outros: eyebrow `SY · SOBRE
  OUTUBRO`, Enxame 40px, 2 linhas, fontes, link. Nenhuma frase de Sy fora do bloco.

### C · A conversa é a casa
- **Meu dia:** layout `1.45fr / 1fr`. Coluna principal = **a conversa**: a primeira mensagem do dia é o
  texto de Sy (bolha `.bub.a` com Enxame 40px ao lado), seguida de **objetos de dado dentro da conversa**
  (aqui card é permitido, E-04, porque é objeto): um cartão do lazer com barra, um cartão da proposta do
  curso com dois botões (`Ver proposta`, `Depois`), o check-in como mensagem de Sy ("Como foi o dia?") com
  as 5 pílulas inline. Input fixo ao pé da coluna. Coluna lateral = Hoje, Suas áreas compactas, Números
  do mês, Sua semana, tudo em hairline. Sem `.camada`: a conversa já está na página; o botão do bar rola
  até o input.
- **Finanças:** página de dados em `1fr / 380px`: dados à esquerda (§5), e à direita uma **conversa
  encaixada** (não flutuante, mesma unidade de C): Sy abriu com a linha sobre o mês, chips de pergunta
  (`Quanto posso gastar em lazer?`, `Simular: e se eu poupar R$ 800?`) e input. Em telas < 1100px a
  coluna vira a `.camada` normal.

## 7. Regras de copy

Sem em-dash (—) em copy visível (use vírgula, ponto, dois-pontos ou `·`). Sentence case. "Você", nunca "o
usuário". Sy sem artigo e sem contração: "Sy", "com Sy", "para Sy", "Fale com Sy". `R$&nbsp;1.840` com
NBSP após `R$`, en-dash em negativo (`– R$ 320,00`), pt-BR. Microcopy seca: `Registrado.` Nada de emoji.

## 8. QA que cada arquivo tem que passar antes de entregar

1. Console 0 erros e 0 warnings em 1440×900 (abrir via `http://localhost:8765/app/<arquivo>?v=1`,
   nunca `file://`; se o servidor não estiver de pé: `python -m http.server 8765` em `prototypes/v5/`).
2. `document.documentElement.scrollWidth === innerWidth` (sem overflow-x).
3. Com JS desligado ou `prefers-reduced-motion`, a página está completa e estática (E-02).
4. `grep -i` nos nós de texto não encontra nenhuma palavra do §2 "Sai". Checar com
   `document.body.innerText.match(/edi[çc][aã]o|folha|manchete|colof[aã]o|jornal|byline|reda[çc][aã]o|di[aá]rio|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b/gi)` → `null`.
5. Nenhum `.ticker`, `.lt`, `.selo`, `.hand`, `.hl` no DOM; nenhuma fonte Caveat carregada.
6. Camada de Sy abre pelo botão do bar e por `[data-coach-open]`, fecha por scrim, X e Esc (A e B; em C,
   Meu dia não tem camada e Finanças tem a conversa encaixada).
7. Check-in: escolher humor + Registrar colapsa para `Registrado às …`.
8. Links cruzados Meu dia ↔ Finanças da mesma versão funcionam.
9. Screenshot full-page salvo em `.playwright-mcp/` (ignorado pelo git) para a comparação.

## 9. O que NÃO fazer

Não editar `shared/*` (mudança em shared exige smoke do hub inteiro). Não editar os protótipos aprovados
existentes. Não criar mobile. Não tocar em `web/`. Não commitar: quem commita é a sessão principal, depois
do QA cruzado.
