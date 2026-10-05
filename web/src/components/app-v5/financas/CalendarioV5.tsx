'use client'

// Fase 2 · /financas/calendario (T3, grade mensal). Container: dados reais (useCalendarioV5), estado
// de UI (dia selecionado, painéis) e a moldura comum SubtelaV5. O corpo é CalendarioView (puro,
// testável). Captura e edição de transação reusam TransacaoPainel; evento planejado, o
// EventoPlanejadoPainel de Planejamento; o provento de 06 Patrimônio abre só leitura. Registrar do
// bar e da bottom bar abre a captura com o dia selecionado.

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { Painel } from '@/components/app-v5/Painel'
import { TransacaoPainel } from '@/components/app-v5/financas/TransacaoPainel'
import { EventoPlanejadoPainel } from '@/components/app-v5/financas/EventoPlanejadoPainel'
import { CalendarioView } from '@/components/app-v5/financas/CalendarioView'
import { useCalendarioV5 } from '@/hooks/use-calendario-v5'
import type { PlanningEvent } from '@/hooks/use-planejamento'
import { assinadoBrl, brlInteiro, diaDoMes, diaPadrao, textoQuantidadeCal, type ItemCal } from '@/lib/financas/calendario'
import { deslocarMes, mesDe, mesIgual, nomeMes, type TxLinha } from '@/lib/financas/transacoes'
import './calendario-v5.css'

interface EstadoTx { open: boolean; inicial: TxLinha | null; dia: string }
interface EstadoEvento { open: boolean; inicial: PlanningEvent | null; dia: string }

export function CalendarioV5() {
  const d = useCalendarioV5()

  const [selRaw, setSelRaw] = useState<string | null>(null)
  const [tx, setTx] = useState<EstadoTx>({ open: false, inicial: null, dia: '' })
  const [ev, setEv] = useState<EstadoEvento>({ open: false, inicial: null, dia: '' })
  const [prov, setProv] = useState<{ open: boolean; item: ItemCal | null }>({ open: false, item: null })
  const [novaId, setNovaId] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const timerNova = useRef<number | null>(null)
  const timerAviso = useRef<number | null>(null)
  const focoPendente = useRef(false)

  useEffect(() => () => {
    if (timerNova.current) window.clearTimeout(timerNova.current)
    if (timerAviso.current) window.clearTimeout(timerAviso.current)
  }, [])

  // o dia selecionado precisa estar no mês exibido (derivado no render, sem efeito)
  const sel = selRaw && mesIgual(mesDe(selRaw), d.mes) ? selRaw : diaPadrao(d.mes, d.hoje)

  const selecionar = useCallback((iso: string, foco = false) => {
    focoPendente.current = foco
    setSelRaw(iso)
    setNovaId(null)
  }, [])

  // setas do teclado na grade: o foco acompanha o dia depois da renderização
  useEffect(() => {
    if (!focoPendente.current) return
    focoPendente.current = false
    document.querySelector<HTMLElement>(`.cal-v5 .dia[data-d="${sel}"]`)?.focus({ preventScroll: true })
  }, [sel])

  const destacar = (id: string) => {
    setNovaId(id)
    if (timerNova.current) window.clearTimeout(timerNova.current)
    timerNova.current = window.setTimeout(() => setNovaId(null), 2400)
  }

  const mudarMes = (delta: -1 | 1) => d.irPara(deslocarMes(d.mes, delta))
  const irHoje = () => { d.voltarHoje(); setSelRaw(d.hoje); setNovaId(null) }

  const abrirTx = (dia: string) => setTx({ open: true, inicial: null, dia })
  const abrirEv = (dia: string) => setEv({ open: true, inicial: null, dia })

  const abrirItem = (i: ItemCal) => {
    if (i.origem === 'transacao' && i.tx) setTx({ open: true, inicial: i.tx, dia: i.data })
    else if (i.origem === 'evento' && i.eventoId) setEv({ open: true, inicial: d.eventoPorId(i.eventoId), dia: i.data })
    else if (i.origem === 'provento') setProv({ open: true, item: i })
  }

  const avisar = (m: string) => {
    setAviso(m)
    if (timerAviso.current) window.clearTimeout(timerAviso.current)
    timerAviso.current = window.setTimeout(() => setAviso(''), 3200)
  }

  const nome = nomeMes(d.mes)
  const proventoDoMes = d.itens.find(i => i.origem === 'provento')
  const sugestoes = [
    'Em que dia o mês aperta?',
    `O que ainda vai sair em ${nome}?`,
    proventoDoMes?.ticker ? `Quando entra o provento de ${proventoDoMes.ticker}?` : 'Quanto sobra no fim do mês?',
  ]

  const it = prov.item

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="calendario"
      voltarHref="/financas"
      voltarRotulo={`Finanças · ${nome}`}
      tituloCurto={`Calendário · ${nome}`}
      classe="cal-v5"
      coach={{
        leitura: 'o seu calendário',
        saudacao: `Já li o seu ${nome}, dia a dia. O que você quer saber?`,
        sugestoes,
      }}
      onRegistrar={() => abrirTx(sel)}
      chaveReveal={`${d.loading}-${d.erro}`}
      rodape={
        <footer className="colofao">
          {d.projecao !== null
            ? <span>Fechamento projetado de {nome}: <b className="num">{brlInteiro(d.projecao)}</b></span>
            : <span>{d.loading ? 'Lendo o mês' : `Calendário de ${nome}`}</span>}
          <div className="r">
            {!d.loading && <span>{textoQuantidadeCal(d.quantidadeTx, nome)}</span>}
            {d.ultimaSinc && <span suppressHydrationWarning>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>}
          </div>
        </footer>
      }
      extra={
        <>
          <TransacaoPainel
            open={tx.open}
            onClose={() => setTx(s => ({ ...s, open: false }))}
            inicial={tx.inicial}
            dataPadrao={tx.dia}
            onSalvo={({ id, data }) => {
              d.aposMutar()
              if (data) {
                selecionar(data)
                if (!mesIgual(mesDe(data), d.mes)) d.irPara(mesDe(data))
              }
              if (id) destacar(id)
            }}
          />
          <EventoPlanejadoPainel
            open={ev.open}
            onClose={() => setEv(s => ({ ...s, open: false }))}
            inicial={ev.inicial}
            dataPadrao={ev.dia}
            onSalvo={m => { d.aposMutar(); avisar(m) }}
          />
          <Painel
            open={prov.open}
            onClose={() => setProv(s => ({ ...s, open: false }))}
            eyebrow="Provento"
            titulo={it?.desc ?? 'Provento'}
            idTitulo="prov-titulo"
          >
            {it && (
              <div className="prov">
                <div>
                  <span className="eyebrow">{diaDoMes(it.data)} · previsto</span>
                  <b className="num">{assinadoBrl(it.valor)}</b>
                </div>
                <p>
                  Vem de <strong>06 Patrimônio</strong>: provento anunciado{it.ticker ? ` de ${it.ticker}` : ''}, pago na conta em {diaDoMes(it.data)}.
                  Aqui ele só entra na projeção; muda quando o pagamento for registrado.
                </p>
                <p><Link href="/patrimonio">Abrir em 06 Patrimônio →</Link></p>
              </div>
            )}
          </Painel>
        </>
      }
    >
      {({ abrirCoach, mob }) => (
        <CalendarioView
          mob={mob}
          hoje={d.hoje}
          mes={d.mes}
          onMes={mudarMes}
          onHoje={irHoje}
          itens={d.itens}
          projecao={d.projecao}
          loading={d.loading}
          erro={d.erro}
          onRecarregar={d.recarregar}
          sel={sel}
          onSelecionar={selecionar}
          novaId={novaId}
          aviso={aviso}
          onAdicionarTx={abrirTx}
          onAdicionarEvento={abrirEv}
          onAbrirItem={abrirItem}
          onFalar={abrirCoach}
        />
      )}
    </SubtelaV5>
  )
}

export default CalendarioV5
