import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { OrcamentosView, PainelEnvelope, type OrcamentosViewProps, type LabVista } from './OrcamentosView'
import type { EnvelopeV5, OrcamentosV5Data } from '@/hooks/use-orcamentos-v5'
import { efeitosTeto, falaOrcamentos, opcoesTeto, type EntradaLab } from '@/lib/financas/orcamentos'

// o React põe <!-- --> entre nós de texto adjacentes; os asserts olham o texto normalizado
const html = (el: React.ReactElement) => renderToString(el).replace(/<!-- -->/g, '')
const texto = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ')

const PROIBIDAS =
  /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|o Sy\b|ao Sy\b|do Sy\b|—/i

const env = (id: string, categoria: string, gasto: number, limiteBase: number, alerta = 85, sobra = 0, rollover = false): EnvelopeV5 =>
  ({ id, categoriaId: `c-${id}`, categoria, gasto, limiteBase, sobra, alerta, rollover, notas: '' })

const ENVS: EnvelopeV5[] = [
  env('1', 'Moradia', 1240, 1800),
  env('2', 'Mercado', 520, 650),
  env('3', 'Lazer', 410, 420, 80),
  env('4', 'Transporte', 310, 400),
  env('5', 'Saúde', 180, 250, 85, 50, true),
  env('6', 'Assinaturas', 200, 220, 90),
]

const DADOS: OrcamentosV5Data = {
  loading: false, erro: false, tentarDeNovo: vi.fn(),
  mes: 10, ano: 2026, mesNome: 'outubro', mesAntNome: 'setembro', mesProxNome: 'novembro', mesCorrente: true,
  irMes: vi.fn(), dias: 28, envelopes: ENVS, receitas: 5000, rendaPerfil: 5000,
  fora: [{ categoriaId: 'x', nome: 'Investimento', valor: 300 }],
  categoriasLivres: [{ id: 'x', nome: 'Investimento' }, { id: 'y', nome: 'Impostos' }],
  txCount: 34, atualizadoAs: '7h12', ultimaSinc: '14:05',
  anteriores: [], fechamentoBase: 2120, saldoMes: 1950,
  meta: { nome: 'Viagem Itália', atual: 8600, alvo: 12700, aporteFixo: 580 },
  labEnvelopeId: '3',
  criar: vi.fn(), salvar: vi.fn(), excluir: vi.fn(), copiar: vi.fn(),
}

const ENTRADA: EntradaLab = {
  tetoAtual: 420, teto: 420, sobra: 0, gasto: 410, alerta: 80, dias: 28,
  receitas: 5000, saldoMes: 1950, fechamentoBase: 2120, meta: DADOS.meta,
}
const LAB: LabVista = {
  envNome: 'Lazer', tetoAtual: 420, opcoes: opcoesTeto(420), sel: 420, entrada: ENTRADA,
  efeitos: efeitosTeto(ENTRADA), previa: null,
}

function props(mob: boolean, extra: Partial<OrcamentosViewProps> = {}): OrcamentosViewProps {
  const noop = vi.fn()
  return {
    d: DADOS, envs: ENVS, mob, filtro: 'todos', onFiltro: noop, previaId: null,
    fala: falaOrcamentos(ENVS, 28, 'outubro'), fontes: '6 orçamentos, 34 transações, receitas de outubro',
    aviso: '', destaqueId: null, captura: { catId: 'x', limite: '', alerta: '80' }, onCaptura: noop,
    onCriarInline: noop, onAbrir: noop, onNovo: noop, onFalar: noop, regraVisivel: true, onDispensarRegra: noop,
    desmarcados: new Set<string>(), onToggleCopia: noop, onCopiar: noop, copiando: false,
    lab: LAB, onTeto: noop, onAplicar: noop, onDesfazer: noop,
    ...extra,
  }
}

describe('OrcamentosView · desktop', () => {
  const out = html(<OrcamentosView {...props(false)} />)

  it('traz as peças do protótipo', () => {
    for (const c of ['titulo', 'cabrow', 'mes', 'sy', 'lnums', 'filtros', 'captura', 'envs', 'orc', 'barra', 'marca', 'quieta', 'lab', 'opcoes', 'imp', 'evid', 'aplicar', 'recibo']) {
      expect(out, c).toContain(c)
    }
    expect(out).toContain('class="captura boot b3"')
    expect(out).toContain('class="lnums boot b2"')
  })

  it('seis envelopes com estados pelo alerta de cada um', () => {
    expect(out.match(/role="button"/g)).toHaveLength(6)
    expect(out.match(/class="orc warn/g)).toHaveLength(2) // Lazer e Assinaturas
    expect(out).toContain('tag warn')
    expect(out).toContain('tag roll')
    const t = texto(out)
    expect(t).toContain('Rollover + R$ 50')
    expect(t).toContain('98% · sobram R$ 10,00 · 28 dias · alerta em 80%')
    expect(t).toContain('Lazer e Assinaturas passaram do alerta. Lazer tem R$ 10 para 28 dias.')
  })

  it('números, fora de envelope e 50-30-20', () => {
    const t = texto(out)
    expect(t).toContain('R$ 3.790')
    expect(t).toContain('R$ 2.860')
    expect(t).toContain('R$ 930')
    expect(t).toContain('R$ 1.210')
    expect(t).toContain('Fora de envelope em outubro: Investimento R$ 300,00')
    expect(t).toContain('Referência 50-30-20 sobre a renda de R$ 5.000')
  })

  it('laboratório com os três efeitos e a meta', () => {
    const t = texto(out)
    expect(t).toContain('E se o teto de Lazer fosse outro?')
    expect(t).toContain('Fechamento projetado')
    expect(t).toContain('Poupança do mês')
    expect(t).toContain('Para antecipar Viagem Itália')
    expect(t).toContain('De onde vêm esses efeitos?')
    expect(t).toContain('Experimentar nesta tela')
  })

  it('sem meta o efeito 02 some; sem laboratório a seção some', () => {
    const semMeta = html(<OrcamentosView {...props(false, { lab: { ...LAB, entrada: { ...ENTRADA, meta: null }, efeitos: efeitosTeto({ ...ENTRADA, meta: null }) } })} />)
    expect(semMeta).not.toContain('Para antecipar')
    expect(semMeta).toContain('Fechamento projetado')
    const semLab = html(<OrcamentosView {...props(false, { lab: null })} />)
    expect(semLab).not.toContain('class="lab')
  })

  it('palavras proibidas e travessão não aparecem', () => {
    expect(texto(out)).not.toMatch(PROIBIDAS)
  })
})

describe('OrcamentosView · mobile', () => {
  const out = html(<OrcamentosView {...props(true)} />)

  it('markup próprio: sem captura inline, com as mesmas peças', () => {
    expect(out).not.toContain('class="captura')
    expect(out).not.toContain('cabrow')
    for (const c of ['titulo', 'mes', 'lnums', 'filtros', 'envs', 'orc', 'barra', 'quieta', 'lab']) expect(out, c).toContain(c)
    expect(out.match(/role="button"/g)).toHaveLength(6)
    expect(texto(out)).not.toMatch(PROIBIDAS)
  })
})

describe('OrcamentosView · estados', () => {
  it('carregando mostra esqueleto, nunca vazio mudo', () => {
    const out = html(<OrcamentosView {...props(false, { d: { ...DADOS, loading: true }, envs: [] })} />)
    expect(out).toContain('sk-row')
    expect(out).not.toContain('lnums')
  })

  it('erro tem "Tentar de novo"', () => {
    const out = html(<OrcamentosView {...props(false, { d: { ...DADOS, erro: true }, envs: [] })} />)
    expect(texto(out)).toContain('Não consegui carregar os envelopes.')
    expect(texto(out)).toContain('Tentar de novo')
  })

  it('mês vazio oferece copiar do mês anterior com todos marcados', () => {
    const d: OrcamentosV5Data = {
      ...DADOS, mes: 11, mesNome: 'novembro', mesAntNome: 'outubro', mesProxNome: 'dezembro', envelopes: [],
      anteriores: ENVS.map(e => ({ id: e.id, categoriaId: e.categoriaId, categoria: e.categoria, limite: e.limiteBase })),
    }
    const out = html(<OrcamentosView {...props(false, { d, envs: [], lab: null })} />)
    const t = texto(out)
    expect(t).toContain('Nenhum envelope em novembro ainda')
    expect(t).toContain('Copiar 6 envelopes')
    expect(out.match(/type="checkbox"/g)).toHaveLength(6)
    expect(out.match(/checked=""/g)).toHaveLength(6)
  })

  it('orçamento maior que a renda deixa o não alocado negativo', () => {
    const out = html(<OrcamentosView {...props(false, { d: { ...DADOS, receitas: 3000 } })} />)
    expect(out).toContain('v num w')
    expect(texto(out)).toContain('– R$ 790')
    expect(texto(out)).toContain('Orçamento maior que a renda')
  })

  it('estourado ganha selo sólido', () => {
    const e = [env('3', 'Lazer', 470, 420, 80)]
    const out = html(<OrcamentosView {...props(false, { envs: e, d: { ...DADOS, envelopes: e }, lab: null })} />)
    expect(out).toContain('tag estourado')
    expect(texto(out)).toContain('112% · passou R$ 50,00')
  })
})

describe('PainelEnvelope', () => {
  const base = {
    open: true, abertura: 1, catInicial: 'x', categoriasLivres: DADOS.categoriasLivres, mesNome: 'outubro',
    mesAntNome: 'setembro', mesProxNome: 'novembro', mob: false, onClose: vi.fn(), onSalvar: vi.fn(), onExcluir: vi.fn(),
  }

  it('edição mostra limite base e sobra separados, categoria travada e excluir', () => {
    const out = html(<PainelEnvelope {...base} modo="editar" env={ENVS[4]} />)
    const t = texto(out)
    expect(t).toContain('Saúde')
    expect(t).toContain('Limite base')
    expect(out).toContain('value="250,00"') // o base, nunca o efetivo (300)
    expect(t).toContain('Sobra de setembro + R$ 50,00')
    expect(t).toContain('Limite em outubro R$ 300,00')
    expect(t).toContain('Fixa depois de criada')
    expect(t).toContain('Excluir')
    expect(out).toContain('orc-painel')
    expect(t).not.toMatch(PROIBIDAS)
  })

  it('novo envelope escolhe só entre categorias livres', () => {
    const out = html(<PainelEnvelope {...base} modo="novo" env={null} />)
    const t = texto(out)
    expect(t).toContain('Novo envelope')
    expect(t).toContain('Categoria sem envelope')
    expect(t).toContain('Investimento')
    expect(t).toContain('Impostos')
    expect(t).toContain('Criar envelope')
    expect(t).not.toContain('Excluir')
  })
})
