/**
 * Utilitários de data e formatação tipográfica em Português (Brasil)
 */

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  }
  if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  }
  return 'Boa noite';
}

export function formatFullCurrentDate(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // Capitaliza a primeira letra do dia da semana (ex: "Terça-feira, 22 de setembro de 2026")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short'
  }).format(date);
}

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, janeiro: 0,
  fev: 1, fevereiro: 1,
  mar: 2, março: 2, marco: 2,
  abr: 3, abril: 3,
  mai: 4, maio: 4,
  jun: 5, junho: 5,
  jul: 6, julho: 6,
  ago: 7, agosto: 7,
  set: 8, setembro: 8,
  out: 9, outubro: 9,
  nov: 10, novembro: 10,
  dez: 11, dezembro: 11
};

/**
 * Converte qualquer representação textual de data de evento para um objeto Date seguro.
 * Suporta formatos: "DD/MM", "DD/MM/YYYY", "YYYY-MM-DD", "25 de setembro", etc.
 */
export function parseEventDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim().toLowerCase();
  const currentYear = new Date().getFullYear();

  let day: number | null = null;
  let month: number | null = null;
  let year: number = currentYear;

  // Formato ISO: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else {
    // Formato com barra: DD/MM ou DD/MM/YYYY
    const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (slashMatch) {
      day = parseInt(slashMatch[1], 10);
      month = parseInt(slashMatch[2], 10) - 1;
      if (slashMatch[3]) {
        let y = parseInt(slashMatch[3], 10);
        if (y < 100) y += 2000;
        year = y;
      }
    } else {
      // Formato em português por extenso: "25 de setembro" ou "25 set"
      const textMatch = clean.match(/(\d{1,2})(?:\s+de)?\s+([a-zçã]+)(?:\s+(?:de\s+)?(\d{4}))?/);
      if (textMatch) {
        day = parseInt(textMatch[1], 10);
        const monthWord = textMatch[2].toLowerCase();
        for (const [key, idx] of Object.entries(MONTH_MAP)) {
          if (monthWord.startsWith(key)) {
            month = idx;
            break;
          }
        }
        if (textMatch[3]) {
          year = parseInt(textMatch[3], 10);
        }
      }
    }
  }

  if (day === null || month === null) {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  let hours = 23;
  let minutes = 59;
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  return new Date(year, month, day, hours, minutes, 59);
}

/**
 * Retorna true apenas se o evento for futuro (ou seja, data/hora >= agora ou data >= início do dia de hoje).
 */
export function isFutureEvent(dateStr: string, timeStr?: string): boolean {
  const eventDate = parseEventDate(dateStr, timeStr);
  if (!eventDate) return true; // Se formato for desconhecido, mantém visível por segurança

  const now = new Date();
  if (!timeStr) {
    // Sem horário específico: considera o dia de hoje inteiro como ativo/futuro
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);
    return eventDay.getTime() >= startOfToday.getTime();
  }

  // Com horário específico: compara momento exato
  return eventDate.getTime() >= now.getTime();
}

/**
 * Converte qualquer representação temporal de uma postagem do fórum em epoch milliseconds numérico exato.
 * Suporta:
 * 1. Campo ISO string `timestamp`
 * 2. Campo `created_timestamp` retornado pelo banco PostgreSQL
 * 3. Logs de auditoria (criação da publicação)
 * 4. Timestamps embutidos no ID (ex: post_1742918239000)
 * 5. Mapeamento dos posts iniciais do mockData para garantir ordem perfeita
 * 6. Parsing semântico de textos relativos em português ("Agora mesmo", "Há 2 horas", "Ontem às 16:40", etc.)
 */
export function getForumPostTimestamp(post: {
  timestamp?: string;
  created_timestamp?: string;
  createdAt?: string;
  timeAgo?: string;
  id?: string;
  auditLog?: Array<{ timestamp?: string; action?: string }>;
}): number {
  if (!post) return Date.now();

  // 1. Timestamp ISO explícito
  if (post.timestamp) {
    const t = new Date(post.timestamp).getTime();
    if (!isNaN(t)) return t;
  }

  // 2. Timestamp do banco de dados (created_timestamp)
  if (post.created_timestamp) {
    const t = new Date(post.created_timestamp).getTime();
    if (!isNaN(t)) return t;
  }

  // 3. Log de auditoria de criação
  if (Array.isArray(post.auditLog) && post.auditLog.length > 0) {
    const createdLog = post.auditLog.find((l) => l.action === 'created') || post.auditLog[0];
    if (createdLog?.timestamp) {
      const t = new Date(createdLog.timestamp).getTime();
      if (!isNaN(t)) return t;
    }
  }

  // 4. Timestamp numérico embutido no id (ex: post_1727101234567)
  if (post.id) {
    const idMatch = post.id.match(/^post_(\d{11,})$/);
    if (idMatch) {
      const parsed = parseInt(idMatch[1], 10);
      if (!isNaN(parsed) && parsed > 1600000000000) {
        return parsed;
      }
    }
  }

  const now = Date.now();

  // 5. Mapeamento explícito para IDs do mockData caso estejam em cache sem timestamp
  if (post.id === 'post_1') return now - 2 * 3600 * 1000; // Há 2 horas
  if (post.id === 'post_2') return now - 4 * 3600 * 1000; // Há 4 horas
  if (post.id === 'post_3') {
    // Ontem às 16:40
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(16, 40, 0, 0);
    return d.getTime();
  }
  if (post.id === 'post_4') {
    // Ontem às 11:20
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(11, 20, 0, 0);
    return d.getTime();
  }
  if (post.id === 'post_5') return now - 2 * 86400 * 1000; // Há 2 dias
  if (post.id === 'post_6') return now - 3 * 86400 * 1000; // Há 3 dias

  // 6. Parsing textual em português a partir de timeAgo ou createdAt
  const text = (post.timeAgo || post.createdAt || '').trim().toLowerCase();
  if (text) {
    if (text === 'agora mesmo' || text === 'agora' || text === 'hoje') {
      return now;
    }

    // "há X minuto(s)" ou "há X min"
    const minMatch = text.match(/h[áa]\s*(\d+)\s*min/);
    if (minMatch) {
      return now - parseInt(minMatch[1], 10) * 60 * 1000;
    }

    // "há X hora(s)" ou "há X h"
    const hourMatch = text.match(/h[áa]\s*(\d+)\s*h/);
    if (hourMatch) {
      return now - parseInt(hourMatch[1], 10) * 3600 * 1000;
    }

    // "ontem às HH:mm"
    const ontemMatch = text.match(/ontem\s*(?:[àa]s)?\s*(\d{1,2}):(\d{2})/);
    if (ontemMatch) {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      d.setHours(parseInt(ontemMatch[1], 10), parseInt(ontemMatch[2], 10), 0, 0);
      return d.getTime();
    }

    // "hoje às HH:mm"
    const hojeMatch = text.match(/hoje\s*(?:[àa]s)?\s*(\d{1,2}):(\d{2})/);
    if (hojeMatch) {
      const d = new Date(now);
      d.setHours(parseInt(hojeMatch[1], 10), parseInt(hojeMatch[2], 10), 0, 0);
      return d.getTime();
    }

    // "há X dia(s)"
    const diaMatch = text.match(/h[áa]\s*(\d+)\s*dia/);
    if (diaMatch) {
      return now - parseInt(diaMatch[1], 10) * 86400 * 1000;
    }

    // Tentativa direta com Date (para ISO strings em createdAt/timeAgo)
    const parsed = new Date(text).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  return now;
}

/**
 * Formata um timestamp para exibição relativa amigável em português (ex: "Há 15 minutos", "Ontem às 14:30")
 */
export function formatRelativeTimePtBR(time: number | string | Date): string {
  const date = typeof time === 'number' ? new Date(time) : new Date(time);
  if (isNaN(date.getTime())) return 'Hoje';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Agora mesmo';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays === 1) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `Ontem às ${hh}:${mm}`;
  }
  if (diffDays < 7) return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Retorna a melhor formatação de tempo para o card ou modal de detalhe do post.
 */
export function formatPostTimeAgo(post: {
  timestamp?: string;
  created_timestamp?: string;
  timeAgo?: string;
  createdAt?: string;
  id?: string;
}): string {
  if (!post) return 'Hoje';

  // Se já tiver uma formatação explícita amigável (não ISO)
  if (post.timeAgo && !post.timeAgo.includes('T') && post.timeAgo !== 'Hoje') {
    return post.timeAgo;
  }
  if (post.createdAt && !post.createdAt.includes('T') && post.createdAt !== 'Hoje') {
    return post.createdAt;
  }

  const ts = getForumPostTimestamp(post);
  return formatRelativeTimePtBR(ts);
}

