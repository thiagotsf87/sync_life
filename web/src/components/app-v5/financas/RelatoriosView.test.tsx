import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { RelatoriosView, type RelatoriosViewProps } from './RelatoriosView'
import { mesesDoPeriodo, montarRelatorio, type PeriodoKey, type TxRel } from '@/lib/financas/relatorios'

const HOJE = '2026-10-03'
const noop = () => {}

const MES: Record<string, { rec: number; desp: number; cats: Record<string, number> }> = {
  '2026-04': { rec: 4650, desp: 3380, cats: { Moradia: 1240, Mercado: 600, Lazer: 380, Transporte: 330, Saúde: 210 } },
  '2026-05': { rec: 4720, desp: 3290, cats: { Moradia: 1240, Mercado: 580, Lazer: 350, Transporte: 300, Saúde: 190 } },
  '2026-06': { rec: 4800, desp: 3450, cats: { Moradia: 1240, Mercado: 610, Lazer: 420, Transporte: 320, Saúde: 230 } },
  '2026-07': { rec: 4750, desp: 3520, cats: { Moradia: 1240, Mercado: 640, Lazer: 470, Transporte: 330, Saúde: 200 } },
  '2026-08': { rec: 4900, desp: 3250, cats: { Moradia: 1240, Mercado: 590, Lazer: 360, Transporte: 310, Saúde: 190 } },
  '2026-09': { rec: 4630, desp: 2987, cats: { Moradia: 1240, Mercado: 706, Lazer: 310, Transporte: 290, Saúde: 140 } },
}

function txs(): TxRel[] {
  const out: TxRel[] = []
  for (const [ym, m] of Object.entries(MES)) {
    out.push({ id: `r-${ym}`, date: `${ym}-05`, amount: m.rec, type: 'income', description: 'Salário', category: 'Salário', payment_method: 'pix', notes: null })
    for (const [c, v] of Object.entries(m.cats)) {
      out.push({ id: `d-${ym}-${c}`, date: `${ym}-10`, amount: v, type: 'expense', description: c === 'Moradia' ? 'Aluguel' : `${c} do mês`, category: c, payment_method: null, notes: null })
    }
    const resto = m.desp - Object.values(m.cats).reduce((s, v) => s + v, 0)
    out.push({ id: `o-${ym}`, date: `${ym}-20`, amount: resto, type: 'expense', description: 'Diversos', category: 'Outros', payment_method: null, notes: null })
  }
  return out
}

function relatorio(key: PeriodoKey, de?: string, ate?: string, lista = txs()) {
  const { sel, prev } = mesesDoPeriodo({ key, hoje: HOJE, de, ate })
  return montarRelatorio({ txs: lista, key, sel, prev, hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })
}

const OPCOES = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'].map(v => ({ value: v, label: v }))

function props(over: Partial<RelatoriosViewProps> = {}): RelatoriosViewProps {
  return {
    rel: relatorio('custom', '2026-07', '2026-09'), loading: false, recarregando: false, erro: false, mob: false,
    periodoKey: 'tri', de: '2026-07', ate: '2026-09', opcoes: OPCOES, atualizadoAs: '7h12', csvMsg: '',
    onKey: noop, onDe: noop, onAte: noop, onTentar: noop, onCsv: noop, onFalar: noop, ...over,
  }
}

const html = (p: RelatoriosViewProps) => renderToString(<RelatoriosView {...p} />).replace(/<!-- -->/g, '')

const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b|—/i

describe('RelatoriosView desktop', () => {
  const h = html(props())

  it('traz as classes-chave do protótipo', () => {
    for (const c of ['titulo', 'th-row', 'periodos', 'per', 'sy', 'fala', 'fontes', 'falar', 'nums', 'duo', 'c1', 'cht', 'plot', 'xl', 'zona', 'guia',
      'blk-head', 'leg', 'syl', 'crow', 'bars', 'outras', 'duo2', 'top', 'trow', 'tbar', 'mm', 'exp']) {
      expect(h, c).toContain(c)
    }
    expect(h).toContain('aria-pressed="true"')
    expect(h).toContain('<h1>Relatórios</h1>')
  })

  it('mostra os quatro números com delta contra o período anterior', () => {
    expect(h).toContain('R$ 14.280')
    expect(h).toContain('+0,8% vs abril a junho')
    expect(h).toContain('-3,6% vs abril a junho')
    expect(h).toContain('Poupança média')
    expect(h).toContain('Meta: 30%')
  })

  it('subtítulo, fontes e linhas de Sy calculadas', () => {
    expect(h).toContain('Julho a setembro · 3 meses · 21 transações · comparado com abril a junho')
    expect(h).toContain('Atualizado às 7h12 · fontes: 21 transações, 6 categorias, meta de poupança de 30%')
    expect(h).toContain('Agosto foi o melhor mês: sobraram')
    expect(h).toContain('Mercado subiu')
    expect(h).toContain('Moradia ocupa')
    expect(h).toContain('Falar com Sy sobre este período')
  })

  it('gráficos são SVG com a linha de receitas do protótipo e acessíveis por teclado', () => {
    expect(h).toContain('M30.0 65.0 L138.0 60.8 L246.0 56.0 L354.0 59.0 L462.0 50.0 L570.0 66.2')
    expect(h).toContain('tabindex="0"')
    expect(h).toContain('role="img"')
    expect(h).toContain('aria-label="Receitas e despesas por mês, julho a setembro')
    expect(h).toContain('aria-label="Poupança por mês contra a meta de 30%')
    expect(h).toContain('abril a junho')
  })

  it('categorias com delta, mês a mês e exportação em CSV', () => {
    expect(h).toContain('+8,2%')
    expect(h).toContain('-2,1%')
    expect(h).toContain('Mês a mês · 3 meses')
    expect(h).toContain('<table>')
    expect(h).toContain('Exportar CSV do período')
    expect(h).toContain('ponto e vírgula')
  })

  it('pílulas PRO com marca discreta e sem Gerar, PDF ou Excel', () => {
    expect(h).toContain('Último semestre<span class="pro">PRO</span>')
    expect(h).toContain('Personalizado<span class="pro">PRO</span>')
    expect(h).not.toMatch(/Gerar/)
    expect(h).not.toMatch(/PDF|Excel<|>Excel/)
  })

  it('sem palavras proibidas nem travessão', () => {
    expect(h).not.toMatch(PROIBIDAS)
  })
})

describe('RelatoriosView mobile', () => {
  const h = html(props({ mob: true }))

  it('markup próprio: seções .sec, pílulas e mês a mês em linhas', () => {
    expect(h).toContain('class="sec c1')
    expect(h).toContain('mrow2')
    expect(h).not.toContain('<table>')
    expect(h).not.toContain('class="zona"')
    expect(h).toContain('vs abr a jun')
    expect(h).toContain('Poupança</p>')
    expect(h).not.toContain('class="tr"')
  })

  it('subtítulo mobile sem a contagem de transações', () => {
    expect(h).toContain('Julho a setembro · 3 meses · comparado com abril a junho')
    expect(h).toContain('M18.0 50.8 L78.8 47.8')
  })

  it('sem palavras proibidas nem travessão', () => {
    expect(h).not.toMatch(PROIBIDAS)
  })
})

describe('RelatoriosView estados', () => {
  it('sem período anterior diz isso em vez de inventar delta', () => {
    const h = html(props({ rel: relatorio('sem'), periodoKey: 'sem' }))
    expect(h).toContain('sem período anterior')
    expect(h).toContain('seu histórico começa em abril')
    expect(h).not.toContain('class="zona"')
  })

  it('vazio: frase e saída para registrar', () => {
    const h = html(props({ rel: relatorio('mes', undefined, undefined, []), periodoKey: 'mes' }))
    expect(h).toContain('Nada registrado de outubro')
    expect(h).toContain('href="/financas/transacoes#registrar"')
    expect(h).not.toContain('class="nums')
    expect(h).not.toMatch(PROIBIDAS)
  })

  it('carregando: esqueleto, sem números', () => {
    const h = html(props({ rel: null, loading: true }))
    expect(h).toContain('rel-sk')
    expect(h).not.toContain('class="nums')
  })

  it('erro: linha coral com "Tentar de novo" e sem números', () => {
    const h = html(props({ erro: true }))
    expect(h).toContain('role="alert"')
    expect(h).toContain('Não consegui carregar este período.')
    expect(h).toContain('Tentar de novo')
    expect(h).not.toContain('class="nums')
  })

  it('troca de período: conteúdo anterior marcado como ocupado', () => {
    const h = html(props({ recarregando: true }))
    expect(h).toContain('rel-corpo busy')
    expect(h).toContain('aria-busy="true"')
  })

  it('personalizado abre os seletores de mês', () => {
    const h = html(props({ periodoKey: 'custom' }))
    expect(h).toContain('aria-label="Mês inicial"')
    expect(h).toContain('aria-label="Mês final"')
    expect(h).not.toContain('class="custom" hidden')
    expect(html(props())).toContain('class="custom" hidden')
  })
})
