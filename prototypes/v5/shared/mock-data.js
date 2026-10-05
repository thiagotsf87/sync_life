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

// ── Fase 2 · Finanças, subtelas (gerado por um script; números coerentes com financas/orcamentos/transacoes acima) ──
window.SL_MOCK.fin = {
 "contas": [
  {
   "id": "c1",
   "nome": "Nubank",
   "tipo": "conta corrente"
  },
  {
   "id": "c2",
   "nome": "Inter",
   "tipo": "conta corrente"
  },
  {
   "id": "c3",
   "nome": "Carteira",
   "tipo": "dinheiro"
  }
 ],
 "recorrentes": {
  "itens": [
   {
    "id": "r1",
    "nome": "Salário",
    "tipo": "in",
    "valor": 4150,
    "freq": "mensal",
    "dia": 30,
    "cat": "Renda",
    "inicio": "2024-03-30",
    "prox": "2026-10-30",
    "mensal": 4150.0
   },
   {
    "id": "r2",
    "nome": "Aluguel",
    "tipo": "out",
    "valor": 1200,
    "freq": "mensal",
    "dia": 6,
    "cat": "Moradia",
    "inicio": "2025-02-06",
    "prox": "2026-10-06",
    "mensal": 1200.0
   },
   {
    "id": "r3",
    "nome": "Aporte automático",
    "tipo": "out",
    "valor": 580,
    "freq": "mensal",
    "dia": 8,
    "cat": "Investimento",
    "inicio": "2026-01-08",
    "prox": "2026-10-08",
    "nota": "vai para a meta Viagem Itália",
    "mensal": 580.0
   },
   {
    "id": "r4",
    "nome": "Internet",
    "tipo": "out",
    "valor": 89.9,
    "freq": "mensal",
    "dia": 8,
    "cat": "Assinaturas",
    "inicio": "2025-06-08",
    "prox": "2026-10-08",
    "mensal": 89.9
   },
   {
    "id": "r5",
    "nome": "Streaming",
    "tipo": "out",
    "valor": 55.9,
    "freq": "mensal",
    "dia": 12,
    "cat": "Assinaturas",
    "inicio": "2025-01-12",
    "prox": "2026-10-12",
    "mensal": 55.9
   },
   {
    "id": "r6",
    "nome": "Academia",
    "tipo": "out",
    "valor": 119.9,
    "freq": "mensal",
    "dia": 15,
    "cat": "Saúde",
    "inicio": "2026-02-15",
    "prox": "2026-10-15",
    "mensal": 119.9
   },
   {
    "id": "r7",
    "nome": "Faxina",
    "tipo": "out",
    "valor": 180,
    "freq": "quinzenal",
    "dia": null,
    "cat": "Moradia",
    "inicio": "2026-03-03",
    "prox": "2026-10-14",
    "mensal": 390.6
   },
   {
    "id": "r8",
    "nome": "Seguro do carro",
    "tipo": "out",
    "valor": 1680,
    "freq": "anual",
    "dia": 10,
    "cat": "Transporte",
    "inicio": "2026-03-10",
    "prox": "2027-03-10",
    "mensal": 140.0
   },
   {
    "id": "r9",
    "nome": "Contador do MEI",
    "tipo": "out",
    "valor": 240,
    "freq": "trimestral",
    "dia": 20,
    "cat": "Impostos",
    "inicio": "2026-01-20",
    "prox": "2026-10-20",
    "mensal": 80.0
   },
   {
    "id": "r10",
    "nome": "App de idiomas",
    "tipo": "out",
    "valor": 39.9,
    "freq": "mensal",
    "dia": 22,
    "cat": "Assinaturas",
    "inicio": "2025-09-22",
    "prox": null,
    "pausada": true,
    "mensal": 39.9
   }
  ],
  "totais": {
   "saidaMensal": 2656.3,
   "entradaMensal": 4150.0,
   "liquido": 1493.7,
   "custoAnual": 31875.6,
   "comprometidoPct": 53,
   "base": "profiles.monthly_income (R$ 5.000)"
  },
  "ativas": 9,
  "pausadas": 1,
  "limiteFree": 5,
  "plano": "PRO",
  "regra": "normalização mensal: semanal ×4,33 · quinzenal ×2,17 · trimestral ÷3 · anual ÷12; aviso quando faltam 7 dias ou menos"
 },
 "planejamento": {
  "saldoHoje": 1840,
  "meses": [
   "out/26",
   "nov/26",
   "dez/26",
   "jan/27",
   "fev/27",
   "mar/27",
   "abr/27",
   "mai/27",
   "jun/27",
   "jul/27",
   "ago/27",
   "set/27",
   "out/27"
  ],
  "projecao": {
   "realista": [
    2120,
    5628,
    8237,
    4781,
    5234,
    488,
    1682,
    3116,
    4549,
    5743,
    7177,
    8610,
    9804
   ],
   "otimista": [
    4340,
    10268,
    15297,
    14333,
    17206,
    15384,
    19069,
    22923,
    26777,
    30462,
    34316,
    38169,
    41855
   ],
   "pessimista": [
    -100,
    988,
    1177,
    -4771,
    -6737,
    -14407,
    -15706,
    -16692,
    -17678,
    -18976,
    -19962,
    -20948,
    -22247
   ]
  },
  "eventos": [
   {
    "id": "p8",
    "nome": "Revisão do carro",
    "tipo": "out",
    "valor": 620,
    "data": "2026-10-24",
    "cat": "Transporte",
    "confirmado": false
   },
   {
    "id": "p1",
    "nome": "13º salário, 1ª parcela",
    "tipo": "in",
    "valor": 2075,
    "data": "2026-11-28",
    "cat": "Renda",
    "confirmado": true
   },
   {
    "id": "p3",
    "nome": "Presentes de Natal",
    "tipo": "out",
    "valor": 900,
    "data": "2026-12-15",
    "cat": "Lazer",
    "confirmado": false
   },
   {
    "id": "p2",
    "nome": "13º salário, 2ª parcela",
    "tipo": "in",
    "valor": 2075,
    "data": "2026-12-18",
    "cat": "Renda",
    "confirmado": false
   },
   {
    "id": "p4",
    "nome": "Gastos na Itália",
    "tipo": "out",
    "valor": 3200,
    "data": "2027-01-12",
    "cat": "Lazer",
    "confirmado": false,
    "nota": "o que a meta não cobre: comida e passeios"
   },
   {
    "id": "p5",
    "nome": "IPVA",
    "tipo": "out",
    "valor": 1450,
    "data": "2027-01-20",
    "cat": "Transporte",
    "confirmado": false
   },
   {
    "id": "p6",
    "nome": "IPTU",
    "tipo": "out",
    "valor": 980,
    "data": "2027-02-10",
    "cat": "Moradia",
    "confirmado": false
   },
   {
    "id": "p7",
    "nome": "Troca do notebook",
    "tipo": "out",
    "valor": 4500,
    "data": "2027-03-15",
    "cat": "Trabalho",
    "confirmado": false,
    "nota": "meta Notebook novo, 07 Carreira"
   }
  ],
  "saldo6m": 1682,
  "saldo12m": 9804,
  "proximoCritico": {
   "realista": {
    "mes": "jan/27",
    "de": 8237,
    "para": 4781,
    "motivo": "Gastos na Itália"
   },
   "otimista": null,
   "pessimista": {
    "mes": "jan/27",
    "de": 1177,
    "para": -4771,
    "motivo": "Gastos na Itália"
   }
  },
  "lab": {
   "antecipar": {
    "data": "2026-12-10",
    "serie": [
     2120,
     5628,
     3737,
     281,
     734,
     488,
     1682,
     3116,
     4549,
     5743,
     7177,
     8610,
     9804
    ],
    "minimo": 281,
    "mesMinimo": "jan/27",
    "saldo6m": 1682,
    "saldo12m": 9804
   },
   "manter": {
    "data": "2027-03-15",
    "serie": [
     2120,
     5628,
     8237,
     4781,
     5234,
     488,
     1682,
     3116,
     4549,
     5743,
     7177,
     8610,
     9804
    ],
    "minimo": 488,
    "mesMinimo": "mar/27",
    "saldo6m": 1682,
    "saldo12m": 9804
   },
   "adiar": {
    "data": "2027-05-15",
    "serie": [
     2120,
     5628,
     8237,
     4781,
     5234,
     4988,
     6182,
     3116,
     4549,
     5743,
     7177,
     8610,
     9804
    ],
    "minimo": 2120,
    "mesMinimo": "out/26",
    "saldo6m": 6182,
    "saldo12m": 9804
   }
  },
  "variavelMensal": 880,
  "rendaVariavelMensal": 600,
  "variavelRestanteOutubro": 646.6,
  "outubroConta": "1.840 hoje + salário 4.150 + provento MXRF11 42,30 − recorrentes que faltam no mês 2.645,70 (faxina 2×180, contador 240) − Revisão do carro 620 − variável restante 646,60 = 2.120",
  "regra": "13 meses a partir de outubro; inclui a renda e o gasto variáveis médios de jul a set (R$ 600 e R$ 880 por mês; o v3 ignorava os dois); recorrentes normalizadas por mês (iguais a Recorrentes; o v3 contava semanal e quinzenal 1× por mês); cenários: receita ×1,3 / ×0,7 e despesa ×0,7 / ×1,3; eventos planejados sem multiplicador; crítico = queda maior que 30% vinda de saldo positivo"
 },
 "orcamentos": {
  "mes": "outubro de 2026",
  "diasRestantes": 28,
  "envelopes": [
   {
    "cat": "Moradia",
    "limite": 1800,
    "gasto": 1240,
    "alerta": 85,
    "rollover": false,
    "limiteEfetivo": 1800,
    "pct": 69,
    "estado": "ok"
   },
   {
    "cat": "Mercado",
    "limite": 650,
    "gasto": 520,
    "alerta": 85,
    "rollover": false,
    "limiteEfetivo": 650,
    "pct": 80,
    "estado": "ok"
   },
   {
    "cat": "Lazer",
    "limite": 420,
    "gasto": 410,
    "alerta": 80,
    "rollover": false,
    "nota": "inclui jantares fora",
    "limiteEfetivo": 420,
    "pct": 98,
    "estado": "atencao"
   },
   {
    "cat": "Transporte",
    "limite": 400,
    "gasto": 310,
    "alerta": 85,
    "rollover": false,
    "limiteEfetivo": 400,
    "pct": 78,
    "estado": "ok"
   },
   {
    "cat": "Saúde",
    "limite": 250,
    "gasto": 180,
    "alerta": 85,
    "rollover": true,
    "sobraAnterior": 50,
    "limiteEfetivo": 300,
    "pct": 60,
    "estado": "ok"
   },
   {
    "cat": "Assinaturas",
    "limite": 220,
    "gasto": 200,
    "alerta": 90,
    "rollover": false,
    "limiteEfetivo": 220,
    "pct": 91,
    "estado": "atencao"
   }
  ],
  "totalOrcado": 3790,
  "totalGasto": 2860,
  "disponivel": 930,
  "foraDeEnvelope": {
   "Investimento": 300
  },
  "receitasRealizadas": 5000,
  "naoAlocado": 1210,
  "regra5030_20": {
   "base": 5000,
   "necessidades": 2500,
   "desejos": 1500,
   "poupanca": 1000
  },
  "lab": {
   "envelope": "Lazer",
   "tetoAtual": 420,
   "opcoes": [
    420,
    470,
    520
   ],
   "fechamentoBase": 2120,
   "poupadoBase": 1950,
   "poupancaBase": 39,
   "aporteItaliaMes": 580,
   "itaAtual": 8600,
   "itaMeta": 12700,
   "regra": "cada R$ 1 a mais no teto de Lazer sai do fechamento projetado (R$ 2.120) e do que fica poupado (R$ 1.950, 39% das receitas); o que sobrar acima de R$ 1.800 no fechamento pode antecipar a Itália, além do aporte fixo de R$ 580",
   "efeitos": {
    "420": {
     "fechamento": 2120,
     "poupancaPct": 39,
     "aporteExtraItalia": 320
    },
    "470": {
     "fechamento": 2070,
     "poupancaPct": 38,
     "aporteExtraItalia": 270
    },
    "520": {
     "fechamento": 2020,
     "poupancaPct": 37,
     "aporteExtraItalia": 220
    }
   }
  }
 },
 "relatorios": {
  "periodoPadrao": "Último trimestre · julho a setembro",
  "comparadoCom": "abril a junho",
  "periodos": [
   "Mês atual",
   "Último trimestre",
   "Último semestre",
   "Últimos 12 meses",
   "Ano atual",
   "Personalizado"
  ],
  "periodosPro": [
   "Último semestre",
   "Últimos 12 meses",
   "Personalizado"
  ],
  "mensal": {
   "abr": {
    "rec": 4650,
    "desp": 3380,
    "cats": {
     "Moradia": 1240,
     "Mercado": 600,
     "Lazer": 380,
     "Transporte": 330,
     "Saúde": 210
    },
    "saldo": 1270,
    "poupancaPct": 25
   },
   "mai": {
    "rec": 4720,
    "desp": 3290,
    "cats": {
     "Moradia": 1240,
     "Mercado": 580,
     "Lazer": 350,
     "Transporte": 300,
     "Saúde": 190
    },
    "saldo": 1430,
    "poupancaPct": 29
   },
   "jun": {
    "rec": 4800,
    "desp": 3450,
    "cats": {
     "Moradia": 1240,
     "Mercado": 610,
     "Lazer": 420,
     "Transporte": 320,
     "Saúde": 230
    },
    "saldo": 1350,
    "poupancaPct": 27
   },
   "jul": {
    "rec": 4750,
    "desp": 3520,
    "cats": {
     "Moradia": 1240,
     "Mercado": 640,
     "Lazer": 470,
     "Transporte": 330,
     "Saúde": 200
    },
    "saldo": 1230,
    "poupancaPct": 25
   },
   "ago": {
    "rec": 4900,
    "desp": 3250,
    "cats": {
     "Moradia": 1240,
     "Mercado": 590,
     "Lazer": 360,
     "Transporte": 310,
     "Saúde": 190
    },
    "saldo": 1650,
    "poupancaPct": 33
   },
   "set": {
    "rec": 4630,
    "desp": 2987,
    "cats": {
     "Moradia": 1240,
     "Mercado": 706,
     "Lazer": 310,
     "Transporte": 290,
     "Saúde": 140
    },
    "saldo": 1643,
    "poupancaPct": 33
   },
   "out": {
    "rec": 5000,
    "desp": 3160,
    "cats": {
     "Moradia": 1240,
     "Mercado": 520,
     "Lazer": 410,
     "Transporte": 310,
     "Saúde": 180
    },
    "parcial": true,
    "saldo": 1840,
    "poupancaPct": 37
   }
  },
  "kpis": {
   "receitas": {
    "atual": 14280,
    "anterior": 14170,
    "delta": 0.8
   },
   "despesas": {
    "atual": 9757,
    "anterior": 10120,
    "delta": -3.6
   },
   "saldo": {
    "atual": 4523,
    "anterior": 4050,
    "delta": 11.7
   },
   "poupancaMedia": {
    "atual": 30,
    "anterior": 27,
    "meta": 30
   }
  },
  "categorias": [
   {
    "cat": "Moradia",
    "atual": 3720,
    "anterior": 3720,
    "delta": 0.0
   },
   {
    "cat": "Mercado",
    "atual": 1936,
    "anterior": 1790,
    "delta": 8.2
   },
   {
    "cat": "Lazer",
    "atual": 1140,
    "anterior": 1150,
    "delta": -0.9
   },
   {
    "cat": "Transporte",
    "atual": 930,
    "anterior": 950,
    "delta": -2.1
   },
   {
    "cat": "Saúde",
    "atual": 530,
    "anterior": 630,
    "delta": -15.9
   }
  ],
  "melhorMes": "ago",
  "topDespesas": [
   {
    "d": "1 jul",
    "desc": "Aluguel",
    "cat": "Moradia",
    "valor": 1200
   },
   {
    "d": "1 ago",
    "desc": "Aluguel",
    "cat": "Moradia",
    "valor": 1200
   },
   {
    "d": "1 set",
    "desc": "Aluguel",
    "cat": "Moradia",
    "valor": 1200
   },
   {
    "d": "14 jul",
    "desc": "Show no Allianz",
    "cat": "Lazer",
    "valor": 380
   },
   {
    "d": "10 set",
    "desc": "Mercado do mês",
    "cat": "Mercado",
    "valor": 610
   }
  ],
  "transacoesNoPeriodo": 97,
  "csv": "separador ;, BOM UTF-8, decimal com vírgula; colunas Data;Descrição;Categoria;Tipo;Valor;Método;Notas"
 },
 "importar": {
  "arquivo": "extrato-nubank-setembro.csv",
  "banco": "Nubank",
  "formato": "CSV",
  "reconhecido": true,
  "formatos": [
   "PDF",
   "CSV",
   "OFX",
   "QFX"
  ],
  "passos": [
   "Arquivo",
   "Revisão",
   "Categorias"
  ],
  "linhas": [
   {
    "data": "2026-09-01",
    "desc": "Salario Empresa X",
    "valor": 4150,
    "tipo": "in",
    "cat": "Renda",
    "duplicata": false
   },
   {
    "data": "2026-09-01",
    "desc": "Aluguel setembro",
    "valor": -1200,
    "tipo": "out",
    "cat": "Moradia",
    "duplicata": false
   },
   {
    "data": "2026-09-02",
    "desc": "Aporte CDB",
    "valor": -300,
    "tipo": "out",
    "cat": "Investimento",
    "duplicata": false
   },
   {
    "data": "2026-09-05",
    "desc": "Netflix.com",
    "valor": -55.9,
    "tipo": "out",
    "cat": "Assinaturas",
    "duplicata": false
   },
   {
    "data": "2026-09-08",
    "desc": "Pao de Acucar",
    "valor": -214.3,
    "tipo": "out",
    "cat": "Mercado",
    "duplicata": false
   },
   {
    "data": "2026-09-10",
    "desc": "Mercado Extra",
    "valor": -395.7,
    "tipo": "out",
    "cat": "Mercado",
    "duplicata": false
   },
   {
    "data": "2026-09-12",
    "desc": "Posto Shell",
    "valor": -190,
    "tipo": "out",
    "cat": "Transporte",
    "duplicata": false
   },
   {
    "data": "2026-09-14",
    "desc": "Pix recebido Joao",
    "valor": 600,
    "tipo": "in",
    "cat": null,
    "duplicata": false
   },
   {
    "data": "2026-09-15",
    "desc": "Smart Fit",
    "valor": -119.9,
    "tipo": "out",
    "cat": "Saúde",
    "duplicata": false
   },
   {
    "data": "2026-09-18",
    "desc": "Drogasil",
    "valor": -64.9,
    "tipo": "out",
    "cat": "Saúde",
    "duplicata": false
   },
   {
    "data": "2026-09-20",
    "desc": "Ingresso.com",
    "valor": -142,
    "tipo": "out",
    "cat": "Lazer",
    "duplicata": false
   },
   {
    "data": "2026-09-22",
    "desc": "Uber *trip",
    "valor": -24.9,
    "tipo": "out",
    "cat": "Transporte",
    "duplicata": false
   },
   {
    "data": "2026-09-24",
    "desc": "Pg *Loja do Ze",
    "valor": -88,
    "tipo": "out",
    "cat": null,
    "duplicata": false
   },
   {
    "data": "2026-09-26",
    "desc": "Ifood",
    "valor": -76.4,
    "tipo": "out",
    "cat": "Lazer",
    "duplicata": false
   },
   {
    "data": "2026-09-27",
    "desc": "Tarifa pacote",
    "valor": -32,
    "tipo": "out",
    "cat": null,
    "duplicata": false
   },
   {
    "data": "2026-09-28",
    "desc": "Uber *trip",
    "valor": -24.9,
    "tipo": "out",
    "cat": "Transporte",
    "duplicata": false
   },
   {
    "data": "2026-09-29",
    "desc": "Cafe Tal",
    "valor": -42,
    "tipo": "out",
    "cat": "Lazer",
    "duplicata": true
   },
   {
    "data": "2026-09-30",
    "desc": "Padaria Real",
    "valor": -96,
    "tipo": "out",
    "cat": "Mercado",
    "duplicata": true
   }
  ],
  "reconhecidas": 15,
  "semCategoria": 3,
  "duplicatas": 2,
  "historico": [
   {
    "arquivo": "extrato-inter-agosto.ofx",
    "quando": "2 set",
    "n": 22,
    "de": "1 ago",
    "ate": "31 ago",
    "entradas": 4900,
    "saidas": 2980
   },
   {
    "arquivo": "fatura-nubank-julho.pdf",
    "quando": "4 ago",
    "n": 31,
    "de": "1 jul",
    "ate": "31 jul",
    "entradas": 0,
    "saidas": 1412.6
   }
  ],
  "regras": "duplicata = mesma data, valor e descrição de uma transação já registrada; só sinaliza. Lote identificado por notes = \"Importado de {arquivo}\" (desfazer apaga o lote)."
 },
 "calendario": {
  "mes": "outubro de 2026",
  "inicioSemana": "domingo",
  "saldoInicial": 1840,
  "extras": [
   {
    "d": 6,
    "tipo": "recorrente",
    "desc": "Aluguel",
    "valor": -1200
   },
   {
    "d": 8,
    "tipo": "recorrente",
    "desc": "Aporte automático",
    "valor": -580
   },
   {
    "d": 8,
    "tipo": "recorrente",
    "desc": "Internet",
    "valor": -89.9
   },
   {
    "d": 12,
    "tipo": "recorrente",
    "desc": "Streaming",
    "valor": -55.9
   },
   {
    "d": 14,
    "tipo": "recorrente",
    "desc": "Faxina",
    "valor": -180
   },
   {
    "d": 15,
    "tipo": "recorrente",
    "desc": "Academia",
    "valor": -119.9
   },
   {
    "d": 15,
    "tipo": "provento",
    "desc": "Provento previsto: MXRF11",
    "valor": 42.3,
    "fonte": "06 Patrimônio"
   },
   {
    "d": 20,
    "tipo": "recorrente",
    "desc": "Contador do MEI",
    "valor": -240
   },
   {
    "d": 24,
    "tipo": "planejado",
    "desc": "Revisão do carro",
    "valor": -620
   },
   {
    "d": 28,
    "tipo": "recorrente",
    "desc": "Faxina",
    "valor": -180
   },
   {
    "d": 30,
    "tipo": "recorrente",
    "desc": "Salário",
    "valor": 4150
   }
  ],
  "feitos": [
   {
    "d": 1,
    "entradas": 4150,
    "saidas": 2187.3
   },
   {
    "d": 2,
    "entradas": 850,
    "saidas": 740.3
   },
   {
    "d": 3,
    "entradas": 0,
    "saidas": 232.4
   }
  ]
 }
};
