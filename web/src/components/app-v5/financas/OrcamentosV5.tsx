'use client'

// Fase 2 · Orçamentos v5 (T2 com barras + laboratório do teto). Container: dados reais do
// useOrcamentosV5, estado de UI (filtro, painel, prévia do laboratório, cópia do mês anterior)
// e a moldura SubtelaV5. A apresentação é do OrcamentosView; o cálculo, de lib/financas/orcamentos.
// Registrar (bar e bottom bar) abre a captura de novo envelope: foco no campo (desktop) ou sheet (mobile).

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { useOrcamentosV5, type EnvelopeV5, type FormEnvelope } from '@/hooks/use-orcamentos-v5'
import { brlInt, type ParteFala } from '@/lib/financas/hub'
import {
  efeitosTeto, estadoEnvelope, falaOrcamentos, fontesOrcamentos, opcoesTeto, ordenarEnvelopes, parseValor,
  pctEnvelope, restoEnvelope, totaisOrcamento, type EntradaLab, type FiltroEnvelope,
} from '@/lib/financas/orcamentos'
import {
  OrcamentosView, PainelEnvelope, type CapturaInline, type LabVista,
} from './OrcamentosView'
import './orcamentos-v5.css'

const CHAVE_REGRA = 'orcamentos_50_30_20_dismissed'

interface PainelEstado {
  aberto: boolean
  abertura: number
  modo: 'novo' | 'editar'
  env: EnvelopeV5 | null
  catId: string
}

export function OrcamentosV5() {
  const d = useOrcamentosV5()
  const mob = useMobV5()

  const [filtro, setFiltro] = useState<FiltroEnvelope>('todos')
  const [aviso, setAviso] = useState('')
  const [destaqueId, setDestaqueId] = useState<string | null>(null)
  const [regraDispensada, setRegraDispensada] = useState(true) // escondida até ler o localStorage
  const [desmarcados, setDesmarcados] = useState<Set<string>>(new Set())
  const [copiando, setCopiando] = useState(false)
  const [captura, setCaptura] = useState<CapturaInline>({ catId: '', limite: '', alerta: '80' })
  const [painel, setPainel] = useState<PainelEstado>({ aberto: false, abertura: 0, modo: 'novo', env: null, catId: '' })
  const [labSel, setLabSel] = useState<number | null>(null)
  const [previa, setPrevia] = useState<number | null>(null)
  const campoLimite = useRef<HTMLInputElement | null>(null)
  const aoMontarLimite = useCallback((el: HTMLInputElement | null) => { campoLimite.current = el }, [])
  const avisoTimer = useRef<number | undefined>(undefined)

  // a referência 50-30-20 é dispensável (localStorage, como no v3); sem acesso, fica visível
  useEffect(() => {
    let dispensada = false
    try { dispensada = localStorage.getItem(CHAVE_REGRA) === '1' } catch { /* sem storage */ }
    setRegraDispensada(dispensada)
  }, [])

  const dispensarRegra = useCallback(() => {
    setRegraDispensada(true)
    try { localStorage.setItem(CHAVE_REGRA, '1') } catch { /* sem storage */ }
  }, [])

  const avisar = useCallback((texto: string) => {
    setAviso(texto)
    window.clearTimeout(avisoTimer.current)
    avisoTimer.current = window.setTimeout(() => setAviso(''), 2600)
  }, [])
  useEffect(() => () => window.clearTimeout(avisoTimer.current), [])

  // a categoria padrão da captura é a primeira livre; muda de mês, zera filtro, prévia e cópia
  const catPadrao = d.categoriasLivres[0]?.id ?? ''
  const catValida = d.categoriasLivres.some(c => c.id === captura.catId)
  const catAtual = catValida ? captura.catId : catPadrao

  const chaveMes = `${d.ano}-${d.mes}`
  const [mesVisto, setMesVisto] = useState(chaveMes)
  if (mesVisto !== chaveMes) {
    setMesVisto(chaveMes)
    setFiltro('todos')
    setPrevia(null)
    setLabSel(null)
    setDesmarcados(new Set())
  }

  // destaque da linha criada/editada: aplica a classe e solta logo depois (a transição faz o fade)
  const idsVisiveis = d.envelopes.map(e => e.id).join(',')
  useEffect(() => {
    if (!destaqueId || !idsVisiveis.split(',').includes(destaqueId)) return
    const t = window.setTimeout(() => setDestaqueId(null), 80)
    return () => window.clearTimeout(t)
  }, [destaqueId, idsVisiveis])

  // ── laboratório ──────────────────────────────────────────────────────────
  const labEnv = d.labEnvelopeId ? d.envelopes.find(e => e.id === d.labEnvelopeId) ?? null : null
  const labAtivo = d.mesCorrente && labEnv !== null
  const tetoAtual = labEnv?.limiteBase ?? 0
  const sel = labSel ?? tetoAtual

  const entradaLab = useCallback((teto: number): EntradaLab | null => {
    if (!labEnv) return null
    return {
      tetoAtual: labEnv.limiteBase, teto, sobra: labEnv.sobra, gasto: labEnv.gasto, alerta: labEnv.alerta,
      dias: d.dias, receitas: d.receitas, saldoMes: d.saldoMes, fechamentoBase: d.fechamentoBase, meta: d.meta,
    }
  }, [labEnv, d.dias, d.receitas, d.saldoMes, d.fechamentoBase, d.meta])

  const lab: LabVista | null = useMemo(() => {
    if (!labAtivo || !labEnv) return null
    const entrada = entradaLab(sel)
    if (!entrada) return null
    const efeitos = efeitosTeto(entrada)
    // sem nenhum efeito calculável (sem projeção, sem receitas e sem meta) não há o que comparar
    if (efeitos.fechamento === null && efeitos.poupancaPct === null && efeitos.aporteExtra === null) return null
    return { envNome: labEnv.categoria, tetoAtual, opcoes: opcoesTeto(tetoAtual), sel, entrada, efeitos, previa }
  }, [labAtivo, labEnv, entradaLab, sel, tetoAtual, previa])

  // envelopes com a prévia aplicada (só na tela; nada é gravado)
  const envs = useMemo(() => {
    if (previa === null || !labEnv) return d.envelopes
    return ordenarEnvelopes(d.envelopes.map(e => (e.id === labEnv.id ? { ...e, limiteBase: previa } : e)))
  }, [d.envelopes, previa, labEnv])

  const previaX = useMemo(() => {
    if (previa === null) return null
    const en = entradaLab(previa)
    return en ? efeitosTeto(en) : null
  }, [previa, entradaLab])

  const falaBase = useMemo(() => falaOrcamentos(envs, d.dias, d.mesNome), [envs, d.dias, d.mesNome])
  const fala: ParteFala[] = useMemo(() => {
    if (previa === null || !labEnv || !previaX || !previaX.delta) return falaBase
    const dias = d.dias > 0 ? ` para ${d.dias} ${d.dias === 1 ? 'dia' : 'dias'}` : ''
    return [
      { t: `Prévia com teto de ${brlInt(previa)}: ${labEnv.categoria} fica com ` },
      { t: brlInt(previaX.resto), b: true, w: previaX.acimaDoAlerta },
      { t: `${dias}${previaX.acimaDoAlerta ? ' e segue acima do alerta.' : ', abaixo do alerta.'}` },
    ]
  }, [falaBase, previa, labEnv, previaX, d.dias])

  const aplicarLab = () => {
    if (!labEnv) return
    setPrevia(sel)
  }
  const desfazerLab = () => {
    setPrevia(null)
    setLabSel(null)
  }

  // ── captura e painel ─────────────────────────────────────────────────────
  const abrirNovo = useCallback((catId?: string) => {
    setPainel(p => ({
      aberto: true, abertura: p.abertura + 1, modo: 'novo', env: null,
      catId: catId && d.categoriasLivres.some(c => c.id === catId) ? catId : catPadrao,
    }))
  }, [d.categoriasLivres, catPadrao])

  const abrirEdicao = useCallback((id: string) => {
    const env = d.envelopes.find(e => e.id === id)
    if (!env) return
    setPainel(p => ({ aberto: true, abertura: p.abertura + 1, modo: 'editar', env, catId: env.categoriaId }))
  }, [d.envelopes])

  const fecharPainel = useCallback(() => setPainel(p => ({ ...p, aberto: false })), [])

  // desktop: foca o campo de limite da captura inline; mobile: abre o sheet
  const registrar = () => {
    if (mob) { abrirNovo(); return }
    const el = campoLimite.current
    if (!el) return
    el.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  // criar a partir do fora de envelope: desktop pré-seleciona na captura inline, mobile abre o sheet
  const novoPara = (catId?: string) => {
    if (mob) { abrirNovo(catId); return }
    if (catId) setCaptura(c => ({ ...c, catId }))
    const el = campoLimite.current
    if (el) {
      el.focus({ preventScroll: true })
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }

  const criarInline = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const limite = parseValor(captura.limite)
    if (!catAtual) return
    if (!limite) { campoLimite.current?.focus(); return }
    try {
      const id = await d.criar(catAtual, { limite, alerta: Number(captura.alerta), rollover: false, notas: '' })
      setDestaqueId(id)
      setCaptura({ catId: '', limite: '', alerta: '80' })
      avisar('Envelope criado.')
      campoLimite.current?.focus()
    } catch {
      avisar('Não consegui criar o envelope.')
    }
  }

  const salvarPainel = async (catId: string, f: FormEnvelope) => {
    if (painel.modo === 'editar' && painel.env) {
      await d.salvar(painel.env.id, f)
      if (painel.env.id === labEnv?.id) desfazerLab()
      setDestaqueId(painel.env.id)
      avisar('Salvo.')
    } else {
      const id = await d.criar(catId, f)
      setDestaqueId(id)
      avisar('Envelope criado.')
    }
    fecharPainel()
  }

  const excluirPainel = async () => {
    if (!painel.env) return
    await d.excluir(painel.env.id)
    if (painel.env.id === labEnv?.id) desfazerLab()
    avisar('Envelope excluído.')
    fecharPainel()
  }

  // ── mês vazio: copiar do mês anterior ────────────────────────────────────
  const alternarCopia = (id: string) =>
    setDesmarcados(s => {
      const novo = new Set(s)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })

  const copiar = async () => {
    const ids = d.anteriores.filter(a => !desmarcados.has(a.id)).map(a => a.id)
    if (ids.length === 0) return
    setCopiando(true)
    try {
      await d.copiar(ids)
      avisar(ids.length === 1 ? 'Envelope copiado.' : `${ids.length} envelopes copiados.`)
    } catch {
      avisar('Não consegui copiar os envelopes.')
    } finally {
      setCopiando(false)
    }
  }

  // ── Sy ───────────────────────────────────────────────────────────────────
  const tenso = [...d.envelopes]
    .filter(e => estadoEnvelope(e) !== 'ok')
    .sort((a, b) => pctEnvelope(b) - pctEnvelope(a))[0]
  const folgado = [...d.envelopes].sort((a, b) => restoEnvelope(b) - restoEnvelope(a))[0]
  const sugestoes = [
    tenso ? `Quanto ainda posso gastar em ${tenso.categoria.toLocaleLowerCase('pt-BR')}?` : 'Onde estou gastando mais este mês?',
    folgado ? 'Qual envelope está largo demais?' : 'Como organizo os meus envelopes?',
    labEnv ? `E se eu subir o teto de ${labEnv.categoria.toLocaleLowerCase('pt-BR')} em ${brlInt(50)}?` : 'Quanto devo reservar por mês?',
  ]
  const n = d.envelopes.length
  const fontes = fontesOrcamentos({ envelopes: n, transacoes: d.txCount }, d.mesNome)
  const fechamentoRodape = previaX && previa !== null ? previaX.fechamento : d.fechamentoBase
  const t = totaisOrcamento(envs, d.receitas)

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="orcamentos"
      voltarHref="/financas"
      voltarRotulo={`Finanças · ${d.mesNome}`}
      voltarNumero="01"
      tituloCurto="Orçamentos"
      classe="orcamentos"
      coach={{
        leitura: 'seus orçamentos',
        saudacao: n > 0
          ? `Já li os seus ${n} ${n === 1 ? 'envelope' : 'envelopes'} de ${d.mesNome}. O que você quer saber?`
          : `Ainda não há envelopes em ${d.mesNome}. O que você quer saber?`,
        sugestoes,
      }}
      onRegistrar={registrar}
      chaveReveal={`${d.loading}-${d.erro}-${n}-${mob}`}
      rodape={
        !d.loading && !d.erro && (
          <footer className="colofao">
            <span suppressHydrationWarning>
              {d.mesCorrente && fechamentoRodape !== null
                ? <>Fechamento projetado de {d.mesNome}: <b className="num">{brlInt(fechamentoRodape)}</b></>
                : <>Disponível em {d.mesNome}: <b className="num">{brlInt(t.disponivel)}</b></>}
            </span>
            <div className="r">
              <span><b className="num">{t.qtd}</b> {t.qtd === 1 ? 'envelope' : 'envelopes'} em {d.mesNome}</span>
              <span suppressHydrationWarning>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>
            </div>
          </footer>
        )
      }
      extra={
        <PainelEnvelope
          open={painel.aberto}
          abertura={painel.abertura}
          modo={painel.modo}
          env={painel.env}
          catInicial={painel.catId}
          categoriasLivres={d.categoriasLivres}
          mesNome={d.mesNome}
          mesAntNome={d.mesAntNome}
          mesProxNome={d.mesProxNome}
          mob={mob}
          onClose={fecharPainel}
          onSalvar={salvarPainel}
          onExcluir={excluirPainel}
        />
      }
    >
      {({ abrirCoach, mob: mobTela }) => (
        <OrcamentosView
          d={d}
          envs={envs}
          mob={mobTela}
          filtro={filtro}
          onFiltro={setFiltro}
          previaId={previa !== null && labEnv ? labEnv.id : null}
          fala={fala}
          fontes={fontes}
          aviso={aviso}
          destaqueId={destaqueId}
          aoMontarLimite={aoMontarLimite}
          captura={{ ...captura, catId: catAtual }}
          onCaptura={p => setCaptura(c => ({ ...c, ...p }))}
          onCriarInline={criarInline}
          onAbrir={abrirEdicao}
          onNovo={novoPara}
          onFalar={abrirCoach}
          regraVisivel={!regraDispensada}
          onDispensarRegra={dispensarRegra}
          desmarcados={desmarcados}
          onToggleCopia={alternarCopia}
          onCopiar={copiar}
          copiando={copiando}
          lab={lab}
          onTeto={setLabSel}
          onAplicar={aplicarLab}
          onDesfazer={desfazerLab}
        />
      )}
    </SubtelaV5>
  )
}

export default OrcamentosV5
