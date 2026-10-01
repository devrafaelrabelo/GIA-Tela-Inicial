import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { CompanyGoalData, TopUnitItem, MotivationalThought, DynamicCardContent } from '../../types';

export function useMetricsState() {
  const { showToast } = useAuth();

  const [companyGoal, setCompanyGoal] = useState<CompanyGoalData | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [errorGoal, setErrorGoal] = useState<string | null>(null);

  const [motivationalThoughts, setMotivationalThoughts] = useState<MotivationalThought[]>([]);
  const [isLoadingThoughts, setIsLoadingThoughts] = useState(true);
  const [errorThoughts, setErrorThoughts] = useState<string | null>(null);

  const [topUnits, setTopUnits] = useState<{ delivery: TopUnitItem[]; selfService: TopUnitItem[] }>({
    delivery: [],
    selfService: []
  });
  const [isLoadingTopUnits, setIsLoadingTopUnits] = useState(true);
  const [errorTopUnits, setErrorTopUnits] = useState<string | null>(null);

  const [dynamicCards, setDynamicCards] = useState<Record<string, DynamicCardContent>>({});

  const loadMetrics = useCallback(async () => {
    setIsLoadingGoal(true);
    setIsLoadingThoughts(true);
    setIsLoadingTopUnits(true);
    setErrorGoal(null);
    setErrorThoughts(null);
    setErrorTopUnits(null);

    try {
      const [dbGoal, dbTopUnits, dbThoughts, dbCards] = await Promise.allSettled([
        api.getCompanyGoals(),
        api.getTopUnits(),
        api.getMotivationalThoughts(),
        api.getDynamicCards(),
      ]);

      if (dbGoal.status === 'fulfilled' && dbGoal.value) {
        setCompanyGoal(dbGoal.value);
        setErrorGoal(null);
      } else if (dbGoal.status === 'fulfilled' && !dbGoal.value) {
        setErrorGoal('Metas não configuradas no servidor.');
      } else {
        setErrorGoal('Não foi possível conectar ao servidor para obter as metas da empresa.');
      }

      if (dbTopUnits.status === 'fulfilled' && dbTopUnits.value && Array.isArray(dbTopUnits.value.delivery)) {
        setTopUnits(dbTopUnits.value);
        setErrorTopUnits(null);
      } else {
        setErrorTopUnits('Não foi possível conectar ao servidor para obter o ranking das unidades.');
      }

      if (dbCards.status === 'fulfilled' && dbCards.value && Object.keys(dbCards.value).length > 0) {
        setDynamicCards(dbCards.value);
      }

      if (dbThoughts.status === 'fulfilled' && Array.isArray(dbThoughts.value) && dbThoughts.value.length > 0) {
        setMotivationalThoughts(dbThoughts.value);
        setErrorThoughts(null);
      } else if (dbThoughts.status === 'fulfilled' && Array.isArray(dbThoughts.value) && dbThoughts.value.length === 0) {
        if (dbCards.status === 'fulfilled' && dbCards.value && dbCards.value['card_1']) {
          setErrorThoughts(null);
        } else {
          setErrorThoughts('Nenhum pensamento cadastrado no servidor.');
        }
      } else {
        if (dbCards.status === 'fulfilled' && dbCards.value && dbCards.value['card_1']) {
          setErrorThoughts(null);
        } else {
          setErrorThoughts('Não foi possível conectar ao servidor para carregar o pensamento do dia.');
        }
      }
    } catch (err) {
      console.debug('Erro ao carregar métricas:', err);
      setErrorGoal('Erro de conexão com o banco de dados.');
      setErrorThoughts('Erro de conexão com o banco de dados.');
      setErrorTopUnits('Erro de conexão com o ranking.');
    } finally {
      setIsLoadingGoal(false);
      setIsLoadingThoughts(false);
      setIsLoadingTopUnits(false);
    }
  }, []);

  // ── Company Goal ──────────────────────────────────────────────────────────

  const updateCompanyGoal = useCallback(async (updated: Partial<CompanyGoalData>): Promise<void> => {
    try {
      await api.updateCompanyGoals(updated);
      setCompanyGoal((prev) => (prev ? { ...prev, ...updated } : (updated as CompanyGoalData)));
      showToast('Metas da empresa atualizadas no servidor com sucesso! 🎯', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar metas da empresa:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar metas: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const retryLoadCompanyGoal = useCallback(async (): Promise<void> => {
    setIsLoadingGoal(true);
    setErrorGoal(null);
    try {
      const g = await api.getCompanyGoals();
      if (g) {
        setCompanyGoal(g);
        setErrorGoal(null);
        showToast('Metas sincronizadas com sucesso! 🎯', 'success');
      } else {
        setErrorGoal('Metas não configuradas no servidor.');
      }
    } catch (err: unknown) {
      console.error('Falha ao reconectar com servidor de metas:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha na comunicação com o servidor.';
      setErrorGoal(errMsg);
      showToast('Não foi possível carregar as metas.', 'error');
    } finally {
      setIsLoadingGoal(false);
    }
  }, [showToast]);

  // ── Motivational Thoughts ─────────────────────────────────────────────────

  const addMotivationalThought = useCallback(async (thought: Partial<MotivationalThought>): Promise<MotivationalThought> => {
    try {
      const created = await api.createMotivationalThought(thought);
      setMotivationalThoughts((prev) => [created, ...prev]);
      setDynamicCards((prev) => ({
        ...prev,
        card_1: {
          id: 'card_1',
          title: created.title,
          content: created.content,
          imageUrl: created.imageUrl,
          authorName: created.authorName,
          authorRole: created.authorRole,
          updatedAt: 'Agora mesmo',
          likesCount: created.likesCount,
          userLiked: created.userLiked
        }
      }));
      showToast('Novo Pensamento do Dia salvo com sucesso no banco de dados! 💡', 'success');
      return created;
    } catch (err: unknown) {
      console.error('Erro ao salvar pensamento do dia:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao salvar pensamento: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const updateMotivationalThought = useCallback(async (id: string, thought: Partial<MotivationalThought>): Promise<void> => {
    try {
      await api.updateMotivationalThought(id, thought);
      setMotivationalThoughts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...thought } : t))
      );
      setDynamicCards((prev) => {
        const cur = prev['card_1'] || {};
        return {
          ...prev,
          card_1: {
            ...cur,
            title: thought.title !== undefined ? thought.title : cur.title,
            content: thought.content !== undefined ? thought.content : cur.content,
            imageUrl: thought.imageUrl !== undefined ? thought.imageUrl : cur.imageUrl,
            authorName: thought.authorName !== undefined ? thought.authorName : cur.authorName,
            authorRole: thought.authorRole !== undefined ? thought.authorRole : cur.authorRole,
            updatedAt: 'Agora mesmo'
          }
        };
      });
      showToast('Pensamento do Dia atualizado com sucesso no banco de dados!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar pensamento do dia:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar pensamento: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteMotivationalThought = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteMotivationalThought(id);
      setMotivationalThoughts((prev) => prev.filter((t) => t.id !== id));
      showToast('Pensamento do Dia removido com sucesso.', 'info');
    } catch (err: unknown) {
      console.error('Erro ao remover pensamento do dia:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao remover pensamento: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const toggleMotivationalThoughtLike = useCallback((id: string) => {
    api.toggleMotivationalThoughtLike(id).catch(() => {});
    setMotivationalThoughts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextLiked = !t.userLiked;
          const nextCount = (t.likesCount || 0) + (nextLiked ? 1 : -1);
          return { ...t, userLiked: nextLiked, likesCount: nextCount };
        }
        return t;
      })
    );
    setDynamicCards((prev) => {
      const cur = prev['card_1'];
      if (!cur) return prev;
      const nextLiked = !cur.userLiked;
      const nextCount = (cur.likesCount || 0) + (nextLiked ? 1 : -1);
      return {
        ...prev,
        card_1: {
          ...cur,
          userLiked: nextLiked,
          likesCount: nextCount
        }
      };
    });
  }, []);

  const retryLoadMotivationalThoughts = useCallback(async (): Promise<void> => {
    setIsLoadingThoughts(true);
    setErrorThoughts(null);
    try {
      const thoughts = await api.getMotivationalThoughts();
      if (Array.isArray(thoughts) && thoughts.length > 0) {
        setMotivationalThoughts(thoughts);
        setErrorThoughts(null);
        showToast('Pensamento do Dia atualizado com sucesso! 💡', 'success');
      } else {
        setErrorThoughts('Nenhum pensamento encontrado no momento.');
      }
    } catch (err: unknown) {
      console.error('Falha ao reconectar com pensamentos:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha na comunicação.';
      setErrorThoughts(errMsg);
      showToast('Não foi possível carregar os pensamentos.', 'error');
    } finally {
      setIsLoadingThoughts(false);
    }
  }, [showToast]);

  // ── Top Units ─────────────────────────────────────────────────────────────

  const updateTopUnit = useCallback((id: string, updated: Partial<TopUnitItem>) => {
    api.updateTopUnit(id, updated).catch(() => {});
    setTopUnits((prev) => ({
      delivery: prev.delivery.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      selfService: prev.selfService.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
  }, []);

  // ── Dynamic Cards ─────────────────────────────────────────────────────────

  const toggleDynamicCardLike = useCallback((cardId: string) => {
    setDynamicCards((prev) => {
      const current = prev[cardId];
      if (!current) return prev;
      const nextLiked = !current.userLiked;
      const nextCount = (current.likesCount || 0) + (nextLiked ? 1 : -1);
      showToast(nextLiked ? 'Você curtiu esta publicação! ⭐' : 'Reação removida', 'info');
      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          userLiked: nextLiked,
          likesCount: nextCount
        }
      };
      api.updateDynamicCard(cardId, { userLiked: nextLiked, likesCount: nextCount }).catch(() => {});
      return updated;
    });
  }, [showToast]);

  const updateDynamicCard = useCallback(async (cardId: string, content: Partial<DynamicCardContent>): Promise<void> => {
    try {
      await api.updateDynamicCard(cardId, content);
      setDynamicCards((prev) => ({
        ...prev,
        [cardId]: {
          ...(prev[cardId] || { id: cardId, likesCount: 0, userLiked: false }),
          ...content,
          id: cardId,
        }
      }));
    } catch (err: unknown) {
      console.error(`Erro ao salvar card dinâmico ${cardId}:`, err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao salvar no servidor: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  return {
    companyGoal,
    setCompanyGoal,
    isLoadingGoal,
    setIsLoadingGoal,
    errorGoal,
    setErrorGoal,
    motivationalThoughts,
    setMotivationalThoughts,
    isLoadingThoughts,
    setIsLoadingThoughts,
    errorThoughts,
    setErrorThoughts,
    topUnits,
    setTopUnits,
    isLoadingTopUnits,
    setIsLoadingTopUnits,
    errorTopUnits,
    setErrorTopUnits,
    dynamicCards,
    setDynamicCards,
    loadMetrics,
    updateCompanyGoal,
    retryLoadCompanyGoal,
    addMotivationalThought,
    updateMotivationalThought,
    deleteMotivationalThought,
    toggleMotivationalThoughtLike,
    retryLoadMotivationalThoughts,
    updateTopUnit,
    toggleDynamicCardLike,
    updateDynamicCard,
  };
}
