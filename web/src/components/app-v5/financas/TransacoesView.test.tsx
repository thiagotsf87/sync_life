import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { TransacoesView, type TransacoesViewProps } from './TransacoesView'
import { linhaDeOcorrencia, type TxLinha } from '@/lib/financas/transacoes'

const noop = () => {}
const l = (p: Partial<TxLinha>): TxLinha => ({
  id: 'x', date: '2026-10-03', desc: 'Mercado Central', tipo: 'out', valor: 182.4, categoriaId: 'c1', categoriaNome: 'Mercado',
  metodo: 'pix', obs: '', recorrente: false, previsto: false, contaDeId: null, contaParaId: null, contaDeNome: '', contaParaNome: '', ...p,
})

const props = (mob: boolean, extra: Partial<TransacoesViewProps> = {}): TransacoesViewProps => ({
  mob, hoje: '2026-10-03', mes: { ano: 2026, mes: 10 }, mesAtual: true, podeAvancar: false, onMes: noop, onHoje: noop,
  tipo: 'todas', onTipo: noop, categoriaId: '', onCategoria: noop, q: '', onQ: noop, ordem: 'recente', onOrdem: noop, filtrando: false,
  categorias: [{ id: 'c1', name: 'Mercado', type: 'expense' }, { id: 'c2', name: 'Renda', type: 'income' }],
  linhas: [
    l({ id: '1' }),
    l({ id: '2', date: '2026-10-02', desc: 'Freela landing page', tipo: 'in', valor: 850, categoriaNome: 'Renda' }),
    l({ id: '3', date: '2026-10-02', desc: 'Reserva para o CDB', tipo: 'tr', valor: 300, contaDeNome: 'Nubank', contaParaNome: 'Inter' }),
  ],
  previstos: [l({ id: 'p1', date: '2026-10-06', desc: 'Aluguel', valor: 1200, categoriaNome: 'Moradia', recorrente: true, previsto: true })],
  totalFiltrado: 34, temMais: true, onMais: noop,
  totais: { entradas: 5000, saidas: 3160, saldo: 1840, quantidade: 34 },
  loading: false, trocandoMes: false, erro: false, onRecarregar: noop,
  prevAberto: false, onPrevAberto: noop, novaId: null,
  onAbrir: noop, onCapturar: async () => ({ ok: true, msg: 'Registrado.' }), onCapturaMais: noop, onFalar: noop,
  ...extra,
})

const html = (p: TransacoesViewProps) => renderToString(<TransacoesView {...p} />).replace(/<!-- -->/g, '')

const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b|—/i

describe('TransacoesView desktop', () => {
  const h = html(props(false))
  it('traz as peças do protótipo', () => {
    for (const c of ['class="titulo boot b1"', 'class="tline"', 'class="mesnav"', 'class="filtros boot b2"', 'class="captura boot b3"',
      'class="trans rv"', 'class="grupo previstos"', 'class="dia"', 'class="tx prev"', 'class="lista-foot rv"', 'class="falar"', 'class="mais-wrap"']) {
      expect(h).toContain(c)
    }
  })
  it('mostra mês, totais do mês inteiro e selos', () => {
    expect(h).toContain('Transações · outubro')
    expect(h).toContain('outubro de 2026')
    expect(h).toContain('Outubro inteiro')
    expect(h).toContain('+ R$ 5.000,00')
    expect(h).toContain('– R$ 3.160,00')
    expect(h).toContain('+ R$ 1.840,00')
    expect(h).toContain('3 de 34')
    expect(h).toContain('Previstos até o fim de outubro')
    expect(h).toContain('<span class="tag">Transf.</span>')
    expect(h).toContain('Nubank → Inter')
    expect(h).toContain('<span class="tag">Recorrente</span>')
    expect(h).toContain('<span class="tag">Previsto</span>')
    expect(h).toContain('Carregar mais')
    expect(h).toContain('Transferências')
  })
  it('subtotal do dia ignora a transferência', () => {
    expect(h).toContain('+ R$ 850,00</span>')
  })
  it('próximo mês desabilitado no mês atual e sem "Voltar para hoje"', () => {
    expect(h).toMatch(/aria-label="Próximo mês" disabled/)
    expect(h).not.toContain('Voltar para hoje')
  })
  it('sem palavras proibidas nem travessão', () => {
    expect(h).not.toMatch(PROIBIDAS)
  })
})

describe('TransacoesView mobile', () => {
  const h = html(props(true))
  it('usa o markup mobile: sec lista, sem captura inline, valor antes da categoria', () => {
    expect(h).toContain('class="sec lista rv"')
    expect(h).not.toContain('class="captura')
    expect(h).toMatch(/<span class="v num">[^<]*<\/span><span class="ct">Mercado<\/span>/)
    expect(h).toContain('Sexta · 2 out')
    expect(h).toContain('Saldo do mês')
  })
  it('categorias viram pílulas e sem palavras proibidas', () => {
    expect(h).toContain('>Renda</button>')
    expect(h).not.toMatch(PROIBIDAS)
  })
})

describe('previstos com ocorrências de recorrentes', () => {
  const ocs = [
    linhaDeOcorrencia({ id: 'rec-a-2026-10-06', data: '2026-10-06', desc: 'Aluguel', cat: 'Moradia', valor: -1200 }),
    linhaDeOcorrencia({ id: 'rec-b-2026-10-08', data: '2026-10-08', desc: 'Aporte automático', cat: 'Investimento', valor: -580 }),
    linhaDeOcorrencia({ id: 'rec-c-2026-10-08', data: '2026-10-08', desc: 'Internet', cat: 'Assinaturas', valor: -89.9 }),
    linhaDeOcorrencia({ id: 'rec-d-2026-10-10', data: '2026-10-10', desc: 'Salário', cat: 'Renda', valor: 5000 }),
  ]
  const h = html(props(false, { previstos: ocs, linhas: [] }))
  it('mostra 3, o botão com a contagem e os dois selos', () => {
    expect(h).toContain('Ver os 4 previstos')
    expect(h).not.toContain('>Salário<')
    expect(h).toContain('<span class="tag">Recorrente</span><span class="tag">Previsto</span>')
  })
  it('subtotal soma entradas e saídas previstas', () => {
    expect(h).toContain('+ R$ 3.130,10</span>')
  })
})

describe('estados', () => {
  it('carregando mostra o esqueleto e mantém o cabeçalho', () => {
    const h = html(props(false, { loading: true, linhas: [], previstos: [], totais: null }))
    expect(h).toContain('tx skel')
    expect(h).toContain('Somando o mês')
    expect(h).toContain('class="captura')
  })
  it('erro tem Tentar de novo', () => {
    const h = html(props(false, { erro: true, linhas: [], previstos: [] }))
    expect(h).toContain('Tentar de novo')
    expect(h).toContain('role="alert"')
  })
  it('mês atual vazio destaca a captura', () => {
    const h = html(props(false, { linhas: [], previstos: [], temMais: false, totalFiltrado: 0, totais: { entradas: 0, saidas: 0, saldo: 0, quantidade: 0 } }))
    expect(h).toContain('Nenhuma transação em outubro ainda')
    expect(h).toContain('captura destaque')
    expect(h).not.toMatch(PROIBIDAS)
  })
  it('outro mês vazio mostra Voltar para hoje', () => {
    const h = html(props(false, { mes: { ano: 2026, mes: 8 }, mesAtual: false, podeAvancar: true, linhas: [], previstos: [], temMais: false, totalFiltrado: 0 }))
    expect(h).toContain('Nenhuma transação em agosto')
    expect(h).toContain('Voltar para hoje')
  })
  it('filtro sem resultado', () => {
    const h = html(props(false, { filtrando: true, tipo: 'tr', linhas: [], previstos: [], temMais: false, totalFiltrado: 0 }))
    expect(h).toContain('Nada com esse filtro.')
  })
  it('ordem por valor vira lista plana', () => {
    const h = html(props(false, { ordem: 'maior' }))
    expect(h).toContain('class="grupo plano"')
    expect(h).not.toContain('Sábado')
  })
})
