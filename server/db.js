import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  historicalAnnouncements,
  historicalPosts,
  historicalCalendarEvents,
  historicalCompanyGoals,
  generateTopUnitsForMonths,
  historicalCompanyHighlights,
  historicalEmployeeHighlights
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/pglite-db');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

function cleanStaleLock() {
  const pidFile = path.join(dbPath, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
      console.log('🧹 Arquivo postmaster.pid residual removido.');
    } catch (e) {
      // Ignora se não conseguir remover
    }
  }
}

cleanStaleLock();

export let db = new PGlite(dbPath);

export async function initDatabase() {
  console.log('🔄 Inicializando banco de dados Postgres Lite (PGlite)...');

  try {
    await db.waitReady;
  } catch (err) {
    console.warn('⚠️ Detectada inconsistência no WAL/checkpoint do banco. Restaurando integridade...', err?.message || err);
    try {
      if (db && typeof db.close === 'function') {
        await db.close().catch(() => {});
      }
      fs.rmSync(dbPath, { recursive: true, force: true });
      fs.mkdirSync(dbPath, { recursive: true });
      db = new PGlite(dbPath);
      await db.waitReady;
      console.log('✅ Banco Postgres Lite recuperado e pronto!');
    } catch (recoveryErr) {
      console.error('❌ Falha na recuperação automática:', recoveryErr);
      throw recoveryErr;
    }
  }

  // 1. Tabela de Comunicados Oficiais e Avisos
  await db.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      target_card TEXT DEFAULT 'comunicados',
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      visibility TEXT DEFAULT 'members_only',
      summary TEXT,
      content TEXT,
      icon TEXT DEFAULT 'megaphone',
      tag TEXT DEFAULT 'Comunicado',
      badge TEXT,
      image_url TEXT,
      is_featured BOOLEAN DEFAULT FALSE,
      likes_count INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE,
      comments JSONB DEFAULT '[]'::jsonb,
      action_button_text TEXT,
      action_button_url TEXT,
      action_button_subtext TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS action_button_text TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS action_button_url TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS action_button_subtext TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS action_button_open_new_tab BOOLEAN DEFAULT TRUE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_department TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS contact_info TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'info';`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{"type":"all"}'::jsonb;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS related_links JSONB DEFAULT '[]'::jsonb;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS publish_mode TEXT DEFAULT 'now';`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS start_date TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expire_date TEXT;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS allow_reactions BOOLEAN DEFAULT TRUE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT TRUE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS require_read_confirmation BOOLEAN DEFAULT FALSE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS confirmed_by JSONB DEFAULT '[]'::jsonb;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS confirmations_count INT DEFAULT 0;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
  await db.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS audit_log JSONB DEFAULT '[]'::jsonb;`);

  await db.query(`
    UPDATE announcements
    SET action_button_text = 'Consultar Holerite / Comprovante',
        action_button_url = '#holerite',
        action_button_subtext = 'Crédito em conta confirmado • Ciclo ativo'
    WHERE id = 'com_5' AND (action_button_text IS NULL OR action_button_text = '');
  `);

  const com5Exists = await db.query(`SELECT id FROM announcements WHERE id = 'com_5';`);
  if (com5Exists.rows.length === 0) {
    await db.query(`
      INSERT INTO announcements (id, target_card, title, author, date, visibility, summary, content, icon, tag, badge, image_url, is_featured, likes_count, user_liked, comments, action_button_text, action_button_url, action_button_subtext)
      VALUES (
        'com_5',
        'comunicados',
        'Processamento de folha de pagamento e benefícios',
        'RH & Departamento Pessoal',
        '01 de setembro',
        'members_only',
        'Informes sobre o fechamento da folha e liberação dos comprovantes de benefícios.',
        'O processamento salarial referente ao ciclo corrente foi concluído com sucesso. Os holerites e comprovantes de benefícios já estão disponíveis no sistema de autoatendimento para consulta de todos os colaboradores ativos.',
        'coins',
        'RH & Folha',
        'Destaque Principal',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        true,
        67,
        false,
        '[]'::jsonb,
        'Consultar Holerite / Comprovante',
        '#holerite',
        'Crédito em conta confirmado • Ciclo ativo'
      );
    `);
  }

  // 2. Tabela de Postagens do Fórum & Comunidade
  await db.query(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      target_card TEXT DEFAULT 'forum',
      visibility TEXT DEFAULT 'members_only',
      author JSONB NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Geral',
      tag TEXT,
      created_at TEXT DEFAULT 'Hoje',
      time_ago TEXT DEFAULT 'Hoje',
      content TEXT NOT NULL,
      image_url TEXT,
      likes INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE,
      is_liked BOOLEAN DEFAULT FALSE,
      comments_count INT DEFAULT 0,
      comments JSONB DEFAULT '[]'::jsonb,
      pinned BOOLEAN DEFAULT FALSE,
      created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
  await db.query(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS audit_log JSONB DEFAULT '[]'::jsonb;`);
  await db.query(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS timestamp TEXT;`);
  await db.query(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS video_url TEXT;`);
  await db.query(`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS video_type TEXT;`);

  // Backfill de status e log de criação para postagens e comunicados que ainda não possuem
  await db.query(`
    UPDATE forum_posts
    SET is_active = TRUE
    WHERE is_active IS NULL;
  `);
  await db.query(`
    UPDATE announcements
    SET is_active = TRUE
    WHERE is_active IS NULL;
  `);

  // Atualização cronológica precisa dos horários dos posts do fórum
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = NOW() - INTERVAL '2 hours',
      timestamp = (NOW() - INTERVAL '2 hours')::text
    WHERE id = 'post_1';
  `);
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = NOW() - INTERVAL '4 hours',
      timestamp = (NOW() - INTERVAL '4 hours')::text
    WHERE id = 'post_2';
  `);
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 40 minutes'),
      timestamp = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 40 minutes')::text
    WHERE id = 'post_3';
  `);
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 20 minutes'),
      timestamp = (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 20 minutes')::text
    WHERE id = 'post_4';
  `);
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = NOW() - INTERVAL '2 days',
      timestamp = (NOW() - INTERVAL '2 days')::text
    WHERE id = 'post_5';
  `);
  await db.query(`
    UPDATE forum_posts SET 
      created_timestamp = NOW() - INTERVAL '3 days',
      timestamp = (NOW() - INTERVAL '3 days')::text
    WHERE id = 'post_6';
  `);
  await db.query(`
    UPDATE forum_posts
    SET timestamp = created_timestamp::text
    WHERE timestamp IS NULL;
  `);

  // 3. Tabela do Calendário Corporativo
  await db.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      time TEXT,
      location TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Tabela de Cards Dinâmicos Livres (Card 1, Card 2, Card 3, Card 4)
  await db.query(`
    CREATE TABLE IF NOT EXISTS dynamic_cards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      author_name TEXT,
      author_role TEXT,
      author_avatar TEXT,
      updated_at TEXT,
      likes_count INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE
    );
  `);

  // 4.1 Tabela de Pensamentos do Dia (Card 1)
  await db.query(`
    CREATE TABLE IF NOT EXISTS motivational_thoughts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT DEFAULT 'Pensamento do Dia',
      image_url TEXT,
      tagline TEXT,
      likes_count INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      position INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Tabela de Slides dos Valores da Empresa (Card 4)
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_values (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      quote TEXT,
      image TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      mode TEXT DEFAULT 'custom',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Tabela de Destaque Empresa (Card 2)
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_highlights (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      author_name TEXT,
      badge TEXT,
      metric TEXT,
      likes_count INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE
    );
  `);

  // 7. Tabela de Funcionário Destaque (Card 3)
  await db.query(`
    CREATE TABLE IF NOT EXISTS employee_highlights (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      badge TEXT,
      content TEXT,
      image_url TEXT,
      likes_count INT DEFAULT 0,
      user_liked BOOLEAN DEFAULT FALSE
    );
  `);

  // 8. Tabela de Meta Geral da Empresa
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_goals (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      target_percent INT DEFAULT 93,
      status_text TEXT DEFAULT 'Ritmo Forte 🚀',
      meta_month TEXT DEFAULT '93%',
      meta_month_subtext TEXT DEFAULT 'Falta 7% para o topo',
      growth_percent TEXT DEFAULT '+12%',
      growth_subtext TEXT DEFAULT 'vs. mês anterior',
      units_on_target TEXT DEFAULT '11 de 15',
      units_on_target_subtext TEXT DEFAULT '73% da rede aprovada',
      engagement_percent TEXT DEFAULT '100%',
      engagement_subtext TEXT DEFAULT 'Juntos vamos mais longe!'
    );
  `);

  // 9. Tabela de Top Unidades do Mês
  await db.query(`
    CREATE TABLE IF NOT EXISTS top_units_ranking (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      position INT NOT NULL,
      name TEXT NOT NULL,
      percent TEXT NOT NULL,
      tagline TEXT,
      icon TEXT,
      image_url TEXT,
      medal_bg TEXT
    );
  `);

  await db.query(`ALTER TABLE company_highlights ADD COLUMN IF NOT EXISTS date TEXT DEFAULT 'Setembro/2026';`);
  await db.query(`ALTER TABLE employee_highlights ADD COLUMN IF NOT EXISTS date TEXT DEFAULT 'Setembro/2026';`);
  await db.query(`ALTER TABLE employee_highlights ADD COLUMN IF NOT EXISTS award TEXT DEFAULT 'Homenagem Ambozini';`);
  await db.query(`ALTER TABLE top_units_ranking ADD COLUMN IF NOT EXISTS month TEXT DEFAULT 'Setembro/2026';`);

  console.log('✅ Tabelas criadas com sucesso no Postgres Lite!');

  // Realiza Seed inicial caso o banco esteja vazio
  await seedIfEmpty();

  // Popula e assegura integridade de dados históricos de 2026 (Janeiro até o mês atual)
  await seedHistoricalMonthsData();
}

async function seedIfEmpty() {
  console.log('🔍 Verificando integridade das tabelas no Postgres Lite...');

  // 1. Seed de Comunicados (incluindo Folha de Pagamento)
  const annCountRes = await db.query('SELECT COUNT(*) AS count FROM announcements;');
  const annCount = parseInt(annCountRes.rows[0].count, 10);

  if (annCount === 0) {
    console.log('🌱 Populando announcements com dados iniciais (Seed)...');
    const initialAnnouncements = [
      {
        id: "com_5",
        target_card: "comunicados",
        title: "Processamento de folha de pagamento e benefícios",
        date: "01 de setembro",
        author: "RH & Departamento Pessoal",
        visibility: "members_only",
        summary: "Informes sobre o fechamento da folha e liberação dos comprovantes de benefícios.",
        content: "O processamento salarial referente ao ciclo corrente foi concluído com sucesso. Os holerites e comprovantes de benefícios já estão disponíveis no sistema de autoatendimento para consulta de todos os colaboradores ativos.",
        icon: "coins",
        tag: "RH & Folha",
        badge: "Destaque Principal",
        image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
        is_featured: true,
        likes_count: 67,
        user_liked: false,
        comments: [],
        action_button_text: "Consultar Holerite / Comprovante",
        action_button_url: "#holerite",
        action_button_subtext: "Crédito em conta confirmado • Ciclo ativo"
      },
      {
        id: "com_1",
        target_card: "comunicados",
        title: "Nova campanha de vendas e bonificação trimestral",
        date: "15 de setembro",
        author: "Diretoria Comercial",
        visibility: "public",
        summary: "Nossa nova campanha começa no dia 15/09. Contamos com o empenho de todos para batermos o recorde!",
        content: "Prezada equipe Ambozini,\n\nNa próxima semana daremos início à nova campanha trimestral de metas. Haverá bonificações exclusivas para consultores e unidades que atingirem a meta com 10 dias de antecedência.",
        icon: "megaphone",
        tag: "Vendas",
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
        ]
      },
      {
        id: "com_2",
        target_card: "comunicados",
        title: "Treinamento geral e novos módulos do sistema GIA",
        date: "22 de setembro",
        author: "RH & Desenvolvimento",
        visibility: "members_only",
        summary: "Treinamento obrigatório para todas as unidades. Materiais confidenciais e link da sala online liberados apenas para colaboradores.",
        content: "Convidamos todos os colaboradores para o Treinamento Geral sobre os novos módulos do CRM e Melhores Práticas de Atendimento ao Cliente.",
        icon: "graduation-cap",
        tag: "Capacitação",
        badge: "Oficial",
        image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        is_featured: false,
        likes_count: 31,
        user_liked: false,
        comments: []
      },
      {
        id: "com_3",
        target_card: "comunicados",
        title: "Nova filial de Campinas inaugurada com sucesso",
        date: "10 de setembro",
        author: "Expansão & Novos Negócios",
        visibility: "public",
        summary: "Estamos muito felizes em anunciar a abertura da nossa 15ª unidade em Campinas!",
        content: "A família Ambozini continua crescendo! Inauguramos nesta quinta-feira a nossa 15ª filial.",
        icon: "store",
        tag: "Expansão",
        badge: "Destaque Principal",
        image_url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop&q=80",
        is_featured: true,
        likes_count: 89,
        user_liked: false,
        comments: []
      },
      {
        id: "com_4",
        target_card: "comunicados",
        title: "Atualização de segurança e acesso aos sistemas",
        date: "05 de setembro",
        author: "Segurança da Informação",
        visibility: "members_only",
        summary: "Novo protocolo de autenticação GIA em vigor para reforçar a segurança corporativa.",
        content: "Informamos que o novo fluxo seguro de login GIA está ativo para todos os colaboradores.",
        icon: "shield-check",
        tag: "Segurança",
        badge: "Oficial",
        image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
        is_featured: true,
        likes_count: 42,
        user_liked: false,
        comments: []
      }
    ];

    for (const ann of initialAnnouncements) {
      await db.query(
        `INSERT INTO announcements (id, target_card, title, author, date, visibility, summary, content, icon, tag, badge, image_url, is_featured, likes_count, user_liked, comments, action_button_text, action_button_url, action_button_subtext)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);`,
        [
          ann.id,
          ann.target_card,
          ann.title,
          ann.author,
          ann.date,
          ann.visibility,
          ann.summary,
          ann.content,
          ann.icon,
          ann.tag,
          ann.badge,
          ann.image_url,
          ann.is_featured,
          ann.likes_count,
          ann.user_liked,
          JSON.stringify(ann.comments),
          ann.action_button_text || null,
          ann.action_button_url || null,
          ann.action_button_subtext || null
        ]
      );
    }
  }

  // 2. Seed do Fórum
  const postCountRes = await db.query('SELECT COUNT(*) AS count FROM forum_posts;');
  const postCount = parseInt(postCountRes.rows[0].count, 10);

  if (postCount === 0) {
    console.log('🌱 Populando forum_posts com dados iniciais (Seed)...');
    const initialPosts = [
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
        created_at: "Há 3 horas",
        time_ago: "Há 3 horas",
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
        created_at: "Há 5 horas",
        time_ago: "Há 5 horas",
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
        created_at: "Ontem",
        time_ago: "Ontem",
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
        created_at: "Ontem às 18:30",
        time_ago: "Ontem às 18:30",
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
      }
    ];

    for (const p of initialPosts) {
      await db.query(
        `INSERT INTO forum_posts (id, target_card, visibility, author, title, category, tag, created_at, time_ago, content, image_url, likes, user_liked, is_liked, comments_count, comments, pinned)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
        [
          p.id,
          p.target_card,
          p.visibility,
          JSON.stringify(p.author),
          p.title,
          p.category,
          p.tag,
          p.created_at,
          p.time_ago,
          p.content,
          p.image_url,
          p.likes,
          p.user_liked,
          p.is_liked,
          p.comments_count,
          JSON.stringify(p.comments),
          p.pinned
        ]
      );
    }
  }

  // 3. Seed de Valores da Empresa (Card 4)
  const valCountRes = await db.query('SELECT COUNT(*) AS count FROM company_values;');
  const valCount = parseInt(valCountRes.rows[0].count, 10);

  if (valCount === 0) {
    console.log('🌱 Populando company_values com dados iniciais (Seed)...');
    const initialValues = [
      {
        id: 'val_1',
        number: '01',
        title: 'Cliente no Centro de Tudo',
        description: 'Ouvimos ativamente, compreendemos necessidades reais e entregamos soluções com excelência e encanto em cada ponto de contato.',
        quote: 'A satisfação e o sucesso do nosso cliente definem o nosso próprio sucesso.',
        image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1400&auto=format&fit=crop&q=80',
        is_active: true,
        mode: 'custom'
      },
      {
        id: 'val_2',
        number: '02',
        title: 'Ética, Respeito e Transparência',
        description: 'Agimos com retidão, clareza e honestidade irrestrita em todas as relações com colaboradores, clientes e parceiros.',
        quote: 'A integridade não é negociável: fazemos o certo mesmo quando ninguém está olhando.',
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1400&auto=format&fit=crop&q=80',
        is_active: true,
        mode: 'custom'
      },
      {
        id: 'val_3',
        number: '03',
        title: 'Busca Contínua pela Excelência',
        description: 'Nunca nos acomodamos. Revisamos processos, capacitamos equipes e aprimoramos constantemente cada detalhe das nossas operações.',
        quote: 'Melhorar 1% todos os dias gera um salto gigantesco ao final de cada jornada.',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80',
        is_active: true,
        mode: 'custom'
      },
      {
        id: 'val_4',
        number: '04',
        title: 'Inovação e Foco em Resultados',
        description: 'Criamos soluções práticas, adotamos novas tecnologias com agilidade e trabalhamos orientados a metas claras e superação constante.',
        quote: 'Inovar é transformar desafios complexos em soluções simples e rentáveis.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&auto=format&fit=crop&q=80',
        is_active: true,
        mode: 'custom'
      },
      {
        id: 'val_5',
        number: '05',
        title: 'Trabalhamos Juntos — Força das Pessoas',
        description: 'Acreditamos que talentos individuais vencem partidas, mas equipes unidas constroem legados duradouros.',
        quote: 'Pessoas que fazem a diferença: juntos vamos muito mais longe!',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&auto=format&fit=crop&q=80',
        is_active: true,
        mode: 'custom'
      }
    ];

    for (const v of initialValues) {
      await db.query(
        `INSERT INTO company_values (id, number, title, description, quote, image, is_active, mode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [v.id, v.number, v.title, v.description, v.quote, v.image, v.is_active, v.mode]
      );
    }
  }

  // 4. Seed de Destaques da Empresa (Card 2)
  const compHighRes = await db.query('SELECT COUNT(*) AS count FROM company_highlights;');
  const compHighCount = parseInt(compHighRes.rows[0].count, 10);

  if (compHighCount === 0) {
    console.log('🌱 Populando company_highlights com dados iniciais (Seed)...');
    const initialCompanyHighlights = [
      {
        id: 'destaque_empresa_1',
        title: 'Filial Campinas — Maior Eficiência',
        content: 'Com 125% da meta comercial atingida e índice recorde de 98% de satisfação dos clientes no mês. Vocês inspiram toda a rede!',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
        author_name: 'Diretoria de Expansão',
        badge: 'Filial em Evidência',
        metric: '125% da meta',
        likes_count: 54,
        user_liked: false
      },
      {
        id: 'destaque_empresa_2',
        title: 'Filial Ribeirão Preto — Superação',
        content: 'Crescimento de 32% em novos clientes corporativos e pontualidade exemplar em todas as entregas e operações logísticas.',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        author_name: 'Gestão Regional Sul',
        badge: 'Destaque em Crescimento',
        metric: '+32% novos clientes',
        likes_count: 41,
        user_liked: false
      },
      {
        id: 'destaque_empresa_3',
        title: 'Filial Santos — Excelência em Atendimento',
        content: 'Maior taxa de fidelização e nota máxima nas auditorias de qualidade corporativa. Orgulho para todo o grupo Ambozini!',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
        author_name: 'Comitê de Qualidade',
        badge: 'NPS Recorde',
        metric: '99% satisfação',
        likes_count: 68,
        user_liked: false
      }
    ];

    for (const ch of initialCompanyHighlights) {
      await db.query(
        `INSERT INTO company_highlights (id, title, content, image_url, author_name, badge, metric, likes_count, user_liked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [ch.id, ch.title, ch.content, ch.image_url, ch.author_name, ch.badge, ch.metric, ch.likes_count, ch.user_liked]
      );
    }
  }

  // 5. Seed de Funcionário Destaque (Card 3)
  const empHighRes = await db.query('SELECT COUNT(*) AS count FROM employee_highlights;');
  const empHighCount = parseInt(empHighRes.rows[0].count, 10);

  if (empHighCount === 0) {
    console.log('🌱 Populando employee_highlights com dados iniciais (Seed)...');
    const initialEmployeeHighlights = [
      {
        id: 'destaque_func_1',
        name: 'Joana Prado',
        role: 'Consultora Comercial Sênior',
        badge: 'Colaboradora do Mês',
        content: 'Reconhecida pela pontualidade, atendimento encantador e apoio aos novos integrantes da equipe na Unidade Centro.',
        image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
        likes_count: 63,
        user_liked: false
      },
      {
        id: 'destaque_func_2',
        name: 'Carlos Eduardo',
        role: 'Líder Comercial de Unidade',
        badge: 'Destaque em Vendas',
        content: 'Superou a meta individual em 140% com consultoria proativa exemplar e mentoria dedicada para novos integrantes.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        likes_count: 52,
        user_liked: false
      },
      {
        id: 'destaque_func_3',
        name: 'Mariana Costa',
        role: 'Especialista em Suporte & TI',
        badge: 'Inovação & Agilidade',
        content: 'Desenvolveu automação de chamados que reduziu o tempo de resposta em 45%, acelerando as operações da rede inteira.',
        image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
        likes_count: 77,
        user_liked: false
      }
    ];

    for (const eh of initialEmployeeHighlights) {
      await db.query(
        `INSERT INTO employee_highlights (id, name, role, badge, content, image_url, likes_count, user_liked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [eh.id, eh.name, eh.role, eh.badge, eh.content, eh.image_url, eh.likes_count, eh.user_liked]
      );
    }
  }

  // 6. Seed de Cards Dinâmicos (Card 1, Card 2, Card 3, Card 4)
  const cardCountRes = await db.query('SELECT COUNT(*) AS count FROM dynamic_cards;');
  const cardCount = parseInt(cardCountRes.rows[0].count, 10);

  if (cardCount === 0) {
    console.log('🌱 Populando dynamic_cards com dados iniciais (Seed)...');
    const initialCards = [
      {
        id: 'card_1',
        title: 'Disciplina hoje, conquistas amanhã.',
        content: 'O sucesso é construído na dedicação diária de cada um. Cada atendimento e cada detalhe fazem a grandeza da Ambozini.',
        image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        author_name: 'Liderança Ambozini',
        author_role: 'Pensamento do Dia',
        updated_at: 'Hoje',
        likes_count: 28,
        user_liked: false
      },
      {
        id: 'card_2',
        title: 'Filial Campinas — Maior Eficiência',
        content: 'Com 125% da meta comercial atingida e índice recorde de 98% de satisfação dos clientes no mês. Vocês inspiram toda a rede!',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
        author_name: 'Diretoria de Expansão',
        author_role: 'Empresa Destaque',
        updated_at: 'Este Mês',
        likes_count: 54,
        user_liked: false
      },
      {
        id: 'card_3',
        title: 'Joana Prado — Consultora Sênior',
        content: 'Reconhecida pela pontualidade, atendimento encantador e apoio aos novos integrantes da equipe na Unidade Centro.',
        image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
        author_name: 'Gestão de Pessoas',
        author_role: 'Funcionário Destaque',
        updated_at: 'Este Mês',
        likes_count: 63,
        user_liked: false
      },
      {
        id: 'card_4',
        title: 'Nossas Missões e Valores Fundamentais',
        content: 'Trabalhamos juntos. Acreditamos na força das pessoas, ética transparente e busca incessante pela excelência.',
        image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&auto=format&fit=crop&q=80',
        author_name: 'Cultura Corporativa',
        author_role: 'Valores Ambozini',
        updated_at: 'Institucional',
        likes_count: 71,
        user_liked: false
      }
    ];

    for (const card of initialCards) {
      await db.query(
        `INSERT INTO dynamic_cards (id, title, content, image_url, author_name, author_role, updated_at, likes_count, user_liked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [card.id, card.title, card.content, card.image_url, card.author_name, card.author_role, card.updated_at, card.likes_count, card.user_liked]
      );
    }
  }

  // 6.1 Seed de Pensamentos do Dia (Card 1)
  const thoughtCountRes = await db.query('SELECT COUNT(*) AS count FROM motivational_thoughts;');
  const thoughtCount = parseInt(thoughtCountRes.rows[0].count, 10);
  if (thoughtCount === 0) {
    console.log('🌱 Populando motivational_thoughts com dados iniciais (Seed)...');
    const initialThoughts = [
      {
        id: 'thought_1',
        title: 'Disciplina hoje, conquistas amanhã.',
        content: 'O sucesso é construído na dedicação diária de cada um. Cada atendimento e cada detalhe fazem a grandeza da Ambozini.',
        author_name: 'Liderança Ambozini',
        author_role: 'Pensamento do Dia',
        image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        tagline: 'Liderança Ambozini • Pensamento • Cultura • Resultado',
        likes_count: 28,
        user_liked: false,
        is_active: true,
        position: 1
      },
      {
        id: 'thought_2',
        title: 'A força da equipe supera qualquer desafio.',
        content: 'Quando trabalhamos juntos com transparência e propósito, nenhum objetivo é inalcançável.',
        author_name: 'Liderança Ambozini',
        author_role: 'Pensamento do Dia',
        image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
        tagline: 'Liderança Ambozini • Propósito • União',
        likes_count: 35,
        user_liked: false,
        is_active: true,
        position: 2
      },
      {
        id: 'thought_3',
        title: 'Qualidade e excelência em cada entrega.',
        content: 'Cuidar dos detalhes é a nossa maior assinatura em cada unidade e cliente atendido.',
        author_name: 'Liderança Ambozini',
        author_role: 'Pensamento do Dia',
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        tagline: 'Liderança Ambozini • Qualidade • Foco',
        likes_count: 42,
        user_liked: false,
        is_active: true,
        position: 3
      },
      {
        id: 'thought_4',
        title: 'Inovação nasce do comprometimento diário.',
        content: 'Grandes mudanças começam nas pequenas melhorias feitas todos os dias com atenção ao cliente.',
        author_name: 'Liderança Ambozini',
        author_role: 'Pensamento do Dia',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        tagline: 'Liderança Ambozini • Evolução • Futuro',
        likes_count: 19,
        user_liked: false,
        is_active: true,
        position: 4
      }
    ];

    for (const t of initialThoughts) {
      await db.query(`
        INSERT INTO motivational_thoughts (id, title, content, author_name, author_role, image_url, tagline, likes_count, user_liked, is_active, position)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `, [t.id, t.title, t.content, t.author_name, t.author_role, t.image_url, t.tagline, t.likes_count, t.user_liked, t.is_active, t.position]);
    }
  }

  // 7. Seed de Meta Geral da Empresa
  const goalCountRes = await db.query('SELECT COUNT(*) AS count FROM company_goals;');
  const goalCount = parseInt(goalCountRes.rows[0].count, 10);
  if (goalCount === 0) {
    console.log('🌱 Populando company_goals com dados iniciais (Seed)...');
    await db.query(`
      INSERT INTO company_goals (
        id, month, target_percent, status_text, meta_month, meta_month_subtext,
        growth_percent, growth_subtext, units_on_target, units_on_target_subtext,
        engagement_percent, engagement_subtext
      ) VALUES (
        'current_goal', 'Este mês', 93, 'Ritmo Forte 🚀', '93%', 'Falta 7% para o topo',
        '+12%', 'vs. mês anterior', '11 de 15', '73% da rede aprovada',
        '100%', 'Juntos vamos mais longe!'
      );
    `);
  } else {
    // Garantia de integridade e acentuação em company_goals caso haja resquício corrompido
    await db.query(`
      UPDATE company_goals
      SET
        month = 'Este mês',
        status_text = 'Ritmo Forte 🚀',
        growth_subtext = 'vs. mês anterior'
      WHERE id = 'current_goal' AND (month LIKE '%?%' OR month LIKE '%\uFFFD%' OR status_text LIKE '%?%' OR growth_subtext LIKE '%\uFFFD%');
    `);
  }

  // 8. Seed de Top Unidades do Mês
  const topUnitsCountRes = await db.query('SELECT COUNT(*) AS count FROM top_units_ranking;');
  const topUnitsCount = parseInt(topUnitsCountRes.rows[0].count, 10);
  if (topUnitsCount === 0) {
    console.log('🌱 Populando top_units_ranking com dados iniciais (Seed)...');
    const initialTopUnits = [
      // Delivery
      {
        id: 'centro',
        category: 'delivery',
        position: 1,
        name: 'Unidade Centro',
        percent: '112%',
        tagline: 'Liderança com excelência!',
        icon: '⭐',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#f59e0b]'
      },
      {
        id: 'norte',
        category: 'delivery',
        position: 2,
        name: 'Unidade Norte',
        percent: '108%',
        tagline: 'Consistência gera resultados!',
        icon: '🏆',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#94a3b8]'
      },
      {
        id: 'sul',
        category: 'delivery',
        position: 3,
        name: 'Unidade Sul',
        percent: '104%',
        tagline: 'Grande performance!',
        icon: '📊',
        image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#b45309]'
      },
      {
        id: 'campinas',
        category: 'delivery',
        position: 4,
        name: 'Unidade Campinas',
        percent: '101%',
        tagline: 'Crescimento e eficiência!',
        icon: '🍃',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#78716c]'
      },
      {
        id: 'leste',
        category: 'delivery',
        position: 5,
        name: 'Unidade Leste',
        percent: '98%',
        tagline: 'Reta final para supermeta!',
        icon: '🚀',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#78716c]'
      },
      // Self-Service
      {
        id: 'shopping-sul',
        category: 'self-service',
        position: 1,
        name: 'Unidade Shopping Sul',
        percent: '115%',
        tagline: 'Atendimento e giro recorde!',
        icon: '⭐',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#f59e0b]'
      },
      {
        id: 'jardins',
        category: 'self-service',
        position: 2,
        name: 'Unidade Jardins',
        percent: '110%',
        tagline: 'Eficiência no buffet e salão!',
        icon: '🏆',
        image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#94a3b8]'
      },
      {
        id: 'paulista',
        category: 'self-service',
        position: 3,
        name: 'Unidade Paulista',
        percent: '106%',
        tagline: 'Alta conversão no almoço!',
        icon: '📊',
        image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#b45309]'
      },
      {
        id: 'alphaville',
        category: 'self-service',
        position: 4,
        name: 'Unidade Alphaville',
        percent: '102%',
        tagline: 'Padrão corporativo exemplar!',
        icon: '🍃',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#78716c]'
      },
      {
        id: 'vila-olimpia',
        category: 'self-service',
        position: 5,
        name: 'Unidade Vila Olímpia',
        percent: '99%',
        tagline: 'Giro rápido e satisfação!',
        icon: '🚀',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
        medal_bg: 'bg-[#78716c]'
      }
    ];

    for (const u of initialTopUnits) {
      await db.query(`
        INSERT INTO top_units_ranking (id, category, position, name, percent, tagline, icon, image_url, medal_bg)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `, [u.id, u.category, u.position, u.name, u.percent, u.tagline, u.icon, u.image_url, u.medal_bg]);
    }
  }

  console.log('✅ Verificação de integridade do Postgres Lite concluída com sucesso!');
}

export async function seedHistoricalMonthsData() {
  console.log('🌱 Sincronizando dados históricos de 2026 (Janeiro até o mês atual)...');

  // 1. Comunicados (Janeiro a Setembro)
  for (const ann of historicalAnnouncements) {
    await db.query(`
      INSERT INTO announcements (
        id, target_card, title, author, date, visibility, summary, content,
        icon, tag, badge, image_url, is_featured, likes_count, user_liked,
        comments, action_button_text, action_button_url, action_button_subtext,
        author_department, tags, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16::jsonb, $17, $18, $19, $20, $21::jsonb,
        $22::timestamp
      )
      ON CONFLICT (id) DO UPDATE SET
        target_card = EXCLUDED.target_card,
        title = EXCLUDED.title,
        author = EXCLUDED.author,
        date = EXCLUDED.date,
        visibility = EXCLUDED.visibility,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        icon = EXCLUDED.icon,
        tag = EXCLUDED.tag,
        badge = EXCLUDED.badge,
        image_url = EXCLUDED.image_url,
        is_featured = EXCLUDED.is_featured,
        author_department = EXCLUDED.author_department,
        tags = EXCLUDED.tags,
        action_button_text = COALESCE(EXCLUDED.action_button_text, announcements.action_button_text),
        action_button_url = COALESCE(EXCLUDED.action_button_url, announcements.action_button_url),
        action_button_subtext = COALESCE(EXCLUDED.action_button_subtext, announcements.action_button_subtext);
    `, [
      ann.id,
      ann.target_card || 'comunicados',
      ann.title,
      ann.author,
      ann.date,
      ann.visibility || 'members_only',
      ann.summary,
      ann.content,
      ann.icon || 'megaphone',
      ann.tag || 'Comunicado',
      ann.badge,
      ann.image_url,
      ann.is_featured || false,
      ann.likes_count || 0,
      !!ann.user_liked,
      JSON.stringify(ann.comments || []),
      ann.action_button_text || null,
      ann.action_button_url || null,
      ann.action_button_subtext || null,
      ann.author_department || null,
      JSON.stringify(ann.tags || []),
      ann.created_at || '2026-09-01T08:00:00Z'
    ]);
  }

  // 2. Fórum (Janeiro a Setembro)
  for (const p of historicalPosts) {
    await db.query(`
      INSERT INTO forum_posts (
        id, target_card, visibility, author, title, category, tag,
        created_at, time_ago, content, image_url, likes, user_liked, is_liked,
        comments_count, comments, pinned, is_active, timestamp, created_timestamp
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16::jsonb, $17, $18, $19, $20::timestamp
      )
      ON CONFLICT (id) DO UPDATE SET
        target_card = EXCLUDED.target_card,
        visibility = EXCLUDED.visibility,
        author = EXCLUDED.author,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        tag = EXCLUDED.tag,
        created_at = EXCLUDED.created_at,
        time_ago = EXCLUDED.time_ago,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        pinned = EXCLUDED.pinned,
        timestamp = EXCLUDED.timestamp,
        created_timestamp = EXCLUDED.created_timestamp;
    `, [
      p.id,
      p.target_card || 'forum',
      p.visibility || 'members_only',
      JSON.stringify(p.author),
      p.title,
      p.category,
      p.tag,
      p.created_at,
      p.time_ago,
      p.content,
      p.image_url || null,
      p.likes || 0,
      !!p.user_liked,
      !!p.is_liked,
      p.comments_count || 0,
      JSON.stringify(p.comments || []),
      !!p.pinned,
      true,
      p.timestamp,
      p.timestamp
    ]);
  }

  // 3. Calendário (Janeiro a Dezembro de 2026 - Anteriores e Futuros com Mês Numeral)
  await db.query(`DELETE FROM calendar_events;`);
  for (const ev of historicalCalendarEvents) {
    await db.query(`
      INSERT INTO calendar_events (id, date, title, category, time, location, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        time = EXCLUDED.time,
        location = EXCLUDED.location,
        description = EXCLUDED.description;
    `, [ev.id, ev.date, ev.title, ev.category, ev.time, ev.location, ev.description]);
  }

  // 4. Meta Geral da Empresa (Janeiro a Setembro)
  for (const cg of historicalCompanyGoals) {
    await db.query(`
      INSERT INTO company_goals (
        id, month, target_percent, status_text, meta_month, meta_month_subtext,
        growth_percent, growth_subtext, units_on_target, units_on_target_subtext,
        engagement_percent, engagement_subtext
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        month = EXCLUDED.month,
        target_percent = EXCLUDED.target_percent,
        status_text = EXCLUDED.status_text,
        meta_month = EXCLUDED.meta_month,
        meta_month_subtext = EXCLUDED.meta_month_subtext,
        growth_percent = EXCLUDED.growth_percent,
        growth_subtext = EXCLUDED.growth_subtext,
        units_on_target = EXCLUDED.units_on_target,
        units_on_target_subtext = EXCLUDED.units_on_target_subtext,
        engagement_percent = EXCLUDED.engagement_percent,
        engagement_subtext = EXCLUDED.engagement_subtext;
    `, [
      cg.id, cg.month, cg.target_percent, cg.status_text, cg.meta_month, cg.meta_month_subtext,
      cg.growth_percent, cg.growth_subtext, cg.units_on_target, cg.units_on_target_subtext,
      cg.engagement_percent, cg.engagement_subtext
    ]);
  }

  // 5. Top Unidades do Mês (Janeiro a Setembro - Exatamente 5 Lojas com Posição por Mês)
  await db.query(`DELETE FROM top_units_ranking WHERE id IN ('centro', 'norte', 'sul', 'campinas', 'leste', 'shopping-sul', 'jardins', 'paulista', 'alphaville', 'vila-olimpia');`);
  const topUnitsList = generateTopUnitsForMonths();
  for (const u of topUnitsList) {
    await db.query(`
      INSERT INTO top_units_ranking (id, category, position, name, percent, tagline, icon, image_url, medal_bg, month)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        position = EXCLUDED.position,
        name = EXCLUDED.name,
        percent = EXCLUDED.percent,
        tagline = EXCLUDED.tagline,
        icon = EXCLUDED.icon,
        image_url = EXCLUDED.image_url,
        medal_bg = EXCLUDED.medal_bg,
        month = EXCLUDED.month;
    `, [u.id, u.category, u.position, u.name, u.percent, u.tagline, u.icon, u.image_url, u.medal_bg, u.month]);
  }

  // 6. Filiais em Evidência (Janeiro a Setembro)
  await db.query(`DELETE FROM company_highlights WHERE id IN ('destaque_empresa_1', 'destaque_empresa_2', 'destaque_empresa_3');`);
  for (const ch of historicalCompanyHighlights) {
    await db.query(`
      INSERT INTO company_highlights (id, title, content, image_url, author_name, badge, metric, date, likes_count, user_liked)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        author_name = EXCLUDED.author_name,
        badge = EXCLUDED.badge,
        metric = EXCLUDED.metric,
        date = EXCLUDED.date;
    `, [ch.id, ch.title, ch.content, ch.image_url, ch.author_name, ch.badge, ch.metric, ch.date, ch.likes_count, ch.user_liked]);
  }

  // 7. Colaboradoras e Colaboradores Destaque (Janeiro a Setembro)
  await db.query(`DELETE FROM employee_highlights WHERE id IN ('destaque_func_1', 'destaque_func_2', 'destaque_func_3');`);
  for (const eh of historicalEmployeeHighlights) {
    await db.query(`
      INSERT INTO employee_highlights (id, name, role, badge, content, image_url, award, date, likes_count, user_liked)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        badge = EXCLUDED.badge,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        award = EXCLUDED.award,
        date = EXCLUDED.date;
    `, [eh.id, eh.name, eh.role, eh.badge, eh.content, eh.image_url, eh.award, eh.date, eh.likes_count, eh.user_liked]);
  }

  console.log('✅ Dados históricos de 2026 sincronizados com sucesso!');
}
