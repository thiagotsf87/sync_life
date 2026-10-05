// Fase 2 · Importar extrato v5 (T4, 3 passos na mesma página). Apresentação pura por props:
// porte 1:1 de prototypes/v5/app/financas-importar.html (desktop, tabela) e
// financas-importar.mobile.html (mobile, cartões). O container (ImportarV5) liga os dados.
// Sem 'use client' aqui de propósito: o View só recebe props, então vira client junto com o
// container e o teste renderiza por renderToString.

import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { Confirma } from '@/components/app-v5/Confirma'
import { Sy40 } from '@/components/app-v5/Sy40'
import type { ParteFala } from '@/lib/financas/hub'
import { rotuloImportar, type MapaColunas, type TipoLinha } from '@/lib/financas/importar'
import type { ImportarV5Data, LinhaV5, LoteV5, OpcaoCategoria } from '@/hooks/use-importar-v5'

export type FiltroRevisao = 'todas' | 'semcat' | 'dup'

export interface NovaCategoriaUi {
  /** índice da linha ou 'bulk' (aplicar a todas) */
  alvo: number | 'bulk'
  tipo: TipoLinha
  nome: string
  erro: string | null
  salvando: boolean
}

export interface LoteExibido extends LoteV5 {
  /** transações removidas, quando o lote foi desfeito nesta visita */
  desfeito?: number
}

export interface ImportarUi {
  filtro: FiltroRevisao
  dropAberto: boolean
  bulkValor: string
  bulkMsg: ParteFala[] | null
  nova: NovaCategoriaUi | null
  /** notes do lote que pediu licença para desfazer */
  desfazendo: string | null
  erroLote: string | null
  novoLote: string | null
  /** "Importado." na SaveBar por 2 s */
  salvoFlash: boolean
}

export interface ImportarAcoes {
  falar: (seed: string) => void
  filtrar: (f: FiltroRevisao) => void
  alternarDrop: () => void
  fecharDrop: () => void
  arquivo: (f: File) => void
  alternar: (i: number) => void
  alternarTodas: () => void
  categorizar: (i: number, valor: string) => void
  bulkValor: (v: string) => void
  aplicar: () => void
  abrirNova: (alvo: number | 'bulk', tipo: TipoLinha) => void
  novaNome: (v: string) => void
  novaTipo: (t: TipoLinha) => void
  criarNova: () => void
  cancelarNova: () => void
  coluna: (campo: keyof MapaColunas, valor: string) => void
  usarColunas: () => void
  importar: () => void
  outro: () => void
  pedirDesfazer: (notes: string) => void
  cancelarDesfazer: () => void
  confirmarDesfazer: (notes: string) => void
  recarregarLotes: () => void
}

export interface ImportarViewProps {
  d: ImportarV5Data
  lotes: LoteExibido[]
  ui: ImportarUi
  on: ImportarAcoes
  mob: boolean
}

// ─── peças pequenas ──────────────────────────────────────────────────────────

function Fala({ partes }: { partes: ParteFala[] }) {
  return (
    <>
      {partes.map((p, i) =>
        p.b ? <b key={i} className={p.w ? 'num w' : 'num'}>{p.t}</b> : <span key={i}>{p.t}</span>,
      )}
    </>
  )
}

function Mensagem({ partes }: { partes: ParteFala[] }) {
  return (
    <>
      {partes.map((p, i) => (p.b ? <span key={i} className="num">{p.t}</span> : <span key={i}>{p.t}</span>))}
    </>
  )
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios)

function IconeArquivo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14 3 14 8 19 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function Erro({ titulo, corpo }: { titulo: string; corpo: string }) {
  return (
    <div className="erro" role="alert">
      <b>{titulo}</b>{corpo}
    </div>
  )
}

function Opcoes({ itens }: { itens: OpcaoCategoria[] }) {
  return <>{itens.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</>
}

// ─── 01 · arquivo ────────────────────────────────────────────────────────────

function PassoArquivo({ d, ui, on, mob }: Omit<ImportarViewProps, 'lotes'>) {
  const temArquivo = d.passo !== 'upload'
  const aberto = !temArquivo || ui.dropAberto
  const erroLeitura = d.erro && ['senha', 'pdf', 'vazio'].includes(d.erro.kind) ? d.erro : null
  const mapear = d.passo === 'mapping'

  const aoEscolher = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) on.arquivo(f)
    e.target.value = ''
  }
  const aoSoltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('sobre')
    const f = e.dataTransfer.files[0]
    if (f) on.arquivo(f)
  }

  return (
    <section className="fsec boot b2" id="s1" aria-labelledby="s1t">
      <div className="shead">
        <p className="eyebrow" id="s1t"><b>01</b> · Arquivo</p>
        {temArquivo
          ? <span className={mapear ? 'estado' : 'estado ok'}>{mapear ? 'Falta mapear' : 'Concluído'}</span>
          : <span className="estado">{d.lendo ? 'Lendo' : 'Aguardando'}</span>}
      </div>

      {d.lendo && (
        <div className="lendo" role="status">
          <p className="nm">{d.nomeArquivo}</p>
          <p className="n">Lendo o arquivo…</p>
          <div className="skel" aria-hidden="true"><span style={{ width: '92%' }} /><span style={{ width: '78%' }} /><span style={{ width: '85%' }} /></div>
          <p className="n">PDF leva mais: a leitura é no navegador, página por página. O arquivo nunca é guardado.</p>
        </div>
      )}

      {temArquivo && !d.lendo && (
        <div className="arq">
          <span className="ic" aria-hidden="true"><IconeArquivo /></span>
          <div>
            <p className="nm">{d.nomeArquivo}</p>
            <p className="meta">
              {d.tipoArquivo}
              {mapear
                ? ' · banco não reconhecido'
                : <>
                    {d.banco && <> · <b>{d.banco} reconhecido</b></>}
                    {' · '}<span className="num">{d.linhas.length}</span> {plural(d.linhas.length, 'linha', 'linhas')}
                    {d.periodo && <> · <span className="num">{d.periodo}</span></>}
                  </>}
            </p>
          </div>
          <button type="button" className="btn-sm ghost" aria-expanded={aberto} aria-controls="drop" onClick={on.alternarDrop}>
            Trocar arquivo
          </button>
        </div>
      )}

      {erroLeitura && <Erro titulo={erroLeitura.titulo} corpo={erroLeitura.corpo} />}

      <div
        className="drop"
        id="drop"
        hidden={!aberto || d.lendo}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('sobre') }}
        onDragLeave={e => e.currentTarget.classList.remove('sobre')}
        onDrop={aoSoltar}
      >
        <p className="dz-t">{mob ? 'Escolha o extrato' : 'Arraste o extrato aqui'}</p>
        <div className="dz-a">
          <label className="btn-sm roxo" htmlFor="arquivo">Escolher arquivo</label>
          {temArquivo && (
            <button type="button" className="btn-sm ghost" onClick={on.fecharDrop}>
              Manter o extrato {d.banco ? `do ${d.banco}` : 'atual'}
            </button>
          )}
        </div>
        <input type="file" id="arquivo" accept=".pdf,.csv,.ofx,.qfx" hidden onChange={aoEscolher} />
        <p className="fmts">
          PDF, CSV, OFX ou QFX. Bancos reconhecidos: Nubank, Inter, Itaú, Bradesco, C6 Bank e BTG.{' '}
          {mob ? 'CSV de outro banco: você diz qual coluna é qual.' : 'CSV de outro banco: você diz qual coluna é a data, a descrição e o valor.'}
        </p>
      </div>
    </section>
  )
}

// ─── passo extra: mapear colunas (CSV sem banco reconhecido) ─────────────────

function PassoMapear({ d, on }: Pick<ImportarViewProps, 'd' | 'on'>) {
  const m = d.mapeamento
  if (!m) return null
  const campos: { k: keyof MapaColunas; rotulo: string }[] = [
    { k: 'date', rotulo: 'Data' },
    { k: 'description', rotulo: 'Descrição' },
    { k: 'amount', rotulo: 'Valor' },
  ]
  const erro = d.erro?.kind === 'mapeamento' ? d.erro : null
  return (
    <section className="fsec" id="smap" aria-labelledby="smapt">
      <div className="shead">
        <p className="eyebrow" id="smapt">Colunas</p>
        <span className="estado">Obrigatório</span>
      </div>
      <p className="lead">Não reconheci o banco deste CSV. Diga qual coluna é a data, a descrição e o valor. Os três campos são obrigatórios.</p>
      <div className="map">
        {campos.map(c => (
          <div key={c.k}>
            <label htmlFor={`map-${c.k}`}>{c.rotulo}</label>
            <div className="sel">
              <select id={`map-${c.k}`} value={m.atual[c.k]} onChange={e => on.coluna(c.k, e.target.value)}>
                {m.colunas.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
      {m.previa.length > 0 && <p className="prev">Prévia: {m.previa.join('  |  ')}</p>}
      {erro && <Erro titulo={erro.titulo} corpo={erro.corpo} />}
      <p className="map-acts"><button type="button" className="btn-sm roxo" onClick={on.usarColunas}>Usar estas colunas</button></p>
    </section>
  )
}

// ─── 02 · revisão ────────────────────────────────────────────────────────────

function rotuloLinha(l: LinhaV5): string {
  return `Importar ${l.desc}, ${l.data}, ${l.valor}`
}

function Revisao({ d, ui, on, mob }: Omit<ImportarViewProps, 'lotes'>) {
  const total = d.linhas.length
  const marcadas = d.totais.marcadas
  const semCat = d.linhas.filter(l => !l.categoriaId).length
  const dups = d.resumo.duplicatas
  const visiveis = d.linhas.filter(l =>
    ui.filtro === 'semcat' ? !l.categoriaId : ui.filtro === 'dup' ? l.duplicata : true,
  )
  const todas = marcadas === total
  const ckAll = todas ? 'true' : marcadas === 0 ? 'false' : 'mixed'
  const erroImportar = d.erro && ['lote', 'generico'].includes(d.erro.kind) ? d.erro : null
  const pronto = d.categoriasProntas && !d.conferindoDuplicatas

  const filtros = (
    <>
      <button type="button" className="chip" aria-pressed={ui.filtro === 'todas'} onClick={() => on.filtrar('todas')}>
        Todas <span className="num">{total}</span>
      </button>
      <button type="button" className="chip" aria-pressed={ui.filtro === 'semcat'} onClick={() => on.filtrar('semcat')}>
        Sem categoria <span className="num">{semCat}</span>
      </button>
      {dups > 0 && (
        <button type="button" className="chip" aria-pressed={ui.filtro === 'dup'} onClick={() => on.filtrar('dup')}>
          {mob ? 'Duplicatas?' : 'Possíveis duplicatas'} <span className="num">{dups}</span>
        </button>
      )}
    </>
  )
  const contagem = (
    <span className="cnt" aria-live="polite"><b className="num">{marcadas}</b> de <span className="num">{total}</span> marcadas</span>
  )

  return (
    <section className="fsec boot b3" id="s2" aria-labelledby="s2t">
      <div className="shead">
        <p className="eyebrow" id="s2t"><b>02</b> · Revisão</p>
        <span className="estado">Em revisão</span>
      </div>

      <div className="sy">
        <Sy40 />
        <div>
          {pronto ? (
            <>
              <p className="fala"><Fala partes={d.fala} /></p>
              <p className="fontes">{d.fontes}</p>
            </>
          ) : (
            <div aria-hidden="true"><span className="sk l1" /><span className="sk l2" /></div>
          )}
          <button className="falar" type="button" onClick={() => on.falar(`Sobre o extrato ${d.nomeArquivo}: `)}>
            Falar com Sy sobre o extrato →
          </button>
        </div>
      </div>

      {erroImportar && <Erro titulo={erroImportar.titulo} corpo={erroImportar.corpo} />}

      {mob ? (
        <>
          <div className="filtros" role="group" aria-label="Mostrar">{filtros}</div>
          <div className="tool">
            <button type="button" className="cb" id="ckAll" role="checkbox" aria-checked={ckAll} onClick={on.alternarTodas}>
              <i aria-hidden="true" /><span>{todas ? 'Desmarcar todas' : 'Marcar todas'}</span>
            </button>
            {contagem}
          </div>
          <ul className="cards" aria-label="Linhas do extrato">
            {visiveis.map(l => (
              <li key={l.i} className={`ln${l.tipo === 'income' ? ' in' : ''}${l.duplicata ? ' dup' : ''}${l.marcada ? '' : ' off'}`}>
                <button type="button" className="cb" role="checkbox" aria-checked={l.marcada} aria-label={rotuloLinha(l)} onClick={() => on.alternar(l.i)}>
                  <i aria-hidden="true" />
                  <span className="ds">{l.desc}</span>
                  <span className="v num">{l.valor}</span>
                  <span className="meta">
                    <span className="num">{l.data}</span> · {l.tipoRotulo} · <span>{l.categoriaNome ?? <span className="semcat">Sem categoria</span>}</span>
                  </span>
                  {l.duplicata && (
                    <span className="dupl"><span className="tag dup">Duplicata?</span>Mesma data, valor e descrição de um lançamento já registrado.</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="rev-bar" role="group" aria-label="Mostrar">{filtros}{contagem}</div>
          <table className="rev" aria-label="Linhas do extrato">
            <thead>
              <tr>
                <th className="ck" scope="col">
                  <button type="button" className="cb" id="ckAll" role="checkbox" aria-checked={ckAll} aria-label="Marcar todas" onClick={on.alternarTodas}>
                    <i aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">Data</th>
                <th scope="col">Descrição</th>
                <th scope="col" className="tp">Tipo</th>
                <th scope="col">Categoria</th>
                <th scope="col" className="v">Valor</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(l => (
                <tr
                  key={l.i}
                  className={`ln${l.tipo === 'income' ? ' in' : ''}${l.duplicata ? ' dup' : ''}${l.marcada ? '' : ' off'}`}
                  onClick={e => { if (!(e.target as HTMLElement).closest('a,button,select,input')) on.alternar(l.i) }}
                >
                  <td className="ck">
                    <button type="button" className="cb" role="checkbox" aria-checked={l.marcada} aria-label={rotuloLinha(l)} onClick={() => on.alternar(l.i)}>
                      <i aria-hidden="true" />
                    </button>
                  </td>
                  <td className="d num">{l.data}</td>
                  <td className="ds">
                    {l.desc}
                    {l.duplicata && (
                      <>
                        {' '}<span className="tag dup">Duplicata?</span>
                        <small>Mesma data, valor e descrição de um lançamento já registrado.</small>
                      </>
                    )}
                  </td>
                  <td className="tp">{l.tipoRotulo}</td>
                  <td className="ct">{l.categoriaNome ?? <a className="semcat" href="#s3">Sem categoria</a>}</td>
                  <td className="v num">{l.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="rev-foot">
        <span>Marcadas: <span className="num">{marcadas}</span> {plural(marcadas, 'linha', 'linhas')}</span>
        <span>Entradas <span className="num ele">{d.totais.entradas}</span> · saídas <span className="num">{d.totais.saidas}</span></span>
      </div>
    </section>
  )
}

// ─── 03 · categorias ─────────────────────────────────────────────────────────

function NovaCategoria({ ui, on, mob }: Pick<ImportarViewProps, 'ui' | 'on' | 'mob'>) {
  const n = ui.nova
  if (!n) return null
  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); on.criarNova() }
    if (e.key === 'Escape') on.cancelarNova()
  }
  const campoNome = (
    <div className="fld">
      <div className="lblrow"><label htmlFor="ncNome">Nome</label></div>
      <input
        id="ncNome" type="text" placeholder="Ex.: Tarifas bancárias" autoComplete="off" autoFocus
        className={n.erro ? 'err' : undefined} aria-describedby="ncMsg"
        value={n.nome} onChange={e => on.novaNome(e.target.value)} onKeyDown={aoTeclar}
      />
      {mob && <span className={n.erro ? 'msg err' : 'msg'} id="ncMsg" aria-live="polite">{n.erro}</span>}
    </div>
  )
  const pills = (
    <div className="pills" role="group" aria-label="Tipo">
      <button type="button" className="chip" aria-pressed={n.tipo === 'expense'} onClick={() => on.novaTipo('expense')}>Despesa</button>
      <button type="button" className="chip" aria-pressed={n.tipo === 'income'} onClick={() => on.novaTipo('income')}>Receita</button>
    </div>
  )
  return (
    <div className="novacat" id="novacat">
      <span className="eyebrow">Nova categoria</span>
      {mob ? <>{campoNome}{pills}</> : <div className="lin">{campoNome}{pills}</div>}
      {!mob && <p className="fld"><span className={n.erro ? 'msg err' : 'msg'} id="ncMsg" aria-live="polite">{n.erro}</span></p>}
      <div className="acts">
        <button type="button" className="btn-sm roxo" disabled={n.salvando} onClick={on.criarNova}>Criar e aplicar</button>
        <button type="button" className="btn-sm ghost" onClick={on.cancelarNova}>Cancelar</button>
      </div>
    </div>
  )
}

function Categorias({ d, ui, on, mob }: Omit<ImportarViewProps, 'lotes'>) {
  const semCat = d.linhas.filter(l => !l.categoriaId).length
  const lista = d.linhas.filter(l => l.semSugestao)
  return (
    <section className="fsec boot b4" id="s3" aria-labelledby="s3t">
      <div className="shead">
        <p className="eyebrow" id="s3t"><b>03</b> · Categorias</p>
        <span className={semCat === 0 ? 's3st ok' : 's3st'} aria-live="polite">
          {semCat === 0
            ? 'Tudo categorizado.'
            : <><span className="num">{semCat}</span> {plural(semCat, 'linha sem categoria', 'linhas sem categoria')}</>}
        </span>
      </div>
      <p className="lead">
        {mob
          ? 'Escolha uma categoria para cada linha, ou a mesma para todas. Sem escolher, a linha entra sem categoria e você ajusta em Transações.'
          : 'Escolha uma categoria para cada linha, ou aplique a mesma a todas. Se você importar sem escolher, a linha entra sem categoria e você ajusta depois em Transações.'}
      </p>

      <div className="bulk" id="bulk">
        <span className="lbl">Aplicar a todas sem categoria</span>
        <div className="sel">
          <select id="bulkSel" aria-label="Categoria para todas" value={ui.bulkValor} onChange={e => on.bulkValor(e.target.value)}>
            <option value="">Escolha…</option>
            <optgroup label="Despesa"><Opcoes itens={d.despesas} /></optgroup>
            <optgroup label="Receita"><Opcoes itens={d.receitas} /></optgroup>
          </select>
        </div>
        <button type="button" className="btn-sm ghost" onClick={on.aplicar}>Aplicar</button>
        <button type="button" className="btn-sm ghost" onClick={() => on.abrirNova('bulk', 'expense')}>+ Nova categoria</button>
      </div>
      <p className="bulk-msg" role="status">{ui.bulkMsg ? <Mensagem partes={ui.bulkMsg} /> : null}</p>
      {ui.nova?.alvo === 'bulk' && <NovaCategoria ui={ui} on={on} mob={mob} />}

      {lista.length === 0 && <p className="lead">Todas as linhas já vieram com categoria.</p>}
      {lista.map((l, n) => (
        <div key={l.i}>
          <div className={n === 0 ? 'catln primeira' : 'catln'}>
            <span className="d num">{l.data}</span>
            <span className="ds">{l.desc}</span>
            <span className={l.tipo === 'income' ? 'v num in' : 'v num'}>{l.valor}</span>
            <div className="sel">
              <select className="catsel" aria-label={`Categoria de ${l.desc}`} value={l.categoriaId ?? ''} onChange={e => on.categorizar(l.i, e.target.value)}>
                <option value="">Sem categoria</option>
                <Opcoes itens={l.tipo === 'income' ? d.receitas : d.despesas} />
                <option value="__nova">+ Nova categoria…</option>
              </select>
            </div>
          </div>
          {ui.nova?.alvo === l.i && <NovaCategoria ui={ui} on={on} mob={mob} />}
        </div>
      ))}
    </section>
  )
}

// ─── concluído ───────────────────────────────────────────────────────────────

function Concluido({ d, on }: Pick<ImportarViewProps, 'd' | 'on'>) {
  const c = d.concluido
  return (
    <section className="feito" id="feito" aria-labelledby="feitoN">
      <p className="eyebrow">Concluído</p>
      <h2 id="feitoN">{c.n} {plural(c.n, 'transação importada.', 'transações importadas.')}</h2>
      <p>
        {c.origem}{c.periodo && <>, de <span className="num">{c.periodo}</span></>}. Entradas <span className="num ele">{c.entradas}</span> · saídas <span className="num">{c.saidas}</span>.
        {c.semCategoria > 0 && <> <span className="num">{c.semCategoria}</span> {plural(c.semCategoria, 'entrou', 'entraram')} sem categoria; você ajusta em Transações.</>}
      </p>
      <div className="acts">
        <Link className="btn-sm roxo" href="/financas/transacoes">Ver transações</Link>
        <button type="button" className="btn-sm ghost" onClick={on.outro}>Importar outro extrato</button>
      </div>
    </section>
  )
}

// ─── histórico de importações ────────────────────────────────────────────────

function Historico({ d, lotes, ui, on }: Pick<ImportarViewProps, 'd' | 'lotes' | 'ui' | 'on'>) {
  return (
    <section className="hist" aria-labelledby="ht">
      <p className="eyebrow" id="ht">Importações anteriores</p>
      <p className="lead">Desfazer um lote apaga as transações que vieram daquele arquivo, inclusive as que você editou depois.</p>
      <div id="lotes">
        {d.lotesCarregando && lotes.length === 0 && (
          <div className="skel" aria-hidden="true"><span style={{ width: '70%' }} /><span style={{ width: '55%' }} /></div>
        )}
        {d.lotesErro && lotes.length === 0 && (
          <div className="erro" role="alert">
            <b>Não deu para carregar as importações anteriores.</b>A revisão continua funcionando.{' '}
            <button type="button" className="lnk" onClick={on.recarregarLotes}>Tentar de novo</button>
          </div>
        )}
        {!d.lotesCarregando && !d.lotesErro && lotes.length === 0 && (
          <p className="quieto">Nenhuma importação ainda. Os lotes aparecem aqui, cada um com o desfazer.</p>
        )}
        {lotes.map(l => {
          const desfeito = l.desfeito !== undefined
          const novo = ui.novoLote === l.notes
          const confirmando = ui.desfazendo === l.notes
          return (
            <div key={l.notes} className={`lote${desfeito ? ' desfeito' : ''}${novo ? ' novo' : ''}`}>
              <div>
                <p className="nm">{l.nome}</p>
                <p className="meta">
                  {desfeito
                    ? <>Lote desfeito · <span className="num">{l.desfeito}</span> transações removidas de 01 Finanças.</>
                    : <>
                        {novo ? 'Importado agora' : l.importadoEm ? <>Importado em <span className="num">{l.importadoEm}</span></> : 'Importado'}
                        {' · '}<span className="num">{l.n}</span> {plural(l.n, 'transação', 'transações')} · <span className="num">{l.periodo}</span>
                      </>}
                </p>
              </div>
              {!desfeito && (
                <div className="vals">
                  {l.entradas && <span className="num ele">{l.entradas}</span>}
                  {l.saidas && <span className="num">{l.saidas}</span>}
                </div>
              )}
              {!desfeito && !confirmando && (
                <button type="button" className="btn-sm ghost perigo" onClick={() => on.pedirDesfazer(l.notes)}>Desfazer este lote</button>
              )}
              {confirmando && (
                <Confirma rotuloSim="Sim, remover" rotuloNao="Manter" onSim={() => on.confirmarDesfazer(l.notes)} onNao={on.cancelarDesfazer}>
                  Remover as <b className="num">{l.n}</b> transações de <b>{l.nome}</b>? Não dá para voltar.
                </Confirma>
              )}
              {confirmando && ui.erroLote && <p className="msg err" role="alert">{ui.erroLote}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── SaveBar ─────────────────────────────────────────────────────────────────

function SaveBar({ d, ui, on }: Pick<ImportarViewProps, 'd' | 'ui' | 'on'>) {
  const importando = d.passo === 'importing'
  const pendente = (d.passo === 'preview' || importando) && d.linhas.length > 0
  const aberta = pendente || ui.salvoFlash
  const { marcadas, semCategoriaMarcadas } = d.totais
  return (
    <div className={`savebar${aberta ? ' on' : ''}${ui.salvoFlash && !pendente ? ' saved' : ''}`} id="savebar" role="region" aria-label="Importação pendente">
      <span className="sb-txt" aria-live="polite">
        {importando ? (
          <>Importando <b className="num">{d.importando.feitas}</b> de <span className="num">{d.importando.total}</span>…</>
        ) : (
          <>
            <b className="num">{marcadas}</b> de <span className="num">{d.linhas.length}</span> marcadas
            {semCategoriaMarcadas > 0 && <> · <span className="w num">{semCategoriaMarcadas}</span> sem categoria</>}
          </>
        )}
      </span>
      <button type="button" className="btn-sm roxo" id="importar" disabled={importando || marcadas === 0 || d.conferindoDuplicatas} onClick={on.importar}>
        {importando ? 'Importando…' : d.conferindoDuplicatas ? 'Conferindo duplicatas…' : rotuloImportar(marcadas)}
      </button>
      <span className="sb-ok" role="status" hidden={!ui.salvoFlash}>Importado.</span>
    </div>
  )
}

// ─── tela ────────────────────────────────────────────────────────────────────

export function ImportarView(props: ImportarViewProps) {
  const { d, lotes, ui, on, mob } = props
  const { passo } = d
  const comLinhas = (passo === 'preview' || passo === 'importing') && d.linhas.length > 0
  const concluido = passo === 'done'
  const aguardando = passo === 'upload' || passo === 'mapping'

  return (
    <>
      <header className="titulo boot b1">
        <p className="eyebrow"><Link href="/financas"><b>01</b>{mob ? ' ' : ' '}· Finanças</Link></p>
        <h1>Importar extrato</h1>
        <p className="sub">
          {mob
            ? 'Traga o extrato do banco, confira as linhas e importe. Nada entra antes do seu ok, e cada importação pode ser desfeita.'
            : 'Traga o extrato do banco, confira as linhas e importe. Nada entra em Finanças antes do seu ok, e cada importação pode ser desfeita.'}
        </p>
      </header>

      <div className="form-col">
        <PassoArquivo d={d} ui={ui} on={on} mob={mob} />
        <PassoMapear d={d} on={on} />

        {comLinhas && <Revisao d={d} ui={ui} on={on} mob={mob} />}
        {comLinhas && <Categorias d={d} ui={ui} on={on} mob={mob} />}
        {concluido && <Concluido d={d} on={on} />}

        {aguardando && (
          <>
            <section className="fsec" id="s2" aria-labelledby="s2t">
              <div className="shead"><p className="eyebrow" id="s2t"><b>02</b> · Revisão</p></div>
              <p className="lead">{passo === 'mapping' ? 'Escolha as colunas para revisar.' : 'Escolha um arquivo para revisar.'}</p>
            </section>
            <section className="fsec" id="s3" aria-labelledby="s3t">
              <div className="shead"><p className="eyebrow" id="s3t"><b>03</b> · Categorias</p></div>
              <p className="lead">As categorias aparecem depois da revisão.</p>
            </section>
          </>
        )}

        <Historico d={d} lotes={lotes} ui={ui} on={on} />
      </div>

      <SaveBar d={d} ui={ui} on={on} />
    </>
  )
}
