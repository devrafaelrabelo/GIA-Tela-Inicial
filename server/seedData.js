// Seed Data de Janeiro até Setembro de 2026 para todas as entidades corporativas Ambozini

export const MONTHS_2026 = [
  { name: 'Janeiro', key: '2026-01', label: 'Janeiro/2026' },
  { name: 'Fevereiro', key: '2026-02', label: 'Fevereiro/2026' },
  { name: 'Março', key: '2026-03', label: 'Março/2026' },
  { name: 'Abril', key: '2026-04', label: 'Abril/2026' },
  { name: 'Maio', key: '2026-05', label: 'Maio/2026' },
  { name: 'Junho', key: '2026-06', label: 'Junho/2026' },
  { name: 'Julho', key: '2026-07', label: 'Julho/2026' },
  { name: 'Agosto', key: '2026-08', label: 'Agosto/2026' },
  { name: 'Setembro', key: '2026-09', label: 'Setembro/2026' },
  { name: 'Outubro', key: '2026-10', label: 'Outubro/2026' }
];

// ========================================================
// 1. COMUNICADOS GERAIS (Janeiro a Setembro)
// ========================================================
export const historicalAnnouncements = [
  // Setembro 2026 (Atual)
  {
    id: "com_5",
    target_card: "comunicados",
    title: "Processamento de folha de pagamento e benefícios",
    date: "01 de setembro",
    author: "RH & Departamento Pessoal",
    author_department: "Recursos Humanos",
    visibility: "members_only",
    summary: "Informes sobre o fechamento da folha e liberação dos comprovantes de benefícios.",
    content: "O processamento salarial referente ao ciclo corrente foi concluído com sucesso. Os holerites e comprovantes de benefícios já estão disponíveis no sistema de autoatendimento para consulta de todos os colaboradores ativos.",
    icon: "coins",
    tag: "RH & Folha",
    tags: ["#RH", "#Benefícios", "#Folha"],
    badge: "Destaque Principal",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    likes_count: 67,
    user_liked: false,
    comments: [],
    action_button_text: "Consultar Holerite / Comprovante",
    action_button_url: "#holerite",
    action_button_subtext: "Crédito em conta confirmado • Ciclo ativo",
    created_at: "2026-09-01T08:00:00Z"
  },
  {
    id: "com_1",
    target_card: "comunicados",
    title: "Nova campanha de vendas e bonificação trimestral",
    date: "15 de setembro",
    author: "Diretoria Comercial",
    author_department: "Comercial",
    visibility: "public",
    summary: "Nossa nova campanha começa no dia 15/09. Contamos com o empenho de todos para batermos o recorde!",
    content: "Prezada equipe Ambozini,\n\nNa próxima semana daremos início à nova campanha trimestral de metas. Haverá bonificações exclusivas para consultores e unidades que atingirem a meta com 10 dias de antecedência.",
    icon: "megaphone",
    tag: "Vendas",
    tags: ["#Vendas", "#Metas", "#Bonificação"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    likes_count: 48,
    user_liked: false,
    comments: [
      {
        id: "ac_1",
        author: "Marcos Lima",
        role: "Gerente Unidade Sul",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        date: "Ontem às 16:20",
        text: "Unidade Sul já está com a estratégia montada. Vamos com tudo!"
      }
    ],
    created_at: "2026-09-15T09:30:00Z"
  },
  {
    id: "com_2",
    target_card: "comunicados",
    title: "Treinamento geral e novos módulos do sistema GIA",
    date: "22 de setembro",
    author: "RH & Desenvolvimento",
    author_department: "Capacitação",
    visibility: "members_only",
    summary: "Treinamento obrigatório para todas as unidades. Materiais confidenciais e link da sala online liberados apenas para colaboradores.",
    content: "Convidamos todos os colaboradores para o Treinamento Geral sobre os novos módulos do CRM e Melhores Práticas de Atendimento ao Cliente.",
    icon: "graduation-cap",
    tag: "Capacitação",
    tags: ["#Treinamento", "#GIA", "#Sistemas"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 31,
    user_liked: false,
    comments: [],
    created_at: "2026-09-22T10:00:00Z"
  },
  {
    id: "com_3",
    target_card: "comunicados",
    title: "Nova filial de Campinas inaugurada com sucesso",
    date: "10 de setembro",
    author: "Expansão & Novos Negócios",
    author_department: "Expansão",
    visibility: "public",
    summary: "Estamos muito felizes em anunciar a abertura da nossa 15ª unidade em Campinas!",
    content: "A família Ambozini continua crescendo! Inauguramos nesta quinta-feira a nossa 15ª filial, com estrutura completa de delivery e salão self-service.",
    icon: "store",
    tag: "Expansão",
    tags: ["#Expansão", "#Campinas", "#NovasFiliais"],
    badge: "Destaque Principal",
    image_url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    likes_count: 89,
    user_liked: false,
    comments: [],
    created_at: "2026-09-10T14:00:00Z"
  },
  {
    id: "com_4",
    target_card: "comunicados",
    title: "Atualização de segurança e acesso aos sistemas",
    date: "05 de setembro",
    author: "Segurança da Informação",
    author_department: "TI & Infraestrutura",
    visibility: "members_only",
    summary: "Novo protocolo de autenticação GIA em vigor para reforçar a segurança corporativa.",
    content: "Informamos que o novo fluxo seguro de login GIA está ativo para todos os colaboradores, garantindo integridade nos acessos.",
    icon: "shield-check",
    tag: "Segurança",
    tags: ["#Segurança", "#TI", "#GIA"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    is_featured: true,
    likes_count: 42,
    user_liked: false,
    comments: [],
    created_at: "2026-09-05T08:30:00Z"
  },

  // Agosto 2026
  {
    id: "com_ago_1",
    target_card: "comunicados",
    title: "Campanha Dia dos Pais e Bonificação por Atendimento Rápido",
    date: "06 de agosto",
    author: "Diretoria Comercial",
    author_department: "Comercial",
    visibility: "public",
    summary: "Estratégia especial de vendas e incentivos financeiros para todas as unidades no mês dos pais.",
    content: "Com a aproximação do Dia dos Pais, apresentamos a esteira especial de incentivos e produtos premium para atender à demanda de salão e entregas programadas.",
    icon: "gift",
    tag: "Vendas",
    tags: ["#DiaDosPais", "#Vendas", "#Incentivos"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 53,
    user_liked: false,
    comments: [],
    created_at: "2026-08-06T09:00:00Z"
  },
  {
    id: "com_ago_2",
    target_card: "comunicados",
    title: "Auditoria de Qualidade Sanitária e Atendimento: 100% de aprovação",
    date: "20 de agosto",
    author: "Qualidade & Compliance",
    author_department: "Qualidade",
    visibility: "members_only",
    summary: "Todas as 15 filiais foram inspecionadas e conquistaram selo de excelência máxima.",
    content: "Parabenizamos gerentes e operadores: a auditoria bimestral de processos sanitários e boas práticas de manipulação registrou conformidade perfeita em toda a rede Ambozini.",
    icon: "award",
    tag: "Qualidade",
    tags: ["#Qualidade", "#Conformidade", "#Excelência"],
    badge: "Reconhecimento",
    image_url: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 61,
    user_liked: false,
    comments: [],
    created_at: "2026-08-20T11:00:00Z"
  },

  // Julho 2026
  {
    id: "com_jul_1",
    target_card: "comunicados",
    title: "Lançamento do Cardápio de Inverno e Festival de Caldos",
    date: "08 de julho",
    author: "Operações Gastronômicas",
    author_department: "Gastronomia & Produto",
    visibility: "public",
    summary: "Novas opções sazonais chegam ao buffet self-service e ao catálogo de delivery corporativo.",
    content: "A partir desta semana, todas as filiais passam a oferecer o festival de caldos artesanais e pratos quentes exclusivos, reforçando nosso compromisso com sabor e acolhimento.",
    icon: "utensils",
    tag: "Cardápio",
    tags: ["#Inverno", "#Gastronomia", "#Novidades"],
    badge: "Novidade",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 45,
    user_liked: false,
    comments: [],
    created_at: "2026-07-08T10:15:00Z"
  },
  {
    id: "com_jul_2",
    target_card: "comunicados",
    title: "Convênio Educacional: Bolsas de Graduação e Pós para Colaboradores",
    date: "24 de julho",
    author: "RH & Benefícios",
    author_department: "Recursos Humanos",
    visibility: "members_only",
    summary: "Parceria com instituições de ensino superior garante até 50% de desconto para nossa equipe.",
    content: "Investir nas pessoas é o nosso pilar! Firmamos convênio educacional nacional permitindo descontos expressivos em cursos de gestão, tecnologia e gastronomia para colaboradores e dependentes diretos.",
    icon: "graduation-cap",
    tag: "Benefícios",
    tags: ["#Educação", "#Bolsas", "#Carreira"],
    badge: "RH Informa",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 76,
    user_liked: false,
    comments: [],
    created_at: "2026-07-24T14:30:00Z"
  },

  // Junho 2026
  {
    id: "com_jun_1",
    target_card: "comunicados",
    title: "Festival Junino Ambozini: Ambientação e Sobremesas Típicas",
    date: "10 de junho",
    author: "Marketing & Trade",
    author_department: "Marketing",
    visibility: "public",
    summary: "Celebração cultural nas lojas com sobremesas especiais e engajamento das equipes.",
    content: "O clima festivo tomou conta de todas as unidades com decoração junina e menu de doces tradicionais, gerando excelente repercussão entre os clientes.",
    icon: "sparkles",
    tag: "Cultura",
    tags: ["#FestaJunina", "#Cultura", "#Marketing"],
    badge: "Destaque",
    image_url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 58,
    user_liked: false,
    comments: [],
    created_at: "2026-06-10T09:00:00Z"
  },
  {
    id: "com_jun_2",
    target_card: "comunicados",
    title: "Fechamento do 1º Semestre (H1): 110% da meta global alcançada",
    date: "28 de junho",
    author: "Diretoria Executiva",
    author_department: "Presidência",
    visibility: "members_only",
    summary: "Resultados recordes consolidam o melhor primeiro semestre da história da Ambozini.",
    content: "Parabéns a cada consultor, cozinheiro, gerente e parceiro logístico! O balanço do H1/2026 superou todas as metas orçadas, com taxa de fidelização de clientes em 94%.",
    icon: "trophy",
    tag: "Resultados",
    tags: ["#Resultados", "#H1", "#Recorde"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 94,
    user_liked: false,
    comments: [],
    created_at: "2026-06-28T16:00:00Z"
  },

  // Maio 2026
  {
    id: "com_mai_1",
    target_card: "comunicados",
    title: "Operação Especial Dia das Mães: Atendimento Recorde e Elogios",
    date: "05 de maio",
    author: "Diretoria Comercial",
    author_department: "Comercial",
    visibility: "public",
    summary: "Planejamento logístico e de salão para a data mais movimentada do semestre.",
    content: "O Dia das Mães demanda excelência em dobro. Estruturamos reforço no abastecimento das cozinhas e plantão de suporte para garantir uma experiência memorável para as famílias.",
    icon: "heart",
    tag: "Vendas",
    tags: ["#DiaDasMães", "#Operação", "#Atendimento"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 63,
    user_liked: false,
    comments: [],
    created_at: "2026-05-05T08:00:00Z"
  },
  {
    id: "com_mai_2",
    target_card: "comunicados",
    title: "Programa Inovação Interna: 'Ideias de Valor' Abre Inscrições",
    date: "20 de maio",
    author: "Inovação & Processos",
    author_department: "Inovação",
    visibility: "members_only",
    summary: "Envie sugestões de melhoria para os processos de atendimento e concorra a premiações.",
    content: "As melhores ideias nascem de quem vive o dia a dia da operação. O comitê de inovação está recebendo propostas de otimização de rotinas em todas as filiais.",
    icon: "lightbulb",
    tag: "Inovação",
    tags: ["#Inovação", "#Processos", "#Premiação"],
    badge: "Participe",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 49,
    user_liked: false,
    comments: [],
    created_at: "2026-05-20T11:30:00Z"
  },

  // Abril 2026
  {
    id: "com_abr_1",
    target_card: "comunicados",
    title: "Ação Páscoa Solidária: Mais de 500 cestas entregues à comunidade",
    date: "07 de abril",
    author: "Responsabilidade Social",
    author_department: "Sustentabilidade",
    visibility: "public",
    summary: "Campanha voluntária mobilizou colaboradores e unidades em prol de entidades beneficentes.",
    content: "Agradecemos o carinho e o engajamento de todos os times que participaram da arrecadação e entrega de ovos e mantimentos em bairros próximos às nossas unidades.",
    icon: "smile",
    tag: "Comunidade",
    tags: ["#Solidariedade", "#Páscoa", "#Comunidade"],
    badge: "Solidariedade",
    image_url: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 70,
    user_liked: false,
    comments: [],
    created_at: "2026-04-07T10:00:00Z"
  },
  {
    id: "com_abr_2",
    target_card: "comunicados",
    title: "Atualização das Normas de Saúde Ocupacional e Ergonomia",
    date: "21 de abril",
    author: "Saúde Ocupacional & SESMT",
    author_department: "Segurança do Trabalho",
    visibility: "members_only",
    summary: "Orientações sobre postura, pausas ativas e prevenção de acidentes no ambiente corporativo.",
    content: "Disponibilizamos no portal a nova cartilha ilustrada de ergonomia para operadores de caixa, consultores de salão e equipes de cozinha.",
    icon: "shield",
    tag: "Saúde",
    tags: ["#Saúde", "#Segurança", "#Ergonomia"],
    badge: "Importante",
    image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 38,
    user_liked: false,
    comments: [],
    created_at: "2026-04-21T09:00:00Z"
  },

  // Março 2026
  {
    id: "com_mar_1",
    target_card: "comunicados",
    title: "Mês da Mulher: Homenagem às Líderes e Colaboradoras Ambozini",
    date: "08 de março",
    author: "Comitê de Pessoas & Cultura",
    author_department: "Recursos Humanos",
    visibility: "public",
    summary: "Mais de 65% das posições de liderança em nossa rede são ocupadas por mulheres extraordinárias.",
    content: "Neste 8 de Março celebramos a força, a dedicação e o talento de todas as mulheres que constroem a história da Ambozini diariamente. Café da manhã especial em todas as filiais!",
    icon: "flower",
    tag: "Cultura",
    tags: ["#MulheresAmbozini", "#Liderança", "#Cultura"],
    badge: "Destaque",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 88,
    user_liked: false,
    comments: [],
    created_at: "2026-03-08T08:30:00Z"
  },
  {
    id: "com_mar_2",
    target_card: "comunicados",
    title: "Fechamento do 1º Trimestre (Q1): Meta Superada em 80% das Filiais",
    date: "27 de março",
    author: "Diretoria Comercial",
    author_department: "Comercial",
    visibility: "members_only",
    summary: "O primeiro trimestre encerra com saldo altamente positivo e bonificação para consultores.",
    content: "O empenho conjunto de todas as equipes garantiu a superação das metas comerciais no Q1/2026. Parabéns aos consultores que atingiram a faixa ouro de performance!",
    icon: "trending-up",
    tag: "Vendas",
    tags: ["#Q1", "#Metas", "#Vendas"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 72,
    user_liked: false,
    comments: [],
    created_at: "2026-03-27T17:00:00Z"
  },

  // Fevereiro 2026
  {
    id: "com_fev_1",
    target_card: "comunicados",
    title: "Horários Especiais de Carnaval e Logística Integrada",
    date: "06 de fevereiro",
    author: "Operações & Logística",
    author_department: "Operações",
    visibility: "public",
    summary: "Confira a grade de funcionamento das unidades e escalas operacionais para o período.",
    content: "As filiais de shopping e rua operarão com horários adaptados no feriado de Carnaval, mantendo a operação de delivery ativa para atender à demanda da clientela.",
    icon: "clock",
    tag: "Operações",
    tags: ["#Carnaval", "#Horários", "#Operações"],
    badge: "Comunicado",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 40,
    user_liked: false,
    comments: [],
    created_at: "2026-02-06T09:00:00Z"
  },
  {
    id: "com_fev_2",
    target_card: "comunicados",
    title: "Novo Padrão Visual das Embalagens Térmicas para o Delivery",
    date: "20 de fevereiro",
    author: "Marketing & Marca",
    author_department: "Marketing",
    visibility: "members_only",
    summary: "Embalagens biodegradáveis com selo de retenção de temperatura começam a circular.",
    content: "Iniciamos a substituição gradual de todas as embalagens de transporte. O novo modelo oferece melhor vedação térmica e reforça o posicionamento sustentável da nossa marca.",
    icon: "package",
    tag: "Marketing",
    tags: ["#Embalagens", "#Delivery", "#Sustentabilidade"],
    badge: "Novidade",
    image_url: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 51,
    user_liked: false,
    comments: [],
    created_at: "2026-02-20T10:30:00Z"
  },

  // Janeiro 2026
  {
    id: "com_jan_1",
    target_card: "comunicados",
    title: "Abertura Oficial do Ano Comercial 2026 e Diretrizes da Rede",
    date: "08 de janeiro",
    author: "Diretoria Executiva",
    author_department: "Presidência",
    visibility: "public",
    summary: "Mensagem da liderança apresentando a expansão da rede e objetivos para 2026.",
    content: "Um ano repleto de novos desafios e oportunidades começa agora! O plano de expansão 2026 prevê modernização dos sistemas e abertura de novas filiais estratégicas no estado de São Paulo.",
    icon: "flag",
    tag: "Estratégia",
    tags: ["#AnoNovo2026", "#Planejamento", "#Expansão"],
    badge: "Oficial",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 82,
    user_liked: false,
    comments: [],
    created_at: "2026-01-08T09:00:00Z"
  },
  {
    id: "com_jan_2",
    target_card: "comunicados",
    title: "Início do Programa Trainee e Liderança Jovem Ambozini 2026",
    date: "22 de janeiro",
    author: "RH & Desenvolvimento",
    author_department: "Recursos Humanos",
    visibility: "members_only",
    summary: "Processo seletivo interno para formar os futuros supervisores e gerentes de unidade.",
    content: "Acreditamos na promoção interna de talentos. Colaboradores com mais de 6 meses de casa podem se candidatar às trilhas de formação gerencial acelerada no portal de carreiras.",
    icon: "user-check",
    tag: "Capacitação",
    tags: ["#Trainee", "#Carreira", "#Liderança"],
    badge: "RH Informa",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    is_featured: false,
    likes_count: 67,
    user_liked: false,
    comments: [],
    created_at: "2026-01-22T14:00:00Z"
  }
];

// ========================================================
// 2. FÓRUM & COMUNIDADE (Janeiro a Setembro)
// ========================================================
export const historicalPosts = [
  // Setembro 2026
  {
    id: "post_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Mariana Alencar",
      role: "Consultora de Negócios",
      unit: "Unidade Norte",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dica de ouro: Como aumentamos a taxa de fechamento no CRM esta semana 💡",
    category: "Dicas de Vendas",
    tag: "#Vendas #Dicas",
    created_at: "25 de setembro",
    time_ago: "Há 3 horas",
    timestamp: "2026-09-25T08:00:00Z",
    content: "Pessoal da rede, queríamos compartilhar uma prática simples que dobrou nosso fechamento na Unidade Norte: atualizar os lembretes de follow-up logo após cada ligação no CRM.",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    likes: 54,
    user_liked: false,
    is_liked: false,
    comments_count: 1,
    comments: [
      {
        id: "fpc_1",
        author: "Rodrigo Faria",
        role: "Supervisor Comercial",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
        date: "Há 1 hora",
        text: "Excelente iniciativa, Mari! Vamos replicar essa rotina aqui na Unidade Centro também."
      }
    ],
    pinned: true
  },
  {
    id: "post_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Lucas Vasconcelos",
      role: "Especialista em Atendimento",
      unit: "Unidade Leste",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
    },
    title: "Batemos 100% da meta da semana na Unidade Leste! 🚀🔥",
    category: "Comemoração",
    tag: "#Celebração #Meta100",
    created_at: "25 de setembro",
    time_ago: "Há 5 horas",
    timestamp: "2026-09-25T06:00:00Z",
    content: "Passando para agradecer todo o time da Leste pelo empenho de hoje. Superamos a meta semanal com dois dias de antecedência!",
    image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
    likes: 72,
    user_liked: true,
    is_liked: true,
    comments_count: 1,
    comments: [
      {
        id: "fpc_2",
        author: "João Silva",
        role: "Gerente de Operações",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        date: "Há 4 horas",
        text: "Sensacional pessoal! O crescimento da Leste (+18%) é reflexo desse engajamento fantástico!"
      }
    ],
    pinned: false
  },
  {
    id: "post_3",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Patrícia Nogueira",
      role: "Analista de Suporte",
      unit: "Matriz",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dúvida frequente: Onde emitir o relatório de conversão no novo CRM?",
    category: "Dúvidas & Suporte",
    tag: "#Suporte #CRM",
    created_at: "24 de setembro",
    time_ago: "Ontem",
    timestamp: "2026-09-24T14:00:00Z",
    content: "Muitos consultores estão com dúvidas sobre o novo menu de relatórios do CRM. Preparamos um mini-passo a passo de 3 cliques e deixamos no menu Documentos do portal!",
    image_url: "",
    likes: 29,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_4",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "João Silva",
      role: "Gerente de Operações",
      unit: "Unidade Centro",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    title: "Planejamento Estratégico Q4 & Tabela de Comissões Especiais 📊🎁",
    category: "Estratégia & Metas",
    tag: "#Interno #Q4 #Comissões",
    created_at: "24 de setembro",
    time_ago: "Ontem às 18:30",
    timestamp: "2026-09-24T18:30:00Z",
    content: "Atenção consultores e supervisores: aprovamos com a diretoria a nova tabela de comissões aceleradas para o fechamento do ano.",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
    likes: 63,
    user_liked: false,
    is_liked: false,
    comments_count: 1,
    comments: [
      {
        id: "fpc_4",
        author: "Lucas Pereira",
        role: "Assistente Operacional",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        date: "Ontem às 19:15",
        text: "Excelente incentivo, João! As equipes já estão mobilizadas."
      }
    ],
    pinned: false
  },

  // Agosto 2026
  {
    id: "post_ago_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Marcos Lima",
      role: "Gerente Unidade Sul",
      unit: "Unidade Sul",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    title: "Campanha dos Pais foi um sucesso estrondoso na nossa praça de alimentação!",
    category: "Comemoração",
    tag: "#Celebração #UnidadeSul",
    created_at: "09 de agosto",
    time_ago: "09 de agosto",
    timestamp: "2026-08-09T18:00:00Z",
    content: "Neste fim de semana batemos o recorde de pedidos simultâneos no salão! Parabéns aos nossos atendentes que mantiveram o sorriso e o padrão impecável.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    likes: 47,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_ago_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Beatriz Souza",
      role: "Supervisora de Caixa",
      unit: "Unidade Campinas",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dica rápida para treinamento de novos atendentes em 3 passos",
    category: "Boas Práticas",
    tag: "#Treinamento #Equipe",
    created_at: "22 de agosto",
    time_ago: "22 de agosto",
    timestamp: "2026-08-22T10:15:00Z",
    content: "Criamos um manual de bolso de 1 página com as 5 principais dúvidas dos clientes na Unidade Campinas. Reduziu o tempo de adaptação dos novatos em quase 60%.",
    image_url: "",
    likes: 38,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Julho 2026
  {
    id: "post_jul_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Thiago Martins",
      role: "Supervisor de Logística",
      unit: "Unidade Vila Olímpia",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dica para manter a temperatura ideal das marmitas no trajeto do motoboy",
    category: "Operacional",
    tag: "#Logística #Qualidade",
    created_at: "12 de julho",
    time_ago: "12 de julho",
    timestamp: "2026-07-12T15:30:00Z",
    content: "Com as baixas temperaturas deste inverno, reforçamos a selagem com manta térmica no fundo dos baús. Os clientes estão elogiando que a refeição chega pelando!",
    image_url: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80",
    likes: 52,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_jul_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Patrícia Nogueira",
      role: "Analista de Suporte",
      unit: "Matriz",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
    },
    title: "Novo sistema de escalas facilitou muito a folga dos fins de semana",
    category: "Gestão de Pessoas",
    tag: "#Escalas #RH",
    created_at: "26 de julho",
    time_ago: "26 de julho",
    timestamp: "2026-07-26T11:45:00Z",
    content: "O módulo de troca de turnos no portal agora permite que os consultores combinem trocas com validação automática do supervisor.",
    image_url: "",
    likes: 34,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Junho 2026
  {
    id: "post_jun_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Larissa Diniz",
      role: "Líder de Atendimento",
      unit: "Unidade Jardins",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    title: "Arraial Ambozini: decoração típica e clientes encantados no almoço",
    category: "Comemoração",
    tag: "#FestaJunina #Encanto",
    created_at: "15 de junho",
    time_ago: "15 de junho",
    timestamp: "2026-06-15T13:20:00Z",
    content: "Olhem como ficou o buffet aqui nos Jardins com as bandeirolas e chapéus de palha! O pessoal adorou o clima acolhedor.",
    image_url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
    likes: 68,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_jun_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Amanda Furtado",
      role: "Gerente de Unidade",
      unit: "Unidade Paulista",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80"
    },
    title: "Fechamos o 1º semestre com 112% da meta aqui na Paulista!",
    category: "Comemoração",
    tag: "#H1 #Resultados",
    created_at: "29 de junho",
    time_ago: "29 de junho",
    timestamp: "2026-06-29T19:00:00Z",
    content: "Muito orgulho do time da Paulista. Encerramos o primeiro semestre no topo do ranking regional com dedicação e muito trabalho em equipe.",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    likes: 81,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Maio 2026
  {
    id: "post_mai_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Aline Prado",
      role: "Supervisora Comercial",
      unit: "Unidade Shopping Sul",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
    },
    title: "Operação do Dia das Mães foi um show de entrosamento da equipe!",
    category: "Comemoração",
    tag: "#DiaDasMães #TrabalhoEmEquipe",
    created_at: "11 de maio",
    time_ago: "11 de maio",
    timestamp: "2026-05-11T14:10:00Z",
    content: "Mesmo com fila na porta, o tempo médio de atendimento foi de apenas 4 minutos por cliente. Todos saíram felizes e bem servidos!",
    image_url: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80",
    likes: 59,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_mai_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Fernando Castro",
      role: "Analista de Processos",
      unit: "Unidade Alphaville",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    title: "Ideia cadastrada no Inovação Interna: QR Code na mesa para pesquisa rápida",
    category: "Inovação & Ideias",
    tag: "#Inovação #NPS",
    created_at: "23 de maio",
    time_ago: "23 de maio",
    timestamp: "2026-05-23T11:00:00Z",
    content: "Cadastramos a proposta de colocar um QR Code discreto no porta-guardanapos para avaliar a refeição em 10 segundos. O que acham da ideia?",
    image_url: "",
    likes: 41,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Abril 2026
  {
    id: "post_abr_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Renata Silveira",
      role: "Consultora de Vendas",
      unit: "Unidade Sorocaba",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
    },
    title: "Feedback super positivo dos clientes sobre o novo atendimento no balcão",
    category: "Boas Práticas",
    tag: "#Atendimento #Clientes",
    created_at: "10 de abril",
    time_ago: "10 de abril",
    timestamp: "2026-04-10T16:40:00Z",
    content: "Implementamos a saudação personalizada e a apresentação dos pratos do dia antes da pesagem. O tíquete médio subiu 12% nos últimos 15 dias.",
    image_url: "",
    likes: 49,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_abr_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Roberto Mendes",
      role: "Coordenador de TI",
      unit: "Matriz",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dúvida sobre emissão de notas fiscais conjugadas no novo módulo",
    category: "Dúvidas & Suporte",
    tag: "#Fiscal #GIA",
    created_at: "27 de abril",
    time_ago: "27 de abril",
    timestamp: "2026-04-27T09:30:00Z",
    content: "Para quem está gerando NFS-e conjugada com venda no balcão, o botão de transmissão direta já está ativo na tela de fechamento de caixa.",
    image_url: "",
    likes: 27,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Março 2026
  {
    id: "post_mar_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Joana Prado",
      role: "Consultora Comercial Sênior",
      unit: "Unidade Centro",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    title: "Café da manhã especial com as colaboradoras da Unidade Centro no Dia da Mulher",
    category: "Comemoração",
    tag: "#DiaDaMulher #Inspiração",
    created_at: "08 de março",
    time_ago: "08 de março",
    timestamp: "2026-03-08T09:00:00Z",
    content: "Momento muito emocionante com nossa equipe feminina reunida para celebrar as conquistas e histórias inspiradoras de cada uma. Viva as mulheres Ambozini!",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    likes: 85,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_mar_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Marcos Lima",
      role: "Gerente Unidade Sul",
      unit: "Unidade Sul",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    title: "Unidade Sul bateu a meta trimestral com 1 semana de antecedência!",
    category: "Comemoração",
    tag: "#Q1 #Metas #Equipe",
    created_at: "24 de março",
    time_ago: "24 de março",
    timestamp: "2026-03-24T17:15:00Z",
    content: "Queremos parabenizar cada consultor e auxiliar da Sul pelo foco total. Bater a meta antes do prazo nos dá fôlego para planejar o Q2 com ainda mais ambição.",
    image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    likes: 64,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Fevereiro 2026
  {
    id: "post_fev_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Lucas Vasconcelos",
      role: "Especialista em Atendimento",
      unit: "Unidade Leste",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
    },
    title: "Recorde de velocidade de expedição no Delivery durante o feriado",
    category: "Operacional",
    tag: "#Delivery #Agilidade",
    created_at: "14 de fevereiro",
    time_ago: "14 de fevereiro",
    timestamp: "2026-02-14T20:00:00Z",
    content: "Alcançamos uma média de expedição de 14 minutos no almoço de Carnaval com o novo layout da esteira de embalagem. Parabéns à cozinha da Leste!",
    image_url: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80",
    likes: 56,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_fev_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Juliana Meireles",
      role: "Supervisora de Operações",
      unit: "Unidade Santo André",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    title: "Como estamos usando o checklist de abertura para evitar desperdícios",
    category: "Boas Práticas",
    tag: "#DesperdícioZero #Operação",
    created_at: "26 de fevereiro",
    time_ago: "26 de fevereiro",
    timestamp: "2026-02-26T08:45:00Z",
    content: "Conferir o estoque e a calibragem dos fornos antes das 10h eliminou completamente perdas de matéria-prima no início do turno.",
    image_url: "",
    likes: 39,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },

  // Janeiro 2026
  {
    id: "post_jan_1",
    target_card: "forum",
    visibility: "public",
    author: {
      name: "Mariana Alencar",
      role: "Consultora de Negócios",
      unit: "Unidade Norte",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    title: "Unidade Norte pronta para os desafios de 2026! Compartilhem suas metas",
    category: "Geral",
    tag: "#AnoNovo2026 #União",
    created_at: "12 de janeiro",
    time_ago: "12 de janeiro",
    timestamp: "2026-01-12T10:30:00Z",
    content: "Começamos o ano com as baterias 100% recarregadas e um mural cheio de metas individuais e coletivas. Bora fazer de 2026 o melhor ano de todos!",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
    likes: 74,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  },
  {
    id: "post_jan_2",
    target_card: "forum",
    visibility: "members_only",
    author: {
      name: "Carlos Eduardo",
      role: "Líder Comercial de Unidade",
      unit: "Unidade Jardins",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    title: "Dica prática de organização de estoque pós-inventário anual",
    category: "Operacional",
    tag: "#Inventário #Estoque",
    created_at: "25 de janeiro",
    time_ago: "25 de janeiro",
    timestamp: "2026-01-25T14:00:00Z",
    content: "Etiquetar as caixas com código de cores por validade agilizou o rodízio PEPS (Primeiro que Entra, Primeiro que Sai) na câmara fria.",
    image_url: "",
    likes: 42,
    user_liked: false,
    is_liked: false,
    comments_count: 0,
    comments: [],
    pinned: false
  }
];

// ========================================================
// 3. CALENDÁRIO CORPORATIVO (Janeiro a Setembro)
// ========================================================
export const historicalCalendarEvents = [
  // Futuros - Dezembro 2026
  {
    id: "evt_dez_3",
    date: "31/12/2026",
    title: "Fechamento Fiscal e Contábil Consolidado 2026",
    category: "Corporativo",
    time: "10:00 - 12:00",
    location: "Sede Matriz & Portal GIA",
    description: "Consolidação anual das operações, encerramento de balanço e diretrizes contábeis da rede."
  },
  {
    id: "evt_dez_2",
    date: "18/12/2026",
    title: "Confraternização Anual e Premiação Melhores do Ano",
    category: "Corporativo",
    time: "19:00 - 23:00",
    location: "Espaço Ambozini Premium",
    description: "Celebração de encerramento de ano com premiação das equipes e colaboradores de maior destaque."
  },
  {
    id: "evt_dez_1",
    date: "08/12/2026",
    title: "Planejamento Operacional para Festas de Fim de Ano",
    category: "Operacional",
    time: "14:00 - 16:00",
    location: "Teams & Matriz",
    description: "Alinhamento das escalas de plantão, contingente de entregadores e estoques para o Natal e Réveillon."
  },

  // Futuros - Novembro 2026
  {
    id: "evt_nov_3",
    date: "27/11/2026",
    title: "Operação Especial Black Friday Ambozini",
    category: "Operacional",
    time: "08:00 - 23:00",
    location: "Todas as Filiais & Delivery",
    description: "Megaoperação de vendas com monitoramento em tempo real do faturamento e atendimento das unidades."
  },
  {
    id: "evt_nov_2",
    date: "18/11/2026",
    title: "Capacitação de Liderança e Gestão de Pessoas",
    category: "Treinamento",
    time: "14:00 - 17:00",
    location: "Auditório Matriz",
    description: "Desenvolvimento de competências em feedback, retenção de talentos e clima organizacional."
  },
  {
    id: "evt_nov_1",
    date: "05/11/2026",
    title: "Alinhamento Comercial e Logístico Black Friday",
    category: "Comercial",
    time: "10:00 - 12:00",
    location: "Transmissão Online",
    description: "Definição de combos promocionais, cupons no app e metas de vendas para a semana Black Friday."
  },

  // Futuros - Outubro 2026
  {
    id: "evt_out_4",
    date: "27/10/2026",
    title: "Treinamento de Segurança Alimentar e Auditoria",
    category: "Treinamento",
    time: "09:00 - 11:30",
    location: "Sala Virtual 02",
    description: "Capacitação técnica com foco em conformidade sanitária, boas práticas de manipulação e controle de qualidade."
  },
  {
    id: "evt_out_3",
    date: "15/10/2026",
    title: "Alinhamento Estratégico Q4 & Expansão",
    category: "Corporativo",
    time: "14:00 - 16:00",
    location: "Sede Corporativa",
    description: "Apresentação do cronograma de aberturas de novas filiais e metas do 4º trimestre."
  },
  {
    id: "evt_out_2",
    date: "12/10/2026",
    title: "Ação Especial Dia das Crianças na Rede",
    category: "Comercial",
    time: "09:00 - 18:00",
    location: "Salões das Unidades",
    description: "Cardápio temático infantil, ativações em loja e campanhas promocionais de delivery para famílias."
  },
  {
    id: "evt_out_1",
    date: "06/10/2026",
    title: "Workshop de Gestão de Estoque e Redução de Desperdício",
    category: "Operacional",
    time: "10:00 - 12:00",
    location: "Hub Central Logístico",
    description: "Técnicas de controle de shelf-life, otimização de compras e controle rigoroso de perdas nos insumos."
  },

  // Futuros - Setembro 2026 (Próximos dias)
  {
    id: "evt_set_4",
    date: "28/09/2026",
    title: "Treinamento de Novos Processos de Caixa e Atendimento",
    category: "Treinamento",
    time: "14:00 - 16:00",
    location: "Sala Virtual 01",
    description: "Capacitação prática sobre o módulo de fechamento de lote e emissão fiscal automática."
  },
  {
    id: "evt_set_5",
    date: "30/09/2026",
    title: "Fechamento Oficial do Ciclo de Metas de Setembro",
    category: "Comercial",
    time: "18:00 - 19:00",
    location: "Portal GIA",
    description: "Consolidação dos relatórios mensais e encerramento do ranking das Top Unidades."
  },

  // Anteriores - Setembro 2026 (Já Realizados)
  {
    id: "evt_set_3",
    date: "25/09/2026",
    title: "Reunião Mensal de Resultados da Rede",
    category: "Corporativo",
    time: "09:00 - 11:30",
    location: "Transmissão Nacional",
    description: "Balanço prévio do fechamento de setembro e anúncio das filiais com maiores taxas de conversão."
  },
  {
    id: "evt_set_2",
    date: "15/09/2026",
    title: "Lançamento da Campanha de Metas da Primavera",
    category: "Comercial",
    time: "14:00 - 15:30",
    location: "Transmissão Online",
    description: "Apresentação dos incentivos e premiações especiais para as filiais no período da primavera."
  },
  {
    id: "evt_set_1",
    date: "05/09/2026",
    title: "Comitê de Governança e Tecnologia GIA",
    category: "Corporativo",
    time: "10:00 - 11:30",
    location: "Matriz & Teams",
    description: "Alinhamento das diretrizes de segurança da informação e infraestrutura de rede para o 4º trimestre."
  },

  // Anteriores - Agosto 2026
  {
    id: "evt_ago_2",
    date: "25/08/2026",
    title: "Workshop de Comunicação Não-Violenta e Liderança",
    category: "Treinamento",
    time: "09:00 - 12:00",
    location: "Auditório Matriz",
    description: "Capacitação para gestores e supervisores sobre escuta ativa e gestão de conflitos no ambiente de trabalho."
  },
  {
    id: "evt_ago_1",
    date: "11/08/2026",
    title: "Alinhamento da Operação Campanha dos Pais",
    category: "Comercial",
    time: "15:00 - 16:30",
    location: "Teams & Auditório",
    description: "Revisão das escalas, metas de giro de salão e reforço no contingente de entregadores."
  },

  // Anteriores - Julho 2026
  {
    id: "evt_jul_2",
    date: "29/07/2026",
    title: "Reciclagem em Higiene e Padrões Sanitários",
    category: "Operacional",
    time: "10:00 - 12:00",
    location: "Online / Teams",
    description: "Atualização obrigatória sobre manuseio de alimentos e protocolos da vigilância sanitária."
  },
  {
    id: "evt_jul_1",
    date: "15/07/2026",
    title: "Integração de Novos Contratados Q3",
    category: "Integração",
    time: "14:00 - 17:00",
    location: "Sala Treinamento SP",
    description: "Boas-vindas aos novos colaboradores com apresentação da cultura e valores da Ambozini."
  },

  // Anteriores - Junho 2026
  {
    id: "evt_jun_2",
    date: "30/06/2026",
    title: "Reunião Semestral de Resultados (H1)",
    category: "Corporativo",
    time: "10:00 - 12:00",
    location: "Auditório Híbrido",
    description: "Apresentação dos balanços e premiação das unidades com maior eficiência operacional."
  },
  {
    id: "evt_jun_1",
    date: "16/06/2026",
    title: "Convenção Comercial de Meio de Ano",
    category: "Comercial",
    time: "09:00 - 17:00",
    location: "Centro de Convenções",
    description: "Encontro com todas as lideranças comerciais para celebrar os resultados do 1º semestre."
  },

  // Anteriores - Maio 2026
  {
    id: "evt_mai_2",
    date: "26/05/2026",
    title: "Workshop de Encantamento e Atendimento de Excelência",
    category: "Treinamento",
    time: "14:00 - 16:30",
    location: "Auditório Ambozini",
    description: "Técnicas de atendimento cordial e fidelização de clientes com especialistas convidados."
  },
  {
    id: "evt_mai_1",
    date: "12/05/2026",
    title: "SIPAT 2026: Semana de Saúde e Segurança",
    category: "Corporativo",
    time: "08:00 - 17:00",
    location: "Todas as Unidades",
    description: "Palestras interativas sobre ergonomia, primeiros socorros e saúde mental no trabalho."
  },

  // Anteriores - Abril 2026
  {
    id: "evt_abr_2",
    date: "28/04/2026",
    title: "Fórum Regional de Gerentes de Unidades",
    category: "Operacional",
    time: "14:00 - 18:00",
    location: "Unidade Jardins",
    description: "Compartilhamento de boas práticas de gestão de estoques e redução de desperdícios."
  },
  {
    id: "evt_abr_1",
    date: "14/04/2026",
    title: "Treinamento Módulo Fiscal e GIA 3.0",
    category: "Treinamento",
    time: "09:30 - 11:30",
    location: "Online / Teams",
    description: "Instruções sobre o novo fluxo de transmissão de cupons fiscais e relatórios gerenciais."
  },

  // Anteriores - Março 2026
  {
    id: "evt_mar_2",
    date: "25/03/2026",
    title: "Reunião de Fechamento de Resultados Q1",
    category: "Comercial",
    time: "14:30 - 16:00",
    location: "Sala de Reuniões Matriz",
    description: "Consolidação das metas do primeiro trimestre e anúncio dos consultores destaque."
  },
  {
    id: "evt_mar_1",
    date: "08/03/2026",
    title: "Encontro Especial: Mulheres Líderes Ambozini",
    category: "Corporativo",
    time: "10:00 - 11:30",
    location: "Espaço Convivência",
    description: "Celebração do Dia Internacional da Mulher com roda de conversa e homenagens."
  },

  // Anteriores - Fevereiro 2026
  {
    id: "evt_fev_2",
    date: "24/02/2026",
    title: "Alinhamento de Diretrizes Comerciais",
    category: "Comercial",
    time: "15:00 - 16:30",
    location: "Online / Teams",
    description: "Ajuste na precificação sazonal e preparação das campanhas para o mês de março."
  },
  {
    id: "evt_fev_1",
    date: "10/02/2026",
    title: "Workshop de Logística e Desempenho Delivery",
    category: "Operacional",
    time: "10:00 - 12:30",
    location: "Hub Central Logístico",
    description: "Otimização de rotas de entrega e boas práticas para redução no tempo de expedição."
  },

  // Anteriores - Janeiro 2026
  {
    id: "evt_jan_2",
    date: "27/01/2026",
    title: "Integração e Boas-Vindas de Colaboradores Q1",
    category: "Treinamento",
    time: "14:00 - 17:00",
    location: "Sala Treinamento SP",
    description: "Acolhimento da nova turma de consultores e operadores recém-contratados."
  },
  {
    id: "evt_jan_1",
    date: "15/01/2026",
    title: "Reunião de Abertura do Planejamento Anual 2026",
    category: "Corporativo",
    time: "09:00 - 12:00",
    location: "Auditório Matriz",
    description: "Apresentação dos investimentos estratégicos e expansão da rede para o ano de 2026."
  }
];

// ========================================================
// 4. META GERAL DA EMPRESA (Janeiro a Outubro)
// ========================================================
export const historicalCompanyGoals = [
  {
    id: "current_goal",
    month: "Este mês",
    target_percent: 94,
    status_text: "Ritmo Forte 🚀",
    meta_month: "94%",
    meta_month_subtext: "Falta 6% para o topo",
    growth_percent: "+13%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "12 de 15",
    units_on_target_subtext: "80% da rede aprovada",
    engagement_percent: "100%",
    engagement_subtext: "Juntos vamos mais longe!"
  },
  {
    id: "goal_2026_10",
    month: "Outubro/2026",
    target_percent: 94,
    status_text: "Ritmo Forte 🚀",
    meta_month: "94%",
    meta_month_subtext: "Falta 6% para o topo",
    growth_percent: "+13%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "12 de 15",
    units_on_target_subtext: "80% da rede aprovada",
    engagement_percent: "100%",
    engagement_subtext: "Juntos vamos mais longe!"
  },
  {
    id: "goal_2026_09",
    month: "Setembro/2026",
    target_percent: 93,
    status_text: "Ritmo Forte 🚀",
    meta_month: "93%",
    meta_month_subtext: "Falta 7% para o topo",
    growth_percent: "+12%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "11 de 15",
    units_on_target_subtext: "73% da rede aprovada",
    engagement_percent: "100%",
    engagement_subtext: "Juntos vamos mais longe!"
  },
  {
    id: "goal_2026_08",
    month: "Agosto/2026",
    target_percent: 91,
    status_text: "Ritmo Forte 🚀",
    meta_month: "91%",
    meta_month_subtext: "Meta batida no Dia dos Pais",
    growth_percent: "+10%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "11 de 15",
    units_on_target_subtext: "73% da rede aprovada",
    engagement_percent: "99%",
    engagement_subtext: "Constância comprovada!"
  },
  {
    id: "goal_2026_07",
    month: "Julho/2026",
    target_percent: 90,
    status_text: "Ritmo Forte 🚀",
    meta_month: "90%",
    meta_month_subtext: "Aceleração no inverno",
    growth_percent: "+7%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "10 de 15",
    units_on_target_subtext: "67% da rede aprovada",
    engagement_percent: "96%",
    engagement_subtext: "Início do segundo semestre!"
  },
  {
    id: "goal_2026_06",
    month: "Junho/2026",
    target_percent: 92,
    status_text: "Meta Batida 🎯",
    meta_month: "92%",
    meta_month_subtext: "Fechamento semestral forte",
    growth_percent: "+8%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "11 de 15",
    units_on_target_subtext: "73% da rede aprovada",
    engagement_percent: "97%",
    engagement_subtext: "Primeiro semestre concluído!"
  },
  {
    id: "goal_2026_05",
    month: "Maio/2026",
    target_percent: 95,
    status_text: "Recorde Histórico 🚀",
    meta_month: "95%",
    meta_month_subtext: "Impacto do Dia das Mães",
    growth_percent: "+14%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "13 de 15",
    units_on_target_subtext: "87% da rede aprovada",
    engagement_percent: "100%",
    engagement_subtext: "Mês histórico para a rede!"
  },
  {
    id: "goal_2026_04",
    month: "Abril/2026",
    target_percent: 90,
    status_text: "Meta Batida 🎯",
    meta_month: "90%",
    meta_month_subtext: "Conversão sólida na Páscoa",
    growth_percent: "+6%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "10 de 15",
    units_on_target_subtext: "67% da rede aprovada",
    engagement_percent: "95%",
    engagement_subtext: "Consistência operacional!"
  },
  {
    id: "goal_2026_03",
    month: "Março/2026",
    target_percent: 91,
    status_text: "Supermeta 🏆",
    meta_month: "91%",
    meta_month_subtext: "Fechamento de Q1 vitorioso",
    growth_percent: "+9%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "11 de 15",
    units_on_target_subtext: "73% da rede aprovada",
    engagement_percent: "98%",
    engagement_subtext: "Primeiro trimestre batido!"
  },
  {
    id: "goal_2026_02",
    month: "Fevereiro/2026",
    target_percent: 89,
    status_text: "Meta Batida 🎯",
    meta_month: "89%",
    meta_month_subtext: "Forte ritmo no Carnaval",
    growth_percent: "+7%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "10 de 15",
    units_on_target_subtext: "67% da rede aprovada",
    engagement_percent: "96%",
    engagement_subtext: "Equipes engajadas!"
  },
  {
    id: "goal_2026_01",
    month: "Janeiro/2026",
    target_percent: 88,
    status_text: "Meta Batida 🎯",
    meta_month: "88%",
    meta_month_subtext: "Superou a projeção inicial",
    growth_percent: "+5%",
    growth_subtext: "vs. mês anterior",
    units_on_target: "9 de 15",
    units_on_target_subtext: "60% da rede aprovada",
    engagement_percent: "94%",
    engagement_subtext: "Excelente início de ano!"
  }
];

// ========================================================
// 5. TOP UNIDADES DO MÊS (Janeiro a Outubro)
// ========================================================
export function generateTopUnitsForMonths() {
  const unitsData = [];

  const monthConfigs = [
    {
      month: 'Outubro/2026',
      del: [
        { name: 'Unidade Campinas', percent: '116%', tagline: 'Liderança no início do Q4!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '111%', tagline: 'Alta conversão e agilidade!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '107%', tagline: 'Crescimento consistente!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '103%', tagline: 'Meta batida com antecedência!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '100%', tagline: 'Meta garantida!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Paulista', percent: '117%', tagline: 'Salão em ritmo de recorde!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Shopping Sul', percent: '112%', tagline: 'Giro rápido e satisfação!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '108%', tagline: 'Atendimento impecável!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '104%', tagline: 'Superação no horário executivo!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '101%', tagline: 'Padrão corporativo exemplar!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Setembro/2026',
      del: [
        { name: 'Unidade Centro', percent: '112%', tagline: 'Liderança com excelência!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '108%', tagline: 'Consistência gera resultados!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '104%', tagline: 'Grande performance!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Campinas', percent: '101%', tagline: 'Crescimento e eficiência!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '98%', tagline: 'Reta final para supermeta!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Shopping Sul', percent: '115%', tagline: 'Atendimento e giro recorde!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '110%', tagline: 'Eficiência no buffet e salão!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '106%', tagline: 'Alta conversão no almoço!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '102%', tagline: 'Padrão corporativo exemplar!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '99%', tagline: 'Giro rápido e satisfação!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Agosto/2026',
      del: [
        { name: 'Unidade Sul', percent: '114%', tagline: 'Destaque absoluto no Dia dos Pais!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '109%', tagline: 'Forte ritmo de entregas!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Ribeirão Preto', percent: '105%', tagline: 'Crescimento acelerado no interior!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '102%', tagline: 'Metas superadas!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Campinas', percent: '99%', tagline: 'Eficiência nas entregas!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Jardins', percent: '113%', tagline: 'Salão lotado com atendimento nota 10!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Shopping Sul', percent: '108%', tagline: 'Alta fidelização de clientes!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '104%', tagline: 'Conversão consistente no almoço!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '101%', tagline: 'Superação das metas!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '98%', tagline: 'Padrão corporativo exemplar!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Julho/2026',
      del: [
        { name: 'Unidade Santos', percent: '111%', tagline: 'Fidelização recorde no litoral!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '107%', tagline: 'Operação sólida no frio!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '103%', tagline: 'Crescimento e pontualidade!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '100%', tagline: 'Meta atingida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '97%', tagline: 'Ritmo contínuo!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Paulista', percent: '112%', tagline: 'Festival de sopas liderou vendas!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Shopping Sul', percent: '106%', tagline: 'Excelente fluxo nas férias!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '104%', tagline: 'Satisfação comprovada!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '101%', tagline: 'Meta batida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '98%', tagline: 'Giro rápido!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Junho/2026',
      del: [
        { name: 'Unidade Alphaville', percent: '115%', tagline: 'Qualidade máxima no fechamento H1!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '110%', tagline: 'Liderança nas capitais!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '105%', tagline: 'Ritmo forte!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '102%', tagline: 'Meta batida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '99%', tagline: 'Reta final!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Jardins', percent: '114%', tagline: 'Sucesso absoluto no cardápio junino!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '109%', tagline: 'Equipe afiada e giro ágil!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Shopping Sul', percent: '105%', tagline: 'Fluxo contínuo!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '101%', tagline: 'Meta atingida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Santo André', percent: '97%', tagline: 'Crescimento constante!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Maio/2026',
      del: [
        { name: 'Unidade Paulista', percent: '130%', tagline: 'Recorde histórico de Dia das Mães!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '118%', tagline: 'Desempenho espetacular!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '112%', tagline: 'Superação em todos os turnos!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '106%', tagline: 'Grande resultado!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '101%', tagline: 'Meta garantida!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Shopping Sul', percent: '124%', tagline: 'Salão lotado o mês inteiro!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '119%', tagline: 'Elogios diários dos clientes!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '115%', tagline: 'Alta produtividade!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '108%', tagline: 'Padrão executivo!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '103%', tagline: 'Supermeta alcançada!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Abril/2026',
      del: [
        { name: 'Unidade Santo André', percent: '120%', tagline: 'Maior expansão na Grande SP!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '109%', tagline: 'Atendimento corporativo forte!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '104%', tagline: 'Páscoa produtiva!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '101%', tagline: 'Eficiência nas rotas!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '98%', tagline: 'Rumo à supermeta!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Shopping Sul', percent: '114%', tagline: 'Fluxo intenso no feriado!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '108%', tagline: 'Excelência gastronômica!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '105%', tagline: 'Giro no almoço executivo!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '100%', tagline: 'Meta atingida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '97%', tagline: 'Ritmo constante!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Março/2026',
      del: [
        { name: 'Unidade Jardins', percent: '116%', tagline: 'NPS 99% e liderança de pedidos!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '111%', tagline: 'Fechamento de Q1 com chave de ouro!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '106%', tagline: 'Constância operacional!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '102%', tagline: 'Superação!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '98%', tagline: 'Belo trimestre!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Paulista', percent: '114%', tagline: 'Atendimento especial no Mês da Mulher!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Shopping Sul', percent: '110%', tagline: 'Resultados expressivos!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '107%', tagline: 'Qualidade superior!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '103%', tagline: 'Meta batida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '99%', tagline: 'Giro no almoço!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Fevereiro/2026',
      del: [
        { name: 'Unidade Sorocaba', percent: '122%', tagline: 'Operação de Carnaval impecável!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '108%', tagline: 'Giro ágil!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '104%', tagline: 'Pontualidade!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '101%', tagline: 'Meta superada!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '97%', tagline: 'Ritmo firme!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Shopping Sul', percent: '113%', tagline: 'Alta circulação no feriado!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '108%', tagline: 'Encantamento no buffet!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '104%', tagline: 'Alta conversão!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '101%', tagline: 'Meta atingida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '98%', tagline: 'Giro no almoço!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      month: 'Janeiro/2026',
      del: [
        { name: 'Unidade Curitiba', percent: '118%', tagline: 'Abertura de ano com força total!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Centro', percent: '110%', tagline: 'Começo de ano acelerado!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Norte', percent: '105%', tagline: 'Equipe motivada!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Sul', percent: '101%', tagline: 'Meta atingida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Leste', percent: '97%', tagline: 'Ritmo contínuo!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
      ],
      self: [
        { name: 'Unidade Shopping Sul', percent: '112%', tagline: 'Giro de férias com público recorde!', icon: '⭐', medal_bg: 'bg-[#f59e0b]', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Jardins', percent: '107%', tagline: 'Padrão gastronômico exemplar!', icon: '🏆', medal_bg: 'bg-[#94a3b8]', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Paulista', percent: '103%', tagline: 'Conversão sólida!', icon: '📊', medal_bg: 'bg-[#b45309]', image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Alphaville', percent: '100%', tagline: 'Meta garantida!', icon: '🍃', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Unidade Vila Olímpia', percent: '96%', tagline: 'Giro ágil!', icon: '🚀', medal_bg: 'bg-[#78716c]', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' }
      ]
    }
  ];

  for (const cfg of monthConfigs) {
    const slugMonth = cfg.month.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    cfg.del.forEach((u, idx) => {
      unitsData.push({
        id: `unit_${slugMonth}_del_${idx + 1}`,
        category: 'delivery',
        position: idx + 1,
        name: u.name,
        percent: u.percent,
        tagline: u.tagline,
        icon: u.icon,
        image_url: u.image_url,
        medal_bg: u.medal_bg,
        month: cfg.month
      });
    });
    cfg.self.forEach((u, idx) => {
      unitsData.push({
        id: `unit_${slugMonth}_self_${idx + 1}`,
        category: 'self-service',
        position: idx + 1,
        name: u.name,
        percent: u.percent,
        tagline: u.tagline,
        icon: u.icon,
        image_url: u.image_url,
        medal_bg: u.medal_bg,
        month: cfg.month
      });
    });
  }

  return unitsData;
}

// ========================================================
// 6. FILIAIS EM EVIDÊNCIA (Card 2 - Janeiro a Outubro)
// ========================================================
export const historicalCompanyHighlights = [
  {
    id: "destaque_empresa_out",
    title: "Filial Vila Olímpia — Liderança Q4",
    content: "Iniciou o 4º trimestre superando em 128% a meta comercial na primeira semana de outubro, com recorde de pedidos corporativos no horário executivo.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    author_name: "Diretoria de Operações",
    badge: "Filial em Evidência",
    metric: "128% da meta",
    date: "Outubro/2026",
    likes_count: 61,
    user_liked: false
  },
  {
    id: "destaque_empresa_set",
    title: "Filial Campinas — Maior Eficiência",
    content: "Com 125% da meta comercial atingida e índice recorde de 98% de satisfação dos clientes no mês. Vocês inspiram toda a rede!",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    author_name: "Diretoria de Expansão",
    badge: "Filial em Evidência",
    metric: "125% da meta",
    date: "Setembro/2026",
    likes_count: 54,
    user_liked: false
  },
  {
    id: "destaque_empresa_ago",
    title: "Filial Ribeirão Preto — Superação no Varejo",
    content: "Crescimento de 32% em novos clientes corporativos e pontualidade exemplar em todas as entregas e operações logísticas.",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
    author_name: "Gestão Regional Sul",
    badge: "Destaque em Crescimento",
    metric: "+32% novos clientes",
    date: "Agosto/2026",
    likes_count: 48,
    user_liked: false
  },
  {
    id: "destaque_empresa_jul",
    title: "Filial Santos — Fidelização e Retenção",
    content: "Maior taxa de fidelização e nota máxima nas auditorias de qualidade corporativa. Orgulho para todo o grupo Ambozini!",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    author_name: "Comitê de Qualidade",
    badge: "Fidelização Recorde",
    metric: "99% satisfação",
    date: "Julho/2026",
    likes_count: 68,
    user_liked: false
  },
  {
    id: "destaque_empresa_jun",
    title: "Filial Alphaville — Qualidade & Padrão",
    content: "Reconhecida pelo padrão executivo impecável, zero atrasos no delivery e 115% de superação de faturamento no fechamento de H1.",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    author_name: "Diretoria de Operações",
    badge: "Destaque em Qualidade",
    metric: "115% da meta",
    date: "Junho/2026",
    likes_count: 62,
    user_liked: false
  },
  {
    id: "destaque_empresa_mai",
    title: "Filial Paulista — Recorde Dia das Mães",
    content: "Com 130% da meta batida, a filial bateu o recorde histórico de atendimentos simultâneos mantendo tempo médio de espera abaixo de 4 minutos.",
    image_url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&auto=format&fit=crop&q=80",
    author_name: "Gestão Regional Centro",
    badge: "Recorde Histórico",
    metric: "130% da meta",
    date: "Maio/2026",
    likes_count: 79,
    user_liked: false
  },
  {
    id: "destaque_empresa_abr",
    title: "Filial Santo André — Superação Comercial",
    content: "Liderou a conversão de novos contratos corporativos no ABC Paulista com 120% do orçamento atingido.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    author_name: "Diretoria Comercial",
    badge: "Filial em Evidência",
    metric: "120% da meta",
    date: "Abril/2026",
    likes_count: 51,
    user_liked: false
  },
  {
    id: "destaque_empresa_mar",
    title: "Filial Jardins — Excelência Gastronômica",
    content: "Conquistou a nota máxima na avaliação de encantamento de clientes e fechou o Q1 com 116% de faturamento consolidado.",
    image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80",
    author_name: "Comitê de Qualidade",
    badge: "NPS Ouro",
    metric: "99% satisfação",
    date: "Março/2026",
    likes_count: 73,
    user_liked: false
  },
  {
    id: "destaque_empresa_fev",
    title: "Filial Sorocaba — Giro Rápido no Carnaval",
    content: "Agilidade operacional exemplar no feriado prolongado, garantindo 122% da meta com pontualidade impecável.",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
    author_name: "Gestão Regional Interior",
    badge: "Destaque Regional",
    metric: "122% da meta",
    date: "Fevereiro/2026",
    likes_count: 46,
    user_liked: false
  },
  {
    id: "destaque_empresa_jan",
    title: "Filial Curitiba — Eficiência de Abertura",
    content: "Abertura de ano com desempenho exemplar, liderando as entregas com 118% da meta atingida no primeiro mês de 2026.",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    author_name: "Diretoria de Expansão",
    badge: "Filial em Evidência",
    metric: "118% da meta",
    date: "Janeiro/2026",
    likes_count: 57,
    user_liked: false
  }
];

// ========================================================
// 7. COLABORADORAS E COLABORADORES DO MÊS (Card 3 - Janeiro a Outubro)
// ========================================================
export const historicalEmployeeHighlights = [
  {
    id: "destaque_func_out",
    name: "Rafael Mendonça",
    role: "Coordenador de Atendimento & Salão",
    badge: "Colaborador do Mês",
    award: "Excelência no Atendimento",
    content: "Liderou a implantação do novo protocolo de recepção ágil na Unidade Paulista, elevando o índice de satisfação dos clientes a 99,4% em outubro.",
    image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
    date: "Outubro/2026",
    likes_count: 69,
    user_liked: false
  },
  {
    id: "destaque_func_set",
    name: "Joana Prado",
    role: "Consultora Comercial Sênior",
    badge: "Colaboradora do Mês",
    award: "Homenagem Ambozini",
    content: "Reconhecida pela pontualidade, atendimento encantador e apoio aos novos integrantes da equipe na Unidade Centro.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    date: "Setembro/2026",
    likes_count: 63,
    user_liked: false
  },
  {
    id: "destaque_func_ago",
    name: "Carlos Eduardo",
    role: "Líder Comercial de Unidade",
    badge: "Colaborador do Mês",
    award: "Destaque em Vendas",
    content: "Superou a meta individual em 140% com consultoria proativa exemplar e mentoria dedicada para novos integrantes na Unidade Jardins.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    date: "Agosto/2026",
    likes_count: 55,
    user_liked: false
  },
  {
    id: "destaque_func_jul",
    name: "Mariana Alencar",
    role: "Consultora Comercial Sênior",
    badge: "Colaboradora do Mês",
    award: "Consultoria Proativa",
    content: "Pioneira na implementação de rotinas de follow-up que aumentaram o fechamento de novos contratos corporativos na Unidade Norte.",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    date: "Julho/2026",
    likes_count: 71,
    user_liked: false
  },
  {
    id: "destaque_func_jun",
    name: "Fernando Castro",
    role: "Analista de Processos",
    badge: "Colaborador do Mês",
    award: "Inovação & Eficiência",
    content: "Desenvolveu o modelo de controle digital de etiquetagem que reduziu em 100% perdas de alimentos na câmara fria da Unidade Alphaville.",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    date: "Junho/2026",
    likes_count: 58,
    user_liked: false
  },
  {
    id: "destaque_func_mai",
    name: "Juliana Meireles",
    role: "Supervisora de Operações",
    badge: "Colaboradora do Mês",
    award: "Superação Operacional",
    content: "Coordenação brilhante durante a operação do Dia das Mães, garantindo excelência de atendimento e zero atrasos nas expedições.",
    image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    date: "Maio/2026",
    likes_count: 67,
    user_liked: false
  },
  {
    id: "destaque_func_abr",
    name: "Lucas Vasconcelos",
    role: "Especialista em Atendimento",
    badge: "Colaborador do Mês",
    award: "Agilidade & Empatia",
    content: "Reconhecido pela agilidade recorde na expedição do delivery e pelos inúmeros elogios recebidos no SAC da Unidade Leste.",
    image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
    date: "Abril/2026",
    likes_count: 64,
    user_liked: false
  },
  {
    id: "destaque_func_mar",
    name: "Amanda Furtado",
    role: "Gerente de Unidade",
    badge: "Colaboradora do Mês",
    award: "Liderança Inspiradora",
    content: "Conduziu a Unidade Paulista ao 1º lugar do ranking no Mês da Mulher com liderança humana, engajamento e foco em pessoas.",
    image_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80",
    date: "Março/2026",
    likes_count: 82,
    user_liked: false
  },
  {
    id: "destaque_func_fev",
    name: "Renata Silveira",
    role: "Consultora de Vendas",
    badge: "Colaboradora do Mês",
    award: "Atendimento Ouro",
    content: "Destaque de simpatia e cordialidade em Sorocaba, alcançando a marca de 100% de avaliações 5 estrelas no totem de autoatendimento.",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
    date: "Fevereiro/2026",
    likes_count: 53,
    user_liked: false
  },
  {
    id: "destaque_func_jan",
    name: "Thiago Martins",
    role: "Supervisor de Logística",
    badge: "Colaborador do Mês",
    award: "Destaque Logístico",
    content: "Otimizou as rotas de entrega no início do ano na Unidade Curitiba, garantindo pontualidade absoluta mesmo em dias de chuva forte.",
    image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
    date: "Janeiro/2026",
    likes_count: 60,
    user_liked: false
  }
];
