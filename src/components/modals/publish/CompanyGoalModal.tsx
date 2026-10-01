import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle2, AlertCircle, Loader2, Award, ArrowUp, Building2, Users, Calendar } from 'lucide-react';
import { usePortal } from '../../../context/PortalContext';
import { useModalDismiss } from '../../../hooks/useModalDismiss';

interface CompanyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyGoalModal: React.FC<CompanyGoalModalProps> = ({ isOpen, onClose }) => {
  const { companyGoal, updateCompanyGoal } = usePortal();

  const [month, setMonth] = useState('Este mês');
  const [targetPercent, setTargetPercent] = useState<number>(93);
  const [statusText, setStatusText] = useState('Ritmo Forte 🚀');
  const [metaMonth, setMetaMonth] = useState('93%');
  const [metaMonthSubtext, setMetaMonthSubtext] = useState('Falta 7% para o topo');
  const [growthPercent, setGrowthPercent] = useState('+12%');
  const [growthSubtext, setGrowthSubtext] = useState('vs. mês anterior');
  const [unitsOnTarget, setUnitsOnTarget] = useState('11 de 15');
  const [unitsOnTargetSubtext, setUnitsOnTargetSubtext] = useState('73% da rede aprovada');
  const [engagementPercent, setEngagementPercent] = useState('100%');
  const [engagementSubtext, setEngagementSubtext] = useState('Juntos vamos mais longe!');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  useEffect(() => {
    if (companyGoal) {
      setMonth(companyGoal.month || 'Este mês');
      setTargetPercent(companyGoal.targetPercent ?? 93);
      setStatusText(companyGoal.statusText || 'Ritmo Forte 🚀');
      setMetaMonth(companyGoal.metaMonth || `${companyGoal.targetPercent ?? 93}%`);
      setMetaMonthSubtext(companyGoal.metaMonthSubtext || `Falta ${Math.max(0, 100 - (companyGoal.targetPercent ?? 93))}% para o topo`);
      setGrowthPercent(companyGoal.growthPercent || '+12%');
      setGrowthSubtext(companyGoal.growthSubtext || 'vs. mês anterior');
      setUnitsOnTarget(companyGoal.unitsOnTarget || '11 de 15');
      setUnitsOnTargetSubtext(companyGoal.unitsOnTargetSubtext || '73% da rede aprovada');
      setEngagementPercent(companyGoal.engagementPercent || '100%');
      setEngagementSubtext(companyGoal.engagementSubtext || 'Juntos vamos mais longe!');
    }
  }, [isOpen, companyGoal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await updateCompanyGoal({
        month: month.trim() || 'Este mês',
        targetPercent: Number(targetPercent),
        statusText: statusText.trim() || 'Ritmo Forte 🚀',
        metaMonth: metaMonth.trim() || `${targetPercent}%`,
        metaMonthSubtext: metaMonthSubtext.trim() || `Falta ${Math.max(0, 100 - targetPercent)}% para o topo`,
        growthPercent: growthPercent.trim() || '+12%',
        growthSubtext: growthSubtext.trim() || 'vs. mês anterior',
        unitsOnTarget: unitsOnTarget.trim() || '11 de 15',
        unitsOnTargetSubtext: unitsOnTargetSubtext.trim() || '73% da rede aprovada',
        engagementPercent: engagementPercent.trim() || '100%',
        engagementSubtext: engagementSubtext.trim() || 'Juntos vamos mais longe!'
      });

      onClose();
    } catch (err: any) {
      console.error('Falha ao atualizar metas da empresa no servidor:', err);
      const msg = err?.message || 'Falha ao salvar metas no servidor.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-goal-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Target size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="company-goal-modal-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100 [text-wrap:balance]">
                  Gerenciar Meta Geral da Empresa
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300">
                  Indicadores Globais
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Atualize o indicador consolidado de faturamento, crescimento e conversão da rede
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de metas da empresa"
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 text-xs">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Não foi possível salvar no servidor:</p>
                <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          {/* Seção 1: Indicador Geral e Status */}
          <div className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/80 space-y-3">
            <h4 className="font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
              <Award size={14} className="text-amber-500" />
              <span>Progresso Global & Status da Rede</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Mês de Referência *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Este mês ou Setembro"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs"
                  />
                  <Calendar size={13} className="absolute right-3 top-2.5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Progresso Geral (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  required
                  value={targetPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetPercent(val);
                    setMetaMonth(`${val}%`);
                    setMetaMonthSubtext(`Falta ${Math.max(0, 100 - val)}% para o topo`);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-black shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Badge de Ritmo / Status *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ritmo Forte 🚀"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Micro-indicadores dos 4 Cards */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-stone-800 dark:text-stone-200 text-xs">
              4 Indicadores de Performance (Cards)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Meta do Mês */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2">
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-[11px]">
                  <Target size={12} className="text-rose-500" />
                  <span>1. Meta do Mês</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: 93%"
                  value={metaMonth}
                  onChange={(e) => setMetaMonth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                />
                <input
                  type="text"
                  placeholder="Subtexto (Ex: Falta 7% para o topo)"
                  value={metaMonthSubtext}
                  onChange={(e) => setMetaMonthSubtext(e.target.value)}
                  className="w-full px-3 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500"
                />
              </div>

              {/* Card 2: Crescimento */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                  <ArrowUp size={12} className="text-emerald-500 stroke-[2.5]" />
                  <span>2. Crescimento</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: +12%"
                  value={growthPercent}
                  onChange={(e) => setGrowthPercent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-emerald-600"
                />
                <input
                  type="text"
                  placeholder="Subtexto (Ex: vs. mês anterior)"
                  value={growthSubtext}
                  onChange={(e) => setGrowthSubtext(e.target.value)}
                  className="w-full px-3 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500"
                />
              </div>

              {/* Card 3: Unidades na Meta */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2">
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-[11px]">
                  <Building2 size={12} className="text-blue-500" />
                  <span>3. Unidades na Meta</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11 de 15"
                  value={unitsOnTarget}
                  onChange={(e) => setUnitsOnTarget(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                />
                <input
                  type="text"
                  placeholder="Subtexto (Ex: 73% da rede aprovada)"
                  value={unitsOnTargetSubtext}
                  onChange={(e) => setUnitsOnTargetSubtext(e.target.value)}
                  className="w-full px-3 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500"
                />
              </div>

              {/* Card 4: Engajamento */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 space-y-2">
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-[11px]">
                  <Users size={12} className="text-amber-500" />
                  <span>4. Engajamento</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: 100%"
                  value={engagementPercent}
                  onChange={(e) => setEngagementPercent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                />
                <input
                  type="text"
                  placeholder="Subtexto (Ex: Juntos vamos mais longe!)"
                  value={engagementSubtext}
                  onChange={(e) => setEngagementSubtext(e.target.value)}
                  className="w-full px-3 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#7c172e] to-[#631023] hover:from-[#8d1a34] shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Salvando no servidor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Salvar Metas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
