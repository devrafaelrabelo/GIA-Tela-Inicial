import React, { useState, useEffect, useCallback } from 'react';
import { Layers, ChevronLeft, ChevronRight, Plus, Users, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { isReducedMotionPreferred } from '../../utils/date';

export const MissionsCarousel: React.FC = () => {
  const { openPublishModal, authStatus, currentUser } = useAuth();
  const { activeCompanyValues, isLoadingValues, errorValues, retrySyncAll } = usePortal();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = Array.isArray(activeCompanyValues) ? activeCompanyValues : [];

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prevIdx) => (prevIdx - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrentSlide((prevIdx) => (prevIdx + 1) % slides.length);
  }, [slides.length]);

  // Rotação automática respeitando prefers-reduced-motion e pausa no hover
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

  const safeIndex = slides.length > 0 ? ((currentSlide % slides.length) + slides.length) % slides.length : 0;
  const activeValue = slides[safeIndex];

  // 1. SKELETON STATE: Enquanto a API estiver sincronizando
  if (isLoadingValues && !activeValue) {
    return (
      <section
        id="card-4-section"
        aria-label="Carregando valores da empresa"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-6 shadow-xs animate-pulse"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-stone-200 dark:bg-stone-800 rounded-sm" />
            <div className="h-2.5 w-48 bg-stone-200 dark:bg-stone-800 rounded-sm" />
          </div>
        </div>
        <div className="h-56 rounded-2xl bg-stone-100 dark:bg-stone-900/50" />
      </section>
    );
  }

  // 2. ERROR STATE: Falha na API ou ausência de dados após carregar
  if (errorValues || !activeValue) {
    return (
      <section
        id="card-4-section"
        aria-label="Erro ao carregar valores da empresa"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                VALORES DA EMPRESA
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Pilares e princípios que orientam cada decisão da Ambozini
              </p>
            </div>
          </div>
          {isEditor && (
            <button
              type="button"
              onClick={() => openPublishModal('card_4')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-400 hover:bg-[#7c172e]/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Publicar</span>
            </button>
          )}
        </div>

        <div className="min-h-[220px] rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
            <AlertCircle size={22} className="stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {errorValues ? 'Não foi possível carregar os valores da empresa' : 'Nenhum slide de valores ativo no momento'}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              {errorValues || 'Cadastre ou ative os valores e pilares institucionais pelo painel de gestão.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => retrySyncAll()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer touch-manipulation"
          >
            <RefreshCw size={13} />
            <span>Tentar novamente</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="card-4-section"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Valores e Pilares da Empresa"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7c172e]/40"
    >
      {/* Header with Card Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                VALORES DA EMPRESA
              </h3>
              {isEditor && (
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Modo Gestão
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Pilares e princípios que orientam cada decisão da Ambozini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Circular Navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label="Slide anterior"
              className="w-7 h-7 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer touch-manipulation shadow-2xs focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo slide"
              className="w-7 h-7 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer touch-manipulation shadow-2xs focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {isEditor && (
            <button
              type="button"
              onClick={() => openPublishModal('card_4')}
              title="Publicar novo valor ou missão no Card 4"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-400 hover:bg-[#7c172e]/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
            >
              <Plus size={13} />
              <span>Publicar</span>
            </button>
          )}
        </div>
      </div>

      {/* Panoramic Slide */}
      <div aria-live="polite" aria-atomic="true">
        {activeValue.mode === 'banner' ? (
          <div className="relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[240px] w-full bg-stone-950 shadow-md flex items-center justify-center transition-all duration-300">
            <img
              src={activeValue.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80'}
              alt={activeValue.title || 'Slide de Valor'}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        ) : (
          <div
            className="relative rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-md bg-cover bg-center min-h-[220px] sm:min-h-[240px] w-full transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(15, 12, 13, 0.95) 0%, rgba(20, 15, 17, 0.82) 48%, rgba(20, 15, 17, 0.35) 100%), url('${activeValue.image}')`,
            }}
          >
            <div className="flex-1 space-y-2.5 text-center md:text-left z-10 max-w-2xl">
              {/* Badge: 03 PILAR DE CULTURA */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 shadow-2xs">
                <span className="font-black text-xs">{activeValue.number || '03'}</span>
                <span className="font-extrabold text-[10px] uppercase tracking-wider">
                  PILAR DE CULTURA
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-sm flex items-center justify-center md:justify-start gap-2.5">
                <Users size={22} className="text-rose-300 shrink-0" />
                <span>{activeValue.title}</span>
              </h4>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed drop-shadow-xs max-w-xl">
                {activeValue.description}
              </p>

              {activeValue.quote && (
                <p className="text-xs sm:text-sm text-amber-300 italic font-semibold drop-shadow-xs">
                  “{activeValue.quote}”
                </p>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openPublishModal('card_4')}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] shadow-md transition-all cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
                >
                  <span>Conheça nossos valores</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Right Signature matching screenshot */}
            <div className="shrink-0 text-center md:text-right hidden lg:block z-10 select-none">
              <span className="font-handwriting text-3xl sm:text-4xl text-white drop-shadow-md leading-tight block">
                Pessoas
                <br />
                que fazem
                <br />
                a diferença.
              </span>
              <div className="w-16 h-0.5 bg-[#bd1e3c] mt-1 ml-auto"></div>
            </div>
          </div>
        )}
      </div>

      {/* Centered Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4" role="tablist" aria-label="Navegação dos slides">
        {slides.map((val, idx) => (
          <button
            key={val.id || `slide-${idx}`}
            type="button"
            role="tab"
            aria-selected={idx === safeIndex}
            aria-current={idx === safeIndex ? 'true' : 'false'}
            aria-label={`Ir para o slide ${idx + 1}: ${val.title || 'Valor'}`}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              idx === safeIndex
                ? 'w-6 h-1.5 bg-[#7c172e] dark:bg-rose-500'
                : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
            }`}
            title={`Slide ${idx + 1}: ${val.title || 'Valor'}`}
          />
        ))}
      </div>
    </section>
  );
};
