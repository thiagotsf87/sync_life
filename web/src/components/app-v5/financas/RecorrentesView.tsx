'use client'

// Fase 2 · Recorrentes v5: apresentação por props (sem hook de dados), porte 1:1 de
// prototypes/v5/app/financas-recorrentes.html (desktop) e financas-recorrentes.mobile.html
// (mobile, markup próprio: linha-botão que abre o sheet, sem captura inline nem ações na linha).
// O container (RecorrentesV5) cuida de dados, painel e estado; aqui só marcação, classes
// e a captura inline do desktop, para o teste de render com dados fixos.

import { useState, type CSSProperties, type FormEvent, type Ref } from 'react'
import Link from 'next/link'
import { Confirma } from '@/components/app-v5/Confirma'
import type { Category } from '@/hooks/use-categories'
import type { FormRec, ResultadoAcao } from '@/hooks/use-recorrentes-v5'
import {
  brl, brlInt, dataCurta, diaParaSalvar, diaSemana, emQuanto, lerValor, normalizarMensal, plural,
  proxima, quando, sinal, usaDiaDoMes,
  type Freq, type Grupo, type Ocorrencia, type Proximos, type RecItem, type Totais,
} from '@/lib/financas/recorrentes'

const NBSP = ' '

export type FiltroRec = 'todas' | 'out' | 'in' | 'pausadas'

const FILTROS: { id: FiltroRec; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'out', rotulo: 'Saídas' },
  { id: 'in', rotulo: 'Entradas' },
  { id: 'pausadas', rotulo: 'Pausadas' },
]

const FREQS: { v: Freq; r: string }[] = [
  { v: 'weekly', r: 'Semanal' },
  { v: 'biweekly', r: 'Quinzenal' },
  { v: 'monthly', r: 'Mensal' },
  { v: 'quarterly', r: 'Trimestral' },
  { v: 'annual', r: 'Anual' },
]

export interface RecorrentesDadosView {
  itens: RecItem[]
  totais: Totais
  grupos: Grupo[]
  encerradas: RecItem[]
  proximos: Proximos
  proxima: { nome: string; dias: number } | null
  renda: number | null
  categorias: Category[]
}

export interface RecorrentesViewProps {
  mob: boolean
  hoje: string
  carregando: boolean
  erro: string | null
  d: RecorrentesDadosView
  filtro: FiltroRec
  onFiltro: (f: FiltroRec) => void
  limitado: boolean
  confirmaId: string | null
  destaqueId: string | null
  status: { texto: string; erro: boolean }
  onEditar: (id: string) => void
  onPausar: (id: string) => void
  onPedirExcluir: (id: string) => void
  onExcluir: (id: string) => void
  onCancelarExclusao: () => void
  onCriar: (f: FormRec) => Promise<ResultadoAcao>
  onMaisCampos: (pre: Partial<FormRec>) => void
  onTentar: () => void
  onPerguntar: () => void
  nomeRef?: Ref<HTMLInputElement>
}

// ─── captura inline (desktop) ────────────────────────────────────────────────
function Captura({
  hoje, categorias, onCriar, onMaisCampos, nomeRef,
}: Pick<RecorrentesViewProps, 'hoje' | 'onCriar' | 'onMaisCampos' | 'nomeRef'> & { categorias: Category[] }) {
  const [tipo, setTipo] = useState<'income' | 'expense'>('expense')
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [freq, setFreq] = useState<Freq>('monthly')
  const [dia, setDia] = useState('')
  const [inicio, setInicio] = useState(hoje)
  const [categoria, setCategoria] = useState('')
  const [saida, setSaida] = useState<{ t: string; erro: boolean }>({ t: '', erro: false })
  const [salvando, setSalvando] = useState(false)

  const usaDia = usaDiaDoMes(freq)
  const opcoes = categorias.filter(c => c.type === tipo)

  const ler = (): FormRec => ({
    tipo, nome: nome.trim(), valor, freq,
    dia: usaDia ? (dia ? Number(dia) : null) : null,
    inicio: usaDia ? hoje : (inicio || hoje), fim: '', categoria, nota: '',
  })

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (salvando) return
    const f = ler()
    if (!f.nome) { setSaida({ t: 'Faltou o nome.', erro: true }); return }
    if (!lerValor(f.valor)) { setSaida({ t: 'Faltou o valor.', erro: true }); return }
    if (usaDia && diaParaSalvar(freq, f.dia) === null) { setSaida({ t: 'Faltou o dia do mês.', erro: true }); return }
    setSalvando(true)
    const r = await onCriar(f)
    setSalvando(false)
    if (r.ok) {
      setNome(''); setValor(''); setDia('')
      setSaida({ t: 'Registrado.', erro: false })
    } else setSaida({ t: r.erro, erro: true })
  }

  return (
    <form className="captura boot b3" aria-label="Registrar recorrente" autoComplete="off" noValidate onSubmit={enviar}>
      <div className="sel">
        <select name="tipo" aria-label="Tipo" value={tipo} onChange={e => { setTipo(e.target.value as 'income' | 'expense'); setCategoria('') }}>
          <option value="expense">Saída</option>
          <option value="income">Entrada</option>
        </select>
      </div>
      <input ref={nomeRef} className="ck-note" name="nome" type="text" placeholder="Nome, ex.: Aluguel" aria-label="Nome" required
        value={nome} onChange={e => setNome(e.target.value)} />
      <input className="ck-note num" name="valor" type="text" inputMode="decimal" placeholder="0,00" aria-label="Valor em reais" required
        value={valor} onChange={e => setValor(e.target.value)} />
      <div className="sel">
        <select name="freq" aria-label="Frequência" value={freq} onChange={e => setFreq(e.target.value as Freq)}>
          {FREQS.map(f => <option key={f.v} value={f.v}>{f.r}</option>)}
        </select>
      </div>
      {usaDia ? (
        <input className="ck-note num" name="dia" type="number" min={1} max={31} placeholder="Dia do mês" aria-label="Dia do mês"
          value={dia} onChange={e => setDia(e.target.value)} />
      ) : (
        <input className="ck-note num" name="inicio" type="date" aria-label="Início" value={inicio} onChange={e => setInicio(e.target.value)} />
      )}
      <div className="sel">
        <select name="cat" aria-label="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="">Sem categoria</option>
          {opcoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <button className="btn-sm roxo" type="submit" disabled={salvando}>Registrar</button>
      <div className="cap-foot">
        <span>
          Enter registra · começa hoje ·{' '}
          <button className="mais" type="button" onClick={() => onMaisCampos(ler())}>Mais campos: início, fim, observações →</button>
        </span>
        <output className={saida.erro ? 'erro-c' : undefined} aria-live="polite">{saida.t}</output>
      </div>
    </form>
  )
}

// ─── blocos ──────────────────────────────────────────────────────────────────
function Nums({ t, carregando }: { t: Totais; carregando: boolean }) {
  const vazio = `R$${NBSP}–`
  const liq = `${t.liquido >= 0 ? '+ ' : '– '}${brlInt(t.liquido)}`
  return (
    <section className="nums quieto boot b2" aria-label="Recorrentes por mês">
      <div>
        <p className="eyebrow">Saída mensal</p>
        <div className={carregando ? 'v num vazio-n' : 'v num'}>{carregando ? vazio : brlInt(t.saida)}</div>
        <div className="d num">{carregando ? '' : plural(t.nSaidas, 'saída ativa', 'saídas ativas')}</div>
      </div>
      <div>
        <p className="eyebrow">Entrada mensal</p>
        <div className={carregando ? 'v num vazio-n' : 'v num'}>{carregando ? vazio : brlInt(t.entrada)}</div>
        <div className="d num">{carregando ? '' : plural(t.nEntradas, 'entrada ativa', 'entradas ativas')}</div>
      </div>
      <div>
        <p className="eyebrow">Impacto líquido</p>
        <div className={carregando ? 'v num vazio-n' : t.liquido >= 0 ? 'v num ele' : 'v num'}>{carregando ? vazio : liq}</div>
        <div className="d num">{carregando ? '' : t.liquido >= 0 ? 'sobra por mês' : 'falta por mês'}</div>
      </div>
      <div>
        <p className="eyebrow">Custo anual</p>
        <div className={carregando ? 'v num vazio-n' : 'v num'}>{carregando ? vazio : brlInt(t.anual)}</div>
        <div className="d num">{carregando ? '' : 'saídas × 12 meses'}</div>
      </div>
    </section>
  )
}

function Comprometido({ pct, renda }: { pct: number | null; renda: number | null }) {
  if (pct === null || renda === null) {
    return (
      <div className="compr sem-renda boot b2">
        <p>
          <b className="num">–</b> da sua renda comprometida · <Link href="/configuracoes">informe a sua renda mensal no perfil</Link> para ver este número.
        </p>
      </div>
    )
  }
  return (
    <div className="compr boot b2">
      <p>
        <b className="num">{pct}%</b> da sua renda comprometida · sobre <span className="num">{brlInt(renda)}</span>, a renda do seu perfil
      </p>
      <div className="track" style={{ '--w': `${Math.min(100, pct)}%` } as CSSProperties}><i /></div>
    </div>
  )
}

function Cabecalho({ t, prox, carregando }: { t: Totais; prox: RecorrentesDadosView['proxima']; carregando: boolean }) {
  return (
    <header className="titulo boot b1">
      <p className="eyebrow"><Link href="/financas"><b>01</b>{NBSP}· Finanças</Link></p>
      <h1>Recorrentes</h1>
      {!carregando && (
      <p className="sub">
        <span className="num">{t.ativas}</span> {t.ativas === 1 ? 'ativa' : 'ativas'}
        {t.pausadas > 0 && <> · <span className="num">{t.pausadas}</span> {t.pausadas === 1 ? 'pausada' : 'pausadas'}</>}
        {prox && (
          <> · a próxima sai {prox.dias === 0 ? 'hoje' : prox.dias === 1 ? 'amanhã' : <>em <span className="num">{prox.dias}</span> dias</>}: <b>{prox.nome}</b></>
        )}
      </p>
      )}
    </header>
  )
}

function resumoGrupo(g: Grupo, mob: boolean) {
  if (g.tudoPausado) return 'tudo pausado'
  const aprox = g.freq === 'monthly' ? '' : '≈ '
  const fim = mob ? '/mês' : ' por mês'
  return (
    <>
      {aprox}
      {g.saida > 0 && `– ${brl(g.saida)}`}
      {g.saida > 0 && g.entrada > 0 && ' · '}
      {g.entrada > 0 && <span className="in">+ {brl(g.entrada)}</span>}
      {fim}
    </>
  )
}

function passa(it: RecItem, f: FiltroRec): boolean {
  if (f === 'todas') return true
  if (f === 'pausadas') return it.pausada
  return f === 'in' ? it.tipo === 'income' : it.tipo !== 'income'
}

interface LinhaProps {
  it: RecItem
  hoje: string
  mob: boolean
  encerrada?: boolean
  destaque: boolean
  confirmando: boolean
  onEditar: (id: string) => void
  onPausar: (id: string) => void
  onPedirExcluir: (id: string) => void
  onExcluir: (id: string) => void
  onCancelarExclusao: () => void
}

function Linha({ it, hoje, mob, encerrada, destaque, confirmando, onEditar, onPausar, onPedirExcluir, onExcluir, onCancelarExclusao }: LinhaProps) {
  const px = proxima(it, hoje)
  const eq = it.freq !== 'monthly' ? <small>≈ {brl(normalizarMensal(it.valor, it.freq))}/mês</small> : null
  const classe = ['rr', it.tipo === 'income' ? 'in' : '', it.pausada ? 'pausada' : '', encerrada ? 'encerrada' : '', destaque ? 'nova' : '']
    .filter(Boolean).join(' ')
  const cat = it.categoria ?? 'Sem categoria'
  const valor = <>{sinal(it.tipo)}{brl(it.valor)}</>

  if (mob) {
    const meio = encerrada
      ? `encerrada em ${dataCurta(it.fim ?? hoje, hoje)}`
      : it.pausada ? 'pausada, não gera lançamentos' : px ? `próx. ${dataCurta(px, hoje)}` : 'sem próximas'
    return (
      <div className={classe} data-id={it.id}>
        <button className="rb" type="button" aria-label={`Editar ${it.nome}${it.pausada ? ', pausada' : ''}`} onClick={() => onEditar(it.id)}>
          <span className="nm">
            <span className="n1">{it.nome}</span>
            <small>{cat} · {encerrada ? meio : `${quando(it)} · ${meio}`}</small>
          </span>
          <span className="v num">{valor}{eq}</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={classe} data-id={it.id} onClick={e => { if (!(e.target as HTMLElement).closest('button')) onEditar(it.id) }}>
        <div className="nm">
          <span className="n1">{it.nome}</span>
          <small>{cat}{it.pausada ? ' · pausada, não gera lançamentos' : it.nota ? ` · ${it.nota}` : ''}</small>
        </div>
        <span className="qd">
          {quando(it)}
          <small>{encerrada ? `encerrada em ${dataCurta(it.fim ?? hoje, hoje)}` : it.pausada ? 'pausada' : px ? `próx. ${dataCurta(px, hoje)}` : 'sem próximas'}</small>
        </span>
        <span className="v num">{valor}{eq}</span>
        <span className="ac">
          <button type="button" aria-label={`Editar ${it.nome}`} onClick={() => onEditar(it.id)}>Editar</button>
          {!encerrada && (
            <button type="button" aria-label={`${it.pausada ? 'Retomar' : 'Pausar'} ${it.nome}`} onClick={() => onPausar(it.id)}>
              {it.pausada ? 'Retomar' : 'Pausar'}
            </button>
          )}
          <button className="perigo" type="button" aria-label={`Excluir ${it.nome}`} onClick={() => onPedirExcluir(it.id)}>Excluir</button>
        </span>
      </div>
      {confirmando && (
        <Confirma rotuloSim="Excluir" onSim={() => onExcluir(it.id)} onNao={onCancelarExclusao}>
          Excluir <b>{it.nome}</b>? Os lançamentos já registrados ficam; os próximos deixam de ser gerados.
        </Confirma>
      )}
    </>
  )
}

function Proxima({ o, hoje }: { o: Ocorrencia; hoje: string }) {
  return (
    <div className={o.tipo === 'income' ? 'pr in' : 'pr'}>
      <span className="d num">{dataCurta(o.data, hoje)}<small>{diaSemana(o.data)}</small></span>
      <span className="nm">{o.nome}{o.aviso && <span className="tag">{emQuanto(o.dias)}</span>}</span>
      <span className="v num">{sinal(o.tipo)}{brl(o.valor)}</span>
    </div>
  )
}

function Proximos30({ p, hoje, mob }: { p: Proximos; hoje: string; mob: boolean }) {
  const cab = (
    <>
      <p className="eyebrow">Próximos 30 dias</p>
      <small>até {dataCurta(p.ate, hoje)}</small>
    </>
  )
  const corpo = p.itens.length === 0
    ? <p className="vazio-p">Nada nos próximos 30 dias.</p>
    : (
      <>
        {p.itens.map((o, i) => <Proxima key={`${o.id}-${o.data}-${i}`} o={o} hoje={hoje} />)}
        <p className="prox-foot">
          Saem <b className="num">{brl(p.saem)}</b> e entram <b className="num ele">{brl(p.entram)}</b> até {dataCurta(p.ate, hoje)}.{' '}
          {mob ? 'Coral: faltam 7 dias ou menos.' : 'Aviso em coral quando faltam 7 dias ou menos.'}
        </p>
      </>
    )
  return mob ? (
    <section className="rv" aria-label="Próximos 30 dias">
      <div className="p30-h">{cab}</div>
      <div>{corpo}</div>
    </section>
  ) : (
    <aside className="p30 rv" aria-label="Próximos 30 dias">
      <div className="prox-h">{cab}</div>
      <div>{corpo}</div>
    </aside>
  )
}

function Esqueleto() {
  return (
    <div className="sk-rows" aria-hidden="true">
      <div className="sk-row" /><div className="sk-row" /><div className="sk-row" /><div className="sk-row" />
    </div>
  )
}

function Limite() {
  return (
    <div className="lim" role="status">
      Você tem <b className="num">5</b> recorrentes ativas, o limite do plano FREE. Pause uma para registrar outra, ou <Link href="/configuracoes">conheça o PRO</Link>.
    </div>
  )
}

// ─── tela ────────────────────────────────────────────────────────────────────
export function RecorrentesView(p: RecorrentesViewProps) {
  const { mob, hoje, carregando, erro, d, filtro, limitado, confirmaId, destaqueId, status } = p
  const vazio = !carregando && !erro && d.itens.length === 0
  const cheio = !carregando && !erro && d.itens.length > 0

  const linhaProps = (it: RecItem) => ({
    it, hoje, mob, destaque: destaqueId === it.id, confirmando: confirmaId === it.id,
    onEditar: p.onEditar, onPausar: p.onPausar, onPedirExcluir: p.onPedirExcluir, onExcluir: p.onExcluir, onCancelarExclusao: p.onCancelarExclusao,
  })

  const grupos = d.grupos
    .map(g => ({ g, itens: g.itens.filter(it => passa(it, filtro)) }))
    .filter(x => x.itens.length > 0)
  const encerradas = d.encerradas.filter(it => passa(it, filtro))
  const visiveis = grupos.reduce((n, x) => n + x.itens.length, 0) + encerradas.length

  const lista = (
    <section className="lista rv" aria-label="Todas as recorrentes">
      <div>
        {grupos.map(({ g, itens }) => (
          <div key={g.freq} className="grp" data-freq={g.freq}>
            <div className="grp-h">
              <p className="eyebrow">{g.rotulo} · <span className="num">{g.itens.length}</span></p>
              <span className="st num">{resumoGrupo(g, mob)}</span>
            </div>
            {itens.map(it => <Linha key={it.id} {...linhaProps(it)} />)}
          </div>
        ))}
        {encerradas.length > 0 && (
          <div className="grp" data-freq="encerradas">
            <div className="grp-h">
              <p className="eyebrow">Encerradas · <span className="num">{encerradas.length}</span></p>
              <span className="st num">fora dos números</span>
            </div>
            {encerradas.map(it => <Linha key={it.id} {...linhaProps(it)} encerrada />)}
          </div>
        )}
      </div>
      {visiveis === 0 && <p className="sem-resultado">Nada com esse filtro.</p>}
      <p className={status.erro ? 'status erro-s' : 'status'} role="status" aria-live="polite">{status.texto}</p>
    </section>
  )

  const filtros = (
    <div className="filtros boot b3" role="toolbar" aria-label="Filtros">
      {FILTROS.map(f => (
        <button key={f.id} className={filtro === f.id ? 'chip on' : 'chip'} type="button" aria-pressed={filtro === f.id} onClick={() => p.onFiltro(f.id)}>
          {f.rotulo}
        </button>
      ))}
    </div>
  )

  const captura = limitado
    ? <Limite />
    : (
      <Captura hoje={hoje} categorias={d.categorias} onCriar={p.onCriar} onMaisCampos={p.onMaisCampos} nomeRef={p.nomeRef} />
    )

  return (
    <>
      <Cabecalho t={d.totais} prox={d.proxima} carregando={carregando} />
      {!erro && (cheio || carregando) && <Nums t={d.totais} carregando={carregando} />}
      {cheio && <Comprometido pct={d.totais.pct} renda={d.renda} />}

      {carregando && <Esqueleto />}

      {erro && (
        <div className="erro" role="alert">
          <span>{erro}</span>
          <button type="button" onClick={p.onTentar}>Tentar de novo</button>
        </div>
      )}

      {vazio && (
        <>
          <p className="vazio-t">
            Nenhuma recorrente ainda
            <small>
              {mob
                ? 'Toque em Registrar, na barra de baixo, para a primeira: aluguel, salário ou uma assinatura. Os números e os próximos 30 dias aparecem a partir dela.'
                : 'Registre o aluguel, o salário ou uma assinatura. Os 4 números e os próximos 30 dias aparecem a partir da primeira.'}
            </small>
          </p>
          {limitado ? <Limite /> : !mob && captura}
        </>
      )}

      {cheio && (
        mob ? (
          <>
            {filtros}
            {limitado && <Limite />}
            <Proximos30 p={d.proximos} hoje={hoje} mob />
            {lista}
          </>
        ) : (
          <>
            {filtros}
            {captura}
            <div className="corpo">
              {lista}
              <Proximos30 p={d.proximos} hoje={hoje} mob={false} />
            </div>
          </>
        )
      )}

      {!carregando && !erro && (
        <div className="pergunte rv">
          <button className="falar" type="button" onClick={p.onPerguntar}>Perguntar sobre as recorrentes →</button>
        </div>
      )}
    </>
  )
}
