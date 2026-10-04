'use client'

// Fase 1 · Task 17 · cartão de proposta da intenção composta. Porte 1:1 do
// `.prop` de prototypes/v5/app/_intencao.html (+ .mobile): caminhos em `.opc`,
// registros marcáveis (checkbox cobrindo a linha) com valor editável onde o
// protótipo edita, efeito por área, "De onde vêm esses efeitos?", `Criar N
// registros`; depois o cartão Feito com links reais e um único Desfazer com
// confirmação inline; por fim, Desfeito. Criar é reversível: marcar e clicar É a
// confirmação (spec §6.2, passo 4). O estado vem de useIntencao (a camada é dona).

import { Fragment, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { UseIntencao } from '@/hooks/use-intencao'
import type { Caminho, TabelaIntencao } from '@/lib/intencao/schemas'
import {
  AREA_POR_TABELA, NOME_AREA, aplicarEdicao, areaDaTabela, areasDosRegistros, contarMarcados,
  editavelDe, efeitosComEstado, montarPayloadAplicar, partesNumericas, rotuloCriar, rotuloFeito,
  separarRotulo, tituloDaProposta, valorDoCaminho,
} from '@/lib/intencao/proposta'
import { mensagemDesfeito } from '@/lib/intencao/rotas'
import './proposta-intencao.css'

const SP_TZ = 'America/Sao_Paulo'

/** linha miúda sob cada registro (a tabela e o vínculo, como no protótipo); entra via attr() no CSS */
const SUB: Record<TabelaIntencao, string> = {
  study_tracks: 'study_tracks · trilha de estudo',
  agenda_events: 'agenda_events · repete toda semana',
  recurring_transactions: 'recurring_transactions · despesa',
  skills: 'skills · vínculo com a trilha',
  goals: 'goals · meta com prazo',
}

const NUMS = ['', 'um', 'dois', 'três', 'quatro']

function ComNumeros({ texto, tag = 'span' }: { texto: string; tag?: 'span' | 'b' }) {
  return (
    <>
      {partesNumericas(texto).map((p, i) =>
        p.num
          ? tag === 'b' ? <b key={i} className="num">{p.t}</b> : <span key={i} className="num">{p.t}</span>
          : <Fragment key={i}>{p.t}</Fragment>,
      )}
    </>
  )
}

function hoje(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── proposta (em aberto) ────────────────────────────────────────────────────
function Proposta({ ctl }: { ctl: UseIntencao }) {
  const it = ctl.atual
  const caminhos = it?.proposta.caminhos ?? []
  const [sel, setSel] = useState(caminhos[0]?.id ?? '')
  const c: Caminho | undefined = caminhos.find(x => x.id === sel) ?? caminhos[0]
  const [marcados, setMarcados] = useState<boolean[]>(() => (c ? c.registros.map(() => true) : []))
  const [valores, setValores] = useState<(string | undefined)[]>([])
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const [hojeISO] = useState(hoje)

  if (!it || !c) return null

  const escolher = (id: string) => {
    if (id === sel) return
    const novo = caminhos.find(x => x.id === id)
    setSel(id)
    setMarcados(novo ? novo.registros.map(() => true) : [])
    setValores([])
    setErroLocal(null)
    ctl.limparErro()
  }

  const n = contarMarcados(marcados)
  const aplicando = ctl.estado === 'aplicando'
  const areas = areasDosRegistros(c.registros)
  const efeitos = efeitosComEstado(c, marcados)

  const criar = () => {
    const p = montarPayloadAplicar(it.id, c, marcados, valores)
    if (!p.ok) { setErroLocal(p.erro); return }
    setErroLocal(null)
    void ctl.aplicar(p.body.caminho, p.body.registros)
  }

  const erro = erroLocal ?? ctl.erro

  return (
    <section className="prop" aria-label={tituloDaProposta(it.texto).replace(' · ', ': ')}>
      <p className="eyebrow"><b>{areas.join(' · ')}</b> · {areas.map(a => NOME_AREA[a]).join(', ')}</p>
      <h3>{tituloDaProposta(it.texto)}</h3>
      <p className="pp">
        {(NUMS[caminhos.length] ?? String(caminhos.length)).replace(/^./, ch => ch.toUpperCase())} caminhos, com o efeito em cada área antes de qualquer registro. Marque o que quer criar; o resto fica de fora.
      </p>
      <div className="opcoes" role="group" aria-label="Caminhos">
        {caminhos.map(x => (
          <button key={x.id} className="opc" type="button" aria-pressed={x.id === c.id} onClick={() => escolher(x.id)}>
            <span>{x.titulo}</span>
            <span className="n num">{valorDoCaminho(x, hojeISO)}</span>
          </button>
        ))}
      </div>
      <div className="pbody">
        <div className="et"><b>{c.titulo}</b><span className="eyebrow">Registros</span></div>
        <div className="regs" role="group" aria-label="Registros a criar">
          {c.registros.map((r, i) => {
            const ed = editavelDe(r)
            const v = valores[i] ?? ed?.valor ?? ''
            const vivo = aplicarEdicao(r, valores[i]) ?? r
            const { area, resto } = separarRotulo(vivo.rotulo)
            const on = !!marcados[i]
            const setV = (val: string) => setValores(prev => { const nx = [...prev]; nx[i] = val; return nx })
            return (
              <div key={`${c.id}:${i}`} className={on ? 'reg' : 'reg off'} data-area={AREA_POR_TABELA[r.tabela]}>
                <label className="rk">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={e => { const ck = e.target.checked; setMarcados(prev => { const nx = [...prev]; nx[i] = ck; return nx }) }}
                  />
                  <i aria-hidden="true" />
                  <span className="ix num">{AREA_POR_TABELA[r.tabela]}</span>
                  <span className="rt">
                    {area ? `${area} · ` : ''}<ComNumeros texto={resto} />
                    <small data-sub={SUB[r.tabela]} />
                  </span>
                </label>
                {ed && (
                  ed.tipo === 'brl' ? (
                    <span className="rval">R${' '}<input type="text" inputMode="numeric" value={v} aria-label={ed.aria} onChange={e => setV(e.target.value)} />/mês</span>
                  ) : (
                    <span className="rval"><input className="txt" type="text" value={v} aria-label={ed.aria} onChange={e => setV(e.target.value)} /></span>
                  )
                )}
              </div>
            )
          })}
        </div>
        <p className="eyebrow pe2">Efeito por área</p>
        <ul className="impl" aria-live="polite">
          {efeitos.map((e, i) => (
            <li key={`${e.area}:${i}`} className={e.off ? 'off' : undefined}>
              <span className="ix num">{e.area}</span>
              <span>{e.off ? `${separarRotulo(e.texto).area || NOME_AREA[e.area]} · sem o registro, nada muda nesta área` : <ComNumeros texto={e.texto} tag="b" />}</span>
            </li>
          ))}
        </ul>
        <details className="evid">
          <summary>De onde vêm esses efeitos?</summary>
          <p><ComNumeros texto={c.resumo} /></p>
          <p>
            Os valores dos campos são editáveis: Sy assumiu o que você não disse. Não modelado: deslocamento, provas, feriados.
            {it.fontes.length > 0 ? ` Fontes: ${it.fontes.join(', ')}.` : ''}
          </p>
        </details>
        <div className="aplicar">
          <button className="btn-sm roxo" type="button" disabled={n === 0 || aplicando} onClick={criar}>
            {aplicando ? 'Criando…' : rotuloCriar(n)}
          </button>
          <span>Reversível. Um Desfazer remove tudo que você não editou depois.</span>
        </div>
        {erro && <p className="perr" role="alert">{erro}</p>}
      </div>
    </section>
  )
}

// ─── feito, confirmação e desfeito ───────────────────────────────────────────
function Feito({ ctl }: { ctl: UseIntencao }) {
  const [conf, setConf] = useState(false)
  const desfazerRef = useRef<HTMLButtonElement>(null)
  const naoRef = useRef<HTMLButtonElement>(null)
  const desfazendo = ctl.estado === 'desfazendo'
  const n = ctl.feitos.length

  // Criar → foco no Desfazer (protótipo); pedir confirmação → foco no Manter
  useEffect(() => { desfazerRef.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => { if (conf) naoRef.current?.focus({ preventScroll: true }) }, [conf])

  return (
    <div className="action feito" role="status">
      <div className="al">Feito · <span>{rotuloFeito(ctl.feitos)}</span></div>
      <ul>
        {ctl.feitos.map(f => (
          <li key={`${f.tabela}:${f.id}`}>
            <Link href={f.href}>
              <span className="ix num">{areaDaTabela(f.tabela) ?? ''}</span>
              <span><ComNumeros texto={f.rotulo} /></span>
              <span className="go">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="fr">
        <span>{ctl.aplicadaEm ? <>Criado às <span className="num">{hora(ctl.aplicadaEm)}</span></> : 'Criado'}</span>
        <button type="button" ref={desfazerRef} onClick={() => setConf(true)}>Desfazer</button>
      </div>
      {conf && (
        <div className="confirma">
          <p>
            Remover {n === 1 ? 'o' : 'os'} <b className="num">{n}</b> {n === 1 ? 'registro' : 'registros'}? Nada que você editou depois é apagado.
          </p>
          <button className="btn-sm ghost" type="button" disabled={desfazendo} onClick={() => void ctl.desfazer()}>
            {desfazendo ? 'Desfazendo…' : 'Sim, desfazer'}
          </button>
          <button
            className="btn-sm ghost"
            type="button"
            ref={naoRef}
            disabled={desfazendo}
            onClick={() => { setConf(false); desfazerRef.current?.focus({ preventScroll: true }) }}
          >
            Manter
          </button>
          {ctl.erro && <p className="perr" role="alert">{ctl.erro}</p>}
        </div>
      )}
    </div>
  )
}

export function PropostaIntencao({ ctl }: { ctl: UseIntencao }) {
  if (!ctl.atual) return null
  if (ctl.estado === 'aplicada' || ctl.estado === 'desfazendo') return <Feito ctl={ctl} />
  if (ctl.estado === 'desfeita') {
    const k = ctl.ficaram.length
    return (
      <div className="desfeito" role="status">
        <b>{mensagemDesfeito(k)}</b>
        {k === 0 ? 'Os registros foram removidos.' : 'Os outros registros foram removidos.'}
      </div>
    )
  }
  return <Proposta key={ctl.atual.id} ctl={ctl} />
}

export default PropostaIntencao
