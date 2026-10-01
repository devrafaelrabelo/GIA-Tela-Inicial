/**
 * Utilitários para normalização de texto e busca insensível a acentos (diacríticos)
 * e maiúsculas/minúsculas.
 */

/**
 * Remove acentos gráficos, diacríticos (til, cedilha, agudo, circunflexo, etc.)
 * e converte para letras minúsculas.
 * 
 * Exemplos:
 * - "Comemoração" -> "comemoracao"
 * - "Dúvidas & Suporte" -> "duvidas & suporte"
 * - "João Silva" -> "joao silva"
 * - "LÍDER OPERACIONAL" -> "lider operacional"
 * - "Atenção às 15h" -> "atencao as 15h"
 */
export function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\p{M}/gu, '')
    .trim();
}

/**
 * Verifica se um texto pesquisável contém TODAS as palavras digitadas pelo usuário
 * (busca por palavras separadas), sem distinção de acentos ou maiúsculas/minúsculas.
 *
 * Suporta também variações com pontuação, hífens e caracteres especiais.
 * Exemplo:
 * - busca "duvida" encontra "Dúvida rápida: Precisa de suporte técnico"
 * - busca "suporte tecnico" encontra "...suporte técnico..."
 * - busca "comemoracao leste" encontra "...Unidade Leste... Comemoração..."
 * - busca "boas vindas" encontra "Boas-vindas aos 8 novos colaboradores"
 * - busca "boas-vindas" encontra "Boas vindas aos 8 novos colaboradores"
 */
export function matchesSeparatedWords(searchableText?: string | null, searchQuery?: string | null): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!searchableText || !searchableText.trim()) return false;

  const normalizedQuery = normalizeText(searchQuery);
  const words = normalizedQuery.split(/\s+/).map((w) => w.trim()).filter(Boolean);
  if (words.length === 0) return true;

  const normTarget = normalizeText(searchableText);
  // Versão alternativa substituindo hífens e pontuações por espaço para facilitar matching de palavras compostas
  const unpunctTarget = normTarget.replace(/[-_.,;:!?/\\()[\]{}"'#@]/g, ' ');

  return words.every((word) => {
    // 1. Procura a palavra exata normalizada no texto normalizado
    if (normTarget.includes(word)) return true;

    // 2. Procura no texto sem pontuação
    if (unpunctTarget.includes(word)) return true;

    // 3. Se a própria palavra pesquisada continha pontuação (ex: 'duvida?' ou 'boas-vindas'),
    // removemos a pontuação da palavra e testamos novamente
    const cleanWord = word.replace(/[-_.,;:!?/\\()[\]{}"'#@]/g, '').trim();
    if (cleanWord && (normTarget.includes(cleanWord) || unpunctTarget.includes(cleanWord))) {
      return true;
    }

    return false;
  });
}
