import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { RecorrentesView, type RecorrentesViewProps, type RecorrentesDadosView } from './RecorrentesView'
import { agrupar, listaEncerradas, proximaSaida, proximos30, totais, type RecItem } from '@/lib/financas/recorrentes'

const HOJE = '2026-10-03'
const noop = () => {}

const rec = (p: Partial<RecItem> & Pick<RecItem, 'id' | 'nome' | 'valor' | 'freq'>): RecItem => ({
  tipo: 'expense', dia: null, inicio: '2026-01-01', fim: null, pausada: false, categoria: 'Moradia', nota: null, ...p,
})

const ITENS: RecItem[] = [
  rec({ id: 'r2', nome: 'Aluguel', valor: 1200, freq: 'monthly', dia: 6 }),
  rec({ id: 'r3', nome: 'Aporte automático', valor: 580, freq: 'monthly', dia: 8, categoria: 'Investimento' }),
  rec({ id: 'r1', nome: 'Salário', valor: 4150, freq: 'monthly', dia: 30, tipo: 'income', categoria: 'Renda' }),
  rec({ id: 'r10', nome: 'App de idiomas', valor: 39.9, freq: 'monthly', dia: 22, pausada: true, categoria: 'Assinaturas' }),
  rec({ id: 'r7', nome: 'Faxina', valor: 180, freq: 'biweekly', inicio: '2026-09-30' }),
  rec({ id: 'r9', nome: 'Contador do MEI', valor: 240, freq: 'quarterly', dia: 20, inicio: '2026-07-20', categoria: 'Impostos' }),
  rec({ id: 'r8', nome: 'Seguro do carro', valor: 1680, freq: 'annual', dia: 10, inicio: '2025-03-10', categoria: 'Transporte' }),
  rec({ id: 'r0', nome: 'Antigo', valor: 50, freq: 'monthly', dia: 1, fim: '2026-09-01' }),
]

function dados(itens: RecItem[], renda: number | null): RecorrentesDadosView {
  return {
    itens, renda, categorias: [],
    totais: totais(itens, HOJE, renda),
    grupos: agrupar(itens, HOJE),
    encerradas: listaEncerradas(itens, HOJE),
    proximos: proximos30(itens, HOJE),
    proxima: proximaSaida(itens, HOJE),
  }
}

function props(over: Partial<RecorrentesViewProps> = {}): RecorrentesViewProps {
  return {
    mob: false, hoje: HOJE, carregando: false, erro: null, d: dados(ITENS, 5000), filtro: 'todas', onFiltro: noop,
    limitado: false, confirmaId: null, destaqueId: null, status: { texto: '', erro: false },
    onEditar: noop, onPausar: noop, onPedirExcluir: noop, onExcluir: noop, onCancelarExclusao: noop,
    onCriar: async () => ({ ok: true }), onMaisCampos: noop, onTentar: noop, onPerguntar: noop, ...over,
  }
}

const html = (p: RecorrentesViewProps) => renderToString(<RecorrentesView {...p} />).replace(/<!-- -->/g, '')

const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b|—/i

describe('RecorrentesView desktop', () => {
  const h = html(props())
  it('traz as classes-chave do protótipo', () => {
    for (const c of ['titulo', 'nums quieto', 'compr', 'filtros', 'captura', 'corpo', 'grp-h', 'class="rr', 'p30', 'prox-h', 'class="pr', 'prox-foot', 'pergunte', 'falar']) {
      expect(h).toContain(c)
    }
    expect(h).toContain('Recorrentes')
    expect(h).toContain('Mensais')
    expect(h).toContain('Quinzenais')
    expect(h).toContain('Trimestrais')
    expect(h).toContain('Anuais')
    expect(h).toContain('Próximos 30 dias')
  })
  it('mostra os 4 números e o % sobre a renda do perfil', () => {
    expect(h).toContain('Saída mensal')
    expect(h).toContain('Entrada mensal')
    expect(h).toContain('Impacto líquido')
    expect(h).toContain('Custo anual')
    expect(h).toMatch(/<b class="num">48%<\/b> da sua renda comprometida/)
    expect(h).toContain('a renda do seu perfil')
  })
  it('pausada fica esmaecida e oferece Retomar; encerrada vai para o fim', () => {
    expect(h).toMatch(/class="rr pausada"/)
    expect(h).toContain('Retomar App de idiomas')
    expect(h).toContain('pausada, não gera lançamentos')
    expect(h).toContain('Encerradas')
    expect(h).toMatch(/class="rr encerrada"/)
  })
  it('aviso coral a 7 dias ou menos só nas saídas', () => {
    expect(h).toContain('<span class="tag">em 3 dias</span>')
    expect(h).not.toMatch(/Salário<span class="tag"/)
  })
  it('dia do mês só em mensal, trimestral e anual na captura (mensal é o padrão)', () => {
    expect(h).toContain('placeholder="Dia do mês"')
  })
  it('sem palavras proibidas nem travessão', () => {
    expect(h).not.toMatch(PROIBIDAS)
  })
  it('moeda com NBSP e en-dash no negativo', () => {
    expect(h).toContain('– R$ 1.200,00')
    expect(h).toContain('+ R$ 4.150,00')
  })
})

describe('RecorrentesView estados', () => {
  it('sem renda no perfil: traço e a nota, sem número inventado', () => {
    const h = html(props({ d: dados(ITENS, null) }))
    expect(h).toContain('compr sem-renda')
    expect(h).toContain('informe a sua renda mensal no perfil')
    expect(h).not.toMatch(/\d+%<\/b> da sua renda/)
  })
  it('vazio: captura em destaque e mensagem', () => {
    const h = html(props({ d: dados([], 5000) }))
    expect(h).toContain('Nenhuma recorrente ainda')
    expect(h).toContain('class="captura')
    expect(h).not.toContain('class="nums')
  })
  it('carregando: esqueleto e R$ – nos números', () => {
    const h = html(props({ carregando: true, d: dados([], null) }))
    expect(h).toContain('sk-rows')
    expect(h).toContain('R$ –')
  })
  it('erro: linha coral com Tentar de novo', () => {
    const h = html(props({ erro: 'Não consegui carregar as recorrentes.', d: dados([], null) }))
    expect(h).toContain('Tentar de novo')
    expect(h).toContain('class="erro"')
  })
  it('limite FREE troca a captura pelo aviso', () => {
    const h = html(props({ limitado: true }))
    expect(h).toContain('o limite do plano FREE')
    expect(h).not.toContain('class="captura')
  })
  it('confirmação inline de exclusão com a regra dos lançamentos', () => {
    const h = html(props({ confirmaId: 'r2' }))
    expect(h).toContain('class="confirma"')
    expect(h).toContain('Os lançamentos já registrados ficam')
  })
  it('filtro Pausadas mostra só pausadas', () => {
    const h = html(props({ filtro: 'pausadas' }))
    expect(h).toContain('App de idiomas')
    expect(h).not.toContain('data-id="r2"')
  })
})

describe('RecorrentesView mobile', () => {
  const h = html(props({ mob: true }))
  it('linha-botão que abre o sheet, sem captura inline nem ações na linha', () => {
    expect(h).toContain('class="rb"')
    expect(h).toContain('p30-h')
    expect(h).not.toContain('class="captura')
    expect(h).not.toContain('class="ac"')
    expect(h).not.toContain('class="corpo"')
  })
  it('grupos com /mês e sem palavras proibidas', () => {
    expect(h).toContain('/mês')
    expect(h).toContain('Coral: faltam 7 dias ou menos.')
    expect(h).not.toMatch(PROIBIDAS)
  })
  it('mobile também tem pausar, editar e excluir (pelo sheet): linha pausada com aria', () => {
    expect(h).toContain('Editar App de idiomas, pausada')
  })
})
