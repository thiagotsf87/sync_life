'use client'

// Fase 2 · /financas/transacoes (template T2, r2). Container: dados reais (useTransacoesV5),
// estado de UI e a moldura comum SubtelaV5. A apresentação mora em TransacoesView; a captura e
// a edição, em TransacaoPainel (exportado para o Calendário). O Registrar do bar e da bottom bar
// e `#registrar` na URL abrem a captura: no desktop foca a linha inline, no mobile abre o sheet.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { TransacaoPainel, type RascunhoTx } from '@/components/app-v5/financas/TransacaoPainel'
import { TransacoesView, type CapturaRapida } from '@/components/app-v5/financas/TransacoesView'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { useTransacoesV5 } from '@/hooks/use-transacoes-v5'
import { useTransactionMutations } from '@/hooks/use-transactions'
import { prefersReduce } from '@/lib/v5/viva'
import { deslocarMes, mesDe, mesIgual, nomeMes, textoQuantidade, type TxLinha } from '@/lib/financas/transacoes'

interface EstadoPainel { open: boolean; inicial: TxLinha | null; rascunho: RascunhoTx | null }

const SUGESTOES = [
  'Quanto ainda posso gastar em lazer?',
  'Onde foi o maior gasto da semana?',
  'O que ainda vai sair este mês?',
]

export function TransacoesV5() {
  const d = useTransacoesV5()
  const mob = useMobV5()
  const qc = useQueryClient()
  const router = useRouter()
  const { create } = useTransactionMutations()

  const [painel, setPainel] = useState<EstadoPainel>({ open: false, inicial: null, rascunho: null })
  const [prevAberto, setPrevAberto] = useState(false)
  const [novaId, setNovaId] = useState<string | null>(null)
  const timerNova = useRef<number | null>(null)
  useEffect(() => () => { if (timerNova.current) window.clearTimeout(timerNova.current) }, [])

  const destacar = useCallback((id: string) => {
    setNovaId(id)
    if (timerNova.current) window.clearTimeout(timerNova.current)
    timerNova.current = window.setTimeout(() => setNovaId(null), 2400)
  }, [])

  const abrirNovo = (rascunho: RascunhoTx | null = null) => setPainel({ open: true, inicial: null, rascunho })
  // ocorrência de recorrente ainda não é transação: editar aqui duplicaria o lançamento
  const abrirEdicao = (l: TxLinha) => {
    if (l.ocorrencia) { router.push('/financas/recorrentes'); return }
    setPainel({ open: true, inicial: l, rascunho: null })
  }
  const fechar = useCallback(() => setPainel(p => ({ ...p, open: false })), [])

  const focarCaptura = () => {
    const el = document.getElementById('tx-cap-desc')
    el?.focus({ preventScroll: true })
    el?.scrollIntoView({ block: 'center', behavior: prefersReduce() ? 'auto' : 'smooth' })
  }
  const registrar = () => { if (mob) abrirNovo(); else focarCaptura() }

  // `#registrar` (link do bar e da bottom bar em outras telas): abre a captura ao montar
  useEffect(() => {
    if (window.location.hash !== '#registrar') return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (window.matchMedia('(max-width:1023px)').matches) {
      // fora do corpo do efeito: abre o sheet depois da montagem (a transição precisa de um frame fechado)
      const t = window.setTimeout(() => setPainel({ open: true, inicial: null, rascunho: null }), 0)
      return () => window.clearTimeout(t)
    }
    focarCaptura()
  }, [])

  const mudarMes = (delta: -1 | 1) => {
    if (delta === 1 && !d.podeAvancar) return
    setPrevAberto(false)
    d.irPara(deslocarMes(d.mes, delta))
  }

  const capturar = async (c: CapturaRapida): Promise<{ ok: boolean; msg: string }> => {
    const cat = d.categorias.find(x => x.id === c.categoriaId)
    if (!cat) return { ok: false, msg: 'Escolha uma categoria.' }
    try {
      const r = await create({
        type: cat.type, description: c.desc, amount: c.valor, category_id: c.categoriaId, date: c.data, payment_method: 'pix',
      })
      void qc.invalidateQueries({ queryKey: ['financas-v5'] })
      if (!mesIgual(mesDe(c.data), d.mes)) d.irPara(mesDe(c.data))
      destacar(r.id)
      return { ok: true, msg: c.data > d.hoje ? 'Registrado como previsto.' : 'Registrado.' }
    } catch {
      return { ok: false, msg: 'Não consegui registrar.' }
    }
  }

  const nome = nomeMes(d.mes)
  const n = d.totais?.quantidade
  const saudacao = n === undefined
    ? `Já li as suas transações de ${nome}. O que você quer saber?`
    : `Já li as suas ${n} ${n === 1 ? 'transação' : 'transações'} de ${nome}. O que você quer saber?`

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="transacoes"
      voltarHref="/financas"
      voltarRotulo={`Finanças · ${nomeMes(d.mes)}`}
      voltarNumero="01"
      tituloCurto="Transações"
      classe="transacoes"
      coach={{ leitura: 'suas transações', saudacao, sugestoes: SUGESTOES }}
      onRegistrar={registrar}
      chaveReveal={`${d.loading}-${d.erro}`}
      rodape={
        <footer className="colofao">
          <span>{d.totais ? textoQuantidade(d.totais.quantidade, nome) : 'Lendo o mês'}</span>
          <div className="r">
            {d.ultimaSinc && <span suppressHydrationWarning>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>}
          </div>
        </footer>
      }
      extra={
        <TransacaoPainel
          open={painel.open}
          onClose={fechar}
          inicial={painel.inicial}
          rascunho={painel.rascunho}
          onSalvo={({ id, data }) => {
            if (data && !mesIgual(mesDe(data), d.mes)) d.irPara(mesDe(data))
            if (id) destacar(id)
          }}
        />
      }
    >
      {({ abrirCoach, mob: mobTela }) => (
        <TransacoesView
          mob={mobTela}
          hoje={d.hoje}
          mes={d.mes}
          mesAtual={d.mesAtual}
          podeAvancar={d.podeAvancar}
          onMes={mudarMes}
          onHoje={() => { setPrevAberto(false); d.voltarHoje() }}
          tipo={d.tipo}
          onTipo={d.setTipo}
          categoriaId={d.categoriaId}
          onCategoria={d.setCategoriaId}
          q={d.q}
          onQ={d.setQ}
          ordem={d.ordem}
          onOrdem={d.setOrdem}
          filtrando={d.filtrando}
          categorias={d.categorias}
          linhas={d.linhas}
          previstos={d.previstos}
          totalFiltrado={d.totalFiltrado}
          temMais={d.temMais}
          onMais={d.carregarMais}
          totais={d.totais}
          loading={d.loading}
          trocandoMes={d.trocandoMes}
          erro={d.erro}
          onRecarregar={d.recarregar}
          prevAberto={prevAberto}
          onPrevAberto={setPrevAberto}
          novaId={novaId}
          onAbrir={abrirEdicao}
          onCapturar={capturar}
          onCapturaMais={abrirNovo}
          onFalar={abrirCoach}
        />
      )}
    </SubtelaV5>
  )
}

export default TransacoesV5
