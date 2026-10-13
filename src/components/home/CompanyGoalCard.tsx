import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Target, ArrowUp, Flag, Building2, Users, Calendar, ChevronDown, Award, Settings2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { PORTAL_MONTH_OPTIONS, CURRENT_PORTAL_MONTH, isCurrentPortalMonth, formatPortalMonthDropdownItem } from '../../utils/date';

const MONTH_OPTIONS = PORTAL_MONTH_OPTIONS;

const cleanGoalText = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/Este m[\ufffd\?]s/gi, 'Este mês')
    .replace(/vs\. m[\ufffd\?]s anterior/gi, 'vs. mês anterior')
    .replace(/m[\ufffd\?]s/gi, 'mês')
    .replace(/Ritmo Forte \?\?/gi, 'Ritmo Forte 🚀')
    .replace(/\?\?/g, '🚀');
};

export const CompanyGoalCard: React.FC = () => {
  const { authStatus, currentUser, openPublishModal } = useAuth();
  const { companyGoal, isLoadingGoal, errorGoal, retryLoadCompanyGoal } = usePortal();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_PORTAL_MONTH);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };
    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthDropdownOpen]);

  const currentGoalData = useMemo(() => {
    if (!companyGoal) return null;
    if (isCurrentPortalMonth(selectedMonth)) return companyGoal;
    const clean = selectedMonth.toLowerCase().split('/')[0];
    const match = companyGoal.history?.find((h) => h.month && h.month.toLowerCase().includes(clean));
    return match || companyGoal;
  }, [companyGoal, selectedMonth]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLoadCompanyGoal();
    } finally {
      setIsRetrying(false);
    }
  };

  // 1. Estado de Carregamento Ativo (Skeleton)
  if (isLoadingGoal) {
    return (
      <section
        id="metas-section"
        aria-label="Carregando Meta Geral da Empresa"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full animate-pulse min-h-[300px]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="space-y-1.5">
              <div className="w-36 h-4 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="w-52 h-3 bg-stone-100 dark:bg-stone-900 rounded-md" />
            </div>
          </div>
          <div className="w-24 h-7 bg-stone-200 dark:bg-stone-800 rounded-lg" />
        </div>
        <div className="my-5 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div className="w-32 h-3 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="w-16 h-5 bg-stone-200 dark:bg-stone-800 rounded" />
          </div>
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-full" />
          <div className="flex justify-between pt-1">
            <div className="w-12 h-2.5 bg-stone-100 dark:bg-stone-900 rounded" />
            <div className="w-16 h-2.5 bg-stone-100 dark:bg-stone-900 rounded" />
            <div className="w-16 h-2.5 bg-stone-100 dark:bg-stone-900 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 h-20" />
          ))}
        </div>
      </section>
    );
  }

  // 2. Estado de Erro na API (Não fica carregando infinitamente)
  if (errorGoal || !companyGoal) {
    return (
      <section
        id="metas-section"
        aria-label="Erro ao carregar Meta Geral da Empresa"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-red-200/80 dark:border-red-900/60 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full min-h-[300px]"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  META GERAL DA EMPRESA
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Indicador consolidado de faturamento e conversão global da rede
              </p>
            </div>
          </div>

          {isEditor && (
            <button
              type="button"
              onClick={() => openPublishModal('metas')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#7c172e] text-white hover:bg-[#631023] transition-all shadow-2xs cursor-pointer"
            >
              <Settings2 size={13} />
              <span>Configurar Metas</span>
            </button>
          )}
        </div>

        {/* Mensagem Explicativa de Erro */}
        <div className="my-auto py-6 px-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center space-y-3">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
            Não foi possível carregar as metas no momento
          </p>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 max-w-md mx-auto">
            Não foi possível sincronizar os dados de metas da empresa no momento.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw size={13} className={isRetrying ? 'animate-spin text-[#7c172e]' : 'text-stone-500'} />
              <span>{isRetrying ? 'Reconectando...' : 'Tentar novamente'}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 3. Renderização normal com dados vindos do backend
  const targetPercent = currentGoalData?.targetPercent ?? 0;
  const statusText = cleanGoalText(currentGoalData?.statusText) || 'Em Andamento';
  const metaMonth = currentGoalData?.metaMonth || `${targetPercent}%`;
  const metaMonthSubtext = cleanGoalText(currentGoalData?.metaMonthSubtext) || `Falta ${Math.max(0, 100 - targetPercent)}% para o topo`;
  const growthPercent = currentGoalData?.growthPercent || '0%';
  const growthSubtext = cleanGoalText(currentGoalData?.growthSubtext) || 'vs. mês anterior';
  const unitsOnTarget = currentGoalData?.unitsOnTarget || '0 de 0';
  const unitsOnTargetSubtext = cleanGoalText(currentGoalData?.unitsOnTargetSubtext) || 'Unidades auditadas';
  const engagementPercent = currentGoalData?.engagementPercent || '100%';
  const engagementSubtext = cleanGoalText(currentGoalData?.engagementSubtext) || 'Juntos vamos mais longe!';
  const monthText = isCurrentPortalMonth(selectedMonth) ? 'Este mês' : selectedMonth;

  return (
    <section
      id="metas-section"
      aria-label="Meta Geral da Empresa"
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md"
    >
      <div>
        {/* Header with Card Identifier & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shadow-2xs font-bold shrink-0">
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  META GERAL DA EMPRESA
                </h3>
                {isEditor && (
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                    Modo Gestão
                  </span>
                )}
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
                  {statusText}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Indicador consolidado de faturamento e conversão global da rede
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isEditor && (
              <button
                type="button"
                onClick={() => openPublishModal('metas')}
                title="Editar Metas da Empresa"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#7c172e]/10 hover:bg-[#7c172e]/20 text-[#7c172e] dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-[#7c172e]/20 transition-all cursor-pointer shadow-2xs"
              >
                <Settings2 size={13} />
                <span>Editar Metas</span>
              </button>
            )}

            {/* Month Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
                aria-label="Filtrar meta por mês"
                aria-expanded={isMonthDropdownOpen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/80 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 transition-colors shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7c172e]"
              >
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{monthText}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#251e20] border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
                  {MONTH_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(m);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        selectedMonth === m
                          ? 'bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 font-bold'
                          : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/50'
                      }`}
                    >
                      <span>{formatPortalMonthDropdownItem(m)}</span>
                      {selectedMonth === m && <span className="text-[10px] text-[#7c172e] dark:text-rose-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gamified Progress Bar & Milestones */}
        <div className="my-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Award size={14} className="text-amber-500" />
              <span>Progresso em direção à Supermeta</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight tabular-nums leading-none">
                {targetPercent}%
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                atingido
              </span>
            </div>
          </div>

          {/* Bar with milestones */}
          <div className="relative">
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-4 overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#7c172e] via-[#a81c3b] to-[#d9224b] h-full rounded-full transition-all duration-1000 relative shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, targetPercent))}%` }}
              >
                {/* Glowing tip */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Milestone labels below bar */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 dark:text-stone-500 pt-1.5 px-0.5">
              <span>0% Início</span>
              <span className="text-stone-500 font-medium">80% Meta Base</span>
              <span className="font-bold text-[#7c172e] dark:text-rose-400">100% Meta</span>
              <span className="text-amber-600 dark:text-amber-400">120% Supermeta ⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Executive Micro-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Card 1: Meta */}
        <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1">
            <Flag size={12} className="text-rose-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Meta do Mês</p>
          </div>
          <p className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tabular-nums">{metaMonth}</p>
          <span className="text-[9px] text-stone-400 font-medium">{metaMonthSubtext}</span>
        </div>

        {/* Card 2: Crescimento */}
        <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
            <ArrowUp size={12} className="text-emerald-500 stroke-[2.5]" />
            <p className="text-[10px] font-bold uppercase tracking-wider truncate">Crescimento</p>
          </div>
          <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {growthPercent}
          </p>
          <span className="text-[9px] text-emerald-600/80 font-medium">{growthSubtext}</span>
        </div>

        {/* Card 3: Unidades */}
        <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1">
            <Building2 size={12} className="text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider truncate">Unidades na Meta</p>
          </div>
          <p className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tabular-nums">
            {unitsOnTarget}
          </p>
          <span className="text-[9px] text-stone-400 font-medium">{unitsOnTargetSubtext}</span>
        </div>

        {/* Card 4: Engajamento */}
        <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 transition-all">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-1">
            <Users size={12} className="text-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Engajamento</p>
          </div>
          <p className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tabular-nums">
            {engagementPercent}
          </p>
          <span className="text-[9px] text-stone-400 font-medium">{engagementSubtext}</span>
        </div>
      </div>
    </section>
  );
};
