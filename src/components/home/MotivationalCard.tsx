import React, { useState } from 'react';
import { Plus, Heart, Sparkles, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';

export const MotivationalCard: React.FC = () => {
  const { openPublishModal, authStatus, currentUser } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const {
    motivationalThoughts,
    dynamicCards,
    isLoadingThoughts,
    retryLoadMotivationalThoughts,
    toggleMotivationalThoughtLike,
    toggleDynamicCardLike
  } = usePortal();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLoadMotivationalThoughts();
    } finally {
      setIsRetrying(false);
    }
  };

  // Normaliza pensamentos do banco de dados (PostgreSQL Lite)
  // Se ainda não houver pensamentos na tabela, usa dynamicCards['card_1'] como fallback se existir
  const customCard = dynamicCards['card_1'];

  const slides = React.useMemo(() => {
    if (motivationalThoughts && motivationalThoughts.length > 0) {
      return motivationalThoughts.filter((t) => t.isActive !== false).map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        imageUrl: t.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        tagline: t.tagline || `${t.authorName || 'Liderança Ambozini'} • ${t.authorRole || 'Pensamento do Dia'}`,
        likesCount: t.likesCount || 0,
        userLiked: !!t.userLiked
      }));
    }

    if (customCard && customCard.title) {
      return [
        {
          id: 'card_1',
          title: customCard.title,
          content: customCard.content || '',
          imageUrl: customCard.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
          tagline: `${customCard.authorName || 'Liderança Ambozini'} • ${customCard.authorRole || 'Pensamento do Dia'}`,
          likesCount: customCard.likesCount || 0,
          userLiked: !!customCard.userLiked
        }
      ];
    }

    return [];
  }, [motivationalThoughts, customCard]);

  // 1. Estado de Carregamento Ativo (Skeleton)
  if (slides.length === 0) {
    if (isLoadingThoughts) {
      return (
        <section
          id="card-1-section"
          aria-label="Carregando Pensamento do Dia"
          className="scroll-mt-24 relative rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col justify-between min-h-[260px] h-full bg-stone-900 border border-stone-200/70 dark:border-stone-800 animate-pulse text-white"
        >
          <div className="flex items-center justify-between">
            <div className="w-36 h-6 bg-stone-800 rounded-full" />
            <div className="w-16 h-6 bg-stone-800 rounded-lg" />
          </div>
          <div className="my-4 space-y-2">
            <div className="w-3/4 h-6 bg-stone-800 rounded" />
            <div className="w-full h-4 bg-stone-800 rounded" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="w-32 h-4 bg-stone-800 rounded" />
            <div className="w-16 h-5 bg-stone-800 rounded-full" />
          </div>
        </section>
      );
    }

    // 2. Se a API falhou ou não retornou dados, exibe erro com botão de recarregar em vez de ficar carregando infinitamente
    return (
      <section
        id="card-1-section"
        aria-label="Erro ao carregar Pensamento do Dia"
        className="scroll-mt-24 relative rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col justify-between min-h-[260px] h-full text-white bg-stone-900 border border-red-500/40"
      >
        <div className="z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/60 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-xs">
              <span>💡</span>
              <span>Pensamento do Dia</span>
            </span>
          </div>

          {isEditor && (
            <button
              type="button"
              onClick={() => openPublishModal('card_1')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Plus size={12} />
              <span>Publicar</span>
            </button>
          )}
        </div>

        <div className="z-10 my-auto py-4 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <p className="text-sm font-bold text-stone-200">
            Não foi possível carregar o pensamento do dia
          </p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Não foi possível carregar o pensamento do dia no momento.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRetrying ? 'animate-spin text-amber-400' : 'text-stone-300'} />
              <span>{isRetrying ? 'Reconectando...' : 'Tentar novamente'}</span>
            </button>
          </div>
        </div>

        <div className="z-10 pt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-white/10 mt-auto">
          <span>Ambozini • Pensamento do Dia</span>
        </div>
      </section>
    );
  }

  // 3. Renderização normal com pensamentos carregados
  const totalSlides = slides.length;
  const current = slides[currentSlideIndex % totalSlides];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleLike = () => {
    if (current.id === 'card_1') {
      toggleDynamicCardLike('card_1');
    } else {
      toggleMotivationalThoughtLike(current.id);
    }
  };

  return (
    <section
      id="card-1-section"
      aria-label="Pensamento do Dia"
      className="scroll-mt-24 relative rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col justify-between min-h-[260px] h-full text-white bg-cover bg-center border border-stone-200/70 dark:border-stone-800 group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(15, 12, 13, 0.95) 0%, rgba(20, 15, 17, 0.65) 55%, rgba(20, 15, 17, 0.4) 100%), url('${current.imageUrl}')`,
      }}
    >
      {/* Top Header: Badge & Controls */}
      <div className="z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/40 text-amber-300 border border-amber-400/40 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
            <span>💡</span>
            <span>Pensamento do Dia</span>
          </span>

          {isEditor && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Sparkles size={11} className="text-amber-400" />
              Modo Gestão
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isEditor && (
            <button
              onClick={() => openPublishModal('card_1')}
              title="Publicar novo pensamento do dia"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1 rounded-lg transition-all backdrop-blur-xs shadow-xs touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden"
            >
              <Plus size={12} />
              <span>Publicar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLike}
            title="Curtir este pensamento"
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all touch-manipulation cursor-pointer border ${
              current.userLiked
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-black/40 hover:bg-black/60 border-white/20 text-stone-200'
            }`}
          >
            <Heart size={12} className={current.userLiked ? 'fill-white' : ''} />
            <span className="tabular-nums text-[10px]">{current.likesCount}</span>
          </button>
        </div>
      </div>

      {/* Main Quote Content */}
      <div className="z-10 my-4 space-y-2">
        <h4 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-md">
          {current.title}
        </h4>

        {current.content && (
          <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed drop-shadow-xs italic font-light">
            “{current.content}”
          </p>
        )}

        <div className="w-12 h-0.5 bg-[#bd1e3c] mt-2"></div>
      </div>

      {/* Card Footer: Left Tagline & Right Carousel Control */}
      <div className="z-10 pt-3 flex items-center justify-between text-[11px] text-stone-300 border-t border-white/10 mt-auto">
        <span className="truncate max-w-[240px] sm:max-w-[300px] text-[10px] font-medium text-stone-300/90">
          {current.tagline}
        </span>

        {/* Carousel Pill < 1 / N > */}
        {totalSlides > 1 && (
          <div className="flex items-center gap-1 bg-black/40 border border-white/15 backdrop-blur-xs rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/90">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide anterior"
              className="p-0.5 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-1 tabular-nums">
              {(currentSlideIndex % totalSlides) + 1} / {totalSlides}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Próximo slide"
              className="p-0.5 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
