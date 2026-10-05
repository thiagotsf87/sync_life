'use client'

// Fase 2 · Finanças > Recorrentes v5 (T2). Container: dados (useRecorrentesV5, sobre o hook
// v3), estado de UI (filtro, confirmação, painel/sheet, status) e a moldura SubtelaV5.
// Pausar/retomar, editar e excluir (lógico, com Confirma) funcionam no desktop e no mobile.
// A apresentação mora em RecorrentesView (porte 1:1 dos protótipos aprovados).

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { Painel } from '@/components/app-v5/Painel'
import { Confirma } from '@/components/app-v5/Confirma'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { useRecorrentesV5, type FormRec } from '@/hooks/use-recorrentes-v5'
import type { Category } from '@/hooks/use-categories'
import {
  brlInt, dataCurta, diaParaSalvar, lerValor, proxima, usaDiaDoMes, valorParaCampo, type Freq, type RecItem,
} from '@/lib/financas/recorrentes'
import { RecorrentesView, type FiltroRec } from './RecorrentesView'
import './recorrentes-v5.css'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const FREQS: { v: Freq; r: string }[] = [
  { v: 'weekly', r: 'Semanal' },
  { v: 'biweekly', r: 'Quinzenal' },
  { v: 'monthly', r: 'Mensal' },
  { v: 'quarterly', r: 'Trimestral' },
  { v: 'annual', r: 'Anual' },
]

const SUGESTOES = [
  'O que vence esta semana?',
  'Qual assinatura eu poderia cortar?',
  'Quanto as recorrentes pesam no ano?',
]

interface PainelEstado {
  aberto: boolean
  /** null = nova recorrente */
  id: string | null
  pre: Partial<FormRec> | null
  /** muda a cada abertura: reinicia o formulário */
  chave: number
}

const FECHADO: PainelEstado = { aberto: false, id: null, pre: null, chave: 0 }

// ─── formulário do painel (desktop) e do sheet (mobile) ─────────────────────
interface FormularioProps {
  inicial: FormRec
  edicao: boolean
  hoje: string
  categorias: Category[]
  onEnviar: (f: FormRec) => Promise<string | null>
}

function Formulario({ inicial, edicao, hoje, categorias, onEnviar }: FormularioProps) {
  const [f, setF] = useState<FormRec>(inicial)
  const [erro, setErro] = useState('')
  const set = <K extends keyof FormRec>(k: K, v: FormRec[K]) => setF(x => ({ ...x, [k]: v }))
  const usaDia = usaDiaDoMes(f.freq)
  const opcoes = categorias.filter(c => c.type === f.tipo)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (!f.nome.trim()) { setErro('Faltou o nome.'); return }
    if (!lerValor(f.valor)) { setErro('Faltou o valor.'); return }
    if (usaDia && diaParaSalvar(f.freq, f.dia) === null) { setErro('O dia do mês vai de 1 a 31.'); return }
    const inicio = f.inicio || hoje
    if (f.fim && f.fim <= inicio) { setErro('O fim precisa ser depois do início.'); return }
    const msg = await onEnviar({ ...f, nome: f.nome.trim(), inicio, dia: usaDia ? f.dia : null })
    setErro(msg ?? '')
  }

  return (
    <form id="rec-form" className="rec-form" autoComplete="off" noValidate onSubmit={enviar}>
      <div className="f">
        <span className="eyebrow">Tipo</span>
        <div className="tipo" role="group" aria-label="Tipo">
          <button className={f.tipo === 'expense' ? 'chip on' : 'chip'} type="button" aria-pressed={f.tipo === 'expense'}
            onClick={() => setF(x => ({ ...x, tipo: 'expense', categoria: '' }))}>Saída</button>
          <button className={f.tipo === 'income' ? 'chip on' : 'chip'} type="button" aria-pressed={f.tipo === 'income'}
            onClick={() => setF(x => ({ ...x, tipo: 'income', categoria: '' }))}>Entrada</button>
        </div>
      </div>
      <div className="f">
        <label className="eyebrow" htmlFor="rec-nome">Nome</label>
        <input className="ck-note" id="rec-nome" name="nome" type="text" placeholder="Ex.: Aluguel, Salário, Streaming" required
          value={f.nome} onChange={e => set('nome', e.target.value)} />
      </div>
      <div className="f2">
        <div className="f">
          <label className="eyebrow" htmlFor="rec-valor">Valor</label>
          <input className="ck-note num" id="rec-valor" name="valor" type="text" inputMode="decimal" placeholder="0,00" required
            value={f.valor} onChange={e => set('valor', e.target.value)} />
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="rec-freq">Frequência</label>
          <div className="sel">
            <select id="rec-freq" name="freq" value={f.freq} onChange={e => set('freq', e.target.value as Freq)}>
              {FREQS.map(x => <option key={x.v} value={x.v}>{x.r}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="f2">
        {usaDia && (
          <div className="f">
            <label className="eyebrow" htmlFor="rec-dia">Dia do mês</label>
            <input className="ck-note num" id="rec-dia" name="dia" type="number" min={1} max={31} inputMode="numeric"
              value={f.dia ?? ''} onChange={e => set('dia', e.target.value ? Number(e.target.value) : null)} />
          </div>
        )}
        <div className="f">
          <label className="eyebrow" htmlFor="rec-inicio">Início</label>
          <input className="ck-note num" id="rec-inicio" name="inicio" type="date" value={f.inicio} onChange={e => set('inicio', e.target.value)} />
        </div>
      </div>
      <div className="f2">
        <div className="f">
          <label className="eyebrow" htmlFor="rec-fim">Fim (opcional)</label>
          <input className="ck-note num" id="rec-fim" name="fim" type="date" value={f.fim} onChange={e => set('fim', e.target.value)} />
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="rec-cat">Categoria</label>
          <div className="sel">
            <select id="rec-cat" name="cat" value={f.categoria} onChange={e => set('categoria', e.target.value)}>
              <option value="">Sem categoria</option>
              {opcoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="f">
        <label className="eyebrow" htmlFor="rec-obs">Observações</label>
        <textarea className="ck-note" id="rec-obs" name="obs" rows={3} placeholder="Opcional" value={f.nota} onChange={e => set('nota', e.target.value)} />
      </div>
      {f.freq === 'annual' && <p className="aviso">Anual: o mês vem da data de início.</p>}
      {edicao && <p className="aviso">Mudanças valem para os próximos lançamentos. Os já registrados ficam como estão.</p>}
      <p className="erro-f" role="alert">{erro}</p>
    </form>
  )
}

// ─── tela ────────────────────────────────────────────────────────────────────
export function RecorrentesV5() {
  const d = useRecorrentesV5()
  const mob = useMobV5()
  const nomeRef = useRef<HTMLInputElement>(null)

  const [filtro, setFiltro] = useState<FiltroRec>('todas')
  const [confirmaId, setConfirmaId] = useState<string | null>(null)
  const [destaqueId, setDestaqueId] = useState<string | null>(null)
  const [status, setStatus] = useState<{ texto: string; erro: boolean }>({ texto: '', erro: false })
  const [painel, setPainel] = useState<PainelEstado>(FECHADO)
  const [confirmaPainel, setConfirmaPainel] = useState(false)

  // a mensagem de status some sozinha; o destaque da linha é só um piscar
  useEffect(() => {
    if (!status.texto) return
    const t = window.setTimeout(() => setStatus({ texto: '', erro: false }), 3200)
    return () => window.clearTimeout(t)
  }, [status])
  useEffect(() => {
    if (!destaqueId) return
    const t = window.setTimeout(() => setDestaqueId(null), 1800)
    return () => window.clearTimeout(t)
  }, [destaqueId])

  const porId = useMemo(() => new Map(d.itens.map(i => [i.id, i])), [d.itens])
  const item: RecItem | undefined = painel.id ? porId.get(painel.id) : undefined

  const avisar = (texto: string, erro = false) => setStatus({ texto, erro })

  const abrirNovo = useCallback((pre: Partial<FormRec> | null = null) => {
    setConfirmaPainel(false)
    setPainel(p => ({ aberto: true, id: null, pre, chave: p.chave + 1 }))
  }, [])
  const abrirEdicao = useCallback((id: string) => {
    setConfirmaId(null)
    setConfirmaPainel(false)
    setPainel(p => ({ aberto: true, id, pre: null, chave: p.chave + 1 }))
  }, [])
  const fechar = useCallback(() => {
    setPainel(p => ({ ...p, aberto: false }))
    setConfirmaPainel(false)
  }, [])

  const pausar = async (id: string) => {
    const it = porId.get(id)
    if (!it) return
    const r = await d.pausar(id)
    if (!r.ok) { avisar(r.erro, true); return }
    setDestaqueId(id)
    if (it.pausada) {
      const px = proxima({ ...it, pausada: false }, d.hoje)
      avisar(`${it.nome} retomada.${px ? ` Próximo lançamento em ${dataCurta(px, d.hoje)}.` : ''}`)
    } else avisar(`${it.nome} pausada. Não gera lançamentos até você retomar.`)
  }

  const excluir = async (id: string) => {
    const it = porId.get(id)
    setConfirmaId(null)
    const r = await d.excluir(id)
    if (!r.ok) { avisar(r.erro, true); return }
    avisar(`${it?.nome ?? 'Recorrente'} excluída. Os lançamentos já registrados ficam.`)
  }

  const registrar = () => {
    if (d.limitado) { avisar('Limite do plano FREE: pause ou exclua uma recorrente para registrar outra.', true); return }
    if (mob) { abrirNovo(); return }
    nomeRef.current?.focus({ preventScroll: true })
    nomeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const enviarPainel = async (f: FormRec): Promise<string | null> => {
    const id = painel.id
    const r = id ? await d.salvar(id, f) : await d.criar(f)
    if (!r.ok) return r.erro
    fechar()
    if (id) setDestaqueId(id)
    avisar(id ? 'Salvo.' : 'Registrado.')
    return null
  }

  const criarRapido = async (f: FormRec) => d.criar(f)

  const inicial: FormRec = useMemo(() => {
    const base: FormRec = {
      tipo: 'expense', nome: '', valor: '', freq: 'monthly', dia: null, inicio: d.hoje, fim: '', categoria: '', nota: '',
    }
    if (item) {
      return {
        tipo: item.tipo === 'income' ? 'income' : 'expense',
        nome: item.nome,
        valor: valorParaCampo(item.valor),
        freq: item.freq,
        dia: item.dia,
        inicio: item.inicio,
        fim: item.fim ?? '',
        categoria: d.categoriaDe[item.id] ?? '',
        nota: item.nota ?? '',
      }
    }
    return { ...base, ...(painel.pre ?? {}) }
    // o formulário é reiniciado pela `chave`; os dados da linha só importam ao abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [painel.chave])

  const t = d.totais
  const mesNome = MESES[Number(d.hoje.slice(5, 7)) - 1]
  const saudacao = d.loading || d.itens.length === 0
    ? 'Já li as suas recorrentes. O que você quer saber?'
    : `Já li as suas ${t.ativas} recorrentes ativas: ${brlInt(t.saida)} saem todo mês${t.pct !== null ? `, ${t.pct}% da sua renda` : ''}. O que você quer saber?`

  const rodape = !d.loading && (
    <footer className="colofao">
      <span>
        <b className="num">{t.ativas}</b> {t.ativas === 1 ? 'ativa' : 'ativas'}
        {t.pausadas > 0 && <> · <b className="num">{t.pausadas}</b> {t.pausadas === 1 ? 'pausada' : 'pausadas'}</>}
      </span>
      <div className="r">
        <span suppressHydrationWarning>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>
      </div>
    </footer>
  )

  const painelUi = (
    <Painel
      open={painel.aberto}
      onClose={fechar}
      eyebrow="01 · Recorrente"
      titulo={painel.id ? 'Editar recorrente' : 'Nova recorrente'}
      idTitulo="rec-painel-titulo"
      rodape={
        <>
          {confirmaPainel && item && (
            <Confirma
              rotuloSim="Excluir"
              onSim={() => { setConfirmaPainel(false); fechar(); void excluir(item.id) }}
              onNao={() => setConfirmaPainel(false)}
            >
              Excluir <b>{item.nome}</b>? Os lançamentos já registrados ficam; os próximos deixam de ser gerados.
            </Confirma>
          )}
          <div className="acts">
            <span className="esq">
              {item && <button className="btn-sm ghost perigo" type="button" onClick={() => setConfirmaPainel(true)}>Excluir</button>}
              {item && (
                <button className="btn-sm ghost" type="button" onClick={() => { fechar(); void pausar(item.id) }}>
                  {item.pausada ? 'Retomar' : 'Pausar'}
                </button>
              )}
            </span>
            <button className="btn-sm roxo" type="submit" form="rec-form">{painel.id ? 'Salvar' : 'Registrar'}</button>
          </div>
        </>
      }
    >
      <Formulario
        key={painel.chave}
        inicial={inicial}
        edicao={!!painel.id}
        hoje={d.hoje}
        categorias={d.categorias}
        onEnviar={enviarPainel}
      />
    </Painel>
  )

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="recorrentes"
      voltarHref="/financas"
      voltarRotulo={`Finanças · ${mesNome}`}
      tituloCurto="Recorrentes"
      classe="recorrentes"
      coach={{ leitura: 'suas recorrentes', saudacao, sugestoes: SUGESTOES }}
      onRegistrar={registrar}
      chaveReveal={`${d.loading}:${d.itens.length > 0}`}
      rodape={rodape}
      extra={painelUi}
    >
      {({ abrirCoach }) => (
        <RecorrentesView
          mob={mob}
          hoje={d.hoje}
          carregando={d.loading}
          erro={d.erro}
          d={d}
          filtro={filtro}
          onFiltro={setFiltro}
          limitado={d.limitado}
          confirmaId={confirmaId}
          destaqueId={destaqueId}
          status={status}
          onEditar={abrirEdicao}
          onPausar={id => void pausar(id)}
          onPedirExcluir={setConfirmaId}
          onExcluir={id => void excluir(id)}
          onCancelarExclusao={() => setConfirmaId(null)}
          onCriar={criarRapido}
          onMaisCampos={abrirNovo}
          onTentar={d.recarregar}
          onPerguntar={() => abrirCoach('Sobre as recorrentes: ')}
          nomeRef={nomeRef}
        />
      )}
    </SubtelaV5>
  )
}

export default RecorrentesV5
