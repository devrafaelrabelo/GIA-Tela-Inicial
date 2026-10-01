import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { CompanyHighlightItem, EmployeeHighlightItem } from '../../types';

export function useHighlightsState() {
  const { showToast } = useAuth();

  const [companyHighlights, setCompanyHighlights] = useState<CompanyHighlightItem[]>([]);
  const [employeeHighlights, setEmployeeHighlights] = useState<EmployeeHighlightItem[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [errorHighlights, setErrorHighlights] = useState<string | null>(null);

  const loadHighlights = useCallback(async () => {
    setIsLoadingHighlights(true);
    setErrorHighlights(null);
    try {
      const [compH, empH] = await Promise.allSettled([
        api.getCompanyHighlights(),
        api.getEmployeeHighlights(),
      ]);
      if (compH.status === 'fulfilled' && Array.isArray(compH.value)) {
        setCompanyHighlights(compH.value);
        setErrorHighlights(null);
      } else {
        setErrorHighlights('Não foi possível carregar os destaques corporativos.');
      }
      if (empH.status === 'fulfilled' && Array.isArray(empH.value)) {
        setEmployeeHighlights(empH.value);
      }
    } catch {
      setErrorHighlights('Não foi possível carregar os destaques corporativos.');
    } finally {
      setIsLoadingHighlights(false);
    }
  }, []);

  // ── Company Highlights ────────────────────────────────────────────────────

  const addCompanyHighlight = useCallback(async (
    newH: Omit<CompanyHighlightItem, 'id' | 'likesCount' | 'userLiked'>
  ): Promise<CompanyHighlightItem> => {
    const item: CompanyHighlightItem = {
      ...newH,
      id: crypto.randomUUID(),
      likesCount: 0,
      userLiked: false
    };
    try {
      const created = await api.createCompanyHighlight(item);
      const finalItem = created || item;
      setCompanyHighlights((prev) => [finalItem, ...prev]);
      showToast('Nova Empresa Destaque adicionada ao Card 2! 🏆', 'success');
      return finalItem;
    } catch (err: unknown) {
      console.error('Erro ao adicionar destaque da empresa:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao adicionar destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const updateCompanyHighlight = useCallback(async (id: string, updated: Partial<CompanyHighlightItem>): Promise<void> => {
    try {
      await api.updateCompanyHighlight(id, updated);
      setCompanyHighlights((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      showToast('Destaque da empresa atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar destaque da empresa:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteCompanyHighlight = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteCompanyHighlight(id);
      setCompanyHighlights((prev) => prev.filter((item) => item.id !== id));
      showToast('Destaque da empresa removido!', 'info');
    } catch (err: unknown) {
      console.error('Erro ao remover destaque da empresa:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao remover destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const toggleCompanyHighlightLike = useCallback((id: string) => {
    api.toggleCompanyHighlightLike(id).catch(() => {});
    setCompanyHighlights((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.userLiked;
          return {
            ...item,
            userLiked: nextLiked,
            likesCount: item.likesCount + (nextLiked ? 1 : -1)
          };
        }
        return item;
      })
    );
  }, []);

  // ── Employee Highlights ───────────────────────────────────────────────────

  const addEmployeeHighlight = useCallback(async (
    newEmp: Omit<EmployeeHighlightItem, 'id' | 'likesCount' | 'userLiked'>
  ): Promise<EmployeeHighlightItem> => {
    const item: EmployeeHighlightItem = {
      ...newEmp,
      id: crypto.randomUUID(),
      likesCount: 0,
      userLiked: false
    };
    try {
      const created = await api.createEmployeeHighlight(item);
      const finalItem = created || item;
      setEmployeeHighlights((prev) => [finalItem, ...prev]);
      showToast('Novo Funcionário Destaque adicionado ao Card 3! ⭐', 'success');
      return finalItem;
    } catch (err: unknown) {
      console.error('Erro ao adicionar funcionário destaque:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao adicionar destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const updateEmployeeHighlight = useCallback(async (id: string, updated: Partial<EmployeeHighlightItem>): Promise<void> => {
    try {
      await api.updateEmployeeHighlight(id, updated);
      setEmployeeHighlights((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      showToast('Funcionário Destaque atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar funcionário destaque:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteEmployeeHighlight = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteEmployeeHighlight(id);
      setEmployeeHighlights((prev) => prev.filter((item) => item.id !== id));
      showToast('Funcionário destaque removido!', 'info');
    } catch (err: unknown) {
      console.error('Erro ao remover funcionário destaque:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao remover destaque: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const toggleEmployeeHighlightLike = useCallback((id: string) => {
    api.toggleEmployeeHighlightLike(id).catch(() => {});
    setEmployeeHighlights((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.userLiked;
          return {
            ...item,
            userLiked: nextLiked,
            likesCount: item.likesCount + (nextLiked ? 1 : -1)
          };
        }
        return item;
      })
    );
  }, []);

  return {
    companyHighlights,
    setCompanyHighlights,
    employeeHighlights,
    setEmployeeHighlights,
    isLoadingHighlights,
    setIsLoadingHighlights,
    errorHighlights,
    setErrorHighlights,
    loadHighlights,
    addCompanyHighlight,
    updateCompanyHighlight,
    deleteCompanyHighlight,
    toggleCompanyHighlightLike,
    addEmployeeHighlight,
    updateEmployeeHighlight,
    deleteEmployeeHighlight,
    toggleEmployeeHighlightLike,
  };
}
