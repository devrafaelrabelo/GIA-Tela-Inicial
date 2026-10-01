/**
 * Utilitário seguro para acesso ao localStorage.
 * Trata QuotaExceededError, JSON inválido e impede que erros de persistência
 * travem ou unmountem a aplicação React (evitando a "tela branca").
 */
export const safeStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      // Validação de tipo para arrays
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        return fallback;
      }
      return parsed as T;
    } catch (err) {
      console.warn(`[safeStorage] Erro ao carregar "${key}" do localStorage:`, err);
      return fallback;
    }
  },

  setItem: (key: string, value: unknown): boolean => {
    try {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, str);
      return true;
    } catch (err) {
      console.warn(
        `[safeStorage] Não foi possível salvar "${key}" no localStorage (QuotaExceededError ou bloqueio):`,
        err
      );
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[safeStorage] Erro ao remover "${key}":`, err);
    }
  }
};

