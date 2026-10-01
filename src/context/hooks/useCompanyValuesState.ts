import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { CompanyValueSlide } from '../../types';

export function useCompanyValuesState() {
  const { showToast } = useAuth();

  const [companyValues, setCompanyValues] = useState<CompanyValueSlide[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(true);
  const [errorValues, setErrorValues] = useState<string | null>(null);

  const loadCompanyValues = useCallback(async () => {
    setIsLoadingValues(true);
    setErrorValues(null);
    try {
      const data = await api.getCompanyValues();
      if (Array.isArray(data)) {
        setCompanyValues(data);
        setErrorValues(null);
      } else {
        setErrorValues('Não foi possível conectar ao servidor para carregar os valores da empresa.');
      }
    } catch {
      setErrorValues('Não foi possível conectar ao servidor para carregar os valores da empresa.');
    } finally {
      setIsLoadingValues(false);
    }
  }, []);

  const activeCompanyValues = useMemo(() => {
    if (!Array.isArray(companyValues) || companyValues.length === 0) {
      return [];
    }
    const active = companyValues.filter((v) => v && v.isActive !== false);
    return active.length > 0 ? active : companyValues;
  }, [companyValues]);

  const addCompanyValue = useCallback(async (newVal: Omit<CompanyValueSlide, 'id'>): Promise<CompanyValueSlide> => {
    const val: CompanyValueSlide = {
      ...newVal,
      id: crypto.randomUUID(),
      isActive: newVal.isActive ?? true
    };
    try {
      const created = await api.createCompanyValue(val);
      const finalVal = created || val;
      setCompanyValues((prev) => [...prev, finalVal]);
      showToast('Novo valor corporativo adicionado com sucesso!', 'success');
      return finalVal;
    } catch (err: unknown) {
      console.error('Erro ao adicionar valor corporativo:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao adicionar valor: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const updateCompanyValue = useCallback(async (id: string, updated: Partial<CompanyValueSlide>): Promise<void> => {
    try {
      await api.updateCompanyValue(id, updated);
      setCompanyValues((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
      );
      showToast('Valor corporativo atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar valor corporativo:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar valor: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteCompanyValue = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteCompanyValue(id);
      setCompanyValues((prev) => prev.filter((v) => v.id !== id));
      showToast('Valor corporativo removido!', 'info');
    } catch (err: unknown) {
      console.error('Erro ao remover valor corporativo:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao remover valor: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const toggleCompanyValueActive = useCallback((id: string) => {
    const target = companyValues.find((v) => v.id === id);
    if (target) {
      api.updateCompanyValue(id, { isActive: !target.isActive }).catch(() => {});
    }
    setCompanyValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  }, [companyValues]);

  return {
    companyValues,
    setCompanyValues,
    activeCompanyValues,
    isLoadingValues,
    setIsLoadingValues,
    errorValues,
    setErrorValues,
    loadCompanyValues,
    addCompanyValue,
    updateCompanyValue,
    deleteCompanyValue,
    toggleCompanyValueActive,
  };
}
