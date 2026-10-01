// scripts/seed-data.js
import http from 'http';

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3005,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(body);
            }
          } else {
            reject(new Error(`Status ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// 1. CALENDÁRIO CORPORATIVO (Futuros + Passados para validação do filtro)
const calendarEvents = [
  {
    id: 'cal_1',
    date: '24/09',
    title: 'Workshop de Excelência no Atendimento & CRM GIA',
    category: 'Treinamento',
    time: '14:00 às 16:30',
    location: 'Auditório Matriz & Google Meet',
    description: 'Capacitação prática para consultores comerciais e assistentes operacionais com apresentação dos novos recursos do CRM e simulações de atendimento.'
  },
  {
    id: 'cal_2',
    date: '26/09',
    title: 'Alinhamento Mensal de Metas e Fechamento Q3',
    category: 'Comercial',
    time: '09:30 às 11:00',
    location: 'Sala de Reuniões Diretoria',
    description: 'Apresentação dos resultados da rede Ambozini, premiação das filiais destaque e distribuição das supermetas do trimestre.'
  },
  {
    id: 'cal_3',
    date: '29/09',
    title: 'Campanha de Saúde & Bem-Estar Corporativo (SIPAT)',
    category: 'Corporativo',
    time: '08:30 às 17:00',
    location: 'Espaço Convivência - Todas as Filiais',
    description: 'Dia dedicado à prevenção, ergonomia no trabalho e check-ups básicos de saúde com profissionais convidados.'
  },
  {
    id: 'cal_4',
    date: '02/10',
    title: 'Treinamento de Liderança e Gestão Ágil de Equipes',
    category: 'Integração',
    time: '15:00 às 17:00',
    location: 'Sala Multiuso 01',
    description: 'Módulo avançado de gestão humanizada e liderança estratégica para supervisores e gerentes de unidade.'
  },
  {
    id: 'cal_5',
    date: '08/10',
    title: 'Inauguração Oficial da Nova Unidade Alphaville',
    category: 'Operacional',
    time: '19:00 às 22:00',
    location: 'Alameda Rio Negro, 1500 - Alphaville',
    description: 'Coquetel comemorativo de inauguração da 16ª unidade da Rede Ambozini com presença da diretoria, franqueados e parceiros.'
  },
  {
    id: 'cal_6',
    date: '15/10',
    title: 'Convenção Anual de Vendas e Premiação da Rede',
    category: 'Corporativo',
    time: '18:00 às 23:00',
    location: 'Centro de Convenções Campinas',
    description: 'Grande celebração anual com reconhecimento dos melhores colaboradores do ano, jantar de gala e metas 2027.'
  },
  // EVENTOS PASSADOS (Devem ser OMITIDOS visualmente na tela pelo filtro de eventos futuros!)
  {
    id: 'cal_past_1',
    date: '05/09',
    title: 'Reunião de Abertura do Mês de Setembro (Passado)',
    category: 'Operacional',
    time: '09:00 às 10:00',
    location: 'Sala Matriz',
    description: 'Evento passado realizado no início do mês.'
  },
  {
    id: 'cal_past_2',
    date: '12/09',
    title: 'Auditoria de Rotinas Fiscais e Suprimentos (Passado)',
    category: 'Corporativo',
    time: '14:00',
    location: 'Unidade Sul',
    description: 'Auditoria periódica de qualidade já encerrada.'
  }
];

// 2. COMUNICADOS GERAIS (Announcements)
const announcements = [
  {
    id: 'com_1',
    targetCard: 'comunicados',
    title: 'Nova Campanha de Bonificação Trimestral e Supermetas Q4',
    date: '22 de setembro',
    author: 'Diretoria Comercial',
    authorDepartment: 'Comercial',
    visibility: 'public',
    summary: 'Aceleração de metas para o fechamento do ano com premiação exclusiva para as unidades com maior taxa de conversão.',
    content: 'Prezados colaboradores,\n\nTemos o orgulho de lançar a Campanha SuperAção Ambozini 2026. A partir da próxima semana, as unidades que atingirem a meta com mais de 5 dias de antecedência receberão bonificação especial em folha e troféu destaque corporativo.',
    icon: 'trophy',
    tag: 'Comercial',
    tags: ['Metas', 'Comercial', 'Campanha'],
    badge: 'Destaque',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    likesCount: 52,
    userLiked: false,
    comments: [
      {
        id: 'ac_101',
        author: 'Marcos Lima',
        role: 'Gerente Unidade Sul',
        date: 'Ontem às 16:20',
        text: 'Unidade Sul já está com a estratégia montada. Vamos com tudo bater a supermeta!'
      }
    ],
    actionButtonText: 'Ver Tabela de Bonificações',
    actionButtonUrl: '#metas',
    actionButtonSubtext: 'Regras e critérios de premiação disponíveis'
  },
  {
    id: 'com_2',
    targetCard: 'comunicados',
    title: 'Atualização das Diretrizes de Segurança da Informação e Acesso GIA',
    date: '20 de setembro',
    author: 'TI & Compliance',
    authorDepartment: 'Tecnologia da Informação',
    visibility: 'members_only',
    summary: 'Implementação da autenticação em duas etapas e recomendações para proteção de dados de clientes.',
    content: 'Informamos a todos os usuários do Portal Ambozini e sistema GIA que os protocolos de segurança foram atualizados em conformidade com as melhores práticas de governança corporativa e LGPD. Nunca compartilhe sua senha de acesso.',
    icon: 'shield-check',
    tag: 'TI & Sistemas',
    tags: ['Segurança', 'GIA', 'Compliance'],
    badge: 'Oficial',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    isFeatured: true,
    likesCount: 38,
    userLiked: false,
    comments: [],
    actionButtonText: 'Manual de Boas Práticas TI',
    actionButtonUrl: '#ti-seguranca',
    actionButtonSubtext: 'Acesso restrito para colaboradores'
  },
  {
    id: 'com_3',
    targetCard: 'comunicados',
    title: 'Programa Bem-Estar: Conheça os Novos Convênios e Benefícios de Saúde',
    date: '18 de setembro',
    author: 'Recursos Humanos',
    authorDepartment: 'RH & Gente',
    visibility: 'public',
    summary: 'Parceria ampliada com academias, telemedicina 24h e apoio psicológico gratuito para colaboradores e dependentes.',
    content: 'Cuidar de você é nossa prioridade número um. A partir deste mês, todos os colaboradores da Rede Ambozini têm acesso ao plano expandido de saúde e bem-estar corporativo com descontos exclusivos em farmácias parceiras.',
    icon: 'heart',
    tag: 'RH & Pessoas',
    tags: ['Benefícios', 'Saúde', 'Cuidado'],
    badge: 'Benefícios',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    likesCount: 64,
    userLiked: false,
    comments: [],
    actionButtonText: 'Acessar Portal de Benefícios',
    actionButtonUrl: '#beneficios',
    actionButtonSubtext: 'Guia completo de utilização'
  },
  {
    id: 'com_4',
    targetCard: 'comunicados',
    title: 'Expansão da Rede: Obras da 16ª Filial em Ritmo Acelerado',
    date: '15 de setembro',
    author: 'Expansão & Novos Negócios',
    authorDepartment: 'Engenharia & Expansão',
    visibility: 'public',
    summary: 'A nova unidade Alphaville está na reta final de acabamento e abrirá 45 novos postos de trabalho.',
    content: 'O plano de crescimento da Ambozini não para. A futura unidade Alphaville contará com instalações de ponta, buffet self-service premium e central de delivery automatizada.',
    icon: 'store',
    tag: 'Expansão',
    tags: ['NovasUnidades', 'Crescimento'],
    badge: 'Novidade',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    likesCount: 79,
    userLiked: false,
    comments: [],
    actionButtonText: 'Conferir Cronograma de Obras',
    actionButtonUrl: '#obras',
    actionButtonSubtext: 'Inauguração prevista para Outubro/2026'
  },
  {
    id: 'com_6',
    targetCard: 'comunicados',
    title: 'Horário Especial de Atendimento e Escala no Próximo Feriado',
    date: '12 de setembro',
    author: 'Operações & Logística',
    authorDepartment: 'Operações',
    visibility: 'members_only',
    summary: 'Orientações sobre escala de plantão, logística de suprimentos e remuneração adicional para feriados.',
    content: 'Comunicamos as diretrizes operacionais para o funcionamento das unidades durante o próximo feriado. Consulte sua liderança imediata para conferir a escala de trabalho e suporte operacional.',
    icon: 'clock',
    tag: 'Operacional',
    tags: ['Escala', 'Feriado', 'Operação'],
    badge: 'Importante',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    likesCount: 27,
    userLiked: false,
    comments: []
  },
  {
    id: 'com_7',
    targetCard: 'comunicados',
    title: 'Canal de Ética e Transparência Corporativa Ambozini',
    date: '08 de setembro',
    author: 'Comitê de Ética & Compliance',
    authorDepartment: 'Compliance',
    visibility: 'public',
    summary: 'Canal anônimo e seguro para registro de dúvidas éticas, sugestões de melhoria e conduta.',
    content: 'A ética é o alicerce fundamental do Grupo Ambozini. Nosso canal independente está disponível 24h por dia para todos os colaboradores e parceiros de negócios.',
    icon: 'book-open',
    tag: 'Compliance',
    tags: ['Ética', 'Compliance', 'Valores'],
    badge: 'Institucional',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    isFeatured: false,
    likesCount: 35,
    userLiked: false,
    comments: []
  }
];

// 3. FÓRUM & COMUNIDADE (Forum Posts)
const forumPosts = [
  {
    id: 'post_1',
    targetCard: 'forum',
    visibility: 'public',
    author: {
      name: 'Mariana Alencar',
      role: 'Consultora Comercial Sênior',
      unit: 'Unidade Norte',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    title: 'Dica prática que aumentou nosso fechamento em 30% no atendimento ao cliente 💡📈',
    category: 'Dicas de Vendas',
    tag: '#Vendas #Dicas #Sucesso',
    createdAt: 'Há 2 horas',
    timeAgo: 'Há 2 horas',
    content: 'Olá pessoal da rede! Queria compartilhar uma técnica que testamos essa semana na Unidade Norte: enviar uma mensagem de confirmação atenciosa 1 hora antes de cada retirada no balcão. A taxa de satisfação e recompra subiu muito! Alguém mais testou algo parecido nas outras filiais?',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    likes: 42,
    userLiked: false,
    isLiked: false,
    commentsCount: 2,
    comments: [
      {
        id: 'fpc_101',
        author: 'Rodrigo Faria',
        role: 'Supervisor Comercial',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        date: 'Há 1 hora',
        text: 'Excelente iniciativa, Mari! Já estamos adaptando para testar na Unidade Sul também.'
      },
      {
        id: 'fpc_102',
        author: 'Carlos Eduardo',
        role: 'Líder Comercial',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        date: 'Há 30 minutos',
        text: 'O cliente adora essa atenção ao detalhe. Parabéns pela iniciativa!'
      }
    ],
    pinned: true
  },
  {
    id: 'post_2',
    targetCard: 'forum',
    visibility: 'members_only',
    author: {
      name: 'Lucas Vasconcelos',
      role: 'Especialista em Operações',
      unit: 'Unidade Leste',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
    },
    title: 'Batemos 110% da meta semanal hoje na Unidade Leste! Orgulho dessa equipe! 🚀🔥',
    category: 'Comemoração',
    tag: '#MetaBatida #OrgulhoAmbozini #Leste',
    createdAt: 'Há 4 horas',
    timeAgo: 'Há 4 horas',
    content: 'Passando para celebrar o esforço gigante de todo o time da cozinha, salão e delivery da Unidade Leste. Hoje superamos a meta de sexta-feira às 15h! O buffet foi um sucesso absoluto. Gratidão a cada um pelo compromisso diário!',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    likes: 68,
    userLiked: true,
    isLiked: true,
    commentsCount: 1,
    comments: [
      {
        id: 'fpc_103',
        author: 'João Silva',
        role: 'Gerente de Operações',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        date: 'Há 3 horas',
        text: 'Trabalho impecável Lucas! A dedicação de vocês é um orgulho para toda a rede Ambozini!'
      }
    ],
    pinned: false
  },
  {
    id: 'post_3',
    targetCard: 'forum',
    visibility: 'public',
    author: {
      name: 'Patrícia Nogueira',
      role: 'Analista de Suporte & TI',
      unit: 'Matriz',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
    },
    title: 'Dúvida rápida: Precisa de suporte técnico ou novo ramal? Veja como abrir chamado 💻🛠️',
    category: 'Dúvidas & Suporte',
    tag: '#SuporteTI #GIA #Atendimento',
    createdAt: 'Ontem às 16:40',
    timeAgo: 'Ontem às 16:40',
    content: 'Para agilizar o atendimento de chamados de impressora, terminal POS ou acesso ao GIA, lembrem-se de discar o ramal 2040 ou usar a aba de Suporte do portal. Estamos respondendo as solicitações em menos de 10 minutos!',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    likes: 31,
    userLiked: false,
    isLiked: false,
    commentsCount: 1,
    comments: [
      {
        id: 'fpc_104',
        author: 'Mariana Costa',
        role: 'Especialista em Suporte',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        date: 'Ontem às 17:10',
        text: 'Reforçando que todos os tutoriais também estão disponíveis na aba Documentos!'
      }
    ],
    pinned: false
  },
  {
    id: 'post_4',
    targetCard: 'forum',
    visibility: 'members_only',
    author: {
      name: 'Carlos Eduardo',
      role: 'Líder Comercial',
      unit: 'Unidade Centro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    title: 'Receita do sucesso: Como organizamos os horários de pico no buffet e delivery 🍲⏱️',
    category: 'Operação & Logística',
    tag: '#Operação #Eficiência #GiroDeMesas',
    createdAt: 'Ontem às 11:20',
    timeAgo: 'Ontem às 11:20',
    content: 'Compartilhando nosso novo fluxo de reposição contínua entre 11h30 e 13h30. Conseguimos zerar qualquer tempo de espera na fila das saladas e pratos quentes. Quem quiser o checklist operacional pode me chamar no chat interno!',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    likes: 55,
    userLiked: false,
    isLiked: false,
    commentsCount: 1,
    comments: [
      {
        id: 'fpc_105',
        author: 'Joana Prado',
        role: 'Consultora Sênior',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        date: 'Ontem às 12:05',
        text: 'Ficou perfeito Carlos! Fez toda a diferença no ritmo do atendimento.'
      }
    ],
    pinned: false
  },
  {
    id: 'post_5',
    targetCard: 'forum',
    visibility: 'public',
    author: {
      name: 'Renata Silveira',
      role: 'Coordenação de RH',
      unit: 'Matriz',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    title: 'Inscrições abertas para a Oficina de Comunicação Assertiva e Liderança 🎙️✨',
    category: 'Eventos & Treinamentos',
    tag: '#Desenvolvimento #Treinamento #Carreira',
    createdAt: 'Há 2 dias',
    timeAgo: 'Há 2 dias',
    content: 'Quer desenvolver suas habilidades de comunicação interpessoal e falar com mais segurança em reuniões? As inscrições para a turma de outubro já estão abertas na área de RH. Vagas limitadas para colaboradores de todas as unidades!',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    likes: 47,
    userLiked: false,
    isLiked: false,
    commentsCount: 0,
    comments: [],
    pinned: false
  },
  {
    id: 'post_6',
    targetCard: 'forum',
    visibility: 'public',
    author: {
      name: 'João Silva',
      role: 'Gerente de Operações',
      unit: 'Unidade Centro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    title: 'Boas-vindas aos 8 novos colaboradores que iniciaram a integração esta semana! 👏🤝',
    category: 'Geral',
    tag: '#Integração #BemVindos #FamíliaAmbozini',
    createdAt: 'Há 3 dias',
    timeAgo: 'Há 3 dias',
    content: 'Nossa equipe continua expandindo com muito talento e dedicação. Desejamos muito sucesso aos novos integrantes das filiais Centro, Campinas e Leste. Contem com o apoio de todos nós nesta jornada!',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    likes: 83,
    userLiked: true,
    isLiked: true,
    commentsCount: 0,
    comments: [],
    pinned: false
  }
];

async function run() {
  console.log('🚀 Iniciando cadastro de postagens de teste...');

  // 1. Calendário
  console.log('\n📅 Cadastrando Eventos no Calendário...');
  for (const ev of calendarEvents) {
    try {
      await postJson('/api/calendar', ev);
      console.log(`  ✅ [Calendário] ${ev.date} - ${ev.title}`);
    } catch (err) {
      console.warn(`  ⚠️ [Calendário] Erro ao cadastrar ${ev.id}:`, err.message);
    }
  }

  // 2. Comunicados
  console.log('\n📢 Cadastrando Comunicados Gerais...');
  for (const ann of announcements) {
    try {
      await postJson('/api/announcements', ann);
      console.log(`  ✅ [Comunicado] ${ann.title}`);
    } catch (err) {
      console.warn(`  ⚠️ [Comunicado] Erro ao cadastrar ${ann.id}:`, err.message);
    }
  }

  // 3. Fórum
  console.log('\n💬 Cadastrando Posts no Fórum & Comunidade...');
  for (const post of forumPosts) {
    try {
      await postJson('/api/posts', post);
      console.log(`  ✅ [Fórum] ${post.title}`);
    } catch (err) {
      console.warn(`  ⚠️ [Fórum] Erro ao cadastrar ${post.id}:`, err.message);
    }
  }

  console.log('\n✨ Todas as postagens de teste foram cadastradas com sucesso!');
}

run().catch((err) => {
  console.error('❌ Falha geral na execução do seed:', err);
  process.exit(1);
});
