import express from 'express';
import cors from 'cors';
import { db, initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'PostgreSQL 18.3 (PGlite / WebAssembly)',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. COMUNICADOS (Announcements)
// ==========================================
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, target_card AS "targetCard", title, author, date, visibility,
        summary, content, icon, tag, badge, image_url AS "imageUrl",
        image_url AS image, is_featured AS "isFeatured", likes_count AS "likesCount",
        user_liked AS "userLiked", comments, 
        action_button_text AS "actionButtonText",
        action_button_url AS "actionButtonUrl",
        action_button_subtext AS "actionButtonSubtext",
        action_button_open_new_tab AS "actionButtonOpenNewTab",
        author_department AS "authorDepartment",
        contact_info AS "contactInfo",
        tags, priority, target_audience AS "targetAudience",
        attachments, related_links AS "relatedLinks",
        publish_mode AS "publishMode", start_date AS "startDate", expire_date AS "expireDate",
        allow_reactions AS "allowReactions", allow_comments AS "allowComments",
        require_read_confirmation AS "requireReadConfirmation",
        confirmed_by AS "confirmedBy", confirmations_count AS "confirmationsCount",
        is_draft AS "isDraft",
        is_active AS "isActive",
        audit_log AS "auditLog",
        created_at
      FROM announcements
      ORDER BY 
        CASE WHEN id = 'com_5' OR tag = 'RH & Folha' THEN 0 ELSE 1 END,
        created_at DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar comunicados:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || `com_${Date.now()}`;
    const targetCard = item.targetCard || 'comunicados';
    const title = item.title || '';
    const author = item.author || 'Gestão';
    const date = item.date || 'Hoje';
    const visibility = item.visibility || 'members_only';
    const summary = item.summary || (item.content ? item.content.substring(0, 120) + '...' : '');
    const content = item.content || '';
    const icon = item.icon || 'megaphone';
    const tag = item.tag || 'Comunicado';
    const badge = item.badge || (item.isFeatured ? 'Destaque Principal' : 'Oficial');
    const imageUrl = item.imageUrl || item.image || null;
    const isFeatured = !!item.isFeatured;
    const likesCount = item.likesCount || 0;
    const userLiked = !!item.userLiked;
    const comments = JSON.stringify(item.comments || []);
    const actionButtonText = item.actionButtonText || null;
    const actionButtonUrl = item.actionButtonUrl || null;
    const actionButtonSubtext = item.actionButtonSubtext || null;
    const actionButtonOpenNewTab = item.actionButtonOpenNewTab !== false;
    const authorDepartment = item.authorDepartment || null;
    const contactInfo = item.contactInfo || null;
    const tags = JSON.stringify(item.tags || []);
    const priority = item.priority || 'info';
    const targetAudience = JSON.stringify(item.targetAudience || { type: 'all' });
    const attachments = JSON.stringify(item.attachments || []);
    const relatedLinks = JSON.stringify(item.relatedLinks || []);
    const publishMode = item.publishMode || 'now';
    const startDate = item.startDate || null;
    const expireDate = item.expireDate || null;
    const allowReactions = item.allowReactions !== false;
    const allowComments = item.allowComments !== false;
    const requireReadConfirmation = !!item.requireReadConfirmation;
    const confirmedBy = JSON.stringify(item.confirmedBy || []);
    const confirmationsCount = item.confirmationsCount || 0;
    const isDraft = !!item.isDraft;
    const isActive = item.isActive !== false;
    const auditLog = JSON.stringify(item.auditLog && item.auditLog.length > 0 ? item.auditLog : [
      {
        id: `log_${Date.now()}`,
        action: 'created',
        timestamp: new Date().toISOString(),
        authorName: item.author || 'Gestão',
        details: 'Comunicado oficial criado'
      }
    ]);

    await db.query(
      `INSERT INTO announcements (
        id, target_card, title, author, date, visibility, summary, content, icon, tag, badge, image_url, is_featured, likes_count, user_liked, comments,
        action_button_text, action_button_url, action_button_subtext, action_button_open_new_tab,
        author_department, contact_info, tags, priority, target_audience, attachments, related_links,
        publish_mode, start_date, expire_date, allow_reactions, allow_comments, require_read_confirmation,
        confirmed_by, confirmations_count, is_draft, is_active, audit_log
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38::jsonb
      );`,
      [
        id, targetCard, title, author, date, visibility, summary, content, icon, tag, badge, imageUrl, isFeatured, likesCount, userLiked, comments,
        actionButtonText, actionButtonUrl, actionButtonSubtext, actionButtonOpenNewTab,
        authorDepartment, contactInfo, tags, priority, targetAudience, attachments, relatedLinks,
        publishMode, startDate, expireDate, allowReactions, allowComments, requireReadConfirmation,
        confirmedBy, confirmationsCount, isDraft, isActive, auditLog
      ]
    );

    res.status(201).json({ id, ...item, isActive, auditLog: JSON.parse(auditLog) });
  } catch (err) {
    console.error('Erro ao criar comunicado:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (item.title !== undefined) { fields.push(`title = $${idx++}`); values.push(item.title); }
    if (item.summary !== undefined) { fields.push(`summary = $${idx++}`); values.push(item.summary); }
    if (item.content !== undefined) { fields.push(`content = $${idx++}`); values.push(item.content); }
    if (item.tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(item.tag); }
    if (item.visibility !== undefined) { fields.push(`visibility = $${idx++}`); values.push(item.visibility); }
    if (item.imageUrl !== undefined || item.image !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(item.imageUrl !== undefined ? item.imageUrl : item.image);
    }
    if (item.isFeatured !== undefined) { fields.push(`is_featured = $${idx++}`); values.push(!!item.isFeatured); }
    if (item.likesCount !== undefined) { fields.push(`likes_count = $${idx++}`); values.push(item.likesCount); }
    if (item.userLiked !== undefined) { fields.push(`user_liked = $${idx++}`); values.push(!!item.userLiked); }
    if (item.actionButtonText !== undefined) { fields.push(`action_button_text = $${idx++}`); values.push(item.actionButtonText || null); }
    if (item.actionButtonUrl !== undefined) { fields.push(`action_button_url = $${idx++}`); values.push(item.actionButtonUrl || null); }
    if (item.actionButtonSubtext !== undefined) { fields.push(`action_button_subtext = $${idx++}`); values.push(item.actionButtonSubtext || null); }
    if (item.actionButtonOpenNewTab !== undefined) { fields.push(`action_button_open_new_tab = $${idx++}`); values.push(!!item.actionButtonOpenNewTab); }
    if (item.authorDepartment !== undefined) { fields.push(`author_department = $${idx++}`); values.push(item.authorDepartment || null); }
    if (item.contactInfo !== undefined) { fields.push(`contact_info = $${idx++}`); values.push(item.contactInfo || null); }
    if (item.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(JSON.stringify(item.tags)); }
    if (item.priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(item.priority); }
    if (item.targetAudience !== undefined) { fields.push(`target_audience = $${idx++}`); values.push(JSON.stringify(item.targetAudience)); }
    if (item.attachments !== undefined) { fields.push(`attachments = $${idx++}`); values.push(JSON.stringify(item.attachments)); }
    if (item.relatedLinks !== undefined) { fields.push(`related_links = $${idx++}`); values.push(JSON.stringify(item.relatedLinks)); }
    if (item.publishMode !== undefined) { fields.push(`publish_mode = $${idx++}`); values.push(item.publishMode); }
    if (item.startDate !== undefined) { fields.push(`start_date = $${idx++}`); values.push(item.startDate); }
    if (item.expireDate !== undefined) { fields.push(`expire_date = $${idx++}`); values.push(item.expireDate); }
    if (item.allowReactions !== undefined) { fields.push(`allow_reactions = $${idx++}`); values.push(!!item.allowReactions); }
    if (item.allowComments !== undefined) { fields.push(`allow_comments = $${idx++}`); values.push(!!item.allowComments); }
    if (item.requireReadConfirmation !== undefined) { fields.push(`require_read_confirmation = $${idx++}`); values.push(!!item.requireReadConfirmation); }
    if (item.confirmedBy !== undefined) { fields.push(`confirmed_by = $${idx++}`); values.push(JSON.stringify(item.confirmedBy)); }
    if (item.confirmationsCount !== undefined) { fields.push(`confirmations_count = $${idx++}`); values.push(item.confirmationsCount); }
    if (item.isDraft !== undefined) { fields.push(`is_draft = $${idx++}`); values.push(!!item.isDraft); }
    if (item.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(!!item.isActive); }
    if (item.auditLog !== undefined) { fields.push(`audit_log = $${idx++}::jsonb`); values.push(JSON.stringify(item.auditLog)); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhum campo a atualizar' });
    }

    values.push(id);
    await db.query(`UPDATE announcements SET ${fields.join(', ')} WHERE id = $${idx};`, values);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Erro ao atualizar comunicado:', err);
    res.status(500).json({ error: err.message });
  }
});

// REGRA ESTRITA: NUNCA DELETAR DO BANCO. DESATIVAR COM LOG DE AUDITORIA
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await db.query(`SELECT is_active, audit_log FROM announcements WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Comunicado não encontrado' });

    const existingLog = current.rows[0].audit_log || [];
    existingLog.push({
      id: `log_${Date.now()}`,
      action: 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: req.body?.actorName || 'Administrador',
      details: req.body?.reason || 'Comunicado desativado'
    });

    await db.query(`
      UPDATE announcements 
      SET is_active = FALSE, audit_log = $1::jsonb 
      WHERE id = $2;
    `, [JSON.stringify(existingLog), id]);

    res.json({ success: true, id, deactivated: true });
  } catch (err) {
    console.error('Erro ao desativar comunicado:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/announcements/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole, reason } = req.body || {};
    const current = await db.query(`SELECT is_active, audit_log FROM announcements WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Comunicado não encontrado' });

    const nextActive = !current.rows[0].is_active;
    const existingLog = current.rows[0].audit_log || [];
    existingLog.push({
      id: `log_${Date.now()}`,
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: actorName || 'Administrador',
      authorRole: actorRole || 'Gestor',
      details: nextActive 
        ? (reason || 'Comunicado reativado para exibição pública') 
        : (reason || 'Comunicado desativado. Ocultado da visualização pública.')
    });

    await db.query(`
      UPDATE announcements 
      SET is_active = $1, audit_log = $2::jsonb 
      WHERE id = $3;
    `, [nextActive, JSON.stringify(existingLog), id]);

    res.json({ success: true, isActive: nextActive, auditLog: existingLog });
  } catch (err) {
    console.error('Erro ao alternar status do comunicado:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await db.query(`SELECT likes_count, user_liked FROM announcements WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });

    const nextLiked = !current.rows[0].user_liked;
    const nextCount = (current.rows[0].likes_count || 0) + (nextLiked ? 1 : -1);

    await db.query(
      `UPDATE announcements SET user_liked = $1, likes_count = $2 WHERE id = $3;`,
      [nextLiked, nextCount, id]
    );
    res.json({ userLiked: nextLiked, likesCount: nextCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body;
    const current = await db.query(`SELECT comments FROM announcements WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });

    const comments = current.rows[0].comments || [];
    comments.push(comment);

    await db.query(
      `UPDATE announcements SET comments = $1::jsonb WHERE id = $2;`,
      [JSON.stringify(comments), id]
    );
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. FÓRUM & COMUNIDADE (Forum Posts)
// ==========================================
app.get('/api/posts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, target_card AS "targetCard", visibility, author, title, category,
        tag, created_at AS "createdAt", time_ago AS "timeAgo", content,
        image_url AS "imageUrl", image_url AS image, likes, user_liked AS "userLiked",
        is_liked AS "isLiked", comments_count AS "commentsCount", comments, pinned,
        is_active AS "isActive", audit_log AS "auditLog",
        COALESCE(timestamp, created_timestamp::text) AS "timestamp"
      FROM forum_posts
      ORDER BY pinned DESC, created_timestamp DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar posts:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `post_${Date.now()}`;
    const targetCard = p.targetCard || 'forum';
    const visibility = p.visibility || 'members_only';
    const author = JSON.stringify(p.author || { name: 'Colaborador', role: 'Colaborador', unit: 'Geral', avatar: '' });
    const title = p.title || '';
    const category = p.category || 'Geral';
    const tag = p.tag || category;
    const createdAt = p.createdAt || 'Agora mesmo';
    const timeAgo = p.timeAgo || 'Agora mesmo';
    const timestamp = p.timestamp || new Date().toISOString();
    const content = p.content || '';
    const imageUrl = p.imageUrl || p.image || null;
    const likes = p.likes || 1;
    const userLiked = p.userLiked ?? true;
    const isLiked = p.isLiked ?? true;
    const commentsCount = p.commentsCount || 0;
    const comments = JSON.stringify(p.comments || []);
    const pinned = !!p.pinned;
    const isActive = p.isActive !== false;
    const auditLog = JSON.stringify(p.auditLog && p.auditLog.length > 0 ? p.auditLog : [
      {
        id: `log_${Date.now()}`,
        action: 'created',
        timestamp: timestamp,
        authorName: (p.author && p.author.name) || 'Colaborador',
        authorRole: (p.author && p.author.role) || 'Colaborador',
        authorAvatar: (p.author && p.author.avatar) || '',
        details: 'Publicação criada no Fórum da Comunidade'
      }
    ]);

    await db.query(
      `INSERT INTO forum_posts (
        id, target_card, visibility, author, title, category, tag, created_at, time_ago,
        content, image_url, likes, user_liked, is_liked, comments_count, comments, pinned,
        is_active, audit_log, timestamp, created_timestamp
      ) VALUES (
        $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16::jsonb, $17,
        $18, $19::jsonb, $20, $21::timestamp
      );`,
      [
        id, targetCard, visibility, author, title, category, tag, createdAt, timeAgo,
        content, imageUrl, likes, userLiked, isLiked, commentsCount, comments, pinned,
        isActive, auditLog, timestamp, timestamp
      ]
    );

    res.status(201).json({ id, ...p, timestamp, isActive, auditLog: JSON.parse(auditLog) });
  } catch (err) {
    console.error('Erro ao criar post:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (p.title !== undefined) { fields.push(`title = $${idx++}`); values.push(p.title); }
    if (p.content !== undefined) { fields.push(`content = $${idx++}`); values.push(p.content); }
    if (p.category !== undefined) { fields.push(`category = $${idx++}`); values.push(p.category); }
    if (p.tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(p.tag); }
    if (p.visibility !== undefined) { fields.push(`visibility = $${idx++}`); values.push(p.visibility); }
    if (p.imageUrl !== undefined || p.image !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(p.imageUrl !== undefined ? p.imageUrl : p.image);
    }
    if (p.pinned !== undefined) { fields.push(`pinned = $${idx++}`); values.push(!!p.pinned); }
    if (p.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(!!p.isActive); }
    if (p.auditLog !== undefined) { fields.push(`audit_log = $${idx++}::jsonb`); values.push(JSON.stringify(p.auditLog)); }

    if (fields.length === 0) {
      return res.json({ success: true, message: 'Nenhum campo a atualizar' });
    }

    values.push(id);
    await db.query(`UPDATE forum_posts SET ${fields.join(', ')} WHERE id = $${idx};`, values);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Erro ao atualizar post:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/posts/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, actorRole, actorAvatar, reason } = req.body || {};
    const current = await db.query(`SELECT is_active, audit_log FROM forum_posts WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Post não encontrado' });

    const nextActive = !current.rows[0].is_active;
    const existingLog = current.rows[0].audit_log || [];
    const newLogEntry = {
      id: `log_${Date.now()}`,
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: actorName || 'Administrador',
      authorRole: actorRole || 'Gestor',
      authorAvatar: actorAvatar || '',
      details: nextActive 
        ? (reason || 'Publicação reativada para exibição pública')
        : (reason || 'Publicação desativada. Não será mais exibida para colaboradores.')
    };
    existingLog.push(newLogEntry);

    await db.query(`
      UPDATE forum_posts 
      SET is_active = $1, audit_log = $2::jsonb 
      WHERE id = $3;
    `, [nextActive, JSON.stringify(existingLog), id]);

    res.json({ success: true, isActive: nextActive, auditLog: existingLog });
  } catch (err) {
    console.error('Erro ao alternar status do post:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM forum_posts WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await db.query(`SELECT likes, user_liked, is_liked FROM forum_posts WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });

    const nextLiked = !(current.rows[0].user_liked || current.rows[0].is_liked);
    const nextCount = (current.rows[0].likes || 0) + (nextLiked ? 1 : -1);

    await db.query(
      `UPDATE forum_posts SET user_liked = $1, is_liked = $1, likes = $2 WHERE id = $3;`,
      [nextLiked, nextCount, id]
    );
    res.json({ userLiked: nextLiked, isLiked: nextLiked, likes: nextCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body;
    const current = await db.query(`SELECT comments, comments_count FROM forum_posts WHERE id = $1;`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });

    const comments = current.rows[0].comments || [];
    comments.push(comment);
    const count = comments.length;

    await db.query(
      `UPDATE forum_posts SET comments = $1::jsonb, comments_count = $2 WHERE id = $3;`,
      [JSON.stringify(comments), count, id]
    );
    res.json({ success: true, comment, commentsCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CALENDÁRIO CORPORATIVO (Calendar Events)
// ==========================================
app.get('/api/calendar', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM calendar_events ORDER BY created_at DESC;`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendar', async (req, res) => {
  try {
    const ev = req.body;
    const id = ev.id || `evt_${Date.now()}`;
    await db.query(
      `INSERT INTO calendar_events (id, date, title, category, time, location, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [id, ev.date, ev.title, ev.category, ev.time, ev.location, ev.description]
    );
    res.status(201).json({ id, ...ev });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM calendar_events WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CARDS DINÂMICOS & VALORES
// ==========================================
app.get('/api/dynamic-cards', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, title, content, image_url AS "imageUrl", author_name AS "authorName",
             author_role AS "authorRole", author_avatar AS "authorAvatar",
             updated_at AS "updatedAt", likes_count AS "likesCount", user_liked AS "userLiked"
      FROM dynamic_cards;
    `);
    const map = {};
    for (const row of result.rows) {
      map[row.id] = row;
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/dynamic-cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = req.body;
    await db.query(
      `INSERT INTO dynamic_cards (id, title, content, image_url, author_name, author_role, author_avatar, updated_at, likes_count, user_liked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         image_url = EXCLUDED.image_url,
         author_name = EXCLUDED.author_name,
         author_role = EXCLUDED.author_role,
         updated_at = EXCLUDED.updated_at;`,
      [id, card.title, card.content, card.imageUrl, card.authorName, card.authorRole, card.authorAvatar, card.updatedAt || 'Hoje', card.likesCount || 0, !!card.userLiked]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4.1 PENSAMENTOS DO DIA (Card 1)
// ==========================================
app.get('/api/motivational-thoughts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, title, content, author_name AS "authorName", author_role AS "authorRole",
             image_url AS "imageUrl", tagline, likes_count AS "likesCount",
             user_liked AS "userLiked", is_active AS "isActive", position, created_at AS "createdAt"
      FROM motivational_thoughts
      ORDER BY position ASC, created_at DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/motivational-thoughts', async (req, res) => {
  try {
    const t = req.body;
    const id = t.id || `thought_${Date.now()}`;
    await db.query(`
      INSERT INTO motivational_thoughts (id, title, content, author_name, author_role, image_url, tagline, likes_count, user_liked, is_active, position)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, [
      id,
      t.title,
      t.content || '',
      t.authorName || 'Liderança Ambozini',
      t.authorRole || 'Pensamento do Dia',
      t.imageUrl || null,
      t.tagline || `${t.authorName || 'Liderança Ambozini'} • Pensamento do Dia`,
      t.likesCount || 0,
      !!t.userLiked,
      t.isActive !== false,
      t.position || 1
    ]);

    // Sincroniza card_1 na dynamic_cards
    await db.query(`
      INSERT INTO dynamic_cards (id, title, content, image_url, author_name, author_role, updated_at, likes_count, user_liked)
      VALUES ('card_1', $1, $2, $3, $4, $5, 'Agora mesmo', $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        author_name = EXCLUDED.author_name,
        author_role = EXCLUDED.author_role,
        updated_at = EXCLUDED.updated_at;
    `, [t.title, t.content, t.imageUrl, t.authorName, t.authorRole, t.likesCount || 0, !!t.userLiked]);

    res.status(201).json({ id, ...t });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/motivational-thoughts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    await db.query(`
      UPDATE motivational_thoughts SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        author_name = COALESCE($3, author_name),
        author_role = COALESCE($4, author_role),
        image_url = COALESCE($5, image_url),
        tagline = COALESCE($6, tagline),
        is_active = COALESCE($7, is_active),
        position = COALESCE($8, position)
      WHERE id = $9;
    `, [t.title, t.content, t.authorName, t.authorRole, t.imageUrl, t.tagline, t.isActive, t.position, id]);

    // Sincroniza card_1
    await db.query(`
      UPDATE dynamic_cards SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        author_name = COALESCE($3, author_name),
        author_role = COALESCE($4, author_role),
        image_url = COALESCE($5, image_url),
        updated_at = 'Agora mesmo'
      WHERE id = 'card_1';
    `, [t.title, t.content, t.authorName, t.authorRole, t.imageUrl]);

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/motivational-thoughts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM motivational_thoughts WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/motivational-thoughts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const cur = await db.query(`SELECT likes_count, user_liked FROM motivational_thoughts WHERE id = $1;`, [id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    const nextLiked = !cur.rows[0].user_liked;
    const nextCount = (cur.rows[0].likes_count || 0) + (nextLiked ? 1 : -1);
    await db.query(`UPDATE motivational_thoughts SET user_liked = $1, likes_count = $2 WHERE id = $3;`, [nextLiked, nextCount, id]);

    // Também atualiza card_1
    await db.query(`UPDATE dynamic_cards SET user_liked = $1, likes_count = $2 WHERE id = 'card_1';`, [nextLiked, nextCount]);

    res.json({ userLiked: nextLiked, likesCount: nextCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/company-values', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, number, title, description, quote, image, is_active AS "isActive", mode
      FROM company_values
      ORDER BY number ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company-values', async (req, res) => {
  try {
    const val = req.body;
    const id = val.id || `val_${Date.now()}`;
    await db.query(
      `INSERT INTO company_values (id, number, title, description, quote, image, is_active, mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [id, val.number, val.title, val.description, val.quote, val.image, val.isActive ?? true, val.mode || 'custom']
    );
    res.status(201).json({ id, ...val });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company-values/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const val = req.body;
    await db.query(
      `UPDATE company_values SET
         number = COALESCE($1, number),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         quote = COALESCE($4, quote),
         image = COALESCE($5, image),
         is_active = COALESCE($6, is_active),
         mode = COALESCE($7, mode)
       WHERE id = $8;`,
      [val.number, val.title, val.description, val.quote, val.image, val.isActive, val.mode, id]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/company-values/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM company_values WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. DESTAQUES DA EMPRESA & FUNCIONÁRIOS
// ==========================================
app.get('/api/company-highlights', async (req, res) => {
  try {
    const { month } = req.query;
    let query = `
      SELECT id, title, content, image_url AS "imageUrl", author_name AS "authorName",
             badge, metric, date, likes_count AS "likesCount", user_liked AS "userLiked"
      FROM company_highlights
    `;
    const params = [];
    if (month && month !== 'Todos os meses' && month !== 'all') {
      query += ` WHERE date ILIKE $1`;
      params.push(`%${month}%`);
    }
    query += ` ORDER BY 
      CASE 
        WHEN date ILIKE '%Setembro%' THEN 1
        WHEN date ILIKE '%Agosto%' THEN 2
        WHEN date ILIKE '%Julho%' THEN 3
        WHEN date ILIKE '%Junho%' THEN 4
        WHEN date ILIKE '%Maio%' THEN 5
        WHEN date ILIKE '%Abril%' THEN 6
        WHEN date ILIKE '%Março%' THEN 7
        WHEN date ILIKE '%Fevereiro%' THEN 8
        WHEN date ILIKE '%Janeiro%' THEN 9
        ELSE 10 
      END ASC;`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company-highlights', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || `highlight_comp_${Date.now()}`;
    await db.query(
      `INSERT INTO company_highlights (id, title, content, image_url, author_name, badge, metric, date, likes_count, user_liked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [id, item.title, item.content, item.imageUrl, item.authorName, item.badge, item.metric, item.date || 'Setembro/2026', item.likesCount || 0, !!item.userLiked]
    );
    res.status(201).json({ id, ...item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company-highlights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    await db.query(
      `UPDATE company_highlights SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         image_url = COALESCE($3, image_url),
         author_name = COALESCE($4, author_name),
         badge = COALESCE($5, badge),
         metric = COALESCE($6, metric),
         date = COALESCE($7, date)
       WHERE id = $8;`,
      [item.title, item.content, item.imageUrl, item.authorName, item.badge, item.metric, item.date, id]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/company-highlights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM company_highlights WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company-highlights/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const cur = await db.query(`SELECT likes_count, user_liked FROM company_highlights WHERE id = $1;`, [id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    const nextLiked = !cur.rows[0].user_liked;
    const nextCount = (cur.rows[0].likes_count || 0) + (nextLiked ? 1 : -1);
    await db.query(`UPDATE company_highlights SET user_liked = $1, likes_count = $2 WHERE id = $3;`, [nextLiked, nextCount, id]);
    res.json({ userLiked: nextLiked, likesCount: nextCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employee-highlights', async (req, res) => {
  try {
    const { month } = req.query;
    let query = `
      SELECT id, name, role, badge, content, image_url AS "imageUrl",
             award, date, likes_count AS "likesCount", user_liked AS "userLiked"
      FROM employee_highlights
    `;
    const params = [];
    if (month && month !== 'Todos os meses' && month !== 'all') {
      query += ` WHERE date ILIKE $1`;
      params.push(`%${month}%`);
    }
    query += ` ORDER BY 
      CASE 
        WHEN date ILIKE '%Setembro%' THEN 1
        WHEN date ILIKE '%Agosto%' THEN 2
        WHEN date ILIKE '%Julho%' THEN 3
        WHEN date ILIKE '%Junho%' THEN 4
        WHEN date ILIKE '%Maio%' THEN 5
        WHEN date ILIKE '%Abril%' THEN 6
        WHEN date ILIKE '%Março%' THEN 7
        WHEN date ILIKE '%Fevereiro%' THEN 8
        WHEN date ILIKE '%Janeiro%' THEN 9
        ELSE 10 
      END ASC;`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employee-highlights', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || `highlight_emp_${Date.now()}`;
    await db.query(
      `INSERT INTO employee_highlights (id, name, role, badge, content, image_url, award, date, likes_count, user_liked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [id, item.name, item.role, item.badge, item.content, item.imageUrl, item.award || 'Homenagem Ambozini', item.date || 'Setembro/2026', item.likesCount || 0, !!item.userLiked]
    );
    res.status(201).json({ id, ...item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employee-highlights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    await db.query(
      `UPDATE employee_highlights SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         badge = COALESCE($3, badge),
         content = COALESCE($4, content),
         image_url = COALESCE($5, image_url),
         award = COALESCE($6, award),
         date = COALESCE($7, date)
       WHERE id = $8;`,
      [item.name, item.role, item.badge, item.content, item.imageUrl, item.award, item.date, id]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employee-highlights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM employee_highlights WHERE id = $1;`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employee-highlights/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const cur = await db.query(`SELECT likes_count, user_liked FROM employee_highlights WHERE id = $1;`, [id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    const nextLiked = !cur.rows[0].user_liked;
    const nextCount = (cur.rows[0].likes_count || 0) + (nextLiked ? 1 : -1);
    await db.query(`UPDATE employee_highlights SET user_liked = $1, likes_count = $2 WHERE id = $3;`, [nextLiked, nextCount, id]);
    res.json({ userLiked: nextLiked, likesCount: nextCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// 8. META GERAL DA EMPRESA (Company Goals)
// ==========================================
app.get('/api/company-goals', async (req, res) => {
  try {
    const { month } = req.query;
    const allGoalsRes = await db.query(`
      SELECT * FROM company_goals ORDER BY 
        CASE 
          WHEN id = 'current_goal' OR month ILIKE '%Setembro%' OR month ILIKE '%Este m%' THEN 1
          WHEN month ILIKE '%Agosto%' THEN 2
          WHEN month ILIKE '%Julho%' THEN 3
          WHEN month ILIKE '%Junho%' THEN 4
          WHEN month ILIKE '%Maio%' THEN 5
          WHEN month ILIKE '%Abril%' THEN 6
          WHEN month ILIKE '%Março%' THEN 7
          WHEN month ILIKE '%Fevereiro%' THEN 8
          WHEN month ILIKE '%Janeiro%' THEN 9
          ELSE 10
        END ASC;
    `);

    const cleanGoal = (r) => {
      if (!r) return null;
      const cleanMonth = (r.month || 'Este mês').replace(/Este m[\ufffd\?]s/gi, 'Este mês');
      const cleanStatusText = (r.status_text || 'Ritmo Forte 🚀').replace(/Ritmo Forte \?\?/gi, 'Ritmo Forte 🚀');
      const cleanGrowthSubtext = (r.growth_subtext || 'vs. mês anterior').replace(/vs\. m[\ufffd\?]s anterior/gi, 'vs. mês anterior');

      return {
        id: r.id,
        month: cleanMonth,
        targetPercent: r.target_percent,
        statusText: cleanStatusText,
        metaMonth: r.meta_month,
        metaMonthSubtext: r.meta_month_subtext,
        growthPercent: r.growth_percent,
        growthSubtext: cleanGrowthSubtext,
        unitsOnTarget: r.units_on_target,
        unitsOnTargetSubtext: r.units_on_target_subtext,
        engagementPercent: r.engagement_percent,
        engagementSubtext: r.engagement_subtext
      };
    };

    const history = allGoalsRes.rows
      .filter((r) => r.id !== 'current_goal')
      .map(cleanGoal);

    let chosenRow = allGoalsRes.rows.find((r) => r.id === 'current_goal') || allGoalsRes.rows[0];
    if (month) {
      const match = allGoalsRes.rows.find(
        (r) => r.month && r.month.toLowerCase().includes(month.toLowerCase().split('/')[0])
      );
      if (match) chosenRow = match;
    }

    if (chosenRow) {
      const resp = cleanGoal(chosenRow);
      resp.history = history;
      res.json(resp);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company-goals', async (req, res) => {
  try {
    const g = req.body;
    await db.query(`
      INSERT INTO company_goals (
        id, month, target_percent, status_text, meta_month, meta_month_subtext,
        growth_percent, growth_subtext, units_on_target, units_on_target_subtext,
        engagement_percent, engagement_subtext
      ) VALUES ('current_goal', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      g.month || 'Este mês',
      g.targetPercent ?? 93,
      g.statusText || 'Ritmo Forte 🚀',
      g.metaMonth || '93%',
      g.metaMonthSubtext || 'Falta 7% para o topo',
      g.growthPercent || '+12%',
      g.growthSubtext || 'vs. mês anterior',
      g.unitsOnTarget || '11 de 15',
      g.unitsOnTargetSubtext || '73% da rede aprovada',
      g.engagementPercent || '100%',
      g.engagementSubtext || 'Juntos vamos mais longe!'
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. TOP UNIDADES DO MÊS (Ranking)
// ==========================================
app.get('/api/top-units', async (req, res) => {
  try {
    const { month } = req.query;
    const result = await db.query(`SELECT * FROM top_units_ranking ORDER BY category ASC, position ASC;`);
    const allDelivery = [];
    const allSelfService = [];
    const filteredDelivery = [];
    const filteredSelfService = [];
    const allByMonth = {};

    for (const r of result.rows) {
      const m = r.month || 'Setembro/2026';
      const item = {
        id: r.id,
        category: r.category,
        position: r.position,
        name: r.name,
        percent: r.percent,
        tagline: r.tagline,
        icon: r.icon,
        image: r.image_url,
        imageUrl: r.image_url,
        medalBg: r.medal_bg,
        month: m
      };

      if (!allByMonth[m]) {
        allByMonth[m] = { delivery: [], selfService: [] };
      }
      if (r.category === 'delivery') {
        allByMonth[m].delivery.push(item);
        allDelivery.push(item);
      } else {
        allByMonth[m].selfService.push(item);
        allSelfService.push(item);
      }

      if (month && m.toLowerCase().includes(month.toLowerCase().split('/')[0])) {
        if (r.category === 'delivery') {
          filteredDelivery.push(item);
        } else {
          filteredSelfService.push(item);
        }
      }
    }

    const delivery = month ? filteredDelivery : allDelivery;
    const selfService = month ? filteredSelfService : allSelfService;

    res.json({ delivery, selfService, allByMonth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/top-units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body;
    await db.query(`
      UPDATE top_units_ranking SET
        name = COALESCE($1, name),
        percent = COALESCE($2, percent),
        tagline = COALESCE($3, tagline),
        image_url = COALESCE($4, image_url)
      WHERE id = $5;
    `, [u.name, u.percent, u.tagline, u.image || u.imageUrl, id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicialização do Servidor & Banco
initDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando com Postgres Lite em http://localhost:${PORT}`);
    console.log(`📊 Endpoint de saúde: http://localhost:${PORT}/api/health`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n🛑 Sinal ${signal} recebido. Encerrando servidor e liberando banco Postgres Lite...`);
    server.close(async () => {
      try {
        if (db && typeof db.close === 'function') {
          await db.close();
          console.log('✅ Conexão com Postgres Lite fechada com segurança.');
        }
      } catch (err) {
        console.error('Erro ao fechar banco:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}).catch((err) => {
  console.error('❌ Falha ao iniciar banco de dados:', err);
  process.exit(1);
});
