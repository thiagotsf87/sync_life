// SyncLife · o roteiro de Sy na bancada — O QUE ele diz e mostra.
//
// Extraído de diario-bancada.html porque a bancada passou a existir em duas
// apresentações (desktop e mobile 390×844) e a regra é: o CONTEÚDO é um só,
// a APRESENTAÇÃO é de cada dispositivo. Duas cópias das falas viraria Sy
// dizendo uma coisa no desktop e outra no celular bem na hora de julgar, e a
// frente de conteúdo do Diário está aberta, então essas falas ainda vão ser
// reescritas muitas vezes.
//
// ATENÇÃO AO QUE ISTO É: dado de maquete, não modelo de conteúdo. Em produção
// o roteiro vem da API (o brief é gerado, não fixo) e a síntese de voz vai pro
// servidor. O que sobrevive daqui pro `web/` não é o dado, é o FORMATO:
//   TEMPOS = N × { fala curta e sem cifra + um objeto visual }
// e a regra que produziu esse formato, que é "Sy fala a conclusão, a lâmina
// mostra a cifra" (o sintetizador lê "R$ 2.120" como 28 caracteres falados).
//
// A divisão de trabalho segue a mesma de `vida.js` × `enxame.js`: aqui mora o
// que Sy diz, na página mora como ele acende, imprime e empilha.

/* ── as falas soltas ─────────────────────────────────────────────────── */

// no repouso a fala não é resumo (a folha já é isso), é a próxima ação
export const FALA_REPOUSO =
  'Restam R$ 10 de lazer até sexta. É a única coisa que precisa de você hoje.'

export const PERGUNTA_CHECKIN = 'E aí, como foi o dia?'

export const MOODS = ['Péssimo', 'Ruim', 'Neutro', 'Bem', 'Ótimo']

// o que fica impresso depois que você responde. É recorte, não lâmina: veio de
// você, então sobrevive quando a edição assenta
export const recorteCheckin = (humor, nota) => `
  <div class="rc-top"><p class="eyebrow"><b>Check-in</b> · registrado às 21:14</p>
    <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
  <p><b>${humor}</b>${nota ? ' · “' + nota + '”' : ''}</p>`

// a confirmação depois do check-in: Sy anota e entrega a edição
export const FALA_POS_CHECKIN = 'Anotado. Vou deixar a edição de hoje aqui embaixo.'

// frase curta pra ouvir o timbre na hora de trocar de voz, sem rodar a
// apresentação inteira. Escrita por extenso porque é justamente o timbre que
// se quer julgar, não a expansão de número do sintetizador.
export const AMOSTRA = 'Restam dez reais de lazer até sexta.'

// as três sugestões da régua ficam no HTML de cada página, não aqui: sem JS
// elas precisam existir na marcação (E-02). São estas, e as duas páginas
// carregam as mesmas:
//   lazer   · Quanto ainda posso gastar em lazer?
//   semana  · Como foi minha semana?
//   almoco  · Lancei R$ 40 no almoço

/* ── entrada: as duas portas caem no mesmo lugar (lei 2) ──────────────── */
// Roteador de intenção da maquete. Encena o que o modelo vai fazer de verdade:
// voz e texto entram pela mesma porta e caem no mesmo repertório.
export function texto (t) {
  const s = t.toLowerCase()
  if (/lazer|gastar/.test(s)) return 'lazer'
  if (/almoç|lancei|lançar|gastei/.test(s)) return 'almoco'
  if (/itáli|italia|aporte|antecip/.test(s)) return 'italia'
  if (/semana|revis/.test(s)) return 'semana'
  if (/score|life|mostra|abre|leva/.test(s)) return 'levar'
  return 'lazer'
}

/* ══ o roteiro ════════════════════════════════════════════════════════
   Fábrica em vez de constante porque as respostas AGEM na página: acendem um
   objeto, imprimem um recorte, mexem num valor da edição. Esses verbos são
   presentação e mudam entre desktop e mobile (no mobile a lâmina vive num
   palco de tela cheia, no desktop ela empilha embaixo da bancada), então cada
   página passa os seus. O texto e o HTML, que são conteúdo, ficam aqui.

   verbos = { $, acender, acenderTicker, recortar, dizer, syEstado }
     $(sel)                    → elemento da página
     acender(sel|el)           → o objeto já está na edição, pisca (verbo 1)
     acenderTicker(chave)      → destaca a passagem no ticker
     recortar(html, tipo)      → imprime e devolve o <article> (verbo 2)
     dizer(txt, aoFim)         → Sy fala e digita
     syEstado(v)               → troca o estado do corpo e repinta a voz
   ══════════════════════════════════════════════════════════════════════ */
export function criarRoteiro (verbos) {
  const { $, acender, acenderTicker, recortar, dizer, syEstado } = verbos

  // Os tempos são os mesmos assuntos que a folha traz por escrito, na mesma
  // ordem: o que mudou, como está o mês, como estão as SUAS áreas (as que você
  // escolheu no onboarding), e o que precisa de você. A folha depois é o registro.
  const TEMPOS = [
    { fala: 'Boa tarde. Desde ontem mudou uma coisa: o lazer encostou no teto.',
      faz: () => acenderTicker('lazer'),
      lamina: `
        <div class="rc-top"><p class="eyebrow"><b>Ao vivo</b> · orçamento de lazer</p></div>
        <div class="rc-obj">
          <div class="r1"><span class="nm">Lazer · julho</span><span class="pct num" style="color:var(--coral)">98%</span></div>
          <div class="track"><i style="width:98%"></i></div>
          <div class="sub">R$&nbsp;410 de R$&nbsp;420 · restam R$&nbsp;10 pra 4 dias</div>
        </div>` },
    // REGRA DE COPY DA VOZ: Sy fala a conclusão, a lâmina mostra a cifra.
    // O sintetizador lê "R$ 2.120" como "dois mil cento e vinte reais": 8
    // caracteres escritos viram 28 falados, e um briefing denso em número fica
    // lento por construção. Tirar os números da fala cortou um terço da duração
    // sem tirar uma informação sequer da tela.
    { fala: 'Fora isso, julho já está ganho, e a poupança fecha acima da sua meta.',
      lamina: `
        <div class="rc-top"><p class="eyebrow"><b>Ao vivo</b> · fechamento projetado de julho</p></div>
        <div class="lm-nums">
          <div><span>Fechamento</span><b class="num">R$&nbsp;2.120</b></div>
          <div><span>Poupança</span><b class="num ele">37%</b></div>
          <div><span>Sua meta</span><b class="num">30%</b></div>
          <div><span>Saldo hoje</span><b class="num">R$&nbsp;1.840</b></div>
        </div>` },
    { fala: 'Nas suas quatro áreas, três subiram. Só Experiências ficou parada.',
      lamina: `
        <div class="rc-top"><p class="eyebrow"><b>Ao vivo</b> · suas áreas, o número principal de cada uma</p></div>
        <div class="lm-areas">
          <div><span class="di num">01</span><span class="nm">Finanças</span><span class="sc num">83<em>▲2</em></span>
               <span class="mt num">Saldo R$&nbsp;1.840 · lazer no limite</span></div>
          <div><span class="di num">02</span><span class="nm">Futuro</span><span class="sc num">79<em>▲1</em></span>
               <span class="mt num">3 metas · 61% de média</span></div>
          <div><span class="di num">04</span><span class="nm">Corpo</span><span class="sc num">69<em>▲3</em></span>
               <span class="mt num">3 atividades · 126 min</span></div>
          <div><span class="di num">08</span><span class="nm">Experiências</span><span class="sc num">78<em class="zero">–</em></span>
               <span class="mt num">Itália em 92 dias · 68% da meta</span></div>
        </div>` },
    { fala: 'Segure o lazer até sexta e o mês fecha redondo.',
      lamina: `
        <div class="rc-top"><p class="eyebrow"><b>Ao vivo</b> · o que precisa de você hoje</p></div>
        <p>Um café a menos resolve os <b>R$&nbsp;10</b> que faltam. E, se quiser adiantar,
           cabem <b>+R$&nbsp;120</b> no aporte da Itália sem apertar o fechamento.</p>` },
  ]

  /* ── o repertório: cada resposta traz o objeto visual junto (lei 3) ──── */
  const RESPOSTAS = {
    lazer: {
      fala: 'Quase nada: restam R$ 10 até quinta.',
      faz () {
        acender('#notaLazer'); acenderTicker('lazer')
        recortar(`
          <div class="rc-top"><p class="eyebrow"><b>Recorte</b> · orçamento de lazer</p>
            <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
          <p>Você usou <span class="w">R$&nbsp;410 dos R$&nbsp;420</span>, e o cinema de ontem
             (<b>R$&nbsp;64</b>) foi o que encostou no teto. Sobram <b>R$&nbsp;10</b> pra 4 dias.</p>
          <div class="rc-obj">
            <div class="r1"><span class="nm">Lazer · julho</span><span class="pct num" style="color:var(--coral)">98%</span></div>
            <div class="track"><i style="width:98%"></i></div>
            <div class="sub">R$&nbsp;410 de R$&nbsp;420 · fecha em 4 dias</div>
          </div>
          <div class="rc-pe">
            <button class="rc-src" type="button">Ver em <b>01 Finanças</b> →</button>
            <span class="rc-fonte">Fontes: orçamento Lazer · 34 transações</span>
          </div>`)
      },
    },
    almoco: {
      fala: 'Lançado. Despesas de julho vão a R$ 3.200.',
      faz () {
        $('#vDespesas').innerHTML = 'R$&nbsp;3.200'
        $('#dDespesas').textContent = '64% da receita'
        acender('#boxDespesas')
        const art = recortar(`
          <div class="rc-top"><p class="eyebrow"><b>Feito</b> · lançamento registrado</p>
            <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
          <p>Despesa de <b>R$&nbsp;40,00</b> em <b>Alimentação</b>, hoje às 14:06.
             Julho passa a <b>R$&nbsp;3.200</b> e o fechamento projetado vai pra <b>R$&nbsp;2.080</b>.</p>
          <div class="rc-pe">
            <button class="rc-src" type="button" data-desfazer>↩ Desfazer</button>
            <button class="rc-src" type="button">Ver em <b>01 Finanças</b> →</button>
          </div>`, 'acao')
        const und = art.querySelector('[data-desfazer]')
        und.addEventListener('click', () => {
          $('#vDespesas').innerHTML = 'R$&nbsp;3.160'
          $('#dDespesas').textContent = '63% da receita'
          acender('#boxDespesas'); art.remove()
        })
      },
    },
    italia: {
      // ação que mexe em meta: pede licença antes (lei 9)
      fala: 'Posso antecipar, mas isso mexe numa meta. Confirma?',
      estadoFinal: 'ouvindo',
      faz () {
        acender('#metaItalia')
        const art = recortar(`
          <div class="rc-top"><p class="eyebrow"><b>Preciso da sua licença</b> · aporte de agosto</p>
            <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
          <p>Transferir <b>R$&nbsp;580,00</b> pra <b>Viagem Itália</b> hoje às 16:00.
             A meta vai de <b>68%</b> pra <b>73%</b> e o saldo projetado continua positivo em <b>R$&nbsp;1.540</b>.</p>
          <div class="rc-obj">
            <div class="r1"><span class="nm">Viagem Itália · depois da ação</span><span class="pct num" style="color:var(--ele)">73%</span></div>
            <div class="track"><i class="ok" style="width:73%"></i></div>
            <div class="sub">R$&nbsp;9.180 de R$&nbsp;12.700 · dez 2026</div>
          </div>
          <div class="rc-pe">
            <button class="rc-src" type="button" data-ok><b>Confirmar</b></button>
            <button class="rc-src" type="button" data-nao>Agora não</button>
          </div>`, 'aviso')
        art.querySelector('[data-nao]').addEventListener('click', () => art.remove())
        art.querySelector('[data-ok]').addEventListener('click', () => {
          art.remove()
          syEstado('comemora')
          const m = $('#metaItalia')
          m.querySelector('.pct').textContent = '73%'
          m.querySelector('.track i').style.width = '73%'
          acender(m)
          recortar(`
            <div class="rc-top"><p class="eyebrow"><b>Feito</b> · aporte antecipado</p>
              <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
            <p>Transferência de <b>R$&nbsp;580,00</b> agendada pra hoje, 16:00. Confirmado por você às 14:07.</p>
            <div class="rc-pe"><button class="rc-src" type="button">Ver em <b>02 Futuro</b> →</button></div>`, 'acao')
          setTimeout(() => syEstado('repouso'), 2600)
        })
      },
    },
    semana: {
      // lei 6: a edição da semana é uma apresentação, não uma tela
      fala: 'A semana fechou ontem. Quer que eu apresente a edição?',
      estadoFinal: 'ouvindo',
      faz () {
        const art = recortar(`
          <div class="rc-top"><p class="eyebrow"><b>Edição da semana</b> · nº 30, de 24 a 30 de julho</p>
            <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
          <p>Score subiu <b>3</b> pontos, você economizou <b>R$&nbsp;412</b> em delivery e fechou
             <b>3</b> dos 4 hábitos. Falta o fechamento da semana, que conta pro streak de <b>12 dias</b>.</p>
          <div class="rc-pe">
            <button class="rc-src" type="button" data-abrir><b>Apresentar a edição</b> →</button>
            <span class="rc-fonte">O Diário troca de forma: a folha vira a carta da semana</span>
          </div>`)
        art.querySelector('[data-abrir]').addEventListener('click', () => {
          art.remove()
          dizer('Edição da semana nº 30. Foi a sua melhor semana desde março.')
          syEstado('falando')
          $('.folha .eyebrow').innerHTML = '<b>A edição da semana</b> · nº 30, 24 a 30 de julho'
          $('.folha h2').textContent = 'A melhor semana desde março, e ela veio de duas noites.'
          acender('.folha h2')
          recortar(`
            <div class="rc-top"><p class="eyebrow"><b>Fechamento da semana</b> · conta pro streak</p>
              <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
            <p>Este é o único passo que persiste: ele grava a revisão e mantém o streak vivo.</p>
            <div class="rc-pe"><button class="rc-src" type="button"><b>Fechar a semana</b> →</button></div>`, 'acao')
        })
      },
    },
    levar: {
      // lei 5: pode levar, nunca perder
      fala: 'Abrindo o Life Score. Eu vou junto e comento o que aparecer.',
      faz () {
        // opcional nas duas páginas: quem não tem trilha nem mini bancada
        // simplesmente não mostra o caminho de volta, e o recorte explica a regra
        $('#trilha')?.classList.add('on')
        $('#bmini')?.classList.add('on')
        recortar(`
          <div class="rc-top"><p class="eyebrow"><b>Sy leva você</b> · destino real</p>
            <button class="rc-x" type="button" aria-label="Dispensar">×</button></div>
          <p>Nesta maquete a navegação não sai da página. O que ela mostra é a regra:
             o destino é uma <b>URL de verdade</b> (<b>/dashboard/score</b>), Sy encolhe pro registro
             de copiloto e a <b>trilha de volta</b> fica visível lá em cima.</p>
          <div class="rc-pe">
            <span class="rc-fonte">Use o alternador 3 do painel pra ver o registro copiloto inteiro</span>
          </div>`)
      },
    },
  }

  return { TEMPOS, RESPOSTAS }
}
