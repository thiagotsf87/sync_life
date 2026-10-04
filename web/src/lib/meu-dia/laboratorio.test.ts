import { describe, it, expect } from 'vitest'
import { cenariosJantar, type EntradaLaboratorio } from './laboratorio'

const NB = ' '

const mock: EntradaLaboratorio = {
  lazerRestante: 10,
  tetoLazer: 420,
  janelaMin: 150,
  eventoLazerHoje: { titulo: 'Jantar com Ana', hora: '20:00' },
  mediaJantarFora: 120,
  metaViagem: { nome: 'Viagem Itália', atual: 8600, alvo: 12700 },
}

describe('cenariosJantar', () => {
  it('mock: 3 cenários com custo, preparo e efeitos iguais ao SL_MOCK.lab', () => {
    const lab = cenariosJantar(mock)
    expect(lab).not.toBeNull()
    if (!lab) return
    expect(lab.titulo).toBe('E se o jantar de hoje fosse diferente?')
    expect(lab.pergunta).toBe('Jantar com Ana, hoje às 20:00.')
    expect(lab.cenarios).toHaveLength(3)

    const [fora, casa, simples] = lab.cenarios
    expect(fora.id).toBe('fora')
    expect(fora.custo).toBe(120)
    expect(fora.prep).toBe(0)
    expect(fora.efeitos.lazer).toBe(-110)
    expect(fora.efeitos.tempoLivreMin).toBe(150)
    expect(fora.efeitos.aporte).toBe(0)
    expect(fora.efeitos.metaPct).toBe(68)

    expect(casa.id).toBe('casa')
    expect(casa.custo).toBe(55)
    expect(casa.prep).toBe(50)
    expect(casa.efeitos.aporte).toBe(65)
    expect(casa.efeitos.lazer).toBe(-45)
    expect(casa.efeitos.tempoLivreMin).toBe(100)
    expect(casa.efeitos.metaPct).toBe(68)

    expect(simples.id).toBe('simples')
    expect(simples.custo).toBe(35)
    expect(simples.prep).toBe(20)
    expect(simples.efeitos.tempoLivreMin).toBe(130)
    expect(simples.efeitos.aporte).toBe(85)
    expect(simples.efeitos.lazer).toBe(-25)
    expect(simples.efeitos.metaPct).toBe(68)
  })

  it('copy segue a do protótipo (SL_MOCK.lab), sem rotular o melhor cenário', () => {
    const lab = cenariosJantar(mock)
    if (!lab) throw new Error('esperava laboratório')
    const [fora, casa, simples] = lab.cenarios
    expect(fora.nome).toBe('Sair para jantar')
    expect(fora.copy).toBe(
      'Você preserva a janela livre e sai para jantar. <b>O lazer do mês estoura</b>, e isso é uma escolha legítima: a experiência pode valer o gasto. Sy só mostra o efeito.',
    )
    expect(casa.nome).toBe('Cozinhar em casa')
    expect(casa.copy).toBe(
      `Você troca <b>50 minutos</b> da janela por <b>R$${NB}65</b> de diferença. O lazer ainda passa do teto, mas por pouco, e a diferença poderia ir para a Viagem Itália, se essa for a prioridade.`,
    )
    expect(simples.nome).toBe('Fazer algo simples')
    expect(simples.copy).toBe(
      `A opção de menor custo, com <b>20 minutos</b> de preparo. Você preserva <b>2h10</b> livres e <b>R$${NB}85</b> que poderiam ir para outra prioridade.`,
    )
    for (const c of lab.cenarios) {
      expect(c.copy).not.toMatch(/melhor|ideal|recomend/i)
      expect(c.copy).not.toContain(String.fromCharCode(0x2014))
    }
  })

  it('rótulos de agenda da prévia batem com o protótipo', () => {
    const lab = cenariosJantar(mock)
    if (!lab) throw new Error('esperava laboratório')
    expect(lab.cenarios.map((c) => c.agenda)).toEqual(['Jantar com Ana', 'Jantar em casa com Ana', 'Jantar simples com Ana'])
    expect(lab.cenarios.map((c) => c.agendaSub)).toEqual(['fora', 'em casa', 'simples'])
  })

  it('a copy do cenário casa muda quando o lazer fica dentro do teto', () => {
    const lab = cenariosJantar({ ...mock, lazerRestante: 300 })
    if (!lab) throw new Error('esperava laboratório')
    expect(lab.cenarios[1].efeitos.lazer).toBe(245)
    expect(lab.cenarios[1].copy).toContain('O lazer fica dentro do teto')
    expect(lab.cenarios[0].copy).not.toContain('estoura')
  })

  it('sem evento de lazer hoje devolve null', () => {
    expect(cenariosJantar({ ...mock, eventoLazerHoje: null })).toBeNull()
  })

  it('sem orçamento de lazer (teto <= 0) devolve null', () => {
    expect(cenariosJantar({ ...mock, tetoLazer: 0 })).toBeNull()
    expect(cenariosJantar({ ...mock, tetoLazer: -5 })).toBeNull()
  })

  it('sem média de jantar fora usa 120 como padrão; média real substitui', () => {
    expect(cenariosJantar({ ...mock, mediaJantarFora: null })?.cenarios[0].custo).toBe(120)
    const lab = cenariosJantar({ ...mock, mediaJantarFora: 90.4 })
    expect(lab?.cenarios[0].custo).toBe(90)
    expect(lab?.cenarios[1].efeitos.aporte).toBe(35)
  })

  it('sem meta de viagem o aporte continua, metaPct vira null e a copy não cita destino', () => {
    const lab = cenariosJantar({ ...mock, metaViagem: null })
    if (!lab) throw new Error('esperava laboratório')
    expect(lab.cenarios[1].efeitos.aporte).toBe(65)
    expect(lab.cenarios[1].efeitos.metaPct).toBeNull()
    expect(lab.cenarios[1].copy).not.toContain('Itália')
    expect(lab.cenarios[1].copy).toContain('outra prioridade')
  })

  it('meta com alvo zero não divide por zero', () => {
    const lab = cenariosJantar({ ...mock, metaViagem: { nome: 'X', atual: 0, alvo: 0 } })
    expect(lab?.cenarios[0].efeitos.metaPct).toBeNull()
  })
})
