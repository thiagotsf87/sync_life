// Dados mockados do DS v5 (Onda 0+). Fonte única de todos os protótipos v5.
// Ancorado em SEXTA, 3 DE OUTUBRO DE 2026 (Fase 0 do rollout sem metáfora, 2026-10-03). Antes era julho.
// Evolução de prototypes/poc-v5/shared/mock-data.js com a numeração CANÔNICA (§5.2 do DS):
// as 8 áreas são pontos cardeais da bússola; Panorama/Conquistas/Configurações não são áreas.
window.SL_MOCK = {
  score: { value: 78, delta: 3, label: 'Life Sync Score' }, // global vem do engine (ponderado), não é média das dims

  // ordem canônica das áreas (LEI, §5.2): 01 Finanças no norte, horário até 08 Experiências
  areas: [
    { n: '01', nome: 'Finanças', foco: 'segurar o lazer até sexta' },
    { n: '02', nome: 'Futuro', foco: 'antecipar o aporte da Itália' },
    { n: '03', nome: 'Tempo', foco: 'proteger o bloco de foco de amanhã' },
    { n: '04', nome: 'Corpo', foco: 'hoje é dia de treino, 3 de 7 na semana' },
    { n: '05', nome: 'Mente', foco: '20 minutos de leitura antes de dormir' },
    { n: '06', nome: 'Patrimônio', foco: 'reinvestir os proventos de setembro' },
    { n: '07', nome: 'Carreira', foco: 'preparar a 1:1 de terça' },
    { n: '08', nome: 'Experiências', foco: 'fechar o roteiro de Positano' },
  ],
  // telas que não são áreas da bússola (não entram na numeração 01-08)
  extras: ['Panorama', 'Coach IA', 'Conquistas', 'Configurações'],

  // áreas que o usuário ativou no onboarding (fonte: profiles.active_modules)
  ativas: ['01', '02', '04', '08'],

  diario: {
    edicao: 208,
    saudacao: 'Boa tarde, Thiago.',
    sub: 'Outubro está 83% executado e a poupança segue acima da meta. Uma única atenção hoje: o lazer chegou perto do teto.',
    checkin: {
      done: false,
      opcoes: ['Péssimo', 'Ruim', 'Neutro', 'Bem', 'Ótimo'],
      doneAs: 'Registrado às 21:14',
      doneMood: 'Bem',
      doneNote: 'Dia produtivo, treino feito.',
    },
    // t = hora OU valor (money:true); due = vence em até 3 dias
    hoje: [
      { t: '07:30', tx: 'Fisioterapia' },
      { t: 'R$ 1.200,00', tx: 'Aluguel', tag: 'EM 3 DIAS', due: true, money: true },
      { t: 'TER 10:00', tx: '1:1 com gestor' },
      { t: 'R$ 580,00', tx: 'Aporte automático', tag: 'QUA', money: true },
      { t: 'SEX 20:00', tx: 'Jantar com Ana' },
      { t: 'R$ 89,90', tx: 'Internet', tag: 'EM 5 DIAS', money: true },
    ],
  },

  // scores por área (ordem canônica; ativas ganham linha rica no Diário; manter n/nome em sincronia com areas)
  dims: [
    { n: '01', nome: 'Finanças',     meta: 'Saldo R$ 1.840 · lazer no limite', score: 83, tr: 2 },
    { n: '02', nome: 'Futuro',       meta: '3 metas · 61% de média',           score: 79, tr: 1 },
    { n: '03', nome: 'Tempo',        meta: '9 eventos · 5/7 dias com foco',    score: 71, tr: 0 },
    { n: '04', nome: 'Corpo',        meta: '3 atividades · 126 min',           score: 69, tr: 3 },
    { n: '05', nome: 'Mente',        meta: '2 sessões de leitura',             score: 58, tr: -1 },
    { n: '06', nome: 'Patrimônio',   meta: 'R$ 48,2k · +7% no ano',            score: 76, tr: 1 },
    { n: '07', nome: 'Carreira',     meta: 'Roadmap 3/5 marcos',               score: 69, tr: 1 },
    { n: '08', nome: 'Experiências', meta: 'Itália em 92 dias',                score: 78, tr: 0 },
  ],

  // A edição da semana (review semanal): dados da semana fechada
  semana: {
    numero: 40,
    inicio: '29 de setembro',
    fim: '5 de outubro',
    scoreFim: 78,
    scoreInicio: 75,
    fechada: false,
    fechadaEm: 'domingo, 5 de outubro, às 21:30',
    nums: { entradas: 1850, saidas: 940, eventosFeitos: 11, eventosTotal: 14, focoHoras: '6h30' },
    // variação por área ativa na semana (de → para; bate com dims)
    mudou: [
      { n: '01', nome: 'Finanças',     de: 80, para: 83 },
      { n: '02', nome: 'Futuro',       de: 75, para: 79 },
      { n: '04', nome: 'Corpo',        de: 70, para: 69 },
      { n: '08', nome: 'Experiências', de: 74, para: 78 },
    ],
    carta: {
      headline: 'A semana virou no meio: o que travou na segunda destravou na quinta.',
      p1: 'Você fechou a semana com R$ 1.850 de entradas contra R$ 940 de saídas, o melhor saldo semanal de outubro. O lazer chegou perto do teto de novo, mas dessa vez você segurou: foram R$ 128 em quatro dias, contra R$ 310 na semana anterior.',
      p2: 'Na agenda, 11 dos 14 compromissos saíram e você protegeu 6h30 de foco, uma hora a mais que na semana passada. Corpo foi o único ponto que recuou: dois treinos previstos ficaram para trás e o peso não foi registrado.',
      hand: 'segunda-feira começa com o treino que sobrou!',
      basedOn: '12 transações, 14 compromissos e 3 metas',
      assinatura: 'Atualizado no domingo, 5 de outubro, às 20:10',
    },
  },

  // A anatomia do número (life score): composição real do motor
  scoreDetalhe: {
    total: 78,
    label: 'Consistente',
    deltaSemana: 3,
    calculadoEm: 'hoje, às 14:05',
    // 30 dias, mais antigo primeiro (determinístico, sem random)
    historico: [68, 69, 69, 70, 70, 71, 71, 70, 72, 72, 73, 73, 72, 74, 74, 75, 75, 74, 75, 76, 76, 75, 75, 77, 77, 76, 77, 77, 78, 78],
    areas: [
      { n: '01', nome: 'Finanças', score: 83, peso: 20, contrib: 27.7, componentes: [
        { nome: 'Orçamento do mês', peso: 40, valor: 90 },
        { nome: 'Registro de transações', peso: 30, valor: 75 },
        { nome: 'Tendência de saldo', peso: 30, valor: 80 },
      ] },
      { n: '02', nome: 'Futuro', score: 79, peso: 20, contrib: 26.3, componentes: [
        { nome: 'Progresso dos objetivos', peso: 50, valor: 88 },
        { nome: 'Objetivos concluídos no trimestre', peso: 50, valor: 70 },
      ] },
      { n: '04', nome: 'Corpo', score: 69, peso: 15, contrib: 17.3, componentes: [
        { nome: 'Atividades da semana', peso: 30, valor: 75 },
        { nome: 'Consulta agendada', peso: 30, valor: 80 },
        { nome: 'Registros de peso', peso: 20, valor: 50 },
        { nome: 'Hidratação', peso: 20, valor: 60 },
      ] },
      { n: '08', nome: 'Experiências', score: 78, peso: 5, contrib: 6.5, componentes: [
        { nome: 'Viagens planejadas e feitas', peso: 60, valor: 90 },
        { nome: 'Bucket list', peso: 40, valor: 60 },
      ] },
    ],
    // áreas desligadas no onboarding: entram na linha quieta, sem score
    inativas: ['03 Tempo', '05 Mente', '06 Patrimônio', '07 Carreira'],
    melhorias: [
      { titulo: 'Registrar o peso desta semana', detalhe: 'O registro de peso vale 20% do score de Corpo e está pela metade.', onde: 'Corpo' },
      { titulo: 'Fechar a meta de água de hoje', detalhe: 'Hidratação vale outros 20% de Corpo e está em 60.', onde: 'Corpo' },
      { titulo: 'Concluir um objetivo do trimestre', detalhe: 'Objetivos concluídos valem metade do score de Futuro, a área de maior peso junto com Finanças.', onde: 'Futuro' },
    ],
  },

  financas: {
    receitas: 5000, despesas: 3160, saldoLivre: 1840,
    poupancaPct: 37, metaPoupancaPct: 30,
    sparkSaldo: [42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78],
  },
  transacoes: [
    { d: '3 out', desc: 'Mercado Central', cat: 'Mercado', valor: -182.4 },
    { d: '2 out', desc: 'Freela landing page', cat: 'Renda extra', valor: 850 },
    { d: '2 out', desc: 'Aporte CDB', cat: 'Investimento', valor: -300 },
    { d: '1 out', desc: 'Farmácia', cat: 'Saúde', valor: -64.9 },
    { d: '30 set', desc: 'Salário', cat: 'Renda', valor: 4150 },
    { d: '29 set', desc: 'Restaurante japonês', cat: 'Lazer', valor: -128 },
    { d: '28 set', desc: 'Uber', cat: 'Transporte', valor: -24.9 },
    { d: '28 set', desc: 'Livraria', cat: 'Lazer', valor: -59.9 },
  ],
  gastosPorCategoria: [
    { nome: 'Moradia', valor: 1240 },
    { nome: 'Mercado', valor: 520 },
    { nome: 'Lazer', valor: 410 },
    { nome: 'Transporte', valor: 310 },
    { nome: 'Saúde', valor: 180 },
  ],
  orcamentos: [
    { nome: 'Moradia', gasto: 1240, limite: 1800 },
    { nome: 'Mercado', gasto: 520, limite: 650 },
    { nome: 'Lazer', gasto: 410, limite: 420 },
  ],
  agenda: [
    { hora: '09:00', titulo: 'Revisão de aportes', modulo: 'Finanças' },
    { hora: '12:30', titulo: 'Treino B, inferior', modulo: 'Corpo' },
    { hora: '19:00', titulo: 'Aula de espanhol', modulo: 'Mente' },
  ],
  coach: {
    briefing: 'Outubro está 4 pontos acima de setembro. As manhãs protegidas seguraram o foco, o aporte antecipado rendeu antes da média e o único ponto solto é o orçamento de lazer, que passou do limite por R$ 8. Um ajuste pequeno hoje evita um corte grande na semana que vem.',
    cross: 'Semanas com foco protegido renderam R$ 380 a mais em aportes.',
    acoes: [
      { titulo: 'Revisar o orçamento de lazer', modulo: 'Finanças', impacto: 'fecha o mês em 39% poupado' },
      { titulo: 'Confirmar o treino de amanhã', modulo: 'Corpo', impacto: 'mantém a sequência de 3 semanas' },
      { titulo: 'Bloquear 2h de foco na sexta', modulo: 'Tempo', impacto: 'historicamente vale R$ 380 em aportes' },
    ],
    whispers: [
      { hora: '07:12', texto: 'Briefing do dia enviado.' },
      { hora: 'ontem', texto: 'Aporte de R$ 300 confirmado, 2 dias antes do planejado.' },
      { hora: 'seg', texto: 'Semana começou com as manhãs livres de reunião. Bom sinal.' },
    ],
    saudacaoCamada: 'Já li o seu dia. O que você quer saber?',
    sugestoes: [
      'Quanto ainda posso gastar em lazer?',
      'Resumo da minha semana',
      'Simular: e se eu poupar R$ 800?',
    ],
    thread: [
      { de: 'u', msg: 'Quanto ainda posso gastar em lazer esse mês?' },
      { de: 'a', msg: 'Quase nada: R$ 10 até quinta. Você usou R$ 410 dos R$ 420 do orçamento, e o cinema de ontem (R$ 64) foi o que encostou no teto. A boa notícia: o fechamento projeta R$ 2.120.', fontes: 'Fontes: orçamento Lazer · 34 transações · projeção do mês' },
      { de: 'u', msg: 'Então antecipa o aporte da Itália pra hoje.' },
      { de: 'acao', msg: 'Transferência de R$ 580 pra Viagem Itália agendada pra hoje, 16:00. A meta vai a 70% e o saldo projetado segue positivo em R$ 1.540.', done: 'Confirmado por você · 14:04' },
    ],
  },
  // Laboratório de Meu dia (uma escolha, mais de um efeito): config de shared/lab.js, igual no desktop e no mobile.
  // Números batem com orcamentos (Lazer 410 de 420), diario.hoje (jantar sex 20h) e a meta Viagem Itália (8.600 de 12.700).
  lab: {
    consts: { lazer: 10, teto: 420, janela: 150, dia: 480, segJanela: 4, fora: 120, ita: 8600, itaMeta: 12700 },
    inicial: 'fora',
    cenarios: {
      fora:    { nome: 'Sair para jantar',  ag: 'Jantar com Ana', agSub: 'fora', custo: 120, prep: 0,
        copy: 'Você preserva a janela livre e sai para jantar. <b>O lazer do mês estoura</b>, e isso é uma escolha legítima: a experiência pode valer o gasto. Sy só mostra o efeito.' },
      casa:    { nome: 'Cozinhar em casa',  ag: 'Jantar em casa com Ana', agSub: 'em casa', custo: 55, prep: 50,
        copy: 'Você troca <b>50 minutos</b> da janela por <b>R$ 65</b> de diferença. O lazer ainda passa do teto, mas por pouco, e a diferença poderia ir para a Itália, se essa for a prioridade.' },
      simples: { nome: 'Fazer algo simples', ag: 'Jantar simples com Ana', agSub: 'simples', custo: 35, prep: 20,
        copy: 'A opção de menor custo, com <b>20 minutos</b> de preparo. Você preserva <b>2h10</b> livres e <b>R$ 85</b> que poderiam ir para outra prioridade.' },
    },
    textos: {
      semPressa: 'Sem pressa', comPreparo: 'Com preparo',
      livre: 'Espaço livre', livreComPreparo: 'Espaço livre + preparo do jantar',
      recibo: 'entrou na prévia do seu dia. Nenhuma conta ou agenda foi alterada.',
    },
    ritmo: {
      lento:   '<b>Seu ritmo foi ouvido.</b> Nenhuma atividade extra entra nas sugestões de hoje. Você pode comparar as opções sem assumir mais um compromisso.',
      normal:  '<b>O dia pode seguir assim.</b> Explore uma mudança só se ela fizer sentido para você.',
      energia: '<b>Energia não precisa virar obrigação.</b> A janela livre continua disponível para o que você escolher.',
    },
    acordo: {
      pedir:  '<b>Sy fica disponível.</b> Seu dia abre direto, sem apresentação, e nada chega sem você pedir.',
      mudar:  '<b>Exemplo de gatilho:</b> um compromisso novo elimina a sua janela livre, ou o lazer passa do teto. Mudanças pequenas aguardam.',
      resumo: '<b>Um resumo por dia,</b> no horário que você escolher nas configurações. Sempre com a opção de pular.',
    },
  },

  fmtBRL(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  fmtBRL0(n) { return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
};
