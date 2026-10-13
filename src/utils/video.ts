/**
 * Utilitários para detecção, parsing e tratamento de vídeos em postagens
 * Suporta embeds (YouTube, Vimeo, Loom) e arquivos diretos/uploads (MP4, WebM, etc.)
 */

export interface ParsedVideo {
  type: 'embed' | 'direct';
  provider?: 'youtube' | 'vimeo' | 'loom' | 'direct';
  embedUrl?: string;
  directUrl?: string;
  originalUrl: string;
}

export function parseVideoUrl(url?: string | null): ParsedVideo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Data URL (Upload direto em base64)
  if (trimmed.startsWith('data:video/')) {
    return {
      type: 'direct',
      provider: 'direct',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 2. YouTube
  // Formatos: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = trimmed.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'embed',
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      originalUrl: trimmed,
    };
  }

  // 3. Vimeo
  // Formatos: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'embed',
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: trimmed,
    };
  }

  // 4. Loom
  // Formatos: loom.com/share/ID, loom.com/embed/ID
  const loomRegex = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i;
  const loomMatch = trimmed.match(loomRegex);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'embed',
      provider: 'loom',
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      originalUrl: trimmed,
    };
  }

  // 5. Arquivo direto de vídeo na web (.mp4, .webm, .ogg, .mov)
  const directVideoRegex = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
  if (directVideoRegex.test(trimmed)) {
    return {
      type: 'direct',
      provider: 'direct',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // Se for uma URL genérica não reconhecida mas informada pelo usuário,
  // tentamos como direct se for http(s)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct',
      provider: 'direct',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return null;
}

/**
 * Lê um arquivo de vídeo do input e retorna seu data URL
 */
export function readVideoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Erro ao converter o vídeo para base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
