import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ImportarView, type ImportarAcoes, type ImportarUi, type LoteExibido } from './ImportarView'
import type { ImportarV5Data, LinhaV5 } from '@/hooks/use-importar-v5'
import { falaReconhecido, fontesReconhecido, resumoReconhecido } from '@/lib/financas/importar'

const NB = String.fromCharCode(160)
const noop = () => {}
const on: ImportarAcoes = {
  falar: noop, filtrar: noop, alternarDrop: noop, fecharDrop: noop, arquivo: noop, alternar: noop, alternarTodas: noop,
  categorizar: noop, bulkValor: noop, aplicar: noop, abrirNova: noop, novaNome: noop, novaTipo: noop, criarNova: noop,
  cancelarNova: noop, coluna: noop, usarColunas: noop, importar: noop, outro: noop, pedirDesfazer: noop,
  cancelarDesfazer: noop, confirmarDesfazer: noop, recarregarLotes: noop,
}

const linha = (i: number, over: Partial<LinhaV5>): LinhaV5 => ({
  i, data: `${i + 1}${NB}set`, desc: `Linha ${i}`, tipo: 'expense', tipoRotulo: 'Despesa', valor: `– R$${NB}10,00`,
  categoriaId: 'c1', categoriaNome: 'Mercado', marcada: true, duplicata: false, semSugestao: false, ...over,
})

const linhas: LinhaV5[] = [
  linha(0, { desc: 'Salario Empresa X', tipo: 'income', tipoRotulo: 'Receita', valor: `+ R$${NB}4.150,00`, categoriaNome: 'Renda' }),
  linha(1, { desc: 'Aluguel setembro', categoriaNome: 'Moradia' }),
  linha(2, { desc: 'Pg *Loja do Ze', categoriaId: null, categoriaNome: null, semSugestao: true }),
  linha(3, { desc: 'Cafe Tal', marcada: false, duplicata: true }),
]
const resumo = resumoReconhecido(linhas.map(l => ({ temCategoria: !l.semSugestao, duplicata: l.duplicata })))

const base: ImportarV5Data = {
  passo: 'preview',
  nomeArquivo: 'extrato-nubank-setembro.csv',
  tipoArquivo: 'CSV',
  banco: 'Nubank',
  periodo: `1 a 30${NB}set`,
  lendo: false,
  conferindoDuplicatas: false,
  erro: null,
  linhas,
  resumo,
  fala: falaReconhecido('Nubank', resumo),
  fontes: fontesReconhecido('extrato-nubank-setembro.csv'),
  categoriasProntas: true,
  despesas: [{ id: 'c1', nome: 'Mercado' }, { id: 'c2', nome: 'Moradia' }],
  receitas: [{ id: 'c3', nome: 'Renda' }],
  totais: { marcadas: 3, entradas: `+ R$${NB}4.150,00`, saidas: `– R$${NB}20,00`, semCategoriaMarcadas: 1 },
  mapeamento: null,
  importando: { feitas: 0, total: 0 },
  concluido: { n: 3, entradas: `+ R$${NB}4.150,00`, saidas: `– R$${NB}20,00`, semCategoria: 1, origem: 'Do Nubank', periodo: `1 a 30${NB}set` },
  lotes: [],
  lotesCarregando: false,
  lotesErro: false,
}

const lotes: LoteExibido[] = [
  { notes: 'Importado de extrato-inter-agosto.ofx', nome: 'extrato-inter-agosto.ofx', importadoEm: `2${NB}set`, n: 22, entradas: `+ R$${NB}4.900,00`, saidas: `– R$${NB}2.980,00`, periodo: `1 a 31${NB}ago` },
  { notes: 'Importado de fatura-nubank-julho.pdf', nome: 'fatura-nubank-julho.pdf', importadoEm: `4${NB}ago`, n: 31, entradas: null, saidas: `– R$${NB}1.412,60`, periodo: `1 a 31${NB}jul`, desfeito: 31 },
]

const ui: ImportarUi = {
  filtro: 'todas', dropAberto: false, bulkValor: '', bulkMsg: null, nova: null, desfazendo: null,
  erroLote: null, novoLote: null, salvoFlash: false,
}

const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|o Sy\b|ao Sy\b|do Sy\b|—/i
const limpa = (h: string) => h.replace(/<!-- -->/g, '')

describe('ImportarView · desktop', () => {
  const html = limpa(renderToString(<ImportarView d={base} lotes={lotes} ui={ui} on={on} mob={false} />))

  it('tem os 3 passos numerados e a tabela de revisão', () => {
    expect(html).toContain('<b>01</b> · Arquivo')
    expect(html).toContain('<b>02</b> · Revisão')
    expect(html).toContain('<b>03</b> · Categorias')
    expect(html).toContain('class="rev"')
    expect(html).toContain('class="form-col"')
  })

  it('reconhecidas marcadas e duplicata desmarcada, com selo', () => {
    expect(html).toContain('Duplicata?')
    expect(html).toMatch(/class="ln dup off"/)
    expect(html).toMatch(/aria-checked="true" aria-label="Importar Linha|aria-checked="true" aria-label="Importar Salario/)
    expect(html).toContain('aria-checked="mixed"')
  })

  it('SaveBar sticky com a contagem das marcadas', () => {
    expect(html).toContain('class="savebar on"')
    expect(html).toContain('Importar 3 transações')
    expect(html).toContain('sem categoria')
  })

  it('Sy diz o que reconheceu', () => {
    expect(html).toContain('Reconheci um extrato do')
    expect(html).toContain('Nubank')
    expect(html).toContain('Falar com Sy sobre o extrato')
  })

  it('passo 03 lista só a linha sem sugestão, com nova categoria', () => {
    expect(html).toContain('Pg *Loja do Ze')
    expect(html).toContain('+ Nova categoria…')
    expect(html).toContain('Aplicar a todas sem categoria')
  })

  it('histórico com desfazer e lote desfeito riscado', () => {
    expect(html).toContain('Desfazer este lote')
    expect(html).toContain('class="lote desfeito"')
    expect(html).toContain('Lote desfeito')
  })

  it('valores com NBSP e sem travessão nem palavras proibidas', () => {
    expect(html).toContain(`R$${NB}4.150,00`)
    expect(PROIBIDAS.test(html)).toBe(false)
  })
})

describe('ImportarView · mobile', () => {
  const html = limpa(renderToString(<ImportarView d={base} lotes={lotes} ui={ui} on={on} mob />))

  it('troca a tabela por cartões marcáveis', () => {
    expect(html).toContain('class="cards"')
    expect(html).not.toContain('class="rev"')
    expect(html).toContain('class="filtros"')
    expect(html).toContain('Marcar todas')
    expect(html).toContain('class="dupl"')
  })

  it('sem palavras proibidas', () => {
    expect(PROIBIDAS.test(html)).toBe(false)
  })
})

describe('ImportarView · estados', () => {
  const render = (d: Partial<ImportarV5Data>, mob = false, u: Partial<ImportarUi> = {}) =>
    limpa(renderToString(<ImportarView d={{ ...base, ...d }} lotes={[]} ui={{ ...ui, ...u }} on={on} mob={mob} />))

  it('vazio: só a zona de soltar, sem SaveBar aberta', () => {
    const h = render({ passo: 'upload', linhas: [], resumo: resumoReconhecido([]) })
    expect(h).toContain('Arraste o extrato aqui')
    expect(h).toContain('Escolha um arquivo para revisar.')
    expect(h).not.toContain('class="savebar on"')
    expect(h).not.toContain('class="rev"')
    expect(PROIBIDAS.test(h)).toBe(false)
  })

  it('erro de PDF com senha', () => {
    const h = render({ passo: 'upload', linhas: [], erro: { kind: 'senha', titulo: 'Este PDF tem senha.', corpo: 'Exporte o extrato em CSV ou OFX no app do banco e escolha de novo. O SyncLife não pede a senha do seu PDF.' } })
    expect(h).toContain('Este PDF tem senha.')
    expect(h).toContain('role="alert"')
  })

  it('CSV sem banco: mapear colunas', () => {
    const h = render({
      passo: 'mapping', linhas: [], mapeamento: { colunas: ['data_mov', 'historico', 'valor_rs'], atual: { date: 'data_mov', description: 'historico', amount: 'valor_rs' }, previa: ['01/09/2026 · Salario · 4150,00'] },
    })
    expect(h).toContain('Usar estas colunas')
    expect(h).toContain('Prévia:')
    expect(h).toContain('Falta mapear')
  })

  it('importando: progresso na SaveBar', () => {
    const h = render({ passo: 'importing', importando: { feitas: 8, total: 16 } })
    expect(h).toContain('Importando')
    expect(h).toContain('disabled=""')
  })

  it('concluído com Ver transações e importar outro', () => {
    const h = render({ passo: 'done' }, false, { salvoFlash: true })
    expect(h).toContain('3 transações importadas.')
    expect(h).toContain('Ver transações')
    expect(h).toContain('Importar outro extrato')
    expect(h).toContain('class="savebar on saved"')
    expect(PROIBIDAS.test(h)).toBe(false)
  })

  it('histórico com erro de rede', () => {
    const h = render({ lotesErro: true })
    expect(h).toContain('Não deu para carregar as importações anteriores.')
    expect(h).toContain('Tentar de novo')
  })

  it('nova categoria inline só com nome e tipo', () => {
    const h = render({}, false, { nova: { alvo: 'bulk', tipo: 'expense', nome: '', erro: null, salvando: false } })
    expect(h).toContain('Nova categoria')
    expect(h).toContain('Criar e aplicar')
    expect(h).not.toMatch(/Ícone|Cor\b/)
  })
})
