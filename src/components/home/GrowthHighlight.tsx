import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Calendar, Plus, Heart, Trophy, ChevronLeft, ChevronRight, ChevronDown, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { isReducedMotionPreferred } from '../../utils/date';

const MONTH_OPTIONS = [
  'Setembro/2026',
  'Agosto/2026',
  'Julho/2026',
  'Junho/2026',
  'Maio/2026',
  'Abril/2026',
  'Março/2026',
  'Fevereiro/2026',
  'Janeiro/2026',
  'Todos os meses'
];

export const GrowthHighlight: React.FC = () => {
  const { authStatus, currentUser, openPublishModal } = useAuth();
  const { employeeHighlights, toggleEmployeeHighlightLike, isLoadingHighlights, errorHighlights, retrySyncAll } = usePortal();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Setembro/2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

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

  const slides = useMemo(() => {
    if (selectedMonth === 'Todos os meses') return employeeHighlights;
    const cleanFilter = selectedMonth.toLowerCase().split('/')[0];
    const filtered = employeeHighlights.filter((s) => s.date && s.date.toLowerCase().includes(cleanFilter));
    return filtered.length > 0 ? filtered : employeeHighlights;
  }, [employeeHighlights, selectedMonth]);

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIdx((prevIdx) => (prevIdx - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIdx((prevIdx) => (prevIdx + 1) % slides.length);
  }, [slides.length]);

  // Auto-play contínuo a cada 6 segundos respeitando prefers-reduced-motion (pausa no hover)
  useEffect(() => {
    if (isHovered || slides.length <= 1 || isReducedMotionPreferred()) return;
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length, next]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  // 1. SKELETON STATE: Enquanto a API estiver sincronizando
  if (isLoadingHighlights && slides.length === 0) {
    return (
      <section
        aria-label="Carregando colaborador em destaque"
        className="bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 animate-pulse min-h-[200px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-44 h-32 bg-stone-200 dark:bg-stone-800 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 w-full">
            <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
            <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-full" />
            <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-2/3" />
          </div>
        </div>
      </section>
    );
  }

  // 2. ERROR STATE: Falha na API ou lista vazia após carregar
  if (errorHighlights || slides.length === 0) {
    return (
      <section
        id="card-3-section"
        aria-label="Colaboradores em Destaque"
        className="bg-white dark:bg-[#1f191a] border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 min-h-[200px] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span>⭐</span>
            <span>Colaborador Destaque</span>
          </span>
          {isEditor && (
            <button
              type="button"
              onClick={() => openPublishModal('card_3')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-400 hover:bg-[#7c172e]/10 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>Gerenciar</span>
            </button>
          )}
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
            <AlertCircle size={20} className="stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
              {errorHighlights ? 'Não foi possível carregar os colaboradores em destaque' : 'Nenhum colaborador em destaque cadastrado'}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs">
              {errorHighlights || 'Os colaboradores homenageados aparecerão aqui assim que sincronizados.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => retrySyncAll()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer touch-manipulation"
          >
            <RefreshCw size={12} />
            <span>Tentar novamente</span>
          </button>
        </div>
      </section>
    );
  }

  const activeSlide = slides[currentIdx % slides.length];
  const image = activeSlide.imageUrl;

  return (
    <section
      id="card-3-section"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Colaboradores em Destaque"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7c172e]/40"
    >
      <div>
        {/* Header: Category Badge and Navigation Arrows */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span>⭐</span>
              <span>{activeSlide.badge || 'Destaque em Vendas'}</span>
            </span>

            {isEditor && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20 flex items-center gap-1">
                <User size={11} />
                Modo Gestão
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Month Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
                aria-label="Filtrar colaborador por mês"
                aria-expanded={isMonthDropdownOpen}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-2xs hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
              >
                <Calendar size={12} className="text-stone-400" />
                <span className="max-w-[90px] sm:max-w-none truncate">{selectedMonth.includes('Setembro') ? 'Este mês' : selectedMonth}</span>
                <ChevronDown size={12} className={`text-stone-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#251e20] border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
                  {MONTH_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(m);
                        setCurrentIdx(0);
                        setIsMonthDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        selectedMonth === m
                          ? 'bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 font-bold'
                          : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/50'
                      }`}
                    >
                      <span>{m === 'Setembro/2026' ? 'Setembro (Este mês)' : m}</span>
                      {selectedMonth === m && <span className="text-[10px] text-[#7c172e] dark:text-rose-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prev / Next Round Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prev}
                aria-label="Colaborador anterior"
                className="w-7 h-7 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer touch-manipulation shadow-2xs focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Próximo colaborador"
                className="w-7 h-7 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer touch-manipulation shadow-2xs focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {isEditor && (
              <button
                type="button"
                onClick={() => openPublishModal('card_3')}
                title="Gerenciar todos os slides de Funcionário Destaque"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-400 hover:bg-[#7c172e]/10 px-2 py-1 rounded-md transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
              >
                <Plus size={12} />
                <span>Gerenciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Content: Photo + Details */}
        <div className="flex flex-col sm:flex-row items-center gap-4" aria-live="polite" aria-atomic="true">
          <div className="w-full sm:w-36 h-28 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200 dark:bg-stone-800 shadow-xs relative">
            <img
              src={image}
              alt={activeSlide.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          <div className="flex-1 space-y-1.5 text-left w-full">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {activeSlide.name}
                </h4>
                <p className="text-[11px] text-[#7c172e] dark:text-rose-400 font-semibold">
                  {activeSlide.role}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
              {activeSlide.content}
            </p>

            {/* Bottom Meta Row: Homenagem Ambozini | Mês | Parabéns */}
            <div className="pt-2 flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-1 text-[11px] font-medium">
                <Trophy size={13} className="text-amber-500" />
                <span>{activeSlide.award || 'Homenagem Ambozini'}</span>
              </div>

              <span className="text-stone-300 dark:text-stone-700">|</span>

              <div className="flex items-center gap-1 text-[11px] font-medium">
                <Calendar size={13} className="text-stone-400" />
                <span>{activeSlide.date || 'Setembro/2026'}</span>
              </div>

              <span className="text-stone-300 dark:text-stone-700">|</span>

              <button
                type="button"
                onClick={() => toggleEmployeeHighlightLike(activeSlide.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                  activeSlide.userLiked
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/40'
                }`}
              >
                <Heart size={12} className={activeSlide.userLiked ? 'fill-white' : 'fill-rose-600 text-rose-600'} />
                <span><span className="tabular-nums">{activeSlide.likesCount}</span> parabéns</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-3 mt-3" role="tablist" aria-label="Navegação dos colaboradores em destaque">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            type="button"
            role="tab"
            aria-selected={idx === (currentIdx % slides.length)}
            aria-current={idx === (currentIdx % slides.length) ? 'true' : 'false'}
            aria-label={`Ir para o slide ${idx + 1}: ${s.name}`}
            onClick={() => setCurrentIdx(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              idx === (currentIdx % slides.length)
                ? 'w-5 h-1.5 bg-[#7c172e] dark:bg-rose-500'
                : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
            }`}
            title={`Slide ${idx + 1}: ${s.name}`}
          />
        ))}
      </div>
    </section>
  );
};
