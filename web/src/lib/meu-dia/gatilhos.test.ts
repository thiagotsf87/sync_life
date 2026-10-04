import { describe, it, expect } from 'vitest'
import { montarItens, type EntradaGatilhos } from './gatilhos'

const NB = ' '

const vazio: EntradaGatilhos = {
  ativas: ['01', '02', '04', '08'],
  intencoesEmAberto: [],
  orcamentos: [],
  contas: [],
  metas: [],
  eventosHoje: [],
  areas: [],
  proximaAcao: null,
}

const mock: EntradaGatilhos = {
  ativas: ['01', '02', '04', '08'],
  intencoesEmAberto: [
    {
      id: 'int-1',
      texto: 'A proposta do curso de inglês',
      areas: ['05', '03', '01', '07', '02'],
      valorTexto: 'R$ 180/mês',
    },
  ],
  orcamentos: [
    { categoria: 'Lazer', gasto: 410, limite: 420, pct: 98 },
    { categoria: 'Mercado', gasto: 300, limite: 900, pct: 33 },
  ],
  contas: [
    { nome: 'Aluguel', valor: 1200, diasRestantes: 3 },
    { nome: 'Internet', valor: 120, diasRestantes: 12 },
  ],
  metas: [{ nome: 'Viagem Itália', diasParaPrazo: 92 }],
  eventosHoje: [
    { titulo: 'Fisioterapia', hora: '07:30', tipo: 'saude' },
    { titulo: 'Bloco de foco', hora: '15:00', tipo: 'pessoal' },
    { titulo: 'Jantar com Ana', hora: '20:00', tipo: 'lazer' },
  ],
  areas: [
    { n: '01', nome: 'Finanças', tendencia: 2 },
    { n: '02', nome: 'Futuro', tendencia: 1 },
    { n: '04', nome: 'Corpo', tendencia: 3 },
    { n: '08', nome: 'Experiências', tendencia: 0 },
  ],
  proximaAcao: { titulo: 'Segure o lazer até sexta', detalhe: 'e o mês fecha redondo' },
}

describe('montarItens', () => {
  it('cenário do mock: 4 itens na ordem intenção, lazer (warn), aluguel, fisioterapia', () => {
    const itens = montarItens(mock)
    expect(itens).toHaveLength(4)
    expect(itens.map((i) => i.prioridade)).toEqual([1, 2, 2, 3])

    const [intencao, lazer, aluguel, fisio] = itens

    expect(intencao.destaque).toBe('A proposta do curso de inglês')
    expect(intencao.titulo).toBe('continua em aberto')
    expect(intencao.area).toBe('05')
    expect(intencao.valor).toBe('R$ 180/mês')
    expect(intencao.acao).toEqual({ tipo: 'decidir', rotulo: 'Decidir' })
    expect(intencao.tom).toBe('normal')

    expect(lazer.destaque).toBe('Lazer')
    expect(lazer.titulo).toContain('encostou no teto')
    expect(lazer.titulo).toContain(`R$${NB}10,00`)
    expect(lazer.sub).toContain('98%')
    // máscara do protótipo: par gasto/limite sem centavos
    expect(lazer.valor).toBe(`R$${NB}410 de R$${NB}420`)
    expect(lazer.area).toBe('01')
    expect(lazer.tom).toBe('warn')
    expect(lazer.acao).toEqual({ tipo: 'link', href: '/financas#orcamentos', rotulo: 'Ver orçamento' })

    expect(aluguel.destaque).toBe('Aluguel')
    expect(aluguel.titulo).toBe('vence em 3 dias')
    expect(aluguel.valor).toBe(`R$${NB}1.200,00`)
    expect(aluguel.area).toBe('01')
    expect(aluguel.tom).toBe('normal')
    expect(aluguel.acao).toEqual({ tipo: 'link', href: '/financas#recorrentes', rotulo: 'Ver recorrentes' })

    expect(fisio.destaque).toBe('Fisioterapia')
    expect(fisio.titulo).toBe('hoje às 07:30')
    expect(fisio.area).toBe('04')
    expect(fisio.valor).toBe('07:30')
    expect(fisio.acao).toEqual({ tipo: 'link', href: '/tempo', rotulo: 'Ver agenda' })
  })

  it('nunca passa de 4 itens e a prioridade 4 entra quando sobra espaço', () => {
    const itens = montarItens({ ...mock, intencoesEmAberto: [] })
    expect(itens).toHaveLength(4)
    expect(itens.map((i) => i.prioridade)).toEqual([2, 2, 3, 4])
    const mudanca = itens[3]
    expect(mudanca.titulo).toBe('3 das 4 áreas subiram')
    expect(mudanca.sub).toBe('Só Experiências ficou parada')
    expect(mudanca.area).toBe('04')
    expect(mudanca.acao).toEqual({ tipo: 'link', href: '/dashboard/score', rotulo: 'Ver o número' })
  })

  it('prioridade 5 só quando nada acima preencheu e há próxima ação', () => {
    const itens = montarItens({ ...vazio, proximaAcao: mock.proximaAcao })
    expect(itens).toHaveLength(1)
    expect(itens[0].prioridade).toBe(5)
    expect(itens[0].destaque).toBe('Segure o lazer até sexta')
    expect(itens[0].titulo).toBe('e o mês fecha redondo')
    expect(itens[0].acao).toEqual({ tipo: 'link', href: '/coach', rotulo: 'Falar com Sy' })
  })

  it('cenário vazio: 1 item "Nada pede você hoje" com âncora #checkin', () => {
    const itens = montarItens(vazio)
    expect(itens).toHaveLength(1)
    expect(itens[0]).toMatchObject({
      prioridade: 5,
      destaque: '',
      titulo: 'Nada pede você hoje',
      sub: 'Como foi o dia?',
      valor: '',
      acao: { tipo: 'ancora', href: '#checkin', rotulo: 'Registrar o dia' },
      tom: 'normal',
    })
  })

  it('área inativa não gera item nos gatilhos 2 a 5', () => {
    const itens = montarItens({
      ...vazio,
      ativas: ['04'],
      orcamentos: [{ categoria: 'Lazer', gasto: 410, limite: 420, pct: 98 }],
      contas: [{ nome: 'Aluguel', valor: 1200, diasRestantes: 1 }],
      metas: [{ nome: 'Curso', diasParaPrazo: 2 }],
      eventosHoje: [{ titulo: 'Entrevista', hora: '10:00', tipo: 'trabalho' }],
      areas: [{ n: '01', nome: 'Finanças', tendencia: 2 }],
    })
    expect(itens).toHaveLength(1)
    expect(itens[0].titulo).toBe('Nada pede você hoje')
  })

  it('sem nenhuma área ativa a próxima ação (gatilho 5) não dispara', () => {
    const itens = montarItens({ ...vazio, ativas: [], proximaAcao: { titulo: 'x', detalhe: 'y' } })
    expect(itens[0].titulo).toBe('Nada pede você hoje')
  })

  it('intenção em aberto vale para qualquer área, mesmo inativa', () => {
    const itens = montarItens({ ...vazio, ativas: [], intencoesEmAberto: mock.intencoesEmAberto })
    expect(itens).toHaveLength(1)
    expect(itens[0].prioridade).toBe(1)
  })

  it('limiares: orçamento 85% não dispara, conta em 4 dias não dispara, meta em 8 dias não dispara', () => {
    const itens = montarItens({
      ...vazio,
      orcamentos: [{ categoria: 'Lazer', gasto: 357, limite: 420, pct: 85 }],
      contas: [{ nome: 'Luz', valor: 200, diasRestantes: 4 }],
      metas: [{ nome: 'Curso', diasParaPrazo: 8 }, { nome: 'Sem prazo', diasParaPrazo: null }],
    })
    expect(itens).toHaveLength(1)
    expect(itens[0].titulo).toBe('Nada pede você hoje')
  })

  it('meta com prazo em 7 dias dispara como prioridade 2 na área 02', () => {
    const itens = montarItens({ ...vazio, metas: [{ nome: 'Reserva', diasParaPrazo: 7 }] })
    expect(itens[0]).toMatchObject({ prioridade: 2, area: '02', destaque: 'Reserva', titulo: 'vence em 7 dias' })
    expect(itens[0].acao).toEqual({ tipo: 'link', href: '/futuro', rotulo: 'Ver meta' })
  })

  it('conta que vence hoje e meta vencida usam copy singular correta', () => {
    const itens = montarItens({
      ...vazio,
      contas: [{ nome: 'Luz', valor: 200, diasRestantes: 0 }],
      metas: [{ nome: 'Curso', diasParaPrazo: 1 }],
    })
    expect(itens[0].titulo).toBe('vence hoje')
    expect(itens[1].titulo).toBe('vence amanhã')
  })

  it('dentro da mesma prioridade 2, orçamentos vêm por pct, contas por prazo, metas por prazo', () => {
    const itens = montarItens({
      ...vazio,
      orcamentos: [
        { categoria: 'Mercado', gasto: 880, limite: 1000, pct: 88 },
        { categoria: 'Lazer', gasto: 410, limite: 420, pct: 98 },
      ],
      contas: [
        { nome: 'Internet', valor: 120, diasRestantes: 3 },
        { nome: 'Aluguel', valor: 1200, diasRestantes: 1 },
      ],
    })
    expect(itens.map((i) => i.destaque)).toEqual(['Lazer', 'Mercado', 'Aluguel', 'Internet'])
  })

  it('evento por título (consulta, entrevista, prova, voo, fisio) dispara mesmo com tipo genérico', () => {
    const itens = montarItens({
      ...vazio,
      ativas: ['03'],
      eventosHoje: [{ titulo: 'Voo para Roma', hora: null, tipo: 'pessoal' }],
    })
    expect(itens[0]).toMatchObject({ prioridade: 3, area: '03', destaque: 'Voo para Roma', titulo: 'hoje', valor: '' })
  })

  it('evento de trabalho vai para a área 03, evento de saúde para a 04; só um evento por gatilho', () => {
    const itens = montarItens({
      ...vazio,
      ativas: ['03', '04'],
      eventosHoje: [
        { titulo: 'Reunião', hora: '14:00', tipo: 'trabalho' },
        { titulo: 'Consulta', hora: '09:00', tipo: 'saude' },
      ],
    })
    expect(itens.filter((i) => i.prioridade === 3)).toHaveLength(1)
    // o mais cedo vence
    expect(itens[0]).toMatchObject({ area: '04', destaque: 'Consulta' })

    const trabalho = montarItens({ ...vazio, ativas: ['03'], eventosHoje: [{ titulo: 'Reunião', hora: '14:00', tipo: 'trabalho' }] })
    expect(trabalho[0]).toMatchObject({ prioridade: 3, area: '03' })
  })

  it('mudança agregada: só áreas ativas com tendência, singular quando é uma, "caíram" quando só caem', () => {
    const umaSubiu = montarItens({
      ...vazio,
      ativas: ['01', '02'],
      areas: [
        { n: '01', nome: 'Finanças', tendencia: 2 },
        { n: '02', nome: 'Futuro', tendencia: 0 },
        { n: '05', nome: 'Mente', tendencia: 4 },
      ],
    })
    expect(umaSubiu[0]).toMatchObject({ prioridade: 4, titulo: '1 das 2 áreas subiu', area: '01' })

    const cairam = montarItens({
      ...vazio,
      ativas: ['01', '02'],
      areas: [
        { n: '01', nome: 'Finanças', tendencia: -2 },
        { n: '02', nome: 'Futuro', tendencia: -1 },
      ],
    })
    expect(cairam[0]).toMatchObject({ prioridade: 4, titulo: '2 das 2 áreas caíram', tom: 'warn' })

    const mistas = montarItens({
      ...vazio,
      ativas: ['01', '02', '04'],
      areas: [
        { n: '01', nome: 'Finanças', tendencia: 2 },
        { n: '02', nome: 'Futuro', tendencia: -1 },
        { n: '04', nome: 'Corpo', tendencia: 0 },
      ],
    })
    expect(mistas[0].titulo).toBe('1 das 3 áreas subiu')
    expect(mistas[0].sub).toBe('Futuro caiu · Corpo ficou parada')
  })

  it('sem tendência em nenhuma área a prioridade 4 não dispara', () => {
    const itens = montarItens({ ...vazio, areas: [{ n: '01', nome: 'Finanças', tendencia: 0 }] })
    expect(itens[0].titulo).toBe('Nada pede você hoje')
  })

  it('o título é HTML-safe: caracteres especiais vêm escapados', () => {
    const itens = montarItens({
      ...vazio,
      intencoesEmAberto: [{ id: 'x', texto: 'Curso <b>Inglês</b> & "cia"', areas: ['05'] }],
    })
    expect(itens[0].destaque).toBe('Curso &lt;b&gt;Inglês&lt;/b&gt; &amp; &quot;cia&quot;')
  })

  it('nenhum texto gerado contém em-dash', () => {
    const tudo = [...montarItens(mock), ...montarItens(vazio), ...montarItens({ ...mock, intencoesEmAberto: [] })]
    for (const i of tudo) {
      expect(i.titulo + i.sub + i.valor + i.acao.rotulo).not.toContain(String.fromCharCode(0x2014))
    }
  })
})
