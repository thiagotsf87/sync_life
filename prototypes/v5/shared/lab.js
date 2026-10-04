// SyncLife DS v5 — laboratório "uma escolha, mais de um efeito" + ritmo + acordo com Sy (Fase 0).
// Script clássico, como app.js. Requer mock-data.js antes (a config vive em SL_MOCK.lab).
// SLLab.boot(config): escolher cenário → ver 3 efeitos → experimentar (prévia local) → desfazer.
// Nada é lançado: a prévia só muda textos da tela; desfazer devolve o que estava no HTML
// (fotografado no boot), por isso a mesma config serve ao desktop e ao mobile dedicado.
window.SLLab = (function () {
  var NB = ' '
  var $ = function (s) { return document.querySelector(s) }
  var brl = function (n) { return 'R$' + NB + Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) }
  var hm = function (min) { return Math.floor(min / 60) + 'h' + String(min % 60).padStart(2, '0') }

  // ids dos alvos na tela (iguais em meu-dia-d.html e meu-dia-d.mobile.html)
  var ALVOS = {
    cenTitulo: '#cenTitulo', impLazer: '#impLazer', impLazerNota: '#impLazerNota', impTempo: '#impTempo',
    impTempoNota: '#impTempoNota', impAporte: '#impAporte', cenCopy: '#cenCopy',
    tempoLivre: '#tempoLivre', anel: '#anel', livreCopy: '#livreCopy', janelaLabel: '#janelaLabel', linhaDia: '#linhaDia',
    lazerLivre: '#lazerLivre', statusDia: '#statusDia', itaMeta: '#itaMeta',
    agLivre: '#agLivre', agLivreSub: '#agLivreSub', agJantar: '#agJantar', agJantarSub: '#agJantarSub',
    recibo: '#recibo', reciboTxt: '#reciboTxt', aplicar: '#aplicar', desfazer: '#desfazer',
    ritmoNota: '#ritmoNota', syModo: '#syModo', syHint: '#syHint',
  }

  function boot (cfg) {
    if (boot._done) return
    boot._done = true
    cfg = cfg || (window.SL_MOCK && SL_MOCK.lab) || {}
    var A = Object.assign({}, ALVOS, cfg.alvos || {})
    var K = cfg.consts || {}
    var CEN = cfg.cenarios || {}
    var T = cfg.textos || {}
    var sel = cfg.inicial || 'fora'

    // ── laboratório ──
    if ($(A.aplicar) && $(A.desfazer)) {
      // estado de origem da tela (o que "desfazer" devolve)
      var origem = {
        tempoLivre: $(A.tempoLivre).textContent,
        anelP: $(A.anel).style.getPropertyValue('--p'),
        livreCopy: $(A.livreCopy).innerHTML,
        janelaLabel: $(A.janelaLabel).textContent,
        seg4: document.querySelectorAll(A.linhaDia + ' i')[K.segJanela].className,
        lazerLivre: $(A.lazerLivre).textContent,
        statusDia: $(A.statusDia).textContent,
        itaMeta: $(A.itaMeta).textContent,
        agLivre: $(A.agLivre).textContent,
        agLivreSub: $(A.agLivreSub).textContent,
        agJantar: $(A.agJantar).textContent,
        agJantarSub: $(A.agJantarSub).innerHTML,
      }
      var escolher = function (k) {
        sel = k; var c = CEN[k]
        document.querySelectorAll('[data-cen]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cen === k)) })
        $(A.cenTitulo).textContent = c.nome
        var lz = K.lazer - c.custo, el = $(A.impLazer)
        el.textContent = (lz < 0 ? '– ' : '') + brl(lz); el.className = 'num ' + (lz < 0 ? 'w' : 'ok')
        $(A.impLazerNota).textContent = lz < 0 ? 'passa ' + brl(lz) + ' do teto de ' + brl(K.teto) : 'dentro do teto de ' + brl(K.teto)
        $(A.impTempo).textContent = hm(K.janela - c.prep)
        $(A.impTempoNota).textContent = c.prep ? c.prep + ' min de preparo na janela' : 'nenhum preparo na janela'
        var ap = K.fora - c.custo, ae = $(A.impAporte)
        ae.textContent = brl(ap); ae.className = 'num ' + (ap > 0 ? 'ok' : '')
        $(A.cenCopy).innerHTML = c.copy
      }
      var aplicar = function (k) {
        var c = CEN[k], livre = K.janela - c.prep, lz = K.lazer - c.custo
        $(A.tempoLivre).textContent = hm(livre)
        $(A.anel).style.setProperty('--p', (livre / K.dia).toFixed(4))
        $(A.livreCopy).innerHTML = '<b class="num">' + livre + '</b> minutos continuam livres depois dessa escolha' + (c.prep ? ', com ' + c.prep + ' min de preparo dentro da janela.' : '.')
        $(A.janelaLabel).textContent = c.prep ? 'janela de ' + K.janela + ' min · ' + c.prep + ' min de preparo' : origem.janelaLabel
        document.querySelectorAll(A.linhaDia + ' i')[K.segJanela].className = c.prep ? 'prep' : 'on'
        $(A.lazerLivre).textContent = (lz < 0 ? '– ' : '') + brl(lz)
        $(A.statusDia).textContent = c.prep ? T.comPreparo : T.semPressa
        var ap = K.fora - c.custo
        $(A.itaMeta).textContent = Math.round((K.ita + ap) / K.itaMeta * 100) + '%'
        $(A.agLivre).textContent = c.prep ? T.livreComPreparo : T.livre
        $(A.agLivreSub).textContent = livre + ' min livres' + (c.prep ? ' · ' + c.prep + ' min de preparo' : ' sem tarefa sugerida')
        $(A.agJantar).textContent = c.ag
        $(A.agJantarSub).textContent = 'Prévia · ' + c.agSub + ' · ' + brl(c.custo) + ' estimados'
        $(A.reciboTxt).innerHTML = '<b>' + c.nome + '</b> ' + T.recibo
        $(A.recibo).hidden = false
      }
      var desfazer = function () {
        $(A.tempoLivre).textContent = origem.tempoLivre
        $(A.anel).style.setProperty('--p', origem.anelP)
        $(A.livreCopy).innerHTML = origem.livreCopy
        $(A.janelaLabel).textContent = origem.janelaLabel
        document.querySelectorAll(A.linhaDia + ' i')[K.segJanela].className = origem.seg4
        $(A.lazerLivre).textContent = origem.lazerLivre
        $(A.statusDia).textContent = origem.statusDia
        $(A.itaMeta).textContent = origem.itaMeta
        $(A.agLivre).textContent = origem.agLivre
        $(A.agLivreSub).textContent = origem.agLivreSub
        $(A.agJantar).textContent = origem.agJantar
        $(A.agJantarSub).innerHTML = origem.agJantarSub
        $(A.recibo).hidden = true
        escolher(cfg.inicial || 'fora'); $(A.aplicar).focus()
      }
      document.querySelectorAll('[data-cen]').forEach(function (b) { b.addEventListener('click', function () { escolher(b.dataset.cen) }) })
      $(A.aplicar).addEventListener('click', function () { aplicar(sel) })
      $(A.desfazer).addEventListener('click', desfazer)
    }

    // ── ritmo autodeclarado: muda só a nota, nunca os dados ──
    var NOTA = cfg.ritmo || {}
    var nota = $(A.ritmoNota)
    if (nota) document.querySelectorAll('.mood[data-r]').forEach(function (b) {
      b.addEventListener('click', function () { if (NOTA[b.dataset.r]) nota.innerHTML = NOTA[b.dataset.r] })
    })

    // ── acordo de atenção com Sy ──
    var HINT = cfg.acordo || {}
    var modo = $(A.syModo), hint = $(A.syHint)
    if (modo && hint) modo.addEventListener('change', function (e) { if (HINT[e.target.value]) hint.innerHTML = HINT[e.target.value] })
  }
  return { boot: boot, brl: brl, hm: hm }
})()
